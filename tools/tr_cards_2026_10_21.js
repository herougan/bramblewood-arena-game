#!/usr/bin/env node
// Package TR (2026-10-21, owner 18:23; docs/titles-transforms-2026-10-21.md): the card edits that come with the new rules.
//   1. HB2-1 ("Flying, Tide (plain), Diurnal (plain) and Nocturnal (plain) do not count as skills for the two-skill limit. Having several
//      of them counts as 1."): the skills BF5's two-skill cut (docs/balance/two-skills-2026-10-21.json) took only because one of these
//      counted come back. Re-run under the new count (bramblewood-budget.js skillCountOf), BF5's own order (Bounty, then a time of day,
//      then Darksight; a time of day goes only when that lowers the count; then the KEEP pair, plus at most one free skill) leaves the
//      skills in RESTORE on the card. The values are the card's own from before BF5 (git 16ed1e9c^). Not restored: the Raven Harbinger's
//      Bounty (package EV rebuilt it around Evolute: Bounty would be its third counted skill) and every skill BF6's bucket took off for
//      room under the caps (a budget cut, not the two-skill rule).
//   2. King (TR): the cards whose names say King or Queen (or a chieftain) and that rule something get the King skill, where the formula
//      still has room for it. A non-special card that would then count three skills loses its Bounty (BF5's order: Bounty goes first).
//   node tools/tr_cards_2026_10_21.js plan|apply   (apply writes canonical/cards.json; then re-fit by formula:
//   node tools/bf6_rederive_2026_10_21.js plan && node tools/bf6_rederive_2026_10_21.js apply --only=<the ids it prints> --note="...")
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), B = require(path.join(ROOT, 'bramblewood-budget.js'));
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json');
const PARAMS = B.PARAMS.concat(['arrowCount', 'hunterVs']);
const RESTORE = {
  // Nocturnal (plain) beside Flying or one other skill
  'owl-fletcher': {nocturnal: true}, 'owl-sentinel': {nocturnal: true}, 'great-horned-owl': {nocturnal: true}, 'beetle-battering-ram': {nocturnal: true},
  'cave-flitter': {nocturnal: 1}, 'echo-screecher': {nocturnal: true}, 'snow-owl-sentinel': {nocturnal: true}, 'permafrost-mammoth': {nocturnal: true},
  'owl-nightwatch': {nocturnal: 4}, 'barrow-leech-bat': {nocturnal: 1}, 'nightshade-moth': {nocturnal: true}, 'vigil-owl': {nocturnal: true},
  'willow-o-wisp': {nocturnal: 1}, 'skull-vulture': {nocturnal: true}, 'vampire-bat': {nocturnal: true}, 'voltwing-bat': {nocturnal: true},
  'static-bat': {nocturnal: true}, 'arc-bat': {nocturnal: true}, 'banded-sea-krait': {nocturnal: true}, 'garden-tiger-moth': {nocturnal: true},
  // Diurnal (plain)
  'eagle-diver': {diurnal: true}, 'eagle-sharpshooter': {diurnal: true}, 'hawk-arrowkeeper': {diurnal: true}, 'golden-eagle-diver': {diurnal: true},
  'talon-archer': {diurnal: true}, 'sunspire-choirmother': {diurnal: 2, diurnalHp: 2},
  // Flying
  'carrion-fly-swarm': {flying: true}, 'swarm-matriarch': {flying: true}, 'phoenix-fledgling': {flying: true}, 'sulfur-cinder-moth': {flying: true},
  'bee-forager': {flying: true}, 'mirror-moth': {flying: true}, 'honeyjoe-brewer': {flying: true}, 'tax-collector-teal': {flying: true},
  'eagle-owl-quartermaster': {flying: true}, 'peregrine-stooper': {flying: true}, 'ruby-throat-duelist': {flying: true},
  // Tide (plain)
  'orca-vanguard': {tide: true}, 'moray-ambusher': {tide: true}, 'sea-turtle-elder': {tide: true}, 'reef-manta-glider': {tide: true},
  'humpback-elder': {tide: true}, 'elder-tortoise': {tide: true}, 'colossal-squid': {tide: true}, 'alligator-gar': {tide: true},
  'fire-ant-raft': {tide: true}, 'mangrove-manatee': {tide: true}, 'crown-of-thorns-star': {tide: true}, 'giant-clam': {tide: true},
  'whale-shark': {tide: true}, 'beluga': {tide: true}, 'greenland-shark': {tide: true}, 'sulfur-vent-crab': {tide: true},
  'open-ocean-hermit-crab': {tide: true}, 'voltaic-eel': {tide: true}, 'sea-cucumber': {tide: true},
  // a counted skill cut only because a free one counted beside it
  'monarch-wingblade': {bounty: 1}, 'reef-shark': {bounty: 1}, 'octopus-tactician': {bounty: 1}, 'alpha-howler': {bounty: 1},
  'vampire-roost': {bounty: 1}, 'bog-behemoth': {bounty: 1}, 'tiny-cave-dweller': {bounty: 1}, 'eyrie-warden': {daunt: 1},
  'cave-bat-swarm': {darksight: true}, 'blind-cave-fish': {darksight: true}, 'hummingbird-needler': {bleed: 1}, 'moon-jelly': {poison: 1},
  'tide-pool-crab': {armor: 1} /* KEEP was Tide + Wave; with Tide free, the first of its other cut skills (a crab's shell) comes back */};
const KING = {
  'rodent-king': {cut: 'bounty', why: 'the Rodent King: its name, and the King type it already had'},
  'glacial-ape-king': {cut: 'bounty', why: 'the Glacial Ape-King: its name, and the King type it already had'},
  'yeti-chieftain': {why: 'the Yeti Chieftain, a leader of the tribe'}, 'the-gannet-queen': {why: 'the Gannet Queen, who leads the colony'}};
// Not made Kings (the formula has no room: with King's 2.39 they fall to their 1/1 floor): the Pride Queen (Quick; 2/14 -> 1/1) and the
// Magnate Duck (King type already; 1/22 -> 1/1). Offered to the owner (decision TR-4), as is the Quicksand Queen (a trap, not a ruler).
const SPECIAL = new Set(['epic', 'heroic', 'unique', 'questunique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic']);
function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c); const rows = [];
  Object.entries(RESTORE).forEach(([id, add])=>{ const c = by[id]; if(!c) throw new Error('no card ' + id);
    const e = Object.assign({}, c.effects || {}, add), n = B.skillCountOf(e, PARAMS);
    if(n > 2 && !SPECIAL.has(c.rarity)) throw new Error(id + ' would count ' + n + ' skills');
    rows.push({id, kind: 'restore', add, count: n}); });
  Object.entries(KING).forEach(([id, k])=>{ const c = by[id]; if(!c) throw new Error('no card ' + id);
    const e = Object.assign({}, c.effects || {}, {king: true}); if(k.cut) delete e[k.cut]; const n = B.skillCountOf(e, PARAMS);
    if(n > 2 && !SPECIAL.has(c.rarity)) throw new Error(id + ' would count ' + n + ' skills');
    rows.push({id, kind: 'king', cut: k.cut || null, why: k.why, count: n}); });
  return rows; }
const rows = plan();
console.log(rows.filter(r=> r.kind === 'restore').length, 'cards get a cut skill back,', rows.filter(r=> r.kind === 'king').length, 'cards become Kings');
console.log('--only=' + rows.map(r=> r.id).join(','));
if(process.argv[2] === 'apply'){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  rows.forEach(r=>{ const c = by[r.id];
    if(r.kind === 'restore'){ if(Object.keys(r.add).every(k=> c.effects && c.effects[k] != null)) return; c.effects = Object.assign({}, c.effects || {}, r.add);
      c.creatorNote = ((c.creatorNote || '') + ` 2026-10-21 (TR, owner HB2-1: Flying, Tide, Diurnal and Nocturnal don't count toward two skills): ${Object.keys(r.add).filter(k=> !/Hp$/.test(k)).join(', ')} back (BF5 cut it only because one of these counted).`).trim(); return; }
    if(c.effects && c.effects.king) return; const e = Object.assign({}, c.effects || {}); if(r.cut) delete e[r.cut]; e.king = true; c.effects = e;
    c.creatorNote = ((c.creatorNote || '') + ` 2026-10-21 (TR, owner 18:23, the Crown): + King (${r.why})${r.cut ? '; ' + r.cut + ' off, two skills at most (BF5 order)' : ''}.`).trim(); });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('applied');
}
