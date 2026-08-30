# Task 8: Bundled equipment catalogue

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 8: Bundled equipment catalogue)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 8: Bundled equipment catalogue" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/catalog/package.json` (depends on `@planmyrack/core`),
`packages/catalog/tsconfig.json`, `packages/catalog/src/bundled.ts`,
`packages/catalog/src/index.ts`, `packages/catalog/test/bundled.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `packages/catalog/test/bundled.test.ts`: Run `npm test -w @planmyrack/catalog` — expect FAIL with "Cannot find module '../src/index.js'".
- [x] Implement `bundled.ts`: the Generic rows (server 1U/2U/4U, switch 8/16/24/48-port, patch panel 24/48-port, PDU 8-way, UPS 2U, shelf 1U/2U, blank 0.5U/1U/2U, hooks 0.5U/1U, brush 0.5U/1U) plus roughly thirty vendor rows across UniFi, MikroTik, TP-Link, Synology, QNAP and Cisco SG, each with…
- [x] Run `npm test -w @planmyrack/catalog` — passes. Run `npm run check:purity` — exits 0.
- [x] Run `procoder check`, then commit: `feat(catalog): bundled home-lab equipment catalogue`.

## Evidence

- 43 entries: 20 generic shapes plus UniFi, MikroTik, TP-Link, Synology, QNAP and Cisco rows.
- `TestBundledCatalogueShape` asserts every vendor family is present, every height is placeable
  for its type, no port or outlet count exceeds the type maximum, ids are unique, and
  `deviceFromCatalog` carries ports, watts and height onto the placed device.
- Deliberate limitation, asserted by a test rather than left implicit: vendor rows carry only
  the structural facts (height in U, port count) and leave `watts` at 0 with a `source` saying
  the figure is unknown. A guessed wattage would silently corrupt every rack power total, which
  is worse than an obvious gap. `TestBundledCatalogueShape` fails if a 0-watt entry does not say
  so in its source.
- 65/65 tests across 8 files, typecheck exit 0, gate 0 blocking.
