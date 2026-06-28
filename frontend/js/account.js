// T-028 — account + ROM-delivery flow (talks to the T-021/T-022/T-025 backend).
// Docs stay anonymous; ROM generation needs a verified account + a validated ROM.
// The bundle lives in IndexedDB (a ~32 MB bundle does not fit in localStorage).

const TOKEN_KEY = 'ec_jwt';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const $ = (id) => document.getElementById(id);

async function api(path, { method = 'GET', body = null, auth = false } = {}) {
  const headers = {};
  if (body != null) headers['content-type'] = 'application/json';
  if (auth && getToken()) headers.authorization = `Bearer ${getToken()}`;
  const res = await fetch(path, { method, headers, body: body != null ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  return { ok: res.ok, status: res.status, data };
}

// ── IndexedDB (bundle is too big for localStorage) ──────────────────────────────
function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('emeraldcut', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, val) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(key) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readonly');
    const r = tx.objectStore('kv').get(key);
    r.onsuccess = () => resolve(r.result ?? null);
    r.onerror = () => reject(r.error);
  });
}
export async function getStoredBundle() { try { return await idbGet('bundle'); } catch { return null; } }

// ── account state ────────────────────────────────────────────────────────────────
let state = null;        // /api/me
let lastBundle = null;
let pollTimer = null;

// delivery / ROM-status state
let emailOptedIn = false; // opted in to the "ready" email for the current request
let delivered = false;    // ROM downloaded this session — don't auto-start another build
let lastCategory = null;  // last rendered ROM-row category — avoid rebuilding the building view each poll
let lastQueuedLine = null;// last queued message — avoid resetting the email checkbox each poll
let buildStartMs = null;  // when the build entered the "building" view (drives the synthetic bar)
let buildEtaSec = null;   // ETA (s) captured at building start — the bar advances against it
let buildBarTimer = null;

async function refreshMe() {
  if (!getToken()) { state = null; return null; }
  const { ok, data } = await api('/api/me', { auth: true });
  state = ok ? data : null;
  if (!ok) clearToken();
  return state;
}

// ── modal ──────────────────────────────────────────────────────────────────────
function openModal() { $('auth-modal').hidden = false; renderModal(); }
function closeModal() { $('auth-modal').hidden = true; }
function setMsg(m, kind = '') { const el = $('auth-msg'); el.textContent = m || ''; el.className = `auth-msg ${kind}`; }
function updateAccountBtn() { $('account-btn').textContent = state ? state.email.split('@')[0] : 'Log in'; }

function renderModal() {
  const loggedIn = !!state;
  $('auth-tabs').hidden = loggedIn;
  document.querySelectorAll('[data-auth-panel]').forEach((el) => { el.hidden = loggedIn; });
  const acct = $('auth-account');
  acct.hidden = !loggedIn;
  if (!loggedIn) return;
  acct.innerHTML = `
    <p>Signed in as <strong>${state.email}</strong></p>
    <p>Email verified: <strong>${state.verified ? 'yes ✓' : 'no — open the link we emailed you'}</strong></p>
    <p>ROM ownership: <strong>${state.ownsValidRom ? 'verified ✓' : 'not yet'}</strong></p>
    ${state.ownsValidRom ? '' : `<label class="btn btn-primary">Upload your Emerald ROM
        <input type="file" id="rom-file" accept=".gba,application/octet-stream" hidden></label>`}
    <button class="btn btn-ghost" id="logout-btn">Log out</button>`;
  if (!state.ownsValidRom) $('rom-file').addEventListener('change', onRomUpload);
  $('logout-btn').addEventListener('click', () => {
    clearToken(); state = null; updateAccountBtn(); renderModal(); reevaluateDelivery();
  });
}

async function onRomUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  setMsg('Validating your ROM…');
  const buf = await file.arrayBuffer();
  const res = await fetch('/api/rom/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/octet-stream', authorization: `Bearer ${getToken()}` },
    body: buf,
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok) { setMsg('ROM verified ✓', 'ok'); await refreshMe(); renderModal(); reevaluateDelivery(); }
  else setMsg(data.error || 'That file is not a recognized Pokémon Emerald ROM.', 'err');
}

async function doRegister(email, password) {
  const { ok, data } = await api('/api/register', { method: 'POST', body: { email, password } });
  setMsg(ok ? 'Registered — open the verification link we emailed, then log in.' : (data?.error || 'Registration failed'), ok ? 'ok' : 'err');
}
async function doLogin(email, password) {
  const { ok, data } = await api('/api/login', { method: 'POST', body: { email, password } });
  if (ok && data.token) { setToken(data.token); await refreshMe(); updateAccountBtn(); renderModal(); setMsg('Logged in ✓', 'ok'); reevaluateDelivery(); }
  else setMsg(data?.error || 'Login failed', 'err');
}
async function doForgot(email) {
  await api('/api/forgot', { method: 'POST', body: { email } });
  setMsg('If that email is registered, a reset link is on its way.', 'ok');
}

// ── delivery flow ────────────────────────────────────────────────────────────────
// The "Generation complete" screen shows a 2-step checklist: Documentation (always ready, built in
// the browser) and the server-built ROM. This module owns the ROM row (#rom-status) and the unified
// "Download ROM" button (#btn-download-rom) in the actions row.
const romRow = () => $('rom-status');

function setRomRow(cat, bodyHtml, ico) {
  const el = romRow();
  if (!el) return;
  el.className = `status-item ${cat}`;
  el.innerHTML = `<span class="status-ico" aria-hidden="true">${ico}</span><div class="status-body">${bodyHtml}</div>`;
}

// How many ROMs this run produces (from the active request, or the stored bundle as a fallback).
function romCount() {
  return state?.activeRequest?.romsTotal ?? lastBundle?.roms?.length ?? 1;
}

// Enable/disable the actions-row "Download ROM(s)" button + its single-use note. `reason` is the
// tooltip shown while disabled, so it always states the real reason (not ready / failed / downloaded…).
function setRomDownload({ enabled, count = romCount(), note = false, reason = "Your ROM isn't ready yet." }) {
  const btn = $('btn-download-rom');
  if (btn) {
    btn.disabled = !enabled;
    btn.title = enabled ? '' : reason;
    btn.textContent = count > 1 ? '⬇ Download ROMs' : '⬇ Download ROM';
  }
  const noteEl = $('rom-dl-note');
  if (noteEl) noteEl.hidden = !note;
}

// Keep the screen's title + one-line summary honest about what is actually ready. Docs are always
// ready on this screen; only when the ROM is ready too does it become "Your run is ready".
function setHeadline(cat) {
  const n = romCount();
  const roms = `${n} ROM${n === 1 ? '' : 's'}`;
  const seed = lastBundle?.config?.seed;
  const STATUS = {
    ready: 'everything is ready to download',
    building: 'your ROM is building below',
    queued: 'your ROM is queued below',
    failed: 'the ROM build failed — see below',
    downloaded: 'your ROM has been downloaded',
    gating: 'sign in to also build a ROM',
  };
  const titleEl = $('gen-done-title');
  const metaEl = $('gen-done-meta');
  if (titleEl) titleEl.textContent = cat === 'ready' ? 'Your run is ready' : 'Your documentation is ready';
  if (metaEl) {
    const status = STATUS[cat] || '';
    metaEl.textContent = `${seed != null ? `Seed ${seed} · ` : ''}${roms}${status ? ` · ${status}` : ''}`;
  }
}

function clearBuildBar() {
  if (buildBarTimer) { clearInterval(buildBarTimer); buildBarTimer = null; }
  buildStartMs = null; buildEtaSec = null;
}

const GEAR_ICO = '<img src="/assets/generating.png" alt="" class="px-icon spin">';

export async function onBundleReady(bundle) {
  lastBundle = bundle;
  emailOptedIn = false;
  delivered = false;
  lastCategory = null;
  lastQueuedLine = null;
  clearBuildBar();
  try { await idbSet('bundle', bundle); } catch { /* storage full / private mode */ }
  await refreshMe();
  reevaluateDelivery();
}

async function reevaluateDelivery() {
  if (!romRow()) return;
  lastCategory = null; // any path below either re-renders via renderRom or sets the row directly

  if (!state) {
    setHeadline('gating');
    setRomDownload({ enabled: false, reason: 'Log in and verify your Emerald to build a ROM.' });
    setRomRow('todo',
      `<div class="status-title">Randomized ROM</div>
       <div class="status-sub">Log in and verify your Emerald to build one — your docs are ready regardless.</div>
       <button class="btn btn-primary btn-sm" id="rom-cta">Log in / Register</button>`, '🔒');
    $('rom-cta')?.addEventListener('click', openModal);
    return;
  }
  if (!state.verified) {
    setHeadline('gating');
    setRomDownload({ enabled: false, reason: 'Verify your email to build your ROM.' });
    setRomRow('todo',
      `<div class="status-title">Verify your email</div>
       <div class="status-sub">Open the link we emailed you — then your ROM build starts automatically.</div>`, '✉');
    return;
  }
  if (!state.ownsValidRom) {
    setHeadline('gating');
    setRomDownload({ enabled: false, reason: 'Verify your Emerald to build your ROM.' });
    setRomRow('todo',
      `<div class="status-title">Verify your Emerald</div>
       <div class="status-sub">Upload your Emerald ROM to prove ownership — then your build starts.</div>
       <button class="btn btn-primary btn-sm" id="rom-cta">Upload ROM</button>`, '🔒');
    $('rom-cta')?.addEventListener('click', openModal);
    return;
  }

  if (state.activeRequest) { renderRom(state.activeRequest); startPolling(); return; }

  if (delivered) {
    setHeadline('downloaded');
    setRomDownload({ enabled: false, reason: 'Already downloaded — removed from the server. Start a new run to build another.' });
    setRomRow('done',
      `<div class="status-title">ROM downloaded</div>
       <div class="status-sub">Removed from the server. Start a new run to build another.</div>`, '✓');
    return;
  }

  if (lastBundle) {
    setHeadline('building');
    setRomDownload({ enabled: false, reason: 'Starting your build…' });
    setRomRow('building', `<div class="status-title">Starting your ROM build…</div>`, GEAR_ICO);
    const { ok, data } = await api('/api/produce', { method: 'POST', body: lastBundle, auth: true });
    if (ok) { await refreshMe(); lastCategory = null; renderRom(state.activeRequest, data); startPolling(); }
    else setRomRow('failed',
      `<div class="status-title">Could not start the build</div>
       <div class="status-sub">${data?.error || 'Please try again.'}</div>`, '✕');
  }
}

// Map the raw request state to a UI category. A request with any ROM done is "in progress" even
// while briefly re-queued/paused between ROMs, so the building view stays stable (no flicker).
function categoryOf(req) {
  if (req.state === 'ready') return 'ready';
  if (req.state === 'failed') return 'failed';
  if (req.state === 'building') return 'building';
  if ((req.romsDone ?? 0) > 0) return 'building';
  return 'queued';
}

function renderRom(req, info = {}) {
  if (!req || !romRow()) return;
  const cat = categoryOf(req);
  const count = req.romsTotal ?? romCount();
  setHeadline(cat);

  if (cat === 'ready') {
    clearBuildBar(); lastCategory = 'ready';
    setRomRow('done',
      `<div class="status-title">Your ROM is ready</div>
       <div class="status-sub">Download it below.</div>`, '✓');
    setRomDownload({ enabled: true, count, note: true });
    return;
  }

  if (cat === 'failed') {
    clearBuildBar(); lastCategory = 'failed';
    setRomDownload({ enabled: false, count, reason: 'The build failed — start over to try again.' });
    setRomRow('failed',
      `<div class="status-title">Build failed</div>
       <div class="status-sub">Something went wrong building your ROM. Please start over and try again.</div>`, '✕');
    return;
  }

  if (cat === 'building') {
    setRomDownload({ enabled: false, count });
    const total = req.romsTotal ?? 1;
    const current = Math.min((req.romsDone ?? 0) + 1, total);
    if (lastCategory !== 'building') {
      lastCategory = 'building';
      buildStartMs = Date.now();
      buildEtaSec = (info.eta != null && info.eta > 0) ? info.eta : 120;
      setRomRow('building',
        `<div class="status-title">Building your ROM…</div>
         ${total > 1 ? `<div class="status-sub" id="rom-counter">ROM ${current} of ${total}</div>` : ''}
         <div class="gen-progress-wrap compact"><div class="gen-progress-bar"><div class="gen-progress-fill" id="rom-progress-fill"></div></div></div>
         <div class="status-sub muted">This usually takes a few minutes — you can leave this page open.</div>`,
        GEAR_ICO);
      startBuildBar();
    } else if (total > 1) {
      const c = $('rom-counter'); if (c) c.textContent = `ROM ${current} of ${total}`;
    }
    return;
  }

  // queued — clean, no gear/bar; show position + ETA, email opt-in, and the docs-meanwhile hint.
  clearBuildBar();
  setRomDownload({ enabled: false, count });
  const etaTxt = info.eta != null ? `ETA ~${Math.max(1, Math.round(info.eta / 60))} min` : '';
  const ahead = info.romsAhead;
  let line;
  if (ahead == null) line = `Your ROM is queued.${etaTxt ? ` (${etaTxt})` : ''}`;
  else if (ahead <= 0) line = `You're next in line.${etaTxt ? ` ${etaTxt}.` : ''}`;
  else line = `There ${ahead === 1 ? 'is' : 'are'} ${ahead} ROM${ahead === 1 ? '' : 's'} before yours${etaTxt ? ` (${etaTxt})` : ''}.`;

  // avoid rebuilding (and resetting the email checkbox) when nothing visible changed
  if (lastCategory === 'queued' && lastQueuedLine === line + emailOptedIn) return;
  lastCategory = 'queued'; lastQueuedLine = line + emailOptedIn;

  const emailBit = emailOptedIn
    ? `<div class="status-sub muted">✓ We'll email you when it's ready.</div>`
    : `<label class="status-check"><input type="checkbox" id="notify-email"> Email me when it's ready</label>`;
  setRomRow('queued',
    `<div class="status-title">ROM queued</div>
     <div class="status-sub">${line}</div>
     <div class="status-sub muted">Download your docs meanwhile — this page updates automatically.</div>
     ${emailBit}`, '🕒');
  if (!emailOptedIn) {
    $('notify-email')?.addEventListener('change', async (e) => {
      if (!e.target.checked) return;
      const { ok } = await api('/api/notify-on-ready', { method: 'POST', auth: true });
      if (ok) { emailOptedIn = true; lastQueuedLine = null; renderRom(req, info); }
    });
  }
}

function startBuildBar() {
  if (buildBarTimer) clearInterval(buildBarTimer);
  const tick = () => {
    const fill = $('rom-progress-fill');
    if (!fill) return;
    const elapsed = (Date.now() - (buildStartMs ?? Date.now())) / 1000;
    const pct = Math.min(95, Math.round((elapsed / (buildEtaSec || 120)) * 100));
    fill.style.width = `${pct}%`;
  };
  tick();
  buildBarTimer = setInterval(tick, 500);
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(async () => {
    const { ok, status, data } = await api('/api/status', { auth: true });
    if (!ok) {
      stopPolling();
      // 404 mid-build = the request left the active set (failed/expired) before reaching "ready".
      if (status === 404 && lastCategory !== 'ready' && !delivered) { lastCategory = null; renderRom({ state: 'failed' }); }
      return;
    }
    renderRom(
      { state: data.state, romsDone: data.romsDone, romsTotal: data.romsTotal },
      { eta: data.eta, romsAhead: data.romsAhead },
    );
    if (data.state === 'ready') stopPolling();
  }, 3000);
}
function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

async function downloadRom() {
  const btn = $('btn-download-rom');
  if (btn?.disabled) return;
  const res = await fetch('/api/download', { headers: { authorization: `Bearer ${getToken()}` } });
  if (!res.ok) { alert('Download failed — try again.'); return; }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'emerald-cut-roms.zip';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  delivered = true;         // a successful download purges the request server-side — don't re-build
  await refreshMe();
  reevaluateDelivery();
}

export async function initAccount(opts = {}) {
  $('account-btn').addEventListener('click', openModal);
  $('auth-close').addEventListener('click', closeModal);
  $('auth-modal').addEventListener('click', (e) => { if (e.target.id === 'auth-modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('auth-modal').hidden) closeModal(); });

  document.querySelectorAll('.auth-tab').forEach((t) => t.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((x) => x.classList.toggle('active', x === t));
    document.querySelectorAll('[data-auth-panel]').forEach((p) => { p.hidden = p.dataset.authPanel !== t.dataset.authTab; });
    setMsg('');
  }));
  $('auth-form-login').addEventListener('submit', (e) => { e.preventDefault(); doLogin($('login-email').value, $('login-password').value); });
  $('auth-form-register').addEventListener('submit', (e) => { e.preventDefault(); doRegister($('reg-email').value, $('reg-password').value); });
  $('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    const em = $('login-email').value;
    if (!em) return setMsg('Enter your email above first.', 'err');
    doForgot(em);
  });

  // the unified actions-row "Download ROM" button; renderRom enables it once the ROM is ready
  $('btn-download-rom')?.addEventListener('click', downloadRom);

  await refreshMe();
  updateAccountBtn();
  // reload recovery: surface an in-flight build (and the ready ROM download) without re-generating.
  // onRecover (app.js) makes the generation screen visible (jump to step 3) so the ROM row isn't hidden.
  if (state?.activeRequest) {
    try { await opts.onRecover?.(); } catch { /* ignore */ }
    renderRom(state.activeRequest);
    startPolling();
  }
}
