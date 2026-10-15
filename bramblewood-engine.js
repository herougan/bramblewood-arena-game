// ============================================================================
// Bramblewood shared combat engine — DOM-free, runs identically in the main
// thread (Play view, with events[] for animation/VFX) and inside a Web
// Worker (Simulator, events off for speed). This is now the SINGLE engine
// used by both the live game and the bulk simulator, replacing the two
// previously-separate (and previously drifting) implementations.
//
// New in this revision (2026-09-09 "mechanics" expansion):
//   Passive keywords : armor, thorns, swipe, rage  (poison/sweep/resist/bounty carried over)
//   Flat named effects: render (debuff), missile amount can be the literal
//                        string 'attack' meaning "use my current attack stat"
//   Resources         : grace (parallel currency to gold/acorns)
//   Costs             : graceCost, exileCost:{zone:'hand'|'graveyard', count}
//   Zones             : graveyard[] (now actually tracked, not just dropped),
//                        exile[] (out-of-play zone)
//   Generic triggers  : card.effects.triggers = [{on, do, ...}], on one of
//                        onSpawn/onReady/onDeath/onAttacked/onKill/onRoundStart/onExile
//
// New in this revision (2026-09-10 "castle + more keywords" expansion):
//   Passive keywords : expose (bonus dmg on next hit taken, any source),
//                        guardian (an adjacent ally takes hits meant for you)
//   Generic triggers  : + onAllySpawn (fires on every OTHER card, and the
//                        player's Castle, whenever any card is played);
//                        + a `once:true` flag any trigger entry can carry,
//                        tracked per board-card INSTANCE (card.firedOnce)
//   New actions       : expose (mirrors poison), reduceWaitOfSpawned (only
//                        meaningful on onAllySpawn — targets the just-played
//                        card via the `extra.spawnedCard` param, not self/opposite)
//   Castle fixture    : player.castle, set via setCastle(pl, defId) — a
//                        boardCard-like object for Castle-type cards (Castle/
//                        Colony/Nest). NOT YET wired into targeting/combat —
//                        only onAllySpawn-style effects see it today. Full
//                        Castle-replaces-flat-HQ wiring is pending the
//                        single-lane board rework (see game-design.md).
//
// New in this revision (2026-09-10 "tempo keywords" expansion, batch 2):
//   Passive keywords : quick (attacks before all non-quick attackers, any
//                        side, this round — jumps the whole resolution order),
//                        reload:N (after attacking, sits out N extra rounds
//                        before it can attack again — first attack is still
//                        gated only by wait as normal), stealth (ignores
//                        normal targeting entirely and always hits the
//                        enemy HQ directly, "hitting past" any blocker)
//   Trigger action    : stun (mark the target card stunned — this round its
//                        wait does not tick down AND it cannot attack; the
//                        flag self-clears at the following upkeep)
//   New keyword       : shell:N (passive) — being hit queues N bonus armor +
//                        a skip-next-attack debuff that activates starting
//                        the FOLLOWING round (not the round it was hit),
//                        and both clear again after that round resolves
//   ALL-targeting     : generic trigger actions (damage/poison/expose/stun/
//                        debuffAttack) and missile effects now accept
//                        `target:'all'` to hit every live enemy board card
//                        instead of one (opposite/random)
//   Passive keyword   : evasion — ignores a qualifying incoming SKILL effect
//                        every alternate attempt (1st evaded, 2nd lands, ...).
//                        Covers Missile/ranged damage, Render, Sweep/Swipe's
//                        EXTRA hits, and the generic Poison/Expose/Stun/Debuff
//                        Attack trigger actions — NOT a lane's primary melee
//                        hit, which always connects. See evasionGate().
//   Event additions   : 'hit'/'hitHQ'/'render' events now carry `attUid` (the
//                        attacking board card's uid) even for ranged sources,
//                        and `guardianRedirect:true` when Guardian actually
//                        intercepted the hit — both added purely so the Play
//                        tab can animate the correct attacker and flash a
//                        distinct "protected!" cue; no effect on resolution.
//                        A new 'evaded' event fires whenever Evasion blocks
//                        an attempt, carrying attUid/targetUid for the same.
//
// New in this revision (2026-09-13 "Character select" expansion):
//   The 'castle' card no longer exists as a playable/draftable card — it's
//   now the default entry in a small, separate CHARACTER_DEFS roster (see
//   arena_app.js), picked once before a match starts. newPlayer(id,
//   cardCounts, character) takes that pick as an optional 3rd arg: it sets
//   the player's HQ max HP (replacing the old flat HQ_MAX_HP=100) and can
//   grant a team-wide passive via character.effects — startGold (added to
//   starting acorns) and firstUnitAtkBonus (a permanent +N attack applied,
//   once, to the very first unit this player plays — see placeCard). Omitting
//   the 3rd arg keeps every old 2-arg newPlayer() call (tests, the simulator)
//   working exactly as before. Colony/Nest keep their old stats/effects but
//   are now plain type:'Structure' cards, no longer sharing a 'Castle' type
//   with the removed card. Cards can also now carry `locked:true` — a Codex/
//   deck-builder-only UI flag (see arena_app.js); the engine itself never
//   reads it, so a locked card still resolves normally if it somehow ends up
//   in a deck.
//
// New in this revision (2026-09-13 "Explode" expansion):
//   Passive keyword   : explode:{time, damage} — a lit fuse. Independent of
//                        Wait/Stun/Reload readiness: the countdown (card.
//                        explodeRemaining, seeded from `time` at creation)
//                        ticks down by 1 every single round in
//                        endOfRoundUpkeep no matter what state the card is
//                        in, including while still on Wait or while Stunned.
//                        The moment it reaches 0 it detonates exactly once
//                        (card.explodeFired guards against re-firing),
//                        dealing `damage` flat physical damage to whatever's
//                        directly opposite (via opposingCardOf) — or, if that
//                        lane is empty, straight through to the enemy HQ
//                        (deliberately different from Render, which simply
//                        does nothing on an empty lane: raw damage can still
//                        meaningfully land on the HQ). Routed through the
//                        existing fireDamageAction so it gets the same
//                        Evasion gate / Guardian redirect / kill-credit
//                        bookkeeping as every other damage source, and pushes
//                        its own 'explode' event (uid/targetUid/dmg) before
//                        that hit lands, purely so the Play tab can show a
//                        distinct fuse-blowing cue ahead of the impact.
//   New trigger action: buffNamedAlly:{amount, amount2, nameMatch, matchMode}
//                        — tribal/named synergy. Searches the CASTER's own
//                        board (never the enemy's) for a live card whose name
//                        matches `nameMatch`, either loosely (matchMode:
//                        'contains', e.g. any card with "Bee" anywhere in its
//                        name) or exactly (matchMode:'exact', only a card
//                        literally named "Bee"), and permanently adds
//                        `amount` Attack / `amount2` Health to the first one
//                        found. A no-op if nothing matches right now — pair
//                        with a separate spawnCard action in the same trigger
//                        to guarantee a target exists first. Pushes its own
//                        'namedBuff' event for logging/VFX.
// ============================================================================
const CARD_DEFS_GLOBAL = (typeof __CARD_DEFS__ !== 'undefined') ? __CARD_DEFS__ : null;

function otherId(id){ return id===1?2:1; }
function mulberry32(seed){
  return function(){
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rnd){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function buildDeckIdsFrom(cardCounts, rnd){
  let ids = [];
  Object.entries(cardCounts).forEach(([id,n])=>{ for(let i=0;i<n;i++) ids.push(id); });
  return shuffle(ids, rnd);
}
const HQ_MAX_HP = 100;
// Sudden death & draws (2026-10-03, explicit: "On turn 20+, go to sudden death - 1 hit = die. If
// no one has actions they can take, and nothing on the board state is changing - auto draw.").
// From SUDDEN_DEATH_ROUND, any hit that lands kills the unit it hits outright, and any hit on a
// castle (or a Gladiator leader) ends the game. A match still going at DRAW_ROUND_CAP is a draw.
const SUDDEN_DEATH_ROUND = 20;
// Two-stage sudden death (2026-10-12, user: "leave the sudden death [1] at round 20 or something. then [2] at 30. [2] affects
// the castle for [1] is just the creatures"): from round 20 any hit kills a unit; from round 30 a hit on a castle also ends
// the game. Every fight, bosses included (raids never reach stage II: suddenDeathCastles:false).
const SUDDEN_DEATH_CASTLE_ROUND = 30;
const DRAW_ROUND_CAP = 100;
const STALL_ROUNDS_FOR_DRAW = 2;
// A compact fingerprint of everything that can change on the board: castles, and every card's
// hp/attack/wait. If it's identical round after round, nothing is happening.
function boardSignature(players){
  return [1,2].map(pid=>{ const pl = players[pid];
    return pl.hq.hp + ':' + ['left','center','right'].map(s=> pl.row[s].map(c=> (c.gap?'_':c.defId+'/'+c.hp+'/'+c.atk+'/'+(c.wait||0))).join(',')).join('|');
  }).join('#');
}
// "No actions left": neither player has anything left to put into play (empty hand and deck).
// A player with any card in hand can always at least pitch it, which changes the game state.
function noActionsLeft(players){ return [1,2].every(pid=> !players[pid].hand.length && !players[pid].deck.length); }
function statKey(side, defId){ return side+'|'+defId; }
function ensureStat(stats, side, defId){
  const k = statKey(side, defId);
  if(!stats[k]) stats[k] = {
    side, defId, drawn:0, played:0, dealt:0, taken:0, faceDamage:0,
    // 2026-09-22: renamed from goldGenerated -- gainGold/onSpawnGold/onReadyGold all pay out
    // Lumber now (Gold is retired from live match play), so this stat now correctly tracks what
    // it actually measures. See newPlayer()'s comment for the full context.
    kills:0, deaths:0, lumberGenerated:0, graceGenerated:0, devilryGenerated:0, poisonApplied:0,
    spawnedTokens:0, thornsDealt:0, exiled:0,
  };
  return stats[k];
}

// TRIGGER_KEYS / ACTION_KEYS are shared with the Codex editor's UI registry
// (see TRIGGER_DEFS / ACTION_DEFS in the app shell) so the "On <<>>, Do <<>>"
// builder and this resolver never drift apart.
const TRIGGER_KEYS = ['onSpawn','onReady','onDeath','onAttacked','onAttack','onKill','onRoundStart','onExile',
  'onAllySpawn','onEnemySpawn','onColumnSpawn','onAllyDie','onHeal','onHealed','onAllyHealed','onDiscard',
  // 2026-09-27 batch: On Ally/Enemy Played (the "played from hand" half of the played/spawned
  // split — see fireSpawnFamilyTriggers in this file), On Ally/Enemy Ready, and On Move.
  'onAllyPlayed','onEnemyPlayed','onAllyReady','onEnemyReady','onMove',
  // Sacrifice - {} (2026-10-14, user: "The designer's toolkit: Sacrifice - {} aka On Sacrifice -> Do {}. But it's framed as
  // Sacrifice - { }"): fires when this card is consumed as Sacrifice fodder, eaten by Devour, or given up as a prayer offering.
  'onSacrifice'];
const ALWAYS_ON_HOOKS = new Set(['onSpawn','onReady','onDeath','onExile','onAttack','onKill','onDiscard','onSacrifice','onCharge']); // fire even while Waiting
const ACTION_KEYS = ['damage','gainGold','gainGrace','gainDevilry','gainStone','gainLumber','gain','refine','drawCard','exileGrave','spawnCard','buffAttack','debuffAttack','buffHealth','buff','debuff','poison','bleed','exile','exileSelf','expose','reduceWaitOfSpawned','stun','buffAlly','swapPositions','heal','cleanse','addWait','missile','mindControl','stunPlayer','shield'];

function makeSimEngine(CARD_DEFS, rnd, opts){
  rnd = rnd || Math.random;
  opts = opts || {};
  const recordEvents = !!opts.recordEvents;
  // Battle modes (2026-10-02, explicit request): 'gravity' is the original game — cards collapse
  // in toward the centre and targeting uses the rank-interlock "teeth" math. 'open' and
  // 'gladiator' use FIXED SLOTS instead: every board card carries an integer `slot` (0 = centre,
  // negative = left, positive = right, same screen columns for both players), gaps stay open when a
  // card dies, a new card must go next to one of your cards (or centre on an empty field), and a
  // card attacks straight across — an empty column opposite means it hits the castle.
  // 'gladiator' additionally starts each side with its leader pinned in slot 0 at 10x HP / 2x ATK;
  // there is no castle — "castle" damage goes into the leader, and the leader dying loses the game.
  const battleMode = opts.battleMode || 'gravity';
  const slotMode = battleMode==='open' || battleMode==='gladiator';
  const isGladiator = battleMode==='gladiator';
  // Reserve rows (2026-10-12, user: "for raids, I want a FULL proper game. Just that, there's multi rows! like maybe 3 rows v 3
  // rows"): opts.reserveRows (0–2) gives each side that many rows behind its front row, in Open (slot) battles. A card can be
  // placed in a reserve row behind one of yours; reserves don't fight and can't be hit. At the start of each round every
  // reserve whose column in front of it is empty steps up a row (middle to front, back to middle), and arriving at the front
  // counts as arriving on the battlefield (its On Spawn effects fire then).
  const RESERVE_ROWS = slotMode ? Math.max(0, Math.min(2, Math.round(Number(opts.reserveRows)||0))) : 0;
  const GAP = Object.freeze({hp:0, uid:null, gap:true});
  let suddenDeath = false;
  // Raid bosses opt out of the castle half (opts.suddenDeathCastles:false): otherwise simply
  // surviving to round 20 would hand any raider the whole boss castle.
  const suddenDeathCastles = opts.suddenDeathCastles !== false;
  let suddenDeathStage = 0;
  function setSuddenDeath(on, stage){ suddenDeath = !!on; suddenDeathStage = on ? (stage || 1) : 0; }
  // Raid trench hooks (2026-10-03, Raid P2 — see bramblewood-trench.js). All opt-in; a normal match
  // never sets them, so every existing fight resolves exactly as before.
  //  - passUpkeepIds: during a resolveCombat pass, only these player ids get poison/decay/round-start/
  //    end-of-round upkeep (a trench runs one pass per row against the same boss board).
  //  - passAttackerIds: only these player ids' cards attack in this pass.
  //  - pl.onHqHit(amount, attackerCard): if it returns a number, that replaces the castle hit
  //    (trench roll-through to the next row, or a boss castle shielded while its entities stand).
  let passUpkeepIds = null, passAttackerIds = null, currentAttacker = null;
  let curInitiative = 2;
  let passOnlyUid = null; // Test Kit's manual Attack: only this card acts in the pass
  function inUpkeep(pl){ return !passUpkeepIds || passUpkeepIds.includes(pl.id); }
  function isSuddenDeath(){ return suddenDeath; }
  function allBoardCards(pl){ return [...pl.row.left, ...pl.row.center, ...pl.row.right]; }
  // Keeps every card's slot consistent with the row array it lives in, and keeps the arrays sorted
  // nearest-centre first (the order the rest of the engine and the renderer already assume).
  // Cards pushed by effects/tokens without a slot (or moved to the other flank) get the next free
  // slot just beyond that flank's outermost card.
  function syncSlots(pl){
    if(!slotMode) return;
    const used = new Set();
    pl.row.center.forEach(c=>{ c.slot = 0; used.add(0); });
    [['left',-1],['right',1]].forEach(([side,sign])=>{
      const keep = [], fix = [];
      pl.row[side].forEach(c=>{
        if(Number.isInteger(c.slot) && Math.sign(c.slot)===sign && !used.has(c.slot)){ used.add(c.slot); keep.push(c); }
        else fix.push(c);
      });
      let edge = keep.reduce((m,c)=> Math.max(m, Math.abs(c.slot)), 0);
      fix.forEach(c=>{ edge += 1; while(used.has(sign*edge)) edge += 1; c.slot = sign*edge; used.add(c.slot); keep.push(c); });
      keep.sort((a,b)=> Math.abs(a.slot)-Math.abs(b.slot));
      pl.row[side] = keep;
    });
  }
  // Converge (2026-10-12, user: "evergreen - onReady: Collapses the ally or opposing board - depending on parameter ...
  // Pulling the enemy units towards the centre ... and making them targetable again"): when this unit becomes ready, the
  // chosen board ('enemy' | 'ally' | 'both') closes its gaps: its units keep their left-to-right order and pack together
  // around the centre, moving as little as they can. A pinned unit (a Gladiator leader) holds the board still.
  function convergeBoard(players, sideOf, srcPid, srcCard, which, events){
    const pids = which === 'both' ? [srcPid, otherId(srcPid)] : which === 'ally' ? [srcPid] : [otherId(srcPid)];
    pids.forEach(pid=>{
      const pl = players[pid]; if(!pl) return;
      const live = allBoardCards(pl).filter(c=> c.hp>0);
      if(live.length < 2 && !(live.length === 1 && slotMode && live[0].slot !== 0)) return;
      if(live.some(c=> c.pinned)) return;
      if(!slotMode){ return; } // a slotless row is always packed already
      syncSlots(pl);
      const order = live.slice().sort((a, b)=> a.slot - b.slot), n = order.length;
      let best = null, bestCost = Infinity;
      for(let start = -(n-1); start <= 0; start++){ const cost = order.reduce((t, c, i)=> t + Math.abs(c.slot - (start + i)), 0); if(cost < bestCost){ bestCost = cost; best = start; } }
      if(!bestCost) return;
      const moves = order.map((c, i)=> ({uid:c.uid, from:c.slot, to:best + i})).filter(mv=> mv.from !== mv.to);
      order.forEach((c, i)=>{ c.slot = best + i; });
      const dead = allBoardCards(pl).filter(c=> c.hp<=0);
      pl.row.center = order.filter(c=> c.slot===0);
      pl.row.left = order.filter(c=> c.slot<0).sort((a, b)=> Math.abs(a.slot)-Math.abs(b.slot));
      pl.row.right = order.filter(c=> c.slot>0).sort((a, b)=> a.slot-b.slot);
      dead.forEach(c=>{ (c.slot===0 ? pl.row.center : c.slot<0 ? pl.row.left : pl.row.right).push(c); });
      if(recordEvents && events) events.push({type:'converge', side:sideOf(srcPid), defId:srcCard.defId, uid:srcCard.uid, targetSide:sideOf(pid), moves});
    });
  }
  function occupiedSlots(pl){ syncSlots(pl); const set = new Set(); allBoardCards(pl).forEach(c=>{ if(c.hp>0) set.add(c.slot); }); return set; }
  // Legal placement slots in open/gladiator: any empty slot next to one of your live cards, or the
  // centre when you have nothing on the field.
  function legalSlots(pl){
    if(!slotMode) return [];
    const occ = occupiedSlots(pl);
    // A cage (Caged Fight) takes its slot but isn't one of your cards: it doesn't open the slots beside it.
    const own = new Set(); allBoardCards(pl).forEach(c=>{ if(c.hp>0 && !c.cageOf) own.add(c.slot); });
    if(own.size===0) return occ.has(0) ? [-1, 1].filter(n=> !occ.has(n)) : [0];
    const out = new Set();
    own.forEach(sl=>{ [sl-1, sl+1].forEach(n=>{ if(!occ.has(n)) out.add(n); }); });
    return [...out].sort((a,b)=>a-b);
  }
  // Resolves a placement request to a concrete slot: a number is taken as-is if legal; a
  // 'left'/'right'/'center' string (L/R buttons, AI, leader summon) picks the legal slot on that
  // side nearest the centre, falling back to the other side. Returns null if nothing is legal.
  function resolvePlacementSlot(pl, side){
    const legal = legalSlots(pl);
    if(!legal.length) return null;
    if(typeof side==='number') return legal.includes(side) ? side : null;
    const want = side==='left' ? -1 : (side==='right' ? 1 : 0);
    const byDist = (a,b)=> Math.abs(a)-Math.abs(b) || (a-b);
    const same = legal.filter(sl=> want===0 || sl===0 || Math.sign(sl)===want).sort(byDist);
    return (same.length ? same : legal.slice().sort(byDist))[0];
  }
  function frontCardAt(pl, slot){ return allBoardCards(pl).find(c=> c.hp > 0 && c.slot === slot) || null; }
  function legalReserveSlots(pl, r){
    if(!pl || !pl.reserve || !(r >= 1 && r <= pl.reserve.length)) return [];
    const ahead = r === 1 ? new Set(allBoardCards(pl).filter(c=> c.hp > 0 && Number.isInteger(c.slot)).map(c=> c.slot)) : new Set(Object.keys(pl.reserve[r-2]).map(Number));
    return [...ahead].filter(sl=> !pl.reserve[r-1][sl]).sort((a,b)=> a-b);
  }
  // Put a card straight into a reserve row (a raid boss's set-up), no cost and no checks beyond the slot being free.
  function fillReserve(pl, r, slot, defId){
    if(!pl || !pl.reserve || !pl.reserve[r-1] || pl.reserve[r-1][slot]) return null;
    const c = makeBoardCard(defId); c.slot = slot; pl.reserve[r-1][slot] = c; return c;
  }
  function advanceReserves(players, sideOf, stats, events){
    [1,2].forEach(pid=>{
      const pl = players[pid]; if(!pl || !pl.reserve) return;
      for(let r = 0; r < pl.reserve.length; r++){
        Object.keys(pl.reserve[r]).map(Number).sort((a,b)=> Math.abs(a)-Math.abs(b)).forEach(sl=>{
          const c = pl.reserve[r][sl]; if(!c) return;
          if(r === 0){
            if(frontCardAt(pl, sl)) return;
            delete pl.reserve[0][sl];
            putInSlot(pl, c, sl);
            if(recordEvents && events) events.push({type:'advance', side:sideOf(pid), uid:c.uid, defId:c.defId, slot:sl, from:1, to:0});
            applyOnSpawnEffects(players, sideOf, pid, c, stats, events);
            fireSpawnFamilyTriggers(players, sideOf, pid, c, stats, events, 'played');
          } else {
            if(pl.reserve[r-1][sl]) return;
            delete pl.reserve[r][sl]; pl.reserve[r-1][sl] = c;
            if(recordEvents && events) events.push({type:'advance', side:sideOf(pid), uid:c.uid, defId:c.defId, slot:sl, from:r+1, to:r});
          }
        });
      }
    });
  }
  function putInSlot(pl, card, slot){
    card.slot = slot;
    const side = slot===0 ? 'center' : (slot<0 ? 'left' : 'right');
    pl.row[side].push(card);
    syncSlots(pl);
    return side;
  }
  function gladiatorLeaderOf(pl){
    if(!isGladiator || pl.gladiatorLeaderUid==null) return null;
    return allBoardCards(pl).find(c=>c.uid===pl.gladiatorLeaderUid) || null;
  }
  // Gladiator has no castle: each side's hq mirrors its leader so every existing win/HP check and
  // the castle HP bar keep working unchanged.
  function syncGladiatorHq(pl){
    if(!isGladiator || pl.gladiatorLeaderUid==null) return;
    const ld = gladiatorLeaderOf(pl);
    if(ld) pl.hq.maxHp = ld.maxHp;
    pl.hq.hp = ld ? Math.max(0, ld.hp) : 0;
  }
  // Gladiator setup: drops this side's leader straight into the centre, free, at 10x HP / 2x ATK,
  // pinned so no effect can move it.
  function placeGladiatorLeader(players, sideOf, playerId, defId, stats, events){
    const pl = players[playerId];
    if(!isGladiator || !CARD_DEFS[defId]) return null;
    const c = makeBoardCard(defId);
    c.hp *= 10; c.maxHp *= 10; c.atk *= 2; c.baseAtk *= 2;
    c.pinned = true; c.gladiatorLeader = true;
    pl.row.center = [];
    putInSlot(pl, c, 0);
    pl.gladiatorLeaderUid = c.uid;
    syncGladiatorHq(pl);
    ensureStat(stats, sideOf(playerId), defId).played++;
    if(recordEvents && events) events.push({type:'play', side:sideOf(playerId), defId, uid:c.uid, boardSide:'center', slot:0, leader:true, gladiator:true});
    return c;
  }

  function costOfCard(defId){ return CARD_DEFS[defId].cost || 0; }
  function graceCostOfCard(defId){ return CARD_DEFS[defId].graceCost || 0; }
  // Devilry (2026-09-14): a third resource, structurally a mirror of Grace — its own
  // pool, its own cost, its own onSpawn/onReady generators, its own gainDevilry trigger
  // action. Part of unlocking the "mechanic line" system (see MECHANIC_LINE_DEFS in the
  // app shell): a card belongs to none/Grace(Ecclesia)/Exile(Scrappers)/Devilry.
  function devilryCostOfCard(defId){ return CARD_DEFS[defId].devilryCost || 0; }
  function exileCostOfCard(defId){ return CARD_DEFS[defId].exileCost || null; }

  // `character` (optional) is a Character-select def — {id,name,hp,effects:{startGold,firstUnitAtkBonus,...}}
  // — chosen before the match, replacing the old flat 100 HQ HP with a per-character pool plus a
  // team-wide passive. Omitted entirely, newPlayer keeps its old flat-HQ_MAX_HP behavior unchanged
  // (existing callers/tests that only ever passed 2 args are unaffected).
  function newPlayer(id, cardCounts, character){
    const chEffects = (character && character.effects) || {};
    // 2026-09-20 (Castle/Bramble data-format unification, "the castle ain't cards yet -- make
    // them the same format as cards"): a Castle def's max-HP field is now named `health`, same as
    // every card def's own health field, instead of the old bespoke `hp`. `character.hp` is kept
    // as a fallback so any not-yet-migrated caller (a saved match snapshot, an old test) still
    // works unchanged.
    const hqHp = (character && (character.health!=null ? character.health : character.hp)) || HQ_MAX_HP;
    return {
      reserve: RESERVE_ROWS ? Array.from({length:RESERVE_ROWS}, ()=> ({})) : null, // reserve rows behind the front (slot -> card)
      // stone (2026-09-17, per explicit request): the first genuinely-wired-up currency in the
      // long-queued Gold->Stone/Lumber/Elemental-Energy resource backlog (see
      // game-design-v18-addendum.md) — starts at 0, generated by pitching a creature card (see
      // discardCardByUid in arena_app.js and CARD_DEFS[id].pitchYield below), same shape as
      // acorns/grace/devilry but nothing spends it yet.
      // lumber/elementalEnergy (2026-09-18, per explicit request: "Do Lumber please" + "an
      // advanced resource where it takes refining from units"): same shape as stone — starts at
      // 0, lumber generated by pitching a Structure card (see pitchYieldOf in arena_app.js),
      // elementalEnergy produced only via a card's 'refine' custom trigger (see ACTION_DEFS/
      // runCustomTriggers below), which also consumes 1 stone per proc.
      // 2026-09-22 ("don't use gold anymore. the current symbol that represents gold looks like
      // stone anyway!"): in-match Gold (acorns) is retired as a live currency -- nothing gates a
      // cost against it or grants it anymore (see costOfCard's call sites and every former
      // gainGold/onSpawnGold/onReadyGold/bounty site below, all redirected to `lumber`). `acorns`
      // itself is kept as a field (always 0) purely so any stray external read of pl.acorns finds
      // a safe number instead of undefined; nothing writes to it anymore. A character's
      // `startGold` effect now seeds starting Lumber instead of starting Gold, same amount.
      id, hq:{hp:hqHp, maxHp:hqHp}, acorns:0, grace:0, devilry:0, stone:0, metal:0, uranium:0, lumber:(chEffects.startGold||0), elementalEnergy:0,
      deck:buildDeckIdsFrom(cardCounts, rnd), hand:[], row:{left:[], center:[], right:[]},
      graveyard:[], exile:[], echoes:0, castle:null, // castle: a boardCard-like fixture, set via setCastle(); not yet wired into targeting/combat (see game-design.md)
      playedThisTurn:false, discardUsedThisTurn:false,
      character: character || null,
      firstUnitAtkBonus: (chEffects.firstUnitAtkBonus||0), firstUnitBonusUsed:false,
      // Castle passives added 2026-10-10 (map castles): unitHpBonus (+N Health on every unit you play), flyerAtkBonus
      // (+N Attack on every Flying unit you play), castleRegen (the castle heals N at each round start).
      unitHpBonus: (chEffects.unitHpBonus||0), flyerAtkBonus: (chEffects.flyerAtkBonus||0), castleRegen: (chEffects.castleRegen||0),
      // Castle passives added 2026-10-12 (user: "Where are our diversity of castles like logjam, trojan, ballistae, clam farms,
      // thorn-cage, herb refinery, Hidden Nest"): enemyWaitBonus (the enemy's first 3 units arrive N Wait later), castleBolt (a bolt at a
      // random enemy unit each round), castleLumberEvery (+1 Lumber every N rounds), castleThorns (a unit that hits the
      // castle takes N), herbRefinery (each round one of: heal your most wounded unit 3, 2 damage to a random enemy, +1 Lumber),
      // castleSpawn ({first, every, defId, count}: units join you from the castle on those rounds).
      enemyWaitBonus: (chEffects.enemyWaitBonus||0), castleBolt: (chEffects.castleBolt||0), castleLumberEvery: (chEffects.castleLumberEvery||0),
      castleThorns: (chEffects.castleThorns||0), herbRefinery: !!chEffects.herbRefinery, castleSpawn: chEffects.castleSpawn || null,
    };
  }
  // Assigns a player's Castle-type card (Castle/Colony/Nest/...). Not yet a
  // targetable board entity — this exists so Castle-only effects (like
  // Nest's onAllySpawn) can already be tested/used ahead of the full
  // Castle-zone + single-lane rework landing.
  function setCastle(pl, defId){ pl.castle = makeBoardCard(defId); return pl.castle; }
  let uidCounter = 1;
  // Hand limit (2026-10-02, explicit request): a hand holds at most MAX_HAND cards. A draw with a
  // full hand "auto-pitches" instead — the top card goes straight from the deck to the graveyard
  // and pays 1 Lumber. Every draw (round start and card effects) funnels through here.
  const MAX_HAND = 5;
  function draw(player, n, side, stats, events){
    for(let i=0;i<n;i++){
      if(player.deck.length===0) return;
      const defId = player.deck.pop();
      player.drawnTotal = (player.drawnTotal||0) + 1; // Ritual tally (2026-10-10)
      if(player.hand.length >= MAX_HAND){
        player.graveyard.push({defId});
        player.lumber += 1;
        if(recordEvents && events) events.push({type:'overdraw', side, defId, lumber:1});
        continue;
      }
      player.hand.push({uid:uidCounter++, defId});
      ensureStat(stats, side, defId).drawn++;
      if(recordEvents && events) events.push({type:'draw', side, defId});
    }
  }
  // Self-inflicted statuses (2026-10-11, user: "passives for each status effect - where you self inflict yourself at the
  // start. Like Drunk = apply dizzy to yourself"): Drunk keeps the card Tipsy, Purblind keeps it Blind, Scatterbrained
  // keeps it Confused, from the moment it arrives and for good (a Cleanse only clears it until the next round).
  function selfInflict(c){ const e = (CARD_DEFS[c.defId] || {}).effects || {}; if(e.drunk && !(c.tipsy>0)) c.tipsy = 1; if(e.purblind && !e.keenSense && !(c.blind>0)) c.blind = 1; if(e.scatterbrained && !(c.confused>0)) c.confused = 1; }
  // Frenzy (2026-10-12): a Frenzy card is frenzied while any status is on it.
  function isFrenzied(c){
    const d = c && CARD_DEFS[c.defId]; if(!d || !d.effects || !d.effects.frenzy) return false;
    return (c.poison>0 || c.bleed>0 || c.decay>0 || c.scar>0 || c.exposed>0 || c.corrode>0 || c.frozen>0 || c.asleep>0 || c.paralyzed>0 ||
      c.blind>0 || c.tipsy>0 || c.confused>0 || c.shocked>0 || c.staggered>0 || !!c.stunned);
  }
  // Wildpath perks on arrival (2026-10-13): Bark Skin, Hedge Wall, Old Growth, Sharpened Briars, Light Feet. Only the side
  // that carries pl.perks gets them, so the enemy's copies of the same cards are untouched.
  function applyArrivalPerks(pl, c){
    const k = pl && pl.perks; if(!k || !c) return; const d = CARD_DEFS[c.defId] || {}, e = d.effects || {};
    if(k.floorPct > 0){ const f = 1 + k.floorPct; const a = Math.round((c.atk||0) * f), h = Math.round((c.hp||0) * f); c.baseAtk += a - c.atk; c.atk = a; c.maxHp += h - c.hp; c.hp = h; } // endless dungeon floors (2026-10-13)
    if(k.briars && (c.atk|0) <= 3 && (c.atk|0) > 0){ c.atk += k.briars; c.baseAtk += k.briars; }
    if(k.oldGrowth && (d.wait|0) >= 2){ c.atk += 1; c.baseAtk += 1; c.hp += 2; c.maxHp += 2; }
    if(k.hedgeWall && e.guardian){ c.hp += 2*k.hedgeWall; c.maxHp += 2*k.hedgeWall; }
    if(k.lightFeet && e.quick){ k.lightFeet = false; c.wait = 0; }
    if(k.barkSkin){ k.barkSkin = false; deriveDef(c, {armor: (Number(e.armor)||0) + 1}); }
  }
  function perksOfSide(side){ const pl = curPlayers && curPlayers[side==='A' ? 1 : 2]; return (pl && pl.perks) || null; }
  function makeBoardCard(defId){
    const def = CARD_DEFS[defId];
    const board = {uid:uidCounter++, defId, hp:def.health, maxHp:def.health, atk:def.attack, baseAtk:def.attack, wait:def.wait, fuse: Number(def.effects && def.effects.dynamite) || 0, poison:0, decay:0, bleed:0, exposed:0, scar:0, firedOnce:{},
      ffCounters: Math.max(0, Number(def.effects && def.effects.fastForward) || 0), // Fast Forward N (2026-10-12), see fastForwardPass
      reloadRemaining:0, _reloadJustSet:false, stunned:false, _stunnedJustSet:false, shellArmor:0, shellSkip:false, shellNext:0, tempHp:0, shellUntil:null, inspired:0, _frenziedThisRound:false,
      critUsed:0, rallyBonus:0,
      // Elemental status effects (2026-09-16), one per non-physical DMG_TYPE — see
      // rollStatusOnHit/gatherAttackers/endOfRoundUpkeep for the full lifecycle of each:
      frozen:0, _frozenJustSet:false,       // cold — flat skip-this-round, ticks down every upkeep
      asleep:0, _asleepJustSet:false,       // poison-flavored ("Sleeping") — flat skip-this-round, breaks early on any damage taken
      paralyzed:0, _paralyzedJustSet:false, // acid — a FRESH 50/50 coin flip gates each round's action while >0
      // Three more status effects (2026-09-17 batch) — see rollStatusOnHit/endOfRoundUpkeep/
      // computeHitDamage/effAtk for the full lifecycle of each:
      smoke:0, _smokeJustSet:false,         // Smoke (2026-10-14): attacks at it miss 1 in 2 while >0 (a Smoke Bomb ally), ticks down every upkeep
      blind:0, _blindJustSet:false,         // this card's own attacks miss half the time while >0 (2026-10-11; was: always), ticks down every upkeep
      tipsy:0, _tipsyJustSet:false,         // Tipsy (2026-10-11): swings at the unit to the left, in front or to the right at random; nobody there = a miss
      confused:0, _confusedJustSet:false,   // Confused (2026-10-11): its triggers and on-hit skills fizzle half the time
      shocked:0, _shockedJustSet:false,     // every hit THIS card takes deals 50% bonus damage while >0, ticks down every upkeep
      corrode:0, _corrodeJustSet:false,     // stacking (like Poison/Bleed): each stack lowers this card's effective Attack by 1, decays by 1/round
      // Stagger (2026-09-24, task #109, "one status effect per elemental damage type" — the
      // physical slot; cold/heat/acid/poison already had Frozen/Stun/Paralyzed/Asleep from the
      // 2026-09-16/17 batches, see effAtk/rollStatusOnHit/endOfRoundUpkeep): every hit THIS card
      // DEALS lands for 50% less while >0 — the deliberate mirror of Shock (50% more damage
      // TAKEN), ticks down every upkeep the same way.
      staggered:0, _staggeredJustSet:false,
      ambushUsed:false};                    // Ambush (2026-09-17): consumed by this card's first attack after entering play
    if(def.terrainNative && terrain){ const ta = Number(terrain.atk)||0, th = Number(terrain.hp)||0; board.atk += ta; board.baseAtk += ta; board.hp += th; board.maxHp += th; board.terrain = true; }
    // Explode: seed the fuse at creation time (mirrors how `wait` is seeded above), so it
    // starts counting down from the moment the card enters play, independent of readiness.
    if(def.effects && def.effects.explode){ board.explodeRemaining = def.effects.explode.time; board.explodeFired = false; }
    // Chained (Devilry, 2026-09-17, per explicit request: "cards that come up 'Chained'.
    // Chained units need certain concepts happen before their chains are broken off"): a
    // chained card is seeded locked (gatherAttackers excludes it entirely, same shape as
    // Frozen/Asleep/Stunned) until its own def-configured break condition fires — see
    // maybeBreakChain, called from fireDamageAction (breakOn:'damage') and placeCard
    // (breakOn:'enemySpawn'). Unlike Frozen/Asleep this never counts down on its own; it only
    // ever clears via its specific break condition, however many rounds that takes.
    if(def.effects && def.effects.chained){ board.chained = true; }
    if(chargeOf(def) && !(board.wait > 0)) board.chargeLeft = chargeOf(def).n; // Charge N (2026-10-14): Ready on arrival, so the clock starts now
    selfInflict(board);
    return board;
  }
  // Chained break-condition check (2026-09-17) — deliberately its own small function, called
  // from any hook site that could plausibly break a chain, so a future breakOn type (the user
  // named "opponent unit enters the battlefield" as just one example of "other ways") only
  // ever needs a new `else if(cond.breakOn===...)` here plus one call site, not a rewrite.
  // `context` carries whatever this specific check needs: {kind:'damage', amount} or
  // {kind:'enemySpawn'} today.
  function maybeBreakChain(players, sideOf, ownerId, card, stats, events, context){
    if(!card.chained) return;
    const def = CARD_DEFS[card.defId];
    const cond = def.effects && def.effects.chained;
    if(!cond) { card.chained = false; return; } // definition was edited out from under a live card — just release it
    let breaks = false;
    if(cond.breakOn==='damage' && context.kind==='damage') breaks = context.amount > (cond.amount||1);
    else if(cond.breakOn==='enemySpawn' && context.kind==='enemySpawn') breaks = true;
    if(!breaks) return;
    card.chained = false;
    if(recordEvents && events) events.push({type:'chainBreak', side:sideOf(ownerId), defId:card.defId, uid:card.uid, cause:context.kind});
    runCustomTriggers(players, sideOf, ownerId, card, def, 'onChainBreak', stats, events);
  }
  // Resist (reworked 2026-09-16 from a plain "reduces this damage-type" list into a full
  // Passive Ability, "Resist - <param>" — the param can be a damage type (Resist - Poison),
  // an attacker archetype/type-tag (Resist - Insect), or an attacker keyword/ability name
  // (Resist - Sweep), matched against whichever CARD_DEFS entry is attacking. attDef is
  // optional so every pre-existing call site that only ever had a dmgType (bleed/poison self-
  // ticks, with no real "attacker") keeps its old dmgType-only behavior unchanged.
  function resistFactor(defId, dmgType, attDef){
    const def = CARD_DEFS[defId];
    // Resist can live in two places on a card def: the legacy top-level `resist` array
    // (pre-2026-09-16 cards, and still how the raw JSON is authored), or `effects.resist`
    // (2026-09-16: Resist became its own dedicated "Resistance" box on the card form —
    // effects.resist is a plain array of match-keys, no longer routed through the "+ Add
    // Skill" system at all). Both are honored rather than migrating every existing card's data.
    // Immune (2026-10-12, user: "Add immune to the game - then it'll be Immune: ____"): same keys as Resist (a damage
    // type, an attacker's type or an attacker's skill); a match takes no damage at all.
    if(def && def.effects && def.effects.ghost && (dmgType === 'physical' || dmgType == null)) return 0; // Ghost (2026-10-14): normal damage passes through
    const immuneList = (def && def.effects && def.effects.immune) || [];
    if(immuneList.length && immuneList.some(r=> matchesResistKey(r, dmgType, attDef))) return 0;
    const resistList = [...((def && def.resist) || []), ...((def && def.effects && def.effects.resist) || []), ...((def && def.effects && def.effects.dry) ? ['heat'] : [])]; // Dry (2026-10-13): desert-hardy, Heat Resist built in
    if(!resistList.length) return 1;
    const hit = resistList.some(r=> matchesResistKey(r, dmgType, attDef));
    return hit ? 0.5 : 1;
  }
  // Weakness (2026-09-16): the mirror of Resist — same matching rules (damage type / attacker
  // archetype-tag / attacker ability keyword), but a match DOUBLES incoming damage instead of
  // halving it. Lives in its own "Weakness" box on the card form, next to Resistance, and (like
  // Resist) is plain data on effects.weakness — never a "+ Add Skill" row. No legacy top-level
  // field to also check here since Weakness never existed before this array did.
  function matchesResistKey(r, dmgType, attDef){
    if(dmgType && dmgType!=='physical' && r===dmgType) return true; // damage-type match
    if(attDef && Array.isArray(attDef.archetypes) && attDef.archetypes.includes(r)) return true; // type-tag match
    if(attDef && attDef.effects && attDef.effects[r]) return true; // keyword/ability match
    return false;
  }
  function weaknessFactor(defId, dmgType, attDef){
    const def = CARD_DEFS[defId];
    let weaknessList = (def && def.effects && def.effects.weakness) || [];
    if(def && def.effects && def.effects.rabid) weaknessList = weaknessList.concat(['swimmer', 'water']); // Rabid (2026-10-14): "Vulnerable to water"
    if(!weaknessList.length) return 1;
    const hit = weaknessList.some(r=> matchesResistKey(r, dmgType, attDef));
    return hit ? 2 : 1;
  }
  // Feeble/Mighty/Fragile/Sturdy (2026-09-29): four unconditional inherent damage multipliers —
  // unlike Resist/Weakness just above, these never match against a dmgType/archetype/keyword key,
  // they're a flat, always-on trait of the card. Feeble/Mighty scale what THIS card DEALS
  // (attacker-side); Fragile/Sturdy scale what THIS card TAKES (defender-side) — kept as a
  // separate family from Resist/Weakness specifically to avoid a naming collision (Weakness
  // already means "takes double damage from a matching key," which is a different, conditional
  // mechanic). A card carrying a contradictory pair (e.g. both feeble and mighty) multiplies them
  // together same as Resist+Weakness already does — nets to 1x, not specially handled.
  function attackerDamageFactor(attDef){
    if(!attDef || !attDef.effects) return 1;
    let f = 1;
    if(attDef.effects.feeble) f *= 0.5;
    if(attDef.effects.mighty) f *= 2;
    return f;
  }
  function defenderDamageFactor(defId){
    const def = CARD_DEFS[defId];
    if(!def || !def.effects) return 1;
    let f = 1;
    if(def.effects.fragile) f *= 2;
    if(def.effects.sturdy) f *= 0.5;
    return f;
  }
  // ---- Fields and the day/night cycle (2026-10-09, user: "I like the idea of day and night and other things
  // like that - making the game more fluid - not every turn is the same" + "Field effect card(s) like freezing").
  // One shared field at a time. It comes from the map (Frozen Ground on the Tundra, permanent) or from a field
  // card (for N rounds; a new field card replaces the old one). Day and night alternate every 3 rounds; Dawn
  // (the first round of each new day) lets both sides draw a card. Nocturnal cards hit +1 at night, Diurnal by day.
  const FIELDS = {
    frozen:   {name:'Frigid', icon:'❄️', text:'At the start of every round, one random unit on each side gets +1 Wait (more at higher levels). Units weak to cold also take 1 damage.'},
    heatwave: {name:'Scorching', icon:'🔥', text:'At the start of every round, two random units on each side take 1 fire damage (more at higher levels). Heat-resistant units are spared; units weak to heat take double.'},
    rain:     {name:'Spring Rain', icon:'🌧️', text:'At the start of every round, every unit heals 2.'},
    fog:      {name:'Thick Fog', icon:'🌫️', text:'Every attack has a 1-in-3 chance to miss (Flying units see over it).'},
    // 2026-10-14 (user: "Night/Day ... Not brought up by playing a card"): the Full Moon no longer makes it night. While it is up
    // the moon is full, so at night (on a map that has nights) Moonborn units get their whole bonus.
    moon:     {name:'Full Moon', icon:'🌕', text:'The moon is full while it is up: at night, Moonborn units get their whole bonus. It does not bring the night.'},
  };
  let field = opts.field && FIELDS[opts.field] ? {id: opts.field, rounds: null} : null;
  const dayNight = opts.dayNight !== false;
  // Arena rules (2026-10-10, user: "the arena mode changes rapidly, so the player is inclined to build many different
  // kind of decks (even maybe all-nights and all-brights)"): opts.rules = {phase:'cycle'|'nightFirst'|'day'|'night',
  // lumberEvery:N (each side +1 Lumber every N rounds), field:<id> (permanent field, same as opts.field)}.
  const rules = opts.rules || {};
  // Perma-tide (2026-10-14, user: "River - effect: Perma-tide. (In codex only: Can't be affected by Tide affecting effects)"):
  // rules.permaTide. The Tide is always in: Flow every round from round 1, never Ebb or High tide, whether or not a Tide card was
  // played. Nothing that moves the tide (Moonpull, the Tide-spout's "tide comes in", the Ebb/High alternation) changes it.
  const permaTide = !!rules.permaTide;
  // Terrain (2026-10-12, user: "Do effects for each biome, highlighting that biome's strength"): rules.terrain =
  // {types:[...], atk, hp, grant:{skill:value}}. A card whose types include one of the biome's is native: on either side it
  // arrives with +atk/+hp and gains the granted skills (its own value wins if it already has that skill). Done on this
  // match's own copy of the card list, so every skill reads the granted value with no other change.
  // 2026-10-14 (user: "Remove the Home ground explanation. Remove the home ground effect."): retired. rules.terrain still names
  // the biome (the board's look), but native cards get nothing from it any more: no +atk/+hp and no granted skill.
  const terrain = null;
  if(terrain){
    const types = new Set(terrain.types), out = Object.assign({}, CARD_DEFS);
    Object.keys(CARD_DEFS).forEach(id=>{ const d = CARD_DEFS[id]; if(!d || !Array.isArray(d.archetypes) || !d.archetypes.some(a=> types.has(a))) return;
      out[id] = Object.assign({}, d, {terrainNative: true, effects: terrain.grant ? Object.assign({}, terrain.grant, d.effects || {}) : d.effects}); });
    CARD_DEFS = out;
  }
  // 2026-10-11 (user: "The diurnal cycle should be off by default. It is only enabled via a Skirmish setting, which can
  // have a configurable switch period (e.g. 3 turns)"): with no phase rule there is no day or night at all — no pill, no
  // Nocturnal / Diurnal bonus. A fight (or an Arena ruleset) turns it on with rules.phase and rules.phaseLen.
  // D33 (2026-10-12, user: "The day/night - disable switching, but treat all as day except certain maps"): with no phase
  // rule it is day all match (Conquest's night maps pass phase:'night'); 'off' still turns day and night off entirely.
  // 'realtime' (an option, on no map yet; user: "in this map, 7PM - 7AM realtime is day, 7AM-7PM is night. The minute on
  // the dot is called twilight, both effects are active and doubled"): the player's clock decides, checked every round.
  const phaseMode = rules.phase || 'day';
  const phaseOff = phaseMode==='off';
  const phaseFixed = phaseMode==='day' || phaseMode==='night' || phaseMode==='realtime';
  function realtimePhase(){ const d = rules.clock != null ? new Date(rules.clock) : new Date(), h = d.getHours(), m = d.getMinutes();
    if((h === 7 || h === 19) && m === 0) return 'twilight';
    return (h >= 7 && h < 19) ? 'night' : 'day'; }
  let phase = phaseMode==='realtime' ? realtimePhase() : (phaseMode==='night' || phaseMode==='nightFirst' ? 'night' : 'day');
  if(!field && rules.field && FIELDS[rules.field]) field = {id: rules.field, rounds: null};
  function getField(){ return field ? Object.assign({}, field, FIELDS[field.id]) : null; }
  let turnNo = 0; // counts rounds that have started, so "one field card per turn" needs no extra resets
  let baseField = null; // a permanent (map) field waits underneath a played one and returns when it ends
  function setField(id, rounds, by){
    if(field && field.rounds == null && rounds) baseField = field;
    field = FIELDS[id] ? {id, rounds: rounds || null, by: by || null} : null;
  }
  function getPhase(){ return phaseOff ? null : phase; } // the Full Moon no longer forces night (2026-10-14)
  // Nocturnal / Diurnal N (2026-10-10, user: "The effect for units with Nocturnal looks like 'Nocturnal - Gain +2/+2'"
  // + "the weredog gains +5/+6 at night"): while it's night (day for Diurnal) the unit has +N Attack and +M Health
  // (effects.nocturnal = N, effects.nocturnalHp = M; the old `true` means +1/+0). syncPhaseStats applies and removes it
  // as the phase turns, reporting phaseGrow / phaseFade so the board can show it.
  function twilightOn(players){ if(rules.twilight) return true; if(!players) return false;
    return [1,2].some(pid=> players[pid] && [...(players[pid].deck||[]).map(x=> x && (x.defId || x)), ...(players[pid].hand||[]).map(h=> h.defId), ...allBoardCards(players[pid]).map(c=> c.defId)].some(id=>{ const e = (CARD_DEFS[id]||{}).effects; return !!(e && (e.crepuscular || e.crepuscularHp)); })); }
  function phaseActive(){ return !!((turnNo && !phaseOff) || phaseFixed); }
  function phaseStatsOf(e, ph){
    const pick = k=>{ if(e[k+'Grant'] && typeof e[k+'Grant'] === 'object') return [0, 0]; const v = e[k]; return [v===true ? 1 : (Number(v)||0), Number(e[k+'Hp'])||0]; }; // Diurnal – {…}: the braces, not the plain bonus (2026-10-15)
    if(ph==='twilight'){ const n = (e.nocturnal || e.nocturnalHp) ? pick('nocturnal') : [0,0], d = (e.diurnal || e.diurnalHp) ? pick('diurnal') : [0,0], c = (e.crepuscular || e.crepuscularHp) ? pick('crepuscular') : [0,0]; return [n[0] + d[0] + c[0], n[1] + d[1] + c[1]]; } // 2026-10-13: both are active in Twilight, and Crepuscular only then
    if(ph==='night' && (e.nocturnal || e.nocturnalHp)) return pick('nocturnal');
    if(ph==='day' && (e.diurnal || e.diurnalHp)) return pick('diurnal');
    return [0, 0];
  }
  function syncPhaseStats(players, sideOf, events){
    const ph = phaseActive() ? getPhase() : null;
    [1,2].forEach(pid=>{ const pl = players && players[pid]; if(!pl || !pl.row) return;
      const units = [...pl.row.left, ...pl.row.center, ...pl.row.right];
      // Lantern (2026-10-11, Lantern Bearer): while one is on your board at Night, your Diurnal units keep their day bonus.
      const lit = ph==='night' && units.some(c=> c && !c.gap && c.hp > 0 && CARD_DEFS[c.defId] && CARD_DEFS[c.defId].effects && CARD_DEFS[c.defId].effects.lantern);
      const packs = packChainsOf(pl); // Pack chains (2026-10-14): their bonus rides on the same situational +A/+H as day and night
      units.forEach(c=>{
        if(!c || c.gap || c.hp <= 0) return;
        { const pk = packs.get(c); c.packChain = pk ? pk.n : 0; c.packChainBonus = pk ? pk.bonus : 0; }
        const e = (CARD_DEFS[c._condBase || c.defId] && CARD_DEFS[c._condBase || c.defId].effects) || {};
        // Full Moon (2026-10-15): the first full moon over it (night with a full moon, or the Full Moon field) marks it for good.
        if((e.fullMoon || e.fullMoonGrant) && !c.fullMoonRisen && ((ph === 'night' && moonPhase() === 4) || (field && field.id === 'moon'))){ c.fullMoonRisen = true;
          if(recordEvents && events) events.push({type:'statusFx', kind:'fullMoon', side:sideOf ? sideOf(pid) : (pid===1?'A':'B'), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId, amount: e.fullMoonGrant ? 0 : (e.fullMoon === true ? 3 : (Number(e.fullMoon)||3)), grant: e.fullMoonGrant ? Object.keys(e.fullMoonGrant) : null}); }
        let [a, h] = ph ? phaseStatsOf(e, (lit && (e.diurnal || e.diurnalHp) && !(e.nocturnal || e.nocturnalHp)) ? 'day' : ph) : [0, 0]; const pa = c.phaseAtk||0, ph0 = c.phaseHp||0;
        a += c.packChainBonus; h += c.packChainBonus;
        { const [ca, ch, grant] = condStatsOf(c, e, pid, players); a += ca; h += ch;
          const key = grant ? JSON.stringify(grant) : '';
          if((c._condKey||'') !== key){ if(c._condBase){ c.defId = c._condBase; c._condBase = null; } if(key){ c._condBase = c.defId; deriveDef(c, grant); } c._condKey = key; } }
        if(a === pa && h === ph0) return;
        c.phaseAtk = a;
        if(h !== ph0){ const d = h - ph0; c.maxHp = Math.max(1, c.maxHp + d); c.hp = d > 0 ? c.hp + d : Math.max(1, Math.min(c.hp, c.maxHp)); c.phaseHp = h; }
        if(recordEvents && events) events.push({type:'statusFx', kind: (a > pa || h > ph0) ? 'phaseGrow' : 'phaseFade', side:sideOf ? sideOf(pid) : (pid===1?'A':'B'), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId, amount:a - pa, hp:h - ph0, phase:ph});
      });
    });
    computeSpeeds(players); // Speed and Haste (2026-10-14)
  }
  function phaseBonus(card){ return (card && card.phaseAtk) || 0; }
  // Pack N, reworked 2026-10-14 (user: "Pack not so much. Packs try to be adjacent to each other. Each in the chain gives a massive
  // stat boost. Default 2, increments of 2. Irradiation will wipe out 2 at a time, similarly. (If 3 creatures, +6/+6) Pack leader
  // grants all Pack members on the map, adjacent or not, to count as adjacent, and also gives its own +2/+2 at minimum. (+ a +2/+2
  // since its the same type) Btw Pack Leader only helps Packs that share a type. A Pack leader can possibly have 2 packs - if the
  // pack leader is duo-type."). (The old Pack N: on arrival, +N Health per ally sharing a type.)
  //   A chain is an unbroken run of Pack units, side by side in the row, that share a type (archetypes, as Swarm reads them). Each
  //   member gets +S/+S, S = the sum of the chain's Pack values (two Pack 2s: +4/+4 each; three: +6/+6). A gap or any other unit
  //   breaks the chain. Pack true counts as Pack 2.
  //   A Pack Leader (effects.packLeader) links every Pack unit on its side that shares one of its types into one chain for that type,
  //   adjacent or not, and joins it: it adds its own Pack value (at least 2) plus 2 more for sharing the type. A leader with two types
  //   leads two packs. A leader with no Pack unit of its type has no pack.
  //   A unit in two chains (different types, different members) gets both. Health moves as a difference, like Nocturnal.
  function packNOf(e){ const v = e && e.pack; return v === true ? 2 : Math.max(0, Number(v)||0); }
  function packChainsOf(pl){
    const out = new Map(); if(!pl || !pl.row) return out;
    const order = physicalRowOrder(pl);
    const live = c=> !!(c && !c.gap && c.hp > 0 && !c.cageOf);
    const typesOf = c=> ((CARD_DEFS[c.defId]||{}).archetypes) || [];
    const isLeader = c=> live(c) && !!effectsOf(c).packLeader;
    const isMember = c=> live(c) && !isLeader(c) && packNOf(effectsOf(c)) > 0;
    const chains = [], leaders = order.filter(isLeader), led = new Set();
    leaders.forEach(L=> typesOf(L).forEach(t=> led.add(t)));
    led.forEach(T=>{ const ms = order.filter(c=> isMember(c) && typesOf(c).includes(T)); if(!ms.length) return;
      const ls = leaders.filter(L=> typesOf(L).includes(T));
      chains.push({members: [...ls, ...ms], sum: ms.reduce((t, c)=> t + packNOf(effectsOf(c)), 0) + ls.reduce((t, L)=> t + Math.max(2, packNOf(effectsOf(L))) + 2, 0)}); });
    const free = new Set(); order.forEach(c=>{ if(isMember(c)) typesOf(c).forEach(t=>{ if(!led.has(t)) free.add(t); }); });
    free.forEach(T=>{ let run = [];
      const close = ()=>{ if(run.length >= 2) chains.push({members: run, sum: run.reduce((t, c)=> t + packNOf(effectsOf(c)), 0)}); run = []; };
      order.forEach(c=>{ if(isMember(c) && typesOf(c).includes(T)) run.push(c); else close(); }); close(); });
    const seen = new Set();
    chains.forEach(ch=>{ const key = ch.members.map(c=> c.uid).sort().join(','); if(seen.has(key)) return; seen.add(key);
      ch.members.forEach(c=>{ const o = out.get(c) || {n:0, bonus:0}; o.n = Math.max(o.n, ch.members.length); o.bonus += ch.sum; out.set(c, o); }); });
    return out;
  }
  // AI placement for a Pack card (2026-10-14, "Packs try to be adjacent to each other"): an open slot beside a live Pack unit (or
  // Pack Leader) of its side that shares a type with it, nearest the centre; null if there is none. Slotless rows: the flank
  // whose outer end is such a unit.
  function packPlacementFor(pl, defId){
    const d = CARD_DEFS[defId] || {}, e = d.effects || {}; if(!(packNOf(e) > 0 || e.packLeader) || !pl) return null;
    const mine = new Set(d.archetypes || []); if(!mine.size) return null;
    const kin = c=>{ const ce = effectsOf(c); return c && !c.gap && c.hp > 0 && !c.cageOf && (packNOf(ce) > 0 || ce.packLeader) && (((CARD_DEFS[c.defId]||{}).archetypes)||[]).some(t=> mine.has(t)); };
    if(slotMode){ const legal = legalSlots(pl); const near = new Set(); allBoardCards(pl).forEach(c=>{ if(kin(c)){ near.add(c.slot - 1); near.add(c.slot + 1); } });
      const ok = legal.filter(sl=> near.has(sl)).sort((a, b)=> Math.abs(a) - Math.abs(b) || a - b); return ok.length ? ok[0] : null; }
    const L = pl.row.left, R = pl.row.right;
    if(L.length && kin(L[L.length - 1])) return 'left'; if(R.length && kin(R[R.length - 1])) return 'right';
    if(!L.length && !R.length && pl.row.center.length && kin(pl.row.center[0])) return 'left';
    return null;
  }
  // The moon (2026-10-12): 8 phases, one step every time night falls. 0 = new, 4 = full. A Full Moon field is always full.
  let lunar = Math.floor(rnd()*8);
  function moonPhase(){ return (field && field.id === 'moon') ? 4 : lunar; }
  function moonFullness(){ const p = moonPhase(); return [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25][p]; }
  function anyMoonborn(players){ return [1,2].some(pid=> players[pid] && [...(players[pid].deck||[]), ...(players[pid].hand||[]).map(h=> h.defId), ...allBoardCards(players[pid]).map(c=> c.defId)].some(id=>{ const d = CARD_DEFS[id && (id.defId || id)]; return !!(d && d.effects && (d.effects.moonborn || d.effects.fullMoon || d.effects.fullMoonGrant)); })); } // + Full Moon (2026-10-15)
  // Tide (2026-10-09, the second archetype, decision D19 default; archetypes-design-2026-10-09.md §8): the water
  // flows and ebbs every round once the cycle runs. Round 2 is Flow, round 3 Ebb, and so on. On Flow, Tide units
  // hit +1 (Wash, which pushed the enemy facing it back, was retired 2026-10-14); on Ebb, Tide units take
  // 1 less damage per hit (never below 1). Round 1 (and modes with no cycle) has no tide.
  // 2026-10-12 (09:48, user: "On tide, the card gains 1 Attack. ON ebb, the card gains 1 Armour. On high tide (rare - only in the
  // boss fight and elite water fights) +2 Attack, +2 Armour. (Ebb -> Tide -> Ebb -> High Tide)"): rules.highTide turns on the
  // four-round cycle Ebb, Flow, Ebb, High; otherwise Flow and Ebb alternate as before.
  // 2026-10-13 (10:57 list: "Tide and Ebb cycle only begins once the first Tide card is played"): the tide waits for the first
  // Tide unit to arrive (either side); the round after, it runs Flow, Ebb, Flow… (Ebb, Flow, Ebb, High tide with High tide on).
  // 2026-10-15 (user: "Tide shouldn't occur even if you play a card with Tide."): playing a Tide (or Swimmer) unit no longer
  // starts the tide. Only the field and the explicit tide-bringers do: High Tide (rules.highTide, a field effect: its cycle runs
  // from round 1, so round 2 is Ebb, 3 Flow, 4 Ebb, 5 High), Perma-tide, the Tide-spout, Moonpull and Tsunami.
  let tideStart = rules.highTide ? 0 : null;
  // 2026-10-14 (user: "Tide effects: All swimmers and Tide units float. Remove Tide from those who are Swimmers. Swimmers = Tide"):
  // a Swimmer is a Tide unit. It gets Flow's +1 Attack and Ebb's +1 Armor, and the first one played starts the tide too.
  function isTideDef(def){ const e = def && def.effects; return !!(e && (e.tide || e.swimmer || e.supremeTide)); }
  function noteTideCard(def){ noteZeitgeber(def); } // 2026-10-15: a Tide card no longer starts the tide (see tideStart above)
  // Moonpull (2026-10-14, user: "There is a creature that has a cool sounding evergreen effect - its effect brings in the Tide!"):
  // when it arrives, the Tide comes in at once: Flow this very round (High tide's cycle: its Flow step). A tide already rising
  // stays as it is; an Ebb turns to Flow. The Tide-spout field brings the tide in the same way.
  function tideInNow(){ if(permaTide) return false; const t = getTide(); if(t === 'flow' || t === 'high') return false; tideStart = turnNo - (rules.highTide ? 2 : 1); return true; }
  // Zeitgebers (2026-10-13, user: "tide and diurnal/nocturnal units start a system just like day/night or carnival rides in Magic
  // the Gathering"; the word is Zeitgeber, a time-giver): in a fight that's day by default (no phase set by the map designer), the
  // first Diurnal, Nocturnal or Crepuscular unit played starts the day/night cycle from that round: Day first, PL rounds each.
  // The first Tide unit does the same for the tide (tideStart, above).
  // 2026-10-14 (user: "I think Night/Day, Darkness are all natural elements depending on the map. Not brought up by playing a
  // card"): retired. No unit starts the day/night cycle any more; the map (rules.phase) decides. zeitStart stays null, so a
  // saved fight and the board's pill keep working.
  let zeitStart = null;
  function noteZeitgeber(def){ /* Zeitgebers retired 2026-10-14: the map brings day and night, never a card */ }
  function getTide(){ if(permaTide) return 'flow'; if(tideStart === null || !(turnNo > tideStart)) return null; const d = turnNo - tideStart; if(rules.highTide){ const k = d % 4; return k === 0 ? 'high' : k === 2 ? 'flow' : 'ebb'; } return d % 2 === 1 ? 'flow' : 'ebb'; }
  function tideRising(){ const t = getTide(); return t === 'flow' || t === 'high'; }
  // Supreme Tide (2026-10-14, user: "Blue Dragon - Has Supreme Tide!"): a Tide unit whose Tide bonuses are doubled (Flow +2 Attack,
  // Ebb +2 Armor) and always on, both at once, every round: before the tide starts, on Flow, on Ebb, under Perma-tide. Nothing that
  // moves the tide can take them away.
  function supremeTideOf(card){ const e = card && (CARD_DEFS[card.defId]||{}).effects; return !!(e && e.supremeTide); }
  function tideAtk(card){ if(!isTide(card)) return 0; if(supremeTideOf(card)) return 2; if(hasTideGrant(effectsOf(card))) return 0; const t = getTide(); return t === 'high' ? 2 : t === 'flow' ? 1 : 0; } // Tide – {…}: its facets instead (2026-10-15)
  function tideArmor(card){ if(!isTide(card)) return 0; if(supremeTideOf(card)) return 2; if(hasTideGrant(effectsOf(card))) return 0; const t = getTide(); return t === 'high' ? 2 : t === 'ebb' ? 1 : 0; }
  function isTide(card){ return isTideDef(card && CARD_DEFS[card.defId]); } // Swimmers count (2026-10-14)
  // Wind (2026-10-13, 09:56 list: "On windy maps, every alternate turn, there is strong wind. On certain maps, there is always
  // strong wind. The wind flips direction between ally side -> opponent or opponent -> ally side ... tailwind on the allies side,
  // then headwind on the opponent's side. If tailwind - action twice, one at +1 speed, and one at normal speed. Then headwind -
  // skills activate twice. (Triggers too!)"): rules.wind 'windy' = strong wind every other round (rounds 2, 4, 6…), 'gale' =
  // every round. Each strong wind blows the other way from the last one. It acts on Flying units: the side it blows FROM has a
  // Tailwind (its Flyers get a quick extra turn before combat, then their normal one); the side it blows INTO has a Headwind
  // (its Flyers' skills and triggers go off twice).
  let windNow = false, windFrom = 0, windGusts = 0, windRound = -1;
  function rollWind(players, sideOf, events){
    const mode = rules.wind; windNow = false; windFrom = 0;
    if(mode !== 'windy' && mode !== 'gale') return;
    if(mode === 'windy' && turnNo % 2 === 1){ if(recordEvents && events && windRound !== turnNo){ windRound = turnNo; events.push({type:'wind', windy:false, round: turnNo}); } return; }
    windNow = true; windGusts += 1; windFrom = (windGusts % 2 === 1) ? 1 : 2; // the first gust is at the player's back
    if(windRound !== turnNo){ windRound = turnNo; if(recordEvents && events) events.push({type:'wind', windy:true, from: sideOf ? sideOf(windFrom) : (windFrom===1?'A':'B'), round: turnNo}); }
  }
  // The forecast (D80, 2026-10-13): what next round's start will bring, worked out with the same rules roundStart uses, so the
  // board can say it a round early. Random picks (which unit the frost or the eruption hits) stay hidden; only that they come.
  function forecast(){
    const r = turnNo + 1, out = {round:r};
    let ph = getPhase();
    if(dayNight && r > 1 && ((!phaseFixed && !phaseOff) || (zeitStart !== null && r > zeitStart))){
      const PL = Math.max(1, Number(rules.phaseLen)||3), rr = zeitStart !== null ? r - zeitStart : r - 1, first = (rr % (2*PL)) < PL;
      ph = phaseMode==='nightFirst' ? (first ? 'night' : 'day') : (first ? 'day' : 'night');
      if(twilightOn(curPlayers)){ const k = Math.floor(rr / PL) % 5; ph = k === 4 ? 'twilight' : ((k % 2 === 0) !== (phaseMode==='nightFirst')) ? 'day' : 'night'; }
    }
    out.phase = ph; out.phaseChanges = !!(ph && ph !== getPhase());
    if(permaTide) out.tide = 'flow'; // Perma-tide (2026-10-14)
    else if(tideStart !== null && r > tideStart){ const d = r - tideStart; out.tide = rules.highTide ? ({0:'high', 2:'flow'}[d % 4] || 'ebb') : (d % 2 === 1 ? 'flow' : 'ebb'); }
    const wm = rules.wind; if(wm === 'gale' || (wm === 'windy' && r % 2 === 0)) out.wind = {from: (windGusts + 1) % 2 === 1 ? 1 : 2};
    if(field){ out.field = field.id; out.fieldLeft = field.rounds; }
    const vc = r >= 2 ? volcanoChances(r) : null;
    if(rules.tideSpout && r >= 2) out.tideSpout = true; // a spout bursts somewhere next round (2026-10-14)
    if(cometRounds > 0) out.comets = cometRounds; // comets still to fall after an Eruption (2026-10-14)
    if(vc) out.volcano = vc; // the hazards' odds next round (2026-10-14); whether they come stays a roll
    else if(Number(rules.eruption) > 0 && r >= 2) out.eruption = Number(rules.eruption);
    return out;
  }
  function isWindy(){ return windNow; }
  function windSideOf(pid){ return !windNow ? null : (pid === windFrom ? 'tail' : 'head'); }
  function isFlyingCard(c){ const e = c && (CARD_DEFS[c.defId]||{}).effects; return !!(e && e.flying); }
  function headwindDouble(card, pid){ return windNow && isFlyingCard(card) && windSideOf(pid) === 'head'; }
  // Seeing (2026-10-13, 10:57 list: "Sun-shyness ... Blind during the day. Night-blindness - blind at night. Perma-blind in cave.
  // ... normal units are only blind in complete darkness"): night alone no longer dims anyone. A unit swings blind (misses 1 in
  // 2, like Blind) when: the fight is in complete darkness (rules.dark: caves, the abyss) and it has no Darksight, or it is
  // Sun-shy and it is day, or it is Night-blind and it is night. A Lantern on its side lights it up in the dark and at night.
  // Darkness (D67, 2026-10-13, user: "Don't call it Night Dimness. Just Darkness - in caves and night. Absolute darkness - Miss
  // 100%. Pitchblack - Miss 50%" and "maybe 1/4 is better"): the chance a unit's swing misses because it can't see.
  //   Darkness (rules.dark 'dark'/true; night no longer counts, 2026-10-15): 1 in 4, unless Darksight or a Lantern on its side.
  //   Pitch Black (rules.dark 'pitch'): 1 in 2, unless Darksight or a Lantern.
  //   Absolute darkness (rules.dark 'absolute'): every swing misses, unless Darksight (a Lantern brings it down to 1 in 2).
  //   Sun-shy by day and Night-blind at night: 1 in 2.
  function sightMiss(card, ownerId){
    if(!card) return 0;
    const e = (CARD_DEFS[card.defId]||{}).effects || {};
    const pl = curPlayers && curPlayers[ownerId];
    const lit = ()=> !!(pl && allBoardCards(pl).some(c=> c.hp > 0 && ((CARD_DEFS[c.defId]||{}).effects||{}).lantern));
    let miss = 0; const dk = rules.dark;
    const ph = phaseActive() ? getPhase() : null;
    if(dk && !e.darksight){ miss = dk === 'absolute' ? (lit() ? 0.5 : 1) : lit() ? 0 : dk === 'pitch' ? 0.5 : 0.25; }
    // 2026-10-15 (user: "Remove nightblindness causing 1/4 miss. It should only be for dark environments only. It will be an explicit
    // field effect called 'Darkness'. 'Pitch Black' is the level 2 variant."): night alone no longer makes anyone miss. Only the
    // field does: Darkness (rules.dark 'dark', level 1: 1 in 4), Pitch Black (rules.dark 'pitch', level 2: 1 in 2), Absolute darkness.
    // (A Night-blind unit still misses 1 in 2 at night: that is its own trait, below.)
    if(ph === 'day' && e.sunshy) miss = Math.max(miss, 0.5);
    if(ph === 'night' && e.nightblind && !lit()) miss = Math.max(miss, 0.5);
    return miss;
  }
  function sightBlind(card, ownerId){ return sightMiss(card, ownerId) > 0; }
  function nightDim(card, ownerId){ return sightBlind(card, ownerId); } // old name, kept for callers
  function allLive(pl){ return [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=> c && !c.gap && c.hp > 0); }
  // Runs once at the start of every round after the first: the day/night step, then the field.
  function castleRoundActions(players, pid, round, sideOf, stats, events){
    const pl = players[pid], foe = players[otherId(pid)], side = sideOf(pid);
    const foes = ()=> allLive(foe).filter(c=> !c.cageOf);
    if(pl.castleLumberEvery > 0 && (round - 1) % pl.castleLumberEvery === 0){ pl.lumber = (pl.lumber||0) + 1; if(recordEvents && events) events.push({type:'lumber', side, defId:null, amount:1, castle:true}); }
    if(pl.castleBolt > 0){ const f = foes(); if(f.length){ const t = f[Math.floor(rnd()*f.length)];
      if(recordEvents && events) events.push({type:'statusFx', kind:'castleBolt', side, targetSide:sideOf(otherId(pid)), targetDefId:t.defId, targetUid:t.uid, amount:pl.castleBolt});
      if(!helmetDeflects({kind:'card', card:t}, sideOf(otherId(pid)), events)) fireDamageAction(players, sideOf, pid, 'castle', pl.castleBolt, 'physical', {kind:'card', card:t}, stats, events, null, null); } }
    if(pl.herbRefinery){ const roll = Math.floor(rnd()*3);
      if(roll === 0){ const hurt = allLive(pl).filter(c=> c.hp < c.maxHp).sort((x,y)=> (x.hp/x.maxHp) - (y.hp/y.maxHp));
        if(hurt.length){ const h = applyHeal(hurt[0], 3, side, events); if(h > 0 && recordEvents && events) events.push({type:'statusFx', kind:'herbHeal', side, targetSide:side, targetDefId:hurt[0].defId, targetUid:hurt[0].uid, amount:h}); } }
      else if(roll === 1){ const f = foes(); if(f.length){ const t = f[Math.floor(rnd()*f.length)]; if(recordEvents && events) events.push({type:'statusFx', kind:'herbBane', side, targetSide:sideOf(otherId(pid)), targetDefId:t.defId, targetUid:t.uid, amount:2});
        fireDamageAction(players, sideOf, pid, 'castle', 2, 'poison', {kind:'card', card:t}, stats, events, null, null); } }
      else { pl.lumber = (pl.lumber||0) + 1; if(recordEvents && events) events.push({type:'lumber', side, defId:null, amount:1, castle:true}); } }
    const sp = pl.castleSpawn; if(sp && sp.defId && CARD_DEFS[sp.defId]){ const first = sp.first || 2, every = sp.every || 0;
      if(round === first || (every > 0 && round > first && (round - first) % every === 0)){
        for(let k = 0; k < (sp.count||1); k++){ if(!debugSpawnCard(players, sideOf, pid, sp.defId, rnd() < .5 ? 'left' : 'right', stats, events)) break; }
        if(recordEvents && events) events.push({type:'statusFx', kind:'castleSpawn', side, targetSide:side, targetDefId:sp.defId, amount:sp.count||1}); } }
  }
  function roundStart(players, round, sideOf, stats, events){
    curPlayers = players; turnNo += 1;
    rollWind(players, sideOf, events);
    if(RESERVE_ROWS) advanceReserves(players, sideOf, stats, events); // the rows behind step up first (2026-10-12)
    if(phaseMode === 'realtime' && rules.clock == null){ const was = phase; phase = realtimePhase(); if(phase !== was && recordEvents && events) events.push({type:'phase', phase, round, realtime:true}); }
    // Wildpath perks (2026-10-13): plain data on the player (pl.perks), so a saved fight resumes with them.
    if(round > 1) [1,2].forEach(pid=>{ const pl = players[pid], k = pl && pl.perks; if(!k || pl.hq.hp <= 0) return;
      const heal = n=>{ const h = Math.min(n, pl.hq.maxHp - pl.hq.hp); if(h > 0){ pl.hq.hp += h; if(recordEvents && events) events.push({type:'castleRegen', side:sideOf(pid), amount:h, perk:true}); } };
      if(k.sapMending && (round - 1) % 3 === 0) heal(1);
      if(k.heartwood && pl._hqHitTurn !== turnNo - 1) heal(1);
      if(k.everbloom && (round - 1) % 5 === 0){ pl.lumber = (pl.lumber||0) + 1; if(recordEvents && events) events.push({type:'lumber', side:sideOf(pid), defId:null, amount:1, perk:true}); draw(pl, 1, sideOf(pid), stats, events); } });
    if(round > 1) [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl || !(pl.castleRegen > 0) || pl.hq.hp <= 0) return; const h = Math.min(pl.castleRegen, pl.hq.maxHp - pl.hq.hp); if(h > 0){ pl.hq.hp += h; if(recordEvents && events) events.push({type:'castleRegen', side:sideOf(pid), amount:h}); } });
    if(round > 1) [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl || pl.hq.hp <= 0) return; castleRoundActions(players, pid, round, sideOf, stats, events); });
    if(round > 1){ const blasts = []; // Dynamite fuses burn down at the start of each round (see fireDynamite)
      [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return; allBoardCards(pl).forEach(c=>{ if(c.fuse > 0 && c.hp > 0){ c.fuse -= 1; if(recordEvents && events) events.push({type:'fuse', side:sideOf(pid), uid:c.uid, defId:c.defId, left:c.fuse}); if(c.fuse === 0) blasts.push([pid, c]); } }); });
      blasts.forEach(([pid, c])=>{ if(c.hp > 0) fireDynamite(players, sideOf, pid, c, stats, events); });
      if(blasts.length) removeDeadCards(players, sideOf, {}, stats, events); }
    restlessMoves(players, sideOf, stats, events); // Restless (2026-10-14)
    if(rules.lumberEvery > 0 && round > 1 && (round - 1) % rules.lumberEvery === 0){
      [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return; pl.lumber = (pl.lumber||0) + 1;
        if(recordEvents && events) events.push({type:'lumber', side:sideOf(pid), defId:null, amount:1, rule:true}); });
    }
    if(dayNight && round > 1 && ((!phaseFixed && !phaseOff) || (zeitStart !== null && round > zeitStart))){
      const before = phase, PL = Math.max(1, Number(rules.phaseLen)||3), rr = zeitStart !== null ? round - zeitStart : round - 1; const first = (rr % (2*PL)) < PL; /* phaseLen (2026-10-10): rounds per day/night, 3 by default */ phase = phaseMode==='nightFirst' ? (first ? 'night' : 'day') : (first ? 'day' : 'night');
      // Twilight (2026-10-13, 10:57 list: "Diurnal and Nocturnal are both active. Crepuscular are also active - but only in Twilight
      // ... D/N/D/N/T repeating"): on twilight maps, or when either deck carries a Crepuscular card, the cycle is Day, Night, Day,
      // Night, Twilight, each PL rounds long.
      if(twilightOn(curPlayers)){ const k = Math.floor(rr / PL) % 5; phase = k === 4 ? 'twilight' : ((k % 2 === 0) !== (phaseMode==='nightFirst')) ? 'day' : 'night'; }
      if(phase === 'night' && before !== 'night'){ lunar = (lunar + 1) % 8; if(recordEvents && events && anyMoonborn(players)) events.push({type:'moon', phase: lunar, round}); }
      if(phase !== before && recordEvents && events) events.push({type:'phase', phase, round});
      if(phase === 'day' && before === 'night'){
        if(recordEvents && events) events.push({type:'dawn', round});
        draw(players[1], 1, sideOf(1), stats, events); draw(players[2], 1, sideOf(2), stats, events);
      }
    }
    syncPhaseStats(players, sideOf, events);
    // The active Exile zone (2026-10-09, D19 next step; archetypes-design-2026-10-09.md, the Forgotten Ones):
    // every card that goes to a player's Exile gives them 1 Echo 🕯️. A card with Remember N waiting in Exile
    // comes back to the board at the start of a round once its owner has N Echoes (spent), +1/+1 per Echo spent.
    // One return per side a round.
    [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl || !pl.exile.length) return;
      for(let i=0; i<pl.exile.length; i++){
        const d = CARD_DEFS[pl.exile[i].defId], n = d && d.effects && Number(d.effects.remember);
        if(!(n > 0) || (pl.echoes||0) < n) continue;
        if(!debugSpawnCard(players, sideOf, pid, d.id, rnd() < .5 ? 'left' : 'right', stats, events)) break;
        pl.exile.splice(i, 1); pl.echoes -= n;
        // Forgotten Ones (2026-10-09): it comes back +1/+1 for every Echo spent.
        const back = allLive(pl).reduce((a, c)=> (!a || c.uid > a.uid) && c.defId===d.id ? c : a, null);
        if(back){ back.atk += n; back.baseAtk += n; back.hp += n; back.maxHp += n; }
        if(recordEvents && events) events.push({type:'remember', side:sideOf(pid), defId:d.id, spent:n, uid: back ? back.uid : null});
        break;
      }
    });
    if(rules.tideSpout && round > 1) tideSpoutTick(players, round, sideOf, stats, events); // Tide-spout (2026-10-14), before the tide's own step
    // 2026-10-14 (user: "Remove the 'Wash' effect"): Wash (on Flow, push the enemy facing it back 1 Wait) is gone. The tide only
    // moves Tide units now; the Tsunami and the Tide-spout are the pushes left.
    if(tideRising()){
      if(recordEvents && events) events.push({type:'tide', tide:getTide(), round});
    } else if(getTide() === 'ebb' && recordEvents && events) events.push({type:'tide', tide:'ebb', round});
    { const stV = statusSnap(players); volcanoTick(players, round, sideOf, stats, events); pushStatusEnds(stV, players, sideOf, events); } // 2026-10-15: petrification wearing off
    if(!field) return;
    const f = field.id;
    if(f === 'frozen'){
      // 2026-10-12 (user: the Tundra's frost grows fight by fight): rules.frostWait (Wait added, default 1), rules.frostCount
      // (units chilled per side, default 1), rules.frostResist (enemy types the frost can't touch), rules.frostbite (an enemy
      // unit that gets chilled gains +N/+N). Units that resist cold are never chilled; Frostbite N on a card does the same.
      // D66 (2026-10-13, user: "Chill increases wait in units ... number of targets increases. Wait is always (1). For those
      // vulnerable, they ... take wait + take a little ice damage"): the frost's level (frostWait / frostCount, 1–3) is how many
      // units a side get chilled; each gets +1 Wait. Units weak to cold also take 1 ice damage.
      const fc = Math.max(1, Number(rules.frostCount)||1, Number(rules.frostWait)||1), immune = new Set(rules.frostResist||[]);
      let iced = false;
      [1,2].forEach(pid=>{ let cards = allLive(players[pid]).filter(c=>{ const d = CARD_DEFS[c.defId] || {}; if(resistFactor(c.defId, 'cold') < 1) return false; if(pid === 2 && immune.size && (d.archetypes||[]).some(t=> immune.has(t))) return false; return true; });
        // Freeze counters (2026-10-14, user: "Freeze - instead of giving a +Wait, it gives a freeze counter. The clock DOES +1. But
        // it looks icy"): the chill is a freeze counter now, not +1 Wait; it holds the unit exactly as long (see endOfRoundUpkeep).
        for(let k = 0; k < fc && cards.length; k++){ const i = Math.floor(rnd()*cards.length), c = cards.splice(i, 1)[0]; c.frozen = (c.frozen||0) + 1;
          const weak = weaknessFactor(c.defId, 'cold') > 1; if(weak){ damageCardFlat(c, 1, 'cold'); iced = true; }
          if(recordEvents && events) events.push({type:'fieldTick', field:f, side:sideOf(pid), uid:c.uid, defId:c.defId, wait:1, freeze:1, dmg: weak ? 1 : 0});
          const fb = (Number(((CARD_DEFS[c.defId]||{}).effects||{}).frostbite)||0) + (pid === 2 ? (Number(rules.frostbite)||0) : 0);
          if(fb > 0){ c.atk += fb; c.baseAtk += fb; c.hp += fb; c.maxHp += fb; if(recordEvents && events) events.push({type:'statusFx', kind:'frostbite', side:sideOf(pid), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId, amount:fb}); } } });
      if(iced) removeDeadCards(players, sideOf, {}, stats, events);
    } else if(f === 'heatwave'){
      // D66 (2026-10-13, user: "Scorch does fire damage to non resistance ... The damage increases, number of targets increases
      // ... For those vulnerable, they take double fire damage"): level L (rules.heatLevel, 1–3): L+1 random units a side take
      // L fire damage. Heat-resistant and Dry units are spared; units weak to heat take double.
      const L = Math.max(1, Math.min(3, Number(rules.heatLevel)||1));
      [1,2].forEach(pid=>{ const cards = allLive(players[pid]).filter(c=> resistFactor(c.defId, 'heat') >= 1);
        for(let k = 0; k <= L && cards.length; k++){ const c = cards.splice(Math.floor(rnd()*cards.length), 1)[0]; const hp0 = c.hp;
          damageCardFlat(c, L, 'heat'); const dmg = Math.max(0, hp0 - c.hp); // weakness doubles inside damageCardFlat
          if(recordEvents && events) events.push({type:'fieldTick', field:f, side:sideOf(pid), uid:c.uid, defId:c.defId, dmg}); } });
      removeDeadCards(players, sideOf, {}, stats, events);
    } else if(f === 'rain'){
      [1,2].forEach(pid=> allLive(players[pid]).forEach(c=>{ const h = applyHeal(c, 2, sideOf(pid), events); if(h > 0){
        if(recordEvents && events) events.push({type:'fieldTick', field:f, side:sideOf(pid), uid:c.uid, defId:c.defId, heal:h}); } }));
    }
    if(field && field.rounds != null){ field.rounds -= 1; if(field.rounds <= 0){ if(recordEvents && events) events.push({type:'fieldEnd', field:f, back: baseField ? baseField.id : null}); field = baseField; baseField = null; } }
  }
  // The Volcano (2026-10-12, user: "a strong volcano effect on the field, maybe like deal 2/3/5 fire damage to a random unit
  // on both sides every turn"; the world boss: "Immolation 2, it deals 2 fire damage to all surrounding units allied and
  // enemy"; "when this monster is cast, it gains +2/+4. This is for the boss AND world boss"):
  //   rules.eruption N  from round 2, one random unit on each side takes N fire damage at the start of every round;
  //   Immolation N      (a card skill) at the start of every round it burns its neighbours on both sides and the enemy facing it;
  //   rules.enemyOre    {stone, metal, metalEvery} the enemy digs ore each round (so a Stone/Metal leader can be cast);
  //   rules.bossSurge   {atk, hp} an enemy leader gains +atk/+hp when it is cast.
  // Volcano hazards with odds (2026-10-14, user: "Volcano: Lava Tide, Petrification, Eruption - 1%, 2%, 3% (Hovering says 'Very
  // Low'), 10/12/14% (Low), 20/22/24% (Medium), 45/50/55 and increasing (1/2 chance), 60 and above, (High)"): rules.volcano is the
  // danger level; rules.lavaTideChance / petrifyChance / eruptionChance (0–100) set one hazard's odds outright. From round 2,
  // each hazard rolls on its own every round:
  //   Lava Tide      lava floods one random column on both sides: the units there that don't fly take 3 fire damage;
  //   Petrification  one random unit on each side turns to stone for the round: it can't attack and takes half damage;
  //   Eruption       one random unit on each side takes N fire damage (N = rules.eruption, or 2), as before.
  // 'even' climbs +2 a round after round 2 ("and increasing"). Without any of these, rules.eruption N is the old guaranteed
  // eruption every round, unchanged.
  const VOLCANO_LEVELS = {verylow:[1,2,3], low:[10,12,14], medium:[20,22,24], even:[45,50,55], high:[60,65,70]};
  let volcanoRiseFrom = 2, cometRounds = 0; // after an Eruption: the round the rise restarts from, and comet rounds still to fall
  function volcanoOn(){ return !!(VOLCANO_LEVELS[rules.volcano] || rules.lavaTideChance != null || rules.petrifyChance != null || rules.eruptionChance != null); }
  function volcanoChances(round){
    if(!volcanoOn()) return null;
    const t = VOLCANO_LEVELS[rules.volcano] || [0, 0, 0], up = rules.volcano === 'even' ? 2 * Math.max(0, (Number(round)||0) - volcanoRiseFrom) : 0;
    const pick = (ov, base)=> Math.max(0, Math.min(100, (ov != null && ov !== '') ? (Number(ov)||0) : (base ? base + up : 0)));
    return {lavaTide: pick(rules.lavaTideChance, t[0]), petrify: pick(rules.petrifyChance, t[1]), eruption: pick(rules.eruptionChance, t[2])};
  }
  // Tide-spout (2026-10-14, user: "Okay anyway, new effect on the beach map - Tide-spout!"): rules.tideSpout. From round 2, every
  // round a spout bursts in one random column. If the tide hasn't come in yet, it comes in now (Flow). The units in that column,
  // on both sides, are Washed back (+1 Wait), and the ones that can't swim (not Tide or Swimmer) also take 1 water damage.
  function tideSpoutTick(players, round, sideOf, stats, events){
    const cols = {1: combatColumnsOf(players[1]), 2: combatColumnsOf(players[2])};
    const keys = [...new Set([...Object.keys(cols[1]), ...Object.keys(cols[2])].map(Number))].sort((x, y)=> x - y);
    if(!keys.length) return;
    const col = keys[Math.floor(rnd()*keys.length)];
    const tideIn = tideStart === null && !permaTide; if(tideIn) tideInNow(); // under Perma-tide the tide is already in (2026-10-14)
    if(recordEvents && events) events.push({type:'fieldTick', field:'tideSpout', col, round, tideIn});
    let hurt = false;
    [1,2].forEach(pid=>{ const en = cols[pid][col], c = en && en.kind === 'card' ? en.card : null;
      if(!c || c.gap || !(c.hp > 0) || c.cageOf) return;
      c.wait = (c.wait||0) + 1; let dmg = 0;
      if(!isTide(c)){ const hp0 = c.hp; damageCardFlat(c, 1, 'water'); dmg = Math.max(0, hp0 - c.hp); hurt = true; }
      if(recordEvents && events) events.push({type:'wash', spout:true, side:sideOf(pid), targetSide:sideOf(pid), targetUid:c.uid, targetDefId:c.defId, dmg, col}); });
    if(hurt) removeDeadCards(players, sideOf, {}, stats, events);
  }
  function volcanoTick(players, round, sideOf, stats, events){
    const o = rules.enemyOre; const P2 = players[2];
    if(o && P2){ if(o.stone) addOre(P2, 'stone', o.stone); if(o.metal && round % Math.max(1, o.metalEvery||2) === 0) addOre(P2, 'metal', o.metal); }
    const heatProof = c=>{ const d = CARD_DEFS[c.defId] || {}; return (d.resist||[]).includes('heat') || (d.resist||[]).includes('fire'); };
    let burnt = false;
    [1,2].forEach(pid=>{ const pl = players[pid]; if(pl) allBoardCards(pl).forEach(c=>{ if(c && c.petrified) c.petrified = false; }); }); // last round's stone wears off
    // ground (2026-10-14, user: "The damage effect of the volcanic ground - firstly has to be renamed, secondly, have to show damage
    // numbers!"): the old guaranteed eruption every round is Scorched Ground now (field 'scorched'); the volcano's Eruption hazard
    // keeps its name. dmg is what the unit really lost.
    const erupt = (n, ground)=> [1,2].forEach(pid=>{ const cs = allLive(players[pid]).filter(c=> !heatProof(c)); if(!cs.length) return;
      const c = cs[Math.floor(rnd()*cs.length)]; const hp0 = c.hp; damageCardFlat(c, n, 'heat'); burnt = true;
      if(recordEvents && events) events.push({type:'fieldTick', field: ground ? 'scorched' : 'eruption', side:sideOf(pid), uid:c.uid, defId:c.defId, dmg:Math.max(0, hp0 - c.hp)}); });
    // Comets (2026-10-14, user: "After eruption, the cycle resets, but for the next 3 turns, comets rain down, dealing 2-5 (random)
    // fire damage to each unit. The damage dealt to each unit is random."): for 3 rounds after an Eruption, at the start of the round
    // every unit on both sides is struck for its own 2–5 fire damage (the fight's seeded roll; fire-resistant units take half).
    if(cometRounds > 0 && round > 1){
      cometRounds -= 1;
      if(recordEvents && events) events.push({type:'fieldTick', field:'cometRain', round, left: cometRounds});
      [1,2].forEach(pid=> allLive(players[pid]).filter(c=> !c.cageOf).forEach(c=>{ const n = 2 + Math.floor(rnd()*4), hp0 = c.hp; damageCardFlat(c, n, 'heat'); burnt = true;
        if(recordEvents && events) events.push({type:'fieldTick', field:'comet', side:sideOf(pid), uid:c.uid, defId:c.defId, roll:n, dmg:Math.max(0, hp0 - c.hp)}); }));
    }
    const vc = round > 1 ? volcanoChances(round) : null;
    if(vc){
      const roll = p=> p >= 100 || (p > 0 && rnd()*100 < p);
      const lava = roll(vc.lavaTide), stone = roll(vc.petrify), boom = roll(vc.eruption);
      if(lava){ const cols = {1: combatColumnsOf(players[1]), 2: combatColumnsOf(players[2])};
        const keys = [...new Set([...Object.keys(cols[1]), ...Object.keys(cols[2])].map(Number))].sort((x, y)=> x - y);
        if(keys.length){ const col = keys[Math.floor(rnd()*keys.length)];
          [1,2].forEach(pid=>{ const en = cols[pid][col], c = en && en.kind === 'card' ? en.card : null;
            if(!c || c.gap || !(c.hp > 0) || c.cageOf || isFlyingCard(c)) return;
            const hp0 = c.hp; damageCardFlat(c, 3, 'heat'); burnt = true;
            if(recordEvents && events) events.push({type:'fieldTick', field:'lavaTide', side:sideOf(pid), uid:c.uid, defId:c.defId, dmg:Math.max(0, hp0 - c.hp), col}); }); } }
      if(stone) [1,2].forEach(pid=>{ const cs = allLive(players[pid]).filter(c=> !c.cageOf); if(!cs.length) return;
        const c = cs[Math.floor(rnd()*cs.length)]; c.petrified = true;
        if(recordEvents && events) events.push({type:'fieldTick', field:'petrify', side:sideOf(pid), uid:c.uid, defId:c.defId}); });
      if(boom){ erupt(Number(rules.eruption) > 0 ? Number(rules.eruption) : 2);
        volcanoRiseFrom = round + 1; cometRounds = 3; // the cycle resets (a rising level climbs again from its base), and comets follow
        if(recordEvents && events) events.push({type:'fieldTick', field:'eruptionReset', round, comets:3}); }
    } else {
      const n = Number(rules.eruption)||0;
      if(n > 0 && round > 1 && !volcanoOn()) erupt(n, true);
    }
    [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return;
      allLive(pl).forEach(src=>{ const k = Number(((CARD_DEFS[src.defId]||{}).effects||{}).immolation)||0; if(!(k > 0) || !(src.hp > 0)) return;
        const order = physicalRowOrder(pl), i = order.indexOf(src), hits = [];
        [order[i-1], order[i+1]].forEach(c=>{ if(c && c.hp > 0) hits.push([pid, c]); });
        const opp = opposingCardOf(players, pid, src); if(opp && opp.card && opp.card.hp > 0) hits.push([otherId(pid), opp.card]);
        hits.forEach(([tp, c])=>{ if(heatProof(c)) return; damageCardFlat(c, k, 'heat'); burnt = true;
          if(recordEvents && events) events.push({type:'fieldTick', field:'immolation', side:sideOf(tp), uid:c.uid, defId:c.defId, dmg:k, srcUid:src.uid, srcDefId:src.defId}); }); }); });
    // Irradiated N (reworked 2026-10-14, user: "Irradiation tokens - Irradiated ..."; see irradiationTick): every upkeep it gives
    // N Irradiation tokens to the enemy facing it and to the units beside it (yours too), and 1 to itself. A 'radiation' Resist
    // halves the tokens a unit gets; Immunity stops them.
    [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return;
      allLive(pl).forEach(src=>{ const k = Number(effectsOf(src).irradiated)||0; if(!(k > 0) || !(src.hp > 0)) return;
        const order = physicalRowOrder(pl), i = order.indexOf(src), hits = [];
        [order[i-1], order[i+1]].forEach(c=>{ if(c && !c.gap && c.hp > 0) hits.push([pid, c, k]); });
        const opp = opposingCardOf(players, pid, src); if(opp && opp.card && !opp.card.gap && opp.card.hp > 0) hits.push([otherId(pid), opp.card, k]);
        hits.push([pid, src, 1]);
        hits.forEach(([tp, c, n])=>{ const got = irradiate(c, n); if(!got) return;
          if(recordEvents && events) events.push({type:'fieldTick', field:'irradiated', side:sideOf(tp), uid:c.uid, defId:c.defId, tokens:got, total:c.irradiation, srcUid:src.uid, srcDefId:src.defId, self: c === src}); }); }); });
    if(irradiationTick(players, sideOf, events)) burnt = true;
    if(burnt) removeDeadCards(players, sideOf, {}, stats, events);
  }
  function fogMiss(attCard){
    if(!field || field.id!=='fog' || !attCard) return false;
    const d = CARD_DEFS[attCard.defId]; if(d && d.effects && d.effects.flying) return false;
    return rnd() < 1/3;
  }
  // Swarm (2026-10-09, the first archetype from archetypes-design-2026-10-09.md, decision D19): Swarm N gives
  // +1 damage for every N OTHER Swarm allies on the same board. curPlayers is the live board, set at the
  // start of each combat pass and on every play, so the count is current when a hit is computed.
  let curPlayers = null;
  // Curses (2026-10-10, Devilry's Desecrate N: "The land is now cursed, where the target stands. It deals N damage every
  // turn to any unit standing on that field. It stacks linearly."). Keyed by the owner's cell: in slot battles the slot
  // number, otherwise the lane and position. Cleanse N removes curse points from the cell its unit stands on.
  const curses = {};
  function cellKeyOf(players, pid, c){
    const pl = players && players[pid]; if(!pl || !c) return null;
    if(slotMode && c.slot != null) return pid + ':s' + c.slot;
    for(const lane of ['left','center','right']){ const i = pl.row[lane].indexOf(c); if(i >= 0) return pid + ':' + lane + i; }
    return null;
  }
  function curseCell(players, pid, c, n, events){
    const k = cellKeyOf(players, pid, c); if(!k || !(n > 0)) return;
    curses[k] = (curses[k]||0) + n;
    if(recordEvents && events) events.push({type:'curse', cell:k, total:curses[k], targetUid:c.uid, targetDefId:c.defId, slot:c.slot, pid});
  }
  function getCurses(){ return Object.assign({}, curses); }
  // ---- Devilry (2026-10-10, the user's Devilry list) ----
  // Dark Summon: cards with def.darkSummon use a separate allowance, 1 a turn by default (pl.darkBonus adds more),
  // instead of the turn's normal play. The allowance resets at each combat.
  // Ritual {perished, drawn, castleDamage}: no Wait, but it can't act until, counted from when it entered, that many
  // units have perished (either side), its owner has drawn that many cards and dealt that much castle damage.
  let perishedTotal = 0;
  function darkPerTurn(pl){ return 1 + (pl.darkBonus||0); }
  function ritualProgress(pl, card){
    const def = CARD_DEFS[card.defId], r = def && def.effects && def.effects.ritual; if(!r || !card.ritualBase) return null;
    const b = card.ritualBase;
    return {perished:[Math.max(0, perishedTotal - b.p), r.perished||0], drawn:[Math.max(0, (pl.drawnTotal||0) - b.d), r.drawn||0], castleDamage:[Math.max(0, (pl.castleDealt||0) - b.c), r.castleDamage||0]};
  }
  function ritualMet(pl, card){
    if(card.ritualDone) return true; const pr = ritualProgress(pl, card); if(!pr) return true;
    const met = Object.values(pr).every(([have, need])=> have >= need); if(met) card.ritualDone = true; return met;
  }
  // Devour, Sacrifice and Beware need per-unit skills sometimes (Devour can grant one), so a devoured unit moves to a
  // derived definition: a copy of its card with the granted skills merged in. derivedDefs is exported so the app can
  // render it.
  const derivedDefs = {}; let derivedSeq = 0;
  // The defences Bludgeon can break, in one list so a new one (a future Burrow, Shell…) is one line here. Tide is left alone:
  // it belongs to the map, not the unit.
  const BLUDGEON_BREAKS = [
    {key:'armor', has:(c, e)=> Math.max(0, (Number(e.armor)||0) - (c.armorLoss||0)) > 0, br:(c, e)=>{ c.armorLoss = Number(e.armor)||0; }},
    {key:'flying', has:(c, e)=> !!e.flying, br:c=> deriveDef(c, {flying:false})},
    {key:'swimmer', has:(c, e)=> !!e.swimmer, br:c=> deriveDef(c, {swimmer:false})},
    {key:'burrow', has:(c, e)=> !!e.burrow, br:c=> deriveDef(c, {burrow:false})},
  ];
  function bludgeonHit(att, c, side, targetSide, events){
    const e = (CARD_DEFS[c.defId] || {}).effects || {};
    const can = BLUDGEON_BREAKS.filter(b=> b.has(c, e)); if(!can.length) return;
    const b = can[Math.floor(rnd()*can.length)]; b.br(c, e);
    if(recordEvents && events) events.push({type:'statusFx', kind:'bludgeon', broke:b.key, side, attDefId:att.defId, attUid:att.uid, targetSide, targetDefId:c.defId, targetUid:c.uid});
  }
  // Wave (2026-10-14, user: "Sea creatures might have more skills related to water. Such as pushing creatures left or right -
  // waves."): effects.wave 'left' | 'right' | 'alternate' | true. When its attack lands on a unit (and the unit lives), the unit is
  // pushed one column that way: 'alternate' goes left on its first swing, then right, and so on; true goes toward the side with
  // more room (a seeded coin flip on a tie). If a unit stands in that column, the two swap. Open boards: the board's edge is the
  // outermost column any unit on either side stands in, and a push never goes past it; a pinned unit or a cage can't be moved and
  // blocks the push. Slotless rows are always packed, so there the unit swaps with its neighbour, if it has one that way.
  function relayoutRow(pl){
    const all = allBoardCards(pl);
    pl.row.center = all.filter(c=> c.slot === 0);
    pl.row.left = all.filter(c=> c.slot < 0).sort((a, b)=> Math.abs(a.slot) - Math.abs(b.slot));
    pl.row.right = all.filter(c=> c.slot > 0).sort((a, b)=> a.slot - b.slot);
  }
  function waveHit(players, sideOf, attPid, att, t, events, stats){
    const tpid = otherId(attPid), pl = players[tpid], v = effectsOf(att).wave;
    if(!pl || !t || !(t.hp > 0) || t.pinned || t.cageOf || !v) return null;
    let dir = v === 'left' ? -1 : v === 'right' ? 1 : 0;
    if(v === 'alternate'){ att.waveFlip = !att.waveFlip; dir = att.waveFlip ? -1 : 1; }
    const ev = {type:'wave', side:sideOf(attPid), attUid:att.uid, attDefId:att.defId, targetSide:sideOf(tpid), targetUid:t.uid, targetDefId:t.defId, moves:[], blocked:false, slotMode};
    let other = null;
    if(slotMode){
      syncSlots(players[1]); syncSlots(players[2]);
      const edge = Math.max(1, ...[1,2].flatMap(pid=> players[pid] ? allBoardCards(players[pid]).filter(c=> c.hp > 0 && !c.gap).map(c=> Math.abs(c.slot)) : []));
      const s0 = t.slot;
      if(!dir){ const roomL = s0 + edge, roomR = edge - s0; dir = roomL > roomR ? -1 : roomR > roomL ? 1 : (rnd() < .5 ? -1 : 1); }
      const d = s0 + dir; ev.dir = dir < 0 ? 'left' : 'right';
      other = allBoardCards(pl).find(c=> c !== t && c.slot === d) || null;
      if(Math.abs(d) > edge || (other && other.hp > 0 && (other.pinned || other.cageOf))){ ev.blocked = true; other = null; }
      else { t.slot = d; ev.moves.push({uid:t.uid, from:s0, to:d}); if(other){ other.slot = s0; ev.moves.push({uid:other.uid, from:d, to:s0}); ev.swapUid = other.uid; } relayoutRow(pl); }
    } else {
      const order = physicalRowOrder(pl), i = order.indexOf(t);
      if(!dir){ const roomL = i, roomR = order.length - 1 - i; dir = roomL > roomR ? -1 : roomR > roomL ? 1 : (rnd() < .5 ? -1 : 1); }
      const j = i + dir; ev.dir = dir < 0 ? 'left' : 'right'; other = order[j] || null;
      if(i < 0 || !other || other.pinned || other.cageOf){ ev.blocked = true; other = null; }
      else { const L = pl.row.left.length, C = pl.row.center.length; order[i] = other; order[j] = t;
        pl.row.left = order.slice(0, L).reverse(); pl.row.center = order.slice(L, L + C); pl.row.right = order.slice(L + C);
        ev.swapUid = other.uid; ev.aUid = t.uid; ev.bUid = other.uid; }
    }
    if(recordEvents && events) events.push(ev);
    if(!ev.blocked){ // a pushed unit has moved: its On Move triggers fire (as Scurry's do)
      runCustomTriggers(players, sideOf, tpid, t, CARD_DEFS[t.defId], 'onMove', stats || {}, events, {movedCard: other || t});
      if(other && other.hp > 0) runCustomTriggers(players, sideOf, tpid, other, CARD_DEFS[other.defId], 'onMove', stats || {}, events, {movedCard: t}); }
    return ev;
  }
  function deriveDef(card, grant){
    const base = CARD_DEFS[card.defId]; const id = (base.derivedFrom || base.id) + '~dv' + (++derivedSeq);
    CARD_DEFS[id] = derivedDefs[id] = Object.assign({}, base, {id, derivedFrom: base.derivedFrom || base.id, effects: Object.assign({}, base.effects||{}, grant)});
    card.defId = id; return id;
  }
  // Actions per turn (2026-10-11, user: "New game modifier - number of actions per turn"): rules.actions plays a turn
  // (1 by default). Each play counts; the turn's play is used up once the count reaches it. The count resets itself on a
  // new round, so every place that clears playedThisTurn keeps working.
  const ACTIONS = Math.max(1, Math.round(Number(rules.actions)||1));
  function markPlayed(pl){
    if(pl.playsTurn !== turnNo){ pl.playsTurn = turnNo; pl.playsThisTurn = 0; }
    pl.playsThisTurn += 1;
    pl.playedThisTurn = pl.playsThisTurn >= ACTIONS;
  }
  // What the side that plays second gets for it: N actions a turn → N extra cards, N-1 castle Health, N-2 Lumber.
  function secondPlayerBonus(n){ n = Math.max(1, Math.round(Number(n)||1)); return {cards:n, life:n-1, lumber:Math.max(0, n-2)}; }
  function applySecondPlayerBonus(pl, side, stats, events){
    const b = secondPlayerBonus(ACTIONS);
    draw(pl, b.cards, side, stats, events);
    if(b.life > 0){ pl.hq.maxHp += b.life; pl.hq.hp += b.life; }
    if(b.lumber > 0) pl.lumber = (pl.lumber||0) + b.lumber;
    return b;
  }
  function devour(players, sideOf, pid, targetUid, handUid, stats, events){
    const pl = players[pid]; if(!pl || pl.playedThisTurn || (pl.skipTurns||0) > 0) return false;
    const tgt = allLive(pl).find(c=> c.uid===targetUid); const dv = tgt && CARD_DEFS[tgt.defId].effects && CARD_DEFS[tgt.defId].effects.devour;
    if(!dv || tgt.devoured) return false;
    const idx = pl.hand.findIndex(h=> h.uid===handUid); if(idx < 0) return false;
    const [h] = pl.hand.splice(idx, 1); pl.graveyard.push({defId:h.defId}); markPlayed(pl);
    fireOnSacrifice(players, sideOf, pid, null, h.defId, stats, events, 'devour'); // Sacrifice - {} (2026-10-14)
    const a = dv.attack||0, hp = dv.health||0;
    tgt.atk += a; tgt.baseAtk += a; tgt.hp += hp; tgt.maxHp += hp; tgt.devoured = true;
    if(dv.grant && typeof dv.grant==='object') deriveDef(tgt, dv.grant);
    ensureStat(stats, sideOf(pid), h.defId).played++;
    if(recordEvents && events) events.push({type:'devour', side:sideOf(pid), uid:tgt.uid, defId:tgt.defId, eatenDefId:h.defId, attack:a, health:hp, grant: dv.grant || null});
    return true;
  }
  // Equipment (2026-10-11, user: "a blacksmith portion for crafting weapons ... These weapons are just cards ... equipment
  // can't block attacks"). An equipment card never takes a slot on the board: you drag it from your hand onto one of your
  // units, pay its Lumber, and that unit gains its Attack/Health and any skills it grants (equip.grant). One piece per
  // unit. Equipping uses your play for the turn. When the unit dies, the equipment goes to the graveyard with it.
  function canEquip(pl, handUid, targetUid){
    if(!pl || pl.playedThisTurn || (pl.skipTurns||0) > 0) return false;
    const h = pl.hand.find(x=> x.uid===handUid); const eq = h && CARD_DEFS[h.defId]; if(!eq || eq.cardType !== 'equipment') return false;
    const tgt = allLive(pl).find(c=> c.uid===targetUid); if(!tgt || tgt.equipment || tgt.defId==='__cage') return false;
    return costOfCard(h.defId) <= pl.lumber;
  }
  function equip(players, sideOf, pid, targetUid, handUid, stats, events){
    const pl = players[pid]; if(!canEquip(pl, handUid, targetUid)) return false;
    const idx = pl.hand.findIndex(h=> h.uid===handUid); const [h] = pl.hand.splice(idx, 1); const eq = CARD_DEFS[h.defId];
    const tgt = allLive(pl).find(c=> c.uid===targetUid);
    pl.lumber -= costOfCard(h.defId); markPlayed(pl);
    const a = eq.attack||0, hp = eq.health||0;
    tgt.atk += a; tgt.baseAtk += a; tgt.hp += hp; tgt.maxHp += hp; tgt.equipment = h.defId;
    const grant = eq.equip && eq.equip.grant;
    if(grant && typeof grant==='object' && Object.keys(grant).length) deriveDef(tgt, grant);
    ensureStat(stats, sideOf(pid), h.defId).played++;
    if(recordEvents && events) events.push({type:'equip', side:sideOf(pid), uid:tgt.uid, defId:tgt.defId, equipDefId:h.defId, attack:a, health:hp, grant: grant || null});
    return true;
  }
  // Sacrifice N sits on the fodder: play a Dark Summon card onto that unit and the unit dies; the new card costs N less
  // (Darkness first, then Lumber) and takes its place.
  function sacrificeSummon(players, sideOf, pid, handUid, fodderUid, stats, events){
    const pl = players[pid]; const h = pl.hand.find(x=> x.uid===handUid); const def = h && CARD_DEFS[h.defId];
    if(!def || !def.darkSummon) return false;
    const fod = allLive(pl).find(c=> c.uid===fodderUid); const n = fod && Number((CARD_DEFS[fod.defId].effects||{}).sacrifice);
    if(!(n > 0) || !canPlay(pl, h.defId, handUid, n)) return false;
    const slot = fod.slot, lane = ['left','center','right'].find(l=> pl.row[l].includes(fod));
    fod.hp = 0; fod.sacrificed = true;
    if(recordEvents && events) events.push({type:'sacrifice', side:sideOf(pid), uid:fod.uid, defId:fod.defId, forDefId:h.defId, discount:n});
    fireOnSacrifice(players, sideOf, pid, fod, fod.defId, stats, events, 'sacrifice'); // Sacrifice - {} (2026-10-14)
    removeDeadCards(players, sideOf, {}, stats, events);
    return placeCard(players, sideOf, pid, handUid, slotMode && slot != null ? slot : (lane==='center' ? 'left' : lane), stats, events, {discount:n});
  }
  // Sacrifice - {} (2026-10-14, user: "Sacrifice - haven't designed a card around this. The designer's toolkit: Sacrifice - {}
  // aka On Sacrifice -> Do {}. But it's framed as Sacrifice - { }."): a custom trigger, on:'onSacrifice', that fires when this
  // card is consumed: as the fodder of a Sacrifice (Dark Summon), as the card a Devour unit eats, or as a prayer offering.
  // A unit on the board fires it as itself (just before it perishes); a card given up from the hand has no unit, so it fires
  // from a stand-in that never touches the board (actions that hit enemies or pay resources work; "itself" is nobody).
  function fireOnSacrifice(players, sideOf, pid, card, defId, stats, events, how){
    const def = CARD_DEFS[defId]; if(!def || !def.effects || !Array.isArray(def.effects.triggers) || !def.effects.triggers.some(t=> t.on==='onSacrifice')) return false;
    const src = card || Object.assign(makeBoardCard(defId), {phantom:true});
    if(recordEvents && events) events.push({type:'statusFx', kind:'sacrificed', how, side:sideOf(pid), attUid:src.uid, attDefId:defId, targetUid:src.uid, targetDefId:defId, fromHand:!card});
    runCustomTriggers(players, sideOf, pid, src, def, 'onSacrifice', stats || {}, events);
    return true;
  }
  // ---- Caged Fight (2026-10-10, user: "Leader is trapped 4 squares to the right, on the opponent's board ... Depending on
  // deck level of A + B/100 (rounded) = cage level (max 10, min 0) ... 6 HP at lvl 1 (5 hp at lvl 0), growing by 2 per
  // level. Lvl 10 would be 25 hp. PVP is both ways."). The cage is a unit on the HOST player's board that never acts and
  // blocks its column. When it breaks, the caged leader is freed onto its owner's board for free, as close to the cage's
  // column as possible.
  function cageHpForLevel(lv){ const L = Math.max(0, Math.min(10, Math.round(lv||0))); return L===0 ? 5 : L===10 ? 25 : 4 + 2*L; }
  function placeCage(players, sideOf, hostPid, ownerPid, slot, leaderDefId, hp, events){
    if(!slotMode || !CARD_DEFS[leaderDefId]) return null;
    if(!CARD_DEFS.__cage) CARD_DEFS.__cage = derivedDefs.__cage = {id:'__cage', name:'Cage', icon:'⛓️', attack:0, health:hp, wait:0, cost:0, token:true, effects:{}};
    const host = players[hostPid]; const c = makeBoardCard('__cage');
    c.hp = c.maxHp = hp; c.atk = c.baseAtk = 0; c.wait = 0; c.cageOf = leaderDefId; c.cageOwner = ownerPid;
    putInSlot(host, c, slot);
    if(recordEvents && events) events.push({type:'cage', side:sideOf(hostPid), uid:c.uid, owner:sideOf(ownerPid), leaderDefId, hp, slot});
    return c;
  }
  // Beware N: a card in your Removal Zone can be cast from there (normal costs) while you have N or more Darkness.
  function canCastFromExile(pl, defId){ const d = CARD_DEFS[defId]; const b = d && d.effects && Number(d.effects.beware); return b > 0 && (pl.devilry||0) >= b && canPlay(pl, defId, null); }
  function castFromExile(players, sideOf, pid, exileIndex, side, stats, events){
    const pl = players[pid]; const e = pl.exile[exileIndex]; if(!e || !canCastFromExile(pl, e.defId)) return false;
    const h = {uid:uidCounter++, defId:e.defId}; pl.exile.splice(exileIndex, 1); pl.hand.push(h);
    if(recordEvents && events) events.push({type:'beware', side:sideOf(pid), defId:e.defId, darkness:pl.devilry});
    if(placeCard(players, sideOf, pid, h.uid, side, stats, events)) return true;
    pl.hand.splice(pl.hand.indexOf(h), 1); pl.exile.splice(exileIndex, 0, e); return false; // couldn't place: put it back
  }
  // Swarm (reworked 2026-10-10, user: "Deal +1 damage extra per ally unit that shares a type with this unit"): +1 for
  // every other living ally that shares at least one type (archetype) with it. Any ally counts, Swarm or not.
  function swarmBonus(card){
    const def = card && CARD_DEFS[card.defId];
    if(!(def && def.effects && def.effects.swarm) || !curPlayers) return 0;
    // Changeling (2026-10-11): a mimic shares a type with everyone, both ways.
    // Swarm by type (2026-10-11, user: "Swarm ability lets me select a parameter ... None, or a specific Type or Type(s)"):
    // swarm:true counts allies sharing any type with this card; swarm:['Ants', ...] counts allies of those types only.
    const picked = Array.isArray(def.effects.swarm) && def.effects.swarm.length ? new Set(def.effects.swarm) : null;
    // Swarm N (2026-10-12, user: "Swarm N: Default 1 if not stated on the card"): +N per ally; a number on its own means
    // "any shared type, N each"; with a type list, swarmN sets N.
    const per = typeof def.effects.swarm === 'number' ? Math.max(0, def.effects.swarm) : Math.max(1, Number(def.effects.swarmN) || 1);
    const mine = picked || new Set(def.archetypes || []), mimic = !!def.effects.changeling; if(!mine.size && !mimic && !(curPlayers && [1,2].some(pid=> curPlayers[pid] && allBoardCards(curPlayers[pid]).some(c=> c!==card && c.hp>0 && ((CARD_DEFS[c.defId]||{}).effects||{}).growth)))) return 0;
    // Growth (2026-10-14, user: "Growth unit tokens - 1/3. Very strong - empowered by Swarm"): a Growth token counts for every Swarm.
    const shares = c=>{ const d = CARD_DEFS[c.defId] || {}; return (!picked && mimic) || !!(d.effects && (d.effects.changeling || d.effects.growth)) || (d.archetypes||[]).some(a=> mine.has(a)); };
    for(const pid of [1,2]){ const pl = curPlayers[pid]; if(!pl) continue; const all = [...pl.row.left, ...pl.row.center, ...pl.row.right];
      if(all.includes(card)) return all.filter(c=> c!==card && c.hp>0 && !c.cageOf && shares(c)).length * per; }
    return 0;
  }
  // Defiance (2026-10-12, user: "Antagonist Skill ... Defiance Skill. Parameter: Type(s). Opposite of Swarm. Has additional
  // Attack for every opposing card that contains that card type"): +N Attack (defianceN, default 1) for every living enemy
  // unit carrying one of the listed types.
  function defianceBonus(card){
    const def = card && CARD_DEFS[card.defId]; const dv = def && def.effects && def.effects.defiance;
    if(!dv || !curPlayers) return 0;
    const types = new Set(Array.isArray(dv) ? dv : String(dv).split(',').map(x=> x.trim()).filter(Boolean)); if(!types.size) return 0;
    const per = Math.max(1, Number(def.effects.defianceN) || 1);
    for(const pid of [1,2]){ const pl = curPlayers[pid]; if(!pl) continue;
      if(allBoardCards(pl).includes(card)){ const foe = curPlayers[otherId(pid)]; if(!foe) return 0;
        return allBoardCards(foe).filter(c=> c.hp>0 && !c.cageOf && ((CARD_DEFS[c.defId]||{}).archetypes||[]).some(t=> types.has(t))).length * per; } }
    return 0;
  }
  function isRaging(card){
    const def = CARD_DEFS[card.defId];
    return !!(def.effects && def.effects.rage) && card.maxHp>0 && (card.hp / card.maxHp) < 0.5;
  }
  // ---- 2026-10-12 skills (the 22:40 list) ----------------------------------------------------------------------
  // Lumberjack: whenever you gain Lumber, +1 more per Lumberjack on your board. Heavy Metal: the same for Stone and Metal.
  function countEff(pl, key){ return pl ? allBoardCards(pl).filter(c=> c && c.hp>0 && !c.cageOf && CARD_DEFS[c.defId] && CARD_DEFS[c.defId].effects && CARD_DEFS[c.defId].effects[key]).length : 0; }
  function addLumber(pl, n){ n = Number(n)||0; if(!pl || n <= 0) return n; const got = n + countEff(pl, 'lumberjack'); pl.lumber = (pl.lumber||0) + got; return got; }
  function addOre(pl, kind, n){ n = Number(n)||0; if(!pl || n <= 0) return n; const got = n + countEff(pl, 'heavyMetal'); pl[kind] = (pl[kind]||0) + got; return got; }
  function ownerPidOfCard(card){ if(!curPlayers) return 1; for(const pid of [1,2]){ const pl = curPlayers[pid]; if(pl && allBoardCards(pl).includes(card)) return pid; } return 1; }
  // A leader is on the battlefield: a summoned leader, a gladiator leader, or a unit with the Leader skill.
  function leaderOnBoard(pl, except){ return !!pl && allBoardCards(pl).some(c=> c && c !== except && c.hp > 0 && !c.cageOf && (c.isLeader || c.gladiatorLeader || (((CARD_DEFS[c.defId]||{}).effects)||{}).leader)); }
  // Every swing at the castle: the situational bonuses count (the day/night, aura and resource bonus, Inspired, Flow), and
  // Rage doubles it (user, 2026-10-12: "Rage doubles the unit's attack, including against castles").
  function castleSwingAmt(att, base){ let n = base + phaseBonus(att) + (att.inspired||0) + tideAtk(att) + firstBloodBonus(att); if(isRaging(att)) n *= 2; return n; }
  // First blood (2026-10-12, user: "In savannah, 1 random quick enemy per turn gets the first blood bonus of +1 and at the boss,
  // +2 damage. Only 1 unit on the field can get this bonus, so if you have a quick unit that goes first before theirs, they
  // dont get it"): rules.firstBlood N. The first Quick unit to swing in a round, on either side, hits +N; nobody else does.
  let firstBloodTaken = false, firstBloodEvents = null;
  function firstBloodBonus(att){
    const n = Number(rules.firstBlood)||0; if(!(n > 0) || firstBloodTaken || !att) return 0;
    const d = CARD_DEFS[att.defId]; if(!(d && d.effects && d.effects.quick)) return 0;
    firstBloodTaken = true;
    if(recordEvents && shieldEvents){ const pid = ownerPidOfCard(att); shieldEvents.push({type:'statusFx', kind:'firstBlood', side: shieldSideOf ? shieldSideOf(pid) : (pid===1?'A':'B'), attUid:att.uid, attDefId:att.defId, targetUid:att.uid, targetDefId:att.defId, amount:n}); }
    return n;
  }
  // Shell N (reworked 2026-10-12, user: "Shell N: gains N armour and N temporary health. Temp health not lost to damage goes
  // away at the next turn's end step ... triggers on any hit, including arrows. If not hit yet, the unit can still attack"):
  // the first hit of any kind pulls the unit into its shell. From then until the end of the next round it has N more Armour
  // and N temporary Health (spent before real Health), and it doesn't attack.
  function shellUp(card){
    const d = CARD_DEFS[card.defId]; const n = Number(d && d.effects && d.effects.shell) || 0;
    if(!(n > 0) || !(card.hp > 0) || card.shellUntil != null) return false;
    card.shellArmor = n; card.tempHp = n; card.shellUntil = combatNo + (combatDepth > 0 ? 1 : 2); // until the end of the next round
    // 2026-10-12 (09:48, user: "When a card with shell gets hit ... it CANNOT attack for the rest of the turn, till the next
    // turn"): no attack for the rest of this round (or the coming one, when it's hit between rounds); next round it swings.
    card.shellQuiet = combatNo + (combatDepth > 0 ? 0 : 1);
    if(recordEvents && shieldEvents){ const pid = ownerPidOfCard(card); shieldEvents.push({type:'statusFx', kind:'shellUp', side: shieldSideOf ? shieldSideOf(pid) : (pid===1 ? 'A' : 'B'), attUid:card.uid, attDefId:card.defId, targetUid:card.uid, targetDefId:card.defId, amount:n}); }
    return true;
  }
  function spendTempHp(card, dmg){ if(card.tempHp > 0 && dmg > 0){ const s2 = Math.min(card.tempHp, dmg); card.tempHp -= s2; dmg -= s2; }
    // Shield (2026-10-14, user: "Not the same as armour, just temp HP"): soaks what Shell's temporary Health didn't, and never heals back.
    if(card.shield > 0 && dmg > 0){ const s3 = Math.min(card.shield, dmg); card.shield -= s3; dmg -= s3;
      if(recordEvents && shieldEvents) shieldEvents.push({type:'shieldSoak', uid:card.uid, defId:card.defId, soaked:s3, left:card.shield}); }
    return dmg; }
  // ---- 2026-10-14 skills (for the cards on the maps after Map 20) ----
  function effectsOf(c){ return ((c && CARD_DEFS[c.defId]) || {}).effects || {}; }
  // Speed N (2026-10-14, user: "Swing Order. So Speed +N means that: When combat begins, all creatures of the highest speed go
  // in turn order. Then the next fastest, then the next fastest. Not extra attacks."): every unit has a Speed, 0 unless a skill
  // gives it (effects.speed N is its base). The main combat order goes by Speed, highest first; inside one Speed it is the usual
  // turn order, so a board where everyone is at 0 plays exactly as before. Fast Forward, boomerang returns and the Swimmer /
  // Tailwind turns still come before the main order. Haste (user: "Speed +2, adjacent allies Speed +1"): +2 for itself and +1
  // for the units beside it in its row, while it lives. Worked out afresh with the round's other situational stats (see
  // syncPhaseStats, which runs at every round start and after every arrival). c.speed is the live value (for the board's badge).
  function computeSpeeds(players){
    [1,2].forEach(pid=>{ const pl = players && players[pid]; if(!pl || !pl.row) return;
      const cards = allBoardCards(pl), add = new Map();
      if(cards.some(c=> c && !c.gap && c.hp > 0 && !c.cageOf && effectsOf(c).haste)){
        const order = physicalRowOrder(pl);
        order.forEach((c, i)=>{ if(!c || c.gap || !(c.hp > 0) || c.cageOf || !effectsOf(c).haste) return;
          [order[i-1], order[i+1]].forEach(n=>{ if(n && !n.gap && n.hp > 0) add.set(n, (add.get(n)||0) + 1); }); });
      }
      cards.forEach(c=>{ if(!c || c.gap) return; const e = effectsOf(c);
        const v = (Number(e.speed)||0) + (e.haste ? 2 : 0) + (add.get(c)||0);
        if(v || c.speed) c.speed = v; });
    });
  }
  // Cower (2026-10-14, user: "Cower (and maybe another skill also about a Turtle going into a shell) - Do {} when hit previous
  // turn"): the "when hit last turn" trigger. A unit that took damage in the previous round does its cower action this round:
  //   'shell' (the default) pulls into its shell: no attack this round, and attacks can't hurt it this round (Poison, Bleed,
  //           curses and the field still tick);
  //   'flee'  backs off: no attack this round, and it heals 2.
  // Unlike Shell N (which answers the very first hit with Armor and temporary Health), Cower looks back one round, every round.
  // A hit between rounds (a spell in the play phase, a round-start hazard) counts for the coming round, like Shell's does.
  // Status ticks (Poison, Bleed, Decay, curses) and its own Recoil aren't hits.
  const NOT_A_HIT = new Set(['poison', 'bleed', 'decay', 'curse', 'recoil']);
  function noteHit(card, dmg, dmgType){ if(card && dmg > 0 && !NOT_A_HIT.has(dmgType)) card.lastHitRound = combatNo + (combatDepth > 0 ? 0 : 1); }
  function cowerMode(c){ const v = effectsOf(c).cower; return !v ? null : (v === 'flee' ? 'flee' : 'shell'); }
  function shelledByCower(c){ return !!c && c.cowerRound === combatNo && cowerMode(c) === 'shell'; }
  function startCower(players, sideOf, events){
    [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return;
      allBoardCards(pl).forEach(c=>{ if(!c || c.gap || !(c.hp > 0) || c.cageOf) return; const m = cowerMode(c);
        if(!m || c.lastHitRound !== combatNo - 1) return;
        c.cowerRound = combatNo; let healed = 0;
        if(m === 'flee') healed = applyHeal(c, 2, sideOf(pid), events);
        if(recordEvents && events) events.push({type:'statusFx', kind:'cower', mode:m, side:sideOf(pid), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId, amount:healed}); }); });
  }
  // Ghost (2026-10-14, user: "Ghost - Can't be affected by Normal Damage"): normal (physical) attacks pass through it. Magic
  // attacks and every other damage type (fire, poison, frost, acid …) still hurt. Ghosts can't Bleed, except by Ichor.
  // Magic (user: "Introduce Magic damage - some units have a wand instead of a sword symbol"): effects.magic makes its attacks
  // magic damage (a card's own dmgType still works for the other elements).
  function isGhost(c){ return !!effectsOf(c).ghost; }
  // Supreme (2026-10-14): a Supreme beast's attacks count as magic, whatever element it breathes.
  // Fork / Trident / Pitchfork (2026-10-15, user: "attack the nearest 2/3/4 enemies within 1/1/2 range"): n = units hit in all
  // (its normal swing included), range = how many columns away they may stand. One table, so the three read alike. An old
  // `swipe: true` still means Fork. With several on one card, the widest wins.
  const PRONG_SPECS = [{key:'pitchfork', n:4, range:2}, {key:'trident', n:3, range:1}, {key:'fork', n:2, range:1}];
  function prongSpecOf(def){ const e = (def && def.effects) || {}; if(e.stealth) return null;
    for(const p of PRONG_SPECS){ if(e[p.key] || (p.key === 'fork' && e.swipe === true)) return {kind:p.key, n:p.n, range:p.range}; }
    return null; }
  function attackDmgType(attDef){ const e = (attDef && attDef.effects) || {}; return (e.magic || e.supreme) ? 'magic' : ((attDef && attDef.dmgType) || 'physical'); }
  // Night or darkness (2026-10-14, for Shade and Shadow): it is night, or the map is dark (caves, the grotto, the abyss).
  function darkNow(){ const ph = phaseActive() ? getPhase() : null; return ph === 'night' || !!rules.dark; }
  // Halving defences, applied after Resist and Weakness, rounding down (so a 1 can come to nothing):
  //   Ghost (2026-10-14, user: "Ghost - not just unaffected by physical, those creatures that deal elemental damage physically, deal
  //     half. Only magic damage deals equal"): physical damage already passes through (resistFactor); every other non-magic damage
  //     (fire, frost, poison, acid, water: attacks, arrows, field hazards and status ticks alike) is halved. Magic is full. Bleed (which
  //     only reaches a Ghost through Ichor) stays whole.
  //   Supreme (2026-10-14, user: "Their armor (HP also sparkles) are magic. So non-magic damage deals 1/2, rounded down"): halved
  //     from every non-magic source.
  //   Shade (2026-10-14, user: "Effects like Shade and Ghost and Shadow"): at night or in darkness, halved from non-magic attacks
  //     (a unit's swing, arrow or skill: anything with an attacker). By day it is an ordinary unit.
  function spiritHalves(card, dmgType, fromAttack){
    const e = effectsOf(card); let n = 0; const magic = dmgType === 'magic'; if(dmgType === 'true') return 0; // the Test Kit's plain damage
    if(e.ghost && !magic && dmgType && dmgType !== 'physical' && dmgType !== 'bleed') n++; // Ichor's Bleed is the one way through (2026-10-14 earlier pass), so it stays whole
    if(e.supreme && !magic) n++;
    if(e.shade && !magic && fromAttack && darkNow()) n++;
    return n;
  }
  function halveTimes(amt, n){ for(let i = 0; i < n; i++) amt = Math.floor(amt / 2); return amt; }
  function ghostBleedClamp(c){ if(!c || !(c.bleed > 0)) { if(c && c.ichorBleed) c.ichorBleed = 0; return; }
    if(isGhost(c)) c.bleed = Math.min(c.bleed, Math.max(0, c.ichorBleed||0));
    if(c.ichorBleed > c.bleed) c.ichorBleed = c.bleed; }
  // Rabid (2026-10-14, user: "Rabid Beasts: 2/3, Poison 2, Vulnerable to water"): its hits add 2 Poison (on top of any Poison of
  // its own), and it takes double damage from Swimmers and water.
  function poisonOn(attDef){ const e = (attDef && attDef.effects) || {}; return (Number(e.poison)||0) + (e.rabid ? 2 : 0); }
  // Toxin (planned, 2026-10-14, user: "Toxin: More dangerous poison - not yet defined."): not built; no behaviour yet.
  // Psychic N (2026-10-14, user: "Psychic Damage: it's a skill rather than a type like Normal and Magic."): each landed hit also
  // deals N psychic damage straight to Health: Armor, a unit Shield, Shell's temporary Health and a Ghost's immunity don't stop it.
  // Elementals and Plants have no mind to hurt: species Elemental or Plant, or archetype Elemental or Flora.
  function isMindless(c){ const d = (c && CARD_DEFS[c.defId]) || {}, sp = d.species || [], ar = d.archetypes || [];
    return sp.includes('Elemental') || sp.includes('Plant') || ar.includes('Elemental') || ar.includes('Flora'); }
  function psychicHit(pid, att, c, sideOf, stats, events){
    const n = Number(effectsOf(att).psychic)||0; if(!(n > 0) || !c || !(c.hp > 0)) return 0;
    const tpid = otherId(pid), mindless = isMindless(c), dmg = mindless ? 0 : n;
    if(dmg > 0){ c.hp = Math.max(0, c.hp - dmg); if(c.asleep > 0){ c.asleep = 0; noteWoke(c); } if(c.hp <= 0) c.killedBy = att.uid;
      ensureStat(stats, sideOf(pid), att.defId).dealt += dmg; ensureStat(stats, sideOf(tpid), c.defId).taken += dmg; }
    if(recordEvents && events) events.push({type:'psychic', side:sideOf(pid), attUid:att.uid, attDefId:att.defId, targetSide:sideOf(tpid), targetUid:c.uid, targetDefId:c.defId, dmg, n, immune:mindless || undefined});
    return dmg;
  }
  // Ichor N (2026-10-14, user: "Corrosive blood: When hit, the attacker takes N acid damage and loses 1 Armor" + "but also add
  // something about giving bleed to ghosts - ghosts are immune to bleed but ichor gives bleed indirectly"): an attack that lands
  // on it splashes the attacker: N acid damage, 1 Armor gone for good (if it has any), and 1 Bleed, which sticks even to a Ghost.
  function ichorSplash(players, sideOf, defOwnerId, defCard, att, stats, events, killCredit){
    const n = Number(effectsOf(defCard).ichor)||0; if(!(n > 0) || !att || !(att.hp > 0)) return;
    const dmg = damageCardFlat(att, n, 'acid', defCard.defId);
    const base = Number(effectsOf(att).armor)||0; let lost = 0;
    if(base - (att.armorLoss||0) > 0){ att.armorLoss = (att.armorLoss||0) + 1; lost = 1; }
    if(att.hp > 0){ att.bleed = (att.bleed||0) + 1; att.ichorBleed = (att.ichorBleed||0) + 1; }
    ensureStat(stats, sideOf(otherId(defOwnerId)), att.defId).taken += dmg;
    if(recordEvents && events) events.push({type:'statusFx', kind:'ichor', side:sideOf(defOwnerId), attUid:defCard.uid, attDefId:defCard.defId, targetSide:sideOf(otherId(defOwnerId)), targetUid:att.uid, targetDefId:att.defId, amount:dmg, armor:lost, bleed:1});
    if(att.hp <= 0 && killCredit){ if(!killCredit[att.uid]) killCredit[att.uid] = new Set(); killCredit[att.uid].add(statKey(sideOf(defOwnerId), defCard.defId)); }
  }
  // Irradiation tokens (2026-10-14, user: "Irradiation tokens - Irradiated. For each token, remove either 1 ATT, 1 HP, or 1 value from
  // a skill the card has. So Snipe N becomes Snipe N-1. If it already is at Snipe 1, remove it entirely ... Every turn this happens,
  // then irradiation drops by 1. Probability: Health 3 units, Attack 2 units, abilities 1 unit each. For 1 word abilities, it takes 2
  // points of irradiation to remove. Like Earthquake or Flying or Tide. For trigger -> X, it takes 1 irradiation point to either limit
  // the selection, reduce the amount of triggers, reduce a value, otherwise, if each element is at its base form, remove the ability for
  // 1 as well. (E.g. Target All Allies downgraded to Adjacent Allies downgraded to Self. (If All OTHER* Allies, then Adjacent is the
  // weakest already)"). A unit carries c.irradiation tokens. Every upkeep, each token takes one point, picked by weight: Health 3
  // (-1 max Health; a unit can wither to death), Attack 2 (-1 Attack, only while it has some), each skill 1:
  //   a number skill    N -> N-1, and gone at 1 (Snipe 3 -> Snipe 2; Snipe 1 -> no Snipe)
  //   a one-word skill  (true, a choice or a type list) weakened by the first point, gone with the second (Flying, Earthquake, Tide)
  //   a chance skill    ({chance, duration} and the like) its count, amount or duration drops by 1; gone once it's at 1
  //   a trigger         its targets narrow one step (all allies -> adjacent allies -> itself; all or random enemies -> the one in
  //                     front), else its count drops, else its amount, else it's gone
  // Then the unit's tokens drop by 1. The skills are changed on the unit's own copy of its card (patchUnitDef), so the engine reads
  // the weaker card everywhere and the printed card is untouched. c.irrAtk / c.irrHp / c.irrSkills keep the tally for the card details.
  function radiationDose(c, n){ const f = resistFactor(c.defId, 'radiation') * weaknessFactor(c.defId, 'radiation'); return f === 0 ? 0 : f !== 1 ? Math.max(1, Math.floor(n*f)) : n; }
  function irradiate(c, n){ n = radiationDose(c, n); if(n > 0) c.irradiation = (c.irradiation||0) + n; return n; }
  // A per-unit change to its card's skills, kept under any day/night or leader grant riding on it (syncPhaseStats' _condBase).
  function patchUnitDef(c, patch){
    if(c._condBase){ let g = null; try{ g = c._condKey ? JSON.parse(c._condKey) : null; }catch(e){} c.defId = c._condBase; deriveDef(c, patch); c._condBase = c.defId; if(g) deriveDef(c, g); }
    else deriveDef(c, patch);
  }
  const IRR_NOT_SKILLS = new Set(['resist', 'weakness', 'immune', 'swarmN', 'defianceN', 'nocturnalHp', 'diurnalHp', 'crepuscularHp', 'espritHp', 'loyalGrant', 'usurperGrant', 'swimmerGrant', 'diurnalGrant', 'nocturnalGrant', 'tideGrant', 'fullMoonGrant', 'triggers', 'level', 'baseLevel']);
  const IRR_COMPANION = {nocturnal:['nocturnalHp', 'nocturnalGrant'], diurnal:['diurnalHp', 'diurnalGrant'], tide:['tideGrant'], fullMoon:['fullMoonGrant'], crepuscular:['crepuscularHp'], esprit:['espritHp'], loyal:['loyalGrant'], usurper:['usurperGrant'], swimmer:['swimmerGrant'], swarm:['swarmN'], defiance:['defianceN']};
  function irrAbilities(c){
    const e = effectsOf(c), out = [];
    Object.keys(e).forEach(k=>{ if(IRR_NOT_SKILLS.has(k)) return; const v = e[k]; if(v === false || v == null || v === 0 || v === '' || (Array.isArray(v) && !v.length)) return; out.push({key:k}); });
    (Array.isArray(e.triggers) ? e.triggers : []).forEach((t, i)=> out.push({key:'triggers', i}));
    return out;
  }
  function trigLabel(t){ return (t.on || '') + ':' + (t.do || ''); }
  function irrNote(c, key, from, to){ const m = c.irrSkills || (c.irrSkills = {}); if(!m[key]) m[key] = {from}; m[key].to = to; }
  function irrDegrade(c, ab){
    const e = effectsOf(c), k = ab.key;
    if(k === 'triggers'){
      const ts = e.triggers.map(t=> Object.assign({}, t)), t = ts[ab.i], lbl = trigLabel(e.triggers[ab.i]); let what;
      const wide = t.sub === 'all' || t.sub === 'random' || t.sub === 'furthest' || (t.who && t.who !== 'self' && !t.sub);
      if(t.who === 'ally' && wide){ t.sub = 'adjacent'; what = 'narrowed'; }
      else if(t.who === 'ally' && t.sub === 'adjacent'){ t.who = 'self'; delete t.sub; what = 'narrowed'; }
      else if(t.who === 'enemy' && wide){ t.sub = 'adjacent'; what = 'narrowed'; }
      else if(Number(t.count) > 1){ t.count = Number(t.count) - 1; what = 'count'; }
      else if(Number(t.amount) > 1){ t.amount = Number(t.amount) - 1; what = 'value'; }
      else if(Number(t.amount2) > 1){ t.amount2 = Number(t.amount2) - 1; what = 'value'; }
      else { ts.splice(ab.i, 1); what = 'removed'; }
      patchUnitDef(c, {triggers: ts}); irrNote(c, 'trigger ' + lbl, e.triggers[ab.i], what === 'removed' ? null : t);
      return {key:'trigger', label:lbl, what};
    }
    const v = e[k], off = {};
    const gone = ()=>{ off[k] = typeof v === 'number' ? 0 : false; (IRR_COMPANION[k]||[]).forEach(x=>{ if(x in e) off[x] = typeof e[x] === 'number' ? 0 : /Grant$/.test(x) ? null : false; }); patchUnitDef(c, off); irrNote(c, k, v, null); if(c.irrPartial) delete c.irrPartial[k]; return {key:k, what:'removed', from:v}; };
    // Pack (2026-10-14, user: "Irradiation will wipe out 2 at a time, similarly"): a point takes 2 off Pack; gone at 0.
    if(k === 'pack'){ const n = packNOf(e), to = n - 2; if(to > 0){ patchUnitDef(c, {pack: to}); irrNote(c, k, v, to); return {key:k, what:'value', from:v, to}; } off[k] = 0; patchUnitDef(c, off); irrNote(c, k, v, null); return {key:k, what:'removed', from:v}; }
    if(typeof v === 'number'){ if(v > 1){ patchUnitDef(c, {[k]: v - 1}); irrNote(c, k, v, v - 1); return {key:k, what:'value', from:v, to:v - 1}; } return gone(); }
    if(v && typeof v === 'object' && !Array.isArray(v)){
      const nk = ['count', 'amount', 'duration', 'n'].find(x=> Number(v[x]) > 1);
      if(nk){ const nv = Object.assign({}, v, {[nk]: Number(v[nk]) - 1}); patchUnitDef(c, {[k]: nv}); irrNote(c, k, v, nv); return {key:k, what:'value', field:nk}; }
      return gone();
    }
    // a one-word skill (true, a choice like Swimmer's, or a type list): two points to take it away
    const p = c.irrPartial || (c.irrPartial = {});
    if(!p[k]){ p[k] = 1; irrNote(c, k, v, v); return {key:k, what:'weakened'}; }
    return gone();
  }
  // Test hook (2026-10-14): one Irradiation point on a chosen target ('hp', 'atk', or an ability {key} / {key:'triggers', i}).
  function debugIrradiatePoint(c, pick){
    if(pick === 'hp'){ c.maxHp = Math.max(0, c.maxHp - 1); if(c.hp > c.maxHp) c.hp = c.maxHp; c.irrHp = (c.irrHp||0) + 1; return {kind:'hp'}; }
    if(pick === 'atk'){ c.atk = Math.max(0, c.atk - 1); if(c.baseAtk != null) c.baseAtk = Math.max(0, c.baseAtk - 1); c.irrAtk = (c.irrAtk||0) + 1; return {kind:'atk'}; }
    return Object.assign({kind:'skill'}, irrDegrade(c, typeof pick === 'string' ? {key:pick} : pick));
  }
  function irradiationTick(players, sideOf, events){
    let died = false;
    [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return;
      allLive(pl).forEach(c=>{
        const n = c.irradiation|0; if(n <= 0) return;
        const points = [];
        for(let k = 0; k < n && c.hp > 0; k++){
          const opts = [{w:3, kind:'hp'}]; if(c.atk > 0) opts.push({w:2, kind:'atk'}); irrAbilities(c).forEach(a=> opts.push({w:1, kind:'skill', a}));
          let r = rnd() * opts.reduce((t, o)=> t + o.w, 0), pick = opts[opts.length - 1];
          for(const o of opts){ if(r < o.w){ pick = o; break; } r -= o.w; }
          if(pick.kind === 'hp'){ c.maxHp = Math.max(0, c.maxHp - 1); if(c.hp > c.maxHp) c.hp = c.maxHp; c.irrHp = (c.irrHp||0) + 1; points.push({kind:'hp'}); }
          else if(pick.kind === 'atk'){ c.atk = Math.max(0, c.atk - 1); if(c.baseAtk != null) c.baseAtk = Math.max(0, c.baseAtk - 1); c.irrAtk = (c.irrAtk||0) + 1; points.push({kind:'atk'}); }
          else points.push(Object.assign({kind:'skill'}, irrDegrade(c, pick.a)));
        }
        c.irradiation = n - 1;
        if(c.hp <= 0) died = true;
        if(recordEvents && events) events.push({type:'irradiation', side:sideOf(pid), uid:c.uid, defId:c.defId, points, left:c.irradiation});
      }); });
    return died;
  }
  // Loyal / Usurper (user: "Conditional skills like Nocturnal: one activates when an ally leader is on the battlefield,
  // granting the effects in { }. The antagonist version activates when the opposing leader is present"): +A/+H while the
  // condition holds, plus any skills in loyalGrant / usurperGrant. Timber, Rock-solid and Iron-will: +1/+1 per Lumber,
  // +2/+2 per Stone, +3/+3 per Metal you hold. All of these ride on the same situational bonus as day and night.
  function pairOf(v){ if(Array.isArray(v)) return [Number(v[0])||0, Number(v[1])||0]; if(v && typeof v === 'object') return [Number(v.attack)||0, Number(v.health)||0]; const n = v === true ? 1 : (Number(v)||0); return [n, n]; }
// Zeitgeber format (2026-10-15, user: "Diurnal - +1. At more advanced maps, Diurnal - {}. Day grants skills not +1 attack anymore.
// Swimming is the same thing with Tide ... At first, the basic is quite simple. The advanced use, much stronger. Like Full Moon - {} vs
// Full Moon - Default: +3/+3 permanently from now on ... Tide - {}, unique from Diurnal - has two facets. So Tide - {Gain 5/5, Evade},
// {2 Armour}"): each time-giver skill has a plain form (Diurnal, Nocturnal, Tide, Full Moon: the simple bonus) and an advanced form
// whose braces list what it gets instead:
//   effects.diurnalGrant / nocturnalGrant = {skill: value, ..., attack?, health?}: while it's Day (Night; both in Twilight), in place
//     of the plain +A/+H. (effects.diurnal / nocturnal stay true beside it, so the unit still counts as Diurnal / Nocturnal.)
//   effects.tideGrant = {flood:{...}, ebb:{...}}: the Flood facet while the tide floods, the Ebb facet on the Ebb, both at High Tide,
//     in place of Flood's +1 Attack and Ebb's +1 Armor (effects.tide stays true beside it). Supreme Tide still doubles the plain ones.
//   effects.fullMoon = N (default 3): the first time a full moon rises over it (a full moon at night, or the Full Moon field), +N/+N
//     for the rest of the fight. effects.fullMoonGrant = {...}: the skills in the braces from then on instead.
// The skills in the braces ride on the same grant as Loyal / Usurper (a derived card, given and taken back as the condition turns).
  function grantStats(g){ if(!g || typeof g !== 'object') return [0, 0, null]; const rest = Object.assign({}, g); const x = Number(rest.attack)||0, y = Number(rest.health)||0; delete rest.attack; delete rest.health; return [x, y, Object.keys(rest).length ? rest : null]; }
  function hasTideGrant(e){ return !!(e && e.tideGrant && typeof e.tideGrant === 'object'); }
  function condStatsOf(c, e, pid, players){
    const pl = players[pid], foe = players[otherId(pid)]; let a = 0, h = 0, grant = null;
    const add = (v, g)=>{ const [x, y] = pairOf(v); a += x; h += y; if(g && typeof g === 'object') grant = Object.assign(grant || {}, g); };
    const addGrant = g=>{ const [x, y, r] = grantStats(g); a += x; h += y; if(r) grant = Object.assign(grant || {}, r); };
    { const ph = phaseActive() ? getPhase() : null; // Diurnal – {…} / Nocturnal – {…} (2026-10-15)
      const lit = ph === 'night' && pl && allBoardCards(pl).some(u=> u && !u.gap && u.hp > 0 && effectsOf(u).lantern); // a Lantern keeps a Diurnal unit's day
      if(e.diurnalGrant && typeof e.diurnalGrant === 'object' && (ph === 'day' || ph === 'twilight' || (lit && !(e.nocturnal || e.nocturnalHp)))) addGrant(e.diurnalGrant);
      if(e.nocturnalGrant && typeof e.nocturnalGrant === 'object' && (ph === 'night' || ph === 'twilight')) addGrant(e.nocturnalGrant); }
    if(hasTideGrant(e)){ const t = getTide(); // Tide – {Flood}, {Ebb} (2026-10-15): High Tide brings both facets
      if(t === 'flow' || t === 'high') addGrant(e.tideGrant.flood); if(t === 'ebb' || t === 'high') addGrant(e.tideGrant.ebb); }
    if(c.fullMoonRisen){ if(e.fullMoonGrant && typeof e.fullMoonGrant === 'object') addGrant(e.fullMoonGrant); else if(e.fullMoon){ const n = e.fullMoon === true ? 3 : (Number(e.fullMoon)||3); a += n; h += n; } } // Full Moon (2026-10-15)
    if((e.loyal || e.loyalGrant) && leaderOnBoard(pl, c)) add(e.loyal || 0, e.loyalGrant);
    if((e.usurper || e.usurperGrant) && leaderOnBoard(foe)) add(e.usurper || 0, e.usurperGrant);
    if(e.timber){ const n = Math.max(0, pl.lumber||0); a += n; h += n; }
    // Swimmer's Flow list (2026-10-12): the skills it gets while the tide is in Flow.
    // Swimmer (reworked 2026-10-12, 09:48: "Change it to be a If Tide -> { } is enabled ... {Extra Attack} or {Quick Attack} or
    // {Evade}"): on a rising tide it gets the one thing it was given. Quick Attack is the Fast Forward turn (in resolveCombat).
    if(e.swimmer && tideRising()){ const sw = e.swimmer === true ? 'extraAttack' : e.swimmer;
      if(sw === 'extraAttack') a += 1; else if(sw === 'evade') add(0, {evasive:true}); }
    if(e.swimmerGrant && typeof e.swimmerGrant === 'object' && tideRising()) add(0, e.swimmerGrant);
    // Rainrunner N (2026-10-12): +N/+N while it rains (and it slips past blockers, see the targeting).
    if(e.rainrunner && field && field.id === 'rain'){ const n = Number(e.rainrunner)||1; a += n; h += n; }
    // Moonborn N (2026-10-12, user: "Add lunar cycles - only matters when there's a card that cares about it"): at night,
    // +N/+N scaled by how full the moon is (new 0, crescent ¼, quarter ½, gibbous ¾, full all of it).
    if(e.moonborn && getPhase() === 'night'){ const n = Math.round((Number(e.moonborn)||1) * moonFullness()); a += n; h += n; }
    if(e.rockSolid){ const n = Math.max(0, pl.stone||0) * 2; a += n; h += n; }
    if(e.ironWill){ const n = Math.max(0, pl.metal||0) * 3; a += n; h += n; }
    // Bloom (conditions) (2026-10-14, user: "Bloom (Tide & Night) or Bloom(Wind or Wet)..."): effects.bloomWhen = {when:[...],
    // mode:'and'|'or', atk, hp} (+2/+2 and 'and' by default). While its conditions hold the unit is in bloom (c.inBloom) and has
    // +atk/+hp, gained and lost with the bloom like a Nocturnal bonus. (Kept apart from the old Bloom N heal, effects.bloom.)
    c.inBloom = false;
    if(e.bloomWhen && typeof e.bloomWhen === 'object'){ const b = bloomStateOf(e.bloomWhen); if(b.on){ c.inBloom = true; a += b.atk; h += b.hp; } }
    return [a, h, grant];
  }
  // One Bloom condition, as it stands right now. 'night' and 'day' both hold in Twilight (like Nocturnal and Diurnal); 'wet' is
  // rain, or the Tide in, or a wet map (rules.wet: the beach, river and sea maps); 'dark' is a dark map or night.
  const BLOOM_CONDS = ['tide', 'ebb', 'night', 'day', 'twilight', 'wind', 'wet', 'dark', 'heat', 'frost'];
  function bloomCond(k){
    const ph = phaseActive() ? getPhase() : null, f = field && field.id;
    switch(String(k||'').toLowerCase()){
      case 'tide': return tideRising();
      case 'ebb': return getTide() === 'ebb';
      case 'night': return ph === 'night' || ph === 'twilight';
      case 'day': return ph === 'day' || ph === 'twilight';
      case 'twilight': return ph === 'twilight';
      case 'wind': return isWindy();
      case 'wet': return f === 'rain' || tideRising() || !!rules.wet;
      case 'dark': return !!rules.dark || ph === 'night';
      case 'heat': return f === 'heatwave';
      case 'frost': return f === 'frozen';
    }
    return false;
  }
  function bloomStateOf(bw){
    const when = (Array.isArray(bw.when) ? bw.when : [bw.when]).filter(Boolean);
    const or = bw.mode === 'or', on = when.length > 0 && (or ? when.some(bloomCond) : when.every(bloomCond));
    return {on, atk: bw.atk != null ? Number(bw.atk)||0 : 2, hp: bw.hp != null ? Number(bw.hp)||0 : 2};
  }
  // Full melee-style damage pipeline: attacker rage bonus -> target resist
  // -> target rage reduction -> target armor (flat, floors at 0, last so
  // Armor is genuinely the last line of defense). Returns {dmg, armorBlocked}.
  function perksOfCard(card){ if(!card || !curPlayers) return null; for(const pid of [1,2]){ const pl = curPlayers[pid]; if(pl && pl.perks && ['left','center','right'].some(l=> (pl.row[l]||[]).includes(card))) return pl.perks; } return null; }
  function computeHitDamage(attCard, rawAmount, dmgType, targetCard){
    let amt = rawAmount;
    if(attCard && targetCard && targetCard.hp > 0 && targetCard.hp < targetCard.maxHp / 2){ const k = perksOfCard(attCard); if(k && k.weakSpots) amt += k.weakSpots; } // Wildpath "Weak Spots"
    const attDef = attCard ? CARD_DEFS[attCard.defId] : null;
    // King Slayer (2026-09-22, per explicit request: "New type: King. New card: King Maker -
    // Passive: King Slayer N - does N extra damage to Kings on hit."). Flat bonus damage
    // whenever the target carries the new "King" Type Tag (see ARCHETYPE_ICON in
    // assemble_arena.py) — folded into the raw amount here, before Expose/Scar/Rage/Resist/
    // Weakness/Armor, so it flows through the exact same downstream pipeline as the rest of
    // this swing's damage rather than being a separate, unmitigatable add-on. kingSlayerBonus
    // is returned below purely so call sites can decide whether to fire a distinct VFX event —
    // it never changes the damage math itself (that already happened to `amt` above).
    let kingSlayerBonus = 0;
    if(attDef && attDef.effects && attDef.effects.kingSlayer){
      const tdefKS = CARD_DEFS[targetCard.defId];
      if(tdefKS && Array.isArray(tdefKS.archetypes) && tdefKS.archetypes.includes('King')){
        kingSlayerBonus = attDef.effects.kingSlayer;
        amt += kingSlayerBonus;
      }
    }
    // Anti-Air N (2026-10-10, user: "an anti-air skill for one of the base units... especially poignant if one of the
    // otters has it"): never misses a Flying unit (see the dodge check) and hits it for N more.
    // Anti-Air N retired 2026-10-12: it became Boomerang (no number, no bonus damage; it still never misses a flier).
    // Demolisher N (2026-10-11, user: "structures ... can be destroyed faster with units with the skill Demolisher N -
    // deal N additional damage to structures").
    // Keen Eye (2026-10-11): sees through Changelings and hits them 2 harder.
    if(attDef && attDef.effects && attDef.effects.keenEye){ const tdK = CARD_DEFS[targetCard.defId]; if(tdK && tdK.effects && tdK.effects.changeling) amt += 2; }
    if(attDef && attDef.effects && Number(attDef.effects.demolisher) > 0){ const tdD = CARD_DEFS[targetCard.defId]; if(tdD && Array.isArray(tdD.archetypes) && tdD.archetypes.includes('Structure')) amt += Number(attDef.effects.demolisher); }
    // Scare N (2026-10-10, Devilry): anything attacking this card hits for N less (never below 0). Unlike Intimidate,
    // it only weakens attacks aimed at this card.
    const supremeAtt = !!(attDef && attDef.effects && attDef.effects.supreme); // Supreme (2026-10-14): crushes Scare, Armor and shells
    { const tdS = CARD_DEFS[targetCard.defId]; const sc = tdS && tdS.effects && Number(tdS.effects.scare); if(attCard && sc > 0 && !supremeAtt) amt = Math.max(0, amt - sc); }
    // Exposed (2026-10-15, user: "I like expose. It should give a debuff 'exposed'. This unit takes +1 damage and attacks on this unit
    // don't miss."): c.exposed is how many more hits it stays Exposed for (Expose N gives N). Each hit it takes deals +1 and uses one
    // up (before Armor, so Armor still mitigates it); dodgeCheck / combatHitLands / the Blind and dark rolls stop the misses.
    if(targetCard.exposed>0) amt += useExposed(targetCard);
    // Scar (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Mark"): unlike Expose, this
    // NEVER clears on its own -- every future hit this card takes gets the bonus, permanently
    // (until the card dies). Stacks additively each time an attacker with the Scar keyword
    // lands a hit on it (see the application site in resolveCombat).
    if(targetCard.scar>0) amt += targetCard.scar;
    if(attCard){ const sb = swarmBonus(attCard) + defianceBonus(attCard) + phaseBonus(attCard) + (attCard.inspired||0) + tideAtk(attCard) + firstBloodBonus(attCard); if(sb) amt += sb; }
    // (Ebb's old "1 less per hit" is now +1 Armour, in nominalArmor below; 2026-10-12)
    if(attCard && isRaging(attCard)) amt = amt * 2;
    // Feeble/Mighty (2026-09-29): unconditional attacker-side multiplier, applied before the
    // target's own Resist/Weakness/Fragile/Sturdy factor below.
    const atkFactor = attackerDamageFactor(attDef);
    if(atkFactor!==1) amt = amt * atkFactor;
    // Resist (0.5x), Weakness (2x), Fragile (2x), and Sturdy (0.5x) all apply here and multiply
    // together if a card somehow has more than one for the same hit (e.g. 0.5 * 2 = 1x net — a
    // self-cancelling edge case, not specially handled, since a card author combining them is on
    // them).
    const factor = resistFactor(targetCard.defId, dmgType, attDef) * weaknessFactor(targetCard.defId, dmgType, attDef) * defenderDamageFactor(targetCard.defId);
    if(factor===0) amt = 0; else if(factor!==1) amt = Math.max(1, Math.floor(amt*factor)); // Immune takes nothing
    { const hv = spiritHalves(targetCard, supremeAtt ? 'magic' : dmgType, !!attCard); if(hv) amt = halveTimes(Math.floor(amt), hv); } // Ghost / Supreme / Shade (2026-10-14)
    // Shock (status, 2026-09-17): while active, every hit this card takes lands for 50% more —
    // a "vulnerable" debuff, distinct from Rage's self-damage-doubling (that's a stance the card
    // chooses; Shock is inflicted on it). Applied after Resist/Weakness so a resisted hit still
    // gets shocked proportionally, before Armor so Armor still partially mitigates it.
    if(targetCard.shocked>0) amt = Math.ceil(amt*1.5);
    if(targetCard && isRaging(targetCard)) amt = Math.floor(amt/2);
    const tdef = CARD_DEFS[targetCard.defId];
    // Rend (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Pierce"): bypasses Armor
    // AND Shell's temporary bonus armor entirely for this hit -- the direct counter-tech to
    // both of those damage-reduction keywords, which previously had none.
    // 2026-10-11 (user: "Rename Pierce to Puncture and Rend to Pierce. Perforate is to Puncture, to Pierce, to give Bleed
    // and to lower armour permanently"): Pierce N ignores N of the target's Armor (Pierce with no number, the old Rend,
    // ignores all of it); Perforate N also counts as Pierce N. Armor a Perforate hit stripped (targetCard.armorLoss) is
    // gone for good.
    const ae = (attDef && attDef.effects) || {};
    const pierceN = (ae.pierce === true || ae.rend || ae.supreme) ? Infinity : /* Pitchfork no longer pierces (2026-10-13 rework) */ (Number(ae.pierce)||0) + (Number(ae.perforate)||0);
    const nominalArmor = Math.max(0, ((tdef.effects && tdef.effects.armor) || 0) - (targetCard.armorLoss || 0)) + (targetCard.shellArmor || 0) + tideArmor(targetCard); // Shell: temporary bonus armor active the round after being hit; Tide: +1 on Ebb, +2 on High tide
    const armor = Math.max(0, nominalArmor - pierceN);
    const rend = pierceN > 0;
    // Rend (VFX/SFX coverage audit, 2026-09-21): rendBypass is a pure display flag for the front
    // end — "this hit ignored real Armor" — mirroring armorBlocked below. It never changes damage
    // math (armor is already forced to 0 above whenever rend is true); it only tells the UI
    // whether there was anything worth flourishing (a Rend card swinging at an unarmored target
    // stays silent, same "only when it actually mattered" convention as Bulwark's own display gate).
    const rendBypass = rend && nominalArmor>0;
    let armorBlocked = false;
    if(armor>0){
      const before = amt;
      amt = Math.max(0, Math.floor(amt) - armor);
      if(amt===0 && before>0) armorBlocked = true;
    } else {
      amt = Math.max(0, Math.floor(amt));
    }
    // Elemental dmgType conversion (2026-09-29, explicit design: "the elements can be both
    // passives and attack damage type"): once the final post-mitigation damage number is known,
    // an attacker whose OWN dmgType is Poison or Decay converts it into that element's signature
    // effect instead of applying it the ordinary way. Poison: the whole amount becomes poison
    // stacks and this hit deals NO direct HP loss — "the entire damage will convert to poison
    // instead. No direct health damage done." (Poison's own per-round tick, applyPoisonTicks,
    // deals the damage later instead.) Decay: HP damage still lands normally, but the same amount
    // ALSO permanently reduces the target's own Attack, floored at 0 — "decreases the opponent's
    // Attack AND Health values." Both are entirely separate from the Poison/Decay PASSIVE skills
    // (effects.poison/effects.decay), which add their own bonus stacks/reduction on top of
    // whatever the attack's dmgType already did — see applyPoisonTicks and the Decay passive
    // application in resolveCombat. Castle hits never reach this function at all (damageHQ is a
    // separate, dmgType-blind path) — that's the whole "castle can't be affected by status
    // effects... deals normal damage" carve-out asked for, with nothing extra needed here.
    let elementalConvert = null;
    let elementalAmount = 0; // the stack/ATK-drain amount a conversion applied -- kept separate
                              // from `amt` (the real returned dmg) since Poison zeroes `amt` out
                              // entirely; front-end log text reads this to say what actually
                              // happened instead of just "hit for 0".
    if(dmgType==='poison' && amt>0){
      targetCard.poison = (targetCard.poison||0) + amt;
      elementalConvert = 'poison';
      elementalAmount = amt;
      amt = 0;
    } else if(dmgType==='decay' && amt>0){
      targetCard.atk = Math.max(0, targetCard.atk - amt);
      if(targetCard.baseAtk!=null) targetCard.baseAtk = Math.max(0, targetCard.baseAtk - amt);
      elementalConvert = 'decay';
      elementalAmount = amt;
    }
    return {dmg: amt, armorBlocked, rendBypass, kingSlayerBonus, elementalConvert, elementalAmount};
  }
  // Nullify (2026-10-14, user: "an Evergreen effect like Shield Burn in Duel Masters. when this card hits the enemy, ignore all
  // triggers and effects that would result from that hit from that unit. E.g. if the unit has an on-death trigger, ignore that.
  // And when it dies, it goes straight to Exile zone."): a Nullify attacker's landed hit gets no reaction from the unit it hits:
  // no Thorns, Reflect, Spiteful, Counterattack, Ichor, Shell, Cower, defending Bleed tick, On Attacked triggers (or the legacy
  // On Attacked: Spawn). If the hit kills it, none of its own death effects happen (On Death triggers, On Death: Spawn,
  // Revive, Meiosis, Landslide, Hive Mind, Worthy) and it goes to the Removal Zone, not the graveyard. Its allies still notice
  // (On Ally Die, Berserk, Divine Retribution), and the killer still collects a Bounty.
  function isNullifier(att){ return !!(att && effectsOf(att).nullify); }
  function nullifyKill(card){ card.nullified = true; card.forceExileZone = true; }
  function damageCard(card, amount, dmgType, attCard){
    const r0 = computeHitDamage(attCard, amount, dmgType, card); const {armorBlocked, rendBypass, kingSlayerBonus, elementalConvert, elementalAmount} = r0;
    const crush = !!(attCard && effectsOf(attCard).supreme); // Supreme (2026-10-14): no shell, stone or temporary Health stops it
    if(shelledByCower(card) && !crush) r0.dmg = 0; // Cower 'shell' (2026-10-14): attacks can't hurt it this round
    if(card.petrified && !crush) r0.dmg = Math.floor(r0.dmg / 2); // Petrification (2026-10-14): stone takes half
    const dmg = crush ? r0.dmg : spendTempHp(card, r0.dmg), tempSoak = r0.dmg - dmg; // Shell's temporary Health goes first (2026-10-12)
    const nul = isNullifier(attCard); // Nullify (2026-10-14): the hit doesn't count as "hit" for Cower, and Shell doesn't go up
    if(!nul) noteHit(card, dmg, dmgType);
    const hp0 = card.hp;
    card.hp = Math.max(0, card.hp - dmg);
    if(hp0 > 0 && card.hp <= 0 && attCard) card.killedBy = attCard.uid; // who:'killer' (2026-10-14): the unit whose hit killed it
    if(suddenDeath && dmg>0) card.hp = 0; // sudden death: any hit that lands kills
    if(dmg>0 && card.asleep>0){ card.asleep = 0; noteWoke(card); } // Asleep (2026-09-16): breaks the instant real damage lands, classic "hit to wake"
    if(!nul) shellUp(card);
    if(nul && card.hp <= 0) nullifyKill(card);
    return {dmg, armorBlocked, rendBypass, kingSlayerBonus, elementalConvert, elementalAmount, tempSoak};
  }
  // Simple flat damage with no defense pipeline (used for missiles/onReadyDamage/thorns,
  // matching the pre-existing behavior — only melee combat runs the full pipeline).
  const EXPOSE_TICKS = new Set(['poison', 'bleed', 'decay', 'curse', 'chilli', 'recoil']); // status ticks don't use up Exposed (2026-10-15)
  function damageCardFlat(card, amount, dmgType, attDefId, attUid){
    if(card.exposed>0 && !EXPOSE_TICKS.has(dmgType)) amount += useExposed(card); // Exposed (2026-10-15): ranged/flat hits too, +1 and one hit used up (a Poison/Bleed tick isn't a hit)
    const attDef = attDefId ? CARD_DEFS[attDefId] : null;
    // King Slayer applies to ranged/flat hits too, same "applies everywhere, not just melee"
    // precedent Expose's own comment just above already sets. No dedicated VFX event fires from
    // this path (damageCardFlat's callers don't uniformly have access to recordEvents/events at
    // this depth) — silent here, same treatment Expose gets in this function.
    if(attDef && attDef.effects && attDef.effects.kingSlayer){
      const tdefKS = CARD_DEFS[card.defId];
      if(tdefKS && Array.isArray(tdefKS.archetypes) && tdefKS.archetypes.includes('King')){
        amount += attDef.effects.kingSlayer;
      }
    }
    // Feeble/Mighty (2026-09-29) apply to ranged/flat hits too, same "applies everywhere"
    // precedent Expose/King Slayer just above already set for this path.
    const atkFactor = attackerDamageFactor(attDef);
    if(atkFactor!==1) amount = amount * atkFactor;
    const crush = !!(attDef && attDef.effects && attDef.effects.supreme); if(crush) dmgType = 'magic'; // Supreme (2026-10-14): its bolts are magic too, and crush shells
    const factor = resistFactor(card.defId, dmgType, attDef) * weaknessFactor(card.defId, dmgType, attDef) * defenderDamageFactor(card.defId);
    let dmg = factor===0 ? 0 : factor!==1 ? Math.max(1, Math.floor(amount*factor)) : amount; // Immune takes nothing
    { const hv = spiritHalves(card, dmgType, !!attDef); if(hv) dmg = halveTimes(Math.floor(dmg), hv); } // Ghost / Supreme / Shade (2026-10-14)
    if(card.shocked>0) dmg = Math.ceil(dmg*1.5); // Shock applies to ranged/flat hits too
    if((dmgType === 'physical' || dmgType === 'magic') && shelledByCower(card) && !crush) dmg = 0; // Cower 'shell': arrows and bolts too, not statuses
    if(card.petrified && !crush) dmg = Math.floor(dmg / 2); // Petrification (2026-10-14)
    if(!crush) dmg = spendTempHp(card, dmg);
    noteHit(card, dmg, dmgType);
    const hp0 = card.hp;
    card.hp = Math.max(0, card.hp - dmg);
    if(suddenDeath && dmg>0) card.hp = 0; // sudden death: any hit that lands kills
    if(attUid != null && hp0 > 0 && card.hp <= 0) card.killedBy = attUid; // who:'killer' (2026-10-14)
    if(dmg>0 && card.asleep>0){ card.asleep = 0; noteWoke(card); } // Asleep breaks on any flat/ranged damage too
    shellUp(card); // Shell triggers on arrows and every other hit too (2026-10-12)
    return dmg;
  }
  // Bulwark (2026-09-17): sums every live Bulwark stack on the DEFENDING side's own board —
  // "while this card is on the board, your Castle takes N less damage from every hit." Read
  // fresh every time (same convention Rally already uses for its own aura), so it's never stale
  // and never lingers once its source dies.
  function bulwarkReductionFor(pl){
    let total = 0;
    ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      if(c.hp<=0) return;
      const d = CARD_DEFS[c.defId];
      if(d.effects && d.effects.bulwark) total += d.effects.bulwark;
    }));
    return total;
  }
  // damageHQ takes the DEFENDING PLAYER (not just their hq object) so Bulwark can be applied
  // uniformly at the one place all castle damage funnels through, rather than re-deriving the
  // reduction at every call site.
  function damageHQ(pl, amount){
    if(typeof pl.onHqHit === 'function'){ const r = pl.onHqHit(amount, currentAttacker); if(typeof r === 'number') return r; }
    const crush = !!(currentAttacker && effectsOf(currentAttacker).supreme); // Supreme (2026-10-14, user: "They crush armour and ward etc.")
    if(pl.perks && pl.perks.ward && amount > 0 && !crush){ pl.perks.ward = false; return 0; } // Wildpath "Unmoving": the first castle hit is ignored
    const reduced = Math.max(0, amount - (crush ? 0 : bulwarkReductionFor(pl)));
    if(reduced > 0) pl._hqHitTurn = turnNo;
    if(isGladiator && pl.gladiatorLeaderUid!=null){
      const ld = gladiatorLeaderOf(pl);
      if(ld) ld.hp -= (suddenDeath && suddenDeathCastles && suddenDeathStage >= 2 && reduced>0) ? ld.hp : reduced;
      syncGladiatorHq(pl);
      tallyCastleDealt(pl, reduced);
      return reduced;
    }
    // Skirmish Armour (2026-10-08): a blue shield on top of the castle's Health soaks hits first.
    let toHp = reduced;
    if(pl.hq.shield > 0 && toHp > 0){ const soak = Math.min(pl.hq.shield, toHp); pl.hq.shield -= soak; toHp -= soak; }
    pl.hq.hp = Math.max(0, pl.hq.hp - toHp);
    if(suddenDeath && suddenDeathCastles && suddenDeathStage >= 2 && reduced>0){ pl.hq.hp = 0; pl.hq.shield = 0; } // sudden death II: a castle hit ends the game
    tallyCastleDealt(pl, reduced);
    return reduced;
  }
  function tallyCastleDealt(defPl, n){ const ap = curPlayers && curPlayers[defPl.id===1 ? 2 : 1]; if(ap && n > 0) ap.castleDealt = (ap.castleDealt||0) + n; }
  function pickRandomEnemyTarget(enemyPl){
    const cards = [];
    ['left','center','right'].forEach(side=> enemyPl.row[side].forEach(c=>{ if(c.hp>0 && !(targetExclude && targetExclude.has(c.uid))) cards.push(c); }));
    const pool = [...cards.map(c=>({kind:'card', card:c})), {kind:'hq'}];
    const pick = pool[Math.floor(rnd()*pool.length)];
    if(targetExclude && pick.kind==='card') targetExclude.add(pick.card.uid);
    if(pick.kind==='card'){ const sh = shieldCall(enemyPl, pick.card); if(sh) return {kind:'card', card:sh}; }
    return pick;
  }
  // Shield Call (2026-10-10, user: "a shield dog with a unique passive effect: When an ally gets targeted from a skill
  // effect, it summons a shield in that unit's place, while pushing that unit to the most nearby slot. This happens only
  // once. The shield's stats is 0/10 w/ Guardian (grows by 1 defence every level)"). Called wherever an enemy skill picks
  // a card to hit; returns the shield that now takes it, or null.
  const SHIELD_TOKEN = 'summoned-shield';
  let shieldEvents = null, shieldSideOf = null; // set by the skill resolvers for the event log
  function shieldCall(ownerPl, card){
    if(!ownerPl || !card || card.hp<=0 || card.defId===SHIELD_TOKEN || !CARD_DEFS[SHIELD_TOKEN]) return null;
    const dog = allBoardCards(ownerPl).find(c=> c.hp>0 && !c.shieldCallUsed && CARD_DEFS[c.defId] && CARD_DEFS[c.defId].effects && CARD_DEFS[c.defId].effects.shieldCall);
    if(!dog) return null;
    dog.shieldCallUsed = true;
    const shield = makeBoardCard(SHIELD_TOKEN);
    const dd = CARD_DEFS[dog.defId], lvl = Math.max(0, (Number(dd.level)||0) - (Number(dd.baseLevel)||0)); if(lvl){ shield.hp += lvl; shield.maxHp += lvl; }
    const side = ['left','center','right'].find(sd=> ownerPl.row[sd].includes(card));
    if(!side) return null;
    let toLane = side; const fromSlot = card.slot;
    if(slotMode){
      const occ = occupiedSlots(ownerPl), from = card.slot;
      let to = null; for(let d=1; d<12 && to===null; d++){ for(const sg of [1,-1]){ const sl = from + sg*d; if(!occ.has(sl)){ to = sl; break; } } }
      if(to===null) return null;
      ownerPl.row[side].splice(ownerPl.row[side].indexOf(card), 1);
      toLane = to===0 ? 'center' : (to<0 ? 'left' : 'right');
      card.slot = to; ownerPl.row[toLane].push(card);
      shield.slot = from; ownerPl.row[side].push(shield);
      syncSlots(ownerPl);
    } else {
      const arr = ownerPl.row[side];
      if(side==='center'){ arr.splice(arr.indexOf(card), 1); arr.push(shield); ownerPl.row.left.unshift(card); toLane = 'left'; }
      else arr.splice(arr.indexOf(card), 0, shield);
    }
    if(recordEvents && shieldEvents){
      const sd = shieldSideOf ? shieldSideOf(ownerPl.id) : null;
      shieldEvents.push({type:'statusFx', kind:'shieldCall', side:sd, attDefId:dog.defId, attUid:dog.uid, targetSide:sd, targetDefId:card.defId, targetUid:card.uid, shieldUid:shield.uid});
      shieldEvents.push({type:'spawn', side:sd, defId:SHIELD_TOKEN, count:1, cause:'shieldCall', uids:[shield.uid], nearUid:card.uid, lane:side, toLane, fromSlot, toSlot:card.slot, dogUid:dog.uid});
    }
    return shield;
  }
  // resolveGeneralTarget (2026-09-30): the shared resolver behind the editor's general
  // who/sub target picker (see the long comment above ACTION_DEFS in arena_app.js) — every
  // action that targets a single card (Buff, Debuff, Exile, Poison, Bleed, Expose, Stun,
  // Increase Wait, and Deal damage's non-random modes) now funnels through this one function
  // instead of each inventing its own opposite/all/left/right special-casing.
  //   who: 'self' (always resolves to the caster, never null) | 'ally' | 'enemy'
  //   sub (ally/enemy only): 'adjacent' | 'random' | 'furthest'
  //     - adjacent + enemy == the old "opposite creature" (reuses opposingCardOf, unchanged math)
  //     - adjacent + ally  == the old buffAlly left/right neighbor, merged into one option: picks
  //       whichever of the two physically-adjacent allies exists (random between them if both do)
  //     - random  == any one live card on that side, uniform pick (never includes the HQ — callers
  //       that want the HQ-inclusive "random enemy, or the castle" behavior, i.e. Deal damage and
  //       Missile, use pickRandomEnemyTarget directly instead of this function for that one mode)
  //     - furthest == new: the flank column physically opposite the caster's own for Enemy (falls
  //       back to any live enemy if that flank is empty), or the farthest-seated ally in board
  //       order for Ally
  // Returns {pl, card} or null (never null for 'self'). Never itself checks Evasion/dodge — every
  // caller below applies dodgeCheck the same way it always did, since whether a target can dodge
  // is a property of the ACTION (harmful vs. not), not of how the target was picked.
  let targetExclude = null; // multi-target actions: units already picked this firing (2026-10-12)
  // who:'any' -> 'ally' or 'enemy', weighted by how many live units each side has (never the caster itself).
  function anySide(players, playerId, boardCard){
    const live = p=> ['left','center','right'].reduce((n, s)=> n + p.row[s].filter(c=> c.hp>0 && c.uid!==boardCard.uid).length, 0);
    const a = live(players[playerId]), e = live(players[otherId(playerId)]);
    if(!a && !e) return 'enemy';
    return rnd() * (a + e) < a ? 'ally' : 'enemy';
  }
  function resolveGeneralTarget(players, playerId, boardCard, who, sub){
    const r = resolveGeneralTarget0(players, playerId, boardCard, who === 'any' ? anySide(players, playerId, boardCard) : who, sub);
    if(targetExclude && r && r.card) targetExclude.add(r.card.uid);
    return r;
  }
  let forcedTarget = null; // who:'killer' (2026-10-14): the one unit an On Death action is aimed at
  function resolveGeneralTarget0(players, playerId, boardCard, who, sub){
    const pl = players[playerId], enemy = players[otherId(playerId)];
    if(sub === 'killer') return forcedTarget && forcedTarget.hp > 0 ? {pl: who === 'ally' ? pl : enemy, card: forcedTarget} : null;
    if(who==='self') return {pl, card:boardCard};
    const isAlly = who==='ally';
    const sidePl = isAlly ? pl : enemy;
    const order = physicalRowOrder(sidePl).filter(c=>c.hp>0);
    const pool = (isAlly ? order.filter(c=>c.uid!==boardCard.uid) : order).filter(c=> !(targetExclude && targetExclude.has(c.uid)));
    if(!pool.length) return null;
    if(sub==='furthest'){
      if(isAlly){
        const fullOrder = physicalRowOrder(sidePl);
        const idx = fullOrder.findIndex(c=>c.uid===boardCard.uid);
        let best=null, bestDist=-1;
        pool.forEach(c=>{ const i2 = fullOrder.findIndex(x=>x.uid===c.uid); const d=Math.abs(i2-idx); if(d>bestDist){ bestDist=d; best=c; } });
        return best ? {pl:sidePl, card:best} : null;
      }
      const mySide = findCardSide(pl, boardCard.uid) || 'center';
      const farSide = mySide==='left' ? 'right' : (mySide==='right' ? 'left' : (rnd()<0.5?'left':'right'));
      const farPool = enemy.row[farSide].filter(c=>c.hp>0 && !(targetExclude && targetExclude.has(c.uid)));
      const finalPool = farPool.length ? farPool : pool;
      const pickF = finalPool[Math.floor(rnd()*finalPool.length)];
      { const sh = shieldCall(enemy, pickF); if(sh) return {pl:sidePl, card:sh}; }
      return {pl:sidePl, card: pickF};
    }
    if(sub==='adjacent'){
      if(isAlly){
        const fullOrder = physicalRowOrder(sidePl);
        const idx = fullOrder.findIndex(c=>c.uid===boardCard.uid);
        const cands = [fullOrder[idx-1], fullOrder[idx+1]].filter(c=>c && c.hp>0 && !(targetExclude && targetExclude.has(c.uid)));
        if(!cands.length) return null;
        return {pl:sidePl, card: cands[Math.floor(rnd()*cands.length)]};
      }
      const opp = opposingCardOf(players, playerId, boardCard);
      if(!opp) return null;
      if(targetExclude && targetExclude.has(opp.card.uid)) return null; // only one unit stands opposite
      { const sh = shieldCall(enemy, opp.card); if(sh) return {pl:enemy, card:sh}; }
      return {pl:enemy, card:opp.card};
    }
    // 'random' (and any unrecognized sub, as a safe default)
    const pickR = pool[Math.floor(rnd()*pool.length)];
    if(!isAlly){ const sh = shieldCall(enemy, pickR); if(sh) return {pl:enemy, card:sh}; }
    return {pl:sidePl, card: pickR};
  }
  // applyTargetedStatus (2026-09-30): the shared implementation behind Poison/Bleed/Expose/Stun/
  // Increase Wait's now-general who/sub targeting — these five were near-identical copies of the
  // same dodge-gated apply/dodge/all-loop shape, so it's factored out once here instead of
  // repeated five times. who:'self' always lands (never dodge-gated, same convention Buff uses);
  // Ally/Enemy is Evasion-gated exactly as these five always were. `amount`, if not null, is
  // carried onto the pushed statusFx event (Stun has none).
  function applyTargetedStatus(players, sideOf, playerId, boardCard, who, sub, amount, stats, events, mySide, statusKind, mutateFn){
    const pl = players[playerId], enemy = players[otherId(playerId)];
    bleedTick(sideOf, playerId, boardCard, stats, events, 'skill');
    const targetPid = who==='enemy' ? otherId(playerId) : playerId;
    const apply = c=>{
      mutateFn(c);
      const ev = {type:'statusFx', kind:statusKind, side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(targetPid), targetDefId:c.defId, targetUid:c.uid};
      if(amount!=null) ev.amount = amount;
      if(recordEvents && events) events.push(ev);
      if(who!=='self' && c.hp>0){ bleedTick(sideOf, targetPid, c, stats, events, 'defend'); runCustomTriggers(players, sideOf, targetPid, c, CARD_DEFS[c.defId], 'onAttacked', stats, events); }
    };
    const dodge = c=>{ if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(targetPid), targetDefId:c.defId, targetUid:c.uid}); };
    const gated = c=>{ if(who==='self' || sub==='killer' || dodgeCheck(c)) apply(c); else dodge(c); }; // the killer ate it: no dodging
    if(sub==='all' && who!=='self'){
      const sidePl = who==='ally' ? pl : enemy;
      ['left','center','right'].forEach(side=> sidePl.row[side].forEach(c=>{ if(c.hp>0) apply(c); })); // area effect: Evade only dodges single-target
      return;
    }
    const target = resolveGeneralTarget(players, playerId, boardCard, who, sub);
    if(target && target.card) gated(target.card);
  }
  function findCardSide(pl, uid){
    if(pl.row.center.some(c=>c.uid===uid)) return 'center';
    if(pl.row.left.some(c=>c.uid===uid)) return 'left';
    if(pl.row.right.some(c=>c.uid===uid)) return 'right';
    return null;
  }
  // Center is a singleton slot — anything that wants to spawn "next to" a card that
  // happens to be sitting in center (which is already occupied by that very card) falls
  // back to whichever flank currently has fewer cards, to keep the row roughly balanced.
  function flankOrShorter(pl, side){
    if(side!=='center') return side;
    return pl.row.left.length <= pl.row.right.length ? 'left' : 'right';
  }
  // Physical row order (2026-09-16, center slot): the true left-to-right order a player's
  // row renders in — left flank innermost-out reversed, then the single center card (if
  // any), then the right flank. Adjacency (Guardian, swap, etc.) is defined against THIS
  // sequence now, since the center slot sits physically between the two flanks rather than
  // belonging to either one.
  function physicalRowOrder(pl){
    if(slotMode){
      // Fixed slots: gaps are real, so they appear as hp-0 placeholders — every caller already
      // skips hp<=0 entries, which makes "adjacent" stop at a gap instead of jumping across it.
      syncSlots(pl);
      const cards = allBoardCards(pl);
      if(!cards.length) return [];
      const bySlot = new Map(cards.map(c=>[c.slot,c]));
      const lo = Math.min(...bySlot.keys()), hi = Math.max(...bySlot.keys());
      const out = [];
      for(let sl=lo; sl<=hi; sl++) out.push(bySlot.get(sl) || GAP);
      return out;
    }
    return [...pl.row.left].reverse().concat(pl.row.center, pl.row.right);
  }
  // Guardian: a card adjacent (one slot either way, physical row order) to the original
  // target takes the hit instead, if it's alive and carries effects.guardian.
  // Only ever redirects damage — spatial mechanics (sweep continuation, swipe's
  // "closest N" search) still use the ORIGINAL target's position, not the
  // guardian's, so protection doesn't also warp targeting geometry.
  function redirectToGuardian(enemyPl, card){
    const order = physicalRowOrder(enemyPl);
    const idx = order.findIndex(c=>c.uid===card.uid);
    if(idx===-1) return card;
    const neighbors = [order[idx-1], order[idx+1]].filter(Boolean);
    for(const n of neighbors){
      if(n.hp>0){
        const ndef = CARD_DEFS[n.defId];
        if(ndef && ndef.effects && ndef.effects.guardian) return n;
      }
    }
    return card;
  }
  // Evasive (2026-09-29): a card with effects.evasive gets a flat, non-stacking 1-in-2
  // chance to avoid any qualifying single-target hit aimed at it — a lane's primary melee
  // attack, Missile/ranged damage, Render, Sweep/Swipe's extra hits, and the generic
  // Poison/Expose/Stun/Debuff Attack trigger actions. Every call is an independent coin
  // flip: no cap, no alternating pattern, no per-round counter. This replaces two older,
  // more complicated mechanics that are now merged into this single one by design decision:
  // the deterministic alternating "Evasion" keyword (1st evaded, 2nd lands, 3rd evaded...,
  // skill-hits only, never primary melee) and the capped "Evade N" keyword (2026-09-14,
  // true 50/50 per attempt but only up to N successful dodges per round, any-attack
  // including melee). Call once per genuine attempt; returns true if the hit lands.
  function evasiveGate(card){
    const def = CARD_DEFS[card.defId];
    if(!(def.effects && def.effects.evasive)) return true;
    return rnd() >= 0.5;
  }
  // dodgeCheck: true = the hit lands. Evade (evasive) dodges any SINGLE-TARGET attack or ability.
  // lastMissReason (2026-10-03): which passive caused the most recent dodge — copied onto every
  // 'evaded' event so the front end can play a distinct miss animation for Evade / Swift / Flying.
  let lastMissReason = 'evasive';
  function dodgeCheck(card){
    lastMissReason = 'evasive';
    if(card && card.exposed > 0) return true; // Exposed (2026-10-15): attacks at it don't miss
    return evasiveGate(card);
  }
  // Combat dodges (2026-10-02), each an independent 1-in-2 roll, so they stack multiplicatively:
  //   Swift  — dodges combat attacks from non-Swift attackers
  //   Flying — dodges combat attacks from non-Flying attackers
  //   Evade  — dodges single-target attacks (only applied when singleTarget is true)
  // e.g. a Swift + Flying + Evade card hit by a plain attacker's normal strike: 1 - (1/2)^3 = 7/8.
  function combatHitLands(attCard, defCard, singleTarget){
    const ad = (CARD_DEFS[attCard.defId] && CARD_DEFS[attCard.defId].effects) || {};
    const dd = (CARD_DEFS[defCard.defId] && CARD_DEFS[defCard.defId].effects) || {};
    if(defCard.exposed > 0) return true; // Exposed (2026-10-15): no Evasive / Swift / Flying / Smoke / Fog / Shadow dodge
    // Fencing (2026-10-14, user: "fencing = cannot miss Evade creatures"): a precise blade isn't dodged: no Evade and no Swift roll.
    // A Flyer's dodge still applies (it is out of reach, not quick).
    if(singleTarget && dd.evasive && !ad.fencing && rnd() < 0.5){ lastMissReason = 'evasive'; return false; }
    if(dd.swift && !ad.swift && !ad.fencing && rnd() < 0.5){ lastMissReason = 'swift'; return false; }
    if(dd.flying && !ad.flying && !ad.reach && !ad.antiAir && !ad.boomerang && !ad.bananarang && rnd() < 0.5){ lastMissReason = 'flying'; return false; } // Reach (2026-10-09): ground units that can hit flyers
    // Smoke (2026-10-14, Smoke Bomb): an ally hidden in smoke makes attacks at it miss 1 in 2 until the end of the next round.
    if(defCard.smoke > 0 && rnd() < 0.5){ lastMissReason = 'smoke'; return false; }
    // Illusory (raid bosses only): dodges this share of combat attacks, e.g. 0.667 = 2 in 3.
    if(dd.illusory && rnd() < dd.illusory){ lastMissReason = 'illusory'; return false; }
    // Keen Sense (2026-10-14): it smells out a grounded target: Thick Fog and Shadow don't make it miss one.
    const keenNose = !!ad.keenSense && !dd.flying;
    if(!keenNose && fogMiss(attCard)){ lastMissReason = 'fog'; return false; } // Thick Fog field (2026-10-09)
    // Shadow (2026-10-14, user: "Effects like Shade and Ghost and Shadow"): at night or in darkness, attacks at it miss 1 in 2.
    // Magic always finds it.
    if(!keenNose && dd.shadow && darkNow() && attackDmgType(CARD_DEFS[attCard.defId]) !== 'magic' && rnd() < 0.5){ lastMissReason = 'shadow'; return false; }
    return true;
  }
  // Rally N (anthem, item #14): "While this unit is on the field, all your units get +N/+0."
  // Recomputed fresh every round (see resolveCombat) rather than folded into .atk permanently,
  // so it never lingers after its source leaves the field, and never collides with the
  // pre-existing quirk where the generic buffAttack action mutates .atk without touching
  // .baseAtk. Multiple Rally sources stack (sum of every live source's N); it also boosts the
  // Rally card itself, matching "all your units."
  function computeRallyBonuses(players){
    [players[1], players[2]].forEach(pl=>{
      let total = 0;
      ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
        if(c.hp<=0) return;
        const d = CARD_DEFS[c.defId];
        if(d.effects && d.effects.rally) total += d.effects.rally;
      }));
      ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ c.rallyBonus = total; }));
      // Nature's Force N (2026-10-12, user: "All elementals on the field gain +N/+N. (Stacks!)"): every live source on your side adds
      // N to each of your Elementals (the source too, if it is one). Attack is live (natureBonus, read by effAtk); Health is
      // applied as a difference so it rises and falls with the sources without healing past it or killing anything.
      let nf = 0; ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ if(c.hp<=0) return; const d = CARD_DEFS[c.defId]; if(d && d.effects && d.effects.natureForce) nf += (d.effects.natureForce === true ? 1 : Number(d.effects.natureForce)||0); }));
      ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ if(c.hp<=0) return; const d = CARD_DEFS[c.defId] || {};
        const elem = (d.species||[]).includes('Elemental') || (d.archetypes||[]).includes('Elemental'); const want = elem ? nf : 0;
        c.natureBonus = want; const had = c.natureHp || 0, delta = want - had; if(delta){ c.maxHp = Math.max(1, (c.maxHp||c.hp) + delta); c.hp = Math.max(1, Math.min(c.maxHp, c.hp + delta)); c.natureHp = want; } }));
      // Kinship <Type> X/Y (2026-10-13, user: "New Passive: ____ <Type> X/Y: All ally units of that Type gain +X/+Y"): every live
      // source on your side gives +X/+Y to each of your units of that Type (itself too, if it is one). Stacks. Health moves as a
      // difference, like Nature's Force.
      { const kin = {}; ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ if(c.hp<=0) return; const k = ((CARD_DEFS[c.defId]||{}).effects||{}).kinship;
          if(k && k.type){ const t = kin[k.type] || (kin[k.type] = [0,0]); t[0] += Number(k.atk)||0; t[1] += Number(k.hp)||0; } }));
        ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ if(c.hp<=0) return; const d = CARD_DEFS[c.defId] || {};
          let a = 0, h = 0; Object.keys(kin).forEach(t=>{ if((d.archetypes||[]).includes(t) || (d.species||[]).includes(t)){ a += kin[t][0]; h += kin[t][1]; } });
          c.kinBonus = a; const had = c.kinHp || 0, dl = h - had; if(dl){ c.maxHp = Math.max(1, (c.maxHp||c.hp) + dl); c.hp = Math.max(1, Math.min(c.maxHp, c.hp + dl)); c.kinHp = h; } })); }
      // Lone Wolf X/Y and Sociable X/Y (2026-10-13, user: "Sociable likes being crowded (up to 4, 2 on each side) While Lone Wolf
      // likes being alone, separated by 2 squares on each side ... +X/+Y per slot freed up or not. If all 4 freed up, ANOTHER
      // +X/+Y"): counts the 4 slots within 2 of it. Lone Wolf: +X/+Y per empty one (+1 more step when all 4 are); Sociable: per
      // filled one (+1 more when all 4 are). Off the edge of the board counts as empty. Health moves as a difference, like Nature's Force.
      { const live = ['left','center','right'].flatMap(side=> pl.row[side]).filter(c=> c && c.hp > 0 && !c.gap);
        let posOf;
        if(slotMode){ syncSlots(pl); posOf = c=> c.slot; } else { const order = physicalRowOrder(pl); posOf = c=> order.indexOf(c); }
        const taken = new Set(live.map(posOf));
        live.forEach(c=>{ const e = (CARD_DEFS[c.defId]||{}).effects || {};
          const pv = v=> Array.isArray(v) ? [Number(v[0])||0, Number(v[1])||0] : (v === true ? [1,1] : [Number(v)||0, Number(v)||0]);
          let a = 0, h = 0; const p = posOf(c), near = [p-2, p-1, p+1, p+2];
          if(e.loneWolf){ const [x, y] = pv(e.loneWolf); const n = near.filter(q=> !taken.has(q)).length, steps = n + (n === 4 ? 1 : 0); a += x*steps; h += y*steps; }
          if(e.sociable){ const [x, y] = pv(e.sociable); const n = near.filter(q=> taken.has(q)).length, steps = n + (n === 4 ? 1 : 0); a += x*steps; h += y*steps; }
          c.packBonus = a; const had = c.packHp || 0, d = h - had; if(d){ c.maxHp = Math.max(1, (c.maxHp||c.hp) + d); c.hp = Math.max(1, Math.min(c.maxHp, c.hp + d)); c.packHp = h; } }); }
      // Worship (Ecclesia, 2026-10-10): +1 Attack for every 3 Prayer its owner has, recomputed every round.
      const pr = prayerOf(pl);
      ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ const d = CARD_DEFS[c.defId]; c.worshipBonus = (d && d.effects && d.effects.worship) ? Math.floor(pr / 3) : 0; }));
    });
  }
  // Effective Attack: base Attack (already includes any permanent buffs, Render debuffs, etc.)
  // plus this round's live Rally aura bonus. Combat should read through this, not card.atk
  // directly, so Rally is always live and never stale, and never goes negative.
  // Corrode (status, 2026-09-17): stacking, like Poison/Bleed, but instead of a damage tick it
  // temporarily saps effective Attack — one point per stack, recomputed live here (so it's
  // never baked into .atk permanently, same convention Rally already uses) and decayed by 1
  // stack per round in endOfRoundUpkeep.
  // Daunt N (2026-10-12, user: "New passive. ____ N: On Hit, reduce its attack by N until end of next turn. If this happens
  // multiple times, his attack is reduced by N multiple times"): each landed hit leaves a {n, until} mark on the target; the
  // marks add up, and each lifts at the end of the round after the one it landed in.
  function dauntOf(card){ const d = card && card.daunts; if(!d || !d.length) return 0; let t = 0; for(const x of d) if(x.until >= combatNo) t += x.n; return t; }
  function effAtk(card){
    const base = Math.max(0, (card.atk||0) + (card.rallyBonus||0) + (card.worshipBonus||0) + (card.natureBonus||0) + (card.packBonus||0) + (card.kinBonus||0) - (card.corrode||0) - dauntOf(card));
    // Stagger (2026-09-24): applied as a final multiplier on top of Corrode, same relationship
    // Shock's 1.5x has to computeHitDamage's own base-damage calc — floor (not round/ceil) so a
    // staggered hit always rounds toward the weaker outcome, never back up to its pre-stagger value.
    return (card.staggered>0) ? Math.floor(base*0.5) : base;
  }
  // Bleed (item #12): unlike Poison (a once-per-round upkeep tick), a Bled unit takes damage
  // equal to its own current stack every time it performs an attack, defends against one, or
  // casts a skill — "every skill, attack, and defend it does." Flat, no resist/armor pipeline,
  // mirroring Poison's own tick (see applyPoisonTicks / damageCardFlat).
  // Heal (2026-10-10, user: "Heal N heals for N health. But if they have bleed counters - it removes them instead (if
  // there's extra heal left over, it goes to health)"). Every explicit heal (the Heal action, Regeneration, Bloom,
  // Spring Rain) goes through here. Returns the HP actually restored.
  function applyHeal(card, amount, side, events){
    let n = Math.max(0, amount|0); if(!card || card.hp<=0 || !n) return 0;
    if(card.wither > 0) return 0; // Wither (2026-10-14): nothing heals a withering unit
    const stanch = Math.min(n, card.bleed|0);
    if(stanch > 0){ card.bleed -= stanch; n -= stanch; if(recordEvents && events) events.push({type:'statusFx', kind:'stanch', side, attDefId:card.defId, attUid:card.uid, targetSide:side, targetDefId:card.defId, targetUid:card.uid, amount:stanch}); }
    const healed = Math.min(card.maxHp - card.hp, n); if(healed > 0) card.hp += healed;
    return healed;
  }
  function cleanseCounters(players, pid, c, budget){
    let n = budget|0, removed = 0;
    const take = (k)=>{ if(n<=0 || !(c[k]>0)) return; const d = Math.min(n, c[k]|0); c[k] -= d; n -= d; removed += d; };
    // a curse on the cell it stands on (Desecrate) comes off first
    const cell = cellKeyOf(players, pid, c);
    if(cell && curses[cell] > 0 && n > 0){ const d = Math.min(n, curses[cell]); curses[cell] -= d; n -= d; removed += d; if(!curses[cell]) delete curses[cell]; }
    ['poison','bleed','decay','corrode','scar','exposed','shocked'].forEach(take);
    ['stunned','frozen','asleep','paralyzed','blind','staggered'].forEach(k=>{ if(n>0 && c[k]){ c[k] = typeof c[k]==='number' ? Math.max(0, c[k]-1) : false; n--; removed++; } });
    return removed;
  }
  function bleedTick(sideOf, ownerId, card, stats, events, cause){
    ghostBleedClamp(card); // a Ghost only bleeds what Ichor gave it (2026-10-14)
    if(!card || card.hp<=0 || !(card.bleed>0)) return;
    // 2026-10-10 (user: "Cards with wait shouldn't trigger bleed on themselves. (They can't act!)"): a unit still
    // under Wait doesn't bleed from its own skills or attacks; it still bleeds when it's hit ('defend').
    if((cause==='skill' || cause==='attack') && (card.wait||0) > 0) return;
    // 2026-10-10 (user: "Bled cards take damage on any action or skill they perform. Bleed & Poison decreases by 1
    // everytime their hurt activates"): no bleed from being hit any more, and each bleed lowers the stack by 1 — unless
    // a Festering unit is on the field (statusDecayHeld).
    if(cause==='defend') return;
    const dmg = damageCardFlat(card, card.bleed, 'bleed');
    ensureStat(stats, sideOf(ownerId), card.defId).taken += dmg;
    const decay = !statusDecayHeld() && card.bleed > 0;
    if(decay) card.bleed -= 1;
    if(card.ichorBleed > card.bleed) card.ichorBleed = card.bleed;
    if(recordEvents && events) events.push({type:'bleedTick', side:sideOf(ownerId), defId:card.defId, uid:card.uid, dmg, cause, decay});
  }
  // Festering (2026-10-10, user: "a new global effect skill - this passive makes it such that all units on the field do
  // not remove their status counters naturally when they trigger - bleed & poison only, for now"): while any live unit
  // with effects.festering is on either side, Bleed and Poison stacks don't wear down.
  function statusDecayHeld(){
    const P = curPlayers; if(!P) return false;
    return [1,2].some(pid=> P[pid] && P[pid].row && [...P[pid].row.left, ...P[pid].row.center, ...P[pid].row.right].some(c=> c && !c.gap && c.hp > 0 && CARD_DEFS[c.defId] && CARD_DEFS[c.defId].effects && CARD_DEFS[c.defId].effects.festering));
  }
  // Elemental status effects (2026-09-16) — Frozen (cold), Asleep (poison, "Sleeping" flavor),
  // Paralyzed (acid), and a passive chance-based Stun (heat), one per non-physical DMG_TYPE.
  // Each is a chance-on-hit application (attDef.effects.<key> = {chance, duration}, or a bare
  // number for stunOnHit's chance-only shape) rolled through the SAME rnd() every other proc in
  // this file uses (Crit/Evade/Swap...), so it shares their fairness guarantees for free — see
  // test_v18_status.js for the statistical-bias check this earns.
  //   - Frozen / Asleep: flat "skip this round's action" for `duration` rounds, ticked down in
  //     endOfRoundUpkeep exactly like Stun's existing single-round clear. Asleep additionally
  //     breaks the INSTANT the card takes any real damage (see damageCard/damageCardFlat above).
  //   - Paralyzed: does NOT flatly skip — instead it re-rolls a fresh 50/50 coin flip every
  //     round it's active (see gatherAttackers), classic paralysis, while still ticking its
  //     own duration down regardless of that round's flip result.
  //   - Stun (on hit): reuses the pre-existing single-round `card.stunned` flag/clear cycle
  //     verbatim — this just gives it a second, passive, chance-based on-hit source alongside
  //     its original custom-trigger-action source.
  function rollStatusOnHit(kind, cfg, defCard, mySide, attCard, sideOfFn, enemyId, events){
    if(!cfg || !defCard || defCard.hp<=0) return;
    if(attCard && attCard.confused>0 && rnd() < 0.5){ if(recordEvents && events) events.push({type:'confusedWhiff', side:mySide, defId:attCard.defId, uid:attCard.uid, what:kind}); return; } // Confused: on-hit skills fizzle half the time
    const chance = (typeof cfg==='object') ? Number(cfg.chance)||0 : Number(cfg)||0;
    const duration = (typeof cfg==='object') ? Math.max(1, Number(cfg.duration)||1) : 1;
    if(chance<=0 || rnd()>=(chance/100)) return;
    if(kind==='freeze'){ defCard.frozen = Math.max(defCard.frozen||0, duration); defCard._frozenJustSet = true; }
    else if(kind==='sleep'){ defCard.asleep = Math.max(defCard.asleep||0, duration); defCard._asleepJustSet = true; }
    else if(kind==='paralyze'){ defCard.paralyzed = Math.max(defCard.paralyzed||0, duration); defCard._paralyzedJustSet = true; }
    else if(kind==='stunOnHit'){ defCard.stunned = (defCard.stunned|0) + 1; defCard._stunnedJustSet = true; }
    else if(kind==='blind'){ if(effectsOf(defCard).keenSense) return; defCard.blind = Math.max(defCard.blind||0, duration); defCard._blindJustSet = true; } // Keen Sense: never Blind
    else if(kind==='tipsy'){ defCard.tipsy = Math.max(defCard.tipsy||0, duration); defCard._tipsyJustSet = true; }
    else if(kind==='confuse'){ defCard.confused = Math.max(defCard.confused||0, duration); defCard._confusedJustSet = true; }
    else if(kind==='shock'){ defCard.shocked = Math.max(defCard.shocked||0, duration); defCard._shockedJustSet = true; }
    else if(kind==='stagger'){ defCard.staggered = Math.max(defCard.staggered||0, duration); defCard._staggeredJustSet = true; }
    else return;
    if(recordEvents && events) events.push({type:'statusFx', kind, side:mySide, attDefId:attCard.defId, attUid:attCard.uid, targetSide:sideOfFn(enemyId), targetDefId:defCard.defId, targetUid:defCard.uid});
  }
  // Column alignment (changed 2026-09-13, per explicit user request: "make sure to
  // align the cards... columns always align"). Both players now use the SAME column
  // numbering (no per-player offset), so P1's left[i] is always directly opposite
  // P2's left[i], and P1's right[i] directly opposite P2's right[i] — expanding a
  // lane on one side lines up with the matching lane slot on the other, always.
  // Previously player 2 was offset by 1 column, which meant one flank always faced
  // the enemy HQ directly while the other flank was misaligned by one card — a real,
  // reported source of confusion (verified as the cause of the ~58-65% Side-B win
  // skew noted throughout game-design.md). With symmetric columns that skew is gone:
  // an "extra" card in a longer lane now falls through to the enemy HQ via the
  // existing resolveLiveTarget() search, same mechanism as before, just symmetric now.
  //
  // Center slot (2026-09-16): column 0 is now a real, single combat slot of its own — the
  // first card either player plays (and any card played while the center is empty, e.g.
  // after the centered card dies) always lands here, rather than in the left/right flanks.
  // It faces the enemy's own center card directly, same as any other lane; its "dir" is 0
  // (neither strictly left nor right), which resolveLiveTarget below treats as "search both
  // flanks for the nearest live target" if its direct opposite is gone. The HQ is no longer
  // an explicit map entry at all — it's simply what a search returns once every column in
  // range comes up empty (see resolveLiveTarget's fallback).
  function combatColumnsOf(pl){
    const map = {};
    // 2026-09-20 hardening (audited while investigating "the battle log is missing some of the
    // attack transactions"): center is meant to be a strict one-card singleton — placeCard and
    // the collapse-in refill both guard against pushing a second card into it, so in every path
    // reachable today this forEach only ever runs once. But it silently OVERWRITES map[0] on
    // each iteration rather than erroring, so if that invariant were ever violated by some future
    // code path, every center card but the last would vanish from combat entirely: never gathered
    // as an attacker, never targetable, and — since nothing else references it either — never
    // logged anywhere, exactly the "an attack just disappears with no trace" failure mode this
    // bug report described. Asserting here means a future violation fails loudly during
    // development instead of quietly eating a card.
    if(slotMode){
      syncSlots(pl);
      allBoardCards(pl).forEach(c=>{ map[c.slot] = {kind:'card', card:c, dir: c.slot<0 ? 1 : (c.slot>0 ? -1 : 0)}; });
      return map;
    }
    if(pl.row.center.length>1) throw new Error('combatColumnsOf: row.center held '+pl.row.center.length+' cards — it must never hold more than 1 (see placeCard\'s auto-center-if-empty rule and the collapse-in refill guard)');
    pl.row.center.forEach(c=>{ map[0] = {kind:'card', card:c, dir:0}; });
    pl.row.left.forEach((c,i)=>{ map[-(i+1)] = {kind:'card', card:c, dir:1}; });
    pl.row.right.forEach((c,i)=>{ map[(i+1)] = {kind:'card', card:c, dir:-1}; });
    return map;
  }
  // Rank-interlock facing rule (2026-09-17, replaces the strict same-column-index rule above,
  // per explicit request: "every card should have 0, 1 card or 2 cards facing it. If there are
  // 2 cards, it can either attack the Left or the Right card. If 1 card, there's a 1/2 chance to
  // hit the castle, 1/2 chance to hit the unit in front. If 0, hit the castle." — NOTE this
  // original "1 card = 50/50" spec was superseded twice since: first (2026-09-22) to "not a true
  // blocker, always castle," then (2026-09-29) to the opposite, "always a real blocker, never the
  // castle" — see resolveLiveTarget's own 2026-09-29 comment below for why. Follow-up
  // clarified the geometry with a "teeth" analogy: whether two ranks (each side's whole row,
  // left-to-right) line up card-for-card or interlock depends on PARITY — "if both are even or
  // both are odd, they match. but they don't match if one side is even, one side is odd... if
  // one rank has 4 units, the other has 3, they are bound to interlock instead of face-to-face
  // like teeth."
  //
  // The old rule matched by raw column VALUE (each side numbers its own columns independently
  // out from its own center — see combatColumnsOf), which quietly broke down whenever the two
  // sides split their cards differently between left/center/right even with equal totals (a left
  // flank of 3 doesn't line up with an enemy left flank of 1, even if both sides have 5 cards
  // total). The new rule instead centers each side's WHOLE row as one unit — position
  // pS(i) = i - (n+1)/2 for the i-th card counting left-to-right across the entire row (n = that
  // side's live card count) — and finds whichever enemy position(s) are physically closest. Do
  // the algebra once: if my card is the i-th of my nS-card row, and the enemy has nE cards, the
  // "equivalent enemy slot" is jf = i + (nE-nS)/2. When nS and nE share parity, nE-nS is even, so
  // jf lands on a whole slot — one direct opponent (or none, if jf falls outside 1..nE — straight
  // to the castle, same as before). When parity differs, jf lands exactly BETWEEN two slots
  // (floor(jf) and ceil(jf)) — that's the interlock: this card faces both of the straddled
  // enemies (2 facing, 50/50 pick), or just one if only one of the two is a real slot (1 facing,
  // 50/50 vs the castle), or the castle outright if neither exists (0 facing).
  //
  // `myCols`/`enemyCols` are this round's LIVE column maps (see liveColOf's comment on why these
  // are recomputed fresh every attacker's turn rather than snapshotted at round start); `myCol`
  // is this attacker's own current column value within myCols.
  function resolveLiveTarget(myCols, enemyCols, myCol){
    if(slotMode){
      const e = enemyCols[myCol];
      if(e && e.kind==='card' && e.card.hp>0){ e.col = myCol; return e; }
      return {kind:'hq'}; // empty column opposite: castle (Gladiator: routed into the enemy leader by damageHQ)
    }
    const myKeys = Object.keys(myCols).map(Number).sort((a,b)=>a-b);
    const enemyKeys = Object.keys(enemyCols).map(Number).sort((a,b)=>a-b);
    const i = myKeys.indexOf(myCol) + 1; // 1-indexed position, left to right across my whole row
    const nS = myKeys.length, nE = enemyKeys.length;
    if(i<=0 || nE===0) return {kind:'hq'};
    const jf = i + (nE - nS) / 2;
    function slotAt(j){
      if(j<1 || j>nE) return null;
      const col = enemyKeys[j-1];
      const entry = enemyCols[col];
      if(entry && entry.kind==='card' && entry.card.hp>0){ entry.col = col; return entry; }
      return null;
    }
    if(Number.isInteger(jf)) return slotAt(jf) || {kind:'hq'};
    const lo = slotAt(Math.floor(jf)), hi = slotAt(Math.ceil(jf));
    if(lo && hi) return rnd()<0.5 ? lo : hi;           // 2 facing: a genuine straddle on both sides -- still a real block, 50/50 Left or Right
    // 2026-09-29 (explicit "major rule change": "there's a weird auto balancing effect when one
    // side is winning... As long there's units in front of them (offset by 1/2 counts now), hit
    // them 100%. Only hit the castle if nothing in front of you."): this REPLACES the 2026-09-22
    // rule that used to live here, which sent a single off-center (half-slot-offset) neighbor's
    // attacker straight to the castle every time, treating it as "not a true blocker." That rule
    // is exactly what produced the reported auto-balancing effect: whichever side had fewer live
    // cards ended up with its excess attackers permanently bypassing the opposing row and chipping
    // the castle for free, which self-corrects a losing side's board deficit into castle damage
    // instead of punishing it. The new rule: a single half-offset neighbor now counts as a real
    // block too -- if lo or hi exists at all, hit it, 100% of the time, no coin flip. The castle
    // is only ever hit when NEITHER exists, i.e. there is genuinely nothing in front of this
    // attacker on the opposing row.
    if(lo || hi) return lo || hi;                      // 1 facing: a single-sided blocker now counts as a real block -- hit it, always
    return {kind:'hq'};                                // 0 facing: nothing at all in front -- straight to the castle
  }
  // Prong lanes (2026-10-12, user: "i played my octopus with fork. When an ally killed an enemy unit and their ranks
  // collapsed, the octopus still hit the enemy it would have hit if the ranks didnt collapse... so it hit an enemy 1.5 units
  // away!"): side strikes are measured from where the attacker physically stands (the same jf as resolveLiveTarget), not
  // from the column of whatever it hit. Facing a unit square on, the prongs are the slots either side of it. Standing between
  // two enemies (ranks interlocked after a collapse), the prongs are those two, never the one beyond. Each lane is an enemy
  // column value, or null for an empty lane (off the end of the row).
  function prongLanes(myCols, enemyCols, myCol){
    if(slotMode) return {integer:true, left:myCol - 1, right:myCol + 1, near:[myCol - 1, myCol + 1], dist:c=> Math.abs(c - myCol)};
    const myKeys = Object.keys(myCols).map(Number).sort((a,b)=>a-b);
    const enemyKeys = Object.keys(enemyCols).map(Number).sort((a,b)=>a-b);
    const i = myKeys.indexOf(myCol) + 1, nS = myKeys.length, nE = enemyKeys.length;
    const jf = i + (nE - nS) / 2;
    const colAt = j=> (j >= 1 && j <= nE) ? enemyKeys[j-1] : null;
    const dist = c=> { const j = enemyKeys.indexOf(c) + 1; return j > 0 ? Math.abs(j - jf) : 99; };
    if(Number.isInteger(jf)) return {integer:true, left:colAt(jf - 1), right:colAt(jf + 1), near:[colAt(jf - 1), colAt(jf + 1)], dist};
    return {integer:false, left:colAt(Math.floor(jf)), right:colAt(Math.ceil(jf)), near:[colAt(Math.floor(jf)), colAt(Math.ceil(jf))], dist};
  }
  // Live combat reflow (2026-09-17, per explicit request: "collapse should happen immediately
  // as the fight goes on... will cause attacks to maybe not hit their intended targets"):
  // finds THIS attacker's actual current column/facing on its own board, right now — not the
  // column it happened to be gathered at when the round started. Once resolveCombat starts
  // cleaning up deaths (and collapsing survivors toward the gap) after every single attacker's
  // turn instead of once at the round's end, an attacker further down the queue may have
  // physically shifted column by the time its own turn comes up (its neighbor died and it fell
  // toward center, or the center itself got refilled from its flank). Returns null in the
  // (should-be-impossible) case this attacker's uid isn't found anywhere on its own board —
  // callers treat that as "nothing to do," same as if it had already died.
  function liveColOf(pl, uid){
    const cols = combatColumnsOf(pl);
    for(const colStr of Object.keys(cols)){
      const entry = cols[colStr];
      if(entry.kind==='card' && entry.card.uid===uid) return {col:Number(colStr), dir:entry.dir};
    }
    return null;
  }
  // Shared world position (2026-09-22, per explicit design spec: "we try to maintain a slot by
  // slot, left to right, turn order" across BOTH sides at once, not each side's own independently
  // -numbered columns) — reuses the exact same rank-centering math resolveLiveTarget/
  // opposingCardOf already use for TARGETING (pS(i) = i - n/2, matching the interlock "teeth"
  // geometry described there: when both sides share the same total-card parity, equal positions
  // land on whole numbers — a genuine face-off; when parity differs, they land a half-slot apart —
  // the interlocking case, neither side's card ever exactly facing the other). Applying that same
  // math to ORDER (not just who-attacks-whom) puts every live card on one shared number line where
  // "sort ascending" really does mean the true left-to-right sweep across the whole battlefield,
  // not just within one side's own row — see resolveCombat's pickNextAttacker for why this has to
  // be a fresh, live lookup every time it's called, never a frozen snapshot, exactly like
  // liveColOf just above (a kill or a mid-round spawn can change n, which shifts every remaining
  // card's shared position, not just the ones that physically moved column).
  function liveSharedPos(pl, uid){
    if(slotMode){ syncSlots(pl); const c = allBoardCards(pl).find(x=>x.uid===uid); return c ? c.slot : null; }
    const cols = combatColumnsOf(pl);
    const keys = Object.keys(cols).map(Number).sort((a,b)=>a-b);
    let col = null;
    for(const k of keys){ if(cols[k].kind==='card' && cols[k].card.uid===uid){ col = k; break; } }
    if(col===null) return null;
    const i = keys.indexOf(col) + 1, n = keys.length;
    return i - n/2;
  }
  // The card directly in front of a column: same slot (Open/slot battles), or the whole-slot facing of the rank-interlock
  // rule (an interlocked half-offset neighbour is not "directly" in front).
  function directFrontOf(myCols, enemyCols, myCol){
    if(slotMode){ const e = enemyCols[myCol]; return (e && e.kind==='card' && e.card.hp>0) ? e.card : null; }
    const myKeys = Object.keys(myCols).map(Number).sort((a,b)=>a-b), enemyKeys = Object.keys(enemyCols).map(Number).sort((a,b)=>a-b);
    const i = myKeys.indexOf(myCol) + 1, jf = i + (enemyKeys.length - myKeys.length)/2;
    if(i<=0 || !Number.isInteger(jf) || jf<1 || jf>enemyKeys.length) return null;
    const e = enemyCols[enemyKeys[jf-1]]; return (e && e.kind==='card' && e.card.hp>0) ? e.card : null;
  }
  // Nearest living enemy unit on the shared left-to-right line (ties: random). {entry, direct} or null.
  function nearestEnemyCard(players, myId, card, myCols, enemyCols, myCol){
    const front = directFrontOf(myCols, enemyCols, myCol);
    const colOf = c=>{ for(const k of Object.keys(enemyCols)){ const e = enemyCols[k]; if(e.kind==='card' && e.card===c){ e.col = Number(k); return e; } } return null; };
    if(front){ const e = colOf(front); if(e) return {entry:e, direct:true}; }
    const enemyId = otherId(myId), me = liveSharedPos(players[myId], card.uid);
    if(me===null) return null;
    let best = [], bestD = Infinity;
    Object.keys(enemyCols).forEach(k=>{ const e = enemyCols[k]; if(e.kind!=='card' || e.card.hp<=0) return;
      const p = liveSharedPos(players[enemyId], e.card.uid); if(p===null) return; const d = Math.abs(p - me);
      if(d < bestD - 1e-9){ bestD = d; best = [k]; } else if(Math.abs(d - bestD) < 1e-9) best.push(k); });
    if(!best.length) return null;
    const k = best[Math.floor(rnd()*best.length)], e = enemyCols[k]; e.col = Number(k);
    return {entry:e, direct:false};
  }
  function findNextLiveCardBeyond(enemyCols, fromCol, dir){
    const cols = Object.keys(enemyCols).map(Number).filter(c => dir===0 ? c!==fromCol : (dir<0 ? c<fromCol : c>fromCol));
    cols.sort((a,b)=> Math.abs(a-fromCol)-Math.abs(b-fromCol));
    for(const c of cols){
      const entry = enemyCols[c];
      if(entry.kind==='card' && entry.card.hp>0){ entry.col = c; return entry; }
    }
    return null;
  }
  // Swipe's targeting (2026-09-21 redesign, see the full write-up at the Swipe hit-resolution
  // block below) no longer needs a helper here — it reads liveEnemyCols[target.col-1] and
  // [target.col+1] directly, the same map every other targeting path already uses. The two
  // helpers that used to live here (`findClosestLiveCards`, a plain closest-N-by-distance pick,
  // and `findSwipeTargets`, its 2026-09-19 alternating-flank replacement) are retired along with
  // the old "Swipe hits N total enemies" number-parameter mechanic — see
  // `game-design-action-items.md`'s batch #10 entry for why: distance-based picking could reach
  // anywhere on the board and never touched the castle, which is a different mechanic from the
  // current "hit the two columns flanking your target, redirecting an empty flank to the castle"
  // definition.
  // Non-combat "who's opposite me" lookup (reflect/copy-style triggers, not the attack-resolution
  // path above) — kept single-valued and deterministic rather than coin-flipping, using the same
  // rank-interlock math as resolveLiveTarget: on an interlocked (parity-mismatched) board, this
  // picks the left-hand of the two straddled enemies as a stable convention.
  // Spiteful N (2026-10-11, user: "Deals N damage to any source that deals damage to this unit"): melee, ranged and skill
  // damage from an enemy unit all count; the spite itself is flat and never sets off another Spiteful.
  function applySpite(players, sideOf, victimOwnerId, victim, src, dmg, stats, events, killCredit){
    if(!victim || !src || src === victim || !(dmg > 0) || !(src.hp > 0)) return;
    const vd = CARD_DEFS[victim.defId], n = vd && vd.effects && Number(vd.effects.spiteful);
    if(!(n > 0)) return;
    const d = damageCardFlat(src, n, 'physical', victim.defId);
    if(stats){ ensureStat(stats, sideOf(victimOwnerId), victim.defId).dealt += d; }
    if(recordEvents && events) events.push({type:'statusFx', kind:'spite', side:sideOf(victimOwnerId), attDefId:victim.defId, attUid:victim.uid, targetSide:sideOf(otherId(victimOwnerId)), targetDefId:src.defId, targetUid:src.uid, amount:d});
    if(src.hp <= 0 && killCredit){ killCredit[src.uid] = killCredit[src.uid] || new Set(); killCredit[src.uid].add(statKey(sideOf(victimOwnerId), victim.defId)); }
  }
  // Counterattack: when a ready Counterattack unit is hit by an enemy unit and survives, it strikes the enemy unit in front
  // of it once (its Attack, through the normal damage pipeline). A counterattack never sets off another counterattack.
  function counterStrike(players, sideOf, ownerId, card, stats, events, killCredit){
    const cd = CARD_DEFS[card.defId];
    if(!cd || !cd.effects || !cd.effects.counterattack || card.hp <= 0 || card.wait > 0 || card.stunned || card.frozen > 0 || card.asleep > 0) return;
    const opp = opposingCardOf(players, ownerId, card); if(!opp || !opp.card || opp.card.hp <= 0) return;
    const amt = effAtk(card); if(!(amt > 0)) return;
    const r = damageCard(opp.card, amt, cd.dmgType || 'physical', card);
    ensureStat(stats, sideOf(ownerId), card.defId).dealt += r.dmg; ensureStat(stats, sideOf(otherId(ownerId)), opp.card.defId).taken += r.dmg;
    if(recordEvents && events){ events.push({type:'hit', side:sideOf(ownerId), attDefId:card.defId, attUid:card.uid, targetSide:sideOf(otherId(ownerId)), targetDefId:opp.card.defId, targetUid:opp.card.uid, dmg:r.dmg, dmgType:cd.dmgType || 'physical', armorBlocked:r.armorBlocked, counter:true});
      events.push({type:'statusFx', kind:'counter', side:sideOf(ownerId), attDefId:card.defId, attUid:card.uid, targetSide:sideOf(otherId(ownerId)), targetDefId:opp.card.defId, targetUid:opp.card.uid, amount:r.dmg}); }
    if(opp.card.hp <= 0 && killCredit){ killCredit[opp.card.uid] = killCredit[opp.card.uid] || new Set(); killCredit[opp.card.uid].add(statKey(sideOf(ownerId), card.defId)); }
  }
  function opposingCardOf(players, ownerId, boardCard){
    if(slotMode){
      syncSlots(players[ownerId]);
      const enemy = players[otherId(ownerId)];
      const e = combatColumnsOf(enemy)[boardCard.slot];
      return (e && e.card.hp>0) ? {pl:enemy, card:e.card} : null;
    }
    const ownerSideKey = findCardSide(players[ownerId], boardCard.uid);
    if(!ownerSideKey) return null;
    const ownCols = combatColumnsOf(players[ownerId]);
    const ownKeys = Object.keys(ownCols).map(Number).sort((a,b)=>a-b);
    let myCol = null;
    Object.keys(ownCols).forEach(cStr=>{ const e = ownCols[cStr]; if(e.kind==='card' && e.card.uid===boardCard.uid) myCol = Number(cStr); });
    if(myCol===null) return null;
    const i = ownKeys.indexOf(myCol) + 1, nS = ownKeys.length;
    const enemy = players[otherId(ownerId)];
    const enemyCols = combatColumnsOf(enemy);
    const enemyKeys = Object.keys(enemyCols).map(Number).sort((a,b)=>a-b);
    const nE = enemyKeys.length;
    if(i<=0 || nE===0) return null;
    const jf = i + (nE - nS) / 2;
    // Matching parity: jf is already a whole slot, same as resolveLiveTarget's integer case.
    // Interlocked (parity differs): jf sits between two slots — try the lower (left-hand) one
    // first for a stable, non-random convention, but fall back to the upper one if the lower
    // is out of range, rather than giving up entirely the way a bare floor() would at either
    // edge of an uneven rank (see test_evasion.js's Render-vs-Evasion case for why the fallback
    // matters: a 2-card rank facing a 1-card rank has its attacker's floor land on slot 0,
    // invalid, when the ceil (slot 1) is the enemy's only real card).
    const candidates = Number.isInteger(jf) ? [jf] : [Math.floor(jf), Math.ceil(jf)];
    for(const j of candidates){
      if(j<1 || j>nE) continue;
      const col = enemyKeys[j-1];
      const direct = enemyCols[col];
      if(direct && direct.kind==='card' && direct.card.hp>0) return {pl:enemy, card:direct.card};
    }
    return null;
  }

  // ---- cost checks (gold + grace + exile) ----
  function canAffordExile(pl, exileCost, excludeUid){
    if(!exileCost || !exileCost.count) return true;
    const zoneArr = exileCost.zone==='graveyard' ? pl.graveyard : pl.hand.filter(h=>h.uid!==excludeUid);
    return zoneArr.length >= exileCost.count;
  }
  function fireOnExile(players, sideOf, playerId, defId, stats, events){
    const def = CARD_DEFS[defId];
    if(!def || !def.effects || !Array.isArray(def.effects.triggers)) return;
    if(!def.effects.triggers.some(t=>t.on==='onExile')) return;
    // A card in the graveyard/hand/board has no live board-instance while
    // exiled, so onExile actions that need a live card (buffAttack, etc.)
    // are skipped; only owner-level payouts (gold/grace/draw) make sense here.
    const pl = players[playerId], mySide = sideOf(playerId);
    def.effects.triggers.filter(t=>t.on==='onExile').forEach(t=>{
      // 2026-09-22: gainGold now grants Lumber -- see the newPlayer() comment on acorns/lumber
      // retirement for the full why. Trigger/action shape (`gainGold` as a do/case name) is left
      // as-is in card data and ACTION_KEYS; only the resource it actually pays out changed.
      if(t.do==='gainGold'){ pl.lumber += (t.amount||0); ensureStat(stats,mySide,defId).lumberGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'lumber', side:mySide, defId, amount:t.amount||0}); }
      else if(t.do==='gainGrace'){ pl.grace += (t.amount||0); ensureStat(stats,mySide,defId).graceGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'grace', side:mySide, defId, amount:t.amount||0}); }
      else if(t.do==='gainDevilry'){ pl.devilry += (t.amount||0); ensureStat(stats,mySide,defId).devilryGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'devilry', side:mySide, defId, amount:t.amount||0}); }
      else if(t.do==='drawCard'){ draw(pl, t.count||1, mySide, stats, events); }
    });
  }
  function payExileCost(players, sideOf, playerId, exileCost, excludeUid, stats, events){
    const pl = players[playerId], sideOfPl = sideOf(playerId);
    if(!exileCost || !exileCost.count) return;
    for(let i=0;i<exileCost.count;i++){
      if(exileCost.zone==='graveyard'){
        if(!pl.graveyard.length) break;
        const idx = Math.floor(rnd()*pl.graveyard.length);
        const [g] = pl.graveyard.splice(idx,1);
        pl.exile.push(g); pl.echoes = (pl.echoes||0) + 1;
        ensureStat(stats, sideOfPl, g.defId).exiled++;
        if(recordEvents && events) events.push({type:'exile', side:sideOfPl, defId:g.defId, zone:'graveyard'});
        fireOnExile(players, sideOf, playerId, g.defId, stats, events);
      } else {
        const pool = pl.hand.filter(h=>h.uid!==excludeUid);
        if(!pool.length) break;
        const pick = pool[Math.floor(rnd()*pool.length)];
        const idx = pl.hand.findIndex(h=>h.uid===pick.uid);
        const [h] = pl.hand.splice(idx,1);
        pl.exile.push({defId:h.defId}); pl.echoes = (pl.echoes||0) + 1;
        ensureStat(stats, sideOfPl, h.defId).exiled++;
        if(recordEvents && events) events.push({type:'exile', side:sideOfPl, defId:h.defId, zone:'hand'});
        fireOnExile(players, sideOf, playerId, h.defId, stats, events);
        fireOnSacrifice(players, sideOf, playerId, null, h.defId, stats, events, 'offering'); // Offering N gives up a hand card (2026-10-14)
      }
    }
  }
  /* Ecclesia (2026-10-10, D23, the user's model): Prayer value = the Prayer N of your units on the board + the cards in
     your Removal Zone. Ecclesia cards need a Prayer value to be played (a threshold, never spent). Once a turn, when you
     summon an Ecclesia card, you may exile a card from your hand: it goes to the Removal Zone, so it counts +1 Prayer at
     once (and stays counted). */
  function prayerOf(pl){
    if(!pl) return 0;
    let n = (pl.exile||[]).length;
    allBoardCards(pl).forEach(c=>{ if(c.hp>0){ const d = CARD_DEFS[c.defId]; if(d && d.effects && d.effects.prayer) n += Number(d.effects.prayer)||0; } });
    return n;
  }
  function prayerReqOf(defId){ const d = CARD_DEFS[defId]; return (d && Number(d.prayerReq)) || 0; }
  function isEcclesiaDef(defId){ const d = CARD_DEFS[defId]; return !!(d && (d.prayerReq > 0 || d.mechanicLine==='grace' || (d.archetypes||[]).includes('Ecclesia'))); }
  function prayerOfferReady(pl){ return !!pl && pl.prayerOfferTurn !== turnNo; }
  function canOfferPrayer(pl, defId, offerUid){ return isEcclesiaDef(defId) && pl.prayerOfferTurn !== turnNo && pl.hand.some(h=> h.uid===offerUid); }
  // Spell actions: hasten N (your units lose N Wait), mend N (heal your units N), sap N (enemy units lose N Attack for
  // good, floored at 0).
  function castSpell(players, sideOf, pid, def, stats, events){
    const sp = def.spell || {}, n = Math.max(0, Number(sp.amount)||0), mine = allLive(players[pid]), foes = allLive(players[otherId(pid)]), hit = [];
    if(sp.do === 'hasten' || sp.do === 'tailwind') mine.forEach(c=>{ if(c.wait > 0){ const w = c.wait; c.wait = Math.max(0, c.wait - n); hit.push({uid:c.uid, amount:w - c.wait}); } });
    // Tailwind (2026-10-12, user: "Tailwind should do the same for Flyers"): Hasten, and every Flyer of yours also gets one
    // Fast Forward turn at the start of the next combat.
    if(sp.do === 'tailwind') mine.forEach(c=>{ const e = (CARD_DEFS[c.defId]||{}).effects || {}; if(e.flying){ c.ffCounters = (c.ffCounters||0) + 1; if(recordEvents && events) events.push({type:'statusFx', kind:'tailwind', side:sideOf(pid), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId, amount:1}); } });
    else if(sp.do === 'mend') mine.forEach(c=>{ const h = Math.min(n, c.maxHp - c.hp); if(h > 0){ c.hp += h; hit.push({uid:c.uid, amount:h}); } });
    else if(sp.do === 'sap') foes.forEach(c=>{ const a = Math.min(n, c.atk); if(a > 0){ c.atk -= a; c.baseAtk = Math.max(0, (c.baseAtk||0) - a); hit.push({uid:c.uid, amount:a}); } });
    if(recordEvents && events) events.push({type:'spell', side:sideOf(pid), defId:def.id, action:sp.do, amount:n, targets:hit});
  }
  function payOreCosts(pl, defId){ const od = CARD_DEFS[defId] || {}; pl.stone = (pl.stone||0) - (od.stoneCost||0); pl.metal = (pl.metal||0) - (od.metalCost||0); pl.uranium = (pl.uranium||0) - (od.uraniumCost||0); }
  function canPlay(pl, defId, excludeUid, discount, prayerBonus){
    { const ct = CARD_DEFS[defId] && CARD_DEFS[defId].cardType; if(ct === 'equipment' || ct === 'materia') return false; } // 2026-10-11: equipment is equipped onto a unit; materia is a crafting material
    let cost = costOfCard(defId), pCost = graceCostOfCard(defId), dCost = devilryCostOfCard(defId); const exCost = exileCostOfCard(defId);
    if(discount > 0){ const fromDark = Math.min(dCost, discount); dCost -= fromDark; cost = Math.max(0, cost - (discount - fromDark)); } // Sacrifice
    if((pl.skipTurns||0) > 0) return false; // Player Stun: this player skips the turn
    // Field cards (2026-10-09) are a free extra action: they don't use the turn's play, but only one a turn.
    const isField = CARD_DEFS[defId] && CARD_DEFS[defId].field;
    const isDark = CARD_DEFS[defId] && CARD_DEFS[defId].darkSummon;
    if(isDark ? (pl.darkUsed||0) >= darkPerTurn(pl) : isField ? pl.fieldTurn === turnNo : pl.playedThisTurn) return false;
    if(cost > pl.lumber) return false; // 2026-09-22: card cost is now paid in Lumber, not Gold
    { const od = CARD_DEFS[defId] || {}; if((od.stoneCost||0) > (pl.stone||0) || (od.metalCost||0) > (pl.metal||0) || (od.uraniumCost||0) > (pl.uranium||0)) return false; } // Stone, Metal, Uranium (2026-10-12)
    if(pCost > pl.grace) return false;
    if(dCost > pl.devilry) return false;
    if(!canAffordExile(pl, exCost, excludeUid)) return false;
    { const req = prayerReqOf(defId); if(req > 0 && prayerOf(pl) + (prayerBonus||0) < req) return false; }
    return true;
  }

  function placeCard(players, sideOf, playerId, uid, side, stats, events, popts){
    const pl = players[playerId];
    const idx = pl.hand.findIndex(h=>h.uid===uid);
    if(idx===-1) return false;
    const hc = pl.hand[idx];
    const discount = (popts && popts.discount) || 0;
    const offerUid = (popts && popts.prayerOffer != null && popts.prayerOffer !== uid && canOfferPrayer(pl, hc.defId, popts.prayerOffer)) ? popts.prayerOffer : null;
    if(!canPlay(pl, hc.defId, uid, discount, offerUid != null ? 1 : 0)) return false;
    const targetSlot = slotMode ? resolvePlacementSlot(pl, side) : null;
    const fdef = CARD_DEFS[hc.defId];
    if(fdef && fdef.field && FIELDS[fdef.field.id]){
      // A field card never takes a slot: it pays its cost, sets the field and goes to the Graveyard.
      pl.hand.splice(idx,1);
      pl.lumber -= costOfCard(hc.defId);
      pl.fieldTurn = turnNo;
      pl.graveyard.push({defId: hc.defId});
      setField(fdef.field.id, fdef.field.rounds || 3, sideOf(playerId));
      draw(pl, 1, sideOf(playerId), stats, events); // a field card replaces itself, so it never costs you a unit
      ensureStat(stats, sideOf(playerId), hc.defId).played++;
      if(recordEvents && events) events.push({type:'fieldSet', side: sideOf(playerId), defId: hc.defId, field: fdef.field.id, rounds: fdef.field.rounds || 3});
      return true;
    }
    // Spells (2026-10-11, user: "Spells do not come out as a unit but instead manipulate the field in some minor way.
    // Playing these cards takes your turn as usual"): pay, take the turn's play, resolve, go to the Graveyard.
    if(fdef && fdef.cardType === 'spell'){
      pl.hand.splice(idx,1);
      pl.lumber -= costOfCard(hc.defId); markPlayed(pl);
      pl.graveyard.push({defId: hc.defId});
      ensureStat(stats, sideOf(playerId), hc.defId).played++;
      castSpell(players, sideOf, playerId, fdef, stats, events);
      return true;
    }
    const resRow = (popts && popts.reserve) ? (popts.reserve|0) : 0;
    if(resRow){ if(!pl.reserve || typeof side !== 'number' || !legalReserveSlots(pl, resRow).includes(side)) return false; }
    else if(slotMode && targetSlot===null) return false;
    if(offerUid != null){ // the prayer offering: the chosen hand card goes to the Removal Zone first
      const oi = pl.hand.findIndex(h=> h.uid===offerUid), off = pl.hand.splice(oi, 1)[0];
      pl.exile.push({defId: off.defId}); pl.echoes = (pl.echoes||0) + 1; pl.prayerOfferTurn = turnNo;
      if(recordEvents && events) events.push({type:'exile', side:sideOf(playerId), defId:off.defId, zone:'hand', prayer:true});
      fireOnSacrifice(players, sideOf, playerId, null, off.defId, stats, events, 'offering'); // Sacrifice - {} (2026-10-14)
    }
    pl.hand.splice(pl.hand.findIndex(h=> h.uid===uid), 1);
    { let dC = devilryCostOfCard(hc.defId), lC = costOfCard(hc.defId); if(discount > 0){ const fd = Math.min(dC, discount); dC -= fd; lC = Math.max(0, lC - (discount - fd)); }
      pl.lumber -= lC; pl.devilry -= dC; }
    pl.grace -= graceCostOfCard(hc.defId);
    payOreCosts(pl, hc.defId);
    payExileCost(players, sideOf, playerId, exileCostOfCard(hc.defId), uid, stats, events);
    if(fdef && fdef.darkSummon) pl.darkUsed = (pl.darkUsed||0) + 1; else markPlayed(pl);
    const boardCard = makeBoardCard(hc.defId);
    // Character passive: Plains Terrace-style "first unit gets +N attack" — applies once,
    // to whichever card is the very first one this player plays in the match.
    if(pl.unitHpBonus){ boardCard.hp += pl.unitHpBonus; boardCard.maxHp += pl.unitHpBonus; }
    applyArrivalPerks(pl, boardCard);
    { const foeP = players[otherId(playerId)]; if(foeP && foeP.enemyWaitBonus > 0 && (foeP._logjamLeft == null ? (foeP._logjamLeft = 3) : foeP._logjamLeft) > 0){ foeP._logjamLeft--; boardCard.wait = (boardCard.wait||0) + foeP.enemyWaitBonus; if(recordEvents && events) events.push({type:'statusFx', kind:'logjam', side:sideOf(playerId), targetSide:sideOf(playerId), targetDefId:boardCard.defId, targetUid:boardCard.uid, amount:foeP.enemyWaitBonus}); } }
    if(pl.flyerAtkBonus && CARD_DEFS[boardCard.defId] && CARD_DEFS[boardCard.defId].effects && CARD_DEFS[boardCard.defId].effects.flying){ boardCard.atk += pl.flyerAtkBonus; boardCard.baseAtk += pl.flyerAtkBonus; }
    if(pl.firstUnitAtkBonus && !pl.firstUnitBonusUsed){
      boardCard.atk += pl.firstUnitAtkBonus;
      boardCard.baseAtk += pl.firstUnitAtkBonus;
      pl.firstUnitBonusUsed = true;
    }
    // Center slot (2026-09-16, per explicit request: "the first card should be placed on
    // the centre, not the L or R"): whenever the center is empty — the very first card
    // played, or any later card played after the centered card has died — it always lands
    // in the single dedicated center slot, no matter which drop zone (Left/Right) the
    // player used. Only once center is occupied do Left/Right behave as requested.
    if(resRow){ // into a reserve row: it waits there until its column clears
      boardCard.slot = side; pl.reserve[resRow-1][side] = boardCard;
      ensureStat(stats, sideOf(playerId), hc.defId).played++;
      if(recordEvents && events) events.push({type:'play', side:sideOf(playerId), defId:hc.defId, uid:boardCard.uid, reserve:resRow, slot:side});
      return true;
    }
    let actualSide;
    if(slotMode){ actualSide = putInSlot(pl, boardCard, targetSlot); }
    else { actualSide = pl.row.center.length===0 ? 'center' : side; pl.row[actualSide].push(boardCard); }
    ensureStat(stats, sideOf(playerId), hc.defId).played++;
    if(recordEvents && events) events.push({type:'play', side:sideOf(playerId), defId:hc.defId, uid:boardCard.uid, boardSide:actualSide, slot:boardCard.slot});
    applyOnSpawnEffects(players, sideOf, playerId, boardCard, stats, events);
    fireSpawnFamilyTriggers(players, sideOf, playerId, boardCard, stats, events, 'played');
    // Chained (Devilry, 2026-09-17, per explicit request: "other ways like when opponent unit
    // enters the battlefield"): every chained card belonging to the OPPONENT of whoever just
    // played this card gets its enemySpawn break condition checked — "opponent" is from each
    // chained card's own perspective, i.e. the player who did NOT just play this card. Only
    // covers a card entering via a direct play (not a later onDeathSpawn/onAttackedSpawn
    // token) — see the game-design doc for that scoping note.
    const opponent = players[otherId(playerId)];
    ['left','center','right'].forEach(s=> opponent.row[s].forEach(c=>{
      if(c.hp>0 && c.chained) maybeBreakChain(players, sideOf, otherId(playerId), c, stats, events, {kind:'enemySpawn'});
    }));
    try{ syncPhaseStats(players, sideOf, events); }catch(e){} // Timber/Loyal/Usurper see the new board and the Lumber just spent
    return true;
  }

  // Debug spawn (2026-09-22, Test Suite feature — Sandbox Test Battle mode, tasks #309-314):
  // places ANY card directly onto a player's board, bypassing every real-match gate placeCard
  // enforces — no hand slot to remove it from, no Lumber/Grace/Devilry/Exile cost paid, no
  // one-play-per-turn limit, ignores `locked`/`test`/`token` entirely (a tester needs to be able
  // to spawn a locked-in-progress card or even a spawn-only token to see how it actually behaves
  // in combat). Deliberately still a near-copy of placeCard rather than a shared refactor, same
  // reasoning summonLeader's own comment above gives: everything AFTER a card lands — the
  // center-slot priority rule, onSpawn effects, ally-spawn triggers, and the opponent chain-break
  // sweep — must stay identical to a real play so Sandbox is actually testing the real engine
  // path, not a simplified stand-in of it. If placeCard's post-spawn logic changes, mirror the
  // change here too.
  function debugSpawnCard(players, sideOf, playerId, defId, side, stats, events){
    if(!CARD_DEFS[defId]) return false;
    const pl = players[playerId];
    const boardCard = makeBoardCard(defId);
    applyArrivalPerks(pl, boardCard);
    let actualSide;
    if(slotMode){ const sl = resolvePlacementSlot(pl, side); if(sl===null) return false; actualSide = putInSlot(pl, boardCard, sl); }
    else { actualSide = pl.row.center.length===0 ? 'center' : side; pl.row[actualSide].push(boardCard); }
    ensureStat(stats, sideOf(playerId), defId).played++;
    if(recordEvents && events) events.push({type:'play', side:sideOf(playerId), defId, uid:boardCard.uid, boardSide:actualSide, slot:boardCard.slot});
    applyOnSpawnEffects(players, sideOf, playerId, boardCard, stats, events);
    fireSpawnFamilyTriggers(players, sideOf, playerId, boardCard, stats, events, 'played');
    const opponent = players[otherId(playerId)];
    ['left','center','right'].forEach(s=> opponent.row[s].forEach(c=>{
      if(c.hp>0 && c.chained) maybeBreakChain(players, sideOf, otherId(playerId), c, stats, events, {kind:'enemySpawn'});
    }));
    try{ syncPhaseStats(players, sideOf, events); }catch(e){} // Timber/Loyal/Usurper see the new board and the Lumber just spent
    return true;
  }

  // Spawning a token beside a card (2026-10-14, Twin and Sprout): the nearest free slot to it (open boards; a tie is a coin flip),
  // or the shorter flank on a slotless row. Logged like a trigger spawn, so the board shows it jumping out of the card.
  const GROWTH_TOKEN = 'growth-sprout';
  function spawnBeside(players, sideOf, pid, src, defId, stats, events, kind){
    const pl = players[pid]; if(!pl || !CARD_DEFS[defId]) return null;
    const nc = makeBoardCard(defId); let lane;
    if(slotMode){ syncSlots(pl); const used = new Set(allBoardCards(pl).map(c=> c.slot)); const s0 = Number.isInteger(src.slot) ? src.slot : 0; let sl = null;
      for(let d = 1; d < 16 && sl === null; d++){ const a = !used.has(s0 - d), b = !used.has(s0 + d); if(a && b) sl = rnd() < .5 ? s0 - d : s0 + d; else if(a) sl = s0 - d; else if(b) sl = s0 + d; }
      if(sl === null) return null; lane = putInSlot(pl, nc, sl); }
    else { lane = flankOrShorter(pl, findCardSide(pl, src.uid) || 'left'); pl.row[lane].push(nc); }
    ensureStat(stats, sideOf(pid), src.defId).spawnedTokens = (ensureStat(stats, sideOf(pid), src.defId).spawnedTokens||0) + 1;
    if(recordEvents && events) events.push({type:'spawn', side:sideOf(pid), defId, count:1, cause:'triggerSpawn', kind, uids:[nc.uid], lane, nearUid:src.uid});
    fireSpawnFamilyTriggers(players, sideOf, pid, nc, stats, events, 'spawned');
    return nc;
  }
  // Restless (2026-10-14, user: "Some cards have abilities that make them keep moving — I didn't like this, but good to have this
  // option."): effects.restless. At the start of every round it moves one column toward the nearest enemy unit (a tie is a
  // coin flip), swapping places with an ally standing there. It stays put when an enemy is already in front of it, when there
  // are no enemy units, or when the way is held by a pinned unit or a cage. Open boards only (packed rows have no columns to walk).
  function restlessMoves(players, sideOf, stats, events){
    if(!slotMode) return;
    [1,2].forEach(pid=>{ const pl = players[pid], foe = players[otherId(pid)]; if(!pl || !foe) return;
      allBoardCards(pl).filter(c=> c && !c.gap && c.hp > 0 && !c.cageOf && !c.pinned && effectsOf(c).restless).forEach(c=>{
        syncSlots(pl); syncSlots(foe);
        const foes = allBoardCards(foe).filter(x=> x && !x.gap && x.hp > 0 && !x.cageOf && Number.isInteger(x.slot)); if(!foes.length) return;
        const s0 = c.slot; if(foes.some(x=> x.slot === s0)) return;
        const best = Math.min(...foes.map(x=> Math.abs(x.slot - s0))); const near = foes.filter(x=> Math.abs(x.slot - s0) === best);
        const dirs = [...new Set(near.map(x=> Math.sign(x.slot - s0)))]; const dir = dirs.length > 1 ? (rnd() < .5 ? -1 : 1) : dirs[0];
        const d = s0 + dir, other = allBoardCards(pl).find(x=> x !== c && x.slot === d && !x.gap) || null;
        if(other && other.hp > 0 && (other.pinned || other.cageOf)) return;
        c.slot = d; if(other) other.slot = s0; relayoutRow(pl);
        if(recordEvents && events) events.push({type:'restless', side:sideOf(pid), uid:c.uid, defId:c.defId, from:s0, to:d, swapUid: other ? other.uid : null});
        runCustomTriggers(players, sideOf, pid, c, CARD_DEFS[c.defId], 'onMove', stats || {}, events, {movedCard: c});
        if(other && other.hp > 0) runCustomTriggers(players, sideOf, pid, other, CARD_DEFS[other.defId], 'onMove', stats || {}, events, {movedCard: c}); }); });
  }
  // Meiosis N (2026-10-14, user: "Meiosis N (Default 1): Simple units only - this Passive skill means that the creature breaks into
  // 2 smaller parts when it dies, with half the stats, and skill numbers. Their Meiosis count drops by 1."): effects.meiosis N
  // (true = 1). When it dies, two halves appear: tokens of the same card with half its printed Attack and Health (rounded up,
  // at least 1), every number skill halved (rounded down; a skill that reaches 0 is dropped) and Meiosis N-1 (gone at 0).
  // The first half takes the fallen unit's place, the second the nearest free slot beside it (none free: only one half).
  function meiosisOf(d){ const v = d && d.effects && d.effects.meiosis; return v === true ? 1 : Math.max(0, Math.floor(Number(v)||0)); }
  function meiosisDefOf(defId){ const base = CARD_DEFS[defId], id = base.id + '~half';
    if(!CARD_DEFS[id]){ const eff = {};
      Object.entries(base.effects||{}).forEach(([k, v])=>{ if(k === 'meiosis'){ const n = meiosisOf(base) - 1; if(n > 0) eff.meiosis = n; return; }
        if(typeof v === 'number'){ const h = Math.floor(v / 2); if(h > 0) eff[k] = h; return; }
        eff[k] = v; });
      CARD_DEFS[id] = derivedDefs[id] = Object.assign({}, base, {id, attack: Math.max(1, Math.ceil((Number(base.attack)||0) / 2)), health: Math.max(1, Math.ceil((Number(base.health)||0) / 2)),
        derivedFrom: base.derivedFrom || base.id, token:true, halfOf: base.derivedFrom || base.id, effects: eff}); }
    return id; }
  function meiosisSplit(players, sideOf, sp, stats, events){
    const pl = sp.pl, hid = meiosisDefOf(sp.card.defId), made = [];
    if(slotMode){ syncSlots(pl); const used = new Set(allBoardCards(pl).map(c=> c.slot)); const s0 = Number.isInteger(sp.slot) ? sp.slot : 0;
      const free = []; if(!used.has(s0)) free.push(s0);
      for(let d = 1; d < 16 && free.length < 2; d++){ const a = !used.has(s0 - d), b = !used.has(s0 + d);
        if(a && b) free.push(...(rnd() < .5 ? [s0 - d, s0 + d] : [s0 + d, s0 - d])); else if(a) free.push(s0 - d); else if(b) free.push(s0 + d); }
      free.slice(0, 2).forEach(sl=>{ const nc = makeBoardCard(hid); putInSlot(pl, nc, sl); made.push(nc); });
    } else {
      for(let i = 0; i < 2; i++){ const nc = makeBoardCard(hid); const lane = (i === 0 && (sp.side !== 'center' || !pl.row.center.length)) ? sp.side : flankOrShorter(pl, sp.side === 'center' ? 'left' : sp.side);
        pl.row[lane].push(nc); made.push(nc); }
    }
    if(!made.length) return [];
    ensureStat(stats, sideOf(pl.id), sp.card.defId).spawnedTokens = (ensureStat(stats, sideOf(pl.id), sp.card.defId).spawnedTokens||0) + made.length;
    if(recordEvents && events) events.push({type:'spawn', side:sideOf(pl.id), defId:hid, count:made.length, cause:'onDeathSpawn', kind:'meiosis', uids:made.map(c=> c.uid), placements:made.map(c=> ({uid:c.uid, lane: findCardSide(pl, c.uid)})), fromUid:sp.card.uid, nearUid:sp.card.uid});
    made.forEach(nc=> fireSpawnFamilyTriggers(players, sideOf, pl.id, nc, stats, events, 'spawned'));
    return made;
  }
  // A brood token's card (Brood N, 2026-10-14): one per parent card per match.
  function broodDefOf(defId){ const base = CARD_DEFS[defId], root = base.derivedFrom || base.id, id = root + '~brood';
    if(!CARD_DEFS[id]){ const pe = base.effects || {}, eff = {swarm: pe.swarm || true}; if(pe.swarmN) eff.swarmN = pe.swarmN; if(pe.flying) eff.flying = true;
      const src = CARD_DEFS[root] || base;
      CARD_DEFS[id] = derivedDefs[id] = Object.assign({}, src, {id, name: (src.name || root) + ' Brood', attack:1, health:1, wait:1, cost:0, stoneCost:0, metalCost:0, uraniumCost:0, graceCost:0, devilryCost:0,
        derivedFrom: root, token:true, broodOf: root, effects: eff}); }
    return id; }
  // The twin's card: a copy of the original's card, minus Twin, marked as a token (made once per match per card).
  function twinDefOf(defId){ const base = CARD_DEFS[defId]; const id = base.id + '~twin';
    if(!CARD_DEFS[id]) CARD_DEFS[id] = derivedDefs[id] = Object.assign({}, base, {id, derivedFrom: base.derivedFrom || base.id, token:true, twinOf: base.derivedFrom || base.id, effects: Object.assign({}, base.effects||{}, {twin:false})});
    return id; }

  // Leader summon (2026-09-18, Epic A — "clicking it attempts to summon it into a random open
  // slot at its normal summon cost"): deliberately a near-copy of placeCard above rather than a
  // shared refactor, since the leader isn't a hand card — there's no hand-uid to splice out, and
  // `side` here is chosen by the CALLER (arena_app.js picks a random open slot before calling
  // this) rather than a drop-zone click. Everything else — cost gates via canPlay, the
  // one-play-per-turn flag, the character-passive first-unit bonus, onSpawn effects, ally-spawn
  // triggers, and the opponent chain-break sweep — mirrors placeCard exactly so a leader entering
  // play behaves identically to any other card entering play. If placeCard's spawn logic changes,
  // this needs the same change applied here.
  function summonLeader(players, sideOf, playerId, defId, side, stats, events){
    const pl = players[playerId];
    if(!CARD_DEFS[defId]) return false;
    if(!canPlay(pl, defId, null)) return false;
    const leaderSlot = slotMode ? resolvePlacementSlot(pl, side) : null;
    if(slotMode && leaderSlot===null) return false;
    pl.lumber -= costOfCard(defId);
    pl.grace -= graceCostOfCard(defId); payOreCosts(pl, defId);
    pl.devilry -= devilryCostOfCard(defId);
    payExileCost(players, sideOf, playerId, exileCostOfCard(defId), null, stats, events);
    markPlayed(pl);
    const boardCard = makeBoardCard(defId); boardCard.isLeader = true;
    if(playerId === 2 && rules.bossSurge){ const g = rules.bossSurge; boardCard.atk += g.atk||0; boardCard.baseAtk += g.atk||0; boardCard.hp += g.hp||0; boardCard.maxHp += g.hp||0; boardCard.surged = true; }
    if(pl.unitHpBonus){ boardCard.hp += pl.unitHpBonus; boardCard.maxHp += pl.unitHpBonus; }
    { const foeP = players[otherId(playerId)]; if(foeP && foeP.enemyWaitBonus > 0 && (foeP._logjamLeft == null ? (foeP._logjamLeft = 3) : foeP._logjamLeft) > 0){ foeP._logjamLeft--; boardCard.wait = (boardCard.wait||0) + foeP.enemyWaitBonus; if(recordEvents && events) events.push({type:'statusFx', kind:'logjam', side:sideOf(playerId), targetSide:sideOf(playerId), targetDefId:boardCard.defId, targetUid:boardCard.uid, amount:foeP.enemyWaitBonus}); } }
    if(pl.flyerAtkBonus && CARD_DEFS[boardCard.defId] && CARD_DEFS[boardCard.defId].effects && CARD_DEFS[boardCard.defId].effects.flying){ boardCard.atk += pl.flyerAtkBonus; boardCard.baseAtk += pl.flyerAtkBonus; }
    if(pl.firstUnitAtkBonus && !pl.firstUnitBonusUsed){
      boardCard.atk += pl.firstUnitAtkBonus;
      boardCard.baseAtk += pl.firstUnitAtkBonus;
      pl.firstUnitBonusUsed = true;
    }
    let actualSide;
    if(slotMode){ actualSide = putInSlot(pl, boardCard, leaderSlot); }
    else { actualSide = pl.row.center.length===0 ? 'center' : side; pl.row[actualSide].push(boardCard); }
    ensureStat(stats, sideOf(playerId), defId).played++;
    if(recordEvents && events) events.push({type:'play', side:sideOf(playerId), defId, uid:boardCard.uid, boardSide:actualSide, slot:boardCard.slot, leader:true});
    if(boardCard.surged && recordEvents && events) events.push({type:'statusFx', kind:'surge', side:sideOf(playerId), attUid:boardCard.uid, attDefId:defId, targetSide:sideOf(playerId), targetUid:boardCard.uid, targetDefId:defId, atk:rules.bossSurge.atk||0, hp:rules.bossSurge.hp||0});
    applyOnSpawnEffects(players, sideOf, playerId, boardCard, stats, events);
    fireSpawnFamilyTriggers(players, sideOf, playerId, boardCard, stats, events, 'played');
    const opp = players[otherId(playerId)];
    ['left','center','right'].forEach(s=> opp.row[s].forEach(c=>{
      if(c.hp>0 && c.chained) maybeBreakChain(players, sideOf, otherId(playerId), c, stats, events, {kind:'enemySpawn'});
    }));
    try{ syncPhaseStats(players, sideOf, events); }catch(e){} // Timber/Loyal/Usurper see the new board and the Lumber just spent
    return true;
  }

  function fireDamageAction(players, sideOf, ownerId, attDefId, amount, dmgType, target, stats, events, killCredit, attUid){
    const owner = players[ownerId], enemy = players[otherId(ownerId)];
    const aStat = ensureStat(stats, sideOf(ownerId), attDefId);
    const realAmount = (amount==='attack') ? 0 : amount; // 'attack' resolved by caller for missiles; guard here
    if(target.kind==='card'){
      // Evasion: the ORIGINAL target gets the dodge roll, before any Guardian redirect —
      // dodging is about the creature the skill was aimed at, not whoever ends up eating it.
      if(!dodgeCheck(target.card)){
        if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:sideOf(ownerId), attDefId, attUid, targetSide:sideOf(otherId(ownerId)), targetDefId:target.card.defId, targetUid:target.card.uid, ranged:true});
        return null; // (2026-10-15) callers that add a status on a landed shot (Ice Arrow, the Bolts) read the result
      }
      const c = redirectToGuardian(enemy, target.card); // Guardian: an adjacent protector eats the hit instead, if one's alive
      const guardianRedirect = c.uid !== target.card.uid;
      const dmg = damageCardFlat(c, realAmount, dmgType, attDefId, attUid);
      aStat.dealt += dmg;
      if(attUid != null){ const src = allBoardCards(owner).find(x=> x.uid === attUid); if(src) applySpite(players, sideOf, otherId(ownerId), c, src, dmg, stats, events, killCredit); }
      ensureStat(stats, sideOf(otherId(ownerId)), c.defId).taken += dmg;
      if(recordEvents && events) events.push({type:'hit', side:sideOf(ownerId), attDefId, attUid, targetSide:sideOf(otherId(ownerId)), targetDefId:c.defId, targetUid:c.uid, dmg, dmgType, ranged:true, guardianRedirect});
      // Chained (Devilry, 2026-09-17): a missile/skill hit large enough breaks a chained
      // defender free too, same threshold check as a landed melee hit below.
      maybeBreakChain(players, sideOf, otherId(ownerId), c, stats, events, {kind:'damage', amount:dmg});
      if(c.hp<=0 && killCredit){
        if(!killCredit[c.uid]) killCredit[c.uid] = new Set();
        killCredit[c.uid].add(statKey(sideOf(ownerId), attDefId));
      } else if(c.hp>0){
        // Bleed: defending against ANY skill/ranged hit (not just melee) ticks the target's
        // own bleed stacks. onAttacked also fires here, same as a surviving melee hit.
        bleedTick(sideOf, otherId(ownerId), c, stats, events, 'defend');
        runCustomTriggers(players, sideOf, otherId(ownerId), c, CARD_DEFS[c.defId], 'onAttacked', stats, events);
      }
      return c; // the card actually hit (after a Guardian redirect)
    } else {
      const bulwarkBlocked = bulwarkReductionFor(enemy);
      const dmg = damageHQ(enemy, realAmount);
      aStat.dealt += dmg; aStat.faceDamage += dmg;
      if(recordEvents && events) events.push({type:'hitHQ', side:sideOf(ownerId), attDefId, attUid, targetSide:sideOf(otherId(ownerId)), dmg, ranged:true, bulwark:Math.min(bulwarkBlocked, realAmount)});
    }
  }

  // ---- 2026-10-14 (fifth pass): Tornado, Avalanche, Tsunami (user: "All evergreen abilities"), Dragon Lightning and Wither
  // (user: "Dragonic Spire - (imagine elden ring) - Skills, Dragon Lightning (monster hunter), and Wither (Minecraft) -> the map's
  // signature abilities") and egg cards (user: "Eggs are now cards ... When it hatches (5-10 wait), it forms a random beast of that type").
  const numN = (v, d)=> v === true ? (d||1) : Math.max(0, Number(v)||0);
  const liveFoesOf = pl=> allBoardCards(pl).filter(c=> c && !c.gap && c.hp > 0 && !c.cageOf);
  // Tornado N: when it arrives, it whirls the enemy row. N random enemy units (not pinned) are each thrown to a random other column
  // (swapping with whoever stands there) and take 1 damage; a flyer is flung harder and takes 2.
  function tornadoStrike(players, sideOf, pid, src, n, stats, events){
    const tpid = otherId(pid), pl = players[tpid]; if(!pl) return null;
    const pool = liveFoesOf(pl).filter(c=> !c.pinned); const picks = [];
    while(picks.length < n && pool.length) picks.push(pool.splice(Math.floor(rnd()*pool.length), 1)[0]);
    const ev = {type:'tornado', side:sideOf(pid), attUid:src.uid, attDefId:src.defId, targetSide:sideOf(tpid), slotMode, moves:[], swaps:[], hits:picks.map(c=> c.uid)};
    picks.forEach(t=>{
      if(slotMode){
        syncSlots(players[1]); syncSlots(players[2]);
        const edge = Math.max(1, ...[1,2].flatMap(p=> players[p] ? allBoardCards(players[p]).filter(c=> c.hp > 0 && !c.gap).map(c=> Math.abs(c.slot)) : []));
        const opts = []; for(let s = -edge; s <= edge; s++){ if(s === t.slot) continue; const o = allBoardCards(pl).find(c=> c !== t && c.slot === s && c.hp > 0 && !c.gap); if(o && (o.pinned || o.cageOf)) continue; opts.push(s); }
        if(!opts.length) return;
        const s0 = t.slot, d = opts[Math.floor(rnd()*opts.length)], o = allBoardCards(pl).find(c=> c !== t && c.slot === d) || null;
        t.slot = d; ev.moves.push({uid:t.uid, from:s0, to:d}); if(o){ o.slot = s0; ev.moves.push({uid:o.uid, from:d, to:s0}); } relayoutRow(pl);
      } else {
        const order = physicalRowOrder(pl), i = order.indexOf(t); if(i < 0) return;
        const js = order.map((c, j)=> j).filter(j=> j !== i && order[j] && !order[j].pinned && !order[j].cageOf); if(!js.length) return;
        const j = js[Math.floor(rnd()*js.length)], o = order[j], L = pl.row.left.length, C = pl.row.center.length;
        order[i] = o; order[j] = t; pl.row.left = order.slice(0, L).reverse(); pl.row.center = order.slice(L, L + C); pl.row.right = order.slice(L + C);
        ev.swaps.push([t.uid, o.uid]);
      }
    });
    if(recordEvents && events) events.push(ev);
    picks.forEach(t=>{ if(t.hp > 0) fireDamageAction(players, sideOf, pid, src.defId, effectsOf(t).flying ? 2 : 1, 'physical', {kind:'card', card:t}, stats, events, {}, src.uid); });
    return ev;
  }
  // Avalanche N: when it arrives, N cold damage to every enemy unit that isn't flying, and each one it hits gets +1 Wait.
  function avalancheStrike(players, sideOf, pid, src, n, stats, events){
    const tpid = otherId(pid), pl = players[tpid]; if(!pl) return;
    const hit = liveFoesOf(pl).filter(c=> !effectsOf(c).flying);
    if(recordEvents && events) events.push({type:'avalanche', side:sideOf(pid), attUid:src.uid, attDefId:src.defId, targetSide:sideOf(tpid), n, hits:hit.map(c=> c.uid)});
    hit.forEach(c=>{ c.wait = (c.wait||0) + 1; if(recordEvents && events) events.push({type:'statusFx', kind:'avalancheWait', side:sideOf(pid), attDefId:src.defId, attUid:src.uid, targetSide:sideOf(tpid), targetDefId:c.defId, targetUid:c.uid, amount:1});
      fireDamageAction(players, sideOf, pid, src.defId, n, 'cold', {kind:'card', card:c}, stats, events, {}, src.uid); });
  }
  // Tsunami N: when it arrives, a wave washes the enemy board. Every enemy unit is pushed back (+1 Wait); those that
  // can't swim (not Swimmers or Tide units) also take N water damage. The Tide starts, if it hasn't yet.
  function tsunamiStrike(players, sideOf, pid, src, n, stats, events){
    const tpid = otherId(pid), pl = players[tpid]; if(!pl) return;
    const all = liveFoesOf(pl), wet = all.filter(c=> !isTide(c)); let tideStarted = false;
    if(tideStart === null && !permaTide){ tideStart = turnNo; tideStarted = true; }
    if(recordEvents && events) events.push({type:'tsunami', side:sideOf(pid), attUid:src.uid, attDefId:src.defId, targetSide:sideOf(tpid), n, pushed:all.map(c=> c.uid), hits:wet.map(c=> c.uid), tideStarted});
    all.forEach(c=>{ c.wait = (c.wait||0) + 1; if(recordEvents && events) events.push({type:'wash', tsunami:true, side:sideOf(pid), uid:src.uid, defId:src.defId, targetUid:c.uid, targetDefId:c.defId}); });
    wet.forEach(c=> fireDamageAction(players, sideOf, pid, src.defId, n, 'water', {kind:'card', card:c}, stats, events, {}, src.uid));
  }
  // Dragon Lightning N: every swing that connects calls down red lightning: the target and one unit beside it (a seeded pick if it
  // has two) each take N magic damage. Armor doesn't stop it (it is not a melee hit), and it strikes even if the target just fell.
  function dragonLightningStrike(players, sideOf, pid, att, target, n, stats, events, killCredit){
    const tpid = otherId(pid), pl = players[tpid]; if(!pl || !target || !(n > 0)) return;
    const order = physicalRowOrder(pl), i = order.indexOf(target), side = [order[i-1], order[i+1]].filter(c=> i >= 0 && c && !c.gap && c.hp > 0 && !c.cageOf);
    const struck = [target].concat(side.length ? [side[Math.floor(rnd()*side.length)]] : []).filter(c=> c.hp > 0);
    if(recordEvents && events) events.push({type:'dragonLightning', side:sideOf(pid), attUid:att.uid, attDefId:att.defId, targetSide:sideOf(tpid), targetUid:target.uid, uids:struck.map(c=> c.uid), n});
    struck.forEach(c=>{ const dmg = damageCardFlat(c, n, 'magic', att.defId, att.uid);
      ensureStat(stats, sideOf(pid), att.defId).dealt += dmg; ensureStat(stats, sideOf(tpid), c.defId).taken += dmg;
      if(recordEvents && events) events.push({type:'hit', side:sideOf(pid), attDefId:att.defId, attUid:att.uid, targetSide:sideOf(tpid), targetDefId:c.defId, targetUid:c.uid, dmg, dmgType:'magic', ranged:true, dragonLightning:true});
      if(c.hp <= 0 && killCredit){ if(!killCredit[c.uid]) killCredit[c.uid] = new Set(); killCredit[c.uid].add(statKey(sideOf(pid), att.defId)); } });
  }
  // Wither N: its hits wither the target: for the next 3 rounds it loses N max Health (and N Health) each upkeep, and nothing can
  // heal it while it withers. A fresh hit sets the count back to 3 and keeps the bigger N.
  function applyWither(pid, att, t, n, sideOf, events){
    if(!t || !(t.hp > 0) || !(n > 0)) return;
    t.wither = Math.max(t.wither||0, n); t.witherLeft = 3;
    if(recordEvents && events) events.push({type:'statusFx', kind:'wither', side:sideOf(pid), attDefId:att.defId, attUid:att.uid, targetSide:sideOf(otherId(pid)), targetDefId:t.defId, targetUid:t.uid, amount:n});
  }
  function applyWitherTicks(players, sideOf, stats, events){
    let any = false;
    [players[1], players[2]].filter(inUpkeep).forEach(pl=> allBoardCards(pl).forEach(c=>{
      if(!(c.wither > 0) || !(c.hp > 0)) return; any = true; const n = c.wither;
      c.maxHp = Math.max(0, (c.maxHp||0) - n); c.hp = Math.max(0, Math.min(c.maxHp, c.hp - n));
      c.witherLeft = Math.max(0, (c.witherLeft||1) - 1); if(!c.witherLeft) c.wither = 0;
      ensureStat(stats, sideOf(pl.id), c.defId).taken += n;
      if(recordEvents && events) events.push({type:'witherTick', side:sideOf(pl.id), defId:c.defId, uid:c.uid, n, left:c.witherLeft});
    }));
    if(any) removeDeadCards(players, sideOf, {}, stats, events);
  }
  // Egg cards: an egg on the board that becomes Ready cracks open into a random card of its kind (def.hatchInto: {any} or
  // {species:[...], archetypes:[...]}). Never a token, test, hidden, hero, spell or another egg; Common or Uncommon unless the egg
  // itself is rarer (then up to the egg's rarity). It is not a real hatch: the egg card stays in your collection.
  const EGG_RARITY_ORDER = ['common','uncommon','quest','rare','veryrare','superrare','epic','heroic','unique','questunique','legendary','mythic'];
  function eggPoolFor(def){
    if(def.hatchInto && def.hatchInto.defId) return CARD_DEFS[def.hatchInto.defId] ? [CARD_DEFS[def.hatchInto.defId]] : []; // a fixed hatch, e.g. the Red Dragon Egg (2026-10-14)
    const h = def.hatchInto || {}, cap = Math.max(EGG_RARITY_ORDER.indexOf('uncommon'), EGG_RARITY_ORDER.indexOf(def.rarity||'common'));
    const sp = h.species || [], ar = h.archetypes || [];
    return Object.keys(CARD_DEFS).sort().map(k=> CARD_DEFS[k]).filter(d=> d && !d.token && !d.test && !d.hidden && !d.hero && !d.cardType && !d.field && !d.equip && !d.raid && !d.worldBoss
      && !d.derivedFrom && !d.hatchInto && !(d.effects && d.effects.leader) && (d.attack|0) > 0
      && EGG_RARITY_ORDER.indexOf(d.rarity) >= 0 && EGG_RARITY_ORDER.indexOf(d.rarity) <= cap
      && (h.any || (d.species||[]).some(x=> sp.includes(x)) || (d.archetypes||[]).some(x=> ar.includes(x))));
  }
  function hatchEggCard(players, sideOf, pid, card, stats, events){
    const def = CARD_DEFS[card.defId]; const pool = eggPoolFor(def); if(!pool.length) return null;
    const into = pool[Math.floor(rnd()*pool.length)], from = card.defId;
    card.defId = into.id; card.hp = card.maxHp = into.health; card.atk = card.baseAtk = into.attack; card.wait = 0;
    card.fuse = Number(into.effects && into.effects.dynamite) || 0; card.ffCounters = Math.max(0, Number(into.effects && into.effects.fastForward) || 0);
    card.hatchedFrom = from;
    ensureStat(stats, sideOf(pid), from).hatched = (ensureStat(stats, sideOf(pid), from).hatched||0) + 1;
    if(recordEvents && events) events.push({type:'hatch', side:sideOf(pid), uid:card.uid, fromDefId:from, defId:into.id, hp:card.hp, atk:card.atk});
    applyOnSpawnEffects(players, sideOf, pid, card, stats, events);
    fireSpawnFamilyTriggers(players, sideOf, pid, card, stats, events, 'spawned');
    try{ syncPhaseStats(players, sideOf, events); }catch(e){}
    return into.id;
  }

  // ---- 2026-10-14 (sixth pass): Fencing, Fireball, Meteor, Banana, Bananarang, Durian, Shield, Electricity and Keen Sense.
  // (user: "Duelist should use 'Fencing' - a new skill related to fine & precise swordsmanship. Maybe fencing = cannot miss Evade
  // creatures"; "On Ready _ Shoot an AOE fireball to a random enemy. in a 3-x size area, enemy units are hit for 15 Fire damage";
  // "Banana: every turn, at speed -1 (slower than everyone else), 1/2 chance to eat the banana for 3 health, 1/2 chance to throw
  // the banana at a random enemy for 3 damage ... The unit will never do eat if it is at full health"; "Bananarang: Same as
  // boomerang, but when it goes back to the unit, it has a 1/2 chance to eat the banana for 3 health"; "Durian: 1/2 chance to eat
  // it, giving itself Thorns +1"; "Shield: Not the same as armour, just temp HP. Shield N - the unit comes played with N shield.
  // As an action - On X, Shield N"; Electricity and Keen Sense from the "Planned, not built yet" list.)
  // The enemy units in the columns directly beside a unit (open boards: the slot either side; slotless rows: the row neighbours).
  function besideOf(pl, t){
    if(!pl || !t) return [];
    if(slotMode && Number.isInteger(t.slot)) return liveFoesOf(pl).filter(c=> c !== t && Number.isInteger(c.slot) && Math.abs(c.slot - t.slot) === 1);
    const order = physicalRowOrder(pl), i = order.indexOf(t); if(i < 0) return [];
    return [order[i-1], order[i+1]].filter(c=> c && !c.gap && c.hp > 0 && !c.cageOf);
  }
  // One area hit from a skill: flat damage (Armor doesn't stop it, Evade can't dodge an area), a 'hit' event, and the usual
  // reactions (Bleed, On Attacked) if it lives.
  function skillAreaHit(players, sideOf, pid, att, c, n, dmgType, stats, events, tag){
    if(!c || !(c.hp > 0) || !(n > 0)) return 0;
    const tpid = otherId(pid), dmg = damageCardFlat(c, n, dmgType, att.defId, att.uid);
    ensureStat(stats, sideOf(pid), att.defId).dealt += dmg; ensureStat(stats, sideOf(tpid), c.defId).taken += dmg;
    if(recordEvents && events) events.push(Object.assign({type:'hit', side:sideOf(pid), attDefId:att.defId, attUid:att.uid, targetSide:sideOf(tpid), targetDefId:c.defId, targetUid:c.uid, dmg, dmgType, ranged:true}, tag || {}));
    if(c.hp > 0){ bleedTick(sideOf, tpid, c, stats, events, 'defend'); runCustomTriggers(players, sideOf, tpid, c, CARD_DEFS[c.defId], 'onAttacked', stats, events); }
    return dmg;
  }
  // Fireball N (default 15): when it becomes Ready, a fireball flies at a random enemy unit and bursts 3 columns wide: that unit
  // and the enemy units beside it each take N fire (heat) damage. No enemy units: it hits the castle.
  function fireFireball(players, sideOf, pid, src, n, stats, events){
    const tpid = otherId(pid), pl = players[tpid]; if(!pl || !src || !(src.hp > 0) || !(n > 0)) return;
    const foes = liveFoesOf(pl);
    if(!foes.length){ if(recordEvents && events) events.push({type:'fireball', side:sideOf(pid), attUid:src.uid, attDefId:src.defId, targetSide:sideOf(tpid), castle:true, uids:[], n});
      fireDamageAction(players, sideOf, pid, src.defId, n, 'heat', {kind:'hq'}, stats, events, null, src.uid); return; }
    const t = foes[Math.floor(rnd()*foes.length)], hit = [t].concat(besideOf(pl, t));
    if(recordEvents && events) events.push({type:'fireball', side:sideOf(pid), attUid:src.uid, attDefId:src.defId, targetSide:sideOf(tpid), targetUid:t.uid, uids:hit.map(c=> c.uid), n});
    hit.forEach(c=> skillAreaHit(players, sideOf, pid, src, c, n, 'heat', stats, events, {fireball:true}));
  }
  // Meteor N (default 20): when it becomes Ready, a meteor crashes onto a random enemy column. The unit there takes N (Armor doesn't
  // stop it), the units beside it N/4 (rounded down), and the column burns: whoever stands there takes 2 fire at the start of each
  // of the next 2 rounds. No enemy units: the castle takes N.
  const meteorBurns = [];
  function fireMeteor(players, sideOf, pid, src, n, stats, events){
    const tpid = otherId(pid), pl = players[tpid]; if(!pl || !src || !(src.hp > 0) || !(n > 0)) return;
    const foes = liveFoesOf(pl);
    if(!foes.length){ if(recordEvents && events) events.push({type:'meteor', side:sideOf(pid), attUid:src.uid, attDefId:src.defId, targetSide:sideOf(tpid), castle:true, sideUids:[], n, sideN:0});
      fireDamageAction(players, sideOf, pid, src.defId, n, 'heat', {kind:'hq'}, stats, events, null, src.uid); return; }
    const t = foes[Math.floor(rnd()*foes.length)], side = besideOf(pl, t), sideN = Math.floor(n / 4);
    const burn = {pid:tpid, slot: (slotMode && Number.isInteger(t.slot)) ? t.slot : null, cell: cellKeyOf(players, tpid, t), left:2, side:sideOf(pid), srcDefId:src.defId, srcUid:src.uid, uid:t.uid};
    meteorBurns.push(burn);
    if(recordEvents && events) events.push({type:'meteor', side:sideOf(pid), attUid:src.uid, attDefId:src.defId, targetSide:sideOf(tpid), targetUid:t.uid, sideUids:side.map(c=> c.uid), n, sideN, burn:2, slot:burn.slot});
    skillAreaHit(players, sideOf, pid, src, t, n, 'heat', stats, events, {meteor:true});
    side.forEach(c=> skillAreaHit(players, sideOf, pid, src, c, sideN, 'heat', stats, events, {meteor:true, splash:true}));
  }
  function applyMeteorBurns(players, sideOf, stats, events){
    if(!meteorBurns.length) return; let any = false;
    for(let i = meteorBurns.length - 1; i >= 0; i--){
      const b = meteorBurns[i], pl = players[b.pid]; if(!pl){ meteorBurns.splice(i, 1); continue; } if(!inUpkeep(pl)) continue;
      const c = liveFoesOf(pl).find(x=> b.slot != null ? x.slot === b.slot : cellKeyOf(players, b.pid, x) === b.cell) || null;
      b.left -= 1; let dmg = 0;
      if(c){ dmg = damageCardFlat(c, 2, 'heat', b.srcDefId); ensureStat(stats, sideOf(b.pid), c.defId).taken += dmg; ensureStat(stats, b.side, b.srcDefId).dealt += dmg; any = true; }
      if(recordEvents && events) events.push({type:'meteorBurn', side:b.side, attDefId:b.srcDefId, attUid:b.srcUid, targetSide:sideOf(b.pid), uid: c ? c.uid : null, defId: c ? c.defId : null, dmg, left:b.left, craterUid:b.uid, slot:b.slot});
      if(b.left <= 0) meteorBurns.splice(i, 1);
    }
    if(any) removeDeadCards(players, sideOf, {}, stats, events);
  }
  // Banana N (default 3) and Durian: after everyone has swung this round (Speed -1: slower than everything), every Ready unit with
  // a Banana flips a seeded coin: eat it (heal N; never at full Health, then it always throws) or throw it at a random enemy unit
  // (N damage; the castle if there are none). A Durian unit has a 1 in 2 chance to eat one and gain Thorns +1 for good.
  function snackTime(players, sideOf, stats, events, firstAttackerSide){
    const first = firstAttackerSide || 2;
    for(const pid of [first, otherId(first)]){
      const pl = players[pid]; if(!pl || !inUpkeep(pl)) continue;
      for(const c of physicalRowOrder(pl).slice()){
        if(!c || c.gap || !(c.hp > 0) || c.cageOf || (c.wait||0) > 0) continue;
        if(players[1].hq.hp <= 0 || players[2].hq.hp <= 0) return;
        const e = effectsOf(c);
        if(e.banana){ const n = numN(e.banana, 3), hurt = c.hp < c.maxHp && !(c.wither > 0);
          if(hurt && rnd() < 0.5){ const healed = applyHeal(c, n, sideOf(pid), events);
            if(recordEvents && events) events.push({type:'banana', action:'eat', side:sideOf(pid), uid:c.uid, defId:c.defId, amount:healed, n});
            if(healed > 0) fireHealTriggers(players, sideOf, pid, c, c, healed, stats, events); }
          else { const foes = liveFoesOf(players[otherId(pid)]), t = foes.length ? foes[Math.floor(rnd()*foes.length)] : null;
            if(recordEvents && events) events.push({type:'banana', action:'throw', side:sideOf(pid), uid:c.uid, defId:c.defId, attUid:c.uid, attDefId:c.defId, targetSide:sideOf(otherId(pid)), targetUid: t ? t.uid : null, targetDefId: t ? t.defId : null, castle:!t, n});
            fireDamageAction(players, sideOf, pid, c.defId, n, 'physical', t ? {kind:'card', card:t} : {kind:'hq'}, stats, events, null, c.uid);
            removeDeadCards(players, sideOf, {}, stats, events); } }
        if(e.durian && c.hp > 0 && rnd() < 0.5){ c.thornsBonus = (c.thornsBonus||0) + 1;
          if(recordEvents && events) events.push({type:'durian', side:sideOf(pid), uid:c.uid, defId:c.defId, thorns:(Number(e.thorns)||0) + c.thornsBonus, bonus:c.thornsBonus}); }
        if(e.smokeBomb && c.hp > 0 && rnd() < 0.5) throwSmokeBomb(players, sideOf, pid, c, events);
      }
    }
  }
  // Smoke Bomb (2026-10-14, user: "Throws a smoke bomb at an ally or enemy (random). If ally, then the ally has smoke-evade. If enemy,
  // the enemy has blind. This is an evergreen skill. It happens 50% of the time every turn."): at Banana's time (after the whole
  // swing order), a 1 in 2 chance each round: it throws at a random unit among its allies (never itself) and the enemy units. An ally
  // gets Smoke (attacks at it miss 1 in 2 until the end of the next round); an enemy gets Blind for a round (Keen Sense shrugs it off).
  function throwSmokeBomb(players, sideOf, pid, c, events){
    const live = p=> physicalRowOrder(players[p]).filter(x=> x && !x.gap && x.hp > 0 && !x.cageOf);
    const allies = live(pid).filter(x=> x.uid !== c.uid), foes = live(otherId(pid)), pool = allies.concat(foes);
    if(!pool.length) return null;
    const t = pool[Math.floor(rnd()*pool.length)], ally = allies.includes(t), tpid = ally ? pid : otherId(pid);
    let effect = 'smoke';
    if(ally){ t.smoke = Math.max(t.smoke||0, 1); t._smokeJustSet = true; }
    else if(effectsOf(t).keenSense) effect = 'none';
    else { effect = 'blind'; t.blind = Math.max(t.blind||0, 1); t._blindJustSet = true; }
    if(recordEvents && events) events.push({type:'smokeBomb', side:sideOf(pid), uid:c.uid, defId:c.defId, attUid:c.uid, attDefId:c.defId, targetSide:sideOf(tpid), targetUid:t.uid, targetDefId:t.defId, ally, effect});
    return t;
  }
  // Shield N (a unit's own, not the castle's): temporary Health that soaks damage after Shell's and never heals back. The skill
  // brings N when it arrives; the 'shield' trigger action grants more.
  function grantShield(pid, src, c, n, sideOf, events){
    if(!c || !(c.hp > 0) || !(n > 0)) return 0;
    c.shield = (c.shield||0) + n;
    if(recordEvents && events) events.push({type:'statusFx', kind:'unitShield', side:sideOf(pid), attDefId:src ? src.defId : c.defId, attUid:src ? src.uid : c.uid, targetSide:sideOf(pid), targetDefId:c.defId, targetUid:c.uid, amount:n, total:c.shield});
    return n;
  }
  // Electricity N: its landed hits arc to one enemy unit beside the target (a seeded pick) for N lightning (shock) damage. Wet units
  // (Swimmers and Tide units, anyone in the rain, anyone while the Tide is in) take +1 from the arc, and a wet target takes +1 too.
  function isWetUnit(c){ return !!c && (isTide(c) || !!(field && field.id === 'rain') || tideRising()); }
  function electricityArc(players, sideOf, pid, att, target, n, stats, events, killCredit){
    const tpid = otherId(pid), pl = players[tpid]; if(!pl || !target || !(n > 0)) return;
    const side = besideOf(pl, target), arc = side.length ? side[Math.floor(rnd()*side.length)] : null;
    const wetT = target.hp > 0 && isWetUnit(target), wetA = !!arc && isWetUnit(arc);
    if(recordEvents && events) events.push({type:'electricity', side:sideOf(pid), attUid:att.uid, attDefId:att.defId, targetSide:sideOf(tpid), targetUid:target.uid, arcUid: arc ? arc.uid : null, n, wetTarget:wetT, wetArc:wetA});
    const credit = c=>{ if(c.hp <= 0 && killCredit){ if(!killCredit[c.uid]) killCredit[c.uid] = new Set(); killCredit[c.uid].add(statKey(sideOf(pid), att.defId)); } };
    if(wetT){ skillAreaHit(players, sideOf, pid, att, target, 1, 'shock', stats, events, {electricity:true, wet:true}); credit(target); }
    if(arc){ skillAreaHit(players, sideOf, pid, att, arc, n + (wetA ? 1 : 0), 'shock', stats, events, {electricity:true, arc:true, wet:wetA || undefined}); credit(arc); }
  }

  function applyOnSpawnEffects(players, sideOf, playerId, boardCard, stats, events){
    if(events){ shieldEvents = events; shieldSideOf = sideOf; } // 2026-10-15: a Pounce on an Exposed unit reports its exposedHit into this play's events
    { const rdef = CARD_DEFS[boardCard.defId]; if(rdef && rdef.effects && rdef.effects.ritual && !boardCard.ritualBase){ const rp = players[playerId]; boardCard.ritualBase = {p: perishedTotal, d: rp.drawnTotal||0, c: rp.castleDealt||0}; } }
    const def = CARD_DEFS[boardCard.defId];
    if(!def.effects) return;
    const pl = players[playerId];
    const mySide = sideOf(playerId);
    // Lightning N (Ecclesia, 2026-10-10): on arrival a bolt strikes a random enemy unit (the castle if there are none)
    // for N, +1 for every 4 Prayer you have.
    if(def.effects.lightning){
      const foes = allBoardCards(players[otherId(playerId)]).filter(c=> c.hp>0 && !c.cageOf);
      const amt = (Number(def.effects.lightning)||0) + Math.floor(prayerOf(pl) / 4);
      const target = foes.length ? {kind:'card', card: foes[Math.floor(rnd()*foes.length)]} : {kind:'hq'};
      if(recordEvents && events) events.push({type:'statusFx', kind:'lightning', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, amount:amt});
      fireDamageAction(players, sideOf, playerId, boardCard.defId, amt, 'physical', target, stats, events, {}, boardCard.uid);
    }
    // Worthy N (2026-10-12, user: "Lumber-on-spawn creatures should give the opponent a lumber when they die. Make it a single
    // passive"): it brings N Lumber when it arrives, and its death gives the other side 1.
    // Rainmaker N (2026-10-12, user: "add a rainmaker evergreen that causes rain on summon"): Spring Rain for N rounds (3 by default).
    if(def.effects.tornado) tornadoStrike(players, sideOf, playerId, boardCard, Math.min(8, numN(def.effects.tornado, 1)), stats, events); // Tornado N (2026-10-14)
    if(def.effects.avalanche) avalancheStrike(players, sideOf, playerId, boardCard, numN(def.effects.avalanche, 1), stats, events); // Avalanche N (2026-10-14)
    if(def.effects.tsunami) tsunamiStrike(players, sideOf, playerId, boardCard, numN(def.effects.tsunami, 1), stats, events); // Tsunami N (2026-10-14)
    if(def.effects.rainmaker){ const rr = Math.max(1, Number(def.effects.rainmaker)||3); setField('rain', rr, mySide); if(recordEvents && events) events.push({type:'fieldSet', side:mySide, defId:boardCard.defId, field:'rain', rounds:rr, rainmaker:true}); }
    if(def.effects.worthy){ const got = addLumber(pl, Number(def.effects.worthy) === 0 ? 0 : (Number(def.effects.worthy)||1));
      ensureStat(stats, mySide, boardCard.defId).lumberGenerated += got;
      if(recordEvents && events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:got, cause:'worthy'}); }
    if(def.effects.onSpawnGold){
      // 2026-09-22: onSpawnGold now pays Lumber -- see newPlayer()'s comment on the acorns/
      // lumber retirement. Field name in card data (`onSpawnGold`) is unchanged, only the
      // resource it pays out.
      addLumber(pl, def.effects.onSpawnGold);
      ensureStat(stats, mySide, boardCard.defId).lumberGenerated += def.effects.onSpawnGold;
      if(recordEvents && events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:def.effects.onSpawnGold});
    }
    if(def.effects.onSpawnGrace){
      pl.grace += def.effects.onSpawnGrace;
      ensureStat(stats, mySide, boardCard.defId).graceGenerated += def.effects.onSpawnGrace;
      if(recordEvents && events) events.push({type:'grace', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:def.effects.onSpawnGrace});
    }
    if(def.effects.onSpawnDevilry){
      pl.devilry += def.effects.onSpawnDevilry;
      ensureStat(stats, mySide, boardCard.defId).devilryGenerated += def.effects.onSpawnDevilry;
      if(recordEvents && events) events.push({type:'devilry', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:def.effects.onSpawnDevilry});
    }
    // (The old Pack N arrival bonus is gone: Pack chains are live now, see packChainsOf. 2026-10-14)
    if(def.effects.converge && !(boardCard.wait > 0)) convergeBoard(players, sideOf, playerId, boardCard, def.effects.converge === true ? 'enemy' : def.effects.converge, events); // a Wait-0 unit is ready on arrival
    if(def.effects.missile && def.effects.missile.trigger==='onSpawn'){
      fireMissile(players, sideOf, playerId, boardCard, def.effects.missile, stats, events);
    }
    if(def.effects.render && def.effects.render.trigger==='onSpawn'){
      fireRender(players, sideOf, playerId, boardCard, def.effects.render, stats, events);
    }
    // Gash (2026-09-17): a one-shot burst of Bleed applied to whatever's directly opposite the
    // instant this card enters play — distinct from the passive Bleed keyword's per-attack
    // stacking, this fires exactly once, on spawn, same "one-shot on-spawn skill" shape as
    // Arrow/Render.
    if(def.effects.gash){
      fireGash(players, sideOf, playerId, boardCard, def.effects.gash, stats, events);
    }
    // Rally (2026-09-22, VFX coverage pass -- explicit report: "I like the effects you put behind
    // the cards. Any other effects we can try?"): the aura itself is a pure, continuously-live
    // stat recompute (recomputeRallyBonus, called every round with no event of its own -- see its
    // comment above) so there's never a single discrete "the buff changed" moment to hang a cue
    // on round after round. But the aura's ACTIVATION is discrete: the instant a Rally-bearing
    // card is played. A one-shot 'rally' event right here, on spawn, gives the front end a real
    // beat to react to (previously this had NO event at all -- completely silent) without
    // touching the every-round recompute itself.
    if(def.effects.rally){
      if(recordEvents && events) events.push({type:'rally', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:def.effects.rally});
    }
    // Earthquake (2026-09-21, task #304, per explicit request: "I want a few AOE skills too,
    // like Earthquake - do damage to all non flying units. I think it makes sense as a
    // Evergreen skill - so it can belong in passive abilities. By default, it just means - on
    // spawn, do an earthquake - regardless of ready or not."). Hooked into this same
    // applyOnSpawnEffects pass (same as Gash/Render/Missile's onSpawn firing above) rather than
    // gated behind gatherAttackers, so it genuinely fires the instant the card is played, before
    // Wait even matters — "regardless of ready or not" is automatic, not a special case.
    if(def.effects.earthquake){
      fireEarthquake(players, sideOf, playerId, boardCard, def.effects.earthquake, stats, events);
    }
    // Skyfall (2026-09-30, new evergreen, replaces Rally in the list — see PASSIVE_DEFS in
    // arena_app.js): the single-target ranged sibling of Earthquake's AOE, same "one-shot
    // on-spawn skill" shape as Gash/Earthquake/Render, reusing fireMissile so it lands on a
    // random live enemy (or the castle, if none are left) exactly like the Missile action does.
    if(def.effects.skyfall){
      fireMissile(players, sideOf, playerId, boardCard, {amount:def.effects.skyfall, dmgType:'physical'}, stats, events);
    }
    // Pounce (2026-10-12, user: "On Play – deal damage should be an evergreen keyword"): the named keyword for "when
    // played, deal N damage to a random enemy unit (the castle if there are none)". Fires on play, Waiting or not.
    if(def.effects.pounce){
      // 2026-10-15 (user: "I noticed pounce does a line of damage to the enemy. Is this because of Windy instead?"): the engine
      // always dealt one hit to one random enemy; the "line" was the look (a column of ghost cards rising straight up at the unit
      // opposite, then a thrown stone). The event now names its target and the hit is tagged pounce:true, so the board plays
      // a leap at the unit actually hit (arena_app.js / bramblewood-fx-a.js).
      const pev = {type:'pounce', side:sideOf(playerId), defId:boardCard.defId, uid:boardCard.uid, amount:def.effects.pounce, targetSide:sideOf(otherId(playerId))};
      if(recordEvents && events) events.push(pev);
      const foes = allBoardCards(players[otherId(playerId)]).filter(c=> c.hp>0 && !c.cageOf);
      let target = foes.length ? {kind:'card', card: foes[Math.floor(rnd()*foes.length)]} : {kind:'hq'};
      if(target.kind==='card'){ const sh = shieldCall(players[otherId(playerId)], target.card); if(sh) target = {kind:'card', card:sh}; }
      if(target.kind==='card'){ pev.targetUid = target.card.uid; pev.targetDefId = target.card.defId; }
      bleedTick(sideOf, playerId, boardCard, stats, events, 'skill');
      const pn0 = events ? events.length : 0;
      fireDamageAction(players, sideOf, playerId, boardCard.defId, Number(def.effects.pounce)||0, 'physical', target, stats, events, null, boardCard.uid);
      if(events) for(let i = pn0; i < events.length; i++){ const t = events[i].type; if((t==='hit' || t==='hitHQ' || t==='evaded') && events[i].attUid===boardCard.uid){ events[i].pounce = true; events[i].ranged = false; break; } } // plays as a leap, not a shot
    }
    noteTideCard(def);
    // Twin (2026-10-14, user: "Summon a twin on play: For 2 creatures, an early game trickster (base set) and a mutated beast in late
    // game"): when it arrives, a token copy of it (same stats and skills, minus Twin) appears in the nearest free slot.
    if(def.effects.twin && !boardCard.isTwin){ const t = spawnBeside(players, sideOf, playerId, boardCard, twinDefOf(boardCard.defId), stats, events, 'twin');
      if(t){ t.isTwin = true; t.atk = boardCard.atk; t.baseAtk = boardCard.baseAtk; t.hp = boardCard.hp; t.maxHp = boardCard.maxHp; t.wait = boardCard.wait; } }
    // Sprout N (2026-10-14, user: "Growth unit tokens - 1/3. Very strong - empowered by Swarm"): when it arrives, N Growth Sprouts
    // (1/3 tokens that count toward every ally's Swarm) sprout beside it.
    if(Number(def.effects.sprout) > 0 || def.effects.sprout === true){ const n = def.effects.sprout === true ? 1 : Math.min(6, Number(def.effects.sprout)||0);
      for(let k = 0; k < n; k++){ if(!spawnBeside(players, sideOf, playerId, boardCard, GROWTH_TOKEN, stats, events, 'sprout')) break; } }
    // Brood N (2026-10-14, user: "Swarm units tend to like summoning more units of their type"): when it arrives, N brood tokens of
    // its own kind hatch beside it: "<Name> Brood", 1/1, Wait 1, the same types (so they count for Swarm), with only Swarm (and
    // Flying if it flies).
    if(Number(def.effects.brood) > 0 || def.effects.brood === true){ const n = def.effects.brood === true ? 1 : Math.min(6, Number(def.effects.brood)||0), bid = broodDefOf(boardCard.defId);
      for(let k = 0; k < n; k++){ if(!spawnBeside(players, sideOf, playerId, boardCard, bid, stats, events, 'brood')) break; } }
    if(def.effects.moonpull && tideInNow() && recordEvents && events) events.push({type:'tide', tide:getTide(), round:turnNo, moonpull:true, side:mySide, defId:boardCard.defId, uid:boardCard.uid}); // Moonpull (2026-10-14)
    if(def.effects.rocket && !(boardCard.wait > 0)) fireRocket(players, sideOf, playerId, boardCard, Number(def.effects.rocket === true ? 1 : def.effects.rocket)||1, stats, events);
    // Shield N, Fireball N and Meteor N (2026-10-14, sixth pass): a Wait-0 unit is Ready on arrival, so its Fireball/Meteor goes then.
    if(def.effects.shield) grantShield(playerId, boardCard, boardCard, numN(def.effects.shield, 1), sideOf, events);
    if(def.effects.fireball && !(boardCard.wait > 0)) fireFireball(players, sideOf, playerId, boardCard, numN(def.effects.fireball, 15), stats, events);
    if(def.effects.meteor && !(boardCard.wait > 0)) fireMeteor(players, sideOf, playerId, boardCard, numN(def.effects.meteor, 20), stats, events);
    if(def.effects.chilli && !(boardCard.wait > 0)) eatChilli(sideOf, playerId, boardCard, numN(def.effects.chilli, 2), events); // Chilli N (2026-10-15): Ready on arrival
    // Coffee N (2026-10-13, user: "oo new ability, coffee"): it comes in wired (Wait -N), and once the cup wears off (N rounds
    // later) it crashes and naps for a round (Stunned 1).
    if(def.effects.coffee){ const n = Number(def.effects.coffee === true ? 1 : def.effects.coffee) || 1;
      const before = boardCard.wait || 0; boardCard.wait = Math.max(0, before - n); boardCard.coffeeCrash = n + 1;
      if(recordEvents && events) events.push({type:'statusFx', kind:'coffee', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:mySide, targetDefId:boardCard.defId, targetUid:boardCard.uid, amount: before - boardCard.wait}); }
    runCustomTriggers(players, sideOf, playerId, boardCard, def, 'onSpawn', stats, events);
  }
  // Earthquake: AOE version of Gash/Missile's "one-shot on-spawn skill" shape — instead of
  // targeting the single opposing card, it loops every live enemy across all three lanes (same
  // per-card fireDamageAction loop the generic "Deal damage" action already uses for its own
  // target:'all' option — see the 'damage' case in runCustomTriggers), skipping anything with
  // effects.flying:true. Reuses fireDamageAction per target rather than inventing a bespoke event
  // type, so each hit gets the same floating damage number / hit VFX / action-log line every
  // other damage source already gets, for free.
  // Rocket N (2026-10-13, user: "New Skill: Rocket"): once, when the unit is Ready (on arrival if it has no Wait), a rocket
  // flies at the strongest enemy unit (highest Attack; ties random): N damage to it and 1 to each enemy beside it. The castle
  // if the enemy has no units.
  // Helmet (2026-10-13, user: "50% chance to deflect arrow or missile or single target bolt"): a single shot aimed at it glances off
  // half the time. Splash, earthquakes and melee aren't shots.
  function helmetDeflects(target, side, events){
    const c = target && target.kind === 'card' ? target.card : null; if(!c || !(c.hp > 0)) return false;
    const e = (CARD_DEFS[c.defId]||{}).effects || {}; if(!e.helmet || rnd() >= 0.5) return false;
    if(recordEvents && events) events.push({type:'deflect', side, uid:c.uid, defId:c.defId});
    return true;
  }
  // Dynamite N (2026-10-13, user: "It doesn't have a wait, instead it has Dynamite 3: It comes with a red wait timer. When it counts
  // down to 0, it explodes, dealing damage to a 3x3 square, centered on it! If it dies in that time, no explosion - just whiff"):
  // the fuse burns down one a round; at 0 it blows up the cards on either side of it and the three enemy cards facing it
  // (effects.dynamiteDmg, 5 by default). The dynamiter itself holds on. Dead before the fuse runs out: nothing.
  function fireDynamite(players, sideOf, ownerId, card, stats, events){
    const pl = players[ownerId], enemy = players[otherId(ownerId)], dmg = Number(((CARD_DEFS[card.defId]||{}).effects||{}).dynamiteDmg) || 5;
    let mine = [], theirs = [];
    if(slotMode){ const s0 = card.slot; mine = allBoardCards(pl).filter(c=> c !== card && c.hp > 0 && Number.isInteger(c.slot) && Math.abs(c.slot - s0) <= 1); theirs = allBoardCards(enemy).filter(c=> c.hp > 0 && Number.isInteger(c.slot) && Math.abs(-c.slot - s0) <= 1); }
    else { const order = physicalRowOrder(pl), i = order.indexOf(card); mine = [order[i-1], order[i+1]].filter(c=> c && c.hp > 0);
      const opp = opposingCardOf(players, ownerId, card); if(opp){ const eo = physicalRowOrder(enemy), j = eo.indexOf(opp.card); theirs = [eo[j-1], opp.card, eo[j+1]].filter(c=> c && c.hp > 0); } }
    if(recordEvents && events) events.push({type:'dynamite', side:sideOf(ownerId), defId:card.defId, uid:card.uid, amount:dmg, hits: mine.length + theirs.length});
    theirs.concat(mine).forEach(c=> fireDamageAction(players, sideOf, ownerId, card.defId, dmg, 'heat', {kind:'card', card:c}, stats, events, null, card.uid));
  }
  // Chilli N (2026-10-15, user: "New skill Chilli." - an animal's one-off food skill, like Coffee and Banana): when it first
  // becomes Ready it eats a chilli. For the rest of the fight its attacks deal fire (heat) damage and it has +N Attack, but it
  // takes 1 damage at the start of every round (it's very hot; applyPoisonTicks). Once a fight.
  function eatChilli(sideOf, ownerId, card, n, events){
    if(!card || card._chilliEaten || !(card.hp > 0) || !(n > 0)) return; card._chilliEaten = true;
    card.chilli = n; card.atk += n; card.baseAtk = (card.baseAtk||0) + n;
    if(recordEvents && events) events.push({type:'statusFx', kind:'chilli', side:sideOf(ownerId), attDefId:card.defId, attUid:card.uid, targetSide:sideOf(ownerId), targetDefId:card.defId, targetUid:card.uid, amount:n});
  }
  function fireRocket(players, sideOf, ownerId, card, amount, stats, events){
    if(card._rocketFired) return; card._rocketFired = true;
    const enemy = players[otherId(ownerId)];
    const live = allBoardCards(enemy).filter(c=> c.hp > 0 && !c.cageOf);
    if(recordEvents && events) events.push({type:'statusFx', kind:'rocket', side:sideOf(ownerId), attDefId:card.defId, attUid:card.uid, targetSide:sideOf(otherId(ownerId)), amount});
    if(!live.length){ fireDamageAction(players, sideOf, ownerId, card.defId, amount, 'heat', {kind:'hq'}, stats, events, null, card.uid); return; }
    const top = Math.max(...live.map(c=> effAtk(c))), best = live.filter(c=> effAtk(c) === top), t = best[Math.floor(rnd()*best.length)];
    let side = [];
    if(slotMode){ side = live.filter(c=> c !== t && Number.isInteger(c.slot) && Math.abs(c.slot - t.slot) === 1); }
    else { const order = physicalRowOrder(enemy), i = order.indexOf(t); side = [order[i-1], order[i+1]].filter(c=> c && c.hp > 0); }
    fireDamageAction(players, sideOf, ownerId, card.defId, amount, 'heat', {kind:'card', card:t}, stats, events, null, card.uid);
    side.forEach(c=>{ if(c.hp > 0) fireDamageAction(players, sideOf, ownerId, card.defId, 1, 'heat', {kind:'card', card:c}, stats, events, null, card.uid); });
  }
  // Landslide N (2026-10-13, a new evergreen whose targets are set: "earthquake for example, doesnt let you 'switch targets'"):
  // when it falls, rocks come down on the enemy facing it and the enemy on each side of that one, N damage each. Flying units
  // are above it.
  function fireLandslide(players, sideOf, ownerId, card, amount, stats, events){
    const enemy = players[otherId(ownerId)];
    let cols = [];
    if(slotMode){ const s0 = card.slot; cols = allBoardCards(enemy).filter(c=> c.hp > 0 && Number.isInteger(c.slot) && Math.abs(c.slot - s0) <= 1); }
    else { const opp = opposingCardOf(players, ownerId, card); if(opp){ const order = physicalRowOrder(enemy), i = order.indexOf(opp.card); cols = [order[i-1], opp.card, order[i+1]].filter(c=> c && c.hp > 0); } }
    if(recordEvents && events) events.push({type:'earthquake', side:sideOf(ownerId), defId:card.defId, uid:card.uid, amount, landslide:true});
    cols.forEach(c=>{ const d = CARD_DEFS[c.defId]; if(d && d.effects && d.effects.flying) return;
      fireDamageAction(players, sideOf, ownerId, card.defId, amount, 'physical', {kind:'card', card:c}, stats, events, null, card.uid); });
  }
  function fireEarthquake(players, sideOf, ownerId, attCard, amount, stats, events){
    const enemy = players[otherId(ownerId)];
    bleedTick(sideOf, ownerId, attCard, stats, events, 'skill');
    // 2026-09-22 VFX coverage pass: before this, every Earthquake hit replayed as a plain 'hit'
    // event via fireDamageAction below -- indistinguishable on screen from an ordinary single-
    // target attack landing several times in a row, with no AOE-specific cue anywhere (the
    // similarly-named playEarthquake() whole-battlefield shake in arena_app.js is a size-based
    // heuristic for big-creature SPAWNS, unrelated to this skill). A dedicated one-shot
    // 'earthquake' event fires once, before the per-target hits, so the front end can play a
    // single "the ground shook" flourish that actually matches what triggered it.
    if(recordEvents && events) events.push({type:'earthquake', side:sideOf(ownerId), defId:attCard.defId, uid:attCard.uid, amount});
    const grounded = c=>{ const cDef = CARD_DEFS[c.defId]; return c.hp > 0 && !(cDef && cDef.effects && cDef.effects.flying); }; // Earthquake never hits Flying units
    ['left','center','right'].forEach(side=> enemy.row[side].slice().forEach(c=>{
      if(!grounded(c)) return;
      const before = events ? events.length : 0;
      fireDamageAction(players, sideOf, ownerId, attCard.defId, amount, 'physical', {kind:'card', card:c}, stats, events, null, attCard.uid);
      if(recordEvents && events) for(let i = before; i < events.length; i++) if(events[i].type==='hit' || events[i].type==='evaded') events[i].quake = true;
    }));
    // 2026-10-12 (user: "This skill should also hit allied non-flying as well"): the shaking ground hurts your own grounded
    // units too, every one but the caster itself.
    const own = players[ownerId];
    ['left','center','right'].forEach(side=> own.row[side].slice().forEach(c=>{
      if(c === attCard || !grounded(c)) return;
      const r = damageCard(c, amount, 'physical', null);
      ensureStat(stats, sideOf(ownerId), c.defId).taken += r.dmg;
      if(recordEvents && events) events.push({type:'hit', side:sideOf(ownerId), attDefId:attCard.defId, attUid:attCard.uid, targetSide:sideOf(ownerId), targetDefId:c.defId, targetUid:c.uid, dmg:r.dmg, dmgType:'physical', armorBlocked:r.armorBlocked, friendly:true, quake:true});
    }));
  }
  // Arrow N / Fire Arrow N (2026-10-04, "new skills: Arrow and Fire Arrow — an arrow flies towards
  // the enemy at high speed"): at the start of every round, before melee, each Ready card with
  // Arrow shoots once at the enemy facing it (a random enemy if nothing faces it, the castle if the
  // enemy board is empty) for N physical damage. Fire Arrow is the same shot as Heat damage, so
  // Heat resistance/weakness apply and a kill burns. Stunned/Frozen/Asleep archers hold fire.
  // Both can sit on one card (it shoots twice). Goes through fireDamageAction, so Evasion,
  // Guardian redirects, Expose and King Slayer all work as for any ranged hit.
  // The Bolt family (2026-10-15, user: "Fire bolt, Acid bolt, Poison bolt etc."): one implementation (fireArrowVolley's shots)
  // and this table, so a new element is one line here plus its registry entry. dmgType: the damage it deals (resistance and
  // weakness apply); noDamage: it deals none, only its status; status: what a landed spit leaves (applyShotStatus).
  //   Fire Bolt N    N fire (heat) damage (there is no Burn status in the game yet, so nothing lingers)
  //   Acid Bolt N    N acid damage + 1 Corrode
  //   Poison Bolt N  no damage; N Poison (at the castle: N poison damage)
  //   Ice Bolt N     N cold damage + a 1 in 2 chance of a Freeze counter (only on a unit with none)
  //   Shock Bolt N   N damage + Shocked for a round (takes 50% more damage)
  const BOLT_ELEMENTS = {
    fireBolt:   {element:'fire',   dmgType:'heat'},
    acidBolt:   {element:'acid',   dmgType:'acid',     status:'corrode'},
    poisonBolt: {element:'poison', dmgType:'poison',   status:'poison', noDamage:true},
    iceBolt:    {element:'ice',    dmgType:'cold',     status:'freezeCounter'},
    shockBolt:  {element:'shock',  dmgType:'physical', status:'shock'},
  };
  // What a landed Ice Arrow or Bolt leaves on the unit it hit (2026-10-15).
  function applyShotStatus(kind, n, c, src, side, tSide, events, aStat){
    if(!c || !(c.hp > 0)) return;
    const fx = (k, amount)=>{ if(recordEvents && events) events.push({type:'statusFx', kind:k, side, attDefId:src.defId, attUid:src.uid, targetSide:tSide, targetDefId:c.defId, targetUid:c.uid, amount}); };
    if(kind === 'corrode'){ c.corrode = (c.corrode||0) + 1; c._corrodeJustSet = true; fx('corrode', 1); }
    else if(kind === 'poison'){ if(resistFactor(c.defId, 'poison') === 0) return; c.poison = (c.poison||0) + n; if(aStat) aStat.poisonApplied = (aStat.poisonApplied||0) + n; fx('poison', n); }
    else if(kind === 'freezeCounter'){ if(c.frozen > 0 || resistFactor(c.defId, 'cold') === 0 || rnd() >= 0.5) return; c.frozen = 1; fx('freeze', 1); } // melts at this round's end, like the frost's chill
    else if(kind === 'shock'){ c.shocked = Math.max(c.shocked||0, 1); c._shockedJustSet = true; fx('shock', 1); }
  }
  function fireArrowVolley(players, sideOf, stats, events){
    let fired = false;
    [1,2].forEach(pid=>{
      if(passAttackerIds && !passAttackerIds.includes(pid)) return;
      const pl = players[pid]; if(!pl) return;
      const enemy = players[otherId(pid)];
      [...pl.row.left, ...pl.row.center, ...pl.row.right].forEach(c=>{
        if(c.hp<=0 || c.wait>0 || c.stunned || c.frozen>0 || c.asleep>0) return;
        if(passOnlyUid && c.uid !== passOnlyUid) return;
        const def = CARD_DEFS[c.defId]; const fx = def && def.effects; if(!fx) return;
        const shots = [];
        const fletch = (pl.perks && pl.perks.fletcher) ? 1 : 0; // Wildpath "Fletcher's Eye"
        if(fx.arrow > 0) shots.push({amount: fx.arrow + fletch, dmgType: 'physical', fire: false});
        if(fx.fireArrow > 0) shots.push({amount: fx.fireArrow, dmgType: 'heat', fire: true});
        // Ice Arrow N, Twin Shot N, Volley N (2026-10-15, user: "We need more creatures with 'Arrow'. Volley, Arrow, Twin Shot, Fire
        // Arrow, Ice Arrow etc. will be more normal."). Ice Arrow: N cold, and a 1 in 2 chance to lay a Freeze counter on a unit
        // that has none (so it can't keep a unit locked every round). Twin Shot: two arrows of N at two different random enemy
        // units (both at the one if there is only one). Volley: once every 2 rounds (its 1st, 3rd, 5th... Ready round), an arrow of
        // N at every enemy unit.
        if(Number(fx.iceArrow) > 0) shots.push({amount: Number(fx.iceArrow), dmgType: 'cold', ice: true, status: 'freezeCounter'});
        if(Number(fx.twinShot) > 0){ const foes = liveFoesOf(enemy); const pool = foes.slice(), picks = [];
          while(picks.length < 2 && pool.length) picks.push(pool.splice(Math.floor(rnd()*pool.length), 1)[0]);
          if(picks.length === 1) picks.push(picks[0]);
          for(let k = 0; k < 2; k++) shots.push({amount: Number(fx.twinShot), dmgType: 'physical', twin: true, at: picks[k] || 'hq'}); }
        if(Number(fx.volley) > 0){ c.volleyClock = (c.volleyClock||0) + 1;
          if(c.volleyClock % 2 === 1){ const foes = liveFoesOf(enemy);
            (foes.length ? foes : ['hq']).forEach(t=> shots.push({amount: Number(fx.volley), dmgType: 'physical', volley: true, at: t})); } }
        // The Bolts (2026-10-15, user: "We need bolts - these might be quite creature-specific. All elemental or status-y. They just
        // represents 'spits' of something at the enemy."): every round while Ready, before melee, it spits at the enemy opposite
        // (the nearest enemy unit if none is opposite; the castle if the board is empty). One shot per Bolt skill; what each
        // element does is in BOLT_ELEMENTS.
        Object.keys(BOLT_ELEMENTS).forEach(k=>{ const n = Number(fx[k]) || (fx[k] === true ? 1 : 0); if(!(n > 0)) return; const B = BOLT_ELEMENTS[k];
          shots.push({amount: B.noDamage ? 0 : n, n, dmgType: B.dmgType, bolt: B.element, status: B.status, boltKey: k}); });
        // Snipe N (2026-10-13, user: "Snipe N: If there is no opposing unit, shoot a random enemy for N damage").
        if(fx.snipe){ const opp0 = opposingCardOf(players, pid, c); if(!(opp0 && opp0.card && opp0.card.hp>0)){ const foes = allBoardCards(enemy).filter(x=> x.hp>0 && !x.cageOf);
          if(foes.length){ const t = foes[Math.floor(rnd()*foes.length)]; const amt = Number(fx.snipe === true ? 1 : fx.snipe)||1;
            if(recordEvents && events) events.push({type:'arrow', snipe:true, side: sideOf(pid), defId: c.defId, uid: c.uid, targetSide: sideOf(otherId(pid)), targetUid: t.uid, targetDefId: t.defId, amount: amt});
            fired = true; { const tg = {kind:'card', card: shieldCall(enemy, t) || t}; if(!helmetDeflects(tg, sideOf(otherId(pid)), events)) fireDamageAction(players, sideOf, pid, c.defId, amt, 'physical', tg, stats, events, null, c.uid); } } } }
        if(headwindDouble(c, pid)) shots.push(...shots.map(x=> Object.assign({}, x))); // Headwind: skills twice
        shots.forEach(shot=>{
          if(!(c.hp > 0)) return;
          let target;
          if(shot.at === 'hq') target = {kind:'hq'};
          else if(shot.at){ if(!(shot.at.hp > 0)) return; target = {kind:'card', card: shieldCall(enemy, shot.at) || shot.at}; }
          else { const opp = opposingCardOf(players, pid, c);
            const near = (opp && opp.card && opp.card.hp>0) ? opp.card : arrowTargetOf(players, pid, c);
            target = near ? {kind:'card', card: shieldCall(enemy, near) || near} : {kind:'hq'}; }
          const tEv = {side: sideOf(pid), defId: c.defId, uid: c.uid, targetSide: sideOf(otherId(pid)), targetUid: target.kind==='card' ? target.card.uid : null, targetDefId: target.kind==='card' ? target.card.defId : null, amount: shot.bolt ? shot.n : shot.amount};
          if(recordEvents && events) events.push(shot.bolt ? Object.assign({type:'bolt', element: shot.bolt, key: shot.boltKey}, tEv)
            : Object.assign({type:'arrow', fire: !!shot.fire, ice: shot.ice || undefined, twin: shot.twin || undefined, volley: shot.volley || undefined}, tEv));
          fired = true;
          if(helmetDeflects(target, sideOf(otherId(pid)), events)) return;
          let hitCard = null;
          if(shot.amount > 0 || target.kind !== 'card') hitCard = fireDamageAction(players, sideOf, pid, c.defId, shot.amount > 0 ? shot.amount : shot.n, shot.dmgType, target, stats, events, null, c.uid);
          else { // a no-damage spit (Poison Bolt): it can still be dodged, and a Guardian still steps in
            if(!dodgeCheck(target.card)){ if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:sideOf(pid), attDefId:c.defId, attUid:c.uid, targetSide:sideOf(otherId(pid)), targetDefId:target.card.defId, targetUid:target.card.uid, ranged:true}); }
            else hitCard = redirectToGuardian(enemy, target.card); }
          if(hitCard && shot.status) applyShotStatus(shot.status, shot.n || 1, hitCard, c, sideOf(pid), sideOf(otherId(pid)), events, ensureStat(stats, sideOf(pid), c.defId));
        });
      });
    });
    if(fired) removeDeadCards(players, sideOf, {}, stats, events);
  }
  // Nearest enemy for Arrow (2026-10-13, user: "Arrow should shoot the nearest enemy. If tied, random."): the same
  // nearest-unit rule Backstab uses. null when the enemy board is empty.
  function arrowTargetOf(players, ownerId, boardCard){
    const myCols = combatColumnsOf(players[ownerId]), enemyCols = combatColumnsOf(players[otherId(ownerId)]);
    let myCol = null; Object.keys(myCols).forEach(k=>{ const e = myCols[k]; if(e.kind==='card' && e.card.uid===boardCard.uid) myCol = Number(k); });
    if(myCol === null) return null;
    const r = nearestEnemyCard(players, ownerId, boardCard, myCols, enemyCols, myCol);
    return r && r.entry ? r.entry.card : null;
  }
  function fireMissile(players, sideOf, ownerId, attCard, eff, stats, events){
    const enemy = players[otherId(ownerId)];
    bleedTick(sideOf, ownerId, attCard, stats, events, 'skill');
    const amount = (eff.amount==='attack') ? attCard.atk : eff.amount;
    if(eff.target==='all'){
      ['left','center','right'].forEach(side=> enemy.row[side].slice().forEach(c=>{
        if(c.hp<=0) return;
        fireDamageAction(players, sideOf, ownerId, attCard.defId, amount, eff.dmgType, {kind:'card', card:c}, stats, events, null, attCard.uid);
      }));
      return;
    }
    const target = pickRandomEnemyTarget(enemy);
    if(!helmetDeflects(target, sideOf(otherId(ownerId)), events)) fireDamageAction(players, sideOf, ownerId, attCard.defId, amount, eff.dmgType, target, stats, events, null, attCard.uid);
    // resolve any kill this missile caused (separate pass so onDeathSpawn/bounty run in the normal cleanup)
  }
  // Gash (2026-09-17): the one-shot on-spawn version of Bleed, mirroring fireRender's shape
  // exactly (opposing-card lookup, Evasion-gated, no-op if nothing's opposite).
  function fireGash(players, sideOf, ownerId, attCard, amount, stats, events){
    const opp = opposingCardOf(players, ownerId, attCard);
    bleedTick(sideOf, ownerId, attCard, stats, events, 'skill');
    if(!opp) return;
    if(!dodgeCheck(opp.card)){
      if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:sideOf(ownerId), attDefId:attCard.defId, attUid:attCard.uid, targetSide:sideOf(otherId(ownerId)), targetDefId:opp.card.defId, targetUid:opp.card.uid});
      return;
    }
    opp.card.bleed = (opp.card.bleed||0) + amount;
    if(recordEvents && events) events.push({type:'gash', side:sideOf(ownerId), attDefId:attCard.defId, attUid:attCard.uid, targetSide:sideOf(otherId(ownerId)), targetDefId:opp.card.defId, targetUid:opp.card.uid, amount});
  }
  function fireRender(players, sideOf, ownerId, attCard, eff, stats, events){
    const opp = opposingCardOf(players, ownerId, attCard);
    bleedTick(sideOf, ownerId, attCard, stats, events, 'skill');
    if(!opp) return;
    // Evasion: Render is a skill effect, so a dodging target may ignore it entirely.
    if(!dodgeCheck(opp.card)){
      if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:sideOf(ownerId), attDefId:attCard.defId, attUid:attCard.uid, targetSide:sideOf(otherId(ownerId)), targetDefId:opp.card.defId, targetUid:opp.card.uid});
      return;
    }
    const before = opp.card.atk;
    opp.card.atk = Math.max(0, opp.card.atk - eff.amount);
    if(recordEvents && events) events.push({type:'render', side:sideOf(ownerId), attDefId:attCard.defId, attUid:attCard.uid, targetDefId:opp.card.defId, targetUid:opp.card.uid, amount:before-opp.card.atk});
    if(opp.card.hp>0){
      bleedTick(sideOf, otherId(ownerId), opp.card, stats, events, 'defend');
      runCustomTriggers(players, sideOf, otherId(ownerId), opp.card, CARD_DEFS[opp.card.defId], 'onAttacked', stats, events);
    }
  }
  function runCustomTriggers(players, sideOf, playerId, boardCard, def, hook, stats, events, extra){
    if(!def.effects || !Array.isArray(def.effects.triggers)) return;
    if(events){ shieldEvents = events; shieldSideOf = sideOf; } // Shield Call logs into whichever event list is live
    const pl = players[playerId], enemy = players[otherId(playerId)];
    const mySide = sideOf(playerId);
    const reps0 = headwindDouble(boardCard, playerId) ? 2 : 1; // Headwind: a Flyer's triggers go off twice (2026-10-13)
    for(let rep0 = 0; rep0 < reps0; rep0++) def.effects.triggers.filter(t=>t.on===hook).forEach((t, i)=>{
      // Generic "once" flag: this exact trigger fires at most once for this
      // specific board-card INSTANCE (not the card definition, so every copy
      // of a card in play gets its own one-time use).
      // On Turn Start (perTurn) whose-turn parameter (2026-10-10): 'self' fires only on rounds this card's owner
      // strikes first, 'enemy' only on the opponent's; unset/'both' = every round (the original Per Turn).
      if(hook==='perTurn' && t.turnOf && t.turnOf!=='both' && ((t.turnOf==='self') !== (curInitiative===playerId))) return;
      // Triggers are off while Waiting (2026-10-11, user: "We have to be clear that when the triggers are off ... When
      // the creature isn't ready, the lightning is greyed out"): a reactive trigger (On Attacked, On Ally Die, Per Turn,
      // On Ally Spawn ...) stays silent while its card is still Waiting. On Spawn, On Ready, On Death, On Exile, On
      // Attack, On Kill and On Discard always fire. A trigger can opt out with whileWaiting:true; whenReady (the
      // earlier per-trigger flag) is now simply the default.
      // 2026-10-11 (16:56 list, item 9): also off while Stunned, Frozen or Asleep. Primed cards keep every trigger online.
      if(boardCard && !ALWAYS_ON_HOOKS.has(hook) && !t.whileWaiting && !(def.effects && def.effects.primed) && (boardCard.wait>0 || boardCard.stunned || boardCard.frozen>0 || boardCard.asleep>0)) return;
      if(boardCard && boardCard.confused>0 && rnd() < 0.5){ if(recordEvents && events) events.push({type:'confusedWhiff', side:mySide, defId:boardCard.defId, uid:boardCard.uid, what:t.do}); return; } // Confused: the trigger fizzles
      if(t.once){
        const key = 'once:'+hook+':'+i;
        if(boardCard.firedOnce[key]) return;
        boardCard.firedOnce[key] = true;
      }
      // Archetype/type-tag filter (2026-09-16): lets a card author "On Ally Spawn, but only
      // if it's an Ant" (etc) instead of firing on every single spawn/death/heal. Only
      // meaningful on hooks that hand a specific OTHER card through `extra` — spawn/die/heal
      // hooks. On any other hook (onAttack, onKill, ...) a set filter simply never matches
      // (nothing in `extra` to check), so the editor only offers it where it's meaningful.
      if(t.filterArchetype){
        const subject = extra && (extra.spawnedCard || extra.diedCard || extra.healedCard || extra.healerCard || extra.readyCard || extra.movedCard);
        const subjDef = subject ? CARD_DEFS[subject.defId] : null;
        const subjArchetypes = (subjDef && subjDef.archetypes) || [];
        if(!subjArchetypes.includes(t.filterArchetype) && !(subjDef && subjDef.effects && subjDef.effects.changeling)) return; // a Changeling passes for any type
      }
      // 2026-10-08: announce the trigger itself (the app shows a small rune on the card and a soft
      // chime) before its effect's own events. Presentation only; nothing reads it for rules.
      if(recordEvents && events) events.push({type:'triggerFired', side:mySide, defId:boardCard.defId, uid:boardCard.uid, hook, action:t.do});
      const runAction = t=>{ switch(t.do){
        case 'gainGold': addLumber(pl, t.amount||0); ensureStat(stats,mySide,boardCard.defId).lumberGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break; // 2026-09-22: gainGold pays Lumber now
        case 'gainGrace': pl.grace += (t.amount||0); ensureStat(stats,mySide,boardCard.defId).graceGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'grace', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
        case 'gainDevilry': pl.devilry += (t.amount||0); ensureStat(stats,mySide,boardCard.defId).devilryGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'devilry', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
        // Gain (2026-09-30): unifies gainGrace/gainStone/gainLumber/gainDevilry into one action
        // with the resource picked as a parameter (see ACTION_DEFS in arena_app.js). Every
        // canonical card that used the old 4 keys was migrated to this one directly; the old keys
        // just above are kept as engine-only legacy aliases for any other save data.
        case 'gain': {
          const amt = t.amount||0;
          if(t.resource==='grace'){ pl.grace += amt; ensureStat(stats,mySide,boardCard.defId).graceGenerated += amt; if(recordEvents&&events) events.push({type:'grace', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); }
          else if(t.resource==='metal' || t.resource==='uranium'){ const got = t.resource==='metal' ? addOre(pl, 'metal', amt) : (pl.uranium = (pl.uranium||0) + amt, amt); if(recordEvents&&events) events.push({type:t.resource, side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:got}); }
          else if(t.resource==='stone'){ addOre(pl, 'stone', amt); if(recordEvents&&events) events.push({type:'stone', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); }
          else if(t.resource==='devilry'){ pl.devilry += amt; ensureStat(stats,mySide,boardCard.defId).devilryGenerated += amt; if(recordEvents&&events) events.push({type:'devilry', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); }
          else { addLumber(pl, amt); if(recordEvents&&events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); } // default: lumber
          break;
        }
        // gainStone/gainLumber/refine (2026-09-18): same shape as gainGold/gainGrace/gainDevilry
        // just above, minus the ensureStat(...) call — Stone/Lumber/Elemental Energy aren't
        // tracked in the Simulator's results-table columns yet (those are a fixed column set),
        // so there's nothing meaningful to add them to there today; the resource still lands on
        // the player and floats/pings its HUD pill correctly either way (see arena_app.js).
        case 'gainStone': addOre(pl, 'stone', t.amount||0); if(recordEvents&&events) events.push({type:'stone', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
        case 'gainLumber': addLumber(pl, t.amount||0); if(recordEvents&&events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
        // 2026-09-19 ("units that required the old resource, stone, or lumber, now change to
        // requiring lumber"): refine used to consume 1 Stone; now that discarding a unit only
        // ever grants Lumber (see pitchYieldOf in arena_app.js), refine consumes 1 Lumber
        // instead so its input actually matches what units grant on discard again.
        case 'refine': {
          if((pl.lumber||0) >= 1){
            pl.lumber -= 1;
            pl.elementalEnergy = (pl.elementalEnergy||0) + (t.amount||0);
            if(recordEvents&&events) events.push({type:'elementalEnergy', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0});
          }
          break;
        }
        case 'drawCard': draw(pl, t.count||1, mySide, stats, events); break;
        // Exile from your graveyard (2026-10-09, the active Exile zone): each card moved gives its owner 1 Echo.
        case 'exileGrave': {
          for(let k=0; k<(t.count||1) && pl.graveyard.length; k++){
            const [g] = pl.graveyard.splice(Math.floor(rnd()*pl.graveyard.length), 1);
            pl.exile.push(g); pl.echoes = (pl.echoes||0) + 1; ensureStat(stats, mySide, g.defId).exiled++;
            if(recordEvents && events) events.push({type:'exile', side:mySide, defId:g.defId, zone:'graveyard'});
            fireOnExile(players, sideOf, playerId, g.defId, stats, events);
          }
          break;
        }
        // Deal damage (2026-09-30): target generalized to who/sub (see the long comment above
        // ACTION_DEFS in arena_app.js) — old cards that still carry a bare `target` (no `who`,
        // pre-migration save data) fall back to the exact same reading they always had via the
        // legacyWho/legacySub mapping just below, so nothing already saved changes behavior.
        case 'damage': {
          bleedTick(sideOf, playerId, boardCard, stats, events, 'skill');
          const who = t.who || 'enemy';
          const sub = t.sub || (t.target==='all' ? 'all' : t.target==='random' ? 'random' : 'adjacent');
          // Custom/My-Attack/My-Health amount selector (2026-09-30): 'attack' and 'health' both
          // read the acting card's own CURRENT (post-buff) stat at the moment the trigger fires,
          // same live-value convention as the pre-existing "=Attack" support just below it.
          const amount = (t.amount==='attack') ? boardCard.atk : (t.amount==='health') ? boardCard.hp : (t.amount||0);
          if(sub==='all' && who!=='self'){
            const sidePl = who==='ally' ? pl : enemy;
            ['left','center','right'].forEach(side=> sidePl.row[side].slice().forEach(c=>{
              if(c.hp<=0) return;
              fireDamageAction(players, sideOf, playerId, boardCard.defId, amount, t.dmgType, {kind:'card', card:c}, stats, events, null, boardCard.uid);
            }));
            break;
          }
          // Random-enemy keeps its original HQ-inclusive pool (pickRandomEnemyTarget already
          // weighs "the castle" as one more possible pick alongside every live enemy card) —
          // Self/Ally random, and every 'adjacent'/'furthest' mode, never redirect to the HQ.
          if(who==='enemy' && sub==='random'){
            const r = pickRandomEnemyTarget(enemy);
            if(r.kind==='card'){ fireDamageAction(players, sideOf, playerId, boardCard.defId, amount, t.dmgType, {kind:'card', card:r.card}, stats, events, null, boardCard.uid); }
            else { fireDamageAction(players, sideOf, playerId, boardCard.defId, amount, t.dmgType, {kind:'hq'}, stats, events, null, boardCard.uid); }
            break;
          }
          const target = resolveGeneralTarget(players, playerId, boardCard, who, sub);
          if(target && target.card){ fireDamageAction(players, sideOf, playerId, boardCard.defId, amount, t.dmgType, {kind:'card', card:target.card}, stats, events, null, boardCard.uid); }
          break;
        }
        // Missile (2026-09-30, new — "Add an action called Missile. Missile just means do N
        // damage to a random enemy unit"): a fixed-target quick preset, deliberately no who/sub
        // picker. Reuses the same fireMissile helper Skyfall (evergreen, see applyOnSpawnEffects
        // below) and the legacy Arrow N preset both call.
        case 'missile': fireMissile(players, sideOf, playerId, boardCard, {amount:t.amount||0, dmgType:'physical'}, stats, events); break;
        // 2026-10-10 (user: "The improvement of stats should be clear! like esprit"): these two self-buffs now report
        // themselves (namedBuff, the same event Buff uses), so the board shows the gain.
        case 'buffAttack': boardCard.atk += (t.amount||0); if(recordEvents && events && t.amount) events.push({type:'namedBuff', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetDefId:boardCard.defId, targetUid:boardCard.uid, amount:t.amount||0, amount2:0}); break;
        // Buff (2026-09-30): merges buffAttack/buffHealth/buffAlly into one action with a
        // who/sub target (see the long comment above ACTION_DEFS in arena_app.js). Both amount
        // fields are always available now (Attack via t.amount, Health via t.amount2) — the old
        // self-only actions just above are kept as engine-only legacy aliases; canonical cards
        // that used them were migrated to who:'self' directly. Unlike Debuff, Buff never checks
        // Evasion — a buff is never something the target would want to dodge, matching how the
        // old buffAlly never checked it for an enemy target either.
        case 'buff': {
          const who = t.who || 'self';
          const target = resolveGeneralTarget(players, playerId, boardCard, who, t.sub);
          if(!target || !target.card) break;
          const c = target.card;
          const atkAmt = t.amount||0, hpAmt = t.amount2||0;
          if(atkAmt){ c.atk += atkAmt; c.baseAtk += atkAmt; }
          if(hpAmt){ c.hp += hpAmt; c.maxHp += hpAmt; }
          if(recordEvents && events) events.push({type:'namedBuff', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetDefId:c.defId, targetUid:c.uid, amount:atkAmt, amount2:hpAmt});
          break;
        }
        // Evasion gates poison/expose/stun/debuffAttack too — these are skill effects
        // "cast" at a target, same category as Render, even though they don't route
        // through fireDamageAction (no damage number, just a status/stat change). Each
        // now pushes a 'statusFx' event on a successful application (previously these
        // 4 actions were completely silent — no log line, no VFX hook at all) and an
        // 'evaded' event on a dodge, matching every other evasion-gated effect.
        case 'debuffAttack': {
          bleedTick(sideOf, playerId, boardCard, stats, events, 'skill');
          const apply = c=>{ c.atk = Math.max(0, c.atk-(t.amount||0)); if(recordEvents&&events) events.push({type:'statusFx', kind:'debuffAttack', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(otherId(playerId)), targetDefId:c.defId, targetUid:c.uid, amount:t.amount||0}); if(c.hp>0){ bleedTick(sideOf, otherId(playerId), c, stats, events, 'defend'); runCustomTriggers(players, sideOf, otherId(playerId), c, CARD_DEFS[c.defId], 'onAttacked', stats, events); } };
          const dodge = c=>{ if(recordEvents&&events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(otherId(playerId)), targetDefId:c.defId, targetUid:c.uid}); };
          if(t.target==='all'){ ['left','center','right'].forEach(side=> enemy.row[side].forEach(c=>{ if(c.hp>0) apply(c); })); break; } // area effect: Evade only dodges single-target
          const opp = opposingCardOf(players, playerId, boardCard); if(opp){ if(dodgeCheck(opp.card)) apply(opp.card); else dodge(opp.card); } break;
        }
        // Debuff (2026-09-30): the general mirror of Buff — lowers Attack (t.amount) and/or
        // Health (t.amount2), Health floored at 1 (this weakens, it never kills outright — use
        // Deal damage or Exile for that). who:'self' always lands (can't dodge your own effect,
        // same as Buff); Ally/Enemy is Evasion-gated, same as the legacy Debuff Attack above.
        case 'debuff': {
          const who = t.who || 'enemy';
          const target = resolveGeneralTarget(players, playerId, boardCard, who, t.sub);
          if(!target || !target.card) break;
          const c = target.card;
          if(who!=='self'){
            bleedTick(sideOf, playerId, boardCard, stats, events, 'skill');
            if(!dodgeCheck(c)){ if(recordEvents&&events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(who==='ally'?playerId:otherId(playerId)), targetDefId:c.defId, targetUid:c.uid}); break; }
          }
          const atkAmt = t.amount||0, hpAmt = t.amount2||0;
          if(atkAmt){ c.atk = Math.max(0, c.atk-atkAmt); c.baseAtk = Math.max(0, c.baseAtk-atkAmt); }
          if(hpAmt){ const reduced = Math.min(hpAmt, Math.max(0, c.hp-1)); if(reduced>0){ c.hp -= reduced; c.maxHp = Math.max(1, c.maxHp-hpAmt); } }
          if(recordEvents && events) events.push({type:'statusFx', kind:'debuffAttack', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(who==='ally'?playerId:otherId(playerId)), targetDefId:c.defId, targetUid:c.uid, amount:atkAmt});
          if(who!=='self' && c.hp>0){ bleedTick(sideOf, who==='ally'?playerId:otherId(playerId), c, stats, events, 'defend'); runCustomTriggers(players, sideOf, who==='ally'?playerId:otherId(playerId), c, CARD_DEFS[c.defId], 'onAttacked', stats, events); }
          break;
        }
        case 'buffHealth': boardCard.hp += (t.amount||0); boardCard.maxHp += (t.amount||0); if(recordEvents && events && t.amount) events.push({type:'namedBuff', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetDefId:boardCard.defId, targetUid:boardCard.uid, amount:0, amount2:t.amount||0}); break;
        // heal (2026-09-16): restores CURRENT hp up to the existing max — unlike buffHealth,
        // which permanently raises max HP too. Self-only, same convention as buffAttack/
        // buffHealth defaulting to the caster; fires the new heal trigger trio.
        // Shield (2026-10-14, user: "As an action - On X, Shield N"): N Shield (temporary Health) on itself (default), an ally, or
        // every ally (who:'ally', sub:'all' — 'allies').
        case 'shield': {
          const n = (t.amount==='attack') ? boardCard.atk : (t.amount==='health') ? boardCard.hp : Math.max(0, Number(t.amount)||0);
          const who = t.who === 'allies' ? 'ally' : (t.who || 'self'), sub = t.who === 'allies' ? 'all' : (t.sub || 'random');
          if(who === 'ally' && sub === 'all') physicalRowOrder(pl).filter(c=> c && !c.gap && c.hp > 0 && c.uid !== boardCard.uid).forEach(c=> grantShield(playerId, boardCard, c, n, sideOf, events));
          else { const tg = who === 'self' ? {card:boardCard} : resolveGeneralTarget(players, playerId, boardCard, who === 'enemy' ? 'ally' : who, sub); if(tg && tg.card) grantShield(playerId, boardCard, tg.card, n, sideOf, events); }
          break;
        }
        case 'heal': {
          // Custom/My-Attack/My-Health amount selector (2026-09-30) -- 'health' reads the card's
          // own CURRENT hp (captured before the heal applies, so it isn't inflated by its own
          // result), same live-value convention as 'attack' resolving to boardCard.atk elsewhere.
          const healAmount = (t.amount==='attack') ? boardCard.atk : (t.amount==='health') ? boardCard.hp : (t.amount||0);
          // Heal (2026-10-12, 23:12 list: "Change the Heal Self action to just Heal. The target will be its own parameter"):
          // who/sub like every other targeted action; no who = itself, as before.
          const who = t.who || 'self';
          const tg = who==='self' ? {card:boardCard} : resolveGeneralTarget(players, playerId, boardCard, who, t.sub || 'random');
          if(!tg || !tg.card) break;
          const foe = who==='enemy';
          const healed = applyHeal(tg.card, healAmount, foe ? sideOf(otherId(playerId)) : mySide, events);
          if(healed>0){ if(foe){ if(recordEvents && events) events.push({type:'heal', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetDefId:tg.card.defId, targetUid:tg.card.uid, amount:healed}); }
            else fireHealTriggers(players, sideOf, playerId, boardCard, tg.card, healed, stats, events); }
          break;
        }
        // Poison/Bleed/Expose/Stun/Increase Wait (2026-09-30): target generalized to who/sub via
        // the shared applyTargetedStatus helper above (see the long comment above ACTION_DEFS in
        // arena_app.js). Old cards without a `who` (pre-migration save data) fall back to the
        // exact same legacyWho/legacySub reading damage/exile use, so nothing already saved
        // changes behavior.
        case 'poison': {
          const who = t.who || 'enemy', sub = t.sub || (t.target==='all'?'all':t.target==='random'?'random':'adjacent');
          applyTargetedStatus(players, sideOf, playerId, boardCard, who, sub, t.amount||0, stats, events, mySide, 'poison', c=>{ c.poison = (c.poison||0)+(t.amount||0); });
          break;
        }
        // Bleed (custom-trigger version): stacks card.bleed on a target on demand — distinct
        // from the passive Bleed N keyword, which does this automatically on every hit a card
        // lands (see resolveCombat).
        case 'bleed': {
          const who = t.who || 'enemy', sub = t.sub || (t.target==='all'?'all':t.target==='random'?'random':'adjacent');
          applyTargetedStatus(players, sideOf, playerId, boardCard, who, sub, t.amount||0, stats, events, mySide, 'bleed', c=>{ c.bleed = (c.bleed||0)+(t.amount||0); });
          break;
        }
        case 'expose': {
          const who = t.who || 'enemy', sub = t.sub || (t.target==='all'?'all':t.target==='random'?'random':'adjacent');
          applyTargetedStatus(players, sideOf, playerId, boardCard, who, sub, t.amount||0, stats, events, mySide, 'expose', c=>{ c.exposed = (c.exposed||0)+(t.amount||0); });
          break;
        }
        case 'stun': {
          const who = t.who || 'enemy', sub = t.sub || (t.target==='all'?'all':t.target==='random'?'random':'adjacent');
          applyTargetedStatus(players, sideOf, playerId, boardCard, who, sub, null, stats, events, mySide, 'stun', c=>{ c.stunned = (c.stunned|0) + (t.count||1); c._stunnedJustSet = true; });
          break;
        }
        // addWait (2026-09-26, new basic action — "add a new set of basic abilities, triggers,
        // and actions"): the debuff-side counterpart to Reduce Wait — delays a target's next
        // action by pushing its Wait counter UP by N rounds, instead of Stun's full skip.
        case 'addWait': {
          const who = t.who || 'enemy', sub = t.sub || (t.target==='all'?'all':t.target==='random'?'random':'adjacent');
          applyTargetedStatus(players, sideOf, playerId, boardCard, who, sub, t.amount||0, stats, events, mySide, 'addWait', c=>{ c.wait = (c.wait||0)+(t.amount||0); });
          break;
        }
        // buffAlly (2026-09-26, renamed from buffNamedAlly — user: "just buff ally. target has
        // the options of left, right, & random ally, random enemy"): dropped the old name-text
        // matching mechanic for a plain positional/random target, same shape as the damage-style
        // actions' own `target` field. left/right resolve against physicalRowOrder (the same
        // true left-to-right visual order Guardian's redirectToGuardian above already uses) —
        // the caster's own immediate neighbor in that order, not a lane-index concept, since the
        // center slot sits physically between the two flanks rather than belonging to either.
        // randomAlly/randomEnemy pick any one living card from the respective board. A no-op if
        // the resolved target doesn't exist (no neighbor there, or an empty board).
        case 'buffAlly': {
          const atkAmt = t.amount||0, hpAmt = t.amount2||0;
          let target = null;
          if(t.target==='left' || t.target==='right'){
            const order = physicalRowOrder(pl);
            const idx = order.findIndex(c=>c.uid===boardCard.uid);
            if(idx!==-1){
              const cand = order[t.target==='left' ? idx-1 : idx+1];
              if(cand && cand.hp>0) target = cand;
            }
          } else if(t.target==='randomEnemy'){
            const pool = [...enemy.row.left, ...enemy.row.center, ...enemy.row.right].filter(c=>c.hp>0);
            if(pool.length) target = pool[Math.floor(rnd()*pool.length)];
          } else { // 'randomAlly', and the default when no target was ever set
            const pool = [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=>c.hp>0);
            if(pool.length) target = pool[Math.floor(rnd()*pool.length)];
          }
          if(target){
            target.atk += atkAmt; target.baseAtk += atkAmt;
            if(hpAmt){ target.hp += hpAmt; target.maxHp += hpAmt; }
            if(recordEvents && events) events.push({type:'namedBuff', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetDefId:target.defId, targetUid:target.uid, amount:atkAmt, amount2:hpAmt});
          }
          break;
        }
        case 'reduceWaitOfSpawned': { if(extra && extra.spawnedCard && extra.spawnedCard.wait>0){ extra.spawnedCard.wait = Math.max(0, extra.spawnedCard.wait-(t.amount||1)); } break; }
        // FIXED 2026-09-21 ("Spawning: Cards should look like they jump out of the spawner"):
        // this custom-trigger spawn (used by e.g. "On Round Start: Spawn 2 Maggots" style cards
        // -- the generic case, distinct from onDeathSpawn/onAttackedSpawn which already get a
        // live jump-from-origin entrance, see arena_app.js's pendingEntranceOrigins) used to push
        // the new card(s) straight onto the board with NO event at all -- no animation, no origin,
        // they'd just be sitting there on the next render as if they'd always been there. Now
        // records a 'spawn' event carrying `nearUid: boardCard.uid` (the card that DID the
        // spawning) and each new uid, in the same shape onAttackedSpawn already uses, so the
        // replay-side handler can play the exact same "born from the spawner and jumps to its
        // slot" entrance instead of a silent pop-in.
        case 'spawnCard': {
          const side = flankOrShorter(pl, findCardSide(pl, boardCard.uid) || 'left');
          const newUids = [];
          const newCards = [];
          const echoN = (pl.perks && pl.perks.echo) ? (pl.perks.echo = false, 1) : 0; // Wildpath "Echoing Wood": the first token comes with a copy
          for(let i=0;i<(t.count||1)+echoN;i++){ const nc = makeBoardCard(t.defId); pl.row[side].push(nc); newUids.push(nc.uid); newCards.push(nc); }
          if(recordEvents && events && newUids.length) events.push({type:'spawn', side:mySide, defId:t.defId, count:newUids.length, cause:'triggerSpawn', uids:newUids, lane:side, nearUid:boardCard.uid});
          // On Ally/Enemy Spawn (2026-09-27, "Spawn triggers now refer to those spawned from
          // units"): THIS is the genuine "spawned from a unit" case — a card's own ability
          // (this Spawn action) put a new card on the board, as opposed to it being played
          // from hand (see fireSpawnFamilyTriggers's own comment for the played/spawned split).
          newCards.forEach(nc=> fireSpawnFamilyTriggers(players, sideOf, playerId, nc, stats, events, 'spawned'));
          break;
        }
        case 'exileSelf': /* handled by caller for onDeath hook */ break;
        // Exile (2026-09-30, generalizes exileSelf — see the ACTION_DEFS comment in arena_app.js
        // for the "why does it assume itself" backstory). who:'self' is unchanged — it only ever
        // works paired with On Death and is handled entirely by the caller above, same as
        // exileSelf. Ally/Enemy is a genuinely new instant-removal effect: Evasion-gated like any
        // other harmful skill effect here, and unconditional once it lands (no Armor/Resist
        // mitigation — this isn't damage, it's direct removal). Implemented as a flagged kill
        // (card.forceExileZone + hp:0) that flows through the exact same end-of-round dead-card
        // sweep every other death already does — row reflow, onDeath triggers, Berserk/Esprit
        // reactions, graveyard-vs-exile decision — rather than reimplementing any of that here.
        case 'exile': {
          if(!t.who || t.who==='self') break; // self-exile is the legacy onDeath-only path above
          bleedTick(sideOf, playerId, boardCard, stats, events, 'skill');
          const target = resolveGeneralTarget(players, playerId, boardCard, t.who, t.sub);
          if(!target || !target.card) break;
          const c = target.card;
          const targetPid = t.who==='ally' ? playerId : otherId(playerId);
          if(!dodgeCheck(c)){ if(recordEvents&&events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(targetPid), targetDefId:c.defId, targetUid:c.uid}); break; }
          c.forceExileZone = true;
          c.hp = 0;
          if(recordEvents && events) events.push({type:'statusFx', kind:'exile', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(targetPid), targetDefId:c.defId, targetUid:c.uid});
          break;
        }
        // cleanse (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Cleanse"/Gwent's
        // "Purify" -- named "Renewal" on cards): strips every negative status this card is
        // currently carrying -- Poison, Bleed, Stun, Expose, and the new permanent Scar.
        // Self-only for now (pair with 'on: onReady' for "cures itself at the start of its
        // own turn"), matching how buffAttack/buffHealth above default to affecting the
        // caster rather than needing an explicit target.
        // Mind Control (2026-10-10): takes a unit from the opposing field and puts it on this side (a free slot needed).
        case 'mindControl': {
          const target = resolveGeneralTarget(players, playerId, boardCard, 'enemy', t.sub || 'random');
          if(!target || !target.card || target.card.hp<=0) break;
          const c = target.card, foe = players[otherId(playerId)];
          let mySlot = null; if(slotMode){ mySlot = resolvePlacementSlot(pl, rnd() < .5 ? 'left' : 'right'); if(mySlot===null) break; }
          for(const lane of ['left','center','right']){ const k = foe.row[lane].indexOf(c); if(k >= 0){ foe.row[lane].splice(k, 1); break; } }
          if(slotMode){ syncSlots(foe); putInSlot(pl, c, mySlot); } else { (pl.row.center.length ? pl.row[rnd() < .5 ? 'left' : 'right'] : pl.row.center).push(c); }
          if(recordEvents && events) events.push({type:'mindControl', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetDefId:c.defId, targetUid:c.uid, slot:c.slot});
          break;
        }
        // Player Stun (2026-10-10): the enemy player skips their next turn (plays no cards).
        case 'stunPlayer': {
          const foe = players[otherId(playerId)]; foe.skipTurns = (foe.skipTurns||0) + (t.count||1);
          if(recordEvents && events) events.push({type:'stunPlayer', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, turns: t.count||1});
          break;
        }
        case 'cleanse': {
          if(t.who && t.who!=='self'){ // Cleanse a chosen target (2026-10-12): the target's own owner's cell curse comes off first
            const tg = resolveGeneralTarget(players, playerId, boardCard, t.who, t.sub || 'random'); if(!tg || !tg.card) break;
            const tpid = t.who==='enemy' ? otherId(playerId) : playerId, c = tg.card;
            const n = cleanseCounters(players, tpid, c, t.amount || 999);
            if(!t.amount){ c.stunned = false; c.frozen = 0; c.asleep = 0; c.paralyzed = 0; c.blind = 0; c.tipsy = 0; c.confused = 0; c.staggered = 0; c.daunts = []; }
            if(n > 0 && recordEvents && events) events.push({type:'statusFx', kind:'cleanse', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(tpid), targetDefId:c.defId, targetUid:c.uid, amount:n});
            break;
          }
          // Cleanse N (2026-10-10, user: "Cleanse N - cleanses curses for example"): with an amount, removes up to N
          // harmful counters, curses on its cell first (Desecrate), then poison, bleed, decay, corrosion, scar, expose
          // and the skip-a-turn statuses. Without an amount it clears everything, as before.
          if(t.amount){ const n = cleanseCounters(players, playerId, boardCard, t.amount);
            if(n > 0 && recordEvents && events) events.push({type:'statusFx', kind:'cleanse', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:mySide, targetDefId:boardCard.defId, targetUid:boardCard.uid, amount:n});
            break; }
          const hadAny = boardCard.poison>0 || boardCard.bleed>0 || boardCard.stunned || boardCard.exposed>0 || boardCard.scar>0 || boardCard.frozen>0 || boardCard.asleep>0 || boardCard.paralyzed>0 || boardCard.tipsy>0 || boardCard.confused>0 || boardCard.blind>0 || boardCard.shocked>0 || boardCard.corrode>0 || boardCard.staggered>0;
          boardCard.poison = 0; boardCard.bleed = 0; boardCard.stunned = false; boardCard.exposed = 0; boardCard.scar = 0;
          boardCard.frozen = 0; boardCard.asleep = 0; boardCard.paralyzed = 0; boardCard.blind = 0; boardCard.tipsy = 0; boardCard.confused = 0; boardCard.shocked = 0; boardCard.corrode = 0; boardCard.staggered = 0; boardCard.daunts = [];
          if(hadAny && recordEvents && events) events.push({type:'statusFx', kind:'cleanse', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:mySide, targetDefId:boardCard.defId, targetUid:boardCard.uid});
          break;
        }
        // swapPositions ("Scurry" — invented skill, item #18): swaps the board positions of two
        // random LIVE enemy creatures (any lane, either flank) — a pure repositioning trick,
        // no damage or status attached. Pair it with On Spawn/On Ready/any other trigger. A
        // no-op if the enemy has fewer than 2 live creatures out.
        case 'swapPositions': {
          const liveCards = [];
          ['left','center','right'].forEach(side=> enemy.row[side].forEach((c,idx)=>{ if(c.hp>0 && !c.pinned) liveCards.push({side, idx, card:c}); }));
          if(liveCards.length>=2){
            let iA = Math.floor(rnd()*liveCards.length), iB = Math.floor(rnd()*liveCards.length);
            while(iB===iA) iB = Math.floor(rnd()*liveCards.length);
            const A = liveCards[iA], B = liveCards[iB];
            enemy.row[A.side][A.idx] = B.card;
            enemy.row[B.side][B.idx] = A.card;
            if(slotMode){ const t = A.card.slot; A.card.slot = B.card.slot; B.card.slot = t; syncSlots(enemy); }
            if(recordEvents && events) events.push({type:'swapPositions', side:mySide, attDefId:boardCard.defId, attUid:boardCard.uid, targetSide:sideOf(otherId(playerId)), aDefId:A.card.defId, aUid:A.card.uid, bDefId:B.card.defId, bUid:B.card.uid});
            // On Move (2026-09-27, per explicit request: "Add On Move"): fires on a card the
            // moment its OWN board position changes — today that's exactly what Swap does to
            // the two enemy creatures it repositions. Fires on both swapped cards, each one
            // tagged with the other as `movedCard` (so a filterArchetype check has something
            // to compare against, same convention as the spawn/die/heal/ready hooks above).
            const enemyPlayerId = otherId(playerId);
            if(A.card.hp>0) runCustomTriggers(players, sideOf, enemyPlayerId, A.card, CARD_DEFS[A.card.defId], 'onMove', stats, events, {movedCard:B.card});
            if(B.card.hp>0) runCustomTriggers(players, sideOf, enemyPlayerId, B.card, CARD_DEFS[B.card.defId], 'onMove', stats, events, {movedCard:A.card});
          }
          break;
        }
      } };
      // Targets (2026-10-12, 23:12 list): an action with a who/sub picker can hit several distinct targets (t.targets),
      // and who:'any' picks an ally or an opponent at random each time.
      // who:'killer' (2026-10-14): aim the action at the unit that killed it (On Death only); no killer, no action.
      if(t.who === 'killer'){ const k = extra && extra.killerCard; if(!k || !(k.hp > 0)) return;
        const kpid = allBoardCards(pl).includes(k) ? playerId : otherId(playerId);
        forcedTarget = k; try{ runAction(Object.assign({}, t, {who: kpid === playerId ? 'ally' : 'enemy', sub:'killer', targets:1})); } finally{ forcedTarget = null; }
        return; }
      const reps = (t.who && t.who!=='self' && t.sub!=='all' && (t.targets|0) > 1) ? Math.min(8, t.targets|0) : 1;
      targetExclude = reps > 1 ? new Set() : null;
      try{ for(let k=0; k<reps; k++) runAction(t.who==='any' ? Object.assign({}, t, {who: anySide(players, playerId, boardCard)}) : t); }
      finally{ targetExclude = null; }
    });
  }
  // fireSpawnFamilyTriggers (2026-09-27, per explicit request: "Spawn triggers now refer to
  // those spawned from units. For cards played, add On Ally Played and On Enemy Played") —
  // this used to be one function (fireAllySpawnTriggers) always firing onAllySpawn/onEnemySpawn,
  // called only when a card was PLAYED FROM HAND (or leader-summoned/debug-spawned) — never
  // when a card entered play because another card's ability put it there (the Spawn action,
  // On Death: Spawn). That meant "On Ally/Enemy Spawn" already read, in practice, as "on ally/
  // enemy PLAYED" — exactly the confusion this request calls out. Now the same firing logic
  // takes a `kind` and fires a different hook pair for each of the two real causes:
  //   kind:'played'  -> onAllyPlayed / onEnemyPlayed  (placeCard, summonLeader, debugSpawnCard)
  //   kind:'spawned' -> onAllySpawn  / onEnemySpawn   (the Spawn custom-trigger action, On
  //                                                     Death: Spawn — see their own call sites)
  // Only 1 canonical card used onAllySpawn under the old always-"played" semantics (Nest, "-1
  // Wait to the first ally played with Wait>0") — migrated to onAllyPlayed in canonical/cards.json
  // since that's genuinely what it was reacting to. onColumnSpawn keeps its existing generic
  // "something entered this column" scope and fires for both kinds — no card uses it yet
  // either way, so there's nothing to migrate. The Esprit anthem effect deliberately stays
  // scoped to kind:'played' only (unchanged from its pre-existing behavior) rather than also
  // reacting to unit-spawned allies — that's a broader behavior change nobody asked for here.
  // 2026-10-14 (user: "Spawns should also power up your espirit! (if it already does then nvm) Espirit only works for units
  // that share a type"): spawned units (tokens, brood, twins, hatched eggs, shields) now count as well as played ones, but only an
  // ally that shares a type (archetype) with the Esprit unit powers it up.
  function espritFrom(sideOf, playerId, src, newCard, events){
    const def = src && CARD_DEFS[src.defId], nd = newCard && CARD_DEFS[newCard.defId];
    if(!def || !nd || src === newCard || !(src.hp > 0) || !def.effects || !(def.effects.esprit || def.effects.espritHp)) return false;
    const mine = def.archetypes || [], theirs = nd.archetypes || [];
    if(!mine.some(t=> theirs.includes(t))) return false;
    const ea = def.effects.esprit || 0, eh = def.effects.espritHp || 0;
    src.atk += ea; src.baseAtk += ea;
    if(eh){ src.hp += eh; if(typeof src.maxHp === 'number') src.maxHp += eh; }
    if(recordEvents && events) events.push({type:'statusFx', kind:'esprit', side:sideOf(playerId), attDefId:src.defId, attUid:src.uid, amount:ea, hp:eh});
    return true;
  }
  function espritForArrival(players, sideOf, playerId, newCard, events){ const pl = players[playerId]; if(!pl) return; allBoardCards(pl).forEach(src=> espritFrom(sideOf, playerId, src, newCard, events)); }
  function fireSpawnFamilyTriggers(players, sideOf, playerId, newlyPlacedCard, stats, events, kind){
    const allyHook = kind==='spawned' ? 'onAllySpawn' : 'onAllyPlayed';
    const enemyHook = kind==='spawned' ? 'onEnemySpawn' : 'onEnemyPlayed';
    const pl = players[playerId];
    const sources = [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=>c.uid!==newlyPlacedCard.uid);
    if(pl.castle) sources.push(pl.castle);
    const newDef = CARD_DEFS[newlyPlacedCard.defId];
    const newArchetypes = (newDef && newDef.archetypes) || [];
    sources.forEach(src=>{
      const def = CARD_DEFS[src.defId];
      runCustomTriggers(players, sideOf, playerId, src, def, allyHook, stats, events, {spawnedCard:newlyPlacedCard});
      // Esprit X/Y (anthem, item #14; 2026-10-08: any ally now, not just a shared archetype, and Health too via
      // espritHp): a permanent self-buff whenever another ally is played (kind 'played' only, as before).
      // 2026-10-14 (user: "Spawns should also power up your espirit! (if it already does then nvm) Espirit only works for units
      // that share a type"): spawned units (tokens, brood, twins, hatched eggs) now count as well as played ones, but only an ally
      // that shares a type (archetype) with the Esprit unit powers it up.
      espritFrom(sideOf, playerId, src, newlyPlacedCard, events);
    });
    // On Enemy Spawn/Played (2026-09-16, split 2026-09-27): mirrors the ally hook above but
    // cross-side — fires on every card the OPPONENT currently controls. Lets a card react
    // defensively to what the enemy is doing ("whenever the enemy plays/spawns a unit, ...").
    const enemy = players[otherId(playerId)];
    if(enemy){
      const enemySources = [...enemy.row.left, ...enemy.row.center, ...enemy.row.right];
      enemySources.forEach(src=>{
        runCustomTriggers(players, sideOf, otherId(playerId), src, CARD_DEFS[src.defId], enemyHook, stats, events, {spawnedCard:newlyPlacedCard});
      });
    }
    // On Column Spawn (2026-09-16): fires on every OTHER live card (either side) that shares
    // this new card's combat column — lane-mate reactivity, distinct from Ally/Enemy's "anyone
    // on my/their board" scope. Fires for BOTH kind values — it's about column entry, not about
    // how the card got there. Uses the same column numbering combatColumnsOf/targeting already
    // shares between both players (see resolveLiveTarget), so "same column" reads as "directly
    // facing, or would-be-facing, this new arrival."
    const newCol = columnOfCard(pl, newlyPlacedCard.uid);
    if(newCol!==null){
      [players[1], players[2]].forEach(p2=>{
        const cols = combatColumnsOf(p2);
        Object.entries(cols).forEach(([colStr, entry])=>{
          if(entry.kind!=='card' || Number(colStr)!==newCol || entry.card.uid===newlyPlacedCard.uid) return;
          runCustomTriggers(players, sideOf, p2.id, entry.card, CARD_DEFS[entry.card.defId], 'onColumnSpawn', stats, events, {spawnedCard:newlyPlacedCard});
        });
      });
    }
  }
  // Small helper for On Column Spawn: finds a just-placed card's own combat column by uid.
  function columnOfCard(pl, uid){
    const cols = combatColumnsOf(pl);
    for(const [colStr, entry] of Object.entries(cols)){
      if(entry.kind==='card' && entry.card.uid===uid) return Number(colStr);
    }
    return null;
  }

  // Saving reach (2026-10-09): 2 turns. Saving further (or refusing smaller costly cards while saving)
  // cost the CPU more tempo than the big card won back under today's discard-only Lumber (decision B4).
  const SAVE_REACH = 2;
  function aiTakeTurn(players, sideOf, aiId, stats, events){
    aiTakeTurnOnce(players, sideOf, aiId, stats, events);
    for(let k = 1; k < ACTIONS; k++){
      const ai = players[aiId]; if(ai.playedThisTurn || (ai.skipTurns||0) > 0) break;
      const before = ai.playsThisTurn || 0; aiTakeTurnOnce(players, sideOf, aiId, stats, events);
      if((ai.playsThisTurn || 0) === before) break;
    }
  }
  function aiTakeTurnOnce(players, sideOf, aiId, stats, events){
    const ai = players[aiId];
    const affordable = ai.hand.filter(hc => canPlay(ai, hc.defId, hc.uid));
    // Skirmish leaders (2026-10-08): a skirmish can give the CPU optional leaders (reserveLeaders). Each can be
    // summoned once; the CPU brings one out now and then, or whenever it has nothing else it can play.
    const fieldCard = ai.hand.find(hc=> CARD_DEFS[hc.defId] && CARD_DEFS[hc.defId].field && canPlay(ai, hc.defId, hc.uid));
    if(fieldCard && rnd() < 0.5) placeCard(players, sideOf, aiId, fieldCard.uid, 'left', stats, events);
    if(ai.reserveLeaders && ai.reserveLeaders.length && !ai.playedThisTurn){
      const ready = ai.reserveLeaders.filter(id=> CARD_DEFS[id] && canPlay(ai, id, null));
      if(ready.length && (!affordable.length || rules.bossSurge || rnd() < 0.35)){ // a surging boss comes out the moment it can
        const id = ready[Math.floor(rnd()*ready.length)];
        if(summonLeader(players, sideOf, aiId, id, rnd() < 0.5 ? 'left' : 'right', stats, events)){ ai.reserveLeaders = ai.reserveLeaders.filter(x=> x!==id); return; }
      }
    }
    // Saving up (2026-10-09, balance pass): the CPU used to discard only when it had nothing free to
    // play, so a hand with any free card never banked Lumber and costly cards (dragons, elites' big
    // threats) were almost never played. Now, holding a card it can't afford yet, it pitches its
    // weakest other card to the Graveyard first (+1 Lumber, once a turn, same as a player), and once
    // a saved-for card is affordable it usually plays that instead of a random free one.
    const cardValue = id=>{ const d = CARD_DEFS[id] || {}; return (d.attack||0) + (d.health||0)*0.45 + Object.keys(d.effects||{}).length*1.5 + costOfCard(id)*2; };
    if(!ai.discardUsedThisTurn && ai.hand.length > 1){
      const saving = ai.hand.filter(hc=> !(CARD_DEFS[hc.defId] && CARD_DEFS[hc.defId].field) && costOfCard(hc.defId) > ai.lumber && costOfCard(hc.defId) <= ai.lumber + SAVE_REACH); // within two turns' reach: saving longer costs more tempo than the card gives back (tested 2026-10-09)
      if(saving.length){
        const pitchable = ai.hand.filter(hc=> !saving.includes(hc) && costOfCard(hc.defId) === 0 && !(CARD_DEFS[hc.defId] && CARD_DEFS[hc.defId].field));
        if(pitchable.length && (ai.hand.length >= 3 || !affordable.length)){
          const worst = pitchable.reduce((a, b)=> cardValue(b.defId) < cardValue(a.defId) ? b : a);
          ai.hand.splice(ai.hand.indexOf(worst), 1);
          ai.graveyard.push({defId:worst.defId});
          ai.lumber += 1;
          ai.discardUsedThisTurn = true;
          if(recordEvents && events) events.push({type:'discard', side:sideOf(aiId), defId:worst.defId});
        }
      }
    }
    // Devilry (2026-10-10): cast a Beware card from exile, or feed a Devourer, before the normal play.
    if(!ai.playedThisTurn){ const ix = ai.exile.findIndex(e=> canCastFromExile(ai, e.defId)); if(ix >= 0 && rnd() < 0.7) castFromExile(players, sideOf, aiId, ix, rnd() < .5 ? 'left' : 'right', stats, events); }
    if(!ai.playedThisTurn && ai.hand.length > 1){ const dv = allLive(ai).find(c=> !c.devoured && CARD_DEFS[c.defId].effects && CARD_DEFS[c.defId].effects.devour);
      if(dv && rnd() < 0.4){ const food = ai.hand.reduce((a, b)=> cardValue(b.defId) < cardValue(a.defId) ? b : a); devour(players, sideOf, aiId, dv.uid, food.uid, stats, events); } }
    // Ecclesia (2026-10-10): one Prayer short of an Ecclesia card? Offer the weakest other hand card for it.
    if(!ai.playedThisTurn && ai.hand.length > 1 && ai.prayerOfferTurn !== turnNo){
      const near = ai.hand.find(hc=> prayerReqOf(hc.defId) > 0 && !canPlay(ai, hc.defId, hc.uid) && canPlay(ai, hc.defId, hc.uid, 0, 1));
      if(near && rnd() < 0.8){ const others = ai.hand.filter(h=> h !== near); const food = others.reduce((a, b)=> cardValue(b.defId) < cardValue(a.defId) ? b : a);
        if(placeCard(players, sideOf, aiId, near.uid, rnd() < 0.5 ? 'left' : 'right', stats, events, {prayerOffer: food.uid})) return; }
    }
    const playable = ai.hand.filter(hc => canPlay(ai, hc.defId, hc.uid) && !(CARD_DEFS[hc.defId] && CARD_DEFS[hc.defId].darkSummon));
    const darkPick = ai.hand.find(hc=> CARD_DEFS[hc.defId] && CARD_DEFS[hc.defId].darkSummon && canPlay(ai, hc.defId, hc.uid));
    if(darkPick) placeCard(players, sideOf, aiId, darkPick.uid, rnd() < 0.5 ? 'left' : 'right', stats, events);
    const hadPlay = playable.length && !ai.playedThisTurn;
    if(hadPlay){
      // 2026-10-10 (user: "they shouldn't just always play the cheapest card. If they have 1 1-lumber cost and 1 2-lumber
      // cost card, they pick which is better for the scenario"): every playable card is scored for the board in front of
      // it, then the best is played (a little noise keeps it from being fully predictable).
      const foe = players[otherId(aiId)], foes = allLive(foe), mine = allLive(ai);
      const foeAtk = foes.reduce((t, c)=> t + (c.atk||0), 0), foeFliers = foes.filter(c=> CARD_DEFS[c.defId] && CARD_DEFS[c.defId].effects && CARD_DEFS[c.defId].effects.flying).length;
      const myHq = ai.hq ? ai.hq.hp / Math.max(1, ai.hq.maxHp) : 1, foeHq = foe.hq ? foe.hq.hp / Math.max(1, foe.hq.maxHp) : 1;
      const situational = id=>{
        const d = CARD_DEFS[id] || {}, e = d.effects || {}; let v = cardValue(id);
        if(myHq < 0.4 || foeAtk > (mine.length+1)*4) v += (d.health||0)*0.5 + (e.armor||0)*2 + (e.bulwark||0)*3; // under pressure: walls
        if(foeHq < 0.35) v += (d.attack||0)*1.2 + (e.quick ? 4 : 0) + ((e.puncture||0) + (e.perforate||0))*2 + (e.overwhelm ? 3 : 0); // closing out: damage now
        if(foeFliers) v += (e.flying ? 2 : 0) + (e.reach ? 3 : 0) + ((e.antiAir || e.boomerang || e.bananarang) ? 3 + 2*foeFliers : 0);
        if(d.wait) v -= d.wait * (foeHq < 0.35 || myHq < 0.4 ? 2.5 : 1); // slow cards are worth less when it's urgent
        // Spells (2026-10-11): worth what they'd do right now; nothing to do means don't cast it.
        if(d.cardType === 'spell'){ const sp = d.spell || {}, n = Number(sp.amount)||0;
          const gain = (sp.do==='hasten' || sp.do==='tailwind') ? mine.reduce((t, c)=> t + Math.min(n, c.wait||0), 0) * 3 + (sp.do==='tailwind' ? mine.filter(c=> ((CARD_DEFS[c.defId]||{}).effects||{}).flying).length * 4 : 0)
            : sp.do==='mend' ? mine.reduce((t, c)=> t + Math.min(n, (c.maxHp||0) - (c.hp||0)), 0) * 0.8
            : sp.do==='sap' ? foes.reduce((t, c)=> t + Math.min(n, c.atk||0), 0) * 2 : 0;
          v = gain > 0 ? gain : -99; }
        return v + rnd()*1.5;
      };
      const scored = playable.map(hc=> [hc, situational(hc.defId)]);
      const best = scored.reduce((a, b)=> b[1] > a[1] ? b : a);
      // Only a useless spell left? Hold it (fall through to equipment below) rather than waste the turn on it.
      if(best[1] > -50){ let side = rnd() < 0.5 ? 'left' : 'right';
        { const pk = packPlacementFor(ai, best[0].defId); if(pk != null) side = pk; } // Packs try to be adjacent (2026-10-14)
        placeCard(players, sideOf, aiId, best[0].uid, side, stats, events); }
    }
    // Equipment (2026-10-11): with the turn's play still free, strap a carried item onto its strongest unit.
    if(!ai.playedThisTurn){ const eq = ai.hand.find(hc=> CARD_DEFS[hc.defId] && CARD_DEFS[hc.defId].cardType === 'equipment');
      if(eq){ const tgt = allLive(ai).filter(c=> canEquip(ai, eq.uid, c.uid)).sort((a, b)=> (b.atk + b.hp) - (a.atk + a.hp))[0]; if(tgt) equip(players, sideOf, aiId, tgt.uid, eq.uid, stats, events); } }
    if(hadPlay){ /* played (or held a useless spell) above */
    } else if(!ai.discardUsedThisTurn && ai.hand.length){
      // Nothing it can play (2026-10-12, user: "sometimes, the CPU doesn't play anything - I assume its because their hand is
      // overcosted. Are they able to pitch for resources?"): it pitches for Lumber, but no longer a random card. It keeps the
      // card nearest to affordable (the one the Lumber is for) and pitches the weakest of the rest.
      const need = hc=> costOfCard(hc.defId) - (ai.lumber||0);
      const target = ai.hand.length > 1 ? ai.hand.reduce((a, b)=> (need(b) < need(a) || (need(b) === need(a) && cardValue(b.defId) > cardValue(a.defId))) ? b : a) : null;
      const pool = ai.hand.filter(hc=> hc !== target);
      const worst = pool.reduce((a, b)=> cardValue(b.defId) < cardValue(a.defId) ? b : a);
      const idx = ai.hand.indexOf(worst);
      const [dc] = ai.hand.splice(idx,1);
      ai.graveyard.push({defId:dc.defId});
      ai.lumber += 1; // 2026-09-22: this simple sim-AI discard income now matches the real Lumber-discard economy (was a stale hardcoded Gold grant)
      ai.discardUsedThisTurn = true;
      if(recordEvents && events) events.push({type:'discard', side:sideOf(aiId), defId:dc.defId});
    } else if(!ai.hand.length){
      // 2026-09-25 (explicit user request, "when he runs out of cards, he just plays Bee
      // Tanks"): a completely empty hand used to mean the AI did nothing at all that turn —
      // both branches above require hand.length>0. Bee Tank (canonical/cards.json, id
      // "bee-tank", 4/4, 0 wait) is a token/spawn-only card (same convention as bee-swarmling
      // etc — token:true keeps it out of every draftable pool, see getDraftableIds in
      // arena_app.js) built specifically as this fallback's payload, never obtainable any other
      // way. Goes through debugSpawnCard rather than placeCard since there's no hand card to
      // play and no cost to pay — it's a free failsafe unit, not a real draw. This fires for
      // EVERY aiTakeTurn caller (Test Battle's AI opponent, Gauntlet's AI opponent, and the bulk
      // simulator's AI-vs-AI mode), since aiTakeTurn is shared across all three — see its call
      // sites in arena_app.js's aiActNow() and twice more below in this file.
      // ai.loopCards (2026-10-03, enemy behaviours): which weak "loop" units this side falls back
      // on once it's out of cards. Unset keeps the original Bee Tank; [] means it plays nothing.
      const loop = Array.isArray(ai.loopCards) ? ai.loopCards.filter(id=> CARD_DEFS[id]) : ['bee-tank'];
      if(loop.length){
        const side = rnd() < 0.5 ? 'left' : 'right';
        debugSpawnCard(players, sideOf, aiId, loop.length===1 ? loop[0] : loop[Math.floor(rnd()*loop.length)], side, stats, events);
      }
    }
  }
  function applyPoisonTicks(players, sideOf, stats, events){
    const p1=players[1], p2=players[2];
    const poisoned = [];
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ if(c.poison>0) poisoned.push({pl,card:c}); })));
    // Curses tick alongside poison: every unit standing on a cursed cell takes the cell's total.
    const cursed = [];
    if(Object.keys(curses).length) [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ const k = cellKeyOf(players, pl.id, c); if(k && curses[k] > 0) cursed.push({pl, card:c, n:curses[k]}); })));
    // Chilli (2026-10-15): a unit that ate one takes 1 damage at the start of every round ("it's very hot").
    const hot = []; [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ if(c.chilli > 0 && c.hp > 0) hot.push({pl, card:c}); })));
    for(const {pl,card} of hot){ if(card.hp<=0) continue; const dmg = damageCardFlat(card, 1, 'chilli'); ensureStat(stats, sideOf(pl.id), card.defId).taken += dmg;
      if(recordEvents && events) events.push({type:'statusFx', kind:'chilliBurn', side:sideOf(pl.id), attDefId:card.defId, attUid:card.uid, targetSide:sideOf(pl.id), targetDefId:card.defId, targetUid:card.uid, amount:dmg}); }
    if(!poisoned.length && !cursed.length){ if(hot.length) removeDeadCards(players, sideOf, {}, stats, events); return; }
    for(const {pl,card} of poisoned){
      if(card.hp<=0) continue;
      const dmg = damageCardFlat(card, card.poison, 'poison');
      ensureStat(stats, sideOf(pl.id), card.defId).taken += dmg;
      const decay = !statusDecayHeld() && card.poison > 0; // 2026-10-10: each tick wears the stack down by 1 (see bleedTick)
      if(decay) card.poison -= 1;
      if(recordEvents && events) events.push({type:'poisonTick', side:sideOf(pl.id), defId:card.defId, uid:card.uid, dmg, decay});
    }
    for(const {pl,card,n} of cursed){
      if(card.hp<=0) continue;
      const dmg = damageCardFlat(card, n, 'curse');
      ensureStat(stats, sideOf(pl.id), card.defId).taken += dmg;
      if(recordEvents && events) events.push({type:'curseTick', side:sideOf(pl.id), defId:card.defId, uid:card.uid, dmg});
    }
    removeDeadCards(players, sideOf, {}, stats, events);
  }
  // Decay (2026-09-29, per explicit request: "the Decay skill, w/ power parameter N=3, then when
  // it hits an enemy, it also decreases the opposing unit's Attack AND Health values by 3") — a
  // separate PASSIVE skill (effects.decay=N) from the new Poison/Decay elemental dmgType
  // conversion in computeHitDamage. Architecturally mirrors Poison exactly: a persistent stack
  // counter (card.decay) that builds on every landed hit and ticks once per round via this
  // function, called right alongside applyPoisonTicks in resolveCombat. Unlike Poison, each
  // tick both deals flat HP damage AND permanently saps the stack amount off the card's Attack
  // (floored at 0) -- Decay is meant to be a compounding, ATK-eroding debuff, not just a damage
  // stack.
  function applyDecayTicks(players, sideOf, stats, events){
    const p1=players[1], p2=players[2];
    const decayed = [];
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{ if(c.decay>0) decayed.push({pl,card:c}); })));
    if(!decayed.length) return;
    for(const {pl,card} of decayed){
      if(card.hp<=0) continue;
      const amt = card.decay;
      card.atk = Math.max(0, card.atk - amt);
      if(card.baseAtk!=null) card.baseAtk = Math.max(0, card.baseAtk - amt);
      const dmg = damageCardFlat(card, amt, 'decay');
      ensureStat(stats, sideOf(pl.id), card.defId).taken += dmg;
      if(recordEvents && events) events.push({type:'decayTick', side:sideOf(pl.id), defId:card.defId, uid:card.uid, dmg, atk:amt});
    }
    removeDeadCards(players, sideOf, {}, stats, events);
  }
  function fireRoundStartTriggers(players, sideOf, stats, events){
    [players[1], players[2]].filter(inUpkeep).forEach(pl=>{
      ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
        const def = CARD_DEFS[c.defId];
        // Renewal (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Cleanse"/Gwent's
        // "Purify"): a passive keyword shorthand for the most common use of the 'cleanse'
        // custom-trigger action above -- cures Poison/Bleed/Stun/Expose/Scar automatically at
        // the start of EVERY round, rather than requiring a card to author a full
        // onRoundStart->cleanse trigger by hand. Order note (2026-09-16 follow-up, "Poison
        // should happen first"): this now runs AFTER applyPoisonTicks (see resolveCombat), so a
        // Poisoned Renewal card still eats one guaranteed tick of damage the round the stack was
        // applied — Renewal stops it from ticking again next round, it doesn't retroactively
        // dodge the one that already landed. A card can still use the raw trigger for a bespoke
        // pairing (e.g. only cleanse onKill instead).
        if(c.hp>0 && def.effects && def.effects.renewal){
          const hadAny = c.poison>0 || c.decay>0 || c.bleed>0 || c.stunned || c.exposed>0 || c.scar>0 || c.frozen>0 || c.asleep>0 || c.paralyzed>0 || c.blind>0 || c.tipsy>0 || c.confused>0 || c.shocked>0 || c.corrode>0 || c.staggered>0;
          c.poison = 0; c.decay = 0; c.bleed = 0; c.stunned = false; c.exposed = 0; c.scar = 0;
          c.frozen = 0; c.asleep = 0; c.paralyzed = 0; c.blind = 0; c.tipsy = 0; c.confused = 0; c.shocked = 0; c.corrode = 0; c.staggered = 0; c.daunts = [];
          if(hadAny && recordEvents && events) events.push({type:'statusFx', kind:'cleanse', side:sideOf(pl.id), attDefId:c.defId, attUid:c.uid, targetSide:sideOf(pl.id), targetDefId:c.defId, targetUid:c.uid});
        }
        // Regeneration N (2026-09-16): heals N HP at the start of every round this card is on
        // the board, capped at its own max HP — feeds the new On Heal/On Healed/On Ally Healed
        // triggers (see fireHealTriggers) exactly like any other heal source.
        // 2026-10-14 (user: "Do not regenerate when the unit is at full health"): nothing at all at full health, not even a bleed stanch.
        if(c.hp>0 && c.hp < c.maxHp && def.effects && def.effects.regen){
          const healed = applyHeal(c, def.effects.regen, sideOf(pl.id), events);
          if(healed>0){ fireHealTriggers(players, sideOf, pl.id, c, c, healed, stats, events); }
        }
        // Bloom (2026-09-17): Regeneration's support-flavored cousin — instead of healing
        // itself, it heals a random OTHER damaged ally on the same board, every round it's on
        // the field. No-op if every other ally is already at full HP (or there are none).
        if(c.hp>0 && def.effects && def.effects.bloom && !c.stunned){ // a stunned unit skips its upkeep actions
          const others = [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(o=> o.hp>0 && o.uid!==c.uid && (o.hp<o.maxHp || o.bleed>0));
          if(others.length){
            const bloomTarget = others[Math.floor(rnd()*others.length)];
            const bloomHealed = applyHeal(bloomTarget, def.effects.bloom + ((pl.perks && pl.perks.pollen) || 0), sideOf(pl.id), events); // + Wildpath "Pollen Drift"
            if(bloomHealed>0){ fireHealTriggers(players, sideOf, pl.id, c, bloomTarget, bloomHealed, stats, events); }
          }
        }
        // Healing N (Ecclesia, 2026-10-10): heals the most wounded ally (itself included) for N.
        if(c.hp>0 && def.effects && def.effects.healing && !c.stunned){
          const hurt = [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(o=> o.hp>0 && (o.hp<o.maxHp || o.bleed>0)).sort((a,b)=> (a.hp/a.maxHp) - (b.hp/b.maxHp));
          if(hurt.length){ const h = applyHeal(hurt[0], def.effects.healing, sideOf(pl.id), events); if(h>0){ if(recordEvents && events) events.push({type:'heal', side:sideOf(pl.id), attDefId:c.defId, attUid:c.uid, targetUid:hurt[0].uid, targetDefId:hurt[0].defId, amount:h, cause:'healing'}); fireHealTriggers(players, sideOf, pl.id, c, hurt[0], h, stats, events); } }
        }
        // Satiety N (Ecclesia, 2026-10-10, my reading of the name): well fed. At the start of a round at full health it gains +N max HP.
        if(c.hp>0 && def.effects && def.effects.satiety && c.hp >= c.maxHp){
          const n = Number(def.effects.satiety)||0; c.maxHp += n; c.hp += n;
          if(recordEvents && events) events.push({type:'statusFx', kind:'satiety', side:sideOf(pl.id), attDefId:c.defId, attUid:c.uid, amount:n});
        }
        runCustomTriggers(players, sideOf, pl.id, c, def, 'onRoundStart', stats, events);
        // Per Turn (2026-09-16, refined same day per explicit follow-up: "Per Turn should only
        // activate while the unit is ready"): unlike On Round Start (which fires for every card
        // still on the board, wait or no wait), Per Turn only fires while this card is Ready —
        // c.wait===0, the exact same meaning "Ready" already has for the pre-existing On Ready
        // hook above. A card still charging up its Wait, or one currently Frozen/Asleep/
        // Paralyzed/Stunned (all of which also force wait back up or skip the round in
        // gatherAttackers), is NOT ready, so it does not fire Per Turn either — this hook is
        // meant for "stuff that happens on a card's own active turns," not a blanket timer.
        if(c.wait===0 && !c.stunned && !(c.frozen>0) && !(c.asleep>0) && !(c.paralyzed>0)){
          runCustomTriggers(players, sideOf, pl.id, c, def, 'perTurn', stats, events);
        }
      }));
    });
  }
  // Healing triggers (2026-09-16): On Heal (this card healed something, itself included), On
  // Healed (this card was healed — the flip side of On Heal), and On Ally Healed (a DIFFERENT
  // card owned by the same player was just healed). Feeds Regeneration N and the 'heal' custom-
  // trigger action; also pushes a 'heal' replay event so the VFX layer can float a heal number.
  function fireHealTriggers(players, sideOf, ownerId, healerCard, targetCard, amount, stats, events){
    if(!(amount>0)) return;
    if(recordEvents && events) events.push({type:'heal', side:sideOf(ownerId), attDefId:healerCard.defId, attUid:healerCard.uid, targetDefId:targetCard.defId, targetUid:targetCard.uid, amount});
    runCustomTriggers(players, sideOf, ownerId, healerCard, CARD_DEFS[healerCard.defId], 'onHeal', stats, events, {healedCard:targetCard, amount});
    runCustomTriggers(players, sideOf, ownerId, targetCard, CARD_DEFS[targetCard.defId], 'onHealed', stats, events, {healerCard, amount});
    const pl = players[ownerId];
    const others = [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=>c.hp>0 && c.uid!==targetCard.uid);
    others.forEach(oc=> runCustomTriggers(players, sideOf, ownerId, oc, CARD_DEFS[oc.defId], 'onAllyHealed', stats, events, {healedCard:targetCard, healerCard, amount}));
  }
  // Status wear-offs (2026-10-15, effects pass: "every status ending ... should have an effect"): the engine never said when a
  // status ran out (its overlay just vanished at the next sync). These helpers only READ the units: statusSnap() notes every
  // live unit's statuses before a step that can end them, pushStatusEnds() then logs one {type:'statusEnd', status} per status
  // that went from on to off. noteWoke() logs a sleeper woken by damage (the line that wakes it calls it). No rule changes.
  const STATUS_END_KEYS = ['poison','bleed','decay','frozen','asleep','paralyzed','stunned','staggered','blind','tipsy','confused','shocked','corrode','exposed','wither','irradiation','smoke','scar','petrified'];
  const statusOn = (c, k)=> k === 'daunt' ? !!(c.daunts && c.daunts.length) : (c[k] === true || c[k] > 0);
  function statusSnap(players){
    if(!recordEvents) return null;
    const snap = new Map();
    [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return; allBoardCards(pl).forEach(c=>{ if(!c || c.gap || !(c.hp > 0)) return;
      const on = STATUS_END_KEYS.concat('daunt').filter(k=> statusOn(c, k)); if(on.length) snap.set(c, {pid, on}); }); });
    return snap;
  }
  function pushStatusEnds(snap, players, sideOf, events){
    if(!snap || !snap.size || !(recordEvents && events)) return;
    const live = new Set(); [1,2].forEach(pid=>{ const pl = players[pid]; if(pl) allBoardCards(pl).forEach(c=>{ if(c && c.hp > 0) live.add(c); }); });
    snap.forEach(({pid, on}, c)=>{ if(!live.has(c)) return;
      on.forEach(k=>{ if(!statusOn(c, k)) events.push({type:'statusEnd', status:k, side:sideOf(pid), uid:c.uid, defId:c.defId}); }); });
  }
  // Bloodlust N (2026-10-15): see the combat hit. +N Attack (base Attack too, so it lasts the fight), capped at +3N in all.
  function bloodlustGain(card, def, side, events){
    const n = def.effects.bloodlust === true ? 1 : Math.max(0, Number(def.effects.bloodlust)||0); if(!n) return 0;
    const g = Math.min(n, 3*n - (card.bloodlust||0)); if(g <= 0) return 0;
    card.bloodlust = (card.bloodlust||0) + g; card.atk += g; card.baseAtk = (card.baseAtk||0) + g;
    if(recordEvents && events) events.push({type:'statusFx', kind:'bloodlust', side, attDefId:card.defId, attUid:card.uid, targetSide:side, targetDefId:card.defId, targetUid:card.uid, amount:g, total:card.bloodlust, max:3*n});
    return g;
  }
  // Exposed (2026-10-15): one hit used up: +1 damage, and the board is told how many are left (0 = no longer Exposed).
  function useExposed(card){
    card.exposed = Math.max(0, (card.exposed||0) - 1);
    if(recordEvents && shieldEvents && card){ const pid = ownerPidOfCard(card), sd = shieldSideOf ? shieldSideOf(pid) : (pid===1 ? 'A' : 'B'); shieldEvents.push({type:'statusFx', kind:'exposedHit', side:sd, targetSide:sd, targetUid:card.uid, targetDefId:card.defId, amount:card.exposed}); }
    return 1;
  }
  function noteWoke(card){
    if(!(recordEvents && shieldEvents) || !card || !(card.hp > 0)) return;
    const pid = ownerPidOfCard(card); shieldEvents.push({type:'statusEnd', status:'asleep', woke:true, side: shieldSideOf ? shieldSideOf(pid) : (pid===1 ? 'A' : 'B'), uid:card.uid, defId:card.defId});
  }
  function endOfRoundUpkeep(players, sideOf, stats, events){
    const p1=players[1], p2=players[2];
    // Shell: deactivate whatever was active THIS round (already applied above in resolveCombat/
    // gatherAttackers), then promote any newly-queued shell (from getting hit this round) so it's
    // active starting NEXT round.
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      if(c.shellSkip){ c.shellSkip = false; } c.shellNext = 0; // (the old queued shell; retired 2026-10-12)
      if(c.shellUntil != null && combatNo >= c.shellUntil){ c.shellArmor = 0; c.tempHp = 0; c.shellUntil = null; if(recordEvents && events) events.push({type:'statusFx', kind:'shellDown', side:sideOf(pl.id), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId}); }
    })));
    // Crit (2026-09-14): a capped "once per round" proc — reset the round's usage counter
    // here so next round's attacks get a fresh proc attempt. (Evade's own counter was
    // removed 2026-09-29 when Evade/Evasion merged into the stateless Evasive keyword.)
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      c.critUsed = 0;
      if(c.cowerRound === combatNo) c.cowerRound = null; // Cower lasts the one round (2026-10-14)
      if(c.bleed > 0 || c.ichorBleed) ghostBleedClamp(c);
      c._frenziedThisRound = false; // Frenzy (2026-09-16): one extra attack per round, resets here just like Crit
    })));
    // killCredit is declared here (rather than after the wait/readyNow pass below, where it
    // used to live) so the Explode detonation pass — which runs first and can also land a
    // kill — shares the same bookkeeping object as the onReady damage pass and removeDeadCards.
    const killCredit = {};
    // Explode: a lit fuse, ticking down every round independent of Wait/Stun/Reload.
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      if(c.hp<=0 || c.explodeFired || c.explodeRemaining===undefined) return;
      const def = CARD_DEFS[c.defId];
      if(!def.effects || !def.effects.explode) return;
      if(c.explodeRemaining>0) c.explodeRemaining -= 1;
      if(c.explodeRemaining<=0){
        c.explodeFired = true;
        const dmg = def.effects.explode.damage;
        const opp = opposingCardOf(players, pl.id, c);
        const target = opp ? {kind:'card', card:opp.card} : {kind:'hq'};
        if(recordEvents && events) events.push({type:'explode', side:sideOf(pl.id), defId:c.defId, uid:c.uid,
          targetSide:sideOf(otherId(pl.id)), targetDefId: opp?opp.card.defId:null, targetUid: opp?opp.card.uid:null, dmg});
        fireDamageAction(players, sideOf, pl.id, c.defId, dmg, 'physical', target, stats, events, killCredit, c.uid);
      }
    })));
    const readyNow = [];
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      if(c.reloadRemaining>0){ if(c._reloadJustSet){ c._reloadJustSet = false; } else { c.reloadRemaining -= 1; } } // don't tick down the same round it was set
      // Elemental status ticks (Frozen/Asleep/Paralyzed) — all count down here, once per round,
      // regardless of whether they gated this round's attack (Paralyzed's coin flip can still
      // let a paralyzed card swing on a lucky round; its duration ticks down either way). Same
      // "_justSet" guard Reload uses just above: a status applied THIS round (mid-combat, via
      // rollStatusOnHit) must survive into NEXT round's gatherAttackers gate before it starts
      // counting down — otherwise a duration:1 status would tick to 0 in the same upkeep pass
      // it was set in and never actually gate anything.
      // Freeze counters (2026-10-14, user: "On upkeep, if a card has a freeze counter, it removes it instead of downclocking its
      // wait. If it doesnt have freeze counters anymore, the effect fades out."): c.frozen is the unit's freeze counters (the clock
      // shows Wait + counters). An upkeep that removes a counter doesn't tick the Wait. A counter laid during this round's combat
      // waits one upkeep before it starts melting (that upkeep the Wait ticks as usual), so a Freeze lasts as long as it did.
      let frostTick = false;
      if(c.frozen>0){ if(c._frozenJustSet) c._frozenJustSet=false; else { c.frozen -= 1; frostTick = true; } }
      if(frostTick && c.frozen === 0 && c._readyAfterThaw){ c._readyAfterThaw = false; if(c.wait === 0) readyNow.push({pl, card:c}); }
      if(c.asleep>0){ if(c._asleepJustSet) c._asleepJustSet=false; else c.asleep -= 1; }
      if(c.paralyzed>0){ if(c._paralyzedJustSet) c._paralyzedJustSet=false; else c.paralyzed -= 1; }
      // Blind/Shock/Corrode (2026-09-17 batch) — same "_justSet" survive-one-round-before-
      // decaying convention as Frozen/Asleep/Paralyzed above.
      if(c.blind>0){ if(c._blindJustSet) c._blindJustSet=false; else c.blind -= 1; }
      if(c.smoke>0){ if(c._smokeJustSet) c._smokeJustSet=false; else c.smoke -= 1; } // Smoke (2026-10-14), same convention
      // Shedding N (2026-10-13, user: "the idea of molting or shedding - getting stronger as time progresses"): every N rounds on the
      // field it sheds its skin: +1/+1 for good, and Poison, Bleed, Corrosion, Scar and Expose fall away with the old skin.
      { const shN = Number(((CARD_DEFS[c.defId]||{}).effects||{}).shedding === true ? 3 : ((CARD_DEFS[c.defId]||{}).effects||{}).shedding) || 0;
        if(shN > 0 && c.hp > 0){ c.shedAge = (c.shedAge||0) + 1; if(c.shedAge % shN === 0){ c.atk += 1; c.baseAtk = (c.baseAtk||0) + 1; c.maxHp += 1; c.hp += 1; c.poison = 0; c.bleed = 0; c.corrode = 0; c.scar = 0; c.exposed = 0;
          if(recordEvents && events) events.push({type:'statusFx', kind:'shed', side:sideOf(pl.id), attDefId:c.defId, attUid:c.uid, targetSide:sideOf(pl.id), targetDefId:c.defId, targetUid:c.uid, amount:1}); } } }
      // Molting N (D72, 2026-10-13, user: "Shedding and molting is about getting stronger"): the shell-growers' version. Every N
      // rounds on the field: +1 Attack and +2 Health for good. Crabs have it.
      { const mN = Number(((CARD_DEFS[c.defId]||{}).effects||{}).molting) || 0;
        if(mN > 0 && c.hp > 0){ c.moltAge = (c.moltAge||0) + 1; if(c.moltAge % mN === 0){ c.atk += 1; c.baseAtk = (c.baseAtk||0) + 1; c.maxHp += 2; c.hp += 2;
          if(recordEvents && events) events.push({type:'statusFx', kind:'shed', side:sideOf(pl.id), attDefId:c.defId, attUid:c.uid, targetSide:sideOf(pl.id), targetDefId:c.defId, targetUid:c.uid, amount:1, molt:true}); } } }
      if(c.coffeeCrash > 0){ c.coffeeCrash -= 1; if(c.coffeeCrash === 0){ c.stunned = (c.stunned|0) + 1; c._stunnedJustSet = true; if(recordEvents && events) events.push({type:'statusFx', kind:'coffeeCrash', side:sideOf(pl.id), attDefId:c.defId, attUid:c.uid, targetSide:sideOf(pl.id), targetDefId:c.defId, targetUid:c.uid}); } }
      if(c.tipsy>0){ if(c._tipsyJustSet) c._tipsyJustSet=false; else c.tipsy -= 1; }
      if(c.confused>0){ if(c._confusedJustSet) c._confusedJustSet=false; else c.confused -= 1; }
      selfInflict(c); // Drunk / Purblind / Scatterbrained keep their own status on for good
      if(c.shocked>0){ if(c._shockedJustSet) c._shockedJustSet=false; else c.shocked -= 1; }
      if(c.corrode>0){ if(c._corrodeJustSet) c._corrodeJustSet=false; else c.corrode -= 1; }
      if(c.daunts && c.daunts.length) c.daunts = c.daunts.filter(x=> x.until > combatNo);
      if(c.staggered>0){ if(c._staggeredJustSet) c._staggeredJustSet=false; else c.staggered -= 1; }
      // Bugfix (2026-09-19, found via a status-effect audit): Stun had no "_justSet" guard, unlike
      // every sibling status above it -- it was set mid-combat (via rollStatusOnHit's stunOnHit,
      // or the 'stun' custom-trigger action) and then unconditionally cleared right here, in the
      // SAME resolveCombat() call's own upkeep pass, before the next round's gatherAttackers gate
      // ever ran. That meant Stun could never actually block an attack: a live-repro test that hit
      // a card with a 100%-chance stunOnHit attacker confirmed the statusFx event fired but
      // `stunned` read back false immediately after. Now uses the identical justSet-survives-one-
      // round convention the comment above (frozen/asleep/paralyzed/blind/shock/corrode) already
      // documents as the reason THEY need it.
      // Stun counters (2026-10-10, user: "the unit removes a stun counter, then skips their turn including what it does
      // during upkeep"): each stunned round removes one counter and skips the Wait countdown.
      if(c.stunned){ if(c._stunnedJustSet) c._stunnedJustSet = false; else c.stunned = Math.max(0, (c.stunned|0) - 1); return; } // Stun: skip this round's wait decrement entirely; clear starting the round AFTER it was set
      if(frostTick){
        if(recordEvents && events) events.push({type:'statusFx', kind:'thaw', side:sideOf(pl.id), attUid:c.uid, attDefId:c.defId, targetSide:sideOf(pl.id), targetUid:c.uid, targetDefId:c.defId, left:c.frozen});
        return; } // a freeze counter melts instead of the Wait ticking
      if(c.asleep>0) return; // Asleep: also skip the wait decrement while active, same as Stun
      // Chronos wait-countdown (2026-09-17, per explicit request): every ordinary decrement
      // that DOESN'T reach 0 pushes its own 'waitTick' event (used purely for the UI's
      // per-round tick pulse + sound on the ring badge) — reaching exactly 0 still only
      // pushes the pre-existing 'ready' event below (readyNow), now also the UI's cue for the
      // special magnify-and-fade final flourish, so the two are never both fired the same round.
      if(c.wait>0){
        c.wait -= 1;
        if(c.wait===0 && c.frozen>0) c._readyAfterThaw = true; // still frozen: it's Ready once the ice is gone
        else if(c.wait===0) readyNow.push({pl,card:c});
        else if(recordEvents && events) events.push({type:'waitTick', side:sideOf(pl.id), defId:c.defId, uid:c.uid, waitRemaining:c.wait});
      }
    })));
    for(const {pl,card} of readyNow){
      const def = CARD_DEFS[card.defId];
      if(recordEvents && events) events.push({type:'ready', side:sideOf(pl.id), defId:card.defId, uid:card.uid});
      if(def.hatchInto && card.hp > 0){ hatchEggCard(players, sideOf, pl.id, card, stats, events); continue; } // an egg card cracks open (2026-10-14)
      if(!def.effects) continue;
      const enemy = players[otherId(pl.id)];
      const triggers = [];
      if(def.effects.onReadyDamage) triggers.push(def.effects.onReadyDamage);
      if(def.effects.missile && def.effects.missile.trigger==='onReady') triggers.push(def.effects.missile);
      for(const eff of triggers){
        // Delegates to fireDamageAction (rather than a hand-rolled copy) so onReady
        // damage/missile hits get the same Evasion gate, Guardian-redirect flag, and
        // attUid-tagged events as every other ranged damage source, for free.
        const target = pickRandomEnemyTarget(enemy);
        const amount = (eff.amount==='attack') ? card.atk : eff.amount;
        fireDamageAction(players, sideOf, pl.id, card.defId, amount, eff.dmgType, target, stats, events, killCredit, card.uid);
      }
      if(def.effects.render && def.effects.render.trigger==='onReady'){
        fireRender(players, sideOf, pl.id, card, def.effects.render, stats, events);
      }
      if(def.effects.rocket) fireRocket(players, sideOf, pl.id, card, Number(def.effects.rocket === true ? 1 : def.effects.rocket)||1, stats, events);
      if(def.effects.fireball && card.hp > 0) fireFireball(players, sideOf, pl.id, card, numN(def.effects.fireball, 15), stats, events); // Fireball N (2026-10-14)
      if(def.effects.meteor && card.hp > 0) fireMeteor(players, sideOf, pl.id, card, numN(def.effects.meteor, 20), stats, events); // Meteor N (2026-10-14)
      if(def.effects.chilli && card.hp > 0) eatChilli(sideOf, pl.id, card, numN(def.effects.chilli, 2), events); // Chilli N (2026-10-15)
      runCustomTriggers(players, sideOf, pl.id, card, def, 'onReady', stats, events);
      if(def.effects.converge) convergeBoard(players, sideOf, pl.id, card, def.effects.converge === true ? 'enemy' : def.effects.converge, events);
      // On Ally/Enemy Ready (2026-09-27, per explicit request: "Then On Ally Ready, On Enemy
      // Ready"): cross-side mirrors of On Ready — fires on every OTHER card this player
      // controls (Ally) and on the opponent's cards (Enemy) the moment THIS card's own Wait
      // reaches 0, same played/spawned-agnostic "reactivity" shape as On Ally/Enemy Spawn.
      const readyEnemy = players[otherId(pl.id)];
      [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=>c.uid!==card.uid).forEach(src=>{
        runCustomTriggers(players, sideOf, pl.id, src, CARD_DEFS[src.defId], 'onAllyReady', stats, events, {readyCard:card});
      });
      if(readyEnemy){
        [...readyEnemy.row.left, ...readyEnemy.row.center, ...readyEnemy.row.right].forEach(src=>{
          runCustomTriggers(players, sideOf, otherId(pl.id), src, CARD_DEFS[src.defId], 'onEnemyReady', stats, events, {readyCard:card});
        });
      }
    }
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      if(c.wait===0){
        const def = CARD_DEFS[c.defId];
        if(def.effects && def.effects.onReadyGold){
          // 2026-09-22: onReadyGold now pays Lumber -- see newPlayer()'s comment.
          addLumber(pl, def.effects.onReadyGold);
          ensureStat(stats, sideOf(pl.id), c.defId).lumberGenerated += def.effects.onReadyGold;
          if(recordEvents && events) events.push({type:'lumber', side:sideOf(pl.id), defId:c.defId, uid:c.uid, amount:def.effects.onReadyGold});
        }
        if(def.effects && def.effects.onReadyGrace){
          pl.grace += def.effects.onReadyGrace;
          ensureStat(stats, sideOf(pl.id), c.defId).graceGenerated += def.effects.onReadyGrace;
          if(recordEvents && events) events.push({type:'grace', side:sideOf(pl.id), defId:c.defId, uid:c.uid, amount:def.effects.onReadyGrace});
        }
        if(def.effects && def.effects.onReadyDevilry){
          pl.devilry += def.effects.onReadyDevilry;
          ensureStat(stats, sideOf(pl.id), c.defId).devilryGenerated += def.effects.onReadyDevilry;
          if(recordEvents && events) events.push({type:'devilry', side:sideOf(pl.id), defId:c.defId, uid:c.uid, amount:def.effects.onReadyDevilry});
        }
        // Inherent Darkness N (2026-09-21, per explicit request: "produces N dark points per
        // turn") -- a named convenience preset for exactly this onReadyDevilry payout (same
        // gate, same bookkeeping, same event shape), so a card can carry it as a plain numeric
        // passive in the editor instead of authoring onReadyDevilry by hand. Additive with
        // onReadyDevilry if a card somehow has both.
        if(def.effects && def.effects.inherentDarkness){
          pl.devilry += def.effects.inherentDarkness;
          ensureStat(stats, sideOf(pl.id), c.defId).devilryGenerated += def.effects.inherentDarkness;
          if(recordEvents && events) events.push({type:'devilry', side:sideOf(pl.id), defId:c.defId, uid:c.uid, amount:def.effects.inherentDarkness});
        }
      }
    })));
    chargeTick(players, sideOf, stats, events, inUpkeep);
    removeDeadCards(players, sideOf, killCredit, stats, events);
  }
  // Charge N - {} (2026-10-14, user: "Charge N - {}. A yellow wait timer = N starts on the top right. Charge only starts when the
  // card is ready. When the timer reaches 0, the thing in {} happens."): effects.charge = {n, do:'<action>', ...the action's own
  // fields, exactly as a custom trigger's}. The charge clock starts at N the moment the unit is Ready (on arrival with no Wait,
  // else at the upkeep its Wait runs out), then counts down 1 every upkeep. At 0 the action happens and the clock winds back to
  // N, so it repeats every N rounds. It holds (doesn't count) while the unit is Waiting, Stunned, Frozen or Asleep.
  function chargeOf(d){ const c = d && d.effects && d.effects.charge; if(!c || typeof c !== 'object') return null; const n = Math.max(1, Math.floor(Number(c.n)||1)); const act = c.do && typeof c.do === 'object' ? c.do : c; return act && act.do ? {n, act} : null; }
  function chargeTick(players, sideOf, stats, events, inUp){
    [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl || (inUp && !inUp(pl))) return;
      allBoardCards(pl).slice().forEach(c=>{ const def = CARD_DEFS[c.defId], ch = chargeOf(def); if(!ch || !(c.hp > 0) || c.cageOf) return;
        if(c.wait > 0 || c.frozen > 0) return;
        if(c.chargeLeft == null){ c.chargeLeft = ch.n; if(recordEvents && events) events.push({type:'charge', side:sideOf(pid), uid:c.uid, defId:c.defId, left:c.chargeLeft, start:true}); return; }
        if(c.stunned || c.asleep > 0) return;
        c.chargeLeft -= 1;
        const fire = c.chargeLeft <= 0; if(fire) c.chargeLeft = ch.n;
        if(recordEvents && events) events.push({type:'charge', side:sideOf(pid), uid:c.uid, defId:c.defId, left:c.chargeLeft, fired:fire});
        if(fire) runCustomTriggers(players, sideOf, pid, c, {effects:{triggers:[Object.assign({}, ch.act, {on:'onCharge'})]}}, 'onCharge', stats || {}, events); }); });
  }
  // Repeats the pass while something is still at 0 HP (Divine Retribution can kill during a pass), at most 6 times.
  function removeDeadCards(players, sideOf, killCredit, stats, events){
    for(let guard=0; guard<6; guard++){
      removeDeadCardsPass(players, sideOf, killCredit || {}, stats, events);
      if(![players[1], players[2]].some(pl=> pl && allBoardCards(pl).some(c=> c.hp<=0))) break;
    }
  }
  function removeDeadCardsPass(players, sideOf, killCredit, stats, events){
    const p1=players[1], p2=players[2];
    const deadEntries = [];
    [p1,p2].forEach(pl=>{
      ['left','center','right'].forEach(side=>{
        pl.row[side].forEach(c=>{ if(c.hp<=0) deadEntries.push({pl, side, card:c}); });
      });
    });
    if(!deadEntries.length) return;
    const spawns = [], freed = [], retributions = [], splits = [];
    deadEntries.forEach(({pl, side, card})=>{
      const mySide = sideOf(pl.id);
      if(card.cageOf){ freed.push({owner: card.cageOwner, leaderDefId: card.cageOf, slot: card.slot, hostSide: mySide, uid: card.uid}); return; } // a broken cage frees its leader
      const cdef = CARD_DEFS[card.defId];
      // Revive (once) — a "named skill" preset (2026-09-14): the FIRST time this card would
      // die, it comes back instead — restored to 1 HP, every status cleared, no death/kill/
      // bounty/onDeathSpawn/onDeath-trigger bookkeeping at all, because it didn't actually
      // die. It's tagged with a Removal Counter (card.hasRemovalCounter): the NEXT time it
      // would die after that, it skips the graveyard entirely and goes straight to the
      // Removal Zone instead (see the graveyard-vs-exile decision below) — a real, final death.
      if(cdef.effects && cdef.effects.revive && !card.revivedOnce && !card.nullified){ // a Nullify kill: no Revive (2026-10-14)
        card.revivedOnce = true;
        card.hasRemovalCounter = true;
        card.hp = 1; card.killedBy = null;
        card.poison = 0; card.decay = 0; card.exposed = 0; card.scar = 0; card.stunned = false;
        card.frozen = 0; card.asleep = 0; card.paralyzed = 0; card.bleed = 0;
        card.shellArmor = 0; card.shellSkip = false; card.shellNext = 0; card.tempHp = 0; card.shellUntil = null; card.shellQuiet = null;
        if(recordEvents && events) events.push({type:'revive', side:mySide, defId:card.defId, uid:card.uid});
        return;
      }
      ensureStat(stats, mySide, card.defId).deaths += 1;
      // Devilry (2026-10-10): every unit that perishes counts toward Rituals, and gives its owner 1 Darkness.
      // D20 (2026-10-12): Darkness from your own losses stops at 10, so a deck can't farm it with cheap chaff (cards that
      // make Darkness on purpose still go past it).
      perishedTotal += 1; if((pl.devilry||0) < 10) pl.devilry = (pl.devilry||0) + 1;
      const credit = killCredit[card.uid];
      const bounty = (cdef.effects && cdef.effects.bounty) || 0;
      const deathEv = {type:'death', side:mySide, defId:card.defId, uid:card.uid}; if(card.nullified) deathEv.nullified = true; // 2026-10-15: the replay shows a Nullify kill / exile its own way
      if(recordEvents && events) events.push(deathEv);
      if(credit){
        const sidesCredited = new Set();
        credit.forEach(key=>{
          const parts = key.split('|');
          ensureStat(stats, parts[0], parts[1]).kills += 1;
          sidesCredited.add(parts[0]);
          { const kp = players[parts[0]==='A' ? 1 : 2]; if(kp && kp.perks && kp.perks.crown){ // Wildpath "Crown of Thorns": the killer gains +1 Attack
              const killer = allBoardCards(kp).find(x=> x.hp > 0 && (x.defId === parts[1] || (CARD_DEFS[x.defId]||{}).derivedFrom === parts[1]));
              if(killer){ killer.atk += 1; killer.baseAtk += 1; if(recordEvents && events) events.push({type:'statusFx', kind:'grit', side:parts[0], attDefId:killer.defId, attUid:killer.uid, amount:1}); } } }
          // Midas Touch N (Ecclesia, 2026-10-10): a kill by this card pays its owner N Lumber.
          const kd = CARD_DEFS[parts[1]], midas = kd && kd.effects && Number(kd.effects.midas);
          if(midas > 0){ const kp = players[parts[0]==='A'?1:2]; kp.lumber += midas; if(recordEvents && events) events.push({type:'lumber', side:parts[0], defId:parts[1], amount:midas, cause:'midas'}); }
        });
        if(bounty>0){
          sidesCredited.forEach(side2=>{
            const pid = side2==='A'?1:2;
            addLumber(players[pid], bounty); // 2026-09-22: bounty now pays Lumber, not Gold
            // uid (2026-09-16, item #3): the dying card's own uid, purely so the UI can drop
            // the gold-icon "item drop" VFX from wherever that card's tile still is on screen
            // (it hasn't been wiped from the DOM yet — only the round's full event log has
            // finished, not its animated replay) rather than needing to guess a position.
            if(recordEvents && events) events.push({type:'bounty', side:side2, amount:bounty, fromDefId:card.defId, uid:card.uid});
          });
        }
      }
      const nulled = !!card.nullified; // Nullify (2026-10-14): its own death effects don't happen
      if(cdef.effects && cdef.effects.worthy && !nulled){ const foe = players[otherId(pl.id)]; const got = addLumber(foe, 1);
        if(recordEvents && events) events.push({type:'lumber', side:sideOf(foe.id), defId:card.defId, uid:card.uid, amount:got, cause:'worthyDeath'}); }
      if(cdef.effects && cdef.effects.onDeathSpawn && !nulled){
        spawns.push({pl, side, slot:card.slot, fromUid:card.uid, defId:cdef.effects.onDeathSpawn.defId, count:cdef.effects.onDeathSpawn.count||1});
        ensureStat(stats, mySide, card.defId).spawnedTokens += (cdef.effects.onDeathSpawn.count||1);
      }
      // move to graveyard (unless a custom onDeath trigger exiles it instead, OR this card
      // already used its one Revive and is dying with a Removal Counter attached — that
      // second death is permanent and skips the graveyard entirely)
      const hasExileOnDeath = cdef.effects && Array.isArray(cdef.effects.triggers) && cdef.effects.triggers.some(t=>t.on==='onDeath' && (t.do==='exileSelf' || (t.do==='exile' && (!t.who || t.who==='self'))));
      // card.forceExileZone (2026-09-30): set by the new instant "Exile [ally/enemy]" action just
      // above — a live removal tagged to land in the Removal Zone instead of the graveyard, same
      // decision this card's own On-Death-exile would make, just triggered by someone else's turn.
      if(hasExileOnDeath || card.hasRemovalCounter || card.forceExileZone){
        pl.exile.push({defId:card.defId}); pl.echoes = (pl.echoes||0) + 1;
        deathEv.exiled = true; // 2026-10-15 (log only): it goes to the Removal Zone, not the graveyard
        ensureStat(stats, mySide, card.defId).exiled++;
        if(recordEvents && events) events.push({type:'exile', side:mySide, defId:card.defId, zone:'board'});
      } else {
        pl.graveyard.push({defId:card.defId});
      }
      if(card.equipment) pl.graveyard.push({defId:card.equipment}); // its equipment falls with it (2026-10-11)
      if(cdef.effects && cdef.effects.landslide && !nulled) fireLandslide(players, sideOf, pl.id, card, Number(cdef.effects.landslide === true ? 1 : cdef.effects.landslide)||1, stats, events);
      // who:'killer' (2026-10-14, user: "On Death: Attacking unit gets 5 Poison. - it's as if it got ingested!"): the unit whose hit
      // killed it, if it still stands; nothing when it died some other way (poison, bleed, the weather...).
      const killerCard = card.killedBy != null ? [p1, p2].map(p=> allBoardCards(p).find(x=> x.uid === card.killedBy && x.hp > 0)).find(Boolean) || null : null;
      if(!nulled) runCustomTriggers(players, sideOf, pl.id, card, cdef, 'onDeath', stats, events, {killerCard});
      // Meiosis N (2026-10-14): it splits in two once the board has cleared its dead (see the splits pass below)
      if(!nulled && meiosisOf(cdef) > 0 && !card.cageOf) splits.push({pl, side, slot:card.slot, card});
      // On Ally Die (2026-09-16): distinct from On Death (self-only) — fires on every OTHER
      // still-living card this same player controls, e.g. a "when a friend falls" avenger
      // effect. Evaluated against the board as it stands right now in this same dead-cards
      // pass, so two simultaneous deaths each see the other as having just died.
      const survivors = [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(sc=>sc.hp>0 && sc.uid!==card.uid);
      survivors.forEach(sc=>{
        // Berserk (2026-09-17): permanently gains +N/+0 whenever ANY ally dies (no archetype
        // requirement, unlike Esprit, which only cares about a shared-archetype ally SPAWNING).
        const scDef = CARD_DEFS[sc.defId];
        if(scDef.effects && scDef.effects.berserk){
          const berserkAmt = scDef.effects.berserk;
          sc.atk += berserkAmt; sc.baseAtk += berserkAmt;
          if(recordEvents && events) events.push({type:'statusFx', kind:'berserk', side:sideOf(pl.id), attDefId:sc.defId, attUid:sc.uid, amount:berserkAmt});
        }
        runCustomTriggers(players, sideOf, pl.id, sc, scDef, 'onAllyDie', stats, events, {diedCard:card});
        // Divine Retribution N (Ecclesia, 2026-10-10): when an ally perishes, strike a random enemy unit for N.
        if(scDef.effects && scDef.effects.retribution) retributions.push({pid: pl.id, card: sc, n: Number(scDef.effects.retribution)||0});
      });
      // Hive Mind (2026-10-09, Swarm archetype): when a Hive Mind card dies, the newest Swarm ally on its
      // board gains +1/+1, so a swarm grows stronger as it is whittled down.
      if(cdef.effects && cdef.effects.hiveMind && !nulled){
        const heirs = survivors.filter(sc=> CARD_DEFS[sc.defId] && CARD_DEFS[sc.defId].effects && CARD_DEFS[sc.defId].effects.swarm);
        if(heirs.length){ const h = heirs.reduce((a, b)=> b.uid > a.uid ? b : a);
          h.atk += 1; h.baseAtk += 1; h.hp += 1; h.maxHp += 1;
          if(recordEvents && events) events.push({type:'statusFx', kind:'berserk', side:sideOf(pl.id), attDefId:h.defId, attUid:h.uid, amount:1, hiveMind:true}); }
      }
    });
    [p1,p2].forEach(pl=>{
      ['left','center','right'].forEach(side=>{ pl.row[side] = pl.row[side].filter(c=>c.hp>0); });
    });
    freed.forEach(f=>{
      const owner = players[f.owner]; if(!owner) return;
      const legal = slotMode ? legalSlots(owner) : [];
      const want = Number.isInteger(f.slot) ? f.slot : 0;
      const slot = legal.length ? legal.slice().sort((a,b)=> Math.abs(a-want) - Math.abs(b-want))[0] : null;
      if(recordEvents && events) events.push({type:'cageBroken', side:f.hostSide, uid:f.uid, owner:sideOf(f.owner), leaderDefId:f.leaderDefId});
      if(slot!=null || !slotMode) debugSpawnCard(players, sideOf, f.owner, f.leaderDefId, slot!=null ? slot : 'right', stats, events);
      owner.leaderFreed = true;
    });
    if(retributions.length){
      retributions.forEach(r=>{
        if(r.card.hp<=0 || r.n<=0) return;
        const foes = allBoardCards(players[otherId(r.pid)]).filter(c=> c.hp>0 && !c.cageOf); if(!foes.length) return;
        const t = foes[Math.floor(rnd()*foes.length)], dmg = damageCardFlat(t, r.n, 'physical', r.card.defId);
        if(recordEvents && events) events.push({type:'hit', side:sideOf(r.pid), attDefId:r.card.defId, attUid:r.card.uid, targetSide:sideOf(otherId(r.pid)), targetDefId:t.defId, targetUid:t.uid, dmg, dmgType:'physical', ranged:true, retribution:true});
        if(t.hp<=0){ killCredit[t.uid] = killCredit[t.uid] || new Set(); killCredit[t.uid].add(statKey(sideOf(r.pid), r.card.defId)); }
      });
    }
    spawns.forEach(s=>{
      // The dying card's own slot was just vacated by the filter pass above, so an
      // onDeathSpawn token naturally refills it (center included, one token exactly). Any
      // EXTRA tokens beyond the first can't also fit in the singleton center slot, so they
      // spill onto the shorter flank instead.
      // `placements` (2026-09-17, fixing "spawning units should appear at the Left or Right,
      // not in the centre then teleporting"): onDeathSpawn used to carry only a count, with no
      // per-token uid/lane — the UI replay had no way to show these tokens live as they
      // appeared, so they stayed completely invisible until the round's final catch-up render,
      // which could reveal several of them scattered across different lanes all at once with
      // no entrance animation at all (see resolveRound's live-reflow loop in arena_app.js,
      // which already does this correctly for onAttackedSpawn via its uids/lane fields — this
      // mirrors that, generalized to a per-token lane since onDeathSpawn's own extra tokens can
      // legitimately land in a DIFFERENT lane than the first one, per the comment above).
      const placements = [];
      const spawnedTokens = [];
      const echoN = (s.pl.perks && s.pl.perks.echo) ? (s.pl.perks.echo = false, 1) : 0; // Wildpath "Echoing Wood"
      for(let i=0;i<s.count+echoN;i++){
        const side = (i===0) ? s.side : flankOrShorter(s.pl, s.side);
        const tok = makeBoardCard(s.defId);
        if(slotMode && i===0 && Number.isInteger(s.slot)) tok.slot = s.slot; // first token takes the fallen card's slot
        s.pl.row[side].push(tok);
        syncSlots(s.pl);
        placements.push({uid:tok.uid, lane:side});
        spawnedTokens.push(tok);
      }
      if(recordEvents && events) events.push({type:'spawn', side:sideOf(s.pl.id), defId:s.defId, count:s.count, cause:'onDeathSpawn', placements, fromUid:s.fromUid});
      // On Ally/Enemy Spawn (2026-09-27): On Death: Spawn is the other genuine "spawned from a
      // unit" case (a dying card's own ability, not a hand play) — see fireSpawnFamilyTriggers's
      // comment for the played/spawned split this feeds.
      spawnedTokens.forEach(tok=> fireSpawnFamilyTriggers(players, sideOf, s.pl.id, tok, stats, events, 'spawned'));
    });
    splits.forEach(sp=> meiosisSplit(players, sideOf, sp, stats, events)); // Meiosis N (2026-10-14)
    // Center collapse-in (2026-09-16, per explicit request: "units should fall in towards
    // the holes created. Including the center. 1/2 to be left, 1/2 to be right"). A gap
    // opened in the middle of a flank already closes itself for free — the filter pass just
    // above re-indexes the remaining cards, and since column position is derived from array
    // index (see combatColumnsOf), whichever card was one slot further out is now one column
    // closer to center. The one place that DOESN'T happen automatically is the center slot
    // itself: nothing refills it once its occupant dies (unless an onDeathSpawn token just
    // did, above). So: for every player whose center died THIS pass and is still empty, pull
    // the nearest-to-center card off a flank — the side is a straight 50/50 coin flip when
    // both flanks have cards, otherwise whichever flank isn't empty — and slot it into center.
    // `.shift()` removes index 0, which is always the flank card nearest to center (index 0 =
    // column ±1, see combatColumnsOf/placeCard), so this is a genuine "fall toward the hole,"
    // not a random pick from anywhere on that flank.
    if(slotMode){ [p1,p2].forEach(pl=>{ syncSlots(pl); syncGladiatorHq(pl); }); return; } // fixed slots: gaps stay, no collapse-in
    const centerDiedFor = new Set();
    deadEntries.forEach(({pl, side})=>{ if(side==='center') centerDiedFor.add(pl); });
    centerDiedFor.forEach(pl=>{
      if(pl.row.center.length>0) return; // an onDeathSpawn token already refilled it, above
      const leftHas = pl.row.left.length>0, rightHas = pl.row.right.length>0;
      if(!leftHas && !rightHas) return; // no flank has anyone left to fall in
      const fromSide = (leftHas && rightHas) ? (rnd()<0.5 ? 'left' : 'right') : (leftHas ? 'left' : 'right');
      const moved = pl.row[fromSide].shift();
      pl.row.center.push(moved);
      if(recordEvents && events) events.push({type:'collapseIn', side:sideOf(pl.id), defId:moved.defId, uid:moved.uid, fromSide});
    });
  }
  // Fast Forward N (2026-10-12, D22, the user's rule: "with N counters, a unit runs its turn, upkeep included, N extra
  // times before joining the main action order"). At the start of the next combat after it arrives, each counter is one
  // extra turn for that unit alone: its Wait counts down by 1 if it's still Waiting (with the usual Ready moment),
  // otherwise it swings once, with every on-hit effect. Then it takes its normal place in the order. A Stunned, Frozen or
  // Asleep unit loses its counters. Units with Fast Forward run in board order, the side with initiative first.
  function fastForwardPass(players, sideOf, stats, events, firstAttackerSide){
    const first = firstAttackerSide || 2, order = [first, otherId(first)];
    for(const pid of order){
      const pl = players[pid]; if(!pl) continue;
      for(const c of allBoardCards(pl).slice()){
        if(!c || c.hp <= 0 || !(c.ffCounters > 0)) continue;
        if(c.stunned || c.frozen > 0 || c.asleep > 0 || c.cageOf){ c.ffCounters = 0; continue; }
        if(recordEvents && events) events.push({type:'fastForward', side:sideOf(pid), defId:c.defId, uid:c.uid, n:c.ffCounters});
        while(c.ffCounters > 0 && c.hp > 0){
          c.ffCounters -= 1;
          if(c.wait > 0){
            c.wait -= 1;
            if(c.wait > 0){ if(recordEvents && events) events.push({type:'waitTick', side:sideOf(pid), defId:c.defId, uid:c.uid, waitRemaining:c.wait, fastForward:true}); }
            else { if(recordEvents && events) events.push({type:'ready', side:sideOf(pid), defId:c.defId, uid:c.uid, fastForward:true}); try{ runCustomTriggers(players, sideOf, pid, c, CARD_DEFS[c.defId], 'onReady', stats, events); const cd = CARD_DEFS[c.defId]; if(cd && cd.effects && cd.effects.converge) convergeBoard(players, sideOf, pid, c, cd.effects.converge === true ? 'enemy' : cd.effects.converge, events); }catch(e){} }
          } else {
            resolveCombat(players, sideOf, stats, events, pid, {upkeepIds:[], onlyUid:c.uid});
          }
          if(players[1].hq.hp <= 0 || players[2].hq.hp <= 0) return true;
        }
      }
    }
    return false;
  }
  // Boomerang (2026-10-12, user: "Rename it to boomerang! Remove the N parameter. It first throws the boomerang when it
  // attacks. On the next turn, when combat begins, the boomerang returns dealing damage again. The otter will not attack this
  // turn. So basically it gets a prioritised 2nd attack. It also never misses air units."): after a Boomerang unit swings,
  // its boomerang is out. At the start of the next combat (before anyone else acts) it comes back as a full swing at
  // whatever stands in front of it then, and that is the unit's attack for the round. Then it throws again next round.
  // The old effects.antiAir counts as Boomerang.
  let combatNo = 0, combatDepth = 0;
  function isBoomerangDef(d){ return !!(d && d.effects && (d.effects.boomerang || d.effects.bananarang || Number(d.effects.antiAir) > 0)); } // Bananarang (2026-10-14) flies the same way
  // Boomerang flight (2026-10-12 rework, user: "the boomerang hits the enemy than flies out straightwards. On the next turn, it
  // just returns to sender, hitting the enemy again on the way back. And because the boomerang was hitting the unit in front,
  // it doesn't hit the castle on the way back - just whiff ... Hit the castle, and it hits on TO and FRO. If the boomerang
  // thrower dies, the boomerang still comes back and hits the enemy. However on your side of the field, if you have a new
  // ally there that DOESNT have a boomerang passive, it gets hit. If there is NOONE in that column, your castle gets hit
  // instead"). A thrown boomerang is its own thing in the air (pl.boomerangs), remembered with its lane, damage and whether
  // the throw went to the castle. Next combat, before anyone acts, it flies home down that lane:
  //  - out on the enemy side it hits the unit there now; with no unit, it hits the castle only if the throw did (else "whiff");
  //  - home on its own side, a living thrower catches it (that is the thrower's attack this round); otherwise a unit standing
  //    in the lane without Boomerang takes the hit (one with Boomerang catches it), and an empty lane lets it hit your castle.
  // 2026-10-12 (09:11, user: "the come-back hit goes at +N speed, where N is the creature's attack ... on the come back, it tries
  // to hit the same target again. If its not there, it whiffs. Then if the boomerang holder isn't there, the ally gets hit
  // instead. If there is no ally, it goes right past and hits your castle. If its another creature with boomerang, its fine. If
  // the enemy hit has boomerang ... still hit it"). Each boomerang in the air comes home at speed N = its Attack: the ones faster
  // than this round's quickest Fast Forward unit fly before it (minSpeed), the rest right after it, fastest first. On the way
  // back it hits the unit it hit on the way out (or the castle, if it hit the castle), or whiffs if that unit is gone; then a
  // living thrower catches it (that is its attack this round), else a non-Boomerang ally in its lane takes the hit, else your
  // own castle does.
  function boomerangReturnPass(players, sideOf, stats, events, firstAttackerSide, minSpeed){
    const first = firstAttackerSide || 2, go = [];
    for(const pid of [first, otherId(first)]){
      const pl = players[pid]; if(!pl || !Array.isArray(pl.boomerangs) || !pl.boomerangs.length) continue;
      const keep = [];
      pl.boomerangs.forEach(b=>{ const thrower = allBoardCards(pl).find(c=> c && c.uid === b.uid && c.hp > 0); const spd = Math.max(0, thrower ? (thrower.atk||0) : (b.dmg||0));
        if(minSpeed == null || spd > minSpeed) go.push({pid, b, spd}); else keep.push(b); });
      pl.boomerangs = keep;
    }
    go.sort((x, y)=> y.spd - x.spd); // stable: on a tie the side with initiative goes first
    for(const {pid, b} of go){
      const pl = players[pid], foeId = otherId(pid), foe = players[foeId]; if(!foe) continue;
      const thrower = allBoardCards(pl).find(c=> c && c.uid === b.uid && c.hp > 0) || null;
      const dmg = Math.max(0, thrower ? (thrower.atk||0) : (b.dmg||0)), dmgType = b.dmgType || 'physical';
      let lane = b.col; if(thrower){ const lc = liveColOf(pl, thrower.uid); if(lc) lane = lc.col; }
      if(recordEvents && events) events.push({type:'boomerangReturn', side:sideOf(pid), defId:b.defId, uid:b.uid, thrownBy: thrower ? thrower.uid : null, speed: dmg});
      // the far end: the same target again
      if(b.hitCastle){
        const d = damageHQ(foe, dmg);
        if(recordEvents && events) events.push({type:'hitHQ', side:sideOf(pid), attDefId:b.defId, attUid:b.uid, targetSide:sideOf(foeId), dmg:d, boomerang:true});
      } else {
        const tgt = b.targetUid != null ? allBoardCards(foe).find(c=> c && c.uid === b.targetUid && c.hp > 0) : null;
        if(tgt){
          const r = damageCard(tgt, dmg, dmgType, null);
          ensureStat(stats, sideOf(foeId), tgt.defId).taken += r.dmg; ensureStat(stats, sideOf(pid), b.defId).dealt += r.dmg;
          if(recordEvents && events) events.push({type:'hit', side:sideOf(pid), attDefId:b.defId, attUid:b.uid, targetSide:sideOf(foeId), targetDefId:tgt.defId, targetUid:tgt.uid, dmg:r.dmg, dmgType, armorBlocked:r.armorBlocked, boomerang:true});
        } else if(recordEvents && events) events.push({type:'boomerangWhiff', side:sideOf(pid), defId:b.defId, uid:b.uid});
      }
      removeDeadCards(players, sideOf, {}, stats, events);
      if(foe.hq.hp <= 0) return true;
      // home
      const stillThere = thrower && thrower.hp > 0 && allBoardCards(pl).includes(thrower);
      if(stillThere){
        thrower._boomerangCombat = combatNo; thrower.boomerangOut = false; // catching it is its attack this round
        if(recordEvents && events) events.push({type:'boomerangCaught', side:sideOf(pid), uid:thrower.uid, defId:thrower.defId});
        // Bananarang N (2026-10-14, user: "when it goes back to the unit, it has a 1/2 chance to eat the banana for 3 health"): only
        // when it is hurt (like Banana, it never eats at full Health).
        const br = effectsOf(thrower).bananarang;
        if(br && thrower.hp < thrower.maxHp && !(thrower.wither > 0) && rnd() < 0.5){ const healed = applyHeal(thrower, numN(br, 3), sideOf(pid), events);
          if(recordEvents && events) events.push({type:'banana', action:'eat', bananarang:true, side:sideOf(pid), uid:thrower.uid, defId:thrower.defId, amount:healed, n:numN(br, 3)});
          if(healed > 0) fireHealTriggers(players, sideOf, pid, thrower, thrower, healed, stats, events); }
      } else {
        const myCols = combatColumnsOf(pl), home = myCols[lane] && myCols[lane].kind === 'card' ? myCols[lane].card : null;
        if(home && home.hp > 0){
          if(isBoomerangDef(CARD_DEFS[home.defId])){ if(recordEvents && events) events.push({type:'boomerangCaught', side:sideOf(pid), uid:home.uid, defId:home.defId}); }
          else {
            const r = damageCard(home, dmg, dmgType, null);
            ensureStat(stats, sideOf(pid), home.defId).taken += r.dmg;
            if(recordEvents && events) events.push({type:'hit', side:sideOf(pid), attDefId:b.defId, attUid:b.uid, targetSide:sideOf(pid), targetDefId:home.defId, targetUid:home.uid, dmg:r.dmg, dmgType, armorBlocked:r.armorBlocked, boomerang:true, friendly:true});
          }
        } else {
          const d = damageHQ(pl, dmg);
          if(recordEvents && events) events.push({type:'hitHQ', side:sideOf(pid), attDefId:b.defId, attUid:b.uid, targetSide:sideOf(pid), dmg:d, boomerang:true, friendly:true});
        }
        removeDeadCards(players, sideOf, {}, stats, events);
      }
      if(players[1].hq.hp <= 0 || players[2].hq.hp <= 0) return true;
    }
    return false;
  }
  function resolveCombat(players, sideOf, stats, events, firstAttackerSide, pass){
    try{ syncPhaseStats(players, sideOf, events); }catch(e){}
    curPlayers = players;
    if(events){ shieldEvents = events; shieldSideOf = sideOf; }
    if(!pass){ combatNo++;
      startCower(players, sideOf, events); // Cower (2026-10-14): hit last round -> cower this round, before anyone acts
      const hasBoom = ()=> [1,2].some(pid=> players[pid] && Array.isArray(players[pid].boomerangs) && players[pid].boomerangs.length);
      if(hasBoom()){ // faster than the quickest Fast Forward unit: before it (see boomerangReturnPass)
        let ffMax = 0; for(const pid of [1,2]){ const pl = players[pid]; if(pl) allBoardCards(pl).forEach(c=>{ if(c && c.hp > 0 && (c.ffCounters||0) > ffMax) ffMax = c.ffCounters; }); }
        if(boomerangReturnPass(players, sideOf, stats, events, firstAttackerSide, ffMax)) return true; }
      curPlayers = players; if(events){ shieldEvents = events; shieldSideOf = sideOf; } }
    // Swimmer and Tailwind (2026-10-12, user: "Tide should power up swimmers with +1 speed (attack faster, like Fast
    // Forward). Tailwind should do the same for Flyers"): on a Flow round every Swimmer, and under a Tailwind every Flyer,
    // gets one Fast Forward turn before the round's main order.
    if(!pass) firstBloodTaken = false; // a new round: first blood is up for grabs again
    if(!pass){ const flow = tideRising(), wind = isWindy(); // strong wind: the Flyers on the Tailwind side get the extra turn (2026-10-13)
      if(flow || wind) for(const pid of [1,2]){ const pl = players[pid]; if(!pl) continue;
        for(const c of allBoardCards(pl)){ if(!c || !(c.hp > 0) || c._speedCombat === combatNo) continue; const e = (CARD_DEFS[c.defId]||{}).effects || {};
          const why = (flow && e.swimmer && (e.swimmer === 'quickAttack' || (e.swimmerGrant && e.swimmerGrant.fastForward))) ? 'swimmer' : (wind && e.flying && windSideOf(pid) === 'tail') ? 'tailwind' : null; if(!why) continue;
          c.ffCounters = (c.ffCounters||0) + 1; c._speedCombat = combatNo;
          if(recordEvents && events) events.push({type:'statusFx', kind:why, side:sideOf(pid), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId, amount:1}); } } }
    if(!pass){ let anyFF = false; for(const pid of [1,2]){ const pl = players[pid]; if(pl && allBoardCards(pl).some(c=> c && c.ffCounters > 0 && c.hp > 0)) anyFF = true; }
      if(anyFF && fastForwardPass(players, sideOf, stats, events, firstAttackerSide)) return true;
      if([1,2].some(pid=> players[pid] && Array.isArray(players[pid].boomerangs) && players[pid].boomerangs.length) && boomerangReturnPass(players, sideOf, stats, events, firstAttackerSide)) return true; // the slower ones
      curPlayers = players; if(events){ shieldEvents = events; shieldSideOf = sideOf; } }
    if(!(pass && pass.onlyUid)) [1,2].forEach(pid=>{ const pl = players[pid]; if(!pl) return; pl.darkUsed = 0; if(pl.skipTurns > 0) pl.skipTurns -= 1; }); // a stun cast during the turn covers that turn
    passUpkeepIds = (pass && pass.upkeepIds) || null;
    passAttackerIds = (pass && pass.attackerIds) || null;
    passOnlyUid = (pass && pass.onlyUid) || null;
    combatDepth++;
    try { return resolveCombatInner(players, sideOf, stats, events, firstAttackerSide); }
    finally { combatDepth--; passUpkeepIds = null; passAttackerIds = null; passOnlyUid = null; currentAttacker = null; }
  }
  function resolveCombatInner(players, sideOf, stats, events, firstAttackerSide){
    curInitiative = firstAttackerSide || 2; // On Turn Start's 'yours'/'opponent's' = who strikes first this round
    // Ordering (2026-09-16, per explicit request: "Poison should happen first") — Poison now
    // ticks BEFORE any round-start trigger (Renewal cleanse, Regeneration, On Round Start, Per
    // Turn). Previously Renewal ran first and could cleanse a stack away before it ever dealt
    // its damage that round; now a Poisoned card always eats this round's tick first, and only
    // THEN does Renewal cure it going forward (see fireRoundStartTriggers' comment). This also
    // means a card that dies to its own poison this round never gets to act on its Per Turn/On
    // Round Start hooks below — removeDeadCards runs inside applyPoisonTicks itself.
    const stBefore = statusSnap(players); // 2026-10-15: status wear-offs (pushStatusEnds after the ticks and after upkeep)
    applyPoisonTicks(players, sideOf, stats, events);
    applyDecayTicks(players, sideOf, stats, events);
    applyWitherTicks(players, sideOf, stats, events); // Wither (2026-10-14)
    if(!passOnlyUid) applyMeteorBurns(players, sideOf, stats, events); // a Meteor's burning crater (2026-10-14)
    pushStatusEnds(stBefore, players, sideOf, events); const stRound = statusSnap(players);
    fireRoundStartTriggers(players, sideOf, stats, events);
    const p1 = players[1], p2 = players[2];
    // Rally N (item #14): recomputed fresh every round, AFTER poison ticks/deaths resolve, so
    // a Rally source that just poisoned itself to death no longer contributes this round.
    computeRallyBonuses(players);
    fireArrowVolley(players, sideOf, stats, events);
    // 2026-09-20 (explicit bug report: "the battle log is missing some of the attack
    // transactions"): every reason below that keeps a card from taking its turn used to be a
    // silent `return` — the card just sat there, and nothing in the log explained why. A player
    // watching the log alone (not staring at every card's status icon) would see a round go by
    // with fewer hit/hitHQ lines than they had ready-looking creatures on the field, which reads
    // exactly like "some attacks went missing." `wait!==0` is deliberately NOT logged here — a
    // still-counting-down card already has its own dedicated Wait-ring tick/ready events, so a
    // second line here would just be noise on top of an already-covered case.
    function skipTurn(reason, card, ownId){
      if(recordEvents && events) events.push({type:'skipTurn', reason, side:sideOf(ownId), defId:card.defId, uid:card.uid});
    }
    // Turn order — history: 2026-09-16 ("make it left to right, but taking turns, top and
    // bottom"), 2026-09-20 ("the opponent always acts first... enemy, me, enemy, me, etc." —
    // switched from raw column to rank-from-center so the round-parity tie-break would actually
    // matter), 2026-09-22 batch #22 ("the creatures should attack from left to right, right now
    // it's abit random" — switched from rank-from-center to raw signed column, a genuine single
    // sweep instead of a center-out zigzag).
    //
    // 2026-09-22 follow-up rework (explicit, detailed design spec: "if the rows are not matched
    // ... M>N ... turn-parity matters during exact card-facing-card, same parity situations ...
    // we try to maintain a slot by slot, left to right, turn order" + a live repro confirming
    // "the enemy takes multiple turns in a row" while the player still had ready units queued):
    // the batch #22 fix above sorted by each side's own RAW, LOCALLY-numbered column (see
    // combatColumnsOf — every side numbers its own left/center/right independently out from its
    // OWN center) — that only produces a genuine physical left-to-right sweep when both rows are
    // the SAME width. The instant row widths differ, "my column -2" and "the enemy's column -2"
    // no longer line up at the same physical point on the battlefield at all, so sorting by that
    // raw local number can bunch several of one side's cards together purely because its row
    // happens to be wider or offset differently — reading exactly as "the enemy took multiple
    // turns in a row" even with the player's own ready cards sitting right there, un-skipped.
    //
    // The actual fix: reuse the SAME rank-interlock "teeth" geometry resolveLiveTarget/
    // opposingCardOf already use to decide who a card's attack even TARGETS on a mismatched
    // board (their own long comments above have the full derivation) — centering each side's
    // WHOLE row as one unit, pS(i) = i - n/2 for the i-th card (1-indexed, left to right) of an
    // n-card row — see liveSharedPos below. That formula places every live card on ONE shared
    // number line: when both rows share the same total-card PARITY, matching positions land on
    // whole numbers (a genuine face-off, exactly the "equal whole card slots" case of the design
    // spec); when parity differs, they land a half-slot apart (the interlocking case, "both sides
    // will share half a card slot each") — precisely the M-vs-N geometry described. Sorting ALL
    // attackers, both sides at once, by this ONE shared position is what actually makes "slot by
    // slot, left to right" hold across mismatched rows, not just symmetric ones.
    //
    // This also has to become a genuinely LIVE, PULL-based selection (discover-then-pick-the-
    // smallest-position each turn) instead of the old gather-once-then-sort-a-fixed-list
    // approach, for two reasons the design spec calls out directly: (1) a kill this round can
    // shrink a row and shift its survivors' ranks (already true before this rework — see
    // liveColOf/reflowAfterKills — but now it can also shift what THEIR shared position even
    // computes to, since n itself changed); (2) "think about how spawning will change this... if
    // the mob spawned the spawnling to the left, it has to go first, since that area has already
    // gone. But if it spawns to the right, we continue taking our turns as per normal" — a card
    // that spawns an ally mid-round (an onAttack/onKill/etc. custom trigger's spawnCard action,
    // already live-pushed straight into pl.row by the time that trigger runs) was never in any
    // pre-built list at all before this rework, so it could never take a turn the same round it
    // appeared no matter how "ready" it was. See discoverEligibleAttackers/pickNextAttacker below
    // — picking the live-smallest-shared-position card EVERY turn, from whatever's currently
    // eligible-and-not-yet-acted on EITHER side, naturally does both at once: a freshly spawned
    // card with a smaller position than everything still waiting jumps to the very front (it
    // "goes first, since that area has already gone"); one with a larger position just slots into
    // its correct place among what's left (it "continues taking turns as per normal") — with no
    // special-casing needed for which of those two cases actually applies.
    const handledUids = new Set(); // acted OR permanently skipped (reload/stun/etc.) this round — never reconsidered
    const zeroNoted = new Set();   // 0-Attack units already logged this round (they stay eligible for a later look)
    const swingAtkNow = card=> effAtk(card) + swarmBonus(card) + defianceBonus(card) + phaseBonus(card) + (card.inspired||0) + tideAtk(card);
    const poolMeta = new Map();    // uid -> {att, attId, enemyId} — currently eligible, not yet acted
    function discoverEligibleAttackers(){
      [[p1,1,2],[p2,2,1]].forEach(([pl,ownId,enemyId])=>{
        if(passAttackerIds && !passAttackerIds.includes(ownId)) return;
        ['left','center','right'].forEach(sideKey=>{
          pl.row[sideKey].forEach(card=>{
            const uid = card.uid;
            if(handledUids.has(uid) || poolMeta.has(uid)) return;
            if(passOnlyUid && uid !== passOnlyUid) return;
            // Not ready yet (hp<=0: already dead; wait!==0: still counting down — a wait value
            // never ticks down mid-round on its own, only an explicit effect like
            // reduceWaitOfSpawned can drop it to 0 early, which is exactly why this ISN'T added
            // to handledUids here: leaving it unconsidered means it's automatically picked up by
            // a LATER call to this same function, the instant such an effect makes it eligible).
            if(card.hp<=0 || card.wait!==0) return;
            // Counterattack (2026-10-11, user: "Attacks the front unit when it gets hit by an opponent. It doesn't attack
            // normally"): such a unit never takes a turn of its own; see counterStrike below.
            { const cd = CARD_DEFS[card.defId]; if(cd && cd.effects && cd.effects.counterattack){ handledUids.add(uid); return; } }
            if(card._boomerangCombat === combatNo && !passOnlyUid){ handledUids.add(uid); return; } // its boomerang came back: that was its attack
            if(card.reloadRemaining>0){ skipTurn('reload', card, ownId); handledUids.add(uid); return; }
            if(card.stunned){ skipTurn('stunned', card, ownId); handledUids.add(uid); return; }
            if(card.frozen>0){ skipTurn('frozen', card, ownId); handledUids.add(uid); return; }
            if(card.asleep>0){ skipTurn('asleep', card, ownId); handledUids.add(uid); return; }
            if(card.paralyzed>0 && rnd()<0.5){ skipTurn('paralyzed', card, ownId); handledUids.add(uid); return; } // one fresh coin flip, right here, the only time this card is ever considered this round
            if(card.chained){ skipTurn('chained', card, ownId); handledUids.add(uid); return; }
            if(card.cageOf){ handledUids.add(uid); return; } // a cage never acts
            if(card.ritualBase && !ritualMet(players[ownId], card)){ skipTurn('ritual', card, ownId); handledUids.add(uid); return; } // Ritual: not yet
            if(card.shellSkip || (card.shellQuiet != null && combatNo <= card.shellQuiet)){ skipTurn('shell', card, ownId); handledUids.add(uid); return; } // in its shell: no attack this round
            if(card.cowerRound === combatNo){ skipTurn('cower', card, ownId); handledUids.add(uid); return; } // Cower (2026-10-14): hiding or backing off this round
            if(card.petrified){ skipTurn('petrified', card, ownId); handledUids.add(uid); return; } // Petrification (2026-10-14): stone can't swing
            // 0 Attack (2026-10-12, user: "On tide, the coral polyps should have 1 attack - it can attack as long the attack is
            // >0. Please check at every battle step not just at the start ... what if an ally buffs it midway combat?"): the
            // swing's own bonuses count (Swarm, Defiance, day/night, Inspiring, the Flow tide), and a unit at 0 is NOT retired
            // for the round: every later look at the queue checks it again, so a buff mid-combat lets it swing.
            if(swingAtkNow(card) <= 0){ if(!zeroNoted.has(uid)){ zeroNoted.add(uid); skipTurn('zeroAttack', card, ownId); } return; }
            poolMeta.set(uid, {att:card, attId:ownId, enemyId});
          });
        });
      });
    }
    // Picks (and removes from the pool) whichever currently-eligible attacker should act next:
    // Quick still overrides everything else exactly as before (a separate, unrelated mechanic —
    // untouched by this rework), then the shared left-to-right position ascending, then
    // firstAttackerSide's round-parity alternation for an exact same-position tie. Recomputes
    // liveSharedPos fresh for every candidate on every call (cheap — real boards are small) so a
    // kill or a mid-round spawn earlier this same loop is always reflected immediately, never a
    // stale snapshot.
    function pickNextAttacker(){
      discoverEligibleAttackers();
      const candidates = [];
      poolMeta.forEach((meta, uid)=>{
        const pos = liveSharedPos(players[meta.attId], uid);
        if(pos===null) return; // defensive only — hp>0 was already confirmed at discovery time
        candidates.push({uid, att:meta.att, attId:meta.attId, enemyId:meta.enemyId, pos});
      });
      if(!candidates.length) return null;
      // Swift (2026-10-02) acts before everything — even Quick — and among several Swift units the
      // normal position/tie-break order below decides; then Quick; then everyone else.
      const speedRank = c=>{ const e = CARD_DEFS[c.att.defId].effects || {}; return e.swift ? 0 : (e.quick ? 1 : 2); };
      candidates.sort((a,b)=>{
        // Speed (2026-10-14): the highest Speed swings first; everything below is the old order within one Speed.
        const sa = a.att.speed||0, sb = b.att.speed||0;
        if(sa!==sb) return sb-sa;
        const ra = speedRank(a), rb = speedRank(b);
        if(ra!==rb) return ra-rb;
        if(a.pos!==b.pos) return a.pos-b.pos;
        const winsTies = firstAttackerSide || 2;
        return a.attId===winsTies ? -1 : 1;
      });
      const chosen = candidates[0];
      poolMeta.delete(chosen.uid);
      handledUids.add(chosen.uid);
      return chosen;
    }
    const killCredit = {};
    // Live reflow (2026-09-17, per explicit request: "collapse should happen immediately as
    // the fight goes on"): removeDeadCards()/onKill used to run exactly ONCE, after the whole
    // attack queue had finished — every kill this round, however many, got batched into one
    // lump cleanup+collapse at the very end. Now it runs after every SINGLE attacker's turn,
    // so a card that dies this round is spliced out of its row (and the center collapse-in
    // logic fires, if applicable) before the NEXT attacker in the queue ever resolves ITS
    // target — see liveColOf/liveEnemyCols above, which is what actually lets that next
    // attacker see and react to the reflowed board instead of the frozen round-start layout.
    // onKill triggers are scoped to just the kill(s) THIS attacker's turn credited (diffed
    // against a snapshot of killCredit's keys taken at the TOP of this same iteration, i.e.
    // `killCreditKeysAtTurnStart` below — NOT taken here, since by the time reflowAfterKills()
    // runs, this turn's own kills have already been written into killCredit during hit
    // resolution, which would make them invisible to a same-call snapshot), not the whole
    // round's worth at once, so "just got a kill" reads as immediate too, not deferred to
    // round-end.
    function reflowAfterKills(beforeKeys){
      removeDeadCards(players, sideOf, killCredit, stats, events);
      const newlyCredited = new Set();
      Object.entries(killCredit).forEach(([uid,set])=>{ if(!beforeKeys.has(uid)) set.forEach(k=>newlyCredited.add(k)); });
      if(newlyCredited.size){
        [players[1], players[2]].forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
          const key = statKey(sideOf(pl.id), c.defId);
          if(newlyCredited.has(key)) runCustomTriggers(players, sideOf, pl.id, c, CARD_DEFS[c.defId], 'onKill', stats, events);
        })));
      }
    }
    // Frenzy (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Flurry"): an attacker with
    // this keyword that's still alive after its swing gets one more full attack this same round,
    // immediately — see the check right after Reload below. Modeled as `pending` staying set to
    // the SAME candidate instead of a fresh pickNextAttacker() call, so a frenzying card's bonus
    // swing can never be preempted by anything else becoming newly eligible in between (matching
    // the old unshift-to-front-of-queue behavior exactly) — see 2026-09-22's rework comment above
    // pickNextAttacker for why attacker SELECTION itself moved from a fixed, pre-sorted queue to
    // a live pull each turn; this is the one place that still needs "the exact same card again,
    // no reselection."
    let pending = pickNextAttacker();
    while(pending){
      const a = pending;
      pending = null;
      if(a.att.hp<=0){ pending = pickNextAttacker(); continue; }
      // Snapshot taken BEFORE this iteration can credit any new kills, so reflowAfterKills()
      // can tell "died just now, this turn" apart from "was already dead/credited earlier
      // this round" — see reflowAfterKills' own comment for why this can't be taken inside it.
      const killCreditKeysAtTurnStart = new Set(Object.keys(killCredit));
      currentAttacker = a.att;
      const attDef = CARD_DEFS[a.att.defId];
      // Crit (2026-09-14): a 1-in-2 chance, capped at once per round, to double this card's
      // damage for every hit it lands this round (its primary attack and any Sweep/Swipe
      // continuation all use the same rolled value — one crit roll per attacker per round,
      // not one per individual hit).
      let atkThisRound = effAtk(a.att);
      let critLanded = false;
      if(attDef.effects && attDef.effects.crit){
        a.att.critUsed = a.att.critUsed || 0;
        if(a.att.critUsed < 1 && rnd() < 0.5){ a.att.critUsed = 1; critLanded = true; atkThisRound = atkThisRound * 2; }
      }
      // Ambush (2026-09-17): this card's FIRST attack after entering play always crits and
      // cannot be evaded/dodged — consumed the instant it's attempted (see ambushUsed below),
      // whether it lands on a creature or falls through to the castle, so it never lingers for
      // a later attack. Stacks with a normal Crit roll harmlessly (won't double-double — only
      // applies its own doubling if Crit didn't already land).
      const ambushForce = !!(attDef.effects && attDef.effects.ambush && !a.att.ambushUsed);
      if(ambushForce){
        a.att.ambushUsed = true;
        if(!critLanded){ critLanded = true; atkThisRound = atkThisRound * 2; }
      }
      // Fester: bonus damage = this card's OWN current poison stacks. Rupture: same, but for
      // its own current bleed stacks. Both stack additively on top of Crit. festerBonus/
      // ruptureBonus (VFX/SFX coverage audit, 2026-09-21) are the exact same amounts, kept as
      // their own named locals purely so every hit event this attack lands can carry them for
      // display — previously this bonus damage folded silently into atkThisRound with zero
      // attribution: a Fester hit for 9 and a plain hit for 9 looked pixel-for-pixel identical.
      const festerBonus = (attDef.effects && attDef.effects.fester) ? (a.att.poison||0) : 0;
      const ruptureBonus = (attDef.effects && attDef.effects.rupture) ? (a.att.bleed||0) : 0;
      atkThisRound += festerBonus + ruptureBonus;
      // On Attack (custom trigger — e.g. Bloodlust N = onAttack->buffAttack N): fires once this
      // card commits to attacking this round, AFTER atkThisRound is already captured above, so
      // a permanent Attack buff it grants takes effect starting NEXT round, not retroactively.
      runCustomTriggers(players, sideOf, a.attId, a.att, attDef, 'onAttack', stats, events);
      // Bleed: attacking at all ticks this card's own bleed stacks, whether or not the attack
      // finds/lands on a target.
      bleedTick(sideOf, a.attId, a.att, stats, events, 'attack');
      // Bug fix (2026-09-16, reported as "units get hit by nothing" / "the unit is dying but
      // still attacking"): bleedTick just above can itself kill the attacker (bleeding out
      // from the act of attacking), but the code used to keep going regardless and still
      // resolve a target + push a hit/hitHQ event for an attacker whose hp had already
      // dropped to 0 or below. That's the same "a unit that's dying doesn't get to act"
      // violation item #7 fixed for poison — just from a different, unguarded self-damage
      // source. Re-check here and bail before any target is resolved or damage is dealt.
      if(a.att.hp<=0){ reflowAfterKills(killCreditKeysAtTurnStart); pending = pickNextAttacker(); continue; } // this is itself a fresh death — reflow now, not at round's end
      // Live column/target resolution (2026-09-17 follow-up): both this attacker's OWN
      // column/facing and the enemy's column map are recomputed fresh from the CURRENT board,
      // not the frozen snapshot captured when the round started — see liveColOf's comment.
      // If an earlier attacker's kill this same round already caused this card to fall toward
      // center (or its flank to close up), it now swings from wherever it actually stands.
      const liveSelf = liveColOf(players[a.attId], a.att.uid);
      if(!liveSelf){ pending = pickNextAttacker(); continue; } // shouldn't happen (hp>0 just checked), but nothing to attack from
      const liveOwnCols = combatColumnsOf(players[a.attId]);
      const liveEnemyCols = combatColumnsOf(players[a.enemyId]);
      // Stealth: ignores normal targeting entirely and always hits the enemy HQ directly.
      let target = (attDef.effects && (attDef.effects.stealth || (attDef.effects.rainrunner && field && field.id === 'rain'))) ? {kind:'hq'} : resolveLiveTarget(liveOwnCols, liveEnemyCols, liveSelf.col); // Rainrunner: unblockable in the rain (2026-10-12)
      // Trident / Pitchfork / Octolash (2026-10-12, user: "Maybe Pitchfork is Trident + Pierce. Trident is Sweep ... When a unit
      // with these skills attack Left or Right, but it's the castle - it should hit the castle instead ... Add a new skill
      // Octolash - hit 8 nearest opposing units in front of this unit"). Trident strikes the unit in front and both columns
      // beside it with its full Attack; an empty side column takes that prong to the castle. Pitchfork is a Trident whose
      // prongs ignore Armour. Octolash lashes the 8 enemy units nearest it (front first), full Attack each, never the castle.
      const octoAtk = !!(attDef.effects && attDef.effects.octolash && !attDef.effects.stealth);
      // Backstab N (D21, 2026-10-10, user: "Backstab - when it hits an enemy not directly in front of it. It also always
      // attacks the nearest enemy, never the castle."): picks the nearest living enemy unit (the one in front if there is
      // one), never the castle (no enemy units: it holds its swing), and hits for N more when that unit isn't the one
      // directly in front of it.
      let backstabBonus = 0;
      if(attDef.effects && Number(attDef.effects.backstab) > 0 && !attDef.effects.stealth){
        const near = nearestEnemyCard(players, a.attId, a.att, liveOwnCols, liveEnemyCols, liveSelf.col);
        target = near ? near.entry : null;
        if(near && !near.direct) backstabBonus = Number(attDef.effects.backstab);
      }
      // Crab claws (2026-10-15 rework, user: "Crab claws can be, attack a random unit L or R. Very awkward for the crab, but very
      // fitting."): each swing pinches one random enemy unit in the column to its left or right (a coin flip when both have one).
      // Neither side has a unit: it attacks straight ahead as normal (the unit in front, or the castle). (Was: alternating
      // left/right, and a wasted pinch with a unit in front.)
      if(attDef.effects && attDef.effects.crabClaws && !attDef.effects.stealth && !(Number(attDef.effects.backstab) > 0)){
        const lanesC = prongLanes(liveOwnCols, liveEnemyCols, liveSelf.col);
        const has = col=>{ const en = col != null ? liveEnemyCols[col] : null; return !!(en && en.kind==='card' && en.card && en.card.hp > 0); };
        const sides = ['left','right'].filter(sd=> has(lanesC[sd]));
        const pick = sides.length ? sides[Math.floor(rnd()*sides.length)] : null;
        if(pick){ const col = lanesC[pick], en = liveEnemyCols[col]; en.col = col; target = en;
          if(recordEvents && events) events.push({type:'crabClaw', side:sideOf(a.attId), attUid:a.att.uid, attDefId:a.att.defId, dir:pick, targetUid:en.card.uid}); }
      }
      // Fork / Trident / Pitchfork (2026-10-15, user: "Decision, we can make the first 3 more similar - attack the nearest 2/3/4
      // enemies within 1/1/2 range."): one rule for all three (PRONG_SPECS). It hits the N nearest enemy units no more than R
      // columns away (measured from where it stands, as prongLanes does; ties at random), full Attack each. The first is its
      // normal swing (the unit in front when there is one, with Evade, Guardian, Pierce and every on-hit effect); the rest are
      // prongs (forkStrike: every on-hit effect, no Evade roll, never the castle), each rolling its own Blind/dark miss. With no
      // enemy unit in range it just attacks straight ahead as normal (the castle when nothing is in front). (Was, for Fork:
      // the two columns either side of the one in front, an empty side hitting the castle.)
      const prongSpec = (target && !(attDef.effects && attDef.effects.crabClaws) && !(Number((attDef.effects||{}).backstab) > 0)) ? prongSpecOf(attDef) : null;
      let prongCols = [];
      if(prongSpec){
        const lanesP = prongLanes(liveOwnCols, liveEnemyCols, liveSelf.col);
        const inRange = Object.keys(liveEnemyCols).map(Number).filter(c=>{ const en = liveEnemyCols[c]; return en && en.kind === 'card' && en.card && en.card.hp > 0 && lanesP.dist(c) <= prongSpec.range + 0.5; })
          .map(c=> [c, lanesP.dist(c) + rnd()*0.1]).sort((x, y)=> x[1] - y[1]).map(x=> x[0]);
        if(inRange.length){
          const tc = (target.kind === 'card' && target.col != null && inRange.includes(target.col)) ? target.col : inRange[0];
          if(!(target.kind === 'card' && target.col === tc)){ const en = liveEnemyCols[tc]; en.col = tc; target = en; }
          prongCols = inRange.filter(c=> c !== tc).slice(0, prongSpec.n - 1);
        }
      }
      // Tipsy (2026-10-11, user: "Tipsy means attacks L, Centre or R, randomly"): the swing drifts one column left, stays,
      // or drifts right at random. A drift onto an empty column misses (the castle is never hit by a stumble).
      let tipsyMiss = false;
      if(target && a.att.tipsy>0 && !prongSpec && !(attDef.effects && attDef.effects.stealth)){ // Fork / Trident / Pitchfork prongs don't stumble (2026-10-12; all three 2026-10-15)
        const d = [-1, 0, 1][Math.floor(rnd()*3)];
        if(d){ const baseCol = (target.kind==='card' && target.col!=null) ? target.col : liveSelf.col, col = baseCol + d, e = liveEnemyCols[col];
          if(e && e.kind==='card' && e.card.hp>0){ e.col = col; target = e; } else tipsyMiss = true;
          if(recordEvents && events) events.push({type:'tipsySwing', side:sideOf(a.attId), attDefId:a.att.defId, attUid:a.att.uid, drift:d, miss:tipsyMiss}); }
      }
      if(!target || tipsyMiss){ pending = pickNextAttacker(); continue; }
      const dmgType = (a.att.chilli > 0 && attackDmgType(attDef) !== 'magic') ? 'heat' : attackDmgType(attDef); // Magic (2026-10-14): effects.magic swings magic damage; Chilli (2026-10-15): fire
      const mySide = sideOf(a.attId);
      const aStat = ensureStat(stats, mySide, a.att.defId);
      // Grit (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Valor"/"Bravery"): a
      // built-in comeback bonus. If this card is currently weaker (lower effective Attack)
      // than the target it's about to swing at, it permanently toughens up. Compared AFTER
      // atkThisRound is captured (same convention as the onAttack trigger above), so the
      // bonus applies starting next round, not retroactively to this swing.
      // Inspiring N (2026-10-12, a new passive): as it attacks, the allies either side of it get +N Attack for their next
      // swing. Friction N (2026-10-12, user: "a negative passive that deals N damage to your adjacent allies when this
      // unit attacks").
      { const ie = attDef.effects || {}, insp = Number(ie.inspiring)||0, fric = Number(ie.friction)||0;
        if(insp > 0 || fric > 0) [liveSelf.col - 1, liveSelf.col + 1].forEach(col=>{ const en = liveOwnCols[col]; if(!en || en.kind!=='card' || !en.card || !(en.card.hp > 0)) return; const ally = en.card;
          if(insp > 0){ ally.inspired = (ally.inspired||0) + insp; if(recordEvents && events) events.push({type:'statusFx', kind:'inspired', side:mySide, attUid:a.att.uid, attDefId:a.att.defId, targetUid:ally.uid, targetDefId:ally.defId, amount:insp}); }
          if(fric > 0){ const fd = damageCardFlat(ally, fric, 'physical', a.att.defId); if(recordEvents && events) events.push({type:'friction', side:mySide, attUid:a.att.uid, attDefId:a.att.defId, targetSide:mySide, targetUid:ally.uid, targetDefId:ally.defId, dmg:fd}); }
        }); }
      if(attDef.effects && attDef.effects.grit && target.kind==='card' && effAtk(target.card) > effAtk(a.att)){
        const gritAmt = attDef.effects.grit;
        a.att.atk += gritAmt; a.att.baseAtk += gritAmt;
        if(recordEvents && events) events.push({type:'statusFx', kind:'grit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:gritAmt});
      }
      // Blind (status, 2026-09-17): while active, THIS attacker's own attack auto-misses
      // entirely — no damage to a card OR the castle — but it still counts as having
      // attacked (onAttack already fired, bleed already ticked above). Checked before Evade/
      // Ambush since a blind swing has nothing to do with whether the DEFENDER would dodge.
      // Sweep N (reworked 2026-10-12, user: "If there is nothing in front of it, it just hits the opposing Bramble. If there
      // is, it ... hits the Left, then Centre, then Right opposing units. If the Left or Right contains no units, it does not
      // mean it immediately attacks the centre!"): with a unit in front, the swing goes left, centre, right in that order.
      // The sides take N each (armour counts, no on-hit effects); an empty side is a swing at thin air (sweepWhiff), never
      // redirected. Nothing in front: it just hits the castle.
      let swingLanded = false;
      const sweepN = (attDef.effects && Number(attDef.effects.sweep) > 0 && target.kind==='card') ? Number(attDef.effects.sweep) + (((perksOfSide(mySide)||{}).brambleStorm) ? 1 : 0) : 0; // + Wildpath "Bramble Storm"
      const sweepNear = sweepN ? target.card : null, sweepCol = sweepN ? target.col : null;
      const sweepStrike = (col, dir)=>{
        const entry = liveEnemyCols[col];
        if(!entry || entry.kind!=='card' || !entry.card || entry.card.hp<=0){
          if(recordEvents && events) events.push({type:'sweepWhiff', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), nearUid:sweepNear.uid, dir});
          return;
        }
        const side = entry.card;
        if(!combatHitLands(a.att, side, false)){
          if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:side.defId, targetUid:side.uid, sweep:true});
          return;
        }
        const r2 = damageCard(side, sweepN, dmgType, null);
        aStat.dealt += r2.dmg;
        ensureStat(stats, sideOf(a.enemyId), side.defId).taken += r2.dmg;
        if(recordEvents && events) events.push({type:'hit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:side.defId, targetUid:side.uid, dmg:r2.dmg, dmgType, armorBlocked:r2.armorBlocked, sweep:true, sweepDir:dir});
        maybeBreakChain(players, sideOf, a.enemyId, side, stats, events, {kind:'damage', amount:r2.dmg});
        if(!killCredit[side.uid]) killCredit[side.uid] = new Set();
        killCredit[side.uid].add(statKey(mySide, a.att.defId));
      };
      // Prong strikes (Fork / Trident / Pitchfork / Octolash side hits): a unit there takes the full hit with every on-hit effect.
      // castleOk: an empty column sends the swing to the castle (no skill does that since 2026-10-15; kept for old saves' swipe:true).
      const forkStrike = (flankCol, castleOk, prong)=>{ if(castleOk === undefined) castleOk = false;
            const flankEntry = liveEnemyCols[flankCol];
            if(flankEntry && flankEntry.kind==='card' && flankEntry.card.hp>0){
              const c2raw = flankEntry.card;
              if(!combatHitLands(a.att, c2raw, false)){ // Swipe flank: multi-target, so no Evade roll — Swift/Flying still apply
                if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2raw.defId, targetUid:c2raw.uid, fork:true});
                return;
              }
              const c2 = redirectToGuardian(players[a.enemyId], c2raw);
              const c2GuardianRedirect = c2.uid !== c2raw.uid;
              const r3 = damageCard(c2, atkThisRound, dmgType, a.att);
              aStat.dealt += r3.dmg;
              ensureStat(stats, sideOf(a.enemyId), c2.defId).taken += r3.dmg;
              if(recordEvents && events) events.push({type:'hit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2.defId, targetUid:c2.uid, dmg:r3.dmg, dmgType, armorBlocked:r3.armorBlocked, fork:true, prong: prong || null, guardianRedirect:c2GuardianRedirect, crit:critLanded, rend:r3.rendBypass, festerBonus, ruptureBonus, elementalConvert:r3.elementalConvert, elementalAmount:r3.elementalAmount});
              if(r3.kingSlayerBonus>0 && recordEvents && events) events.push({type:'kingSlayer', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2.defId, targetUid:c2.uid, amount:r3.kingSlayerBonus});
              maybeBreakChain(players, sideOf, a.enemyId, c2, stats, events, {kind:'damage', amount:r3.dmg});
              psychicHit(otherId(a.enemyId), a.att, c2, sideOf, stats, events); // Psychic N (2026-10-14)
              const nullF = isNullifier(a.att); // Nullify (2026-10-14)
              if(!nullF) applySpite(players, sideOf, a.enemyId, c2, a.att, r3.dmg, stats, events, killCredit);
              { const pz = poisonOn(attDef); if(pz && c2.hp>0 && (r3.dmg > 0 || r3.elementalAmount > 0)){ c2.poison = (c2.poison||0) + pz; aStat.poisonApplied += pz; } } // + Rabid (2026-10-14)
              if(attDef.effects.decay && c2.hp>0){ c2.decay = (c2.decay||0) + attDef.effects.decay; }
              { const bl = (Number(attDef.effects.bleed)||0) + (Number(attDef.effects.perforate)||0) + (isFrenzied(a.att) ? 1 : 0) + ((Number(attDef.effects.bleed)||0) > 0 && (perksOfSide(mySide)||{}).thornbite ? 1 : 0); if(bl > 0 && c2.hp>0 && !isGhost(c2)){ c2.bleed = (c2.bleed||0) + bl; } } // Ghosts don't bleed (2026-10-14)
              if(!nullF) ichorSplash(players, sideOf, a.enemyId, c2, a.att, stats, events, killCredit); // Ichor (2026-10-14)
              if(attDef.effects.scar && c2.hp>0){ c2.scar = (c2.scar||0) + attDef.effects.scar; if(recordEvents && events) events.push({type:'statusFx', kind:'scar', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2.defId, targetUid:c2.uid, amount:attDef.effects.scar}); }
              rollStatusOnHit('freeze', attDef.effects.freeze, c2, mySide, a.att, sideOf, a.enemyId, events);
              rollStatusOnHit('sleep', attDef.effects.sleep, c2, mySide, a.att, sideOf, a.enemyId, events);
              rollStatusOnHit('paralyze', attDef.effects.paralyze, c2, mySide, a.att, sideOf, a.enemyId, events);
              rollStatusOnHit('stunOnHit', attDef.effects.stunOnHit, c2, mySide, a.att, sideOf, a.enemyId, events);
              if(attDef.effects.sap && r3.dmg>0){ const healed3 = Math.min(a.att.maxHp - a.att.hp, r3.dmg); if(healed3>0){ a.att.hp += healed3; if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healed3}); } }
              if(c2.hp<=0){ if(!killCredit[c2.uid]) killCredit[c2.uid] = new Set(); killCredit[c2.uid].add(statKey(mySide, a.att.defId)); }
              else if(!nullF){
                bleedTick(sideOf, a.enemyId, c2, stats, events, 'defend');
                runCustomTriggers(players, sideOf, a.enemyId, c2, CARD_DEFS[c2.defId], 'onAttacked', stats, events);
              }
            } else {
              if(!castleOk) return; // Octolash: an empty column is just empty
              // Empty (or off-board) flank column: redirect this swipe swing straight to the
              // castle, same damageHQ path (bulwark reduction included) the primary castle hit
              // below uses — no Siege bonus here, Siege is specifically about the PRIMARY attack
              // landing on the castle, not a swipe redirect.
              const flankDmg = damageHQ(players[a.enemyId], castleSwingAmt(a.att, atkThisRound));
              aStat.dealt += flankDmg; aStat.faceDamage += flankDmg;
              if(recordEvents && events) events.push({type:'hitHQ', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), dmg:flankDmg, fork:true, prong: prong || null, festerBonus, ruptureBonus});
              if(attDef.effects.sap && flankDmg>0){
                const healedFlank = Math.min(a.att.maxHp - a.att.hp, flankDmg);
                if(healedFlank>0){ a.att.hp += healedFlank; if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healedFlank}); }
              }
            }
      };
      // Keen Sense (2026-10-14, user: "For moles: senses non-flying enemies even when blind; unaffected by Blind"): darkness and
      // Blind don't make it miss a target that isn't flying (the castle included).
      const keenSense = !!(attDef.effects && attDef.effects.keenSense) && !(target && target.kind === 'card' && target.card && effectsOf(target.card).flying);
      // Exposed (2026-10-15): an attack aimed at an Exposed unit can't miss, so Blind and the dark don't roll for it.
      const atExposed = !!(target && target.kind === 'card' && target.card && target.card.exposed > 0);
      const sMiss = (a.att.blind>0 || keenSense) ? 0 : sightMiss(a.att, otherId(a.enemyId)); const nightMiss = !atExposed && sMiss > 0 && (sMiss >= 1 || rnd() < sMiss);
      const blindNow = (!atExposed && a.att.blind>0 && !keenSense && rnd() < 0.5) || nightMiss;
      if(sweepN && !blindNow) sweepStrike(sweepCol - 1, 'left');
      if(blindNow){ // Blind (2026-10-11, user: "Blind means miss 1/2 the time")
        if(recordEvents && events) events.push({type:'blindMiss', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetKind:target.kind, night: nightMiss || undefined});
      } else
      // Evasive: the ORIGINAL target gets the dodge roll before any Guardian redirect — a
      // successful evade means the primary attack whiffs entirely (no damage, no Thorns/
      // Poison/Expose/Shell/onAttackedSpawn). Sweep/Swipe continuation and an HQ strike are
      // unaffected by a dodged primary hit. Ambush overrides this gate entirely (see
      // ambushForce above) — its first strike always connects.
      if(target.kind==='card' && !ambushForce && !combatHitLands(a.att, target.card, true)){
        if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:target.card.defId, targetUid:target.card.uid});
      } else if(target.kind==='card'){
        // Guardian: an adjacent protector (same row, one slot either way) takes the hit
        // instead, if alive. Sweep/Swipe continuation still uses target.col (the ORIGINAL
        // target's position), so protection redirects damage without warping geometry.
        const defCard = redirectToGuardian(players[a.enemyId], target.card);
        const guardianRedirect = defCard.uid !== target.card.uid;
        const hpBeforeHit = defCard.hp; // Overwhelm (below) needs this to compute overkill
        const bleedBeforeHit = defCard.bleed || 0; // Bloodlust (2026-10-15): was it already Bleeding?
        const {dmg, armorBlocked, rendBypass, kingSlayerBonus, elementalConvert, elementalAmount} = damageCard(defCard, atkThisRound + backstabBonus, dmgType, a.att);
        swingLanded = true;
        aStat.dealt += dmg;
        ensureStat(stats, sideOf(a.enemyId), defCard.defId).taken += dmg;
        if(recordEvents && events) events.push({type:'hit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, dmg, dmgType, armorBlocked, guardianRedirect, crit:critLanded, ambush:ambushForce, rend:rendBypass, festerBonus, ruptureBonus, elementalConvert, elementalAmount, backstab:backstabBonus||0});
        // King Slayer (2026-09-22): a dedicated event, separate from the plain 'hit' above, so
        // the front end can flourish this distinctly instead of the bonus silently blending into
        // the ordinary damage number — see computeHitDamage's kingSlayerBonus for the actual math.
        if(kingSlayerBonus>0 && recordEvents && events) events.push({type:'kingSlayer', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:kingSlayerBonus});
        psychicHit(otherId(a.enemyId), a.att, defCard, sideOf, stats, events); // Psychic N (2026-10-14)
        // Pierce (2026-09-17, per explicit request: "pierce... should also hit the castle"):
        // a flat, unconditional chunk of extra damage punches straight through to the enemy
        // castle on every landed melee hit, on top of whatever this hit did to defCard —
        // independent of whether defCard survives.
        const punctureN = attDef.effects ? (Number(attDef.effects.puncture)||0) + (Number(attDef.effects.perforate)||0) : 0; // Puncture (was Pierce, 2026-10-11); Perforate adds its N
        if(punctureN > 0){
          const pierceDmg = damageHQ(players[a.enemyId], punctureN);
          if(pierceDmg>0 && recordEvents && events) events.push({type:'pierceHQ', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), dmg:pierceDmg});
        }
        // Chained (Devilry, 2026-09-17, per explicit request: "the simplest of which is getting
        // hit by any damage >1"): checked on every landed melee hit, same "breaks on ANY
        // damage taken" convention Sleep already uses, just gated to a configurable threshold.
        maybeBreakChain(players, sideOf, a.enemyId, defCard, stats, events, {kind:'damage', amount:dmg});
        // Thorns: defender reflects flat damage back to the attacker on every normal attack it receives.
        const nullHit = isNullifier(a.att); // Nullify (2026-10-14): none of the reactions below
        if(nullHit && recordEvents && events) events.push({type:'statusFx', kind:'nullify', side:mySide, attUid:a.att.uid, attDefId:a.att.defId, targetSide:sideOf(a.enemyId), targetUid:defCard.uid, targetDefId:defCard.defId, killed: defCard.hp <= 0});
        const defDefEarly = nullHit ? {effects:{}} : CARD_DEFS[defCard.defId];
        const durianThorns = nullHit ? 0 : (defCard.thornsBonus||0); // Durian (2026-10-14): Thorns +1 per durian eaten
        if((defDefEarly.effects && defDefEarly.effects.thorns) || durianThorns > 0){
          const thornsDmg = (Number(defDefEarly.effects && defDefEarly.effects.thorns)||0) + durianThorns;
          a.att.hp = Math.max(0, a.att.hp - thornsDmg);
          ensureStat(stats, sideOf(a.enemyId), defCard.defId).thornsDealt += thornsDmg;
          ensureStat(stats, mySide, a.att.defId).taken += thornsDmg;
          if(recordEvents && events) events.push({type:'thorns', side:sideOf(a.enemyId), fromDefId:defCard.defId, fromUid:defCard.uid, targetSide:mySide, targetDefId:a.att.defId, targetUid:a.att.uid, dmg:thornsDmg});
          if(a.att.hp<=0){
            if(!killCredit[a.att.uid]) killCredit[a.att.uid] = new Set();
            killCredit[a.att.uid].add(statKey(sideOf(a.enemyId), defCard.defId));
          }
        }
        if(!nullHit){
        ichorSplash(players, sideOf, a.enemyId, defCard, a.att, stats, events, killCredit); // Ichor (2026-10-14)
        applySpite(players, sideOf, a.enemyId, defCard, a.att, dmg, stats, events, killCredit);
        counterStrike(players, sideOf, a.enemyId, defCard, stats, events, killCredit);
        }
        // Reflect (2026-09-17): a chance-based twist on Thorns — instead of a guaranteed flat
        // counter-hit, Reflect% is a chance to throw the FULL damage of the incoming hit
        // straight back at the attacker. Both can coexist on the same card (rare, but not
        // specially blocked) — each rolls/fires independently.
        if(defDefEarly.effects && defDefEarly.effects.reflect && dmg>0 && rnd() < (defDefEarly.effects.reflect/100)){
          a.att.hp = Math.max(0, a.att.hp - dmg);
          ensureStat(stats, sideOf(a.enemyId), defCard.defId).thornsDealt += dmg;
          ensureStat(stats, mySide, a.att.defId).taken += dmg;
          if(recordEvents && events) events.push({type:'reflect', side:sideOf(a.enemyId), fromDefId:defCard.defId, fromUid:defCard.uid, targetSide:mySide, targetDefId:a.att.defId, targetUid:a.att.uid, dmg});
          if(a.att.hp<=0){
            if(!killCredit[a.att.uid]) killCredit[a.att.uid] = new Set();
            killCredit[a.att.uid].add(statKey(sideOf(a.enemyId), defCard.defId));
          }
        }
        // 2026-10-12 (user: "If a poison-ing unit hits an enemy and deals no combat damage (e.g. too much armour), it does not
        // deal poison"): only a hit that got through (or converted into poison stacks) leaves poison.
        { const pz = poisonOn(attDef); if(pz && defCard.hp>0 && (dmg > 0 || elementalAmount > 0)){ // + Rabid's 2 (2026-10-14)
          defCard.poison = (defCard.poison||0) + pz;
          aStat.poisonApplied += pz;
        } }
        if(attDef.effects && attDef.effects.desecrate) curseCell(players, a.enemyId, defCard, Number(attDef.effects.desecrate), events); // Desecrate N: curse the cell the target stands on
        // Decay (passive, 2026-09-29): mirrors Poison's on-hit stacking exactly, but as its own
        // separate stack (card.decay, ticked by applyDecayTicks) — see that function's comment
        // for how it differs from Poison at tick time (Decay also saps Attack, not just HP).
        if(attDef.effects && attDef.effects.decay && defCard.hp>0){
          defCard.decay = (defCard.decay||0) + attDef.effects.decay;
        }
        if(attDef.effects && Number(attDef.effects.daunt) > 0 && defCard.hp>0){
          (defCard.daunts = defCard.daunts || []).push({n: Number(attDef.effects.daunt), until: combatNo + 1});
          if(recordEvents && events) events.push({type:'statusFx', kind:'daunt', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:Number(attDef.effects.daunt)});
        }
        // Bleed (passive): this card's attack also stacks Bleed on the target, mirroring Poison.
        { const bl = attDef.effects ? (Number(attDef.effects.bleed)||0) + (Number(attDef.effects.perforate)||0) + (isFrenzied(a.att) ? 1 : 0) + ((Number(attDef.effects.bleed)||0) > 0 && (perksOfSide(mySide)||{}).thornbite ? 1 : 0) : 0;
          if(bl > 0 && defCard.hp>0 && !isGhost(defCard)) defCard.bleed = (defCard.bleed||0) + bl; } // Ghosts don't bleed (2026-10-14)
        // Bloodlust N (2026-10-15, user: "New Skill: Bloodlust - ability idk, but I assume when it draws blood, it gets stronger."):
        // "draws blood" = its attack lands real damage on an enemy unit that is Bleeding (it already was, or this hit made it bleed).
        // Each such attack: +N Attack for the rest of the fight, up to +3N in all. Its main swing only (not Sweep/Fork side hits).
        if(attDef.effects && attDef.effects.bloodlust && dmg > 0 && (bleedBeforeHit > 0 || (defCard.bleed||0) > bleedBeforeHit)) bloodlustGain(a.att, attDef, mySide, events);
        // Perforate N (2026-10-11): the hit also strips N of the target's Armor for good.
        if(attDef.effects && attDef.effects.perforate > 0 && defCard.hp>0){ const d0 = CARD_DEFS[defCard.defId]; const base = (d0 && d0.effects && d0.effects.armor) || 0;
          if(base - (defCard.armorLoss||0) > 0){ defCard.armorLoss = Math.min(base, (defCard.armorLoss||0) + attDef.effects.perforate); if(recordEvents && events) events.push({type:'statusFx', kind:'armorShred', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:attDef.effects.perforate}); } }
        // Corrode (status, 2026-09-17): stacks like Poison/Bleed, but saps effective Attack
        // instead of dealing damage — see effAtk/endOfRoundUpkeep for the read/decay sides.
        // Unlike Poison/Bleed (silent on application, only their periodic tick is logged),
        // Corrode pushes its own statusFx on application — same convention Scar (the other
        // permanent/stacking mark) already uses — since there's no periodic tick moment of its
        // own to visualize the debuff landing.
        if(attDef.effects && attDef.effects.corrode && defCard.hp>0){
          defCard.corrode = (defCard.corrode||0) + attDef.effects.corrode;
          defCard._corrodeJustSet = true;
          if(recordEvents && events) events.push({type:'statusFx', kind:'corrode', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:attDef.effects.corrode});
        }
        // Expose N (2026-10-15 rework, user: "It should give a debuff 'exposed'. This unit takes +1 damage and attacks on this unit
        // don't miss."): a landed attack leaves the target Exposed for its next N hits (+1 damage each, can't be missed).
        if(attDef.effects && attDef.effects.expose && defCard.hp>0){
          const xn = Number(attDef.effects.expose) || 1;
          defCard.exposed = (defCard.exposed||0) + xn;
          if(recordEvents && events) events.push({type:'statusFx', kind:'expose', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:xn, passive:true});
        }
        // Scar (permanent, stacking Expose — see computeHitDamage): applied the same way as
        // Expose/Poison/Bleed, but on a SURVIVING target only makes sense the same as those.
        if(attDef.effects && attDef.effects.scar && defCard.hp>0){
          defCard.scar = (defCard.scar||0) + attDef.effects.scar;
          if(recordEvents && events) events.push({type:'statusFx', kind:'scar', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:attDef.effects.scar});
        }
        // Bludgeon (2026-10-13, user: "Destroys either armour, removes flying or swimming or burrow - and in the future, anything
        // like that"): each landed hit knocks out one defence the target still has, picked at random with equal odds.
        if(attDef.effects && attDef.effects.bludgeon && defCard.hp>0) bludgeonHit(a.att, defCard, mySide, sideOf(a.enemyId), events);
        if(attDef.effects && attDef.effects.wave && defCard.hp>0) waveHit(players, sideOf, otherId(a.enemyId), a.att, defCard, events, stats); // Wave (2026-10-14): push it a column
        if(attDef.effects && attDef.effects.wither && defCard.hp>0) applyWither(otherId(a.enemyId), a.att, defCard, numN(attDef.effects.wither, 1), sideOf, events); // Wither N (2026-10-14)
        if(attDef.effects && attDef.effects.dragonLightning) dragonLightningStrike(players, sideOf, otherId(a.enemyId), a.att, defCard, numN(attDef.effects.dragonLightning, 1), stats, events, killCredit); // Dragon Lightning N (2026-10-14)
        if(attDef.effects && attDef.effects.electricity) electricityArc(players, sideOf, otherId(a.enemyId), a.att, defCard, numN(attDef.effects.electricity, 1), stats, events, killCredit); // Electricity N (2026-10-14)
        // Elemental status effects (Frozen/Asleep/Paralyzed/Stun-on-hit) — see rollStatusOnHit.
        if(attDef.effects){
          rollStatusOnHit('freeze', attDef.effects.freeze, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('sleep', attDef.effects.sleep, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('paralyze', attDef.effects.paralyze, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('stunOnHit', attDef.effects.stunOnHit, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('blind', attDef.effects.blind, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('tipsy', attDef.effects.tipsy, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('confuse', attDef.effects.confuse, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('shock', attDef.effects.shock, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('stagger', attDef.effects.stagger, defCard, mySide, a.att, sideOf, a.enemyId, events);
        }
        // Sap (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Leech"): heals the
        // attacker for the damage it just dealt, capped at its own max HP. Fires whether or
        // not the target survived — draining life is a property of landing the hit, not of
        // the target's fate.
        if(attDef.effects && attDef.effects.sap && dmg>0){
          const healed = Math.min(a.att.maxHp - a.att.hp, dmg);
          if(healed>0){
            a.att.hp += healed;
            if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healed});
          }
        }
        // Shell: getting hit queues bonus armor + a skip-next-attack debuff, activated at the
        // FOLLOWING round's upkeep (not this one) — see endOfRoundUpkeep for the activate/clear pass.
        // (Shell now goes up inside damageCard itself, on any hit; 2026-10-12.)
        if(defCard.hp<=0){
          if(!killCredit[defCard.uid]) killCredit[defCard.uid] = new Set();
          killCredit[defCard.uid].add(statKey(mySide, a.att.defId));
          // Overwhelm (2026-09-17): whatever damage this killing blow had left over after
          // defCard's HP hit 0 carries through to the enemy castle — a cleave-through reward
          // for overkilling a target, on top of anything Pierce already did.
          if(attDef.effects && attDef.effects.overwhelm){
            const overkill = dmg - hpBeforeHit;
            if(overkill>0){
              const spillDmg = damageHQ(players[a.enemyId], overkill);
              if(spillDmg>0 && recordEvents && events) events.push({type:'overwhelmHQ', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), dmg:spillDmg});
            }
          }
          // Momentum (2026-09-17): permanently gains Attack for every killing blow it lands —
          // a self-scaling snowball, distinct from Grit (reacts to being outmatched) and Esprit
          // (reacts to allies spawning).
          if(attDef.effects && attDef.effects.momentum){
            const momAmt = attDef.effects.momentum;
            a.att.atk += momAmt; a.att.baseAtk += momAmt;
            if(recordEvents && events) events.push({type:'statusFx', kind:'momentum', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:momAmt});
          }
        } else if(!nullHit){
          const defDef = CARD_DEFS[defCard.defId];
          // LEGACY (2026-09-21 consolidation, "Make consistent the abilities... remove On
          // Attacked: Spawn to the trigger system"): the card editor can no longer author
          // effects.onAttackedSpawn -- Bee Drone/Scraper of Skies/Colony (the only 3 cards that
          // ever carried it) are now migrated to a plain effects.triggers entry (on:'onAttacked',
          // do:'spawnCard'), handled by the generic 'onAttacked' runCustomTriggers call right
          // below this block, which already produces the same cause:'triggerSpawn' event the
          // front end's bee-landing/jump-from-spawner VFX already treats identically to this
          // block's own cause:'onAttackedSpawn'. This block is kept only so any old, unmigrated
          // save data (same backward-compat convention as effects.missile after the Arrow N
          // migration) still works if it somehow still carries the field.
          if(defDef.effects && defDef.effects.onAttackedSpawn){
            const side0 = findCardSide(players[a.enemyId], defCard.uid);
            const side = side0 ? flankOrShorter(players[a.enemyId], side0) : null;
            if(side){
              const spawnId = defDef.effects.onAttackedSpawn.defId;
              const count = defDef.effects.onAttackedSpawn.count || 1;
              // Task #126 (2026-09-17, "The spawning from getting hit (Bee Drone) should happen
              // immediately and rebalance the positions... a cute animation of the bee landing
              // then pushing the cards"): the UI needs each new token's uid (plus which lane it
              // landed in) so it can insert them into the live mid-round replay row and trigger
              // its own landing flourish the instant this event replays, instead of only ever
              // appearing once the whole round's log finishes. onDeathSpawn's own 'spawn' event
              // deliberately keeps its old shape — only this cause is in scope for that request.
              // 2026-09-17 follow-up (per explicit request: "the bee swarmling should spawn to
              // the left or right of the BEE DRONE specifically, not just to the left of its
              // rank/flank"): this used to .push() straight onto the END of the whole flank
              // array — the outermost slot of that flank — regardless of where in the flank
              // defCard (the drone) itself actually sat, so a drone anywhere but the very
              // outer edge spawned its token beside some OTHER card instead. Now inserted
              // immediately outward (away from center) of defCard's own index, so the token
              // always lands directly next to the specific card that got hit.
              const laneArr = players[a.enemyId].row[side];
              const droneIdx = side===side0 ? laneArr.indexOf(defCard) : -1;
              const insertAt = droneIdx===-1 ? laneArr.length : droneIdx+1;
              const newUids = [];
              for(let i=0;i<count;i++){ const tok = makeBoardCard(spawnId); laneArr.splice(insertAt+i, 0, tok); newUids.push(tok.uid); }
              ensureStat(stats, sideOf(a.enemyId), defCard.defId).spawnedTokens += count;
              if(recordEvents && events) events.push({type:'spawn', side:sideOf(a.enemyId), defId:spawnId, count, cause:'onAttackedSpawn', uids:newUids, lane:side, nearUid:defCard.uid});
              newUids.forEach(u=>{ const tok = laneArr.find(c=> c.uid === u); if(tok) espritForArrival(players, sideOf, a.enemyId, tok, events); }); // Esprit counts spawns (2026-10-14)
            }
          }
          // Bleed: defending against a landed melee hit ticks the defender's own bleed stacks.
          bleedTick(sideOf, a.enemyId, defCard, stats, events, 'defend');
          // onAttacked custom triggers (e.g. Berserker = onAttacked->buffAttack 1) fire here,
          // for the SURVIVING defender — same wiring as onAttackedSpawn just above.
          runCustomTriggers(players, sideOf, a.enemyId, defCard, defDef, 'onAttacked', stats, events);
        }
        // Swipe (2026-09-21 REDESIGN, per explicit request: "Swipe doesn't need a integer
        // parameter... Swipe now means: Hit left and right. If there's 3 cards in front of you,
        // hit left, avoid centre, hit right. (This includes the castle) So if theres 1 card in
        // front of the swipe-r and no units on the left or right, it would hit the castle
        // twice." — replaces the 2026-09-19 "closest N total, alternating flanks, never touches
        // the castle" version above (see the retired findSwipeTargets/findClosestLiveCards
        // comment near the top of this file). `effects.swipe` is now a plain boolean — no count.
        // The two "flanking columns" are literally target.col-1 and target.col+1 in the SAME
        // left-to-right column numbering combatColumnsOf/resolveLiveTarget already use (more
        // negative = further left, more positive = further right — see combatColumnsOf's own
        // comment), so this is checking the two enemy slots immediately beside whichever slot
        // the primary attack actually landed on. A live card there gets hit directly, exactly
        // like Sweep's continuation hits (its own Evasion roll, Guardian redirect, and the same
        // per-hit status/poison/bleed/scar/sap/Chained/onAttacked handling); an empty column (no
        // entry, or past the edge of the board) redirects that swing straight to the castle
        // instead — so a target with nothing beside it eats two separate castle hits, one per
        // empty flank, matching the "1 card in front... castle twice" example exactly. Deliberately
        // scoped inside `target.kind==='card'` (same as Sweep and the old Swipe above) — if the
        // primary attack itself resolved straight to the castle (0 facing, or an unlucky 50/50 on
        // an interlocked board), there's no reference column to swipe from, so nothing extra fires.
        // Fork (2026-10-12, user: "Swipe should be renamed to Fork, it does a bi-fork attack"): the rule above, unchanged.
        // `effects.fork`; an old `swipe: true` still means Fork (the new Swipe takes a number).
        if(octoAtk && !blindNow){ const mainCol = target.col, lanesO = prongLanes(liveOwnCols, liveEnemyCols, liveSelf.col); const cols = Object.keys(liveEnemyCols).map(Number).filter(c=> c !== mainCol && liveEnemyCols[c] && liveEnemyCols[c].kind==='card' && liveEnemyCols[c].card && liveEnemyCols[c].card.hp > 0)
          .sort((x, y)=> lanesO.dist(x) - lanesO.dist(y) || x - y).slice(0, 7);
          if(cols.length && recordEvents && events) events.push({type:'statusFx', kind:'octolash', side:mySide, attUid:a.att.uid, attDefId:a.att.defId, targetUid:a.att.uid, targetDefId:a.att.defId, amount:cols.length + 1});
          cols.forEach(c=> forkStrike(c, false, 'octolash')); }
      } else if(a.att._boomerangReturning && a.att._boomerangNoCastle){
        // the throw hit a unit; that unit is gone now, so the way home is empty air (2026-10-12): "Whiff"
        if(recordEvents && events) events.push({type:'boomerangWhiff', side:mySide, defId:a.att.defId, uid:a.att.uid});
      } else {
        // Siege (2026-09-17): bonus flat damage specifically when the attack lands on the
        // castle directly (0 or 1 facing resolving to the HQ) — a reward for punching through,
        // on top of whatever Bulwark the defender has standing in the way.
        const siegeBonus = (attDef.effects && attDef.effects.siege) || 0;
        const bulwarkBlocked = bulwarkReductionFor(players[a.enemyId]);
        const dmg = damageHQ(players[a.enemyId], castleSwingAmt(a.att, atkThisRound) + siegeBonus);
        swingLanded = true;
        aStat.dealt += dmg; aStat.faceDamage += dmg;
        if(recordEvents && events) events.push({type:'hitHQ', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), dmg, crit:critLanded, ambush:ambushForce, siege:siegeBonus>0, bulwark:Math.min(bulwarkBlocked, atkThisRound+siegeBonus), festerBonus, ruptureBonus});
        { const th = players[a.enemyId].castleThorns; if(th > 0 && dmg > 0 && a.att.hp > 0){ const td = damageCardFlat(a.att, th, 'thorns'); aStat.taken = (aStat.taken||0) + td;
          if(recordEvents && events) events.push({type:'statusFx', kind:'castleThorns', side:sideOf(a.enemyId), targetSide:mySide, targetDefId:a.att.defId, targetUid:a.att.uid, amount:td}); } }
        if(attDef.effects && attDef.effects.sap && dmg>0){
          const healedHq = Math.min(a.att.maxHp - a.att.hp, dmg);
          if(healedHq>0){ a.att.hp += healedHq; if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healedHq}); }
        }
      }
      if(sweepN && !blindNow) sweepStrike(sweepCol + 1, 'right');
      // Fork / Trident / Pitchfork prongs (2026-10-15, see prongSpec above): the other nearest units in range. A miss or dodge on
      // the main swing never cancels them (2026-10-12, user: "When the Fork unit misses, it should still continue to hit L and R");
      // Blind and the dark roll once per prong.
      if(prongCols.length){
        prongCols.forEach(c=>{
          const pT = liveEnemyCols[c], pExposed = !!(pT && pT.card && pT.card.exposed > 0); // Exposed (2026-10-15): a sure hit
          const pMiss = !pExposed && ((a.att.blind>0 && !keenSense && rnd() < 0.5) || (sMiss > 0 && (sMiss >= 1 || rnd() < sMiss)));
          if(pMiss){ if(recordEvents && events) events.push({type:'blindMiss', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetKind:'fork', prong:prongSpec.kind}); return; }
          forkStrike(c, false, prongSpec.kind); swingLanded = true;
        });
      }
      if(isBoomerangDef(attDef) && !a.att._boomerangReturning && !blindNow){ // thrown: it flies on even if the thrower falls
        const pl = players[a.attId]; if(!Array.isArray(pl.boomerangs)) pl.boomerangs = [];
        pl.boomerangs.push({uid:a.att.uid, defId:a.att.defId, col:liveSelf.col, dmg:atkThisRound, dmgType, hitCastle:!!(target && target.kind === 'hq'), targetUid: target && target.kind === 'card' && target.card ? target.card.uid : null});
        a.att.boomerangOut = true;
      }
      a.att.inspired = 0; // Inspiring's bonus is spent on this swing
      // Recoil N (2026-10-12, user: "New passive skill: Recoil N: On attack, deal N damage to itself").
      if(attDef.effects && Number(attDef.effects.recoil) > 0 && a.att.hp > 0){
        const rd = damageCardFlat(a.att, Number(attDef.effects.recoil), 'recoil');
        ensureStat(stats, mySide, a.att.defId).taken += rd;
        if(recordEvents && events) events.push({type:'statusFx', kind:'recoil', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:mySide, targetDefId:a.att.defId, targetUid:a.att.uid, amount:rd});
      }
      // Swipe N (new, 2026-10-12, user: "What would Swipe do then?"; proposal): a landed swing swipes N Lumber from the
      // opponent: they lose it and this side gains it (only what they have). For raiders and thieves.
      { const sw = attDef.effects && attDef.effects.swipe; const swN = (sw === true) ? 0 : Number(sw) || 0;
        if(swN > 0 && swingLanded){ const foe = players[a.enemyId], me = players[a.attId]; const took = Math.min(swN, Math.max(0, foe.lumber||0));
          if(took > 0){ foe.lumber -= took; me.lumber = (me.lumber||0) + took;
            if(recordEvents && events) events.push({type:'swipeLumber', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), amount:took}); } } }
      // Reload: having just attacked, this card sits out N extra rounds before it can attack again.
      // _reloadJustSet guards against this SAME round's upkeep (below) immediately ticking the
      // cooldown back down to 0 before it ever had a round to actually apply.
      if(attDef.effects && attDef.effects.reload){ a.att.reloadRemaining = attDef.effects.reload; a.att._reloadJustSet = true; }
      // Frenzy (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Flurry"): if this
      // attacker is still alive after everything above (its swing, any Thorns/self-bleed
      // counter-damage) and hasn't already frenzied this round, it gets one more full attack —
      // immediately, before anything else. Guarded by a one-shot per-round flag so it can't
      // chain into itself.
      let frenziedAgain = false;
      // Twin Strike (2026-10-12, user: "a skill that means double strike without calling it double strike"): attacks twice
      // on its turn, the second swing straight after the first (the same path as Frenzy's bonus swing).
      // Frenzy (2026-10-12, user: "It should be an offensive one of course ... when it has a status applied to it, it gains
      // twin strike and bleed 1"): while it suffers any status (Poison, Bleed, Decay, Corrode, Frozen, Shocked ...) it
      // strikes twice and each hit adds 1 Bleed.
      const frenzyNow = isFrenzied(a.att);
      if(attDef.effects && (frenzyNow || attDef.effects.twinStrike) && a.att.hp>0 && !a.att._frenziedThisRound){
        a.att._frenziedThisRound = true;
        // VFX/SFX coverage audit (2026-09-21): Frenzy's bonus swing used to be a pure engine-
        // internal decision with no event at all — it replayed as an indistinguishable ordinary
        // 'hit', so nothing on screen ever signaled "this card is attacking again because of
        // Frenzy" as opposed to just being a second attacker further down the queue. A dedicated
        // 'frenzy' event gives the front end something to flourish right before that second swing
        // animates.
        if(recordEvents && events) events.push({type:'frenzy', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, twin:!frenzyNow});
        frenziedAgain = true;
      }
      // Live reflow, per-attacker (see reflowAfterKills' comment above): whatever this turn's
      // swing (primary hit, Sweep/Swipe continuations, or Thorns counter-damage) just killed
      // gets cleaned up and collapsed toward the gap right now, before the next attacker in
      // the queue gets a turn — not batched until every attacker this round has gone.
      reflowAfterKills(killCreditKeysAtTurnStart);
      // Frenzy keeps `pending` pointed at this SAME candidate (see this block's own comment,
      // above pickNextAttacker's declaration) rather than pulling a fresh one from the pool —
      // everything else falls through to the normal live pick, which naturally picks up whatever
      // this turn's own kills/reflow/mid-attack spawns just made newly eligible.
      currentAttacker = null;
      // 2026-10-12 (user: "I win with the first 1-2 attacks. During the victory dance, the enemy's card disappears"): the
      // moment a castle falls, combat stops. Later attackers used to keep swinging, so a card the loser had just played
      // could die after the castle fell, unseen (the replay stops at the fall), and vanish when the board re-rendered.
      pending = (p1.hq.hp<=0 || p2.hq.hp<=0) ? null : (frenziedAgain ? a : pickNextAttacker());
    }
    // Banana and Durian (2026-10-14, user: "every turn, at speed -1 (slower than everyone else) ... (They still do their normal
    // action)"): after the whole swing order.
    if(!passOnlyUid && p1.hq.hp > 0 && p2.hq.hp > 0) snackTime(players, sideOf, stats, events, firstAttackerSide);
    endOfRoundUpkeep(players, sideOf, stats, events);
    pushStatusEnds(stRound, players, sideOf, events); // 2026-10-15: whatever ran out this round (upkeep, cleanses, Expose used up)
    if(isGladiator){ syncGladiatorHq(p1); syncGladiatorHq(p2); }
    return p1.hq.hp<=0 || p2.hq.hp<=0;
  }
  /* ---- Test Kit manual controls (2026-10-10, user: "let me also control combat with manual attack, do 1 damage etc
     buttons. Attack button makes the test card attack. If they have an alternate attack type or on-hit effect, it
     happens"). These run the real combat code, never a copy of it. ---- */
  function findBoardCard(players, uid){
    for(const pid of [1,2]){ const pl = players[pid]; if(!pl) continue; const c = allBoardCards(pl).find(x=> x.uid===uid); if(c) return {pl, pid, card:c}; }
    return null;
  }
  // One swing by this card only: its arrow volley, its attack with every on-hit effect, Sweep/Swipe, Frenzy, Thorns
  // back at it, kills and reflow. No upkeep: nothing ticks, no Wait counts down, no round passes.
  function debugAttack(players, sideOf, uid, stats, events){
    const f = findBoardCard(players, uid); if(!f || f.card.hp<=0) return false;
    const w = f.card.wait; f.card.wait = 0;
    resolveCombat(players, sideOf, stats, events, f.pid, {upkeepIds:[], onlyUid:uid});
    if(f.card.hp>0 && w>0) f.card.wait = w;
    return true;
  }
  // N plain damage to a card from no one: it can't be dodged; On Attacked, Bleed and death all follow as normal.
  function debugDamage(players, sideOf, uid, amount, stats, events){
    const f = findBoardCard(players, uid); if(!f || f.card.hp<=0) return 0;
    const c = f.card, dmg = damageCardFlat(c, Math.max(0, amount|0), 'true', null);
    if(recordEvents && events) events.push({type:'hit', side:sideOf(otherId(f.pid)), attDefId:c.defId, attUid:null, targetSide:sideOf(f.pid), targetDefId:c.defId, targetUid:c.uid, dmg, dmgType:'true', ranged:true, source:'Tester'});
    if(c.hp>0){ bleedTick(sideOf, f.pid, c, stats, events, 'defend'); runCustomTriggers(players, sideOf, f.pid, c, CARD_DEFS[c.defId], 'onAttacked', stats, events); }
    removeDeadCards(players, sideOf, {}, stats, events);
    return dmg;
  }
  function debugHeal(players, sideOf, uid, amount, stats, events){
    const f = findBoardCard(players, uid); if(!f) return 0;
    const evStart = events ? events.length : 0;
    const n = applyHeal(f.card, amount, sideOf(f.pid), events);
    if(events) for(let i = evStart; i < events.length; i++) if(events[i].type==='heal') events[i].source = 'Tester';
    if(n > 0) fireHealTriggers(players, sideOf, f.pid, f.card, f.card, n, stats, events);
    return n;
  }
  // Fire one of this card's own trigger hooks by hand (On Round Start, On Turn Start, On Death, On Attacked...).
  function debugFireTrigger(players, sideOf, uid, hook, stats, events){
    const f = findBoardCard(players, uid); if(!f) return false;
    runCustomTriggers(players, sideOf, f.pid, f.card, CARD_DEFS[f.card.defId], hook, stats, events);
    removeDeadCards(players, sideOf, {}, stats, events);
    return true;
  }
  // For the app's live attack display: finds the board instance by uid (the app often renders copies of cards).
  function swarmBonusOf(players, card){ if(!card) return 0; let real = null; for(const pid of [1,2]){ const pl = players && players[pid]; if(!pl) continue; real = [...pl.row.left, ...pl.row.center, ...pl.row.right].find(x=> x.uid===card.uid); if(real) break; }
    if(!real) return 0; const prev = curPlayers; curPlayers = players; try{ return swarmBonus(real); } finally { curPlayers = prev; } }
  return { eggPoolFor, meiosisDefOf, chargeOf, fireOnSacrifice, restlessMoves, startTide: ()=>{ if(tideStart === null) tideStart = turnNo; }, packChainsOf, packPlacementFor, waveHit, bloomStateOf, BLOOM_CONDS, debugIrradiatePoint, irrAbilities, effectsOf, isTide, spawnBeside, isWindy, windSideOf, nightDim, sightMiss, reserveRows: RESERVE_ROWS, legalReserveSlots, fillReserve, advanceReserves, moonPhase, moonFullness, addLumber, addOre, syncPhaseStats, secondPlayerBonus, applySecondPlayerBonus, actionsPerTurn: ()=> ACTIONS, swarmBonusOf, getPhaseLen: ()=> Math.max(1, Number(rules.phaseLen)||3), getPhaseMode: ()=> zeitStart !== null ? 'cycle' : phaseMode, forecast, getCometRounds: ()=> cometRounds, getZeitStart: ()=> zeitStart, prayerOf, prayerReqOf, prayerOfferReady, volcanoChances, isEcclesiaDef, canOfferPrayer, canEquip, equip, debugAttack, debugDamage, debugHeal, debugFireTrigger, roundStart, getField, setField, getPhase, getTide, getCurses, FIELDS, devour, sacrificeSummon, placeCage, cageHpForLevel, canCastFromExile, castFromExile, ritualProgress, derivedDefs, darkPerTurn, damageCard, damageCardFlat, removeDeadCards, allBoardCards, setSuddenDeath, isSuddenDeath, battleMode, legalSlots, placeGladiatorLeader, syncSlots, newPlayer, draw, placeCard, debugSpawnCard, summonLeader, aiTakeTurn, resolveCombat, canPlay, costOfCard, graceCostOfCard, devilryCostOfCard, exileCostOfCard, makeBoardCard, setCastle };
}

function simulateOneMatch(CARD_DEFS, deckCountsA, deckCountsB, opts){
  opts = opts || {};
  const rnd = opts.rnd || Math.random;
  const maxRounds = opts.maxRounds || 300;
  const recordEvents = !!opts.recordEvents;
  const engine = makeSimEngine(CARD_DEFS, rnd, {recordEvents, battleMode: opts.battleMode});
  const sideOf = (playerId)=> playerId===1 ? 'A' : 'B';
  const players = { 1: engine.newPlayer(1, deckCountsA, opts.characterA || undefined), 2: engine.newPlayer(2, deckCountsB, opts.characterB || undefined) }; // castles (optional, 2026-10-12: for measuring castle passives)
  const stats = {};
  const events = recordEvents ? [] : null;
  if(opts.battleMode==='gladiator'){
    // opts.leaders = {1: defId, 2: defId}; defaults to each deck's first card.
    [1,2].forEach(pid=>{
      const counts = pid===1 ? deckCountsA : deckCountsB;
      const defId = (opts.leaders && opts.leaders[pid]) || Object.keys(counts)[0];
      engine.placeGladiatorLeader(players, sideOf, pid, defId, stats, events);
    });
  }
  engine.draw(players[1], 3, 'A', stats, events);
  engine.draw(players[2], 3, 'B', stats, events);
  let round = 1;
  let winner = 0;
  let lastSig = null, stalled = 0, drawn = false;
  while(round <= Math.min(maxRounds, DRAW_ROUND_CAP)){
    engine.setSuddenDeath(round >= SUDDEN_DEATH_ROUND, round >= SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    players[1].playedThisTurn = false;
    players[2].playedThisTurn = false;
    players[1].discardUsedThisTurn = false;
    players[2].discardUsedThisTurn = false;
    if(recordEvents) events.push({type:'roundStart', round});
    if(round > 1) engine.roundStart(players, round, sideOf, stats, events);
    engine.aiTakeTurn(players, sideOf, 1, stats, events);
    engine.aiTakeTurn(players, sideOf, 2, stats, events);
    // Alternate which side wins a same-column tie round to round (see resolveCombat's own
    // comment) so a sim match doesn't structurally favor side 2 every single round the way the
    // old hardcoded default did.
    const over = engine.resolveCombat(players, sideOf, stats, events, round%2===0 ? 1 : 2);
    if(over){
      const p1dead = players[1].hq.hp<=0, p2dead = players[2].hq.hp<=0;
      winner = (p1dead && p2dead) ? 0 : (p1dead ? 2 : 1);
      break;
    }
    const sig = boardSignature(players);
    stalled = (sig===lastSig && noActionsLeft(players)) ? stalled+1 : 0;
    lastSig = sig;
    if(stalled >= STALL_ROUNDS_FOR_DRAW){ drawn = true; winner = 0; break; }
    round += 1;
    engine.draw(players[1], 1, 'A', stats, events);
    engine.draw(players[2], 1, 'B', stats, events);
  }
  if(drawn) return {winner:0, rounds:round, stats, players, events, drawn:true};
  if(round > Math.min(maxRounds, DRAW_ROUND_CAP) && maxRounds >= DRAW_ROUND_CAP) return {winner:0, rounds:round, stats, players, events, drawn:true};
  if(round > maxRounds){
    const hp1 = players[1].hq.hp, hp2 = players[2].hq.hp;
    winner = hp1===hp2 ? 0 : (hp1>hp2 ? 1 : 2);
  }
  return {winner, rounds:round, stats, players, events};
}

if(typeof module !== 'undefined' && module.exports){
  module.exports = { makeSimEngine, simulateOneMatch, mulberry32, TRIGGER_KEYS, ACTION_KEYS, ALWAYS_ON_HOOKS, SUDDEN_DEATH_ROUND, SUDDEN_DEATH_CASTLE_ROUND, DRAW_ROUND_CAP, STALL_ROUNDS_FOR_DRAW, boardSignature, noActionsLeft };
}
