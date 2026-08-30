# Layouts persist and are shared: one store contract proved by an in-memory, a node:sqlite and an HTTP adapter, with stale saves refused

Status: closed 2026-08-30
Created: 2026-08-30

## Goal

A layout can be saved, listed, reopened, renamed, duplicated and deleted through a single
`LayoutStore` interface, and three implementations of that interface — in memory, on
`node:sqlite`, and over HTTP against the local server — pass the _same_ contract test suite.
That shared suite is the point: local mode and server mode must behave identically, and the
only honest way to promise that is to run one set of tests against both.

The server holds the database and refuses a save built on a stale revision with HTTP 409 and its
current document, so two devices editing the same layout can never silently overwrite each
other. It also serves the web build with the cross-origin isolation headers OPFS needs.

Delivers plan Tasks 9-11. Out: the Expo app, the canvas, and the on-device expo-sqlite adapter —
that adapter re-runs this same contract suite in Task 12, which is what will prove the two
storage modes really are interchangeable.

## Result

committed: 1
done: 1 (20260830-a-layout-saved-on-one-client-against-the-server-is-listed)
carried: 0

## Retro

**What slowed us down.** Module resolution, twice. The contract suite imported `describe` from
vitest, which would have made it unusable under jest in the app — caught immediately because the
suite is meant to run in both. Then the server's `bin` pointed at a `dist/` that could never work:
its compiled output imports workspace packages that ship TypeScript source. Both were design
errors in the plan rather than typos.

**What we change next sprint.** The app's expo-sqlite adapter re-runs this same contract suite as
its first test, before any UI is written, so the "local and server behave identically" claim is
proved rather than asserted. And every `.ts` extension convention introduced here gets checked
against Metro's resolver early, not after the canvas is built on top of it.

**One adaptation worth keeping.** Running the thing for real alongside the suite. The server was
started, curled, and made to create and list a layout — which is how the dist/bin problem
surfaced at all. Nine passing HTTP tests said nothing about whether the shipped entry point
could start.
