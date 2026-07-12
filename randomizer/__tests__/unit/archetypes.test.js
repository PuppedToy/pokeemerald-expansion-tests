'use strict';

// T-101/T-102 — the archetype models load, validate, and keep referential integrity (every entry
// feature / structure role is a defined feature). The model encodes the owner-validated taxonomy
// (base = balanced|offensive|defensive + a stackable gimmick layer).

const { loadArchetypeModel, validateArchetypeModel, VALID_CATEGORIES } = require('../../archetypes');

describe('archetype models', () => {
    for (const format of ['singles', 'doubles']) {
        describe(format, () => {
            const model = loadArchetypeModel(format);

            test('loads and validates', () => {
                expect(() => validateArchetypeModel(model, format)).not.toThrow();
            });

            test('every base archetype has a valid category', () => {
                for (const a of model.baseArchetypes) expect(VALID_CATEGORIES).toContain(a.category);
            });

            test('has a stackable gimmick layer', () => {
                expect(model.gimmicks.length).toBeGreaterThanOrEqual(3);
            });

            test('every structure role (and optional entry feature) is a defined feature', () => {
                const feats = model.featureDefinitions;
                for (const a of [...model.baseArchetypes, ...model.gimmicks]) {
                    for (const e of (a.entry || [])) expect(feats[e.feature]).toBeDefined(); // entry optional (T-118)
                    for (const s of a.structure) expect(feats[s.role]).toBeDefined();
                }
            });
        });
    }

    test('singles covers all three base categories', () => {
        const cats = new Set(loadArchetypeModel('singles').baseArchetypes.map(a => a.category));
        for (const c of VALID_CATEGORIES) expect(cats.has(c)).toBe(true);
    });

    test('singles has the expected base archetypes', () => {
        const ids = loadArchetypeModel('singles').baseArchetypes.map(a => a.id);
        expect(ids).toEqual(expect.arrayContaining(['balance', 'bulky_offense', 'hyper_offense', 'full_stall']));
    });

    test('doubles has the weather / trick_room / redirection / trapping gimmicks', () => {
        const ids = loadArchetypeModel('doubles').gimmicks.map(g => g.id);
        expect(ids).toEqual(expect.arrayContaining(['weather', 'trick_room', 'redirection', 'trapping']));
    });

    test('validateArchetypeModel rejects an undefined feature reference', () => {
        const bad = {
            format: 'singles', featureDefinitions: { x: 'y' },
            baseArchetypes: [{ id: 'a', name: 'A', category: 'balanced', entry: [{ feature: 'nope', min: 1 }], structure: [{ role: 'x', min: 1, max: 1, weight: 1 }] }],
            gimmicks: [{ id: 'g', name: 'G', entry: [{ feature: 'x', min: 1 }], structure: [{ role: 'x', min: 1, max: 1, weight: 1 }] }],
        };
        expect(() => validateArchetypeModel(bad, 'singles')).toThrow(/not in featureDefinitions/);
    });
});
