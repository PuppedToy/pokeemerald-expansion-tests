---
id: T-267
title: Remove the over-level disobedience mechanic entirely
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: []
blocked-by: []
---

# T-267 — Remove the over-level disobedience mechanic entirely

## Context

Owner request: a Pokémon must never ignore its trainer because its level is above what the player's Badges
allow. In vanilla Emerald (and in the expansion's PLA+ variant, `B_OBEDIENCE_MECHANICS`) an over-level mon
can loaf around, turn away, hit itself, fall asleep, or use a random move instead of the chosen one.

That mechanic is actively hostile to this project's design: the randomizer hands the player traded/gift mons
and rebalanced teams whose levels track the run's own level cap (`include/config/caps.h`), not the vanilla
Badge ladder, so the Badge-vs-level comparison in `GetAttackerObedienceForAction()` punishes the player for
data the randomizer itself produced.

Scope note: this is a **C engine** change, so it only reaches players once the base ROM is rebuilt on the
build box (`base/pokeemerald.{gba,map,sym}` — see `randomizer/docs/injection.md`). The Node pipeline is not
involved.

## Plan

Keep the diff fork-friendly (this repo tracks upstream `pokeemerald-expansion`): add one config switch next
to the mechanic's existing config and guard the single entry point, rather than ripping out the canceller,
the battle scripts and the strings. `CancellerObedience()` must keep running because it is what sets
`HITMARKER_OBEYS`, which `battle_script_commands.c` and `battle_arena.c` both read; and the "incapable of
using its power" string in `gInobedientStringIds[]` is shared with Battle Palace.

Acceptance criteria:
- [x] `B_OBEDIENCE_DISABLED` exists in `include/config/battle.h`, defaulting to `TRUE`.
- [x] `GetAttackerObedienceForAction()` returns `OBEYS` unconditionally while it is `TRUE`, before any
      Badge/level comparison and before consuming any RNG (so battle RNG streams are unchanged).
- [x] No disobedience outcome can be reached: level, met level, Badge count and outsider/OT status are all
      irrelevant.
- [x] A test covers it (`test/obedience.c`), including the vanilla worst case (level 100 outsider, no
      Badges).
- [x] No in-game text still tells the player that Badges gate obedience.
- [x] `cd randomizer && npm test` green (nothing pipeline-side should move).
- [ ] ~~Owner manually verifies in a ROM built from a rebuilt base: an over-level / traded mon with few
      Badges always executes the chosen move.~~ Waived at close by the owner — the base ROM has not been
      rebuilt yet, so there was nothing to play-test. See Outcome.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-11** — Task created. Mapped the mechanic before touching anything: the whole decision lives in
  `GetAttackerObedienceForAction()` (`src/battle_util.c`), reached only from `CancellerObedience()` via
  `CANCELLER_OBEDIENCE`; the five outcomes are the `enum Obedience` values in `include/battle_util.h`.
  Confirmed nothing in `randomizer/` or `backend/` models obedience (the two greps that hit are the word
  "obeys" in unrelated prose).
- **2026-08-11** — Rejected the "delete it all" variant (drop `CANCELLER_OBEDIENCE`, the function, the
  battle scripts and the string ids). Two reasons: `HITMARKER_OBEYS` is consumed outside the mechanic
  (`battle_script_commands.c:6236/6256/6278`, `battle_arena.c:387`), and `B_MSG_INCAPABLE_OF_POWER` in
  `gInobedientStringIds[]` is Battle Palace's, not obedience's (`battle_util.c:522/528`). A config switch
  plus one guard is both complete in effect and cheap to carry across upstream merges — LTO drops the dead
  branch anyway.
- **2026-08-11** — Testing constraint found and worked around: obedience is **unreachable from battle
  tests**. `test_runner_battle.c:278` builds every battle with `BATTLE_TYPE_RECORDED_LINK`, which
  `GetAttackerObedienceForAction()` exempts on its first line — which is also why existing `Level(100)`
  battle tests never disobeyed. So the coverage is a plain `TEST()` that stages the battler globals and
  calls the function directly (precedent: `test/text.c:605-620`). `make check` needs the GBA toolchain, so
  it runs in CI / on the builder, never locally.
- **2026-08-11** — Owner chose to strip the obedience claims from the in-game texts too (minimal edit, no
  new claims about the level cap). Four blocks, all of them dialogue the engine no longer backs: Fortree
  (Feather), Lavaridge (Heat), Sootopolis (Rain) and the Rustboro trade NPC. Kept every HM/gift sentence,
  and the Badge-receipt level-cap line was already there and is untouched. Checked the rewrapped lines
  against the width the originals already used (≤38 chars) so no box overflows, and confirmed the
  randomizer's map writers key off script labels and TM-name texts, not these blocks. Suite re-run after
  the edit: 2338 passing.
- **2026-08-11** — Owner ordered the close with the ROM play-test still outstanding (the base ROM has not
  been rebuilt, so there is nothing to play yet). Randomizer suite re-run at close: 2338 passing, 3 suites
  skipped (pre-existing). Merged into `master`. Two verifications remain owner-side and are recorded in the
  Outcome rather than silently dropped: the C compile (`make check`, CI/builder — no GBA toolchain here) and
  the in-game behaviour once the base is rebuilt.

## Outcome

The disobedience mechanic is gone from the engine, shipping in 0.9.0:

- `include/config/battle.h` — `B_OBEDIENCE_DISABLED TRUE`, next to `B_OBEDIENCE_MECHANICS`, which it
  overrides.
- `src/battle_util.c` — `GetAttackerObedienceForAction()` returns `OBEYS` as its first act, before every
  Badge/level/OT comparison and before `Random()` is called, so no battle RNG stream shifts. None of the
  five `enum Obedience` failure outcomes is reachable any more.
- `test/obedience.c` — a plain `TEST()` (64 iterations, level-100 outsider, no Badges).
- Four map-script texts stripped of their obedience claims: Feather (`FortreeCity_Gym`), Heat
  (`LavaridgeTown_Gym_1F`), Rain (`SootopolisCity_Gym_1F`) and `RustboroCity`'s trade NPC.
- One `CHANGELOG.brooktec.md` line under `[Unreleased] / Removed`.

Deviations from the plan: none in approach. One rejected alternative is logged above (deleting the
canceller, scripts and string ids — `HITMARKER_OBEYS` and Battle Palace's `B_MSG_INCAPABLE_OF_POWER` both
depend on them staying). The in-game text edits were not in the original plan; they were added mid-task on
the owner's call once the greps showed four dialogues still describing the removed rule.

Closed with two verifications outstanding, both owner-side and neither blocking the code:

1. **The C never compiled here.** There is no GBA toolchain on this machine, so `make check` — including
   `test/obedience.c` — runs in CI (`build.yml`) or on the builder. If it fails there, it fails on this
   test file or on nothing.
2. **No ROM was play-tested.** This is an engine change, so it reaches players only after the base ROM is
   rebuilt (`base/pokeemerald.{gba,map,sym}`, `randomizer/docs/injection.md`). A `verify-corpus` run after
   that rebuild will report changed hashes for every ROM — that is the intended consequence of this task,
   not a regression, and it is the moment to capture a fresh baseline.

Follow-ups: none spawned.
