# The canvas pans and pinch-zooms, and a pinch starting on a device zooms instead of dragging it — `TestPinchOverDeviceZoomsNotDrags` — fails if a two-finger gesture begun on a device changes that device's position.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] The canvas pans and pinch-zooms, and a pinch starting on a device zooms instead of dragging it — `TestPinchOverDeviceZoomsNotDrags` — fails if a two-finger gesture begun on a device changes that device's position.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

