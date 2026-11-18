// ROLE1 (2026-11-18, owner 20:42: "some sort of balance - strong creatures, cute, resource etc" on each map's card list): tags every card on the
// Maps 0-20 MAP lists with roles read from its data, flags maps missing a role or a focus carrier, and lists swap candidates (budget-fit at the
// target map, no skill before its focus map). Read-only: writes docs/design/role1-2026-11-18.json only. Run: node tools/role1/gen.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const L3 = require(ROOT + '/tools/redesign3/lib3.js'); // metSkills (skills shown at the base level), MAP_IDS, budget T, owner cards
const { T, BYID, POOLS, MAP_IDS, OWNER } = L3;
const R3 = JSON.parse(fs.readFileSync(ROOT + '/docs/design/redesign3-2026-11-17.json', 'utf8'));
const DEL = JSON.parse(fs.readFileSync(ROOT + '/canonical/skill-delivery.json', 'utf8')).delivery;
const FOCUS = {}; R3.focus.forEach(f => FOCUS[f.map] = { name: f.name, skills: f.skills.map(s => s.key) }); // v2 (Reach on 16, Exploit on 14)
const FOCUS_MAP = {}; Object.entries(FOCUS).forEach(([m, f]) => f.skills.forEach(k => { if (FOCUS_MAP[k] == null) FOCUS_MAP[k] = +m; }));
const FIRST_MAP = Object.assign({}, FOCUS_MAP); Object.entries(L3.SPECIAL).forEach(([m, l]) => l.forEach(k => { if (FIRST_MAP[k] == null || FIRST_MAP[k] > +m) FIRST_MAP[k] = +m; })); // focus or Special map: no card shows it earlier
const SINGLE_OK = new Set(['bloomCopy', 'meiosis']); // owner v2: single carriers allowed on Map 4

// ---- role rules (data keys; each list says which skill keys count)
const RES = ['foraging', 'delivery', 'forestry', 'bounty', 'hoard', 'stonecutter', 'pickpocket', 'plunder', 'felling', 'pearl', 'onReadyGold', 'onSpawnGold', 'gainGold'];
const SUPPORT = ['nursing', 'healing', 'herbalist', 'cure', 'inspiring', 'repair', 'herald', 'fletcher', 'broodkeeper', 'venomMaster', 'packLeader', 'armourer', 'banner', 'warcry'];
const DEFEND = ['guardian', 'taunt', 'armor', 'sturdy', 'shield', 'bulwark', 'helmet', 'fortify', 'shieldwall'];
const RANGED = new Set(Object.keys(DEL).filter(k => DEL[k] === 'ranged')); // canonical/skill-delivery.json: arrows, bolts, Snipe, Electricity, powders ...
const YOUNG = /(^|-)(kit|kitten|pup|cub|calf|fawn|foal|colt|chick|duckling|gosling|hatchling|fry|joey|lamb|piglet|cygnet|owlet|eaglet|fledgling|nestling|sprout|grub|tadpole|larva)($|-)/;
const SMALL = /(^|-)(shrew|mouse|dormouse|chipmunk|vole|pika|hamster|sparrow|wren|robin|finch|rabbit|bunny|cottontail|hare|hedgehog|squirrel|meerkat|duckling|kitten)($|-)/;
const trig = c => [].concat((c.effects || {}).triggers || []);
// skills shown at the card's base level: its effects plus levelSkills up to that level, read through the skill kinds
// (bramblewood-skillparams.js via the budget's SPL: speed {kind: swift} = Swift, daunt {lasts: lasting} = Weaken, arrow {type: fire, form: bolt} = Fire Bolt)
const BB = require(ROOT + '/bramblewood-budget.js');
const HIDE = new Set(['archerStyle', 'loyalGrant', 'arrowBramble', 'deliveryRes']); // parameters of another skill, not skills
function baseEffects(c) { // expanded effect object at the base level
  const b = L3.baseLevel(c), ls = c.levelSkills || {}, eff = Object.assign({}, c.effects || {});
  Object.keys(ls).map(Number).filter(lv => lv <= b).sort((a, z) => a - z).forEach(lv => Object.assign(eff, ls[lv]));
  return (BB.SPL ? BB.SPL.expandDef(Object.assign({}, c, { effects: eff, levelSkills: {} })) : { effects: eff }).effects;
}
function metOf(c) { return new Set([...L3.metSkills(Object.assign({}, c, { levelSkills: {} }), baseEffects(c))].filter(k => !HIDE.has(k))); }
const rawOf = c => Object.entries(baseEffects(c)).filter(([k, v]) => v !== false && v != null).map(([k]) => k);
function roles(c, met, mapNo) {
  const out = [], why = {};
  const res = RES.filter(k => met.has(k)).concat(trig(c).filter(t => t.do === 'gain' && t.resource).map(t => 'gain ' + t.resource));
  if (res.length) { out.push('Resource'); why.Resource = res; }
  const sup = SUPPORT.filter(k => met.has(k)).concat(trig(c).filter(t => ['shield', 'heal', 'buff'].includes(t.do) && t.who === 'ally').map(t => 'ally ' + t.do));
  if (sup.length) { out.push('Support'); why.Support = sup; }
  const rng = rawOf(c).filter(k => RANGED.has(k)).map(k => L3.nameOf(L3.skillId(k, c.effects[k])));
  if (rng.length) { out.push('Ranged'); why.Ranged = rng; }
  const def = DEFEND.filter(k => met.has(k));
  if (def.length) { out.push('Defender'); why.Defender = def; }
  // Cute: a Baby; a young animal by name; the style guide's Cute genre (docs/style-guideline.md: starter/common, Attack + Health under 15)
  const ah = (c.attack || 0) + (c.health || 0), cute = [];
  if (c.kind === 'baby') cute.push('baby');
  if (YOUNG.test(c.id)) cute.push('young animal');
  if (SMALL.test(c.id)) cute.push('small animal');
  if ((firstMap[c.id] ?? 99) <= 5 && ['starter', 'common'].includes(c.rarity) && ah < 15) cute.push('Cute genre (Maps 0-5, ' + c.rarity + ', A+H ' + ah + ')');
  if (cute.length) { out.push('Cute'); why.Cute = cute; }
  return { roles: out, why };
}
function budgetAt(c, mapNo) { // budget() at Level 1 as if obtained on mapNo (a moved card is judged at its new map)
  const d = Object.assign({}, c, { obtainMap: mapNo });
  const b = T.budget(d, { level: 1 });
  return { x1: Math.round(b.x1 * 10) / 10, N: b.N, fill: Math.round(1000 * Math.max(b.x1 / b.N, b.x2 / b.N2)) / 10, ok: b.ok };
}
const firstMap = {}; MAP_IDS.forEach((mid, mi) => POOLS[mid].cards.forEach(id => { if (firstMap[id] == null) firstMap[id] = mi; }));

const maps = MAP_IDS.map((mid, mi) => {
  const ids = POOLS[mid].cards;
  const rows = ids.map(id => {
    const c = BYID[id], met = metOf(c), home = firstMap[id];
    const b = budgetAt(c, home); // its own power and fill at its home (first) list, as the budget sees it
    const r = roles(c, met, mi);
    const focus = FOCUS[mi].skills.filter(k => met.has(k));
    return { id, name: c.name, rarity: c.rarity, kind: c.kind || null, attack: c.attack, health: c.health, power: b.x1, N: b.N, fill: b.fill, home,
      owner: OWNER.has(id), skills: [...met].map(L3.nameOf), focus: focus.map(L3.nameOf), focusKeys: focus, roles: r.roles, why: r.why };
  });
  const sorted = rows.slice().sort((a, b) => b.power - a.power), top = Math.ceil(rows.length / 3);
  sorted.forEach((r, i) => { if (i < top) { r.roles.unshift('Strong'); r.why.Strong = ['power ' + r.power + ' (#' + (i + 1) + ' of ' + rows.length + ')' + (i === 0 ? ', map peak' : '')]; } });
  const peak = sorted[0];
  const have = r => rows.filter(x => x.roles.includes(r)).map(x => x.id);
  const roleCount = {}; ['Strong', 'Cute', 'Resource', 'Support', 'Ranged', 'Defender'].forEach(r => roleCount[r] = have(r));
  const focus = FOCUS[mi].skills.map(k => ({ key: k, name: L3.nameOf(k), carriers: rows.filter(x => x.focusKeys.includes(k)).map(x => x.id),
    homeCarriers: rows.filter(x => x.focusKeys.includes(k) && x.home === mi).map(x => x.id) }));
  return { map: mi, id: mid, name: FOCUS[mi].name, size: rows.length, peak: { id: peak.id, power: peak.power, attack: peak.attack, health: peak.health }, cards: rows, roles: roleCount, focus };
});
// power step: the map's peak vs the previous map's peak
maps.forEach((m, i) => { m.peakStep = i ? Math.round((m.peak.power - maps[i - 1].peak.power) * 10) / 10 : null; });

// ---- flags
const BY_DESIGN = { // a role that cannot appear yet without breaking REDESIGN3's "no skill before its focus map" rule
  Resource: m => m.map < 1 ? 'Foraging is New! on Map 1' : '',
  Defender: m => m.map < 1 ? 'Guardian is New! on Map 1, Armor and Shield on Map 2' : '',
  Ranged: m => m.map < 3 ? 'Arrow is New! on Map 3 (pushed out before it)' : '',
  Support: m => '', Cute: m => ''
};
maps.forEach(m => {
  m.flags = [];
  ['Resource', 'Support', 'Ranged', 'Defender'].forEach(r => { if (!m.roles[r].length) m.flags.push({ kind: 'no ' + r, byDesign: BY_DESIGN[r](m) || null }); });
  if (m.map <= 5 && !m.roles.Cute.length) m.flags.push({ kind: 'no Cute (Maps 0-5 theme)', byDesign: null });
  if (m.map <= 5 && m.roles.Cute.length && m.roles.Cute.length < 2) m.flags.push({ kind: 'one Cute card only (Maps 0-5 theme)', byDesign: null });
  if (m.peakStep != null && m.peakStep <= -5) m.flags.push({ kind: 'power peak below the previous map (' + m.peak.power + ' vs ' + (m.peak.power - m.peakStep).toFixed(1) + ')', byDesign: null });
  m.cards.filter(c => c.home === m.map).forEach(c => metOf(BYID[c.id]).forEach(k => { if (FIRST_MAP[k] != null && FIRST_MAP[k] > m.map) m.flags.push({ kind: c.name + ' shows ' + L3.nameOf(k) + ' before its map (' + FIRST_MAP[k] + ')', byDesign: BYID[c.id].rarity === 'starter' ? 'REDESIGN3 left starters untouched' : null }); }));
  m.focus.forEach(f => {
    if (!f.carriers.length) m.flags.push({ kind: 'focus ' + f.name + ': no carrier on the list', byDesign: null });
    else if (f.carriers.length < 2 && !SINGLE_OK.has(f.key)) m.flags.push({ kind: 'focus ' + f.name + ': one carrier (' + f.carriers.map(x => BYID[x].name).join(', ') + ')', byDesign: null });
  });
});

// ---- swap candidates per missing role: cards on another Maps 0-20 list (or a submap / special of any map) that carry the role, fit the budget at
// this map, show no skill before its focus map, and are not owner cards
const ALL = new Set(); MAP_IDS.map(k => POOLS[k]).forEach(e => { (e.cards || []).concat(e.special || []).forEach(x => ALL.add(x)); Object.values(e.submaps || {}).forEach(l => l.forEach(x => ALL.add(x))); });
function candidates(m, role) {
  const out = [];
  ALL.forEach(id => {
    const c = BYID[id]; if (!c || c.token || c.test || m.cards.some(x => x.id === id)) return;
    const met = metOf(c); const r = roles(c, met, m.map); if (!r.roles.includes(role)) return;
    const early = [...met].filter(k => FIRST_MAP[k] != null && FIRST_MAP[k] > m.map); if (early.length) return;
    const b = budgetAt(c, m.map); if (!b.ok) return;
    out.push({ id, name: c.name, rarity: c.rarity, archetypes: c.archetypes || [], home: firstMap[id] ?? null, owner: OWNER.has(id), fill: b.fill, why: r.why[role], skills: [...met].map(L3.nameOf) });
  });
  return out.sort((a, b) => (a.owner - b.owner) || (Math.abs((a.home ?? 99) - m.map) - Math.abs((b.home ?? 99) - m.map)) || (b.fill - a.fill)).slice(0, 6);
}
maps.forEach(m => { m.candidates = {}; m.flags.filter(f => /^no (Resource|Support|Ranged|Defender|Cute)/.test(f.kind) && !f.byDesign).forEach(f => { const r = f.kind.split(' ')[1]; m.candidates[r] = candidates(m, r); }); });

// ---- proposals (hand-picked from the candidates above; at most 2 per flagged map). in = a card onto the map's MAP list (a carry when it is
// already on an earlier main list: its home and budget do not change), out = a card off it (a carry, not an owner card, not a focus carrier);
// tweak = a skill change on one card. The script checks each: budget at the in card's (new) home, no skill before its map, out not a focus carrier.
const PROPOSALS = [
  { map: 4, fixes: 'no Support', in: 'newt-doctor', out: 'duck-paddler', why: 'a pond newt that heals (Nursing, Herbalist); first listed on Map 4 instead of 5. Duck Paddler is a Map 0 starter carry with no other role' },
  { map: 4, fixes: 'no Ranged', in: 'eagle-sharpshooter', out: 'conch-crawler', why: 'Arrow carry from Map 3 (common for common); Map 4 keeps Snapstick Turtle and Kittiwake Flock as defenders' },
  { map: 5, fixes: 'no Ranged', in: 'balloon-archer', out: 'platypus-spur', why: 'Arrow carry from Map 3 (uncommon for uncommon); Platypus is a Map 4 carry with no role Map 5 lacks' },
  { map: 6, fixes: 'no Resource', in: 'nutria-reedcutter', out: 'water-shrew', why: 'Forestry carry from Map 5 (swamp reed-cutter); Water Shrew is a Map 4 carry' },
  { map: 6, fixes: 'focus Leech: one carrier', tweak: { id: 'barrow-leech-bat', set: { flying: true, parasite: true, sap: true }, label: 'Nocturnal 1 -> Leech (Sap), 1/9 kept' }, why: 'Barrow Leech gets Leech back as the 2nd carrier: DATAFIX dropped Sap for "too many skills"; dropping Nocturnal (Map 4 focus) instead keeps two skills plus Flying' },
  { map: 7, fixes: 'no Resource', in: 'truffle-piglet', out: 'planarian-splitter', why: 'Forestry + Foraging, a truffle hunter in the mushroom hollow (today only on The Undercroft); uncommon for uncommon; Planarian is a Map 4 carry' },
  { map: 8, fixes: 'no Ranged', in: 'puffball-bombardier', out: 'corpse-flower-beetle', why: 'Poison Powder carry from Map 7 (a cave puffball); Corpse-flower Beetle is a Map 7 carry (rare out, uncommon in)' },
  { map: 9, fixes: 'no Support', in: 'newt-doctor', out: 'booming-bittern', why: 'Nursing carry (Map 4 or 5); uncommon for uncommon; Booming Bittern is a Map 6 carry with no role Map 9 lacks' },
  { map: 10, fixes: 'no Support', in: 'beluga', out: 'tide-spirit', why: 'Inspiring whale (Ocean), today on a Map 17 side map; rare for rare; Tide Seahorse is a Map 9 carry with Tide only' },
  { map: 12, fixes: 'no Support', in: 'hedgehog-herbalist', out: 'barrow-leech-bat', why: 'Herbalist hedgehog in the briars (today on Map 1\'s Old Bramble and Map 5\'s SPECIAL); rare for rare; the bat is a Map 6 carry' },
  { map: 13, fixes: 'power peak below Map 12', in: 'eyrie-warden', out: 'slow-worm', why: 'the Map 11-12 peak (power 37.1) carried on; Slow-worm is a Map 4 carry (common for common)' },
  { map: 14, fixes: 'focus Pack: one carrier', tweak: { id: 'plains-zebra', set: { pack: 1 }, label: 'Evasive -> Pack 1, 1/9 kept' }, why: 'zebras herd: 2nd Pack carrier without touching Dust Hyena (Carnage is your More idea there)' },
  { map: 14, fixes: 'focus Pack: one carrier (or)', in: 'dhole-runner', out: 'river-mink', why: 'alternative to the zebra tweak: Pack 2 wild dog from The Undercroft; River Mink is a Map 4 carry (uncommon out, common in)' },
  { map: 16, fixes: 'no Support', in: 'beaver-feller', out: 'farm-dog', why: 'Repair + Lumber on kill carry from Map 13 (a forest beaver); Farm Dog is a Map 0 carry' },
  { map: 16, fixes: 'no Ranged; power peak', in: 'eyrie-warden', out: 'puffin-diver', why: 'Twin Shot carry (power 37.1 lifts the peak from 35.7); Puffin Diver is a Map 3 carry' },
  { map: 17, fixes: 'no Support', in: 'beluga', out: 'taiga-lynx', why: 'the tundra whale from Map 17\'s own side map onto its MAP list (Inspiring); rare for rare; Taiga Lynx is a Map 16 carry' },
  { map: 17, fixes: 'no Ranged', in: 'eyrie-warden', out: 'briarback-hedgehog', why: 'Twin Shot carry; common for common; Briarback Hedgehog is a Map 12 carry' },
  { map: 18, fixes: 'power peak below Map 17', in: 'siege-rhino', out: 'savanna-cheetah', why: 'very rare for very rare; peak 29.3 -> 35.7 (Map 17 carries Gilded Roadwarden 45.4)' },
  { map: 19, fixes: 'no Resource', in: 'cone-cutter-squirrel', out: 'dune-jackal', why: 'Foraging + Lumber on play carry from Map 16; common for common; Dune Jackal is a Map 18 carry' },
  { map: 19, fixes: 'no Support', in: 'hoopoe-herald', out: 'sulfur-cinder-moth', why: 'Herald carry from Map 14; common for common; the moth is a Map 8 carry' },
  { map: 20, fixes: 'no Support', in: 'hoopoe-herald', out: 'honey-badger-fury', why: 'Herald carry (with the Map 19 swap); common for common; Honey Badger Fury is a Map 19 carry' }
];
PROPOSALS.forEach(p => {
  const m = maps[p.map], chk = [];
  if (p.in) {
    const c = BYID[p.in], home = Math.min(firstMap[p.in] ?? 99, p.map), b = budgetAt(c, home);
    p.inName = c.name; p.inRarity = c.rarity; p.inHome = firstMap[p.in] ?? null; p.newHome = home; p.inFill = b.fill; p.inOk = b.ok;
    const early = [...metOf(c)].filter(k => FIRST_MAP[k] != null && FIRST_MAP[k] > home); if (early.length) chk.push('skill before its map: ' + early.join(','));
    if (!b.ok) chk.push('over budget at Map ' + home); if (OWNER.has(p.in)) chk.push('owner card');
    p.inRoles = roles(c, metOf(c), p.map).roles;
  }
  if (p.out) {
    const r = m.cards.find(x => x.id === p.out); if (!r) chk.push('out card not on the list');
    else { p.outName = r.name; p.outRarity = r.rarity; p.outHome = r.home; if (r.focusKeys.length) chk.push('out carries focus ' + r.focus.join(',')); if (r.owner) chk.push('out is an owner card'); if (r.home === p.map) chk.push('out is the map\'s own card'); }
  }
  if (p.tweak) {
    const c = BYID[p.tweak.id], d = Object.assign({}, c, { effects: p.tweak.set }), b = budgetAt(d, firstMap[c.id]);
    p.tweakName = c.name; p.tweakFill = b.fill; p.tweakOk = b.ok; if (!b.ok) chk.push('tweak over budget'); if (OWNER.has(c.id)) chk.push('owner card');
  }
  p.check = chk.length ? chk : ['ok'];
});
maps.forEach(m => { m.proposals = PROPOSALS.filter(p => p.map === m.map); });

const out = { package: 'ROLE1', date: '2026-11-18', status: 'analysis + proposals (nothing applied)',
  source: { lists: 'canonical/map-pools.json MAP lists, Maps 0-20 (m1 ... m11)', cards: 'canonical/cards.json (after FOLD6, SKAUD1, CONTENT13, DATAFIX)', focus: 'docs/design/redesign3-2026-11-17.json focus (v2)', generator: 'tools/role1/gen.js' },
  rules: {
    Strong: 'top third of the list by power = the budget left side x1 (2A + H + S, x the miss multiplier) from tools/skill_costs.js budget() at Level 1 at the card\'s home (first) list; the #1 is the map peak',
    Cute: 'kind baby; a young animal by id (kit, pup, cub, calf, fawn, chick, duckling, hatchling, fry, sprout, grub ...); a small animal by id (shrew, mouse, chipmunk, vole, pika, rabbit, hare, hedgehog, squirrel, meerkat, robin ...); or, for a card first listed on Maps 0-5, the style guide\'s Cute genre (starter/common, Attack + Health under 15). Missing Cute flagged on Maps 0-5 only',
    Resource: RES.join(', ') + ', or a trigger that gains a resource (Lumber ...)',
    Support: SUPPORT.join(', ') + ', or a trigger that shields / heals / buffs allies',
    Ranged: 'any skill whose delivery is "ranged" in canonical/skill-delivery.json (arrows, bolts, Snipe, Twin Shot, Electricity, powders ...)',
    Defender: DEFEND.join(', ') + ' (Thorns not counted)',
    Focus: 'the map\'s REDESIGN3 v2 focus skills shown at the card\'s base level (tools/redesign3/lib3.js metSkills); 2+ carriers wanted (Bloom, Meiosis: one allowed)' },
  maps };
fs.writeFileSync(ROOT + '/docs/design/role1-2026-11-18.json', JSON.stringify(out, null, 1) + '\n');
// short console summary
maps.forEach(m => console.log(m.map, m.name, 'n=' + m.size, 'peak', m.peak.id, m.peak.power, 'step', m.peakStep, '|', Object.entries(m.roles).map(([r, l]) => r[0] + r[1] + l.length).join(' '), '|', m.flags.map(f => f.kind + (f.byDesign ? ' [design]' : '')).join('; ')));

// ---- the owner-facing page (docs/design/role1-2026-11-18.md), from the same data
const PROT = ['guardian', 'taunt', 'bulwark']; // BAL9 JJ28's defender keys (tools/bal9/decks_2026_11_02.js DEFENDER_KEYS on these lists)
maps.forEach(m => { m.protectors = m.cards.filter(c => (c.why.Defender || []).some(k => PROT.includes(k))).map(c => c.id); });
const nm = id => (BYID[id] || {}).name || id;
const R = ['Strong', 'Cute', 'Resource', 'Support', 'Ranged', 'Defender'];
const L = [];
L.push('# ROLE1: card roles on the Maps 0-20 lists (analysis, 2026-11-18)', '');
L.push('Owner 2026-11-18 20:42: does each map\'s card list keep "some sort of balance - strong creatures, cute, resource etc" after REDESIGN3 v2 (folded by FOLD6)?', '');
L.push('**Analysis and proposals only. Nothing applied.** Machine copy: `docs/design/role1-2026-11-18.json`. Generator: `node tools/role1/gen.js` (read-only; rewrites the .json and this page).', '');
L.push('- **Inputs:** `canonical/map-pools.json` MAP lists of Maps 0-20 (a card counts on every list that holds it; "home" = its first list), `canonical/cards.json` (after FOLD6, SKAUD1, CONTENT13, DATAFIX), REDESIGN3 v2 focus skills (`docs/design/redesign3-2026-11-17.json`).');
L.push('- **Role rules (from data):**');
Object.entries(out.rules).forEach(([k, v]) => L.push('  - ' + k + ': ' + v + '.'));
L.push('- **Role rules already in the data:** only BAL9 JJ28 (a Guardian / Taunt / Bulwark defender on every main map 1-19, `tests/bal9-2026-11-02.js`). Card counts and rarity mixes were the only other things REDESIGN3 kept.', '');
L.push('## Summary', '');
L.push('| Map | Cards | Peak (power) | Strong | Cute | Resource | Support | Ranged | Defender (JJ28 wall) | Focus carriers | Flags |');
L.push('|---|---|---|---|---|---|---|---|---|---|---|');
maps.forEach(m => {
  const f = m.focus.map(x => x.name + ' ' + x.carriers.length).join(', ');
  const fl = m.flags.filter(x => !x.byDesign).map(x => x.kind).join('; ') || '-';
  L.push(`| ${m.map} ${m.name} | ${m.size} | ${nm(m.peak.id)} (${m.peak.power}) | ${m.roles.Strong.length} | ${m.roles.Cute.length} | ${m.roles.Resource.length} | ${m.roles.Support.length} | ${m.roles.Ranged.length} | ${m.roles.Defender.length} (${m.protectors.length}) | ${f} | ${fl} |`);
});
L.push('', 'By design (not flagged as a problem): Maps 0-2 have no ranged card (Arrow is New! on Map 3); Map 0 has no defender (Guardian is New! on Map 1, Armor and Shield on Map 2); Map 0 starters Honey Bee (Diurnal), Silver Minnow (Tide) and Chipmunk Forager (Foraging) show a skill before its focus map (REDESIGN3 left starters untouched). Map 2\'s only JJ28 wall (The Old Shell) is on its SPECIAL list, not the MAP list.', '');
L.push('## Flags', '');
maps.forEach(m => { const fl = m.flags.filter(x => !x.byDesign); if (fl.length) L.push(`- **Map ${m.map} ${m.name}:** ${fl.map(x => x.kind).join('; ')}.`); });
L.push('- **Map 5 (owner card):** Cypress Root Lurker shows Constrict (Map 6 focus) on Map 5. Why: DATAFIX put it on Map 5\'s list as the map\'s only JJ28 Guardian wall. Not retuned (owner card); the fix, if wanted, is another Guardian for Map 5 so the lurker can leave that list.');
L.push('- **Why the two focus gaps:** DATAFIX (2026-11-18) dropped Pack from Dust Hyena (Pack + Carnage + Lumber on kill = three skills) and Sap from Barrow Leech Bat (too many skills); each was its focus skill\'s 2nd carrier.');
L.push('- **Power peaks:** a map\'s peak is its strongest listed card. Maps 13, 16 and 18 fall 7-16 points below the map before, because the previous list carries a later strong card (Eyrie Warden on 11-12, Gilded Roadwarden on 15 and 17) that the next list drops.', '');
L.push('## Proposed swaps (proposals, nothing applied)', '');
L.push('In = onto the map\'s MAP list (a carry when it is already on an earlier main list: home and budget unchanged); out = off it (always a carry, never an owner card or a focus carrier). Fill = `budget()` at Level 1 at the card\'s home. Every proposal keeps the list size and the focus skills; "check" is the script\'s test.', '');
L.push('| # | Map | Fixes | Change | Fill | Check | Why |'); L.push('|---|---|---|---|---|---|---|');
let n = 0;
PROPOSALS.forEach(p => { n++; p.n = n;
  const ch = p.tweak ? `${p.tweakName}: ${p.tweak.label}` : `+ ${p.inName} (${p.inRarity}, ${p.inHome == null ? 'side map / SPECIAL only' : 'Map ' + p.inHome}${p.newHome !== p.inHome ? ', first listed on Map ' + p.newHome : ''}) / - ${p.outName} (${p.outRarity}, Map ${p.outHome} carry)`;
  L.push(`| ${n} | ${p.map} | ${p.fixes} | ${ch} | ${p.tweak ? p.tweakFill : p.inFill} | ${p.check.join('; ')} | ${p.why} |`); });
{ const multi = {}; PROPOSALS.forEach(p => { if (p.in) (multi[p.in] = multi[p.in] || []).push('#' + p.n); });
  const alt = PROPOSALS.filter(p => /\(or\)/.test(p.fixes)).map(p => '#' + (p.n - 1) + ' or #' + p.n);
  L.push('', 'Links: ' + Object.entries(multi).filter(([, l]) => l.length > 1).map(([id, l]) => nm(id) + ' (' + l.join(', ') + ')').join(', ') + ' serve more than one map; ' + alt.join(', ') + ': take one. Left open (2-swap cap): Map 6 Ranged.', ''); }
L.push('## Per map', '');
L.push('Power = `budget()` x1 at Level 1 at the card\'s home list. Home = the first Maps 0-20 list that holds it (a lower number = carried). **O** = owner-set card. Focus = this map\'s focus skills the card carries.', '');
maps.forEach(m => {
  L.push(`### ${m.map} ${m.name}`, '');
  L.push('Focus: ' + m.focus.map(f => `${f.name} (${f.carriers.map(nm).join(', ') || 'none'})`).join(', ') + '.', '');
  L.push('| Card | Rarity | A/H | Power | Home | Roles | Skills | Focus |'); L.push('|---|---|---|---|---|---|---|---|');
  m.cards.forEach(c => L.push(`| ${c.name}${c.owner ? ' (O)' : ''} | ${c.rarity} | ${c.attack}/${c.health} | ${c.power} | ${c.home} | ${R.filter(r => c.roles.includes(r)).join(', ') || '-'} | ${c.skills.join(', ') || '-'} | ${c.focus.join(', ') || '-'} |`));
  L.push('');
});
fs.writeFileSync(ROOT + '/docs/design/role1-2026-11-18.md', L.join('\n'));
fs.writeFileSync(ROOT + '/docs/design/role1-2026-11-18.json', JSON.stringify(Object.assign(out, { proposals: PROPOSALS }), null, 1) + '\n');
