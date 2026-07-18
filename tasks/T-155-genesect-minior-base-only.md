---
id: T-155
title: Re-enable Genesect and Minior as base-form only
status: proposed
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

Acceptance criteria:
- [ ] Genesect surfaces base only; no Drive forms parsed/placed; Drives never given as held items.
- [ ] Minior surfaces `METEOR_RED` only as placeable; other colors + all Cores absent from teams/docs.
- [ ] Minior rated via the owner-approved special-case (Meteor rated for Core).
- [ ] New unit tests (Genesect base-only, Minior effective-poke rating, Core banned-but-rated);
      `cd randomizer && npm test` green.

## Progress log

- **2026-07-18** — Task created. Minior rating approach flagged for owner validation before coding.

## Outcome
