const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'randomizer/output/pokes.js'), 'utf8');
// strip the trailing semicolon and var declaration
const json = src.replace(/^const pokes = /, '').replace(/;\s*$/, '');
const pokes = JSON.parse(json);

const targets = [
    'BRELOOM', 'SCIZOR', 'SERPERIOR', 'CLEFABLE', 'TOGEKISS',
    'GLISCOR', 'REUNICLUS', 'CORVIKNIGHT', 'TOXAPEX', 'KINGAMBIT',
    'BLAZIKEN', 'GARCHOMP', 'DRAGONITE', 'GYARADOS', 'VOLCARONA',
    'LUCARIO', 'AZUMARILL', 'THUNDURUS', 'GRENINJA', 'GENGAR',
    'FERROTHORN', 'SKARMORY', 'JIRACHI', 'CLOYSTER', 'MIMIKYU',
    'HAXORUS', 'EXCADRILL', 'INFERNAPE', 'ROTOM_WASH'
];

const byId = {};
pokes.forEach(p => { if (p.id) byId[p.id] = p; });

console.log('Pokemon'.padEnd(22) + 'BST   Tier      AbsRating  Combo   Role');
console.log('-'.repeat(72));
targets.forEach(name => {
    const id = 'SPECIES_' + name;
    const p = byId[id];
    if (!p) { console.log(name.padEnd(22) + 'NOT FOUND'); return; }
    const r = p.rating;
    const combo = (r.comboBonus || 0).toFixed(2);
    console.log(
        name.padEnd(22) +
        String(p.baseBST).padEnd(6) +
        r.tier.padEnd(10) +
        r.absoluteRating.toFixed(3).padEnd(11) +
        ('+' + combo).padEnd(8) +
        r.role
    );
});
