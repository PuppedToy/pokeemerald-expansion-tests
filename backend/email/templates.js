/**
 * Email templates (T-027, ADR-007). Pure render(kind, vars) → {subject, html, text}.
 * The `ready` mail links back to the site (the ROM is downloaded there); it never
 * attaches the ROM (32 MB attachments are unreliable and re-expose the file).
 */

const SITE_NAME = 'Pokémon Emerald Cut';

const TEMPLATES = {
  verify: ({ link }) => ({
    subject: `${SITE_NAME} — confirm your email`,
    text: `Welcome to ${SITE_NAME}.\nConfirm your email to start generating ROMs:\n${link}\n`,
    html: `<p>Welcome to ${SITE_NAME}.</p>`
        + `<p>Confirm your email to start generating ROMs:</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
  reset: ({ link }) => ({
    subject: `${SITE_NAME} — reset your password`,
    text: `Reset your ${SITE_NAME} password (this link expires):\n${link}\n`,
    html: `<p>Reset your ${SITE_NAME} password (this link expires):</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
  ready: ({ link }) => ({
    subject: `${SITE_NAME} — your ROM is ready`,
    text: `Your ROM is ready. Download it from your account (kept for 48 h):\n${link}\n`,
    html: `<p>Your ROM is ready.</p>`
        + `<p>Download it from your account (it is kept for 48 hours):</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
};

export function render(kind, vars = {}) {
  const tpl = TEMPLATES[kind];
  if (!tpl) throw new Error(`unknown email kind: ${kind}`);
  return tpl(vars);
}
