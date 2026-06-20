# Finance Tracker - Project Context for Codex

## Purpose

This document gives Codex extra project context from the planning conversation.

It complements:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
```

Use this file to understand the current decisions, setup history, project constraints, and known issues.

Do not treat this file as a replacement for the source-of-truth docs.

Priority order:

```txt
1. AGENTS.md
2. docs/MVP.md
3. docs/DATABASE_SCHEMA.md
4. docs/SETUP_NOTES.md
5. docs/PROJECT_CONTEXT.md
```

## Project Summary

The project is a personal finance tracker for Julio Aburto.

The goal is to build a useful MVP that helps track expenses, categorize them, compare spending against monthly budgets, and surface alerts before spending becomes unhealthy.

The project should not become a full banking/accounting/AI platform during MVP v1.

## Product Problem

Julio wants to understand whether his finances are healthy enough to reach his goals.

The app must help answer:

```txt
How much did I spend this month?
Where did the money go?
Which categories are close to their limit?
What percentage of each category budget is used?
What spending should be frozen or reduced?
Are savings protected?
```

The app should encourage daily expense tracking and make it easy to detect unhealthy spending patterns.

## MVP Direction

MVP v1 focuses on:

```txt
Manual expense registration
Expense categorization
Monthly category budgets
Budget usage percentages
Budget alerts
Editable categories
Editable payment methods
Editable merchant rules
Basic settings
Supabase Postgres persistence
Drizzle schema and migrations
```

AI is optional and must come later.

## Core Product Decisions

### Manual Flow First

The first version should prioritize a reliable manual expense form.

Natural-language input and AI classification can be added later.

Do not start with AI-first entry.

### Rules Before AI

Classification order:

```txt
1. User-selected category
2. Merchant rule
3. AI suggestion
4. Uncategorized
```

Rules must have priority over AI.

AI should never overwrite user-confirmed data silently.

### Dashboard Must Be Actionable

The dashboard should not just display charts.

It should tell Julio what to do.

Examples:

```txt
Delivery is at 83% before day 20. Freeze delivery this week.
Supermercado is at 53%. Normal.
Varios is increasing. Review uncategorized/miscellaneous spending.
```

### Keep MVP Small

Do not implement:

```txt
Bank integrations
OCR
AI-first entry
Multi-user support
Full account reconciliation
Advanced reports
Recurring transactions
Complex goal simulation
Push notifications
Google Sheets sync
CSV import
```

unless explicitly requested.

## User and Development Context

Julio is a Computer Engineer and Frontend Developer.

Main stack:

```txt
React
Next.js App Router
TypeScript
JavaScript
Jest
React Testing Library
```

He wants rigorous engineering guidance and prefers correctness over agreement.

For this project, the selected stack is:

```txt
Next.js App Router
TypeScript
MUI
Supabase Postgres
Drizzle ORM
Vercel
pnpm
```

Do not use Tailwind or Tailwind-derived UI libraries.

## Current Project State

The project was created as a Next.js App Router scaffold.

Known scaffold state:

```txt
src/app exists
TypeScript is enabled
ESLint is enabled
App Router is enabled
src/ directory is enabled
alias @/* is configured
pnpm is used
Tailwind is not used
Pages Router is not used
```

At the initial analysis stage, Codex reported that the project structure matched the expected scaffold only partially because the finance-specific foundation was still missing.

Missing technical foundation included:

```txt
src/app/providers.tsx
drizzle.config.ts
src/lib/db/index.ts
src/lib/db/schema.ts
src/lib/db/seed.ts
src/lib/money/convert.ts
src/lib/budget/status.ts
package.json database scripts
MUI layout/provider setup
Drizzle setup
```

Codex also reported:

```txt
AGENTS.md was modified
docs/ was untracked
```

These files are user-owned and must not be overwritten.

## Current Codex Workflow

Codex is being used inside the project repo.

Recommended launch command:

```powershell
codex --sandbox workspace-write --ask-for-approval on-request
```

Do not use:

```powershell
codex --ask-for-approval never
```

during setup work.

Reason:

```txt
Codex will install dependencies and edit configuration.
It should ask for approval for sensitive actions.
```

## Codex Sandbox Context

Codex was installed successfully on Windows.

There was a problem with the elevated/default Windows sandbox setup because Windows could not find the sandbox setup helper executable.

Fallback used:

```txt
Use non-admin sandbox
```

Current working mode:

```txt
workspace-write
on-request approvals
```

If sandbox setup is revisited later, try the default/elevated sandbox again only after reinstalling/updating Codex.

Do not block project progress on the elevated sandbox issue if Codex reports:

```txt
Sandbox ready
```

## Codex Model Context

An error occurred with:

```txt
gpt-5.1-codex-max
```

Error summary:

```txt
The model is not supported when using Codex with a ChatGPT account.
```

Use a supported model instead.

Recommended command pattern:

```powershell
codex -m gpt-5.5 --sandbox workspace-write --ask-for-approval on-request
```

If unavailable, use another supported Codex model from the `/model` menu.

Do not continue using `gpt-5.1-codex-max`.

## First Codex Prompt Used

The first prompt was analysis-only.

It instructed Codex to:

```txt
Read AGENTS.md
Read docs/MVP.md
Read docs/DATABASE_SCHEMA.md
Read docs/SETUP_NOTES.md
Inspect package.json, app structure, src structure, docs, dependencies, config, and git status
Report missing dependencies, files, setup steps, and a short plan
Do not edit files
Wait for approval
```

Codex complied and did not modify files.

## Second Codex Prompt Scope

The approved implementation phase should only cover technical foundation.

Scope:

```txt
Validate scaffold
Install MUI dependencies
Install Drizzle/Postgres dependencies
Add database scripts
Configure MUI provider
Configure Drizzle
Create DB client
Create schema
Create seed
Create money conversion utility
Create budget status utility
Optionally create .env.example
Run lint/build/db:generate when possible
```

Do not create business screens yet.

Do not create:

```txt
/dashboard
/transactions
/transactions/new
/categories
/rules
/settings
/api/classify
```

until the foundation is complete.

## Dependencies

Production dependencies expected:

```txt
@mui/material
@emotion/react
@emotion/styled
@mui/material-nextjs
@emotion/cache
drizzle-orm
postgres
```

Development dependencies expected:

```txt
drizzle-kit
dotenv
tsx
```

Do not install:

```txt
@supabase/supabase-js
firebase
tailwindcss
```

for this MVP foundation.

## Why Supabase Postgres Instead of Firebase

Use Supabase Postgres, not Firebase.

Reason:

This app needs relational financial data:

```txt
transactions -> categories
transactions -> payment_methods
monthly_budget_categories -> monthly_budgets
monthly_budget_categories -> categories
merchant_rules -> categories
```

It also needs SQL-style reporting:

```txt
monthly spending by category
budget usage percentages
category thresholds
uncategorized transactions
credit card spending totals
```

Postgres fits this better than Firestore/Firebase for MVP v1.

Firebase is not needed and should not be added.

## Supabase Project Context

Supabase project exists.

Project ref:

```txt
utvvrplktmnzsolpfggl
```

This project ref is not a secret.

Secrets include:

```txt
database password
DATABASE_URL
API keys
service role keys
JWT secrets
```

Never commit secrets.

## Supabase Connection Guidance

Use Supabase as a managed Postgres database.

For this MVP, connect with Drizzle directly to Postgres using `DATABASE_URL`.

Do not use Supabase client SDK for the MVP foundation.

Recommended environment variable:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST].pooler.supabase.com:6543/postgres"
```

The actual URL must be copied from Supabase Dashboard.

The route in the Supabase UI may vary.

Possible places to find it:

```txt
Project Dashboard -> Connect
Database -> Connect
Project Settings -> Database -> Connection info
Project Settings -> Database -> Connection pooling
```

Look for:

```txt
Connection Pooler
Transaction pooler
URI
Connection string
```

For Vercel/serverless usage, prefer the Supabase pooler connection string.

When using the transaction pooler, configure postgres with:

```ts
prepare: false;
```

## Environment Variable Handling

Use:

```txt
.env.local
```

for local secrets.

Do not commit `.env.local`.

Create `.env.example` if useful:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST].pooler.supabase.com:6543/postgres"
```

In `drizzle.config.ts`, prefer explicitly loading `.env.local`:

```ts
import {config} from 'dotenv';
import {defineConfig} from 'drizzle-kit';

config({path: '.env.local'});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
```

Reason:

`dotenv/config` may not load `.env.local` by default.

## Drizzle DB Client Guidance

Expected file:

```txt
src/lib/db/index.ts
```

Expected approach:

```ts
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
});

export const db = drizzle(client, {schema});
```

Do not expose `DATABASE_URL` to the client.

Do not use `NEXT_PUBLIC_` for database credentials.

## PowerShell Context

Julio is working on Windows PowerShell.

Important:

PowerShell does not use `\` for multiline commands.

Wrong:

```powershell
pnpm create next-app@latest finance-tracker \
  --ts \
  --eslint
```

Correct single line:

```powershell
pnpm create next-app@latest finance-tracker --ts --eslint --app --src-dir --import-alias "@/*" --no-tailwind --use-pnpm
```

Correct multiline PowerShell:

```powershell
pnpm create next-app@latest finance-tracker `
  --ts `
  --eslint `
  --app `
  --src-dir `
  --import-alias "@/*" `
  --no-tailwind `
  --use-pnpm
```

The backtick must be the last character on the line.

## Git and GitHub Context

Git local identity was configured for this repo using:

```txt
git config --local user.name
git config --local user.email
```

This affects commit author only.

It does not control which GitHub account is used for push.

SSH authentication controls the GitHub account used for push.

Initial SSH check:

```powershell
ssh -T git@github.com
```

authenticated as:

```txt
JulioCesarAburto
```

The project needed to push to another GitHub account:

```txt
JulioAburto
```

A project-specific SSH alias was configured:

```txt
github-julioaburto
```

Remote should use the alias:

```txt
git@github-julioaburto:JulioAburto/[REPOSITORY_NAME].git
```

The original push issue was caused by the repository name in GitHub, not by Git local config.

Do not keep changing `git config user.email` to fix push authentication.

For changing the remote, use:

```powershell
git remote set-url origin git@github-julioaburto:JulioAburto/[REPOSITORY_NAME].git
```

Do not use `git remote add origin` if origin already exists.

## Branch Context

A repo may use either `master` or `main`.

For new repos, prefer:

```powershell
git branch -M main
git push -u origin main
```

If the project already uses `master`, do not rename branches without confirming.

## Current Remote Pattern

The expected remote should look like:

```txt
origin  git@github-julioaburto:JulioAburto/[REPOSITORY_NAME].git (fetch)
origin  git@github-julioaburto:JulioAburto/[REPOSITORY_NAME].git (push)
```

If `Repository not found` occurs, check:

```txt
repository exists
owner is correct
repo name is exact
SSH alias authenticates as the expected GitHub account
```

## Security Rules

Never commit:

```txt
.env.local
DATABASE_URL
Supabase password
OpenAI API key
GitHub tokens
service_role keys
JWT secrets
Google credentials
```

Do not log secrets.

Do not paste real secrets into docs.

Do not create `NEXT_PUBLIC_` variables for private values.

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

Savings should not be treated as normal spending.

Historical transactions must preserve their original exchange rate.

## Money Model Context

Each transaction should store:

```txt
amount
currency
exchangeRate
amountUsd
amountNio
```

Example:

```txt
amount: 850
currency: NIO
exchangeRate: 36.6243
amountUsd: 23.21
amountNio: 850.00
```

Use USD internally for budget comparisons.

Display USD and NIO where useful.

## Budget Alert Context

Budget thresholds:

```txt
safe: 0% - 69%
warning: 70% - 79%
danger: 80% - 99%
exceeded: 100%+
```

Special rule:

```txt
If a category reaches 80% before day 20, recommend freezing extra spending.
```

## Initial Categories and Budgets

Initial salary:

```txt
USD 1,300
```

Initial monthly budgets:

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

These values should be editable later.

## Initial Payment Methods

Initial payment methods:

```txt
Efectivo
Débito
Tarjeta de crédito
Transferencia
Prepago
Agencia
Otro
```

Payment method is not a category.

## Initial Merchant Rules

Initial merchant rules:

```txt
la colonia -> Supermercado
mandaditos|sisu|sorbetes|la placita|glorieta|ambros -> Delivery
openai|chatgpt -> Productividad
netflix|max|hbo|spotify|youtube|disney -> Entretenimiento
amazon|amzn|agencia -> Amazon / agencias
farmacia -> Salud
claro|tigo|internet|gas|cable -> Servicios
```

Rules must be editable.

Rules must run before AI.

If regex support is implemented, invalid regex must be handled safely.

## Current Implementation Priority

Do not build product screens yet unless the technical foundation is complete.

Immediate priority:

```txt
1. Install dependencies
2. Configure MUI
3. Configure Drizzle
4. Add schema
5. Add seed
6. Add money utility
7. Add budget utility
8. Validate build
9. Generate migration
```

Next priority after foundation:

```txt
1. Transaction creation
2. Transaction list
3. Dashboard calculations
4. Categories management
5. Merchant rules management
```

AI comes later.

## Validation Commands

Use available scripts.

Common expected commands:

```powershell
pnpm lint
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Do not run migration or seed if `DATABASE_URL` is missing.

If a validation command fails:

```txt
Explain the exact cause.
Fix only the related issue.
Do not refactor unrelated files.
```

## Codex Behavior Expectations

Before editing:

```txt
Read AGENTS.md
Read docs/MVP.md
Read docs/DATABASE_SCHEMA.md
Read docs/SETUP_NOTES.md
Read docs/PROJECT_CONTEXT.md
Inspect current files
Check git status
Propose a short plan
Wait for approval if task is broad
```

During editing:

```txt
Keep diff small
Do not overwrite user-owned docs
Do not add unrelated features
Do not install extra dependencies casually
Do not change stack decisions
Do not add auth unless requested
Do not add AI unless requested
```

After editing:

```txt
Report files changed
Report dependencies added
Report commands run
Report validation results
Report risks/follow-ups
Mention if docs/AGENTS.md were not overwritten
```

## Known Do-Not-Do List

Do not:

```txt
Use Firebase
Use @supabase/supabase-js for MVP foundation
Use Tailwind
Use Pages Router
Create pages/api
Use getServerSideProps
Use getStaticProps
Expose DATABASE_URL
Commit .env.local
Implement AI before rules
Implement OCR
Implement bank integrations
Implement multi-user
Treat credit card payment as expense
Treat payment method as category
Recalculate old transactions with new exchange rate
```

## Good Next Codex Prompt After This File Is Added

Use this prompt after saving this document:

```txt
Read AGENTS.md and all docs, including docs/PROJECT_CONTEXT.md.

Do not modify files yet.

Summarize the current implementation state and confirm:
1. What has already been decided.
2. What technical foundation remains.
3. What command/config issues are known.
4. What should be implemented next.

Then wait for approval.
```

## Final Reminder

This project should stay focused.

The first useful version is not the prettiest dashboard or the smartest AI.

The first useful version is:

```txt
I can register expenses every day.
The app categorizes them.
The dashboard shows budget usage.
The app warns me before I overspend.
```
