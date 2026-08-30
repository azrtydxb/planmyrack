# PNG export returns a non-empty image of the rack elevation and the print view renders one legible page per rack — `TestPngExportProducesImage` — fails if the export resolves to empty data or a zero-sized image.

Status: open
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: -

## Description

Spec: rack-layout-planner — scope S-12 (Export and import)
Plan: Task 18: Rack summary and exports
Test: `TestPngExportProducesImage`

The home-lab owner needs this to hold: pNG export returns a non-empty image of the rack elevation and the print view renders one legible page per rack.

Done when `TestPngExportProducesImage` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [ ] PNG export returns a non-empty image of the rack elevation and the print view renders one legible page per rack — `TestPngExportProducesImage` — fails if the export resolves to empty data or a zero-sized image.

## Evidence

<!-- Filled at close time: the commands run and what their output proved,
     one line per criterion. Empty evidence keeps the story open. -->

