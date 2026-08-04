#!/usr/bin/env node
'use strict';

/**
 * buildOffsetMap.js — extract a base build's offset map and report Phase-3 readiness (T-238).
 *
 * This is the reusable form of the extraction T-232 did by hand ("script the manual extraction into a
 * reusable `.map`→offset-map tool"). Run it on the build box right after building the base:
 *
 *   node randomizer/injector/buildOffsetMap.js --map=pokeemerald.map --sym=pokeemerald.sym \
 *        --rom=pokeemerald.gba --out=base-offsets.json --sources=base-sources.json
 *
 * It prints:
 *   - the ROM budget against the 32 MB ceiling (GATE-1, recomputed for this build);
 *   - per Phase-3 module, whether the base exports every symbol that module claims — the check that
 *     would have caught the T-234/T-237 trap (LTO folding a value and garbage-collecting its table)
 *     before a day of Phase-3 debugging;
 * and, with `--out`, writes the map as JSON so the injector can load it without re-parsing. `--sources`
 * additionally bakes the base's own source text (T-249) — the inputs the injector derives its writes
 * from, which a browser has no tree to read.
 */

const fs = require('fs');
const { loadOffsetMap, parseMapFile, parseSymFile } = require('./symbolMap');
const { collectBaseSources } = require('./sources');
const { INJECTION_MODULES, checkReadiness } = require('./index');

const MB = 1024 * 1024;

/**
 * The scalar values the injector writes and the GAME reads through an accessor (B-058).
 *
 * A table read by runtime index cannot be folded; a single `const` scalar copied out of a global can be,
 * and `noipa` does not prevent it — it stops the caller assuming the return value, not the compiler
 * folding the load inside the function body. Four of these compiled to `movs rN,#imm; bx lr` in a base
 * that looked perfectly injectable, which killed the route nicknames, the trade nicknames, the extra
 * starter count and the starter's forced gender in inject mode — and no byte comparison could see it,
 * because the injected bytes were right and the code ignored them.
 *
 * Every accessor here must compile to a real memory load. Add one whenever a new injectable scalar
 * appears; the source side is guarded in randomizer/__tests__/unit/injectableAccessors.test.js.
 */
const INJECTABLE_SCALAR_ACCESSORS = [
    'GetLocationNicknameCount',
    'GetTradeNicknameCount',
    'GetExtraPokemonCount',
    'GetStarterGender',
];

/**
 * Which of `accessors` the base compiled to a constant return. Thumb: `movs rN, #imm` is 0x20nn-0x27nn
 * and `bx lr` is 0x4770, so a four-byte body of exactly those two returns a literal.
 *
 * @returns {Array<{name: string, value?: number, missing?: true}>} empty when every accessor loads
 */
function foldedAccessors(romBytes, offsetMap, accessors = INJECTABLE_SCALAR_ACCESSORS) {
    const found = [];
    for (const name of accessors) {
        const sym = offsetMap.get(name);
        if (!sym || sym.romOffset === null || sym.romOffset === undefined) {
            found.push({ name, missing: true });
            continue;
        }
        const at = sym.romOffset & ~1;          // Thumb symbols carry the low bit set
        if (sym.size !== 4 || at + 4 > romBytes.length) continue;
        const first = romBytes.readUInt16LE(at);
        const second = romBytes.readUInt16LE(at + 2);
        const isMovsImm = (first & 0xf800) === 0x2000;
        if (isMovsImm && second === 0x4770) found.push({ name, value: first & 0xff });
    }
    return found;
}

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

    if (romPath && fs.existsSync(romPath)) {
        const { Rom } = require('./rom');
        const folded = foldedAccessors(Rom.load(romPath).buffer, offsetMap);
        lines.push('');
        lines.push('Injectable scalar accessors (B-058 — a folded read makes an injected value unreadable)');
        if (folded.length === 0) {
            lines.push(`  OK — all ${INJECTABLE_SCALAR_ACCESSORS.length} compile to a real memory load`);
        } else {
            for (const f of folded) {
                lines.push(f.missing
                    ? `  MISSING  ${f.name} — the base does not export it`
                    : `  FOLDED   ${f.name} — compiled to \`return ${f.value}\`, so injecting its value does NOTHING`);
            }
            lines.push('  → make each one read through `*(const volatile u8 *)&<global>` (see B-058)');
        }
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

/**
 * Bake the base's own source text next to the offset map (T-249).
 *
 * The injector derives its writes from these files at inject time, so a browser — which has no tree —
 * needs them as data. They are a function of the base build, hence the `buildId` (the base ROM's sha256):
 * one key invalidates the cached base and the cached inputs together.
 *
 * Not pretty-printed: this is ~6 MB of source text, and indentation would inflate what a browser
 * downloads for no reader's benefit.
 *
 * @returns {{ outPath: string, paths: number, bytes: number }}
 */
function exportBaseSources({ root = undefined, outPath, buildId = null } = {}) {
    const sources = collectBaseSources({ ...(root ? { root } : {}), buildId });
    fs.writeFileSync(outPath, `${JSON.stringify(sources.toJSON())}\n`);
    return { outPath, paths: sources.paths().length, bytes: sources.totalBytes };
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
    const sourcesPath = flag('sources');

    if (!mapPath) {
        console.error('usage: node randomizer/injector/buildOffsetMap.js --map=pokeemerald.map [--sym=pokeemerald.sym] [--rom=pokeemerald.gba] [--out=base-offsets.json] [--sources=base-sources.json]');
        process.exit(1);
    }

    let offsetMap = loadOffsetMap(mapPath);
    if (symPath) offsetMap = offsetMap.merge(loadOffsetMap(symPath));

    console.log(buildOffsetMapReport({ offsetMap, romPath }));
    if (outPath) console.log(`\nWrote ${exportOffsetMap(offsetMap, outPath)}`);
    if (sourcesPath) {
        // Keyed by the base's own sha256 when the ROM is at hand — the artifact and the base it was taken
        // from must never be cached apart (T-249).
        const buildId = romPath && fs.existsSync(romPath) ? require('./rom').Rom.load(romPath).sha256() : null;
        const { paths, bytes } = exportBaseSources({ outPath: sourcesPath, buildId });
        console.log(`Wrote ${sourcesPath}  ${paths} file(s), ${(bytes / (1024 * 1024)).toFixed(1)} MB of base sources` +
            `${buildId ? `  (base ${buildId.slice(0, 12)}…)` : '  (no --rom: no build id)'}`);
    }
}

if (require.main === module) main();

module.exports = {
    buildOffsetMapReport, exportOffsetMap, exportBaseSources, parseMapFile, parseSymFile, main,
    foldedAccessors, INJECTABLE_SCALAR_ACCESSORS,
};
