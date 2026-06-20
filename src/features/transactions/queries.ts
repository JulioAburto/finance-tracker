import { and, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appSettings,
  categories,
  paymentMethods,
  transactions,
} from "@/lib/db/schema";
import { getMonthRange } from "@/lib/date/month";

export type TransactionFilters = {
  month: string;
  categoryId?: string;
  paymentMethodId?: string;
};

// Las consultas viven fuera de los componentes para que las páginas solo
// coordinen datos y presentación. Drizzle genera SQL parametrizado.
export async function getTransactionFormOptions() {
  const [categoryRows, paymentMethodRows, settingsRows] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder, categories.name),
    db
      .select({
        id: paymentMethods.id,
        name: paymentMethods.name,
        type: paymentMethods.type,
      })
      .from(paymentMethods)
      .where(eq(paymentMethods.isActive, true))
      .orderBy(paymentMethods.name),
    db
      .select({
        defaultCurrency: appSettings.defaultCurrency,
        defaultExchangeRate: appSettings.defaultExchangeRate,
      })
      .from(appSettings)
      .limit(1),
  ]);

  return {
    categories: categoryRows,
    paymentMethods: paymentMethodRows,
    settings: settingsRows[0] ?? {
      defaultCurrency: "USD" as const,
      defaultExchangeRate: "36.6243",
    },
  };
}

export async function getTransactions(filters: TransactionFilters) {
  const { startDate, endDate } = getMonthRange(filters.month);
  const conditions: SQL[] = [
    gte(transactions.date, startDate),
    lt(transactions.date, endDate),
  ];

  if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  if (filters.paymentMethodId) {
    conditions.push(
      eq(transactions.paymentMethodId, filters.paymentMethodId),
    );
  }

  return db
    .select({
      id: transactions.id,
      name: transactions.name,
      amount: transactions.amount,
      currency: transactions.currency,
      amountUsd: transactions.amountUsd,
      amountNio: transactions.amountNio,
      date: transactions.date,
      type: transactions.type,
      categoryName: categories.name,
      paymentMethodName: paymentMethods.name,
      note: transactions.note,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(
      paymentMethods,
      eq(transactions.paymentMethodId, paymentMethods.id),
    )
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
}

export async function getTransactionById(id: string) {
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);

  return rows[0] ?? null;
}
