# Task 19: Layouts screen, import, autosave and the conflict path

Status: done
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

- [x] Write the failing test `apps/app/test/layouts.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/ui/LayoutList'".
- [x] Implement the layouts screen (list with last-modified times, new/open/rename/duplicate/ delete, JSON import through `importJson` then `store.create`), `ConflictDialog` wired to `useLayoutEditor`'s `conflict`, and `OfflineBanner` wired to `StoreUnavailableError` with "Retry" and "Switch to local…
- [x] Run `npm test -w planmyrack` — passes.
- [x] Run `procoder check`, then commit: `feat(app): layouts screen, import, autosave and conflict handling`.

## Evidence

- `TestLayoutCrudInBothModes — through the UI` runs the same screen against two stores via
  it.each, so a behaviour that only works in one mode fails the suite.
- `TestLocalModePersistsWithoutNetwork`: with `global.fetch` replaced by a throwing spy, an edit
  reaches the on-device SQLite store, survives unmounting the editor, and the spy is never called
  — local mode is proved not to touch the network rather than assumed not to.
- `TestStaleSaveRejected — through the UI`: a second device saves first, this editor's autosave is
  refused, the edit stays on screen, the dialog offers Export to JSON and Reload, and reloading
  brings the server's version in.
- `TestImportRejectsBadSchema — through the UI`: the reason is shown and the library still has
  zero layouts. `TestImportOfDuplicateNameKeepsBoth`: importing over an existing name keeps both.
- 65 app tests, typecheck clean.
