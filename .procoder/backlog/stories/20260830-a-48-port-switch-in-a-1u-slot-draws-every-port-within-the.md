# A 48-port switch in a 1U slot draws every port within the device's bounds — `TestDensePortsStayInsideDevice` — fails if any port's rendered box escapes the device rectangle at default zoom.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-5 (Network ports on the device face)
Plan: Task 13: Rack canvas rendering
Test: `TestDensePortsStayInsideDevice`

The home-lab owner needs this to hold: a 48-port switch in a 1U slot draws every port within the device's bounds.

Done when `TestDensePortsStayInsideDevice` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] A 48-port switch in a 1U slot draws every port within the device's bounds — `TestDensePortsStayInsideDevice` — fails if any port's rendered box escapes the device rectangle at default zoom.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

