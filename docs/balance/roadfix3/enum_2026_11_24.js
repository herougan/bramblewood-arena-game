#!/usr/bin/env node
// 2026-11-24 (package ROADFIX3): REFIT20's copy below, for 6-3's whole space (--maxmove 18) and 8-3 after post1124c; bands from post1124c, logs
// here; --fx <jsonl>: the other fights' accepted decks in place for the map lines (a problem the live deck has is not counted).
// 2026-11-24 (package REFIT20, REFIT11-2 a): REFIT11's whole-space read (docs/balance/refit11/enum_2026_11_20.js), copied, with the owner's
// 11-22 21:28 call on 6-3: one pool card that K14 caps at 1 copy may hold 2 (--allow2). Every deck of the fight's size from its pool that
// passes tools/legal1 problemsFull() (size, distinct cards, copy caps, leaders, map lines), K14's "<id> x2" for ONE carried card excused,
// within --maxmove copies of the live deck; screened at --g1 games on --seed1, the --top nearest re-read at --g2 on --seed2. Bands from --bands.
//   node docs/balance/roadfix3/enum_2026_11_24.js CODE [--allow2] [--maxmove 8] [--g1 100] [--g2 400] [--top 6] [--seed1 11300] [--seed2 12300]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G, L = X.L;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const code = a[0], { m, n, f } = X.byCode[code], start = n.deck, ALLOW2 = a.includes('--allow2');
const MAXMV = +arg('--maxmove', 8), G1 = +arg('--g1', 100), G2 = +arg('--g2', 400), TOP = +arg('--top', 6), S1 = +arg('--seed1', 11300), S2 = +arg('--seed2', 12300);
const band = fs.readFileSync(path.resolve(ROOT, arg('--bands', 'docs/balance/skirmish-pass-post1124c.jsonl')), 'utf8').trim().split('\n').map(JSON.parse).find(x => x.code === code), T = band.target;
const carried = id => f.U && !f.U.has(id) && !f.L0.includes(id);
const leadersOf = d => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); }, lead0 = leadersOf(n.deck);
const S = L.size(n.deck);
const FX = {}; if (arg('--fx')) fs.readFileSync(arg('--fx'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) FX[x.key] = x.deck; });
// --wasfx <jsonl>: the decks the live deck's own problems are read with (default --fx); a joint move (8-3 takes Stalactite Golem, another
// fight gives it up) reads WAS without the partner's new deck, so the partner's usage line counts against every deck that keeps the card
const WFX = {}; if (arg('--wasfx', arg('--fx'))) fs.readFileSync(arg('--wasfx', arg('--fx')), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && x.key !== code) WFX[x.key] = x.deck; });
const WAS = X.problemsFull(code, n.deck, WFX);
const problems = d => { let p = X.problemsFull(code, d, FX).filter(x => !WAS.includes(x) || x === 'constrictor-coil x2'); const two = Object.keys(d).filter(id => carried(id) && d[id] === 2);
  if (ALLOW2 && two.length === 1) p = p.filter(x => x !== `${two[0]} x2`); return p; };
const legal = d => L.size(d) === S && !problems(d).length && leadersOf(d) === lead0;
const dist = (p, q) => [...new Set(Object.keys(p).concat(Object.keys(q)))].reduce((t, id) => t + Math.max(0, (q[id] || 0) - (p[id] || 0)), 0);
const pool = f.pool, out = [], capOf = id => carried(id) ? (ALLOW2 ? 2 : f.carriedMax) : f.cap(id);
const rec = (i, d, left) => { if (left === 0) { if (Object.keys(d).length >= f.dMin && dist(start, d) <= MAXMV && legal(d)) out.push(Object.assign({}, d)); return; } if (i >= pool.length) return;
  for (let k = Math.min(capOf(pool[i]), left); k >= 0; k--) { if (k) d[pool[i]] = k; else delete d[pool[i]]; if (Object.keys(d).length <= f.dMax) rec(i + 1, d, left - k); } delete d[pool[i]]; };
rec(0, {}, S);
console.log(code, 'target', T, 'start', JSON.stringify(start), out.length, 'legal decks within', MAXMV, 'copies', ALLOW2 ? '(one carried card at 2 allowed)' : '');
const win = (d, g, s) => { const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, g, { seed0: s }).win * 1000) / 10; };
const TAG = arg('--tag', ''), LOG = path.join(__dirname, `enum-${code}${TAG}.jsonl`), SCR = path.join(__dirname, `enum-${code}${TAG}-screen.jsonl`), done = new Map();
if (fs.existsSync(SCR)) fs.readFileSync(SCR, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.g1 === G1 && x.seed1 === S1) done.set(L.keyOf(x.deck), x.w1); });
out.forEach(d => { const k = L.keyOf(d); if (done.has(k)) { d.__w1 = done.get(k); return; } const deck = Object.assign({}, d); d.__w1 = win(deck, G1, S1); fs.appendFileSync(SCR, JSON.stringify({ deck, w1: d.__w1, g1: G1, seed1: S1 }) + '\n'); });
out.sort((p, q) => Math.abs(p.__w1 - T) - Math.abs(q.__w1 - T));
const strip = d => Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('__')));
const top = out.slice(0, TOP); top.forEach(d => { d.__w2 = win(strip(d), G2, S2); });
top.sort((p, q) => Math.abs(p.__w2 - T) - Math.abs(q.__w2 - T) || dist(start, p) - dist(start, q));
top.forEach(d => { const deck = strip(d);
  fs.appendFileSync(LOG, JSON.stringify({ code, deck, w1: d.__w1, w2: d.__w2, move: dist(start, deck), seeds: [S1, S2], g: [G1, G2], allow2: ALLOW2 }) + '\n');
  console.log(JSON.stringify(deck), d.__w1, '/', d.__w2, 'copies moved', dist(start, deck)); });
