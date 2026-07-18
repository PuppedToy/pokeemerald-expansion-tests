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

// A slot's shiftable "primary tier" index in TIER_SEQ, or -1 if the slot must not move.
// contextualTier[0], or a SINGLE-element absoluteTier — both tier systems shift identically (B-001:
// absolute-tier trainers scale with difficulty AND derive non-boss teams just like contextual ones).
// isMega slots (megas stay fixed — this also covers every multi-tier absolute range, which are all
// mega slots) and evolutionTier slots (rival/Wally/Steven progressive mons) never move.
function primaryTierIdx(slot) {
    if (slot.isMega || slot.evolutionTier) return -1;
    if (slot.contextualTier) return TIER_SEQ.indexOf(slot.contextualTier[0]);
    if (slot.absoluteTier && slot.absoluteTier.length === 1) return TIER_SEQ.indexOf(slot.absoluteTier[0]);
    return -1;
}

// Shift a slot's (or fallback entry's) primary tier by delta in place. Mirrors primaryTierIdx's
// eligibility so nothing protected (mega/evolutionTier/multi-tier absolute) is ever moved.
function shiftSlotTier(slot, delta) {
    if (slot.isMega || slot.evolutionTier) return;
    if (slot.contextualTier) slot.contextualTier = [shiftTier(slot.contextualTier[0], delta)];
    else if (slot.absoluteTier && slot.absoluteTier.length === 1) slot.absoluteTier = [shiftTier(slot.absoluteTier[0], delta)];
}

// delta: -1 (down) or +1 (up).
// topOrBottom: 'top' → shift the N highest-tier slots down; 'bottom' → shift N lowest up.
// numShifts: how many slots to shift (|level - 7|).
// Eligible slots are ranked by primaryTierIdx (contextualTier or single-tier absoluteTier); mega,
// special, oneOf and evolutionTier slots are skipped. Used both for the difficulty transform and for
// deriving non-boss teams (easyTransform).
function applyTransform(team, delta, topOrBottom, numShifts) {
    const result = team.map(s => ({
        ...s,
        contextualTier: s.contextualTier ? [...s.contextualTier] : s.contextualTier,
        absoluteTier: s.absoluteTier ? [...s.absoluteTier] : s.absoluteTier,
        maxTierDownSteps: s.maxTierDownSteps,
        fallback: s.fallback
            ? s.fallback.map(fb => ({
                ...fb,
                contextualTier: fb.contextualTier ? [...fb.contextualTier] : fb.contextualTier,
                absoluteTier: fb.absoluteTier ? [...fb.absoluteTier] : fb.absoluteTier,
            }))
            : s.fallback,
    }));
    const eligible = result
        .map((s, i) => ({ i, idx: primaryTierIdx(s) }))
        .filter(x => x.idx !== -1)
        .sort((a, b) => topOrBottom === 'top' ? b.idx - a.idx : a.idx - b.idx);
    for (let k = 0; k < numShifts && k < eligible.length; k++) {
        const s = result[eligible[k].i];
        shiftSlotTier(s, delta);
        if (s.fallback) {
            for (const fb of s.fallback) shiftSlotTier(fb, delta);
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

function convertSlotToAbsolute(slot) {
    if (!slot) return slot;
    const result = { ...slot };
    if (result.contextualTier && !result.isMega) {
        result.absoluteTier = result.contextualTier;
        delete result.contextualTier;
    }
    if (result.fallback) {
        result.fallback = result.fallback.map(convertSlotToAbsolute);
    }
    return result;
}

const BASE_TIER_CAPS = {
    [TIER_UU]: TIER_RU,
    [TIER_OU]: TIER_UU,
};

const MEGA_BASE_TIER_EXEMPT_SPLITS = new Set(['WATTSON', 'WINONA']);

// T-128 — a boss's mega slot, gated by the GENERAL, story-progression mega rule (owner-validated): the
// mega form is ≤ megaTier AND — the key part — its BASE form is capped by BASE_TIER_CAPS (a genuine
// upgrade, e.g. a UU base becoming an OU mega). Reuses the exact same gate getNonBossTeam already applies.
// Megas are NOT difficulty-scaled (the transform skips isMega slots). A mega favourite must satisfy this
// same gate (evaluated on its base form) to CLAIM the slot; otherwise it drops (see favouriteClaim.js).
// The `fallback` (a non-mega of the mega tier) fires only when no eligible mega exists this ROM.
//   megaTier: TIER_UU  → mega ≤UU, base ≤RU     (up to & incl. Flannery)
//   megaTier: TIER_OU  → mega ≤OU, base ≤UU     (post-Flannery … Tate & Liza)
//   megaTier: TIER_UBERS → mega ≤UBERS, base uncapped (post-Tate & Liza onward)
const bossMega = (megaTier) => {
    const baseCap = BASE_TIER_CAPS[megaTier];
    return {
        isMega: true,
        absoluteTier: tiersUpTo(megaTier),
        ...(baseCap !== undefined ? { maxBaseTier: baseCap } : {}),
        checkValidEvo: true,
        tryEvolve: true,
        fallback: [{ absoluteTier: [megaTier], checkValidEvo: true }],
    };
};

// Non-boss team = 2-shift-down of the fair boss team.
// megaTier=null: isMega slots replaced with lowest non-mega tier (no tryMega).
// megaTier=TIER_X: isMega slots become { isMega: true, absoluteTier: tiersUpTo(TIER_X), maxBaseTier? }.
// If the split has no isMega slot and megaTier is provided, injects tryMega at slot 0.
// useAbsoluteTier=true: converts all non-mega contextualTier slots to absoluteTier.
function getNonBossTeam(split, megaTier = null, useAbsoluteTier = false) {
    const bossTeam = getBossTeam(split);
    const transformed = easyTransform(bossTeam);
    const hasMegaSlot = transformed.some(s => s.isMega);

    if (!hasMegaSlot) {
        if (!megaTier) {
            if (useAbsoluteTier) return transformed.map(convertSlotToAbsolute);
            return transformed;
        }
        const result = [...transformed];
        result[0] = { tryMega: true, contextualTier: [megaTier], checkValidEvo: true };
        if (useAbsoluteTier) return result.map(convertSlotToAbsolute);
        return result;
    }

    const nonMegaSlots = transformed.filter(s => !s.isMega && (s.contextualTier?.[0] || s.absoluteTier?.[0]));
    if (nonMegaSlots.length === 0) return transformed;
    const usesAbsoluteTier = nonMegaSlots[0].absoluteTier != null;
    const lowestIdx = nonMegaSlots.reduce((min, s) => {
        const tier = s.contextualTier?.[0] ?? s.absoluteTier?.[0];
        const idx = TIER_SEQ.indexOf(tier);
        return idx < min ? idx : min;
    }, TIER_SEQ.length - 1);
    const lowestTier = TIER_SEQ[lowestIdx];
    const megaBaseTierCap = megaTier ? BASE_TIER_CAPS[megaTier] : undefined;
    const megaSlot = megaTier
        ? {
            isMega: true,
            absoluteTier: tiersUpTo(megaTier),
            ...(megaBaseTierCap !== undefined ? { maxBaseTier: megaBaseTierCap } : {}),
            checkValidEvo: true,
          }
        : usesAbsoluteTier
            ? { absoluteTier: [lowestTier], checkValidEvo: true }
            : { contextualTier: [lowestTier], checkValidEvo: true };
    const result = transformed.map(s => s.isMega ? megaSlot : s);
    if (useAbsoluteTier) return result.map(convertSlotToAbsolute);
    return result;
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
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'TABITHA_CHIMNEY',
        fair: [
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        id: 'MAXIE_CHIMNEY',
        // Slot 5: Cameruptite mega (fixed)
        fair: [
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'FLANNERY',
        // Slot 5: mega (fixed)
        fair: [
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'NORMAN',
        // Slot 5: mega (fixed)
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'SHELLY_WEATHER',
        // Slot 5: mega (fixed)
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'WINONA',
        // Slot 5: Altaria mega (fixed)
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'MAXIE_MAGMA',
        // Slot 5: Cameruptite mega (fixed)
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'MATT_AQUA',
        // Slot 5: Snow Warning mega (fixed)
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },

    // ── Space Center grunts (all three isBoss; separate splits for slot flexibility) ──
    {
        id: 'SPACE_CENTER_GRUNT_5',
        fair: [
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        id: 'SPACE_CENTER_GRUNT_6',
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
        ],
    },
    {
        // Slot 5: mega (fixed); slot 0 is plain OU.
        id: 'SPACE_CENTER_GRUNT_7',
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },

    // ── Mossdeep encounters (3-slot teams) ───────────────────────────────────
    {
        id: 'TABITHA_MOSSDEEP',
        // Slot 2: mega (fixed)
        fair: [
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'MAXIE_MOSSDEEP',
        // Slot 2: UBERS mega (fixed)
        fair: [
            { absoluteTier: [TIER_LEGEND], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },

    // ── Late gym leaders & villain bosses ────────────────────────────────────
    {
        id: 'TATE_AND_LIZA',
        // Slot 1: specific Solrock/Lunatone (no tier; preset OU is informational for transforms)
        // Slot 5: mega (fixed)
        fair: [
            { absoluteTier: [TIER_UBERS], checkValidEvo: true },
            { absoluteTier: [TIER_UBERS], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_RU], checkValidEvo: true },
            bossMega(TIER_OU),
        ],
    },
    {
        id: 'ARCHIE',
        // Slot 5: Sharpedonite mega (fixed; uses specific: 'SPECIES_SHARPEDO')
        fair: [
            { absoluteTier: [TIER_LEGEND], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_OU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            { absoluteTier: [TIER_UU], checkValidEvo: true },
            bossMega(TIER_UBERS),
        ],
    },
    {
        id: 'JUAN',
        // Slot 5: Water mega (fixed)
        fair: [
            { absoluteTier: [TIER_LEGEND], checkValidEvo: true },
            { absoluteTier: [TIER_UBERS],  checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_UU],     checkValidEvo: true },
            bossMega(TIER_UBERS),
        ],
    },

    // ── Elite Four ───────────────────────────────────────────────────────────
    {
        id: 'SIDNEY',
        // Slot 5: mega (fixed)
        fair: [
            { absoluteTier: [TIER_LEGEND], checkValidEvo: true },
            { absoluteTier: [TIER_UBERS],  checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_UU],     checkValidEvo: true },
            bossMega(TIER_UBERS),
        ],
    },
    {
        id: 'PHOEBE',
        // Slot 5: mega (fixed)
        fair: [
            { absoluteTier: [TIER_LEGEND], checkValidEvo: true },
            { absoluteTier: [TIER_UBERS],  checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_UU],     checkValidEvo: true },
            bossMega(TIER_UBERS),
        ],
    },
    {
        id: 'GLACIA',
        // Slot 5: UBERS mega (fixed)
        fair: [
            { absoluteTier: [TIER_LEGEND], checkValidEvo: true },
            { absoluteTier: [TIER_UBERS],  checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            bossMega(TIER_UBERS),
        ],
    },
    {
        id: 'DRAKE',
        // Slot 5: UBERS mega (fixed)
        fair: [
            { absoluteTier: [TIER_LEGEND], checkValidEvo: true },
            { absoluteTier: [TIER_UBERS],  checkValidEvo: true },
            { absoluteTier: [TIER_UBERS],  checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            { absoluteTier: [TIER_OU],     checkValidEvo: true },
            bossMega(TIER_UBERS),
        ],
    },

    // ── Champion ──────────────────────────────────────────────────────────────
    {
        id: 'CHAMPION_STEVEN',
        fair: [
            { absoluteTier: [TIER_AG],    checkValidEvo: true },
            { absoluteTier: [TIER_UBERS], checkValidEvo: true },
            { absoluteTier: [TIER_OU],    checkValidEvo: true },
        ],
    },
];

// ─── Public accessors ────────────────────────────────────────────────────────

function getBossPreset(splitId, useAbsoluteTier = false) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    const team = getBossTeam(split);
    if (useAbsoluteTier) return team.map(convertSlotToAbsolute);
    return team;
}

function getNonBossPreset(splitId, megaTier = null, useAbsoluteTier = false) {
    const split = SPLITS.find(s => s.id === splitId);
    if (!split) throw new Error(`No preset split: ${splitId}`);
    let team = getNonBossTeam(split, megaTier, useAbsoluteTier);
    if (MEGA_BASE_TIER_EXEMPT_SPLITS.has(splitId)) {
        team = team.map(slot => {
            if (slot.maxBaseTier !== undefined) {
                const { maxBaseTier, ...rest } = slot;
                return rest;
            }
            return slot;
        });
    }
    return team;
}

module.exports = {
    getBossPreset,
    getNonBossPreset,
    getDifficultyTransform,
    getBagSizeOffset,
    applyTransform,
    bossMega,
};
