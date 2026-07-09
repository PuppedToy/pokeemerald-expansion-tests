---
id: T-089
title: Randomizer generates duplicated E4 singles+doubles teams for Run & Bun
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, T-086, T-088]
blocked-by: [T-086, T-088]
---

# T-089 — Randomizer generates duplicated E4 singles+doubles teams for Run & Bun

## Context

When `mixed` + `leagueRunAndBun`, each E4 member needs two distinct resolved teams — one singles,
one doubles — written to the base id and the new `TRAINER_*_DOUBLES` id from
[T-088](T-088-decomp-e4-doubles-trainers.md). The doubles team should be built to be reasonable in
doubles; until the Group 2A doubles rating lands it uses the current (singles) rating as a
placeholder, flagged for a later pass.

## Plan

- In the trainer table / resolution, when `leagueRunAndBun` is on, emit for each E4 member a
  singles-flagged team (base id) and a doubles-flagged team (the `_DOUBLES` id) into
  `docs.trainersResultsSimplified` (both, so T-087 stamps `Double Battle:` correctly).
- Teams must be deterministic under the seed and independent (different teams, not a copy).
- When Run & Bun is **off** (plain `mixed`/`singles`/`doubles`), the `_DOUBLES` ids are left as
  harmless placeholders (never entered in-game) — document this.
- Leave a clearly-marked seam so the doubles team is regenerated with the doubles rating once
  Group 2A (T-093…T-097) is available.
- Tests: with Run & Bun on, each E4 base id is singles and each `_DOUBLES` id is doubles with a
  different valid team; determinism across shared ROMs.

Acceptance criteria:
- [ ] Run & Bun on → each E4 member has a singles team (base) and a distinct doubles team (`_DOUBLES`).
- [ ] Both teams are valid, deterministic under seed, and flagged with the correct battle type.
- [ ] Run & Bun off → `_DOUBLES` ids carry a benign placeholder and are unused in-game.
- [ ] A TODO/seam references the future doubles-rating regeneration.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
