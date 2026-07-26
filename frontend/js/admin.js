// T-217 — beta admin invite panel. Admin-only (shown only when /api/me.isAdmin): the pending/accepted
// lists, queue status + global ETA, the balanced batch-invite control, and user search. Everything
// talks to /api/admin/beta/* (all 403 for non-admins, so the tab is also hidden for them). The panel
// HTML is built by the pure overviewHtml()/inviteSummary() (unit-tested); this module only wires them.

import { api, onAuthChange, getAuthState } from './account.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Format a queue ETA (seconds) into a short human string. Pure.
export function fmtEta(secs) {
  if (!secs || secs < 60) return '< 1 min';
  const m = Math.round(secs / 60);
  if (m < 60) return `~${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `~${h}h${r ? ` ${r}m` : ''}`;
}

// One-line summary of an invite batch result. Pure.
export function inviteSummary(r) {
  if (!r) return '';
  const bits = [`${r.invited} invited`, `${r.withRom} with a prepared run`, `${r.withoutRom} emailed to start`];
  if (r.cappedByBudget) bits.push('capped by the ~1h build budget');
  if (r.shortfall) bits.push(`${r.shortfall} short (pool exhausted)`);
  return bits.join(' · ');
}

// Build the whole panel from an /overview payload. Pure (no Date.now — days come from the timestamps).
export function overviewHtml(data) {
  const c = data.counts || {};
  const q = data.queue || {};
  const pending = data.pending || [];
  const accepted = data.accepted || [];
  const audit = data.audit || [];
  const day = (ms) => new Date(ms).toISOString().slice(0, 10);

  return `
    <div class="admin-stats">
      <span class="admin-stat"><strong>${c.pendingVerified || 0}</strong> waiting (verified)</span>
      <span class="admin-stat"><strong>${c.heldRoms || 0}</strong> prepared runs</span>
      <span class="admin-stat"><strong>${c.accepted || 0}</strong> accepted</span>
      <span class="admin-stat">queue: <strong>${q.building || 0}</strong> building · <strong>${q.queued || 0}</strong> queued · ETA ${fmtEta(q.etaSecs)}</span>
      <button class="btn btn-ghost btn-sm" id="admin-refresh" type="button">Refresh</button>
    </div>
    <div class="admin-invite">
      <label>Invite next batch of
        <input type="number" id="admin-invite-count" min="1" step="1" value="10" class="input input-sm admin-invite-count"></label>
      <button class="btn btn-primary btn-sm" id="admin-invite-btn" type="button">Invite</button>
      <span id="admin-invite-result" class="settings-note"></span>
    </div>
    <h3 class="admin-h">Waiting (${pending.length})</h3>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Email</th><th>Waiting since</th><th>Prepared run</th><th></th></tr></thead>
        <tbody>
          ${pending.map((u) => `<tr>
            <td>${esc(u.email)}</td>
            <td>${day(u.waitingSince)}</td>
            <td>${u.hasRom ? `✓ (${u.romsTotal})` : '—'}</td>
            <td><button class="btn btn-ghost btn-sm" type="button" data-accept-user="${u.userId}">Accept</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="admin-search">
      <input type="text" id="admin-search-input" class="input input-sm" placeholder="Search users by email…">
      <button class="btn btn-ghost btn-sm" id="admin-search-btn" type="button">Search</button>
      <div id="admin-search-results" class="admin-search-results"></div>
    </div>
    <h3 class="admin-h">Already in (${accepted.length})</h3>
    <ul class="admin-accepted">${accepted.map((u) => `<li>${esc(u.email)}</li>`).join('')}</ul>
    <details class="admin-audit">
      <summary>Invite history (${audit.length})</summary>
      <ul>${audit.map((a) => `<li>${day(a.created_at)} — ${esc(a.kind)}: ${a.granted} in (${a.with_rom} w/ROM)${a.admin_email ? ` · by ${esc(a.admin_email)}` : ''}</li>`).join('')}</ul>
    </details>`;
}

export function searchResultsHtml(results = []) {
  if (!results.length) return '<p class="settings-note">No matches.</p>';
  return results.map((u) => `<div class="admin-search-row">
    <span>${esc(u.email)} — ${esc(u.inviteState)}${u.hasRom ? ` · run ✓ (${u.romsTotal})` : ''}${u.verified ? '' : ' · unverified'}</span>
    ${u.inviteState !== 'accepted' ? `<button class="btn btn-ghost btn-sm" type="button" data-accept-user="${u.userId}">Accept</button>` : ''}
  </div>`).join('');
}

let mounted = false;

export function initAdmin() {
  onAuthChange(applyAdminVisibility);
  applyAdminVisibility(getAuthState());
  const c = $('admin-content');
  c?.addEventListener('click', onAdminClick);
  c?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target?.id === 'admin-search-input') doSearch(); });
}

// Reveal the Admin tab only for an admin; load the overview the first time it appears.
function applyAdminVisibility(state) {
  const isAdmin = !!state?.isAdmin;
  const tab = $('admin-tab');
  if (tab) tab.hidden = !isAdmin;
  if (isAdmin && !mounted) { mounted = true; loadOverview(); }
  if (!isAdmin) mounted = false;
}

function onAdminClick(e) {
  const t = e.target;
  if (!t) return;
  if (t.id === 'admin-refresh') return loadOverview();
  if (t.id === 'admin-invite-btn') return doInvite();
  if (t.id === 'admin-search-btn') return doSearch();
  const uid = t.dataset?.acceptUser;
  if (uid) return doAccept(Number(uid));
}

async function loadOverview() {
  const el = $('admin-content');
  if (!el) return;
  const { ok, data } = await api('/api/admin/beta/overview', { auth: true });
  el.innerHTML = ok ? overviewHtml(data) : '<p class="settings-note err">Admin overview unavailable.</p>';
}

async function doInvite() {
  const count = Number($('admin-invite-count')?.value || 0);
  const out = $('admin-invite-result');
  const { ok, data } = await api('/api/admin/beta/invite', { method: 'POST', body: { count }, auth: true });
  if (out) out.textContent = ok ? inviteSummary(data) : (data?.error || 'Invite failed');
  if (ok) loadOverview();
}

async function doAccept(userId) {
  const { ok } = await api('/api/admin/beta/accept', { method: 'POST', body: { userId }, auth: true });
  if (ok) loadOverview();
}

async function doSearch() {
  const box = $('admin-search-results');
  const q = $('admin-search-input')?.value || '';
  const { ok, data } = await api(`/api/admin/beta/search?q=${encodeURIComponent(q)}`, { auth: true });
  if (box) box.innerHTML = ok ? searchResultsHtml(data.results) : '';
}
