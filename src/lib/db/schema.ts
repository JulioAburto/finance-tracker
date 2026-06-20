import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Los enums se crean como tipos nativos de PostgreSQL. Esto impide guardar
// valores fuera del dominio incluso si una petición evita la validación UI.
export const currencyEnum = pgEnum("currency", ["USD", "NIO"]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
  "transfer",
]);
export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "cash",
  "debit",
  "credit_card",
  "bank_transfer",
  "prepaid",
  "agency",
  "other",
]);
export const alertLevelEnum = pgEnum("alert_level", [
  "info",
  "warning",
  "danger",
  "exceeded",
]);

const timestampColumns = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Configuración global de la aplicación. El seed mantiene una sola fila.
export const appSettings = pgTable(
  "app_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    defaultCurrency: currencyEnum("default_currency").notNull().default("USD"),
    defaultExchangeRate: numeric("default_exchange_rate", {
      precision: 12,
      scale: 4,
    })
      .notNull()
      .default("36.6243"),
    creditCardModeEnabled: boolean("credit_card_mode_enabled")
      .notNull()
      .default(false),
    ...timestampColumns(),
  },
  (table) => [
    check(
      "app_settings_default_exchange_rate_positive",
      sql`${table.defaultExchangeRate} > 0`,
    ),
  ],
);

// Una categoría describe en qué se gastó; no debe representar el método de pago.
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    monthlyBudgetUsd: numeric("monthly_budget_usd", {
      precision: 12,
      scale: 2,
    }).notNull(),
    isEssential: boolean("is_essential").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    warningThreshold: integer("warning_threshold").notNull().default(70),
    dangerThreshold: integer("danger_threshold").notNull().default(80),
    exceededThreshold: integer("exceeded_threshold").notNull().default(100),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [
    index("categories_is_active_idx").on(table.isActive),
    check(
      "categories_monthly_budget_non_negative",
      sql`${table.monthlyBudgetUsd} >= 0`,
    ),
    check(
      "categories_warning_threshold_positive",
      sql`${table.warningThreshold} > 0`,
    ),
    check(
      "categories_danger_threshold_after_warning",
      sql`${table.dangerThreshold} > ${table.warningThreshold}`,
    ),
    check(
      "categories_exceeded_threshold_at_or_after_danger",
      sql`${table.exceededThreshold} >= ${table.dangerThreshold}`,
    ),
  ],
);

// Un método de pago describe cómo salió el dinero.
export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    type: paymentMethodTypeEnum("type").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    creditLimitUsd: numeric("credit_limit_usd", {
      precision: 12,
      scale: 2,
    }),
    statementCutDay: integer("statement_cut_day"),
    paymentDueDay: integer("payment_due_day"),
    ...timestampColumns(),
  },
  (table) => [
    index("payment_methods_type_idx").on(table.type),
    index("payment_methods_is_active_idx").on(table.isActive),
    check(
      "payment_methods_credit_limit_non_negative",
      sql`${table.creditLimitUsd} is null or ${table.creditLimitUsd} >= 0`,
    ),
    check(
      "payment_methods_statement_cut_day_valid",
      sql`${table.statementCutDay} is null or ${table.statementCutDay} between 1 and 31`,
    ),
    check(
      "payment_methods_payment_due_day_valid",
      sql`${table.paymentDueDay} is null or ${table.paymentDueDay} between 1 and 31`,
    ),
  ],
);

// Cabecera del presupuesto de un mes. `month` siempre representa su primer día.
export const monthlyBudgets = pgTable(
  "monthly_budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    month: date("month").notNull().unique(),
    salaryUsd: numeric("salary_usd", {
      precision: 12,
      scale: 2,
    }).notNull(),
    expectedSavingsUsd: numeric("expected_savings_usd", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),
    ...timestampColumns(),
  },
  (table) => [
    check("monthly_budgets_salary_positive", sql`${table.salaryUsd} > 0`),
    check(
      "monthly_budgets_expected_savings_non_negative",
      sql`${table.expectedSavingsUsd} >= 0`,
    ),
  ],
);

// Distribuye el presupuesto mensual entre categorías sin modificar meses previos.
export const monthlyBudgetCategories = pgTable(
  "monthly_budget_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    monthlyBudgetId: uuid("monthly_budget_id")
      .notNull()
      .references(() => monthlyBudgets.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    amountUsd: numeric("amount_usd", {
      precision: 12,
      scale: 2,
    }).notNull(),
    ...timestampColumns(),
  },
  (table) => [
    unique("monthly_budget_categories_budget_category_unique").on(
      table.monthlyBudgetId,
      table.categoryId,
    ),
    index("monthly_budget_categories_budget_idx").on(table.monthlyBudgetId),
    index("monthly_budget_categories_category_idx").on(table.categoryId),
    check(
      "monthly_budget_categories_amount_non_negative",
      sql`${table.amountUsd} >= 0`,
    ),
  ],
);

// Guarda los montos original, USD y NIO para conservar el tipo de cambio histórico.
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 180 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: currencyEnum("currency").notNull(),
    exchangeRate: numeric("exchange_rate", {
      precision: 12,
      scale: 4,
    }).notNull(),
    amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }).notNull(),
    amountNio: numeric("amount_nio", { precision: 12, scale: 2 }).notNull(),
    date: date("date").notNull(),
    type: transactionTypeEnum("type").notNull().default("expense"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    paymentMethodId: uuid("payment_method_id").references(
      () => paymentMethods.id,
      { onDelete: "set null" },
    ),
    note: text("note"),
    rawInput: text("raw_input"),
    classificationConfidence: numeric("classification_confidence", {
      precision: 5,
      scale: 4,
    }),
    classificationReason: text("classification_reason"),
    ...timestampColumns(),
  },
  (table) => [
    index("transactions_date_idx").on(table.date),
    index("transactions_type_idx").on(table.type),
    index("transactions_category_idx").on(table.categoryId),
    index("transactions_payment_method_idx").on(table.paymentMethodId),
    index("transactions_currency_idx").on(table.currency),
    check("transactions_amount_positive", sql`${table.amount} > 0`),
    check(
      "transactions_exchange_rate_positive",
      sql`${table.exchangeRate} > 0`,
    ),
    check(
      "transactions_amount_usd_non_negative",
      sql`${table.amountUsd} >= 0`,
    ),
    check(
      "transactions_amount_nio_non_negative",
      sql`${table.amountNio} >= 0`,
    ),
    check(
      "transactions_classification_confidence_valid",
      sql`${table.classificationConfidence} is null or ${table.classificationConfidence} between 0 and 1`,
    ),
  ],
);

// Estas reglas determinísticas se evaluarán antes de cualquier integración de IA.
export const merchantRules = pgTable(
  "merchant_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pattern: varchar("pattern", { length: 240 }).notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    priority: integer("priority").notNull().default(100),
    isActive: boolean("is_active").notNull().default(true),
    ...timestampColumns(),
  },
  (table) => [
    index("merchant_rules_category_idx").on(table.categoryId),
    index("merchant_rules_is_active_idx").on(table.isActive),
    index("merchant_rules_priority_idx").on(table.priority),
  ],
);

// Los avisos pueden persistirse, aunque el dashboard inicial los calcula al vuelo.
export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    level: alertLevelEnum("level").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    message: text("message").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    transactionId: uuid("transaction_id").references(() => transactions.id, {
      onDelete: "cascade",
    }),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("alerts_level_idx").on(table.level),
    index("alerts_category_idx").on(table.categoryId),
    index("alerts_transaction_idx").on(table.transactionId),
    index("alerts_is_read_idx").on(table.isRead),
  ],
);
