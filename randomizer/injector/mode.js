'use strict';

/**
 * mode.js — how a ROM is produced (T-238, decommissioned in T-244).
 *
 * Phase 3 migrated one output at a time behind a reversible switch, with `compile` as the default.
 * Phase 4 ends that: **injection is the default and the only path that delivers a ROM to a player.**
 *
 *   node make.js --bundle=…                     # injection (the default; nothing to set)
 *   node make.js --bundle=… --compile           # the compile path — VERIFICATION ONLY (GATE-3)
 *   ROM_BUILD_MODE=compile node make.js …       # same, via the env
 *
 * `compile` survives for exactly one reason: it is the reference the gate measures injection against
 * (`backend/build/golden-corpus/parity.mjs --compile-each`, the `verify-corpus` skill). Nothing in the
 * delivery path may reach it, so it is never a fallback and never a default — it has to be asked for by
 * name. `backend/build/buildRom.js` additionally passes `--inject` explicitly, so no stray
 * `ROM_BUILD_MODE=compile` in a box env can drag production back onto the slow path (T-244).
 *
 * See randomizer/docs/injection.md and docs/adr/ADR-023-injection-verified-by-data-equivalence.md.
 */

const BUILD_MODES = { COMPILE: 'compile', INJECT: 'inject' };
const VALID = new Set(Object.values(BUILD_MODES));

/**
 * Resolve the build mode. Precedence: CLI flag > ROM_BUILD_MODE > config.buildMode > inject.
 * An unrecognised value throws — a typo must not silently fall back to a different pipeline.
 */
function resolveBuildMode({ env = process.env, argv = process.argv.slice(2), config = {} } = {}) {
    if (argv.includes('--inject')) return BUILD_MODES.INJECT;
    if (argv.includes('--compile')) return BUILD_MODES.COMPILE;

    const raw = [env.ROM_BUILD_MODE, config.buildMode]
        .map(v => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
        .find(v => v !== '');
    if (!raw) return BUILD_MODES.INJECT;
    if (!VALID.has(raw)) {
        throw new Error(`Invalid build mode '${raw}' — expected 'compile' or 'inject' (ROM_BUILD_MODE / --compile / --inject)`);
    }
    return raw;
}

function isInjectMode(opts) {
    return resolveBuildMode(opts) === BUILD_MODES.INJECT;
}

/**
 * Is the compile path being asked for **by name**? Only an explicit `--compile` / `ROM_BUILD_MODE=compile`
 * counts; the absence of a mode never does. `compileOneRom` refuses to run without this, so the compile
 * path cannot be reached by omission — the failure mode T-244 removes.
 */
function isCompileExplicitlyRequested({ env = process.env, argv = process.argv.slice(2), config = {} } = {}) {
    if (argv.includes('--inject')) return false;
    if (argv.includes('--compile')) return true;
    const raw = [env.ROM_BUILD_MODE, config.buildMode]
        .map(v => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
        .find(v => v !== '');
    return raw === BUILD_MODES.COMPILE;
}

module.exports = { BUILD_MODES, resolveBuildMode, isInjectMode, isCompileExplicitlyRequested };
