#!/usr/bin/env node
'use strict';

/**
 * buildOffsetMap.js — extract a base build's offset map and report Phase-3 readiness (T-238).
 *
 * This is the reusable form of the extraction T-232 did by hand ("script the manual extraction into a
 * reusable `.map`→offset-map tool"). Run it on the build box right after building the base:
 *
 *   node randomizer/injector/buildOffsetMap.js --map=pokeemerald.map --sym=pokeemerald.sym \
 *        --rom=pokeemerald.gba --out=base-offsets.json
 *
 * It prints:
 *   - the ROM budget against the 32 MB ceiling (GATE-1, recomputed for this build);
 *   - per Phase-3 module, whether the base exports every symbol that module claims — the check that
 *     would have caught the T-234/T-237 trap (LTO folding a value and garbage-collecting its table)
 *     before a day of Phase-3 debugging;
 * and, with `--out`, writes the map as JSON so the injector can load it without re-parsing.
 */

const fs = require('fs');
const { loadOffsetMap, parseMapFile, parseSymFile } = require('./symbolMap');
const { INJECTION_MODULES, checkReadiness } = require('./index');

const MB = 1024 * 1024;

function buildOffsetMapReport({ offsetMap, modules = INJECTION_MODULES, romPath = null }) {
    const lines = [];
    const used = offsetMap.romEndOffset;
    const cap = offsetMap.romCapacity;
    lines.push('ROM budget');
    lines.push(`  used     ${used.toLocaleString()} B  (${(100 * used / cap).toFixed(2)} % of ${(cap / MB).toFixed(0)} MB / 0x${cap.toString(16)})`);
    lines.push(`  free     ${offsetMap.freeBytes.toLocaleString()} B  (${(offsetMap.freeBytes / MB).toFixed(2)} MB)`);
    lines.push(`  symbols  ${offsetMap.symbolCount.toLocaleString()}`);
    if (romPath && fs.existsSync(romPath)) {
        const { Rom } = require('./rom');
        const rom = Rom.load(romPath);
        lines.push(`  base     ${romPath}  ${rom.size.toLocaleString()} B  sha256 ${rom.sha256()}`);
    }

    lines.push('');
    lines.push('Phase-3 module readiness (does the base export what each module will write?)');
    for (const r of checkReadiness(offsetMap, modules)) {
        const state = r.ready ? 'READY' : `MISSING ${r.missing.length}`;
        lines.push(`  ${r.task}  ${r.id.padEnd(26)} ${String(r.status).padEnd(9)} ${state}` +
            `   (${r.found.length} named${r.matched ? ` + ${r.matched} by pattern` : ''})`);
        for (const name of r.missing) lines.push(`        missing: ${name}`);
    }

    lines.push('');
    lines.push('Injectable symbols');
    for (const m of modules) {
        for (const name of m.symbols) {
            const sym = offsetMap.get(name);
            lines.push(`  ${name.padEnd(26)} ${sym && sym.romOffset !== null ? `0x${sym.romOffset.toString(16)}` : '—'}` +
                `${sym && sym.size ? `  ${sym.size} B` : ''}`);
        }
    }
    return lines.join('\n');
}

function exportOffsetMap(offsetMap, outPath) {
    fs.writeFileSync(outPath, `${JSON.stringify(offsetMap.toJSON(), null, 2)}\n`);
    return outPath;
}

function main(argv = process.argv.slice(2)) {
    const flag = (name) => {
        const hit = argv.find(a => a.startsWith(`--${name}=`));
        return hit ? hit.slice(name.length + 3) : null;
    };
    const mapPath = flag('map');
    const symPath = flag('sym');
    const outPath = flag('out');
    const romPath = flag('rom');

    if (!mapPath) {
        console.error('usage: node randomizer/injector/buildOffsetMap.js --map=pokeemerald.map [--sym=pokeemerald.sym] [--rom=pokeemerald.gba] [--out=base-offsets.json]');
        process.exit(1);
    }

    let offsetMap = loadOffsetMap(mapPath);
    if (symPath) offsetMap = offsetMap.merge(loadOffsetMap(symPath));

    console.log(buildOffsetMapReport({ offsetMap, romPath }));
    if (outPath) console.log(`\nWrote ${exportOffsetMap(offsetMap, outPath)}`);
}

if (require.main === module) main();

module.exports = { buildOffsetMapReport, exportOffsetMap, parseMapFile, parseSymFile, main };
