#include "global.h"
#include "randomizer_settings.h"

// T-234 / ADR-022 — the runtime-injectable settings block (see randomizer_settings.h). Defaults reproduce
// the previous committed #define values. The randomizer patches these initializers at build time
// (moneyWriter.js / moveRelearnerPriceWriter.js); the injector overwrites the four u32s at this symbol's
// .rodata offset.
const struct RandomizerSettings gRandomizerSettings = {
    .trainerMoneyNormal = 250,
    .trainerMoneyBoss   = 3000,
    .trainerMoneyGym    = 5000,
    .moveRelearnerCost  = 250,
    // T-257 — all three default to FALSE, so a ROM built straight from these sources behaves exactly as
    // before: no post-battle healing anywhere, and the league blocks the relearner (T-258).
    .healFaintedAfterBattle       = FALSE,
    .healFaintedAfterBattleLeague = FALSE,
    .leagueMoveRelearnAllowed     = FALSE,
    // T-274 — the shiny rule and the starter's IV floors. These defaults are the ONLY home of "150" and
    // "3 perfect IVs" now (the old P_SHINY_IV_THRESHOLD #define is gone), and they reproduce exactly what
    // the game did before the rule became configurable: quality mode at 150, and a starter with 3 forced
    // 31s topped up to a 150 total. `shinyOdds` is gen 3's own 8/65536 (1 in 8192), unused until a run
    // switches the toggle off.
    .shinyByQuality     = TRUE,
    .shinyOdds          = 8,
    .shinyIvThreshold   = 150,
    .starterPerfectIvs  = 3,
    .starterMinIvTotal  = 150,
};

// `noipa` blocks LTO/IPA from propagating gRandomizerSettings' const initializer into the callers (which
// -O2/LTO does even for const volatile — verified). Callers get an opaque pointer, so the field reads
// stay real loads and the struct is kept at a fixed, injectable .rodata offset. noinline for good measure.
__attribute__((noinline, noipa))
const struct RandomizerSettings *GetRandomizerSettings(void)
{
    return &gRandomizerSettings;
}
