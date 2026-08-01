# ADR-022: Randomize a prebuilt base ROM by data injection instead of compiling per user

- **Status:** accepted — GATE-1 (the 32 MB free-space audit) cleared 2026-07-27: base ROM is 24.8 MB / 32 MB (73.98 %) → **~8.33 MB free**, the B1 padding budget fits with wide margin (T-232)
- **Date:** 2026-07-27
- **Task:** T-054 (viability), T-229 (this decision + planning), T-232 (GATE-1)

## Context

Today every user's ROM is generated **from scratch**: the randomizer edits C/script source and runs a
full `make` ([make.js `buildOneRom`](../../make.js#L118)). That costs ~1–4 min per ROM
([rom-build-performance.md](../rom-build-performance.md)), forces a build queue + two-tier scheduler
([ADR-005](ADR-005-two-tier-preemptive-build-queue.md)), a hardened build sandbox (ADR-006) and a
dedicated box (ADR-001), and makes an offline desktop app impractical (it would ship a multi-GB
toolchain). Delivery is already a BPS patch applied client-side ([ADR-013](ADR-013-bps-patch-delivery-client-side.md)),
which explicitly named this change as its "second half."

The viability analysis ([base-plus-injection-viability.md](../base-plus-injection-viability.md), from a
full per-writer audit) found: (1) **no config option irreducibly forks the compiled engine** — the mode
toggles are VAR-gated with both branches compiled, and the only build-baked values are two/three numbers
— so **one base ROM serves every configuration** (the feared combinatorial base matrix does not exist);
(2) **~80 % of the payload is exactly what the community injects routinely**; (3) the hard, bounded
remainder is a handful of outputs we currently express as **map-script edits** (gym/static rewards, the
item-ball picker, mail), which must be redesigned as **data tables**; (4) the dominant risk is the
**32 MB GBA ceiling** (the built ROM is already 32 MB), which governs how much table-padding/free-space we
can afford.

## Decision

Adopt **"build the base ROM once, then inject the randomized data into the prebuilt ROM"** as the target
generation architecture, replacing per-user compilation. Concretely:

- Keep the randomizer's **value-computation logic unchanged**; change only the **output sink** from
  source-edit-then-`make` to binary writes into a prebuilt base ROM.
- Refactor the base so the script/`#define`-driven outputs become **data-driven tables + a runtime
  settings struct**, and variable-length tables are **padded to fixed capacity / a reserved free-space
  arena** (so injection is fixed-offset), subject to the 32 MB budget.
- Drive all offsets from the build's **`.map`/`.sym`** (never hardcode), so upstream syncs
  ([ADR-012](ADR-012-upstream-bugfix-cherry-pick-sync.md)) regenerate the layout automatically.
- Migrate module-by-module behind a **runtime compile-vs-inject switch**, verified against a
  **byte-identical golden master** at every step, then decommission the old compile path.

Execution is phased with go/no-go gates in [base-plus-injection-strategy.md](../base-plus-injection-strategy.md);
this ADR is **accepted only once GATE-1 (free-space) clears** — if the 32 MB budget cannot fit the
inject-friendly layout, the decision is revisited (partial injection, or scope-cut of the largest-growth
features).

## Alternatives considered

- **Keep compiling per user + only speed up `make`** (ccache, LTO=0, pre-warm — T-228). Real short-term
  wins, but never reaches "seconds," never removes the queue, never enables offline. Complementary, not a
  substitute.
- **Pre-build every base-ROM combination (combinatorial warmup).** Rejected: the audit shows there are no
  irreducible base axes, so there is nothing to enumerate — one base suffices.
- **Hardcode offsets (UPR-style static DB).** Rejected: our data is expansion-format and changes with
  every upstream sync; offsets must come from our own `.map`.

## Consequences

- **Easier:** generation drops from minutes to seconds; the build queue/scheduler (ADR-005) can be
  simplified or removed; server compute drops to near-zero (or client-side injection ⇒ zero); an offline,
  toolchain-free desktop app becomes feasible; the legal posture is unchanged (still a BPS over a base the
  user must own — ADR-013).
- **Harder / new commitments:** a one-time **patch-friendly base refactor** (data-driven rewards + item
  placement + settings struct + fixed-capacity tables); a **`.map`-driven injector** we must maintain
  across upstream syncs; a **byte-identical verification harness** (golden-master corpus + **PRO** build
  diffing — CI has no capacity for full ROM builds, so PRO is the only build environment) plus **owner
  manual play-testing** on the downloaded ROM for the Phase-2 behavioral checks; both become part of the
  release gate.
- **Risk owned:** the 32 MB ceiling (GATE-1). If free space is insufficient, some tables keep classic
  repointing (B2) or features are scope-cut.
- Builds on ADR-013 (BPS delivery) and will likely **revisit ADR-005** (the queue may become
  unnecessary). Supersedes nothing outright.
