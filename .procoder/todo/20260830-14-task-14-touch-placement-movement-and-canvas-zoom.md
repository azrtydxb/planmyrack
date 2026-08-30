# Task 14: Touch placement, movement and canvas zoom

Status: done
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

- [x] Write the failing test `apps/app/test/gestures.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/canvas/useDragPlacement'".
- [x] Implement `positionFromPoint` and `useDragPlacement` (resolving the target rack/face from registered rack rectangles, calling `findFreeSlot`, and committing through `addDevice` or `moveDevice` with the `PlacementError` caught into `valid: false`); implement `CanvasGestures` with…
- [x] Run `npm test -w planmyrack` — passes; run `npx expo start --web` and drag a 2U item onto a rack by hand.
- [x] Run `procoder check`, then commit: `feat(app): touch placement, movement and canvas zoom`.

## Evidence

- `positionFromPoint` is pure and tested directly: a 2U device centres on the finger snapped to
  the half unit, and can never hang off either end of the rack.
- `useDragPlacement` tested through renderHook: a valid drop commits once and reports the placed
  position; a full face reports `valid: false` and commits nothing; a finger outside every rack
  has no target and drops nothing; a cancelled drag (backgrounding, interrupted gesture) leaves
  the layout untouched; a drag onto the rear face moves the device's face.
- `TestPinchOverDeviceZoomsNotDrags` drives a real pinch through
  `fireGestureHandler(getByGestureTestId('pinch'))` over a device and asserts the layout is never
  changed.
- Deviation, plan updated first: the canvas transform uses React Native's own Animated rather
  than Reanimated. Reanimated 4 initialises through react-native-worklets, which ships no jest
  setup and throws on import under the runner — keeping it would have made exactly this rule
  untestable. The transform is a single native-driven node either way.
