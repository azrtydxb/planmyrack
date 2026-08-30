# The number of ports drawn on a device always equals its configured port count, including 48 on a switch and 4 on a generic device — `TestPortCountRendersExactly` — fails if the rendered port count diverges from the device's ports value after a change.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-5 (Network ports on the device face)
Plan: Task 13: Rack canvas rendering
Test: `TestPortCountRendersExactly`

The home-lab owner needs this to hold: the number of ports drawn on a device always equals its configured port count, including 48 on a switch and 4 on a generic device.

Done when `TestPortCountRendersExactly` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] The number of ports drawn on a device always equals its configured port count, including 48 on a switch and 4 on a generic device — `TestPortCountRendersExactly` — fails if the rendered port count diverges from the device's ports value after a change.

## Evidence

- `TestPortCountRendersExactly`: 4, 24 and 48 ports drawn exactly, redrawn when the count changes, none on a blanking plate.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

