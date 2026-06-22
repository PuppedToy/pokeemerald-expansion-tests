import { test } from 'node:test';
import assert from 'node:assert/strict';

import { render } from '../email/templates.js';
import { createRateLimiter } from '../email/rateLimiter.js';
import { createMailer } from '../email/index.js';

// A mock transport that records every send and can be told to fail.
function mockTransport({ fail = false } = {}) {
  const sent = [];
  return {
    sent,
    async send(msg) {
      if (fail) throw new Error('provider down');
      sent.push(msg);
      return { id: `mock-${sent.length}` };
    },
  };
}

const SITE = 'https://emerald.test';

test('render produces distinct subjects per kind and embeds the link', () => {
  const verify = render('verify', { link: `${SITE}/verify?t=abc` });
  const reset = render('reset', { link: `${SITE}/reset?t=xyz` });
  const ready = render('ready', { link: `${SITE}/me` });

  assert.notEqual(verify.subject, reset.subject);
  assert.notEqual(reset.subject, ready.subject);
  assert.match(verify.html, /verify\?t=abc/);
  assert.match(reset.text, /reset\?t=xyz/);
});

test('ready mail links back to the site and never attaches the ROM', () => {
  const ready = render('ready', { link: `${SITE}/me` });
  assert.match(ready.html + ready.text, /emerald\.test\/me/);
  assert.equal(ready.attachments ?? undefined, undefined, 'no attachments on ready mail');
});

test('render throws on an unknown kind', () => {
  assert.throws(() => render('nope', {}), /unknown.*kind/i);
});

test('sendMail renders and forwards to the transport', async () => {
  const transport = mockTransport();
  const mailer = createMailer({ transport, limiter: createRateLimiter({ max: 100, windowMs: 1000 }) });

  const res = await mailer.sendMail('verify', 'u@x.test', { link: `${SITE}/verify?t=1` });

  assert.equal(res.ok, true);
  assert.equal(transport.sent.length, 1);
  assert.equal(transport.sent[0].to, 'u@x.test');
  assert.match(transport.sent[0].html, /verify\?t=1/);
});

test('per-recipient rate limiting suppresses over-limit sends', async () => {
  const transport = mockTransport();
  let t = 0;
  const limiter = createRateLimiter({ max: 2, windowMs: 1000, now: () => t });
  const mailer = createMailer({ transport, limiter, now: () => t });

  await mailer.sendMail('verify', 'u@x.test', { link: SITE });
  await mailer.sendMail('verify', 'u@x.test', { link: SITE });
  const third = await mailer.sendMail('verify', 'u@x.test', { link: SITE });

  assert.equal(third.ok, false);
  assert.match(third.reason, /rate/i);
  assert.equal(transport.sent.length, 2, 'transport not called when rate-limited');

  // a different recipient is unaffected
  const other = await mailer.sendMail('verify', 'other@x.test', { link: SITE });
  assert.equal(other.ok, true);
});

test('a transport failure is caught and never throws (graceful degradation)', async () => {
  const transport = mockTransport({ fail: true });
  const mailer = createMailer({ transport, limiter: createRateLimiter({ max: 100, windowMs: 1000 }) });

  let res;
  await assert.doesNotReject(async () => { res = await mailer.sendMail('ready', 'u@x.test', { link: SITE }); });
  assert.equal(res.ok, false);
  assert.match(res.reason, /provider down|send failed/i);
});
