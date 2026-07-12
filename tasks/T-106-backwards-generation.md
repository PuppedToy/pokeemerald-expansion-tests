---
id: T-106
title: Engine — backwards generation (endgame-first, devolve preserving ID continuity)
status: in-progress
type: feature
created: 2026-07-09
updated: 2026-07-11
target-version: 0.8.0
links: [T-083, T-103, T-104, T-105, T-107, T-108, T-128]
---

# T-106 — Engine — backwards generation (endgame-first, devolve preserving ID continuity)

## Context

Per ADR-016, produce the endgame teams first (max sophistication) and derive earlier trainers by
devolving mons, so a rival's/boss's identity is consistent across the game. The current
`TRAINER_REPEAT_ID` / `evolutionTier` / `devolveToBase` machinery (`modules/utils.js`,
`trainerSelector.js`) is the raw material to generalize.

**Why last→first order (owner, 2026-07-10):** the whole trainer set is generated in **reverse game
order — the last trainer (Champion) first, the first trainer (Route 103) last**. A team is **not**
built backwards internally; the per-team build (T-107) is always the same. The reverse *order* exists
so that a **recurring character's final, well-built teams are already decided before we build their
earlier appearances.** Today the engine runs the other way (Route 103 → Champion): it drops a random
mon on the Route 103 rival and evolves it forward, so an early random pick drives the late team. We
invert that — build the Champion / final rival teams first (well-built), so when we reach the Route
103 rival the roster is already known and the early appearance simply uses **the most-evolved form
each of those final mons is allowed at that level** (base forms early, fully evolved late). Example:
Champion Steven's aces → their earlier evo stages at Granite Cave `TRAINER_STEVEN`. It is better that
the *early* appearance carries this constraint, since it matters less that an early team is strong.

## Plan

- Generate **all trainers in reverse game order (last → first)**. The per-team build (T-107) is
  identical regardless of position; only the *order* changes.
- For **recurring characters** (rival May/Brendan, Steven), the latest/strongest appearance is built
  first and owns the roster. Each **earlier appearance reuses that same roster**, showing each mon at
  the **most-evolved form its level cap allows** (earlier evo stages early on) — a coherent earlier
  snapshot of the final team, not a fresh random team. (Generalizes today's `TRAINER_REPEAT_ID` /
  `evolutionTier` / `devolveToBase`.)
- **Non-recurring trainers** are built independently in that same order at their local sophistication
  (T-105); the order does not change their result — only recurring-character continuity depends on it.
- Preserve determinism (per-slot reseed) so shared-trainer ROMs and docs still match.
- Keep at-most-one-mega and family-dedup invariants.
- Tests: a recurring line is consistent across appearances at level-appropriate evo stages (Champion
  Steven ↔ Granite Cave Steven); the latest appearance is the authoritative/strong one; determinism
  holds across shared ROMs.

Acceptance criteria:
- [ ] Generation runs endgame→early; continuity mons devolve consistently per appearance.
- [ ] Determinism and one-mega/family-dedup invariants preserved.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Investigated the current continuity machinery (blocked-by T-105 now done). Map of
  the raw material to invert:
  - **`storedIds`** (`modules/resolveTrainerTeam.js`) — a per-run map populated *in processing order*:
    `storedIds[def.id] = chosenMon.id` (resolveTrainerTeam.js:181-182). It is the continuity channel.
  - **`TRAINER_REPEAT_ID`** (`modules/trainerSelector.js:152-153`) — a `special` slot that *reuses*
    `storedIds[def.id]` instead of picking fresh. Rival later-appearance slots use it (`trainers.js`
    ~485-550), with a higher **`evolutionTier`** (`trainerSelector.js:211-212`) so today the reused
    mon is shown **evolved forward**. → The EARLIEST appearance is authoritative; later ones repeat.
  - **`devolveToBase`** (`modules/utils.js:56-125`) — walks a mon down its evo line (mega-aware,
    LC/solo-aware); used today for gym3/slateport rewards. The generalizable devolution primitive.
  - **Determinism:** per-slot reseed keys off `trainer.id + ':' + slotIndex` only, so **non-recurring
    teams are order-independent** (reversing the loop leaves them byte-identical). Only the
    recurring-character channel depends on order.
  **The inversion required (not just "reverse the loop"):** (1) iterate trainers **last→first** so the
  strongest appearance is built first; (2) make the **latest** appearance authoritative (real pick +
  store) and **earlier** appearances the repeats — today's data encodes the *earliest* as
  authoritative, so this needs a trainers.js data change and/or authority-by-latest-appearance logic;
  (3) flip `evolutionTier`'s effect from evolve-forward to **devolve to the most-evolved form the
  earlier appearance's level allows** (generalize `devolveToBase` to "devolve to level-appropriate
  stage"). This **changes output** for recurring characters (rival/Steven) by design — champion-driven
  rosters instead of Route-103-driven — while the cross-ROM determinism gate (ROM↔ROM identity) must
  still hold. Distinct risk class from T-104/T-105 (those were output-neutral); to be executed as its
  own focused pass with the determinism gate + new continuity tests (Champion Steven ↔ Granite Cave
  Steven at level-appropriate evo stages) as the guardrails. Design itself is settled (ADR-016 §4,
  owner-validated) — no open fork. Plan de-risked; ready to implement.
- **2026-07-10 (sequencing decision — owner delegated "elige lo que funcione mejor")** — Deeper
  analysis showed the continuity inversion is **inseparable from the new engine and cannot be built
  cleanly before it**:
  - The devolution of the *stage* is already handled today (store base form + `tryEvolve` forward per
    level → Route 103 baby, Ever Grande evolved). The owner's real ask is **where the ROSTER
    COMPOSITION is decided** — at the strongest/latest appearance under **full sophistication** (the
    T-107 build), not at Route 103 under early constraints — then projected backward.
  - Making the latest appearance authoritative only has value once T-107's sophistication-weighted
    build exists to produce a *well-built* endgame roster; doing it on the current fill logic would
    produce a throwaway roster T-107 reworks anyway.
  - Reverse iteration order alone **breaks** current continuity (per-slot reseed → a later-processed
    authoritative slot leaves earlier REPEAT slots reading an empty `storedIds`), and T-107 **migrates
    trainer definitions from slot tables to preferences**, changing the very model
    (`TRAINER_REPEAT_ID`/`evolutionTier`) this task would edit — editing it now = editing it twice.
  **Decision:** re-sequence to **T-107 → (T-106 + T-108)**. T-107 (the heart) lands first and exposes
  the hooks continuity needs (build-a-trainer-at-a-given-sophistication + a `storedIds` continuity
  channel on the new engine). T-106 then layers reverse-order generation + authoritative-latest roster
  + devolution on the *final* engine, alongside T-108 (fixed-ID special cases) — the same continuity
  concern. `blocked-by` → T-107; status back to `proposed` (the investigation above stands as
  groundwork). No throwaway, no double-edit of the trainer data model. ADR-016 §4 design unchanged.
- **2026-07-11 (owner-validated continuity spec — unblocked, T-107 landed)** — Owner detailed the full
  continuity behaviour; set `in-progress`. Specifics to implement (alongside T-128 favourite + T-108):
  - **Reverse-order generation (last→first).** Recurring characters (rival, Steven, Wally) build their
    final, well-built roster first; earlier appearances reuse it **devolved to the most-evolved form the
    level allows** (`devolveToBase`, generalized to a level cap).
  - **Rival special case:** the **evolved starter** is a mandatory slot **known from the start** (it is
    the rival's *favourite*, T-128) + a **mandatory legendary** slot + a small **route pool** + the rest
    **free slots** filled by the engine. The starter constraint is known up-front (not derived from a
    late random pick).
  - **Steven:** **REMOVE** the Granite Cave max-tier restriction — instead take his final (well-built)
    roster and **devolve each mon until legal** for the Granite Cave level. Favourite = Metagross (T-128).
  - **Wally:** **fully backwards** — final team well-built (Victory Road / champion-tier), devolved down
    to his Mauville (catching-tutorial) appearance. Add a **no-repeated-types** restriction to his team.
    Favourite = Mega Gardevoir / Mega Gallade (T-128).
  - **Logging (T-117):** the decision log must clearly show, per mon, **what is inherited by ID**, **how
    it is devolved** (final form → shown form), and **which mons were chosen by restriction** (favourite,
    legendary, route pool, type lock), because backwards continuity is the riskiest path.
  - **Re-evaluate hard restrictions** encountered along the way (Steven's tier cap is the first) and
    soften them toward disappearing — prefer devolve-until-legal over hard tier caps.
  - Favourite-Pokémon concept split into its own task **T-128** (resolved FIRST, before budget slots).

## Outcome

<!-- Filled when closing. -->
