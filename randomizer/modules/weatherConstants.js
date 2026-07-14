'use strict';

// T-132 — shared weather constants (a leaf module, no deps) so the picker, the refine step and the
// gimmick success-condition can all reference the SAME setter/abuser/subtype maps without a require cycle
// (archetypeRefine ↔ archetypePicker). SSOT for weather ability groupings; move/mechanic details live in
// docs/research/weather.md.

// A weather-setter ABILITY → the subtype it establishes.
const WEATHER_SUBTYPE_BY_SETTER = {
    DROUGHT: 'sun', ORICHALCUM_PULSE: 'sun', DRIZZLE: 'rain', SAND_STREAM: 'sand', SNOW_WARNING: 'snow',
};
const WEATHER_SETTER_ABILITIES = Object.keys(WEATHER_SUBTYPE_BY_SETTER);

// Subtype → the setter abilities that establish it.
const SETTERS_BY_SUBTYPE = {
    sun: ['DROUGHT', 'ORICHALCUM_PULSE'], rain: ['DRIZZLE'], sand: ['SAND_STREAM'], snow: ['SNOW_WARNING'],
};

// Subtype → the speed/power ABUSER abilities that pay the weather off.
const WEATHER_ABUSER_BY_SUBTYPE = {
    sun: ['CHLOROPHYLL', 'SOLAR_POWER', 'PROTOSYNTHESIS'],   // T-135 — Protosynthesis is a strong sun ability
    rain: ['SWIFT_SWIM', 'HYDRATION', 'RAIN_DISH', 'DRY_SKIN'],
    sand: ['SAND_RUSH', 'SAND_FORCE'],
    snow: ['SLUSH_RUSH', 'ICE_BODY'],
};

// T-135 — the speed-DOUBLING abuser ability per subtype (its value scales with the mon's OFFENSIVE power:
// a speed multiplier is scariest on a strong attacker).
const SPEED_MULT_ABILITY = { sun: 'CHLOROPHYLL', rain: 'SWIFT_SWIM', sand: 'SAND_RUSH', snow: 'SLUSH_RUSH' };

// T-135 — weather-abuse RATING weights (owner "Path 1": rank eligible abusers by how well they exploit the
// ACTIVE weather; sophistication pulls the pick toward the top). Each ability is modelled by the stat it
// scales. All tunable — bump `rankStrength` if the pick feels too random; lower `base` if raw power drowns
// the ability bonus; raise a per-ability weight to favour that ability more.
const WX_ABUSE_RATING = {
    base: 0.4,          // weight on the mon's base offensive rating (a good abuser is still a good mon)
    abilityFloor: 4.0,  // flat bonus for having a REAL offensive weather ability (Chlorophyll/Solar Power/
                        // Protosynthesis/Swift Swim/Sand Rush/Sand Force/Slush Rush) — so an ability-abuser
                        // always outranks a mere boosted-STAB type attacker (owner: prefer the ability).
    speedMult: 4.0,     // Chlorophyll/Swift Swim/Sand Rush/Slush Rush — speed×2, scales with offence
    solarPower: 3.5,    // Solar Power — SpA↑ + HP chip, scales with SPEED (hit before the chip hurts)
    proto: 3.0,         // Protosynthesis — boosts the best stat, scales with the best stat
    powerAbility: 2.5,  // Sand Force — move-power boost, scales with offence
    defUtil: 1.0,       // Hydration/Rain Dish/Dry Skin/Ice Body — longevity, modest
    stab: 2.5,          // boosted-STAB type (rain Water / sun Fire) — STAB'd, weather-boosted attacks
    def: 1.5,           // boosted-DEF type (sand Rock / snow Ice) — tanks the weather
    synergy: 1.0,       // can learn a synergy move (Solar Beam/Blade, Blizzard, Weather Ball…)
    synergyStab: 1.5,   // + that synergy move is ALSO STAB (sun Solar Beam/Blade on a Grass mon)
    // Sophistication sharpens the pick via weight = (rating/maxRating)^(soph × rankSharpness). At endgame
    // soph the exponent is large → the top-rated abusers dominate (a strong Chlorophyll/Solar-Power mon over
    // a plain Fire STAB attacker); early game (low soph) → exponent ≈ 0 → near-uniform among eligibles.
    rankSharpness: 10,
};

// The offensive STAB type each weather boosts x1.5 (rain/sun only). A strong attacker of this type abuses
// the weather without needing a weather ability (the corpus's support-weather teams work this way).
const BOOSTED_STAB_TYPE = { rain: 'WATER', sun: 'FIRE' };

// The DEFENSIVELY-boosted type each weather buffs x1.5 (sand/snow only — the two subtypes with NO boosted
// STAB and no usable move path in this game: Weather Ball is not a TM, and Blizzard/Aurora Veil TMs are
// rarely held). A mon of this type abuses the weather by tanking (Rock in sand, Ice in snow) — the
// defensive analogue of the boosted-STAB attacker, and this game's Sand/Snow mechanic per the research doc.
// Owner-approved 2026-07-13 after verifying the ability/move paths are genuinely exhausted for these two.
const BOOSTED_DEF_TYPE = { sand: 'ROCK', snow: 'ICE' };

// A weather team's success condition (owner-validated): a setter + this many abusers.
const WEATHER_REQUIRED_ABUSERS = 2;

// T-136 — EMERGENT weather on a NON-DEDICATED team. A trainer with no weather intent of its own that
// happens to ROLL a natural setter (Kyogre/Politoed/Torkoal via mutated abilities, or a move-setter)
// opportunistically tries to build that weather (setter + 2 abusers). Gated on sophistication: below
// this, a low-level fluke setter builds nothing (early game stays "a pile of mons"). Owner: 2026-07-14.
const EMERGENT_WEATHER_MIN_SOPH = 0.35;

// T-132 — weather-abuse SCORE (owner-designed 2026-07-13). A single subtype-specific score decides "is
// this mon a weather abuser for subtype X", used identically by the picker, the success condition and the
// decision-log labels (one definition → no drift). Potential-based (typing / ability pool / movepool), NOT
// dependent on the exact final moveset, so a Water-type on rain counts by nature even if its 4 moves didn't
// happen to include a Water STAB. A mon scores 0 for a weather it doesn't fit (a Swift Swimmer scores 0 in
// sun), which is why the log can no longer mislabel a foreign-weather ability as an abuser.
//   +3  the subtype's abuser ABILITY (the "queens": Swift Swim / Chlorophyll / Sand Rush / Slush Rush / …)
//   +2  the offensively-boosted STAB type (rain→Water, sun→Fire) AND a decent attacking stat
//   +2  the defensively-boosted type (sand→Rock ×1.5 SpDef, snow→Ice ×1.5 Def)
//   +1  can (learn / carries) a weather-synergy move (Thunder/Solar Beam/Blizzard/Aurora Veil/Weather Ball)
// A mon is an ABUSER when its score reaches the threshold. Thresholds/weights live here so they are tunable.
const WEATHER_ABUSE_THRESHOLD = 2;         // score ≥ this ⇒ counts as an abuser
const WEATHER_STAB_ATK_MIN = 80;           // "decent attacker" bar for the boosted-STAB +2 (max of Atk/SpA)
const WEATHER_ABUSE_ABILITY_PTS = 3;
const WEATHER_ABUSE_STAB_PTS = 2;
const WEATHER_ABUSE_DEF_PTS = 2;
const WEATHER_ABUSE_SYNERGY_PTS = 1;

// Abilities that are ONLY useful under their own weather, BEYOND the speed/power abusers above — the
// defensive / status synergy ones. Kept separate so the full ability→subtype map (below) is complete.
// Deliberately EXCLUDES dual-value abilities (Dry Skin = water immunity, Harvest, Protosynthesis with
// Booster Energy, Ice Face) whose worth isn't purely weather — they should not be zeroed off-weather.
const WEATHER_DEFENSIVE_SYNERGY = {
    sun: ['LEAF_GUARD', 'FLOWER_GIFT'], rain: [], sand: ['SAND_VEIL'], snow: ['SNOW_CLOAK'],
};

// The subtype each WEATHER ABILITY belongs to (setter ∪ speed/power abuser ∪ defensive synergy). A weather
// ability is worth having ONLY when ITS subtype is the active weather — off-weather it does nothing (score
// 0 / not picked), and on-weather it's preferred over a generic ability (owner, 2026-07-13). SSOT for the
// weather-aware ability value used by pickTrainerMonAbility.
const WEATHER_ABILITY_SUBTYPE = (() => {
    const map = { ...WEATHER_SUBTYPE_BY_SETTER };
    for (const [sub, abils] of Object.entries(WEATHER_ABUSER_BY_SUBTYPE)) for (const a of abils) map[a] = sub;
    for (const [sub, abils] of Object.entries(WEATHER_DEFENSIVE_SYNERGY)) for (const a of abils) map[a] = sub;
    return map;
})();

// Move-based setters, per subtype (the suboptimal "force" path — an ability setter is preferred).
const SETTER_MOVE_BY_SUBTYPE = {
    sun: ['MOVE_SUNNY_DAY'], rain: ['MOVE_RAIN_DANCE'], sand: ['MOVE_SANDSTORM'],
    snow: ['MOVE_SNOWSCAPE', 'MOVE_CHILLY_RECEPTION', 'MOVE_HAIL'],
};

// Weather-synergy moves (pseudo-STAB / perfect-accuracy / veil) per subtype — corpus-derived
// (docs/research/weather.md). Carrying one makes a member an abuser via the MOVE path, which is the ONLY
// abuser path snow & sand have besides their rare abilities (no boosted-STAB type).
const SYNERGY_MOVE_BY_SUBTYPE = {
    rain: ['MOVE_THUNDER', 'MOVE_HURRICANE', 'MOVE_WEATHER_BALL', 'MOVE_ELECTRO_SHOT'],
    sun: ['MOVE_SOLAR_BEAM', 'MOVE_SOLAR_BLADE', 'MOVE_GROWTH', 'MOVE_WEATHER_BALL'],
    sand: ['MOVE_WEATHER_BALL'],
    snow: ['MOVE_BLIZZARD', 'MOVE_AURORA_VEIL', 'MOVE_WEATHER_BALL'],
};

module.exports = {
    WEATHER_SUBTYPE_BY_SETTER, WEATHER_SETTER_ABILITIES, SETTERS_BY_SUBTYPE,
    WEATHER_ABUSER_BY_SUBTYPE, BOOSTED_STAB_TYPE, BOOSTED_DEF_TYPE, WEATHER_ABILITY_SUBTYPE,
    SETTER_MOVE_BY_SUBTYPE, SYNERGY_MOVE_BY_SUBTYPE, WEATHER_REQUIRED_ABUSERS, EMERGENT_WEATHER_MIN_SOPH,
    WEATHER_ABUSE_THRESHOLD, WEATHER_STAB_ATK_MIN,
    WEATHER_ABUSE_ABILITY_PTS, WEATHER_ABUSE_STAB_PTS, WEATHER_ABUSE_DEF_PTS, WEATHER_ABUSE_SYNERGY_PTS,
    SPEED_MULT_ABILITY, WX_ABUSE_RATING,
};
