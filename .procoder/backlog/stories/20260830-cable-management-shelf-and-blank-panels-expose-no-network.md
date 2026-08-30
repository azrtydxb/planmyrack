# Cable management, shelf and blank panels expose no network-port field in the inspector — `TestPortlessTypesHidePortField` — fails if a port control appears for a type whose maxPorts is 0.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-4 (Special equipment types)
Plan: Task 15: Palette, inspector and responsive layout
Test: `TestPortlessTypesHidePortField`

The home-lab owner needs this to hold: cable management, shelf and blank panels expose no network-port field in the inspector.

Done when `TestPortlessTypesHidePortField` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Cable management, shelf and blank panels expose no network-port field in the inspector — `TestPortlessTypesHidePortField` — fails if a port control appears for a type whose maxPorts is 0.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

