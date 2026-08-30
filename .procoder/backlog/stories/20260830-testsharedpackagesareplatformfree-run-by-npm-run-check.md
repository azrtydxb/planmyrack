# `TestSharedPackagesArePlatformFree`, run by `npm run check:purity`, reports no react, react-native or platform import in the shared packages — fails if any file under `packages/core`, `packages/storage` or `packages/catalog` imports a UI or platform module.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 001-every-rack-rule-proved-in-pure-typescript-placement-cabling

## Description

Spec: rack-layout-planner — scope S-16 (Shippable builds)
Plan: Task 1: Monorepo skeleton and the purity gate
Test: `TestSharedPackagesArePlatformFree`

The home-lab owner needs this to hold: `TestSharedPackagesArePlatformFree`, run by `npm run check:purity`, reports no react, react-native or platform import in the shared packages.

Done when `TestSharedPackagesArePlatformFree` passes exactly as written in the plan task above. This behaviour lives in the
pure-logic layer, so the test _is_ the observation — there is no UI to watch it in, and the
criterion names the change that must make it fail. Where the same rule also has to be visible on
screen (a rack summary, a cable schedule), that is a separate story against the canvas tasks.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] `TestSharedPackagesArePlatformFree`, run by `npm run check:purity`, reports no react, react-native or platform import in the shared packages — fails if any file under `packages/core`, `packages/storage` or `packages/catalog` imports a UI or platform module.

## Evidence

- `npm test` → TestSharedPackagesArePlatformFree, 2 passed: an import of `react-native` in
  `tests/fixtures/impure/bad.ts` is reported as `{ file, module }`, and `packages` yields `[]`.
- `npm run check:purity` → "no platform imports in packages", exit 0.
- `node scripts/check-purity.mjs tests/fixtures/impure` → "tests/fixtures/impure/bad.ts:
  imports react-native", exit 1 — the check is proved able to fail, not merely to pass.
- Scanner covers react, react-dom, react-native, @react-native(-community)/* and expo*, over
  .ts and .tsx, skipping node_modules/dist/.git/build/.expo; a directory that does not exist
  yet is not treated as impure.
- Commit f89666c.
