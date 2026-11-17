#!/usr/bin/env node
// 2026-11-17 (package REFIT2): what-if reads for the owner's card calls (proposals only, nothing on disk changes). Plays road fights against
// the Map reference with some card stats changed in process (lib_bramble's CARD_DEFS_BASELINE, as tools/refit1/swap_2026_11_16.js), with
// optional fight edits from a fixes file (deck / shieldOverride / hqHp, apply:false lines too) and an optional base-Health edit (--hq).
//   node tools/refit2/whatif_2026_11_17.js --fights 5-6,5-4 [--set "cricket-drummer:attack=2,health=6;fen-mink:health=5"]
//        [--fixes f.jsonl] [--hq 5-6=24,5-4=20] [--games 400] [--seed 7300] [--label x] [--out f.jsonl]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const set = arg('--set', '');
for (const part of set.split(';').filter(Boolean)) {
  const [id, kv] = part.split(':'), d = B.CARD_DEFS_BASELINE[id]; if (!d) throw new Error('no card ' + id);
  const nd = Object.assign({}, d, { effects: Object.assign({}, d.effects || {}) });
  kv.split(',').forEach(x => { const [k, v] = x.split('='); if (k.startsWith('fx.')) { if (v === 'x') delete nd.effects[k.slice(3)]; else nd.effects[k.slice(3)] = +v; } else nd[k] = +v; });
  B.CARD_DEFS_BASELINE[id] = nd;
}
const fx = {}; if (arg('--fixes')) fs.readFileSync(arg('--fixes'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { fx[x.key] = x; });
const hq = {}; (arg('--hq', '') || '').split(',').filter(Boolean).forEach(x => { const [k, v] = x.split('='); hq[k] = +v; });
const N = +arg('--games', 400), seed = +arg('--seed', 7300), out = arg('--out'), label = arg('--label', set || 'live');
const fights = []; for (const m of B.MAPS) for (const n of m.nodes) fights.push({ m, n });
for (const code of arg('--fights').split(',')) {
  const f = fights.find(x => x.n.key === code); if (!f) { console.log('no fight', code); continue; }
  const x = fx[code] || {}, nn = Object.assign({}, f.n);
  if (x.deck) nn.deck = x.deck; if (x.shieldOverride != null) nn.shieldOverride = x.shieldOverride; if (x.hqHp != null) nn.hqHp = x.hqHp; if (hq[code]) nn.hqHp = hq[code];
  G.NODE_MAP_HINT.set(nn, f.m.id);
  const t = Date.now(), r = G.simulateReferenceFight(f.m.id, nn, N, { seed0: seed }), w = Math.round(r.win * 1000) / 10, sc = G.skirmishCastle(nn);
  const row = { key: code, label, set, fix: !!x.deck, hqHp: nn.hqHp || null, hp: sc.hp, shield: sc.shield, games: N, seed, win: w, ms: Date.now() - t };
  console.log(JSON.stringify(row)); if (out) fs.appendFileSync(out, JSON.stringify(row) + '\n');
}
