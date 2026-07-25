#ifndef GUARD_TRADE_NICKNAMES_H
#define GUARD_TRADE_NICKNAMES_H

// T-202 — town-trade auto-nicknames. Returns the nickname for an in-game trade index (INGAME_TRADE_*),
// or NULL when that trade has no entry / the feature is off.
const u8 *GetTradeNickname(u8 whichInGameTrade);

#endif // GUARD_TRADE_NICKNAMES_H
