import {
  getBudgetStatus,
  getBudgetUsagePercent,
  shouldFreezeCategory,
} from "./status";

describe("budget rules", () => {
  it("calcula el porcentaje de uso", () => {
    expect(
      getBudgetUsagePercent({ usedAmountUsd: 80, budgetAmountUsd: 100 }),
    ).toBe(80);
  });

  it.each([
    [69, "safe"],
    [70, "warning"],
    [80, "danger"],
    [100, "exceeded"],
  ] as const)("clasifica %s%% como %s", (usedAmountUsd, expected) => {
    expect(getBudgetStatus({ usedAmountUsd, budgetAmountUsd: 100 })).toBe(
      expected,
    );
  });

  it("recomienda congelar al alcanzar 80% antes del día 20", () => {
    expect(
      shouldFreezeCategory({
        usedAmountUsd: 80,
        budgetAmountUsd: 100,
        dayOfMonth: 19,
      }),
    ).toBe(true);
  });

  it("no congela la categoría desde el día 20", () => {
    expect(
      shouldFreezeCategory({
        usedAmountUsd: 80,
        budgetAmountUsd: 100,
        dayOfMonth: 20,
      }),
    ).toBe(false);
  });
});
