#include "global.h"
#include "league_rules.h"
#include "randomizer_settings.h"
#include "constants/maps.h"

// T-257 / T-258 — see include/league_rules.h for what these mean and why the lobby and the Hall of Fame
// are outside the gauntlet.

// The gauntlet, in walking order: lobby → Hall5 → Sidney → Hall1 → Phoebe → Hall2 → Glacia → Hall3 →
// Drake → Hall4 → Champion → (Hall of Fame). All ten sit in the IndoorEverGrande map group; listed by
// name rather than as a mapNum range so a map reshuffle upstream breaks the build instead of the rule.
static const u16 sEliteFourGauntletMaps[] =
{
    MAP_EVER_GRANDE_CITY_HALL1,
    MAP_EVER_GRANDE_CITY_HALL2,
    MAP_EVER_GRANDE_CITY_HALL3,
    MAP_EVER_GRANDE_CITY_HALL4,
    MAP_EVER_GRANDE_CITY_HALL5,
    MAP_EVER_GRANDE_CITY_SIDNEYS_ROOM,
    MAP_EVER_GRANDE_CITY_PHOEBES_ROOM,
    MAP_EVER_GRANDE_CITY_GLACIAS_ROOM,
    MAP_EVER_GRANDE_CITY_DRAKES_ROOM,
    MAP_EVER_GRANDE_CITY_CHAMPIONS_ROOM,
};

bool32 IsInEliteFourGauntlet(void)
{
    u32 i;
    u8 mapGroup = gSaveBlock1Ptr->location.mapGroup;
    u8 mapNum = gSaveBlock1Ptr->location.mapNum;

    for (i = 0; i < ARRAY_COUNT(sEliteFourGauntletMaps); i++)
    {
        if (mapGroup == MAP_GROUP(sEliteFourGauntletMaps[i]) && mapNum == MAP_NUM(sEliteFourGauntletMaps[i]))
            return TRUE;
    }

    return FALSE;
}

bool32 ShouldHealPartyAfterBattle(void)
{
    const struct RandomizerSettings *settings = GetRandomizerSettings();

    if (IsInEliteFourGauntlet())
        return settings->healFaintedAfterBattleLeague;

    return settings->healFaintedAfterBattle;
}

bool32 IsMoveRelearnBlockedByLeague(void)
{
    return IsInEliteFourGauntlet() && !GetRandomizerSettings()->leagueMoveRelearnAllowed;
}
