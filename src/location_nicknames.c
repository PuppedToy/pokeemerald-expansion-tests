#include "global.h"
#include "pokemon.h"
#include "location_nicknames.h"

// T-070 — per-ROM location -> nickname/gender table (see tasks/T-070). The committed default is a single
// non-matching sentinel: it keeps the array non-empty (an empty `{}` array is a -Werror zero-length array,
// cf. B-020) and, since no real map is (0xFF, 0xFF), it never matches -> feature off = every lookup is NULL.
// When the feature is on, the ROM maker (randomizer/locationNameWriter.js) replaces the block between the
// anchor comments with one row per encounter map. Gender is MON_MALE/FEMALE only when per-route gender-lock
// is enabled; otherwise MON_GENDERLESS (don't force). Inline strings use COMPOUND_STRING (cf. B-020).
struct LocationNickname
{
    u8 mapGroup;
    u8 mapNum;
    u8 gender;
    const u8 *nickname;
};

static const struct LocationNickname sLocationNicknames[] =
{
    // @LOCATION_NICKNAMES_START
    { 0xFF, 0xFF, MON_GENDERLESS, COMPOUND_STRING("") },
    // @LOCATION_NICKNAMES_END
};

const u8 *GetLocationNickname(u8 mapGroup, u8 mapNum, u8 *outGender)
{
    u32 i;

    for (i = 0; i < ARRAY_COUNT(sLocationNicknames); i++)
    {
        if (sLocationNicknames[i].mapGroup == mapGroup && sLocationNicknames[i].mapNum == mapNum)
        {
            if (outGender != NULL)
                *outGender = sLocationNicknames[i].gender;
            return sLocationNicknames[i].nickname;
        }
    }

    if (outGender != NULL)
        *outGender = MON_GENDERLESS;
    return NULL;
}

void SetLocationNicknameOnMon(struct Pokemon *mon)
{
    u8 gender;
    const u8 *nick = GetLocationNickname(gSaveBlock1Ptr->location.mapGroup, gSaveBlock1Ptr->location.mapNum, &gender);

    if (nick != NULL && nick[0] != EOS)
        SetMonData(mon, MON_DATA_NICKNAME, nick);
}
