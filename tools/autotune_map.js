#!/usr/bin/env node
// Auto-tuner for a Conquest map (2026-10-04, D18). For each node, in order, it plays a deck built
// from what a player owns at that point (unlocked base cards + every earlier skirmish reward) and
// lowers (or, when too easy, raises) the node's castle HP — and, if that isn't enough, swaps a copy of the node's strongest card
// for its weakest — until the AI-piloted win rate lands near a target for the node's place in the
// map (first ≈85%, last skirmish ≈60%, elites ≈45%, boss ≈35%). Prints a proposal; it never writes.
//   node tools/autotune_map.js m3 [games=80]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const charById = {}; (Array.isArray(chars) ? chars : Object.values(chars)).forEach(c=> charById[c.id] = c);
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const i = src.indexOf('const CONQUEST_MAPS = ['); const j = src.indexOf('\n];', i);
const MAPS = eval(src.slice(i + 'const CONQUEST_MAPS = '.length, j + 2));
const MAP = process.argv[2] || 'm3', N = +process.argv[3] || 80;
const score = id=>{ const d = defs[id]; return ((d.attack||0)*1.6 + (d.health||0)*0.6 + Object.keys(d.effects||{}).length*2) / (1 + (d.cost||0)*0.9 + (d.wait||0)*0.5); };
const CAP = {legendary:1, mythic:1, ancient:1, unique:1, questunique:1, epic:2, heroic:2, veryrare:3, superrare:3, rare:4};
function buildDeck(owned){ const ids = [...new Set(owned)].filter(id=> defs[id]).sort((a,b)=> score(b)-score(a)); const deck = {}; let n = 0; for(const id of ids){ const k = Math.min(4, CAP[defs[id].rarity] || 10, 20-n); if(k<=0) break; deck[id] = k; n += k; } return deck; }
function play(A, B, charB, hpB, seed){
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {battleMode:'open'}); const so = p=> p===1 ? 'A' : 'B';
  const P = {1: e.newPlayer(1, A, Object.assign({}, charById.castle, {health:30})), 2: e.newPlayer(2, B, Object.assign({}, charB || charById.castle, {health: hpB}))}; const st = {};
  e.draw(P[1], 3, 'A', st, null); e.draw(P[2], 3, 'B', st, null);
  for(let r=1; r<=E.DRAW_ROUND_CAP; r++){ e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND); [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    e.aiTakeTurn(P, so, 1, st, null); e.aiTakeTurn(P, so, 2, st, null);
    if(e.resolveCombat(P, so, st, null, r%2===0 ? 1 : 2)){ const a = P[1].hq.hp<=0, b = P[2].hq.hp<=0; return a&&b ? 0 : a ? 2 : 1; }
    e.draw(P[1], 1, 'A', st, null); e.draw(P[2], 1, 'B', st, null); }
  return 0;
}
const rate = (deck, nd, ch, hp)=>{ let w = 0; for(let k=0;k<N;k++) if(play(deck, nd, ch, hp, 300 + k*29) === 1) w++; return w/N; };
// what the player owns arriving at this map: base unlocked cards + tutorial reward + rewards of every earlier map node
// 2026-10-09: "owned" now matches the game's own expectedPlayerDeck(): Base cards only (starters,
// basics and unlocked cards with no other source), not every unlocked card; the Traveller is the
// leader, not a deck card. Then the rewards of every earlier main map (and, for a sub-map, of its
// parent up to the entrance node).
const isBase = c=> !c.token && !c.test && !c.hallOfFame && c.id!=='wandering-traveller' && !(c.source && c.source.kind) && (c.rarity==='starter' || c.basic || !c.locked);
const owned = cards.filter(isBase).map(c=> c.id);
const rewardsOf = (mid, key)=> cards.filter(c=> c.source && c.source.kind==='map' && c.source.id===mid && c.source.node===key).map(c=> c.id);
{ const target = MAPS.find(m=> m.id===MAP), stop = target && target.sub ? MAPS.find(m=> m.id===target.parent) : target;
  for(const m of MAPS){ if(m.sub) continue; if(m===stop) break; m.nodes.forEach(n=> rewardsOf(m.id, n.key).forEach(id=> owned.push(id))); }
  if(target && target.sub && stop){ const ix = stop.nodes.findIndex(n=> n.key===target.entry.after); stop.nodes.slice(0, ix+1).forEach(n=> rewardsOf(stop.id, n.key).forEach(id=> owned.push(id))); } }
const map = MAPS.find(m=> m.id===MAP); const nodes = map.nodes.filter(n=> n.deck && n.kind!=='tutorial');
const skirm = nodes.filter(n=> n.kind==='skirmish');
nodes.forEach(n=>{
  const deck = buildDeck(owned);
  let target = n.kind==='boss' || n.kind==='finalboss' ? 0.35 : n.kind==='raidboss' ? 0.2 : n.kind==='elite' ? 0.45 : 0.85 - 0.25 * (skirm.indexOf(n) / Math.max(1, skirm.length-1));
  const ch = n.characterId && charById[n.characterId];
  let nd = Object.assign({}, n.deck), hp = n.hqHp, r = rate(deck, nd, ch, hp), swaps = 0;
  const before = r;
  if(r < target - 0.08){
    for(let guard=0; guard<14 && r < target - 0.08; guard++){
      // binary search HP down to a floor of 40% of the original (min 12)
      let lo = Math.max(12, Math.round(n.hqHp*0.4)), hi = hp, best = hp, bestR = r;
      while(lo <= hi){ const mid = Math.floor((lo+hi)/2); const rr = rate(deck, nd, ch, mid); if(rr >= target){ best = mid; bestR = rr; lo = mid+1; } else hi = mid-1; if(Math.abs(rr-target) < Math.abs(bestR-target)){ best = mid; bestR = rr; } }
      hp = best; r = bestR;
      if(r >= target - 0.08) break;
      const ids = Object.keys(nd).sort((a,b)=> score(b)-score(a)); const strong = ids[0], weak = ids[ids.length-1];
      if(strong===weak || nd[strong] <= 1 && ids.length <= 2) break;
      nd[strong]--; if(!nd[strong]) delete nd[strong]; nd[weak] = (nd[weak]||0) + 1; swaps++; hp = n.hqHp; r = rate(deck, nd, ch, hp);
    }
  }
  for(let guard=0; guard<8 && r > target + 0.15; guard++){
    // too easy even before HP: swap a copy of the weakest card for the strongest
    const ids = Object.keys(nd).sort((a,b)=> score(b)-score(a)); const strong = ids[0], weak = ids[ids.length-1];
    if(strong===weak) break;
    nd[weak]--; if(!nd[weak]) delete nd[weak]; nd[strong]++; swaps++; r = rate(deck, nd, ch, hp);
  }
  if(r > target + 0.12){
    // too easy: raise castle HP (up to 2× the original) until it lands near the target
    let lo = hp, hi = Math.round(n.hqHp*2), best = hp, bestR = r;
    while(lo <= hi){ const mid = Math.floor((lo+hi)/2); const rr = rate(deck, nd, ch, mid); if(Math.abs(rr-target) < Math.abs(bestR-target)){ best = mid; bestR = rr; } if(rr > target) lo = mid+1; else hi = mid-1; }
    hp = best; r = bestR;
  }
  console.log(JSON.stringify({key:n.key, kind:n.kind, target:Math.round(target*100), before:Math.round(before*100), after:Math.round(r*100), hp:[n.hqHp, hp], swaps, deck:nd}));
  cards.filter(c=> c.source && c.source.kind==='map' && c.source.id===MAP && c.source.node===n.key).forEach(c=> owned.push(c.id));
});
