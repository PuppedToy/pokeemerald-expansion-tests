// T-192 — Config presets (My / Official / Community). A modal to save the current randomizer config as
// a named preset, browse your own + the official + the community's published presets, and apply one in
// one click. Publish/like/view + search/filter/sort/paginate are backed by the server (ADR-021).
//
// Dependency-injected (api / getAuthState / onAuthChange / getCurrentConfig / applyConfig /
// onRequestLogin / defaults / renderConfigDetail) so the pure helpers unit-test against the zero-dep
// DOM stub with no server (ADR-009). app.js wires the real account.js + config-form functions in.

const $ = (id) => document.getElementById(id);

export const PAGE_SIZE = 5;

// ── tags (mirror backend/presets/tags.js — used only for the synthetic Balanced card) ────────────
const RUN_TYPE_TO_MODE = { default: 'normal', nuzlocke: 'nuzlocke', soullink: 'soullink' };
export function deriveTags(config) {
  const cfg = config && typeof config === 'object' ? config : {};
  const format = ['singles', 'doubles', 'mixed'].includes(cfg.battleFormat) ? cfg.battleFormat : 'singles';
  const mode = RUN_TYPE_TO_MODE[cfg.runType] ?? 'normal';
  const wild = ['deterministic', 'classic'].includes(cfg.wildEncounterType) ? cfg.wildEncounterType : 'deterministic';
  return { format, mode, wild };
}

const TAG_LABELS = {
  format: { singles: 'Singles', doubles: 'Doubles', mixed: 'Mixed' },
  mode: { normal: 'Normal', nuzlocke: 'Nuzlocke', soullink: 'Soul-Link' },
  wild: { deterministic: 'Deterministic', classic: 'Classic' },
};

// ── pure render helpers (exported for tests) ─────────────────────────────────────────────────────

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function fmtDate(ts) {
  if (!Number.isFinite(ts)) return '';
  try { return new Date(ts).toISOString().slice(0, 10); } catch { return ''; }
}

export function tagChipsHtml(tags) {
  if (!tags) return '';
  return ['format', 'mode', 'wild']
    .map((dim) => {
      const label = TAG_LABELS[dim]?.[tags[dim]];
      return label ? `<span class="preset-chip preset-chip-${dim}">${label}</span>` : '';
    })
    .join('');
}

/**
 * One preset card. `mode` ∈ 'mine' | 'official' | 'community' | 'save'. viewerIsAdmin unlocks
 * moderation (unpublish/delete) on presets the viewer doesn't own. Every action is a data-action
 * button so the modal can delegate clicks; user-supplied name/description are escaped (XSS).
 */
export function presetCardHtml(item, { mode = 'community', viewerIsAdmin = false } = {}) {
  const isOwner = !!item.isOwner;
  const discoverable = mode === 'community' || mode === 'official'; // shows stats + a Like toggle
  const showStats = discoverable || item.published;
  const stats = showStats
    ? `<span class="preset-stats" title="views · likes">👁 ${item.views ?? 0} · ♥ ${item.likes ?? 0}</span>`
    : '';

  const btns = [];
  if (mode === 'save' && isOwner) {
    btns.push(`<button class="btn btn-sm btn-emerald" data-action="overwrite" data-id="${item.id}">Overwrite</button>`);
  } else {
    btns.push(`<button class="btn btn-sm btn-emerald" data-action="apply" data-id="${item.id}">Apply</button>`);
  }
  btns.push(`<button class="btn btn-sm btn-ghost" data-action="detail" data-id="${item.id}">Details</button>`);

  if (isOwner && mode !== 'save') {
    btns.push(`<button class="btn btn-sm btn-ghost" data-action="edit" data-id="${item.id}">Edit</button>`);
    btns.push(item.published
      ? `<button class="btn btn-sm btn-ghost" data-action="unpublish" data-id="${item.id}">Unpublish</button>`
      : `<button class="btn btn-sm" data-action="publish" data-id="${item.id}">Publish</button>`);
    btns.push(`<button class="btn btn-sm btn-danger" data-action="delete" data-id="${item.id}">Delete</button>`);
  }
  if (!isOwner && discoverable) {
    btns.push(`<button class="btn btn-sm preset-like ${item.likedByMe ? 'liked' : ''}" data-action="like" data-id="${item.id}" aria-pressed="${item.likedByMe ? 'true' : 'false'}">${item.likedByMe ? '♥ Liked' : '♡ Like'}</button>`);
    if (viewerIsAdmin && mode === 'community') { // admin moderation lives in the Community tab
      btns.push(`<button class="btn btn-sm btn-ghost" data-action="unpublish" data-id="${item.id}">Unpublish</button>`);
      btns.push(`<button class="btn btn-sm btn-danger" data-action="delete" data-id="${item.id}">Delete</button>`);
    }
  }

  // Admin curation (T-192): promote/demote any preset to/from Recommended without recreating it.
  if (viewerIsAdmin && mode !== 'save') {
    btns.push(item.kind === 'official'
      ? `<button class="btn btn-sm btn-ghost preset-recommend" data-action="unrecommend" data-id="${item.id}">Remove from Recommended</button>`
      : `<button class="btn btn-sm btn-ghost preset-recommend" data-action="recommend" data-id="${item.id}">★ Make Recommended</button>`);
  }

  const badge = item.kind === 'official' ? '<span class="preset-badge">Recommended</span>' : '';
  const desc = item.description ? `<div class="preset-card-desc">${escapeHtml(item.description)}</div>` : '';
  return `
    <div class="preset-card" data-id="${item.id}">
      <div class="preset-card-head">
        <div class="preset-card-title">${escapeHtml(item.name)}${badge}</div>
        <div class="preset-card-tags">${tagChipsHtml(item.tags)}</div>
      </div>
      ${desc}
      <div class="preset-card-meta">
        <span class="preset-date">Edited ${fmtDate(item.updatedAt)}</span>
        ${stats}
      </div>
      <div class="preset-card-actions">${btns.join('')}</div>
    </div>`;
}

export function listHtml(items, opts) {
  if (!items || !items.length) return `<div class="preset-empty">No presets found.</div>`;
  return `<div class="preset-list">${items.map((it) => presetCardHtml(it, opts)).join('')}</div>`;
}

export function paginationHtml(page, totalPages) {
  if (!totalPages || totalPages <= 1) return '';
  const prev = page > 1
    ? `<button class="btn btn-sm btn-ghost" data-action="page" data-page="${page - 1}">← Prev</button>`
    : `<button class="btn btn-sm btn-ghost" disabled>← Prev</button>`;
  const next = page < totalPages
    ? `<button class="btn btn-sm btn-ghost" data-action="page" data-page="${page + 1}">Next →</button>`
    : `<button class="btn btn-sm btn-ghost" disabled>Next →</button>`;
  return `<div class="preset-pager">${prev}<span class="preset-page-label">Page ${page} of ${totalPages}</span>${next}</div>`;
}

const FILTER_OPTS = {
  format: [['', 'Any format'], ['singles', 'Singles'], ['doubles', 'Doubles'], ['mixed', 'Mixed']],
  mode: [['', 'Any mode'], ['normal', 'Normal'], ['nuzlocke', 'Nuzlocke'], ['soullink', 'Soul-Link']],
  wild: [['', 'Any wild'], ['deterministic', 'Deterministic'], ['classic', 'Classic']],
  sort: [['relevance', 'Relevance'], ['likes', 'Most liked'], ['views', 'Most viewed']],
  since: [['week', 'Past week'], ['month', 'Past month'], ['year', 'Past year'], ['all', 'All time']],
};
function selectHtml(id, current, options) {
  const opts = options.map(([v, label]) => `<option value="${v}" ${v === current ? 'selected' : ''}>${label}</option>`).join('');
  return `<select class="input preset-filter" id="${id}" data-filter="${id.replace('presets-f-', '')}">${opts}</select>`;
}
export function communityFiltersHtml(f = {}) {
  return `
    <div class="preset-filters">
      <input class="input preset-search" id="presets-search" type="search" placeholder="Search name or description…" value="${escapeHtml(f.q || '')}">
      <div class="preset-filter-row">
        ${selectHtml('presets-f-format', f.format || '', FILTER_OPTS.format)}
        ${selectHtml('presets-f-mode', f.mode || '', FILTER_OPTS.mode)}
        ${selectHtml('presets-f-wild', f.wild || '', FILTER_OPTS.wild)}
        ${selectHtml('presets-f-sort', f.sort || 'relevance', FILTER_OPTS.sort)}
        ${selectHtml('presets-f-since', f.since || 'year', FILTER_OPTS.since)}
      </div>
    </div>`;
}

/** Build the GET query string for a scope. Empty filter values are omitted. */
export function buildListQuery(scope, opts = {}) {
  const p = new URLSearchParams({ scope });
  for (const k of ['q', 'format', 'mode', 'wild', 'sort', 'since']) {
    const v = opts[k];
    if (v != null && v !== '') p.set(k, v);
  }
  p.set('page', String(Math.max(1, opts.page || 1)));
  return `/api/presets?${p.toString()}`;
}

export function saveFormHtml({ isAdmin = false } = {}) {
  return `
    <form class="preset-save-form" id="preset-save-form">
      <div class="fb-field-label">Save the current settings as a preset</div>
      <input class="input" id="preset-save-name" type="text" maxlength="80" placeholder="Preset name" required>
      <textarea class="input preset-save-desc" id="preset-save-desc" rows="2" maxlength="500" placeholder="Description (optional)"></textarea>
      ${isAdmin ? `<label class="preset-official-toggle"><input type="checkbox" id="preset-save-official"> Save as a Recommended preset</label>` : ''}
      <div class="preset-save-actions">
        <button class="btn btn-emerald" type="submit" id="preset-save-new">Save as new</button>
        <span class="preset-save-hint field-hint">…or overwrite one of your presets below.</span>
      </div>
      <p class="preset-msg" id="preset-save-msg"></p>
    </form>`;
}

// ── controller (DOM + network) ───────────────────────────────────────────────────────────────────

export function initPresets(deps = {}) {
  const { api, getAuthState, onAuthChange, getCurrentConfig, applyConfig, onRequestLogin, defaults, renderConfigDetail } = deps;

  let mode = 'browse';        // 'browse' | 'save'
  let tab = 'mine';           // 'mine' | 'official' | 'community'
  let pendingConfig = null;   // config captured for a save
  const pages = { mine: 1, official: 1, community: 1 };
  const filters = { q: '', format: '', mode: '', wild: '', sort: 'relevance', since: 'year' };
  let searchTimer = null;
  let balancedSeeded = false; // seed the built-in "Balanced" recommended preset once per session

  const loggedIn = () => !!getAuthState?.();
  const isAdmin = () => !!getAuthState?.()?.isAdmin;
  const verified = () => !!getAuthState?.()?.verified;

  // Ensure the built-in "Balanced" recommended preset exists, seeded from the live DEFAULTS (SSOT).
  // Admin-only + idempotent server-side; runs once per session when an admin is detected.
  function maybeSeedBalanced() {
    if (balancedSeeded || !defaults || !isAdmin()) return;
    balancedSeeded = true;
    api('/api/presets/official/balanced', { method: 'POST', auth: true, body: { config: defaults } }).catch(() => {});
  }

  function open() { const m = $('presets-modal'); if (m) m.hidden = false; }
  function close() { const m = $('presets-modal'); if (m) m.hidden = true; }

  function setTab(next) {
    tab = next;
    document.querySelectorAll('[data-presets-tab]').forEach?.((t) => t.classList.toggle('active', t.dataset.presetsTab === next));
    render();
  }

  function setTitle(t) { const el = $('presets-title'); if (el) el.textContent = t; }

  function openBrowse() {
    mode = 'browse'; pendingConfig = null;
    setTitle('Presets');
    open();
    setTab('mine');
  }

  function openSave(config) {
    if (!loggedIn()) { onRequestLogin?.(); return; }
    mode = 'save'; pendingConfig = config || getCurrentConfig?.();
    setTitle('Save preset');
    open();
    setTab('mine');
  }

  // ── rendering ──
  function body() { return $('presets-body'); }
  function setBody(html) { const el = body(); if (el) el.innerHTML = html; }

  function loginCta(what) {
    return `<div class="preset-login-cta">You must be logged in to ${what}. <a href="#" id="preset-login-link" class="auth-link">Log in / Register</a></div>`;
  }

  async function render() {
    if (tab === 'mine') return renderMine();
    if (tab === 'official') return renderOfficial();
    return renderCommunity();
  }

  async function renderMine() {
    const el = body(); if (!el) return;
    if (!loggedIn()) { setBody((mode === 'save' ? '' : '') + loginCta(mode === 'save' ? 'save presets' : 'see your presets')); return; }
    setBody('<div class="preset-loading">Loading…</div>');
    const { ok, data } = await api(buildListQuery('mine', { page: pages.mine }), { auth: true });
    if (!ok) { setBody(loginCta('see your presets')); return; }
    const saveForm = mode === 'save' ? saveFormHtml({ isAdmin: isAdmin() }) : '';
    setBody(saveForm + listHtml(data.items, { mode: mode === 'save' ? 'save' : 'mine', viewerIsAdmin: isAdmin() }) + paginationHtml(data.page, data.totalPages));
  }

  async function renderOfficial() {
    setBody('<div class="preset-loading">Loading…</div>');
    const { ok, data } = await api(buildListQuery('official', { page: pages.official }), { auth: loggedIn() });
    const items = ok ? data.items : [];
    const totalPages = ok ? data.totalPages : 1;
    setBody(listHtml(items, { mode: 'official', viewerIsAdmin: isAdmin() }) + paginationHtml(pages.official, totalPages));
  }

  async function renderCommunity() {
    setBody('<div class="preset-loading">Loading…</div>');
    const { ok, data } = await api(buildListQuery('community', { ...filters, page: pages.community }), { auth: loggedIn() });
    const items = ok ? data.items : [];
    const totalPages = ok ? data.totalPages : 1;
    setBody(
      communityFiltersHtml(filters) +
      listHtml(items, { mode: 'community', viewerIsAdmin: isAdmin() }) +
      paginationHtml(pages.community, totalPages)
    );
  }

  async function showDetail(id) {
    const el = body(); if (!el) return;
    setBody('<div class="preset-loading">Loading…</div>');
    const { ok, data } = await api(`/api/presets/${encodeURIComponent(id)}`, { auth: loggedIn() });
    if (!ok) { setBody(`<div class="preset-empty">This preset is no longer available.</div>`); return; }
    const item = data.item;
    const rows = renderConfigDetail ? renderConfigDetail(item.config) : '';
    setBody(`
      <div class="preset-detail">
        <button class="btn btn-sm btn-ghost" data-action="back">← Back</button>
        <div class="preset-detail-head">
          <div class="preset-card-title">${escapeHtml(item.name)}</div>
          <div class="preset-card-tags">${tagChipsHtml(item.tags)}</div>
        </div>
        ${item.description ? `<div class="preset-card-desc">${escapeHtml(item.description)}</div>` : ''}
        <div class="preset-card-actions">
          <button class="btn btn-sm btn-emerald" data-action="apply-config">Apply this preset</button>
        </div>
        <div class="preset-detail-config">${rows}</div>
      </div>`);
    el._detailConfig = item.config; // stash for apply-config
  }

  function applyAndClose(config) {
    if (config) applyConfig?.(config);
    close();
  }

  // ── actions (event delegation on the body) ──
  async function onBodyClick(e) {
    const btn = e.target?.closest?.('[data-action]');
    if (!btn) {
      if (e.target?.id === 'preset-login-link') { e.preventDefault(); onRequestLogin?.(); }
      return;
    }
    e.preventDefault();
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'page') { pages[tab] = parseInt(btn.dataset.page, 10) || 1; return render(); }
    if (action === 'back') return render();
    if (action === 'apply-config') return applyAndClose(body()?._detailConfig);
    if (action === 'detail') return showDetail(id);

    if (action === 'apply') {
      const { ok, data } = await api(`/api/presets/${encodeURIComponent(id)}`, { auth: loggedIn() });
      if (ok) applyAndClose(data.item.config);
      return;
    }

    if (action === 'overwrite') return doSave(id);
    if (action === 'edit') return editPreset(id);

    if (action === 'publish' || action === 'unpublish') {
      if (action === 'publish' && !verified()) { alert('Please verify your email before publishing a preset.'); return; }
      await api(`/api/presets/${encodeURIComponent(id)}/${action}`, { method: 'POST', auth: true });
      return render();
    }
    if (action === 'recommend' || action === 'unrecommend') { // admin: promote/demote to Recommended
      await api(`/api/presets/${encodeURIComponent(id)}/${action}`, { method: 'POST', auth: true });
      return render();
    }
    if (action === 'delete') {
      if (!confirm('Delete this preset? This cannot be undone.')) return;
      await api(`/api/presets/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
      return render();
    }
    if (action === 'like') {
      const { ok } = await api(`/api/presets/${encodeURIComponent(id)}/like`, { method: 'POST', auth: true });
      if (!ok && !loggedIn()) onRequestLogin?.();
      return render();
    }
  }

  async function editPreset(id) {
    const current = await api(`/api/presets/${encodeURIComponent(id)}`, { auth: true });
    const item = current.ok ? current.data.item : null;
    const name = prompt('Preset name:', item?.name ?? '');
    if (name == null) return;
    const description = prompt('Description:', item?.description ?? '');
    if (description == null) return;
    await api(`/api/presets/${encodeURIComponent(id)}`, {
      method: 'PUT', auth: true, body: { name: name.trim(), description: description.trim() },
    });
    render();
  }

  async function doSave(overwriteId) {
    const name = ($('preset-save-name')?.value || '').trim();
    const description = ($('preset-save-desc')?.value || '').trim();
    const official = !!$('preset-save-official')?.checked;
    const msg = $('preset-save-msg');
    if (overwriteId == null && !name) { if (msg) msg.textContent = 'Please enter a name.'; return; }

    let res;
    if (overwriteId != null) {
      res = await api(`/api/presets/${encodeURIComponent(overwriteId)}`, { method: 'PUT', auth: true, body: { config: pendingConfig } });
    } else {
      res = await api('/api/presets', { method: 'POST', auth: true, body: { name, description, official, config: pendingConfig } });
    }
    if (res?.ok) {
      mode = 'browse'; setTitle('Presets'); pages.mine = 1;
      render();
    } else if (msg) {
      msg.textContent = res?.data?.error || 'Could not save the preset.';
    }
  }

  function onBodySubmit(e) {
    if (e.target?.id === 'preset-save-form') { e.preventDefault(); doSave(null); }
  }

  function onBodyInput(e) {
    if (e.target?.id === 'presets-search') {
      filters.q = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { pages.community = 1; renderCommunity(); }, 300);
    }
  }

  function onBodyChange(e) {
    const f = e.target?.dataset?.filter;
    if (f && Object.prototype.hasOwnProperty.call(filters, f)) {
      filters[f] = e.target.value;
      pages.community = 1;
      renderCommunity();
    }
  }

  // ── wire the static modal chrome once ──
  $('presets-close')?.addEventListener('click', close);
  $('presets-modal')?.addEventListener('click', (e) => { if (e.target?.id === 'presets-modal') close(); });
  document.addEventListener?.('keydown', (e) => { if (e.key === 'Escape' && $('presets-modal') && !$('presets-modal').hidden) close(); });
  document.querySelectorAll('[data-presets-tab]').forEach?.((t) => t.addEventListener('click', () => { pages[t.dataset.presetsTab] = pages[t.dataset.presetsTab] || 1; setTab(t.dataset.presetsTab); }));

  const bodyEl = body();
  bodyEl?.addEventListener('click', onBodyClick);
  bodyEl?.addEventListener('submit', onBodySubmit);
  bodyEl?.addEventListener('input', onBodyInput);
  bodyEl?.addEventListener('change', onBodyChange);

  onAuthChange?.(() => { maybeSeedBalanced(); if (!$('presets-modal')?.hidden) render(); });
  maybeSeedBalanced(); // in case auth state is already known at init

  return { openBrowse, openSave, close };
}
