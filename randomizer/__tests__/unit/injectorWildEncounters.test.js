// T-239 — inject the wild-encounter species.
//
// The compile path rewrites `src/data/wild_encounters.json` (T-162 structural writer, or the legacy
// whole-file species substitution for pre-T-162 bundles) and lets tools/wild_encounters regenerate
// wild_encounters.h. Only the `species` string of a slot ever changes: slot counts, encounter rates and
// each slot's authored min/max level are preserved — which is exactly why this is a Group-A overwrite.
//
// So the injector runs writer.js's own functions over the base JSON and writes only the slots whose
// species differ, into the generated `<base_label>_<Type>Mons` array. Each array is identified by
// matching the base ROM's bytes against the base JSON — a symbol whose slots don't match the JSON is
// refused rather than written to blindly.
const fs = require('fs');
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const { injectWildEncounters, wildSymbolCandidates } = require('../../injector/modules/wildEncounters');
const { WILD_POKEMON } = require('../../injector/structLayout');
const wildData = require('../../wild');

const LAND_RATES = [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1];

/** A minimal wild_encounters.json with one map, a 12-slot land table and a 5-slot rock-smash table. */
function miniJson({ land, rockSmash = null } = {}) {
    const encounter = {
        map: 'MAP_ROUTE101',
        base_label: 'gRoute101',
        land_mons: { encounter_rate: 20, mons: land.map((species, i) => ({ min_level: 7 + i, max_level: 9 + i, species })) },
    };
    if (rockSmash) {
        encounter.rock_smash_mons = { encounter_rate: 20, mons: rockSmash.map(species => ({ min_level: 10, max_level: 12, species })) };
    }
    return {
        wild_encounter_groups: [{
            label: 'gWildMonHeaders',
            for_maps: true,
            fields: [
                { type: 'land_mons', encounter_rates: LAND_RATES },
                { type: 'rock_smash_mons', encounter_rates: [60, 30, 5, 4, 1] },
            ],
            encounters: [encounter],
        }],
    };
}

function setup(json, wildArtifact, { symbols = null } = {}) {
    const group = json.wild_encounter_groups[0];
    const encounter = group.encounters[0];
    const wild = symbols || Object.fromEntries(
        Object.entries(encounter)
            .filter(([key]) => key.endsWith('_mons'))
            .map(([key, table]) => [`${encounter.base_label}_${key.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join('')}`, table.mons]));
    const base = buildSyntheticBase({ wild });
    const ctx = buildInjectionContext({
        rom: base.rom,
        offsetMap: base.offsetMap,
        data: { wild: wildArtifact },
    });
    return { ...base, ctx, json };
}

const slotSpecies = (base, symbol, index) =>
    base.rom.readU16(base.offsetMap.offsetOf(symbol) + index * WILD_POKEMON.stride + WILD_POKEMON.species);
const slotLevels = (base, symbol, index) => [
    base.rom.readU8(base.offsetMap.offsetOf(symbol) + index * WILD_POKEMON.stride + WILD_POKEMON.minLevel),
    base.rom.readU8(base.offsetMap.offsetOf(symbol) + index * WILD_POKEMON.stride + WILD_POKEMON.maxLevel),
];

describe('the T-162 sweep plan', () => {
    const twelveZigzagoon = Array(12).fill('SPECIES_ZIGZAGOON');

    test('spreads a template’s picks across that template’s slots', () => {
        const json = miniJson({ land: twelveZigzagoon });
        const base = setup(json, { wildPlan: { SPECIES_ZIGZAGOON: ['SPECIES_BULBASAUR', 'SPECIES_LINOONE'] } });
        injectWildEncounters(base.ctx, { encountersJson: json });

        const written = Array.from({ length: 12 }, (_, i) => slotSpecies(base, 'gRoute101_LandMons', i));
        const distinct = new Set(written);
        expect(distinct).toEqual(new Set([constants.require('SPECIES_BULBASAUR'), constants.require('SPECIES_LINOONE')]));
    });

    test('never writes a level — only the species u16 of a slot', () => {
        const json = miniJson({ land: twelveZigzagoon });
        const base = setup(json, { wildPlan: { SPECIES_ZIGZAGOON: ['SPECIES_BULBASAUR'] } });
        injectWildEncounters(base.ctx, { encountersJson: json });

        expect(slotLevels(base, 'gRoute101_LandMons', 0)).toEqual([7, 9]);
        expect(slotLevels(base, 'gRoute101_LandMons', 5)).toEqual([12, 14]);
        const slotBase = base.offsetMap.offsetOf('gRoute101_LandMons');
        for (const entry of base.rom.journal) {
            expect((entry.offset - slotBase) % WILD_POKEMON.stride).toBe(WILD_POKEMON.species);
            expect(entry.length).toBe(2);
        }
    });

    test('a table holding species the plan never names is left alone', () => {
        const json = miniJson({ land: twelveZigzagoon, rockSmash: Array(5).fill('SPECIES_GEODUDE') });
        const base = setup(json, { wildPlan: { SPECIES_ZIGZAGOON: ['SPECIES_BULBASAUR'] } });
        injectWildEncounters(base.ctx, { encountersJson: json });

        expect(slotSpecies(base, 'gRoute101_RockSmashMons', 0)).toBe(constants.require('SPECIES_GEODUDE'));
        expect(slotSpecies(base, 'gRoute101_LandMons', 0)).toBe(constants.require('SPECIES_BULBASAUR'));
    });

    test('a plan that changes nothing writes nothing', () => {
        const json = miniJson({ land: twelveZigzagoon });
        const base = setup(json, { wildPlan: { SPECIES_ZIGZAGOON: ['SPECIES_ZIGZAGOON'] } });
        const { writes } = injectWildEncounters(base.ctx, { encountersJson: json });

        expect(writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });
});

describe('the legacy (pre-T-162) replacement log', () => {
    test('applies the species→species mapping when the bundle has no wildPlan', () => {
        const json = miniJson({ land: Array(12).fill('SPECIES_ZIGZAGOON'), rockSmash: Array(5).fill('SPECIES_GEODUDE') });
        const base = setup(json, { replacementLog: { SPECIES_ZIGZAGOON: 'SPECIES_LINOONE', SPECIES_GEODUDE: 'SPECIES_BULBASAUR' } });
        injectWildEncounters(base.ctx, { encountersJson: json });

        expect(slotSpecies(base, 'gRoute101_LandMons', 3)).toBe(constants.require('SPECIES_LINOONE'));
        expect(slotSpecies(base, 'gRoute101_RockSmashMons', 4)).toBe(constants.require('SPECIES_BULBASAUR'));
    });

    test('an empty artifact writes nothing', () => {
        const json = miniJson({ land: Array(12).fill('SPECIES_ZIGZAGOON') });
        const base = setup(json, {});
        expect(injectWildEncounters(base.ctx, { encountersJson: json }).writes).toBe(0);
    });
});

describe('locating the generated array', () => {
    test('accepts the time-of-day infix the generator can add', () => {
        expect(wildSymbolCandidates('gRoute101', 'land_mons').test('gRoute101_LandMons')).toBe(true);
        expect(wildSymbolCandidates('gRoute101', 'land_mons').test('gRoute101_Morning_LandMons')).toBe(true);
        expect(wildSymbolCandidates('gRoute101', 'land_mons').test('gRoute101_WaterMons')).toBe(false);
        expect(wildSymbolCandidates('gRoute102', 'rock_smash_mons').test('gRoute102_RockSmashMons')).toBe(true);
    });

    test('refuses a symbol whose slots do not match the base JSON', () => {
        const json = miniJson({ land: Array(12).fill('SPECIES_ZIGZAGOON') });
        // The ROM holds a different species than the JSON says — the map and the ROM are not the same build.
        const base = setup(json, { wildPlan: { SPECIES_ZIGZAGOON: ['SPECIES_BULBASAUR'] } },
            { symbols: { gRoute101_LandMons: Array(12).fill('SPECIES_GEODUDE') } });

        expect(() => injectWildEncounters(base.ctx, { encountersJson: json })).toThrow(/gRoute101_LandMons|does not match/i);
    });

    test('throws naming the symbol when the base does not export it', () => {
        const json = miniJson({ land: Array(12).fill('SPECIES_ZIGZAGOON') });
        const base = setup(json, { wildPlan: { SPECIES_ZIGZAGOON: ['SPECIES_BULBASAUR'] } },
            { symbols: { gSomewhereElse_LandMons: Array(12).fill('SPECIES_ZIGZAGOON') } });

        expect(() => injectWildEncounters(base.ctx, { encountersJson: json })).toThrow(/gRoute101.*LandMons/);
    });
});

describe('against the base’s real wild_encounters.json', () => {
    const json = JSON.parse(fs.readFileSync(wildData.file, 'utf8'));

    /** Every encounter table of the real JSON as its own symbol — the shape the generator emits. */
    function realBase(wildArtifact) {
        const wild = {};
        for (const group of json.wild_encounter_groups) {
            for (const encounter of group.encounters || []) {
                for (const [key, table] of Object.entries(encounter)) {
                    if (!key.endsWith('_mons') || !table || !Array.isArray(table.mons)) continue;
                    const pascal = key.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join('');
                    wild[`${encounter.base_label}_${pascal}`] = table.mons;
                }
            }
        }
        const base = buildSyntheticBase({ wild });
        return {
            ...base,
            ctx: buildInjectionContext({ rom: base.rom, offsetMap: base.offsetMap, data: { wild: wildArtifact } }),
        };
    }

    test('validates every table of all 128 maps and rewrites only the planned ones', () => {
        const route101 = json.wild_encounter_groups[0].encounters.find(e => e.base_label === 'gRoute101');
        const template = route101.land_mons.mons[0].species;
        const base = realBase({ wildPlan: { [template]: ['SPECIES_MIRAIDON'] } });

        const { writes, tables } = injectWildEncounters(base.ctx, { encountersJson: json });

        expect(writes).toBeGreaterThan(0);
        expect(tables).toBeGreaterThan(0);
        expect(slotSpecies(base, 'gRoute101_LandMons', 0)).toBe(constants.require('SPECIES_MIRAIDON'));
        // Every write is a species slot, nothing else.
        expect(base.rom.journal.every(e => e.length === 2)).toBe(true);
    });

    test('a bundle with no wild changes leaves the whole table set untouched', () => {
        const base = realBase({ wildPlan: {} });
        expect(injectWildEncounters(base.ctx, { encountersJson: json }).writes).toBe(0);
    });
});
