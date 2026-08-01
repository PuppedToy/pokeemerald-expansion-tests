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
};

// `noipa` blocks LTO/IPA from propagating gRandomizerSettings' const initializer into the callers (which
// -O2/LTO does even for const volatile — verified). Callers get an opaque pointer, so the field reads
// stay real loads and the struct is kept at a fixed, injectable .rodata offset. noinline for good measure.
__attribute__((noinline, noipa))
const struct RandomizerSettings *GetRandomizerSettings(void)
{
    return &gRandomizerSettings;
}
