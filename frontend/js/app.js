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
let currentJobId = null;
let currentEventSource = null;

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

// Step 2 → 3: Generate — calls server, streams progress
document.getElementById('btn-generate').addEventListener('click', async () => {
    currentConfig = form.getConfig();
    if (!currentConfig) { alert('Please check your settings.'); return; }

    if (currentConfig.seed === null) {
        currentConfig.seed = Math.floor(Math.random() * 0xFFFFFFFF);
    }

    showStep(3);
    resetGenerateUI();

    try {
        const res = await fetch('/api/generate/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentConfig),
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const { jobId } = await res.json();
        currentJobId = jobId;
        openProgressStream(jobId);
    } catch (err) {
        showGenError(err.message);
    }
});

// Step 3 → 1: Start over
document.getElementById('btn-start-over').addEventListener('click', () => {
    closeEventSource();
    showStep(1);
});
document.getElementById('btn-start-over-err').addEventListener('click', () => {
    closeEventSource();
    showStep(1);
});

// Download all (ZIP: bundle JSON + per-ROM docs HTML)
document.getElementById('btn-download-all').addEventListener('click', async () => {
    if (!currentJobId) return;

    const btn = document.getElementById('btn-download-all');
    btn.disabled = true;
    btn.textContent = 'Building ZIP…';

    try {
        const [bundle, template] = await Promise.all([
            fetch(`/api/generate/bundle?jobId=${currentJobId}`).then(r => { if (!r.ok) throw new Error(`Bundle fetch failed: ${r.status}`); return r.json(); }),
            fetch('/template.html').then(r => { if (!r.ok) throw new Error('Template not found'); return r.text(); }),
        ]);

        const zip = new JSZip();
        zip.file('bundle.json', JSON.stringify(bundle, null, 2));

        for (const rom of bundle.roms) {
            const pokedex = resolveArtifact(rom.artifacts.pokedex, bundle.sharedData, 'pokedex');

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
        const seed = bundle.config?.seed ?? 'unknown';
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

// Download bundle
document.getElementById('btn-download-bundle').addEventListener('click', () => {
    if (!currentJobId) return;
    const a = document.createElement('a');
    a.href = `/api/generate/bundle?jobId=${currentJobId}`;
    a.download = `session-bundle-${currentConfig?.seed ?? 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Init
showStep(1);

// ── SSE helpers ───────────────────────────────────────────────────────────────

let _crawlInterval = null;
let _realPct = 0;
let _displayPct = 0;

function startCrawl() {
    stopCrawl();
    _crawlInterval = setInterval(() => {
        // Crawl toward (realPct + 18), capped at 95, at 0.25% per 250ms (~1%/s)
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

function openProgressStream(jobId) {
    closeEventSource();
    _realPct = 0;
    _displayPct = 0;
    startCrawl();

    const es = new EventSource(`/api/generate/stream?jobId=${jobId}`);
    currentEventSource = es;

    es.onmessage = (e) => {
        const { event, data } = JSON.parse(e.data);
        if (event === 'progress') {
            updateProgressUI(data.progress, data.step);
        } else if (event === 'done') {
            stopCrawl();
            es.close();
            showGenDone();
        } else if (event === 'error') {
            stopCrawl();
            es.close();
            showGenError(data.message);
        }
    };

    es.onerror = () => {
        stopCrawl();
        es.close();
        showGenError('Lost connection to server.');
    };
}

function closeEventSource() {
    stopCrawl();
    if (currentEventSource) { currentEventSource.close(); currentEventSource = null; }
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
    // Snap forward if the real value overtook the crawl; never go backwards
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
