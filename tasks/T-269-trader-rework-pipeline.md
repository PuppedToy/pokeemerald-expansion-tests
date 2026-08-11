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
2. **TM reachability** — "one TM out of that boss's bag" derived in `progression.js` from the TM
   table's **Location column** (`randomizer/docs/tms.md`, already the SSOT for where each TM slot
   lives, reaching the pipeline as each move's `tmLocation`) joined with the map table: a gym reward
   resolves to its badge, a pick/item to the milestone that opens its route, and three named places
   resolve explicitly. Pick groups count as all their options (owner's decision) and HMs carry no TM
   slot, so they drop out on their own. See the 2026-08-11 log entry for why this replaced the
   planned `bagCascade.js` refactor.
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
- [x] `progression.js` classifies every `wild.js` encounter map exactly once and a test fails if a
      new map is added without a milestone.
- [x] Each trader's request pool equals "every land/old-rod (+good/surf/super once unlocked)
      encounter reachable before its boss" — asserted per trader against the owner's table.
- [x] The TM pool is derived, not restated: every row of the real TM table resolves to a milestone
      (an unclassified location throws), and the pool at Roxanne is exactly the TMs `roxanneBag()`
      holds. Trainer bags are untouched (determinism suites green).
- [x] `offeredSpecies.rating.bestEvoTier === wantedSpecies.rating.bestEvoTier` for all 15 trades.
- [x] **B-073**: no offered family repeats a starter / extra starter / gym reward / static / wild
      family, nor another trade's — regression test named for B-073.
- [x] Every offered mon carries its N TM moves (all learnable by it, none an HM) and M IVs at 31.
- [x] Offered families that can mega-evolve appear in `wild.foundMegaEvos`.
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-11** — Task created. Explored the whole trade circuit before planning: `trades.js` /
  `tradeWriter.js` / `writerDocs.js` (pipeline), `src/trade.c` + `src/data/trade.h` +
  `include/constants/trade.h` (engine), `injector/modules/tradesStartersNicknames.js` +
  `structLayout.js` (ROM builder), `frontend/template.html` (viewer + nuzlocke tracker). Confirmed
  the four "bag" concepts the owner referred to are `trainers.js`'s cascade (`roxanneBag()`,
  `brawlyBag()`, …), which is the only existing description of what the player holds at each
  milestone. Owner answered the four open questions (see the table above).

- **2026-08-11** — `randomizer/data/progression.js` + 35 tests green: the milestone spine (one entry
  per `caps.c` flag, in its order), the maps each milestone opens, the retroactive method unlocks
  (good rod → Flannery, Surf → Winona, super rod → Tate & Liza) and `encounterPoolAt()`.
  Two findings while placing the maps:
  - **Route 119** first sat on Winona's entry; moved to the Weather Institute's, so
    "everything up to Norman" (the Petalburg trader) excludes it as the owner specified. The rule the
    table follows is now explicit: a map the player only walks into *as a consequence* of a fight
    belongs to the NEXT milestone (that is also why Route 116 is the Rusturf grunt's, not Roxanne's).
  - **Ever Grande City** sits on Wally-VR's entry and **Victory Road B1F** on the Ever Grande rival's,
    so the Ever Grande trader may ask for the city's encounters but only the League trader reaches
    the cave's.
- **2026-08-11** — **Dead end avoided (approach changed, step 2).** The plan was to lift
  `trainers.js`'s bag cascade into a declarative `bagCascade.js` and derive the TM pool from it. Read
  the cascade first: every trainer's bag is `getSampleItemsFromArray(xBag(), n)`, which draws from the
  *assembled array*, so its exact content, order and length feed the RNG for every trainer in the
  game — restructuring it risks re-rolling every bag in every bundle for zero user-visible gain.
  Derived the pool from `docs/tms.md`'s Location column + the map table instead (two SSOTs joined, no
  new copy of anything). Cross-checked: the derived pool at Roxanne is `[1, 5, 6, 7, 8, 9, 10, 71]`
  — exactly the TMs `roxanneBag()` holds — and Brawly's, Steven's and the museum grunts' match their
  bags too. Only divergence found: the Route 118 picks (TM20-22) enter the cascade one milestone
  before Route 118 opens, so the Mauville trader does not offer them. Kept the reachability answer;
  noted in `randomizer/docs/trades.md`.

- **2026-08-11** — Traders rewritten (`trades.js`), wired into `generate.js`, 32 unit tests green
  plus 7 for the mega pool; the whole suite is green (2408). Ran the real pipeline end-to-end
  (scratch dump, seed 20260811) and it caught a defect the fixtures could not: Sootopolis asked for a
  UU Binacle and offered an **RU Slowbro**, because candidates were filtered by the FAMILY's
  `bestEvoTier` and that family peaks through Mega Slowbro. Now the form that changes hands must carry
  the tier itself, must be legally ownable at the level (`checkValidEvo`, most-evolved stage wins), and
  a mega form is never handed over. Re-ran: all 15 trades match tier-for-tier, no family collides with
  the run or with another trade, and a traded Swampert put a Swampertite in the world.
  Also: `TRADE_NICKNAME_CAPACITY` 8 → 16 (15 traders can all be auto-nicknamed; the writer and the
  injector both guard on it), and battle-only forms are filtered out of the offer pool like the wild
  module does. Note for T-270: the ROM builder cannot build until it lands — the artifact now names 15
  `INGAME_TRADE_*` ids the base does not define yet.

- **2026-08-11** — Observation for the owner (no change made): because the pool is cumulative, late
  traders often ask for an early-game RU mon and therefore give an RU mon back (the League trade in the
  dump was Nidorina → Corsola-Galar at level 78). That is exactly what the spec says; if late traders
  should lean toward the species that only just entered the pool, that is a follow-up decision.

- **2026-08-11** — The observation above became a change: the owner pinned the late traders' quality.
  See [T-272](T-272-late-trader-tier-floor.md) — Lilycove onward is UU ↔ UU, the League's is OU ↔ OU.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
