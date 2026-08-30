# Task 1: Monorepo skeleton and the purity gate

Status: open
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

- [ ] Write `tests/fixtures/impure/bad.ts` containing exactly `import { View } from 'react-native' export const x = View`.
- [ ] Write the failing test `tests/purity.test.ts`: Run `npm test` — expect FAIL with "Cannot find module '../scripts/check-purity.mjs'".
- [ ] Implement `scripts/check-purity.mjs`: walk each dir for `.ts` and `.tsx` files and match each import specifier against this pattern, returning `{ file, module }` sorted by file; the CLI entry prints each hit and exits 1 when any is found, 0 otherwise: `js const BANNED =…
- [ ] Run `npm test` — both cases pass. Run `npm run check:purity` — exits 0.
- [ ] Run `procoder check`, then commit: `chore: monorepo skeleton with platform-purity gate`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
