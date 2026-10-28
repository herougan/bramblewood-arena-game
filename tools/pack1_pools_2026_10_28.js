#!/usr/bin/env node
// 2026-10-28 (package PACK1; owner 10-28 22:47: "For now, remove all cards from the packs. We'll be more deliberate of our choices. In the end,
// I do plan to add some cards into packs that do not appear in any skirmish."). Reports what the derived pack pools (arena_app.js packIndex /
// basicPackTierOf: the basic-pack cards on each pack's maps' lists + canonical/pack-extras.json) do against the old pools (source.tier, which
// cards.json still carries but the game no longer reads for basic packs):
//   - per pack, the pool size before -> after, by rarity, and whether a pack can still be filled without a repeat;
//   - the cards now in no pack (not obtainable yet), the cards whose pack changed;
//   - the budget impact: each card whose obtain map (cardObtainMap -> canonical/card-obtain-maps.json) changed, and whether its budget
//     (tools/skill_costs.js, as the hub prices it) goes from inside to over.
//   node tools/pack1_pools_2026_10_28.js [--json docs/balance/pack1-pools-2026-10-28.json]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const defs = B.CARD_DEFS_BASELINE;
const PACKS = {1: 'Hedgerow Pouch', 2: 'Tidemire Chest', 3: 'Highcrest Case', 4: 'Later packs (Maps 21-27, no pack sells them yet)'};
const SIZE = {1: 3, 2: 3, 3: 3, 4: 3}; // every pack gives 3 cards (RES3); the Collector pack 5
// the game's packCardPool filters (no token, test, Easter egg, shelved spell or equipment)
const live = d=> d && !d.token && !d.test && !d.easterEgg && d.cardType !== 'spell' && d.cardType !== 'equipment' && !(d.source && d.source.kind === 'easteregg');
const oldTier = d=>{ const s = d.source; if(!s || s.kind !== 'pack') return 0; const t = parseInt(s.tier, 10) || 1; return t >= 1 && t <= 10 ? t : 0; };
// the obtain map as the game had it before PACK1 (source.map and source.tier)
function oldObtainMap(d){
  const s = G.cardSourceOf(d); if(!(s.kind === 'pack' && oldTier(d))) return G.cardObtainMap(d);
  const at = s.map ? G.mapUnlockNumberOf(s.map) : null, tierAt = G.PACK_TIER_FROM_MAP ? G.PACK_TIER_FROM_MAP[oldTier(d)] : ({1: 0, 2: 7, 3: 14})[oldTier(d)];
  const first = [at, tierAt].filter(v=> v != null); return Math.max(first.length ? Math.min(...first) : G.OBTAIN_MAP_OF.pack, G.rarityIntroMap(d.rarity));
}
const ids = Object.keys(defs).filter(id=> live(defs[id]));
const out = {packs: {}, notObtainable: [], moved: [], budget: {changed: [], newlyOver: [], nowInside: []}};
for(const t of [1, 2, 3, 4]){
  const before = ids.filter(id=> oldTier(defs[id]) === t), after = ids.filter(id=> G.basicPackTierOf(defs[id]) === t);
  const byR = l=> l.reduce((m, id)=>{ const r = defs[id].rarity || 'common'; m[r] = (m[r] || 0) + 1; return m; }, {});
  out.packs[t] = {name: PACKS[t], maps: G.packMapRange(t), before: before.length, after: after.length, rarityBefore: byR(before), rarityAfter: byR(after),
    noRepeat: after.length >= SIZE[t], collectorNoRepeat: after.length >= 5};
}
ids.forEach(id=>{ const d = defs[id], o = oldTier(d), n = G.basicPackTierOf(d);
  if(o && !n) out.notObtainable.push({id, name: d.name, rarity: d.rarity || 'common', wasPack: o, map: (d.source || {}).map || null});
  else if(o && n !== o) out.moved.push({id, from: o, to: n, firstList: (G.cardFirstMapList(d) || {}).loc}); });
// budget: every card, the obtain map before / after, and the budget verdict at its start level
cards.filter(c=> !c.pool && SC.measured(c)).forEach(c=>{
  const d = defs[c.id]; if(!d) return; const was = oldObtainMap(d), now = G.cardObtainMap(d); if(was === now) return;
  const b0 = T.budget(Object.assign({}, c, {obtainMap: was})), b1 = T.budget(Object.assign({}, c, {obtainMap: now}));
  const row = {id: c.id, rarity: c.rarity || 'common', mapBefore: was, mapAfter: now, okBefore: b0.ok, okAfter: b1.ok, N: [b0.N, b1.N], x1: b1.x1, x2: b1.x2, N2: b1.N2, inPack: G.basicPackTierOf(d)};
  out.budget.changed.push(row); if(b0.ok && !b1.ok) out.budget.newlyOver.push(row); if(!b0.ok && b1.ok) out.budget.nowInside.push(row); });
console.log('Pack pools (before = source.tier, after = the map lists + pack extras):');
for(const t of [1, 2, 3, 4]){ const p = out.packs[t]; console.log(`  Pack ${t} ${p.name}, Maps ${p.maps[0]}-${p.maps[1]}: ${p.before} -> ${p.after}  ${JSON.stringify(p.rarityAfter)}${p.noRepeat ? '' : '  (too small for a 3-card pack without a repeat)'}`); }
console.log(`Not obtainable now (a basic-pack card in no map list): ${out.notObtainable.length}`, out.notObtainable.slice(0, 12).map(x=> x.id).join(', '));
console.log(`Moved to another pack (by their first map list): ${out.moved.length}`, out.moved.map(x=> `${x.id} ${x.from}->${x.to}@${x.firstList}`).join(', '));
console.log(`Obtain map changed: ${out.budget.changed.length}; newly over budget: ${out.budget.newlyOver.length}`, out.budget.newlyOver.map(x=> `${x.id} (Map ${x.mapBefore}->${x.mapAfter}${x.inPack ? '' : ', in no pack'})`).join(', '));
console.log(`Now inside budget: ${out.budget.nowInside.length}`, out.budget.nowInside.map(x=> x.id).join(', '));
const ji = process.argv.indexOf('--json');
if(ji > 0){ const f = path.join(ROOT, process.argv[ji + 1]); fs.writeFileSync(f, JSON.stringify(out, null, 1) + '\n'); console.log('wrote', path.relative(ROOT, f)); }
