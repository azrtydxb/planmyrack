# Switching mode in settings re-lists layouts from the newly active store, and the active mode is visible outside settings — `TestModeSwitchRelistsLayouts` — fails if the list still shows the previous store's layouts after a switch.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

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

- [x] Switching mode in settings re-lists layouts from the newly active store, and the active mode is visible outside settings — `TestModeSwitchRelistsLayouts` — fails if the list still shows the previous store's layouts after a switch.

## Evidence

- `TestModeSwitchRelistsLayouts`: switching mode in settings lists the other store's layouts and stops listing the previous one.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

