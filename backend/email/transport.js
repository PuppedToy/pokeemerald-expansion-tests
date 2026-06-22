/**
 * Email transport (T-027, ADR-007). The mailer is decoupled from the provider
 * behind a `send({to,subject,html,text})` interface so the unit is testable with
 * a mock. The real Brevo transport (free tier, zero cost) posts JSON to its API
 * with `fetch` (no new dependency); the API key + sender DNS (SPF/DKIM) are
 * supplied at deploy (T-019), which is where a live send is confirmed.
 */

export function brevoTransport({ apiKey, sender, fetchImpl = fetch }) {
  return {
    async send({ to, subject, html, text }) {
      const res = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender,                 // { name, email }
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      if (!res.ok) {
        throw new Error(`brevo send failed: HTTP ${res.status}`);
      }
      return res.json().catch(() => ({}));
    },
  };
}
