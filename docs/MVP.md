# Finance Tracker MVP v1

## Product Goal

Build a personal finance tracker that helps me:

* Register all expenses quickly.
* Categorize expenses.
* Compare spending against monthly category budgets.
* Visualize usage percentage per category.
* Generate alerts when spending reaches unhealthy thresholds.
* Understand whether my monthly finances are healthy enough to reach my goals.

This is not a general-purpose accounting system. The goal is personal financial control.

## Primary User

This app is for one user only: Julio Aburto.

Multi-user support is not part of MVP v1.

## Context

The app is being built as a personal project and learning project using:

* Next.js App Router.
* TypeScript.
* MUI.
* Supabase Postgres.
* Drizzle ORM.
* Vercel.

The app should be useful first, then polished later.

## MVP Objective

The MVP must answer these questions:

1. How much have I spent this month?
2. Which categories am I spending in?
3. What percentage of each category budget has been used?
4. Which categories are healthy, risky, dangerous, or exceeded?
5. Which expenses are uncategorized?
6. How much budget remains per category?
7. Which spending areas should I freeze or reduce?

## Success Criteria After 30 Days

The MVP is successful if:

* At least 90% of real expenses are registered.
* There are 0 uncategorized expenses at monthly close.
* The dashboard shows usage percentage per category.
* Alerts trigger correctly at 70%, 80%, and 100%.
* The app works even if AI is disabled.
* I can understand my spending without manually recalculating budgets.
* I can see whether I am protecting my savings goal.

## MVP Scope

### Included in MVP v1

* Manual expense registration.
* Editable categories.
* Editable payment methods.
* Monthly budgets by category.
* Currency support for USD and NIO.
* Stored exchange rate per transaction.
* Dashboard with monthly summary.
* Category usage percentage.
* Budget alerts.
* Editable merchant rules.
* Basic app settings.
* Credit card mode toggle.
* Basic transaction list.
* Edit and delete transactions.
* Server-side validation.
* Seed data for initial categories, payment methods, budgets, and rules.

### Excluded from MVP v1

Do not implement these unless explicitly requested:

* Bank integrations.
* OCR.
* AI-first expense entry.
* Multi-user support.
* Full account reconciliation.
* Complex financial forecasting.
* Native mobile app.
* Import from bank statements.
* Advanced goals simulation.
* Recurring transaction automation.
* Push/email notifications.
* Complex credit card statement calculation.
* Google Sheets sync.
* CSV import.
* Role-based access control.

## Product Principles

1. Manual reliability first.
2. Rules before AI.
3. Dashboard must be actionable.
4. Do not overbuild.
5. Keep financial logic testable.
6. Avoid storing bank credentials.
7. Avoid hiding spending inside vague categories.
8. Separate what money was spent on from how it was paid.
9. Preserve historical exchange rates.
10. Never let AI overwrite confirmed data silently.

## Core Financial Rules

### Category vs Payment Method

A category answers:

> What was the money spent on?

Examples:

* Supermercado.
* Delivery.
* Salud.
* Transporte.
* Productividad.
* Entretenimiento.
* Novia / salidas / regalos.

A payment method answers:

> How was the money paid?

Examples:

* Efectivo.
* Débito.
* Tarjeta de crédito.
* Transferencia.
* Prepago.
* Agencia.

Do not mix category and payment method.

Incorrect:

```txt
Category: Tarjeta
```

Correct:

```txt
Category: Supermercado
Payment method: Tarjeta de crédito
```

### Credit Card Rule

A credit card purchase is an expense.

A credit card payment is not a new expense. It is a transfer/payment.

Do not duplicate expenses when paying a card.

Example:

```txt
June 5:
Expense: C$1,200 La Colonia
Category: Supermercado
Payment method: Tarjeta de crédito

June 20:
Payment: US$33 credit card payment
Type: transfer/payment
Do not count as a second expense.
```

### Currency Rule

Each transaction must store:

* Original amount.
* Original currency.
* Exchange rate used at registration time.
* Amount in USD.
* Amount in NIO.

Do not recalculate historical transactions using a new exchange rate.

Example:

```txt
Original amount: 850
Currency: NIO
Exchange rate: 36.6243
Amount USD: 23.21
Amount NIO: 850.00
```

### Savings Rule

Savings should not be treated as normal spending.

For MVP v1, savings may be represented as a special category only if the transaction type is clearly handled as transfer or savings allocation.

Do not let savings distort monthly spending.

Preferred MVP v1 interpretation:

```txt
Ahorro = transfer / savings allocation
Not regular expense
```

## Initial Categories

Initial editable categories:

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

## Initial Monthly Budget

Initial salary base:

```txt
Monthly salary: USD 1,300
```

Initial category budgets:

```txt
Ahorro: USD 450
Servicios: USD 60
Productividad: USD 25
Entretenimiento: USD 45
Supermercado: USD 165
Delivery: USD 70
Novia / salidas / regalos: USD 110
Amazon / agencias: USD 70
Ropa: USD 45
Salud: USD 55
Transporte: USD 35
Efectivo operativo: USD 100
Varios: USD 70
```

The monthly budget system must allow changing these values later.

## Budget Alert Rules

Default thresholds:

```txt
0% - 69% = safe
70% - 79% = warning
80% - 99% = danger
100%+ = exceeded
```

Special rule:

```txt
If a category reaches 80% before day 20 of the month, recommend freezing extra spending in that category.
```

Example alert:

```txt
Delivery is at 83.8% before day 20.
Recommendation: freeze delivery for the rest of the week.
```

## AI Role

AI is not part of the core MVP.

AI may be added later as a fallback assistant for:

* Suggesting category.
* Explaining classification.
* Giving saving tips.
* Processing natural language input.

AI must not be the source of truth.

Classification order:

```txt
1. User-selected category.
2. Editable merchant rule.
3. AI suggestion.
4. Uncategorized.
```

Rules have priority over AI.

If AI confidence is low, the transaction should remain uncategorized or require confirmation.

AI must never overwrite user-confirmed data without explicit confirmation.

## Merchant Rules

Merchant rules classify transactions based on text patterns.

Examples:

```txt
"la colonia" -> Supermercado
"chatgpt|openai" -> Productividad
"netflix|max|spotify|youtube|disney" -> Entretenimiento
"mandaditos|sisu|sorbetes|la placita" -> Delivery
"amazon|amzn|agencia" -> Amazon / agencias
"farmacia" -> Salud
"claro|tigo|internet|gas|cable" -> Servicios
```

Merchant rules must be editable.

When a user manually corrects a transaction category, the app may later offer to create a rule from that correction. This is not required in the first implementation pass.

## MVP Screens

### `/dashboard`

Purpose:

* Show financial health for the current month.

Must show:

* Total spent this month.
* Total monthly budget.
* Budget used percentage.
* Expected monthly savings.
* Category usage table.
* Categories in warning/danger/exceeded state.
* Latest transactions.
* Uncategorized transactions.
* Basic recommendation text.

### `/transactions`

Purpose:

* List registered transactions.

Must support:

* Viewing transactions.
* Filtering by month.
* Filtering by category.
* Filtering by payment method.
* Editing transactions.
* Deleting transactions with confirmation.

### `/transactions/new`

Purpose:

* Register a new transaction quickly.

Required fields:

* Name.
* Amount.
* Currency.
* Date.
* Category.
* Payment method.
* Type.
* Optional note.

Validation:

* Amount must be greater than 0.
* Currency must be USD or NIO.
* Date is required.
* Category is required for expenses.
* Payment method is required for expenses.
* Exchange rate must be greater than 0.

### `/categories`

Purpose:

* Manage categories and budgets.

Must support:

* Viewing categories.
* Creating categories.
* Editing categories.
* Deactivating categories.
* Updating monthly budget amount.
* Setting thresholds if needed.

### `/rules`

Purpose:

* Manage merchant classification rules.

Must support:

* Viewing rules.
* Creating rules.
* Editing rules.
* Deactivating rules.
* Setting rule priority.

### `/settings`

Purpose:

* Manage app-level settings.

Must support:

* Default currency.
* Default exchange rate.
* Credit card mode enabled/disabled.
* Optional credit card settings.

## Dashboard Minimum Widgets

Required:

```txt
1. Monthly spent total
2. Monthly budget total
3. Monthly budget usage percentage
4. Expected savings
5. Category usage table
6. Alert cards
7. Latest transactions
8. Uncategorized transactions
```

Category table must show:

```txt
Category
Budget
Spent
Remaining
Usage percentage
Status
Recommendation
```

## Recommended App Structure

```txt
src/
  app/
    dashboard/
      page.tsx
    transactions/
      page.tsx
      new/
        page.tsx
    categories/
      page.tsx
    rules/
      page.tsx
    settings/
      page.tsx
    api/
      classify/
        route.ts

  components/
    layout/
    ui/

  features/
    transactions/
      actions.ts
      components/
      queries.ts
      schemas.ts
      types.ts
    categories/
    budgets/
    rules/
    dashboard/

  lib/
    db/
      index.ts
      schema.ts
      seed.ts
    money/
      convert.ts
      format.ts
    budget/
      status.ts

  server/
    ai/
      classifier.ts
```

## Implementation Priority

### Phase 1: Technical Foundation

* Install dependencies.
* Configure MUI.
* Configure Drizzle.
* Configure database connection.
* Create database schema.
* Add seed data.
* Run initial migration.
* Confirm app builds.

### Phase 2: Transactions

* Create transaction form.
* Validate transaction input.
* Convert money.
* Save transaction.
* List transactions.
* Edit transactions.
* Delete transactions.

### Phase 3: Dashboard

* Calculate monthly spending.
* Calculate category usage.
* Calculate budget status.
* Show alerts.
* Show latest transactions.
* Show uncategorized transactions.

### Phase 4: Categories and Rules

* Manage categories.
* Manage monthly budgets.
* Manage merchant rules.
* Apply rules before saving or suggesting category.

### Phase 5: Optional AI Fallback

* Create classifier interface.
* Create `/api/classify` route handler.
* Add AI only after rules work.
* Do not block expense creation if AI fails.

## Changes That Require Explicit Approval

Ask before implementing:

* Authentication.
* AI provider.
* Tailwind.
* Bank integrations.
* OCR.
* Database provider change.
* ORM change.
* Multi-user support.
* Large dashboard redesign.
* Complex credit card statement calculations.
* Background jobs.
* Paid APIs.

## Definition of Done

A task is done only if:

* The code compiles.
* TypeScript types are valid.
* Lint passes or failures are documented.
* Core business logic is tested when practical.
* New files follow the project structure.
* No secrets are committed.
* No unrelated refactors are included.
* The change is small enough to review.
