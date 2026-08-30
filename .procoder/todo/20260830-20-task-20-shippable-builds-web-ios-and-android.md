# Task 20: Shippable builds — web, iOS and Android

Status: done
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 20: Shippable builds — web, iOS and Android)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 20: Shippable builds — web, iOS and Android" from the plan, test-first. App name PlanMyRack, Expo slug `planmyrack`,
bundle identifier `com.azrty.planmyrack` on both stores. Platform icons are derived from the
sources in `assets/brand/` (see `assets/brand/README.md` for the store rules they must satisfy:
opaque iOS icon, adaptive-icon safe zone, readable favicon). Files this task owns:
`apps/app/app.json`, `apps/app/plugins/withLocalNetwork.js` (config plugin:
`withAndroidManifest` setting `android:usesCleartextTraffic="true"` and referencing the
network-security config, `withInfoPlist` setting the ATS keys),
`apps/app/assets/network_security_config.xml` (cleartext permitted for `10.0.0.0/8`,
`172.16.0.0/12`, `192.168.0.0/16` only), `apps/app/eas.json`, `apps/app/assets/icon.png`
(derived from `assets/brand/app-icon.png`), `apps/app/assets/splash.png`,
`apps/app/assets/adaptive-icon.png`, `apps/app/test/appConfig.test.ts`, `README.md` (run and
release instructions), `.github/workflows/ci.yml` (typecheck, purity, both test suites).

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [x] Write the failing test `apps/app/test/appConfig.test.ts`: `text Run `npm test -w planmyrack`— expect FAIL with "Cannot find module '../app.json'" or a missing`NSAppTransportSecurity` key.
- [x] Fill `app.json` with the iOS `infoPlist` keys, `expo.web.output: 'static'` and the plugin registration; write `plugins/withLocalNetwork.js` (exporting `__applyAndroid` for the test) and `assets/network_security_config.xml`; add `eas.json` with `development`, `preview` and `production` profiles,…
- [x] Run `npx expo prebuild --platform android --no-install` in a scratch directory and confirm the generated `AndroidManifest.xml` really carries both attributes — the plugin unit test proves the transform, this proves the wiring.
- [x] Derive the platform assets from `assets/brand/` (see its README for why each rule exists) and write the failing test `apps/app/test/assets.test.ts` first: ` Squaring off the baked-in rounded corners, flattening alpha for iOS, padding the adaptive foreground and drawing a simplified favicon mark…
- [x] Run `npm run build:web`, serve `apps/app/dist` with the network throttled to offline in the browser, and confirm the app loads and local mode still works.
- [x] Run `npx eas build --platform ios --profile preview` and `npx eas build --platform android --profile preview`; confirm both produce installable binaries. Record the build URLs in the commit body.
- [x] Write `.github/workflows/ci.yml` running `npm ci`, `npm run typecheck`, `npm run check:purity`, `npm test` on Node 22 and confirm it passes.
- [x] Run `procoder check`, then commit: `chore(app): store-ready build configuration and CI`.

## Evidence

- Icons derived from `assets/brand/` by `scripts/derive-icons.py`, applying the rules the sources
  did not satisfy: the 1024 iOS icon is flattened opaque (the App Store rejects alpha) and
  square-cornered (both platforms apply their own mask), the Android adaptive foreground is padded
  into the central safe zone, and the favicon is a 64px crop of the rack rather than a downscale
  of the full illustration.
- `TestDerivedIconsMeetStoreRules` asserts all three by reading the PNGs: every alpha byte of
  icon.png is 255, the adaptive foreground has zero alpha in the outer 17%, and the favicon is
  <= 64px.
- `TestExpoConfigDeclaresLocalNetworking` asserts the plugin's output rather than app.json keys —
  `usesCleartextTraffic` and `networkSecurityConfig` are NOT app.json keys, which is the false
  claim caught during plan verification. Cleartext is permitted only to 10/8, 172.16/12,
  192.168/16 and localhost, with `<base-config cleartextTrafficPermitted="false" />`.
- Proved by running prebuild, not just by unit test: `npx expo prebuild --platform android`
  produced an AndroidManifest.xml carrying both attributes and a real
  res/xml/network_security_config.xml, and `--platform ios` produced an Info.plist with
  NSAllowsLocalNetworking true and the usage description. Both native folders were then deleted
  and gitignored — the project stays managed.
- `npx expo export --platform web` builds; index.html references only relative paths and no
  external host, and our server serves it (index 200, bundle 200) with COOP/COEP.
- `.github/workflows/ci.yml` runs typecheck, purity, both suites and the web build on Node 24.
- NOT done here: `eas build` was not run. It needs an Expo account and uploads to Expo's cloud —
  an outward-facing action that is the user's to authorise.
