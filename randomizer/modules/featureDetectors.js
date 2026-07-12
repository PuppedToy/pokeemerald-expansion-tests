'use strict';

// T-107 (107a) — feature detectors for the archetype-driven teambuilding engine.
//
// Pure functions `(mon, ctx) -> boolean` that tag a candidate Pokémon with the role features the
// archetype models (data/archetypes/{singles,doubles}.json) reference in their `entry` (emergent
// crystallization) and `structure` (soft composition). `detectFeatures` runs them all and returns the
// Set of matching tags. Read-only: never mutates `mon` or `ctx`.
//
// Detection is grounded in EXISTING data: `parsedAbilities`, learnset/teachables (move potential),
// base stats, and — for spread/priority — the move metadata in `ctx.moves` (target/priority/category).
// The stat THRESHOLDS below are provisional and tunable (see THRESHOLDS); they encode "what counts as
// a wallbreaker / wall / sweeper", not a competitive-meta claim, so they carry no owner-validation gate.

// ── Provisional, tunable thresholds ─────────────────────────────────────────
// Corpus-derived, owner-validated (2026-07-11, docs/research/rating-decisions.md). Singles corpus
// baseline: speed 84, offense 119, bulk 273.
const THRESHOLDS = {
    WALLBREAKER_OFFENSE: 110,   // base Atk or SpA that marks a dedicated breaker
    SETUP_SWEEPER_OFFENSE: 115, // corpus setup sweepers median 130 (79% >=110); raised from 90 (too loose)
    TR_ABUSER_OFFENSE: 90,
    TR_ABUSER_MAX_SPEED: 55,    // "slow" enough to want Trick Room
    REVENGE_MIN_OFFENSE: 90,
    REVENGE_MIN_SPEED: 100,     // fast enough to revenge-kill (Choice Scarf implied)
    WALL_MIN_DEF: 100,          // physical/special wall defensive stat
    WALL_MIN_HP: 80,
    WALL_MAX_OFFENSE: 95,       // a wall isn't primarily an attacker
    SUPPORT_MAX_OFFENSE: 95,    // screens/cleric are a UTILITY job, not an attacker's (corpus cleric off 73)
    CLERIC_MIN_BULK: 285,       // corpus clerics: bulky (avg 304), slow, low-offense, recovery
    BULKY_TOTAL: 260,           // HP+Def+SpD that marks a bulky pivot
    FAST_MIN_SPEED: 95,         // suicide-lead / fast threshold
    FRAIL_MAX_TOTAL: 230,       // HP+Def+SpD that marks a frail mon
};

// ── Ability groups (parsedAbilities are prefix-less names, e.g. 'INTIMIDATE') ──
const WEATHER_SETTER_ABILITIES = new Set(['DRIZZLE', 'DROUGHT', 'SAND_STREAM', 'SNOW_WARNING', 'ORICHALCUM_PULSE', 'DESOLATE_LAND', 'PRIMORDIAL_SEA']);
const WEATHER_ABUSER_ABILITIES = new Set(['SWIFT_SWIM', 'CHLOROPHYLL', 'SAND_RUSH', 'SLUSH_RUSH', 'SAND_FORCE', 'SOLAR_POWER']);
const REDIRECT_ABILITIES = new Set(['LIGHTNING_ROD', 'STORM_DRAIN']);
const TRAPPER_ABILITIES = new Set(['SHADOW_TAG', 'ARENA_TRAP', 'MAGNET_PULL']);
const UNAWARE_ABILITIES = new Set(['UNAWARE', 'MAGIC_BOUNCE']);

// ── Move groups (by "named technique") ───────────────────────────────────────
const WEATHER_MOVES = new Set(['MOVE_RAIN_DANCE', 'MOVE_SUNNY_DAY', 'MOVE_SANDSTORM', 'MOVE_HAIL', 'MOVE_SNOWSCAPE', 'MOVE_CHILLY_RECEPTION']);
const HAZARD_MOVES = new Set(['MOVE_STEALTH_ROCK', 'MOVE_SPIKES', 'MOVE_TOXIC_SPIKES', 'MOVE_STICKY_WEB', 'MOVE_STONE_AXE', 'MOVE_CEASELESS_EDGE']);
const HAZARD_REMOVAL_MOVES = new Set(['MOVE_DEFOG', 'MOVE_RAPID_SPIN', 'MOVE_MORTAL_SPIN', 'MOVE_TIDY_UP']);
// T-118 — real sweeper-defining boosts only. The weak/common TMs (Work Up, Hone Claws, Curse, Growth,
// Tidy Up) were dropped: nearly every mon learns one, which falsely made everything a "setup sweeper".
const SETUP_MOVES = new Set([
    'MOVE_DRAGON_DANCE', 'MOVE_SWORDS_DANCE', 'MOVE_CALM_MIND', 'MOVE_QUIVER_DANCE', 'MOVE_NASTY_PLOT',
    'MOVE_SHIFT_GEAR', 'MOVE_BULK_UP', 'MOVE_SHELL_SMASH', 'MOVE_GEOMANCY', 'MOVE_BELLY_DRUM',
    'MOVE_TAIL_GLOW', 'MOVE_AUTOTOMIZE', 'MOVE_COIL', 'MOVE_VICTORY_DANCE', 'MOVE_CLANGOROUS_SOUL',
    'MOVE_NO_RETREAT', 'MOVE_TAKE_HEART',
]);
const CLERIC_MOVES = new Set(['MOVE_WISH', 'MOVE_AROMATHERAPY', 'MOVE_HEAL_BELL', 'MOVE_LIFE_DEW', 'MOVE_JUNGLE_HEALING']);
const PIVOT_MOVES = new Set(['MOVE_U_TURN', 'MOVE_VOLT_SWITCH', 'MOVE_FLIP_TURN', 'MOVE_TELEPORT', 'MOVE_PARTING_SHOT', 'MOVE_CHILLY_RECEPTION', 'MOVE_BATON_PASS']);
const RECOVERY_MOVES = new Set([
    'MOVE_RECOVER', 'MOVE_ROOST', 'MOVE_SLACK_OFF', 'MOVE_SOFT_BOILED', 'MOVE_MILK_DRINK', 'MOVE_MOONLIGHT',
    'MOVE_MORNING_SUN', 'MOVE_SYNTHESIS', 'MOVE_SHORE_UP', 'MOVE_WISH', 'MOVE_REST', 'MOVE_STRENGTH_SAP',
    'MOVE_LIFE_DEW', 'MOVE_JUNGLE_HEALING', 'MOVE_HEAL_ORDER',
]);
const SCREEN_MOVES = new Set(['MOVE_REFLECT', 'MOVE_LIGHT_SCREEN', 'MOVE_AURORA_VEIL']);
const TRICK_ROOM_MOVES = new Set(['MOVE_TRICK_ROOM']);
const TAILWIND_MOVES = new Set(['MOVE_TAILWIND']);
const REDIRECT_MOVES = new Set(['MOVE_FOLLOW_ME', 'MOVE_RAGE_POWDER']);
const WIDE_GUARD_MOVES = new Set(['MOVE_WIDE_GUARD', 'MOVE_QUICK_GUARD']);

const SPREAD_TARGETS = new Set(['MOVE_TARGET_BOTH', 'MOVE_TARGET_BOTH_FOES', 'MOVE_TARGET_FOES_AND_ALLY', 'MOVE_TARGET_ALL_BATTLERS']);

// ── Data helpers ─────────────────────────────────────────────────────────────
function hasAbility(mon, set) {
    return (mon.parsedAbilities || []).some(a => set.has(a));
}
function canLearn(mon, moveId) {
    return (mon.learnset || []).some(l => l.move === moveId) || (mon.teachables || []).includes(moveId);
}
function canLearnAny(mon, moveSet) {
    for (const m of moveSet) { if (canLearn(mon, m)) return true; }
    return false;
}
function learnableMoveIds(mon) {
    return [...(mon.learnset || []).map(l => l.move), ...(mon.teachables || [])];
}
function offense(mon) { return Math.max(mon.baseAttack || 0, mon.baseSpAttack || 0); }
function bulkTotal(mon) { return (mon.baseHP || 0) + (mon.baseDefense || 0) + (mon.baseSpDefense || 0); }
// A learnable move that satisfies pred(moveObj); needs ctx.moves metadata.
function hasMoveWhere(mon, ctx, pred) {
    const moves = ctx && ctx.moves;
    if (!moves) return false;
    return learnableMoveIds(mon).some(id => {
        const mv = moves[id];
        return mv && pred(mv);
    });
}
const isDamaging = mv => mv.category && mv.category !== 'DAMAGE_CATEGORY_STATUS';

// ── Detectors ────────────────────────────────────────────────────────────────
const DETECTORS = {
    // ability-based
    intimidateUser: (mon) => hasAbility(mon, new Set(['INTIMIDATE'])),
    trapper: (mon) => hasAbility(mon, TRAPPER_ABILITIES),
    unawareWall: (mon) => hasAbility(mon, UNAWARE_ABILITIES),
    weatherAbuser: (mon) => hasAbility(mon, WEATHER_ABUSER_ABILITIES),
    // T-118 — by ABILITY only (owner-validated): a weather-team identity is defined by a weather
    // setter ability, not by being able to learn Rain Dance (a widely-learnable, weak TM). Detecting
    // it by move potential falsely tagged almost every mon a weather setter (T-117 audit).
    weatherSetter: (mon) => hasAbility(mon, WEATHER_SETTER_ABILITIES),
    redirector: (mon) => hasAbility(mon, REDIRECT_ABILITIES) || canLearnAny(mon, REDIRECT_MOVES),

    // move-based (named techniques)
    fakeOutUser: (mon) => canLearn(mon, 'MOVE_FAKE_OUT'),
    tailwindSetter: (mon) => canLearnAny(mon, TAILWIND_MOVES),
    trickRoomSetter: (mon) => canLearnAny(mon, TRICK_ROOM_MOVES),
    perishSongUser: (mon) => canLearn(mon, 'MOVE_PERISH_SONG'),
    hazardSetter: (mon) => canLearnAny(mon, HAZARD_MOVES),
    hazardRemover: (mon) => canLearnAny(mon, HAZARD_REMOVAL_MOVES),
    // T-118 — screens are a UTILITY job (corpus: rare, low-offense support), not something every
    // attacker that can learn Light Screen does. Gate on a non-attacker profile.
    screenSetter: (mon) => canLearnAny(mon, SCREEN_MOVES) && offense(mon) <= THRESHOLDS.SUPPORT_MAX_OFFENSE,
    // T-118 — a real cleric is a bulky, low-offense support (corpus: bulk ~304, off 73, has recovery),
    // not any mon that can learn Wish/Heal Bell.
    cleric: (mon) => canLearnAny(mon, CLERIC_MOVES)
        && bulkTotal(mon) >= THRESHOLDS.CLERIC_MIN_BULK
        && offense(mon) <= THRESHOLDS.SUPPORT_MAX_OFFENSE,
    pivotUser: (mon) => canLearnAny(mon, PIVOT_MOVES),
    wideGuardUser: (mon) => canLearnAny(mon, WIDE_GUARD_MOVES),

    // move-metadata-based (need ctx.moves)
    spreadAttacker: (mon, ctx) => hasMoveWhere(mon, ctx, mv => isDamaging(mv) && SPREAD_TARGETS.has(mv.target)),
    priorityUser: (mon, ctx) => hasMoveWhere(mon, ctx, mv => isDamaging(mv) && (mv.priority || 0) > 0),

    // stat-threshold-based. T-118 — ONE offensive identity per mon (owner-validated): precedence
    // setupSweeper > choiceScarfRevengeKiller > wallbreaker, mutually exclusive, so a strong attacker
    // is not counted as all three at once (a mon runs one set).
    setupSweeper: (mon) => canLearnAny(mon, SETUP_MOVES) && offense(mon) >= THRESHOLDS.SETUP_SWEEPER_OFFENSE,
    choiceScarfRevengeKiller: (mon, ctx) => (mon.baseSpeed || 0) >= THRESHOLDS.REVENGE_MIN_SPEED
        && offense(mon) >= THRESHOLDS.REVENGE_MIN_OFFENSE
        && !DETECTORS.setupSweeper(mon, ctx),
    wallbreaker: (mon, ctx) => offense(mon) >= THRESHOLDS.WALLBREAKER_OFFENSE
        && !DETECTORS.setupSweeper(mon, ctx)
        && !DETECTORS.choiceScarfRevengeKiller(mon, ctx),
    trickRoomAbuser: (mon) => (mon.baseSpeed || 0) <= THRESHOLDS.TR_ABUSER_MAX_SPEED && offense(mon) >= THRESHOLDS.TR_ABUSER_OFFENSE,
    physicalWall: (mon) => (mon.baseDefense || 0) >= THRESHOLDS.WALL_MIN_DEF && (mon.baseHP || 0) >= THRESHOLDS.WALL_MIN_HP && offense(mon) <= THRESHOLDS.WALL_MAX_OFFENSE,
    specialWall: (mon) => (mon.baseSpDefense || 0) >= THRESHOLDS.WALL_MIN_DEF && (mon.baseHP || 0) >= THRESHOLDS.WALL_MIN_HP && offense(mon) <= THRESHOLDS.WALL_MAX_OFFENSE,

    // composite
    regeneratorPivot: (mon) => {
        const bulky = bulkTotal(mon) >= THRESHOLDS.BULKY_TOTAL;
        if (!bulky) return false;
        if (hasAbility(mon, new Set(['REGENERATOR']))) return true;
        // T-123 — a non-Regenerator "regen-style" pivot must be genuinely DEFENSIVE (not an attacker
        // that merely happens to be bulky and learn Rest + U-turn), else balance's backbone over-fires.
        return offense(mon) <= THRESHOLDS.WALL_MAX_OFFENSE
            && canLearnAny(mon, RECOVERY_MOVES) && canLearnAny(mon, PIVOT_MOVES);
    },
    focusSashLead: (mon) => (mon.baseSpeed || 0) >= THRESHOLDS.FAST_MIN_SPEED
        && bulkTotal(mon) <= THRESHOLDS.FRAIL_MAX_TOTAL
        && canLearnAny(mon, HAZARD_MOVES)
        && canLearn(mon, 'MOVE_TAUNT'),
    // T-118 — a win condition is a genuine closer (a setup sweeper), not "any strong attacker"
    // (that's just wallbreaker). Narrowed from setupSweeper||wallbreaker so it stops firing on everyone.
    winCondition: (mon, ctx) => DETECTORS.setupSweeper(mon, ctx),
};

// Runs every detector; returns the Set of matching feature tags. Pure (no mutation of mon/ctx).
function detectFeatures(mon, ctx = {}) {
    const feats = new Set();
    for (const tag of Object.keys(DETECTORS)) {
        if (DETECTORS[tag](mon, ctx)) feats.add(tag);
    }
    return feats;
}

// Move groups exposed so the refinement pass (107d) can map a move-deliverable role → the moves that
// deliver it (e.g. hazardSetter → HAZARD_MOVES). Sets iterate in insertion order (deterministic).
const MOVE_SETS = {
    WEATHER_MOVES, HAZARD_MOVES, HAZARD_REMOVAL_MOVES, SETUP_MOVES, CLERIC_MOVES, PIVOT_MOVES,
    SCREEN_MOVES, TRICK_ROOM_MOVES, TAILWIND_MOVES, REDIRECT_MOVES, WIDE_GUARD_MOVES,
};

module.exports = { DETECTORS, detectFeatures, THRESHOLDS, MOVE_SETS };
