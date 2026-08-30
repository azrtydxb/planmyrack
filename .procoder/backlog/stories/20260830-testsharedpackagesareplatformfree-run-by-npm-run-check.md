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

Done when `TestSharedPackagesArePlatformFree` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

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

