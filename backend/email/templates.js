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
  // T-216 beta — immediate "you're in" mail for an invited user who had NOT prepared a ROM yet.
  welcome: ({ link }) => ({
    subject: `${SITE_NAME} — you're in! Start building your ROM`,
    text: `You're in the ${SITE_NAME} beta!\n`
        + `Head to the randomizer, set up your run and build your ROM:\n${link}\n`,
    html: `<p>You're in the ${SITE_NAME} beta!</p>`
        + `<p>Head to the randomizer, set up your run and build your ROM:</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
  // T-216 beta — combined "you're in" + "your ROM is ready" mail, sent once at build completion for a
  // user who had a ROM prepared (held `pending`) when their invite landed. One mail, not two.
  welcomeReady: ({ link }) => ({
    subject: `${SITE_NAME} — you're in, and your ROM is ready`,
    text: `You're in the ${SITE_NAME} beta — and the ROM you prepared has finished building.\n`
        + `Download it from your account (kept for 48 h):\n${link}\n`,
    html: `<p>You're in the ${SITE_NAME} beta — and the ROM you prepared has finished building.</p>`
        + `<p>Download it from your account (it is kept for 48 hours):</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
};

export function render(kind, vars = {}) {
  const tpl = TEMPLATES[kind];
  if (!tpl) throw new Error(`unknown email kind: ${kind}`);
  return tpl(vars);
}
