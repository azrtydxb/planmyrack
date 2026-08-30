# The app itself: canvas, touch placement, cabling, templates, exports and store-ready builds

Status: closed 2026-08-30
Created: 2026-08-30

## Goal

Everything the pure-logic and storage layers were built for becomes an app you can use: a rack
elevation you can place gear on with a finger, port-to-port cabling through a picker, an
inspector that adapts to the screen it is on, templates and a catalogue, JSON/PNG/print/CSV
exports, and iOS/Android/web builds carrying the identity and permissions a store submission
needs.

Delivers plan Tasks 12-21. The remaining 27 stories in the epic all become closable here,
because their criteria describe behaviour that only exists once there is a UI and a store to
observe it in.

## Result

committed: 27
done: 27 (20260830-a-2u-palette-item-dropped-on-an-empty-rack-lands-at-the, 20260830-a-48-port-switch-in-a-1u-slot-draws-every-port-within-the, 20260830-a-cable-between-two-different-racks-is-listed-in-the, 20260830-a-cable-s-label-colour-and-type-appear-in-the-overlay-the, 20260830-a-device-saved-as-a-template-can-be-dragged-into-another, 20260830-a-drop-onto-occupied-space-lands-in-the-nearest-free-slot, 20260830-a-layout-holds-several-racks-side-by-side-with-independent, 20260830-a-rack-s-summary-shows-the-sum-of-its-devices-watts-and, 20260830-a-save-built-on-a-stale-revision-is-refused-with-409-and, 20260830-cable-management-shelf-and-blank-panels-expose-no-network, 20260830-choosing-a-free-port-in-the-picker-creates-a-cable-and-both, 20260830-disconnecting-removes-the-cable-from-both-ends-the-overlay, 20260830-first-run-offers-local-vs-server-and-the-test-connection, 20260830-hooks-and-brush-cable-management-are-placeable-at-0-5u-and, 20260830-in-local-mode-with-the-network-off-layouts-can-be-created, 20260830-layouts-can-be-listed-with-modified-times-opened-renamed, 20260830-malformed-json-a-newer-schemaversion-or-duplicate-ids-are, 20260830-name-colour-watts-weight-depth-and-notes-edits-render, 20260830-npm-run-build-produces-a-web-bundle-that-loads-with-the, 20260830-one-build-serves-ios-android-and-desktop-browsers-the, 20260830-parts-csv-and-cable-csv-carry-the-documented-column-headers, 20260830-png-export-returns-a-non-empty-image-of-the-rack-elevation, 20260830-ports-already-carrying-a-cable-are-shown-in-the-picker-as, 20260830-switching-mode-in-settings-re-lists-layouts-from-the-newly, 20260830-the-bundled-catalogue-is-present-on-a-fresh-install-with, 20260830-the-canvas-pans-and-pinch-zooms-and-a-pinch-starting-on-a, 20260830-the-number-of-ports-drawn-on-a-device-always-equals-its)
carried: 0

## Retro

**What slowed us down.** The React Native toolchain, not the app. Two copies of React made every
hook read null; React Native Testing Library 14 rendered nothing against the React version Expo
pins, so 13 with react-test-renderer is used; Reanimated 4 throws on import under jest because
react-native-worklets ships no test setup, so the canvas transform uses React Native's own
Animated instead — which is one native-driven node either way, and keeps the pinch-versus-drag
rule testable. Each cost real time and none was a problem with the design.

**What we change next sprint.** Run the built app before believing a task is done. Both real bugs
this sprint — an autosave that made the app conflict with itself on two quick edits, and device
names drawn over their own ports — were invisible to 175 passing tests and obvious within thirty
seconds of using it. A browser pass belongs in every UI task, not at the end.

**One adaptation worth keeping.** Testing the rule at the layer that owns it. Geometry is a pure
function tested without rendering; the store contract is one suite run against four adapters; the
config plugin's transform is asserted on a fixture manifest and then proved by a real prebuild.
When something did break, the failing test named the layer, not just the symptom.
