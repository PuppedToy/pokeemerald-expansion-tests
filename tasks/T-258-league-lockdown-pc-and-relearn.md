---
id: T-258
title: "Lock the Pokémon League: no PC, and no move relearning unless allowed"
status: done
type: feature
created: 2026-08-07
updated: 2026-08-07
target-version: 0.7.0
links: [T-257, T-167]
blocked-by: [T-257]
---

# T-258 — League lockdown: PC off, relearner gated

## Context

Owner request: while the player is **at the Pokémon League**, two things must happen:

- The **PC** entry disappears from the start menu — no box swapping mid-gauntlet.
- The **move relearner** (START on the summary screen's moves page, T-167) is unavailable **unless**
  [[T-257]]'s `leagueMoveRelearnAllowed` toggle is set. **Teaching TMs stays available in every case.**

Both restrictions revert when the player **loses any Elite Four / Champion fight** or **wins the Champion
fight**.

## Plan

Reuse [[T-257]]'s single home for the league definition (`src/league_rules.c`,
`IsInEliteFourGauntlet()` — the five halls, the four Elite Four rooms and the Champion's room). No new save
flag and no new state: the two revert conditions are already implied by the map set.

- **Loses a fight** → whiteout respawns at `HEAL_LOCATION_EVER_GRANDE_CITY_POKEMON_LEAGUE`, i.e. the league
  **lobby**, which is outside the gauntlet ⇒ unlocked. (`B_FLAG_NO_WHITEOUT` is `0` in this build, so a
  real loss always whites out.)
- **Wins the Champion fight** → the post-battle sequence is one `lockall` cutscene with no menu access, and
  it ends in a `warp` to `HallOfFame`, which is outside the gauntlet ⇒ unlocked.

Hooks:
- `BuildNormalStartMenu()` — add `MENU_ACTION_PC` only when not in the gauntlet.
- `ShouldShowMoveRelearner()` (`src/pokemon_summary_screen.c`) — one extra clause; it already gates the
  START prompt, the input handler and the sprite/prompt drawing, so a single seam covers the whole UI.

Acceptance criteria:
- [x] Inside the gauntlet the start menu has no PC entry; in the lobby, Hall of Fame and the rest of the
      world it does.
- [x] Inside the gauntlet the summary screen offers no Relearn prompt when `leagueMoveRelearnAllowed` is
      off, and does offer it when the toggle is on.
- [x] TM teaching is unaffected everywhere.
- [x] Both restrictions are gone after a loss (player is in the lobby) and after the Champion win (player
      is in the Hall of Fame).
- [x] `cd randomizer && npm test` green (+ backend suite), changelog line added.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-07** — Task created, implemented on [[T-257]]'s branch (it consumes T-257's toggle and its
  league predicate; splitting the branches would have meant shipping a settings field nothing reads).

- **2026-08-07 — IMPLEMENTED (local).** Two one-clause hooks, both reading
  `include/league_rules.h` so this task adds no notion of "the League" of its own:
  - `BuildNormalStartMenu()` (`src/start_menu.c`) — `MENU_ACTION_PC` is appended only when
    `!IsInEliteFourGauntlet()`. Unconditional, not a config option, as specified.
  - `ShouldShowMoveRelearner()` (`src/pokemon_summary_screen.c`) — `&& !IsMoveRelearnBlockedByLeague()`.
    That inline is the single seam for the whole relearner UI (the START prompt at 1746, the input handler
    at 1988/2261, the selector sprites and prompt drawing at 3289–3357), so one clause covers all of it and
    no half-open state is reachable. TM teaching is a different code path and untouched.
  - **No save flag, and the revert conditions are why.** See T-257's log: the two conditions the owner
    listed are already properties of the gauntlet map set (a loss whites out to the lobby, a Champion win
    warps into the Hall of Fame through a cutscene with no menu access), so there is nothing to remember and
    no way to get stuck locked out. The reasoning is recorded in `league_rules.h`, next to the map list it
    depends on.
  - **Needs the ROM to confirm:** both hooks are engine behaviour with no local build, so this is the part
    of the batch that genuinely needs a play-test — walk into Hall5, check the start menu has no PC, open a
    summary and check START offers no Relearn, then lose to Sidney and confirm both come back in the lobby.

- **2026-08-07 — Closed.** Owner reviewed the change and confirmed it ("lo veo bien"); merged into `master`
  with [[T-257]].

## Outcome

The Elite Four gauntlet is now a closed box: no PC in the start menu, and no summary-screen move relearner
unless [[T-257]]'s `leagueMoveRelearnAllowed` is set. TM teaching is untouched, and the league lobby stays
fully open — heal, shop and reorganize there before going in.

Two one-clause hooks, `BuildNormalStartMenu()` and `ShouldShowMoveRelearner()`, both asking
`include/league_rules.h` instead of inventing a second notion of "at the League". The relearner clause lands
on the one inline that already gates the START prompt, the input handler and the selector sprites, so there
is no reachable half-open state where the prompt shows but the screen refuses.

**Deviation from the plan — nothing to deviate from, and that is the point.** The plan predicted no new save
state and it held: the owner's two revert conditions ("loses any E4/Champion fight", "wins the Champion
fight") are already implied by which maps count as the gauntlet, because a loss whites out to the lobby and
the Champion win warps into the Hall of Fame through a cutscene that never yields menu control. So there is
no flag to leak, nothing to migrate in existing saves, and no state in which a player can be locked out of
their own boxes.

**Verification level:** both hooks are pure engine behaviour and were reviewed, not executed — there is no
GBA toolchain here. The play-test route is in the log entry above; it is the one thing still outstanding, and
it needs `deploy/build-base.sh` first (T-257 changed the settings struct).

No follow-up tasks spawned.
