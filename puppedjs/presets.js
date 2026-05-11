'use strict';

const {
    TIER_ZU, TIER_PU, TIER_NU, TIER_RU, TIER_UU, TIER_OU, TIER_UBERS, TIER_AG,
} = require('./constants');

const DIFFICULTY = { EASY: 'EASY', FAIR: 'FAIR', HARD: 'HARD' };

// Ordered lowest → highest; index used for tier arithmetic.
const TIER_SEQ = [TIER_ZU, TIER_PU, TIER_NU, TIER_RU, TIER_UU, TIER_OU, TIER_UBERS, TIER_AG];

function shiftTier(t, delta) {
    const i = TIER_SEQ.indexOf(t);
    return i === -1 ? t : TIER_SEQ[Math.max(0, Math.min(TIER_SEQ.length - 1, i + delta))];
}

// delta = -1 (EASY) or +1 (HARD).
// topOrBottom = 'top'  → sort desc, shift top-2 down  (EASY)
//             = 'bottom' → sort asc,  shift bottom-2 up (HARD)
// Slots with isMega:true are excluded from every transform.
function applyTransform(team, delta, topOrBottom) {
    const result = team.map(s => ({
        ...s,
        contextualTier: s.contextualTier ? [...s.contextualTier] : s.contextualTier,
    }));
    const eligible = result
        .map((s, i) => ({ i, idx: TIER_SEQ.indexOf(s.contextualTier?.[0]) }))
        .filter(x => x.idx !== -1 && !result[x.i].isMega)
        .sort((a, b) => topOrBottom === 'top' ? b.idx - a.idx : a.idx - b.idx);
    for (let k = 0; k < 2 && k < eligible.length; k++) {
        const s = result[eligible[k].i];
        s.contextualTier = [shiftTier(s.contextualTier[0], delta)];
    }
    return result;
}

const easyTransform = team => applyTransform(team, -1, 'top');
const hardTransform = team => applyTransform(team, +1, 'bottom');

function getBossTeam(split, difficulty) {
    if (difficulty === DIFFICULTY.EASY) return split.easy || easyTransform(split.fair);
    if (difficulty === DIFFICULTY.HARD) return split.hard || hardTransform(split.fair);
    return split.fair;
}

// Non-boss team = EASY_transform(boss team at given difficulty),
// with any isMega slots replaced by the lowest non-mega tier in the result.
function getNonBossTeam(split, difficulty) {
    const bossTeam = getBossTeam(split, difficulty);
    const transformed = easyTransform(bossTeam);
    const nonMegaSlots = transformed.filter(s => !s.isMega && s.contextualTier?.[0]);
    if (nonMegaSlots.length === 0) return transformed;
    const lowestIdx = nonMegaSlots.reduce((min, s) => {
        const idx = TIER_SEQ.indexOf(s.contextualTier[0]);
        return idx < min ? idx : min;
    }, TIER_SEQ.length - 1);
    const lowestTier = TIER_SEQ[lowestIdx];
    return transformed.map(s =>
        s.isMega ? { contextualTier: [lowestTier], checkValidEvo: true } : s
    );
}

// Non-boss trainer bag trim/extend relative to FAIR.
const BAG_SIZE_OFFSET = { EASY: -5, FAIR: 0, HARD: +5 };

// ─── SPLITS ──────────────────────────────────────────────────────────────────
// Slot order matches the team array order in trainers.js.
// Normal slot: { contextualTier: [TIER_X], checkValidEvo: true }
// Mega/fixed slot: { isMega: true }  — skipped by transforms; replaced in
//                  getNonBossTeam() with the lowest non-mega tier.

const SPLITS = [
    // ── Early villain bosses ─────────────────────────────────────────────────
    {
        id: 'PETALBURG_WOODS_GRUNT',
        fair: [
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
        ],
    },
    {
        id: 'RUSTURF_GRUNT',
        fair: [
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
        ],
    },

    // ── Gym leaders ──────────────────────────────────────────────────────────
    {
        id: 'ROXANNE',
        fair: [
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
        ],
    },
    {
        id: 'BRAWLY',
        fair: [
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
        ],
    },

    // ── Museum grunts (shared split; each has its own entry) ─────────────────
    {
        id: 'MUSEUM_GRUNT_1',
        fair: [
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
        ],
    },
    {
        id: 'MUSEUM_GRUNT_2',
        fair: [
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
        ],
    },

    // ── More gym leaders & villain bosses ────────────────────────────────────
    {
        id: 'WATTSON',
        // Slot 1: Manectric mega (fixed)
        fair: [
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        id: 'TABITHA_CHIMNEY',
        fair: [
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        id: 'MAXIE_CHIMNEY',
        // Slot 1: Cameruptite mega (fixed)
        fair: [
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        id: 'FLANNERY',
        // Slot 1: mega (fixed)
        fair: [
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        id: 'NORMAN',
        // Slot 5: mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'SHELLY_WEATHER',
        // Slot 5: mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'WINONA',
        // Slot 1: Altaria mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },
    {
        id: 'MAXIE_MAGMA',
        // Slot 1: Cameruptite mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },
    {
        id: 'MATT_AQUA',
        // Slot 0: Snow Warning mega (fixed)
        fair: [
            { isMega: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },

    // ── Space Center grunts (all three isBoss; separate splits for slot flexibility) ──
    {
        id: 'SPACE_CENTER_GRUNT_5',
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },
    {
        id: 'SPACE_CENTER_GRUNT_6',
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },
    {
        // Slot 0 in current code uses POKEDEF_UU_OU_MEGA; for FAIR it becomes plain OU.
        id: 'SPACE_CENTER_GRUNT_7',
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },

    // ── Mossdeep encounters (3-slot teams) ───────────────────────────────────
    {
        id: 'TABITHA_MOSSDEEP',
        // Slot 1: mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },
    {
        id: 'MAXIE_MOSSDEEP',
        // Slot 2: UBERS mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { isMega: true },
        ],
    },

    // ── Late gym leaders & villain bosses ────────────────────────────────────
    {
        id: 'TATE_AND_LIZA',
        // Slot 1: specific Solrock/Lunatone (no tier; preset OU is informational for transforms)
        // Slot 3: mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },
    {
        id: 'ARCHIE',
        // Slot 1: Sharpedonite mega (fixed; uses specific: 'SPECIES_SHARPEDO')
        fair: [
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
        ],
    },
    {
        // No mega for Juan (FAIR spec removes it).
        // Current slot 0 is pokeDefUbersMega; FAIR makes it plain UBERS.
        id: 'JUAN',
        fair: [
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_UU],    checkValidEvo: true },
        ],
    },

    // ── Elite Four ───────────────────────────────────────────────────────────
    {
        id: 'SIDNEY',
        // Slot 5: mega (fixed)
        fair: [
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_UU],    checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'PHOEBE',
        // Slot 5: mega (fixed)
        fair: [
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_UU],    checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'GLACIA',
        // Slot 5: UBERS mega (fixed)
        fair: [
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'DRAKE',
        // Slot 5: UBERS mega (fixed)
        fair: [
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { isMega: true },
        ],
    },

    // ── Champion ──────────────────────────────────────────────────────────────
    {
        // Slot 2: TRAINER_REPEAT_ID for STEVEN_MEGA (treated as mega/fixed).
        // Slot 5: TRAINER_REPEAT_ID for STEVEN_LEGEND (UBERS); participates in
        //         transform math but the repeat mechanic ignores contextualTier.
        id: 'CHAMPION_STEVEN',
        fair: [
            { contextualTier: [TIER_AG],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
        ],
    },
];

// ─── Public accessors ────────────────────────────────────────────────────────

function getBossPreset(splitId, difficulty) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    return getBossTeam(split, difficulty);
}

function getNonBossPreset(splitId, difficulty) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    return getNonBossTeam(split, difficulty);
}

module.exports = {
    DIFFICULTY,
    BAG_SIZE_OFFSET,
    getBossPreset,
    getNonBossPreset,
};
