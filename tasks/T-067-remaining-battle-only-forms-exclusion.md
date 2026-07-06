---
id: T-067
title: Exclude remaining battle-only forms from placement
status: done            # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: [T-061, T-064]
blocked-by: []
---

# T-067 — Exclude remaining battle-only forms from placement

## Context

Spawned from **T-064** (the Meloetta-Pirouette investigation under **T-061**). While pinning down why Meloetta-Pirouette leaked as an obtainable mon, the investigation found **four more battle-only forms with the exact same gap** — they are absent from `BANNED_SPECIES_FOR_PICKING` (`randomizer/modules/wildModule.js:35-52`), are ordinary rated dex entries (`isMega:false`, `EVO_TYPE_SOLO`), and so pass every placement filter and can appear as wild encounters / rewards / trainer mons:

- `SPECIES_ZACIAN_CROWNED` (rated AG)
- `SPECIES_ZAMAZENTA_CROWNED` (rated LEGEND)
- `SPECIES_ETERNATUS_ETERNAMAX` (rated AG)
- `SPECIES_TERAPAGOS_TERASTAL` (rated OU) — note `BANNED_SPECIES_FOR_PICKING` already lists `TERAPAGOS_NORMAL` and `TERAPAGOS_STELLAR` but **not** the `_TERASTAL` intermediate.

The user decided (2026-07-06) to keep **T-064 scoped to Meloetta only** and handle these four in this separate task, later.

The exclusion mechanism, the `!isMega` filter that already screens primals, and the ROM-consumes-pool wiring are all documented in **T-064** — see [T-064](T-064-meloetta-pirouette-form-handling.md) for the shared root-cause analysis and `file:line` map. This task applies the same one-line-list fix to the four forms above, plus decides whether Zacian/Zamazenta also need Meloetta-style handling.

**Not in scope / left placeable:** Kyogre/Groudon **Primal** (already safe via `isMega:true`); Dialga/Palkia/Giratina **Origin** (held-item *permanent* form changes — intentionally obtainable). Confirm during implementation.

## Structural note — Zacian / Zamazenta

Zacian and Zamazenta are structurally **identical to Meloetta**: a placeable weaker base form (`SPECIES_ZACIAN_HERO` / `SPECIES_ZAMAZENTA_HERO`) plus a battle-only stronger form (`_CROWNED`) reached via a held item (Rusted Sword/Shield) in-battle. So beyond banning `_CROWNED` from placement, they are candidates for the **same weighted-average tier blend** T-064 builds for Meloetta (base + battle-form). Their base↔crowned power gap is larger than Meloetta's, so the 0.55/0.45 weights may not transfer directly — decide the blend (and whether to reuse T-064's `tierFromRating` helper + a generalized blend table) here. Eternatus and Terapagos-Terastal do **not** have this pattern (no separately-placeable weaker base of the same line in the same way) — for them a plain ban suffices; verify against the dex.

## Plan

1. Add `SPECIES_ZACIAN_CROWNED`, `SPECIES_ZAMAZENTA_CROWNED`, `SPECIES_ETERNATUS_ETERNAMAX`, `SPECIES_TERAPAGOS_TERASTAL` to `BANNED_SPECIES_FOR_PICKING` (`wildModule.js:35-52`). This removes them from wild (`:156`), trainer (`writer.js:247`), and docs (`writerDocs.js:118`) pools at once (same as the Meloetta fix in T-064). Keep the species in the dex (in-battle transforms need them); only *picking* is banned.
2. Decide + (optionally) implement a weighted-tier blend for Zacian-Hero/Zamazenta-Hero mirroring T-064's Meloetta "9d" block in `pokedexModule.js` — with weights appropriate to their larger power gap, reusing T-064's exported `tierFromRating` helper. If T-064 generalizes the blend into a small table, extend that table instead of duplicating.
3. Verify (dex enumeration) there are no *other* battle-only/transient forms still slipping through the same gap after these four.

Acceptance criteria:
- [x] None of the four forms (`ZACIAN_CROWNED`, `ZAMAZENTA_CROWNED`, `ETERNATUS_ETERNAMAX`, `TERAPAGOS_TERASTAL`) ever appears in any wild slot, reward, or trainer team; the placeable base forms (Zacian-Hero, Zamazenta-Hero, Eternatus) stay pickable.
- [x] Zacian/Zamazenta tier handling decided: **no weighted blend** — user chose to simply remove ("quitar") the forms. Ban only.
- [x] `cd randomizer && npm test` green; failing-first test added (extended `wildModule.test.js` BANNED assertions).

## Test plan (TDD, red first)

- Extend the `wildModule.test.js` ban-list assertions (from T-064): `.toContain` each of the four ids; `.not.toContain('SPECIES_ZACIAN_HERO')` / `'SPECIES_ZAMAZENTA_HERO'`.
- If a Zacian/Zamazenta blend is adopted: a `zacian.test.js` (model on T-064's `meloetta.test.js` / existing `palafin.test.js`) asserting the blended `absoluteRating` and `tierFromRating`.
- Integration: no ROM's wild/trainer/reward contains any of the four battle-only forms.

## Open decisions (confirm before implementing)

1. **Zacian/Zamazenta blend:** apply a Meloetta-style weighted tier blend, and with what weights (their base↔crowned gap is larger than Meloetta's)? Or ban only, no blend? **Recommendation: ban all four; add a blend for Zacian/Zamazenta with weights TBD after seeing their rating deltas.**
2. **Origin formes (Dialga/Palkia/Giratina):** confirm they stay placeable (held-item permanent change), not banned.
3. Any other transient/battle-only forms surfaced by the dex sweep — extend the ban list as found.

## Progress log

<!-- Append-only. Never rewrite past entries. -->

- **2026-07-06** — Task created (spun off from T-064 per user decision). Covers the four battle-only forms that share Meloetta-Pirouette's placement-leak gap. Root-cause mechanism documented in T-064.
- **2026-07-06** — User decision: just **remove** those forms (ban only; no weighted-tier blend). Implemented — added `SPECIES_ZACIAN_CROWNED`, `SPECIES_ZAMAZENTA_CROWNED`, `SPECIES_ETERNATUS_ETERNAMAX`, `SPECIES_TERAPAGOS_TERASTAL` to `BANNED_SPECIES_FOR_PICKING` (`wildModule.js`), keeping Zacian-Hero/Zamazenta-Hero/Eternatus placeable. Extended `wildModule.test.js` BANNED assertions (4 banned + 3 bases placeable); suite green (668 passed). No changelog line — combined with T-064's Meloetta line the visible effect is "battle-only forms don't appear"; left as-is.

## Outcome

Shipped: added `SPECIES_ZACIAN_CROWNED`, `SPECIES_ZAMAZENTA_CROWNED`, `SPECIES_ETERNATUS_ETERNAMAX`, `SPECIES_TERAPAGOS_TERASTAL` to `BANNED_SPECIES_FOR_PICKING`; their placeable base forms (Zacian-Hero, Zamazenta-Hero, Eternatus) stay pickable. Per the user's decision this was a plain removal — the optional Zacian/Zamazenta weighted-tier blend was dropped. Verified by extended `wildModule.test.js` BANNED assertions. Closed per the user's explicit instruction; manual ROM test deferred to the user.
