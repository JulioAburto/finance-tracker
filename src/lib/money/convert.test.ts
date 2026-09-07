import {
  convertMoney,
  MAX_EXCHANGE_RATE,
  MAX_MONEY_AMOUNT,
  roundMoney,
} from './convert';

describe('money conversion', () => {
  it('convierte USD a USD y NIO usando el tipo histórico', () => {
    expect(
      convertMoney({amount: 10, currency: 'USD', exchangeRate: 36.6243}),
    ).toEqual({amountUsd: 10, amountNio: 366.24});
  });

  it('convierte NIO a USD y conserva el monto original en NIO', () => {
    expect(
      convertMoney({amount: 850, currency: 'NIO', exchangeRate: 36.6243}),
    ).toEqual({amountUsd: 23.21, amountNio: 850});
  });

  it('redondea valores monetarios a dos decimales', () => {
    expect(roundMoney(10.125)).toBe(10.13);
  });

  it.each([
    [1.005, 1.01],
    [2.675, 2.68],
    [-1.005, -1.01],
    [0.1 + 0.2, 0.3],
    [1e-7, 0],
  ])('redondea %s como %s', (value, expected) => {
    expect(roundMoney(value)).toBe(expected);
  });

  it('redondea la conversión decimal exacta y conserva el original', () => {
    expect(
      convertMoney({amount: 1, currency: 'USD', exchangeRate: 1.005}),
    ).toEqual({amountUsd: 1, amountNio: 1.01});
    expect(
      convertMoney({amount: 2.01, currency: 'NIO', exchangeRate: 2}),
    ).toEqual({amountUsd: 1.01, amountNio: 2.01});
  });

  it('admite los límites persistibles y conversiones que redondean a cero', () => {
    expect(
      convertMoney({
        amount: MAX_MONEY_AMOUNT,
        currency: 'USD',
        exchangeRate: 1,
      }),
    ).toEqual({amountUsd: MAX_MONEY_AMOUNT, amountNio: MAX_MONEY_AMOUNT});
    expect(
      convertMoney({
        amount: 0.01,
        currency: 'NIO',
        exchangeRate: MAX_EXCHANGE_RATE,
      }),
    ).toEqual({amountUsd: 0, amountNio: 0.01});
    expect(
      convertMoney({amount: 0.01, currency: 'NIO', exchangeRate: 0.0001}),
    ).toEqual({amountUsd: 100, amountNio: 0.01});
  });

  it.each([
    {amount: 1.005, exchangeRate: 1},
    {amount: 0.001, exchangeRate: 1},
    {amount: 10_000_000_000, exchangeRate: 1},
    {amount: NaN, exchangeRate: 1},
    {amount: Infinity, exchangeRate: 1},
    {amount: 1, exchangeRate: 0.00001},
    {amount: 1, exchangeRate: 36.62431},
    {amount: 1, exchangeRate: 100_000_000},
    {amount: 1, exchangeRate: NaN},
    {amount: 1, exchangeRate: Infinity},
  ])('rechaza valores no persistibles: %j', input => {
    expect(() => convertMoney({...input, currency: 'USD'})).toThrow(RangeError);
  });

  it.each([
    {amount: MAX_MONEY_AMOUNT, currency: 'USD' as const, exchangeRate: 2},
    {amount: MAX_MONEY_AMOUNT, currency: 'NIO' as const, exchangeRate: 0.0001},
  ])('rechaza un resultado convertido fuera de rango: %j', input => {
    expect(() => convertMoney(input)).toThrow(RangeError);
  });

  it.each([
    {amount: 0, exchangeRate: 36.6243},
    {amount: 10, exchangeRate: 0},
  ])('rechaza montos o tasas no positivas', ({amount, exchangeRate}) => {
    expect(() =>
      convertMoney({amount, currency: 'USD', exchangeRate}),
    ).toThrow();
  });
});
