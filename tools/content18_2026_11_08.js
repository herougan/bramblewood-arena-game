#!/usr/bin/env node
// CONTENT18 (2026-11-08, owner 10:52 rows 8, 12, 14; 09:27 row 7). The data half of the package:
//   1  Shooters (DES1-3: "Don't do the shooters onto maps yet. Make some shooter cards for me, maybe at least 1 for each element. Reuse cards
//      that already exist if you want. Most cards aren't being used actually!"): one ranged card for each element the engine gives rules to
//      (physical, heat, cold, shock, poison, acid, water, decay, magic; stone and metal are only names in the editor's list, the engine treats
//      them as physical, and true damage is not an element). Out-of-play cards first (on no map list: lib_map_pools.budgetHold 'unplaced');
//      a new card only where none fits. Every shot is a ranged delivery in canonical/skill-delivery.json: Arrow, a Bolt, or, for the three
//      elements with no Bolt (water, decay, magic), an On Action "Deal 1 <element> damage" at the unit facing it (action:damage, ranged).
//      Simple common animal names (owner 10:52 #15). Each new card is on NO map list (owner: no new skills on any map's list; the maps are
//      being winnowed to 3 signature skills) and is priced at its suggested map's term (a suggestion only).
//   2  Star path cards (owner 10:52 #14: "some star-paths straight up just unlock cards (maybe 1 in each star path). Starpath-only cards ...
//      At least Epic and above."): the game's star paths are the Wildpaths (Skyrim-like trails, arena_app.js WILDPATH_TREES; decision
//      CONTENT18-2). One card-unlock mark per trail; its card's source is {kind:'starpath', path, node}: never in a pack, a skirmish drop, the
//      Forge's fuse or a faction pool. Priced at the Wildpaths' first map (21, OBTAIN_MAP_OF.starpath) for its rarity.
//   3  The Canopy's bramble (BAL27-1, owner 10:52 #8: "Create a canopy-themed bramble as well. Something that enhances either savannah or
//      canopy units."): the Canopy Bower, canonical/characters.json; The Canopy's fights defend it (arena_app.js MAP_CASTLE.my).
//   node tools/content18_2026_11_08.js          dry run (prices and checks; writes nothing)
//   node tools/content18_2026_11_08.js apply    writes canonical/cards.json and canonical/characters.json   (idempotent)
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), CHARS = path.join(ROOT, 'canonical', 'characters.json');
const DELIV = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-delivery.json'), 'utf8'));
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
function uuid5(name){ const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80; const x = h.slice(0, 16).toString('hex'); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; }
const shot = (dmgType)=> ({triggers: [{on: 'onAction', do: 'damage', amount: 1, dmgType, who: 'enemy', sub: 'adjacent'}]});

// 1. Shooters. element: the damage its shot deals; map: the suggested map (id, name, the term it is priced with). new: the new card's data.
const SHOOTERS = [
  {element: 'physical', id: 'acorn-pelter-squirrel', skill: 'Arrow 1', map: ['m1', 'Bramblewood Outskirts', 0]},
  {element: 'heat', id: 'firefly-swarm', skill: 'Fire Bolt 2', map: ['m3', 'Ashen Spurn', 19]},
  {element: 'cold', id: 'icefletch-fox', skill: 'Ice Arrow 1', map: ['m6', 'Wolfsbane Tundra', 17]},
  {element: 'shock', id: 'snapgun-shrimp', skill: 'Shock Bolt 1', map: ['m7', 'Coral Current', 10]},
  {element: 'poison', id: 'adder', skill: 'Venom Spit 1', map: ['mw', 'Gatorback Swamp', 5],
   new: {name: 'Adder', icon: '🐍', rarity: 'common', cost: 0, wait: 1, shape: [2, 6], species: ['Reptile'], animal: 'adder', archetypes: ['Swamp', 'Snake'],
     effects: {poisonBolt: 1}, flavor: 'It lies coiled on a warm stone and spits at anything that steps too close. It is not sorry.'}},
  {element: 'acid', id: 'archerfish', skill: 'Acid Bolt 1', map: ['mk', 'The Kelp Mangroves', 9]},
  {element: 'water', id: 'elephant', skill: 'On Action: 1 water damage', map: ['m5', 'Savanna Reaches', 14],
   new: {name: 'Elephant', icon: '🐘', rarity: 'common', cost: 0, wait: 2, shape: [2, 9], species: ['Elephant'], animal: 'elephant', archetypes: ['Savanna', 'Elephant'],
     effects: shot('water'), flavor: 'It fills its trunk at the waterhole and gives the whole herd a shower. Then it turns around and gives you one.'}},
  {element: 'decay', id: 'fruit-bat', skill: 'On Action: 1 decay damage', map: ['m4', 'Caves & Alcoves', 8],
   new: {name: 'Fruit Bat', icon: '🦇', rarity: 'common', cost: 0, wait: 1, shape: [2, 5], species: ['Bat'], animal: 'fruit bat', archetypes: ['Cave', 'Rainforest'],
     effects: shot('decay'), flavor: 'It eats the best half of every fig. The other half, long gone soft, it drops on whoever is below.'}},
  {element: 'magic', id: 'glow-worm', skill: 'On Action: 1 magic damage', map: ['mn', 'The Glimmer Depths', 8],
   new: {name: 'Glow-worm', icon: '🐛', rarity: 'common', cost: 0, wait: 1, shape: [1, 7], species: ['Insect'], animal: 'glow-worm', archetypes: ['Cave', 'Insect'],
     effects: shot('magic'), flavor: 'A hundred of them light the cave roof like stars. One of them has learned to throw its light.'}},
];

// 2. Star path cards: one per Wildpath trail (the mark's id is added to WILDPATH_TREES in arena_app.js). Existing Epic+ cards on no list first.
const STARPATH = [
  {path: 'root', node: 'r8', id: 'thistle-baron', why: 'The Root (Bramble Health, Armour, the long game): a 2/20 wall with Thorns 2; proposed back as a Map 21+ reward by the 10-21 rewards pass'},
  {path: 'thorn', node: 't8', id: 'ironmaw-warwolf', why: 'The Thorn (Attack, Quick, finishing blows): a 7-Attack war wolf with Bleed, Armor and Fork'},
  {path: 'bloom', node: 'b8', id: 'bumblebee-queen', why: 'The Bloom (Lumber, cards and tricks; Pollen Drift: Heal heals 1 more): no unused Epic+ card fits, so a new one, Coppice (Lumber) and Heal',
   new: {name: 'Bumblebee Queen', icon: '🐝', rarity: 'epic', cost: 2, wait: 2, shape: [3, 14], species: ['Insect'], animal: 'bumblebee', archetypes: ['Insect', 'Meadow'],
     effects: {coppice: 2, healing: 2}, flavor: 'She wakes first in spring and builds the whole colony from one ball of pollen. Every flower she visits remembers her.'}},
];
const STARPATH_MAP = 21; // arena_app.js OBTAIN_MAP_OF.starpath: the Wildpaths open with Map 21 (WILDPATH_FROM_MAP)

// 3. The bramble
const BRAMBLE = {id: 'canopy-bower', name: 'Canopy Bower', icon: '🌴', health: 26, rarity: 'epic', archetypes: ['Castle'],
  effects: {habitatBonus: {kin: ['Rainforest', 'Savanna'], atk: 1, hp: 2}},
  flavor: 'A platform of woven lianas high in the rainforest roof. The monkeys built it; the whole canopy defends it.', unlockMap: 'my', eng24Plus2: true};

module.exports = {SHOOTERS, STARPATH, STARPATH_MAP, BRAMBLE};
if(require.main !== module) return; // required (tests): the data only

const by = Object.fromEntries(cards.map(c=> [c.id, c]));
const L = require('./lib_map_pools.js');
const problems = [], report = [];
const isRangedFx = fx=> Object.keys(fx || {}).some(k=> DELIV.delivery[k] === 'ranged') || ((fx || {}).triggers || []).some(t=> DELIV.delivery['action:' + (t.do || t.action)] === 'ranged');
const lineOk = (c, A, H)=>{ const b = T.budget(Object.assign({}, c, {attack:A, health:H}), {level:1}); return b.ok ? b : null; };
function priceNew(id, s, mapN){
  const base = {id, name:s.name, icon:s.icon, cost:s.cost, wait:s.wait, attack:s.shape[0], health:s.shape[1], rarity:s.rarity, locked:true, test:false, archetypes:s.archetypes.slice(), species:s.species.slice(), animal:s.animal,
    dmgType:'physical', resist:[], tags:[], effects:JSON.parse(JSON.stringify(s.effects)), flavor:s.flavor};
  const fit = Object.assign({}, base, {obtainMap:mapN});
  let best = null; for(let k = 0.2; k <= 4; k += 0.01){ const A = Math.max(1, Math.round(s.shape[0] * k)), H = Math.max(1, Math.round(s.shape[1] * k)), b = lineOk(fit, A, H);
    if(b && (!best || b.x1 > best.b.x1 || (b.x1 === best.b.x1 && Math.abs(A / H - s.shape[0] / s.shape[1]) < Math.abs(best.A / best.H - s.shape[0] / s.shape[1])))) best = {A, H, b}; }
  if(best){ base.attack = best.A; base.health = best.H; }
  return {base, best};
}
const fmt = b=> `S ${(+b.S).toFixed(2)}  2A+H+S ${(+b.x1).toFixed(2)} / N ${(+b.N).toFixed(2)}`;
const toAdd = [], edits = [];
SHOOTERS.forEach(s=>{
  const mapN = s.map[2];
  if(s.new){ if(by[s.id] && !by[s.id].awaitingSource) problems.push('id taken: ' + s.id);
    const p = priceNew(s.id, s.new, mapN); if(!p.best){ problems.push('no legal line: ' + s.id); return; }
    if(!isRangedFx(p.base.effects)) problems.push('not ranged: ' + s.id);
    p.base.creatorNote = `2026-11-08 (package CONTENT18, owner 10:52 DES1-3: "Don't do the shooters onto maps yet. Make some shooter cards for me, maybe at least 1 for each element"): the ${s.element} shooter (${s.skill}; a ranged delivery, canonical/skill-delivery.json). On no map list; suggested home ${s.map[1]} (a suggestion only). Simple common animal (owner 10:52 #15). Priced with the budget (tools/skill_costs.js budget, Level 1, ${s.new.rarity}, map term Map ${mapN}): ${fmt(p.best.b)}: ${p.best.A}/${p.best.H}. Art: the emoji until drawn; prompt in docs/art-style-prompts.md (CONTENT18).`;
    toAdd.push(p.base); report.push(`${s.element.padEnd(8)} ${s.id.padEnd(22)} NEW      ${s.new.rarity.padEnd(9)} ${p.best.A}/${p.best.H}  ${s.skill.padEnd(26)} ${fmt(p.best.b)}  -> ${s.map[1]} (Map ${mapN})`);
  } else { const c = by[s.id]; if(!c){ problems.push('unknown ' + s.id); return; }
    let hold = ''; try{ hold = L.budgetHold(s.id); }catch(e){ hold = '?'; }
    if(hold !== 'unplaced') problems.push(`${s.id} is not out of play (${hold || 'listed'})`);
    if(!isRangedFx(c.effects)) problems.push('not ranged: ' + s.id);
    const b = T.budget(Object.assign({}, c, {obtainMap: mapN}), {level:1}); if(!b.ok) problems.push(`${s.id} over budget at Map ${mapN}`);
    report.push(`${s.element.padEnd(8)} ${s.id.padEnd(22)} existing ${c.rarity.padEnd(9)} ${c.attack}/${c.health}  ${s.skill.padEnd(26)} ${fmt(b)}  -> ${s.map[1]} (Map ${mapN})`); }
});
STARPATH.forEach(s=>{
  const src = {kind: 'starpath', path: s.path, node: s.node};
  if(s.new){ const p = priceNew(s.id, s.new, STARPATH_MAP); if(!p.best){ problems.push('no legal line: ' + s.id); return; }
    p.base.source = src;
    p.base.creatorNote = `2026-11-08 (package CONTENT18, owner 10:52 #14: "some star-paths straight up just unlock cards (maybe 1 in each star path). Starpath-only cards ... At least Epic and above."): the ${s.path} star path's card (Wildpaths mark ${s.node}); ${s.why}. Source {kind: 'starpath'}: only the mark gives it. Priced with the budget (tools/skill_costs.js budget, Level 1, ${s.new.rarity}, map term Map ${STARPATH_MAP}): ${fmt(p.best.b)}: ${p.best.A}/${p.best.H}. Art: the emoji until drawn; prompt in docs/art-style-prompts.md (CONTENT18).`;
    toAdd.push(p.base); report.push(`starpath ${s.path.padEnd(6)} ${s.id.padEnd(22)} NEW      ${s.new.rarity.padEnd(9)} ${p.best.A}/${p.best.H}  ${fmt(p.best.b)}`);
  } else { const c = by[s.id]; if(!c){ problems.push('unknown ' + s.id); return; }
    if(SC.LADDER.indexOf(c.rarity) < SC.LADDER.indexOf('epic')) problems.push(`${s.id} is below Epic`);
    let hold = ''; try{ hold = L.budgetHold(s.id); }catch(e){ hold = '?'; } if(hold !== 'unplaced' && !(c.source && c.source.kind === 'starpath')) problems.push(`${s.id} is not out of play (${hold || 'listed'})`);
    const b = T.budget(Object.assign({}, c, {obtainMap: STARPATH_MAP, source: src}), {level:1}); if(!b.ok) problems.push(`${s.id} over budget at Map ${STARPATH_MAP}`);
    edits.push({id: s.id, src, why: s.why, b});
    report.push(`starpath ${s.path.padEnd(6)} ${s.id.padEnd(22)} existing ${c.rarity.padEnd(9)} ${c.attack}/${c.health}  ${fmt(b)}`); }
});
console.log(report.join('\n'));
if(problems.length){ console.log('PROBLEMS:\n  ' + problems.join('\n  ')); process.exitCode = 1; }

const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
if(process.argv.includes('apply') && !problems.length){
  let nid = Math.max(...cards.map(c=> c.numericId || 0)) + 1, added = 0, changed = 0;
  toAdd.forEach(base=>{ if(by[base.id]) return; base.numericId = nid++; base.uuid = uuid5('bramblewood-card:' + base.id);
    if(!base.source){ base.awaitingSource = true; base.unattainable = true; }
    cards.push(base); added++; });
  edits.forEach(e=>{ const c = by[e.id]; if(c.source && c.source.kind === 'starpath') return;
    const was = JSON.stringify(c.source || null); c.source = e.src; c.locked = true; delete c.unattainable; delete c.awaitingSource;
    c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-11-08 (package CONTENT18, owner 10:52 #14): the ${e.src.path} star path's card (Wildpaths mark ${e.src.node}): ${e.why}. Source was ${was}; now {kind: 'starpath'} (only the mark gives it), locked until claimed. Budget at the Wildpaths' first map (Map ${STARPATH_MAP}): ${fmt(e.b)}, stats unchanged.`;
    changed++; });
  if(added || changed) fs.writeFileSync(CARDS, pyDump(cards));
  const chars = JSON.parse(fs.readFileSync(CHARS, 'utf8'));
  if(!chars.some(c=> c.id === BRAMBLE.id)){ chars.push(Object.assign({}, BRAMBLE)); fs.writeFileSync(CHARS, JSON.stringify(chars, null, 2) + '\n'); console.log('bramble added: ' + BRAMBLE.id); }
  console.log(`applied: ${added} new cards, ${changed} cards moved to a star path`);
}
