# Task 2: Core types and the device-type table

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 2: Core types and the device-type table)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 2: Core types and the device-type table" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/src/types.ts`,
`packages/core/src/deviceTypes.ts`, `packages/core/src/ids.ts`,
`packages/core/src/index.ts`, `packages/core/test/deviceTypes.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `packages/core/test/deviceTypes.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL with "Cannot find module '../src/index.js'".
- [ ] Add to the Task 2 test file.
- [ ] Implement `types.ts` (types and constants above), `ids.ts` (`newId` = `Math.random()` base36 plus a module-level counter, no `crypto` use), and `deviceTypes.ts` with these rows: equipment (sizes all of UNIT_SIZES, 0/8 ports), server (1/2/4U, 2/8), switch (1/2U, 24/48), patch (1/2U, 24/48), pdu…
- [ ] Run `npm test -w @planmyrack/core` — passes. Run `npm run check:purity` — exits 0.
- [ ] Run `procoder check`, then commit: `feat(core): layout types and device-type table`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
