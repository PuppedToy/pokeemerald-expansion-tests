'use strict';

const { selectWithAutoFallback } = require('../../modules/trainerFallback');
const {
    TIER_MAGIKARP, TIER_ZU, TIER_PU, TIER_NU, TIER_RU, TIER_UU, TIER_OU, TIER_UBERS, TIER_AG,
} = require('../../constants');

const POKEMON = { id: 'SPECIES_BULBASAUR' };

// Helper: chooseFn that succeeds only for the given tier(s)
function chooserFor(...tiers) {
    return (def) => {
        if (!def.contextualTier) return null;
        return def.contextualTier.some(t => tiers.includes(t)) ? POKEMON : null;
    };
}

// Helper: chooseFn that always succeeds
const alwaysSucceeds = () => POKEMON;

// Helper: chooseFn that always fails
const alwaysFails = () => null;

// Helper: chooseFn that records calls
function spy(inner) {
    const calls = [];
    const fn = (def) => { calls.push(def); return inner(def); };
    fn.calls = calls;
    return fn;
}

// ── 1. Primary succeeds ───────────────────────────────────────────────────────

test('primary succeeds — returns result immediately', () => {
    const fn = spy(alwaysSucceeds);
    const result = selectWithAutoFallback({ contextualTier: [TIER_OU] }, fn);
    expect(result?.pokemon).toBe(POKEMON);
    expect(fn.calls).toHaveLength(1);
});

// ── 2. Auto-tier-down succeeds on first step ──────────────────────────────────

test('primary fails → auto-tier-down one step → succeeds', () => {
    const fn = spy(chooserFor(TIER_UU)); // only UU succeeds
    const result = selectWithAutoFallback({ contextualTier: [TIER_OU] }, fn);
    expect(result?.pokemon).toBe(POKEMON);
    // Called with OU (fails), then UU (succeeds)
    expect(fn.calls.map(d => d.contextualTier[0])).toEqual([TIER_OU, TIER_UU]);
});

// ── 3. Auto-tier-down exhausts all tiers → returns null ──────────────────────

test('primary fails → auto-tier-down exhausts all tiers → hard break (null)', () => {
    const result = selectWithAutoFallback({ contextualTier: [TIER_NU] }, alwaysFails);
    expect(result).toBeNull();
});

// ── 4. maxTierDownSteps:1 limits auto-tier-down ───────────────────────────────

test('maxTierDownSteps:1 — primary fails, T-1 fails → stops, does not try T-2', () => {
    // TIER_SEQ: MAGIKARP(0), ZU(1), PU(2), NU(3), RU(4) ...
    // Starting at NU (idx 3): 1 step down = PU (idx 2), 2 steps down = ZU (idx 1)
    const fn = spy(chooserFor(TIER_ZU)); // only ZU succeeds — 2 steps below NU
    const result = selectWithAutoFallback(
        { contextualTier: [TIER_NU], maxTierDownSteps: 1 },
        fn,
    );
    expect(result).toBeNull();
    // Should try NU and PU (1 step), but NOT ZU (2 steps)
    const tried = fn.calls.map(d => d.contextualTier[0]);
    expect(tried).toContain(TIER_NU);
    expect(tried).toContain(TIER_PU);
    expect(tried).not.toContain(TIER_ZU);
});

// ── 5. maxTierDownSteps:1 then falls through to explicit fallback ─────────────

test('maxTierDownSteps:1 → ability setter exhausted → explicit fallback succeeds', () => {
    const fn = spy((def) => def.contextualTier?.[0] === TIER_OU && def.moveFlag ? POKEMON : null);
    const def = {
        contextualTier: [TIER_OU],
        maxTierDownSteps: 1,
        fallback: [{
            contextualTier: [TIER_OU],
            moveFlag: true,
        }],
    };
    const result = selectWithAutoFallback(def, fn);
    expect(result?.pokemon).toBe(POKEMON);
    // Primary at OU (no moveFlag → fails), OU-1=UU (no moveFlag → fails), then fallback OU with moveFlag → succeeds
    const tries = fn.calls;
    expect(tries.some(d => d.moveFlag)).toBe(true);
});

// ── 6. Multi-tier defs skip auto-tier-down ────────────────────────────────────

test('multi-tier contextualTier — primary fails → no auto-tier-down, falls to explicit fallback', () => {
    const fn = spy((def) => {
        // Only single-tier RU def succeeds (to detect if auto-tier-down wrongly tried it)
        if (def.contextualTier?.length === 1 && def.contextualTier[0] === TIER_RU) return POKEMON;
        return null;
    });
    const def = {
        contextualTier: [TIER_OU, TIER_UBERS],  // multi-tier → no auto-tier-down
        fallback: [{ contextualTier: [TIER_RU] }],
    };
    const result = selectWithAutoFallback(def, fn);
    expect(result?.pokemon).toBe(POKEMON);
    // First call is multi-tier (should fail), second call is RU from explicit fallback
    expect(fn.calls[0].contextualTier).toEqual([TIER_OU, TIER_UBERS]);
    expect(fn.calls[1].contextualTier).toEqual([TIER_RU]);
    // No intermediate single-tier calls between them
    expect(fn.calls).toHaveLength(2);
});

// ── 7. Explicit fallback succeeds (no auto-tier-down needed for primary) ──────

test('primary fails → explicit fallback[0] succeeds immediately', () => {
    const fn = (def) => def.specialFlag ? POKEMON : null;
    const def = {
        contextualTier: [TIER_MAGIKARP], // floor — no auto-tier-down possible
        fallback: [{ contextualTier: [TIER_MAGIKARP], specialFlag: true }],
    };
    const result = selectWithAutoFallback(def, fn);
    expect(result?.pokemon).toBe(POKEMON);
});

// ── 8. Explicit fallback gets its own auto-tier-down ─────────────────────────

test('explicit fallback fails at its stated tier → fallback auto-tier-down succeeds', () => {
    const fn = chooserFor(TIER_PU); // only PU succeeds
    const def = {
        contextualTier: [TIER_OU], // primary and auto-tier-down all fail
        fallback: [{ contextualTier: [TIER_NU] }], // fallback at NU, auto-tiers down to PU
    };
    const result = selectWithAutoFallback(def, fn);
    expect(result?.pokemon).toBe(POKEMON);
});

// ── 9. Everything fails → returns null ───────────────────────────────────────

test('all attempts fail → returns null, no random fallback', () => {
    const def = {
        contextualTier: [TIER_ZU],
        fallback: [
            { contextualTier: [TIER_ZU] },
            { contextualTier: [TIER_ZU] },
        ],
    };
    const result = selectWithAutoFallback(def, alwaysFails);
    expect(result).toBeNull();
});

// ── 10. maxTierDownSteps is not inherited by auto-tier-down children ──────────

test('maxTierDownSteps is stripped from auto-tier-down children', () => {
    const fn = spy((def) => {
        // Succeed at NU only
        return def.contextualTier?.[0] === TIER_NU ? POKEMON : null;
    });
    // maxTierDownSteps:1 on OU: tries OU → UU (1 step). UU fails.
    // But NU is 2 steps below OU, so with maxTierDownSteps:1 it should NOT reach NU.
    const result = selectWithAutoFallback(
        { contextualTier: [TIER_OU], maxTierDownSteps: 1 },
        fn,
    );
    expect(result).toBeNull();
});

// ── 11. Def without contextualTier — no auto-tier-down ───────────────────────

test('definition without contextualTier — no auto-tier-down, falls straight to fallback', () => {
    const fn = spy((def) => def.specialFlag ? POKEMON : null);
    const def = {
        abilities: ['DRIZZLE'],
        fallback: [{ specialFlag: true }],
    };
    const result = selectWithAutoFallback(def, fn);
    expect(result?.pokemon).toBe(POKEMON);
    expect(fn.calls).toHaveLength(2); // primary + fallback, no auto-tier-down
});

// ── 12. effectiveDef is returned alongside the pokemon ───────────────────────

test('when primary succeeds, effectiveDef is the primary definition', () => {
    const def = { contextualTier: [TIER_OU] };
    const result = selectWithAutoFallback(def, alwaysSucceeds);
    expect(result?.pokemon).toBe(POKEMON);
    expect(result?.effectiveDef).toBe(def);
});

test('when explicit fallback fires, effectiveDef is the fallback definition not the primary', () => {
    const fallbackDef = { contextualTier: [TIER_PU], tryToHaveMove: ['MOVE_SUNNY_DAY'] };
    // fn succeeds only at PU — primary (MAGIKARP=floor, no auto-tier-down) fails → explicit fallback fires
    const fn = (def) => def.contextualTier?.[0] === TIER_PU ? POKEMON : null;
    const result = selectWithAutoFallback(
        { contextualTier: [TIER_MAGIKARP], fallback: [fallbackDef] },
        fn,
    );
    expect(result?.pokemon).toBe(POKEMON);
    expect(result?.effectiveDef).toBe(fallbackDef);
});
