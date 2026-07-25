#include "global.h"
#include "pokemon.h"
#include "trade_nicknames.h"
#include "constants/characters.h"  // EOS
#include "constants/trade.h"       // INGAME_TRADE_* (used by the writer-filled rows)

// T-202 — per-ROM in-game-trade -> nickname table (see tasks/T-202). The committed default is a single
// non-matching sentinel: it keeps the array non-empty (an empty `{}` array is a -Werror zero-length array,
// cf. B-020) and, since no real trade index is 0xFF, it never matches -> feature off = every lookup NULL =
// the traded Pokémon keeps its vanilla nickname. When the feature is on, the ROM maker
// (randomizer/tradeNameWriter.js) replaces the block between the anchor comments with one row per named
// trade. Inline strings use COMPOUND_STRING (cf. B-020).
struct TradeNickname
{
    u8 tradeId;
    const u8 *nickname;
};

static const struct TradeNickname sTradeNicknames[] =
{
    // @TRADE_NICKNAMES_START
    { 0xFF, COMPOUND_STRING("") },
    // @TRADE_NICKNAMES_END
};

const u8 *GetTradeNickname(u8 whichInGameTrade)
{
    u32 i;

    for (i = 0; i < ARRAY_COUNT(sTradeNicknames); i++)
    {
        if (sTradeNicknames[i].tradeId == whichInGameTrade)
            return sTradeNicknames[i].nickname;
    }

    return NULL;
}
