'use strict';

// T-132 / ADR-017 — a gimmick's SUCCESS CONDITION: a pure predicate over a RESOLVED team that says
// whether the gimmick actually materialised (so the attempt-based resolver commits it) or must be rolled
// back and dropped. This is the single source of truth for "did the gimmick hold", replacing the softer
// setter-only reading in teamAudit. Weather condition + abuser definition come from docs/research/weather.md
// (owner-validated): setter + >= 2 abusers, where an abuser is BROAD — an abuser ability, a weather-synergy
// move, OR a strong attacker of the boosted STAB type. The setter itself may count as an abuser.

const { WEATHER_SUBTYPE_BY_SETTER, SETTERS_BY_SUBTYPE, WEATHER_ABUSER_BY_SUBTYPE } = require('./archetypeRefine');

// Move-based setters, per subtype (the suboptimal "force" path — an ability setter is preferred).
const SETTER_MOVE_BY_SUBTYPE = {
    sun: ['MOVE_SUNNY_DAY'], rain: ['MOVE_RAIN_DANCE'], sand: ['MOVE_SANDSTORM'],
    snow: ['MOVE_SNOWSCAPE', 'MOVE_CHILLY_RECEPTION', 'MOVE_HAIL'],
};
// Weather-synergy moves (pseudo-STAB / perfect-accuracy / veil), per subtype — corpus-derived.
const SYNERGY_MOVE_BY_SUBTYPE = {
    rain: ['MOVE_THUNDER', 'MOVE_HURRICANE', 'MOVE_WEATHER_BALL', 'MOVE_ELECTRO_SHOT'],
    sun: ['MOVE_SOLAR_BEAM', 'MOVE_SOLAR_BLADE', 'MOVE_GROWTH', 'MOVE_WEATHER_BALL'],
    sand: ['MOVE_WEATHER_BALL'],
    snow: ['MOVE_BLIZZARD', 'MOVE_AURORA_VEIL', 'MOVE_WEATHER_BALL'],
};
// The offensive STAB type each weather boosts x1.5 (rain/sun only). A strong attacker of this type is an
// abuser even without a weather ability/move (the ~30% support-weather teams in the corpus work this way).
const BOOSTED_STAB_TYPE = { rain: 'WATER', sun: 'FIRE' };

const REQUIRED_ABUSERS = 2;

const asMember = m => (m && m.pokemon) ? m : { pokemon: m, ability: null, moves: [] };
const memberAbility = m => (m.ability || '').toUpperCase();
const memberMoves = m => m.moves || [];
const memberTypes = m => ((m.pokemon && m.pokemon.parsedTypes) || []);

// The weather subtype a member SETS (by its resolved ability), or null.
function setterSubtype(m) {
    return WEATHER_SUBTYPE_BY_SETTER[memberAbility(m)] || null;
}

// Is this member a setter of `subtype` (ability = optimal, else a setter move = the "force" path)?
function isWeatherSetter(m, subtype) {
    if ((SETTERS_BY_SUBTYPE[subtype] || []).includes(memberAbility(m))) return true;
    return memberMoves(m).some(mv => (SETTER_MOVE_BY_SUBTYPE[subtype] || []).includes(mv));
}

// Is this member an abuser of `subtype` (broad: ability | synergy move | boosted-STAB attacker)?
// `moves` is the moves DB (id → { type, category, power }) for the boosted-STAB check; optional.
function isWeatherAbuser(m, subtype, moves = null) {
    if ((WEATHER_ABUSER_BY_SUBTYPE[subtype] || []).includes(memberAbility(m))) return true;
    if (memberMoves(m).some(mv => (SYNERGY_MOVE_BY_SUBTYPE[subtype] || []).includes(mv))) return true;
    const boosted = BOOSTED_STAB_TYPE[subtype];
    if (boosted) {
        // a strong attacking move of the boosted type — via the moves DB if given, else the mon's typing.
        if (moves) {
            return memberMoves(m).some(id => {
                const mv = moves[id];
                return mv && mv.type === boosted && mv.category !== 'DAMAGE_CATEGORY_STATUS' && (mv.power || 0) >= 60;
            });
        }
        return memberTypes(m).includes(boosted);
    }
    return false;
}

// Does the weather gimmick hold for this resolved team? subtype = the intended weather (from the seed) or,
// if omitted, inferred from whatever setter the team actually fields. ctx.moves = the moves DB (optional).
function weatherHolds(team, ctx = {}, subtype = null) {
    const members = (team || []).map(asMember);
    const sub = subtype || members.map(setterSubtype).find(Boolean);
    if (!sub) return false;
    if (!members.some(m => isWeatherSetter(m, sub))) return false;
    const abusers = members.filter(m => isWeatherAbuser(m, sub, ctx.moves || null)).length;
    return abusers >= REQUIRED_ABUSERS;
}

// Generic entry: does `gimmickId` hold for the resolved team? Unknown gimmicks are treated as holding
// (no condition to fail). trick_room / screens / trapping get a setter-presence condition for now
// (their fuller abuser conditions can tighten later, mirroring weather).
const GIMMICK_SETTER_ROLE_MOVE = {
    trick_room: 'MOVE_TRICK_ROOM',
    screens: ['MOVE_LIGHT_SCREEN', 'MOVE_REFLECT', 'MOVE_AURORA_VEIL'],
};
function gimmickHolds(gimmickId, team, ctx = {}, subtype = null) {
    if (gimmickId === 'weather') return weatherHolds(team, ctx, subtype);
    const setterMoves = GIMMICK_SETTER_ROLE_MOVE[gimmickId];
    if (setterMoves) {
        const want = Array.isArray(setterMoves) ? setterMoves : [setterMoves];
        return (team || []).map(asMember).some(m => memberMoves(m).some(mv => want.includes(mv)));
    }
    return true; // unknown gimmick → no condition
}

const ALL_WEATHERS = ['sun', 'rain', 'sand', 'snow'];

// djb2 — a tiny deterministic string hash, so the "other weathers" fallback order is stable per trainer
// (no RNG consumption, which would disturb the per-slot reseed the resolver relies on).
function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
    return h >>> 0;
}

// The ordered list of SEED VARIANTS the resolver should ATTEMPT for a trainer (ADR-017). Each attempt is
// validated by gimmickHolds; the first that holds is committed. Non-gimmick seeds → a single attempt
// (unchanged behaviour). A weather gimmick → [themed weather, the other weathers in a stable per-trainer
// order, then the tag dropped]. Any other gimmick → [gimmick, dropped]. "Dropped" keeps the base identity
// but removes the gimmick so the final attempt always commits a normal team.
function gimmickFallbackChain(seed, trainerId = '') {
    if (!seed) return [null];
    const gimmicks = seed.gimmicks || [];
    if (!gimmicks.length) return [seed];
    const dropped = { ...seed, gimmicks: gimmicks.filter(g => g !== 'weather' && g !== gimmicks[0]) };
    delete dropped.weather;
    if (gimmicks.includes('weather')) {
        const themed = seed.weather || null;
        const others = ALL_WEATHERS.filter(w => w !== themed)
            .sort((a, b) => hashStr(trainerId + a) - hashStr(trainerId + b));
        const order = themed ? [themed, ...others] : ALL_WEATHERS.slice();
        const variants = order.map(w => ({ ...seed, weather: w }));
        return [...variants, dropped];
    }
    return [seed, dropped];
}

module.exports = {
    gimmickHolds, weatherHolds, isWeatherSetter, isWeatherAbuser, setterSubtype, gimmickFallbackChain,
    SETTER_MOVE_BY_SUBTYPE, SYNERGY_MOVE_BY_SUBTYPE, BOOSTED_STAB_TYPE, REQUIRED_ABUSERS,
};
