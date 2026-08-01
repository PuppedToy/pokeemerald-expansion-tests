#ifndef GUARD_TRADE_NICKNAMES_H
#define GUARD_TRADE_NICKNAMES_H

#include "constants/randomizer_layout.h"

// T-202 / T-237 — one row of the per-ROM trade→nickname table (src/trade_nicknames.c). The name is
// stored inline at a fixed width so the whole table can be overwritten in place by the injector.
struct TradeNickname
{
    u8 tradeId;
    u8 nickname[POKEMON_NAME_LENGTH + 1];
};

extern const struct TradeNickname gTradeNicknames[TRADE_NICKNAME_CAPACITY];
extern const u8 gTradeNicknameCount;   // how many rows are real; 0 = feature off

// T-202 — town-trade auto-nicknames. Returns the nickname for an in-game trade index (INGAME_TRADE_*),
// or NULL when that trade has no entry / the feature is off.
const u8 *GetTradeNickname(u8 whichInGameTrade);

#endif // GUARD_TRADE_NICKNAMES_H
