'use strict';

// T-075 — structured diagnostics sink for a randomization run.
//
// The randomizer runs in a Web Worker: its console.warn/console.error land in devtools
// only, so degraded outcomes (a trainer team dropping a slot, a starter fallback, …) are
// invisible and unrecoverable. This sink records each such event as { code, severity,
// message, context } so the worker can ship them to the server (POST /api/diagnostics)
// and the local audit tool can classify them.
//
// It still mirrors to console by default, so the Node pipeline (analyze.js / make.js) and
// browser devtools keep exactly the visibility they have today — this is additive.
//
// CommonJS to match the rest of randomizer/ (bundled for the browser by build.js).

// Single home of the diagnostic codes, shared by the emitters, the tests, the audit doc
// (docs/randomizer-diagnostics.md) and the local scan tool. Add a code here when you add
// an emission point; document its context fields in the audit doc.
const DIAGNOSTIC_CODES = {
    // Trainer team building (writerDocs.js) — the accepted "team of 5" degradation.
    TRAINER_SLOT_DROPPED: 'TRAINER_SLOT_DROPPED',   // a single slot found no pokemon (all fallbacks exhausted)
    TRAINER_TEAM_SHORT: 'TRAINER_TEAM_SHORT',       // the finished team has fewer mons than its definition
    // Starters (startersModule.js).
    STARTER_FALLBACK: 'STARTER_FALLBACK',           // no valid starter type-triangle; unconstrained fallback used
    // Evolution / mega resolution (modules/utils.js).
    MEGA_NO_BASE_FORM: 'MEGA_NO_BASE_FORM',         // could not find a mega's base form when checking evolutions
    MULTIPLE_PRE_EVOLUTIONS: 'MULTIPLE_PRE_EVOLUTIONS', // ambiguous pre-evolution during devolution
    // Moveset / rating (rating.js) — only recorded when reachable from a browser run.
    MOVE_NOT_FOUND: 'MOVE_NOT_FOUND',               // a move id was not found in the moves database
    ROLE_UNKNOWN: 'ROLE_UNKNOWN',                   // an unknown battle role fell back to a balanced rating
};

const SEVERITY = { WARNING: 'warning', ERROR: 'error', FATAL: 'fatal' };

// Create a sink. `mirror` re-emits to console (default on); `cap` bounds retained events
// (counts() still tallies everything); `console` is injectable for tests.
function createDiagnostics({ mirror = true, cap = 1000, console: con = console } = {}) {
    const events = [];
    const counts = { fatal: 0, error: 0, warning: 0 };
    let seq = 0;

    function push(severity, code, message, context) {
        counts[severity] += 1;
        if (events.length < cap) {
            events.push({ seq, severity, code, message, context: context === undefined ? null : context });
        }
        seq += 1;
        if (mirror) {
            const line = `[${severity.toUpperCase()}][${code}] ${message}`;
            if (severity === SEVERITY.WARNING) {
                if (context === undefined) con.warn(line); else con.warn(line, context);
            } else if (context === undefined) {
                con.error(line);
            } else {
                con.error(line, context);
            }
        }
    }

    return {
        warn: (code, message, context) => push(SEVERITY.WARNING, code, message, context),
        error: (code, message, context) => push(SEVERITY.ERROR, code, message, context),
        fatal: (code, message, context) => push(SEVERITY.FATAL, code, message, context),
        all: () => events.slice(),
        counts: () => ({ ...counts }),
    };
}

// A no-op sink for code paths that may run without diagnostics wired (tests, the ROM-write
// path). Same shape as a real sink so callers never branch on its presence.
const NOOP = {
    warn: () => {}, error: () => {}, fatal: () => {},
    all: () => [], counts: () => ({ fatal: 0, error: 0, warning: 0 }),
};
function noopDiagnostics() { return NOOP; }

// ── Ambient sink ────────────────────────────────────────────────────────────────
// Deep helpers (modules/utils.js, rating.js, …) emit warnings far below the generation
// entry point; threading a sink through every signature would be noisy. Instead the entry
// point (generate.js → runGeneration) sets an ambient sink for the duration of ONE run and
// clears it in a finally. Generation is single-run (one Web Worker message / one Node
// pipeline invocation at a time), so there is no interleaving. Unset → NOOP, so a helper
// called outside a run (or in a unit test) records nothing and never throws.
let _active = null;
function setActiveDiagnostics(diag) { _active = diag || null; }
function clearActiveDiagnostics() { _active = null; }
function activeDiagnostics() { return _active || NOOP; }

module.exports = {
    createDiagnostics, noopDiagnostics, DIAGNOSTIC_CODES, SEVERITY,
    setActiveDiagnostics, clearActiveDiagnostics, activeDiagnostics,
};
