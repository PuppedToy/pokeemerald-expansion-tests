'use strict';

// T-187 — Move mutation.
//
// Optional randomization step that mutates move power / accuracy / type / category, mirroring the
// pokemon stat-mutation mechanism (see randomizer/rebalancer.js) as closely as possible: a per-move
// eligibility gate, then independent per-field rolls, and a `log` array of {type,target,oldValue,value}
// entries (same shape pokemon carry) so the viewer can surface buff/nerf/adjusted identically.
//
// It runs BEFORE pokemon are rated/rebalanced (randomizer/modules/pokedexModule.js), so pokemon,
// trainers and wild encounters all "see" the mutated moves. When the feature is off it is never called,
// so no RNG is drawn and existing seeds/outputs stay byte-identical.
//
// Owner decisions (T-187): power/accuracy jump ±5 with a stacking repeat-gate (same mechanism as
// pokemon stats, magnitude 5). Direction 50/50. Clamp power to [5,250], accuracy to [10,100] (never 0).
// Type change is neutral (ADJUSTMENT); category flips Physical<->Special only (never Status), neutral.

const { LOG_TYPE_BUFF, LOG_TYPE_NERF, LOG_TYPE_ADJUSTMENT, POKEMON_TYPES } = require('./constants');
const rng = require('./rng');

// Default per-field probabilities (owner-set). Overridable via opts; each falls back to its default.
const MOVE_MUTATION_CHANCE = 0.10;   // per-move eligibility gate
const MOVE_POWER_CHANCE    = 0.70;   // only if the move is not status
const MOVE_ACCURACY_CHANCE = 0.50;   // only if accuracy !== 0
const MOVE_TYPE_CHANCE     = 0.10;
const MOVE_CATEGORY_CHANCE = 0.10;   // only if the move is not status

// ±5 with a stacking repeat-gate, mirroring the pokemon stat loop (magnitude 5 instead of 10).
const STEP = 5;
const BUFF_CHANCE = 0.5;             // 50/50 buff vs nerf direction
const REPEAT_CHANCE = 0.5;           // each success stacks another ±STEP (same as REPEAT_STAT_CHANCE)

const POWER_MIN = 5, POWER_MAX = 250;
const ACC_MIN = 10, ACC_MAX = 100;

const CATEGORY_PHYSICAL = 'DAMAGE_CATEGORY_PHYSICAL';
const CATEGORY_SPECIAL  = 'DAMAGE_CATEGORY_SPECIAL';
const CATEGORY_STATUS   = 'DAMAGE_CATEGORY_STATUS';

const num = (v, def) => (typeof v === 'number' && Number.isFinite(v) ? v : def);

function isStatus(move) {
    return move.category === CATEGORY_STATUS;
}

// One signed jump: base ±STEP, then a stacking repeat-gate adds another ±STEP each success.
function rollDelta() {
    const dir = rng.random() < BUFF_CHANCE ? STEP : -STEP;
    let change = dir;
    while (rng.random() < REPEAT_CHANCE) {
        change += dir;
    }
    return change;
}

/**
 * Mutate a single move object IN PLACE and return its change log (empty if untouched).
 * The gate is rolled first (mirroring rebalancer's per-mon gate); on failure nothing else is rolled.
 */
function mutateMove(move, opts = {}) {
    const gate        = num(opts.moveMutationChance, MOVE_MUTATION_CHANCE);
    const powerChance = num(opts.movePowerChance, MOVE_POWER_CHANCE);
    const accChance   = num(opts.moveAccuracyChance, MOVE_ACCURACY_CHANCE);
    const typeChance  = num(opts.moveTypeChance, MOVE_TYPE_CHANCE);
    const catChance   = num(opts.moveCategoryChance, MOVE_CATEGORY_CHANCE);

    // Per-field category toggles (default on), mirroring rebalancer's mutateStats/Types/… A field that
    // is off is skipped entirely — its roll is never drawn — so it cannot shift the RNG stream.
    const doPower    = opts.mutatePower    !== false;
    const doAccuracy = opts.mutateAccuracy !== false;
    const doType     = opts.mutateType     !== false;
    const doCategory = opts.mutateCategory !== false;

    const log = [];

    // Per-move eligibility gate (same shape as rebalancer: skip when the roll exceeds the threshold).
    if (rng.random() > gate) {
        return log;
    }

    const status = isStatus(move);

    // Power — non-status only. ±5 stacking, clamped. No-op after clamp emits no entry.
    if (doPower && !status && rng.random() < powerChance) {
        const oldValue = move.power;
        const change = rollDelta();
        const newValue = Math.min(POWER_MAX, Math.max(POWER_MIN, oldValue + change));
        if (newValue !== oldValue) {
            move.power = newValue;
            log.push({
                type: newValue > oldValue ? LOG_TYPE_BUFF : LOG_TYPE_NERF,
                target: 'power',
                oldValue,
                value: newValue - oldValue,
            });
        }
    }

    // Accuracy — only if it has an accuracy check (accuracy !== 0). ±5 stacking, clamped, never 0.
    if (doAccuracy && move.accuracy !== 0 && rng.random() < accChance) {
        const oldValue = move.accuracy;
        const change = rollDelta();
        const newValue = Math.min(ACC_MAX, Math.max(ACC_MIN, oldValue + change));
        if (newValue !== oldValue) {
            move.accuracy = newValue;
            log.push({
                type: newValue > oldValue ? LOG_TYPE_BUFF : LOG_TYPE_NERF,
                target: 'accuracy',
                oldValue,
                value: newValue - oldValue,
            });
        }
    }

    // Type — uniform over real battle types excluding the current one. Neutral.
    if (doType && rng.random() < typeChance) {
        const oldValue = move.type;
        const pool = POKEMON_TYPES.filter(t => t !== oldValue);
        if (pool.length) {
            const newType = pool[Math.floor(rng.random() * pool.length)];
            move.type = newType;
            log.push({
                type: LOG_TYPE_ADJUSTMENT,
                target: 'type',
                oldValue,
                value: newType,
            });
        }
    }

    // Category — non-status only. Flip Physical<->Special (never Status). Neutral.
    if (doCategory && !status && rng.random() < catChance) {
        const oldValue = move.category;
        const newCategory = oldValue === CATEGORY_PHYSICAL ? CATEGORY_SPECIAL : CATEGORY_PHYSICAL;
        move.category = newCategory;
        log.push({
            type: LOG_TYPE_ADJUSTMENT,
            target: 'category',
            oldValue,
            value: newCategory,
        });
    }

    return log;
}

/**
 * Mutate every move in the `moves` map IN PLACE. Attaches a `log` array to each move that actually
 * changed. Iterates in insertion (parse) order for determinism. Returns the same `moves` object.
 */
function mutateAllMoves(moves, opts = {}) {
    Object.keys(moves).forEach(id => {
        const log = mutateMove(moves[id], opts);
        if (log.length) {
            moves[id].log = log;
        }
    });
    return moves;
}

module.exports = {
    mutateMove,
    mutateAllMoves,
    // Exposed for callers/tests
    MOVE_MUTATION_CHANCE,
    MOVE_POWER_CHANCE,
    MOVE_ACCURACY_CHANCE,
    MOVE_TYPE_CHANCE,
    MOVE_CATEGORY_CHANCE,
};
