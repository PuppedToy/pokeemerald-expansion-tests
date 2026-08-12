---
id: T-274
title: Make the shiny rule configurable (quality or classic luck) and add starter IV floors
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-08-12
updated: 2026-08-12
target-version: 0.9.0
links: [T-168, T-234, T-257, randomizer/docs/randomization-options.md, randomizer/docs/injection.md]
blocked-by: []
---

# T-274 — Make the shiny rule configurable (quality or classic luck) and add starter IV floors

## Context

Commit `5d98097` replaced gen 3's PID/OT-id shiny lottery with a deterministic **quality** rule: a mon is
shiny iff its 6 IVs sum to `P_SHINY_IV_THRESHOLD` (150) or more. That is a compile-time `#define`, the
classic system was deleted outright, and the starter's IV floor in `CB2_GiveStarter` (3 forced perfect IVs,
then top up to the shiny threshold) is hard-coded against the same constant.

The owner wants all of it in the frontend config: pick **quality** or **classic luck** per run, tune the
number behind whichever is picked, always see the human-terms odds ("1 in 205"), and set the starter's
IV floors independently.

Nothing here draws pipeline RNG — like the T-257 league rules these are **ROM behaviours** carried in
`bundle.config` and patched into the runtime settings block `gRandomizerSettings` (T-234 / ADR-022), so
they need a **base rebuild** before an inject-mode deploy can serve them.

## Plan

Five new fields in `struct RandomizerSettings`, read through the existing `noipa` accessor:
`shinyByQuality`, `shinyIvThreshold`, `shinyOdds` (out of 65536), `starterPerfectIvs`, `starterMinIvTotal`.

1. **Pure math SSOT** — `randomizer/shinyRules.js`: defaults, `%` → odds-out-of-65536, exact
   `P(IV total ≥ T)` (DP over 6×[0,31]), and the "1 in N" text both the UI and the docs show.
   `frontend/js/shinyRules.js` is its ESM mirror (the browser cannot require CJS), guarded by a parity
   test that sweeps both implementations.
2. **Engine** — `GetBoxMonData3(MON_DATA_IS_SHINY)` branches on the mode: IV total ≥ threshold, or the
   restored classic `(GET_SHINY_VALUE(otId, personality) < odds) ^ shinyModifier`. `CreateBoxMon`'s
   deleted classic roll (force flags, Shiny Charm / lure / fishing-chain / DexNav rerolls) comes back
   behind the mode check, so classic mode is the real old system, not an approximation. `CB2_GiveStarter`
   reads the two starter floors instead of `P_SHINY_IV_THRESHOLD`.
3. **Writer + injector** — `randomizer/shinyWriter.js` patches the five initializers (compile path,
   `make.js`); `structLayout.js` + the `dataDrivenAndToggles` module carry the same bytes (inject path).
4. **Frontend** — a new **Shiny Pokémon** config category (toggle + IV-total slider + `%` field + the live
   "1 in N" line) and two sliders under *Starter quality*; both round-trip through Save/Load, `lastConfig`
   and the run summary.
5. **Docs viewer** — the gold IV tint stops being hard-coded at 150: it follows the run's threshold in
   quality mode and **disappears in classic mode** (owner decision — nothing in the IVs implies shiny
   there). The rule rides into each doc as a new injected global (both the Node and browser doc builders).

Acceptance criteria:
- [x] `randomizer/shinyRules.js` computes the odds/probability/text; unit-tested, and the ESM mirror is
      proven identical by a parity test.
- [x] Shiny Pokémon category: toggle default **ON**, IV-total slider 0–186 default **150**, `%` field
      default gen 3 (`0.0122` ⇒ exactly 8/65536 ⇒ 1 in 8,192), and a "1 in N" line that tracks whichever
      of the two is active.
- [x] Starter panel: *perfect IVs* slider 0–6 default **3** and *minimum IV total* slider 0–186 default
      **150**, applied to the chosen starter only (owner decision).
- [x] The five values reach the ROM on both paths: `shinyWriter` patches the initializers and the
      injector writes the same bytes at the struct's offsets (injector test asserts the layout).
- [x] Engine: quality mode unchanged from today at the defaults; classic mode restores PID/OT-id
      shininess. *(Restored at the read seam only — see the 2026-08-12 log. Owner-validated manually; the
      C compile itself is CI/builder-only, there is no GBA toolchain locally.)*
- [x] Docs viewer tint follows the run's rule (threshold in quality mode, no tint in classic).
- [x] `cd randomizer && npm test` and `cd frontend && npm test` green; `node build.js` re-bundled
      (injector layout changed); `randomization-options.md` + `CHANGELOG.brooktec.md` updated.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-12** — Task created. Surveyed the ground first: the quality rule has exactly one read seam
  (`GetBoxMonData3(MON_DATA_IS_SHINY)`), `5d98097` is the commit that deleted the classic roll (so the
  restore can be faithful rather than reinvented), and the starter floor lives in `CB2_GiveStarter`.
  Owner decisions taken up front: no gold IV tint in the docs in classic mode, and the starter IV floors
  apply to the chosen starter only (extra starters keep ordinary random IVs).

- **2026-08-12** — Implemented, both suites green (randomizer 2483, frontend 249). Decisions and deviations:

  - **Classic mode is restored at the read seam only.** `IsBoxMonShinyByRule` gives back
    `(GET_SHINY_VALUE(otId, personality) < odds) ^ shinyModifier`, which *is* gen 3's rule. The plan said
    the deleted `CreateBoxMon` block would come back too; it does not. Everything in it is unreachable
    here — the Shiny Charm is never placed by the item randomizer, `I_FISHING_CHAIN` is FALSE,
    `P_ONLY_OBTAINABLE_SHINIES` / `P_NO_SHINIES_WITHOUT_POKEBALLS` are FALSE and both `P_FLAG_FORCE_*`
    flags are 0 — so restoring it would add RNG draws and a dozen new includes to `pokemon.c` for behaviour
    no player can reach, with no local compiler to catch a mistake. Documented in
    `randomization-options.md`.
  - **`P_SHINY_IV_THRESHOLD` is gone** (`include/config/pokemon.h`). Keeping it would have made two homes
    for "150"; the defaults now live only in `src/randomizer_settings.c`, like every other tunable in that
    struct. Upstream's unused `SHINY_ODDS` stays, with a comment pointing at the runtime home.
  - **Struct grew 20 → 28 bytes with every existing offset unchanged** (the new `bool8` fills the padding
    hole at 19, then a `u32` at 20, a `u16` at 24 and two `u8`s at 26/27). `structLayout.js`, the synthetic
    base fixture and `parseSettings`' descriptor list were widened together.
  - **Two deliberate test-spec changes**, both because the specification itself changed: the injector's
    "the committed source holds all seven fields" is now twelve fields, and T-168's
    `shiny-iv-badge.test.js` no longer asserts a hard-coded `ivTotal >= 150` — the tint follows the run's
    injected rule, with the old 150 as the fallback for docs from older bundles.
  - **The frontend keeps a hand-written ESM mirror of `shinyRules.js`** because a browser module cannot
    require the pipeline's CommonJS. Rather than trust a comment, `shiny-rules-parity.test.js` requires the
    CJS module through `createRequire` and sweeps *every* IV threshold plus a spread of percentages and
    junk configs through both — so drift fails a test, not a play-test.
  - `scripts/base-state.mjs` correctly reports **rebuild-required (path 2)** for these C changes, so the
    deploy will know to run `build-base.sh` as well.

- **2026-08-12** — Previewed the two panels in Chromium at 1440 and 375 px, in both modes and with the
  threshold moved to 170: the toggle swaps the right control, the "1 in N" line follows the active number
  and the starter note flips between guaranteed-shiny and not. Two polish changes came out of looking at
  it: the starter note gets its own line, and it turns the docs' shiny gold (`#FFD43B`) when the floors
  clear the run's threshold, so the config panel and the generated documentation agree at a glance. Also
  wired the shiny rule into `visual-tests/fixtures/build-doc-sample.cjs` — the third copy of
  `buildDocHtml`, which has to stay in lock-step with app.js — with a `SHINY_JSON` env override so a
  classic-mode fixture can prove the viewer stops tinting. Both fixtures rebuilt; `npm run shoot` reports
  no horizontal overflow at any viewport.

- **2026-08-12** — Owner validated manually and asked to close. Closing.

## Outcome

The run decides what "shiny" means. A new **Shiny Pokémon** config section carries the toggle
(`shinyByQuality`, default on), the IV-total slider (0–186, default 150) and the classic percentage field
(default 0.0122% ⇒ exactly 8/65536 ⇒ gen 3's 1 in 8192), with a line under them that states what the
active number actually works out to ("About 1 in 205 wild Pokémon will be shiny") in **both** modes. Two
sliders under *Starter quality* set the chosen starter's forced perfect IVs (0–6, default 3) and its
minimum IV total (0–186, default 150), with a note that says whether those floors clear the run's shiny
bar — gold when they do.

All five values live in `gRandomizerSettings` and reach the ROM on both paths (`randomizer/shinyWriter.js`
for the compile path, the `dataDrivenAndToggles` injector module for the inject path; the struct grew
20 → 28 bytes with every earlier offset unchanged). The engine reads them at its one shiny seam,
`GetBoxMonData(MON_DATA_IS_SHINY)` → `IsBoxMonShinyByRule` (`src/pokemon.c`), and in `CB2_GiveStarter`.
`randomizer/shinyRules.js` is the single home of the maths, mirrored as ESM for the browser and pinned by
a parity test that sweeps every threshold through both implementations. The generated docs carry the rule
and tint an IV line gold only when that total really means shiny — never in classic mode.

Deviations from the plan, both logged above with their reasoning: **classic mode is restored at the read
seam only** (the deleted `CreateBoxMon` re-roll block stays deleted — charm, lure, fishing chain, DexNav
and the force flags are all unreachable in this hack), and **`P_SHINY_IV_THRESHOLD` was removed** rather
than kept as the seed for the struct's default, so "150" has exactly one home.

Two follow-ups belong to the owner, not to a new task: the deploy must take **path 2**
(`update.sh` + `build-base.sh`, which `scripts/base-state.mjs` already reports), and the golden-master
corpus baseline has to be **recaptured** on the build box — the ROM changed on purpose.
