# First run offers local-vs-server, and the test-connection button reports success against a running server and a named failure against a dead one — `TestModeChooserAndHealthProbe` — fails if the probe reports success when `GET /api/health` did not return ok.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-10 (Mode selection)
Plan: Task 11: HTTP store adapter and server probe and Task 12: Expo app shell, local SQLite store, mode chooser and settings
Test: `TestModeChooserAndHealthProbe`

The home-lab owner needs this to hold: first run offers local-vs-server, and the test-connection button reports success against a running server and a named failure against a dead one.

Done when `TestModeChooserAndHealthProbe` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] First run offers local-vs-server, and the test-connection button reports success against a running server and a named failure against a dead one — `TestModeChooserAndHealthProbe` — fails if the probe reports success when `GET /api/health` did not return ok.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

