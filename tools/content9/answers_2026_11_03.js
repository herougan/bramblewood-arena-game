// 2026-11-03 (package CONTENT9, DESIGN1-5 a; owner 21:10: "a. - but im also doing my pass. Over-tuned cards are not what we want. But we need
// answers to difficult field effects."). READ-ONLY: it changes nothing. For each main map (its road and its side maps' fights) it lists the threats
// the fights field and whether the player can hold an answer:
//   rule pool   that map's list or the one before (canonical/map-pools.json: MAP + its SUBMAP lists + SPECIAL), the answer rule of DESIGN1-5
//   carried     anything the player can own by then (canonical/card-obtain-maps.json <= that map, every list up to that map, starter cards)
// Threats are of two kinds:
//   units   Armor 2+, a high-Health wall (25+ at the fight's road level), Regen, a Flying swarm, Stealth / Invisible, a Poison deck, Shields, a
//           Taunt / Guardian wall
//   field   the difficult field effects the fight runs (the game's own fightRules: dark, fixed night, mist, tide, wind, quicksand, sandstorm, swamp
//           fever, frost, hail, heat and fire, fumes, ash, ice, spores, roots, briars, arrow slits, ...)
// The answers are skill keys as the engine reads them (bramblewood-engine.js decides; the comments name where). A field with no answer key at all
// is listed as "no keyword answer". Usage:
//   node tools/content9/answers_2026_11_03.js            Markdown per map (the table in docs/content9-2026-11-03.md)
//   node tools/content9/answers_2026_11_03.js --json     the same as JSON
//   node tools/content9/answers_2026_11_03.js --gaps     only the gaps
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, DEFS = B.CARD_DEFS_BASELINE;
const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const POOLS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
const OBTAIN = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps;

// ---- what a card carries (effects keys; "resist:x" / "immune:x" read the Resistance boxes; "trigger:x" an action of its triggers)
function keysOf(d){
  const e = (d && d.effects) || {}, out = new Set();
  for(const [k, v] of Object.entries(e)){ if(v === false || v == null || v === 0) continue; if(k === 'triggers' || k === 'resist' || k === 'immune' || k === 'weakness') continue; out.add(k); }
  (e.triggers || []).forEach(t=> t && t.do && out.add('trigger:' + t.do));
  [...((d && d.resist) || []), ...(e.resist || [])].forEach(r=> out.add('resist:' + r));
  (e.immune || []).forEach(r=> out.add('resist:' + r)); // immune counts as an answer too
  if(e.dry) out.add('resist:heat'); // Dry: heat resist built in (engine resistFactor)
  if(e.armor >= 2) out.add('armor2');
  return out;
}
// ---- the answer table. Each threat: which cards / rules raise it, and the keys that answer it.
const HAZARD = ['mountainClimber']; // engine climbs(): "Field and terrain hazards pass it by" (frost, scorch, wildfire, lava ...)
const BREAK = ['fieldBreaker'];     // engine fieldHazardRules(): Field Breaker pauses the hazards (not day/night, tide, dark, wind)
const UNIT = {
  armor:   {label:'Armor 2+', answers:['pierce', 'perforate', 'venomous', 'corrode', 'bludgeon']},
  wall:    {label:'25+ Health wall', answers:['executioner', 'hunter', 'kingSlayer', 'greaterPoison', 'venomous', 'hemorrhage', 'toxin']},
  regen:   {label:'Regen 2+ / healing', answers:['wither', 'fester', 'festering']},
  flyers:  {label:'Flying swarm', answers:['reach', 'arrow', 'fireArrow', 'iceArrow', 'volley', 'twinShot', 'bola', 'bludgeon', 'archer']},
  stealth: {label:'Stealth / Invisible', answers:['keenEye', 'illuminate', 'sonar']},
  poison:  {label:'Poison deck', answers:['cure', 'resist:poison', 'shedding', 'herbalist']},
  shields: {label:'Shields', answers:['nullify', 'twinStrike', 'volley', 'fork', 'sweep']},
  taunt:   {label:'Taunt / Guardian wall', answers:['backstab', 'arrow', 'fireArrow', 'iceArrow', 'volley', 'fork', 'snipe']},
};
const FIELD = {
  dark:        {label:'Darkness', on:r=> !!r.dark, answers:['darksight', 'illuminate', 'lantern', 'sonar', 'keenSense', 'nocturnal']},
  night:       {label:'Fixed night', on:r=> r.phase === 'night' || r.phase === 'nightFirst', answers:['nocturnal', 'crepuscular', 'darksight', 'illuminate']},
  mist:        {label:'Mist / fog', on:r=> !!(r.misty || r.fog || r.field === 'fog'), answers:['keenEye', 'darksight', 'illuminate', 'sonar', 'fog']},
  tide:        {label:'Tide / high tide / rapids', on:r=> !!(r.tide || r.highTide || r.permaTide || r.rapids), answers:['tide', 'swimmer', 'flying']},
  wind:        {label:'Strong wind (your Flyers)', on:r=> !!r.wind, soft:true, answers:['storm', 'mountainClimber']},
  quicksand:   {label:'Quicksand', on:r=> !!r.quicksand, answers:['flying', ...BREAK]},
  sandstorm:   {label:'Sandstorm', on:r=> !!r.sandstorm && r.sandstorm !== 'blind', answers:['dry', 'keenSense', 'sonar', 'storm']},
  blindstorm:  {label:'Blinding Sandstorm', on:r=> r.sandstorm === 'blind', answers:['dry', 'keenSense', 'sonar']},
  glassStorm:  {label:'Glass Storm', on:r=> !!r.glassStorm, answers:['dry', 'regen', ...BREAK]},
  swampFever:  {label:'Swamp Fever', on:r=> !!r.swampFever, answers:['cure', 'resist:poison', 'shedding', ...BREAK]},
  frost:       {label:'Frost / Freezing', on:r=> r.field === 'frozen' || !!(r.freezing || r.frostbite || r.frostWait || r.frostCount), answers:['resist:cold', 'frost', ...HAZARD]},
  hail:        {label:'Hail', on:r=> !!r.hail, answers:['resist:cold', 'regen', 'trigger:heal', ...HAZARD, ...BREAK]},
  heat:        {label:'Scorching / heatwave', on:r=> r.field === 'heatwave', answers:['resist:heat', 'dry', 'heat', ...HAZARD]},
  fire:        {label:'Wildfire / lava / eruption', on:r=> !!(r.wildfire || r.lavaSpout || Number(r.eruption) > 0 || r.volcano), answers:['resist:fire', 'resist:heat', 'dry', 'flying', ...HAZARD, ...BREAK]},
  fumes:       {label:'Sulphur Fumes', on:r=> !!r.sulphurFumes, answers:['resist:fire', 'dry', 'flying', ...BREAK]},
  ash:         {label:'Ash (grounded, misses)', on:r=> !!(r.ashRain || r.ashy), answers:['darksight', 'keenSense', 'sonar', ...BREAK]},
  slippery:    {label:'Slippery ice', on:r=> !!r.slippery, answers:[]}, // engine slips(): no skill is spared (a fight-design call)
  spores:      {label:'Spore Cloud', on:r=> !!r.sporeCloud, answers:['wakeful', 'resist:poison', ...BREAK]},
  roots:       {label:'Tangled Roots', on:r=> !!r.tangledRoots, answers:['flying', ...BREAK]},
  briars:      {label:'Grasping Briars', on:r=> !!r.graspingBriars, answers:['flying', ...BREAK]},
  tallGrass:   {label:'Tall Grass (their Stealth first)', on:r=> !!r.tallGrass, answers:['keenEye', 'illuminate', 'stealth']},
  arrowSlits:  {label:'Arrow Slits', on:r=> !!r.arrowSlits, answers:['helmet', 'shield', ...BREAK]},
  landslide:   {label:'Landslide', on:r=> !!r.landslide, answers:['flying', ...HAZARD, ...BREAK]},
  // Thunderstorm: 1 shock to one random unit a side (engine, FIELD_DMG_DEFAULT 1); mild, and it switches on Storm / Rain skills
  thunder:     {label:'Thunderstorm', on:r=> !!r.thunderstorm, soft:true, answers:['resist:shock', 'storm', 'rain', 'rainrunner', ...BREAK]},
  depths:      {label:'Crushing Depths', on:r=> !!r.crushingDepths, answers:['resist:water', 'swimmer', 'tide', ...BREAK]},
  consternation:{label:'Consternation (hand shrinks)', on:r=> !!r.consternation, answers:[]},
};
// ---- the maps, their fights, their pools
const mainMaps = B.MAPS.filter(m=> !m.reserved && !m.sub && G.mapNumberOf(m.id) != null && (m.nodes || []).length).sort((a, b)=> G.mapNumberOf(a.id) - G.mapNumberOf(b.id));
const subsOf = id=> B.MAPS.filter(m=> m.sub && m.parent === id && !m.reserved);
function listOf(mapId){ const e = LP.normalizeEntry(POOLS[mapId] || {}); return new Set([...e.cards, ...Object.values(e.submaps).flat(), ...e.special]); }
const STARTERS = Object.values(DEFS).filter(d=> /^(starter|base)$/.test(d.rarity || '')).map(d=> d.id);
function carriedAt(n){ const s = new Set(STARTERS);
  Object.entries(OBTAIN).forEach(([id, m])=>{ if(typeof m === 'number' && m <= n && DEFS[id]) s.add(id); });
  mainMaps.filter(m=> G.mapNumberOf(m.id) <= n).forEach(m=> listOf(m.id).forEach(id=> s.add(id))); return s; }
function holders(pool, answers){ const out = {}; for(const id of pool){ const d = DEFS[id]; if(!d || d.pool || d.unattainable || d.awaitingSource || d.test || d.token) continue; /* in play only */ const ks = keysOf(d); answers.forEach(a=>{ if(ks.has(a)) (out[a] = out[a] || []).push(d.name); }); } return out; }
const BIG = /boss|elite|champion/;
function fightThreats(m, node){
  const out = {}, deck = node.deck || {}; let fly = 0, copies = 0, poison = 0, taunt = 0;
  try{ G.NODE_MAP_HINT.set(node, m.id); }catch(e){}
  let lvl = 0; try{ lvl = G.roadEnemyLevel(node) || 0; }catch(e){}
  for(const [id, n] of Object.entries(deck)){ const d = DEFS[id]; if(!d || !(n > 0)) continue; copies += n; const ks = keysOf(d);
    let hp = d.health || 0; try{ if(lvl) hp = (G.statsAtLevel(d, lvl) || {}).health || hp; }catch(e){}
    const add = (k, why)=>{ (out[k] = out[k] || new Set()).add(why); };
    if(ks.has('armor2') || ks.has('bulwark') || ks.has('shell') || ks.has('magicArmor') || ks.has('rockSolid')) add('armor', `${d.name}`);
    if(hp >= 25) add('wall', `${d.name} ${hp}`);
    // Regen 2+, Healing 2+, Renewal or a heal of 2+ (a heal of 1 is noise next to a 25+ Health wall)
    const e = d.effects || {}; if(Number(e.regen) >= 2 || Number(e.healing) >= 2 || e.renewal || (e.triggers || []).some(t=> t && t.do === 'heal' && Number(t.amount) >= 2)) add('regen', d.name);
    if(ks.has('flying')) fly += n;
    if(ks.has('stealth') || ks.has('invisible') || ks.has('shadow')) add('stealth', d.name);
    if(ks.has('poison') || ks.has('venomous') || ks.has('greaterPoison') || ks.has('poisonGas') || ks.has('toxin') || ks.has('venomMaster') || ks.has('trigger:poison')) poison += n;
    if(ks.has('shield') || ks.has('prayerWard') || ks.has('invincible') || ks.has('shieldCall') || ks.has('trigger:shield') || ks.has('trigger:grantShield')) add('shields', d.name);
    if(ks.has('taunt') || ks.has('guardian')) taunt += n;
  }
  if(fly >= 6 || (copies && fly / copies >= 0.5)) out.flyers = new Set([`${fly} of ${copies} copies fly`]);
  if(poison >= 5) out.poison = new Set([`${poison} poisoning copies`]);
  if(taunt >= 3) out.taunt = new Set([`${taunt} Taunt / Guardian copies`]);
  let rules = {}; try{ rules = G.fightRules(m.id, node) || {}; }catch(e){ rules = node.rules || {}; }
  const fields = Object.keys(FIELD).filter(k=>{ try{ return FIELD[k].on(rules); }catch(e){ return false; } });
  return {units: out, fields};
}
const rows = [];
for(const m of mainMaps){
  const n = G.mapNumberOf(m.id), prev = mainMaps.find(x=> G.mapNumberOf(x.id) === n - 1);
  const rule = new Set([...listOf(m.id), ...(prev ? listOf(prev.id) : [])]), carried = carriedAt(n);
  const fights = [...m.nodes.map(x=> [m, x]), ...subsOf(m.id).flatMap(s=> s.nodes.map(x=> [s, x]))].filter(([, x])=> x.kind !== 'tutorial' && x.deck);
  const threats = {}; // key -> {kind, fights:[codes], big:bool, why:Set}
  for(const [mm, node] of fights){
    const t = fightThreats(mm, node), code = node.key + (mm.sub ? '' : '');
    const mark = (kind, k, why)=>{ const r = threats[k] = threats[k] || {kind, fights: [], big: false, why: new Set()}; r.fights.push(code); if(BIG.test(node.kind || '')) r.big = true; (why || []).forEach(w=> r.why.add(w)); };
    Object.entries(t.units).forEach(([k, w])=> mark('unit', k, [...w]));
    t.fields.forEach(k=> mark('field', k));
  }
  const out = [];
  for(const [k, r] of Object.entries(threats)){
    const def = r.kind === 'unit' ? UNIT[k] : FIELD[k];
    const inRule = holders(rule, def.answers), inCarried = holders(carried, def.answers);
    const status = !def.answers.length ? 'no keyword answer' : Object.keys(inRule).length ? 'answered' : Object.keys(inCarried).length ? 'carried only' : 'GAP';
    out.push({key: k, kind: r.kind, label: def.label, soft: !!def.soft, fights: r.fights, big: r.big, why: [...r.why].slice(0, 4), status,
      rule: Object.fromEntries(Object.entries(inRule).map(([a, l])=> [a, [...new Set(l)].slice(0, 3)])), carried: Object.fromEntries(Object.entries(inCarried).map(([a, l])=> [a, [...new Set(l)].slice(0, 2)]))});
  }
  out.sort((a, b)=> (a.kind === b.kind ? 0 : a.kind === 'field' ? -1 : 1) || ({'GAP': 0, 'no keyword answer': 1, 'carried only': 2, 'answered': 3}[a.status] - {'GAP': 0, 'no keyword answer': 1, 'carried only': 2, 'answered': 3}[b.status]));
  rows.push({map: n, id: m.id, name: m.name, fights: fights.length, threats: out});
}
const arg = process.argv.slice(2);
if(arg.includes('--json')){ console.log(JSON.stringify(rows, null, 1)); process.exit(0); }
const gapsOnly = arg.includes('--gaps');
const fmtAns = o=> Object.entries(o).map(([a, l])=> `${a} (${l.join(', ')})`).join('; ');
const lines = [];
let nGap = 0, nCarr = 0, nNone = 0;
for(const r of rows){
  const ts = r.threats.filter(t=> !gapsOnly || t.status !== 'answered');
  r.threats.forEach(t=>{ if(t.status === 'GAP' && !t.soft) nGap++; if(t.status === 'carried only' && !t.soft) nCarr++; if(t.status === 'no keyword answer') nNone++; });
  if(!ts.length) continue;
  lines.push(`\n**Map ${r.map} ${r.name}** (${r.fights} fights)\n`);
  lines.push('| Threat | Fights | Status | Answer on the list (this map or the one before) | Carried only |');
  lines.push('|---|---|---|---|---|');
  for(const t of ts){
    const fights = t.fights.length > 4 ? `${t.fights.slice(0, 3).join(', ')} +${t.fights.length - 3}` : t.fights.join(', ');
    const label = t.label + (t.why.length && t.kind === 'unit' ? ` (${t.why.slice(0, 2).join('; ')})` : '') + (t.soft ? ' (soft)' : '');
    const st = t.status === 'GAP' ? `**GAP**${t.big ? ' (elite/boss)' : ''}` : t.status === 'carried only' ? `carried only${t.big ? ' (elite/boss)' : ''}` : t.status;
    lines.push(`| ${label} | ${fights} | ${st} | ${fmtAns(t.rule) || '-'} | ${t.status === 'answered' ? '' : fmtAns(t.carried) || '-'} |`);
  }
}
console.log(`Answer check, ${rows.length} main maps (with their side maps): ${nGap} gaps (no answer the player can hold), ${nCarr} answered only by carried cards, ${nNone} field effects no keyword answers (soft threats not counted).`);
console.log(lines.join('\n'));
