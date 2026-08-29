# ADR-026: Identity, stage classification and dedup are three separate concerns, and the first two derive from the evolution graph

- **Status:** accepted
- **Date:** 2026-08-14
- **Task:** T-277

## Context

One string per species, `poke.family` (`randomizer/parser.js:464-481`), answered five different
questions at once: whose mutations a species inherits, whether it is a first/middle/final stage, what
its best evolution is, what its base form is, and which other species exclude it from a run. That
string is not the evolution graph — it comes from the upstream `#if P_FAMILY_…` block, which groups by
national-dex line — so wherever the two disagree the whole stack is wrong together.

The T-277 audit (`tasks/assets/T-277/evolution-and-form-wiring-audit.md`) measured the damage against
the live sources: 20 evolution edges where the string and the graph disagree, 14 species that inherit
nothing from their real pre-evolution, 12 that inherit a line they do not belong to, and 34 families
whose sibling branches share one mutation log (Eevee's eight, Wurmple's two, Tyrogue's three…). The
same key also produced `bestEvo = Espeon` for Flareon, `devolveToBase(Perrserker) = Meowth`, and
Slowbro's mega attached to Slowking.

The correct algorithm already existed in the repo twice — `checkValidEvo` (`modules/utils.js:145-192`,
B-068) and the docs viewer's union-find (`frontend/template.html:3694-3706`) both walk the real
`evolutions[]` edges — but on the wrong side of the wall.

## Decision

**The three concerns are separated and derived from different sources.**

1. **Identity — the inheritance unit.** A species inherits from its **direct pre-evolution and nothing
   else**: never a sibling, never another form. A convergence point inherits from **all** its
   pre-evolutions, stacked. Identity groups are the connected components of the `evolutions[]` edge
   graph, minus a **curated "keep separate despite convergence" list** whose only member is Burmy
   (three cloak subfamilies that converge on one Mothim).

2. **Stage classification, best evolution and base form — the edge graph.** `evolutionData.type`
   comes from in-degree and out-degree, not from a positional index into `evoTree[family]`.
   `bestEvo` is **forward** reachability (what this mon can actually become); `devolveToBase` is
   **backward** reachability. A mega attaches to the species it is a mega of, not to a family.

3. **Dedup — a policy, not a derivation.** The player may obtain **one** member of a dev block
   (`#if P_FAMILY_x`) per run, whatever that block splits into. One invariant rule; no per-case map.

Regional forms fall into exactly two shapes: a line with its **own base** becomes independent
families ("Meowth treatment"), and a form hanging off a **shared non-regional base** stays in that
base's family as a branching evolution ("Koffing treatment").

The full ruleset, per line, is `randomizer/docs/families-and-forms.md` — the SSOT for the decisions
this ADR records the shape of.

## Alternatives considered

- **Keep one key and fix its value per case.** Rejected: every case would be decided twice, once to
  make the string carry behaviour and again when behaviour moved to the graph — and the string still
  could not express Burmy (three inheritance units, one dedup group, one convergence point).
- **Inherit across the whole connected component minus siblings.** Rejected: it is the parent-only
  rule with extra steps, and it has no answer for a component that spans two lines.
- **Derive dedup from identity.** Rejected by the owner: whether two mons feel like duplicates is a
  game-design judgement, not a fact about the evolution graph. A set can be one Pokémon and still be
  worth offering twice, or two Pokémon that would read as a duplicate.
- **Collapse regional forms into their non-regional family** (the pre-T-277 status quo for 9 of them
  via `CUSTOM_FAMILIES`). Rejected: they are different Pokémon with different types, stats and
  abilities, and sharing a mutation log is exactly the reported bug.

## Consequences

- Sibling branches stop bleeding mutations into each other, cross-family evolutions inherit from
  their real parent, and the four species currently mis-typed as non-evolving (Cursola, Weezing-Galar,
  Sirfetch'd, Overqwil) plus the two mis-typed as first stages (Sliggoo-Hisui, Mr. Mime-Galar) are
  classified correctly. That changes which wild, starter and reward slots they can fill.
- `invalidMegas` (`modules/utils.js:65-70`) — a hand-maintained blocklist patching the mega bleed for
  Froslass and Kleavor — is deleted; the reachability rule covers it, including Slowking, which the
  blocklist never did.
- Dex order is **topological for every evolution edge** (verified, 0 exceptions), so per-edge
  inheritance keeps the existing single-pass rebalance loop. No reordering, no topological sort.
- **Every existing seed stops reproducing its world.** The rebalance pass draws a different number of
  random values, so the golden-master corpus needs a fresh baseline (`/verify-corpus`) once the epic
  lands. The whole epic therefore ships as one version.
- We commit to maintaining two curated lists instead of one overloaded string: the
  "keep separate despite convergence" list (one entry) and the same-mon form sets (megas, in-battle
  transformations, orientation forms, cosmetic sets). Both are small, explicit and testable, and
  neither can silently take over a concern that is not its own.
- T-063 decision #1 ("regional forms are distinct obtainables") is **superseded**: dedup is now G1,
  one obtainable per superfamily, so a run can no longer offer Meowth-Alola and Meowth-Galar together.
