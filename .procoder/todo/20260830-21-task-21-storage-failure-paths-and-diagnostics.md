# Task 21: Storage failure paths and diagnostics

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 21: Storage failure paths and diagnostics)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 21: Storage failure paths and diagnostics" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/src/storage/StoreProvider.tsx` (open-failure handling),
`apps/app/src/storage/capabilities.ts`, `apps/app/src/ui/StorageProblem.tsx`,
`apps/app/app/settings.tsx` (diagnostics block), `apps/app/test/failures.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `apps/app/test/failures.test.tsx`, one case per spec failure mode: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/storage/capabilities'".
- [ ] Implement `capabilities.ts`, the open-failure branch in `StoreProvider` (an unreadable database yields an empty in-memory store plus a `StorageProblem`, never a delete or overwrite), `StorageProblem` with its four messages, and the settings diagnostics block recording the last server URL, status…
- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): storage failure paths and server diagnostics`. ## Coverage self-review Every spec scope id maps to the task that implements it: S-1 → Tasks 2, 4, 13; S-2 → Tasks 3, 4, 14; S-3 → Tasks 4, 15; S-4 → Tasks 2, 13; S-5 → Tasks 2, 13; S-6 → Tasks 5, 16;…

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
