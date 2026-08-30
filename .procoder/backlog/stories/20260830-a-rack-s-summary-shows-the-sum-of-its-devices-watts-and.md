# A rack's summary shows the sum of its devices' watts and updates when a value changes — `TestRackWattsSum` — fails if a device's watts are omitted from its rack total.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] A rack's summary shows the sum of its devices' watts and updates when a value changes — `TestRackWattsSum` — fails if a device's watts are omitted from its rack total.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

