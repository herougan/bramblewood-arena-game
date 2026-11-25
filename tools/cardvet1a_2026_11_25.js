#!/usr/bin/env node
// 2026-11-25 (package CARDVET1a, owner 00:22: "Vet through each card ... trigger->actions ... more active skills ... real animals b4 the elemental / magical ones"):
// the card designs of Maps 0-6 (main + side lists). DES is the whole change list; the Level 0-10 tables are rebuilt by tools/lvl10/gen_2026_11_18.js
// (core skill at Level 1, the rest learnt later, both caps held) for the cards whose table changes; stats are fitted here to the largest line that holds both caps.
//   node tools/cardvet1a_2026_11_25.js            dry run (prints the designs and their fill)
//   node tools/cardvet1a_2026_11_25.js --apply    writes canonical/cards.json (then runs the table generator per card)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, 'canonical', 'cards.json');
const T = require('./skill_costs.js').make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const APPLY = process.argv.includes('--apply'), ONLY = (process.argv.find(a=> a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean); // --only=id,id: one map's cards at a time (a commit per map)
const ascii = txt=> txt.replace(/[\u0080-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')); // the file is written like Python's json.dump (ensure_ascii)
const SPAWN = (o)=> Object.assign({on: 'onSpawn'}, o);
// id: {set: fields to overwrite, fit: Attack:Health shape to fit (omit to keep the stats), keepTable: true keeps levelBonus / levelSkills, note: dated history line, art: why the art needs a redo}
const DES = {
  // --- Map 0 side map (mo)
  'ent': {set: {name: 'Barn Owl', icon: '🦉', cost: 1, wait: 1, effects: {flying: true, triggers: [SPAWN({do: 'damage', amount: 3, dmgType: 'physical', who: 'enemy', sub: 'random'})]}, animal: 'owl', species: ['Bird'], archetypes: ['Bird'],
    flavor: 'It leaves the barn without a sound. The first the mouse knows of it is the last.'}, fit: 0.4, art: 'Ent (a walking oak) becomes a barn owl: a pale owl gliding low over a moonlit hay field, dark background of old barn beams and grass, generically alert, not menacing'},
  'strangler-vine': {set: {name: 'Strangler Fig', effects: {thorns: 2, triggers: [SPAWN({do: 'addWait', amount: 2, who: 'enemy', sub: 'adjacent'})]}}, fit: 0.1},
  'hedgehog-herbalist': {set: {name: 'Hedgehog Matron', effects: {thorns: 2, triggers: [SPAWN({do: 'grantShield', allies: 2})]}, flavor: 'She rolls up first and the hoglets tuck in behind. Nothing gets past the spines or the mother.'}, fit: 0.3, core: 'triggers'},
  'phoenix-mushrooms': {set: {name: 'Honey Fungus', flavor: 'One honey-coloured clump on a log. Underneath it is a single creature the size of a forest.'}, note: 'rename only (real fungus Armillaria); the art already shows honey fungus on a log'},
  // --- Map 1 side map (mq)
  'ladybird-guard': {set: {effects: {guardian: true, poisonBarbs: 1}}, fit: 0.12},
  'lucky-hopper': {set: {cost: 1, wait: 0, effects: {triggers: [SPAWN({do: 'drawCard', count: 1})]}}, fit: 0.1},
  'puddle-skimmer': {set: {effects: {speed: {kind: 'swift'}}}, fit: 0.3, owner: true},
  // --- Map 2 side maps (mp, mg)
  'lodge-engineer': {set: {effects: {forestry: 1, delivery: 1}}, fit: 0.25},
  'trash-panda-trickster': {set: {wait: 0, effects: {nocturnal: 1, triggers: [SPAWN({do: 'gain', resource: 'lumber', amount: 1})]}}, fit: 0.6},
  'salvager-hermit-crab': {set: {effects: {armor: 2, triggers: [SPAWN({do: 'gain', resource: 'lumber', amount: 1})]}}, fit: 0.08},
  // --- Map 3 (special list)
  'hawk-arrowkeeper': {set: {effects: {flying: true, diurnal: true, arrow: 2}}, fit: 0.25},
  // --- Map 5
  'cottonmouth-matriarch': {set: {effects: {poison: 1, triggers: [SPAWN({do: 'poison', amount: 2, who: 'enemy', sub: 'adjacent'})]}}, fit: 0.15},
  'bog-leech': {set: {effects: {sap: 1}}, fit: 0.12},
  'cypress-root-lurker': {set: {name: 'Black Caiman', icon: '🐊', animal: 'caiman', species: ['Reptile'], archetypes: ['Swamp', 'Reptile'], flavor: 'It sinks until only the eyes show. Then the death roll, and the swamp is quiet again.'}, owner: true, art: 'Cypress Root Lurker (a plant that is an alligator) becomes a black caiman: a huge black caiman half-submerged in dark swamp water at dusk, cypress knees and hanging moss behind, generically menacing'},
  // --- Map 6 and its side map (mm)
  'booming-bittern': {set: {effects: {intimidate: 2}}, fit: 0.2, owner: true},
  'puddle-hopper': {set: {effects: {tide: true, intimidate: 1}}, fit: 0.28},
  'willow-o-wisp': {set: {name: 'Marsh Firefly', icon: '🪲', animal: 'firefly', species: ['Insect'], flavor: 'One cold green light over the reeds at night. Everything that follows it ends up in the water.'}, art: 'Willow-o-Wisp (a ghost-light beetle) becomes a marsh firefly: a firefly with a glowing green tail hovering over dark reeds and still swamp water at night, small and dim, generically eerie'},
  'venomlord-serpent': {set: {name: 'Gaboon Viper'}, note: 'rename only (real viper; the art already shows a venom-dripping viper)', owner: true},
  'heron-hag': {set: {name: 'The Grey Heron'}, note: 'rename only (real heron; the art already shows a grey heron in the mist)', owner: true},
  // --- owner-edited cards whose Level table carries a skill that is on no Maps 0-20 row
  'house-cat': {drop: 'levelSkills', note: 'Level 2 Crepuscular left (on no Maps 0-20 row); the table is rebuilt as stats', owner: true},
  'hedgerow-shrew': {drop: 'levelSkills', note: 'Level 3 Cure left (Cure is a Map 21 skill); the table is rebuilt as stats', owner: true},
  'river-mink': {drop: 'levelSkills', note: 'Level 2 Dive left (on no Maps 0-20 row); the table is rebuilt as stats', owner: true},
};
module.exports = {DES};
if(require.main === module){
  const cards = JSON.parse(fs.readFileSync(FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  const bl = d=> d.kind === 'baby' ? 0 : (d.basic || d.rarity === 'starter') ? 0 : 1;
  function fit(d, ratio){ let best = null;
    for(let A = 0; A <= 9; A++) for(let H = 1; H <= 40; H++){ const c = Object.assign({}, d, {attack: A, health: H, levelBonus: undefined, levelSkills: undefined}); let r; try{ r = T.budgetAt(c, 1, bl(c)); }catch(e){ continue; }
      const f = r.x1 / r.N, f2 = r.x2 / r.N2; if(f > 1 || f2 > 1 || f < 0.88) continue;
      const sc = Math.abs(Math.log((A + 0.3) / H) - Math.log(ratio + 0.02)) + (1 - f) * 3; if(!best || sc < best.sc) best = {A, H, f, sc}; }
    return best; }
  const regen = [];
  for(const id of Object.keys(DES)){ if(ONLY.length && !ONLY.includes(id)) continue; const D = DES[id], c = by[id]; if(!c){ console.log('MISSING', id); continue; }
    const before = {name: c.name, a: c.attack, h: c.health, cost: c.cost, wait: c.wait, fx: JSON.stringify(c.effects)};
    const n = Object.assign({}, c, D.set || {});
    if(D.fit != null){ const f = fit(n, D.fit); if(!f){ console.log('NO FIT', id); continue; } n.attack = f.A; n.health = f.H; regen.push(id); }
    if(D.drop){ delete n[D.drop]; regen.push(id); }
    if(regen.includes(id)){ delete n.levelBonus; delete n.levelSkills; }
    console.log(id.padEnd(24), before.name, before.cost + '/' + before.wait, before.a + '/' + before.h, before.fx, '->', n.name, n.cost + '/' + n.wait, n.attack + '/' + n.health, JSON.stringify(n.effects));
    if(APPLY){ const date = '2026-11-25 (CARDVET1a, owner 00:22 vet pass): ';
      n.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + date + (D.note || ((D.set && D.set.name && D.set.name !== c.name ? 'was ' + c.name + '; ' : '') + 'was ' + before.cost + '/' + before.wait + ' ' + before.a + '/' + before.h + ' ' + before.fx + '; now ' + n.cost + '/' + n.wait + ' ' + n.attack + '/' + n.health + ' ' + JSON.stringify(n.effects))) + (D.owner ? ' (owner-edited card: changed for the vet pass reason only)' : '') + '.';
      if(D.art){ n.artReview = {status: 'rejected', reason: 'needs-redo (CARDVET1a): ' + D.art, at: '2026-11-25T01:00:00.000Z'}; }
      by[id] = Object.assign(c, n); Object.keys(c).forEach(k=>{ if(n[k] === undefined) delete c[k]; }); }
  }
  if(APPLY){ fs.writeFileSync(FILE, ascii(JSON.stringify(cards, null, 2)) + '\n'); regen.forEach(id=>{ const o = cp.execFileSync('node', [path.join(__dirname, 'lvl10', 'gen_2026_11_18.js'), '--card', id], {cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, DES[id].core ? {CARDVET_CORE: DES[id].core} : {})}); console.log(o.split('\n').filter(l=> l.includes(id)).join('\n')); }); }
}
