#!/usr/bin/env node
// Package ECON1 phase 2 (2026-11-23; owner 11-22 23:08: "advise AND execute first ... skirmish rewards, reward growth, pack costs etc. I think a
// pack should instead contain 5 cards by default now, instead of 3"; built with the defaults ECON1-1 a, ECON1-2 a, ECON1-3 a of
// docs/design/econ1-2026-11-22.md section 9):
//   1. the basic packs hold 5 cards and cost Maple Leaves only (Pouch 80, Chest 100, Case 125, Mystery Booster 120); PACK_DEFAULT_CARDS 5
//   2. the map-end pack holds 5; faction packs stay 2 + 1 (ECON1-2 a)
//   3. first clears grow +10% Leaves / +5% Dust a map (side maps: the map that opens them); not daily dungeons, the Spire or PRO; overrides win
//   4. the mini-boss row, the 41 side-map overrides gone, the Ambush pays 160 / 195; repeats unchanged
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools/lib_bramble.js')), G = B.G, src = B.src;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const val = name=> new Function(B.grab(name) + '\nreturn ' + name + ';')();

// ---------- 1. packs ----------
const shop = new Function(B.grab('PACK_DEFAULT_CARDS') + '\n' + B.grab('SHOP_PACKS_DEFAULT') + '\nreturn SHOP_PACKS_DEFAULT;')();
const want = {bronze: 80, silver: 100, gold: 125, mystery: 120};
Object.keys(want).forEach(id=>{ const p = shop.find(x=> x.id === id) || {cost: {}};
  ok(p.cards === 5, `1. ${p.name || id}: 5 cards (was 3)`);
  ok(p.cost.gold === want[id] && !(p.cost.gems > 0), `1. ${p.name || id}: ${want[id]} Leaves and no Gold Leaves (ECON1-1 a), got ${p.cost.gold} + ${p.cost.gems}`); });
ok(shop.find(x=> x.id === 'silver').collectorCost.gold === 720 && shop.find(x=> x.id === 'gold').collectorCost.gems === 180, '1. Collector packs unchanged');
ok(val('PACK_DEFAULT_CARDS') === 5 && !/cards *\|\| *3\b/.test(src), '1. PACK_DEFAULT_CARDS is 5 and no `cards || 3` fallback is left');

// ---------- 2. map-end and faction packs ----------
ok(/const MAP_END_PACKS = true, MAP_END_PACK_CARDS = 5;/.test(src), '2. the map-end pack holds 5 cards');
ok(/^const FACTION_PACK_OWN = 2, FACTION_PACK_GENERAL = 1;/m.test(src) && /cards: FACTION_PACK_OWN \+ FACTION_PACK_GENERAL, kind:'faction'/.test(src), '2. faction packs stay 3 cards (2 own + 1 general, ECON1-2 a)');

// ---------- 3. first-clear growth ----------
const tierOf = (()=>{ const econ = ['ECON_INCOME_MULT', 'ECON_HALVED_KINDS', 'econMult', 'econScale'].map(B.grab).join('\n');
  return new Function('baseKind', 'mapUnlockNumberOf', 'mapOfNode', 'CONQUEST_MAPS', econ + '\n' + B.grab('CONQUEST_NODE_REWARDS') + '\n' + B.grab('FIRST_CLEAR_MAP_STEP') + '\n' + B.grab('DAILY_DUNGEON_PAY') + '\n' + B.grab('dailyDungeonPay') + '\n' + B.grab('nodeRewardTier') + '\nreturn nodeRewardTier;')(G.baseKind, G.mapUnlockNumberOf, G.mapOfNode, G.CONQUEST_MAPS); })();
ok(JSON.stringify(val('FIRST_CLEAR_MAP_STEP')) === '{"gold":0.1,"dust":0.05}', '3. FIRST_CLEAR_MAP_STEP is +10% Leaves, +5% Dust a map (ECON1-3 a)');
const MAIN = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved);
const firstOf = (map, kind)=> map.nodes.find(x=> x.kind === kind && !(x.rewards && x.rewards.first));
[[0, 40, 20], [5, 60, 25], [10, 80, 30], [15, 100, 35], [20, 120, 40]].forEach(([i, g, d])=>{ const m = MAIN[i], node = firstOf(m, 'skirmish'); const t = node && tierOf(node, m);
  ok(t && t.first.gold === g && t.first.dust === d, `3. a Map ${i} skirmish pays ${g} / ${d} on its first clear (got ${t && t.first.gold} / ${t && t.first.dust})`); });
{ const m = MAIN[10], node = firstOf(m, 'elite'); const t = node && tierOf(node, m); ok(!node || (t.first.gold === 140 && t.first.dust === 102), '3. a Map 10 elite pays 140 / 102'); }
{ const t = tierOf(firstOf(MAIN[10], 'skirmish')); ok(t.first.gold === 80, '3. without a map argument the node finds its map (mapOfNode)'); }
{ const ms = G.CONQUEST_MAPS.find(m=> m.id === 'ms'), node = ms.nodes.find(x=> x.key === '5-A-1'), t = tierOf(node, ms);
  ok(G.mapUnlockNumberOf('ms') === 13 && t.first.gold === 92 && t.first.dust === 33, `3. the Sunken Grove (opens at Map 13) pays like Map 13: 5-A-1 92 / 33 (got ${t.first.gold} / ${t.first.dust})`); }
{ const mm = G.CONQUEST_MAPS.find(m=> m.id === 'mm'), node = mm.nodes[0], t = tierOf(node, mm), dp = val('DAILY_DUNGEON_PAY').mm;
  ok(t.first.gold === node.rewards.first.gold + dp.gold && t.first.dust === node.rewards.first.dust + dp.dust, '3. a daily dungeon floor keeps its own first clear (no growth)'); }
ok(tierOf({kind: 'skirmish', tower: true, key: 'x'}).first.gold === 40 && tierOf({kind: 'skirmish', pro: true, key: 'x'}).first.gold === 40, '3. the Spire and PRO fights pay the flat row');
{ const m = MAIN[10], node = Object.assign({}, firstOf(m, 'skirmish'), {rewards: {first: {gold: 55, dust: 7}}}); const t = tierOf(node, m); ok(t.first.gold === 55 && t.first.dust === 7, '3. a node\'s own first-clear override wins'); }
{ const m = MAIN[20], node = firstOf(m, 'skirmish'), t = tierOf(node, m); ok(t.repeat.gold === 4 * (t.repeatEnergy || 1) && t.repeat.dust === (t.repeatEnergy || 1), '3. repeat pay unchanged (4 Leaves + 1 Dust a point of Energy)'); }
{ const alone = new Function(B.grab('CONQUEST_NODE_REWARDS') + '\n' + B.grab('nodeRewardTier') + '\nreturn nodeRewardTier;')(); const t = alone({kind: 'skirmish', key: 'x'}); ok(t.first.gold === 40 && t.first.dust === 20, '3. nodeRewardTier lifted alone (tools) still runs and pays the flat row'); }

// ---------- 4. rows and overrides ----------
const row = val('CONQUEST_NODE_REWARDS');
ok(JSON.stringify(row.miniboss) === '{"first":{"gold":95,"dust":115},"repeat":{"gold":18,"dust":7}}', '4. the mini-boss row 95 / 115 (repeat 18 / 7)');
const sideKeys = []; [['2-B', 4], ['5-A', 4], ['7-A', 5], ['8-A', 4], ['11-A', 4], ['18-A', 9], ['20-A', 7], ['20-B', 4]].forEach(([p, k])=>{ for(let i = 1; i <= k; i++) sideKeys.push(p + '-' + i); });
const nodeByCode = code=>{ for(const m of G.CONQUEST_MAPS) for(const x of (m.nodes || [])) if(x.key === code) return x; return null; };
const still = sideKeys.filter(k=>{ const x = nodeByCode(k); return !x || (x.rewards && x.rewards.first); });
ok(sideKeys.length === 41 && !still.length, '4. the 41 side-map first-clear overrides are gone: ' + still.join(', '));
ok(['17-A-1', '0-B-1'].every(k=> (nodeByCode(k).rewards || {}).first), '4. side maps past Map 20 (17-A, 0-B) keep theirs');
ok(/key:'ambush', kind:'elite'[\s\S]{0,900}rewards:\{first:\{gold:160, dust:195\}\}/.test(src), '4. the Ambush pays 160 / 195 on its first clear');

console.log(`econ1-2026-11-23: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
