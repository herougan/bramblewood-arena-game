// REDESIGN3 (2026-11-17): today's Maps 0-20 cards, one line each (map ; id ; name ; rarity ; WxLy ; owner ; A/H ; fill ; effects ; species|animal). node table.js <out.txt>
const L = require('./lib.js');
const fs = require('fs');
const lines = L.roadCards().map(({ id, map }) => {
  const c = L.BYID[id], f = L.fillOf(c, c.effects || {}, c.attack, c.health);
  return [map, id, c.name, c.rarity, 'W' + (c.wait || 0) + 'L' + (c.cost || 0), L.OWNER.has(id) ? 'O' : '', c.attack + '/' + c.health, f.fill, JSON.stringify(c.effects || {}), (c.species || '') + '|' + (c.animal || '')].join(' ; ');
});
// submap lists of Maps 0-20 (for the Special / Faction skills)
const sub = [];
L.MAP_IDS.forEach((mid, mi) => Object.entries(L.POOLS[mid].submaps || {}).forEach(([sid, ids]) => ids.forEach(id => {
  const c = L.BYID[id]; if (!c) return;
  sub.push(['S' + mi, sid, id, c.name, c.rarity, c.attack + '/' + c.health, L.fillOf(c, c.effects || {}, c.attack, c.health).fill, JSON.stringify(c.effects || {})].join(' ; '));
})));
fs.writeFileSync(process.argv[2], lines.join('\n') + '\n--- submaps\n' + sub.join('\n'));
console.log(lines.length, sub.length);
