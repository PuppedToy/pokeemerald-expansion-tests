---
id: T-194
title: Randomized town trades — relocate 4 trade NPCs, seed-driven trades, docs surfacing
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-23
updated: 2026-07-23
target-version: 0.6.0
links: []
blocked-by: []
---

# T-194 — Randomized town trades

## Context

New feature (owner request). Rework the game's 4 in-game trades into **seed-driven town trades**: relocate the 4 trader NPCs next to each town's Poké Mart, give them a uniform sprite, and make each offer a **randomized** Pokémon (given at that town's gym level cap) in exchange for a **randomized family set** derived from that town's route wild encounters. The trades must be consistent between the analysis docs and the built ROM, and vary per ROM seed (so nuzlocke / soul-link ROMs get different trades). The docs viewer must surface each trade, gated by a new visibility toggle.

Vanilla baseline (the 4 in-game trades) and where each fact lives:
- Trade data / offered mon: `sIngameTrades[]` — [src/data/trade.h:985](../src/data/trade.h#L985); struct `struct InGameTrade` — [src/trade.c:151](../src/trade.c#L151).
- Trade IDs enum: [include/constants/trade.h:8](../include/constants/trade.h#L8) (`INGAME_TRADE_SEEDOT/PLUSLE/HORSEA/MEOWTH`).
- Trigger scripts (identical pattern per map): e.g. [data/maps/RustboroCity_House1/scripts.inc:4](../data/maps/RustboroCity_House1/scripts.inc#L4) — specials `GetInGameTradeSpeciesInfo` / `ChoosePartyMon` / `GetTradeSpecies` / `CreateInGameTradePokemon` / `DoInGameTradeScene`, gated by a per-map completion flag.

Supporting infra that already exists (no need to build from scratch):
- Level caps: `randomizer/bossCaps.js` parses `src/caps.c` `sLevelCapFlagMap`. Values — Roxanne `FLAG_BADGE01_GET`=**13**, Flannery `FLAG_BADGE04_GET`=**36**, Winona `FLAG_BADGE06_GET`=**46**, Tate&Liza `FLAG_BADGE07_GET`=**56**.
- Tiers: `pokemon.rating.tier` (`'RU'|'UU'|'OU'|'UBERS'|…`, see `randomizer/constants.js` `TIER_*`/`TIER_SEQ`); family peak tier is `pokemon.rating.bestEvoTier`; per-level tier is `pokemon.contextualRatings[capLevel].tier`.
- Evolutions: `pokemon.evoTree` (branching family, stage-ordered nested array), `pokemon.family`, `pokemon.evolutions`; helpers `devolveToBase` / `devolveToLevel(level)` / `tryEvolve` / `isValidEvolution` / `checkValidEvo` (`randomizer/modules/utils.js`, `randomizer/modules/trainerSelector.js`). Evo levels are themselves rebalanced (`randomizer/evoLevelWriter.js`) so read `evolutions[].param` from the current run.
- Wild encounters: `rom.artifacts.wild.wildPlan[template]` = randomized species array per method; route→template map in `randomizer/wild.js` `maps`. Route 101 = land only (template ZIGZAGOON, **no rod**); 102 land=WURMPLE/old=WINGULL; 103 land=SMEARGLE/old=SURSKIT; 104 land=GEODUDE/old=WEEDLE. Deterministic ⇒ 1 species/slot; classic ⇒ up to 12 (land) / 2 (old rod).
- Seed: `randomizer/seeds.js` `deriveRomSeed(runSeed, romIndex)` seeds the RNG per ROM before the wild module in BOTH `randomizer/generate.js` and `make.js`. New trade selection must run in that same per-ROM window (or reseed via `deriveSeed(romSeed, TRADE_INDEX)`).
- Docs visibility: `randomizer/docsVisibility.js` `DOCS_VISIBILITY_DEFAULT` + `redactWildPokes` (bakes redaction at generation time); frontend mirror in `frontend/js/config-form.js`.
- Viewer (single template, client-rendered): `frontend/template.html` — wild route card loop ~[1979-2093], per-slot card ~[2056-2063]; modal `buildPokemonDetailHTML` ~[2352]; "Obtainable in …" line `docBoxSectionHTML` ~[3503-3521]; reusable `sprite(id,sz)` ~[3151], `getIcon(name,fb)` ~[1416], `.evo-link[data-id]`→modal delegated handler ~[2383-2390].

## Requirements (owner spec, verbatim intent)

1. **Relocate + reskin the 4 trade NPCs.** Move them out of their houses to stand immediately **left of each town's Poké Mart door**, all with the same sprite (a kid with a Game Boy → `OBJ_EVENT_GFX_GAMEBOY_KID`, id 189, exists). Mapping: trade 1 → **Rustboro** (stays), trade 2 → **Fortree** (stays), trade 3 → **Lavaridge** (from Pacifidlog), trade 4 → **Mossdeep** (from Battle Frontier). Mart-left tiles: Rustboro (15,45), Fortree (3,14), Lavaridge (14,5), Mossdeep (36,18).
2. **Each trades one randomized thing** (applied in BOTH randomizer analysis and maker ROM build; seed-driven, per ROM). Message = two sentences: (a) what they offer, (b) the list of **base forms** of what they want. E.g. "I offer my Shiftry. / In return I want Rattata or Wurmple." Accept ANY evolution stage of those families.
   - 2.1 Rustboro: accepts Route **101 grass** families; offers a **RU**-tier mon at **Roxanne** cap (max-evo tier also RU; always a valid evo at that cap).
   - 2.2 Lavaridge: accepts Route **102 grass ∪ old rod** families; offers a **UU**-tier mon at **Flannery** cap.
   - 2.3 Fortree: accepts Route **103 grass ∪ old rod** families; offers an **OU**-tier mon at **Winona** cap.
   - 2.4 Mossdeep: accepts Route **104 grass ∪ old rod** families; offers an **Ubers**-tier mon at **Tate&Liza** cap.
3. **Docs.**
   - New wild-encounters visibility toggle "show trades" ON/OFF (default ON).
   - When ON: (3.1) inside the grass/old-rod encounter cards of routes 101/102/103/104, a sub-card with 3 lines — line 1 caption `TRADE`; line 2 location icon + town; line 3 gift icon + clickable mini sprite (→modal) + offered name + level (e.g. "Shiftry Lv. 36"). (3.2) In the Pokémon modal, right below the "Obtainable in RouteXXX" line, in the same box, the same sub-card (offered mon clickable).

## Viability — CONFIRMED (research 2026-07-23, four parallel probes)

Feasible end to end; engine footprint is small. Summary of the key decisions the research settled:

- **Multi-species acceptance needs no engine change** in principle: acceptance is a script-side compare of `GetTradeSpecies` result vs the requested species. Two viable designs (see Open Questions / plan): (A) generate a per-ROM `goto_if_eq` chain in the town `scripts.inc`; (B) small engine change — a requested-species **list** + a membership special — keeping `scripts.inc` static and confining per-ROM variation to `sIngameTrades[]` data.
- **Offered-mon level DOES need a small engine change.** Today the received mon is created at the level of the mon the player gives ([src/trade.c:4555](../src/trade.c#L4555)). Add a `level` field to `struct InGameTrade` (use it when non-zero; fallback = vanilla). Engine C changes build/test only in CI/builder (no local GBA toolchain — see memory).
- **Docs↔ROM consistency + per-ROM seed**: decide the 4 trades once in a new module at generate time (same per-ROM seed window as the wild module), store in `rom.artifacts.trades`, and have BOTH the docs generator (`writerDocs.js`) and the ROM writer consume that artifact. Mirrors how wild encounters flow (`rom.artifacts.wild`).
- **Tiers / caps / evolutions**: all needed helpers exist and are the same ones trainer-team building uses (`rating.tier`/`bestEvoTier`/`contextualRatings`, `devolveToLevel`, `checkValidEvo`, `bossCaps`).
- **Viewer**: single template `frontend/template.html`; sub-card slots into the route-card loop and the modal box section; reuse `sprite`/`getIcon`/`.evo-link`. Template render is the one untested layer (per CLAUDE.md); all `randomizer/` logic is Jest-testable.
- **Pipeline/policy caveat**: `data/maps/**` is in the never-commit "mutated" set, but `analyze.js` only reverts *uncommitted* drift (`git restore` to HEAD) and the writer does not reformat these 4 towns' files. So the **static relocation** (map.json object events + a static town trader script) must be **committed base source**; the **per-ROM trade content** lives in generated data (`src/data/trade.h`, added to the never-commit list) — resolve this split explicitly (likely a short ADR).

## Plan

Layered, TDD where logic is in `randomizer/` (Red→Green). Build order roughly: shared selection module → maker/writer → docs data → viewer → engine/map relocation (CI-verified). Nothing merges to `done` without owner manual test (batch at the end).

**A. Shared trade-selection module (`randomizer/` — Jest-tested)**
- New `randomizer/trades.js` (+ `__tests__/unit/trades.test.js`): pure `selectTrades({ pokes, wildArtifact, caps, evoData, rng/seed })` → 4 `{ townKey, ingameTradeId, offeredSpecies, level, acceptedFamilies[], acceptedBaseForms[], offerName, wantList }`.
  - Offered mon: candidate pool by tier per the resolved interpretation (Open Q1), then `devolveToLevel(peak, cap)` for a cap-valid evo stage; seed-driven `sample`.
  - Accepted set: union of the route method species (Open Q2 breadth) expanded via `evoTree` to full families; base forms via `devolveToBase`.
- Wire into `randomizer/generate.js` right after the wild module (same per-ROM seed); store `rom.artifacts.trades`.

**B. Maker / ROM writer**
- New `randomizer/tradeWriter.js` (+ tests): consume `rom.artifacts.trades`; write offered species + `level` (+ requested-species data per the chosen acceptance design) into `src/data/trade.h`; write the message text and (design A) the accept chain into the 4 town `scripts.inc`. Invoke from `randomizer/writer.js`. Add `src/data/trade.h` (and any generated town `scripts.inc`) to CLAUDE.md never-commit list.

**C. Engine (tracked C — CI-verified)**
- Add `u16 level` to `struct InGameTrade` ([src/trade.c:151](../src/trade.c#L151)); use it in `CreateInGameTradePokemonInternal` when non-zero. Update `sIngameTrades[]` initializers.
- If acceptance design B: add requested-species list field(s) + a `IsRequestedTradeMon` special + list-name buffering for the message.

**D. Map relocation (tracked base source — committed, CI-verified)**
- Add `OBJ_EVENT_GFX_GAMEBOY_KID` object events to `RustboroCity`, `FortreeCity`, `LavaridgeTown`, `MossdeepCity` `map.json` at the mart-left tiles (verify collision in Porymap; fallback `y+1`). Add a static town trader `EventScript` per city `scripts.inc` reusing the existing `INGAME_TRADE_*` + completion flags. Remove the 4 in-house NPCs + their now-unused house scripts.

**E. Docs viewer + config toggle**
- Add `showTrades` (default true) to `randomizer/docsVisibility.js` and `frontend/js/config-form.js` (default, id↔key map, checkbox in `#dv-wild-methods`, read/set, grey-out); thread through worker/backend (already pass-through). Attach trade data to the relevant route entries + redact when off in `redactWildPokes`/`writerDocs.js`.
- `frontend/template.html`: render the 3-line sub-card in the route-card loop (3.1) and in the modal box section below "Obtainable in" (3.2), reusing `sprite`/`getIcon`/`.evo-link`. Rebuild browser bundle (`node build.js`) after `randomizer/` module edits (see memory: green tests ≠ browser has it).

Acceptance criteria:
- [ ] 4 trader NPCs stand left of each town's mart with `OBJ_EVENT_GFX_GAMEBOY_KID`; in-house NPCs removed; trades trigger and complete (flag-gated) — verified on a built ROM. *(Layer C/D — ROM side, CI/owner-verified)*
- [x] Each trade offers a seed-driven tier-appropriate mon at the correct gym cap level and valid evo stage (selection logic + tests); accepts any evolution of the route's representative grass(+old rod) families. *(message base-form list is Layer B/C, ROM side)*
- [x] Same seed ⇒ identical trades in docs and ROM (decided once at generate time, stored in `rom.artifacts.trades`, consumed by both docs and the maker); different ROM index ⇒ different trades.
- [x] `showTrades` toggle (default ON) present in the config UI; OFF removes trade data from generated docs.
- [x] Sub-card renders in route cards (101–104) and in the obtainable-mon modal, clickable to the offered mon. *(verified via shoot screenshots)*
- [x] `cd randomizer && npm test` green (1628); browser bundle rebuilt; frontend config tests 63/63.
- [ ] `node scripts/check-tracker.mjs` clean at close.
- [ ] Owner manual-tests the batch and confirms OK before close.

## Decisions (owner-resolved 2026-07-23)

1. **Tier of the offered mon = STRICT.** The offered form must be tier X evaluated AT the cap level (`contextualRatings[capLevel].tier === X`) AND the family peak must be X (`rating.bestEvoTier === X`). Given at the cap level in a valid evo stage (`devolveToLevel`). X per town: Rustboro RU, Lavaridge UU, Fortree OU, Mossdeep Ubers.
2. **Accepted set = REPRESENTATIVE species only.** Use the representative species per method (`route[method]` / `replacementLog[template]`) — Route 101 grass (1); Routes 102/103/104 grass + old rod (≤2). Expand each to its full evolution family (`evoTree`); accept any stage; message lists the 1–2 base forms. Same in deterministic and classic.
3. **Engine approach = DATA-DRIVEN.** Small engine change: `struct InGameTrade` gains `level` + a requested-species **list** (+ count) and a membership special; the message's wanted-list is buffered in C from the base forms. The 4 town `scripts.inc` stay static & committed; per-ROM variation lives only in generated `src/data/trade.h`.
4. Offered level = post-badge cap: Roxanne **13** / Flannery **36** / Winona **46** / Tate&Liza **56**.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-23** — Task created. Ran four parallel viability probes (tiers/caps/evolutions, wild encounters + seed, map object-events + sprites, viewer/docs). Findings and file:line references recorded above; core confirmed feasible with a minimal engine change (offered-mon `level` field). Two owner decisions blocked the selection logic; relocation/toggle/viewer work unblocked.
- **2026-07-23** — Owner resolved the 3 decisions (see Decisions section): strict tier (contextual-at-cap AND bestEvo), representative-only accepted set, data-driven engine approach. Set in-progress; starting layer A (shared `randomizer/trades.js` selection module, TDD).
- **2026-07-23** — Branch `feature/T-194-randomized-town-trades`. Data probe: strict-rule pools are healthy (RU@13=29 families, UU@36=93, OU@46=51, Ubers@56=30), so the widening fallback is a rare safety net. **Layer A done (Green):** `randomizer/trades.js` `selectTrades()` — local mulberry32 seeded via `deriveSeed(seed, townIdx)` (isolated from the global stream, deterministic per ROM); strict offered-mon rule via `bestEvoTier` + `contextualRatings[nearestCap(cap)].tier` + `devolveToLevel`; representative accepted families via `replacementLog`+`evoTree`+`devolveToBase`. `__tests__/unit/trades.test.js` 9/9. Real-data smoke test looks right (e.g. seed 42 → Rustboro Oranguru@13, Lavaridge Indeedee-M@36, Fortree Kommo-o@46, Mossdeep Dialga@56).
- **2026-07-23** — **ROM side implemented (Layers B/C/D) — CI/owner build required to verify (no local GBA toolchain).** Committed `118cdcc`: engine C (`struct InGameTrade` + `level` + accepted/base-form lists; specials `BufferInGameTradeOffer` + `IsRequestedTradeMon`; `def_special` ×2; nickname/level guards) + `tradeWriter.js` (8 tests) wired into `writer.js`; `src/data/trade.h` added to never-commit list. Verified locally: `def_special` is assembly (`.4byte`), so the non-static specials link with no header (matches existing trade specials); `EOS`/`bool8`/`FALSE`/`PARTY_NOTHING_CHOSEN` all in scope; `applyTradesToContent` regex matches the real trade.h and preserves `sIngameTradeMail[]`; `analyze` logs "Writing town trades…" and restores src cleanly. **Maps/scripts (this commit):** relocated the 4 traders to `OBJ_EVENT_GFX_GAMEBOY_KID` at each mart's left tile (Rustboro 15,45 / Fortree 3,14 / Lavaridge 14,5 / Mossdeep 36,18) — appended at the END of each city's `object_events` (no local-id renumbering) and removed from the 4 house maps (no numeric local-id refs → safe; dead house EventScripts left inert). Added a static generic trader `EventScript` + texts to each city `scripts.inc` (reuses the existing `INGAME_TRADE_*` slot + completion flag; Lavaridge reuses `FLAG_PACIFIDLOG_NPC_TRADE_COMPLETED`, Mossdeep reuses `FLAG_BATTLE_FRONTIER_TRADE_DONE`). map.json edits kept format-identical (`JSON.stringify(…,2)+"\n"`). REMAINING: owner builds the ROM (CI/builder) and manual-tests the 4 trades in-game.
- **2026-07-23** — **Layer E (viewer + toggle) done, verified visually.** `frontend/template.html`: shared `window.buildTradeCardHTML(trade)` (3 lines: TRADE / 📍 town / 🎁 clickable offered sprite + "Name Lv. N", via the delegated `.evo-link`→modal); rendered in the route card (below `.enc-slots`) and appended in the modal box section below "Obtainable in …" (extended `findObtainable` to carry `route.trade`). `frontend/js/config-form.js`: `show-trades` toggle in `#dv-wild-methods` + DEFAULT + id↔key map. Fixture builder (`visual-tests/fixtures/build-doc-sample.cjs`) now computes+passes trades (it reproduces generateDefault standalone). Verified: `npm run fixture` bakes trade onto routes 101-104; `shoot --only docs-encounters` → no horizontal overflow at any viewport; screenshots confirm the sub-card on Route101 and in Tentacool's modal ("Obtainable in Route101" + TRADE / Rustboro / Pincurchin Lv.13). Frontend config tests 63/63. Browser bundle rebuilt (`node build.js`; bundle is gitignored). NOTE: two docs paths again — `writerDocs`/fixture (browser) and `writer.js` (analyze/maker); the fixture builder needed its own trade wiring like generate.js.
- **2026-07-23** — **Pipeline wiring done + committed (`ae5632c`).** IMPORTANT architecture finding: there are TWO wildPokes assembly paths — `writerDocs.js` (bundle→browser via `generate.js`) and `writer.js` (analyze `index.js` + maker `make.js`, writes `out.html`/`rom-*.html`). Wired trades into BOTH: `generate.js` stores `rom.artifacts.trades` (maker consumes it, so docs↔ROM identical) and feeds `writerDocs` (attaches `.trade` to the route entry); `writer.js` gained a `trades` param — attaches `.trade` to inline maps for the analyze path (the maker path reuses `docs.wildPokes` which already has it). `index.js`/`make.js` (both build sites) compute/pass trades. `showTrades` toggle added to `docsVisibility` DEFAULT + redactor. Full suite green (1628). Verified via `node analyze.js --no-balance --seed=42`: routes 101-104 in `output/wildpokes.js` now carry `trade` (Oricorio-Pom-Pom@13 / Lilligant@36 / Iron-Jugulis@46 / Chien-Pao@56). Next: viewer render (template.html) + config-form toggle UI, then maker trade.h writer + engine C + map relocation.

- **2026-07-23** — Merged to master (`merge: T-194`). **Owner refinements (post-merge):** (1) trade sub-card now renders at ENCOUNTER level — attached to the wanted species' grass/old-rod tile (full-width row spanning the encounter grid), not route level; (2) modal shows the card ONLY on the exact wanted grass/old-rod species (not every family member); (3) card is full-width + larger text; (4) the Rustboro trade moved to **Dewford** (town label + NPC relocated; Dewford has no mart, so placed left of the Pokémon Center door at 1,10 — collision to verify in Porymap; keeps RU/Roxanne-cap/Route-101/INGAME_TRADE_SEEDOT/FLAG_RUSTBORO_NPC_TRADE_COMPLETED); (5) accepted set is now ONE random species from the route's grass∪old-rod pool (all wildPlan species, not the per-method representatives) → its whole family; `trades.js` gains `wantedSpecies` + `routeEncounterPool`/`chooseWanted`. Tests updated (10). Verified via shoot: Route101 card sits under the Tentacool (wanted) tile, full-width, "📍 Dewford / 🎁 Pincurchin Lv.13". CAVEAT LEARNED: `visual-tests/fixtures/build-doc-sample.cjs` runs `git checkout -- data/maps` after building — commit map edits before running `npm run fixture` or they revert.

- **2026-07-23** — Dewford trade now uses **Brawly's** cap (`FLAG_BADGE02_GET` = 20), not Roxanne's — the offered mon's level follows the town's own gym. Only `trades.js` (capFlag) + its test fixture changed; the level flows through to the docs card and `trade.h` automatically. Real-data check: Dewford offers RU mons at Lv.20 (e.g. Cramorant/Phione/Spiritomb). Suite green (1637).

- **2026-07-23** — Trader NPCs repositioned to each town's **Pokémon Center** (not the mart), one tile down-and-left of the PC door warp `(x-1, y+1)`: Dewford PC(2,10)→(1,11); Lavaridge PC(9,6, the signed front door — a 2nd unsigned warp at 9,2 ignored)→(8,7); Fortree PC(5,6)→(4,7); Mossdeep PC(28,16)→(27,17). Coord-only map.json edits. (Collision still to confirm in Porymap/build.)

- **2026-07-23** — Deployed (owner go-ahead; origin/master == local `eccd1b2`). `deploy/update.sh`: preflight green (randomizer/backend/frontend tests + tracker), bundle rebuilt, working tree rsynced to the box, Linux decomp tools recompiled, app recreated, health-check OK → live at https://pokemon-emerald-cut.com. This ships the web/docs side (trade sub-cards + `showTrades` toggle). The ROM side (engine C + maps + trade scripts) is on the box too but still needs an actual ROM build + in-game manual test before the task closes.

- **2026-07-24** — **Bug found + fixed: B-051** (owner-reported). When you offer a town trader the *wrong* mon, the rejection message showed `I want /314` (a `"/<maxHP>"` string) instead of the requested species. Root cause: both trade texts print the requested species via `{STR_VAR_1}` = `gStringVar1`, but `special ChoosePartyMon` runs between the offer and the wrong-mon branch and clobbers `gStringVar1` with the party-menu HP-bar string (`src/party_menu.c`: `StringCopy(gStringVar1, gText_Slash); StringAppend(gStringVar1, gStringVar2)`). The 4 T-194 wrong-mon branches `msgbox`'d without re-buffering (the vanilla single-species scripts, e.g. RustboroCity_House1, re-buffer right before their wrong-mon message — the pattern I omitted). Confirmed empirically first that the *randomizer* output is clean (6+ seeds, both wild modes → all `SPECIES_*` tokens; writer never emitted numbers), and that the C name path sanitizes any bad id to `"??????????"`, so "/314" had to be a stale-`gStringVar1` clobber — the owner's clue "offer message right, only the wrong-mon message wrong" pinpointed it. **Fix:** added `special BufferInGameTradeOffer` at the top of each `..._EventScript_TradeWrongMon` (Dewford/Lavaridge/Fortree/Mossdeep); `VAR_0x8004` is already the trade index there. Regression test `randomizer/__tests__/unit/townTradeWrongMonBuffer.test.js` (FAIL→PASS), full suite green (1647). Structural guard only (no local GBA build) — needs a ROM build + in-game check to confirm, same as the rest of the ROM side.

## Outcome

<!-- Filled when closing. -->
