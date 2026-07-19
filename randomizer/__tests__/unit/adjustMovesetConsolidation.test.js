'use strict';

// T-159 — consolidation pass (adjustMoveset) runs once the held item is FINAL. Item-conditional moves
// must be re-judged against the ACTUAL held item, not the bag-availability signal that assignment used
// to keep the option open. A charge move whose Power Herb never materialised on THIS mon is dropped for
// a better learnable move (owner: at assignment the bag herb kept these moves on teams that never held
// the herb — "no se refleja en la experiencia").

const { rateMove, adjustMoveset } = require('../../rating');

const M = o => ({ additionalEffects: [], pp: 10, priority: 0, makesContact: 'FALSE', strikeCount: '1', accuracy: 100, ...o });
const defs = {
    MOVE_METEOR_BEAM:  M({ id: 'MOVE_METEOR_BEAM',  category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ROCK',   power: 120, effect: 'EFFECT_TWO_TURNS_ATTACK' }),
    MOVE_POWER_GEM:    M({ id: 'MOVE_POWER_GEM',    category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ROCK',   power: 80,  effect: 'EFFECT_HIT' }),
    MOVE_FLAMETHROWER: M({ id: 'MOVE_FLAMETHROWER', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIRE',   power: 90,  effect: 'EFFECT_HIT' }),
    MOVE_EARTH_POWER:  M({ id: 'MOVE_EARTH_POWER',  category: 'DAMAGE_CATEGORY_SPECIAL', type: 'GROUND', power: 90,  effect: 'EFFECT_HIT' }),
    MOVE_PROTECT:      M({ id: 'MOVE_PROTECT',      category: 'DAMAGE_CATEGORY_STATUS',  type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_PROTECT' }),
};
const moves = Object.fromEntries(Object.entries(defs).map(([k, v]) => [k, { ...v, rating: rateMove(v) }]));

const POKE = {
    id: 'SPECIES_ROCKMON',
    parsedTypes: ['ROCK'],
    parsedAbilities: ['LEVITATE'],
    baseHP: 70, baseAttack: 50, baseDefense: 70, baseSpeed: 90, baseSpAttack: 130, baseSpDefense: 80,
    learnset: [
        { level: '1', move: 'MOVE_METEOR_BEAM' },
        { level: '1', move: 'MOVE_POWER_GEM' },
        { level: '1', move: 'MOVE_FLAMETHROWER' },
        { level: '1', move: 'MOVE_EARTH_POWER' },
        { level: '1', move: 'MOVE_PROTECT' },
    ],
    rating: { tier: 'OU' },
};

describe('T-159 — adjustMoveset drops an item-orphaned charge move', () => {
    const base = () => ['MOVE_METEOR_BEAM', 'MOVE_FLAMETHROWER', 'MOVE_EARTH_POWER', 'MOVE_PROTECT'];

    test('a HELD Power Herb keeps Meteor Beam on the set', () => {
        const out = adjustMoveset(POKE, 50, base(), [], moves, 'LEVITATE', 'Power Herb', 0, {});
        expect(out).toContain('MOVE_METEOR_BEAM');
    });

    test('a mere bag-herb signal no longer saves Meteor Beam — it is dropped for a real move', () => {
        // ctx.powerHerb=true mimics "a Power Herb is in the bag" — but the mon holds Leftovers, so the
        // charge move is orphaned and must be swapped out (for the STAB Power Gem).
        const out = adjustMoveset(POKE, 50, base(), [], moves, 'LEVITATE', 'Leftovers', 0, { powerHerb: true });
        expect(out).not.toContain('MOVE_METEOR_BEAM');
        expect(out).toContain('MOVE_POWER_GEM');
    });

    test('a forced (important) charge move is never dropped even when orphaned', () => {
        const out = adjustMoveset(POKE, 50, base(), ['MOVE_METEOR_BEAM'], moves, 'LEVITATE', 'Leftovers', 0, { powerHerb: true });
        expect(out).toContain('MOVE_METEOR_BEAM');
    });
});
