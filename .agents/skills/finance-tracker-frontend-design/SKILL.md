---
name: finance-tracker-frontend-design
description: Create or refine distinctive, production-grade MUI interfaces for Finance Tracker. Use when designing or materially restyling app routes, dashboards, forms, management screens, empty/loading/error states, or shared visual components; choose a deliberate design direction while preserving the finance domain, Next.js App Router conventions, accessibility, and existing responsive behavior.
---

# Finance Tracker Frontend Design

Create an operational finance interface with a deliberate visual point of view. Help a single person scan spending, act on a budget, and record a transaction quickly. Do not turn the app into a marketing site or invent financial data.

## Before Designing

1. Read `docs/MVP.md`, `docs/PROJECT_CONTEXT.md`, and the affected route and shared components.
2. State the route user, one primary job, and the financial decision it supports.
3. Preserve existing information architecture, domain rules, server/client boundaries, and MUI integration unless the task explicitly changes them.
4. For layout work, read `../finance-tracker-ui-design/SKILL.md` and satisfy its responsive audit requirements.

## Two-Pass Direction

Before implementation, create a compact internal direction with:

- Subject: route, audience, and one job.
- Palette: four to six named colors, derived from or proposed for the centralized MUI theme.
- Typography: display, body, and data roles using existing local or system-safe fonts. Do not add remote font dependencies without approval.
- Layout: a short structural description or ASCII sketch of information priority.
- Signature: one functional visual element tied to the financial task, such as a budget decision panel, transaction-entry rhythm, or spending-state treatment.

Then critique the direction. Replace choices that could fit an unrelated generic SaaS dashboard. Avoid cream-and-terracotta defaults, near-black plus acid accents, and broadsheet layouts unless the request explicitly calls for them.

Spend boldness in one place. Keep the rest of an operational screen quiet, dense enough for repeated use, and easy to scan.

## Implementation Rules

- Use the existing MUI theme and components. Put shared tokens in `src/app/theme.ts`; do not scatter a new visual system across route files.
- Use Server Components by default. Add client components only for real interaction.
- Use actual financial state, labels, and actions. Do not add decorative charts, fake metrics, or marketing copy.
- Prefer a clear page hierarchy: current period, financial state, primary action, then supporting detail.
- Use cards only for repeated items, modal content, or genuinely bounded tools. Do not nest cards or make every page section a floating card.
- Keep border radii restrained and use existing spacing tokens. Avoid gradient orbs, bokeh, generic hero gradients, and decorative SVGs.
- Use an existing icon library when available. Do not add an icon or animation dependency without approval.
- Keep type stable and readable: no viewport-width font sizing, no negative letter spacing, and no tiny text used to force a line to fit.
- Make primary actions explicit and consistent with their result. Use clear Spanish product language such as `Guardar cambios`, `Agregar gasto`, or `Generar gastos recurrentes`.
- Treat empty, loading, validation, and error states as actionable guidance, not decoration.

## Interaction And Accessibility

- Preserve keyboard navigation, visible focus, semantic labels, and text labels for status; never communicate a financial state by color alone.
- Use a preferred 44px touch target and adequate gaps between adjacent controls.
- Do not rely on hover to expose a required action or explanation.
- Respect `prefers-reduced-motion`. Add motion only when it clarifies a state change or workflow.
- Keep money values, long Spanish labels, and status chips readable without clipping. Do not hide essential information merely to fit a breakpoint.

## Responsive And Visual Review

For layout work, check the affected workflow at 320, 360, 390, 412, 768, and 1024 pixels; include long monetary values, empty/loading/error states, portrait and landscape, 200% zoom, and the mobile keyboard for forms.

When browser access is available, inspect screenshots before finalizing. If it is unavailable, distinguish static code findings from unverified visual behavior.

## Validation And Handoff

1. Keep the diff limited to the visual task.
2. Run the smallest relevant test, then `pnpm lint` and `pnpm build` when reasonable.
3. Review the diff for unintended style changes and secrets.
4. Report the chosen direction, files changed, validation, and remaining visual checks or risks.
