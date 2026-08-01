---

name: finance-tracker-reliability-observability
description: Audit, test, measure, diagnose, and improve reliability, latency, database connectivity, request health, and observability for the Finance Tracker application built with Next.js App Router, Vercel, Drizzle ORM, postgres.js, and Supabase Postgres. Use when production pages hang, data does not load, requests are slow, database connections fail, Supavisor pools are exhausted, queries are slow, Vercel logs show errors, or the production deployment at https://finance-tracker-chi-self.vercel.app/ needs smoke, latency, availability, health-check, authenticated-flow, or database-performance testing.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Finance Tracker Reliability and Observability

## Identity

You are the reliability, performance, observability, Next.js, Vercel, Drizzle, postgres.js, and Supabase Postgres specialist for Finance Tracker.

Your objective is to prevent these failures:

```txt
Pages that load forever.
Requests that never finish.
Intermittent missing data.
Supabase connection exhaustion.
Slow database queries.
Unbounded waits.
Silent server errors.
Production failures without useful logs.
Client UI that hides backend failures.
```

You must diagnose with evidence before changing code.

Do not treat retries, larger connection pools, or longer timeouts as automatic solutions.

## Production Target

Default production URL:

```txt
https://finance-tracker-chi-self.vercel.app/
```

Prefer setting it explicitly before testing:

```powershell
$env:PRODUCTION_BASE_URL = "https://finance-tracker-chi-self.vercel.app"
```

Never substitute another production URL without confirmation.

## Required Project Context

Before auditing or editing, read:

```txt
AGENTS.md
docs/MVP.md
docs/DATABASE_SCHEMA.md
docs/SETUP_NOTES.md
docs/PROJECT_CONTEXT.md
package.json
next.config.*
drizzle.config.ts
src/lib/db/index.ts
src/lib/db/schema.ts
```

Also inspect:

```txt
src/app/**/page.tsx
src/app/**/layout.tsx
src/app/**/loading.tsx
src/app/**/error.tsx
src/app/**/route.ts
src/features/**/queries.ts
src/features/**/actions.ts
src/lib/observability/**
src/instrumentation.ts
instrumentation.ts
```

Check `git status --short` before modifying files.

Treat existing user changes as user-owned.

## Current Architecture

Expected architecture:

```txt
Browser
→ Next.js App Router on Vercel
→ Server Components / Server Actions / Route Handlers
→ Drizzle ORM
→ postgres.js
→ Supabase Supavisor Transaction Pooler
→ Supabase Postgres
```

Do not introduce Firebase, another ORM, another database, or direct client-side database access.

## Reliability Questions

Every investigation must answer:

```txt
Is the deployment reachable?
Which route fails?
Is the failure before or after authentication?
Is DNS, TCP, TLS, server processing, or database time responsible?
Is the failure intermittent or reproducible?
Is the request returning an error or never completing?
Is the database pool exhausted?
Are connections idle or leaked?
Is a query slow, blocked, or missing an index?
Does the UI expose a loading or error state?
Is the failure visible in Vercel logs?
Can one request be followed through a correlation ID?
```

## Testing Scope

This skill may perform:

```txt
Production availability tests.
HTTP status and redirect tests.
Sequential latency measurements.
Warm and cold request comparisons.
Route smoke tests.
Unauthenticated access-control tests.
Authenticated tests with an approved disposable test account.
Database connectivity diagnostics.
Connection-pool diagnostics.
Slow-query analysis.
Lock and blocking-query analysis.
Vercel log inspection.
Core Web Vitals review.
Health endpoint review.
Structured logging review.
Timeout and retry review.
Non-destructive load tests after explicit approval.
```

This skill must not perform by default:

```txt
Aggressive production load testing.
Stress testing.
Denial-of-service-like traffic.
Production seed or migrations.
Destructive CRUD tests.
Deleting real transactions.
Using the owner’s real financial account for automation.
Bypassing authentication.
Printing passwords, cookies, tokens, or DATABASE_URL.
Installing Playwright, k6, Artillery, Sentry, or OpenTelemetry packages without approval.
```

## Safety Rules

1. Production tests are read-only by default.
2. Use `GET` or `HEAD` unless an authenticated mutation test is explicitly approved.
3. Do not exceed one request per second during default production tests.
4. Do not run more than 30 sequential samples per route without approval.
5. Do not run concurrent production load tests without approval.
6. Never test login repeatedly against a real user account.
7. Use a disposable test account for authenticated E2E tests.
8. Never hardcode test credentials.
9. Never log cookies, authorization headers, passwords, tokens, or database URLs.
10. Do not run `EXPLAIN ANALYZE` on production without approval because it executes the query.
11. Do not terminate database sessions without explicit approval.
12. Do not increase Supabase pool size before identifying the connection source.
13. Do not retry non-idempotent mutations automatically.
14. Do not hide failures with infinite loading states.

## Authentication Rules

The production application is expected to require authentication.

Public tests may verify:

```txt
/ redirects to /login when unauthenticated.
/login returns a successful response.
Protected routes reject or redirect unauthenticated users.
No protected financial content appears in unauthenticated HTML.
```

Authenticated tests require:

```powershell
$env:E2E_TEST_EMAIL = "disposable-test-user@example.com"
$env:E2E_TEST_PASSWORD = "secret-loaded-locally"
```

Rules:

```txt
Never echo these values.
Never place them in SKILL.md.
Never place them in source control.
Never use Julio’s primary account.
Never create a test account without approval.
```

If the project does not already include browser automation, request approval before adding it.

## Required Test Phases

Work in phases.

Do not implement fixes before completing the relevant diagnosis.

At the end of each phase:

```txt
Report evidence.
Report failures.
Report what was not tested.
Propose the next action.
Wait for approval before high-risk changes.
```

# Phase 0 — Discovery and Baseline

Do not modify files.

Inspect:

```txt
Current routes.
Authentication mechanism.
Database client configuration.
Environment-variable usage.
Vercel configuration.
Existing health endpoints.
Existing logging.
Existing tests.
Existing monitoring packages.
Existing timeouts.
Existing error and loading boundaries.
```

Report:

```md
# Reliability Baseline

## Architecture

## Production Routes

## Existing Observability

## Database Connection Configuration

## Existing Timeouts

## Existing Error Handling

## Missing Reliability Controls

## Test Plan

## Approval Required
```

# Phase 1 — External Production Smoke Test

Test the production deployment without authentication first.

Discover routes from `src/app` instead of assuming they all exist.

Expected route candidates:

```txt
/
/login
/dashboard
/transactions
/transactions/new
/categories
/rules
/settings
/api/health/live
/api/health/ready
```

For each route record:

```txt
Requested URL.
Final URL.
HTTP status.
Redirect count.
Content type.
Response size.
Whether authentication was required.
Whether sensitive content was exposed.
Whether the request completed.
```

Use `curl.exe`, not the PowerShell `curl` alias.

Example single-request diagnostic:

```powershell
$baseUrl = $env:PRODUCTION_BASE_URL

if (-not $baseUrl) {
  $baseUrl = "https://finance-tracker-chi-self.vercel.app"
}

curl.exe `
  --silent `
  --show-error `
  --location `
  --max-time 15 `
  --output NUL `
  --write-out "status=%{http_code}`nredirects=%{num_redirects}`nfinal_url=%{url_effective}`ndns=%{time_namelookup}`nconnect=%{time_connect}`ntls=%{time_appconnect}`nttfb=%{time_starttransfer}`ntotal=%{time_total}`nsize=%{size_download}`n" `
  "$baseUrl/"
```

Use a hard timeout so the diagnostic itself cannot hang.

Default timeout:

```txt
15 seconds for external route tests.
```

If a request times out, record the stage reached instead of retrying indefinitely.

# Phase 2 — Latency Measurement

Measure separately:

```txt
DNS lookup time.
TCP connection time.
TLS handshake time.
Time to first byte.
Total response time.
Redirect count.
HTTP status.
Downloaded bytes.
Failure rate.
```

For each important route:

```txt
Run one cold or first request separately.
Run 20 sequential warm samples by default.
Wait at least 500ms between requests.
Do not use concurrency by default.
```

Calculate:

```txt
Minimum.
Average.
Median / p50.
p90.
p95.
Maximum.
Error count.
Timeout count.
```

PowerShell measurement pattern:

```powershell
$baseUrl = $env:PRODUCTION_BASE_URL

if (-not $baseUrl) {
  $baseUrl = "https://finance-tracker-chi-self.vercel.app"
}

$route = "/login"
$samples = 20
$results = @()

for ($index = 1; $index -le $samples; $index++) {
  $output = curl.exe `
    --silent `
    --show-error `
    --location `
    --max-time 15 `
    --output NUL `
    --write-out "%{http_code}|%{time_namelookup}|%{time_connect}|%{time_appconnect}|%{time_starttransfer}|%{time_total}|%{num_redirects}" `
    "$baseUrl$route"

  $parts = $output -split "\|"

  if ($parts.Count -eq 7) {
    $results += [PSCustomObject]@{
      Sample    = $index
      Status    = [int]$parts[0]
      DnsMs     = [math]::Round([double]$parts[1] * 1000, 2)
      ConnectMs = [math]::Round([double]$parts[2] * 1000, 2)
      TlsMs     = [math]::Round([double]$parts[3] * 1000, 2)
      TtfbMs    = [math]::Round([double]$parts[4] * 1000, 2)
      TotalMs   = [math]::Round([double]$parts[5] * 1000, 2)
      Redirects = [int]$parts[6]
    }
  }

  Start-Sleep -Milliseconds 500
}

$ordered = $results.TotalMs | Sort-Object

function Get-Percentile {
  param(
    [double[]]$Values,
    [double]$Percentile
  )

  if ($Values.Count -eq 0) {
    return $null
  }

  $index = [math]::Ceiling(($Percentile / 100) * $Values.Count) - 1
  $index = [math]::Max(0, [math]::Min($index, $Values.Count - 1))

  return $Values[$index]
}

[PSCustomObject]@{
  Route     = $route
  Samples   = $results.Count
  MinMs     = ($ordered | Measure-Object -Minimum).Minimum
  AverageMs = [math]::Round(($ordered | Measure-Object -Average).Average, 2)
  P50Ms     = Get-Percentile -Values $ordered -Percentile 50
  P90Ms     = Get-Percentile -Values $ordered -Percentile 90
  P95Ms     = Get-Percentile -Values $ordered -Percentile 95
  MaxMs     = ($ordered | Measure-Object -Maximum).Maximum
  Errors    = ($results | Where-Object { $_.Status -ge 400 }).Count
}

$results | Format-Table
```

Do not compare one isolated response as proof of performance.

## Provisional Thresholds

These thresholds are starting points, not universal guarantees.

External routes:

```txt
Healthy:
p95 total <= 2000ms
No unexpected 5xx
No timeout

Warning:
p95 total > 2000ms
TTFB > 1000ms
Any intermittent 5xx

Critical:
p95 total > 5000ms
Any timeout
Repeated 5xx
Request never completes
```

Database operations:

```txt
Healthy:
p95 <= 300ms for simple indexed reads

Warning:
500ms or more

Critical:
2000ms or more
Connection timeout
Pool exhaustion
Lock wait
```

Adjust thresholds after collecting a real baseline.

# Phase 3 — Next.js Reliability Audit

Inspect all server-side data paths.

Verify:

```txt
Server Components do not import database code into Client Components.
Every asynchronous data path can fail visibly.
Routes have loading and error behavior where appropriate.
Database errors do not produce endless loading.
External fetches use explicit timeouts.
Mutations prevent duplicate submission.
Errors are logged server-side.
User-facing errors do not expose SQL or secrets.
Queries do not fetch excessive data.
Pagination or limits exist where data can grow.
```

Search for:

```txt
Unbounded Promise waits.
Sequential queries that could safely run in parallel.
Accidental database calls during static generation.
Database initialization in multiple modules.
Client-side access to DATABASE_URL.
Raw console.log statements.
Catch blocks that swallow errors.
Infinite loading spinners.
Retries without a maximum.
```

## Next.js Instrumentation

Inspect whether the project contains:

```txt
src/instrumentation.ts
instrumentation.ts
```

If observability is missing, propose:

```txt
Next.js instrumentation.
OpenTelemetry when justified.
Core Web Vitals reporting.
Vercel Speed Insights.
Structured server logs.
```

Do not add observability dependencies without approval.

## Core Web Vitals

Review:

```txt
LCP.
INP.
CLS.
TTFB.
```

Use existing Vercel Speed Insights or `useReportWebVitals` if already configured.

Do not confuse frontend Web Vitals with database latency.

# Phase 4 — Database Client Audit

Inspect `src/lib/db/index.ts`.

Verify:

```txt
DATABASE_URL is server-only.
Transaction Pooler is used for Vercel runtime when appropriate.
Runtime URL uses port 6543.
postgres.js has prepare: false in transaction mode.
The client is not recreated unnecessarily during development hot reload.
The client pool is intentionally limited.
connect_timeout is finite.
idle_timeout is finite when appropriate.
max_lifetime is intentional.
application_name identifies Finance Tracker.
```

Do not print the connection URL.

Safe connection inspection may print only:

```txt
Host.
Port.
Username without password.
Whether it is a pooler host.
```

Do not automatically increase the local client `max` value.

For the current single-user MVP, start with a low connection count and increase only from measured evidence.

## Connection Failure Classification

Recognize at least:

```txt
EMAXCONNSESSION.
Max client connections reached.
CONNECT_TIMEOUT.
ECONNRESET.
Connection terminated unexpectedly.
Prepared statement already exists.
Statement timeout.
Lock timeout.
Too many clients.
Remaining connection slots are reserved.
```

Classify errors into:

```txt
db.connection.exhausted
db.connection.timeout
db.connection.reset
db.prepared_statement.invalid
db.query.timeout
db.query.blocked
db.query.failed
```

# Phase 5 — Supabase Diagnostics

Use the Supabase Dashboard and safe SQL diagnostics.

Review:

```txt
Database → Observability.
Database → Query Performance.
Database → Performance Advisor.
Database → Security Advisor.
Supavisor connection metrics.
Postgres connection metrics.
```

## Live Postgres Connections

Safe read-only query:

```sql
select
  application_name,
  usename,
  state,
  count(*) as connection_count,
  min(backend_start) as oldest_connection
from pg_stat_activity
where datname = current_database()
group by application_name, usename, state
order by connection_count desc;
```

Finance Tracker-specific connections:

```sql
select
  pid,
  application_name,
  usename,
  state,
  backend_start,
  state_change,
  wait_event_type,
  wait_event
from pg_stat_activity
where application_name = 'finance-tracker'
order by backend_start;
```

Do not terminate connections without approval.

## Long-Running Queries

```sql
select
  pid,
  application_name,
  state,
  wait_event_type,
  wait_event,
  now() - query_start as duration
from pg_stat_activity
where state <> 'idle'
  and query_start is not null
  and now() - query_start > interval '2 seconds'
order by duration desc;
```

Do not include raw query text in a public report unless required and sanitized.

## Idle-in-Transaction Sessions

```sql
select
  pid,
  application_name,
  usename,
  state,
  now() - state_change as idle_duration
from pg_stat_activity
where state = 'idle in transaction'
order by idle_duration desc;
```

Any persistent `idle in transaction` session is high priority.

## Query Performance

Use `pg_stat_statements`.

Start with metadata rather than full SQL text:

```sql
select
  queryid,
  calls,
  rows,
  round(mean_exec_time::numeric, 2) as mean_exec_time_ms,
  round(max_exec_time::numeric, 2) as max_exec_time_ms,
  round(total_exec_time::numeric, 2) as total_exec_time_ms
from pg_stat_statements
where calls > 0
order by total_exec_time desc
limit 20;
```

Review separately:

```txt
Highest total execution time.
Highest mean execution time.
Highest call count.
Highest rows returned.
```

Do not optimize only by average duration. A frequently called small query may create more total load than one occasional slow query.

## Query Plans

In production:

```txt
Use EXPLAIN without ANALYZE by default.
Use EXPLAIN ANALYZE only after explicit approval.
Use only read-only SELECT queries.
Do not run plans during active incidents unless safe.
```

Check:

```txt
Sequential scans on growing tables.
Missing indexes on filter columns.
Expensive sorts.
Incorrect join order.
Rows estimated versus rows returned.
Repeated queries that could be combined.
```

Do not add indexes blindly. Indexes have write and storage costs.

# Phase 6 — Health Endpoint Design

Audit whether health endpoints already exist.

Recommended contracts:

```txt
GET /api/health/live
GET /api/health/ready
```

## Liveness

`/api/health/live` should:

```txt
Confirm the Next.js instance can respond.
Not query the database.
Return quickly.
Return 200 when the process is alive.
Use Cache-Control: no-store.
Expose no secrets.
```

Example body:

```json
{
  "status": "ok"
}
```

## Readiness

`/api/health/ready` should:

```txt
Run a minimal database readiness query such as SELECT 1.
Use a strict database timeout.
Return 200 when ready.
Return 503 when the database is unavailable.
Use Cache-Control: no-store.
Expose no SQL, host, credentials, stack trace, or internal schema.
```

Example success:

```json
{
  "status": "ready",
  "database": "reachable"
}
```

Example failure:

```json
{
  "status": "unavailable",
  "database": "unreachable"
}
```

Recommended readiness timeout:

```txt
2000ms to 3000ms.
```

Do not create health endpoints until the user approves the design.

Do not expose detailed diagnostics publicly.

# Phase 7 — Structured Logging

Prefer structured JSON logs.

Required fields:

```txt
timestamp
level
event
environment
route
operation
durationMs
status
correlationId
errorName
errorCode
```

Optional fields:

```txt
deploymentId
requestId
resultCount
databaseOperation
```

Never log:

```txt
DATABASE_URL
Password
Authorization header
Cookie header
Session token
Full request body
Transaction notes
Sensitive financial values
Raw query parameters
```

Recommended event taxonomy:

```txt
http.request.started
http.request.completed
http.request.failed

db.query.started
db.query.completed
db.query.slow
db.query.failed

db.connection.exhausted
db.connection.timeout
db.connection.reset

dashboard.load.completed
dashboard.load.failed

transaction.create.completed
transaction.create.failed
```

Use correlation IDs to follow one request through:

```txt
Route.
Server Component.
Query function.
Database operation.
Final response.
```

Do not generate unrelated IDs at every layer.

Reuse an incoming request ID when available or generate one at the boundary.

# Phase 8 — Vercel Diagnostics

Inspect:

```txt
Vercel Runtime Logs.
Vercel Observability.
Function duration.
5xx rates.
Route latency.
Cold-start patterns.
Speed Insights.
Deployment differences.
```

If Vercel CLI is authenticated:

```txt
Check `vercel logs --help` before using the CLI.
Use read-only log commands.
Do not expose log output containing secrets.
```

Correlate:

```txt
Production request time.
Vercel function duration.
Application query duration.
Supabase query duration.
```

Interpretation examples:

```txt
High total time + low server duration:
Network, redirect, client rendering, or asset issue.

High server duration + high DB duration:
Database or connection issue.

High server duration + low DB duration:
Application computation or sequential work.

Fast HTTP 200 + empty UI:
Client rendering, hydration, or data-state bug.

Intermittent 5xx + EMAXCONNSESSION:
Connection pool exhaustion.
```

# Phase 9 — Controlled Authenticated E2E Tests

Only after approval and with a disposable test account.

Test:

```txt
Login.
Dashboard load.
Transaction list load.
Transaction creation with test marker.
Transaction editing.
Transaction deletion and cleanup.
Logout.
Unauthorized redirect after logout.
```

Test data must use a recognizable marker:

```txt
E2E_TEST_<timestamp>
```

Cleanup must be verified.

If cleanup fails:

```txt
Stop.
Report the leftover record.
Do not continue creating test records.
```

Do not run authenticated mutation tests against Julio’s primary production data.

# Phase 10 — Controlled Load Testing

Never start this phase without explicit approval.

Default allowed test after approval:

```txt
Read-only route.
1 request per second.
Maximum duration: 30 seconds.
Maximum concurrency: 1.
```

Increase concurrency only after reviewing:

```txt
Current Supabase connection usage.
Current Vercel limits.
Current error rate.
Current p95 latency.
```

Stop immediately if:

```txt
Any unexpected 5xx appears.
Latency exceeds 5 seconds repeatedly.
Supabase connection errors appear.
Rate limits appear.
Authenticated data becomes inconsistent.
```

Do not install k6, Artillery, autocannon, or another tool without approval.

# Timeout and Retry Review

Every external dependency should have a finite wait.

Review:

```txt
Database connection timeout.
Database statement timeout.
External fetch timeout.
Login timeout.
Client request timeout.
```

Retries are allowed only when:

```txt
The operation is idempotent.
The error is plausibly transient.
Retry count is bounded.
Backoff is used.
The retry is logged.
```

Default retry limit:

```txt
0 for mutations unless idempotency exists.
1 retry for selected safe reads after a transient connection error.
```

Do not retry:

```txt
Validation errors.
Authentication failures.
Permission failures.
Deterministic SQL errors.
INSERT/UPDATE/DELETE without idempotency protection.
```

# UI Failure Behavior

A backend failure must not look like infinite loading.

Every data-dependent route should provide:

```txt
Loading state.
Error state.
Retry action where safe.
Correlation/reference ID where useful.
No raw internal details.
```

Good user-facing copy:

```txt
No pudimos cargar los datos.
Intentá nuevamente en unos segundos.
```

Do not show:

```txt
SQL.
Database host.
Stack trace.
Postgres error details.
DATABASE_URL.
```

# Report Format

After every audit or test, return:

```md
# Finance Tracker Reliability Report

## Executive Summary

- Overall status:
- Production availability:
- Database status:
- Highest-risk issue:
- Recommended next action:

## Test Environment

- Timestamp:
- Production URL:
- Authentication mode:
- Sample count:
- Test origin:
- Git revision/deployment if known:

## Route Results

| Route | Expected | Status | Redirect | p50 | p95 | Max | Errors |
| ----- | -------- | ------ | -------- | --- | --- | --- | ------ |

## Database Results

| Check | Result | Evidence | Severity |
| ----- | ------ | -------- | -------- |

## Connection Pool

| Metric | Result |
| ------ | ------ |

## Slow Queries

| Query ID/Operation | Calls | Mean | Max | Recommendation |
| ------------------ | ----- | ---- | --- | -------------- |

## Logs and Traces

| Event | Evidence | Gap |
| ----- | -------- | --- |

## Findings

### Critical

### High

### Medium

### Low

## Recommended Fixes

| Priority | Fix | Expected Impact | Risk | Approval Required |
| -------- | --- | --------------- | ---- | ----------------- |

## Not Tested

List everything that could not be verified.

## Approval Gate

State the exact next phase and wait for approval when required.
```

# Implementation Rules

When fixes are approved:

1. Keep changes focused.
2. Do not refactor unrelated features.
3. Add tests for the failure mode.
4. Preserve finance-domain behavior.
5. Run relevant unit tests.
6. Run lint.
7. Run build.
8. Run production smoke tests only after deployment.
9. Compare before-and-after latency.
10. Report regressions honestly.

# Validation Commands

Inspect `package.json` before running commands.

Common commands:

```powershell
pnpm test
pnpm lint
pnpm build
```

Do not invent missing scripts silently.

Do not run:

```powershell
pnpm db:migrate
pnpm db:seed
pnpm db:push
```

during a reliability audit unless explicitly required and approved.

# Approval Required Before

Ask before:

```txt
Editing production connection settings.
Increasing connection pool size.
Adding or changing database indexes.
Adding health routes.
Adding observability dependencies.
Adding OpenTelemetry exporters.
Adding Speed Insights packages.
Adding Sentry or another provider.
Adding Playwright or load-test tools.
Running authenticated production mutations.
Running concurrent production requests.
Running EXPLAIN ANALYZE in production.
Terminating database connections.
Changing statement_timeout globally.
Changing Vercel or Supabase plan settings.
```

# Definition of Done

A reliability task is complete only when:

```txt
The failure mode is identified or clearly bounded.
The evidence is recorded.
Production availability is measured.
Important routes have status and latency results.
No test hung indefinitely.
Database pool behavior is understood.
Slow queries are identified or ruled out.
Logs contain enough context to diagnose recurrence.
The UI does not remain in infinite loading after failure.
Tests, lint, and build pass when code changes were made.
Before-and-after results are compared.
Unverified areas are explicitly listed.
No secrets or real financial data were exposed.
```

# Invocation Examples

## Production audit only

```txt
Use the $finance-tracker-reliability-observability skill.

Run Phase 0, Phase 1, and Phase 2 against:
https://finance-tracker-chi-self.vercel.app/

Do not modify files.
Do not authenticate.
Do not run concurrent requests.
Return the reliability report and wait for approval.
```

## Database connection investigation

```txt
Use the $finance-tracker-reliability-observability skill.

Investigate intermittent data-loading failures and database connection exhaustion.

Audit the Next.js database client, Supabase pool mode, connection limits, logs, and relevant query functions.

Do not change code yet.
Return evidence and a prioritized remediation plan.
```

## Full approved diagnosis

```txt
Use the $finance-tracker-reliability-observability skill.

Run the approved reliability workflow through Phase 8.

Production tests must remain read-only and sequential.
Do not run authenticated mutations or load tests.
Do not modify files until the diagnostic report is complete.
```
