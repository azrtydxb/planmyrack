# Deleting a device removes its cables from the overlay and schedule with no entry left pointing at a missing device — `TestDeleteDevicePrunesLinks` — fails if any link endpoint references a deviceId absent from the layout.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-15 (Undo/redo and integrity)
Plan: Task 5: Connections — network ports and PDU outlets
Test: `TestDeleteDevicePrunesLinks`

The home-lab owner needs this to hold: deleting a device removes its cables from the overlay and schedule with no entry left pointing at a missing device.

Done when `TestDeleteDevicePrunesLinks` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Deleting a device removes its cables from the overlay and schedule with no entry left pointing at a missing device — `TestDeleteDevicePrunesLinks` — fails if any link endpoint references a deviceId absent from the layout.

## Evidence

- removeDevice('sw') leaves no link whose endpoints are not both present in devices.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
