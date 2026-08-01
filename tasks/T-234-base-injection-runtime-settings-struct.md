---
id: T-234
title: "Base+injection Phase 2 — runtime settings struct (money + move-relearn price)"
status: done
type: refactor
created: 2026-07-27
updated: 2026-08-01
target-version: 0.7.0
links: [T-229, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-232, T-233]
---

# T-234 — Runtime settings struct (money + relearn price)

## Context
Prize money (`#define`×3 in `battle_script_commands.c`) and move-relearn price (`#define` in
`move_relearner.c`) compile to immediates inside functions → not injectable. Make them data. See
[strategy Group C](../docs/base-plus-injection-strategy.md#group-c--currently-map-script--define-must-be-redesigned-to-data-driven-in-the-base).

## Plan
Add a fixed-offset **runtime settings struct** in the base; have `GetTrainerMoneyToGive` and
`GetMoveRelearnerMoveCost` read from it. Point the current writers at the struct value (unchanged logic).
Verify via T-233 (INV-BEHAVIOR: same gameplay; new golden master snapshot for these regions).

Acceptance criteria:
- [x] Settings struct added; money + relearn read from it at runtime — disasm confirms real loads via
      `GetRandomizerSettings()` (e.g. `bl GetRandomizerSettings; ldr r0,[r0,#12]`), NOT folded immediates.
- [x] Randomizer produces the correct effective values end-to-end: the `economy` bundle → the built ROM's
      struct holds `999/9999/12345/0`; defaults → `250/3000/5000/250`. Randomizer suite green (1697 pass).
      (T-233 will show an EXPECTED whole-corpus MISMATCH — the base changed by design; re-snapshot after
      owner sign-off.)
- [x] `make` compiles (-O2 -flto -Werror, exit 0); `gRandomizerSettings` exposed in the `.map` (base
      offset `0x08bf0040` / ROM `0xbf0040`, 4×u32) — injectable.
- [x] Owner play-test — signed off 2026-08-01 via the **consolidated** T-236 play-test ROM (T-234+235+236
      in one run) rather than the dedicated `economy` ROM: money and move-relearn pricing behaved normally
      with default values, i.e. the struct reads work in-game. See the caveat in Outcome.

## Progress log
- **2026-07-27** — Created (Phase 2).
- **2026-07-28** — Implemented. New `include/randomizer_settings.h` + `src/randomizer_settings.c` define
  `const volatile struct RandomizerSettings gRandomizerSettings` (trainerMoneyNormal/Boss/Gym +
  moveRelearnerCost, defaults 250/3000/5000/250). `const` keeps it in ROM (.rodata); `volatile` forces real
  loads so -O2/LTO can't constant-fold the values (which would defeat injection). Engine now reads from it:
  `battle_script_commands.c` GetTrainerMoneyToGive (gym/normal/boss + museum/space derived at runtime from
  boss), `move_relearner.c` GetMoveRelearnerMoveCost. Rewired `moneyWriter.js` + `moveRelearnerPriceWriter.js`
  to patch the struct initializers in `randomizer_settings.c` (not the old #defines); updated both unit tests
  to the new spec. **Full randomizer suite green: 1697 pass, 0 regressions.** Makefile globs `src/*.c` so the
  new file builds automatically.
  - **Ops incident (not a code bug):** PRO builds started failing with `vfork: Resource temporarily
    unavailable` — the container's `pids` cgroup was at its cap (~4532/4538) from **~4518 zombie `bash`
    processes** leaked by my many `docker exec -d` builds + tight `docker exec` poll loops (PID 1 = node
    doesn't reap). Fixed by restarting the container (zombies→0, source persists via bind-mount). **Lesson:
    run wait-loops INSIDE one `docker exec`, not one exec per poll iteration.** `battle_script_commands.o` +
    `move_relearner.o` had already compiled cleanly with the struct reads before the PID exhaustion — the
    code is fine.
  - **Injectability fight (the real design lesson):** `const volatile` did NOT stop -O2/LTO from
    constant-folding the initializer — disasm showed `GetMoveRelearnerMoveCost` returning immediate `#250`
    and `gRandomizerSettings` garbage-collected (absent from `.map`/`nm`). Plain `volatile` (RAM) folded too
    (LTO IPA-CP propagates a never-written global's initializer, ignoring volatile). **Fix that works: read
    the struct only through `GetRandomizerSettings()`, an `__attribute__((noinline, noipa))` accessor** — LTO
    does no interprocedural analysis across it, so callers get an opaque pointer and the field loads stay
    real. Verified: disasm now does `bl GetRandomizerSettings; ldr r0,[r0,#12]`; the struct survives at
    `.rodata` `0x08bf0040` (findable, injectable). Kept `const` (ROM-resident). This `noipa`-accessor pattern
    is reusable for every Phase-2 injectable table (T-235/236/237).
  - **End-to-end:** committed the changes into the box git (so `restore()` keeps them); had to also scp the
    updated JS writers (forgot them first → the old writer no-op'd against the removed #defines) and
    `chown 1000:1000` the scp'd files (container uid 1000 couldn't write root-owned files → writer EACCES).
    Then the `economy` bundle built with the struct = `999/9999/12345/0` (config applied end-to-end). ROM
    fetched to `~/Downloads/T-234-economy-test.gba` for owner play-test. **Remaining: owner play-test →
    re-snapshot the manifest (base changed by design) → commit to master + deploy via update.sh (the box
    currently holds an un-deployed wip commit).**

- **2026-08-01 — CLOSED.** Owner signed off through the consolidated T-236 play-test run (see Outcome).

## Outcome

**Shipped:** prize money (normal/boss/gym) and the move-relearner price are no longer `#define`
immediates — they live in `const struct RandomizerSettings gRandomizerSettings`
(`src/randomizer_settings.c` + `include/randomizer_settings.h`) and the engine reads them at runtime
in `GetTrainerMoneyToGive` (`battle_script_commands.c`) and `GetMoveRelearnerMoveCost`
(`move_relearner.c`). `moneyWriter.js` / `moveRelearnerPriceWriter.js` patch the struct initializer
instead of the old defines. Four values became a fixed-offset Group-A overwrite for the injector.

**Key deviation from the plan — the `noipa` accessor.** The plan assumed `const volatile` would be
enough to keep the values in ROM. It was not: `-O2 -flto` constant-folded the initializer anyway
(IPA-CP propagates a never-written global's value, ignoring `volatile`) and garbage-collected the
struct out of the `.map` entirely — which would have silently defeated injection. The working pattern
is to read the struct **only** through an `__attribute__((noinline, noipa))` accessor,
`GetRandomizerSettings()`, so LTO can't see through it. This became the reusable rule for every later
injectable table ([[project_injectable_settings_noipa_pattern]]); T-235/T-236 avoided the accessor only
because their tables are indexed with a **runtime** index, which LTO can't fold either.

**Verification:** disassembly shows real loads (`bl GetRandomizerSettings; ldr r0,[r0,#12]`), the
`economy` bundle produced `999/9999/12345/0` in the built ROM, defaults give `250/3000/5000/250`,
randomizer suite green.

**Caveat on the sign-off:** the acceptance criterion named the dedicated `economy` ROM (money $999 /
gyms $12345 / free relearn), which makes the change *observable*. The owner instead validated the
combined T-234+235+236 ROM built from their own bundle, where the economy values are the defaults —
so the evidence is "money and relearn pricing behave normally", i.e. the struct path works, rather
than "the injected non-default values are visible". The stronger check is still available:
`~/emerald-playtest/T-234-economy.gba` is archived with its MANIFEST row.

**Follow-ups:** none of its own. The golden-master manifest is re-captured once for the whole Phase-2
group at the end of T-236, not per task.
