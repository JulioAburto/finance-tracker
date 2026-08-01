import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {inArray, max} from 'drizzle-orm';
import {db, databaseClient} from '../../src/lib/db';
import {categories} from '../../src/lib/db/schema';

const CHANGE_CONFIRMATION = 'ADD_DEFAULT_CATEGORIES';
const categoryValues = [
  {name: 'Pulpería', monthlyBudgetUsd: '0.00', isEssential: true},
  {name: 'Regalo', monthlyBudgetUsd: '0.00', isEssential: false},
  {
    name: 'Pago de préstamos (deudas)',
    monthlyBudgetUsd: '0.00',
    isEssential: true,
  },
] as const;

async function calculateSha256(filePath: string): Promise<string> {
  const hash = createHash('sha256');

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });

  return hash.digest('hex');
}

async function verifyBackup(): Promise<void> {
  if (process.env.DATABASE_CHANGE_CONFIRMED !== CHANGE_CONFIRMATION) {
    throw new Error('Production database change was not explicitly confirmed');
  }

  const backupFile = process.env.DATABASE_BACKUP_FILE;
  const expectedSha256 = process.env.DATABASE_BACKUP_SHA256;

  if (!backupFile || !expectedSha256) {
    throw new Error(
      'A verified database backup is required before this change',
    );
  }

  const backupStats = await stat(backupFile);
  if (!backupStats.isFile() || backupStats.size === 0) {
    throw new Error('The database backup is empty or invalid');
  }

  const actualSha256 = await calculateSha256(backupFile);
  if (actualSha256 !== expectedSha256.toLowerCase()) {
    throw new Error('The database backup hash does not match');
  }
}

async function addDefaultCategories() {
  await verifyBackup();

  return db.transaction(async transaction => {
    const [sortOrderRow] = await transaction
      .select({maxSortOrder: max(categories.sortOrder)})
      .from(categories);
    const firstSortOrder = Number(sortOrderRow?.maxSortOrder ?? -1) + 1;

    await transaction
      .insert(categories)
      .values(
        categoryValues.map((category, index) => ({
          ...category,
          sortOrder: firstSortOrder + index,
        })),
      )
      .onConflictDoNothing({target: categories.name});

    const storedCategories = await transaction
      .select({
        name: categories.name,
        monthlyBudgetUsd: categories.monthlyBudgetUsd,
        isEssential: categories.isEssential,
        isActive: categories.isActive,
      })
      .from(categories)
      .where(
        inArray(
          categories.name,
          categoryValues.map(category => category.name),
        ),
      );

    const storedNames = new Set(
      storedCategories.map(category => category.name),
    );
    const missingNames = categoryValues
      .map(category => category.name)
      .filter(name => !storedNames.has(name));

    if (missingNames.length > 0) {
      throw new Error('One or more categories were not stored');
    }

    return storedCategories;
  });
}

void addDefaultCategories()
  .then(storedCategories => {
    console.log('Database change completed and verified.');
    for (const category of storedCategories) {
      console.log(
        `- ${category.name}: budget ${category.monthlyBudgetUsd} USD, ${category.isEssential ? 'essential' : 'non-essential'}, ${category.isActive ? 'active' : 'inactive'}`,
      );
    }
  })
  .catch(() => {
    console.error(
      'Database change failed. No raw database details were printed. Review the backup and connection configuration.',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await databaseClient.end();
  });
