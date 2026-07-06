'use strict';

// T-062 — Mega base-form STAB.
//
// When the randomizer MUTATES a mega evolution's type to a type its base form lacks
// (e.g. base Aggron Steel/Rock → Mega Aggron Steel/FIGHTING), the base form must gain a
// damaging move of that new type. Two reasons the mega's own learnset can't carry it:
//   1. A mega evolves in-battle and fights with the BASE form's known moves.
//   2. Every mega shares its base's level-up learnset array id, so the writer resolves that
//      shared array to the BASE and discards the mega's copy (see pokemonWriter.editLearnsetsFile).
// So the base form is the only place a mega's STAB can actually live.
//
// Scope (T-062 decision): only randomizer-MUTATED mega types are covered — canonical-typed
// megas (e.g. Pinsir→Flying, Sceptile→Dragon) are intentionally left untouched. This is enforced
// by keying off the mega's per-run type-change log; without a mutation there is no log entry.
//
// Moves added to the base are EXTRA (never replacements): at least one is guaranteed, with a
// decaying probability of a 2nd/3rd, mirroring the "insert extra" loop in rebalancer.js.

const rng = require('./rng');
const { insertMoveIntoLearnset } = require('./rebalancer');
const { LOG_TYPE_BUFF } = require('./constants');

const STATUS_CATEGORY = 'DAMAGE_CATEGORY_STATUS';

// A move counts as damaging if it is not a status move. NOTE: do NOT filter on `power` —
// variable-power moves like Gyro Ball / Heavy Slam / Low Kick carry power 1 but are damaging.
function isDamaging(move) {
    return !!move && move.category !== STATUS_CATEGORY;
}

/**
 * For every mega whose type was mutated this run to a type its base form lacks, guarantee the
 * base learnset contains at least one damaging move of that type (extra moves, decaying odds).
 * Mutates `base.learnset` in place and appends a `learnsetMove` log entry per inserted move.
 *
 * @param {Array} allPokes  full pokedex (base forms + megas), each with `.evolutionData`, `.log`,
 *                          `.parsedTypes`, `.learnset`.
 * @param {Object} moves    move map keyed by move id ({ type, category, rating, ... }).
 * @param {Object} [options]
 * @param {number} [options.moveInsertChance=0.5]     decay factor for extra moves.
 * @param {number} [options.moveRatingDeviation=0.2]  passed to insertMoveIntoLearnset.
 * @returns {Array} the base pokes that were modified (so the caller can re-rate them).
 */
function applyMegaBaseStab(allPokes, moves, options = {}) {
    const moveInsertChance = typeof options.moveInsertChance === 'number' ? options.moveInsertChance : 0.5;
    const moveRatingDeviation = typeof options.moveRatingDeviation === 'number' ? options.moveRatingDeviation : 0.2;

    const byId = new Map(allPokes.map(p => [p.id, p]));
    const affected = [];

    for (const mega of allPokes) {
        if (!mega.evolutionData || !mega.evolutionData.isMega) continue;

        // Types the randomizer set on the mega this run (its type-change log). Canonical-typed
        // megas produce no such log and are therefore skipped.
        const mutatedTypes = new Set(
            (mega.log || [])
                .filter(entry => entry.target === 'type' && entry.value)
                .map(entry => entry.value)
        );
        if (mutatedTypes.size === 0) continue;

        const base = byId.get(mega.evolutionData.megaBaseForm);
        if (!base) continue;

        const baseTypes = base.parsedTypes || [];
        const megaTypes = mega.parsedTypes || [];

        // In scope: types that are on the mega's final typing, were mutated this run, and the
        // base form lacks.
        const newTypes = megaTypes.filter(t => mutatedTypes.has(t) && !baseTypes.includes(t));
        if (newTypes.length === 0) continue;

        let changed = false;
        for (const type of newTypes) {
            const baseMoveIds = new Set((base.learnset || []).map(l => l.move));

            // Already covered? Skip — never add a duplicate STAB.
            const alreadyCovered = [...baseMoveIds].some(id => moves[id] && moves[id].type === type && isDamaging(moves[id]));
            if (alreadyCovered) continue;

            // Candidate pool: damaging moves of this type not already in the learnset.
            const pool = Object.entries(moves).filter(
                ([id, mv]) => mv.type === type && isDamaging(mv) && !baseMoveIds.has(id)
            );
            if (pool.length === 0) continue;

            // Guarantee >=1, then decaying odds for a 2nd/3rd (mirrors rebalancer.js:443-465):
            // amountAdded=0 → chance=1 (first is guaranteed) → 0.5 → 0.
            let amountAdded = 0;
            let chance = Math.max(0, 1 - (amountAdded * moveInsertChance));
            while (pool.length > 0 && rng.random() < chance) {
                const idx = Math.floor(rng.random() * pool.length);
                const [moveId, moveObj] = pool.splice(idx, 1)[0];

                const { learnset: newLearnset, level } =
                    insertMoveIntoLearnset(base.learnset, moveId, moveObj, moveRatingDeviation);
                base.learnset = newLearnset;

                base.log = base.log || [];
                base.log.push({
                    type: LOG_TYPE_BUFF,
                    target: 'learnsetMove',
                    oldValue: null,
                    value: moveId,
                    level,
                    reason: 'megaStab',
                    megaForm: mega.id,
                    moveType: type,
                });

                amountAdded++;
                changed = true;
                chance = Math.max(0, 1 - (amountAdded * moveInsertChance));
            }
        }

        if (changed && !affected.includes(base)) affected.push(base);
    }

    return affected;
}

module.exports = { applyMegaBaseStab, isDamaging };
