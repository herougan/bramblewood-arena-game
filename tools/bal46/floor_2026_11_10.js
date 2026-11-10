#!/usr/bin/env node
// 2026-11-10 (package BAL46): the strong end of a fight's legal space, for a fight too easy whose exhaust read found nothing nearer
// (The Morel Monarch 7-6: the exhaust sorts its 60-game screen by |gap| and the top 8 nearest the target re-read 46-57 at 400, the screen's
// noise). Here every legal deck (BAL35's road_space, the tuner's rules with ./rules: a boss keeps its leaders) plays --g1 games (60) on the
// tune seeds (11300), the --top (16) lowest win rates re-read at 400 on the same seeds, the best --final (4) at 400 on the road seeds
// (9100 + 37g) against the fight as it stands. Output docs/balance/bal46/floor/<code>.json; a pick is applied through ./pick (--deck).
//   node tools/bal46/floor_2026_11_10.js --code 7-6 [--g1 60] [--top 16] [--final 4]
'use strict';
require('./boon_expand_2026_11_10.js');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), T = require('../bal35/road_tune_2026_11_10.js'), SP = require('../bal35/road_space_2026_11_10.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), G1 = +arg('--g1', 60), TOP = +arg('--top', 16), FIN = +arg('--final', 4);
const F = T.setup(code), t0 = Date.now(), want = F.want, gap = x => Math.abs(x - want);
// --shard i --shards n: the 60-game screen of every n-th deck only, saved to floor/<code>-screen-<i>.json; a run without --shard reads the saved shards
const SH = arg('--shard'), NSH = +arg('--shards', 2), OUT = path.join(ROOT, 'docs', 'balance', 'bal46', 'floor'); fs.mkdirSync(OUT, { recursive: true });
const sp = SP.space(F), scr = d => ({ deck: d, r60: T.measure(F, { deck: d, leaders: null, shield: null }, G1, 11300).win });
if (SH != null) { const part = sp.decks.filter((d, i) => i % NSH === +SH).map(scr); fs.writeFileSync(path.join(OUT, `${code}-screen-${SH}.json`), JSON.stringify(part) + '\n'); console.log('shard', SH, part.length); process.exit(0); }
const saved = [...Array(NSH).keys()].map(i => path.join(OUT, `${code}-screen-${i}.json`));
const s1 = (saved.every(f => fs.existsSync(f)) ? saved.flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8'))) : sp.decks.map(scr)).sort((p, q) => p.r60 - q.r60);
const s2 = s1.slice(0, TOP).map(c => Object.assign(c, { tune400: T.measure(F, { deck: c.deck, leaders: null, shield: null }, 400, 11300).win })).sort((p, q) => gap(p.tune400) - gap(q.tune400));
const was = T.measure(F, { deck: F.node0.deck, leaders: null, shield: null }, 400, 9100).win;
const s3 = s2.slice(0, FIN).map(c => Object.assign(c, { road400: T.measure(F, { deck: c.deck, leaders: null, shield: null }, 400, 9100).win }));
const res = { about: 'BAL46 strong-end read (tools/bal46/floor_2026_11_10.js)', code, name: F.node0.name, target: want, space: sp.decks.length, g1: G1, before400: was,
  range60: { min: s1[0].r60, max: s1[s1.length - 1].r60 }, top: s2, sec: Math.round((Date.now() - t0) / 1000) };
fs.writeFileSync(path.join(OUT, code + '.json'), JSON.stringify(res, null, 1) + '\n');
console.log(code, 'target', want, 'space', sp.decks.length, 'before', was); s3.forEach(c => console.log(' ', c.r60, c.tune400, c.road400, JSON.stringify(c.deck)));
