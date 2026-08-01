---
id: T-228
title: Analysis — ROM build-time optimization (cold-cache elimination, LTO, ccache, cores)
status: done
type: chore
created: 2026-07-27
updated: 2026-07-28
target-version: 0.6.0
links: [T-054, T-019, docs/rom-build-performance.md, docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/adr/ADR-001-rom-build-server-provider.md, docs/adr/ADR-002-build-server-iac-docker.md, docs/adr/ADR-005-two-tier-preemptive-build-queue.md]
blocked-by: []
---

# T-228 — Analysis: ROM build-time optimization

## Context

Users see a ROM take ~3 min to "generate the patch" even when randomization is pre-made (bundle mode).
This task investigates *why* and documents *exactly how* to make it faster. Full findings + per-option
runbooks live in **[docs/rom-build-performance.md](../docs/rom-build-performance.md)** (the single home;
do not restate here). Strategic endgame is [T-054](T-054-binary-injection-randomizer-viability.md) (binary
injection); delivery format is BPS ([ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md)).

## Plan

Analysis-first (measure before coding): inspect the live box read-only, mine per-ROM build logs, identify
the real bottleneck and the exact levers, write them up, and reconcile outdated architecture docs. Then
let the owner choose which levers to implement (each is a scoped follow-up).

Acceptance criteria:
- [x] Bottleneck located with evidence: BPS gen is <1 s; the ~3 min is `make`.
- [x] Cold-vs-warm mechanism explained and root-caused (deploy `make tools` → `gbagfx` mtime → graphics
      regen); proven that a new batch/individual ROM does **not** cool the tree.
- [x] Real production architecture captured (Hetzner 2 vCPU / 3.7 GB x86, in-container build) and the
      outdated docs/config flagged for reconciliation.
- [x] Every option written with exact steps, effort, risk, expected impact, and a measurement method →
      docs/rom-build-performance.md.
- [x] Levers documented + prioritized (A–G in the doc). Owner deprioritized implementing them in favour of
      the base+injection endgame (T-054/Phase 2+), which removes per-user builds entirely; the quick wins
      (pre-warm, ccache, LTO=0) remain available as optional follow-ups if build latency bites before then.
- [x] Outdated architecture docs reconciled: `docs/deploy-oracle.md` carries a ⚠ "prod is Hetzner" note,
      `docs/INDEX.md` flags it, and the ADR-001 (CX43) / `deploy/.env.local` (OCI) staleness is recorded in
      rom-build-performance.md (no ADR rewrite).

## Findings (summary — full detail in the doc)

- **BPS is negligible** (~0.1–0.6 s on the 16 MB ROM). "Generating the patch" is ~100 % `make`.
- **Bimodal build time driven by warm vs cold tree:** warm ~55 s (recompiles only the ~116 C units the
  randomizer's mutations fan out to); cold ~150–230 s (regenerates all graphics via `gbagfx`, sometimes
  all 343 C units + sound).
- **Root cause of cold:** every deploy runs `make clean-tools && make tools` (because the rsync overwrote
  the box's Linux tool binaries with host ones), bumping `gbagfx`/`preproc` mtimes → the next build
  regenerates graphics/data. **Deploy-only** — a new nuzlocke batch or individual ROM builds warm.
- **Real box ≠ docs:** production is a Hetzner x86_64 `fsn1` box, **2 vCPU / 3.7 GB**, builds run **inside
  the same container as the web app**. `deploy/.env.local` (OCI), `docs/deploy-oracle.md` (Oracle-primary)
  and ADR-001 (CX43) are stale.
- **Flags:** production compiles at `-O2 + -flto=auto`; `make.js` never passes `LTO=0`. No ccache.

## Candidate follow-up implementation tasks (owner to prioritize)

- **A — Kill deploy cold-invalidation** (pre-warm in update.sh and/or exclude tool binaries from rsync so
  `make tools` is a no-op). Highest value / lowest risk.
- **B — ccache** in the build image (persisted cache dir; LTO-aware).
- **C — `LTO=0` (and/or `O_LEVEL=1`)** from make.js, after A/B testing a produced ROM.
- **D — 2 → 4 vCPU** box resize.
- **E — parallelize multi-ROM bundles** via git worktrees.
- **G — T-054 binary injection** (strategic; already its own task).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-27** — Investigated. Benchmarked `createBps` locally on the 16 MB vanilla ROM (0.1–0.3 s) →
  ruled BPS out. SSH'd read-only into `root@pokemon-emerald-cut.com`: found the real box is Hetzner
  x86_64 2 vCPU / 3.7 GB (not the OCI ARM in `deploy/.env.local`), builds run in the `deploy-app-1`
  container, `AVG_ROM_SECS=180`, no ccache, built ROM 32 MB. Mined `/app/backend/data/logs/*.log`:
  durations are bimodal (~55 s warm / ~150–230 s cold). Established via `cc1`+`gbagfx` counts that cold =
  graphics regeneration (and sometimes full 343-file C rebuild), and root-caused it to `make tools` on
  every deploy bumping `gbagfx` mtime. Proved (mechanically + from consecutive different-bundle logs)
  that a new batch/individual ROM does **not** cool the tree — deploy does. Wrote
  [docs/rom-build-performance.md](../docs/rom-build-performance.md) with per-option runbooks. Dead ends:
  initial guess that the box was a 1-OCPU OCI ARM (from `.env.local`) was wrong — verified on the box;
  initial guess that the BPS codec's byte-by-byte JS array was slow — measured, it is not.

## Outcome
Analysis delivered ([docs/rom-build-performance.md](../docs/rom-build-performance.md)): the ~3 min is ~100 %
`make` (BPS <1 s); build time is bimodal (warm ~55 s / cold ~150–230 s), the cold penalty is deploy-only
(`make tools` bumps `gbagfx` → graphics regen), root-caused with evidence; real prod box captured (Hetzner
2 vCPU/3.7 GB, in-container build) and stale docs flagged. Per-lever runbooks (pre-warm, ccache, LTO=0,
4 vCPU, worktree parallelism, T-054). Owner chose to pursue the base+injection endgame (T-054) over these
build-speed levers, which are left as optional follow-ups. No changelog line (internal analysis).
