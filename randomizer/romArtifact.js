'use strict';

/**
 * Delivered-artifact emitter (T-053, ADR-013).
 *
 * After `make` produces a ROM, we deliver either:
 *   - a BPS delta (vanilla → built) — the DEFAULT (server never stores/serves a full ROM); or
 *   - the full .gba verbatim — only under `--full-rom` (debugging / builder-local use).
 *
 * The BPS delta needs a gitignored vanilla reference ROM on the builder (never committed — it is
 * copyrighted). fs is injected so the logic is unit-tested without touching the real filesystem.
 */

const fsDefault = require('fs');
const path = require('path');
const { createBps } = require('./bps');

/** Location of the vanilla reference ROM used for diffing. Override with the VANILLA_ROM env var. */
function resolveVanillaPath(root, env = process.env) {
    return env.VANILLA_ROM || path.join(root, 'pokeemerald-vanilla.gba');
}

/**
 * @returns {string} the written destination path.
 */
function emitArtifact({ builtRomPath, outDir, label, fullRom = false, vanillaPath, fs = fsDefault }) {
    if (fullRom) {
        const dest = path.join(outDir, label);
        fs.copyFileSync(builtRomPath, dest);
        return dest;
    }

    if (!vanillaPath || !fs.existsSync(vanillaPath)) {
        throw new Error(
            `Vanilla reference ROM not found${vanillaPath ? ` at ${vanillaPath}` : ''}. ` +
            'Set VANILLA_ROM or place pokeemerald-vanilla.gba at the repo root for BPS mode, ' +
            'or pass --full-rom to emit a .gba instead.',
        );
    }

    const vanilla = fs.readFileSync(vanillaPath);
    const built = fs.readFileSync(builtRomPath);
    const bps = createBps(vanilla, built);
    const dest = path.join(outDir, label.replace(/\.gba$/i, '.bps'));
    fs.writeFileSync(dest, Buffer.from(bps));
    return dest;
}

module.exports = { emitArtifact, resolveVanillaPath };
