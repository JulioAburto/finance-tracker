export type Currency = "USD" | "NIO";

export type MoneyConversionInput = {
  amount: number;
  currency: Currency;
  exchangeRate: number;
};

export type MoneyConversionResult = {
  amountUsd: number;
  amountNio: number;
};

export function convertMoney({
  amount,
  currency,
  exchangeRate,
}: MoneyConversionInput): MoneyConversionResult {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  if (exchangeRate <= 0) {
    throw new Error("Exchange rate must be greater than zero");
  }

  if (currency === "USD") {
    return {
      amountUsd: roundMoney(amount),
      amountNio: roundMoney(amount * exchangeRate),
    };
  }

  return {
    amountUsd: roundMoney(amount / exchangeRate),
    amountNio: roundMoney(amount),
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
