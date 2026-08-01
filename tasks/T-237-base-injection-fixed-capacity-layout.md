---
id: T-237
title: "Base+injection Phase 2 — fixed-capacity / free-space layout for variable-length tables"
status: in-progress
type: refactor
created: 2026-07-27
updated: 2026-08-01
target-version: 0.7.0
links: [T-229, T-232, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-232, T-233]
---

# T-237 — Fixed-capacity / free-space layout (Group B)

## Context
Learnsets, teachable/TM compat, trainer parties (×860), battle partners, trade lists, extra starters and
nickname strings are variable-length → repoint. Per GATE-1 (T-232), pad them to fixed max capacity / a
reserved free-space arena so injection becomes fixed-offset (B1). See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Within the GATE-1 budget: pad each Group-B table to its max length (or reserve arena slots), and give
nickname entries fixed-width string slots. Tables that don't fit stay B2 (classic repoint) — record which.
Verify via T-233.

Acceptance criteria:
- [x] Group-B tables padded to fixed capacity (or explicitly assigned B2) per the GATE-1 budget.
      **Nothing fell back to B2** — level-up learnsets, teachables, trainer/partner parties, trades,
      extra starters and both nickname tables are all fixed-capacity. Total ≈ **+355 KB** (learnsets
      +237, parties +118, the rest ~4), ~4 % of the 8.33 MB GATE-1 margin.
- [x] Nickname/name entries use fixed-width slots (`u8 [POKEMON_NAME_LENGTH + 1]` inline, everywhere the
      randomizer writes a name: location, trade, starter and extra-starter nicknames).
- [ ] Same gameplay/data; T-233 green; `make` compiles; new sizes fit under 32 MB. *(needs the PRO box)*
- [ ] Owner play-tests the downloaded ROM (learnsets + a trainer battle) and confirms identical behavior.

## Progress log
- **2026-07-27** — Created (Phase 2). Depends on the GATE-1 free-space verdict.
- **2026-08-01 — MEASUREMENT + DESIGN (analysis before code, as in T-236).**
  - **What is actually variable-length, and where it lives:**
    | Output | Today | Injection blocker |
    |---|---|---|
    | Level-up learnsets | 1104 `static const struct LevelUpMove sXLevelUpLearnset[]` in `level_up_learnsets/gen_9.h` (only gen_9 is compiled), reached via `gSpeciesInfo[].levelUpLearnset` | `static` → absent from the `.map`; every array a different length |
    | Teachable learnsets | 1101 `static const u16 sXTeachableLearnset[]` in `teachable_learnsets.h` | same |
    | Trainer parties | `trainerproc` emits `.party = (const struct TrainerMon[]){…}` **anonymous compound literals**, 860 trainers | unnamed → not locatable, variable length |
    | Battle partners | same tool, `battle_partners.party` | same |
    | In-game trades | `sIngameTrades[4]` is already fixed-width (`nickname`/`otName` are inline arrays) **but** `requestedSpeciesList`/`requestedBaseForms` are pointers to per-run `sTradeAccepted_*`/`sTradeBase_*` arrays | `static` + variable length |
    | Extra starters | `sStarterExtraMon[STARTER_EXTRA_COUNT]` + nickname/gender arrays; the writer **rewrites the `#define` itself** per ROM | array length changes per ROM |
    | Location / trade nicknames | `sLocationNicknames[]` (134 rows in a real run) / `sTradeNicknames[]`, rows = `{…, const u8 *nickname}` → `COMPOUND_STRING` pool | variable row count + pooled strings |
  - **Measured maxima** (base source + a real production bundle, `bundle-2653882998`, 1230 mons / 221
    randomized trainers): level-up **33** moves (base 33, raw-parse 36); teachable **41** randomized
    (**63** in the base itself — the base's own max is the binding one); party **6** mons × 4 moves
    (hard engine limits); trades 4, accepted-species list max **3**; location nicknames **134** rows;
    extra starters **9** (but the config allows an *unlimited* list — see the open decision).
  - **Design — one exported fixed-stride table per family + `#define` aliases** (deliberately the
    smallest possible diff against upstream, cf. ADR-012):
    ```c
    const struct LevelUpMove gLevelUpLearnsets[LEARNSET_SLOT_COUNT][MAX_LEVEL_UP_MOVES] = {
        /* [0] */ { LEVEL_UP_MOVE(1, MOVE_TACKLE), …, LEVEL_UP_END },   // padded
        …
    };
    #define sBulbasaurLevelUpLearnset gLevelUpLearnsets[0]
    ```
    The alias keeps every `.levelUpLearnset = sBulbasaurLevelUpLearnset,` line in the nine
    `species_info/gen_*_families.h` files **untouched** (array→pointer decay of a constant address is a
    legal static initializer), keeps `GetSpeciesLevelUpLearnset()` untouched, and preserves form
    sharing exactly (two species pointing at the same slot stay pointing at the same slot).
    Verified: `.levelUpLearnset`/`.teachableLearnset` are read **only** inside those two accessors
    (`src/pokemon.c:3696-3710`), so nothing else can observe the change.
  - **Slot-indexed, not species-indexed.** Indexing by species id would need a total array-name→species
    mapping (forms, `sNone*`, shared arrays) that isn't guaranteed to exist, and would cost ~130 KB of
    dead rows (1524 species vs 1104/1101 real arrays). Slot = order of appearance in the file, which is
    exactly the order `pokemonWriter.js` already walks when it matches arrays to pokémon. The writer
    emits the slot map for the Phase-3 injector.
  - **Space budget** (`NUM_SPECIES` = 1524, `sizeof(struct TrainerMon)` = 36 B):
    | Table | Now | Padded | Δ |
    |---|---|---|---|
    | Level-up learnsets (1104 × 40 entries × 4 B) | 70,888 B | 176,640 B | **+103 KB** |
    | Teachables (1101 × 72 entries × 2 B) | 64,548 B | 158,544 B | **+92 KB** |
    | Trainer parties (860 × 6 × 36 B) | ~65,000 B | 185,760 B | **+118 KB** |
    | Partners, trades, starters, nicknames | — | — | ~+10 KB |
    | **Total** | | | **≈ +320 KB** |
    Against the **8.33 MB** free measured at GATE-1 (T-232) this is ~4 % of the margin — B1 for
    *everything*, no table falls back to B2 (classic repoint).
  - **Rollout (PRO `make` gate after each phase, corpus re-snapshot once at the end):**
    A) level-up + teachable learnsets (tables + aliases + `pokemonWriter.js` + capacity guards);
    B) trainer parties + battle partners (`tools/trainerproc/main.c` emits `gTrainerParties[][6]`);
    C) trades (inline accepted lists) + extra starters (fixed `STARTER_EXTRA_MAX` + runtime count) +
    location/trade/starter nickname rows (fixed-width `u8 nickname[]` slots, exported symbols).
  - **Cross-cutting rule:** every capacity gets a `#define` in a shared header, a writer-side guard that
    **throws** when a payload exceeds it, and a unit test for that guard. Silent truncation is the one
    failure mode that would corrupt a ROM without failing the build.
  - **Also noted:** `teachable_learnsets.h` is only regenerated by `tools/learnset_helpers/make_teachables.py`
    when the file is **missing** (`@test -f $@ ||` in the Makefile) — the committed file is authoritative,
    but the generator still emits the old per-species-array format, so it must be updated with the
    format or it would emit a base that no longer compiles.

- **2026-08-01 — DESIGN CORRECTION before writing any code: per-array fixed capacity, not one 2D table.**
  Writing the converter surfaced two facts that kill the single-table shape designed above:
  1. Every learnset in `gen_9.h` / `teachable_learnsets.h` sits inside a `#if P_FAMILY_*` (538 of them,
     plus `P_GALARIAN_FORMS`, `P_GEN_4_CROSS_EVOS`, …). Positional rows in one array would make a slot's
     index **depend on the species config** — the exact class of silent offset drift this task exists to
     remove. Keeping the guards would have forced either a config-derived slot map or stripping 1280
     preprocessor directives out of an upstream-maintained file.
  2. `MAX_LEVEL_UP_MOVES` is **already taken** upstream (= 20, the relearner buffer in
     `constants/pokemon.h`) — the new capacities need their own names anyway.
  So each array keeps its identity and gains a fixed size instead:
  `static const struct LevelUpMove sBulbasaurLevelUpLearnset[]` →
  `const struct LevelUpMove sBulbasaurLevelUpLearnset[LEVEL_UP_LEARNSET_CAPACITY]`. Two tokens per
  declaration, nothing else in either file touched. Why this is better:
  - **Dropping `static` is what makes it injectable** — the arrays now appear in the base build's `.map`,
    which is exactly what T-232 said the injector needs (it flagged the same problem for the `static`
    trade/starter tables).
  - **Name-keyed end to end.** `pokemonWriter.js` already matches arrays to pokémon by array *name*
    (`p.levelUpLearnset === 'sBulbasaurLevelUpLearnset'`), so the injector can look the same name up in
    the `.map`. No slot indices, no positional assumptions, no name→species mapping that forms and
    `sNone*` would break.
  - **The compiler becomes the last guard**: an over-long initializer is now "excess elements in array
    initializer" under `-Werror`, so an overflow can't reach a ROM even if a writer guard is bypassed.
  - Smallest possible diff against upstream (`#if` structure and file layout preserved), per ADR-012.
  Cost vs the single-table shape: 1104 + 1101 extra symbols in the `.map` instead of 2 — irrelevant, the
  injector parses the map anyway.
- **2026-08-01 — PHASE A DONE (local): learnsets are fixed-capacity.**
  - **New SSOT** `include/constants/randomizer_layout.h`: `LEVEL_UP_LEARNSET_CAPACITY` **44**,
    `TEACHABLE_LEARNSET_CAPACITY` **80** (both counts *include* the terminator, so a payload may be at
    most capacity − 1). Included from `src/pokemon.c` ahead of the learnset includes. `pokemonWriter.js`
    **parses the capacities out of that header** instead of restating them, and a test asserts the two
    agree — one home for the number.
  - **Converted the committed base**: 1104 level-up arrays + 1101 teachable arrays. Measured while
    converting: base max **34** entries (`sGalladeLevelUpLearnset`) and **63** (`sChanseyTeachableLearnset`),
    both comfortably inside the chosen capacities. ROM cost: level-up 70,880 → 194,304 B (**+123,424**),
    teachables 62,346 → 176,160 B (**+113,814**) = **+237 KB**, ~2.8 % of the 8.33 MB GATE-1 margin.
  - **Writers** (`pokemonWriter.js`): `editLearnsetsFile` / `editTeachableLearnsets` now detect the
    declaration by regex (`static` and bare `[]` still parse, so an upstream-shaped file is still
    readable) and **throw** before emitting a payload that would overflow its slot, naming the array and
    the capacity to raise. Both were unexported — exported now so they can be tested directly.
  - **Readers**: `parser.js` `parseLearnsetsFile` / `parseTeachableFile` (they feed `base-data.json`, i.e.
    the browser randomizer) updated the same tolerant way. `tools/learnset_helpers/make_teachables.py`
    updated too — the Makefile only runs it when `teachable_learnsets.h` is **missing**, but if it ever
    did run it would have regenerated the old format and broken the build.
  - **TDD**: `randomizer/__tests__/unit/learnsetCapacity.test.js` (9 tests) written **RED first** (8
    failing) — writer output shape, both overflow guards, the exact-fit boundary (capacity − 1 moves),
    capacities-match-the-header, and three source guards over the committed base (no variable-length
    declaration left, >1000 fixed ones, nothing already over capacity). Suite green: **1721**.
  - **Equivalence check for the browser path**: re-ran `node build.js` and diffed the regenerated
    `frontend/data/base-data.json` against the pre-conversion copy — `levelUpLearnsets`, `TMTeachables`,
    `allPokes`, `moves`, `abilities`, `items` all **byte-identical**. The format change is invisible to
    the pipeline; the bundle is rebuilt.
  - Verified no other consumer depends on the old declaration: every C reader goes through
    `GetSpeciesLevelUpLearnset` / `GetSpeciesTeachableLearnset`, and the only references to the array
    names are the `.levelUpLearnset = …` initializers in `species_info/gen_*_families.h`, which keep
    working unchanged (array-to-pointer decay).
  - **Pending: the PRO `make` gate** (compile + confirm the arrays land in the `.map` at a 176 B / 160 B
    stride). Not run yet — getting the base onto the build box is owner-gated.

- **2026-08-01 — PHASE B DONE (local): trainer + battle-partner parties are fixed-capacity.**
  - **What actually had to change was one token.** A party is an anonymous compound literal inside
    `gTrainers[]` (`tools/trainerproc` emits `.party = (const struct TrainerMon[]){…}`), so it has no
    symbol of its own — but it doesn't need one: the injector reads the `.party` pointer out of the base
    ROM (gTrainers is already located) and writes the team there. The only real blocker was **size**: a
    2-mon trainer had room for 2 mons, so writing a 6-mon team would spill into whatever the linker put
    next. Emitting `(const struct TrainerMon[TRAINER_PARTY_CAPACITY])` fixes exactly that, with zero
    change to gTrainers' shape and no new symbols.
  - `TRAINER_PARTY_CAPACITY` = **6** (= `PARTY_SIZE`; the base's own biggest party is already 6).
    `src/data.c` and `src/battle_tower.c` (which `#include` the generated `trainers.h` /
    `battle_partners.h`) now include the layout header.
  - **Measured**: 860 trainers / **1808 mons** (max 6), 2 battle partners; **no** pool-rule trainers and
    **no** `Copy Pool` trainers in the base, so there is no poolSize > 6 case and no two trainers sharing
    a party pointer (which would have been a Phase-3 aliasing hazard). Cost: 65,088 → 185,760 B
    (**+118 KB**). Only the `DIFFICULTY_NORMAL` row of `gTrainers[DIFFICULTY_COUNT][TRAINERS_COUNT]`
    carries parties, so the difficulty dimension does not multiply this.
  - **Verified locally by actually running the tool** — `trainerproc` is a host tool, so it builds and
    runs on this machine: regenerated `trainers.h` from the committed `trainers.party` (via the same
    `cpp | trainerproc` pipeline as the Makefile) and confirmed **860/860** party literals carry the
    capacity.
  - Writer guard in `writer.js`: a team longer than `TRAINER_PARTY_CAPACITY` throws before the .party
    file is written (the compile would also catch it, four minutes later).
  - Tests: `randomizer/__tests__/unit/trainerPartyCapacity.test.js` (4) — the emitter uses the capacity at
    **both** emission sites and never `[]`, the two including .c files can see the constant, the capacity
    is ≥ PARTY_SIZE, and no committed party exceeds it. Falsifiability checked by reverting the emitter
    token (test 1 goes RED); the party counter was sanity-checked against the known 860/1808/max-6.

- **2026-08-01 — PHASE C DONE (local): trades, extra starters and the two nickname tables.**
  All four were `static` (invisible in the `.map`, per T-232's finding) *and* variable-length. Each is now
  exported, fixed-capacity, and — where it held text — stores it **inline** instead of pointing into the
  COMPOUND_STRING pool, so a name change can't move anything.
  - **Location nicknames** (`src/location_nicknames.c`): `sLocationNicknames[]` →
    `gLocationNicknames[LOCATION_NICKNAME_CAPACITY]` (**160**; 120 maps have wild encounters, a live run
    used 134) with `u8 nickname[POKEMON_NAME_LENGTH + 1]` inline. `struct LocationNickname` moved to the
    header so the layout is declared where the injector's readers can see it.
  - **Trade nicknames** (`src/trade_nicknames.c`): same shape, `TRADE_NICKNAME_CAPACITY` = **8** (4 trades).
  - **The sentinel had to become a count.** Both tables used a non-matching sentinel row (`0xFF, 0xFF`) to
    stay non-empty; with a fixed capacity the trailing rows are **zero-filled**, and zero is a *real*
    map group/num and a real trade id (`INGAME_TRADE_SEEDOT` = 0) — so an empty row would match and hand
    the player a blank nickname. Each table therefore carries a writer-filled
    `gLocationNicknameCount` / `gTradeNicknameCount`, written in the same call as the rows so the two can
    never disagree, and the lookups iterate the count instead of `ARRAY_COUNT`. 0 = feature off = vanilla,
    which is the committed default.
  - **Extra starters** (`src/starter_choose.c`): the writer used to rewrite the `#define
    STARTER_EXTRA_COUNT` itself — resizing three arrays and moving everything after them, the single
    worst offender for injection. Now `STARTER_EXTRA_CAPACITY` = **16** (owner's call; default preset
    uses 9) with `gStarterExtraCount` for the real length, nicknames inline in a
    `[STARTER_EXTRA_CAPACITY][POKEMON_NAME_LENGTH + 1]` array, and everything exported (`gStarterMon`,
    `gStarterExtraMon`, `gStarterNickname`, `gStarterGender`, `gStarterExtraNicknames`,
    `gStarterExtraGenders`). `randomizer/docs/randomization-options.md` said the list was "unlimited" —
    corrected to state the cap and where to raise it.
    - Bounds semantics: `GetExtraPokemon` / `GetExtraStarterNickname` / `GetExtraStarterGender` now clamp
      on `>= gStarterExtraCount`. The old code used `> STARTER_EXTRA_COUNT` on `GetExtraPokemon`, which
      let index == count through; harmless-ish before (it read the next symbol), but with padded arrays it
      would return an empty slot, so the comparison had to become the count-correct one.
    - **B-020's rule inverted.** Its lesson was "a `const u8 *const []` element must be a
      `COMPOUND_STRING`, never a bare `_()`". The array is no longer a pointer array, so the opposite is
      now true — rows must be `_()` literals — and the test that pinned B-020 was rewritten to pin the new
      form (kept as a named regression, not deleted).
  - **In-game trades** (`src/trade.c` + `src/data/trade.h`): `sIngameTrades[]` →
    `gIngameTrades[INGAME_TRADES_COUNT]` (new enum terminator), and the two pointer fields
    (`requestedSpeciesList` / `requestedBaseForms`, which pointed at per-run `sTradeAccepted_*` /
    `sTradeBase_*` arrays) became inline `u16 [TRADE_SPECIES_LIST_CAPACITY]` (**16**; the biggest set
    observed is 3). The two `== NULL` checks in `BufferInGameTradeOffer` / `IsRequestedTradeMon` became
    count checks — an inline array is never NULL, and `-Waddress` under `-Werror` would have rejected the
    old form anyway.
  - **Writers rewritten to match**, each with an overflow guard that throws:
    `locationNameWriter` / `tradeNameWriter` (inline `_()` rows + count), `starterNameWriter`
    (also **switched from byte-for-byte default-block matching to regex matching** — the old contract
    silently no-opped if the committed text drifted, which is precisely how B-049 happened; a new test
    asserts the committed `starter_choose.c` still matches every matcher), `tradeWriter` (inline lists).
  - **Deliberate spec changes to existing tests** (CLAUDE.md rule 3): `locationNameWriter.test.js`,
    `tradeNameWriter.test.js`, `starterNameWriter.test.js`, `tradeWriter.test.js` — all four asserted the
    *old* emitted C (COMPOUND_STRING pointers, sentinel rows, side arrays, the `#define`). They were
    rewritten to assert the new contract, keeping every behavioural case they covered (sanitizing,
    injection-neutralising, sorting, idempotence, lock-step counts, B-020/B-049 regressions) and adding a
    capacity-overflow case each.
  - **Smoke-tested against the real committed sources**, not just fixtures: ran all four writers over the
    actual `starter_choose.c`, `location_nicknames.c`, `trade_nicknames.c` and `data/trade.h` and checked
    the emitted C (count, inline names, inline species lists, untouched `sIngameTradeMail[]`).
  - Suite green: **1738**. Browser bundle unaffected (none of these writers are in the worker's import
    graph — checked).
  - **⚠ Hazard while this sits uncommitted:** `analyze.js`'s `restore()` runs
    `git restore src/ include/ data/maps/` in a `finally`, so **any** pipeline run would wipe every base
    change of T-234/235/236/237 (all of Phase 2 is uncommitted in the working tree). CLAUDE.md already
    says to commit `src/`/`include/`/`data/maps/` before running — noting it here because the blast
    radius is now three tasks' worth of C work, not one file. **Resolved 2026-08-01**: committed in three
    commits (prior Phase 2 / T-247 sweep / T-237), nothing pushed.

- **2026-08-01 — PRO COMPILE GATE, round 1: caught two missing includes.**
  Built the base **out-of-band** rather than deploying: rsynced the tree to `/opt/emerald-t237` on the box
  and ran `make` in a throwaway `emerald-cut:latest` container mounted at `/app`, so production kept
  serving the old base while the new one was proved. (Needed `touch .histignore` — upstream's `make tools`
  refuses to run without git history, and the rsync excludes `.git`.)
  - **`make` failed**: `src/data/debug_trainers.party:2: error: 'TRAINER_PARTY_CAPACITY' undeclared`.
    `trainer_rules.mk` generates **four** party headers, not two — `trainers.h`, `battle_partners.h`,
    **`debug_trainers.h`** and **`test/battle/trainer_control.h`** — and I had only given the constant to
    the first two includers. Fixed by including `constants/randomizer_layout.h` in `src/debug.c` and
    `test/battle/trainer_control.c` (the latter is only built by `make check` in CI, so it would have
    failed there later instead).
  - The guard test now checks **all four** includers, plus a test asserting `trainer_rules.mk` still
    generates exactly four party headers — so a fifth one can't be added without noticing the includer.
    Suite 1739.

## Outcome
