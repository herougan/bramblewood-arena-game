#!/usr/bin/env node
// 2026-11-12 (package SKIR3): the map mix after the swaps and refills (owner 11-11: Lumber-cost / free, Wait / no-Wait, Lumber makers, plain animals,
// a status card; THEME8's minimum, as tests/skir1 reads it: each kind the map's pools hold, up to MIN, shown somewhere in its decks). For each map
// short of a kind: the missing card goes into the fight where it fits best: all copies of one non-kept card of that fight move to it (as many as
// its cap allows, the rest to the deck's own cards), legal by SKIR1's deck rules and the map's (usage line, two-card families, no other kind
// falling short); the swap whose stat score (skirmishCardScore x copies) moves least wins. Blend fights first, the boss last.
//   node tools/skir3/mix_2026_11_12.js [--apply]   -> arena_app.js, docs/balance/skir3/mix-2026-11-12.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G, D = L.D, M = L.M;
const UT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')).units.forEach(u => { UT[u.id] = u; });
const AT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'animal-tags.json'), 'utf8')).cards.forEach(t => { AT[t.id] = t; });
const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 };
const score = id => G.skirmishCardScore(D[id] || {}), dsc = d => Object.entries(d).reduce((t, [id, k]) => t + k * score(id), 0);
const sorted = d => Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]]));
let s = fs.readFileSync(APP, 'utf8'); const rows = [];
for (const m of L.maps()) {
  const fl = L.fightsOf(m), F = fl.map(n => L.fight(m, n)), ucap = L.ucapOf(m);
  const listAll = [...new Set([].concat(...F.map(f => f.pool)))], fam = {}; listAll.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
  const shownK = k => new Set([].concat(...F.map(f => Object.keys(f.n.deck))).filter(id => D[id] && M.kinds(D[id])[k])).size;
  const need = k => Math.min(MIN[k], listAll.filter(id => M.kinds(D[id])[k]).length);
  const usage = () => { const u = {}; F.forEach(f => Object.keys(f.n.deck).forEach(id => { if (!f.keep.has(id)) u[id] = (u[id] || 0) + 1; })); return u; };
  for (const k of Object.keys(MIN)) {
    let guard = 0;
    while (shownK(k) < need(k) && guard++ < 6) {
      const shown = new Set([].concat(...F.map(f => Object.keys(f.n.deck)))), missing = listAll.filter(id => M.kinds(D[id])[k] && !shown.has(id));
      const before = {}; Object.keys(MIN).forEach(x => { before[x] = shownK(x); });
      let best = null;
      for (const c of missing) for (const f of F) {
        if (!f.pool.includes(c)) continue; const u = usage(); if (!f.keep.has(c) && (u[c] || 0) + 1 > ucap) continue;
        const pf = fam[family(c)] === 2 ? family(c) : null; if (pf && Object.keys(f.n.deck).some(x => x !== c && family(x) === pf)) continue;
        for (const o of Object.keys(f.n.deck).filter(id => !f.keep.has(id))) {
          const d = Object.assign({}, f.n.deck), kk = d[o]; delete d[o]; d[c] = Math.min(kk, f.cap(c)); let left = kk - d[c];
          for (const id of Object.keys(d).sort((p, q) => Math.abs(score(p) - score(o)) - Math.abs(score(q) - score(o)))) while (left > 0 && d[id] < f.cap(id)) { const e = Object.assign({}, d); e[id]++; if (f.k14(e).length) break; d[id]++; left--; }
          if (left || !f.legal(d)) continue;
          const old = f.n.deck; f.n.deck = d; const fine = Object.keys(MIN).every(x => shownK(x) >= Math.min(before[x], need(x)) || x === k); f.n.deck = old; if (!fine) continue;
          const boss = L.isBoss(f.n, fl) ? 1 : 0, cost = boss * 1000 + Math.abs(dsc(d) - dsc(old));
          if (!best || cost < best.cost) best = { f, d, c, o, cost };
        }
      }
      if (!best) { rows.push({ map: m.id, kind: k, problem: `no legal swap shows a ${k} card (${shownK(k)} of ${need(k)})` }); console.log(m.id, k, 'no legal swap'); break; }
      const row = { map: m.id, kind: k, fight: best.f.code, in: best.c, out: best.o, before: best.f.n.deck, after: sorted(best.d) };
      rows.push(row); console.log(`${m.id} ${k}: ${best.f.code} ${best.o} -> ${best.c}`);
      best.f.n.deck = row.after;
      const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${best.f.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re);
      s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(row.after) + ` /* 2026-11-12 (SKIR3 mix): ${best.o} -> ${best.c}, so the map's decks show the list's ${k} cards (THEME8's minimum); deck (was ${JSON.stringify(row.before)}) */`));
    }
  }
}
if (process.argv.includes('--apply')) { fs.writeFileSync(APP + '.skir3tmp', s); fs.renameSync(APP + '.skir3tmp', APP); fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', 'mix-2026-11-12.json'), JSON.stringify({ about: 'SKIR3 mix repairs (tools/skir3/mix_2026_11_12.js)', rows }, null, 1) + '\n'); }
console.log(rows.length, 'repairs', process.argv.includes('--apply') ? 'written' : '(dry run)');
