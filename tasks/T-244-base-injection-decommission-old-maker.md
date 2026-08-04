---
id: T-244
title: "Base+injection Phase 4 — decommission the old compile-per-user maker, clean up"
status: in-progress
type: refactor
created: 2026-07-27
updated: 2026-08-03
target-version: 0.7.0
links: [T-229, T-239, T-240, T-241, T-242, T-243, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-239, T-240, T-241, T-242, T-243]
---

# T-244 — Decommission the old maker

## Context
Once every module injects with INV-BYTES parity, remove the source-edit writers and the per-user compile
path; the injector becomes the only generator. See [strategy Phase 4](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Remove the source-text-edit writer code and the compile branch of the switch; simplify
`make.js`/`writer.js` (keep only base-build + injector). Re-run the full corpus via injection-only and
confirm identical output. Update the never-commit list / docs as needed.

Acceptance criteria:
- [x] Old compile-per-user path removed from delivery; injector is the sole generator of a player's ROM.
      (**Re-scoped 2026-08-03** — see the log: the compile path is *quarantined*, not deleted, and the
      source-edit writers stay because the injector derives its bytes from them.)
- [ ] Full corpus produces output equivalent to the compile path via injection only (GATE-3 by-symbol,
      not sha256 — [ADR-023](../docs/adr/ADR-023-injection-verified-by-data-equivalence.md) supersedes the
      "identical" wording this task was written with).
- [x] Dead code/docs cleaned; `cd randomizer && npm test` green.

## Progress log
- **2026-07-27** — Created (Phase 4).

- **2026-08-03 — scope corrected before touching anything.** The plan as written ("remove the source-edit
  writer code", "injector is the sole generator") is not implementable as literally stated, for two
  independent reasons found by reading the call graph:
  1. **The injector imports the writers.** 13 of them:
     `writer.applyWildPlanToEncounters`/`substituteWildSpecies`, `itemPriceWriter.patchPricesInContent`,
     `pokemonWriter.editSpeciesFile`, `moneyWriter`, `moveRelearnerPriceWriter`, `runAndBunWriter`,
     `stevenTagWriter`, `megaHiddenWriter`, `tradeWriter`, `evoLevelWriter`, `starterNameWriter`,
     `locationNameWriter`, `tradeNameWriter`. That is deliberate (`randomizer/docs/injection.md` §"Deriving
     writes from the compile path"): where a writer's rule is narrower than it looks, the module runs the
     writer's own function over the base source and injects the diff. Deleting the writers deletes the rule
     the injected bytes are derived *from*.
  2. **`compileOneRom` is GATE-3's reference.** `parity.mjs --compile-each` compiles each corpus bundle to
     answer "does the injector produce the data `compile()` produces?", and the `verify-corpus` skill and
     the corpus `manifest.json` rest on that. Deleting it makes the question unanswerable for every future
     upstream sync ([ADR-012](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md)) and every new
     writer — permanently, and precisely where [B-060](../bugs/B-060-mega-stone-map-items-never-injected.md)
     showed the coverage risk lives.

  Owner's call (asked, both options costed): **quarantine, don't delete.** So the deliverable is *"nothing
  can reach the compile path by omission"*, not *"the code is gone"*.

- **2026-08-03 — the inversion, in code.**
  - `injector/mode.js`: default flipped `compile` → **`inject`**; `--inject` added as a first-class flag
    that beats the env (T-238 only had `--compile` doing that); new
    `isCompileExplicitlyRequested()` — "was compile asked for *by name*", which is deliberately **not**
    `resolveBuildMode() === 'compile'`, since the default must never count as a request.
  - `make.js`: `buildOneRom` injects unless handed `mode: 'compile'`; **`compileOneRom` refuses to run**
    without an explicit request (`allowCompile`), so no programmatic caller can start a 4-minute `make` by
    accident. Banner prints `compile — GATE-3 REFERENCE PATH, not delivery`.
  - `backend/build/buildRom.js`: spawns `make.js … --inject` **explicitly**. Injection is already the
    default; the flag is what makes a stale `ROM_BUILD_MODE=compile` in a box env unable to regress
    production. Delivery is injection *by construction*, not by default. Drift-guarded by a test.
  - **`--randomize` + the interactive maker deleted** (~90 lines): "randomize fresh → mutate `src/` →
    `make`" *is* the old maker. Replacement documented in README / `docs/RANDOMIZER.md`:
    `analyze.js` for analysis, `golden-corpus/generate.mjs` to mint a bundle.
  - **New guard, and it is a real one:** the old `checkDataClean()` only protected the compile path (it
    mutates `data/maps/`). Injection has the mirror-image hazard — it *reads* the base's own `src/`, so a
    crashed run that left those files randomized would make injection write a **previous run's** values
    into the base and call it a fresh ROM. Added `checkInjectInputsClean()` over `src/ include/ data/maps/`
    (tracked modifications only — an untracked file there is not an injector input).
  - **Writer cleanup**, finishing the item [[T-247]] logged and deferred on 2026-08-01: the dead mail-mint
    `.replace` loop over 26 route `map.json`s (T-236 moved that placement into `gItemPicks`; verified again
    here — 0 `ITEM_WOOD/WAVE/MECH_MAIL` tokens under `data/maps/`, `Route103/map.json` now carries pick ids
    like `ITEM_ROUTE_103_JABOCA`), its 26-entry `routeFiles` list, `mapsBase`, and the now caller-free
    `resolveMailMints` + its 3 unit tests. The mint order still reaches the ROM through `itemAssignments` →
    `gItemPicks`.
  - **Two test files pinned the *old* spec and were inverted, deliberately** (a spec change, per the TDD
    rule — not a test bent to fit code): `randomizer/__tests__/unit/injectorMode.test.js` ("defaults to
    compile — injection is opt-in until parity is proven") and `backend/__tests__/buildMode.test.js`. They
    now pin the inversion plus the properties that carry it: no absence of configuration selects compile,
    `--inject` beats a compile env, `compileOneRom` refuses without an explicit request, and `buildOneRom`
    with no mode at all fails resolving the **base ROM** (the inject branch) rather than on
    "missing artifacts after resolution" (the compile branch). +8 tests net.
  - Suites green: randomizer **2152 passed** / 23 skipped, backend **218 passed**.

## Outcome
