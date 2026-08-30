# What a human decided

Written 2026-08-30 10:47 UTC. procoder reads this
file to avoid asking a question twice; edit an answer here to change what
it believes. Reword the question and it will be asked again.

## [decision] decisions.md

Key: 176323b371fc
Question: OPEN: What ships in the bundled starter catalogue? (spec S-13)

- Generic only — 1U/2U server, 8/16/24/48-port switch, 24-port patch panel, PDU, UPS,
  shelf, blanks, cable management. No brand names, nothing to keep accurate.
- Generic + the home-lab staples the user actually owns/plans (names them).
- Generic + a broad vendor list (UniFi, MikroTik, TP-Link, Synology, QNAP, Cisco SG…) —
  most useful out of the box, most content to curate and keep from going stale.

Answer: Generic set plus a broad vendor list — servers, switches, patch panels, PDU/UPS, shelf, blanks and cable management, plus common home-lab kit across UniFi, MikroTik, TP-Link, Synology, QNAP and Cisco SG, each entry carrying height, port count and typical watts.

## [decision] decisions.md

Key: 30f5f2d49733
Question: DECIDED

- Monorepo, npm workspaces. Shared packages: core (model, U-geometry, collision,
  link graph, stats, JSON/CSV serialisation), storage (repository interface +
  adapters), catalog (gear types, bundled catalogue, palette), server.
- ONE UI package: Expo React Native, rendered to iOS/Android via EAS Build and to
  the browser via react-native-web. (User: "Actually — one UI (Expo + RN-web)".)
- Expo builds the iOS/Android apps. Capacitor and a separate React-DOM web UI are
  both ruled out.
- Storage has TWO modes, user-switchable: fully local (expo-sqlite on device,
  OPFS-backed SQLite in the browser) with no server at all, OR pointed at a
  locally-installed server so multiple devices share the same layouts.
  (User: "install a server locally, and have the client connect to it, or fully
  local only with no server ... if we have a server we can open it on multiple
  devices".)

Answer: Confirmed by the user. Monorepo with npm workspaces, one Expo/react-native-web UI package built to iOS/Android with EAS, shared core/storage/catalog packages, and two user-switchable storage modes (fully local, or a locally installed server that several devices share).

## [decision] decisions.md

Key: 86346c969bfa
Question: OPEN: How much editing happens on a phone-sized screen?

- Full editing everywhere — touch drag, bottom-sheet inspector, tap-to-connect
  ports, pinch-zoom canvas.
- Phone views, tablet/desktop edits — phone browses and inspects; drag editing on
  tablet/desktop only.

Answer: Full editing everywhere — phone gets touch drag, pinch-zoom canvas, bottom-sheet inspector and tap-to-connect ports; the same feature set as tablet and desktop.

## [decision] decisions.md

Key: c84517fa7e8d
Question: OPEN: Two devices edit the same layout on the shared server — then what?

- Last write wins, no warning.
- Version check: the second save is refused with "changed elsewhere, reload".
- Live updates: layouts push changes to connected devices as they happen.

Answer: Version check that refuses stale saves — each layout carries a revision and a save built on an old revision is rejected with "changed on another device, reload", offering reload or JSON export. No last-write-wins, no live push.

## [decision] decisions.md

Key: c98c3beb7290
Question: OPEN: How does a client choose local vs server mode?

- First-run choice, changeable later in settings (server URL typed in).
- Settings-only: always starts local, server URL added when wanted.
- Auto-discover a server on the LAN, fall back to local.

Answer: First-run choice ("work on this device only" vs "connect to a server" with a typed URL and a test-connection button), changeable later in settings. No LAN auto-discovery.

## [spec] rack-layout-planner

Key: ce1341da5e9f
Question: All resolved during the interview; none remain.

Answer: No open questions remain; every decision was made with the user during the interview and written into the section it belongs to.
