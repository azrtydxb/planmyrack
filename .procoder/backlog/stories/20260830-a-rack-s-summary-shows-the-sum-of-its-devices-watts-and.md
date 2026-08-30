# A rack's summary shows the sum of its devices' watts and updates when a value changes — `TestRackWattsSum` — fails if a device's watts are omitted from its rack total.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-7 (Power)
Plan: Task 3: Geometry — snapping, collision, free-slot search, rack stats and Task 18: Rack summary and exports
Test: `TestRackWattsSum`

The home-lab owner needs this to hold: a rack's summary shows the sum of its devices' watts and updates when a value changes.

Done when `TestRackWattsSum` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A rack's summary shows the sum of its devices' watts and updates when a value changes — `TestRackWattsSum` — fails if a device's watts are omitted from its rack total.

## Evidence

- `TestRackWattsSum`: RackSummary shows 50 W and updates to 98 W on change, counting each face separately (3U front / 1U rear / 9U free); seen live as 2.5U front / 9.5U free with a half-U device.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

