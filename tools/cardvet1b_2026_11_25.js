#!/usr/bin/env node
// 2026-11-25 (package CARDVET1b, owner 00:22: "Vet through each card ... trigger->actions ... more active skills ... real animals b4 the elemental / magical ones"):
// the card designs of Maps 7-13 (main + side lists). DES is the whole change list; the Level 0-10 tables are rebuilt by tools/lvl10/gen_2026_11_18.js
// (core skill at Level 1, the rest learnt later, both caps held) for the cards whose table changes; stats are fitted here to the largest line that holds both caps.
//   node tools/cardvet1b_2026_11_25.js            dry run (prints the designs and their fill)
//   node tools/cardvet1b_2026_11_25.js --apply    writes canonical/cards.json (then runs the table generator per card)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, 'canonical', 'cards.json');
const T = require('./skill_costs.js').make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const APPLY = process.argv.includes('--apply'), ONLY = (process.argv.find(a=> a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean); // --only=id,id: one map's cards at a time (a commit per map)
const ascii = txt=> txt.replace(/[\u0080-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')); // the file is written like Python's json.dump (ensure_ascii)
const SPAWN = (o)=> Object.assign({on: 'onSpawn'}, o);
// id: {set: fields to overwrite, fit: Attack:Health shape to fit (omit to keep the stats), keepTable: true keeps levelBonus / levelSkills, note: dated history line, art: why the art needs a redo}
const DES = {
  // --- Map 7 (mu, mz)
  'glowworm-cluster': {set: {effects: {nocturnal: true, triggers: [SPAWN({do: 'gain', resource: 'lumber', amount: 1})]}}, fit: true}, // Prayer is on no row; the collection plate joke becomes an On Play Lumber
  'sleepless-shrew': {set: {effects: {nocturnal: 1, poison: 1}}, fit: true}, // Wakeful is on no row; a shrew is a venomous, sleepless hunter
  // --- Map 9 (mk) and Map 10 (m7)
  'ironclaw-fiddler': {set: {effects: {tide: true, crabClaws: true, intimidate: 1}}, fit: true, drop: 'levelSkills', core: 'intimidate', owner: true}, // Bludgeon is on no row (MAPEXEC1-2): the waving claw frightens
  'tide-spirit': {set: {effects: {tide: true, evasive: true}, species: ['Fish'], flavor: 'Half wave, half seahorse: it holds still in the kelp and no strike seems to land.'}, fit: true}, // a rare with Tide alone; "impossible to properly hit" is Evasive
  'kraken-spawnling': {set: {effects: {fork: true, smokeBomb: true}, name: 'Giant Pacific Octopus', flavor: 'Eight arms, three hearts, and a patience that outlasts every diver who tried to catch it.'}, art: 'Kraken Spawnling (a baby sea monster) becomes a giant Pacific octopus: a large reddish octopus spreading its arms over a rocky kelp bed, dark green water behind, generically menacing', fit: true, drop: 'levelSkills', core: 'fork'},
  'mantis-shrimp': {set: {effects: {pounce: 2}}, fit: true}, // Recoil is a Map 12 skill on a Map 10 card; the mantis shrimp punches the moment it is ready
  'coral-polyp-colony': {set: {effects: {tide: true, forestry: 1, armor: 1}}, fit: true, drop: 'levelSkills', core: 'forestry'}, // Meld is on no row; a reef hardens
  // --- Map 11 (m10, mv)
  'yeti': {set: {name: 'Wild Yak', icon: '🐂', animal: 'yak', species: ['Bovine'], archetypes: ['Mountain'], flavor: 'Nothing on the high pass argues with a yak that has decided to cross it.'}, art: 'Yeti (a mythical snow giant) becomes a wild yak: a huge shaggy black yak with long fur and curved horns on a bare windswept mountain pass, snow on the ridge behind, generically menacing'},
  'gangrenous-leech': {drop: 'levelSkills', core: 'poison', fit: 0.6, set: {effects: {poison: 2, parasite: true}, flavor: 'It drinks, it infects, and the bite keeps hurting long after the leech has dropped off.'}}, // Fester (Level 6) is on no row
  'wound-reaver': {fit: true, drop: 'levelSkills', core: 'bleed', set: {effects: {bleed: 2, poison: 1}, name: 'Gila Monster', icon: '🦎', animal: 'gila monster', species: ['Reptile'], archetypes: ['Reptile'], flavor: 'It bites, holds on, and chews. The wound keeps bleeding long after it lets go.'}, art: 'Wound Reaver (an invented lizard) becomes a Gila monster: a heavy orange and black beaded Gila monster on red desert rock, cacti behind, generically menacing'},
  'gale-swift': {set: {effects: {flying: true, speed: {kind: 'swift'}}}, fit: true}, // Storm is on no row; the swift is the fastest bird: Swift
  'eyrie-warden': {set: {effects: {flying: true, pounce: 3}}, fit: true}, // Twin Shot is on no row; its flavour is a strike from above before it is noticed: Pounce
  'ibex-rockcaller': {set: {effects: {daunt: 1, pounce: 2}}, fit: true}, // Avalanche is on no row; the ledge-leaper that makes the slope listen: Daunt (Map 11 row) + Pounce
  // --- Map 13 (mr)
  'sergeant-bramblefox': {set: {effects: {pounce: 2, inspiring: 1}}, fit: true, core: 'pounce'}, // a rare vanilla 3/12 on Map 13: "barks the orders, then runs in first anyway"
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
    if(D.fit){ const f = fit(n, D.fit === true ? c.attack / c.health : D.fit); if(!f){ console.log('NO FIT', id); continue; } n.attack = f.A; n.health = f.H; regen.push(id); }
    if(D.drop){ delete n[D.drop]; regen.push(id); }
    if(regen.includes(id)){ delete n.levelBonus; delete n.levelSkills; }
    console.log(id.padEnd(24), before.name, before.cost + '/' + before.wait, before.a + '/' + before.h, before.fx, '->', n.name, n.cost + '/' + n.wait, n.attack + '/' + n.health, JSON.stringify(n.effects));
    if(APPLY){ const date = '2026-11-25 (CARDVET1b, owner 00:22 vet pass): ';
      n.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + date + (D.note || ((D.set && D.set.name && D.set.name !== c.name ? 'was ' + c.name + '; ' : '') + 'was ' + before.cost + '/' + before.wait + ' ' + before.a + '/' + before.h + ' ' + before.fx + '; now ' + n.cost + '/' + n.wait + ' ' + n.attack + '/' + n.health + ' ' + JSON.stringify(n.effects))) + (D.owner ? ' (owner-edited card: changed for the vet pass reason only)' : '') + '.';
      if(D.art){ n.artReview = {status: 'rejected', reason: 'needs-redo (CARDVET1b): ' + D.art, at: '2026-11-25T01:00:00.000Z'}; }
      by[id] = Object.assign(c, n); Object.keys(c).forEach(k=>{ if(n[k] === undefined) delete c[k]; }); }
  }
  if(APPLY){ fs.writeFileSync(FILE, ascii(JSON.stringify(cards, null, 2)) + '\n'); regen.forEach(id=>{ const o = cp.execFileSync('node', [path.join(__dirname, 'lvl10', 'gen_2026_11_18.js'), '--card', id], {cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, DES[id].core ? {CARDVET_CORE: DES[id].core} : {})}); console.log(o.split('\n').filter(l=> l.includes(id)).join('\n')); }); }
}
