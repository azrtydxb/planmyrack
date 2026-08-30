# A save built on a stale revision is refused with 409 and the server's current document, and the client offers reload or JSON export — `TestStaleSaveRejected` — fails if a stale PUT overwrites newer server data, or returns anything other than 409.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-9 (Server mode storage)
Plan: Task 9: Store interface, in-memory adapter and the contract suite and Task 10: The local server — node:sqlite store behind a REST API and Task 19: Layouts screen, import, autosave and the conflict path
Test: `TestStaleSaveRejected`

The home-lab owner needs this to hold: a save built on a stale revision is refused with 409 and the server's current document, and the client offers reload or JSON export.

Done when `TestStaleSaveRejected` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A save built on a stale revision is refused with 409 and the server's current document, and the client offers reload or JSON export — `TestStaleSaveRejected` — fails if a stale PUT overwrites newer server data, or returns anything other than 409.

## Evidence

- `TestStaleSaveRejected`: the store contract enforces it across memory, node:sqlite and HTTP (409 + current document), and the UI shows the conflict dialog with the edit still on screen.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

