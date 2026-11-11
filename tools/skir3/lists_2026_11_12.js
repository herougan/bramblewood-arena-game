#!/usr/bin/env node
// 2026-11-12 (package SKIR3, owner 00:38: "filled up map 0-20! (21 too)" ... "I want you to also enforce the unique card limits on the cards for each
// map"; earlier that night: "I think [submaps] should only have 1-3 unique cards"): the owner's finished picks become the map lists, under each map's
// default limits (the game's ui37Targets: th6Targets on a main map, NEW! 3 / Carried 8 on a side map, UI48's default).
//   NEW! / Carried as the game splits them (ui37Split / ui44Split): Carried = on the tutorial's T-1 / T-2 list or on an earlier main map's list (here the
//   final lists, so the split matches what the window shows once the flags equal the lists); a Baby card never counts toward NEW!.
// Main maps 0-21 (MAP tier), in road order, each: his Yes picks + Claude's adds (UI47_ADMIN_ADD, which already holds SKIR1's EXTRA adds and CONTENT19's
// Sea Bass). Over a limit:
//   1. Claude's adds go first (one a check needs, a first-clear card or the list's only Guardian, last);
//   2. then his picks: one that stays on another list (in play) before one that leaves play; a NEW! card whose other list is a later main map with room
//      before one whose later map is over too; weakest UI38 fit on this map first (docs/design/map-prospects-2026-11-09.json), then least used by the
//      map's fights and reference decks.
// Side maps up to the Map 20 region: The Old Bramble = his 6 picks, the rest = their current SUBMAP list; each cut to NEW! 3 / Carried 8, keeping the
// cards its fights and PRO / BPRO / WPRO decks use most (The Old Bramble: by the same rule as the main maps).
// CACTUS below: CACTI1's card, one of the owner's picks on the map CACTI1 recommends (filled in when CACTI1 merges).
// Writes: canonical/map-pools.json, arena_app.js UI47_ADMIN_ADD (only the adds that stay), canonical/cards.json `unattainable` flags (SKIR1's rule),
// canonical/card-obtain-maps.json (tools/forge_curve_2026_10_19.js maps), docs/balance/skir3/lists-2026-11-12.json (the record, drops with reasons).
//   node tools/skir3/lists_2026_11_12.js [--dry]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const DRY = process.argv.includes('--dry');
// CACTI1 (merged 2026-11-12, b6162b29): the Barrel Cactus, recommended for The Glass Dunes (Map 18) as a Rare; one of the owner's picks there. Its
// awaitingSource mark is cleared once it is on a list (the card is then a pack card of its first list, as every listed card).
const CACTUS = { id: 'barrel-cactus', map: 'md' };
const MAIN = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11', 'm21'];
const SIDES = ['mo', 'mq', 'mp', 'mg', 'ms', 'mz', 'mn', 'mj', 'mv', 'my', 'mi', 'mpd', 'm9', 'me', 'mx'];
const SIDE_LIMIT = { own: 3, carried: 8 };
// the game's th6Targets (arena_app.js), main maps
function th6(n) { const own = n <= 20 ? Math.round(10 - 2 * Math.max(0, n - 2) / 18) : n <= 40 ? Math.round(7 - (n - 21) / 19) : 5;
  const carried = n <= 8 ? 5 : n <= 20 ? Math.round(5 + 8 * (n - 8) / 12) : n <= 40 ? Math.round(14 + 2 * (n - 21) / 19) : 16 + Math.floor((n - 41) / 20); return { own, carried }; }
const PICKS = J('docs/design/map-picks-owner-2026-11-12.json').maps, POOLS_FILE = path.join(ROOT, 'canonical', 'map-pools.json'), pools = J('canonical/map-pools.json');
// the lists when SKIR3 began (the batch tip b6162b29, CACTI1 merged), so a re-run keeps the whole change on record
const BASE = 'b6162b29', atBase = f => JSON.parse(cp.execSync('git show ' + BASE + ':' + f, { cwd: ROOT, maxBuffer: 1 << 28 }).toString());
const before = atBase('canonical/map-pools.json').maps;
const CARDS = J('canonical/cards.json'), C = {}; CARDS.forEach(c => { C[c.id] = c; });
const APP = path.join(ROOT, 'arena_app.js'); let src = fs.readFileSync(APP, 'utf8');
const grab = name => JSON.parse(src.match(new RegExp('const ' + name + ' = (\\{.*?\\});\\n'))[1]);
const put = (name, obj) => { src = src.replace(new RegExp('const ' + name + ' = \\{.*?\\};\\n'), () => 'const ' + name + ' = ' + JSON.stringify(obj).replace(/","/g, '", "').replace(/":\[/g, '": [').replace(/\],"/g, '], "') + ';\n'); };
// the adds and side lists as they stood when SKIR3 began (the base commit: this tool clears and cuts them)
const RECF = path.join(ROOT, 'docs', 'balance', 'skir3', 'lists-2026-11-12.json');
const ADMIN0 = JSON.parse(cp.execSync('git show ' + BASE + ':arena_app.js', { cwd: ROOT, maxBuffer: 1 << 28 }).toString().match(/const UI47_ADMIN_ADD = (\{.*?\});\n/)[1]);
const EXTRA = require('../skir1/extra_2026_11_11.js');
const claudeAdds = k => [...new Set((ADMIN0[k] || []).concat(Object.keys((EXTRA.main || {})[k] || {}), Object.keys((EXTRA.batch || {})[k] || {})))];
const SIDE0 = Object.fromEntries(SIDES.map(s => { const p = Object.keys(before).find(t => (before[t].submaps || {})[s]); return [s, before[p].submaps[s].slice()]; }));
const parentOf = s => Object.keys(pools.maps).find(t => (pools.maps[t].submaps || {})[s]);
const tut = pools.maps.m1.submaps.mtut12.slice();
const baby = id => C[id] && C[id].kind === 'baby';
const nm = id => (C[id] || {}).name || id;
// UI38 fit (main maps)
const PROS = J('docs/design/map-prospects-2026-11-09.json').maps, FIT = {};
Object.entries(PROS).forEach(([k, m]) => { FIT[k] = {}; (m.fit || []).forEach(([id, s]) => { FIT[k][id] = s; }); });
const fitOf = (k, id) => (FIT[k] || {})[id] || 0;
// usage: copies in the map's road fights and its PRO / BPRO / WPRO decks
const LB = require('../lib_bramble.js'), G = LB.G, PRO = J('canonical/pro-skirmishes.json').maps, USE = {};
const useAdd = (k, deck) => Object.entries(deck || {}).forEach(([id, n]) => { (USE[k] = USE[k] || {})[id] = (USE[k][id] || 0) + n; });
G.CONQUEST_MAPS.forEach(m => (m.nodes || []).forEach(n => useAdd(m.id, n.deck)));
Object.entries(PRO).forEach(([k, e]) => ['pro', 'bpro', 'wpro'].forEach(t => (e[t] || []).forEach(x => useAdd(k, x.deck))));
const useOf = (k, id) => (USE[k] || {})[id] || 0;
// first-clear cards of a map's fights (GD-5 table, node firstCard) and the Guardian rule (BAL9 JJ28)
const DK = require('../bal9/decks_2026_11_02.js');
const firstOn = k => { const m = G.CONQUEST_MAPS.find(x => x.id === k), out = new Set(); (m && m.nodes || []).forEach(n => { try { G.nodeFirstPackCardIds(k, n.key).forEach(id => out.add(id)); } catch (e) {} if (n.firstCard) [].concat(n.firstCard).forEach(id => out.add(id)); }); return out; };
const isDef = id => DK.defenderKeysOf(id).length > 0;
const picksOf = k => { const y = ((PICKS[k] || {}).yes || []).slice(); if (CACTUS && CACTUS.map === k && !y.includes(CACTUS.id)) y.push(CACTUS.id); return y.filter(id => C[id]); };
const FIRST = {}; MAIN.forEach(k => { FIRST[k] = firstOn(k); });
// off the road but in play: a Map 22-24 list, a SPECIAL list (side lists left out: SKIR3 cuts them too)
const OFFROAD = {}; Object.entries(pools.maps).forEach(([t, e]) => { if (!MAIN.includes(t)) (e.cards || []).forEach(id => { (OFFROAD[id] = OFFROAD[id] || []).push(t); }); (e.special || []).forEach(id => { (OFFROAD[id] = OFFROAD[id] || []).push(t + ' SPECIAL'); }); });
const PICKED = new Set([].concat(...MAIN.map(picksOf)));
// One pass over the road (Maps 0-21 in order). forced: {'<map>:<step>': card} overrides the default choice at that step. The default: a Carried card
// (it stays on its earlier list); a NEW! card on a later road map with NEW! room, on a later road map that is over too, only on a Map 22-24 / SPECIAL list
// (in play, off the road), on no other list (leaves play); weakest UI38 fit first. The pass's cost (lower is better): 1 a pick taken off a map
// (+ fit / 20), 0.5 a picked card off every road list but in play (Map 22-24 / SPECIAL), 24 a picked card out of play.
function simulate(forced) {
  const final = {}, seen = new Set(tut), recs = {}, decisions = [];
  const otherLists = (k, id) => { const out = []; MAIN.forEach(j => { if (j !== k && (final[j] ? final[j] : picksOf(j)).includes(id)) out.push(j); }); return out.concat(OFFROAD[id] || []); };
  MAIN.forEach((k, n) => {
    const t = th6(n), yes = picksOf(k), adds = claudeAdds(k).filter(id => C[id] && !yes.includes(id)), list = yes.concat(adds), drops = [], first = FIRST[k];
    const isNew = id => !seen.has(id), cnt = () => ({ neu: list.filter(id => isNew(id) && !baby(id)).length, car: list.filter(id => !isNew(id)).length });
    const drop = (id, why) => { list.splice(list.indexOf(id), 1); drops.push({ id, name: nm(id), who: adds.includes(id) ? 'claude' : 'owner', side: isNew(id) ? 'NEW!' : 'Carried', fit: fitOf(k, id), why }); };
    // 1. Claude's adds: a needed one (first-clear card, the only Guardian) last, then weakest fit
    const needed = id => first.has(id) || (isDef(id) && list.filter(isDef).length === 1);
    const addOrder = ids => ids.slice().sort((a, b) => (needed(a) ? 1 : 0) - (needed(b) ? 1 : 0) || fitOf(k, a) - fitOf(k, b) || useOf(k, a) - useOf(k, b));
    for (const kind of ['neu', 'car']) {
      const lim = kind === 'neu' ? t.own : t.carried, pool = () => addOrder(list.filter(id => adds.includes(id) && (kind === 'neu' ? isNew(id) && !baby(id) : !isNew(id))));
      while (cnt()[kind] > lim && pool().length) { const id = pool()[0]; drop(id, `Claude's add: no room under ${kind === 'neu' ? 'NEW!' : 'Carried'} ${lim}` + (needed(id) ? ' (it was needed: ' + (first.has(id) ? 'a first-clear card' : 'the list\'s only Guardian') + ')' : '')); }
    }
    // 2. his picks
    const laterRoom = j => { const jn = MAIN.indexOf(j), s2 = new Set(seen); list.forEach(id => s2.add(id)); for (let i = n + 1; i < jn; i++) picksOf(MAIN[i]).forEach(id => s2.add(id));
      return picksOf(j).filter(id => !s2.has(id) && !baby(id)).length <= th6(jn).own; };
    const tier = (id, kind) => { if (kind === 'car') return 0; const o = otherLists(k, id); if (!o.length) return 3;
      const later = o.filter(j => MAIN.indexOf(j) > n); if (!later.length) return 2.5; return later.some(laterRoom) ? 1 : 2; };
    let step = 0;
    for (const kind of ['neu', 'car']) {
      const lim = kind === 'neu' ? t.own : t.carried;
      while (cnt()[kind] > lim) {
        const cand = list.filter(id => !adds.includes(id) && (kind === 'neu' ? isNew(id) && !baby(id) : !isNew(id))).sort((a, b) => tier(a, kind) - tier(b, kind) || fitOf(k, a) - fitOf(k, b) || useOf(k, a) - useOf(k, b) || (a < b ? -1 : 1));
        const key = k + ':' + step++, f = forced[key], id = f && cand.includes(f) ? f : cand[0], tr = tier(id, kind), o = otherLists(k, id);
        decisions.push({ key, cand });
        drop(id, (kind === 'neu' ? `over NEW! ${lim}` : `over Carried ${lim}`) + `; UI38 fit ${fitOf(k, id)}` + (tr === 3 ? '; on no other list' : `; still on ${o.join(', ')} then`) + (first.has(id) ? '; a first-clear card here' : ''));
      }
    }
    const c = cnt(); final[k] = list.slice(); list.forEach(id => seen.add(id));
    recs[k] = { mapNo: n, limits: t, picks: yes.length, claudeAdds: adds, neu: c.neu, car: c.car, drops, list: final[k], before: (before[k] || {}).cards || [] };
  });
  const onRoad = new Set([].concat(...Object.values(final)));
  let cost = 0; Object.values(recs).forEach(r => r.drops.forEach(d => { if (d.who === 'owner') cost += 1 + d.fit / 20; }));
  PICKED.forEach(id => { if (!onRoad.has(id) && !tut.includes(id)) cost += OFFROAD[id] ? 0.5 : 24; });
  return { final, recs, cost, decisions };
}
// greedy with a roll-out: at each step in road order, the card whose pass (default choices after it) costs least
const forced = {}; let best = simulate(forced);
for (let d = 0; d < best.decisions.length; d++) {
  const dec = best.decisions[d]; let pick = null;
  dec.cand.forEach(id => { const r = simulate(Object.assign({}, forced, { [dec.key]: id })); if (!pick || r.cost < pick.r.cost - 1e-9) pick = { id, r }; });
  forced[dec.key] = pick.id; best = pick.r;
}
const final = best.final;
const rec = { about: 'SKIR3 lists (tools/skir3/lists_2026_11_12.js): the owner\'s 2026-11-12 picks under the default NEW! / Carried limits', built: '2026-11-12',
  adminBefore: ADMIN0, sideBefore: SIDE0, cactus: CACTUS, cost: +best.cost.toFixed(2), main: best.recs, side: {}, adminAfter: {}, leftPlay: [] };
MAIN.forEach(k => { rec.adminAfter[k] = rec.main[k].claudeAdds.filter(id => final[k].includes(id)); });
const otherLists = (k, id) => { const out = []; MAIN.forEach(j => { if (j !== k && final[j].includes(id)) out.push(j); }); return out.concat(OFFROAD[id] || []); };
// side maps
const unlockOf = s => { const m = G.CONQUEST_MAPS.find(x => x.id === s), a = m && m.entry && m.entry.afterMapCleared; return a ? G.mapUnlockNumberOf(a) : G.mapNumberOf(s); };
const mainUpTo = un => { const s = new Set(tut); MAIN.forEach((k, i) => { if (i <= un) final[k].forEach(id => s.add(id)); }); Object.entries(pools.maps).forEach(([t, e]) => { const no = G.mapNumberOf(t); if (!MAIN.includes(t) && !e.sub && no != null && no <= un) (e.cards || []).forEach(id => s.add(id)); }); return s; };
SIDES.forEach(s => {
  const un = unlockOf(s), idx = mainUpTo(un), base = s === 'mo' ? picksOf('mo') : SIDE0[s].filter(id => C[id]), list = base.slice(), drops = [];
  const isNew = id => !idx.has(id), use = id => useOf(s, id);
  for (const kind of ['neu', 'car']) {
    const lim = kind === 'neu' ? SIDE_LIMIT.own : SIDE_LIMIT.carried, pick = () => list.filter(id => kind === 'neu' ? isNew(id) && !baby(id) : !isNew(id));
    while (pick().length > lim) {
      // The Old Bramble (his picks): one that stays on another list first, as on the main maps (no UI38 fit for side maps: least used next)
      const stays = id => s === 'mo' && otherLists(s, id).length ? 0 : 1;
      const ord = pick().sort((a, b) => stays(a) - stays(b) || use(a) - use(b) || (a < b ? -1 : 1));
      const id = ord[0], o = otherLists(s, id).filter(x => x !== s);
      list.splice(list.indexOf(id), 1);
      drops.push({ id, name: nm(id), who: s === 'mo' ? 'owner' : 'list', side: kind === 'neu' ? 'NEW!' : 'Carried', why: `over ${kind === 'neu' ? 'NEW!' : 'Carried'} ${lim}; ${use(id)} copies in its fights / reference decks` + (o.length ? `; stays on ${o.join(', ')}` : '') });
    }
  }
  final[s] = list;
  rec.side[s] = { parent: parentOf(s), unlockAfterNo: un, limits: SIDE_LIMIT, neu: list.filter(id => isNew(id) && !baby(id)).length, car: list.filter(id => !isNew(id)).length, drops, list, before: SIDE0[s] };
});
// write the lists
MAIN.forEach(k => { pools.maps[k].cards = final[k]; });
SIDES.forEach(s => { pools.maps[parentOf(s)].submaps[s] = final[s]; });
const listed = new Set(); Object.values(pools.maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {}).map(l => Array.isArray(l) ? l : (l.cards || []))).forEach(id => listed.add(id)));
const wasListed = new Set(); Object.values(before).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {}).map(l => Array.isArray(l) ? l : (l.cards || []))).forEach(id => wasListed.add(id)));
rec.leftLists = [...wasListed].filter(id => !listed.has(id)).sort();
rec.newOnLists = [...listed].filter(id => !wasListed.has(id)).sort();
const pr = (k, r) => console.log(`${(r.mapNo != null ? 'Map ' + r.mapNo : 'side ' + k).padEnd(8)} ${k.padEnd(4)} NEW! ${r.neu}/${r.limits.own} Carried ${r.car}/${r.limits.carried}  ${r.before.length} -> ${r.list.length}` + (r.drops.length ? '  drops: ' + r.drops.map(d => `${d.who === 'claude' ? '[C] ' : ''}${d.id}`).join(', ') : ''));
Object.entries(rec.main).forEach(([k, r]) => pr(k, r)); Object.entries(rec.side).forEach(([k, r]) => pr(k, r));
console.log('off every list now:', rec.leftLists.join(' ') || '-'); console.log('new on a list:', rec.newOnLists.join(' ') || '-');
const where = id => Object.keys(final).filter(x => final[x].includes(id)).join(',') || 'no main / side list';
Object.entries(rec.main).concat(Object.entries(rec.side)).forEach(([k, r]) => r.drops.forEach(d => { d.nowOn = where(d.id); }));
if (process.argv.includes('--why')) Object.entries(rec.main).concat(Object.entries(rec.side)).forEach(([k, r]) => r.drops.forEach(d => console.log(`  ${k} ${d.who} ${d.id} (${d.side}): ${d.why} | now on ${d.nowOn}`)));
if (DRY) { console.log('dry run'); process.exit(0); }
const { serialize } = require('../fold_map_pools.js');
fs.writeFileSync(POOLS_FILE, serialize(pools));
const ADM = {}; Object.entries(rec.adminAfter).forEach(([k, l]) => { if (l.length) ADM[k] = l; });
put('UI47_ADMIN_ADD', ADM);
src = src.replace(/^\/\/ 2026-11-11 \(SKIR2\): admin adds named by SKIR1 \/ SKIR2.*\n/m, '').replace(/^\/\/ 2026-11-12 \(SKIR3\): admin adds.*\n/m, '');
src = src.replace(/^const UI47_ADMIN_ADD = /m, () => '// 2026-11-12 (SKIR3): admin adds cut to the owner\'s 11-12 picks under each map\'s NEW! / Carried limits; only those with room stay (docs/balance/skir3/lists-2026-11-12.json).\nconst UI47_ADMIN_ADD = ');
fs.writeFileSync(APP + '.skir3tmp', src); fs.renameSync(APP + '.skir3tmp', APP);
// unattainable flags (SKIR1's rule) and the obtain maps, read after the lists change (a fresh process loads the new files)
const out = cp.execFileSync(process.execPath, ['-e', `
  const LMP = require('./tools/lib_map_pools.js'), LB = require('./tools/lib_bramble.js'), BD = LB.CARD_DEFS_BASELINE, G = LB.G, fs = require('fs');
  const cards = JSON.parse(fs.readFileSync('canonical/cards.json', 'utf8')), listed = new Set();
  Object.values(JSON.parse(fs.readFileSync('canonical/map-pools.json', 'utf8')).maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id => listed.add(id)));
  const clear = cards.filter(c => c.unattainable && c.source && c.source.kind && !c.awaitingSource && !(c.source.kind === 'pack' && ![11, 99].includes(+c.source.tier) && !(c.source.map && listed.has(c.id))) && BD[c.id] && !LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  const set = cards.filter(c => !c.unattainable && !c.pool && !c.token && !c.test && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && BD[c.id] && LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  const out = cards.filter(c => BD[c.id] && LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  console.log(JSON.stringify({ clear, set, out }));`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const fl = JSON.parse(out.trim().split('\n').pop());
fl.clear.forEach(id => { delete C[id].unattainable; }); fl.set.forEach(id => { C[id].unattainable = true; });
let cactusPlaced = false; if (CACTUS && C[CACTUS.id] && C[CACTUS.id].awaitingSource && listed.has(CACTUS.id)) { delete C[CACTUS.id].awaitingSource; cactusPlaced = true; }
if (fl.clear.length || fl.set.length || cactusPlaced) fs.writeFileSync(path.join(ROOT, 'canonical', 'cards.json'), JSON.stringify(CARDS, null, 2).replace(/[\u0080-￿]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const obt0 = J('canonical/card-obtain-maps.json').maps;
cp.execFileSync(process.execPath, ['tools/forge_curve_2026_10_19.js', 'maps'], { cwd: ROOT, stdio: 'ignore' });
const obt1 = J('canonical/card-obtain-maps.json').maps;
if (!rec.flags) rec.flags = { cleared: fl.clear, set: fl.set };
// out of play: was in play when SKIR3 began (a re-run keeps the first run's view) and is out now
const prev = fs.existsSync(RECF) ? J('docs/balance/skir3/lists-2026-11-12.json') : null;
rec.flags = prev && prev.flags ? { cleared: [...new Set(prev.flags.cleared.concat(fl.clear))].filter(id => !C[id].unattainable), set: [...new Set(prev.flags.set.concat(fl.set))].filter(id => C[id].unattainable) } : rec.flags;
rec.leftPlay = rec.flags.set.map(id => ({ id, name: nm(id) }));
rec.obtainMaps = prev && prev.obtainMaps ? prev.obtainMaps : [...new Set(Object.keys(obt0).concat(Object.keys(obt1)))].filter(id => obt0[id] !== obt1[id]).map(id => ({ id, before: obt0[id] == null ? null : obt0[id], after: obt1[id] == null ? null : obt1[id] }));
fs.mkdirSync(path.dirname(RECF), { recursive: true }); fs.writeFileSync(RECF, JSON.stringify(rec, null, 1) + '\n');
console.log('flags cleared:', rec.flags.cleared.join(' ') || '-', '| set (left play):', rec.flags.set.join(' ') || '-');
console.log('-> map-pools.json, arena_app.js UI47_ADMIN_ADD, cards.json flags, card-obtain-maps.json, ' + path.relative(ROOT, RECF));
