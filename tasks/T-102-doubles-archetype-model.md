---
id: T-102
title: Doubles archetype model — JSON of archetypes (weather, TR, redirection, ability-swap…)
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-10
target-version: 0.8.0
links: [T-083, T-098, T-100]
blocked-by: [T-100]
---

# T-102 — Doubles archetype model — JSON of archetypes (weather, TR, redirection, ability-swap…)

## Context

The doubles counterpart to [T-101](T-101-singles-archetype-model.md), grounded in the VGC research
(T-098). Doubles gimmicks are central (weather, Trick Room, redirection, ability-swap / Skill Swap
plays, terrain), and balanced/offensive/defensive still apply with different structure than singles.

## Plan

- Same schema as T-101, populated for doubles into `randomizer/data/archetypes/doubles.json`.
- Emphasize doubles-specific gimmick archetypes and their conditions/structure (weather core + abuser,
  TR + slow attackers, redirection + spread, etc.).
- Validator + tests; content cited from research/analysis.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

## Doubles plan — mirror of the singles work (added 2026-07-11)

When we reach doubles, replay exactly the pipeline that worked for singles (T-118 detector realism →
T-121 corpus expansion → slot-recipe entries → crystallize-by-fit). Step by step:

1. **Expand the DOU 6v6 corpus** (research workflow, running in parallel now). The corpus has only ~14
   Doubles OU 6v6 teams (the 24 VGC teams are 4v4 → filter per the 6v6 lens); 14 is as thin as singles
   was (12). Grow to ~30-40 verified DOU 6v6 teams (~8 per base archetype) before committing thresholds.
2. **Re-validate the doubles DETECTORS against the DOU corpus** (T-118 for doubles): `intimidateUser` +
   `fakeOutUser`, `spreadAttacker` (move-target metadata), `redirector` (Follow Me/Rage Powder or
   Lightning Rod/Storm Drain), `tailwindSetter`/`trickRoomSetter`/`trickRoomAbuser`, `weatherSetter`
   (ability only), `wideGuardUser`, `perishSongUser`, `trapper`, + the one-offensive-identity precedence.
   The same "can-learn over-fires" trap applies — confirm each fires realistically via the T-117 audit.
3. **Slot-objective analysis per doubles archetype** — go team-by-team, define each slot's objective,
   derive the common slot **RECIPE** (roles + min/max/weight): bulky_offense (Intimidate/Fake Out core
   + spread + speed control + win condition), balance/dual-mode (two speed-control modes), hyper_offense,
   + gimmick engines (weather setter+abuser, TR setter+abusers, redirection+wincon, trapping, screens/
   Tailwind).
4. **Owner-validate the recipes** (analysis-first) — including the open flag below (defensive/stall
   doubles base in 6v6, or offensive/balanced only?).
5. **Rewrite `doubles.json` `structure` as the recipes**; the crystallize-by-fit engine built for
   singles is **format-agnostic** (`getArchetypeModel('doubles')`) → it just consumes the doubles recipes.
6. **Measure** with the T-117 decision log on doubles trainers (each crystallizes a doubles archetype +
   delivers its roles). Then the singles-style seed assignments for doubles trainers.

Acceptance criteria:
- [x] `doubles.json` archetype set (base offensive/balanced + doubles gimmicks) with entry conditions
      and structure for each. *(No pure-defensive base — see the flag below; owner to confirm.)*
- [ ] (v2, when we reach doubles) recipes re-derived from the expanded DOU 6v6 corpus, owner-validated,
      structures rewritten as slot recipes; detectors re-validated; audit shows realistic crystallization.
- [x] A schema + validation test guards the file (shared loader `randomizer/archetypes.js` + test).
- [x] Content grounded in the 6v6 DOU research (`docs/research/team-archetypes.md`, 6v6-adjusted).
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Built `randomizer/data/archetypes/doubles.json` (v1), sharing the T-101 schema +
  loader: 3 base archetypes (Bulky Offense [Intimidate/Fake Out] · Balance/Dual-Mode · Hyper Offense)
  + a stackable gimmick layer (weather · trick_room · redirection · trapping · screens_tailwind), tuned
  for our **6v6** (not 4v4 VGC). Suite 844 pass. **Provisional** per the meta-analysis clause.
  **Owner-validation flag:** the DOU research surfaced no pure *defensive/stall* base archetype for
  doubles (6v6 DOU is offensive/balanced-leaning); doubles currently has base categories
  offensive + balanced only. Confirm whether our game wants a defensive doubles base or that's fine.
  Kept `in-progress`.

## Outcome

<!-- Filled when closing. -->
