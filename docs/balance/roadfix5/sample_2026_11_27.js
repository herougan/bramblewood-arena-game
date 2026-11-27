#!/usr/bin/env node
// 2026-11-27 (package ROADFIX5): for a fight ROADFIX4's local swap search (roadfix4/search_2026_11_25.js) left out of band, random legal decks
// from the fight's own list under the same rules (no NEW deck-rule problem against the live deck with --fx in place, an off-list card never
// gains copies, the fight's leaders unchanged, its kept cards and size kept): --n decks read at --g1 games on --seed1, the --top nearest the
// target re-read at --g2 on --seed2. Prints the top; --accept appends the nearest as a fixes line.
//   node docs/balance/roadfix5/sample_2026_11_27.js --code 15-6 [--fx fx.jsonl] [--n 250] [--g1 100] [--g2 400] [--top 8] [--accept out.jsonl]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), L = X.L, G = X.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = arg('--code'), N = +arg('--n', 250), G1 = +arg('--g1', 100), G2 = +arg('--g2', 400), TOP = +arg('--top', 8), S1 = +arg('--seed1', 15300), S2 = +arg('--seed2', 16300);
const fx = {}; if (arg('--fx')) fs.readFileSync(arg('--fx'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) fx[x.key] = x.deck; });
const band = fs.readFileSync(path.join(ROOT, 'docs/balance/skirmish-pass-post1127s.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).find(x => x.key === code);
const { m, n, f } = X.byCode[code], T = band.target, live = n.deck;
// the search's legality (roadfix4/search_2026_11_25.js legalP / leadOf)
const worseOf = p => { let mm; if ((mm = p.match(/^(.*) x(\d+)$/)) && !p.startsWith('kept card')) return [mm[1] + ' x#', +mm[2]];
  if ((mm = p.match(/^(\d+) non-unique copies$/))) return ['# non-unique copies', +mm[1]]; if ((mm = p.match(/^(.* usage \S+) (\d+)>(\d+)$/))) return [mm[1] + ' #>' + mm[3], +mm[2]]; return null; };
const isNew = (p, was) => { if (was.includes(p)) return false; const w = worseOf(p); return !w || !was.some(q => { const v = worseOf(q); return v && v[0] === w[0] && v[1] >= w[1]; }); };
const was = X.problemsFull(code, live, fx);
const leadOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadOf(live);
const legal = d => !X.problemsFull(code, d, fx).some(p => isNew(p, was)) && !Object.keys(d).some(id => !f.pool.includes(id) && d[id] > (live[id] || 0)) && leadOf(d) === lead0;
// random fills: kept cards at their live copies, then cards of the list (or the live deck's off-list cards, up to their live copies)
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const ids = [...new Set(f.pool.concat(Object.keys(live)))], capOf = id => f.pool.includes(id) ? f.cap(id) : live[id], n0 = Object.keys(live).length;
const seen = new Set([L.keyOf(live)]), cands = [];
for (let t = 0; t < 200000 && cands.length < N; t++) {
  const d = {}; [...f.keep.keys()].forEach(id => { if (live[id]) d[id] = live[id]; });
  const want = Math.min(5, n0) + Math.floor(rnd() * (f.dMax - Math.min(5, n0) + 1));
  let left = f.S - L.size(d), guard = 0;
  while (left > 0 && guard++ < 60) { const id = ids[Math.floor(rnd() * ids.length)]; if (!d[id] && Object.keys(d).length >= want) continue;
    const room = Math.min(capOf(id) - (d[id] || 0), left); if (room < 1) continue; const k = 1 + Math.floor(rnd() * room); d[id] = (d[id] || 0) + k; left -= k; }
  if (left) continue; const k = L.keyOf(d); if (seen.has(k)) continue; seen.add(k); if (legal(d)) cands.push(d);
}
const win = (deck, games, s) => { const nn = Object.assign({}, n, { deck }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, games, { seed0: s }).win * 1000) / 10; };
console.log(code, 'target', T, `(${band.lo}-${band.hi})`, cands.length, 'legal decks; live', win(live, G1, S1), '/', win(live, G2, S2));
const read = cands.map(d => ({ d, w1: win(d, G1, S1) })).sort((x, y) => Math.abs(x.w1 - T) - Math.abs(y.w1 - T)).slice(0, TOP);
read.forEach(c => { c.w2 = win(c.d, G2, S2); }); read.sort((x, y) => Math.abs(x.w2 - T) - Math.abs(y.w2 - T));
read.forEach(c => console.log(' ', c.w1, '/', c.w2, JSON.stringify(c.d)));
const out = { key: code, src: `sample (seeds ${S1} / ${S2})`, deck: read[0].d, shieldOverride: null, hqHp: null, tune: { w1: read[0].w1, w2: read[0].w2, games: G2 } };
fs.appendFileSync(path.join(ROOT, 'docs/balance/roadfix5/sample-2026-11-27.jsonl'), JSON.stringify(Object.assign({ t: new Date().toISOString(), top: read }, out)) + '\n');
if (arg('--accept')) fs.appendFileSync(arg('--accept'), JSON.stringify(out) + '\n');
console.log('RESULT', code, JSON.stringify(read[0].d), read[0].w2);
