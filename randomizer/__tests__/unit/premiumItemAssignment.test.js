'use strict';

// T-290 rules 1 and 7 — WHERE a premium item is obtained.
//
//   1. only in the last mega-stone batch, the one unlocked by defeating May — the owner named it:
//      TRAINER_VIOLET, TRAINER_JACKI_1, TRAINER_FREDRICK, TRAINER_DAVIS, TRAINER_JONAS (ids 17–21);
//   7. mega stones have priority — "una vez llenamos todos los slots de megapiedras los items premium
//      son los primeros que no caben y por tanto se sacan."
//
// So: `assignMegaStones` runs first and is never disturbed; premium items take the last-batch slots it
// left empty. If every slot ends up holding a mega stone, no premium item is placed at all.
//
// This lives beside `assignMegaStones` for the reason that module exists: the rule crosses a JSON
// boundary into the writer, the injector and the docs, and three copies of one such rule is exactly
// how B-062 happened.

const { assignPremiumItems, PREMIUM_ITEM_TRAINERS } = require('../../premiumItems');
const { MEGA_TRAINERS } = require('../../constants');

const pick = item => ({ item, base: `BASE_OF_${item}`, form: `FORM_OF_${item}` });
const PICKS = [pick('ITEM_RED_ORB'), pick('ITEM_BLUE_ORB'), pick('ITEM_GRISEOUS_ORB')];

// `assignMegaStones` returns { assigned: Map<trainerId, megaEvo>, hidden: [megaTrainer] }.
const megaResult = (assignedIds = []) => ({
    assigned: new Map(assignedIds.map(id => [id, { species: `MEGA_${id}` }])),
    hidden: MEGA_TRAINERS.filter(t => !assignedIds.includes(t.id)),
});

describe('T-290 — rule 1: the last batch, and only the last batch', () => {
    test('the batch is the five trainers the owner named', () => {
        expect(PREMIUM_ITEM_TRAINERS).toEqual(['17', '18', '19', '20', '21']);
        const named = PREMIUM_ITEM_TRAINERS.map(id => MEGA_TRAINERS.find(t => t.id === id).trainer);
        expect(named).toEqual([
            'TRAINER_VIOLET', 'TRAINER_JACKI_1', 'TRAINER_FREDRICK', 'TRAINER_DAVIS', 'TRAINER_JONAS',
        ]);
    });

    test('an empty slot outside the batch is never used', () => {
        // Every mega trainer empty: only the last five may carry a premium item.
        const assignment = assignPremiumItems(PICKS, megaResult([]));
        expect([...assignment.keys()].every(id => PREMIUM_ITEM_TRAINERS.includes(id))).toBe(true);
    });
});

describe('T-290 — rule 7: mega stones are never displaced', () => {
    test('a batch slot holding a mega stone keeps it', () => {
        const assignment = assignPremiumItems(PICKS, megaResult(['17', '18']));
        expect(assignment.has('17')).toBe(false);
        expect(assignment.has('18')).toBe(false);
        expect([...assignment.keys()].sort()).toEqual(['19', '20', '21']);
    });

    test('with every slot taken, nothing is placed', () => {
        const allIds = MEGA_TRAINERS.map(t => t.id);
        expect(assignPremiumItems(PICKS, megaResult(allIds)).size).toBe(0);
    });

    test('more items than slots: the surplus is dropped, in the order given', () => {
        const many = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(n => pick(`ITEM_${n}`));
        const assignment = assignPremiumItems(many, megaResult(['17', '18', '19']));
        expect(assignment.size).toBe(2);
        // `selectPremiumItems` already shuffled, so truncation is fair — it takes the front.
        expect([...assignment.values()].map(v => v.item)).toEqual(['ITEM_A', 'ITEM_B']);
    });

    test('fewer items than slots: every item is placed and the rest stay empty', () => {
        const assignment = assignPremiumItems([pick('ITEM_RED_ORB')], megaResult([]));
        expect(assignment.size).toBe(1);
    });
});

describe('T-290 — the assignment is usable by all three output paths', () => {
    test('it maps a MEGA_TRAINERS id to the whole pick', () => {
        const assignment = assignPremiumItems([pick('ITEM_RED_ORB')], megaResult([]));
        const [[trainerId, value]] = [...assignment.entries()];
        expect(MEGA_TRAINERS.some(t => t.id === trainerId)).toBe(true);
        expect(value).toEqual(expect.objectContaining({
            item: 'ITEM_RED_ORB', base: expect.any(String), form: expect.any(String),
        }));
    });

    test('slots are filled in batch order, so every path agrees on which trainer has what', () => {
        const assignment = assignPremiumItems(PICKS, megaResult([]));
        expect([...assignment.keys()]).toEqual(['17', '18', '19']);
    });

    test('no picks at all is an empty map, not a throw', () => {
        expect(assignPremiumItems([], megaResult([])).size).toBe(0);
        expect(assignPremiumItems(undefined, megaResult([])).size).toBe(0);
    });
});
