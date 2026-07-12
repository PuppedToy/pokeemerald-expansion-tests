'use strict';

// T-117 — team-building decision audit. A collector that records, per resolved team, a CONCISE trace
// of the decisions that produced it: the trainer's sophistication, the emerged/seeded archetype
// identity, and per slot the identity-so-far, the chosen species, which archetype roles it fills, and
// any role move the refinement injected. Plus a human-readable renderer.
//
// Purely OBSERVATIONAL: the resolver feeds it raw materials and the rationale is (re)computed from the
// SAME pure engine functions (resolveIdentity / detectFeatures / combinedStructure) — no RNG, no effect
// on generation. Travels OUTSIDE the bundle (sibling of the worker's message), like T-075 diagnostics.

const { detectFeatures } = require('./modules/featureDetectors');
const { resolveIdentity, BIAS_MIN_SOPH } = require('./modules/archetypePicker');
const { combinedStructure } = require('./modules/archetypeFit');
const { resolvedDetectMon } = require('./modules/archetypeRefine');
const { TRAINER_REPEAT_ID } = require('./constants');

// T-106/T-117 — where a slot's mon came from, for the backwards-continuity audit. Backwards generation
// is the riskiest path, so the log must make explicit what is INHERITED by continuity id, how it is
// DEVOLVED (authoritative endgame form → the stage shown here), and which mons are chosen by a hard
// restriction (the favourite ace, a mandatory legendary).
function slotProvenance(def, chosenMon, storedSpecies) {
    if (!def) return null;
    const shown = chosenMon ? chosenMon.id : null;
    if (def.favouriteChain) return { kind: 'favourite' };
    if (def.special === TRAINER_REPEAT_ID) {
        const devolvedFrom = (storedSpecies && shown && storedSpecies !== shown) ? storedSpecies : null;
        return { kind: 'inherited', fromId: def.id || null, devolvedFrom };
    }
    if (typeof def.special === 'string' && def.special.startsWith('PLAYER_LEGEND')) return { kind: 'legendary' };
    if (def.special === 'TRAINER_POKE_ENCOUNTER' || def.encounterIds) return { kind: 'encounter' };
    if (typeof def.special === 'string' && def.special.startsWith('TRAINER_POKE_STARTER')) return { kind: 'starter' };
    return null;
}

const asPoke = m => (m && m.pokemon) ? m.pokemon : m;
const speciesId = m => { const p = asPoke(m); return (p && p.id) || null; };
const r2 = x => (x == null ? null : Math.round(x * 100) / 100);
const nameify = (id, prefix) => (id || '')
    .replace(prefix, '').toLowerCase().split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// T-124 — a seeded gimmick is an INTENT: the trainer tries it within its restrictions and DROPS it if
// it can't gather the support (setter, type, synergy). It "materialised" only if the finished team
// actually delivers the gimmick's setter role.
const GIMMICK_SETTER_ROLE = {
    weather: 'weatherSetter', trick_room: 'trickRoomSetter', screens: 'screenSetter', trapping: 'trapper',
};
function gimmickMaterialised(gimmickId, team, ctx) {
    const role = GIMMICK_SETTER_ROLE[gimmickId];
    if (!role) return true; // unknown gimmick → don't drop
    return (team || []).some(m => detectFeatures(resolvedDetectMon(m), ctx).has(role));
}

function createTeamAudit() {
    const teams = [];
    let cur = null;
    return {
        // meta: { trainerId, label, class, level, battleType, sophistication, seed }
        beginTeam(meta) { cur = { ...meta, slots: [] }; },

        // Called after a slot's member is chosen. priorTeam = members chosen BEFORE this one;
        // member = the fully resolved member ({ pokemon, ability, moves }) for delivered-role detection.
        recordSlot({ priorTeam, chosenMon, member, roleMove, model, ctx, seed, def, storedSpecies }) {
            if (!cur) return;
            const id = (model && chosenMon) ? resolveIdentity((priorTeam || []).map(asPoke), model, ctx, seed) : null;
            let roles = [];
            if (id && chosenMon) {
                const structure = combinedStructure(model, id.baseId, id.gimmickIds);
                // T-122/B-026 — DELIVERED roles: detect on the RESOLVED member (actual moveset + chosen
                // ability), not the species potential, so "fills X" means the mon really delivers X.
                const feats = detectFeatures(member ? resolvedDetectMon(member) : chosenMon, ctx);
                roles = structure.filter(s => feats.has(s.role)).map(s => s.role);
            }
            cur.slots.push({
                species: chosenMon ? chosenMon.id : null,
                identity: id ? { base: id.baseId, source: id.source, confidence: r2(id.confidence) } : null,
                rolesFilled: roles,
                roleMove: roleMove || null,
                provenance: slotProvenance(def, chosenMon, storedSpecies),
            });
        },

        finishTeam({ team, model, ctx, seed }) {
            if (!cur) return;
            const id = model ? resolveIdentity((team || []).map(asPoke), model, ctx, seed) : null;
            // T-124 — DROP a seeded gimmick that didn't materialise (its setter isn't actually delivered),
            // so the log reflects reality: the trainer tried it but its restrictions couldn't support it.
            const gimmicks = id ? (id.gimmickIds || []).filter(g => gimmickMaterialised(g, team, ctx)) : [];
            cur.finalIdentity = id ? { base: id.baseId, source: id.source, gimmicks } : null;
            cur.finalTeam = (team || []).map(speciesId);
            teams.push(cur);
            cur = null;
        },

        all() { return teams; },
    };
}

// A no-op collector (default when auditing is off) so the resolver can call unconditionally.
function noopTeamAudit() {
    return { beginTeam() {}, recordSlot() {}, finishTeam() {}, all() { return []; } };
}

function seedStr(seed) {
    if (!seed || !seed.base) return 'none';
    return seed.base + (seed.gimmicks && seed.gimmicks.length ? '+' + seed.gimmicks.join('+') : '');
}

// T-106/T-117 — render a slot's continuity/restriction provenance for the backwards-generation audit.
function provStr(p) {
    if (!p) return '';
    if (p.kind === 'favourite') return '  {favourite ace}';
    if (p.kind === 'legendary') return '  {mandatory legendary}';
    if (p.kind === 'encounter') return '  {route encounter}';
    if (p.kind === 'starter') return '  {starter}';
    if (p.kind === 'inherited') {
        const from = p.devolvedFrom ? ` ← devolved from ${nameify(p.devolvedFrom, 'SPECIES_')}` : '';
        return `  {inherited by id ${p.fromId || '?'}${from}}`;
    }
    return '';
}

// Render the collected traces as a concise, readable text log.
function renderTeamAuditText(teams, { engineThreshold = BIAS_MIN_SOPH } = {}) {
    const lines = [
        '# Team-building decision log (T-117)',
        '# Per team: sophistication, the emerged/seeded archetype identity, and per-slot decisions.',
        '# "no steering" = the trainer is below the engine threshold (early game) → tier-random pick.',
        '',
    ];
    for (const t of teams || []) {
        const soph = t.sophistication != null ? r2(t.sophistication) : '?';
        const fmt = t.battleType || 'singles';
        const fid = t.finalIdentity
            ? `${t.finalIdentity.base} (${t.finalIdentity.source}${t.finalIdentity.gimmicks && t.finalIdentity.gimmicks.length ? ', +' + t.finalIdentity.gimmicks.join('+') : ''})`
            : 'none';
        lines.push(`=== ${t.trainerId}${t.label ? ' — ' + t.label : ''} (lvl ${t.level ?? '?'}, ${fmt}) ===`);
        lines.push(`sophistication: ${soph} | seed: ${seedStr(t.seed)} | final identity: ${fid}`);
        const belowThreshold = t.sophistication != null && t.sophistication < engineThreshold;
        if (belowThreshold) {
            lines.push(`  → below engine threshold (${r2(engineThreshold)}) — tier-random pile, no archetype steering.`);
        }
        // Slots are listed regardless of the archetype threshold: continuity provenance (inherited /
        // devolved) matters most at the low-level EARLY appearances of a recurring character (T-106).
        (t.slots || []).forEach((s, i) => {
            const sp = (s.species ? nameify(s.species, 'SPECIES_') : '(dropped)').padEnd(18);
            const prov = provStr(s.provenance);
            if (belowThreshold) {
                lines.push(`  slot ${i + 1}: ${sp}${prov}`);
                return;
            }
            const id = s.identity
                ? `${s.identity.base} (${s.identity.source} ${s.identity.confidence})`
                : 'no identity yet → random within tier';
            const roles = s.rolesFilled && s.rolesFilled.length ? ` → fills ${s.rolesFilled.join(', ')}` : '';
            const rm = s.roleMove ? `  [+${nameify(s.roleMove, 'MOVE_')}]` : '';
            lines.push(`  slot ${i + 1}: ${sp} — ${id}${roles}${rm}${prov}`);
        });
        lines.push('');
    }
    return lines.join('\n');
}

module.exports = { createTeamAudit, noopTeamAudit, renderTeamAuditText };
