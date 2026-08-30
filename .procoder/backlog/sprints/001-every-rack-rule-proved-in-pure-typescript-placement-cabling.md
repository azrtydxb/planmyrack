# Every rack rule proved in pure TypeScript: placement, cabling, undo and JSON round-trip, with no UI and no storage

Status: active
Created: 2026-08-30

## Goal

By the end of this sprint every rule about racks, devices and cables exists as pure functions
over an immutable `Layout`, proved by tests that run without a browser, a phone or a database.
A caller can build a layout of several 19" and 10" racks with independent front and rear faces,
place and move devices on a half-U grid without ever overlapping, wire ports and PDU outlets
with one cable per port, delete and resize without leaving a cable pointing at something that
no longer exists, undo and redo every one of those edits, and round-trip the whole thing
through JSON and CSV.

Why this boundary: these are the rules that are expensive to get wrong and cheap to test now.
Everything after this sprint — the canvas, gestures, SQLite, the server, the store builds —
consumes this layer and cannot correct it. Only 9 of the epic's 37 stories can honestly close
here; the other 28 need a UI or a store before their criterion is observable, so they stay in
the backlog rather than being committed and carried.

Delivers plan Tasks 1-8: the monorepo skeleton with the platform-purity gate, core types and
the device-type table, geometry, placement and movement, connections, undo/redo, JSON and CSV
serialisation, and the bundled equipment catalogue. Out: anything importing react,
react-native or expo, and anything that touches disk or network.
