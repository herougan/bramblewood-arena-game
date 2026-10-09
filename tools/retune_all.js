#!/usr/bin/env node
// Whole-campaign retune (2026-10-09, decision B2). For every fight, in play order, it builds the deck
// a new player would likely own there (Base cards + every earlier reward, the same model as the
// skirmish editor's tools) and moves the enemy castle HP until that deck's win rate lands near the
// fight's target: a map's first skirmish ~85% falling to ~60% by its last, elites ~45%, bosses ~35%,
// raid bosses ~20%. HP stays between 0.35× and 2× the current value. Only if HP alone can't get within
// 12 points does it trade two copies at a time with cards from the same map's other fights, at most 4
// times. Raid bosses are left to the Raid editor.
//
//   node tools/retune_all.js [games=60] [--apply]     prints a table; --apply writes arena_app.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const charById = {}; (Array.isArray(chars) ? chars : Object.values(chars)).forEach(c=> charById[c.id] = c);
const APP = path.join(ROOT, 'arena_app.js');
let src = fs.readFileSync(APP, 'utf8');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const N = +(process.argv.find(a=> /^\d+$/.test(a)) || 60), APPLY = process.argv.includes('--apply');

const score = id=>{ const d = defs[id]; return ((d.attack||0)*1.6 + (d.health||0)*0.6 + Object.keys(d.effects||{}).length*2) / (1 + (d.cost||0)*0.9 + (d.wait||0)*0.5); };
const CAP = {legendary:1, mythic:1, ancient:1, unique:1, questunique:1, epic:2, heroic:2, veryrare:3, superrare:3, rare:4, uncommon:5};
const isBase = c=> !c.token && !c.test && !c.hallOfFame && c.id!=='wandering-traveller' && !(c.source && c.source.kind) && (c.rarity==='starter' || c.basic || !c.locked);
const rewardsOf = (mid, key)=> cards.filter(c=> c.source && c.source.kind==='map' && c.source.id===mid && c.source.node===key).map(c=> c.id);
function buildDeck(owned){ const ids = [...new Set(owned)].filter(id=> defs[id]).sort((a,b)=> score(b)-score(a) || (a<b?-1:1)); const deck = {}; let n = 0; for(const id of ids){ const k = Math.min(4, CAP[defs[id].rarity] || 10, 20-n); if(k<=0) break; deck[id] = k; n += k; } return deck; }

function play(A, B, charB, hpB, mode, seed){
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {battleMode: mode || 'open'}); const so = p=> p===1 ? 'A' : 'B';
  const P = {1: e.newPlayer(1, A, Object.assign({}, charById.castle, {health:30})), 2: e.newPlayer(2, B, Object.assign({}, charB || charById.castle, {health: hpB}))}; const st = {};
  P[2].loopCards = []; // as in real Conquest fights (unless the node says never surrender)
  e.draw(P[1], 3, 'A', st, null); e.draw(P[2], 3, 'B', st, null);
  for(let r=1; r<=E.DRAW_ROUND_CAP; r++){ e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND); [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    e.aiTakeTurn(P, so, 1, st, null); e.aiTakeTurn(P, so, 2, st, null);
    if(e.resolveCombat(P, so, st, null, r%2===0 ? 1 : 2)){ const a = P[1].hq.hp<=0, b = P[2].hq.hp<=0; return a&&b ? 0 : a ? 2 : 1; }
    e.draw(P[1], 1, 'A', st, null); e.draw(P[2], 1, 'B', st, null); }
  return 0;
}
const rate = (deck, nd, ch, hp, mode)=>{ let w = 0; for(let k=0;k<N;k++) if(play(deck, nd, ch, hp, mode, 300 + k*29) === 1) w++; return w/N; };
function target(map, n){
  if(n.kind==='elite') return .45; if(n.kind==='boss' || n.kind==='finalboss') return .35; if(n.kind==='raidboss') return .2;
  const sk = map.nodes.filter(x=> x.kind==='skirmish'); return .85 - .25 * (Math.max(0, sk.indexOf(n)) / Math.max(1, sk.length-1));
}
function tuneHp(deck, nd, ch, hp0, mode, tgt){
  let lo = Math.max(8, Math.round(hp0*0.35)), hi = Math.round(hp0*2), best = hp0, bestR = rate(deck, nd, ch, hp0, mode);
  while(lo <= hi){ const mid = Math.floor((lo+hi)/2), r = rate(deck, nd, ch, mid, mode); if(Math.abs(r-tgt) < Math.abs(bestR-tgt) - 1e-9 || (Math.abs(r-tgt) === Math.abs(bestR-tgt) && Math.abs(mid-hp0) < Math.abs(best-hp0))){ best = mid; bestR = r; } if(r > tgt) lo = mid+1; else hi = mid-1; }
  return {hp: best, r: bestR};
}

const owned = cards.filter(isBase).map(c=> c.id);
const out = [];
const mains = MAPS.filter(m=> !m.sub);
const order = [];
mains.forEach(m=>{ order.push(m); MAPS.filter(s=> s.sub && s.parent===m.id).forEach(s=> order.push(s)); });
const ownedAt = {}; // map id -> owned list when entering the map (main maps)
for(const map of order){
  let myOwned;
  if(map.sub){ const parent = MAPS.find(m=> m.id===map.parent); const ix = parent.nodes.findIndex(n=> n.key===map.entry.after); myOwned = ownedAt[parent.id].slice(); parent.nodes.slice(0, ix+1).forEach(n=> rewardsOf(parent.id, n.key).forEach(id=> myOwned.push(id))); }
  else { ownedAt[map.id] = owned.slice(); myOwned = owned; }
  for(const n of map.nodes){
    if(!n.deck || n.kind==='tutorial'){ continue; }
    if(n.kind==='raidboss'){ if(!map.sub) rewardsOf(map.id, n.key).forEach(id=> owned.push(id)); continue; } // raid bosses are tuned in the Raid editor
    const deck = buildDeck(myOwned), ch = n.characterId && charById[n.characterId], tgt = target(map, n), mode = n.battleMode || 'open';
    let nd = Object.assign({}, n.deck), before = rate(deck, nd, ch, n.hqHp, mode);
    let t = tuneHp(deck, nd, ch, n.hqHp, mode, tgt), swaps = 0;
    // Too far off with HP alone: trade two copies at a time with cards from this map's other fights
    // (so the theme holds): out goes the enemy's strongest (too hard) or weakest (too easy) card, in
    // comes the weakest / strongest card of the map pool.
    const pool = [...new Set(map.nodes.flatMap(x=> Object.keys(x.deck||{})))].filter(id=> defs[id]).sort((a,b)=> score(b)-score(a));
    while(Math.abs(t.r - tgt) > .12 && swaps < 4){
      const ids = Object.keys(nd).sort((a,b)=> score(b)-score(a));
      const easy = t.r > tgt;
      const out = easy ? ids[ids.length-1] : ids[0];
      const cand = easy ? pool.find(id=> score(id) > score(ids[0]) || !nd[id]) : pool.slice().reverse().find(id=> score(id) < score(ids[ids.length-1]) || !nd[id]);
      const inn = cand && cand !== out ? cand : (easy ? ids[0] : ids[ids.length-1]);
      if(inn === out) break;
      const k = Math.min(2, nd[out]); nd[out] -= k; if(!nd[out]) delete nd[out]; nd[inn] = (nd[inn]||0) + k;
      if(Object.keys(nd).length < 2) break;
      swaps++; t = tuneHp(deck, nd, ch, n.hqHp, mode, tgt);
    }
    out.push({map: map.id, key: n.key, kind: n.kind, target: Math.round(tgt*100), before: Math.round(before*100), after: Math.round(t.r*100), hp: [n.hqHp, t.hp], swaps, deck: swaps ? nd : null});
    console.log(`${map.id.padEnd(4)} ${n.key.padEnd(8)} ${n.kind.padEnd(9)} target ${String(Math.round(tgt*100)).padStart(3)}%  ${String(Math.round(before*100)).padStart(3)}% → ${String(Math.round(t.r*100)).padStart(3)}%  HP ${n.hqHp} → ${t.hp}${swaps ? `  (${swaps} swap${swaps>1?'s':''})` : ''}`);
    if(!map.sub) rewardsOf(map.id, n.key).forEach(id=> owned.push(id));
  }
}
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'retune-all.json'), JSON.stringify(out, null, 1) + '\n');
if(APPLY){
  let s = src;
  for(const o of out){
    const re = new RegExp(`(\\{ key:"${o.key.replace(/[-]/g, '\\-')}",[^\\n]*)`);
    const m = s.match(re); if(!m) continue;
    let line = m[1].replace(/hqHp:\d+/, 'hqHp:' + o.hp[1]);
    if(o.deck) line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(o.deck).replace(/,/g, ','));
    s = s.replace(m[1], line);
  }
  fs.writeFileSync(APP, s);
  console.log('applied to arena_app.js');
}
