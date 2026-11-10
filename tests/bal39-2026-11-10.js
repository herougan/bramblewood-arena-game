#!/usr/bin/env node
// Package BAL39 (2026-11-10): Eye of the Volcano (me), The Sunken Grove (ms) and the still-off fights of Basalt Foundry (m9), Pebble Beach
// (mb) and The Old Bramble (mo) retuned with BAL35-38's levers and tools (the fight's own list, leader, Shield; tools/bal37/road_exhaust
// (the showcase leader kept), tools/bal39/pick and apply; keep rule unchanged). No games are played. BAL39 adds: a boss keeps its leaders
// and its leader cards stay in its deck; the fights named unreachable in BAL35-2 / BAL36-1 / BAL37-1 are not retuned.
//   1. every fight with a dated BAL39 retune comment is on one of those two maps and holds a kept pick from docs/balance/bal39/{exhaust,
//      exhaust-r2,tune,tune-r2,pick}: 2+ points nearer its target at 200 games on the road seeds; new cards on the fight's list, within the
//      road's rarity cap, not another fight's reward; size and first-clear cards kept; K14 no worse; Shield not above the rule; no bramble
//      Health, level or bramble override added; a named leader is in the deck, led before, or (not a challenge fight) on the fight's list;
//      a fight that names no leaders is still led by the card it was led by (its deck's showcase).
//   2. the pins: the retuned fights' decks, leaders and Shields (tests/bal39-pins-2026-11-10.json).
//   3. cards.json carries no BAL39 edit; the result files exist; decisions BAL39-n under 100 words.
//   node tests/bal39-2026-11-10.js
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
  shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1], hqHp: (l.split('/*')[0].match(/hqHp:(\d+)/) || [0, null])[1], castleLevel: /castleLevel:/.test(l.split('/*')[0]), characterId: (l.split('/*')[0].match(/characterId:"([^"]+)"/) || [0, null])[1] });
const find = code => { for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue; const n = (m.nodes || []).find(x => x.key === code && x.deck); if (n) return { m, n }; } return null; };

// ---- 1. retune rules ----
const UNREACHABLE = ['2-1', '2-2', '14-1', '14-6', '19-A-3', '19-A-7', '19-A-8', '0-B-1', '0-B-2', '14-A-1', '14-A-3', '14-3', '14-5', '20-9']; // BAL35-2, BAL36-1, BAL37-1
const files = {}; ['exhaust', 'exhaust-r2', 'tune', 'tune-r2', 'pick'].forEach(d => { const dir = path.join(ROOT, 'docs', 'balance', 'bal39', d); if (fs.existsSync(dir))
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); (files[x.code] = files[x.code] || []).push(Object.assign({ dir: d }, x)); }); });
const retuned = [...lines.entries()].filter(([, l]) => /2026-11-10 \(BAL39\): retuned/.test(l));
ok(retuned.length >= 1, 'BAL39 retuned some road fights: ' + retuned.length);
for (const [code, l] of retuned) { if (/\(SKIR1( fit)?\): /.test(l)) continue; /* 2026-11-11 (SKIR1): rebuilt from the new map lists; tests/skir1-2026-11-11.js checks it now */
  const f = find(code); ok(f, code + ': in CONQUEST_MAPS'); if (!f) continue;
  const MAP = f.m.id, mapNo = G.mapNumberOf(MAP), kind = f.n.kind || 'skirmish', now = fields(l);
  ok(['me', 'ms', 'm9', 'mb', 'mo'].includes(MAP), code + ': on Eye of the Volcano, The Sunken Grove, Basalt Foundry, Pebble Beach or The Old Bramble');
  ok(!UNREACHABLE.includes(code), code + ': not a fight named unreachable in BAL35-2 / BAL36-1 / BAL37-1');
  const x = (files[code] || []).find(y => y.keep && keyOf(y.pick.deck) === keyOf(now.deck) && (y.pick.shieldOverride == null ? null : String(y.pick.shieldOverride)) === now.shield);
  ok(x, code + ': the deck and Shield are a kept BAL39 pick'); if (!x) continue;
  const was = x.before.deck, d = now.deck;
  ok(Math.abs(x.pick.win200 - x.band.target) + 2 <= Math.abs(x.before.win200 - x.band.target), `${code}: 2+ points nearer at 200 games (${x.before.win200} -> ${x.pick.win200}, target ${x.band.target})`);
  const list = LP.fightPool(pools, MAP, f.m.sub ? f.m.parent : null) || new Set();
  Object.keys(d).filter(id => !was[id]).forEach(id => { const s = (D[id] || {}).source;
    ok(D[id] && list.has(id), `${code}: ${id} is on the fight's list`);
    ok(D[id] && G.roadRarityOk(D[id].rarity, mapNo, kind), `${code}: ${id} within the road's rarity cap`);
    ok(!(s && s.kind === 'map' && s.node && !(s.id === MAP && s.node === code)), `${code}: ${id} is not another fight's reward card`); });
  ok(size(d) === size(was), `${code}: deck size kept (${size(was)})`);
  ((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(MAP, code) || []).filter(id => was[id]).forEach(id => ok(d[id] > 0, `${code}: first-clear card ${id} kept`));
  { const nk = Object.assign({}, f.n, { leaders: (x.before.leaders || []).slice() });
    ok(K.violations({ map: MAP, key: code, n: nk }, d).length <= K.violations({ map: MAP, key: code, n: nk }, was).length, `${code}: K14 no worse than before BAL39`); }
  ok(now.shield == null || +now.shield <= Math.max(G.ruleShieldOf(f.n), x.before.shieldOverride == null ? 0 : +x.before.shieldOverride), `${code}: Shield ${now.shield} not above the rule (or the override it had before BAL39)`);
  ok(!now.castleLevel && (x.before.shieldOverride == null || now.shield != null), `${code}: no level override added, Shield override not dropped`);
  ok(!now.leaders || now.leaders.every(id => d[id] || (x.before.leaders || []).includes(id) || (!f.n.challenge && list.has(id) && D[id] && G.roadRarityOk(D[id].rarity, mapNo, kind))), `${code}: a named leader is in the deck, led before, or (not a challenge fight) on the fight's list`);
  if (kind === 'boss') (x.before.leaders || []).forEach(id => { ok(!now.leaders || now.leaders.includes(id), `${code}: the boss keeps its leader ${id}`); ok(!was[id] || d[id] > 0, `${code}: the boss keeps its leader card ${id} in its deck`); });
  ok(!f.n.challenge || !now.leaders || now.leaders.every(id => d[id]), `${code}: a challenge fight leads with a card of its deck`);
  if (!now.leaders && !f.n.leaderId) { const n0 = Object.assign({}, f.n, { deck: was }), n1 = Object.assign({}, f.n, { deck: d }); delete n0.leaders; delete n1.leaders; G.NODE_MAP_HINT.set(n0, MAP); G.NODE_MAP_HINT.set(n1, MAP);
    ok(JSON.stringify(G.skirmishLeadersOf(n1, MAP)) === JSON.stringify(G.skirmishLeadersOf(n0, MAP)), `${code}: no leaders named, so the deck's showcase still leads (${G.skirmishLeadersOf(n0, MAP)})`); }
  ok(/BAL39\): retuned toward the road curve after BAL38 \(target [\d.]+\), [\d.]+% -> [\d.]+% at 200 games/.test(l), code + ': dated comment with before / after');
}
const PINS = J('tests/bal39-pins-2026-11-10.json');
ok(Object.keys(PINS).length === retuned.length && retuned.every(([c]) => PINS[c]), 'the pins list exactly the retuned fights');
// ---- 2. pins ----
for (const [code, p] of Object.entries(PINS)) { if (/\(SKIR1( fit)?\): /.test(lines.get(code) || "")) continue; /* 2026-11-11 (SKIR1): rebuilt, checked by tests/skir1-2026-11-11.js */ const f = fields(lines.get(code) || '');
  ok(keyOf(f.deck) === keyOf(p.deck) && JSON.stringify(f.leaders) === JSON.stringify(p.leaders) && f.shield === p.shield, code + ': pinned deck / leader / Shield');
  ok(f.hqHp === p.hqHp && f.characterId === p.characterId, code + ': bramble Health and bramble as before BAL39'); }
// ---- 3. untouched, files, decisions ----
ok(!/\bBAL39\b/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), 'cards.json carries no BAL39 edit'); // BAL39: word match (a base64 art string holds the letters BAL39)
['tune-2026-11-10.json', 'road-totals-2026-11-10.txt'].forEach(f => ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal39', f)), f + ' exists'));
const dec = J('docs/decisions.json'), items = dec.items || [];
const words = s => String(s || '').split(/\s+/).filter(Boolean).length;
items.filter(x => /^BAL39-\d/.test(x.id || '')).forEach(x => ok(words(x.body) + words((x.options || []).join(' ')) < 100, x.id + ': body and options under 100 words'));
console.log(`bal39: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
