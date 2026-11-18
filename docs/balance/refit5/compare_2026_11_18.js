#!/usr/bin/env node
// 2026-11-18 (package REFIT5): which Maps 0-20 fights moved between two road reads. Prior = REFIT4's read (the 122 applied fights re-read on
// seed 9100 over the whole-road measure before them), now = a later measure (default: GitHub run 44226797832 of the DATAFIX head).
//   node docs/balance/refit5/compare_2026_11_18.js [now.jsonl]
const fs = require('fs'), path = require('path'), B = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(B, f), 'utf8').trim().split('\n').map(JSON.parse);
const prior = {}; rd('skirmish-pass-refit4-before-s9100.jsonl').concat(rd('skirmish-pass-refit4-after-s9100.jsonl')).forEach(r => { prior[r.key] = r; });
const now = rd(process.argv[2] || 'skirmish-pass-datafix.jsonl').filter(r => r.curve !== false && r.mapNo <= 20);
const gap = r => Math.round((r.win - r.target) * 10) / 10, key = d => JSON.stringify(Object.entries(d || {}).sort());
const st = r => r.win >= r.lo && r.win <= r.hi ? 'band' : Math.abs(gap(r)) <= 10 ? 'w10' : Math.abs(gap(r)) <= 20 ? 'w20' : 'far';
const rows = now.map(r => { const p = prior[r.key]; return { k: r.key, side: r.side, win: r.win, t: r.target, gap: gap(r), st: st(r), pw: p ? p.win : null, pst: p ? st(p) : 'new', dchg: p ? key(p.deck) !== key(r.deck) : null }; });
const out = rows.filter(r => r.st !== 'band').sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
console.log('out of band now (code win/target gap | prior win status | deck changed since):');
out.forEach(r => console.log(`${r.k} ${r.win}/${r.t} ${r.gap > 0 ? '+' : ''}${r.gap} | prior ${r.pw} ${r.pst} | ${r.dchg ? 'DECK CHANGED' : 'same deck'}`));
