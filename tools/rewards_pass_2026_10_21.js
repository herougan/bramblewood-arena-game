#!/usr/bin/env node
// 2026-10-21 (package RP, the rewards and sources pass; owner Oct 21: "First pass edit on all the skirmish cards and their rewards. Be
// strict on what is a Skirmish reward (these CANNOT be pack rewards) and which are faction rewards ..."). Card SOURCE and placement only:
// never attack, health or effects (package BF5 re-derives the stats). docs/balance/rewards-pass-2026-10-21.md.
//   node tools/rewards_pass_2026_10_21.js plan    -> docs/balance/rewards-pass-2026-10-21.json (every move, checked: the fight exists,
//                                                    3 rewards a fight at most, the road's rarity cap); apply it with
//                                                    python3 tools/rewards_pass_apply_2026_10_21.py
//   node tools/rewards_pass_2026_10_21.js audit   -> every card's one category, and any card that sits in two
// The categories (owner Oct 21): a skirmish reward (source {kind:'map', id, node}), a pack card ({kind:'pack', tier 1 or 99}), a faction
// reward ({kind:'pack', tier:11, side}: in no pack, handed out by the faction reward track), or a raid / smith / nest / base / quest /
// secret / Easter egg / materia card, or awaitingSource (no source yet: the owner places it).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'balance', 'rewards-pass-2026-10-21.json');
const B = require('./lib_bramble.js'), G = B.G, MAPS = G.CONQUEST_MAPS;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const themes = (()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'unit-themes.json'), 'utf8')); }catch(e){ return {units: []}; } })();
const factionTag = Object.fromEntries((themes.units || []).map(u=> [u.id, u.faction]));
const byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const mapNo = id=>{ const m = MAPS.find(x=> x.id === id); if(!m) return null; return mains.indexOf(m.sub ? MAPS.find(x=> x.id === m.parent) : m); };

// ---- the categories
function category(c){
  if(c.pool) return 'pool';
  if(c.token || c.test) return 'token/test';
  if(c.easterEgg || (c.source && c.source.kind === 'easteregg')) return 'easteregg';
  const s = c.source;
  if(!s){ if(c.awaitingSource) return 'awaitingSource'; const k = G.cardSourceOf(c).kind; return k === 'base' ? 'base' : 'unsorted'; }
  if(s.kind === 'map') return s.node ? 'skirmish' : 'map-without-fight';
  if(s.kind === 'pack') return +s.tier === 11 ? 'faction' : 'pack';
  return s.kind; // raid, smith, nest, base, quest, secret, materia
}
// a card in two categories at once (the owner's "Audit and fix every overlap")
function overlaps(c){
  const s = c.source || {}, out = [];
  if(c.pool && c.source) out.push('a pool card with a source');
  if(c.awaitingSource && c.source) out.push('awaitingSource but has a source (' + s.kind + ')');
  if(c.basic && c.source && s.kind !== 'base') out.push('a basic (Base) card that is also a ' + s.kind + (s.kind === 'map' ? ' reward' : ' card'));
  if(c.easterEgg && s.kind !== 'easteregg') out.push('an Easter egg with a ' + s.kind + ' source');
  if(s.kind === 'map' && !s.node) out.push('a map source with no fight');
  if(s.kind === 'map' && s.node){ const m = MAPS.find(x=> x.id === s.id); if(!m || !m.nodes.some(n=> n.key === s.node)) out.push('a reward of a missing fight'); }
  if(s.kind === 'pack' && +s.tier === 11 && s.side && !['tribes', 'shared'].includes(s.side)) out.push('an unknown faction side ' + s.side);
  return out;
}

// ---- the plan
// can a player get it (the game's cardObtainableFrom, which lib_bramble doesn't export)
const obtainable = c=>{ if(c.easterEgg) return false; const s = G.cardSourceOf(c); if(['pack', 'base', 'raid', 'nest', 'smith', 'secret', 'quest'].includes(s.kind)) return true; return s.kind === 'map' && !!s.node && MAPS.some(m=> m.id === s.id && m.nodes.some(n=> n.key === s.node)); };
const MAP_AT = n=> mains[n].id;
// Gates (owner: "Devilry found in 66 and Ecclesia in 77. Evomax will be found in 30+."): no card of these lines is obtainable before.
const LINE_GATE = {devilry: 66, ecclesia: 77, evomax: 30};
const lineOf = c=>{ const ml = c.mechanicLine || '', a = c.archetypes || [], f = factionTag[c.id];
  if(ml === 'devilry' || f === 'ashen-choir' || a.includes('Devil')) return 'devilry';
  if(ml === 'grace' || f === 'ecclesia' || a.includes('Ecclesia')) return 'ecclesia';
  if(ml === 'evolution' || a.includes('Evomax')) return 'evomax';
  return null; };
// Faction rewards (owner: "most otters and hummingbirds are faction rewards"): the Otter / Hummingbird cards still elsewhere
const TO_FACTION = {'otter-angler': '', 'otter-riverguard': '', 'rivergate-drummer': '', 'pike-lancer': '', 'honeyjoe-brewer': 'tribes',
  'sunspire-envoy': 'tribes' /* a Hummingbird filed on the Otter side (no side) */};
// Maps 0-1 (owner: "Let's only give plain cards as rewards at the start." and "I want lumber to be naturally introduced in Map 1"):
// the fight each plain card goes to, and the one Lumber card
const TO_NODE = {'chipmunk-skirmisher': ['m1', '0-1'], 'house-cat': ['m1', '0-2'], 'farm-dog': ['m1', '0-3'], 'terrier-pup': ['m1', '0-4'],
  'dormouse': ['mf', '1-2'], 'harvest-mouse': ['mf', '1-3'], 'badger-lumberjack': ['mf', '1-4'], 'bramble-sprout': ['mf', '1-5'],
  'sandfish': ['md', '18-7'], 'pale-oryx': ['md', '18-7'], 'dust-devil-kestrel': ['md', '18-7'], 'stonedrop-vulture': ['md', '18-2']};
const PLAIN_LUMBER_OK = new Set(['badger-lumberjack']); // Map 1's one Lumber card (its only skill is Lumberjack)
// A main map for the rest (the fight with the most room under the cap), by theme
const TO_MAP = {
  // off Maps 0-1 (they have skills)
  'water-vole': 'm2', 'river-mink': 'm2', 'grass-snake': 'mw', 'owl-nightwatch': 'mu', 'pine-marten': 'mu', 'shepherds-bark': 'ml', 'hedgehog-scout': 'mh',
  // Clovermead's field card
  'spring-rain': 'mw',
  // Lilypad Reach (opens after Map 6): its ponds to the Sable Swampmire and the Kelp Mangroves
  'lotus-frog': 'm8', 'poison-dart-croaker': 'm8', 'camouflage-frog': 'm8', 'newt-doctor': 'm8', 'mayfly-dancer': 'm8', 'elder-tortoise': 'm8', 'minnow-skitter': 'mk', 'shallows-fry': 'mk',
  // Smugglers' Grotto (after Map 7): the sea to Coral Current, the cave to Caves & Alcoves, the moon to the Morel Hollow's night
  'sulfur-vent-crab': 'm7', 'riptide-eel': 'm7', 'voltaic-eel': 'm4', 'grotto-lobster': 'm4', 'full-moon': 'mu',
  // the Sunken Grove (after Map 9): its swamp to Gatorback Swamp and the Kelp Mangroves, the mole to the caves
  'grass-viper': 'mw', 'constrictor-coil': 'mw', 'venomlord-serpent': 'mw', 'mudpuppy': 'mk', 'baby-horned-capybara': 'mk', 'star-nosed-mole': 'm4',
  // the Mycelium Deep (after Map 11): to Caves & Alcoves and the Morel Hollow
  'vampire-bat': 'm4', 'gallery-orb-weaver': 'm4', 'nightshade-moth': 'm4', 'carrion-fly-swarm': 'm4', 'webspire-sentinel': 'm4', 'planarian-splitter': 'mu', 'gangrenous-leech': 'mk',
  // the Glimmer Depths (after Map 12)
  'cave-olm': 'm4',
  // the Sunken Depths (after Map 14): to Coral Current, its parent
  'colossal-squid': 'm7', 'kraken-spawnling': 'm7', 'lions-mane-jelly': 'm7', 'coral-reef-shark': 'm7', 'swordfish-spearman': 'm7',
  // the Aerie Vault (after Map 15): to Eyrie Heights, its parent
  'chipmunk-hoarder': 'm10', 'eyrie-warden': 'm10',
  // the Ice Hollow (after Map 21): to the Wolfsbane Tundra, its parent
  'glacial-ape-king': 'm6', 'snow-ermine': 'm6', 'spitting-spider': 'm6',
  // the Basalt Foundry (after Map 23): its fire (not its devils) to the Ashen Spurn, its parent
  'phoenix-fledgling': 'm3', 'cinder-stoker': 'm3', 'fire-salamander': 'm3', 'magma-titan': 'm3',
  // the Eye of the Volcano: to the Sundered Peak, its parent; the Volcano Lair's fire to the Rimefire Caldera (Map 22, a crater)
  'ashbone-ghoul': 'm11', 'ossuary-lammergeier': 'm11', 'cinder-skeleton': 'm11', 'pall-wraith': 'm11', 'magma-wraith': 'm11', 'basalt-boar': 'm11', 'magma-salamander': 'm11', 'ash-cloud-condor': 'm11',
  'cinder-hornet': 'm22', 'cinder-gecko': 'm22', 'ember-centipede': 'm22', 'gorge-wyrm': 'm22', 'pyroclast-wyrm': 'm22', 'ember-jackal': 'm22',
  // the Old Bramble's willow to the Redwood Deep; the Pale Desert's savanna animals to the Savanna Reaches
  'elder-willow': 'mr', 'rabid-jackal': 'm5', 'meerkat-burrower': 'm5', 'dust-hyena': 'm5',
};
// The basic pack pool (Hedgerow Pouch, Tidemire Chest, Highcrest Case): meadow and woodland commons with a skill, off Maps 0-1 and Clovermead
const TO_PACK = ['feral-tomcat', 'chipmunk-cavalry', 'robin-redbreast', 'amber-cicada', 'ladybird-guard', 'beetle-grunt', 'gatling-hog', 'stag-beetle',
  'pigeon-peon', 'clover-butterfly', 'field-crow', 'pill-bug', 'paper-wasp', 'puddle-hopper', 'jay-pilferer',
  'dam-wall', 'beaver-builder', 'lodge-engineer', 'pond-paddler', 'glimmer-spider'];
// Held (awaitingSource) for a map the road doesn't have yet (docs/map-recommendations-2026-10-21.md)
const RAIN = 'Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet)';
const HELD = {
  'thistle-baron': {map: 21, why: 'Map 1\'s boss leader (Thorns 2): no skills on Maps 0-1; proposed back as a Map 21+ "advanced" Thistle Baron reward'},
  'missingno': {map: 0, why: 'a hidden glitch card with a map but no fight (it could never be had); proposed as an Easter egg (EASTER_EGG_IDS)'},
  'ant-hill': {map: 26, why: 'the Mycelium Deep keeps one card; Map 26, the Ant Empire'}, 'swarm-matriarch': {map: 26, why: 'the Mycelium Deep keeps one card; Map 26, the Ant Empire'},
  'oilbird': {map: 29, why: 'the Glimmer Depths keep one card; Sonar is Map 29\'s (the Abyssal Plains)'},
  'glowing-gecko': {map: 33, why: 'the Pale Desert keeps one card; Irradiated is World 3\'s (Map 33, the Glowing Waste)'},
};
['toucan-courier', 'poison-dart-frog', 'velvet-worm', 'leaf-chameleon', 'strangler-vine', 'slowpoke-sentinel', 'aye-aye-prowler', 'hanging-loafer', 'canopy-sloth-guardian',
  'kinkajou-lurker', 'war-drum-mandrill', 'hercules-beetle', 'chilli-parrot', 'old-growth-tortoise', 'slow-loris'].forEach(id=> HELD[id] = {map: 25, why: RAIN});
const TO_BASE = {'meadow-frog': 'a basic (starter deck) card that was also 1-1\'s reward: Base only'};
// One unique reward a side map (owner: "1 unique card only per submap. Then using everything we already have."), its boss's card; and
// its gate (owner: "Submaps should also only be unlocked quite late in the game. Maybe like smuggler's groto after Map 7")
const SUBMAP_KEEP = {mq: 'lucky-hopper', mp: 'riverworks-bastion', mg: 'octopus-tactician', ms: 'hedgehog-herbalist', mz: 'rootworm-colony', mn: 'lantern-spark-fly',
  mj: 'blue-ringed-octopus', mv: 'wound-reaver', my: 'jaguar-stalker', mi: 'greenland-shark', m9: 'ember-revenant', me: 'the-contradiction', mx: 'fire-drake-hatchling',
  mo: 'ent', mpd: 'quicksand-queen', mtut: null};

function srcOfMove(id, why){
  const c = byId[id]; if(!c) throw new Error('no card ' + id);
  if(TO_FACTION[id] != null){ const side = TO_FACTION[id]; return {to: side ? {kind: 'pack', tier: 11, side} : {kind: 'pack', tier: 11}, group: 'faction'}; }
  if(TO_NODE[id]){ const [m, n] = TO_NODE[id]; return {to: {kind: 'map', id: m, node: n}, group: mapNo(m) <= 1 ? 'plain-start' : 'side-map'}; }
  if(TO_MAP[id]) return {to: {kind: 'map', id: TO_MAP[id], node: null}, group: 'map'};
  if(TO_PACK.includes(id)) return {to: {kind: 'pack', tier: 1}, group: 'pack'};
  if(HELD[id]) return {to: {awaitingSource: true}, held: HELD[id], group: 'held'};
  if(TO_BASE[id]) return {to: {base: true}, group: 'base', why: TO_BASE[id]};
  return null;
}
function plan(){
  const moves = [], used = {}; // fight -> rewards it gives after the moves
  const rewardsOf = (mid, key)=> cards.filter(c=> c.source && c.source.kind === 'map' && c.source.id === mid && c.source.node === key && c.cardType !== 'equipment').map(c=> c.id);
  MAPS.forEach(m=> (m.nodes || []).forEach(n=> used[m.id + ':' + n.key] = rewardsOf(m.id, n.key)));
  const leave = (c)=>{ const s = c.source; if(s && s.kind === 'map' && s.node){ const k = s.id + ':' + s.node; used[k] = (used[k] || []).filter(x=> x !== c.id); } };
  const add = []; // decided moves, applied in order
  // 1. the line gates (Devilry, Ecclesia, Evomax)
  cards.forEach(c=>{ if(c.test || c.token || c.easterEgg) return; const L = lineOf(c); if(!L) return; const obtain = G.cardObtainMap(c);
    if(!obtainable(c)) return; if(obtain >= LINE_GATE[L]) return;
    add.push({id: c.id, to: {awaitingSource: true}, group: L, held: {map: LINE_GATE[L], why: `${L === 'evomax' ? 'Evomax' : L[0].toUpperCase() + L.slice(1)} is found on Map ${LINE_GATE[L]}${L === 'evomax' ? '+' : ''} (owner Oct 21)`}}); });
  // 2. the tables
  const all = new Set([...Object.keys(TO_FACTION), ...Object.keys(TO_NODE), ...Object.keys(TO_MAP), ...TO_PACK, ...Object.keys(HELD), ...Object.keys(TO_BASE)]);
  all.forEach(id=>{ if(add.some(x=> x.id === id)) throw new Error(id + ' is in a line gate and a table'); const m = srcOfMove(id); add.push(Object.assign({id}, m)); });
  // 3. every side map keeps one reward: anything left on a side map that no table moves is an error
  MAPS.filter(m=> m.sub).forEach(m=>{ const keep = SUBMAP_KEEP[m.id];
    cards.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.cardType !== 'equipment').forEach(c=>{
      if(c.id === keep) return; if(!add.some(x=> x.id === c.id)) throw new Error(`${m.id}: ${c.id} has no move (keep ${keep})`); }); });
  // apply in order: leave first, then pick a fight for each "map" move
  add.forEach(x=> leave(byId[x.id]));
  const errs = [];
  add.forEach(x=>{
    const c = byId[x.id], from = c.source ? JSON.parse(JSON.stringify(c.source)) : null;
    if(x.to.kind === 'map'){
      const m = MAPS.find(y=> y.id === x.to.id); if(!m){ errs.push(x.id + ': no map ' + x.to.id); return; }
      const ok = n=> n.kind !== 'tutorial' && !/raidboss|megaraid/.test(n.kind || '') && (used[m.id + ':' + n.key] || []).length < 3 && (G.roadRarityOk(c.rarity, mapNo(m.id), n.kind) || (c.archetypes || []).includes('Leader'));
      let node = x.to.node ? m.nodes.find(n=> n.key === x.to.node) : null;
      if(x.to.node && (!node || !ok(node))){ errs.push(`${x.id}: ${x.to.id} ${x.to.node} is full or over the cap`); return; }
      if(!node){ const cands = m.nodes.filter(ok).sort((a, b)=> (used[m.id + ':' + a.key] || []).length - (used[m.id + ':' + b.key] || []).length); node = cands[0]; }
      if(!node){ errs.push(`${x.id}: no room on ${m.id}`); return; }
      x.to = {kind: 'map', id: m.id, node: node.key}; used[m.id + ':' + node.key].push(x.id);
    }
    const after = x.to.awaitingSource || x.to.base ? Object.assign({}, c, {source: undefined, awaitingSource: !!x.to.awaitingSource}) : Object.assign({}, c, {source: x.to});
    if(x.to.base) delete after.awaitingSource;
    moves.push({id: x.id, name: c.name, rarity: c.rarity, group: x.group, from, to: x.to.awaitingSource ? 'awaitingSource' : x.to.base ? 'base' : x.to,
      obtainBefore: G.cardObtainMap(c), obtainAfter: x.held ? 0 : G.cardObtainMap(after), held: x.held || undefined, plain: !Object.keys(c.effects || {}).length});
  });
  if(errs.length){ console.error(errs.join('\n')); process.exit(1); }
  const sub = {}; MAPS.filter(m=> m.sub).forEach(m=> sub[m.id] = {name: m.name, parent: m.parent, parentMap: mapNo(m.parent), opensAfter: m.entry && m.entry.afterMapCleared ? {id: m.entry.afterMapCleared, map: mapNo(m.entry.afterMapCleared)} : null, after: m.entry && m.entry.after, shieldMap: m.shieldMap != null ? m.shieldMap : null, keep: SUBMAP_KEEP[m.id] || null});
  const out = {about: 'Package RP (2026-10-21): every card source move of the rewards and sources pass. from/to are card sources; "awaitingSource" = no source yet (held for the map in held.map); obtainBefore/After = the map where it becomes obtainable (the stat budget\'s map term, Base + 0.2 x this; held cards keep their old one for the budget until placed). Apply with python3 tools/rewards_pass_apply_2026_10_21.py; made by node tools/rewards_pass_2026_10_21.js plan.',
    lineGates: LINE_GATE, plainLumberOk: [...PLAIN_LUMBER_OK], submaps: sub, moves};
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  const cnt = {}; moves.forEach(m=> cnt[m.group] = (cnt[m.group] || 0) + 1);
  console.log(moves.length, 'moves', JSON.stringify(cnt));
}
function audit(){
  const C = {}, bad = [];
  cards.forEach(c=>{ const k = category(c); C[k] = (C[k] || 0) + 1; const o = overlaps(c); if(o.length) bad.push(`${c.id}: ${o.join('; ')}`); });
  console.log(JSON.stringify(C)); console.log(bad.length ? bad.join('\n') : 'no overlaps');
}
module.exports = {obtainable, category, overlaps, lineOf, LINE_GATE, SUBMAP_KEEP, PLAIN_LUMBER_OK, mapNo};
if(require.main === module){ const cmd = process.argv[2] || 'audit'; if(cmd === 'plan') plan(); else audit(); }
