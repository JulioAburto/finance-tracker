import type {
  TransactionField,
  TransactionInput,
  TransactionType,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TRANSACTION_TYPES = new Set<TransactionType>([
  "income",
  "expense",
  "transfer",
]);

type RawTransactionInput = Record<TransactionField, string>;

export type TransactionValidationResult =
  | { success: true; data: TransactionInput }
  | {
      success: false;
      fieldErrors: Partial<Record<TransactionField, string>>;
    };

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function optionalUuid(value: string): string | null {
  return value.trim() || null;
}

export function readTransactionFormData(
  formData: FormData,
): RawTransactionInput {
  return {
    name: String(formData.get("name") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    exchangeRate: String(formData.get("exchangeRate") ?? ""),
    date: String(formData.get("date") ?? ""),
    type: String(formData.get("type") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    paymentMethodId: String(formData.get("paymentMethodId") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
}

// Esta función no conoce React ni la base de datos. Al ser pura, la misma
// validación se puede probar con Jest y reutilizar en crear/editar.
export function validateTransactionInput(
  raw: RawTransactionInput,
): TransactionValidationResult {
  const fieldErrors: Partial<Record<TransactionField, string>> = {};
  const name = raw.name.trim();
  const amount = Number(raw.amount);
  const exchangeRate = Number(raw.exchangeRate);
  const categoryId = optionalUuid(raw.categoryId);
  const paymentMethodId = optionalUuid(raw.paymentMethodId);
  const note = raw.note.trim() || null;

  if (!name) fieldErrors.name = "El nombre es obligatorio.";
  else if (name.length > 180)
    fieldErrors.name = "El nombre no puede superar 180 caracteres.";

  if (!Number.isFinite(amount) || amount <= 0)
    fieldErrors.amount = "El monto debe ser mayor que cero.";

  if (raw.currency !== "USD" && raw.currency !== "NIO")
    fieldErrors.currency = "Selecciona USD o NIO.";

  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0)
    fieldErrors.exchangeRate = "El tipo de cambio debe ser mayor que cero.";

  if (!isValidDate(raw.date))
    fieldErrors.date = "Selecciona una fecha válida.";

  if (!TRANSACTION_TYPES.has(raw.type as TransactionType))
    fieldErrors.type = "Selecciona un tipo válido.";

  if (categoryId && !isUuid(categoryId))
    fieldErrors.categoryId = "La categoría no es válida.";

  if (paymentMethodId && !isUuid(paymentMethodId))
    fieldErrors.paymentMethodId = "El método de pago no es válido.";

  if (raw.type === "expense") {
    if (!categoryId) fieldErrors.categoryId = "La categoría es obligatoria.";
    if (!paymentMethodId)
      fieldErrors.paymentMethodId = "El método de pago es obligatorio.";
  }

  if (note && note.length > 1000)
    fieldErrors.note = "La nota no puede superar 1000 caracteres.";

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      name,
      amount,
      currency: raw.currency as "USD" | "NIO",
      exchangeRate,
      date: raw.date,
      type: raw.type as TransactionType,
      categoryId,
      paymentMethodId,
      note,
    },
  };
}
