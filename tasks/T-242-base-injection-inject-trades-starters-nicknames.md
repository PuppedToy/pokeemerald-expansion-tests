---
id: T-242
title: "Base+injection Phase 3 — inject trades + extra starters + nickname tables (Group B)"
status: done
type: feature
created: 2026-07-27
updated: 2026-08-03
target-version: 0.7.0
links: [T-229, T-238, T-237, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238, T-237]
---

# T-242 — Inject trades + extra starters + nicknames

## Context
Remaining Group-B outputs: in-game trades (scalar fields + the new accepted/base-form arrays + pointers),
extra starters (`sStarterExtraMon` + nickname/gender arrays, variable count), and the location/trade/
starter nickname string tables. See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Inject each into its reserved-capacity layout (T-237 made all of them fixed-width; nothing repoints).
One registry entry, four sub-writers, one gate over the corpus.

Writer audit, done before coding:

| output | writer | rule to mirror |
|---|---|---|
| starter trio | `writer.js` (`starterMonText`) | a **byte-for-byte** replace of the committed block — three `u16`s in `gStarterMon` |
| extra starters | `starterNameWriter.applyStarterChoose` | `gStarterExtraMon` + `gStarterExtraCount`, always rebuilt with exactly `extraStarters.length` entries; the unfilled tail is zero-filled by C, so it must be zeroed here too (B-049's lock-step rule) |
| starter / extra naming | same | `gStarterNickname`, `gStarterGender`, `gStarterExtraNicknames`, `gStarterExtraGenders`; names sanitized to `[A-Za-z0-9 ]`, ≤12 |
| location nicknames | `locationNameWriter` | rows **sorted by MAP_ key**, gender per row, plus `gLocationNicknameCount` in lock-step; a row whose name sanitizes to empty is still emitted |
| trade nicknames | `tradeNameWriter` | same shape, but rows whose sanitized name is **empty are dropped**, then sorted; count in lock-step |
| in-game trades | `tradeWriter` | the whole `gIngameTrades[]` block is regenerated from the artifact, so an index the artifact does not name becomes a **zero** entry, not the base's; nothing at all is written when the artifact is empty |

Three things this task needs that no earlier module did:

1. **Text is not ASCII.** `_("Milos")` compiles through `charmap.txt` (`'A' = BB`), terminated by `EOS`.
   A new `injector/charmap.js` reads that file — the mapping is never re-typed in JS — and the base's own
   `gIngameTrades[0].nickname` (`_("DOTS")`) proves the encoder before anything is written.
2. **`MAP_*` constants are bit expressions** (`(16 | (0 << 8))`), which `gameConstants` refused: it only
   evaluated `+ - ( )`. Extended to `|` and `<<`, still literals-and-constants only, so a
   config-dependent value keeps failing loudly.
3. **`struct InGameTrade` is the widest struct so far** (nickname, ivs, otId, conditions, personality,
   otName, the two fixed-capacity species lists…). It is verified the T-241 way: parse the committed
   `gIngameTrades[]` block, re-encode all four entries and byte-match them against the base ROM. That
   pins every field offset, the 128 B stride and the charmap encoder in one pass.

Acceptance criteria:
- [x] Trades injected (scalars + accepted/base arrays + pointers); INV-BYTES green. (The pointers are
      gone — T-237 inlined both species lists — so this is one flat 4 × 128 B table.)
- [x] Extra starters injected; INV-BYTES green.
- [x] Location/trade/starter nickname tables injected; INV-BYTES green.
      All three in one run: `parity.mjs --compile-each --by-symbol`, **ALL PASS — 12 pass / 0 fail**,
      2026-08-02, base `c144386ff4f3…`. Data equivalence per symbol, not image equality ([[B-057]]).

## Progress log
- **2026-07-27** — Created (Phase 3).
- **2026-08-02** — Started. Branch `feature/T-242-inject-trades-starters-nicknames` off T-241's. The
  audit above came first; the two surprises are that the ROM stores text in the game's own charset (so
  the injector needs a charmap encoder, not `Buffer.from(name)`) and that the two nickname writers
  disagree about empty names — location rows keep them, trade rows drop them.

- **2026-08-02 — MODULE DONE (local): 2 new files, 30 new tests, suite 2092 + backend 214 green.**
  - **`injector/charmap.js`** — `charmap.txt` + `EOS` as a name→bytes encoder. Single-character entries
    only (the file also names multi-byte sequences), first definition wins, and an unmapped character or
    an over-long name **throws** instead of producing plausible garbage.
  - **`gameConstants` learned `|` and `<<`** — `MAP_ROUTE101` is `(16 | (0 << 8))`, which the old
    evaluator refused. Still literals-and-constants only: a `(I_PRICE >= GEN_9) ? …` value keeps failing,
    with a test to say so.
  - **`modules/tradesStartersNicknames.js`** — four sub-writers. The two nickname tables reuse the
    writers' own `locationKeys()` / `namedTrades()` (both newly exported) so the filter, the sort and the
    drop-empty rule have one home; the starter arrays are rewritten whole with the tail zeroed (B-049's
    lock-step); and the trade table is built by running `tradeWriter.renderTradeData()` and parsing the
    C back, so the writer's fixed fields (otId 51436, `_("TRADER")`, IVs 15) are not copied into a second
    place.
  - **The base's own `gIngameTrades` is the struct's test.** The committed block is parsed, re-encoded
    and byte-matched against the ROM before anything is written — which pins the 128 B stride, every
    field offset **and** the charmap encoder, since the vanilla entries carry text (`_("DOTS")`,
    `_("KOBE")`) alongside hand-written IVs, otIds and personalities.
  - Dry run on a real bundle first: 4 trades (accepted lists 3/2/3/2), 134 location rows all resolving to
    a `MAP_*` constant and all encodable, 4 trade nicknames, 9 extra starters, longest name 8 characters.

- **2026-08-02 — GATE-3: one RED, one real finding, then GREEN 12/12.**
  - **The guard fired before the bug could**: `gTradeNicknames is 128 B for 8 entries, which is not
    14 B per row`. `struct TradeNickname` is 1 + 13 bytes of data, but **ARM rounds a struct's size up to
    a multiple of 4**, so its rows are 16 apart — while `struct LocationNickname` (3 + 13 = 16) needs no
    padding, which is exactly why adding up the fields looked right for one table and wrong for the
    other. Measured on the real base rather than reasoned about: the compiled `nicknames-on` ROM shows
    `gLocationNicknames` rows 16 B apart and the symbol sizes agree (2560 / 160 and 128 / 8).
    Fixed by **deriving** the stride from the symbol and keeping the declared size only as a floor — the
    same rule T-239 arrived at for `gSpeciesInfo`. Had the guard not been there, every row but the first
    would have been written 2 bytes early, silently, into a table that is all zeros in the base.
  - **GREEN: `ALL PASS — 12 pass / 0 fail`.** `nicknames-on` — the bundle with 134 location nicknames, a
    named starter and four trades — is the one that exercises all four sub-writers; every ROM writes the
    trio + 9 extra starters and the 4 trades. Compile hashes unchanged against the manifest again.

- **2026-08-03** — Closed. 12/12 corpus by symbol; nicknames, the named starter and the town trade verified in-game.

## Outcome

In-game trades, the starter trio + extra starters, and the location/trade nickname tables with their
counts — the outputs made of **text**, so `injector/charmap.js` encodes through `charmap.txt` + EOS
instead of copying bytes.

The two nickname writers disagree about an empty name (location keeps the row, trade drops it), so both
reuse the writers' own `locationKeys()` / `namedTrades()`; the trade table is built by running
`tradeWriter.renderTradeData()` and parsing the C back, keeping its fixed fields in one home. The
committed `gIngameTrades[]` block is re-encoded and byte-matched against the base, which pins the 128 B
stride, every field offset **and** the encoder at once.

`gameConstants` learned `|` and `<<` for the `MAP_*` ids. GATE-3 caught the last layout surprise:
`struct TradeNickname`'s 1 + 13 bytes occupy **16**, because ARM rounds a struct's size up to a multiple
of 4 — so the stride is derived from the symbol and the field sum is only a floor.
