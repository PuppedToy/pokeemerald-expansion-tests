# ADR-024: One FIFO build queue on a serial worker — the two-tier preemptive scheduler is retired

- **Status:** accepted
- **Date:** 2026-08-03
- **Task:** T-245

## Context

[ADR-005](ADR-005-two-tier-preemptive-build-queue.md) chose two preemptive queues because of one number:
a ROM cost minutes. Its own reasoning is explicit — "we want users with small (fast) requests to get served
promptly even when a large (slow) request is in progress". At ~4–5 min per ROM (`AVG_ROM_SECS=270`,
recalibrated to 180 on the box) a 6-ROM run occupied the builder for **~27 min**, so a 1-ROM request behind
it needed a way past — which required a fast lane, a slow lane, pausing at ROM boundaries, resuming without
redoing ROMs, and aging so a paused run could not starve.

T-244 made injection the delivery path, and the number changed. Measured on the production box
(2 vCPU, 2026-08-03, three corpus bundles in an ephemeral container):

| bundle | ROMs | wall clock | per ROM |
|---|---|---|---|
| `baseline` | 1 | 16.8 s | 16.8 s |
| `nicknames-on` | 1 | 16.9 s | 16.9 s |
| `nuzlocke-3` | 3 | 48.9 s | 16.3 s |

**~16.5 s per ROM, and nearly independent of the config** — injection writes the same tables whatever the
data says. The worst case the tiers were built to prevent is now a 6-ROM run ahead of you: **~100 s.**

## Decision

**One FIFO queue, oldest first, on the same single serial worker.** Retired: the fast/slow classification
(`classify`, `FAST_MAX_ROMS`), ROM-boundary preemption, the `paused` state and aging. A multi-ROM request
returns to the one `queued` lane after each ROM and, keeping its original `created_at`, stays at the head
until it is done.

Kept, because latency was never their justification:

- **Serial execution.** Two cores, and each build holds a 32 MB ROM buffer (T-228).
- **Per-ROM advancement.** Still one ROM per worker step, so a cancel or account deletion mid-run stops at
  the next boundary and startup recovery resumes without redoing finished ROMs (ADR-003).
- **The ETA model's shape**, now monotonic: with no preemption, "ahead of you" cannot grow after you queue.
  `AVG_ROM_SECS` defaults to the measured 17 s and remains an env override.

The three tier states are **legacy, not deleted**: rows created by the previous version can still be
selected, and the first startup after the deploy rewrites them into `queued`, so no migration is needed and
no in-flight request is stranded.

## Alternatives considered

- **Keep ADR-005 and only recalibrate `AVG_ROM_SECS`.** Rejected: the policy would still be there — three
  states, an aging bound, a non-monotonic ETA and a user-facing "slow queue" warning — to arbitrate a
  ~90 s wait. Complexity has to keep earning its place.
- **Retire the queue entirely and inject inside the request.** Rejected: it takes the polling/progress
  contract, cancel, startup recovery and email-on-ready down with it, and un-serialises memory on a 3.7 GB
  box. 16 s is fast, not instant.
- **Allow parallel builds now that a build is cheap.** Rejected for now: two cores, and the gain over a
  ~16 s serial step is small. Revisit if the queue is ever actually contended.

## Consequences

- The frontend's "this run goes to the slow queue" warning (T-172) and its mirrored `FAST_QUEUE_MAX_ROMS`
  drift guard are gone: there is no slow queue to warn about.
- `requests.queue_class` becomes vestigial (it records `'fifo'`). Dropping a column in SQLite means
  rebuilding the table, which is not worth a deploy — it stays as historical data.
- Queue behaviour is now readable from one function (`selectNext` = oldest waiting row), which is what
  makes a production incident diagnosable from a log line.
- If per-ROM cost ever regresses to minutes (an upstream base change, a much bigger ROM), this ADR's
  premise fails and ADR-005's reasoning becomes valid again. The measurement above is the tripwire: it is
  cheap to re-run.
