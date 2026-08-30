# A cable between two different racks is listed in the schedule even though the overlay cannot draw it — `TestCrossRackCableListedWithoutOverlay` — fails if a cable disappears from the schedule because its ends are not both on the visible face.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-6 (Port-to-port connections)
Plan: Task 16: Port picker, cable overlay and cable schedule
Test: `TestCrossRackCableListedWithoutOverlay`

The home-lab owner needs this to hold: a cable between two different racks is listed in the schedule even though the overlay cannot draw it.

Done when `TestCrossRackCableListedWithoutOverlay` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] A cable between two different racks is listed in the schedule even though the overlay cannot draw it — `TestCrossRackCableListedWithoutOverlay` — fails if a cable disappears from the schedule because its ends are not both on the visible face.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

