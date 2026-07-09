// T-028 — account + ROM-delivery flow. T-053, ADR-013: the server delivers a BPS patch; the browser
// applies it to the user's ROM (held in IndexedDB, never uploaded). Generation is DECOUPLED from ROM
// ownership — you can build & download the patch before providing a ROM.
// The bundle lives in IndexedDB (a ~32 MB bundle does not fit in localStorage).

import { putRom, getRom, hasRom, clearRom, sha1Hex, isKnownEmeraldRom } from './rom-store.js';

// applyBps comes from the generated ESM bundle (frontend/js/bps.bundle.js — the SAME codec the builder
// uses to create patches). Loaded lazily and injectable so tests need not build the bundle.
let loadCodec = () => import('./bps.bundle.js').then((m) => (m.applyBps ? m : m.default));

const TOKEN_KEY = 'ec_jwt';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const $ = (id) => document.getElementById(id);

export async function api(path, { method = 'GET', body = null, auth = false } = {}) {
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
async function idbDel(key) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function getStoredBundle() { try { return await idbGet('bundle'); } catch { return null; } }

// "Already downloaded" must survive a reload (B-011): otherwise restoring a stored bundle would
// auto-start a fresh build of an already-delivered run on every reload. Keyed by bundle identity.
const deliveredKey = (b) => `ec_delivered_${b?.sessionId ?? b?.config?.seed ?? ''}`;
function markDelivered(b) { try { localStorage.setItem(deliveredKey(b), '1'); } catch { /* ignore */ } }
function isDelivered(b) { try { return localStorage.getItem(deliveredKey(b)) === '1'; } catch { return false; } }

// ── account state ────────────────────────────────────────────────────────────────
let state = null;        // /api/me
let lastBundle = null;
let pollTimer = null;

// Auth-state subscription (T-048): other modules (e.g. feedback.js) react to login/logout without
// importing account internals. Listeners fire from updateNavAccount(), which runs on every transition.
const authListeners = [];
export function getAuthState() { return state; }
export function onAuthChange(fn) { if (typeof fn === 'function') authListeners.push(fn); }
function emitAuthChange() { for (const fn of authListeners) { try { fn(state); } catch { /* isolate */ } } }

// delivery / ROM-status state
let emailOptedIn = false; // opted in to the "ready" email for the current request
let delivered = false;    // ROM downloaded this session — don't auto-start another build
let lastCategory = null;  // last rendered ROM-row category — avoid rebuilding the building view each poll
let lastQueuedLine = null;// last queued message — avoid resetting the email checkbox each poll

async function refreshMe() {
  if (!getToken()) { state = null; return null; }
  const { ok, data } = await api('/api/me', { auth: true });
  state = ok ? data : null;
  if (!ok) clearToken();
  return state;
}

// ── browser tab title (T-034) ────────────────────────────────────────────────────
const DEFAULT_TITLE = 'Pokémon Emerald Cut';
// A long build / queue is easy to miss on a background tab, so surface progress in document.title.
function setTabTitle(prefix) { document.title = prefix ? `${prefix} · ${DEFAULT_TITLE}` : DEFAULT_TITLE; }

// ── auth modal (login / register only — T-034) ────────────────────────────────────
// The modal opens only when the app needs auth (the nav "Log in" link or a gated CTA), never from a
// profile click. Account status + ROM upload live on the Settings page, not here.
function openModal() { if (state) return; $('auth-modal').hidden = false; setMsg(''); }
function closeModal() { $('auth-modal').hidden = true; }
function setMsg(m, kind = '') { const el = $('auth-msg'); el.textContent = m || ''; el.className = `auth-msg ${kind}`; }
function setSettingsMsg(m, kind = '') { const el = $('settings-msg'); if (el) { el.textContent = m || ''; el.className = `settings-note ${kind}`; } }
function goToSettings() { document.querySelector('.topnav-tab[data-tab="settings"]')?.click(); }

function logout() {
  clearToken(); state = null;
  closeModal();
  updateNavAccount();
  reevaluateDelivery();
}

// Render the nav-right identity area + the Settings page from the current auth state.
function updateNavAccount() {
  const nav = $('nav-account');
  if (nav) {
    nav.innerHTML = state
      ? `<span class="nav-account-id">Logged in as <strong>${state.email}</strong></span> <a href="#" id="nav-logout">log out</a>`
      : `<a href="#" id="nav-login" class="nav-account-login">Log in</a>`;
    $('nav-login')?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    $('nav-logout')?.addEventListener('click', (e) => { e.preventDefault(); logout(); });
  }
  renderSettings();
  emitAuthChange(); // notify subscribers (feedback.js) of the current auth state (T-048)
}

function renderSettings() {
  const el = $('settings-content');
  if (!el) return;
  if (!state) {
    el.innerHTML = `
      <p class="settings-note">Log in to manage your account and build ROMs. Generating documentation never needs an account — it's free and anonymous.</p>
      <button class="btn btn-primary" id="settings-login">Log in / Register</button>`;
    $('settings-login')?.addEventListener('click', openModal);
    return;
  }
  el.innerHTML = `
    <div class="settings-rows">
      <div class="settings-row"><span class="settings-key">Account</span><span class="settings-val">${state.email}</span></div>
      <div class="settings-row"><span class="settings-key">Email verified</span><span class="settings-val ${state.verified ? 'ok' : ''}">${state.verified ? 'Yes ✓' : 'No — open the link we emailed you'}</span></div>
      <div class="settings-row"><span class="settings-key">Your Emerald ROM</span><span class="settings-val" id="settings-rom-state">Checking…</span></div>
    </div>
    <div id="settings-rom-actions"></div>
    <p class="settings-note" id="settings-msg"></p>
    <button class="btn btn-ghost" id="settings-logout">Log out</button>
    <div class="settings-danger">
      <div class="settings-danger-label">Danger zone</div>
      <button class="btn btn-danger" id="settings-delete">Delete account permanently</button>
    </div>`;
  $('settings-logout')?.addEventListener('click', logout);
  $('settings-delete')?.addEventListener('click', deleteAccount);
  // T-080: ROM presence is a local, frontend-only fact — the row + upload affordance reflect the
  // IndexedDB store (hasRom), not any server flag. Async, so it fills the row after render.
  hydrateSettingsRom();
}

// T-080 — render the Settings "Your Emerald ROM" row + add/replace controls from the LOCAL store.
// The ROM never leaves the browser; that is stated wherever it can be added.
async function hydrateSettingsRom() {
  const present = await hasRom().catch(() => false);
  const stateEl = $('settings-rom-state');
  const actionsEl = $('settings-rom-actions');
  if (!stateEl || !actionsEl) return; // settings re-rendered / navigated away while awaiting
  if (present) {
    stateEl.textContent = 'Saved in your browser ✓';
    stateEl.className = 'settings-val ok';
    actionsEl.innerHTML = `
      <label class="btn btn-ghost settings-upload">Replace ROM
        <input type="file" id="rom-file" accept=".gba,application/octet-stream" hidden></label>
      <button class="btn btn-ghost btn-sm" id="rom-forget">Remove from this browser</button>
      <p class="settings-note">Your ROM stays on this device — it is never uploaded.</p>`;
    $('rom-forget')?.addEventListener('click', async () => { await clearRom(); renderSettings(); reevaluateDelivery(); });
  } else {
    stateEl.textContent = 'Not added yet';
    stateEl.className = 'settings-val';
    actionsEl.innerHTML = `
      <label class="btn btn-primary settings-upload">Add your Emerald ROM
        <input type="file" id="rom-file" accept=".gba,application/octet-stream" hidden></label>
      <p class="settings-note">Only needed to build a playable ROM. It stays in your browser — never uploaded.</p>`;
  }
  $('rom-file')?.addEventListener('change', onRomUpload);
}

async function deleteAccount() {
  if (!confirm('Delete your account permanently?\n\nThis action is irreversible — your account and any in-flight run will be removed.')) return;
  const { ok } = await api('/api/account', { method: 'DELETE', auth: true });
  if (!ok) { setSettingsMsg('Could not delete the account — please try again.', 'err'); return; }
  await clearRun();
  logout();
  alert('Your account has been deleted.');
}

// T-080, ADR-013: hash the ROM and validate it ENTIRELY in the browser against the known Emerald
// dumps — the bytes (and even the hash) never leave the machine. Only a valid ROM is stored; the
// bytes are reused to apply the BPS patch at download time.
async function onRomUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  setSettingsMsg('Checking your ROM…');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sha1 = await sha1Hex(bytes);
  if (!isKnownEmeraldRom(sha1)) {
    setSettingsMsg('That file is not a recognized Pokémon Emerald ROM.', 'err');
    return; // nothing stored — never leaves the browser either way
  }
  await putRom(bytes); // saved locally; never uploaded
  renderSettings();    // re-render → "Saved in your browser ✓"
  setSettingsMsg('ROM saved in your browser ✓ — it never leaves your device.', 'ok');
  reevaluateDelivery();
}

async function doRegister(email, password) {
  const { ok, data } = await api('/api/register', { method: 'POST', body: { email, password } });
  setMsg(ok ? 'Registered — open the verification link we emailed, then log in.' : (data?.error || 'Registration failed'), ok ? 'ok' : 'err');
}
async function doLogin(email, password) {
  const { ok, data } = await api('/api/login', { method: 'POST', body: { email, password } });
  if (ok && data.token) { setToken(data.token); await refreshMe(); updateNavAccount(); closeModal(); reevaluateDelivery(); }
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

// T-079 — the action button is patch-first and never says "download a ROM": you download the patch
// and it is applied to YOUR ROM locally. Singular/plural by how many ROMs this run produces.
// Exported for unit testing.
export function dlLabel(count) {
  return count > 1 ? '⬇ Download patches & apply to my ROMs' : '⬇ Download patch & apply to my ROM';
}

// Enable/disable the actions-row delivery button + its note. `reason` is the tooltip shown while
// disabled, so it always states the real reason (not ready / failed / downloaded…).
function setRomDownload({ enabled, count = romCount(), note = false, reason = "Your ROM isn't ready yet.", label = null }) {
  const btn = $('btn-download-rom');
  if (btn) {
    btn.classList.remove('is-working');   // clear any in-flight download indicator
    btn.disabled = !enabled;
    btn.title = enabled ? '' : reason;
    btn.textContent = label || dlLabel(count);
  }
  const noteEl = $('rom-dl-note');
  if (noteEl) noteEl.hidden = !note;
}

// T-079 — the live delivery checklist under the button. Steps: download patch(es) → apply to my
// ROM(s) → (multi-ROM only) generate zip. Returns an update fn (key, 'active'|'done'); a no-op when
// the element is absent. `clearDlSteps` hides + empties it between states.
function startDlSteps(count) {
  const el = $('dl-steps');
  if (!el) return () => {};
  const plural = count > 1;
  const steps = [
    ['download', plural ? 'Downloading patches' : 'Downloading patch'],
    ['apply',    plural ? 'Applying patches to my ROMs' : 'Applying patch to my ROM'],
  ];
  if (plural) steps.push(['zip', 'Generating zip']);
  el.hidden = false;
  el.innerHTML = steps
    .map(([k, label]) => `<li class="dl-step" id="dl-step-${k}" data-state="pending"><span class="dl-step-ico" aria-hidden="true"></span><span>${label}</span></li>`)
    .join('');
  return (key, stateVal) => { const li = $(`dl-step-${key}`); if (li) li.dataset.state = stateVal; };
}
function clearDlSteps() { const el = $('dl-steps'); if (el) { el.hidden = true; el.innerHTML = ''; } }

// Keep the screen's title + one-line summary honest about what is actually ready. Docs are always
// ready on this screen; only when the ROM is ready too does it become "Your run is ready".
function setHeadline(cat) {
  const n = romCount();
  const roms = `${n} ROM${n === 1 ? '' : 's'}`;
  const seed = lastBundle?.config?.seed;
  const STATUS = {
    ready: 'everything is ready to download',
    building: 'your run is building below',
    queued: 'your run is queued below',
    failed: 'the build failed — see below',
    downloaded: n > 1 ? 'patches applied to your ROMs' : 'patch applied to your ROM',
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

// Build progress + ETA are now server-authoritative (B-013) — no client-side timer to clear.
function etaText(secs) {
  if (secs == null) return 'Estimating…';
  if (secs >= 60) return `About ${Math.round(secs / 60)} min remaining`;
  if (secs > 5) return 'Less than a minute remaining';
  return 'Finishing up…';
}

// The gen-done bottom button (T-035): "Cancel" (+ confirm) before/while the ROM is being made;
// "Start over" only once delivered; while the ROM is ready-but-undownloaded it's a disabled
// "Start over" nudging the download. `dataset.mode` is read by the click handler wired in initAccount.
function setStartOverBtn(cat) {
  const btn = $('btn-start-over');
  if (!btn) return;
  btn.disabled = false; // T-053: never blocked — you can start over even with a downloadable patch
  btn.title = '';
  if (cat === 'ready' || cat === 'downloaded') {
    // A generated patch exists (re-downloadable server-side). Start over discards it — always allowed,
    // always confirmed. Downloading is no longer a precondition for starting over.
    btn.textContent = 'Start over'; btn.dataset.mode = 'discard';
  } else { // queued / building / gating / failed / starting — the run isn't finished
    btn.textContent = 'Cancel'; btn.dataset.mode = 'cancel';
  }
}

// Forget the current run client-side: drop the stored bundle + delivered flag + delivery state.
async function clearRun() {
  try { await idbDel('bundle'); } catch { /* ignore */ }
  try { if (lastBundle) localStorage.removeItem(deliveredKey(lastBundle)); } catch { /* ignore */ }
  stopPolling();
  lastBundle = null; delivered = false; emailOptedIn = false; lastCategory = null; lastQueuedLine = null;
  setTabTitle(null);
}

const GEAR_ICO = '<img src="/assets/generating.png" alt="" class="px-icon spin">';
const LOCK_ICO = '<img src="/assets/locked.png" alt="" class="px-icon">'; // closed padlock (T-048)

export async function onBundleReady(bundle) {
  lastBundle = bundle;
  emailOptedIn = false;
  delivered = false;
  lastCategory = null;
  lastQueuedLine = null;
  try { await idbSet('bundle', bundle); } catch { /* storage full / private mode */ }
  await refreshMe();
  reevaluateDelivery();
}

async function reevaluateDelivery() {
  if (!romRow()) return;
  clearDlSteps(); // T-079 — the delivery checklist is transient; drop it between states
  lastCategory = null; // any path below either re-renders via renderRom or sets the row directly
  setTabTitle(null);   // renderRom (active request) overrides this for the building/queued states
  setStartOverBtn('cancel'); // default; the delivered branch / renderRom override it

  if (!state) {
    setHeadline('gating');
    setRomDownload({ enabled: false, reason: 'Log in to build a ROM.' });
    setRomRow('todo',
      `<div class="status-title">Randomized ROM</div>
       <div class="status-sub">Log in to build one — your docs are ready regardless.</div>
       <button class="btn btn-primary btn-sm" id="rom-cta">Log in / Register</button>`, LOCK_ICO);
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
  // T-053, ADR-013: NO ROM-ownership gate here — generation is decoupled from ownership. The user can
  // build and download the BPS patch without a ROM; the ROM only matters at download time, to apply the
  // patch locally (otherwise they get the raw .bps to patch elsewhere).

  if (state.activeRequest) { renderRom(state.activeRequest); startPolling(); return; }

  if (delivered) {
    const n = romCount();
    setHeadline('downloaded');
    setStartOverBtn('downloaded');
    setRomDownload({ enabled: false, reason: 'Already delivered — removed from the server. Start a new run to build another.' });
    setRomRow('done',
      `<div class="status-title">${n > 1 ? 'Patches applied to your ROMs' : 'Patch applied to your ROM'}</div>
       <div class="status-sub">Removed from the server. Start a new run to build another.</div>`, '✓');
    return;
  }

  if (lastBundle) {
    // Optimistic submit state — NEUTRAL, not "building": the 32 MB bundle upload takes a moment and the
    // server may well queue the run (slow/multi-ROM, or the single builder is busy). Claiming "building"
    // here is what made the UI flash Building → Queued; renderRom below shows the real state.
    setHeadline('queued');
    setRomDownload({ enabled: false, reason: "Your ROM isn't ready yet." });
    setRomRow('queued',
      `<div class="status-title">Submitting your run…</div>
       <div class="status-sub muted">Uploading and queueing — this can take a moment for a multi-ROM run.</div>`, '🕒');
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
  setStartOverBtn(cat);

  if (cat === 'ready') {
    lastCategory = 'ready';
    setTabTitle('✓ ROM ready');
    hydrateReadyRow(count); // async: ROM-aware (patch locally vs. add-ROM / raw .bps) — T-053, ADR-013
    return;
  }

  if (cat === 'failed') {
    lastCategory = 'failed';
    setTabTitle(null);
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
      setRomRow('building',
        `<div class="status-title">Building your ROM…</div>
         ${total > 1 ? `<div class="status-sub" id="rom-counter">ROM ${current} of ${total}</div>` : ''}
         <div class="gen-progress-wrap compact"><div class="gen-progress-bar"><div class="gen-progress-fill" id="rom-progress-fill"></div></div></div>
         <div class="status-sub" id="rom-eta">Estimating…</div>
         <div class="status-sub muted">You can leave this page open — it updates automatically.</div>`,
        GEAR_ICO);
    }
    // Server-authoritative bar + ETA (B-013): identical whether or not the page was reloaded, refreshed
    // every poll. The CSS width transition eases the 3-second steps. No client clock.
    const pct = info.progress != null ? info.progress : 0;
    const fill = $('rom-progress-fill'); if (fill) fill.style.width = `${pct}%`;
    setTabTitle(`Building ${pct}%`);
    const etaEl = $('rom-eta'); if (etaEl && info.eta != null) etaEl.textContent = etaText(info.eta);
    if (total > 1) { const c = $('rom-counter'); if (c) c.textContent = `ROM ${current} of ${total}`; }
    return;
  }

  // queued — clean, no gear/bar; show position + ETA, email opt-in, and the docs-meanwhile hint.
  setRomDownload({ enabled: false, count });
  const etaTxt = info.eta != null ? `ETA ~${Math.max(1, Math.round(info.eta / 60))} min` : '';
  const ahead = info.romsAhead;
  let line;
  if (ahead == null) line = `Your ROM is queued.${etaTxt ? ` (${etaTxt})` : ''}`;
  else if (ahead <= 0) line = `You're next in line.${etaTxt ? ` ${etaTxt}.` : ''}`;
  else line = `There ${ahead === 1 ? 'is' : 'are'} ${ahead} ROM${ahead === 1 ? '' : 's'} before yours${etaTxt ? ` (${etaTxt})` : ''}.`;

  setTabTitle(ahead == null ? 'Queued' : ahead <= 0 ? "You're next" : `${ahead} ahead`);

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

// Ask the backend for the truth and render it (B-013). One fetch now (so a reload shows real progress
// immediately, not zero) + every 3 s after. The frontend computes nothing about progress/ETA itself.
function startPolling() {
  stopPolling();
  const poll = async () => {
    const { ok, status, data } = await api('/api/status', { auth: true });
    if (!ok) {
      stopPolling();
      // 404 mid-build = the request left the active set (failed/expired) before reaching "ready".
      if (status === 404 && lastCategory !== 'ready' && !delivered) { lastCategory = null; renderRom({ state: 'failed' }); }
      return;
    }
    renderRom(
      { state: data.state, romsDone: data.romsDone, romsTotal: data.romsTotal },
      { eta: data.eta, progress: data.progress, romsAhead: data.romsAhead },
    );
    if (data.state === 'ready') stopPolling();
  };
  poll();                                  // immediate — no "starts from zero" flash on reload
  pollTimer = setInterval(poll, 3000);
}
function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

function triggerDownload(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// Apply every .bps in the downloaded zip to the user's ROM, entirely in the browser (ADR-013). A wrong
// base ROM makes applyBps throw (source-checksum guard) → surfaced as a clear error to the user.
async function patchZipToRoms(zipBlob, romBytes) {
  const zip = await JSZip.loadAsync(zipBlob);
  const entries = Object.values(zip.files).filter((f) => !f.dir && /\.bps$/i.test(f.name));
  const { applyBps } = await loadCodec();
  const roms = [];
  for (const f of entries) {
    const patch = new Uint8Array(await f.async('arraybuffer'));
    roms.push({ name: f.name.replace(/\.bps$/i, '.gba'), bytes: applyBps(patch, romBytes) });
  }
  return roms;
}

// Zip the finished games (multi-ROM runs: nuzlocke / soul-link) into one download.
async function zipRoms(roms) {
  const zip = new JSZip();
  for (const { name, bytes } of roms) zip.file(name, bytes);
  return zip.generateAsync({ type: 'blob' });
}

// Core delivery (T-079): download the patch(es), apply them to the user's ROM locally, and hand back
// the finished game(s) — a single .gba for one ROM, or a zip for a multi-ROM run. `onStep(key,state)`
// drives the live checklist (download → apply → zip). NOT gated on the button, so it also runs right
// after an inline ROM add. If somehow no ROM is stored, the raw patch archive is handed over unchanged.
async function deliverPatch(onStep = () => {}) {
  onStep('download', 'active');
  const res = await fetch('/api/download', { headers: { authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`download failed (${res.status})`);
  const zipBlob = await res.blob();
  onStep('download', 'done');

  const rom = await getRom();
  if (rom) {
    onStep('apply', 'active');
    const roms = await patchZipToRoms(zipBlob, rom);
    onStep('apply', 'done');
    if (roms.length > 1) {
      onStep('zip', 'active');
      const outZip = await zipRoms(roms);
      onStep('zip', 'done');
      triggerDownload(outZip, `emerald-cut-${lastBundle?.config?.seed ?? 'run'}.zip`);
    } else {
      triggerDownload(new Blob([roms[0].bytes], { type: 'application/octet-stream' }), roms[0].name);
    }
  } else {
    triggerDownload(zipBlob, 'emerald-cut-patch.zip');
  }
  // The patch stays re-downloadable server-side (until the 48h sweep or the next run); remember delivery
  // so a reload doesn't auto-resubmit the bundle (B-011).
  delivered = true;
  markDelivered(lastBundle);
}

async function downloadRom() {
  const btn = $('btn-download-rom');
  if (!btn || btn.disabled) return;
  const count = romCount();
  // Immediate feedback (T-035, T-079): disable + a spinner the instant it's clicked, and show the live
  // 3-step checklist below, so a slow delivery is transparent and the button can't be double-clicked.
  btn.disabled = true;
  btn.classList.add('is-working');
  btn.innerHTML = '<img src="/assets/generating.png" alt="" class="px-icon spin"> Working…';
  const onStep = startDlSteps(count);
  try {
    await deliverPatch(onStep);
    await refreshMe();
    reevaluateDelivery(); // clears the checklist + re-renders the delivered state
  } catch (err) {
    clearDlSteps();
    setRomDownload({ enabled: true, count, note: true }); // restore the button + clear spinner
    alert(/source/i.test(err?.message) ? 'That patch is for Pokémon Emerald (USA, Europe) — the ROM you saved does not match. Re-add the correct ROM.' : 'Download failed — please try again.');
  }
}

// Ready state (T-053, ADR-013; T-079): if the user's ROM is saved in this browser, the button
// downloads the patch(es) and applies them locally to build the finished game(s); if not, offer an
// inline "add your ROM" affordance (+ a raw-.bps fallback). Async — reads IndexedDB, guarded against
// the run moving on while we await. Copy is patch-first + singular/plural by ROM count.
async function hydrateReadyRow(count) {
  const romPresent = await hasRom().catch(() => false);
  if (lastCategory !== 'ready' || !romRow()) return;
  const runNoun = count > 1 ? 'runs are' : 'run is';
  const gameNoun = count > 1 ? 'games' : 'game';
  const patchNoun = count > 1 ? 'patches' : 'patch';
  if (romPresent) {
    setRomRow('done',
      `<div class="status-title">Your randomized ${count > 1 ? 'ROMs are' : 'ROM is'} ready</div>
       <div class="status-sub" id="rom-ready-msg">Your Emerald is saved in this browser — we download the ${patchNoun} and apply ${count > 1 ? 'them' : 'it'} here to build your ${gameNoun}.</div>
       <button class="btn btn-ghost btn-sm" id="rom-dl-bps">Download the raw ${patchNoun} (.bps) instead</button>`, '✓');
    setRomDownload({ enabled: true, count, note: true, label: dlLabel(count) });
  } else {
    setRomRow('done',
      `<div class="status-title">Your randomized ${runNoun} ready</div>
       <div class="status-sub" id="rom-ready-msg">Add your Pokémon Emerald (USA, Europe) to build the playable ${gameNoun} — it stays in your browser, never uploaded.</div>
       <label class="btn btn-primary btn-sm">⬆ Add your Emerald ROM<input type="file" id="rom-file-ready" accept=".gba,application/octet-stream" hidden></label>
       <button class="btn btn-ghost btn-sm" id="rom-dl-bps">Download raw ${patchNoun} (.bps) only</button>`, '✓');
    // The green button applies the patch(es) to the playable ROM → gated until a ROM is added (clear,
    // not a 2nd .bps button). The raw .bps stays reachable via the ghost button for those who patch elsewhere.
    setRomDownload({ enabled: false, note: false, label: dlLabel(count),
      reason: 'Add your Emerald ROM (USA, Europe) above to build the playable game.' });
    $('rom-file-ready')?.addEventListener('change', onReadyRomAdd);
  }
  $('rom-dl-bps')?.addEventListener('click', downloadBpsOnly);
}

// Add the Emerald from the ready screen, then build the finished ROM immediately (T-053).
async function onReadyRomAdd(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const msg = $('rom-ready-msg');
  if (msg) msg.textContent = 'Checking your ROM…';
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sha1 = await sha1Hex(bytes);
  if (!isKnownEmeraldRom(sha1)) { // validated in-browser; bytes never leave the machine
    if (msg) msg.textContent = 'That file is not a recognized Pokémon Emerald (USA, Europe) ROM.';
    return;
  }
  await putRom(bytes); // saved locally; never uploaded
  updateNavAccount(); // refresh the Settings ROM row (now present)
  try {
    // ROM saved → download the patch(es) + apply locally now (same 3-step checklist as the button).
    await deliverPatch(startDlSteps(romCount()));
  } catch (err) {
    clearDlSteps();
    if (msg) msg.textContent = /source/i.test(err?.message)
      ? 'That ROM does not match Pokémon Emerald (USA, Europe).'
      : 'Could not build the game — please try again.';
    return;
  }
  reevaluateDelivery(); // re-render the ready row → ROM-present view (green button enabled)
}

// Download just the raw patch (.bps) without applying it — for users who patch elsewhere (ADR-013).
async function downloadBpsOnly() {
  try {
    const res = await fetch('/api/download', { headers: { authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new Error(`download failed (${res.status})`);
    triggerDownload(await res.blob(), 'emerald-cut-patch.zip');
    delivered = true; markDelivered(lastBundle);
  } catch { alert('Download failed — please try again.'); }
}

export async function initAccount(opts = {}) {
  if (opts.loadCodec) loadCodec = opts.loadCodec; // test seam for the BPS bundle
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

  // the gen-done "Start over / Cancel" button (T-035). Mode is set by setStartOverBtn:
  //  - cancel:    confirm, then cancel the server build + forget the run + reset the wizard
  //  - startover: forget the (already-downloaded) run + reset the wizard
  //  - ready:     disabled (download first) — no-op
  $('btn-start-over')?.addEventListener('click', async () => {
    const mode = $('btn-start-over').dataset.mode;
    // Both discard the run permanently → always confirm (T-053). "discard" = a generated patch exists;
    // "cancel" = an in-progress run. Either way the server-side request is removed so it can't be
    // resurrected on reload. The user's own Emerald ROM (IndexedDB) is NOT touched.
    const msg = mode === 'discard'
      ? "Start over?\n\nThe randomized ROM you generated will be permanently deleted and you'll build a new one. (Your own Emerald stays saved in this browser.)"
      : 'Cancel this run?\n\nIt will be permanently deleted.';
    if (!confirm(msg)) return;
    await api('/api/cancel', { method: 'POST', auth: true }).catch(() => {});
    await clearRun();
    opts.onStartOver?.();
  });

  await refreshMe();
  updateNavAccount();
  // reload recovery (B-011): restore a previously generated run whenever an in-flight build exists
  // OR a bundle is still in IndexedDB. The latter is the key fix — a run generated logged-out (then
  // an email-verification round-trip) has no active build yet, but must survive the reload. onRecover
  // (app.js) makes the step-3 view ready; it only jumps to the Randomizer tab for an in-flight build.
  const storedBundle = await getStoredBundle();
  if (state?.activeRequest || storedBundle) {
    if (storedBundle) { lastBundle = storedBundle; delivered = isDelivered(storedBundle); }
    try { await opts.onRecover?.({ switchTab: !!state?.activeRequest }); } catch { /* ignore */ }
    if (state?.activeRequest) { renderRom(state.activeRequest); startPolling(); }
    else { reevaluateDelivery(); }
  }
}
