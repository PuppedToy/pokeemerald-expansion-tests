---
id: B-067
title: Stone evolutions are legal at any level above 28, ignoring their randomized IF_MIN_LEVEL
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-11
updated: 2026-08-11
found-in: 0.5.0         # version where the bug was observed
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/stoneEvoMinLevel.test.js # + stoneUnlockFloor.test.js (the availability floor)
links: [T-264, B-068]
---

# B-067 — Stone evolutions are legal at any level above 28, ignoring their randomized IF_MIN_LEVEL

## Symptom

Wally at Route 110 (`TRAINER_WALLY_MAUVILLE`, level 29) fields a **Basculegion M**, but in that same
run Basculin White-Striped only reaches Basculegion M at level **49** (Dawn Stone,
`CONDITIONS({IF_MIN_LEVEL, 49})`). The mon is 20 levels ahead of the point at which the player could
own it.

Reproduced from bundle `bundle-2231547897.json` (session `1e993091-831e-429f-8ccb-048554e011fa`,
app 0.5.0, generated 2026-08-09). Wally's other five slots devolve correctly for the same trainer —
Ninetales→Vulpix, Copperajah→Cufant, Lilligant→Petilil, Vileplume→Gloom, Gardevoir (legal at 24) —
so the defect is specific to the **stone** branch.

Auditing every trainer in that bundle against its own evolution table gives **3** mons fielded below
their evolution level, and **all 3 are `EVO_ITEM`**; zero `EVO_LEVEL` violations:

| Trainer | Level | Mon | Needs | Gap |
|---|---|---|---|---|
| `TRAINER_WALLY_MAUVILLE` (Route 110) | 29 | Basculegion M | 49 | +20 |
| `TRAINER_NORMAN_1` (Petalburg Gym) | 39 | Kleavor | 55 | +16 |
| `TRAINER_JESSICA_1` (Route 121) | 49 | Kleavor | 55 | +6 |

Expected: a trainer only fields a stone evolution once its `IF_MIN_LEVEL` is met, exactly as happens
for level evolutions.

## Root cause

`isValidEvolution` in `randomizer/modules/utils.js:83` never reads `evo.minLevel`:

```js
function isValidEvolution(level, { param, method }) {
    return (!isNaN(parseInt(param)) && parseInt(param) <= level && parseInt(param) > 4)
        || ((method === 'ITEM' || param === '0') && level > 28);
}
```

For a stone evolution `param` is the item constant (`ITEM_DAWN_STONE`), so `parseInt` is `NaN` and
the first clause is dead. The second clause then grants **every** stone evolution a blanket pass at
any level above a hardcoded 28 — Wally's 29 clears it by one level.

The function is inherited verbatim from puppedjs (`3e1652e554`) and has never been touched. The
`IF_MIN_LEVEL` gate on stone evolutions came later, with the evo-level randomizer
(`randomizer/evoLevelWriter.js`, which writes a per-run level into `evo.minLevel` for every
`EVO_ITEM`). The new data field and the old consumer never met: the parser reads `minLevel`
(`randomizer/parser.js:300`), the writer randomizes it, the docs display it — only the legality check
ignores it.

Both consumers of `isValidEvolution` inherit the leak:

- `checkValidEvo` (`utils.js:109`) — the candidate filter used by every `checkValidEvo: true` slot.
  This is the Norman/Jessica Kleavor path.
- `devolveToLevel` (`utils.js:94`) — the T-106 continuity echo that projects an authoritative roster
  onto an earlier appearance. It stops devolving as soon as the step into the current form looks
  legal, so Basculegion M survives the walk down to level 29. This is the Wally path.

Related, same assumption, not yet audited: `randomizer/modules/wildModule.js:552` treats
`evo.method === 'ITEM'` as "reachable early" with no level check at all, and lines 568/594 call
`checkValidEvo` with hardcoded levels 29/41.

Verified as *not* contributing: every one of the 50 `EVO_ITEM` entries in
`src/data/pokemon/species_info/gen_*.h` already carries a `CONDITIONS({IF_MIN_LEVEL, N})` clause, so
`applyEvoLevels` and `patchStoneMinLevelInContent` agree — the docs and the ROM carry the same
number. This fork only emits `EVO_LEVEL` (487), `EVO_ITEM` (50) and `EVO_LEVEL_BATTLE_ONLY` (2), and
exactly one `EVO_LEVEL, 0` conditional evolution (Happiny → Chansey), so the `param === '0'` branch
of the OR covers a single species.

## Fix

`isValidEvolution` now reads the evolution's level instead of switching on its method, via a new
`evolutionMinLevel` helper (`randomizer/modules/utils.js`) that applies the precedence rule already
blessed by B-062 — `param`, then `minLevel`, then `DEFAULT_EVOLUTION_LEVEL`. Only the `EVO_ITEM` arm
changed; the `EVO_LEVEL` and `param === '0'` arms keep their exact previous semantics.

Three SSOT repairs came with it, because the same rule lived in three places:

- The verbatim duplicate of `isValidEvolution` in `randomizer/modules/trainerSelector.js` (which fed
  the forward `tryEvolve` path) is gone; it imports the one in `utils.js`.
- `wildModule.megaBaseFormLevel` now calls `evolutionMinLevel` instead of re-deriving the same
  precedence inline, and `DEFAULT_EVOLUTION_LEVEL` moved to `randomizer/constants.js`.
- The gym-2 reward filter in `wildModule.js` no longer admits any `method === 'ITEM'` evolution
  unconditionally — the same defect one level up — and reads the evolution's level instead.

Regression test: `randomizer/__tests__/unit/stoneEvoMinLevel.test.js`, built from this bundle's real
numbers (Basculin White-Striped / Dawn Stone / 49 / level 29 and Scyther / Leaf Stone / 55). Verified
RED before the fix (12 of 14 failing) and GREEN after; the full suite is green (2298 tests).

**Second half — the availability floor.** The old `> 28` was also, badly, standing in for "you cannot
have a stone yet", and dropping it left the rolled gate as the only constraint — with `evoLevels.min` at
5, a run could gate a stone evolution at level 9. In this game all ten stones arrive at once from the
Rustboro rival (`RustboroCity_EventScript_GiveEvolutionStones`, which sets
`FLAG_DEFEATED_RIVAL_RUSTBORO`), so the real requirement is `max(that cap's level, rolled gate)`.

Applied where the gate is **decided** — `applyEvoLevels` in `randomizer/evoLevelWriter.js` — not where it
is checked. That way the ROM's `IF_MIN_LEVEL` clause, the viewer docs and the trainer check all read one
number, and no ambient run state has to be threaded into `isValidEvolution`. It runs after the T-066
stage-gap safeguard so that pass cannot push a gate back under the floor, and it consumes no RNG (the roll
already happened; only its result is clamped), so the rest of the run's stream is untouched. Level
evolutions are deliberately not floored — they need no item.

The level itself stays in `src/caps.c` and arrives via `capLevels`; only the *relation* ("this boss also
hands over the stones") lives in `randomizer/bossCaps.js` as `EVOLUTION_STONES_UNLOCK_FLAG` +
`stoneUnlockLevel()`, next to the `BOSS_CAP_TRAINERS` and `STATIC_UNLOCKS` maps that already record the
same kind of script relation. Wired in at `generate.js` (`makePokedex`, the bundle path) and at
`writer.js` (the analyze/randomize path, which recomputes).

End-to-end proof on the reported run: replaying seed `2231547897` with its stored config at
`2193b400ab` (the build that produced the bundle) reproduces the original world exactly — same Wally
team, same level-49 Dawn Stone gate, same 3 violations. With the fix, the same seed gives Wally
`SPECIES_BASCULIN_WHITE_STRIPED` in that slot, the other five slots byte-identical, and 0 mons fielded
below their evolution level. Across four seeds (one process each): 2→0, 5→0, 2→2, 1→1 — the two residuals
were [B-068](B-068-evolution-check-skipped-on-some-team-paths.md), a different defect, since fixed. With
B-068 and the availability floor in, a seven-seed sweep gives 0 mons below their evolution level and 0
stone gates below the unlock level.

Regression tests: `randomizer/__tests__/unit/stoneEvoMinLevel.test.js` (the check) and
`randomizer/__tests__/unit/stoneUnlockFloor.test.js` (the floor), both RED before and GREEN after.
