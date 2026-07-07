#ifndef GUARD_LOCATION_NICKNAMES_H
#define GUARD_LOCATION_NICKNAMES_H

struct Pokemon;

// T-070 — location-based auto-nicknames. Returns the nickname for a map (or NULL if the map has no
// entry / the feature is off) and writes the map's forced gender (MON_MALE/FEMALE, or MON_GENDERLESS =
// don't force) to *outGender.
const u8 *GetLocationNickname(u8 mapGroup, u8 mapNum, u8 *outGender);

// Sets the CURRENT location's nickname on `mon` (no-op when the map has no entry or an empty name).
void SetLocationNicknameOnMon(struct Pokemon *mon);

#endif // GUARD_LOCATION_NICKNAMES_H
