#!/usr/bin/env node
// Package BAL21 (2026-11-07): Maps 0-20 after ENG27 / ENG28. No games are played; the checks read the data as it is now.
//   1. road retune (tools/bal21/road_tune_2026_11_07.js): every fight with a dated BAL21 comment is one the tune files kept (2+ points nearer
//      its target at 200 games on the road seeds); the fight's list, rarity cap, no other fight's reward, size and first-clear cards kept,
//      K14 no worse, Shield not above the rule, no bramble Health or enemy level override added; no Map 5 (Gatorback Swamp) fight touched.
//   2. the PRO fixes (tools/bal21/pro_fix_2026_11_07.js): a kept deck is in the file with its bal21 note, 20 cards, at most 6 different and 4
//      copies, its pool's cards, its leader kept, no more than 10 copies shared with the map's other strong decks.
//   3. every fight's reference deck is its own map's: the Map reference (referenceDeckFor) plays the road deck of the fight's map number (a side
//      map its parent's), and the reference ladder (the N-SK default) deals the fight's own map's ten decks (a side map its own), each deck
//      legal in that map's ladder pool (tools/bal13/ladder_2026_11_02.js poolOf); a road fight's map gives the same answer as its N-SK node.
//   4. no deck holds Hercules Beetle / Beetle Battering-Ram / Siege Rhino before its priced map (14-A-PRO-2 / 14-A-WPRO-2 swapped).
//   5. canonical/skill-costs.json prices Mulligan (-0.1) and Offspring (0); bramblewood-budget.js has no ENG28_SKILL_PRICES fallback.
//   6. cards.json carries no BAL21 edit; decisions BAL21-n under 100 words; the road totals file exists.
//   node tests/bal21-2026-11-07.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js'));
const pools = J('canonical/map-pools.json'), src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const size = d => Object.values(d).reduce((t, k) => t + k, 0), ovl = (x, y) => Object.keys(x).reduce((t, id) => t + Math.min(x[id], y[id] || 0), 0);
const lineRe = /^\s*\{ ?key:\s*"([^"]+)",.*$/gm, lines = new Map(); { let x; while ((x = lineRe.exec(src))) if (!lines.has(x[1])) lines.set(x[1], x[0]); }
const fields = l => ({ deck: JSON.parse((l.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]), leaders: (l.match(/leaders:(\[[^\]]*\])/) || [0, null])[1], shield: (l.match(/shieldOverride:(\d+)/) || [0, null])[1], hqHp: (l.match(/hqHp:(\d+)/) || [0, null])[1] });
const find = code => { for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue; const n = (m.nodes || []).find(x => x.key === code && x.deck); if (n) return { m, n }; } return null; };

// ---- 1. road retune ----
const tdirs = ['tune', 'tune-r2'].map(d => path.join(ROOT, 'docs', 'balance', 'bal21', d)).filter(d => fs.existsSync(d));
const tune = {}; tdirs.forEach(d => fs.readdirSync(d).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); if (x.keep) tune[x.code] = x; }));
const bal21Lines = [...lines.entries()].filter(([, l]) => /2026-11-07 \(BAL21\)/.test(l));
ok(bal21Lines.length >= 1, 'BAL21 retuned some road fights: ' + bal21Lines.length);
for (const [code, l] of bal21Lines) {
  if (/2026-11-10 \(BAL39\): retuned/.test(l)) continue; // 2026-11-10 (BAL39): retuned again (20-A-4); tests/bal39-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL38\): retuned/.test(l)) continue; // 2026-11-10 (BAL38): retuned again (4-1, 7-A-3, 7-A-4); tests/bal38-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL37\): retuned/.test(l)) continue; // 2026-11-10 (BAL37): retuned again (3-5, 20-7); tests/bal37-2026-11-10.js checks and pins it now
  if (/2026-11-10 \(BAL35\): retuned/.test(l)) continue; // 2026-11-10 (BAL35): retuned again (the worst road maps); tests/bal35-2026-11-10.js checks and pins it now
  if (/2026-11-09 \(BAL33\)/.test(l)) continue; // 2026-11-09 (BAL33): a Canopy fight BAL33 moved (BAL28-2 b: Sloth Boughs now in slot 14-A-1) or retuned; tests/bal33-2026-11-09.js checks it
  const x = tune[code], f = find(code); ok(x && f, code + ': kept in a BAL21 tune file and in CONQUEST_MAPS'); if (!x || !f) continue;
  // 2026-11-07 (BAL26): a fight BAL26 retuned again (its line carries a BAL26 comment) is checked here on BAL21's pick; tests/bal26-2026-11-07.js checks its deck now
  // 2026-11-08 (BAL28): + a Canopy fight BAL28 retuned again (14-A-3, 14-A-4); tests/bal28-2026-11-08.js checks its deck now
  const now = fields(l), MAP = f.m.id, mapNo = G.mapNumberOf(MAP), kind = f.n.kind || 'skirmish', was = x.before.deck, d = /2026-11-07 \(BAL26\)|2026-11-08 \(BAL27\)|2026-11-08 \(BAL28\)/.test(l) ? x.pick.deck : now.deck;
  ok(mapNo !== 5, code + ': not a Map 5 (Gatorback Swamp) fight');
  ok(mapNo != null && mapNo <= 20, code + ': on Maps 0-20');
  ok(Math.abs(x.pick.win200 - x.band.target) + 2 <= Math.abs(x.before.win200 - x.band.target), `${code}: 2+ points nearer the target at 200 games (${x.before.win200} -> ${x.pick.win200}, target ${x.band.target})`);
  ok(JSON.stringify(Object.keys(d).sort().map(k => k + d[k])) === JSON.stringify(Object.keys(x.pick.deck).sort().map(k => k + x.pick.deck[k])), code + ': the deck is the tune file\'s pick');
  const list = LP.fightPool(pools, MAP, f.m.sub ? f.m.parent : null) || new Set();
  Object.keys(d).filter(id => !was[id]).forEach(id => { const s = (D[id] || {}).source;
    ok(D[id] && list.has(id), `${code}: ${id} is on the fight's list`);
    ok(D[id] && G.roadRarityOk(D[id].rarity, mapNo, kind), `${code}: ${id} within the road's rarity cap`);
    ok(!(s && s.kind === 'map' && s.node && !(s.id === MAP && s.node === code)), `${code}: ${id} is not another fight's reward card`); });
  ok(size(d) === size(was), `${code}: deck size kept (${size(was)} -> ${size(d)})`);
  ((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(MAP, code) || []).filter(id => was[id]).forEach(id => ok(d[id] > 0, `${code}: first-clear card ${id} kept`));
  if (MAP !== 'm1') { const n0 = Object.assign({}, f.n, { leaders: (x.before.leaders || []).slice() }); // K14 read with the fight's leaders as they were
    ok(K.violations({ map: MAP, key: code, n: n0 }, d).length <= K.violations({ map: MAP, key: code, n: n0 }, was).length, `${code}: K14 no worse`); }
  const rule = G.ruleShieldOf(f.n);
  ok(now.shield == null || +now.shield <= Math.max(rule, x.before.shieldOverride == null ? 0 : +x.before.shieldOverride), `${code}: Shield override ${now.shield} not above the rule ${rule}`);
  ok(now.hqHp == null || /hqHp:/.test(lines.get(code)) && !x.pick.hqHp, code + ': no bramble Health override added by the tuner (its levers: deck, leader, Shield)');
}
ok(![...lines.entries()].some(([code, l]) => /^5-/.test(code) && /BAL21/.test(l)), 'no Map 5 / 5-A fight carries a BAL21 edit');

// ---- 2. PRO fixes ----
const pro = J('canonical/pro-skirmishes.json'), proDir = path.join(ROOT, 'docs', 'balance', 'bal21', 'pro');
const plan = J('docs/balance/bal16/refdecks-plan-2026-11-05.json');
const fixes = fs.existsSync(proDir) ? fs.readdirSync(proDir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(proDir, f), 'utf8'))) : [];
ok(fixes.length >= 7, 'the seven flagged PRO decks were worked on: ' + fixes.map(x => x.id).join(', '));
for (const x of fixes) {
  const ent = pro.maps[x.map], e = (ent.pro || []).find(y => y.id === x.id); ok(e, x.id + ': still in the file'); if (!e) continue;
  if (!x.keep) { ok(!e.bal21, x.id + ': not kept, no bal21 note'); continue; }
  ok(/BAL21/.test(e.bal21 || '') && JSON.stringify(e.deck) === JSON.stringify(x.pick.deck), x.id + ': the kept deck with its dated bal21 note');
  const ids = Object.keys(e.deck), pl = plan.maps[x.map].pro.pool;
  ok(size(e.deck) === 20 && ids.length <= 6 && ids.every(id => e.deck[id] <= 4 && pl.includes(id)), x.id + ': 20 cards, 6/4 rule, its PRO pool');
  ok(!(e.leaders || [])[0] || e.deck[e.leaders[0]] > 0, x.id + ': its leader card kept in the deck');
  (ent.pro || []).concat(ent.bpro || []).filter(y => y.id !== x.id).forEach(y => ok(ovl(e.deck, y.deck) <= 10, `${x.id}: shares ${ovl(e.deck, y.deck)} copies with ${y.id} (at most 10)`));
  ok(x.mode === 'easy' ? x.pick.win200 <= x.before.win200 : true, x.id + ': an easy PRO did not get easier');
}

// ---- 3. every fight's reference deck is its own map's ----
const LD = require(path.join(ROOT, 'tools', 'bal13', 'ladder_2026_11_02.js')), O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')), gm = O.loadGame(ROOT);
const lad = (G.REF_DECK_SETS.ladder || {}).decks || {}; let fightsSeen = 0;
const BAL24_LAD = J('docs/balance/ref/ref-ladder.json').ladder || {}, BAL24_P = {}, bal24Pool = id => BAL24_P[id] || (BAL24_P[id] = Object.values(J('docs/balance/bal24/pools/' + id + '.json').maps)[0].seeds); // BAL24 (2026-11-07)
for (const m of G.CONQUEST_MAPS) {
  if (m.reserved || m.tower || m.endless || /^mtut/.test(m.id)) continue; const no = G.mapNumberOf(m.id); if (no == null || no > 20) continue;
  const roadNo = m.sub ? G.mapNumberOf(m.parent) : no, pool = new Set(LD.poolOf(gm, m)), sk = { key: (m.sub ? m.id : String(no)) + '-SK', kind: 'skirmish', pro: true, skirm: true, deck: {} };
  const nodes = (m.nodes || []).filter(n => n.deck && Object.keys(n.deck).length).concat([sk]);
  for (const n of nodes) { fightsSeen++;
    const r = G.referenceDeckFor(m.id, n);
    ok(r.mapNo === (n === sk ? roadNo : G.nodeMapNumber(n)) || (n !== sk && n.shieldMap != null), `${m.id} ${n.key}: the Map reference plays its map's road deck (map ${r.mapNo})`);
    if (!lad[m.id]) continue;
    const seen = new Set(); for (let k = 1; k <= 10; k++) { const rs = G.refSetFor('ladder-' + k, m.id, n); seen.add(rs && rs.deckMap);
      // 2026-11-07 (package BAL24, owner BAL21-3): a simulated ladder deck's pool is its player's collection (docs/balance/bal24/pools/), not the map-true pool
      const simL = BAL24_LAD[m.id] || {}, simP = n === sk && simL.source === 'bal24-sim' ? new Set(bal24Pool(m.id)[simL.decks[k - 1].player].pool) : null;
      if (n === sk) Object.keys((rs || {}).deck || {}).forEach(id => ok((simP || pool).has(id), `${m.id} ${n.key} reference ${k}: ${id} is in the map's ladder pool`)); }
    ok(seen.size === 1 && seen.has(m.id), `${m.id} ${n.key}: the reference ladder deals the map's own decks (${[...seen].join(',')})`); }
}
ok(fightsSeen > 200, 'reference decks checked on ' + fightsSeen + ' fights');
// the 7-A-SK case (brief item 3): Garden Snail is on the Mycelium Deep's own list, Silver Minnow a Base card a player holds from the start
{ const mz = G.CONQUEST_MAPS.find(m => m.id === 'mz'), p = new Set(LD.poolOf(gm, mz));
  ok(p.has('garden-snail') && ((pools.maps || pools).mu.submaps.mz || []).includes('garden-snail'), "Garden Snail is in 7-A's ladder pool through the Mycelium Deep's own list");
  ok(p.has('silver-minnow') && G.cardSourceOf(D['silver-minnow']).kind === 'base', "Silver Minnow is in 7-A's ladder pool as a Base card"); }

// ---- 4. late-priced cards ----
const DK = require(path.join(ROOT, 'tools', 'bal13', 'decks_2026_11_02.js')), pl4 = DK.plan();
ok(pl4.rows.length === 0, 'no deck holds a late-priced card before its map: ' + pl4.rows.map(r => r.where).join(', '));
['14-A-PRO-2'].forEach(id => { const e = pro.maps.my.pro.find(y => y.id === id); ok(e && !e.deck['hercules-beetle'] && /BAL21/.test(e.bal13 || ''), id + ': Hercules Beetle swapped out, dated note'); });
{ const e = (pro.maps.my.wpro || []).find(y => y.id === '14-A-WPRO-2'); ok(e && !e.deck['hercules-beetle'], '14-A-WPRO-2: Hercules Beetle swapped out'); }

// ---- 5. skill costs ----
const sc = J('canonical/skill-costs.json'), SC = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(sc);
const mr = sc.skills.find(s => s.id === 'mulligan'), orow = sc.skills.find(s => s.id === 'offspring');
ok(mr && mr.value === -0.1 && orow && orow.value === 0, 'skill-costs.json: Mulligan -0.1, Offspring 0');
{ const a = SC.cardS({ mulligan: true }), b = SC.cardS({ offspring: 2 }); ok(a.S === -0.1 && !a.missing.length && b.S === 0 && !b.missing.length, 'the balance tools price both (no "missing")'); }
const BUD = require(path.join(ROOT, 'bramblewood-budget.js'));
ok(BUD.ENG28_SKILL_PRICES === undefined && !/const ENG28_SKILL_PRICES/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-budget.js'), 'utf8')), 'bramblewood-budget.js: the ENG28 fallback is gone');
ok(BUD.offspringBodyMult({ offspring: 2 }) === 1.64, 'Offspring keeps its body multiplier (1 + 0.32 N)');

// ---- 6. owner rules ----
ok(!/BAL21/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), 'cards.json: no BAL21 edit');
const dec = J('docs/decisions.json').items.filter(x => /^BAL21-\d+$/.test(x.id));
ok(dec.length >= 1, 'decisions BAL21-n: ' + dec.length);
dec.forEach(x => { const w = (x.body + ' ' + (x.options || []).join(' ')).split(/\s+/).filter(Boolean).length; ok(w < 100, `${x.id}: ${w} words (under 100)`); ok(x.group === 'game', x.id + ': group game'); });
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal21', 'road-totals-2026-11-07.json')), 'road totals file');
console.log(`bal21-2026-11-07: ${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
