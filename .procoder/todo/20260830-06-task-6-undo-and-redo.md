# Task 6: Undo and redo

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 6: Undo and redo)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 6: Undo and redo" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/core/src/history.ts`, `packages/core/src/index.ts` (re-export),
`packages/core/test/history.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `packages/core/test/history.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'initHistory'".
- [ ] Implement `history.ts` as three plain arrays; `commit` pushes `present` onto `past`, `undo` pops `past` into `present` and pushes the old `present` onto `future`, `redo` mirrors it.
- [ ] Run `npm test -w @planmyrack/core` — passes.
- [ ] Run `procoder check`, then commit: `feat(core): undo and redo over layout edits`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
