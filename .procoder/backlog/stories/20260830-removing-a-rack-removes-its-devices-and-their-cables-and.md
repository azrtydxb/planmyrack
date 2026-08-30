# Removing a rack removes its devices and their cables, and undo restores all three — `TestRemoveRackCascadesAndUndoes` — fails if a removed rack leaves orphan devices or links behind, or undo restores the rack without its contents.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-1 (Rack workspace)
Plan: Task 6: Undo and redo
Test: `TestRemoveRackCascadesAndUndoes`

The home-lab owner needs this to hold: removing a rack removes its devices and their cables, and undo restores all three.

Done when `TestRemoveRackCascadesAndUndoes` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Removing a rack removes its devices and their cables, and undo restores all three — `TestRemoveRackCascadesAndUndoes` — fails if a removed rack leaves orphan devices or links behind, or undo restores the rack without its contents.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

