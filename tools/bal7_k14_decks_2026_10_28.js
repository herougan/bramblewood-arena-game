#!/usr/bin/env node
// Package BAL7 (2026-10-28, owner K14 10-27 11:22: "Map-unique cards - limit non map-unique cards to max 1 copy (per), 6 cards max total - after
// rebalancing cards with the myriad test."): in every map's skirmish (road) decks, a card that is not unique to the map has at most 1 copy,
// and those cards hold at most 6 copies in all. Map-unique = the map's own pack cards (source pack, map = this map), its reward cards
// (source map = this map) and its showcase cards (a fight's `showcase`). A side map's are its own and its parent's (its pool is the parent's
// MAP tier plus its own list).
// An enemy-only card (no source, not a starter card) that only this map's fights play counts as the map's own too.
// The rule change only (owner: "no retune yet"): each copy taken out goes to a map-unique card by theme:
//   1. the deck's own map-unique cards that share a type (archetype / species) with the card taken out, then any of the deck's map-unique
//      cards, up to their copy cap (min(4, the rarity's cap)) and the deck's rank caps; the closest stat score (skirmishCardScore) first,
//      so the fight's strength moves as little as it can;
//   2. if the deck's own cards are full: a map-unique card new to the deck (same order; within the road's rarity cap for the fight, not
//      Epic or rarer, not another fight's reward, not off the map's theme).
// Kept: the fight's leaders (skirmishLeadersOf), its first-clear cards (nodeFirstClearCardIds) and its deck size. A kept card that is not
// map-unique still drops to 1 copy (the rule) unless it is the fight's leader.
// Covered: every main and side map's fights with a deck (skirmish, elite, boss, mini-boss), as skirmish_pass.js lists them; not the tutorial,
// the endless dungeons, raids or the Babel Spire.
//   node tools/bal7_k14_decks_2026_10_28.js plan    -> docs/balance/bal7-k14-plan-2026-10-28.json (every fight: before, after, the swaps)
//   node tools/bal7_k14_decks_2026_10_28.js apply   writes the decks into arena_app.js (rebuild after)
//   node tools/bal7_k14_decks_2026_10_28.js check   lists fights that break the rule (exit 1 if any)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js'), G = B.G, D = B.CARD_DEFS_BASELINE;
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
let TH = null; try{ TH = require('./thematic_pass_2026_10_19.js'); }catch(e){}
const APP = path.join(ROOT, 'arena_app.js');
const OUT = path.join(ROOT, 'docs', 'balance', 'bal7-k14-plan-2026-10-28.json');
const CMD = process.argv[2] || 'plan';
const MAX_COPY = 1, MAX_TOTAL = 6;
const MAPS = G.CONQUEST_MAPS;
const RARE_UP = new Set(['epic','heroic','unique','questunique','legendary','mythic','ancient','devlegendary','devancient','eventlegendary']);
const typesOf = id=> [...((D[id]||{}).archetypes||[]), ...((D[id]||{}).species||[])].filter(t=> !['Structure','Leader'].includes(t));
const power = id=> G.skirmishCardScore(D[id] || {});
const cap = id=> G.maxCopiesForRarity((D[id]||{}).rarity); // the game's copy cap (road decks hold 5 Commons)
const size = d=> Object.values(d).reduce((a, b)=> a + b, 0);

// Not covered (owner call BAL7-2): Map 0 (Bramblewood Outskirts: a new player's first fights, built from the starter cards, aiming at 90%)
// and the tutorial's come-back fights (T-2, T-3, T-4: mixed decks that test what the tutorial taught).
const EXEMPT = (m, n)=> m.id === 'm1' || /^T-/.test(n.key || '');
// the fights (skirmish_pass.js fights(), without the endless floors)
function fights(){
  const out = [];
  for(const m of MAPS){
    if(m.reserved || m.tower || m.endless) continue;
    const no = G.mapNumberOf(m.id); if(no == null) continue;
    m.nodes.forEach((n, i)=>{ if(!n.deck || !Object.keys(n.deck).length) return; const k = n.kind || 'skirmish'; if(k === 'tutorial' || /raidboss|megaraid/.test(k)) return;
      if(EXEMPT(m, n)) return;
      out.push({map: m.id, mapNo: no, side: !!m.sub, key: n.key, kind: k, name: n.name || n.key, m, n}); });
  }
  return out;
}
const uniqCache = {};
function uniqueOf(mapId){
  if(uniqCache[mapId]) return uniqCache[mapId];
  const m = MAPS.find(x=> x.id === mapId), set = new Set();
  // a side map: its own cards and its parent's (a side map's pool is its parent's MAP tier + its own list, canonical/map-pools.json)
  if(m.sub && m.parent){ const own = uniqueOf(m.parent); own.forEach(id=> set.add(id)); }
  Object.values(D).forEach(c=>{ const s = c && c.source; if(!s || c.token || c.test) return;
    if(s.kind === 'pack' && s.map === mapId) set.add(c.id);
    if(s.kind === 'map' && s.id === mapId) set.add(c.id); });
  (m.nodes || []).forEach(n=>{ if(n.showcase && D[n.showcase]) set.add(n.showcase); });
  // an enemy-only card (no source: no player can own it) is unique to the map when only this map's fights play it
  const used = {}; MAPS.filter(x=> !x.reserved && !x.tower).forEach(x=> (x.nodes || []).forEach(n=> Object.keys(n.deck || {}).forEach(id=> (used[id] = used[id] || new Set()).add(x.id))));
  Object.entries(used).forEach(([id, ms])=>{ const c = D[id]; if(!c || c.token || c.test || (c.source && c.source.kind) || c.rarity === 'starter') return; if([...ms].every(x=> x === mapId || (m.sub && x === m.parent))) set.add(id); });
  return (uniqCache[mapId] = set);
}
const leadersOf = f=>{ try{ return new Set(G.skirmishLeadersOf(f.n, f.map) || []); }catch(e){ return new Set(); } };
const firstOf = f=>{ try{ return new Set((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(f.map, f.key) || []); }catch(e){ return new Set(); } };
const otherReward = (f, id)=>{ const s = (D[id] || {}).source; return !!(s && s.kind === 'map' && s.node && !(s.id === f.map && s.node === f.key)); };
const rankOk = (deck, id)=>{ try{ return !BB.deckRankBlock(deck, id, D, []); }catch(e){ return true; } };
function violations(f, deck){
  const U = uniqueOf(f.map), L = leadersOf(f), out = [];
  let tot = 0;
  Object.entries(deck).forEach(([id, k])=>{ if(U.has(id) || L.has(id)) return; tot += k; if(k > MAX_COPY) out.push(`${id} x${k}`); });
  if(tot > MAX_TOTAL) out.push(`${tot} non-unique copies`);
  return out;
}
function fix(f){
  const deck0 = Object.assign({}, f.n.deck), deck = Object.assign({}, deck0), U = uniqueOf(f.map), L = leadersOf(f), F = firstOf(f);
  const swaps = [], freed = []; // freed: one entry a copy taken out, with the card it came from
  const nonU = id=> !U.has(id) && !L.has(id);
  // 1. every non-unique card down to 1 copy
  Object.keys(deck).filter(nonU).forEach(id=>{ while(deck[id] > MAX_COPY){ deck[id]--; freed.push(id); } });
  // 2. then non-unique singles out until 6 copies in all: the weakest-themed first (sharing no type with the map's unique cards), then the
  //    least like the deck (lowest stat score); first-clear cards stay as long as any other card can go
  const mapTypes = new Set([...U].flatMap(typesOf));
  const rankOut = id=> [F.has(id) ? 1 : 0, typesOf(id).some(t=> mapTypes.has(t)) ? 1 : 0, power(id)];
  let tot = Object.keys(deck).filter(nonU).reduce((a, id)=> a + deck[id], 0);
  const outs = Object.keys(deck).filter(nonU).sort((a, b)=>{ const x = rankOut(a), y = rankOut(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2] || (a < b ? -1 : 1); });
  for(const id of outs){ if(tot <= MAX_TOTAL) break; if(F.has(id) && outs.filter(x=> !F.has(x) && deck[x]).length) continue; deck[id]--; freed.push(id); tot--; if(!deck[id]) delete deck[id]; }
  // 3. each freed copy to a map-unique card by theme
  const okIn = id=> D[id] && !D[id].token && !RARE_UP.has(D[id].rarity) && G.roadRarityOk(D[id].rarity, f.mapNo, f.kind) && !otherReward(f, id) && !(TH && TH.offThemeFor && TH.offThemeFor(f.map, f.n, id));
  const pick = out=>{
    const ty = new Set(typesOf(out)), p0 = power(out);
    const score = id=> [typesOf(id).some(t=> ty.has(t)) ? 0 : 1, Math.abs(power(id) - p0), id];
    const by = (a, b)=>{ const x = score(a), y = score(b); return x[0] - y[0] || x[1] - y[1] || (x[2] < y[2] ? -1 : 1); };
    const own = Object.keys(deck).filter(id=> U.has(id) && (deck[id] || 0) < cap(id) && rankOk(deck, id)).sort(by);
    if(own.length) return own[0];
    const fresh = [...U].filter(id=> !deck[id] && okIn(id) && rankOk(deck, id)).sort(by);
    return fresh[0] || null;
  };
  const stuck = [];
  for(const out of freed){ const inn = pick(out); if(!inn){ stuck.push(out); continue; } deck[inn] = (deck[inn] || 0) + 1; swaps.push({out, inn}); }
  // a copy with nowhere to go goes back (the fight is reported as not fixable)
  stuck.forEach(id=>{ deck[id] = (deck[id] || 0) + 1; });
  return {deck, swaps, stuck, before: deck0};
}
function run(){
  const rows = [];
  for(const f of fights()){
    const v0 = violations(f, f.n.deck); if(!v0.length){ rows.push({map: f.map, mapNo: f.mapNo, key: f.key, name: f.name, kind: f.kind, changed: false}); continue; }
    const r = fix(f), v1 = violations(f, r.deck);
    if(size(r.deck) !== size(r.before)) throw new Error('size changed ' + f.key);
    const agg = {}; r.swaps.forEach(s=>{ const k = s.out + ' -> ' + s.inn; agg[k] = (agg[k] || 0) + 1; });
    rows.push({map: f.map, mapNo: f.mapNo, key: f.key, name: f.name, kind: f.kind, changed: true, unique: [...uniqueOf(f.map)].length, before: r.before, after: r.deck,
      violationsBefore: v0, violationsAfter: v1, swaps: Object.entries(agg).map(([k, n])=> k + (n > 1 ? ' x' + n : '')), copiesMoved: r.swaps.length, stuck: r.stuck,
      distinct: [Object.keys(r.before).length, Object.keys(r.deck).length]});
  }
  return rows;
}
if(require.main !== module){ /* a library */ } else if(CMD === 'plan' || CMD === 'apply'){
  const rows = run(), ch = rows.filter(r=> r.changed), bad = ch.filter(r=> r.violationsAfter.length);
  console.log(`${rows.length} fights, ${ch.length} change (${ch.reduce((a, r)=> a + r.copiesMoved, 0)} copies moved), ${bad.length} still break the rule`);
  ch.forEach(r=> console.log(`  ${r.key.padEnd(8)} ${r.name.slice(0, 24).padEnd(24)} moved ${String(r.copiesMoved).padStart(2)}  ${r.swaps.join(', ')}${r.violationsAfter.length ? '  STILL: ' + r.violationsAfter.join(', ') : ''}`));
  if(!ch.length && fs.existsSync(OUT)) console.log('nothing to change: the decks already follow K14 (the plan file is kept)'); else fs.writeFileSync(OUT, JSON.stringify({_about: 'Package BAL7 (2026-10-28, owner K14): skirmish decks, non-map-unique cards at most 1 copy each and 6 in all; node tools/bal7_k14_decks_2026_10_28.js plan|apply|check', summary: {fights: rows.length, changed: ch.length, copiesMoved: ch.reduce((a, r)=> a + r.copiesMoved, 0), stillBreaking: bad.map(r=> r.key)}, rows}, null, 1) + '\n');
  if(CMD === 'apply'){
    let s = fs.readFileSync(APP, 'utf8'), n = 0;
    for(const r of ch){ if(r.violationsAfter.length && r.copiesMoved === 0) continue;
      const re = new RegExp(`(\\{ ?key:\\s*['"]${r.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`); const mm = s.match(re); if(!mm){ console.log('not found', r.key); continue; }
      const line = mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(r.after) + ` /* 2026-10-28 (BAL7, owner K14): non-map-unique cards at most 1 copy each, 6 in all; ${r.copiesMoved} copies to the map's own cards by theme (size, leaders and first-clear cards kept) */`);
      s = s.replace(mm[1], line); n++; }
    fs.writeFileSync(APP, s); console.log('applied', n, 'decks to arena_app.js');
  }
} else if(CMD === 'check'){
  const bad = fights().map(f=> [f, violations(f, f.n.deck)]).filter(([, v])=> v.length);
  bad.forEach(([f, v])=> console.log(f.key, v.join(', '))); console.log(bad.length + ' fights break K14'); process.exit(bad.length ? 1 : 0);
}
module.exports = {uniqueOf, violations, fights};
