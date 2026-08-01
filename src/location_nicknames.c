#include "global.h"
#include "pokemon.h"
#include "location_nicknames.h"
#include "constants/characters.h"       // EOS
#include "constants/maps.h"             // MAP_GROUP / MAP_NUM (used by the writer-filled rows)
#include "constants/map_groups.h"       // MAP_* constants (used by the writer-filled rows)
#include "constants/randomizer_layout.h" // LOCATION_NICKNAME_CAPACITY

// T-070 — per-ROM location -> nickname/gender table (see tasks/T-070). When the feature is on, the ROM
// maker (randomizer/locationNameWriter.js) replaces the block between the anchor comments with one row
// per encounter map, and the count above it. Gender is MON_MALE/FEMALE only when per-route gender-lock
// is enabled; otherwise MON_GENDERLESS (don't force).
//
// T-237 — the table is fixed-capacity and exported so the injector can overwrite it in place at its
// `.map` offset (ADR-022). Two consequences:
//   - the nickname is stored INLINE (`u8 nickname[POKEMON_NAME_LENGTH + 1]`) instead of pointing at a
//     COMPOUND_STRING, so a longer name can never move the string pool;
//   - unused rows are zero-filled, and (0, 0) is a REAL map, so the row count can no longer be
//     ARRAY_COUNT — gLocationNicknameCount says how many rows are real. 0 = feature off = every lookup
//     returns NULL = vanilla behaviour, which is also the committed default.
const u8 gLocationNicknameCount =
    // @LOCATION_NICKNAMES_COUNT_START
    0
    // @LOCATION_NICKNAMES_COUNT_END
    ;

const struct LocationNickname gLocationNicknames[LOCATION_NICKNAME_CAPACITY] =
{
    // @LOCATION_NICKNAMES_START
    // @LOCATION_NICKNAMES_END
};

// T-237 — read the count through a `noipa` accessor, exactly as T-234 does for gRandomizerSettings.
// Without it, LTO propagates the committed `0` into the loop below, deletes the loop as dead, and then
// garbage-collects gLocationNicknames entirely: the table vanishes from the `.map` (verified on the build
// box) and an injected one would never be read. noinline for good measure.
__attribute__((noinline, noipa))
u32 GetLocationNicknameCount(void)
{
    return gLocationNicknameCount;
}

const u8 *GetLocationNickname(u8 mapGroup, u8 mapNum, u8 *outGender)
{
    u32 count = GetLocationNicknameCount();
    u32 i;

    for (i = 0; i < count; i++)
    {
        if (gLocationNicknames[i].mapGroup == mapGroup && gLocationNicknames[i].mapNum == mapNum)
        {
            if (outGender != NULL)
                *outGender = gLocationNicknames[i].gender;
            return gLocationNicknames[i].nickname;
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
