---
id: T-249
title: "Run the injector in the browser — zero-server-compute / offline artifact generation"
status: proposed
type: feature
created: 2026-08-04
updated: 2026-08-04
target-version: 0.8.0
links: [T-246, T-250, docs/client-side-injector-evaluation.md, docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/adr/ADR-022-base-plus-injection-architecture.md, docs/adr/ADR-023-injection-verified-by-data-equivalence.md]
blocked-by: [T-246]
---

# T-249 — Client-side / offline injector

## Context

Carved out of [T-246](T-246-base-injection-frontend-delivery-uat.md), whose criterion was to *evaluate*
this. The evaluation is [docs/client-side-injector-evaluation.md](../docs/client-side-injector-evaluation.md)
— verdict: feasible, and the payoff ADR-013/ADR-022 anticipate (zero server compute per user, a
toolchain-free offline path), but a refactor rather than a flag. Do not restate the evaluation here.

## Plan

In the order that keeps each step independently useful:

1. **Bake the injector's source-derived inputs into an artifact** at base-build time (natural home:
   `buildOffsetMap.js`, which already emits `base-offsets.json`) and feed the modules through the existing
   `sources` seam instead of `readFileSync` — 14 files call it today.
2. **Ship the base as one static `base.bps`** (vanilla→base) applied by the patcher already in the browser
   (ADR-013), cached in IndexedDB next to the user's vanilla ROM; keyed by a base build id so a new base
   invalidates it.
3. **De-`fs` the injector module graph** so it bundles for the browser, and wire it into the Worker behind
   a flag.
4. **Prove it cannot fork from the Node path**: a test that injects one bundle through both and compares
   sha256 (the box and a Mac already agree byte-for-byte — T-244).

Acceptance criteria:
- [ ] The injector runs in the browser and produces, for at least one corpus bundle, a ROM whose sha256
      equals the Node path's.
- [ ] No 32 MB artifact is ever served: the base is reconstructed client-side from vanilla + a static BPS.
- [ ] The Node/GATE-3 path still runs the same modules (no second implementation).
- [ ] Mobile-Safari memory ceiling measured (32 MB ROM + 19 MB bundle in a Worker) and either passed or
      documented as a supported-platform limit.
- [ ] Decided + recorded: what happens to per-run diagnostics/decision logs for a client-injected run.

## Progress log

- **2026-08-04** — Created out of T-246's evaluation criterion.

## Outcome
