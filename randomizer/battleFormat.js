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

const { BOSS_CAP_TRAINERS } = require('./bossCaps'); // T-146 — progression boss milestones for the sequential split

const CHAMPION_ID = 'TRAINER_CHAMPION_STEVEN';
const E4_IDS = ['TRAINER_SIDNEY', 'TRAINER_PHOEBE', 'TRAINER_GLACIA', 'TRAINER_DRAKE'];
// T-089 — the committed Run & Bun doubles clones of the E4 (see include/constants/opponents.h).
const E4_DOUBLES_IDS = new Set(E4_IDS.map(id => `${id}_DOUBLES`));
const TATE_AND_LIZA_ID = 'TRAINER_TATE_AND_LIZA_1';
const GYM_BOSS_IDS = ['TRAINER_ROXANNE_1', 'TRAINER_BRAWLY_1', 'TRAINER_WATTSON_1', 'TRAINER_FLANNERY_1',
    'TRAINER_NORMAN_1', 'TRAINER_WINONA_1', TATE_AND_LIZA_ID, 'TRAINER_JUAN_1'];
// The Mossdeep Space Center multi_2_vs_2 tag battle (Maxie + Tabitha vs the player + Steven). Always
// tagged 'tag' — never single/double-converted — and shown as a Tag Battle in the docs even outside
// mixed. PARTNER_STEVEN is the ally half of that same fight.
const TAG_BATTLE_IDS = new Set(['TRAINER_MAXIE_MOSSDEEP', 'TRAINER_TABITHA_MOSSDEEP', 'PARTNER_STEVEN']);
// A double battle needs a trainer that can field two Pokémon.
const MIN_DOUBLE_TEAM_SIZE = 2;

// T-145 (ADR-018 §1) — grunt "gauntlets": back-to-back multi-grunt fights that count as ONE unit for the
// mixed singles/doubles proportion, share one battle type, and carry a "Gauntlet Battle N" display tag (in
// every format). Ordered by game progression. Members stay in the `bossTrainers` pool (all are isBoss).
const GAUNTLET_GROUPS = [
    { tag: 'Gauntlet Battle 1', ids: ['TRAINER_GRUNT_MUSEUM_1', 'TRAINER_GRUNT_MUSEUM_2'] },
    { tag: 'Gauntlet Battle 2', ids: ['TRAINER_GRUNT_SPACE_CENTER_5', 'TRAINER_GRUNT_SPACE_CENTER_6', 'TRAINER_GRUNT_SPACE_CENTER_7'] },
];
const GAUNTLET_TAG_BY_ID = new Map(GAUNTLET_GROUPS.flatMap(g => g.ids.map(id => [id, g.tag])));
/** The "Gauntlet Battle N" tag for a trainer id, or null if it isn't a gauntlet member. */
function gauntletTagOf(id) { return GAUNTLET_TAG_BY_ID.get(id) ?? null; }

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
    if (TAG_BATTLE_IDS.has(id)) return 'tag';
    if (id === CHAMPION_ID) return 'champion';
    if (E4_IDS.includes(id)) return 'e4';
    if (E4_DOUBLES_IDS.has(id)) return 'e4Doubles';
    if (GYM_BOSS_IDS.includes(id)) return 'gymBosses';
    if (isBoss) return 'bossTrainers';
    return 'normalTrainers';
}

/** A trainer may only be doubles if it can field 2+ mons and is not the excluded tag battle. */
function isEligible(trainer) {
    return !TAG_BATTLE_IDS.has(trainer.id) && (trainer.teamSize ?? 0) >= MIN_DOUBLE_TEAM_SIZE;
}

/**
 * ADR-014 — the ingame Run & Bun Elite Four split: round(%singles × 4) clamped to 1–3, so the player
 * is always offered at least one singles and one doubles E4 fight. Mirrors the frontend's
 * runAndBunE4Split (config-form.js); both are guarded by tests against the ADR.
 */
function runAndBunE4Split(singlesPercent) {
    const total = 4;
    const pct = Number.isFinite(Number(singlesPercent)) ? Number(singlesPercent) : 60;
    const singles = Math.max(1, Math.min(total - 1, Math.round((pct / 100) * total)));
    return { singles, doubles: total - singles };
}

/**
 * Group a pool's trainers into UNITS (T-145): a grunt gauntlet's members collapse to ONE unit (so it
 * consumes a single proportion slot and shares one type); every other trainer is its own unit. Units keep
 * the pool's first-appearance order; a gauntlet unit sits at its earliest member's position.
 */
function poolUnits(poolTrainers) {
    const byGauntlet = new Map();
    const units = [];
    for (const t of poolTrainers) {
        const tag = gauntletTagOf(t.id);
        if (!tag) { units.push({ members: [t] }); continue; }
        if (!byGauntlet.has(tag)) { const u = { members: [] }; byGauntlet.set(tag, u); units.push(u); }
        byGauntlet.get(tag).members.push(t);
    }
    return units;
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
            const pool = poolOf(t);
            const type = pool === 'tag'
                ? 'tag'
                : (format === 'doubles' && isEligible(t)) ? 'doubles' : 'singles';
            setType(t.id, type, pool);
        }
        return { assignments, stats };
    }

    // mixed — proportional per pool, from an isolated seeded PRNG.
    const rand = mulberry32(Number.isFinite(config.seed) ? (config.seed ^ 0x5EED) : 0x5EED);
    const singlesFraction = Math.min(1, Math.max(0, (config.singlesPercent ?? 60) / 100));

    const runAndBun = config.leagueRunAndBun === true;
    const pools = { champion: [], e4: [], e4Doubles: [], gymBosses: [], bossTrainers: [], normalTrainers: [], tag: [] };
    for (const t of trainers) pools[poolOf(t)].push(t);

    // T-146 (ADR-018 §2) — sequential split: the first part of the game is singles and the rest doubles,
    // switching at a boss. The breakpoint is the progression boss milestone at round(fraction × numBosses):
    // trainers before it are singles, that boss and everything after are doubles. No RNG (a pure function of
    // singlesPercent + displayOrder). Run & Bun still governs the E4 (excluded from the split + the count).
    if (config.mixedSequentialSplit === true) {
        for (const t of pools.tag) setType(t.id, 'tag', 'tag');
        for (const t of pools.e4Doubles) setType(t.id, isEligible(t) ? 'doubles' : 'singles', 'e4Doubles');

        const byId = new Map(trainers.map(t => [t.id, t]));
        const orderOf = t => (t && Number.isFinite(t.displayOrder) ? t.displayOrder : 0);
        // Boss spine = the bossCaps progression milestones present in this run (rival gender×starter variants
        // and multi-grunt gauntlets already collapse to one milestone each), ordered by displayOrder.
        const milestones = [];
        for (const flag of Object.keys(BOSS_CAP_TRAINERS)) {
            const ids = BOSS_CAP_TRAINERS[flag].trainers.filter(id => byId.has(id));
            if (!ids.length) continue;                                     // milestone not in this run
            if (runAndBun && ids.some(id => E4_IDS.includes(id))) continue; // E4 governed by Run & Bun
            milestones.push(Math.min(...ids.map(id => orderOf(byId.get(id)))));
        }
        milestones.sort((a, b) => a - b);
        const numBosses = milestones.length;
        const singlesCount = Math.round(singlesFraction * numBosses);
        const breakpointOrder = singlesCount <= 0 ? -Infinity
            : singlesCount >= numBosses ? Infinity
                : milestones[singlesCount];

        for (const t of trainers) {
            const pool = poolOf(t);
            if (pool === 'tag' || pool === 'e4Doubles') continue;       // already set above
            if (runAndBun && pool === 'e4') { setType(t.id, 'singles', 'e4'); continue; } // RB base E4 = singles
            const wantsDouble = orderOf(t) >= breakpointOrder;         // champion/T&L follow position, no forcing
            setType(t.id, (wantsDouble && isEligible(t)) ? 'doubles' : 'singles', pool);
        }
        return { assignments, stats };
    }

    // Tag battle (the Mossdeep trio) → always 'tag', in every format (never single/double-converted).
    for (const t of pools.tag) setType(t.id, 'tag', 'tag');

    // Run & Bun doubles clones (present only in that mode) are always the doubles version.
    for (const t of pools.e4Doubles) setType(t.id, isEligible(t) ? 'doubles' : 'singles', 'e4Doubles');

    // Champion → the majority type: >50% singles, <50% doubles, exactly 50% a seeded coin-flip.
    for (const t of pools.champion) {
        let type;
        if (!isEligible(t) || singlesFraction > 0.5) type = 'singles';
        else if (singlesFraction < 0.5) type = 'doubles';
        else type = rand() < 0.5 ? 'singles' : 'doubles';
        setType(t.id, type, 'champion');
    }

    // Multi-member pools → mark round(fraction × eligibleUnits) singles, the rest doubles. Doubles fill
    // from the front of a deterministic order; the gym pool pins Tate & Liza first (rule 8). T-145 — a pool
    // is proportioned over UNITS, where a grunt gauntlet is ONE unit (its members share the unit's type).
    const setUnit = (unit, type, key) => { for (const m of unit.members) setType(m.id, type, key); };
    const unitEligible = unit => unit.members.every(isEligible);
    for (const key of MULTI_MEMBER_POOLS) {
        const units = poolUnits(pools[key]);
        const eligible = units.filter(unitEligible);
        for (const unit of units) if (!unitEligible(unit)) setUnit(unit, 'singles', key);

        // Run & Bun: the base Elite Four are the singles versions (their doubles clones live in
        // e4Doubles and were already set above); the player chooses which to fight in-game.
        if (key === 'e4' && runAndBun) {
            for (const unit of eligible) setUnit(unit, 'singles', key);
            continue;
        }

        let ordered;
        if (key === 'gymBosses') {
            const isTL = unit => unit.members.some(t => t.id === TATE_AND_LIZA_ID);
            const tl = eligible.filter(isTL);
            const rest = shuffled(eligible.filter(u => !isTL(u)), rand);
            ordered = [...tl, ...rest];
        } else {
            ordered = shuffled(eligible, rand);
        }
        const singlesCount = Math.round(singlesFraction * eligible.length);
        const doublesCount = eligible.length - singlesCount;
        ordered.forEach((unit, i) => setUnit(unit, i < doublesCount ? 'doubles' : 'singles', key));
    }

    return { assignments, stats };
}

/**
 * ADR-014 — rival-family battle-type consistency (T-116). Every variant of a rival encounter must
 * share one battle type. May's per-location starter variants (TRAINER_MAY_<loc>_<starter>) are
 * grouped and forced to a single deterministic type; any `copy:`-linked trainer (the Brendan
 * variants) then inherits its target's type — so the docs and the ROM `.party` all agree. Mutates
 * each trainer's `battleType` in place; returns the same array.
 */
function unifyRivalBattleTypes(trainers) {
    const byId = new Map(trainers.map(t => [t.id, t]));
    const STARTER_SUFFIX = /_(TREECKO|TORCHIC|MUDKIP)$/;
    const groups = new Map();
    for (const t of trainers) {
        if (t.id.startsWith('TRAINER_MAY_') && STARTER_SUFFIX.test(t.id)) {
            const key = t.id.replace(STARTER_SUFFIX, '');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(t);
        }
    }
    for (const members of groups.values()) {
        members.sort((a, b) => (a.id < b.id ? -1 : 1));
        const bt = members[0].battleType;
        for (const m of members) m.battleType = bt;
    }
    // copy-linked trainers (Brendan) inherit their (now-grouped) target's battle type.
    for (const t of trainers) {
        if (t.copy && byId.has(t.copy)) t.battleType = byId.get(t.copy).battleType;
    }
    return trainers;
}

module.exports = {
    assignBattleTypes, poolOf, isEligible, runAndBunE4Split, unifyRivalBattleTypes, gauntletTagOf,
    CHAMPION_ID, E4_IDS, E4_DOUBLES_IDS, GYM_BOSS_IDS, TAG_BATTLE_IDS, TATE_AND_LIZA_ID, MIN_DOUBLE_TEAM_SIZE,
    GAUNTLET_GROUPS,
};
