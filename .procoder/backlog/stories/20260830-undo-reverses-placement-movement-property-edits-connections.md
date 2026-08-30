# Undo reverses placement, movement, property edits, connections and deletions, and redo reapplies them — `TestUndoRedoCoversAllEditKinds` — fails if any edit kind leaves the undo stack unchanged.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-15 (Undo/redo and integrity)
Plan: Task 6: Undo and redo
Test: `TestUndoRedoCoversAllEditKinds`

The home-lab owner needs this to hold: undo reverses placement, movement, property edits, connections and deletions, and redo reapplies them.

Done when `TestUndoRedoCoversAllEditKinds` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Undo reverses placement, movement, property edits, connections and deletions, and redo reapplies them — `TestUndoRedoCoversAllEditKinds` — fails if any edit kind leaves the undo stack unchanged.

## Evidence

- it.each over place, move, edit, connect, disconnect, delete and remove-rack: each undoes to the original and redoes to the edited value; a no-op edit records no step; a new edit clears the redo trail.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
