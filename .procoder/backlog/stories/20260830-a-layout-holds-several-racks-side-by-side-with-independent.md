# A layout holds several racks side by side with independent widths (19"/10") and unit counts from presets or a typed 1-48 value — `TestLayoutHoldsMixedWidthRacks` — fails if a layout is capped at one rack, or a 10" rack renders at 19" width.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-1 (Rack workspace)
Plan: Task 13: Rack canvas rendering
Test: `TestLayoutHoldsMixedWidthRacks`

The home-lab owner needs this to hold: a layout holds several racks side by side with independent widths (19"/10") and unit counts from presets or a typed 1-48 value.

Done when `TestLayoutHoldsMixedWidthRacks` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] A layout holds several racks side by side with independent widths (19"/10") and unit counts from presets or a typed 1-48 value — `TestLayoutHoldsMixedWidthRacks` — fails if a layout is capped at one rack, or a 10" rack renders at 19" width.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

