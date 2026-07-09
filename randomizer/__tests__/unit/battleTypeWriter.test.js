'use strict';

// TDD (T-087): the writer stamps each trainer's `Double Battle:` header from its battleType, carries
// battleType through the docs SSOT, and downgrades doubles→singles when the resolved team is < 2.

const { buildTrainersResultsFromDocs, applyDoubleBattleHeader, effectiveBattleType } = require('../../writer');

const HEADER_WITH_LINE = `=== TRAINER_ROXANNE_1 ===
Name: ROXANNE
Class: Leader
Pic: Leader Roxanne
Gender: Female
Music: Female
Double Battle: No
AI: AI_FLAG_SMART_TRAINER

`;

const HEADER_NO_LINE = `=== TRAINER_FOO ===
Name: FOO
Class: Youngster
Pic: Youngster
Gender: Male
Music: Male
AI: AI_FLAG_CHECK_BAD_MOVE

`;

describe('applyDoubleBattleHeader', () => {
    test('doubles flips an existing Double Battle: No to Yes, preserving the rest', () => {
        const out = applyDoubleBattleHeader(HEADER_WITH_LINE, 'doubles');
        expect(out).toMatch(/^Double Battle: Yes$/m);
        expect(out).not.toMatch(/Double Battle: No/);
        expect(out).toMatch(/^Name: ROXANNE$/m);
        expect(out).toMatch(/^AI: AI_FLAG_SMART_TRAINER$/m);
    });
    test('singles keeps Double Battle: No', () => {
        expect(applyDoubleBattleHeader(HEADER_WITH_LINE, 'singles')).toMatch(/^Double Battle: No$/m);
    });
    test('inserts the line before AI: when absent', () => {
        const out = applyDoubleBattleHeader(HEADER_NO_LINE, 'doubles');
        expect(out).toMatch(/Double Battle: Yes\nAI: AI_FLAG_CHECK_BAD_MOVE/);
    });
    test('undefined/unknown battleType leaves the header untouched (back-compat)', () => {
        expect(applyDoubleBattleHeader(HEADER_WITH_LINE, undefined)).toBe(HEADER_WITH_LINE);
    });
});

describe('effectiveBattleType (≥2 safety net)', () => {
    test('doubles with <2 resolved mons downgrades to singles', () => {
        expect(effectiveBattleType('doubles', 1)).toBe('singles');
        expect(effectiveBattleType('doubles', 0)).toBe('singles');
    });
    test('doubles with ≥2 stays doubles; singles/undefined pass through', () => {
        expect(effectiveBattleType('doubles', 2)).toBe('doubles');
        expect(effectiveBattleType('singles', 6)).toBe('singles');
        expect(effectiveBattleType(undefined, 6)).toBe(undefined);
    });
});

describe('buildTrainersResultsFromDocs carries battleType', () => {
    test('battleType propagates from docs to the resolved results (default singles)', () => {
        const docs = {
            TRAINER_A: { level: 10, class: 'Leader', team: [{ pokemon: 'SPECIES_MUDKIP' }], battleType: 'doubles' },
            TRAINER_B: { level: 10, class: 'Youngster', team: [{ pokemon: 'SPECIES_ZIGZAGOON' }] },
        };
        const res = buildTrainersResultsFromDocs(docs, [{ id: 'SPECIES_MUDKIP', name: 'Mudkip' }]);
        expect(res.TRAINER_A.battleType).toBe('doubles');
        expect(res.TRAINER_B.battleType).toBe('singles');
    });
});
