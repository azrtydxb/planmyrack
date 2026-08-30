# Task 16: Port picker, cable overlay and cable schedule

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 16: Port picker, cable overlay and cable schedule)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 16: Port picker, cable overlay and cable schedule" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/src/ui/PortPicker.tsx`, `apps/app/src/canvas/CableOverlay.tsx`,
`apps/app/src/ui/CableSchedule.tsx`, `apps/app/src/canvas/cablePath.ts`,
`apps/app/test/cables.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `apps/app/test/cables.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/ui/PortPicker'".
- [x] Implement `cablePath`, `CableOverlay` (measuring port centres from `portRects` and `deviceRect` rather than from the DOM, so it works on native), `PortPicker` (grouped by device, taken ports disabled with the peer's name, `Disconnect` shown when the tapped port already has a link, and…
- [x] Run `npm test -w planmyrack` — passes.
- [x] Run `procoder check`, then commit: `feat(app): port picker, cable overlay and cable schedule`.

## Evidence

- `TestConnectFreePorts`, `TestPickerBlocksTakenPorts` (a taken port is disabled AND its
  accessibility label names what holds it) and `TestDisconnectClearsBothEnds` through the picker.
- `TestCrossRackCableListedWithoutOverlay` proves the split that matters: the overlay draws a
  same-rack cable, draws nothing for one whose far end is in another rack or on the other face,
  and the schedule lists it either way. The schedule is built from the links, not from the
  overlay, which is why a cable cannot vanish by being undrawable.
- `TestCableMetadataFlowsToScheduleAndCsv`: label and cable type appear in the row.
- The overlay computes port centres from the same pure metrics the canvas uses rather than
  measuring the DOM, so it works on native as well as web.
- 50 app tests, typecheck clean.
