# A layout holds several racks side by side with independent widths (19"/10") and unit counts from presets or a typed 1-48 value — `TestLayoutHoldsMixedWidthRacks` — fails if a layout is capped at one rack, or a 10" rack renders at 19" width.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-1 (Rack workspace)
Plan: Task 13: Rack canvas rendering
Test: `TestLayoutHoldsMixedWidthRacks`

The home-lab owner needs this to hold: a layout holds several racks side by side with independent widths (19"/10") and unit counts from presets or a typed 1-48 value.

Done when `TestLayoutHoldsMixedWidthRacks` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A layout holds several racks side by side with independent widths (19"/10") and unit counts from presets or a typed 1-48 value — `TestLayoutHoldsMixedWidthRacks` — fails if a layout is capped at one rack, or a 10" rack renders at 19" width.

## Evidence

- `TestLayoutHoldsMixedWidthRacks`: 19" and 10" racks render at different widths with their own U scales, numbered from 1 at the bottom.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

