# Parts CSV and cable CSV carry the documented column headers with one row per device and per cable — `TestCsvColumnsAndRowCounts` — fails if a header differs from the Interfaces section or a row count differs from the layout's device/link count.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-12 (Export and import)
Plan: Task 7: Layout JSON and CSV serialisation and Task 18: Rack summary and exports
Test: `TestCsvColumnsAndRowCounts`

The home-lab owner needs this to hold: parts CSV and cable CSV carry the documented column headers with one row per device and per cable.

Done when `TestCsvColumnsAndRowCounts` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] Parts CSV and cable CSV carry the documented column headers with one row per device and per cable — `TestCsvColumnsAndRowCounts` — fails if a header differs from the Interfaces section or a row count differs from the layout's device/link count.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

