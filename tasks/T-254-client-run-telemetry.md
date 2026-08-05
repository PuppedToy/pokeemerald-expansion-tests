---
id: T-254
title: "Measure the device fleet, so client injection can be decided on data"
status: proposed
type: feature
created: 2026-08-05
updated: 2026-08-05
target-version: 0.9.0
links: [T-249, T-253, T-256]
blocked-by: []
---

# T-254 — Measure the device fleet, so client injection can be decided on data

## Context

Asked on 2026-08-05 whether every device is fit for offline generation, the honest answer was **we cannot
tell**. What PRO actually holds:

| | |
|---|---|
| users | 6 (2 beta invites) |
| requests in a month (5 Jul → 4 Aug) | 20 |
| **distinct user-agents ever recorded** | **2** — Windows Chrome 150, Windows Firefox 153 |

Zero mobile observed, but with n=2 that is not evidence of anything. The cause is structural, not bad luck:
`user_agent` is only stored on `diagnostics` / `decision_logs`, and those are **purged at 48 h** by the
retention sweeper (`backend/db/diagnostics.js`), so no fleet history accumulates. [T-253](T-253-client-injection-device-aptitude.md)
needs thresholds; there is nothing to derive them from.

## Plan

A small, retained, privacy-proportionate record of *device capability and run outcome* — not a general
analytics layer, and deliberately not on the 48 h diagnostics table.

1. Capture per run, both paths (server-built and client-injected), so the two are comparable: user-agent
   family + platform, `navigator.deviceMemory` where exposed, `navigator.storage.estimate()` quota/usage,
   ROM count, which path was taken, outcome, and — for client-injected runs — wall clock and peak heap
   where the browser exposes it.
2. Own table with its own (longer) retention; no bundle contents, no seeds, nothing that identifies a run's
   contents. Aggregate-only by construction.
3. A read-out: the distribution of device classes and the client-inject success rate per class. That is the
   input T-253's pre-flight thresholds come from, and [T-256](T-256-queue-redesign-after-client-injection.md)'s
   estimate of how much traffic still needs the server lane.
4. Check it against the privacy policy shipped in T-222 and extend the disclosure if it says anything less.

Acceptance criteria:
- [ ] Capability + outcome recorded for every run, both paths, with its own retention window.
- [ ] Nothing run-identifying is stored; the privacy policy covers what is.
- [ ] A read-out that answers "what fraction of our traffic could build locally today, and what fraction
      tried and failed".
- [ ] The tail is visible, not averaged away — a 2 GB Android is the case that matters, not the median.

## Progress log

- **2026-08-05** — Created. This is deliberately sequenced **before** T-253 and T-256: both need to know the
  fleet, and guessing it is what this whole line of work is trying to avoid.

## Outcome

<!-- Filled when closing. -->
