#ifndef GUARD_RANDOMIZER_REWARDS_H
#define GUARD_RANDOMIZER_REWARDS_H

// T-235 / ADR-022 — data-driven gym/museum/weather reward pokemon. Previously each reward map script
// baked the species into a `GYM_REWARD_MON` token that the randomizer string-substituted at build time
// (not injectable). Now the reward scripts do:
//     setvar VAR_0x8004, <index>   @ one of the GYM_REWARD_* indices below
//     special GetGymReward         @ VAR_RESULT = species, VAR_0x8005 = held item (mega stone or NONE)
//     givemon VAR_RESULT, <level>[, VAR_0x8005]
//     bufferspeciesname STR_VAR_1, VAR_RESULT   @ the reward message uses {STR_VAR_1}
// The species/item live in gGymRewards[] (const .rodata) and are read with a RUNTIME index, so -O2/LTO
// can't constant-fold them — the array survives at a fixed .map offset the injector overwrites. The
// randomizer patches these initializers at build time (randomizer/writer.js). u16 comes from global.h.

#define GYM_REWARD_COUNT 11

// Indices — MUST match randomizer/writer.js `pokeRewardReplacements` order (scripts pass the raw number).
enum {
    GYM_REWARD_RUSTBORO = 0,
    GYM_REWARD_DEWFORD,
    GYM_REWARD_MAUVILLE,          // gives a mega stone (item)
    GYM_REWARD_LAVARIDGE,
    GYM_REWARD_PETALBURG,
    GYM_REWARD_FORTREE,
    GYM_REWARD_MOSSDEEP,
    GYM_REWARD_SOOTOPOLIS,
    GYM_REWARD_SLATEPORT_MUSEUM,  // gives a mega stone (item)
    GYM_REWARD_WEATHER_INSTITUTE, // gives a mega stone (item)
    GYM_REWARD_LILYCOVE,
};

struct GymReward
{
    u16 species;
    u16 item; // held item — a mega stone for MAUVILLE/SLATEPORT_MUSEUM/WEATHER_INSTITUTE, else ITEM_NONE
};

extern const struct GymReward gGymRewards[GYM_REWARD_COUNT];

// special: reads the gym index from VAR_0x8004 → VAR_RESULT = species, VAR_0x8005 = held item.
void GetGymReward(void);

// T-235 — data-driven static legendary encounters (was baked into the map scripts via SPECIES_REGIROCK /
// SPECIES_LEGEND1… tokens). `setwildbattle`/`playmoncry` take constants only, so a `special` reads the
// species+level from gStaticEncounters[] and sets up the scripted wild mon + cry in C.
#define STATIC_ENCOUNTER_COUNT 7
enum {
    STATIC_ENCOUNTER_REGIROCK = 0,
    STATIC_ENCOUNTER_REGICE,
    STATIC_ENCOUNTER_REGISTEEL,
    STATIC_ENCOUNTER_MEW,
    STATIC_ENCOUNTER_LEGEND1,
    STATIC_ENCOUNTER_LEGEND2,
    STATIC_ENCOUNTER_LEGEND3,
};

struct StaticEncounter
{
    u16 species;
    u16 level;
};

extern const struct StaticEncounter gStaticEncounters[STATIC_ENCOUNTER_COUNT];

// special: VAR_0x8004 = encounter index → plays the cry + sets up the scripted wild mon; also writes the
// species to VAR_RESULT.
void SetupStaticEncounter(void);
// special: VAR_0x8004 = encounter index → VAR_RESULT = species (for the "flew away" name buffer).
void GetStaticEncounterSpecies(void);

#endif // GUARD_RANDOMIZER_REWARDS_H
