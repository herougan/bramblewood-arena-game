#!/usr/bin/env node
// 2026-11-28 (package CARDFIX1): the card builds the settled decisions need. DES is the change list (one entry a card); stats are fitted here
// to the largest line that holds both caps inside [lo, hi] of N (Level 1, the card's own obtain map), then the Level 0-10 table is rebuilt by
// tools/lvl10/gen_2026_11_18.js (the core skill at Level 1, the rest learnt later). awaitingSource / unattainable cards are lifted for the generator and put back.
//   node tools/cardfix1_2026_11_28.js --only=<id>            dry run (prints the design and its fill)
//   node tools/cardfix1_2026_11_28.js --only=<id> --apply    writes canonical/cards.json (then runs the table generator)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, 'canonical', 'cards.json');
const T = require('./skill_costs.js').make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const APPLY = process.argv.includes('--apply'), ONLY = (process.argv.find(a=> a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const ascii = txt=> txt.replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
const DATE = '2026-11-28 (CARDFIX1, owner 11-27 09:47 settled decisions): ';
// id: {set: fields to overwrite, fit: A:H ratio (true keeps the card's own), lo/hi: fill window (default .88-1), core: unit kept at Level 1, note: history line, drop: table keys to drop}
const DES = {
  'cinder-gecko': {regen: true, note: 'TESTFIX11-1 a: the Level 10 line was 20.06 over its cap 19.69 on Map 8 (MAPEXEC1 moved it there from Map 22); the table is re-fitted, Level 1 stats and Evasive unchanged'},
  'hedgerow-shrew': {set: {effects: {diurnal: 1}}, fit: 0.6, lo: 0.9, core: 'diurnal', drop: ['levelBonus', 'levelSkills'], note: 'TESTFIX11-3 a: its table equalled the Dormouse (2/5, Foraging 1, Foraging 2 at Level 8). A shrew is up and about by day and night in short fierce bursts: Diurnal (Map 1 row) instead of Foraging, a livelier shape; the Dormouse keeps Foraging'},
  'raccoon-nightcrew': {set: {effects: {foraging: 2}}, fit: true, core: 'foraging', drop: ['levelBonus', 'levelSkills'], note: 'CARDVET1-3 b: Stealth (Map 12) and Nocturnal (Map 7) sit on Map 2\'s side list; the raccoon that comes home richer is a forager: Foraging (Map 1 row)'},
  'matamata': {set: {effects: {pounce: 2, armor: 1}}, fit: true, core: 'pounce', drop: ['levelBonus', 'levelSkills'], note: 'CARDVET1-3 b: Ambush (Map 15) sits on Map 5\'s side list; the matamata strikes the moment the river brings dinner in reach: Pounce (Map 3 row) + the Armor 1 shell (Map 2)'},
  'orca-vanguard': {set: {effects: {wave: true, tide: true}}, fit: true, core: 'wave', drop: ['levelBonus', 'levelSkills'], note: 'CARDVET1-3 b: Cleave (Sweep, Map 15) sits on Map 10\'s list; orcas wash seals off the ice with a wave of their own making: Wave (Map 10 row) + Tide'},
  'rot-swollen-carcass': {set: {name: 'Blowfly Maggots', icon: '🪱', animal: 'blowfly maggot', species: ['Insect'], archetypes: ['Insect', 'Swamp'], effects: {swarm: ['Insect'], parasite: true},
    flavor: 'One is nothing. A thousand, feeding in step, are done with a carcass by the weekend.'}, fit: true, core: 'swarm', drop: ['levelBonus', 'levelSkills'], art: 'Rot-Swollen Carcass (a decaying body) becomes Blowfly Maggots: a writhing heap of pale cream blowfly maggots on a mossy swamp log, soft green light, generically gross but not graphic', note: 'CARDVET1-5 a: not an animal (a dead body that bursts into maggots) -> the animal itself, a blowfly maggot (an Insect larva, not an Annelid): Swarm with its own kind (Map 0) + Parasite (Map 6 row); the Maggot-on-death spawn and the Level 3 +2 Wait trigger are gone'},
  'ironback-gorilla': {set: {effects: {intimidate: 1, sturdy: true}, flavor: 'It beats its chest once. Most fights are decided right there.'}, fit: true, core: 'intimidate', drop: ['levelBonus', 'levelSkills'], note: 'MAPEXEC1-2 c: Bludgeon is on no Maps 0-20 row -> Intimidate (the chest-beat, Map 6) + Sturdy (Map 16); on no list, unattainable'},
};
// NEWCARDS1-2 a: trim the seven strong new species toward fair: the Level 1 fill window moves down, the shape stays
[['blobfish', 'Pressure Blobfish'], ['glass-frog', 'Glassbelly Frog'], ['leafy-sea-dragon', 'Kelpmask Sea Dragon'], ['okapi', 'Stripeleg Okapi'], ['red-panda', 'Ringtail Red Panda'], ['saiga', 'Steppe Saiga'], ['sunfish', 'Sunbasker Mola']]
  .forEach(([id, nm])=>{ DES[id] = {fit: true, lo: 0.74, hi: 0.8, drop: ['levelBonus'], keepSkills: true, note: 'NEWCARDS1-2 a: rated strong at 400 games (winRate over its band); trimmed toward fair, Level 1 fill 87-97% -> about 77%, shape and skills unchanged'}; });
module.exports = {DES};
if(require.main === module){
  const cards = JSON.parse(fs.readFileSync(FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  const bl = d=> d.kind === 'baby' ? 0 : (d.basic || d.rarity === 'starter') ? 0 : 1;
  function fit(d, ratio, lo, hi){ let best = null;
    for(let A = 0; A <= 12; A++) for(let H = 1; H <= 40; H++){ const c = Object.assign({}, d, {attack: A, health: H, levelBonus: undefined, levelSkills: d.keepSkills ? d.levelSkills : undefined}); let r; try{ r = T.budgetAt(c, 1, bl(c)); }catch(e){ continue; }
      const f = r.x1 / r.N, f2 = r.x2 / r.N2; if(f > hi || f2 > 1 || f < lo) continue;
      const sc = Math.abs(Math.log((A + 0.3) / H) - Math.log(ratio + 0.02)) + (hi - f) * 0.5; if(!best || sc < best.sc) best = {A, H, f, sc}; }
    return best; }
  for(const id of ONLY){ const D = DES[id], c = by[id]; if(!D || !c){ console.log('MISSING', id); continue; }
    const n = Object.assign({}, c, D.set || {}), was = c.attack + '/' + c.health + ' ' + JSON.stringify(c.effects);
    if(D.fit){ const f = fit(n, D.fit === true ? c.attack / c.health : D.fit, D.lo || 0.88, D.hi || 1); if(!f){ console.log('NO FIT', id); continue; } n.attack = f.A; n.health = f.H; n.fillL1 = f.f; }
    (D.drop || []).forEach(k=> delete n[k]);
    console.log(id.padEnd(18), c.name, '->', n.name, was, '->', n.attack + '/' + n.health, JSON.stringify(n.effects), 'fill', n.fillL1 && n.fillL1.toFixed(3)); delete n.fillL1;
    if(!APPLY) continue;
    n.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + DATE + D.note + (D.set && D.set.name ? ' (was ' + c.name + ')' : '') + '; was ' + was + '.';
    if(D.art) n.artReview = {status: 'rejected', reason: 'needs-redo (CARDFIX1): ' + D.art, at: '2026-11-28T01:00:00.000Z'};
    Object.assign(c, n); Object.keys(c).forEach(k=>{ if(n[k] === undefined) delete c[k]; });
    const lifted = ['awaitingSource', 'unattainable'].filter(k=> c[k]); lifted.forEach(k=> delete c[k]);
    fs.writeFileSync(FILE, ascii(JSON.stringify(cards, null, 2)) + '\n');
    try { const o = cp.execFileSync('node', [path.join(__dirname, 'lvl10', 'gen_2026_11_18.js'), '--card', id].concat(D.regen ? ['--force'] : []), {cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, D.core ? {CARDVET_CORE: D.core} : {})}); console.log(o.split('\n').filter(l=> l.includes(id)).join('\n')); }
    finally { const cs = JSON.parse(fs.readFileSync(FILE, 'utf8')); const cc = cs.find(x=> x.id === id); lifted.forEach(k=> cc[k] = true); fs.writeFileSync(FILE, ascii(JSON.stringify(cs, null, 2)) + '\n'); }
  }
}
