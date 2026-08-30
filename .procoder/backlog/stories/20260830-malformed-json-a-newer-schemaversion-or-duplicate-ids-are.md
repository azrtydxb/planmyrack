# Malformed JSON, a newer schemaVersion or duplicate ids are refused with the reason, leaving the library untouched — `TestImportRejectsBadSchema` — fails if a rejected import writes anything to storage.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-12 (Export and import)
Plan: Task 7: Layout JSON and CSV serialisation and Task 19: Layouts screen, import, autosave and the conflict path
Test: `TestImportRejectsBadSchema`

The home-lab owner needs this to hold: malformed JSON, a newer schemaVersion or duplicate ids are refused with the reason, leaving the library untouched.

Done when `TestImportRejectsBadSchema` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] Malformed JSON, a newer schemaVersion or duplicate ids are refused with the reason, leaving the library untouched — `TestImportRejectsBadSchema` — fails if a rejected import writes anything to storage.

## Evidence

- `TestImportRejectsBadSchema`: six refusals each naming the problem, and a refused import leaves the library untouched.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

