#!/usr/bin/env node
// Package BAL28 (2026-11-08): The Canopy (my, 14-A-*) retuned after CONTENT18's Canopy Bower. No games are played.
//   1. every fight with a dated BAL28 comment is a Canopy fight that a BAL28 tune or whole-space file kept (2+ points nearer its target at
//      200 games on the road seeds); the deck is the pick; new cards on the fight's list, within the road's rarity cap, no other fight's
//      reward; size and first-clear cards kept, K14 no worse, Shield not above the rule, no bramble Health or level override added; a leader
//      named is in the deck or is the fight's leader before.
//   2. the pins: the five fights hold exactly these decks / leaders / Shield overrides.
//   3. untouched: the Bower (CONTENT18-3), the Canopy fields (High Canopy, Spring Rain, Old Woods), cards.json, Gatorback Swamp (Map 5).
//   4. the lever, space and Bower files and decisions BAL28-n (under 100 words) exist.
//   node tests/bal28-2026-11-08.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js'));
const pools = J('canonical/map-pools.json'), src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const size = d => Object.values(d).reduce((t, k) => t + k, 0), keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const lineRe = /^\s*\{ ?key:\s*"([^"]+)",.*$/gm, lines = new Map(); { let x; while ((x = lineRe.exec(src))) if (!lines.has(x[1])) lines.set(x[1], x[0]); }
const fields = l => ({ deck: JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), leaders: JSON.parse((l.match(/leaders:(\[[^\]]*\])/) || [0, 'null'])[1]),
  shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1], hqHp: /hqHp:/.test(l.split('/*')[0]), castleLevel: /castleLevel:/.test(l.split('/*')[0]), characterId: /characterId:/.test(l.split('/*')[0]) });
const canopy = G.CONQUEST_MAPS.find(m => m.id === 'my');

// ---- 1. retune rules ----
const kept = {};
['tune', 'space'].map(d => path.join(ROOT, 'docs', 'balance', 'bal28', d)).filter(d => fs.existsSync(d)).forEach(dir =>
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); if (x.keep) (kept[x.code] = kept[x.code] || []).push(x); }));
const bal28 = [...lines.entries()].filter(([, l]) => /2026-11-08 \(BAL28\)/.test(l));
ok(bal28.length === 5, 'BAL28 retuned the five Canopy fights: ' + bal28.length);
for (const [code, l] of bal28) {
  if (/2026-11-09 \(BAL33\)/.test(l)) continue; // 2026-11-09 (BAL33): retuned again after BAL28-1 a / BAL28-2 b; tests/bal33-2026-11-09.js checks the deck now
  ok(/^14-A-[1-5]$/.test(code), code + ': a Canopy fight (Maps 0-20 only, no other map)');
  const now = fields(l), n0 = canopy.nodes.find(n => n.key === code), x = (kept[code] || []).find(y => keyOf(y.pick.deck) === keyOf(now.deck));
  ok(x && n0, code + ': the deck is a kept BAL28 pick'); if (!x || !n0) continue;
  const was = x.before.deck, d = now.deck, kind = n0.kind || 'skirmish', mapNo = G.mapNumberOf('my');
  ok(Math.abs(x.pick.win200 - x.band.target) + 2 <= Math.abs(x.before.win200 - x.band.target), `${code}: 2+ points nearer at 200 games (${x.before.win200} -> ${x.pick.win200}, target ${x.band.target})`);
  const list = LP.fightPool(pools, 'my', 'm5') || new Set();
  Object.keys(d).filter(id => !was[id]).forEach(id => { const s = (D[id] || {}).source;
    ok(D[id] && list.has(id), `${code}: ${id} is on the fight's list`);
    ok(D[id] && G.roadRarityOk(D[id].rarity, mapNo, kind), `${code}: ${id} within the road's rarity cap`);
    ok(!(s && s.kind === 'map' && s.node && !(s.id === 'my' && s.node === code)), `${code}: ${id} is not another fight's reward card`); });
  ok(size(d) === size(was), `${code}: deck size kept`);
  ((G.nodeFirstClearCardIds || G.nodeRewardCardIds)('my', code) || []).filter(id => was[id]).forEach(id => ok(d[id] > 0, `${code}: first-clear card ${id} kept`));
  const nk = Object.assign({}, n0, { leaders: (x.before.leaders || []).slice() });
  ok(K.violations({ map: 'my', key: code, n: nk }, d).length <= K.violations({ map: 'my', key: code, n: nk }, was).length, `${code}: K14 no worse`);
  ok(now.shield == null || +now.shield <= G.ruleShieldOf(n0), `${code}: Shield ${now.shield} not above the rule`);
  ok(!now.hqHp && !now.castleLevel && !now.characterId, `${code}: no bramble Health, level or bramble override`);
  ok(!now.leaders || now.leaders.every(id => d[id] || (x.before.leaders || []).includes(id)), `${code}: a named leader is in the deck or led before`);
}
// ---- 2. pins ----
const PINS = {
  '14-A-1': { deck: { 'hoopoe-herald': 5, 'leafcutter-gardener': 1, 'weaver-bird': 5, 'camouflage-frog': 1, 'pangolin-roller': 3, 'proboscis-monkey': 1 }, leaders: ['camouflage-frog'], shield: '0' },
  '14-A-2': { deck: { 'camouflage-frog': 1, 'hoopoe-herald': 3, 'proboscis-monkey': 1, 'redwood-woodpecker': 1, 'vampire-bat': 3, 'weaver-bird': 3 }, leaders: null, shield: '0' },
  '14-A-3': { deck: { 'hoopoe-herald': 5, 'kinkajou-lurker': 1, 'vampire-bat': 3, 'weaver-bird': 2, 'proboscis-monkey': 1, 'redwood-woodpecker': 1, 'camouflage-frog': 1 }, leaders: null, shield: '0' },
  '14-A-4': { deck: { 'apollo-butterfly': 1, 'camouflage-frog': 1, 'hercules-beetle': 3, 'jaguar-stalker': 3, 'leafcutter-gardener': 1, 'pangolin-roller': 2, 'proboscis-monkey': 1, 'redwood-woodpecker': 1, 'weaver-bird': 4 }, leaders: ['vampire-bat'], shield: '0' },
  '14-A-5': { deck: { 'apollo-butterfly': 1, 'camouflage-frog': 1, 'hoopoe-herald': 5, 'jaguar-stalker': 3, 'pangolin-roller': 3, 'weaver-bird': 5, 'proboscis-monkey': 1, 'leafcutter-gardener': 1 }, leaders: null, shield: '0' },
};
for (const [code, p] of Object.entries(PINS)) { const f = fields(lines.get(code) || ''); if (/2026-11-09 \(BAL33\)/.test(lines.get(code) || '')) continue; // 2026-11-09 (BAL33): pinned in tests/bal33-2026-11-09.js now
  ok(keyOf(f.deck) === keyOf(p.deck) && JSON.stringify(f.leaders) === JSON.stringify(p.leaders) && f.shield === p.shield, code + ': pinned deck / leader / Shield'); }
// ---- 3. untouched ----
const CB = J('canonical/characters.json').find(c => c.id === 'canopy-bower');
ok(CB && CB.health === 26 && JSON.stringify(CB.effects) === JSON.stringify({ habitatBonus: { kin: ['Rainforest', 'Savanna'], atk: 1, hp: 2 } }), 'the Canopy Bower unchanged (CONTENT18-3 is the owner\'s)');
canopy.nodes.filter(n => n.deck).forEach(n => { G.NODE_MAP_HINT.set(n, 'my'); const r = G.fightRules('my', n);
  ok(r.canopy === true && r.field === 'rain' && (!r.terrain || r.terrain.name === 'Old Woods'), n.key + ': canopy fields kept (High Canopy, Spring Rain, Old Woods)'); });
ok(!/BAL28/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), 'cards.json carries no BAL28 edit');
ok(![...lines.entries()].some(([code, l]) => /^5-/.test(code) && /BAL28/.test(l)), 'no Gatorback Swamp fight carries a BAL28 edit');
// ---- 4. files and decisions ----
['canopy-levers-2026-11-08.json', 'canopy-bower-2026-11-08.json'].forEach(f => ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal28', f)), f + ' exists'));
const dec = J('docs/decisions.json'), items = Array.isArray(dec) ? dec : (dec.decisions || dec.items || []);
const mine = items.filter(x => /^BAL28-\d/.test(x.id || ''));
ok(mine.length >= 1, 'decisions BAL28-n exist');
const words = s => String(s || '').split(/\s+/).filter(Boolean).length;
mine.forEach(x => ok(words(x.body) + words((x.options || []).join(' ')) < 100, x.id + ': body and options under 100 words'));
console.log(`bal28: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
