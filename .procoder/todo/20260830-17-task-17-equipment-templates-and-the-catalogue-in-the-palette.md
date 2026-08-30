# Task 17: Equipment templates and the catalogue in the palette

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 17: Equipment templates and the catalogue in the palette)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 17: Equipment templates and the catalogue in the palette" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/src/ui/Palette.tsx` (catalogue and template sections),
`apps/app/src/ui/SaveTemplateButton.tsx`, `apps/app/src/state/useTemplates.ts`,
`apps/app/test/templates.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `apps/app/test/templates.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/state/useTemplates'".
- [x] Implement `templates.ts` in core, `useTemplates` over the store's template methods, the palette sections (device types, "My gear", then the catalogue grouped by vendor) and the inspector's "Save as template" button.
- [x] Run `npm test -w planmyrack` and `npm test -w @planmyrack/core` — both pass.
- [x] Run `procoder check`, then commit: `feat(app): equipment templates and catalogue palette`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
