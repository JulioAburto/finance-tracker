"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { categories, paymentMethods, transactions } from "@/lib/db/schema";
import { convertMoney } from "@/lib/money/convert";
import {
  isSavingsCategoryName,
  readTransactionFormData,
  validateTransactionInput,
} from "./schemas";
import type { TransactionFormState, TransactionInput } from "./types";

async function validateReferences(
  input: TransactionInput,
): Promise<TransactionFormState | null> {
  // La validación de IDs no termina en el navegador: comprobamos que las
  // referencias existan y estén activas antes de escribir la transacción.
  const [categoryRows, paymentRows] = await Promise.all([
    input.categoryId
      ? db
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(
            and(
              eq(categories.id, input.categoryId),
              eq(categories.isActive, true),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
    input.paymentMethodId
      ? db
          .select({ id: paymentMethods.id })
          .from(paymentMethods)
          .where(
            and(
              eq(paymentMethods.id, input.paymentMethodId),
              eq(paymentMethods.isActive, true),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
  ]);

  const categoryExists = !input.categoryId || categoryRows.length === 1;
  const paymentMethodExists =
    !input.paymentMethodId || paymentRows.length === 1;

  if (!categoryExists || !paymentMethodExists) {
    return {
      status: "error",
      message:
        "La categoría o el método de pago ya no existe o está inactivo.",
    };
  }

  const selectedCategory = categoryRows[0];
  if (
    input.type === "expense" &&
    selectedCategory &&
    isSavingsCategoryName(selectedCategory.name)
  ) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        categoryId: "Ahorro debe registrarse como transferencia.",
      },
    };
  }

  return null;
}

function toDatabaseValues(input: TransactionInput) {
  const { amountUsd, amountNio } = convertMoney({
    amount: input.amount,
    currency: input.currency,
    exchangeRate: input.exchangeRate,
  });

  return {
    name: input.name,
    amount: input.amount.toFixed(2),
    currency: input.currency,
    exchangeRate: input.exchangeRate.toFixed(4),
    amountUsd: amountUsd.toFixed(2),
    amountNio: amountNio.toFixed(2),
    date: input.date,
    type: input.type,
    categoryId: input.categoryId,
    paymentMethodId: input.paymentMethodId,
    note: input.note,
    updatedAt: new Date(),
  };
}

async function parseAndValidate(formData: FormData): Promise<
  | { success: true; data: TransactionInput }
  | { success: false; state: TransactionFormState }
> {
  const validation = validateTransactionInput(
    readTransactionFormData(formData),
  );

  if (!validation.success) {
    return {
      success: false,
      state: {
        status: "error",
        message: "Revisa los campos marcados.",
        fieldErrors: validation.fieldErrors,
      },
    };
  }

  const referenceError = await validateReferences(validation.data);
  if (referenceError) {
    return {
      success: false,
      state: referenceError,
    };
  }

  return { success: true, data: validation.data };
}

export async function createTransactionAction(
  _previousState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const result = await parseAndValidate(formData);
  if (!result.success) return result.state;

  try {
    await db.insert(transactions).values(toDatabaseValues(result.data));
  } catch {
    return {
      status: "error",
      message: "No se pudo guardar la transacción. Intenta nuevamente.",
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  redirect("/transactions");
}

export async function updateTransactionAction(
  id: string,
  _previousState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const result = await parseAndValidate(formData);
  if (!result.success) return result.state;

  try {
    const updated = await db
      .update(transactions)
      .set(toDatabaseValues(result.data))
      .where(eq(transactions.id, id))
      .returning({ id: transactions.id });

    if (updated.length === 0) {
      return { status: "error", message: "La transacción ya no existe." };
    }
  } catch {
    return {
      status: "error",
      message: "No se pudo actualizar la transacción.",
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  redirect("/transactions");
}

export async function deleteTransactionAction(id: string): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
