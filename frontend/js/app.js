import { ConfigForm } from './config-form.js';
import { buildBundle, downloadBundle } from './session.js';

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

// Activate first tab on load
setActiveTab('home');

// ── Randomizer wizard ─────────────────────────────────────────────────────────

let currentStep = 1;
let currentConfig = null;

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

// Step 2 → 3: Generate
document.getElementById('btn-generate').addEventListener('click', () => {
    currentConfig = form.getConfig();
    if (!currentConfig) { alert('Please check your settings.'); return; }

    // Fill seed if blank
    if (currentConfig.seed === null) {
        currentConfig.seed = Math.floor(Math.random() * 0xFFFFFFFF);
    }

    const bundle = buildBundle(currentConfig);
    downloadBundle(bundle);
    showStep(3);

    // Show confirmation
    document.getElementById('generate-seed-display').textContent = `Seed: ${currentConfig.seed}`;
    document.getElementById('generate-success').style.display = 'flex';
});

// Step 3 → 1: Start over
document.getElementById('btn-start-over').addEventListener('click', () => {
    document.getElementById('generate-success').style.display = 'none';
    showStep(1);
});

// Init
showStep(1);

// ── Review renderer ───────────────────────────────────────────────────────────

const MODE_LABELS = { 1: 'Solo run', 2: 'Co-op (shared Pokédex)', 3: 'Co-op (shared gym teams)', 4: 'Soul-Link (standard)', 5: 'Soul-Link (strict — shared routes)' };

function renderReview(cfg) {
    const rows = [
        ['Run type',     MODE_LABELS[cfg.sharedModules] ?? `sharedModules=${cfg.sharedModules}`],
        ['Players',      cfg.numROMs],
        ['Difficulty',   cfg.difficulty.charAt(0).toUpperCase() + cfg.difficulty.slice(1)],
        ['Rebalance stats', cfg.rebalance ? 'Yes' : 'No'],
        ...(cfg.rebalance ? [['Balance chance', Math.round(cfg.balanceChance * 100) + '%']] : []),
        ['All TMs',      cfg.allTms ? 'Yes (all teachable moves)' : 'No (game TM pool only)'],
        ['Seed',         cfg.seed != null ? cfg.seed : '(random — assigned on Generate)'],
    ];

    document.getElementById('review-rows').innerHTML = rows.map(([k, v]) => `
        <div class="summary-row">
            <span class="summary-key">${k}</span>
            <span class="summary-val">${v}</span>
        </div>
    `).join('');
}
