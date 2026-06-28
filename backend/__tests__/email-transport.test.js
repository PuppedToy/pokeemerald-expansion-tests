import { test } from 'node:test';
import assert from 'node:assert/strict';

import { brevoTransport } from '../email/transport.js';

test('brevoTransport posts the Brevo v3 transactional shape', async () => {
  let captured;
  const fetchImpl = async (url, opts) => { captured = { url, opts }; return { ok: true, json: async () => ({ messageId: 'm1' }) }; };
  const t = brevoTransport({ apiKey: 'KEY123', sender: { name: 'Emerald Cut', email: 'no-reply@x.test' }, fetchImpl });

  const res = await t.send({ to: 'u@x.test', subject: 'Hi', html: '<b>h</b>', text: 'h' });

  assert.equal(captured.url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(captured.opts.method, 'POST');
  assert.equal(captured.opts.headers['api-key'], 'KEY123');
  assert.equal(captured.opts.headers['content-type'], 'application/json');
  const body = JSON.parse(captured.opts.body);
  assert.deepEqual(body.to, [{ email: 'u@x.test' }]);
  assert.deepEqual(body.sender, { name: 'Emerald Cut', email: 'no-reply@x.test' });
  assert.equal(body.subject, 'Hi');
  assert.equal(body.htmlContent, '<b>h</b>');
  assert.equal(body.textContent, 'h');
  assert.equal(res.messageId, 'm1');
});

test('brevoTransport throws on a non-ok response (mailer then degrades gracefully)', async () => {
  const t = brevoTransport({ apiKey: 'K', sender: {}, fetchImpl: async () => ({ ok: false, status: 401 }) });
  await assert.rejects(() => t.send({ to: 'u@x.test', subject: 's' }), /HTTP 401/);
});
