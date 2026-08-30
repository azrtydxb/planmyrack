# Task 14: Touch placement, movement and canvas zoom

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 14: Touch placement, movement and canvas zoom)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 14: Touch placement, movement and canvas zoom" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/src/canvas/useDragPlacement.ts`, `apps/app/src/canvas/CanvasGestures.tsx`,
`apps/app/src/canvas/RackCanvas.tsx` (wire gestures), `apps/app/src/ui/Palette.tsx`,
`apps/app/test/gestures.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `apps/app/test/gestures.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/canvas/useDragPlacement'".
- [ ] Implement `positionFromPoint` and `useDragPlacement` (resolving the target rack/face from registered rack rectangles, calling `findFreeSlot`, and committing through `addDevice` or `moveDevice` with the `PlacementError` caught into `valid: false`); implement `CanvasGestures` with…
- [ ] Run `npm test -w planmyrack` — passes; run `npx expo start --web` and drag a 2U item onto a rack by hand.
- [ ] Run `procoder check`, then commit: `feat(app): touch placement, movement and canvas zoom`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
