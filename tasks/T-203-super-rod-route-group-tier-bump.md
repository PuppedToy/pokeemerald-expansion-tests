---
id: T-203
title: Bump super-rod encounters on two route groups (UU → NFE/LC OU)
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-162, T-063, T-039]
blocked-by: []
---

# T-203 — Bump super-rod encounters on two route groups (UU → NFE/LC OU)

## Context

Owner rebalance: two bands of routes have their **super rod** fishing encounters bumped from **UU** to
**"NFE or LC OU"**. Wild-encounter tiering is pure config in `randomizer/wild.js` (template placeholder →
`replacementType` → `replace:[TIER_…]`), applied in `randomizer/modules/wildModule.js` `buildWildPlan`
(pools filtered by `tiers.includes(poke.rating.bestEvoTier)` at `wildModule.js:190` + evo-type flags
`:194-199`). See `randomizer/docs/wild-encounters.md`. Related: [T-162](T-162-variable-wild-encounters.md)
(super-rod slots kept shared), [T-063](T-063-multiform-family-encounter-dedup.md).

### Findings from the current code
- **Group A** — Routes 106, 109, 110, 117, 118 — all share one super template `SPECIES_PUPITAR`
  (`wild.js:353,365,373,381,389`). PUPITAR → `NFE_OR_LC_STRONG` (`wild.js:83`) = `{ replace:[TIER_UU],
  type:[LC,NFE] }` (`wild.js:55-58`) → **UU**.
- **Group B** — Routes 111, 112, Jagged Pass, 113, 114, 119, 120 — all share `SPECIES_GABITE`
  (`wild.js:398,407,415,423,432,441,450`). GABITE → `NFE_OR_LC_STRONG` (`wild.js:84`) → **UU**.
- The exact target already exists: `NFE_OR_LC_PREMIUM = { replace:[TIER_OU], type:[EVO_TYPE_NFE, EVO_TYPE_LC] }`
  (`wild.js:51-54`). Because PUPITAR is used as `super` **only** across Group A, and GABITE **only** across
  Group B (neither appears in any land/old/good/surf slot), the minimal edit is repointing `wild.js:83-84`
  from `'NFE_OR_LC_STRONG'` to `'NFE_OR_LC_PREMIUM'`.
- **Caveat:** all routes in a group share one template, so routes *within* a group can't be differentiated
  without splitting them into distinct per-route template species (+ matching `wildData.replacements` entries).
  Leave the other super templates (`SPECIES_SHELGON` / `SPECIES_DOUBLADE` / `SPECIES_JIRACHI`) untouched.

## Plan

Repoint the two super-rod template placeholders to `NFE_OR_LC_PREMIUM`. Confirm with the owner that a single
tier for each whole group is acceptable (vs per-route splitting). Pure/seeded logic → TDD.

Acceptance criteria:
- [ ] Group A & Group B super-rod slots draw from `NFE_OR_LC_PREMIUM` (OU, NFE/LC), not UU.
- [ ] Unit test proves the two groups' super slots resolve to the new pool; other super bands unchanged.
- [ ] `cd randomizer && npm test` green; browser bundle rebuilt (`node build.js`) so the client worker carries it.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Investigated the wild.js template model; confirmed both groups
  share a single super template (PUPITAR / GABITE) currently at UU, and the OU target `NFE_OR_LC_PREMIUM`
  already exists — a 2-line repoint. Noted the per-group-single-tier caveat to confirm with the owner.

## Outcome

<!-- Filled when closing. -->
