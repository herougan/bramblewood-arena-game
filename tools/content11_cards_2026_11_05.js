#!/usr/bin/env node
// CONTENT11 (2026-11-05, owner 11-04 22:34: NUDI-1 "Just design it, add it, art it", IDEA-VREGIA "Your design"; EFFECTS-1 "Stronger effects >
// stronger stats"): two new creature cards, each placed on one fitting submap list.
//   Nudibranch   The Sunken Depths (mj, Map 10's side map; the game counts its pack cards
//                from Map 7: canonical/card-obtain-maps.json, the budget's map term): Sequestration + Immunity. A real nudibranch eats
//                stinging animals and keeps their stings (kleptocnidae), and their poison does not touch it.
//   Victoria Regia  Lilypad Reach (mp, Map 2's side map; as an Uncommon its pack card counts from Map 1): Bulldoze 1 + Thorns 1. Its unfurling leaf shoves aside
//                what stands in front of it (Bulldoze: a Ready unit it hits waits 1 more round), then the pad is spiky (Thorns).
// Each card gets the largest line on its Attack:Health shape inside both caps at Level 1 with its list's map term and its rarity
// (tools/skill_costs.js budget, as tools/content7_cards_2026_11_02.js). Art: the emoji placeholder; prompts in docs/art-style-prompts.md.
//   node tools/content11_cards_2026_11_05.js          dry run        ... apply     (idempotent: skips ids that exist)
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json'), REVIEW = path.join(ROOT, 'canonical', 'map-review.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
function uuid5(name){ const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80; const x = h.slice(0, 16).toString('hex'); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; }
const NEW = [
  {id:'nudibranch', name:'Nudibranch', icon:'🐌', cost:1, wait:1, shape:[3, 8], rarity:'uncommon', species:['Mollusc'], animal:'nudibranch', archetypes:['Ocean', 'Coral Reef'],
   effects:{sequestration:true, immunity:true}, parent:'m7', sub:'mj', mapN:7, tier:2, decision:'NUDI-1',
   flavor:'It grazes on things that sting and keeps the stings for itself. The bright colours are a promise.',
   why:'Reef & ocean card; a sea slug on the wreck (CONTENT11, NUDI-1: Claude new card)'},
  {id:'victoria-regia', name:'Victoria Regia', icon:'🪷', cost:1, wait:2, shape:[2, 13], rarity:'uncommon', species:['Plant'], animal:'giant water lily', subtype:'plant', archetypes:['Flora', 'Pond'],
   effects:{bulldoze:1, thorns:1}, parent:'mb', sub:'mp', mapN:1, tier:1, decision:'IDEA-VREGIA',
   flavor:'Its new leaf comes up folded like a fist and shoves the old ones aside. Then it opens, and the underside is all thorns.',
   why:'River & pond card; the giant lily of the Reach (CONTENT11, IDEA-VREGIA: Claude new card)'},
];
const lineOk = (c, A, H)=>{ const b = T.budget(Object.assign({}, c, {attack:A, health:H}), {level:1}); return b.ok && b.x1 <= b.N ? b : null; };
let nid = Math.max(...cards.map(c=> c.numericId || 0)) + 1; const out = [], report = [];
for(const s of NEW){
  if(cards.find(c=> c.id === s.id)){ console.log('exists: ' + s.id); continue; }
  const base = {id:s.id, name:s.name, icon:s.icon, cost:s.cost, wait:s.wait, attack:s.shape[0], health:s.shape[1], rarity:s.rarity, locked:true, test:false, archetypes:s.archetypes.slice(), species:s.species.slice(), animal:s.animal};
  if(s.subtype) base.subtype = s.subtype;
  Object.assign(base, {dmgType:'physical', resist:[], tags:[], effects:s.effects, flavor:s.flavor});
  base.source = {kind:'pack', tier:s.tier, map:s.sub}; // a basic-pack card of its list (the pack and the map come from the lists: arena_app.js basicPackTierOf)
  const fit = Object.assign({}, base, {obtainMap:s.mapN});
  let best = null; for(let k = 0.2; k <= 4; k += 0.01){ const A = Math.max(1, Math.round(s.shape[0] * k)), H = Math.max(1, Math.round(s.shape[1] * k)), b = lineOk(fit, A, H);
    if(b && (!best || b.x1 > best.b.x1 || (b.x1 === best.b.x1 && Math.abs(A / H - s.shape[0] / s.shape[1]) < Math.abs(best.A / best.H - s.shape[0] / s.shape[1])))) best = {A, H, b}; }
  if(!best){ console.log('no legal line: ' + s.id); continue; }
  base.attack = best.A; base.health = best.H; base.numericId = nid++; base.uuid = uuid5('bramblewood-card:' + s.id);
  base.creatorNote = `2026-11-05 (package CONTENT11, ${s.decision}): placed on the ${s.sub} list (side map of ${s.parent}; its pack cards count from Map ${s.mapN}, canonical/card-obtain-maps.json). Priced with the budget (tools/skill_costs.js budget, Level 1, rarity ${s.rarity}, map term Map ${s.mapN}): S ${best.b.S}, N ${best.b.N}, x1 ${best.b.x1}: ${best.A}/${best.H}. Skills from existing keywords only. Art: placeholder (the emoji); prompt in docs/art-style-prompts.md (CONTENT11).`;
  out.push({card: base, s}); report.push(`${s.id.padEnd(15)} ${s.rarity.padEnd(9)} ${best.A}/${best.H} cost ${s.cost} wait ${s.wait}  S ${best.b.S}  x1 ${best.b.x1} / N ${best.b.N}  ${Object.keys(s.effects).join('+')}  -> ${s.sub} (Map ${s.mapN})`);
}
console.log(report.join('\n'));
const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
if(process.argv.includes('apply') && out.length){
  cards.push(...out.map(o=> o.card)); fs.writeFileSync(CARDS, pyDump(cards));
  // the lists: one submap list each (canonical/map-pools.json) and its review row (canonical/map-review.json, the Map cards window's reason)
  // map-pools.json keeps its one-line lists, so the id is added in the text (the submap's "<sub>": [...] line), not by a re-dump
  let ptxt = fs.readFileSync(POOLS, 'utf8'); const review = JSON.parse(fs.readFileSync(REVIEW, 'utf8'));
  out.forEach(({s})=>{ const re = new RegExp(`("${s.sub}": \\[[^\\]]*)\\]`); if(!re.test(ptxt)) throw new Error('no list line for ' + s.sub);
    ptxt = ptxt.replace(re, (m, a)=> `${a}, "${s.id}"]`);
    const r = review.maps[s.sub]; if(r && !(r.chosen || []).some(x=> x.id === s.id)) r.chosen.push({id:s.id, why:s.why, by:'claude'}); });
  const pools = JSON.parse(ptxt); out.forEach(({s})=>{ if(!pools.maps[s.parent].submaps[s.sub].includes(s.id)) throw new Error('not placed: ' + s.id); });
  fs.writeFileSync(POOLS, ptxt); fs.writeFileSync(REVIEW, JSON.stringify(review, null, 1) + '\n');
  console.log('applied', out.length, 'new cards, placed on their lists');
}
module.exports = {NEW};
