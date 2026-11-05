#!/usr/bin/env node
// 2026-11-06 (package CONTENT12, decisions BAL18-1 b / BAL16-4 b): Lilypad Reach (mp) got three attackers from earlier pond / river lists
// (Shoal Shark, Beaver Lumberjack, Marsh Harrier; canonical/map-pools.json), then its fights are retuned toward the road curve. This is
// tools/bal18/tune_2a7_2026_11_05.js (BAL18's local search, the same rules: the fight's own list, rarity cap, theme, no other fight's reward,
// size / leader / first-clear kept, copy caps, K14 may not get worse) for any fight: --key <code> (default 2-A-7), --map <id> (default mp).
//   node tools/content12_lilypad_tune_2026_11_06.js --key 2-A-7 [--games 40] [--steps 12]  -> docs/balance/content12/tune-<key>-2026-11-06.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const B = require('./lib_bramble.js'), G = B.G, D = B.CARD_DEFS_BASELINE, LP = require('./lib_map_pools.js'), K = require('./bal7_k14_decks_2026_10_28.js');
let TH = null; try { TH = require('./thematic_pass_2026_10_19.js'); } catch (e) {}
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const MAP = arg('--map', 'mp'), KEY = arg('--key', '2-A-7');
const GAMES = +arg('--games', 40), STEPS = +arg('--steps', 12), OUT = path.join(ROOT, arg('--out', 'docs/balance/content12/tune-' + KEY + '-2026-11-06.json'));
const m = G.CONQUEST_MAPS.find(x => x.id === MAP), node0 = m.nodes.find(n => n.key === KEY);
const f = K.fights().find(x => x.map === MAP && x.key === KEY);
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
const list = LP.fightPool(pools, MAP, m.parent), first = new Set((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(MAP, KEY) || []);
const mapNo = G.mapNumberOf(MAP), size = d => Object.values(d).reduce((t, k) => t + k, 0), n0 = Object.keys(node0.deck).length, S0 = size(node0.deck);
const cap = id => Math.max(node0.deck[id] || 0, Math.min(4, G.maxCopiesForRarity(D[id].rarity))); // CONTENT12: a deck's own count stands (the road copy ladder gives a skirmish 5)
const otherReward = id => { const s = (D[id] || {}).source; return !!(s && s.kind === 'map' && s.node && !(s.id === MAP && s.node === KEY)); };
const inOk = id => D[id] && !D[id].token && D[id].kind !== 'baby' && !/^egg-/.test(id) && !(D[id].effects || {}).leader && G.roadRarityOk(D[id].rarity, mapNo, node0.kind)
  && !otherReward(id) && !(TH && TH.offThemeFor(MAP, node0, id));
const ins = [...new Set([...list].filter(inOk).concat(Object.keys(node0.deck)))].sort();
const k14 = d => K.violations(f, d).length, K0 = k14(node0.deck);
const legal = d => size(d) === S0 && Object.keys(d).length >= Math.min(5, n0) && Object.keys(d).length <= Math.max(8, n0) && Object.entries(d).every(([id, k]) => k >= 1 && k <= cap(id))
  && [...first].every(id => !node0.deck[id] || d[id]) && k14(d) <= K0;
const band = G.skirmishTargetBand(MAP, node0), want = band.t * 100, lo = band.lo * 100, hi = band.hi * 100;
function measure(deck, games, seed0) { const nn = Object.assign({}, node0, { deck }); G.NODE_MAP_HINT.set(nn, MAP); const r = G.simulateReferenceFight(MAP, nn, games, { seed0 });
  return { win: Math.round(r.wins / games * 1000) / 10, hpLost: Math.round(r.hpLost * 1000) / 10 }; }
const P = r => Math.abs(r.win - want) + 10 * (r.win > want ? 1 - r.hpLost / 100 : r.hpLost / 100);
const key = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const seen = new Map(); const T = d => { const k = key(d); if (!seen.has(k)) seen.set(k, measure(d, GAMES, 7300)); return seen.get(k); };
let cur = Object.assign({}, node0.deck), r = T(cur); const trail = [{ deck: cur, win: r.win, hpLost: r.hpLost }];
console.log('list', ins.join(' '), '| first-clear', [...first].join(' ') || '-', '| K14', K0, '| band', lo, '-', hi, '| start', r.win, r.hpLost);
for (let step = 0; step < STEPS; step++) {
  let best = null;
  for (const out of Object.keys(cur)) for (const inn of ins) { if (inn === out) continue;
    for (let k = 1; k <= Math.min(4, cur[out]); k++) { const d = Object.assign({}, cur); d[out] -= k; if (!d[out]) delete d[out]; d[inn] = (d[inn] || 0) + k; if (!legal(d)) continue;
      const x = T(d); if (!best || P(x) < P(best.r)) best = { d, r: x, mv: `${out} -${k} -> ${inn}` }; } }
  if (!best || P(best.r) > P(r) - 1) break; cur = best.d; r = best.r; trail.push({ move: best.mv, deck: cur, win: r.win, hpLost: r.hpLost }); console.log(step + 1, best.mv, r.win, r.hpLost);
  if (Math.abs(r.win - want) <= 4) break;
}
// the best few decks in band (or nearest) on the tune seeds, read on the measure seeds
const ranked = [...seen.entries()].map(([k, x]) => ({ k, x })).sort((p, q) => P(p.x) - P(q.x)).slice(0, 8).map(({ k, x }) => {
  const d = Object.fromEntries(k.split(',').map(s => { const mm = /^(.*?)(\d+)$/.exec(s); return [mm[1], +mm[2]]; })), m40 = measure(d, 40, 9100);
  return { deck: d, tune: x.win, measure40: m40.win }; });
const pick = ranked.slice().sort((p, q) => Math.abs((p.tune + p.measure40) / 2 - want) - Math.abs((q.tune + q.measure40) / 2 - want))[0];
pick.measure200 = measure(pick.deck, 200, 9100).win;
const res = { about: 'CONTENT12: ' + KEY + ' retune (tools/content12_lilypad_tune_2026_11_06.js)', band: { lo, hi, target: want }, list: ins, firstClear: [...first], k14Before: K0,
  before: { deck: node0.deck, tune: trail[0].win, measure40: measure(node0.deck, 40, 9100).win }, trail, trials: seen.size, top: ranked, pick, k14After: k14(pick.deck) };
fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
console.log('pick', JSON.stringify(pick.deck), 'tune', pick.tune, 'measure40', pick.measure40, 'measure200', pick.measure200, 'K14', res.k14After, 'trials', seen.size);
// --apply: the pick goes into the fight's deck in arena_app.js (with a dated comment) when it is 2+ points nearer the target than the deck it
// replaces on the road measure's seeds at 200 games; run again to search on from there
if (a.includes('--apply')) {
  const was200 = measure(node0.deck, 200, 9100).win, gap = x => Math.abs(x - want);
  if (gap(pick.measure200) + 2 > gap(was200)) console.log('not applied: the pick', pick.measure200, 'is not 2+ points nearer the target', want, 'than', was200);
  else { const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8');
    const re = new RegExp(`(\\{ ?key:\\s*['"]${KEY.replace(/[-]/g, '\\-')}['"],[^\\n]*)`), mm = s.match(re); if (!mm) throw new Error('node not found ' + KEY);
    const old = JSON.stringify(node0.deck), line = mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(pick.deck) + ` /* 2026-11-06 (CONTENT12, BAL18-1 b / BAL16-4 b / BAL16-3): retuned toward the road curve (target ${want}), ${was200}% -> ${pick.measure200}% at 200 games (was ${old}) */`);
    s = s.replace(mm[1], line); fs.writeFileSync(APP, s); console.log('applied to arena_app.js:', KEY, was200, '->', pick.measure200); }
}
