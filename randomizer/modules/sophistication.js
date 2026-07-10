'use strict';

// T-105 / ADR-016 §3 — the sophistication scalar in [0,1]: how hard the generator pursues a coherent
// archetype identity for a given trainer. ~0 for early-route trainers ("a pile of mons"), ~1 by the
// endgame (a tight, competitive team). Consumed by the T-107 engine to weight archetype-fit vs.
// randomness (seed probability, crystallization confidence, refinement strength).
//
// The progression signal is the trainer's LEVEL positioned within the game's boss level-cap range
// (bossCaps — SSOT src/caps.c → randomizer/bossCaps.js). Cap levels rise monotonically along boss
// order, so sophistication is monotonic non-decreasing along the boss progression by construction,
// and every trainer (boss or not) is placed by the one signal it always carries: its level.
//
// This module is pure and deterministic — a function of (trainer level, boss caps, config) only.

const DEFAULTS = {
    floor: 0,   // sophistication at / below the first cap level
    ceil: 1,    // sophistication at / above the last cap level
    gamma: 1,   // easing exponent on the normalized position (>1 = slower early rise)
};

// bossCaps: ordered [{ level, ... }] from buildBossCaps(). config: { floor, ceil, gamma }.
// Returns a pure `sophistication(trainer) -> number in [floor, ceil]`.
function createSophisticationScale(bossCaps, config = {}) {
    const { floor, ceil, gamma } = { ...DEFAULTS, ...config };
    const levels = (bossCaps || []).map(c => c && c.level).filter(l => Number.isFinite(l));
    const min = levels.length ? Math.min(...levels) : 0;
    const max = levels.length ? Math.max(...levels) : 0;

    return function sophistication(trainer) {
        // Degenerate range (no caps / single cap) → neutral: treat as fully sophisticated so the
        // engine's default is "try hard" rather than "all random" when progression data is absent.
        if (max <= min) return ceil;
        const level = Number.isFinite(trainer && trainer.level) ? trainer.level : min;
        let t = (level - min) / (max - min);
        t = Math.max(0, Math.min(1, t));            // clamp before easing so bounds hold exactly
        if (gamma !== 1) t = Math.pow(t, gamma);
        return floor + (ceil - floor) * t;
    };
}

module.exports = { createSophisticationScale, DEFAULTS };
