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
- [ ] B: primal forms are rated and placed as standard Pokémon.
- [ ] C: placed in the last batch only, E4/Champion only, alongside a mega stone, equipped only with
      the base form, mega stones first when slots run short.
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

## Outcome
