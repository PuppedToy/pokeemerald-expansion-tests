'use strict';

// T-125 — gimmick items are BORN FROM THE BAG and claimed via the common link-aware system (not set
// directly on the mon). Increment 1: the 4 weather rocks are provisioned into the trainer bag from the
// Slateport aqua grunts onward, as ONE linked pick-group — so a team claims AT MOST ONE rock (claiming it
// forgoes the other three; a 2nd setter finds none). These tests lock the provisioning + the consume-once
// model; the RESOLVER claim is verified end-to-end by the integration/determinism suites.

const rng = require('../../rng');
const { getTrainersData } = require('../../trainers.js');
const { expandLinkedPacks, consumeLinkedUnit } = require('../../modules/itemLinks');

rng.seed(1);
const stubItems = new Proxy({}, { get: () => Array(12).fill('ITEM_POTION') });
const trainers = getTrainersData(stubItems, [], {});
const ROCKS = ['Damp Rock', 'Heat Rock', 'Smooth Rock', 'Icy Rock'];

describe('T-125 — weather rocks are provisioned into the bag (from the aqua grunts onward)', () => {
    test('a post-Slateport weather trainer (Archie) carries the 4 rocks as ONE linked pick-group', () => {
        const archie = trainers.find(t => t.id === 'TRAINER_ARCHIE');
        expect(archie).toBeTruthy();
        const { units, groups } = expandLinkedPacks(archie.bag);
        for (const r of ROCKS) expect(units).toContain(r);
        // The four rocks are a single pick-group (the "one rock per team" model).
        expect(groups.some(g => ROCKS.every(r => g.members.includes(r)))).toBe(true);
    });

    test('an early pre-Slateport trainer (Roxanne) does NOT carry the rocks', () => {
        const early = trainers.find(t => t.id === 'TRAINER_ROXANNE_1');
        if (!early) return;
        const { units } = expandLinkedPacks(early.bag);
        ROCKS.forEach(r => expect(units).not.toContain(r));
    });
});

describe('T-125 — the rock pick-group is consume-once (2 setters ⇒ only 1 rock)', () => {
    test('claiming one rock forgoes the other three (nothing left for a 2nd setter)', () => {
        const units = [...ROCKS];
        const groups = [{ members: [...ROCKS] }];
        const act = consumeLinkedUnit(units, groups, 'Damp Rock');
        expect(act.activated).toBe(true);
        expect(act.removedSiblings.sort()).toEqual(['Heat Rock', 'Icy Rock', 'Smooth Rock']);
        ROCKS.forEach(r => expect(units).not.toContain(r));
    });
});
