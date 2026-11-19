#!/usr/bin/env node
// 2026-11-20 (package REFIT10): REFIT9's fixes step (docs/balance/refit9/fixes_2026_11_19.js) for REFIT10's shared accepted file (acc.jsonl),
// targets from release 5's road measure (refit10/skirmish-pass-rel5.jsonl, run 44597653420, seed 9100). --candidates: the last accepted deck
// per fight that differs from the live one -> refit10-candidates.jsonl. Without it, after the fresh-seed reads
// (skirmish-pass-refit10-{live,fix}-s<seed>.jsonl, 400 games each): a fight applies only when it closes its gap to the target by 2+ points
// on the mean of the seed sets (owner rule) -> refit10-fixes.jsonl.
//   node docs/balance/refit10/fixes_2026_11_20.js [--candidates] [--seeds=101100,102100] [--pass=3]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), D = __dirname;
// --pass=3: 19-A-9 searched again from its applied pass-1 deck (acc3.jsonl, pass3-19-A-9.log), files -pass3, fresh seeds 103100 / 104100
const a = process.argv.slice(2), P3 = a.includes('--pass=3'), SUF = P3 ? '-pass3' : '', CAND = a.includes('--candidates');
const S = ((a.find(x => x.startsWith('--seeds=')) || (P3 ? '--seeds=103100,104100' : '--seeds=101100,102100')).slice(8)).split(',');
const rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
require('./m9_2026_11_20.js');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const base = {}; rd(path.join(D, 'skirmish-pass-rel5.jsonl')).forEach(r => { base[r.key] = r; });
// pass 2 (19-A-7 / 19-A-8 searched again from their pass-1 decks, acc2.jsonl) overrides pass 1 for 19-A-8 only: 19-A-7's pass-2 step
// (-1 stoat-cutthroat +1 tide-spirit, 36.9 -> 38.1) was within noise, and the whole legal space within 8 copies (enum_2026_11_20.js, 200
// games on seed 292300) read its pass-1 deck best (36; live 29.5), so 19-A-7 keeps pass 1's one-copy move
const last = {}; (P3 ? ['acc3.jsonl'] : ['acc.jsonl', 'acc2.jsonl']).forEach(f => rd(path.join(D, f)).forEach(x => { if (f === 'acc2.jsonl' && x.key === '19-A-7') return; if (x.deck || !last[x.key]) last[x.key] = x; }));
const moves = (from, to) => { const ids = [...new Set(Object.keys(from).concat(Object.keys(to)))].sort(), o = [], i = [];
  ids.forEach(id => { const d = (to[id] || 0) - (from[id] || 0); if (d < 0) o.push(`${d} ${id}`); if (d > 0) i.push(`+${d} ${id}`); }); return o.concat(i).join(' '); };
const reads = tag => { const m = {}; S.forEach(s => rd(path.join(D, `skirmish-pass-refit10-${tag}-s${s}.jsonl`)).forEach(r => { (m[r.key] = m[r.key] || {})[s] = r.win; })); return m; };
const LIVE = reads('live'), FIX = reads('fix'), mean = o => { const v = S.map(s => o && o[s]).filter(x => x != null); return v.length === S.length ? v.reduce((p, q) => p + q, 0) / v.length : null; };
const LIVED = {}; if (!CAND) rd(path.join(D, `refit10-candidates${SUF}.jsonl`)).forEach(o => { LIVED[o.key] = o.liveDeck; });
const out = [];
Object.values(last).forEach(x => { if (!x.deck) return; const b = base[x.key], live = CAND ? X.byCode[x.key].n.deck : LIVED[x.key]; if (!live || moves(live, x.deck) === '') return;
  const o = { key: x.key, deck: x.deck, shieldOverride: null, hqHp: null, moves: [moves(live, x.deck)], target: b.target, lo: b.lo, hi: b.hi, before9100: b.win, tune: x.tune, liveDeck: live, problems: X.problemsFull(x.key, x.deck, Object.fromEntries(Object.values(last).filter(y => y.deck && y.key !== x.key).map(y => [y.key, y.deck]))) /* with the other accepted decks: the map lines */ };
  if (CAND) { o.apply = true; out.push(o); return; }
  const lm = mean(LIVE[x.key]), fm = mean(FIX[x.key]); if (lm == null || fm == null) { o.apply = false; o.why = 'not read'; out.push(o); return; }
  const gl = Math.abs(lm - b.target), gf = Math.abs(fm - b.target);
  o.fresh = { live: LIVE[x.key], fix: FIX[x.key] }; o.inBand = S.every(s => FIX[x.key][s] >= b.lo && FIX[x.key][s] <= b.hi); o.closes = Math.round((gl - gf) * 10) / 10; o.apply = gl - gf >= 2;
  o.why = `target ${Math.round(b.target)}: ${S.map(s => LIVE[x.key][s]).join(' / ')} -> ${S.map(s => FIX[x.key][s]).join(' / ')} at 400 games on seeds ${S.join(' / ')} (closes ${o.closes})`;
  out.push(o); });
out.sort((p, q) => (q.apply - p.apply) || p.key.localeCompare(q.key, 'en', { numeric: true }));
fs.writeFileSync(path.join(D, CAND ? `refit10-candidates${SUF}.jsonl` : `refit10-fixes${SUF}.jsonl`), out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log(out.length, 'changed decks;', out.filter(o => o.apply).length, 'apply;', out.filter(o => o.inBand).length, 'in band on both fresh sets');
if (CAND) { console.log('codes:', out.map(o => o.key).join(',')); out.forEach(o => console.log(o.key, o.moves[0], 'tune', o.tune && o.tune.w2, 'problems', JSON.stringify(o.problems))); }
out.filter(o => o.fresh).forEach(o => console.log(`${o.apply ? 'apply' : '  -  '} ${o.key.padEnd(7)} ${o.why}`));
