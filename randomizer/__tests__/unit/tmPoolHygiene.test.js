'use strict';

// T-263 / B-066 — TM pool hygiene, checked against the REAL move data in src/data/moves_info.h.
//
// The status pools arrived with the inherited puppedjs classification and were never reviewed: the
// terrain moves sat in goodStatusMoves and three of them filled one Route 121 pick (B-066), while the
// average tier carried moves that are strictly redundant with a sibling. These tests lock the tiers
// so the next edit has to be deliberate, and they read the game data rather than a fixture so an
// upstream sync that renames or re-effects a move fails here instead of silently in a run.

const fs = require('fs');
const path = require('path');
const { parseMovesFile } = require('../../parser');
const tms = require('../../tms');

const ROOT = path.resolve(__dirname, '..', '..', '..');

// parseMovesFile narrates skipped Z-moves/Max moves; keep the suite output clean.
function parseMovesQuietly() {
    const orig = console.log;
    console.log = () => {};
    try {
        return parseMovesFile(fs.readFileSync(path.join(ROOT, 'src', 'data', 'moves_info.h'), 'utf8'));
    } finally {
        console.log = orig;
    }
}

const moves = parseMovesQuietly();

const ALL_POOLS = [
    'averageDamagePool', 'goodDamagePool', 'strongDamagePool', 'godlikeDamagePool', 'nichePool',
    'averageStatusMoves', 'weatherMoves', 'barrierMoves', 'goodStatusMoves', 'godlikeStatusMoves',
    'goodStatusMovesDoubles', 'godlikeStatusMovesDoubles',
];

// Slot counts per status tier — see tmRanges() in tmRandomizer.js and docs/tms.md.
const STATUS_TIER_SLOTS = {
    averageStatusMoves: 11,   // TM61-71
    goodStatusMoves: 13,      // TM78-90
    godlikeStatusMoves: 5,    // TM91-95
};
const SIZE_MARGIN = 3;

// Two STATUS moves are the same card when they share an effect AND its argument. Toxic and
// Will-O-Wisp are both EFFECT_NON_VOLATILE_STATUS but carry a different .nonVolatileStatus, so they
// stay distinct. The rule is deliberately status-only: damage moves share effects by design (dozens
// of EFFECT_HIT) and are told apart by power and type, not by their effect.
const isStatusMove = (id) => (moves[id] || {}).category === 'DAMAGE_CATEGORY_STATUS';
const cardIdentity = (id) => {
    const m = moves[id] || {};
    return `${m.effect}|${m.argument || ''}`;
};

// Duplicate status cards that survive on purpose. Empty is the goal; every entry needs a reason.
// Pairs are written sorted so the key is stable.
const ACCEPTED_DUPLICATE_EFFECTS = new Map([
    ['averageStatusMoves:Fake Tears/Metal Sound', 'both -2 Sp. Def — pending owner call (T-263)'],
    ['averageStatusMoves:Roar/Whirlwind', 'identical EFFECT_ROAR — pending owner call (T-263)'],
    // Not a draw pool: TM72-75 are FIXED_TMS (Rain Dance / Sunny Day / Sandstorm / Hail), so this
    // list is documentation only and Snowscape — Hail's modern replacement — is never assigned.
    ['weatherMoves:Hail/Snowscape', 'weatherMoves is never drawn; Snowscape is listed but unused'],
]);

const displayName = (id) => (moves[id] || {}).name || id;

// pool → [[name, …], …] for every status card the pool lists more than once.
function duplicateStatusCards(pool) {
    const byCard = new Map();
    for (const id of tms[pool]) {
        if (!isStatusMove(id)) continue;
        const card = cardIdentity(id);
        byCard.set(card, [...(byCard.get(card) || []), displayName(id)]);
    }
    return [...byCard.values()].filter(names => names.length > 1);
}

describe('TM pools — structural hygiene', () => {
    test('every pooled move exists in the game data', () => {
        const unknown = [];
        for (const pool of ALL_POOLS)
            for (const id of tms[pool]) if (!moves[id]) unknown.push(`${pool}: ${id}`);
        expect(unknown).toEqual([]);
    });

    test('a move belongs to exactly one pool', () => {
        const seen = new Map();
        for (const pool of ALL_POOLS)
            for (const id of tms[pool]) seen.set(id, [...(seen.get(id) || []), pool]);
        const shared = [...seen.entries()]
            .filter(([, pools]) => pools.length > 1)
            .map(([id, pools]) => `${id}: ${pools.join(' + ')}`);
        expect(shared).toEqual([]);
    });

    test('no pool lists the same move twice', () => {
        const repeated = [];
        for (const pool of ALL_POOLS) {
            const seen = new Set();
            for (const id of tms[pool]) {
                if (seen.has(id)) repeated.push(`${pool}: ${id}`);
                seen.add(id);
            }
        }
        expect(repeated).toEqual([]);
    });
});

describe('TM pools — one status effect per pool (T-263)', () => {
    test.each(ALL_POOLS)('%s has no unjustified duplicate status effect', (pool) => {
        const unjustified = duplicateStatusCards(pool)
            .map(names => `${pool}:${[...names].sort().join('/')}`)
            .filter(key => !ACCEPTED_DUPLICATE_EFFECTS.has(key));
        expect(unjustified).toEqual([]);
    });

    test('the allow-list has no stale entries', () => {
        const live = new Set();
        for (const pool of ALL_POOLS)
            for (const names of duplicateStatusCards(pool))
                live.add(`${pool}:${[...names].sort().join('/')}`);
        expect([...ACCEPTED_DUPLICATE_EFFECTS.keys()].filter(k => !live.has(k))).toEqual([]);
    });
});

describe('TM pools — a tier can never go near-fixed', () => {
    // Deleting the 4 terrains outright would have left goodStatus with 14 candidates for 13 slots:
    // the same 13 moves nearly every singles run. A tier needs real slack over its slot count.
    test.each(Object.entries(STATUS_TIER_SLOTS))('%s keeps slack over its slots', (pool, slots) => {
        expect(tms[pool].length).toBeGreaterThanOrEqual(slots + SIZE_MARGIN);
    });
});

describe('status classification decisions (T-263)', () => {
    test('only Electric Terrain is a good-tier terrain; the other three are average', () => {
        expect(tms.goodStatusMoves).toContain('MOVE_ELECTRIC_TERRAIN');
        for (const move of ['MOVE_GRASSY_TERRAIN', 'MOVE_PSYCHIC_TERRAIN', 'MOVE_MISTY_TERRAIN']) {
            expect(tms.averageStatusMoves).toContain(move);
            expect(tms.goodStatusMoves).not.toContain(move);
        }
    });

    test('+2 defensive boosts and the unconditional -2 attack debuffs are good-tier', () => {
        for (const move of ['MOVE_AMNESIA', 'MOVE_IRON_DEFENSE', 'MOVE_HAZE', 'MOVE_ENDURE',
            'MOVE_CHARM', 'MOVE_EERIE_IMPULSE']) {
            expect(tms.goodStatusMoves).toContain(move);
            expect(tms.averageStatusMoves).not.toContain(move);
        }
    });

    test('Captivate stays average — its -2 Sp. Atk is gender-gated', () => {
        expect(tms.averageStatusMoves).toContain('MOVE_CAPTIVATE');
        expect(tms.goodStatusMoves).not.toContain('MOVE_CAPTIVATE');
    });

    test('the deleted duplicates are in no pool at all', () => {
        for (const pool of ALL_POOLS) {
            expect(tms[pool]).not.toContain('MOVE_FEATHER_DANCE');
            expect(tms[pool]).not.toContain('MOVE_ROCK_POLISH');
        }
    });
});
