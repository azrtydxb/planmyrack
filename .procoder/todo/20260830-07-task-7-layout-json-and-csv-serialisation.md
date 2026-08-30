# Task 7: Layout JSON and CSV serialisation

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 7: Layout JSON and CSV serialisation)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 7: Layout JSON and CSV serialisation" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/core/src/io.ts`, `packages/core/src/schema.ts` (zod document schema),
`packages/core/src/index.ts` (re-export), `packages/core/test/io.test.ts`,
`packages/core/package.json` (add dependency `zod@^3`).

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `packages/core/test/io.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'exportJson'".
- [x] Implement `schema.ts` with zod mirroring the `Layout` types (ports and outlets non-negative integers, `posU` a multiple of 0.5, `width` a literal union of 19 and 10), then `io.ts`: `importJson` parses, checks `schemaVersion <= SCHEMA_VERSION`, checks id uniqueness across racks/devices/links,…
- [x] Run `npm test -w @planmyrack/core` — passes.
- [x] Run `procoder check`, then commit: `feat(core): layout JSON import/export and CSV reports`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
