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
    // T-257 — the three league/heal house rules. Independent: a battle inside the Elite Four gauntlet
    // (see league_rules.h) obeys healFaintedAfterBattleLeague and NOTHING else; every other battle obeys
    // healFaintedAfterBattle and nothing else. All four combinations are legal.
    bool8 healFaintedAfterBattle;       // fully restore the party after an ordinary battle
    bool8 healFaintedAfterBattleLeague; // ... after an Elite Four / Champion battle
    bool8 leagueMoveRelearnAllowed;     // T-258 — let the summary-screen relearner work inside the gauntlet
    // T-274 — which shiny system this run uses, and the number behind each of them. TRUE = **quality**:
    // a Pokémon is shiny iff its six IVs sum to `shinyIvThreshold` or more (deterministic, the rule
    // 5d98097 introduced). FALSE = **classic**: gen 3's own lottery,
    // GET_SHINY_VALUE(otId, personality) < shinyOdds out of 65536 (8 ⇒ 1 in 8192). Both numbers ride to
    // the ROM whatever the mode, so flipping the toggle keeps the other system's tuning. The one read
    // seam is GetBoxMonData(MON_DATA_IS_SHINY) — see src/pokemon.c.
    bool8 shinyByQuality;
    u32 shinyOdds;           // classic mode: shiny when the 16-bit fold lands below this (0 = never)
    u16 shinyIvThreshold;    // quality mode: shiny at this IV total or above (max 186 = all 31s)
    // T-274 — the starter's IV floors (CB2_GiveStarter): this many IVs are forced to 31, then the rest are
    // topped up until the total reaches `starterMinIvTotal`. Independent of the shiny rule above, which is
    // what lets a run guarantee a shiny starter (or deliberately not).
    u8 starterPerfectIvs;    // 0..6
    u8 starterMinIvTotal;    // 0..186
};

extern const struct RandomizerSettings gRandomizerSettings;

// Opaque accessor — always read the settings through this, never `gRandomizerSettings` directly (see above).
const struct RandomizerSettings *GetRandomizerSettings(void);

#endif // GUARD_RANDOMIZER_SETTINGS_H
