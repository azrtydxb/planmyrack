# Malformed JSON, a newer schemaVersion or duplicate ids are refused with the reason, leaving the library untouched — `TestImportRejectsBadSchema` — fails if a rejected import writes anything to storage.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] Malformed JSON, a newer schemaVersion or duplicate ids are refused with the reason, leaving the library untouched — `TestImportRejectsBadSchema` — fails if a rejected import writes anything to storage.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

