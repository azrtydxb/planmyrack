# Task 18: Rack summary and exports

Status: done
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

- [x] Write the failing test `apps/app/test/exports.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/export/png'".
- [x] Write the failing test `packages/core/test/svg.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL, then implement `render/svg.ts`.
- [x] Implement `RackSummary` on `rackStats`, `files.ts` with the platform split, `png.ts` with the web (`layoutSvg` → canvas) and native (`captureRef`) branches, both rethrowing as `PNG export failed: <reason>`, `print.ts` reusing `layoutSvg`, and the export menu offering JSON, PNG, Print/PDF, Parts…
- [x] Run `npm test -w planmyrack` — passes.
- [x] Run `procoder check`, then commit: `feat(app): rack summary and JSON/PNG/print/CSV exports`.

## Evidence

- `layoutSvg` is a pure function in core with its own tests: one rect per visible device plus the
  rack body, only the face asked for, nothing external referenced (so rasterising cannot hit the
  network), and device names escaped — a device called `<script>&"` cannot break the document.
- `TestRackWattsSum — in the UI`: the summary shows 50 W and updates to 98 W when a device
  changes, and counts each face separately (3U front · 1U rear · 9U free).
- `TestPngExportProducesImage`: web rasterises `layoutSvg` through a canvas, native captures the
  live view, and a failure throws `PNG export failed: …` rather than resolving with nothing.
- Deviation from the plan, and the reason: PNG on web does NOT use react-native-view-shot. Its
  web path runs through html2canvas, whose SVG support is partial — and this canvas is entirely
  SVG. Rendering the elevation from core instead means PNG, print and the screen all come from
  one renderer.
- `TestCsvColumnsAndRowCounts` asserts the exported header constants and one row per device and
  per cable.
