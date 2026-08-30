# A device's power inlet connects to one PDU outlet, which then refuses a second device — `TestPduOutletSingleOccupancy` — fails if two power links resolve to the same outlet index.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-7 (Power)
Plan: Task 5: Connections — network ports and PDU outlets
Test: `TestPduOutletSingleOccupancy`

The home-lab owner needs this to hold: a device's power inlet connects to one PDU outlet, which then refuses a second device.

Done when `TestPduOutletSingleOccupancy` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] A device's power inlet connects to one PDU outlet, which then refuses a second device — `TestPduOutletSingleOccupancy` — fails if two power links resolve to the same outlet index.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

