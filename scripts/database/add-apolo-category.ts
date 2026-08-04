import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {eq, max} from 'drizzle-orm';
import {db, databaseClient} from '../../src/lib/db';
import {
  categories,
  merchantRules,
  monthlyBudgetCategories,
  monthlyBudgets,
} from '../../src/lib/db/schema';

const CHANGE_CONFIRMATION = 'ADD_APOLO_CATEGORY';
const APOLLO_CATEGORY = {
  name: 'Apolo',
  monthlyBudgetUsd: '0.00',
  isEssential: true,
} as const;
const APOLLO_RULE = {pattern: 'apolo', priority: 65} as const;

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
    throw new Error('A verified database backup is required before this change');
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

async function addApoloCategory() {
  await verifyBackup();

  return db.transaction(async transaction => {
    const existingCategory = await transaction
      .select({
        id: categories.id,
        name: categories.name,
        monthlyBudgetUsd: categories.monthlyBudgetUsd,
        isEssential: categories.isEssential,
        isActive: categories.isActive,
      })
      .from(categories)
      .where(eq(categories.name, APOLLO_CATEGORY.name))
      .limit(1);

    let category = existingCategory[0];

    if (!category) {
      const [sortOrderRow] = await transaction
        .select({maxSortOrder: max(categories.sortOrder)})
        .from(categories);
      const sortOrder = Number(sortOrderRow?.maxSortOrder ?? -1) + 1;

      const [createdCategory] = await transaction
        .insert(categories)
        .values({...APOLLO_CATEGORY, sortOrder})
        .returning({
          id: categories.id,
          name: categories.name,
          monthlyBudgetUsd: categories.monthlyBudgetUsd,
          isEssential: categories.isEssential,
          isActive: categories.isActive,
        });

      if (!createdCategory) {
        throw new Error('Apolo category was not created');
      }

      category = createdCategory;
    }

    const budgetRows = await transaction
      .select({id: monthlyBudgets.id})
      .from(monthlyBudgets);

    if (budgetRows.length > 0) {
      await transaction
        .insert(monthlyBudgetCategories)
        .values(
          budgetRows.map(budget => ({
            monthlyBudgetId: budget.id,
            categoryId: category.id,
            amountUsd: APOLLO_CATEGORY.monthlyBudgetUsd,
          })),
        )
        .onConflictDoNothing({
          target: [
            monthlyBudgetCategories.monthlyBudgetId,
            monthlyBudgetCategories.categoryId,
          ],
        });
    }

    await transaction
      .insert(merchantRules)
      .values({
        pattern: APOLLO_RULE.pattern,
        categoryId: category.id,
        priority: APOLLO_RULE.priority,
      })
      .onConflictDoUpdate({
        target: merchantRules.pattern,
        set: {
          categoryId: category.id,
          priority: APOLLO_RULE.priority,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    const storedAllocations = await transaction
      .select({id: monthlyBudgetCategories.id})
      .from(monthlyBudgetCategories)
      .where(eq(monthlyBudgetCategories.categoryId, category.id));

    const [storedRule] = await transaction
      .select({pattern: merchantRules.pattern})
      .from(merchantRules)
      .where(eq(merchantRules.pattern, APOLLO_RULE.pattern))
      .limit(1);

    if (!storedRule) {
      throw new Error('Apolo merchant rule was not stored');
    }

    if (storedAllocations.length < budgetRows.length) {
      throw new Error('Apolo monthly budget allocations were not stored');
    }

    return {
      category,
      monthlyBudgetCount: budgetRows.length,
      allocationCount: storedAllocations.length,
      rulePattern: storedRule.pattern,
    };
  });
}

void addApoloCategory()
  .then(result => {
    console.log('Database change completed and verified.');
    console.log(
      `- ${result.category.name}: budget ${result.category.monthlyBudgetUsd} USD, ${
        result.category.isEssential ? 'essential' : 'non-essential'
      }, ${result.category.isActive ? 'active' : 'inactive'}`,
    );
    console.log(
      `- Monthly allocations: ${result.allocationCount}/${result.monthlyBudgetCount}`,
    );
    console.log(`- Merchant rule: ${result.rulePattern}`);
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
