#!/usr/bin/env node
// 2026-11-11 (package SKIR1, phase C, owner 00:16: "then finally - update ALL the skirmishes!"): every road fight of Maps 0-20 and their side maps
// rebuilt from the map's new list with THEME5's plan (owner 11-03 09:39: "we can scatter 3 of these slightly down-tuned peak deck strategies in 3
// skirmishes then the rest we have a random and weaker blend"; tools/theme5/skirmish_plan_2026_11_03.js picks the slots):
//   - the 3 peak slots: the map's non-boss fights in road order (the first left out when 3 others remain): the second fight's slot, the middle,
//     the last before the boss; the strategies are the map's BPRO decks by rank, then its PRO decks, each a different focus, the strongest in
//     the latest slot; each is fitted to its fight (its cards on the fight's pool, scaled to the deck's size) and down-tuned: the deck's
//     heaviest card gives 1 copy (2 in a deck of 15+) to its lightest;
//   - every other fight (bosses included): a seeded blend of 5-6 cards (6-7 on an elite or boss) from the fight's pool;
//   - across a map: a card in at most max(2, half the map's fights) (its kept cards aside: owner "try not to use a card too much"); two cards
//     of a family the list has only two of never share a fight (owner: "only 2 predators = how to spread them out"); then a repair pass so
//     the decks together show the mix the list can give (owner: lumber-cost, no-lumber, wait, no-wait, Lumber makers, plain animals; and a
//     status card), each kind up to THEME8's minimum (tools/theme8/deckmix_2026_11_11.py MIN).
// The rules of one deck are tools/skir1/lib_fight_2026_11_11.js's. Kept as they are: each fight's leaders, showcase, first-clear cards,
// bramble, Shield, rules and deck size. The fit (fit_2026_11_11.js) then moves the decks onto the road curve.
//   node tools/skir1/build_2026_11_11.js plan [--maps m1,mf]   -> docs/balance/skir1/build-plan-2026-11-11.json
//   node tools/skir1/build_2026_11_11.js apply                 writes the planned decks into arena_app.js (rebuild after)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const L = require('./lib_fight_2026_11_11.js'), G = L.G, D = L.D, M = L.M;
const a = process.argv.slice(2), CMD = a[0] || 'plan', arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const PLAN = path.join(ROOT, 'docs', 'balance', 'skir1', 'build-plan-2026-11-11.json');
const PRO = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')).maps;
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 }; // THEME8's deckmix MIN
const UT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')).units.forEach(u => { UT[u.id] = u; });
const AT = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'animal-tags.json'), 'utf8')).cards.forEach(t => { AT[t.id] = t; });
const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
const score = id => G.skirmishCardScore(D[id] || {});
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let t = fnv(seed); return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }

// fill a deck for fight f from preferred copies (id -> wanted), then the pool by weight; legal or null
function fill(f, want, weight, R, avoid) {
  const d = {}, add = (id, k) => { d[id] = (d[id] || 0) + k; };
  const nonU = id => f.U && !f.U.has(id) && !f.L0.includes(id), nonUTot = () => Object.keys(d).filter(nonU).reduce((t, id) => t + d[id], 0);
  f.keep.forEach((k, id) => add(id, nonU(id) ? 1 : Math.max(k, Math.min(f.old[id] || k, f.cap(id), k + 1))));
  // a kept first-clear or showcase card keeps the copies it had (a boss reward is often its strongest card); a leader may grow
  const lim = id => f.keep.has(id) && !f.L0.includes(id) ? Math.max(f.keep.get(id), Math.min(f.old[id] || 1, f.cap(id))) : f.cap(id);
  const room = id => { const c = lim(id) - (d[id] || 0); if (c <= 0) return 0; if (nonU(id)) return d[id] ? 0 : (nonUTot() < 6 ? 1 : 0); return c; };
  const clash = id => avoid && avoid(d, id);
  // wanted cards first (most wanted first)
  Object.entries(want).sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1)).forEach(([id, w]) => {
    if (!f.pool.includes(id) || clash(id)) return; if (!d[id] && Object.keys(d).length >= f.dMax) return;
    const k = Math.min(Math.round(w), room(id), f.S - L.size(d)); if (k > 0) add(id, k); });
  // then new cards by weight until the deck has its count, then copies of its own cards
  const target = Math.min(f.dMax, Math.max(f.dMin, Object.keys(d).length));
  let guard = 0;
  while (Object.keys(d).length < target && L.size(d) < f.S && guard++ < 50) {
    const c = f.pool.filter(id => !d[id] && room(id) > 0 && !clash(id)); if (!c.length) break;
    const tot = c.reduce((t, id) => t + weight(id), 0); let x = R() * tot, pick = c[c.length - 1]; for (const id of c) { x -= weight(id); if (x <= 0) { pick = id; break; } }
    add(pick, 1);
  }
  guard = 0;
  const fresh = () => f.pool.filter(id => !d[id] && room(id) > 0 && !clash(id)).sort((p, q) => (nonU(p) ? 1 : 0) - (nonU(q) ? 1 : 0) || weight(q) - weight(p));
  while (L.size(d) < f.S && guard++ < 300) {
    const own = Object.keys(d).filter(id => room(id) > 0).sort((p, q) => (want[q] || 0) - (want[p] || 0) || weight(q) - weight(p));
    if (own.length) { add(own[Math.floor(R() * Math.min(2, own.length))], 1); continue; }
    if (Object.keys(d).length < f.dMax) { const c = fresh(); if (c.length) { add(c[0], 1); continue; } }
    // stuck (K14 holds the carried cards to 1 copy): a carried card that is not kept makes room for one of the map's own
    const nu = Object.keys(d).filter(id => nonU(id) && !f.keep.has(id)).sort((p, q) => (want[p] || 0) - (want[q] || 0)); if (!nu.length) break; delete d[nu[0]];
  }
  guard = 0; // too few different cards: a copy of the biggest card goes to a new one
  while (Object.keys(d).length < f.dMin && guard++ < 10) { const c = fresh(); if (!c.length) break;
    const big = Object.keys(d).filter(id => d[id] > (f.keep.get(id) || 0) && d[id] > 1).sort((p, q) => d[q] - d[p])[0]; if (!big) break; d[big]--; add(c[0], 1); }
  while (L.size(d) > f.S) { const own = Object.keys(d).filter(id => !f.keep.has(id) || d[id] > f.keep.get(id)).sort((p, q) => d[q] - d[p]); if (!own.length) break; d[own[0]]--; if (!d[own[0]]) delete d[own[0]]; }
  boonFix(f, d); fill.last = f.problems(d); return f.legal(d) ? d : null;
}
// a challenge fight's selfish boon (DF3) stays on: copies move from off-theme cards to the deck's (or the pool's) theme cards until half hold it
const ENG = require(path.join(ROOT, 'bramblewood-engine.js'));
const themed = (f, id) => !!(f.n.rules && f.n.rules.boon) && ENG.selfishBoonCount(L.DX, { [id]: 1 }, f.n.rules.boon).have === 1;
function boonFix(f, d) {
  if (!(f.n.rules && f.n.rules.boon)) return; const on = () => ENG.selfishBoonCount(L.DX, d, f.n.rules.boon).on; let guard = 0;
  const nonU = id => f.U && !f.U.has(id) && !f.L0.includes(id);
  while (!on() && guard++ < 40) {
    const outs = Object.keys(d).filter(id => !themed(f, id) && d[id] > (f.keep.get(id) || 0)).sort((p, q) => d[q] - d[p]); if (!outs.length) return;
    const ins = Object.keys(d).filter(id => themed(f, id) && d[id] < f.cap(id) && !nonU(id)).concat(Object.keys(d).length < f.dMax ? f.pool.filter(id => !d[id] && themed(f, id) && !nonU(id)) : []);
    if (!ins.length) { // at the card limit: a whole off-theme card that is not kept makes way for a themed one
      const whole = outs.filter(id => !f.keep.has(id)), nw = f.pool.filter(id => !d[id] && themed(f, id) && !nonU(id)); if (!whole.length || !nw.length) return;
      const o = whole[whole.length - 1], k = d[o]; delete d[o]; d[nw[0]] = Math.min(k, f.cap(nw[0])); continue; }
    const o = outs[0], i = ins[0]; d[o]--; if (!d[o]) delete d[o]; d[i] = (d[i] || 0) + 1;
  }
}
// copies spread over chosen cards with a tilt: an easy fight (high target) leans on its lighter cards, a hard one on its heavier
function spread(ids, S, target) {
  const s = ids.slice().sort((p, q) => score(p) - score(q)), n = s.length, w = {}, tilt = target >= 0.75 ? -1 : target <= 0.5 ? 1 : 0;
  s.forEach((id, i) => { w[id] = Math.max(0.6, 1 + tilt * 0.35 * ((i / Math.max(1, n - 1)) * 2 - 1)); });
  const tot = Object.values(w).reduce((t, x) => t + x, 0), out = {}; s.forEach(id => { out[id] = w[id] / tot * S; }); return out;
}
function planMap(m) {
  const nodes = L.fightsOf(m), F = nodes.map(n => L.fight(m, n)), R = rng('skir1|' + m.id);
  const boss = F.filter(f => L.isBoss(f.n, nodes)), plainF = F.filter(f => !boss.includes(f));
  const slotsPool = plainF.length > 3 ? plainF.slice(1) : plainF.slice();
  const picks = slotsPool.length <= 3 ? slotsPool.slice() : [slotsPool[0], slotsPool[Math.floor((slotsPool.length - 1) / 2)], slotsPool[slotsPool.length - 1]].filter((f, i, x) => x.indexOf(f) === i);
  // the strategies: SKIR1's own BPRO search for the new list (docs/balance/skir1/refdecks/bpro, best first) when it has run, else the file's
  // BPRO decks; then the file's PRO decks
  const ent = PRO[m.id] || {}, seen = new Set(), strat = [], no2 = String(G.mapNumberOf(m.id)).padStart(2, '0');
  const bf = path.join(ROOT, 'docs', 'balance', 'skir1', 'refdecks', 'bpro', `bench-deck-map${no2}-${m.id}-2026-11-11.json`);
  const fresh = fs.existsSync(bf) ? JSON.parse(fs.readFileSync(bf, 'utf8')).decks.slice().sort((p, q) => q.score - p.score).map(d => ({ id: "BPRO", focus: d.focus, deck: d.deck, score: d.score })) : null;
  (fresh || ent.bpro || []).concat(ent.pro || []).forEach(s => { if (strat.length >= 3 || seen.has(s.focus)) return; seen.add(s.focus); strat.push(s); });
  const order = strat.slice().reverse(); // the strongest (BPRO-1) in the latest slot
  const listAll = [...new Set([].concat(...F.map(f => f.pool)))];
  const famCount = {}; listAll.forEach(id => { famCount[family(id)] = (famCount[family(id)] || 0) + 1; });
  const pairFam = id => famCount[family(id)] === 2 ? family(id) : null;
  const usage = {}, ucap = Math.max(2, Math.ceil(F.length / 2)), forced = new Set([].concat(...F.map(f => [...f.keep.keys()])));
  // a card in at most ucap fights (slack: a later try allows 1 more), its kept fights aside; two cards of a two-card family never together
  const avoidFor = (f, slack) => (d, id) => { const pf = pairFam(id); if (pf && !f.keep.has(id) && Object.keys(d).some(x => x !== id && family(x) === pf)) return true; return !f.keep.has(id) && (usage[id] || 0) >= ucap + (slack || 0); };
  const weight = id => Math.pow(0.45, usage[id] || 0) * (1 + 0.2 * R()); // (a challenge fight's boon-theme cards weigh x4 there: wBoon)
  const wBoon = (f, id) => weight(id) * (themed(f, id) ? 4 : 1);
  const out = {}, use = (d, f) => Object.keys(d).forEach(id => { if (!f.keep.has(id)) usage[id] = (usage[id] || 0) + 1; }); // a fight that keeps the card does not count
  const target = f => { try { return G.skirmishTargetBand(f.map, f.n).t; } catch (e) { return 0.6; } };
  // peaks first, then bosses, then the rest in road order
  picks.forEach((f, i) => { const s = order[i]; if (!s) return;
    const want = {}; Object.entries(s.deck).forEach(([id, k]) => { if (f.pool.includes(id)) want[id] = k * f.S / 20; });
    const ids = Object.keys(want).sort((p, q) => score(q) * want[q] - score(p) * want[p]);
    if (ids.length >= 2) { const cut = f.S >= 15 ? 2 : 1; want[ids[0]] = Math.max(1, want[ids[0]] - cut); want[ids[ids.length - 1]] += cut; } // slightly down-tuned
    let d = null; for (let t = 0; t < 30 && !d; t++) d = fill(f, want, weight, R, avoidFor(f, t < 20 ? 0 : 1));
    if (d) { out[f.code] = { role: 'peak', strategy: s.id, focus: s.focus, deck: d }; use(d, f); } });
  const rest = boss.concat(plainF).filter(f => !out[f.code]);
  rest.forEach(f => { const isB = boss.includes(f), n = Math.min(f.dMax, Math.max(f.dMin, isB ? 6 + (R() < 0.4 ? 1 : 0) : f.S <= 13 ? 5 : 5 + (R() < 0.5 ? 1 : 0)));
    let d = null;
    for (let t = 0; t < 40 && !d; t++) {
      const avoid = avoidFor(f, t < 20 ? 0 : t < 30 ? 1 : 3), chosen = [...f.keep.keys()], cands = f.pool.filter(id => !chosen.includes(id) && !avoid(Object.fromEntries(chosen.map(x => [x, 1])), id));
      while (chosen.length < n && cands.length) { const tot = cands.reduce((s, id) => s + wBoon(f, id) * (isB ? 0.5 + score(id) / 10 : 1), 0); let x = R() * tot, k = cands.length - 1;
        for (let j = 0; j < cands.length; j++) { x -= wBoon(f, cands[j]) * (isB ? 0.5 + score(cands[j]) / 10 : 1); if (x <= 0) { k = j; break; } }
        const id = cands.splice(k, 1)[0]; if (!avoid(Object.fromEntries(chosen.map(y => [y, 1])), id)) chosen.push(id); }
      d = fill(f, spread(chosen, f.S, target(f)), weight, R, avoid);
    }
    out[f.code] = d ? { role: isB ? 'boss' : 'blend', deck: d } : { role: 'unbuilt', deck: f.old, problems: ['no legal deck found: ' + (fill.last || []).join('; ')] };
    if (d) use(d, f); });
  // the mix: every kind the fights' pools hold, up to THEME8's minimum, shown somewhere in the map's decks
  const repairs = [], kindsOf = id => M.kinds(D[id]);
  for (const k of Object.keys(MIN)) {
    const avail = listAll.filter(id => kindsOf(id)[k]), need = Math.min(MIN[k], avail.length);
    const shown = () => new Set([].concat(...Object.values(out).map(x => Object.keys(x.deck))).filter(id => kindsOf(id)[k]));
    let guard = 0;
    while (shown().size < need && guard++ < 12) {
      const missing = avail.filter(id => !shown().has(id)).sort((p, q) => (usage[p] || 0) - (usage[q] || 0)); let done = false;
      for (const c of missing) { for (const f of F.filter(x => out[x.code] && out[x.code].role !== 'unbuilt' && x.pool.includes(c)).sort((p, q) => (out[p.code].role === 'blend' ? 0 : 1) - (out[q.code].role === 'blend' ? 0 : 1))) {
          const d0 = out[f.code].deck, outs = Object.keys(d0).filter(id => !f.keep.has(id) && !kindsOf(id)[k]).sort((p, q) => (usage[q] || 0) - (usage[p] || 0));
          for (const o of outs) { const d = Object.assign({}, d0), kk = d[o]; delete d[o]; d[c] = Math.min(kk, f.cap(c)); let left = kk - d[c];
            for (const id of Object.keys(d)) { while (left > 0 && d[id] < f.cap(id) && !(f.U && !f.U.has(id) && !f.L0.includes(id))) { d[id]++; left--; } }
            if (left === 0 && f.legal(d) && !(pairFam(c) && Object.keys(d).some(x => x !== c && family(x) === pairFam(c)))) { out[f.code].deck = d; usage[o]--; usage[c] = (usage[c] || 0) + 1; repairs.push({ kind: k, fight: f.code, out: o, in: c }); done = true; break; } }
          if (done) break; }
        if (done) break; }
      if (!done) break;
    }
  }
  const all = [...new Set([].concat(...Object.values(out).map(x => Object.keys(x.deck))))], mix = M.mixOf(D, all), mixList = M.mixOf(D, listAll);
  return { id: m.id, mapNo: G.mapNumberOf(m.id), side: !!m.sub, name: m.name, strategies: strat.map(s => ({ id: s.id, focus: s.focus })), peaks: picks.map(f => f.code), usageCap: ucap, repairs,
    mix: Object.fromEntries(Object.keys(mix).map(k => [k, { shown: mix[k].length, list: mixList[k].length }])),
    fights: F.map(f => Object.assign({ code: f.code, kind: f.kind, size: f.S, old: f.old, leaders0: f.stoneLeader ? (L.G.skirmishLeadersOf(f.n, f.map) || []) : f.L0, explicitLeaders: f.explicit, showcase: f.n.showcase || null, stoneLeader: f.stoneLeader || false }, out[f.code], { problems: (out[f.code] || {}).problems || f.problems((out[f.code] || {}).deck || f.old) })),
    usage: Object.fromEntries(Object.entries(usage).filter(([, k]) => k > 0).sort((p, q) => q[1] - p[1])) };
}
if (CMD === 'plan') {
  const want = arg('--maps') ? new Set(arg('--maps').split(',')) : null;
  const res = { about: 'SKIR1 build plan (tools/skir1/build_2026_11_11.js): every road fight of Maps 0-20 and their side maps rebuilt from its map list (THEME5 plan)', built: '2026-11-11', maps: [] };
  // a map already rebuilt (its lines carry a SKIR1 comment) is never planned again: its plan entry keeps the pre-SKIR1 decks
  const SRC0 = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), rebuilt = m => L.fightsOf(m).some(n => new RegExp(`^\\s*\\{ ?key:\\s*"${n.key.replace(/-/g, '\\-')}",.*\\(SKIR1`, 'm').test(SRC0));
  for (const m of L.maps()) { if (want && !want.has(m.id)) continue; if (rebuilt(m)) { console.log(m.id + ': already rebuilt, not planned again'); if (want) want.delete(m.id); continue; } const p = planMap(m); res.maps.push(p);
    const bad = p.fights.filter(x => x.problems.length);
    console.log(`${p.side ? '  side' : 'Map'} ${p.mapNo} ${p.id}: ${p.fights.length} fights, peaks ${p.peaks.join('/')} <- ${p.strategies.map(s => s.id).reverse().join(', ')}; repairs ${p.repairs.length}; mix ${Object.entries(p.mix).map(([k, v]) => k + ' ' + v.shown + '/' + v.list).join(' ')}${bad.length ? ' | PROBLEMS ' + bad.map(x => x.code + ': ' + x.problems.join('; ')).join(' | ') : ''}`); }
  // --maps: those maps are planned again and replace their entries; the others stay as planned before (the plan holds every fight's pre-SKIR1 deck)
  let prev = []; try { prev = want ? JSON.parse(fs.readFileSync(PLAN, 'utf8')).maps.filter(p => !want.has(p.id)) : []; } catch (e) {}
  res.maps = prev.concat(res.maps); fs.writeFileSync(PLAN, JSON.stringify(res, null, 1) + '\n');
} else if (CMD === 'apply') {
  const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8')), APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  const only = arg('--maps') ? new Set(arg('--maps').split(',')) : null;
  for (const p of plan.maps.filter(q => !only || only.has(q.id))) for (const x of p.fights) {
    if (x.problems && x.problems.length) { console.log('skip', x.code, x.problems.join('; ')); continue; }
    if (L.keyOf(x.deck) === L.keyOf(x.old)) continue;
    { const cur = (s.match(new RegExp(`^\\s*\\{ ?key:\\s*"${x.code.replace(/-/g, '\\-')}",.*$`, 'm')) || [''])[0], cd = (cur.match(/deck:(\{[^}]*\})/) || [0, '{}'])[1];
      if (L.keyOf(JSON.parse(cd)) !== L.keyOf(x.old)) continue; } // only a line that still holds its pre-SKIR1 deck (never over a fit)
    const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${x.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('node not found ' + x.code);
    const deck = Object.fromEntries(Object.keys(x.deck).sort().map(k => [k, x.deck[k]]));
    const why = x.role === 'peak' ? `peak strategy ${x.strategy} (${x.focus}), slightly down-tuned` : x.role === 'boss' ? 'a blend of the list\'s cards (boss / ender; leader kept)' : 'a blend of the list\'s cards';
    const line = mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck) + ` /* 2026-11-11 (SKIR1): rebuilt from the map's 2026-11-11 list, THEME5 plan: ${why}; deck (was ${JSON.stringify(x.old)}) */`);
    s = s.replace(mm[1], line); n++;
  }
  fs.writeFileSync(APP + '.skir1tmp', s); fs.renameSync(APP + '.skir1tmp', APP); console.log('applied', n, 'decks'); // written whole, then renamed: a sim starting meanwhile never reads half a file
}
// purge: a card a later list change took off (a SKIR1 drop: CUT3, LIST-1104, LISTFIX2) or a leader card that was never in the fight's deck
// leaves every rebuilt deck; its copies go to the deck's own card nearest its stat score (or a pool card) as legality allows. The fights it
// touched are printed for a fit pass.
if (CMD === 'purge') {
  const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8')), APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'); const touched = [];
  const byCode = {}; plan.maps.forEach(p => p.fights.forEach(x => { byCode[x.code] = x; }));
  for (const m of L.maps()) for (const n of L.fightsOf(m)) { const x = byCode[n.key]; if (!x) continue;
    const n0 = Object.assign({}, n, { deck: x.old }); G.NODE_MAP_HINT.set(n0, m.id); // the fight's rules read from its pre-SKIR1 deck (what it kept then)
    const f = L.fight(m, n0), firsts = (G.nodeFirstClearCardIds || G.nodeRewardCardIds)(m.id, n.key) || [];
    const okId = id => f.list.has(id) || f.own.includes(id) || (x.old[id] && (firsts.includes(id) || (x.leaders0 || []).includes(id) || id === x.showcase));
    const bad = Object.keys(n.deck).filter(id => !okId(id)); if (!bad.length) continue;
    const d = Object.assign({}, n.deck);
    for (const b of bad) { let k = d[b]; delete d[b];
      const order = Object.keys(d).concat(f.pool.filter(id => !d[id] && okId(id))).filter(id => okId(id)).sort((p, q) => Math.abs(score(p) - score(b)) - Math.abs(score(q) - score(b)));
      for (const id of order) { while (k > 0) { const t = Object.assign({}, d); t[id] = (t[id] || 0) + 1; if (t[id] > f.cap(id) || f.k14(t).length || Object.keys(t).length > f.dMax) break; d[id] = t[id]; k--; } if (!k) break; } }
    if (!f.legal(d)) { console.log('purge: no legal deck for', n.key, f.problems(d).join('; ')); continue; }
    const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${n.key.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re);
    const deck = Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]]));
    s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck) + ` /* 2026-11-11 (SKIR1): ${bad.join(', ')} out (off the list by a standing owner rule, or a leader never in this deck); deck (was ${JSON.stringify(n.deck)}) */`));
    touched.push(n.key); console.log('purged', n.key, bad.join(','), JSON.stringify(deck)); }
  fs.writeFileSync(APP + '.skir1tmp', s); fs.renameSync(APP + '.skir1tmp', APP); console.log('touched:', touched.join(','));
}
// apply and pin: a fight led by its Auto showcase (no explicit leaders, no showcase field) gets that card written as its `showcase`, so the
// leader stays the same card whatever else its deck holds (the panel and the CPU already used it; tools/skir1/lib_fight pin)
if (CMD === 'apply' || CMD === 'pin') {
  const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8')), APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  const only = arg('--maps') ? new Set(arg('--maps').split(',')) : null;
  for (const p of plan.maps.filter(q => !only || only.has(q.id))) for (const x of p.fights) {
    if (x.explicitLeaders || x.showcase || x.stoneLeader || !x.leaders0 || x.leaders0.length !== 1) continue;
    const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${x.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('node not found ' + x.code);
    const head = mm[1].split('/*')[0]; if (/showcase:"/.test(head) || !/\(SKIR1/.test(mm[1])) continue;
    s = s.replace(mm[1], mm[1].replace(/deck:\{/, `showcase:"${x.leaders0[0]}" /* 2026-11-11 (SKIR1): its Auto showcase leader, pinned */, deck:{`)); n++;
  }
  fs.writeFileSync(APP + '.skir1tmp', s); fs.renameSync(APP + '.skir1tmp', APP); console.log('pinned', n, 'showcase leaders');
}
module.exports = { planMap, fill, spread, family, score };
