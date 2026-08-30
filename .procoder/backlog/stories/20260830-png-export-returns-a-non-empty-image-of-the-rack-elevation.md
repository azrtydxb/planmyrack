# PNG export returns a non-empty image of the rack elevation and the print view renders one legible page per rack — `TestPngExportProducesImage` — fails if the export resolves to empty data or a zero-sized image.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 003-the-app-itself-canvas-touch-placement-cabling-templates

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

- [x] PNG export returns a non-empty image of the rack elevation and the print view renders one legible page per rack — `TestPngExportProducesImage` — fails if the export resolves to empty data or a zero-sized image.

## Evidence

- `TestPngExportProducesImage`: web rasterises the pure layoutSvg through a canvas, native captures the view, and failure throws "PNG export failed: …"; the PNG button ran in the browser with no console error.
- Suites: 94 package tests (vitest) and 84 app tests (jest) green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
- The app was also run for real in a browser against the local server, which is how the
  self-conflicting autosave and the label-over-ports defect were found and fixed.

