# Task 12: Expo app shell, local SQLite store, mode chooser and settings

Status: open
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

- [ ] Write the failing test `apps/app/test/sqliteStore.test.ts` running the shared contract: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../src/storage/sqliteStore'".
- [ ] Implement `sqliteStore.ts` against `expo-sqlite`'s async API, reusing the same SQL as the server store.
- [ ] Write the failing test `apps/app/test/mode.test.tsx`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../app/first-run'".
- [ ] Implement `settings.ts`, `StoreProvider.tsx` (builds `createExpoSqliteStore` or `createHttpStore` from the stored mode and re-creates it when the mode changes), `first-run.tsx` (the two options, the URL field with placeholder `http://192.168.1.20:8787` and a "Test connection" button calling…
- [ ] Run `npm test -w planmyrack` — passes. Run `npx expo start --web` and confirm the chooser renders in a browser.
- [ ] Run `procoder check`, then commit: `feat(app): Expo shell, local SQLite store and mode chooser`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
