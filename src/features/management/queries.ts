import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appSettings,
  categories,
  merchantRules,
  monthlyBudgetCategories,
  monthlyBudgets,
  paymentMethods,
} from "@/lib/db/schema";

export async function getCategoryManagementData(month: string) {
  const budgetDate = `${month}-01`;
  const [categoryRows, budgetRows] = await Promise.all([
    db.select().from(categories).orderBy(categories.sortOrder, categories.name),
    db
      .select()
      .from(monthlyBudgets)
      .where(eq(monthlyBudgets.month, budgetDate))
      .limit(1),
  ]);
  const budget = budgetRows[0] ?? null;
  const allocations = budget
    ? await db
        .select()
        .from(monthlyBudgetCategories)
        .where(eq(monthlyBudgetCategories.monthlyBudgetId, budget.id))
    : [];
  const allocationByCategory = new Map(
    allocations.map((allocation) => [
      allocation.categoryId,
      allocation.amountUsd,
    ]),
  );

  return {
    budget,
    categories: categoryRows.map((category) => ({
      ...category,
      selectedMonthBudgetUsd:
        allocationByCategory.get(category.id) ?? category.monthlyBudgetUsd,
    })),
  };
}

export async function getRulesManagementData() {
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
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder, categories.name),
  ]);

  return { rules, categories: categoryRows };
}

export async function getSettingsData() {
  const [settingsRows, methodRows] = await Promise.all([
    db.select().from(appSettings).limit(1),
    db.select().from(paymentMethods).orderBy(paymentMethods.name),
  ]);

  return {
    settings: settingsRows[0] ?? null,
    paymentMethods: methodRows,
  };
}
