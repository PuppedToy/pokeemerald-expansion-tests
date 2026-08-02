// T-239 — inject gMovesInfo: the move-mutation fields (power / accuracy / type / category).
//
// These four share one 32-bit word with `target` (u16 type:5, category:2, power:9 | accuracy:7,
// target:9), so every write is a read-modify-write and the neighbouring bits MUST survive it. As with
// species, the compile path (randomizer/moveWriter.js editMovesFile) only rewrites a field its move's
// `log` names — an unmutated move, and an unmutated field of a mutated move, stay byte-identical.
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const { injectMoveData } = require('../../injector/modules/moves');
const { MOVE_INFO, readMoveField } = require('../../injector/structLayout');

function setup(moves, { baseMoves = {} } = {}) {
    const base = buildSyntheticBase({
        moves: {
            MOVE_TACKLE:    { power: 40, accuracy: 100, type: 'TYPE_NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL' },
            MOVE_WATER_GUN: { power: 40, accuracy: 100, type: 'TYPE_WATER',  category: 'DAMAGE_CATEGORY_SPECIAL' },
            ...baseMoves,
        },
    });
    const ctx = buildInjectionContext({
        rom: base.rom,
        offsetMap: base.offsetMap,
        data: { pokedex: { moves } },
    });
    return { ...base, ctx };
}

const read = (base, move, field) => readMoveField(base.rom, base.moveAt(move), MOVE_INFO[field], base.ctx.layout.moves.word);

function move(id, over = {}) {
    return {
        id, power: 40, accuracy: 100, type: 'NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL', log: [], ...over,
    };
}

describe('move mutation — only the logged fields', () => {
    test('writes power when the log names it, leaving accuracy/type/category alone', () => {
        const base = setup({
            MOVE_TACKLE: move('MOVE_TACKLE', {
                power: 95, accuracy: 75, type: 'FIRE', category: 'DAMAGE_CATEGORY_SPECIAL',
                log: [{ type: 'BUFF', target: 'power', oldValue: 40 }],
            }),
        });
        injectMoveData(base.ctx);

        expect(read(base, 'MOVE_TACKLE', 'power')).toBe(95);
        expect(read(base, 'MOVE_TACKLE', 'accuracy')).toBe(100);
        expect(read(base, 'MOVE_TACKLE', 'type')).toBe(constants.require('TYPE_NORMAL'));
        expect(read(base, 'MOVE_TACKLE', 'category')).toBe(constants.require('DAMAGE_CATEGORY_PHYSICAL'));
    });

    test('writes every logged field of one move, including the packed type and category', () => {
        const base = setup({
            MOVE_WATER_GUN: move('MOVE_WATER_GUN', {
                power: 110, accuracy: 85, type: 'DRAGON', category: 'DAMAGE_CATEGORY_STATUS',
                log: [{ target: 'power' }, { target: 'accuracy' }, { target: 'type' }, { target: 'category' }],
            }),
        });
        injectMoveData(base.ctx);

        expect(read(base, 'MOVE_WATER_GUN', 'power')).toBe(110);
        expect(read(base, 'MOVE_WATER_GUN', 'accuracy')).toBe(85);
        expect(read(base, 'MOVE_WATER_GUN', 'type')).toBe(constants.require('TYPE_DRAGON'));
        expect(read(base, 'MOVE_WATER_GUN', 'category')).toBe(constants.require('DAMAGE_CATEGORY_STATUS'));
    });

    test('a bundle with no mutated move writes nothing at all (saveMoveData is a no-op then)', () => {
        const base = setup({ MOVE_TACKLE: move('MOVE_TACKLE', { power: 999 }) });
        const { writes } = injectMoveData(base.ctx);

        expect(writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
        expect(read(base, 'MOVE_TACKLE', 'power')).toBe(40);
    });
});

describe('read-modify-write must not disturb the rest of the word', () => {
    test('the neighbouring `target` bits survive a power write', () => {
        const base = setup({
            MOVE_TACKLE: move('MOVE_TACKLE', { power: 120, log: [{ target: 'power' }] }),
        });
        const at = base.moveAt('MOVE_TACKLE') + base.ctx.layout.moves.word;
        const targetValue = 0x1a5;                       // 9 bits of MOVE_TARGET_*
        base.rom.buffer.writeUInt32LE(
            (base.rom.readU32(at) | (targetValue << MOVE_INFO.target.shift)) >>> 0, at);

        injectMoveData(base.ctx);

        expect(read(base, 'MOVE_TACKLE', 'power')).toBe(120);
        expect(read(base, 'MOVE_TACKLE', 'target')).toBe(targetValue);
        expect(read(base, 'MOVE_TACKLE', 'accuracy')).toBe(100);
    });

    test('two fields of the same word may both be written — ownership is per bit', () => {
        const base = setup({
            MOVE_TACKLE: move('MOVE_TACKLE', {
                power: 60, type: 'ICE', log: [{ target: 'power' }, { target: 'type' }],
            }),
        });
        expect(() => injectMoveData(base.ctx)).not.toThrow();
        expect(read(base, 'MOVE_TACKLE', 'power')).toBe(60);
        expect(read(base, 'MOVE_TACKLE', 'type')).toBe(constants.require('TYPE_ICE'));
    });

    test('another move in the same table is untouched', () => {
        const base = setup({
            MOVE_TACKLE: move('MOVE_TACKLE', { power: 60, log: [{ target: 'power' }] }),
            MOVE_WATER_GUN: move('MOVE_WATER_GUN', { power: 40, accuracy: 100, type: 'WATER', category: 'DAMAGE_CATEGORY_SPECIAL' }),
        });
        injectMoveData(base.ctx);
        expect(read(base, 'MOVE_WATER_GUN', 'power')).toBe(40);
        expect(read(base, 'MOVE_WATER_GUN', 'type')).toBe(constants.require('TYPE_WATER'));
    });
});

describe('failure modes', () => {
    test('a move id the base does not define throws naming it', () => {
        const base = setup({ MOVE_NOT_A_MOVE: move('MOVE_NOT_A_MOVE', { log: [{ target: 'power' }] }) });
        expect(() => injectMoveData(base.ctx)).toThrow(/MOVE_NOT_A_MOVE/);
    });

    test('a power beyond the 9-bit field throws instead of wrapping', () => {
        const base = setup({ MOVE_TACKLE: move('MOVE_TACKLE', { power: 600, log: [{ target: 'power' }] }) });
        expect(() => injectMoveData(base.ctx)).toThrow(/MOVE_TACKLE|power|600/);
    });

    test('an accuracy beyond the 7-bit field throws', () => {
        const base = setup({ MOVE_TACKLE: move('MOVE_TACKLE', { accuracy: 200, log: [{ target: 'accuracy' }] }) });
        expect(() => injectMoveData(base.ctx)).toThrow(/MOVE_TACKLE|accuracy|200/);
    });

    test('an unknown type or category name throws rather than writing a wrong id', () => {
        const badType = setup({ MOVE_TACKLE: move('MOVE_TACKLE', { type: 'CHAOS', log: [{ target: 'type' }] }) });
        expect(() => injectMoveData(badType.ctx)).toThrow(/TYPE_CHAOS/);

        const badCategory = setup({ MOVE_TACKLE: move('MOVE_TACKLE', { category: 'DAMAGE_CATEGORY_WEIRD', log: [{ target: 'category' }] }) });
        expect(() => injectMoveData(badCategory.ctx)).toThrow(/DAMAGE_CATEGORY_WEIRD/);
    });

    test('tags every write with this module', () => {
        const base = setup({ MOVE_TACKLE: move('MOVE_TACKLE', { power: 50, log: [{ target: 'power' }] }) });
        injectMoveData(base.ctx);
        expect(base.rom.journal.every(e => /move/i.test(e.tag))).toBe(true);
    });
});
