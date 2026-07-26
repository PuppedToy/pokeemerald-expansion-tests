/**
 * Email templates (T-027, ADR-007). Pure render(kind, vars) → {subject, html, text}.
 * The `ready` mail links back to the site (the patch is downloaded there); it never
 * attaches anything (32 MB attachments are unreliable). All copy speaks of "patch files",
 * not ROMs (T-222).
 */

const SITE_NAME = 'Pokémon Emerald Cut';

const TEMPLATES = {
  verify: ({ link }) => ({
    subject: `${SITE_NAME} — confirm your email`,
    text: `Welcome to ${SITE_NAME}.\nConfirm your email to start generating patches:\n${link}\n`,
    html: `<p>Welcome to ${SITE_NAME}.</p>`
        + `<p>Confirm your email to start generating patches:</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
  reset: ({ link }) => ({
    subject: `${SITE_NAME} — reset your password`,
    text: `Reset your ${SITE_NAME} password (this link expires):\n${link}\n`,
    html: `<p>Reset your ${SITE_NAME} password (this link expires):</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
  ready: ({ link }) => ({
    subject: `${SITE_NAME} — your patch is ready`,
    text: `Your patch is ready. Download it from your account (kept for 48 h):\n${link}\n`,
    html: `<p>Your patch is ready.</p>`
        + `<p>Download it from your account (it is kept for 48 hours):</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
  // T-216 beta — immediate "you're in" mail for an invited user who had NOT prepared a run yet.
  welcome: ({ link }) => ({
    subject: `${SITE_NAME} — you're in! Start generating your patch`,
    text: `You're in the ${SITE_NAME} beta!\n`
        + `Head to the randomizer, set up your run and generate your patch:\n${link}\n`,
    html: `<p>You're in the ${SITE_NAME} beta!</p>`
        + `<p>Head to the randomizer, set up your run and generate your patch:</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
  // T-216 beta — combined "you're in" + "your patch is ready" mail, sent once at generation completion for
  // a user who had a run prepared (held `pending`) when their invite landed. One mail, not two.
  welcomeReady: ({ link }) => ({
    subject: `${SITE_NAME} — you're in, and your patch is ready`,
    text: `You're in the ${SITE_NAME} beta — and the patch you prepared has finished generating.\n`
        + `Download it from your account (kept for 48 h):\n${link}\n`,
    html: `<p>You're in the ${SITE_NAME} beta — and the patch you prepared has finished generating.</p>`
        + `<p>Download it from your account (it is kept for 48 hours):</p>`
        + `<p><a href="${link}">${link}</a></p>`,
  }),
};

export function render(kind, vars = {}) {
  const tpl = TEMPLATES[kind];
  if (!tpl) throw new Error(`unknown email kind: ${kind}`);
  return tpl(vars);
}
