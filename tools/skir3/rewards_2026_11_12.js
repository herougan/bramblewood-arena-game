#!/usr/bin/env node
// 2026-11-12 (package SKIR3): first-clear pack cards (GD-5: SKIRMISH_FIRST_PACK_CARDS and a node's own firstCard) whose card left its map's list with the
// owner's 11-12 picks swap for the nearest card of that list, as LISTFIX3 did (GD-5's rule, tools/gd5_first_cards_2026_10_22.js: a card of the map's
// list, the road's rarity cap for the map (roadRarityOk), plain on Maps 0-1, not another fight's first-clear card there, not a skirmish-exclusive
// reward). Nearest: a card the fight's deck fields first, then one new on the map (NEW!), the same rarity as the old card, the closest cost, best
// UI38 fit. Maps 0-21 and their side maps. Writes arena_app.js (the table line or the node's firstCard, with a dated comment) and
// docs/balance/skir3/rewards-2026-11-12.json.   node tools/skir3/rewards_2026_11_12.js [--dry]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const DRY = process.argv.includes('--dry');
const LB = require('../lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE, LP = require('../lib_map_pools.js');
const pools = J('canonical/map-pools.json'), APP = path.join(ROOT, 'arena_app.js'); let src = fs.readFileSync(APP, 'utf8');
const L = J('docs/balance/skir3/lists-2026-11-12.json');
const FIT = {}; Object.entries(J('docs/design/map-prospects-2026-11-09.json').maps).forEach(([k, m]) => { FIT[k] = {}; (m.fit || []).forEach(([id, s]) => { FIT[k][id] = s; }); });
const table = {}; (src.match(/const SKIRMISH_FIRST_PACK_CARDS = \{([\s\S]*?)\n\};/)[1].match(/'[^']+': '[^']+'/g) || []).forEach(x => { const m = x.match(/'([^']+)': '([^']+)'/); table[m[1]] = m[2]; });
const RANK = ['starter', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'], rk = r => Math.max(0, RANK.indexOf(r));
const SCOPE = new Set(Object.keys(L.main).concat(Object.keys(L.side)));
const plain = c => !Object.keys(c.effects || {}).filter(k => !['flying', 'diurnal', 'nocturnal', 'swimmer'].includes(k)).length;
const rec = { about: 'SKIR3: first-clear pack cards that left their map\'s list, swapped for the nearest card of the list (tools/skir3/rewards_2026_11_12.js)', built: '2026-11-12', swaps: [], none: [] };
for (const m of G.CONQUEST_MAPS) {
  if (!SCOPE.has(m.id)) continue;
  const top = m.sub ? m.parent : m.id, pool = LP.fightPool(pools, m.id, m.sub ? m.parent : null), no = G.mapNumberOf(m.id);
  const neu = new Set(m.sub ? [] : (L.main[m.id].list || []).filter(id => !Object.values(L.main).some(r => r.mapNo < no && r.list.includes(id))));
  const used = new Set(); (m.nodes || []).forEach(n => { const v = n.firstCard != null ? n.firstCard : table[m.id + ':' + n.key]; [].concat(v || []).forEach(id => used.add(id)); });
  for (const n of m.nodes || []) {
    const fromNode = n.firstCard != null, v = fromNode ? n.firstCard : table[m.id + ':' + n.key]; if (!v || Array.isArray(v)) continue;
    if (pool.has(v)) continue;
    const old = D[v] || {}, kind = n.kind || 'skirmish', deck = n.deck || {};
    const cand = [...pool].filter(id => { const c = D[id]; if (!c || used.has(id) || c.token || c.test || c.hero || c.pool || c.kind === 'baby') return false; const s = c.source || {};
      if (s.kind === 'map') return false; try { if (!G.roadRarityOk(c.rarity, no, kind, m.id)) return false; } catch (e) {} if (no <= 1 && !plain(c)) return false; return true; })
      .sort((a, b) => (deck[b] ? 1 : 0) - (deck[a] ? 1 : 0) || (neu.has(b) ? 1 : 0) - (neu.has(a) ? 1 : 0) || Math.abs(rk(D[a].rarity) - rk(old.rarity)) - Math.abs(rk(D[b].rarity) - rk(old.rarity))
        || Math.abs((D[a].cost || 0) - (old.cost || 0)) - Math.abs((D[b].cost || 0) - (old.cost || 0)) || ((FIT[top] || {})[b] || 0) - ((FIT[top] || {})[a] || 0) || (a < b ? -1 : 1));
    if (!cand.length) { rec.none.push({ map: m.id, fight: n.key, was: v }); continue; }
    const to = cand[0]; used.add(to);
    rec.swaps.push({ map: m.id, mapNo: no, fight: n.key, field: fromNode ? 'firstCard' : 'SKIRMISH_FIRST_PACK_CARDS', was: v, wasName: old.name, now: to, nowName: D[to].name, why: `${old.name} is off ${m.sub ? 'the side map\'s' : 'the map\'s'} 11-12 list` + (deck[to] ? '; the fight fields it' : '') });
  }
}
rec.swaps.forEach(s => console.log(`${s.map}:${s.fight} ${s.field === 'firstCard' ? '(node) ' : ''}${s.was} -> ${s.now}`));
rec.none.forEach(s => console.log(`${s.map}:${s.fight} ${s.was}: no card on the list fits`));
if (DRY) { console.log('dry run'); process.exit(0); }
const note = s => ` // 2026-11-12 (SKIR3): was ${s.was}, off the map's 11-12 list (GD-5: the nearest card of the list)`;
rec.swaps.forEach(s => {
  if (s.field === 'SKIRMISH_FIRST_PACK_CARDS') {
    const re = new RegExp(`^(  '${s.map}:${s.fight}': )'${s.was}',.*$`, 'm');
    if (!re.test(src)) throw new Error('table line ' + s.map + ':' + s.fight);
    src = src.replace(re, (_, a) => `${a}'${s.now}',${note(s)}`);
  } else {
    const re = new RegExp(`(\\{ key:"${s.fight}"[^\\n]*?firstCard:)"${s.was}"`);
    if (!re.test(src)) throw new Error('node ' + s.fight);
    src = src.replace(re, (_, a) => `${a}"${s.now}" /* 2026-11-12 (SKIR3): was ${s.was}, off the 11-12 list (GD-5) */`);
  }
});
// the run's record keeps the first run's swaps (a re-run finds none left)
const RECF = path.join(ROOT, 'docs', 'balance', 'skir3', 'rewards-2026-11-12.json');
if (fs.existsSync(RECF)) { const prev = J('docs/balance/skir3/rewards-2026-11-12.json'); rec.swaps = prev.swaps.concat(rec.swaps); rec.none = rec.none.length ? rec.none : prev.none; }
fs.writeFileSync(APP + '.skir3tmp', src); fs.renameSync(APP + '.skir3tmp', APP);
fs.writeFileSync(RECF, JSON.stringify(rec, null, 1) + '\n');
console.log('-> arena_app.js, docs/balance/skir3/rewards-2026-11-12.json');
