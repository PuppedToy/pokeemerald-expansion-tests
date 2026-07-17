---
id: T-144
title: Villain mega favourite — type/prevo-aware selection ladder + mascot fallback ladder
status: done
type: fix
created: 2026-07-17
updated: 2026-07-17
target-version: 0.8.0
links: [T-128, T-134, T-106, T-052]
blocked-by: []
---

# T-144 — Villain mega favourite + mascot fallback ladders

## Context

Owner (2026-07-17): `villainFavourite` funciona mal. Today it is the coarse chain
`villainFavourite(aceMega) = [aceMega, { mega: true }]` (`trainers.js:190`):

1. The signature (Sharpedo/Camerupt) claims the `{isMega}` slot merely by having **ANY** team type
   (`passesRestriction`), so a reconfigured Aqua/Magma theme (T-052 `aquaTypes`/`magmaTypes`) keeps
   fielding Sharpedo (Water/Dark) even when Dark is no longer a team type — mega and mascot off-theme.
2. `{ mega: true }` defers the species to the selector, which filters by is-mega + tier window + base cap
   + ALLOW_ONLY_TYPES (ANY), with **no** priority for type 0/1 or for a mascot-viable pre-evolution.
3. The mascot grunts (`TRAINER_REPEAT_ID` + `devolveToLevel`, T-134) have **no fallback ladder** when the
   leader commits no mega or the devolution doesn't fit the grunt.

Owner clarifications (2026-07-17, via questions):
- "que tenga prevos" (rules 2/3/7) = **the mega has a pre-evolution** (its base is NOT `EVO_TYPE_SOLO` — no
  Mega Mawile), so the mascot can devolve to a baby; and that pre-evolution **meets the team restrictions**
  (has a team type) so the devolved mascot stays on-theme.
- The type-0/1 and "monotype 0" tests (rules 2/3, like 1/5/6) are judged on the **mega's own types**.
- Mascot "meets requirements" = the grunt's **standard** slot resolution (ALLOW_ONLY_TYPES + level-legal +
  its own tier budget). **Reuse the existing machinery — no duplicated code.**
- If **no** mega satisfies rules 1–7 (rare): **drop the mega slot** and record a **warning** in the log.

`t0 = types[0]` (team primary), `t1 = types[1]` (team secondary) — `trainers.js:76-98`, `3585-3586`.

## Plan

### A. Villain leader mega favourite — `resolveVillainMega` (in `modules/favouriteClaim.js`)

`villainFavourite(aceMega)` becomes the symbolic chain `[{ villainMega: aceMega }]`. `resolveFavourites`,
on a `{ villainMega }` candidate, resolves the `{isMega}` pool slot against `pokemonList` + `ctx.types` +
the slot's budget gate (`megaPassesGate`). A mega is **eligible** only if it passes the budget gate AND
`passesRestriction` (has a team type). Among eligible megas, pick the first satisfied rung (order below);
within a rung pick deterministically (highest tier, then absoluteRating, then id):

1. `cand === aceMega` AND mega types = {t0, t1}
2. mega types = {t0, t1} AND has a pre-evolution whose base meets team restrictions
3. mega is monotype t0 AND has a pre-evolution whose base meets team restrictions
5. `cand === aceMega` AND mega has t0 among its types
6. mega has t0 among its types
7. has a pre-evolution whose base meets team restrictions

(No rule 4 — owner's numbering.) Claim the slot as `{ specific: chosenMega }` (like a named-signature
favourite; carries the continuity `id`, so `storedIds['ARCHIE_MEGA'/'MAXIE_MEGA']` is written). If **no**
rung yields a mega → **drop** the slot (remove it, claim nothing) and `diag.warn(VILLAIN_MEGA_DROPPED, …)`.

With DEFAULT types, Sharpedo (Water/Dark) / Camerupt (Fire/Ground) satisfy rule 1 → same pick as today.

### B. Mascot grunt — fallback ladder (reuse `selectWithAutoFallback`)

Each mascot grunt slot 0 (`{ special: TRAINER_REPEAT_ID, id, devolveToLevel:true }`) gains a `fallback`
chain built from its OWN preset slot-0 budget (`{ contextualTier:[TIER_NU], checkValidEvo:true }`) + the
resolved team types, so the resolver walks it when the REPEAT/devolve yields nothing:

```
fallback: [ {...gruntBase, exactTypes:[t0,t1]}, {...gruntBase, type:[t0]}, {...gruntBase} ]
```

Priority: (1) the committed favourite devolved (REPEAT primary), else (2) any mon of both team types, else
(3) any mon with type 0, else (4) any mon (grunt restriction applies). Pure declarative wiring over the
existing `fallback` + auto-tier-down engine (`trainerFallback.js`) — no new resolution code.

## Acceptance criteria

- [x] `resolveVillainMega` picks the mega by rules 1,2,3,5,6,7 in order, each gated by budget + restriction;
      unit-tested per rung + ordering + tie-break determinism. (villainMega.test.js, 9 tests)
- [x] Default Aqua/Magma types → Sharpedo Mega / Camerupt Mega chosen (rule 1); no regression.
- [x] No eligible mega → slot dropped + `VILLAIN_MEGA_DROPPED` warning; unit-tested.
- [x] Mascot grunt fields the devolved committed favourite when present, else the type-preference fallback
      ladder; the grunt never crashes / never over-levels.
- [x] `cd randomizer && npm test` green; determinism + continuity gates intact.

## Progress log

<!-- Append-only. -->

- **2026-07-17** — Task created. Mapped the full favourite→slot→REPEAT/devolve pipeline (agent recon) and
  the T-128/T-134 lineage. Owner validated the interpretation via 4 questions (above). Starting TDD.
- **2026-07-17** — Implemented (Red→Green):
  - `modules/favouriteClaim.js` — `resolveVillainMega(aceMega, key)`: the 6-rung (1,2,3,5,6,7) type/prevo
    ladder over eligible megas (budget gate + team-type restriction), deterministic pick (tier→rating→id).
    A new `{ villainMega }` chain candidate drives it; claims the `{isMega}` slot as `specific` (writes
    `storedIds`), or drops the slot + `diag.warn(VILLAIN_MEGA_DROPPED)` when nothing is eligible.
  - `trainers.js` — `villainFavourite = a => [{ villainMega: a }]` (was `[a, {mega:true}]`); new `mascotSlot`
    helper wires each grunt's slot 0 = REPEAT/devolve **+ fallback ladder** `{t0,t1} ≫ {t0} ≫ any` built on
    the grunt's own slot budget (reuses `selectWithAutoFallback`). Both grunts migrated.
  - `diagnostics.js` — `VILLAIN_MEGA_DROPPED` code. `resolveTrainerTeam.js` — thread `diag`/`trainerId` to
    `resolveFavourites`.
  - New unit suite `__tests__/unit/villainMega.test.js` (9 tests, each rung + ordering + budget + drop+warn).
  - `cd randomizer && npm test` → 1179 pass / 18 skip. `RUN_DETERMINISM=1` gates (crossRomBossDeterminism +
    reverseOrderContinuity) → 18/18. Default types still pick Sharpedo/Camerupt (rule 1), no regression.
  - Empirical end-to-end check (throwaway scratch test on the real generator, seed 1830319788, then
    deleted) — leader mega (base+stone) → grunt mascot:
    - DEFAULT aqua (Water/Dark): Archie → **Sharpedo{Sharpedonite}** (rule 1) → Petalburg → **Carvanha**.
    - DEFAULT magma (Fire/Ground): Maxie → **Camerupt{Cameruptite}** (rule 1) → Rusturf → **Camerupt**
      (Numel absent from this seed's pickable pool, so devolveToLevel stops at Camerupt — pre-existing
      devolveToLevel/pool behaviour, unrelated to T-144).
    - RECONFIGURED aqua (Grass/Fairy): Archie → **Venusaur{Venusaurite}** (rule 6, Grass) → Petalburg →
      **Bulbasaur** (on-theme!). The OLD code would have forced off-theme Mega Sharpedo.
    - RECONFIGURED magma (Electric/Steel): Maxie → **Manectric{Manectite}** (rule 6) → Rusturf →
      **Electrike** (on-theme!).
    Anti-regression: the grunt fallback only fires when the REPEAT primary returns null (which previously
    DROPPED the slot → team of 5); RECONFIG proves the REPEAT+devolve primary is intact → strict improvement.
  - Rebuilt the browser bundle (`node build.js`) so the change reaches the client Worker.
- **2026-07-17** — Committed (`ec64ae473a`) and merged `--no-ff` into `master` (`451ace2bd2`; repo has no
  `develop`, owner-chosen). Owner pushed to origin and greenlit the deploy → `deploy/update.sh` ran green
  (preflight all-suites + tracker, bundle rebuild, rsync, container recreate, health-check `/api/me` 401 =
  live) → **deployed ✓ https://pokemon-emerald-cut.com**. Owner asked to close (explicit close instruction).

## Outcome

Shipped + deployed (owner-instructed close, 2026-07-17). `villainFavourite` is now a `{ villainMega }`
marker resolved by `favouriteClaim.resolveVillainMega` — a type/prevo-aware ladder (rules 1,2,3,5,6,7) over
megas that pass the boss-mega budget gate + the team-type restriction: signature-if-{t0,t1} ≫ any {t0,t1}
mega with an on-team pre-evolution ≫ any monotype-t0 mega with one ≫ signature-if-has-t0 ≫ any t0 mega ≫ any
mega with an on-team pre-evolution; deterministic pick (tier→rating→id). No eligible mega → the slot is
dropped with a `VILLAIN_MEGA_DROPPED` warning (owner-chosen over an off-theme filler). Each mascot grunt
(Petalburg/Rusturf) gained a fallback ladder — a mon of both team types ≫ the primary type ≫ any — over its
own slot budget, reusing `selectWithAutoFallback` (no new resolution code); it fires only when the leader
commits no mega (previously that DROPPED the grunt slot → strict improvement).

Default themes are unchanged (Sharpedo/Camerupt via rule 1). The fix shows on reconfigured themes (T-052):
Grass/Fairy Aqua → Mega Venusaur + Bulbasaur mascot; Electric/Steel Magma → Mega Manectric + Electrike
mascot — both on-theme, which the old "any-of-5-types" chain could never do. Verified end-to-end on the real
generator (default + reconfigured). No follow-ups spawned. `npm test` 1179 pass; `RUN_DETERMINISM` gates
(cross-ROM determinism + reverse-order continuity) 18/18.
