---
id: T-054
title: Viability analysis — randomize a prebuilt ROM by binary injection (vs. compiling from scratch)
status: proposed
type: chore
created: 2026-07-03
updated: 2026-07-03
target-version: 0.7.0
links: [T-053, docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md, docs/adr/ADR-005-two-tier-preemptive-build-queue.md]
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
- [ ] Writer layer audited: each output classified data vs. code, with the code-touching ones and their
      redesign path listed.
- [ ] Report documents the repointing problem, the patch-friendly-base mitigation, and the symbol-map
      approach, with a feasibility verdict and a rough effort estimate.
- [ ] Clear go/no-go recommendation; if go, a scoped implementation task + superseding ADR are proposed.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-03** — Task created as the "future" half of the BPS/offline discussion. Full shared context
  lives in [T-053](T-053-bps-patch-delivery.md) + [ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
