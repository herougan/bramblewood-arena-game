#!/usr/bin/env node
// 2026-11-11 (package LISTFIX3): road decks after the cut cards left their lists (tools/listfix3/lists_2026_11_11.js), on SKIR1's deck rules
// (tools/skir1/lib_fight_2026_11_11.js: the fight's pool, size, caps, K14, kept cards, showcase leader, boon) and the map's (usage line, two-card
// families, the mix kinds):
//   swap [--apply]        every road fight of Maps 0-20 and their side maps holding a card outside its pool (or a two-card family pair): those copies to the
//                         deck cards and up to two new pool cards nearest their stat score (skirmishCardScore), the deck and the map kept legal
//   fitapply [--dir fit]  the kept deck-only picks of a fit run (tools/skir1/fit_2026_11_11.js or fit_decks_only_2026_11_11.js --dir ../listfix3/<dir>), with a LISTFIX3 comment
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), APP = path.join(ROOT, 'arena_app.js'), OUT = path.join(ROOT, 'docs', 'balance', 'listfix3');
const a = process.argv.slice(2), CMD = a[0], arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G, D = L.D, M = L.M;
const sorted = d => Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]]));
const lineRe = code => new RegExp(`^(\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*)$`, 'm');
const write = s => { fs.writeFileSync(APP + '.lf3tmp', s); fs.renameSync(APP + '.lf3tmp', APP); };
const UT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')).units.forEach(u => { UT[u.id] = u; });
const AT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'animal-tags.json'), 'utf8')).cards.forEach(t => { AT[t.id] = t; });
const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
const score = id => G.skirmishCardScore(D[id] || {});
fs.mkdirSync(OUT, { recursive: true });

if (CMD === 'swap') {
  let s = fs.readFileSync(APP, 'utf8'); const rows = [];
  for (const m of L.maps()) {
    const fl = L.fightsOf(m), F = fl.map(n => L.fight(m, n)), ucap = L.ucapOf(m);
    const listAll = [...new Set([].concat(...F.map(f => f.pool)))], fam = {}; listAll.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
    const pairBad = (f, d) => Object.keys(d).some(id => !f.keep.has(id) && fam[family(id)] === 2 && Object.keys(d).some(x => x !== id && family(x) === family(id)));
    const usage = () => { const u = {}; F.forEach(f => Object.keys(f.n.deck).forEach(id => { if (!f.keep.has(id)) u[id] = (u[id] || 0) + 1; })); return u; };
    for (const f of F) {
      // a card off the fight's pool, and the non-kept card of a two-card family pair (a family the list now holds only two of), fewer copies first
      const bad = Object.keys(f.n.deck).filter(id => !f.pool.includes(id)), rest = () => { const e = Object.assign({}, f.n.deck); bad.forEach(id => { delete e[id]; }); return e; };
      for (let e = rest(); pairBad(f, e); e = rest()) bad.push(Object.keys(e).filter(id => !f.keep.has(id) && fam[family(id)] === 2 && Object.keys(e).some(x => x !== id && family(x) === family(id))).sort((p, q) => e[p] - e[q])[0]);
      if (!bad.length) continue;
      const d0 = rest(), u = usage(), k = bad.reduce((t, id) => t + f.n.deck[id], 0), sc = bad.reduce((t, id) => t + score(id) * f.n.deck[id], 0) / k;
      // every fill of the k copies over the deck's cards and up to two new pool cards (inside caps, K14, the usage line, the family rule); the
      // legal one nearest the removed copies' mean stat score wins
      const fresh = f.pool.filter(x => !d0[x] && !bad.includes(x) && (f.keep.has(x) || (u[x] || 0) + 1 <= ucap));
      let best = null;
      const byGap = xs => xs.slice().sort((p, q) => Math.abs(score(p) - sc) - Math.abs(score(q) - sc));
      const tryFill = order => { const d = Object.assign({}, d0); let left = k, cost = 0;
        for (const c of order) while (left && (d[c] || 0) + 1 <= f.cap(c)) { const e = Object.assign({}, d); e[c] = (e[c] || 0) + 1; if (f.k14(e).length) break; d[c] = e[c]; left--; cost += Math.abs(score(c) - sc); }
        if (left || pairBad(f, d) || f.problems(d).length) return; if (!best || cost < best.cost) best = { d, cost }; };
      const own = Object.keys(d0); tryFill(byGap(own)); // the new cards either by stat score with the deck's own, or filled first (a challenge boon's theme card)
      fresh.forEach((x, i) => { [[x]].concat(fresh.slice(i + 1).map(y => [x, y])).forEach(nw => { tryFill(byGap(own.concat(nw))); tryFill(byGap(nw).concat(byGap(own))); }); });
      const d = best ? best.d : d0, adds = {}; Object.keys(d).forEach(id => { if (d[id] > (d0[id] || 0)) adds[id] = d[id] - (d0[id] || 0); });
      const probs = best ? [] : ['no legal fill'], row = { code: f.code, map: m.id, mapNo: f.mapNo, side: f.side, cut: bad.map(id => id + ' x' + f.n.deck[id]), to: adds, before: f.n.deck, after: sorted(d), problems: probs };
      rows.push(row); console.log(`${f.code.padEnd(8)} ${row.cut.join(', ')} -> ${JSON.stringify(adds)}${probs.length ? ' | PROBLEMS ' + probs.join('; ') : ''}`);
      if (probs.length) continue;
      if (a.includes('--apply')) { const mm = s.match(lineRe(f.code)); if (!mm) throw new Error('no line ' + f.code);
        s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(row.after) + ` /* 2026-11-11 (LISTFIX3): ${bad.map(id => f.pool.includes(id) ? id + ' (now one of a two-card family)' : id + ' (cut, off the list again)').join(', ')} out, the copies to the pool's nearest by stat score ${JSON.stringify(adds)}; deck (was ${JSON.stringify(f.n.deck)}) */`)); }
      f.n.deck = row.after; // the map's later fights read the usage this one leaves
    }
  }
  if (a.includes('--apply')) { write(s); fs.writeFileSync(path.join(OUT, 'swaps-2026-11-11.json'), JSON.stringify({ about: 'LISTFIX3 road swaps (tools/listfix3/decks_2026_11_11.js swap)', rows }, null, 1) + '\n'); }
  console.log(rows.length, 'fights', a.includes('--apply') ? 'written' : '(dry run)');
}

if (CMD === 'fitapply') {
  const dir = path.join(OUT, arg('--dir', 'fit')), only = String(arg('--codes', '')).split(',').filter(Boolean), keyOf = L.keyOf;
  let s = fs.readFileSync(APP, 'utf8'), k = 0;
  for (const x of fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))).filter(x => x.keep && (!only.length || only.includes(x.code)))) {
    const mm = s.match(lineRe(x.code)); if (!mm) throw new Error('no line ' + x.code); let line = mm[1];
    const cur = JSON.parse((line.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1]); if (keyOf(cur) !== keyOf(x.before.deck)) { console.log('skip', x.code, '(the deck moved since the fit)'); continue; }
    if (x.pick.shield != null) { console.log('skip', x.code, '(a Shield move: road retunes are deck swaps only; re-fit with tools/listfix3/fit_decks_only_2026_11_11.js)'); continue; }
    const deck = sorted(x.pick.deck), what = [];
    if (keyOf(deck) !== keyOf(x.before.deck)) { line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck)); what.push('deck (was ' + JSON.stringify(x.before.deck) + ')'); }
    line = line.replace(/(deck:\{[^}]*\})/, `$1 /* 2026-11-11 (LISTFIX3 fit): toward the road curve (target ${Math.round(x.band.t * 10) / 10}), ${x.before.win}% -> ${x.pick.win}% at ${x.games} games on the road seeds; ${what.join('; ')} */`);
    s = s.replace(mm[1], line); k++; console.log('applied', x.code, x.before.win, '->', x.pick.win);
  }
  write(s); console.log('applied', k);
}

if (CMD === 'pro') {
  // PRO / BPRO / WPRO decks of every map holding a card the lists no longer allow there: out of play (BAL9 JJ24), the map rule for its kind
  // (PRO map-true; BPRO / WPRO the map's own pool, tests/pro): those copies to the nearest card of the map's fight pool by SKIR2's distance
  // (tools/skir2/decks_2026_11_11.js cuts: Lumber x3, Wait, (2A+H)/3, rarity steps x4, +2 rarer; a card the deck holds first at equal distance),
  // inside the rarity cap and 6 different / 4 copies; never another fight's skirmish-exclusive card; not re-searched
  const O = require('../opt/deckopt.js'), P = require('../opt/pro_skirmishes.js'), LP = require('../lib_map_pools.js'), L9 = require('../bal9/lib_bal9.js');
  const gm = O.loadGame(ROOT), GG = gm.G, DD = gm.D, FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json'), pro = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const POOLS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
  const st = d => 2 * (+d.attack || 0) + (+d.health || 0);
  const dist = (x, y) => { const p = DD[x] || {}, q = DD[y] || {}; return 3 * Math.abs((+p.cost || 0) - (+q.cost || 0)) + Math.abs((+p.wait || 0) - (+q.wait || 0)) + Math.abs(st(p) - st(q)) / 3 + 4 * Math.abs(L9.step(p.rarity) - L9.step(q.rarity)) + (L9.step(q.rarity) > L9.step(p.rarity) ? 2 : 0); };
  const rows = [];
  for (const [mid, ent] of Object.entries(pro.maps)) {
    const map = GG.CONQUEST_MAPS.find(m => m.id === mid); if (!map) continue;
    const pk = map.sub ? map.parent : mid, sub = map.sub ? ((gm.pools[pk] || {}).submaps || {})[mid] || [] : [], pool = gm.pools[pk] || {}, cap = O.mapRarityCap(gm, map);
    const own = new Set((pool.cards || []).concat(pool.special || [], Array.isArray(sub) ? sub : (sub.cards || []), ...O.fightsOf(map).map(n => Object.keys(n.deck))));
    const cand = [...(LP.fightPool(POOLS, mid, map.sub ? map.parent : null) || [])];
    for (const [kind, mode] of [['pro', 'map-true'], ['bpro', 'bpro'], ['wpro', 'bpro']]) for (const x of (ent[kind] || [])) {
      const bad = id => (DD[id] && LP.isOutOfPlay(GG, DD[id])) || O.mapRuleProblems(gm, map, { [id]: 1 }, mode).some(p => p.startsWith(id + ':')) || (kind !== 'pro' && !own.has(id));
      const cuts = Object.keys(x.deck).filter(bad); if (!cuts.length) continue;
      const out = Object.assign({}, x.deck), moves = [], capR = c => Math.min(GG.maxCopiesForRarity((DD[c] || {}).rarity), 4);
      for (const id of cuts) { let k = out[id]; delete out[id]; const got = {};
        const opts = cand.filter(c => DD[c] && !bad(c) && !DD[c].token && GG.roadRarityStep(DD[c].rarity) <= GG.roadRarityStep(cap) && c !== id && !(DD[c].source && DD[c].source.kind === 'map'))
          .sort((p, q) => dist(id, p) - dist(id, q) || ((out[q] ? 1 : 0) - (out[p] ? 1 : 0)) || (p < q ? -1 : 1));
        for (const c of opts) { if (!k) break; while (k && (out[c] || 0) < capR(c) && (out[c] || Object.keys(out).length < 6)) { out[c] = (out[c] || 0) + 1; k--; got[c] = (got[c] || 0) + 1; } }
        moves.push({ cut: id, copies: x.deck[id], to: got, left: k }); }
      const leaders = kind === 'wpro' ? [] : P.leadersFor(gm, map, out);
      const probs = (kind === 'wpro' ? [] : P.deckProblems(gm, out, leaders)).concat(O.mapRuleProblems(gm, map, out, mode), P.limitProblems(out, { maxUnique: 6, maxCopies: 4 }), moves.filter(v => v.left).map(v => v.cut + ': ' + v.left + ' copies left'));
      rows.push({ map: mid, mapNo: GG.mapNumberOf(mid), kind, id: x.id, before: x.deck, after: sorted(out), moves, leadersBefore: x.leaders, leaders, problems: probs });
      console.log(`${x.id.padEnd(16)} ${moves.map(v => `${v.cut} x${v.copies} -> ${Object.entries(v.to).map(([c, n]) => c + ' x' + n).join(' + ')}`).join('; ')} | leaders ${JSON.stringify(x.leaders)} -> ${JSON.stringify(leaders)}${probs.length ? ' | PROBLEMS ' + probs.join('; ') : ''}`);
      if (a.includes('--apply') && !probs.length) { x.deck = sorted(out); x.leaders = leaders;
        x.listfix3 = `2026-11-11 (LISTFIX3): ${moves.map(v => v.cut + ' x' + v.copies).join(', ')} not allowed here once the cut cards left the lists Claude had put them on (out of play, or not held by this map), swapped for the map list's nearest (Lumber, Wait, 2A+H); not re-searched`; }
    }
  }
  if (a.includes('--apply')) { fs.writeFileSync(FILE, JSON.stringify(pro, null, 1) + '\n'); fs.writeFileSync(path.join(OUT, 'pro-swaps-2026-11-11.json'), JSON.stringify({ about: 'LISTFIX3 PRO / BPRO / WPRO swaps (tools/listfix3/decks_2026_11_11.js pro)', rows }, null, 1) + '\n'); }
  console.log(rows.length, 'decks', a.includes('--apply') ? 'written' : '(dry run)');
}
