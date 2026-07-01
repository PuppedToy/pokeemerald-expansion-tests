'use strict';

// TDD (T-044): written BEFORE randomizer/trainerColors.js exists.
// trainerColors.js is the single source of truth for the docs viewer's per-type
// colour palettes and the boss-card colour resolution.

const {
    TYPE_PALETTES,
    GENERIC_PALETTE,
    ALLY_PALETTE,
    resolveTrainerColors,
    typeMainColors,
} = require('../../trainerColors');

// The 18 type main colours already shipped in frontend/template.html (typeColors).
// The SSOT must reproduce them EXACTLY so the frontend can stop hardcoding them.
const FRONTEND_TYPE_COLORS = {
    NORMAL: '#A8A77A', FIRE: '#EE8130', WATER: '#6390F0', ELECTRIC: '#F7D02C',
    GRASS: '#7AC74C', ICE: '#96D9D6', FIGHTING: '#C22E28', POISON: '#A33EA1',
    GROUND: '#E2BF65', FLYING: '#A98FF3', PSYCHIC: '#F95587', BUG: '#A6B91A',
    ROCK: '#B6A136', GHOST: '#735797', DRAGON: '#6F35FC', DARK: '#705746',
    STEEL: '#B7B7CE', FAIRY: '#D685AD',
};

const isHex = (s) => typeof s === 'string' && /^#[0-9A-Fa-f]{6}$/.test(s);

describe('TYPE_PALETTES (SSOT for per-type colours)', () => {
    const types = Object.keys(FRONTEND_TYPE_COLORS);

    test('defines all 18 types', () => {
        expect(Object.keys(TYPE_PALETTES).sort()).toEqual(types.slice().sort());
    });

    test('each type has main, secondary, mainBg, secondaryBg as valid hex', () => {
        for (const t of types) {
            const p = TYPE_PALETTES[t];
            expect(p).toBeDefined();
            for (const slot of ['main', 'secondary', 'mainBg', 'secondaryBg']) {
                expect(isHex(p[slot])).toBe(true);
            }
        }
    });

    test('main colours equal the existing frontend typeColors exactly', () => {
        for (const t of types) {
            expect(TYPE_PALETTES[t].main.toUpperCase()).toBe(FRONTEND_TYPE_COLORS[t]);
        }
    });

    test('typeMainColors() returns the {TYPE: main} map for frontend injection', () => {
        const mains = typeMainColors();
        for (const t of types) {
            expect(mains[t].toUpperCase()).toBe(FRONTEND_TYPE_COLORS[t]);
        }
    });

    test('backgrounds are dark enough for light/main text (all darker than their main)', () => {
        const lum = (hex) => {
            const n = parseInt(hex.slice(1), 16);
            return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
        };
        for (const t of types) {
            const p = TYPE_PALETTES[t];
            expect(lum(p.mainBg)).toBeLessThan(lum(p.main));
            expect(lum(p.secondaryBg)).toBeLessThan(lum(p.mainBg) + 1); // secondaryBg no lighter than mainBg
            expect(lum(p.mainBg)).toBeLessThan(90);      // genuinely dark surface
            expect(lum(p.secondaryBg)).toBeLessThan(70);
        }
    });
});

describe('GENERIC_PALETTE (common trainers)', () => {
    test('is defined with rail/card backgrounds and a title colour, no bar', () => {
        expect(isHex(GENERIC_PALETTE.railBg)).toBe(true);
        expect(isHex(GENERIC_PALETTE.cardBg)).toBe(true);
        expect(isHex(GENERIC_PALETTE.title)).toBe(true);
    });

    test('is visually distinct from Water and Ice (so those types still stand out)', () => {
        for (const key of ['railBg', 'cardBg']) {
            expect(GENERIC_PALETTE[key]).not.toBe(TYPE_PALETTES.WATER.mainBg);
            expect(GENERIC_PALETTE[key]).not.toBe(TYPE_PALETTES.WATER.secondaryBg);
            expect(GENERIC_PALETTE[key]).not.toBe(TYPE_PALETTES.ICE.mainBg);
            expect(GENERIC_PALETTE[key]).not.toBe(TYPE_PALETTES.ICE.secondaryBg);
        }
    });
});

describe('resolveTrainerColors', () => {
    test('common trainer → generic palette, NO top bar', () => {
        const c = resolveTrainerColors({ id: 'TRAINER_YOUNGSTER_1', class: 'Youngster', isBoss: false });
        expect(c.kind).toBe('common');
        expect(c.bar).toBeNull();
        expect(c.railBg).toBe(GENERIC_PALETTE.railBg);
        expect(c.cardBg).toBe(GENERIC_PALETTE.cardBg);
        expect(c.title).toBe(GENERIC_PALETTE.title);
    });

    test('typed boss (themeType FIRE) → type palette: bar main→secondary, title main, rail mainBg, cards secondaryBg', () => {
        const c = resolveTrainerColors({ id: 'TRAINER_FLANNERY_1', class: 'Leader Flannery', isBoss: true, themeType: 'FIRE' });
        const fire = TYPE_PALETTES.FIRE;
        expect(c.kind).toBe('typed');
        expect(c.bar).toEqual([fire.main, fire.secondary]);
        expect(c.title).toBe(fire.main);
        expect(c.railBg).toBe(fire.mainBg);
        expect(c.cardBg).toBe(fire.secondaryBg);
    });

    test('typed boss follows themeType, not class name (randomized types)', () => {
        const c = resolveTrainerColors({ id: 'TRAINER_FLANNERY_1', class: 'Leader Flannery', isBoss: true, themeType: 'WATER' });
        expect(c.railBg).toBe(TYPE_PALETTES.WATER.mainBg);
        expect(c.title).toBe(TYPE_PALETTES.WATER.main);
    });

    test('Steven is always Steel (via themeType STEEL)', () => {
        const c = resolveTrainerColors({ id: 'TRAINER_STEVEN', class: 'Steven', isBoss: true, themeType: 'STEEL' });
        expect(c.kind).toBe('typed');
        expect(c.railBg).toBe(TYPE_PALETTES.STEEL.mainBg);
        expect(c.title).toBe(TYPE_PALETTES.STEEL.main);
    });

    test('partner (ally) → friendly green palette, NOT its class/theme enemy palette', () => {
        // Partner Steven still carries a STEEL themeType; the ally look must win.
        const c = resolveTrainerColors({ id: 'PARTNER_STEVEN', class: 'Steven', isPartner: true, themeType: 'STEEL' });
        expect(c.kind).toBe('ally');
        expect(c.railBg).toBe(ALLY_PALETTE.railBg);
        expect(c.cardBg).toBe(ALLY_PALETTE.cardBg);
        expect(c.title).toBe(ALLY_PALETTE.title);
        // Must not have leaked the Steel enemy palette.
        expect(c.railBg).not.toBe(TYPE_PALETTES.STEEL.mainBg);
    });

    test('Aqua boss → Water(1)+Dark(2): bar water→dark, title water, rail water.mainBg, cards dark.mainBg', () => {
        for (const cls of ['Aqua Grunt M', 'Aqua Admin F', 'Aqua Admin M', 'Aqua Leader Archie']) {
            const c = resolveTrainerColors({ id: 'TRAINER_ARCHIE', class: cls, isBoss: true });
            expect(c.kind).toBe('evil');
            expect(c.bar).toEqual([TYPE_PALETTES.WATER.main, TYPE_PALETTES.DARK.main]);
            expect(c.title).toBe(TYPE_PALETTES.WATER.main);
            expect(c.railBg).toBe(TYPE_PALETTES.WATER.mainBg);
            expect(c.cardBg).toBe(TYPE_PALETTES.DARK.mainBg);
        }
    });

    test('Magma boss → Fire(1)+Ground(2): bar fire→ground, title fire, rail fire.mainBg, cards ground.mainBg', () => {
        for (const cls of ['Magma Grunt M', 'Magma Grunt F', 'Magma Admin', 'Magma Leader Maxie']) {
            const c = resolveTrainerColors({ id: 'TRAINER_MAXIE_MOSSDEEP', class: cls, isBoss: true });
            expect(c.kind).toBe('evil');
            expect(c.bar).toEqual([TYPE_PALETTES.FIRE.main, TYPE_PALETTES.GROUND.main]);
            expect(c.title).toBe(TYPE_PALETTES.FIRE.main);
            expect(c.railBg).toBe(TYPE_PALETTES.FIRE.mainBg);
            expect(c.cardBg).toBe(TYPE_PALETTES.GROUND.mainBg);
        }
    });

    test('rival (May/Brendan) → fixed rival palette with a bar; not a type palette', () => {
        for (const cls of ['May', 'Brendan']) {
            const c = resolveTrainerColors({ id: 'TRAINER_MAY_ROUTE_103_TREECKO', class: cls, isBoss: true });
            expect(c.kind).toBe('rival');
            expect(Array.isArray(c.bar)).toBe(true);
            expect(c.bar).toHaveLength(2);
            expect(isHex(c.title)).toBe(true);
            expect(isHex(c.railBg)).toBe(true);
            expect(isHex(c.cardBg)).toBe(true);
        }
    });

    test('Wally → fixed wally palette, distinct from the rival palette', () => {
        const wally = resolveTrainerColors({ id: 'TRAINER_WALLY_VR_1', class: 'Wally', isBoss: true });
        const rival = resolveTrainerColors({ id: 'TRAINER_MAY_ROUTE_103_TREECKO', class: 'May', isBoss: true });
        expect(wally.kind).toBe('wally');
        expect(Array.isArray(wally.bar)).toBe(true);
        // Rival and Wally must not look identical.
        expect(wally.railBg).not.toBe(rival.railBg);
    });

    test('unknown boss (isBoss, no themeType, unmatched class) → boss fallback with a bar', () => {
        const c = resolveTrainerColors({ id: 'TRAINER_MYSTERY', class: 'Unknown', isBoss: true });
        expect(c.kind).toBe('boss');
        expect(Array.isArray(c.bar)).toBe(true);
    });

    test('is robust to a missing/blank class or missing fields', () => {
        expect(() => resolveTrainerColors({})).not.toThrow();
        expect(resolveTrainerColors({}).kind).toBe('common');
        expect(resolveTrainerColors({ isBoss: false }).bar).toBeNull();
    });
});
