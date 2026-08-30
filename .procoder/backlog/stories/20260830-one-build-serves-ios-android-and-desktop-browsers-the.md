# One build serves iOS, Android and desktop browsers; the inspector is a bottom sheet at phone widths and a side panel at wide widths — `TestInspectorLayoutByBreakpoint` — fails if a phone-width render produces the side panel variant.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-14 (Touch-first UI on every surface)
Plan: Task 15: Palette, inspector and responsive layout
Test: `TestInspectorLayoutByBreakpoint`

The home-lab owner needs this to hold: one build serves iOS, Android and desktop browsers; the inspector is a bottom sheet at phone widths and a side panel at wide widths.

Done when `TestInspectorLayoutByBreakpoint` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] One build serves iOS, Android and desktop browsers; the inspector is a bottom sheet at phone widths and a side panel at wide widths — `TestInspectorLayoutByBreakpoint` — fails if a phone-width render produces the side panel variant.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

