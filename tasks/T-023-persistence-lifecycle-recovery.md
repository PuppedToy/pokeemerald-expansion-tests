---
id: T-023
title: SQLite persistence, request state machine, crash recovery & retention sweeper
status: done
type: feature
created: 2026-06-21
updated: 2026-06-22
target-version: 0.3.0
links: [docs/adr/ADR-003-persistence-job-lifecycle-recovery.md, T-018]
blocked-by: []
---

# T-023 — SQLite persistence, request state machine, crash recovery & retention sweeper

## Context

Durable backbone of the epic [T-018](T-018-backend-build-queue-produce.md), per
[ADR-003](../docs/adr/ADR-003-persistence-job-lifecycle-recovery.md): the store, the request
lifecycle, restart recovery (so nothing is lost), and the cleanup that keeps disk and DB free
of junk. Consumed by the queue worker (T-024) and the API (T-025).

## Plan

### Tech (chosen; backend is ESM on Node 24)

- **DB driver: `node:sqlite`** (built-in `DatabaseSync`, synchronous, **zero new dependency**, no
  native build → keeps the hardened Docker image of T-026 lean). May emit an experimental warning /
  need `--experimental-sqlite` on 24.x — confirm at impl. Fallback: `better-sqlite3` (battle-tested,
  same sync shape) if the experimental API bites, at the cost of a native compile in the image.
- **Tests: `node:test`** (ESM-native, zero dep) with an in-memory DB (`:memory:`). Add a `test`
  script to `backend/package.json`. The randomizer's `cd randomizer && npm test` (Jest/CJS) is
  separate and untouched; this establishes the backend's own suite.
- DB file path from env (default `backend/data/app.db`), on the ADR-002 persistent volume.

### Schema (DDL sketch)

```sql
-- T-023 owns schema/migrations; T-021 owns the auth logic over `users`.
CREATE TABLE users (
  id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0, owns_valid_rom INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL );

CREATE TABLE requests (
  id TEXT PRIMARY KEY,                 -- uuid
  user_id INTEGER NOT NULL REFERENCES users(id),
  state TEXT NOT NULL,                 -- see state machine
  queue_class TEXT NOT NULL,           -- 'fast' | 'slow'
  roms_total INTEGER NOT NULL, roms_done INTEGER NOT NULL DEFAULT 0,
  bundle_path TEXT NOT NULL, output_path TEXT,
  email_on_ready INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL, started_at INTEGER, ready_at INTEGER, updated_at INTEGER NOT NULL );

-- one active request per user (partial unique index over non-terminal states)
CREATE UNIQUE INDEX one_active_per_user ON requests(user_id)
  WHERE state IN ('queued_fast','queued_slow','building','paused');
CREATE INDEX requests_by_state ON requests(state);

CREATE TABLE runs (                    -- durable history; NEVER ROM bytes
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
  seed TEXT NOT NULL, params_json TEXT NOT NULL, created_at INTEGER NOT NULL );
```

Bundle stays **on disk** (per-request file, build reads `--bundle=path`); the row only holds
`bundle_path`/`output_path`. Purging a row deletes both files.

### State machine

| From | Event (actor) | To |
|---|---|---|
| — | produce, class=fast/slow (T-025) | `queued_fast` / `queued_slow` |
| `queued_*` | worker claims (T-024) | `building` |
| `building` | ROM k done, more remain | `building` (roms_done++) |
| `building` | fast arrives while slow building (T-024) | `paused` |
| `paused` | worker resumes (after fast drained / aging) | `building` (from roms_done) |
| `building` | all ROMs done | `ready` (write `runs`, set `ready_at`) |
| `building`/`paused` | build error / timeout (ADR-006) | `failed` |
| `ready` | successful full download (T-025) | `downloaded` → **purge** |
| `ready`/non-terminal | sweeper, age > 48 h | `expired` → **purge** |
| `failed` | user ack / sweeper | **purge** |

Purge = delete bundle + output files, then delete the `requests` row. `runs` is written once, at
`ready`, and survives the purge.

### Recovery on startup (ADR-003 order)

1. Restore the working tree (`git checkout -- src include data/maps`) — a SIGKILLed build skips
   make.js's `finally{restore()}` and leaves it dirty (delegates to the T-024 build module's
   restore helper; T-023 orchestrates the call).
2. Any `building`/`paused` request → back to `queued_fast`/`queued_slow`, **keeping `roms_done`**
   (the interrupted ROM k+1 re-runs; completed ROMs are not redone).
3. Hand the persisted queues to the scheduler (T-024).

### Retention sweeper

`setInterval` (configurable, e.g. every 5 min): rows past 48 h (`ready_at`/`created_at`) → `expired`
→ purge. Delete-on-download is owned by T-025 and only fires after a *complete, successful* transfer.

### Module surface (what this task ships, consumed by T-021/T-024/T-025)

- `backend/db/index.js` — open + run migrations (idempotent), expose the `DatabaseSync` handle.
- `backend/db/requests.js` — repo: `create`, `getActiveForUser`, `claimNext(class)`, `transition`,
  `incRomDone`, `markReady`, `markDownloaded`, `purge`; transitions validated against the table above.
- `backend/db/runs.js` — `record(seed, params)`, `listForUser`.
- `backend/lifecycle/recovery.js` — `runOnStartup()`.
- `backend/lifecycle/sweeper.js` — `start()`.

### TDD (Red first, `node:test` + `:memory:`)

1. one-active-per-user: second active insert for a user **rejects**; allowed again after terminal.
2. transitions: every legal edge passes; illegal transitions throw; `roms_done` increments.
3. recovery: seed a `building` row → `runOnStartup()` → it's `queued_*` with `roms_done` preserved;
   tree-restore invoked (mock the restore helper).
4. sweeper: a row past 48 h → `expired` + purge (files deleted, mock fs); `runs` row retained.
5. `runs` never stores ROM bytes (only seed/params).

Acceptance criteria:
- [x] `node:sqlite` schema created/migrated idempotently on boot; backend `node:test` suite runnable.
- [x] One-active-request-per-user enforced atomically (partial unique index), with a test.
- [x] State transitions implemented and unit-tested (legal edges pass, illegal throw, paused↔queued).
- [x] Simulated crash (seed `building`) recovers: tree-restore invoked, request re-queued, `roms_done` kept.
- [x] Sweeper marks >48 h rows `expired` and purges (files + row); `runs` retains seed/params only, no bytes.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-003).
- **2026-06-22** — Started; set in-progress on branch `feature/T-023-persistence-lifecycle-recovery`.
  Grounded the plan in the backend (ESM, Node 24, express-only, `generator.js` in-memory job-store
  pattern). Tech chosen: **`node:sqlite`** (built-in, sync, zero new dep, no native build — keeps the
  T-026 image lean; fallback `better-sqlite3` if the experimental API bites) and **`node:test`** for a
  new backend suite. Wrote the concrete plan: schema DDL (users/requests/runs + partial unique index
  for one-active-per-user, bundle on disk), the full state-transition table, the ADR-003 startup
  recovery (keep `roms_done`), the sweeper, the module surface, and a Red-first test list. Next: write
  the failing `node:test` specs, then the migration + repo.
- **2026-06-22** — Implemented (Red→Green). Wrote 6 failing specs first (saw them fail on the missing
  `db/index.js`, the right reason), then the modules: `db/index.js` (open + idempotent migration +
  `ACTIVE_STATES`/`TRANSITIONS`), `db/requests.js`, `db/runs.js`, `lifecycle/{recovery,sweeper,complete}.js`.
  **Backend suite: 14/14 green** (`cd backend && npm test` via `node --test`); randomizer Jest untouched
  (464/464). All 5 acceptance criteria met and ticked. Refinements vs the plan, both logged here:
  (1) the one-active partial index includes **`ready`** (an undownloaded ready ROM occupies the user's
  single slot); `failed` is non-blocking so users can retry. (2) Added `seed`/`params_json` to the
  `requests` row so `finishBuild` can write the `runs` history at the moment of `ready`. Tooling notes:
  `node:sqlite` works on Node 24 with no flag/warning; `node --test <dir>` is treated as a script entry,
  so the test script is bare `node --test` (cwd auto-discovery). Added `backend/data/` to `.gitignore`.
  **Not yet wired into `server.js` boot** — deferred until there are consumers (T-021 auth / T-024 worker
  / T-025 produce) so we don't open a DB file with nothing using it. Ready for user review.
- **2026-06-22** — Closed (owner-approved). Owner OK'd the two judgment calls (a `ready` ROM occupies
  the user's slot; `failed` is non-blocking) and authorized closing test-only tasks on a green suite.
  Backend 14/14, randomizer 464/464.

## Outcome

**Shipped:** the durable persistence backbone for the backend epic (ADR-003), on the built-in
`node:sqlite` with a new `node:test` backend suite (14 tests). Modules: `db/index.js`
(open + idempotent migration, `ACTIVE_STATES` + `TRANSITIONS`), `db/requests.js` (request repo +
state machine + one-active-per-user partial unique index), `db/runs.js` (seed/params history, never
bytes), `lifecycle/{recovery,sweeper,complete}.js` (restore-and-re-run recovery keeping `roms_done`;
48 h expiry purge; atomic mark-ready-and-record-run).

**Deviations from the plan:** (1) the active-slot set includes `ready` and `failed` is non-blocking
(owner-approved). (2) Added `seed`/`params_json` to the `requests` row so run history is written at
`ready`. (3) Not wired into `server.js` boot yet — deferred until consumers exist.

**Follow-ups:** none new. Consumers of this layer: T-021 (auth/users table), T-024 (worker uses the
requests repo + state machine), T-025 (produce/status/download). No changelog line — internal infra,
not user-visible.
