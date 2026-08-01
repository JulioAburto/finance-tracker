import {asc, eq} from 'drizzle-orm';
import {requireCurrentUser} from '@/lib/auth/dal';
import {db} from '@/lib/db';
import {
  appSettings,
  categories,
  merchantRules,
  monthlyBudgetCategories,
  monthlyBudgets,
  paymentMethods,
} from '@/lib/db/schema';
import {withDatabaseDiagnostics} from '@/lib/observability/database-diagnostics';

export async function getCategoryManagementData(month: string) {
  await requireCurrentUser();

  return withDatabaseDiagnostics('management.categories.load', async () => {
    const budgetDate = `${month}-01`;
    const [categoryRows, budgetAllocationRows] = await Promise.all([
      db
        .select()
        .from(categories)
        .orderBy(categories.sortOrder, categories.name),
      db
        .select({
          id: monthlyBudgets.id,
          month: monthlyBudgets.month,
          salaryUsd: monthlyBudgets.salaryUsd,
          expectedSavingsUsd: monthlyBudgets.expectedSavingsUsd,
          categoryId: monthlyBudgetCategories.categoryId,
          amountUsd: monthlyBudgetCategories.amountUsd,
        })
        .from(monthlyBudgets)
        .leftJoin(
          monthlyBudgetCategories,
          eq(monthlyBudgetCategories.monthlyBudgetId, monthlyBudgets.id),
        )
        .where(eq(monthlyBudgets.month, budgetDate)),
    ]);
    const budgetRow = budgetAllocationRows[0] ?? null;
    const budget = budgetRow
      ? {
          id: budgetRow.id,
          month: budgetRow.month,
          salaryUsd: budgetRow.salaryUsd,
          expectedSavingsUsd: budgetRow.expectedSavingsUsd,
        }
      : null;
    const allocationByCategory = new Map(
      budgetAllocationRows.flatMap(allocation =>
        allocation.categoryId && allocation.amountUsd !== null
          ? [[allocation.categoryId, allocation.amountUsd] as const]
          : [],
      ),
    );

    return {
      budget,
      categories: categoryRows.map(category => ({
        ...category,
        selectedMonthBudgetUsd:
          allocationByCategory.get(category.id) ?? category.monthlyBudgetUsd,
      })),
    };
  });
}

export async function getRulesManagementData() {
  await requireCurrentUser();

  return withDatabaseDiagnostics('management.rules.load', async () => {
    const [rules, categoryRows] = await Promise.all([
      db
        .select({
          id: merchantRules.id,
          pattern: merchantRules.pattern,
          priority: merchantRules.priority,
          isActive: merchantRules.isActive,
          categoryId: merchantRules.categoryId,
          categoryName: categories.name,
        })
        .from(merchantRules)
        .innerJoin(categories, eq(merchantRules.categoryId, categories.id))
        .orderBy(asc(merchantRules.priority), asc(merchantRules.pattern)),
      db
        .select({id: categories.id, name: categories.name})
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(categories.sortOrder, categories.name),
    ]);

    return {rules, categories: categoryRows};
  });
}

export async function getSettingsData() {
  await requireCurrentUser();

  return withDatabaseDiagnostics('management.settings.load', async () => {
    const [settingsRows, methodRows] = await Promise.all([
      db.select().from(appSettings).limit(1),
      db.select().from(paymentMethods).orderBy(paymentMethods.name),
    ]);

    return {
      settings: settingsRows[0] ?? null,
      paymentMethods: methodRows,
    };
  });
}
