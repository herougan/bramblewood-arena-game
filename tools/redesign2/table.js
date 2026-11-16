const L = require('./lib.js');
const fs = require('fs');
const R1 = JSON.parse(fs.readFileSync(L.ROOT + '/docs/design/redesign1-2026-11-16.json', 'utf8'));
const R1C = {}; R1.cards.forEach(c => R1C[c.id] = c);
const rc = L.roadCards();
const lines = [];
rc.forEach(({ id, map }) => {
  const c = L.BYID[id]; const f = L.fillOf(c, c.effects || {}, c.attack, c.health);
  const r = R1C[id];
  const trig = c.effects && c.effects.triggers ? '' : '';
  lines.push([map, id, c.name, c.rarity, 'W' + (c.wait || 0) + 'L' + (c.cost || 0), (L.OWNER.has(id) ? 'O' : ''), c.attack + '/' + c.health, f.fill, JSON.stringify(c.effects || {}), r ? (r.map !== map ? 'R1MAP' + r.map + ' ' : '') + JSON.stringify(r.effects) + ' ' + r.attack + '/' + r.health : 'noR1', (c.species || '') + '|' + (c.animal || '')].join(' ; '));
});
fs.writeFileSync(process.argv[2], lines.join('\n'));
console.log(rc.length);
