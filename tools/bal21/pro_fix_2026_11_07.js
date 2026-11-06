#!/usr/bin/env node
// 2026-11-07 (package BAL21 item 2): the PRO decks the PRO ease check (tools/opt/pro_ease.js, docs/balance/pro-ease-eng28.json) flags after ENG28:
// six the Map reference beats over 85% (too easy: 2-B-PRO-4, 3-PRO-1, 7-PRO-1, 7-PRO-4, 20-PRO-3, 20-A-PRO-2) and 17-PRO-2, a wall for Reference-2
// (the owner's Ant Deck, under 10%). A local descent on the deck, inside BAL16's PRO rules (tools/bal16/refdecks_2026_11_05.js): its PRO pool
// (docs/balance/bal16/refdecks-plan-2026-11-05.json maps.<id>.pro.pool), 20 cards, at most 6 different cards and 4 copies, the rarity copy
// caps, at least 10 copies from the map's list (the plan's anchor), its leader card kept in the deck, and at most 10 copies shared with any other
// strong deck of the map (PRO + BPRO). The game's own fight: pro_ease.js's (proNode + the PRO rule's CPU, the PRO at Level 1, the reference set
// at its schedule), so a reading here is a pro_ease reading.
// A step: every move of 1 or 2 copies (out -> another pool card) screened at --screen games (16) on the tune seeds fnv('bal21|<id>|<ref>'),
// the best 4 re-read at --reread (60); kept when it is 3+ points nearer the window. Windows: an easy PRO wants the Map reference at or under
// 75% (10 under the 85% flag); the wall wants Reference-2 between 20% and 50% (17-PRO-1 reads 25%). Then 200 games on the pro_ease seeds
// (fnv('pro-ease|<id>|<ref>') + 37g): the change is kept only when that reading is in the window or 5+ points nearer it than the deck was.
//   node tools/bal21/pro_fix_2026_11_07.js run --ids 3-PRO-1,7-PRO-1 [--shard 0 --shards 2]  -> docs/balance/bal21/pro/<id>.json
//   (--hi 0.65 --steps 8 --screen 24: the second pass on 7-PRO-1, 7-PRO-4, 20-A-PRO-2, a tighter window so the descent goes on past 75% at 60 games)
//   node tools/bal21/pro_fix_2026_11_07.js apply                                              the kept decks into canonical/pro-skirmishes.json (old deck to history)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('../opt/deckopt.js'), P = require('../opt/pro_skirmishes.js');
const a = process.argv.slice(2), CMD = a[0] || 'run', arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const IDS = (arg('--ids', '') || '').split(',').filter(Boolean), SHARD = +arg('--shard', 0), SHARDS = +arg('--shards', 1), SCREEN = +arg('--screen', 16), RE = +arg('--reread', 60), STEPS = +arg('--steps', 5);
const OUT = path.join(ROOT, 'docs', 'balance', 'bal21', 'pro'), PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const PLAN = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal16', 'refdecks-plan-2026-11-05.json'), 'utf8'));
const RULE = { maxUnique: 6, maxCopies: 4, size: 20, maxOverlap: 10 };
const WINDOW = { easy: { ref: 'map', lo: 0, hi: +arg('--hi', 0.75) }, wall: { ref: 'ref2', lo: 0.2, hi: 0.5 } };
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const tot = d => Object.values(d).reduce((t, k) => t + k, 0), ovl = (x, y) => Object.keys(x).reduce((t, id) => t + Math.min(x[id], y[id] || 0), 0);
const keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
let gm = null; const game = () => gm || (gm = O.loadGame(ROOT));
// pro_ease.js's PREF-3 level for a late side map (arena_app.js proLateSideLevel), built the same way
function lateLevelOf(g, mapId) {
  if (!g._lateLv) { try { const G = g.G; g._lateLv = new Function('CONQUEST_MAPS', 'mapNumberOf', 'mapUnlockNumberOf', 'roadCurveFights', 'roadEnemyLevelExact',
    g.B.grab('mainConquestMaps') + '\n' + g.B.grab('proLateSideLevel') + '\nreturn proLateSideLevel;')(G.CONQUEST_MAPS, G.mapNumberOf, G.mapUnlockNumberOf, G.roadCurveFights, G.roadEnemyLevelExact); }
    catch (e) { g._lateLv = () => null; } }
  try { return g._lateLv(mapId); } catch (e) { return null; }
}
function findPro(file, id) { for (const mid of Object.keys(file.maps)) { const e = file.maps[mid]; const i = (e.pro || []).findIndex(x => x.id === id); if (i >= 0) return { mid, ent: e, i, entry: e.pro[i] }; } throw new Error('no PRO ' + id); }
function measure(g, map, ent, entry, deck, ref, games, seed0) {
  const G = g.G, ai = 1, e2 = Object.assign({}, entry, { deck }), n = P.proNode(g, map, e2, ent.field || {}); n.ai = ['basic', 'smart', 'smartest'][ai]; if ((entry.leaders || [])[0]) n.showcase = entry.leaders[0];
  const late = lateLevelOf(g, map.id); if (late != null && late > n.enemyLevel) n.enemyLevel = late;
  const ctx = G.referenceFightSetup(map.id, n, { refSet: ref, seed0 }); let w = 0;
  for (let k = 0; k < games; k++) { const r = G.playReferenceGame(ctx, k); if (r.win) w++; }
  return Math.round(w / games * 1000) / 1000;
}
function fix(id) {
  const g = game(), file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), { mid, ent, entry } = findPro(file, id), map = g.G.CONQUEST_MAPS.find(m => m.id === mid);
  const plan = PLAN.maps[mid]; if (!plan) throw new Error('no BAL16 plan for ' + mid);
  const pool = plan.pro.pool.slice(), anchor = new Set(plan.bpro.pool), anchorMin = plan.pro.anchorMin || 10, lead = (entry.leaders || [])[0];
  const others = (ent.pro || []).concat(ent.bpro || []).filter(x => x.id !== id).map(x => x.deck);
  const mode = /^(17-PRO-2)$/.test(id) ? 'wall' : 'easy', W = WINDOW[mode], ref = W.ref;
  const capOf = c => Math.min(RULE.maxCopies, g.G.maxCopiesForRarity((g.D[c] || {}).rarity));
  const legal = d => { const ids = Object.keys(d); if (tot(d) !== RULE.size || ids.length > RULE.maxUnique) return false;
    if (ids.some(c => !pool.includes(c) || d[c] < 1 || d[c] > capOf(c))) return false; if (lead && !d[lead]) return false;
    if (ids.filter(c => anchor.has(c)).reduce((t, c) => t + d[c], 0) < anchorMin) return false;
    if (others.some(o => ovl(d, o) > RULE.maxOverlap)) return false;
    if (P.deckProblems(g, d, entry.leaders).length) return false; return true; };
  const gap = w => w < W.lo ? W.lo - w : w > W.hi ? w - W.hi : 0;
  const seedT = fnv('bal21|' + id + '|' + ref), seedR = fnv('pro-ease|' + id + '|' + ref), cache = new Map();
  const T = (d, n) => { const k = keyOf(d) + '#' + n; if (!cache.has(k)) cache.set(k, measure(g, map, ent, entry, d, ref, n, seedT)); return cache.get(k); };
  let cur = Object.assign({}, entry.deck), r = T(cur, RE); const trail = [{ move: 'start', win: r }], t0 = Date.now();
  console.log(id, mode, ref, 'start', r, 'legal now:', legal(cur));
  for (let s = 0; s < STEPS && gap(r) > 0; s++) {
    const cands = [];
    for (const out of Object.keys(cur)) for (const inn of pool) { if (inn === out) continue;
      for (const k of [...new Set([1, 2])].filter(k => k <= cur[out])) { const d = Object.assign({}, cur); d[out] -= k; if (!d[out]) delete d[out]; d[inn] = (d[inn] || 0) + k; if (legal(d)) cands.push({ d, mv: `${out} -${k} -> ${inn}` }); } }
    const best = cands.map(c => Object.assign(c, { w: T(c.d, SCREEN) })).sort((p, q) => gap(p.w) - gap(q.w)).slice(0, 4).map(c => Object.assign(c, { w60: T(c.d, RE) })).sort((p, q) => gap(p.w60) - gap(q.w60))[0];
    if (!best || gap(best.w60) > gap(r) - 0.03) break;
    cur = best.d; r = best.w60; trail.push({ move: best.mv, win: r, trials: cands.length }); console.log(id, s + 1, best.mv, r);
  }
  const was = measure(g, map, ent, entry, entry.deck, ref, 200, seedR), changed = keyOf(cur) !== keyOf(entry.deck), now = changed ? measure(g, map, ent, entry, cur, ref, 200, seedR) : was;
  const keep = changed && (gap(now) === 0 || gap(now) + 0.05 <= gap(was));
  const res = { about: 'BAL21 item 2 PRO fix (tools/bal21/pro_fix_2026_11_07.js)', id, map: mid, mode, ref, window: [W.lo, W.hi], before: { deck: entry.deck, win200: was }, pick: { deck: cur, win200: now, tune60: r }, keep, trail, trials: cache.size, sec: Math.round((Date.now() - t0) / 1000) };
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify(res, null, 1) + '\n');
  console.log(id, ref, '200 games:', was, '->', now, keep ? 'KEEP' : 'no', '|', trail.map(t => t.move).join('; '), '|', res.sec + 's');
}
if (CMD === 'run') IDS.filter((x, i) => i % SHARDS === SHARD).forEach(id => { if (a.includes('--resume') && fs.existsSync(path.join(OUT, id + '.json'))) return; fix(id); });
else if (CMD === 'apply') {
  const file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')); let n = 0;
  for (const f of fs.readdirSync(OUT).filter(x => x.endsWith('.json'))) { const x = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); if (!x.keep) continue;
    const { entry } = findPro(file, x.id); entry.history = (entry.history || []).concat([{ deck: entry.deck, replacedAt: '2026-11-07 (BAL21)' }]);
    entry.deck = x.pick.deck; entry.h2h = null;
    entry.bal21 = `2026-11-07 (BAL21 item 2): ${x.mode === 'easy' ? 'too easy for the Map reference' : 'a wall for Reference-2'} after ENG28 (${x.ref} ${Math.round(x.before.win200 * 1000) / 10}% -> ${Math.round(x.pick.win200 * 1000) / 10}% at 200 games, pro_ease seeds); ${x.trail.slice(1).map(t => t.move).join('; ')} (tools/bal21/pro_fix_2026_11_07.js, BAL16's PRO rules)`;
    n++; console.log('applied', x.id, x.before.win200, '->', x.pick.win200); }
  fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); console.log('applied', n);
}
