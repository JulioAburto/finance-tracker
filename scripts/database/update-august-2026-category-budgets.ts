import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {and, asc, eq, inArray} from 'drizzle-orm';
import {db, databaseClient} from '../../src/lib/db';
import {
  categories,
  monthlyBudgetCategories,
  monthlyBudgets,
} from '../../src/lib/db/schema';

const CHANGE_CONFIRMATION = 'UPDATE_AUGUST_2026_CATEGORY_BUDGETS';
const MONTH = '2026-08-01';
const MONTHLY_BUDGET = {
  salaryUsd: '1300.00',
  expectedSavingsUsd: '600.00',
} as const;

const categoryBudgets = [
  {
    name: 'Ahorro',
    defaultBudgetUsd: '600.00',
    augustBudgetUsd: '600.00',
    isEssential: true,
  },
  {
    name: 'Servicios',
    defaultBudgetUsd: '60.00',
    augustBudgetUsd: '60.00',
    isEssential: true,
  },
  {
    name: 'Productividad',
    defaultBudgetUsd: '25.00',
    augustBudgetUsd: '25.00',
    isEssential: true,
  },
  {
    name: 'Entretenimiento',
    defaultBudgetUsd: '31.00',
    augustBudgetUsd: '25.00',
    isEssential: false,
  },
  {
    name: 'Supermercado',
    defaultBudgetUsd: '140.00',
    augustBudgetUsd: '140.00',
    isEssential: true,
  },
  {
    name: 'Delivery',
    defaultBudgetUsd: '35.00',
    augustBudgetUsd: '25.00',
    isEssential: false,
  },
  {
    name: 'Novia / salidas / regalos',
    defaultBudgetUsd: '100.00',
    augustBudgetUsd: '100.00',
    isEssential: false,
  },
  {
    name: 'Amazon / agencias',
    defaultBudgetUsd: '50.00',
    augustBudgetUsd: '20.00',
    isEssential: false,
  },
  {
    name: 'Ropa',
    defaultBudgetUsd: '20.00',
    augustBudgetUsd: '0.00',
    isEssential: false,
  },
  {
    name: 'Salud',
    defaultBudgetUsd: '55.00',
    augustBudgetUsd: '55.00',
    isEssential: true,
  },
  {
    name: 'Transporte',
    defaultBudgetUsd: '35.00',
    augustBudgetUsd: '35.00',
    isEssential: true,
  },
  {
    name: 'Efectivo operativo',
    defaultBudgetUsd: '0.00',
    augustBudgetUsd: '0.00',
    isEssential: false,
  },
  {
    name: 'Varios',
    defaultBudgetUsd: '14.00',
    augustBudgetUsd: '5.00',
    isEssential: false,
  },
  {
    name: 'Pulpería',
    defaultBudgetUsd: '25.00',
    augustBudgetUsd: '25.00',
    isEssential: true,
  },
  {
    name: 'Regalo',
    defaultBudgetUsd: '25.00',
    augustBudgetUsd: '100.00',
    isEssential: false,
  },
  {
    name: 'Pago de préstamos (deudas)',
    defaultBudgetUsd: '25.00',
    augustBudgetUsd: '25.00',
    isEssential: true,
  },
  {
    name: 'Apolo',
    defaultBudgetUsd: '60.00',
    augustBudgetUsd: '60.00',
    isEssential: true,
  },
] as const;

function toCents(value: string): number {
  const [whole, cents = ''] = value.split('.');
  return Number(whole) * 100 + Number(cents.padEnd(2, '0').slice(0, 2));
}

function sumCents(values: string[]): number {
  return values.reduce((total, value) => total + toCents(value), 0);
}

function formatUsdFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

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

function verifyInputTotals(): void {
  const defaultTotal = formatUsdFromCents(
    sumCents(categoryBudgets.map(category => category.defaultBudgetUsd)),
  );
  const augustTotal = formatUsdFromCents(
    sumCents(categoryBudgets.map(category => category.augustBudgetUsd)),
  );

  if (defaultTotal !== MONTHLY_BUDGET.salaryUsd) {
    throw new Error('Default category budgets do not total 1300.00 USD');
  }

  if (augustTotal !== MONTHLY_BUDGET.salaryUsd) {
    throw new Error('August category budgets do not total 1300.00 USD');
  }
}

async function updateAugustCategoryBudgets() {
  await verifyBackup();
  verifyInputTotals();

  return db.transaction(async transaction => {
    const categoryNames = categoryBudgets.map(category => category.name);
    const storedCategories = await transaction
      .select({id: categories.id, name: categories.name})
      .from(categories)
      .where(inArray(categories.name, categoryNames));

    const categoryIdByName = new Map(
      storedCategories.map(category => [category.name, category.id]),
    );
    const missingCategoryNames = categoryNames.filter(
      name => !categoryIdByName.has(name),
    );

    if (missingCategoryNames.length > 0) {
      throw new Error('One or more target categories are missing');
    }

    const [monthlyBudget] = await transaction
      .insert(monthlyBudgets)
      .values({
        month: MONTH,
        salaryUsd: MONTHLY_BUDGET.salaryUsd,
        expectedSavingsUsd: MONTHLY_BUDGET.expectedSavingsUsd,
      })
      .onConflictDoUpdate({
        target: monthlyBudgets.month,
        set: {
          salaryUsd: MONTHLY_BUDGET.salaryUsd,
          expectedSavingsUsd: MONTHLY_BUDGET.expectedSavingsUsd,
          updatedAt: new Date(),
        },
      })
      .returning({id: monthlyBudgets.id});

    for (const category of categoryBudgets) {
      const categoryId = categoryIdByName.get(category.name);

      if (!categoryId) {
        throw new Error('One or more target categories are missing');
      }

      await transaction
        .update(categories)
        .set({
          monthlyBudgetUsd: category.defaultBudgetUsd,
          isEssential: category.isEssential,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, categoryId));

      await transaction
        .insert(monthlyBudgetCategories)
        .values({
          monthlyBudgetId: monthlyBudget.id,
          categoryId,
          amountUsd: category.augustBudgetUsd,
        })
        .onConflictDoUpdate({
          target: [
            monthlyBudgetCategories.monthlyBudgetId,
            monthlyBudgetCategories.categoryId,
          ],
          set: {
            amountUsd: category.augustBudgetUsd,
            updatedAt: new Date(),
          },
        });
    }

    const verificationRows = await transaction
      .select({
        name: categories.name,
        defaultBudgetUsd: categories.monthlyBudgetUsd,
        isEssential: categories.isEssential,
        augustBudgetUsd: monthlyBudgetCategories.amountUsd,
      })
      .from(categories)
      .innerJoin(
        monthlyBudgetCategories,
        eq(monthlyBudgetCategories.categoryId, categories.id),
      )
      .innerJoin(
        monthlyBudgets,
        eq(monthlyBudgets.id, monthlyBudgetCategories.monthlyBudgetId),
      )
      .where(
        and(
          inArray(categories.name, categoryNames),
          eq(monthlyBudgets.month, MONTH),
        ),
      )
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    const verificationByName = new Map(
      verificationRows.map(category => [category.name, category]),
    );

    for (const expected of categoryBudgets) {
      const actual = verificationByName.get(expected.name);

      if (
        !actual ||
        actual.defaultBudgetUsd !== expected.defaultBudgetUsd ||
        actual.augustBudgetUsd !== expected.augustBudgetUsd ||
        actual.isEssential !== expected.isEssential
      ) {
        throw new Error('One or more category budget values were not stored');
      }
    }

    const defaultTotal = formatUsdFromCents(
      sumCents(verificationRows.map(category => category.defaultBudgetUsd)),
    );
    const augustTotal = formatUsdFromCents(
      sumCents(verificationRows.map(category => category.augustBudgetUsd)),
    );

    if (
      verificationRows.length !== categoryBudgets.length ||
      defaultTotal !== MONTHLY_BUDGET.salaryUsd ||
      augustTotal !== MONTHLY_BUDGET.salaryUsd
    ) {
      throw new Error('Final category budget verification failed');
    }

    return {
      categoryCount: verificationRows.length,
      defaultTotal,
      augustTotal,
      salaryUsd: MONTHLY_BUDGET.salaryUsd,
      expectedSavingsUsd: MONTHLY_BUDGET.expectedSavingsUsd,
    };
  });
}

void updateAugustCategoryBudgets()
  .then(result => {
    console.log('Database change completed and verified.');
    console.log(`- Categories updated: ${result.categoryCount}`);
    console.log(`- Default category total: ${result.defaultTotal} USD`);
    console.log(`- August 2026 category total: ${result.augustTotal} USD`);
    console.log(`- August salary: ${result.salaryUsd} USD`);
    console.log(`- August expected savings: ${result.expectedSavingsUsd} USD`);
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
