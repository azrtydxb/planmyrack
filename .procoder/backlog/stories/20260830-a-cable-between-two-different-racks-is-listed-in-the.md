# A cable between two different racks is listed in the schedule even though the overlay cannot draw it — `TestCrossRackCableListedWithoutOverlay` — fails if a cable disappears from the schedule because its ends are not both on the visible face.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

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

- [x] A cable between two different racks is listed in the schedule even though the overlay cannot draw it — `TestCrossRackCableListedWithoutOverlay` — fails if a cable disappears from the schedule because its ends are not both on the visible face.

## Evidence

- `TestCrossRackCableListedWithoutOverlay`: the overlay draws a same-rack cable, draws nothing when an end is in another rack or on the other face, and CableSchedule lists it regardless — the schedule is built from links, not from the overlay.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

