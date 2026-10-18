#!/usr/bin/env node
// How much harder the CPU levels make the road (2026-10-18, owner: "B. Okay" to measuring the Smartest CPU on Map 21+). Same fights, decks, seeds and play loop as
// tools/difficulty_curve.js, three ways: sim (aiAim off, as the tools measure), basic (aiAim on, CPU aiLevel 0 = the CPU before
// 2026-10-18), real (aiAim on, the CPU at cpuAiLevelForNode: Map 21+ smartest, Map 5+ elite/boss smart, else basic). The player
// seat plays at aiLevel 1 (smart) with aiAim on in basic and real, so only the CPU's level differs between them.
// The pass that asked for it: docs/balance-pass-2026-10-18.md section 7.
//   node tools/cpu_levels.js [games=40] [shard nshards]     appends one JSON line per fight to docs/balance/cpu-levels.jsonl
//   (resumable: fights already in the file are skipped; delete it for a fresh run)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2).filter(a=> /^\d+$/.test(a));
const N = +(args[0] || 40), shard = +(args[1] || 0), nsh = +(args[2] || 1);
const OUT = path.join(ROOT, 'docs', 'balance', 'cpu-levels.jsonl');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const charById = {}; (Array.isArray(chars) ? chars : Object.values(chars)).forEach(c=> charById[c.id] = c);
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const MY_HP = 30;
const SMART_KINDS = new Set(['elite','champion','miniboss','subboss','boss','dungeon','worldboss','raidboss','megaraid','finalboss']);
const KEYS = ['basic', 'smart', 'smartest'];
const mains = MAPS.filter(m=> !m.sub);
const mapNo = m=> mains.indexOf(m.sub ? MAPS.find(x=> x.id===m.parent) : m);
function autoLevel(m, n){ if(n.tower) return 1; const k = KEYS.indexOf(n.ai); if(k >= 0) return k; const no = mapNo(m); if(no >= 21) return 2; return no >= 5 && SMART_KINDS.has(n.kind || 'skirmish') ? 1 : 0; }
const curve = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/difficulty-curve.json'), 'utf8'));
const DECKS = Object.fromEntries(['mid', 'strong'].map(k=> [k, Object.fromEntries(curve.decks[k].cards.map(c=> [c.id, c.n]))]));
let CURRENT_RULES = null, CURRENT_FIELD = null;
function play(A, B, charB, hpB, mode, seed, cfg){
  const opts = {battleMode: mode || 'open', rules: CURRENT_RULES || undefined}; if(cfg.aim){ opts.aiAim = true; opts.aiLevel = cfg.cpu; }
  const e = E.makeSimEngine(defs, E.mulberry32(seed), opts); const so = p=> p===1 ? 'A' : 'B';
  if(CURRENT_FIELD) e.setField(CURRENT_FIELD, null, 'map');
  const P = {1: e.newPlayer(1, A, Object.assign({}, charById.castle, {health: MY_HP})), 2: e.newPlayer(2, B, Object.assign({}, charB || charById.castle, {health: hpB}))}; const st = {};
  P[2].loopCards = [];
  e.draw(P[1], 3, 'A', st, null); e.draw(P[2], 3, 'B', st, null);
  for(let r=1; r<=E.DRAW_ROUND_CAP; r++){ e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1); [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; }); if(r > 1) e.roundStart(P, r, so, st, null);
    if(cfg.aim) e.setAiLevel(1); e.aiTakeTurn(P, so, 1, st, null);
    if(cfg.aim) e.setAiLevel(cfg.cpu); e.aiTakeTurn(P, so, 2, st, null);
    if(e.resolveCombat(P, so, st, null, r%2===0 ? 1 : 2)){ const a = P[1].hq.hp<=0, b = P[2].hq.hp<=0; return {w: a&&b ? 0 : a ? 2 : 1, r, hp: Math.max(0, P[1].hq.hp)}; }
    e.draw(P[1], 1, 'A', st, null); e.draw(P[2], 1, 'B', st, null); }
  return {w: 0, r: E.DRAW_ROUND_CAP, hp: Math.max(0, P[1].hq.hp)};
}
function measure(deck, m, n, cfg){
  CURRENT_RULES = n.rules || null; CURRENT_FIELD = m.id==='m6' ? 'frozen' : null;
  const ch = n.characterId && charById[n.characterId];
  let wins = 0, lost = 0;
  for(let k=0; k<N; k++){ const g = play(deck, n.deck, ch, n.hqHp, n.battleMode || 'open', 500 + k*31, cfg);
    if(g.w===1){ wins++; lost += (MY_HP - g.hp)/MY_HP; } else lost += 1; }
  return {win: Math.round(wins/N*1000)/10, hpLost: Math.round(lost/N*1000)/10};
}
const jobs = [];
MAPS.forEach(m=>{ if(m.reserved) return; const no = mapNo(m); if(no < 5) return;
  const fights = m.nodes.filter(x=> x.kind!=='tutorial' && x.kind!=='raidboss');
  fights.forEach((n, i)=>{ if(!n.deck) return; const lv = autoLevel(m, n); if(no < 21 && lv === 0) return;
    const sibs = MAPS.filter(x=> x.sub && x.parent===m.parent);
    const gm = m.sub ? `${no}-${String.fromCharCode(65 + sibs.indexOf(m))}` : String(no);
    jobs.push({map: m.id, mapNo: no, gameMap: gm, mapName: m.name, code: n.code || `${gm}-${i+1}`, key: n.key, kind: n.kind || 'skirmish', name: n.name || n.key, level: lv, decks: no >= 21 ? ['mid', 'strong'] : ['strong'], m, n}); }); });
const done = new Set(); try{ fs.readFileSync(OUT, 'utf8').split('\n').filter(Boolean).forEach(l=> done.add(JSON.parse(l).key)); }catch(e){}
const mine = jobs.filter((j, i)=> i % nsh === shard && !done.has(j.key));
console.log('jobs', jobs.length, 'mine', mine.length);
for(const j of mine){
  const t = Date.now(), res = {};
  for(const d of j.decks){
    const sim = measure(DECKS[d], j.m, j.n, {aim: false}), basic = measure(DECKS[d], j.m, j.n, {aim: true, cpu: 0});
    const real = j.level === 0 ? basic : measure(DECKS[d], j.m, j.n, {aim: true, cpu: j.level});
    res[d] = {sim, basic, real};
  }
  const {m, n, ...row} = j; fs.appendFileSync(OUT, JSON.stringify(Object.assign(row, {res, ms: Date.now() - t})) + '\n');
}
console.log('done');
