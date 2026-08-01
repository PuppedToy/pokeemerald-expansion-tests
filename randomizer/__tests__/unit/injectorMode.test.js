// T-238 — the compile-vs-inject switch. Phase 3 migrates one module at a time; every step must be
// reversible in one env var, so exactly ONE function decides how a ROM gets built, and its default is
// the old, proven path (compile).
const { resolveBuildMode, BUILD_MODES, isInjectMode } = require('../../injector/mode');

describe('resolveBuildMode (T-238)', () => {
    test('defaults to compile — injection is opt-in until parity is proven', () => {
        expect(resolveBuildMode({ env: {}, argv: [] })).toBe('compile');
        expect(BUILD_MODES).toEqual({ COMPILE: 'compile', INJECT: 'inject' });
    });

    test('ROM_BUILD_MODE selects the mode (the one knob to flip on the box)', () => {
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'inject' }, argv: [] })).toBe('inject');
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'compile' }, argv: [] })).toBe('compile');
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'INJECT' }, argv: [] })).toBe('inject');
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: '  inject  ' }, argv: [] })).toBe('inject');
    });

    test('an explicit CLI flag beats the environment (rollback without touching the env)', () => {
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: 'inject' }, argv: ['--compile'] })).toBe('compile');
        expect(resolveBuildMode({ env: {}, argv: ['--inject'] })).toBe('inject');
    });

    test('an unknown mode is a hard error, never a silent fallback to compile', () => {
        expect(() => resolveBuildMode({ env: { ROM_BUILD_MODE: 'patch' }, argv: [] })).toThrow(/patch[\s\S]*compile[\s\S]*inject|invalid/i);
    });

    test('an empty ROM_BUILD_MODE is treated as unset', () => {
        expect(resolveBuildMode({ env: { ROM_BUILD_MODE: '' }, argv: [] })).toBe('compile');
    });

    test('isInjectMode is the boolean the build path branches on', () => {
        expect(isInjectMode({ env: {}, argv: [] })).toBe(false);
        expect(isInjectMode({ env: { ROM_BUILD_MODE: 'inject' }, argv: [] })).toBe(true);
    });

    test('reads the real process env by default', () => {
        const prev = process.env.ROM_BUILD_MODE;
        delete process.env.ROM_BUILD_MODE;
        try {
            expect(resolveBuildMode()).toBe('compile');
        } finally {
            if (prev === undefined) delete process.env.ROM_BUILD_MODE; else process.env.ROM_BUILD_MODE = prev;
        }
    });
});
