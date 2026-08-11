'use strict';

// B-072 — `choice104TMs2` (the TM08-10 pick and TRAINER_KOICHI's reward, both on Route 104 SOUTH, i.e.
// before Petalburg Woods) was added without wiring it into the bag cascade, so it never reached a single
// trainer bag. See randomizer/docs/items.md § Trainer Bag Cascade for the cumulative model.

const fs = require('fs');
const path = require('path');
const rng = require('../../rng');
const { getTrainersData } = require('../../trainers.js');
const { expandLinkedPacks } = require('../../modules/itemLinks');

// tmItem(n) → `TM_${tmList[n - 1]}`, so a positional stub makes each slot identifiable.
const tmList = Array.from({ length: 100 }, (_, i) => `SLOT${i + 1}`);
const KOICHI_PICK = ['TM_SLOT8', 'TM_SLOT9', 'TM_SLOT10'];

rng.seed(1);
const stubItems = new Proxy({}, { get: () => Array(12).fill('ITEM_POTION') });
const trainers = getTrainersData(stubItems, tmList, {});
const bagOf = id => expandLinkedPacks(trainers.find(t => t.id === id).bag);

describe('B-072 — the Route 104 south TM pick (TM08-10) reaches the bag cascade', () => {
    test('Koichi still rewards and carries the pick', () => {
        const koichi = trainers.find(t => t.id === 'TRAINER_KOICHI');
        for (const tm of KOICHI_PICK) expect(koichi.reward).toContain(tm);
    });

    test('the Petalburg Woods grunt carries it as one linked pick-group', () => {
        const { units, groups } = bagOf('TRAINER_GRUNT_PETALBURG_WOODS');
        for (const tm of KOICHI_PICK) expect(units).toContain(tm);
        expect(groups.some(g => KOICHI_PICK.every(tm => g.members.includes(tm)))).toBe(true);
    });

    test('it cascades forward like every other pick', () => {
        for (const id of ['TRAINER_ROXANNE_1', 'TRAINER_BRAWLY_1', 'TRAINER_NORMAN_1']) {
            const { units } = bagOf(id);
            for (const tm of KOICHI_PICK) expect(units).toContain(tm);
        }
    });

    test('no pick group defined in trainers.js is orphaned from the bag functions', () => {
        const src = fs.readFileSync(path.join(__dirname, '../../trainers.js'), 'utf8');
        const bags = src.slice(src.indexOf('const rival103Bag'), src.indexOf('const trainersData = ['));
        const picks = [...src.matchAll(/const\s+(choice\w+)\s*=\s*\[/g)].map(m => m[1]);
        expect(picks.length).toBeGreaterThan(10); // the scan found the declarations at all
        expect(picks.filter(name => !new RegExp(`\\b${name}\\b`).test(bags))).toEqual([]);
    });
});
