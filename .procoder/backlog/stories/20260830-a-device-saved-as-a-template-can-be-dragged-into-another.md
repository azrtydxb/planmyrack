# A device saved as a template can be dragged into another layout with ports, watts and colour intact — `TestTemplateRoundTrip` — fails if a template placed into a new layout differs from the device it was saved from.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-13 (Equipment library)
Plan: Task 17: Equipment templates and the catalogue in the palette
Test: `TestTemplateRoundTrip`

The home-lab owner needs this to hold: a device saved as a template can be dragged into another layout with ports, watts and colour intact.

Done when `TestTemplateRoundTrip` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] A device saved as a template can be dragged into another layout with ports, watts and colour intact — `TestTemplateRoundTrip` — fails if a template placed into a new layout differs from the device it was saved from.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

