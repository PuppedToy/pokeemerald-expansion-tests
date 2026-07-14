---
id: T-132
title: Weather team-building — setter + 2 abusers, rollback-on-fail, and weather-tag mechanics
status: done
type: feature
created: 2026-07-13
updated: 2026-07-14
target-version: 0.8.0
links: [T-131, T-124, T-130, docs/adr/ADR-017-gimmick-attempt-rollback.md, docs/research/weather.md]
blocked-by: []
---

# T-132 — Proper weather team-building

## Context

Follow-up from T-131. The current weather system only assigns setter/abuser ABILITIES per mon; it never
ensures a setter-capable mon is PICKED, so type-restricted weather villains (Museum grunts, Matt, Tabitha)
drop weather entirely (confirmed via the T-130 audit: 0 setter-capable mons picked). The owner defined —
and the corpus validated — a proper build algorithm. Design SSOT: `docs/research/weather.md` (corpus
analysis + the owner-validated algorithm + weather-tag mechanics). Applies to BOTH seeded weather
villains and any team randomly steered to weather.

## Plan

Implement the owner-validated algorithm (see the research doc for the full spec):
1. Tentative weather tag; team-building runs WITH the tag until dropped.
2. Pick a **setter** (ability optimal; move-setter allowed when forcing, gets an abuser ability). Fail→fail.
3. Ensure **2 abusers** (BROAD definition — abuser ability OR synergy move OR boosted-STAB attacker; the
   setter may count). Fail→fail.
4. Condition **setter + 2 abusers**; on fail, **roll back** the setter slot and redefine it (change/drop
   the weather tag).
5. Complete the archetype with non-abusers, preferring weather-synergy where free.
6. Fallback: try other weathers in random order; final fallback → drop the tag, build a normal team.
7. Apply the **weather-tag mechanics** per member (STAB ×1.5 / ×0.5, Weather Ball type+BP, Thunder/Hurricane
   & Blizzard accuracy, Ice Def / Rock SpDef) in move + ability + item scoring.

The hard part is the **rollback**: the current picker/refine is per-mon with no backtracking. Design a
clean way to commit the weather plan only when setter+2-abusers is achievable within the restrictions,
else abandon the tag — without corrupting determinism or the per-slot reseed.

Acceptance criteria:
- [ ] A weather-seeded villain fields a setter + ≥2 abusers of its (themed, else fallback) weather when its
      type pool allows; else the tag is cleanly dropped (auditable via T-130).
- [ ] Museum grunt 2 (snow → falls back within aqua to rain) and Tabitha (sand) actually get weather.
- [ ] The weather-tag mechanics measurably affect the picks (boosted-STAB attackers, synergy moves).
- [ ] Deterministic; per-slot reseed intact; `cd randomizer && npm test` + determinism/continuity green.

## Progress log

### 2026-07-13 (cont.) — liked mascot (goodBreed) + Tabitha Mossdeep follows Maxie's weather (tag)
Two owner requests after item A.
- **B — "liked" favourite (goodBreed, not perfect).** A favourite is perfect-breed (the owner calls it
  "shiny"); the box legendaries shouldn't be. Added `likedFavourite(species)` → `{ chain:[species],
  goodBreed:true }` (a clone-safe object; bare-array favourites stay perfect). `favouriteClaim` marks a
  liked favourite `breedTier:'good'`. Applied to Maxie's Groudon and Archie's Kyogre. (favouriteClaim +2 tests.)
- **C — Tabitha Mossdeep abuses Maxie's ACTUAL weather (runtime tag dependency).** New declarative
  `abusePartnerWeather: 'TRAINER_MAXIE_MOSSDEEP'` on Tabitha Mossdeep. The resolver keeps a
  `committedWeather` map (the weather each trainer actually set, via `teamWeather`); writerDocs DEFERS a
  partner-dependent trainer to a second pass so its ally resolves first (safe — villains aren't continuity
  groups). Tabitha's seed is overridden at resolve time: ally set weather W → `{gimmicks:['weather'],
  weather:W, abuseOnly:true}` (no setter of her own — Maxie's Groudon sets it); ally set none → normal team.
  New **abuse-only** mode: `weatherHolds(ctx.abuseOnly)` needs ≥2 abusers but NO setter; the picker skips
  the setter hard-pick; `ensureMoveSetter` is skipped; the fallback chain is just [abuse-W, dropped].
- **Result** (seed 2920625670): Maxie Mossdeep leads Groudon (Drought → sun, goodBreed); **Tabitha Mossdeep
  fields NO setter + 2 Fire sun-abusers (Iron Moth, Armarouge) — follows Maxie's sun, not her own sand.**
  `npm test` 1021; determinism + continuity gates 17/17. gimmickPlan +4 abuse-only/teamWeather tests.

### 2026-07-13 (cont.) — removed `preventShuffle` everywhere (owner: obsolete now that lead-resolution exists)
`preventShuffle` was a workaround from before `applyLeadLogic` existed — it froze a boss's party in its
built order. Now that the lead-order resolution (weather setter → Stealth Rock → Spikes → Illusion) does
the job, the owner asked to remove it entirely. Deleted all 11 `preventShuffle: true` in trainers.js and
the flag + gates in `writer.js` / `writerDocs.js`; every trainer now goes through the per-trainer-seeded
shuffle + `applyLeadLogic` (so the weather setter leads bosses via the normal path — the previous
preventShuffle-only `leadWeatherSetter` branch is gone). Updated the two obsolete tests
(`writerDocsTeamOrder`, `writer`). `npm test` 1015; determinism + continuity gates 17/17 (boss order now
shuffles but stays per-trainer deterministic → cross-ROM consistency holds). Verified the weather setter
still leads all villains on seed 2920625670.

### 2026-07-13 (cont.) — weather setter LEADS the team (owner, order-resolution)
Owner (order-resolution, not pick-order): the weather setter should be the team's LEAD 95% of the time and
roll BEFORE the Stealth Rock lead. The lead is decided in `modules/trainerTeamOrder.js applyLeadLogic`
(a random shuffle + hazard-lead phases), which was SKIPPED for `preventShuffle` trainers — and every boss/
villain (`isBoss`) is `preventShuffle`, so weather villains kept their build order and no lead ran.
- Added **Phase 0 — weather setter: 95% lead**, before Phase 1 (Stealth Rock), in `applyLeadLogic`; extracted
  `leadWeatherSetter(team, rngFn)` so it can ALSO run on preventShuffle teams (which keep their designed
  order otherwise). The 95% roll is consumed ONLY when a setter exists → non-weather teams byte-identical.
- Wired into both writers: `writerDocs.buildTrainersResultsSimplified` (the bundle/viewer) and `writer.js`
  (the ROM party) now apply `leadWeatherSetter` to preventShuffle teams (per-trainer seeded in writerDocs).
  A setter is ability OR move based (so the move-setter Krokorok leads too).
- **Result** (seed 2920625670): 6/7 weather villains lead with their setter (Museum-1 Delibird, Museum-2
  Ninetales, Matt Aurorus, Archie Kyogre, Maxie-Hideout Torkoal, Tabitha Krokorok move-setter); Maxie-Chimney
  hit the 5% no-lead this seed (Camerupt leads) — expected variance. `npm test` 1015; gates 17/17.
  Tests: trainerTeamOrder Phase-0 (ability/move setter leads, 95%/5%, rolls before SR, no-setter no-roll).

### 2026-07-13 (cont.) — owner re-test: weather-aware ABILITY value (supersedes the RC4 ban)
Fresh bundle `run-2920625670 (1)`: the move-setter fix landed (Tabitha now builds sand), but its Rock
abusers still carried **Swift Swim** (a rain ability, dead in sand), and Maxie's Meganium took Overgrow
over **Leaf Guard** under sun. Owner's principle: *"no se deberían coger weather abilities sin weather,
debería puntuar 0"* + *"modificar el valor de las habilidades dado el tag de weather."*
- Replaced the RC4 `bannedAbilities` (setters only) with a general **weather-aware ability value** in
  `pickTrainerMonAbility(weatherSubtype)`: within the level-eligible pool, an ability of the ACTIVE weather
  (Sand Rush in sand, Leaf Guard in sun, …) is preferred over any generic ability; a FOREIGN-weather
  ability is dropped ("puntúa 0") unless that would empty the pool. Only when a weather is being built; no
  weather context → byte-identical (non-weather trainers untouched). This subsumes RC4 (a foreign SETTER
  also scores 0) with one principled rule.
- SSOT: `WEATHER_ABILITY_SUBTYPE` in weatherConstants = setters ∪ speed/power abusers ∪ defensive-synergy
  (Leaf Guard, Flower Gift, Sand Veil, Snow Cloak). Deliberately EXCLUDES dual-value abilities (Dry Skin,
  Harvest, Protosynthesis, Ice Face) so they're not wrongly zeroed off-weather. **← owner should eyeball
  this classification list.**
- **Result** (seed 2920625670): Tabitha sand — Omanyte→Weak Armor, Relicanth→Sturdy (no more Swift Swim);
  Maxie sun — Deerling→Chlorophyll (active-weather preferred). 0 foreign weather abilities on any team; all
  7 villains still hold. `npm test` 1010; determinism + continuity 17/17. TDD (trainerAbility: foreign-drop,
  foreign-setter-drop, active-preferred/Leaf-Guard, no-weather-unchanged).

### 2026-07-13 (cont.) — owner bundle review (run-2920625670): score+threshold, move-setters, no cross-weather, honest log
Owner tested a real bundle (`tasks/assets/T-132/run-2920625670`, `mutateAbilities` ON) and it looked broken.
Diagnosed each complaint WITH the owner (I also caught + corrected my own broken diagnostic — an empty
`artifacts.moves` made me undercount Water/Fire abusers and briefly mis-report holding teams as failing).
Root causes (owner-approved redesign):
- **RC2/RC3 — one abuser definition.** Replaced the scattered ability|move|type checks with a single
  owner-designed **`weatherAbuseScore(mon, subtype)` + threshold** (weatherConstants): +3 abuser ability,
  +2 boosted-STAB type with a decent attacking stat, +2 boosted-DEF type (Rock/sand, Ice/snow), +1 synergy
  move; abuser ⇔ score ≥ 2. POTENTIAL-based (typing/ability/movepool), not the fragile "did the final
  moveset happen to carry a STAB move". A mon scores 0 for a weather it doesn't fit → a Swift Swimmer is
  never a sun abuser. The picker, the success condition AND the decision-log labels all use this one score.
- **RC1 — move-setters (the Tabitha fix).** With `mutateAbilities`, setter ABILITIES are scattered off a
  type-restricted pool, so a villain often has 4 abusers but no ability-setter → it dropped. Added
  `ensureMoveSetter` (owner-approved suboptimal path): if a built weather attempt has no setter, inject the
  themed setter MOVE (Sandstorm/Rain Dance/Sunny Day/Hail) onto a non-abuser member. Runs inside runAttempt
  before the audit + the commit check. Tabitha now builds sand (Krokorok move-setter + 4 Rock abusers).
- **RC4 — no cross-weather.** A weather attempt now BANS the other weathers' setter abilities
  (`pickTrainerMonAbility` `bannedAbilities`), so no member establishes a conflicting weather (Delibird no
  longer runs Drizzle on a snow team). Removed the old T-131 "establish ANY weather" fallback.
- **The decision LOG was lying.** Its `weatherSetter`/`weatherAbuser` labels came from a weather-AGNOSTIC,
  ability-only feature detector (it labeled a Swift Swimmer a sun abuser and missed Fire/Water/Rock/Ice
  abusers). teamAudit now labels via the same score/`isWeatherSetter`, subtype-aware, and its
  "materialised/dropped" verdict uses `weatherHolds` — matching the resolver's own commit.
- **Result** (seed 2920625670, current code): all 7 present weather villains HOLD their theme with healthy
  abuser counts (Museum-1 rain 2, Museum-2 snow 3, Matt snow, Archie rain 6, Maxie×2 sun 5, **Tabitha sand
  4** via move-setter); 0 foreign setters; the log now reads truthfully. `npm test` 1008; determinism +
  continuity gates 17/17. TDD throughout (gimmickPlan 31, new rateItemForAPokemon 6, trainerAbility ban
  tests, planMemberAbility spec update). **Awaiting owner's re-test of a fresh bundle.**

### 2026-07-13 (cont.) — abusers reach 2: verified the causes, then the owner-approved defensive extension
- Owner (mid-session) required me to VERIFY *why* abusers weren't found before extending the definition,
  and corrected a team-theme mix-up (snow/ice is an **Aqua** weather — Museum grunt 2 & Matt; sand is
  **Magma** — Tabitha; sun Magma — Maxie; rain Aqua — Museum grunt 1 & Archie). Evaluating snow on a Magma
  trainer was meaningless (its snow attempt is only a doomed fallback).
- **Verified per trainer** (WX debug hooks, since removed): the abuser DEFINITION was fine — two mechanical
  gaps remained. (a) **Sand** (Tabitha, Fire/Ground/Rock): 4 Sand Force/Rush mons in the pool, but the soft
  ×4 bias landed only 1; Weather Ball is **not a TM** in this game, so sand has NO move path. (b) **Snow**
  (Matt, Water/Dark/Poison/Ice/Flying): 0 Slush Rush/Ice Body at his tiers, and 18 Blizzard/Aurora-Veil
  learners — but Matt holds NEITHER TM (Blizzard/Aurora Veil ARE TMs; he just doesn't have them), so the
  move path is TM-blocked. rain/sun already held (boosted-STAB attackers are plentiful).
- **Owner-approved extension**: count the **defensively-boosted type** as an abuser — Rock in sand (×1.5
  SpDef), Ice in snow (×1.5 Def) — the defensive analogue of rain/sun's boosted-STAB attacker, and this
  game's actual Sand/Snow mechanic. Added `BOOSTED_DEF_TYPE = {sand:'ROCK', snow:'ICE'}` to
  `weatherConstants`; wired into `gimmickPlan.isWeatherAbuser` (the success SSOT) + the picker preference.
- **Picker — hard-restrict to abusers until 2**: a soft weight can't secure the count across a 60-120-mon
  pool, so (mirroring the setter) the pick is restricted to RELIABLE-abuser candidates (ability | boosted
  type — NOT synergy moves, which are TM-gated) until the team holds `WEATHER_REQUIRED_ABUSERS`. Synergy-move
  learners stay a soft ×4 signal. One rng draw per branch → per-slot determinism untouched.
- **Tentative-tag scoring**: `selCtx[weather]` is now forced true for a weather attempt even before the
  setter lands (setters live in the high-tier slots), so the already-weather-aware rater surfaces synergy
  moves (Blizzard/Weather Ball/Aurora Veil/Solar Beam/Thunder), STAB ×1.5 and accuracy on every member.
- **Result** (seed 2585940843): every weather villain now builds its OWN theme — Museum 1 rain, Museum 2
  snow, **Matt snow** (was falling back to sand before the hard-restrict), Tabitha sand, Maxie sun; all HOLD.
- Fast suite **988** (+5 gimmickPlan defensive-abuser tests). Determinism + continuity gates GREEN (17/17).
  WX debug hooks removed. Shared threshold `WEATHER_REQUIRED_ABUSERS` lives in `weatherConstants`.

### 2026-07-13 (cont.) — setter-first picking (HARD preference), rain/sun villains now BUILD
- Extracted `modules/weatherConstants.js` (leaf module: setter/abuser/subtype maps + `BOOSTED_STAB_TYPE`)
  to break the require cycle that adding weather awareness to the picker would create
  (archetypeRefine ↔ archetypePicker). archetypeRefine + gimmickPlan now import from it.
- Added a weather block to `makeArchetypePicker`. Key finding via the T-130 audit + a WX_DEBUG hook: the
  setters ARE present in the type-restricted tier pools (Matt 2/79 snow, Maxie 2/123 sand), but a soft 6×
  weight over a 60–120-mon pool dilutes to ~8% — the setter almost never got picked. A weather team FAILS
  without a setter, so the setter is now a **HARD preference** (mirroring the electric-terrain filter): as
  soon as a slot's pool offers a setter of the target subtype and the team has none, the pick is restricted
  to setters (still weighted by archetype fit among them; one rng draw → per-slot determinism intact). Once
  a setter is down, abusers get a soft ×4 preference.
- **Result** (seed 2585940843): Museum grunt 1 & 2 → rain (Pelipper/Drizzle) HOLD; Maxie → sun (Torkoal/
  Drought) HOLD. Determinism + continuity gates GREEN (17/17); fast suite 983.
- **Still dropping:** Matt (snow) and Tabitha (sand) — their themed weathers have NO boosted-STAB abuser
  path (only rain/sun do, per the research doc), so even with a setter they can't reach 2 abusers from
  abilities alone. That's the next increment: **synergy-move injection** (Weather Ball / Blizzard / Aurora
  Veil / Solar Beam / Thunder) so more members count as abusers, plus the weather-tag scoring mechanics.

### 2026-07-13 (cont.) — attempt/rollback engine wired into the resolver
- Refactored `resolveTrainerTeam` into `runAttempt(...)` (the slot loop, writing only to passed-in
  isolated state) + an ORCHESTRATOR that tries the `gimmickFallbackChain` variants, validates each with
  `gimmickHolds`, and commits the first that holds (else the final no-gimmick fallback). Each attempt runs
  on a `storedIds`/IV-cache overlay + a throwaway audit + a cloned trainer (its `tms`/`bag` are mutated in
  place), so failed attempts never touch shared state. `generateIVs` takes an optional cache; `teamAudit`
  gained `absorb()` to merge a committed attempt's trace.
- Determinism + continuity gates GREEN (17/17) — byte-identical for single-attempt (non-gimmick) trainers.
- Auditability: a rolled-back gimmick is recorded on the committed trace (`rolledBack`) and rendered
  ("weather intended but ROLLED BACK (after N attempts): couldn't build its setter + 2 abusers…"); an
  incidental emergent setter is no longer claimed as an identity trait. Suite 983.
- **Observed:** the weather villains now cleanly ROLL BACK (Museum/Matt/Tabitha) because the picker still
  doesn't seek a setter — Archie/Maxie only get a setter incidentally. So the ROLLBACK works, but weather
  doesn't yet BUILD.
- **Next increment:** setter-first picking — bias the attempt to actually PICK a setter (+ abusers) within
  the restriction (owner algo step 2/3), so the weather condition can pass; then the weather-tag mechanics
  (STAB/accuracy/Def-SpDef/Weather Ball) in scoring.

### 2026-07-13 — design (ADR-017) + gimmick success-condition module
- **ADR-017** (accepted) — the general rollback: gimmick team-building is ATTEMPT-based. Resolve into
  isolated state (local team + a `storedIds` overlay + buffered audit) under a candidate tag; validate the
  gimmick's success condition; commit the first attempt that holds, trying the fallback chain (themed
  weather → other weathers random → drop). Determinism survives because each slot reseeds independently, so
  re-running an attempt is byte-identical; failed attempts never touch shared `storedIds`.
- **`modules/gimmickPlan.js`** (new, pure, tested — the SSOT for "did the gimmick materialise"):
  `gimmickHolds(gimmickId, team, ctx, subtype)`. Weather = setter + ≥2 abusers with the BROAD abuser
  definition (abuser ability | synergy move | boosted-STAB attacker; the setter may count; subtype inferred
  from the actual setter if not given). trick_room/screens = setter-move presence for now. 10 unit tests.
  Exported `SETTERS_BY_SUBTYPE` from archetypeRefine for reuse. Suite 978.
- **Remaining (the substantive refactor):** extract the slot loop into an `attempt(seed)` with isolated
  `storedIds`/audit; add the orchestrator (fallback chain + commit); wire the fallback tag variants (weather
  subtypes random order → drop); apply the weather-tag mechanics (STAB/accuracy/Def-SpDef/Weather Ball) in
  move/ability/item scoring. Verify determinism + continuity gates stay green.

## Outcome

Shipped the full owner-validated weather team-building system (owner closed 2026-07-14, "hemos avanzado
suficiente" — closed without the usual manual gate at the owner's explicit request; automated coverage
below):
- **Attempt/rollback engine** (ADR-017) + **gimmickPlan** success SSOT.
- **weatherAbuseScore + threshold** — one subtype-specific, potential-based abuser definition shared by the
  picker, the success condition and the decision-log labels (weights/threshold tunable in weatherConstants).
- **Setter-first picking** (hard preference) + **move-setter retrofit** (`ensureMoveSetter`) so a villain
  builds its weather even when `mutateAbilities` scattered the setter ability out of its pool.
- **Weather-aware ability value** — an off-weather ability scores 0; the active weather's ability (incl.
  defensive synergy like Leaf Guard) is preferred.
- **Weather setter LEADS** the party (95%, before Stealth Rock); `preventShuffle` removed everywhere.
- **Tabitha Mossdeep** follows Maxie's actual weather (tag, abuse-only mode); **liked mascots** (Kyogre/
  Groudon) breed good, not perfect.
- **Verification:** `cd randomizer && npm test` = 1021 green; determinism + continuity gates 17/17; a
  3-seed robustness sweep (2920625670/42/777) shows every weather villain builds its theme (setter + ≥2
  abusers) or drops cleanly — 0 half-gimmicks.
- **Follow-ups spawned:** T-133 (bound item pick-groups + planner item assignment), T-134 (villain mascot
  favourite + paired grunt leads a devolved copy). Tuning left isolated: `WEATHER_STAB_ATK_MIN`,
  `WEATHER_ABILITY_SUBTYPE`.
