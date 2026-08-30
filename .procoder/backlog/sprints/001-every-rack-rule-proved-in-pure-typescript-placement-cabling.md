# Every rack rule proved in pure TypeScript: placement, cabling, undo and JSON round-trip, with no UI and no storage

Status: closed 2026-08-30
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

## Result

committed: 9
done: 9 (20260830-a-device-s-power-inlet-connects-to-one-pdu-outlet-which, 20260830-a-layout-exported-to-json-and-imported-into-an-empty-store, 20260830-a-placed-device-can-be-moved-to-the-other-face-or-another, 20260830-deleting-a-device-removes-its-cables-from-the-overlay-and, 20260830-front-and-rear-hold-different-devices-in-the-same-u-space, 20260830-reducing-a-port-count-removes-exactly-the-cables-that-lost, 20260830-removing-a-rack-removes-its-devices-and-their-cables-and, 20260830-testsharedpackagesareplatformfree-run-by-npm-run-check, 20260830-undo-reverses-placement-movement-property-edits-connections)
carried: 0

## Retro

**What slowed us down.** The formatter, not the code. `procoder format` exits non-zero when a
file needs changing, so every `format ... && mv` chain silently skipped the write; the commit
gate then blocked on files I believed I had formatted. The same masked failure emptied
`.procoder/plans/rack-layout-planner.md` completely at one point — recovered with
`git checkout HEAD --`, which only worked because the plan had been committed first. Prettier
also proved non-idempotent on the plan's fenced code blocks, re-indenting them on every pass
until 43 fence markers had collapsed into inline spans and had to be repaired.

**What we change next sprint.** Formatting goes through `scripts/fmt.sh`, which compares before
writing and reports what it changed, and it runs as the last step before the gate rather than
mid-edit. Nothing large gets edited before it is committed, so `git checkout HEAD --` is always
an escape hatch.

**One adaptation worth keeping.** Proving each check can fail, not just pass. The purity gate was
run against a deliberately impure fixture and had to exit 1; `TestIdsAreUniqueWithoutCrypto`
installs a getter on `globalThis.crypto` and asserts it is never read. Both caught real problems
that a passing-only test would have shipped — and the plan's own worked example for
`findFreeSlot` turned out to be wrong (0.5 overlaps a device occupying [1, 3); the answer is 0),
which only surfaced because the test was written from the geometry rather than from the plan's
expected value.
