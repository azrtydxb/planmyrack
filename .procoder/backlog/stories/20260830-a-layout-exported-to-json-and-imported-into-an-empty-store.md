# A layout exported to JSON and imported into an empty store reproduces every rack, device, colour, port count and cable — `TestJsonRoundTrip` — fails if any field differs between the original document and the re-imported one.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-12 (Export and import)
Plan: Task 7: Layout JSON and CSV serialisation
Test: `TestJsonRoundTrip`

The home-lab owner needs this to hold: a layout exported to JSON and imported into an empty store reproduces every rack, device, colour, port count and cable.

Done when `TestJsonRoundTrip` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A layout exported to JSON and imported into an empty store reproduces every rack, device, colour, port count and cable — `TestJsonRoundTrip` — fails if any field differs between the original document and the re-imported one.

## Evidence

- exportJson -> importJson reproduces racks, devices and links exactly; the imported document always has id null and revision 0 so it cannot overwrite a stored layout.
- Full suite: 65 tests across 8 files green; `npm run typecheck` exit 0;
  `npm run check:purity` exit 0; `procoder check` 0 blocking.
