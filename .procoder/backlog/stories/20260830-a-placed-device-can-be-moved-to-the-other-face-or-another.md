# A placed device can be moved to the other face or another rack with its cables intact — `TestMoveDeviceAcrossRackAndFaceKeepsLinks` — fails if a move drops links or leaves the device pointing at its previous rackId.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-2 (Placement and movement)
Plan: Task 4: Placement and movement operations
Test: `TestMoveDeviceAcrossRackAndFaceKeepsLinks`

The home-lab owner needs this to hold: a placed device can be moved to the other face or another rack with its cables intact.

Done when `TestMoveDeviceAcrossRackAndFaceKeepsLinks` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A placed device can be moved to the other face or another rack with its cables intact — `TestMoveDeviceAcrossRackAndFaceKeepsLinks` — fails if a move drops links or leaves the device pointing at its previous rackId.

## Evidence

- moveDevice across rack A -> B and front -> rear keeps the device's single cable; a move into a full 1U rack throws PlacementError and the device still reports its old rackId.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
