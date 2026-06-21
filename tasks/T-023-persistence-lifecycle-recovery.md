---
id: T-023
title: SQLite persistence, request state machine, crash recovery & retention sweeper
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
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

- **Schema (SQLite, on the ADR-002 persistent volume):** `users` (shared with T-021),
  `requests` (one active per user — enforce atomically; state, fast/slow, ROMs done k/N,
  timestamps, ETA inputs, **bundle path**), `runs` (minimal history: seed + params, **no ROM bytes**).
- **Bundle on disk, not in SQLite:** the ~32 MB bundle is written to a per-request file (the build
  reads `--bundle=path`) and referenced by the row; deleting the row in a terminal state also deletes
  the bundle file and any output ROM. Keeps SQLite small and lets the front fetch the bundle for its
  lazy "Regenerate docs" fallback (T-028) while the request is alive.
- **State machine:** `queued_fast | queued_slow | building | paused | ready | failed`;
  terminal `downloaded→purged` / `expired→purged` (purge the `requests` row, keep/write `runs`).
- **Recovery on startup (ADR-003 order):** (1) `git checkout -- src include data/maps` to clean
  the tree; (2) reset any `building` request back to its queue and re-run from ROM 0; (3) hand
  the persisted queue to the scheduler.
- **Retention sweeper:** periodic job deletes ROM files older than 48 h and purges terminal rows;
  delete-on-download only after a *complete, successful* transfer (coordinate with T-025).

Acceptance criteria:
- [ ] Schema created/migrated on boot; one-active-request-per-user enforced atomically.
- [ ] State transitions implemented and unit-tested (including paused↔queued).
- [ ] Simulated crash (kill mid-`building`) recovers: tree restored, request re-queued, no dirty tree.
- [ ] Sweeper removes >48 h ROMs and purges terminal rows; `runs` retains seed/params only.
- [ ] Non-trivial logic covered by tests.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-003).

## Outcome
