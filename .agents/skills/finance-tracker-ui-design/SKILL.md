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
## Modern Finance App Design Direction

The Finance Tracker UI should feel like a modern personal finance app:

```txt
Elegant
Calm
Trustworthy
Premium but not flashy
Data-focused
Mobile-friendly
Fast to use
```

The visual style should avoid looking like:

```txt
A bank enterprise admin panel
A crypto trading terminal
A colorful gamified app
A generic SaaS dashboard
A spreadsheet clone
```

The design should combine:

```txt
Soft neutral backgrounds
Clear cards
Financial status colors
Strong typography hierarchy
Generous spacing
Readable tables/lists
Mobile-first forms
Action-oriented alerts
```

Modern and elegant does not mean adding unnecessary animations, gradients, charts, or icon libraries.

Elegance means that the user can understand their financial state quickly and act with confidence.

## Palette and Theme Rules

Use MUI theme tokens as the source of truth.

Do not scatter hardcoded colors across components.

Prefer defining palette, spacing, shape, and typography in a centralized theme file, for example:

```txt
src/app/theme.ts
src/theme/index.ts
src/lib/theme.ts
```

Use the actual project structure if a theme file already exists.

### Recommended Visual Palette

Use a calm finance-oriented palette.

Suggested direction:

```txt
Primary: deep navy / financial blue
Secondary: emerald / money green
Background: warm off-white or soft gray
Surface: white or near-white cards
Text primary: near-black / deep slate
Text secondary: muted slate
Divider: soft gray
Success: green
Warning: amber
Error/Danger: red
Info: blue
```

Suggested color intent, not mandatory exact values:

```txt
Primary: #123047 or #0F2A3D
Secondary: #0F766E or #168A6F
Background: #F6F8FA or #F7F5F0
Surface: #FFFFFF
Text primary: #17202A
Text secondary: #667085
Success: #16A34A
Warning: #D97706
Danger/Error: #DC2626
Info: #2563EB
```

Rules:

1. Prefer MUI palette tokens over inline hex values.
2. Centralize custom colors in the theme.
3. Use semantic colors for status.
4. Do not use color as the only status indicator.
5. Ensure text contrast is readable.
6. Avoid saturated backgrounds for large sections.
7. Use status color accents, not full-screen color blocks.
8. Avoid more than one strong accent color per screen.

### Status Color Mapping

Use this mapping consistently:

```txt
Sano / Safe: success
Cuidado / Warning: warning
Alerta / Danger: error or warning depending severity
Excedido / Exceeded: error
Sin clasificar / Uncategorized: default or info
```

Budget states must include both color and text.

Good:

```txt
Chip: "Alerta"
Color: warning/error
Text: "Delivery está al 83%. Congelá pedidos esta semana."
```

Bad:

```txt
Only a red progress bar with no label.
```

## Typography and Spacing Rules

Use typography to create financial hierarchy.

Recommended hierarchy:

```txt
Page title: clear and short
Section title: descriptive
Metric label: small and muted
Metric value: large and strong
Helper text: muted and concise
Alert text: direct and action-oriented
```

Examples:

```txt
Title: Resumen del mes
Metric label: Gastado
Metric value: US$420.50
Context: 49.4% del presupuesto usado
Action: Agregar gasto
```

Spacing:

```txt
Mobile page padding: compact but breathable
Desktop page max width: avoid full-width stretched content
Cards: consistent padding
Sections: clear vertical separation
```

Avoid dense layouts that feel like spreadsheets.

Avoid huge empty desktop layouts with tiny cards.

## Dashboard Visual Design Requirements

The dashboard should look modern, but it must remain actionable.

It should answer in the first screen:

```txt
How much did I spend?
How much budget remains?
Which categories require action?
What should I do next?
```

### Recommended Dashboard Layout

Mobile order:

```txt
1. Month selector / current month
2. Main financial health card
3. Primary action: Agregar gasto
4. Critical alerts
5. Category usage cards
6. Latest transactions
7. Uncategorized expenses
```

Desktop order:

```txt
1. Header with month and Add Transaction action
2. Summary card grid
3. Critical alert panel
4. Category usage table/cards
5. Latest transactions and uncategorized panel
```

### Main Financial Health Card

Create one primary card that summarizes the month.

It may include:

```txt
Total spent
Spendable budget
Budget used percentage
Expected savings
Financial status
Short recommendation
```

Example copy:

```txt
Resumen de junio
US$420.50 gastados de US$850.00
49.4% usado
Estado: Sano
Vas bien. Mantené el ritmo y protegé el ahorro.
```

### Summary Cards

Summary cards should be visually consistent.

Each card should include:

```txt
Short label
Main value
Secondary context
Optional status chip
```

Good cards:

```txt
Gastado este mes
Presupuesto usado
Ahorro esperado
Categorías en alerta
Gastos sin clasificar
```

Avoid too many cards. Prefer 4-6 high-value cards.

### Category Usage Design

Category usage should be easy to scan.

For each category show:

```txt
Category name
Spent / budget
Remaining amount
Usage percentage
Progress bar
Status chip
Action recommendation when needed
```

Mobile:

```txt
Use stacked cards.
Avoid wide tables.
Show the most important numbers first.
```

Desktop:

```txt
Use table or compact cards.
Keep columns readable.
Avoid too many decorative elements.
```

### Alert Panel Design

Alerts should feel important without causing panic.

Use:

```txt
Alert severity
Short title
Action recommendation
Related category
```

Good:

```txt
Delivery en alerta
US$58.70 de US$70.00 usados.
Congelá delivery esta semana.
```

Bad:

```txt
You are overspending.
```

### Dashboard Anti-Patterns

Do not:

```txt
Add charts before cards/tables work
Make the dashboard decorative but not actionable
Use too many colors
Hide the Add Transaction action
Show all categories with equal visual priority when some need action
Put budget calculations directly in JSX
Depend on AI to render the dashboard
```

## Modern Form UX Rules

Forms should feel fast, clean, and low-friction.

The `/transactions/new` screen is one of the most important screens in the app.

### Transaction Form Priority

The form should prioritize:

```txt
Amount
Name/merchant
Category
Payment method
Date
Currency/exchange rate
Note
```

Recommended grouping:

```txt
1. Main expense details
2. Classification
3. Payment details
4. Optional note
```

### Mobile Form Layout

Mobile must be first-class.

Rules:

```txt
Single column
Large tappable fields
Primary action full width
Sticky or clearly visible save action if form is long
Avoid cramped side-by-side fields
Use native-friendly input types when possible
```

Good mobile order:

```txt
Monto
Moneda
Descripción
Categoría
Método de pago
Fecha
Tipo
Nota
Guardar gasto
```

### Desktop Form Layout

Desktop can use two columns only when it improves clarity.

Recommended desktop grouping:

```txt
Left: amount, currency, date, type
Right: name, category, payment method, note
```

Do not create complex multi-step forms for MVP.

### Form Visual Style

Use:

```txt
Clear section labels
Consistent TextField sizes
Helper text where useful
Error text close to the field
Disabled save state while submitting
Loading state on submit
```

Avoid:

```txt
Generic "Invalid input"
Unlabeled selects
Too many optional fields visible as primary
Multiple competing submit buttons
Dense spreadsheet-like forms
```

### Validation Copy

Use Spanish user-facing validation.

Examples:

```txt
El monto debe ser mayor que 0.
La descripción es requerida.
Seleccioná una categoría.
Seleccioná un método de pago.
El tipo de cambio debe ser mayor que 0.
No se pudo guardar la transacción. Revisá los datos e intentá de nuevo.
```

## Responsive and Mobile Design Rules

Design mobile-first, then enhance for tablet and desktop.

Breakpoints should follow MUI conventions where practical.

### Mobile

Mobile screens should use:

```txt
Single-column layout
Compact header
Clear page title
Primary action visible
Cards instead of wide tables
Readable money values
Bottom spacing for comfortable scrolling
Full-width primary buttons
```

Avoid:

```txt
Horizontal scrolling tables
Tiny chips/buttons
Dense multi-column forms
Navigation that wraps badly
Cards with too much text
```

### Tablet

Tablet can use:

```txt
Two-column summary cards
Compact category cards
Split layout only when readable
```

### Desktop

Desktop can use:

```txt
Grid summary cards
Table for transaction list
Side-by-side dashboard sections
Persistent top navigation or simple sidebar if already implemented
```

Do not stretch content across the full viewport if it hurts readability.

Use a sensible max width for page content.

## App Shell and Navigation Design

The app shell should be simple and modern.

For MVP, prefer:

```txt
Top app bar
Clean navigation links
Primary action button: Agregar gasto
Responsive mobile menu if needed
```

Navigation labels in Spanish:

```txt
Dashboard or Resumen
Transacciones
Agregar gasto
Categorías
Reglas
Configuración
```

Keep labels consistent across all screens.

The primary action should usually be:

```txt
Agregar gasto
```

Do not hide the most common action inside a menu on desktop.

For mobile, the primary action can appear as:

```txt
Full-width button near top
Floating action button only if it does not hurt accessibility
Bottom action area if already part of the design
```

Do not add complex navigation patterns before the MVP routes work.

## Elegant MUI Component Rules

Use MUI components cleanly.

Prefer:

```txt
Card with subtle border/shadow
Stack for spacing
Container for page width
Grid for dashboard cards
Chip for status
Alert for actionable warnings
LinearProgress for budget usage
Table for desktop transaction list
Dialog for confirmation/edit flows
Skeleton for loading states
```

Avoid:

```txt
Over-customized components
Large inline sx objects repeated everywhere
Hardcoded colors in every component
Nested Cards inside Cards without reason
Heavy shadows everywhere
Overuse of gradients
```

If using `sx`, keep it readable.

If a style repeats across several components, move it into:

```txt
Theme tokens
Small reusable component
Shared style helper
```

Do not create a large design system prematurely.

## Finance UI Microcopy

Use Spanish copy that is calm, clear, and action-oriented.

Good:

```txt
Vas bien. Mantené el ritmo.
Delivery está al 83%. Congelá pedidos esta semana.
Este gasto está sin clasificar.
Te quedan US$11.30 en esta categoría.
El ahorro esperado no debe tocarse.
```

Avoid guilt-heavy copy:

```txt
Estás manejando mal tu dinero.
Fallaste tu presupuesto.
Tus finanzas están mal.
```

The app should guide behavior, not shame the user.

## Design Implementation Checklist

Before finishing any UI change, verify:

```txt
Does the screen look modern without becoming decorative?
Is the palette coming from the MUI theme?
Are status colors consistent?
Is the dashboard actionable?
Is the Add Transaction action obvious?
Is the form fast to complete on mobile?
Are fields readable and tappable on a phone?
Are cards/tables readable on desktop?
Are empty/loading/error states handled?
Are money, percentages, and dates formatted consistently?
Is status understandable without color?
Did we avoid Tailwind and unnecessary UI dependencies?
Did we avoid adding charts or icons without approval?
```

## Approval Required Before Visual Expansion

Ask for approval before:

```txt
Adding a chart library
Adding a new icon library
Adding animations
Creating a large custom theme
Changing the entire app shell/navigation
Adding dark mode
Adding glassmorphism/neumorphism/heavy gradients
Replacing MUI defaults globally
Introducing a dashboard chart system
```

A small MUI theme with palette, typography, shape, and component defaults is allowed if the task is UI foundation or dashboard design.


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
