#!/usr/bin/env node
// CONTENT7 (2026-11-02, owner 19:56 "OK go do, + art", IDEA-11-02): nine new creature cards and two renames.
//   Sea cards (placed on no list yet; the proposed map per card is decision CONTENT7-1): Man o' War, Bright Night Algae, Nautiloid,
//   Bobbit Worm, Pistol Shrimp, Bloodworm (the worm with four jaws). Mythic three (Map 56+, decision CONTENT7-2): Unicorn, Sphinx, Griffin.
//   Renames (CONTENT6-2 b, owner): Gale Sprite -> Whirlwind Swift, Alpine Avalanche -> Avalanche Bear (ids unchanged; name + flavour).
// Each card gets the largest line on its Attack:Health shape inside both caps at Level 1 with its proposed map's term and its rarity
// (tools/skill_costs.js budget, as tools/en4_new_cards_2026_10_23.js). Unlisted cards follow docs/workflows/card-data.md: awaitingSource +
// unattainable (out of play until the owner places them). Edits only these cards' entries, appended at the end of canonical/cards.json.
//   node tools/content7_cards_2026_11_02.js          dry run        ... apply     (idempotent: skips ids that exist, renames once)
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = path.join(ROOT, 'canonical', 'cards.json');
const cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
function uuid5(name){ const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80; const x = h.slice(0, 16).toString('hex'); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; }
const SEA = {mb:'Pebble Beach (Map 2)', mk:'the Kelp Mangroves (Map 9)', m7:'Coral Current (Map 10)'};
const NEW = [
  {id:'bloodworm', name:'Bloodworm', icon:'🪱', cost:0, wait:1, shape:[3, 7], rarity:'common', species:['Annelid'], animal:'bloodworm', archetypes:['Worm', 'Coastal'], effects:{poison:1, bleed:1},
   map:'mb', mapN:2, flavor:'Four black jaws fold out of a pink body, and the tide flats suddenly feel very wide.', why:'the tidal flats of Pebble Beach'},
  {id:'night-algae', name:'Bright Night Algae', icon:'✨', cost:0, wait:1, shape:[1, 7], rarity:'common', species:['Plant'], animal:'glowing bacterium', subtype:'plant', archetypes:['Flora', 'Ocean'], effects:{bloomCopy:{when:['night'], mode:'and'}},
  map:'mk', mapN:9, flavor:'A glowing bacterium, blown up to the size of a barrel. Come dark, the bay lights up and there are two.', why:'the glowing mangrove bays of the Kelp Mangroves (a Bloom that works at night: Pond Algae\'s night twin)'},
  {id:'bobbit-worm', name:'Bobbit Worm', icon:'🪱', cost:1, wait:2, shape:[4, 9], rarity:'uncommon', species:['Annelid'], animal:'bobbit worm', archetypes:['Worm', 'Ocean'], effects:{ambush:2, gash:2},
   map:'mk', mapN:9, flavor:'It lies buried in the sand with one feeler out. The snap is over before the sand settles.', why:'the sandy mud of the Kelp Mangroves, beside the Moray Ambusher and the Mudpuppy'},
  {id:'man-o-war', name:"Man o' War", icon:'🪼', cost:1, wait:2, shape:[2, 8], rarity:'rare', species:['Cnidaria'], animal:"man o' war", archetypes:['Ocean', 'Coral Reef'], effects:{poison:2, tide:true},
   map:'mk', mapN:9, flavor:'Not one animal but many, sailing on one blue bubble. Its streamers outrun the ship that sees it.', why:'the surface drifters of the Kelp Mangroves'},
  {id:'nautiloid', name:'Nautiloid', icon:'🐚', cost:1, wait:2, shape:[3, 12], rarity:'rare', species:['Cephalopod'], animal:'nautiloid', archetypes:['Cephalopod', 'Ocean'], effects:{armor:2, pierce:2},
   map:'m7', mapN:10, flavor:'Its shell was a straight spear long before shells learned to curl. The oldest hunter in the Current.', why:'the old hunters of Coral Current, beside the Nautilus Drifter'},
  {id:'pistol-shrimp', name:'Pistol Shrimp', icon:'🦐', cost:1, wait:1, shape:[5, 4], rarity:'uncommon', species:['Crustacean'], animal:'pistol shrimp', archetypes:['Coral Reef', 'Ocean'], effects:{stunOnHit:2},
   map:'m7', mapN:10, flavor:'One claw snaps shut so fast the water boils. What was in front of it sits down for a while.', why:'the reef of Coral Current, beside the Mantis Shrimp'},
  {id:'unicorn', name:'Unicorn', icon:'🦄', cost:3, wait:4, shape:[4, 20], rarity:'mythic', species:['Equid'], animal:'horse', subtype:'mythic', archetypes:['Mythic', 'Forest'], effects:{healing:3, cure:2},
   map:null, mapN:56, flavor:'Where it steps, the grass stands up again. Where it is struck, nothing stays wounded for long.', why:'Mythic, Map 56+'},
  {id:'sphinx', name:'Sphinx', icon:'🦁', cost:3, wait:4, shape:[5, 18], rarity:'mythic', species:['Felid'], animal:'lion', subtype:'mythic', archetypes:['Mythic', 'Desert'], effects:{confuse:{chance:50, duration:2}, daunt:1},
   map:null, mapN:56, flavor:'It asks one question. Answering is not the dangerous part.', why:'Mythic, Map 56+'},
  {id:'griffin', name:'Griffin', icon:'🦅', cost:3, wait:4, shape:[6, 14], rarity:'mythic', species:['Bird'], animal:'griffin', subtype:'mythic', archetypes:['Mythic', 'Mountain'], effects:{flying:true, pounce:2},
   map:null, mapN:56, flavor:'Half eagle, half lion, and it never once chose between the two.', why:'Mythic, Map 56+'},
];
const RENAMES = [
  {id:'gale-sprite', from:'Gale Sprite', name:'Whirlwind Swift', flavorFrom:'You hear it before you see it. Mostly you just hear it.', flavor:'You hear the whirlwind before you see the swift. Mostly you just hear it.'},
  {id:'alpine-avalanche', from:'Alpine Avalanche', name:'Avalanche Bear', flavorFrom:'Started as a pebble. Nobody agrees on whose fault that was.', flavor:'Started as a snowball. Nobody agrees on whose fault that was, least of all the bear.'},
];
const lineOk = (c, A, H)=>{ const b = T.budget(Object.assign({}, c, {attack:A, health:H}), {level:1}); return b.ok && b.x1 <= b.N ? b : null; };
let nid = Math.max(...cards.map(c=> c.numericId || 0)) + 1; const out = [], report = [];
for(const s of NEW){
  if(cards.find(c=> c.id === s.id)){ console.log('exists: ' + s.id); continue; }
  const base = {id:s.id, name:s.name, icon:s.icon, cost:s.cost, wait:s.wait, attack:s.shape[0], health:s.shape[1], rarity:s.rarity, locked:true, test:false, archetypes:s.archetypes.slice(), species:s.species.slice(), animal:s.animal};
  if(s.subtype) base.subtype = s.subtype;
  Object.assign(base, {dmgType:'physical', resist:[], tags:[], effects:s.effects, flavor:s.flavor});
  const fit = Object.assign({}, base, {obtainMap:s.mapN});
  let best = null; for(let k = 0.2; k <= 4; k += 0.01){ const A = Math.max(1, Math.round(s.shape[0] * k)), H = Math.max(1, Math.round(s.shape[1] * k)), b = lineOk(fit, A, H);
    if(b && (!best || b.x1 > best.b.x1 || (b.x1 === best.b.x1 && Math.abs(A / H - s.shape[0] / s.shape[1]) < Math.abs(best.A / best.H - s.shape[0] / s.shape[1])))) best = {A, H, b}; }
  if(!best){ console.log('no legal line: ' + s.id); continue; }
  base.attack = best.A; base.health = best.H; base.numericId = nid++; base.uuid = uuid5('bramblewood-card:' + s.id);
  base.awaitingSource = true; base.unattainable = true;
  const mythic = s.rarity === 'mythic';
  base.creatorNote = `2026-11-02 (package CONTENT7, owner 19:56 "OK go do, + art", IDEA-11-02): ${mythic ? 'MARKED FOR MAP 56+ (Mythic, unlisted)' : 'unlisted; proposed home ' + SEA[s.map] + ' (decision CONTENT7-1)'}. Priced with the budget (tools/skill_costs.js budget, Level 1, rarity ${s.rarity}, map term Map ${s.mapN}): S ${best.b.S}, N ${best.b.N}, 3A + H + S ${best.b.x1}: ${best.A}/${best.H}. Skills from existing keywords only. Art: brief in docs/art/content7-2026-11-02-briefs.md.`;
  out.push(base); report.push(`${s.id.padEnd(14)} ${s.rarity.padEnd(9)} ${best.A}/${best.H} cost ${s.cost} wait ${s.wait}  S ${best.b.S}  3A+H+S ${best.b.x1} / N ${best.b.N}  ${Object.keys(s.effects).join('+')}  -> ${mythic ? 'Map 56+' : s.map + ' (Map ' + s.mapN + ')'}`);
}
console.log(report.join('\n'));
let renamed = 0;
for(const r of RENAMES){ const c = cards.find(x=> x.id === r.id); if(!c){ console.log('missing ' + r.id); continue; }
  if(c.name !== r.name){ c.name = r.name; c.flavor = r.flavor; renamed++; } }
const pyDump = v=> JSON.stringify(v, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
if(process.argv.includes('apply') && (out.length || renamed)){ cards.push(...out); fs.writeFileSync(CARDS, pyDump(cards)); console.log('applied', out.length, 'new,', renamed, 'renamed'); }
module.exports = {NEW, RENAMES};
