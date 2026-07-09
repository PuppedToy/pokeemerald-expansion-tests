---
id: T-084
title: Design the battle-format architecture (bundle representation, pools, Run & Bun) + ADR-014
status: done
type: docs
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, docs/adr/ADR-014.md]
blocked-by: []
---

# T-084 — Design the battle-format architecture (bundle representation, pools, Run & Bun) + ADR-014

## Context

Group 1 opener (see [T-083](T-083-epic-battle-formats-and-teambuilding.md)). Before touching code
we pin the architecture in ADR-014 so the frontend, randomizer, writer, decomp and maker tasks all
build against one contract. The pipeline today has **no** battle-format concept anywhere; the
bundle spreads `config` verbatim, and `docs.trainersResultsSimplified` is the resolved SSOT the ROM
is built from.

## Plan

Write **ADR-014** deciding, and this task carries no runtime code beyond fixtures/schema notes:

- **Config fields** (frontend → bundle): `battleFormat` (`singles|doubles|mixed`, default
  `singles`), `singlesPercent` (0–100, default 60, only meaningful for `mixed`), `leagueRunAndBun`
  (bool, only for `mixed`).
- **Pool taxonomy** and how each maps to trainer IDs:
  - `champion` = `TRAINER_CHAMPION_STEVEN` — always takes the majority type (51%→singles,
    50%→coin-flip, 49%→doubles); not part of the Run & Bun count.
  - `e4` = `TRAINER_SIDNEY|PHOEBE|GLACIA|DRAKE`.
  - `gymBosses` = the 8 leader `_1` trainers.
  - `bossTrainers` = other `isBoss` trainers (rivals, Maxie/Archie, Tabitha/Matt/Shelly, grunt
    gauntlet bosses, Wally) **except** the excluded tag battle.
  - `normalTrainers` = everyone else.
- **Proportion rule:** each pool applies the split closest to the chosen % (proportional), except
  champion (majority). Doubles requires a team of **≥2** mons — 1-mon trainers stay singles.
- **Exclusions:** the Mossdeep Space Center tag battle (`TRAINER_MAXIE_MOSSDEEP`,
  `TRAINER_TABITHA_MOSSDEEP`, ally `PARTNER_STEVEN`) is already a `multi_2_vs_2` and is never
  converted.
- **Where battle type lives in the bundle:** add a `battleType` field to each entry of
  `artifacts.trainers.trainersData` **and** `docs.trainersResultsSimplified` (SSOT), plus a
  run-level `config.battleFormat`/`config.leagueRunAndBun` echo.
- **Run & Bun mechanism:** duplicate committed trainer IDs per E4 member; the E4 room script
  branches at runtime; a game VAR holds the remaining-doubles-choices counter, preset at build time.
  Count formula: `round(singlesPercent/100 × 4)` clamped to 1–3.

Acceptance criteria:
- [x] `docs/adr/ADR-014.md` written and accepted, added to `docs/INDEX.md`.
- [x] The exact bundle field names/shapes are specified and agreed (documented in the ADR).
- [x] The five pools are defined by concrete trainer-ID membership rules.
- [x] The doubles-eligibility rule (team ≥2, exclusions) and the champion majority + Run & Bun count
      formula are written down with worked examples (50%, 60%, 90%, 100%).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-09** — Started on `feature/T-084-battle-format-architecture`. Wrote `docs/adr/ADR-014.md`
  fixing the battle-format contract: config fields, bundle `battleType` stamping, the five pools with
  concrete trainer-ID membership, the proportion + champion-majority rules, doubles eligibility (≥2
  mons) and the Mossdeep tag-battle exclusion, and the Run & Bun duplicate-trainer-ID mechanism with
  the `round(%singles×4)` clamped-1–3 count formula and worked examples. Flagged one special case for
  owner confirmation: **Tate & Liza** is canonically a double-battle gym leader (one trainer id that
  sends out two mons); the ADR's default is that they follow the global format (single in a `singles`
  run) — noted as an open decision. Added ADR-014 to `docs/INDEX.md`.
- **2026-07-09** — Owner resolved the Tate & Liza point: in `singles` they are always a normal single
  battle (canonical doubles nature not preserved); as a nod, in `mixed` they sort **first** in the gym
  pool and take the first doubles slot. Updated ADR-014 rule 8 + the gym-pool bullet accordingly and
  set the ADR to **accepted**. Closing (design/docs task, nothing manually testable; owner accepted
  the contract). Implementation proceeds with T-085…T-091.

## Outcome

Shipped **ADR-014** — the battle-format contract the whole of Group 1 builds on: config fields
(`battleFormat`/`singlesPercent`/`leagueRunAndBun`), a per-trainer `battleType` stamped in both
`trainersData` and `docs.trainersResultsSimplified` (randomizer decides, maker obeys), the five pools
by concrete trainer-ID membership, the proportional + champion-majority rules, the ≥2-mon doubles
eligibility, the Mossdeep tag-battle exclusion, and the Run & Bun duplicate-committed-E4-ID mechanism
with the `clamp(round(%singles×4),1,3)` split and worked examples. Tate & Liza decided per the owner
(singles→single; mixed→first-in-gym-pool doubles priority). No deviations from the task plan; no
follow-ups beyond the already-planned child tasks. ADR indexed in `docs/INDEX.md`.
