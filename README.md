# PlanMyRack

**v0.1.0** — pre-release: spec and plan complete, pure-logic layer under construction.

Plan a 19" or 10" server rack before you buy the gear or drill the holes — on a phone at the
rack, on a tablet on the sofa, or in a browser at the desk, from one codebase.

Drag equipment onto a rack in half-unit steps, name and colour it, give it network ports, wire
those ports to a switch or patch panel, map devices to PDU outlets, and keep it all in a local
database or on a small server several devices share.

## Status

Early. The spec and the implementation plan are complete and the pure-logic layer is being
built; there is no app to run yet.

- Spec: [`.procoder/specs/rack-layout-planner.md`](.procoder/specs/rack-layout-planner.md)
- Plan: [`.procoder/plans/rack-layout-planner.md`](.procoder/plans/rack-layout-planner.md) — 21 tasks
- Sprint 001 delivers plan Tasks 1-8: every rack rule as pure TypeScript, no UI, no storage.

## Layout

```text
packages/core      rack rules: geometry, placement, cabling, undo, JSON/CSV   (no UI, no I/O)
packages/catalog   device types and the bundled equipment catalogue
packages/storage   LayoutStore interface, its contract suite, memory + HTTP adapters
packages/server    optional local server: node:sqlite behind a REST API
apps/app           the only UI: Expo React Native, rendered to iOS, Android and the browser
assets/brand       logo sources; platform icons are derived from these
```

Only `packages/*` and `apps/app` that a task has reached exist on disk; the rest arrive in
plan order.

## Commands

| Command                | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `npm test`             | runs the test suites                                          |
| `npm run typecheck`    | type-checks the repository                                    |
| `npm run check:purity` | fails if a shared package imports react, react-native or expo |

`npm run web`, `npm run ios`, `npm run android` and `npm run server` arrive with the app and
server packages (plan Tasks 10 and 12) — they are deliberately absent until the code behind
them exists.

## Why the purity check

`packages/core`, `packages/catalog` and `packages/storage` hold the rules about racks, devices
and cables. Those rules run in three places — a browser, a phone, and a Node server — so a
single `import { View } from 'react-native'` in them makes the rules unusable in two of the
three. `npm run check:purity` fails the build rather than letting that spread.

## Requirements

Node 24 or newer. `node:sqlite` is used directly by the server package and only stops warning
that it is experimental at 24.
