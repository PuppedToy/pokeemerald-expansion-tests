---
id: T-241
title: "Base+injection Phase 3 — inject trainer parties + battle partners (Group B, biggest)"
status: done
type: feature
created: 2026-07-27
updated: 2026-08-03
target-version: 0.7.0
links: [T-229, T-238, T-237, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238, T-237]
---

# T-241 — Inject trainer parties + battle partners

## Context
The largest variable-length surface: 860 trainers, team size 1–6, ≤4 moves each; the compiled form is a
per-trainer party array referenced by pointer + partySize in `gTrainers[]`. See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Inject each trainer's party (species/item/ability/level/nature/IVs/moves) + the battle partners, using the
T-237 fixed-capacity party slots (or repoint + patch pointer/count). Verify INV-BYTES on the corpus.
Its own task due to scale and the battle-format ("Double Battle") flag living here.

**The compile path here is two tools, not one.** `writer.js` rewrites the *team text* of
`src/data/trainers.party` / `battle_partners.party`, and then `tools/trainerproc` turns that text into
`struct TrainerMon` initializers. So the injector has to mirror **both**: what the writer emits, and what
trainerproc makes of it.

Writer audit (`writer.js`, the `Object.entries(trainersResults)` loop):

| | rule |
|---|---|
| which trainers | only the ids in `trainersResults` (209 of 860 in a real bundle); an id with no `=== ID ===` block in the file is silently not replaced |
| the teams | bundle mode = `buildTrainersResultsFromDocs(docs.trainersResultsSimplified, …)`, **no RNG, no shuffle**; the shuffle + lead logic only run in the doc-less analyze path |
| the block | the **whole** team text is replaced, so any per-mon field the base declared and the writer does not emit is *gone* from the compiled ROM |
| per mon it emits | `Name @ Item` / `Ability:` / `Level:` / `Nature:` / `IVs:` / up to 4 `- Move` lines — and nothing else |
| the header | kept, except `Double Battle:` is rewritten from `effectiveBattleType(battleType, team.length)` (the ≥2-mon rule); partners keep their header untouched |
| overflow | a team longer than `TRAINER_PARTY_CAPACITY` throws |

What trainerproc then does with the fields the writer *omits* is the other half of the rule, and it is
not "leave the base's value": every party entry is generated fresh, so an omitted field takes the
tool's default — `gender = TRAINER_MON_RANDOM_GENDER`, `nature = NATURE_HARDY`,
`dynamaxLevel = MAX_DYNAMAX_LEVEL`, and zero for nickname / ev / ball / friendship / shiny / tera /
gigantamax / tags. Names become constants by a *textual* transform (`fprint_species` collapses
separator runs and maps ♀→`_F`, é→`E`, drops `'`; `fprint_constant` does not collapse), never by a
lookup table — so the injector mirrors the transform, and an unresolvable constant is a compile error
on the other path too.

Design:

1. **`injector/partyFile.js` — a JS port of the parts of trainerproc that decide bytes**: parse a
   `.party` file, convert names to constants exactly as the tool does, and encode a `struct TrainerMon`.
2. **The base `.party` files are the port's 860-case test suite, checked at inject time.** Before any
   write, every trainer's party slot, `partySize` and `battleType` in the base ROM are byte-matched
   against what the port makes of the base source. If the port is wrong anywhere, injection stops with
   the trainer's name instead of shipping a corrupt team — and that same pass proves the `struct
   Trainer` field offsets, whose header comments are stale (`/*0x04*/ party` is really +8: `u64
   aiFlags`).
3. Parties are **anonymous compound literals** — no symbol of their own. The slot is found by reading
   `gTrainers[DIFFICULTY_NORMAL][id].party` out of the base ROM, which is also why T-237 gave every
   party a fixed 216 B capacity; the whole slot is written so a shorter team leaves no stale mon behind.
4. `partySize`, `poolSize` (trainerproc emits it from the same count) and `battleType` are part of the
   payload, not an afterthought — the battle format lives in `gTrainers`, not in the party.

Acceptance criteria:
- [x] Trainer parties injected (incl. the battle-format flag); INV-BYTES green on the corpus.
      (`parity.mjs --compile-each --by-symbol`, **ALL PASS — 12 pass / 0 fail**, 2026-08-02, base
      `c144386ff4f3…`. Read as data equivalence per symbol, not image equality — [[B-057]] / [[T-248]].)
- [x] Battle partners injected; INV-BYTES green. Same run: `gBattlePartners` is written through the same
      path, and `steven-off` — the bundle that turns the partner off — is in the corpus.

## Progress log
- **2026-07-27** — Created (Phase 3).
- **2026-08-02** — Started. Branch `feature/T-241-inject-trainer-parties` off T-240's. Audited both
  halves of the compile path before coding (the table above). Two findings shaped the design: the
  writer's replace **drops** every field it does not emit, so the injector must write whole entries with
  trainerproc's defaults rather than patching fields; and the base's own 860 parties are a free,
  exhaustive validation set for the JS port, checkable against the base ROM on every run.

- **2026-08-02 — MODULE DONE (local): 2 new files, 57 new tests, suite 2059 + backend 214 green.**
  RED first in both halves. What was built:
  - **`injector/partyFile.js`** — the trainerproc port: parse a `.party` file, turn names into constants
    the way `fprint_species` / `fprint_constant` do, encode a 36 B `struct TrainerMon`. The two
    transforms differ (species collapse separator runs, constants do not), which is the kind of detail
    that silently writes the wrong item id, so both are pinned by table-driven tests including ♀/é/`'`
    and the already-a-constant case. A mon or trainer field the port does not encode (`EVs`, `Ball`,
    `Shiny`, `Party Size`, the pool fields) **throws** instead of being ignored — the compiled ROM would
    have it and the injected one would not.
  - **`modules/trainerParties.js`** — the writer's half: teams from `buildTrainersResultsFromDocs` (the
    writer's own function, so no second copy of the team rules), the ≥2-mon battle-format rule through
    `effectiveBattleType`, and a bundle id with no `=== ID ===` block skipped exactly as the writer's
    regex skips it. Parties are located by reading the `.party` pointer out of the base ROM, and the
    whole 216 B slot is written so a shorter team leaves no stale mon behind.
  - **`structLayout.TRAINER` / `TRAINER_MON`** — with the note that `include/data.h`'s `/*0x04*/ party`
    comment is stale (`u64 aiFlags` puts it at +8), the same class of stale comment that cost T-239 a
    day on `struct SpeciesInfo`.
  - `gameConstants` grew the trainer headers (`opponents.h`, `battle_partner.h`, `difficulty.h`,
    `trainers.h`, and `data.h` for `enum TrainerBattleType`) — ids stay in the base, never re-typed here.
  - **Dry run against a real bundle before going near the box**: 206 of 209 docs trainers written (the
    three `TRAINER_BRENDAN_EVERGRANDE_*` have no block in `trainers.party`, so the writer skips them
    too), 1227 mons encoded with zero failures, biggest team 6 = the capacity, 87 teams doubles. It also
    surfaced the finding that justifies the whole design: **8 mons whose docs id does not survive the
    round-trip** — `SPECIES_FLOETTE_RED` is written as the display name "Floette", which trainerproc
    turns into `SPECIES_FLOETTE`. Using the docs id directly would have been "more correct" and would
    have differed from every compiled ROM.

- **2026-08-02 — GATE-3: RED first (0/12), two findings, then GREEN 12/12.**
  Same isolated tree and cached corpus compiles as T-240 (T-241 changes no C source either), so the run
  cost minutes rather than a rebuild. First attempt: **every** ROM failed with `gTrainers: 412 B differ`.
  A field-level diagnostic (inject one bundle, diff `gTrainers` entry by entry against the cached
  compile) split that into two distinct causes:
  - **BUG — `poolSize` must not be written.** trainerproc emits `.poolSize` **only** inside the
    `Party Size:` branch, which no block in this base has; compile() leaves it 0 and the injector was
    setting it to the team size — 206 bytes per ROM. Fixed, and the base check now pins `poolSize == 0`
    per trainer (it could not have caught this before, because the module never encoded the field).
    `partyFile` also refuses a `Party Size:` / pool block outright, so the assumption cannot rot quietly.
  - **NOT a bug — the `.party` pointers differ by 8 B on all 860 trainers.** That is [[B-057]] again:
    compile() lays its own anonymous data out differently, so a party blob sits 8 B further along than
    in the base. The pointer value is not something the injector writes, but it broke the *comparison*:
    the harness located each payload at a fixed delta from `gTrainers` and therefore read the neighbour's
    bytes. Fixed properly rather than waived — `rom.writeBytes` now takes an optional
    `via: { symbol, at }` recording that a payload lives wherever the pointer stored there points, and
    `parity.mjs` follows that pointer **in each build** before comparing. Anonymous data is now
    comparable by construction, which T-242's trade lists and T-243's tables will want too.
  - **GREEN after both: `ALL PASS — 12 pass / 0 fail`**, 200–207 teams written per ROM out of the 862
    trainers the base declares. The 12 fresh compile hashes are again identical to the committed
    manifest, so no re-snapshot.

- **2026-08-03** — Closed. 12/12 corpus by symbol; trainer teams and levels verified against the docs and in-game.

## Outcome

Trainer parties, battle partners and the battle-format flag. The first module whose compile path is two
tools, so `injector/partyFile.js` ports the parts of `trainerproc` that decide bytes — `.party` parsing,
the name→constant transform (species collapse separator runs, constants do not), and the 36 B
`TrainerMon` encoding — and the base's own 862 parties are re-encoded and byte-matched against the ROM
on every run, which is a free 1811-mon test suite for the port.

Two findings worth keeping: the writer's replace **drops** every field it does not emit, so entries are
written whole with trainerproc's defaults rather than patched; and 8 mons per run do not round-trip
(`SPECIES_FLOETTE_RED` is written as "Floette" and read back as `SPECIES_FLOETTE`) — using the docs id
would have been "more correct" and would have differed from every compiled ROM.

GATE-3 found `poolSize` being written when trainerproc never emits it, and the party-pointer drift that
made the harness compare the wrong bytes — fixed properly with the journal's `via` mechanism.
