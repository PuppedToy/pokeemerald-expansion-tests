---
id: T-128
title: Favourite Pokémon — a generalizable "preferred ace" resolved first, dropped if it doesn't fit
status: in-progress
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-107, T-106, T-126]
priority: high
---

# T-128 — Favourite Pokémon (preferred ace)

## Context

Owner (2026-07-11): trainers with character (gym leaders, villains, rival, Wally, Steven) have a
**favourite Pokémon** — a preferred ace they **build the team AROUND first**, before spending budget
slots — used whenever it fits their restrictions (type + tier budget), given priority, and **dropped**
if it can't fit (same intent→materialise-or-drop dynamic as seeds/gimmicks, T-124/T-126). This must be
a real, **generalizable CONCEPT in code**, not an ad-hoc special case.

## Plan

- **Data model:** `trainer.favourite` = an ordered array of MATCHERS (priority high→low). Each matcher:
  `{ species?, mega?:bool, mustHaveTypes?:[...], mustHaveOneOf?:[...], tier?:[...], requireEvolutions?:bool }`.
  The resolver walks the list and takes the FIRST matcher that yields a legal pick within the trainer's
  restrictions (type lock + tier budget). If none → the favourite is dropped (normal team).
- **Resolution FIRST:** at the start of `resolveTrainerTeam`, resolve the favourite into slot 0 (the
  ace), reserving it, THEN fill the rest normally (archetype/seed). The ace is **perfect breed**
  (T: breed tiers below).
- **Per-trainer favourites (owner-validated):**
  - **Archie** (type-locked to the 5 *aqua* types): Sharpedo(mega) ≫ mega WATER+DARK ≫ mega WATER + another
    aqua ≫ mega DARK + another aqua ≫ mega of any aqua type ≫ any mon with an aqua type.
  - **Maxie** (type-locked to the 5 *magma* types): Camerupt(mega) ≫ same chain over magma types (FIRE+GROUND…).
  - **Steven:** Metagross(mega, Uber) ≫ mega of his type with evolutions (Uber) ≫ Metagross(mega, OU) ≫
    mega of his type with evolutions (OU). Drops if his mega isn't at least OU.
  - **Wally:** Gardevoir/Gallade(mega, Uber/OU) ≫ any other Uber mega. Least restrictive — almost every run.
  - **Gym leaders:** the assigned mon in the assigned tier ≫ a mon of their type in the assigned tier
    (still attempted even if the type rolled changes — in case it matches / is multitype).
  - **Rival:** the (evolved) starter is the favourite (see T-106 rival special case).
- **Breed tiers:** the favourite / ace = **perfect** breed (as gym leaders had); other rival/Wally mons
  = **good** breed. Keep the existing breed logic.
- **Logging (T-117):** the decision log records the favourite chosen (and via which matcher / by
  restriction), so the ace pick is auditable.

> **The "5 aqua / 5 magma types" are already canonical in the codebase** (`trainers.js`
> `AQUA_DEFAULT_TYPES` = Water, Dark, Poison, Ice, Flying; `MAGMA_DEFAULT_TYPES` = Fire, Ground, Rock,
> Grass, Fighting — both config-overridable via `aquaTeamTypes`/`magmaTeamTypes`). Sharpedo = Water/Dark
> = `aquaTeamTypes[0]/[1]`; Camerupt = Fire/Ground = `magmaTeamTypes[0]/[1]` — matching the owner's
> "default water/dark" and "default fire/ground". Favourite matchers reference these arrays (config-aware),
> so no guessing / no new type lists.

### Implementation shape (validated by the existing code)

A `favourite` is just an **ordered array of standard `trainerMonDefinition`s** (priority high→low) — every
matcher the owner described maps to an existing selector filter (`specific`/`specificIfTier`, `isMega`,
`megaTier`, `exactTypes` [has ALL], `type` [has ANY], `absoluteTier`, `evoType`, `checkValidEvo`). So the
favourite reuses ALL existing machinery; the selector gains one thin branch (`favouriteChain`: walk the
list, first matcher with a non-empty pool wins, else drop) and the resolver prepends it as slot 0.
RNG-clean: an empty matcher consumes no draw (returns before the pick), the winner consumes exactly one —
same as any slot — and slot 0 is reseeded, so the pre-loop favourite probe never shifts the stream.

Acceptance criteria:
- [ ] `favourite` is a generalizable data concept + a resolver step (not special-cased per trainer).
- [ ] Each listed trainer resolves its favourite first (within restrictions/budget) or drops it.
- [ ] The ace is perfect-breed; determinism gate green; `cd randomizer && npm test` green.

## Progress log

- **2026-07-11** — Created + owner-validated (part of the continuity plan). Sequenced with T-106.
- **2026-07-12** — Implemented the generalizable concept + wired most favourites:
  - **Data model + resolver:** a `favourite` is an ordered array of standard slot-defs; the selector's
    `favouriteChain` branch takes the first that fits (else drops); `resolveTrainerTeam` prepends it as
    slot 0 (perfect breed). `favouriteId` lets a favourite double as a continuity anchor (Steven/Wally/
    rival aces). Unit-tested (favouriteChain 4). Determinism: a `favourite` slot is per-ROM (resolves a
    mega) — the cross-ROM gate's `hasPerRomSlot` recognizes it.
  - **Wired + verified:** Archie (`villainFavourite` Sharpedo chain over aqua types), Maxie (Camerupt over
    magma types), Steven (`stevenFavourite` Metagross Uber≫own-type Uber≫Metagross OU≫own-type OU), Wally
    (`wallyFavourite` Gardevoir/Gallade Uber/OU≫any Uber mega), Rival (evolved starter = the favourite).
  - **Breed:** favourite/ace = perfect; other rival/Wally mons = good (via trainer `breedTier:'good'`).
  - **The 5 aqua/magma types** were already canonical in code (`AQUA_/MAGMA_DEFAULT_TYPES`) — no guessing.
  - **Gym-leader favourites (owner clarified 2026-07-12):** the favourite is simply the gym's existing
    perfect-breed slot's mon (some mega, some not). The rule: keep it if it still meets the trainer's
    restrictions (rolled type + tier budget), else fall to a same-tier mon, drop if its tier is out of
    budget — i.e. the standard favourite fallback chain.
- **2026-07-12 (owner-validated gym spec) — Tate & Liza DONE + fallback algorithm confirmed:**
  - **Fallback algorithm (point 1)** already holds for every existing favourite: villains / Steven / Wally
    / rival chains fall down their rungs and DROP when nothing fits the budget (Steven ends at OU, Wally at
    "any Uber mega", villains at "any themed mon"). Confirmed.
  - **Tate & Liza (points 2 + 3) DONE:** two favourites (Solgaleo ≫ Solrock ≫ Cosmoem ≫ themed-in-budget;
    Lunala ≫ Lunatone ≫ …), budget UBERS/UBERS/OU/OU/UU/RU, standardised (no gymIsChangedType branch —
    every slot type-locked so it adapts to the rolled type). Legends usually drop to Solrock/Lunatone,
    which KEEP their own Light Clay/nature via the new resolver `effectiveDef` item/nature preference.
    Tested (2 gated assertions) + determinism green.
- **2026-07-12 (owner clarification: ONE mechanism for every favourite) — DONE:**
  - **Unified the mechanism.** A favourite is a priority CHAIN materialised as a slot + `fallback`
    (maxTierDownSteps:0) driven by the shared selectWithAutoFallback engine — kept only while it fits the
    ACTUAL (rolled) type + tier budget (so a signature that mutated INTO the rolled type is still
    preferred), else the next rung, else drop; per-rung item/nature/ability preserved via effectiveDef;
    resolved first so the team crystallises around it. `favourite` (single) / `favourites` (several).
    Removed the old selector favouriteChain branch; byte-identical for the existing favourites.
  - **All 8 gym leaders wired** (Roxanne=Nosepass, Brawly=Makuhita, Wattson=Manectric, Flannery=Torkoal,
    Norman=Slaking, Winona, Juan=Kingdra) — no gymIsChangedType ace branch remains. **Winona corrected**
    per owner: Mega Altaria (Dragon/Fairy) doesn't fit her Flying type → Mega Altaria ≫ base Altaria
    (Dragon/Flying) ≫ a mega of the type ≫ a mon of the type.
  - Verified end-to-end (13 gated integration assertions + updated B-019 test); determinism green.
  - **Trainer-exceptions audit reported to owner (2026-07-12)** — catalogued the non-standardised
    exceptions (gimmick-slot gymIsChangedType branches, pokeDef* weather/terrain setters, villain
    legendary slots, retired rng draw, prescribed lead moves/items).
- **2026-07-12 (owner-validated cleanup A/B/D/E) — DONE:** removed the forced weather/terrain scaffolding
  so the gimmick seed drives it: all pokeDef* setters + the 27 forced abuser-ability filters (B); Wattson
  fixed-terrain/Electric-Seed/preventShuffle/bannedItems, Flannery forced Drought/sun-abilities, Norman
  bannedItems (A); Winona Tailwind lead, Tate & Liza Trick-Room/Focus-Sash lead (D); the orphaned rng draw
  (E). Verified the SETTERS still materialise (Archie/Maxie legendaries, Flannery Torkoal→Drought, Tate &
  Liza→Trick Room; Wattson terrain drops on a non-electric roll). **KNOWN GAP:** the weather seed's PICKER
  doesn't bias toward weather-ability mons, so rain/sand/snow SPEED-abusers (Swift Swim/Sand Rush/Slush
  Rush) — previously guaranteed by the removed filters — now emerge only opportunistically, and
  non-legendary weather trainers (museum grunts) can drop the gimmick (no setter source). Recommended
  follow-up: a weather-seed picker bias toward weather-ability mons + a setter guarantee.

## REDESIGN (owner-validated 2026-07-12) — pool-consumption favourites + trainer-level restrictions

The earlier favourite implementation was WRONG on two counts: it baked tier gates into the favourite
(hardcoded `FAVOURITE_*_TIERS` / `TATE_BUDGET_TIERS` / `ABSOLUTE_POKEDEF_*`) and it lived in a separate
`trainer.favourite`/`favourites` field that the difficulty transform (`applyTransform`, applied only to
`trainer.team` in `trainersModule.js`) never touches — so favourites ignored the difficulty slider.
**Everything must come from the presets** (`getBossPreset`), because the difficulty slider only shifts
preset tiers. The correct model:

### A favourite is EXCLUSIVELY a poke (never poke+tier)
Roxanne's favourite spec is just `Nosepass`, not `Nosepass+NU`. It does not predict a tier.

### The pool
A boss's tier pool = its preset slots (`getBossPreset`), already difficulty-scaled by `applyTransform`.
Difficulty touches ONLY the pool. Favourites do NOT scale directly — they CONSUME from the (already
scaled) pool.

### Favourite resolution — 2 dynamic steps, per favourite, BEFORE filling the rest
1. Can I field the favourite (passes the trainer's restrictions) AND does its ACTUAL tier (this run,
   from `pokemonList`) match an AVAILABLE budget slot? → place it, **consume that slot**. Tier match is
   by the pool slot's tier (a mega favourite consumes the `{isMega}` slot). A favourite BELOW the whole
   budget is NOT accepted (favourites never downgrade — unlike teambuilding, where archetype > individual
   quality lets a role downgrade a tier). Above budget (too strong for any slot) also rejects.
2. Else → next fallback, repeat step 1. If NO more fallbacks → the **standard final fallback**: place any
   eligible mon within the trainer's restrictions, consuming a slot. This standard fallback is implicit
   for EVERY favourite of EVERY trainer (do not write it per-trainer).
The remaining pool slots fill the rest of the team normally.

Examples: Roxanne (NU×2 PU×4) + Nosepass(NU) → consumes NU (→ NU×1 PU×4 left). Difficulty −2 (PU×6):
Nosepass(NU) too strong → fallback → a legal Rock mon consumes a PU slot. Tate & Liza (UBERS×2 OU UU RU
Mega): Solgaleo(Legend) rejected → Solrock(RU) consumes RU; Lunala(Legend) rejected → Lunatone(RU) no RU
left → Cosmoem(UU) consumes UU; remaining UBERS×2/OU/Mega fill with normal mons.

### Favourite spec shape
`gymFavourite('SPECIES_NOSEPASS')` — JUST the species chain (+ the implicit standard final fallback). NO
type, NO preset, NO tier passed in. (The current `gymFavourite('SPECIES_NOSEPASS', gymMainTypes[0],
getBossPreset('ROXANNE')[2], getBossPreset('ROXANNE')[2])` is WRONG.)

### Trainer-level restrictions (NOT hardcoded per slot)
Remove the hardcoded `type: [...]` from every slot; type becomes a trainer restriction used in
teambuilding to reduce the pool (the `TRAINER_RESTRICTION_ALLOW_ONLY_TYPES` + `trainer.types` mechanism
already exists in the selector). The restrictions:
- **Wally:** no two mons share a type (`TRAINER_RESTRICTION_NO_REPEATED_TYPE`). Make it **Wally-exclusive**
  — REMOVE it from the rival appearances; it is now correctly implemented (B-027).
- **Villains** (aqua grunts, Shelly, Matt, Archie, magma grunts, Tabitha, Maxie): every mon has ≥1 of the
  villain team's types (`ALLOW_ONLY_TYPES` + `trainer.types = <team types>`).
- **Gym leaders + E4:** every mon has the gym/E4 (rolled) type (`ALLOW_ONLY_TYPES` + `trainer.types`).
  **Champion (Steven) is EXCLUDED** — he goes by slots.

### Code-scan alarms (other restrictions / hardcoded found)
- Restriction infra already exists: `ALLOW_ONLY_TYPES` (+ `trainer.types`), `ALLOW_ONLY_ABILITIES`
  (+ `trainer.abilities`), `MUST_LEARN_TM_MOVES`. Reuse `ALLOW_ONLY_TYPES` for the type restrictions above.
- Hardcoded slot `type:` counts to strip: gymMainTypes ×60, aquaTeamTypes ×22, magmaTeamTypes ×42,
  championMainType ×12, E4 main types ×31.
- `NO_REPEATED_TYPE` currently on the rival appearances (to be removed) + Wally (to keep, exclusive).

### Implementation (supersedes the earlier favourite mechanism)
1. `trainer.team` = the FULL preset pool (restore the ace slots — the favourite CLAIMS a slot, does not
   add one). Difficulty-scaled by the existing `applyTransform`.
2. `trainer.favourite` / `favourites` = ordered species chains only.
3. New resolver step (before the slot loop): resolve each favourite by consuming a pool slot of its actual
   tier (from `pokemonList`), or the mega slot; else next fallback; else the standard restriction-bounded
   fallback. Then fill the remaining pool.
4. Trainer restrictions at the trainer level; strip hardcoded slot types.
5. Delete `FAVOURITE_MEGA_TIERS`, `FAVOURITE_MON_TIERS`, `TATE_BUDGET_TIERS`, and the misuse of
   `ABSOLUTE/CONTEXTUAL_POKEDEF_*` I introduced.

## Outcome
