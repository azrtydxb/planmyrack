# Front and rear hold different devices in the same U space and are counted separately in the rack summary — `TestFacesAreIndependent` — fails if a device placed on the rear appears on the front, or the two faces' occupancy is summed together.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-1 (Rack workspace) · S-14 (Touch-first UI on every surface)
Plan: Task 3: Geometry — snapping, collision, free-slot search, rack stats
Test: `TestFacesAreIndependent`

The home-lab owner needs this to hold: front and rear hold different devices in the same U space and are counted separately in the rack summary.

Done when `TestFacesAreIndependent` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Front and rear hold different devices in the same U space and are counted separately in the rack summary — `TestFacesAreIndependent` — fails if a device placed on the rear appears on the front, or the two faces' occupancy is summed together.

## Evidence

- `npm test -w @planmyrack/core` — collides() returns false for the same units on the opposite face and true on the same face; rackStats reports unitsUsedFront 3 / unitsUsedRear 1 for a mixed rack and unitsFree from the fuller face.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
