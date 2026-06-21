# ADR-003: SQLite persists the request lifecycle; the backend recovers by restoring the tree and re-running in-flight jobs

- **Status:** accepted
- **Date:** 2026-06-21
- **Task:** T-018

## Context

The ROM-production service must survive a restart (deploy, crash, OOM) without losing
a user's in-flight request — an explicit requirement. It also must hold a small amount
of durable state: users, the per-user "owns a valid ROM" flag, the request queue and its
positions, and a minimal run history (seed + params, never ROM bytes) so a user can
re-generate from a past seed. The owner asked for a **lightweight, simple** store.

A hard constraint comes from the build itself (see T-017, make.js): every ROM build
mutates `src/`, `include/`, `data/maps/` and restores them in a `finally` (`git checkout`).
If the process is **SIGKILLed mid-build, that `finally` never runs** → the working tree is
left dirty → the next build aborts on the uncommitted-changes guard (make.js:30). A
half-written `.gba` is garbage. So "resume" cannot mean "continue"; it means "clean up and
re-run".

## Decision

Persist all durable state in **SQLite** (single file, on the ADR-002 named volume), and
model each request as an explicit **state machine** recovered deterministically on startup.

- **Store (SQLite):** `users` (credentials, verified flag, owns-valid-rom flag),
  `requests` (one active per user, state, fast/slow class, ROMs done k/N, timestamps,
  ETA inputs), `runs` (minimal post-hoc history: seed + params, **no files**).
- **Request states:** `queued_fast | queued_slow | building | paused | ready | failed`,
  with terminal cleanup `downloaded→purged` and `expired→purged`.
- **Recovery on startup (in this order):** (1) `git checkout -- src include data/maps`
  to guarantee a clean tree before anything builds; (2) any request left in `building`
  is reset to its queue (`queued_fast`/`queued_slow`) and re-run from ROM 0 of the current
  unit; (3) the scheduler resumes from the persisted queue.
- **Retention / no junk:** ROMs live 48 h; a periodic sweeper deletes expired ROM files and,
  on download or expiry, **purges the request row** while writing/keeping its `runs` entry.
  Files are deleted only after a *successful, complete* download transfer.

## Alternatives considered

- **In-memory queue / job store** — rejected: loses everything on restart, violating the
  resume requirement.
- **Postgres/MySQL** — rejected: heavier than needed for a single box and a handful of
  tables; SQLite covers it and is one file to back up.
- **Redis/BullMQ** — rejected: adds a daemon and ops surface for a single serial worker;
  the durability we need is small and SQLite-shaped.
- **"Resume" = continue a half-built ROM** — rejected as impossible: a killed `make` leaves
  partial artifacts and a dirty tree; re-running the unit is the only correct recovery.

## Consequences

- One file is the whole durable state — trivial to back up and reason about; fits the
  "lightweight" constraint and the resume requirement.
- We commit to: running every build through a startup-safe path (tree restored first),
  enforcing one-active-request-per-user atomically (DB constraint), and keeping `runs`
  free of ROM bytes (only seed/params) so history stays cheap and legally clean.
- SQLite is single-writer; with one serial build worker and low API concurrency this is a
  non-issue, but the API must not open long write transactions across a build.
- Detailed schema, state transitions and the sweeper live in T-023.
