#!/usr/bin/env node
// 2026-11-25 (package CARDVET1c, owner 00:22: "Vet through each card ... trigger->actions ... more active skills ... real animals b4 the elemental / magical ones"):
// the card designs of Maps 14-20 (main + side lists). DES is the whole change list; the Level 0-10 tables are rebuilt by tools/lvl10/gen_2026_11_18.js
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
const REAL = (name, icon, animal, species, arch, flavor, art)=> ({name, icon, animal, species, archetypes: arch, resist: [], dmgType: 'physical', flavor}); // a real-animal swap: label fields only
const DES = {
  // --- Map 14-17 lists
  'hoopoe-herald': {set: {effects: {inspiring: 1}}, fit: true, drop: 'levelBonus', note: 'Herald (Leader +n/+n, on no Maps 0-20 row) -> Inspiring (Map 1); the crown and the bell rally the neighbours'},
  'pinecone-sapper': {set: {species: ['Mammal']}, note: 'species label Plant -> Mammal (it is a pangolin, the art shows one); skills and stats unchanged', keepTable: true},
  'glacier-yak': {set: {effects: {sturdy: true, triggers: [{on: 'onSpawn', do: 'addWait', amount: 2, who: 'enemy', sub: 'adjacent'}]}}, fit: true, core: 'triggers', note: 'Freeze is on no Maps 0-20 row; the yak leans into the charge: Sturdy (Map 16) and the On Play +2 Wait on the foe beside it (was Level 3) from Level 1'},
  'harbor-seal': {set: {effects: {tide: true, evasive: true}}, fit: true, note: 'Dive 2 is on no Maps 0-20 row (CARDVET1a took it off River Mink too); Tide + Evasive kept'},
  // --- Map 18 (md, mpd)
  'caustic-scorpion': {set: {effects: {pounce: 2, corrode: 1}, flavor: 'Tail up, sting first, and the corroding venom is already at work before the dust settles.'}, fit: true, drop: 'levelBonus', core: 'pounce', note: 'MAPEXEC1-2 default c: Acid (arrow, acid bolt) is on no row -> Pounce (Map 3, strikes the moment it is Ready) + Corrode (Map 7); it was 1/18 on a Level 7 Acid 2'},
  'dust-devil-kestrel': {set: {effects: {flying: true, pounce: 2}}, fit: true, drop: 'levelBonus', core: 'pounce', note: 'Tornado is on no Maps 0-20 row; a kestrel hovers, then drops: Flying + Pounce'},
  'nightjar-drifter': {set: {effects: {nocturnal: 1, evasive: true}}, fit: true, drop: 'levelBonus', core: 'nocturnal', note: 'Crepuscular is on no Maps 0-20 row (1a took it off House Cat); a nightjar is a camouflaged night bird: Nocturnal (Map 7) + Evasive (Map 8)'},
  'sandstorm-roc': {set: Object.assign(REAL('Griffon Vulture', '🦅', 'vulture', ['Bird'], ['Desert'], 'A shadow on the dunes that arrives a little before the weather does and leaves very little behind.'), {effects: {dry: true, pounce: 2}}), fit: true, drop: 'levelBonus', core: 'pounce', art: 'Sandstorm Roc (a mythical giant bird) becomes a griffon vulture: a huge brown vulture with broad wings gliding low over pale desert dunes, hazy orange sky, generically menacing'},
  // --- Map 19 (m3, m9)
  'ember-revenant': {set: Object.assign(REAL('Cassowary', '🐦', 'cassowary', ['Bird'], ['Volcanic'], 'Tall, blue-necked and unbothered, with one clawed toe that has settled arguments for a million years.'), {effects: {pierce: 2, pounce: 2}}), core: 'pounce', art: 'Ember Revenant (an undead boar) becomes a cassowary: a tall blue-necked black cassowary with a red wattle on ash-grey volcanic gravel, smoky ridge behind, generically menacing', fit: true, drop: 'levelBonus'},
  'malachite-golem': {set: Object.assign(REAL('Glyptodon', '🐢', 'glyptodon', ['Xenarthran'], ['Cave'], 'A car-sized shell on short legs. It does not run, and nothing it has met has needed it to.'), {effects: {armor: 3, sturdy: true}}), art: 'Malachite Golem (a green stone beetle) becomes a glyptodon: a huge domed armoured glyptodon with a tiled shell and short thick legs on grey rock in a dim cave mouth, generically menacing', fit: true, drop: 'levelBonus'},
  'grindstone-boar': {set: {effects: {pounce: 2, recoil: 1}}, fit: true, drop: 'levelBonus', core: 'pounce', note: 'a common with Recoil alone on a late map: the boar charges the moment it is Ready (Pounce) and the tusks cut both ways (Recoil 1)'},
  // --- Map 20 (m11, me, mx) and the cards that sit there
  'magma-salamander': {set: REAL('Marine Iguana', '🦎', 'marine iguana', ['Reptile'], ['Volcanic'], 'Black as the lava rock it sunbathes on, and it snorts the hot salt back out at anything that gets close.'), art: 'Magma Salamander (an invented fire amphibian) becomes a marine iguana: a heavy black spiny marine iguana on jagged dark lava rock, surf and ash haze behind, generically menacing', note: 'skills and stats unchanged (Arrow fire bolt stays: it is the Map 20 Cinder carrier and the table row must keep its two carriers)'},
  'magma-titan': {set: Object.assign(REAL('Cape Buffalo', '🐃', 'cape buffalo', ['Bovine'], ['Volcanic'], 'It does not forget a hit. It just waits until the next one to answer both.'), {effects: {exploit: 3, mighty: true}}), art: 'Magma Rhino (an elemental rhino) becomes a cape buffalo: a huge black cape buffalo with a heavy boss of horn and a scarred hide on dark ash-grey ground, smoke behind, generically menacing', fit: true, drop: 'levelBonus'},
  'caldera-wyrm': {set: Object.assign(REAL('The Caldera Komodo', '🦎', 'komodo dragon', ['Reptile'], ['Volcanic', 'Leader'], 'It sleeps on the warm rock above the caldera. When it wakes, the mountain makes room.'), {effects: {armor: 1, pounce: 5, bleed: 2}}), art: 'The Caldera Wyrm (a dragon) becomes an oversized Komodo dragon: a gigantic scarred Komodo dragon on a black volcanic crater rim, steam vents and red glow behind, generically menacing', fit: true, drop: 'levelBonus', core: 'pounce'},
  'fire-drake-hatchling': {set: Object.assign(REAL('Komodo Hatchling', '🦎', 'komodo dragon', ['Reptile'], ['Volcanic'], 'Too young to be feared by anything. Old enough to bite anyway.'), {effects: {pounce: 2, bleed: 2}}), ls: {1: {hatchling: true}}, core: 'pounce', art: 'Fire Drake Hatchling (a baby dragon) becomes a Komodo hatchling: a small striped green and brown young Komodo dragon on grey volcanic rock, steam behind, generically menacing', fit: true, drop: 'levelBonus'},
  'granite-ox-golem': {set: REAL('Gaur', '🐂', 'gaur', ['Bovine'], ['Volcanic', 'Ox'], 'Four legs like pillars and a shoulder like a wall. When it stamps, the whole field forgets what it was doing.'), art: 'Granite Ox Golem (a living stone ox) becomes a gaur: a huge muscular dark brown gaur with pale socks and curved horns on dark volcanic scree, generically menacing'},
  'brimstone-hound': {set: Object.assign(REAL('African Wild Dog', '🐕', 'wild dog', ['Canid'], ['Dog', 'Volcanic'], 'It bites whatever is nearest, then whatever is next to that, and the pack is never far behind.'), {effects: {sweep: 1}}), art: 'Brimstone Hound (a hell hound) becomes an African wild dog: a lean mottled black, tan and white painted dog with large round ears on ash-grey rock, generically menacing', fit: true, drop: 'levelBonus'},
  'carrion-beetle': {set: {effects: {bleed: 2}}, fit: true, drop: 'levelBonus', note: 'Festering is on no Maps 0-20 row; "where it walks, wounds forget how to close" is Bleed (Map 6)'},
  'honey-badger-fury': {set: {effects: {pounce: 2, exploit: 1}}, fit: true, drop: 'levelBonus', core: 'pounce', note: 'Last Stand is on no Maps 0-20 row; the honey badger is in before anyone is ready (Pounce) and keeps worrying the same target (Exploit, Map 14)'},
  'the-contradiction': {set: {effects: {momentum: 1, regen: 2}}, fit: true, drop: 'levelBonus', core: 'momentum', note: 'Rage is on no Maps 0-20 row; the bear that came down into the fire grows with every kill: Momentum (Map 17), Regeneration 2 learnt at Level 4 as before'},
  'pack-mule': {set: {effects: {delivery: 1}}, fit: true, drop: 'levelBonus', note: 'Bounty is on no Maps 0-20 row (1a took it off Trash Panda); the mule brings the cavalry its firewood: Delivery (Map 4)'},
  'ash-moth': {set: {effects: {flying: true, nocturnal: true, poisonPowder: 1}}, fit: true, drop: 'levelBonus', core: 'flying', note: 'a common vanilla moth on Map 20: its dust is Poison Powder (Map 7)'},
  'stalactite-golem': {set: {species: ['Crustacean']}, note: 'species label Elemental -> Crustacean (a pill bug is an isopod, the card is already named for it); skills and stats unchanged', keepTable: true},
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
    if(APPLY){ const date = '2026-11-25 (CARDVET1c, owner 00:22 vet pass): ';
      n.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + date + (D.note || ((D.set && D.set.name && D.set.name !== c.name ? 'was ' + c.name + '; ' : '') + 'was ' + before.cost + '/' + before.wait + ' ' + before.a + '/' + before.h + ' ' + before.fx + '; now ' + n.cost + '/' + n.wait + ' ' + n.attack + '/' + n.health + ' ' + JSON.stringify(n.effects))) + (D.owner ? ' (owner-edited card: changed for the vet pass reason only)' : '') + '.';
      if(D.art){ n.artReview = {status: 'rejected', reason: 'needs-redo (CARDVET1c): ' + D.art, at: '2026-11-25T01:00:00.000Z'}; }
      by[id] = Object.assign(c, n); Object.keys(c).forEach(k=>{ if(n[k] === undefined) delete c[k]; }); }
  }
  if(APPLY){ fs.writeFileSync(FILE, ascii(JSON.stringify(cards, null, 2)) + '\n'); regen.forEach(id=>{ const o = cp.execFileSync('node', [path.join(__dirname, 'lvl10', 'gen_2026_11_18.js'), '--card', id], {cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, DES[id].core ? {CARDVET_CORE: DES[id].core} : {})}); console.log(o.split('\n').filter(l=> l.includes(id)).join('\n')); }); }
  const after = Object.keys(DES).filter(id=> DES[id].ls && regen.includes(id)); // a Level-1 skill the generator does not know (the baby's Hatchling)
  if(APPLY && after.length){ const cs = JSON.parse(fs.readFileSync(FILE, 'utf8')); cs.forEach(c=>{ if(after.includes(c.id)){ c.levelSkills = Object.assign({}, c.levelSkills); Object.keys(DES[c.id].ls).forEach(L=> c.levelSkills[L] = Object.assign({}, c.levelSkills[L], DES[c.id].ls[L])); } }); fs.writeFileSync(FILE, ascii(JSON.stringify(cs, null, 2)) + '\n'); }
}
