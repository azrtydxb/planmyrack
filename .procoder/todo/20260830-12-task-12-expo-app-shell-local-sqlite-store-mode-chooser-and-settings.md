# Task 12: Expo app shell, local SQLite store, mode chooser and settings

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 12: Expo app shell, local SQLite store, mode chooser and settings)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 12: Expo app shell, local SQLite store, mode chooser and settings" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`apps/app/package.json` (`planmyrack`; expo, expo-router, expo-sqlite, `@react-native-async-
storage/async-storage`, react-native-svg, react-native-gesture-handler, react-native-
reanimated, react-native-view-shot, expo-print, expo-sharing, expo-file-system,
`@planmyrack/core|catalog|storage`), `apps/app/app.json`, `apps/app/babel.config.js`,
`apps/app/jest.config.js` (preset `jest-expo`, `setupFiles: ['./node_modules/react-native-
gesture-handler/jestSetup.js']`, `transformIgnorePatterns` allowing `react-native-gesture-
handler` and the workspace packages), `apps/app/metro.config.js` (workspace-aware,
`resolver.assetExts` including `wasm` and `server.headers` setting COOP/COEP so expo-
sqlite's OPFS backend works in `expo start --web`), `apps/app/app/_layout.tsx`,
`apps/app/app/index.tsx`, `apps/app/app/first-run.tsx`, `apps/app/app/settings.tsx`,
`apps/app/src/storage/sqliteStore.ts`, `apps/app/src/storage/settings.ts`,
`apps/app/src/storage/StoreProvider.tsx`, `apps/app/test/sqliteStore.test.ts`,
`apps/app/test/mode.test.tsx`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `apps/app/test/sqliteStore.test.ts` running the shared contract: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/storage/sqliteStore'".
- [x] Implement `sqliteStore.ts` against `expo-sqlite`'s async API, reusing the same SQL as the server store.
- [x] Write the failing test `apps/app/test/mode.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../app/first-run'".
- [x] Implement `settings.ts`, `StoreProvider.tsx` (builds `createExpoSqliteStore` or `createHttpStore` from the stored mode and re-creates it when the mode changes), `first-run.tsx` (the two options, the URL field with placeholder `http://192.168.1.20:8787` and a "Test connection" button calling…
- [x] Run `npm test -w planmyrack` — passes. Run `npx expo start --web` and confirm the chooser renders in a browser.
- [x] Run `procoder check`, then commit: `feat(app): Expo shell, local SQLite store and mode chooser`.

## Evidence

- The app's SQLite store passes the SAME contract suite as memory, node:sqlite and HTTP — under
  jest, from `@planmyrack/storage/contract`, proving the runner-agnostic design works.
- Limitation stated rather than hidden: expo-sqlite's native module does not exist under jest, so
  the contract drives the app's store code through a real node:sqlite driver instead. That proves
  the SQL and every store semantic, NOT expo-sqlite's own binding — which the web export and
  Task 19's offline check exercise.
- `TestModeChooserAndHealthProbe` (local choice persisted; failed probe named and the server
  button left disabled; successful probe enables it) and `TestModeSwitchRelistsLayouts`.
- Ran for real: `npx expo export --platform web` succeeded (2.8MB bundle plus the wa-sqlite wasm),
  and our server served it at http://127.0.0.1:8801 with `cross-origin-opener-policy: same-origin`
  and `cross-origin-embedder-policy: credentialless` — the headers OPFS needs.
- Three environment problems fixed on the way: two React copies (hooks read null) resolved by
  pinning one version; RNTL 14 returned an empty render with Expo's pinned React, so RNTL 13 with
  react-test-renderer is used; COEP corrected from `require-corp` to `credentialless`, which is
  what the Expo SDK 57 docs specify.
