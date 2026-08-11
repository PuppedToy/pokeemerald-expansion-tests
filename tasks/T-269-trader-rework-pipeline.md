---
id: T-269
title: Rework the town traders — 15 quality-for-quality trades chosen from the progression pool
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: [B-073, T-270, T-271]
blocked-by: []
---

# T-269 — Rework the town traders — 15 quality-for-quality trades chosen from the progression pool

## Context

T-194 shipped 4 seed-driven town trades: each town has a hardcoded tier, offers a mon of that tier
and asks for one of the four early routes' encounters. The owner is reworking them whole
(2026-08-11):

- **15 traders**, one per healing building along the progression (Rustboro → the Pokémon League).
- A trade is a **lateral swap**: the player hands in a wild mon they could have caught by that
  point and receives a mon whose **final** (max-evo) quality is the **same** — never the current
  stage's quality.
- Each trader's **request pool** is *every wild encounter reachable before its boss*, with the
  fishing rods / Surf entering the pool as the world hands them over. The pool is incremental and
  each trader rolls a species no earlier trader rolled.
- The gift arrives with **N TMs from that boss's bag already learned** and **M IVs at 31**
  (per-trader counts, from the owner's table below).
- The offered mons join the pool that generates **mega stones** and must be **unique** — B-073.

This task owns the **pipeline** half (everything that decides a trade and lands in the bundle
artifact). The ROM/engine half is [T-270](T-270-trader-rework-rom-side.md); the docs/viewer half is
[T-271](T-271-trader-rework-docs-viewer.md).

Owner decisions taken with the plan (2026-08-11):

| Question | Answer |
|---|---|
| Trader count | the **15** enumerated cities (the "10 in total" line was a slip) |
| League trader (A14) | 3 TMs + 4 IVs, in the Pokémon League lobby |
| "the boss's bag" for TMs | the **union of every reachable TM** up to that boss, including all three options of each "choose 1 of 3" pick (the pipeline cannot know which one the player took) |
| IVs that are not 31 | stay at 15, today's value |
| HMs | never handed over as a "TM" |
| Statics / legendaries | not in the request pool (Regis & Rayquaza are one-off encounters with their own unlock home) |

The 15 traders, their milestone (the cap flag whose boss gates them) and their counts:

| # | City | Milestone | TMs | 31-IVs |
|---|---|---|---|---|
| 1 | Rustboro | Roxanne | 1 | 1 |
| 2 | Dewford | Brawly | 1 | 1 |
| 3 | Slateport | Oceanic Museum grunts | 1 | 2 |
| 4 | Mauville | Wally (Mauville) | 1 | 2 |
| 5 | Verdanturf | Wattson | 1 | 2 |
| 6 | Lavaridge | Flannery | 1 | 2 |
| 7 | Fallarbor | Flannery | 1 | 2 |
| 8 | Petalburg | Norman | 2 | 2 |
| 9 | Fortree | Winona | 2 | 2 |
| 10 | Lilycove | Wally (Lilycove) | 2 | 2 |
| 11 | Mossdeep | Tate & Liza | 2 | 3 |
| 12 | Pacifidlog | Archie | 2 | 3 |
| 13 | Sootopolis | Juan | 3 | 3 |
| 14 | Ever Grande | Wally (Victory Road) | 3 | 3 |
| 15 | Pokémon League | the whole game | 3 | 4 |

Method unlocks along the same spine: land + old rod from the start, **good rod** at Lavaridge,
**Surf** at Fortree, **super rod** at Mossdeep. A method unlock is retroactive — it opens that
method on every map already reachable.

## Plan

Four steps, each red-green with its own tests. Nothing here touches the ROM, so the whole task is
verifiable with `cd randomizer && npm test`.

1. **`randomizer/data/progression.js`** — the new single home of "what has the player reached by
   milestone X": an ordered table of cap flags, each declaring the wild maps that open at it and the
   encounter methods it unlocks. Derivations: `mapsAvailableAt(flag)`, `methodsAvailableAt(flag)`,
   `encounterPoolAt(flag, wildMaps, wildArtifact)` (species, via the run's `wildPlan`). Guard tests:
   every `wild.js` map is classified exactly once (statics excluded on purpose), every flag exists in
   `bossCaps`, and the order matches `caps.c`.
2. **`randomizer/data/bagCascade.js`** — move the world's item/TM bag cascade out of `trainers.js`
   into one declarative table keyed by cap flag, with two derivations from that one home:
   `buildBags()` (what `trainers.js` uses today — same entries, same RNG call order, so bundles stay
   byte-identical) and `tmPoolAt(flag, tmList)` (every TM reachable by that milestone, pick options
   expanded, HMs dropped). Guarded by the existing determinism/snapshot suites.
3. **`randomizer/trades.js`** — rewrite the selection around a 15-row `TRADERS` table (city, trade
   id, milestone flag, TM count, IV count):
   - level = that milestone's cap level;
   - **wanted** = a family-unique roll from `encounterPoolAt(flag)`, never a family an earlier
     trader rolled; accepted set = its whole evolution family (unchanged behaviour);
   - **offered** = a family-unique mon whose `rating.bestEvoTier` equals the wanted mon's, handed
     over at the cap-valid stage for that level (`devolveToLevel`); the per-town hardcoded tier and
     the contextual-tier strictness both disappear (final quality only);
   - **uniqueness (B-073)** = offered families are drawn against `wild.alreadyChosenFamilies` and
     against the trades already decided; each pick joins the set;
   - **TMs** = `tmPoolAt(flag) ∩ offered.teachables` minus HMs, N picked at random;
   - **IVs** = M distinct stats at 31, the rest 15;
   - deterministic per ROM seed, isolated local RNG (unchanged design).
4. **Mega stones** — the offered families feed `wild.foundMegaEvos` through the same helper
   `wildModule` uses, so a traded Scyther/Scizor puts a Scizorite in the world exactly as a wild one
   does. One home for the rule (export the collector, do not restate it).

Design reference for all of it: new `randomizer/docs/trades.md`, linked from the table in
`CLAUDE.md`.

Acceptance criteria:
- [ ] `progression.js` classifies every `wild.js` encounter map exactly once and a test fails if a
      new map is added without a milestone.
- [ ] Each trader's request pool equals "every land/old-rod (+good/surf/super once unlocked)
      encounter reachable before its boss" — asserted per trader against the owner's table.
- [ ] The TM bag cascade lives in exactly one place; `tmPoolAt('FLAG_BADGE01_GET')` is Roxanne's
      reachable TMs and trainer bags are unchanged (determinism suites green).
- [ ] `offeredSpecies.rating.bestEvoTier === wantedSpecies.rating.bestEvoTier` for all 15 trades.
- [ ] **B-073**: no offered family repeats a starter / extra starter / gym reward / static / wild
      family, nor another trade's — regression test named for B-073.
- [ ] Every offered mon carries its N TM moves (all learnable by it, none an HM) and M IVs at 31.
- [ ] Offered families that can mega-evolve appear in `wild.foundMegaEvos`.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-11** — Task created. Explored the whole trade circuit before planning: `trades.js` /
  `tradeWriter.js` / `writerDocs.js` (pipeline), `src/trade.c` + `src/data/trade.h` +
  `include/constants/trade.h` (engine), `injector/modules/tradesStartersNicknames.js` +
  `structLayout.js` (ROM builder), `frontend/template.html` (viewer + nuzlocke tracker). Confirmed
  the four "bag" concepts the owner referred to are `trainers.js`'s cascade (`roxanneBag()`,
  `brawlyBag()`, …), which is the only existing description of what the player holds at each
  milestone. Owner answered the four open questions (see the table above).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
