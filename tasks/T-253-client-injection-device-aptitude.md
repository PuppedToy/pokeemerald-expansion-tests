---
id: T-253
title: "Decide which devices may build locally, and turn client injection on for them"
status: proposed
type: feature
created: 2026-08-05
updated: 2026-08-05
target-version: 0.9.0
links: [T-249, T-254, T-255, randomizer/docs/client-injection.md]
blocked-by: [T-254]
---

# T-253 — Decide which devices may build locally, and turn client injection on for them

## Context

[T-249](T-249-client-side-offline-injector.md) shipped client injection working and **off**. The owner's
decision (2026-08-05) was to keep the manual flag through the beta and revisit after it, because the
question is not whether it works — it does, byte-identically, in Chromium and WebKit — but **on which
devices it is safe to run**.

Two findings from that decision's analysis set the shape of this task. Both are recorded here because they
are the reason it is not simply "flip the flag":

**1. The measured cost is the 1-ROM cost.** `randomizer/docs/client-injection.md` reports a 213 MB peak.
That is one ROM with a 15 MB bundle. `injectBundleLocally` retains `gbaBytes` (32 MB) **and** `bpsBytes`
(~32 MB) per ROM until the loop ends, so the peak scales linearly with ROM count — and production's real
request mix is not 1-ROM-only (measured on PRO, 20 requests: 16×1, 1×2, 2×4, **1×6**). A 6-ROM run is
~384 MB of retained artifacts before the archive blob is even built. Nobody has measured beyond one ROM.

**2. A memory failure is not catchable.** On iOS the OS kills the tab rather than throwing, so a
`try/catch` fallback to the server path cannot work. The decision has to be made **before** injecting.

## Plan

In order, because each step makes the next decidable:

1. **Flatten the peak** so it stops scaling with ROM count. Two independent wins, both cheap:
   - Drop `bpsBytes` for client-injected runs (halves the retention). The `.bps` next to a ROM the user
     already has is redundant; if the archive must keep offering it, compute it one ROM at a time.
   - Release each finished ROM into the archive (or IndexedDB) before starting the next, instead of
     accumulating — noted as an option in `client-injection.md` but not implemented.
   - Also worth measuring: `bundle` and `sources` are **structured-cloned** into every Worker
     (`postMessage`'s transfer list is `[base]` only), so two copies are live per ROM.
2. **Re-measure** with a production-sized bundle (~39 MB, not 15) at 1/4/6 ROMs, on desktop and on a real
   iOS device. This closes T-249's one deferred acceptance criterion.
3. **A pre-flight capability check**, from the numbers step 2 produces: `navigator.storage.estimate()` for
   quota (the base is 32 MB on top of the user's 16 MB vanilla), `userAgentData.mobile`, ROM count. It
   decides *before* injecting; anything it does not clear goes to the server queue.
4. **Turn it on for the devices that clear it**, replacing `clientInjectEnabled()`'s manual flag as the
   product default. Record the decision as an ADR (it supersedes the "off by default is a product decision"
   note in `client-injection.md`).

Acceptance criteria:
- [ ] Peak memory for a client-injected run is flat in ROM count (measured 1 vs 6, same order).
- [ ] Measured on a real iOS device with a production-sized bundle — pass, or documented as a
      supported-platform limit with the pre-flight excluding it.
- [ ] A device that cannot build locally goes to the server queue **without a failed attempt**.
- [ ] Client injection is the default for devices that clear the pre-flight; the flag is gone or is an
      override only.
- [ ] ADR recorded; `client-injection.md` updated (it currently documents the flag as the product decision).

## Progress log

- **2026-08-05** — Created from T-249's shipping decision. Blocked on [T-254](T-254-client-run-telemetry.md):
  step 3's thresholds should come from real fleet data, and today there is none — PRO has 6 users, 2 distinct
  user-agents (both Windows desktop) and `diagnostics` is purged at 48 h, so the fleet is unmeasured rather
  than measured-and-fine.

## Outcome

<!-- Filled when closing. -->
