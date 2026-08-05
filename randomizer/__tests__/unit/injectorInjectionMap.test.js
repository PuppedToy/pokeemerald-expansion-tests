// T-249 — the offset map a browser downloads.
//
// The base's full map is 88,000 symbols / 21 MB of JSON, almost all of it addressed by nothing: the
// module registry can only reach the symbols it names and the ones its patterns match. Filtering to those
// is what makes the map shippable (and parseable inside a Worker that is also holding a 32 MB ROM).
//
// The risk filtering introduces is silence, not noise: `learnsets` treats an absent symbol as "the base
// does not export this array" and skips it, so an over-eager filter would produce a ROM that looks fine
// and carries BASE learnsets. Hence the test that matters here is the byte comparison — inject the same
// bundle through the full map and the filtered one, and demand the same ROM.

const { OffsetMap } = require('../../injector/symbolMap');
const {
    injectRom, injectionSymbolNames, filterOffsetMapForInjection, INJECTION_MODULES, BaseSources,
} = require('../../injector');
const { BASE_SOURCE_FILES, REPO_ROOT } = require('../../injector/sources');
const { buildSyntheticBase } = require('../fixtures/syntheticBase');

// The fixture's ROM holds a one-entry learnset, so the base SOURCE the module byte-matches it against has
// to say the same thing. Baked over the tree: this one file comes from here, everything else from the repo
// — which is the seam step 1 built, used the way a browser uses it.
const baseSources = () => new BaseSources({
    root: REPO_ROOT,
    files: {
        [BASE_SOURCE_FILES.levelUpLearnsets]: [
            'const struct LevelUpMove sZigzagoonLevelUpLearnset[] = {',
            '    LEVEL_UP_MOVE( 1, MOVE_TACKLE),',
            '    LEVEL_UP_END,',
            '};',
            '',
        ].join('\n'),
    },
});

function bundleData() {
    return {
        pokedex: {
            pokes: [{
                id: 'SPECIES_ZIGZAGOON',
                baseHP: 44, baseAttack: 55, baseDefense: 41, baseSpeed: 60, baseSpAttack: 30, baseSpDefense: 41,
                parsedTypes: ['DARK', 'NORMAL'],
                parsedAbilities: ['PICKUP', 'GLUTTONY', 'QUICK_FEET'],
                log: [{ target: 'baseHP' }, { target: 'type' }],
                levelUpLearnset: 'sZigzagoonLevelUpLearnset',
                learnset: [{ level: 1, move: 'MOVE_TACKLE' }, { level: 9, move: 'MOVE_EMBER' }],
            }],
            moves: {
                MOVE_TACKLE: { id: 'MOVE_TACKLE', power: 75, accuracy: 100, type: 'NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL', log: [{ target: 'power' }] },
            },
            tmList: ['ICE_BEAM', 'BRUTAL_SWING', 'BRINE'],
        },
        wild: {},
        config: { prices: { balls: { ultra: 4321 } } },
    };
}

const base = () => buildSyntheticBase({
    dataDriven: true,
    species: {
        SPECIES_ZIGZAGOON: {
            stats: [38, 30, 41, 60, 30, 41],
            types: ['TYPE_NORMAL', 'TYPE_NORMAL'],
            abilities: ['ABILITY_PICKUP', 'ABILITY_GLUTTONY', 'ABILITY_QUICK_FEET'],
        },
    },
    moves: { MOVE_TACKLE: { power: 40, accuracy: 100, type: 'TYPE_NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL' } },
    items: { ITEM_ULTRA_BALL: 10 },
    learnsets: { sZigzagoonLevelUpLearnset: [{ level: 1, move: 'MOVE_TACKLE' }] },
    tmMoves: ['VACUUM_WAVE', 'BRUTAL_SWING', 'BRINE'],
});

describe('injectionSymbolNames', () => {
    test('takes the registry\'s named symbols, its pattern matches and the local script labels', () => {
        const names = injectionSymbolNames(base().offsetMap);
        expect(names.has('gSpeciesInfo')).toBe(true);                 // named by group-a-fixed
        expect(names.has('sZigzagoonLevelUpLearnset')).toBe(true);    // matched by the learnsets pattern
        // The Group-D setvar sites are local labels the registry deliberately does not list as symbols —
        // they come from the `.sym` — but a filtered map without them cannot patch a toggle.
        expect(names.has('EverGrandeCity_SidneysRoom_EventScript_InitRunAndBun')).toBe(true);
        expect(names.has('MossdeepCity_SpaceCenter_2F_OnTransition')).toBe(true);
    });

    test('leaves out everything the registry cannot address', () => {
        const offsetMap = new OffsetMap({
            symbols: {
                gSpeciesInfo: { name: 'gSpeciesInfo', addr: 0x8000000, romOffset: 0, size: 4, sizeExact: true },
                CB2_InitBattle: { name: 'CB2_InitBattle', addr: 0x8000100, romOffset: 0x100, size: 4, sizeExact: true },
            },
            romCapacity: 0x2000000,
            romEndOffset: 0x200,
        });
        const names = injectionSymbolNames(offsetMap);
        expect([...names]).toEqual(['gSpeciesInfo']);
    });
});

describe('filterOffsetMapForInjection', () => {
    test('keeps the ROM budget and the addressable symbols, drops the rest', () => {
        const clean = base().offsetMap;
        // A real base's map is mostly code and data no module can address; the fixture's is not, so the
        // noise is added explicitly — otherwise this test would pass on a filter that dropped nothing.
        const full = new OffsetMap({
            symbols: {
                ...clean.symbols,
                CB2_InitBattle: { name: 'CB2_InitBattle', addr: 0x8000100, romOffset: 0x100, size: 4, sizeExact: true },
            },
            romCapacity: clean.romCapacity,
            romEndOffset: clean.romEndOffset,
        });
        const filtered = filterOffsetMapForInjection(full);

        expect(filtered.romCapacity).toBe(full.romCapacity);
        expect(filtered.romEndOffset).toBe(full.romEndOffset);
        expect(filtered.has('CB2_InitBattle')).toBe(false);
        expect(filtered.symbolCount).toBe(full.symbolCount - 1);
        expect(filtered.symbolCount).toBe(injectionSymbolNames(full).size);
        expect(filtered.offsetOf('gSpeciesInfo')).toBe(full.offsetOf('gSpeciesInfo'));
        // Same object shape as a parsed map, sizes included — the learnset guard compares against them.
        expect(filtered.require('sZigzagoonLevelUpLearnset').size)
            .toBe(full.require('sZigzagoonLevelUpLearnset').size);
    });

    test('a bundle injected through it produces the same ROM, byte for byte', () => {
        const data = bundleData();

        const viaFull = base();
        injectRom({ rom: viaFull.rom, offsetMap: viaFull.offsetMap, data, baseSources: baseSources() });

        const viaFiltered = base();
        injectRom({
            rom: viaFiltered.rom,
            offsetMap: filterOffsetMapForInjection(viaFiltered.offsetMap),
            data,
            baseSources: baseSources(),
        });

        expect(viaFiltered.rom.bytesWritten).toBe(viaFull.rom.bytesWritten);
        expect(viaFiltered.rom.sha256()).toBe(viaFull.rom.sha256());
    });

    test('every migrated module still reports ready against the filtered map', () => {
        const { checkReadiness } = require('../../injector');
        const filtered = filterOffsetMapForInjection(base().offsetMap);
        const full = checkReadiness(base().offsetMap, INJECTION_MODULES);
        expect(checkReadiness(filtered, INJECTION_MODULES)).toEqual(full);
    });
});
