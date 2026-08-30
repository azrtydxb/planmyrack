# Layouts can be listed with modified times, opened, renamed, duplicated and deleted, identically in both modes — `TestLayoutCrudInBothModes` — fails if any of the five operations succeeds in one mode and not the other.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-11 (Layout management)
Plan: Task 9: Store interface, in-memory adapter and the contract suite and Task 19: Layouts screen, import, autosave and the conflict path
Test: `TestLayoutCrudInBothModes`

The home-lab owner needs this to hold: layouts can be listed with modified times, opened, renamed, duplicated and deleted, identically in both modes.

Done when `TestLayoutCrudInBothModes` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Layouts can be listed with modified times, opened, renamed, duplicated and deleted, identically in both modes — `TestLayoutCrudInBothModes` — fails if any of the five operations succeeds in one mode and not the other.

## Evidence

- `TestLayoutCrudInBothModes`: the same screen drives two stores through it.each, and the store contract covers create/list/get/duplicate/rename/delete plus templates.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

