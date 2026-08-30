# Hooks and brush cable management are placeable at 0.5U and 1U and render distinguishably from each other and from a blank panel — `TestCableManagementFlavoursRender` — fails if the hooks and brush snapshots are identical, or either flavour is missing a size.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-4 (Special equipment types)
Plan: Task 13: Rack canvas rendering
Test: `TestCableManagementFlavoursRender`

The home-lab owner needs this to hold: hooks and brush cable management are placeable at 0.5U and 1U and render distinguishably from each other and from a blank panel.

Done when `TestCableManagementFlavoursRender` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Hooks and brush cable management are placeable at 0.5U and 1U and render distinguishably from each other and from a blank panel — `TestCableManagementFlavoursRender` — fails if the hooks and brush snapshots are identical, or either flavour is missing a size.

## Evidence

- `TestCableManagementFlavoursRender`: hooks, brush and blank produce different rendered trees, and both flavours exist at 0.5U and 1U.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

