// B-062 — the mega stone on the ground was not the one the documentation promised.
//
// `foundMegaEvos[].level` is `Math.max(levelFound, Number(evolveLevel))`. For an ITEM evolution
// (Scyther → Scizor by stone, Kirlia → Gallade by Dawn Stone) `param` is an item constant, so
// `Number(param)` is **NaN** — and the level with it.
//
// That NaN is invisible until the bundle is serialised. JSON has no NaN, so `JSON.stringify` writes
// `null`, and the two ends of the pipeline then sort *different values*:
//
//   * the browser, which built the docs, sorted with `level: NaN` — a comparator returning NaN is
//     treated as "equal", so those entries drifted wherever the engine's merge left them;
//   * the ROM builder, which reads the bundle back, sorted with `level: null` — which is **0** in
//     `a.level - b.level`, so those entries jumped to the FRONT of the queue and shifted every
//     single mega stone by one position.
//
// Measured on the run that found this (bundle-735016030, wildEncounterType "classic"): 0 of 21 mega
// stones matched the documentation shipped with the ROM. Jagged Pass documented Pidgeotite and the
// ball handed over Scizorite.
//
// Two things are tested here, and both must hold:
//   1. no run may ever produce a non-finite level again (the cause — see wildModule.test.js);
//   2. the assignment must survive a JSON round-trip unchanged (the amplifier), so the docs the
//      player reads and the item the ball gives can never disagree again.
const { assignMegaStones, megaEvoLevel } = require('../../megaAssignment');
const { MEGA_TRAINERS } = require('../../constants');

/** trainersData with every mega trainer at `levels`, so nothing is hidden for level reasons. */
const megaTrainers = (levels = 99) => MEGA_TRAINERS.map(m => ({ id: m.trainer, level: levels }));

const itemsInOrder = (found, trainersData = megaTrainers()) => {
    const { assigned } = assignMegaStones(found, trainersData);
    return MEGA_TRAINERS.map(m => (assigned.has(m.id) ? assigned.get(m.id).item : null));
};

describe('MEGA_TRAINERS', () => {
    // assignMegaStones looks each mega trainer up by trainer id; a repeat would make one of them
    // unreachable and silently mis-assign the rest.
    test('every entry names a distinct trainer', () => {
        const ids = MEGA_TRAINERS.map(m => m.trainer);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('assignMegaStones — the rule itself', () => {
    test('hands the stones out in level order, walking MEGA_TRAINERS in order', () => {
        const found = [
            { item: 'ITEM_SCEPTILITE', level: 30 },
            { item: 'ITEM_BLAZIKENITE', level: 10 },
            { item: 'ITEM_SWAMPERTITE', level: 20 },
        ];
        expect(itemsInOrder(found).slice(0, 4)).toEqual([
            'ITEM_BLAZIKENITE', 'ITEM_SWAMPERTITE', 'ITEM_SCEPTILITE', null,
        ]);
    });

    test('hides a trainer whose level is below the next stone, and keeps the stone queued', () => {
        const found = [{ item: 'ITEM_SCEPTILITE', level: 50 }, { item: 'ITEM_BLAZIKENITE', level: 10 }];
        const trainersData = megaTrainers(20);
        trainersData[1].level = 60;                       // only the second trainer is high enough

        const { assigned, hidden } = assignMegaStones(found, trainersData);
        expect(assigned.get(MEGA_TRAINERS[0].id).item).toBe('ITEM_BLAZIKENITE');
        expect(assigned.get(MEGA_TRAINERS[1].id).item).toBe('ITEM_SCEPTILITE');
        expect(hidden.map(m => m.id)).toEqual(MEGA_TRAINERS.slice(2).map(m => m.id));
    });

    test('hides every remaining trainer once the stones run out', () => {
        const { assigned, hidden } = assignMegaStones([{ item: 'ITEM_SABLENITE', level: 5 }], megaTrainers());
        expect(assigned.size).toBe(1);
        expect(hidden).toHaveLength(MEGA_TRAINERS.length - 1);
    });

    test('refuses to guess when the bundle has no trainer for a mega trainer', () => {
        const trainersData = megaTrainers().filter(t => t.id !== MEGA_TRAINERS[3].trainer);
        expect(() => assignMegaStones([{ item: 'ITEM_SABLENITE', level: 5 }], trainersData))
            .toThrow(MEGA_TRAINERS[3].trainer);
    });
});

describe('B-062 — the assignment survives the bundle round-trip', () => {
    // The browser holds NaN; the bundle on disk holds null; the ROM builder reads null back. All three
    // must produce the same queue, or the docs and the ROM describe different games.
    const inMemory = [
        { item: 'ITEM_AGGRONITE', level: 29 },
        { item: 'ITEM_SCIZORITE', level: NaN },      // Scyther → Scizor evolves by ITEM, not by level
        { item: 'ITEM_PIDGEOTITE', level: 29 },
        { item: 'ITEM_GALLADITE', level: NaN },      // Kirlia → Gallade, Dawn Stone
        { item: 'ITEM_TYRANITARITE', level: 46 },
    ];
    const roundTripped = JSON.parse(JSON.stringify(inMemory));

    test('JSON really does turn a NaN level into null (the mechanism)', () => {
        expect(roundTripped.map(e => e.level)).toEqual([29, null, 29, null, 46]);
    });

    test('a NaN level and its serialised null produce the same assignment', () => {
        expect(itemsInOrder(roundTripped)).toEqual(itemsInOrder(inMemory));
    });

    test('megaEvoLevel reads a serialised null back as the NaN it was', () => {
        expect(megaEvoLevel({ level: null })).toBeNaN();
        expect(megaEvoLevel({ level: undefined })).toBeNaN();
        expect(megaEvoLevel({ level: 29 })).toBe(29);
    });

    // The sort must not be the only thing that agrees: a non-finite level must also never make a
    // trainer eligible or ineligible differently on the two sides.
    test('a non-finite level never hides a trainer the other side kept', () => {
        const low = megaTrainers(5);
        expect(itemsInOrder(roundTripped, low)).toEqual(itemsInOrder(inMemory, low));
    });
});
