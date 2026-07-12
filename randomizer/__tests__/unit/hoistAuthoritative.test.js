'use strict';

// T-106 — hoistAuthoritativeAppearances moves each recurring character's authoritative (endgame)
// appearance ahead of its earlier ones, so its roster is generated first and the earlier appearances
// can echo it devolved. Non-member trainers keep their relative order (copy-trainers stay after targets).

const { hoistAuthoritativeAppearances } = require('../../trainers.js');

const ids = arr => arr.map(t => t.id);

describe('hoistAuthoritativeAppearances (T-106)', () => {
    test('moves the authoritative appearance just before the earliest member', () => {
        const data = [
            { id: 'A' }, { id: 'STEVEN_EARLY' }, { id: 'B' }, { id: 'STEVEN_MID' }, { id: 'C' }, { id: 'STEVEN_CHAMP' },
        ];
        hoistAuthoritativeAppearances(data, [
            { auth: 'STEVEN_CHAMP', members: ['STEVEN_EARLY', 'STEVEN_MID'] },
        ]);
        // Champion hoisted to just before STEVEN_EARLY; everything else keeps order.
        expect(ids(data)).toEqual(['A', 'STEVEN_CHAMP', 'STEVEN_EARLY', 'B', 'STEVEN_MID', 'C']);
    });

    test('is a no-op when the authoritative appearance is already first', () => {
        const data = [{ id: 'CHAMP' }, { id: 'EARLY' }, { id: 'X' }];
        hoistAuthoritativeAppearances(data, [{ auth: 'CHAMP', members: ['EARLY'] }]);
        expect(ids(data)).toEqual(['CHAMP', 'EARLY', 'X']);
    });

    test('preserves the order of non-member trainers (copies stay after their targets)', () => {
        const data = [
            { id: 'MAY_103' }, { id: 'BRENDAN_103', copy: 'MAY_103' }, { id: 'MAY_EG' }, { id: 'BRENDAN_EG', copy: 'MAY_EG' },
        ];
        // hoist MAY_EG (authoritative) before MAY_103 — its copy BRENDAN_EG must still follow MAY_EG.
        hoistAuthoritativeAppearances(data, [{ auth: 'MAY_EG', members: ['MAY_103'] }]);
        const order = ids(data);
        expect(order.indexOf('MAY_EG')).toBeLessThan(order.indexOf('BRENDAN_EG')); // copy after target
        expect(order.indexOf('MAY_103')).toBeLessThan(order.indexOf('BRENDAN_103'));
        expect(order.indexOf('MAY_EG')).toBeLessThan(order.indexOf('MAY_103')); // hoisted ahead
    });

    test('unknown auth/members are skipped without throwing', () => {
        const data = [{ id: 'A' }, { id: 'B' }];
        expect(() => hoistAuthoritativeAppearances(data, [{ auth: 'NOPE', members: ['ALSO_NOPE'] }])).not.toThrow();
        expect(ids(data)).toEqual(['A', 'B']);
    });
});
