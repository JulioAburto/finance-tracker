export type Currency = 'USD' | 'NIO';

// Límites del contrato numeric(12,2) y numeric(12,4).
export const MAX_MONEY_AMOUNT = 9_999_999_999.99;
export const MAX_EXCHANGE_RATE = 99_999_999.9999;
const MONEY_SCALE = 100;
const RATE_SCALE = 10_000;

export function isValidMoneyAmount(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= 0 &&
    value <= MAX_MONEY_AMOUNT &&
    Number(value.toFixed(2)) === value
  );
}

export function isValidExchangeRate(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value > 0 &&
    value <= MAX_EXCHANGE_RATE &&
    Number(value.toFixed(4)) === value
  );
}

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
  if (!isValidMoneyAmount(amount) || amount <= 0) {
    throw new RangeError(
      'Amount must be positive, within range and use at most two decimals',
    );
  }

  if (!isValidExchangeRate(exchangeRate)) {
    throw new RangeError(
      'Exchange rate must be positive, within range and use at most four decimals',
    );
  }

  if (currency !== 'USD' && currency !== 'NIO') {
    throw new RangeError('Currency must be USD or NIO');
  }

  // Centavos y tasa escalada son enteros seguros individualmente. BigInt evita
  // perder precisión en su producto; el cociente redondea mitades hacia arriba.
  const cents = BigInt(Math.round(amount * MONEY_SCALE));
  const rate = BigInt(Math.round(exchangeRate * RATE_SCALE));
  const numerator =
    currency === 'USD' ? cents * rate : cents * BigInt(RATE_SCALE);
  const denominator = currency === 'USD' ? BigInt(RATE_SCALE) : rate;
  const convertedCents =
    (numerator * BigInt(2) + denominator) / (denominator * BigInt(2));

  if (convertedCents > BigInt(Math.round(MAX_MONEY_AMOUNT * MONEY_SCALE))) {
    throw new RangeError('Converted amount exceeds the supported money range');
  }

  const convertedAmount = Number(convertedCents) / MONEY_SCALE;
  return {
    amountUsd: currency === 'USD' ? amount : convertedAmount,
    amountNio: currency === 'NIO' ? amount : convertedAmount,
  };
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('Money must be finite');

  // Desplazar el exponente decimal evita que 1.005 * 100 quede en 100.4999…
  // Las mitades negativas se redondean también alejándose de cero.
  const [coefficient, exponent = '0'] = Math.abs(value).toString().split('e');
  const shifted = Number(`${coefficient}e${Number(exponent) + 2}`);
  return Math.sign(value) * (Math.round(shifted) / MONEY_SCALE);
}
