export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

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
  dayOfMonth: number | null;
};

export function getBudgetUsagePercent({
  usedAmountUsd,
  budgetAmountUsd,
}: BudgetUsageInput): number {
  if (budgetAmountUsd <= 0) {
    return usedAmountUsd > 0 ? 100 : 0;
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

  if (usagePercent >= exceededThreshold) return 'exceeded';
  if (usagePercent >= dangerThreshold) return 'danger';
  if (usagePercent >= warningThreshold) return 'warning';

  return 'safe';
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

  return (
    dayOfMonth !== null &&
    dayOfMonth >= 1 &&
    dayOfMonth < 20 &&
    usagePercent >= 80
  );
}
