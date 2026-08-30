# The bundled catalogue is present on a fresh install with the generic set and the named vendor families (UniFi, MikroTik, TP-Link, Synology, QNAP, Cisco SG), every entry carrying height, port count and watts — `TestBundledCatalogueShape` — fails if the palette shows no catalogue entries before any template is saved, or an entry is missing its height or port count.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

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

- [ ] The bundled catalogue is present on a fresh install with the generic set and the named vendor families (UniFi, MikroTik, TP-Link, Synology, QNAP, Cisco SG), every entry carrying height, port count and watts — `TestBundledCatalogueShape` — fails if the palette shows no catalogue entries before any template is saved, or an entry is missing its height or port count.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

