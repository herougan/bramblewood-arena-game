#!/usr/bin/env node
// The thematic pass (2026-10-19, package TH; owner 00:19, the overnight plan: "reassign skirmishes based on thematics", with "5–10 new
// cards per map — from skirmish-only rewards and pack" from the candidate pool (docs/card-pool-2026-10-19.md); the owner said he'd pick,
// and asked for the overnight pass: so the choices are made here and written down, docs/thematic-pass-2026-10-19.md, so he can revert).
//
// Each map has an identity (its biome, its creatures, its factions, its field; docs/gameplay-ideas-2026-10-19.xlsx "Maps",
// docs/lore-bible.md): THEMES below. A card in a fight is on theme when it is a reward of that map's family (the map and its side maps),
// when it carries one of the map's theme types (archetypes / species), or when the map's spec allows it by id; else it is off theme.
// A spec can also name cards that are off theme there whatever their types (`ban`), or allowed only up to a few copies (`cap`).
//
//   node tools/thematic_pass_2026_10_19.js audit [--json]     every fight's off-theme cards (main maps 0-24 and the side maps)
//   node tools/thematic_pass_2026_10_19.js apply [--dry]      applies docs/balance/thematic-pass-2026-10-19.json: the pool cards placed
//        (pool flag off, the next live numericIds, a source: a skirmish reward node or the basic pack pool), the fights' deck swaps and
//        their new fields (rules), into canonical/cards.json and arena_app.js
//   node tools/thematic_pass_2026_10_19.js tunegi [--write]   measures package GI's example cards and steps them into their rarity band
// tools/skirmish_pass.js curve asks offThemeFor() before it moves a card into a fight, so a retune keeps the themes.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'arena_app.js'), CARDS = path.join(ROOT, 'canonical', 'cards.json');
const PLAN = path.join(ROOT, 'docs', 'balance', 'thematic-pass-2026-10-19.json'), PLACED = path.join(ROOT, 'docs', 'balance', 'thematic-placed-2026-10-19.json');
const argv = process.argv.slice(2), CMD = argv[0] || 'audit';
// canonical/cards.json is written by Python (json.dumps indent 2, ASCII escapes); the same bytes from Node
const writeCards = cards=> fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u0080-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');

// ---- each map's identity. tags: the archetypes / species that belong there; allow: cards allowed by id; ban: off theme whatever their
// types (e.g. the Badger Berserker outside the badger maps); cap: {id: [copies a fight, fights a map]}; fight: per-fight extra allows.
const THEMES = {
  m1:  {name: 'Bramblewood Outskirts: the Otter river bank, meadow and hedge', tags: ['River', 'Otter', 'Rabbit', 'Mouse', 'Duck', 'Fish', 'Ants', 'Worm', 'Raccoon', 'Field', 'Pond', 'Frog', 'Fox', 'Mustelid', 'Rodent'], fight: {'0-4': ['Frost']}, ban: ['badger-berserker']},
  mf:  {name: 'Thistlewood: hedgerow and woodland floor (beetles, mice, hedgehogs, foxes)', tags: ['Insect', 'Mouse', 'Rabbit', 'Hedgehog', 'Fox', 'Frog', 'Chipmunk', 'Beetle', 'Forest', 'Field', 'Flora', 'Bee', 'Otter', 'River', 'Rodent'], allow: ['quarry-mole'], ban: ['badger-berserker', 'duckling']},
  mb:  {name: 'Pebble Beach: shingle, rock pools and gulls', tags: ['Coastal', 'Ocean', 'Mangrove', 'Coral Reef', 'Otter', 'Turtle'], ban: ['mallard-marauder']},
  mc:  {name: 'Gannet Cliffs: sea cliffs (seabirds, goats, raptors)', tags: ['Mountain', 'Eagle', 'Vulture', 'Bird', 'Coastal'], cap: {'pelican-diver': [2, 2]}, ban: ['duck-paddler']},
  m2:  {name: 'Sunken Hollow: the flooded lowland (river and lake life, and what the flood brought in)', tags: ['River', 'Fish', 'Turtle', 'Beaver', 'Pond', 'Ocean', 'Cetacean', 'Cephalopod', 'Frog']},
  mw:  {name: 'Gatorback Swamp: gators, snakes, toads, Swamp Fever and Poison', tags: ['Swamp', 'Snake', 'Frog', 'Turtle', 'Reptile', 'Mangrove', 'Insect'], ban: ['open-ocean-hermit-crab', 'mallard-marauder', 'beaver-builder']},
  m8:  {name: 'Sable Swampmire: the night swamp of leeches, wisps and death value', tags: ['Swamp', 'Snake', 'Reptile', 'Shadow', 'Beetle', 'Worm', 'Frog', 'Newt', 'Raven'], ban: ['open-ocean-hermit-crab', 'mallard-marauder', 'beaver-builder']},
  mu:  {name: 'The Morel Hollow: fungus, grubs, spiders and moths', tags: ['Insect', 'Worm', 'Snail', 'Flora', 'Arachnid', 'Ants', 'Bee', 'Beetle', 'Newt'], ban: ['raccoon-nightcrew', 'trash-panda-trickster']},
  m4:  {name: 'Caves & Alcoves: bats, glowworms and the Hollow Kin in the dark', tags: ['Cave', 'Bat', 'Arachnid', 'Mole', 'Worm'], ban: ['honey-bee', 'swarm-matriarch', 'beetle-grunt']},
  mk:  {name: 'The Kelp Mangroves: roots, mudflats, Tidefolk', tags: ['Mangrove', 'Coastal', 'Fish', 'Ocean', 'Coral Reef', 'River', 'Reptile', 'Cephalopod', 'Bird'], ban: ['narwhal-lancer']},
  m7:  {name: 'Coral Current: the reef and its currents', tags: ['Coral Reef', 'Ocean', 'Fish', 'Cephalopod', 'Coastal', 'Cetacean', 'Turtle']},
  m10: {name: 'Eyrie Heights: the flight map (eagles, owls, condors, goats)', tags: ['Mountain', 'Eagle', 'Owl', 'Bird', 'Vulture', 'Chipmunk', 'Sheep'], ban: ['echo-keeper', 'quill-volley', 'quillguard']},
  mh:  {name: 'The Briar Maze: hedgehogs, porcupines, mice and the Greenhood Band', tags: ['Hedgehog', 'Porcupine', 'Mouse', 'Rabbit', 'Chipmunk', 'Flora', 'Fox', 'Raccoon', 'Badger', 'Forest', 'Bird'], allow: ['puddle-changeling']},
  mr:  {name: 'The Redwood Deep: bears, boars, deer and foxes in the high canopy', tags: ['Bear', 'Fox', 'Deer', 'Boar', 'Ape', 'Badger', 'Cat', 'Forest'], ban: ['shieldbearer-hound', 'border-collie', 'buzzed-chipmunk', 'parish-sergeant', 'bramblewood-macaque']},
  m5:  {name: 'Savanna Reaches: big game, cats and the Canopy\'s jungle', tags: ['Savanna', 'Rainforest', 'Elephant', 'Rhino'], ban: ['alley-cat', 'bramblewood-macaque']},
  ml:  {name: 'The Long Grass: knights, horses, hounds and road bandits', tags: ['Horse', 'Field', 'Village', 'Dog', 'Mouse', 'Rabbit', 'Raccoon', 'Bird', 'Eagle', 'Owl', 'Chipmunk'], ban: ['plains-zebra']},
  mt:  {name: 'The Pinewood Taiga: night forest of wolves, lynx and hares', tags: ['Taiga', 'Frost', 'Tundra', 'Wolf', 'Owl', 'Deer'], ban: ['shieldbearer-hound', 'war-hound', 'weredog', 'warren-scout', 'firetail-trickster']},
  m6:  {name: 'Wolfsbane Tundra: wolves, the cold, seals and the ice', tags: ['Tundra', 'Frost', 'Taiga', 'Wolf'], ban: ['beaver-builder', 'chipmunk-hoarder', 'chipmunk-forager', 'buzzed-chipmunk', 'porcupine-roller', 'harvest-mouse', 'dynamite-packrat', 'star-nosed-mole', 'war-hound', 'golden-eagle-diver']},
  md:  {name: 'The Glass Dunes: sand, glass, scorpions and lizards', tags: ['Desert', 'Savanna', 'Reptile', 'Arachnid', 'Volcanic'], ban: ['snapper-hatchling', 'grass-viper']},
  m3:  {name: 'Ashen Spurn: the badger and porcupine bastions, yetis and the ash', tags: ['Badger', 'Porcupine', 'Frost', 'Volcanic', 'Imp', 'Devil', 'Ape'], allow: ['echidna-quillshot', 'scraper-of-skies'], ban: ['beaver-builder', 'chipmunk-stockpiler']},
  m11: {name: 'The Sundered Peak: the Cave Warlord\'s bears and cavalry, the shrine and the volcano', tags: ['Bear', 'Ape', 'Volcanic', 'Horse', 'Imp', 'Mountain', 'Ecclesia', 'Rainforest'], allow: ['blessed-avatar', 'shrine-acolyte', 'fire-hawk', 'ancient-sloth-titan'], ban: ['beaver-lumberjack']},
  m21: {name: 'The Quiet Summit: goats, eagles, owls and the chapel, after the storm', tags: ['Mountain', 'Eagle', 'Owl', 'Bird', 'Ecclesia', 'Tundra', 'Taiga', 'Turtle'], allow: ['ash-cloud-condor'], ban: ['badger-berserker']},
  // the Long Burrow (the badgers' endless sett) is the Caldera's side map and opens here: its badgers belong
  m22: {name: 'The Rimefire Caldera: snow on black glass (frost and fire), and the Long Burrow\'s badgers', tags: ['Mountain', 'Volcanic', 'Frost', 'Tundra', 'Newt', 'Elemental', 'Deer', 'Bird', 'Badger']},
  m23: {name: 'The Goldfeather Siege: the Magnate\'s army before the walls', tags: ['Horse', 'Elephant', 'Savanna', 'Badger', 'Mouse', 'Structure', 'Turtle', 'Insect', 'Duck', 'Village', 'Bird', 'Chipmunk', 'Rhino', 'Beaver']},
  m24: {name: 'Goldfeather Keep: the Magnate\'s ducks, geese and herons', tags: ['Duck', 'Village', 'Bird', 'Ecclesia', 'King', 'Beaver', 'Owl', 'Structure'], allow: ['elderhorn-monarch'] /* the Treasury's trophy */},
  // side maps
  mq:  {name: 'Clovermead: a meadow of bees, mice and rabbits', tags: ['Rabbit', 'Mouse', 'Bee', 'Insect', 'Frog', 'Duck', 'Bird', 'Village', 'Field', 'Chipmunk', 'Cat', 'Dog', 'Flora'], ban: ['badger-berserker']},
  mp:  {name: 'Lilypad Reach: the river pond (frogs, ducks, beavers, pike)', tags: ['River', 'Pond', 'Frog', 'Duck', 'Fish', 'Beaver', 'Otter', 'Newt', 'Insect', 'Turtle', 'Bird'], ban: ['quill-volley']},
  mg:  {name: 'Smugglers\' Grotto: a sea cave of crabs and smugglers', tags: ['Coastal', 'Ocean', 'Cave', 'Raccoon', 'Otter', 'Volcanic', 'Cephalopod', 'Duck'], ban: ['quill-volley']},
  ms:  {name: 'The Sunken Grove: drowned swamp woods', tags: ['Swamp', 'Snake', 'Frog', 'Turtle', 'Reptile', 'Mangrove', 'Newt', 'Hedgehog', 'Mammal'], ban: ['open-ocean-hermit-crab', 'mallard-marauder']},
  mz:  {name: 'The Mycelium Deep: under the Morel Hollow', tags: ['Insect', 'Worm', 'Flora', 'Arachnid', 'Ants', 'Beetle', 'Snail', 'Swamp']},
  mn:  {name: 'The Glimmer Depths: the shining cave', tags: ['Cave', 'Bat', 'Arachnid', 'Insect', 'Fish', 'Bird']},
  mj:  {name: 'The Sunken Depths: the deep under the Current', tags: ['Ocean', 'Cephalopod', 'Coral Reef', 'Fish', 'Cetacean', 'Coastal']},
  mv:  {name: 'The Aerie Vault: the eyrie\'s stores', tags: ['Mountain', 'Eagle', 'Owl', 'Bird', 'Chipmunk'], allow: ['wound-reaver'], ban: ['echo-keeper']},
  my:  {name: 'The Canopy: the jungle above the savanna', tags: ['Rainforest', 'Ape', 'Sloth', 'Frog', 'Flora', 'Savanna', 'Insect', 'Bird']},
  mi:  {name: 'The Ice Hollow: under the tundra ice', tags: ['Tundra', 'Frost', 'Taiga', 'Wolf', 'Ape'], ban: ['chipmunk-hoarder', 'porcupine-roller', 'golden-eagle-diver', 'harvest-mouse', 'beaver-builder', 'dynamite-packrat', 'quill-volley']},
  m9:  {name: 'The Basalt Foundry: fire, forge and slag', tags: ['Volcanic', 'Imp', 'Devil', 'Insect', 'Beetle', 'Arachnid', 'Newt', 'Reptile', 'Structure', 'Boar', 'Elemental'], allow: ['beaver-lumberjack', 'chained-binturong', 'fruit-bat-familiar', 'flagellant-vulture', 'vampire-finch', 'tide-spirit', 'carrion-fly-swarm'], ban: ['echo-keeper', 'trapdoor-spider']},
  me:  {name: 'The Eye of the Volcano: the ossuary and the vents', tags: ['Volcanic', 'Imp', 'Devil', 'Shadow'], allow: ['blessed-avatar', 'cinder-skeleton', 'ossuary-lammergeier', 'pall-wraith', 'magma-wraith'], ban: ['echo-keeper', 'fungal-colossus']},
  mx:  {name: 'The Volcano Lair: the Caldera Wyrm\'s den', tags: ['Volcanic', 'Dragon', 'Reptile', 'Boar', 'Arachnid', 'Elemental', 'Imp'], allow: ['blessed-avatar', 'gorge-wyrm', 'ember-jackal']},
  // The Old Bramble is a come-back fight for after Map 17 (nodeMapNumber): the tundra's Glacier Wolf Packs that came south are its story
  mo:  {name: 'The Old Bramble: the first forest and its Ent, and the wolves that came south', tags: ['Otter', 'Rabbit', 'Duck', 'Fish', 'Raccoon', 'Ants', 'Flora', 'Forest', 'Structure', 'Frost']},
  mpd: {name: 'The Pale Desert', tags: ['Desert', 'Savanna', 'Reptile', 'Arachnid', 'Vulture', 'Bird', 'Insect']},
};
const SKIP_MAPS = new Set(['mtut', 'mm', 'mlb']); // the Tutorial's come-back fights are a mix on purpose; the endless dungeons are themed already

let B = null; const lib = ()=> B || (B = require('./lib_bramble.js'));
const familyOf = (MAPS, m)=>{ const main = m.sub ? MAPS.find(x=> x.id === m.parent) : m; return MAPS.filter(x=> x === main || (x.sub && x.parent === main.id)); };
function rewardFamily(G, MAPS, m){ const ids = new Set(); familyOf(MAPS, m).forEach(mm=> (mm.nodes || []).forEach(n=> G.nodeRewardCardIds(mm.id, n.key).forEach(id=> ids.add(id)))); return ids; }
function typesOf(d){ return [...(d.archetypes || []), ...(d.species || [])]; }
// Is card id on theme in fight node of map m? -> null (on theme) or the reason it is off theme
function offTheme(defs, MAPS, G, m, node, id, rewards){
  const spec = THEMES[m.id]; if(!spec) return null;
  const d = defs[id]; if(!d) return 'unknown card';
  if((spec.ban || []).includes(id)) return 'off theme here (' + (typesOf(d).join('/') || 'no type') + ')';
  if(rewards.has(id) || (spec.allow || []).includes(id)) return null;
  const tags = new Set([...(spec.tags || []), ...(((spec.fight || {})[node.key]) || [])]);
  if(typesOf(d).some(t=> tags.has(t))) return null;
  if(!typesOf(d).length && (d.rarity === 'starter')) return null;
  return 'no ' + spec.name.split(':')[0] + ' type (' + (typesOf(d).join('/') || 'no type') + ')';
}
function audit(){
  const {G, MAPS, CARD_DEFS_BASELINE: defs} = lib(), out = [];
  const BAL = {}; try{ JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/card-balance.json'), 'utf8')).rows.forEach(r=> BAL[r.id] = r.winRate); }catch(e){}
  for(const m of MAPS){ if(m.reserved || m.tower || SKIP_MAPS.has(m.id) || !THEMES[m.id]) continue;
    const rewards = rewardFamily(G, MAPS, m), spec = THEMES[m.id], capUse = {};
    for(const n of m.nodes){ if(!n.deck || !Object.keys(n.deck).length || n.kind === 'raidboss' || n.kind === 'tutorial') continue;
      const off = [];
      for(const [id, k] of Object.entries(n.deck)){
        let why = offTheme(defs, MAPS, G, m, n, id, rewards);
        const cap = (spec.cap || {})[id];
        if(!why && cap){ capUse[id] = (capUse[id] || 0) + 1; if(k > cap[0] || capUse[id] > cap[1]) why = `capped on this map (${cap[0]} copies in up to ${cap[1]} fights)`; }
        if(why) off.push({id, name: (defs[id] || {}).name || id, k, rarity: (defs[id] || {}).rarity, strength: BAL[id], why});
      }
      out.push({map: m.id, mapNo: G.mapNumberOf(m.id), side: !!m.sub, key: n.key, kind: n.kind || 'skirmish', name: n.name, off});
    } }
  return out;
}
if(require.main === module && CMD === 'audit'){
  const a = audit();
  if(argv.includes('--json')){ console.log(JSON.stringify(a, null, 1)); }
  else { let n = 0; a.forEach(f=>{ if(!f.off.length) return; n++; console.log(`${f.key.padEnd(8)} ${f.map.padEnd(4)} ${f.kind.padEnd(9)} ${f.name}: ` + f.off.map(o=> `${o.k}x ${o.name} [${o.rarity} ${o.strength}] (${o.why})`).join('; ')); });
    console.log(n, 'fights with off-theme cards of', a.length); }
}

// ---- apply the plan
// The plan (docs/balance/thematic-pass-2026-10-19.json):
//   place:  [{id, slot:'skirmish'|'pack', node?:'7-3' (a skirmish reward: that fight of the card's poolMap family), map?}]
//   fights: [{map, key, out:{id:k}, in:{id:k}, rules:{...} (merged into the node's rules), why}]
function readPlan(){ return JSON.parse(fs.readFileSync(PLAN, 'utf8')); }
// The next live card number the way the Admin's placement gives it (nextNumericId: the highest live numericId + 1; pool numbers 9001+
// don't count because the game never loads pool cards).
function placeCards(cards, plan, MAPS){
  let next = Math.max(...cards.filter(c=> !c.pool).map(c=> +c.numericId || 0)) + 1; const log = [], placed = [];
  for(const p of plan.place){
    const c = cards.find(x=> x.id === p.id); if(!c) throw new Error('no card ' + p.id);
    if(!c.pool){ log.push(`${p.id}: already live (#${c.numericId})`); continue; }
    const mapId = p.map || c.poolMap;
    if(p.slot === 'pack') c.source = {kind: 'pack', tier: 1};
    else { const fam = familyOf(MAPS, MAPS.find(m=> m.id === mapId)), host = fam.find(mm=> mm.nodes.some(n=> n.key === p.node));
      if(!host) throw new Error(`${p.id}: no fight ${p.node} on ${mapId}`); c.source = {kind: 'map', id: host.id, node: p.node}; }
    const was = c.numericId; c.numericId = next++;
    placed.push({id: c.id, name: c.name, rarity: c.rarity, poolNo: was, numericId: c.numericId, poolMap: c.poolMap, poolSlot: c.poolSlot, source: c.source, why: p.why || ''});
    const where = p.slot === 'pack' ? 'the basic packs (pack pool 1: Hedgerow Pouch, Tidemire Chest, Highcrest Case)' : `the ${p.node} reward`;
    c.creatorNote = (c.creatorNote || '') + ` 2026-10-19 (package TH, thematic pass): placed from the pool (pool #${was}) as ${where}` + (p.why ? `: ${p.why}` : '') + '.';
    delete c.pool; delete c.poolMap; delete c.poolSlot;
    log.push(`${p.id}: #${was} -> #${c.numericId}, ${where}`);
  }
  log.placed = placed; return log;
}
// rules literal for a node line: JS object text like {ashRain:true, volcano:"low"}
function rulesText(r){ return '{' + Object.entries(r).map(([k, v])=> `${k}:${JSON.stringify(v)}`).join(', ') + '}'; }
function editFights(src, plan, MAPS){
  const log = [];
  for(const f of plan.fights){
    const m = MAPS.find(x=> x.id === f.map), node = m && m.nodes.find(n=> n.key === f.key); if(!node) throw new Error('no fight ' + f.map + ' ' + f.key);
    const re = new RegExp(`(\\{ ?key:\\s*['"]${f.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`), mm = src.match(re); if(!mm) throw new Error('no line ' + f.key);
    let line = mm[1];
    if(f.out || f.in || f.deck){
      const deck = f.deck ? Object.assign({}, f.deck) : Object.assign({}, node.deck);
      if(!f.deck){ Object.entries(f.out || {}).forEach(([id, k])=>{ if(!deck[id] || deck[id] < k) throw new Error(`${f.key}: has ${deck[id] || 0} ${id}, can't take out ${k}`); deck[id] -= k; if(!deck[id]) delete deck[id]; });
        Object.entries(f.in || {}).forEach(([id, k])=>{ deck[id] = (deck[id] || 0) + k; }); }
      line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(deck)); node.deck = deck;
    }
    if(f.rules){
      const merged = Object.assign({}, node.rules || {}, f.rules); Object.keys(merged).forEach(k=> merged[k] === null && delete merged[k]);
      if(/rules:\{[^}]*\}/.test(line)) line = line.replace(/rules:\{[^}]*\}/, 'rules:' + rulesText(merged));
      else line = line.replace(/deck:/, 'rules:' + rulesText(merged) + ', deck:');
      node.rules = merged;
    }
    if('shieldOverride' in f){ if(f.shieldOverride == null) line = line.replace(/,? ?shieldOverride:\d+/, ''); else line = /shieldOverride:\d+/.test(line) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + f.shieldOverride) : line.replace(/deck:/, `shieldOverride:${f.shieldOverride}, deck:`); }
    if(line !== mm[1]){ src = src.replace(mm[1], line); log.push(f.key); }
  }
  return {src, log};
}
if(require.main === module && CMD === 'apply'){
  const plan = readPlan(), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
  const {MAPS} = lib();
  const pl = placeCards(cards, plan, MAPS);
  const ed = editFights(fs.readFileSync(APP, 'utf8'), plan, MAPS);
  console.log(pl.join('\n')); console.log('fights edited:', ed.log.length);
  if(!argv.includes('--dry')){ writeCards(cards); fs.writeFileSync(APP, ed.src);
    if(pl.placed.length) fs.writeFileSync(PLACED, JSON.stringify({note: 'Package TH (2026-10-19): the pool cards the thematic pass placed, with the pool number, map and slot each had (the card itself drops its pool fields, as the Admin placement does).', placed: pl.placed}, null, 1) + '\n');
    console.log('written'); }
}
// For the curve tuner (tools/skirmish_pass.js themedPool): may a fight on this map take this card in? Not when it is off the map's
// theme, nor when the map caps it (the Pelican Divers on Gannet Cliffs), so a retune never brings the drift back.
const _rew = {};
function offThemeFor(mapId, node, id){
  const {G, MAPS, CARD_DEFS_BASELINE: defs} = lib(), m = MAPS.find(x=> x.id === mapId), spec = THEMES[mapId]; if(!m || !spec) return null;
  if((spec.cap || {})[id]) return 'capped on this map';
  return offTheme(defs, MAPS, G, m, node || {key: '?'}, id, _rew[mapId] || (_rew[mapId] = rewardFamily(G, MAPS, m)));
}
// ---- tunegi: the package GI example cards were never measured ("the balance phase does that"); at their printed stats every one of
// them won 88-100% on card_balance.js's yardstick (8 copies + filler, 120 games), far over its rarity band. Before they are placed,
// each steps down (Attack first, then Health in ~10% steps) until it lands inside its band, the way card_balance.js --suggest steps.
//   node tools/thematic_pass_2026_10_19.js tunegi [ids] [--write]   prints (and with --write sets) the stats
const GI_IDS = ['fen-mink', 'tidepool-trapper-crab', 'grave-grin-hyena', 'bogfire-newt', 'plague-gnat-cloud', 'glasswing-moth', 'rivergate-drummer', 'frostmoon-howler', 'chapel-tortoise', 'weathervane-swift'];
if(require.main === module && CMD === 'tunegi'){
  const E = require(path.join(ROOT, 'bramblewood-engine.js')), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), RAW = {}, defs = {};
  cards.forEach(c=>{ RAW[c.id] = c; const d = Object.assign({effects: {}}, c); delete d.art; defs[c.id] = d; });
  const FILLER = ['warren-scout', 'fawn-scout', 'bee-sentry', 'mouse-sapper', 'poison-dart-croaker']; // card_balance.js's yardstick, as measured on 2026-10-09
  FILLER.forEach(id=>{ const d = Object.assign({effects: {}}, RAW[id]); delete d.art; d.effects = Object.assign({}, d.effects); ['swimmer', 'tailwind', 'headwind', 'darksight', 'dry'].forEach(k=> delete d.effects[k]); defs[id] = d; });
  const fillerDeck = n=>{ const d = {}; for(let i = 0; i < n; i++){ const id = FILLER[i % FILLER.length]; d[id] = (d[id] || 0) + 1; } return d; }, OPP = fillerDeck(20);
  const BANDS = {common: [.35, .60], uncommon: [.45, .68], rare: [.52, .75], veryrare: [.56, .80]}, G = 120;
  const winRate = (id, over)=>{ const D = Object.assign({}, defs, {[id]: Object.assign({}, defs[id], over)}), k = [8, 6, 4, 3][Math.min(3, defs[id].cost || 0)];
    const deck = fillerDeck(20 - k); deck[id] = (deck[id] || 0) + k; let w = 0;
    for(let g = 0; g < G; g++){ const r = E.simulateOneMatch(D, g % 2 ? deck : OPP, g % 2 ? OPP : deck, {rnd: E.mulberry32(7700 + g * 131), maxRounds: 60, battleMode: 'open'}); w += r.winner === (g % 2 ? 1 : 2) ? 1 : r.winner === 0 ? .5 : 0; }
    return Math.round(w / G * 1000) / 10; };
  const ids = argv.slice(1).filter(a=> !a.startsWith('--')); const out = [];
  for(const id of (ids.length ? ids : GI_IDS)){ const d = defs[id], [lo, hi] = BANDS[d.rarity].map(x=> x * 100), mid = (lo + hi) / 2; let a = d.attack, h = d.health, wr = winRate(id, {}); const trail = [[a, h, wr]];
    // Attack down while the next step stays inside the band's floor (Attack 2 -> 1 is a cliff on most cards), then Health in ~8% steps
    while(wr > hi - 3 && a > 1){ const w = winRate(id, {attack: a - 1, health: h}); trail.push([a - 1, h, w]); if(w < lo + 2) break; a--; wr = w; }
    while(wr > hi - 3 && h > Math.ceil(d.health * .4)){ const h2 = Math.max(1, Math.min(h - 1, Math.round(h * .92))), w = winRate(id, {attack: a, health: h2}); trail.push([a, h2, w]); if(w < lo + 2) break; h = h2; wr = w; }
    out.push({id, rarity: d.rarity, from: [d.attack, d.health], to: [a, h], winRate: wr, band: [lo, hi], trail}); console.log(id, d.rarity, d.attack + '/' + d.health, '->', a + '/' + h, wr + '%', JSON.stringify(trail)); }
  if(argv.includes('--write')){ out.forEach(o=>{ const c = cards.find(x=> x.id === o.id); if(o.to[0] === c.attack && o.to[1] === c.health) return;
      c.creatorNote = (c.creatorNote || '') + ` 2026-10-19 (package TH): measured before placing it, ${o.trail[0][2]}% at ${c.attack}/${c.health} (over the ${o.rarity} band ${o.band[0]}-${o.band[1]}%); now ${o.to[0]}/${o.to[1]}: Measured ${o.winRate}% over ${G} games (card_balance.js yardstick).`;
      c.attack = o.to[0]; c.health = o.to[1]; });
    writeCards(cards); fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'thematic-gi-tune-2026-10-19.json'), JSON.stringify(out, null, 1) + '\n'); console.log('written'); }
}
module.exports = {THEMES, audit, offTheme, offThemeFor, SKIP_MAPS, GI_IDS};
