// T-241 — the JS port of the parts of tools/trainerproc that decide bytes.
//
// The compile path for a trainer team is TWO tools: writer.js rewrites the team TEXT of a `.party`
// file, and trainerproc turns that text into `struct TrainerMon` initializers. The injector has to
// reproduce the second half exactly, so this file pins it against the tool's own source
// (`fprint_species` / `fprint_constant` / the party emitter in tools/trainerproc/main.c) — and, at the
// end, against the base's real 860-trainer file.
const fs = require('fs');
const path = require('path');
const {
    parsePartyFile, speciesConstant, nameConstant, encodeTrainerMon, encodeParty, packIvs, TRAINERPROC_DEFAULTS,
} = require('../../injector/partyFile');
const { TRAINER_MON } = require('../../injector/structLayout');
const { loadGameConstants } = require('../../injector/gameConstants');
const { TRAINER_PARTY_CAPACITY } = require('../../layout');

const constants = loadGameConstants({ root: path.resolve(__dirname, '..', '..', '..') });

describe('names become constants the way trainerproc prints them', () => {
    // fprint_species: A-Z0-9 kept, a-z upcased, `'`/`%`/`’` dropped, ♂→_M, ♀→_F, é→E, and any run of
    // anything else collapses to ONE underscore (the `underscore` flag), with none emitted at the end.
    test.each([
        ['Bulbasaur', 'SPECIES_BULBASAUR'],
        ['Mr. Mime', 'SPECIES_MR_MIME'],
        ['Nidoran♀', 'SPECIES_NIDORAN_F'],
        ['Nidoran♂', 'SPECIES_NIDORAN_M'],
        ['Farfetch’d', 'SPECIES_FARFETCHD'],
        ["Farfetch'd", 'SPECIES_FARFETCHD'],
        ['Flabébé', 'SPECIES_FLABEBE'],
        ['Ho-Oh', 'SPECIES_HO_OH'],
        ['Porygon-Z', 'SPECIES_PORYGON_Z'],
        ['Type: Null', 'SPECIES_TYPE_NULL'],
        ['SPECIES_ZIGZAGOON', 'SPECIES_ZIGZAGOON'],       // already a constant: no second prefix
        ['', 'SPECIES_NONE'],
    ])('%s → %s', (name, expected) => expect(speciesConstant(name)).toBe(expected));

    // fprint_constant does NOT collapse: every non-alphanumeric character becomes its own underscore.
    test.each([
        ['Choice Scarf', 'ITEM', 'ITEM_CHOICE_SCARF'],
        ["King's Rock", 'ITEM', 'ITEM_KINGS_ROCK'],
        ['Never-Melt Ice', 'ITEM', 'ITEM_NEVER_MELT_ICE'],
        ['ITEM_ORAN_BERRY', 'ITEM', 'ITEM_ORAN_BERRY'],
        ['Will-O-Wisp', 'MOVE', 'MOVE_WILL_O_WISP'],
        ['BEAST_BOOST', 'ABILITY', 'ABILITY_BEAST_BOOST'],
        ['Impish', 'NATURE', 'NATURE_IMPISH'],
        ['', 'ITEM', 'ITEM_NONE'],
    ])('%s → %s', (name, prefix, expected) => expect(nameConstant(prefix, name)).toBe(expected));

    test('a separator run collapses for a species but not for an item', () => {
        // Three separators (`.`, ` `, ` `): one underscore as a species, three as an item.
        expect(speciesConstant('Mr.  Mime')).toBe('SPECIES_MR_MIME');
        expect(nameConstant('ITEM', 'Mr.  Mime')).toBe('ITEM_MR___MIME');
    });
});

describe('IVs pack the way TRAINER_PARTY_IVS does', () => {
    // #define TRAINER_PARTY_IVS(hp, atk, def, speed, spatk, spdef) — note SPEED is the 4th argument,
    // and trainerproc prints stats in that order (fprint_stats).
    test('each stat gets its own 5-bit field, speed before the specials', () => {
        expect(packIvs({ hp: 1, atk: 2, def: 3, spa: 4, spd: 5, spe: 6 }))
            .toBe(1 | (2 << 5) | (3 << 10) | (6 << 15) | (4 << 20) | (5 << 25));
    });

    test('all 31s is the base default', () => {
        expect(packIvs({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 })).toBe(0x3fffffff);
    });
});

describe('parsing a .party file', () => {
    const SOURCE = [
        '=== TRAINER_SAWYER_1 ===',
        'Name: SAWYER',
        'Class: Hiker',
        'Pic: Hiker',
        'Gender: Male',
        'Music: Hiker',
        'Double Battle: No',
        'AI: AI_FLAG_SMART_TRAINER',
        '',
        'Geodude',
        'Level: 21',
        'IVs: 0 HP / 0 Atk / 0 Def / 0 SpA / 0 SpD / 0 Spe',
        '',
        '=== TRAINER_DAREJAN ===',
        'Name: DAREJAN',
        'Class: Fisherman',
        'Pic: Fisherman',
        'Double Battle: Yes',
        '',
        'Kartana @ Choice Scarf',
        'Ability: BEAST_BOOST',
        'Level: 56',
        'Nature: Impish',
        'IVs: 26 HP / 26 Atk / 26 Def / 26 SpA / 26 SpD / 26 Spe',
        '- Giga Drain',
        '- Aerial Ace',
        '',
    ].join('\n');

    test('reads each trainer, its mons and the fields trainerproc emits', () => {
        const parsed = parsePartyFile(SOURCE);
        expect([...parsed.keys()]).toEqual(['TRAINER_SAWYER_1', 'TRAINER_DAREJAN']);

        const sawyer = parsed.get('TRAINER_SAWYER_1');
        expect(sawyer.doubleBattle).toBe(false);
        expect(sawyer.mons).toEqual([{
            species: 'Geodude', item: null, ability: null, nature: null, level: 21,
            ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, moves: [],
        }]);

        const darejan = parsed.get('TRAINER_DAREJAN');
        expect(darejan.doubleBattle).toBe(true);
        expect(darejan.mons[0]).toMatchObject({
            species: 'Kartana', item: 'Choice Scarf', ability: 'BEAST_BOOST', nature: 'Impish', level: 56,
            moves: ['Giga Drain', 'Aerial Ace'],
        });
    });

    test('a trainer with no mons is still a trainer (TRAINER_NONE / PARTNER_NONE)', () => {
        const parsed = parsePartyFile('=== PARTNER_NONE ===\nName:\nClass: Pkmn Trainer 1\nPic: Brendan\n');
        expect(parsed.get('PARTNER_NONE').mons).toEqual([]);
    });

    test('a missing Level or IVs line takes trainerproc’s file defaults (level 100, 31s)', () => {
        const parsed = parsePartyFile('=== TRAINER_X ===\nName: X\n\nZigzagoon\n- Tackle\n');
        expect(parsed.get('TRAINER_X').mons[0]).toMatchObject({
            level: 100, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        });
    });

    test('a mon line key the port does not know is refused, not ignored', () => {
        const source = '=== TRAINER_X ===\nName: X\n\nZigzagoon\nLevel: 5\nShiny: Yes\n';
        expect(() => parsePartyFile(source)).toThrow(/TRAINER_X[\s\S]*Shiny/);
    });
});

describe('encoding a struct TrainerMon', () => {
    const encode = (mon) => encodeTrainerMon(constants, mon, 'TRAINER_X');
    const MON = {
        species: 'Kartana', item: 'Choice Scarf', ability: 'BEAST_BOOST', nature: 'Impish', level: 56,
        ivs: { hp: 26, atk: 26, def: 26, spa: 26, spd: 26, spe: 26 }, moves: ['Giga Drain', 'Cut'],
    };

    test('is 36 bytes and puts every field where struct TrainerMon has it', () => {
        const buf = encode(MON);
        expect(buf).toHaveLength(TRAINER_MON.stride);
        expect(buf.readUInt16LE(TRAINER_MON.species)).toBe(constants.require('SPECIES_KARTANA'));
        expect(buf.readUInt16LE(TRAINER_MON.heldItem)).toBe(constants.require('ITEM_CHOICE_SCARF'));
        expect(buf.readUInt16LE(TRAINER_MON.ability)).toBe(constants.require('ABILITY_BEAST_BOOST'));
        expect(buf.readUInt8(TRAINER_MON.lvl)).toBe(56);
        expect(buf.readUInt32LE(TRAINER_MON.iv)).toBe(packIvs(MON.ivs));
        expect(buf.readUInt16LE(TRAINER_MON.moves)).toBe(constants.require('MOVE_GIGA_DRAIN'));
        expect(buf.readUInt16LE(TRAINER_MON.moves + 2)).toBe(constants.require('MOVE_CUT'));
        expect(buf.readUInt16LE(TRAINER_MON.moves + 4)).toBe(0);
    });

    test('fields the writer never emits take trainerproc’s defaults, not the base’s values', () => {
        const buf = encode(MON);
        expect(buf.readUInt32LE(TRAINER_MON.nickname)).toBe(0);
        expect(buf.readUInt32LE(TRAINER_MON.ev)).toBe(0);
        expect(buf.readUInt8(TRAINER_MON.ball)).toBe(0);
        expect(buf.readUInt8(TRAINER_MON.friendship)).toBe(0);
        expect(buf.readUInt32LE(TRAINER_MON.tags)).toBe(0);
        // nature:5 | gender:2 | isShiny:1 — gender is TRAINER_MON_RANDOM_GENDER (3), never 0.
        expect(buf.readUInt8(TRAINER_MON.natureGenderShiny))
            .toBe(constants.require('NATURE_IMPISH') | (constants.require('TRAINER_MON_RANDOM_GENDER') << 5));
        // teraType:5 | gigantamaxFactor:1 | shouldUseDynamax:1 | padding — all zero for a written team.
        expect(buf.readUInt8(TRAINER_MON.teraDynamax)).toBe(0);
        // dynamaxLevel:4 defaults to MAX_DYNAMAX_LEVEL even though no team ever asks for it.
        expect(buf.readUInt8(TRAINER_MON.dynamaxLevel)).toBe(constants.require('MAX_DYNAMAX_LEVEL'));
    });

    test('no ability / no nature / no item are the tool’s "absent" values', () => {
        const buf = encode({ ...MON, item: null, ability: null, nature: null });
        expect(buf.readUInt16LE(TRAINER_MON.heldItem)).toBe(0);
        expect(buf.readUInt16LE(TRAINER_MON.ability)).toBe(0);
        expect(buf.readUInt8(TRAINER_MON.natureGenderShiny) & 0x1f).toBe(constants.require('NATURE_HARDY'));
    });

    test('a name the base has no constant for throws, naming the trainer', () => {
        expect(() => encode({ ...MON, species: 'Notamon' })).toThrow(/TRAINER_X[\s\S]*SPECIES_NOTAMON/);
    });

    test('a party is written at the full capacity, so a shorter team leaves nothing behind', () => {
        const party = encodeParty(constants, [MON], 'TRAINER_X', TRAINER_PARTY_CAPACITY);
        expect(party).toHaveLength(TRAINER_PARTY_CAPACITY * TRAINER_MON.stride);
        expect(party.subarray(TRAINER_MON.stride).every(b => b === 0)).toBe(true);
    });

    test('a team longer than the capacity throws rather than spilling into the next party', () => {
        const team = Array(TRAINER_PARTY_CAPACITY + 1).fill(MON);
        expect(() => encodeParty(constants, team, 'TRAINER_X', TRAINER_PARTY_CAPACITY))
            .toThrow(new RegExp(`TRAINER_X[\\s\\S]*${TRAINER_PARTY_CAPACITY}`));
    });
});

describe('the committed base .party files', () => {
    const read = (f) => fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'src', 'data', f), 'utf8');

    test('parse completely — 860 trainers and 2 battle partners', () => {
        const trainers = parsePartyFile(read('trainers.party'));
        const partners = parsePartyFile(read('battle_partners.party'));
        expect(trainers.size).toBe(860);
        expect(partners.size).toBe(2);
        expect(trainers.get('TRAINER_SAWYER_1').mons[0].species).toBe('Geodude');
        expect(partners.get('PARTNER_STEVEN').mons).toHaveLength(3);
    });

    test('every mon of every base trainer encodes — the port covers the real corpus of names', () => {
        const trainers = parsePartyFile(read('trainers.party'));
        let mons = 0;
        for (const [id, trainer] of trainers) {
            for (const mon of trainer.mons) { encodeTrainerMon(constants, mon, id); mons += 1; }
        }
        expect(mons).toBe(1808);
    });

    test('TRAINERPROC_DEFAULTS are read from the base, never re-typed here', () => {
        expect(TRAINERPROC_DEFAULTS.level).toBe(100);
        expect(TRAINERPROC_DEFAULTS.iv).toBe(31);
    });
});
