---
id: T-255
title: Decide what invite-only building means once building is local
status: proposed
type: feature
created: 2026-08-05
updated: 2026-08-05
target-version: 0.9.0
links: [T-249, T-216, T-253, T-256]
blocked-by: [T-253]
---

# T-255 — Decide what "invite-only building" means once building is local

## Context

The beta gate lives in `handleProduce` (`backend/produce/handlers.js`) — a not-yet-accepted user's run is
held in `pending`. Client injection never reaches that code: it builds locally and returns, with no request
row and no queue.

T-249 closed the immediate hole rather than leaving it open: `/client/` is now behind
`createClientArtifactsGate` (accepted invite, or BETA off), so flipping `?clientInject=1` without an invite
gets a 403, the manifest reads as null and the run falls back to the server queue. That is enough for a
closed beta with the flag off.

**It is a signal, not a lock, and that is inherent.** `base.bps` is a function of the base build alone —
byte-identical for every user and every run — so one copy shared outside the beta serves everyone
indefinitely. (Today's per-run patches are shareable too, but each only reproduces its own run.) No amount
of gating changes that; only choosing not to publish the artifact would, and that is the same as not
shipping the feature.

So the real decision is a product one, and it comes due when [T-253](T-253-client-injection-device-aptitude.md)
makes local building the default: **what is the gate actually for, once building cannot be prevented?**

## Plan

Decide between, and implement:

- **Move the gate to what is genuinely controllable** — registration, generation, presets, support — and
  accept that building is free. Most honest; removes a control that only looks like one.
- **Keep the artifact gate as friction** and accept its leakiness, on the grounds that it is proportionate
  for a closed beta and costs nothing now that it exists.
- **Gate on something per-user** (short-lived signed artifact URLs) — raises the cost of casual sharing but
  not of deliberate sharing, and adds a moving part to the one path that currently has no server dependency
  at run time. Weigh carefully against what it actually buys.

Acceptance criteria:
- [ ] Decision recorded as an ADR, stating plainly what the gate can and cannot enforce.
- [ ] Whatever the beta gate promises in the UI matches what it enforces (no implying a lock).
- [ ] Consistent across both lanes: a user's ability to build does not depend on which device they opened.

## Progress log

- **2026-08-05** — Created. T-249 shipped with the artifact gate in place, so nothing is open right now;
  this task exists because the gate stops being sufficient the moment local building becomes the default,
  and that is a decision to take deliberately rather than by omission.

## Outcome

<!-- Filled when closing. -->
