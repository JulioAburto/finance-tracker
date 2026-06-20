export type BudgetStatus = "safe" | "warning" | "danger" | "exceeded";

type BudgetUsageInput = {
  usedAmountUsd: number;
  budgetAmountUsd: number;
};

type BudgetStatusInput = BudgetUsageInput & {
  warningThreshold?: number;
  dangerThreshold?: number;
  exceededThreshold?: number;
};

type FreezeCategoryInput = BudgetUsageInput & {
  dayOfMonth: number;
};

export function getBudgetUsagePercent({
  usedAmountUsd,
  budgetAmountUsd,
}: BudgetUsageInput): number {
  if (budgetAmountUsd <= 0) {
    return 0;
  }

  return (usedAmountUsd / budgetAmountUsd) * 100;
}

export function getBudgetStatus({
  usedAmountUsd,
  budgetAmountUsd,
  warningThreshold = 70,
  dangerThreshold = 80,
  exceededThreshold = 100,
}: BudgetStatusInput): BudgetStatus {
  const usagePercent = getBudgetUsagePercent({
    usedAmountUsd,
    budgetAmountUsd,
  });

  if (usagePercent >= exceededThreshold) return "exceeded";
  if (usagePercent >= dangerThreshold) return "danger";
  if (usagePercent >= warningThreshold) return "warning";

  return "safe";
}

export function shouldFreezeCategory({
  usedAmountUsd,
  budgetAmountUsd,
  dayOfMonth,
}: FreezeCategoryInput): boolean {
  const usagePercent = getBudgetUsagePercent({
    usedAmountUsd,
    budgetAmountUsd,
  });

  return usagePercent >= 80 && dayOfMonth < 20;
}
