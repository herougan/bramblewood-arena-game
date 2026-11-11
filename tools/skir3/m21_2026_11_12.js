#!/usr/bin/env node
// 2026-11-12 (package SKIR3): Map 21 (The Quiet Summit) is only made legal on the owner's 11-12 list, not tuned (brief): each card a fight fields that
// is off the list (and not the fight's own reward) gives its copies to the list card nearest its stat score (skirmishCardScore) that the deck does not
// hold yet, within the rarity's copy cap and the road's rarity cap. Leaders, showcase and size kept.
//   node tools/skir3/m21_2026_11_12.js [--apply]   -> arena_app.js, docs/balance/skir3/m21-2026-11-12.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const LB = require('../lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE, LP = require('../lib_map_pools.js');
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')), m = G.CONQUEST_MAPS.find(x => x.id === 'm21'), pool = [...LP.fightPool(pools, 'm21', null)];
const score = id => G.skirmishCardScore(D[id] || {}), rows = []; let s = fs.readFileSync(APP, 'utf8');
const otherReward = (id, key) => { const c = (D[id] || {}).source; return !!(c && c.kind === 'map' && !(c.id === 'm21' && c.node === key)); };
for (const n of m.nodes || []) {
  if (!n.deck) continue; const own = G.nodeRewardCardIds('m21', n.key) || [], lead = (() => { try { G.NODE_MAP_HINT.set(n, 'm21'); return G.skirmishLeadersOf(n, 'm21') || []; } catch (e) { return []; } })();
  const bad = Object.keys(n.deck).filter(id => !pool.includes(id) && !own.includes(id) && id !== n.showcase); if (!bad.length) continue;
  const d = Object.assign({}, n.deck), moves = [];
  for (const b of bad) { const k = d[b]; delete d[b];
    const c = pool.filter(id => D[id] && !d[id] && !D[id].token && D[id].kind !== 'baby' && !otherReward(id, n.key) && G.roadRarityOk(D[id].rarity, 21, n.kind || 'skirmish', 'm21') && G.maxCopiesForRarity(D[id].rarity) >= 1)
      .sort((p, q) => Math.abs(score(p) - score(b)) - Math.abs(score(q) - score(b)) || (p < q ? -1 : 1));
    let left = k; for (const id of c) { const add = Math.min(left, G.maxCopiesForRarity(D[id].rarity)); if (add > 0) { d[id] = add; left -= add; moves.push(`${b} x${k} -> ${id} x${add}`); } if (!left) break; }
    if (left) moves.push(`${b}: ${left} copies left`); }
  const deck = Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]]));
  rows.push({ code: n.key, before: n.deck, after: deck, moves, leaders: lead }); console.log(n.key, moves.join('; '));
  if (process.argv.includes('--apply')) { const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${n.key}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('no line ' + n.key);
    s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck) + ` /* 2026-11-12 (SKIR3): made legal on the owner's 11-12 Map 21 list, not tuned: ${moves.join('; ')} */`)); }
}
if (process.argv.includes('--apply')) { fs.writeFileSync(APP + '.skir3tmp', s); fs.renameSync(APP + '.skir3tmp', APP); fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', 'm21-2026-11-12.json'), JSON.stringify({ about: 'SKIR3 Map 21 swaps (tools/skir3/m21_2026_11_12.js)', rows }, null, 1) + '\n'); }
