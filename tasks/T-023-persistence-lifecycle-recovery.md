---
id: T-023
title: SQLite persistence, request state machine, crash recovery & retention sweeper
status: in-progress
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
- [ ] `node:sqlite` schema created/migrated idempotently on boot; backend `node:test` suite runnable.
- [ ] One-active-request-per-user enforced atomically (partial unique index), with a test.
- [ ] State transitions implemented and unit-tested (legal edges pass, illegal throw, paused↔queued).
- [ ] Simulated crash (seed `building`) recovers: tree-restore invoked, request re-queued, `roms_done` kept.
- [ ] Sweeper marks >48 h rows `expired` and purges (files + row); `runs` retains seed/params only, no bytes.

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

## Outcome
