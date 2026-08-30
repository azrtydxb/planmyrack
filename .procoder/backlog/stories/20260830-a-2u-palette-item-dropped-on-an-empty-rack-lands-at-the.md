# A 2U palette item dropped on an empty rack lands at the half-U-snapped position under the pointer and spans exactly two units — `TestDropSnapsToHalfU` — fails if a drop resolves to a position that is not a multiple of 0.5U.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-2 (Placement and movement)
Plan: Task 3: Geometry — snapping, collision, free-slot search, rack stats and Task 14: Touch placement, movement and canvas zoom
Test: `TestDropSnapsToHalfU`

The home-lab owner needs this to hold: a 2U palette item dropped on an empty rack lands at the half-U-snapped position under the pointer and spans exactly two units.

Done when `TestDropSnapsToHalfU` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A 2U palette item dropped on an empty rack lands at the half-U-snapped position under the pointer and spans exactly two units — `TestDropSnapsToHalfU` — fails if a drop resolves to a position that is not a multiple of 0.5U.

## Evidence

- `TestDropSnapsToHalfU`: positionFromPoint centres a 2U device on the finger at the half unit (7.5 for a pointer 3.3U down a 12U rack) and clamps at both ends; useDragPlacement commits the snapped position.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

