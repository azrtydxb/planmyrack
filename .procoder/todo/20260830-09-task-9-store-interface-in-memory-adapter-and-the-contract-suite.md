# Task 9: Store interface, in-memory adapter and the contract suite

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 9: Store interface, in-memory adapter and the contract suite)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 9: Store interface, in-memory adapter and the contract suite" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/storage/package.json` (depends on `@planmyrack/core`; devDependency `vitest` for
its own tests only — `src/contract.ts` itself imports no test runner and is published as a
normal export so jest in `apps/app` can run it), `packages/storage/tsconfig.json`,
`packages/storage/src/types.ts`, `packages/storage/src/memory.ts`,
`packages/storage/src/contract.ts`, `packages/storage/src/index.ts`,
`packages/storage/test/memory.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `packages/storage/test/memory.test.ts`: and write `contract.ts` itself, which declares the ambient globals (`declare const describe: (n: string, f: () => void) => void` and the same for `it`/`expect`, or `@types/jest`-free equivalents) and imports NOTHING from `vitest` or…
- [x] Implement `types.ts`, the errors, and `memory.ts` as a `Map<string, Layout>` plus a `Map<string, Template>`; `create` deep-clones and assigns `newId()` and `revision: 1`, `update` compares revisions and throws `StaleRevisionError` carrying a clone of the stored document, and both stamp `updatedAt`.
- [x] Run `npm test -w @planmyrack/storage` — passes. Run `npm run check:purity` — exits 0.
- [x] Prove the suite is runner-agnostic: `grep -rE "from '(vitest|@jest/globals)'" packages/storage/src/contract.ts` returns nothing, and Task 12 re-runs this same file under jest.
- [x] Run `procoder check`, then commit: `feat(storage): LayoutStore contract and in-memory adapter`.

## Evidence

- `runStoreContract` imports no test runner: it declares ambient describe/it/expect so the same
  file runs under vitest here and under jest in the app. `grep -rE "from '(vitest|@jest/globals)'"
packages/storage/src/contract.ts` returns nothing.
- Vitest needed `globals: true` for that to work; set in every package config, as the plan's
  constraint required.
- Memory adapter passes the contract: CRUD, layout round-trip, templates, and stale-save refusal.
- 87 tests across 12 files green; typecheck exit 0; gate 0 blocking.
