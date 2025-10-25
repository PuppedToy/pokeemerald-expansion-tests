#include "global.h"
#include "battle.h"
#include "event_data.h"
#include "caps.h"
#include "pokemon.h"


u32 GetCurrentLevelCap(void)
{
    static const u32 sLevelCapFlagMap[][2] =
    {
        {FLAG_DEFEATED_RIVAL_ROUTE103, 7}, // Boss
        {FLAG_DEFEATED_AQUA_WOODS, 9}, // Minor boss
        {FLAG_BADGE01_GET, 10}, // Gym boss Roxanne
        {FLAG_RECOVERED_DEVON_GOODS, 13}, // Minor boss
        {FLAG_DEFEATED_RIVAL_RUSTBORO, 14}, // Boss
        {FLAG_BADGE02_GET, 16}, // Gym boss Brawly
        {FLAG_DELIVERED_STEVEN_LETTER, 19}, // Boss Steven
        {FLAG_DELIVERED_DEVON_GOODS, 21}, // Boss gauntlet
        {FLAG_ROUTE110_RIVAL_DEFEATED, 23}, // Boss
        {FLAG_DEFEATED_WALLY_MAUVILLE, 25}, // Minor boss
        {FLAG_BADGE03_GET, 26}, // Gym boss Wattson - gives Megabracelet
        // Get good rod
        {FLAG_DEFEATED_TABITHA_MT_CHIMNEY, 29}, // Minor boss
        {FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY, 30}, // Major boss
        {FLAG_BADGE04_GET, 33}, // Gym boss Flannery - gives Regirock
        {FLAG_BADGE05_GET, 36}, // Gym boss Norman - gives Regice
        // Get surf here
        {FLAG_DEFEATED_SHELLY_WEATHER_INST, 39}, // Minor boss
        {FLAG_ROUTE119_RIVAL_DEFEATED, 41}, // Boss
        {FLAG_BADGE06_GET, 43}, // Gym boss Winona - gives Registeel
        {FLAG_MET_RIVAL_LILYCOVE, 46}, // Boss (Wally)
        // Get super rod here
        {FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT, 48}, // Major boss
        {FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE, 51}, // Boss
        {FLAG_BADGE07_GET, 53}, // Gym boss Tate and Liza - should give a strong Mon
        {FLAG_DEFEATED_MAGMA_SPACE_CENTER, 56}, // Boss
        {FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, 58}, // Major boss - gives Rayquaza
        {FLAG_BADGE08_GET, 61}, // Gym boss Juan
        {FLAG_DEFEATED_WALLY_VICTORY_ROAD, 64}, // Major Boss
        /* Create here last Rival battle at 67 */
        {FLAG_FIRST_DEFEATED_ELITE_4_SIDNEY, 70}, // E4
        {FLAG_FIRST_DEFEATED_ELITE_4_PHOEBE, 71}, // E4
        {FLAG_FIRST_DEFEATED_ELITE_4_GLACIA, 72}, // E4
        {FLAG_FIRST_DEFEATED_ELITE_4_DRAKE, 73}, // E4
        {FLAG_IS_CHAMPION, 75}, // Champion
    };

    u32 i;

    if (B_LEVEL_CAP_TYPE == LEVEL_CAP_FLAG_LIST)
    {
        for (i = 0; i < ARRAY_COUNT(sLevelCapFlagMap); i++)
        {
            if (!FlagGet(sLevelCapFlagMap[i][0]))
                return sLevelCapFlagMap[i][1];
        }
    }
    else if (B_LEVEL_CAP_TYPE == LEVEL_CAP_VARIABLE)
    {
        return VarGet(B_LEVEL_CAP_VARIABLE);
    }

    return MAX_LEVEL;
}

u32 GetSoftLevelCapExpValue(u32 level, u32 expValue)
{
    static const u32 sExpScalingDown[5] = { 4, 8, 16, 32, 64 };
    static const u32 sExpScalingUp[5]   = { 16, 8, 4, 2, 1 };

    u32 levelDifference;
    u32 currentLevelCap = GetCurrentLevelCap();

    if (B_EXP_CAP_TYPE == EXP_CAP_NONE)
        return expValue;

    if (level < currentLevelCap)
    {
        if (B_LEVEL_CAP_EXP_UP)
        {
            levelDifference = currentLevelCap - level;
            if (levelDifference > ARRAY_COUNT(sExpScalingUp) - 1)
                return expValue + (expValue / sExpScalingUp[ARRAY_COUNT(sExpScalingUp) - 1]);
            else
                return expValue + (expValue / sExpScalingUp[levelDifference]);
        }
        else
        {
            return expValue;
        }
    }
    else if (B_EXP_CAP_TYPE == EXP_CAP_HARD)
    {
        return 0;
    }
    else if (B_EXP_CAP_TYPE == EXP_CAP_SOFT)
    {
        levelDifference = level - currentLevelCap;
        if (levelDifference > ARRAY_COUNT(sExpScalingDown) - 1)
            return expValue / sExpScalingDown[ARRAY_COUNT(sExpScalingDown) - 1];
        else
            return expValue / sExpScalingDown[levelDifference];
    }
    else
    {
       return expValue;
    }
}

u32 GetCurrentEVCap(void)
{
    static const u16 sEvCapFlagMap[][2] = {
        // Define EV caps for each milestone
        {FLAG_BADGE01_GET, MAX_TOTAL_EVS *  1 / 17},
        {FLAG_BADGE02_GET, MAX_TOTAL_EVS *  3 / 17},
        {FLAG_BADGE03_GET, MAX_TOTAL_EVS *  5 / 17},
        {FLAG_BADGE04_GET, MAX_TOTAL_EVS *  7 / 17},
        {FLAG_BADGE05_GET, MAX_TOTAL_EVS *  9 / 17},
        {FLAG_BADGE06_GET, MAX_TOTAL_EVS * 11 / 17},
        {FLAG_BADGE07_GET, MAX_TOTAL_EVS * 13 / 17},
        {FLAG_BADGE08_GET, MAX_TOTAL_EVS * 15 / 17},
        {FLAG_IS_CHAMPION, MAX_TOTAL_EVS},
    };

    if (B_EV_CAP_TYPE == EV_CAP_FLAG_LIST)
    {
        for (u32 evCap = 0; evCap < ARRAY_COUNT(sEvCapFlagMap); evCap++)
        {
            if (!FlagGet(sEvCapFlagMap[evCap][0]))
                return sEvCapFlagMap[evCap][1];
        }
    }
    else if (B_EV_CAP_TYPE == EV_CAP_VARIABLE)
    {
        return VarGet(B_EV_CAP_VARIABLE);
    }
    else if (B_EV_CAP_TYPE == EV_CAP_NO_GAIN)
    {
        return 0;
    }

    return MAX_TOTAL_EVS;
}
