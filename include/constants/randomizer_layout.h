#ifndef GUARD_CONSTANTS_RANDOMIZER_LAYOUT_H
#define GUARD_CONSTANTS_RANDOMIZER_LAYOUT_H

// T-237 / ADR-022 — fixed capacities for the tables the randomizer rewrites.
//
// The base+injection pipeline overwrites these tables in a prebuilt ROM at offsets taken from the
// base build's `.map`. That only works if a table's size never depends on its contents: a longer
// learnset must not push everything after it forward. So every rewritten array is declared at a
// FIXED capacity here and padded — the data ends at its terminator, the storage does not.
//
// Two guards keep a payload from silently overflowing a slot:
//   - the writers (randomizer/pokemonWriter.js) throw before emitting an oversized array;
//   - the compiler rejects an over-long initializer ("excess elements in array initializer", -Werror),
//     so an overflow can never reach a ROM even if a writer guard is bypassed.
// Raising a capacity is cheap (a few KB of ROM); lowering one below what a run can produce is not.
// Any change here invalidates the golden-master hashes — re-snapshot the corpus (T-233).

// Level-up learnsets — `struct LevelUpMove` (4 B) each, terminated by LEVEL_UP_END.
// Base max 33 moves; a randomized run's max measured at 33 (raw parse 36). 44 leaves ~25% headroom.
#define LEVEL_UP_LEARNSET_CAPACITY   44

// Teachable (TM/HM + tutor) learnsets — u16 each, terminated by MOVE_UNAVAILABLE.
// Base max 63 moves; a randomized run's max measured at 41. The teachable expander (see
// randomizer/docs/teachables.md) can add up to ~35 TMs on top of a mon's base list, so 80.
#define TEACHABLE_LEARNSET_CAPACITY  80

// Trainer / battle-partner parties — `struct TrainerMon` each, emitted by tools/trainerproc. There is no
// terminator: `.partySize` says how many entries are real, so the whole capacity is usable. A randomized
// team can be up to PARTY_SIZE mons, and the base's biggest party is already 6, so 6 it is.
// (Upstream's pool feature allows poolSize > PARTY_SIZE; this base uses no pool trainers — if one is ever
// added with more than 6 mons, the compiler stops the build with "excess elements in array initializer".)
#define TRAINER_PARTY_CAPACITY       6

// Per-ROM nickname tables (T-070 location nicknames, T-202 trade nicknames). Each row stores its name
// INLINE at POKEMON_NAME_LENGTH + 1 bytes instead of pointing at a COMPOUND_STRING, so a name change
// never moves the string pool. The writers fill a row count (gLocationNicknameCount /
// gTradeNicknameCount) because trailing rows are zero-filled, and zeros are a valid map/trade id.
// 120 maps have wild encounters today; T-269 took the in-game trades from 4 to 15 (one per healing
// building along the progression), so the trade table needs room for all of them plus headroom.
#define LOCATION_NICKNAME_CAPACITY   160
#define TRADE_NICKNAME_CAPACITY      16

// Extra starters (T-052/T-068). The config calls this "an unlimited, ordered list" and the writer used
// to rewrite the STARTER_EXTRA_COUNT #define per ROM — which changes the size of three arrays and moves
// everything after them. Fixed at 16 slots (owner's call, 2026-08-01; the default preset uses 9) with a
// writer-filled gStarterExtraCount saying how many are real.
#define STARTER_EXTRA_CAPACITY       16

// In-game trades: the accepted-species set and the base forms named in the "what I want" message were
// per-run `static const u16 []` arrays behind pointers; they are inline and fixed-width now. The biggest
// accepted set observed is 3 (an evolution line); 16 covers even an Eevee-sized family.
#define TRADE_SPECIES_LIST_CAPACITY  16

#endif // GUARD_CONSTANTS_RANDOMIZER_LAYOUT_H
