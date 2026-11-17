#!/usr/bin/env node
// 2026-11-17 (package REFIT2): one fix line per fight from the search lanes' accepted files (the last line with a deck or lever for each
// code), dropping lines that leave the live fight as it is (same deck, Shield and Health). Input to tools/refit2/ghfix_2026_11_17.sh.
//   node tools/refit2/batch_2026_11_17.js --acc a.jsonl,b.jsonl --codes 5-6,4-1,... [--skip 5-6] --out file.jsonl
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const X = require('../legal1/lib_legal_2026_11_15.js'), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const codes = arg('--codes').split(','), skip = (arg('--skip', '') || '').split(','), last = {};
arg('--acc').split(',').forEach(f => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
  .forEach(x => { if (x.deck || x.shieldOverride != null || x.hqHp != null) last[x.key] = x; }));
const castle = (code, fx) => { const { m, n } = X.byCode[code], nn = Object.assign({}, n, fx || {}); G.NODE_MAP_HINT.set(nn, m.id); const c = G.skirmishCastle(nn); return c.hp + '|' + c.shield; };
const out = [];
for (const c of codes) { const x = last[c]; if (!x || skip.includes(c)) continue; const n = X.byCode[c].n;
  const fx = { key: c, deck: x.deck || n.deck, shieldOverride: x.shieldOverride != null ? x.shieldOverride : null, hqHp: x.hqHp != null ? x.hqHp : null };
  const o = {}; if (fx.shieldOverride != null) o.shieldOverride = fx.shieldOverride; if (fx.hqHp != null) o.hqHp = fx.hqHp;
  if (L.keyOf(fx.deck) === L.keyOf(n.deck) && castle(c, o) === castle(c)) { console.log('unchanged', c); continue; }
  out.push(Object.assign(fx, { tune: x.tune, moves: x.moves })); }
fs.writeFileSync(arg('--out'), out.map(x => JSON.stringify(x)).join('\n') + '\n'); console.log(out.length, 'lines:', out.map(x => x.key).join(','));
