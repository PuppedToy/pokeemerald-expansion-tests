---
id: T-291
title: Remove the cosmetic duplicate forms from the game
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-285, T-289, T-063, T-157, randomizer/docs/families-and-forms.md]
blocked-by: []
---

# T-291 — Remove the cosmetic duplicate forms from the game

## Context

Owner rule G4: *"a cosmetic form set keeps one form; the rest leave the game."* Cosmetic means the
forms share stats, types and abilities, so a run able to hand out two of them is handing out the same
Pokémon twice under different art.

G1 (T-285) already stopped them being offered together. This removes them outright, so they stop
consuming a dex slot, a docs entry and a randomization roll.

## Plan

Add them to `parser.REMOVED_SPECIES`, keeping the canonical form of each set. Same mechanism as T-289:
the species stay in the ROM, nothing in the pipeline can reach them.

| Set | Kept | Removed |
|---|---|---|
| Basculin | White-Striped | Red-Striped, Blue-Striped |
| Deerling / Sawsbuck | Spring | Summer, Autumn, Winter |
| Pumpkaboo / Gourgeist | Average | Small, Large, Super |
| Shellos / Gastrodon | West | East |
| Sinistea / Polteageist | Phony | Antique |
| Poltchageist / Sinistcha | Counterfeit + Unremarkable | Artisan + Masterpiece |
| Squawkabilly | Green | Blue, Yellow, White |
| Tatsugiri | Curly | Droopy, Stretchy |
| Zarude | Zarude | Dada |
| Xerneas | Neutral | Active |

Acceptance criteria:
- [x] Every listed duplicate is absent from the pokédex; exactly one form of each set survives.
- [x] No evolution points at a removed species.
- [x] Each surviving line still reaches its final stage.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/cosmeticDuplicateRemoval.test.js` (45) red on 27
  first. Choices worth recording:
  · **Basculin keeps White-Striped, not Red.** Red is the "default" Basculin, but White is the only
    one that leads anywhere — it is Basculegion's base. Keeping Red would have deleted a whole
    evolution line to preserve a colour.
  · **Poltchageist-Artisan and Sinistcha-Masterpiece leave together.** Masterpiece is only reachable
    from Artisan, so removing one without the other would have stranded it with no pre-evolution. The
    test asserts nothing is left dangling, which is what caught this.
  · **Xerneas-Active goes, Neutral stays.** The engine's own table (`BEGIN_BATTLE → ACTIVE`,
    `END_BATTLE → NEUTRAL`, unconditional) plus identical data — BST 680, pure Fairy, Fairy Aura —
    makes Active purely what it looks like in battle. Neutral is what the player owns.
  · Where the owner said "one season" / "one form" without naming it, the first-declared was kept
    (Spring, Phony, Curly, Green, Average, West), matching the T-154 cosmetic-strip convention.
  Verified no code referenced any removed id before deleting them.
- **2026-08-14** — Dex: 1230 → 1228 (T-289) → **1201**. Dedup groups 541 → 539. Full suite green:
  2682 passed.

## Outcome
