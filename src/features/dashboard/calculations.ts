import {
  getBudgetStatus,
  getBudgetUsagePercent,
  shouldFreezeCategory,
  type BudgetStatus,
} from "@/lib/budget/status";
import { roundMoney } from "@/lib/money/convert";

export type DashboardBudget = {
  salaryUsd: number;
  expectedSavingsUsd: number;
};

export type DashboardBudgetCategory = {
  categoryId: string;
  categoryName: string;
  amountUsd: number;
  warningThreshold: number;
  dangerThreshold: number;
  exceededThreshold: number;
};

export type DashboardTransaction = {
  id: string;
  name: string;
  date: string;
  type: "income" | "expense" | "transfer";
  amountUsd: number;
  categoryId: string | null;
  categoryName: string | null;
};

export type CategoryUsage = {
  categoryId: string;
  categoryName: string;
  budgetUsd: number;
  spentUsd: number;
  remainingUsd: number;
  usagePercent: number;
  status: BudgetStatus;
  recommendation: string;
};

export type DashboardSummary = {
  salaryUsd: number;
  expectedSavingsUsd: number;
  totalBudgetUsd: number;
  totalSpentUsd: number;
  remainingBudgetUsd: number;
  usagePercent: number;
  categoryUsage: CategoryUsage[];
  alerts: CategoryUsage[];
  uncategorizedCount: number;
};

function isSavingsCategory(name: string): boolean {
  return name.trim().toLocaleLowerCase("es") === "ahorro";
}

function getRecommendation(
  status: BudgetStatus,
  shouldFreeze: boolean,
): string {
  if (shouldFreeze) return "Congela gastos extra en esta categoría.";
  if (status === "exceeded") return "Detén gastos y revisa el excedente.";
  if (status === "danger") return "Reduce gastos durante el resto del mes.";
  if (status === "warning") return "Monitorea los próximos gastos.";
  return "Dentro del presupuesto.";
}

// Esta función recibe datos simples, no objetos de Drizzle. Por eso puede
// probarse de forma determinística y no necesita conexión a Supabase.
export function calculateDashboardSummary({
  budget,
  budgetCategories,
  transactions,
  dayOfMonth,
}: {
  budget: DashboardBudget | null;
  budgetCategories: DashboardBudgetCategory[];
  transactions: DashboardTransaction[];
  dayOfMonth: number;
}): DashboardSummary {
  const expenses = transactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const spendingCategories = budgetCategories.filter(
    (category) => !isSavingsCategory(category.categoryName),
  );

  const spentByCategory = new Map<string, number>();
  for (const transaction of expenses) {
    if (!transaction.categoryId) continue;

    spentByCategory.set(
      transaction.categoryId,
      (spentByCategory.get(transaction.categoryId) ?? 0) +
        transaction.amountUsd,
    );
  }

  const categoryUsage = spendingCategories.map((category) => {
    const spentUsd = roundMoney(
      spentByCategory.get(category.categoryId) ?? 0,
    );
    const usagePercent = getBudgetUsagePercent({
      usedAmountUsd: spentUsd,
      budgetAmountUsd: category.amountUsd,
    });
    const status = getBudgetStatus({
      usedAmountUsd: spentUsd,
      budgetAmountUsd: category.amountUsd,
      warningThreshold: category.warningThreshold,
      dangerThreshold: category.dangerThreshold,
      exceededThreshold: category.exceededThreshold,
    });
    const freeze = shouldFreezeCategory({
      usedAmountUsd: spentUsd,
      budgetAmountUsd: category.amountUsd,
      dayOfMonth,
    });

    return {
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      budgetUsd: category.amountUsd,
      spentUsd,
      remainingUsd: roundMoney(category.amountUsd - spentUsd),
      usagePercent,
      status,
      recommendation: getRecommendation(status, freeze),
    };
  });

  const totalBudgetUsd = roundMoney(
    spendingCategories.reduce(
      (total, category) => total + category.amountUsd,
      0,
    ),
  );
  const totalSpentUsd = roundMoney(
    expenses.reduce(
      (total, transaction) => total + transaction.amountUsd,
      0,
    ),
  );

  return {
    salaryUsd: budget?.salaryUsd ?? 0,
    expectedSavingsUsd: budget?.expectedSavingsUsd ?? 0,
    totalBudgetUsd,
    totalSpentUsd,
    remainingBudgetUsd: roundMoney(totalBudgetUsd - totalSpentUsd),
    usagePercent: getBudgetUsagePercent({
      usedAmountUsd: totalSpentUsd,
      budgetAmountUsd: totalBudgetUsd,
    }),
    categoryUsage,
    alerts: categoryUsage.filter((category) => category.status !== "safe"),
    uncategorizedCount: expenses.filter(
      (transaction) => transaction.categoryId === null,
    ).length,
  };
}
