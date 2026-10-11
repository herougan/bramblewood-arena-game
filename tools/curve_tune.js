#!/usr/bin/env node
// Curve tuning (2026-10-11, user: "Roughly it should look like it goes up in difficulty"). Tunes every fight toward a
// rising target on the difficulty index from tools/difficulty_curve.js (same three reference decks, read from
// docs/balance/difficulty-curve.json), instead of toward a fixed win rate for a growing player deck.
//
// Target index: the road's base climbs evenly from FROM (Map 1) to TO (the last map); inside a map the skirmishes go
// from base-6 to base+2, an elite is base+8, a boss base+14, the campaign boss base+16, and a side map adds 4.
// Each fight first moves its castle Health (0.35x to 2x, capped at 240 / 300 for the campaign boss); if that can't get
// within 5 points it trades two copies at a time with themed cards (cards sharing one of the map's three main types,
// from any map up to two ahead), keeping a trade only when it helps. Epic-and-up cards and --keep cards stay.
//
//   node tools/curve_tune.js [games=24] [--from=18] [--to=62] [--only=m1,1-2] [--keep=a,b] [--apply]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const charById = {}; (Array.isArray(chars) ? chars : Object.values(chars)).forEach(c=> charById[c.id] = c);
const APP = path.join(ROOT, 'arena_app.js');
const src = fs.readFileSync(APP, 'utf8');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const arg = (k, d)=>{ const a = process.argv.find(x=> x.startsWith('--'+k+'=')); return a ? a.slice(k.length+3) : d; };
const N = +(process.argv.find(a=> /^\d+$/.test(a)) || 24), APPLY = process.argv.includes('--apply');
const FROM = +arg('from', 18), TO = +arg('to', 62);
const ONLY = arg('only', '').split(',').filter(Boolean), KEEP = new Set(arg('keep', '').split(',').filter(Boolean));
const RARE_UP = new Set(['epic','heroic','unique','questunique','legendary','mythic','ancient','devlegendary','devancient','eventlegendary']);
const MY_HP = 30;
const CURVE = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/difficulty-curve.json'), 'utf8'));
const DECKS = Object.fromEntries(Object.entries(CURVE.decks).map(([k, v])=> [k, Object.fromEntries(v.cards.map(c=> [c.id, c.n]))]));

const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const order = []; mains.forEach(m=>{ order.push(m); MAPS.filter(s=> s.sub && s.parent===m.id && !s.reserved).forEach(s=> order.push(s)); });
const mapIdx = m=> mains.indexOf(m.sub ? MAPS.find(x=> x.id===m.parent) : m);
function target(m, n){
  const base = FROM + (TO - FROM) * mapIdx(m) / Math.max(1, mains.length - 1) + (m.sub ? 4 : 0);
  const k = n.kind;
  if(k === 'elite') return base + 8; if(k === 'boss') return base + 14; if(k === 'finalboss') return base + 16;
  const sk = m.nodes.filter(x=> x.kind === 'skirmish'); const p = Math.max(0, sk.indexOf(n)) / Math.max(1, sk.length - 1);
  return base - 6 + 8*p;
}

let RULES = null, FIELD = null;
function play(A, B, charB, hpB, mode, seed){
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {battleMode: mode || 'open', rules: RULES || undefined}); const so = p=> p===1 ? 'A' : 'B';
  if(FIELD) e.setField(FIELD, null, 'map');
  const P = {1: e.newPlayer(1, A, Object.assign({}, charById.castle, {health: MY_HP})), 2: e.newPlayer(2, B, Object.assign({}, charB || charById.castle, {health: hpB}))}; const st = {};
  P[2].loopCards = [];
  e.draw(P[1], 3, 'A', st, null); e.draw(P[2], 3, 'B', st, null);
  for(let r=1; r<=E.DRAW_ROUND_CAP; r++){ e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND); [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; }); if(r > 1) e.roundStart(P, r, so, st, null);
    e.aiTakeTurn(P, so, 1, st, null); e.aiTakeTurn(P, so, 2, st, null);
    if(e.resolveCombat(P, so, st, null, r%2===0 ? 1 : 2)){ const a = P[1].hq.hp<=0, b = P[2].hq.hp<=0; return {w: a&&b ? 0 : a ? 2 : 1, hp: Math.max(0, P[1].hq.hp)}; }
    e.draw(P[1], 1, 'A', st, null); e.draw(P[2], 1, 'B', st, null); }
  return {w: 0, hp: Math.max(0, P[1].hq.hp)};
}
function index(m, n, deck, hp){
  RULES = n.rules || null; FIELD = m.id==='m6' ? 'frozen' : null;
  const ch = n.characterId && charById[n.characterId], mode = n.battleMode || 'open';
  let loss = 0, lost = 0;
  for(const k of ['starter','mid','strong']){
    let wins = 0, l = 0;
    for(let g=0; g<N; g++){ const r = play(DECKS[k], deck, ch, hp, mode, 700 + g*37); if(r.w===1){ wins++; l += (MY_HP - r.hp)/MY_HP; } else l += 1; }
    loss += 100 - wins/N*100; if(k==='strong') lost = l/N*100;
  }
  return (loss + lost) / 4;
}
const HP_FLOOR = {skirmish:14, elite:25, boss:30, finalboss:30};
function tuneHp(m, n, deck, hp0, tgt){
  const cap = n.kind==='finalboss' ? 300 : 240;
  let lo = Math.max(HP_FLOOR[n.kind] || 10, Math.round(hp0*0.35)), hi = Math.min(cap, Math.max(Math.round(hp0*2), lo));
  let best = Math.min(hp0, hi), bestI = index(m, n, deck, best);
  while(lo <= hi){ const mid = Math.floor((lo+hi)/2), x = index(m, n, deck, mid);
    if(Math.abs(x - tgt) < Math.abs(bestI - tgt)){ best = mid; bestI = x; }
    if(x < tgt) lo = mid + 1; else hi = mid - 1; }
  return {hp: best, idx: bestI};
}
const score = id=>{ const d = defs[id]; return ((d.attack||0)*1.6 + (d.health||0)*0.6 + Object.keys(d.effects||{}).length*2) / (1 + (d.cost||0)*0.9 + (d.wait||0)*0.5); };
const typesOf = id=> [...((defs[id]||{}).archetypes||[]), ...((defs[id]||{}).species||[])];
function themedPool(m){
  const tally = {}; m.nodes.forEach(x=> Object.entries(x.deck||{}).forEach(([id, c])=> typesOf(id).forEach(t=> tally[t] = (tally[t]||0) + c)));
  const top = new Set(Object.entries(tally).filter(([t])=> !['Structure','Leader','Bird','Beast'].includes(t)).sort((a,b)=> b[1]-a[1]).slice(0, 3).map(([t])=> t));
  const i = mapIdx(m);
  const reach = MAPS.filter(mm=> !mm.reserved && mapIdx(mm) >= 0 && mapIdx(mm) <= i + 2);
  const own = m.nodes.flatMap(x=> Object.keys(x.deck||{}));
  const themed = reach.flatMap(mm=> mm.nodes.filter(x=> x.kind!=='raidboss').flatMap(x=> Object.keys(x.deck||{}))).filter(id=> defs[id] && typesOf(id).some(t=> top.has(t)));
  return [...new Set([...own, ...themed])].filter(id=> defs[id] && !defs[id].token).sort((a,b)=> score(b)-score(a));
}

const out = [];
for(const m of order){
  for(const n of m.nodes){
    if(!n.deck || n.kind==='tutorial' || n.kind==='raidboss') continue;
    if(ONLY.length && !ONLY.includes(m.id) && !ONLY.includes(n.key)) continue;
    const tgt = Math.round(target(m, n)*10)/10;
    let deck = Object.assign({}, n.deck);
    const before = index(m, n, deck, n.hqHp);
    let t = tuneHp(m, n, deck, n.hqHp, tgt), swaps = 0;
    if(Math.abs(t.idx - tgt) > 5){
      const pool = themedPool(m), tried = new Set();
      for(let a=0; a<18 && swaps<6 && Math.abs(t.idx - tgt) > 5; a++){
        const ids = Object.keys(deck).sort((x,y)=> score(y)-score(x)).filter(id=> !KEEP.has(id) && !RARE_UP.has(defs[id].rarity));
        if(!ids.length) break;
        const harder = t.idx < tgt;
        const outId = harder ? ids[ids.length-1] : ids[0];
        const cand = harder ? pool.find(id=> !tried.has(id) && !deck[id] && score(id) > score(outId)) : pool.slice().reverse().find(id=> !tried.has(id) && !deck[id] && score(id) < score(outId));
        if(!cand) break; tried.add(cand);
        const trial = Object.assign({}, deck); const k = Math.min(2, trial[outId]); trial[outId] -= k; if(!trial[outId]) delete trial[outId]; trial[cand] = (trial[cand]||0) + k;
        const t2 = tuneHp(m, n, trial, n.hqHp, tgt);
        if(Math.abs(t2.idx - tgt) < Math.abs(t.idx - tgt) - 1){ deck = trial; t = t2; swaps++; }
      }
    }
    out.push({map: m.id, key: n.key, kind: n.kind, target: tgt, before: Math.round(before*10)/10, after: Math.round(t.idx*10)/10, hp: [n.hqHp, t.hp], swaps, deck: swaps ? deck : null});
    console.log(`${m.id.padEnd(4)} ${n.key.padEnd(8)} ${n.kind.padEnd(9)} target ${String(tgt).padStart(5)}  index ${String(Math.round(before)).padStart(3)} → ${String(Math.round(t.idx)).padStart(3)}  HP ${n.hqHp} → ${t.hp}${swaps ? `  (${swaps} swap${swaps>1?'s':''})` : ''}`);
  }
}
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', ONLY.length ? 'curve-tune-partial.json' : 'curve-tune.json'), JSON.stringify(out, null, 1) + '\n');
if(APPLY){
  let s = fs.readFileSync(APP, 'utf8');
  for(const o of out){
    const re = new RegExp(`(\\{ key:"${o.key.replace(/[-]/g, '\\-')}",[^\\n]*)`); const mm = s.match(re); if(!mm) continue;
    let line = mm[1].replace(/hqHp:\d+/, 'hqHp:' + o.hp[1]);
    if(o.deck) line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(o.deck));
    s = s.replace(mm[1], line);
  }
  fs.writeFileSync(APP, s); console.log('applied to arena_app.js');
}
