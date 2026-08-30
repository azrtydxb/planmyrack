# Task 10: The local server — node:sqlite store behind a REST API

Status: open
Created: 2026-08-30
Plan: .procoder/plans/rack-layout-planner.md (## Task 10: The local server — node:sqlite store behind a REST API)
Spec: .procoder/specs/rack-layout-planner.md

## Description

Implements "Task 10: The local server — node:sqlite store behind a REST API" from the plan, test-first: every step writes its failing test before the
code that satisfies it. The plan section carries the literal test code, the exact interface
signatures neighbouring tasks depend on, and the files this task owns:
`packages/server/package.json` (depends on `@planmyrack/core`, `@planmyrack/storage`;
`"engines": { "node": ">=24" }`; `bin` entry `planmyrack-server` pointing at `dist/main.js`;
script `build` running `tsc -p tsconfig.json`), `packages/server/tsconfig.json`,
`packages/server/src/sqliteStore.ts`, `packages/server/src/http.ts`,
`packages/server/src/main.ts`, `packages/server/test/sqliteStore.test.ts`,
`packages/server/test/http.test.ts`.

Done means the named tests pass, `npm run check:purity` still exits 0, the gate
(`procoder check`) is clean, and the task's commit is in place.

## Acceptance criteria

- [ ] Write the failing test `packages/server/test/sqliteStore.test.ts`: Run `npm test -w @planmyrack/server` — expect FAIL with "Cannot find module '../src/sqliteStore.js'".
- [ ] Implement `sqliteStore.ts` on `node:sqlite`'s `DatabaseSync` with prepared statements, storing the whole layout document in `doc` and mirroring `name`/`revision` into columns so `list()` needs no JSON parse.
- [ ] Write the failing test `packages/server/test/http.test.ts`: Run `npm test -w @planmyrack/server` — expect FAIL with "Cannot find module '../src/main.js'".
- [ ] Add to `packages/server/test/http.test.ts`.
- [ ] Implement `http.ts` on `node:http` (no framework): route table as above, JSON body capped at 5 MB, `access-control-allow-origin: *` so the web build can reach it, `204` carrying no body, every store error mapped to its status, and the static handler for `apps/app/dist` sending the two…
- [ ] Run `npm run build -w @planmyrack/server && node packages/server/dist/main.js --help` — the compiled binary starts, so the `bin` entry is not a promise about uncompiled TypeScript.
- [ ] Run `npm test -w @planmyrack/server` — passes.
- [ ] Run `procoder check`, then commit: `feat(server): node:sqlite store behind a REST API`.

## Evidence

<!-- Command output, test names and the commit sha, recorded as each box is ticked. -->
