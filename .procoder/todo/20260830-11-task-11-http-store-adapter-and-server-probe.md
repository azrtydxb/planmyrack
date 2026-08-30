# Task 11: HTTP store adapter and server probe

Status: done
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

- [x] Write the failing test `packages/storage/test/http.test.ts`: Run `npm test -w @planmyrack/storage` — expect FAIL with "does not provide an export named 'createHttpStore'".
- [x] Implement `http.ts` with `fetch` and a 5-second timeout built from `AbortController` plus `setTimeout` (NOT `AbortSignal.timeout`, which Hermes does not reliably provide), clearing the timer in a `finally`, plus the error mapping above.
- [x] Run `npm test -w @planmyrack/storage` — passes. Run `npm run check:purity` — exits 0 (`fetch` is a platform-neutral global and is not on the banned list).
- [x] Run `procoder check`, then commit: `feat(storage): HTTP adapter and server probe`.

## Evidence

- `createHttpStore` passes the same contract suite as memory and sqlite, run against a real
  server started per test.
- `TestModeChooserAndHealthProbe`: ok plus version against a live server, a named reason against a
  dead address without throwing, rejection of an address that answers but is not a PlanMyRack
  server, StoreUnavailableError from the store when the server is gone, and a 500 reported as
  unreachable rather than blamed on the layout.
- Timeout built from AbortController rather than AbortSignal.timeout, which Hermes does not
  reliably provide — this adapter runs on the phone too.
- 87 tests across 12 files green; typecheck exit 0; gate 0 blocking.
