// T-240 — inject the level-up and teachable (TM/HM + tutor) learnsets.
//
// The compile path rewrites two files, `src/data/pokemon/level_up_learnsets/gen_9.h` and
// `src/data/pokemon/teachable_learnsets.h` (pokemonWriter.editLearnsetsFile /
// editTeachableLearnsets), and the arrays they hold have been FIXED-CAPACITY exports since T-237 —
// so this is an in-place overwrite, not a repoint.
//
// What the tests below pin is the writers' decision rules, because those are what decide GATE-3:
// arrays are keyed by NAME with the first match winning (every mega shares its base form's array),
// an unmatched array keeps the base's data, an empty teachable list is SKIPPED while an empty
// level-up list is rewritten to just the terminator, and the tail of the slot is zero-filled the way
// C zero-fills a `[CAPACITY]` array the initializer doesn't fill.
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const {
    injectLevelUpLearnsets, injectTeachableLearnsets, applyLearnsets,
    parseLevelUpSource, parseTeachableSource, TAG_LEVEL_UP, TAG_TEACHABLE,
} = require('../../injector/modules/learnsets');
const { LEVEL_UP_MOVE, TEACHABLE_MOVE } = require('../../injector/structLayout');
const { LEVEL_UP_LEARNSET_CAPACITY, TEACHABLE_LEARNSET_CAPACITY } = require('../../layout');

// ── Source text, written the way the two base files are ───────────────────────

function levelUpSource(arrays) {
    const blocks = Object.entries(arrays).map(([name, entries]) => [
        `const struct LevelUpMove ${name}[LEVEL_UP_LEARNSET_CAPACITY] = {`,
        ...entries.map(e => `    LEVEL_UP_MOVE(${String(e.level).padStart(2)}, ${e.move}),`),
        '    LEVEL_UP_END',
        '};',
    ].join('\n'));
    return [
        '#define LEVEL_UP_MOVE(lvl, moveLearned) {.move = moveLearned, .level = lvl}',
        '#define LEVEL_UP_END {.move = LEVEL_UP_MOVE_END, .level = 0}',
        '',
        ...blocks,
    ].join('\n\n');
}

function teachableSource(arrays) {
    return Object.entries(arrays).map(([name, moves]) => [
        `const u16 ${name}[TEACHABLE_LEARNSET_CAPACITY] = {`,
        ...moves.map(m => `    ${m},`),
        '    MOVE_UNAVAILABLE,',
        '};',
    ].join('\n')).join('\n\n');
}

// ── Reading a slot back out of the ROM ────────────────────────────────────────

function readLevelUpSlot(base, name) {
    const at = base.offsetMap.offsetOf(name);
    const size = base.offsetMap.require(name).size;
    const entries = [];
    for (let i = 0; i * LEVEL_UP_MOVE.stride < size; i++) {
        const entryAt = at + i * LEVEL_UP_MOVE.stride;
        const move = base.rom.readU16(entryAt + LEVEL_UP_MOVE.move);
        if (move === constants.require('LEVEL_UP_MOVE_END')) break;
        entries.push({ move, level: base.rom.readU16(entryAt + LEVEL_UP_MOVE.level) });
    }
    return entries;
}

function readTeachableSlot(base, name) {
    const at = base.offsetMap.offsetOf(name);
    const size = base.offsetMap.require(name).size;
    const moves = [];
    for (let i = 0; i * TEACHABLE_MOVE.stride < size; i++) {
        const move = base.rom.readU16(at + i * TEACHABLE_MOVE.stride);
        if (move === constants.require('MOVE_UNAVAILABLE')) break;
        moves.push(move);
    }
    return moves;
}

const slotBytes = (base, name) => base.rom.readBytes(base.offsetMap.offsetOf(name), base.offsetMap.require(name).size);
const ids = (moves) => moves.map(m => constants.require(m));

/**
 * A synthetic base whose ROM slots and source text always agree — which is the precondition the
 * module verifies before writing anything.
 */
function setup({ learnsets = {}, teachables = {}, pokes = [], slotSizes = {} } = {}) {
    const withSize = (arrays) => Object.fromEntries(Object.entries(arrays)
        .map(([name, entries]) => [name, slotSizes[name] ? { entries, size: slotSizes[name] } : entries]));
    const base = buildSyntheticBase({ learnsets: withSize(learnsets), teachables: withSize(teachables) });
    const ctx = buildInjectionContext({ rom: base.rom, offsetMap: base.offsetMap, data: { pokedex: { pokes } } });
    return {
        ...base,
        ctx,
        levelUpSource: levelUpSource(learnsets),
        teachableSource: teachableSource(teachables),
    };
}

const BULBASAUR_BASE = [
    { level: 1, move: 'MOVE_TACKLE' },
    { level: 1, move: 'MOVE_GROWL' },
    { level: 3, move: 'MOVE_VINE_WHIP' },
];

describe('parsing the base learnset sources', () => {
    test('reads every level-up array as { level, move }, terminator excluded', () => {
        const parsed = parseLevelUpSource(levelUpSource({
            sNoneLevelUpLearnset: [{ level: 1, move: 'MOVE_POUND' }],
            sBulbasaurLevelUpLearnset: BULBASAUR_BASE,
        }));
        expect([...parsed.keys()]).toEqual(['sNoneLevelUpLearnset', 'sBulbasaurLevelUpLearnset']);
        expect(parsed.get('sBulbasaurLevelUpLearnset')).toEqual([
            { level: 1, move: 'MOVE_TACKLE' },
            { level: 1, move: 'MOVE_GROWL' },
            { level: 3, move: 'MOVE_VINE_WHIP' },
        ]);
    });

    test('reads every teachable array as a move list, terminator excluded', () => {
        const parsed = parseTeachableSource(teachableSource({
            sBulbasaurTeachableLearnset: ['MOVE_CUT', 'MOVE_TOXIC'],
        }));
        expect(parsed.get('sBulbasaurTeachableLearnset')).toEqual(['MOVE_CUT', 'MOVE_TOXIC']);
    });

    test('an upstream-shaped `static` declaration still parses (the base drifting back is not a crash)', () => {
        const source = levelUpSource({ sBulbasaurLevelUpLearnset: BULBASAUR_BASE })
            .replace('const struct LevelUpMove sBulbasaur', 'static const struct LevelUpMove sBulbasaur');
        expect(parseLevelUpSource(source).get('sBulbasaurLevelUpLearnset')).toHaveLength(3);
    });

    test('a line inside an array that is neither an entry nor the terminator is refused, not skipped', () => {
        const source = levelUpSource({ sBulbasaurLevelUpLearnset: BULBASAUR_BASE })
            .replace('    LEVEL_UP_MOVE( 3, MOVE_VINE_WHIP),', '    SOME_NEW_MACRO(3, MOVE_VINE_WHIP),');
        expect(() => parseLevelUpSource(source)).toThrow(/sBulbasaurLevelUpLearnset[\s\S]*SOME_NEW_MACRO/);
    });

    test('the committed base sources parse — 1104 level-up and 1101 teachable arrays', () => {
        // The real files, so a format drift in either fails here rather than on the build box.
        const fs = require('fs');
        const path = require('path');
        const { LEVEL_UP_LEARNSETS_DIR, SPECIES_DIR } = require('../../constants');
        const levelUp = parseLevelUpSource(
            fs.readFileSync(path.resolve(LEVEL_UP_LEARNSETS_DIR, 'gen_9.h'), 'utf8'));
        const teachable = parseTeachableSource(
            fs.readFileSync(path.resolve(SPECIES_DIR, '..', 'teachable_learnsets.h'), 'utf8'));

        expect(levelUp.size).toBe(1104);
        expect(teachable.size).toBe(1101);
        expect(levelUp.get('sBulbasaurLevelUpLearnset').slice(0, 3)).toEqual(BULBASAUR_BASE);
        expect(teachable.get('sBulbasaurTeachableLearnset')).toContain('MOVE_TOXIC');
        // Every payload fits its slot with room for the terminator — the invariant T-237 established.
        for (const entries of levelUp.values()) expect(entries.length).toBeLessThan(LEVEL_UP_LEARNSET_CAPACITY);
        for (const moves of teachable.values()) expect(moves.length).toBeLessThan(TEACHABLE_LEARNSET_CAPACITY);
    });
});

describe('level-up learnsets', () => {
    test('writes the run’s moves as { u16 move, u16 level }, terminated', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: '1', move: 'MOVE_EMBER' }, { level: '17', move: 'MOVE_PSYCHIC' }],
            }],
        });
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        expect(readLevelUpSlot(base, 'sBulbasaurLevelUpLearnset')).toEqual([
            { move: constants.require('MOVE_EMBER'), level: 1 },
            { move: constants.require('MOVE_PSYCHIC'), level: 17 },
        ]);
    });

    test('an entry is move-then-level in the bytes, not the LEVEL_UP_MOVE(lvl, move) order', () => {
        // Asserted on raw offsets rather than through LEVEL_UP_MOVE, so the module and structLayout
        // cannot swap the two fields together and stay green. (On the real base the byte-match against
        // the base source is what proves this — a fixture can only stop the two sides drifting.)
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 37, move: 'MOVE_PSYCHIC' }],
            }],
        });
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        const bytes = slotBytes(base, 'sBulbasaurLevelUpLearnset');
        expect(bytes.readUInt16LE(0)).toBe(constants.require('MOVE_PSYCHIC'));
        expect(bytes.readUInt16LE(2)).toBe(37);
    });

    test('zero-fills the rest of the slot — a shorter learnset must not leave base moves behind it', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        const bytes = slotBytes(base, 'sBulbasaurLevelUpLearnset');
        const tail = bytes.subarray(2 * LEVEL_UP_MOVE.stride);       // past the entry and the terminator
        expect(tail.every(byte => byte === 0)).toBe(true);
        expect(bytes).toHaveLength(LEVEL_UP_LEARNSET_CAPACITY * LEVEL_UP_MOVE.stride);
    });

    test('an empty learnset is still written — the writer emits a block holding only LEVEL_UP_END', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{ id: 'SPECIES_BULBASAUR', levelUpLearnset: 'sBulbasaurLevelUpLearnset', learnset: [] }],
        });
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        expect(readLevelUpSlot(base, 'sBulbasaurLevelUpLearnset')).toEqual([]);
        expect(slotBytes(base, 'sBulbasaurLevelUpLearnset').readUInt16LE(0)).toBe(constants.require('LEVEL_UP_MOVE_END'));
    });

    test('an array no pokémon claims keeps the base’s data (sNone*, a dropped form)', () => {
        const base = setup({
            learnsets: {
                sNoneLevelUpLearnset: [{ level: 1, move: 'MOVE_POUND' }],
                sBulbasaurLevelUpLearnset: BULBASAUR_BASE,
            },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        const before = slotBytes(base, 'sNoneLevelUpLearnset');
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        expect(slotBytes(base, 'sNoneLevelUpLearnset')).toEqual(before);
    });

    test('the FIRST pokémon claiming a shared array wins — a mega never overwrites its base form (T-062)', () => {
        const base = setup({
            learnsets: { sVenusaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [
                {
                    id: 'SPECIES_VENUSAUR',
                    levelUpLearnset: 'sVenusaurLevelUpLearnset',
                    learnset: [{ level: 5, move: 'MOVE_EMBER' }],
                },
                {
                    id: 'SPECIES_VENUSAUR_MEGA',
                    levelUpLearnset: 'sVenusaurLevelUpLearnset',
                    learnset: [{ level: 9, move: 'MOVE_PSYCHIC' }],
                },
            ],
        });
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        expect(readLevelUpSlot(base, 'sVenusaurLevelUpLearnset'))
            .toEqual([{ move: constants.require('MOVE_EMBER'), level: 5 }]);
    });

    test('a banned species is not injected — writer.js filters the list before savePokemonData', () => {
        // GATE-3 caught exactly this in T-239 for gSpeciesInfo: the injector was writing rebalances the
        // compile path never sees, because writer.js drops BANNED_SPECIES_FOR_PICKING first.
        const base = setup({
            learnsets: { sCastformLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_CASTFORM_SNOWY',
                levelUpLearnset: 'sCastformLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        const before = slotBytes(base, 'sCastformLevelUpLearnset');
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        expect(slotBytes(base, 'sCastformLevelUpLearnset')).toEqual(before);
    });

    test('an array the base does not export is skipped (an #if P_FAMILY_* the base compiled out)', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_CALYREX',
                levelUpLearnset: 'sCalyrexLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        // The source declares an array the ROM has no symbol for.
        const source = `${base.levelUpSource}\n\n${levelUpSource({ sCalyrexLevelUpLearnset: BULBASAUR_BASE })}`;
        const result = injectLevelUpLearnsets(base.ctx, { source });

        expect(result.absent).toBe(1);
        expect(result.writes).toBe(0);
    });

    test('a payload that would overflow the slot throws, naming the array and the capacity', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: Array.from({ length: LEVEL_UP_LEARNSET_CAPACITY }, (_, i) => ({ level: i + 1, move: 'MOVE_EMBER' })),
            }],
        });
        expect(() => injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource }))
            .toThrow(new RegExp(`sBulbasaurLevelUpLearnset[\\s\\S]*${LEVEL_UP_LEARNSET_CAPACITY}`));
    });

    test('exactly capacity − 1 moves fits — the boundary the writer guards', () => {
        const full = Array.from({ length: LEVEL_UP_LEARNSET_CAPACITY - 1 }, (_, i) => ({ level: i + 1, move: 'MOVE_EMBER' }));
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{ id: 'SPECIES_BULBASAUR', levelUpLearnset: 'sBulbasaurLevelUpLearnset', learnset: full }],
        });
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        expect(readLevelUpSlot(base, 'sBulbasaurLevelUpLearnset')).toHaveLength(LEVEL_UP_LEARNSET_CAPACITY - 1);
    });

    test('a move the base does not define throws, naming the array', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_NOT_A_REAL_MOVE' }],
            }],
        });
        expect(() => injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource }))
            .toThrow(/sBulbasaurLevelUpLearnset[\s\S]*MOVE_NOT_A_REAL_MOVE/);
    });

    test('every write is tagged, and lands inside the slot it belongs to', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource });

        const at = base.offsetMap.offsetOf('sBulbasaurLevelUpLearnset');
        const size = base.offsetMap.require('sBulbasaurLevelUpLearnset').size;
        expect(base.rom.journal).not.toHaveLength(0);
        for (const entry of base.rom.journal) {
            expect(entry.tag).toBe(TAG_LEVEL_UP);
            expect(entry.offset).toBeGreaterThanOrEqual(at);
            expect(entry.offset + entry.length).toBeLessThanOrEqual(at + size);
        }
    });
});

describe('teachable learnsets', () => {
    test('writes the run’s move list as u16s terminated by MOVE_UNAVAILABLE, tail zeroed', () => {
        const base = setup({
            teachables: { sBulbasaurTeachableLearnset: ['MOVE_CUT', 'MOVE_TOXIC', 'MOVE_FLY'] },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                teachableLearnset: 'sBulbasaurTeachableLearnset',
                teachables: ['MOVE_EMBER', 'MOVE_PSYCHIC'],
            }],
        });
        injectTeachableLearnsets(base.ctx, { source: base.teachableSource });

        expect(readTeachableSlot(base, 'sBulbasaurTeachableLearnset')).toEqual(ids(['MOVE_EMBER', 'MOVE_PSYCHIC']));
        const tail = slotBytes(base, 'sBulbasaurTeachableLearnset').subarray(3 * TEACHABLE_MOVE.stride);
        expect(tail.every(byte => byte === 0)).toBe(true);
    });

    test('an EMPTY teachable list is skipped — the writer leaves the base block alone (unlike level-up)', () => {
        const base = setup({
            teachables: { sBulbasaurTeachableLearnset: ['MOVE_CUT', 'MOVE_TOXIC'] },
            pokes: [{ id: 'SPECIES_BULBASAUR', teachableLearnset: 'sBulbasaurTeachableLearnset', teachables: [] }],
        });
        const before = slotBytes(base, 'sBulbasaurTeachableLearnset');
        const result = injectTeachableLearnsets(base.ctx, { source: base.teachableSource });

        expect(slotBytes(base, 'sBulbasaurTeachableLearnset')).toEqual(before);
        expect(result.writes).toBe(0);
    });

    test('an array no pokémon claims keeps the base’s data', () => {
        const base = setup({
            teachables: {
                sNoneTeachableLearnset: ['MOVE_CUT'],
                sBulbasaurTeachableLearnset: ['MOVE_TOXIC'],
            },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                teachableLearnset: 'sBulbasaurTeachableLearnset',
                teachables: ['MOVE_EMBER'],
            }],
        });
        const before = slotBytes(base, 'sNoneTeachableLearnset');
        injectTeachableLearnsets(base.ctx, { source: base.teachableSource });

        expect(slotBytes(base, 'sNoneTeachableLearnset')).toEqual(before);
        expect(readTeachableSlot(base, 'sBulbasaurTeachableLearnset')).toEqual(ids(['MOVE_EMBER']));
    });

    test('a payload that would overflow the slot throws, naming the array and the capacity', () => {
        const base = setup({
            teachables: { sBulbasaurTeachableLearnset: ['MOVE_CUT'] },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                teachableLearnset: 'sBulbasaurTeachableLearnset',
                teachables: Array(TEACHABLE_LEARNSET_CAPACITY).fill('MOVE_EMBER'),
            }],
        });
        expect(() => injectTeachableLearnsets(base.ctx, { source: base.teachableSource }))
            .toThrow(new RegExp(`sBulbasaurTeachableLearnset[\\s\\S]*${TEACHABLE_LEARNSET_CAPACITY}`));
    });

    test('a banned species is not injected', () => {
        const base = setup({
            teachables: { sCastformTeachableLearnset: ['MOVE_CUT'] },
            pokes: [{
                id: 'SPECIES_CASTFORM_SNOWY',
                teachableLearnset: 'sCastformTeachableLearnset',
                teachables: ['MOVE_EMBER'],
            }],
        });
        const before = slotBytes(base, 'sCastformTeachableLearnset');
        injectTeachableLearnsets(base.ctx, { source: base.teachableSource });

        expect(slotBytes(base, 'sCastformTeachableLearnset')).toEqual(before);
    });

    test('every write is tagged for the teachable sub-module', () => {
        const base = setup({
            teachables: { sBulbasaurTeachableLearnset: ['MOVE_CUT'] },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                teachableLearnset: 'sBulbasaurTeachableLearnset',
                teachables: ['MOVE_EMBER'],
            }],
        });
        injectTeachableLearnsets(base.ctx, { source: base.teachableSource });

        expect(base.rom.journal.every(e => e.tag === TAG_TEACHABLE)).toBe(true);
    });
});

describe('the base has to be the build these sources came from', () => {
    test('a slot whose bytes are not the base source’s learnset is refused, not written', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        // The ROM says Tackle/Growl/Vine Whip; hand the module a source claiming something else.
        const source = levelUpSource({ sBulbasaurLevelUpLearnset: [{ level: 1, move: 'MOVE_PSYCHIC' }] });

        expect(() => injectLevelUpLearnsets(base.ctx, { source }))
            .toThrow(/sBulbasaurLevelUpLearnset[\s\S]*(same build|does not match)/i);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('a teachable slot that disagrees with the source is refused', () => {
        const base = setup({
            teachables: { sBulbasaurTeachableLearnset: ['MOVE_CUT', 'MOVE_TOXIC'] },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                teachableLearnset: 'sBulbasaurTeachableLearnset',
                teachables: ['MOVE_EMBER'],
            }],
        });
        const source = teachableSource({ sBulbasaurTeachableLearnset: ['MOVE_CUT', 'MOVE_FLY'] });

        expect(() => injectTeachableLearnsets(base.ctx, { source })).toThrow(/sBulbasaurTeachableLearnset/);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('a base exporting NONE of the arrays the run writes is refused, not silently no-opped', () => {
        // The T-234/T-237 trap: the symbols vanish (LTO, a returning `static`, a map from another
        // build) and every write becomes a no-op, shipping base learnsets in a "randomized" ROM.
        const base = setup({
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        const source = levelUpSource({ sBulbasaurLevelUpLearnset: BULBASAUR_BASE });

        expect(() => injectLevelUpLearnsets(base.ctx, { source })).toThrow(/exports none|LTO/i);
    });

    test('a slot that is not the declared capacity is refused (a base built from another layout header)', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            slotSizes: { sBulbasaurLevelUpLearnset: 4 * LEVEL_UP_MOVE.stride },   // a pre-T-237 tight array
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        expect(() => injectLevelUpLearnsets(base.ctx, { source: base.levelUpSource }))
            .toThrow(new RegExp(`sBulbasaurLevelUpLearnset[\\s\\S]*(16|${LEVEL_UP_LEARNSET_CAPACITY})`));
    });
});

describe('running as the SECOND migrated module in the pipeline', () => {
    // Found by GATE-3, 2026-08-02: every corpus ROM but `rebalance-off` failed with "SPECIES_BULBASAUR
    // .baseAttack should be 49 but the base reads 59". The base anchors describe the BASE's data, and by
    // the time this module runs, group-a-fixed has already rewritten gSpeciesInfo in the same buffer. So
    // the layout is verified once per ROM, while it is still pristine, and later modules reuse it.
    test('reuses the context an earlier module built instead of re-checking rewritten bytes', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
            }],
        });
        // setup() built the context on the pristine ROM (as the first module does); now Group A
        // rebalances Bulbasaur, exactly as it would before this module runs.
        base.rom.writeU8(base.speciesAt('SPECIES_BULBASAUR') + 0x01, 59, 'species:baseAttack');

        expect(() => applyLearnsets({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: { pokedex: { pokes: base.ctx.data.pokedex.pokes } },
            sources: { levelUpSource: base.levelUpSource, teachableSource: teachableSource({}) },
        })).not.toThrow();
        expect(readLevelUpSlot(base, 'sBulbasaurLevelUpLearnset'))
            .toEqual([{ move: constants.require('MOVE_EMBER'), level: 5 }]);
    });

    test('but a ROM whose FIRST context is built after a write is refused — the anchors mean nothing then', () => {
        const { buildInjectionContext: build } = require('../../injector/context');
        const base = buildSyntheticBase({ learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE } });
        base.rom.writeU8(base.speciesAt('SPECIES_BULBASAUR') + 0x01, 59, 'someone-else');

        expect(() => build({ rom: base.rom, offsetMap: base.offsetMap, data: {} }))
            .toThrow(/already been written|pristine/i);
    });
});

describe('the module as the registry calls it', () => {
    test('applyLearnsets writes both families in one pass', () => {
        const base = setup({
            learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE },
            teachables: { sBulbasaurTeachableLearnset: ['MOVE_CUT'] },
            pokes: [{
                id: 'SPECIES_BULBASAUR',
                levelUpLearnset: 'sBulbasaurLevelUpLearnset',
                learnset: [{ level: 5, move: 'MOVE_EMBER' }],
                teachableLearnset: 'sBulbasaurTeachableLearnset',
                teachables: ['MOVE_PSYCHIC'],
            }],
        });
        const result = applyLearnsets({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: { pokedex: { pokes: base.ctx.data.pokedex.pokes } },
            sources: { levelUpSource: base.levelUpSource, teachableSource: base.teachableSource },
        });

        expect(readLevelUpSlot(base, 'sBulbasaurLevelUpLearnset'))
            .toEqual([{ move: constants.require('MOVE_EMBER'), level: 5 }]);
        expect(readTeachableSlot(base, 'sBulbasaurTeachableLearnset')).toEqual(ids(['MOVE_PSYCHIC']));
        expect(result.levelUp.writes).toBe(1);
        expect(result.teachable.writes).toBe(1);
    });

    test('a bundle with no pokedex writes nothing rather than throwing', () => {
        const base = setup({ learnsets: { sBulbasaurLevelUpLearnset: BULBASAUR_BASE } });
        const result = applyLearnsets({
            rom: base.rom,
            offsetMap: base.offsetMap,
            data: {},
            sources: { levelUpSource: base.levelUpSource, teachableSource: teachableSource({}) },
        });

        expect(result.levelUp.writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });
});
