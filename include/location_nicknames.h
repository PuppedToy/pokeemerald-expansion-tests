#ifndef GUARD_LOCATION_NICKNAMES_H
#define GUARD_LOCATION_NICKNAMES_H

#include "constants/randomizer_layout.h"

struct Pokemon;

// T-070 / T-237 — one row of the per-ROM location→nickname table (src/location_nicknames.c). The name is
// stored inline at a fixed width so the whole table can be overwritten in place by the injector.
struct LocationNickname
{
    u8 mapGroup;
    u8 mapNum;
    u8 gender;
    u8 nickname[POKEMON_NAME_LENGTH + 1];
};

extern const struct LocationNickname gLocationNicknames[LOCATION_NICKNAME_CAPACITY];
extern const u8 gLocationNicknameCount;   // how many rows are real; 0 = feature off

// Read the count ONLY through this `noipa` accessor (see the note in src/location_nicknames.c): a direct
// read lets LTO fold the committed 0 and garbage-collect the whole table.
u32 GetLocationNicknameCount(void);

// T-070 — location-based auto-nicknames. Returns the nickname for a map (or NULL if the map has no
// entry / the feature is off) and writes the map's forced gender (MON_MALE/FEMALE, or MON_GENDERLESS =
// don't force) to *outGender.
const u8 *GetLocationNickname(u8 mapGroup, u8 mapNum, u8 *outGender);

// Sets the CURRENT location's nickname on `mon` (no-op when the map has no entry or an empty name).
void SetLocationNicknameOnMon(struct Pokemon *mon);

#endif // GUARD_LOCATION_NICKNAMES_H
