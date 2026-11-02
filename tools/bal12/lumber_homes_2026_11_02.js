#!/usr/bin/env node
// 2026-11-02 (package BAL12, owner BAL11-4 a): each Lumber maker's home lists and their pools' mean Lumber cost, for its price
// (bramblewood-budget.js lumberHomeMult; tools/skill_costs.js reads canonical/skill-costs.json "lumberHome").
//   node tools/bal12/lumber_homes_2026_11_02.js [--write]
// A Lumber maker: a card with On Ready +N Lumber (onReadyGold) or a trigger that gains Lumber. Its homes: the map lists (main, SPECIAL and side
// map lists) that hold it, as tools/bal9/zeit_home_2026_11_02.js finds them. Each home's mean Lumber cost is the mean `cost` of that map's
// own pool as the bench builds it (tools/bench/lib.js contextOf, kind map, deckopt's bpro pool: the map's cards within its rarity cap, the
// pool tools/bal12/lumber_home_2026_11_02.js measured in), and the card's value is the mean over its homes. A maker on no list gets none
// (the multiplier is 1).
'use strict';
const fs = require('fs'), path = require('path');
const L = require('../bench/lib.js'), BB = require('../../bramblewood-budget.js');
const ROOT = L.ROOT, gm = L.O.loadGame(ROOT), r3 = v => Math.round(v * 1000) / 1000;
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps || {};
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const homeOf = id => { const out = new Set();
  Object.entries(pools).forEach(([mid, e]) => { if ((e.cards || []).includes(id) || (e.special || []).includes(id)) out.add(mid);
    Object.entries(e.submaps || {}).forEach(([sid, l]) => { const list = Array.isArray(l) ? l : (l && l.cards) || []; if (list.includes(id)) out.add(sid); }); });
  return [...out]; };
const isMaker = c => { const e = c.effects || {}; return (BB.LUMBER_MAKER_KEYS || ['onReadyGold']).some(k => e[k]) || (e.triggers || []).some(t => t && t.do === 'gain' && t.resource === 'lumber'); };
const meanOfCtx = {}, ctxMean = id => { if (meanOfCtx[id] !== undefined) return meanOfCtx[id];
  try { const X = L.contextOf(gm, { kind: 'map', map: id, k: 6, mode: 'bpro' }); meanOfCtx[id] = X.pool.length ? r3(X.pool.reduce((t, c) => t + (+(gm.D[c] && gm.D[c].cost) || 0), 0) / X.pool.length) : null; }
  catch (e) { meanOfCtx[id] = null; } return meanOfCtx[id]; };
const lumberHome = {}, rows = [];
cards.filter(c => c.health != null && !c.token && !c.test && isMaker(c)).forEach(c => {
  const homes = homeOf(c.id).map(m => ({ map: m, mean: ctxMean(m) })).filter(h => h.mean != null); if (!homes.length) { rows.push({ id: c.id, homes: [], mean: null }); return; }
  const mean = r3(homes.reduce((t, h) => t + h.mean, 0) / homes.length); lumberHome[c.id] = mean;
  rows.push({ id: c.id, homes, mean, mult: BB.lumberHomeMult ? BB.lumberHomeMult(mean) : null }); });
rows.forEach(r => console.log(`${r.id.padEnd(26)} ${r.mean == null ? 'no list' : r.mean + (r.mult != null ? ' x' + r.mult : '')}  ${r.homes.map(h => h.map + ' ' + h.mean).join(', ')}`));
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal12'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal12', 'lumber-homes-2026-11-02.json'), JSON.stringify({ tool: 'tools/bal12/lumber_homes_2026_11_02.js', generated: '2026-11-02', rows }, null, 1) + '\n');
if (process.argv.includes('--write')) { const f = path.join(ROOT, 'canonical', 'skill-costs.json'); let s = fs.readFileSync(f, 'utf8');
  const v = Object.assign({ _about: '2026-11-02 (package BAL12, owner BAL11-4 a): each Lumber maker\'s home lists\' mean Lumber cost (their bench pools; tools/bal12/lumber_homes_2026_11_02.js, docs/balance/bal12/lumber-homes-2026-11-02.json); bramblewood-budget.js lumberHomeMult prices its Lumber skill by it.' }, lumberHome);
  const line = ' "lumberHome": ' + JSON.stringify(v);
  s = /\n "lumberHome": .*\n/.test(s) ? s.replace(/\n "lumberHome": .*\n/, '\n' + line + '\n') : s.replace(/\n}\s*$/, ',\n' + line + '\n}\n');
  JSON.parse(s); fs.writeFileSync(f, s); console.log('-> canonical/skill-costs.json lumberHome (' + Object.keys(lumberHome).length + ' cards)'); }
