'use strict';

const { randomizeItems } = require('../itemRandomizer');
const trainers = require('../trainers');
const { getDifficultyTransform, getBagSizeOffset, applyTransform, getNonBossQualityShift, trimTeamToSize } = require('../presets');
const { resolveTrainerColors } = require('../trainerColors');
const { assignBattleTypes, unifyRivalBattleTypes, runAndBunE4Split, gauntletTagOf } = require('../battleFormat');

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
    const trainersData = trainers.getTrainersData(itemAssignments, pokedexArtifact.tmList, config, pokedexArtifact.capLevels);

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
        for (const baseId of E4_BASE_IDS) {
            const idx = trainersData.findIndex(t => t.id === baseId);
            if (idx === -1) continue;
            const base = trainersData[idx];
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
            // T-116 feedback — keep "<Member> Singles" and "<Member> Doubles" adjacent in the docs by
            // inserting the clone right after its base (previously appended after the champion).
            trainersData.splice(idx + 1, 0, clone);
        }
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

    // T-186 — difficulty settings applied to every real trainer. Copy trainers (no own team/level —
    // they inherit their resolved target) and battle partners/allies (not enemies) are always skipped.
    // These operate on the slot-spec team BEFORE species resolution (resolveTrainerTeam.js) and before
    // battle-type assignment below, so a team shrunk to 1 shows singles everywhere and the modified level
    // flows straight into the ROM .party and the docs. All defaults are byte-identical no-ops.
    const isAlly = (t) => t.isPartner === true;

    // (2) Non-boss QUALITY modifier — non-bosses sit `nonBossQuality` quality steps below their split's
    // fair boss (default −2, already baked into the non-boss presets). Re-apply only the difference from
    // −2 on non-boss teams, composing on top of the difficulty transform above. Bosses are untouched.
    const nonBossShift = getNonBossQualityShift(config.nonBossQuality);
    if (nonBossShift.numShifts > 0) {
        for (const trainer of trainersData) {
            if (trainer.isBoss || isAlly(trainer) || !Array.isArray(trainer.team)) continue;
            trainer.team = applyTransform(trainer.team, nonBossShift.delta, nonBossShift.direction, nonBossShift.numShifts);
        }
    }

    // (3/4) Team SIZE — trim each team to the boss / non-boss cap (1–6, default 6) by dropping the
    // weakest slots (the mega ace and curated slots outrank ordinary tiers, so they survive). Runs
    // before battle-type assignment so doubles eligibility (needs ≥2 mons) reflects the trimmed size.
    const bossTeamSize = config.bossTeamSize ?? 6;
    const nonBossTeamSize = config.nonBossTeamSize ?? 6;
    if (bossTeamSize < 6 || nonBossTeamSize < 6) {
        for (const trainer of trainersData) {
            if (isAlly(trainer) || !Array.isArray(trainer.team)) continue;
            trainer.team = trimTeamToSize(trainer.team, trainer.isBoss ? bossTeamSize : nonBossTeamSize);
        }
    }

    // (5/6) LEVEL modifier — shift boss / non-boss trainer levels relative to their segment cap (default
    // 0; may be negative). Owner spec: applies to the exempt story trainers too (rival/Wally/Granite
    // Steven), never to allies. Final level clamped to [1, 100].
    const bossLevelModifier = config.bossLevelModifier ?? 0;
    const nonBossLevelModifier = config.nonBossLevelModifier ?? 0;
    if (bossLevelModifier !== 0 || nonBossLevelModifier !== 0) {
        for (const trainer of trainersData) {
            if (isAlly(trainer) || typeof trainer.level !== 'number') continue;
            const mod = trainer.isBoss ? bossLevelModifier : nonBossLevelModifier;
            trainer.level = Math.max(1, Math.min(100, trainer.level + mod));
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
        // T-146 — displayOrder (the canonical story order, stamped by hoistAuthoritativeAppearances) drives
        // the mixed sequential split's game-progression ordering.
        trainersData.map(t => ({ id: t.id, isBoss: t.isBoss, teamSize: Array.isArray(t.team) ? t.team.length : 0, displayOrder: t.displayOrder })),
        config,
    );
    for (const trainer of trainersData) {
        trainer.battleType = battleTypes.get(trainer.id) ?? 'singles';
        // T-145 — a grunt gauntlet member carries its "Gauntlet Battle N" display tag in EVERY format
        // (orthogonal to battleType; the viewer shows it as an additional badge).
        const gauntletTag = gauntletTagOf(trainer.id);
        if (gauntletTag) trainer.gauntletTag = gauntletTag;
    }
    // T-116 — every variant of a rival encounter shares one battle type (May's per-location starter
    // variants + the Brendan copies), so the docs tags and the ROM .party agree across the family.
    unifyRivalBattleTypes(trainersData);

    return { trainersData, itemAssignments };
}

module.exports = { runTrainersModule };
