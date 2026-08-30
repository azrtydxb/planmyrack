# A 48-port switch in a 1U slot draws every port within the device's bounds — `TestDensePortsStayInsideDevice` — fails if any port's rendered box escapes the device rectangle at default zoom.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-5 (Network ports on the device face)
Plan: Task 13: Rack canvas rendering
Test: `TestDensePortsStayInsideDevice`

The home-lab owner needs this to hold: a 48-port switch in a 1U slot draws every port within the device's bounds.

Done when `TestDensePortsStayInsideDevice` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A 48-port switch in a 1U slot draws every port within the device's bounds — `TestDensePortsStayInsideDevice` — fails if any port's rendered box escapes the device rectangle at default zoom.

## Evidence

- `TestDensePortsStayInsideDevice`: portRects keeps all 48 ports of a 1U switch inside the device box, wraps to two rows only when tall enough, and starts after the label gutter; verified visually in the browser on a UniFi Switch 24.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

