# Task 3: Geometry — snapping, collision, free-slot search, rack stats

Status: open
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

- [ ] Write the failing test `packages/core/test/geometry.test.ts` with a `mk(partial)` helper building a `Device` from `newDevice`-shaped defaults, covering: Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'snapHalfU'".
- [ ] Implement `geometry.ts`. `collides` compares only devices sharing `rackId` and `face` and ignores `probe.id`; `findFreeSlot` clamps to `0..rack.units - heightU`, tries `probe.posU` first, then `±0.5, ±1.0, …` up to `rack.units`, returning the first collision-free snapped position; `unitsFree` is…
- [ ] Run `npm test -w @planmyrack/core` — passes.
- [ ] Run `procoder check`, then commit: `feat(core): rack geometry, collision and free-slot search`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
