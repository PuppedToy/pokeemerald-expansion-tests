import { ConfigForm, totalRoms, DEFAULTS } from './config-form.js';
import { resolveArtifact } from './session.js';
import { romName, bundleFileName, romForServerName } from './romNaming.js';
import { initAccount, onBundleReady, getStoredBundle, getAuthState, onAuthChange, api } from './account.js';
import { initFeedback } from './feedback.js';
import { initPresets } from './presets.js';

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

// T-034: clicking the brand returns to Home.
document.getElementById('brand-home').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTab('home');
});

// In-page links that jump to a top-nav tab (e.g. the landing "See the full feature list" CTA).
document.querySelectorAll('[data-goto-tab]').forEach(el => {
    el.addEventListener('click', () => setActiveTab(el.dataset.gotoTab));
});

setActiveTab('home');

// ── Mobile nav drawer (T-040) ─────────────────────────────────────────────────────
// Desktop is unaffected: the drawer/scrim CSS is scoped to ≤600px; this only toggles a body class.
const navBurger = document.getElementById('nav-burger');
const navScrim  = document.getElementById('nav-scrim');
function setNavOpen(open) {
    document.body.classList.toggle('nav-open', open);
    navBurger?.setAttribute('aria-expanded', open ? 'true' : 'false');
}
navBurger?.addEventListener('click', () => setNavOpen(!document.body.classList.contains('nav-open')));
navScrim?.addEventListener('click', () => setNavOpen(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNavOpen(false); });
// Choosing a destination (tab or an account action) closes the drawer.
document.querySelectorAll('.topnav-tab, .topnav-account').forEach((el) => {
    el.addEventListener('click', () => setNavOpen(false));
});

// ── Features sub-tabs ───────────────────────────────────────────────────────────
function setActiveSubtab(subtabId) {
    document.querySelectorAll('.subtab').forEach(el => {
        el.classList.toggle('active', el.dataset.subtab === subtabId);
    });
    document.querySelectorAll('.subtab-panel').forEach(el => {
        el.classList.toggle('active', el.dataset.subtabPanel === subtabId);
    });
}

document.querySelectorAll('.subtab').forEach(btn => {
    btn.addEventListener('click', () => setActiveSubtab(btn.dataset.subtab));
});

// ── Randomizer wizard ─────────────────────────────────────────────────────────

let currentStep = 1;
let currentConfig = null;
let currentBundle = null;
let regenerateMode = false;   // T-190 — true while reviewing/building an uploaded bundle (no randomization)
let currentWorker = null;

let presetsCtl = null; // T-192 — set below once account.js's auth helpers are available
const form = new ConfigForm(document.getElementById('config-form-mount'), {
    onConfigChange(cfg) { currentConfig = cfg; },
    // T-192 — the green "Load Preset" button opens the presets modal (My / Official / Community).
    onLoadPreset() { presetsCtl?.openBrowse(); },
    // T-190 — a full bundle uploaded from the config screen jumps straight to the build step
    // (bypassing the randomizer Worker); showGenDone() → onBundleReady() persists it and POSTs
    // /api/produce, so the exact ROMs are rebuilt as-is with no re-randomization.
    onRegenerateBundle(bundle) {
        // T-190 — an uploaded bundle skips config + randomization: show its details on Review,
        // then the "Regenerate from bundle" button builds it as-is.
        currentBundle = bundle;
        currentConfig = bundle.config || currentConfig;
        regenerateMode = true;
        renderReview(currentConfig, true);
        showStep(2);
    },
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
    regenerateMode = false;   // normal path: randomize from the current config
    renderReview(currentConfig, false);
    showStep(2);
});

// Step 2 → 1: Back
document.getElementById('btn-back-to-config').addEventListener('click', () => showStep(1));

// Step 2 → 3: Generate — runs the randomizer in a Web Worker (no API call)
document.getElementById('btn-generate').addEventListener('click', () => {
    // T-190 — in regenerate mode, rebuild the uploaded bundle as-is: no config read, no Worker.
    if (regenerateMode) {
        showStep(3);
        resetGenerateUI();
        showGenDone();   // → onBundleReady(currentBundle) persists it + POSTs /api/produce
        return;
    }

    currentConfig = form.getConfig();
    if (!currentConfig) { alert('Please check your settings.'); return; }

    if (currentConfig.seed == null) {
        currentConfig.seed = (Math.random() * 0xFFFFFFFF) >>> 0;
    }

    showStep(3);
    resetGenerateUI();
    startWorker(currentConfig);
});

// Step 3 → 1: reset the wizard to the config form. The gen-done "Start over / Cancel" button is owned
// by account.js (its label + confirm depend on the ROM state); it triggers this via the onStartOver
// callback. The error panel's button resets directly (a generation error has no server-side run).
function doStartOver() {
    terminateWorker();
    currentBundle = null;
    showStep(1);
    setActiveTab('randomizer');
}
document.getElementById('btn-start-over-err').addEventListener('click', doStartOver);

// T-198 — Cancel while randomizing: stop the in-browser Worker and return to Review, where the user can
// tweak settings and regenerate. Nothing is persisted server-side during randomization, so no confirm
// dialog and no API call — just terminate and step back. (The ROM-build cancel is owned by account.js.)
function cancelGeneration() {
    terminateWorker();
    showStep(2);
}
document.getElementById('btn-cancel-gen')?.addEventListener('click', cancelGeneration);

// Sprite map (base64 data URIs) embedded into each doc so the output HTML is
// fully self-contained — no external CDN, no served images (T-001). Generated by
// `node build.js` into frontend/data/sprites.json; fetched once and cached as text
// so it can be inlined verbatim.
let _spriteMapPromise = null;
function loadSpriteMapText() {
    if (!_spriteMapPromise) {
        _spriteMapPromise = fetch('/data/sprites.json').then(r => {
            if (!r.ok) throw new Error('sprites.json not found — run `node build.js`');
            return r.text();
        });
    }
    return _spriteMapPromise;
}

// Static-asset map (fonts/logo/icons as base64 data URIs) embedded into each doc
// for full self-containment (T-004). Generated by `node build.js` into
// frontend/data/assets.json; fetched once and cached as text.
let _assetMapPromise = null;
function loadAssetMapText() {
    if (!_assetMapPromise) {
        _assetMapPromise = fetch('/data/assets.json').then(r => {
            if (!r.ok) throw new Error('assets.json not found — run `node build.js`');
            return r.text();
        });
    }
    return _assetMapPromise;
}

// Level-cap boss data (caps.c × boss↔flag SSOT) embedded into each doc to drive the
// Mail feature (T-007). Generated by `node build.js` into frontend/data/bosscaps.json.
let _bossCapsPromise = null;
function loadBossCapsText() {
    if (!_bossCapsPromise) {
        _bossCapsPromise = fetch('/data/bosscaps.json').then(r => {
            if (!r.ok) throw new Error('bosscaps.json not found — run `node build.js`');
            return r.text();
        });
    }
    return _bossCapsPromise;
}

// Poke fields the docs never render — dropped at injection time to keep the generated
// HTML small. `contextualRatings` alone is ~10 MB (~70% of the doc); the rest are
// internal pipeline data with zero references in template.html (T-004 analysis).
// T-111 — `contextualRatingsDoubles` is the same per-cap map for doubles: teambuilding
// input only, never rendered (the viewer uses poke.tierDoubles), so drop it too.
const DOC_OMIT_POKE_FIELDS = new Set([
    'contextualRatings', 'contextualRatingsDoubles', 'teachableLearnset', 'levelUpLearnset',
    'natDexNum', 'speciesName', 'catchRate', 'expYield',
]);

function slimPokes(pokes) {
    return pokes.map((p) => {
        const out = {};
        for (const k in p) if (!DOC_OMIT_POKE_FIELDS.has(k)) out[k] = p[k];
        return out;
    });
}

// T-005 — per-run localStorage namespace. Mirrors randomizer/writer.js docRunNamespace
// (canonical formula lives there). Baked into each generated doc so docs from different
// runs opened in the same browser/origin never share UI state.
function docRunNamespace(seed, playerIndex, romIndex) {
    const parts = [];
    if (seed !== undefined && seed !== null && String(seed) !== '') parts.push(`s${seed}`);
    if (playerIndex !== undefined && playerIndex !== null) parts.push(`p${playerIndex}`);
    if (romIndex !== undefined && romIndex !== null) parts.push(`r${romIndex}`);
    return parts.join('-').replace(/[^A-Za-z0-9_-]/g, '');
}

// Inline a ROM's data (+ the shared sprite map) into the template, producing a
// fully self-contained doc HTML. Single source for both download paths.
function buildDocHtml(template, rom, pokedex, spritesText, assetsText, seed, bossCapsText) {
    const assets = JSON.parse(assetsText);
    const runNs = docRunNamespace(seed, rom.playerIndex, rom.romIndex);
    return template
        .split('%%DOC_RUN_NS%%').join(runNs)

        .replace('<script src="sprites.js"></script>',
            `<script>const EMBEDDED_SPRITES = ${spritesText};</script>`)
        .replace('<script src="assets.js"></script>',
            `<script>const EMBEDDED_ASSETS = ${assetsText};</script>`)
        .replace('<script src="bosscaps.js"></script>',
            `<script>const bossCaps = ${bossCapsText || '[]'};</script>`)
        .split('__FONT_PRESS_START_2P__').join(assets['fonts/PressStart2P.woff2'] || '')
        .split('__FONT_VT323__').join(assets['fonts/VT323.woff2'] || '')
        // T-163 — inject the docs-visibility-redacted viewer copy (falls back to the full teams for
        // older bundles that predate viewerTrainers). The ROM keeps the full trainersResultsSimplified.
        .replace('<script src="trainers.js"></script>',
            `<script>const trainersData = ${JSON.stringify(rom.docs.viewerTrainers || rom.docs.trainersResultsSimplified)};</script>`)
        .replace('<script src="pokes.js"></script>',
            `<script>const pokes = ${JSON.stringify(slimPokes(pokedex.pokes))};</script>`)
        .replace('<script src="moves.js"></script>',
            `<script>const movesData = ${JSON.stringify(pokedex.moves)};</script>`)
        .replace('<script src="abilities.js"></script>',
            `<script>const abilitiesData = ${JSON.stringify(pokedex.abilities)};</script>`)
        // T-078 — item descriptions (name-keyed) for held-item / reward hover tooltips.
        .replace('<script src="items.js"></script>',
            `<script>const itemsData = ${JSON.stringify(pokedex.items || {})};</script>`)
        // T-201 — auto-nickname assignments so the viewer can show a captured mon's name (starters /
        // locations / trades) + the trade info (offered/wanted species) for the trade action. Naming is on
        // rom.artifacts by HTML-build time, so no generation reorder is needed.
        .replace('<script src="nicknames.js"></script>',
            `<script>const nicknamesData = ${JSON.stringify({
                starters: rom.artifacts.starterNaming || null,
                locations: rom.artifacts.locationNaming || null,
                trades: rom.artifacts.tradeNaming || null,
                tradesInfo: rom.artifacts.trades || null,
            })};</script>`)
        .replace('<script src="wildpokes.js"></script>',
            `<script>const wildPokes = ${JSON.stringify(rom.docs.wildPokes)};</script>`)
        // T-044 — move-chip type colours (SSOT: randomizer/trainerColors.js), derived by
        // writerDocs.js into rom.docs.typeColors. The Node path (writer.js) injects the same.
        .replace('<script src="colors.js"></script>',
            `<script>const typeColors = ${JSON.stringify(rom.docs.typeColors)};</script>`);
}

// T-210 — the decision log is no longer downloadable in the UI; it's submitted to the server (48h)
// for owner-only review via the /decision-log skill. See reportDiagnostics().

// T-211 — the full "apply patch & download" archive: bundle-<seed>.json + the applied ROMs, plus a
// docs/ folder and a bps/ folder. Default/nuzlocke keep those folders at the root; soul-link nests
// everything under one folder per player. `artifacts` are the server .bps entries (serverName)
// already applied to the user's ROM (gbaBytes); they're matched back to bundle roms by server name.
// It lives here (not account.js) because it reuses the docs-generation path; account.js invokes it
// through the buildFullZip callback passed to initAccount.
async function buildFullZipBlob(bundle, artifacts) {
    const seed = bundle.config?.seed ?? 'unknown';
    const [template, spritesText, assetsText, bossCapsText] = await Promise.all([
        fetch('/template.html').then(r => { if (!r.ok) throw new Error('Template not found'); return r.text(); }),
        loadSpriteMapText(), loadAssetMapText(), loadBossCapsText(),
    ]);
    const zip = new JSZip();
    zip.file(bundleFileName(seed), JSON.stringify(bundle, null, 2));
    for (const art of artifacts) {
        const rom = romForServerName(art.serverName, bundle.roms);
        if (!rom) continue;
        const { folder, base } = romName(rom, bundle.roms);
        const pokedex = resolveArtifact(rom.artifacts.pokedex, bundle.sharedData, 'pokedex');
        const html = buildDocHtml(template, rom, pokedex, spritesText, assetsText, seed, bossCapsText);
        const dir = folder ? `${folder}/` : '';
        zip.file(`${dir}${base}.gba`, art.gbaBytes);      // applied ROM at root / player folder
        zip.file(`${dir}docs/${base}.html`, html);        // docs/ folder (only in the full archive)
        zip.file(`${dir}bps/${base}.bps`, art.bpsBytes);  // bps/ folder
    }
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

// Download docs (ZIP: per-ROM docs HTML + the run bundle-<seed>.json)
document.getElementById('btn-download-docs').addEventListener('click', async () => {
    if (!currentBundle) return;

    const btn = document.getElementById('btn-download-docs');
    btn.disabled = true;
    btn.textContent = 'Building ZIP…';

    try {
        const template = await fetch('/template.html').then(r => {
            if (!r.ok) throw new Error('Template not found');
            return r.text();
        });
        const spritesText = await loadSpriteMapText();
        const assetsText = await loadAssetMapText();
        const bossCapsText = await loadBossCapsText();

        const seed = currentBundle.config?.seed ?? 'unknown';
        const zip = new JSZip();
        zip.file(bundleFileName(seed), JSON.stringify(currentBundle, null, 2));

        for (const rom of currentBundle.roms) {
            const pokedex = resolveArtifact(rom.artifacts.pokedex, currentBundle.sharedData, 'pokedex');
            const html = buildDocHtml(template, rom, pokedex, spritesText, assetsText, seed, bossCapsText);
            // T-211 — docs-only download: docs at the archive root (no `docs/` wrapper). Soul-link groups
            // them under one folder per player (player-1/player-1-rom-1.html).
            const { folder, base } = romName(rom, currentBundle.roms);
            zip.file(folder ? `${folder}/${base}.html` : `${base}.html`, html);
        }

        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `run-${seed}-docs.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    } catch (err) {
        alert(`ZIP generation failed: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = '⬇ Download docs';
    }
});

// Init
showStep(1);
// T-028/T-031/B-011: wire the account flow; on reload, restore a previously generated run from
// IndexedDB so it survives reloads and the email-verification round-trip. account.js calls this when
// an in-flight build exists OR a stored bundle is present; it asks us to switch to the Randomizer tab
// only for an in-flight build (otherwise the run just waits under Randomizer, shown when clicked).
initAccount({
    buildFullZip: buildFullZipBlob, // T-211 — full-archive builder (needs the docs path, which lives here)
    onRecover: async ({ switchTab = false } = {}) => {
        try {
            const b = await getStoredBundle();
            if (b) { currentBundle = b; currentConfig = b.config || currentConfig; }
        } catch { /* ignore */ }
        if (switchTab) setActiveTab('randomizer');
        showStep(3);
        document.getElementById('gen-running').style.display = 'none';
        document.getElementById('gen-error').style.display = 'none';
        document.getElementById('gen-done').style.display = '';
        renderRunDetails(currentConfig); // T-035: restore the "Run details" disclosure too
        // account.js fills the ROM checklist row + the title/meta + manages the Download buttons.
    },
    // T-035: account.js owns the gen-done "Start over / Cancel" button; this resets the wizard.
    onStartOver: doStartOver,
});

// T-048: Feedback section. Dependency-injected with account.js's auth state + API helper; the
// "Log in / Register" link (shown when logged out) reuses the nav's login flow.
initFeedback({
    getAuthState,
    onAuthChange,
    api,
    onRequestLogin: () => document.getElementById('nav-login')?.click(),
});

// T-192: Presets modal (My / Official / Community). Reuses account.js's auth state + API helper and
// the config form's get/apply so a chosen preset is applied exactly like Load. The synthetic Official
// "Balanced" card is derived live from DEFAULTS (the config SSOT), never stored server-side.
presetsCtl = initPresets({
    api,
    getAuthState,
    onAuthChange,
    getCurrentConfig: () => form.getConfig(),
    applyConfig: (cfg) => form.applyExternalConfig(cfg),
    onRequestLogin: () => document.getElementById('nav-login')?.click(),
    defaults: DEFAULTS,
    renderConfigDetail: (cfg) => reviewRowsHtml(cfg),
});

// "Save Preset" (next to Review) captures the current config and opens the modal in save mode.
document.getElementById('btn-save-preset')?.addEventListener('click', () => {
    const cfg = form.getConfig();
    if (!cfg) { alert('Please check your settings.'); return; }
    presetsCtl.openSave(cfg);
});

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
            reportDiagnostics(data); // T-075 — ship this run's warnings/errors to the server
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

// T-075 — report every completed generation's diagnostics to the server (48h store), so
// degraded outcomes (e.g. a trainer team of 5) are auditable off-line. Fire-and-forget:
// telemetry must never block, slow, or fail the generation UX. Sends even when there are
// zero events, to give the audit tool a denominator (how many runs had no warnings).
function reportDiagnostics(data) {
    try {
        const bundle = data.bundle || {};
        const cfg = bundle.config || {};
        api('/api/diagnostics', {
            method: 'POST',
            auth: true, // attaches the JWT if logged in; anonymous otherwise (optional auth)
            body: {
                runId: bundle.sessionId,
                generatedAt: Date.parse(bundle.generatedAt) || null,
                seed: cfg.seed != null ? String(cfg.seed) : null,
                runType: cfg.runType || null,
                formatVersion: bundle.formatVersion ?? null,
                appVersion: bundle.appVersion ?? null,   // T-190 — provenance (was never sent)
                counts: data.diagnosticsCounts || null,
                diagnostics: data.diagnostics || [],
            },
        }).catch(() => {});
        // T-210 — the team-building decision log is server-only (48h) for owner review via the
        // /decision-log skill; never shown to the user. Fire-and-forget, same trigger as diagnostics.
        if (data.teamAuditText) {
            api('/api/decision-log', {
                method: 'POST',
                auth: true,
                body: {
                    runId: bundle.sessionId,
                    generatedAt: Date.parse(bundle.generatedAt) || null,
                    seed: cfg.seed != null ? String(cfg.seed) : null,
                    runType: cfg.runType || null,
                    formatVersion: bundle.formatVersion ?? null,
                    appVersion: bundle.appVersion ?? null,
                    text: data.teamAuditText,
                },
            }).catch(() => {});
        }
    } catch { /* never let telemetry break generation */ }
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
    const numROMs = totalRoms(cfg); // single home for the ROM-count computation (config-form.js)

    document.getElementById('gen-done-meta').textContent =
        `Seed ${cfg.seed} · ${numROMs} ROM${numROMs !== 1 ? 's' : ''}`;

    renderRunDetails(cfg); // T-035: fill the "Run details" disclosure (account.js may refine the title/meta)

    // T-028: docs are ready (download button is always available); kick off the ROM build if the
    // user is eligible and let account.js drive the ROM checklist row + the Download ROM button.
    onBundleReady(currentBundle);
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

// Single source for the run summary (T-035): used by the step-2 Review and the step-3 "Run details"
// disclosure, so they never drift. Returns the rows HTML.
// T-213 — compact summaries for object-valued config so the run summary stays complete but tidy.
function fmtNicknames(n) {
    if (!n || !n.enabled) return 'Off';
    const parts = [];
    if (n.autoLocation) parts.push('by location');
    if (n.autoTradesGifts) parts.push('trades/gifts');
    if (n.includeStarter) parts.push('main starter');
    return parts.length ? `On — ${parts.join(', ')}` : 'On';
}
function fmtDocsVisibility(dv) {
    if (!dv || typeof dv !== 'object') return 'All shown';
    let hidden = 0;
    for (const [k, v] of Object.entries(dv)) {
        if (typeof v !== 'boolean') continue;
        if (k.startsWith('hide') ? v === true : v === false) hidden++;
    }
    return hidden === 0 ? 'All shown' : `${hidden} element${hidden === 1 ? '' : 's'} hidden`;
}
function fmtShopPrices(p) {
    if (!p) return 'Default';
    const tm = (p.tms && p.tms.avgDmg) ?? 2500;
    return `TMs from $${tm} · Ability Capsule $${p.abilityCapsule ?? 3000} / Patch $${p.abilityPatch ?? 5000}`;
}

function reviewRowsHtml(cfg) {
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
        rows.push(['Total ROMs', totalRoms(cfg)]);
        rows.push(['Players share', fmtShared(cfg.playerShared)]);
        rows.push(['ROM sharing', fmtShared(cfg.romShared)]);
    }

    // Battle format (T-085/ADR-014)
    let battleFmt = 'Singles';
    if (cfg.battleFormat === 'doubles') battleFmt = 'Doubles';
    else if (cfg.battleFormat === 'mixed') battleFmt = `Mixed — ${cfg.singlesPercent ?? 60}% singles${cfg.mixedSequentialSplit ? ' (sequential)' : ''}`;
    rows.push(['Battle format', battleFmt]);
    if ((cfg.battleFormat === 'doubles' || cfg.battleFormat === 'mixed') && cfg.leagueRunAndBun) {
        rows.push(['Elite Four', 'Run & Bun (pick singles/doubles in-game)']);
    }

    rows.push(['Difficulty',      String(cfg.difficulty)]);
    // T-186 — difficulty settings. Non-boss quality shows always (a headline knob, like Difficulty);
    // team size / level modifiers surface only when set away from their defaults, to keep the summary tidy.
    const nonBossQuality = cfg.nonBossQuality ?? -2;
    rows.push(['Non-boss quality', nonBossQuality === 0 ? 'Same as boss' : `${nonBossQuality} steps`]);
    const bossTeamSize = cfg.bossTeamSize ?? 6;
    const nonBossTeamSize = cfg.nonBossTeamSize ?? 6;
    if (bossTeamSize !== 6 || nonBossTeamSize !== 6) {
        rows.push(['Team size (boss / non-boss)', `${bossTeamSize} / ${nonBossTeamSize}`]);
    }
    const bossLevelModifier = cfg.bossLevelModifier ?? 0;
    const nonBossLevelModifier = cfg.nonBossLevelModifier ?? 0;
    if (bossLevelModifier !== 0 || nonBossLevelModifier !== 0) {
        const fmtMod = n => (n > 0 ? `+${n}` : String(n));
        rows.push(['Level modifier (boss / non-boss)', `${fmtMod(bossLevelModifier)} / ${fmtMod(nonBossLevelModifier)}`]);
    }
    rows.push(['Rebalance stats', cfg.rebalance ? 'Yes' : 'No']);
    if (cfg.rebalance) {
        rows.push(['Balance chance', Math.round(cfg.balanceChance * 100) + '%']);
        const cats = [];
        if (cfg.mutateStats !== false) cats.push('stats');
        if (cfg.mutateAbilities !== false) cats.push('abilities');
        if (cfg.mutateTypes !== false) cats.push('types');
        if (cfg.mutateLearnsets !== false) cats.push('learnsets');
        rows.push(['Mutate', cats.length ? cats.join(', ') : 'none']);
    }
    // T-187 — move mutation (per-category chances are summarised by this headline row).
    if (cfg.mutateMoves) {
        const mm = [];
        if (cfg.mutatePower) mm.push('power');
        if (cfg.mutateAccuracy) mm.push('accuracy');
        if (cfg.mutateType) mm.push('type');
        if (cfg.mutateCategory) mm.push('category');
        rows.push(['Move mutation', `${Math.round((cfg.moveMutationChance ?? 0.1) * 100)}% — ${mm.length ? mm.join(', ') : 'none'}`]);
    } else {
        rows.push(['Move mutation', 'Off']);
    }

    // T-052 — new option summaries (shared by the Review step and the Run-details disclosure).
    const fmtTypes = arr => (arr || []).map(t => t === 'RANDOM' ? 'Random' : t[0] + t.slice(1).toLowerCase()).join(' / ');
    rows.push(['Gym / E4 types changed', `${cfg.gymsTypeChanged ?? 2} / ${cfg.e4TypeChanged ?? 2}`]);
    rows.push(['Champion type-change chance', `${Math.round((cfg.championTypeChangeChance ?? 0.05) * 100)}%`]);
    if (cfg.aquaTypes) rows.push(['Team Aqua', fmtTypes(cfg.aquaTypes)]);
    if (cfg.magmaTypes) rows.push(['Team Magma', fmtTypes(cfg.magmaTypes)]);
    // T-162 — wild encounters.
    rows.push(['Wild encounters', cfg.wildEncounterType === 'classic'
        ? `Classic (${cfg.pokemonPerZone ?? 5} per zone)`
        : 'Deterministic (1 per zone)']);
    rows.push(['Evolution levels', cfg.evoLevels && cfg.evoLevels.enabled === false ? 'Base game' : 'Adjusted']);
    const money = cfg.money || {};
    rows.push(['Reward money', `$${money.normal ?? 250} / $${money.boss ?? 3000} / $${money.gym ?? 5000}`]);
    rows.push(['Extra starters', String((cfg.extraStarters || []).length)]);
    rows.push(['Main starter quality', String(cfg.starterQuality ?? 'UU')]);
    // T-073 shop prices + T-167 relearn price.
    rows.push(['Shop prices', fmtShopPrices(cfg.prices)]);
    rows.push(['Move relearn price', `$${cfg.moveRelearnPrice ?? 250}`]);
    // T-165 Steven tag, nicknames (T-068/T-070/T-200), docs visibility (T-163), universe seed (T-189).
    rows.push(['Steven tag battle', cfg.disableStevenTagBattle ? 'Disabled (solo Tabitha)' : 'Enabled']);
    rows.push(['Auto-nicknames', fmtNicknames(cfg.nicknames)]);
    rows.push(['Docs visibility', fmtDocsVisibility(cfg.docsVisibility)]);
    rows.push(['Universe seed', cfg.universeSeed != null ? String(cfg.universeSeed) : '(derived from seed)']);

    rows.push(['Seed', cfg.seed != null ? cfg.seed : '(random — assigned on Generate)']);

    return rows.map(([k, v]) => `
        <div class="summary-row">
            <span class="summary-key">${k}</span>
            <span class="summary-val">${v}</span>
        </div>
    `).join('');
}

function renderReview(cfg, regenerate = false) {
    let html = '';
    if (regenerate && currentBundle) {
        const b = currentBundle;
        const when = b.generatedAt ? new Date(b.generatedAt).toLocaleString() : 'unknown';
        html += '<div class="regen-review-note">Regenerate from bundle — these ROMs will be rebuilt '
            + 'exactly as generated, with <strong>no re-randomization</strong>.</div>';
        const prov = [
            ['Bundle generated', when],
            ['Made with app version', b.appVersion || 'unknown'],
            ['ROMs in bundle', (b.roms || []).length],
        ];
        html += prov.map(([k, v]) => `
        <div class="summary-row">
            <span class="summary-key">${k}</span>
            <span class="summary-val">${v}</span>
        </div>`).join('');
    }
    html += reviewRowsHtml(cfg);
    document.getElementById('review-rows').innerHTML = html;
    // T-190 — the Generate button doubles as the regenerate trigger; relabel it per mode.
    const gen = document.getElementById('btn-generate');
    if (gen) gen.textContent = regenerate ? 'Regenerate from bundle' : 'Generate';
}

// Mirror the same summary into the step-3 "Run details" disclosure (shared render, no duplication).
function renderRunDetails(cfg) {
    const el = document.getElementById('run-details-rows');
    if (el && cfg) el.innerHTML = reviewRowsHtml(cfg);
}
