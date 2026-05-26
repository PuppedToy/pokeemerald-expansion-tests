'use strict';

const {
    TIER_MAGIKARP, TIER_ZU, TIER_PU, TIER_NU, TIER_RU, TIER_UU, TIER_OU, TIER_UBERS, TIER_AG,
    TIER_SEQ,
    TIER_LEGEND,
    EVO_TYPE_LC,
} = require('./constants');

function tiersUpTo(maxTier) {
    const maxIdx = TIER_SEQ.indexOf(maxTier);
    return maxIdx === -1 ? [maxTier] : TIER_SEQ.slice(0, maxIdx + 1);
}

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

// Non-boss team = 2-shift-down of the fair boss team.
// megaTier=null: isMega slots replaced with lowest non-mega tier (no tryMega).
// megaTier=TIER_X: isMega slots become { tryMega: true, contextualTier: [TIER_X] }.
// If the split has no isMega slot and megaTier is provided, injects tryMega at slot 0.
function getNonBossTeam(split, megaTier = null) {
    const bossTeam = getBossTeam(split);
    const transformed = easyTransform(bossTeam);
    const hasMegaSlot = transformed.some(s => s.isMega);

    if (!hasMegaSlot) {
        if (!megaTier) return transformed;
        const result = [...transformed];
        result[0] = { tryMega: true, contextualTier: [megaTier], checkValidEvo: true };
        return result;
    }

    const nonMegaSlots = transformed.filter(s => !s.isMega && s.contextualTier?.[0]);
    if (nonMegaSlots.length === 0) return transformed;
    const lowestIdx = nonMegaSlots.reduce((min, s) => {
        const idx = TIER_SEQ.indexOf(s.contextualTier[0]);
        return idx < min ? idx : min;
    }, TIER_SEQ.length - 1);
    const lowestTier = TIER_SEQ[lowestIdx];
    const megaSlot = megaTier
        ? { isMega: true, absoluteTier: tiersUpTo(megaTier), checkValidEvo: true }
        : { contextualTier: [lowestTier], checkValidEvo: true };
    return transformed.map(s => s.isMega ? megaSlot : s);
}

// ─── SPLITS ──────────────────────────────────────────────────────────────────
// Slot order matches the team array order in trainers.js.
// Normal slot: { contextualTier: [TIER_X], checkValidEvo: true }
// Mega/fixed slot: { isMega: true }  — skipped by transforms; replaced in
//                  getNonBossTeam() with the lowest non-mega tier.

const SPLITS = [
    // ── Pre-boss fictional splits (no real boss; designed so easyTransform = intended non-boss team) ──
    {
        // fair → easyTransform → [ZU_LC×5, MAGIKARP]
        id: 'PRE_RIVAL',
        fair: [
            { contextualTier: [TIER_PU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_PU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_ZU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_ZU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_ZU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_MAGIKARP], checkValidEvo: true },
        ],
    },
    {
        // fair → easyTransform → [PU_LC, ZU_LC×5]
        id: 'POST_RIVAL',
        fair: [
            { contextualTier: [TIER_NU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_PU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_ZU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_ZU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_ZU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
            { contextualTier: [TIER_ZU], evoType: [EVO_TYPE_LC], checkValidEvo: true },
        ],
    },

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
    {
        // fair → easyTransform → [RU, NU×5]  (Route 110 interlude, before Wattson)
        id: 'POST_MUSEUM_GRUNTS',
        fair: [
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
            { contextualTier: [TIER_NU], checkValidEvo: true },
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
        // Slot 5: Manectric mega (fixed)
        fair: [
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { isMega: true },
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
        // Slot 5: Cameruptite mega (fixed)
        fair: [
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'FLANNERY',
        // Slot 5: mega (fixed)
        fair: [
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { contextualTier: [TIER_RU], checkValidEvo: true },
            { isMega: true },
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
        // Slot 5: Altaria mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'MAXIE_MAGMA',
        // Slot 5: Cameruptite mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'MATT_AQUA',
        // Slot 5: Snow Warning mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
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
        // Slot 5: mega (fixed); slot 0 is plain OU.
        id: 'SPACE_CENTER_GRUNT_7',
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
        ],
    },

    // ── Mossdeep encounters (3-slot teams) ───────────────────────────────────
    {
        id: 'TABITHA_MOSSDEEP',
        // Slot 2: mega (fixed)
        fair: [
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'MAXIE_MOSSDEEP',
        // Slot 2: UBERS mega (fixed)
        fair: [
            { contextualTier: [TIER_LEGEND], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { isMega: true },
        ],
    },

    // ── Late gym leaders & villain bosses ────────────────────────────────────
    {
        id: 'TATE_AND_LIZA',
        // Slot 1: specific Solrock/Lunatone (no tier; preset OU is informational for transforms)
        // Slot 5: mega (fixed)
        fair: [
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'ARCHIE',
        // Slot 5: Sharpedonite mega (fixed; uses specific: 'SPECIES_SHARPEDO')
        fair: [
            { contextualTier: [TIER_LEGEND], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_OU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { contextualTier: [TIER_UU], checkValidEvo: true },
            { isMega: true },
        ],
    },
    {
        id: 'JUAN',
        // Slot 5: Water mega (fixed)
        fair: [
            { contextualTier: [TIER_LEGEND], checkValidEvo: true },
            { contextualTier: [TIER_UBERS],  checkValidEvo: true },
            { contextualTier: [TIER_OU],     checkValidEvo: true },
            { contextualTier: [TIER_OU],     checkValidEvo: true },
            { contextualTier: [TIER_UU],     checkValidEvo: true },
            { isMega: true },
        ],
    },

    // ── Elite Four ───────────────────────────────────────────────────────────
    {
        id: 'SIDNEY',
        // Slot 5: mega (fixed)
        fair: [
            { contextualTier: [TIER_LEGEND], checkValidEvo: true },
            { contextualTier: [TIER_UBERS],    checkValidEvo: true },
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
            { contextualTier: [TIER_LEGEND],    checkValidEvo: true },
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
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
            { contextualTier: [TIER_LEGEND],    checkValidEvo: true },
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
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
            { contextualTier: [TIER_LEGEND],    checkValidEvo: true },
            { contextualTier: [TIER_UBERS], checkValidEvo: true },
            { contextualTier: [TIER_UBERS],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
            { isMega: true },
        ],
    },

    // ── Champion ──────────────────────────────────────────────────────────────
    {
        id: 'CHAMPION_STEVEN',
        fair: [
            { contextualTier: [TIER_AG],    checkValidEvo: true },
            { contextualTier: [TIER_UBERS],    checkValidEvo: true },
            { contextualTier: [TIER_OU],    checkValidEvo: true },
        ],
    },
];

// ─── Public accessors ────────────────────────────────────────────────────────

function getBossPreset(splitId) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    return getBossTeam(split);
}

function getNonBossPreset(splitId, megaTier = null) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    return getNonBossTeam(split, megaTier);
}

module.exports = {
    getBossPreset,
    getNonBossPreset,
    getDifficultyTransform,
    getBagSizeOffset,
    applyTransform,
};
