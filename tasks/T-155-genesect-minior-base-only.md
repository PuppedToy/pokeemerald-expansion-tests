---
id: T-155
title: Re-enable Genesect and Minior as base-form only
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [randomizer/parser.js, randomizer/rating.js, randomizer/modules/pokedexModule.js, randomizer/constants.js]
blocked-by: [T-153, T-154]
---

# T-155 — Re-enable Genesect and Minior as base-form only

## Context

Two families that expose only their base form (owner items 4 and 8). Both are macro-defined, so they
depend on T-153.

- **Genesect** (`P_FAMILY_GENESECT`): base `SPECIES_GENESECT` only, ever. The four Drive forms
  (Douse/Shock/Burn/Chill) are ignored; **Drives are not available in this game**. The Drives live in
  `items.js` `drives` (commented "Probably not randomized") — confirm they're never placed.
- **Minior** (`P_FAMILY_MINIOR`): base (Meteor) form only, wild and trainers; strip the 7 colors to
  one. Special rating question: in battle Minior enters as the bulky Meteor shell (HP60/Atk60/Def100/
  Spe60/SpA60/SpD100, status-immune via Shields Down) and flips to the Core glass-cannon (HP60/Atk100/
  Def60/Spe120/SpA100/SpD60) at <50% HP. So the placed Meteor form must be **rated for its Core form**,
  analogous to the existing Palafin (place Zero, rate as Hero) / Wishiwashi special-cases.

## Plan

**Genesect:** add `P_FAMILY_GENESECT` to `COSMETIC_FAMILIES` (keep-first-per-natDexNum → keeps base,
drops Drives) — the base is the first entry. Remove from `REMOVED_FAMILIES`. Verify Drives are not in
any placed item pool.

**Minior:** keep `SPECIES_MINIOR_METEOR_RED` (placeable) and `SPECIES_MINIOR_CORE_RED` (parsed but
banned from picking — the rater needs its stats); remove the other 6 meteor colors and 6 core colors
via `REMOVED_SPECIES` (Minior can't use the natDex strip — that would drop the Core we need). Then
replicate the Palafin pattern (documented in T-153 investigation):
- constants: `MINIOR_METEOR_ID`, `MINIOR_CORE_ID`.
- `rating.js`: `miniorEffectivePoke(meteorPoke, corePoke)` — keep Meteor identity, swap in Core stats
  and typing (no level gate; Shields Down is automatic). Export it.
- `pokedexModule.js`: rate Meteor via `miniorEffectivePoke` in the absolute (near the Wishiwashi/
  Palafin block) and contextual passes.
- `wildModule.js` `BANNED_SPECIES_FOR_PICKING`: add `SPECIES_MINIOR_CORE_RED`.
- `writer.js` / `writerDocs.js`: capture the Core form before the ban filter strips it.

**Owner validation gate:** before coding Minior's rating, present the rating approach (rate purely as
Core, vs a blend that credits the Meteor setup turn / status immunity, vs a small nerf for the
50%-HP flip cost) and get the owner's choice. Per the project's research-first rule, do not code the
Minior rating until confirmed.

Owner decision (2026-07-18): rate Minior as a **weighted blend of Meteor + Core** (Meloetta-style),
crediting the bulky status-immune setup turn AND the Core sweeper payoff. Weights: Meteor 0.45 / Core
0.55 (Core-favoured — it is the real battler). Applied to both the absolute rating/tier and the
per-level contextual ratings (so the teambuilder, which scores on contextualRatings, actually fields it).

Acceptance criteria:
- [x] Genesect surfaces base only; no Drive forms parsed/placed; Drives never given as held items
      (`items.drives` has no consumer).
- [x] Minior surfaces `METEOR_RED` only as placeable; other colors + all Cores absent from teams/docs
      (`CORE_RED` banned from picking; other 12 colors in `REMOVED_SPECIES`).
- [x] Minior rated via the owner-approved blend — verified: Core UU 7.61, placed Meteor RU 6.83 (blend),
      contextual blended too.
- [x] New unit tests (Genesect base-only, Minior absolute + contextual blend, Core banned);
      `cd randomizer && npm test` green (1263). Pipeline `node analyze.js --no-balance` exits 0.

## Progress log

- **2026-07-18** — Task created. Minior rating approach flagged for owner validation before coding.
- **2026-07-18** — Genesect: added `P_FAMILY_GENESECT` to `COSMETIC_FAMILIES` (keeps base, drops the
  4 Drive forms); confirmed `items.drives` is never consumed, so Drives are already unavailable.
  Minior: removed `P_FAMILY_MINIOR` from `REMOVED_FAMILIES`; kept the Red pair (`METEOR_RED` placeable,
  `CORE_RED` parsed-but-banned) and dropped the other 12 colors via `REMOVED_SPECIES`.
- **2026-07-18** — Owner chose the blend approach. Implemented `randomizer/minior.js`
  (`applyMiniorTierBlend` = absolute+tier, `applyMiniorContextualBlend` = per-cap singles+doubles),
  wired into `pokedexModule` (9c-ter after Meloetta; 11-bis after the contextual pass), banned
  `SPECIES_MINIOR_CORE_RED` from picking. TDD `randomizer/__tests__/unit/minior.test.js`. Verified via
  `analyze.js`: Meteor placed & rated RU (blend of Core UU 7.61 and a low pure-Meteor), Core absent
  from docs/teams, Genesect base only. Full suite green (1263).

## Outcome
