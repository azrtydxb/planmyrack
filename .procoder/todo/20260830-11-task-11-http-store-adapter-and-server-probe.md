# Task 11: HTTP store adapter and server probe

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 11: HTTP store adapter and server probe)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 11: HTTP store adapter and server probe" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/storage/src/http.ts`, `packages/storage/src/index.ts` (re-export),
`packages/storage/test/http.test.ts` (runs the contract suite against a real server from
`@planmyrack/server`, added there as a devDependency).

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `packages/storage/test/http.test.ts`: Run `npm test -w @planmyrack/storage` — expect FAIL with "does not provide an export named 'createHttpStore'".
- [ ] Implement `http.ts` with `fetch` and a 5-second timeout built from `AbortController` plus `setTimeout` (NOT `AbortSignal.timeout`, which Hermes does not reliably provide), clearing the timer in a `finally`, plus the error mapping above.
- [ ] Run `npm test -w @planmyrack/storage` — passes. Run `npm run check:purity` — exits 0 (`fetch` is a platform-neutral global and is not on the banned list).
- [ ] Run `procoder check`, then commit: `feat(storage): HTTP adapter and server probe`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
