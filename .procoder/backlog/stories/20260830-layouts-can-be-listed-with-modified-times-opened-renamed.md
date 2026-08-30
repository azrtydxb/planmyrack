# Layouts can be listed with modified times, opened, renamed, duplicated and deleted, identically in both modes — `TestLayoutCrudInBothModes` — fails if any of the five operations succeeds in one mode and not the other.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] Layouts can be listed with modified times, opened, renamed, duplicated and deleted, identically in both modes — `TestLayoutCrudInBothModes` — fails if any of the five operations succeeds in one mode and not the other.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

