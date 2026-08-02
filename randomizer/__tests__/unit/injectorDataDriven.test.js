// T-243 — the last module: the Phase-2 data-driven tables and the Group-D setvar toggles.
//
// Five of the six outputs are plain tables *because Phase 2 rebuilt them that way* (T-234/235/236), so
// the tests here are mostly about mirroring each writer's decision. The sixth — the toggles — is the one
// mechanism the migration never exercised: a `setvar` immediate inside compiled script bytecode, found
// through a LOCAL label from the `.sym` and an opcode scan.
const fs = require('fs');
const path = require('path');
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const {
    applyDataDrivenAndToggles, injectSettings, injectRewards, injectPicks, injectToggles,
    hiddenMegaIndices, parseRows, parseArrayRows, parseSettings, parseSetvars, GYM_REWARD_KEYS, TAG,
} = require('../../injector/modules/dataDrivenAndToggles');
const { RANDOMIZER_SETTINGS, GYM_REWARD, STATIC_ENCOUNTER, ITEM_PICK } = require('../../injector/structLayout');
const { MEGA_TRAINERS } = require('../../constants');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const src = (...parts) => fs.readFileSync(path.resolve(ROOT, ...parts), 'utf8');

const REWARDS_SOURCE = src('src', 'randomizer_rewards.c');
const PICKS_SOURCE = src('src', 'randomizer_picks.c');
const SETTINGS_SOURCE = src('src', 'randomizer_settings.c');
const SIDNEY_SOURCE = src('data', 'maps', 'EverGrandeCity_SidneysRoom', 'scripts.inc');
const MOSSDEEP_SOURCE = src('data', 'maps', 'MossdeepCity_SpaceCenter_2F', 'scripts.inc');

const SOURCES = {
    settingsSource: SETTINGS_SOURCE,
    rewardsSource: REWARDS_SOURCE,
    picksSource: PICKS_SOURCE,
    scriptSources: {
        EverGrandeCity_SidneysRoom_EventScript_InitRunAndBun: SIDNEY_SOURCE,
        MossdeepCity_SpaceCenter_2F_OnTransition: MOSSDEEP_SOURCE,
    },
};

function setup(data = {}) {
    const base = buildSyntheticBase({ dataDriven: true });
    const ctx = buildInjectionContext({ rom: base.rom, offsetMap: base.offsetMap, data });
    return { ...base, ctx };
}

const at = (base, symbol) => base.offsetMap.offsetOf(symbol);
const reward = (base, i, field) => base.rom.readU16(at(base, 'gGymRewards') + i * GYM_REWARD.stride + GYM_REWARD[field]);
const staticAt = (base, i, field) =>
    base.rom.readU16(at(base, 'gStaticEncounters') + i * STATIC_ENCOUNTER.stride + STATIC_ENCOUNTER[field]);
const pick = (base, index, slot) =>
    base.rom.readU16(at(base, 'gItemPicks') + index * ITEM_PICK.stride + ITEM_PICK.items + slot * 2);

describe('gRandomizerSettings (T-234)', () => {
    test('writes the four values the writers produce from config', () => {
        const base = setup({ config: { money: { normal: 500, boss: 6000, gym: 9000 }, moveRelearnPrice: 0 } });
        injectSettings(base.ctx, SOURCES);

        const settings = at(base, 'gRandomizerSettings');
        expect(base.rom.readU32(settings + RANDOMIZER_SETTINGS.trainerMoneyNormal)).toBe(500);
        expect(base.rom.readU32(settings + RANDOMIZER_SETTINGS.trainerMoneyBoss)).toBe(6000);
        expect(base.rom.readU32(settings + RANDOMIZER_SETTINGS.trainerMoneyGym)).toBe(9000);
        expect(base.rom.readU32(settings + RANDOMIZER_SETTINGS.moveRelearnerCost)).toBe(0);
    });

    test('an absent or invalid value lands on the writer’s default, not on zero', () => {
        const base = setup({ config: { money: { normal: -5 } } });
        injectSettings(base.ctx, SOURCES);

        const settings = at(base, 'gRandomizerSettings');
        expect(base.rom.readU32(settings + RANDOMIZER_SETTINGS.trainerMoneyNormal)).toBe(250);
        expect(base.rom.readU32(settings + RANDOMIZER_SETTINGS.trainerMoneyBoss)).toBe(3000);
        expect(base.rom.readU32(settings + RANDOMIZER_SETTINGS.moveRelearnerCost)).toBe(250);
    });

    test('a base whose settings are not the committed defaults is refused', () => {
        const base = setup({ config: {} });
        base.rom.buffer.writeUInt32LE(999, at(base, 'gRandomizerSettings'));

        expect(() => injectSettings(base.ctx, SOURCES)).toThrow(/gRandomizerSettings does not hold/);
    });

    test('the committed source really holds the four fields', () => {
        expect(parseSettings(SETTINGS_SOURCE)).toEqual([250, 3000, 5000, 250]);
    });
});

describe('gGymRewards + gStaticEncounters (T-235)', () => {
    const wild = {
        gymRewards: Object.fromEntries(GYM_REWARD_KEYS.map((key, i) => [key, {
            id: 'SPECIES_ZIGZAGOON',
            megaStone: i === 2 ? 'ITEM_VENUSAURITE' : (i === 8 ? 'ITEM_CHARIZARDITE_X' : 'ITEM_BLASTOISINITE'),
        }])),
        staticRewards: { regirock: { id: 'SPECIES_KARTANA' }, mew: { id: 'SPECIES_LINOONE' } },
    };

    test('writes eleven rewards, with a held item only where the compile path gives one', () => {
        const base = setup({ wild, pokedex: { pokes: [] } });
        injectRewards(base.ctx, SOURCES);

        expect(reward(base, 0, 'species')).toBe(constants.require('SPECIES_ZIGZAGOON'));
        expect(reward(base, 0, 'item')).toBe(constants.require('ITEM_NONE'));
        expect(reward(base, 2, 'item')).toBe(constants.require('ITEM_VENUSAURITE'));
        expect(reward(base, 8, 'item')).toBe(constants.require('ITEM_CHARIZARDITE_X'));
        expect(reward(base, 9, 'item')).toBe(constants.require('ITEM_BLASTOISINITE'));
        expect(reward(base, 10, 'item')).toBe(constants.require('ITEM_NONE'));
    });

    test('static encounters take the run’s species and keep the fixed levels', () => {
        const base = setup({ wild, pokedex: { pokes: [] } });
        injectRewards(base.ctx, SOURCES);

        expect(staticAt(base, 0, 'species')).toBe(constants.require('SPECIES_KARTANA'));
        expect(staticAt(base, 0, 'level')).toBe(36);
        expect(staticAt(base, 3, 'species')).toBe(constants.require('SPECIES_LINOONE'));   // Mew's slot
        expect(staticAt(base, 3, 'level')).toBe(39);
        // An encounter the run does not name keeps the vanilla species.
        expect(staticAt(base, 1, 'species')).toBe(constants.require('SPECIES_REGICE'));
        expect(staticAt(base, 4, 'species')).toBe(constants.require('SPECIES_NONE'));
    });

    test('a bundle with no wild artifact leaves both tables alone', () => {
        const base = setup({});
        const result = injectRewards(base.ctx, SOURCES);

        expect(result).toEqual({ rewards: 0, statics: 0 });
        expect(base.rom.journal).toHaveLength(0);
    });

    test('a base whose reward table is not the committed one is refused', () => {
        const base = setup({ wild, pokedex: { pokes: [] } });
        base.rom.buffer.writeUInt16LE(7, at(base, 'gGymRewards'));

        expect(() => injectRewards(base.ctx, SOURCES)).toThrow(/gGymRewards does not hold/);
    });
});

describe('gItemPicks + gMegaTrainerHidden (T-236)', () => {
    const itemAssignments = {
        petalburgPlates: ['Splash Plate', 'Draco Plate'],
        route104Gems: 'Fire Gem',
    };
    const allAssignments = () => {
        const { PICK_TABLE } = require('../../itemRandomizer');
        return Object.fromEntries(PICK_TABLE.map(([, key]) => [key, itemAssignments[key] || 'Potion']));
    };

    test('writes each pick at its PICK_* index, with unused slots left at ITEM_NONE', () => {
        const base = setup({ trainers: { itemAssignments: allAssignments() } });
        injectPicks(base.ctx, SOURCES);

        const plates = constants.require('PICK_PETALBURG_PLATES');
        expect(pick(base, plates, 0)).toBe(constants.require('ITEM_SPLASH_PLATE'));
        expect(pick(base, plates, 1)).toBe(constants.require('ITEM_DRACO_PLATE'));
        expect(pick(base, plates, 2)).toBe(constants.require('ITEM_NONE'));
        expect(pick(base, constants.require('PICK_ROUTE104_GEMS'), 0)).toBe(constants.require('ITEM_FIRE_GEM'));
    });

    test('the 24 STATIC TM picks are left exactly as the base has them', () => {
        // GATE-3 caught this: those entries live after the @ITEM_PICKS_END anchor, so the writer never
        // regenerates them. An injector that rewrote the whole table would wipe every TM pick location.
        const base = setup({ trainers: { itemAssignments: allAssignments() } });
        const before = base.rom.readBytes(at(base, 'gItemPicks'), constants.require('PICK_COUNT') * ITEM_PICK.stride);
        injectPicks(base.ctx, SOURCES);

        const after = base.rom.readBytes(at(base, 'gItemPicks'), constants.require('PICK_COUNT') * ITEM_PICK.stride);
        const emitted = new Set(require('../../itemRandomizer').PICK_TABLE.map(([name]) => constants.require(name)));
        for (let index = 0; index < constants.require('PICK_COUNT'); index++) {
            if (emitted.has(index)) continue;
            const slice = (buf) => buf.subarray(index * ITEM_PICK.stride, (index + 1) * ITEM_PICK.stride);
            expect(slice(after)).toEqual(slice(before));
        }
        // …and no write touched them.
        for (const entry of base.rom.journal.filter(e => /itemPicks/.test(e.tag))) {
            expect(emitted.has(Math.floor((entry.offset - at(base, 'gItemPicks')) / ITEM_PICK.stride))).toBe(true);
        }
    });

    test('hides exactly the mega trainers writer.js would hide', () => {
        // Two megas available at levels 20 and 60 against three trainers at 25/30/10: the first takes
        // the level-20 stone, the second the level-60 one? No — 60 > 30, so it is hidden, and so is the
        // third. The loop takes from the sorted queue and hides whenever the next stone is too high.
        const data = {
            wild: { foundMegaEvos: [{ level: 60 }, { level: 20 }] },
            trainers: {
                trainersData: MEGA_TRAINERS.map((mega, i) => ({ id: mega.trainer, level: [25, 30, 10][i] ?? 5 })),
            },
        };
        const hidden = hiddenMegaIndices(data);

        expect(hidden).not.toContain(0);            // trainer 1 (level 25) gets the level-20 mega
        expect(hidden).toContain(1);                // trainer 2 (level 30) — the next stone needs 60
        expect(hidden).toContain(2);
        expect(hidden).toHaveLength(MEGA_TRAINERS.length - 1);
    });

    test('writes the hidden flags as one byte per mega trainer', () => {
        const base = setup({
            wild: { foundMegaEvos: [{ level: 20 }] },
            trainers: { trainersData: MEGA_TRAINERS.map(mega => ({ id: mega.trainer, level: 25 })) },
        });
        injectPicks(base.ctx, SOURCES);

        const flags = base.rom.readBytes(at(base, 'gMegaTrainerHidden'), MEGA_TRAINERS.length);
        expect(flags[0]).toBe(0);                                   // took the only stone
        expect(flags.subarray(1).every(byte => byte === 1)).toBe(true);
    });

    test('a mega trainer with no trainer in the artifact throws rather than guessing', () => {
        expect(() => hiddenMegaIndices({ wild: { foundMegaEvos: [] }, trainers: { trainersData: [] } }))
            .toThrow(/no trainer/);
    });
});

describe('the Group-D toggles', () => {
    const operandOf = (base, label, varName) => {
        const { findSetvarOperand } = require('../../injector/scriptPatch');
        return findSetvarOperand(base.rom, { at: at(base, label), var: varName, limit: 64 });
    };

    test('flips the Run & Bun mode and quotas inside the compiled script', () => {
        const base = setup({ config: { battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 50 } });
        injectToggles(base.ctx, SOURCES);

        const label = 'EverGrandeCity_SidneysRoom_EventScript_InitRunAndBun';
        expect(base.rom.readU16(operandOf(base, label, 'VAR_RUNANDBUN_MODE'))).toBe(1);
        expect(base.rom.readU16(operandOf(base, label, 'VAR_RUNANDBUN_SINGLES_LEFT'))).toBe(2);
        expect(base.rom.readU16(operandOf(base, label, 'VAR_RUNANDBUN_DOUBLES_LEFT'))).toBe(2);
    });

    test('leaves the base values in place when the feature is off', () => {
        const base = setup({ config: {} });
        injectToggles(base.ctx, SOURCES);

        const label = 'EverGrandeCity_SidneysRoom_EventScript_InitRunAndBun';
        expect(base.rom.readU16(operandOf(base, label, 'VAR_RUNANDBUN_MODE'))).toBe(0);
        expect(base.rom.readU16(operandOf(base, label, 'VAR_RUNANDBUN_SINGLES_LEFT'))).toBe(4);
    });

    test('flips the Steven tag gate', () => {
        const base = setup({ config: { disableStevenTagBattle: true } });
        injectToggles(base.ctx, SOURCES);

        expect(base.rom.readU16(operandOf(base, 'MossdeepCity_SpaceCenter_2F_OnTransition', 'VAR_DISABLE_STEVEN_TAG_BATTLE')))
            .toBe(1);
    });

    test('every write lands on a setvar immediate, never on the opcode or the var id', () => {
        const base = setup({ config: { disableStevenTagBattle: true } });
        injectToggles(base.ctx, SOURCES);

        for (const entry of base.rom.journal) {
            expect(entry.length).toBe(2);
            expect(base.rom.buffer[entry.offset - 3]).toBe(0x16);    // the setvar opcode
        }
    });

    test('a base whose script holds a different immediate is refused (wrong label or build)', () => {
        const base = setup({ config: { disableStevenTagBattle: true } });
        const operand = operandOf(base, 'MossdeepCity_SpaceCenter_2F_OnTransition', 'VAR_DISABLE_STEVEN_TAG_BATTLE');
        base.rom.buffer.writeUInt16LE(7, operand);

        expect(() => injectToggles(base.ctx, SOURCES)).toThrow(/expected 0 in the base, found 7/);
    });

    test('a base map without the local script label is refused, naming the .sym', () => {
        const base = setup({ config: {} });
        delete base.offsetMap.symbols.MossdeepCity_SpaceCenter_2F_OnTransition;

        expect(() => injectToggles(base.ctx, SOURCES)).toThrow(/MossdeepCity_SpaceCenter_2F_OnTransition[\s\S]*sym/);
    });

    test('the committed scripts still declare the four toggles', () => {
        const sidney = parseSetvars(SIDNEY_SOURCE);
        expect([...sidney.keys()]).toEqual(expect.arrayContaining([
            'VAR_RUNANDBUN_MODE', 'VAR_RUNANDBUN_SINGLES_LEFT', 'VAR_RUNANDBUN_DOUBLES_LEFT']));
        expect(parseSetvars(MOSSDEEP_SOURCE).get('VAR_DISABLE_STEVEN_TAG_BATTLE')).toBe(0);
    });
});

describe('parsing the committed sources', () => {
    test('the four anchored tables have the row counts their headers declare', () => {
        expect(parseRows(REWARDS_SOURCE, '// @GYM_REWARDS_START', '// @GYM_REWARDS_END', 'x'))
            .toHaveLength(constants.require('GYM_REWARD_COUNT'));
        expect(parseRows(REWARDS_SOURCE, '// @STATIC_ENCOUNTERS_START', '// @STATIC_ENCOUNTERS_END', 'x'))
            .toHaveLength(constants.require('STATIC_ENCOUNTER_COUNT'));
        expect(parseRows(PICKS_SOURCE, '// @MEGA_HIDDEN_START', '// @MEGA_HIDDEN_END', 'x'))
            .toHaveLength(constants.require('MEGA_TRAINER_COUNT'));
        // The anchors hold only the locations the writer emits; the array itself has all 53, because
        // the static TM picks are declared past @ITEM_PICKS_END.
        expect(parseRows(PICKS_SOURCE, '// @ITEM_PICKS_START', '// @ITEM_PICKS_END', 'x'))
            .toHaveLength(require('../../itemRandomizer').PICK_TABLE.length);
        expect(parseArrayRows(PICKS_SOURCE, 'gItemPicks', 'x')).toHaveLength(constants.require('PICK_COUNT'));
    });

    test('a row shape the parser does not know is refused', () => {
        const broken = REWARDS_SOURCE.replace('[GYM_REWARD_RUSTBORO]          = { SPECIES_NONE, ITEM_NONE },',
            'SOMETHING_ELSE(0),');
        expect(() => parseRows(broken, '// @GYM_REWARDS_START', '// @GYM_REWARDS_END', 'gym reward'))
            .toThrow(/SOMETHING_ELSE/);
    });
});

describe('the module as the registry calls it', () => {
    test('runs every sub-writer in one pass', () => {
        const base = buildSyntheticBase({ dataDriven: true });
        const result = applyDataDrivenAndToggles({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: {
                config: { money: { normal: 400 }, disableStevenTagBattle: true },
                wild: {
                    gymRewards: Object.fromEntries(GYM_REWARD_KEYS.map(key => [key, { id: 'SPECIES_ZIGZAGOON' }])),
                    staticRewards: {},
                    foundMegaEvos: [],
                },
                trainers: { trainersData: MEGA_TRAINERS.map(m => ({ id: m.trainer, level: 30 })) },
                pokedex: { pokes: [] },
            },
            sources: SOURCES,
        });

        expect(result.settings[0]).toBe(400);
        expect(result.rewards).toBe(11);
        expect(result.statics).toBe(7);
        expect(result.hiddenMegas).toBe(MEGA_TRAINERS.length);   // no megas found → every trainer hidden
        expect(result.toggles).toBe(4);
        expect(base.rom.journal.every(entry => entry.tag.startsWith(TAG))).toBe(true);
    });

    test('a base without the tables and a bundle with nothing to write is a no-op', () => {
        const base = buildSyntheticBase({});
        const result = applyDataDrivenAndToggles({ rom: base.rom, offsetMap: base.offsetMap, data: {} });

        expect(result.toggles).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('but a bundle WITH data and no tables is refused', () => {
        const base = buildSyntheticBase({});
        expect(() => applyDataDrivenAndToggles({
            rom: base.rom, offsetMap: base.offsetMap, data: { config: { money: { normal: 1 } } },
        })).toThrow(/gRandomizerSettings/);
    });
});
