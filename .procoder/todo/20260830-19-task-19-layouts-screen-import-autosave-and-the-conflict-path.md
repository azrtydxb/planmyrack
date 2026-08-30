# Task 19: Layouts screen, import, autosave and the conflict path

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 19: Layouts screen, import, autosave and the conflict path)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 19: Layouts screen, import, autosave and the conflict path" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/app/index.tsx`, `apps/app/src/ui/LayoutList.tsx`,
`apps/app/src/ui/ConflictDialog.tsx`, `apps/app/src/ui/OfflineBanner.tsx`,
`apps/app/test/layouts.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `apps/app/test/layouts.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/ui/LayoutList'".
- [ ] Implement the layouts screen (list with last-modified times, new/open/rename/duplicate/ delete, JSON import through `importJson` then `store.create`), `ConflictDialog` wired to `useLayoutEditor`'s `conflict`, and `OfflineBanner` wired to `StoreUnavailableError` with "Retry" and "Switch to local…
- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): layouts screen, import, autosave and conflict handling`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
