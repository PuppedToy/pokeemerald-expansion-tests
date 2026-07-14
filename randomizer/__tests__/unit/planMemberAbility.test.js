'use strict';

// T-124 — identity-aware ability selection: a weather-crystallised team gives its setter a weather
// ability and its abusers the ability matching the established weather.

const { planMemberAbility } = require('../../modules/archetypeRefine');
const { getArchetypeModel } = require('../../archetypes');

const singles = getArchetypeModel('singles');
const opts = { model: singles, ctx: {}, sophistication: 1 };
const species = (parsedAbilities, extra = {}) => ({
    id: 'SPECIES_X', parsedTypes: ['WATER'], parsedAbilities, baseHP: 70, baseAttack: 70,
    baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70, learnset: [], teachables: [], ...extra,
});
const member = (poke, ability) => ({ pokemon: poke, ability, moves: [] });

describe('planMemberAbility', () => {
    // A team seeded to weather so the identity is present from the first slot.
    const weatherSeed = { base: 'bulky_offense', gimmicks: ['weather'] };

    test('with a weather identity and NO setter yet, a setter-capable mon prefers the setter ability', () => {
        const drizzleMon = species(['DRIZZLE', 'SWIFT_SWIM']);
        const pref = planMemberAbility({ species: drizzleMon, team: [], seed: weatherSeed, ...opts });
        expect(pref).toContain('DRIZZLE');
    });

    test('once the team has a rain setter, an abuser-capable mon prefers Swift Swim (subtype match)', () => {
        const setter = member(species(['DRIZZLE']), 'DRIZZLE'); // established rain
        const abuser = species(['SWIFT_SWIM', 'TORRENT']);
        const pref = planMemberAbility({ species: abuser, team: [setter], seed: weatherSeed, ...opts });
        expect(pref).toEqual(['SWIFT_SWIM']);
    });

    test('a sun team (Drought setter) prefers Chlorophyll, not Swift Swim', () => {
        const setter = member(species(['DROUGHT']), 'DROUGHT');
        const mon = species(['CHLOROPHYLL', 'SWIFT_SWIM']);
        expect(planMemberAbility({ species: mon, team: [setter], seed: weatherSeed, ...opts })).toEqual(['CHLOROPHYLL']);
    });

    test('no weather identity → no preference', () => {
        const drizzleMon = species(['DRIZZLE', 'SWIFT_SWIM']);
        expect(planMemberAbility({ species: drizzleMon, team: [], seed: { base: 'balance' }, ...opts })).toEqual([]);
    });

    test('below the sophistication gate → no preference (early game unaffected)', () => {
        const drizzleMon = species(['DRIZZLE']);
        expect(planMemberAbility({ species: drizzleMon, team: [], seed: weatherSeed, model: singles, ctx: {}, sophistication: 0 })).toEqual([]);
    });

    const snowSeed = { base: 'bulky_offense', gimmicks: ['weather'], weather: 'snow' };

    // T-132 (RC4) — supersedes the old T-131 general-weather fallback: a themed team NEVER establishes a
    // FOREIGN weather. A snow-seeded mon that can only set RAIN gets NO setter preference here (and the
    // resolver additionally bans the foreign Drizzle ability). The themed weather is set via a MOVE-setter
    // (gimmickPlan.ensureMoveSetter) when no themed ability-setter exists — never by mixing in another weather.
    test('T-132 — themed setter unavailable → NO foreign-weather setter preference', () => {
        const rainOnly = species(['DRIZZLE', 'SWIFT_SWIM']);
        const pref = planMemberAbility({ species: rainOnly, team: [], seed: snowSeed, ...opts });
        expect(pref).not.toContain('DRIZZLE');   // never lean toward a foreign weather's setter
        expect(pref).toEqual([]);                // not a snow setter, not a snow abuser → no preference
    });

    test('T-131 — the themed setter is still preferred when this mon CAN set it', () => {
        const canSnow = species(['SNOW_WARNING', 'DRIZZLE']);
        expect(planMemberAbility({ species: canSnow, team: [], seed: snowSeed, ...opts })).toEqual(['SNOW_WARNING']);
    });

    test('T-131 — no new setter once a weather is already up; abuse the established one', () => {
        const rainUp = member(species(['DRIZZLE']), 'DRIZZLE'); // rain already established
        const mon = species(['SWIFT_SWIM', 'DRIZZLE']);
        expect(planMemberAbility({ species: mon, team: [rainUp], seed: snowSeed, ...opts })).toEqual(['SWIFT_SWIM']);
    });
});
