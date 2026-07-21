'use strict';

// T-184 — Phase C: Wonder Guard is unbanned in the ability mutator, so any mon can now receive it
// (its HP then becomes 1 by the engine change, and the rater is Wonder-Guard-aware). The other
// "hell to rebalance" abilities stay banned; only Wonder Guard is released.

const { BANNED_ABILITIES } = require('../../rebalancer');

describe('T-184 — Wonder Guard unbanned in the ability mutator', () => {
    test('WONDER_GUARD is no longer in BANNED_ABILITIES (so it enters the mutator candidate pool)', () => {
        expect(BANNED_ABILITIES).not.toContain('WONDER_GUARD');
    });

    test('the other deliberately-banned abilities are still banned', () => {
        // We only released Wonder Guard — the rest of the "hell to rebalance" set stays put,
        // as do the form/mechanic-locked abilities.
        expect(BANNED_ABILITIES).toEqual(expect.arrayContaining([
            'TRUANT', 'SLOW_START', 'DEFEATIST', 'DISGUISE', 'POWER_CONSTRUCT',
        ]));
    });
});
