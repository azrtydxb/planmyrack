# A save built on a stale revision is refused with 409 and the server's current document, and the client offers reload or JSON export — `TestStaleSaveRejected` — fails if a stale PUT overwrites newer server data, or returns anything other than 409.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] A save built on a stale revision is refused with 409 and the server's current document, and the client offers reload or JSON export — `TestStaleSaveRejected` — fails if a stale PUT overwrites newer server data, or returns anything other than 409.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

