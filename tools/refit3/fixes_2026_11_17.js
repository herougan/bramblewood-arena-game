#!/usr/bin/env node
// 2026-11-17 (package REFIT3): docs/balance/refit3/refit3-fixes.jsonl from the verify batches (docs/balance/refit3/verify/v*.jsonl + their
// GitHub reads on the fresh seed sets, tools/refit3/table_2026_11_17.js). Per fight the last batch that read it; apply:true when accepted
// (in band on both sets, 2+ points nearer than live), else apply:false with its reads. Moves are against the live deck. Same format as REFIT2.
//   node tools/refit3/fixes_2026_11_17.js [seeds=93100,94100]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..'), V = path.join(ROOT, 'docs', 'balance', 'refit3', 'verify');
const X = require('../legal1/lib_legal_2026_11_15.js');
const S = (process.argv[2] || '93100,94100').split(',');
const rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const batches = fs.readdirSync(V).filter(f => /^v\d+\.jsonl$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
const by = {};
for (const bf of batches) { const tag = bf.replace('.jsonl', ''), table = JSON.parse(fs.readFileSync(path.join(V, tag + '-table.json'), 'utf8'));
  rd(path.join(V, bf)).forEach(x => { const t = table.find(r => r.key === x.key); if (t) by[x.key] = { x, t, tag }; }); }
const moves = (from, to) => { const ids = [...new Set(Object.keys(from).concat(Object.keys(to)))].sort(), out = [], inn = [];
  ids.forEach(id => { const d = (to[id] || 0) - (from[id] || 0); if (d < 0) out.push(`${d} ${id}`); if (d > 0) inn.push(`+${d} ${id}`); }); return out.concat(inn).join(' '); };
const lines = Object.values(by).sort((a, b) => (b.t.accept - a.t.accept) || a.x.key.localeCompare(b.x.key)).map(({ x, t, tag }) => {
  const live = X.byCode[x.key].n.deck, f = {}; const fresh = { live: {}, fix: {} }; S.forEach((k, i) => { fresh.live[k] = t.live[i]; fresh.fix[k] = t.fix[i]; });
  const o = { key: x.key, deck: x.deck, shieldOverride: null, hqHp: null, moves: [moves(live, x.deck)], src: x.src, batch: tag, apply: !!t.accept, fresh };
  // the whole-road reads with the accepted fixes in (road/after4-s7600 / -s91100) next to live on the same seeds
  if (o.apply) { o.road = { live: {}, fix: {} }; ['7600', '91100'].forEach(k => { const g = (f, key) => (rd(path.join(ROOT, 'docs', 'balance', 'refit3', 'road', f + '-s' + k + '.jsonl')).find(r => r.key === key) || {}).win;
    o.road.live[k] = g('live', x.key); o.road.fix[k] = g('after4', x.key); }); }
  return o; });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'refit3', 'refit3-fixes.jsonl'), lines.map(l => JSON.stringify(l)).join('\n') + '\n');
lines.forEach(l => console.log(`${l.apply ? 'apply' : '  -  '} ${l.key} ${l.moves[0]} | live ${S.map(k => l.fresh.live[k]).join('/')} -> ${S.map(k => l.fresh.fix[k]).join('/')}`));
