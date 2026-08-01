#ifndef GUARD_RANDOMIZER_SETTINGS_H
#define GUARD_RANDOMIZER_SETTINGS_H

// T-234 / ADR-022 — runtime-injectable randomizer settings. The engine reads these values instead of
// compile-time #define immediates, so a prebuilt ROM can be repatched WITHOUT recompiling (the
// base+injection architecture). The randomizer still patches the initializers at build time
// (randomizer/moneyWriter.js, randomizer/moveRelearnerPriceWriter.js); the injector overwrites the
// struct's bytes at its .map offset. Extend this struct in later Phase-2 tasks (rewards, item placement).
//
// Injection-safety: `gRandomizerSettings` is a `const` ROM (.rodata) object, but -O2/LTO would happily
// constant-fold its initializer straight into the reading functions (verified: even `const volatile` /
// `volatile` folded to an immediate and the symbol was garbage-collected), which would defeat injection.
// So the engine reads it ONLY through `GetRandomizerSettings()`, an `noipa` accessor: LTO does no
// interprocedural analysis across it, so callers see an opaque pointer, the field loads stay real, and the
// struct survives at a fixed .rodata offset the injector can patch. u32 comes from global.h, included
// before this header by every consumer.

struct RandomizerSettings
{
    u32 trainerMoneyNormal; // regular trainer prize
    u32 trainerMoneyBoss;   // rivals/admins/Steven/Wally etc. (museum/space-center grunts derive from this)
    u32 trainerMoneyGym;    // gym leaders
    u32 moveRelearnerCost;  // move relearner price (0 = always free)
};

extern const struct RandomizerSettings gRandomizerSettings;

// Opaque accessor — always read the settings through this, never `gRandomizerSettings` directly (see above).
const struct RandomizerSettings *GetRandomizerSettings(void);

#endif // GUARD_RANDOMIZER_SETTINGS_H
