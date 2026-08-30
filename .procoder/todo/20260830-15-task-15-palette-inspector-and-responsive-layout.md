# Task 15: Palette, inspector and responsive layout

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 15: Palette, inspector and responsive layout)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 15: Palette, inspector and responsive layout" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/src/ui/Inspector.tsx`, `apps/app/src/ui/InspectorFields.tsx`,
`apps/app/src/ui/BottomSheet.tsx`, `apps/app/src/ui/useBreakpoint.ts`,
`apps/app/src/state/useLayoutEditor.ts`, `apps/app/test/inspector.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `apps/app/test/inspector.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/ui/Inspector'".
- [x] Implement `useBreakpoint` on `useWindowDimensions`, `useLayoutEditor` (history + debounced autosave + conflict capture), `InspectorFields` reading `DEVICE_TYPES[device.type].maxPorts` to decide whether the port and outlet fields exist, and `Inspector` with the accessibility labels used in the…
- [x] Run `npm test -w planmyrack` — passes.
- [x] Run `procoder check`, then commit: `feat(app): inspector, palette and responsive layout`.

## Evidence

- `TestInspectorLayoutByBreakpoint`: bottom sheet below 700pt, side panel above, each asserted to
  exclude the other.
- `TestPortlessTypesHidePortField`: no port field for hooks, brush, shelf or blank; a switch gets
  ports and a PDU gets outlets; a typed port count is capped at what the type allows (99 -> 8).
- `TestDevicePropertyRoundTrip`: an edit reaches the store through the debounced autosave and
  comes back on reopen, plus undo/redo over the same edit.
- The round-trip test first passed for the wrong reason: it waited on the `saving` flag, which
  reads 'idle' before the 600ms debounce has even fired. It now waits on the store's own content,
  so a broken autosave fails it.
- 43 app tests, typecheck clean.
