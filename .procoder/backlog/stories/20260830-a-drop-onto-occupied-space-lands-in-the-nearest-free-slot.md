# A drop onto occupied space lands in the nearest free slot that fits, and is refused without mutating the layout when the face is full — `TestDropFindsNearestFreeSlotElseRefuses` — fails if two devices on one face ever overlap, or a refused drop changes any device position.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-2 (Placement and movement)
Plan: Task 3: Geometry — snapping, collision, free-slot search, rack stats and Task 4: Placement and movement operations and Task 14: Touch placement, movement and canvas zoom
Test: `TestDropFindsNearestFreeSlotElseRefuses`

The home-lab owner needs this to hold: a drop onto occupied space lands in the nearest free slot that fits, and is refused without mutating the layout when the face is full.

Done when `TestDropFindsNearestFreeSlotElseRefuses` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A drop onto occupied space lands in the nearest free slot that fits, and is refused without mutating the layout when the face is full — `TestDropFindsNearestFreeSlotElseRefuses` — fails if two devices on one face ever overlap, or a refused drop changes any device position.

## Evidence

- `TestDropFindsNearestFreeSlotElseRefuses`: a drop on occupied space lands in the nearest free slot; a full face reports invalid and commits nothing.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

