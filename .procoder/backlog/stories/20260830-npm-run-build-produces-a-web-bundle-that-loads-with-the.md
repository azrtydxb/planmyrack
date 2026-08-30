# `npm run build` produces a web bundle that loads with the network off, and `eas build` produces installable iOS and Android binaries whose `app.json` declares icons, splash and `NSAllowsLocalNetworking` — `TestExpoConfigDeclaresLocalNetworking` — fails if the local-network declarations are missing from `app.json`.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] `npm run build` produces a web bundle that loads with the network off, and `eas build` produces installable iOS and Android binaries whose `app.json` declares icons, splash and `NSAllowsLocalNetworking` — `TestExpoConfigDeclaresLocalNetworking` — fails if the local-network declarations are missing from `app.json`.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

