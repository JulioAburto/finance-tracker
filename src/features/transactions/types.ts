import type { Currency } from "@/lib/money/convert";

export type TransactionType = "income" | "expense" | "transfer";

export type TransactionInput = {
  name: string;
  amount: number;
  currency: Currency;
  exchangeRate: number;
  date: string;
  type: TransactionType;
  categoryId: string | null;
  paymentMethodId: string | null;
  note: string | null;
};

export type TransactionField =
  | "name"
  | "amount"
  | "currency"
  | "exchangeRate"
  | "date"
  | "type"
  | "categoryId"
  | "paymentMethodId"
  | "note";

export type TransactionFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<TransactionField, string>>;
};

export type TransactionFormOption = {
  id: string;
  name: string;
};

export type PaymentMethodType =
  | "cash"
  | "debit"
  | "credit_card"
  | "bank_transfer"
  | "prepaid"
  | "agency"
  | "other";

export type PaymentMethodFormOption = TransactionFormOption & {
  type: PaymentMethodType;
};

export type TransactionFormValues = {
  name: string;
  amount: string;
  currency: Currency;
  exchangeRate: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  paymentMethodId: string;
  note: string;
};
