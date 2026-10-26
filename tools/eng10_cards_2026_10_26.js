#!/usr/bin/env node
// Package ENG10 (2026-10-26): the card edits the owner's 10-26 11:19 answers ask for, then the re-fit of every card whose price moved.
//   edits: ENG9-5  the Fungi cards get the type Mushroom (their species stays Fungi, now under the Flora phylum); Flora cards that are clearly a
//                  tree, a flower or a vine get that type in place of the plain Flora (the taxonomy makes Tree / Fruit / Flower / Vine /
//                  Mushroom children of Flora, so every "Flora" rule still counts them);
//          PROP1-1 Dragonscale Mail gets Hardy 2 (equip.hardy);
//          PROP1-3 the Gangrenous Leech becomes a Parasite (Parasite + Gorge, the old Fester key; its Poison 2 stays on its swings);
//          PROP1-4 one threshold skill on one card of Maps 0-20 each, by the proposal's thematic homes, at most two new skills a map:
//                  Throng (Carrion Fly Swarm, Caves & Alcoves, Map 8), Carnage (Dust Hyena, Savanna Reaches, Map 14), Muster (Wolf Pack
//                  Runner, the Pinewood Taiga, Map 16), Dirge (Wolfsbane Alpha, 17-8) and Beset (Ravenous Wolverine, in place of its Scarcity;
//                  Wolfsbane Tundra, Map 17), Requiem (Cinder Skeleton, the Sundered Peak, Map 20). (The Carrion Crow is no band card and
//                  the Lone Grey Wolf has no legal line with Lone Wolf and Beset: S 13.8 breaks cap 2.)
//   re-fit: as tools/eng9_cards_2026_10_26.js (the largest line on the card's own Attack : Health shape inside both caps at Level 1 and its
//          start level, use <= 100% of N; band cards only), but both ways: the owner said "Cut to new armor formula" (ENG9-9), so a card on
//          the old line whose price moved goes to the new line up or down. A card the edits above touch is re-fit whatever line it sat on,
//          and the two cards ENG9 held (Tide Pool Crab, Hawthorn Shieldbug) are cut to the line (owner ENG9-9). Cards off the old line that
//          nothing else touched are listed, not moved.
//   node tools/eng10_cards_2026_10_26.js <skill-costs-before.json> <cards-before.json>          dry run
//   node tools/eng10_cards_2026_10_26.js <skill-costs-before.json> <cards-before.json> apply    writes canonical/cards.json + docs/balance/eng10-refit-2026-10-26.json
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
const NOTE = '2026-10-26 (package ENG10)';
const before = SC.make(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
const beforeCards = new Map(JSON.parse(fs.readFileSync(process.argv[3], 'utf8')).map(c=> [c.id, c]));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const kindOf = new Map((Array.isArray(plan) ? plan : plan.rows || []).map(r=> [r.id, r.kind]));
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const byId = new Map(cards.map(c=> [c.id, c])), note = (c, s)=>{ c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `${NOTE}: ${s}`; };
// ---- edits ------------------------------------------------------------------------------------------------------------------------
const edits = [], touched = new Set(['tide-pool-crab', 'hawthorn-shieldbug']);
const TYPES = {'fungal-colossus': ['Mushroom'], 'puffball-bombardier': ['Mushroom', 'Cave'], 'phoenix-mushrooms': ['Mushroom'],
  'ent': ['Tree'], 'elder-willow': ['Tree', 'Structure'], 'old-willow-of-the-ford': ['Tree', 'River'], 'heartwood-treant': ['Tree'], 'petrified-tree': ['Tree', 'Structure'],
  'hazel-coppice': ['Tree', 'Structure', 'Forest'], 'cypress-root-lurker': ['Swamp', 'Tree'], 'rafflesia': ['Rainforest', 'Flower'], 'strangler-vine': ['Rainforest', 'Vine'],
  'thornvine-lasher': ['Vine'], 'bramble-sprout': ['Vine']};
Object.entries(TYPES).forEach(([id, arch])=>{ const c = byId.get(id); if(!c) return; const was = (c.archetypes || []).join('/'); if(was === arch.join('/')) return;
  c.archetypes = arch; note(c, `type ${was} -> ${arch.join('/')} (owner ENG9-5: "Can existing Funghi have a type of mushroom? Then flora is the phyla, and trees, fruits, flowers etc are the type.").`);
  edits.push(`${id}: ${was} -> ${arch.join('/')}`); });
{ const c = byId.get('dragonscale-mail'); if(c && c.equip && !c.equip.hardy){ c.equip = Object.assign({}, c.equip, {hardy: 2}); note(c, 'Hardy 2 (PROP1-1: two lives, a break takes one).'); edits.push('dragonscale-mail: Hardy 2'); } }
{ const c = byId.get('gangrenous-leech'); if(c && c.effects && !c.effects.parasite){ c.effects = Object.assign({parasite: true}, c.effects); touched.add(c.id);
  note(c, 'a Parasite now (PROP1-3: Fester reads Gorge, the round-end half-strength feed of a hooked Parasite); its Poison 2 stays on its swings.'); edits.push('gangrenous-leech: + Parasite (Gorge)'); } }
// The Stone Turtle Warden (Common, Armor 4, Tide): Armor 4 alone (S 12.2, S x |S| 149) is over its cap 2 (124) at any stats, so it can't stay on
// the new line: Armor 3 (S 8.1 + Tide), then the line (call ENG10-2).
{ const c = byId.get('stone-turtle-warden'); if(c && c.effects && Number(c.effects.armor) === 4){ c.effects = Object.assign({}, c.effects, {armor: 3}); touched.add(c.id);
  note(c, 'Armor 4 -> 3 (ENG9-9: Armor 4 alone is over its cap 2 under the new, slightly exponential Armor price; call ENG10-2).'); edits.push('stone-turtle-warden: Armor 4 -> 3 (no legal line at Armor 4)'); } }
const THR = [['carrion-fly-swarm', 'throng'], ['wolfsbane-alpha', 'dirge'], ['dust-hyena', 'carnage'], ['wolf-pack-runner', 'muster'], ['ravenous-wolverine', 'beset', 'scarcity'], ['cinder-skeleton', 'requiem']];
const THR_WHY = {throng: 'swarms that thrive in a crowd', dirge: 'the pack mother that lost her own', carnage: 'a scavenger that smells blood', muster: 'a pack animal', beset: 'a lone hunter at its best when outnumbered', requiem: 'the undead of the Sundered Peak'};
THR.forEach(([id, k, swap])=>{ const c = byId.get(id); if(!c || (c.effects || {})[k]) return; const e = Object.assign({}, c.effects || {}); if(swap) delete e[swap]; e[k] = BB.THR_DEFAULT_N[k]; c.effects = e; touched.add(id);
  note(c, `${k[0].toUpperCase() + k.slice(1)} ${BB.THR_DEFAULT_N[k]} – {+2/+2}${swap ? ' in place of ' + swap[0].toUpperCase() + swap.slice(1) + ' (the two-skill rule)' : ''} (PROP1-4, ${THR_WHY[k]}).`); edits.push(`${id}: + ${k} ${BB.THR_DEFAULT_N[k]}${swap ? ' (was ' + swap + ')' : ''}`); });
// ---- re-fit -----------------------------------------------------------------------------------------------------------------------
function okWith(TT, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = TT.budget(d, {level: 1}), bs = lv === 1 ? b1 : TT.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
function lineOf(TT, c){ const A0 = c.attack || 0, sH = Math.max(1, c.health); let best = null;
  for(let k = 0.05; k <= 6; k += 0.01){ const A = A0 === 0 ? 0 : Math.max(1, Math.round(A0 * k)), H = Math.max(1, Math.round(sH * k));
    const u = okWith(TT, c, A, H); if(u && (!best || u > best.u || (u === best.u && A + H > best.A + best.H))) best = {A, H, u}; }
  return best; }
const sOld = c=>{ const b = beforeCards.get(c.id) || c; return before.budget(b, {level: 1}).S || 0; };
const moved = cards.filter(c=> c.health != null && (touched.has(c.id) || Math.abs((T.budget(c, {level: 1}).S || 0) - sOld(c)) > 1e-9));
const raises = [], cuts = [], flagged = [], skipped = [], same = [], offLine = [];
for(const c of moved){
  if(kindOf.get(c.id) !== 'band' || c.easterEgg || c.test){ skipped.push(c.id); continue; }
  const A0 = c.attack || 0, H0 = c.health;
  if(!touched.has(c.id)){ const was = lineOf(before, beforeCards.get(c.id) || c); if(!was || was.A !== A0 || was.H !== H0){ offLine.push({id: c.id, at: `${A0}/${H0}`, oldLine: was ? `${was.A}/${was.H}` : 'none'}); continue; } }
  const best = lineOf(T, c), s0 = sOld(c), s1 = T.budget(c, {level: 1}).S;
  if(!best){ flagged.push(c.id); continue; }
  const row = {id: c.id, from: `${A0}/${H0}`, to: `${best.A}/${best.H}`, S: `${+s0.toFixed(2)} -> ${+s1.toFixed(2)}`, use: Math.round(best.u * 100)};
  if(best.A === A0 && best.H === H0){ same.push(row); continue; }
  (2 * best.A + best.H >= 2 * A0 + H0 ? raises : cuts).push(Object.assign(row, {c, A: best.A, H: best.H}));
}
console.log('edits:\n  ' + edits.join('\n  '));
console.log(`${moved.length} cards' price moved or touched (${skipped.length} not band / test, ${offLine.length} off the old line: left alone); ${raises.length} raise, ${cuts.length} cut, ${same.length} stay, ${flagged.length} no legal line`);
raises.forEach(m=> console.log(`  raise ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}`));
cuts.forEach(m=> console.log(`  cut   ${m.id.padEnd(28)} ${m.from.padStart(6)} -> ${m.to.padEnd(6)} S ${m.S}`));
same.forEach(m=> console.log(`  same  ${m.id.padEnd(28)} ${m.from.padStart(6)}          S ${m.S}`));
if(flagged.length) console.log('  flagged: ' + flagged.join(', '));
offLine.forEach(m=> console.log(`  off   ${m.id.padEnd(28)} ${m.at.padStart(6)}  (old line ${m.oldLine})`));
if(skipped.length) console.log('  not band: ' + skipped.join(', '));
if(process.argv.includes('apply')){
  for(const m of raises.concat(cuts)){ m.c.attack = m.c.attack == null && m.A === 0 ? m.c.attack : m.A; m.c.health = m.H; note(m.c, `re-fit ${m.from} -> ${m.to} (S ${m.S}).`); }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eng10-refit-2026-10-26.json'), JSON.stringify({about: `ENG10 re-fit (${NOTE}): prices from tools/eng10_skill_costs_2026_10_26.py and bramblewood-budget.js (thrS). Raises and cuts applied (owner ENG9-9: "Cut to new armor formula"); off-line cards listed.`,
    edits, moved: moved.map(c=> c.id), notBand: skipped, offLine, raised: raises.map(({c, A, H, ...r})=> r), cut: cuts.map(({c, A, H, ...r})=> r), same, flagged}, null, 1) + '\n');
  const FP = path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'); let prev = []; try{ prev = JSON.parse(fs.readFileSync(FP, 'utf8')); }catch(e){}
  const cutIds = new Set(cuts.map(m=> m.id).concat(['tide-pool-crab', 'hawthorn-shieldbug'])); const next = prev.filter(id=> !cutIds.has(id)); if(next.length !== prev.length) fs.writeFileSync(FP, JSON.stringify(next, null, 1) + '\n'); // the cut cards leave the held list
  console.log('applied');
}
