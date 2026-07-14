'use strict';

// T-132 / ADR-017 — gimmick success conditions (the SSOT for "did the gimmick materialise"). Weather =
// setter + >= 2 abusers, with the BROAD abuser definition from docs/research/weather.md.

const { gimmickHolds, weatherHolds, gimmickFallbackChain, weatherAbuseScore } = require('../../modules/gimmickPlan');
const { WEATHER_ABUSE_THRESHOLD } = require('../../modules/weatherConstants');

// A resolved member: { pokemon: { parsedTypes, baseAttack, baseSpAttack, learnset, teachables }, ability, moves }.
const mem = (ability, moves = [], types = ['NORMAL'], extra = {}) =>
    ({ pokemon: { parsedTypes: types, baseAttack: 100, baseSpAttack: 100, learnset: [], teachables: [], ...extra }, ability, moves });

describe('gimmickPlan — weather success condition', () => {
    test('rain: setter + 2 abuser abilities holds', () => {
        const team = [mem('DRIZZLE'), mem('SWIFT_SWIM'), mem('SWIFT_SWIM')];
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
    });

    test('setter but only ONE abuser fails', () => {
        const team = [mem('DRIZZLE'), mem('SWIFT_SWIM'), mem('GUTS')];
        expect(weatherHolds(team, {}, 'rain')).toBe(false);
    });

    test('no setter fails even with abusers', () => {
        expect(weatherHolds([mem('SWIFT_SWIM'), mem('SWIFT_SWIM')], {}, 'rain')).toBe(false);
    });

    test('the setter counts as an abuser via boosted STAB (Kyogre: Drizzle + Water)', () => {
        const team = [mem('DRIZZLE', [], ['WATER']), mem('SWIFT_SWIM')]; // setter-abuser + 1 abuser = 2
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
    });

    // T-132 — spec change (owner-approved score+threshold): a boosted-STAB abuser is now TYPE-based (a
    // decent-attacking Water/Fire mon), NOT "carries a boosted-type move". So the mon's typing decides it,
    // not its exact moveset (this removed the old fragility where a Water-type without a Water move failed).
    test('a boosted-STAB TYPE attacker counts as an abuser; an off-type mon with a boosted move does not', () => {
        const team = [mem('DRIZZLE', [], ['WATER']), mem('TORRENT', [], ['WATER'])]; // setter-abuser + Water attacker
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
        // a Ghost mon carrying Surf is NOT a rain abuser — only the boosted TYPE counts now
        const offType = [mem('DRIZZLE', [], ['WATER']), mem('LEVITATE', ['MOVE_SURF'], ['GHOST'])];
        expect(weatherHolds(offType, {}, 'rain')).toBe(false); // setter-abuser(1) + Ghost(0) → 1
    });

    // T-132 — spec change: a synergy move alone scores only +1 (< threshold), so it is NOT sufficient by
    // itself; it tips a mon that also has a boosted type / ability over the line.
    test('a synergy move alone is not enough (rain + Thunder on a pure Electric)', () => {
        const solo = [mem('DRIZZLE', [], ['WATER']), mem('STATIC', ['MOVE_THUNDER'], ['ELECTRIC'])];
        expect(weatherHolds(solo, {}, 'rain')).toBe(false); // setter-abuser(1) + Electric+Thunder(+1<2) → 1
        // but Thunder on a Water-type stacks (+2 type, +1 synergy) and clearly holds
        const stacked = [mem('DRIZZLE', [], ['WATER']), mem('TORRENT', ['MOVE_THUNDER'], ['WATER'])];
        expect(weatherHolds(stacked, {}, 'rain')).toBe(true);
    });

    test('a move-setter (Rain Dance) satisfies the setter requirement (force path)', () => {
        const team = [mem('DROUGHT_UNRELATED', ['MOVE_RAIN_DANCE'], ['WATER']), mem('SWIFT_SWIM')];
        expect(weatherHolds(team, {}, 'rain')).toBe(true);
    });

    test('subtype is inferred from the actual setter when not given', () => {
        // A sun team: Drought setter + Chlorophyll abuser + a Fire attacker (boosted STAB).
        const team = [mem('DROUGHT', [], ['FIRE']), mem('CHLOROPHYLL'), mem('BLAZE', [], ['FIRE'])];
        expect(weatherHolds(team, {})).toBe(true); // subtype inferred = sun
    });

    // T-132 — owner-approved defensive-abuser extension: sand/snow have no boosted STAB and no usable move
    // path in this game (Weather Ball isn't a TM; the Blizzard/Aurora Veil TMs are rarely held), so a mon of
    // the DEFENSIVELY-boosted type abuses passively — Rock (×1.5 SpDef) in sand, Ice (×1.5 Def) in snow.
    test('sand: a Rock-type counts as an abuser (×1.5 SpDef) — Sand Stream setter + 2 Rock = holds', () => {
        const team = [mem('SAND_STREAM', [], ['GROUND']), mem('STURDY', [], ['ROCK']), mem('CLEAR_BODY', [], ['ROCK', 'STEEL'])];
        expect(weatherHolds(team, {}, 'sand')).toBe(true);
    });

    test('sand: the Rock-type setter itself counts (Tyranitar: Sand Stream + Rock) + 1 more Rock = holds', () => {
        const team = [mem('SAND_STREAM', [], ['ROCK', 'DARK']), mem('STURDY', [], ['ROCK'])];
        expect(weatherHolds(team, {}, 'sand')).toBe(true);
    });

    test('sand: a non-Rock, non-ability mon is NOT an abuser', () => {
        const team = [mem('SAND_STREAM', [], ['GROUND']), mem('STURDY', [], ['ROCK']), mem('BLAZE', [], ['FIRE'])];
        expect(weatherHolds(team, {}, 'sand')).toBe(false); // setter(Ground, no boost) + 1 Rock = 1 abuser
    });

    test('snow: an Ice-type counts as an abuser (×1.5 Def) — Snow Warning setter + 2 Ice = holds', () => {
        const team = [mem('SNOW_WARNING', [], ['GRASS', 'ICE']), mem('THICK_FAT', [], ['ICE']), mem('LEVITATE', [], ['ICE', 'GHOST'])];
        expect(weatherHolds(team, {}, 'snow')).toBe(true);
    });

    test('snow: a Slush Rush ability still counts alongside a defensive Ice-type', () => {
        const team = [mem('SNOW_WARNING', [], ['ICE']), mem('SLUSH_RUSH', [], ['WATER'])]; // Ice setter + Slush Rush = 2
        expect(weatherHolds(team, {}, 'snow')).toBe(true);
    });
});

describe('gimmickPlan — weatherAbuseScore (owner score+threshold, T-132)', () => {
    test('the subtype abuser ability scores +3 (≥ threshold)', () => {
        expect(weatherAbuseScore(mem('SWIFT_SWIM', [], ['NORMAL']), 'rain')).toBe(3);
        expect(weatherAbuseScore(mem('CHLOROPHYLL', [], ['NORMAL']), 'sun')).toBe(3);
    });

    test('a boosted-STAB type with a decent attacking stat scores +2', () => {
        expect(weatherAbuseScore(mem(null, [], ['WATER'], { baseAttack: 100, baseSpAttack: 100 }), 'rain')).toBe(2);
        expect(weatherAbuseScore(mem(null, [], ['FIRE'], { baseAttack: 110, baseSpAttack: 50 }), 'sun')).toBe(2);
    });

    test('a boosted-STAB type WITHOUT a decent attacking stat does NOT get the +2', () => {
        // weak pre-evo Water-type on rain: below the attack bar → not an offensive abuser
        expect(weatherAbuseScore(mem(null, [], ['WATER'], { baseAttack: 50, baseSpAttack: 60 }), 'rain')).toBe(0);
    });

    test('the defensively-boosted type scores +2 (sand→Rock, snow→Ice) regardless of attack', () => {
        expect(weatherAbuseScore(mem(null, [], ['ROCK'], { baseAttack: 40, baseSpAttack: 40 }), 'sand')).toBe(2);
        expect(weatherAbuseScore(mem(null, [], ['ICE'], { baseAttack: 40, baseSpAttack: 40 }), 'snow')).toBe(2);
    });

    test('a synergy-move learner scores +1 — not enough alone', () => {
        const canBlizzard = mem(null, [], ['NORMAL'], { teachables: ['MOVE_BLIZZARD'] });
        expect(weatherAbuseScore(canBlizzard, 'snow')).toBe(1);
        expect(weatherAbuseScore(canBlizzard, 'snow')).toBeLessThan(WEATHER_ABUSE_THRESHOLD);
    });

    test('a foreign-weather ability scores 0 for the wrong subtype (Swift Swim in sun)', () => {
        expect(weatherAbuseScore(mem('SWIFT_SWIM', [], ['NORMAL']), 'sun')).toBe(0);
    });

    test('components stack (Ice-type + Slush Rush = def +2 and ability +3)', () => {
        expect(weatherAbuseScore(mem('SLUSH_RUSH', [], ['ICE']), 'snow')).toBe(5);
    });

    test('the candidate form (ability POOL) also scores the ability', () => {
        // a species candidate: parsedAbilities pool, no resolved .ability
        const candidate = { parsedTypes: ['WATER'], parsedAbilities: ['SWIFT_SWIM', 'TORRENT'], baseAttack: 100, baseSpAttack: 100, learnset: [], teachables: [] };
        expect(weatherAbuseScore(candidate, 'rain')).toBe(3 + 2); // Swift Swim (+3) + Water attacker (+2)
    });
});

describe('gimmickPlan — ensureMoveSetter (RC1 move-setter for villains, T-132)', () => {
    const { ensureMoveSetter } = require('../../modules/gimmickPlan');

    test('injects a setter MOVE when no ability-setter exists, so the gimmick can hold', () => {
        const rock1 = mem('STURDY', ['MOVE_ROCK_SLIDE', 'MOVE_EARTHQUAKE', 'MOVE_STEALTH_ROCK', 'MOVE_PROTECT'], ['ROCK']);
        const rock2 = mem('SOLID_ROCK', ['MOVE_POWER_GEM', 'MOVE_BODY_PRESS', 'MOVE_RECOVER', 'MOVE_TOXIC'], ['ROCK']);
        const setterCap = mem('SAND_VEIL', ['MOVE_EARTHQUAKE', 'MOVE_STONE_EDGE', 'MOVE_SLACK_OFF', 'MOVE_YAWN'], ['GROUND'], { teachables: ['MOVE_SANDSTORM'] });
        const team = [rock1, rock2, setterCap];
        expect(weatherHolds(team, {}, 'sand')).toBe(false);    // 2 Rock abusers but no setter
        expect(ensureMoveSetter(team, 'sand')).toBe(true);
        expect(setterCap.moves).toContain('MOVE_SANDSTORM');   // move-setter injected
        expect(weatherHolds(team, {}, 'sand')).toBe(true);     // now setter + 2 abusers
    });

    test('no-op when the team already has a setter', () => {
        const team = [mem('SAND_STREAM', [], ['GROUND']), mem('STURDY', [], ['ROCK'])];
        const before = team.map(m => (m.moves || []).slice());
        expect(ensureMoveSetter(team, 'sand')).toBe(false);
        expect(team.map(m => m.moves)).toEqual(before);
    });

    test('prefers a NON-abuser as the setter-move carrier (preserve the abusers)', () => {
        const abuserLearner = mem('STURDY', ['MOVE_ROCK_SLIDE', 'MOVE_A', 'MOVE_B', 'MOVE_C'], ['ROCK'], { teachables: ['MOVE_SANDSTORM'] });
        const neutralLearner = mem('OVERGROW', ['MOVE_A', 'MOVE_B', 'MOVE_C', 'MOVE_D'], ['GRASS'], { teachables: ['MOVE_SANDSTORM'] });
        const team = [abuserLearner, neutralLearner];
        ensureMoveSetter(team, 'sand');
        expect(neutralLearner.moves).toContain('MOVE_SANDSTORM');
        expect(abuserLearner.moves).not.toContain('MOVE_SANDSTORM');
    });

    test('returns false when no team member can learn any setter move', () => {
        const team = [mem('STURDY', ['MOVE_ROCK_SLIDE'], ['ROCK']), mem('SOLID_ROCK', ['MOVE_POWER_GEM'], ['ROCK'])];
        expect(ensureMoveSetter(team, 'sand')).toBe(false);
    });
});

describe('gimmickPlan — weatherAbuseRating (T-135, rank abusers by weather exploitation)', () => {
    const { weatherAbuseRating } = require('../../modules/gimmickPlan');
    // a rating-shaped member: full stats + base rating.
    const rm = (ability, types, extra = {}) => ({
        pokemon: {
            parsedTypes: types, baseAttack: 80, baseSpAttack: 80, baseSpeed: 80,
            baseDefense: 70, baseSpDefense: 70, baseHP: 70, learnset: [], teachables: [],
            rating: { absoluteRating: 6 }, ...extra,
        }, ability, moves: [],
    });

    test('a Chlorophyll mon outranks a plain Fire-type in sun', () => {
        expect(weatherAbuseRating(rm('CHLOROPHYLL', ['GRASS'], { baseSpAttack: 110 }), 'sun'))
            .toBeGreaterThan(weatherAbuseRating(rm('BLAZE', ['FIRE'], { baseSpAttack: 110 }), 'sun'));
    });

    test('a Fire-type Chlorophyll mon (ability + STAB) beats a plain Fire-type', () => {
        expect(weatherAbuseRating(rm('CHLOROPHYLL', ['FIRE', 'GRASS'], { baseSpAttack: 110 }), 'sun'))
            .toBeGreaterThan(weatherAbuseRating(rm('BLAZE', ['FIRE'], { baseSpAttack: 110 }), 'sun'));
    });

    test('a foreign-weather ability adds nothing (Swift Swim in sun == a plain mon)', () => {
        expect(weatherAbuseRating(rm('SWIFT_SWIM', ['NORMAL']), 'sun'))
            .toBe(weatherAbuseRating(rm('GUTS', ['NORMAL']), 'sun'));
    });

    test('Solar Power scales with speed (fast > slow)', () => {
        expect(weatherAbuseRating(rm('SOLAR_POWER', ['FIRE'], { baseSpeed: 120 }), 'sun'))
            .toBeGreaterThan(weatherAbuseRating(rm('SOLAR_POWER', ['FIRE'], { baseSpeed: 40 }), 'sun'));
    });

    test('Chlorophyll scales with offensive power (stronger > weaker)', () => {
        expect(weatherAbuseRating(rm('CHLOROPHYLL', ['GRASS'], { baseSpAttack: 130 }), 'sun'))
            .toBeGreaterThan(weatherAbuseRating(rm('CHLOROPHYLL', ['GRASS'], { baseSpAttack: 50 }), 'sun'));
    });

    test('a Grass Chlorophyll mon that can learn Solar Beam gets the synergy-STAB bonus', () => {
        expect(weatherAbuseRating(rm('CHLOROPHYLL', ['GRASS'], { teachables: ['MOVE_SOLAR_BEAM'] }), 'sun'))
            .toBeGreaterThan(weatherAbuseRating(rm('CHLOROPHYLL', ['GRASS'], { teachables: [] }), 'sun'));
    });
});

describe('gimmickPlan — abuse-only tag weather (C, T-132)', () => {
    const { teamWeather } = require('../../modules/gimmickPlan');

    test('abuseOnly holds with ≥2 abusers and NO setter (partner sets the weather)', () => {
        const team = [mem('CHLOROPHYLL', [], ['GRASS']), mem(null, [], ['FIRE'])]; // 2 sun abusers, no setter
        expect(weatherHolds(team, {}, 'sun')).toBe(false);                 // normally needs a setter
        expect(weatherHolds(team, { abuseOnly: true }, 'sun')).toBe(true); // as a tag abuser: fine
    });

    test('abuseOnly still needs the 2 abusers', () => {
        const team = [mem('CHLOROPHYLL', [], ['GRASS']), mem('GUTS', [], ['NORMAL'])]; // 1 abuser
        expect(weatherHolds(team, { abuseOnly: true }, 'sun')).toBe(false);
    });

    test('teamWeather reports the subtype the team sets (ability or move)', () => {
        expect(teamWeather([mem('DROUGHT', [], ['FIRE'])])).toBe('sun');
        expect(teamWeather([mem('GUTS', ['MOVE_SANDSTORM'], ['ROCK'])])).toBe('sand');
        expect(teamWeather([mem('GUTS', [], ['NORMAL'])])).toBe(null);
    });

    test('abuseOnly fallback chain is [abuse, dropped] — never tries other weathers', () => {
        const chain = gimmickFallbackChain({ base: 'x', gimmicks: ['weather'], weather: 'sun', abuseOnly: true }, 'T');
        expect(chain).toHaveLength(2);
        expect(chain[0].weather).toBe('sun');
        expect((chain[1].gimmicks || []).includes('weather')).toBe(false);
    });
});

describe('gimmickPlan — emergent weather trigger (T-136, non-dedicated teams)', () => {
    const { emergentWeatherSubtype } = require('../../modules/gimmickPlan');
    const { EMERGENT_WEATHER_MIN_SOPH } = require('../../modules/weatherConstants');

    // A non-dedicated team that ROLLED a natural setter → build that weather (setter + 2 abusers).
    test('unseeded team that rolled a Drizzle setter, soph above the gate → returns its subtype', () => {
        const team = [mem('DRIZZLE', [], ['WATER']), mem('GUTS', [], ['NORMAL'])];
        expect(emergentWeatherSubtype({ committedSeed: null, soph: 0.5, team })).toBe('rain');
    });

    test('a MOVE-setter (Sunny Day) also emerges the weather', () => {
        const team = [mem('GUTS', ['MOVE_SUNNY_DAY'], ['FIRE'])];
        expect(emergentWeatherSubtype({ committedSeed: null, soph: 0.6, team })).toBe('sun');
    });

    test('below the sophistication gate → null (a low-level fluke setter builds nothing)', () => {
        const team = [mem('DRIZZLE', [], ['WATER'])];
        expect(emergentWeatherSubtype({ committedSeed: null, soph: 0.3, team })).toBe(null);
    });

    test('the gate is inclusive at EMERGENT_WEATHER_MIN_SOPH', () => {
        const team = [mem('SAND_STREAM', [], ['ROCK'])];
        expect(emergentWeatherSubtype({ committedSeed: null, soph: EMERGENT_WEATHER_MIN_SOPH, team })).toBe('sand');
    });

    test('no setter on the team → null (nothing to build around)', () => {
        const team = [mem('GUTS', [], ['NORMAL']), mem('TORRENT', [], ['WATER'])];
        expect(emergentWeatherSubtype({ committedSeed: null, soph: 0.9, team })).toBe(null);
    });

    test('a team already committed to weather → null (do not double-build)', () => {
        const team = [mem('DRIZZLE', [], ['WATER'])];
        const committedSeed = { base: 'bulky_offense', gimmicks: ['weather'], weather: 'rain' };
        expect(emergentWeatherSubtype({ committedSeed, soph: 0.9, team })).toBe(null);
    });

    test('an abuse-partner (tag) never emerges its own weather — it follows its ally', () => {
        const team = [mem('DRIZZLE', [], ['WATER'])];
        expect(emergentWeatherSubtype({ committedSeed: null, abusePartner: true, soph: 0.9, team })).toBe(null);
    });
});

describe('gimmickPlan — other gimmicks', () => {
    // T-137 spec change: trick_room is now a full gimmick — setter MOVE + 2 slow-strong abusers (was
    // setter-move presence only). Detail in terrainRoomGimmicks.test.js.
    test("trick_room needs a Trick Room setter move + 2 slow-strong abusers", () => {
        const slow = extra => mem('X', [], ['NORMAL'], { baseSpeed: 20, baseAttack: 130, baseSpAttack: 60, ...extra });
        expect(gimmickHolds('trick_room', [mem('X', ['MOVE_TRICK_ROOM'], ['PSYCHIC'], { baseSpeed: 20 }), slow(), slow()])).toBe(true);
        expect(gimmickHolds('trick_room', [mem('X', ['MOVE_TACKLE'])])).toBe(false);          // no setter
        expect(gimmickHolds('trick_room', [mem('X', ['MOVE_TRICK_ROOM'])])).toBe(false);       // setter, no abusers
    });
    test('an unknown gimmick holds (no condition to fail)', () => {
        expect(gimmickHolds('mystery', [mem('X')])).toBe(true);
    });
});

describe('gimmickPlan — fallback chain (ADR-017)', () => {
    test('themed weather → [themed, ...other 3 weathers, dropped]', () => {
        const chain = gimmickFallbackChain({ base: 'bulky_offense', gimmicks: ['weather'], weather: 'snow' }, 'T_X');
        expect(chain).toHaveLength(5);
        expect(chain[0].weather).toBe('snow');
        expect(chain.slice(1, 4).map(v => v.weather).sort()).toEqual(['rain', 'sand', 'sun']);
        expect((chain[4].gimmicks || []).includes('weather')).toBe(false); // final = dropped
    });
    test('non-gimmick seed → single attempt', () => {
        expect(gimmickFallbackChain({ base: 'balance' }, 'T')).toHaveLength(1);
    });
    test('non-weather gimmick → [gimmick, dropped]', () => {
        const chain = gimmickFallbackChain({ base: 'balance', gimmicks: ['trick_room'] }, 'T');
        expect(chain).toHaveLength(2);
        expect((chain[1].gimmicks || []).includes('trick_room')).toBe(false);
    });
    test('the fallback order is stable per trainer (no RNG)', () => {
        const seed = { base: 'x', gimmicks: ['weather'], weather: 'rain' };
        const a = gimmickFallbackChain(seed, 'T_A').map(v => v.weather);
        const b = gimmickFallbackChain(seed, 'T_A').map(v => v.weather);
        expect(a).toEqual(b);
    });
});
