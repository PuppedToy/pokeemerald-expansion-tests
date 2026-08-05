#!/usr/bin/env node
'use strict';

/**
 * buildClientArtifacts.js — everything a browser needs to inject, produced once per base build (T-249).
 *
 * Run on the box right after the base is installed (deploy/build-base.sh does):
 *
 *   node randomizer/injector/buildClientArtifacts.js --rom=base/pokeemerald.gba \
 *        --map=base/pokeemerald.map --sym=base/pokeemerald.sym \
 *        --vanilla=pokeemerald-vanilla.gba --out=base/client
 *
 * Three artifacts and a manifest:
 *
 *   base.bps            vanilla → base. **The 32 MB base is never served** (ADR-013): the user already has
 *                       vanilla, so they get a patch and reconstruct the base locally — the same artifact
 *                       class as today's per-run patch, and one immutable file for every user and run
 *                       instead of one per build.
 *   base-offsets.json   the injection-only offset map (see filterOffsetMapForInjection).
 *   base-sources.json   the base's own source text, which the injector derives its writes from.
 *   manifest.json       what they belong to: `buildId` is the base ROM's sha256, and it is the cache key.
 *                       A browser holding a cached base for another buildId must throw its copy away —
 *                       injecting into a stale base with a fresh offset map writes real data to wrong
 *                       addresses, and nothing downstream would notice.
 *
 * All three change only when the base does, so they are immutable-cacheable; only manifest.json needs to
 * be fetched fresh.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createBps } = require('../bps');
const { Rom } = require('./rom');
const { loadOffsetMap } = require('./symbolMap');
const { exportInjectionOffsetMap, exportBaseSources } = require('./buildOffsetMap');

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const sha1 = (bytes) => crypto.createHash('sha1').update(bytes).digest('hex');

/**
 * @param {object} args
 * @param {string} args.romPath      the base ROM
 * @param {string} args.mapPath      the `.map` of THAT build
 * @param {string} [args.symPath]    its `.sym` (the local script labels live only here)
 * @param {string} args.vanillaPath  the unmodified Emerald the patch is against
 * @param {string} args.outDir
 * @param {Function} [args.log]
 * @returns {object} the manifest, as written
 */
function buildClientArtifacts({ romPath, mapPath, symPath = null, vanillaPath, outDir, log = () => {} }) {
    for (const [what, file] of [['base ROM', romPath], ['.map', mapPath], ['vanilla ROM', vanillaPath]]) {
        if (!fs.existsSync(file)) throw new Error(`buildClientArtifacts: no ${what} at ${file}`);
    }
    fs.mkdirSync(outDir, { recursive: true });

    const base = fs.readFileSync(romPath);
    const vanilla = fs.readFileSync(vanillaPath);
    const buildId = sha256(base);

    // ── base.bps ──
    const bps = Buffer.from(createBps(vanilla, base));
    fs.writeFileSync(path.join(outDir, 'base.bps'), bps);
    log(`base.bps           ${(bps.length / 1048576).toFixed(1)} MB  (vanilla ${(vanilla.length / 1048576).toFixed(0)} MB → base ${(base.length / 1048576).toFixed(0)} MB)`);

    // ── the offset map, trimmed to what injection can address ──
    let offsetMap = loadOffsetMap(mapPath);
    if (symPath && fs.existsSync(symPath)) offsetMap = offsetMap.merge(loadOffsetMap(symPath));
    const offsetsFile = path.join(outDir, 'base-offsets.json');
    const { symbols, of } = exportInjectionOffsetMap(offsetMap, offsetsFile);
    log(`base-offsets.json  ${symbols.toLocaleString()} of ${of.toLocaleString()} symbol(s)`);

    // ── the base's sources ──
    const sourcesFile = path.join(outDir, 'base-sources.json');
    const { paths: sourceCount, bytes: sourceBytes } = exportBaseSources({ outPath: sourcesFile, buildId });
    log(`base-sources.json  ${sourceCount} file(s), ${(sourceBytes / 1048576).toFixed(1)} MB of source text`);

    const describe = (file, extra = {}) => {
        const bytes = fs.readFileSync(file);
        return { file: path.basename(file), bytes: bytes.length, sha256: sha256(bytes), ...extra };
    };
    const manifest = {
        _comment: 'Client-side injection artifacts for ONE base build (T-249). buildId is the base ROM\'s sha256 and the cache key.',
        buildId,
        romBytes: base.length,
        // The browser checks its stored ROM by sha1 (frontend/js/rom-store.js), so the patch names the
        // vanilla it was made from in the same currency: a mismatch can be reported before any work.
        vanillaSha1: sha1(vanilla),
        vanillaBytes: vanilla.length,
        artifacts: {
            bps: describe(path.join(outDir, 'base.bps')),
            offsets: describe(offsetsFile, { symbols }),
            sources: describe(sourcesFile, { files: sourceCount }),
        },
    };
    fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    log(`manifest.json      base ${buildId.slice(0, 12)}…`);
    return manifest;
}

function main(argv = process.argv.slice(2)) {
    const flag = (name, fallback = null) => {
        const hit = argv.find(a => a.startsWith(`--${name}=`));
        return hit ? hit.slice(name.length + 3) : fallback;
    };
    const romPath = flag('rom', path.join('base', 'pokeemerald.gba'));
    const mapPath = flag('map', path.join('base', 'pokeemerald.map'));
    const symPath = flag('sym', path.join('base', 'pokeemerald.sym'));
    const vanillaPath = flag('vanilla', process.env.VANILLA_ROM || 'pokeemerald-vanilla.gba');
    const outDir = flag('out', path.join('base', 'client'));

    if (!fs.existsSync(vanillaPath)) {
        console.error(`No vanilla ROM at ${vanillaPath} — pass --vanilla=… or set VANILLA_ROM. ` +
            'It is what base.bps is a patch against; the 32 MB base itself is never served.');
        process.exit(1);
    }
    const manifest = buildClientArtifacts({
        romPath, mapPath, symPath, vanillaPath, outDir, log: (line) => console.log(`  ${line}`),
    });
    console.log(`\nWrote ${outDir}/ for base ${manifest.buildId}`);
}

if (require.main === module) main();

module.exports = { buildClientArtifacts, main };
