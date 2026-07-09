'use strict';

/**
 * ADR-014 — battle-format pool taxonomy + per-trainer battle-type assignment (T-086).
 * See docs/adr/ADR-014-battle-format-representation.md.
 *
 * The randomizer decides which trainers are singles vs doubles; the maker only obeys. This module is
 * pure and deterministic: it draws from an ISOLATED PRNG seeded from the run seed, so it never
 * perturbs the global rng stream that seeds team/starter/wild output (in the default `singles`
 * format it consumes no randomness at all, so existing seeded output is byte-identical).
 */

const CHAMPION_ID = 'TRAINER_CHAMPION_STEVEN';
const E4_IDS = ['TRAINER_SIDNEY', 'TRAINER_PHOEBE', 'TRAINER_GLACIA', 'TRAINER_DRAKE'];
const TATE_AND_LIZA_ID = 'TRAINER_TATE_AND_LIZA_1';
const GYM_BOSS_IDS = ['TRAINER_ROXANNE_1', 'TRAINER_BRAWLY_1', 'TRAINER_WATTSON_1', 'TRAINER_FLANNERY_1',
    'TRAINER_NORMAN_1', 'TRAINER_WINONA_1', TATE_AND_LIZA_ID, 'TRAINER_JUAN_1'];
// Never converted: the Mossdeep Space Center multi_2_vs_2 tag battle is already a special double.
const EXCLUDED_IDS = new Set(['TRAINER_MAXIE_MOSSDEEP', 'TRAINER_TABITHA_MOSSDEEP']);
// A double battle needs a trainer that can field two Pokémon.
const MIN_DOUBLE_TEAM_SIZE = 2;

const MULTI_MEMBER_POOLS = ['e4', 'gymBosses', 'bossTrainers', 'normalTrainers'];

/** Isolated mulberry32 (same algorithm as rng.js, but a private instance — no shared state). */
function mulberry32(seedValue) {
    let t = seedValue >>> 0;
    return function () {
        t = (t + 0x6D2B79F5) | 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) | 0;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

/** Which battle-format pool a trainer belongs to (ADR-014 rule 3). */
function poolOf(trainer) {
    const { id, isBoss } = trainer;
    if (EXCLUDED_IDS.has(id)) return 'excluded';
    if (id === CHAMPION_ID) return 'champion';
    if (E4_IDS.includes(id)) return 'e4';
    if (GYM_BOSS_IDS.includes(id)) return 'gymBosses';
    if (isBoss) return 'bossTrainers';
    return 'normalTrainers';
}

/** A trainer may only be doubles if it can field 2+ mons and is not the excluded tag battle. */
function isEligible(trainer) {
    return !EXCLUDED_IDS.has(trainer.id) && (trainer.teamSize ?? 0) >= MIN_DOUBLE_TEAM_SIZE;
}

/** Deterministic Fisher–Yates shuffle using the injected random fn. Does not mutate the input. */
function shuffled(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Assign a battle type to every trainer per ADR-014.
 *
 * @param {{id:string, isBoss?:boolean, teamSize:number}[]} trainers
 * @param {{battleFormat?:string, singlesPercent?:number, seed?:number}} config
 * @returns {{ assignments: Map<string,'singles'|'doubles'>, stats: Record<string,{singles:number,doubles:number}> }}
 */
function assignBattleTypes(trainers, config = {}) {
    const format = config.battleFormat ?? 'singles';
    const assignments = new Map();
    const stats = {};
    const setType = (id, type, pool) => {
        assignments.set(id, type);
        if (!stats[pool]) stats[pool] = { singles: 0, doubles: 0 };
        stats[pool][type]++;
    };

    // singles (default) and doubles need no proportions/RNG.
    if (format !== 'mixed') {
        for (const t of trainers) {
            const type = (format === 'doubles' && isEligible(t)) ? 'doubles' : 'singles';
            setType(t.id, type, poolOf(t));
        }
        return { assignments, stats };
    }

    // mixed — proportional per pool, from an isolated seeded PRNG.
    const rand = mulberry32(Number.isFinite(config.seed) ? (config.seed ^ 0x5EED) : 0x5EED);
    const singlesFraction = Math.min(1, Math.max(0, (config.singlesPercent ?? 60) / 100));

    const pools = { champion: [], e4: [], gymBosses: [], bossTrainers: [], normalTrainers: [], excluded: [] };
    for (const t of trainers) pools[poolOf(t)].push(t);

    // Excluded → always singles (their .party stays "No"; the multi battle is script-driven).
    for (const t of pools.excluded) setType(t.id, 'singles', 'excluded');

    // Champion → the majority type: >50% singles, <50% doubles, exactly 50% a seeded coin-flip.
    for (const t of pools.champion) {
        let type;
        if (!isEligible(t) || singlesFraction > 0.5) type = 'singles';
        else if (singlesFraction < 0.5) type = 'doubles';
        else type = rand() < 0.5 ? 'singles' : 'doubles';
        setType(t.id, type, 'champion');
    }

    // Multi-member pools → mark round(fraction × eligibleCount) singles, the rest doubles. Doubles
    // fill from the front of a deterministic order; the gym pool pins Tate & Liza first (rule 8).
    for (const key of MULTI_MEMBER_POOLS) {
        const eligible = pools[key].filter(isEligible);
        for (const t of pools[key]) if (!isEligible(t)) setType(t.id, 'singles', key);

        let ordered;
        if (key === 'gymBosses') {
            const tl = eligible.filter(t => t.id === TATE_AND_LIZA_ID);
            const rest = shuffled(eligible.filter(t => t.id !== TATE_AND_LIZA_ID), rand);
            ordered = [...tl, ...rest];
        } else {
            ordered = shuffled(eligible, rand);
        }
        const singlesCount = Math.round(singlesFraction * eligible.length);
        const doublesCount = eligible.length - singlesCount;
        ordered.forEach((t, i) => setType(t.id, i < doublesCount ? 'doubles' : 'singles', key));
    }

    return { assignments, stats };
}

module.exports = {
    assignBattleTypes, poolOf, isEligible,
    CHAMPION_ID, E4_IDS, GYM_BOSS_IDS, EXCLUDED_IDS, TATE_AND_LIZA_ID, MIN_DOUBLE_TEAM_SIZE,
};
