// ============================================================================
// Bramblewood Autobattler — draft run (2026-10-03). DOM-free: inlined into the game page (global
// `BramblewoodAutobattle`) and require()'d by tests/autobattle.js.
//
// Design (explicit, 2026-10-03): like the recent async battlers (Super Auto Pets etc.).
//  • Draft EVERYTHING at the start: your castle, your leader, a sub-leader, and your cards.
//  • Two leaders: the main leader starts every fight on the board; the sub-leader joins on round
//    SUB_LEADER_ROUND, and can be swapped out between fights (one swap per fight).
//  • 5 health. Losing one of your first 3 fights costs 1 health; later losses cost 2.
//  • Goal: 10 wins. Then optionally Endless (11, 12, …) — forcibly stops at fight 100.
//  • After every fight: pick 1 of 3 boons — duplicate a card, +1/+1 a card, or add a passive.
//  • Fights are CPU vs CPU and resolve instantly — the skill is deck-building, not piloting.
//  • Opponents are ghost snapshots of other runs at the same number of wins (seeded ghosts top
//    each stage up to MIN_ACTIVE_PER_STAGE).
// Boon edits never touch the real card: an edited card gets a run-specific copy ("base~tag").
// 2026-10-03 follow-up: the deck is 10 cards + 2 leaders, with a bench (storage) for extras. Every
// card starts at level 1 and each +1/+1 or passive boon raises it by 1; deck level = Σ rarity weight
// × card level (leaders count double). Castles grow +10% health per fight played.
// ============================================================================
(function(root){
'use strict';

const AB = {
  START_HP:5, WIN_GOAL:10, HARD_STOP:100, EARLY_FIGHTS:3, EARLY_LOSS:1, LATE_LOSS:2,
  PICKS:10, COPIES_PER_PICK:1, DECK_SIZE:10, BENCH_SIZE:6, CASTLE_GROWTH:0.10, SUB_LEADER_ROUND:4, FIGHT_ROUND_CAP:60, SUDDEN_DEATH_ROUND:20,
  MIN_ACTIVE_PER_STAGE:12, ACTIVE_DAYS:14,
  // Passives a boon can add — simple keyword effects the engine already supports.
  BOON_PASSIVES: [
    {key:'armor', value:2, label:'Armor 2'}, {key:'thorns', value:2, label:'Thorns 2'},
    {key:'poison', value:1, label:'Poison 1'}, {key:'flying', value:true, label:'Flying'},
    {key:'regen', value:2, label:'Regeneration 2'}, {key:'bleed', value:1, label:'Bleed 1'},
    {key:'quick', value:true, label:'Quick'}, {key:'guardian', value:true, label:'Guardian'},
    {key:'crit', value:true, label:'Critical hits'}, {key:'rage', value:true, label:'Rage'},
  ],
};
const DAY = 24*3600*1000;
const RARITY_LEVEL_WEIGHT = {starter:1, common:1, uncommon:2, quest:2, rare:3, veryrare:4, superrare:5, epic:6, heroic:7, unique:8, questunique:8, legendary:8, mythic:9, ancient:10};
function rarityWeight(d){ return RARITY_LEVEL_WEIGHT[(d && d.rarity) || 'common'] || 1; }
// Generic deck level: counts {id:n}, levelOf(id) → level (≥1), leaders [ids] count double.
function deckLevelOf(defs, counts, levelOf, leaders){
  let total = 0;
  Object.keys(counts||{}).forEach(id=>{ const d = defs[baseId(id)]; if(d) total += (counts[id]||0) * rarityWeight(d) * Math.max(1, levelOf(baseId(id))||1); });
  (leaders||[]).forEach(id=>{ const d = defs[baseId(id)]; if(d) total += 2 * rarityWeight(d) * Math.max(1, levelOf(baseId(id))||1); });
  return total;
}
function deckTotal(counts){ return Object.values(counts||{}).reduce((a,b)=> a+(b|0), 0); }
const NAMES = ['Moss','Bramble','Pip','Thistle','Rook','Fern','Juniper','Wren','Hazel','Sorrel','Bracken','Tansy','Nettle','Clover','Sedge','Rowan','Burdock','Willow','Aster','Quill','Hollis','Marlow','Pebble','Kestrel'];
const AV_CHARS = ['otter','hummingbird','mouse'], AV_COLORS = ['acorn','berry','river','moss','violet','sun','blossom','frost','night'];

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h>>>0; }
function rngFor(...parts){ return mulberry32(hashStr(parts.join('|'))); }
function power(d){ const fx = Object.keys(d.effects||{}).length; return ((d.attack||0) + (d.health||0)*0.45 + fx*1.5) / (1 + 0.3*(d.wait||0)) - 0.6*(d.cost||0); }
function pool(defs){ return Object.keys(defs).filter(id=> defs[id] && !defs[id].token && !defs[id].test && !defs[id].hallOfFame && !String(id).includes('~')).sort((a,b)=> power(defs[a])-power(defs[b]) || (a<b?-1:1)); }
function pickN(r, arr, n, exclude){ const ex = new Set(exclude||[]); const out = []; let guard = 0; while(out.length<n && guard++<500){ const v = arr[Math.floor(r()*arr.length)]; if(!ex.has(v) && !out.includes(v)) out.push(v); } return out; }
function baseId(id){ return String(id).split('~')[0]; }

// ---------------- run lifecycle ----------------
function newRun(seed, now){
  return {id:'ab'+(seed>>>0).toString(36), seed:seed>>>0, startedAt:now||0, phase:'draft', step:0,
    hp:AB.START_HP, wins:0, losses:0, fights:0, castle:null, leader:null, subLeader:null,
    deck:{}, bench:{}, levels:{}, patches:{}, endless:false, over:false, overReason:null, subSwappedAt:-1, history:[], pendingBoons:null};
}
const DRAFT_STEPS = 3 + AB.PICKS; // castle, leader, sub-leader, then card picks
function draftStepKind(step){ return step===0 ? 'castle' : step===1 ? 'leader' : step===2 ? 'subLeader' : 'card'; }
// Three options for the current draft step, deterministic from the run seed.
function draftOffers(defs, characters, run){
  const kind = draftStepKind(run.step);
  const r = rngFor(run.seed, 'draft', run.step);
  if(kind==='castle') return {kind, options: pickN(r, Object.keys(characters).sort(), Math.min(3, Object.keys(characters).length))};
  const ids = pool(defs);
  if(kind==='leader' || kind==='subLeader'){
    const top = ids.slice(Math.floor(ids.length*0.6));
    return {kind, options: pickN(r, top, 3, [run.leader])};
  }
  // Card picks: a band that drifts upward a little with each pick, so the draft has a curve.
  const i = run.step - 3, t = i / Math.max(1, AB.PICKS-1);
  const band = ids.slice(Math.floor(ids.length*(0.05 + 0.35*t)), Math.ceil(ids.length*(0.55 + 0.4*t)));
  return {kind, options: pickN(r, band, 3, [run.leader, run.subLeader])};
}
function applyDraftPick(run, choice){
  const kind = draftStepKind(run.step);
  if(kind==='castle') run.castle = choice;
  else if(kind==='leader') run.leader = choice;
  else if(kind==='subLeader') run.subLeader = choice;
  else { if(deckTotal(run.deck) < AB.DECK_SIZE) run.deck[choice] = (run.deck[choice]||0) + AB.COPIES_PER_PICK; else run.bench[choice] = (run.bench[choice]||0) + AB.COPIES_PER_PICK; }
  run.step++;
  if(run.step >= DRAFT_STEPS) run.phase = 'prep';
  return run;
}
function lossPenalty(fightNumber){ return fightNumber <= AB.EARLY_FIGHTS ? AB.EARLY_LOSS : AB.LATE_LOSS; }

// Boons: three different kinds when possible, each aimed at a card in your deck (or a leader).
function boonOffers(defs, run){
  const r = rngFor(run.seed, 'boon', run.fights);
  const cards = Object.keys(run.deck).concat(Object.keys(run.bench||{})).map(baseId).filter((v,i,a)=> a.indexOf(v)===i);
  const targets = cards.concat([run.leader, run.subLeader].filter(Boolean));
  const pickCard = ()=> targets[Math.floor(r()*targets.length)];
  const dupTarget = cards[Math.floor(r()*cards.length)];
  const passive = AB.BOON_PASSIVES[Math.floor(r()*AB.BOON_PASSIVES.length)];
  let passiveTarget = pickCard(), guard = 0;
  while(guard++<10 && defs[passiveTarget] && defs[passiveTarget].effects && defs[passiveTarget].effects[passive.key]!=null) passiveTarget = pickCard();
  return [
    {type:'dup', card: dupTarget, label:'Duplicate a card'},
    {type:'buff', card: pickCard(), atk:1, hp:1, label:'+1/+1'},
    {type:'passive', card: passiveTarget, key: passive.key, value: passive.value, label:'Add ' + passive.label},
  ];
}
function applyBoon(run, boon){
  if(!boon) return run;
  const p = run.patches[boon.card] = run.patches[boon.card] || {atk:0, hp:0, add:{}};
  run.bench = run.bench || {}; run.levels = run.levels || {};
  if(boon.type==='dup'){
    // A duplicate keeps the card's level. It goes into the deck if there's room, else the bench.
    if(deckTotal(run.deck) < AB.DECK_SIZE) run.deck[boon.card] = (run.deck[boon.card]||0) + 1;
    else if(deckTotal(run.bench) < AB.BENCH_SIZE) run.bench[boon.card] = (run.bench[boon.card]||0) + 1;
  }
  else if(boon.type==='buff'){ p.atk += boon.atk; p.hp += boon.hp; run.levels[boon.card] = (run.levels[boon.card]||1) + 1; }
  else if(boon.type==='passive'){ p.add[boon.key] = boon.value; run.levels[boon.card] = (run.levels[boon.card]||1) + 1; }
  if(!p.atk && !p.hp && !Object.keys(p.add).length) delete run.patches[boon.card];
  run.pendingBoons = null;
  return run;
}
// Bench ⇄ deck (prep phase). The deck holds at most DECK_SIZE cards, the bench BENCH_SIZE.
function moveToBench(run, id){ run.bench = run.bench||{}; if(!(run.deck[id]>0) || deckTotal(run.bench) >= AB.BENCH_SIZE) return false; run.deck[id]--; if(!run.deck[id]) delete run.deck[id]; run.bench[id] = (run.bench[id]||0) + 1; return true; }
function moveToDeck(run, id){ run.bench = run.bench||{}; if(!(run.bench[id]>0) || deckTotal(run.deck) >= AB.DECK_SIZE) return false; run.bench[id]--; if(!run.bench[id]) delete run.bench[id]; run.deck[id] = (run.deck[id]||0) + 1; return true; }
function runDeckLevel(defs, run){ return deckLevelOf(defs, run.deck, id=> (run.levels||{})[id]||1, [run.leader, run.subLeader].filter(Boolean)); }
function castleHealthFor(baseHealth, fightsPlayed){ return Math.round(baseHealth * (1 + AB.CASTLE_GROWTH * (fightsPlayed||0))); }
function subLeaderOffers(defs, run){
  const ids = pool(defs);
  const top = ids.slice(Math.floor(ids.length*0.55));
  return pickN(rngFor(run.seed, 'sub', run.fights), top, 2, [run.leader, run.subLeader]);
}
function canSwapSubLeader(run){ return run.phase==='prep' && run.subSwappedAt !== run.fights; }
function swapSubLeader(run, id){ if(!canSwapSubLeader(run)) return false; run.subLeader = id; run.subSwappedAt = run.fights; return true; }

// Run-specific card copies for every boon-edited card. Returns defs extended with derived ids and
// a function that maps a base id to the id this side should use.
function sideDefs(baseDefs, tag, patches){
  const extra = {}, map = {};
  Object.keys(patches||{}).forEach(b=>{
    const d = baseDefs[b]; if(!d) return;
    const p = patches[b], id = b + '~' + tag;
    extra[id] = Object.assign({}, d, {id, attack:(d.attack||0)+(p.atk||0), health:(d.health||0)+(p.hp||0),
      effects: Object.assign({}, d.effects||{}, p.add||{}), name: d.name + (p.atk||p.hp ? ` +${p.atk}/+${p.hp}` : '') + (Object.keys(p.add||{}).length ? ' ✦' : ''), token:false, abDerived:true});
    map[b] = id;
  });
  return {extra, idFor: b=> map[b] || b};
}
function snapshotSide(s){ return {castle:s.castle, leader:s.leader, subLeader:s.subLeader, deck:Object.assign({}, s.deck), bench:Object.assign({}, s.bench||{}), levels:Object.assign({}, s.levels||{}), fights: s.fights||0, patches: JSON.parse(JSON.stringify(s.patches||{}))}; }

// One CPU vs CPU fight. me/opp are run-like snapshots {castle, leader, subLeader, deck, patches}.
function simulateFight(Engine, baseDefs, characters, me, opp, seed){
  const A = sideDefs(baseDefs, 'a', me.patches), B = sideDefs(baseDefs, 'b', opp.patches);
  const defs = Object.assign({}, baseDefs, A.extra, B.extra);
  const deckOf = (s, side)=>{ const out = {}; Object.keys(s.deck||{}).forEach(b=>{ out[side.idFor(baseId(b))] = (out[side.idFor(baseId(b))]||0) + s.deck[b]; }); return out; };
  const rnd = mulberry32(seed>>>0);
  const engine = Engine.makeSimEngine(defs, rnd, {recordEvents:true});
  const sideOf = id=> id===1 ? 'A' : 'B';
  const ch = (id, fights)=>{ const c = characters[id] || characters.castle || {id:'castle', health:30, effects:{}}; return Object.assign({}, c, {health: castleHealthFor(c.health||30, fights)}); };
  const players = {1: engine.newPlayer(1, deckOf(me, A), ch(me.castle, me.fights)), 2: engine.newPlayer(2, deckOf(opp, B), ch(opp.castle, opp.fights))};
  // Out of cards = nothing more to play (no fallback "loop" units in the Autobattler).
  players[1].loopCards = []; players[2].loopCards = [];
  const stats = {}, events = [];
  // Replay frames (2026-10-07, "watch the fight"): the board by column after the plays and after
  // combat each round. Read-only, so the fight itself (and its seed) is unchanged.
  const frames = [];
  const colsOf = pl=>{ const out = []; const put = (c, col)=> out.push(c.gap ? {col, gap:true} : {col, uid:c.uid, id:baseId(c.defId), hp:c.hp, maxHp:c.maxHp, atk:c.atk, wait:c.wait||0});
    pl.row.center.forEach(c=> put(c, 0)); pl.row.left.forEach((c,i)=> put(c, -(i+1))); pl.row.right.forEach((c,i)=> put(c, i+1)); return out.filter(x=> !x.gap); };
  const frame = (round, phase)=> frames.push({round, phase, hq:[players[1].hq.hp, players[2].hq.hp], sides:[colsOf(players[1]), colsOf(players[2])]});
  engine.draw(players[1], 3, 'A', stats, events); engine.draw(players[2], 3, 'B', stats, events);
  if(me.leader && defs[A.idFor(me.leader)]) engine.debugSpawnCard(players, sideOf, 1, A.idFor(me.leader), 'left', stats, events);
  if(opp.leader && defs[B.idFor(opp.leader)]) engine.debugSpawnCard(players, sideOf, 2, B.idFor(opp.leader), 'left', stats, events);
  let round = 1, over = false, lastSig = null, stalled = 0;
  for(; round<=AB.FIGHT_ROUND_CAP && !over; round++){
    if(engine.setSuddenDeath) engine.setSuddenDeath(round >= AB.SUDDEN_DEATH_ROUND);
    [1,2].forEach(p=>{ players[p].playedThisTurn = false; players[p].discardUsedThisTurn = false; });
    if(round===AB.SUB_LEADER_ROUND){
      if(me.subLeader && defs[A.idFor(me.subLeader)]) engine.debugSpawnCard(players, sideOf, 1, A.idFor(me.subLeader), 'right', stats, events);
      if(opp.subLeader && defs[B.idFor(opp.subLeader)]) engine.debugSpawnCard(players, sideOf, 2, B.idFor(opp.subLeader), 'right', stats, events);
    }
    events.push({type:'roundStart', round});
    engine.aiTakeTurn(players, sideOf, 1, stats, events);
    engine.aiTakeTurn(players, sideOf, 2, stats, events);
    frame(round, 'play');
    over = engine.resolveCombat(players, sideOf, stats, events, round%2===0 ? 1 : 2);
    frame(round, 'combat');
    if(over) break;
    if(Engine.boardSignature){ const sig = Engine.boardSignature(players); stalled = (sig===lastSig && Engine.noActionsLeft(players)) ? stalled+1 : 0; lastSig = sig; if(stalled>=2) break; }
    engine.draw(players[1], 1, 'A', stats, events); engine.draw(players[2], 1, 'B', stats, events);
  }
  const a = players[1].hq.hp<=0, b = players[2].hq.hp<=0;
  let winner = over ? (a&&b ? 0 : a ? 2 : 1) : 0;
  // A drawn fight goes to whoever has more castle left (a draw only if they're level).
  if(winner===0 && !(a&&b)){ const h1 = players[1].hq.hp/players[1].hq.maxHp, h2 = players[2].hq.hp/players[2].hq.maxHp; winner = h1===h2 ? 0 : (h1>h2 ? 1 : 2); }
  const dmgBy = {};
  events.forEach(e=>{ if((e.type==='hit' || e.type==='hitHQ') && e.side==='A' && e.attDefId){ const k = baseId(e.attDefId); dmgBy[k] = (dmgBy[k]||0) + (e.dmg||e.amount||0); } });
  const mvp = Object.keys(dmgBy).sort((x,y)=> dmgBy[y]-dmgBy[x])[0] || null;
  return {winner, rounds: Math.min(round, AB.FIGHT_ROUND_CAP), hp:[Math.max(0,players[1].hq.hp), Math.max(0,players[2].hq.hp)], maxHp:[players[1].hq.maxHp, players[2].hq.maxHp], mvp, mvpDamage: mvp ? dmgBy[mvp] : 0, events, frames};
}
// Record a fight's outcome on the run. Returns the run.
function afterFight(run, result, oppName){
  run.fights++;
  const won = result.winner===1;
  if(won) run.wins++; else if(result.winner===2){ run.losses++; run.hp -= lossPenalty(run.fights); }
  run.history.push({n: run.fights, won, draw: result.winner===0, opp: oppName||'', rounds: result.rounds});
  if(run.hp <= 0){ run.hp = 0; run.over = true; run.overReason = 'out-of-health'; run.phase = 'over'; }
  else if(run.fights >= AB.HARD_STOP){ run.over = true; run.overReason = 'hard-stop'; run.phase = 'over'; }
  else if(run.wins >= AB.WIN_GOAL && !run.endless){ run.phase = 'goal'; }
  else run.phase = 'boon';
  return run;
}
function goEndless(run){ run.endless = true; run.phase = 'boon'; return run; }
function cashOut(run){ run.over = true; run.overReason = 'cashed-out'; run.phase = 'over'; return run; }
function runRewards(run){
  const w = run.wins;
  return {gold: 8*w + (w>=AB.WIN_GOAL ? 120 : 0), dust: w + (w>=AB.WIN_GOAL ? 10 : 0), metal: w>=AB.WIN_GOAL ? 2 : 0};
}

// ---------------- ghosts ----------------
function ghostIdentity(seed){ const r = mulberry32(seed ^ 0x51ed); return {name: NAMES[Math.floor(r()*NAMES.length)] + ' ' + String.fromCharCode(65+Math.floor(r()*26)) + '.', avatar:{character:AV_CHARS[Math.floor(r()*3)], color:AV_COLORS[Math.floor(r()*AV_COLORS.length)], title:'newcomer'}}; }
function snapshotOf(run, owner, name, avatar, now){ return Object.assign(snapshotSide(run), {owner, name, avatar, stage: run.wins, at: now||0, source:'player'}); }
// A seeded ghost at a stage: a full auto-draft plus roughly one boon per fight it would have played.
function seedGhost(defs, characters, stage, i, epoch){
  const seed = hashStr(`abghost:${epoch}:${stage}:${i}`);
  const run = newRun(seed, 0);
  const r = mulberry32(seed ^ 0x777);
  while(run.phase==='draft'){
    const off = draftOffers(defs, characters, run);
    // ghosts at higher stages draft greedily (strongest option), lower ones more randomly
    const greedy = r() < Math.min(0.9, 0.25 + stage*0.08);
    const choice = greedy && off.kind!=='castle' ? off.options.slice().sort((a,b)=> power(defs[b])-power(defs[a]))[0] : off.options[Math.floor(r()*off.options.length)];
    applyDraftPick(run, choice);
  }
  const boons = stage + Math.floor(stage/3);
  for(let k=0;k<boons;k++){ run.fights = k; const offs = boonOffers(defs, run); applyBoon(run, offs[Math.floor(r()*offs.length)]); }
  run.fights = boons;
  const who = ghostIdentity(seed);
  return Object.assign(snapshotSide(run), {owner:`abseed-${stage}-${i}`, name: who.name, avatar: who.avatar, stage, source:'seed'});
}
function validSnapshot(defs, characters, g){
  if(!g || !g.deck || !characters[g.castle] || !defs[g.leader] || !defs[g.subLeader]) return false;
  const ids = Object.keys(g.deck); if(!ids.length || deckTotal(g.deck) > AB.DECK_SIZE + 2) return false;
  return ids.every(id=> defs[baseId(id)]) && Object.keys(g.patches||{}).every(id=> defs[id]);
}
function opponentPool(defs, characters, stage, recorded, now){
  const cutoff = now - AB.ACTIVE_DAYS*DAY, latest = {};
  (recorded||[]).forEach(g=>{ if(!g || g.stage!==stage || !(g.at>=cutoff) || !validSnapshot(defs, characters, g)) return; if(!latest[g.owner] || latest[g.owner].at < g.at) latest[g.owner] = g; });
  const real = Object.values(latest);
  const epoch = Math.floor(now / (7*DAY));
  const seeded = [];
  for(let i=0; real.length + seeded.length < AB.MIN_ACTIVE_PER_STAGE; i++) seeded.push(seedGhost(defs, characters, stage, i, epoch));
  return {stage, decks: real.concat(seeded), real: real.length, seeded: seeded.length};
}
function pickOpponent(poolObj, seed, excludeOwners){
  const ex = new Set(excludeOwners||[]);
  const list = poolObj.decks.filter(g=> !ex.has(g.owner));
  const from = list.length ? list : poolObj.decks;
  return from[Math.floor(mulberry32(seed>>>0)()*from.length)] || null;
}
function recordGhost(recorded, entry, keep){
  const list = (recorded||[]).filter(g=> !(g.owner===entry.owner && g.stage===entry.stage));
  list.push(entry);
  return list.sort((a,b)=> b.at - a.at).slice(0, keep || 300);
}

const api = {RARITY_LEVEL_WEIGHT, rarityWeight, deckLevelOf, deckTotal, moveToBench, moveToDeck, runDeckLevel, castleHealthFor, AB, DRAFT_STEPS, newRun, draftStepKind, draftOffers, applyDraftPick, lossPenalty, boonOffers, applyBoon, subLeaderOffers, canSwapSubLeader, swapSubLeader,
  sideDefs, simulateFight, afterFight, goEndless, cashOut, runRewards, snapshotOf, seedGhost, validSnapshot, opponentPool, pickOpponent, recordGhost, baseId, power, hashStr};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodAutobattle = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
