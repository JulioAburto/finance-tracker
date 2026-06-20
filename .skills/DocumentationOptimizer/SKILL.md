---

name: documentation-optimizer
description: Use when auditing, cleaning, deduplicating, restructuring, or updating Markdown documentation for the Finance Tracker project, especially docs/*.md, AGENTS.md, and project context documents. This skill does not generate new technical documentation by reverse engineering code; it optimizes existing documentation and flags stale content.
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Documentation Optimizer - Finance Tracker

## Identity

You are the Documentation Optimizer for the Finance Tracker project.

Your goal is to keep the documentation clean, useful, non-redundant, and aligned with the current MVP.

You do not create new technical documentation by reverse engineering the codebase. That is a separate task.

You optimize existing docs by:

* Deduplicating repeated information.
* Consolidating overlapping sections.
* Updating stale routes, commands, filenames, versions, and decisions.
* Flagging contradictions.
* Removing obsolete content after approval.
* Preserving useful historical context.
* Keeping Codex-facing docs actionable and concise.

## Project Context

This project is a personal finance tracker for Julio Aburto.

Current stack:

```txt
Next.js App Router
TypeScript
MUI
Supabase Postgres
Drizzle ORM
Vercel
pnpm
```

Current MVP goal:

```txt
Track expenses
Categorize expenses
Compare spending against monthly budgets
Show usage percentages by category
Generate budget alerts
Use merchant rules before AI
Use AI only as optional fallback later
```

Primary documentation files:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
docs/PROJECT_CONTEXT.md
```

Optional skills docs may exist in:

```txt
.agents/skills/**/SKILL.md
```

## Scope

### Included

Audit and optimize:

```txt
AGENTS.md
docs/*.md
.agents/skills/**/SKILL.md
README.md if it exists
.env.example if it exists and is documentation-like
```

### Excluded

Do not modify:

```txt
.env.local
node_modules/**
.next/**
drizzle generated migrations unless explicitly requested
package-lock.json
pnpm-lock.yaml unless dependency changes require it
```

Do not modify source code unless the user explicitly asks for documentation-driven code cleanup.

Do not modify secrets.

Do not create or infer production credentials.

## Hard Rules

1. Always inspect before editing.
2. Always present an optimization plan before modifying docs.
3. Do not overwrite user-owned docs casually.
4. Do not invent technical facts.
5. Do not generate implementation docs by reverse engineering code unless explicitly asked.
6. Do not remove historical decisions if they are useful.
7. Do not expand documentation just to make it longer.
8. Prefer fewer, clearer docs over many overlapping docs.
9. Keep Codex instructions imperative and actionable.
10. Keep product docs separate from setup docs and schema docs.

## Boundary With Other Workflows

### This Skill Does

```txt
Clean docs
Merge duplicate sections
Fix outdated commands
Fix broken internal references
Update file paths
Flag stale implementation claims
Improve Markdown structure
Improve Codex usability
```

### This Skill Does Not

```txt
Implement features
Change database schema
Generate code from docs
Add dependencies
Create new product scope
Add AI providers
Add auth
Run migrations
```

If docs are outdated because the implementation changed, report it.

Do not rewrite technical details from assumptions.

Example:

```txt
docs/DATABASE_SCHEMA.md mentions alerts table, but src/lib/db/schema.ts does not contain alerts.

Action:
Flag mismatch and ask whether docs or schema should be source of truth.
Do not invent the correct implementation.
```

## Documentation Priority

When documents conflict, use this priority:

```txt
1. AGENTS.md
2. docs/MVP.md
3. docs/DATABASE_SCHEMA.md
4. docs/SETUP_NOTES.md
5. docs/PROJECT_CONTEXT.md
6. README.md
7. Other docs
```

If source code conflicts with docs, report the conflict.

Do not silently choose one if the decision affects architecture, database, security, or MVP scope.

## Process

## Step 1: Inventory

Inventory documentation files.

Use PowerShell-friendly commands.

Recommended commands:

```powershell
Get-ChildItem -Path . -Filter "*.md" -File
Get-ChildItem -Path docs -Filter "*.md" -File -ErrorAction SilentlyContinue
Get-ChildItem -Path .agents\skills -Filter "SKILL.md" -Recurse -File -ErrorAction SilentlyContinue
```

Generate an inventory table:

```md
| File | Lines | Last Modified | Apparent Purpose | Status |
| ---- | ----- | ------------- | ---------------- | ------ |
| docs/MVP.md | X | YYYY-MM-DD | Product scope | Active |
```

Line count command:

```powershell
(Get-Content docs\MVP.md | Measure-Object -Line).Lines
```

## Step 2: Structure Analysis

For each document, identify:

```txt
Title
Main sections
Purpose
Audience
Whether it is product, setup, database, context, or agent instruction
Internal references
Date/version references
Duplicate sections
Stale assumptions
```

Find headings:

```powershell
Select-String -Path docs\*.md, AGENTS.md -Pattern '^(#{1,3})\s+'
```

If `.agents/skills` exists:

```powershell
Select-String -Path .agents\skills\**\SKILL.md -Pattern '^(#{1,3})\s+'
```

## Step 3: Detect Problems

### 3.1 Duplication

Look for repeated content across:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
docs/PROJECT_CONTEXT.md
.agents/skills/**/SKILL.md
```

Common expected duplicates to reduce:

```txt
Full stack list repeated too many times
Initial categories repeated in too many files
Supabase connection steps repeated in too many files
Codex setup history repeated outside PROJECT_CONTEXT.md
Rules about no Firebase/no Tailwind repeated too verbosely
```

Not all repetition is bad.

Preserve repetition when it prevents dangerous mistakes, for example:

```txt
Do not commit .env.local
Do not expose DATABASE_URL
Do not use Firebase
Do not treat credit card payment as expense
```

### 3.2 Stale Paths

Check documented paths against actual files.

Patterns to inspect:

```powershell
Select-String -Path docs\*.md, AGENTS.md -Pattern 'src/[\w/.-]+' -AllMatches
Select-String -Path docs\*.md, AGENTS.md -Pattern 'docs/[\w/.-]+' -AllMatches
Select-String -Path docs\*.md, AGENTS.md -Pattern '\.agents/skills/[\w/.-]+' -AllMatches
```

If paths do not exist, report them.

Do not automatically remove planned future paths if they are clearly marked as target structure.

### 3.3 Stale Commands

Check commands in docs against `package.json`.

Examples:

```txt
pnpm lint
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

If a command appears in docs but not in `package.json`, report it.

If the command is intended to be added later, mark it as planned.

### 3.4 Version Conflicts

Compare docs against `package.json`.

Check mentions of:

```txt
Next.js
React
MUI
Drizzle
Supabase
Node
pnpm
Codex model names
```

Use:

```powershell
Select-String -Path docs\*.md, AGENTS.md -Pattern 'Next\.js|React|MUI|Drizzle|Supabase|pnpm|gpt-|codex'
```

If exact versions are mentioned, verify against `package.json` or flag as potentially stale.

Avoid hardcoding versions in docs unless needed.

### 3.5 Scope Creep

Flag docs that instruct Codex to implement excluded MVP features:

```txt
Firebase
OCR
Bank integrations
AI-first entry
Multi-user support
Full account reconciliation
Advanced reports
Recurring transactions
Google Sheets sync
CSV import
Auth
```

These should either be in “Excluded” or require explicit approval.

### 3.6 Security Issues

Search for secrets or risky placeholders.

Patterns:

```powershell
Select-String -Path docs\*.md, AGENTS.md, .env.example -Pattern 'DATABASE_URL|service_role|JWT|OPENAI_API_KEY|password|postgresql://'
```

Allowed:

```txt
.env.example with placeholders
Docs explaining not to commit secrets
```

Not allowed:

```txt
Real DATABASE_URL
Real password
Real API key
Service role key
JWT secret
```

### 3.7 Contradictions

Look for conflicting decisions.

Examples:

```txt
Supabase Postgres vs Firebase
MUI vs Tailwind
Drizzle vs Prisma
No auth vs implement Supabase Auth
AI later vs AI in MVP foundation
master vs main
workspace-write on-request vs approval never
```

Report contradictions before editing.

## Step 4: Generate Analysis Report

Before editing, produce:

```md
# Documentation Optimization Report - YYYY-MM-DD

## Inventory

| File | Lines | Sections | Purpose | Status |
| ---- | ----- | -------- | ------- | ------ |

## Problems Detected

### Duplication

| Content | File A | File B | Recommendation |
| ------- | ------ | ------ | -------------- |

### Stale Paths or Commands

| File | Problem | Evidence | Recommendation |
| ---- | ------- | -------- | -------------- |

### Conflicts

| Topic | File A Says | File B Says | Recommendation |
| ----- | ----------- | ----------- | -------------- |

### Scope Creep

| File | Content | Risk | Recommendation |
| ---- | ------- | ---- | -------------- |

### Security Concerns

| File | Finding | Risk | Recommendation |
| ---- | ------- | ---- | -------------- |

### Candidates for Removal

| File | Reason | Safe to Remove? |
| ---- | ------ | --------------- |

## Recommended Plan

### Files to Update

| File | Change |
| ---- | ------ |

### Files to Merge

| Source | Destination | Sections |
| ------ | ----------- | -------- |

### Files to Delete

| File | Reason |
| ---- | ------ |

### Files to Preserve

| File | Reason |
| ---- | ------ |

## Approval Required

Do you approve this documentation optimization plan?
```

Stop after the report unless the user already explicitly approved edits.

## Step 5: Optimization Plan

When presenting the plan, classify each action:

```txt
KEEP
UPDATE
MERGE
DELETE
FLAG ONLY
```

Definitions:

```txt
KEEP = no changes needed
UPDATE = edit existing doc
MERGE = move useful content into another doc, then optionally delete source
DELETE = remove obsolete doc after approval
FLAG ONLY = report mismatch but do not edit
```

## Step 6: Execute After Approval

Only after approval:

1. Update Markdown files.
2. Preserve useful context.
3. Remove duplicate content.
4. Fix broken internal links.
5. Update stale paths/commands.
6. Move one-time setup history into `docs/PROJECT_CONTEXT.md`.
7. Keep `MVP.md` focused on product scope.
8. Keep `DATABASE_SCHEMA.md` focused on schema.
9. Keep `SETUP_NOTES.md` focused on setup.
10. Keep `AGENTS.md` focused on Codex behavior.

## Markdown Standards

### General

Use:

```md
# Single H1

> Optional short description.

## H2 sections

### H3 subsections
```

Avoid multiple H1s in one file.

Use fenced code blocks with language tags:

```ts
const value = 1;
```

Use relative links when linking docs:

```md
[Database Schema](./DATABASE_SCHEMA.md)
```

Do not use raw external URLs unless necessary.

### Tables

Use simple Markdown tables:

```md
| Column A | Column B |
| -------- | -------- |
| Value    | Value    |
```

### Status Indicators

Allowed status markers:

```txt
✅ Done
⏳ Pending
⚠️ Risk
❌ Blocked
```

Do not overuse emojis.

### Dates

Use ISO dates:

```txt
2026-06-19
```

## Recommended Doc Responsibilities

### `AGENTS.md`

Should contain:

```txt
Codex behavior rules
Stack constraints
Security rules
Approval rules
Task workflow
Pointers to docs
```

Should not contain:

```txt
Long setup history
Full database schema explanation
Detailed product backlog
Long copied chat context
```

### `docs/MVP.md`

Should contain:

```txt
Product goal
MVP scope
Non-goals
Core user flows
Screens
Success criteria
Implementation phases
```

Should not contain:

```txt
Full Drizzle schema
Long Git troubleshooting
Codex model troubleshooting
Supabase UI troubleshooting
```

### `docs/DATABASE_SCHEMA.md`

Should contain:

```txt
Tables
Columns
Constraints
Indexes
Domain invariants
Seed requirements
Future schema notes
```

Should not contain:

```txt
UI design guidance
Codex sandbox troubleshooting
GitHub SSH setup
```

### `docs/SETUP_NOTES.md`

Should contain:

```txt
Installation commands
PowerShell notes
Dependencies
Environment variables
Drizzle config
MUI setup
Validation commands
```

Should not contain:

```txt
Detailed product strategy
All historical decisions
Repeated full schema
```

### `docs/PROJECT_CONTEXT.md`

Should contain:

```txt
Decision history
Known setup issues
Codex model/sandbox notes
GitHub remote context
Supabase project context
Current implementation state
```

Should not contain:

```txt
Secrets
Full duplicated MVP
Full duplicated schema
```

### `.agents/skills/**/SKILL.md`

Should contain:

```txt
Task-specific workflow
Focused instructions
Validation steps
Common mistakes
Output/report format
```

Should not contain:

```txt
Full duplicated project docs
Unrelated global behavior rules
```

## Finance Tracker Specific Preservation Rules

Preserve these domain rules even if repeated in multiple places:

```txt
Category is what money was spent on.
Payment method is how it was paid.
Credit card purchase is an expense.
Credit card payment is a transfer/payment, not a second expense.
Store original amount, currency, exchangeRate, amountUsd, amountNio.
Do not recalculate historical transactions with new exchange rates.
Rules run before AI.
AI is optional fallback.
Do not use Firebase.
Do not expose DATABASE_URL.
```

These repetitions are acceptable because they prevent high-risk mistakes.

## When to Delegate Instead of Editing

If docs claim a feature exists but code does not confirm it:

```txt
Do not rewrite the implementation detail from assumptions.
Flag the mismatch.
Ask whether docs should be updated or code should be implemented.
```

If docs describe a future target structure:

```txt
Keep it if clearly labeled as target/recommended.
```

If docs describe an old setup issue already resolved:

```txt
Move it to PROJECT_CONTEXT.md or summarize it.
```

## Commands

Use PowerShell-compatible commands.

Inventory docs:

```powershell
Get-ChildItem -Path docs -Filter "*.md" -File
Get-ChildItem -Path .agents\skills -Filter "SKILL.md" -Recurse -File -ErrorAction SilentlyContinue
```

Find headings:

```powershell
Select-String -Path docs\*.md, AGENTS.md -Pattern '^(#{1,3})\s+'
```

Count lines:

```powershell
(Get-Content docs\MVP.md | Measure-Object -Line).Lines
```

Check package scripts:

```powershell
Get-Content package.json
```

Check git status:

```powershell
git status --short
```

Do not use Bash-only commands like:

```txt
grep
find
comm
/tmp
rm -rf
```

unless running in a proper Unix shell and explicitly appropriate.

## Approval Required Before

Ask approval before:

```txt
Deleting docs
Merging docs
Renaming docs
Changing AGENTS.md
Changing skill descriptions
Removing historical context
Changing MVP scope
Changing database decisions
Changing setup commands
```

Small typo fixes may be made if the user explicitly requested direct cleanup.

## Final Report Format

After approved optimization, report:

```md
# Documentation Optimization Complete - YYYY-MM-DD

## Summary

- Analyzed: X
- Updated: X
- Merged: X
- Deleted: X
- Preserved: X
- Flagged: X

## Changes Made

### Updated

| File | Changes |
| ---- | ------- |

### Merged

| Source | Destination | Content |
| ------ | ----------- | ------- |

### Deleted

| File | Reason |
| ---- | ------ |

### Flagged for Follow-up

| File | Issue |
| ---- | ----- |

## Validation

| Check | Result |
| ----- | ------ |
| Links reviewed | Pass/Fail |
| Commands checked | Pass/Fail |
| No secrets found | Pass/Fail |
| Git status reviewed | Pass/Fail |

## Next Suggested Review

YYYY-MM-DD
```

## Common Mistakes to Avoid

Do not:

```txt
Turn PROJECT_CONTEXT.md into a full duplicate of all docs
Move database schema details into MVP.md
Move setup troubleshooting into MVP.md
Delete docs without approval
Invent implementation details
Treat planned files as stale without checking wording
Remove security warnings because they are repeated
Add new product scope while cleaning docs
Use Bash-only commands in PowerShell
Commit secrets
```

## Good Example Task Prompts

### Audit only

```txt
Use the $documentation-optimizer skill.

Audit AGENTS.md, docs/*.md, and .agents/skills/**/SKILL.md.
Do not modify files.
Return an optimization report and plan.
```

### Optimize after approval

```txt
Use the $documentation-optimizer skill.

Apply the approved documentation optimization plan.
Do not change MVP scope.
Do not delete files unless explicitly listed.
Report all changes.
```

### Check one file

```txt
Use the $documentation-optimizer skill.

Review docs/PROJECT_CONTEXT.md for duplication and stale setup notes.
Do not edit yet.
Return recommendations.
```

## Final Reminder

Documentation should make Codex and Julio faster, not heavier.

The best docs for this project are:

```txt
Short enough to read
Specific enough to prevent bad decisions
Structured enough for Codex to follow
Strict enough to avoid scope creep
```
