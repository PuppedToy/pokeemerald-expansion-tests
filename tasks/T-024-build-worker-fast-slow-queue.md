---
id: T-024
title: Build worker with two-tier (fast/slow) preemptive serial queue
status: done
type: feature
created: 2026-06-21
updated: 2026-06-24
target-version: 0.3.0
links: [docs/adr/ADR-005-two-tier-preemptive-build-queue.md, docs/adr/ADR-001-rom-build-server-provider.md, T-018]
blocked-by: [T-023]
---

# T-024 — Build worker with two-tier (fast/slow) preemptive serial queue

## Context

The scheduling core of the epic [T-018](T-018-backend-build-queue-produce.md), per
[ADR-005](../docs/adr/ADR-005-two-tier-preemptive-build-queue.md): one serial worker, fast
queue served first, slow requests preempted **between ROMs**, with aging so they don't starve.
Builds on the persisted queue/state from T-023.

## Plan

- **Per-ROM build unit:** refactor `make.js`'s bundle-loop (make.js:140) so a single ROM is a
  callable, restartable unit (mutate → `make -j<cores>` → copy `.gba` → `restore()`); the worker
  drives ROMs, not whole bundles. Preserve the per-ROM `restore()` (clean tree between units).
- **Two FIFO queues:** classify a request fast/slow at submit by ROM count (configurable
  threshold, start `≤ 2 = fast`). Worker drains fast first; while building a slow request, finish
  the current ROM, and if fast is non-empty set the slow request `paused` (k/N) and drain fast,
  then resume at k+1.
- **Anti-starvation (aging):** a slow request `paused` beyond a bound (time or fast-drain count)
  gets a guaranteed slot.
- **Serial invariant:** exactly one build at any instant on the shared tree — enforce hard.
- **Bound `make -j`** to box core count (T-017 note on make.js:163).

Acceptance criteria:
- [x] Single ROM is a callable unit (`buildRom(id, romIndex)`); worker runs strictly one build at a
      time (serial invariant tested via a concurrency counter).
- [x] Fast requests preempt a slow one at ROM boundaries; slow resumes from k+1 (no lost ROMs) — tested.
- [x] Aging guarantees a starved slow request eventually progresses — tested.
- [ ] `make -j` bounded; runs inside the T-026 sandbox when deployed — **integration handoff** (the real
      per-ROM `make.js` adapter is wired at server integration / validated at T-019; scheduler is build-agnostic).
- [x] Scheduling/classification/preemption/aging covered by tests (no real `make` in unit tests).

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-005).
- **2026-06-24** — Started (branch `feature/T-024-build-worker`). Design: the scheduler policy is a
  pure function over the DB state — no persistent `building` between ticks; after each ROM a job returns
  to its resting state (`queued_fast` for a started fast, `paused` for a started slow, `queued_slow`
  fresh), so `selectNext` re-applies fast-priority every ROM. Order: **aged-paused > fast > paused/slow**
  (aging lets a starved slow jump the fast queue periodically). `advanceOneRom` builds exactly one ROM
  via an **injected `buildRom(id, romIndex)`** (mock in tests), keeping `make` out of unit tests. The
  real per-ROM `make.js` adapter + bounded `make -j` is the integration step (server wiring / T-019) —
  criterion 4 handed off there; the scheduler/classification/preemption/aging are unit-tested here.
- **2026-06-24** — Implemented (Red→Green) and closed on green. `queue/scheduler.js`: `classify`,
  `selectNext` (aged-paused > fast > paused/slow), `advanceOneRom`, `createWorker` (runOnce/drain/start).
  6 tests; **backend suite 44/44**. One test-bug fixed during Green: the multi-request tests violated
  one-active-per-user (same user) — gave each concurrent request a distinct user (domain-correct).
  Criterion 4 (real build + bounded `make -j`) handed to the server-wiring/T-019 integration. Closed
  under the owner's test-only policy.

## Outcome
