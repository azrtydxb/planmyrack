# A cable's label, colour and type appear in the overlay, the cable schedule and the cable CSV — `TestCableMetadataFlowsToScheduleAndCsv` — fails if any of the three values is dropped on the way to an export.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-6 (Port-to-port connections)
Plan: Task 7: Layout JSON and CSV serialisation and Task 16: Port picker, cable overlay and cable schedule
Test: `TestCableMetadataFlowsToScheduleAndCsv`

The home-lab owner needs this to hold: a cable's label, colour and type appear in the overlay, the cable schedule and the cable CSV.

Done when `TestCableMetadataFlowsToScheduleAndCsv` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] A cable's label, colour and type appear in the overlay, the cable schedule and the cable CSV — `TestCableMetadataFlowsToScheduleAndCsv` — fails if any of the three values is dropped on the way to an export.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

