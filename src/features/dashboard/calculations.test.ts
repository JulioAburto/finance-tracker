import { calculateDashboardSummary } from "./calculations";

const budgetCategories = [
  {
    categoryId: "saving",
    categoryName: "Ahorro",
    amountUsd: 450,
    warningThreshold: 70,
    dangerThreshold: 80,
    exceededThreshold: 100,
  },
  {
    categoryId: "delivery",
    categoryName: "Delivery",
    amountUsd: 100,
    warningThreshold: 70,
    dangerThreshold: 80,
    exceededThreshold: 100,
  },
];

describe("dashboard calculations", () => {
  it("excluye ahorro y transferencias del gasto mensual", () => {
    const summary = calculateDashboardSummary({
      budget: { salaryUsd: 1300, expectedSavingsUsd: 450 },
      budgetCategories,
      transactions: [
        {
          id: "expense",
          name: "Delivery",
          date: "2026-07-05",
          type: "expense",
          amountUsd: 25,
          categoryId: "delivery",
          categoryName: "Delivery",
        },
        {
          id: "transfer",
          name: "Ahorro",
          date: "2026-07-06",
          type: "transfer",
          amountUsd: 450,
          categoryId: "saving",
          categoryName: "Ahorro",
        },
      ],
      dayOfMonth: 6,
    });

    expect(summary.totalBudgetUsd).toBe(100);
    expect(summary.totalSpentUsd).toBe(25);
    expect(summary.expectedSavingsUsd).toBe(450);
    expect(summary.categoryUsage).toHaveLength(1);
  });

  it("genera alerta y recomendación de congelar antes del día 20", () => {
    const summary = calculateDashboardSummary({
      budget: { salaryUsd: 1300, expectedSavingsUsd: 450 },
      budgetCategories,
      transactions: [
        {
          id: "expense",
          name: "Delivery",
          date: "2026-07-10",
          type: "expense",
          amountUsd: 85,
          categoryId: "delivery",
          categoryName: "Delivery",
        },
      ],
      dayOfMonth: 10,
    });

    expect(summary.alerts[0]).toMatchObject({
      status: "danger",
      recommendation: "Congela gastos extra en esta categoría.",
    });
  });

  it("cuenta gastos sin categoría", () => {
    const summary = calculateDashboardSummary({
      budget: null,
      budgetCategories: [],
      transactions: [
        {
          id: "uncategorized",
          name: "Compra",
          date: "2026-07-10",
          type: "expense",
          amountUsd: 10,
          categoryId: null,
          categoryName: null,
        },
      ],
      dayOfMonth: 10,
    });

    expect(summary.uncategorizedCount).toBe(1);
    expect(summary.usagePercent).toBe(0);
  });
});
