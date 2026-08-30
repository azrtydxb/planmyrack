# PlanMyRack — visual design reference

Source: Claude Design project `90dc253b-7dcc-418b-94f5-02395b1407f9`, file
`PlanMyRack Directions.dc.html`, direction **2a "Console"** with its tablet and desktop
variants **3b** and **3a**. That document is the bible for how the GUI looks; this file records
the tokens and rules extracted from it so the code has a single source to check against.

Genre: professional network console. Light workspace, graphite hardware faceplates, one blue
accent. Hardware is dark; the app around it is light.

## Colour

| Role                                         | Value                                              |
| -------------------------------------------- | -------------------------------------------------- |
| App background                               | `#eef1f5`                                          |
| Canvas background (desktop)                  | `#f2f5f9` with a dotted grid                       |
| Surface / panel                              | `#ffffff`                                          |
| Surface sunken (segmented track, taken tile) | `#e2e7ee` / `#f0f3f6`                              |
| Border                                       | `#e0e6ec`, `#e4e9ef`, `#d6dde6` (inputs)           |
| Text primary                                 | `#16202c`                                          |
| Text secondary                               | `#495666`                                          |
| Text muted                                   | `#6b7787`, `#8b98a8`, `#98a4b3` (icons, mono meta) |
| Accent                                       | `#1479ff`                                          |
| Cable / status green                         | `#22c55e`                                          |
| Cable orange                                 | `#ff8a3d`                                          |
| Cable purple                                 | `#8b5cf6`                                          |

Rack hardware:

| Role                | Value                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| Rack body           | `#1a1f26`                                                              |
| Rail                | `linear-gradient(90deg,#3a424c,#2b323a)` + radial screw dots `#10141a` |
| Rack top cap        | `#2b323a`                                                              |
| Faceplate           | `linear-gradient(180deg,#2d353f,#20262e)`, border `#14181d`, radius 2  |
| Blank / brush panel | `#20262e` / `#232a32`                                                  |
| Shelf               | `linear-gradient(180deg,#99a2ad,#77828e)`                              |
| Faceplate text      | `#f2f5f9`, secondary `#98a4b3`                                         |
| Port, free          | `#05070a`, `inset 0 1px 0 rgba(255,255,255,.12)`                       |
| Port, connected     | cable colour, `0 0 6px <colour>`                                       |

## Type

- UI: **Manrope** 500–800. Titles 17px/800, body 11–13px/700.
- Data, labels, meta: **IBM Plex Mono** 500–700 at 6.5–11px, letter-spacing ~.05em, uppercase.
  Rack captions, U numbers, status lines and device meta are all mono.

## Geometry

- 1U = 34px; rail 14px each side; rack body 292px wide at 19" on phone.
- Port square 8x12, radius 1, 2px gaps.
- SFP/SFP+ cage 11x9 on a 13px pitch (`CAGE_PITCH`), pinned to the right of the faceplate; the
  copper strip reserves that width so the two never overlap.
- Radii: 10 (buttons, tiles), 9 (segmented track), 7 (segment), 12–16 (cards), 2 (faceplate).

## Structure

- **Bottom tabs**: Racks · Cables · Library · Stats · Settings. Active = accent, 9.5px/800 label.
- **Header**: layout name (17px/800) over a mono status line (`LOCAL · AUTOSAVED · REV 14`) with a
  green dot; undo / redo / more as 34px white rounded-square buttons.
- **Sub-header**: Front/Rear segmented control, "Cables" label + toggle.
- **Rack pager**: chips per rack (`Rack A` + mono `12U`), selected chip outlined in accent, then a
  dashed `+ Rack` chip. Footer hint: `SWIPE FOR RACK B`.
- **Port picker** (sheet): "Connect port" + mono sub-line, Network/Power segmented, port tiles
  grouped by device with a `22 FREE` count; tile shows `01` over `Free` or the peer name.
- **Cables**: filter chips (All / per rack / Network / Power), rows with a coloured left bar,
  `A · Port n ⇄ B · Port n`, cable-type chip, label, `CROSS-RACK` badge; Export CSV.
- **Stats**: per-rack front/rear usage bars and stat tiles (watts, kg, devices, cables), exports.
- **Library**: search, Catalogue / Saved segmented, vendor groups, faceplate thumbnail + name +
  mono meta + `+`.
- **Inspector**: name, mono meta line, colour swatch row, stat tiles, connections list,
  Duplicate / Template / Delete.
- **Tablet**: icon rail + canvas + inspector side panel. **Desktop**: library panel + canvas +
  inspector panel; sheets become panels.

## Deviations from the document, and why

The design is the reference; these are the places the implementation departs from it, each
forced by real data or a missing door rather than preference.

- **Faceplate label vs port slots.** The design pairs 8x12 port slots with a 44px label because
  its mock names devices with six-character codes (`PP-01`, `SW-CORE`). Real catalogue names —
  "UniFi Switch 24", "Patch panel 24-port" — need a wider label, so `labelGutter` takes 36% of the
  faceplate and a dense strip shrinks its slots to fit. Sparse devices still get the design's
  8x12; a 24-port switch trades slot width for a readable name.
- **48 ports in 1U wrap.** Forty-eight slots cannot be drawn legibly across one 19" 1U faceplate
  at any label width, so the strip wraps to two rows rather than shrinking to a 2px smudge.
- **The icon rail stays on a desktop.** 3a drops the rail and shows library, canvas and inspector
  only. Doing that left the cable schedule, the figures and every export with no door at desktop
  width, so the rail from 3b is kept at every width above a phone. The header carries 3a's Export
  button, which opens the figures pane where the exports live.
- **Two panels need a desktop.** 3a's library panel and 3b's side panel are only shown together
  above 1180px. An iPad in portrait (820px) with both open left the canvas 130px wide, so below
  that width the library opens on its own tab and closes when a side panel does.
- **Rack settings.** The design never shows where a rack is renamed, resized or removed. The
  active rack chip carries a ⚙ that opens those controls in the side panel.

## Where each part of the design lives

| Design element                                                 | Code                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| Tokens (colour, type, geometry)                                | `apps/app/src/ui/theme.ts`                                         |
| Segmented, toggle, icon button, buttons, stat tiles, mono text | `apps/app/src/ui/primitives.tsx`                                   |
| Header, status line, face switch, cables toggle                | `apps/app/src/ui/AppHeader.tsx`                                    |
| Rack switcher chips + add rack                                 | `apps/app/src/ui/RackPager.tsx`                                    |
| Bottom tabs / icon rail                                        | `apps/app/src/ui/TabBar.tsx`                                       |
| Rack body, rails, screw holes, U scale, caption                | `apps/app/src/canvas/RackFrame.tsx`, `Rail.tsx`                    |
| Faceplates, hooks/brush/shelf artwork, colour stripe           | `apps/app/src/canvas/DeviceBox.tsx`                                |
| Port slots and their glow                                      | `apps/app/src/canvas/PortStrip.tsx`, `metrics.ts`                  |
| Cable arcs                                                     | `apps/app/src/canvas/CableOverlay.tsx`, `cablePath.ts`             |
| Port picker sheet                                              | `apps/app/src/ui/PortPicker.tsx`                                   |
| Cable schedule with filters                                    | `apps/app/src/ui/CableSchedule.tsx`                                |
| Library (catalogue / saved)                                    | `apps/app/src/ui/Palette.tsx`                                      |
| Inspector (sheet on phone, panel on tablet/desktop)            | `apps/app/src/ui/Inspector.tsx`, `InspectorHost.tsx`               |
| Rack settings (name, standard, height, removal)                | `apps/app/src/ui/RackSettings.tsx`                                 |
| Rack summary bars and tiles                                    | `apps/app/src/ui/RackSummary.tsx`                                  |
| Phone / tablet / desktop split                                 | `apps/app/src/ui/useBreakpoint.ts`, `screens/RackEditorScreen.tsx` |
