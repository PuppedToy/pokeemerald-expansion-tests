# Trainer team determinism across shared-trainer ROMs

This documents how trainer teams are kept consistent across the multiple ROMs of one bundle
(the "same trainers & rewards" Nuzlocke toggle), and a **known limitation** where a
wild-guardian slot can perturb its sibling slots. The limitation is deliberately **left
unfixed** — it is deterministic and low-impact. This file exists so it can be referenced if a
more important variance shows up later.

## The shared-trainer determinism model

When trainers are shared across ROMs (`rom.artifacts.trainers === 'shared' | 'global'`), the
teams are resolved once into the bundle docs and the ROM consumes them verbatim
(`writer.js` → `buildTrainersResultsFromDocs`, no RNG). During that resolution
(`writerDocs.js`), every team slot is **reseeded deterministically**
(`resolveTrainerTeam.js:221`):

```
slotSeed = baseRngSeed ^ Math.imul(djb2Hash(trainer.id + ':' + slotIndex), 0x9E3779B9)
```

Effect: the RNG **value** consumed for a given `(trainer, slotIndex)` is **identical across all
ROMs in the bundle**, regardless of how much RNG the wild-encounter module consumed earlier (the
wild encounters differ per ROM). This is what keeps the vast majority of trainer slots identical
across ROMs even though each ROM has different wild data.

**T-189 / ADR-019.** `baseRngSeed` for shared/global trainers is now the run's **`universeSeed`**
(for `player-N` trainers, `deriveSeed(universeSeed, playerIndex)`); per-ROM trainers use the
caller's unshared policy. All seed derivations live in `randomizer/seeds.js`, imported by both
`generate.js` and `make.js`. When no universe seed is pinned, `universeSeed === runSeed === seed`,
so the model above is unchanged.

A wild-guardian slot (`TRAINER_POKE_ENCOUNTER`) is the intended exception: its species mirrors
the ROM's wild encounter for that area, so it varies per ROM **by design**.

## Known limitation: a guardian slot can perturb its sibling slots

The per-slot reseeding stabilizes the RNG *value*, but a slot's result also depends on its
**candidate pool**. The pool is `pokemonList` filtered by the slot's static definition (tier,
`checkValidEvo`) — which is identical across ROMs — **except** for one team-dependent filter:
the **family dedup** in `modules/trainerSelector.js:252-273` (second pass at 291-299), which
stops a trainer from fielding two members of the same evolutionary family.

That filter reads the trainer's **running `team`**, and the running team **includes the
wild-guardian slot**. So when the guardian's evolutionary family contains a candidate that would
otherwise appear in a sibling slot's tier pool, the dedup removes that candidate. `sample()` is
index-based (`utils.js:25-28`): `array[Math.floor(rng.random() * array.length)]`. Removing one
element shrinks the list and shifts every later index by one, so the (unchanged) reseeded draw
lands on a neighbouring species. The sibling slot flips even though its RNG draw never changed.

### Scope (when it triggers)

Only when **both** hold:
- the trainer has a variance slot (a wild guardian), **and**
- the guardian's species/family overlaps a sibling slot's tier pool at an index-shifting
  position (i.e. the removed element sits before the sampled index).

This is why only *some* trainers and *some* ROMs in a bundle are affected, and why some sibling
slots flip while others survive.

## Proven worked example — `TRAINER_DAREJAN`, run `debug/run-m1`

Darejan (Petalburg Woods, level 12) has a guardian slot plus five `contextualTier: [PU/ZU]`
generic slots. Observed pre-shuffle teams (reproduced exactly by replaying the real
`createChooser` + `selectWithAutoFallback` against the bundle, varying only the guardian):

```
rom-0 guardian=MISDREAVUS => MISDREAVUS | ROOKIDEE | GROOKEY    | WOOBAT | ZORUA_HISUI | BUDEW
rom-1 guardian=LILLIPUP   => LILLIPUP   | ROOKIDEE | GROOKEY    | WOOBAT | ZORUA_HISUI | BUDEW
rom-2 guardian=SEEDOT     => SEEDOT     | ROOKIDEE | GOSSIFLEUR | WOOBAT | ZORUA_HISUI | GULPIN
```

The Grookey→Gossifleur slot. The reseeded draw is **identical** in every ROM (`f = 0.872298`);
only the pool length differs:

| | rom-0 (Misdreavus) | rom-2 (Seedot) |
|---|---|---|
| PU pool before dedup | 126 | 126 |
| Removed by family dedup | `[]` | `[NUZLEAF]` (Seedot's evolution, itself PU-tier) |
| Pool after dedup | 126 | 125 |
| idx = floor(0.872298 × len) | 109 | 109 |
| pool[109] | **GROOKEY** | **GOSSIFLEUR** |

In rom-2, removing NUZLEAF (positioned before index 109) shifts Grookey 109→108 and Gossifleur
110→109, so the same draw index lands on Gossifleur. Misdreavus/Lillipup and their evolutions
are not PU-tier, so dedup removes nothing (126→126) and the pick stays Grookey. Slot 5
(Budew→Gulpin) is the same mechanism compounded once slot 2's pick changes the running team.

This is fully deterministic — not seed corruption, and **not** fixable by "removing seeding"
(the seeding is what keeps the other slots stable; without it *every* slot would drift per ROM,
which is strictly worse). The coupling is between the candidate **pool** and the guardian member.

## Why it is left as-is

Teams remain valid and balanced; the deviation is bounded to a minority of wild-guardian
trainers/seeds and to a few slots. It is not worth the added complexity of decoupling the
guardian from sibling dedup (which would also reintroduce the possibility of a guardian + a
same-family sibling, e.g. Seedot + Nuzleaf).

## Recorded alternative (not implemented)

A cleaner conceptual fix, noted for the future: generate the X ROMs in a **single pass with
shared code and without the per-slot seeding solution** — resolve the trainer teams once and
reuse the deterministic generic slots across all ROMs, letting only the genuine variance slots
differ. That would yield consistent sibling slots without the pool-coupling artifact. It is
deliberately not pursued because the current impact is not important enough.
