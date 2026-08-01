'use strict';

// T-237 — level-up and teachable learnsets are declared at a FIXED capacity so the injector can
// overwrite them in place at a `.map` offset (ADR-022). These tests pin the three things that make
// that true: the writers emit the fixed-capacity declaration, they refuse to emit an oversized
// payload, and the committed base source never slips back to the variable-length `[]` form.

const fs = require('fs');
const path = require('path');

const {
    editLearnsetsFile,
    editTeachableLearnsets,
    LEVEL_UP_LEARNSET_CAPACITY,
    TEACHABLE_LEARNSET_CAPACITY,
} = require('../../pokemonWriter.js');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const LAYOUT_HEADER = path.join(ROOT, 'include', 'constants', 'randomizer_layout.h');
const GEN9 = path.join(ROOT, 'src', 'data', 'pokemon', 'level_up_learnsets', 'gen_9.h');
const TEACHABLES = path.join(ROOT, 'src', 'data', 'pokemon', 'teachable_learnsets.h');

const readCapacity = (name) => {
    const m = fs.readFileSync(LAYOUT_HEADER, 'utf8').match(new RegExp(`^#define ${name}\\s+(\\d+)`, 'm'));
    if (!m) throw new Error(`${name} not found in include/constants/randomizer_layout.h`);
    return Number(m[1]);
};

const monWithLearnset = (moves) => ({
    id: 'SPECIES_BULBASAUR',
    levelUpLearnset: 'sBulbasaurLevelUpLearnset',
    learnset: moves.map((move, i) => ({ level: i + 1, move })),
});

const monWithTeachables = (moves) => ({
    id: 'SPECIES_BULBASAUR',
    teachableLearnset: 'sBulbasaurTeachableLearnset',
    teachables: moves,
});

const genFile = (body) => `#define LEVEL_UP_MOVE(lvl, moveLearned) {.move = moveLearned, .level = lvl}\n\n${body}\n`;

describe('fixed-capacity learnsets (T-237)', () => {
    test('the capacities come from the C header (single source of truth)', () => {
        expect(LEVEL_UP_LEARNSET_CAPACITY).toBe(readCapacity('LEVEL_UP_LEARNSET_CAPACITY'));
        expect(TEACHABLE_LEARNSET_CAPACITY).toBe(readCapacity('TEACHABLE_LEARNSET_CAPACITY'));
    });

    describe('level-up learnsets', () => {
        const source = genFile(
            `const struct LevelUpMove sBulbasaurLevelUpLearnset[LEVEL_UP_LEARNSET_CAPACITY] = {\n`
            + `    LEVEL_UP_MOVE( 1, MOVE_TACKLE),\n    LEVEL_UP_END\n};`);

        test('rewrites a matched learnset keeping the fixed-capacity declaration', async () => {
            const out = await editLearnsetsFile(source, [monWithLearnset(['MOVE_EMBER', 'MOVE_SCRATCH'])]);
            expect(out).toContain('const struct LevelUpMove sBulbasaurLevelUpLearnset[LEVEL_UP_LEARNSET_CAPACITY] = {');
            expect(out).not.toContain('sBulbasaurLevelUpLearnset[]');
            expect(out).not.toContain('static const struct LevelUpMove sBulbasaurLevelUpLearnset');
            expect(out).toContain('LEVEL_UP_MOVE(1, MOVE_EMBER),');
            expect(out).toContain('LEVEL_UP_MOVE(2, MOVE_SCRATCH),');
            expect(out).toContain('LEVEL_UP_END');
        });

        test('accepts a learnset that exactly fills the slot (capacity - 1 moves + terminator)', async () => {
            const moves = Array.from({ length: LEVEL_UP_LEARNSET_CAPACITY - 1 }, (_, i) => `MOVE_M${i}`);
            await expect(editLearnsetsFile(source, [monWithLearnset(moves)])).resolves.toBeDefined();
        });

        test('throws instead of overflowing the slot', async () => {
            const moves = Array.from({ length: LEVEL_UP_LEARNSET_CAPACITY }, (_, i) => `MOVE_M${i}`);
            await expect(editLearnsetsFile(source, [monWithLearnset(moves)]))
                .rejects.toThrow(/sBulbasaurLevelUpLearnset.*LEVEL_UP_LEARNSET_CAPACITY|capacity/i);
        });
    });

    describe('teachable learnsets', () => {
        const source = `const u16 sBulbasaurTeachableLearnset[TEACHABLE_LEARNSET_CAPACITY] = {\n`
            + `    MOVE_TOXIC,\n    MOVE_UNAVAILABLE,\n};`;

        test('rewrites a matched teachable list keeping the fixed-capacity declaration', () => {
            const out = editTeachableLearnsets(source, [monWithTeachables(['MOVE_FLY', 'MOVE_SURF'])]);
            expect(out).toContain('const u16 sBulbasaurTeachableLearnset[TEACHABLE_LEARNSET_CAPACITY] = {');
            expect(out).not.toContain('sBulbasaurTeachableLearnset[]');
            expect(out).toContain('MOVE_FLY,');
            expect(out).toContain('MOVE_SURF,');
            expect(out).toContain('MOVE_UNAVAILABLE,');
        });

        test('throws instead of overflowing the slot', () => {
            const moves = Array.from({ length: TEACHABLE_LEARNSET_CAPACITY }, (_, i) => `MOVE_M${i}`);
            expect(() => editTeachableLearnsets(source, [monWithTeachables(moves)]))
                .toThrow(/sBulbasaurTeachableLearnset.*TEACHABLE_LEARNSET_CAPACITY|capacity/i);
        });
    });

    describe('committed base source', () => {
        test('no level-up learnset is declared variable-length', () => {
            const text = fs.readFileSync(GEN9, 'utf8');
            const variable = [...text.matchAll(/^(?:static )?const struct LevelUpMove (\w+)\[\]/gm)].map((m) => m[1]);
            expect(variable).toEqual([]);
            const fixed = [...text.matchAll(/^const struct LevelUpMove (\w+)\[LEVEL_UP_LEARNSET_CAPACITY\]/gm)];
            expect(fixed.length).toBeGreaterThan(1000);
        });

        test('no teachable learnset is declared variable-length', () => {
            const text = fs.readFileSync(TEACHABLES, 'utf8');
            const variable = [...text.matchAll(/^(?:static )?const u16 (s\w+TeachableLearnset)\[\]/gm)].map((m) => m[1]);
            expect(variable).toEqual([]);
            const fixed = [...text.matchAll(/^const u16 (s\w+TeachableLearnset)\[TEACHABLE_LEARNSET_CAPACITY\]/gm)];
            expect(fixed.length).toBeGreaterThan(1000);
        });

        test('no learnset in the base already exceeds its capacity', () => {
            const gen9 = fs.readFileSync(GEN9, 'utf8');
            const over = [];
            for (const block of gen9.matchAll(/^const struct LevelUpMove (\w+)\[[^\]]*\] = \{([\s\S]*?)^\};/gm)) {
                const entries = (block[2].match(/LEVEL_UP_MOVE\(/g) || []).length + 1; // + LEVEL_UP_END
                if (entries > LEVEL_UP_LEARNSET_CAPACITY) over.push(`${block[1]} (${entries})`);
            }
            const teach = fs.readFileSync(TEACHABLES, 'utf8');
            for (const block of teach.matchAll(/^const u16 (s\w+TeachableLearnset)\[[^\]]*\] = \{([\s\S]*?)^\};/gm)) {
                const entries = (block[2].match(/^\s*MOVE_/gm) || []).length; // includes MOVE_UNAVAILABLE
                if (entries > TEACHABLE_LEARNSET_CAPACITY) over.push(`${block[1]} (${entries})`);
            }
            expect(over).toEqual([]);
        });
    });
});
