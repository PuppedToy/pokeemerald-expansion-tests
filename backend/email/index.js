/**
 * Mailer (T-027, ADR-007). createMailer({ transport, limiter }) → sendMail(kind, to, vars).
 * Renders the template, applies the per-recipient rate limit, hands off to the transport,
 * and — crucially — NEVER throws to the caller: a send failure returns { ok:false, reason }
 * and logs, so a build or download still completes if email is down (graceful degradation).
 */

import { render } from './templates.js';

export function createMailer({ transport, limiter, now = () => Date.now(), logger = console }) {
  return {
    async sendMail(kind, to, vars = {}) {
      if (limiter && !limiter.allow(to)) {
        return { ok: false, reason: 'rate-limited' };
      }

      let msg;
      try {
        const { subject, html, text } = render(kind, vars);
        msg = { to, subject, html, text };
      } catch (err) {
        return { ok: false, reason: `render failed: ${err.message}` };
      }

      try {
        const result = await transport.send(msg);
        return { ok: true, id: result?.id };
      } catch (err) {
        logger.error?.(`email send failed (${kind} -> ${to}) @ ${now()}: ${err.message}`);
        return { ok: false, reason: err.message || 'send failed' };
      }
    },
  };
}

export { render } from './templates.js';
export { createRateLimiter } from './rateLimiter.js';
export { brevoTransport } from './transport.js';
