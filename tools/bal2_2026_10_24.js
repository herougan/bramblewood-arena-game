#!/usr/bin/env node
// Package BAL2 (2026-10-24): the balance pass's data steps. Each command prints what it would do; --apply writes it.
//   node tools/bal2_2026_10_24.js levels [--apply]   item 1: the skirmish editor's Enemy level on fights (all 57 set by LEAD, 2026-10-23,
//                                                    to hold the battle rating when a leader was added) re-based on the new schedule:
//                                                    new = old + (new schedule - old schedule), so LEAD's offset is kept
//   node tools/bal2_2026_10_24.js decks [--apply]    item 2: enemy decks over the copy ladder (RARITY_MAX_COPIES) and item 3's Rare rule;
//                                                    see DECK_FIXES (hand-picked swaps, theme kept) and the battle rating before / after
//   node tools/bal2_2026_10_24.js table              enemy levels per fight, Maps 0-24 and the side maps (old schedule -> new)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js'), G = B.G;
const APP = path.join(ROOT, 'arena_app.js');
const APPLY = process.argv.includes('--apply');
const cmd = process.argv[2] || 'table';
const r2 = v=> Math.round(v * 100) / 100;

// The schedule before BAL2 (BF3, 2026-10-19), for the re-base: Maps 1-4 Lv 1, Maps 5-9 1 -> 2, then +0.2 a map from Map 10; a boss 2 maps on.
function oldSchedule(node){
  const map = G.mapOfNode(node); if(!map) return null;
  let no = G.fightMapNumber(node); if(!Number.isFinite(no)) return null;
  if(/^(boss|finalboss|worldboss)$/.test(node.kind || '')) no += 2;
  if(map.endless && !map.tower && node.floor > 1) no += (node.floor - 1) * G.ENDLESS_FLOOR_CURVE.floorMaps;
  const L = no < 1 ? 0 : no <= 4 ? 1 : no < 10 ? Math.min(2, 1 + (no - 5) / 4) : 2 + (no - 10) * 0.2;
  return Math.min(10, r2(L));
}
function newSchedule(node){ const ov = node.enemyLevel; delete node.enemyLevel; try{ return G.roadEnemyLevelExact(node); } finally { if(ov !== undefined) node.enemyLevel = ov; } }
function allFights(){ const out = []; G.CONQUEST_MAPS.forEach(m=> (m.nodes || []).forEach(n=>{ if(n.deck && n.kind !== 'tutorial'){ G.NODE_MAP_HINT.set(n, m.id); out.push({m, n}); } })); return out; }

if(cmd === 'levels'){
  let src = fs.readFileSync(APP, 'utf8'); const rows = [];
  allFights().forEach(({m, n})=>{
    if(n.enemyLevel == null || n.enemyLevel === '') return;
    // LEAD's offset kept as STRENGTH, not as levels: stats only move at Lv 4, 7 and 10 (FORGE_MEAN_GAIN), so the new override is the highest
    // level (in 0.05 steps, at most the new schedule's) whose mean stat gain is the new schedule's gain minus LEAD's cut (gain(old schedule) -
    // gain(old override)). Where the schedule's strength did not move, the override stays; where it climbed (Lv 3 -> 4), the fight climbs too.
    const o = oldSchedule(n), nw = newSchedule(n), was = Number(n.enemyLevel), gn = G.gainOfLevel;
    const want = gn(nw) - Math.max(0, gn(o) - gn(was)); let to = nw; while(to > 0 && gn(to) > want + 0.008 /* a gain within 0.8% counts as the same: Lv 1-3 differ by 1.2% */) to = r2(to - 0.05); to = Math.max(0, r2(to));
    rows.push({fight: n.code || n.key, map: m.id, kind: n.kind, oldSchedule: o, newSchedule: nw, was, to});
    if(APPLY && to !== was){
      const re = new RegExp('(\\{ key:"' + n.key.replace(/[-]/g, '\\-') + '"[^\\n]*?enemyLevel:)' + String(was).replace('.', '\\.') + '( /\\* 2026-10-23 \\(LEAD\\): leader, BR and win rate kept)');
      if(!re.test(src)){ console.log('  could not find', n.key); return; }
      src = src.replace(re, `$1${to}$2; 2026-10-24 (BAL2): re-based on the new level schedule, ${was} -> ${to}`);
    }
  });
  rows.forEach(r=> console.log(`${r.fight.padEnd(8)} ${r.kind.padEnd(9)} schedule ${r.oldSchedule} -> ${r.newSchedule}   Enemy level ${r.was} -> ${r.to}`));
  if(APPLY){ fs.writeFileSync(APP, src); console.log('written', rows.length); }
}

if(cmd === 'table'){
  G.CONQUEST_MAPS.forEach(m=>{ if(m.endless || m.tower || m.reserved) return; const f = G.roadCurveFights(m); if(!f.length) return;
    f.forEach(n=> G.NODE_MAP_HINT.set(n, m.id));
    console.log(`${String(G.mapNumberOf(m.id)).padStart(2)} ${m.sub ? '(side ' + m.id + ')' : m.id} ` + f.map(n=> `${n.code || n.key}:${oldSchedule(n)}->${G.roadEnemyLevelExact(n)}`).join(' ')); });
}

// Items 2 and 3: the decks to fix, by fight key: {deck changes (a card -> its new count, 0 = out), why}. Hand-picked: an excess copy goes to a
// card already in the deck (same theme), a Rare that may not be there yet goes to the map pool's nearest Uncommon in role and theme.
const DECK_FIXES = {
  // item 2: over the copy ladder (Common 5, Uncommon 4, Rare 3, Very Rare 2, above 1)
  '22-5':  {set: {'cinder-hornet': 5, 'cinder-gecko': 4}, why: 'Cinder Hornet (Common) 7 -> 5; Cinder Gecko 2 -> 4'},
  '7-A-2': {set: {'wolf-spider-mother': 3, 'dung-beetle': 4}, why: 'Wolf Spider Mother (Rare) 4 -> 3; Dung Beetle 3 -> 4'},
  '20-B-4': {set: {'fire-drake-hatchling': 1, 'ember-jackal': 3}, why: 'Fire Drake Hatchling (Heroic) 2 -> 1; Ember Jackal 2 -> 3'},
  '8-A-3': {set: {'swarm-matriarch': 3, 'sulfur-cinder-moth': 3}, why: 'Swarm Matriarch (Rare) 4 -> 3; Sulfur Cinder Moth 2 -> 3'},
  '17-A-1': {set: {'arctic-fox-raider': 3, 'snow-ermine': 3}, why: 'Arctic Fox Raider (Rare) 4 -> 3; Snow Ermine 2 -> 3'},
  '17-A-3': {set: {'lone-grey-wolf': 2, 'harp-seal-pup': 4}, why: 'Lone Grey Wolf (Very Rare) 3 -> 2; Harp Seal Pup 3 -> 4'},
  // item 3 (owner 10-23 22:23 #2: "For Map 5, the rare is the boss's leader. Normal skirmish rares only start coming in Map 10 onwards (gently)")
  '5-4':  {set: {'alligator-gar': 0, 'moat-snapper': 1}, why: 'Map 5: the Alligator Gar (Rare) is the boss\'s leader only; a Moat Snapper (Uncommon turtle) instead'},
  '5-5':  {set: {'alligator-gar': 0, 'crocodile-ambusher': 2, 'caiman-hatchling': 4}, why: 'Map 5: Alligator Gar out (the boss\'s leader only); 2 Crocodile Ambushers (one leads the slide) for it and a Caiman Hatchling'},
  '5-6':  {set: {'alligator-gar': 0, 'moat-snapper': 2, 'snapper-hatchling': 4}, why: 'Map 5: Alligator Gar out; 2 Moat Snappers (one leads the bog) for it and a Snapper Hatchling'},
  '6-4':  {set: {'adder-ambusher': 0, 'raven-scout': 0, 'cane-toad': 2, 'booming-bittern': 1, 'marsh-wisp': 3}, why: 'Map 6 skirmish: no Rare before Map 10; Adder Ambusher -> 2 Cane Toads (one leads, for a Marsh Wisp), Raven Scout -> Booming Bittern'},
  '7-3':  {set: {'wolf-spider-mother': 0, 'bombardier-beetle': 2, 'leafcutter-gardener': 4}, why: 'Map 7 skirmish: Wolf Spider Mother -> 2 Bombardier Beetles (one leads, for a Leafcutter Gardener)'},
  '8-4':  {set: {'echo-screecher': 0, 'giant-cave-huntsman': 0, 'vampire-bat': 4, 'baby-bat': 1, 'subterraneaner': 2, 'blind-cave-fish': 3}, why: 'Map 8 skirmish: Echo Screecher x2 -> Vampire Bat +1 and a Baby Bat; Giant Cave Huntsman -> 2 Subterraneaners (one leads, for a Blind Cave Fish)'},
  '8-5':  {set: {'echo-screecher': 0, 'giant-cave-huntsman': 0, 'vampire-bat': 3, 'ghost-crayfish': 2, 'sulfur-cinder-moth': 4}, why: 'Map 8 skirmish: Echo Screecher -> Vampire Bat +1; Giant Cave Huntsman -> 2 Ghost Crayfish (one leads, for a Sulfur Cinder Moth)'},
  '8-6':  {set: {'echo-screecher': 0, 'giant-cave-huntsman': 0, 'vampire-bat': 3, 'millipede-hauler': 2, 'stalactite-golem': 4}, why: 'Map 8 skirmish: Echo Screecher -> Vampire Bat +1; Giant Cave Huntsman -> 2 Millipede Haulers (one leads, for a Stalactite Golem)'},
  '9-3':  {set: {'mangrove-kingfisher': 0, 'sunbittern-strider': 2, 'minnow-skitter': 2}, why: 'Map 9 skirmish: Mangrove Kingfisher (Rare, 9-6\'s reward) -> 2 Sunbittern Striders (diving birds, one leads, for a Minnow Skitter)'},
  '9-4':  {set: {'mangrove-manatee': 0, 'mudflat-godwit': 1}, why: 'Map 9 skirmish: Mangrove Manatee -> Mudflat Godwit (Tide); the Archerfish leads'},
  // gently from Map 10: a skirmish holds Rares, not a Very Rare, before Map 15 (roadSkirmishCap)
  '10-5': {set: {'colossal-squid': 0, 'bloodscent-shark': 2, 'kraken-spawnling': 4}, why: 'Map 10 skirmish: Colossal Squid (Very Rare) -> 2 Bloodscent Sharks (for a Kraken Spawnling); the Swordfish Spearman (Rare) leads'},
  '13-4': {set: {'shimmerwing-stag': 0, 'woodpecker-sapper': 2, 'fox-kit': 4}, why: 'Map 13 skirmish: Shimmerwing Stag (Very Rare) -> 2 Woodpecker Sappers (for a Fox Kit); the Bramblewood Lynx (Rare) leads'},
};
if(cmd === 'decks'){
  let src = fs.readFileSync(APP, 'utf8'); const out = [];
  const D = G.getCardDefs();
  Object.entries(DECK_FIXES).forEach(([key, fx])=>{
    const hit = allFights().find(({n})=> n.key === key); if(!hit){ console.log('no fight', key); return; }
    const {m, n} = hit, deck = Object.assign({}, n.deck); Object.entries(fx.set).forEach(([id, k])=>{ if(k > 0) deck[id] = k; else delete deck[id]; });
    const bad = Object.entries(deck).filter(([id, k])=> !D[id] || k > G.maxCopiesForRarity(D[id].rarity)); if(bad.length) console.log('  STILL OVER', key, bad);
    const t = Object.assign({}, n, {deck}); if(t.showcase && !deck[t.showcase]) delete t.showcase; G.NODE_MAP_HINT.set(t, m.id);
    const sum = d=> Object.values(d).reduce((a, b)=> a + b, 0);
    const row = {fight: n.code || key, map: m.id, kind: n.kind, copies: `${sum(n.deck)} -> ${sum(deck)}`, br: `${G.enemyDeckLevel(n)} -> ${G.enemyDeckLevel(t)}`, leader: `${(G.skirmishLeadersOf(n) || []).join('+')} -> ${(G.skirmishLeadersOf(t) || []).join('+')}`, why: fx.why};
    out.push(row); console.log(`${row.fight.padEnd(7)} ${row.kind.padEnd(9)} copies ${row.copies}  BR ${row.br}  leader ${row.leader}  ${fx.why}`);
    if(APPLY){
      const at = src.indexOf('{ key:"' + key + '"'); if(at < 0 || src.indexOf('{ key:"' + key + '"', at + 1) >= 0){ console.log('  not unique in arena_app.js', key); return; }
      const ds = src.indexOf('deck:{', at), de = src.indexOf('}', ds) + 1, line = src.indexOf('\n', at); if(ds < 0 || ds > line){ console.log('  no deck on the line', key); return; }
      const text = 'deck:' + JSON.stringify(deck).replace(/,/g, ',') + ` /* 2026-10-24 (BAL2): ${fx.why.replace(/\*\//g, '')} */`;
      src = src.slice(0, ds) + text + src.slice(de);
    }
  });
  if(APPLY){ fs.writeFileSync(APP, src); fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal2-decks-2026-10-24.json'), JSON.stringify({_about: 'Package BAL2 (2026-10-24): enemy decks fitted to the copy ladder (item 2) and the Rare rule (item 3: Map 5 only its boss\'s leader; normal skirmishes Rare from Map 10, no Very Rare before 15). BR = enemyDeckLevel (the leader counted).', rows: out}, null, 1) + '\n'); console.log('written'); }
}

module.exports = {oldSchedule, newSchedule};
