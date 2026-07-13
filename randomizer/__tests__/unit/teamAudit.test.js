'use strict';

// T-117 — team-building decision audit: collector + readable renderer.

const { createTeamAudit, noopTeamAudit, renderTeamAuditText } = require('../../teamAudit');
const { getArchetypeModel } = require('../../archetypes');

const singles = getArchetypeModel('singles');

const mon = (o) => ({
    id: 'SPECIES_X', parsedTypes: ['NORMAL'], parsedAbilities: [],
    baseHP: 70, baseAttack: 70, baseDefense: 70, baseSpeed: 70, baseSpAttack: 70, baseSpDefense: 70,
    learnset: [], teachables: [], evolutionData: { isMega: false }, ...o,
});
const learn = (...mv) => ({ learnset: mv.map(m => ({ level: '1', move: m })) });
const regen = () => mon({ id: 'SPECIES_REGEN', parsedAbilities: ['REGENERATOR'], baseHP: 100, baseDefense: 90, baseSpDefense: 90 });
const breaker = () => mon({ id: 'SPECIES_BREAKER', baseAttack: 130 });
const sweeper = () => mon({ id: 'SPECIES_SW', baseAttack: 120, ...learn('MOVE_DRAGON_DANCE') });
const rocker = () => mon({ id: 'SPECIES_RK', ...learn('MOVE_STEALTH_ROCK') });
const defogger = () => mon({ id: 'SPECIES_DF', ...learn('MOVE_DEFOG') });
// A prior team that fits Balance (regen backbone + win condition + hazard game).
const balancePrior = () => [{ pokemon: regen() }, { pokemon: sweeper() }, { pokemon: rocker() }, { pokemon: defogger() }];

describe('createTeamAudit + renderTeamAuditText', () => {
    test('records a team trace (identity, roles, injected move) and renders it', () => {
        const audit = createTeamAudit();
        audit.beginTeam({ trainerId: 'TRAINER_TEST', label: 'Tester', level: 60, battleType: 'singles', sophistication: 0.9, seed: null });
        const prior = balancePrior(); // fits Balance
        audit.recordSlot({ priorTeam: prior, chosenMon: breaker(), member: { pokemon: breaker(), ability: null, moves: ['MOVE_STEALTH_ROCK', 'MOVE_EARTHQUAKE'] }, roleMove: 'MOVE_STEALTH_ROCK', model: singles, ctx: {}, seed: null });
        audit.finishTeam({ team: [...prior, { pokemon: breaker() }], model: singles, ctx: {}, seed: null });

        const all = audit.all();
        expect(all).toHaveLength(1);
        expect(all[0].trainerId).toBe('TRAINER_TEST');
        expect(all[0].slots[0].species).toBe('SPECIES_BREAKER');
        expect(all[0].slots[0].identity.base).toBe('balance');
        expect(all[0].slots[0].identity.source).toBe('emergent');
        expect(all[0].slots[0].rolesFilled).toContain('wallbreaker');
        expect(all[0].slots[0].rolesFilled).toContain('hazardSetter'); // T-122 — delivered (runs Stealth Rock)
        expect(all[0].slots[0].roleMove).toBe('MOVE_STEALTH_ROCK');
        expect(all[0].finalIdentity.base).toBe('balance');

        const text = renderTeamAuditText(all);
        expect(text).toContain('TRAINER_TEST');
        expect(text).toContain('Tester');
        expect(text).toContain('Breaker');            // species name in the slot line (nameified)
        expect(text).toContain('fills');             // role annotation
        expect(text).toContain('+Stealth Rock');     // injected role move
    });

    test('B-026 — rolesFilled reports DELIVERED roles, not species potential', () => {
        // A mon whose SPECIES can set rocks (potential hazard setter) but whose resolved moveset runs none.
        const rockCapable = mon({ id: 'SPECIES_RC', ...learn('MOVE_STEALTH_ROCK') });
        const notDelivering = { pokemon: rockCapable, ability: null, moves: ['MOVE_TACKLE', 'MOVE_EMBER'] };
        const a1 = createTeamAudit();
        a1.beginTeam({ trainerId: 'T1', level: 60, battleType: 'singles', sophistication: 0.9, seed: null });
        a1.recordSlot({ priorTeam: balancePrior(), chosenMon: rockCapable, member: notDelivering, roleMove: null, model: singles, ctx: {}, seed: null });
        a1.finishTeam({ team: [...balancePrior()], model: singles, ctx: {}, seed: null });
        expect(a1.all()[0].slots[0].rolesFilled).not.toContain('hazardSetter'); // potential ≠ delivered

        // The same species that DOES run rocks → delivered.
        const delivering = { pokemon: rockCapable, ability: null, moves: ['MOVE_STEALTH_ROCK', 'MOVE_TACKLE'] };
        const a2 = createTeamAudit();
        a2.beginTeam({ trainerId: 'T2', level: 60, battleType: 'singles', sophistication: 0.9, seed: null });
        a2.recordSlot({ priorTeam: balancePrior(), chosenMon: rockCapable, member: delivering, roleMove: 'MOVE_STEALTH_ROCK', model: singles, ctx: {}, seed: null });
        a2.finishTeam({ team: [...balancePrior()], model: singles, ctx: {}, seed: null });
        expect(a2.all()[0].slots[0].rolesFilled).toContain('hazardSetter');
    });

    test('a low-sophistication team renders as "no steering"', () => {
        const audit = createTeamAudit();
        audit.beginTeam({ trainerId: 'TRAINER_EARLY', level: 8, battleType: 'singles', sophistication: 0.05, seed: null });
        audit.finishTeam({ team: [{ pokemon: mon() }], model: singles, ctx: {}, seed: null });
        expect(renderTeamAuditText(audit.all())).toContain('no archetype steering');
    });

    test('records the seed when present', () => {
        const audit = createTeamAudit();
        audit.beginTeam({ trainerId: 'TRAINER_SEED', level: 50, battleType: 'singles', sophistication: 0.8, seed: { base: 'full_stall', gimmicks: ['weather'] } });
        audit.finishTeam({ team: [{ pokemon: mon() }], model: singles, ctx: {}, seed: { base: 'full_stall' } });
        expect(renderTeamAuditText(audit.all())).toContain('seed: full_stall+weather');
    });

    test('T-106 — records + renders continuity provenance (inherited / devolved / favourite)', () => {
        const audit = createTeamAudit();
        audit.beginTeam({ trainerId: 'TRAINER_ECHO', level: 22, battleType: 'singles', sophistication: 0.05, seed: null });
        // an inherited + devolved echo: shown Metang, authoritative stored Metagross
        audit.recordSlot({
            priorTeam: [], chosenMon: { id: 'SPECIES_METANG' }, member: { pokemon: { id: 'SPECIES_METANG' } },
            roleMove: null, model: singles, ctx: {}, seed: null,
            def: { special: 'TRAINER_REPEAT_ID', id: 'STEVEN_MEGA', devolveToLevel: true }, storedSpecies: 'SPECIES_METAGROSS',
        });
        // the favourite ace
        audit.recordSlot({
            priorTeam: [], chosenMon: { id: 'SPECIES_GARDEVOIR' }, member: { pokemon: { id: 'SPECIES_GARDEVOIR' } },
            roleMove: null, model: singles, ctx: {}, seed: null,
            def: { favouriteChain: [{}], id: 'WALLY_1' }, storedSpecies: 'SPECIES_GARDEVOIR',
        });
        audit.finishTeam({ team: [{ pokemon: { id: 'SPECIES_METANG' } }], model: singles, ctx: {}, seed: null });

        const slots = audit.all()[0].slots;
        expect(slots[0].provenance).toEqual({ kind: 'inherited', fromId: 'STEVEN_MEGA', devolvedFrom: 'SPECIES_METAGROSS' });
        expect(slots[1].provenance).toEqual({ kind: 'favourite' });
        const text = renderTeamAuditText(audit.all());
        expect(text).toContain('inherited by id STEVEN_MEGA');
        expect(text).toContain('devolved from Metagross');
        expect(text).toContain('favourite ace');
    });

    test('T-130 — above threshold shows steering ON with the sophistication bias', () => {
        const audit = createTeamAudit();
        audit.beginTeam({ trainerId: 'T_HI', level: 60, battleType: 'singles', sophistication: 0.6, seed: null });
        audit.finishTeam({ team: balancePrior(), model: singles, ctx: {}, seed: null });
        const text = renderTeamAuditText(audit.all());
        expect(text).toContain('steering ON');
        expect(text).toContain('sophistication 0.6');
        expect(text).toContain('+1.2');   // 0.6 × BIAS_STRENGTH (2.0)
    });

    test('T-130 — below threshold: identity is descriptive; a surfaced gimmick is flagged not-pursued', () => {
        const audit = createTeamAudit();
        audit.beginTeam({ trainerId: 'T_LO', level: 12, battleType: 'singles', sophistication: 0.07, seed: null });
        // a gimmick surfaced (via the seed channel here; emergent reads populate the same candidate list)
        audit.finishTeam({ team: [{ pokemon: mon() }], model: singles, ctx: {}, seed: { base: 'hyper_offense', gimmicks: ['weather'] } });
        const text = renderTeamAuditText(audit.all());
        expect(text).toContain('no archetype steering');
        expect(text).toContain('surfaced but NOT pursued');
        expect(text).toContain('weather');
        // must NOT dress up the below-threshold identity line with +weather
        expect(text).not.toMatch(/final identity:[^\n]*\+weather/);
    });

    test('T-130 — above threshold: a wanted gimmick with no setter is logged as dropped', () => {
        const audit = createTeamAudit();
        audit.beginTeam({ trainerId: 'T_DROP', level: 60, battleType: 'singles', sophistication: 0.8, seed: { base: 'hyper_offense', gimmicks: ['weather'] } });
        audit.finishTeam({ team: [{ pokemon: mon() }], model: singles, ctx: {}, seed: { base: 'hyper_offense', gimmicks: ['weather'] } });
        const text = renderTeamAuditText(audit.all());
        expect(text).toContain('gimmick dropped');
        expect(text).toContain('weather');
    });

    test('noopTeamAudit collects nothing and never throws', () => {
        const a = noopTeamAudit();
        expect(() => { a.beginTeam({}); a.recordSlot({}); a.finishTeam({}); }).not.toThrow();
        expect(a.all()).toEqual([]);
    });
});
