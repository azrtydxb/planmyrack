# The bundled catalogue is present on a fresh install with the generic set and the named vendor families (UniFi, MikroTik, TP-Link, Synology, QNAP, Cisco SG), every entry carrying height, port count and watts — `TestBundledCatalogueShape` — fails if the palette shows no catalogue entries before any template is saved, or an entry is missing its height or port count.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

## Description

Spec: rack-layout-planner — scope S-13 (Equipment library)
Plan: Task 8: Bundled equipment catalogue and Task 17: Equipment templates and the catalogue in the palette
Test: `TestBundledCatalogueShape`

The home-lab owner needs this to hold: the bundled catalogue is present on a fresh install with the generic set and the named vendor families (UniFi, MikroTik, TP-Link, Synology, QNAP, Cisco SG), every entry carrying height, port count and watts.

Done when `TestBundledCatalogueShape` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] The bundled catalogue is present on a fresh install with the generic set and the named vendor families (UniFi, MikroTik, TP-Link, Synology, QNAP, Cisco SG), every entry carrying height, port count and watts — `TestBundledCatalogueShape` — fails if the palette shows no catalogue entries before any template is saved, or an entry is missing its height or port count.

## Evidence

- `TestBundledCatalogueShape`: 43 entries across Generic, UniFi, MikroTik, TP-Link, Synology, QNAP and Cisco, every height placeable and every port count within its type maximum; listed by vendor in the palette on a fresh install.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

