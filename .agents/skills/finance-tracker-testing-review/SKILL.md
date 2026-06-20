---
name: finance-tracker-testing-review
description: Use when writing, reviewing, or improving tests and quality checks for the Finance Tracker app, especially money conversion, budget usage, budget alerts, transaction validation, merchant rule matching, security-sensitive flows, and regression prevention.
---

---

# Finance Tracker Testing and Review Skill

## Purpose

Use this skill for test creation, test review, regression checks, and quality review in the Finance Tracker project.

This applies to:

- Money utilities.
- Budget utilities.
- Transaction validation.
- Merchant rule matching.
- Server Actions.
- Dashboard calculations.
- Critical UI behavior.
- Security-sensitive flows.
- Regression checks before refactors.

Do not use this skill to add a new test framework unless explicitly requested.

## Required Context

Before writing or changing tests, read:

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
existing test files
jest config if present
testing library setup if present
src/lib/money/
src/lib/budget/
src/features/
```

Check git status before editing.

## Testing Philosophy

Prioritize testing business rules over UI decoration.

The most important bugs to prevent are financial logic bugs.

Test first:

```txt
money conversion
budget usage percentage
budget status thresholds
freeze recommendation rule
transaction validation
credit card payment handling
merchant rule matching
```

Test later:

```txt
visual polish
layout details
non-critical copy
animations
```

## Framework Expectations

Preferred stack:

```txt
Jest
React Testing Library
```

Do not add Vitest, Cypress, Playwright, or another framework unless explicitly approved.

If no test setup exists, propose the minimal Jest setup before implementing.

Do not install dependencies without approval.

## Pure Function Testing Priority

Pure functions should be tested first.

Examples:

```txt
src/lib/money/convert.ts
src/lib/budget/status.ts
merchant rule matching utility
transaction validation schema
```

Good test target:

```txt
convertMoney({ amount: 850, currency: "NIO", exchangeRate: 36.6243 })
```

Expected:

```txt
amountUsd approximately 23.21
amountNio 850.00
```

## Money Conversion Test Cases

Test:

```txt
USD to NIO
NIO to USD
rounding to 2 decimals
amount <= 0 throws or fails validation
exchangeRate <= 0 throws or fails validation
large amounts
decimal amounts
```

Must preserve rule:

```txt
Do not recalculate historical transactions with a new exchange rate.
```

## Budget Status Test Cases

Thresholds:

```txt
0% - 69% = safe
70% - 79% = warning
80% - 99% = danger
100%+ = exceeded
```

Test exact boundaries:

```txt
69.99 => safe
70 => warning
79.99 => warning
80 => danger
99.99 => danger
100 => exceeded
120 => exceeded
```

Test zero budget behavior.

Expected behavior:

```txt
If budgetAmountUsd <= 0, usage should not crash.
```

## Freeze Rule Test Cases

Rule:

```txt
If usage >= 80% before day 20, recommend freezing extra spending.
```

Test:

```txt
79.99% day 19 => false
80% day 19 => true
80% day 20 => false unless docs say otherwise
100% day 10 => true
```

If product requirements change, update tests.

## Transaction Validation Test Cases

Required fields for expense:

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

Test invalid:

```txt
empty name
amount 0
negative amount
invalid currency
missing date
missing category for expense
missing payment method for expense
exchange rate 0
invalid type
```

Test valid:

```txt
NIO expense
USD expense
transfer without category if allowed by schema/domain decision
income if supported by UI/action
```

## Credit Card Regression Tests

Prevent double counting.

Test conceptually:

```txt
Credit card purchase counts as expense.
Credit card payment does not count as expense.
Credit card payment is transfer/payment.
```

Do not let dashboard monthly spending include card payments as new expenses.

## Merchant Rule Tests

Test:

```txt
simple string match
case-insensitive match
priority order
inactive rule ignored
multiple matching rules choose highest priority
invalid regex handled safely if regex is supported
```

Examples:

```txt
"La Colonia" -> Supermercado
"OpenAI ChatGPT" -> Productividad
"Netflix" -> Entretenimiento
"Farmacia X" -> Salud
```

Do not execute arbitrary user code.

## Server Action Review

For Server Actions, check:

```txt
server-side validation exists
client input is not trusted
money conversion happens server-side
database errors are handled
raw DB errors are not exposed to UI
route revalidation is appropriate
no secrets leak to client
```

If testing Server Actions directly is hard, extract pure validation/business logic and test that.

## UI Testing Scope

Use React Testing Library for critical behavior.

Prioritize:

```txt
form renders required fields
validation errors appear
submit button behavior
empty states
alert states
uncategorized state
```

Do not snapshot-test large MUI components unless there is a clear reason.

Prefer user-centered queries:

```txt
getByRole
getByLabelText
getByText
```

Avoid brittle tests based on implementation details.

## Security Review Checklist

For any feature touching data mutation or secrets, review:

```txt
No DATABASE_URL in client code
No NEXT_PUBLIC_ secrets
No raw database error shown in UI
No SQL string concatenation
Server-side validation exists
User input sanitized/validated
No destructive command run without approval
No .env.local committed
```

## Commands

Use existing scripts from package.json.

Common commands:

```powershell
pnpm lint
pnpm build
pnpm test
```

If `pnpm test` does not exist, do not invent it silently.

Instead report:

```txt
No test script exists.
Recommended next step: add Jest setup.
```

## When Adding Test Setup

If no test setup exists and user approves adding it:

1. Add minimal Jest setup.
2. Add React Testing Library only if UI tests are needed.
3. Add a test script.
4. Add one or two useful tests first.
5. Avoid large testing setup refactor.

Do not add Cypress/Playwright for MVP without approval.

## Review Output Format

When reviewing code, report:

```txt
High-risk issues
Medium-risk issues
Low-risk issues
Missing tests
Security concerns
Suggested fixes
What not to change
```

Be direct.

Do not approve weak financial logic just because the code compiles.

## Final Report After Test Work

Report:

```txt
Files changed
Tests added/updated
Commands run
Test results
Coverage gaps
Risks
Follow-up items
```

## Common Mistakes to Avoid

Do not:

```txt
Test only rendering and ignore money logic
Skip boundary tests for budget thresholds
Ignore credit card double-counting
Mock everything so the test proves nothing
Expose secrets in test fixtures
Add huge test framework changes without approval
Write brittle tests coupled to MUI internals
Put business logic inside components where it is hard to test
```

## Definition of Done

Testing/review work is done when:

```txt
Critical business rules are covered
Relevant commands were run
Failures are explained
No unrelated refactors were introduced
No secrets were added
Risk areas are documented
```
