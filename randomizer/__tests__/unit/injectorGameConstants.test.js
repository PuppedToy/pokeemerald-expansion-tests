// T-239 — the bundle speaks names (SPECIES_BULBASAUR, MOVE_POUND, ITEM_TM01) and the ROM speaks
// numbers. Those numbers live in exactly one place — the base's own `include/constants/*.h` — so they
// are read from there, never re-typed into JS (same rule as offsets coming from the `.map`).
const path = require('path');
const {
    parseConstantHeader,
    ConstantTable,
    loadGameConstants,
} = require('../../injector/gameConstants');

const ROOT = path.resolve(__dirname, '..', '..', '..');

describe('parseConstantHeader', () => {
    test('reads plain decimal and hex values, ignoring comments', () => {
        const defs = parseConstantHeader([
            '#ifndef GUARD_X',
            '#define SPECIES_NONE 0',
            '#define SPECIES_BULBASAUR                               1   // first',
            '#define EVOLUTIONS_END 0xFFFF /* sentinel */',
            '#endif',
        ].join('\n'));
        const table = new ConstantTable(defs);
        expect(table.require('SPECIES_NONE')).toBe(0);
        expect(table.require('SPECIES_BULBASAUR')).toBe(1);
        expect(table.require('EVOLUTIONS_END')).toBe(0xffff);
    });

    test('follows alias chains', () => {
        const table = new ConstantTable(parseConstantHeader([
            '#define MOVE_DOUBLE_SLAP 3',
            '#define MOVE_DOUBLESLAP MOVE_DOUBLE_SLAP',
            '#define MOVE_ALSO_THAT MOVE_DOUBLESLAP',
        ].join('\n')));
        expect(table.require('MOVE_ALSO_THAT')).toBe(3);
    });

    test('evaluates the parenthesised arithmetic the headers actually use', () => {
        const table = new ConstantTable(parseConstantHeader([
            '#define SPECIES_LAST 1523',
            '#define SPECIES_EGG (SPECIES_LAST + 1)',
            '#define NUM_SPECIES SPECIES_EGG',
            '#define FIRST_BERRY 133',
            '#define LAST_BERRY 175',
            '#define BERRY_COUNT (LAST_BERRY - FIRST_BERRY + 1)',
        ].join('\n')));
        expect(table.require('NUM_SPECIES')).toBe(1524);
        expect(table.require('BERRY_COUNT')).toBe(43);
    });

    test('ignores function-like macros — they are not constants', () => {
        const table = new ConstantTable(parseConstantHeader([
            '#define MON_TYPES(...) { __VA_ARGS__ }',
            '#define TYPE_NORMAL 1',
        ].join('\n')));
        expect(table.has('MON_TYPES')).toBe(false);
        expect(table.require('TYPE_NORMAL')).toBe(1);
    });

    test('keeps multi-line macro continuations out of the table', () => {
        const table = new ConstantTable(parseConstantHeader([
            '#define FOREACH_TM(F) \\',
            '    F(FOCUS_PUNCH) \\',
            '    F(DRAGON_CLAW)',
            '#define ITEM_TM01 582',
        ].join('\n')));
        expect(table.has('FOREACH_TM')).toBe(false);
        expect(table.require('ITEM_TM01')).toBe(582);
    });
});

describe('enums — move category, evolution methods and conditions are enums, not #defines', () => {
    test('numbers implicit members from 0, honouring explicit values on the way', () => {
        const table = new ConstantTable(parseConstantHeader([
            'enum DamageCategory',
            '{',
            '    DAMAGE_CATEGORY_PHYSICAL,',
            '    DAMAGE_CATEGORY_SPECIAL,   // second',
            '    DAMAGE_CATEGORY_STATUS',
            '};',
            'enum Gaps {',
            '    A,',
            '    B = 7,',
            '    C,',
            '    D = A,',
            '};',
        ].join('\n')));
        expect(table.require('DAMAGE_CATEGORY_PHYSICAL')).toBe(0);
        expect(table.require('DAMAGE_CATEGORY_SPECIAL')).toBe(1);
        expect(table.require('DAMAGE_CATEGORY_STATUS')).toBe(2);
        expect(table.require('B')).toBe(7);
        expect(table.require('C')).toBe(8);
        expect(table.require('D')).toBe(0);
    });

    test('reads the packed / explicitly-typed enum forms the base uses', () => {
        const table = new ConstantTable(parseConstantHeader([
            'enum PACKED ItemSortType',
            '{',
            '    ITEM_TYPE_UNCATEGORIZED,',
            '    ITEM_TYPE_FIELD_USE,',
            '};',
            'enum Pocket : u8 {',
            '    POCKET_NONE,',
            '    POCKET_ITEMS,',
            '};',
        ].join('\n')));
        expect(table.require('ITEM_TYPE_FIELD_USE')).toBe(1);
        expect(table.require('POCKET_ITEMS')).toBe(1);
    });

    test('a struct body is not an enum body — its fields never become constants', () => {
        const table = new ConstantTable(parseConstantHeader([
            'struct Evolution',
            '{',
            '    u16 method;',
            '    u16 param;',
            '};',
            'enum EvolutionMethods { EVO_NONE, EVO_LEVEL };',
        ].join('\n')));
        expect(table.has('method')).toBe(false);
        expect(table.require('EVO_LEVEL')).toBe(1);
    });
});

describe('ConstantTable failure modes — a wrong id silently corrupts a ROM, so every one is loud', () => {
    const table = new ConstantTable(parseConstantHeader([
        '#define SPECIES_BULBASAUR 1',
        '#define ITEM_BERRY_JUICE ((B_CONFUSE_BERRIES_HEAL >= GEN_7) ? 4 : 2)',
        '#define SPECIES_LOOP SPECIES_LOOP_BACK',
        '#define SPECIES_LOOP_BACK SPECIES_LOOP',
    ].join('\n')));

    test('get() returns undefined for an unknown name, require() throws naming it', () => {
        expect(table.get('SPECIES_MISSINGNO')).toBeUndefined();
        expect(table.has('SPECIES_MISSINGNO')).toBe(false);
        expect(() => table.require('SPECIES_MISSINGNO')).toThrow(/SPECIES_MISSINGNO/);
    });

    test('an expression it cannot evaluate throws with the raw text, never a guess', () => {
        expect(() => table.require('ITEM_BERRY_JUICE')).toThrow(/ITEM_BERRY_JUICE/);
        expect(() => table.require('ITEM_BERRY_JUICE')).toThrow(/B_CONFUSE_BERRIES_HEAL/);
        expect(table.get('ITEM_BERRY_JUICE')).toBeUndefined();
    });

    test('a definition cycle throws instead of recursing forever', () => {
        expect(() => table.require('SPECIES_LOOP')).toThrow(/cycle|circular/i);
    });

    test('a name defined twice with different values is ambiguous, not last-wins', () => {
        const ambiguous = new ConstantTable(parseConstantHeader([
            '#if B_CONFUSE_BERRIES_HEAL >= GEN_8',
            '#define ITEM_HEAL_AMOUNT 3',
            '#else',
            '#define ITEM_HEAL_AMOUNT 8',
            '#endif',
        ].join('\n')));
        expect(() => ambiguous.require('ITEM_HEAL_AMOUNT')).toThrow(/ambiguous|conditional|twice/i);
    });

    test('the same value defined twice is not a conflict', () => {
        const dup = new ConstantTable(parseConstantHeader([
            '#define ITEM_NONE 0',
            '#define ITEM_NONE 0',
        ].join('\n')));
        expect(dup.require('ITEM_NONE')).toBe(0);
    });
});

describe('loadGameConstants — against the real base headers', () => {
    const c = loadGameConstants({ root: ROOT });

    test('species, move, item, ability and type ids all resolve from one table', () => {
        expect(c.require('SPECIES_BULBASAUR')).toBe(1);
        expect(c.require('SPECIES_NONE')).toBe(0);
        expect(c.require('MOVE_POUND')).toBe(1);
        expect(c.require('ITEM_NONE')).toBe(0);
        expect(c.require('ITEM_TM01')).toBe(582);
        expect(c.require('ABILITY_NONE')).toBe(0);
        expect(c.require('ABILITY_OVERGROW')).toBe(65);
        expect(c.require('TYPE_NORMAL')).toBe(1);
        expect(c.require('TYPE_GRASS')).toBe(13);   // TYPE_MYSTERY sits at 10, so the gen-1 order shifts
    });

    test('resolves the chained/derived ids the headers build by arithmetic', () => {
        // SPECIES_EGG = (SPECIES_MIMIKYU_BUSTED_TOTEM + 1), NUM_SPECIES = SPECIES_EGG.
        expect(c.require('SPECIES_EGG')).toBe(c.require('SPECIES_MIMIKYU_BUSTED_TOTEM') + 1);
        expect(c.require('NUM_SPECIES')).toBe(c.require('SPECIES_EGG'));
    });

    test('the TM item block is contiguous — the injector indexes it by TM number', () => {
        for (let n = 1; n <= 95; n++) {
            const name = `ITEM_TM${String(n).padStart(2, '0')}`;
            expect(c.require(name)).toBe(c.require('ITEM_TM01') + n - 1);
        }
    });

    test('the evolution sentinel, methods and conditions come from the header too', () => {
        expect(c.require('EVOLUTIONS_END')).toBe(0xffff);
        expect(c.require('EVO_NONE')).toBe(0);
        expect(c.require('EVO_LEVEL')).toBe(1);
        expect(c.require('IF_MIN_LEVEL')).toBeGreaterThan(0);
        expect(c.require('CONDITIONS_END')).toBe(c.require('IF_MIN_LEVEL') + 1);
    });

    test('move categories resolve — the injector writes them into a 2-bit field', () => {
        expect(c.require('DAMAGE_CATEGORY_PHYSICAL')).toBe(0);
        expect(c.require('DAMAGE_CATEGORY_SPECIAL')).toBe(1);
        expect(c.require('DAMAGE_CATEGORY_STATUS')).toBe(2);
    });

    test('every species id the pipeline can emit is known', () => {
        const { POKEMON_TYPES } = require('../../constants');
        for (const t of POKEMON_TYPES) expect(c.get(`TYPE_${t}`)).toBeGreaterThanOrEqual(0);
    });
});
