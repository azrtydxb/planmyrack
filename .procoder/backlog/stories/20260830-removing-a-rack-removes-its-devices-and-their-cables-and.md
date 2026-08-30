# Removing a rack removes its devices and their cables, and undo restores all three — `TestRemoveRackCascadesAndUndoes` — fails if a removed rack leaves orphan devices or links behind, or undo restores the rack without its contents.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-1 (Rack workspace)
Plan: Task 6: Undo and redo
Test: `TestRemoveRackCascadesAndUndoes`

The home-lab owner needs this to hold: removing a rack removes its devices and their cables, and undo restores all three.

Done when `TestRemoveRackCascadesAndUndoes` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Removing a rack removes its devices and their cables, and undo restores all three — `TestRemoveRackCascadesAndUndoes` — fails if a removed rack leaves orphan devices or links behind, or undo restores the rack without its contents.

## Evidence

- removeRack takes the rack, its devices and their cables; a single undo restores a layout deep-equal to the original.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
