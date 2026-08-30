# Front and rear hold different devices in the same U space and are counted separately in the rack summary — `TestFacesAreIndependent` — fails if a device placed on the rear appears on the front, or the two faces' occupancy is summed together.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-1 (Rack workspace) · S-14 (Touch-first UI on every surface)
Plan: Task 3: Geometry — snapping, collision, free-slot search, rack stats
Test: `TestFacesAreIndependent`

The home-lab owner needs this to hold: front and rear hold different devices in the same U space and are counted separately in the rack summary.

Done when `TestFacesAreIndependent` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Front and rear hold different devices in the same U space and are counted separately in the rack summary — `TestFacesAreIndependent` — fails if a device placed on the rear appears on the front, or the two faces' occupancy is summed together.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

