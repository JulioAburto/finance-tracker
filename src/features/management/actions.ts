"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  appSettings,
  categories,
  merchantRules,
  monthlyBudgetCategories,
  monthlyBudgets,
  paymentMethods,
} from "@/lib/db/schema";
import {
  areValidThresholds,
  isUuid,
  isValidRulePattern,
  readBoolean,
  readInteger,
  readNonNegativeNumber,
  readPositiveNumber,
  readText,
} from "./schemas";

function finish(path: string, status: "saved" | "invalid") {
  const pathname = path.split("?")[0];
  const separator = path.includes("?") ? "&" : "?";
  revalidatePath(pathname);
  revalidatePath("/dashboard");
  revalidatePath("/transactions/new");
  redirect(`${path}${separator}status=${status}`);
}

export async function saveMonthlyBudgetAction(formData: FormData) {
  const month = readText(formData, "month");
  const salary = readPositiveNumber(formData, "salaryUsd");
  const savings = readNonNegativeNumber(formData, "expectedSavingsUsd");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || salary === null || savings === null) {
    finish("/categories", "invalid");
  }

  await db
    .insert(monthlyBudgets)
    .values({
      month: `${month}-01`,
      salaryUsd: salary.toFixed(2),
      expectedSavingsUsd: savings.toFixed(2),
    })
    .onConflictDoUpdate({
      target: monthlyBudgets.month,
      set: {
        salaryUsd: salary.toFixed(2),
        expectedSavingsUsd: savings.toFixed(2),
        updatedAt: new Date(),
      },
    });
  finish(`/categories?month=${month}`, "saved");
}

export async function createCategoryAction(formData: FormData) {
  const name = readText(formData, "name");
  const budget = readNonNegativeNumber(formData, "monthlyBudgetUsd");
  if (!name || name.length > 120 || budget === null) finish("/categories", "invalid");

  await db.insert(categories).values({
    name,
    monthlyBudgetUsd: budget.toFixed(2),
    isEssential: readBoolean(formData, "isEssential"),
    sortOrder: readInteger(formData, "sortOrder") ?? 0,
  });
  finish("/categories", "saved");
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const name = readText(formData, "name");
  const defaultBudget = readNonNegativeNumber(formData, "monthlyBudgetUsd");
  const selectedBudget = readNonNegativeNumber(formData, "selectedMonthBudgetUsd");
  const warning = readInteger(formData, "warningThreshold");
  const danger = readInteger(formData, "dangerThreshold");
  const exceeded = readInteger(formData, "exceededThreshold");
  const month = readText(formData, "month");
  if (
    !isUuid(id) ||
    !name ||
    name.length > 120 ||
    defaultBudget === null ||
    selectedBudget === null ||
    !areValidThresholds(warning, danger, exceeded)
  ) {
    finish(`/categories?month=${month}`, "invalid");
  }

  await db
    .update(categories)
    .set({
      name,
      monthlyBudgetUsd: defaultBudget.toFixed(2),
      isEssential: readBoolean(formData, "isEssential"),
      isActive: readBoolean(formData, "isActive"),
      warningThreshold: warning,
      dangerThreshold: danger,
      exceededThreshold: exceeded,
      sortOrder: readInteger(formData, "sortOrder") ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  const budgetRows = await db
    .select({ id: monthlyBudgets.id })
    .from(monthlyBudgets)
    .where(eq(monthlyBudgets.month, `${month}-01`))
    .limit(1);
  if (budgetRows[0]) {
    await db
      .insert(monthlyBudgetCategories)
      .values({
        monthlyBudgetId: budgetRows[0].id,
        categoryId: id,
        amountUsd: selectedBudget.toFixed(2),
      })
      .onConflictDoUpdate({
        target: [
          monthlyBudgetCategories.monthlyBudgetId,
          monthlyBudgetCategories.categoryId,
        ],
        set: { amountUsd: selectedBudget.toFixed(2), updatedAt: new Date() },
      });
  }
  finish(`/categories?month=${month}`, "saved");
}

export async function createRuleAction(formData: FormData) {
  const pattern = readText(formData, "pattern");
  const categoryId = readText(formData, "categoryId");
  const priority = readInteger(formData, "priority");
  if (!isValidRulePattern(pattern) || !isUuid(categoryId) || priority === null) {
    finish("/rules", "invalid");
  }
  await db.insert(merchantRules).values({ pattern, categoryId, priority });
  finish("/rules", "saved");
}

export async function updateRuleAction(id: string, formData: FormData) {
  const pattern = readText(formData, "pattern");
  const categoryId = readText(formData, "categoryId");
  const priority = readInteger(formData, "priority");
  if (!isUuid(id) || !isValidRulePattern(pattern) || !isUuid(categoryId) || priority === null) {
    finish("/rules", "invalid");
  }
  await db
    .update(merchantRules)
    .set({
      pattern,
      categoryId,
      priority,
      isActive: readBoolean(formData, "isActive"),
      updatedAt: new Date(),
    })
    .where(eq(merchantRules.id, id));
  finish("/rules", "saved");
}

export async function updateSettingsAction(formData: FormData) {
  const currency = readText(formData, "defaultCurrency");
  const rate = readPositiveNumber(formData, "defaultExchangeRate");
  if ((currency !== "USD" && currency !== "NIO") || rate === null) {
    finish("/settings", "invalid");
  }
  const rows = await db.select({ id: appSettings.id }).from(appSettings).limit(1);
  if (rows[0]) {
    await db
      .update(appSettings)
      .set({
        defaultCurrency: currency,
        defaultExchangeRate: rate.toFixed(4),
        creditCardModeEnabled: readBoolean(formData, "creditCardModeEnabled"),
        updatedAt: new Date(),
      })
      .where(eq(appSettings.id, rows[0].id));
  }
  finish("/settings", "saved");
}

export async function updatePaymentMethodAction(id: string, formData: FormData) {
  const creditLimit = readText(formData, "creditLimitUsd");
  const cutDay = readText(formData, "statementCutDay");
  const dueDay = readText(formData, "paymentDueDay");
  const parsedLimit = creditLimit ? readNonNegativeNumber(formData, "creditLimitUsd") : null;
  const parsedCut = cutDay ? readInteger(formData, "statementCutDay") : null;
  const parsedDue = dueDay ? readInteger(formData, "paymentDueDay") : null;
  const validDay = (value: number | null) => value === null || (value >= 1 && value <= 31);
  if (!isUuid(id) || (creditLimit && parsedLimit === null) || !validDay(parsedCut) || !validDay(parsedDue)) {
    finish("/settings", "invalid");
  }
  await db
    .update(paymentMethods)
    .set({
      isActive: readBoolean(formData, "isActive"),
      creditLimitUsd: parsedLimit?.toFixed(2) ?? null,
      statementCutDay: parsedCut,
      paymentDueDay: parsedDue,
      updatedAt: new Date(),
    })
    .where(and(eq(paymentMethods.id, id), eq(paymentMethods.type, "credit_card")));
  finish("/settings", "saved");
}
