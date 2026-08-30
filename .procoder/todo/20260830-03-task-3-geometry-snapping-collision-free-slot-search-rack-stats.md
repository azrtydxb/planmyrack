# Task 3: Geometry — snapping, collision, free-slot search, rack stats

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 3: Geometry — snapping, collision, free-slot search, rack stats)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 3: Geometry — snapping, collision, free-slot search, rack stats" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/core/src/geometry.ts`, `packages/core/src/index.ts` (re-export),
`packages/core/test/geometry.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `packages/core/test/geometry.test.ts` with a `mk(partial)` helper building a `Device` from `newDevice`-shaped defaults, covering: Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'snapHalfU'".
- [x] Implement `geometry.ts`. `collides` compares only devices sharing `rackId` and `face` and ignores `probe.id`; `findFreeSlot` clamps to `0..rack.units - heightU`, tries `probe.posU` first, then `±0.5, ±1.0, …` up to `rack.units`, returning the first collision-free snapped position; `unitsFree` is…
- [x] Run `npm test -w @planmyrack/core` — passes.
- [x] Run `procoder check`, then commit: `feat(core): rack geometry, collision and free-slot search`.

## Evidence

- Tests written first: `TypeError: (0 , snapHalfU) is not a function` before implementation,
  green after.
- Covers `TestDropSnapsToHalfU`, `TestDropFindsNearestFreeSlotElseRefuses` (requested slot, slide
  to nearest, null when the face is full, clamp at the top of the rack, and ignoring the device
  being moved), `TestHalfUDevicesShareAUnit`, `TestFacesAreIndependent`, `TestRackWattsSum`.
- Correction to the plan's own worked example: it expected the nearest free slot below a device
  occupying [1, 3) to be 0.5, but a 1U device at 0.5 spans [0.5, 1.5) and still overlaps. The
  answer is 0; plan and test now agree.
- `npm run typecheck` exit 0, `procoder check` 0 blocking.
