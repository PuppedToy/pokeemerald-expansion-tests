/**
 * T-249 / T-253 — the client-injection artifacts are behind the beta gate.
 *
 * `/client/` serves `base.bps` + the injector's inputs, which is everything a browser needs to build its
 * own ROMs. That path bypasses `handleProduce` entirely (no request row, no queue), so while BETA is on it
 * would also bypass the invite gate that lives there: any registered user could flip `?clientInject=1` and
 * build without an invite — on a code path whose memory ceiling is still unmeasured on phones (T-253).
 *
 * So the artifacts are gated the same way building is: accepted invite, or BETA off. This is deliberately
 * **best-effort** and not a lock — `base.bps` is identical for every user and every run, so one shared copy
 * serves everyone forever. It stops the casual bypass, which during a closed beta is what it is for.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createClientArtifactsGate } from '../beta/clientArtifactsGate.js';
import { signJwt } from '../auth/jwt.js';

const SECRET = 'test-secret';

function fakeRes() {
  return {
    statusCode: 200, body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

/** A users repo holding exactly the rows the test names. */
const usersWith = (rows) => ({ get: (id) => rows[id] || null });

const run = (gate, req) => {
    const res = fakeRes();
    let passed = false;
    gate(req, res, () => { passed = true; });
    return { passed, res };
};

const bearer = (userId) => ({ headers: { authorization: `Bearer ${signJwt({ sub: userId }, SECRET)}` } });

test('BETA off — the artifacts are public, nothing to gate', () => {
    const gate = createClientArtifactsGate({ beta: false, users: usersWith({}), jwtSecret: SECRET });
    const { passed } = run(gate, { headers: {} });
    assert.equal(passed, true);
});

test('BETA on — an accepted invite gets through', () => {
    const users = usersWith({ u1: { verified: 1, invite_state: 'accepted' } });
    const gate = createClientArtifactsGate({ beta: true, users, jwtSecret: SECRET });
    const { passed } = run(gate, bearer('u1'));
    assert.equal(passed, true);
});

test('BETA on — a registered but not-yet-invited user is refused', () => {
    const users = usersWith({ u2: { verified: 1, invite_state: 'pending' } });
    const gate = createClientArtifactsGate({ beta: true, users, jwtSecret: SECRET });
    const { passed, res } = run(gate, bearer('u2'));
    assert.equal(passed, false);
    assert.equal(res.statusCode, 403);
});

test('BETA on — an unverified account is refused even with an invite', () => {
    const users = usersWith({ u3: { verified: 0, invite_state: 'accepted' } });
    const gate = createClientArtifactsGate({ beta: true, users, jwtSecret: SECRET });
    const { passed, res } = run(gate, bearer('u3'));
    assert.equal(passed, false);
    assert.equal(res.statusCode, 403);
});

test('BETA on — anonymous is refused', () => {
    const gate = createClientArtifactsGate({ beta: true, users: usersWith({}), jwtSecret: SECRET });
    const { passed, res } = run(gate, { headers: {} });
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
});

test('BETA on — a forged or expired token is refused, not trusted', () => {
    const users = usersWith({ u1: { verified: 1, invite_state: 'accepted' } });
    const gate = createClientArtifactsGate({ beta: true, users, jwtSecret: SECRET });
    const { passed, res } = run(gate, { headers: { authorization: 'Bearer not.a.jwt' } });
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
});

test('BETA on — a token signed with another secret is refused', () => {
    const users = usersWith({ u1: { verified: 1, invite_state: 'accepted' } });
    const gate = createClientArtifactsGate({ beta: true, users, jwtSecret: SECRET });
    const req = { headers: { authorization: `Bearer ${signJwt({ sub: 'u1' }, 'other-secret')}` } };
    const { passed, res } = run(gate, req);
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
});

test('a refusal is a plain status the browser can read as "not offered"', () => {
    // client-inject.js turns any non-ok manifest response into null, which account.js reads as "this
    // deployment has no client injection" and falls back to the server queue. The gate must therefore
    // refuse with a status, never by throwing or hanging.
    const users = usersWith({ u2: { verified: 1, invite_state: 'pending' } });
    const gate = createClientArtifactsGate({ beta: true, users, jwtSecret: SECRET });
    const { res } = run(gate, bearer('u2'));
    assert.ok(res.statusCode >= 400 && res.statusCode < 500);
    assert.ok(res.body && typeof res.body.error === 'string');
});
