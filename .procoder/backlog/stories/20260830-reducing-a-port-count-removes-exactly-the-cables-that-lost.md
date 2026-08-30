# Reducing a port count removes exactly the cables that lost their port, and undo restores them — `TestPortReductionPrunesExactLinks` — fails if a surviving link points at an index beyond the new count, or an unaffected link is removed.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-15 (Undo/redo and integrity)
Plan: Task 5: Connections — network ports and PDU outlets
Test: `TestPortReductionPrunesExactLinks`

The home-lab owner needs this to hold: reducing a port count removes exactly the cables that lost their port, and undo restores them.

Done when `TestPortReductionPrunesExactLinks` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Reducing a port count removes exactly the cables that lost their port, and undo restores them — `TestPortReductionPrunesExactLinks` — fails if a surviving link points at an index beyond the new count, or an unaffected link is removed.

## Evidence

- with cables on switch ports 0 and 5, updateDevice(ports: 1) leaves exactly the port-0 cable; changing the type to blank clamps ports to 0 and drops both.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
