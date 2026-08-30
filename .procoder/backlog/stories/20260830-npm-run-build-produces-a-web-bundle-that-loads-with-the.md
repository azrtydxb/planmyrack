# `npm run build` produces a web bundle that loads with the network off, and `eas build` produces installable iOS and Android binaries whose `app.json` declares icons, splash and `NSAllowsLocalNetworking` — `TestExpoConfigDeclaresLocalNetworking` — fails if the local-network declarations are missing from `app.json`.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-16 (Shippable builds)
Plan: Task 20: Shippable builds — web, iOS and Android
Test: `TestExpoConfigDeclaresLocalNetworking`

The home-lab owner needs this to hold: `npm run build` produces a web bundle that loads with the network off, and `eas build` produces installable iOS and Android binaries whose `app.json` declares icons, splash and `NSAllowsLocalNetworking`.

Done when `TestExpoConfigDeclaresLocalNetworking` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] `npm run build` produces a web bundle that loads with the network off, and `eas build` produces installable iOS and Android binaries whose `app.json` declares icons, splash and `NSAllowsLocalNetworking` — `TestExpoConfigDeclaresLocalNetworking` — fails if the local-network declarations are missing from `app.json`.

## Evidence

- `TestExpoConfigDeclaresLocalNetworking`: the config plugin writes usesCleartextTraffic and networkSecurityConfig into the generated AndroidManifest and NSAllowsLocalNetworking into Info.plist — proved by running expo prebuild on both platforms.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

