---
id: T-128
title: Favourite Pokémon — a generalizable "preferred ace" resolved first, dropped if it doesn't fit
status: done
type: feature
created: 2026-07-11
updated: 2026-07-13
target-version: 0.8.0
links: [T-107, T-106, T-126, B-029, T-129, T-130, T-131]
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

## Progress Log

### 2026-07-12 — favourite-claim mechanism + gym/E4 migration + mega-gate decision
- Built `modules/favouriteClaim.js` (`resolveFavourites`): a favourite is a species chain; it CLAIMS a
  pool slot of its EXACT tier (or the `{isMega}` slot if a mega), else the standard restriction-bounded
  fallback; never downgrades. Unit-tested (`__tests__/unit/favouriteClaim.test.js`, 6 cases).
- Wired into the resolver via a **dual path** (species-chain favourites → `resolveFavourites`; legacy
  tiered-slot chains → the old prepend). The legacy branch is removed once every trainer is migrated.
- Migrated to the clean pattern (type = trainer restriction `ALLOW_ONLY_TYPES` + `types`; team = full
  preset pool; favourite = signature species only): **gyms** Roxanne/Wattson/Flannery/Norman/Juan, **E4**
  Sidney/Phoebe/Glacia/Drake (E4 have no favourite).
- **Owner decision — boss mega tier-gate lives in the PRESET.** The bare `{isMega}` preset slot (any mega
  of the type) regressed endgame aces (Sidney → Mega Heracross, RU base). Owner chose "gate en el preset
  (preservar)". New `presets.js` `bossMega(tiers)` = gated `{isMega}` + non-mega fallback of the same
  window (trainer type restriction applies to both; difficulty never shifts it). Applied: gyms
  Wattson/Flannery/Norman/Juan → ≤OU; E4 Sidney/Phoebe → [OU, UBERS]; Glacia/Drake → [UBERS]. Verified:
  Sidney now Mega Pinsir (UBERS). Villain/T&L/Winona preset mega slots stay bare pending their migration.
- Gates green (14/14 determinism + continuity); fast suite 959.
- **Still on the legacy path (pending):** Winona, Brawly, Tate&Liza, all villains (Maxie ×3/Archie/Matt/
  Shelly/Tabitha ×2/grunts), Steven (needs a mega slot added to CHAMPION_STEVEN + continuity), Wally
  (keep NO_REPEATED), rival (starter favourite). Then strip hardcoded `type:`, delete the dual path +
  `FAVOURITE_*_TIERS`/`TATE_BUDGET_TIERS`/misused `*_POKEDEF_*_MEGA` helpers.

### 2026-07-12 (cont.) — Winona/Brawly/T&L + all villains migrated; Steven/Wally paused for a decision
- **Winona**: Flying restriction; favourite `['SPECIES_ALTARIA_MEGA','SPECIES_ALTARIA',{mega}]` — Mega
  Altaria (Dragon/Fairy) has no Flying so base Altaria claims a slot and a themed ≤OU mega fills the
  mega slot (verified: base Altaria + Mega Charizard Y).
- **Brawly**: Fighting restriction; favourite `gymFavourite('SPECIES_HARIYAMA')`. Hariyama is UU at
  Brawly's cap but the BRAWLY pool tops at RU, so it usually drops (too strong) like Roxanne's Nosepass.
  *Tuning note for owner:* to make Hariyama actually appear, widen BRAWLY's top slot to UU.
- **Tate & Liza**: Psychic restriction; dual favourites Solgaleo≫Solrock, Lunala≫Lunatone (legends drop
  to their base counterparts). TR/screens/Focus-Sash gimmick removed. *Item note:* `Room Service` still
  shows on some mons despite `bannedItems` — pre-existing item-assignment quirk, orthogonal to this task.
- **All villains + grunts**: 5 team types (aqua/magma) as a trainer restriction; team = full preset pool.
  Maxie ×3 keep Camerupt-Mega continuity via naming the same favourite (no more REPEAT_ID plumbing).
  **Design choice (flag for owner):** Archie/Maxie-Mossdeep keep their box legendary (Kyogre/Groudon) as
  a SECOND favourite that claims the LEGEND slot — weather now comes from the seed, so the old Damp Rock/
  Heat Rock/Snow-Warning weather-megas are dropped. Matt/Tabitha/Museum-grunts previously had NO type
  restriction — the migration closes that gap. Verified: zero type violations on every villain.
- **Steven + Wally — PAUSED, reverted to the legacy path pending an owner decision.** Migrating them
  surfaced a conflict: the owner's earlier Steven spec was "Mega Metagross, *drops if his mega isn't at
  least OU*" (a TIER-GATED mega favourite), but the redesign's favourite is TIER-BLIND for megas (claims
  the `{isMega}` slot regardless of tier). Forcing Mega Metagross even when it's sub-OU this run (a)
  contradicts that spec and (b) cascaded STEVEN_OU into a regional split line (Goomy→Goodra-Hisui) whose
  devolved echo (Goomy, `P_FAMILY_GOOMY`) is a *different* family id from the ace (`P_FAMILY_GOOMY_HISUI`),
  tripping the continuity family check even though the devolve is semantically correct. **Decision needed:**
  should a mega favourite always claim the mega slot (tier-blind, current model), or drop when its mega is
  below the pool's mega gate (honouring "≥OU or drop")? Both Steven and Wally have this tier-gated-mega
  shape. Everything else is migrated + green (fast 959, determinism + continuity 14/14).

### 2026-07-12 (cont.) — mega gate reworked to story-progression; Steven/Wally migrated; legacy path removed
- **Mega gate = general story-progression rule (owner-validated).** Found the existing base-form logic
  (`BASE_TIER_CAPS` + `maxBaseTier`, applied only to non-boss teams). Reworked `presets.js` `bossMega` to
  take a `megaTier` and emit `{ isMega, absoluteTier: tiersUpTo(megaTier), maxBaseTier: BASE_TIER_CAPS[megaTier] }`
  — the SAME gate, now on boss mega slots, by story stage: ≤Flannery → UU (mega ≤UU, base ≤RU);
  post-Flannery…T&L → OU (mega ≤OU, base ≤UU); post-T&L → UBERS (mega ≤UBERS, base uncapped). Megas are
  NOT difficulty-scaled. `favouriteClaim` extended: a mega favourite CLAIMS the {isMega} slot only if it
  satisfies that gate (evaluated on its BASE form); else it drops. Verified across a run (Flannery→Camerupt
  base NU; Norman→Steelix base UU; Drake→Altaria base OU; etc.).
- **Steven + Wally migrated** (stage-3 `bossMega(TIER_UBERS)` slot added for their favourite to claim;
  Steven excluded from the type restriction, Wally keeps NO_REPEATED). Forcing the signature mega cascaded
  Steven's STEVEN_OU into a regional split line (Goodra-Hisui) whose devolved echo (shared-base Goomy) is a
  different family id — the continuity is semantically correct (Goomy IS Goodra-Hisui's baby), so the
  reverse-order test now **collapses regional suffixes** for the "same line" check (echoes are ID-locked, so
  no false match). Rival needs no migration — its starter is a `TRAINER_POKE_STARTER_*` special + T-106
  continuity id, never the favourite mechanism.
- **Legacy dual-path removed** + all dead helpers/consts deleted (stevenFavourite, wallyFavourite,
  tateAndLizaFavourite, FAVOURITE_*_TIERS, TATE_BUDGET_TIERS, the absolute-tier / mega POKEDEF helpers).
  Only Steven's intentional `type: [championMainType]` signature slots remain hardcoded (his explicit
  "goes by slots" exception).
- **Status: implementation complete on `feature/T-118-crystallize-by-fit`. Fast suite 960, determinism +
  continuity gates 14/14.** Awaiting owner manual test to close. Open tuning notes for the owner: Brawly's
  Hariyama (UU) never fits the RU-topped BRAWLY pool → widen its top slot if he should field it; T&L's
  `Room Service` item still assigned despite `bannedItems` (pre-existing item quirk).

## Outcome

**Done — owner-reviewed and accepted (2026-07-13).** One unified favourite mechanism
(`modules/favouriteClaim.js`) across every character trainer: a favourite is an ordered SPECIES chain
that CLAIMS a slot from the difficulty-scaled preset pool (its exact tier, or the `{isMega}` slot gated
by the general story-progression mega rule — evaluated on the base form — if it is a mega), resolved
first, dropping to the trainer's type-restricted fallback when it doesn't fit; never downgrading.
Migrated: all 8 gyms, the 4 E4, Tate & Liza (dual favourite), every villain + grunt (villain-type
restriction; Archie/Maxie keep their box legendary as a second favourite), Steven and Wally. Trainer
types became a single trainer-level restriction (per-slot `type:` hardcoding removed except Steven's
deliberate signature slots). The mega tier-gate moved into the presets (`bossMega`, reusing
`megaTier` + `maxBaseTier`). Legacy dual-path and all dead helpers/constants removed. Brawly's favourite
is Hariyama ≫ Makuhita (pre-evo fallback).

Verified: fast suite 960, continuity + determinism gates green; owner manually reviewed two bundles.

**Follow-ups spun off from the owner's review (T-128 closed, work delegated):**
- **B-029** (fixed) — the reverse-order build hoist had leaked into the docs display order.
- **B-030** (open, critical) — a trainer can teach a TM the player couldn't have accessed yet
  (Wattson's Oricorio had Volt Switch); incremental-bag investigation.
- **T-129** — coherent item+move co-assignment (Steven's Solgaleo: Choice Specs + Stealth Rock).
- **T-130** — decision-log auditability (sophistication effect, dropped modifiers, unmet gimmicks).
- **T-131** — villain weather-forcing (rain/snow/sun/sand + general fallback) + audit.
