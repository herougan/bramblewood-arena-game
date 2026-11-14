#!/usr/bin/env node
// 2026-11-14 (package WHATIF3): CPU deck moves for a fight still out under SIDE2-2 e (WHATIF2's a+c scratch copy). Run it in that scratch copy
// (it reads the copy's arena_app.js), under tools/whatif1/rules_2026_11_14.js --carried 2 so legality is a+c's. The bramble Health, Shield and
// Enemy level levers run through WHATIF1's sweep (tools/whatif1/whatif1_2026_11_14.js sweep); this adds the deck moves it lacks.
//   info  --codes a,b                                   band, Health, Shield, level, deck, pool
//   moves --code X [--games 100] [--copies 1,2] [--pairs] [--seed0 9100]
//         every legal swap of k copies (k in --copies) of one deck card for one pool card, leader, kept cards and size unchanged;
//         --pairs: instead every legal pair of two different 1-copy swaps
//   deck  --code X --deck '{"id":k,...}' [--games 400] [--seed0 9100]   one deck read
// rows -> docs/balance/whatif3/moves-2026-11-14.jsonl (in the copy)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'docs', 'balance', 'whatif3');
require('../side2/holds_2026_11_13.js').patch();
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G;
const a = process.argv.slice(2), CMD = a[0], arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
fs.mkdirSync(OUT, { recursive: true });
function find(code) { for (const m of L.maps()) { const n = L.fightsOf(m).find(x => x.key === code); if (n) return { m, n }; } throw new Error('no fight ' + code); }
function bandOf(m, n) { const b = G.skirmishTargetBand(m.id, n), drop = n.challenge && b.curve ? 0.10 : 0, r = v => Math.round((v - drop) * 1000) / 10; return { t: r(b.t), lo: r(b.lo), hi: r(b.hi) }; } // as WHATIF1
function win(m, n, deck, games, seed0) { const nn = Object.assign({}, n, { deck }); G.NODE_MAP_HINT.set(nn, m.id);
  const ctx = G.referenceFightSetup(m.id, nn, { seed0 }); let w = 0; for (let g = 0; g < games; g++) if (G.playReferenceGame(ctx, g).win) w++; return Math.round(w / games * 1000) / 10; }
const row = o => fs.appendFileSync(path.join(OUT, 'moves-2026-11-14.jsonl'), JSON.stringify(Object.assign({ tag: arg('--tag', 'whatif3') }, o)) + '\n');
const games = +arg('--games', CMD === 'moves' ? 100 : 400), seed0 = +arg('--seed0', 9100);
if (CMD === 'info') for (const code of arg('--codes').split(',')) {
  const { m, n } = find(code), f = L.fight(m, n), sc = G.skirmishCastle(n);
  console.log(code, n.kind, JSON.stringify(bandOf(m, n)), `hp ${sc.hp} shield ${sc.shield} level ${G.roadEnemyLevelExact(n)}`, JSON.stringify(n.deck), 'legal:', f.problems(n.deck).join('; ') || 'yes', '| pool:', f.pool.join(' '), '| keep:', [...f.keep.keys()].join(' '), '| leaders:', f.L0.join(' '));
}
else if (CMD === 'moves' || CMD === 'deck') {
  const code = arg('--code'), { m, n } = find(code), f = L.fight(m, n), band = bandOf(m, n);
  const decks = [];
  if (CMD === 'deck') decks.push({ move: 'given', deck: JSON.parse(arg('--deck')) });
  else for (const k of arg('--copies', '1,2').split(',').map(Number)) for (const out of Object.keys(n.deck)) for (const inn of f.pool) {
    if (inn === out || n.deck[out] < k) continue; const d = Object.assign({}, n.deck); d[out] -= k; if (!d[out]) delete d[out]; d[inn] = (d[inn] || 0) + k;
    if (f.legal(d)) decks.push({ move: `-${k} ${out} +${k} ${inn}`, copies: k, deck: d }); }
  if (CMD === 'moves' && a.includes('--pairs')) { // two different 1-copy swaps (2 copies moved in all; decks a 2-copy swap already makes are skipped)
    const seen = new Set(decks.map(x => L.keyOf(x.deck))), ids = [...new Set(Object.keys(n.deck).concat(f.pool))];
    for (const o1 of ids) for (const o2 of ids) for (const i1 of ids) for (const i2 of ids) {
      if (o1 > o2 || i1 > i2 || [o1, o2].some(o => o === i1 || o === i2)) continue; const d = Object.assign({}, n.deck);
      for (const o of [o1, o2]) { d[o] = (d[o] || 0) - 1; } if ([o1, o2].some(o => d[o] < 0)) continue; [o1, o2].forEach(o => { if (!d[o]) delete d[o]; });
      d[i1] = (d[i1] || 0) + 1; d[i2] = (d[i2] || 0) + 1; const key = L.keyOf(d);
      if (seen.has(key) || !f.legal(d)) continue; seen.add(key); decks.push({ move: `-1 ${o1} -1 ${o2} +1 ${i1} +1 ${i2}`, copies: 2, deck: d }); }
    decks.splice(0, decks.length, ...decks.filter(x => x.move.split(' ').length > 4)); }
  console.log(code, `band ${band.lo}-${band.hi} (target ${band.t}), ${decks.length} decks, ${games} games, seed0 ${seed0}`);
  for (const x of decks) { const t0 = Date.now(), w = win(m, n, x.deck, games, seed0);
    row({ code, cmd: CMD, move: x.move, copies: x.copies || null, deck: x.deck, games, seed0, win: w, target: band.t, lo: band.lo, hi: band.hi, inBand: w >= band.lo && w <= band.hi, sec: Math.round((Date.now() - t0) / 1000) });
    console.log(`${x.move}: ${w}%`); }
} else console.log('commands: info | moves | deck (see the header)');
