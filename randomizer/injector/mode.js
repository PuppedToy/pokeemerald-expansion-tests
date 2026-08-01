'use strict';

/**
 * mode.js — the compile-vs-inject switch (T-238).
 *
 * Phase 3 migrates one output at a time (T-239…T-243) and every step has to be reversible in one move,
 * so exactly one function decides how a ROM is produced:
 *
 *   ROM_BUILD_MODE=inject   node make.js --bundle=…      # injection path
 *   ROM_BUILD_MODE=compile  node make.js --bundle=…      # the old path (default)
 *   node make.js --bundle=… --compile                    # per-invocation override, beats the env
 *
 * The default is **compile** and stays that way until injection reproduces the corpus byte-for-byte
 * (INV-BYTES). Rollback = unset one env var.
 */

const BUILD_MODES = { COMPILE: 'compile', INJECT: 'inject' };
const VALID = new Set(Object.values(BUILD_MODES));

/**
 * Resolve the build mode. Precedence: CLI flag > ROM_BUILD_MODE > config.buildMode > compile.
 * An unrecognised value throws — a typo must not silently fall back to a different pipeline.
 */
function resolveBuildMode({ env = process.env, argv = process.argv.slice(2), config = {} } = {}) {
    if (argv.includes('--compile')) return BUILD_MODES.COMPILE;
    if (argv.includes('--inject')) return BUILD_MODES.INJECT;

    const raw = [env.ROM_BUILD_MODE, config.buildMode]
        .map(v => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
        .find(v => v !== '');
    if (!raw) return BUILD_MODES.COMPILE;
    if (!VALID.has(raw)) {
        throw new Error(`Invalid build mode '${raw}' — expected 'compile' or 'inject' (ROM_BUILD_MODE / --compile / --inject)`);
    }
    return raw;
}

function isInjectMode(opts) {
    return resolveBuildMode(opts) === BUILD_MODES.INJECT;
}

module.exports = { BUILD_MODES, resolveBuildMode, isInjectMode };
