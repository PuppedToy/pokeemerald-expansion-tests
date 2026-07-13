'use strict';

// T-126 — owner-validated per-trainer archetype/gimmick SEEDS (deliberate identity + variety).
//
// A seed is a LEAN, not a force: `resolveIdentity` honours the seed's base until a stronger emergent
// identity forms, and a seeded GIMMICK persists throughout (T-124) so the engine actually BUILDS it
// (weather setter + matching abusers, TR slow mons/Room Service, …). `weather` names the themed
// subtype so the setter ability matches (Aqua → rain / Drizzle, Magma & fire → sun / Drought).
//
// Only these trainers are seeded; everyone else stays fully emergent. Weather subtypes validated by the
// owner (2026-07-13, T-131): Museum grunt 1 → rain, Museum grunt 2 → snow, Archie → rain, Matt → snow,
// Maxie (all) → sun, Tabitha (all) → sandstorm, Flannery (fire) → sun. Each is a LEAN with a general-
// weather fallback (if the themed setter can't be built within the trainer's restrictions, any weather
// setter the team CAN field still satisfies the `weather` gimmick). Trick Room = Tate & Liza.
const WEATHER_SUN = { base: 'bulky_offense', gimmicks: ['weather'], weather: 'sun' };
const WEATHER_RAIN = { base: 'bulky_offense', gimmicks: ['weather'], weather: 'rain' };
const WEATHER_SNOW = { base: 'bulky_offense', gimmicks: ['weather'], weather: 'snow' };
const WEATHER_SAND = { base: 'bulky_offense', gimmicks: ['weather'], weather: 'sand' };
const TRICK_ROOM = { base: 'balance', gimmicks: ['trick_room'] };
// T-124/T-127 — Wattson: electric terrain (a Gen-8+ gimmick, added manually; see archetypeRefine).
const ELECTRIC_TERRAIN = { base: 'bulky_offense', electricTerrain: true };

const TRAINER_SEEDS = {
    // Team Aqua museum grunts → rain / snow; Archie → rain; Matt → snow
    TRAINER_GRUNT_MUSEUM_1: WEATHER_RAIN,
    TRAINER_GRUNT_MUSEUM_2: WEATHER_SNOW,
    TRAINER_ARCHIE: WEATHER_RAIN,
    TRAINER_MATT: WEATHER_SNOW,
    // Team Magma: Maxie (all forms) → sun, Tabitha (all forms) → sandstorm
    TRAINER_TABITHA_MT_CHIMNEY: WEATHER_SAND,
    TRAINER_TABITHA_MAGMA_HIDEOUT: WEATHER_SAND,
    TRAINER_TABITHA_MOSSDEEP: WEATHER_SAND,
    TRAINER_MAXIE_MT_CHIMNEY: WEATHER_SUN,
    TRAINER_MAXIE_MAGMA_HIDEOUT: WEATHER_SUN,
    TRAINER_MAXIE_MOSSDEEP: WEATHER_SUN,
    // Flannery (fire) → sun
    TRAINER_FLANNERY_1: WEATHER_SUN,
    TRAINER_FLANNERY_2: WEATHER_SUN,
    TRAINER_FLANNERY_3: WEATHER_SUN,
    TRAINER_FLANNERY_4: WEATHER_SUN,
    TRAINER_FLANNERY_5: WEATHER_SUN,
    // Wattson → electric terrain (manual gimmick)
    TRAINER_WATTSON_1: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_2: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_3: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_4: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_5: ELECTRIC_TERRAIN,
    // Tate & Liza → Trick Room
    TRAINER_TATE_AND_LIZA_1: TRICK_ROOM,
    TRAINER_TATE_AND_LIZA_2: TRICK_ROOM,
    TRAINER_TATE_AND_LIZA_3: TRICK_ROOM,
    TRAINER_TATE_AND_LIZA_4: TRICK_ROOM,
    TRAINER_TATE_AND_LIZA_5: TRICK_ROOM,
};

function getTrainerSeed(trainerId) {
    return TRAINER_SEEDS[trainerId] || null;
}

module.exports = { getTrainerSeed, TRAINER_SEEDS };
