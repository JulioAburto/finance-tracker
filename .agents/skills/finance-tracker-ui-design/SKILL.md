---
name: finance-tracker-ui-design
description: Audit, design, and implement UI/UX for the single-user Finance Tracker MVP built with Next.js App Router, TypeScript, and MUI. Use for route or component work involving /dashboard, /transactions, /transactions/new, /categories, /rules, /settings, AppShell/providers/theme, transaction forms and lists, category budgets, merchant rules, settings, financial summaries, alerts and status labels, empty/loading/error states, mobile responsiveness, accessibility, Spanish financial copy, and consistent money/date/percentage display. Apply the project rules for category versus payment method, credit-card payments as transfers, expense-only budget usage, and historical exchange rates; flag UI scope creep such as Tailwind, bank integrations, OCR, authentication, or AI-first flows.
---

---

# Finance Tracker UI Design Skill

## Purpose

Use this skill when working on UI/UX, layout, interaction design, visual hierarchy, MUI components, accessibility, or responsive behavior for the Finance Tracker project.

This skill applies to:

- `/dashboard`
- `/transactions`
- `/transactions/new`
- `/categories`
- `/rules`
- `/settings`
- Shared layout components
- Form components
- Financial cards
- Tables
- Alert states
- Empty states
- Loading states
- Error states

Do not use this skill to change database schema, business logic, authentication, AI providers, or deployment configuration unless the UI task explicitly requires a small related change.

## Required Context

Before making design or UI changes, read:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
docs/PROJECT_CONTEXT.md
```

Then inspect the existing app structure and current components.

Do not assume a design system already exists unless it is present in the repo.

## Product Design Goal

The UI must help Julio answer quickly:

```txt
How much have I spent this month?
Which categories are healthy?
Which categories are risky?
Which categories are exceeded?
What should I stop spending on?
What expenses still need categorization?
Am I protecting my savings goal?
```

The app is not a generic finance dashboard. It is a personal financial control tool.

The dashboard should be actionable, not decorative.

## Design Principles

1. Clarity over decoration.
2. Mobile-friendly from the start.
3. Fast expense entry.
4. Financial state must be obvious.
5. Alerts must be actionable.
6. Avoid visual noise.
7. Prefer simple MUI components before custom UI.
8. Use consistent spacing and typography.
9. Keep business logic out of JSX when possible.
10. Avoid over-designing before the core flow works.

## Stack and UI Constraints

Use:

```txt
Next.js App Router
TypeScript
MUI
CSS Modules only if needed
```

Do not use:

```txt
Tailwind
shadcn/ui
DaisyUI
Headless UI unless already justified
New chart libraries without approval
New icon libraries without approval
Animation libraries without approval
```

Preferred MUI components:

```txt
Box
Container
Stack
Grid
Card
CardContent
Typography
Button
TextField
Select
MenuItem
FormControl
InputLabel
Dialog
Alert
Chip
LinearProgress
Table
TableHead
TableBody
TableRow
TableCell
Skeleton
```

## Visual Tone

The app should feel:

```txt
Clean
Calm
Practical
Personal
Financially serious
Not corporate-heavy
Not flashy
Not gamified
```

Avoid overly complex visuals.

Do not make the dashboard look like a crypto trading terminal.

## Layout Rules

### App Shell

Use a simple layout:

```txt
Top navigation or side navigation
Main content container
Clear page title
Primary action visible
Consistent spacing
```

For MVP, a top nav is acceptable and simpler than a full sidebar.

Recommended top-level navigation:

```txt
Dashboard
Transactions
New Transaction
Categories
Rules
Settings
```

### Page Layout

Each page should follow this pattern:

```txt
Page title
Short helper text
Primary action
Main content
Secondary/advanced content
```

Example:

```txt
Title: Dashboard
Helper: Monthly spending overview and budget alerts.
Primary action: Add transaction
```

### Responsive Behavior

Mobile matters.

Use responsive layouts:

```txt
Mobile: single column
Tablet: two columns where useful
Desktop: cards + tables
```

Do not build desktop-only screens.

Forms must be usable on a phone.

## Dashboard Design Requirements

The dashboard must prioritize action.

Required sections:

```txt
Monthly summary cards
Budget usage overview
Category status table/list
Alert cards
Latest transactions
Uncategorized transactions
```

Recommended order:

```txt
1. Month selector/current month
2. Financial health summary
3. Critical alerts
4. Category usage
5. Latest transactions
6. Uncategorized transactions
```

### Summary Cards

Use cards for:

```txt
Total spent
Total budget
Budget used percentage
Expected savings
Categories in danger
Uncategorized expenses
```

Each card should have:

```txt
Label
Main value
Short context
Status indicator if relevant
```

Example:

```txt
Total spent
US$420.50 / US$850.00
49.4% of spendable budget used
```

### Category Usage

Each category row/card should show:

```txt
Category name
Spent amount
Budget amount
Remaining amount
Usage percentage
Status
Recommendation
Progress indicator
```

Example:

```txt
Delivery
US$58.70 / US$70.00
83.8%
Status: Danger
Recommendation: Freeze delivery this week.
```

### Alert States

Use the documented thresholds:

```txt
safe: 0% - 69%
warning: 70% - 79%
danger: 80% - 99%
exceeded: 100%+
```

Special rule:

```txt
If usage >= 80% before day 20, show freeze recommendation.
```

Alert copy should be direct and action-oriented.

Good:

```txt
Delivery is at 83% before day 20. Freeze delivery this week.
```

Bad:

```txt
Your financial behavior has changed significantly.
```

## Status Language

Use consistent status labels:

```txt
Safe
Warning
Danger
Exceeded
Uncategorized
```

Spanish UI labels are preferred for user-facing screens unless the existing app is in English.

Recommended Spanish labels:

```txt
Sano
Cuidado
Alerta
Excedido
Sin clasificar
```

Do not mix Spanish and English in user-facing UI unless the rest of the app already does.

## Color and Status Rules

Do not hardcode many custom colors across components.

Prefer MUI theme palette and semantic component props where possible:

```tsx
<Alert severity="warning" />
<Chip color="warning" />
<LinearProgress color="warning" />
```

If custom status colors are needed, centralize them.

Do not use color as the only signal. Include text labels/icons where appropriate.

Accessibility requirement:

```txt
Status must be understandable without color.
```

## Transaction Form Design

The transaction creation flow must be fast.

Required fields:

```txt
Name
Amount
Currency
Date
Category
Payment method
Type
Optional note
```

Recommended UX:

```txt
Default date to today
Default type to expense
Default currency from settings
Default exchange rate from settings
Make amount prominent
Make category and payment method easy to select
Keep optional note visually secondary
```

Validation messages should be clear.

Good:

```txt
Amount must be greater than 0.
```

Bad:

```txt
Invalid input.
```

Spanish version:

```txt
El monto debe ser mayor que 0.
```

### Form Layout

Mobile:

```txt
Single column
Primary button full width
```

Desktop:

```txt
Two-column form is acceptable
Primary button aligned clearly
```

Do not bury the save button.

## Transaction List Design

The transaction list should support scanning.

Each row/card should show:

```txt
Date
Name
Category
Payment method
Original amount
Converted amount if useful
Type
Status if uncategorized
```

Mobile may use cards instead of a dense table.

Desktop may use MUI Table.

Do not show too many fields at once if it hurts readability.

## Categories Page Design

The categories page should show:

```txt
Category name
Monthly budget
Essential flag
Active/inactive state
Thresholds if editable
Actions
```

Prefer simple editable rows or dialogs.

Do not implement advanced budget templates in MVP unless requested.

## Rules Page Design

The rules page should show:

```txt
Pattern
Target category
Priority
Active/inactive state
Actions
```

Warn if regex-like patterns are invalid only if regex validation is implemented.

Do not execute arbitrary user code.

## Settings Page Design

Settings should be simple.

Include:

```txt
Default currency
Default exchange rate
Credit card mode toggle
Optional credit card settings
```

Warn clearly:

```txt
Changing the default exchange rate does not recalculate historical transactions.
```

This warning is important because historical transaction exchange rates must be preserved.

## Empty States

Every major screen should have useful empty states.

Examples:

### No transactions

```txt
No transactions yet.
Start by registering your first expense.
[Add transaction]
```

### No alerts

```txt
No budget alerts right now.
Your categories are within their limits.
```

### No rules

```txt
No merchant rules yet.
Create rules to classify repeated expenses automatically.
```

### No uncategorized expenses

```txt
All expenses are categorized.
```

## Loading States

Use simple loading states:

```txt
Skeleton cards
Skeleton rows
Disabled submit button while saving
```

Do not add complex spinners everywhere.

## Error States

Errors should explain what failed and what the user can do.

Good:

```txt
Could not save transaction. Check the required fields and try again.
```

If the error is technical, keep technical details out of the main UI and log server-side.

Do not expose secrets or raw database errors in UI.

## Accessibility Requirements

For every UI change:

- Use semantic elements where practical.
- Buttons must have clear text.
- Inputs must have labels.
- Form errors must be connected to fields where practical.
- Status must not rely on color alone.
- Dialogs must have clear titles and actions.
- Keyboard navigation should not be broken.
- Avoid low contrast text.

Do not remove accessibility features from MUI components.

## Copywriting Rules

Prefer direct Spanish copy for user-facing text.

Examples:

```txt
Agregar gasto
Guardar transacción
Categoría
Método de pago
Presupuesto usado
Monto restante
Sin clasificar
Congelar extras
```

Use friendly but direct recommendations.

Good:

```txt
Delivery está al 83%. Congelá pedidos esta semana.
```

Avoid guilt-heavy copy.

Bad:

```txt
Estás manejando mal tu dinero.
```

## Data Display Rules

Money formatting:

```txt
USD: US$1,300.00
NIO: C$47,611.59
```

Percentages:

```txt
83.8%
```

Dates:

Use a consistent format for Nicaragua/Spanish UI.

Examples:

```txt
15 jul 2026
2026-07-15
```

Choose one and be consistent.

Do not perform money calculations inside JSX. Use utilities.

## Component Design Rules

Prefer small components:

```txt
SummaryCard
CategoryUsageCard
CategoryUsageTable
BudgetStatusChip
TransactionForm
TransactionList
EmptyState
PageHeader
```

Avoid huge page files with all UI and logic inline.

Do not prematurely create a large design system.

Create reusable components only after the pattern appears at least twice, unless it is obviously shared.

## Server/Client Component Rules

Default to Server Components.

Use Client Components for:

```txt
Forms
Dialogs
Interactive filters
Client-side validation UX
Charts if added later
```

Keep database reads in Server Components or server-side query functions.

Keep mutations in Server Actions unless a Route Handler is more appropriate.

Do not fetch database data directly from Client Components.

## Performance Rules

Avoid expensive client-side computation when it can be done server-side.

For MVP:

```txt
Server-side aggregate queries are preferred
Simple tables/lists are enough
Avoid heavy chart libraries
Avoid unnecessary global state
```

Do not add Redux/Zustand for MVP UI unless there is a clear need.

## Design Review Checklist

Before finishing a UI task, check:

```txt
Does the screen answer the user’s financial question?
Is the primary action obvious?
Is mobile usable?
Are required fields clear?
Are errors understandable?
Are statuses understandable without color?
Is money formatted consistently?
Are budget thresholds shown correctly?
Is business logic outside JSX where practical?
Did we avoid unnecessary dependencies?
```

## Implementation Workflow

When asked to design or implement UI:

1. Read required docs.
2. Inspect existing UI conventions.
3. State assumptions.
4. Propose a small plan.
5. Implement only the requested UI scope.
6. Keep business logic in utilities/query functions.
7. Run relevant validation.
8. Report changed files, validation, risks, and follow-ups.

## Commands

Use available commands from package.json.

Common expected commands:

```powershell
pnpm lint
pnpm build
```

If tests exist:

```powershell
pnpm test
```

Do not invent scripts without checking package.json.

## Approval Required Before

Ask before:

```txt
Adding a chart library
Adding icon library
Changing UI library
Adding Tailwind
Adding animations library
Adding auth UI
Adding AI UI
Adding OCR/import UI
Creating a large custom theme
Redesigning all pages at once
```

## Common Mistakes to Avoid

Do not:

```txt
Make the dashboard decorative but not actionable
Build desktop-only UI
Hide the add transaction action
Use category as payment method
Use payment method as category
Show status only with color
Put budget calculations directly in JSX
Add charts before basic cards/tables work
Add AI classification UI before merchant rules work
Add too many pages at once
Over-customize MUI components too early
```

## Example Good Dashboard Copy

```txt
Resumen del mes

Gastado:
US$420.50 de US$850.00

Presupuesto usado:
49.4%

Alertas:
Delivery está al 83% antes del día 20. Congelá pedidos esta semana.

Sin clasificar:
2 gastos necesitan categoría.
```

## Example Good Transaction Form Flow

```txt
Agregar gasto

Nombre:
La Colonia

Monto:
C$850

Moneda:
NIO

Categoría:
Supermercado

Método de pago:
Débito

Fecha:
Hoy

Nota:
Compra de comida para la casa

[Guardar gasto]
```

## Final Reminder

The UI should help Julio act.

A successful screen is not one that looks impressive.

A successful screen makes it obvious:

```txt
What happened?
Is it healthy?
What should I do next?
```
