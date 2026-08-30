# Task 9: Store interface, in-memory adapter and the contract suite

Status: open
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

- [ ] Write the failing test `packages/storage/test/memory.test.ts`: and write `contract.ts` itself, which declares the ambient globals (`declare const describe: (n: string, f: () => void) => void` and the same for `it`/`expect`, or `@types/jest`-free equivalents) and imports NOTHING from `vitest` or…
- [ ] Implement `types.ts`, the errors, and `memory.ts` as a `Map<string, Layout>` plus a `Map<string, Template>`; `create` deep-clones and assigns `newId()` and `revision: 1`, `update` compares revisions and throws `StaleRevisionError` carrying a clone of the stored document, and both stamp `updatedAt`.
- [ ] Run `npm test -w @planmyrack/storage` — passes. Run `npm run check:purity` — exits 0.
- [ ] Prove the suite is runner-agnostic: `grep -rE "from '(vitest|@jest/globals)'" packages/storage/src/contract.ts` returns nothing, and Task 12 re-runs this same file under jest.
- [ ] Run `procoder check`, then commit: `feat(storage): LayoutStore contract and in-memory adapter`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
