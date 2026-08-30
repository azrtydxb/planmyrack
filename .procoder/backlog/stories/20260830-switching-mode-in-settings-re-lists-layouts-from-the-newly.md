# Switching mode in settings re-lists layouts from the newly active store, and the active mode is visible outside settings — `TestModeSwitchRelistsLayouts` — fails if the list still shows the previous store's layouts after a switch.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-10 (Mode selection)
Plan: Task 12: Expo app shell, local SQLite store, mode chooser and settings
Test: `TestModeSwitchRelistsLayouts`

The home-lab owner needs this to hold: switching mode in settings re-lists layouts from the newly active store, and the active mode is visible outside settings.

Done when `TestModeSwitchRelistsLayouts` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Switching mode in settings re-lists layouts from the newly active store, and the active mode is visible outside settings — `TestModeSwitchRelistsLayouts` — fails if the list still shows the previous store's layouts after a switch.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

