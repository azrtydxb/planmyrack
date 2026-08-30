# A 2U palette item dropped on an empty rack lands at the half-U-snapped position under the pointer and spans exactly two units — `TestDropSnapsToHalfU` — fails if a drop resolves to a position that is not a multiple of 0.5U.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] A 2U palette item dropped on an empty rack lands at the half-U-snapped position under the pointer and spans exactly two units — `TestDropSnapsToHalfU` — fails if a drop resolves to a position that is not a multiple of 0.5U.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

