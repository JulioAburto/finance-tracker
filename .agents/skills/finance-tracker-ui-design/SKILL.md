## Mobile Responsive Excellence

Mobile responsiveness is a release requirement, not a visual enhancement.

A route is not considered complete until its core workflow works comfortably on a small phone without horizontal scrolling, hidden actions, clipped content, inaccessible controls, or keyboard obstruction.

## Mobile Quality Standard

Every route must satisfy:

```txt
No horizontal page scrolling at 320px width
No clipped money values, labels, chips, or actions
No hover-only interaction
No required action hidden inside an inaccessible menu
No fixed-width component that exceeds its container
No form action blocked by the virtual keyboard
No table used as the only mobile representation
No status communicated only by color
No content hidden without an equivalent accessible path
```

Responsive behavior must be intentional at component level. Do not rely only on a global breakpoint or `display: none`.

## Required Viewport Matrix

Review every affected route at these viewport widths:

```txt
320px: narrow mobile
360px: common Android mobile
390px: common modern mobile
412px: large Android mobile
768px: tablet portrait
1024px: tablet landscape / small desktop
```

Also review:

```txt
Mobile portrait
Mobile landscape
Browser zoom at 200%
Long Spanish labels
Large monetary values
Empty states
Loading states
Validation errors
Virtual keyboard open
```

Do not declare a responsive task complete after checking only one desktop browser emulation size.

## Breakpoint Contract

Use the existing MUI breakpoint system.

Expected progression:

```txt
xs:
Single-column content
Mobile navigation
Cards or compact lists
Full-width primary actions
Full-screen or near-full-screen dialogs

sm:
More horizontal breathing room
Two-column layouts only when each field remains readable
Compact summary grids

md:
Desktop-style navigation may appear
Tables may replace mobile cards when useful
Forms may use deliberate two-column grouping

lg and above:
Constrained content width
Multi-column dashboard sections
No uncontrolled stretching across wide screens
```

Do not create custom breakpoints unless the existing MUI breakpoints cannot express a real design requirement.

Avoid JavaScript viewport checks for layout when responsive MUI or CSS rules can solve the problem.

## Layout and Overflow Rules

Use fluid layouts.

Prefer:

```txt
width: 100%
max-width constraints
responsive padding
CSS grid with minmax where appropriate
flex wrapping
min-width: 0 on flex/grid children
overflow-wrap for long content
```

Avoid:

```txt
Fixed page widths
Fixed card widths
Fixed heights for variable content
Absolute positioning for core layout
Horizontal page overflow
Truncating essential financial information
```

Every flex or grid child containing money, labels, or actions must be able to shrink safely.

Long values such as:

```txt
C$1,234,567.89
Novia / salidas / regalos
Transferencia bancaria
```

must not break the layout.

Truncation is allowed only when the complete value remains available through an accessible detail view or tooltip that also works without hover.

## Mobile Page Spacing

Use consistent responsive spacing.

Recommended project direction:

```txt
Mobile horizontal page padding: 16px
Larger mobile/tablet padding: 20px–24px
Desktop padding: 24px–32px
Minimum vertical gap between major sections: 24px
Minimum gap between related controls: 12px–16px
```

Use MUI theme spacing instead of scattered hardcoded values.

Do not reduce spacing so aggressively that controls become difficult to scan or tap.

## Safe Areas and Mobile Viewport

Account for devices with notches, rounded corners, and bottom gesture areas.

When using fixed or sticky mobile elements, include safe-area spacing where relevant:

```css
padding-bottom: max(16px, env(safe-area-inset-bottom));
padding-left: max(16px, env(safe-area-inset-left));
padding-right: max(16px, env(safe-area-inset-right));
```

Prefer dynamic viewport units for full-height layouts:

```txt
100dvh
```

Do not depend only on `100vh` for screens affected by mobile browser chrome.

Sticky or fixed actions must not overlap:

```txt
Form fields
Snackbar messages
Bottom navigation
Mobile browser controls
Device gesture areas
```

## Touch Interaction Standard

Interactive targets should be comfortable for one-handed mobile use.

Project target:

```txt
Minimum preferred touch area: 44px × 44px
Minimum visible gap between adjacent icon actions: 8px
Primary mobile buttons: full width when practical
```

Apply this to:

```txt
Buttons
Icon buttons
Menu triggers
Delete/edit actions
Date controls
Select controls
Navigation items
Filter controls
```

Do not place multiple small icon-only actions next to each other without sufficient spacing and accessible labels.

Every icon-only button must have an accessible name.

Do not require hover to discover an action or explanation.

## Mobile Typography

Use fluid but controlled typography.

Rules:

```txt
Body text must remain comfortably readable.
Input text should be at least 16px on mobile.
Money values may scale responsively but must not overflow.
Page titles may wrap to two lines without breaking layout.
Secondary text must retain sufficient contrast.
```

Do not use very small text to force content into one line.

Do not reduce critical financial values below a comfortably readable size.

Use line clamping only for non-essential descriptive content.

## Mobile Navigation

The active route and primary action must remain obvious.

For mobile, choose one clear pattern:

```txt
Compact top app bar with accessible menu
Bottom navigation for the most important routes
Top app bar plus prominent page-level primary action
```

Do not combine several competing navigation patterns.

If bottom navigation is used:

```txt
Keep the number of primary destinations limited.
Respect the bottom safe area.
Do not cover page content.
Keep Agregar gasto visually prominent.
Provide accessible text labels.
```

If a drawer is used:

```txt
Close it after navigation.
Trap focus correctly.
Restore focus to the menu trigger.
Keep all route labels visible.
```

The user must reach `Agregar gasto` with at most one clear interaction from any primary route.

## Dashboard Mobile Contract

The first mobile viewport should prioritize:

```txt
Current month
Primary financial state
Most important amount
Agregar gasto
Critical alert when one exists
```

Do not place six equal summary cards before the first actionable information.

Mobile dashboard rules:

```txt
Use one primary financial-health card.
Show secondary metrics in a compact grid or horizontally scrollable region only if scrolling is obvious and non-essential.
Place critical alerts before healthy category detail.
Use stacked category cards.
Collapse secondary explanations when necessary.
Keep amounts and status labels visible.
```

Avoid:

```txt
Dense desktop card grids compressed into mobile
Four tiny cards in one row
Charts that require horizontal scrolling
Repeated headings that consume the first viewport
```

## Transaction Form Mobile Contract

The transaction form must be optimized for one-handed, fast daily entry.

Mobile field order:

```txt
1. Monto
2. Moneda
3. Nombre o comercio
4. Categoría
5. Método de pago
6. Fecha
7. Tipo de transacción
8. Tasa de cambio when relevant
9. Nota opcional
```

Rules:

```txt
Use a single-column layout on mobile.
Use appropriate inputMode values for numeric and decimal fields.
Use native-friendly date input behavior where practical.
Keep labels visible; do not rely only on placeholders.
Keep validation messages next to their field.
Move focus to the first invalid field after failed submission when practical.
Preserve entered values after a server validation failure.
Disable duplicate submission.
Show a clear saving state.
```

The primary submit action should be:

```txt
Full width on mobile
Visually dominant
Reachable when the keyboard is open
Separated from destructive or secondary actions
```

A sticky submit area is allowed when:

```txt
It does not cover content.
It respects safe-area insets.
The complete form remains reachable.
It does not compete with bottom navigation.
```

Do not use two-column form layouts below the breakpoint where both controls remain comfortably readable.

## Virtual Keyboard Behavior

Test forms with the mobile keyboard open.

Verify:

```txt
Focused fields remain visible.
The page can scroll to every field.
The submit action remains reachable.
Validation errors are not hidden behind the keyboard.
Sticky elements do not create overlapping layers.
Numeric fields open an appropriate keyboard when possible.
```

Do not lock the page height in a way that prevents scrolling while the keyboard is open.

Avoid automatic focus that unexpectedly opens the keyboard on initial page load unless the workflow clearly benefits from it.

## Mobile Transaction List Contract

Do not compress the desktop table into an unreadable mobile table.

Use a mobile-specific card or compact-list representation showing:

```txt
Merchant or transaction name
Primary amount
Date
Category
Payment method
Transaction type or status
Edit/delete action
```

Information priority:

```txt
1. Name
2. Amount
3. Category/status
4. Date
5. Payment method
6. Secondary converted amount
```

Secondary information may be placed in:

```txt
A details row
Expandable content
A transaction detail view
```

Do not hide category, amount, or transaction status merely to fit the screen.

Filtering on mobile should use:

```txt
A compact filter summary
A Drawer or bottom sheet
Clear Apply and Clear actions
Visible active-filter count
```

Do not render a long desktop filter toolbar squeezed into one row.

## Categories, Rules, and Settings on Mobile

Management routes should use cards or compact rows.

Each mobile item should keep:

```txt
Primary name or pattern
Most important value
Current status
One obvious edit action
```

Move secondary actions into an accessible overflow menu only when their meaning remains clear.

For create/edit flows:

```txt
Use full-screen dialogs on small screens when the form is long.
Use normal dialogs on larger breakpoints.
Keep dialog title and actions visible.
Allow content scrolling inside the dialog.
Prevent actions from being hidden by the keyboard.
```

Do not fit desktop management tables into mobile through horizontal scrolling as the default solution.

## Mobile Dialogs, Drawers, and Menus

Responsive overlays must follow these rules:

```txt
Long forms: full-screen dialog on small screens
Filters: bottom drawer or full-screen dialog
Confirmation: compact modal dialog
Navigation: side drawer or bottom navigation
```

All overlays must:

```txt
Have a visible title
Have a clear close action
Trap keyboard focus correctly
Restore focus when closed
Allow internal scrolling
Respect safe areas
Avoid nested modal layers
```

Do not open a dialog from inside another dialog unless there is no simpler interaction.

## Responsive Content Priority

Responsive design is not only resizing.

At smaller widths:

```txt
Keep primary financial information.
Keep the main action.
Keep status and recommendation.
Reduce decorative content.
Move secondary metadata into detail views.
Shorten helper copy without changing meaning.
```

Do not remove essential finance context to make a layout fit.

When mobile and desktop need structurally different representations, share the same data and domain logic but allow separate presentation components.

## Performance and Visual Stability

Mobile UI should remain responsive on mid-range devices.

Rules:

```txt
Avoid unnecessary client components.
Avoid heavy visual effects.
Avoid layout shifts from unknown card heights.
Reserve space for loading content where practical.
Use Skeleton dimensions close to final content.
Avoid rendering both heavy desktop and mobile representations when one can be hidden efficiently.
```

Do not introduce new performance-heavy dependencies to solve responsive layout.

Respect reduced-motion preferences if motion already exists.

## Mobile Testing Workflow

For every responsive UI task:

1. Inventory the affected routes and components.
2. Check the narrowest required viewport first.
3. Test normal, long, empty, loading, and error content.
4. Test with the virtual keyboard open for forms.
5. Test portrait and landscape.
6. Test touch-target spacing.
7. Verify no horizontal page overflow.
8. Verify navigation and primary actions.
9. Verify dialogs, drawers, and menus.
10. Run lint, tests, and build commands available in `package.json`.

If browser automation already exists, add focused responsive coverage.

Do not add Playwright, Cypress, or another browser-testing framework without approval.

## Responsive Audit Report

When auditing mobile behavior, report:

```md
| Route | 320px | 360px | 390px | 768px | Main issue | Priority |
| ----- | ----- | ----- | ----- | ----- | ---------- | -------- |
```

For each issue include:

```txt
Affected component
Failure mode
Viewport where it occurs
User impact
Recommended change
Whether the fix changes behavior or only presentation
```

Do not report “responsive: good” without listing the viewports and states reviewed.

## Mobile Definition of Done

A responsive route is complete only when:

```txt
It works from 320px upward.
It has no horizontal page scrolling.
Primary actions remain visible and reachable.
Touch targets are comfortable.
Text and money values do not overflow.
Forms work with the virtual keyboard.
Mobile navigation is clear.
Tables have a deliberate mobile representation.
Dialogs and drawers work on small screens.
Safe-area insets are respected where relevant.
Status remains understandable without color.
Empty, loading, error, and long-content states work.
No required workflow depends on hover.
No desktop functionality is silently lost on mobile.
```

## Mobile Anti-Patterns

Do not:

```txt
Shrink desktop UI until it technically fits.
Hide essential columns without an alternative.
Use horizontal page scrolling as the main solution.
Use fixed viewport heights for forms.
Place fixed buttons over content.
Use tiny icon-only controls.
Depend on hover tooltips.
Render four or more tiny dashboard cards in one mobile row.
Use a desktop dialog for a long mobile form.
Let the virtual keyboard cover required actions.
Use JavaScript viewport checks when CSS/MUI responsiveness is sufficient.
Mark a route responsive without testing 320px and long content.
```
