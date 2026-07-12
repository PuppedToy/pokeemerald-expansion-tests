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

## Outcome
