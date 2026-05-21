'use strict';

const {
    TIER_MAGIKARP, TIER_ZU, TIER_PU, TIER_NU, TIER_RU, TIER_UU, TIER_OU, TIER_UBERS, TIER_AG,
    TIER_SEQ,
} = require('./constants');

function shiftTier(t, delta) {
    const i = TIER_SEQ.indexOf(t);
    return i === -1 ? t : TIER_SEQ[Math.max(0, Math.min(TIER_SEQ.length - 1, i + delta))];
}

// delta: -1 (down) or +1 (up).
// topOrBottom: 'top' → shift the N highest-tier slots down; 'bottom' → shift N lowest up.
// numShifts: how many slots to shift (|level - 7|).
// Slots without contextualTier (isMega, special, oneOf, etc.) are naturally skipped.
function applyTransform(team, delta, topOrBottom, numShifts) {
    const result = team.map(s => ({
        ...s,
        contextualTier: s.contextualTier ? [...s.contextualTier] : s.contextualTier,
        maxTierDownSteps: s.maxTierDownSteps,
        fallback: s.fallback
            ? s.fallback.map(fb => ({
                ...fb,
                contextualTier: fb.contextualTier ? [...fb.contextualTier] : fb.contextualTier,
            }))
            : s.fallback,
    }));
    const eligible = result
        .map((s, i) => ({ i, idx: TIER_SEQ.indexOf(s.contextualTier?.[0]) }))
        .filter(x => x.idx !== -1 && !result[x.i].isMega)
        .sort((a, b) => topOrBottom === 'top' ? b.idx - a.idx : a.idx - b.idx);
    for (let k = 0; k < numShifts && k < eligible.length; k++) {
        const s = result[eligible[k].i];
        s.contextualTier = [shiftTier(s.contextualTier[0], delta)];
        if (s.fallback) {
            for (const fb of s.fallback) {
                if (fb.contextualTier) fb.contextualTier = [shiftTier(fb.contextualTier[0], delta)];
            }
        }
    }
    return result;
}

// Returns { numShifts, delta, direction } for a 1–13 difficulty level.
function getDifficultyTransform(level) {
    const n = Math.abs(level - 7);
    if (level < 7) return { numShifts: n, delta: -1, direction: 'top' };
    if (level > 7) return { numShifts: n, delta: +1, direction: 'bottom' };
    return { numShifts: 0, delta: 0, direction: null };
}

// Bag size offset relative to fair (level 7): ±7 at checkpoints 4/10, ±14 at extremes 1/13.
function getBagSizeOffset(level) {
    return Math.round((level - 7) * 7 / 3);
}

// Non-boss baseline = 2 tiers below the fair boss baseline.
const easyTransform = team => applyTransform(team, -1, 'top', 2);

function getBossTeam(split) {
    return split.fair;
}

// Non-boss team = 2-shift-down of the fair boss team,
// with any isMega slots replaced by the lowest non-mega tier in the result.
function getNonBossTeam(split) {
    const bossTeam = getBossTeam(split);
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
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
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
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_PU], checkValidEvo: true },
        ],
    },
    {
        id: 'GRANITE_CAVE_STEVEN',
        fair: [
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
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { isMega: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
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
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        id: 'SPACE_CENTER_GRUNT_6',
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        // Slot 0 in current code uses POKEDEF_UU_OU_MEGA; for FAIR it becomes plain OU.
        id: 'SPACE_CENTER_GRUNT_7',
        fair: [
            { isMega: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
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

function getBossPreset(splitId) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    return getBossTeam(split);
}

function getNonBossPreset(splitId) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    return getNonBossTeam(split);
}

module.exports = {
    getBossPreset,
    getNonBossPreset,
    getDifficultyTransform,
    getBagSizeOffset,
    applyTransform,
};
