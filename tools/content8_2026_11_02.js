#!/usr/bin/env node
// CONTENT8 (2026-11-02, owner 21:12 on CONTENT7-1 / CONTENT7-3; hub KK16 + KK17): "Dinoflagellates (algae). Type = algae, phyla - flora.
// Only put cards if they are not at map card cap. Oo I want jellyfish in the game."
//   1. rename: Bright Night Algae (id night-algae) -> Dinoflagellates, animal 'algae' (as Pond Algae), plant subtype, new flavour
//   2. place three jellyfish cards (first cut placed seven; see PLACE) on the map lists (canonical/map-pools.json), only on maps under their card cap (main 8-11 own +
//      4-5 carried, 12-16 in all, decision THEME1-1): Pebble Beach (mb, Map 2): Bloodworm, Moon Jelly; Sunken Hollow (m2, Map 4): Lion's Mane
//      Jelly, Pistol Shrimp; Kelp Mangroves (mk, Map 9): Man o' War; Coral Current (m7, Map 10): Nautiloid, Supernova Jelly.
//      Bobbit Worm and Dinoflagellates stay unlisted. A placed card loses awaitingSource / unattainable and gets a basic-pack source
//      (as Pond Algae: {kind:'pack', tier, map}); the pack and the map term come from the list (arena_app.js cardObtainMap).
//   3. refit: each placed card to its new map's budget term, each stat within 2 of its CONTENT7 line, shape kept (BAL12 rule).
//   node tools/content8_2026_11_02.js apply   (idempotent)    node tools/content8_2026_11_02.js refit [--apply]   (run after apply, as its own process)
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
const PLACE = [
  {map:'mb', n:2, tier:1, ids:['moon-jelly']},
  {map:'m2', n:4, tier:1, ids:['lions-mane-jelly']},
  {map:'m7', n:10, tier:2, ids:['supernova-jelly']},
];
// 2026-11-02 (coordinator, same day): held to the owner's 8-11 own rule, so Bloodworm, Pistol Shrimp, Nautiloid and Man o' War went back off the lists
// (unlisted as CONTENT7 had them, their CONTENT7 lines restored); each of the four maps holds 11 own cards. Only the three jellyfish stay placed.
const FLAVOR = 'Each wave breaks in blue sparks. Come dark, the bay lights up and there are two.';
const NOTE_RENAME = '2026-11-02 (package CONTENT8, owner 21:12, CONTENT7-3: "Dinoflagellates (algae). Type = algae, phyla - flora."): was Bright Night Algae (glowing bacterium); now Dinoflagellates, animal algae, plant subtype, as Pond Algae. Unlisted: no room on any map list (KK17).';

function apply(){
  const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), by = id=> cards.find(c=> c.id === id), log = [];
  const na = by('night-algae');
  if(na.name !== 'Dinoflagellates'){ na.name = 'Dinoflagellates'; na.animal = 'algae'; na.subtype = 'plant'; na.flavor = FLAVOR; na.creatorNote = (na.creatorNote || '') + ' ' + NOTE_RENAME; log.push('renamed night-algae -> Dinoflagellates'); }
  let pools = fs.readFileSync(POOLS, 'utf8'); const P = JSON.parse(pools).maps;
  for(const p of PLACE){
    const before = P[p.map].cards.length;
    const add = p.ids.filter(id=> !P[p.map].cards.includes(id));
    if(add.length){
      const start = pools.indexOf(`\n  "${p.map}": {`); if(start < 0) throw new Error('no block ' + p.map);
      const cs = pools.indexOf('"cards": [', start), ce = pools.indexOf(']', cs);
      pools = pools.slice(0, ce) + add.map(id=> `, "${id}"`).join('') + pools.slice(ce);
      log.push(`${p.map} (Map ${p.n}): ${before} -> ${before + add.length} cards (+ ${add.join(', ')})`);
    }
    for(const id of p.ids){ const c = by(id); if(!c) throw new Error('missing ' + id);
      if(c.awaitingSource || c.unattainable){ delete c.awaitingSource; delete c.unattainable; }
      c.source = {kind:'pack', tier:p.tier, map:p.map};
      if(!/CONTENT8/.test(c.creatorNote || '')) c.creatorNote = (c.creatorNote || '') + ` 2026-11-02 (package CONTENT8, owner 21:12, CONTENT7-1 / KK17): placed on the ${p.map} list (Map ${p.n}); awaitingSource / unattainable cleared; source pack ${p.tier}.`; }
  }
  fs.writeFileSync(POOLS, pools); fs.writeFileSync(CARDS, pyDump(cards)); JSON.parse(fs.readFileSync(POOLS, 'utf8'));
  console.log(log.join('\n') || 'nothing to do');
}

function refit(){
  const R = require('./skill2_refit_2026_10_31.js'), LB = require('./lib_bramble.js'), CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'pipeline', 'config.json'), 'utf8'));
  const SHAPES = CFG.refit.themeShapes, MAXD = CFG.refit.maxStatPoints || 2, G = LB.G;
  const shapeOf = (A, H)=> SHAPES.findIndex(([lo, hi])=> (+A || 0) / Math.max(1, +H || 1) >= lo && (+A || 0) / Math.max(1, +H || 1) < hi);
  const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), out = [];
  for(const p of PLACE) for(const id of p.ids){
    const c = cards.find(x=> x.id === id), d = LB.CARD_DEFS_BASELINE[id], v = R.verdict(R.NEW, c);
    const row = {id, map:p.map, n:p.n, rarity:c.rarity, obtainMap:G.cardObtainMap(d), from:`${c.attack}/${c.health}`, verdictBefore:v.over ? 'over' : v.under ? 'under' : 'ok', useBefore:v.use, N:v.N, S:v.S};
    if(v.ok){ row.to = row.from; row.use = v.use; out.push(row); continue; }
    const A0 = c.attack, H0 = c.health, s0 = shapeOf(A0, H0); let alt = null;
    for(let da = -MAXD; da <= MAXD; da++) for(let dh = -MAXD; dh <= MAXD; dh++){
      const A = A0 + da, H = H0 + dh; if(H < 1 || (A0 >= 1 && A < 1) || shapeOf(A, H) !== s0) continue;
      const w = R.verdict(R.NEW, Object.assign({}, c, {attack:A, health:H})); if(!w.ok) continue;
      const cost = Math.abs(da) / Math.max(1, A0) + Math.abs(dh) / Math.max(1, H0);
      if(!alt || cost < alt.cost || (cost === alt.cost && (v.over ? w.use > alt.w.use : w.use < alt.w.use))) alt = {A, H, w, cost};
    }
    if(!alt){ row.to = row.from; row.held = 'no line within 2 a stat keeps the shape and the band'; out.push(row); continue; }
    row.to = `${alt.A}/${alt.H}`; row.use = alt.w.use; out.push(row);
    if(process.argv.includes('--apply')){ c.attack = alt.A; c.health = alt.H;
      c.creatorNote = (c.creatorNote || '') + ` Re-fit to the ${p.map} list (Map ${p.n}) budget term (CONTENT8): ${row.from} -> ${row.to} (cap-1 use ${row.useBefore} -> ${alt.w.use} of N ${alt.w.N}).`; }
  }
  if(process.argv.includes('--apply')) fs.writeFileSync(CARDS, pyDump(cards));
  out.forEach(r=> console.log(`${r.id.padEnd(17)} ${r.map} Map ${String(r.n).padEnd(2)} obtainMap ${r.obtainMap} ${r.rarity.padEnd(9)} ${r.from} (${r.verdictBefore}, use ${r.useBefore}, N ${r.N}) -> ${r.to}${r.use != null ? ' use ' + r.use : ''}${r.held ? ' HELD: ' + r.held : ''}`));
}
if(process.argv[2] === 'apply') apply(); else if(process.argv[2] === 'refit') refit();
else console.log('usage: node tools/content8_2026_11_02.js apply | refit [--apply]');
module.exports = {PLACE, FLAVOR};
