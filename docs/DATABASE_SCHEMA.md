# Finance Tracker Database Schema

## Purpose

This document defines the initial database schema for the Finance Tracker MVP v1.

The database must support:

* Expense tracking.
* Editable categories.
* Editable payment methods.
* Monthly budgets by category.
* Budget alerts.
* Merchant classification rules.
* App settings.
* Currency conversion.
* Optional future AI classification.

## Database Choice

Use:

```txt
Database: Supabase Postgres
ORM: Drizzle ORM
Driver: postgres
Migration tool: drizzle-kit
```

## Schema Principles

1. Use UUID primary keys.
2. Keep monetary values explicit.
3. Store the exchange rate used at transaction time.
4. Store both USD and NIO amounts.
5. Do not recalculate historical transactions using new exchange rates.
6. Avoid storing bank credentials.
7. Use database constraints for critical invariants.
8. Keep schema single-user for MVP v1.
9. Add `user_id` later only if multi-user support is approved.
10. Use soft deactivation for categories and payment methods.

## Important Domain Rules

### Category vs Payment Method

A category describes what the money was spent on.

A payment method describes how it was paid.

Examples:

```txt
Category: Supermercado
Payment method: Tarjeta de crédito
```

Do not use payment methods as categories.

### Credit Card

A credit card purchase is an expense.

A credit card payment is a transfer/payment, not a new expense.

This avoids double-counting expenses.

### Savings

Savings should not be counted as normal spending.

For MVP v1, savings may be represented using a category named `Ahorro`, but the transaction type should make it clear that it is a transfer or savings allocation.

## Enums

### `currency`

Allowed values:

```txt
USD
NIO
```

### `transaction_type`

Allowed values:

```txt
income
expense
transfer
```

### `payment_method_type`

Allowed values:

```txt
cash
debit
credit_card
bank_transfer
prepaid
agency
other
```

### `alert_level`

Allowed values:

```txt
info
warning
danger
exceeded
```

## Tables

## `app_settings`

Stores app-level configuration.

For MVP v1, this table should contain one row.

Fields:

```txt
id uuid primary key
default_currency currency not null default USD
default_exchange_rate numeric(12,4) not null default 36.6243
credit_card_mode_enabled boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Notes:

* `default_exchange_rate` means USD to NIO.
* Do not hardcode exchange rate in business logic.
* Use this value as the default for new transactions.
* Each transaction must store its own exchange rate.

## `categories`

Stores editable spending categories.

Fields:

```txt
id uuid primary key
name varchar(120) not null unique
monthly_budget_usd numeric(12,2) not null
is_essential boolean not null default false
is_active boolean not null default true
warning_threshold integer not null default 70
danger_threshold integer not null default 80
exceeded_threshold integer not null default 100
sort_order integer not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints:

```txt
monthly_budget_usd >= 0
warning_threshold > 0
danger_threshold > warning_threshold
exceeded_threshold >= danger_threshold
```

Indexes:

```txt
unique index on name
index on is_active
```

Initial records:

```txt
Ahorro - 450.00 - essential
Servicios - 60.00 - essential
Productividad - 25.00 - essential
Entretenimiento - 45.00
Supermercado - 165.00 - essential
Delivery - 70.00
Novia / salidas / regalos - 110.00
Amazon / agencias - 70.00
Ropa - 45.00
Salud - 55.00 - essential
Transporte - 35.00
Efectivo operativo - 100.00
Varios - 70.00
```

## `payment_methods`

Stores editable payment methods.

Fields:

```txt
id uuid primary key
name varchar(120) not null unique
type payment_method_type not null
is_active boolean not null default true
credit_limit_usd numeric(12,2) null
statement_cut_day integer null
payment_due_day integer null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints:

```txt
credit_limit_usd is null or credit_limit_usd >= 0
statement_cut_day is null or between 1 and 31
payment_due_day is null or between 1 and 31
```

Indexes:

```txt
unique index on name
index on type
index on is_active
```

Initial records:

```txt
Efectivo - cash
Débito - debit
Tarjeta de crédito - credit_card
Transferencia - bank_transfer
Prepago - prepaid
Agencia - agency
Otro - other
```

## `monthly_budgets`

Stores a monthly budget header.

Fields:

```txt
id uuid primary key
month date not null unique
salary_usd numeric(12,2) not null
expected_savings_usd numeric(12,2) not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints:

```txt
salary_usd > 0
expected_savings_usd >= 0
```

Notes:

* `month` should be the first day of the month.
* Example: `2026-07-01`.
* This allows each month to have its own salary and expected savings.

Initial record:

```txt
month: 2026-07-01
salary_usd: 1300.00
expected_savings_usd: 450.00
```

## `monthly_budget_categories`

Stores category budget amounts for a specific month.

Fields:

```txt
id uuid primary key
monthly_budget_id uuid not null references monthly_budgets(id) on delete cascade
category_id uuid not null references categories(id) on delete restrict
amount_usd numeric(12,2) not null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints:

```txt
amount_usd >= 0
unique(monthly_budget_id, category_id)
```

Indexes:

```txt
index on monthly_budget_id
index on category_id
```

Notes:

* This table prevents hardcoding budget values inside transactions.
* Budgets can change month by month.

## `transactions`

Main table for incomes, expenses, and transfers.

Fields:

```txt
id uuid primary key
name varchar(180) not null
amount numeric(12,2) not null
currency currency not null
exchange_rate numeric(12,4) not null
amount_usd numeric(12,2) not null
amount_nio numeric(12,2) not null
date date not null
type transaction_type not null default expense
category_id uuid null references categories(id) on delete set null
payment_method_id uuid null references payment_methods(id) on delete set null
note text null
raw_input text null
classification_confidence numeric(5,4) null
classification_reason text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints:

```txt
amount > 0
exchange_rate > 0
amount_usd >= 0
amount_nio >= 0
classification_confidence is null or between 0 and 1
```

Indexes:

```txt
index on date
index on type
index on category_id
index on payment_method_id
index on currency
```

Notes:

* `amount` is the original amount entered by the user.
* `currency` is the original currency.
* `amount_usd` and `amount_nio` are calculated at creation/update time.
* `exchange_rate` must be stored per transaction.
* `category_id` is nullable to support uncategorized transactions.
* `payment_method_id` is nullable to preserve transactions if a method is deleted or deactivated.
* `raw_input` is for future natural-language entry or AI classification.
* `classification_confidence` and `classification_reason` are optional and mainly for future AI/rule explanation.

## `merchant_rules`

Stores editable classification rules.

Fields:

```txt
id uuid primary key
pattern varchar(240) not null unique
category_id uuid not null references categories(id) on delete cascade
priority integer not null default 100
is_active boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Indexes:

```txt
unique index on pattern
index on category_id
index on is_active
index on priority
```

Notes:

* Rules should be checked before AI.
* Lower priority number should run earlier.
* Pattern can be a plain string or regex-like pattern.
* Keep implementation safe. Do not execute arbitrary user code.

Initial records:

```txt
la colonia -> Supermercado
mandaditos|sisu|sorbetes|la placita|glorieta|ambros -> Delivery
openai|chatgpt -> Productividad
netflix|max|hbo|spotify|youtube|disney -> Entretenimiento
amazon|amzn|agencia -> Amazon / agencias
farmacia -> Salud
claro|tigo|internet|gas|cable -> Servicios
```

## `alerts`

Stores generated alerts.

For MVP v1, alerts may also be calculated at runtime instead of persisted.

Persist alerts only if historical alert tracking is useful.

Fields:

```txt
id uuid primary key
level alert_level not null
title varchar(180) not null
message text not null
category_id uuid null references categories(id) on delete set null
transaction_id uuid null references transactions(id) on delete cascade
is_read boolean not null default false
created_at timestamptz not null default now()
```

Indexes:

```txt
index on level
index on category_id
index on transaction_id
index on is_read
```

Notes:

* Do not overuse persisted alerts in MVP.
* Dashboard alerts can be computed from budget usage.
* Persisted alerts are useful later for history and notifications.

## Money Conversion Rules

Use this logic:

```ts
type Currency = "USD" | "NIO";

type MoneyConversionInput = {
  amount: number;
  currency: Currency;
  exchangeRate: number;
};

type MoneyConversionResult = {
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

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
```

## Budget Status Rules

Use this logic:

```ts
export type BudgetStatus = "safe" | "warning" | "danger" | "exceeded";

export function getBudgetUsagePercent({
  usedAmountUsd,
  budgetAmountUsd,
}: {
  usedAmountUsd: number;
  budgetAmountUsd: number;
}) {
  if (budgetAmountUsd <= 0) {
    return 0;
  }

  return (usedAmountUsd / budgetAmountUsd) * 100;
}

export function getBudgetStatus({
  usedAmountUsd,
  budgetAmountUsd,
  warningThreshold = 70,
  dangerThreshold = 80,
  exceededThreshold = 100,
}: {
  usedAmountUsd: number;
  budgetAmountUsd: number;
  warningThreshold?: number;
  dangerThreshold?: number;
  exceededThreshold?: number;
}) {
  const usagePercent = getBudgetUsagePercent({
    usedAmountUsd,
    budgetAmountUsd,
  });

  if (usagePercent >= exceededThreshold) return "exceeded";
  if (usagePercent >= dangerThreshold) return "danger";
  if (usagePercent >= warningThreshold) return "warning";

  return "safe";
}

export function shouldFreezeCategory({
  usedAmountUsd,
  budgetAmountUsd,
  dayOfMonth,
}: {
  usedAmountUsd: number;
  budgetAmountUsd: number;
  dayOfMonth: number;
}) {
  const usagePercent = getBudgetUsagePercent({
    usedAmountUsd,
    budgetAmountUsd,
  });

  return usagePercent >= 80 && dayOfMonth < 20;
}
```

## Drizzle Implementation Requirements

Create:

```txt
src/lib/db/schema.ts
src/lib/db/index.ts
src/lib/db/seed.ts
drizzle.config.ts
```

### `src/lib/db/index.ts`

Requirements:

* Use `drizzle-orm/postgres-js`.
* Use `postgres`.
* Import schema from `./schema`.
* Validate `DATABASE_URL`.
* Use `prepare: false` for Supabase pooler compatibility.

Expected behavior:

```txt
If DATABASE_URL is missing, throw an error immediately.
```

### `drizzle.config.ts`

Requirements:

```txt
schema: ./src/lib/db/schema.ts
out: ./drizzle
dialect: postgresql
dbCredentials.url: process.env.DATABASE_URL
verbose: true
strict: true
```

### Seed Requirements

Seed must insert:

* App settings.
* Categories.
* Payment methods.
* Monthly budget for July 2026.
* Monthly category budgets.
* Merchant rules.

Seed must avoid duplicate data if it is re-run, or document that it is a one-time seed.

## Future Schema Changes

Do not add these without approval:

* `users`.
* `accounts` with real balances.
* `bank_connections`.
* `receipt_attachments`.
* `ocr_imports`.
* `recurring_transactions`.
* `goals`.
* `audit_logs`.
* `notifications`.

## Multi-user Future Note

If multi-user support is approved later, add `user_id` to at least:

```txt
app_settings
categories
payment_methods
monthly_budgets
monthly_budget_categories
transactions
merchant_rules
alerts
```

At that point, review Supabase Row Level Security policies.

Do not retrofit multi-user support casually after real production data exists.
