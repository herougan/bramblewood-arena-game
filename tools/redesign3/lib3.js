// REDESIGN3 (2026-11-17): skill ids as the owner names them, the owner's focus per map, base-level "met" rule (arena_app.js ux8CardSkillKeys / cardBaseLevel).
const L = require('./lib.js');
// effect key (+ value) -> the owner's skill id
function skillId(k, v) {
  if (k === 'keenSense') return v && v.sees === 'dark' ? 'darksight' : 'keenSense';
  if (k === 'healing') return 'nursing';
  if (k === 'arrow' && v && v.type === 'fire') return 'arrowFlaming';
  if (k === 'arrow' && v && v.type === 'acid') return 'acid';
  if (k === 'fireArrow') return 'arrowFlaming';
  if (k === 'acidBolt') return 'acid';
  if (k === 'deliveryRes' || k === 'deliveryEvery') return 'delivery';
  if (k === 'delivery') return v && v.res === 'pearl' ? 'pearl' : 'delivery';
  if (['iceBolt', 'poisonBolt', 'shockBolt'].includes(k)) return 'bolt';
  return k;
}
const NAMES = {swarm: 'Swarm', flying: 'Flying', nursing: 'Nursing', thorns: 'Thorns', guardian: 'Guardian', inspiring: 'Inspiring', foraging: 'Foraging', diurnal: 'Diurnal',
  armor: 'Armor', pierce: 'Pierce', shield: 'Shield', tide: 'Tide', crabClaws: 'Crab Claws', pounce: 'Pounce', swift: 'Swift', arrow: 'Arrow', bloomCopy: 'Bloom', meiosis: 'Meiosis',
  delivery: 'Delivery', nocturnal: 'Nocturnal', fork: 'Fork', forestry: 'Forestry', bleed: 'Bleed', poison: 'Venomous', sap: 'Leech', parasite: 'Parasite', strangle: 'Constrict',
  carrion: 'Carrion', corrode: 'Corrode', sleepPowder: 'Sleeping Powder', poisonPowder: 'Poison Powder', darksight: 'Darksight', web: 'Web', illuminate: 'Illuminate', keenSense: 'Keen Sense',
  trident: 'Trident', electricity: 'Electricity', regen: 'Regeneration', weaken: 'Weaken', wave: 'Wave', paralysisPowder: 'Paralysis Powder', siege: 'Siege', recoil: 'Recoil',
  stealth: 'Stealth', bulldoze: 'Bulldoze', harbinger: 'Harbinger', twinStrike: 'Twin Strike', repair: 'Repair', mighty: 'Mighty', pack: 'Pack', snipe: 'Snipe', enfeeble: 'Enfeeble',
  overwhelm: 'Stampede', ambush: 'Ambush', sweep: 'Cleave', sturdy: 'Sturdy', rend: 'Rend', momentum: 'Momentum', offspring: 'Offspring', trap: 'Trap', expose: 'Expose',
  arrowFlaming: 'Arrow (Flaming)', fireBolt: 'Fire Bolt', bolt: 'other bolts', esprit: 'Esprit', loyal: 'Loyal', fencing: 'Fencing', octolash: 'Octolash', bulwark: 'Bulwark',
  smokeBomb: 'Smoke Bomb', broodkeeper: 'Broodmother', fletcher: 'Fletcher', dynamite: 'Dynamite', carnage: 'Carnage', fortify: 'Fortify', brambleArmor: 'Fortify (old, bramble Armor 1)',
  poisonBarbs: 'Poison Barbs', evasive: 'Evasive', cure: 'Cure', leader: 'Natural Leader', twinShot: 'Twin Shot', rebuild: 'Rebuild', reach: 'Reach', acid: 'Acid', pearl: 'Pearl',
  loneWolf: 'Lone Wolf', frostbite: 'Frostbite', freeze: 'Freeze', avalanche: 'Avalanche', herbalist: 'Herbalist', scare: 'Scare', taunt: 'Taunt', bludgeon: 'Bludgeon', daunt: 'Daunt',
  puncture: 'Puncture', pickpocket: 'Pickpocket', rainrunner: 'Rainrunner', lastStand: 'Last Stand', molting: 'Molting', herald: 'Herald', pitchfork: 'Pitchfork', feeble: 'Feeble',
  stonecutter: 'Stonecutter', exploit: 'Exploit', helmet: 'Helmet', enfeeble: 'Enfeeble', vulnerable: 'Vulnerable', venomMaster: 'Venom Master', packLeader: 'Pack Leader', triggers: 'trigger x action', onDeathSpawn: 'On Death: spawn', injured: 'Injured', purblind: 'Purblind', bounty: 'Bounty'};
const nameOf = id => NAMES[id] || id;
// the owner's Proposal sheet (2026-11-17 23:05): focus = "Merged reco (red)", special = "Special/Faction", more = "More ideas" (skills only; fields in brackets dropped)
const FOCUS = {
  0: ['swarm', 'flying', 'nursing'], 1: ['thorns', 'guardian', 'inspiring', 'foraging', 'diurnal'], 2: ['armor', 'pierce', 'shield', 'tide', 'crabClaws'], 3: ['pounce', 'swift', 'arrow'],
  4: ['bloomCopy', 'meiosis', 'delivery', 'nocturnal', 'fork'], 5: ['forestry', 'bleed', 'poison'], 6: ['sap', 'parasite', 'strangle'], 7: ['carrion', 'corrode', 'sleepPowder', 'poisonPowder'],
  8: ['darksight', 'web', 'illuminate', 'keenSense'], 9: ['trident', 'electricity', 'regen'], 10: ['weaken', 'wave'], 11: ['paralysisPowder'], 12: ['siege', 'recoil', 'stealth', 'bulldoze'],
  13: ['harbinger', 'twinStrike', 'repair'], 14: ['mighty', 'pack', 'snipe', 'enfeeble'], 15: ['overwhelm', 'ambush', 'sweep'], 16: ['sturdy', 'rend'], 17: ['momentum', 'offspring'],
  18: ['trap', 'expose'], 19: ['arrowFlaming'], 20: ['fireBolt']};
const SPECIAL = {1: ['esprit'], 2: ['loyal'], 3: ['fencing'], 4: ['trident', 'octolash'], 5: ['bulwark'], 6: ['smokeBomb'], 7: ['broodkeeper'], 11: ['fletcher'], 12: ['dynamite'], 13: ['carnage'], 14: ['siege'], 15: ['fortify']};
const MORE = {2: ['poisonBarbs'], 10: ['poisonBarbs'], 11: ['avalanche', 'frostbite'], 13: ['forestry'], 14: ['carnage'], 16: ['loneWolf'], 17: ['freeze'], 18: ['acid'], 19: ['smokeBomb']};
const FIELDS = {2: 'Tides', 3: 'Wind', 8: 'Darkness', 10: 'Underwater Currents (move units)', 11: 'Strong Wind, Storm', 18: 'Storm'};
// cardBaseLevel (arena_app.js): Baby 0, own baseLevel, faction 1, starter/basic/quest/base 0, else 1
function baseLevel(d) {
  if (d.kind === 'baby' && !d.token) return 0;
  if (d.baseLevel != null) return +d.baseLevel;
  if (d.faction) return 1;
  if (['bee-knight', 'forager-ant'].includes(d.id)) return 1;
  const qs = d.source && ['quest', 'errand', 'base'].includes(d.source.kind);
  return (d.basic || d.rarity === 'starter' || d.tutorial || d.quest || qs) ? 0 : 1;
}
// skill ids a card shows at its base level (a skill arriving later in levelSkills is not "met")
function metSkills(d, eff) {
  eff = eff || d.effects || {}; const first = {}, ls = d.levelSkills || {}, b = baseLevel(d);
  Object.keys(ls).map(Number).sort((a, c) => a - c).forEach(lv => Object.entries(ls[lv] || {}).forEach(([k, v]) => { const id = skillId(k, v); if (first[id] == null) first[id] = lv; }));
  const out = new Set();
  Object.entries(eff).forEach(([k, v]) => { if (v === false || v == null) return; const id = skillId(k, v); if ((first[id] || 0) <= b) out.add(id); });
  return out;
}
module.exports = Object.assign({}, L, {skillId, nameOf, NAMES, FOCUS, SPECIAL, MORE, FIELDS, baseLevel, metSkills});
