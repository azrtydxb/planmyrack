# Hooks and brush cable management are placeable at 0.5U and 1U and render distinguishably from each other and from a blank panel — `TestCableManagementFlavoursRender` — fails if the hooks and brush snapshots are identical, or either flavour is missing a size.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-4 (Special equipment types)
Plan: Task 13: Rack canvas rendering
Test: `TestCableManagementFlavoursRender`

The home-lab owner needs this to hold: hooks and brush cable management are placeable at 0.5U and 1U and render distinguishably from each other and from a blank panel.

Done when `TestCableManagementFlavoursRender` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Hooks and brush cable management are placeable at 0.5U and 1U and render distinguishably from each other and from a blank panel — `TestCableManagementFlavoursRender` — fails if the hooks and brush snapshots are identical, or either flavour is missing a size.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

