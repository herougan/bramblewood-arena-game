#!/usr/bin/env node
// 2026-11-14 (package REF7): what drives the Maps 16-20 walls for the Reference (Random) decks (prog-1..5, baked in arena_app.js), and the
// smallest single lever that brings them within 10 of target. Measurement only: every variant is a trial copy of the fight's node (the way
// tools/whatif1 does it: enemyLevel, brambleHealth, shieldOverride, rules, deck); nothing is written to the game.
//   node tools/ref7/walls_2026_11_14.js screen --codes 16-3,18-4 [--games 40] [--seed0 9100]
//        per fight: the 5 prog decks pooled (games a deck x 5) for the fight as built, enemy Lv -1 / -2, bramble Health x0.75, no Shield,
//        each field rule off, and each enemy card swapped out (its copies -> the deck's lowest-score other card, skirmishCardScore)
//   node tools/ref7/walls_2026_11_14.js lever --code X --param level|hp|shield|card --values v1,v2 [--card id] [--games 40] [--seed0 9100]
//        one lever stepped; shield: the Shield as played; card: --card the card swapped out, --copies k of its copies (default all), to the
//        deck's lowest-score other card; --param base: the fight as built (for a fresh-seed base)
// Rows -> docs/balance/ref7/walls-2026-11-14.jsonl (one a variant). Seeds: the road measure's (9100 + 37g); --seed0 5100 for a fresh check.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'balance', 'ref7', 'walls-2026-11-14.jsonl');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
if (typeof globalThis.effectsAtLevel !== 'function') { try { globalThis.effectsAtLevel = new Function(B.grab('effectsAtLevel') + '\nreturn effectsAtLevel;')(); } catch (e) { /* older */ } }
const a = process.argv.slice(2), CMD = a[0], arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const GAMES = +arg('--games', 40), SEED0 = +arg('--seed0', 9100), REFS = G.refSetIds().filter(id => /^prog-\d+$/.test(id)).sort();
function find(code) { for (const m of G.CONQUEST_MAPS) { const n = (m.nodes || []).find(x => x.key === code); if (n && !m.sub) return { m, n }; } throw new Error('no fight ' + code); }
function trial(m, n, over) { const nn = Object.assign({}, n, over); G.NODE_MAP_HINT.set(nn, m.id); return nn; }
function play(m, nn) {
  let w = 0, N = 0; const per = [];
  for (const ref of REFS) { const r = G.simulateReferenceFight(m.id, nn, GAMES, { seed0: SEED0, refSet: ref }); w += r.wins; N += r.n; per.push(Math.round(r.win * 1000) / 10); }
  return { win: Math.round(w / N * 1000) / 10, n: N, per };
}
const score = id => G.skirmishCardScore(B.CARD_DEFS_BASELINE[id] || {}) || 0;
function swapOut(deck, id, k) { const ids = Object.keys(deck).filter(x => x !== id); if (!ids.length) return null; const to = ids.sort((p, q) => score(p) - score(q))[0];
  const d = Object.assign({}, deck), mv = Math.min(d[id], k || d[id]); d[to] += mv; d[id] -= mv; if (!d[id]) delete d[id]; return { deck: d, to, mv }; }
// the Shield as the fight plays it (as tools/whatif1): the smallest shieldOverride whose played Shield reaches v; 0 = an explicit no Shield
function shieldOv(m, n, v) { if (!(v > 0)) return 0; for (let o = 1; o < 1000; o++) { if (G.skirmishCastle(trial(m, n, { shieldOverride: o })).shield >= v) return o; } throw new Error('no override for Shield ' + v); }
function row(code, m, n, lever, value, over, base) {
  const t0 = Date.now(), nn = trial(m, n, over), r = play(m, nn), sc = G.skirmishCastle(nn), t = G.roadCurveTarget(m.id, n), tgt = t ? Math.round(t.t * 1000) / 10 : null;
  const o = { code, map: G.mapNumberOf(m.id), kind: n.kind || 'skirmish', lever, value, games: r.n, seed0: SEED0, win: r.win, per: r.per, target: tgt, gap: tgt == null ? null : Math.round((r.win - tgt) * 10) / 10,
    delta: base == null ? null : Math.round((r.win - base) * 10) / 10, enemyLevel: G.roadEnemyLevelExact(nn), hp: sc.hp, shield: sc.shield, sec: Math.round((Date.now() - t0) / 1000) };
  fs.appendFileSync(OUT, JSON.stringify(o) + '\n');
  console.log(`${code} ${lever}${value != null ? '=' + value : ''}: ${o.win}% (gap ${o.gap}${o.delta != null ? ', d ' + o.delta : ''}) [${r.per.join(' ')}] Lv ${o.enemyLevel} hp ${o.hp} sh ${o.shield} ${o.sec}s`);
  return o;
}
function screen(code) {
  const { m, n } = find(code), L = G.roadEnemyLevelExact(n), sc = G.skirmishCastle(n), rules = G.fightRules(m.id, n);
  const base = row(code, m, n, 'base', null, {}, null).win;
  [1, 2].forEach(k => row(code, m, n, 'level', Math.round((L - k) * 100) / 100, { enemyLevel: Math.max(0, L - k) }, base));
  row(code, m, n, 'hp', Math.round(sc.hp * 0.75), { brambleHealth: Math.round(sc.hp * 0.75) }, base);
  if (sc.shield > 0) row(code, m, n, 'shield', 0, { shieldOverride: 0 }, base);
  Object.keys(rules).filter(k => k !== 'phase' && k !== 'aiGuardLethal' && rules[k] && rules[k] !== 'off').forEach(k => row(code, m, n, 'rule-off', k, { rules: Object.assign({}, n.rules || {}, { [k]: false }) }, base));
  if (rules.phase && rules.phase !== 'off') row(code, m, n, 'rule-off', 'phase:' + rules.phase, { rules: Object.assign({}, n.rules || {}, { phase: 'off' }) }, base);
  Object.keys(n.deck).forEach(id => { const s = swapOut(n.deck, id); if (s) row(code, m, n, 'card-out', id + ' x' + n.deck[id] + '>' + s.to, { deck: s.deck }, base); });
}
function lever(code) {
  const { m, n } = find(code), P = arg('--param'), base = +arg('--base', NaN);
  if (P === 'base') return row(code, m, n, 'base', null, {}, null);
  if (P === 'rule') { const k = arg('--rule'); return row(code, m, n, 'rule-off', k, { rules: Object.assign({}, n.rules || {}, { [k]: false }) }, isNaN(base) ? null : base); } // a field rule switched off (diagnostic)
  if (P === 'card') { const id = arg('--card'), s = swapOut(n.deck, id, +arg('--copies', 0)); return row(code, m, n, 'card-out', id + ' x' + s.mv + '/' + n.deck[id] + '>' + s.to, { deck: s.deck }, isNaN(base) ? null : base); }
  arg('--values').split(',').map(Number).forEach(v => row(code, m, n, P, v, P === 'level' ? { enemyLevel: v } : P === 'hp' ? { brambleHealth: v } : P === 'shield' ? { shieldOverride: shieldOv(m, n, v) } : (() => { throw new Error('--param level|hp|shield|card'); })(), isNaN(base) ? null : base));
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
if (CMD === 'screen') arg('--codes').split(',').forEach(screen);
else if (CMD === 'lever') lever(arg('--code'));
else if (CMD === 'info') arg('--codes').split(',').forEach(code => { const { m, n } = find(code), sc = G.skirmishCastle(n); console.log(code, n.kind, 'Lv', G.roadEnemyLevelExact(n), 'hp', sc.hp, 'sh', sc.shield, 'rules', JSON.stringify(G.fightRules(m.id, n)), 'deck', JSON.stringify(n.deck), 'leader', n.leader || n.leaders || '', 'refs', REFS.join(',')); });
else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 11).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
