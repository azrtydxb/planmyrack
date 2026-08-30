# rack-layout-planner — implementation plan

Status: ready
Spec: .procoder/specs/rack-layout-planner.md

## Goal

Ship a rack-layout planner as one Expo/react-native-web codebase for iOS, Android and the
browser, backed by a monorepo of platform-free logic packages and an optional local server.

## Architecture

`packages/core` holds every rule about racks, devices, cables and layout documents as pure
functions over an immutable `Layout` value; `packages/catalog` holds the bundled gear list;
`packages/storage` defines the `LayoutStore` interface, its contract test suite and the
in-memory and HTTP adapters; `packages/server` is a `node:sqlite` store behind a REST API.
`apps/app` is the only UI: an Expo Router app rendering the rack canvas with
react-native-svg and react-native-gesture-handler, and holding the one platform-bound
adapter (expo-sqlite) plus the export code. The app never contains a layout rule — it calls
`core`, and every store it can talk to satisfies the same contract suite.

## Constraints

Inherited by every task, taken from the spec:

- **Node 24+** on the server side. `node:sqlite` is experimental and prints a warning on
  Node 22.x; it is a release candidate (stability 1.2) from Node 24, which is the floor CI and
  the server's `engines` field declare.
- **One UI codebase**: Expo React Native to iOS/Android via EAS Build and to the browser via
  react-native-web. No second DOM-only web UI, no Capacitor.
- **Monorepo, npm workspaces**: `packages/*` and `apps/*`. `packages/core`,
  `packages/catalog` and `packages/storage` must not import `react`, `react-native`, `expo*`
  or any platform API; `npm run check:purity` enforces it.
- **TypeScript, `strict: true`** everywhere. Package names are `@planmyrack/core`,
  `@planmyrack/catalog`, `@planmyrack/storage`, `@planmyrack/server`; the app is `planmyrack`.
- **Test runners**: vitest (`globals: true`) for `packages/*` (`npm test -w @planmyrack/<pkg>`),
  jest with the `jest-expo` preset plus `@testing-library/react-native` for `apps/app`
  (`npm test -w planmyrack`). Root `npm test` runs both; root `npm run typecheck` runs `tsc -b`.
  The shared store contract suite runs under BOTH runners, so it must use the ambient
  `describe`/`it`/`expect` globals and import nothing from `vitest` or `@jest/globals`.
- **expo-sqlite on web** needs Metro configured for `.wasm` and the page served with
  `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`;
  without those headers OPFS is unavailable and local mode on web must refuse rather than
  silently lose data.
- **No Node or browser crypto in shared code**: Hermes exposes neither `crypto.randomUUID` nor
  `crypto.getRandomValues` by default, so ids are generated without them.
- **Units and geometry**: rack widths are exactly `19` and `10`; unit presets are
  `[6, 9, 12, 15, 18, 24, 42, 47]` with a typed value allowed in `1..48`; device heights are
  `[0.5, 1, 2, 3, 4, 5, 6, 8]`; positions are half-unit multiples measured from the bottom of
  the rack, `posU = 0` being the lowest unit; `posU + heightU <= rack.units` always holds.
- **Invariants** (`packages/core` owns them, no caller may break them): no two devices overlap
  on the same rack face; every link endpoint references an existing device and a port index
  below that device's current port (or outlet) count; a port carries at most one link of its
  kind.
- **Storage modes are exclusive**: local (expo-sqlite on device, OPFS-backed SQLite in the
  browser) or server (`@planmyrack/server` over HTTP). The two stores never sync; JSON
  export/import is the only bridge. Server saves carry the revision they were loaded at and a
  stale save is refused with HTTP `409` and the server's current document.
- **Touch first**: every interactive target is at least 44x44 points; nothing depends on hover,
  right-click or a keyboard.
- **iOS/Android local network**: `app.json` declares `NSAllowsLocalNetworking`,
  `NSLocalNetworkUsageDescription` and an Android cleartext exception scoped to private ranges.
- **Exact copy** used in more than one place: stale save — "This layout changed on another
  device. Reload it, or export your version to JSON first."; server down — "Can't reach the
  server."; import refused — "That file isn't a layout this version can open:".

## Task 1: Monorepo skeleton and the purity gate

Files: `package.json` (root: workspaces `packages/*`, `apps/*`, scripts `test`, `typecheck`,
`check:purity`), `tsconfig.base.json` (`strict: true`, `moduleResolution: "bundler"`),
`vitest.workspace.ts`, `scripts/check-purity.mjs` (scanner + CLI), `tests/purity.test.ts`,
`tests/fixtures/impure/bad.ts` (positive control), `.gitignore`, `README.md` (how to run web,
iOS, Android and the server).

Interfaces produced: `findPlatformImports(dirs: string[]): Promise<{ file: string, module: string }[]>`
exported from `scripts/check-purity.mjs`; npm scripts `npm test`, `npm run typecheck`,
`npm run check:purity`; workspace names `@planmyrack/core|catalog|storage|server` and `planmyrack`.

- [ ] Write `tests/fixtures/impure/bad.ts` containing exactly `import { View } from 'react-native'
export const x = View`.
- [ ] Write the failing test `tests/purity.test.ts`:

import { describe, it, expect } from "vitest";
import { findPlatformImports } from "../scripts/check-purity.mjs";

describe("TestSharedPackagesArePlatformFree", () => {
it("flags a file importing react-native", async () => {
expect(await findPlatformImports(["tests/fixtures/impure"])).toEqual([
{ file: "tests/fixtures/impure/bad.ts", module: "react-native" },
]);
});
it("finds nothing in the shared packages", async () => {
expect(await findPlatformImports(["packages"])).toEqual([]);
});
});

              Run `npm test` — expect FAIL with "Cannot find module '../scripts/check-purity.mjs'".

- [ ] Implement `scripts/check-purity.mjs`: walk each directory for TypeScript sources and flag

```text
every static import or require whose specifier is react, react-dom, react-native, any
```

      scoped react-native package, or any expo package. Return one entry per hit giving the file
      and the offending module, sorted by file; the CLI prints each hit and exits 1 when any is
      found, 0 otherwise.

- [ ] Run `npm test` — both cases pass. Run `npm run check:purity` — exits 0.
- [ ] Run `procoder check`, then commit: `chore: monorepo skeleton with platform-purity gate`.

## Task 2: Core types and the device-type table

Files: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/src/types.ts`,
`packages/core/src/deviceTypes.ts`, `packages/core/src/ids.ts`, `packages/core/src/index.ts`,
`packages/core/test/deviceTypes.test.ts`.

Interfaces produced (all re-exported from `@planmyrack/core`):
`SCHEMA_VERSION = 1`; `type Face = 'front' | 'rear'`; `type RackWidth = 19 | 10`;
`type DeviceType = 'equipment'|'server'|'switch'|'patch'|'pdu'|'ups'|'shelf'|'blank'|'hooks'|'brush'`;
`type CableType = 'cat5e'|'cat6'|'cat6a'|'fibre'|'dac'|'power'`;
`interface Rack { id: string; name: string; width: RackWidth; units: number; depthMm: number }`;
`interface Device { id: string; rackId: string; face: Face; posU: number; heightU: number; type: DeviceType; name: string; colour: string; ports: number; outlets: number; watts: number; weightKg: number; depthMm: number; notes: string }`;
`interface LinkEnd { deviceId: string; port: number }`;
`interface Link { id: string; kind: 'network' | 'power'; a: LinkEnd; b: LinkEnd; label: string; colour: string; cableType: CableType }`;
`interface Layout { schemaVersion: number; id: string | null; name: string; revision: number; createdAt: string; updatedAt: string; racks: Rack[]; devices: Device[]; links: Link[] }`;
`interface DeviceTypeSpec { type: DeviceType; label: string; sizes: number[]; defaultPorts: number; maxPorts: number; defaultOutlets: number; maxOutlets: number; defaultColour: string }`;
`const DEVICE_TYPES: Record<DeviceType, DeviceTypeSpec>`; `const UNIT_SIZES = [0.5,1,2,3,4,5,6,8]`;
`const RACK_UNIT_PRESETS = [6,9,12,15,18,24,42,47]`; `const MAX_RACK_UNITS = 48`;
`const COLOURS: string[]` (ten hex values); `newId(): string` (16 chars of base36 from `Math.random()` and a monotonic counter — ids are
local document keys, never security tokens, and must not depend on `crypto`);
`newLayout(name: string): Layout`;
`newRack(input?: Partial<Rack>): Rack`.

- [ ] Write the failing test `packages/core/test/deviceTypes.test.ts`:

import { describe, it, expect } from "vitest";
import { DEVICE_TYPES, UNIT_SIZES, newLayout } from "../src/index.js";

describe("TestDeviceTypeTableIsConsistent", () => {
it("gives every type at least one size drawn from UNIT_SIZES", () => {
for (const spec of Object.values(DEVICE_TYPES)) {

```text
expect(spec.sizes.length).toBeGreaterThan(0);
expect(spec.sizes.every((s) => UNIT_SIZES.includes(s))).toBe(true);
```

    }

});
it("never defaults a device to more ports or outlets than it allows", () => {
for (const spec of Object.values(DEVICE_TYPES)) {

```text
expect(spec.defaultPorts).toBeLessThanOrEqual(spec.maxPorts);
expect(spec.defaultOutlets).toBeLessThanOrEqual(spec.maxOutlets);
```

    }

});
it("gives cable management, shelves and blanks no ports at all", () => {
for (const t of ["hooks", "brush", "shelf", "blank"] as const) {

```text
expect(DEVICE_TYPES[t].maxPorts).toBe(0);
```

    }

});
it("starts a new layout with one 19-inch rack and nothing in it", () => {
const l = newLayout("Basement");
expect(l.racks).toHaveLength(1);
expect(l.racks[0].width).toBe(19);
expect([l.devices.length, l.links.length, l.revision]).toEqual([0, 0, 0]);
});
});

              Run `npm test -w @planmyrack/core` — expect FAIL with "Cannot find module '../src/index.js'".

- [ ] Add to the Task 2 test file:

```text
describe('TestIdsAreUniqueWithoutCrypto', () => {
it('mints 10000 distinct ids', () => {
expect(new Set(Array.from({ length: 10_000 }, newId)).size).toBe(10_000)
})
it('touches no crypto global', () => {
const spy = vi.spyOn(globalThis, 'crypto' as never, 'get')
newId()
expect(spy).not.toHaveBeenCalled()
})
})
```

- [ ] Implement `types.ts` (types and constants above), `ids.ts` (`newId` = `Math.random()`
      base36 plus a module-level counter, no `crypto` use), and `deviceTypes.ts` with these rows:
      equipment (sizes all of UNIT_SIZES, 0/8 ports), server (1/2/4U, 2/8), switch (1/2U, 24/48),
      patch (1/2U, 24/48), pdu (1/2U, 0/2 ports, 8/24 outlets), ups (2/3/4U, 1/2 ports),
      shelf (1/2U, 0/0), blank (0.5/1/2U, 0/0), hooks (0.5/1U, 0/0), brush (0.5/1U, 0/0);
      `newLayout` sets `schemaVersion: SCHEMA_VERSION`, `id: null`, `revision: 0`, ISO timestamps
      and one `newRack()` (19", 12U, 450mm depth).
- [ ] Run `npm test -w @planmyrack/core` — passes. Run `npm run check:purity` — exits 0.
- [ ] Run `procoder check`, then commit: `feat(core): layout types and device-type table`.

## Task 3: Geometry — snapping, collision, free-slot search, rack stats

Files: `packages/core/src/geometry.ts`, `packages/core/src/index.ts` (re-export),
`packages/core/test/geometry.test.ts`.

Interfaces produced: `snapHalfU(u: number): number`;
`collides(devices: Device[], probe: { id?: string; rackId: string; face: Face; posU: number; heightU: number }): boolean`;
`findFreeSlot(devices: Device[], rack: Rack, probe: { id?: string; face: Face; posU: number; heightU: number }): number | null`
(searches outward from `probe.posU` in 0.5U steps, returns the snapped position or `null`);
`interface RackStats { unitsUsedFront: number; unitsUsedRear: number; unitsFree: number; watts: number; weightKg: number; deviceCount: number; linkCount: number }`;
`rackStats(layout: Layout, rackId: string): RackStats`.

- [ ] Write the failing test `packages/core/test/geometry.test.ts` with a `mk(partial)` helper
      building a `Device` from `newDevice`-shaped defaults, covering:

```text
describe('TestDropSnapsToHalfU', () => {
it('snaps a pointer position to the nearest half unit', () => {
expect([snapHalfU(3.26), snapHalfU(3.74), snapHalfU(-0.1)]).toEqual([3.5, 3.5, 0])
})
})
describe('TestDropFindsNearestFreeSlotElseRefuses', () => {
const rack = newRack({ units: 4 })
it('returns the requested slot when it is empty', () => {
expect(findFreeSlot([], rack, { face: 'front', posU: 1, heightU: 2 })).toBe(1)
})
it('slides to the closest free slot when the target is taken', () => {
const sitting = mk({ rackId: rack.id, posU: 1, heightU: 2 })
expect(findFreeSlot([sitting], rack, { face: 'front', posU: 1, heightU: 1 })).toBe(0.5)
})
it('returns null when the face has no room at all', () => {
const full = mk({ rackId: rack.id, posU: 0, heightU: 4 })
expect(findFreeSlot([full], rack, { face: 'front', posU: 0, heightU: 1 })).toBeNull()
})
it('never returns a slot that runs past the top of the rack', () => {
expect(findFreeSlot([], rack, { face: 'front', posU: 3.5, heightU: 2 })).toBe(2)
})
})
describe('TestHalfUDevicesShareAUnit', () => {
it('lets two half-U devices sit in the same unit without colliding', () => {
const lower = mk({ rackId: 'r1', posU: 0, heightU: 0.5 })
expect(collides([lower], { rackId: 'r1', face: 'front', posU: 0.5, heightU: 0.5 })).toBe(false)
expect(collides([lower], { rackId: 'r1', face: 'front', posU: 0, heightU: 0.5 })).toBe(true)
})
})
describe('TestFacesAreIndependent', () => {
it('lets front and rear devices occupy the same units', () => {
const front = mk({ rackId: 'r1', face: 'front', posU: 0, heightU: 2 })
expect(collides([front], { rackId: 'r1', face: 'rear', posU: 0, heightU: 2 })).toBe(false)
})
})
describe('TestRackWattsSum', () => {
it('adds up the watts of every device in the rack and counts each face separately', () => {
/* two front devices 30W + 12W, one rear device 8W, in a 12U rack */
expect(stats.watts).toBe(50)
expect([stats.unitsUsedFront, stats.unitsUsedRear]).toEqual([3, 1])
expect(stats.unitsFree).toBe(9)
})
})
```

```text
Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'snapHalfU'".
```

- [ ] Implement `geometry.ts`. `collides` compares only devices sharing `rackId` and `face` and
      ignores `probe.id`; `findFreeSlot` clamps to `0..rack.units - heightU`, tries
      `probe.posU` first, then `±0.5, ±1.0, …` up to `rack.units`, returning the first
      collision-free snapped position; `unitsFree` is `rack.units - max(usedFront, usedRear)`.
- [ ] Run `npm test -w @planmyrack/core` — passes.
- [ ] Run `procoder check`, then commit: `feat(core): rack geometry, collision and free-slot search`.

## Task 4: Placement and movement operations

Files: `packages/core/src/errors.ts`, `packages/core/src/ops.ts`, `packages/core/src/index.ts`
(re-export), `packages/core/test/placement.test.ts`.

Interfaces produced: `class PlacementError extends Error` (`.code = 'no-room'`);
`newDevice(input: { rackId: string; face: Face; posU: number; heightU: number; type: DeviceType } & Partial<Device>): Device`
(fills name `"<label> <size>"` with `0.5U` written `½U`, colour and port/outlet counts from
`DEVICE_TYPES`); `addDevice(layout: Layout, device: Device): Layout` (throws `PlacementError`
when `findFreeSlot` returns null, otherwise places at the free slot);
`moveDevice(layout: Layout, deviceId: string, target: { rackId: string; face: Face; posU: number }): Layout`;
`updateDevice(layout: Layout, deviceId: string, patch: Partial<Device>): Layout`;
`removeDevice(layout: Layout, deviceId: string): Layout`;
`addRack(layout: Layout, rack: Rack): Layout`; `updateRack(layout: Layout, rackId: string, patch: Partial<Rack>): Layout`;
`removeRack(layout: Layout, rackId: string): Layout`. Every function returns a new `Layout`
and mutates nothing.

- [ ] Write the failing test `packages/core/test/placement.test.ts`:

```text
describe('TestDropFindsNearestFreeSlotElseRefuses', () => {
it('refuses the drop without changing the layout when nothing fits', () => {
const full = addDevice(base, newDevice({ rackId, face: 'front', posU: 0, heightU: 4, type: 'blank' }))
expect(() => addDevice(full, newDevice({ rackId, face: 'front', posU: 0, heightU: 1, type: 'server' })))
  .toThrow(PlacementError)
expect(full.devices).toHaveLength(1)
})
})
describe('TestMoveDeviceAcrossRackAndFaceKeepsLinks', () => {
it('moves a device to another rack and face while its cables survive', () => {
const moved = moveDevice(wired, sw.id, { rackId: rackB.id, face: 'rear', posU: 0 })
const dev = moved.devices.find((d) => d.id === sw.id)!
expect([dev.rackId, dev.face, dev.posU]).toEqual([rackB.id, 'rear', 0])
expect(moved.links).toHaveLength(1)
})
it('leaves the layout untouched when the target has no room', () => {
expect(() => moveDevice(packed, dev.id, { rackId: small.id, face: 'front', posU: 0 }))
  .toThrow(PlacementError)
})
})
describe('TestRemoveRackCascades', () => {
it('takes the rack, its devices and their cables with it', () => {
const after = removeRack(wired, rackA.id)
expect(after.racks.map((r) => r.id)).toEqual([rackB.id])
expect(after.devices.every((d) => d.rackId === rackB.id)).toBe(true)
expect(after.links).toHaveLength(0)
})
})
describe('TestRackShrinkNeverStrands', () => {
it('refuses to shrink a rack below a device already placed high in it', () => {
expect(() => updateRack(withTopDevice, rackA.id, { units: 4 })).toThrow(PlacementError)
})
})
```

```text
Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'addDevice'".
```

- [ ] Implement `errors.ts` and the placement half of `ops.ts`. `moveDevice` resolves the target
      through `findFreeSlot` against the destination rack and face, and throws `PlacementError`
      rather than returning a partially applied layout. `updateRack` re-validates every device in
      the rack against the new `units` and throws `PlacementError` when one would be stranded.
      `removeRack` and `removeDevice` both finish by calling `pruneLinks` (Task 5).
- [ ] Run `npm test -w @planmyrack/core` — passes.
- [ ] Run `procoder check`, then commit: `feat(core): device placement, movement and rack edits`.

## Task 5: Connections — network ports and PDU outlets

Files: `packages/core/src/links.ts`, `packages/core/src/ops.ts` (wire `pruneLinks` into
`updateDevice`/`removeDevice`/`removeRack`), `packages/core/src/index.ts` (re-export),
`packages/core/test/links.test.ts`.

Interfaces produced: `class PortBusyError extends Error` (`.code = 'port-busy'`, `.occupiedBy: Link`);
`portCapacity(device: Device, kind: 'network' | 'power'): number` (`ports` for network,
`outlets` for power); `portLink(layout: Layout, kind: 'network' | 'power', end: LinkEnd): Link | undefined`;
`connect(layout: Layout, kind: 'network' | 'power', a: LinkEnd, b: LinkEnd, meta?: { label?: string; colour?: string; cableType?: CableType }): Layout`
(throws `PortBusyError` when either end is taken, `PlacementError` with `.code = 'no-such-port'`
when an end is out of range or the device is missing, and rejects `a` equal to `b`);
`disconnect(layout: Layout, linkId: string): Layout`;
`pruneLinks(layout: Layout): Layout` (drops links whose device is gone or whose port index is
now beyond `portCapacity`); `otherEnd(link: Link, end: LinkEnd): LinkEnd`.

- [ ] Write the failing test `packages/core/test/links.test.ts`:

```text
describe('TestConnectFreePorts', () => {
it('creates one link and marks both ends connected', () => {
const l = connect(base, 'network', { deviceId: sw.id, port: 0 }, { deviceId: nas.id, port: 1 })
expect(l.links).toHaveLength(1)
expect(portLink(l, 'network', { deviceId: nas.id, port: 1 })!.a.deviceId).toBe(sw.id)
})
})
describe('TestPickerBlocksTakenPorts', () => {
it('refuses a second cable on a port that already has one', () => {
expect(() => connect(wired, 'network', { deviceId: sw.id, port: 0 }, { deviceId: pc.id, port: 0 }))
  .toThrow(PortBusyError)
})
it('refuses a port index the device does not have', () => {
expect(() => connect(base, 'network', { deviceId: nas.id, port: 99 }, { deviceId: sw.id, port: 2 }))
  .toThrow(/no-such-port/)
})
})
describe('TestDisconnectClearsBothEnds', () => {
it('leaves both ports free and the link gone', () => {
const after = disconnect(wired, wired.links[0].id)
expect(after.links).toHaveLength(0)
expect(portLink(after, 'network', { deviceId: sw.id, port: 0 })).toBeUndefined()
})
})
describe('TestPduOutletSingleOccupancy', () => {
it('lets one device take an outlet and refuses the next', () => {
const one = connect(base, 'power', { deviceId: pdu.id, port: 3 }, { deviceId: nas.id, port: 0 })
expect(() => connect(one, 'power', { deviceId: pdu.id, port: 3 }, { deviceId: sw.id, port: 0 }))
  .toThrow(PortBusyError)
})
it('keeps power and network links on separate books', () => {
expect(mixed.links.filter((k) => k.kind === 'power')).toHaveLength(1)
expect(mixed.links.filter((k) => k.kind === 'network')).toHaveLength(1)
})
})
describe('TestPortReductionPrunesExactLinks', () => {
it('drops only the cables whose port disappeared', () => {
const after = updateDevice(twoWired, sw.id, { ports: 1 })   // was 24, links on ports 0 and 5
expect(after.links.map((k) => k.a.port)).toEqual([0])
})
it('drops every cable when the type can no longer carry ports', () => {
expect(updateDevice(twoWired, sw.id, { type: 'blank' }).links).toHaveLength(0)
})
})
describe('TestDeleteDevicePrunesLinks', () => {
it('leaves no endpoint pointing at a missing device', () => {
const after = removeDevice(wired, sw.id)
const ids = new Set(after.devices.map((d) => d.id))
expect(after.links.every((k) => ids.has(k.a.deviceId) && ids.has(k.b.deviceId))).toBe(true)
})
})
```

```text
Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'connect'".
```

- [ ] Implement `links.ts` and wire `pruneLinks` into `updateDevice`, `removeDevice` and
      `removeRack`. `updateDevice` clamps `ports`/`outlets` to the new type's maxima before
      pruning, so a type change to a portless type zeroes both counts.
- [ ] Run `npm test -w @planmyrack/core` — passes.
- [ ] Run `procoder check`, then commit: `feat(core): port and outlet connections with link pruning`.

## Task 6: Undo and redo

Files: `packages/core/src/history.ts`, `packages/core/src/index.ts` (re-export),
`packages/core/test/history.test.ts`.

Interfaces produced: `interface History<T> { present: T; past: T[]; future: T[] }`;
`initHistory<T>(present: T): History<T>`; `commit<T>(h: History<T>, next: T): History<T>`
(no-op when `next === h.present`, caps `past` at 100 entries, clears `future`);
`undo<T>(h: History<T>): History<T>`; `redo<T>(h: History<T>): History<T>`;
`canUndo(h): boolean`; `canRedo(h): boolean`.

- [ ] Write the failing test `packages/core/test/history.test.ts`:

```text
describe('TestUndoRedoCoversAllEditKinds', () => {
const edits: [string, (l: Layout) => Layout][] = [
['place',      (l) => addDevice(l, newDevice({ rackId, face: 'front', posU: 0, heightU: 1, type: 'server' }))],
['move',       (l) => moveDevice(l, sw.id, { rackId, face: 'front', posU: 6 })],
['edit',       (l) => updateDevice(l, sw.id, { name: 'Core switch', watts: 42 })],
['connect',    (l) => connect(l, 'network', { deviceId: sw.id, port: 0 }, { deviceId: nas.id, port: 0 })],
['disconnect', (l) => disconnect(l, l.links[0].id)],
['delete',     (l) => removeDevice(l, nas.id)],
['rack',       (l) => removeRack(l, rackB.id)],
]
it.each(edits)('undoes and redoes a %s', (_kind, edit) => {
const before = seeded
const h = commit(initHistory(before), edit(before))
expect(h.present).not.toEqual(before)
expect(undo(h).present).toEqual(before)
expect(redo(undo(h)).present).toEqual(h.present)
})
})
describe('TestRemoveRackCascadesAndUndoes', () => {
it('restores the rack, its devices and their cables together', () => {
const h = commit(initHistory(wired), removeRack(wired, rackA.id))
expect(undo(h).present).toEqual(wired)
})
})
```

```text
Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'initHistory'".
```

- [ ] Implement `history.ts` as three plain arrays; `commit` pushes `present` onto `past`,
      `undo` pops `past` into `present` and pushes the old `present` onto `future`, `redo` mirrors it.
- [ ] Run `npm test -w @planmyrack/core` — passes.
- [ ] Run `procoder check`, then commit: `feat(core): undo and redo over layout edits`.

## Task 7: Layout JSON and CSV serialisation

Files: `packages/core/src/io.ts`, `packages/core/src/schema.ts` (zod document schema),
`packages/core/src/index.ts` (re-export), `packages/core/test/io.test.ts`,
`packages/core/package.json` (add dependency `zod@^3`).

Interfaces produced: `class ImportError extends Error` (`.reason: string`);
`exportJson(layout: Layout): string` (pretty-printed, `schemaVersion` first);
`importJson(text: string): Layout` (throws `ImportError` prefixed
`"That file isn't a layout this version can open: "` for malformed JSON, a
`schemaVersion` above `SCHEMA_VERSION`, duplicate ids, or an endpoint/rackId that is not in the
file; strips `id` and resets `revision` to 0 so an import never collides with a stored layout);
`partsCsv(layout: Layout): string` with header
`rack,face,position_u,height_u,name,type,ports,watts,weight_kg,depth_mm,notes`;
`cablesCsv(layout: Layout): string` with header
`from_device,from_port,to_device,to_port,label,type,colour`. Both quote fields containing
commas, quotes or newlines and end with a trailing newline.

- [ ] Write the failing test `packages/core/test/io.test.ts`:

```text
describe('TestJsonRoundTrip', () => {
it('reproduces every rack, device, colour, port count and cable', () => {
const back = importJson(exportJson(seeded))
expect({ ...back, id: seeded.id, revision: seeded.revision }).toEqual(seeded)
})
})
describe('TestImportRejectsBadSchema', () => {
it.each([
['not json at all', 'nonsense{'],
['a newer schema', JSON.stringify({ ...seeded, schemaVersion: 99 })],
['duplicate device ids', JSON.stringify(withDuplicateIds)],
['a cable pointing at a missing device', JSON.stringify(withDanglingLink)],
])('refuses %s and names the problem', (_case, text) => {
expect(() => importJson(text)).toThrow(/That file isn't a layout this version can open:/)
})
})
describe('TestCsvColumnsAndRowCounts', () => {
it('writes the documented headers with one row per device and per cable', () => {
const parts = partsCsv(seeded).trimEnd().split('\n')
expect(parts[0]).toBe('rack,face,position_u,height_u,name,type,ports,watts,weight_kg,depth_mm,notes')
expect(parts).toHaveLength(seeded.devices.length + 1)
const cables = cablesCsv(seeded).trimEnd().split('\n')
expect(cables[0]).toBe('from_device,from_port,to_device,to_port,label,type,colour')
expect(cables).toHaveLength(seeded.links.length + 1)
})
it('quotes a device name containing a comma', () => {
expect(partsCsv(withCommaName)).toContain('"Switch, core"')
})
})
describe('TestCableMetadataFlowsToScheduleAndCsv', () => {
it('carries label, colour and cable type into the cable CSV row', () => {
expect(cablesCsv(labelled)).toContain('uplink-1,cat6a,#22c55e')
})
})
```

```text
Run `npm test -w @planmyrack/core` — expect FAIL with "does not provide an export named 'exportJson'".
```

- [ ] Implement `schema.ts` with zod mirroring the `Layout` types (ports and outlets
      non-negative integers, `posU` a multiple of 0.5, `width` a literal union of 19 and 10),
      then `io.ts`: `importJson` parses, checks `schemaVersion <= SCHEMA_VERSION`, checks id
      uniqueness across racks/devices/links, checks every `device.rackId` and `link` endpoint
      resolves, and rethrows any zod issue as `ImportError` with the offending path in `.reason`.
- [ ] Run `npm test -w @planmyrack/core` — passes.
- [ ] Run `procoder check`, then commit: `feat(core): layout JSON import/export and CSV reports`.

## Task 8: Bundled equipment catalogue

Files: `packages/catalog/package.json` (depends on `@planmyrack/core`),
`packages/catalog/tsconfig.json`, `packages/catalog/src/bundled.ts`,
`packages/catalog/src/index.ts`, `packages/catalog/test/bundled.test.ts`.

Interfaces produced:
`interface CatalogEntry { id: string; vendor: string; model: string; type: DeviceType; heightU: number; ports: number; outlets: number; watts: number; colour: string; source: string }`;
`const BUNDLED_CATALOG: CatalogEntry[]`; `catalogByVendor(): Map<string, CatalogEntry[]>`;
`deviceFromCatalog(entry: CatalogEntry, at: { rackId: string; face: Face; posU: number }): Device`.

- [ ] Write the failing test `packages/catalog/test/bundled.test.ts`:

```text
describe('TestBundledCatalogueShape', () => {
it('ships the generic set and the named vendor families', () => {
const vendors = new Set(BUNDLED_CATALOG.map((e) => e.vendor))
for (const v of ['Generic', 'UniFi', 'MikroTik', 'TP-Link', 'Synology', 'QNAP', 'Cisco'])
```

expect(vendors).toContain(v);

```text

})
it('gives every entry a height from UNIT_SIZES and a non-negative port count', () => {
for (const e of BUNDLED_CATALOG) {
```

expect(UNIT_SIZES).toContain(e.heightU);
expect(e.ports).toBeGreaterThanOrEqual(0);
expect(e.ports).toBeLessThanOrEqual(DEVICE_TYPES[e.type].maxPorts);
expect(e.source).not.toBe("");

```text

    }

})
it('uses unique ids', () => {
expect(new Set(BUNDLED_CATALOG.map((e) => e.id)).size).toBe(BUNDLED_CATALOG.length)
})
it('places a catalogue entry as a device carrying its ports and watts', () => {
const d = deviceFromCatalog(BUNDLED_CATALOG[0], { rackId: 'r1', face: 'front', posU: 0 })
expect([d.ports, d.watts, d.heightU]).toEqual([BUNDLED_CATALOG[0].ports, BUNDLED_CATALOG[0].watts, BUNDLED_CATALOG[0].heightU])
})
})
`      Run`npm test -w @planmyrack/catalog` — expect FAIL with "Cannot find module '../src/index.js'".

- [ ] Implement `bundled.ts`: the Generic rows (server 1U/2U/4U, switch 8/16/24/48-port, patch
      panel 24/48-port, PDU 8-way, UPS 2U, shelf 1U/2U, blank 0.5U/1U/2U, hooks 0.5U/1U, brush
      0.5U/1U) plus roughly thirty vendor rows across UniFi, MikroTik, TP-Link, Synology, QNAP
      and Cisco SG, each with `source` naming the datasheet the figures came from.
- [ ] Run `npm test -w @planmyrack/catalog` — passes. Run `npm run check:purity` — exits 0.
- [ ] Run `procoder check`, then commit: `feat(catalog): bundled home-lab equipment catalogue`.

## Task 9: Store interface, in-memory adapter and the contract suite

Files: `packages/storage/package.json` (depends on `@planmyrack/core`; devDependency `vitest`
for its own tests only — `src/contract.ts` itself imports no test runner and is published as a
normal export so jest in `apps/app` can run it),
`packages/storage/tsconfig.json`, `packages/storage/src/types.ts`,
`packages/storage/src/memory.ts`, `packages/storage/src/contract.ts`,
`packages/storage/src/index.ts`, `packages/storage/test/memory.test.ts`.

Interfaces produced:
`interface LayoutSummary { id: string; name: string; revision: number; createdAt: string; updatedAt: string }`;
`interface Template { id: string; name: string; type: DeviceType; heightU: number; ports: number; outlets: number; watts: number; weightKg: number; depthMm: number; colour: string }`;

interface LayoutStore {
list(): Promise<LayoutSummary[]>;
get(id: string): Promise<Layout>;
create(layout: Layout): Promise<Layout>; // assigns id, revision 1
update(layout: Layout): Promise<Layout>; // revision must match; returns revision + 1
remove(id: string): Promise<void>;
listTemplates(): Promise<Template[]>;
saveTemplate(t: Template): Promise<Template>;
removeTemplate(id: string): Promise<void>;
}

`class StaleRevisionError extends Error` (`.current: Layout`, message
`"This layout changed on another device. Reload it, or export your version to JSON first."`);
`class NotFoundError extends Error`; `class StoreUnavailableError extends Error` (`.cause`,
message starts `"Can't reach the server."`); `createMemoryStore(): LayoutStore`;
`runStoreContract(name: string, make: () => Promise<{ store: LayoutStore; dispose?: () => Promise<void> }>): void`
— a vitest suite every adapter re-runs.

- [ ] Write the failing test `packages/storage/test/memory.test.ts`:
```

import { runStoreContract } from '../src/contract.js'
import { createMemoryStore } from '../src/index.js'
runStoreContract('memory store', async () => ({ store: createMemoryStore() }))

```text
and write `contract.ts` itself, which declares the ambient globals
```

(`declare const describe: (n: string, f: () => void) => void` and the same for `it`/`expect`,

```text

or `@types/jest`-free equivalents) and imports NOTHING from `vitest` or `@jest/globals`, so
the same file runs under vitest in `packages/*` and under jest in `apps/app`:
```

export function runStoreContract(name, make) {
describe(`TestLayoutCrudInBothModes — ${name}`, () => {
it('creates, lists, opens, renames, duplicates and deletes', async () => {

```text
const { store } = await make();
const made = await store.create(newLayout("Basement"));
expect(made.id).toBeTruthy();
expect(made.revision).toBe(1);
expect((await store.list()).map((s) => s.name)).toEqual(["Basement"]);
const copy = await store.create({ ...made, id: null, name: "Basement copy" });
expect(copy.id).not.toBe(made.id);
const renamed = await store.update({ ...made, name: "Rack A" });
expect([renamed.name, renamed.revision]).toEqual(["Rack A", 2]);
await store.remove(copy.id!);
expect(await store.list()).toHaveLength(1);
await expect(store.get(copy.id!)).rejects.toThrow(NotFoundError);
```

    })
    it('round-trips racks, devices and links through storage', async () => { /* deep-equal seeded layout */ })
    it('stores and removes equipment templates', async () => { /* create, list, remove */ })

})
describe(`TestStaleSaveRejected — ${name}`, () => {
it('refuses a save built on an old revision and hands back the current document', async () => {

```text
const { store } = await make();
const saved = await store.create(newLayout("Shared"));
const mine = { ...saved, name: "mine" };
await store.update({ ...saved, name: "theirs" }); // revision 1 -> 2
const err = await store.update(mine).catch((e) => e); // still revision 1
expect(err).toBeInstanceOf(StaleRevisionError);
expect(err.current.name).toBe("theirs");
expect(err.message).toContain("changed on another device");
```

    })

})
}

```text
Run `npm test -w @planmyrack/storage` — expect FAIL with "Cannot find module '../src/index.js'".

- [ ] Implement `types.ts`, the errors, and `memory.ts` as a `Map<string, Layout>` plus a
      `Map<string, Template>`; `create` deep-clones and assigns `newId()` and `revision: 1`,
      `update` compares revisions and throws `StaleRevisionError` carrying a clone of the stored
      document, and both stamp `updatedAt`.
- [ ] Run `npm test -w @planmyrack/storage` — passes. Run `npm run check:purity` — exits 0.
- [ ] Prove the suite is runner-agnostic: `grep -rE "from '(vitest|@jest/globals)'" packages/storage/src/contract.ts`
```

returns nothing, and Task 12 re-runs this same file under jest.

```text

- [ ] Run `procoder check`, then commit: `feat(storage): LayoutStore contract and in-memory adapter`.

## Task 10: The local server — node:sqlite store behind a REST API

Files: `packages/server/package.json` (depends on `@planmyrack/core`, `@planmyrack/storage`;
`"engines": { "node": ">=24" }`; `bin` entry `planmyrack-server` pointing at `dist/main.js`;
script `build` running `tsc -p tsconfig.json`), `packages/server/tsconfig.json`,
`packages/server/src/sqliteStore.ts`, `packages/server/src/http.ts`, `packages/server/src/main.ts`,
`packages/server/test/sqliteStore.test.ts`, `packages/server/test/http.test.ts`.

Interfaces produced: `createSqliteStore(dbPath: string): LayoutStore & { close(): void }`
(tables `layouts(id TEXT PRIMARY KEY, name TEXT NOT NULL, revision INTEGER NOT NULL, doc TEXT NOT NULL, created_at TEXT, updated_at TEXT)`
and `templates(id TEXT PRIMARY KEY, doc TEXT NOT NULL)`);
`createHttpServer(store: LayoutStore): http.Server`;
`startServer(opts: { port?: number; dbPath?: string }): Promise<{ url: string; close(): Promise<void> }>`
(defaults port `8787`, dbPath `./data/planmyrack.db`). Routes: `GET /api/health` →
`{ ok: true, version }`; `GET|POST /api/layouts`; `GET|PUT|DELETE /api/layouts/:id`;
`GET|POST /api/templates`; `PUT|DELETE /api/templates/:id`. A stale `PUT` answers `409` with
`{ error: <StaleRevisionError message>, current: <layout> }`; a missing id answers `404`;
a body failing the core schema answers `400` with the reason.

- [ ] Write the failing test `packages/server/test/sqliteStore.test.ts`:
```

import { mkdtempSync } from 'node:fs'; import { join } from 'node:path'; import { tmpdir } from 'node:os'
runStoreContract('sqlite store', async () => {
const store = createSqliteStore(join(mkdtempSync(join(tmpdir(), 'pmr-')), 'test.db'))
return { store, dispose: async () => store.close() }
})
describe('TestSqliteStoreSurvivesReopen', () => {
it('still has the layout after the database is closed and opened again', async () => {
const path = join(mkdtempSync(join(tmpdir(), 'pmr-')), 'test.db')
const first = createSqliteStore(path)
const saved = await first.create(newLayout('Basement'))
first.close()
const second = createSqliteStore(path)
expect((await second.get(saved.id!)).name).toBe('Basement')
second.close()
})
})

```text
      Run `npm test -w @planmyrack/server` — expect FAIL with "Cannot find module '../src/sqliteStore.js'".
- [ ] Implement `sqliteStore.ts` on `node:sqlite`'s `DatabaseSync` with prepared statements,
      storing the whole layout document in `doc` and mirroring `name`/`revision` into columns so
      `list()` needs no JSON parse.
- [ ] Write the failing test `packages/server/test/http.test.ts`:
```

describe('TestServerLayoutVisibleToSecondClient', () => {
it('lists a layout saved by one client to another client', async () => {
const { url, close } = await startServer({ port: 0, dbPath: tmpDb() })
const made = await (await fetch(`${url}/api/layouts`, post(newLayout('Shared')))).json()
const seen = await (await fetch(`${url}/api/layouts`)).json()
expect(seen.map((s: LayoutSummary) => s.id)).toContain(made.id)
await close()
})
})
describe('TestStaleSaveRejected — over HTTP', () => {
it('answers 409 with the server copy', async () => {
/* create, PUT twice at the same revision */
expect(second.status).toBe(409)
expect((await second.json()).current.name).toBe('theirs')
})
})
describe('TestHealthEndpoint', () => {
it('answers ok with a version', async () => {
expect(await (await fetch(`${url}/api/health`)).json()).toMatchObject({ ok: true })
})
})

```text
      Run `npm test -w @planmyrack/server` — expect FAIL with "Cannot find module '../src/main.js'".
- [ ] Add to `packages/server/test/http.test.ts`:
```

describe('TestWebBuildIsServedCrossOriginIsolated', () => {
it('sends the COOP and COEP headers OPFS needs', async () => {
const res = await fetch(`${url}/`)
expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin')
expect(res.headers.get('cross-origin-embedder-policy')).toBe('require-corp')
})
})

```text
- [ ] Implement `http.ts` on `node:http` (no framework): route table as above, JSON body capped
      at 5 MB, `access-control-allow-origin: *` so the web build can reach it, `204` carrying no
      body, every store error mapped to its status, and the static handler for `apps/app/dist`
      sending the two cross-origin-isolation headers above so expo-sqlite's OPFS backend works
      when the web app is served by this server. `main.ts` reads `PORT` and `PMR_DB`, calls
      `startServer` and logs the URL and database path.
- [ ] Run `npm run build -w @planmyrack/server && node packages/server/dist/main.js --help` — the
      compiled binary starts, so the `bin` entry is not a promise about uncompiled TypeScript.
- [ ] Run `npm test -w @planmyrack/server` — passes.
- [ ] Run `procoder check`, then commit: `feat(server): node:sqlite store behind a REST API`.

## Task 11: HTTP store adapter and server probe

Files: `packages/storage/src/http.ts`, `packages/storage/src/index.ts` (re-export),
`packages/storage/test/http.test.ts` (runs the contract suite against a real server from
`@planmyrack/server`, added there as a devDependency).

Interfaces produced: `createHttpStore(baseUrl: string, fetchImpl?: typeof fetch): LayoutStore`
(maps `409` to `StaleRevisionError` with the returned `current`, `404` to `NotFoundError`, and
any network failure or non-JSON body to `StoreUnavailableError`);
`probeServer(baseUrl: string, fetchImpl?: typeof fetch): Promise<{ ok: boolean; version?: string; reason?: string }>`
(never throws; `reason` is the HTTP status text or the network error message).

- [ ] Write the failing test `packages/storage/test/http.test.ts`:
```

runStoreContract('http store', async () => {
const server = await startServer({ port: 0, dbPath: tmpDb() })
return { store: createHttpStore(server.url), dispose: () => server.close() }
})
describe('TestModeChooserAndHealthProbe', () => {
it('reports ok against a running server', async () => {
expect(await probeServer(server.url)).toMatchObject({ ok: true })
})
it('reports a named failure against a dead address without throwing', async () => {
const res = await probeServer('http://127.0.0.1:1')
expect(res.ok).toBe(false)
expect(res.reason).toBeTruthy()
})
it('raises StoreUnavailableError from the store when the server is gone', async () => {
await expect(createHttpStore('http://127.0.0.1:1').list()).rejects.toThrow(StoreUnavailableError)
})
})
Run `npm test -w @planmyrack/storage` — expect FAIL with "does not provide an export named 'createHttpStore'".

```text

- [ ] Implement `http.ts` with `fetch` and a 5-second timeout built from `AbortController` plus
      `setTimeout` (NOT `AbortSignal.timeout`, which Hermes does not reliably provide), clearing
      the timer in a `finally`, plus the error mapping above.
- [ ] Run `npm test -w @planmyrack/storage` — passes. Run `npm run check:purity` — exits 0
      (`fetch` is a platform-neutral global and is not on the banned list).
- [ ] Run `procoder check`, then commit: `feat(storage): HTTP adapter and server probe`.

## Task 12: Expo app shell, local SQLite store, mode chooser and settings

Files: `apps/app/package.json` (`planmyrack`; expo, expo-router, expo-sqlite,
`@react-native-async-storage/async-storage`, react-native-svg, react-native-gesture-handler,
react-native-reanimated, react-native-view-shot, expo-print, expo-sharing, expo-file-system,
`@planmyrack/core|catalog|storage`), `apps/app/app.json`, `apps/app/babel.config.js`,
`apps/app/jest.config.js` (preset `jest-expo`, `setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js']`,
`transformIgnorePatterns` allowing `react-native-gesture-handler` and the workspace packages),
`apps/app/metro.config.js` (workspace-aware, `resolver.assetExts` including `wasm` and
`server.headers` setting COOP/COEP so expo-sqlite's OPFS backend works in `expo start --web`),
`apps/app/app/_layout.tsx`, `apps/app/app/index.tsx`, `apps/app/app/first-run.tsx`,
`apps/app/app/settings.tsx`, `apps/app/src/storage/sqliteStore.ts`,
`apps/app/src/storage/settings.ts`, `apps/app/src/storage/StoreProvider.tsx`,
`apps/app/test/sqliteStore.test.ts`, `apps/app/test/mode.test.tsx`.

Interfaces produced: `createExpoSqliteStore(dbName?: string): Promise<LayoutStore>` (opens
`planmyrack.db` through `expo-sqlite`, same two tables as the server store);
`type Mode = { kind: 'local' } | { kind: 'server'; url: string }`;
`loadMode(): Promise<Mode | null>` / `saveMode(m: Mode): Promise<void>` (AsyncStorage-backed);
`StoreProvider` React component; `useStore(): LayoutStore`; `useMode(): { mode: Mode; setMode(m: Mode): Promise<void> }`.
Routes: `/` layouts list, `/first-run`, `/settings`, `/rack/[id]` (Task 13).

- [ ] Write the failing test `apps/app/test/sqliteStore.test.ts` running the shared contract:
```

import { runStoreContract } from '@planmyrack/storage/contract'
runStoreContract('expo-sqlite store', async () => ({ store: await createExpoSqliteStore(`t-${Math.random()}.db`) }))

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/storage/sqliteStore'".
- [ ] Implement `sqliteStore.ts` against `expo-sqlite`'s async API, reusing the same SQL as the
      server store.
- [ ] Write the failing test `apps/app/test/mode.test.tsx`:
```

describe('TestModeChooserAndHealthProbe', () => {
it('shows the chooser on first run and stores the picked mode', async () => {
render(<FirstRunScreen />)
fireEvent.press(screen.getByText('Work on this device only'))
await waitFor(() => expect(loadMode()).resolves.toEqual({ kind: 'local' }))
})
it('reports a failed connection test by name, and does not save the mode', async () => {
render(<FirstRunScreen />)
fireEvent.changeText(screen.getByPlaceholderText('http://192.168.1.20:8787'), 'http://127.0.0.1:1')
fireEvent.press(screen.getByText('Test connection'))
await screen.findByText(/Can't reach the server/)
})
})
describe('TestModeSwitchRelistsLayouts', () => {
it('lists the other store\'s layouts after switching mode in settings', async () => {
/* local store holds "Local rack", stubbed server store holds "Server rack" */
render(<SettingsScreen />); fireEvent.press(screen.getByText('Connect to a server'))
await screen.findByText('Server rack')
expect(screen.queryByText('Local rack')).toBeNull()
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../app/first-run'".
- [ ] Implement `settings.ts`, `StoreProvider.tsx` (builds `createExpoSqliteStore` or
      `createHttpStore` from the stored mode and re-creates it when the mode changes),
      `first-run.tsx` (the two options, the URL field with placeholder
```

`http://192.168.1.20:8787` and a "Test connection" button calling `probeServer`), and

```text

      `settings.tsx` (same controls plus the active mode shown in the app header).

- [ ] Run `npm test -w planmyrack` — passes. Run `npx expo start --web` and confirm the chooser
      renders in a browser.
- [ ] Run `procoder check`, then commit: `feat(app): Expo shell, local SQLite store and mode chooser`.

## Task 13: Rack canvas rendering

Files: `apps/app/app/rack/[id].tsx`, `apps/app/src/canvas/RackCanvas.tsx`,
`apps/app/src/canvas/RackFrame.tsx`, `apps/app/src/canvas/UScale.tsx`,
`apps/app/src/canvas/DeviceBox.tsx`, `apps/app/src/canvas/PortGrid.tsx`,
`apps/app/src/canvas/art.tsx` (hooks/brush/shelf/blank/PDU artwork as react-native-svg),
`apps/app/src/canvas/metrics.ts`, `apps/app/test/canvas.test.tsx`.

Interfaces produced: `const U_PX = 26`; `const RACK_INNER_PX: Record<RackWidth, number> = { 19: 470, 10: 280 }`;
`deviceRect(rack: Rack, device: Device): { top: number; height: number; width: number }`
(`top = (rack.units - device.posU - device.heightU) * U_PX`);
`portRects(device: Device): { x: number; y: number; size: number }[]` (one row up to 8 ports or
1U devices, two rows above that, never exceeding the device rectangle);
`<RackCanvas layout face onSelect selectedId />`; `<DeviceBox device rack selected onPress />`
with `testID={`device-${device.id}`}`; `<PortGrid device kind onPortPress />` with
`testID={`port-${device.id}-${kind}-${index}`}`.

- [ ] Write the failing test `apps/app/test/canvas.test.tsx`:
```

            describe('TestLayoutHoldsMixedWidthRacks', () => {
              it('draws a 19-inch and a 10-inch rack at different widths with their own U scales', () => {
                render(<RackCanvas layout={twoRacks} face="front" />)
                expect(screen.getByTestId(`rack-${wide.id}`)).toHaveStyle({ width: RACK_INNER_PX[19] })
                expect(screen.getByTestId(`rack-${narrow.id}`)).toHaveStyle({ width: RACK_INNER_PX[10] })
                expect(screen.getAllByText('12')).toHaveLength(2)   // both scales, top unit
              })
            })
            describe('TestPortCountRendersExactly', () => {
              it.each([[4, 'equipment'], [24, 'switch'], [48, 'switch']])('draws %i ports', (n, type) => {
                render(<RackCanvas layout={withDevice({ type, ports: n })} face="front" />)
                expect(screen.getAllByTestId(/^port-.*-network-/)).toHaveLength(n)
              })
            })
            describe('TestDensePortsStayInsideDevice', () => {
              it('keeps every port of a 48-port 1U switch inside the device box', () => {
                const rects = portRects({ ...sw, ports: 48, heightU: 1 })
                const box = deviceRect(rack, { ...sw, ports: 48, heightU: 1 })
                for (const r of rects) {

```text
expect(r.x + r.size).toBeLessThanOrEqual(box.width);
expect(r.y + r.size).toBeLessThanOrEqual(box.height);
```

    }

})
})
describe('TestCableManagementFlavoursRender', () => {
it('draws hooks and brush differently, and both differently from a blank', () => {
const svg = (type: DeviceType) => render(<DeviceBox device={mk({ type })} rack={rack} />).toJSON()
expect(JSON.stringify(svg('hooks'))).not.toBe(JSON.stringify(svg('brush')))
expect(JSON.stringify(svg('hooks'))).not.toBe(JSON.stringify(svg('blank')))
})
it('offers both flavours at half a unit and one unit', () => {
for (const t of ['hooks', 'brush'] as const) expect(DEVICE_TYPES[t].sizes).toEqual([0.5, 1])
})
})

```text
Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/canvas/RackCanvas'".

- [ ] Implement `metrics.ts` first (pure, no React — `deviceRect`, `portRects`, port sizing that
      shrinks the port square and drops the printed number below 12 ports per row), then the
      components: `RackFrame` with `testID={`rack-${rack.id}`}`, `UScale` numbering from
      `rack.units` at the top down to 1, `DeviceBox` filling with `device.colour`, `PortGrid`
      drawing a 44x44-point touch target around each port square even when the square is smaller.
- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): rack canvas with devices, ports and artwork`.

## Task 14: Touch placement, movement and canvas zoom

Files: `apps/app/src/canvas/useDragPlacement.ts`, `apps/app/src/canvas/CanvasGestures.tsx`,
`apps/app/src/canvas/RackCanvas.tsx` (wire gestures), `apps/app/src/ui/Palette.tsx`,
`apps/app/test/gestures.test.tsx`.

Interfaces produced:
`positionFromPoint(rack: Rack, rackTopY: number, pointerY: number, heightU: number): number`
(returns the snapped `posU` centring the device on the pointer, clamped to the rack);
`useDragPlacement(args: { layout: Layout; onCommit(next: Layout): void }): { drag: DragState | null; startNew(type: DeviceType, heightU: number, at: Point): void; startMove(deviceId: string, at: Point): void; moveTo(at: Point): void; drop(): void; cancel(): void }`;
`type DragState = { kind: 'new' | 'move'; heightU: number; target: { rackId: string; face: Face; posU: number } | null; valid: boolean }`;
`<CanvasGestures scale pan onScaleChange onPanChange>` composing a pinch gesture with the
device pan gesture so a two-finger gesture always wins. The gestures are declared with
`Gesture.Pinch().withTestId('pinch')` and `Gesture.Pan().withTestId('device-pan')`, because
`getByGestureTestId` resolves that id and not a component `testID`.

- [ ] Write the failing test `apps/app/test/gestures.test.tsx`:
```

describe('TestDropSnapsToHalfU', () => {
it('places a dragged 2U item at the half-unit position under the finger', () => {
const rack = newRack({ units: 12 })
expect(positionFromPoint(rack, 0, 3.3 * U_PX, 2)).toBe(9.5) // 12 - 3.3 - 1, snapped
})
})
describe('TestDropFindsNearestFreeSlotElseRefuses — through the UI', () => {
it('lands in the nearest free slot and leaves the layout alone when nothing fits', () => {
const { result } = renderHook(() => useDragPlacement({ layout: fullFace, onCommit }))
act(() => { result.current.startNew('server', 1, { x: 100, y: 100 }); result.current.drop() })
expect(onCommit).not.toHaveBeenCalled()
expect(result.current.drag).toBeNull()
})
})
describe('TestDragSurvivesBackgrounding', () => {
it('cancels a drag when the app is backgrounded, leaving the layout untouched', () => {
const { result } = renderHook(() => useDragPlacement({ layout: seeded, onCommit }))
act(() => { result.current.startMove(dev.id, { x: 10, y: 10 }); result.current.cancel() })
expect(onCommit).not.toHaveBeenCalled()
expect(result.current.drag).toBeNull()
})
})
describe('TestManyRacksStayReachableOnAPhone', () => {
it('scrolls six racks horizontally at phone width rather than squashing them', () => {
mockWindowWidth(390)
render(<RackCanvas layout={sixRacks} face="front" />)
expect(screen.getByTestId('canvas-scroll').props.horizontal).toBe(true)
expect(screen.getByTestId(`rack-${sixRacks.racks[5].id}`)).toBeTruthy()
})
})
describe('TestPinchOverDeviceZoomsNotDrags', () => {
it('zooms without moving the device the pinch started on', () => {
render(<RackCanvas layout={seeded} face="front" />)
fireGestureHandler(getByGestureTestId('pinch'), [{ state: State.BEGAN, scale: 1 }, { state: State.ACTIVE, scale: 2 }])
expect(onCommit).not.toHaveBeenCalled()
expect(screen.getByTestId('canvas-content')).toHaveStyle({ transform: [{ scale: 2 }] })
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/canvas/useDragPlacement'".
- [ ] Implement `positionFromPoint` and `useDragPlacement` (resolving the target rack/face from
      registered rack rectangles, calling `findFreeSlot`, and committing through `addDevice` or
      `moveDevice` with the `PlacementError` caught into `valid: false`); implement
      `CanvasGestures` with `Gesture.Simultaneous(pinch, pan)` and a device `Gesture.Pan()`
      that requires the pinch to fail, so two fingers never drag a device.
- [ ] Run `npm test -w planmyrack` — passes; run `npx expo start --web` and drag a 2U item onto a
      rack by hand.
- [ ] Run `procoder check`, then commit: `feat(app): touch placement, movement and canvas zoom`.

## Task 15: Palette, inspector and responsive layout

Files: `apps/app/src/ui/Inspector.tsx`, `apps/app/src/ui/InspectorFields.tsx`,
`apps/app/src/ui/BottomSheet.tsx`, `apps/app/src/ui/useBreakpoint.ts`,
`apps/app/src/state/useLayoutEditor.ts`, `apps/app/test/inspector.test.tsx`.

Interfaces produced: `useBreakpoint(): 'phone' | 'wide'` (phone below 700 points wide);
`useLayoutEditor(store: LayoutStore, layoutId: string | null): { layout: Layout; apply(fn: (l: Layout) => Layout): void; undo(): void; redo(): void; canUndo: boolean; canRedo: boolean; saving: 'idle' | 'saving' | 'error'; conflict: Layout | null; reload(): void }`
(history from `@planmyrack/core`, autosave debounced 600 ms, `StaleRevisionError` captured into
`conflict`); `<Inspector device onChange onDuplicate onDelete onSaveTemplate />` rendered inside
`<BottomSheet>` on phones and a side panel on wide screens, `testID` `inspector-sheet` / `inspector-panel`.

- [ ] Write the failing test `apps/app/test/inspector.test.tsx`:
```

describe('TestInspectorLayoutByBreakpoint', () => {
it('is a bottom sheet at phone width and a side panel at wide width', () => {
mockWindowWidth(390); render(<RackScreen layout={seeded} />)
expect(screen.getByTestId('inspector-sheet')).toBeTruthy()
mockWindowWidth(1280); render(<RackScreen layout={seeded} />)
expect(screen.getByTestId('inspector-panel')).toBeTruthy()
})
})
describe('TestPortlessTypesHidePortField', () => {
it.each(['hooks', 'brush', 'shelf', 'blank'])('offers no port field for %s', (type) => {
render(<Inspector device={mk({ type })} onChange={jest.fn()} />)
expect(screen.queryByLabelText('Network ports')).toBeNull()
})
it('offers a port field for a switch', () => {
render(<Inspector device={mk({ type: 'switch' })} onChange={jest.fn()} />)
expect(screen.getByLabelText('Network ports')).toBeTruthy()
})
})
describe('TestDevicePropertyRoundTrip', () => {
it('keeps an edited name, colour and watts after saving and reopening', async () => {
const store = createMemoryStore()
const { result } = renderHook(() => useLayoutEditor(store, saved.id))
act(() => result.current.apply((l) => updateDevice(l, dev.id, { name: 'Core switch', watts: 42, colour: '#22c55e' })))
await waitFor(() => expect(result.current.saving).toBe('idle'))
const reopened = await store.get(saved.id!)
expect(reopened.devices[0]).toMatchObject({ name: 'Core switch', watts: 42, colour: '#22c55e' })
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/ui/Inspector'".
- [ ] Implement `useBreakpoint` on `useWindowDimensions`, `useLayoutEditor` (history + debounced
      autosave + conflict capture), `InspectorFields` reading `DEVICE_TYPES[device.type].maxPorts`
      to decide whether the port and outlet fields exist, and `Inspector` with the accessibility
      labels used in the test. `Palette` (Task 14) gains the type groups from `DEVICE_TYPES`.
- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): inspector, palette and responsive layout`.

## Task 16: Port picker, cable overlay and cable schedule

Files: `apps/app/src/ui/PortPicker.tsx`, `apps/app/src/canvas/CableOverlay.tsx`,
`apps/app/src/ui/CableSchedule.tsx`, `apps/app/src/canvas/cablePath.ts`,
`apps/app/test/cables.test.tsx`.

Interfaces produced:
`cablePath(a: { x: number; y: number }, b: { x: number; y: number }): string` (cubic bezier,
horizontal control points, bow clamped to 40..160);
`<PortPicker layout device port kind onConnect onDisconnect onClose />` listing every device with
ports of that kind, each port a button with `testID={`pick-${deviceId}-${index}`}` and
`accessibilityState={{ disabled: taken }}`; `<CableOverlay layout face />` drawing only links
whose ends are both rendered on the visible face; `<CableSchedule layout onJumpToDevice />`
listing every link regardless of face.

- [ ] Write the failing test `apps/app/test/cables.test.tsx`:
```

describe('TestConnectFreePorts — through the UI', () => {
it('creates the cable and shows both ports connected', () => {
render(<RackScreen layout={seeded} />)
fireEvent.press(screen.getByTestId(`port-${sw.id}-network-0`))
fireEvent.press(screen.getByTestId(`pick-${nas.id}-1`))
expect(onCommit.mock.lastCall[0].links).toHaveLength(1)
})
})
describe('TestPickerBlocksTakenPorts — through the UI', () => {
it('shows a taken port as disabled and names what holds it', () => {
render(<PortPicker layout={wired} device={pc} port={0} kind="network" />)
expect(screen.getByTestId(`pick-${sw.id}-0`).props.accessibilityState.disabled).toBe(true)
expect(screen.getByText(/Taken by NAS/)).toBeTruthy()
})
})
describe('TestDisconnectClearsBothEnds — through the UI', () => {
it('offers disconnect on a connected port and removes it from the schedule', () => {
render(<RackScreen layout={wired} />)
fireEvent.press(screen.getByTestId(`port-${sw.id}-network-0`))
fireEvent.press(screen.getByText('Disconnect'))
expect(screen.queryByTestId(`cable-${wired.links[0].id}`)).toBeNull()
})
})
describe('TestCrossRackCableListedWithoutOverlay', () => {
it('draws nothing but still lists a cable whose ends are in different racks', () => {
render(<><CableOverlay layout={crossRack} face="front" /><CableSchedule layout={crossRack} /></>)
expect(screen.queryByTestId(`cable-path-${crossRack.links[0].id}`)).toBeNull()
expect(screen.getByTestId(`cable-row-${crossRack.links[0].id}`)).toBeTruthy()
})
})
describe('TestCableMetadataFlowsToScheduleAndCsv', () => {
it('shows the cable label, type and colour in the schedule row', () => {
render(<CableSchedule layout={labelled} />)
expect(screen.getByTestId(`cable-row-${labelled.links[0].id}`)).toHaveTextContent('uplink-1')
expect(screen.getByTestId(`cable-row-${labelled.links[0].id}`)).toHaveTextContent('cat6a')
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/ui/PortPicker'".
- [ ] Implement `cablePath`, `CableOverlay` (measuring port centres from `portRects` and
      `deviceRect` rather than from the DOM, so it works on native), `PortPicker` (grouped by
      device, taken ports disabled with the peer's name, `Disconnect` shown when the tapped port
      already has a link, and label/colour/type controls on the new cable) and `CableSchedule`.
- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): port picker, cable overlay and cable schedule`.

## Task 17: Equipment templates and the catalogue in the palette

Files: `apps/app/src/ui/Palette.tsx` (catalogue and template sections),
`apps/app/src/ui/SaveTemplateButton.tsx`, `apps/app/src/state/useTemplates.ts`,
`apps/app/test/templates.test.tsx`.

Interfaces produced: `useTemplates(store: LayoutStore): { templates: Template[]; save(device: Device): Promise<void>; remove(id: string): Promise<void> }`;
`templateFromDevice(device: Device): Template`; `deviceFromTemplate(t: Template, at: { rackId: string; face: Face; posU: number }): Device`
(both in `packages/core/src/templates.ts`, with unit tests alongside Task 2's).

- [ ] Write the failing test `apps/app/test/templates.test.tsx`:
```

describe('TestTemplateRoundTrip', () => {
it('saves a configured device and drops it into another layout unchanged', async () => {
const store = createMemoryStore()
const { result } = renderHook(() => useTemplates(store))
await act(() => result.current.save(mk({ name: 'UDM Pro', type: 'switch', ports: 10, watts: 33, colour: '#a855f7' })))
const placed = deviceFromTemplate(result.current.templates[0], { rackId: 'r2', face: 'front', posU: 0 })
expect(placed).toMatchObject({ name: 'UDM Pro', ports: 10, watts: 33, colour: '#a855f7', rackId: 'r2' })
})
})
describe('TestBundledCatalogueShape — in the palette', () => {
it('lists catalogue entries before any template is saved', () => {
render(<Palette templates={[]} onDragStart={jest.fn()} />)
expect(screen.getByText('UniFi')).toBeTruthy()
expect(screen.getAllByTestId(/^catalog-entry-/).length).toBeGreaterThan(10)
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/state/useTemplates'".
- [ ] Implement `templates.ts` in core, `useTemplates` over the store's template methods, the
      palette sections (device types, "My gear", then the catalogue grouped by vendor) and the
      inspector's "Save as template" button.
- [ ] Run `npm test -w planmyrack` and `npm test -w @planmyrack/core` — both pass.
- [ ] Run `procoder check`, then commit: `feat(app): equipment templates and catalogue palette`.

## Task 18: Rack summary and exports

Files: `apps/app/src/ui/RackSummary.tsx`, `apps/app/src/export/files.ts`,
`apps/app/src/export/png.ts`, `apps/app/src/export/print.ts`, `apps/app/app/rack/[id].tsx`
(export menu), `apps/app/test/exports.test.tsx`.

Interfaces produced: `<RackSummary layout rackId />` showing units used per face, units free,
total watts, total weight, device and cable counts, `testID={`summary-${rackId}`}`;
`layoutSvg(layout: Layout, face: Face): string` — a PURE function in
`packages/core/src/render/svg.ts` building the rack elevation from the same geometry constants,
which is what both PNG and print consume;
`shareText(filename: string, text: string, mime: string): Promise<void>` (expo-file-system +
expo-sharing on native, a Blob download on web);
`exportPng(layout: Layout, face: Face, filename: string): Promise<string>` — on web it rasterises
`layoutSvg` through an `Image` + `canvas.toDataURL`, on native it captures the live canvas with
react-native-view-shot's `captureRef`. It does NOT use react-native-view-shot on web: that path
goes through html2canvas, whose SVG support is partial, and this canvas is entirely SVG.
`printLayout(layout: Layout): Promise<void>` — wraps `layoutSvg` per rack in an HTML page and
calls expo-print on native / `window.print()` on web.

- [ ] Write the failing test `apps/app/test/exports.test.tsx`:
```

describe('TestRackWattsSum — in the UI', () => {
it('shows the rack total and updates when a device changes', () => {
const { rerender } = render(<RackSummary layout={seeded} rackId={rack.id} />)
expect(screen.getByTestId(`summary-${rack.id}`)).toHaveTextContent('50 W')
rerender(<RackSummary layout={updateDevice(seeded, dev.id, { watts: 60 })} rackId={rack.id} />)
expect(screen.getByTestId(`summary-${rack.id}`)).toHaveTextContent('98 W')
})
})
describe('TestPngExportProducesImage', () => {
it('captures a non-empty image of the canvas', async () => {
captureRef.mockResolvedValue('file:///tmp/rack.png')
await expect(exportPng(ref, 'rack.png')).resolves.toMatch(/\.png$/)
expect(captureRef).toHaveBeenCalledWith(ref, expect.objectContaining({ format: 'png' }))
})
it('reports the failure and leaves the other exports available', async () => {
captureRef.mockRejectedValue(new Error('unsupported'))
await expect(exportPng(ref, 'rack.png')).rejects.toThrow(/PNG export failed/)
})
})
describe('TestCsvColumnsAndRowCounts — from the export menu', () => {
it('shares the parts and cable CSVs produced by core', async () => {
render(<RackScreen layout={seeded} />)
fireEvent.press(screen.getByText('Export')); fireEvent.press(screen.getByText('Parts CSV'))
await waitFor(() => expect(shareSpy).toHaveBeenCalledWith('planmyrack-parts.csv', partsCsv(seeded), 'text/csv'))
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/export/png'".
- [ ] Write the failing test `packages/core/test/svg.test.ts`:
```

describe('TestLayoutSvgIsSelfContained', () => {
it('draws one rect per device and one path per drawable cable', () => {
const svg = layoutSvg(seeded, 'front')
expect(svg.match(/<rect/g)).toHaveLength(seeded.devices.length + seeded.racks.length)
expect(svg.startsWith('<svg')).toBe(true)
expect(svg).not.toContain('<image') // nothing external to fetch when rasterising
})
})

```text
      Run `npm test -w @planmyrack/core` — expect FAIL, then implement `render/svg.ts`.
- [ ] Implement `RackSummary` on `rackStats`, `files.ts` with the platform split, `png.ts` with
      the web (`layoutSvg` → canvas) and native (`captureRef`) branches, both rethrowing as
```

`PNG export failed: <reason>`, `print.ts` reusing `layoutSvg`, and the export menu offering

```text

      JSON, PNG, Print/PDF, Parts CSV and Cable CSV.

- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): rack summary and JSON/PNG/print/CSV exports`.

## Task 19: Layouts screen, import, autosave and the conflict path

Files: `apps/app/app/index.tsx`, `apps/app/src/ui/LayoutList.tsx`,
`apps/app/src/ui/ConflictDialog.tsx`, `apps/app/src/ui/OfflineBanner.tsx`,
`apps/app/test/layouts.test.tsx`.

Interfaces produced: `<LayoutList summaries onOpen onRename onDuplicate onDelete onImport onNew />`;
`<ConflictDialog current onReload onExportJson />` showing "This layout changed on another
device. Reload it, or export your version to JSON first."; `<OfflineBanner error onRetry onSwitchToLocal />`
showing "Can't reach the server."

- [ ] Write the failing test `apps/app/test/layouts.test.tsx`:
```

describe('TestLayoutCrudInBothModes — through the UI', () => {
it.each([['local', makeLocalStore], ['server', makeHttpStore]])('lists, opens, renames, duplicates and deletes in %s mode', async (_m, make) => {
/* drive the screen against each store and assert the list after each action _/
})
})
describe('TestLocalModePersistsWithoutNetwork', () => {
it('keeps edits with fetch disabled and a fresh mount', async () => {
global.fetch = jest.fn(() => { throw new Error('network disabled') })
const store = await createExpoSqliteStore('offline-test.db')
const { result, unmount } = renderHook(() => useLayoutEditor(store, null))
act(() => result.current.apply((l) => addDevice(l, newDevice({ ...at, type: 'server', heightU: 2 }))))
await waitFor(() => expect(result.current.saving).toBe('idle'))
unmount()
const reopened = renderHook(() => useLayoutEditor(store, result.current.layout.id))
await waitFor(() => expect(reopened.result.current.layout.devices).toHaveLength(1))
expect(global.fetch).not.toHaveBeenCalled()
})
})
describe('TestStaleSaveRejected — through the UI', () => {
it('shows the conflict dialog and offers reload or JSON export', async () => {
/_ second client saves first, then this editor autosaves */
await screen.findByText(/changed on another device/)
expect(screen.getByText('Reload')).toBeTruthy()
expect(screen.getByText('Export to JSON')).toBeTruthy()
})
})
describe('TestImportOfDuplicateNameKeepsBoth', () => {
it('imports a layout whose name already exists without overwriting the first', async () => {
await act(() => importHandler(exportJson(existing)))   // same name as a stored layout
expect(screen.getAllByText(/Basement/)).toHaveLength(2)
expect(await store.list()).toHaveLength(2)
})
})
describe('TestImportRejectsBadSchema — through the UI', () => {
it('names the problem and adds nothing to the list', async () => {
render(<LayoutList summaries={[]} onImport={importHandler} />)
await act(() => importHandler('nonsense{'))
await screen.findByText(/That file isn't a layout this version can open/)
expect(screen.queryAllByTestId(/^layout-row-/)).toHaveLength(0)
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/ui/LayoutList'".
- [ ] Implement the layouts screen (list with last-modified times, new/open/rename/duplicate/
```

delete, JSON import through `importJson` then `store.create`), `ConflictDialog` wired to

```text

      `useLayoutEditor`'s `conflict`, and `OfflineBanner` wired to `StoreUnavailableError` with
      "Retry" and "Switch to local mode" actions that leave the loaded layout readable.

- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): layouts screen, import, autosave and conflict handling`.

## Task 20: Shippable builds — web, iOS and Android

Files: `apps/app/app.json`, `apps/app/plugins/withLocalNetwork.js` (config plugin:
`withAndroidManifest` setting `android:usesCleartextTraffic="true"` and referencing the
network-security config, `withInfoPlist` setting the ATS keys), `apps/app/assets/network_security_config.xml`
(cleartext permitted for `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` only),
`apps/app/eas.json`, `apps/app/assets/icon.png` (derived from `assets/brand/app-icon.png`),
`apps/app/assets/splash.png`, `apps/app/assets/adaptive-icon.png`,
`apps/app/test/appConfig.test.ts`, `README.md` (run and release instructions),
`.github/workflows/ci.yml` (typecheck, purity, both test suites).

Interfaces produced: app name "PlanMyRack", Expo slug `planmyrack`, bundle identifier
`com.azrty.planmyrack` on both iOS and Android, local database `planmyrack.db`, web build
hosted at `planmyrack.azrty.com`; npm scripts `npm run web`, `npm run ios`, `npm run android`,
`npm run server`, `npm run build:web`, `npm run build:ios`, `npm run build:android`.

- [ ] Write the failing test `apps/app/test/appConfig.test.ts`:
```

import config from '../app.json'
import withLocalNetwork from '../plugins/withLocalNetwork'
describe('TestExpoConfigDeclaresLocalNetworking', () => {
it('allows local networking on iOS and explains why', () => {
const ats = config.expo.ios.infoPlist.NSAppTransportSecurity
expect(ats.NSAllowsLocalNetworking).toBe(true)
expect(config.expo.ios.infoPlist.NSLocalNetworkUsageDescription).toMatch(/server/i)
})
it('registers the local-network config plugin', () => {
expect(config.expo.plugins).toContain('./plugins/withLocalNetwork')
})
it('the plugin writes usesCleartextTraffic into the Android manifest', () => {
// `expo.android.usesCleartextTraffic` and `networkSecurityConfig` are NOT app.json keys;
// only a config plugin (or prebuild mod) can set them, so assert the plugin's output.
const out = withLocalNetwork.__applyAndroid(fixtureManifest)
const app = out.manifest.application[0].$
expect(app['android:usesCleartextTraffic']).toBe('true')
expect(app['android:networkSecurityConfig']).toBe('@xml/network_security_config')
})
it('carries the identity a store submission needs', () => {
expect(config.expo.ios.bundleIdentifier).toBe('com.azrty.planmyrack')
expect(config.expo.android.package).toBe('com.azrty.planmyrack')
expect(config.expo.icon).toBe('./assets/icon.png')
expect(config.expo.splash.image).toBe('./assets/splash.png')
})
})

````text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../app.json'" or a
      missing `NSAppTransportSecurity` key.
- [ ] Fill `app.json` with the iOS `infoPlist` keys, `expo.web.output: 'static'` and the plugin
      registration; write `plugins/withLocalNetwork.js` (exporting `__applyAndroid` for the test)
      and `assets/network_security_config.xml`; add `eas.json` with `development`, `preview` and
      `production` profiles, and the icon, adaptive icon and splash assets.
- [ ] Run `npx expo prebuild --platform android --no-install` in a scratch directory and confirm
      the generated `AndroidManifest.xml` really carries both attributes — the plugin unit test
      proves the transform, this proves the wiring.
- [ ] Derive the platform assets from `assets/brand/` (see its README for why each rule exists)
      and write the failing test `apps/app/test/assets.test.ts` first:

```text
import { PNG } from 'pngjs'
const read = (p: string) => PNG.sync.read(readFileSync(join(__dirname, '..', 'assets', p)))
describe('TestDerivedIconsMeetStoreRules', () => {
  it('ships an opaque 1024x1024 iOS icon — the App Store rejects alpha', () => {
    const icon = read('icon.png')
    expect([icon.width, icon.height]).toEqual([1024, 1024])
    for (let i = 3; i < icon.data.length; i += 4) expect(icon.data[i]).toBe(255)
  })
  it('keeps the adaptive-icon foreground inside the central safe zone', () => {
    const fg = read('adaptive-icon.png')
    const margin = Math.floor(fg.width * 0.17)
    expect(alphaInBorder(fg, margin)).toBe(0)   // launcher mask crops anything out here
  })
  it('ships a favicon small enough to read', () => {
    expect(read('favicon.png').width).toBeLessThanOrEqual(64)
  })
})
````

      Squaring off the baked-in rounded corners, flattening alpha for iOS, padding the adaptive
      foreground and drawing a simplified favicon mark are all part of this step — a downscale of
      `favicon-source.png` fails the readability check by inspection, not by assertion.

- [ ] Run `npm run build:web`, serve `apps/app/dist` with the network throttled to offline in
      the browser, and confirm the app loads and local mode still works.
- [ ] Run `npx eas build --platform ios --profile preview` and
      `npx eas build --platform android --profile preview`; confirm both produce installable
      binaries. Record the build URLs in the commit body.
- [ ] Write `.github/workflows/ci.yml` running `npm ci`, `npm run typecheck`,
      `npm run check:purity`, `npm test` on Node 22 and confirm it passes.
- [ ] Run `procoder check`, then commit: `chore(app): store-ready build configuration and CI`.

## Task 21: Storage failure paths and diagnostics

Files: `apps/app/src/storage/StoreProvider.tsx` (open-failure handling),
`apps/app/src/storage/capabilities.ts`, `apps/app/src/ui/StorageProblem.tsx`,
`apps/app/app/settings.tsx` (diagnostics block), `apps/app/test/failures.test.tsx`.

Interfaces produced: `canUseLocalStore(): Promise<{ ok: boolean; reason?: string }>` (web: checks
`navigator.storage.getDirectory` and `crossOriginIsolated`; native: always ok);
`type StorageProblem = { kind: 'corrupt' | 'unsupported' | 'full' | 'permission'; detail: string }`;
`<StorageProblem problem onImportJson onSwitchMode onRetry />`; `lastServerStatus(): { url: string; status: number | null; at: string } | null`
shown in settings for diagnosis.

- [ ] Write the failing test `apps/app/test/failures.test.tsx`, one case per spec failure mode:

````

describe('TestCorruptLocalDatabaseIsReported', () => {
it('starts empty, says the database could not be read, and offers JSON import', async () => {
openDatabaseAsync.mockRejectedValue(new Error('file is not a database'))
render(<App />)
await screen.findByText(/couldn't read the layouts stored on this device/i)
expect(screen.getByText('Import JSON')).toBeTruthy()
expect(deleteDatabaseAsync).not.toHaveBeenCalled() // never overwrite a damaged file
})
})
describe('TestBrowserWithoutOpfsRefusesLocalMode', () => {
it('names the reason and offers server mode instead of losing data on refresh', async () => {
Object.defineProperty(globalThis, 'crossOriginIsolated', { value: false, configurable: true })
expect(await canUseLocalStore()).toMatchObject({ ok: false, reason: expect.stringMatching(/browser/i) })
render(<FirstRunScreen />)
await screen.findByText(/can't store layouts in this browser/i)
expect(screen.getByText('Connect to a server')).toBeTruthy()
})
})
describe('TestQuotaExceededKeepsTheLayoutInMemory', () => {
it('fails loudly, keeps the edit on screen and offers JSON export', async () => {
store.update.mockRejectedValue(new Error('database or disk is full'))
const { result } = renderHook(() => useLayoutEditor(store, saved.id))
act(() => result.current.apply((l) => updateDevice(l, dev.id, { name: 'Kept' })))
await waitFor(() => expect(result.current.saving).toBe('error'))
expect(result.current.layout.devices[0].name).toBe('Kept')
expect(screen.getByText('Export to JSON')).toBeTruthy()
})
})
describe('TestIosLocalNetworkDenialIsNamed', () => {
it('says the permission was denied rather than showing a generic timeout', async () => {
probeServer.mockResolvedValue({ ok: false, reason: 'NSLocalNetworkDenied' })
render(<SettingsScreen />); fireEvent.press(screen.getByText('Test connection'))
await screen.findByText(/local network access is turned off for this app/i)
expect(screen.getByText('Open Settings')).toBeTruthy()
})
})
describe('TestServerErrorsAreShownForDiagnosis', () => {
it('records the last status code and shows it in settings', async () => {
fetchMock.mockResolvedValue(new Response('nope', { status: 502 }))
await expect(store.list()).rejects.toThrow(StoreUnavailableError)
render(<SettingsScreen />)
expect(screen.getByTestId('server-diagnostics')).toHaveTextContent('502')
})
})

```text
      Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/storage/capabilities'".
- [ ] Implement `capabilities.ts`, the open-failure branch in `StoreProvider` (an unreadable
      database yields an empty in-memory store plus a `StorageProblem`, never a delete or
      overwrite), `StorageProblem` with its four messages, and the settings diagnostics block
      recording the last server URL, status and timestamp.
- [ ] Run `npm test -w planmyrack` — passes.
- [ ] Run `procoder check`, then commit: `feat(app): storage failure paths and server diagnostics`.

## Coverage self-review

Every spec scope id maps to the task that implements it: S-1 → Tasks 2, 4, 13; S-2 → Tasks 3, 4,
14; S-3 → Tasks 4, 15; S-4 → Tasks 2, 13; S-5 → Tasks 2, 13; S-6 → Tasks 5, 16; S-7 → Tasks 5,
16, 18; S-8 → Tasks 9, 12, 19; S-9 → Tasks 9, 10, 11, 19; S-10 → Tasks 11, 12; S-11 → Tasks 9,
19; S-12 → Tasks 7, 18, 19; S-13 → Tasks 8, 17; S-14 → Tasks 13, 14, 15; S-15 → Tasks 5, 6, 15;
S-16 → Task 20. Every spec failure mode maps to Task 21 (corrupt local database, browser without
OPFS, quota exceeded, iOS local-network denial, server 5xx diagnosis), except the two already
covered elsewhere: stale revision → Tasks 9, 10, 19, and unreachable server → Tasks 11, 19.
Names are consistent across tasks: `Layout`, `Device`, `Link`, `LinkEnd`,
`Face`, `posU`, `heightU`, `ports`, `outlets`, `findFreeSlot`, `addDevice`, `moveDevice`,
`updateDevice`, `removeDevice`, `connect`, `disconnect`, `pruneLinks`, `LayoutStore`,
`StaleRevisionError`, `StoreUnavailableError`, `runStoreContract`, `useLayoutEditor`, `U_PX`.

````
