---
id: T-109
title: Engine — doubles teambuilding path (spread / redirection / TR-aware)
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-15
target-version: 0.8.0
links: [T-083, T-097, T-102, T-107, T-111]
blocked-by: []
---

# T-109 — Engine — doubles teambuilding path (spread / redirection / TR-aware)

## Context

When a trainer's battle type is doubles (from Group 1), the engine should build a doubles-shaped team:
consume the doubles rating/tiers (T-097) and the doubles archetype model (T-102), so redirection
support, spread attackers, Trick Room cores, weather cores, Fake Out leads, etc. are actually
assembled — not just a singles team fought in a doubles slot.

## Plan

- Add a doubles branch to the preference/scoring engine that selects rating and archetype data by
  battle type, and biases toward doubles-viable cores (spread + redirection, TR + slow attackers,
  weather + abuser) per sophistication.
- Regenerate the Run & Bun E4 doubles teams (T-089's flagged seam) with the doubles engine.
- Ensure the singles path is unaffected when battle type is singles.
- Tests: a doubles trainer's team reflects doubles archetype logic (e.g. includes a redirector +
  spread attacker at high sophistication); singles trainers unchanged.

## Doubles path plan — mirror of the singles work (added 2026-07-11)

Good news: the engine is **already format-agnostic** (built in T-107/T-118/T-121 for singles).
`resolveTrainerTeam` selects `getArchetypeModel('doubles')` by `battleType`, and the detectors +
crystallize-by-fit + role-refinement all read whichever model. So once **T-102** (doubles recipes +
corpus-validated doubles detectors) lands, doubles trainers largely "just work". Remaining doubles-
specific steps, in order:

1. **Prereqs:** T-102 (validated doubles slot recipes, from the expanded DOU 6v6 corpus — workflow
   running in parallel) + T-097 (doubles tiers / `ratePokemonDoubles` feed the doubles power budget).
2. Confirm the doubles-only detectors (spread / redirection / intimidate / fakeOut / tailwind / wideGuard
   / perishSong) are corpus-validated and firing realistically (this is T-102 step 2 — T-118-for-doubles).
3. Wire nothing new for the general engine (format-agnostic already); just verify a high-soph **doubles**
   trainer crystallizes a doubles archetype (e.g. Intimidate/Fake Out bulky offense) and delivers its
   roles, measured with the T-117 decision log.
4. Regenerate the **Run & Bun E4 doubles** teams (T-089 seam) through the doubles engine.
5. Verify **singles trainers are byte-identical** (the doubles path only affects `battleType` doubles);
   determinism gate green.
6. Then doubles seed assignments (the singles-style per-trainer leans) for doubles trainers.

> **Meta-analysis validation (owner-gated).** Every Pokémon-meta conclusion in this task — the
> competitive value of a move / ability / item / tier / archetype, or a "what trainers prefer" rule —
> must be **explicitly validated by the owner before it is implemented**, not merely derived from the
> research corpus (which is partly 4v4 VGC, whereas our doubles are 6v6). Any such value/mapping is
> provisional until the owner validates it.

Acceptance criteria:
- [ ] Doubles trainers get doubles-shaped teams (doubles rating + archetype), scaling with sophistication.
- [ ] Run & Bun E4 doubles teams are regenerated with the doubles engine.
- [ ] Singles trainers are unaffected by the doubles path.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-15 — wiring map (code-verified).** The engine is already format-agnostic: `resolveTrainerTeam.js:166`
  selects `getArchetypeModel('doubles')` by `battleType`, and `scoreCandidate`/detectors are role-only (no
  rating read) — so doubles SHAPE (roles) already works. The gap is the tier "power budget": which mons a
  slot admits. T-097's fields are FLAT (`poke.tierDoubles` / `poke.ratingDoubles`), so `p.rating.tier` →
  `p.tierDoubles`, `p.rating.absoluteRating` → `p.ratingDoubles`. Routes (battleType-gated):
  - `trainerSelector.js:185` absoluteTier gate → `tierDoubles`; `:299` sort → `ratingDoubles`. **Unblocked.**
  - `favouriteClaim.js:57/44/48` absolute claim + mega gate → `tierDoubles` (thread battleType into the
    resolveFavourites ctx at `resolveTrainerTeam.js:509`). **Unblocked.**
  - `gimmickPlan.js:106/267/324` gimmick abuser-rank base → `ratingDoubles` (secondary).
  - `trainerSelector.js:196-204/126-131/297` CONTEXTUAL-tier slots → **BLOCKED** (no `contextualRatingsDoubles`;
    deferred to T-111). Affects early gyms/grunts/rivals only.
  - Calibration was proportion-matched, so a (singles-labelled) "UU slot" admitting a `tierDoubles==UU` mon is
    coherent (same top-fraction in each format).
  - E4 `_DOUBLES` clones (`trainersModule.js:38-59`) are 100% absoluteTier → the cleanest UNBLOCKED target;
    "regenerate with the doubles engine" = route their tier reads to the doubles scalars (no new slot defs).
- **2026-07-15 — IMPLEMENTED (absoluteTier path).** Routed the power budget to the doubles scale, battleType-
  gated, singles byte-identical: `trainerSelector.js` gained `pokeTier`/`pokeAbs` helpers (doubles →
  `tierDoubles`/`ratingDoubles`) used by the absoluteTier gate + the pickBest sort + the mega maxBaseTier gate;
  `favouriteClaim.js` claims by `tierDoubles` for a doubles trainer (battleType threaded into the ctx via
  `resolveTrainerTeam.js:509`); contextual-tier reads left on singles (T-111). +2 favouriteClaim doubles tests.
  **Verified (seed 2920625670, mixed + Run&Bun):** Sidney Doubles → hyper_offense +redirection w/ a Tailwind
  setter (vs singles fast-priority); Drake Doubles → balance_dual_mode +redirection w/ spreadAttacker +
  Tailwind + redirector (Excadrill/Gastrodon) (vs singles emergent-sun) — doubles archetypes + roles + tiers
  all firing, distinct from the singles teams. `npm test` 1082; determinism + continuity gates 17/17 (singles
  unchanged). Deferred: contextual-tier doubles slots (T-111), the gimmick abuser-rank base → ratingDoubles
  (secondary), and doubles seed assignments (step 6). `doubles.json` recipes remain v1 (T-102 refinement).

## Outcome

<!-- Filled when closing. -->
