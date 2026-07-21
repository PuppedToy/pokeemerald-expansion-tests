---
id: T-184
title: Tie the 1-HP rule to Wonder Guard, make the rater Wonder-Guard-aware, and unban the ability
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 1.1.0
links: [T-183]          # T-183 moved Shedinja onto a normal stone evo; this reworks the rest of its identity
blocked-by: []
---

# T-184 — Wonder Guard: retie 1-HP to the ability, WG-aware rating, unban

## Context

Today the "always 1 HP" rule is hard-wired to the **species** (`if (species == SPECIES_SHEDINJA) maxHP = 1`)
and Wonder Guard is **banned** from the ability mutator, so no other mon can have it and the rater gives it
no special treatment (Shedinja is rated as a 1-HP glass mon → bottom tier, which is meaningless — see the
tier discussion that spawned this task). The owner wants Wonder Guard to become a first-class, mutatable
ability with a rating model that reflects how game-changing it is.

Analysis of the three affected subsystems is captured in the Progress Log below (engine 1-HP sites, the
rater's BST→ability→tier pipeline, and the ability/stat mutator). **No code has been written yet** — per
the project's analysis-first rule, the rating design (Phase B) is validated with the owner before coding.

## Plan

Four phases, gated in order (unban is last — it is unsafe until the rater understands WG).

### Phase A — Engine: retie 1-HP to the ability + Shedinja base stats + description
- Replace the species check with an ability check at every HP-forcing site:
  - `src/pokemon.c:1717` (`CalculateMonStats`) → `GetMonAbility(mon) == ABILITY_WONDER_GUARD`. This is the
    funnel: `RecalcBattlerStats` routes form-change / dynamax / gigantamax recalcs through it, so those are
    covered automatically. `GetMonAbility` is safe here (reads only species + abilityNum, both set earlier).
  - `src/battle_dynamax.c:135` (`struct Pokemon*` → `GetMonAbility`), `:150` and `:164`
    (battler → `gBattleMons[battler].ability == ABILITY_WONDER_GUARD`) — keep 1-HP mons out of the Dynamax
    HP multiplier.
  - HP-EV item gating for consistency: `src/party_menu.c:4691` and `:5194` (`struct Pokemon*` → GetMonAbility)
    so a WG mon gains nothing from HP-Up and a WG-less Shedinja is allowed HP items.
  - Leave `src/battle_dome.c:2149` (Dome stat sim on `struct TrainerMon`, ability often `NONE`) — behaviour
    is unchanged for canonical presets; retie is low value / higher risk. (Decision: skip unless owner wants it.)
  - Leave all nickname/language/frontier/data sites (`battle_main.c:2624`, `trade.c:1164`,
    `evolution_scene.c:591`, `frontier_util.c:445`, data tables) untouched — not HP logic.
- `ABILITY_WONDER_GUARD` = 25, `include/constants/abilities.h:29`.
- **Shedinja base stats:** set `.baseHP = 221` in `src/data/pokemon/species_info/gen_3_families.h` so its BST
  equals base Ninjask (456 = 61+90+45+160+50+50; Shedinja non-HP = 90+45+30+30+40 = 235 → 221). Inert while it
  has WG (HP still forced to 1); becomes its real HP only if it ever loses WG.
- **Description:** update Wonder Guard's `.description` at `src/data/abilities.h:197` to state the 1-HP rule,
  within the ~30-char single-line budget (longest current = 31). Proposed: `"1 HP. Only supereffective hits."`.
  (Decision: confirm this is the ability description, not the Shedinja Pokédex entry — see Open Questions.)

### Phase B — Rater: Wonder-Guard-aware defensive rating + UU hard floor
For a WG mon, HP/Def/SpDef are irrelevant (it takes 0 damage or dies to 1 hit / any residual). Replace the
bulk term with a typing-derived survivability score and floor the tier.
- The rater already has the type machinery: `typeChart` (rating.js:237), `damageMultiplier(atk, defTypes)`
  (258), `isSuperEffective` (269). Weakness count = `Object.keys(typeChart).filter(t => damageMultiplier(t,
  poke.parsedTypes) > 1).length`. **No** hazard/weather/status residual model exists — that reasoning is new.
- Design (v1, **pending owner validation** — see Open Questions): for WG mons, in `computePowerAndRole`
  (rating.js:3406/3445) set `defensePower := wgDefensiveRating(poke)` instead of the HP/Def/SpD bulk formula, where
  `wgDefensiveRating` rewards (a) few type weaknesses and (b) typings immune to the common residual/DoT sources
  the owner called out — poison/toxic (Poison, Steel), burn (Fire), and hazard avoidance (Flying/Levitate dodge
  Spikes; Stealth Rock still hits everything and is lethal to 1 HP, so it is a flat meta consideration, not
  type-scaled). Plus a base bonus. Offensive/speed powers are unchanged, so good types + offense naturally climb
  toward Ubers/AG, matching the owner's expectation.
- **Hard floor:** after the existing ability floors (rating.js ~3817, mirroring the IMPOSTER block):
  `if (poke.parsedAbilities.includes('WONDER_GUARD')) absoluteRating = Math.max(absoluteRating, TIER_UU_THRESHOLD + 0.1);`
  → WG is at minimum UU purely for having the ability (thresholds: UU≥7, OU≥8, UBERS≥9 — constants.js:32-43).
- WG's `aiRating = 10` already feeds `bestAbilityRating` (the 0.1 term at rating.js:3759). Confirm no cap
  suppresses it (rating.js:3620-3688).

### Phase C — Mutator: unban Wonder Guard (+ guards)
- Remove `'WONDER_GUARD'` from `BANNED_ABILITIES` (rebalancer.js:37). Effect: any mon can now GAIN WG via the
  10%-gated ability mutator (its HP then becomes 1 by Phase A); a WG holder with no free `NONE` slot could lose
  it (Shedinja keeps WG because the NONE-first rule fills its empty slots instead — verified).
- Consider a guard so the stat mutator (rebalancer.js:192-218, currently unguarded) does not buff a WG mon's
  `baseHP` away from 1 in a way that matters — but since Phase A ties HP to the ability and Phase B makes the
  rater ignore HP/Def/SpD for WG mons, a buffed `baseHP` is inert both in-engine and in-rating. Likely no guard
  needed; flag and decide during implementation.

### Cross-cutting
- TDD throughout; browser must be rebuilt (`node build.js`) so the client-side rater/mutator/data match
  (bundle + base-data.json are gitignored, regenerated at deploy). The bundle carries copies of rating.js and
  rebalancer.js — green Jest ≠ browser updated.

## Acceptance criteria
- [x] Every HP-forcing engine site keys off `ABILITY_WONDER_GUARD`, not `SPECIES_SHEDINJA` (Phase A sites above).
- [x] Shedinja `.baseHP = 221` (BST parity with Ninjask); confirmed via a data/parse test.
- [x] Wonder Guard's description states the 1-HP rule within the char budget.
- [x] Rater: WG mons get the typing-based defensive rating and a hard UU floor (singles AND doubles); unit tests
      cover a low-weakness DoT-immune type rating higher than a many-weakness type, the UU floor, and bulk-ignored.
- [x] Wonder Guard removed from `BANNED_ABILITIES`; test proving it is out of the ban list (so it enters the pool).
- [x] `cd randomizer && npm test` green (1478 passing); `node build.js` clean; real Shedinja rates UU (singles+doubles).
- [ ] Owner manually confirms in-game: Shedinja with WG = 1 HP; a mon that loses/gains WG flips to real/1 HP;
      Shedinja Pokédex/summary shows the new description and BST.

## Open questions — RESOLVED (owner, 2026-07-21)
1. **Description target** → Wonder Guard **ability** description. Text: `"1 HP. Only supereffective hits."`
2. **WG defensive-rating** → typing-based (few weaknesses + DoT-status immunities: poison/burn/sandstorm; Flying
   avoids Spikes) **plus a flat Stealth-Rock dampener** (SR kills any 1-HP mon regardless of typing; assumes our
   hazard-heavy 6v6). Replaces the bulk term. Constants tunable; tests assert relative ordering + the UU floor,
   not magic numbers.
3. **Scope** → one phased task (T-184), phases A→B→C.
4. **Unban timing** → Phase C in this task, gated behind A+B; owner playtests the whole thing before close.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created after full analysis of the three subsystems (three parallel code-analysis passes):
  - **Engine (C):** only two sites force literal 1 HP — `pokemon.c:1719` and `battle_dome.c:2151`. HP-forcing
    logic to retie: `pokemon.c:1717` (+ its recalc funnel `RecalcBattlerStats`), `battle_dynamax.c:135/150/164`.
    HP-EV gating: `party_menu.c:4691/5194`. Correct check: `GetMonAbility(mon)` (`pokemon.c:3543`, Hidden-Ability
    aware) for `struct Pokemon*`; `gBattleMons[battler].ability` for battler contexts. Transform doesn't copy HP
    → no change. All other SPECIES_SHEDINJA hits are nickname/frontier/data.
  - **Rater:** `ratePokemon` (rating.js:3612); composite `bstRating*0.8 + movesRating*0.1 + bestAbilityRating*0.1`
    (3759); bulk term `defensePower` (3445) blended by role. `tierFromRating` (3386); TIER_SEQ = MAGIKARP, ZU, PU,
    NU, RU, UU, OU, UBERS, LEGEND, AG (constants.js:551); thresholds UU≥7…AG≥9.75 (constants.js:32-43). Tier floors
    are `Math.max(absoluteRating, THRESHOLD)` clamps applied before tierFromRating (3774-3920) — the injection
    point for the UU floor. Type chart + damageMultiplier exist (237-267); no hazard/weather/status model exists.
    rating.js references neither WONDER_GUARD nor SHEDINJA today.
  - **Mutator:** `parsedAbilities` = ordered 3-slot array, NONE kept (pokedexModule.js:116). Ability mutator
    (rebalancer.js:252-288), 10% gated, draws uniformly from ALL game abilities minus already-held minus banned;
    a mon can gain an ability no family member had. `BANNED_ABILITIES` (18-41) does two things: stops others
    RECEIVING (filter B, :267) and stops holders LOSING (filter A, :259). WG banned "for now" (comment :36).
    Stat mutator (192-218) has NO species/ability guard → could buff Shedinja's baseHP off 1 (inert after A+B).
    Writer emits `.abilities` from parsedAbilities (`pokemonWriter.js:79-85`) — mutated WG round-trips fine.

- **2026-07-21** — Implemented all three phases (TDD, owner-validated design). Deviation/extension from plan:
  applied the WG treatment to the **doubles** rater too (`ratePokemonDoubles` shares `computePowerAndRole`, so
  the typing-based defense propagated for free; added the raw-BST gate + UU floor there as well). Files:
  - Phase A (engine/data): `src/pokemon.c` (CalculateMonStats), `src/battle_dynamax.c` (×3),
    `src/party_menu.c` (×2) → keyed on `GetMonAbility(...)==ABILITY_WONDER_GUARD`; Shedinja `.baseHP` 1→221;
    Wonder Guard `.description` → "1 HP. Only supereffective hits." (`src/data/abilities.h`).
  - Phase B (rater): `wonderGuardDefensiveRating` (weaknesses + DoT-immunity + flat SR dampener), defensePower
    override + gated stat-defense bonuses in `computePowerAndRole`, raw-BST floor neutralised for WG, hard UU
    floor before `tierFromRating` (singles) and `tierFromRatingDoubles` (doubles).
  - Phase C (mutator): removed `WONDER_GUARD` from `BANNED_ABILITIES` (exported for the test).
  - Tests: `wonderGuardRating`, `wonderGuardData`, `wonderGuardUnban` (13 tests). Full suite 1478 green.
    `node build.js` clean; real Shedinja now UU in singles and doubles.
  - Known/flagged for owner: unbanning + the NONE-first mutator rule means the mutator may fill a Shedinja
    NONE slot with a random 2nd ability (some Shedinja roll non-WG → real 221-HP mon). Consistent with the
    "loses WG → real HP" intent; call out at playtest if undesired. No C battle test added (CI-only, and the
    framework can't build a non-Shedinja-with-WG party mon; covered by owner playtest + JS tests).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
