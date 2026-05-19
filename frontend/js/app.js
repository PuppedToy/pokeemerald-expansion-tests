import { ConfigForm } from './config-form.js';
import { resolveArtifact } from './session.js';

// ── Tab routing ───────────────────────────────────────────────────────────────

function setActiveTab(tabId) {
    document.querySelectorAll('.topnav-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-section').forEach(el => {
        el.classList.toggle('active', el.id === `tab-${tabId}`);
    });
}

document.querySelectorAll('.topnav-tab').forEach(btn => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
});

setActiveTab('home');

// ── Randomizer wizard ─────────────────────────────────────────────────────────

let currentStep = 1;
let currentConfig = null;
let currentBundle = null;
let currentWorker = null;

const form = new ConfigForm(document.getElementById('config-form-mount'), {
    onConfigChange(cfg) { currentConfig = cfg; },
});
currentConfig = form.getConfig();

function showStep(n) {
    currentStep = n;
    document.querySelectorAll('.wizard-panel').forEach(el => {
        el.classList.toggle('active', el.dataset.step === String(n));
    });
    document.querySelectorAll('.step').forEach(el => {
        const s = parseInt(el.dataset.stepNum, 10);
        el.classList.toggle('active', s === n);
        el.classList.toggle('done', s < n);
    });
}

// Step 1 → 2: Review
document.getElementById('btn-to-review').addEventListener('click', () => {
    currentConfig = form.getConfig();
    if (!currentConfig) { alert('Please check your settings.'); return; }
    renderReview(currentConfig);
    showStep(2);
});

// Step 2 → 1: Back
document.getElementById('btn-back-to-config').addEventListener('click', () => showStep(1));

// Step 2 → 3: Generate — runs the randomizer in a Web Worker (no API call)
document.getElementById('btn-generate').addEventListener('click', () => {
    currentConfig = form.getConfig();
    if (!currentConfig) { alert('Please check your settings.'); return; }

    if (currentConfig.seed == null) {
        currentConfig.seed = (Math.random() * 0xFFFFFFFF) >>> 0;
    }

    showStep(3);
    resetGenerateUI();
    startWorker(currentConfig);
});

// Step 3 → 1: Start over
document.getElementById('btn-start-over').addEventListener('click', () => {
    terminateWorker();
    showStep(1);
});
document.getElementById('btn-start-over-err').addEventListener('click', () => {
    terminateWorker();
    showStep(1);
});

// Download all (ZIP: bundle JSON + per-ROM docs HTML)
document.getElementById('btn-download-all').addEventListener('click', async () => {
    if (!currentBundle) return;

    const btn = document.getElementById('btn-download-all');
    btn.disabled = true;
    btn.textContent = 'Building ZIP…';

    try {
        const template = await fetch('/template.html').then(r => {
            if (!r.ok) throw new Error('Template not found');
            return r.text();
        });

        const zip = new JSZip();
        zip.file('bundle.json', JSON.stringify(currentBundle, null, 2));

        for (const rom of currentBundle.roms) {
            const pokedex = resolveArtifact(rom.artifacts.pokedex, currentBundle.sharedData, 'pokedex');

            let html = template;
            html = html.replace('<script src="trainers.js"></script>',
                `<script>const trainersData = ${JSON.stringify(rom.docs.trainersResultsSimplified)};</script>`);
            html = html.replace('<script src="pokes.js"></script>',
                `<script>const pokes = ${JSON.stringify(pokedex.pokes)};</script>`);
            html = html.replace('<script src="moves.js"></script>',
                `<script>const movesData = ${JSON.stringify(pokedex.moves)};</script>`);
            html = html.replace('<script src="abilities.js"></script>',
                `<script>const abilitiesData = ${JSON.stringify(pokedex.abilities)};</script>`);
            html = html.replace('<script src="wildpokes.js"></script>',
                `<script>const wildPokes = ${JSON.stringify(rom.docs.wildPokes)};</script>`);

            const label = rom.playerIndex !== undefined
                ? `docs/player-${rom.playerIndex}-rom-${rom.romIndex}.html`
                : `docs/rom-${rom.romIndex}.html`;
            zip.file(label, html);
        }

        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        const seed = currentBundle.config?.seed ?? 'unknown';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `run-${seed}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    } catch (err) {
        alert(`ZIP generation failed: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = '⬇ Download all (ZIP)';
    }
});

// Download bundle (in-memory — no server fetch needed)
document.getElementById('btn-download-bundle').addEventListener('click', () => {
    if (!currentBundle) return;
    const json = JSON.stringify(currentBundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `session-bundle-${currentConfig?.seed ?? 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
});

// Init
showStep(1);

// ── Web Worker helpers ────────────────────────────────────────────────────────

function startWorker(config) {
    terminateWorker();
    _realPct = 0;
    _displayPct = 0;
    startCrawl();

    const worker = new Worker('/js/randomizer.bundle.js');
    currentWorker = worker;

    worker.onmessage = ({ data }) => {
        if (data.type === 'progress') {
            updateProgressUI(data.pct, data.step);
        } else if (data.type === 'done') {
            stopCrawl();
            currentBundle = data.bundle;
            worker.terminate();
            currentWorker = null;
            showGenDone();
        } else if (data.type === 'error') {
            stopCrawl();
            worker.terminate();
            currentWorker = null;
            showGenError(data.message);
        }
    };

    worker.onerror = (e) => {
        stopCrawl();
        worker.terminate();
        currentWorker = null;
        showGenError(e.message || 'Worker crashed.');
    };

    worker.postMessage({ type: 'generate', config });
}

function terminateWorker() {
    stopCrawl();
    if (currentWorker) { currentWorker.terminate(); currentWorker = null; }
}

// ── Progress crawl animation ──────────────────────────────────────────────────

let _crawlInterval = null;
let _realPct = 0;
let _displayPct = 0;

function startCrawl() {
    stopCrawl();
    _crawlInterval = setInterval(() => {
        const ceiling = Math.min(_realPct + 18, 95);
        if (_displayPct < ceiling) {
            _displayPct = Math.min(_displayPct + 0.25, ceiling);
            _setBarUI(Math.round(_displayPct));
        }
    }, 250);
}

function stopCrawl() {
    if (_crawlInterval) { clearInterval(_crawlInterval); _crawlInterval = null; }
}

// ── Step 3 UI states ──────────────────────────────────────────────────────────

function resetGenerateUI() {
    _realPct = 0;
    _displayPct = 0;
    document.getElementById('gen-running').style.display = '';
    document.getElementById('gen-done').style.display    = 'none';
    document.getElementById('gen-error').style.display   = 'none';
    _setBarUI(0);
    document.getElementById('gen-step-label').textContent = 'Starting…';
}

function _setBarUI(pct) {
    document.getElementById('gen-progress-fill').style.width = `${pct}%`;
    document.getElementById('gen-progress-pct').textContent  = `${pct}%`;
}

function updateProgressUI(pct, step) {
    _realPct = pct;
    if (pct > _displayPct) _displayPct = pct;
    _setBarUI(Math.round(_displayPct));
    document.getElementById('gen-step-label').textContent = step;
}

function showGenDone() {
    document.getElementById('gen-running').style.display = 'none';
    document.getElementById('gen-done').style.display    = '';

    const cfg = currentConfig ?? {};
    const numROMs = cfg.runType === 'default' ? 1
        : cfg.runType === 'nuzlocke' ? cfg.numROMs
        : (cfg.numPlayers ?? 1) * (cfg.romsPerPlayer ?? 1);

    document.getElementById('gen-done-meta').textContent =
        `Seed: ${cfg.seed}  ·  ${numROMs} ROM${numROMs !== 1 ? 's' : ''} ready to download`;
}

function showGenError(message) {
    document.getElementById('gen-running').style.display = 'none';
    document.getElementById('gen-error').style.display   = '';
    document.getElementById('gen-error-msg').textContent = message;
}

// ── Review renderer ───────────────────────────────────────────────────────────

function fmtShared(shared) {
    const parts = [];
    if (shared.pokedex)  parts.push('Pokémon universe');
    if (shared.trainers) parts.push('trainer teams & rewards');
    if (shared.starters) parts.push('starters');
    return parts.length > 0 ? parts.join(', ') : 'none';
}

function renderReview(cfg) {
    const rows = [];

    if (cfg.runType === 'default') {
        rows.push(['Run type', 'Default']);
        rows.push(['ROMs', '1']);
    } else if (cfg.runType === 'nuzlocke') {
        rows.push(['Run type', 'Nuzlocke']);
        rows.push(['Number of ROMs', cfg.numROMs]);
        rows.push(['Shared', fmtShared(cfg.shared)]);
    } else if (cfg.runType === 'soullink') {
        rows.push(['Run type', 'Soul-Link']);
        rows.push(['Players', cfg.numPlayers]);
        rows.push(['ROMs per player', cfg.romsPerPlayer]);
        rows.push(['Total ROMs', cfg.numPlayers * cfg.romsPerPlayer]);
        rows.push(['Players share', fmtShared(cfg.playerShared)]);
        rows.push(['ROM sharing', fmtShared(cfg.romShared)]);
    }

    rows.push(['Difficulty',      cfg.difficulty.charAt(0).toUpperCase() + cfg.difficulty.slice(1)]);
    rows.push(['Rebalance stats', cfg.rebalance ? 'Yes' : 'No']);
    if (cfg.rebalance) rows.push(['Balance chance', Math.round(cfg.balanceChance * 100) + '%']);
    rows.push(['Seed', cfg.seed != null ? cfg.seed : '(random — assigned on Generate)']);

    document.getElementById('review-rows').innerHTML = rows.map(([k, v]) => `
        <div class="summary-row">
            <span class="summary-key">${k}</span>
            <span class="summary-val">${v}</span>
        </div>
    `).join('');
}
