// Bramblewood headless test harness (2026-10-03).
//
// Drives the real DOM-free engine (bramblewood-engine.js) with the real card data
// (canonical/cards.json), so card-vs-card, 2-player and multi-deck (Async / Raid) tests run in
// plain Node in seconds, with no browser. Everything is seeded: the same inputs always give the
// same result, which is what makes golden-file (snapshot) testing possible.
'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..');
const Engine = require(path.join(ROOT, 'bramblewood-engine.js'));

let _defs = null;
function loadCardDefs(){
  if(_defs) return _defs;
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  _defs = {};
  cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; _defs[c.id] = d; });
  return _defs;
}
// Cards a player could actually field (not tokens/test cards, which only exist via other cards).
function fieldableIds(defs){
  defs = defs || loadCardDefs();
  return Object.keys(defs).filter(id=> !defs[id].token && !defs[id].test).sort();
}
function seededRng(seed){ return Engine.mulberry32(seed>>>0); }
// Small stable string hash (FNV-1a) for seeds and signatures.
function hashStr(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h>>>0; }

const sideOf = id=> id===1 ? 'A' : 'B';

// ---------------------------------------------------------------------------------------------
// Board scenario: put exact cards on exact lanes (no hands, no decks, no AI choices) and run N
// combat rounds. This isolates card-vs-card interactions from draw luck and AI play choices.
//   spec = {seed, battleMode, rounds, hqHp:{A,B}, A:[{id, side?, hp?, attack?, wait?}], B:[...]}
// ---------------------------------------------------------------------------------------------
function runBoard(spec){
  const defs = spec.defs || loadCardDefs();
  const engine = Engine.makeSimEngine(defs, seededRng(spec.seed||1), {recordEvents:true, battleMode: spec.battleMode, suddenDeathCastles: spec.suddenDeathCastles});
  const players = {1: engine.newPlayer(1, {}), 2: engine.newPlayer(2, {})};
  const hqHp = spec.hqHp || {};
  if(hqHp.A!=null){ players[1].hq.hp = players[1].hq.maxHp = hqHp.A; }
  if(hqHp.B!=null){ players[2].hq.hp = players[2].hq.maxHp = hqHp.B; }
  const stats = {}, events = [];
  const place = (pid, list)=> (list||[]).forEach(c=>{
    const ok = engine.debugSpawnCard(players, sideOf, pid, c.id, c.side || 'left', stats, events);
    if(!ok) throw new Error(`could not place ${c.id} for player ${pid}`);
    const all = [...players[pid].row.left, ...players[pid].row.center, ...players[pid].row.right];
    const bc = all[all.length-1] && all.find(x=> x.defId===c.id && !x.__placed) || null;
    if(bc){ bc.__placed = true; if(c.hp!=null) bc.hp = bc.maxHp = c.hp; if(c.attack!=null) bc.atk = bc.baseAtk = c.attack; if(c.wait!=null) bc.wait = c.wait; }
  });
  place(1, spec.A); place(2, spec.B);
  const maxRounds = spec.rounds || 30;
  let round = 1, over = false, invariantErrors = [];
  for(; round<=maxRounds; round++){
    events.push({type:'roundStart', round});
    if(!spec.noSuddenDeath) engine.setSuddenDeath(round >= Engine.SUDDEN_DEATH_ROUND);
    over = engine.resolveCombat(players, sideOf, stats, events, round%2===0 ? 1 : 2);
    invariantErrors.push(...checkInvariants(players, `round ${round}`));
    if(over) break;
    if(boardEmpty(players[1]) && boardEmpty(players[2])) break;
  }
  return {players, events, stats, rounds: Math.min(round, maxRounds), over, winner: winnerOf(players, over), invariantErrors};
}
function boardEmpty(pl){ return !pl.row.left.length && !pl.row.center.length && !pl.row.right.length; }
function boardCards(pl){ return [...pl.row.left, ...pl.row.center, ...pl.row.right]; }
function winnerOf(players, over){
  if(!over) return 0;
  const a = players[1].hq.hp<=0, b = players[2].hq.hp<=0;
  return (a && b) ? 0 : (a ? 2 : 1);
}

// Engine invariants that must hold after every round, whatever the cards do.
function checkInvariants(players, where){
  const errs = [];
  const uids = new Set();
  [1,2].forEach(pid=>{
    const pl = players[pid];
    if(!Number.isFinite(pl.hq.hp)) errs.push(`${where}: P${pid} castle HP is ${pl.hq.hp}`);
    boardCards(pl).forEach(c=>{
      if(uids.has(c.uid)) errs.push(`${where}: duplicate uid ${c.uid} (${c.defId})`);
      uids.add(c.uid);
      if(!Number.isFinite(c.hp)) errs.push(`${where}: ${c.defId} hp is ${c.hp}`);
      if(c.hp<=0) errs.push(`${where}: dead ${c.defId} (hp ${c.hp}) still on P${pid}'s board`);
      if(!Number.isFinite(c.atk)) errs.push(`${where}: ${c.defId} attack is ${c.atk}`);
      if(c.atk<0) errs.push(`${where}: ${c.defId} has negative attack ${c.atk}`);
    });
    ['lumber','grace','devilry','stone'].forEach(k=>{ if(pl[k]!=null && (!Number.isFinite(pl[k]) || pl[k]<0)) errs.push(`${where}: P${pid} ${k} = ${pl[k]}`); });
  });
  return errs;
}

// A compact, order-sensitive fingerprint of a fight: who won, when, final HPs, and a histogram
// of event types. Stored in golden files so ANY behaviour change shows up as a diff.
function fightSignature(res){
  const hist = {};
  res.events.forEach(e=>{ hist[e.type] = (hist[e.type]||0) + 1; });
  const order = res.events.map(e=> e.type + (e.dmg!=null ? ':'+e.dmg : (e.amount!=null ? ':'+e.amount : '')) + (e.targetUid!=null ? '@'+e.targetUid : '')).join(',');
  return {
    w: res.winner, r: res.rounds,
    hp: [res.players[1].hq.hp, res.players[2].hq.hp],
    left: [boardCards(res.players[1]).length, boardCards(res.players[2]).length],
    ev: Object.keys(hist).sort().map(k=> k+'×'+hist[k]).join(' '),
    h: hashStr(order).toString(36),
  };
}

// ---------------------------------------------------------------------------------------------
// Full match between two decks with the engine's own AI on both seats (what the Simulator does).
// ---------------------------------------------------------------------------------------------
function runMatch(deckA, deckB, opts){
  opts = opts || {};
  const defs = opts.defs || loadCardDefs();
  return Engine.simulateOneMatch(defs, deckA, deckB, {rnd: seededRng(opts.seed||1), maxRounds: opts.maxRounds||120, recordEvents: !!opts.recordEvents, battleMode: opts.battleMode});
}

module.exports = { ROOT, Engine, loadCardDefs, fieldableIds, seededRng, hashStr, sideOf, runBoard, runMatch, checkInvariants, fightSignature, boardCards };
