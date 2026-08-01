---
id: T-054
title: Viability analysis — randomize a prebuilt ROM by binary injection (vs. compiling from scratch)
status: done
type: chore
created: 2026-07-03
updated: 2026-07-28
target-version: 0.7.0
links: [T-053, T-228, docs/base-plus-injection-viability.md, docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md, docs/adr/ADR-005-two-tier-preemptive-build-queue.md]
blocked-by: []
---

# T-054 — Viability analysis: randomize a prebuilt ROM by binary injection

## Context

**Read [T-053](T-053-bps-patch-delivery.md) and [ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md)
first — the discussion that spawned this task produced a lot of shared context that must be remembered
here.** T-053 (deliver a BPS, patch client-side) is the *first half* of the architecture this task
analyses; this is the *second half*.

Root inefficiency today: we generate each user's ROM **from scratch** by mutating C source and running
the full `make` (`buildOneRom`, [make.js:119](../make.js#L119)). That is why builds are slow (queue +
ETA + two-tier scheduler — [ADR-005](../docs/adr/ADR-005-two-tier-preemptive-build-queue.md); hardened
sandbox — ADR-006; dedicated box — ADR-001), why immediacy collapses under any real queue (even ~15
users), and why a lightweight offline desktop app is hard — it would have to ship a multi-GB GBA
toolchain and recompile locally.

Every mainstream randomizer (Universal Pokémon Randomizer et al.) instead operates on a **prebuilt
ROM**, reading/writing data structures with **no compilation**. Target architecture: build the
expansion **base once** (vanilla→base as a BPS — the T-053 half), then **randomize by injecting binary
data** into that base. This single change would resolve, *together*: legality, backend load, immediacy,
**and** the offline desktop app — they are one problem with one solution.

## Plan

Produce a viability report; if positive, spawn a scoped implementation task + a superseding ADR. Cover
at least:

- **Data-vs-code audit of the writer layer** (the cheap first step, ~half a day): classify every
  current randomizer output as **pure data** (patchable post-build) vs. **code/logic** (e.g. prize
  money patches `src/battle_script_commands.c` — *not* patchable; would have to be redesigned as
  data-driven in the base). This audit sizes the whole overhaul and gates go/no-go.
- **Variable-length / repointing problem** (the real hard part): fixed-size tables (base stats)
  overwrite trivially; variable-length ones (learnsets, trainer parties, wild encounters) need
  free-space management + pointer relocation.
- **Patch-friendly base lever:** since we control the base build, evaluate padding variable tables to a
  fixed max length / reserving a free-space arena so injection becomes fixed-offset overwrites with no
  repointing (turns "max overhaul" into "medium"). Cost: a larger base ROM (acceptable on emulator).
- **Symbol-map offsets:** extract offsets from the build's `.map`/`.sym` instead of hardcoding, so
  upstream syncs ([ADR-012](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md)) regenerate the
  layout automatically rather than silently breaking the injector.
- **Delivery/offline options it unlocks:** client-side injection (server serves a static base BPS +
  injector → *zero* server compute) and/or a lightweight offline desktop app (no toolchain). Contrast
  with toolchain-bundling desktop options: reusing the existing Docker image (ADR-002) vs. an
  MSYS2/devkitARM installer.

Acceptance criteria:
- [x] Writer layer audited: each output classified data vs. code, with the code-touching ones and their
      redesign path listed. → [base-plus-injection-viability.md](../docs/base-plus-injection-viability.md) "complete one-by-one list".
- [x] Report documents the repointing problem, the patch-friendly-base mitigation, and the symbol-map
      approach, with a feasibility verdict and a rough effort estimate.
- [x] Go/no-go = **GO**, and the scoped work + superseding ADR are delivered: [ADR-022](../docs/adr/ADR-022-base-plus-injection-architecture.md)
      (accepted — GATE-1 cleared) + the [strategy](../docs/base-plus-injection-strategy.md) + backlog
      T-229..T-246. Phase 1 (the safety net) is done and green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-03** — Task created as the "future" half of the BPS/offline discussion. Full shared context
  lives in [T-053](T-053-bps-patch-delivery.md) + [ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md).

- **2026-07-27** — Viability analysis done (owner reframed it as a warmup/inject two-phase model with a
  base-ROM combinatorics question). Ran three parallel read-only audits of the whole writer layer + the
  config surface. Findings written up in [base-plus-injection-viability.md](../docs/base-plus-injection-viability.md):
  (1) **≈zero irreducible base axes** — the "mode" toggles (Run&Bun, Steven-tag) are already VAR-gated
  with both branches compiled, so they flip via a `setvar`-operand byte patch (injectable, not a base
  variant); only `money`/`moveRelearnPrice` `#define`s are build-baked and they're trivially reducible to
  a settings struct ⇒ **one base ROM serves every config; the combinatorial warmup collapses to
  "build one base once."** (2) ~80% of the payload is community-routine (a)/(b) injection; the hard,
  bounded remainder is the map-script outputs (#15 gym rewards, #16 statics, #17 item-ball picker) which
  must be redesigned as data tables in a patch-friendly base. (3) **Top risk = the 32 MB ceiling** (built
  ROM is already 32 MB) → Phase-0 must audit the base `.map` for free/padding space before any repoint
  strategy. Recommendation: **Phase-0 end-to-end spike** (base stats + a learnset repoint + one gym
  reward, inject → boot, + free-space audit) before committing. Related build-time quick wins tracked in
  [T-228](T-228-analysis-rom-build-time-optimization.md).

## Outcome
**Viability confirmed → GO.** Full writer audit ([base-plus-injection-viability.md](../docs/base-plus-injection-viability.md))
found ≈1 base ROM (no combinatorics), ~80% community-routine injection, the map-script outputs as the
hard-but-bounded remainder, and the 32 MB ceiling as the top risk. Decision recorded in
[ADR-022](../docs/adr/ADR-022-base-plus-injection-architecture.md) (accepted after GATE-1 cleared), with the
[strategy](../docs/base-plus-injection-strategy.md) + backlog T-229..T-246. Phase 1 executed & green:
GATE-1 ~8.33 MB free, GATE-2 byte-reproducible build, the golden-master corpus + the `verify-corpus` skill
(ALL PASS 12/12). Phase 2 (patch-friendly base refactor) is next. Follow-ups: T-229..T-246. No changelog
line (internal analysis).
