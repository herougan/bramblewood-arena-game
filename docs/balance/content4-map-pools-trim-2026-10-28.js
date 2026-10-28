#!/usr/bin/env node
// CONTENT4 L7 (2026-10-28, owner 10-28 09:48: "Limit the number of cards in a map. (At the later game, maybe ~4-5 old cards, ~4-7 new
// cards?"): the PROPOSED cap of each map's card pool (canonical/map-pools.json). Not applied: see docs/balance/content4-2026-10-28.md and the
// owner call CONTENT4-1 in docs/decisions.json.
//   node docs/balance/content4-map-pools-trim-2026-10-28.js [--keep-pro]   -> docs/balance/content4-map-pools-plan-2026-10-28[-keeppro].json
//   python3 docs/balance/content4-map-pools-apply-2026-10-28.py <plan.json>  applies a plan (pools + sources), then
//   node tools/forge_curve_2026_10_19.js maps  regenerates canonical/card-obtain-maps.json.
// Rules (the coordinator's brief for L7):
//   - every main map's MAP tier and every side map's own list, in road order (a side map at the number it opens on); the endless dungeons
//     (the Undercroft, Murgle Mayhem, the Long Burrow) and the tutorial keep their lists;
//   - "new" = the first list on the road that still holds the card (after the earlier trims) and not Base; the rest are "old" (carried);
//   - caps: new 7 everywhere, old 3 before Map 10 and 5 from Map 10;
//   - kept first: the map's skirmish rewards, its first-clear pack cards (SKIRMISH_FIRST_PACK_CARDS), its showcases, non-pack sources,
//     leaders (with --keep-pro also the cards of that map's PRO / BPRO decks); then the cards its own fights play most; then lower rarity;
//   - an old card is kept only if a fight of the map plays it; from Map 10 a list with fewer than 4 old cards takes the earlier cards its
//     fights already play (2+ fights);
//   - a pack card whose source map no longer lists it moves to the first later list that still does (tier by that map), else it waits for a
//     source (awaitingSource). Skirmish decks are not touched.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const KEEP_PRO = process.argv.includes('--keep-pro');
const OUT = path.join(ROOT, 'docs', 'balance', 'content4-map-pools-plan-2026-10-28' + (KEEP_PRO ? '-keeppro' : '') + '.json');
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = Object.fromEntries(cards.map(c=> [c.id, c]));
const PRO = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8')).maps;
const SFP = new Function(B.grab('SKIRMISH_FIRST_PACK_CARDS') + '; return SKIRMISH_FIRST_PACK_CARDS;')();
const MAPS = G.CONQUEST_MAPS, mapById = id=> MAPS.find(m=> m.id === id);
const STEP = r=> G.roadRarityStep(r || 'common');
const SKIP_SUB = new Set(['muc', 'mm', 'mlb', 'mtut']);
const caps = no=> no < 10 ? [7, 3] : [7, 5];
const isBase = c=> !c || !c.source || !c.source.kind || c.source.kind === 'base';
const proIds = key=>{ const e = PRO[key]; if(!e || !KEEP_PRO) return new Set(); return new Set([...(e.pro || []), ...(e.bpro || [])].flatMap(x=> Object.keys(x.deck || {}))); };
const lists = [];
Object.entries(pools).forEach(([mid, P])=>{ lists.push({key: mid, map: mid, sub: null, no: G.mapNumberOf(mid), ids: P.cards});
  Object.entries(P.submaps || {}).forEach(([sid, a])=> lists.push({key: sid, map: mid, sub: sid, no: G.mapUnlockNumberOf(sid), ids: a})); });
lists.sort((a, b)=> a.no - b.no || (a.sub ? 1 : 0) - (b.sub ? 1 : 0));
const fightsOf = id=>{ const m = mapById(id); return m ? m.nodes.filter(n=> n.deck) : []; };
const report = {about: 'CONTENT4 L7 proposal (2026-10-28), not applied: docs/balance/content4-map-pools-trim-2026-10-28.js' + (KEEP_PRO ? ' --keep-pro' : ''), lists: {}, moves: [], awaiting: [], added: []};
const keep = {}, keptBefore = new Set();
let lastNo = -1, pending = [];
for(const L of lists){
  if(L.no !== lastNo){ pending.forEach(id=> keptBefore.add(id)); pending = []; lastNo = L.no; }
  trimList(L);
  if(!(L.sub && SKIP_SUB.has(L.sub))) keep[L.key].forEach(id=> pending.push(id));
}
function trimList(L){
  if(L.sub && SKIP_SUB.has(L.sub)){ keep[L.key] = L.ids.slice(); report.lists[L.key] = {no: L.no, map: L.map, sub: L.sub, skipped: true, before: L.ids.length, after: L.ids.length}; return; }
  const m = mapById(L.sub || L.map), nodes = fightsOf(L.sub || L.map);
  const show = new Set(nodes.map(n=> n.showcase).filter(Boolean));
  const fp = new Set(Object.entries(SFP).filter(([k])=> k.split(':')[0] === (L.sub || L.map)).map(([, v])=> v));
  const use = id=> nodes.filter(n=> n.deck[id]).length, proSet = proIds(L.key);
  const row = id=>{ const c = by[id], s = (c && c.source) || {};
    const isNew = !isBase(c) && !keptBefore.has(id) && !(L.sub && (keep[L.map] || pools[L.map].cards).includes(id));
    const why = [s.kind === 'map' && s.id === (L.sub || L.map) ? 'reward' : '', fp.has(id) ? 'first-clear pack' : '', show.has(id) ? 'showcase' : '', proSet.has(id) ? 'PRO deck' : '',
      s.kind && !['pack', 'map', 'base'].includes(s.kind) ? s.kind : '', c && c.leader ? 'leader' : ''].filter(Boolean);
    return {id, isNew, prot: why.length > 0, use: use(id), step: STEP(c && c.rarity), why}; };
  const rows = L.ids.map(row), [capN, capO] = caps(L.no);
  const rank = (a, b)=> (b.prot - a.prot) || (b.use - a.use) || (a.step - b.step);
  const nw = rows.filter(r=> r.isNew).sort(rank), old = rows.filter(r=> !r.isNew).sort(rank);
  const keepN = nw.filter((r, i)=> r.prot || i < capN).slice(0, Math.max(capN, nw.filter(r=> r.prot).length));
  const keepO = old.filter((r, i)=> r.prot || (r.use > 0 && i < capO)).slice(0, Math.max(capO, old.filter(r=> r.prot).length));
  const kept = new Set([...keepN, ...keepO].map(r=> r.id)), after = L.ids.filter(id=> kept.has(id)), added = [];
  if(L.no >= 10 && keepO.length < 4){
    const inParent = id=> L.sub && (keep[L.map] || []).includes(id);
    const cand = [...new Set(nodes.flatMap(n=> Object.keys(n.deck)))].filter(id=> keptBefore.has(id) && !after.includes(id) && !inParent(id) && use(id) >= 2 && by[id] && !isBase(by[id]))
      .sort((a, b)=> use(b) - use(a) || STEP(by[a].rarity) - STEP(by[b].rarity));
    for(const id of cand){ if(keepO.length + added.length >= 4) break; added.push(id); }
    added.forEach(id=>{ after.push(id); report.added.push({list: L.key, id, fights: use(id)}); });
  }
  keep[L.key] = after;
  report.lists[L.key] = {no: L.no, map: L.map, sub: L.sub, name: m && m.name, before: L.ids.length, beforeNew: nw.length, beforeOld: old.length,
    after: after.length, afterNew: keepN.length, afterOld: keepO.length + added.length,
    keptNew: keepN.map(r=> r.id + (r.why.length ? ' (' + r.why.join(', ') + ')' : '')), keptOld: keepO.map(r=> r.id), addedOld: added,
    trimmedNew: nw.filter(r=> !kept.has(r.id)).map(r=> r.id), trimmedOld: old.filter(r=> !kept.has(r.id)).map(r=> r.id), keep: after};
}
const newPools = JSON.parse(JSON.stringify(pools));
Object.entries(newPools).forEach(([mid, P])=>{ P.cards = keep[mid]; Object.keys(P.submaps || {}).forEach(sid=> P.submaps[sid] = keep[sid]); });
const live = L=> !(L.sub && SKIP_SUB.has(L.sub));
const holders = id=> lists.filter(live).filter(L=> keep[L.key].includes(id) || (!L.sub && (newPools[L.map].special || []).includes(id))).sort((a, b)=> a.no - b.no);
const PACK_TIER = no=> no <= 6 ? 1 : no <= 13 ? 2 : no <= 20 ? 3 : no <= 27 ? 4 : no <= 34 ? 5 : 6;
cards.forEach(c=>{ const s = c.source; if(!s || s.kind !== 'pack' || !s.map) return;
  const L0 = lists.find(L=> L.key === s.map); if(!L0 || !L0.ids.includes(c.id)) return;
  if(keep[s.map].includes(c.id) || (!L0.sub && (newPools[s.map].special || []).includes(c.id))) return;
  const h = holders(c.id).filter(L=> L.no >= L0.no);
  if(h.length){ const to = h[0], tier = to.no === L0.no || s.tier === 11 || s.tier === 99 ? s.tier : Math.max(s.tier, PACK_TIER(to.no));
    report.moves.push({id: c.id, from: s, to: {kind: 'pack', tier, map: to.key}}); }
  else report.awaiting.push({id: c.id, name: c.name, rarity: c.rarity, from: s, mapNo: L0.no}); });
report.summary = {lists: Object.keys(report.lists).length, cardsBefore: lists.reduce((a, L)=> a + L.ids.length, 0), cardsAfter: Object.values(keep).reduce((a, x)=> a + x.length, 0), moves: report.moves.length, awaiting: report.awaiting.length};
fs.writeFileSync(OUT, JSON.stringify(report, null, 1) + '\n');
Object.entries(report.lists).sort((a, b)=> a[1].no - b[1].no).forEach(([k, r])=> console.log(`${k.padEnd(4)} ${String(r.no).padStart(2)} ${(r.name || '').padEnd(26)} ${r.skipped ? 'kept (endless / tutorial)' : `${r.before} (${r.beforeNew} new / ${r.beforeOld} old) -> ${r.after} (${r.afterNew} / ${r.afterOld})`}`));
console.log(JSON.stringify(report.summary), '->', path.relative(ROOT, OUT));
