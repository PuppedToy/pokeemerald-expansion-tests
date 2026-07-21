---
id: T-179
title: Cover untreated & poorly-reasoned items in the trainer item selector
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 1.1.0
links: [randomizer/rating.js, randomizer/items.js, randomizer/docs/items.md]
blocked-by: []
---

# T-179 — Cover untreated & poorly-reasoned items in the trainer item selector

## Context

The trainer item selector is `rateItemForAPokemon(item, poke, ability, moveset, level, bagSize, deviation, doubles)`
in [rating.js](../randomizer/rating.js#L1580). For each Pokémon without a preset item, the caller
([resolveTrainerTeam.js:552](../randomizer/modules/resolveTrainerTeam.js#L552)) rates every item in the
trainer's bag, drops the `rating <= 0` ones, sorts descending and equips the top one.

Many items that live in the item pools ([items.js](../randomizer/items.js)) have **no dedicated handler**.
They fall through to the final `console.log('Warning: Item ... not rated')` and return `calculatedDeviation`
(≈ 1). Effect: they are never *chosen well* — they only ever win a slot by accident when nothing else in the
bag scores above ~1, i.e. they are equipped essentially at random and never for the Pokémon that would
actually benefit. A second group **has** a handler but the rating is flat / `rng.random()`-only / not
reasoned (the Custap Berry is the canonical example).

Scope (per owner): only the pools actually used by the selector —
`plates`, `gems`, `premiumItems`, `otherLockedItems`, `goodItemPool`, `averageItemPool`, `protectionBerries`.
The other pools (mints, shards, fossils, memories, specifics, drives) are out of scope.

Corpus reference: `docs/research/corpus.json` records the held `item` of every competitive set — the
authoritative signal for step 4.1 (item seen in the corpus → higher rating; absent → low rating).

## Plan

For each item in the two lists below:

1. **4.1 — Corpus signal.** Count its appearances in `corpus.json` and read the context of its use (singles
   / doubles). Present → deserves a real rating; absent → deserves a low/situational rating.
2. **4.2 — Mechanism reasoning.** Reason (via the existing rating primitives: `physicalOffensePower`,
   `genericDefensePower`, `damageMultiplier(type, types)`, moveset scan, ability checks) which archetype
   *wants* the item — and, crucially, which Pokémon it is **actively bad on** (return 0). Use the web to
   confirm competitive strategies where non-obvious.
3. **4.3 — Encode + document.** Merge 4.1 & 4.2 into a concrete `if (item === '...')` branch, TDD (Red →
   Green), and document the criterion inline (task ID) and in `randomizer/docs/items.md`.
4. Deliver a per-item report (§ Report) for owner review **before** committing code (analysis-first).

Acceptance criteria:
- [x] Every item in the **Untreated** list has a dedicated, reasoned handler (no more `not rated` warning for any used-pool item — verified by probe: 0 untreated).
- [x] Every item in the **Poorly-reasoned** list is re-derived (no bare `rng.random()`-only or unexplained flat score); the dead duplicate Jaboca handler is removed.
- [x] Each handler is covered by a unit test in `randomizer/__tests__/unit/rateItemForAPokemon.test.js`, annotated `T-179` (21 new tests).
- [x] `randomizer/docs/items.md` documents the rating criterion per item.
- [x] `cd randomizer && npm test` green (1426 passed).
- [x] Per-item report produced and reviewed by the owner ("Love the work. Implementa.").

## Findings — objective classification

Produced by probing every used-pool item through `rateItemForAPokemon` with a neutral test mon and detecting
the `not rated` warning (scratchpad probe). `plates`, `gems`, `premiumItems`, `otherLockedItems`,
`goodItemPool`, and `protectionBerries` are **fully treated** — every untreated item lives in `averageItemPool`.

### A) Untreated (32) — fall through to the warning, return ≈ 1

Corpus count in brackets (blank = 0).

| # | Item | Mechanism | Corpus |
|---|------|-----------|--------|
| 1 | Liechi Berry | +1 Atk at ≤25% HP | |
| 2 | Petaya Berry | +1 SpAtk at ≤25% HP | |
| 3 | Salac Berry | +1 Speed at ≤25% HP | |
| 4 | Ganlon Berry | +1 Def at ≤25% HP | |
| 5 | Apicot Berry | +1 SpDef at ≤25% HP | |
| 6 | Lansat Berry | +2 crit ratio at ≤25% HP | |
| 7 | Starf Berry | +2 random stat at ≤25% HP | |
| 8 | Figy Berry | restore 33% HP at ≤25% (confuse if nature dislikes Spicy) | 16 |
| 9 | Enigma Berry | heal 25% when hit by a super-effective move | |
| 10 | Wide Lens | +10% accuracy | |
| 11 | Zoom Lens | +20% accuracy if moving after the target | |
| 12 | Cell Battery | +1 Atk when hit by Electric (single use) | |
| 13 | Absorb Bulb | +1 SpAtk when hit by Water (single use) | |
| 14 | Luminous Moss | +1 SpDef when hit by Water (single use) | |
| 15 | Snowball | +1 Atk when hit by Ice (single use) | |
| 16 | Muscle Band | +10% physical damage | |
| 17 | Wise Glasses | +10% special damage | 1 |
| 18 | Quick Claw | 20% chance to move first | |
| 19 | Room Service | −1 Speed under Trick Room | |
| 20 | Iron Ball | halve Speed, ground the holder | |
| 21 | Bright Powder | +10% evasion | |
| 22 | Grip Claw | binding moves last 7 turns | |
| 23 | Binding Band | binding-move chip 1/8 → 1/6 | |
| 24 | Protective Pads | ignore contact-based effects | |
| 25 | Utility Umbrella | ignore weather on the holder | |
| 26 | Clear Amulet | prevent opponent-forced stat drops | |
| 27 | Mental Herb | cure Taunt/Encore/Torment/Disable/etc. once | 8 |
| 28 | Focus Band | 10% chance to survive a KO hit | |
| 29 | Float Stone | halve weight | |
| 30 | Sticky Barb | 1/8 chip to holder, transfers on contact | |
| 31 | Metronome | consecutive same-move damage ramp | |
| 32 | Blunder Policy | +2 Speed after the holder's own move misses | 1 |

### B) Poorly-reasoned (handler exists, flat / `rng.random()`-only / unreasoned)

| Item | Pool | Current handler | Problem |
|------|------|-----------------|---------|
| Eject Button | premium | `10 * rng.random()` | pure random |
| Custap Berry | average | `sturdy/endure ? 7.5 : 4` × … | base 4 too high without a trigger |
| Kee Berry | average | `6 * physicalDefensePower` | flat; ignores context |
| Maranga Berry | average | `6 * specialDefensePower` | flat; ignores context |
| Rowap Berry | average | `6 * rng.random()` | pure random |
| Jaboca Berry | average | reasoned once, **dead duplicate** at [1967](../randomizer/rating.js#L1967) | unreachable second branch |
| Mirror Herb | average | `7 * rng.random()` | random; should be doubles/setup-aware |
| Adrenaline Orb | average | `5 * rng.random()` | random; Intimidate-bait, doubles-relevant |
| Red Card | average | `7 * rng.random()` | random |
| Eject Pack | average | `2.5` flat | ignores stat-drop / pivot context |

### C) Deliberately disabled (return 0) — **verified: set in teambuilding, not the selector**

`Damp Rock`, `Heat Rock`, `Smooth Rock`, `Icy Rock` (otherLocked) and `Terrain Extender` (average) are
hard-zeroed at [rating.js:1676](../randomizer/rating.js#L1676). **Verified** these are *not* untreated: they
are **preset during teambuilding**, so the generic bag-rater never needs to score them —

- **Weather rocks** — the weather-setter mon claims its matching rock from the bag in
  [resolveTrainerTeam.js:435](../randomizer/modules/resolveTrainerTeam.js#L435) via `WEATHER_ROCK_BY_SETTER`
  (`DROUGHT/ORICHALCUM_PULSE→Heat, DRIZZLE→Damp, SAND_STREAM→Smooth, SNOW_WARNING→Icy`; T-125), *before* the
  `if (!newTeamMember.item …)` rater loop at line 550.
- **Terrain Extender** — the electric-terrain gimmick setter (`ELECTRIC_SURGE`/`HADRON_ENGINE`) claims it from
  the bag in [resolveTrainerTeam.js:445](../randomizer/modules/resolveTrainerTeam.js#L445) (T-125), also before
  the rater loop.

So `return 0` is **correct**: a bag-rated rock/extender would only ever land on a *non-setter*, where it does
nothing. The **only fix here is documentation** — the current `// @TODO For now these won't be used` comment is
outdated/misleading and will be replaced with an accurate one that points at the teambuilding preset paths. No
behaviour change (owner-confirmed 2026-07-21).

## Report

> **Status: proposed for owner review (analysis-first).** Numbers below are *criteria + magnitude sketches*,
> not final constants — the goal of the review is to validate **who wants each item** and **what zeroes it**,
> not the exact coefficient (those get tuned during TDD). All formulas reuse the existing primitives in
> `rateItemForAPokemon`: `physicalOffensePower` (`atk/100`), `specialOffensePower` (`spatk/100`),
> `bestOffensePower` (`max(atk,spatk)/100`), `speedPower` (`spe/100`),
> `bestOffensePowerWithSpeed` (`(max(atk,spatk)+spe)/200`), `genericDefensePower` (`(def+spd+hp)/300`),
> `physicalDefensePower` (`(def+hp)/200`), `specialDefensePower` (`(spd+hp)/200`),
> `damageMultiplier(TYPE, poke.parsedTypes)`, moveset scan (`m.accuracy`, `m.power`, `m.category`,
> `m.type`, `m.effect`, `m.priority`, `m.rating`), and ability checks. `× dev` = `× calculatedDeviation`.

**Calibration anchors (existing handlers).** Premium offense: Choice Scarf 10, Choice Band/Specs 9, Life Orb
8.5. Premium defense: Leftovers 9.5, Assault Vest 9, Black Sludge 9.5 (Poison). Conditional-strong: Weakness
Policy 10 (gated), Focus Sash 8.5, Rocky Helmet 8–9.5. Mid: Sitrus 7.5–9.5, Gems 5.5–8, Plates 5.5.
Situational/filler: 1–5. Anti-synergy/dead: **0**. New items slot: reasoned-strong 6–8, situational 3–5,
fringe 1–2.5, anti-synergy **0**.

---

### Group 1 — Pinch berries (activate at ≤25% HP)

The AI cannot reliably *reach* ≤25% HP, so the **no-trigger base is deliberately low** (≈2, mirroring the
re-derived Custap). The value is unlocked by a **reliable trigger** — `MOVE_ENDURE` in the set, `STURDY`, or a
`FOCUS_SASH` line of play — and by **berry-payoff abilities** (`UNBURDEN` = consume berry → ×2 Speed;
`HARVEST`/`RIPEN`/`CHEEK_POUCH`/`GLUTTONY` = berry synergy). Each berry is also **stat-gated** to the offense
it boosts.

**1. Liechi Berry** — +1 Atk at ≤25% HP.
- **4.1 Corpus:** 0 uses → fringe.
- **4.2 Reasoning:** wants a **physical attacker** (`physicalOffensePower` dominant). Dead on special
  attackers. Classic combo: **Unburden + Liechi** (Hawlucha-style) or Endure/Sturdy + Reversal.
- **4.3 Proposed:** `let b = (hasEndure||isSturdy)?6:2; if (ability==='UNBURDEN') b+=2; return b * physicalOffensePower * dev;`
  Optionally halve if `baseSpAttack > baseAttack` (wrong-stat mon).

**2. Petaya Berry** — +1 SpAtk at ≤25% HP.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** mirror of Liechi for **special attackers**; Unburden combo identical.
- **4.3 Proposed:** same shape on `specialOffensePower`.

**3. Salac Berry** — +1 Speed at ≤25% HP. *(user example)*
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** wants a **strong attacker that lacks the speed tier** (good offense, mid speed). Best with
  a reliable trigger (Endure/Sturdy) and/or **Reversal/Flail** (low HP → max BP) and/or **Unburden**. Useless
  on an already-fast mon and on a mon with no offense.
- **4.3 Proposed:** `let b=(hasEndure||isSturdy)?6:2; if (ability==='UNBURDEN') b+=2; return b * bestOffensePower * (speedPower<1?1:0.6) * dev;`
  (down-weight if the mon is already fast).

**4. Ganlon Berry** — +1 Def at ≤25% HP.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** defensive pinch berry; reaching 25% HP on a wall is a losing position and +1 Def rarely
  saves it → intrinsically weak. Minor synergy with Ripen/Harvest.
- **4.3 Proposed:** `let b=(hasEndure||isSturdy)?3.5:1.5; if (hasRipen||hasHarvest||hasCheekPouch) b+=1; return b * physicalDefensePower * dev;`

**5. Apicot Berry** — +1 SpDef at ≤25% HP.
- **4.1 Corpus:** 0.
- **4.2/4.3:** mirror of Ganlon on `specialDefensePower`.

**6. Lansat Berry** — +2 crit ratio at ≤25% HP.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** only meaningful inside the **crit ecosystem** (SNIPER/SUPER_LUCK, a high-crit move, Focus
  Energy) — the same gate the existing Razor Claw uses — plus a reliable trigger. Otherwise a dead gimmick.
- **4.3 Proposed:** `let b=1.5; if (hasSniper||hasSuperLuck||hasHighCritMove||hasFocusEnergy) b+=2.5; if (hasEndure||isSturdy) b+=1; return b * bestOffensePower * dev;` (still capped low).

**7. Starf Berry** — +2 to a **random** stat at ≤25% HP.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** random stat = unreliable; pure gimmick. Slight bump only with a reliable trigger.
- **4.3 Proposed:** `return ((hasEndure||isSturdy)?2.5:1.5) * bestOffensePower * dev;`

### Group 2 — HP / heal berries

**8. Figy Berry** — restore 33% HP at ≤25% (confuse if the nature dislikes Spicy). *(corpus 16)*
- **4.1 Corpus:** **16** — overwhelmingly **Incineroar** (Intimidate/Fake-Out pivot support, doubles) and
  **Ferrothorn** (hazard wall), plus a Zygarde setup sweeper. i.e. a **bulky pivot/wall recovery berry**.
- **4.2 Reasoning:** a Sitrus-tier defensive recovery on **bulky** mons (`genericDefensePower` scales it).
  Confusion risk is neutralised because `chooseNature` runs *after* the item and can avoid an Atk-lowering
  nature (note for implementation). Berry-payoff abilities bump it.
- **4.3 Proposed:** `let b=7; if (hasHarvest||hasRipen||hasCheekPouch) b+=1.5; return b * genericDefensePower * dev;`
  (peer of Sitrus 7.5, justified by corpus presence).

**9. Enigma Berry** — heal 25% when hit by a **super-effective** move.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** one-time defensive cushion for a **bulky** mon that expects to eat a super-effective hit
  and live. Situational.
- **4.3 Proposed:** `let b=4; if (hasHarvest||hasRipen||hasCheekPouch) b+=1; return b * genericDefensePower * dev;`

### Group 3 — Type-hit stat items (single-use +1 stat when hit by a type)

**Hard rule for all four:** if the holder is **immune** to the trigger type, the item can never fire → **0**.
Immunity = `damageMultiplier(TYPE, types) === 0` **or** an immunity ability. All are inherently situational
(needs to actually be hit by that type), so they cap at *moderate*.

**12. Cell Battery** — +1 Atk when hit by **Electric** (single use). *(user example)*
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** a **physical attacker** with some survivability that is **not Electric-immune**
  (`damageMultiplier('ELECTRIC')===0` → Ground types → **0**; ability `VOLT_ABSORB`/`LIGHTNING_ROD`/
  `MOTOR_DRIVE` → **0**). If Electric is *super-effective* (Water/Flying), only worth it when the mon is bulky
  enough to eat the boosted hit — down-weight unless `genericDefensePower` is high.
- **4.3 Proposed:** `const em=damageMultiplier('ELECTRIC',types); if (em===0 || VOLT_ABSORB/LIGHTNING_ROD/MOTOR_DRIVE) return 0; let b=4; if (em>1) b*= (genericDefensePower>0.9?0.8:0.4); return b * physicalOffensePower * dev;`

**13. Absorb Bulb** — +1 SpAtk when hit by **Water** (single use).
- **4.1 Corpus:** 0.
- **4.2/4.3:** mirror of Cell Battery for **special attackers**; immunities `WATER_ABSORB`/`STORM_DRAIN`/
  `DRY_SKIN` → 0; scale on `specialOffensePower`.

**15. Snowball** — +1 Atk when hit by **Ice** (single use).
- **4.1 Corpus:** 0 held-item uses (the 19 raw text hits were the word "snowball" in narratives — verified).
- **4.2 Reasoning:** **physical attacker**; nothing is Ice-immune by type, so no hard 0 from type. If Ice is
  super-effective (Grass/Ground/Flying/Dragon) the mon is a natural Ice target → item fires more often
  (small "bait" bump) but the hit hurts. Down-weight if frail + 4× Ice-weak.
- **4.3 Proposed:** `let b=4; const im=damageMultiplier('ICE',types); if (im>1) b+= (genericDefensePower>0.8?1:0); return b * physicalOffensePower * dev;`

**14. Luminous Moss** — +1 SpDef when hit by **Water** (single use).
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** *defensive* variant — a bulky mon that wants to tank a Water special hit. Water immunity
  → 0. Niche.
- **4.3 Proposed:** `if (WATER_ABSORB/STORM_DRAIN/DRY_SKIN || damageMultiplier('WATER',types)===0) return 0; return 3 * specialDefensePower * dev;`

### Group 4 — Accuracy lenses

**10. Wide Lens** — accuracy ×1.1. *(user example)*
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** wants a **quality damaging move with accuracy < 100** — the more imprecise and the higher
  its rating, the better (Ice Fang 95→~100, Rock Slide 90, Stone Edge 80). Also offsets **HUSTLE** (−20% acc
  on physical). No imprecise move and no Hustle → **0**. Generally applicable (no speed condition).
- **4.3 Proposed:** `const imp = moveset.filter(m=>m.category!=='STATUS'&&m.accuracy&&m.accuracy<100); if (!imp.length && ability!=='HUSTLE') return 0; const best = Math.max(0,...imp.map(m=>(100-m.accuracy)/100 * m.rating)); let b = 3 + best; if (ability==='HUSTLE') b+=2; return Math.min(7,b) * bestOffensePower * dev;`

**11. Zoom Lens** — accuracy ×1.2, **only if the holder moves after the target** (slow mon).
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** wants a **slow** mon (`speedPower` low) with an **imprecise, powerful** move (Focus Blast
  70, Stone Edge 80, Hydro Pump 80, Fire Blast 85 — "especially ≤85%"). Fast mon → rarely triggers → **0**.
  Anti-synergy with Trick Room (a slow mon moves *first* under TR → lens off) — note, not hard-gated (TR ctx
  not threaded).
- **4.3 Proposed:** `if (speedPower > 0.8) return 0; const imp = moveset.filter(m=>m.category!=='STATUS'&&m.accuracy&&m.accuracy<100); if (!imp.length) return 0; const best = Math.max(...imp.map(m=>(100-m.accuracy)/100 * m.rating)); return Math.min(7, 3 + best*1.3) * bestOffensePower * (1-speedPower) * dev;`

### Group 5 — Flat power boosters

**16. Muscle Band** — physical damage ×1.1.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** a "safe Life Orb" for a **physical attacker** (no recoil, weaker boost). Below Life Orb
  8.5 / Choice Band 9. Dead on special attackers.
- **4.3 Proposed:** `if (baseSpAttack > baseAttack) return 0; return 5.5 * physicalOffensePower * dev;`

**17. Wise Glasses** — special damage ×1.1. *(corpus 1 — Chandelure special attacker)*
- **4.2/4.3:** mirror on `specialOffensePower`, gated to special-leaning mons.

### Group 6 — Turn-order / priority

**18. Quick Claw** — 20% chance to move first.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** RNG pseudo-priority; only marginally useful on a **slow attacker**. Fast mon → useless.
  Capped low (unreliable).
- **4.3 Proposed:** `if (speedPower > 0.9) return 0; return 3 * bestOffensePower * (1-speedPower) * dev;`

**19. Room Service** — −1 Speed on entry, **only under Trick Room**.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** Trick-Room-only tech (a slow mon getting slower moves *earlier* under TR). Requires a TR
  context: the mon's own set has `MOVE_TRICK_ROOM`, or a teammate sets it. Without TR → **0**.
- **4.3 Proposed:** `const tr = moveset.some(m=>m.id==='MOVE_TRICK_ROOM') || ctx.trickRoom; if (!tr) return 0; return 5 * bestOffensePower * dev;`
  *(implementation note: thread a `trickRoom` flag into `selCtx` in resolveTrainerTeam, mirroring the weather/terrain flags).*

**20. Iron Ball** — halve Speed + ground the holder.
- **4.1 Corpus:** 0.
- **4.2 Reasoning:** on the holder's own mon, the only sane use is **Trick Room** (halve own Speed to move
  first under TR) on a slow bulky attacker. Without TR → **0**. Very niche (below Room Service, which doesn't
  hurt outside TR).
- **4.3 Proposed:** `const tr = moveset.some(m=>m.id==='MOVE_TRICK_ROOM') || ctx.trickRoom; if (!tr) return 0; return 3.5 * bestOffensePower * dev;`

**32. Blunder Policy** — +2 Speed when the holder's own move **misses**. *(corpus 1 narrative)*
- **4.1 Corpus:** ~0 held.
- **4.2 Reasoning:** wants a mon with a **low-accuracy damaging move** (≤80 ideal: Focus Blast, Hydro Pump,
  Stone Edge, Inferno, Zap Cannon, DynamicPunch) that benefits from +Speed. A gamble (you'd rather hit). No
  shaky move → **0**.
- **4.3 Proposed:** `const shaky = moveset.some(m=>m.category!=='STATUS'&&m.accuracy&&m.accuracy<=85); if (!shaky) return 0; return 4.5 * bestOffensePowerWithSpeed * dev;`

### Group 7 — Evasion / survival (RNG — kept low)

**21. Bright Powder** — foe accuracy ×0.9.
- **4.1 Corpus:** 0. **4.2:** universal small dodge chance, most value on a stall/bulky mon; luck-based → low.
- **4.3 Proposed:** `return 2.5 * genericDefensePower * dev;`

**28. Focus Band** — 10% chance to survive a KO with 1 HP.
- **4.1 Corpus:** 0. **4.2:** unreliable Focus Sash (10%, repeatable) on a frail attacker; well below Sash
  8.5. **4.3 Proposed:** `return 2.5 * bestOffensePowerWithSpeed / genericDefensePower * dev;` (favours frail
  glass-cannons, capped low).

### Group 8 — Trapping support (gate on a binding move → else 0)

Binding moves: Bind, Wrap, Fire Spin, Whirlpool, Sand Tomb, Clamp, Infestation, Magma Storm, Snap Trap,
Thunder Cage (see `randomizer/docs/trapping.md`). No binding move → **0** for both.

**22. Grip Claw** — binding moves last the full 7 turns.
- **4.1 Corpus:** 0. **4.2:** the stronger trap item (guaranteed duration) on a stall/chip mon with a binding
  move. **4.3 Proposed:** `if (!hasBindingMove) return 0; return 5.5 * genericDefensePower * dev;`

**23. Binding Band** — binding chip 1/8 → 1/6.
- **4.2/4.3:** same gate, slightly lower (`4.5 * genericDefensePower`) — competes with and loses to Grip Claw.

### Group 9 — Protection / utility

**24. Protective Pads** — ignore contact-based effects (Rough Skin, Static, Flame Body, Rocky Helmet…).
- **4.1 Corpus:** 0. **4.2:** a **physical/contact attacker** that fears contact punishment; no stat gain →
  competitively rare → modest. **4.3 Proposed:** `if (baseSpAttack>baseAttack) return 0; return 3.5 * physicalOffensePower * dev;`

**25. Utility Umbrella** — holder ignores weather (boosts + Swift Swim/Chlorophyll/Solar Power/Dry Skin…).
- **4.1 Corpus:** 0. **4.2:** anti-weather counter-tech. **Hard 0** on a weather abuser (`SWIFT_SWIM`,
  `CHLOROPHYLL`, `SOLAR_POWER`, `DRY_SKIN`, `SAND_RUSH`, `SLUSH_RUSH`, `RAIN_DISH`, `HYDRATION`) or a weather
  team (`ctx.sun/rain/sand/snow`). Otherwise low (mostly a metagame pick). **4.3 Proposed:** `if (abuser || ctx.weatherActive) return 0; return 2 * dev;`

**26. Clear Amulet** — prevents opponent-forced stat drops (Intimidate, stat-drop moves).
- **4.1 Corpus:** 0. **4.2:** Intimidate-meta tech → **doubles-aware** (like Covert Cloak/Safety Goggles),
  most valuable protecting a **physical attacker**'s Atk vs Intimidate. **4.3 Proposed:**
  `if (baseSpAttack>baseAttack) return (doubles?3:1)*dev; return (doubles?5.5:2.5) * dev;`

**27. Mental Herb** — one-time cure of Taunt/Encore/Torment/Disable/Cursed Body/Heal Block/Attract.
*(corpus 8)*
- **4.1 Corpus:** **8** — *all* on **Trick Room setters** (Bronzong, Cresselia, Diancie, Jellicent, Oranguru)
  and a **suicide hazard lead** (Mew: SR + Explosion + Taunt, "Mental Herb blocks Taunt"). i.e. a mon with a
  **critical status/setup move that must fire through a faster Taunt**.
- **4.2 Reasoning:** value iff the set carries a move Taunt/Encore/Disable would punish — Trick Room, hazards
  (Stealth Rock/Spikes), screens, or a setup/status move. A pure attacker gets little. Small doubles bump.
- **4.3 Proposed:** `const gate = moveset.some(m=>m.category==='DAMAGE_CATEGORY_STATUS'); if (!gate) return 2 * dev; return (doubles?6.5:5.5) * dev;`
  (optionally weight higher when the status move is Trick Room / a hazard / a screen).

### Group 10 — Misc / low-value

**29. Float Stone** — halve the holder's weight.
- **4.1 Corpus:** 0. **4.2:** almost never worth it (lowers your own Heavy Slam/Heat Crash BP; only reduces
  incoming Low Kick/Grass Knot). Junk. **4.3 Proposed:** `return 1.5 * dev;` (low filler).

**30. Sticky Barb** — 1/8 self-chip, transfers to a foe on contact.
- **4.1 Corpus:** 0. **4.2:** self-negative unless **MAGIC_GUARD** (no self-chip) + a contact move to pass it.
  Otherwise junk. **4.3 Proposed:** `if (ability==='MAGIC_GUARD' && hasContactMove) return 3 * dev; return 1 * dev;`

**31. Metronome** (item) — +20% damage per consecutive use of the same move (up to ×2).
- **4.1 Corpus:** 0. **4.2:** wants a mon that spams **one dominant high-rated move**; broken by
  switching/status → situational. **4.3 Proposed:** `const best = Math.max(0,...moveset.filter(m=>m.category!=='STATUS').map(m=>m.rating)); if (best < SOME_THRESH) return 0; return 4.5 * bestOffensePower * dev;`

---

### Group 11 — Poorly-reasoned handlers (re-derive; remove bare `rng.random()`)

**Eject Button** (premium) — holder switches out when hit (single use). *(corpus 5)*
- **Now:** `10 * rng.random()` (pure random). **Re-derive:** a pivot/escape utility (real, corpus-backed) but
  **not offense-scaled**; mild anti-synergy with a setup set (ejecting wastes the boost). Proposed:
  `if (moveset.some(m=>setupEffects.includes(m.effect))) return 2 * dev; return 5 * dev;`

**Custap Berry** (average) — +priority next move at ≤25% HP. *(user example)*
- **Now:** `(sturdy||endure)?7.5:4` × bestOffensePowerWithSpeed — **base 4 too high** without a trigger.
- **Re-derive:** keep the reliable-trigger value; **drop the no-trigger base 4 → 2**; bump for a suicide-lead
  pattern (a hazard/`EFFECT_EXPLOSION` move + Sturdy → a guaranteed last-ditch layer/boom). Proposed:
  `let b=(isSturdy||hasEndure)?7.5:2; if ((isSturdy||hasEndure) && hasHazardOrExplosion) b+=0.5; return b * bestOffensePowerWithSpeed * dev;`

**Kee Berry** (average) — +1 Def (×2 Ripen) when hit by a physical move.
- **Now:** flat `6 * physicalDefensePower`. **Re-derive:** require a **defensive lean** (else the +1 Def on a
  frail mon is wasted) + berry-synergy bump. Proposed:
  `let b=5; if (hasRipen||hasHarvest||hasCheekPouch) b+=1; if (baseAttack>baseDefense+20) b-=2; return b * physicalDefensePower * dev;`

**Maranga Berry** (average) — +1 SpDef when hit by a special move. Mirror of Kee on `specialDefensePower`.

**Rowap Berry** (average) — chips the attacker when hit by a **special** move (1/8; ×2 Ripen).
- **Now:** `6 * rng.random()` (random). **Re-derive:** passive special-side punish; scale with special bulk +
  Ripen/Harvest. Proposed: `let b=4.5; if (hasRipen||hasHarvest) b+=1; return b * specialDefensePower * dev;`
  (mirror pair with Jaboca).

**Jaboca Berry** (average) — chips the attacker when hit by a **physical** move (1/8).
- **Now:** reasoned handler at [1922](../randomizer/rating.js#L1922) **plus a dead, unreachable duplicate** at
  [1967](../randomizer/rating.js#L1967) (`6 * rng.random()`). The live handler over-values Belch/Natural Gift
  (unrelated to Jaboca's defensive punish). **Re-derive:** **delete the dead duplicate**; align with Rowap:
  `let b=4.5; if (hasRipen||hasHarvest) b+=1; return b * physicalDefensePower * dev;`

**Mirror Herb** (average) — copies the opponent's stat boosts (single use).
- **Now:** `7 * rng.random()`. **Re-derive:** an offensive tech that shines in **doubles** (copy a partner's/
  foe's boost); reactive/situational in singles. Proposed: `return (doubles?6*bestOffensePower:3) * dev;`

**Adrenaline Orb** (average) — +1 Speed when the holder is Intimidated.
- **Now:** `5 * rng.random()`. **Re-derive:** pure **Intimidate-meta / doubles** tech on a physical attacker.
  Proposed: `if (doubles && baseAttack>=baseSpAttack) return 4.5 * dev; return 1.5 * dev;`

**Red Card** (average) — forces the attacker to switch out when the holder is hit (single use).
- **Now:** `7 * rng.random()`. **Re-derive:** defensive phazing/disruption on a **bulky** mon that survives the
  hit; not offense-scaled. Proposed: `return 4.5 * Math.min(1.5, genericDefensePower*1.2) * dev;`

**Eject Pack** (average) — switches the holder out when any of its stats is lowered (single use).
- **Now:** flat `2.5`. **Re-derive:** synergy with a **self-lowering strong move** (Overheat, Draco Meteor,
  Leaf Storm, Close Combat, Superpower, V-create, Fleur Cannon…) → nuke then auto-pivot. Proposed:
  `const combo = moveset.some(m=>selfLoweringMoves.includes(m.id)); if (combo) return 6 * bestOffensePower * dev; return 2.5 * dev;`

---

### Cross-cutting implementation notes (for the coding phase)

1. **Trick Room context.** Room Service & Iron Ball need a `trickRoom` flag in `selCtx`
   (`resolveTrainerTeam.js`), mirroring the existing weather/terrain flags — a teammate or the mon's own set
   carrying `MOVE_TRICK_ROOM`. Small, isolated addition.
2. **Weather-active context for Utility Umbrella.** Reuse the existing `ctx.sun/rain/sand/snow` selCtx flags.
3. **Shared move lists.** New constants (`bindingMoves`, `selfLoweringMoves`, `hazard/Explosion` set) live
   next to the existing `highCritMoves` / `punchingMoves` / `healingMoves` tables in `rating.js`.
4. **Dead code.** Remove the unreachable second `Jaboca Berry` branch at rating.js:1967.
5. **Deliberately-disabled items (Group C).** The weather rocks & Terrain Extender `return 0` is **correct** —
   they are preset in teambuilding ([resolveTrainerTeam.js:435](../randomizer/modules/resolveTrainerTeam.js#L435)
   & [:445](../randomizer/modules/resolveTrainerTeam.js#L445), T-125). This task will **replace the misleading
   `@TODO For now these won't be used` comment** at [rating.js:1676](../randomizer/rating.js#L1676) with an
   accurate one, and leave the behaviour untouched.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Reviewed the selector (`rateItemForAPokemon` + `resolveTrainerTeam` caller).
  Probed every used-pool item and produced the objective classification above: 32 untreated items (all in
  `averageItemPool`), 10 poorly-reasoned handlers, 5 deliberately-disabled. Extracted full corpus item-usage
  counts from `corpus.json`.
- **2026-07-21** — Owner scope decisions: (1) re-derive **all 10** poorly-reasoned handlers; (2) Group C
  weather rocks + Terrain Extender are **set in teambuilding** — verified against `resolveTrainerTeam.js:435`
  & `:445` (T-125); only the misleading comment gets fixed, no behaviour change; (3) **analysis-first** — full
  per-item report before any code.
- **2026-07-21** — Wrote the full per-item Report (§ Report): 4.1 corpus / 4.2 reasoning / 4.3 proposed
  criterion for all 32 untreated + 10 poorly-reasoned items, grounded in the corpus contexts (Figy → bulky
  Incineroar/Ferrothorn recovery; Mental Herb → Trick-Room / suicide-lead anti-Taunt; Wise Glasses →
  Chandelure special) and calibrated against the existing handler magnitudes. **Awaiting owner review of the
  criteria before implementing (TDD).**
- **2026-07-21** — Owner approved the report ("Love the work. Implementa."). Implemented via TDD:
  - **Red:** added 21 tests to `rateItemForAPokemon.test.js` (self-contained `mon()` builder + move stubs);
    watched all 21 fail for the right reasons (assertion, not import).
  - **Green:** in `rating.js` added a `ctx` param + a `bindingMoves` set; added dedicated handlers for the 32
    untreated items (grouped, each hard-zeroed on the mons it's useless on); re-derived the 10 poorly-reasoned
    handlers and **removed the dead duplicate Jaboca branch**; fixed the misleading `@TODO not used` comment on
    the weather rocks / Terrain Extender to point at the T-125 teambuilding preset paths (behaviour unchanged).
  - Threaded a `trickRoom` flag into `selCtx` in `resolveTrainerTeam.js` and passed `selCtx` to the rater
    (for Room Service / Iron Ball; also reuses the existing weather flags for Utility Umbrella).
  - Documented the per-item criterion table in `randomizer/docs/items.md`; added a `[Unreleased] > Changed`
    changelog line.
  - Full suite green (1426 passed, 20 skipped); probe confirms **0** untreated used-pool items remain.
  - **Not closing** — in-game effect is only observable in a built ROM (no local GBA toolchain); awaiting the
    owner's manual test / batch verification before moving to `done`.

## Outcome

<!-- Filled when closing. -->
