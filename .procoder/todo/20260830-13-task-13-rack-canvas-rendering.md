# Task 13: Rack canvas rendering

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 13: Rack canvas rendering)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 13: Rack canvas rendering" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/app/rack/[id].tsx`, `apps/app/src/canvas/RackCanvas.tsx`,
`apps/app/src/canvas/RackFrame.tsx`, `apps/app/src/canvas/UScale.tsx`,
`apps/app/src/canvas/DeviceBox.tsx`, `apps/app/src/canvas/PortGrid.tsx`,
`apps/app/src/canvas/art.tsx` (hooks/brush/shelf/blank/PDU artwork as react-native-svg),
`apps/app/src/canvas/metrics.ts`, `apps/app/test/canvas.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `apps/app/test/canvas.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/canvas/RackCanvas'".
- [x] Implement `metrics.ts` first (pure, no React — `deviceRect`, `portRects`, port sizing that shrinks the port square and drops the printed number below 12 ports per row), then the components: `RackFrame` with `testID={`rack-${rack.id}`}`, `UScale` numbering from `rack.units` at the top down to 1,…
- [x] Run `npm test -w planmyrack` — passes.
- [x] Run `procoder check`, then commit: `feat(app): rack canvas with devices, ports and artwork`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
