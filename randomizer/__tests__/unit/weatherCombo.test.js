'use strict';

const { computeComboBonus } = require('../../rating');

function makePoke(overrides) {
    return {
        parsedAbilities: [],
        parsedTypes: [],
        baseAttack: 80,
        baseSpAttack: 80,
        baseDefense: 80,
        baseSpDefense: 80,
        baseHP: 80,
        baseSpeed: 80,
        baseBST: 480,
        learnset: [],
        teachables: [],
        evolutionData: { isFinal: true, isMega: false },
        ...overrides,
    };
}

// ── DROUGHT ──────────────────────────────────────────────────────────────────

describe('computeComboBonus — DROUGHT', () => {
    test('base only: no Fire, no solar, not final → +0.4', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['GRASS'],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.4, 5);
    });

    test('base + Fire STAB, not final → +0.65', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['FIRE'],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.65, 5);
    });

    test('base + Solar Beam in learnset, not final → +0.65', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['GRASS'],
            learnset: [{ level: '1', move: 'MOVE_SOLAR_BEAM' }],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.65, 5);
    });

    test('base + Fire STAB + Solar Beam, not final → +0.90', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['FIRE'],
            learnset: [{ level: '1', move: 'MOVE_SOLAR_BEAM' }],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.90, 5);
    });

    test('Torkoal archetype: final + Fire + Solar Beam → +1.20', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['FIRE'],
            teachables: ['MOVE_SOLAR_BEAM'],
            evolutionData: { isFinal: true, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(1.20, 5);
    });

    test('Mega DROUGHT setter: isMega suppresses teambuilding → +0.90', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['FIRE'],
            teachables: ['MOVE_SOLAR_BEAM'],
            evolutionData: { isFinal: true, isMega: true },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.90, 5);
    });

    test('final evo, no Fire, no Solar: base + teambuilding → +0.70', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['GRASS'],
            evolutionData: { isFinal: true, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.70, 5);
    });

    test('Solar Beam via teachable but NOT in tmPool → no solar bonus (+0.70)', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['FIRE'],
            teachables: ['MOVE_SOLAR_BEAM'],
            evolutionData: { isFinal: true, isMega: false },
        });
        const tmPool = new Set(['MOVE_FLAMETHROWER']);
        // Solar Beam filtered out; Fire STAB + teambuilding only: 0.4 + 0.25 + 0.3 = 0.95
        expect(computeComboBonus(poke, [], {}, tmPool)).toBeCloseTo(0.95, 5);
    });

    test('Solar Blade in teachables (tmPool null) → same as Solar Beam', () => {
        const poke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['GRASS'],
            teachables: ['MOVE_SOLAR_BLADE'],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.65, 5);
    });
});

// ── DRIZZLE ───────────────────────────────────────────────────────────────────

describe('computeComboBonus — DRIZZLE', () => {
    test('base only: no Water, no Thunder/Hurricane, not final → +0.40', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['ELECTRIC'],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.40, 5);
    });

    test('base + Water STAB, not final → +0.65', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['WATER'],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.65, 5);
    });

    test('base + Hurricane in learnset, not final → +0.75', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['ELECTRIC'],
            learnset: [{ level: '1', move: 'MOVE_HURRICANE' }],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.75, 5);
    });

    test('Pelipper archetype: final + Water + Hurricane + Roost → +1.45', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['WATER', 'FLYING'],
            learnset: [
                { level: '1', move: 'MOVE_HURRICANE' },
                { level: '1', move: 'MOVE_ROOST' },
            ],
            evolutionData: { isFinal: true, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(1.45, 5);
    });

    test('Politoed archetype: final + Water only → +0.95', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['WATER'],
            evolutionData: { isFinal: true, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.95, 5);
    });

    test('Mega DRIZZLE: isMega suppresses teambuilding → Water + Hurricane + Roost = +1.15', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['WATER', 'FLYING'],
            learnset: [
                { level: '1', move: 'MOVE_HURRICANE' },
                { level: '1', move: 'MOVE_ROOST' },
            ],
            evolutionData: { isFinal: true, isMega: true },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(1.15, 5);
    });

    test('Wish counts as recovery: final + Water + Wish → +1.10', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['WATER'],
            learnset: [{ level: '1', move: 'MOVE_WISH' }],
            evolutionData: { isFinal: true, isMega: false },
        });
        // 0.4 + 0.25 + 0.15 + 0.3 = 1.10
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(1.10, 5);
    });

    test('Thunder counts as perfect_acc_move same as Hurricane', () => {
        const poke = makePoke({
            parsedAbilities: ['DRIZZLE'],
            parsedTypes: ['ELECTRIC'],
            learnset: [{ level: '1', move: 'MOVE_THUNDER' }],
            evolutionData: { isFinal: false, isMega: false },
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.75, 5);
    });
});

// ── SAND_STREAM ───────────────────────────────────────────────────────────────

describe('computeComboBonus — SAND_STREAM', () => {
    test('base only (Ground type) → +0.30', () => {
        const poke = makePoke({ parsedAbilities: ['SAND_STREAM'], parsedTypes: ['GROUND'] });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.30, 5);
    });

    test('base + Rock type → +0.50', () => {
        const poke = makePoke({ parsedAbilities: ['SAND_STREAM'], parsedTypes: ['ROCK'] });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.50, 5);
    });

    test('SAND_STREAM max (0.50) is less than DROUGHT final+Fire+Solar (1.20)', () => {
        const sandPoke = makePoke({ parsedAbilities: ['SAND_STREAM'], parsedTypes: ['ROCK'] });
        const droughtPoke = makePoke({
            parsedAbilities: ['DROUGHT'],
            parsedTypes: ['FIRE'],
            teachables: ['MOVE_SOLAR_BEAM'],
            evolutionData: { isFinal: true, isMega: false },
        });
        expect(computeComboBonus(sandPoke, [], {}, null))
            .toBeLessThan(computeComboBonus(droughtPoke, [], {}, null));
    });
});

// ── SNOW_WARNING ──────────────────────────────────────────────────────────────

describe('computeComboBonus — SNOW_WARNING', () => {
    test('base only → +0.20', () => {
        const poke = makePoke({ parsedAbilities: ['SNOW_WARNING'], parsedTypes: ['ICE'] });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.20, 5);
    });

    test('Blizzard + SpA < 100 → no bonus, +0.20', () => {
        const poke = makePoke({
            parsedAbilities: ['SNOW_WARNING'],
            parsedTypes: ['ICE'],
            baseSpAttack: 81,
            baseSpeed: 109,
            learnset: [{ level: '1', move: 'MOVE_BLIZZARD' }],
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.20, 5);
    });

    test('Blizzard + Speed < 80 → no bonus, +0.20', () => {
        const poke = makePoke({
            parsedAbilities: ['SNOW_WARNING'],
            parsedTypes: ['ICE'],
            baseSpAttack: 110,
            baseSpeed: 60,
            learnset: [{ level: '1', move: 'MOVE_BLIZZARD' }],
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.20, 5);
    });

    test('Blizzard + SpA >= 100 + Speed >= 80 → +0.50', () => {
        const poke = makePoke({
            parsedAbilities: ['SNOW_WARNING'],
            parsedTypes: ['ICE'],
            baseSpAttack: 110,
            baseSpeed: 85,
            learnset: [{ level: '1', move: 'MOVE_BLIZZARD' }],
        });
        expect(computeComboBonus(poke, [], {}, null)).toBeCloseTo(0.50, 5);
    });

    test('SNOW_WARNING base (0.20) < SAND_STREAM base (0.30)', () => {
        const snowPoke = makePoke({ parsedAbilities: ['SNOW_WARNING'], parsedTypes: ['ICE'] });
        const sandPoke = makePoke({ parsedAbilities: ['SAND_STREAM'], parsedTypes: ['GROUND'] });
        expect(computeComboBonus(snowPoke, [], {}, null))
            .toBeLessThan(computeComboBonus(sandPoke, [], {}, null));
    });
});

// ── No weather ability ────────────────────────────────────────────────────────

describe('computeComboBonus — no weather ability', () => {
    test('no weather ability → 0 weather bonus', () => {
        const poke = makePoke({
            parsedAbilities: ['NONE'],
            parsedTypes: ['FIRE'],
            teachables: ['MOVE_SOLAR_BEAM'],
        });
        expect(computeComboBonus(poke, [], {}, null)).toBe(0);
    });
});
