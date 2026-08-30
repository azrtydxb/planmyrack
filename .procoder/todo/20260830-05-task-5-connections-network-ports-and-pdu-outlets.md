# Task 5: Connections — network ports and PDU outlets

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 5: Connections — network ports and PDU outlets)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 5: Connections — network ports and PDU outlets" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/core/src/links.ts`, `packages/core/src/ops.ts` (wire `pruneLinks` into
`updateDevice`/`removeDevice`/`removeRack`), `packages/core/src/index.ts` (re-export),
`packages/core/test/links.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `packages/core/test/links.test.ts`: Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'connect'".
- [x] Implement `links.ts` and wire `pruneLinks` into `updateDevice`, `removeDevice` and `removeRack`. `updateDevice` clamps `ports`/`outlets` to the new type's maxima before pruning, so a type change to a portless type zeroes both counts.
- [x] Run `npm test -w @planmyrack/core` — passes.
- [x] Run `procoder check`, then commit: `feat(core): port and outlet connections with link pruning`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
