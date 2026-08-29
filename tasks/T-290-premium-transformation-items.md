---
id: T-290
title: Premium transformation items — a tier of their own alongside mega stones
status: in-progress
type: feature
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-281, T-283, randomizer/docs/families-and-forms.md, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md]
blocked-by: []
---

# T-290 — Premium transformation items — a tier of their own alongside mega stones

## Context

The one genuinely new mechanic in the T-277 epic. The engine audit split the form changes the owner
had lumped together, and the group that matters here is the one the **player opts into by attaching an
item** — as opposed to the automatic battle states (Aegislash, Wishiwashi, Morpeko…) nobody chooses:

| Item | Base | Form |
|---|---|---|
| Rusted Sword / Shield | Zacian / Zamazenta | Crowned |
| Red Orb / Blue Orb | Groudon / Kyogre | Primal |
| Adamant Crystal / Lustrous Globe / Griseous Orb | Dialga / Palkia / Giratina | Origin |
| one Ogerpon mask | Ogerpon-Teal | Wellspring / Hearthflame / Cornerstone |
| one Genesect Drive | Genesect | Douse / Shock / Burn / Chill |

Owner's rules:

1. available **only in the last mega-stone batch** — the one unlocked by defeating May;
2. placed only if the associated base Pokémon is **obtainable** in this run;
3. usable only by the **Elite Four and the Champion**;
4. **extra** — a trainer may carry one as well as its regular mega stone; it does not count as "the mega";
5. a trainer may equip one only if it fields one of the base Pokémon;
6. the transformed form is rated as a **standard Pokémon, not as a mega**, and if it comes out **AG**
   the item is not placed at all;
7. **mega stones have priority** — when trainer slots run short, the premium items are dropped first.

O9: one mask and one drive per run, chosen at random, so a run offers at most nine.

## Plan

Three layers, each shippable on its own:

- **A — the catalogue and the per-run selection** (`randomizer/premiumItems.js`). Rules 2, 6 and O9,
  plus the random order rule 7 truncates. Pure and fully testable.
- **B — primal forms leave the mega system.** Rule 6 says the transformed form is rated as a standard
  Pokémon; today `getEvolutionType` types any `_PRIMAL` id as `EVO_TYPE_MEGA`, so Kyogre-Primal and
  Groudon-Primal are megas — they consume a mega-stone slot and carry the mega-only rating caps.
- **C — placement and trainer bags.** Rules 1, 3, 4, 5, 7 across the writer, the injector and the docs.

Acceptance criteria:
- [x] A: catalogue of nine; base must be obtainable; an AG form withholds its item; one mask and one
      drive per run; deterministic per seed; random order.
- [x] B: primal forms are rated and placed as standard Pokémon.
- [x] C1: the decision layer — batch predicate, slot assignment (rules 1, 7) and the equip rule
      (rules 3, 4, 5), all pure and beside `assignMegaStones`.
- [ ] C2: surfacing that decision in the writer, the injector and the docs.
- [ ] `cd randomizer && npm test` green.
- [ ] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms.

## Progress log

- **2026-08-14** — Layer A implemented TDD; `__tests__/unit/premiumItems.test.js` (15).
  Two design notes:
  · **Rule 6 keys on the FORM, not the base.** A Groudon rated AG still gets its Red Orb; a Zacian
    whose Crowned form is AG does not get its Rusted Sword. Tested both directions, because the
    reading that withholds on the base's tier is the easy mistake.
  · **A group's choices are filtered by rule 6 before the draw**, so a run with two AG masks always
    picks the third rather than sometimes rolling a withheld one — and a group whose choices are all
    AG contributes nothing.
  · Genesect's Drive forms are not in the dex (T-155 cuts the family to its base), so rule 6 falls back
    to the base's tier. That is honest rather than lenient: T-283 verified all five entries share
    `GENESECT_SPECIES_INFO`, so a Drive changes nothing but Techno Blast's type.
  Dry run against the cached dex: **7 of 9 placed**, with Zacian and Zamazenta withheld because their
  Crowned forms rate AG — rule 6 doing real work on the first try. Full suite green: 2729 passed.

- **2026-08-14** — Layer B implemented TDD; `__tests__/unit/primalNotMega.test.js` (6) red on 3 first.
  `_PRIMAL` is out of the mega id test in `evoStages`, so Kyogre-Primal and Groudon-Primal classify as
  `EVO_TYPE_SOLO` — the same as Zacian-Crowned, which was never a mega only because its id lacks the
  suffix. That inconsistency is the real reason rule 6 needed stating: two forms reached the same way
  were rated by different rules. Their bases stop carrying a `megaEvos` entry, so they no longer spend
  a mega-stone slot, which is what rule 4 (the item is EXTRA, not "the mega") requires.
  Spec change to `__tests__/unit/stageClassification.test.js`: its "megas keep their own type" table
  listed `SPECIES_KYOGRE_PRIMAL`. Replaced with an explicit assertion of the new rule rather than
  quietly dropping the row. Full suite green: 2735 passed.

- **2026-08-14** — **O10 answered**: the post-May batch is `MEGA_TRAINERS` ids 17–21 — Violet, Jacki,
  Fredrick, Davis and Jonas. Stated once in `premiumItems.PREMIUM_ITEM_TRAINERS` rather than inferred
  from trainer levels, because nothing in the sources records it.
  Layer C1 implemented TDD (`premiumItemAssignment.test.js` 9, `premiumItemEquip.test.js` 10):
  · **Rule 7 reads as "premium items take the last-batch slots the mega stones left empty."**
    `assignMegaStones` runs first and is never disturbed; if all 21 slots hold a stone, nothing premium
    is placed — which is exactly the owner's "son los primeros que no caben y por tanto se sacan".
    Truncation takes the front of the list, which is fair because `selectPremiumItems` already
    shuffled.
  · **Rule 4 ("extra, not the mega") is what decides the equip target.** A premium item never displaces
    a mega stone or a held item: it goes on another mon or not at all. So a Groudon already holding
    `ITEM_MEGA_19` does not lose it — the team's Giratina takes the Griseous Orb instead. That case is
    pinned, because "extra" read as "overwrite" is the easy misreading.
  Both live in `premiumItems.js` beside the mega rule for the reason `megaAssignment.js` exists: the
  rule crosses a JSON boundary into three output paths, and B-062 was three re-derivations of one such
  rule. Full suite green: 2754 passed.
- **2026-08-14** — (superseded) Layer C was blocked on a fact that is not in the codebase, **O10**.
  Rule 1 says the premium items appear "only in the last mega-stone batch — the one unlocked by
  defeating May". There is no May gate anywhere in the randomizer: `MEGA_TRAINERS` is a flat list of 21
  entries (`constants.js:386`) with no batch metadata, and `assignMegaStones` decides purely by
  comparing a trainer's level to the level a mega becomes reachable at. Nothing records which of the 21
  sit behind May.
  Proceeding on a guess would put the items in the wrong part of the game, and item placement across
  the writer, the injector and the docs is the exact surface B-062 came from — three copies of one rule
  either side of a JSON boundary, which is why `megaAssignment.js` exists at all. Stopping here rather
  than adding a fourth copy built on an assumption.
  What layer C needs once O10 is answered, all of it downstream of `premiumItems.selectPremiumItems`:
  · the batch predicate, expressed once, next to `assignMegaStones`;
  · an E4/Champion bag slot that is not `TRAINER_POKE_MEGA_FROM_STONE` (rule 4 — carried as well as the
    real mega stone, so it cannot reuse the `ITEM_MEGA_NN` slot mechanism);
  · the equip condition (rule 5) in `modules/trainerSelector.js`, where the mega special already lives;
  · surfacing in `writer.js`, `injector/modules/megaMapItems.js` and `writerDocs.js` — through one
    shared rule, as `megaAssignment` does, never re-derived per path.

## Outcome
