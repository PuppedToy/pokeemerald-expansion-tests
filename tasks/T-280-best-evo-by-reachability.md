---
id: T-280
title: Derive bestEvo and devolveToBase from reachability, not from the family tree
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-278, T-279, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md]
blocked-by: [T-278]
---

# T-280 — Derive bestEvo and devolveToBase from reachability, not from the family tree

## Context

Third child of the T-277 epic. Two questions were being answered with "my family" instead of "the
graph":

- **`bestEvo`** walked `poke.evoTree` and kept the highest-rated member in either direction, so it
  meant *the best mon in my family* rather than *the best mon I can become*. Flareon's bestEvo was
  Espeon, Silcoon's was Dustox, Poliwrath's was Politoed, and Basculin-Red-Striped's was
  Basculegion-M — a mon it cannot reach at all. `bestEvoTier` drives reward tiering, extra-starter
  line selection and the trade quality ladder, so this moved mons between routes.
- **`devolveToBase`** returned `evoTree[0]`, the base of whatever tree the family pointed at. Eight
  species devolved into the wrong line; `devolveToBase(Perrserker)` returned Meowth.

The owner stated the target behaviour exactly: *"Wurmple tendrá como best evo el mejor de los 4
(silcoon, cascoon, beautifly o dustox) pero silcoon solo podrá ver silcoon, beautifly y wurmple."*

## Plan

`evoStages.bestEvoOf(list)` — highest `absoluteRating` among the species and everything
forward-reachable from it. `modules/utils.devolveToBase` — the in-degree-0 ancestor from
`evoGraph.baseFormsOf`, with the graph memoised per list so the loops that call it stay cheap.

Acceptance criteria:
- [x] A branch's bestEvo never includes a sibling; a base form still sees the whole line.
- [x] A mon that evolves into nothing is its own bestEvo.
- [x] `devolveToBase` crosses families correctly and still resolves megas through their base form.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/bestEvoReachability.test.js` (11) red first.
  `devolveToBase` also lost two guards it no longer needs: it used to bail early on
  `EVO_TYPE_SOLO || isLC || !evoTree.length`, which was a proxy for "has no pre-evolution". The graph
  answers that directly — `baseFormsOf` returns the species itself — so the label is no longer
  consulted at all. The mega branch stays, since a mega is not an evolution edge and is resolved
  through `megaBaseForm`.
- **2026-08-14** — Verified against the real dex: **60 of 1230 species get a corrected bestEvo**.
  Flareon and Vaporeon now return themselves instead of Espeon; Silcoon sees Beautifly and no longer
  Dustox, while Wurmple still sees the best of all four — exactly the behaviour the owner specified.
  Poliwrath, Hitmontop, Vileplume, Slowbro, Perrserker, Mr. Rime and Basculin-Red-Striped all stop
  borrowing a sibling's ceiling. Full suite green: 2583 passed.

## Outcome
