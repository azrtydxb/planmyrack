# A drop onto occupied space lands in the nearest free slot that fits, and is refused without mutating the layout when the face is full — `TestDropFindsNearestFreeSlotElseRefuses` — fails if two devices on one face ever overlap, or a refused drop changes any device position.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] A drop onto occupied space lands in the nearest free slot that fits, and is refused without mutating the layout when the face is full — `TestDropFindsNearestFreeSlotElseRefuses` — fails if two devices on one face ever overlap, or a refused drop changes any device position.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

