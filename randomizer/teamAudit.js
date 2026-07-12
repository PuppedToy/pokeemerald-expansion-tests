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

const asPoke = m => (m && m.pokemon) ? m.pokemon : m;
const speciesId = m => { const p = asPoke(m); return (p && p.id) || null; };
const r2 = x => (x == null ? null : Math.round(x * 100) / 100);
const nameify = (id, prefix) => (id || '')
    .replace(prefix, '').toLowerCase().split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function createTeamAudit() {
    const teams = [];
    let cur = null;
    return {
        // meta: { trainerId, label, class, level, battleType, sophistication, seed }
        beginTeam(meta) { cur = { ...meta, slots: [] }; },

        // Called after a slot's member is chosen. priorTeam = members chosen BEFORE this one;
        // member = the fully resolved member ({ pokemon, ability, moves }) for delivered-role detection.
        recordSlot({ priorTeam, chosenMon, member, roleMove, model, ctx, seed }) {
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
            });
        },

        finishTeam({ team, model, ctx, seed }) {
            if (!cur) return;
            const id = model ? resolveIdentity((team || []).map(asPoke), model, ctx, seed) : null;
            cur.finalIdentity = id ? { base: id.baseId, source: id.source, gimmicks: id.gimmickIds } : null;
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
        if (t.sophistication != null && t.sophistication < engineThreshold) {
            lines.push(`  → below engine threshold (${r2(engineThreshold)}) — tier-random pile, no archetype steering.`);
        } else {
            (t.slots || []).forEach((s, i) => {
                const sp = (s.species ? nameify(s.species, 'SPECIES_') : '(dropped)').padEnd(18);
                const id = s.identity
                    ? `${s.identity.base} (${s.identity.source} ${s.identity.confidence})`
                    : 'no identity yet → random within tier';
                const roles = s.rolesFilled && s.rolesFilled.length ? ` → fills ${s.rolesFilled.join(', ')}` : '';
                const rm = s.roleMove ? `  [+${nameify(s.roleMove, 'MOVE_')}]` : '';
                lines.push(`  slot ${i + 1}: ${sp} — ${id}${roles}${rm}`);
            });
        }
        lines.push('');
    }
    return lines.join('\n');
}

module.exports = { createTeamAudit, noopTeamAudit, renderTeamAuditText };
