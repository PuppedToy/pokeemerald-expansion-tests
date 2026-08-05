---
id: T-256
title: "Rework the build queue once most runs never reach it"
status: proposed
type: refactor
created: 2026-08-05
updated: 2026-08-05
target-version: 1.0.0
links: [T-249, T-253, T-254, T-255, docs/adr/ADR-024-single-fifo-build-queue.md, docs/adr/ADR-005-two-tier-preemptive-build-queue.md]
blocked-by: [T-253, T-254]
---

# T-256 — Rework the build queue once most runs never reach it

## Context

Raised by the owner on 2026-08-05: if generation goes offline, does the queue still make sense? The analysis
said **partly — it changes justification rather than becoming pointless**, and the distinction is what this
task is for.

[ADR-024](../docs/adr/ADR-024-single-fifo-build-queue.md) already retired the two-tier scheduler when
injection cut a ROM to ~16.5 s, and it was explicit that latency was never what justified the machinery.
Client injection removes the remaining compute reason for the runs that take that path — but the queue owns
four things that are not compute:

| what it owns | after client injection |
|---|---|
| scheduling compute, serial execution for memory | gone, for runs built in the browser |
| cancel + startup recovery (ADR-003) | still needed, for the server lane only |
| the request record + "your ROM is ready" email | only meaningful when you have to wait |
| the beta invite gate | see [T-255](T-255-beta-gating-with-client-injection.md) |

So the server lane does not disappear: it becomes the **fallback for devices that cannot build locally**
([T-253](T-253-client-injection-device-aptitude.md)), and its size is an empirical question
([T-254](T-254-client-run-telemetry.md)) — which is why this task is blocked on both rather than started now.

## Plan

Deliberately not designed yet: the shape depends on what fraction of traffic still needs the lane. Sketch of
the decision to make, once T-254 has numbers:

- **Small residual fraction** → keep the lane, shrink it hard: no ETA model, no "ahead of you", no
  preemption; a request either builds now or the user is told to try a desktop browser.
- **Substantial fraction** → the queue stays a real product surface and this becomes a simplification pass
  instead of a retirement.

Either way the outcome is one ADR superseding ADR-024 with the new premise, and the removal of whatever the
first branch makes dead. Note ADR-024's own tripwire in reverse: it says its premise fails if a ROM ever
costs minutes again. This task's premise fails if client injection turns out to serve a minority.

Acceptance criteria:
- [ ] Decision made from T-254's measured split, not from an assumption, and written as an ADR superseding
      ADR-024.
- [ ] Whatever the decision makes dead is deleted, not left behind a flag (`queue_class` is already
      vestigial per ADR-024 — fold it in).
- [ ] Cancel and startup recovery still hold for the server lane.
- [ ] A client-injected run's absence from the queue is not a hole in the user's history: they can still see
      what they generated.

## Progress log

- **2026-08-05** — Created from the T-249 shipping decision. Explicitly **not** started: retiring or
  reshaping the queue before knowing the fallback population is the same mistake ADR-005 made in the other
  direction — building policy for a number nobody measured.

## Outcome

<!-- Filled when closing. -->
