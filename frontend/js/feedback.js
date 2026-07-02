// T-048 — Feedback section. Logged-in users submit free-text feedback (feature request / bug / other),
// stored server-side with the author + a timestamp. Logged-out users see a non-interactive form.
// The two curated lists ("Most requested features" / "Known bugs") ship empty and are filled by hand.
//
// Dependency-injected (getAuthState / onAuthChange / api / onRequestLogin) so it unit-tests against the
// zero-dep DOM stub with no server (ADR-009). app.js wires the real account.js functions in.

const CATEGORIES = [
  { value: 'feature', label: 'Feature request' },
  { value: 'bug', label: 'Bug report' },
  { value: 'other', label: 'Other' },
];

const $ = (id) => document.getElementById(id);

let deps = null;
let selectedCategory = 'feature';

export function initFeedback(d) {
  deps = d || {};
  renderForm();
  wireListTabs();
  deps.onAuthChange?.(renderForm);
}

// ── submit form (auth-dependent) ────────────────────────────────────────────────
function renderForm() {
  const mount = $('feedback-form-mount');
  if (!mount) return;
  selectedCategory = 'feature'; // reset to the default on every (re)render
  const loggedIn = !!deps.getAuthState?.();
  mount.innerHTML = loggedIn ? loggedInHtml() : loggedOutHtml();

  if (loggedIn) {
    $('feedback-form')?.addEventListener('submit', onSubmit);
    for (const c of CATEGORIES) {
      $(`fb-cat-${c.value}`)?.addEventListener('change', () => { selectedCategory = c.value; });
    }
  } else {
    $('feedback-login')?.addEventListener('click', (e) => { e?.preventDefault?.(); deps.onRequestLogin?.(); });
  }
}

function optionsHtml(disabled) {
  return CATEGORIES.map((c, i) => `
    <label class="radio-card fb-option">
      <input type="radio" name="fb-category" id="fb-cat-${c.value}" value="${c.value}"
             ${i === 0 ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span class="radio-card-body"><span class="radio-card-title">${c.label}</span></span>
    </label>`).join('');
}

function loggedInHtml() {
  return `
    <form class="feedback-form" id="feedback-form">
      <div class="fb-field-label">What kind of feedback?</div>
      <div class="radio-card-group radio-card-group-3 fb-options">${optionsHtml(false)}</div>
      <label class="fb-field-label" for="feedback-message">Your message</label>
      <textarea class="feedback-textarea" id="feedback-message" rows="5" maxlength="5000"
                placeholder="Tell us what you'd like to see, or what went wrong…"></textarea>
      <div class="feedback-actions">
        <button class="btn btn-primary" type="submit" id="feedback-submit">Send feedback</button>
        <p class="feedback-msg" id="feedback-msg"></p>
      </div>
    </form>`;
}

function loggedOutHtml() {
  return `
    <div class="feedback-locked">
      <fieldset class="feedback-form" disabled aria-hidden="true">
        <div class="fb-field-label">What kind of feedback?</div>
        <div class="radio-card-group radio-card-group-3 fb-options">${optionsHtml(true)}</div>
        <div class="fb-field-label">Your message</div>
        <textarea class="feedback-textarea" rows="5" disabled
                  placeholder="Tell us what you'd like to see, or what went wrong…"></textarea>
      </fieldset>
      <div class="feedback-lock-note">
        <span class="feedback-lock-icon" aria-hidden="true"><img src="/assets/locked.png" alt="" class="px-icon"></span>
        <span>You must be logged in to send feedback.</span>
        <a href="#" id="feedback-login" class="auth-link">Log in / Register</a>
      </div>
    </div>`;
}

function setMsg(text, kind = '') {
  const el = $('feedback-msg');
  if (el) { el.textContent = text || ''; el.className = `feedback-msg ${kind}`; }
}

async function onSubmit(e) {
  e?.preventDefault?.();
  const message = ($('feedback-message')?.value || '').trim();
  if (!message) { setMsg('Please write your feedback first.', 'err'); return; }

  const btn = $('feedback-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  const { ok, data } = await deps.api('/api/feedback', {
    method: 'POST', auth: true, body: { category: selectedCategory, message },
  });

  if (ok) {
    const mount = $('feedback-form-mount');
    if (mount) {
      mount.innerHTML = `
        <div class="feedback-thanks">
          <div class="feedback-thanks-title">Your message has been sent. Thanks for the feedback!</div>
          <button class="btn btn-ghost btn-sm" id="feedback-again">Send more feedback</button>
        </div>`;
      $('feedback-again')?.addEventListener('click', renderForm);
    }
  } else {
    setMsg(data?.error || 'Could not send your feedback. Please try again.', 'err');
    if (btn) { btn.disabled = false; btn.textContent = 'Send feedback'; }
  }
}

// ── curated lists (empty placeholders for now) ──────────────────────────────────
function wireListTabs() {
  const tabs = document.querySelectorAll('.fb-tab');
  tabs.forEach?.((t) => t.addEventListener('click', () => setListTab(t.dataset.fbTab)));
}

function setListTab(id) {
  document.querySelectorAll('.fb-tab').forEach?.((el) => el.classList.toggle('active', el.dataset.fbTab === id));
  document.querySelectorAll('.fb-panel').forEach?.((el) => el.classList.toggle('active', el.dataset.fbPanel === id));
}
