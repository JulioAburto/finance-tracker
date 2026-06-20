---
name: documentation-optimizer
description: Audit, deduplicate, restructure, and update Markdown documentation for the Finance Tracker project. Use for AGENTS.md, README.md, docs/*.md, .agents/skills/**/SKILL.md, and documentation-like environment examples when Codex needs to find stale claims, broken references, duplicated guidance, contradictory decisions, unsafe examples, or unclear document ownership. Optimize existing documentation without inventing implementation facts or changing product scope.
---

# Documentation Optimizer

## Purpose

Keep Finance Tracker documentation concise, accurate, non-redundant, and useful to both Julio and Codex.

Use this skill to:

```txt
Audit documentation structure
Remove unnecessary duplication
Consolidate overlapping guidance
Fix stale routes, paths, commands, and versions
Identify contradictions and scope creep
Improve Markdown structure and readability
Preserve critical security and finance rules
```

Do not reverse-engineer undocumented technical behavior and present it as fact. When documentation and code disagree, report the mismatch unless the user explicitly asks which side to update.

## Project Boundaries

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

Included:

```txt
AGENTS.md
README.md
docs/*.md
.agents/skills/**/SKILL.md
.env.example when treated as documentation
```

Excluded unless explicitly requested:

```txt
Source code
Database migrations
Lockfiles
.env.local
Secrets or production credentials
```

## Source Priority

When documentation conflicts, use:

```txt
1. AGENTS.md
2. docs/MVP.md
3. docs/DATABASE_SCHEMA.md
4. docs/SETUP_NOTES.md
5. docs/PROJECT_CONTEXT.md
6. README.md
7. Task-specific skills and other docs
```

Do not silently resolve conflicts that affect architecture, schema, security, or MVP scope.

## Document Responsibilities

### `AGENTS.md`

Keep:

```txt
Agent behavior
Stack constraints
Security and approval rules
Engineering workflow
Pointers to authoritative docs
```

Avoid:

```txt
Long setup history
Full schema copies
Detailed product backlog
```

### `docs/MVP.md`

Keep:

```txt
Product goal
Included and excluded scope
Domain rules
Routes and user flows
Implementation status
Success criteria
```

Avoid detailed schema and environment troubleshooting.

### `docs/DATABASE_SCHEMA.md`

Keep:

```txt
Tables and columns
Constraints and indexes
Persistence invariants
Seed contract
Migration rules
```

Avoid UI guidance and general development history.

### `docs/SETUP_NOTES.md`

Keep:

```txt
Requirements
Environment setup
Installation and run commands
Database preparation
Validation commands
Troubleshooting
```

Avoid product strategy and duplicated schema details.

### `docs/PROJECT_CONTEXT.md`

Keep:

```txt
Current decisions
Known issues
Relevant technical history
Current implementation state
Next priorities
```

Do not turn it into a complete duplicate of the other documents.

### `README.md`

Keep it as a concise entry point:

```txt
Project purpose
Current high-level status
Minimal local setup
Available routes
Links to authoritative docs
Security warning
```

### `.agents/skills/**/SKILL.md`

Keep:

```txt
Clear trigger description
Task-specific workflow
Critical domain constraints
Validation guidance
Common mistakes
Expected report format when useful
```

Do not duplicate complete project documents inside a skill.

## Preservation Rules

Do not remove these rules merely because they appear in more than one document:

```txt
Category is what the money was used for.
Payment method is how it was paid.
A credit-card purchase is an expense.
A credit-card payment is a transfer, not a second expense.
Historical exchange rates must be preserved.
Transactions store original, USD, and NIO values.
Merchant rules run before optional AI.
Do not expose DATABASE_URL or commit .env.local.
Do not introduce Firebase, Tailwind, or unrelated architecture.
```

Repetition is acceptable when it prevents financial, security, or architectural errors.

## Workflow

### 1. Inventory

List the documentation in scope and identify each file’s purpose, size, and status.

Useful PowerShell commands:

```powershell
Get-ChildItem -Path docs -Filter "*.md" -File
Get-ChildItem -Path .agents\skills -Filter "SKILL.md" -Recurse -File
(Get-Content docs\MVP.md | Measure-Object -Line).Lines
```

### 2. Inspect Structure

For each file, identify:

```txt
Audience and purpose
Heading structure
Internal links
Paths and commands
Version references
Repeated content
Stale implementation claims
```

### 3. Detect Problems

Check for:

```txt
Duplicate sections
Broken or planned paths presented as existing
Commands absent from package.json
Version claims inconsistent with package.json
Scope creep outside the MVP
Real secrets or unsafe credential examples
Contradictory stack or product decisions
Malformed skill frontmatter
Multiple H1 headings outside fenced examples
```

Treat placeholders such as `[PASSWORD]` as documentation, not exposed secrets.

### 4. Propose a Plan

Before editing, classify each proposed action:

```txt
KEEP: no change needed
UPDATE: edit the existing document
MERGE: consolidate overlapping content
DELETE: remove only with explicit approval
FLAG ONLY: report a mismatch without choosing a source of truth
```

If the user already explicitly requested direct optimization, state the plan briefly and continue. Otherwise, stop for approval.

### 5. Edit Conservatively

While editing:

```txt
Preserve product scope and historical context that remains useful.
Keep diffs focused.
Use imperative language for agent instructions.
Prefer links to authoritative docs over copied sections.
Do not alter code, schema, dependencies, or commands incidentally.
Do not mark a feature complete from unvalidated local changes.
```

### 6. Validate Documentation

Review:

```txt
Heading hierarchy
Relative links
Documented paths
Commands against package.json
Dates and version references
Skill frontmatter
Accidental secrets
Final diff and Git status
```

Do not run application tests or builds for documentation-only work unless documentation generation or formatting requires them.

## Markdown Standards

Use:

```txt
One H1 per file
H2 for primary sections
H3 for subsections
Fenced code blocks with language tags
Relative links for repository documents
Simple tables
ISO dates: YYYY-MM-DD
```

For skills, frontmatter must begin and end with `---` and include a valid `name` and `description`.

Avoid decorative separators, excessive examples, and headings inside example blocks that make structure analysis ambiguous.

## Scope and Security Checks

Flag documentation that presents these as approved MVP work:

```txt
Bank integrations
OCR
AI-first entry
Multi-user support
Advanced reconciliation or reports
Recurring transactions
CSV or Google Sheets imports
Authentication or role systems
```

Allowed security examples must use obvious placeholders. Never write or reproduce real:

```txt
DATABASE_URL values
Passwords
API keys
JWT secrets
Service-role keys
Tokens
```

## Final Report

Report:

```txt
Documents analyzed
Files updated
Sections consolidated
Stale claims or conflicts flagged
Links, commands, and security checks performed
Anything intentionally left unchanged
```

## Common Mistakes

Do not:

```txt
Expand documentation merely to make it longer.
Duplicate full stack and schema descriptions everywhere.
Move setup troubleshooting into MVP.md.
Move UI guidance into DATABASE_SCHEMA.md.
Delete documentation without approval.
Invent implementation details.
Treat planned files as broken without checking context.
Remove repeated safety rules indiscriminately.
Change product scope during cleanup.
Use Bash-only commands in PowerShell examples.
```

## Final Standard

Documentation should be:

```txt
Short enough to read
Specific enough to prevent mistakes
Structured enough for Codex to follow
Accurate enough to serve as a source of truth
```
