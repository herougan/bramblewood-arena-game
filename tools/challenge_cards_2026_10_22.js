#!/usr/bin/env node
// 2026-10-22 (package RW2, owner on RW-1: "The max cap is always S. SS and SSS is only for challenge missions. ... Sporadically, some of
// the skirmish rewards (non pack) can only be gotten through SS (Elites). These will be called challenge cards, so we should pick the
// higher rarity cards."). Picks the challenge cards and marks them in canonical/cards.json as source.challenge = true (the game's
// cardRewardIsChallenge reads that flag; a challenge card asks SS, every other reward card at most S).
//
// The rule (deterministic): main maps from Map 4 on, in bands of four (4-7, 8-11, 12-15, 16-19, 20-23, 24-27 ...). In each band, over the
// first-clear reward cards of its elite-kind fights (elite, champion, miniboss, dungeon; main maps only, not side maps), the one of the
// highest rarity, Rare or above; a tie goes to the later map, then the later fight on it, then the id. One challenge card a band, so
// "sporadically": about one every four maps. Maps 0-3 (the first steps) have none.
//
//   node tools/challenge_cards_2026_10_22.js          the picks (dry)
//   node tools/challenge_cards_2026_10_22.js --apply  set source.challenge on the picks (other flags are left as they are: the owner's edits)
//   node tools/challenge_cards_2026_10_22.js --list   every card flagged now
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, 'canonical', 'cards.json');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), MAPS = B.G.CONQUEST_MAPS;
const raw = fs.readFileSync(FILE, 'utf8'), cards = JSON.parse(raw);
// the file is written the way the Python tools write it (json.dumps indent 2, ASCII with \u escapes)
const dump = c=> JSON.stringify(c, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + (raw.endsWith('\n') ? '\n' : '');
const RARITY = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic'];
const AS = {quest: 'uncommon', questunique: 'unique', special: 'unique', eventrare: 'rare', eventlegendary: 'legendary', devlegendary: 'legendary', devancient: 'ancient'};
const rank = r=> RARITY.indexOf(AS[r] || r || 'common');
const ELITE = new Set(['elite', 'champion', 'miniboss', 'dungeon']);
const FROM_MAP = 4, BAND = 4;

function picks(){
  const mains = MAPS.filter(m=> !m.sub && !m.reserved), bands = {};
  mains.forEach((m, no)=>{ if(no < FROM_MAP) return;
    m.nodes.forEach((n, ni)=>{ if(!ELITE.has(n.kind)) return;
      cards.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node === n.key && c.cardType !== 'equipment' && !c.easterEgg)
        .forEach(c=>{ if(rank(c.rarity) < rank('rare')) return; const b = Math.floor((no - FROM_MAP) / BAND); (bands[b] = bands[b] || []).push({c, no, ni, node: n}); }); }); });
  return Object.keys(bands).map(Number).sort((a, b)=> a - b).map(b=>{
    const best = bands[b].sort((x, y)=> rank(y.c.rarity) - rank(x.c.rarity) || y.no - x.no || y.ni - x.ni || (x.c.id < y.c.id ? -1 : 1))[0];
    return {band: `${FROM_MAP + b * BAND}-${FROM_MAP + b * BAND + BAND - 1}`, id: best.c.id, name: best.c.name, rarity: best.c.rarity, map: best.no, fight: best.node.key, fightName: best.node.name, kind: best.node.kind};
  });
}
if(require.main === module){
  const arg = process.argv[2] || '';
  if(arg === '--list'){ cards.filter(c=> c.source && c.source.challenge).forEach(c=> console.log(`${c.id} (${c.rarity}) ${c.source.id}:${c.source.node}`)); process.exit(0); }
  const P = picks();
  P.forEach(p=> console.log(`Maps ${p.band}: ${p.name} (${p.id}, ${p.rarity}) on ${p.fight} ${p.fightName} [${p.kind}]`));
  if(arg === '--apply'){
    if(dump(JSON.parse(raw)) !== raw) throw new Error('canonical/cards.json does not round-trip byte for byte; not touching it');
    let n = 0; P.forEach(p=>{ const c = cards.find(x=> x.id === p.id); if(!c.source.challenge){ c.source.challenge = true; n++; } });
    fs.writeFileSync(FILE, dump(cards)); console.log(`flagged ${n} new (${P.length} picks)`);
  }
}
module.exports = {picks};
