'use strict';

// T-107 (107d) — identity-aware refinement (the move half).
//
// The weighted fill (107c) biases the team toward archetype-CAPABLE species, but the moveset is still
// chosen on raw rating — so a mon picked for (say) hazard potential may not actually run hazards.
// This module decides, for a just-chosen member, the ONE archetype role move it should also carry so
// the team DELIVERS a still-missing role of its emerged identity. The resolver injects the returned
// move as a fixed move before chooseMoveset (same path as tryToHaveMove), so move QUALITY is preserved
// (the rater fits it into the best set) rather than crudely swapped in.
//
// Pure + deterministic. Gated by sophistication (shares the picker's thresholds), so early-game teams
// get no refinement and stay byte-identical.

const { detectFeatures, MOVE_SETS } = require('./featureDetectors');
const { teamFeatureCounts, combinedStructure } = require('./archetypeFit');
const { BIAS_MIN_SOPH, resolveIdentity } = require('./archetypePicker');

// Move-deliverable roles → the moves that deliver them. Ability/stat-only roles (intimidateUser,
// wallbreaker, walls, regeneratorPivot, weatherSetter/abuser) are absent — they can't be fixed by a
// move, and the 107c pick already biased toward mons that have them.
const ROLE_MOVE_SETS = {
    hazardSetter: MOVE_SETS.HAZARD_MOVES,
    hazardRemover: MOVE_SETS.HAZARD_REMOVAL_MOVES,
    screenSetter: MOVE_SETS.SCREEN_MOVES,
    trickRoomSetter: MOVE_SETS.TRICK_ROOM_MOVES,
    tailwindSetter: MOVE_SETS.TAILWIND_MOVES,
    cleric: MOVE_SETS.CLERIC_MOVES,
    pivotUser: MOVE_SETS.PIVOT_MOVES,
    wideGuardUser: MOVE_SETS.WIDE_GUARD_MOVES,
    redirector: MOVE_SETS.REDIRECT_MOVES,
    setupSweeper: MOVE_SETS.SETUP_MOVES,
    perishSongUser: new Set(['MOVE_PERISH_SONG']),
    fakeOutUser: new Set(['MOVE_FAKE_OUT']),
};

// A detection view of a RESOLVED member: its actual ability + actual moves (so a role only counts as
// "delivered" if the chosen moveset/ability really provides it — unlike species-potential detection).
function resolvedDetectMon(member) {
    const poke = (member && member.pokemon) || member || {};
    const mv = (member && member.moves) || [];
    return {
        ...poke,
        parsedAbilities: (member && member.ability) ? [member.ability] : (poke.parsedAbilities || []),
        learnset: mv.map(m => ({ level: '1', move: m })),
        teachables: mv,
    };
}

// B-030 — a role move must respect the incremental TM bag. A level-up move is fine if reachable at the
// trainer's level; a teachable is fine only if the trainer currently holds that TM. When `tms`/`level`
// are not supplied (pure unit tests), the gate is permissive (unchanged behaviour).
function speciesCanLearn(species, move, { tms = null, level = null } = {}) {
    const byLevel = (species.learnset || []).some(l => l.move === move && (level == null || l.level <= level));
    if (byLevel) return true;
    return (species.teachables || []).includes(move) && (tms == null || tms.includes(move));
}

// The archetype role move `species` should also carry, or null. `team` is the members chosen so far
// (newTeamMember wrappers). Deterministic; returns null unless a coherent identity has emerged and
// sophistication is high enough.
function planMemberRoleMove({ species, team, model, ctx = {}, sophistication, seed = null }) {
    if (!model || !species || (sophistication || 0) < BIAS_MIN_SOPH) return null;

    // Effective identity (emergent, else the trainer's seed) over the prior team, from species
    // potential — same basis as the 107c fill.
    const speciesMons = (team || []).map(m => (m && m.pokemon) ? m.pokemon : m);
    const identity = resolveIdentity(speciesMons, model, ctx, seed);
    if (!identity) return null;
    const structure = combinedStructure(model, identity.baseId, identity.gimmickIds);

    // Roles the prior team ACTUALLY delivers (resolved movesets/abilities).
    const delivered = teamFeatureCounts((team || []).map(resolvedDetectMon), ctx);
    const speciesFeats = detectFeatures(species, ctx);

    const candidates = structure
        .filter(s => ROLE_MOVE_SETS[s.role] && speciesFeats.has(s.role) && (delivered[s.role] || 0) < s.min)
        .sort((a, b) => b.weight - a.weight);

    // Return the first role move the species can ACTUALLY have here — trying alternatives (U-turn before
    // Volt Switch, etc.) so an inaccessible TM doesn't block the role and doesn't leak in (B-030).
    const gate = { tms: ctx.tms || null, level: ctx.level ?? null };
    for (const s of candidates) {
        for (const move of ROLE_MOVE_SETS[s.role]) {
            if (speciesCanLearn(species, move, gate)) return move;
        }
    }
    return null;
}

// T-133 — the FORWARD (dependent) Choice-item claim. A Choice role EXISTS only if its item exists: if
// `species` fills an offensive role the team wants (a revenge-killer or a wallbreaker — both detectors
// already exclude setup sweepers, so the set can commit to attacking) AND a Choice item is AVAILABLE in the
// bag, return the best-fitting one to claim NOW (so `chooseMoveset`, seeing the Choice item, builds an
// all-attacking set). Returns null when no Choice is available (never forced) or the mon isn't a clean
// attacker. The item is matched to the mon's stats: a revenge killer wants Scarf; a breaker wants Band
// (physical) / Specs (special) — falling back to whatever Choice the bag actually holds. Deterministic,
// soph-gated. (Enhanced items — weather rock, Room Service, Electric Seed — are handled forward by T-125.)
const CHOICE_ITEMS = ['Choice Scarf', 'Choice Band', 'Choice Specs'];
function planForwardChoiceItem({ species, team, model, ctx = {}, sophistication, seed = null, available = [] }) {
    if (!model || !species || (sophistication || 0) < BIAS_MIN_SOPH) return null;
    const inBag = CHOICE_ITEMS.filter(ci => available.includes(ci));
    if (!inBag.length) return null;
    const speciesMons = (team || []).map(m => (m && m.pokemon) ? m.pokemon : m);
    const identity = resolveIdentity(speciesMons, model, ctx, seed);
    if (!identity) return null;
    const structure = combinedStructure(model, identity.baseId, identity.gimmickIds);
    const wants = role => structure.some(s => s.role === role);
    const feats = detectFeatures(species, ctx);
    const scarfer = feats.has('choiceScarfRevengeKiller') && wants('choiceScarfRevengeKiller');
    const breaker = feats.has('wallbreaker') && wants('wallbreaker');
    if (!scarfer && !breaker) return null;
    const physical = (species.baseAttack || 0) >= (species.baseSpAttack || 0);
    const pref = scarfer
        ? ['Choice Scarf', ...(physical ? ['Choice Band', 'Choice Specs'] : ['Choice Specs', 'Choice Band'])]
        : (physical ? ['Choice Band', 'Choice Specs', 'Choice Scarf'] : ['Choice Specs', 'Choice Band', 'Choice Scarf']);
    return pref.find(ci => inBag.includes(ci)) || null;
}

// T-124 — weather subtype ↔ setter/abuser abilities (SSOT: modules/weatherConstants.js, a leaf module so
// the picker/refine/gimmick-plan share them without a require cycle). Identity-aware ability selection:
// when a team crystallises the weather gimmick, the setter mon gets the setter ability and the abusers the
// ability matching the established weather (rain→Swift Swim, sun→Chlorophyll, …).
const {
    WEATHER_SUBTYPE_BY_SETTER, WEATHER_SETTER_ABILITIES, SETTERS_BY_SUBTYPE, WEATHER_ABUSER_BY_SUBTYPE,
} = require('./weatherConstants');
// T-125 — the rock a weather setter holds to extend its weather 5→8 turns (by the setter ability).
const WEATHER_ROCK_BY_SETTER = {
    DROUGHT: 'ITEM_HEAT_ROCK', ORICHALCUM_PULSE: 'ITEM_HEAT_ROCK',
    DRIZZLE: 'ITEM_DAMP_ROCK', SAND_STREAM: 'ITEM_SMOOTH_ROCK', SNOW_WARNING: 'ITEM_ICY_ROCK',
};

// T-124/T-127 (Wattson) — Electric Terrain is a Gen-8+ gimmick not in the Gen 6-7 corpus, added
// MANUALLY for Wattson via a seed flag. It only implies: prefer an electric attack, prefer the terrain
// setter ability, and give a defensive mon the Electric Seed (Def boost in electric terrain). This will
// be generalised into a proper terrain gimmick family by the later-gen corpus work (T-127).
const ELECTRIC_TERRAIN_SETTER = 'ELECTRIC_SURGE';
const ELECTRIC_MOVES = [
    'MOVE_THUNDERBOLT', 'MOVE_DISCHARGE', 'MOVE_VOLT_SWITCH', 'MOVE_THUNDER', 'MOVE_WILD_CHARGE',
    'MOVE_THUNDER_PUNCH', 'MOVE_SPARK',
];

// The ability `species` should PREFER given the crystallised identity, or [] (no preference). For a
// weather-gimmick team: if a prior member already set the weather (subtype known) → the matching abuser
// ability the mon can have; else (no setter yet) → a weather-setter ability the mon can have, to
// establish the weather. `team` = prior resolved members ({ pokemon, ability, moves }). Deterministic,
// soph-gated. Ability-based gimmick roles (unlike move roles) aren't fixed by move injection — the
// ability is chosen separately, so without this a weather-crystallised team never actually gets weather.
function planMemberAbility({ species, team, model, ctx = {}, sophistication, seed = null }) {
    if (!model || !species || (sophistication || 0) < BIAS_MIN_SOPH) return [];
    // T-124 (Wattson) — electric terrain: prefer the Electric Surge setter ability if the mon has it.
    if (seed && seed.electricTerrain && (species.parsedAbilities || []).includes(ELECTRIC_TERRAIN_SETTER)) {
        return [ELECTRIC_TERRAIN_SETTER];
    }
    const speciesMons = (team || []).map(m => (m && m.pokemon) ? m.pokemon : m);
    const identity = resolveIdentity(speciesMons, model, ctx, seed);
    if (!identity || !(identity.gimmickIds || []).includes('weather')) return [];

    const speciesAbil = species.parsedAbilities || [];
    // Subtype: an established setter in the team, else the seed's declared theme (Aqua→rain, Magma→sun).
    let subtype = null;
    for (const m of (team || [])) {
        const ab = m && m.ability;
        if (ab && WEATHER_SUBTYPE_BY_SETTER[ab]) { subtype = WEATHER_SUBTYPE_BY_SETTER[ab]; break; }
    }
    if (!subtype && seed && seed.weather) subtype = seed.weather;

    if (subtype) {
        // No setter for this weather yet → this mon establishes it if it can; else prefer the abuser.
        const hasSetter = (team || []).some(m => m.ability && WEATHER_SUBTYPE_BY_SETTER[m.ability] === subtype);
        if (!hasSetter) {
            // Only the THEMED setter — never a foreign weather's (RC4, T-132). When no themed ABILITY-setter
            // exists in the trainer's pool, the resolver retrofits a themed MOVE-setter instead
            // (gimmickPlan.ensureMoveSetter); it must NOT establish a different weather here.
            const canSet = speciesAbil.filter(a => (SETTERS_BY_SUBTYPE[subtype] || []).includes(a));
            if (canSet.length) return canSet;
        }
        return speciesAbil.filter(a => (WEATHER_ABUSER_BY_SUBTYPE[subtype] || []).includes(a));
    }
    return speciesAbil.filter(a => WEATHER_SETTER_ABILITIES.includes(a)); // generic → establish any weather
}

module.exports = {
    resolvedDetectMon, planMemberRoleMove, planMemberAbility, planForwardChoiceItem, ROLE_MOVE_SETS,
    WEATHER_SUBTYPE_BY_SETTER, SETTERS_BY_SUBTYPE, WEATHER_ABUSER_BY_SUBTYPE, WEATHER_ROCK_BY_SETTER,
    ELECTRIC_MOVES,
};
