# Task 4: Placement and movement operations

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 4: Placement and movement operations)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 4: Placement and movement operations" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/core/src/errors.ts`, `packages/core/src/ops.ts`, `packages/core/src/index.ts` (re-
export), `packages/core/test/placement.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `packages/core/test/placement.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'addDevice'".
- [x] Implement `errors.ts` and the placement half of `ops.ts`. `moveDevice` resolves the target through `findFreeSlot` against the destination rack and face, and throws `PlacementError` rather than returning a partially applied layout. `updateRack` re-validates every device in the rack against the…
- [x] Run `npm test -w @planmyrack/core` — passes.
- [x] Run `procoder check`, then commit: `feat(core): device placement, movement and rack edits`.

## Evidence

- Tests first, then `errors.ts` and `ops.ts`; 24/24 core tests green.
- `TestDropFindsNearestFreeSlotElseRefuses` (a refused drop leaves the layout untouched; a drop
  on an occupied slot lands elsewhere and no two devices overlap),
  `TestMoveDeviceAcrossRackAndFaceKeepsLinks` (cables survive a cross-rack, cross-face move; a
  move with no room throws and the device keeps its old rack), `TestRemoveRackCascades`,
  `TestRackShrinkNeverStrands` (refuses a shrink that strands a device, allows one that does not).
- Only pruneLinks/portCapacity/portLink/otherEnd landed in links.ts here, since ops depends on
  pruning; connect/disconnect are Task 5. The placement tests build a literal Link rather than
  leaning on untested code.
- `npm run typecheck` exit 0, `procoder check` 0 blocking.
