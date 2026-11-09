#!/usr/bin/env node
// Package BAL33 (2026-11-09): The Canopy after decisions BAL28-1 a and BAL28-2 b (delegated by the owner 11-09 21:36). No games are played.
//   1. BAL28-1 a: on The Canopy the CPU's Canopy Bower has no ability (skirmishCastle gives it no effects; same Health and Shield); the
//      Bower itself (canonical/characters.json, a player's own bramble) keeps its +1/+2; other maps' brambles keep theirs.
//   2. BAL28-2 b: Dart Frogs and Sloth Boughs swapped slots 14-A-1 / 14-A-3; the slots keep their key, kind, requires and first-clear reward;
//      targets 90 / 80 / 70 / 60 / 40.
//   3. every Canopy fight with a dated BAL33 retune comment holds a kept pick from docs/balance/bal33/{space,space-r2,tune}: 2+ points nearer
//      its target at 200 games on the road seeds, the fight's own list, the road's rarity cap, no other fight's reward, size kept, first-clear
//      cards kept, K14 no worse than the fight before BAL33, Shield not above the rule, no bramble Health / level / bramble override.
//   4. the pins: the five fights' decks, leaders and Shields.
//   5. cards.json untouched by BAL33; the result files exist; decision BAL33-n (if any) under 100 words.
//   node tests/bal33-2026-11-09.js
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
const canopy = G.CONQUEST_MAPS.find(m => m.id === 'my'), node = k => canopy.nodes.find(n => n.key === k);

// ---- 1. the CPU's Bower is muted on The Canopy ----
B.CHARACTER_DEFS['bal33-test-bower'] = Object.assign({}, B.CHARACTER_DEFS['canopy-bower'], { id: 'bal33-test-bower' });
const CB = J('canonical/characters.json').find(c => c.id === 'canopy-bower');
ok(CB && CB.health === 26 && JSON.stringify(CB.effects) === JSON.stringify({ habitatBonus: { kin: ['Rainforest', 'Savanna'], atk: 1, hp: 2 } }), 'the Canopy Bower itself unchanged (a player keeps its buff)');
ok(/const CPU_BRAMBLE_PASSIVE = \{my:'canopy-bower'\};/.test(src), 'CPU_BRAMBLE_PASSIVE mutes the Bower on The Canopy only');
canopy.nodes.filter(n => n.deck).forEach(n => { G.NODE_MAP_HINT.set(n, 'my'); const sc = G.skirmishCastle(n);
  ok(sc.character.id === 'canopy-bower' && JSON.stringify(sc.character.effects) === '{}' && sc.character.cpuPassive === true, n.key + ': the CPU defends the Bower with no ability');
  const on = Object.assign({}, n, { characterId: 'bal33-test-bower' }); G.NODE_MAP_HINT.set(on, 'my'); const sOn = G.skirmishCastle(on); // the same Bower, not muted
  ok(sc.hp === sOn.hp && sc.shield === sOn.shield && sOn.character.effects.habitatBonus, n.key + ': the Bower\'s Health and Shield kept (' + sc.hp + ' + ' + sc.shield + ')'); });
{ const m5 = G.CONQUEST_MAPS.find(m => m.id === 'm5'), n = m5.nodes.find(x => x.deck && !x.characterId); G.NODE_MAP_HINT.set(n, 'm5'); const sc = G.skirmishCastle(n);
  ok(sc.character.id === 'acacia-kraal' && Object.keys(sc.character.effects || {}).length > 0, 'Savanna Reaches keeps its Acacia Kraal ability'); }
{ const eng = require(path.join(ROOT, 'bramblewood-engine.js')); ok(/habitatBonus: c18HabitatCfg\(chEffects\.habitatBonus\)/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')) && !!eng, 'the engine\'s habitatBonus unchanged (a player\'s Bower still buffs)'); }

// ---- 2. the slot swap ----
const SLOTS = { '14-A-1': ['skirmish', 'Sloth Boughs', [], 90], '14-A-2': ['skirmish', 'Strangler Arch', ['14-A-1'], 80], '14-A-3': ['skirmish', 'Dart Frogs', ['14-A-1'], 70], '14-A-4': ['elite', 'Drum Circle', ['14-A-2', '14-A-3'], 60], '14-A-5': ['boss', "The Jaguar's Path", ['14-A-4'], 40] };
for (const [k, [kind, name, req, t]] of Object.entries(SLOTS)) { const n = node(k); G.NODE_MAP_HINT.set(n, 'my');
  ok(n && n.kind === kind && n.name === name && JSON.stringify(n.requires) === JSON.stringify(req), `${k}: ${name}, ${kind}, requires ${req.join('+') || 'none'}`);
  ok(Math.round(G.skirmishTargetBand('my', n).t * 100) === t, `${k}: road target ${t}`); }
ok(JSON.stringify(G.nodeRewardCardIds('my', '14-A-3')) === JSON.stringify(['kinkajou-lurker']) && G.nodeRewardCardIds('my', '14-A-1').length === 0, 'first-clear rewards stay with their slots (Kinkajou Lurker at 14-A-3)');
ok(/BAL33, decision BAL28-2 b\): this fight moved from slot 14-A-3 to slot 14-A-1/.test(lines.get('14-A-1')) && /moved from slot 14-A-1 to slot 14-A-3/.test(lines.get('14-A-3')), 'the swap is dated on both lines');

// ---- 3. retune rules ----
const files = {}; ['space', 'space-r2', 'tune'].forEach(d => { const dir = path.join(ROOT, 'docs', 'balance', 'bal33', d); if (fs.existsSync(dir))
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); (files[x.code] = files[x.code] || []).push(Object.assign({ dir: d }, x)); }); });
const retuned = [...lines.entries()].filter(([, l]) => /2026-11-09 \(BAL33\): retuned/.test(l));
ok(retuned.length === 5, 'BAL33 retuned the five Canopy fights: ' + retuned.length);
for (const [code, l] of retuned) {
  if (/2026-11-10 \(BAL35\): retuned/.test(l)) continue; // 2026-11-10 (BAL35): retuned again (the worst road maps); tests/bal35-2026-11-10.js checks and pins it now
  ok(/^14-A-[1-5]$/.test(code), code + ': a Canopy fight');
  const now = fields(l), n0 = node(code), x = (files[code] || []).find(y => y.keep && keyOf(y.pick.deck) === keyOf(now.deck)), orig = (files[code] || []).find(y => y.dir === 'space');
  ok(x && orig && n0, code + ': the deck is a kept BAL33 pick'); if (!x || !orig || !n0) continue;
  const was = orig.before.deck, d = now.deck, kind = n0.kind || 'skirmish', mapNo = G.mapNumberOf('my');
  ok(Math.abs(x.pick.win200 - x.band.target) + 2 <= Math.abs(x.before.win200 - x.band.target), `${code}: 2+ points nearer at 200 games (${x.before.win200} -> ${x.pick.win200}, target ${x.band.target})`);
  const list = LP.fightPool(pools, 'my', 'm5') || new Set();
  Object.keys(d).filter(id => !was[id]).forEach(id => { const s = (D[id] || {}).source;
    ok(D[id] && list.has(id), `${code}: ${id} is on the fight's list`);
    ok(D[id] && G.roadRarityOk(D[id].rarity, mapNo, kind), `${code}: ${id} within the road's rarity cap`);
    ok(!(s && s.kind === 'map' && s.node && !(s.id === 'my' && s.node === code)), `${code}: ${id} is not another fight's reward card`); });
  ok(size(d) === size(was), `${code}: deck size kept (${size(was)})`);
  ((G.nodeFirstClearCardIds || G.nodeRewardCardIds)('my', code) || []).filter(id => was[id]).forEach(id => ok(d[id] > 0, `${code}: first-clear card ${id} kept`));
  const nk = Object.assign({}, n0, { leaders: (orig.before.leaders || []).slice() });
  ok(K.violations({ map: 'my', key: code, n: nk }, d).length <= K.violations({ map: 'my', key: code, n: nk }, was).length, `${code}: K14 no worse than before BAL33`);
  ok(now.shield == null || +now.shield <= G.ruleShieldOf(n0), `${code}: Shield ${now.shield} not above the rule`);
  ok(!now.hqHp && !now.castleLevel && !now.characterId, `${code}: no bramble Health, level or bramble override`);
  ok(!now.leaders || now.leaders.every(id => d[id] || (orig.before.leaders || []).includes(id) || (x.before.leaders || []).includes(id)), `${code}: a named leader is in the deck or led before`);
}
// ---- 4. pins ----
const PINS = require('./bal33-pins-2026-11-09.json');
for (const [code, p] of Object.entries(PINS)) { const f = fields(lines.get(code) || ''); if (/2026-11-10 \(BAL35\): retuned/.test(lines.get(code) || '')) continue; // 2026-11-10 (BAL35): pinned in tests/bal35-2026-11-10.js if retuned again
 
  ok(keyOf(f.deck) === keyOf(p.deck) && JSON.stringify(f.leaders) === JSON.stringify(p.leaders) && f.shield === p.shield, code + ': pinned deck / leader / Shield'); }
// ---- 5. untouched, files, decisions ----
ok(!/BAL33/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), 'cards.json carries no BAL33 edit');
ok(!/BAL33/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), 'skill-costs.json carries no BAL33 edit (ENG32-2 c: measure only)');
['canopy-before-2026-11-09.json', 'canopy-after-2026-11-09.json', 'swap-options-2026-11-09.json', 'dive-measure-2026-11-09.json'].forEach(f => ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal33', f)), f + ' exists'));
const dec = J('docs/decisions.json'), items = Array.isArray(dec) ? dec : (dec.decisions || dec.items || []);
const words = s => String(s || '').split(/\s+/).filter(Boolean).length;
items.filter(x => /^BAL33-\d/.test(x.id || '')).forEach(x => ok(words(x.body) + words((x.options || []).join(' ')) < 100, x.id + ': body and options under 100 words'));
console.log(`bal33: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
