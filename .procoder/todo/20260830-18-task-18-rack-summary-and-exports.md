# Task 18: Rack summary and exports

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 18: Rack summary and exports)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 18: Rack summary and exports" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/src/ui/RackSummary.tsx`, `apps/app/src/export/files.ts`,
`apps/app/src/export/png.ts`, `apps/app/src/export/print.ts`, `apps/app/app/rack/[id].tsx`
(export menu), `apps/app/test/exports.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `apps/app/test/exports.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/export/png'".
- [ ] Write the failing test `packages/core/test/svg.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL, then implement `render/svg.ts`.
- [ ] Implement `RackSummary` on `rackStats`, `files.ts` with the platform split, `png.ts` with the web (`layoutSvg` → canvas) and native (`captureRef`) branches, both rethrowing as `PNG export failed: <reason>`, `print.ts` reusing `layoutSvg`, and the export menu offering JSON, PNG, Print/PDF, Parts…
- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): rack summary and JSON/PNG/print/CSV exports`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
