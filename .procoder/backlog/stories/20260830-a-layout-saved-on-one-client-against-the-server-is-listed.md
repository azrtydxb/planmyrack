# A layout saved on one client against the server is listed by a second client after refresh — `TestServerLayoutVisibleToSecondClient` — fails if the second client's list omits a layout the server holds.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 002-layouts-persist-and-are-shared-one-store-contract-proved-by

## Description

Spec: rack-layout-planner — scope S-9 (Server mode storage)
Plan: Task 10: The local server — node:sqlite store behind a REST API
Test: `TestServerLayoutVisibleToSecondClient`

The home-lab owner needs this to hold: a layout saved on one client against the server is listed by a second client after refresh.

Done when `TestServerLayoutVisibleToSecondClient` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] A layout saved on one client against the server is listed by a second client after refresh — `TestServerLayoutVisibleToSecondClient` — fails if the second client's list omits a layout the server holds.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

