# Name, colour, watts, weight, depth and notes edits render immediately and survive reopening the layout — `TestDevicePropertyRoundTrip` — fails if any edited field is absent or stale after a reload from storage.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-3 (Device properties)
Plan: Task 15: Palette, inspector and responsive layout
Test: `TestDevicePropertyRoundTrip`

The home-lab owner needs this to hold: name, colour, watts, weight, depth and notes edits render immediately and survive reopening the layout.

Done when `TestDevicePropertyRoundTrip` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Name, colour, watts, weight, depth and notes edits render immediately and survive reopening the layout — `TestDevicePropertyRoundTrip` — fails if any edited field is absent or stale after a reload from storage.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

