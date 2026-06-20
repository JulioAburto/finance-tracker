---
name: finance-tracker-database-workflow
description: Use when creating, reviewing, or modifying the Finance Tracker database layer, including Drizzle schema, Supabase Postgres connection, migrations, seed data, database scripts, relations, constraints, indexes, and money-related persistence rules.
---

---

# Finance Tracker Database Workflow Skill

## Purpose

Use this skill for all database-related work in the Finance Tracker project.

This includes:

- Drizzle schema.
- Supabase Postgres connection.
- Migrations.
- Seed data.
- Database scripts.
- Relations.
- Constraints.
- Indexes.
- Environment variable handling.
- Money persistence rules.
- Schema reviews.

Do not use this skill for UI-only changes unless the UI task requires a database change.

## Required Context

Before editing database files, read:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
docs/PROJECT_CONTEXT.md
```

Then inspect:

```txt
package.json
drizzle.config.ts
src/lib/db/index.ts
src/lib/db/schema.ts
src/lib/db/seed.ts
drizzle/
.env.example
```

Check git status before editing.

## Source of Truth

The main source of truth for database structure is:

```txt
docs/DATABASE_SCHEMA.md
```

If there is a conflict between existing code and docs, report the conflict before changing files.

Do not silently change the schema design.

## Current Stack

Use:

```txt
Supabase Postgres
Drizzle ORM
postgres driver
drizzle-kit
pnpm
```

Do not add:

```txt
Firebase
@supabase/supabase-js
Prisma
TypeORM
MongoDB
SQLite
```

unless explicitly requested.

## Database Design Principles

Follow these principles:

1. Use UUID primary keys.
2. Use Postgres relational modeling.
3. Use constraints for critical invariants.
4. Use indexes for common lookup fields.
5. Store monetary values explicitly.
6. Store exchange rate per transaction.
7. Store original currency and converted values.
8. Avoid recalculating historical transactions.
9. Keep MVP single-user.
10. Do not add multi-user columns unless approved.

## Required Core Tables

The MVP database should include:

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

Do not add extra tables without explaining why.

## Money Persistence Rules

Each transaction must store:

```txt
amount
currency
exchange_rate
amount_usd
amount_nio
```

Rules:

```txt
amount > 0
exchange_rate > 0
amount_usd >= 0
amount_nio >= 0
currency is USD or NIO
```

Do not store only one currency.

Do not recalculate old transactions with a new exchange rate.

Do not hardcode the exchange rate in business logic.

## Finance Domain Rules

Category means:

```txt
What was the money spent on?
```

Payment method means:

```txt
How was the money paid?
```

Correct:

```txt
Category: Supermercado
Payment method: Tarjeta de crédito
```

Incorrect:

```txt
Category: Tarjeta
```

Credit card purchase is an expense.

Credit card payment is a transfer/payment, not a second expense.

Savings should not be counted as normal spending.

## Supabase Connection Rules

Use `DATABASE_URL`.

Use `.env.local` for local secrets.

Do not commit `.env.local`.

Do not expose `DATABASE_URL` to client code.

Do not use `NEXT_PUBLIC_` for database secrets.

Use this approach in `src/lib/db/index.ts`:

```ts
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
});
```

Reason:

```txt
Supabase transaction pooler compatibility.
```

## Drizzle Config Rules

`drizzle.config.ts` should:

- Load `.env.local`.
- Validate `DATABASE_URL`.
- Use `schema: "./src/lib/db/schema.ts"`.
- Use `out: "./drizzle"`.
- Use `dialect: "postgresql"`.
- Use `strict: true`.
- Use `verbose: true`.

Prefer:

```ts
import {config} from 'dotenv';

config({path: '.env.local'});
```

over plain:

```ts
import 'dotenv/config';
```

because `.env.local` may not be loaded by default.

## Migration Workflow

When changing schema:

1. Inspect current schema.
2. Identify whether the change affects existing data.
3. Propose the schema change.
4. Ask for approval if it changes existing tables or data semantics.
5. Update `src/lib/db/schema.ts`.
6. Run `pnpm db:generate`.
7. Review generated migration.
8. Do not run `pnpm db:migrate` unless `DATABASE_URL` exists and user approves.
9. Report migration files created.

Do not use `db:push` once migrations exist unless explicitly approved.

## Seed Workflow

Seed should insert:

```txt
app settings
initial categories
payment methods
monthly budget for July 2026
monthly category budgets
merchant rules
```

Make seed idempotent if practical.

If full idempotency adds too much complexity, document clearly:

```txt
This seed is intended to run once.
```

Do not insert duplicate categories/rules silently.

Do not include secrets in seed files.

## Initial Categories

Use these initial categories unless docs change:

```txt
Ahorro
Servicios
Productividad
Entretenimiento
Supermercado
Delivery
Novia / salidas / regalos
Amazon / agencias
Ropa
Salud
Transporte
Efectivo operativo
Varios
```

## Initial Payment Methods

Use:

```txt
Efectivo
Débito
Tarjeta de crédito
Transferencia
Prepago
Agencia
Otro
```

## Initial Merchant Rules

Use:

```txt
la colonia -> Supermercado
mandaditos|sisu|sorbetes|la placita|glorieta|ambros -> Delivery
openai|chatgpt -> Productividad
netflix|max|hbo|spotify|youtube|disney -> Entretenimiento
amazon|amzn|agencia -> Amazon / agencias
farmacia -> Salud
claro|tigo|internet|gas|cable -> Servicios
```

Rules must run before AI.

## Do Not Add Without Approval

Do not add:

```txt
users
accounts with real balances
bank_connections
receipt_attachments
ocr_imports
recurring_transactions
goals
audit_logs
notifications
```

without approval.

## Validation Commands

Run when relevant:

```powershell
pnpm db:generate
pnpm build
pnpm lint
```

Only run these if `DATABASE_URL` exists and user approves:

```powershell
pnpm db:migrate
pnpm db:seed
```

If validation fails:

1. Explain exact failure.
2. Fix only related issue.
3. Do not refactor unrelated files.

## Final Report

After database work, report:

```txt
Files changed
Schema changes
Migration files generated
Seed changes
Commands run
Validation results
Risks
Follow-up items
Whether DATABASE_URL was required
```

## Common Mistakes to Avoid

Do not:

```txt
Treat payment method as category
Treat credit card payment as expense
Recalculate old transactions with a new exchange rate
Expose DATABASE_URL
Commit .env.local
Add Supabase client SDK unnecessarily
Add Firebase
Add multi-user schema too early
Change ORM without approval
Run migrations without approval
```
