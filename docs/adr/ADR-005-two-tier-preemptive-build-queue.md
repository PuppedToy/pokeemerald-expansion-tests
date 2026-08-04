# ADR-005: A two-tier (fast/slow) preemptive serial queue schedules builds, preempting at ROM granularity

- **Status:** superseded by [ADR-024](ADR-024-single-fifo-build-queue.md)
- **Date:** 2026-06-21
- **Task:** T-018

> **Superseded 2026-08-03 (T-245).** This ADR's premise is the per-ROM cost of the compile path (minutes).
> Injection (T-244) put it at ~16.5 s measured on the box, so the two tiers, ROM-boundary preemption and
> aging arbitrate a ~90 s wait instead of a ~27 min one. Retired in favour of one FIFO lane. The reasoning
> below stays valid *for its own premise* — if per-ROM cost ever returns to minutes, start here again.

## Context

ROM-production capacity is one box, one serial worker (ADR-001) — two builds can never run
at once because each mutates the shared working tree (make.js). A single ROM takes ~10–15 s;
a request's bundle holds an array of ROMs (`bundle.roms`, make.js:140), so a request's cost
is `N × ~15 s`. We want users with small (fast) requests to get served promptly even when a
large (slow) request is in progress, without aborting work already done.

Key code fact: `make.js` runs `restore()` (`git checkout`) in a `finally` **after each ROM**
(make.js:168), so the working tree is clean between consecutive ROMs. That makes a ROM the
natural **atomic, preemptible unit**.

## Decision

Schedule builds with **two FIFO queues, fast and slow, preempting at ROM boundaries**, on a
single serial worker.

- **Classification at submit:** a request is *fast* or *slow* by its ROM count (threshold
  configurable; starting point: `≤ 2 ROMs = fast`), known deterministically from the bundle.
- **Scheduling:** the worker always drains the **fast** queue first. While building a *slow*
  request, after finishing the **current ROM** (never mid-build — that would waste ~15 s and
  leave a dirty tree), if the fast queue is non-empty the slow request is set `paused` at
  `k/N` and the fast queue is drained; then the slow request resumes at ROM `k+1`.
- **The worker drives ROMs, not whole bundles:** it invokes the build one ROM at a time
  (refactor of `make.js` bundle-loop into a callable per-ROM unit) so it controls interleaving.
  Calling `make.js --bundle` for a whole bundle would block until all N ROMs finish and defeat
  preemption.
- **Anti-starvation (aging):** a slow request that has been `paused` for longer than a bound
  (e.g. `> M` minutes, or after `K` fast-queue drains) gets a guaranteed ROM slot so it cannot
  be starved indefinitely.
- **ETA model:** `avg_rom_secs` is a rolling EWMA of recent per-ROM build times (seed constant
  ~15 s, calibrated on the instance in T-019). A request's ETA = (ROMs ahead in effective order
  + its own remaining ROMs) × `avg_rom_secs`. A slow request's ETA is **non-monotonic** (incoming
  fast requests push it back) — surfaced honestly to the UI; when initial ETA ≥ 2 min the user is
  offered email-on-ready (ADR-007).
- **Bounded parallelism:** `make -j` is bounded to the box core count (T-017 note on the
  unbounded `make -j` at make.js:163).

## Alternatives considered

- **Single FIFO queue** — rejected: a big request blocks every small one behind it, the exact
  problem we're solving.
- **Abort the slow build when a fast one arrives** — rejected: throws away up to ~15 s of work
  and risks a dirty tree; pausing between ROMs is free and clean.
- **Priority by user instead of by size** — rejected: size is objective and known up front; the
  goal is throughput for small jobs, not user tiers.
- **Parallel workers / multiple build trees** — rejected: violates the serial-tree invariant
  (ADR-001) and adds disk/complexity for a load the queue already absorbs.

## Consequences

- Small requests stay responsive under load; large requests never lose completed ROMs, only
  wait longer. Capacity bursts cost wait time, never money (ADR-001).
- Preempting between heterogeneous bundles thrashes the warm `build/` cache (each switch =
  partial rebuild) — accepted; to be measured, and a reason to keep the fast threshold small.
- We commit to: the per-ROM build refactor, the serial invariant, the aging bound, and bounded
  `make -j`. Scheduler, classification and ETA implemented in T-024 (worker) and T-025 (ETA/API).
