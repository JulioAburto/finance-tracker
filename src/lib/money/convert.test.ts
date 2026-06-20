import { convertMoney, roundMoney } from "./convert";

describe("money conversion", () => {
  it("convierte USD a USD y NIO usando el tipo histórico", () => {
    expect(
      convertMoney({ amount: 10, currency: "USD", exchangeRate: 36.6243 }),
    ).toEqual({ amountUsd: 10, amountNio: 366.24 });
  });

  it("convierte NIO a USD y conserva el monto original en NIO", () => {
    expect(
      convertMoney({ amount: 850, currency: "NIO", exchangeRate: 36.6243 }),
    ).toEqual({ amountUsd: 23.21, amountNio: 850 });
  });

  it("redondea valores monetarios a dos decimales", () => {
    expect(roundMoney(10.125)).toBe(10.13);
  });

  it.each([
    { amount: 0, exchangeRate: 36.6243 },
    { amount: 10, exchangeRate: 0 },
  ])("rechaza montos o tasas no positivas", ({ amount, exchangeRate }) => {
    expect(() =>
      convertMoney({ amount, currency: "USD", exchangeRate }),
    ).toThrow();
  });
});
