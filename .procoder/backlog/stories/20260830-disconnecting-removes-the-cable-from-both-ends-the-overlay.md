# Disconnecting removes the cable from both ends, the overlay and the schedule — `TestDisconnectClearsBothEnds` — fails if the schedule or overlay still lists the removed cable.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-6 (Port-to-port connections)
Plan: Task 5: Connections — network ports and PDU outlets and Task 16: Port picker, cable overlay and cable schedule
Test: `TestDisconnectClearsBothEnds`

The home-lab owner needs this to hold: disconnecting removes the cable from both ends, the overlay and the schedule.

Done when `TestDisconnectClearsBothEnds` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Disconnecting removes the cable from both ends, the overlay and the schedule — `TestDisconnectClearsBothEnds` — fails if the schedule or overlay still lists the removed cable.

## Evidence

- `TestDisconnectClearsBothEnds`: disconnect leaves both ports free and removes the cable from overlay and schedule; the picker offers Disconnect on a connected port.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

