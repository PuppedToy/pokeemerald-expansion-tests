---
id: T-246
title: "Base+injection Phase 5 — frontend/delivery wiring + user acceptance"
status: proposed
type: feature
created: 2026-07-27
updated: 2026-07-27
target-version: 0.7.0
links: [T-229, T-244, docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/base-plus-injection-strategy.md]
blocked-by: [T-244]
---

# T-246 — Frontend/delivery wiring + UAT

## Context
Wire the injector into delivery: server-side injection (seconds) and, as an option, a client-side/offline
injector (zero server compute, toolchain-free desktop app) — the payoff [ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md)
and [ADR-022](../docs/adr/ADR-022-base-plus-injection-architecture.md) anticipate. See
[strategy Phase 5](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Serve the static base BPS + run injection at apply time (server-side first); update the frontend
progress/ETA/download flow. Evaluate a client-side injector for offline. End with owner user-acceptance
testing across representative configs.

Acceptance criteria:
- [ ] Server-side injection wired end-to-end; frontend flow updated (progress/ETA/download).
- [ ] Client-side/offline injector evaluated (spike or follow-up task).
- [ ] Owner UAT across representative configs; sign-off.

## Progress log
- **2026-07-27** — Created (Phase 5).

## Outcome
