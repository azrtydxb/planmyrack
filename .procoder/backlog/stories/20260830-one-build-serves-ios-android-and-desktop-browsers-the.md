# One build serves iOS, Android and desktop browsers; the inspector is a bottom sheet at phone widths and a side panel at wide widths — `TestInspectorLayoutByBreakpoint` — fails if a phone-width render produces the side panel variant.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-14 (Touch-first UI on every surface)
Plan: Task 15: Palette, inspector and responsive layout
Test: `TestInspectorLayoutByBreakpoint`

The home-lab owner needs this to hold: one build serves iOS, Android and desktop browsers; the inspector is a bottom sheet at phone widths and a side panel at wide widths.

Done when `TestInspectorLayoutByBreakpoint` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] One build serves iOS, Android and desktop browsers; the inspector is a bottom sheet at phone widths and a side panel at wide widths — `TestInspectorLayoutByBreakpoint` — fails if a phone-width render produces the side panel variant.

## Evidence

- `TestInspectorLayoutByBreakpoint`: bottom sheet below 700pt, side panel above, each excluding the other.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

