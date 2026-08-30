# PlanMyRack

**v0.1.0** — the editor works on web, iOS and Android; not yet in the stores.

Plan a 19" or 10" server rack before you buy the gear or drill the holes — on a phone at the
rack, on a tablet on the sofa, or in a browser at the desk, from one codebase.

Drag equipment onto a rack in half-unit steps, name and colour it, give it network ports, wire
those ports to a switch or patch panel, map devices to PDU outlets, and keep it all in a local
database or on a small server several devices share.

## Status

The console is usable end to end: racks you can add, rename, resize and remove; equipment
dragged from the library onto a face in half-unit steps; ports wired port to port; cables, a
cable schedule, per-rack figures, JSON/CSV/PNG export and print. Layouts live on the device or
on a small server several devices share.

- Spec: [`.procoder/specs/rack-layout-planner.md`](.procoder/specs/rack-layout-planner.md)
- Plan: [`.procoder/plans/rack-layout-planner.md`](.procoder/plans/rack-layout-planner.md) — 21 tasks, all built
- Design reference: [`docs/design.md`](docs/design.md), including where the UI departs from it

## Layout

```text
packages/core      rack rules: geometry, placement, cabling, undo, JSON/CSV   (no UI, no I/O)
packages/catalog   device types and the bundled equipment catalogue
packages/storage   LayoutStore interface, its contract suite, memory + HTTP adapters
packages/server    optional local server: node:sqlite behind a REST API
apps/app           the only UI: Expo React Native, rendered to iOS, Android and the browser
assets/brand       logo sources; platform icons are derived from these
```

## Commands

| Command                | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `npm test`             | runs the test suites                                          |
| `npm run typecheck`    | type-checks the repository                                    |
| `npm run check:purity` | fails if a shared package imports react, react-native or expo |
| `npm run lint`         | eslint over the monorepo                                      |
| `npm run web`          | runs the app in a browser (Expo)                              |
| `npm run ios`          | runs the app in the iOS simulator                             |
| `npm run android`      | runs the app on an Android device or emulator                 |
| `npm run server`       | starts the optional local server on port 8787                 |
| `npm run build:web`    | exports the static web build to `apps/app/dist`               |

## Running the server

The server is optional: the app keeps layouts on the device unless you point it at one.

```sh
npm run server                      # http://localhost:8787, data/planmyrack.db
PORT=9000 PMR_DB=/srv/rack.db npm run server
PMR_WEB=apps/app/dist npm run server   # also serve the web build, cross-origin isolated
```

It has no authentication and is meant for a trusted home network. In the app, first run offers
"Connect to a server" — enter its address and press Test connection.

## Releasing

```sh
python3 scripts/derive-icons.py     # regenerate platform icons from assets/brand/
npm run build:web                   # static web build
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

The iOS and Android builds need an Expo account; `eas build` runs in the cloud, so Xcode and
Android Studio are not required locally.

## Why the purity check

`packages/core`, `packages/catalog` and `packages/storage` hold the rules about racks, devices
and cables. Those rules run in three places — a browser, a phone, and a Node server — so a
single `import { View } from 'react-native'` in them makes the rules unusable in two of the
three. `npm run check:purity` fails the build rather than letting that spread.

## Requirements

Node 24 or newer. `node:sqlite` is used directly by the server package and only stops warning
that it is experimental at 24.
