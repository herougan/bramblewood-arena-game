#!/usr/bin/env node
// 2026-11-25 (package ROADFIX4): sorts the curve proposals (curve-raw.jsonl) into the ones to validate and the ones for the legal swap search.
// A proposal is taken when its deck changed, it passes the full deck rules with no NEW problem against the live deck, alone and with every
// other taken proposal in place (tools/legal1/lib_legal_2026_11_15.js problemsFull, as ROADFIX2/3's legal tool), no off-list card (TESTFIX9-2)
// gains copies, and its tune read is 2+ points nearer the target than the tune seeds' start read. Writes --out (taken, as fixes lines) and prints the rest.
//   node docs/balance/roadfix4/sort_2026_11_25.js docs/balance/roadfix4/curve-raw.jsonl --out docs/balance/roadfix4/curve-accepted.jsonl
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const raw = {}; fs.readFileSync(a[0], 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { raw[x.key] = x; });
const offGain = (code, d) => { const { n, f } = X.byCode[code]; return Object.keys(d).filter(id => !f.pool.includes(id) && (d[id] || 0) > (n.deck[id] || 0)); };
// a lesser form of a problem the live deck already has (K14 "<id> x3" from x4, fewer non-unique copies, a lower usage count) is not new
const worseOf = p => { let m; if ((m = p.match(/^(.*) x(\d+)$/)) && !p.startsWith('kept card')) return [m[1] + ' x#', +m[2]];
  if ((m = p.match(/^(\d+) non-unique copies$/))) return ['# non-unique copies', +m[1]]; if ((m = p.match(/^(.* usage \S+) (\d+)>(\d+)$/))) return [m[1] + ' #>' + m[3], +m[2]]; return null; };
const isNew = (p, was) => { if (was.includes(p)) return false; const w = worseOf(p); return !w || !was.some(q => { const v = worseOf(q); return v && v[0] === w[0] && v[1] >= w[1]; }); };
const newP = (code, d, fx) => { const was = X.problemsFull(code, X.byCode[code].n.deck, {}); return X.problemsFull(code, d, fx).filter(p => isNew(p, was)); };
const take = {}, rest = [];
for (const x of Object.values(raw)) {
  const d = x.deck, live = X.byCode[x.key].n.deck, changed = d && JSON.stringify(Object.entries(d).sort()) !== JSON.stringify(Object.entries(live).sort());
  const w = x.after && x.after.win, w0 = x.trail[0].win, nearer = w != null && Math.abs(w - x.target) <= Math.abs(w0 - x.target) - 2; // the tune seeds' start read
  if (!changed) { rest.push(`${x.key.padEnd(8)} ${x.before} -> t ${x.target}: no move`); continue; }
  const og = offGain(x.key, d), p = newP(x.key, d, {});
  if (og.length || p.length || !nearer) { rest.push(`${x.key.padEnd(8)} ${x.before} -> t ${x.target}: tune ${w} ${og.length ? 'off-list gain ' + og.join(',') + ' ' : ''}${p.length ? 'new ' + JSON.stringify(p) : ''}${!nearer ? 'not nearer' : ''}`); continue; }
  take[x.key] = { x, d, w };
}
// with every other taken proposal in place (the map lines): drop the later of a clashing pair until none clash
let again = true; while (again) { again = false; for (const k of Object.keys(take)) { const fx = {}; Object.keys(take).filter(o => o !== k).forEach(o => { fx[o] = take[o].d; });
  const p = newP(k, take[k].d, fx); if (p.length) { rest.push(`${k.padEnd(8)} ${take[k].x.before} -> t ${take[k].x.target}: tune ${take[k].w} clashes with the others ${JSON.stringify(p)}`); delete take[k]; again = true; break; } } }
const out = Object.values(take).map(({ x, d, w }) => JSON.stringify({ src: 'curve (seed 7300, 100 games)', key: x.key, deck: d, shieldOverride: null, hqHp: null, tune: { w, seed: 7300, games: 100 }, before: x.before, target: x.target, green: x.good ? 'green' : 'off' }));
if (arg('--out')) fs.writeFileSync(path.resolve(ROOT, arg('--out')), out.join('\n') + (out.length ? '\n' : ''));
console.log('taken', out.length + ':', Object.values(take).map(t => `${t.x.key} ${t.x.before}->${t.w}/${t.x.target}${t.x.good ? '' : ' (off)'}`).join(', '));
console.log('for the search', rest.length + ':'); rest.forEach(l => console.log('  ' + l));
