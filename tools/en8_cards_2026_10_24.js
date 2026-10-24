#!/usr/bin/env node
// Package EN8 (2026-10-24): the cards of the resource skills and the archetype clean-up.
//   owner 22:28 #2 / LUM-1: one or two thematic cards for each new skill (Stonecutter, Prospector, Felling, Pearl Bed, Coppice, Driftwood,
//     Scavenge, Salvage; Magic Armor from P24-16), placed in a Maps 0-20 pool by biome as pack cards (no faction cards). The Shellfish:
//     the Oyster Bank (Pebble Beach, Map 2) and the Giant Clam (Coral Current, Map 10), both already placed, carry Pearl Bed.
//   owner 22:28 #10: the Leafcutter Gardener's Growth (a skill that does nothing) becomes "On Ready: +1 Lumber" (it brings the leaves home).
//   owner 21:20 #7: Stem (the Fodder EV-6 gave baby-like cards from Level 1) comes off every card first obtainable before Map 20; the
//     Speckled Egg's Stem comes off too; the Cocoon's Chrysalis shows as "?" (mysterySkills) until the Evomax maps.
// Stats: the formula line on each card's shape (as tools/content2_2026_10_24.js fit: the most stats in its Attack : Health that pass both
// budget rules at Level 1 and at its start level). Placeholder art: the emoji; prompts in docs/art/en8-2026-10-24-briefs.md.
//   node tools/en8_cards_2026_10_24.js add | fit | check
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const CMD = process.argv[2] || 'check';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half'); // the budget's world, as tools/refit_pass_2026_10_21.js prices
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json'), OBTAIN = path.join(ROOT, 'canonical', 'card-obtain-maps.json');
const NOTE = '2026-10-24 (package EN8) ';
const base = {locked: true, test: false, dmgType: 'physical', resist: [], tags: []};
const NEW = [
 {id: 'marmot-stonecutter', name: 'Marmot Stonecutter', icon: '🐿️', cost: 0, wait: 1, attack: 1, health: 8, rarity: 'common', archetypes: ['Mountain'], species: ['Rodent'], animal: 'marmot',
  effects: {stonecutter: 1}, flavor: 'It whistles at every rock before it splits it. The rocks never whistle back, which it takes as permission.',
  place: ['m10', 2, 'Eyrie Heights (Map 11), alpine: Stonecutter 1 among the scree']},
 {id: 'prospector-mole', name: 'Prospector Mole', icon: '⛏️', cost: 0, wait: 1, attack: 2, health: 7, rarity: 'common', archetypes: ['Cave', 'Mole'], species: ['Mammal'], animal: 'mole',
  effects: {prospector: 1}, flavor: 'Wherever it wins a tunnel fight, it keeps digging. There is always a glint further down.',
  place: ['m4', 2, 'Caves & Alcoves (Map 8), the Stone and ore map: Prospector 1']},
 {id: 'beaver-feller', name: 'Beaver Feller', icon: '🦫', cost: 0, wait: 1, attack: 2, health: 8, rarity: 'common', archetypes: ['Forest', 'Beaver'], species: ['Rodent'], animal: 'beaver',
  effects: {felling: 1}, flavor: 'Whatever falls in its way becomes a dam. It does not much mind what it was before.',
  place: ['mu', 2, 'The Morel Hollow (Map 7), forest under the old oaks: Felling 1']},
 {id: 'salvager-hermit-crab', name: 'Salvager Hermit Crab', icon: '🦀', cost: 0, wait: 1, attack: 1, health: 9, rarity: 'common', archetypes: ['Coastal', 'Crustacean'], species: ['Crustacean'], animal: 'hermit crab',
  effects: {salvage: 1}, flavor: 'Every wall that falls is a new shell to try on, and the pieces that do not fit become a fence.',
  place: ['m7', 2, 'Coral Current (Map 10), reef: Salvage 1 beside the Coral Polyp Colony (a Structure)']},
 {id: 'carrion-crow', name: 'Carrion Crow', icon: '🐦‍⬛', cost: 0, wait: 1, attack: 2, health: 5, rarity: 'common', archetypes: ['Bird'], species: ['Bird'], animal: 'crow',
  effects: {scavenge: 1, flying: true}, flavor: 'It follows every army in the hedgerows and leaves nothing behind that could be carried.',
  place: ['mh', 2, 'The Briar Maze (Map 12), meadow and hedgerow: Scavenge 1']},
 {id: 'hazel-coppice', name: 'Hazel Coppice', icon: '🌳', cost: 1, wait: 0, attack: 0, health: 14, rarity: 'common', archetypes: ['Structure', 'Forest'], species: ['Plant'], subtype: 'structure',
  effects: {coppice: 1}, flavor: 'Cut to the stump, it grows back in a ring of straight poles. Leave it alone a while and it pays you in timber.',
  place: ['mr', 2, 'The Redwood Deep (Map 13), forest: a Coppice Structure']},
 {id: 'beachcomber-sanderling', name: 'Beachcomber Sanderling', icon: '🐦', cost: 0, wait: 0, attack: 1, health: 5, rarity: 'common', archetypes: ['Coastal', 'Bird'], species: ['Bird'], animal: 'sanderling',
  effects: {driftwood: 1}, flavor: 'It runs after every wave on the way out and away from it on the way in, and comes back with sticks.',
  place: ['mb', 1, 'Pebble Beach (Map 2), the only beach map of 0-20: Driftwood 1']},
 {id: 'moonshell-snail', name: 'Moonshell Snail', icon: '🐌', cost: 0, wait: 1, attack: 1, health: 10, rarity: 'common', archetypes: ['Field'], species: ['Mollusc'], animal: 'snail',
  effects: {magicArmor: 1}, flavor: 'Its shell shines like the inside of a pearl. Sparks and frost slide off it; a plain boot does not.',
  place: ['ml', 3, 'The Long Grass (Map 15), meadow: Magic Armor 1 (P24-16)']},
];
// existing cards: their changed skills (then re-fitted on their own shape)
const EXISTING = {
  'oyster-bank': {effects: {shoreUp: true, pearlBed: 1}, why: 'a Shellfish (owner 22:28 #2): Pearl Bed 1 beside Shore Up'},
  'giant-clam': {effects: {shell: 2, tide: true, pearlBed: 1}, why: 'a Shellfish (owner 22:28 #2): Pearl Bed 1 beside Shell 2 (Tide is free, HB2-1)'},
  'leafcutter-gardener': {effects: {triggers: [{on: 'onReady', do: 'gain', resource: 'lumber', amount: 1}]}, why: '(owner 22:28 #10: "Leafcutter\'s should be about something that enhances your resources") Growth (which did nothing) -> On Ready: +1 Lumber: it carries the leaves home'},
};
const REFIT = ['raven-hexcaller', 'mire-witch-heron']; // EN8 (2026-10-25): Render's Daunt counters re-priced (0.8 a point): re-fitted on their shape
const STEM_FROM = 20; // Stem (Fodder) waits for the Evomax maps (20-40)
const MYSTERY = {'egg-bug': ['chrysalis']}; // the one Fodder skill shown as "?" (owner 21:20 #7)

const load = ()=> JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const save = cs=> fs.writeFileSync(CARDS, JSON.stringify(cs, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const uuidOf = id=>{ const h = crypto.createHash('sha1').update('en8-2026-10-24:' + id).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`; };
function serializePools(d){ // the format tools/fold_map_pools.js writes
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(d._about) + ',', ' "maps": {'], maps = Object.keys(d.maps);
  maps.forEach((id, i)=>{ const m = normalizeEntry(d.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(subs.length){ lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}${j < subs.length - 1 ? ',' : ''}`)); lines.push('   },'); }
    else lines.push('   "submaps": {},');
    lines.push(`   "special": ${ids(m.special)}`, `  }${comma}`); });
  lines.push(' }', '}'); return lines.join('\n') + '\n';
}
const obtainOf = ()=>{ try{ return JSON.parse(fs.readFileSync(OBTAIN, 'utf8')).maps || {}; }catch(e){ return {}; } };
const ARCH = ['stem', 'chrysalis', 'stemGrant', 'evolute', 'evoluteAlpha', 'evoluteOmega'];
const isEvomax = c=> c.mechanicLine === 'evolution';

function add(){
  const cs = load(), ids = new Set(NEW.map(c=> c.id));
  const keep = cs.filter(c=> !ids.has(c.id)), old = Object.fromEntries(cs.filter(c=> ids.has(c.id)).map(c=> [c.id, c]));
  let nid = Math.max(...keep.map(c=> c.numericId || 0)) + 1;
  for(const spec of NEW){
    const {place, ...c} = spec, prev = old[c.id];
    const card = Object.assign({}, base, c, {numericId: prev ? prev.numericId : nid++, uuid: uuidOf(c.id)});
    if(prev){ card.attack = prev.attack; card.health = prev.health; }
    card.source = {kind: 'pack', tier: place[1], map: place[0]};
    card.creatorNote = (prev && prev.creatorNote && /Fit:/.test(prev.creatorNote)) ? prev.creatorNote : NOTE + `placed in Pack ${place[1]}, ${place[0]}: ${place[2]}. Stats by the budget (fit).`;
    keep.push(card);
  }
  const om = obtainOf(); const stripped = [];
  for(const c of keep){
    const ex = EXISTING[c.id];
    if(ex && JSON.stringify(c.effects) !== JSON.stringify(ex.effects)){ c.effects = ex.effects; c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + ex.why + '.'; }
    if(isEvomax(c)) continue;
    const first = om[c.id] != null ? om[c.id] : 0;
    // Fodder (EV-6's Stem from Level 1) off a baby-like card obtainable before the Evomax maps
    const ls = c.levelSkills; if(ls && first < STEM_FROM) Object.keys(ls).forEach(lv=>{ const sk = ls[lv] || {}; if(sk.stem || sk.stemGrant){ delete sk.stem; delete sk.stemGrant; stripped.push(c.id);
      c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + `(owner 21:20 #7: "since evomax is only in play in 20-40, don't introduce stem first"): Fodder (Stem from Level ${lv}) removed; first obtainable on Map ${first}.`;
      if(!Object.keys(sk).length) delete ls[lv]; } });
    if(ls && !Object.keys(ls).length) delete c.levelSkills;
    const e = c.effects || {};
    if(MYSTERY[c.id]){ if(JSON.stringify(c.mysterySkills) !== JSON.stringify(MYSTERY[c.id])){ c.mysterySkills = MYSTERY[c.id].slice();
      c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + '(owner 21:20 #7: "one of the fodder skills can be a ? for now"): its Chrysalis reads "?" until the Evomax maps (mysterySkills); the rule stays (no evolute exists before Map 20).'; } }
    else if(first < STEM_FROM && (e.stem || e.stemGrant || e.chrysalis)){ delete e.stem; delete e.stemGrant; delete e.chrysalis; stripped.push(c.id);
      c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + NOTE + `(owner 21:20 #7): Stem removed, an Evomax skill on a card first obtainable on Map ${first}.`; }
  }
  save(keep);
  const doc = JSON.parse(fs.readFileSync(POOLS, 'utf8'));
  NEW.forEach(c=>{ const [map] = c.place, e = doc.maps[map] = normalizeEntry(doc.maps[map] || {}); if(!e.cards.includes(c.id)) e.cards.push(c.id); });
  fs.writeFileSync(POOLS, serializePools(doc));
  console.log('cards:', NEW.length, 'new; numericIds', NEW.map(c=> keep.find(x=> x.id === c.id).numericId).join(','), '; Stem off:', [...new Set(stripped)].join(', ') || 'none');
}
function budgetTools(){ const SC = require('./card_retune_2026_10_19.js').SC; const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'))); return {SC, T}; }
function use(SC, T, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return {ok: b1.ok && bs.ok && b1.x1 / b1.N <= 1, u: b1.x1 / b1.N, N: b1.N, S: b1.S}; }
function fit(){
  const {SC, T} = budgetTools(), cs = load(), rows = [], targets = new Set(NEW.map(c=> c.id).concat(Object.keys(EXISTING), REFIT));
  for(const c of cs){ if(!targets.has(c.id)) continue;
    const spec = NEW.find(x=> x.id === c.id) || {attack: c.attack, health: c.health}, sA = spec.attack, sH = spec.health; let best = null;
    for(let k = 0.05; k <= 6; k += 0.01){ const A = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), H = Math.max(1, Math.round(sH * k)), r = use(SC, T, c, A, H);
      if(r.ok && (!best || r.u > best.u || (r.u === best.u && A + H > best.A + best.H))) best = {A, H, u: r.u, N: r.N, S: r.S}; }
    if(!best){ rows.push(`${c.id}: no legal line`); continue; }
    const was = `${c.attack}/${c.health}`; c.attack = best.A; c.health = best.H;
    c.creatorNote = (c.creatorNote || '').replace(/ Fit \(EN8\): [^]*$/, '').replace(/ Stats by the budget \(fit\)\.$/, '') + ` Fit (EN8): the formula line on its ${sA}:${sH} shape, ${was} -> ${best.A}/${best.H} (${Math.round(best.u * 100)}% of N ${best.N}, S ${Math.round(best.S * 100) / 100}).`;
    rows.push(`${c.id.padEnd(24)} ${was.padStart(6)} -> ${best.A}/${best.H}  ${Math.round(best.u * 100)}% of N ${best.N}  S ${Math.round(best.S * 100) / 100}`); }
  save(cs); rows.forEach(r=> console.log(r));
}
function check(){
  const {SC, T} = budgetTools(), cs = load(), by = Object.fromEntries(cs.map(c=> [c.id, c])), doc = JSON.parse(fs.readFileSync(POOLS, 'utf8')), om = obtainOf(); let bad = 0;
  for(const spec of NEW.concat(Object.keys(EXISTING).map(id=> ({id})))){ const c = by[spec.id]; if(!c){ console.log('missing', spec.id); bad++; continue; }
    const r = use(SC, T, c, c.attack, c.health); if(!r.ok){ console.log('over budget', spec.id, Math.round(r.u * 100) + '%'); bad++; }
    if(spec.place && !(doc.maps[spec.place[0]].cards || []).includes(spec.id)){ console.log('not in pool', spec.id); bad++; } }
  for(const c of cs){ if(isEvomax(c) || c.pool) continue; const first = om[c.id] != null ? om[c.id] : 0; if(first >= STEM_FROM) continue;
    const e = c.effects || {}, ls = c.levelSkills || {};
    if((e.stem || e.stemGrant || (e.chrysalis && !(c.mysterySkills || []).includes('chrysalis'))) || Object.values(ls).some(s=> s && (s.stem || s.stemGrant))){ console.log('Stem before Map 20 on a non-Evomax card', c.id); bad++; } }
  const n = cs.map(c=> c.numericId).filter(x=> x != null), dup = n.filter((x, i)=> n.indexOf(x) !== i); if(dup.length){ console.log('duplicate numericId', dup.join(',')); bad++; }
  console.log(bad ? `${bad} problem(s)` : `ok: ${NEW.length} new cards on budget and placed; no Stem before Map 20`); process.exit(bad ? 1 : 0);
}
if(require.main === module){ if(CMD === 'add') add(); else if(CMD === 'fit') fit(); else check(); }
module.exports = {NEW, EXISTING, STEM_FROM, MYSTERY};
