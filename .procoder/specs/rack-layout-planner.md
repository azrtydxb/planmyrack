# rack-layout-planner

Status: ready

## Problem

Planning a home-lab rack today happens on paper or in a spreadsheet: you count
units in your head, discover after ordering that the 2U NAS and the 1U switch do
not both fit above the shelf, and you have no record of which switch port each
device is patched into. Nothing tells you the rack is full, nothing catches a
device landing half a unit off, and the cable map lives in memory until something
breaks at the worst moment. The gear is bought over months and re-arranged often,
so the plan has to be editable at the rack (phone), on the couch (tablet) and at
the desk (browser) — which is why this is an app and not a drawing.

## Users

- **Home-lab owner (the only user role).** Sketches a rack before buying, moves
  gear around as it arrives, records what is patched where, and checks the layout
  while standing at the rack with a phone in hand. Needs speed over ceremony: drag,
  rename, colour, done. No accounts, no collaboration, no approval flows.
- The same person on three surfaces: **phone** (in front of the rack, one hand),
  **tablet** (planning on the sofa), **desktop browser** (long editing sessions).
  Same feature set on all three; only the layout of the controls differs.

## In scope

- [S-1] **Rack workspace.** A layout holds one or more racks side by side; each rack
  has a name, a width (19" or 10"), a unit count (presets 6/9/12/15/18/24/42/47 plus
  a custom number, 1–48) and two independent faces (front and rear). Racks can be
  added, renamed, resized and removed.
- [S-2] **Placement and movement.** Drag equipment from a palette onto a rack face;
  drag placed equipment to move it, including to another face or another rack.
  Sizes 0.5, 1, 2, 3, 4, 5, 6 and 8U. Positions snap to a ½U grid. A drop onto
  occupied space lands in the nearest free slot that fits; when the face has no
  room the drop is refused and the device returns to where it came from.
- [S-3] **Device properties.** Per device: name, colour (palette + custom), height,
  type, network port count, power draw in watts, weight in kg, depth in mm and free
  notes. Devices can be duplicated and deleted.
- [S-4] **Special equipment types.** Cable management in ½U and 1U, in two flavours
  (hooks and brush), each drawn so the flavour is recognisable at a glance; plus
  shelf, blank panel, PDU, UPS, patch panel and generic equipment/server. Types
  that cannot carry network ports (cable management, shelf, blank) offer no port
  field.
- [S-5] **Network ports on the device face.** Generic devices carry 0–8 ports;
  switches and patch panels carry a configurable count up to 48. Ports are drawn on
  the device in the rack elevation and re-drawn immediately when the count changes,
  wrapping to two rows on devices of 2U or more.
- [S-6] **Port-to-port connections.** Tapping a port opens a picker listing every
  port in the layout, showing which are free and which are taken and by what; choosing
  a free port creates the cable, and a connected port offers disconnect. One cable per
  port — connecting an occupied port is blocked, not silently reassigned. Each cable
  carries a label, a colour and a type (Cat5e/Cat6/Cat6a/fibre/DAC). Cables are drawn
  as an overlay between the two ports when both ends are on the visible face, and are
  always listed in a cable schedule.
- [S-7] **Power.** Each device has a watts figure and each rack shows total draw. PDUs
  have a configurable number of outlets, drawn like ports; a device's power inlet is
  connected to a specific outlet through the same picker used for network ports, so
  free and used outlets are visible.
- [S-8] **Local mode storage.** With no server, the app owns a local SQLite database
  (expo-sqlite on iOS/Android, OPFS-backed SQLite in the browser). Edits autosave
  continuously; a layout can also be named and duplicated as a separate saved copy.
- [S-9] **Server mode storage.** A Node server installed locally holds the database
  and serves a REST API; clients read and write layouts over it, so several devices
  work against the same data. Every layout carries a revision; a save built on a
  stale revision is refused with a "changed on another device — reload" message
  rather than overwriting.
- [S-10] **Mode selection.** First run asks "work on this device only" or "connect to
  a server" with a URL field and a test-connection button; the choice is changeable
  in settings at any time. The active mode and server URL are always visible in the app.
- [S-11] **Layout management.** List saved layouts with their last-modified time; open,
  rename, duplicate and delete them; start a new empty layout.
- [S-12] **Export and import.** JSON export and import of a layout (the only bridge
  between local and server data), PNG image of the rack elevation, a print/PDF view,
  and CSV export of both the parts list (name, type, size, watts, weight, rack, U
  position) and the cable schedule (from device/port, to device/port, label, type).
- [S-13] **Equipment library.** Read-only bundled catalogue in `packages/catalog/src/bundled.ts`;
  the user's own saved gear in the active store's template table (see Data). Any configured
  device can be saved for reuse — name, type, height, ports, watts, weight, depth, colour —
  and dragged into later layouts; the palette lists saved gear and bundled catalogue together.
  The bundled catalogue carries a generic set (server 1U/2U/4U, switch 8/16/24/48-port, patch
  panel 24/48-port, PDU, UPS, shelf, blank, hooks, brush) plus common home-lab kit across
  UniFi, MikroTik, TP-Link, Synology, QNAP and Cisco SG — each entry giving height, port count
  and typical watts. Entries are static data with a `source` note; nothing fetches vendor data
  at runtime; correcting an entry means editing `packages/catalog/src/bundled.ts`.
- [S-14] **Touch-first UI on every surface.** Full editing on phone, tablet and browser
  from one Expo/react-native-web codebase: long-press-and-drag placement, pinch-zoom
  and pan of the rack canvas, a bottom-sheet inspector on phones and a side panel on
  wide screens. Hit targets sized for fingers; the port picker is reachable one-handed.
- [S-15] **Undo/redo and integrity.** Multi-step undo and redo of every layout edit.
  Reducing a device's port count, shrinking a rack, deleting a device or moving one
  never leaves a cable pointing at something that no longer exists.
- [S-16] **Shippable builds.** `vite`/Expo web build for the browser, EAS Build
  configuration producing iOS and Android binaries suitable for App Store and Play
  Store submission, with app icons, splash screen, bundle identifiers and the
  local-network permissions server mode needs.

## Out of scope

- User accounts, login, multi-tenancy, sharing or permissions of any kind.
- Cloud/hosted sync. There is no sync engine: local data and server data are separate
  stores, and JSON export/import is the only way to move a layout between them.
- Real-time collaborative editing, presence, or live push of changes between devices;
  concurrency is handled by refusing stale saves, not by merging.
- Automatic migration of existing local layouts into a server when server mode is
  first enabled (JSON export/import covers it).
- Discovery of servers on the network (no mDNS/Bonjour); the server URL is typed in.
- Any live integration with real hardware: no SNMP, no LLDP, no switch import, no
  monitoring, no discovery of what is actually racked.
- 3D or perspective views, rack doors, rails, airflow/thermal modelling, cable length
  calculation and cost/BOM pricing.
- Vendor-accurate faceplate artwork; equipment is drawn schematically.
- Offline queuing of writes in server mode (see Failure modes).

## Constraints

- **One UI codebase.** Expo React Native rendered to iOS and Android via EAS Build and
  to the browser via react-native-web. No second DOM-only web UI, no Capacitor.
- **Monorepo, npm workspaces.** Platform-independent logic lives in shared packages and
  must not import React, react-native or any platform API. `packages/storage` therefore holds
  the store interface, its contract test suite and the platform-free adapters (in-memory,
  HTTP); each SQLite adapter lives beside its driver — `node:sqlite` in `packages/server`,
  `expo-sqlite` in `apps/app` — and is proved by that same contract suite.
- **Offline by default.** Local mode requires no network at all; the web build must load
  and work from a cold cache with the network off.
- **iOS App Transport Security.** Server mode talks to a private-network HTTP address, so
  the iOS build needs `NSAllowsLocalNetworking` plus the local-network usage permission,
  and the Android build needs a cleartext-traffic exception scoped to private ranges.
  Both must be declared in the Expo config, not patched into native projects by hand.
- **Server is optional and unauthenticated.** It is assumed to run on a trusted home LAN.
  It must bind and run with no configuration beyond a port and a database path, and must
  never be presented as safe to expose to the internet.
- **Node's built-in `node:sqlite`** on the server side (Node 22+); no native build step,
  no ORM. Runtime dependencies stay minimal and boring.
- **Rendering budget.** A 47U rack fully populated, with a 48-port switch and 60 cables,
  must pan and pinch-zoom smoothly on a mid-range phone.
- **Touch first.** Every interactive target is at least 44x44pt effective; nothing depends
  on hover, right-click or a keyboard. Keyboard shortcuts on desktop are additive only.

## Interfaces

**UI surfaces** (one codebase, responsive):

- _Layouts screen_ — saved layouts with last-modified time; new/open/rename/duplicate/
  delete; import JSON; the active mode indicator.
- _Rack canvas_ — the racks side by side, U-numbered scales on both edges, front/rear face
  toggle, pan and pinch-zoom, cable overlay toggle, undo/redo.
- _Palette_ — equipment grouped by category, plus saved templates and the bundled
  catalogue; drag source for placement.
- _Inspector_ — bottom sheet on phones, side panel on wide screens; device fields, its
  connection list, duplicate/delete, "save as template".
- _Port picker_ — modal/sheet listing every port in the layout with free/taken state;
  connect, disconnect, and cable label/colour/type.
- _Cable schedule_ — the full list of connections with jump-to-device.
- _Rack summary_ — per rack: units used and free per face, total watts, total weight,
  device and cable counts.
- _Settings_ — mode (local / server + URL + test connection), export options, about.

**Server REST API** (JSON over HTTP, no auth):

- `GET /api/layouts` → `[{ id, name, revision, createdAt, updatedAt }]`
- `GET /api/layouts/:id` → full layout document
- `POST /api/layouts` (body: layout without id) → created document, revision 1
- `PUT /api/layouts/:id` (body: layout including the revision it was loaded at) →
  updated document with an incremented revision, or `409` with the current server
  document when the revision is stale
- `DELETE /api/layouts/:id` → `204`
- `GET|POST|PUT|DELETE /api/templates[/:id]` — the equipment library, same shape rules
- `GET /api/health` → `{ ok: true, version }`, used by the settings "test connection" button

**File formats:**

- _Layout JSON_ — the layout document below, plus a `schemaVersion` integer; the import
  path accepts any `schemaVersion` it knows and rejects newer ones with a clear message.
- _Parts CSV_ — `rack,face,position_u,height_u,name,type,ports,watts,weight_kg,depth_mm,notes`
- _Cable CSV_ — `from_device,from_port,to_device,to_port,label,type,colour`

## Data

The unit of storage is a **layout document**: one JSON object per layout, stored as a
single row. Racks, devices and cables are edited together, undone together and exported
together, so splitting them across relational tables would buy nothing and cost a join on
every read.

```
Layout   { schemaVersion, id, name, revision, createdAt, updatedAt,
           racks: Rack[], devices: Device[], links: Link[] }
Rack     { id, name, width: 19|10, units: 1..48, depthMm }
Device   { id, rackId, face: 'front'|'rear', posU (½ steps, 0 = bottom), heightU,
           type, name, colour, ports, outlets, watts, weightKg, depthMm, notes }
Link     { id, kind: 'network'|'power',
           a: { deviceId, port }, b: { deviceId, port },
           label, colour, cableType }
Template { id, name, type, heightU, ports, outlets, watts, weightKg, depthMm, colour }
```

Invariants: `posU + heightU <= rack.units`; no two devices on the same rack face overlap;
every `Link` endpoint references an existing device and a port index within that device's
current port/outlet count; a port appears in at most one link of its kind.

**Where it lives** follows the active mode, and the two stores never talk to each other:

- _Local mode_ — SQLite on the device: `expo-sqlite` on iOS/Android, OPFS-backed SQLite in
  the browser. Tables `layouts(id, name, revision, doc, created_at, updated_at)` and
  `templates(id, doc)`. The user owns the file; uninstalling the app deletes it.
- _Server mode_ — the same two tables in the server's SQLite file (`data/planmyrack.db`,
  overridable), owned by whoever installed the server. Clients hold only a transient cache.
- The bundled catalogue ships in the app binary as static data and is never written.

## Edge cases

- Dropping a device where something already sits → nearest free ½U slot; nothing fits →
  drop refused, device returns to its origin.
- Dragging a device from a 42U rack onto a 12U rack, or from front to rear, when the target
  position would put it past the top → clamped to the highest position that fits, or refused.
- Shrinking a rack below devices already placed high in it, changing a rack's width, or
  deleting a rack that holds devices with cables.
- Reducing a device's port count below the index of a connected port; changing a device's
  type to one that cannot carry ports while it has cables.
- Deleting a device that sits at one or both ends of cables.
- Tapping a port that is already connected (must offer disconnect, not silently rewire);
  attempting to connect a port to itself, or to the other end of the cable it already has.
- Cables whose two ends are on different faces or different racks — the overlay cannot draw
  them, the schedule must still list them.
- A ½U device placed against another ½U device so they share a single U.
- A 48-port switch in a 1U slot (ports must stay legible or wrap/scroll rather than vanish).
- Importing JSON that is malformed, has a newer `schemaVersion`, contains duplicate ids, or
  references devices/racks that are not in the file.
- Importing a layout whose name already exists.
- Two devices saving the same server layout from a stale revision.
- Switching from server mode to local mode with unsaved edits open, and back.
- A layout with zero racks, a rack with zero devices, a device with zero ports.
- Very wide layouts (six racks side by side) on a phone screen.
- Rapid drag gestures, two-finger pinch starting on top of a device, and drag interrupted by
  an incoming call or app backgrounding.

## Failure modes

- **Server unreachable, wrong URL, or not running** (server mode) — the app says so
  explicitly, keeps showing the last-loaded layout read-only, and offers "retry" and "switch
  to local mode". It does not queue writes for later and does not pretend a save succeeded.
- **Server returns 409 (stale revision)** — the save is refused, the user is told the layout
  changed on another device, and is offered reload (discarding local edits) or export-to-JSON
  (keeping them) before reloading.
- **Server returns 5xx or malformed JSON** — treated as unreachable; the raw status is shown
  in settings for diagnosis.
- **Local database cannot be opened or is corrupt** — the app starts with an empty library,
  states plainly that the local database could not be read, and offers JSON import; it never
  silently drops data or overwrites the damaged file.
- **Browser without OPFS/SQLite-wasm support** — the web build refuses local mode with a
  named reason and offers server mode instead, rather than losing data on refresh.
- **Storage quota exceeded / disk full on save** — the save fails loudly, the in-memory
  layout is untouched, and JSON export is offered as an escape hatch.
- **iOS local-network permission denied** — server mode reports the denial specifically
  (rather than a generic timeout) and links to Settings.
- **PNG/PDF export fails or is unsupported on the platform** — the failure is reported and
  the other export formats stay available.
- **Malformed or newer-schema JSON import** — rejected with the reason and the offending
  field; nothing in the current library is modified.

## Acceptance criteria

<!-- Each criterion names the test that asserts it and the change that breaks it. -->

- [ ] [S-1] A layout holds several racks side by side with independent widths (19"/10") and
      unit counts from presets or a typed 1-48 value — `TestLayoutHoldsMixedWidthRacks` —
      fails if a layout is capped at one rack, or a 10" rack renders at 19" width.
- [ ] [S-1] Removing a rack removes its devices and their cables, and undo restores all
      three — `TestRemoveRackCascadesAndUndoes` — fails if a removed rack leaves orphan
      devices or links behind, or undo restores the rack without its contents.
- [ ] [S-1] [S-14] Front and rear hold different devices in the same U space and are counted
      separately in the rack summary — `TestFacesAreIndependent` — fails if a device placed
      on the rear appears on the front, or the two faces' occupancy is summed together.
- [ ] [S-2] A 2U palette item dropped on an empty rack lands at the half-U-snapped position
      under the pointer and spans exactly two units — `TestDropSnapsToHalfU` — fails if a
      drop resolves to a position that is not a multiple of 0.5U.
- [ ] [S-2] A drop onto occupied space lands in the nearest free slot that fits, and is
      refused without mutating the layout when the face is full —
      `TestDropFindsNearestFreeSlotElseRefuses` — fails if two devices on one face ever
      overlap, or a refused drop changes any device position.
- [ ] [S-2] A placed device can be moved to the other face or another rack with its cables
      intact — `TestMoveDeviceAcrossRackAndFaceKeepsLinks` — fails if a move drops links or
      leaves the device pointing at its previous rackId.
- [ ] [S-3] Name, colour, watts, weight, depth and notes edits render immediately and survive
      reopening the layout — `TestDevicePropertyRoundTrip` — fails if any edited field is
      absent or stale after a reload from storage.
- [ ] [S-4] Hooks and brush cable management are placeable at 0.5U and 1U and render
      distinguishably from each other and from a blank panel —
      `TestCableManagementFlavoursRender` — fails if the hooks and brush snapshots are
      identical, or either flavour is missing a size.
- [ ] [S-4] Cable management, shelf and blank panels expose no network-port field in the
      inspector — `TestPortlessTypesHidePortField` — fails if a port control appears for a
      type whose maxPorts is 0.
- [ ] [S-5] The number of ports drawn on a device always equals its configured port count,
      including 48 on a switch and 4 on a generic device — `TestPortCountRendersExactly` —
      fails if the rendered port count diverges from the device's ports value after a change.
- [ ] [S-5] A 48-port switch in a 1U slot draws every port within the device's bounds —
      `TestDensePortsStayInsideDevice` — fails if any port's rendered box escapes the device
      rectangle at default zoom.
- [ ] [S-6] Choosing a free port in the picker creates a cable and both ports then read as
      connected — `TestConnectFreePorts` — fails if the link is absent from the layout or
      either endpoint still reports as free.
- [ ] [S-6] Ports already carrying a cable are shown in the picker as taken, name their peer,
      and cannot be chosen — `TestPickerBlocksTakenPorts` — fails if a second cable can be
      attached to a port that already has one.
- [ ] [S-6] Disconnecting removes the cable from both ends, the overlay and the schedule —
      `TestDisconnectClearsBothEnds` — fails if the schedule or overlay still lists the
      removed cable.
- [ ] [S-6] A cable's label, colour and type appear in the overlay, the cable schedule and the
      cable CSV — `TestCableMetadataFlowsToScheduleAndCsv` — fails if any of the three values
      is dropped on the way to an export.
- [ ] [S-6] A cable between two different racks is listed in the schedule even though the
      overlay cannot draw it — `TestCrossRackCableListedWithoutOverlay` — fails if a cable
      disappears from the schedule because its ends are not both on the visible face.
- [ ] [S-7] A rack's summary shows the sum of its devices' watts and updates when a value
      changes — `TestRackWattsSum` — fails if a device's watts are omitted from its rack total.
- [ ] [S-7] A device's power inlet connects to one PDU outlet, which then refuses a second
      device — `TestPduOutletSingleOccupancy` — fails if two power links resolve to the same
      outlet index.
- [ ] [S-8] In local mode with the network off, layouts can be created, edited and reopened,
      and edits survive a full restart with no explicit save —
      `TestLocalModePersistsWithoutNetwork` — fails if any edit is lost across a restart, or
      the client issues an HTTP request in local mode.
- [ ] [S-9] A layout saved on one client against the server is listed by a second client after
      refresh — `TestServerLayoutVisibleToSecondClient` — fails if the second client's list
      omits a layout the server holds.
- [ ] [S-9] A save built on a stale revision is refused with 409 and the server's current
      document, and the client offers reload or JSON export — `TestStaleSaveRejected` — fails
      if a stale PUT overwrites newer server data, or returns anything other than 409.
- [ ] [S-10] First run offers local-vs-server, and the test-connection button reports success
      against a running server and a named failure against a dead one —
      `TestModeChooserAndHealthProbe` — fails if the probe reports success when
      `GET /api/health` did not return ok.
- [ ] [S-10] Switching mode in settings re-lists layouts from the newly active store, and the
      active mode is visible outside settings — `TestModeSwitchRelistsLayouts` — fails if the
      list still shows the previous store's layouts after a switch.
- [ ] [S-11] Layouts can be listed with modified times, opened, renamed, duplicated and
      deleted, identically in both modes — `TestLayoutCrudInBothModes` — fails if any of the
      five operations succeeds in one mode and not the other.
- [ ] [S-12] A layout exported to JSON and imported into an empty store reproduces every rack,
      device, colour, port count and cable — `TestJsonRoundTrip` — fails if any field differs
      between the original document and the re-imported one.
- [ ] [S-12] Malformed JSON, a newer schemaVersion or duplicate ids are refused with the
      reason, leaving the library untouched — `TestImportRejectsBadSchema` — fails if a
      rejected import writes anything to storage.
- [ ] [S-12] PNG export returns a non-empty image of the rack elevation and the print view
      renders one legible page per rack — `TestPngExportProducesImage` — fails if the export
      resolves to empty data or a zero-sized image.
- [ ] [S-12] Parts CSV and cable CSV carry the documented column headers with one row per
      device and per cable — `TestCsvColumnsAndRowCounts` — fails if a header differs from the
      Interfaces section or a row count differs from the layout's device/link count.
- [ ] [S-13] A device saved as a template can be dragged into another layout with ports, watts
      and colour intact — `TestTemplateRoundTrip` — fails if a template placed into a new
      layout differs from the device it was saved from.
- [ ] [S-13] The bundled catalogue is present on a fresh install with the generic set and the
      named vendor families (UniFi, MikroTik, TP-Link, Synology, QNAP, Cisco SG), every entry
      carrying height, port count and watts — `TestBundledCatalogueShape` — fails if the
      palette shows no catalogue entries before any template is saved, or an entry is missing
      its height or port count.
- [ ] [S-14] One build serves iOS, Android and desktop browsers; the inspector is a bottom
      sheet at phone widths and a side panel at wide widths —
      `TestInspectorLayoutByBreakpoint` — fails if a phone-width render produces the side
      panel variant.
- [ ] [S-14] The canvas pans and pinch-zooms, and a pinch starting on a device zooms instead
      of dragging it — `TestPinchOverDeviceZoomsNotDrags` — fails if a two-finger gesture
      begun on a device changes that device's position.
- [ ] [S-15] Undo reverses placement, movement, property edits, connections and deletions, and
      redo reapplies them — `TestUndoRedoCoversAllEditKinds` — fails if any edit kind leaves
      the undo stack unchanged.
- [ ] [S-15] Reducing a port count removes exactly the cables that lost their port, and undo
      restores them — `TestPortReductionPrunesExactLinks` — fails if a surviving link points
      at an index beyond the new count, or an unaffected link is removed.
- [ ] [S-15] Deleting a device removes its cables from the overlay and schedule with no entry
      left pointing at a missing device — `TestDeleteDevicePrunesLinks` — fails if any link
      endpoint references a deviceId absent from the layout.
- [ ] [S-16] `npm run build` produces a web bundle that loads with the network off, and
      `eas build` produces installable iOS and Android binaries whose `app.json` declares
      icons, splash and `NSAllowsLocalNetworking` — `TestExpoConfigDeclaresLocalNetworking`
      — fails if the local-network declarations are missing from `app.json`.
- [ ] [S-16] `TestSharedPackagesArePlatformFree`, run by `npm run check:purity`, reports no
      react, react-native or platform import in the shared packages — fails if any file under
      `packages/core`, `packages/storage` or `packages/catalog` imports a UI or platform module.

## Open questions

All resolved during the interview; none remain.
