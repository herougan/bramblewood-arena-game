// REDESIGN3 helpers (2026-11-17): cards on their first Maps 0-20 list, owner flags, budget fill at Level 1 (tools/skill_costs.js budget()).
const ROOT = require('path').resolve(__dirname, '../..');
const fs = require('fs');
const SC = require(ROOT + '/tools/skill_costs.js');
const TABLE = JSON.parse(fs.readFileSync(ROOT + '/canonical/skill-costs.json', 'utf8'));
const T = SC.make(TABLE);
const CJ = JSON.parse(fs.readFileSync(ROOT + '/canonical/cards.json', 'utf8'));
const CARDS = Array.isArray(CJ) ? CJ : (CJ.cards || Object.values(CJ));
const BYID = {}; CARDS.forEach(c => BYID[c.id] = c);
const POOLS = JSON.parse(fs.readFileSync(ROOT + '/canonical/map-pools.json', 'utf8')).maps;
const CFG = JSON.parse(fs.readFileSync(ROOT + '/tools/pipeline/config.json', 'utf8'));
const OWNER = new Set(CFG.refit.ownerCards);
const MAP_IDS = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11'];
function roadCards() {
  const seen = new Set(), out = [];
  MAP_IDS.forEach((mid, mi) => (POOLS[mid].cards || []).forEach(id => { if (seen.has(id) || !BYID[id]) return; seen.add(id); out.push({ id, map: mi }); }));
  return out;
}
const r1 = v => Math.round(v * 10) / 10;
function fillOf(c, eff, A, H) {
  const d = Object.assign({}, c, { effects: eff, attack: A, health: H });
  const b = T.budget(d, { level: 1 });
  return { fill: r1(100 * Math.max(b.x1 / b.N, b.x2 / b.N2)), b };
}
module.exports = { ROOT, T, BYID, CARDS, roadCards, OWNER, fillOf, MAP_IDS, POOLS };
