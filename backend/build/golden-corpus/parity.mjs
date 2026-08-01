// GATE-3 / INV-BYTES harness (T-239): inject every FROZEN corpus bundle into the base and diff each
// ROM's sha256 against manifest.json — i.e. against what `compile(bundle)` produced.
//
// Why the manifest is a valid reference: it holds the compile-path hash of every corpus ROM on THIS base
// (T-230/T-233). So a parity run does not need to compile anything — it injects (seconds) and compares.
// If the base changed, re-snapshot first (build-and-hash.sh) or the comparison is meaningless.
//
// Runs ON the build box (PRO — the only build env), from the repo root, inside the app container:
//
//   INJECT_BASE_ROM=/opt/base/pokeemerald.gba \
//   INJECT_BASE_MAP=/opt/base/pokeemerald.map \
//   INJECT_BASE_SYM=/opt/base/pokeemerald.sym \
//     node backend/build/golden-corpus/parity.mjs [--only baseline] [--explain]
//
// Exit 0 = every injected ROM is byte-identical to the compiled one. A FAIL is a Phase-3 bug: the
// injector wrote something the writers did not, or missed something they did. `--explain` rebuilds the
// mismatching bundle through the compile path and prints the differing regions with the symbol that owns
// each one (injector/parity.js), which is what turns "hashes differ" into "gSpeciesInfo+0x4, 2 bytes".
//
// While Phase 3 is unfinished the un-migrated outputs still carry BASE data, so a full-ROM match is only
// expected for a bundle that exercises migrated outputs only. Until T-243 lands, run with --allow-pending
// and read the per-region diff: every differing region must belong to a module that is still `pending`.
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
const explain = argv.includes('--explain');
const allowPending = argv.includes('--allow-pending');

const run = (cmd, a, env = {}) => execFileSync(cmd, a, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const clean = () => { try { run('git', ['checkout', '--', 'src/', 'include/', 'data/maps/']); } catch { /* noop */ } };

const load = (rel) => import(pathToFileURL(path.join(root, rel)).href).then(m => m.default || m);
const { INJECTION_MODULES, pendingModules } = await load('randomizer/injector/index.js');
const { loadOffsetMap } = await load('randomizer/injector/symbolMap.js');
const { diffRegions, attributeDiff, formatDiff } = await load('randomizer/injector/parity.js');

const pending = pendingModules(INJECTION_MODULES);
if (pending.length && !allowPending) {
    console.error(
        `Phase 3 is unfinished: ${pending.map(m => `${m.id} (${m.task})`).join(', ')} still pending, so an\n` +
        `injected ROM carries BASE data for those outputs and cannot match the manifest. Re-run with\n` +
        `--allow-pending --explain and check that every differing region belongs to a pending module.`);
    process.exit(2);
}

const romsDirOf = (bundle) => path.join(root, 'roms', JSON.parse(fs.readFileSync(bundle, 'utf8')).sessionId);

let pass = 0;
let fail = 0;

for (const [name, roms] of Object.entries(manifest.bundles)) {
    if (only && name !== only) continue;
    const bundle = path.join(corpus, `${name}.bundle.json`);
    if (!fs.existsSync(bundle)) { console.log(`MISS  ${name}  (no frozen bundle — run generate.mjs)`); fail++; continue; }

    clean();
    try {
        run('node', ['make.js', `--bundle=${bundle}`, '--full-rom', '--inject'], { ROM_BUILD_MODE: 'inject' });
    } catch (err) {
        console.log(`ERR   ${name}  injection failed: ${String(err.stderr || err.stdout || err.message).trim().split('\n').slice(-3).join(' | ')}`);
        fail++;
        continue;
    }

    const romsDir = romsDirOf(bundle);
    for (const [rom, expected] of Object.entries(roms)) {
        const injected = path.join(romsDir, rom);
        if (!fs.existsSync(injected)) { console.log(`ERR   ${name}  ${rom}  no injected output at ${romsDir}`); fail++; continue; }
        const got = sha(injected);
        if (got === expected) { console.log(`PASS  ${name}  ${rom}`); pass++; continue; }

        console.log(`FAIL  ${name}  ${rom}  expected ${expected.slice(0, 12)}… got ${got.slice(0, 12)}…`);
        fail++;
        if (!explain) continue;

        // Keep the injected image, rebuild the same bundle through the compile path, and attribute the diff.
        const kept = path.join('/tmp', `parity-${name}-${rom}`);
        fs.copyFileSync(injected, kept);
        clean();
        try {
            run('node', ['make.js', `--bundle=${bundle}`, '--full-rom', '--compile'], { ROM_BUILD_MODE: 'compile' });
        } catch {
            console.log(`      (could not rebuild ${name} through the compile path to explain the diff)`);
            continue;
        }
        const compiled = path.join(romsDir, rom);
        const mapPath = process.env.INJECT_BASE_MAP || path.join(root, 'base', 'pokeemerald.map');
        const regions = diffRegions(fs.readFileSync(compiled), fs.readFileSync(kept));
        const attributed = fs.existsSync(mapPath) ? attributeDiff(regions, loadOffsetMap(mapPath)) : regions;
        console.log(formatDiff(attributed).split('\n').map(line => `      ${line}`).join('\n'));
    }
}

clean();
console.log(`\n${fail === 0 ? 'ALL PASS' : 'MISMATCH'} — ${pass} pass / ${fail} fail`);
if (pending.length) console.log(`(partial run: ${pending.map(m => m.task).join(', ')} not migrated yet)`);
process.exit(fail === 0 ? 0 : 1);
