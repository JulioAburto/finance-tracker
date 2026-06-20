---
name: finance-tracker-ui-design
description: Audit, design, and implement UI/UX for the single-user Finance Tracker MVP built with Next.js App Router, TypeScript, and MUI. Use for route or component work involving /dashboard, /transactions, /transactions/new, /categories, /rules, /settings, AppShell/providers/theme, transaction forms and lists, category budgets, merchant rules, settings, financial summaries, alerts and status labels, empty/loading/error states, mobile responsiveness, accessibility, Spanish financial copy, and consistent money/date/percentage display. Apply the project rules for category versus payment method, credit-card payments as transfers, expense-only budget usage, and historical exchange rates; flag UI scope creep such as Tailwind, bank integrations, OCR, authentication, or AI-first flows.
---

# Finance Tracker UI Design

## Purpose

Use this skill to audit, design, or implement UI for:

```txt
/dashboard
/transactions
/transactions/new
/categories
/rules
/settings
App shell and navigation
MUI theme and providers
Forms, tables, cards, alerts, and status indicators
Empty, loading, error, and not-found states
Responsive and accessible behavior
```

The UI must help Julio understand what happened, whether it is healthy, and what to do next. It is a personal financial control tool, not a generic dashboard, accounting suite, or banking platform.

Do not use this skill to introduce database changes, authentication, AI providers, deployment changes, or features outside the documented MVP unless explicitly requested.

## Required Context

Before making UI decisions, read:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
docs/PROJECT_CONTEXT.md
```

Then inspect the existing routes, components, theme, providers, and UI conventions. Do not assume a design system exists unless it is present in the repository.

## Product and Finance Rules

The interface must make these questions easy to answer:

```txt
How much did I spend this month?
How much budget remains?
Which categories are healthy, risky, or exceeded?
What spending should I reduce or freeze?
Which expenses remain uncategorized?
Am I protecting the expected savings?
```

Preserve these rules in labels, forms, summaries, and recommendations:

```txt
Category means what the money was used for.
Payment method means how it was paid.
A credit-card purchase is an expense.
A credit-card payment is a transfer, not a second expense.
Savings is a transfer or allocation, not a normal expense.
Only expense transactions consume budget.
USD is the internal budget currency.
Each transaction preserves its original amount, currency, exchange rate, USD, and NIO values.
Historical transactions are not recalculated with a new exchange rate.
Manual selection and merchant rules take precedence over optional AI.
```

## Design Principles

1. Prioritize clarity over decoration.
2. Design mobile-first.
3. Keep transaction entry fast.
4. Make financial state immediately understandable.
5. Make warnings actionable.
6. Use consistent spacing, typography, and status language.
7. Prefer standard MUI components before custom UI.
8. Keep financial calculations and classification logic outside JSX.
9. Avoid visual noise and premature abstraction.
10. Keep the interface fully useful without AI.

## Stack and UI Boundaries

Use:

```txt
Next.js App Router
TypeScript
MUI
CSS Modules only when justified
```

Do not add:

```txt
Tailwind
shadcn/ui
DaisyUI
Headless UI
Chart libraries without approval
Icon libraries without approval
Animation libraries without approval
Redux or Zustand without a demonstrated need
```

## Modern Finance App Direction

The product should feel:

```txt
Modern
Elegant
Calm
Trustworthy
Personal
Financially serious
Data-focused
Fast to use
Premium without being flashy
```

Combine:

```txt
Soft neutral backgrounds
Clear light surfaces
Strong financial hierarchy
Generous but efficient spacing
Readable cards, lists, and tables
Semantic status accents
Action-oriented alerts
```

Avoid making it resemble:

```txt
A corporate banking admin panel
A crypto trading terminal
A gamified finance app
A generic SaaS dashboard
A spreadsheet clone
```

Elegance comes from hierarchy, restraint, consistency, and ease of use. Do not use unnecessary gradients, animation, charts, or decorative elements to manufacture a modern appearance.

## Palette and MUI Theme

Use the centralized MUI theme as the source of truth for palette, typography, spacing, shape, shadows, and component defaults.

Prefer a calm finance-oriented palette:

```txt
Primary: deep navy or financial blue
Secondary: restrained emerald or teal
Background: warm off-white or soft gray
Surface: white or near-white
Text primary: near-black or deep slate
Text secondary: muted slate
Divider: soft gray
Success: green
Warning: amber
Error: red
Info: blue
```

Possible direction, not mandatory exact values:

```txt
Primary: #123047 or #0F2A3D
Secondary: #0F766E or #168A6F
Background: #F6F8FA or #F7F5F0
Surface: #FFFFFF
Text primary: #17202A
Text secondary: #667085
Success: #16A34A
Warning: #D97706
Error: #DC2626
Info: #2563EB
```

Rules:

1. Prefer theme tokens and semantic component props over inline hex values.
2. Centralize custom colors instead of redefining them in pages.
3. Use status colors as accents, not large saturated backgrounds.
4. Use no more than one strong accent color per screen.
5. Maintain readable contrast.
6. Never communicate status through color alone.
7. Keep component defaults restrained; avoid replacing all MUI behavior globally.

Use consistent status mapping:

```txt
Sano: success
Cuidado: warning
Alerta: error or warning according to severity
Excedido: error
Sin clasificar: default or info
```

Every financial status must include a visible text label and, when useful, a direct recommendation.

## Typography and Spacing

Create hierarchy through typography:

```txt
Page title: short and prominent
Section title: descriptive
Metric label: small and muted
Metric value: large and strong
Helper text: concise and secondary
Alert text: direct and action-oriented
```

Example:

```txt
Resumen del mes
Gastado
US$420.50
49.4% del presupuesto usado
Agregar gasto
```

Use consistent page padding, card padding, gaps, and section spacing. Keep a sensible maximum content width on desktop. Avoid both spreadsheet-like density and oversized empty layouts.

## App Shell and Navigation

For the MVP, prefer a simple top app bar with:

```txt
Product identity
Current-route indication
Clear navigation labels
Visible primary action
Constrained main content
Responsive mobile navigation
```

Use consistent Spanish labels:

```txt
Resumen
Transacciones
Agregar gasto
Categorías
Reglas
Configuración
```

Keep `Agregar gasto` visible on desktop instead of hiding it in a menu. On mobile, use a prominent full-width action, an accessible bottom action area, or a floating action button only when it does not obstruct content or accessibility.

Do not introduce a complex sidebar, nested navigation, or route structure before the MVP requires it.

Each page should follow:

```txt
Page title
Short helper text
Primary action
Main content
Secondary or advanced content
```

## Dashboard Layout and Hierarchy

The dashboard must prioritize action over decoration.

The first viewport should answer:

```txt
How much did I spend?
How much budget remains?
Which categories require action?
What should I do next?
```

### Recommended Order

Mobile:

```txt
1. Month selector
2. Main financial health card
3. Agregar gasto action
4. Critical alerts
5. Category usage cards
6. Latest transactions
7. Uncategorized expenses
```

Desktop:

```txt
1. Header with month and Agregar gasto
2. Summary card grid
3. Critical alert panel
4. Category usage table or cards
5. Latest transactions and uncategorized panel
```

### Financial Health and Summary Cards

Use one primary card when it improves comprehension:

```txt
Total spent
Spendable budget
Budget-used percentage
Expected savings
Current status
Short recommendation
```

Example:

```txt
Resumen de junio
US$420.50 gastados de US$850.00
49.4% usado
Estado: Sano
Vas bien. Mantené el ritmo y protegé el ahorro.
```

Use 4–6 high-value summary cards at most:

```txt
Gastado este mes
Presupuesto usado
Monto restante
Ahorro esperado
Categorías en alerta
Gastos sin clasificar
```

Each card should have a short label, primary value, useful context, and optional status chip.

### Category Usage

For each category show:

```txt
Category name
Spent and budget amounts
Remaining amount
Usage percentage
Progress indicator
Text status
Recommendation when action is needed
```

Use stacked cards on mobile and a readable table or compact cards on desktop. Give higher visual priority to warning, danger, exceeded, and uncategorized items.

### Alerts

Alerts should be important without being alarmist:

```txt
Delivery en alerta
US$58.70 de US$70.00 usados.
Congelá delivery esta semana.
```

Use the documented thresholds:

```txt
0%–69%: Sano
70%–79%: Cuidado
80%–99%: Alerta
100%+: Excedido
```

At 80% or more before day 20, recommend freezing extras. Do not show vague or guilt-heavy warnings.

## Transaction Form UX

`/transactions/new` is a primary workflow. Optimize for fast daily entry.

Required data:

```txt
Name or merchant
Amount
Currency
Date
Category
Payment method
Transaction type
Exchange rate
Optional note
```

Defaults:

```txt
Date: today
Type: expense
Currency: settings value
Exchange rate: settings value
```

Prioritize:

```txt
1. Amount and merchant
2. Category
3. Payment method
4. Date and type
5. Currency and exchange rate
6. Optional note
```

Group related fields and keep optional information visually secondary. Do not create a multi-step wizard for the MVP.

Mobile:

```txt
Single column
Large tappable controls
No cramped side-by-side fields
Native-friendly input types
Full-width primary action
Save action visible without ambiguity
```

Desktop may use two columns only when grouping remains obvious.

Validation rules:

```txt
Place specific errors next to the affected field.
Connect errors to fields where practical.
Disable the submit action while saving.
Show a clear pending label.
Keep server-side validation authoritative.
Adapt category and payment-method requirements to transaction type.
Explain that credit-card payments and savings are transfers.
```

Good validation copy:

```txt
El monto debe ser mayor que 0.
El nombre es obligatorio.
Seleccioná una categoría.
Seleccioná un método de pago.
El tipo de cambio debe ser mayor que 0.
No se pudo guardar la transacción. Revisá los datos e intentá de nuevo.
```

Avoid generic errors, unlabeled fields, multiple competing submit actions, and presenting invalid financial combinations as normal choices.

## Transaction List

Support fast scanning. Show:

```txt
Date
Name
Category
Payment method
Original amount and currency
Converted amount when useful
Transaction type
Uncategorized status when applicable
Actions
```

Use cards or a compact list on mobile instead of forcing a wide table. Desktop may use a MUI table with readable columns and deliberate horizontal overflow only as a fallback.

Translate domain values into Spanish labels. Do not expose `expense`, `income`, or `transfer` directly in user-facing UI.

## Management Screens

### Categories

Show:

```txt
Category name
Monthly budget
Essential flag
Active state
Thresholds when editable
Actions
```

Use simple forms, rows, cards, or dialogs. Do not add advanced budget templates without approval.

### Merchant Rules

Show:

```txt
Pattern
Target category
Priority
Active state
Actions
```

Only describe or validate regex behavior when it is implemented. Never execute arbitrary user code.

### Settings

Include:

```txt
Default currency
Default exchange rate
Credit-card mode
Approved credit-card settings
```

Always warn:

```txt
Cambiar la tasa predeterminada no recalcula transacciones históricas.
```

## Responsive Design

Design mobile-first and enhance progressively using MUI breakpoints.

Mobile:

```txt
Single-column layouts
Compact app header
Visible primary action
Cards instead of wide tables
Readable money values
Full-width primary buttons
Comfortable bottom spacing
```

Tablet:

```txt
Two-column summary grids
Compact category cards
Split layouts only when readable
```

Desktop:

```txt
Summary-card grids
Tables where scanning benefits
Side-by-side secondary sections
Constrained content width
```

Avoid horizontal scrolling, tiny controls, dense multi-column forms, wrapped navigation, and overly verbose cards on mobile.

## MUI Component Styling

Prefer:

```txt
Container for content width
Stack for spacing
Grid or CSS grid for summaries
Card or Paper with subtle border/shadow
Chip for text status
Alert for actionable warnings
LinearProgress for budget usage
Table for desktop data
Dialog for confirmations
Skeleton for loading
TextField, Select, and FormControl for forms
```

Rules:

1. Keep `sx` objects small and readable.
2. Move repeated visual decisions into theme tokens or a small shared component.
3. Use subtle elevation and borders.
4. Avoid heavy shadows, nested cards, repeated inline colors, gradients, and excessive decoration.
5. Reuse components only when a pattern is shared or clearly valuable.
6. Do not build a large design system before the MVP needs it.

Useful focused components may include:

```txt
PageHeader
SummaryCard
BudgetStatusChip
CategoryUsageCard
TransactionForm
TransactionList
EmptyState
```

## States and Accessibility

Every major route should provide useful states.

Empty-state examples:

```txt
No hay transacciones todavía.
Registrá tu primer gasto para comenzar.
[Agregar gasto]

No hay alertas de presupuesto.
Tus categorías están dentro de sus límites.

Todas las transacciones están clasificadas.
```

Use skeleton cards or rows for loading. Disable submit actions while saving. Explain failures in plain language without exposing raw database errors or secrets.

Accessibility requirements:

```txt
Use semantic elements where practical.
Give every input a visible label.
Use clear button text.
Keep keyboard navigation intact.
Give dialogs clear titles and actions.
Maintain sufficient contrast.
Do not rely on color alone.
Keep touch targets usable on mobile.
```

## Finance Microcopy and Data Display

Use calm, direct, action-oriented Spanish. Guide behavior without judgment.

Good:

```txt
Vas bien. Mantené el ritmo.
Delivery está al 83%. Congelá pedidos esta semana.
Este gasto está sin clasificar.
Te quedan US$11.30 en esta categoría.
El ahorro esperado no debe tocarse.
```

Avoid:

```txt
Estás manejando mal tu dinero.
Fallaste tu presupuesto.
Tus finanzas están mal.
```

Use consistent terminology:

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

Format consistently:

```txt
USD: US$1,300.00
NIO: C$47,611.59
Percentage: 83.8%
Date: 15 jul 2026 or another single documented format
```

Use shared formatting utilities. Do not calculate money or budget state inside JSX.

## Server and Client Boundaries

Default to Server Components.

Use Client Components only for:

```txt
Interactive forms
Dialogs
Client-side validation UX
Interactive filters
Browser APIs
```

Keep database reads in Server Components or server-only query modules. Keep mutations in Server Actions unless a Route Handler is clearly more appropriate. Never import database clients or secrets into Client Components.

## Implementation Workflow

1. Read the required project documents.
2. Inspect existing UI conventions and routes.
3. State assumptions and propose a focused plan.
4. Implement only the approved scope.
5. Keep business logic in domain utilities, queries, and server validation.
6. Add or update tests when behavior changes.
7. Run the relevant tests, lint, and build commands available in `package.json`.
8. Review responsive behavior, accessibility, secrets, and scope.
9. Report changed files, validation, risks, and assumptions.

## Review Checklist

Before finishing, verify:

```txt
Does the screen answer a real financial question?
Is the next action obvious?
Does the visual direction feel modern without becoming decorative?
Does the palette come from the MUI theme?
Are status colors and labels consistent?
Is mobile genuinely usable?
Is transaction entry fast?
Are required fields and errors clear?
Are empty, loading, error, and not-found states handled?
Are money, percentages, and dates consistent?
Is status understandable without color?
Are finance domain rules preserved?
Did the implementation avoid unnecessary dependencies and scope creep?
```

## Approval Required

Ask before:

```txt
Adding chart, icon, or animation libraries
Changing the UI library
Adding Tailwind or Tailwind-derived libraries
Creating a large custom theme
Replacing MUI defaults globally
Redesigning the entire navigation
Adding dark mode
Adding glassmorphism, neumorphism, or heavy gradients
Adding auth, AI, OCR, import, or bank-integration UI
```

A small centralized MUI theme using palette, typography, spacing, shape, and restrained component defaults is acceptable when the approved task requires UI foundation work.

## Common Mistakes

Do not:

```txt
Make the dashboard decorative but not actionable.
Build desktop-only screens.
Hide the primary transaction action.
Confuse category with payment method.
Treat a credit-card payment as a new expense.
Use color as the only status signal.
Put financial calculations directly in JSX.
Show raw enum values in user-facing UI.
Add charts before cards and lists work.
Add AI-first classification before merchant rules.
Over-customize MUI or create a large design system prematurely.
```

## Final Standard

A successful screen makes three things obvious:

```txt
What happened?
Is it healthy?
What should I do next?
```
