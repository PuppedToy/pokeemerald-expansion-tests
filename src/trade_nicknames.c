#include "global.h"
#include "pokemon.h"
#include "trade_nicknames.h"
#include "constants/characters.h"       // EOS
#include "constants/trade.h"            // INGAME_TRADE_* (used by the writer-filled rows)
#include "constants/randomizer_layout.h" // TRADE_NICKNAME_CAPACITY

// T-202 — per-ROM in-game-trade -> nickname table (see tasks/T-202). When the feature is on, the ROM
// maker (randomizer/tradeNameWriter.js) replaces the block between the anchor comments with one row per
// named trade, and the count above it.
//
// T-237 — fixed-capacity and exported so the injector can overwrite it in place (ADR-022): the name is
// stored INLINE at a fixed width instead of pointing at a COMPOUND_STRING, and gTradeNicknameCount says
// how many rows are real (trailing rows are zero-filled, and trade id 0 is INGAME_TRADE_SEEDOT — a real
// trade — so the count cannot be inferred from the data). 0 = feature off = every lookup returns NULL =
// the traded Pokémon keeps its vanilla nickname, which is the committed default.
const u8 gTradeNicknameCount =
    // @TRADE_NICKNAMES_COUNT_START
    0
    // @TRADE_NICKNAMES_COUNT_END
    ;

const struct TradeNickname gTradeNicknames[TRADE_NICKNAME_CAPACITY] =
{
    // @TRADE_NICKNAMES_START
    // @TRADE_NICKNAMES_END
};

const u8 *GetTradeNickname(u8 whichInGameTrade)
{
    u32 i;

    for (i = 0; i < gTradeNicknameCount; i++)
    {
        if (gTradeNicknames[i].tradeId == whichInGameTrade)
            return gTradeNicknames[i].nickname;
    }

    return NULL;
}
