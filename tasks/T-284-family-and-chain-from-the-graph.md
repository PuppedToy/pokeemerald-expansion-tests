---
id: T-284
title: Name families after the component and draw the real evolution chain
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-278, T-285, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md, randomizer/docs/families-and-forms.md, T-157]
blocked-by: [T-278, T-285]
---

# T-284 — Name families after the component and draw the real evolution chain

## Context

The last two things keyed off the `family` string, after T-278…T-282 moved inheritance, stage,
`bestEvo`, base form and mega attachment onto the graph and T-285 moved dedup onto G1:

1. **`poke.evoTree`**, which the docs viewer renders as the evolution chain
   (`frontend/template.html:2388`). It was `evoTree[poke.family]` — the line the *family* is in, not
   the line the *Pokémon* is in. Perrserker's chain read "Meowth → Persian"; Weezing-Galar had no
   chain at all, because `P_FAMILY_KOFFING_GALAR` has no tree.
2. **`poke.family`** itself, which ADR-026 defines as the identity group (the connected component)
   but the parser derives from the `#if P_FAMILY_` block plus a form suffix.

Neither drives behaviour any more. This is the guide being right and the model not saying one thing
while storing another.

## Plan

`evoStages.evoChainOf` — the chain from a species' own base form(s) forward, in the shape the viewer
already renders (`[stage0, [stage1], …]`, a stage being an id or an array). `evoStages.componentFamilyOf`
— the family of the component's base form.

Acceptance criteria:
- [x] A cross-family evolution shows its own line; a branch target in another family appears on its
      real branch.
- [x] A convergence point shows every pre-evolution it has.
- [x] A species with no edges either way has no chain (what the viewer treats as "nothing to draw").
- [x] The family label follows the component; the Burmy cloaks stay separate.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/evoChainAndFamily.test.js` (11) red first.
  Using the **base form's** family rather than a component root is what makes the Burmy exception fall
  out for free: the three cloaks converge on one Mothim, so the component would merge them, but each
  cloak is its own base and keeps its own family — T-157's independent randomization survives with no
  special case in the code.
- **2026-08-14** — **Correcting a claim I logged in T-285.** I wrote there that `teachableExpander.js`
  "can still bleed a mega's teachables across sibling branches" because it keys `megaEvoTree` by
  family. It cannot: `getMegaExtraTypes` already filters the scanned megas with
  `if (megaPoke.evolutionData.megaBaseForm !== poke.id) continue`, so Slowking scans Slowbro-Mega and
  then discards it. The family keying is redundant, not wrong. Left as-is rather than churn a correct
  path; noted here so the tracker does not carry a false finding.
- **2026-08-14** — Verified against the real dex: **14 species get a corrected family label**, every
  one a case the audit named — Perrserker → `MEOWTH_GALAR`, Sirfetch'd → `FARFETCHD_GALAR`,
  Weezing-Galar → `KOFFING`, Mr. Mime-Galar → `MR_MIME`, Clodsire, Overqwil, Sneasler, Cursola,
  Obstagoon, Darmanitan-Galar, Runerigus, both Hisui Goodra-line members, Sinistcha-Masterpiece.
  Chains spot-checked: Perrserker draws `MEOWTH_GALAR → PERRSERKER`, Weezing-Galar draws
  `KOFFING → [WEEZING, WEEZING_GALAR]`, Mothim draws all three cloaks converging, Corsola draws
  nothing. Full suite green: 2637 passed.
  Known cosmetic wrinkle, left alone: `DARMANITAN_GALAR_ZEN` keeps `P_FAMILY_DARUMAKA`, because it has
  no edges and its id ends in `ZEN`, which is not a form suffix the parser splits on. It is a banned
  battle state, so nothing reads it.

## Outcome
