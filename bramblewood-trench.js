// ============================================================================
// Bramblewood Raid trench (2026-10-03, Raid P2 — see docs/raid-design.md). DOM-free: inlined into
// the page (global `BramblewoodTrench`) and require()'d by tests/trench.js.
//
// A trench fight is three player rows (front / middle / back) against one boss board, played
// CPU-vs-CPU so it resolves instantly and then replays as an animation. You choose your row; the
// other two rows are other raiders' decks (or stand-ins). It runs on the normal engine in 'open'
// (fixed-slot) mode, so "columns" are real slots and every card keeps all of its abilities:
//   - Each round every row plays a card, the boss plays a card, then combat runs one pass per row.
//     Pass 1 is the front row vs the boss (both sides attack). Passes 2–3 are the middle and back
//     rows attacking the boss; the boss doesn't swing again.
//   - Boss attacks hit the front row first. If the front row's column is empty, the hit ROLLS
//     THROUGH to that column in the middle row, then the back row, and only then the trench wall
//     (one HP pool shared by all three rows).
//   - Column attacks (e.g. Tentacle Smack) are telegraphed a round ahead, then hit that column in
//     every row; 'frontRow' attacks hit every card in the front row.
//   - Boss ENTITIES (e.g. the Core's three stumps) sit on the boss board from round 1, gain armour
//     for each other entity alive (they buff each other), and can shield the boss castle until
//     they're all dead.
//   - Horrible rules: your units enter with +N Wait (waitDelta); boss units are Illusory (dodge a
//     share of combat attacks). The < 1% "Exposed" stage strips all of that (stripAbilities).
// Result: in-fight castle damage, scored by bramblewood-raid.js exactly like a single-row fight.
// ============================================================================
(function(root){
'use strict';
const ROW_NAMES = ['Front', 'Middle', 'Back'];
const DEFAULTS = {wallHp: 45, rounds: 12};

function mulberry32(seed){ let a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Config for one part's trench fight: raid-level defaults merged with the part's own `trench`.
function trenchConfig(def, part, stage){
  const base = Object.assign({}, DEFAULTS, def.trench || {});
  const own = (part && part.trench) || {};
  const cfg = Object.assign({}, base, own);
  cfg.attacks = (own.attacks || base.attacks || []).map(a=> Object.assign({}, a));
  cfg.entities = (own.entities || []).map(e=> Object.assign({}, e));
  cfg.rules = Object.assign({}, base.rules || {}, own.rules || {});
  cfg.rounds = (part && part.fight && part.fight.rounds) || def.fightRounds || cfg.rounds;
  cfg.castleHp = (part && part.fight && part.fight.castleHp) || 200;
  cfg.deck = Object.assign({}, (part && part.fight && part.fight.deck) || {});
  cfg.strip = !!(stage && (stage.rules||[]).some(r=> r.stripAbilities));
  if(cfg.strip){ cfg.rules = {}; cfg.entities.forEach(e=>{ e.aura = 0; }); cfg.shieldWhileEntities = false; }
  return cfg;
}

// A trench fight as a turn-by-turn stepper (2026-10-03, D8: "You still play as usual" — your row is
// yours to play; the ally rows and the boss are CPU). opts: {makeSimEngine, defs, seed,
// rows:[{deck, name, mine}] (front→back), cfg (from trenchConfig), bossName, myRow (index or -1)}.
//   T.view()                  current board snapshot (+ T.telegraphCols(): columns hit this turn)
//   T.myHand()/T.myLegalSlots()/T.canPlayMine(uid)/T.playMine(uid, slot)/T.discardMine(uid)
//   T.endTurn()               resolves the turn, returns its snapshots; T.over / T.result() when done
// Each turn: allies + boss play (at the start of the turn), you play, then specials, auras and one
// combat pass per row; then everyone draws.
function createTrench(opts){
  const cfg = opts.cfg, rnd = mulberry32(opts.seed >>> 0);
  const defs = Object.assign({}, opts.defs);
  const illusory = cfg.rules.illusory || 0, waitDelta = cfg.rules.waitDelta || 0;
  const myRow = opts.myRow != null ? opts.myRow : -1;
  // boss cards: run-only copies (abilities stripped when Exposed; Illusory added by the rule)
  const bossDeck = {};
  Object.keys(cfg.deck).forEach(id=>{
    if(!defs[id]) return;
    if(!cfg.strip && !illusory){ bossDeck[id] = cfg.deck[id]; return; }
    const nid = id + (cfg.strip ? '~exposed' : '~illusory');
    const fx = cfg.strip ? {} : Object.assign({}, defs[id].effects || {}, {illusory});
    defs[nid] = Object.assign({}, defs[id], {id:nid, effects:fx});
    bossDeck[nid] = cfg.deck[id];
  });
  const entIds = cfg.entities.map((e,i)=>{
    const id = 'trench-ent-' + (e.id || i);
    const fx = {armor: e.armor || 0}; if(illusory) fx.illusory = illusory;
    defs[id] = {id, name: e.name || 'Entity', icon: e.icon || '🦑', attack: e.attack || 0, health: e.health || 20, wait: 0, cost: 0, token: true, effects: fx, rarity: 'common'};
    return id;
  });
  const engine = opts.makeSimEngine(defs, rnd, {recordEvents:false, battleMode:'open', suddenDeathCastles:false});
  const sideOf = id=> id===2 ? 'B' : 'A';
  const stats = {};
  const rows = opts.rows.map(r=>{ const pl = engine.newPlayer(1, r.deck, {id:'trench', name: r.name, health: cfg.wallHp, effects:{}}); pl.loopCards = []; return pl; });
  rows.forEach(pl=>{ pl.hq = rows[0].hq; });
  const wall = rows[0].hq;
  const boss = engine.newPlayer(2, bossDeck, {id:'raid-part', name: opts.bossName || 'Boss', health: cfg.castleHp, effects:{}});
  boss.loopCards = [];
  const pair = i=> ({1: rows[i], 2: boss});
  const log = [];
  let roundNotes = [];
  const order = [0, -1, 1, -2, 2, -3, 3];
  entIds.forEach((id, i)=> engine.debugSpawnCard(pair(0), sideOf, 2, id, order[i], stats, null));
  const entityAlive = ()=> engine.allBoardCards(boss).some(c=> c.hp>0 && entIds.includes(c.defId));
  if(cfg.shieldWhileEntities && entIds.length) boss.onHqHit = ()=> entityAlive() ? 0 : undefined;
  // roll-through: a boss hit on an empty front column lands on the middle/back row's card in that column
  rows[0].onHqHit = (amount, att)=>{
    if(!att || att.slot==null) return undefined;
    for(let i=1;i<rows.length;i++){
      const c = engine.allBoardCards(rows[i]).find(x=> x.hp>0 && x.slot===att.slot);
      if(c){ const r = engine.damageCard(c, amount, (defs[att.defId]||{}).dmgType || 'physical', att); roundNotes.push({kind:'roll', row:i, slot:att.slot, dmg:r.dmg, defId:c.defId}); return r.dmg; }
    }
    return undefined;
  };
  [...rows, boss].forEach(pl=> engine.draw(pl, 3, pl===boss?'B':'A', stats, null));
  const cardView = c=> ({uid:c.uid, defId:c.defId, slot:c.slot, hp:Math.max(0,c.hp), maxHp:c.maxHp, atk:c.atk, wait:c.wait, entity: entIds.includes(c.defId)});
  const pending = {}; // attack id -> telegraphed column for its next firing
  const pickColumn = ()=>{
    const occ = new Set(); rows.forEach(pl=> engine.allBoardCards(pl).forEach(c=>{ if(c.hp>0) occ.add(c.slot); }));
    const cols = occ.size ? Array.from(occ) : [-1, 0, 1];
    return cols[Math.floor(rnd()*cols.length)];
  };
  const removeDead = ()=> rows.forEach((pl,i)=> engine.removeDeadCards(pair(i), sideOf, {}, stats, null));
  const T = {cfg, defs, entityIds: entIds, rows, boss, wall, round: 1, over: false, overwhelmed: false, phase: 'play', myRow};
  // which columns this turn's specials will hit (column attacks firing this turn), for the red flash
  T.telegraphCols = ()=> cfg.attacks.filter(a=> a.pattern==='column' && T.round % Math.max(1, a.every||1) === 0 && pending[a.id]!=null).map(a=> pending[a.id]);
  T.frontRowHit = ()=> cfg.attacks.some(a=> a.pattern==='frontRow' && T.round % Math.max(1, a.every||1) === 0);
  T.view = (phase)=> ({round: T.round, phase: phase || T.phase, telegraph: T.telegraphCols()[0] != null ? T.telegraphCols()[0] : null, telegraphCols: T.telegraphCols(), frontRowHit: T.frontRowHit(),
    wall:{hp:wall.hp, max:wall.maxHp}, castle:{hp:boss.hq.hp, max:boss.hq.maxHp},
    rows: rows.map(pl=> engine.allBoardCards(pl).filter(c=> c.hp>0).map(cardView)),
    boss: engine.allBoardCards(boss).filter(c=> c.hp>0).map(cardView), notes: roundNotes.slice(),
    hand: myRow>=0 ? rows[myRow].hand.map(h=> ({uid:h.uid, defId:h.defId})) : [], lumber: myRow>=0 ? (rows[myRow].lumber||0) : 0, played: myRow>=0 ? !!rows[myRow].playedThisTurn : false});
  const withWaitDelta = (pl, fn)=>{ const before = new Set(engine.allBoardCards(pl).map(c=> c.uid)); fn(); if(waitDelta) engine.allBoardCards(pl).forEach(c=>{ if(!before.has(c.uid)) c.wait = (c.wait||0) + waitDelta; }); };
  function startTurn(){
    roundNotes = [];
    engine.setSuddenDeath(false);
    [...rows, boss].forEach(pl=>{ pl.playedThisTurn = false; pl.discardUsedThisTurn = false; });
    rows.forEach((pl, i)=>{ if(i===myRow) return; withWaitDelta(pl, ()=> engine.aiTakeTurn(pair(i), sideOf, 1, stats, null)); });
    engine.aiTakeTurn(pair(0), sideOf, 2, stats, null);
    // a column attack that fires this turn and wasn't telegraphed last turn picks its column now
    cfg.attacks.forEach(a=>{ if(a.pattern==='column' && T.round % Math.max(1, a.every||1) === 0 && pending[a.id]==null) pending[a.id] = pickColumn(); });
    T.phase = 'play';
  }
  T.myHand = ()=> myRow>=0 ? rows[myRow].hand.slice() : [];
  T.canPlayMine = uid=>{ if(myRow<0) return false; const pl = rows[myRow]; const h = pl.hand.find(x=> x.uid===uid); return !!h && !pl.playedThisTurn && engine.canPlay(pl, h.defId, h.uid); };
  T.myLegalSlots = ()=> myRow>=0 ? engine.legalSlots(rows[myRow]) : [];
  T.playMine = (uid, slot)=>{
    if(!T.canPlayMine(uid)) return false;
    const pl = rows[myRow]; let ok = false;
    withWaitDelta(pl, ()=>{ ok = engine.placeCard(pair(myRow), sideOf, 1, uid, slot, stats, null) !== false; });
    return ok;
  };
  T.discardMine = uid=>{
    if(myRow<0) return false; const pl = rows[myRow];
    if(pl.discardUsedThisTurn) return false;
    const idx = pl.hand.findIndex(x=> x.uid===uid); if(idx<0) return false;
    const [dc] = pl.hand.splice(idx, 1); pl.graveyard.push({defId: dc.defId}); pl.lumber = (pl.lumber||0) + 1; pl.discardUsedThisTurn = true;
    return true;
  };
  T.endTurn = ()=>{
    if(T.over) return [];
    const out = [];
    const round = T.round;
    // boss special attacks
    cfg.attacks.forEach(a=>{
      const every = Math.max(1, a.every||1);
      if(round % every !== 0) return;
      if(a.pattern === 'column'){
        const col = pending[a.id] != null ? pending[a.id] : pickColumn();
        let hitAny = false;
        rows.forEach((pl, i)=>{ engine.allBoardCards(pl).forEach(c=>{ if(c.hp>0 && c.slot===col){ engine.damageCardFlat(c, a.dmg||0, 'physical', null); hitAny = true; roundNotes.push({kind:'smack', attack:a.name, row:i, slot:col, dmg:a.dmg, defId:c.defId}); } }); });
        if(!hitAny){ wall.hp = Math.max(0, wall.hp - (a.dmg||0)); roundNotes.push({kind:'smack', attack:a.name, row:-1, slot:col, dmg:a.dmg}); }
        delete pending[a.id];
      } else if(a.pattern === 'frontRow'){
        engine.allBoardCards(rows[0]).forEach(c=>{ if(c.hp>0){ engine.damageCardFlat(c, a.dmg||0, 'physical', null); roundNotes.push({kind:'sweep', attack:a.name, row:0, slot:c.slot, dmg:a.dmg, defId:c.defId}); } });
      }
    });
    removeDead();
    out.push(T.view('specials'));
    // entities buff each other: +aura armour per OTHER entity still standing
    if(entIds.length){
      const alive = engine.allBoardCards(boss).filter(c=> c.hp>0 && entIds.includes(c.defId)).length;
      cfg.entities.forEach((e,i)=>{ defs[entIds[i]].effects.armor = (e.armor||0) + (e.aura||0) * Math.max(0, alive-1); });
    }
    const castleBefore = boss.hq.hp, wallBefore = wall.hp;
    engine.resolveCombat(pair(0), sideOf, stats, null, round%2===0 ? 1 : 2);
    removeDead();
    for(let i=1;i<rows.length;i++) engine.resolveCombat(pair(i), sideOf, stats, null, 1, {upkeepIds:[1], attackerIds:[1]});
    roundNotes.push({kind:'round', castleDmg: castleBefore - boss.hq.hp, wallDmg: wallBefore - wall.hp});
    // next turn's column attacks are telegraphed now, so they flash during the coming play phase
    cfg.attacks.forEach(a=>{ if(a.pattern==='column' && (round+1) % Math.max(1, a.every||1) === 0) pending[a.id] = pickColumn(); });
    T.phase = 'combat';
    out.push(T.view('combat'));
    log.push({round, castle: boss.hq.hp, wall: wall.hp});
    if(boss.hq.hp <= 0){ T.overwhelmed = true; T.over = true; }
    else if(wall.hp <= 0 || round >= cfg.rounds){ T.over = true; }
    if(!T.over){
      rows.forEach(pl=> engine.draw(pl, 1, 'A', stats, null));
      engine.draw(boss, 1, 'B', stats, null);
      T.round = round + 1;
      startTurn();
    }
    return out;
  };
  T.result = ()=>{
    // damage dealt = castle damage + damage to the boss's entities (dead ones count in full), so chipping
    // a shielded Core's stumps still contributes. "Over damage" past 0 on the global pool still counts (D7).
    const entHp = {}; engine.allBoardCards(boss).forEach(c=>{ if(entIds.includes(c.defId)) entHp[c.defId] = Math.max(0, c.hp); });
    const entityDealt = entIds.reduce((t,id)=> t + (defs[id].health - (entHp[id]!=null ? entHp[id] : 0)), 0);
    const castleDealt = Math.max(0, cfg.castleHp - Math.max(0, boss.hq.hp));
    return {dealt: castleDealt + entityDealt, castleDealt, entityDealt, overwhelmed: T.overwhelmed, wallBroken: wall.hp <= 0, rounds: Math.min(T.round, cfg.rounds), log, entityIds: entIds, defs};
  };
  T.start = ()=>{ T.startSnap = T.view('start'); startTurn(); return T; };
  return T;
}
// Whole fight with every row CPU-played (tests, editor simulation, quick previews).
function runTrench(opts){
  const T = createTrench(Object.assign({}, opts, {myRow: -1})).start();
  const snapshots = [T.startSnap];
  let guard = 0;
  while(!T.over && guard++ < 200) T.endTurn().forEach(s=>{ if(s.phase==='combat') snapshots.push(s); });
  return Object.assign({snapshots}, T.result());
}

const api = {ROW_NAMES, DEFAULTS, trenchConfig, createTrench, runTrench};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodTrench = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
