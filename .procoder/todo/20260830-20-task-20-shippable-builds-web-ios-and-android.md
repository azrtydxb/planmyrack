# Task 20: Shippable builds — web, iOS and Android

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 20: Shippable builds — web, iOS and Android)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 20: Shippable builds — web, iOS and Android" from the plan, test-first. App name PlanMyRack, Expo slug `planmyrack`,
bundle identifier `com.azrty.planmyrack` on both stores. Files this task owns:
`apps/app/app.json`, `apps/app/plugins/withLocalNetwork.js` (config plugin:
`withAndroidManifest` setting `android:usesCleartextTraffic="true"` and referencing the
network-security config, `withInfoPlist` setting the ATS keys),
`apps/app/assets/network_security_config.xml` (cleartext permitted for `10.0.0.0/8`,
`172.16.0.0/12`, `192.168.0.0/16` only), `apps/app/eas.json`, `apps/app/assets/icon.png`,
`apps/app/assets/splash.png`, `apps/app/assets/adaptive-icon.png`,
`apps/app/test/appConfig.test.ts`, `README.md` (run and release instructions),
`.github/workflows/ci.yml` (typecheck, purity, both test suites).

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `apps/app/test/appConfig.test.ts`: Run `npm test -w planmyrack` — expect FAIL with "Cannot find module '../app.json'" or a missing `NSAppTransportSecurity` key.
- [ ] Fill `app.json` with the iOS `infoPlist` keys, `expo.web.output: 'static'` and the plugin registration; write `plugins/withLocalNetwork.js` (exporting `__applyAndroid` for the test) and `assets/network_security_config.xml`; add `eas.json` with `development`, `preview` and `production` profiles,…
- [ ] Run `npx expo prebuild --platform android --no-install` in a scratch directory and confirm the generated `AndroidManifest.xml` really carries both attributes — the plugin unit test proves the transform, this proves the wiring.
- [ ] Run `npm run build:web`, serve `apps/app/dist` with the network throttled to offline in the browser, and confirm the app loads and local mode still works.
- [ ] Run `npx eas build --platform ios --profile preview` and `npx eas build --platform android --profile preview`; confirm both produce installable binaries. Record the build URLs in the commit body.
- [ ] Write `.github/workflows/ci.yml` running `npm ci`, `npm run typecheck`, `npm run check:purity`, `npm test` on Node 22 and confirm it passes.
- [ ] Run `procoder check`, then commit: `chore(app): store-ready build configuration and CI`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
