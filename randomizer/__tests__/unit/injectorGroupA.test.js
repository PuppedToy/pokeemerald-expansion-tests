// T-239 — the `group-a-fixed` registry entry: one module, six writers, driven through the T-238
// orchestrator exactly as make.js's inject path drives it.
const fs = require('fs');
const path = require('path');
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { injectRom, INJECTION_MODULES, checkReadiness } = require('../../injector');
const { applyGroupAFixed } = require('../../injector/modules/groupAFixed');
const { SPECIES_INFO, MOVE_INFO, ITEM_INFO, WILD_POKEMON, TMHM_INDEX_KEY, readMoveField } = require('../../injector/structLayout');

const LAND_RATES = [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1];

function encountersJson() {
    return {
        wild_encounter_groups: [{
            label: 'gWildMonHeaders',
            for_maps: true,
            fields: [{ type: 'land_mons', encounter_rates: LAND_RATES }],
            encounters: [{
                map: 'MAP_ROUTE101',
                base_label: 'gRoute101',
                land_mons: {
                    encounter_rate: 20,
                    mons: Array.from({ length: 12 }, () => ({ min_level: 7, max_level: 9, species: 'SPECIES_ZIGZAGOON' })),
                },
            }],
        }],
    };
}

/** A bundle that exercises all six writers at once. */
function bundleData() {
    return {
        pokedex: {
            pokes: [
                {
                    id: 'SPECIES_ZIGZAGOON',
                    baseHP: 44, baseAttack: 55, baseDefense: 41, baseSpeed: 60, baseSpAttack: 30, baseSpDefense: 41,
                    parsedTypes: ['DARK', 'NORMAL'],
                    parsedAbilities: ['PICKUP', 'GLUTTONY', 'QUICK_FEET'],
                    evolutions: [{ method: 'LEVEL', param: '31', pokemon: 'SPECIES_LINOONE' }],
                    log: [{ target: 'baseHP' }, { target: 'type' }],
                },
            ],
            moves: {
                MOVE_TACKLE: { id: 'MOVE_TACKLE', power: 75, accuracy: 100, type: 'NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL', log: [{ target: 'power' }] },
            },
            tmList: ['ICE_BEAM', 'BRUTAL_SWING', 'BRINE'],
        },
        wild: { wildPlan: { SPECIES_ZIGZAGOON: ['SPECIES_LINOONE'] } },
        config: { prices: { balls: { ultra: 4321 } } },
    };
}

function setup() {
    const json = encountersJson();
    const base = buildSyntheticBase({
        species: {
            SPECIES_ZIGZAGOON: {
                stats: [38, 30, 41, 60, 30, 41],
                types: ['TYPE_NORMAL', 'TYPE_NORMAL'],
                abilities: ['ABILITY_PICKUP', 'ABILITY_GLUTTONY', 'ABILITY_QUICK_FEET'],
                itemCommon: 'ITEM_ORAN_BERRY',
            },
            SPECIES_LINOONE: { stats: [78, 70, 61, 100, 50, 61], types: ['TYPE_NORMAL', 'TYPE_NORMAL'] },
        },
        moves: { MOVE_TACKLE: { power: 40, accuracy: 100, type: 'TYPE_NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL' } },
        items: { ITEM_ULTRA_BALL: 10 },
        evolutions: { SPECIES_ZIGZAGOON: [{ method: 'EVO_LEVEL', param: 20, target: 'SPECIES_LINOONE' }] },
        wild: { gRoute101_LandMons: json.wild_encounter_groups[0].encounters[0].land_mons.mons },
        tmMoves: ['VACUUM_WAVE', 'BRUTAL_SWING', 'BRINE'],
    });
    return { ...base, json };
}

describe('the registry entry', () => {
    const entry = INJECTION_MODULES.find(m => m.id === 'group-a-fixed');

    test('is migrated and has an apply()', () => {
        expect(entry.task).toBe('T-239');
        expect(entry.status).toBe('migrated');
        expect(typeof entry.apply).toBe('function');
    });

    test('claims the wild slot arrays it writes, not just gWildMonHeaders', () => {
        const matches = (name) => entry.symbolPatterns.some(p => p.test(name));
        expect(matches('gRoute101_LandMons')).toBe(true);
        expect(matches('gRoute101_Morning_FishingMons')).toBe(true);
        expect(matches('gTrainers')).toBe(false);
        expect(entry.symbols).toContain('gTMHMItemMoveIds');
    });

    test('readiness against a base that exports its tables', () => {
        const base = setup();
        const report = checkReadiness(base.offsetMap, [entry]);
        expect(report[0].missing).toEqual(['gWildMonHeaders']);   // the fixture only has the slot arrays
        expect(report[0].matched).toBe(1);
    });
});

describe('applying all six writers over one base', () => {
    test('each output lands, and nothing else moves', () => {
        const base = setup();
        const before = base.rom.toBuffer();

        applyGroupAFixed({
            rom: base.rom, offsetMap: base.offsetMap, data: bundleData(),
            sources: { encountersJson: base.json },
        });

        // species: the logged stat and the logged type change; the unlogged ones do not
        expect(base.rom.readU8(base.speciesAt('SPECIES_ZIGZAGOON') + SPECIES_INFO.baseHP)).toBe(44);
        expect(base.rom.readU8(base.speciesAt('SPECIES_ZIGZAGOON') + SPECIES_INFO.baseAttack)).toBe(30);
        expect(base.rom.readU8(base.speciesAt('SPECIES_ZIGZAGOON') + SPECIES_INFO.types)).toBe(constants.require('TYPE_DARK'));
        // held items stripped everywhere
        expect(base.rom.readU16(base.speciesAt('SPECIES_ZIGZAGOON') + SPECIES_INFO.itemCommon)).toBe(0);
        // moves
        expect(readMoveField(base.rom, base.moveAt('MOVE_TACKLE'), MOVE_INFO.power, 0x0c)).toBe(75);
        // evolutions
        const evoAt = base.rom.readPointer(base.speciesAt('SPECIES_ZIGZAGOON') + base.evolutionsField);
        expect(base.rom.readU16(evoAt + 2)).toBe(31);
        // wild slots
        expect(base.rom.readU16(base.offsetMap.offsetOf('gRoute101_LandMons') + WILD_POKEMON.species))
            .toBe(constants.require('SPECIES_LINOONE'));
        // item price
        expect(base.rom.readU32(base.itemAt('ITEM_ULTRA_BALL') + ITEM_INFO.price)).toBe(4321);
        // TM table
        expect(base.rom.readU16(base.offsetMap.offsetOf('gTMHMItemMoveIds') + TMHM_INDEX_KEY.stride + TMHM_INDEX_KEY.moveId))
            .toBe(constants.require('MOVE_ICE_BEAM'));

        // Everything that changed is claimed in the journal — nothing moved behind its back.
        const claimed = new Set();
        for (const entry of base.rom.journal) {
            for (let i = 0; i < entry.length; i++) claimed.add(entry.offset + i);
        }
        for (let offset = 0; offset < before.length; offset++) {
            if (before[offset] !== base.rom.buffer[offset]) expect(claimed.has(offset)).toBe(true);
        }
    });

    test('an empty bundle only strips held items — the one unconditional write in Group A', () => {
        const base = setup();
        const before = base.rom.toBuffer();
        applyGroupAFixed({
            rom: base.rom, offsetMap: base.offsetMap, data: { pokedex: { pokes: [], moves: {} } },
            // No wild plan and an items.h with nothing price-managed, so the only writes left are T-077's.
            sources: { encountersJson: base.json, itemsSource: '    [ITEM_POTION] =\n    {\n        .price = 200,\n    },' },
        });

        expect(base.rom.journal.every(e => /heldItems/.test(e.tag))).toBe(true);
        // itemCommon/itemRare were the only non-zero held items in the fixture.
        base.rom.buffer.writeUInt16LE(before.readUInt16LE(base.speciesAt('SPECIES_ZIGZAGOON') + SPECIES_INFO.itemCommon),
            base.speciesAt('SPECIES_ZIGZAGOON') + SPECIES_INFO.itemCommon);
        expect(base.rom.buffer.equals(before)).toBe(true);
    });

    test('runs through the orchestrator, which still refuses a full ROM while T-243 is pending', () => {
        const base = setup();
        // Driven exactly as make.js does it: no `sources`, so the writers read the base's own tree. The
        // bundle carries no wild plan, so this fixture needs no per-map tables of the real JSON.
        const data = { ...bundleData(), wild: {} };
        expect(() => injectRom({ rom: base.rom, offsetMap: base.offsetMap, data })).toThrow(/pending/i);

        // T-240 and T-241 joined the board; this fixture exports no learnset arrays and no gTrainers,
        // and the bundle claims neither, so both run and write nothing — which is what an isolated
        // Group-A test wants.
        const result = injectRom({ rom: base.rom, offsetMap: base.offsetMap, data, allowPending: true });
        expect(result.applied).toEqual(['group-a-fixed', 'learnsets', 'trainer-parties', 'trades-starters-nicknames']);
        expect(result.rom.bytesWritten).toBeGreaterThan(0);
    });

    test('a layout the base does not confirm stops all six before any write', () => {
        const base = setup();
        base.rom.buffer.writeUInt8(99, base.speciesAt('SPECIES_BULBASAUR') + SPECIES_INFO.baseHP);
        expect(() => applyGroupAFixed({
            rom: base.rom, offsetMap: base.offsetMap, data: bundleData(), sources: { encountersJson: base.json },
        })).toThrow(/anchor|SPECIES_BULBASAUR/);
        expect(base.rom.journal).toHaveLength(0);
    });
});

describe('the migration board is documented where the docs say it is', () => {
    test('randomizer/docs/injection.md records what T-239 migrated', () => {
        const doc = fs.readFileSync(path.resolve(__dirname, '..', '..', 'docs', 'injection.md'), 'utf8');
        expect(doc).toMatch(/group-a-fixed/);
        expect(doc).toMatch(/T-239/);
    });
});
