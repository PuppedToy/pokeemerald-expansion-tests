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
        clean();
        try {
            run('node', ['make.js', `--bundle=${bundlePath}`, '--full-rom', '--compile'], { ROM_BUILD_MODE: 'compile' });
        } catch (err) {
            console.log(`ERR   ${name}  compile failed: ${String(err.stderr || err.message).trim().split('\n').slice(-2).join(' | ')}`);
            fail++;
            continue;
        }
        for (const rom of Object.keys(roms)) {
            const built = path.join(romsDir, rom);
            if (!fs.existsSync(built)) { console.log(`ERR   ${name}  ${rom}  no compiled output`); fail++; continue; }
            const kept = path.join('/tmp', `gate3-${name}-${rom}`);
            fs.copyFileSync(built, kept);
            compiled[rom] = { path: kept, sha: sha(kept) };
            freshHashes[`${name}/${rom}`] = compiled[rom].sha;
            const known = roms[rom];
            console.log(`      ${name}  ${rom}  compiled ${compiled[rom].sha.slice(0, 12)}…  ${compiled[rom].sha === known ? '(= manifest)' : '(manifest was ' + known.slice(0, 12) + '…)'}`);
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
