# Decision log — rack-layout-planner

All resolved with the user during the /procoder:spec interview; see
.procoder/ask/answers.md for the recorded answers and
.procoder/specs/rack-layout-planner.md for the resulting spec.

- Monorepo (npm workspaces), one Expo + react-native-web UI package, shared
  core/storage/catalog/server packages. Expo/EAS builds iOS and Android.
- Two user-switchable storage modes: fully local (expo-sqlite / OPFS SQLite) or a
  locally installed Node + node:sqlite server shared by several devices. Data lives
  wherever the active mode says; JSON export/import is the only bridge.
- Mode chosen on first run, changeable in settings; server URL typed in, no LAN
  discovery.
- Full editing on every surface including phone.
- Concurrency by revision check: stale saves are refused, never merged or overwritten.
- Bundled catalogue: generic gear plus UniFi / MikroTik / TP-Link / Synology / QNAP /
  Cisco SG entries.

## OPEN: What happens to the pre-spec scaffolding, and what comes next?

Built before the interview, now contradicting the spec: package.json (React+Vite),
vite.config.js, index.html, src/main.jsx, src/App-less components (Device, Rack,
Palette, Inspector, Cables, PortMenu), src/model.js, src/api.js, server/server.js,
scripts/dev.js, node_modules/.

- Delete the React-DOM scaffolding, keep server/server.js as the seed for
  packages/server, then run /procoder:plan.
- Delete everything and start the monorepo clean from the plan.
- Keep it all for reference in a scratch branch/folder, then run /procoder:plan.

Next step either way: /procoder:plan (architectural work), then todos seeded from the
37 acceptance criteria. No implementation before an explicit yes.

## OPEN: Start building?

Spec COMPLETE, plan COMPLETE (20 tasks), todo list seeded. Nothing implemented yet — the
approval gate is explicit per /procoder:spec.

- Start at Task 1 and work down, gate-clean after each task.
- Read the plan first, then start.
- Build a thin vertical slice first (Tasks 1-6 + a minimal canvas) to see a rack on screen
  before committing to the full 20.

## OPEN: What is the app called? (bundle id under com.azrty.*)

Decides: npm scope (@<name>/core…), Expo app name/slug, iOS bundle id and Android package
(com.azrty.<name>), local database filename, store listing name, repo name.

Checked 2026-08-30 by web search + `npm view` (NOT a trademark or store-listing search):

- PlanMyRack — no app of this name found; free on npm. SURVIVES.
- RackDraft — no product found; free on npm. SURVIVES.
- Rackmate — RULED OUT: DeskPi's 10" rack product line, the exact hardware this app plans.
- Unitrack — RULED OUT: registered trademark (Al Baqi Investment, Tanzania) and Unitrack
  Industries (card cages, rack cooling fans).

Neighbouring products found, all "Rack*": TinyRack (10" rack planner, closest competitor),
RackPlanner Pro (App Store), Stagerack, TSS Rack Planner, rack-planner (GitHub).

Still unverified either way: trademark registers, App Store / Play Store listing availability,
azrty.com subdomain choice.

## OPEN: Move the GitHub repo to the Azrty org

Facts checked 2026-08-30: no `azrty` org exists on GitHub (404); the org is `azrtydxb`
("Azrty", 16 public repos), where piwi3910 is an active admin. `piwi3910/planmyrack` exists,
is PUBLIC and EMPTY (diskUsage 0, isEmpty true, no default branch). The local repo has no
commits. Nothing to preserve: no history, issues, stars or forks.
Token scopes: gist, read:org, repo, workflow, write:packages — no admin:org.

- Transfer piwi3910/planmyrack -> azrtydxb (keeps the name and sets up a redirect; may need
  the admin:org scope added via `gh auth refresh`).
- Create azrtydxb/planmyrack fresh, re-point origin, delete the empty personal repo.
- Visibility on the org repo: private until it ships, or public from the start.
