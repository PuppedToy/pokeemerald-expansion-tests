// T-238 — the compile-vs-inject switch. Phase 3 migrated one module at a time behind one env var, with the
// old proven path (compile) as the default.
//
// T-244 **inverted the default**: injection delivers every ROM, and compile survives only as the reference
// GATE-3 measures injection against. The spec these tests pin is therefore the opposite of T-238's, plus a
// new property that matters more than the default itself: no *absence* of configuration can select compile,
// and an explicit `--inject` overrides a compile env (which is how the delivery path immunises itself
// against a stale ROM_BUILD_MODE on the box — see backend/build/buildRom.js).
const { resolveBuildMode, BUILD_MODES, isInjectMode, isCompileExplicitlyRequested } = require('../../injector/mode');

describe('resolveBuildMode (T-238, inverted by T-244)', () => {
    test('defaults to inject — the compile path is never reached by omission', () => {
        expect(resolveBuildMode({ env: {}, argv: [] })).toBe('inject');
        expect(BUILD_MODES).toEqual({ COMPILE: 'compile', INJECT: 'inject' });
    });

    test('ROM_BUILD_MODE selects the mode (the one knob the gate flips)', () => {
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'inject' }, argv: [] })).toBe('inject');
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'compile' }, argv: [] })).toBe('compile');
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'COMPILE' }, argv: [] })).toBe('compile');
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: '  compile  ' }, argv: [] })).toBe('compile');
    });

    test('an explicit CLI flag beats the environment, in both directions', () => {
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'inject' }, argv: ['--compile'] })).toBe('compile');
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'compile' }, argv: ['--inject'] })).toBe('inject');
        expect(resolveBuildMode({ env: {}, argv: ['--inject'] })).toBe('inject');
    });

    test('an unknown mode is a hard error, never a silent fallback to either pipeline', () => {
        expect(() => resolveBuildMode({ env: { ROM_BUILD_MODE: 'patch' }, argv: [] })).toThrow(/patch[\s\S]*compile[\s\S]*inject|invalid/i);
    });

    test('an empty ROM_BUILD_MODE is treated as unset', () => {
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: '' }, argv: [] })).toBe('inject');
    });

    test('isInjectMode is the boolean the build path branches on', () => {
        expect(isInjectMode({ env: {}, argv: [] })).toBe(true);
        expect(isInjectMode({ env: { ROM_BUILD_MODE: 'compile' }, argv: [] })).toBe(false);
    });

    test('reads the real process env by default', () => {
        const prev = process.env.ROM_BUILD_MODE;
        delete process.env.ROM_BUILD_MODE;
        try {
            expect(resolveBuildMode({ argv: [] })).toBe('inject');
        } finally {
            if (prev === undefined) delete process.env.ROM_BUILD_MODE; else process.env.ROM_BUILD_MODE = prev;
        }
    });
});

// The quarantine guard (T-244). compileOneRom starts a 4-minute `make`, so it may only run when someone
// asked for the compile path *by name*. "No mode configured" must read as false here even though
// resolveBuildMode has a default — that difference is the whole point.
describe('isCompileExplicitlyRequested (T-244)', () => {
    test('an unconfigured environment is not a request for the compile path', () => {
        expect(isCompileExplicitlyRequested({ env: {}, argv: [] })).toBe(false);
        expect(isCompileExplicitlyRequested({ env: { ROM_BUILD_MODE: '' }, argv: ['--bundle=x.json'] })).toBe(false);
        expect(isCompileExplicitlyRequested({ env: {}, argv: ['--inject'] })).toBe(false);
    });

    test('the flag and the env var each count as asking by name', () => {
        expect(isCompileExplicitlyRequested({ env: {}, argv: ['--compile'] })).toBe(true);
        expect(isCompileExplicitlyRequested({ env: { ROM_BUILD_MODE: 'compile' }, argv: [] })).toBe(true);
        expect(isCompileExplicitlyRequested({ env: { buildMode: 'compile' }, argv: [], config: { buildMode: 'compile' } })).toBe(true);
    });

    test('--inject wins, so the delivery path can never be talked into compiling', () => {
        expect(isCompileExplicitlyRequested({ env: { ROM_BUILD_MODE: 'compile' }, argv: ['--inject'] })).toBe(false);
    });
});
