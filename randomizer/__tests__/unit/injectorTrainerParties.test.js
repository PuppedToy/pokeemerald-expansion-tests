// T-241 — the `trainer-parties` registry entry: trainer teams, battle partners, and the battle format.
//
// The compile path is writer.js (rewrites the team TEXT of a .party file) followed by trainerproc
// (turns that text into struct TrainerMon initializers). This module mirrors both, and the rules that
// decide GATE-3 are the writer's: only the trainers the bundle names are rewritten, the whole team
// block is replaced (so a field the writer does not emit takes trainerproc's default, NOT the base's
// value), and the header's `Double Battle:` line is rewritten from the effective battle type — except
// for partners, whose header the writer leaves alone.
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const { injectTrainerParties, applyTrainerParties, TAG } = require('../../injector/modules/trainerParties');
const { TRAINER, TRAINER_MON } = require('../../injector/structLayout');
const { TRAINER_PARTY_CAPACITY } = require('../../layout');

const GEODUDE = { species: 'Geodude', item: null, ability: null, nature: null, level: 21, ivs: iv(0), moves: [] };

function iv(value) {
    return { hp: value, atk: value, def: value, spa: value, spd: value, spe: value };
}

/** The base `.party` text for a set of trainers, in the shape the real files use. */
function partySource(trainers) {
    return Object.entries(trainers).map(([id, spec]) => [
        `=== ${id} ===`,
        `Name: ${id.replace(/^(TRAINER|PARTNER)_/, '')}`,
        'Class: Hiker',
        'Pic: Hiker',
        `Double Battle: ${spec.doubleBattle ? 'Yes' : 'No'}`,
        '',
        ...(spec.mons || []).flatMap(mon => [
            mon.item ? `${mon.species} @ ${mon.item}` : mon.species,
            ...(mon.ability ? [`Ability: ${mon.ability}`] : []),
            `Level: ${mon.level}`,
            ...(mon.nature ? [`Nature: ${mon.nature}`] : []),
            `IVs: ${mon.ivs.hp} HP / ${mon.ivs.atk} Atk / ${mon.ivs.def} Def / ${mon.ivs.spa} SpA / ${mon.ivs.spd} SpD / ${mon.ivs.spe} Spe`,
            ...(mon.moves || []).map(move => `- ${move}`),
            '',
        ]),
    ].join('\n')).join('\n');
}

/** A docs entry as `buildTrainersResultsFromDocs` would hand it over. */
function docsTrainer({ level = 30, team = [], battleType = 'singles', isPartner = false } = {}) {
    return { level, battleType, isPartner, class: 'Hiker', reward: [], team };
}

const member = (pokemon, extra = {}) => ({
    pokemon, item: null, ability: null, nature: null, ivs: iv(20), moves: [], ...extra,
});

function setup({ trainers = {}, partners = null, docsTrainers = {}, pokes = null, moves = null } = {}) {
    const base = buildSyntheticBase({ trainers, ...(partners ? { partners } : {}) });
    const data = {
        pokedex: {
            pokes: pokes || [
                { id: 'SPECIES_ZIGZAGOON', name: 'Zigzagoon' },
                { id: 'SPECIES_KARTANA', name: 'Kartana' },
                { id: 'SPECIES_NIDORAN_F', name: 'Nidoran♀' },
            ],
            moves: moves || { MOVE_TACKLE: { name: 'Tackle' }, MOVE_GIGA_DRAIN: { name: 'Giga Drain' } },
        },
        docs: { trainersResultsSimplified: docsTrainers },
    };
    const ctx = buildInjectionContext({ rom: base.rom, offsetMap: base.offsetMap, data });
    return {
        ...base,
        ctx,
        sources: { trainersSource: partySource(trainers), partnersSource: partySource(partners || {}) },
    };
}

const trainerAt = (base, id, symbol = 'gTrainers', count = 'TRAINERS_COUNT') =>
    base.offsetMap.offsetOf(symbol)
    + (constants.require('DIFFICULTY_NORMAL') * constants.require(count) + constants.require(id)) * TRAINER.stride;

const partyOf = (base, id, symbol, count) => base.rom.readPointer(trainerAt(base, id, symbol, count) + TRAINER.party);
const monAt = (base, id, index, symbol, count) => partyOf(base, id, symbol, count) + index * TRAINER_MON.stride;
const field = (base, offset, size = 2) => (size === 1 ? base.rom.readU8(offset) : base.rom.readU16(offset));

describe('writing a team', () => {
    const BASE_TRAINERS = { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } };

    test('writes species, item, ability, level, nature, IVs and moves of each mon', () => {
        const base = setup({
            trainers: BASE_TRAINERS,
            docsTrainers: {
                TRAINER_SAWYER_1: docsTrainer({
                    level: 44,
                    team: [member('SPECIES_KARTANA', {
                        item: 'Choice Scarf', ability: 'BEAST_BOOST', nature: 'Impish', ivs: iv(26),
                        moves: ['MOVE_GIGA_DRAIN', 'MOVE_TACKLE'],
                    })],
                }),
            },
        });
        injectTrainerParties(base.ctx, base.sources);

        const at = monAt(base, 'TRAINER_SAWYER_1', 0);
        expect(field(base, at + TRAINER_MON.species)).toBe(constants.require('SPECIES_KARTANA'));
        expect(field(base, at + TRAINER_MON.heldItem)).toBe(constants.require('ITEM_CHOICE_SCARF'));
        expect(field(base, at + TRAINER_MON.ability)).toBe(constants.require('ABILITY_BEAST_BOOST'));
        expect(field(base, at + TRAINER_MON.lvl, 1)).toBe(44);
        expect(field(base, at + TRAINER_MON.moves)).toBe(constants.require('MOVE_GIGA_DRAIN'));
        expect(field(base, at + TRAINER_MON.moves + 2)).toBe(constants.require('MOVE_TACKLE'));
        expect(base.rom.readU32(at + TRAINER_MON.iv)).toBe(26 | (26 << 5) | (26 << 10) | (26 << 15) | (26 << 20) | (26 << 25));
    });

    test('a species is resolved through the pokedex NAME, the way the .party text carries it', () => {
        // The writer emits `teamEntry.pokemon.name`, and trainerproc transforms that text — so a
        // display name with a glyph in it (Nidoran♀) is the real round-trip this has to survive.
        const base = setup({
            trainers: BASE_TRAINERS,
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_NIDORAN_F')] }) },
        });
        injectTrainerParties(base.ctx, base.sources);

        expect(field(base, monAt(base, 'TRAINER_SAWYER_1', 0) + TRAINER_MON.species))
            .toBe(constants.require('SPECIES_NIDORAN_F'));
    });

    test('updates partySize and zero-fills the rest of the slot', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE, { ...GEODUDE, species: 'Zigzagoon' }] } },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        injectTrainerParties(base.ctx, base.sources);

        const at = trainerAt(base, 'TRAINER_SAWYER_1');
        expect(base.rom.readU8(at + TRAINER.partySize)).toBe(1);
        const party = base.rom.readBytes(partyOf(base, 'TRAINER_SAWYER_1'), TRAINER_PARTY_CAPACITY * TRAINER_MON.stride);
        expect(party.subarray(TRAINER_MON.stride).every(byte => byte === 0)).toBe(true);
    });

    test('fields the writer never emits take trainerproc’s defaults, not the base mon’s values', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [{ ...GEODUDE, nature: 'Impish' }] } },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        injectTrainerParties(base.ctx, base.sources);

        const at = monAt(base, 'TRAINER_SAWYER_1', 0);
        expect(base.rom.readU8(at + TRAINER_MON.natureGenderShiny) & 0x1f).toBe(constants.require('NATURE_HARDY'));
        expect(base.rom.readU8(at + TRAINER_MON.dynamaxLevel)).toBe(constants.require('MAX_DYNAMAX_LEVEL'));
        expect(base.rom.readU32(at + TRAINER_MON.nickname)).toBe(0);
    });

    test('a trainer the bundle does not name keeps the base’s party byte-for-byte', () => {
        const base = setup({
            trainers: {
                TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] },
                TRAINER_DAREJAN: { doubleBattle: false, mons: [{ ...GEODUDE, species: 'Zigzagoon' }] },
            },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        const before = base.rom.readBytes(partyOf(base, 'TRAINER_DAREJAN'), TRAINER_PARTY_CAPACITY * TRAINER_MON.stride);
        injectTrainerParties(base.ctx, base.sources);

        expect(base.rom.readBytes(partyOf(base, 'TRAINER_DAREJAN'), TRAINER_PARTY_CAPACITY * TRAINER_MON.stride))
            .toEqual(before);
    });

    test('a bundle naming a trainer the .party file does not declare is skipped, as the writer’s regex is', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: { TRAINER_GHOST: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        const result = injectTrainerParties(base.ctx, base.sources);

        expect(result.writes).toBe(0);
        expect(result.unknown).toEqual(['TRAINER_GHOST']);
    });

    test('a team longer than the party capacity throws, naming the trainer', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: {
                TRAINER_SAWYER_1: docsTrainer({
                    team: Array(TRAINER_PARTY_CAPACITY + 1).fill(member('SPECIES_ZIGZAGOON')),
                }),
            },
        });
        expect(() => injectTrainerParties(base.ctx, base.sources))
            .toThrow(new RegExp(`TRAINER_SAWYER_1[\\s\\S]*${TRAINER_PARTY_CAPACITY}`));
    });

    test('poolSize is NEVER written — trainerproc only emits it for a `Party Size:` block', () => {
        // GATE-3, 2026-08-02: writing the team size here differed from compile() on 206 trainers per
        // ROM. The base has 0 everywhere and compile() leaves it there.
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        injectTrainerParties(base.ctx, base.sources);

        expect(base.rom.readU8(trainerAt(base, 'TRAINER_SAWYER_1') + TRAINER.poolSize)).toBe(0);
        expect(base.rom.journal.some(e => /poolSize/.test(e.tag))).toBe(false);
    });

    test('a party write records the pointer it was reached through, for the parity harness', () => {
        // A party is anonymous data, and compile() puts it at a different address than the base does
        // (B-057) — so the gate has to follow each build's own `.party` pointer, not a fixed delta.
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        injectTrainerParties(base.ctx, base.sources);

        const partyWrite = base.rom.journal.find(e => e.tag === `${TAG}:party`);
        expect(partyWrite.via).toEqual({
            symbol: 'gTrainers',
            at: trainerAt(base, 'TRAINER_SAWYER_1') + TRAINER.party,
        });
    });

    test('every write is tagged and lands in gTrainers or its party blob', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        injectTrainerParties(base.ctx, base.sources);

        expect(base.rom.journal).not.toHaveLength(0);
        expect(base.rom.journal.every(entry => entry.tag.startsWith(TAG))).toBe(true);
    });
});

describe('the battle format', () => {
    test('a doubles trainer gets TRAINER_BATTLE_TYPE_DOUBLES in gTrainers', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: {
                TRAINER_SAWYER_1: docsTrainer({
                    battleType: 'doubles',
                    team: [member('SPECIES_ZIGZAGOON'), member('SPECIES_KARTANA')],
                }),
            },
        });
        injectTrainerParties(base.ctx, base.sources);

        expect(base.rom.readU8(trainerAt(base, 'TRAINER_SAWYER_1') + TRAINER.battleType) & 0x3)
            .toBe(constants.require('TRAINER_BATTLE_TYPE_DOUBLES'));
    });

    test('a doubles trainer with a one-mon team is written as singles (T-087’s ≥2-mon rule)', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: true, mons: [GEODUDE] } },
            docsTrainers: {
                TRAINER_SAWYER_1: docsTrainer({ battleType: 'doubles', team: [member('SPECIES_ZIGZAGOON')] }),
            },
        });
        injectTrainerParties(base.ctx, base.sources);

        expect(base.rom.readU8(trainerAt(base, 'TRAINER_SAWYER_1') + TRAINER.battleType) & 0x3)
            .toBe(constants.require('TRAINER_BATTLE_TYPE_SINGLES'));
    });

    test('the startingStatus bits sharing that byte survive', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: {
                TRAINER_SAWYER_1: docsTrainer({
                    battleType: 'doubles', team: [member('SPECIES_ZIGZAGOON'), member('SPECIES_KARTANA')],
                }),
            },
        });
        const at = trainerAt(base, 'TRAINER_SAWYER_1') + TRAINER.battleType;
        base.rom.buffer.writeUInt8(0x14, at);        // startingStatus = 5 in the upper six bits
        injectTrainerParties(base.ctx, base.sources);

        expect(base.rom.readU8(at) >> 2).toBe(5);
        expect(base.rom.readU8(at) & 0x3).toBe(constants.require('TRAINER_BATTLE_TYPE_DOUBLES'));
    });
});

describe('battle partners', () => {
    const PARTNERS = { PARTNER_STEVEN: { doubleBattle: false, mons: [{ ...GEODUDE, species: 'Kartana' }] } };

    test('a partner’s team is written into gBattlePartners', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            partners: PARTNERS,
            docsTrainers: {
                PARTNER_STEVEN: docsTrainer({ isPartner: true, team: [member('SPECIES_ZIGZAGOON')] }),
            },
        });
        injectTrainerParties(base.ctx, base.sources);

        expect(field(base, monAt(base, 'PARTNER_STEVEN', 0, 'gBattlePartners', 'PARTNER_COUNT') + TRAINER_MON.species))
            .toBe(constants.require('SPECIES_ZIGZAGOON'));
    });

    test('a partner’s battle format is left alone — the writer keeps their header', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            partners: { PARTNER_STEVEN: { doubleBattle: true, mons: [{ ...GEODUDE, species: 'Kartana' }] } },
            docsTrainers: {
                PARTNER_STEVEN: docsTrainer({
                    isPartner: true, battleType: 'singles', team: [member('SPECIES_ZIGZAGOON')],
                }),
            },
        });
        injectTrainerParties(base.ctx, base.sources);

        const at = trainerAt(base, 'PARTNER_STEVEN', 'gBattlePartners', 'PARTNER_COUNT');
        expect(base.rom.readU8(at + TRAINER.battleType) & 0x3).toBe(constants.require('TRAINER_BATTLE_TYPE_DOUBLES'));
    });
});

describe('the base has to be the build these .party files came from', () => {
    test('a party whose bytes are not what the base source says is refused, and nothing is written', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        // The ROM holds Geodude; hand the module a source claiming the base had something else.
        const sources = {
            ...base.sources,
            trainersSource: partySource({
                TRAINER_SAWYER_1: { doubleBattle: false, mons: [{ ...GEODUDE, species: 'Kartana' }] },
            }),
        };
        expect(() => injectTrainerParties(base.ctx, sources)).toThrow(/TRAINER_SAWYER_1[\s\S]*same build|does not match/i);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('a partySize that disagrees with the base source is refused too', () => {
        const base = setup({
            trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } },
            docsTrainers: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) },
        });
        base.rom.buffer.writeUInt8(4, trainerAt(base, 'TRAINER_SAWYER_1') + TRAINER.partySize);

        expect(() => injectTrainerParties(base.ctx, base.sources)).toThrow(/TRAINER_SAWYER_1/);
    });

    test('two trainers sharing one party blob is refused before it corrupts the other’s team', () => {
        const base = setup({
            trainers: {
                TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] },
                TRAINER_DAREJAN: { doubleBattle: false, mons: [GEODUDE] },
            },
            docsTrainers: {
                TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }),
                TRAINER_DAREJAN: docsTrainer({ team: [member('SPECIES_KARTANA')] }),
            },
        });
        // Fold the two identical parties onto one address, as a linker merging constants would.
        const shared = partyOf(base, 'TRAINER_SAWYER_1');
        base.rom.buffer.writeUInt32LE(0x08000000 + shared, trainerAt(base, 'TRAINER_DAREJAN') + TRAINER.party);

        expect(() => injectTrainerParties(base.ctx, base.sources))
            .toThrow(/TRAINER_SAWYER_1[\s\S]*TRAINER_DAREJAN|share/i);
    });
});

describe('the module as the registry calls it', () => {
    test('a base that exports no gTrainers and a bundle with no teams write nothing', () => {
        const base = buildSyntheticBase({});
        const result = applyTrainerParties({
            rom: base.rom, offsetMap: base.offsetMap, data: { pokedex: { pokes: [], moves: {} } },
        });

        expect(result.writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('but a bundle WITH teams and no gTrainers is refused, not silently skipped', () => {
        const base = buildSyntheticBase({});
        expect(() => applyTrainerParties({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: {
                pokedex: { pokes: [{ id: 'SPECIES_ZIGZAGOON', name: 'Zigzagoon' }], moves: {} },
                docs: { trainersResultsSimplified: { TRAINER_SAWYER_1: docsTrainer({ team: [member('SPECIES_ZIGZAGOON')] }) } },
            },
        })).toThrow(/gTrainers/);
    });

    test('a bundle with teams but no docs is refused — inject mode has no team resolver', () => {
        const base = buildSyntheticBase({ trainers: { TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } } });
        expect(() => applyTrainerParties({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: { pokedex: { pokes: [], moves: {} } },
            sources: { trainersSource: partySource({ TRAINER_SAWYER_1: { doubleBattle: false, mons: [GEODUDE] } }), partnersSource: '' },
        })).toThrow(/docs/i);
    });
});
