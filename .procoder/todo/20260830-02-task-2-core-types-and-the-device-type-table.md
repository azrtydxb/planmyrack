# Task 2: Core types and the device-type table

Status: done
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

- [x] Write the failing test `packages/core/test/deviceTypes.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL with "Cannot find module '../src/index.js'".
- [x] Add to the Task 2 test file.
- [x] Implement `types.ts` (types and constants above), `ids.ts` (`newId` = `Math.random()` base36 plus a module-level counter, no `crypto` use), and `deviceTypes.ts` with these rows: equipment (sizes all of UNIT_SIZES, 0/8 ports), server (1/2/4U, 2/8), switch (1/2U, 24/48), patch (1/2U, 24/48), pdu…
- [x] Run `npm test -w @planmyrack/core` — passes. Run `npm run check:purity` — exits 0.
- [x] Run `procoder check`, then commit: `feat(core): layout types and device-type table`.

## Evidence

- Tests written first; `npm test -w @planmyrack/core` failed to resolve `../src/index.js`, then
  passed 8/8 after implementing types, ids, the device-type table and factories.
- `TestIdsAreUniqueWithoutCrypto`: 10000 distinct ids, and a getter installed on
  `globalThis.crypto` is never called — Hermes has no `crypto.randomUUID`, so this is the
  assertion that keeps the app from crashing on device rather than in CI.
- `TestDeviceTypeTableIsConsistent`: every type's sizes come from UNIT_SIZES, no default exceeds
  its maximum, hooks/brush/shelf/blank carry no ports and draw no power, only PDUs and UPSes
  supply outlets.
- `npm run typecheck` exit 0, `npm run check:purity` exit 0, `procoder check` 0 blocking.
- Deviation, corrected in the plan first: `DeviceTypeSpec` gained `drawsPower`. Without it a
  device with zero outlets (a NAS) cannot be the drawing end of a power link, so
  TestPduOutletSingleOccupancy in Task 5 would have nothing to connect; a shelf still cannot.
- UNIT_SIZES, RACK_UNIT_PRESETS, RACK_WIDTHS and COLOURS are typed `readonly number[]`/
  `readonly string[]` rather than `as const` tuples, so callers can test membership without
  casting.
