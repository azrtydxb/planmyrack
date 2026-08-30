# A device's power inlet connects to one PDU outlet, which then refuses a second device — `TestPduOutletSingleOccupancy` — fails if two power links resolve to the same outlet index.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-7 (Power)
Plan: Task 5: Connections — network ports and PDU outlets
Test: `TestPduOutletSingleOccupancy`

The home-lab owner needs this to hold: a device's power inlet connects to one PDU outlet, which then refuses a second device.

Done when `TestPduOutletSingleOccupancy` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A device's power inlet connects to one PDU outlet, which then refuses a second device — `TestPduOutletSingleOccupancy` — fails if two power links resolve to the same outlet index.

## Evidence

- connect('power', pdu:3, nas:0) succeeds; a second connect to pdu:3 throws PortBusyError; power and network links are counted separately; a shelf is refused with code no-such-port because it has no inlet.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
