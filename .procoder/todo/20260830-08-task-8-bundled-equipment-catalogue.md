# Task 8: Bundled equipment catalogue

Status: open
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

- [ ] Write the failing test `packages/catalog/test/bundled.test.ts`: Run `npm test -w @planmyrack/catalog` — expect FAIL with "Cannot find module '../src/index.js'".
- [ ] Implement `bundled.ts`: the Generic rows (server 1U/2U/4U, switch 8/16/24/48-port, patch panel 24/48-port, PDU 8-way, UPS 2U, shelf 1U/2U, blank 0.5U/1U/2U, hooks 0.5U/1U, brush 0.5U/1U) plus roughly thirty vendor rows across UniFi, MikroTik, TP-Link, Synology, QNAP and Cisco SG, each with…
- [ ] Run `npm test -w @planmyrack/catalog` — passes. Run `npm run check:purity` — exits 0.
- [ ] Run `procoder check`, then commit: `feat(catalog): bundled home-lab equipment catalogue`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
