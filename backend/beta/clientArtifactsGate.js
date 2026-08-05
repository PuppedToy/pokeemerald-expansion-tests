/**
 * The beta gate for the client-injection artifacts (`/client/`) — T-249.
 *
 * Those artifacts (`base.bps` + the injector's offsets and baked sources) are everything a browser needs
 * to build its own ROMs, and that path never reaches `handleProduce`: no request row, no queue, no email.
 * The invite gate lives in `handleProduce`, so serving the artifacts unguarded while BETA is on would let
 * any registered user flip `?clientInject=1` and build without an invite.
 *
 * Same rule as building, therefore: verified account with an **accepted** invite, or BETA off.
 *
 * **This is a signal, not a lock, and the difference matters.** `base.bps` is a function of the base build
 * alone — byte-identical for every user and every run — so one copy shared outside the beta serves everyone
 * indefinitely. (Today's per-run patches are shareable too, but each one only reproduces its own run.) The
 * gate stops the casual bypass; it cannot stop redistribution, and nothing that assumes otherwise should be
 * built on top of it.
 *
 * Refusals are plain 401/403 JSON on purpose: `client-inject.js` reads any non-ok manifest response as
 * "this deployment offers no client injection" and `account.js` falls back to the server queue, so a
 * refused user still gets their ROMs — just built on the box.
 */

import { verifyJwt } from '../auth/jwt.js';

/**
 * @param {object}  deps
 * @param {boolean} deps.beta       BETA env flag — when off, the artifacts are public
 * @param {object}  deps.users      users repo (`get(id)`)
 * @param {string}  deps.jwtSecret
 * @returns {Function} express middleware
 */
export function createClientArtifactsGate({ beta = false, users, jwtSecret }) {
    return (req, res, next) => {
        if (!beta) return next();

        const match = /^Bearer (.+)$/.exec(req.headers?.authorization || '');
        if (!match) return res.status(401).json({ error: 'missing token' });

        let userId;
        try {
            userId = verifyJwt(match[1], jwtSecret).sub;
        } catch {
            return res.status(401).json({ error: 'invalid token' });
        }

        const user = users?.get(userId);
        if (!user || !user.verified) return res.status(403).json({ error: 'email not verified' });
        if (user.invite_state !== 'accepted') return res.status(403).json({ error: 'beta invite required' });

        req.userId = userId;
        return next();
    };
}
