# A layout saved on one client against the server is listed by a second client after refresh — `TestServerLayoutVisibleToSecondClient` — fails if the second client's list omits a layout the server holds.

Status: done 2026-08-30
Created: 2026-08-30
Epic: rack-layout-planner
Sprint: 002-layouts-persist-and-are-shared-one-store-contract-proved-by

## Description

Spec: rack-layout-planner — scope S-9 (Server mode storage)
Plan: Task 10: The local server — node:sqlite store behind a REST API
Test: `TestServerLayoutVisibleToSecondClient`

The home-lab owner needs this to hold: a layout saved on one client against the server is listed by a second client after refresh.

Done when `TestServerLayoutVisibleToSecondClient` passes exactly as written in the plan task above, AND the behaviour is
observed once in the running app rather than only in the test — the criterion below names the
change that must make it fail, so a test that cannot fail does not close this story.

## Acceptance criteria

<!-- Each criterion is testable. Check a box ONLY when it is verifiably
     true — the closer will ask for the evidence. -->

- [x] A layout saved on one client against the server is listed by a second client after refresh — `TestServerLayoutVisibleToSecondClient` — fails if the second client's list omits a layout the server holds.

## Evidence

- `TestServerLayoutVisibleToSecondClient` (packages/server/test/http.test.ts): one client POSTs
  a layout, a second client's GET /api/layouts lists it by id and name.
- Proved beyond the test: the server was started for real on port 8795, `GET /api/health`
  returned {"ok":true,"version":"0.1.0"}, a POST created a layout at revision 1, and a separate
  GET listed it back.
- The same store contract suite passes against memory, node:sqlite and HTTP, so "visible to a
  second client" is not special-cased in the server — it falls out of one shared interface.
- 87 tests across 12 files green; typecheck exit 0; gate 0 blocking. Commit 6ba6b67.

