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
let state = null;       // /api/me
let lastBundle = null;
let pollTimer = null;

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
export async function onBundleReady(bundle) {
  lastBundle = bundle;
  emailOptedIn = false;
  try { await idbSet('bundle', bundle); } catch { /* storage full / private mode */ }
  await refreshMe();
  reevaluateDelivery();
}

async function reevaluateDelivery() {
  const el = $('delivery-panel');
  if (!el) return;

  if (!state) {
    el.innerHTML = `<div class="delivery-note warn">To build your ROM, <strong>log in</strong> and upload your Emerald ROM.
      <button class="btn btn-primary" id="delivery-login">Log in / Register</button></div>`;
    $('delivery-login').addEventListener('click', openModal);
    return;
  }
  if (!state.verified) {
    el.innerHTML = `<div class="delivery-note warn">Verify your email first (open the link we sent) — then your ROM build starts.</div>`;
    return;
  }
  if (!state.ownsValidRom) {
    el.innerHTML = `<div class="delivery-note warn">Upload your Emerald ROM to prove ownership and your build will start.
      <button class="btn btn-primary" id="delivery-upload">Upload ROM</button></div>`;
    $('delivery-upload').addEventListener('click', openModal);
    return;
  }
  if (state.activeRequest) { showStatus(state.activeRequest); startPolling(); return; }

  if (lastBundle) {
    el.innerHTML = `<div class="delivery-note">Starting your ROM build…</div>`;
    const { ok, data } = await api('/api/produce', { method: 'POST', body: lastBundle, auth: true });
    if (ok) { await refreshMe(); showStatus(state.activeRequest, data); startPolling(); }
    else el.innerHTML = `<div class="delivery-note err">Could not start the build: ${data?.error || 'error'}</div>`;
  }
}

let emailOptedIn = false;

function showStatus(req, produce) {
  const el = $('delivery-panel');
  if (!el || !req) return;
  if (req.state === 'ready') {
    el.innerHTML = `<div class="delivery-note ok"><strong>Your ROM is ready.</strong>
      <button class="btn btn-primary" id="dl-rom">⬇ Download ROM</button>
      <div class="delivery-hint">⚠ Single-use: downloading removes it from the server. Kept up to 48 h otherwise.</div></div>`;
    $('dl-rom').addEventListener('click', downloadRom);
    return;
  }
  const etaSecs = produce?.eta;
  const eta = etaSecs != null ? `~${Math.max(1, Math.round(etaSecs / 60))} min` : '…';
  // Offer the email-on-ready opt-in when the queue is long (ETA >= 2 min) — T-031.
  const offerEmail = emailOptedIn || (etaSecs != null && etaSecs >= 120);
  const emailBit = !offerEmail ? ''
    : emailOptedIn
      ? `<div class="delivery-hint">✓ We'll email you when it's ready.</div>`
      : `<label class="delivery-hint"><input type="checkbox" id="notify-email"> Email me when it's ready</label>`;
  el.innerHTML = `<div class="delivery-note">Building your ROM — <strong>${req.state}</strong>
    (${req.romsDone}/${req.romsTotal} ROMs) · ETA ${eta}
    <div class="delivery-hint">Download your docs meanwhile; this updates automatically.</div>
    ${emailBit}</div>`;
  if (offerEmail && !emailOptedIn) {
    $('notify-email').addEventListener('change', async (e) => {
      if (!e.target.checked) return;
      const { ok } = await api('/api/notify-on-ready', { method: 'POST', auth: true });
      if (ok) { emailOptedIn = true; showStatus(req, produce); }
    });
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(async () => {
    const { ok, data } = await api('/api/status', { auth: true });
    if (!ok) { stopPolling(); return; }
    showStatus({ state: data.state, romsDone: data.romsDone, romsTotal: data.romsTotal }, { eta: data.eta });
    if (data.state === 'ready') stopPolling();
  }, 3000);
}
function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

async function downloadRom() {
  const res = await fetch('/api/download', { headers: { authorization: `Bearer ${getToken()}` } });
  if (!res.ok) { alert('Download failed — try again.'); return; }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'emerald-cut-roms.zip';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  await refreshMe();        // the request is purged server-side after a successful download
  reevaluateDelivery();
}

export async function initAccount() {
  $('account-btn').addEventListener('click', openModal);
  $('auth-close').addEventListener('click', closeModal);
  $('auth-modal').addEventListener('click', (e) => { if (e.target.id === 'auth-modal') closeModal(); });

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

  await refreshMe();
  updateAccountBtn();
  // reload recovery: surface an in-flight build (and the ready ROM download) without re-generating
  if (state?.activeRequest) { showStatus(state.activeRequest); startPolling(); }
}
