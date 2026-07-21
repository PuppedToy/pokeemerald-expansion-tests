---
id: T-185
title: Greninja Battle Bond as a Palafin-style placeable SOLO with Ash-rating blend
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 1.1.0
links: []
blocked-by: []
---

# T-185 — Greninja Battle Bond as a Palafin-style placeable SOLO with Ash-rating blend

## Context

Greninja has three parsed species: normal `SPECIES_GRENINJA` (Torrent/Protean, part of the
Froakie line), `SPECIES_GRENINJA_BATTLE_BOND` (the Battle Bond ability) and
`SPECIES_GRENINJA_ASH` (the KO-triggered transformed form). Today all three share
`P_FAMILY_FROAKIE`; Battle Bond and Ash are mis-classified as `EVO_TYPE_LAST_OF_3` inheriting the
Froakie→Frogadier→Greninja tree, so Battle Bond is never cleanly placed (its canonical family
"final" is normal Greninja) and could devolve to Froakie, and its rating ignores Ash entirely.
Ash is already in `BANNED_SPECIES_FOR_PICKING` (the only correct part so far).

Owner spec: make Battle Bond work like Palafin — a placeable base form plus a non-obtainable
enhanced form used only for rating.

- Battle Bond is a **SOLO** placeable mon (wilds/trainers). It must NOT appear in wilds/encounters
  if a Froakie-family member is already present, and vice-versa (mutual exclusion).
- Ash is never placed directly (already banned); it exists only as a rating/stat source.
- Battle Bond rating = **0.70 × Ash + 0.30 × Battle Bond** (owner-chosen weights), blended on the
  absolute rating/tier AND the per-level contextual ratings (Minior-style — owner confirmed).
- When a trainer fields Battle Bond, its moveset/item/nature are built from **Ash's stats/typing**
  (Palafin-style effective poke — owner confirmed).
- Battle Bond has nothing else to do with normal Greninja beyond the family exclusion.

Related precedents: Palafin (`rating.js` `palafinEffectivePoke`, `resolveTrainerTeam` swap),
Minior (`minior.js` blend), family dedup (`utils.js` `getFamilyGroup` / `groupedFamilies`).

## Plan

Hybrid of the Minior (rating blend) and Palafin (effective-poke team-building) patterns.

1. `constants.js` — `GRENINJA_BOND_ID`, `GRENINJA_ASH_ID`, `GRENINJA_ASH_WEIGHT=0.70`,
   `GRENINJA_BOND_WEIGHT=0.30`.
2. `parser.js` `CUSTOM_FAMILIES` — move Battle Bond + Ash to `P_FAMILY_GRENINJA_BATTLE_BOND`. Since
   neither has `.evolutions`, `getEvolutionType` yields `EVO_TYPE_SOLO` and their `evoTree` is empty
   (bestEvo = self). The normal Froakie line is left untouched.
3. `utils.js` `groupedFamilies` — map `P_FAMILY_GRENINJA_BATTLE_BOND → P_FAMILY_FROAKIE` so the
   existing "one obtainable per family per run" dedup enforces the mutual exclusion for free.
4. `greninja.js` (new, mirrors `minior.js`) — `applyGreninjaTierBlend` (absolute + tier) and
   `applyGreninjaContextualBlend` (per-cap singles + doubles), 0.70 Ash / 0.30 Bond.
5. `rating.js` — `greninjaEffectivePoke(bondPoke, ashPoke)` (Bond identity + Ash stats/typing,
   mirrors `palafinEffectivePoke`), exported.
6. `pokedexModule.js` — wire the two blends alongside the Minior calls.
7. `resolveTrainerTeam.js` / `writer.js` / `writerDocs.js` — capture `greninjaAsh` before the ban
   filter and swap it in for moveset/item/nature (mirror the Palafin plumbing).

Acceptance criteria:
- [x] Battle Bond classifies as `EVO_TYPE_SOLO`; its `evoTree` does not include the Froakie line.
- [x] `getFamilyGroup('P_FAMILY_GRENINJA_BATTLE_BOND') === 'P_FAMILY_FROAKIE'` (mutual exclusion).
- [x] Ash stays in `BANNED_SPECIES_FOR_PICKING`; Battle Bond is NOT banned.
- [x] Battle Bond's blended absolute rating equals 0.70·Ash + 0.30·Bond and tier is recomputed.
- [x] Battle Bond's per-cap contextual ratings (singles + doubles) are blended the same way.
- [x] `greninjaEffectivePoke` keeps Bond's id/learnset/abilities and adopts Ash's stats/typing.
- [x] `cd randomizer && npm test` green; `node analyze.js` produces a sane run (Battle Bond SOLO,
      blended tier, no Froakie-line + Battle-Bond double placement).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Research (two Explore agents) confirmed: 5 Greninja species all
  share `P_FAMILY_FROAKIE`; Battle Bond/Ash mis-typed as `LAST_OF_3`; Ash already banned; rating
  blend has precedent in `minior.js`; team-building swap has precedent in Palafin. Owner chose
  Minior-style (absolute+contextual) blend and Palafin-style (Ash-stats) team-building.
- **2026-07-21** — Implemented (TDD, RED→GREEN). New `greninja.js` (blend), `greninjaEffectivePoke`
  in `rating.js`, `CUSTOM_FAMILIES` (parser) + `groupedFamilies` (utils), constants, two blend calls
  in `pokedexModule.js`, and the `greninjaAsh` team-building swap threaded through
  `resolveTrainerTeam.js` / `writer.js` / `writerDocs.js`. Added `greninja.test.js` (17 cases) and
  `GRENINJA_BOND`/`GRENINJA_ASH` fixtures. Full suite green (1493 passed). `node analyze.js --seed=42`
  verified end-to-end: Battle Bond = `EVO_TYPE_SOLO` in its own family, `bestEvo` = self, rating
  9.0/OU (blended up from a raw ~7.9 toward Ash's 9.47); Ash never placed in wilds/trainers; a
  trainer fielded Battle Bond with an Ash-stat set (Choice Scarf, mixed Surf/Overheat/Night Slash/Ice
  Beam); normal Froakie line untouched. Rebuilt the browser bundle (`node build.js`) so localhost
  reflects it. Generated caches reverted (never committed). Pending owner manual test.

## Outcome

<!-- Filled when closing. -->
