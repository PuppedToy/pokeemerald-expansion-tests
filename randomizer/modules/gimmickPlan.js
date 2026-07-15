'use strict';

// T-132 / ADR-017 — a gimmick's SUCCESS CONDITION: a pure predicate over a RESOLVED team that says
// whether the gimmick actually materialised (so the attempt-based resolver commits it) or must be rolled
// back and dropped. This is the single source of truth for "did the gimmick hold", replacing the softer
// setter-only reading in teamAudit. Weather condition + abuser definition come from docs/research/weather.md
// (owner-validated): setter + >= 2 abusers, where an abuser is BROAD — an abuser ability, a weather-synergy
// move, OR a strong attacker of the boosted STAB type. The setter itself may count as an abuser.

const {
    WEATHER_SUBTYPE_BY_SETTER, SETTERS_BY_SUBTYPE, WEATHER_ABUSER_BY_SUBTYPE, BOOSTED_STAB_TYPE, BOOSTED_DEF_TYPE,
    SETTER_MOVE_BY_SUBTYPE, SYNERGY_MOVE_BY_SUBTYPE, WEATHER_REQUIRED_ABUSERS: REQUIRED_ABUSERS,
    EMERGENT_WEATHER_MIN_SOPH, WEATHER_ABUSE_THRESHOLD, WEATHER_STAB_ATK_MIN,
    WEATHER_ABUSE_ABILITY_PTS, WEATHER_ABUSE_STAB_PTS, WEATHER_ABUSE_DEF_PTS, WEATHER_ABUSE_SYNERGY_PTS,
    SPEED_MULT_ABILITY, WX_ABUSE_RATING,
} = require('./weatherConstants');

// Longevity/utility weather abilities per subtype (valued modestly — staying power, not raw offence).
const WEATHER_DEFUTIL_ABILITY = { rain: ['HYDRATION', 'RAIN_DISH', 'DRY_SKIN'], snow: ['ICE_BODY'], sun: [], sand: [] };

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

// weatherAbuseScore(mon, subtype) — the SINGLE, subtype-specific weather-abuse score (owner-designed,
// T-132; components + thresholds in weatherConstants). Used identically by the picker, the success
// condition and the decision-log labels. POTENTIAL-based: it reads the mon's typing / ability / attacking
// stats / movepool, NOT its exact chosen moveset, so a Water-type on rain counts by nature even if its 4
// moves didn't happen to include a Water STAB (that was the old fragility). `mon` may be a RESOLVED member
// ({ pokemon, ability, moves }) — then the ASSIGNED ability is what's scored — or a raw candidate species
// (parsedAbilities pool). A mon scores 0 for a weather it doesn't fit (a Swift Swimmer scores 0 in sun).
function weatherAbuseScore(mon, subtype) {
    const poke = (mon && mon.pokemon) || mon || {};
    const types = poke.parsedTypes || [];
    // Relevant abilities: a resolved member's ASSIGNED ability, else the candidate species' ability pool.
    const abilities = (mon && mon.ability)
        ? [String(mon.ability).toUpperCase()]
        : (poke.parsedAbilities || []).map(a => String(a).toUpperCase());
    const atk = Math.max(poke.baseAttack || 0, poke.baseSpAttack || 0);
    const synergy = SYNERGY_MOVE_BY_SUBTYPE[subtype] || [];
    const canSynergy = (poke.learnset || []).some(l => synergy.includes(l.move))
        || (poke.teachables || []).some(t => synergy.includes(t))
        || ((mon && mon.moves) || []).some(mv => synergy.includes(mv));

    let score = 0;
    if (abilities.some(a => (WEATHER_ABUSER_BY_SUBTYPE[subtype] || []).includes(a))) score += WEATHER_ABUSE_ABILITY_PTS;
    const boostedStab = BOOSTED_STAB_TYPE[subtype];      // rain→Water, sun→Fire (offensive)
    if (boostedStab && types.includes(boostedStab) && atk >= WEATHER_STAB_ATK_MIN) score += WEATHER_ABUSE_STAB_PTS;
    const boostedDef = BOOSTED_DEF_TYPE[subtype];         // sand→Rock, snow→Ice (defensive)
    if (boostedDef && types.includes(boostedDef)) score += WEATHER_ABUSE_DEF_PTS;
    if (canSynergy) score += WEATHER_ABUSE_SYNERGY_PTS;
    return score;
}

// A member is an ABUSER of `subtype` when its weather-abuse score reaches the threshold. (`moves` is kept
// for signature compatibility with older callers but is no longer needed — the score is potential-based.)
function isWeatherAbuser(m, subtype, moves = null) { // eslint-disable-line no-unused-vars
    return weatherAbuseScore(m, subtype) >= WEATHER_ABUSE_THRESHOLD;
}

// weatherAbuseRating(mon, subtype) — the DETAILED, weather-conditional rating used to RANK eligible abusers
// for picking (owner "Path 1", T-135). Unlike the coarse eligibility SCORE, this models HOW WELL a mon
// exploits the active weather, each ability weighted by the stat it actually scales:
//   • speed-doubling ability (Chlorophyll/Swift Swim/Sand Rush/Slush Rush) → scales with OFFENSIVE power
//     (a speed multiplier is scariest on a strong attacker);
//   • Solar Power → scales with SPEED (hit before the HP chip bites) × SpA;
//   • Protosynthesis → scales with the mon's BEST stat (it boosts the highest one);
//   • Sand Force → move-power boost, scales with offence;
//   • boosted-STAB type (rain Water / sun Fire) → STAB'd, weather-boosted attacks, scales with offence;
//   • boosted-DEF type (sand Rock / snow Ice) → tanks the weather (defensive bulk);
//   • a synergy move it can field (Solar Beam/Blade, Blizzard, Weather Ball…), + extra when that move is
//     also STAB (a Grass mon's Solar Beam in sun);
//   • plus a weighted slice of the mon's base offensive rating (a good abuser is still a good mon).
// Weights live in weatherConstants.WX_ABUSE_RATING (all tunable). A mon that doesn't fit the weather rates
// only on its base (a Swift Swimmer in sun == a plain mon).
// weatherAbuseBreakdown(mon, subtype) → { total, parts:[{k,v}] } — the ITEMISED rating, for auditability
// (T-135, owner): the decision log shows what each thing contributes, so we can see WHY an abuser ranked
// where it did. `weatherAbuseRating` is just its `.total`.
// T-109 — a gimmick abuser's base-quality contribution to its ranking: the DOUBLES rating for a doubles
// trainer, the singles rating otherwise. So a doubles weather/TR/terrain team ranks its abusers by how
// good they are IN DOUBLES (default false → singles ranking unchanged, byte-identical).
const monBaseRating = (poke, doubles) => (doubles && typeof poke.ratingDoubles === 'number')
    ? poke.ratingDoubles
    : ((poke.rating && poke.rating.absoluteRating) || 0);

function weatherAbuseBreakdown(mon, subtype, doubles = false) {
    const poke = (mon && mon.pokemon) || mon || {};
    const types = poke.parsedTypes || [];
    const abilities = (mon && mon.ability)
        ? [String(mon.ability).toUpperCase()]
        : (poke.parsedAbilities || []).map(a => String(a).toUpperCase());
    const has = a => a && abilities.includes(a);
    const atk = poke.baseAttack || 0, spa = poke.baseSpAttack || 0, spe = poke.baseSpeed || 0;
    const off = Math.max(atk, spa) / 100;
    const bestStat = Math.max(atk, spa, spe, poke.baseDefense || 0, poke.baseSpDefense || 0, poke.baseHP || 0) / 100;
    const W = WX_ABUSE_RATING;

    const parts = [];
    const add = (k, v) => { if (v) parts.push({ k, v: Math.round(v * 100) / 100 }); };

    add('base', W.base * monBaseRating(poke, doubles));
    // Offensive weather ability, scaled by the stat it exploits + a flat floor so a real ability-abuser
    // outranks a plain boosted-STAB type attacker of similar power (owner: prefer the ability).
    let hasOffensiveAbility = false;
    if (has(SPEED_MULT_ABILITY[subtype])) { add(SPEED_MULT_ABILITY[subtype], W.speedMult * off); hasOffensiveAbility = true; }
    if (subtype === 'sun') {
        if (has('SOLAR_POWER')) { add('SOLAR_POWER', W.solarPower * (spe / 100) * (spa / 100)); hasOffensiveAbility = true; }
        if (has('PROTOSYNTHESIS')) { add('PROTOSYNTHESIS', W.proto * bestStat); hasOffensiveAbility = true; }
    }
    if (subtype === 'sand' && has('SAND_FORCE')) { add('SAND_FORCE', W.powerAbility * off); hasOffensiveAbility = true; }
    if (hasOffensiveAbility) add('ability-floor', W.abilityFloor);
    if ((WEATHER_DEFUTIL_ABILITY[subtype] || []).some(has)) add('longevity', W.defUtil);
    const stabType = BOOSTED_STAB_TYPE[subtype];
    if (stabType && types.includes(stabType)) add(`${stabType}-STAB`, W.stab * off);
    const defType = BOOSTED_DEF_TYPE[subtype];
    if (defType && types.includes(defType)) add(`${defType}-bulk`, W.def * ((poke.baseDefense || 0) + (poke.baseSpDefense || 0) + (poke.baseHP || 0)) / 300);
    const synergy = SYNERGY_MOVE_BY_SUBTYPE[subtype] || [];
    const canSyn = (poke.learnset || []).some(l => synergy.includes(l.move))
        || (poke.teachables || []).some(t => synergy.includes(t))
        || ((mon && mon.moves) || []).some(mv => synergy.includes(mv));
    if (canSyn) {
        add('synergy-move', W.synergy);
        if (subtype === 'sun' && types.includes('GRASS')) add('solar-STAB', W.synergyStab);
    }
    const total = parts.reduce((s, p) => s + p.v, 0);
    return { total: Math.round(total * 100) / 100, parts };
}

function weatherAbuseRating(mon, subtype, doubles = false) { return weatherAbuseBreakdown(mon, subtype, doubles).total; }

// RC1 (T-132, owner-approved) — MOVE-SETTER retrofit for villains. A weather team FAILS without a setter,
// but with `mutateAbilities` the setter ABILITIES (Sand Stream, Drizzle, …) are scattered randomly across
// the dex, so a type-restricted villain often has none in its pool — even when it has plenty of abusers.
// The owner explicitly allows a SUBOPTIMAL move-setter here: if the built team has no setter, give one of
// its members the subtype's setter MOVE (Sandstorm / Rain Dance / Sunny Day / Hail-Snowscape). Prefer a
// NON-abuser carrier so the abuser count is preserved. Mutates `team` in place; returns true if it injected
// (or a setter was already present is handled by the no-op guard → returns false). The weather-setting
// moves are among the earliest TMs, so this stays within the spirit of B-030 (no late-TM leakage).
function ensureMoveSetter(team, subtype) {
    const members = (team || []).map(asMember);
    if (members.some(m => isWeatherSetter(m, subtype))) return false; // already has a setter (ability or move)
    const setterMoves = SETTER_MOVE_BY_SUBTYPE[subtype] || [];
    if (!setterMoves.length) return false;
    const learnableMove = m => {
        const poke = m.pokemon || {};
        const ls = (poke.learnset || []).map(l => l.move);
        const tc = poke.teachables || [];
        return setterMoves.find(mv => ls.includes(mv) || tc.includes(mv)) || null;
    };
    // Prefer a NON-abuser carrier (so we don't spend an abuser's slot on the setter move); else any learner.
    const target = members.find(m => learnableMove(m) && weatherAbuseScore(m, subtype) < WEATHER_ABUSE_THRESHOLD)
        || members.find(m => learnableMove(m));
    if (!target) return false;
    const move = learnableMove(target);
    const moves = target.moves || (target.moves = []);
    if (!moves.includes(move)) {
        if (moves.length >= 4) moves[moves.length - 1] = move; else moves.push(move);
    }
    return true;
}

// The weather subtype a RESOLVED team actually establishes (its setter's ability, else a setter move), or
// null. Used to tell a tag partner (Tabitha) what weather its ally (Maxie) put up, so it can abuse it.
function teamWeather(team) {
    for (const m of (team || []).map(asMember)) {
        const ab = setterSubtype(m);
        if (ab) return ab;
        for (const sub of Object.keys(SETTER_MOVE_BY_SUBTYPE)) {
            if (memberMoves(m).some(mv => SETTER_MOVE_BY_SUBTYPE[sub].includes(mv))) return sub;
        }
    }
    return null;
}

// T-136 — should a NON-DEDICATED team opportunistically build weather? Returns the subtype to ATTEMPT
// (setter + 2 abusers) or null. Fires only when the trainer has NO weather intent of its own (not weather-
// seeded/committed, not a tag abuse-partner), is sophisticated enough (≥ EMERGENT_WEATHER_MIN_SOPH), and its
// committed plain build actually FIELDED a natural setter (ability or move). Pure — the resolver runs the
// build + hold/drop from the returned subtype.
function emergentWeatherSubtype({ committedSeed = null, abusePartner = false, soph = 0, team = [] } = {}) {
    if (committedSeed && (committedSeed.gimmicks || []).includes('weather')) return null;
    if (abusePartner) return null;
    if (!(soph >= EMERGENT_WEATHER_MIN_SOPH)) return null;
    return teamWeather(team);
}

// T-137 — generalization of T-136 to ALL setter+abusers gimmicks. Returns { gimmick, weather?, roomStyle? }
// the non-dedicated team should opportunistically build, or null. Priority: weather → electric terrain →
// trick room. Weather/electric fire when a natural SETTER was rolled (an ability the pool happened to hand
// out); trick room fires when a slow-strong CORE emerged (≥2 abusers) and a member can set the room (TR's
// "setter" is a move, not a rolled ability) — it goes HALF room (splashed onto an otherwise normal team).
function emergentGimmick({ committedSeed = null, abusePartner = false, soph = 0, team = [] } = {}) {
    if (committedSeed && (committedSeed.gimmicks || []).length) return null;
    if (abusePartner) return null;
    if (!(soph >= EMERGENT_WEATHER_MIN_SOPH)) return null;
    const members = (team || []).map(asMember);
    const w = teamWeather(team);
    if (w) return { gimmick: 'weather', weather: w };
    if (members.some(isElectricTerrainSetter)) return { gimmick: 'electric_terrain' };
    const slowCore = members.filter(m => trickRoomAbuseScore(m) >= WEATHER_ABUSE_THRESHOLD).length;
    if (slowCore >= REQUIRED_ABUSERS && members.some(m => monCanLearn(m, [TR_SETTER_MOVE]))) {
        return { gimmick: 'trick_room', roomStyle: 'half' };
    }
    return null;
}

// Does the weather gimmick hold for this resolved team? subtype = the intended weather (from the seed) or,
// if omitted, inferred from whatever setter the team actually fields. ctx.moves = the moves DB (optional).
// ctx.abuseOnly (T-132) = a tag partner abusing an ALLY's weather (Tabitha under Maxie's sun): it needs no
// setter of its own — just ≥2 abusers of the given subtype.
function weatherHolds(team, ctx = {}, subtype = null) {
    const members = (team || []).map(asMember);
    const sub = subtype || members.map(setterSubtype).find(Boolean);
    if (!sub) return false;
    if (!ctx.abuseOnly && !members.some(m => isWeatherSetter(m, sub))) return false;
    const abusers = members.filter(m => isWeatherAbuser(m, sub, ctx.moves || null)).length;
    return abusers >= REQUIRED_ABUSERS;
}

// ── T-137: ELECTRIC TERRAIN gimmick (docs/research/electric-terrain.md) ───────────────────────────────
// Same shape as weather (setter + 2 abusers). Modern pieces (Surge Surfer / Quark Drive / Hadron Engine)
// are included though absent from the Gen 6-7 corpus — this game has them (owner-validated).
const ELEC_SETTER_ABILITIES = ['ELECTRIC_SURGE', 'HADRON_ENGINE'];
const ELEC_SETTER_MOVE = 'MOVE_ELECTRIC_TERRAIN';
const ELEC_ABUSER_ABILITIES = ['SURGE_SURFER', 'QUARK_DRIVE', 'UNBURDEN'];
const ELEC_SYNERGY_MOVES = ['MOVE_RISING_VOLTAGE', 'MOVE_TERRAIN_PULSE'];

function isElectricTerrainSetter(m) {
    const mm = asMember(m);
    return ELEC_SETTER_ABILITIES.includes(memberAbility(mm)) || memberMoves(mm).includes(ELEC_SETTER_MOVE);
}
const monPoke = mon => (mon && mon.pokemon) || mon || {};
const monAbilities = mon => (mon && mon.ability)
    ? [String(mon.ability).toUpperCase()]
    : (monPoke(mon).parsedAbilities || []).map(a => String(a).toUpperCase());
const monCanLearn = (mon, list) => {
    const poke = monPoke(mon);
    return (poke.learnset || []).some(l => list.includes(l.move))
        || (poke.teachables || []).some(t => list.includes(t))
        || ((mon && mon.moves) || []).some(mv => list.includes(mv));
};
// Score (potential-based, threshold ≥2): +3 abuser ability, +2 Electric-type with a decent attacking stat
// (grounded STAB ×1.3 / Rising Voltage), +1 synergy move.
function electricTerrainAbuseScore(mon) {
    const poke = monPoke(mon);
    const atk = Math.max(poke.baseAttack || 0, poke.baseSpAttack || 0);
    let s = 0;
    if (monAbilities(mon).some(a => ELEC_ABUSER_ABILITIES.includes(a))) s += WEATHER_ABUSE_ABILITY_PTS;
    if ((poke.parsedTypes || []).includes('ELECTRIC') && atk >= WEATHER_STAB_ATK_MIN) s += WEATHER_ABUSE_STAB_PTS;
    if (monCanLearn(mon, ELEC_SYNERGY_MOVES)) s += WEATHER_ABUSE_SYNERGY_PTS;
    return s;
}
function electricTerrainBreakdown(mon, doubles = false) {
    const poke = monPoke(mon);
    const abil = monAbilities(mon);
    const off = Math.max(poke.baseAttack || 0, poke.baseSpAttack || 0) / 100;
    const bestStat = Math.max(poke.baseAttack || 0, poke.baseSpAttack || 0, poke.baseSpeed || 0,
        poke.baseDefense || 0, poke.baseSpDefense || 0, poke.baseHP || 0) / 100;
    const W = WX_ABUSE_RATING;
    const parts = [];
    const add = (k, v) => { if (v) parts.push({ k, v: Math.round(v * 100) / 100 }); };
    add('base', W.base * monBaseRating(poke, doubles));
    let hasAbil = false;
    if (abil.includes('SURGE_SURFER')) { add('SURGE_SURFER', W.speedMult * off); hasAbil = true; }
    if (abil.includes('QUARK_DRIVE')) { add('QUARK_DRIVE', W.proto * bestStat); hasAbil = true; }
    if (abil.includes('UNBURDEN')) { add('UNBURDEN', W.speedMult * off); hasAbil = true; }
    if (hasAbil) add('ability-floor', W.abilityFloor);
    if ((poke.parsedTypes || []).includes('ELECTRIC')) add('ELECTRIC-STAB', W.stab * off);
    if (monCanLearn(mon, ELEC_SYNERGY_MOVES)) add('synergy-move', W.synergy);
    return { total: Math.round(parts.reduce((s, p) => s + p.v, 0) * 100) / 100, parts };
}
function electricTerrainHolds(team, ctx = {}) {
    const members = (team || []).map(asMember);
    if (!ctx.abuseOnly && !members.some(isElectricTerrainSetter)) return false;
    return members.filter(m => electricTerrainAbuseScore(m) >= WEATHER_ABUSE_THRESHOLD).length >= REQUIRED_ABUSERS;
}
// Move-setter retrofit (like weather's): if no ability-setter, inject the Electric Terrain move on a
// non-abuser learner so the setter+abusers condition can hold.
function ensureElectricTerrainSetter(team) {
    const members = (team || []).map(asMember);
    if (members.some(isElectricTerrainSetter)) return false;
    const canLearn = m => monCanLearn(m, [ELEC_SETTER_MOVE]);
    const target = members.find(m => canLearn(m) && electricTerrainAbuseScore(m) < WEATHER_ABUSE_THRESHOLD)
        || members.find(canLearn);
    if (!target) return false;
    const moves = target.moves || (target.moves = []);
    if (!moves.includes(ELEC_SETTER_MOVE)) { if (moves.length >= 4) moves[moves.length - 1] = ELEC_SETTER_MOVE; else moves.push(ELEC_SETTER_MOVE); }
    return true;
}

// ── T-137: TRICK ROOM gimmick (docs/research/trick-room.md) ───────────────────────────────────────────
// Setter = the MOVE Trick Room on a survival body (no ability sets TR). Abuser = slow + strong.
const TR_SETTER_MOVE = 'MOVE_TRICK_ROOM';
const TR_ABUSE_SPEED_MAX = 55;   // base Speed at/below which a mon moves first under TR = a TR abuser
const TR_STRONG_OFFENSE = 100;   // offence at which a slow mon is an IDEAL abuser (ranking, not eligibility)
const TR_GYRO_BALL = 'MOVE_GYRO_BALL';
const ROOM_SERVICE_ITEM = 'Room Service';

function isTrickRoomSetter(m) { return memberMoves(asMember(m)).includes(TR_SETTER_MOVE); }
// Score (threshold ≥2): +3 SLOW (any slow mon moves first under TR — owner-validated: offence is a RANKING
// factor, not an eligibility gate, so slow-bulky Psychics count and a Psychic room can actually assemble),
// +1 Gyro Ball, +1 Room Service.
function trickRoomAbuseScore(mon) {
    const poke = monPoke(mon);
    const spe = poke.baseSpeed == null ? 999 : poke.baseSpeed;
    let s = 0;
    if (spe <= TR_ABUSE_SPEED_MAX) s += WEATHER_ABUSE_ABILITY_PTS;
    if (monCanLearn(mon, [TR_GYRO_BALL])) s += WEATHER_ABUSE_SYNERGY_PTS;
    if ((mon && mon.item) === ROOM_SERVICE_ITEM) s += WEATHER_ABUSE_SYNERGY_PTS;
    return s;
}
function trickRoomBreakdown(mon, doubles = false) {
    const poke = monPoke(mon);
    const spe = poke.baseSpeed == null ? 999 : poke.baseSpeed;
    const off = Math.max(poke.baseAttack || 0, poke.baseSpAttack || 0) / 100;
    const W = WX_ABUSE_RATING;
    const parts = [];
    const add = (k, v) => { if (v) parts.push({ k, v: Math.round(v * 100) / 100 }); };
    add('base', W.base * monBaseRating(poke, doubles));
    // Any slow mon abuses TR; offence + slowness scale the payoff so a slow WALLBREAKER ranks above a
    // slow wall (the ranking prefers slow-STRONG, but slow-weak is still eligible).
    if (spe <= TR_ABUSE_SPEED_MAX) {
        add('slow', W.speedMult * (0.5 + off) * (1 + (TR_ABUSE_SPEED_MAX - spe) / 100));
        add('ability-floor', W.abilityFloor);
    }
    if (monCanLearn(mon, [TR_GYRO_BALL])) add('gyro-ball', W.synergy);
    if ((mon && mon.item) === ROOM_SERVICE_ITEM) add('room-service', W.synergy);
    return { total: Math.round(parts.reduce((s, p) => s + p.v, 0) * 100) / 100, parts };
}
// T-138 — a FULL room (ctx.roomStyle==='full', e.g. Tate & Liza) requires 2 setters (6v6 redundancy) + 4
// slow abusers; a HALF / default room is 1 setter + 2 abusers.
const TR_FULL_SETTERS = 2;
const TR_FULL_ABUSERS = 4;
function trickRoomHolds(team, ctx = {}) {
    const members = (team || []).map(asMember);
    const setters = members.filter(isTrickRoomSetter).length;
    const abusers = members.filter(m => trickRoomAbuseScore(m) >= WEATHER_ABUSE_THRESHOLD).length;
    if (ctx.roomStyle === 'full') return setters >= TR_FULL_SETTERS && abusers >= TR_FULL_ABUSERS;
    if (!ctx.abuseOnly && setters < 1) return false;
    return abusers >= REQUIRED_ABUSERS;
}
// Inject the Trick Room move until the team has `count` setters (retrofit; no ability sets TR). Prefers
// non-abuser (bulky) learners for the first setter, then any learner. Returns true if it injected any.
function ensureTrickRoomSetter(team, count = 1) {
    const members = (team || []).map(asMember);
    let have = members.filter(isTrickRoomSetter).length;
    let injected = false;
    while (have < count) {
        const canLearn = m => !isTrickRoomSetter(m) && monCanLearn(m, [TR_SETTER_MOVE]);
        const target = members.find(m => canLearn(m) && trickRoomAbuseScore(m) < WEATHER_ABUSE_THRESHOLD)
            || members.find(canLearn);
        if (!target) break;
        const moves = target.moves || (target.moves = []);
        if (moves.length >= 4) moves[moves.length - 1] = TR_SETTER_MOVE; else moves.push(TR_SETTER_MOVE);
        have++; injected = true;
    }
    return injected;
}

// A tiny per-gimmick spec so the picker + audit can treat weather / electric_terrain / trick_room uniformly.
// weather is subtype-driven (handled by its own block); these two are single-subtype.
const GIMMICK_SPEC = {
    electric_terrain: { isSetter: isElectricTerrainSetter, setterAbilities: ELEC_SETTER_ABILITIES, score: electricTerrainAbuseScore, breakdown: electricTerrainBreakdown, ensureSetter: ensureElectricTerrainSetter, label: 'electric-terrain' },
    // Trick Room has NO ability-setter (the setter is the MOVE) → setterAbilities empty; the picker ranks
    // slow-strong abusers and `ensureTrickRoomSetter` retrofits the move afterwards.
    trick_room: { isSetter: isTrickRoomSetter, setterAbilities: [], score: trickRoomAbuseScore, breakdown: trickRoomBreakdown, ensureSetter: ensureTrickRoomSetter, label: 'trick-room' },
};

// Generic entry: does `gimmickId` hold for the resolved team? Unknown gimmicks are treated as holding
// (no condition to fail). screens/trapping keep the setter-presence condition for now.
const GIMMICK_SETTER_ROLE_MOVE = {
    screens: ['MOVE_LIGHT_SCREEN', 'MOVE_REFLECT', 'MOVE_AURORA_VEIL'],
};
function gimmickHolds(gimmickId, team, ctx = {}, subtype = null) {
    if (gimmickId === 'weather') return weatherHolds(team, ctx, subtype);
    if (gimmickId === 'electric_terrain') return electricTerrainHolds(team, ctx);
    if (gimmickId === 'trick_room') return trickRoomHolds(team, ctx);
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
    delete dropped.abuseOnly;
    if (gimmicks.includes('weather')) {
        // T-132 — abuse-only (a tag partner following its ally's weather): don't try OTHER weathers, only
        // the ally's — [abuse that weather, else a normal team]. It has no setter to swap.
        if (seed.abuseOnly) return [seed, dropped];
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
    gimmickHolds, weatherHolds, isWeatherSetter, isWeatherAbuser, weatherAbuseScore, weatherAbuseRating,
    weatherAbuseBreakdown, ensureMoveSetter, setterSubtype, teamWeather, emergentWeatherSubtype, emergentGimmick, gimmickFallbackChain,
    SETTER_MOVE_BY_SUBTYPE, SYNERGY_MOVE_BY_SUBTYPE, BOOSTED_STAB_TYPE, REQUIRED_ABUSERS,
    // T-137 — electric terrain + trick room gimmicks
    isElectricTerrainSetter, electricTerrainAbuseScore, electricTerrainBreakdown, electricTerrainHolds, ensureElectricTerrainSetter,
    isTrickRoomSetter, trickRoomAbuseScore, trickRoomBreakdown, trickRoomHolds, ensureTrickRoomSetter,
    GIMMICK_SPEC,
};
