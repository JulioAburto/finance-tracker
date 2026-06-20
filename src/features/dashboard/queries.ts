import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  monthlyBudgetCategories,
  monthlyBudgets,
  transactions,
} from "@/lib/db/schema";
import { getMonthRange } from "@/lib/date/month";
import { calculateDashboardSummary } from "./calculations";

export async function getDashboardData(month: string) {
  const { startDate, endDate, budgetDate } = getMonthRange(month);

  // Primero buscamos la cabecera porque sus categorías dependen de ese UUID.
  const budgetRows = await db
    .select({
      id: monthlyBudgets.id,
      salaryUsd: monthlyBudgets.salaryUsd,
      expectedSavingsUsd: monthlyBudgets.expectedSavingsUsd,
    })
    .from(monthlyBudgets)
    .where(eq(monthlyBudgets.month, budgetDate))
    .limit(1);
  const budget = budgetRows[0] ?? null;

  const [categoryBudgetRows, transactionRows] = await Promise.all([
    budget
      ? db
          .select({
            categoryId: categories.id,
            categoryName: categories.name,
            amountUsd: monthlyBudgetCategories.amountUsd,
            warningThreshold: categories.warningThreshold,
            dangerThreshold: categories.dangerThreshold,
            exceededThreshold: categories.exceededThreshold,
          })
          .from(monthlyBudgetCategories)
          .innerJoin(
            categories,
            eq(monthlyBudgetCategories.categoryId, categories.id),
          )
          .where(eq(monthlyBudgetCategories.monthlyBudgetId, budget.id))
          .orderBy(categories.sortOrder)
      : Promise.resolve([]),
    db
      .select({
        id: transactions.id,
        name: transactions.name,
        date: transactions.date,
        type: transactions.type,
        amountUsd: transactions.amountUsd,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          gte(transactions.date, startDate),
          lt(transactions.date, endDate),
        ),
      )
      .orderBy(desc(transactions.date), desc(transactions.createdAt)),
  ]);

  const transactionData = transactionRows.map((transaction) => ({
    ...transaction,
    amountUsd: Number(transaction.amountUsd),
  }));
  const summary = calculateDashboardSummary({
    budget: budget
      ? {
          salaryUsd: Number(budget.salaryUsd),
          expectedSavingsUsd: Number(budget.expectedSavingsUsd),
        }
      : null,
    budgetCategories: categoryBudgetRows.map((category) => ({
      ...category,
      amountUsd: Number(category.amountUsd),
    })),
    transactions: transactionData,
    dayOfMonth: new Date().getDate(),
  });

  return {
    summary,
    latestTransactions: transactionData.slice(0, 5),
    uncategorizedTransactions: transactionData.filter(
      (transaction) =>
        transaction.type === "expense" && transaction.categoryId === null,
    ),
    hasBudget: budget !== null,
  };
}
