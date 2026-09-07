import {
  getBudgetStatus,
  getBudgetUsagePercent,
  shouldFreezeCategory,
} from './status';

describe('budget rules', () => {
  it.each([null, 0, 20, 31])(
    'no recomienda congelar con día %s',
    dayOfMonth => {
      expect(
        shouldFreezeCategory({
          usedAmountUsd: 80,
          budgetAmountUsd: 100,
          dayOfMonth,
        }),
      ).toBe(false);
    },
  );
  it('calcula el porcentaje de uso', () => {
    expect(
      getBudgetUsagePercent({usedAmountUsd: 80, budgetAmountUsd: 100}),
    ).toBe(80);
  });

  it('marca como 100% usado un presupuesto cero con gasto positivo', () => {
    expect(
      getBudgetUsagePercent({usedAmountUsd: 79.46, budgetAmountUsd: 0}),
    ).toBe(100);
  });

  it.each([
    [69, 'safe'],
    [70, 'warning'],
    [80, 'danger'],
    [100, 'exceeded'],
  ] as const)('clasifica %s%% como %s', (usedAmountUsd, expected) => {
    expect(getBudgetStatus({usedAmountUsd, budgetAmountUsd: 100})).toBe(
      expected,
    );
  });

  it('clasifica como excedido un presupuesto cero con gasto positivo', () => {
    expect(getBudgetStatus({usedAmountUsd: 79.46, budgetAmountUsd: 0})).toBe(
      'exceeded',
    );
  });

  it('recomienda congelar al alcanzar 80% antes del día 20', () => {
    expect(
      shouldFreezeCategory({
        usedAmountUsd: 80,
        budgetAmountUsd: 100,
        dayOfMonth: 19,
      }),
    ).toBe(true);
  });

  it('no congela la categoría desde el día 20', () => {
    expect(
      shouldFreezeCategory({
        usedAmountUsd: 80,
        budgetAmountUsd: 100,
        dayOfMonth: 20,
      }),
    ).toBe(false);
  });
});
