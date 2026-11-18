#!/usr/bin/env node
// Package DATAFIX (2026-11-18), step 3: road decks the reward moves / the Constrictor Coil's Map 5 SPECIAL line left illegal after
// tools/listfix3/decks_2026_11_11.js swap (its fill found nothing: a thin side list, the Coil no longer unique to Map 6, K14).
// For each named fight: the deck's illegal copies out, the fewest cards changed: a search over fills from the fight's pool (the deck's own cards
// first, then new ones, nearest stat score) that the SKIR1 deck rules (tools/skir1/lib_fight_2026_11_11.js problems) accept. A problem the deck
// already had before DATAFIX (K14 on the Tasmanian Devil, a boon off) is not asked to be fixed here: REFIT4's fit stands.
//   node tools/datafix3_2026_11_18.js <code,code,...> [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
process.chdir(ROOT); require('./side2/holds_2026_11_13.js').patch();
const L = require('./skir1/lib_fight_2026_11_11.js'), G = L.G, D = L.D;
const APP = path.join(ROOT, 'arena_app.js'), codes = process.argv[2].split(','), apply = process.argv.includes('apply');
const BASEBY = { '13-4': /boon wildRage is off/, '14-4': /^(tasmanian-devil x4|\d+ non-unique copies)$/, '14-6': /^tasmanian-devil x4$/, '15-4': /^bramblewood-lynx x3$/, '19-2': /^pinecone-sapper x4$/, '19-6': /^pinecone-sapper x4$/, '20-4': /boon restlessDead is off/ }; // the deck problems those fights held at REFIT4 (17 in all)
let BASE = /^$/;
const score = id => G.skirmishCardScore(D[id] || {});
const sorted = d => Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]]));
let s = fs.readFileSync(APP, 'utf8');
for (const m of L.maps()) for (const n of L.fightsOf(m)) { if (!codes.includes(n.key)) continue;
  BASE = BASEBY[n.key] || /^$/;
  // NEED=13-8:card,17-2:card: the fight's new first-clear card must be in its deck (the SKIR1 test keeps a reward the fight fielded before SKIR1): one copy in, the nearest card's copy out
  const need = (process.env.NEED || '').split(',').map(x => x.split(':')).find(x => x[0] === n.key);
  if (need) { const f = L.fight(m, n), old = n.deck, c = need[1]; let b = null;
    Object.keys(old).filter(r => r !== c && !f.keep.has(r)).forEach(r => { const d = Object.assign({}, old, { [c]: (old[c] || 0) + 1 }); d[r]--; if (!d[r]) delete d[r]; if (f.problems(d).some(p => !BASE.test(p))) return;
      const g = Math.abs(score(r) - score(c)); if (!b || g < b.g) b = { d, g, r }; });
    if (!b) { console.log(n.key, 'NEED: no swap', c); continue; } console.log(n.key.padEnd(7), 'out', JSON.stringify({ [b.r]: 1 }), 'in', JSON.stringify({ [c]: 1 }));
    if (apply) { const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${n.key.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(sorted(b.d)) + ` /* 2026-11-18 (DATAFIX): its new first-clear card ${c} in (one copy of ${b.r} out); deck (was ${JSON.stringify(old)}) */`)); n.deck = sorted(b.d); }
    continue; }
  const f = L.fight(m, n), old = n.deck, bad = Object.keys(old).filter(id => !f.pool.includes(id)), d0 = Object.assign({}, old); bad.forEach(id => delete d0[id]);
  const k = L.size(old) - L.size(d0), sc = bad.length ? bad.reduce((t, id) => t + score(id) * old[id], 0) / bad.reduce((t, id) => t + old[id], 0) : 0;
  const base = f.problems(old).filter(p => BASE.test(p) && !bad.some(b => p.startsWith(b)));
  // the problems of the fight's untouched deck other than the ones named above must also be fixed (constrictor-coil x4 ...): any copy count over its cap goes down too
  const ban = new Set((process.env.BAN || '').split(',').filter(x => x.startsWith(n.key + ':')).map(x => x.split(':')[1])); // BAN=6-8:card,...: cards the map's usage line / a two-card family keeps out of this fight
  const gap = id => Math.abs(score(id) - sc), cand = f.pool.filter(id => !ban.has(id)).sort((a, b) => (d0[b] ? 1 : 0) - (d0[a] ? 1 : 0) || gap(a) - gap(b));
  let best = null, nodes = 0;
  const legal = d => f.problems(d).every(p => BASE.test(p));
  const fill = (left, i, d, news) => { if (++nodes > 200000) return; if (!left) { if (legal(d)) { const cost = Object.keys(d).reduce((t, id) => t + Math.abs((d[id] || 0) - (old[id] || 0)), 0) * 1000 + news * 100 + Object.keys(d).reduce((t, id) => t + Math.max(0, d[id] - (old[id] || 0)) * gap(id), 0); if (!best || cost < best.cost) best = { d: Object.assign({}, d), cost }; } return; }
    for (let j = i; j < cand.length; j++) { const id = cand[j], room = Math.min(left, f.cap(id) - (d[id] || 0)); for (let c = room; c >= 1; c--) { const e = Object.assign({}, d); e[id] = (e[id] || 0) + c; if (Object.keys(e).length > f.dMax) continue; if (f.k14(e).some(p => !BASE.test(p) && !/^\d+ non/.test(p)) ) continue; fill(left - c, j + 1, e, news + (old[id] ? 0 : 1)); } } };
  // the over-cap / K14 copies of the kept deck: shave them first so the search can put the copies elsewhere
  let start = d0, extra = 0; // a K14 copy count goes out entirely: the search may put the card back at 1
  for (const p of f.problems(d0)) { const mm = /^(\S+) x(\d+)( over \d+)?$/.exec(p); if (mm && !BASE.test(p)) { const id = mm[1], keepN = Math.min(+mm[2], f.k14(d0).includes(p) ? (f.keep.get(id) || 0) : f.cap(id)); extra += d0[id] - keepN; start = Object.assign({}, start, { [id]: keepN }); if (!keepN) delete start[id]; } }
  fill(k + extra, 0, start, 0);
  if (!best) { console.log(n.key, 'NO LEGAL DECK', JSON.stringify(f.problems(old))); continue; }
  const adds = {}, outs = {}; Object.keys(Object.assign({}, old, best.d)).forEach(id => { const dd = (best.d[id] || 0) - (old[id] || 0); if (dd > 0) adds[id] = dd; if (dd < 0) outs[id] = -dd; });
  console.log(n.key.padEnd(7), 'out', JSON.stringify(outs), 'in', JSON.stringify(adds), 'left', JSON.stringify(f.problems(best.d)));
  if (apply) { const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${n.key.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('no line ' + n.key);
    s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(sorted(best.d)) + ` /* 2026-11-18 (DATAFIX): fewest-swap repair after the reward moves / the Coil's Map 5 SPECIAL line: out ${JSON.stringify(outs)}, in ${JSON.stringify(adds)}; deck (was ${JSON.stringify(old)}) */`)); n.deck = sorted(best.d); } }
if (apply) fs.writeFileSync(APP, s);
