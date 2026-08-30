# Deleting a device removes its cables from the overlay and schedule with no entry left pointing at a missing device — `TestDeleteDevicePrunesLinks` — fails if any link endpoint references a deviceId absent from the layout.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-15 (Undo/redo and integrity)
Plan: Task 5: Connections — network ports and PDU outlets
Test: `TestDeleteDevicePrunesLinks`

The home-lab owner needs this to hold: deleting a device removes its cables from the overlay and schedule with no entry left pointing at a missing device.

Done when `TestDeleteDevicePrunesLinks` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Deleting a device removes its cables from the overlay and schedule with no entry left pointing at a missing device — `TestDeleteDevicePrunesLinks` — fails if any link endpoint references a deviceId absent from the layout.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

