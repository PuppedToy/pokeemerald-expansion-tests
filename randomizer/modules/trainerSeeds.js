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
// T-143 (owner) — Trick Room is NEVER force-seeded. A forced TR was fundamentally unbuildable for a
// type-restricted boss (Tate & Liza is Psychic-restricted: almost no slow Psychic mons / megas at the boss
// tiers), so it produced fast "TR" teams. TR now ONLY happens EMERGENTLY — when a team genuinely rolls a
// slow-offensive core (emergentGimmick, B-035) it builds a (half) room around it, TM-gated (B-036).
// T-137 — Wattson: electric terrain as a real gimmick (setter + 2 abusers), no fallback to other gimmicks
// (his monotype pool tries electric terrain, else a normal Electric team).
const ELECTRIC_TERRAIN = { base: 'bulky_offense', gimmicks: ['electric_terrain'] };

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
    // T-136 (owner) — Flannery is NO LONGER force-seeded to sun. She's a Fire gym leader, but with type
    // mutation her pool often can't field a sun setter + 2 abusers, so the old seed forced a fallback to a
    // different weather anyway. She's now fully EMERGENT: if her rolls hand her a Torkoal (Drought), the
    // emergent-weather assembly (T-136) builds sun around it; otherwise she stays a normal Fire team.
    // Wattson → electric terrain (manual gimmick)
    TRAINER_WATTSON_1: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_2: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_3: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_4: ELECTRIC_TERRAIN,
    TRAINER_WATTSON_5: ELECTRIC_TERRAIN,
    // T-143 (owner) — Tate & Liza force NOTHING (no Trick Room, no gimmick). They're a normal Psychic boss;
    // if their roll happens to produce a slow-offensive core, TR emerges on its own — otherwise a plain team.
};

function getTrainerSeed(trainerId) {
    return TRAINER_SEEDS[trainerId] || null;
}

module.exports = { getTrainerSeed, TRAINER_SEEDS };
