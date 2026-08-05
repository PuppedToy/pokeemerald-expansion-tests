// T-249 — does the injector, running in a real browser Worker, produce the ROM the Node path produces?
//
// This is the acceptance check for the client-side injector: same modules, same bundle, same base, and a
// sha256 that has to match byte for byte (ADR-023). It also reports what the tab actually costs, which is
// the input to the mobile-memory question.
//
// A harness, not a Playwright test (`node injector-browser-check.mjs`), for the same reason
// verify-corpus is a skill and not a unit test: it needs the real 32 MB base, which is gitignored and only
// exists on a machine that has built one. `randomizer/__tests__/unit/injectorBrowserBundle.test.js` is the
// part that CAN run everywhere — it proves the same equality in a Node-free `vm` sandbox.
//
//   node injector-browser-check.mjs [--bundle path/to/bundle.json] [--rom-index 0] [--engine webkit] [--headed]
//
// `--engine webkit` runs Safari's engine, which is the one worth a second look: it is where the shims'
// assumptions (transferables, DataView, TextEncoder in a Worker) and the memory ceiling are least like
// Chromium's. `performance.memory` is Chromium-only, so the heap numbers only appear there.
//
// Inputs it finds by itself: base/pokeemerald.{gba,map,sym} and, for the bundle, --bundle →
// $T249_BUNDLE → backend/data/golden-corpus/baseline.bundle.json → debug/*/bundle.json.

import { chromium, webkit, firefox } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const argv = process.argv.slice(2);
const val = (name, fallback = null) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : fallback;
};

const MIME = { '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.gba': 'application/octet-stream' };

function resolveBundlePath() {
    const explicit = val('bundle') || process.env.T249_BUNDLE;
    if (explicit) return path.resolve(explicit);
    const corpus = path.join(ROOT, 'backend', 'data', 'golden-corpus', 'baseline.bundle.json');
    if (fs.existsSync(corpus)) return corpus;
    const debugDir = path.join(ROOT, 'debug');
    if (fs.existsSync(debugDir)) {
        for (const run of fs.readdirSync(debugDir).sort()) {
            const candidate = path.join(debugDir, run, 'bundle.json');
            if (fs.existsSync(candidate)) return candidate;
        }
    }
    return null;
}

/** The expected answer: the Node injector, driven exactly as the Worker drives it. */
function injectInNode({ romPath, offsetMap, baseSources, bundle, romIndex }) {
    const { Rom, injectRom } = require(path.join(ROOT, 'randomizer', 'injector'));
    const { injectionDataFor } = require(path.join(ROOT, 'randomizer', 'injector', 'romData'));
    const rng = require(path.join(ROOT, 'randomizer', 'rng'));

    const rom = bundle.roms[romIndex];
    const seed = bundle.seed ?? (bundle.config && bundle.config.seed);
    const { data, romSeed } = injectionDataFor({ rom, bundle, seed, universeSeed: bundle.universeSeed ?? seed });
    rng.seed(romSeed);
    const image = Rom.load(romPath);
    const { applied } = injectRom({ rom: image, offsetMap, data, baseSources });
    return { sha256: image.sha256(), applied, bytesWritten: image.bytesWritten };
}

/** Static server over a prefix→directory table, so /js/ can come from the real frontend. */
function serve(routes) {
    const server = http.createServer((req, res) => {
        const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
        const hit = Object.entries(routes)
            .filter(([prefix]) => prefix && rel.startsWith(prefix))
            .sort((a, b) => b[0].length - a[0].length)[0];
        const dir = hit ? hit[1] : routes[''];
        const file = path.join(dir, hit ? rel.slice(hit[0].length) : rel);
        if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
            res.writeHead(404).end('not found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
            // Worker + big fetches: no caching games while iterating.
            'Cache-Control': 'no-store',
        });
        fs.createReadStream(file).pipe(res);
    });
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

async function main() {
    const romIndex = Number(val('rom-index', '0'));
    const basePaths = {
        romPath: path.join(ROOT, 'base', 'pokeemerald.gba'),
        mapPath: path.join(ROOT, 'base', 'pokeemerald.map'),
        symPath: path.join(ROOT, 'base', 'pokeemerald.sym'),
    };
    const bundlePath = resolveBundlePath();
    const missing = [
        ...Object.values(basePaths).filter(p => !fs.existsSync(p)),
        ...(bundlePath && fs.existsSync(bundlePath) ? [] : ['a bundle.json (see --bundle)']),
    ];
    if (missing.length) {
        console.log(`SKIP — this machine has no ${missing.join(', ')}.`);
        console.log('      Build a base (docs/base-rom-provisioning.md) or point --bundle at a bundle.json.');
        process.exit(0);
    }

    // ── the artifacts a browser gets, built the way the build box builds them ──
    const { loadOffsetMap } = require(path.join(ROOT, 'randomizer', 'injector', 'symbolMap'));
    const { exportInjectionOffsetMap, exportBaseSources } = require(path.join(ROOT, 'randomizer', 'injector', 'buildOffsetMap'));
    const { BaseSources } = require(path.join(ROOT, 'randomizer', 'injector', 'sources'));
    const { Rom } = require(path.join(ROOT, 'randomizer', 'injector', 'rom'));

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 't249-browser-'));
    const buildId = Rom.load(basePaths.romPath).sha256();
    console.log(`base       ${basePaths.romPath}  ${buildId.slice(0, 12)}…`);
    console.log(`bundle     ${bundlePath}`);

    const { buildClientArtifacts } = require(path.join(ROOT, 'randomizer', 'injector', 'buildClientArtifacts'));
    const vanillaPath = process.env.VANILLA_ROM || path.join(ROOT, 'pokeemerald-vanilla.gba');
    const clientDir = path.join(dir, 'client');
    let manifest = null;
    if (fs.existsSync(vanillaPath)) {
        // The whole set, exactly as deploy/build-base.sh produces it — base.bps included, so the
        // `--flow client` run below can reconstruct the base the way a user's browser will.
        manifest = buildClientArtifacts({
            romPath: basePaths.romPath, mapPath: basePaths.mapPath, symPath: basePaths.symPath,
            vanillaPath, outDir: clientDir, log: (line) => console.log(`  ${line}`),
        });
        fs.copyFileSync(vanillaPath, path.join(dir, 'vanilla.gba'));
    } else {
        fs.mkdirSync(clientDir, { recursive: true });
        const full = loadOffsetMap(basePaths.mapPath).merge(loadOffsetMap(basePaths.symPath));
        const { symbols, of } = exportInjectionOffsetMap(full, path.join(clientDir, 'base-offsets.json'));
        const { bytes } = exportBaseSources({ outPath: path.join(clientDir, 'base-sources.json'), buildId });
        console.log(`artifacts  ${symbols}/${of} symbols, ${(bytes / 1048576).toFixed(1)} MB of sources (no vanilla ROM: no base.bps)`);
    }

    const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
    const baseSources = BaseSources.fromJSON(JSON.parse(fs.readFileSync(path.join(clientDir, 'base-sources.json'), 'utf8')));
    const offsetMap = loadOffsetMap(path.join(clientDir, 'base-offsets.json'));

    console.log('\n── Node ──');
    const t0 = Date.now();
    const expected = injectInNode({ romPath: basePaths.romPath, offsetMap, baseSources, bundle, romIndex });
    console.log(`${expected.applied.length} module(s), ${expected.bytesWritten.toLocaleString()} B written in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    console.log(`sha256     ${expected.sha256}`);

    // ── the same thing, in a browser Worker ──
    fs.copyFileSync(path.join(ROOT, 'frontend', 'js', 'injector.bundle.js'), path.join(dir, 'injector.bundle.js'));
    fs.copyFileSync(basePaths.romPath, path.join(dir, 'base.gba'));
    fs.writeFileSync(path.join(dir, 'bundle.json'), JSON.stringify(bundle));
    // The page loads the bundle too, so the memory pass below can call `injectOne` where
    // `performance.memory` exists. The Worker run is the one that mirrors production.
    fs.writeFileSync(path.join(dir, 'index.html'),
        '<!doctype html><meta charset="utf-8"><title>T-249</title><script src="/injector.bundle.js"></script>');

    const { server, port } = await serve({
        '': dir,
        'js/': path.join(ROOT, 'frontend', 'js'),
        'client/': path.join(dir, 'client'),
    });
    const engines = { chromium, webkit, firefox };
    const engineName = val('engine', 'chromium');
    const engine = engines[engineName];
    if (!engine) throw new Error(`--engine must be one of ${Object.keys(engines).join(', ')}`);
    const browser = await engine.launch({
        headless: !argv.includes('--headed'),
        // Chromium-only: without it performance.memory is bucketed to uselessness.
        ...(engineName === 'chromium' ? { args: ['--enable-precise-memory-info'] } : {}),
    });
    try {
        const page = await browser.newPage();
        page.on('console', (msg) => { if (msg.type() === 'error') console.log(`  browser error: ${msg.text()}`); });
        await page.goto(`http://127.0.0.1:${port}/index.html`);

        console.log(`\n── ${engineName} (Worker) ──`);
        // The Worker is left running so its OWN heap can be measured through Playwright (below): the page's
        // heap says nothing about the thread that holds the ROM.
        const workerAppeared = page.waitForEvent('worker');
        const result = await page.evaluate(async () => {
            const started = performance.now();
            const [baseRom, offsets, sources, bundle] = await Promise.all([
                fetch('/base.gba').then(r => r.arrayBuffer()),
                fetch('/client/base-offsets.json').then(r => r.json()),
                fetch('/client/base-sources.json').then(r => r.json()),
                fetch('/bundle.json').then(r => r.json()),
            ]);
            const fetched = performance.now();
            const heapBefore = performance.memory ? performance.memory.usedJSHeapSize : null;

            const worker = new Worker('/injector.bundle.js');
            self.__worker = worker;                    // kept alive for the heap measurement
            const done = new Promise((resolve, reject) => {
                worker.onmessage = ({ data }) => (data.type === 'done' ? resolve(data) : reject(new Error(data.message)));
                worker.onerror = (e) => reject(new Error(e.message || 'worker crashed'));
            });
            worker.postMessage({ type: 'inject', baseRom, offsets, sources, bundle, romIndex: 0 }, [baseRom]);
            const injected = await done;
            const finished = performance.now();

            return {
                sha256: injected.sha256,
                applied: injected.applied,
                bytesWritten: injected.bytesWritten,
                romBytes: injected.rom.byteLength,
                fetchMs: Math.round(fetched - started),
                injectMs: Math.round(finished - fetched),
                heapBefore,
                heapAfter: performance.memory ? performance.memory.usedJSHeapSize : null,
            };
        });

        await workerAppeared.catch(() => {});
        await page.evaluate(() => { if (self.__worker) self.__worker.terminate(); });

        const mb = (n) => (n === null || n === undefined ? 'n/a' : `${(n / 1048576).toFixed(1)} MB`);
        console.log(`${result.applied.length} module(s), ${result.bytesWritten.toLocaleString()} B written`);
        console.log(`fetch      ${(result.fetchMs / 1000).toFixed(1)} s (32 MB base + artifacts)`);
        console.log(`inject     ${(result.injectMs / 1000).toFixed(1)} s`);
        console.log(`rom out    ${mb(result.romBytes)}`);
        console.log(`page heap  ${mb(result.heapBefore)} → ${mb(result.heapAfter)} (before/after the Worker did the work)`);
        console.log(`sha256     ${result.sha256}`);

        // What the injecting thread actually holds — the number the mobile question turns on. Chromium does
        // not expose performance.memory inside a Worker, so this second pass runs the SAME `injectOne` on
        // the page thread, where it can be measured. Same allocations, one measurable heap.
        const heap = await page.evaluate(async () => {
            if (!performance.memory) return null;
            const [baseRom, offsets, sources, bundle] = await Promise.all([
                fetch('/base.gba').then(r => r.arrayBuffer()),
                fetch('/client/base-offsets.json').then(r => r.json()),
                fetch('/client/base-sources.json').then(r => r.json()),
                fetch('/bundle.json').then(r => r.json()),
            ]);
            const inputs = performance.memory.usedJSHeapSize;
            const result = self.injectOne({ baseRom, offsets, sources, bundle, romIndex: 0 });
            return {
                sha256: result.sha256,
                inputs,
                peak: performance.memory.usedJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                bundleBytes: JSON.stringify(bundle).length,
            };
        });
        if (heap) {
            console.log('\n── memory, injecting on the page thread so it can be measured ──');
            console.log(`inputs     ${mb(heap.inputs)} held before injecting (32 MB base + ${mb(heap.bundleBytes)} bundle + artifacts, parsed)`);
            console.log(`peak       ${mb(heap.peak)} of a ${mb(heap.limit)} heap limit`);
            console.log(`injection  +${mb(heap.peak - heap.inputs)} on top of the inputs`);
            if (heap.sha256 !== expected.sha256) console.log('  ⚠ the page-thread run disagreed with Node');
        }

        // ── the real delivery path: frontend/js/client-inject.js, from manifest to finished ROM ──
        let clientFlow = null;
        if (manifest) {
            console.log('\n── the shipped path (client-inject.js: manifest → vanilla + base.bps → Worker) ──');
            clientFlow = await page.evaluate(async () => {
                const { putRom } = await import('/js/rom-store.js');
                // The user's own ROM, in IndexedDB, exactly as the app puts it there.
                await putRom(new Uint8Array(await (await fetch('/vanilla.gba')).arrayBuffer()));

                const { clientArtifactManifest, ensureBaseRom, injectBundleLocally } = await import('/js/client-inject.js');
                const manifest = await clientArtifactManifest();
                const steps = [];

                const t0 = performance.now();
                await ensureBaseRom(manifest, (step) => steps.push(step));   // fetches + applies base.bps
                const built = performance.now();
                await ensureBaseRom(manifest, (step) => steps.push(step));   // second call: the IDB cache
                const cached = performance.now();

                const bundle = await fetch('/bundle.json').then(r => r.json());
                const artifacts = await injectBundleLocally(bundle, { withPatches: false });
                return {
                    buildId: manifest.buildId,
                    steps,
                    baseMs: Math.round(built - t0),
                    cacheMs: Math.round(cached - built),
                    injectMs: Math.round(performance.now() - cached),
                    roms: artifacts.length,
                    sha256: artifacts[0].sha256,
                    bytes: artifacts[0].gbaBytes.length,
                };
            });
            console.log(`base       ${(clientFlow.baseMs / 1000).toFixed(1)} s to fetch+apply base.bps, ${clientFlow.cacheMs} ms from the IndexedDB cache`);
            console.log(`steps      ${clientFlow.steps.join(' → ')}`);
            console.log(`inject     ${clientFlow.roms} ROM(s) in ${(clientFlow.injectMs / 1000).toFixed(1)} s, ${mb(clientFlow.bytes)} each`);
            console.log(`sha256     ${clientFlow.sha256}`);
            if (clientFlow.sha256 !== expected.sha256) console.log('  ✗ the shipped path disagreed with Node');
        }

        const same = result.sha256 === expected.sha256 && (!clientFlow || clientFlow.sha256 === expected.sha256);
        console.log(same
            ? '\n✓ the browser produced the Node path\'s ROM, byte for byte'
            : '\n✗ DIFFERENT — the browser and Node disagree');
        process.exitCode = same ? 0 : 1;
    } finally {
        await browser.close();
        server.close();
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

main().catch((err) => { console.error(err); process.exit(1); });
