#!/usr/bin/env node
// 2026-11-20 (package REFIT11): REFIT10's fixes step (docs/balance/refit10/fixes_2026_11_20.js) for the FOCUS2 carrier fights; targets from
// this package's local road measure (refit11/skirmish-pass-refit11-before-s9100.jsonl, seed 9100, 400 games). --candidates: the last accepted
// deck per fight that differs from the live one -> refit11-candidates.jsonl. Without it, after the fresh-seed reads
// (skirmish-pass-refit11-{live,fix}-s<seed>.jsonl, 400 games each): a fight applies only when it closes its gap to the target by 2+ points
// on the mean of the seed sets (owner rule) -> refit11-fixes.jsonl.
//   node docs/balance/refit11/fixes_2026_11_20.js [--candidates] [--seeds=111100,112100] [--acc=acc.jsonl] [--suf=]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), D = __dirname;
const a = process.argv.slice(2), CAND = a.includes('--candidates'), opt = (k, d) => { const x = a.find(s => s.startsWith(k + '=')); return x ? x.slice(k.length + 1) : d; };
const S = opt('--seeds', '111100,112100').split(','), ACC = opt('--acc', 'acc.jsonl').split(','), SUF = opt('--suf', '');
const rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const base = {}; rd(path.join(D, 'skirmish-pass-refit11-before-s9100.jsonl')).forEach(r => { base[r.key] = r; });
const last = {}; ACC.forEach(f => rd(path.join(D, f)).forEach(x => { if (x.deck || !last[x.key]) last[x.key] = x; }));
const moves = (from, to) => { const ids = [...new Set(Object.keys(from).concat(Object.keys(to)))].sort(), o = [], i = [];
  ids.forEach(id => { const d = (to[id] || 0) - (from[id] || 0); if (d < 0) o.push(`${d} ${id}`); if (d > 0) i.push(`+${d} ${id}`); }); return o.concat(i).join(' '); };
const reads = tag => { const m = {}; S.forEach(s => rd(path.join(D, `skirmish-pass-refit11-${tag}-s${s}.jsonl`)).forEach(r => { (m[r.key] = m[r.key] || {})[s] = r.win; })); return m; };
const LIVE = reads('live'), FIX = reads('fix'), mean = o => { const v = S.map(s => o && o[s]).filter(x => x != null); return v.length === S.length ? v.reduce((p, q) => p + q, 0) / v.length : null; };
const LIVED = {}; if (!CAND) rd(path.join(D, `refit11-candidates${SUF}.jsonl`)).forEach(o => { LIVED[o.key] = o.liveDeck; });
const out = [];
Object.values(last).forEach(x => { if (!x.deck) return; const b = base[x.key], live = CAND ? X.byCode[x.key].n.deck : LIVED[x.key]; if (!live || moves(live, x.deck) === '') return;
  const o = { key: x.key, deck: x.deck, shieldOverride: null, hqHp: null, moves: [moves(live, x.deck)], target: b.target, lo: b.lo, hi: b.hi, before9100: b.win, tune: x.tune, liveDeck: live, problems: X.problemsFull(x.key, x.deck, Object.fromEntries(Object.values(last).filter(y => y.deck && y.key !== x.key).map(y => [y.key, y.deck]))) };
  if (CAND) { o.apply = true; out.push(o); return; }
  const lm = mean(LIVE[x.key]), fm = mean(FIX[x.key]); if (lm == null || fm == null) { o.apply = false; o.why = 'not read'; out.push(o); return; }
  const gl = Math.abs(lm - b.target), gf = Math.abs(fm - b.target);
  o.fresh = { live: LIVE[x.key], fix: FIX[x.key] }; o.inBand = S.every(s => FIX[x.key][s] >= b.lo && FIX[x.key][s] <= b.hi); o.closes = Math.round((gl - gf) * 10) / 10; o.apply = gl - gf >= 2;
  o.why = `target ${Math.round(b.target)}: ${S.map(s => LIVE[x.key][s]).join(' / ')} -> ${S.map(s => FIX[x.key][s]).join(' / ')} at 400 games on seeds ${S.join(' / ')} (closes ${o.closes})`;
  out.push(o); });
out.sort((p, q) => (q.apply - p.apply) || p.key.localeCompare(q.key, 'en', { numeric: true }));
fs.writeFileSync(path.join(D, CAND ? `refit11-candidates${SUF}.jsonl` : `refit11-fixes${SUF}.jsonl`), out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log(out.length, 'changed decks;', out.filter(o => o.apply).length, 'apply;', out.filter(o => o.inBand).length, 'in band on both fresh sets');
if (CAND) { console.log('codes:', out.map(o => o.key).join(',')); out.forEach(o => console.log(o.key, o.moves[0], 'tune', o.tune && o.tune.w2, 'problems', JSON.stringify(o.problems))); }
out.filter(o => o.fresh).forEach(o => console.log(`${o.apply ? 'apply' : '  -  '} ${o.key.padEnd(7)} ${o.why}`));
