'use strict';

// T-075 — the structured diagnostics sink. Replaces fire-and-forget console.warn/error
// during a randomization run with recorded events (code + severity + rich context) that
// can be shipped to the server and classified. It still mirrors to console by default so
// the Node pipeline and browser devtools keep their current visibility.

const { createDiagnostics, DIAGNOSTIC_CODES } = require('../../diagnostics');

// A fake console so we can assert mirroring without polluting test output.
function fakeConsole() {
    const warn = [];
    const error = [];
    return { warn: (...a) => warn.push(a), error: (...a) => error.push(a), _warn: warn, _error: error };
}

describe('createDiagnostics', () => {
    test('records warn/error/fatal events with code, severity, message and context', () => {
        const diag = createDiagnostics({ mirror: false });
        diag.warn('TRAINER_TEAM_SHORT', 'team short', { trainerId: 'A', expected: 6, actual: 5 });
        diag.error('TRAINER_SLOT_DROPPED', 'slot dropped', { trainerId: 'A', slotIndex: 5 });
        diag.fatal('BOOM', 'kaboom');

        const events = diag.all();
        expect(events).toHaveLength(3);
        expect(events[0]).toMatchObject({
            seq: 0, severity: 'warning', code: 'TRAINER_TEAM_SHORT', message: 'team short',
            context: { trainerId: 'A', expected: 6, actual: 5 },
        });
        expect(events[1]).toMatchObject({ seq: 1, severity: 'error', code: 'TRAINER_SLOT_DROPPED' });
        expect(events[2]).toMatchObject({ seq: 2, severity: 'fatal', code: 'BOOM', context: null });
    });

    test('counts() tallies by severity', () => {
        const diag = createDiagnostics({ mirror: false });
        diag.warn('A', 'a');
        diag.warn('B', 'b');
        diag.error('C', 'c');
        diag.fatal('D', 'd');
        expect(diag.counts()).toEqual({ fatal: 1, error: 1, warning: 2 });
    });

    test('all() returns a copy — mutating it does not corrupt the sink', () => {
        const diag = createDiagnostics({ mirror: false });
        diag.warn('A', 'a');
        const snapshot = diag.all();
        snapshot.push({ bogus: true });
        expect(diag.all()).toHaveLength(1);
    });

    test('mirror:true forwards to console (warn→warn, error/fatal→error)', () => {
        const con = fakeConsole();
        const diag = createDiagnostics({ mirror: true, console: con });
        diag.warn('W', 'w-msg');
        diag.error('E', 'e-msg');
        diag.fatal('F', 'f-msg');
        expect(con._warn).toHaveLength(1);
        expect(con._error).toHaveLength(2);
        expect(con._warn[0].join(' ')).toContain('W');
        expect(con._warn[0].join(' ')).toContain('w-msg');
    });

    test('mirror:false stays silent', () => {
        const con = fakeConsole();
        const diag = createDiagnostics({ mirror: false, console: con });
        diag.warn('W', 'w');
        diag.error('E', 'e');
        expect(con._warn).toHaveLength(0);
        expect(con._error).toHaveLength(0);
    });

    test('cap bounds retained events but counts() still tallies everything', () => {
        const diag = createDiagnostics({ mirror: false, cap: 2 });
        diag.warn('A', '1');
        diag.warn('A', '2');
        diag.warn('A', '3');
        expect(diag.all()).toHaveLength(2);          // only first `cap` retained
        expect(diag.counts()).toEqual({ fatal: 0, error: 0, warning: 3 }); // all counted
    });

    test('exposes the shared DIAGNOSTIC_CODES catalog including the degraded-team codes', () => {
        expect(DIAGNOSTIC_CODES).toEqual(expect.objectContaining({
            TRAINER_SLOT_DROPPED: 'TRAINER_SLOT_DROPPED',
            TRAINER_TEAM_SHORT: 'TRAINER_TEAM_SHORT',
        }));
    });
});
