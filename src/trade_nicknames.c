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
// how many rows are real (trailing rows are zero-filled, and trade id 0 is INGAME_TRADE_RUSTBORO — a real
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

// T-237 — see the same guard in src/location_nicknames.c: without `noipa` the committed count (0) is
// folded into the loop, the loop is deleted and gTradeNicknames is garbage-collected out of the ROM.
__attribute__((noinline, noipa))
u32 GetTradeNicknameCount(void)
{
    // B-058 — see the same note in src/location_nicknames.c: this folded to `return 0`, so every injected
    // trade nickname was ignored and the traded mon kept its species name.
    return *(const volatile u8 *)&gTradeNicknameCount;
}

const u8 *GetTradeNickname(u8 whichInGameTrade)
{
    u32 count = GetTradeNicknameCount();
    u32 i;

    for (i = 0; i < count; i++)
    {
        if (gTradeNicknames[i].tradeId == whichInGameTrade)
            return gTradeNicknames[i].nickname;
    }

    return NULL;
}
