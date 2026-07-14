'use strict';

// T-133 — link-aware bag/TM consumption (the SSOT for "use one item from a pick-pack, forgo its siblings").
//
// A "pouch" = a flat multiset of ids (`units`, item display names OR MOVE_* ids) + `groups`
// ([{ members:[id,…] }], each = ONE player pick-instance, local to that trainer's bag). Consuming one unit:
//   • "unlinked units of X" = count(X in units) − (#groups containing X).
//   • if unlinked(X) > 0 → spend a loose/buyable/fixed unit → NO siblings removed.
//   • else → the pack ACTIVATES: remove one X + one unit of each present sibling, and drop the group.
// This reproduces every owner example (2026-07-14), including the buyable-copy accounting and the
// "Rotom uses two moves from one pack" self-block bug (prevented when loose copies exist).

const { consumeLinkedUnit, unlinkedCount } = require('../../modules/itemLinks');

const count = (arr, id) => arr.filter(x => x === id).length;

describe('itemLinks — unlinkedCount', () => {
    test('a loose copy alongside a pack copy → one unlinked unit', () => {
        const units = ['Flamethrower', 'Flamethrower', 'Thunderbolt', 'Sludge Bomb'];
        const groups = [{ members: ['Flamethrower', 'Thunderbolt', 'Sludge Bomb'] }];
        expect(unlinkedCount(units, groups, 'Flamethrower')).toBe(1); // 2 units − 1 pack claim
        expect(unlinkedCount(units, groups, 'Thunderbolt')).toBe(0);  // 1 unit − 1 pack claim
    });
});

describe('itemLinks — consumeLinkedUnit (core pick-pack)', () => {
    test('using one berry from a pick-pack removes one unit of each sibling and drops the group', () => {
        const units = ['Chople Berry', 'Occa Berry', 'Yache Berry'];
        const groups = [{ members: ['Chople Berry', 'Occa Berry', 'Yache Berry'] }];
        const res = consumeLinkedUnit(units, groups, 'Chople Berry');
        expect(res.removed).toBe(true);
        expect(res.activated).toBe(true);
        expect(res.removedSiblings.sort()).toEqual(['Occa Berry', 'Yache Berry']);
        expect(units).toEqual([]);      // Chople used, Occa+Yache forgone
        expect(groups).toEqual([]);     // pick made → group spent
    });

    test('an unlinked single item (no group) → consumed with no activation', () => {
        const units = ['Life Orb'];
        const groups = [];
        const res = consumeLinkedUnit(units, groups, 'Life Orb');
        expect(res).toMatchObject({ removed: true, activated: false });
        expect(units).toEqual([]);
    });

    test('consuming an id that is not present → removed:false, nothing changes', () => {
        const units = ['Leftovers'];
        const groups = [];
        expect(consumeLinkedUnit(units, groups, 'Life Orb')).toMatchObject({ removed: false });
        expect(units).toEqual(['Leftovers']);
    });
});

describe('itemLinks — buyable loose copies (owner nuance 3)', () => {
    // A boss with a LOOSE (buyable) Flamethrower + a pack {Flamethrower, Thunderbolt, Sludge Bomb}.
    const freshState = () => ({
        units: ['Flamethrower', 'Flamethrower', 'Thunderbolt', 'Sludge Bomb'],
        groups: [{ members: ['Flamethrower', 'Thunderbolt', 'Sludge Bomb'] }],
    });

    test('assigning Flamethrower (2 units, one loose) does NOT decrement the siblings', () => {
        const { units, groups } = freshState();
        const res = consumeLinkedUnit(units, groups, 'Flamethrower');
        expect(res.activated).toBe(false);          // spent the loose copy
        expect(count(units, 'Thunderbolt')).toBe(1); // siblings intact
        expect(count(units, 'Sludge Bomb')).toBe(1);
        expect(count(units, 'Flamethrower')).toBe(1); // pack copy remains
        expect(groups).toHaveLength(1);
    });

    test('assigning Thunderbolt detects the 2 Flamethrowers and removes only ONE', () => {
        const { units, groups } = freshState();
        const res = consumeLinkedUnit(units, groups, 'Thunderbolt');
        expect(res.activated).toBe(true);
        expect(count(units, 'Flamethrower')).toBe(1); // one removed, the loose one survives
        expect(count(units, 'Sludge Bomb')).toBe(0);  // sibling removed
        expect(count(units, 'Thunderbolt')).toBe(0);  // used
        expect(groups).toEqual([]);
    });
});

describe('itemLinks — self-block bug prevented (owner nuance 2)', () => {
    test('a mon using two moves from one pack does not block itself/teammates when loose copies exist', () => {
        // loose Flamethrower + loose Thunderbolt (both buyable) + the pack.
        const units = ['Flamethrower', 'Flamethrower', 'Thunderbolt', 'Thunderbolt', 'Sludge Bomb'];
        const groups = [{ members: ['Flamethrower', 'Thunderbolt', 'Sludge Bomb'] }];
        expect(consumeLinkedUnit(units, groups, 'Flamethrower').activated).toBe(false);
        expect(consumeLinkedUnit(units, groups, 'Thunderbolt').activated).toBe(false);
        // pack still intact for a teammate; neither move was blocked
        expect(count(units, 'Flamethrower')).toBe(1);
        expect(count(units, 'Thunderbolt')).toBe(1);
        expect(groups).toHaveLength(1);
    });
});

describe('itemLinks — separate links stay independent (owner nuance 6)', () => {
    test('the weather ROCKS link and the weather-setting TM link do not interact', () => {
        const units = ['Heat Rock', 'Damp Rock', 'Smooth Rock', 'Icy Rock',
            'MOVE_SUNNY_DAY', 'MOVE_RAIN_DANCE', 'MOVE_SANDSTORM', 'MOVE_SNOWSCAPE'];
        const groups = [
            { members: ['Heat Rock', 'Damp Rock', 'Smooth Rock', 'Icy Rock'] },
            { members: ['MOVE_SUNNY_DAY', 'MOVE_RAIN_DANCE', 'MOVE_SANDSTORM', 'MOVE_SNOWSCAPE'] },
        ];
        const res = consumeLinkedUnit(units, groups, 'Heat Rock');
        expect(res.removedSiblings.sort()).toEqual(['Damp Rock', 'Icy Rock', 'Smooth Rock']);
        // the TM link is untouched
        expect(count(units, 'MOVE_SUNNY_DAY')).toBe(1);
        expect(groups).toHaveLength(1);
        expect(groups[0].members).toContain('MOVE_SUNNY_DAY');
    });
});

describe('normalizeTrainerBagTms — expands linked packs into bag/tms + link groups (T-133)', () => {
    const { normalizeTrainerBagTms } = require('../../modules/resolveTrainerTeam');
    const { linkedChoiceSample } = require('../../modules/itemLinks');

    test('item packs → bag + bagLinks; TM packs → tms + tmLinks (TM_→MOVE_); loose entries stay unlinked', () => {
        const trainer = {
            bag: [
                'Leftovers',                                                   // loose item
                linkedChoiceSample(['Chople Berry', 'Occa Berry', 'Yache Berry']), // item pack
                'TM_FLAMETHROWER',                                             // loose TM
                linkedChoiceSample(['TM_THUNDERBOLT', 'TM_ICE_BEAM', 'TM_ENERGY_BALL']), // TM pack
            ],
        };
        normalizeTrainerBagTms(trainer);
        expect(trainer.bag).toEqual(['Leftovers', 'Chople Berry', 'Occa Berry', 'Yache Berry']);
        expect(trainer.tms).toEqual(['MOVE_FLAMETHROWER', 'MOVE_THUNDERBOLT', 'MOVE_ICE_BEAM', 'MOVE_ENERGY_BALL']);
        expect(trainer.bagLinks).toEqual([{ members: ['Chople Berry', 'Occa Berry', 'Yache Berry'] }]);
        expect(trainer.tmLinks).toEqual([{ members: ['MOVE_THUNDERBOLT', 'MOVE_ICE_BEAM', 'MOVE_ENERGY_BALL'] }]);
    });

    test('a plain bag (no packs) is unchanged and yields empty link lists (behaviour-preserving)', () => {
        const trainer = { bag: ['Life Orb', 'TM_EARTHQUAKE', 'Sitrus Berry'] };
        normalizeTrainerBagTms(trainer);
        expect(trainer.bag).toEqual(['Life Orb', 'Sitrus Berry']);
        expect(trainer.tms).toEqual(['MOVE_EARTHQUAKE']);
        expect(trainer.bagLinks).toEqual([]);
        expect(trainer.tmLinks).toEqual([]);
    });
});

describe('itemLinks — repeated id across two packs (owner nuance 5, just in case)', () => {
    test('spending one pack leaves the other pack claiming the remaining unit', () => {
        // (shouldn't normally happen, but must degrade gracefully)
        const units = ['Fire Gem', 'Fire Gem', 'Water Gem', 'Grass Gem'];
        const groups = [
            { members: ['Fire Gem', 'Water Gem'] },
            { members: ['Fire Gem', 'Grass Gem'] },
        ];
        const res = consumeLinkedUnit(units, groups, 'Fire Gem');
        expect(res.activated).toBe(true);
        expect(count(units, 'Fire Gem')).toBe(1); // one pack spent, the other still holds a Fire Gem
        expect(groups).toHaveLength(1);
    });
});
