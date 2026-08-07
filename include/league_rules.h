#ifndef GUARD_LEAGUE_RULES_H
#define GUARD_LEAGUE_RULES_H

// T-257 / T-258 — the Pokémon League house rules, and the ONE home for "the player is at the Pokémon
// League". Every consumer (post-battle healing, the start menu's PC entry, the summary-screen move
// relearner) asks these functions instead of testing maps or settings of its own, so the definition of
// "at the league" cannot drift between features.
//
// The three toggles behind them live in gRandomizerSettings (randomizer_settings.h) and are patched per
// run by randomizer/leagueRulesWriter.js / the injector — see randomizer/docs/injection.md.

// TRUE while the player stands inside the Elite Four gauntlet: the five halls, the four Elite Four rooms
// and the Champion's room.
//
// Deliberately EXCLUDED (see T-257's plan for the reasoning): the league lobby
// (EVER_GRANDE_CITY_POKEMON_LEAGUE_1F/2F), which is the prep room, the whiteout respawn point and the only
// way back out; and the Hall of Fame, which is only reachable by beating the Champion. Those two
// exclusions are what make T-258's revert conditions ("lost an Elite Four fight" / "won the Champion
// fight") hold with no extra saved state: a loss whites out to the lobby, and the Champion win warps into
// the Hall of Fame through a cutscene that never yields menu control.
bool32 IsInEliteFourGauntlet(void);

// TRUE when the party should be fully restored now that a battle has ended. A battle inside the gauntlet
// obeys healFaintedAfterBattleLeague and nothing else; every other battle obeys healFaintedAfterBattle and
// nothing else — so "heal everywhere except the league" and "heal only in the league" are both expressible.
bool32 ShouldHealPartyAfterBattle(void);

// TRUE when the summary-screen move relearner must stay hidden because the player is mid-gauntlet and the
// run did not allow relearning there. Teaching TMs is never affected.
bool32 IsMoveRelearnBlockedByLeague(void);

#endif // GUARD_LEAGUE_RULES_H
