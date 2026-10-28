#!/usr/bin/env node
// Package CONTENT3 (2026-10-26): the card data of the content pass (docs/action-items.md 10-25 17:53 C1-C6, E14-E18, OWN-Q5 and 10-25
// 22:36 G3, G5). The rules these cards use are in bramblewood-engine.js (CONTENT3 blocks); the prices in canonical/skill-costs.json
// (tools/content3_skill_costs_2026_10_26.py); the map edits (first-clear cards, fields, the Hollow Oath-Keeper's decks) in
// tools/content3_maps_2026_10_26.py.
//   G5  a Sleep-immune card before 7-5: the Sleepless Shrew (Wakeful), a Morel Hollow (Map 7) pack card and 7-4's first-clear card.
//   C1  Map 5's first two fights pay a Cure card: the Marsh-mallow Hare (5-1) and the Sphagnum Vole (5-2), Gatorback Swamp pack cards.
//   C2  Otter faction anti-air before Map 3 / C3 the bird-catchers' tools as Otter cards: the Mist-net Otter (Reach + Web: no dodge, held),
//       the Clap-net Trapper (On Play: Magnet, every enemy Flyer grounded) and the Birdlime Dauber (Reach + Strangle: Bound, glued).
//       Faction cards (source tier 11, the Otter side): Commons come in the faction draws from Map 0.
//   C4  Storm-empowered cards (Storm: +2 Attack in a Thunderstorm, a strong wind or a Sandstorm): the Gale Swift (wind, Eyrie Heights,
//       Map 11) and the Static Fennec (static electricity, Dry, the Glass Dunes, Map 18).
//   C6  more Lumber and draw: the Muskrat Reedgatherer (Stockpile 2, Sunken Hollow, Map 4), the Peat-cutter Vole (On Ready +1 Lumber,
//       Sable Swampmire, Map 6), the Courier Pigeon (On Play: draw 1; an existing card that sat in no pool, now The Long Grass, Map 15) and the Magpie Collector (On Death: draw 1,
//       The Briar Maze, Map 12). No map pool held a draw card before.
//   E16 the Platform type (Structure rules for now: the card carries Structure too): the Mother Carrier (Heroic, Hummingbird Platform):
//       each round while Ready it launches a Laden Hummingbird (a token: Flying, two arrows a round, the "full load"), and Fletcher 1 (the
//       owner's "Arrow Master": its side's arrows +1). Awaiting a source (Heroic: Map 25 on the road ladder).
//   E17 the four-legged golem: the Granite Ox Golem (Rare): On Play stuns every unit but the enemy's last-played one; high Health, a
//       reasonable Attack, Wait 4, Recoil 2. An Ashen Spurn (Map 19) pack card.
//   G3  the Hollow Oath-Keeper leaves the Morel Hollow (Map 7) for The Redwood Deep (Map 13), an old-tree spirit among the old trees.
// Every new card sits on its formula line (the largest line on its Attack : Health shape inside both caps at Level 1 and its start level,
// tools/content2_2026_10_24.js's rule). Placeholder art: the emoji (prompts in docs/art/content3-2026-10-26-briefs.md).
//   node tools/content3_2026_10_26.js add     append (or reset) the cards, place them, move the Oath-Keeper     (idempotent)
//   node tools/forge_curve_2026_10_19.js maps                                     the Map term for the placed cards
//   node tools/content3_2026_10_26.js fit     the formula line for each new card
//   node tools/content3_2026_10_26.js check   exit 1 when a new card is over its budget or off its pool
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const CMD = process.argv[2] || 'check';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json');
const NOTE = '2026-10-26 (package CONTENT3) ';
const L = (on, n, res)=> ({on, do: 'gain', resource: res || 'lumber', amount: n});
const base = {locked: true, test: false, dmgType: 'physical', resist: [], tags: []};
const OTTER = {kind: 'pack', tier: 11};
const NEW = [
 // ---- G5 (owner 22:36: "7-5 is so difficult, I love it - except, there's no card awarded before that that's immune to Sleeping")
 {id: 'sleepless-shrew', name: 'Sleepless Shrew', icon: '🐭', cost: 0, wait: 1, attack: 2, health: 6, rarity: 'common', archetypes: ['Forest', 'Mouse'], species: ['Mammal'], animal: 'shrew',
  effects: {wakeful: true}, flavor: 'A shrew that sleeps starves by morning. This one stopped trying years ago, and the spores just make it sneeze.',
  place: ['mu', 2, 'The Morel Hollow (Map 7): Wakeful, the Sleep-immune card before 7-5\'s Spore Cloud (owner G5); 7-4\'s first-clear card']},
 // ---- C1 (owner #18: "When encountering swamp, first two skirmishes give something that cures units")
 {id: 'marsh-mallow-hare', name: 'Marsh-mallow Hare', icon: '🐇', cost: 0, wait: 1, attack: 1, health: 7, rarity: 'common', archetypes: ['Swamp', 'Rabbit'], species: ['Lagomorph'], animal: 'hare',
  effects: {cure: 1}, flavor: 'It chews the pink-flowered mallow at the water\'s edge, then breathes on whoever looks green.',
  place: ['mw', 1, 'Gatorback Swamp (Map 5): Cure 1 against Swamp Fever (owner C1); 5-1\'s first-clear card']},
 {id: 'sphagnum-vole', name: 'Sphagnum Vole', icon: '🐁', cost: 1, wait: 1, attack: 2, health: 8, rarity: 'common', archetypes: ['Swamp', 'Mouse'], species: ['Rodent'], animal: 'water vole',
  effects: {cure: 2}, flavor: 'It packs bog moss into every bite and scratch. The moss draws the poison out. Mostly.',
  place: ['mw', 1, 'Gatorback Swamp (Map 5): Cure 2 against Swamp Fever (owner C1); 5-2\'s first-clear card']},
 // ---- C2 / C3 (owner #18: "beginner otter faction cards gain 1 or 2 additional anti-air cards to deal with Gannet Cliffs"; "what is used
 //      in real life to hunt small birds? ... Glue traps and clap nets, corral trap, mist net, birdlime")
 {id: 'mist-net-otter', name: 'Mist-net Otter', icon: '🦦', cost: 0, wait: 1, attack: 2, health: 8, rarity: 'common', archetypes: ['Otter', 'River'], species: ['Mustelid'], animal: 'otter',
  effects: {reach: true, web: 1}, flavor: 'A net so fine you only see it when it is full. The Legion strings them between the reeds before every Gannet season.',
  faction: OTTER, why: 'Otter faction Common (C2, C3: Mist Net): Reach finds a Flyer through its dodge, Web 1 holds it (no dodge, no moving)'},
 {id: 'clap-net-trapper', name: 'Clap-net Trapper', icon: '🦦', cost: 0, wait: 1, attack: 2, health: 9, rarity: 'common', archetypes: ['Otter', 'Village'], species: ['Mustelid'], animal: 'otter',
  effects: {triggers: [{on: 'onSpawn', do: 'magnet', amount: 1, who: 'enemy', sub: 'all'}]}, flavor: 'Two poles, one net, one pull on the rope. Every bird on the patch comes down at once, and is very surprised about it.',
  faction: OTTER, why: 'Otter faction Common (C2, C3: Clap Net): On Play, Magnet 1 grounds every enemy Flyer for a round'},
 {id: 'birdlime-dauber', name: 'Birdlime Dauber', icon: '🦦', cost: 1, wait: 1, attack: 2, health: 10, rarity: 'uncommon', archetypes: ['Otter', 'River'], species: ['Mustelid'], animal: 'otter',
  effects: {reach: true, strangle: 1}, flavor: 'It boils holly bark into a glue and paints the branches. Whatever lands there stays.',
  faction: OTTER, why: 'Otter faction Uncommon (C3: Birdlime): Reach, and Strangle 1 binds what it hits (Bound: no Flying dodge, no moving, half damage)'},
 // ---- C4 (owner EN8-7: "STORM field effect ... creatures empowered by wind or empowered by electricity")
 {id: 'gale-swift', name: 'Gale Swift', icon: '🐦', cost: 0, wait: 0, attack: 2, health: 5, rarity: 'common', archetypes: ['Bird', 'Mountain'], species: ['Bird'], animal: 'swift',
  effects: {flying: true, storm: true}, flavor: 'It sleeps on the wing and eats on the wing, and when the storm comes in over the ridge it goes faster.',
  place: ['m10', 2, 'Eyrie Heights (Map 11), the windy heights and their Thunderstorm (11-1): Storm, wind-empowered (C4)']},
 {id: 'static-fennec', name: 'Static Fennec', icon: '🦊', cost: 1, wait: 1, attack: 3, health: 8, rarity: 'uncommon', archetypes: ['Desert', 'Fox'], species: ['Canid'], animal: 'fennec fox',
  effects: {dry: true, storm: true}, flavor: 'The sand in the wind charges its great ears. In a dust storm it crackles, and everything it touches jumps.',
  place: ['md', 3, 'The Glass Dunes (Map 18), the Sandstorm map: Storm (electricity-empowered) and Dry (it sees through the blinding Sandstorm) (C4)']},
 // ---- C6 (owner CONTENT2: "more lumber mechanics, more draw card mechanics ... we can reuse lumber gatherers")
 {id: 'muskrat-reedgatherer', name: 'Muskrat Reedgatherer', icon: '🦫', cost: 0, wait: 1, attack: 1, health: 7, rarity: 'common', archetypes: ['River', 'Beaver'], species: ['Rodent'], animal: 'muskrat',
  effects: {stockpile: 2}, flavor: 'It cuts reeds all night and stacks them into a house nobody asked for. Then it moves out and starts again.',
  place: ['m2', 1, 'Sunken Hollow (Map 4): no Lumber gatherer in its pool (C6); Stockpile 2']},
 {id: 'peat-cutter-vole', name: 'Peat-cutter Vole', icon: '🐁', cost: 0, wait: 1, attack: 1, health: 6, rarity: 'common', archetypes: ['Swamp', 'Mouse'], species: ['Rodent'], animal: 'vole',
  effects: {triggers: [L('onReady', 1)]}, flavor: 'Black peat, cut in neat bricks and dried on the hummocks. It burns slow, and the vole sells it dear.',
  place: ['m8', 1, 'Sable Swampmire (Map 6): no Lumber gatherer in its pool (C6); On Ready +1 Lumber']},
 {id: 'magpie-collector', name: 'Magpie Collector', icon: '🐦', cost: 1, wait: 1, attack: 2, health: 6, rarity: 'uncommon', archetypes: ['Bird', 'Forest'], species: ['Bird'], animal: 'magpie',
  effects: {flying: true, triggers: [{on: 'onDeath', do: 'drawCard', count: 1}]}, flavor: 'Its nest in the hedge is full of buttons, rings and keys. When it falls, somebody finds the nest.',
  place: ['mh', 2, 'The Briar Maze (Map 12), the hedges: no map pool held a draw card (C6); On Death draw 1']},
 // ---- E16 (owner #22: "Platform: new type of card, for now, identical to structure ... Mother Carrier - for hummingbirds, Heroic ...
 //      Hummingbirds fly out from this carrier with full loads, + arrow-master ... boosts arrow damage")
 {id: 'mother-carrier', name: 'Mother Carrier', icon: '🛳️', cost: 3, wait: 3, attack: 0, health: 30, rarity: 'heroic', archetypes: ['Hummingbird', 'Platform', 'Structure'], species: ['Bird'], animal: 'hummingbird', subtype: 'structure',
  effects: {fletcher: 1, triggers: [{on: 'perTurn', do: 'spawnCard', defId: 'laden-hummingbird', count: 1, whenReady: true}]},
  flavor: 'A floating hive of woven reed and sunfeather. Every morning its hatches open and the sky fills with little archers, quivers full.',
  propose: 'the Hummingbird faction pack from Map 25 (Heroic on the road ladder), or a Map 25+ reward (owner call CONTENT3-3)', source: {kind: 'pack', tier: 11, side: 'tribes'}},
 {id: 'laden-hummingbird', name: 'Laden Hummingbird', icon: '🐦', cost: 0, wait: 0, attack: 1, health: 2, token: true, archetypes: ['Hummingbird'], species: ['Bird'], animal: 'hummingbird',
  effects: {flying: true, arrow: 1, arrowCount: 2}, flavor: 'Two darts on its back, fresh off the carrier.', isToken: true},
 // ---- E17 (owner #25: "4 legged golem - following animal family ... stuns all units on play (except the one just played by the enemy),
 //      high health and reasonable attack because of its high wait, but has high recoil")
 {id: 'granite-ox-golem', name: 'Granite Ox Golem', icon: '🐂', cost: 2, wait: 4, attack: 4, health: 24, rarity: 'rare', archetypes: ['Volcanic', 'Ox'], species: ['Elemental'], animal: 'ox', subtype: 'construct',
  effects: {recoil: 2, triggers: [{on: 'onSpawn', do: 'stun', who: 'enemy', sub: 'all', everyone: true, count: 1}]},
  flavor: 'Four legs of cooled lava and a yoke nobody can lift. When it sets its hooves down, the whole field forgets what it was doing.',
  place: ['m3', 3, 'Ashen Spurn (Map 19), the scorched high ground: the four-legged golem (E17)']},
];
// G3 (owner 22:36: "Hollow Oath Keeper doesn't belong in Map 7."): an old-tree spirit, to the old trees
// C6: an existing draw card that sat in no pool (no source): the Courier Pigeon (On Play: draw 1) into The Long Grass's pool
const EXISTING = {'courier-pigeon': ['ml', 3, 'The Long Grass (Map 15), farm country: no map pool held a draw card (C6); its On Play draw 1 sat in no pool']};
const MOVE = {'hollow-oath-keeper': {from: 'mu', to: 'mr', tier: 2, why: 'The Redwood Deep (Map 13): an old-tree spirit that takes oaths, among the oldest trees (owner G3: "doesn\'t belong in Map 7")'}};

const load = ()=> JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const save = cs=> fs.writeFileSync(CARDS, JSON.stringify(cs, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const uuidOf = id=>{ const h = crypto.createHash('sha1').update('content3-2026-10-26:' + id).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`; };
function serializePools(d){ // the format tools/fold_map_pools.js writes (as tools/rw5_place_new_cards_2026_10_23.js)
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(d._about) + ',', ' "maps": {'], maps = Object.keys(d.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(d.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(subs.length){ lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}${j < subs.length - 1 ? ',' : ''}`)); lines.push('   },'); }
    else lines.push('   "submaps": {},');
    lines.push(`   "special": ${ids(m.special)}`, `  }${comma}`); });
  lines.push(' }', '}'); return lines.join('\n') + '\n';
}

function add(){
  const cs = load(), ids = new Set(NEW.map(c=> c.id));
  const keep = cs.filter(c=> !ids.has(c.id)), old = Object.fromEntries(cs.filter(c=> ids.has(c.id)).map(c=> [c.id, c]));
  let nid = Math.max(...keep.map(c=> c.numericId || 0)) + 1;
  for(const spec of NEW){
    const {place, propose, faction, why, isToken, source, ...c} = spec, prev = old[c.id];
    const card = Object.assign({}, base, c, {numericId: prev ? prev.numericId : nid++, uuid: uuidOf(c.id)});
    if(prev){ card.attack = prev.attack; card.health = prev.health; }
    if(isToken){ delete card.rarity; card.creatorNote = NOTE + 'the Mother Carrier\'s token (E16): Flying, Arrow 1 twice a round (the owner\'s "full loads"). Not obtainable.'; }
    else if(place){ card.source = {kind: 'pack', tier: place[1], map: place[0]}; card.creatorNote = NOTE + `placed in Pack ${place[1]}, ${place[0]}: ${place[2]}. Stats by the budget (fit).`; }
    else if(faction){ card.source = Object.assign({}, faction); card.creatorNote = NOTE + `${why}. Stats by the budget (fit).`; }
    else { delete card.source; card.awaitingSource = true; // no source until the owner places it (a faction source would let the faction draws give it now)
      card.creatorNote = NOTE + `awaiting a source, proposed: ${propose}. Stats by the budget (fit).`; }
    if(prev && prev.creatorNote && /Fit:/.test(prev.creatorNote)) card.creatorNote = prev.creatorNote;
    keep.push(card);
  }
  for(const c of keep){ const ex = EXISTING[c.id]; if(!ex) continue;
    if(!(c.source && c.source.map === ex[0])){ c.source = {kind: 'pack', tier: ex[1], map: ex[0]}; delete c.awaitingSource;
      c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + `(C6) placed in Pack ${ex[1]}, ${ex[0]}: ${ex[2]}.`; } }
  for(const c of keep){ const mv = MOVE[c.id]; if(!mv) continue;
    if(!(c.source && c.source.map === mv.to)){ c.source = {kind: 'pack', tier: mv.tier, map: mv.to}; c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + `(G3) moved ${mv.from} -> ${mv.to}: ${mv.why}.`; } }
  save(keep);
  const doc = JSON.parse(fs.readFileSync(POOLS, 'utf8'));
  Object.entries(EXISTING).forEach(([id, ex])=>{ const e = doc.maps[ex[0]] = normalizeEntry(doc.maps[ex[0]] || {}); if(!e.cards.includes(id)) e.cards.push(id); });
  NEW.filter(c=> c.place).forEach(c=>{ const e = doc.maps[c.place[0]] = normalizeEntry(doc.maps[c.place[0]] || {}); if(!e.cards.includes(c.id)) e.cards.push(c.id); });
  Object.entries(MOVE).forEach(([id, mv])=>{ const f = doc.maps[mv.from] = normalizeEntry(doc.maps[mv.from] || {}); f.cards = f.cards.filter(x=> x !== id);
    const t = doc.maps[mv.to] = normalizeEntry(doc.maps[mv.to] || {}); if(!t.cards.includes(id)) t.cards.push(id); });
  fs.writeFileSync(POOLS, serializePools(doc));
  console.log('cards:', NEW.length, 'new; numericIds', NEW.map(c=> c.id + ' ' + keep.find(x=> x.id === c.id).numericId).join(', '));
}
function budgetTools(){ const SC = require('./card_retune_2026_10_19.js').SC; const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'))); return {SC, T}; }
function use(SC, T, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return {ok: b1.ok && bs.ok && b1.x1 / b1.N <= 1, u: b1.x1 / b1.N, N: b1.N, S: b1.S}; }
function fit(){
  const {SC, T} = budgetTools(), cs = load(), rows = [];
  for(const spec of NEW){ if(spec.isToken) continue; const c = cs.find(x=> x.id === spec.id); if(!c) continue;
    const sA = spec.attack, sH = spec.health; let best = null;
    for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), r = use(SC, T, c, A, H);
      if(r.ok && (!best || r.u > best.u || (r.u === best.u && A + H > best.A + best.H))) best = {A, H, u: r.u, N: r.N, S: r.S}; }
    if(!best){ rows.push(`${c.id}: no legal line`); continue; }
    const was = `${c.attack}/${c.health}`; c.attack = best.A; c.health = best.H;
    c.creatorNote = c.creatorNote.replace(/ Fit: .*$/, '').replace(/ Stats by the budget \(fit\)\.$/, '') + ` Fit: the formula line on its ${sA}:${sH} shape, ${best.A}/${best.H} (${Math.round(best.u * 100)}% of N ${best.N}, S ${Math.round(best.S * 100) / 100}).`;
    rows.push(`${c.id.padEnd(22)} ${was.padStart(6)} -> ${best.A}/${best.H}  ${Math.round(best.u * 100)}% of N ${best.N}  S ${Math.round(best.S * 100) / 100}`); }
  save(cs); rows.forEach(r=> console.log(r));
}
function check(){
  const {SC, T} = budgetTools(), cs = load(), by = Object.fromEntries(cs.map(c=> [c.id, c])), doc = JSON.parse(fs.readFileSync(POOLS, 'utf8')); let bad = 0;
  for(const spec of NEW){ const c = by[spec.id]; if(!c){ console.log('missing', spec.id); bad++; continue; } if(spec.isToken) continue;
    const r = use(SC, T, c, c.attack, c.health); if(!r.ok){ console.log('over budget', spec.id, Math.round(r.u * 100) + '%'); bad++; }
    if(spec.place && !(doc.maps[spec.place[0]].cards || []).includes(spec.id)){ console.log('not in pool', spec.id); bad++; } }
  Object.entries(MOVE).forEach(([id, mv])=>{ if((doc.maps[mv.from].cards || []).includes(id) || !(doc.maps[mv.to].cards || []).includes(id) || (by[id].source || {}).map !== mv.to){ console.log('not moved', id); bad++; } });
  const n = cs.map(c=> c.numericId).filter(x=> x != null), dup = n.filter((x, i)=> n.indexOf(x) !== i); if(dup.length){ console.log('duplicate numericId', dup.join(',')); bad++; }
  console.log(bad ? `${bad} problem(s)` : `ok: ${NEW.length} new cards on budget, placed or awaiting; the Oath-Keeper moved`); process.exit(bad ? 1 : 0);
}
if(require.main === module){ if(CMD === 'add') add(); else if(CMD === 'fit') fit(); else check(); }
module.exports = {NEW, MOVE, EXISTING};
