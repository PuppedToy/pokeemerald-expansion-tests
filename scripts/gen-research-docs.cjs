'use strict';
// Renders the Group 2B research reference docs under docs/research/ from the committed source data
// docs/research/corpus.json (produced once by the T-098/099/100 research workflow, adversarially
// verified). The .md files are DERIVED — edit corpus.json (or re-run the workflow) then regenerate:
//   node scripts/gen-research-docs.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'research');
const d = JSON.parse(fs.readFileSync(path.join(OUT, 'corpus.json'), 'utf8'));

const corpus = d.corpus || [];
const isVgc = (t) => /vgc/i.test(t.format || '');
const isDou = (t) => !isVgc(t) && /doubles/i.test(t.format || '');   // Smogon Doubles OU = 6v6
const isSingles = (t) => !isVgc(t) && !isDou(t);
const cell = (s) => String(s == null ? '—' : s).replace(/\|/g, '/').replace(/\n/g, ' ').trim() || '—';
const list = (a) => (a && a.length ? a.map(x => `- ${cell(x)}`).join('\n') : '- —');
const links = (a) => (a && a.length ? a.map(u => `[${u.replace(/^https?:\/\//, '').slice(0, 48)}](${u})`).join(' · ') : '—');

const GEN_NOTE = `<!-- GENERATED from docs/research/corpus.json (T-098/099/100 research workflow, adversarially
verified). Regenerate: node scripts/gen-research-docs.cjs. Competitive references, not game rules —
cite these when tuning ratings/archetypes; do not hand-edit (edit corpus.json instead). -->`;

function teamMd(t) {
    const rows = (t.members || []).map(m =>
        `| ${cell(m.species)} | ${cell(m.ability)} | ${cell(m.item)} | ${cell((m.moves || []).join(', '))} | ${cell(m.role)} |`).join('\n');
    return `### ${t.name}

- **Format:** ${cell(t.format)}
- **Era:** ${cell(t.era)} · **Event:** ${cell(t.event)} · **Author:** ${cell(t.author)} · **Confidence:** ${cell(t.confidence)}
- **Archetype:** ${cell(t.archetype)}
- **Strategy:** ${cell(t.strategy)}

| Pokémon | Ability | Item | Moves | Role |
|---|---|---|---|---|
${rows}

**Synergies:**
${list(t.synergies)}

**Anti-synergies:**
${list(t.antiSynergies)}

**Sources:** ${links(t.sources)}
`;
}

function writeCorpus(file, title, teams, blurb) {
    fs.writeFileSync(path.join(OUT, file), `# ${title}

${GEN_NOTE}

${blurb}

**${teams.length} teams.**

${teams.map(teamMd).join('\n---\n\n')}
`);
    return teams.length;
}

const nV = writeCorpus('vgc-doubles-teams.md', 'Historic VGC doubles teams (Gen 6-7, megas era) — 4v4',
    corpus.filter(isVgc),
    '⚠️ **VGC is 4v4** (bring-6 / pick-4, few switches). Landmark tournament teams for reference, but filter 4v4-specific conclusions for our 6v6 game — see `6v6-vs-4v4-doubles.md`. Sources: tournament reports / Smogon / Trainer Tower / Nugget Bridge archives.');
const nDou = writeCorpus('dou-6v6-teams.md', 'Historic Smogon Doubles OU (DOU) teams (Gen 6-7) — 6v6',
    corpus.filter(isDou),
    '**Smogon DOU is 6v6** — the doubles format that matches our game. Prefer these over the VGC 4v4 teams when tuning our doubles rating/archetypes. Sources: Smogon Doubles OU sample teams / RMT / viability threads.');
const nS = writeCorpus('singles-ou-teams.md', 'Historic Smogon singles OU teams (Gen 6-7, megas era) — 6v6',
    corpus.filter(isSingles),
    'Landmark Smogon OU (6v6 singles) teams from the megas era, for reference when tuning the singles archetypes. Sources: Smogon strategy dex / sample teams / RMT.');

const syn = d.synergy || { synergies: [], antiSynergies: [] };
const synItem = (s) => `### ${s.name}${s.kind ? ` _(${s.kind})_` : ''}\n${cell(s.description)}${s.examples && s.examples.length ? `\n\n_Examples:_ ${s.examples.map(cell).join('; ')}` : ''}`;
fs.writeFileSync(path.join(OUT, 'synergies-antisynergies.md'), `# Synergy & anti-synergy catalog (from the historic-team corpus)

${GEN_NOTE}

Distilled from the ${corpus.length}-team corpus. Feeds the rating combo logic and the archetype models.

## Synergies (${syn.synergies.length})

${syn.synergies.map(synItem).join('\n\n')}

## Anti-synergies (${syn.antiSynergies.length})

${syn.antiSynergies.map(synItem).join('\n\n')}
`);

const arch = d.archetypes || { singles: [], doubles: [] };
const archItem = (a) => `### ${a.name}\n${cell(a.description)}\n\n- **Structure:** ${cell(a.structure)}${a.examples && a.examples.length ? `\n- **Examples:** ${a.examples.map(cell).join('; ')}` : ''}`;
fs.writeFileSync(path.join(OUT, 'team-archetypes.md'), `# Team archetypes (singles & doubles) — research notes

${GEN_NOTE}

Descriptive archetypes distilled from the corpus. Seed for the machine-actionable archetype JSONs
(T-101 singles / T-102 doubles) used by the redesigned team generator (Group 2C).

## Singles archetypes (${arch.singles.length})

${arch.singles.map(archItem).join('\n\n')}

## Doubles archetypes (${arch.doubles.length})

${arch.doubles.map(archItem).join('\n\n')}
`);

const gaps = (d.gaps && d.gaps.findings) || [];
fs.writeFileSync(path.join(OUT, 'rating-gaps.md'), `# Rating gaps — competitive value our naive rater misses

${GEN_NOTE}

What competitive play values that a single-target-damage-focused rater under/over-values. Drives the
doubles rating refinements (T-094/095/096) and the doubles tier floors (T-097).

| Subject | Kind | Observation (competitive) | Suggestion (our rating) |
|---|---|---|---|
${gaps.map(g => `| ${cell(g.subject)} | ${cell(g.kind)} | ${cell(g.observation)} | ${cell(g.suggestion)} |`).join('\n')}
`);

// 6v6 DOU vs 4v4 VGC comparison — the lens for filtering 4v4-biased conclusions (our game is 6v6).
const cmp = d.sixVsFour || [];
fs.writeFileSync(path.join(OUT, '6v6-vs-4v4-doubles.md'), `# 6v6 (Smogon DOU) vs 4v4 (VGC) doubles — what transfers to our game

${GEN_NOTE}

**Our doubles are 6v6.** The VGC corpus is 4v4 (bring-6/pick-4). This table (from the DOU 6v6 corpus)
is the lens for deciding which VGC conclusions apply to us. Owner-validated conclusions go in the
rating-decisions log, not here.

| Aspect | VGC (4v4) | Smogon DOU (6v6) | Implication for our 6v6 game |
|---|---|---|---|
${cmp.map(c => `| ${cell(c.aspect)} | ${cell(c.vgc4v4)} | ${cell(c.dou6v6)} | ${cell(c.implicationForOur6v6Game)} |`).join('\n')}
`);

console.log(`Regenerated docs/research/: vgc-doubles-teams.md (${nV}), dou-6v6-teams.md (${nDou}), singles-ou-teams.md (${nS}), synergies-antisynergies.md, team-archetypes.md, rating-gaps.md, 6v6-vs-4v4-doubles.md`);
