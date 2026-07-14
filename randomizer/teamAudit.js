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
const { resolveIdentity, BIAS_MIN_SOPH, BIAS_STRENGTH } = require('./modules/archetypePicker');
const { combinedStructure } = require('./modules/archetypeFit');
const { resolvedDetectMon } = require('./modules/archetypeRefine');
const { isWeatherSetter, isWeatherAbuser, weatherHolds, gimmickHolds } = require('./modules/gimmickPlan');
const { TRAINER_REPEAT_ID } = require('./constants');

// T-132 — the weather subtype a trace's team actually runs: the committed seed's theme, else inferred
// from whatever setter the team fields. Used to make the log's setter/abuser labels SUBTYPE-AWARE (the
// generic featureDetectors are weather-agnostic + ability-only, so they mislabel a Swift Swimmer on a sun
// team as an abuser and miss the boosted-STAB/DEF type abusers — the same weatherAbuseScore the builder
// uses now drives the labels).
function weatherSubtypeOf(seed, team) {
    if (seed && (seed.gimmicks || []).includes('weather') && seed.weather) return seed.weather;
    for (const m of (team || [])) { const s = m && m.ability && require('./modules/gimmickPlan').setterSubtype(m); if (s) return s; }
    return null;
}

// T-106/T-117 — where a slot's mon came from, for the backwards-continuity audit. Backwards generation
// is the riskiest path, so the log must make explicit what is INHERITED by continuity id, how it is
// DEVOLVED (authoritative endgame form → the stage shown here), and which mons are chosen by a hard
// restriction (the favourite ace, a mandatory legendary).
function slotProvenance(def, chosenMon, storedSpecies) {
    if (!def) return null;
    const shown = chosenMon ? chosenMon.id : null;
    if (def.__favourite || def.favouriteChain) return { kind: 'favourite' };
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
function gimmickMaterialised(gimmickId, team, ctx, subtype = null) {
    // Weather / electric terrain / trick room use the SAME success condition as the builder (setter + 2
    // abusers) so the log's "materialised / dropped" verdict never disagrees with the resolver's commit.
    if (gimmickId === 'weather' || gimmickId === 'electric_terrain' || gimmickId === 'trick_room') {
        return gimmickHolds(gimmickId, team, ctx, subtype);
    }
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
                // T-132 — SUBTYPE-AWARE weather labels: replace the generic (agnostic, ability-only)
                // weatherSetter/weatherAbuser with the builder's own definition (isWeatherSetter includes
                // move-setters; isWeatherAbuser = weatherAbuseScore ≥ threshold, subtype-specific). So the
                // log stops mislabeling a foreign-weather ability as an abuser and stops missing type abusers.
                const wxSub = weatherSubtypeOf(seed, [...(priorTeam || []), member].filter(Boolean));
                if (wxSub && member) {
                    roles = roles.filter(r => r !== 'weatherSetter' && r !== 'weatherAbuser');
                    if (isWeatherSetter(member, wxSub)) roles.push('weatherSetter');
                    if (isWeatherAbuser(member, wxSub)) roles.push('weatherAbuser');
                }
            }
            cur.slots.push({
                species: chosenMon ? chosenMon.id : null,
                identity: id ? { base: id.baseId, source: id.source, confidence: r2(id.confidence) } : null,
                rolesFilled: roles,
                roleMove: roleMove || null,
                provenance: slotProvenance(def, chosenMon, storedSpecies),
            });
        },

        // T-132 — after a weather attempt retrofits a MOVE-setter (gimmickPlan.ensureMoveSetter), the
        // injected move landed AFTER recordSlot ran, so re-derive the weather labels for the final team so
        // the setter mon actually shows "weatherSetter". Matched by species (slot order can diverge from
        // team order when a slot is dropped).
        relabelWeather(team, subtype) {
            if (!cur || !subtype) return;
            const bySpecies = new Map();
            (team || []).forEach(m => { const id = m && m.pokemon && m.pokemon.id; if (id && !bySpecies.has(id)) bySpecies.set(id, m); });
            (cur.slots || []).forEach(slot => {
                const m = bySpecies.get(slot.species);
                if (!m) return;
                slot.rolesFilled = (slot.rolesFilled || []).filter(r => r !== 'weatherSetter' && r !== 'weatherAbuser');
                if (isWeatherSetter(m, subtype)) slot.rolesFilled.push('weatherSetter');
                if (isWeatherAbuser(m, subtype)) slot.rolesFilled.push('weatherAbuser');
            });
        },

        finishTeam({ team, model, ctx, seed, weatherPicks, itemLinkActivations }) {
            if (!cur) return;
            if (weatherPicks && weatherPicks.length) cur.weatherPicks = weatherPicks; // T-135 — abuser rankings
            if (itemLinkActivations && itemLinkActivations.length) cur.itemLinkActivations = itemLinkActivations; // T-133
            const id = model ? resolveIdentity((team || []).map(asPoke), model, ctx, seed) : null;
            // Every gimmick the identity/seed WANTED (emergent + seeded), before checking support.
            const candidateGimmicks = Array.from(new Set([
                ...(id && id.gimmickIds ? id.gimmickIds : []),
                ...((seed && seed.gimmicks) ? seed.gimmicks : []),
            ]));
            // T-124 — DROP a gimmick that didn't materialise (its setter isn't actually delivered), so the
            // log reflects reality: the trainer tried it but its restrictions couldn't support it. Weather
            // is judged by the subtype-aware success condition (T-132), matching the resolver's own commit.
            // T-135 — a tag partner abusing an ALLY's weather (abuseOnly) needs no setter of its own, so pass
            // the flag through: it materialised as an abuser, not "dropped — setter not delivered".
            const wxSub = weatherSubtypeOf(seed, team);
            const wxCtx = { ...ctx, abuseOnly: !!(seed && seed.abuseOnly), roomStyle: (seed && seed.roomStyle) || null };
            const gimmicks = candidateGimmicks.filter(g => gimmickMaterialised(g, team, wxCtx, wxSub));
            // T-130 — record what was DROPPED so the renderer can explain why (auditability).
            cur.finalIdentity = id ? { base: id.baseId, source: id.source, gimmicks } : null;
            cur.candidateGimmicks = candidateGimmicks;
            cur.droppedGimmicks = candidateGimmicks.filter(g => !gimmicks.includes(g));
            cur.finalTeam = (team || []).map(speciesId);
            teams.push(cur);
            cur = null;
        },

        all() { return teams; },
        // T-132 — merge a committed attempt's trace (from a throwaway per-attempt collector) into this one.
        absorb(other) { for (const t of (other && other.all ? other.all() : [])) teams.push(t); },
    };
}

// A no-op collector (default when auditing is off) so the resolver can call unconditionally.
function noopTeamAudit() {
    return { beginTeam() {}, recordSlot() {}, relabelWeather() {}, finishTeam() {}, all() { return []; }, absorb() {} };
}

function seedStr(seed) {
    if (!seed || !seed.base) return 'none';
    // T-136 — an EMERGENT weather build had no pre-seed of its own; it discovered the weather from a rolled
    // setter. Render honestly as "none → emergent <subtype>", not as if it were a themed seed.
    if (seed.emergent) return `none → emergent ${seed.weather || (seed.gimmicks || []).join('+')}`;
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
        const belowThreshold = t.sophistication != null && t.sophistication < engineThreshold;
        const gims = (t.finalIdentity && t.finalIdentity.gimmicks) || [];
        // T-130 — below the steering threshold the identity is a DESCRIPTIVE reading of a tier-random
        // pile, so don't dress it up with gimmicks it never pursued (reported as "not pursued"). T-132 — a
        // ROLLED-BACK gimmick is likewise not shown as an identity trait (any emergent setter is incidental).
        const showGims = !belowThreshold && !t.rolledBack && gims.length;
        const fid = t.finalIdentity
            ? `${t.finalIdentity.base} (${t.finalIdentity.source}${showGims ? ', +' + gims.join('+') : ''})`
            : 'none';
        lines.push(`=== ${t.trainerId}${t.label ? ' — ' + t.label : ''} (lvl ${t.level ?? '?'}, ${fmt}) ===`);
        lines.push(`sophistication: ${soph} | seed: ${seedStr(t.seed)} | final identity: ${fid}`);
        if (belowThreshold) {
            lines.push(`  → below engine threshold (${r2(engineThreshold)}) — tier-random pile, no archetype steering; the identity above is a descriptive reading of the picked mons, not a steered choice.`);
            // Roxanne's Amaura case: a gimmick the emergent reading noticed but the engine never pursued.
            if (t.candidateGimmicks && t.candidateGimmicks.length) {
                lines.push(`  → gimmick surfaced but NOT pursued (below threshold): ${t.candidateGimmicks.join(', ')}.`);
            }
        } else if (t.sophistication != null) {
            // How sophistication steered: the fit bias multiplies each candidate's pick weight by
            // (1 + soph × BIAS_STRENGTH × fit), so a higher soph pulls picks harder toward the identity.
            lines.push(`  → steering ON — sophistication ${soph} (fit bias up to +${r2(t.sophistication * BIAS_STRENGTH)}× on each pick).`);
            if (t.droppedGimmicks && t.droppedGimmicks.length) {
                lines.push(`  → gimmick dropped — setter not delivered within restrictions: ${t.droppedGimmicks.join(', ')}.`);
            }
        }
        // T-132/ADR-017 — the intended gimmick couldn't assemble its setter + abusers within the
        // restrictions, so the attempt-based resolver rolled it back to a normal team.
        if (t.rolledBack) {
            const tried = t.rolledBack.attempts > 0 ? ` (after ${t.rolledBack.attempts} attempt(s))` : '';
            lines.push(`  → ${t.rolledBack.gimmick} intended but ROLLED BACK${tried}: couldn't build its setter + 2 abusers within the trainer's restrictions.`);
        }
        // T-136 — a NON-DEDICATED team rolled a weather setter, so the engine tried to build that weather but
        // couldn't gather enough abusers → kept the plain team. Reported so the "why no weather" is auditable.
        if (t.emergentWeatherDropped) {
            const d = t.emergentWeatherDropped;
            lines.push(`  → ${d.subtype} weather EMERGED (a setter was rolled) but was DROPPED: only ${d.abusers} abuser(s) buildable within the team, needs ${d.required}. Kept as a normal team.`);
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
        // T-135 — weather-abuser RANKING: for each abuser actually placed, the eligible abusers ranked by
        // the weather-abuse rating, with the itemised score breakdown, and which one was picked. Makes the
        // "why this abuser" decision auditable (sophistication pulls the pick toward the top of this list).
        // The picker records a ranking on every abuser hard-restrict; keep only the ones whose pick landed
        // on the final team (a slot's earlier attempts get discarded by tier/family fallback), de-duped.
        const placed = new Set(t.finalTeam || []);
        const seenPick = new Set();
        const shownPicks = (t.weatherPicks || []).filter(wp => {
            if (!placed.has(wp.pickedId) || seenPick.has(wp.pickedId)) return false;
            seenPick.add(wp.pickedId); return true;
        });
        shownPicks.forEach((wp, k) => {
            const pull = wp.pullExp != null ? ` (soph-pull ^${wp.pullExp} → higher = top dominates)` : '';
            lines.push(`  → ${wp.subtype} abuser pick #${k + 1} — ${wp.nEligible || wp.ranked.length} eligible, ranked by weather-abuse rating${pull}:`);
            wp.ranked.forEach(c => {
                const parts = (c.parts || []).map(p => `${p.k} ${p.v >= 0 ? '+' : ''}${p.v}`).join(', ');
                const rank = c.rank ? `#${c.rank} ` : '';
                const mark = c.id === wp.pickedId ? ' ‹picked›' : '';
                lines.push(`      ${rank}${nameify(c.id, 'SPECIES_').padEnd(18)} ${String(c.total).padStart(5)}  [${parts}]${mark}`);
            });
        });
        // T-133 — linked pick-pack activations: when a mon USED an item/TM from a pick-group, one unit of each
        // sibling was forgone from this trainer's bag (the trainer "made the pick" like the player). Auditable.
        (t.itemLinkActivations || []).forEach(a => {
            const label = id => a.kind === 'tm' ? nameify(id, 'MOVE_') : id;
            const forwent = (a.removed || []).map(label).join(', ');
            lines.push(`  → linked ${a.kind === 'tm' ? 'TM' : 'item'}-pack: ${nameify(a.species, 'SPECIES_')} took ${label(a.used)} → forwent ${forwent || '(none)'}.`);
        });
        lines.push('');
    }
    return lines.join('\n');
}

module.exports = { createTeamAudit, noopTeamAudit, renderTeamAuditText };
