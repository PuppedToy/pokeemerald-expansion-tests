---
id: T-125
title: Gimmick-conditional item selection + bag provisioning
status: in-progress
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-107, T-124]
blocked-by: []
priority: medium
---

# T-125 — Gimmick-conditional items + bag provisioning

## Context

Owner: item choice must be **conditional on the crystallised gimmick**, and it happens later in
teambuilding. *"Si el equipo tiene un Drizzle pero no es weather gimmick, no metemos el item. Pero si
es weather gimmick querremos la piedra que aumenta los turnos del weather (habrá que meterla en la bag
a partir de los museum grunts)."*

## Plan

> **Re-scoped by the owner (2026-07-16)** into the full gimmick-item + bag pass, for **both formats**.
> The core defect: gimmick items are chosen the WRONG way. The weather rock is currently SET DIRECTLY on
> the setter (`WEATHER_ROCK_BY_SETTER` in the resolver) — it never touches the bag and bypasses the common
> link-aware claim system every other item uses. **All gimmick items must be born from the bag** and
> claimed by the teambuilder through the shared consume-once/linked path (like Choice items + TMs).

### 1. Bag provisioning (bound/linked, gated by story progression)

Provision each gimmick item into the trainer bag from the right point (inclusive), as linked pick-groups
(`randomizer/itemRandomizer.js` + `tmRandomizer.js`; docs `items.md` / `tms.md`):

| Item(s) | In bag from (inclusive) | Notes |
|---|---|---|
| 4 weather rocks — Heat / Damp / Smooth / Icy | **Aqua grunts** | linked (bound) |
| 4 weather-setting TMs (Sunny Day / Rain Dance / Sandstorm / Snowscape) | **Aqua grunts** | linked; used ONLY by gimmick teams with NO ability-setter |
| **Light Clay** | **Wattson** | |
| 2 screens TMs (Reflect / Light Screen) | **Wattson** | linked |
| 4 terrain seeds — Electric / Grassy / Misty / Psychic | **Wally Mauville** | linked |
| **Terrain Extender** | investigate (owner: likely random) — identify/add its world source | weather-rock logic for electric-terrain setters (see §2) |
| Room Service / Lagging Tail / Iron Ball | TR progression | TR abuser items (see §3) |

### 2. Common consumption mechanics (teambuilder-driven, like everything else)

- The weather stone is **claimed from the bag by the teambuilder** via the link-aware path (mirrors the
  forward-Choice claim): a team with **2 setters places only 1 rock** — once a rock is claimed, no second
  rock can be. Remove the direct-set `WEATHER_ROCK_BY_SETTER` path.
- **Weather TMs:** used ONLY in gimmick teams that lack an ability-setter (the move-setter retrofit path,
  ex-gimmick baggage) — verify they still fire correctly and only there.
- **Terrain Extender:** apply the weather-rock claim logic to the **electric_terrain** gimmick — the terrain
  SETTER (Electric Surge / Hadron Engine) claims Terrain Extender from the bag when it's the gimmick setter.

### 3. Rating reviews (both formats — "todas las revisiones pendientes")

- **Terrain seeds:** a team that has a terrain SETTER values the matching seed on teammates. Its rating =
  a good **defensive** item — **worse than Eviolite, better than Assault Vest**. Applies to all four terrains.
- **Grassy Glide:** verify it is treated as **priority** (and rated up) when a teammate has Grassy Surge.
- **Aurora Veil:** verify it strongly prefers **Light Clay** (but LESS than the weather rock itself);
  verify which **abusers besides the setter** can run it; confirm it is rated a **very strong move under snow**.
- **Trick Room items:** Room Service / Lagging Tail / Iron Ball let a **slower** mon abuse TR. **Room Service
  is clearly the best**; Lagging Tail + Iron Ball are questionable utility — evaluate, keep minimal.

Format-agnostic (singles + doubles). Item selection already runs after moves in the resolver; this layer
reads the crystallised identity + the bag.

> **Meta-analysis validation (owner-gated).** Progression points + the seed's defensive value band
> (AV < seed < Eviolite) are owner-set (above). Terrain Extender's world source is TBD (research).

Acceptance criteria:
- [ ] **All** gimmick items are claimed FROM the bag via the common link-aware system — the direct-set
      weather-rock path is gone; a team with 2 setters places only 1 rock (consume-once).
- [ ] Weather rocks + weather TMs bound in the bag from the **Aqua grunts** (incl.); Light Clay + 2 screens
      TMs from **Wattson** (incl.); 4 terrain seeds from **Wally Mauville** (incl.).
- [ ] Weather TMs fire only in gimmick teams that lack an ability-setter.
- [ ] The electric_terrain gimmick setter claims **Terrain Extender**; its world source is identified/added.
- [ ] Terrain seeds are rated as a defensive item **between Assault Vest and Eviolite** when the team has the
      matching surger; **Grassy Glide** is treated as priority under Grassy Surge.
- [ ] **Aurora Veil** prefers Light Clay (< the weather rock) and is a strong snow move; the abusers that can
      run it are surfaced; **TR items** (Room Service ≫ Lagging Tail / Iron Ball) let slow mons abuse TR.
- [ ] Determinism gate green; `cd randomizer && npm test` green.

## Progress log

- **2026-07-11 — weather rock done.** A mon whose chosen ability is a weather setter (Drought/Drizzle/
  Sand Stream/Snow Warning/Orichalcum) now holds the matching rock (`WEATHER_ROCK_BY_SETTER` →
  Heat/Damp/Smooth/Icy Rock via `itemIdToName`), filling only an empty item slot and soph-gated so
  early-game is byte-identical. Verified on the seeded weather trainers: Archie → Drizzle @ Damp Rock,
  Maxie → Drought @ Heat Rock, Museum grunt → Snow Warning @ Icy Rock. Suite 929; determinism green.
  Given the seeds place the setters (T-126), the rock is on the right mons from the Museum grunts
  onward, per the owner ask — no separate bag provisioning needed (the item is set directly on the
  setter). **Follow-ups:** other gimmick items (Light Clay for screens, Room Service for TR — with the
  TR completion in T-124).
- **2026-07-11** — Created from the owner's problem-2 reflections (gimmick-conditional items + weather
  rock from the Museum grunts). Blocked on T-124 (gimmick completion).

- **2026-07-16 — owner RE-SCOPED to the full item/bag pass (both formats); T-124 done → unblocked.**
  Root problem the owner flagged: the weather rock is set DIRECTLY on the setter and never uses the bag /
  common consume-once system — so items don't behave like everything else. New scope (Plan rewritten above):
  (1) provision every gimmick item into the bag as linked groups from a progression point — weather rocks
  + 4 weather TMs from the **Aqua grunts**, Light Clay + 2 screens TMs from **Wattson**, 4 terrain seeds
  from **Wally Mauville**, Terrain Extender for electric-terrain setters (source TBD — likely random);
  (2) claim them via the shared link-aware path so 2 setters ⇒ only 1 rock, consume-once; weather TMs only
  in ability-setter-less gimmick teams; (3) rating reviews — terrain seeds as a defensive item valued
  **AV < seed < Eviolite** for a team with the matching surger, Grassy Glide as priority under Grassy Surge,
  Aurora Veil preferring Light Clay (< rock) + strong under snow + its non-setter abusers, and TR items
  (Room Service ≫ Lagging Tail / Iron Ball). Not yet implemented — spec captured for the next work session.

- **2026-07-16 — Increment 1 DONE: weather rocks born from the bag + link-aware claim.** The 4 rocks
  were commented-out in `slateportGruntsBag`; wired them as ONE `linkedChoiceSample(['Damp Rock','Heat
  Rock','Smooth Rock','Icy Rock'])` (Slateport aqua grunts → cascades forward). Replaced the resolver's
  direct-set (`WEATHER_ROCK_BY_SETTER` → item) with a **bag-gated claim**: a weather setter takes its
  matching rock ONLY if the bag holds it, then `consumeLinkedUnit` spends the pick-group so the other
  three rocks are forgone — a 2nd setter finds none (the owner's "2 setters ⇒ 1 rock"). Verified e2e
  (seed 1830319788): Archie→Damp, Maxie→Heat, Museum-2/Matt→Icy (snow), all matching subtype; **0 teams
  hold ≥2 rocks**. Unit test `gimmickItemBag.test.js` (provisioning + consume-once), fast suite 1145,
  determinism 17/17. **Next:** increment 2 (weather TMs from the aqua grunts).

- **2026-07-16 — Increment 2 DONE: weather-setting TMs born from the bag + retrofit gated on them.**
  Provisioned the 4 weather TMs (`TM_RAIN_DANCE/SUNNY_DAY/SANDSTORM/HAIL`) as one linked group in
  `slateportGruntsBag`. Gated the move-setter retrofit `ensureMoveSetter(team, subtype, {tms, level})`:
  it injects a setter MOVE only if reachable by level-up OR the trainer HOLDS its TM (B-030), so it is
  bag-born and fires ONLY for weather-gimmick teams with no ability-setter. E2e: weather teams intact —
  36 ability-setter + 7 move-setter retrofit. Fast suite 1145. **Next:** increment 3 (terrain seeds).

- **2026-07-16 — Increment 3 DONE: terrain seeds — generalized, surger-aware, bag-born claim.** The 4
  seeds were already in the bag (`choiceJosephSeeds` in `wallyBag`, from Wally Mauville — the cascade
  flows steven ⊂ slateport ⊂ rivalRoute110 ⊂ wally ⊂ wattson). New `planTerrainSeedClaim` (archetypeRefine)
  replaces the old electric-only direct-set: a team that establishes ANY terrain (a teammate's Surge
  ability / terrain move, or the electric_terrain gimmick) gives a bulky low-offense mon (or an Unburden
  abuser) the MATCHING seed, claimed from the bag + `consumeLinkedUnit`. E2e: Shelly→Misty, Kindra/Phoebe→
  Psychic, Wendy→Misty (all four terrains, not just electric). Tests added; fast suite 1150. **Next:**
  increment 4 (Terrain Extender for the electric_terrain setter).

- **2026-07-16 — Increment 4 DONE: Terrain Extender for the electric-terrain gimmick setter.** Provisioned
  `'Terrain Extender'` into `wattsonBag` (the electric-terrain gimmick point → cascades forward). Resolver
  claim (right before the seed claim, so the setter takes the Extender first): on an `electric_terrain`
  gimmick, a setter with ELECTRIC_SURGE / HADRON_ENGINE claims Terrain Extender from the bag +
  `consumeLinkedUnit` — the terrain analogue of the weather rock. Provisioning unit-tested; fast suite 1152.
  NOTE: electric-terrain teams are RARE in practice (Electric Surge/Hadron Engine are scarce after
  `mutateAbilities`; none formed across 5 sampled seeds), so the claim is correct-by-inspection (identical
  to the verified weather-rock claim) but seldom exercised — flagged for the owner. **Next:** increment 5
  (screens TMs from Wattson + Light Clay claim).

- **2026-07-16 — Increment 5 DONE: screens provisioning (2 TMs + Light Clay from Wattson).** Light Clay was
  already in `wattsonBag`; added the 2 screens TMs `linkedChoiceSample(['TM_REFLECT','TM_LIGHT_SCREEN'])`
  (one pick-group). A screen setter can now teach a screen (B-030) and the rater can equip Light Clay to
  extend it. (Aurora Veil is a snow move → its rating + who abuses it is increment 7, not the general
  screens.) Provisioning tested; fast suite 1153. **Next:** increment 6 (TR items: Room Service → bag).

- **2026-07-16 — Increment 6 DONE: Trick Room items born from the bag.** Provisioned `'Room Service'` into
  `tateAndLizaBag` (the TR gimmick point → cascades). Replaced the Room Service direct-set with a bag claim:
  a TR abuser (fast mon, baseSpeed > 60, on a `trick_room` gimmick) claims the best TR speed-control item
  in the bag — **Room Service** preferred, else **Iron Ball** (averageItemPool). **Lagging Tail reviewed +
  dropped** (marginal utility + not in any pool — owner: "cuestionable"). Provisioning tested; fast suite 1155.
  - ⚠️ **FINDING (out of T-125 scope, for owner):** across 7 sampled seeds NO team fielded a Trick Room
    move — even the TR-seeded Tate & Liza (they field Solrock/Lunatone but no TR move), and likewise
    electric-terrain never formed (inc.4). `monCanLearn` is NOT TM-gated, so the cause is upstream (the TR
    setters lack Trick Room at runtime / the gimmick attempt fails), a **T-124 gimmick-building** matter, not
    items. So inc.4 + inc.6 item claims are correct-by-inspection but currently dead until TR/electric-terrain
    actually build. Recommend a separate bug/T-124 follow-up.

- **2026-07-16 — Increment 7 ANALYSIS (rating reviews) — awaiting owner input.**
  - **Aurora Veil + Light Clay — ALREADY CORRECT (verified, no change).** Aurora Veil rates `inSnow ? 10 : 0`
    (strong under snow, dead otherwise); Light Clay rates 10 with Aurora Veil / dual screens, 9.5 with one
    screen, 0 without. The weather rock is claimed (inc.1) BEFORE the generic rater item pick, so a snow
    SETTER takes its Icy Rock and Light Clay falls to a different screen mon → "rock > Light Clay" holds via
    ordering. Abusers besides the setter can run Aurora Veil (the move rating is team-snow-aware via `selCtx`).
  - **Seed value (AV < seed < Eviolite) + Grassy-Glide priority — blocked on a design call.** Both values are
    TEAM-CONDITIONAL (only worth it with the matching surger on the team), but `rateItemForAPokemon` is
    team-BLIND and the move rater's terrain context is limited. The engine already handles ASSIGNMENT (the
    inc.3 seed claim; the T-124 `planTerrainSynergyMove` injects Grassy Glide onto a teammate of a Grassy
    Surge setter; the self-Grassy-Surge + Grassy Glide combo bonus is +0.45). What's missing is the per-mon
    RATING expressing the team-conditional value. Clean fix: extend the rater's `selCtx` with terrain flags
    (grassy/electric/misty/psychic, from the team's surgers) — then Grassy Glide's priority + the seed's
    defensive value can be rated conditionally. This is a value-judgment layer the owner wanted to weigh in
    on → paused for confirmation before implementing.

- **2026-07-16 — Increment 7 DONE: terrain-conditional MOVE rating layer (owner-directed).** Mirrored the
  weather-move pattern exactly. Added terrain flags to `rateMoveForAPokemon` (`inElectricTerrain` /
  `inGrassyTerrain` / `inPsychicTerrain` / `inMistyTerrain` / `inAnyTerrain`), active if THIS mon has the
  Surge/Hadron Engine/terrain move OR an earlier teammate does (`ctx.*`); extended the resolver's `selCtx`
  with those flags (from teammate surgers). Boosted the terrain-scaling moves (magnitudes provisional):
  Rising Voltage ×1.8 + Psyblade ×1.5 (electric), Expanding Force ×1.6 (psychic), Misty Explosion ×1.5
  (misty), Grassy Glide ×1.4 (grassy — the team-level priority the owner asked for), Terrain Pulse ×1.9
  (any terrain), and Steel Roller → 0 off-terrain (it fails). Singles + doubles (owner). Tests:
  `terrainMoveRating.test.js` (8, real base-data moves); fast suite 1163.
  - **Aurora Veil + Light Clay:** verified already correct (no change) — see the prior entry.
  - **Seed value (AV < seed < Eviolite) — DECISION: skipped in the rater.** `rateItemForAPokemon` is
    team-blind, and the inc.3 seed CLAIM already assigns the matching seed to a bulky mon on a terrain team
    BEFORE the generic rater pick — so a rater value would be largely redundant and would need a broad
    team-context signature change through a core rater for marginal benefit. Surfaced to the owner; easy to
    add later if wanted (e.g. for the docs display). **T-125 increments 1-7 complete — awaiting owner manual test.**

## Outcome
