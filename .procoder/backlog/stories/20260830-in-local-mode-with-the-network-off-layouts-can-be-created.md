# In local mode with the network off, layouts can be created, edited and reopened, and edits survive a full restart with no explicit save — `TestLocalModePersistsWithoutNetwork` — fails if any edit is lost across a restart, or the client issues an HTTP request in local mode.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-8 (Local mode storage)
Plan: Task 19: Layouts screen, import, autosave and the conflict path
Test: `TestLocalModePersistsWithoutNetwork`

The home-lab owner needs this to hold: in local mode with the network off, layouts can be created, edited and reopened, and edits survive a full restart with no explicit save.

Done when `TestLocalModePersistsWithoutNetwork` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] In local mode with the network off, layouts can be created, edited and reopened, and edits survive a full restart with no explicit save — `TestLocalModePersistsWithoutNetwork` — fails if any edit is lost across a restart, or the client issues an HTTP request in local mode.

## Evidence

- `TestLocalModePersistsWithoutNetwork`: with global.fetch replaced by a throwing spy the edit still persists and the spy is never called; in the browser, local mode kept three devices across a reload while the server list stayed empty.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

