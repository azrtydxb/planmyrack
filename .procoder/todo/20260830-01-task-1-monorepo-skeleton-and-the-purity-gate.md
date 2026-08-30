# Task 1: Monorepo skeleton and the purity gate

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 1: Monorepo skeleton and the purity gate)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 1: Monorepo skeleton and the purity gate" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`package.json` (root: workspaces `packages/*`, `apps/*`, scripts `test`, `typecheck`,
`check:purity`), `tsconfig.base.json` (`strict: true`, `moduleResolution: "bundler"`),
`vitest.workspace.ts`, `scripts/check-purity.mjs` (scanner + CLI), `tests/purity.test.ts`,
`tests/fixtures/impure/bad.ts` (positive control), `.gitignore`, `README.md` (how to run
web, iOS, Android and the server).

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write `tests/fixtures/impure/bad.ts` containing exactly `import { View } from 'react-native' export const x = View`.
- [x] Write the failing test `tests/purity.test.ts`: Run `npm test` — expect FAIL with "Cannot find module '../scripts/check-purity.mjs'".
- [x] Implement `scripts/check-purity.mjs`: walk each dir for `.ts` and `.tsx` files and match each import specifier against this pattern, returning `{ file, module }` sorted by file; the CLI entry prints each hit and exits 1 when any is found, 0 otherwise: `js const BANNED =…
- [x] Run `npm test` — both cases pass. Run `npm run check:purity` — exits 0.
- [x] Run `procoder check`, then commit: `chore: monorepo skeleton with platform-purity gate`.

## Evidence

- Fixture `tests/fixtures/impure/bad.ts` written first (imports `react-native`), then
  `tests/purity.test.ts`. `npm test` failed as required, though with vitest's wording rather
  than the plan's: "Failed to load url ../scripts/check-purity.mjs ... Does the file exist?"
  — same cause, different phrasing.
- `scripts/check-purity.mjs` implemented; `npm test` → `Test Files 1 passed (1) · Tests 2
  passed (2)`.
- The gate proved to fail in both directions, which is the point of it:
  `npm run check:purity` → "no platform imports in packages", exit 0;
  `node scripts/check-purity.mjs tests/fixtures/impure` →
  "tests/fixtures/impure/bad.ts: imports react-native", exit 1.
- `npm run typecheck` → exit 0.
- `procoder check` → "5 clean, 0 unformatted, 0 unchecked, 0 blocking".
- Deviations from the plan, corrected in the plan itself before committing: root typecheck is
  `tsc -p tsconfig.json` until packages carry composite references (Task 2), and no
  `vitest.workspace.ts` was created — it is deprecated in vitest 3.2 in favour of
  `test.projects`, which Task 2 adds with the first package suite.
