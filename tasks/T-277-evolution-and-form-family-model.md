---
id: T-277
title: Audit and fix how evolution lines, forms and mutation inheritance are keyed
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-13
updated: 2026-08-14
target-version: 0.9.0
links: [T-060, T-063, T-157, B-040, B-068, B-069, tasks/assets/T-277/evolution-and-form-wiring-audit.md]
blocked-by: []
---

# T-277 — Audit and fix how evolution lines, forms and mutation inheritance are keyed

## Context

Owner report, three symptoms:

1. Burmy-Trash does not look like the other branching evolutions (stone + level → Mothim); all three
   cloaks should converge on the same Mothim.
2. Cursola does not inherit Corsola-Galar's mutations even though it is its evolution, and regional
   forms behave inconsistently in general — Koffing must pass its mutations to *both* Weezing and
   Weezing-Galar, while plain Corsola and Corsola-Galar are two lines that must not share anything.
   Suspicion: how we classify a "family" has been wrong since the beginning for regional forms.
3. Sibling evolutions (Eevee) inherit each other's stat changes. They should inherit from Eevee only.

Audit deliverable (the report the owner asked for before any fix):
**`tasks/assets/T-277/evolution-and-form-wiring-audit.md`** — full inventory of every branching /
converging evolution, alternate form and regional form with how each evolves and how each inherits
mutations, the exact algorithms around families and forms, and 12 findings. Do not restate its
content here; it is this task's source of truth for the analysis.

Root cause in one line: one string per species (`poke.family`, `randomizer/parser.js:464-481`) answers
five different questions — mutation inheritance, stage classification, best evolution, base form and
obtainable-dedup group — and it is derived from the upstream `#if P_FAMILY_…` block, not from the
evolution graph. Prior decisions that bound this area: T-063 decision #1 (regional forms are distinct
obtainables), T-060 (one candy branch + stones), T-157 (Burmy/Ogerpon on the Deerling model),
B-068 (trainer legality already walks the real graph instead of the label).

## Plan

T-277 is the **umbrella** for this epic: it owns the audit, the model decision (ADR-026) and the
per-case decision sheets. The fixes ship as the child tasks below, one at a time.

### Ordering rationale

The graph-derived layer goes **first**, before any per-case family decision. Once inheritance, stage
type, `bestEvo`, base form and mega attachment all read the `evolutions[]` edge graph, the `family`
string stops being load-bearing for behaviour — so relabelling families (T-284) and choosing dedup
groups (T-285) become a labelling + policy exercise instead of a behaviour-critical one, and the
owner's per-case calls only have to be made once. Doing it the other way round means deciding every
case twice: once to make the string carry behaviour, then again when behaviour moves to the graph.

Verified enabling facts: the evolution graph yields **693 components (366 with edges)** and already
produces exactly the identity the owner wants for the reported cases — `{Koffing, Weezing,
Weezing-Galar}` as one family, `{Corsola}` apart from `{Corsola-Galar, Cursola}`, and Meowth as three
disjoint components. Parse (dex) order is **topological for every evolution edge**, so per-edge
inheritance keeps the existing single-pass loop — no reordering, minimal RNG-stream churn.

### Child tasks

| # | Task | Owner items | Needs owner input | Depends on |
|---|---|---|---|---|
| 0 | T-289 — remove Rockruff-Own-Tempo and Gimmighoul-Roaming from the pool | (new) | decided | — |
| 1 | T-278 — evolution-graph module + inherit only from the direct pre-evolution | 10 | D0 ✔ | T-289 |
| 2 | T-279 — stage classification from the graph (kill the false SOLO/LC) | 6, 2 | no | T-278 |
| 3 | T-280 — `bestEvo` / `devolveToBase` by reachability, not family | 4 | no | T-278 |
| 4 | T-281 — megas attach to their base species, not the family | 5 | no | T-278 |
| 5 | T-282 — converging evolution levels keyed by (holder, target) | 7 | no | — |
| 6 | T-283 — macro-defined species: their mutations must reach the ROM | 8 | no | — |
| 7 | T-284 — one family = one evolution component + curated form sets | 1, 2 | **Pass A** | T-278…T-281 |
| 8 | T-285 — dedup groups chosen case by case | 11 | **Pass B** | T-284 |
| 9 | T-286 — Meltan → Melmetal, one real line and one family | 9 | Pass A row | T-284 |
| 10 | T-287 — Mothim: the three Burmy cloaks converge on one real Mothim | 3 | Pass A row | T-284 |
| 11 | T-290 — premium transformation items (Rusted Sword/Shield, Red/Blue Orb, + O8) | (new) | O8, O9 | T-281, T-283 |
| 12 | T-291 — remove the cosmetic duplicate species from the game | (new) | decided | — |
| 13 | T-292 — rate Tera Shift 0 and fix the Terapagos placeable form | (new) | decided | — |
| 14 | T-293 — ban the battle-only states that are currently placeable | (new) | decided | — |
| 15 | T-288 — model docs + fresh golden-master baseline | — | no | all |

T-282 and T-283 are independent of the graph work and can run in parallel. T-283, T-286 and T-287
touch `gen_*_families.h`, so they share one base-ROM rebuild lane. T-287 is deliberately last: making
the three cloaks converge on one Mothim **merges** the three Burmy cloak components into one, which
collides with T-157's "each cloak randomizes independently" model — so it must land after Pass A has
ruled on that cluster.

Every child task registers its bug(s) first (regression test red before the fix, per the iron rule)
and closes them with the task.

### Decisions

Closed. The owner's ruleset lives in **`tasks/assets/T-277/decisions.md`** (SSOT);
`tasks/assets/T-277/decision-sheet.md` keeps the audit tables the rulings were made from.

The decision pass ended up far smaller than the sheet was built for, because G1 ("one obtainable per
superfamily, invariant") replaced the whole per-case dedup pass, and G7 reduced all 58 regional
species to two shapes. Only O8 and O9 remain open, and both only gate T-290.

Acceptance criteria (umbrella):
- [x] Report covers every branching evolution, converging evolution, alternate form and regional form
      (incl. Meltan/Melmetal), each with how it evolves and how it inherits mutations.
- [x] Report states the exact algorithms around families and regional forms, with file:line homes.
- [x] Child tasks ordered, with dependencies and owner-input points.
- [x] D0 answered (a converging target unions all its pre-evolutions).
- [x] Identity decisions complete, recorded in `tasks/assets/T-277/decisions.md`.
- [x] Dedup decided — G1, one rule instead of a per-case map.
- [ ] O8 and O9 answered (both gate T-290 only).
- [ ] ADR-026 accepted: identity, stage classification and dedup are three separate concerns; the
      first two derive from the edge graph, the third is a curated policy map.
- [ ] All 15 child tasks closed.
- [ ] Fresh golden-master baseline captured (`/verify-corpus`) — every fix here shifts the RNG stream,
      so existing seeds stop reproducing their worlds.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-13** — Task created. Audit done against the clean working tree through the pipeline's own
  parser (1230 species, 584 families). Counts: 40 branching holders, 5 converging targets,
  20 cross-family evolution edges, 34 families whose sibling branches share a mutation log,
  58 regional-form species in 4 wiring patterns, 14 species that inherit nothing from their real
  pre-evolution, 12 that inherit a foreign line.
  Verified empirically beyond the owner's three symptoms:
  · `bestEvo` is "best mon in my family", not "best mon I can become" — Flareon→Espeon,
    Silcoon→Dustox, Poliwrath→Politoed, Basculin-Red-Striped→Basculegion-M (a mon it cannot reach).
  · `megaEvoTree` is family-keyed, so Slowking carries Slowbro-Mega and Gardevoir/Gallade each carry
    both megas; `invalidMegas` is a hand-patch for the same bug covering only Froslass and Kleavor.
  · `devolveToBase(Perrserker) = Meowth` (and 7 more wrong bases).
  · Cursola, Weezing-Galar, Sirfetch'd and Overqwil are classified `EVO_TYPE_SOLO`; Sliggoo-Hisui and
    Mr-Mime-Galar are classified as FIRST stages — all six are placeable in slots they should not fit.
  · Goodra-Hisui is absent from Goomy's `bestEvo` candidates.
  · Tauros-Paldea Combat/Blaze/Aqua sit in `P_FAMILY_TAUROS` (the `_PALDEA` suffix test misses
    `_PALDEA_COMBAT`), so they share plain Tauros's log and each other's — the Meowth symptom on a
    pure form set. Same for `DARMANITAN_GALAR_STANDARD` / `_GALAR_ZEN` in `P_FAMILY_DARUMAKA`.
  · Evo-level maps are keyed by target species only, so a converging evolution's ROM gate ≠ the docs'
    gate (last holder wins). Reproduced on the last run: Burmy-Plant's Mothim gate is 18 in the docs,
    20 in the ROM.
  · **Burmy symptom is one layer down than reported.** The docs DO show both branches for all three
    cloaks (checked `pokes.json`, `frontend/data/base-data.json`, `output/pokes.js`). But the source
    still points Burmy-Sandy/Trash at `SPECIES_MOTHIM_SANDY`/`_TRASH` (ids 1436/1437, dropped by
    B-040): their `IF_MIN_LEVEL` is never re-rolled (stays 25) and those ids keep vanilla Mothim data,
    so evolving a Sandy/Trash Burmy in-game yields an un-randomized Mothim. Asked the owner for the
    seed in case a run really did hide the branch.
  · **New, wider than the reported scope:** a species defined via a `#define …_SPECIES_INFO` macro has
    no `.field` lines of its own, so `pokemonWriter.editSpeciesFile` writes **none** of its mutations
    — proved by giving Mothim +30 HP and diffing `gen_4_families.h` (zero changes). Affects Mothim,
    all four Ogerpon masks, Minior, Arceus, Silvally, Genesect, Unown, Furfrou, Scatterbug/Spewpa/
    Vivillon, Flabébé/Floette/Florges and Alcremie. Also proved the inverse leak: a Wormadam-Trash
    with two `type` log entries writes its types into `MOTHIM_SPECIES_INFO` (line 2222), which
    `injector/modules/species.js` then fans out to all three Mothim forms.
  · Meltan→Melmetal has never been wired in this fork (no evolution entry anywhere in `src/`);
    both are `EVO_TYPE_SOLO` sharing one log.
  Awaiting the owner's review of the report and the five Part-4 decisions before touching code.
- **2026-08-13** — Owner reviewed the report and set the epic's 11 goals. Epic ordered into 11 child
  tasks (T-278…T-288); rationale and dependency table added to the Plan above. Two measurements taken
  to fix the order:
  · The evolution graph gives **693 components (366 with edges)** and already produces the identity the
    owner asked for — `{Koffing, Weezing, Weezing-Galar}` one family, `{Corsola}` apart from
    `{Corsola-Galar, Cursola}`, Meowth as three disjoint components. So the identity rule is
    "one component = one family", with a curated layer for the cases the graph cannot decide.
  · Parse (dex) order is **topological for every evolution edge** (0 exceptions), so per-edge
    inheritance keeps the existing single dex-order pass — no topological sort, no reordering, and the
    only RNG-stream churn is the changed set of replayed entries.
  Two conflicts the graph surfaced, both routed to Decision Pass A:
  · Convergence merges lines that are deliberately separate today — the three Burmy cloaks become ONE
    7-species component (they already all reach Mothim-Plant), Rockruff + Rockruff-Own-Tempo become one
    (via Lycanroc), Gimmighoul-Chest + Roaming become one (via Gholdengo), Goomy + Goomy-Hisui become
    one. T-157 and T-063 #3 deliberately kept those apart.
  · A converging target has several direct pre-evolutions, so "inherit from your direct pre-evolution"
    is ambiguous for Mothim (3 parents), the 3 Lycanroc (2 each) and Gholdengo (2). Raised as D0,
    blocking T-278.
  Nothing implemented yet; awaiting D0 and the Pass A/B sheets.
- **2026-08-13** — Owner decisions:
  · **D0 — a converging target inherits from ALL its pre-evolutions, stacked (union).** Applies to
    Mothim (3 parents) and Gholdengo (2), and to any convergence added later.
  · **Rockruff-Own-Tempo is removed from the pool** (owner believed it already was; it is not — it is a
    live, placeable `EVO_TYPE_LC_OF_2` in `P_FAMILY_ROCKRUFF_OWN_TEMPO`, tier ZU, its own dedup group,
    so a run can hand out a normal Rockruff *and* an Own-Tempo one). Nothing is lost by removing it:
    the normal Rockruff already branches into all three Lycanroc (candy→Midday, moon stone→Midnight,
    dusk stone→Dusk), which is also the one-candy-branch convention T-060 set. Removing it also erases
    the Lycanroc convergence, so Lycanroc becomes pure branching. New child task T-289, scheduled
    first so the graph is stable before T-278's fixtures are written.
  · Decision format: **one fillable sheet in the repo, one pass, two columns** (identity + dedup
    decided independently, same row).
  Sheet generated at `tasks/assets/T-277/decision-sheet.md`. Final measured workload after
  categorising the 98 over-splits: **47 are just base+mega and 21 are in-battle transformation pairs**,
  so 5 blanket rules cover 78 clusters. What is left: 15 convergence rows (12 confirmations + 3 real
  calls — Burmy cloaks vs T-157, Goomy/Goomy-Hisui, Gimmighoul Chest/Roaming), 11 individual form
  calls, and 56 dedup-only rows.
- **2026-08-13** — Owner answered the three hard calls (recorded in the sheet's "Already decided" table):
  · **M13 — Burmy: 3 identities, 1 dedup group.** The owner's requirement is at most one
    Burmy/Wormadam/Mothim per run across wilds and rewards, *and* the Mothim convergence; the means are
    left to us. So T-157 survives (three cloak families randomizing independently), dedup keeps
    collapsing all three (today's `COSMETIC_FORM_SUFFIXES` already does it — do not regress it), and
    Mothim inherits from all three cloaks via D0's union.
    **Architectural consequence for T-284:** an identity group is a connected component **minus a
    curated "keep separate despite convergence" list**. Burmy is that list's only member.
  · **M14 — Goomy is one family**, branching into Sliggoo (candy) and Sliggoo-Hisui (ice stone),
    "exactly the same case as Koffing". Dedup inferred as ONE from that phrasing; flagged in the sheet
    for correction.
  · **M15 — Chest and Roaming are genuinely different Pokémon, NOT the Lycanroc case.** Owner leans to
    removing Gimmighoul-Roaming from the pool instead ("a nadie le va a importar"). Taken as decided and
    folded into T-289; Gholdengo keeps one parent (Chest, `EVO_LEVEL 40`) so nothing becomes
    unobtainable and the convergence disappears. Easy to veto before T-289 starts.
  T-289 now removes two species. Both removals shrink the convergence set to exactly one member
  (Mothim), which is the only place D0's union rule will ever fire.
- **2026-08-13** — Owner ruled on essentially the whole sheet. Decisions recorded in
  `tasks/assets/T-277/decisions.md` (new SSOT); `decision-sheet.md` demoted to the audit reference the
  rulings were made from. Headlines:
  · **G1 — dedup is per superfamily**: one obtainable per `#if P_FAMILY_x` block per run, invariant,
    however many independent families the block splits into. This deletes the entire per-case dedup
    pass (old Batch 4, 56 rows) and replaces it with one rule.
  · **G7 — regional forms have exactly two shapes**: "MEOWTH treatment" (own base → independent
    families) and "KOFFING treatment" (branch off a shared non-regional base → one family, branching
    evolution). All 58 regional species map onto one of the two.
  · **Burmy gets subfamilies** — the only bespoke case: three cloak inheritance units, one dedup group,
    Mothim unions all three, each Wormadam inherits from its own cloak only.
  · **Cosmetic sets lose their duplicates from the game**, not just from the pool: Basculin Red/Blue,
    3 of 4 Deerling, 3 of 4 Pumpkaboo, Shellos-East (pending O2), Sinistea-Antique, one Poltchageist
    line, 3 of 4 Squawkabilly, 2 of 3 Tatsugiri, Zarude-Dada, one Xerneas.
  · **New mechanic — premium transformation items.** Rusted Sword/Shield + Red/Blue Orb become a
    premium tier alongside mega stones: last batch only (post-May), placed only if the base mon is
    obtainable, usable only by E4/Champion, carried *in addition* to a regular mega stone, and withheld
    entirely if the transformed form rates AG. The transformed form is rated as a standard Pokémon, not
    as a mega. Mega stones take priority when trainer slots < items. Dialga/Palkia/Giratina recommended
    for the same tier.
  · **Forms changed by an out-of-battle item are not modelled at all** — the player just gets a concrete
    form (Deoxys, Rotom, Shaymin, the Therians, Hoopa, Oricorio, Zygarde, and the Kyurem/Necrozma/
    Calyrex fusions); trainers may field any form.
  · **Terapagos**: Terastal does not exist in this base, so Tera Shift rates 0.
  Answered the owner's two questions from the engine, not from a wiki:
  · **Xerneas** is `BEGIN_BATTLE → ACTIVE` / `END_BATTLE → NEUTRAL`, unconditional, and the two entries
    are byte-identical in the data (BST 680, pure Fairy, Fairy Aura). Purely cosmetic → collapse to one.
  · **Ogerpon** is `FORM_CHANGE_ITEM_HOLD`, so the mask is permanent while held and **occupies the
    held-item slot**; the three masks change secondary type AND ability at the same BST 550.
  Spawns four new child tasks: T-290 premium items, T-291 cosmetic-duplicate removal, T-292 Tera Shift
  rating, T-293 ban the battle-only states that are currently placeable (Necrozma-Ultra,
  Eternatus-Eternamax, Terapagos-Terastal, Xerneas-Active).
  Seven open items (O1–O7) blocking parts of the above; O1 (Bergmite/Avalugg-Hisui) looks like a slip
  in the owner's mapping and O3 (which Drizzle/Drought rule they meant) blocks T-290's rating change.
- **2026-08-14** — All seven open items resolved by the owner; three of them changed on verification:
  · **O3 — the premise was wrong and no weather code changes.** The ruling (primals have Primordial Sea
    / Desolate Land, which override weather and do not combine with the team, while the mon's own
    sun/rain benefit still counts) is *already* what the rater does: `rating.js:1282-1284` feeds
    `DESOLATE_LAND`/`PRIMORDIAL_SEA` into `inSun`/`inRain` (the comment there literally says "primals
    are own-only"), and every Drizzle/Drought combo bonus — including the +0.3 teambuilding one — is
    gated on `hasAbility('DRIZZLE'|'DROUGHT')` at `rating.js:3140,3165`, which the primal abilities do
    not match. What T-290 actually has to change is the **mega classification**: `parser.js:898` types
    any `_PRIMAL` id as `EVO_TYPE_MEGA`, which drags in the mega-only LEGEND cap
    (`modules/pokedexModule.js:370-378`) and stops Primal Kyogre/Groudon rating honestly — which rule 6
    (withhold the item if the form is AG) depends on. Zacian/Zamazenta-Crowned already rate as standard
    mons. T-290 audits `isMega` uses, not the weather code.
  · **O5 — Genesect is cheaper than expected.** All five entries are `GENESECT_SPECIES_INFO(form)` where
    the parameter is only the sprite name: stats, types and abilities are identical across base and all
    four Drives (BST 600, Bug/Steel, Download). A Drive changes nothing but Techno Blast's type, so no
    species need re-enabling — one random Drive as a premium item is the whole feature. Blocked on
    T-283: Genesect is macro-defined, so F10 means its own mutations never reach the ROM today.
  · **O7 — Necrozma-Ultra stays.** The owner's condition was "ban it if it needs a Z-move". It does not:
    Ultra Burst is a first-class gimmick in this base (`P_ULTRA_BURST_FORMS TRUE`,
    `include/config/species_enabled.h:28`; `GIMMICK_ULTRA_BURST` in `src/data/gimmicks.h`;
    `ITEM_ULTRANECROZIUM_Z` is a real item). Under the fusion rule it needs no item modelling — the
    player receives a concrete Necrozma form, one per run via G1.
  · O1 → Bergmite confirmed as KOFFING treatment. O2 → Shellos-East removed (owner indifferent; took the
    consistent option). O4 → Ogerpon confirmed: Teal is the only wild-findable form, one mask placed
    like an end-game mega stone; the mask permanently occupies the held-item slot. O6 → no action.
  Two items left open: **O8** (Dialga/Palkia/Giratina into the premium tier — recommended, never
  explicitly confirmed) and **O9** (whether the premium tier has a cap; it now holds up to 11 items
  competing for the last mega batch, with mega stones taking priority).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
