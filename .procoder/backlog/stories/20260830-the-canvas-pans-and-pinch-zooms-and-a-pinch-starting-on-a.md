# The canvas pans and pinch-zooms, and a pinch starting on a device zooms instead of dragging it — `TestPinchOverDeviceZoomsNotDrags` — fails if a two-finger gesture begun on a device changes that device's position.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-14 (Touch-first UI on every surface)
Plan: Task 14: Touch placement, movement and canvas zoom
Test: `TestPinchOverDeviceZoomsNotDrags`

The home-lab owner needs this to hold: the canvas pans and pinch-zooms, and a pinch starting on a device zooms instead of dragging it.

Done when `TestPinchOverDeviceZoomsNotDrags` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] The canvas pans and pinch-zooms, and a pinch starting on a device zooms instead of dragging it — `TestPinchOverDeviceZoomsNotDrags` — fails if a two-finger gesture begun on a device changes that device's position.

## Evidence

- `TestPinchOverDeviceZoomsNotDrags`: a real pinch fired over a device through getByGestureTestId zooms the canvas and never changes the layout.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

