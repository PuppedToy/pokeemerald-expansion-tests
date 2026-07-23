'use strict';

// T-193 — monotype defensive-coverage helpers.
//
// Strict-monotype teams (gym leaders + Elite Four, `trainer.types.length === 1`) get a per-slot
// "interest bonus" for members whose SECONDARY TYPE or ABILITY patches a weakness of the team's mono
// type: immunities first (top priority), then resistances/neutralities. This module is the pure core —
// no RNG state, no generation side-effects; the seeded per-slot roll lives in the picker.
//
// The TYPING half is derived from the canonical `damageMultiplier` (rating.js SSOT) — injected as `dmg`
// so this module never re-declares the type chart. Only the ability→type mapping is hardcoded, because
// abilities.json carries no structured immunity/resistance data (it is free-text descriptions).

const { POKEMON_TYPES } = require('../constants');
const { usesStrategicAbility } = require('./utils');

// Abilities that turn an incoming type into a full immunity (×0). † DRY_SKIN also ADDS +25% Fire
// damage — it still grants the Water immunity, so it is listed, but callers should be aware of the
// Fire downside. Wind Rider / Bulletproof / Overcoat are move-flag/weather based (not a whole type)
// and are deliberately excluded.
const TYPE_IMMUNITY_ABILITIES = {
    GROUND:   ['LEVITATE', 'EARTH_EATER'],
    ELECTRIC: ['VOLT_ABSORB', 'LIGHTNING_ROD', 'MOTOR_DRIVE'],
    WATER:    ['WATER_ABSORB', 'STORM_DRAIN', 'DRY_SKIN'],
    FIRE:     ['FLASH_FIRE', 'WELL_BAKED_BODY'],
    GRASS:    ['SAP_SIPPER'],
};

// Abilities that halve incoming damage of a type (×0.5) — enough to bring a 2× weakness down to
// neutral. Deliberately EXCLUDES the super-effective softeners (Filter/Solid Rock/Prism Armor, ×0.75 →
// a 2× stays 1.5×, still a weakness), Multiscale (HP-conditional, all types), and Fluffy (contact-flag
// based and DOUBLES Fire).
const TYPE_RESIST_ABILITIES = {
    FIRE:  ['THICK_FAT', 'HEATPROOF', 'WATER_BUBBLE'],
    ICE:   ['THICK_FAT'],
    GHOST: ['PURIFYING_SALT'],
};

// The threat types a pure `baseType` mon is weak to (>1×), in POKEMON_TYPES order.
function monotypeWeaknesses(baseType, dmg) {
    return POKEMON_TYPES.filter(w => dmg(w, [baseType]) > 1);
}

// The abilities on `candidate` that are actually ASSIGNABLE at `level` — index 2 (hidden) is dropped
// below the strategic level, mirroring pickTrainerMonAbility (trainerAbility.js).
function assignableAbilities(candidate, level) {
    const abilities = candidate.parsedAbilities || [];
    return usesStrategicAbility(level) ? abilities : abilities.slice(0, 2);
}

// The specific assignable ability that grants `kind` ('immunity' | 'resist') coverage vs `threatType`,
// or null. Callers force this ability via the preferredAbilities channel when they pick the candidate.
function coverageAbilityFor(candidate, threatType, level, kind) {
    const table = kind === 'immunity' ? TYPE_IMMUNITY_ABILITIES : TYPE_RESIST_ABILITIES;
    const granting = table[threatType];
    if (!granting) return null;
    return assignableAbilities(candidate, level).find(a => granting.includes(a)) || null;
}

// Does `candidate` (already a member of the mono type) become IMMUNE (×0) to `threatType`, either by
// its full typing or by an assignable immunity ability?
function providesImmunity(candidate, threatType, dmg, level) {
    if (dmg(threatType, candidate.parsedTypes) === 0) return true;
    return coverageAbilityFor(candidate, threatType, level, 'immunity') !== null;
}

// Does `candidate` reach neutral-or-better (≤1×) vs `threatType`, by typing or by an assignable ×0.5
// ability applied on top of its typing?
function providesResist(candidate, threatType, dmg, level) {
    const base = dmg(threatType, candidate.parsedTypes);
    if (base <= 1) return true;
    return coverageAbilityFor(candidate, threatType, level, 'resist') !== null && base * 0.5 <= 1;
}

// ── Team-level coverage (placed members: { pokemon, ability } wrappers, or bare pokes) ──────────────
const memberTypes = m => ((m && m.pokemon) || m).parsedTypes || [];
const memberAbility = m => (m && m.ability) || null;

function teamImmuneTo(team, threatType, dmg) {
    return (team || []).some(m =>
        dmg(threatType, memberTypes(m)) === 0
        || (TYPE_IMMUNITY_ABILITIES[threatType] || []).includes(memberAbility(m)));
}

function teamResistsTo(team, threatType, dmg) {
    return (team || []).some(m => {
        const base = dmg(threatType, memberTypes(m));
        if (base <= 1) return true;
        return (TYPE_RESIST_ABILITIES[threatType] || []).includes(memberAbility(m)) && base * 0.5 <= 1;
    });
}

// Is an immunity to `threatType` achievable at all — by some defending type (×0) or a listed ability?
// Threats with neither (ICE/BUG/ROCK/STEEL/FLYING/FAIRY/DARK) can only ever be handled in the resist
// round, so they are not "immunity" gaps.
function immunityAchievable(threatType, dmg) {
    return !!TYPE_IMMUNITY_ABILITIES[threatType] || POKEMON_TYPES.some(S => dmg(threatType, [S]) === 0);
}

// Weaknesses of `baseType` for which an immunity is achievable but the current `team` has no immune
// member yet.
function uncoveredImmunities(baseType, team, dmg) {
    return monotypeWeaknesses(baseType, dmg).filter(w => immunityAchievable(w, dmg) && !teamImmuneTo(team, w, dmg));
}
function uncoveredResists(baseType, team, dmg) {
    return monotypeWeaknesses(baseType, dmg).filter(w => !teamResistsTo(team, w, dmg));
}

// Auto-include probability = (150% for immunities | 90% for resistances) × current sophistication,
// capped at 1.
function autoIncludeProbability(kind, soph) {
    const s = Math.max(0, Math.min(1, soph || 0));
    const factor = kind === 'immunity' ? 1.5 : 0.9;
    return Math.min(1, factor * s);
}

// Why a coverage candidate qualifies: the threat it patches and, when the patch comes from an ABILITY
// (not its typing), the ability that must be forced. Prefers a typing-based patch (ability: null) so we
// only force an ability when the typing alone doesn't cover the threat.
function coverageReasonFor(candidate, uncoveredList, dmg, level, kind) {
    const test = kind === 'immunity' ? providesImmunity : providesResist;
    let abilityThreat = null;
    let abilityName = null;
    for (const w of uncoveredList || []) {
        if (!test(candidate, w, dmg, level)) continue;
        const base = dmg(w, candidate.parsedTypes);
        const typingCovers = kind === 'immunity' ? base === 0 : base <= 1;
        if (typingCovers) return { threat: w, ability: null };
        if (!abilityThreat) { abilityThreat = w; abilityName = coverageAbilityFor(candidate, w, level, kind); }
    }
    return abilityThreat ? { threat: abilityThreat, ability: abilityName } : { threat: null, ability: null };
}

// One candidate's contribution to a coverage pool, for the decision log: which uncovered threats it
// patches, HOW (typing / ability / both), and the ability that must be forced (null when typing alone
// covers everything). Returns null if the candidate patches nothing in `uncoveredList`.
function candidateCoverageDetail(candidate, uncoveredList, dmg, level, kind) {
    const test = kind === 'immunity' ? providesImmunity : providesResist;
    const threats = (uncoveredList || []).filter(w => test(candidate, w, dmg, level));
    if (!threats.length) return null;
    const typingThreats = threats.filter(w => {
        const b = dmg(w, candidate.parsedTypes);
        return kind === 'immunity' ? b === 0 : b <= 1;
    });
    const abilityThreats = threats.filter(w => !typingThreats.includes(w));
    const ability = abilityThreats.length ? coverageAbilityFor(candidate, abilityThreats[0], level, kind) : null;
    const via = typingThreats.length ? (abilityThreats.length ? 'mixed' : 'typing') : 'ability';
    return { id: candidate.id, threats, via, ability };
}

// The full per-slot coverage attempt, WITH a complete audit trace: immunities first (150%×soph), then
// resistances (90%×soph). BOTH rounds' uncovered sets + pools are always computed (cheap, no RNG) so the
// decision log is exhaustive; only the rolls follow the real algorithm — immunities roll first, and the
// resist round `reached` a roll only if the immunity round didn't pick. `fitOk` filters by archetype.
// Returns { monoType, soph, rounds:[{kind,uncovered,prob,reached,pool,picked}], result }, where result
// is { poke, kind, threat, ability } for the winning pick or null. `rngRandom` is the seeded stream.
function evaluateCoverage({ candidates, monoType, team, dmg, level, soph, fitOk = () => true, rngRandom }) {
    let result = null;
    const rounds = [];
    const specs = [
        { kind: 'immunity', uncovered: uncoveredImmunities(monoType, team, dmg), test: providesImmunity },
        { kind: 'resist', uncovered: uncoveredResists(monoType, team, dmg), test: providesResist },
    ];
    for (const s of specs) {
        const qualifying = (candidates || []).filter(c => fitOk(c) && s.uncovered.some(w => s.test(c, w, dmg, level)));
        const pool = qualifying.map(c => candidateCoverageDetail(c, s.uncovered, dmg, level, s.kind)).filter(Boolean);
        const round = { kind: s.kind, uncovered: s.uncovered, prob: autoIncludeProbability(s.kind, soph), reached: false, pool, picked: null };
        if (!result) {
            round.reached = true; // only the round the algorithm actually reaches rolls dice
            if (qualifying.length) {
                const picked = selectByRoll(qualifying, round.prob, rngRandom);
                if (picked) {
                    round.picked = picked.id;
                    const reason = coverageReasonFor(picked, s.uncovered, dmg, level, s.kind);
                    result = { poke: picked, kind: s.kind, threat: reason.threat, ability: reason.ability };
                }
            }
        }
        rounds.push(round);
    }
    return { monoType, soph, rounds, result };
}

// Thin wrapper — the winning pick only (used where the trace isn't needed).
function pickCoverageMember(opts) {
    return evaluateCoverage(opts).result;
}

// Shuffle `candidates` (seeded Fisher-Yates via `rngRandom`), then walk them rolling `prob` each; return
// the first that passes, else null. Pure given the injected rng — the picker supplies the per-slot
// reseeded stream so shared trainers stay deterministic (trainer-determinism.md).
function selectByRoll(candidates, prob, rngRandom) {
    const pool = (candidates || []).slice();
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rngRandom() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (const c of pool) {
        if (rngRandom() < prob) return c;
    }
    return null;
}

module.exports = {
    TYPE_IMMUNITY_ABILITIES,
    TYPE_RESIST_ABILITIES,
    monotypeWeaknesses,
    assignableAbilities,
    coverageAbilityFor,
    providesImmunity,
    providesResist,
    immunityAchievable,
    teamImmuneTo,
    teamResistsTo,
    uncoveredImmunities,
    uncoveredResists,
    autoIncludeProbability,
    selectByRoll,
    coverageReasonFor,
    candidateCoverageDetail,
    evaluateCoverage,
    pickCoverageMember,
};
