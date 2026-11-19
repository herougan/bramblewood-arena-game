#!/usr/bin/env node
// 2026-11-19 (package REFIT8): REFIT7's fixes step (docs/balance/refit7/fixes_2026_11_19.js) for REFIT8's two lanes (accA / accB), targets
// from REFIT7's final read (refit7/refit7-final-s9100.jsonl). --candidates: the last accepted deck per fight that differs from the live one
// -> refit8-candidates.jsonl. Without it, after the fresh-seed reads (skirmish-pass-refit8-{live,fix}-s<seed>.jsonl, 400 games each): a fight
// applies only when it closes its gap to the target by 2+ points on the mean of the seed sets (owner rule) -> refit8-fixes.jsonl.
//   node docs/balance/refit8/fixes_2026_11_19.js [--candidates] [--seeds=71100,72100] [--pass=2]
// --pass=2: the second neighbour pass (run2_2026_11_19.sh): accA2 / accB2, files refit8-{candidates,fixes}-pass2.jsonl, fresh seeds 73100 / 74100.
// --pass=3: the third pass (plan3-2026-11-19.txt, from the live decks after passes 1-2): accA3 / accB3, files -pass3, fresh seeds 75100 / 76100.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), D = __dirname;
const a = process.argv.slice(2), P3 = a.includes('--pass=3'), P2 = a.includes('--pass=2') || P3, SUF = P3 ? '-pass3' : P2 ? '-pass2' : '', S = ((a.find(x => x.startsWith('--seeds=')) || (P3 ? '--seeds=75100,76100' : P2 ? '--seeds=73100,74100' : '--seeds=71100,72100')).slice(8)).split(','), CAND = a.includes('--candidates');
const rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const base = {}; rd(path.join(ROOT, 'docs', 'balance', 'refit7', 'refit7-final-s9100.jsonl')).forEach(r => { base[r.key] = r; });
const last = {}; (P3 ? ['accA3.jsonl', 'accB3.jsonl'] : P2 ? ['accA2.jsonl', 'accB2.jsonl'] : ['accA.jsonl', 'accB.jsonl']).forEach(f => rd(path.join(D, f)).forEach(x => { if ((x.deck && (!P2 || x.tune)) || !last[x.key]) last[x.key] = x; /* pass 2: the seeded pass-1 lines (no tune) are starts, not results */ }));
const moves = (from, to) => { const ids = [...new Set(Object.keys(from).concat(Object.keys(to)))].sort(), o = [], i = [];
  ids.forEach(id => { const d = (to[id] || 0) - (from[id] || 0); if (d < 0) o.push(`${d} ${id}`); if (d > 0) i.push(`+${d} ${id}`); }); return o.concat(i).join(' '); };
const reads = tag => { const m = {}; S.forEach(s => rd(path.join(D, `skirmish-pass-refit8-${tag}-s${s}.jsonl`)) /* moved here from docs/balance/ after the run */.forEach(r => { (m[r.key] = m[r.key] || {})[s] = r.win; })); return m; };
const LIVE = reads('live'), FIX = reads('fix'), mean = o => { const v = S.map(s => o && o[s]).filter(x => x != null); return v.length === S.length ? v.reduce((p, q) => p + q, 0) / v.length : null; };
const LIVED = {}; if (!CAND) rd(path.join(D, `refit8-candidates${SUF}.jsonl`)).forEach(o => { LIVED[o.key] = o.liveDeck; });
const out = [];
Object.values(last).forEach(x => { if (!x.deck) return; const b = base[x.key], live = CAND ? X.byCode[x.key].n.deck : LIVED[x.key]; if (!live || moves(live, x.deck) === '') return;
  const o = { key: x.key, deck: x.deck, shieldOverride: null, hqHp: null, moves: [moves(live, x.deck)], target: b.target, lo: b.lo, hi: b.hi, before9100: b.win, tune: x.tune, liveDeck: live };
  if (CAND) { o.apply = true; out.push(o); return; }
  const lm = mean(LIVE[x.key]), fm = mean(FIX[x.key]); if (lm == null || fm == null) { o.apply = false; o.why = 'not read'; out.push(o); return; }
  const gl = Math.abs(lm - b.target), gf = Math.abs(fm - b.target);
  o.fresh = { live: LIVE[x.key], fix: FIX[x.key] }; o.inBand = S.every(s => FIX[x.key][s] >= b.lo && FIX[x.key][s] <= b.hi); o.closes = Math.round((gl - gf) * 10) / 10; o.apply = gl - gf >= 2;
  o.why = `target ${Math.round(b.target)}: ${S.map(s => LIVE[x.key][s]).join(' / ')} -> ${S.map(s => FIX[x.key][s]).join(' / ')} at 400 games on seeds ${S.join(' / ')} (closes ${o.closes})`;
  out.push(o); });
out.sort((p, q) => (q.apply - p.apply) || p.key.localeCompare(q.key, 'en', { numeric: true }));
fs.writeFileSync(path.join(D, CAND ? `refit8-candidates${SUF}.jsonl` : `refit8-fixes${SUF}.jsonl`), out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log(out.length, 'changed decks;', out.filter(o => o.apply).length, 'apply;', out.filter(o => o.inBand).length, 'in band on both fresh sets');
if (CAND) console.log('codes:', out.map(o => o.key).join(','));
out.filter(o => o.fresh).forEach(o => console.log(`${o.apply ? 'apply' : '  -  '} ${o.key.padEnd(7)} ${o.why}`));
