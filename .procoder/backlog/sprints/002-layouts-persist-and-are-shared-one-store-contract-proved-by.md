# Layouts persist and are shared: one store contract proved by an in-memory, a node:sqlite and an HTTP adapter, with stale saves refused

Status: active
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
