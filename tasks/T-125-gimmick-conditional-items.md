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

## Outcome
