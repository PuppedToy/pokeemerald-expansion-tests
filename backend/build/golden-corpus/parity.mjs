// GATE-3 / INV-BYTES harness (T-239): does `inject(base, bundle)` equal `compile(bundle)`?
//
// Runs ON the build box (PRO — the only build env), from the repo root:
//
//   INJECT_BASE_ROM=base/pokeemerald.gba INJECT_BASE_MAP=base/pokeemerald.map \
//   INJECT_BASE_SYM=base/pokeemerald.sym \
//     node backend/build/golden-corpus/parity.mjs --compile-each [--only baseline]
//
// Two modes, because the answer means different things depending on how far Phase 3 has got:
//
//   · **Whole-ROM** (default) — inject each frozen bundle and compare its sha256 to `manifest.json`
//     (which holds the compile-path hash of every corpus ROM on this base). Only meaningful once every
//     module is migrated; until then the un-migrated outputs still carry base data. Needs no compile.
//
//   · **Scoped** (`--compile-each`) — the honest check for a PARTIAL migration, and the one T-239 uses.
//     For each bundle it compiles the ROM, injects the ROM, and then asks two questions:
//       1. Is every byte the injector WROTE identical in the compiled ROM? (it must be: a migrated
//          module that writes a wrong value fails here, localised to that module's tag)
//       2. Of the bytes `compile()` changed vs the base, which ones did the injector NOT write? Each
//          such region is attributed to its owning symbol; every one must belong to a module that is
//          still `pending`. A region owned by a MIGRATED module means the injector missed an output.
//     This is what "a failure must stay localised to one module" means before the last module lands.
//
// It also prints each compiled ROM's fresh sha256, so a re-snapshot and a parity run are one pass over
// the corpus rather than two.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const corpus = process.env.CORPUS_OUT || path.resolve(dir, '../../data/golden-corpus');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));

const argv = process.argv.slice(2);
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const compileEach = argv.includes('--compile-each');
// Compare per SYMBOL rather than per offset: each table's bytes are read from the compiled ROM at the
// COMPILED build's own address and from the injected ROM at the base's address. That answers "did the
// injector produce the data compile() produces?" even when the two ROMs are not laid out identically —
// which is the only honest question while a base-side layout difference is outstanding.
const bySymbol = argv.includes('--by-symbol');
// Compiling the corpus is the slow half (~1-2 min per ROM); injecting is seconds. --reuse-compiled
// keeps each bundle's compiled ROM and .map in .gate3-cache/ and skips the rebuild when they are there,
// so iterating on the injector costs one corpus compile, not one per attempt.
const reuseCompiled = argv.includes('--reuse-compiled');
const cacheDir = path.join(root, '.gate3-cache');
const allowPending = argv.includes('--allow-pending') || compileEach;

const run = (cmd, a, env = {}) => execFileSync(cmd, a, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
// checkDataClean aborts a build if data/maps/** is dirty; a previous build can leave it that way.
const clean = () => { try { run('git', ['checkout', '--', 'src/', 'include/', 'data/maps/']); } catch { /* noop */ } };

const load = (rel) => import(pathToFileURL(path.join(root, rel)).href).then(m => m.default || m);
const { INJECTION_MODULES, pendingModules, migratedModules } = await load('randomizer/injector/index.js');
const { loadOffsetMap } = await load('randomizer/injector/symbolMap.js');
const { attributeDiff } = await load('randomizer/injector/parity.js');
const makejs = await load('make.js');

const pending = pendingModules(INJECTION_MODULES);
if (pending.length && !allowPending) {
    console.error(
        `Phase 3 is unfinished: ${pending.map(m => `${m.id} (${m.task})`).join(', ')} still pending, so an\n` +
        `injected ROM carries BASE data for those outputs and cannot match the manifest whole-ROM.\n` +
        `Use --compile-each for the scoped check (or --allow-pending to compare hashes anyway).`);
    process.exit(2);
}

const basePaths = makejs.resolveBasePaths();
for (const [what, file] of Object.entries(basePaths)) {
    if (!fs.existsSync(file)) { console.error(`Base ${what} not found: ${file}`); process.exit(2); }
}
const baseBytes = fs.readFileSync(basePaths.romPath);
const offsetMap = loadOffsetMap(basePaths.mapPath);
console.log(`base ${basePaths.romPath}  sha256 ${crypto.createHash('sha256').update(baseBytes).digest('hex')}`);
console.log(`migrated: ${migratedModules(INJECTION_MODULES).map(m => `${m.id} (${m.task})`).join(', ') || 'none'}`);
console.log(`pending:  ${pending.map(m => m.task).join(', ') || 'none'}\n`);

/** Which module claims the symbol a diff region was attributed to (or null). */
function ownerOf(symbolName) {
    if (!symbolName) return null;
    const bare = symbolName.replace(/^~/, '').split('+')[0];
    for (const module of INJECTION_MODULES) {
        if ((module.symbols || []).includes(bare)) return module;
        if ((module.symbolPatterns || []).some(p => p.test(bare))) return module;
    }
    return null;
}

/**
 * Compare, symbol by symbol, the tables the injector wrote — reading each ROM at ITS OWN address for
 * that symbol. Layout-independent: it asks whether the DATA matches, not whether the images do.
 */
function compareBySymbol({ injectedBytes, compiledBytes, compiledMapPath, journal }) {
    if (!compiledMapPath) return ['(no .map kept for the compiled build — cannot compare by symbol)'];
    const compiledMap = loadOffsetMap(compiledMapPath);
    const problems = [];

    // Which symbols the injector touched, and which byte ranges within them.
    const touched = new Map();      // symbol name → [{ from, to }] relative to the symbol
    for (const entry of journal) {
        // `approximate` = the write is in anonymous data (an EVOLUTION() compound literal has no symbol),
        // attributed to the nearest preceding symbol. Comparing at the same delta from that symbol is
        // still right as long as the blob sits at the same place relative to it in both builds.
        const [region] = attributeDiff(offsetMap, [{ offset: entry.offset, length: entry.length }]);
        if (!region.symbol) {
            problems.push(`write at 0x${entry.offset.toString(16)} (${entry.tag}) is inside no known symbol`);
            continue;
        }
        if (!touched.has(region.symbol)) touched.set(region.symbol, []);
        touched.get(region.symbol).push({ from: region.delta, to: region.delta + entry.length });
    }

    for (const [symbol, ranges] of touched) {
        const here = offsetMap.get(symbol);
        const there = compiledMap.get(symbol);
        if (!there) { problems.push(`${symbol}: not in the compiled build's map`); continue; }
        let differing = 0;
        let firstAt = null;
        for (const range of ranges) {
            for (let d = range.from; d < range.to; d++) {
                if (injectedBytes[here.romOffset + d] !== compiledBytes[there.romOffset + d]) {
                    differing += 1;
                    if (firstAt === null) firstAt = d;
                }
            }
        }
        if (differing) problems.push(`${symbol}: ${differing} B differ (first at +0x${firstAt.toString(16)})`);
    }
    return problems;
}

let pass = 0;
let fail = 0;
const freshHashes = {};

for (const [name, roms] of Object.entries(manifest.bundles)) {
    if (only && name !== only) continue;
    const bundlePath = path.join(corpus, `${name}.bundle.json`);
    if (!fs.existsSync(bundlePath)) { console.log(`MISS  ${name}  (no frozen bundle — run generate.mjs)`); fail++; continue; }
    const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
    const seed = bundle.config?.seed ?? 0;
    const universeSeed = bundle.config?.universeSeed ?? seed;
    const romsDir = path.join(root, 'roms', bundle.sessionId ?? name);

    // ── the compile path ──────────────────────────────────────────────────────
    const compiled = {};
    if (compileEach) {
        fs.mkdirSync(cacheDir, { recursive: true });
        const cachedMap = path.join(cacheDir, `${name}.map`);
        const cachedRoms = Object.keys(roms).map(rom => path.join(cacheDir, `${name}-${rom}`));
        if (reuseCompiled && fs.existsSync(cachedMap) && cachedRoms.every(f => fs.existsSync(f))) {
            for (const rom of Object.keys(roms)) {
                const kept = path.join(cacheDir, `${name}-${rom}`);
                compiled[rom] = { path: kept, sha: sha(kept), map: cachedMap };
                freshHashes[`${name}/${rom}`] = compiled[rom].sha;
            }
            console.log(`      ${name}  (reusing cached compile)`);
        } else {
        clean();
        try {
            run('node', ['make.js', `--bundle=${bundlePath}`, '--full-rom', '--compile'], { ROM_BUILD_MODE: 'compile' });
        } catch (err) {
            console.log(`ERR   ${name}  compile failed: ${String(err.stderr || err.message).trim().split('\n').slice(-2).join(' | ')}`);
            fail++;
            continue;
        }
        // make.js rewrites pokeemerald.map on every build, so keep this build's map with its ROM.
        const keptMap = path.join(cacheDir, `${name}.map`);
        if (fs.existsSync(path.join(root, 'pokeemerald.map'))) fs.copyFileSync(path.join(root, 'pokeemerald.map'), keptMap);
        for (const rom of Object.keys(roms)) {
            const built = path.join(romsDir, rom);
            if (!fs.existsSync(built)) { console.log(`ERR   ${name}  ${rom}  no compiled output`); fail++; continue; }
            const kept = path.join(cacheDir, `${name}-${rom}`);
            fs.copyFileSync(built, kept);
            compiled[rom] = { path: kept, sha: sha(kept), map: fs.existsSync(keptMap) ? keptMap : null };
            freshHashes[`${name}/${rom}`] = compiled[rom].sha;
            const known = roms[rom];
            console.log(`      ${name}  ${rom}  compiled ${compiled[rom].sha.slice(0, 12)}…  ${compiled[rom].sha === known ? '(= manifest)' : '(manifest was ' + known.slice(0, 12) + '…)'}`);
        }
        }
    }

    // ── the inject path, in process, so the write journal is available ────────
    clean();
    for (const [index, romEntry] of bundle.roms.entries()) {
        const romName = makejs.romFileName(romEntry);
        if (!(romName in roms)) continue;
        let result;
        try {
            result = await makejs.injectOneRom({
                rom: romEntry, bundle, seed, universeSeed,
                outDir: path.join('/tmp', `gate3-inject-${name}`), fullRom: true, allowPending: true,
            });
        } catch (err) {
            console.log(`FAIL  ${name}  ${romName}  injection threw: ${err.message}`);
            fail++;
            continue;
        }

        if (!compileEach) {
            const expected = roms[romName];
            if (result.sha256 === expected) { console.log(`PASS  ${name}  ${romName}`); pass++; }
            else { console.log(`FAIL  ${name}  ${romName}  expected ${expected.slice(0, 12)}… got ${result.sha256.slice(0, 12)}…`); fail++; }
            continue;
        }

        const reference = compiled[romName];
        if (!reference) { fail++; continue; }
        const injectedBytes = fs.readFileSync(result.dest);
        const compiledBytes = fs.readFileSync(reference.path);

        if (bySymbol) {
            const problems = compareBySymbol({ injectedBytes, compiledBytes, compiledMapPath: reference.map, journal: result.journal });
            if (problems.length === 0) {
                console.log(`PASS  ${name}  ${romName}  every injected table matches compile() (by symbol)`);
                pass++;
            } else {
                console.log(`FAIL  ${name}  ${romName}  ${problems.length} table(s) differ from compile()`);
                for (const p of problems.slice(0, 10)) console.log(`        · ${p}`);
                fail++;
            }
            continue;
        }

        // 1. every byte the injector wrote must equal the compiled ROM
        const wrongWrites = new Map();       // tag → bytes wrong
        for (const entry of result.journal) {
            for (let i = 0; i < entry.length; i++) {
                const at = entry.offset + i;
                if (injectedBytes[at] !== compiledBytes[at]) {
                    wrongWrites.set(entry.tag, (wrongWrites.get(entry.tag) || 0) + 1);
                }
            }
        }

        // 2. what compile() changed that the injector did not write
        const claimed = new Uint8Array(baseBytes.length);
        for (const entry of result.journal) claimed.fill(1, entry.offset, entry.offset + entry.length);
        const unclaimed = [];
        for (let at = 0; at < compiledBytes.length; at++) {
            if (compiledBytes[at] !== baseBytes[at] && !claimed[at]) unclaimed.push(at);
        }
        const byOwner = new Map();
        if (unclaimed.length) {
            const regions = [];
            let start = unclaimed[0];
            let prev = unclaimed[0];
            for (const at of unclaimed.slice(1)) {
                if (at > prev + 64) { regions.push({ offset: start, length: prev - start + 1 }); start = at; }
                prev = at;
            }
            regions.push({ offset: start, length: prev - start + 1 });
            for (const region of attributeDiff(offsetMap, regions)) {
                const owner = ownerOf(region.symbol);
                const key = owner ? `${owner.id} (${owner.task}, ${owner.status})` : `unattributed:${region.symbol || '?'}`;
                const seenSoFar = byOwner.get(key) || { regions: 0, bytes: 0, sample: region };
                byOwner.set(key, { regions: seenSoFar.regions + 1, bytes: seenSoFar.bytes + region.length, sample: seenSoFar.sample });
            }
        }
        const leaked = [...byOwner.keys()].filter(k => k.includes('migrated'));

        if (wrongWrites.size === 0 && leaked.length === 0) {
            console.log(`PASS  ${name}  ${romName}  ${result.journal.length} writes match compile()` +
                `${byOwner.size ? `; ${unclaimed.length} B still compile-only (pending modules)` : '; whole ROM identical'}`);
            pass++;
        } else {
            console.log(`FAIL  ${name}  ${romName}`);
            for (const [tag, bytes] of wrongWrites) console.log(`        wrote ${bytes} B that compile() did not: tag '${tag}'`);
            for (const key of leaked) console.log(`        MIGRATED module left ${byOwner.get(key).bytes} B to compile(): ${key}`);
            fail++;
        }
        for (const [key, info] of byOwner) {
            console.log(`        · ${key.padEnd(46)} ${String(info.bytes).padStart(8)} B in ${info.regions} region(s)` +
                `${info.sample.symbol ? `, e.g. ${info.sample.symbol}` : ''}`);
        }
    }
}

clean();
console.log(`\n${fail === 0 ? 'ALL PASS' : 'MISMATCH'} — ${pass} pass / ${fail} fail`);
if (compileEach && Object.keys(freshHashes).length) {
    console.log('\nFresh compile-path hashes (for a manifest re-snapshot):');
    for (const [key, value] of Object.entries(freshHashes)) console.log(`  ${key}\t${value}`);
}
if (pending.length) console.log(`\n(partial migration: ${pending.map(m => m.task).join(', ')} not migrated yet)`);
process.exit(fail === 0 ? 0 : 1);
