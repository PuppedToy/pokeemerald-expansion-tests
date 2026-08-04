---
id: T-245
title: "Base+injection Phase 5 — recompute ETAs + simplify the build queue"
status: in-progress
type: refactor
created: 2026-07-27
updated: 2026-08-03
target-version: 0.7.0
links: [T-229, T-244, docs/adr/ADR-005-two-tier-preemptive-build-queue.md, docs/adr/ADR-024-single-fifo-build-queue.md, docs/base-plus-injection-strategy.md]
blocked-by: [T-244]
---

# T-245 — New ETAs + queue simplification

## Context
Injection is seconds, not minutes, so the ETA model and the two-tier preemptive queue
([ADR-005](../docs/adr/ADR-005-two-tier-preemptive-build-queue.md)) are likely over-engineered now. See
[strategy Phase 5](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Measure real inject times; recompute/retire `AVG_ROM_SECS`; simplify or remove the queue/scheduler as the
new latency allows (superseding note to ADR-005 if the decision changes).

Acceptance criteria:
- [x] Real inject latency measured; ETA model updated (or removed).
- [x] Queue/scheduler simplified or retired; ADR-005 revisited via a superseding note if applicable.

## Progress log
- **2026-07-27** — Created (Phase 5).

- **2026-08-03 — measured first, on the box.** Three corpus bundles injected on the production box
  (2 vCPU Hetzner) in an **ephemeral `docker run --rm`** with the golden-corpus bundles mounted read-only —
  no production state touched, nothing persisted:

  | bundle | ROMs | wall clock | per ROM |
  |---|---|---|---|
  | `baseline` | 1 | 16.8 s | 16.8 s |
  | `nicknames-on` | 1 | 16.9 s | 16.9 s |
  | `nuzlocke-3` | 3 | 48.9 s | 16.3 s |

  Two things fall out of this, and both matter more than the average:
  - **The cost barely varies with the config** (16.3–16.9 s). Injection writes the same tables whatever the
    data says, so a *constant* is now a good model — the 270 s default was a bad one for the compile path
    it described (~55 s warm vs ~230 s cold).
  - **Per-ROM cost is flat across a multi-ROM bundle**, so process startup + the 19 MB bundle parse are not
    the dominant term. No need to batch ROMs per process.
  Cross-checked locally (M-series Mac): 7.7 / 7.9 / 8.4 s — same shape, ~2× faster hardware.

- **2026-08-03 — the queue.** ADR-005's own justification is a ROM costing minutes: a 6-ROM run held the
  builder ~27 min, so a 1-ROM run needed to jump it — hence two lanes, ROM-boundary preemption, a `paused`
  state and aging. At 16.5 s that worst case is **~100 s**, so the machinery now arbitrates ~90 s. Retired
  in [[ADR-024]] (ADR-005 marked superseded, its reasoning left intact for its own premise).
  - `scheduler.js`: `selectNext` is now "oldest waiting row" — one function, readable from a log line.
    Deleted `classify`, `FAST_MAX_ROMS`, the aging bound and the preemption branch. A multi-ROM run returns
    to the single `queued` lane after each ROM and keeps its `created_at`, so it stays at the head.
  - **Kept deliberately** (latency was never their reason): serial execution (2 cores, a 32 MB ROM buffer
    per build) and per-ROM advancement (cancel/account-deletion stop at a boundary; recovery resumes
    without redoing ROMs).
  - **No migration.** The three tier states are legacy: still selectable, and the first startup after the
    deploy rewrites them to `queued` (`lifecycle/recovery.js`). A row sitting in `paused` when this deploys
    would otherwise be served only by the legacy branch forever. Both halves are tested, and the tests
    write the legacy state **straight to the row** — it is deliberately no longer reachable through a legal
    transition, which is what makes it legacy.
  - `eta.js`: default 270 → **17 s** with the measurement and its provenance in the comment; `romsAhead`
    is FIFO ("queued earlier, or currently building"). The ETA is **monotonic again** — ADR-005 called out
    a non-monotonic ETA as an honest consequence of preemption, and with preemption gone the cause is gone.
  - `beta/handlers.js` carried its **own** copy of the 270 s default (batch sizing aims at ~1 h of build
    time per invite round). Updated too — left alone, invite batches would have been sized ~16× too small.
  - Frontend: deleted the "this run goes to the slow queue" warning (T-172) — its two banners, the
    `_syncSlowQueueWarning` sync, `slowQueueWarning`/`slowQueueMessage`, the mirrored `FAST_QUEUE_MAX_ROMS`
    and its SSOT drift-guard test file. There is no slow queue to warn about.
  - Doc drift repaired in the same pass: `docs/INDEX.md` (ADR-005 marked superseded + ADR-024 added),
    `docs/rom-build-performance.md` (the ETA row), `docs/deploy-oracle.md` (the benchmark step now says to
    make sure no compile-era `AVG_ROM_SECS` is left in the box env).
  - **Deploy note for T-246:** the box's `deploy/.env` still sets `AVG_ROM_SECS=180`, which would override
    the new default and quote ~3 min per ROM. It must be unset (or set to ~17) when this deploys.
  - Suites green: backend **218**, frontend **202**.

## Outcome
