# The number of ports drawn on a device always equals its configured port count, including 48 on a switch and 4 on a generic device — `TestPortCountRendersExactly` — fails if the rendered port count diverges from the device's ports value after a change.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-5 (Network ports on the device face)
Plan: Task 13: Rack canvas rendering
Test: `TestPortCountRendersExactly`

The home-lab owner needs this to hold: the number of ports drawn on a device always equals its configured port count, including 48 on a switch and 4 on a generic device.

Done when `TestPortCountRendersExactly` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] The number of ports drawn on a device always equals its configured port count, including 48 on a switch and 4 on a generic device — `TestPortCountRendersExactly` — fails if the rendered port count diverges from the device's ports value after a change.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

