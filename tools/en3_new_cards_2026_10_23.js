#!/usr/bin/env node
// EN3 new cards (2026-10-23, owner 20:44: "The new skills we mentioned - implement them in new cards."): two Rampart cards and two Bramble
// Armor cards, appended to canonical/cards.json with awaitingSource (their map / pack is call EN3-8). Each gets the largest line on its
// Attack:Health shape inside both caps at Level 1 (tools/skill_costs.js budget; map term 0 until placed), as tools/refit_pass_2026_10_21.js
// fits. Skill prices: Rampart 0.5, Bramble Armor 1.1 (measured, docs/balance/en3-skill-test-2026-10-23.md; the owner 20:44: "just logic is
// sufficient ... I compare to the effect of 1 attack or health across 4 rounds": Bramble Armor's 1 a bramble hit over ~4 rounds of 1-2 hits
// sits near 1 Health a round, about 1; Rampart moves damage from the bramble to a unit 1:1, so it is mostly a trade, about 0.5).
//   node tools/en3_new_cards_2026_10_23.js          dry run       ... apply     writes canonical/cards.json (refuses if an id exists)
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
function uuid5(name){ const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80; const x = h.slice(0, 16).toString('hex'); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; }
const NEW = [
  {id:'dam-keeper-beaver', name:'Dam-Keeper Beaver', icon:'🦫', cost:1, wait:1, shape:[2, 9], rarity:'common', archetypes:['Beaver'], species:['Rodent'], animal:'beaver',
   effects:{rampart:true}, flavor:'Forty winters patching the dam. The bramble is just a dam that argues back.', pack:'Pack 1 (with the Map 0-6 beavers)'},
  {id:'moat-snapper', name:'Moat Snapper', icon:'🐢', cost:2, wait:2, shape:[3, 12], rarity:'uncommon', archetypes:['Turtle'], species:['Reptile'], animal:'snapping turtle',
   effects:{rampart:true, armor:1}, flavor:'It lives in the moat, sleeps in the moat, and bites whatever tries to cross the moat.', pack:'Pack 2 (Maps 7-13, beside the turtles)'},
  {id:'briarback-hedgehog', name:'Briarback Hedgehog', icon:'🦔', cost:1, wait:1, shape:[2, 9], rarity:'common', archetypes:['Hedgehog'], species:['Erinaceid'], animal:'hedgehog',
   effects:{brambleArmor:true}, flavor:'It curls up in the roots until nobody can tell which spines are whose.', pack:'Pack 1 (Maps 0-6)'},
  {id:'barkplate-beetle', name:'Barkplate Beetle', icon:'🪲', cost:2, wait:2, shape:[3, 11], rarity:'uncommon', archetypes:['Insect', 'Forest'], species:['Insect'], animal:'bark beetle',
   effects:{brambleArmor:true, thorns:1}, flavor:'It chews bark into plates and glues them to the bramble. Nobody asked. Nobody minds.', pack:'Pack 2 (Maps 7-13, the Redwood Deep)'},
];
const lineOk = (c, A, H)=>{ const b = T.budget(Object.assign({}, c, {attack:A, health:H}), {level:1}); return b.ok && b.x1 <= b.N ? b : null; };
let nid = Math.max(...cards.map(c=> c.numericId || 0)) + 1; const out = [];
for(const s of NEW){
  if(cards.some(c=> c.id === s.id)){ console.log('exists: ' + s.id); continue; }
  const base = {id:s.id, name:s.name, icon:s.icon, cost:s.cost, wait:s.wait, attack:s.shape[0], health:s.shape[1], rarity:s.rarity, locked:true, test:false,
    archetypes:s.archetypes, species:s.species, animal:s.animal, dmgType:'physical', resist:[], tags:[], effects:s.effects, flavor:s.flavor};
  let best = null; for(let k = 0.2; k <= 4; k += 0.01){ const A = Math.max(1, Math.round(s.shape[0] * k)), H = Math.max(1, Math.round(s.shape[1] * k)), b = lineOk(base, A, H);
    if(b && (!best || b.x1 > best.b.x1)) best = {A, H, b}; }
  base.attack = best.A; base.health = best.H; base.numericId = nid++; base.uuid = uuid5('bramblewood-card:' + s.id); base.awaitingSource = true;
  base.creatorNote = `2026-10-23 (package EN3, owner 20:44: "The new skills we mentioned - implement them in new cards."): ${Object.keys(s.effects).join(' + ')}. Priced with the budget (tools/skill_costs.js budget, Level 1, map term 0): S ${best.b.S}, N ${best.b.N}, 2A+H+S ${best.b.x1}: ${best.A}/${best.H}. Proposed source: ${s.pack} (call EN3-8). Art: placeholder (the emoji); NightCafe prompt in docs/art/new-cards-2026-10-21-briefs.md (package EN3).`;
  out.push(base); console.log(`${s.id.padEnd(20)} ${s.rarity.padEnd(9)} W${s.wait} ${best.A}/${best.H}  S ${best.b.S}  2A+H+S ${best.b.x1} / N ${best.b.N}`);
}
if(process.argv.includes('apply') && out.length){
  cards.push(...out);
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('applied', out.length);
}
