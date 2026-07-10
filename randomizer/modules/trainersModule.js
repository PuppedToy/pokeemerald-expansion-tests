'use strict';

const { randomizeItems } = require('../itemRandomizer');
const trainers = require('../trainers');
const { getDifficultyTransform, getBagSizeOffset, applyTransform } = require('../presets');
const { resolveTrainerColors } = require('../trainerColors');
const { assignBattleTypes, unifyRivalBattleTypes, runAndBunE4Split } = require('../battleFormat');

const EXEMPT_TRAINER_PREFIXES = ['TRAINER_WALLY_', 'TRAINER_MAY_', 'TRAINER_BRENDAN_'];
const EXEMPT_TRAINER_IDS = new Set(['TRAINER_STEVEN']);

function isExempt(id) {
    return EXEMPT_TRAINER_IDS.has(id) || EXEMPT_TRAINER_PREFIXES.some(p => id.startsWith(p));
}

/**
 * Randomizes items and assembles trainer teams, then applies a uniform difficulty
 * transform to every non-exempt trainer (bosses, gym leaders, E4, champion, grunts).
 *
 * @param {Object} pokedexArtifact - Must include `tmList`.
 * @param {Object} config          - Must include `difficulty` (integer 1–13).
 * @returns {{ trainersData: Object[], itemAssignments: Object }}
 */
function runTrainersModule(pokedexArtifact, config) {
    const itemAssignments = randomizeItems();
    const level = config.difficulty ?? 7;
    // T-052: config carries the trainer-facing knobs (gym/E4 type-change counts, Aqua/Magma
    // types, …) that getTrainersData reads; absent keys fall back to historical defaults.
    const trainersData = trainers.getTrainersData(itemAssignments, pokedexArtifact.tmList, config);

    // T-089/ADR-014 — League Run & Bun: give each Elite Four member a doubles-flavoured clone
    // (TRAINER_<X>_DOUBLES, committed in opponents.h). Same slot definitions → the per-slot RNG
    // reseed (keyed by trainer.id) resolves a distinct team. The base E4 stay singles; the battle-type
    // pass below marks the clones doubles. Cloned before the difficulty transform so both variants get
    // the identical (deterministic) transform.
    // TODO(T-109): once the doubles rating/archetypes land, regenerate the clone's team with the
    // doubles-shaped engine instead of reusing the singles slot definitions verbatim.
    if (config.battleFormat === 'mixed' && config.leagueRunAndBun === true) {
        const E4_BASE_IDS = ['TRAINER_SIDNEY', 'TRAINER_PHOEBE', 'TRAINER_GLACIA', 'TRAINER_DRAKE'];
        const split = runAndBunE4Split(config.singlesPercent ?? 60);
        const clones = [];
        for (const baseId of E4_BASE_IDS) {
            const base = trainersData.find(t => t.id === baseId);
            if (!base) continue;
            const bare = baseId.replace('TRAINER_', '');
            const name = bare.charAt(0) + bare.slice(1).toLowerCase();   // SIDNEY → Sidney
            const clone = structuredClone(base);
            clone.id = `${baseId}_DOUBLES`;
            // T-116 — label + choice-battle info so the docs read "Sidney Singles"/"Sidney Doubles"
            // and show the Choice Battle box (X singles / Y doubles across the E4).
            base.label = `${name} Singles`;
            clone.label = `${name} Doubles`;
            base.choiceBattle = { singles: split.singles, doubles: split.doubles };
            clone.choiceBattle = { singles: split.singles, doubles: split.doubles };
            clones.push(clone);
        }
        trainersData.push(...clones);
    }

    const { numShifts, delta, direction } = getDifficultyTransform(level);
    if (numShifts > 0) {
        for (const trainer of trainersData) {
            if (isExempt(trainer.id)) continue;
            // applyTransform shifts both contextualTier and single-tier absoluteTier slots (B-001),
            // so difficulty scales every non-exempt trainer; evolutionTier slots and megas stay fixed.
            trainer.team = applyTransform(trainer.team, delta, direction, numShifts);
        }
    }

    const bagOffset = getBagSizeOffset(level);
    if (bagOffset !== 0) {
        for (const trainer of trainersData) {
            if (trainer.isBoss || !trainer.bag || trainer.bag.length === 0) continue;
            if (bagOffset < 0) {
                trainer.bag = trainer.bag.slice(0, Math.max(0, trainer.bag.length + bagOffset));
            } else {
                const extra = trainer.bag.slice(-bagOffset);
                trainer.bag = [...trainer.bag, ...extra];
            }
        }
    }

    // T-044 — resolve each trainer's docs-viewer card colours here, the single seam both
    // writer.js (out.html) and writerDocs.js (browser bundle) consume, so both runtimes
    // colour identically. Colours depend only on static fields (class / isBoss / themeType),
    // never on the resolved team, so this is safe before team resolution.
    for (const trainer of trainersData) {
        trainer.colors = resolveTrainerColors(trainer);
    }

    // T-086/ADR-014 — decide each trainer's battle type (singles/doubles) from the run's battle
    // format and stamp it on the trainer. This flows into the bundle's trainersData; writerDocs copies
    // it onto the resolved docs SSOT and the writer emits the `Double Battle:` line (T-087). The
    // definition slot count is the ≥2-mon eligibility proxy here; the writer re-checks the resolved
    // team as a safety net. Uses an isolated PRNG, so the global rng stream (and existing seeded
    // team/starter/wild output) is untouched.
    const { assignments: battleTypes } = assignBattleTypes(
        trainersData.map(t => ({ id: t.id, isBoss: t.isBoss, teamSize: Array.isArray(t.team) ? t.team.length : 0 })),
        config,
    );
    for (const trainer of trainersData) {
        trainer.battleType = battleTypes.get(trainer.id) ?? 'singles';
    }
    // T-116 — every variant of a rival encounter shares one battle type (May's per-location starter
    // variants + the Brendan copies), so the docs tags and the ROM .party agree across the family.
    unifyRivalBattleTypes(trainersData);

    return { trainersData, itemAssignments };
}

module.exports = { runTrainersModule };
