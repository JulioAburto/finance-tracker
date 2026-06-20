---
name: finance-tracker-transaction-flow
description: Use when implementing or reviewing the Finance Tracker transaction flow, including create/edit/delete transactions, transaction forms, server actions, validation, money conversion, category/payment method handling, merchant rule classification, and transaction list behavior.
---

# Finance Tracker Transaction Flow Skill

## Purpose

Use this skill when working on the transaction flow.

This includes:

- `/transactions`
- `/transactions/new`
- Transaction form.
- Transaction list.
- Create transaction action.
- Edit transaction action.
- Delete transaction action.
- Transaction validation.
- Money conversion.
- Merchant rule matching.
- Category selection.
- Payment method selection.
- Uncategorized transaction handling.

Do not use this skill for database schema changes unless the transaction task requires a small schema adjustment.

## Required Context

Before editing transaction-related files, read:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
docs/PROJECT_CONTEXT.md
```

Then inspect:

```txt
src/lib/db/schema.ts
src/lib/money/convert.ts
src/lib/budget/status.ts
src/features/transactions/
src/app/transactions/
src/app/transactions/new/
package.json
```

Check git status before editing.

## User Goal

The transaction flow must make it easy for Julio to register expenses daily.

The app should help answer:

```txt
What did I spend?
How much did I spend?
Which category does it belong to?
How did I pay?
How does it affect my monthly budget?
```

## MVP Transaction Scope

MVP transaction features:

```txt
Create expense
List transactions
Edit transaction
Delete transaction with confirmation
Validate required fields
Convert USD/NIO
Store exchange rate per transaction
Support category
Support payment method
Support transaction type
Support optional note
Support uncategorized transactions when classification is unavailable
```

Do not implement:

```txt
OCR
bank import
CSV import
Google Sheets sync
AI-first entry
recurring transactions
full account reconciliation
advanced credit card statement logic
```

unless explicitly requested.

## Required Transaction Fields

Required for expense creation:

```txt
name
amount
currency
date
type
categoryId
paymentMethodId
exchangeRate
```

Optional:

```txt
note
rawInput
classificationConfidence
classificationReason
```

Validation rules:

```txt
name is required
amount > 0
currency is USD or NIO
date is required
type is income, expense, or transfer
exchangeRate > 0
categoryId is required for expense
paymentMethodId is required for expense
```

## Money Conversion Rules

Use the money utility.

Do not duplicate conversion logic inside forms, actions, or JSX.

Expected behavior:

```txt
If currency is USD:
amountUsd = amount
amountNio = amount * exchangeRate

If currency is NIO:
amountUsd = amount / exchangeRate
amountNio = amount
```

Round to 2 decimals.

Do not recalculate historical transactions using new exchange rates.

## Category vs Payment Method

Category answers:

```txt
What was the money spent on?
```

Payment method answers:

```txt
How was the money paid?
```

Correct:

```txt
Name: La Colonia
Category: Supermercado
Payment method: Débito
```

Incorrect:

```txt
Category: Débito
```

Do not confuse these in forms, labels, or validation.

## Transaction Type Rules

Allowed types:

```txt
income
expense
transfer
```

Default type:

```txt
expense
```

Credit card purchase:

```txt
type: expense
payment method: Tarjeta de crédito
```

Credit card payment:

```txt
type: transfer
not a new expense
```

Savings allocation:

```txt
type: transfer
not normal spending
```

## Server Action Rules

Prefer Server Actions for mutations in App Router.

Mutation files may live in:

```txt
src/features/transactions/actions.ts
```

Rules:

1. Validate input server-side.
2. Never trust client-only validation.
3. Convert money on the server before saving.
4. Use Drizzle for database writes.
5. Return clear success/error result.
6. Do not expose raw database errors to the UI.
7. Revalidate affected routes if needed.
8. Keep action small and testable.

Do not put database mutations directly inside Client Components.

## Form UX Rules

The transaction form should be fast.

Defaults:

```txt
date = today
type = expense
currency = app default
exchangeRate = app default
```

UX requirements:

```txt
Amount field must be prominent
Category and payment method must be easy to select
Note is optional and visually secondary
Save button must be obvious
Validation messages must be clear
Mobile layout must be usable
```

Spanish UI labels preferred:

```txt
Agregar gasto
Nombre
Monto
Moneda
Categoría
Método de pago
Fecha
Nota
Guardar gasto
```

## Merchant Rule Classification

Rules should run before AI.

Rule matching can be used to suggest a category when the user enters a name.

Classification order:

```txt
1. User-selected category
2. Merchant rule
3. AI suggestion
4. Uncategorized
```

If implementing rule matching:

1. Load active merchant rules.
2. Match against transaction name/raw input.
3. Respect priority.
4. Handle invalid regex safely if regex is supported.
5. Do not execute arbitrary code.

If a rule suggests a category, user should still be able to override it.

## Transaction List Rules

Transaction list should be scannable.

Show:

```txt
date
name
category
payment method
original amount
converted amount if useful
type
uncategorized status if applicable
```

Filtering priority:

```txt
month
category
payment method
type
```

Do not implement advanced search before core CRUD works.

## Delete Rules

Deleting a transaction should require confirmation.

Do not hard-delete without user confirmation.

MVP can use actual delete.

Audit history is not required.

## Edit Rules

Editing a transaction should recalculate:

```txt
amountUsd
amountNio
```

when any of these change:

```txt
amount
currency
exchangeRate
```

Do not change historical exchange rate unless user explicitly edits it.

## Error Handling

Good error message:

```txt
No se pudo guardar la transacción. Revisá los campos requeridos e intentá de nuevo.
```

Bad error message:

```txt
Database error.
```

Do not show raw SQL or secrets in UI errors.

## File Organization

Preferred files:

```txt
src/app/transactions/page.tsx
src/app/transactions/new/page.tsx
src/features/transactions/actions.ts
src/features/transactions/queries.ts
src/features/transactions/schemas.ts
src/features/transactions/types.ts
src/features/transactions/components/transaction-form.tsx
src/features/transactions/components/submit-button.tsx
src/features/transactions/components/delete-transaction-button.tsx
```

Do not create all files if not needed yet.

Keep diffs small.

## Testing Priorities

When tests exist or are requested, prioritize:

```txt
transaction validation
money conversion
create transaction action
edit transaction recalculation
merchant rule matching
credit card payment not counted as expense
```

Business logic should be testable without React.

## Validation Commands

Run when relevant:

```powershell
pnpm lint
pnpm build
```

If tests exist:

```powershell
pnpm test
```

Do not run migrations unless needed and approved.

## Final Report

After transaction flow work, report:

```txt
Files changed
Features implemented
Validation behavior
Commands run
Validation results
Risks
Follow-up items
```

## Common Mistakes to Avoid

Do not:

```txt
Put money conversion directly in JSX
Trust client validation only
Treat payment method as category
Treat credit card payment as new expense
Make AI required for expense creation
Block manual entry if classification fails
Create a giant Client Component
Fetch database directly from Client Components
Add a new form library without approval
Add global state without need
```
