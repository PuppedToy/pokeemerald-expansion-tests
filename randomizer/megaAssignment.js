'use strict';

/**
 * Which mega trainer gets which mega stone — the **one home** of that rule (B-062).
 *
 * The rule is small: sort the run's found mega evolutions by the level they become reachable at, then
 * walk `MEGA_TRAINERS` in order. Each trainer takes the next stone if its own level is high enough;
 * otherwise it is HIDDEN and the stone waits for a later trainer.
 *
 * It used to be written out three times — `writer.js` (the compile path, which rewrites the map JSON),
 * `writerDocs.js` (the browser, which tells the player where each stone is) and
 * `injector/modules/megaMapItems.js` (the ROM builder, which writes the item into the object-event
 * table). Three copies of a rule whose inputs cross a JSON boundary is exactly how B-062 happened, so
 * they all call this now.
 *
 * ## Why `level` is read through a function
 *
 * `foundMegaEvos[].level` can be **NaN** in a pre-B-062 bundle (see `megaBaseFormLevel` in
 * modules/wildModule.js for the cause). JSON has no NaN: `JSON.stringify` writes `null`, and reading it
 * back gives `null`, which is **0** in `a.level - b.level`. So the browser sorted with NaN and the ROM
 * builder sorted with 0 — and every stone in the run shifted position between the documentation and the
 * game. `megaEvoLevel` reads that `null` back as the NaN it was, which is the only value that makes a
 * legacy bundle's ROM agree with the documentation that shipped with it.
 *
 * New runs never reach that path: `megaBaseFormLevel` cannot return a non-finite level any more.
 */

const { MEGA_TRAINERS } = require('./constants');

/**
 * A found mega evolution's level, as the side that wrote it saw it.
 *
 * `null`/`undefined` is JSON's lossy encoding of NaN, not a level of zero — restoring it keeps the
 * comparator and the eligibility test identical on both sides of a bundle.
 */
function megaEvoLevel(megaEvo) {
    const level = megaEvo ? megaEvo.level : undefined;
    return (level === null || level === undefined) ? NaN : level;
}

/**
 * @param {Array} foundMegaEvos          the wild artifact's `foundMegaEvos` (not mutated)
 * @param {Array} trainersData           the trainers artifact's `trainersData` (not mutated)
 * @returns {{ assigned: Map<string, object>, hidden: object[] }}
 *          `assigned` maps a MEGA_TRAINERS id ('01', '02', …) to the mega evo it hands out;
 *          `hidden` holds the MEGA_TRAINERS entries that get no stone, in order.
 */
function assignMegaStones(foundMegaEvos, trainersData) {
    const queue = [...(foundMegaEvos || [])].sort((a, b) => megaEvoLevel(a) - megaEvoLevel(b));
    const assigned = new Map();
    const hidden = [];

    let next = queue.shift();
    for (const megaTrainer of MEGA_TRAINERS) {
        const trainer = (trainersData || []).find(t => t.id === megaTrainer.trainer);
        if (!trainer) {
            throw new Error(
                `megaAssignment: no trainer '${megaTrainer.trainer}' for mega trainer ${megaTrainer.id} — ` +
                `the stone it hands out cannot be decided.`);
        }
        if (!next || megaEvoLevel(next) > trainer.level) {
            hidden.push(megaTrainer);
            continue;
        }
        assigned.set(megaTrainer.id, next);
        next = queue.length ? queue.shift() : null;
    }
    return { assigned, hidden };
}

module.exports = { assignMegaStones, megaEvoLevel, MEGA_TRAINERS };
