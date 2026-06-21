---
id: T-024
title: Build worker with two-tier (fast/slow) preemptive serial queue
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
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
- [ ] Single ROM is a callable unit; worker runs strictly one build at a time.
- [ ] Fast requests preempt a slow one at ROM boundaries; slow resumes from k+1 (no lost ROMs).
- [ ] Aging guarantees a starved slow request eventually progresses.
- [ ] `make -j` bounded; runs inside the T-026 sandbox when deployed.
- [ ] Scheduling/classification/preemption/aging covered by tests (no real `make` in unit tests).

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-005).

## Outcome
