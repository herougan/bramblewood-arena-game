#!/usr/bin/env node
// 2026-11-18 (package REFIT4): docs/balance/refit4/refit4-fixes.jsonl from the search lanes (last line per fight of the accepted files, the
// polish pass over the first) and, once read, the fresh-seed verification (skirmish-pass-refit4-{live,fix}-s<seed>.jsonl): per fight its deck,
// moves against the live deck, why, and apply. A fight whose live deck broke a rule since FOLD6 always applies (the nearest legal deck);
// any other applies only when it closes its gap to the target by 2+ points on the mean of the fresh seed sets (owner rule), and is reported
// in band or not.   node docs/balance/refit4/fixes_2026_11_18.js [--seeds=31100,32100] [--candidates]   (--candidates: every changed deck, apply:true)
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), D = __dirname;
const a = process.argv.slice(2), S = ((a.find(x => x.startsWith('--seeds=')) || '--seeds=31100,32100').slice(8)).split(','), CAND = a.includes('--candidates');
const rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const base = {}; rd(path.join(ROOT, 'docs', 'balance', 'skirmish-pass-refit4-before-s9100.jsonl')).forEach(r => { base[r.key] = r; });
const rdl = l => fs.readFileSync(path.join(D, l), 'utf8').trim().split('\n').filter(Boolean).map(x => x.split(' ')[0]);
const pre = new Set(rdl('problems-prefold-2026-11-18.txt')), illegal = new Set(rdl('problems-before-2026-11-18.txt').filter(c => !pre.has(c) || c === '13-4'));
const last = {}; ['accA.jsonl', 'accB.jsonl', 'accA2.jsonl', 'accB2.jsonl'].forEach(f => rd(path.join(D, f)).forEach(x => { last[x.key] = x; }));
const moves = (from, to) => { const ids = [...new Set(Object.keys(from).concat(Object.keys(to)))].sort(), o = [], i = [];
  ids.forEach(id => { const d = (to[id] || 0) - (from[id] || 0); if (d < 0) o.push(`${d} ${id}`); if (d > 0) i.push(`+${d} ${id}`); }); return o.concat(i).join(' '); };
const reads = tag => { const m = {}; S.forEach(s => rd(path.join(ROOT, 'docs', 'balance', `skirmish-pass-refit4-${tag}-s${s}.jsonl`)).forEach(r => { (m[r.key] = m[r.key] || {})[s] = r.win; })); return m; };
const LIVE = reads('live'), FIX = reads('fix');
const mean = o => { const v = S.map(s => o && o[s]).filter(x => x != null); return v.length === S.length ? v.reduce((p, q) => p + q, 0) / v.length : null; };
const out = [];
// the live decks: read from arena_app.js for --candidates (before the apply), from the candidates file afterwards (arena_app.js then holds the fixes)
const LIVED = {}; if (!CAND) rd(path.join(D, 'refit4-candidates.jsonl')).forEach(o => { LIVED[o.key] = o.liveDeck; });
Object.values(last).forEach(x => { if (!x.deck) return; const b = base[x.key], live = CAND ? X.byCode[x.key].n.deck : LIVED[x.key]; if (!live || moves(live, x.deck) === '') return;
  const o = { key: x.key, deck: x.deck, shieldOverride: null, hqHp: null, moves: [moves(live, x.deck)], target: b.target, lo: b.lo, hi: b.hi, before9100: b.win, tune: x.tune, illegal: illegal.has(x.key), liveDeck: live };
  const lm = mean(LIVE[x.key]), fm = mean(FIX[x.key]);
  if (CAND || lm == null || fm == null) { o.apply = true; o.why = o.illegal ? 'legal deck (the live one broke a rule after FOLD6)' : 'toward the road curve'; out.push(o); return; }
  o.fresh = { live: LIVE[x.key], fix: FIX[x.key] }; const gl = Math.abs(lm - b.target), gf = Math.abs(fm - b.target), inb = S.every(s => FIX[x.key][s] >= b.lo && FIX[x.key][s] <= b.hi);
  o.inBand = inb; o.closes = Math.round((gl - gf) * 10) / 10;
  o.apply = o.illegal || gl - gf >= 2;
  o.why = (o.illegal ? 'legal deck (the live one broke a rule after FOLD6)' : 'toward the road curve') + `, target ${Math.round(b.target)}: ${S.map(s => LIVE[x.key][s]).join(' / ')} -> ${S.map(s => FIX[x.key][s]).join(' / ')} at 400 games on seeds ${S.join(' / ')}` + (inb ? ', in band' : '');
  out.push(o); });
out.sort((p, q) => (q.apply - p.apply) || p.key.localeCompare(q.key, 'en', { numeric: true }));
fs.writeFileSync(path.join(D, CAND ? 'refit4-candidates.jsonl' : 'refit4-fixes.jsonl'), out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log(out.length, 'changed decks;', out.filter(o => o.apply).length, 'apply (' + out.filter(o => o.apply && o.illegal).length + ' legal repairs);', out.filter(o => o.inBand).length, 'in band on both fresh sets');
out.filter(o => o.fresh).forEach(o => console.log(`${o.apply ? 'apply' : '  -  '} ${o.key.padEnd(7)} ${o.why}`));
