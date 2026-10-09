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
  'onAllyPlayed','onEnemyPlayed','onAllyReady','onEnemyReady','onMove'];
const ACTION_KEYS = ['damage','gainGold','gainGrace','gainDevilry','gainStone','gainLumber','gain','refine','drawCard','spawnCard','buffAttack','debuffAttack','buffHealth','buff','debuff','poison','bleed','exile','exileSelf','expose','reduceWaitOfSpawned','stun','buffAlly','swapPositions','heal','addWait','missile'];

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
  const GAP = Object.freeze({hp:0, uid:null, gap:true});
  let suddenDeath = false;
  // Raid bosses opt out of the castle half (opts.suddenDeathCastles:false): otherwise simply
  // surviving to round 20 would hand any raider the whole boss castle.
  const suddenDeathCastles = opts.suddenDeathCastles !== false;
  function setSuddenDeath(on){ suddenDeath = !!on; }
  // Raid trench hooks (2026-10-03, Raid P2 — see bramblewood-trench.js). All opt-in; a normal match
  // never sets them, so every existing fight resolves exactly as before.
  //  - passUpkeepIds: during a resolveCombat pass, only these player ids get poison/decay/round-start/
  //    end-of-round upkeep (a trench runs one pass per row against the same boss board).
  //  - passAttackerIds: only these player ids' cards attack in this pass.
  //  - pl.onHqHit(amount, attackerCard): if it returns a number, that replaces the castle hit
  //    (trench roll-through to the next row, or a boss castle shielded while its entities stand).
  let passUpkeepIds = null, passAttackerIds = null, currentAttacker = null;
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
  function occupiedSlots(pl){ syncSlots(pl); const set = new Set(); allBoardCards(pl).forEach(c=>{ if(c.hp>0) set.add(c.slot); }); return set; }
  // Legal placement slots in open/gladiator: any empty slot next to one of your live cards, or the
  // centre when you have nothing on the field.
  function legalSlots(pl){
    if(!slotMode) return [];
    const occ = occupiedSlots(pl);
    if(occ.size===0) return [0];
    const out = new Set();
    occ.forEach(sl=>{ [sl-1, sl+1].forEach(n=>{ if(!occ.has(n)) out.add(n); }); });
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
      id, hq:{hp:hqHp, maxHp:hqHp}, acorns:0, grace:0, devilry:0, stone:0, lumber:(chEffects.startGold||0), elementalEnergy:0,
      deck:buildDeckIdsFrom(cardCounts, rnd), hand:[], row:{left:[], center:[], right:[]},
      graveyard:[], exile:[], castle:null, // castle: a boardCard-like fixture, set via setCastle(); not yet wired into targeting/combat (see game-design.md)
      playedThisTurn:false, discardUsedThisTurn:false,
      character: character || null,
      firstUnitAtkBonus: (chEffects.firstUnitAtkBonus||0), firstUnitBonusUsed:false,
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
  function makeBoardCard(defId){
    const def = CARD_DEFS[defId];
    const board = {uid:uidCounter++, defId, hp:def.health, maxHp:def.health, atk:def.attack, baseAtk:def.attack, wait:def.wait, poison:0, decay:0, bleed:0, exposed:0, scar:0, firedOnce:{},
      reloadRemaining:0, _reloadJustSet:false, stunned:false, _stunnedJustSet:false, shellArmor:0, shellSkip:false, shellNext:0, _frenziedThisRound:false,
      critUsed:0, rallyBonus:0,
      // Elemental status effects (2026-09-16), one per non-physical DMG_TYPE — see
      // rollStatusOnHit/gatherAttackers/endOfRoundUpkeep for the full lifecycle of each:
      frozen:0, _frozenJustSet:false,       // cold — flat skip-this-round, ticks down every upkeep
      asleep:0, _asleepJustSet:false,       // poison-flavored ("Sleeping") — flat skip-this-round, breaks early on any damage taken
      paralyzed:0, _paralyzedJustSet:false, // acid — a FRESH 50/50 coin flip gates each round's action while >0
      // Three more status effects (2026-09-17 batch) — see rollStatusOnHit/endOfRoundUpkeep/
      // computeHitDamage/effAtk for the full lifecycle of each:
      blind:0, _blindJustSet:false,         // this card's own attacks auto-miss entirely while >0, ticks down every upkeep
      shocked:0, _shockedJustSet:false,     // every hit THIS card takes deals 50% bonus damage while >0, ticks down every upkeep
      corrode:0, _corrodeJustSet:false,     // stacking (like Poison/Bleed): each stack lowers this card's effective Attack by 1, decays by 1/round
      // Stagger (2026-09-24, task #109, "one status effect per elemental damage type" — the
      // physical slot; cold/heat/acid/poison already had Frozen/Stun/Paralyzed/Asleep from the
      // 2026-09-16/17 batches, see effAtk/rollStatusOnHit/endOfRoundUpkeep): every hit THIS card
      // DEALS lands for 50% less while >0 — the deliberate mirror of Shock (50% more damage
      // TAKEN), ticks down every upkeep the same way.
      staggered:0, _staggeredJustSet:false,
      ambushUsed:false};                    // Ambush (2026-09-17): consumed by this card's first attack after entering play
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
    const resistList = [...((def && def.resist) || []), ...((def && def.effects && def.effects.resist) || [])];
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
    const weaknessList = (def && def.effects && def.effects.weakness) || [];
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
  function isRaging(card){
    const def = CARD_DEFS[card.defId];
    return !!(def.effects && def.effects.rage) && card.maxHp>0 && (card.hp / card.maxHp) < 0.5;
  }
  // Full melee-style damage pipeline: attacker rage bonus -> target resist
  // -> target rage reduction -> target armor (flat, floors at 0, last so
  // Armor is genuinely the last line of defense). Returns {dmg, armorBlocked}.
  function computeHitDamage(attCard, rawAmount, dmgType, targetCard){
    let amt = rawAmount;
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
    if(targetCard.exposed>0){ amt += targetCard.exposed; targetCard.exposed = 0; } // Expose: bonus dmg on the next hit taken, consumed here (before Armor, so Armor still partially mitigates it)
    // Scar (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Mark"): unlike Expose, this
    // NEVER clears on its own -- every future hit this card takes gets the bonus, permanently
    // (until the card dies). Stacks additively each time an attacker with the Scar keyword
    // lands a hit on it (see the application site in resolveCombat).
    if(targetCard.scar>0) amt += targetCard.scar;
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
    if(factor!==1) amt = Math.max(1, Math.floor(amt*factor));
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
    const rend = !!(attDef && attDef.effects && attDef.effects.rend);
    const nominalArmor = ((tdef.effects && tdef.effects.armor) || 0) + (targetCard.shellArmor || 0); // Shell: temporary bonus armor active the round after being hit
    const armor = rend ? 0 : nominalArmor;
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
  function damageCard(card, amount, dmgType, attCard){
    const {dmg, armorBlocked, rendBypass, kingSlayerBonus, elementalConvert, elementalAmount} = computeHitDamage(attCard, amount, dmgType, card);
    card.hp = Math.max(0, card.hp - dmg);
    if(suddenDeath && dmg>0) card.hp = 0; // sudden death: any hit that lands kills
    if(dmg>0 && card.asleep>0) card.asleep = 0; // Asleep (2026-09-16): breaks the instant real damage lands, classic "hit to wake"
    return {dmg, armorBlocked, rendBypass, kingSlayerBonus, elementalConvert, elementalAmount};
  }
  // Simple flat damage with no defense pipeline (used for missiles/onReadyDamage/thorns,
  // matching the pre-existing behavior — only melee combat runs the full pipeline).
  function damageCardFlat(card, amount, dmgType, attDefId){
    if(card.exposed>0){ amount += card.exposed; card.exposed = 0; } // Expose applies to ranged/flat hits too, consumed on first hit taken
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
    const factor = resistFactor(card.defId, dmgType, attDef) * weaknessFactor(card.defId, dmgType, attDef) * defenderDamageFactor(card.defId);
    let dmg = factor!==1 ? Math.max(1, Math.floor(amount*factor)) : amount;
    if(card.shocked>0) dmg = Math.ceil(dmg*1.5); // Shock applies to ranged/flat hits too
    card.hp = Math.max(0, card.hp - dmg);
    if(suddenDeath && dmg>0) card.hp = 0; // sudden death: any hit that lands kills
    if(dmg>0 && card.asleep>0) card.asleep = 0; // Asleep breaks on any flat/ranged damage too
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
    const reduced = Math.max(0, amount - bulwarkReductionFor(pl));
    if(isGladiator && pl.gladiatorLeaderUid!=null){
      const ld = gladiatorLeaderOf(pl);
      if(ld) ld.hp -= (suddenDeath && suddenDeathCastles && reduced>0) ? ld.hp : reduced;
      syncGladiatorHq(pl);
      return reduced;
    }
    // Skirmish Armour (2026-10-08): a blue shield on top of the castle's Health soaks hits first.
    let toHp = reduced;
    if(pl.hq.shield > 0 && toHp > 0){ const soak = Math.min(pl.hq.shield, toHp); pl.hq.shield -= soak; toHp -= soak; }
    pl.hq.hp = Math.max(0, pl.hq.hp - toHp);
    if(suddenDeath && suddenDeathCastles && reduced>0){ pl.hq.hp = 0; pl.hq.shield = 0; } // sudden death: a castle hit ends the game
    return reduced;
  }
  function pickRandomEnemyTarget(enemyPl){
    const cards = [];
    ['left','center','right'].forEach(side=> enemyPl.row[side].forEach(c=>{ if(c.hp>0) cards.push(c); }));
    const pool = [...cards.map(c=>({kind:'card', card:c})), {kind:'hq'}];
    return pool[Math.floor(rnd()*pool.length)];
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
  function resolveGeneralTarget(players, playerId, boardCard, who, sub){
    const pl = players[playerId], enemy = players[otherId(playerId)];
    if(who==='self') return {pl, card:boardCard};
    const isAlly = who==='ally';
    const sidePl = isAlly ? pl : enemy;
    const order = physicalRowOrder(sidePl).filter(c=>c.hp>0);
    const pool = isAlly ? order.filter(c=>c.uid!==boardCard.uid) : order;
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
      const farPool = enemy.row[farSide].filter(c=>c.hp>0);
      const finalPool = farPool.length ? farPool : pool;
      return {pl:sidePl, card: finalPool[Math.floor(rnd()*finalPool.length)]};
    }
    if(sub==='adjacent'){
      if(isAlly){
        const fullOrder = physicalRowOrder(sidePl);
        const idx = fullOrder.findIndex(c=>c.uid===boardCard.uid);
        const cands = [fullOrder[idx-1], fullOrder[idx+1]].filter(c=>c && c.hp>0);
        if(!cands.length) return null;
        return {pl:sidePl, card: cands[Math.floor(rnd()*cands.length)]};
      }
      const opp = opposingCardOf(players, playerId, boardCard);
      return opp ? {pl:enemy, card:opp.card} : null;
    }
    // 'random' (and any unrecognized sub, as a safe default)
    return {pl:sidePl, card: pool[Math.floor(rnd()*pool.length)]};
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
    const gated = c=>{ if(who==='self' || dodgeCheck(c)) apply(c); else dodge(c); };
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
    if(singleTarget && dd.evasive && rnd() < 0.5){ lastMissReason = 'evasive'; return false; }
    if(dd.swift && !ad.swift && rnd() < 0.5){ lastMissReason = 'swift'; return false; }
    if(dd.flying && !ad.flying && rnd() < 0.5){ lastMissReason = 'flying'; return false; }
    // Illusory (raid bosses only): dodges this share of combat attacks, e.g. 0.667 = 2 in 3.
    if(dd.illusory && rnd() < dd.illusory){ lastMissReason = 'illusory'; return false; }
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
    });
  }
  // Effective Attack: base Attack (already includes any permanent buffs, Render debuffs, etc.)
  // plus this round's live Rally aura bonus. Combat should read through this, not card.atk
  // directly, so Rally is always live and never stale, and never goes negative.
  // Corrode (status, 2026-09-17): stacking, like Poison/Bleed, but instead of a damage tick it
  // temporarily saps effective Attack — one point per stack, recomputed live here (so it's
  // never baked into .atk permanently, same convention Rally already uses) and decayed by 1
  // stack per round in endOfRoundUpkeep.
  function effAtk(card){
    const base = Math.max(0, (card.atk||0) + (card.rallyBonus||0) - (card.corrode||0));
    // Stagger (2026-09-24): applied as a final multiplier on top of Corrode, same relationship
    // Shock's 1.5x has to computeHitDamage's own base-damage calc — floor (not round/ceil) so a
    // staggered hit always rounds toward the weaker outcome, never back up to its pre-stagger value.
    return (card.staggered>0) ? Math.floor(base*0.5) : base;
  }
  // Bleed (item #12): unlike Poison (a once-per-round upkeep tick), a Bled unit takes damage
  // equal to its own current stack every time it performs an attack, defends against one, or
  // casts a skill — "every skill, attack, and defend it does." Flat, no resist/armor pipeline,
  // mirroring Poison's own tick (see applyPoisonTicks / damageCardFlat).
  function bleedTick(sideOf, ownerId, card, stats, events, cause){
    if(!card || card.hp<=0 || !(card.bleed>0)) return;
    const dmg = damageCardFlat(card, card.bleed, 'bleed');
    ensureStat(stats, sideOf(ownerId), card.defId).taken += dmg;
    if(recordEvents && events) events.push({type:'bleedTick', side:sideOf(ownerId), defId:card.defId, uid:card.uid, dmg, cause});
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
    const chance = (typeof cfg==='object') ? Number(cfg.chance)||0 : Number(cfg)||0;
    const duration = (typeof cfg==='object') ? Math.max(1, Number(cfg.duration)||1) : 1;
    if(chance<=0 || rnd()>=(chance/100)) return;
    if(kind==='freeze'){ defCard.frozen = Math.max(defCard.frozen||0, duration); defCard._frozenJustSet = true; }
    else if(kind==='sleep'){ defCard.asleep = Math.max(defCard.asleep||0, duration); defCard._asleepJustSet = true; }
    else if(kind==='paralyze'){ defCard.paralyzed = Math.max(defCard.paralyzed||0, duration); defCard._paralyzedJustSet = true; }
    else if(kind==='stunOnHit'){ defCard.stunned = true; defCard._stunnedJustSet = true; }
    else if(kind==='blind'){ defCard.blind = Math.max(defCard.blind||0, duration); defCard._blindJustSet = true; }
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
        pl.exile.push(g);
        ensureStat(stats, sideOfPl, g.defId).exiled++;
        if(recordEvents && events) events.push({type:'exile', side:sideOfPl, defId:g.defId, zone:'graveyard'});
        fireOnExile(players, sideOf, playerId, g.defId, stats, events);
      } else {
        const pool = pl.hand.filter(h=>h.uid!==excludeUid);
        if(!pool.length) break;
        const pick = pool[Math.floor(rnd()*pool.length)];
        const idx = pl.hand.findIndex(h=>h.uid===pick.uid);
        const [h] = pl.hand.splice(idx,1);
        pl.exile.push({defId:h.defId});
        ensureStat(stats, sideOfPl, h.defId).exiled++;
        if(recordEvents && events) events.push({type:'exile', side:sideOfPl, defId:h.defId, zone:'hand'});
        fireOnExile(players, sideOf, playerId, h.defId, stats, events);
      }
    }
  }
  function canPlay(pl, defId, excludeUid){
    const cost = costOfCard(defId), pCost = graceCostOfCard(defId), dCost = devilryCostOfCard(defId), exCost = exileCostOfCard(defId);
    if(pl.playedThisTurn) return false;
    if(cost > pl.lumber) return false; // 2026-09-22: card cost is now paid in Lumber, not Gold
    if(pCost > pl.grace) return false;
    if(dCost > pl.devilry) return false;
    if(!canAffordExile(pl, exCost, excludeUid)) return false;
    return true;
  }

  function placeCard(players, sideOf, playerId, uid, side, stats, events){
    const pl = players[playerId];
    const idx = pl.hand.findIndex(h=>h.uid===uid);
    if(idx===-1) return false;
    const hc = pl.hand[idx];
    if(!canPlay(pl, hc.defId, uid)) return false;
    const targetSlot = slotMode ? resolvePlacementSlot(pl, side) : null;
    if(slotMode && targetSlot===null) return false;
    pl.hand.splice(idx,1);
    pl.lumber -= costOfCard(hc.defId);
    pl.grace -= graceCostOfCard(hc.defId);
    pl.devilry -= devilryCostOfCard(hc.defId);
    payExileCost(players, sideOf, playerId, exileCostOfCard(hc.defId), uid, stats, events);
    pl.playedThisTurn = true;
    const boardCard = makeBoardCard(hc.defId);
    // Character passive: Plains Terrace-style "first unit gets +N attack" — applies once,
    // to whichever card is the very first one this player plays in the match.
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
    return true;
  }

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
    pl.grace -= graceCostOfCard(defId);
    pl.devilry -= devilryCostOfCard(defId);
    payExileCost(players, sideOf, playerId, exileCostOfCard(defId), null, stats, events);
    pl.playedThisTurn = true;
    const boardCard = makeBoardCard(defId);
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
    applyOnSpawnEffects(players, sideOf, playerId, boardCard, stats, events);
    fireSpawnFamilyTriggers(players, sideOf, playerId, boardCard, stats, events, 'played');
    const opp = players[otherId(playerId)];
    ['left','center','right'].forEach(s=> opp.row[s].forEach(c=>{
      if(c.hp>0 && c.chained) maybeBreakChain(players, sideOf, otherId(playerId), c, stats, events, {kind:'enemySpawn'});
    }));
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
        return;
      }
      const c = redirectToGuardian(enemy, target.card); // Guardian: an adjacent protector eats the hit instead, if one's alive
      const guardianRedirect = c.uid !== target.card.uid;
      const dmg = damageCardFlat(c, realAmount, dmgType, attDefId);
      aStat.dealt += dmg;
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
    } else {
      const bulwarkBlocked = bulwarkReductionFor(enemy);
      const dmg = damageHQ(enemy, realAmount);
      aStat.dealt += dmg; aStat.faceDamage += dmg;
      if(recordEvents && events) events.push({type:'hitHQ', side:sideOf(ownerId), attDefId, attUid, targetSide:sideOf(otherId(ownerId)), dmg, ranged:true, bulwark:Math.min(bulwarkBlocked, realAmount)});
    }
  }

  function applyOnSpawnEffects(players, sideOf, playerId, boardCard, stats, events){
    const def = CARD_DEFS[boardCard.defId];
    if(!def.effects) return;
    const pl = players[playerId];
    const mySide = sideOf(playerId);
    if(def.effects.onSpawnGold){
      // 2026-09-22: onSpawnGold now pays Lumber -- see newPlayer()'s comment on the acorns/
      // lumber retirement. Field name in card data (`onSpawnGold`) is unchanged, only the
      // resource it pays out.
      pl.lumber += def.effects.onSpawnGold;
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
    runCustomTriggers(players, sideOf, playerId, boardCard, def, 'onSpawn', stats, events);
  }
  // Earthquake: AOE version of Gash/Missile's "one-shot on-spawn skill" shape — instead of
  // targeting the single opposing card, it loops every live enemy across all three lanes (same
  // per-card fireDamageAction loop the generic "Deal damage" action already uses for its own
  // target:'all' option — see the 'damage' case in runCustomTriggers), skipping anything with
  // effects.flying:true. Reuses fireDamageAction per target rather than inventing a bespoke event
  // type, so each hit gets the same floating damage number / hit VFX / action-log line every
  // other damage source already gets, for free.
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
    ['left','center','right'].forEach(side=> enemy.row[side].slice().forEach(c=>{
      if(c.hp<=0) return;
      const cDef = CARD_DEFS[c.defId];
      if(cDef && cDef.effects && cDef.effects.flying) return; // Earthquake never hits Flying units
      fireDamageAction(players, sideOf, ownerId, attCard.defId, amount, 'physical', {kind:'card', card:c}, stats, events, null, attCard.uid);
    }));
  }
  // Arrow N / Fire Arrow N (2026-10-04, "new skills: Arrow and Fire Arrow — an arrow flies towards
  // the enemy at high speed"): at the start of every round, before melee, each Ready card with
  // Arrow shoots once at the enemy facing it (a random enemy if nothing faces it, the castle if the
  // enemy board is empty) for N physical damage. Fire Arrow is the same shot as Heat damage, so
  // Heat resistance/weakness apply and a kill burns. Stunned/Frozen/Asleep archers hold fire.
  // Both can sit on one card (it shoots twice). Goes through fireDamageAction, so Evasion,
  // Guardian redirects, Expose and King Slayer all work as for any ranged hit.
  function fireArrowVolley(players, sideOf, stats, events){
    let fired = false;
    [1,2].forEach(pid=>{
      if(passAttackerIds && !passAttackerIds.includes(pid)) return;
      const pl = players[pid]; if(!pl) return;
      const enemy = players[otherId(pid)];
      [...pl.row.left, ...pl.row.center, ...pl.row.right].forEach(c=>{
        if(c.hp<=0 || c.wait>0 || c.stunned || c.frozen>0 || c.asleep>0) return;
        const def = CARD_DEFS[c.defId]; const fx = def && def.effects; if(!fx) return;
        const shots = [];
        if(fx.arrow > 0) shots.push({amount: fx.arrow, dmgType: 'physical', fire: false});
        if(fx.fireArrow > 0) shots.push({amount: fx.fireArrow, dmgType: 'heat', fire: true});
        shots.forEach(shot=>{
          const opp = opposingCardOf(players, pid, c);
          const target = (opp && opp.card && opp.card.hp>0) ? {kind:'card', card:opp.card} : pickRandomEnemyTarget(enemy);
          if(recordEvents && events) events.push({type:'arrow', fire: shot.fire, side: sideOf(pid), defId: c.defId, uid: c.uid,
            targetSide: sideOf(otherId(pid)), targetUid: target.kind==='card' ? target.card.uid : null, targetDefId: target.kind==='card' ? target.card.defId : null, amount: shot.amount});
          fired = true;
          fireDamageAction(players, sideOf, pid, c.defId, shot.amount, shot.dmgType, target, stats, events, null, c.uid);
        });
      });
    });
    if(fired) removeDeadCards(players, sideOf, {}, stats, events);
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
    fireDamageAction(players, sideOf, ownerId, attCard.defId, amount, eff.dmgType, target, stats, events, null, attCard.uid);
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
    const pl = players[playerId], enemy = players[otherId(playerId)];
    const mySide = sideOf(playerId);
    def.effects.triggers.filter(t=>t.on===hook).forEach((t, i)=>{
      // Generic "once" flag: this exact trigger fires at most once for this
      // specific board-card INSTANCE (not the card definition, so every copy
      // of a card in play gets its own one-time use).
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
        if(!subjArchetypes.includes(t.filterArchetype)) return;
      }
      // 2026-10-08: announce the trigger itself (the app shows a small rune on the card and a soft
      // chime) before its effect's own events. Presentation only; nothing reads it for rules.
      if(recordEvents && events) events.push({type:'triggerFired', side:mySide, defId:boardCard.defId, uid:boardCard.uid, hook, action:t.do});
      switch(t.do){
        case 'gainGold': pl.lumber += (t.amount||0); ensureStat(stats,mySide,boardCard.defId).lumberGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break; // 2026-09-22: gainGold pays Lumber now
        case 'gainGrace': pl.grace += (t.amount||0); ensureStat(stats,mySide,boardCard.defId).graceGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'grace', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
        case 'gainDevilry': pl.devilry += (t.amount||0); ensureStat(stats,mySide,boardCard.defId).devilryGenerated += (t.amount||0); if(recordEvents&&events) events.push({type:'devilry', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
        // Gain (2026-09-30): unifies gainGrace/gainStone/gainLumber/gainDevilry into one action
        // with the resource picked as a parameter (see ACTION_DEFS in arena_app.js). Every
        // canonical card that used the old 4 keys was migrated to this one directly; the old keys
        // just above are kept as engine-only legacy aliases for any other save data.
        case 'gain': {
          const amt = t.amount||0;
          if(t.resource==='grace'){ pl.grace += amt; ensureStat(stats,mySide,boardCard.defId).graceGenerated += amt; if(recordEvents&&events) events.push({type:'grace', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); }
          else if(t.resource==='stone'){ pl.stone = (pl.stone||0)+amt; if(recordEvents&&events) events.push({type:'stone', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); }
          else if(t.resource==='devilry'){ pl.devilry += amt; ensureStat(stats,mySide,boardCard.defId).devilryGenerated += amt; if(recordEvents&&events) events.push({type:'devilry', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); }
          else { pl.lumber = (pl.lumber||0)+amt; if(recordEvents&&events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:amt}); } // default: lumber
          break;
        }
        // gainStone/gainLumber/refine (2026-09-18): same shape as gainGold/gainGrace/gainDevilry
        // just above, minus the ensureStat(...) call — Stone/Lumber/Elemental Energy aren't
        // tracked in the Simulator's results-table columns yet (those are a fixed column set),
        // so there's nothing meaningful to add them to there today; the resource still lands on
        // the player and floats/pings its HUD pill correctly either way (see arena_app.js).
        case 'gainStone': pl.stone = (pl.stone||0) + (t.amount||0); if(recordEvents&&events) events.push({type:'stone', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
        case 'gainLumber': pl.lumber = (pl.lumber||0) + (t.amount||0); if(recordEvents&&events) events.push({type:'lumber', side:mySide, defId:boardCard.defId, uid:boardCard.uid, amount:t.amount||0}); break;
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
        case 'buffAttack': boardCard.atk += (t.amount||0); break;
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
        case 'buffHealth': boardCard.hp += (t.amount||0); boardCard.maxHp += (t.amount||0); break;
        // heal (2026-09-16): restores CURRENT hp up to the existing max — unlike buffHealth,
        // which permanently raises max HP too. Self-only, same convention as buffAttack/
        // buffHealth defaulting to the caster; fires the new heal trigger trio.
        case 'heal': {
          // Custom/My-Attack/My-Health amount selector (2026-09-30) -- 'health' reads the card's
          // own CURRENT hp (captured before the heal applies, so it isn't inflated by its own
          // result), same live-value convention as 'attack' resolving to boardCard.atk elsewhere.
          const healAmount = (t.amount==='attack') ? boardCard.atk : (t.amount==='health') ? boardCard.hp : (t.amount||0);
          const healed = Math.min(boardCard.maxHp - boardCard.hp, healAmount);
          if(healed>0){ boardCard.hp += healed; fireHealTriggers(players, sideOf, playerId, boardCard, boardCard, healed, stats, events); }
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
          applyTargetedStatus(players, sideOf, playerId, boardCard, who, sub, null, stats, events, mySide, 'stun', c=>{ c.stunned = true; c._stunnedJustSet = true; });
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
          for(let i=0;i<(t.count||1);i++){ const nc = makeBoardCard(t.defId); pl.row[side].push(nc); newUids.push(nc.uid); newCards.push(nc); }
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
        case 'cleanse': {
          const hadAny = boardCard.poison>0 || boardCard.bleed>0 || boardCard.stunned || boardCard.exposed>0 || boardCard.scar>0 || boardCard.frozen>0 || boardCard.asleep>0 || boardCard.paralyzed>0 || boardCard.blind>0 || boardCard.shocked>0 || boardCard.corrode>0 || boardCard.staggered>0;
          boardCard.poison = 0; boardCard.bleed = 0; boardCard.stunned = false; boardCard.exposed = 0; boardCard.scar = 0;
          boardCard.frozen = 0; boardCard.asleep = 0; boardCard.paralyzed = 0; boardCard.blind = 0; boardCard.shocked = 0; boardCard.corrode = 0; boardCard.staggered = 0;
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
      }
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
      if(kind==='played' && src.hp>0 && def && def.effects && (def.effects.esprit || def.effects.espritHp)){
        const ea = def.effects.esprit || 0, eh = def.effects.espritHp || 0;
        src.atk += ea; src.baseAtk += ea;
        if(eh){ src.hp += eh; if(typeof src.maxHp === 'number') src.maxHp += eh; }
        if(recordEvents && events) events.push({type:'statusFx', kind:'esprit', side:sideOf(playerId), attDefId:src.defId, attUid:src.uid, amount:ea, hp:eh});
      }
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
    const ai = players[aiId];
    const affordable = ai.hand.filter(hc => canPlay(ai, hc.defId, hc.uid));
    // Skirmish leaders (2026-10-08): a skirmish can give the CPU optional leaders (reserveLeaders). Each can be
    // summoned once; the CPU brings one out now and then, or whenever it has nothing else it can play.
    if(ai.reserveLeaders && ai.reserveLeaders.length && !ai.playedThisTurn){
      const ready = ai.reserveLeaders.filter(id=> CARD_DEFS[id] && canPlay(ai, id, null));
      if(ready.length && (!affordable.length || rnd() < 0.35)){
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
      const saving = ai.hand.filter(hc=> costOfCard(hc.defId) > ai.lumber && costOfCard(hc.defId) <= ai.lumber + SAVE_REACH); // within two turns' reach: saving longer costs more tempo than the card gives back (tested 2026-10-09)
      if(saving.length){
        const pitchable = ai.hand.filter(hc=> !saving.includes(hc) && costOfCard(hc.defId) === 0);
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
    const playable = ai.hand.filter(hc => canPlay(ai, hc.defId, hc.uid));
    if(playable.length){
      const costly = playable.filter(hc=> costOfCard(hc.defId) > 0);
      const pick = costly.length && rnd() < 0.8 ? costly.reduce((a, b)=> costOfCard(b.defId) > costOfCard(a.defId) ? b : a) : playable[Math.floor(rnd()*playable.length)];
      const side = rnd() < 0.5 ? 'left' : 'right';
      placeCard(players, sideOf, aiId, pick.uid, side, stats, events);
    } else if(!ai.discardUsedThisTurn && ai.hand.length){
      const idx = Math.floor(rnd()*ai.hand.length);
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
    if(!poisoned.length) return;
    for(const {pl,card} of poisoned){
      if(card.hp<=0) continue;
      const dmg = damageCardFlat(card, card.poison, 'poison');
      ensureStat(stats, sideOf(pl.id), card.defId).taken += dmg;
      if(recordEvents && events) events.push({type:'poisonTick', side:sideOf(pl.id), defId:card.defId, uid:card.uid, dmg});
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
          const hadAny = c.poison>0 || c.decay>0 || c.bleed>0 || c.stunned || c.exposed>0 || c.scar>0 || c.frozen>0 || c.asleep>0 || c.paralyzed>0 || c.blind>0 || c.shocked>0 || c.corrode>0 || c.staggered>0;
          c.poison = 0; c.decay = 0; c.bleed = 0; c.stunned = false; c.exposed = 0; c.scar = 0;
          c.frozen = 0; c.asleep = 0; c.paralyzed = 0; c.blind = 0; c.shocked = 0; c.corrode = 0; c.staggered = 0;
          if(hadAny && recordEvents && events) events.push({type:'statusFx', kind:'cleanse', side:sideOf(pl.id), attDefId:c.defId, attUid:c.uid, targetSide:sideOf(pl.id), targetDefId:c.defId, targetUid:c.uid});
        }
        // Regeneration N (2026-09-16): heals N HP at the start of every round this card is on
        // the board, capped at its own max HP — feeds the new On Heal/On Healed/On Ally Healed
        // triggers (see fireHealTriggers) exactly like any other heal source.
        if(c.hp>0 && def.effects && def.effects.regen){
          const healed = Math.min(c.maxHp - c.hp, def.effects.regen);
          if(healed>0){ c.hp += healed; fireHealTriggers(players, sideOf, pl.id, c, c, healed, stats, events); }
        }
        // Bloom (2026-09-17): Regeneration's support-flavored cousin — instead of healing
        // itself, it heals a random OTHER damaged ally on the same board, every round it's on
        // the field. No-op if every other ally is already at full HP (or there are none).
        if(c.hp>0 && def.effects && def.effects.bloom){
          const others = [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(o=> o.hp>0 && o.uid!==c.uid && o.hp<o.maxHp);
          if(others.length){
            const bloomTarget = others[Math.floor(rnd()*others.length)];
            const bloomHealed = Math.min(bloomTarget.maxHp - bloomTarget.hp, def.effects.bloom);
            if(bloomHealed>0){ bloomTarget.hp += bloomHealed; fireHealTriggers(players, sideOf, pl.id, c, bloomTarget, bloomHealed, stats, events); }
          }
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
  function endOfRoundUpkeep(players, sideOf, stats, events){
    const p1=players[1], p2=players[2];
    // Shell: deactivate whatever was active THIS round (already applied above in resolveCombat/
    // gatherAttackers), then promote any newly-queued shell (from getting hit this round) so it's
    // active starting NEXT round.
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      if(c.shellSkip || c.shellArmor){ c.shellSkip = false; c.shellArmor = 0; }
      if(c.shellNext){ c.shellArmor = c.shellNext; c.shellSkip = true; c.shellNext = 0; }
    })));
    // Crit (2026-09-14): a capped "once per round" proc — reset the round's usage counter
    // here so next round's attacks get a fresh proc attempt. (Evade's own counter was
    // removed 2026-09-29 when Evade/Evasion merged into the stateless Evasive keyword.)
    [p1,p2].filter(inUpkeep).forEach(pl=> ['left','center','right'].forEach(side=> pl.row[side].forEach(c=>{
      c.critUsed = 0;
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
      if(c.frozen>0){ if(c._frozenJustSet) c._frozenJustSet=false; else c.frozen -= 1; }
      if(c.asleep>0){ if(c._asleepJustSet) c._asleepJustSet=false; else c.asleep -= 1; }
      if(c.paralyzed>0){ if(c._paralyzedJustSet) c._paralyzedJustSet=false; else c.paralyzed -= 1; }
      // Blind/Shock/Corrode (2026-09-17 batch) — same "_justSet" survive-one-round-before-
      // decaying convention as Frozen/Asleep/Paralyzed above.
      if(c.blind>0){ if(c._blindJustSet) c._blindJustSet=false; else c.blind -= 1; }
      if(c.shocked>0){ if(c._shockedJustSet) c._shockedJustSet=false; else c.shocked -= 1; }
      if(c.corrode>0){ if(c._corrodeJustSet) c._corrodeJustSet=false; else c.corrode -= 1; }
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
      if(c.stunned){ if(c._stunnedJustSet) c._stunnedJustSet = false; else c.stunned = false; return; } // Stun: skip this round's wait decrement entirely; clear starting the round AFTER it was set
      if(c.frozen>0 || c.asleep>0) return; // Frozen/Asleep: also skip the wait decrement while active, same as Stun
      // Chronos wait-countdown (2026-09-17, per explicit request): every ordinary decrement
      // that DOESN'T reach 0 pushes its own 'waitTick' event (used purely for the UI's
      // per-round tick pulse + sound on the ring badge) — reaching exactly 0 still only
      // pushes the pre-existing 'ready' event below (readyNow), now also the UI's cue for the
      // special magnify-and-fade final flourish, so the two are never both fired the same round.
      if(c.wait>0){
        c.wait -= 1;
        if(c.wait===0) readyNow.push({pl,card:c});
        else if(recordEvents && events) events.push({type:'waitTick', side:sideOf(pl.id), defId:c.defId, uid:c.uid, waitRemaining:c.wait});
      }
    })));
    for(const {pl,card} of readyNow){
      const def = CARD_DEFS[card.defId];
      if(recordEvents && events) events.push({type:'ready', side:sideOf(pl.id), defId:card.defId, uid:card.uid});
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
      runCustomTriggers(players, sideOf, pl.id, card, def, 'onReady', stats, events);
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
          pl.lumber += def.effects.onReadyGold;
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
    removeDeadCards(players, sideOf, killCredit, stats, events);
  }
  function removeDeadCards(players, sideOf, killCredit, stats, events){
    const p1=players[1], p2=players[2];
    const deadEntries = [];
    [p1,p2].forEach(pl=>{
      ['left','center','right'].forEach(side=>{
        pl.row[side].forEach(c=>{ if(c.hp<=0) deadEntries.push({pl, side, card:c}); });
      });
    });
    if(!deadEntries.length) return;
    const spawns = [];
    deadEntries.forEach(({pl, side, card})=>{
      const mySide = sideOf(pl.id);
      const cdef = CARD_DEFS[card.defId];
      // Revive (once) — a "named skill" preset (2026-09-14): the FIRST time this card would
      // die, it comes back instead — restored to 1 HP, every status cleared, no death/kill/
      // bounty/onDeathSpawn/onDeath-trigger bookkeeping at all, because it didn't actually
      // die. It's tagged with a Removal Counter (card.hasRemovalCounter): the NEXT time it
      // would die after that, it skips the graveyard entirely and goes straight to the
      // Removal Zone instead (see the graveyard-vs-exile decision below) — a real, final death.
      if(cdef.effects && cdef.effects.revive && !card.revivedOnce){
        card.revivedOnce = true;
        card.hasRemovalCounter = true;
        card.hp = 1;
        card.poison = 0; card.decay = 0; card.exposed = 0; card.scar = 0; card.stunned = false;
        card.frozen = 0; card.asleep = 0; card.paralyzed = 0; card.bleed = 0;
        card.shellArmor = 0; card.shellSkip = false; card.shellNext = 0;
        if(recordEvents && events) events.push({type:'revive', side:mySide, defId:card.defId, uid:card.uid});
        return;
      }
      ensureStat(stats, mySide, card.defId).deaths += 1;
      const credit = killCredit[card.uid];
      const bounty = (cdef.effects && cdef.effects.bounty) || 0;
      if(recordEvents && events) events.push({type:'death', side:mySide, defId:card.defId, uid:card.uid});
      if(credit){
        const sidesCredited = new Set();
        credit.forEach(key=>{
          const parts = key.split('|');
          ensureStat(stats, parts[0], parts[1]).kills += 1;
          sidesCredited.add(parts[0]);
        });
        if(bounty>0){
          sidesCredited.forEach(side2=>{
            const pid = side2==='A'?1:2;
            players[pid].lumber += bounty; // 2026-09-22: bounty now pays Lumber, not Gold
            // uid (2026-09-16, item #3): the dying card's own uid, purely so the UI can drop
            // the gold-icon "item drop" VFX from wherever that card's tile still is on screen
            // (it hasn't been wiped from the DOM yet — only the round's full event log has
            // finished, not its animated replay) rather than needing to guess a position.
            if(recordEvents && events) events.push({type:'bounty', side:side2, amount:bounty, fromDefId:card.defId, uid:card.uid});
          });
        }
      }
      if(cdef.effects && cdef.effects.onDeathSpawn){
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
        pl.exile.push({defId:card.defId});
        ensureStat(stats, mySide, card.defId).exiled++;
        if(recordEvents && events) events.push({type:'exile', side:mySide, defId:card.defId, zone:'board'});
      } else {
        pl.graveyard.push({defId:card.defId});
      }
      runCustomTriggers(players, sideOf, pl.id, card, cdef, 'onDeath', stats, events);
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
      });
    });
    [p1,p2].forEach(pl=>{
      ['left','center','right'].forEach(side=>{ pl.row[side] = pl.row[side].filter(c=>c.hp>0); });
    });
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
      for(let i=0;i<s.count;i++){
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
  function resolveCombat(players, sideOf, stats, events, firstAttackerSide, pass){
    passUpkeepIds = (pass && pass.upkeepIds) || null;
    passAttackerIds = (pass && pass.attackerIds) || null;
    try { return resolveCombatInner(players, sideOf, stats, events, firstAttackerSide); }
    finally { passUpkeepIds = null; passAttackerIds = null; currentAttacker = null; }
  }
  function resolveCombatInner(players, sideOf, stats, events, firstAttackerSide){
    // Ordering (2026-09-16, per explicit request: "Poison should happen first") — Poison now
    // ticks BEFORE any round-start trigger (Renewal cleanse, Regeneration, On Round Start, Per
    // Turn). Previously Renewal ran first and could cleanse a stack away before it ever dealt
    // its damage that round; now a Poisoned card always eats this round's tick first, and only
    // THEN does Renewal cure it going forward (see fireRoundStartTriggers' comment). This also
    // means a card that dies to its own poison this round never gets to act on its Per Turn/On
    // Round Start hooks below — removeDeadCards runs inside applyPoisonTicks itself.
    applyPoisonTicks(players, sideOf, stats, events);
    applyDecayTicks(players, sideOf, stats, events);
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
    const poolMeta = new Map();    // uid -> {att, attId, enemyId} — currently eligible, not yet acted
    function discoverEligibleAttackers(){
      [[p1,1,2],[p2,2,1]].forEach(([pl,ownId,enemyId])=>{
        if(passAttackerIds && !passAttackerIds.includes(ownId)) return;
        ['left','center','right'].forEach(sideKey=>{
          pl.row[sideKey].forEach(card=>{
            const uid = card.uid;
            if(handledUids.has(uid) || poolMeta.has(uid)) return;
            // Not ready yet (hp<=0: already dead; wait!==0: still counting down — a wait value
            // never ticks down mid-round on its own, only an explicit effect like
            // reduceWaitOfSpawned can drop it to 0 early, which is exactly why this ISN'T added
            // to handledUids here: leaving it unconsidered means it's automatically picked up by
            // a LATER call to this same function, the instant such an effect makes it eligible).
            if(card.hp<=0 || card.wait!==0) return;
            if(card.reloadRemaining>0){ skipTurn('reload', card, ownId); handledUids.add(uid); return; }
            if(card.stunned){ skipTurn('stunned', card, ownId); handledUids.add(uid); return; }
            if(card.frozen>0){ skipTurn('frozen', card, ownId); handledUids.add(uid); return; }
            if(card.asleep>0){ skipTurn('asleep', card, ownId); handledUids.add(uid); return; }
            if(card.paralyzed>0 && rnd()<0.5){ skipTurn('paralyzed', card, ownId); handledUids.add(uid); return; } // one fresh coin flip, right here, the only time this card is ever considered this round
            if(card.chained){ skipTurn('chained', card, ownId); handledUids.add(uid); return; }
            if(card.shellSkip){ skipTurn('shell', card, ownId); handledUids.add(uid); return; }
            if(effAtk(card)<=0){ skipTurn('zeroAttack', card, ownId); handledUids.add(uid); return; }
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
      const target = (attDef.effects && attDef.effects.stealth) ? {kind:'hq'} : resolveLiveTarget(liveOwnCols, liveEnemyCols, liveSelf.col);
      if(!target){ pending = pickNextAttacker(); continue; }
      const dmgType = attDef.dmgType || 'physical';
      const mySide = sideOf(a.attId);
      const aStat = ensureStat(stats, mySide, a.att.defId);
      // Grit (2026-09-16, Bramblewood's take on Tyrant Unleashed's "Valor"/"Bravery"): a
      // built-in comeback bonus. If this card is currently weaker (lower effective Attack)
      // than the target it's about to swing at, it permanently toughens up. Compared AFTER
      // atkThisRound is captured (same convention as the onAttack trigger above), so the
      // bonus applies starting next round, not retroactively to this swing.
      if(attDef.effects && attDef.effects.grit && target.kind==='card' && effAtk(target.card) > effAtk(a.att)){
        const gritAmt = attDef.effects.grit;
        a.att.atk += gritAmt; a.att.baseAtk += gritAmt;
        if(recordEvents && events) events.push({type:'statusFx', kind:'grit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:gritAmt});
      }
      // Blind (status, 2026-09-17): while active, THIS attacker's own attack auto-misses
      // entirely — no damage to a card OR the castle — but it still counts as having
      // attacked (onAttack already fired, bleed already ticked above). Checked before Evade/
      // Ambush since a blind swing has nothing to do with whether the DEFENDER would dodge.
      if(a.att.blind>0){
        if(recordEvents && events) events.push({type:'blindMiss', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetKind:target.kind});
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
        const {dmg, armorBlocked, rendBypass, kingSlayerBonus, elementalConvert, elementalAmount} = damageCard(defCard, atkThisRound, dmgType, a.att);
        aStat.dealt += dmg;
        ensureStat(stats, sideOf(a.enemyId), defCard.defId).taken += dmg;
        if(recordEvents && events) events.push({type:'hit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, dmg, dmgType, armorBlocked, guardianRedirect, crit:critLanded, ambush:ambushForce, rend:rendBypass, festerBonus, ruptureBonus, elementalConvert, elementalAmount});
        // King Slayer (2026-09-22): a dedicated event, separate from the plain 'hit' above, so
        // the front end can flourish this distinctly instead of the bonus silently blending into
        // the ordinary damage number — see computeHitDamage's kingSlayerBonus for the actual math.
        if(kingSlayerBonus>0 && recordEvents && events) events.push({type:'kingSlayer', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:kingSlayerBonus});
        // Pierce (2026-09-17, per explicit request: "pierce... should also hit the castle"):
        // a flat, unconditional chunk of extra damage punches straight through to the enemy
        // castle on every landed melee hit, on top of whatever this hit did to defCard —
        // independent of whether defCard survives.
        if(attDef.effects && attDef.effects.pierce){
          const pierceDmg = damageHQ(players[a.enemyId], attDef.effects.pierce);
          if(pierceDmg>0 && recordEvents && events) events.push({type:'pierceHQ', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), dmg:pierceDmg});
        }
        // Chained (Devilry, 2026-09-17, per explicit request: "the simplest of which is getting
        // hit by any damage >1"): checked on every landed melee hit, same "breaks on ANY
        // damage taken" convention Sleep already uses, just gated to a configurable threshold.
        maybeBreakChain(players, sideOf, a.enemyId, defCard, stats, events, {kind:'damage', amount:dmg});
        // Thorns: defender reflects flat damage back to the attacker on every normal attack it receives.
        const defDefEarly = CARD_DEFS[defCard.defId];
        if(defDefEarly.effects && defDefEarly.effects.thorns){
          const thornsDmg = defDefEarly.effects.thorns;
          a.att.hp = Math.max(0, a.att.hp - thornsDmg);
          ensureStat(stats, sideOf(a.enemyId), defCard.defId).thornsDealt += thornsDmg;
          ensureStat(stats, mySide, a.att.defId).taken += thornsDmg;
          if(recordEvents && events) events.push({type:'thorns', side:sideOf(a.enemyId), fromDefId:defCard.defId, fromUid:defCard.uid, targetSide:mySide, targetDefId:a.att.defId, targetUid:a.att.uid, dmg:thornsDmg});
          if(a.att.hp<=0){
            if(!killCredit[a.att.uid]) killCredit[a.att.uid] = new Set();
            killCredit[a.att.uid].add(statKey(sideOf(a.enemyId), defCard.defId));
          }
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
        if(attDef.effects && attDef.effects.poison && defCard.hp>0){
          defCard.poison = (defCard.poison||0) + attDef.effects.poison;
          aStat.poisonApplied += attDef.effects.poison;
        }
        // Decay (passive, 2026-09-29): mirrors Poison's on-hit stacking exactly, but as its own
        // separate stack (card.decay, ticked by applyDecayTicks) — see that function's comment
        // for how it differs from Poison at tick time (Decay also saps Attack, not just HP).
        if(attDef.effects && attDef.effects.decay && defCard.hp>0){
          defCard.decay = (defCard.decay||0) + attDef.effects.decay;
        }
        // Bleed (passive): this card's attack also stacks Bleed on the target, mirroring Poison.
        if(attDef.effects && attDef.effects.bleed && defCard.hp>0){
          defCard.bleed = (defCard.bleed||0) + attDef.effects.bleed;
        }
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
        // Expose: marks the target for bonus damage on the NEXT hit it takes (any source), then clears itself.
        if(attDef.effects && attDef.effects.expose && defCard.hp>0){
          defCard.exposed = (defCard.exposed||0) + attDef.effects.expose;
        }
        // Scar (permanent, stacking Expose — see computeHitDamage): applied the same way as
        // Expose/Poison/Bleed, but on a SURVIVING target only makes sense the same as those.
        if(attDef.effects && attDef.effects.scar && defCard.hp>0){
          defCard.scar = (defCard.scar||0) + attDef.effects.scar;
          if(recordEvents && events) events.push({type:'statusFx', kind:'scar', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:defCard.defId, targetUid:defCard.uid, amount:attDef.effects.scar});
        }
        // Elemental status effects (Frozen/Asleep/Paralyzed/Stun-on-hit) — see rollStatusOnHit.
        if(attDef.effects){
          rollStatusOnHit('freeze', attDef.effects.freeze, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('sleep', attDef.effects.sleep, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('paralyze', attDef.effects.paralyze, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('stunOnHit', attDef.effects.stunOnHit, defCard, mySide, a.att, sideOf, a.enemyId, events);
          rollStatusOnHit('blind', attDef.effects.blind, defCard, mySide, a.att, sideOf, a.enemyId, events);
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
        if(defDefEarly.effects && defDefEarly.effects.shell && defCard.hp>0){
          defCard.shellNext = defDefEarly.effects.shell;
        }
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
        } else {
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
            }
          }
          // Bleed: defending against a landed melee hit ticks the defender's own bleed stacks.
          bleedTick(sideOf, a.enemyId, defCard, stats, events, 'defend');
          // onAttacked custom triggers (e.g. Berserker = onAttacked->buffAttack 1) fire here,
          // for the SURVIVING defender — same wiring as onAttackedSpawn just above.
          runCustomTriggers(players, sideOf, a.enemyId, defCard, defDef, 'onAttacked', stats, events);
        }
        // Sweep (legacy: continues down the same flank past the primary target). These EXTRA
        // hits are skill-like (a bonus swing, not the lane's basic connection), so — unlike the
        // primary hit above — each one gets its own Evasion roll on the original (pre-redirect) target.
        if(attDef.effects && attDef.effects.sweep){
          let lastCol = target.col;
          for(let s=0; s<attDef.effects.sweep; s++){
            const extraRaw = findNextLiveCardBeyond(liveEnemyCols, lastCol, liveSelf.dir);
            if(!extraRaw) break;
            lastCol = extraRaw.col; // continuation always walks from the ORIGINAL column, not the guardian's — advance even if evaded
            if(!combatHitLands(a.att, extraRaw.card, false)){ // Sweep extra: multi-target, so no Evade roll — Swift/Flying still apply
              if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:extraRaw.card.defId, targetUid:extraRaw.card.uid, sweep:true});
              continue;
            }
            const extraCard = redirectToGuardian(players[a.enemyId], extraRaw.card);
            const extraGuardianRedirect = extraCard.uid !== extraRaw.card.uid;
            const r2 = damageCard(extraCard, atkThisRound, dmgType, a.att);
            aStat.dealt += r2.dmg;
            ensureStat(stats, sideOf(a.enemyId), extraCard.defId).taken += r2.dmg;
            if(recordEvents && events) events.push({type:'hit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:extraCard.defId, targetUid:extraCard.uid, dmg:r2.dmg, dmgType, armorBlocked:r2.armorBlocked, sweep:true, guardianRedirect:extraGuardianRedirect, crit:critLanded, rend:r2.rendBypass, festerBonus, ruptureBonus, elementalConvert:r2.elementalConvert, elementalAmount:r2.elementalAmount});
            if(r2.kingSlayerBonus>0 && recordEvents && events) events.push({type:'kingSlayer', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:extraCard.defId, targetUid:extraCard.uid, amount:r2.kingSlayerBonus});
            maybeBreakChain(players, sideOf, a.enemyId, extraCard, stats, events, {kind:'damage', amount:r2.dmg});
            if(!killCredit[extraCard.uid]) killCredit[extraCard.uid] = new Set();
            killCredit[extraCard.uid].add(statKey(mySide, a.att.defId));
            if(attDef.effects.poison && extraCard.hp>0){ extraCard.poison = (extraCard.poison||0) + attDef.effects.poison; aStat.poisonApplied += attDef.effects.poison; }
            if(attDef.effects.decay && extraCard.hp>0){ extraCard.decay = (extraCard.decay||0) + attDef.effects.decay; }
            if(attDef.effects.bleed && extraCard.hp>0){ extraCard.bleed = (extraCard.bleed||0) + attDef.effects.bleed; }
            if(attDef.effects.scar && extraCard.hp>0){ extraCard.scar = (extraCard.scar||0) + attDef.effects.scar; if(recordEvents && events) events.push({type:'statusFx', kind:'scar', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:extraCard.defId, targetUid:extraCard.uid, amount:attDef.effects.scar}); }
            rollStatusOnHit('freeze', attDef.effects.freeze, extraCard, mySide, a.att, sideOf, a.enemyId, events);
            rollStatusOnHit('sleep', attDef.effects.sleep, extraCard, mySide, a.att, sideOf, a.enemyId, events);
            rollStatusOnHit('paralyze', attDef.effects.paralyze, extraCard, mySide, a.att, sideOf, a.enemyId, events);
            rollStatusOnHit('stunOnHit', attDef.effects.stunOnHit, extraCard, mySide, a.att, sideOf, a.enemyId, events);
            if(attDef.effects.sap && r2.dmg>0){ const healed2 = Math.min(a.att.maxHp - a.att.hp, r2.dmg); if(healed2>0){ a.att.hp += healed2; if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healed2}); } }
            if(extraCard.hp>0){
              bleedTick(sideOf, a.enemyId, extraCard, stats, events, 'defend');
              runCustomTriggers(players, sideOf, a.enemyId, extraCard, CARD_DEFS[extraCard.defId], 'onAttacked', stats, events);
            }
          }
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
        if(attDef.effects && attDef.effects.swipe){
          [target.col - 1, target.col + 1].forEach(flankCol=>{
            const flankEntry = liveEnemyCols[flankCol];
            if(flankEntry && flankEntry.kind==='card' && flankEntry.card.hp>0){
              const c2raw = flankEntry.card;
              if(!combatHitLands(a.att, c2raw, false)){ // Swipe flank: multi-target, so no Evade roll — Swift/Flying still apply
                if(recordEvents && events) events.push({type:'evaded', reason:lastMissReason, side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2raw.defId, targetUid:c2raw.uid, swipe:true});
                return;
              }
              const c2 = redirectToGuardian(players[a.enemyId], c2raw);
              const c2GuardianRedirect = c2.uid !== c2raw.uid;
              const r3 = damageCard(c2, atkThisRound, dmgType, a.att);
              aStat.dealt += r3.dmg;
              ensureStat(stats, sideOf(a.enemyId), c2.defId).taken += r3.dmg;
              if(recordEvents && events) events.push({type:'hit', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2.defId, targetUid:c2.uid, dmg:r3.dmg, dmgType, armorBlocked:r3.armorBlocked, swipe:true, guardianRedirect:c2GuardianRedirect, crit:critLanded, rend:r3.rendBypass, festerBonus, ruptureBonus, elementalConvert:r3.elementalConvert, elementalAmount:r3.elementalAmount});
              if(r3.kingSlayerBonus>0 && recordEvents && events) events.push({type:'kingSlayer', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2.defId, targetUid:c2.uid, amount:r3.kingSlayerBonus});
              maybeBreakChain(players, sideOf, a.enemyId, c2, stats, events, {kind:'damage', amount:r3.dmg});
              if(attDef.effects.poison && c2.hp>0){ c2.poison = (c2.poison||0) + attDef.effects.poison; aStat.poisonApplied += attDef.effects.poison; }
              if(attDef.effects.decay && c2.hp>0){ c2.decay = (c2.decay||0) + attDef.effects.decay; }
              if(attDef.effects.bleed && c2.hp>0){ c2.bleed = (c2.bleed||0) + attDef.effects.bleed; }
              if(attDef.effects.scar && c2.hp>0){ c2.scar = (c2.scar||0) + attDef.effects.scar; if(recordEvents && events) events.push({type:'statusFx', kind:'scar', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), targetDefId:c2.defId, targetUid:c2.uid, amount:attDef.effects.scar}); }
              rollStatusOnHit('freeze', attDef.effects.freeze, c2, mySide, a.att, sideOf, a.enemyId, events);
              rollStatusOnHit('sleep', attDef.effects.sleep, c2, mySide, a.att, sideOf, a.enemyId, events);
              rollStatusOnHit('paralyze', attDef.effects.paralyze, c2, mySide, a.att, sideOf, a.enemyId, events);
              rollStatusOnHit('stunOnHit', attDef.effects.stunOnHit, c2, mySide, a.att, sideOf, a.enemyId, events);
              if(attDef.effects.sap && r3.dmg>0){ const healed3 = Math.min(a.att.maxHp - a.att.hp, r3.dmg); if(healed3>0){ a.att.hp += healed3; if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healed3}); } }
              if(c2.hp<=0){ if(!killCredit[c2.uid]) killCredit[c2.uid] = new Set(); killCredit[c2.uid].add(statKey(mySide, a.att.defId)); }
              else {
                bleedTick(sideOf, a.enemyId, c2, stats, events, 'defend');
                runCustomTriggers(players, sideOf, a.enemyId, c2, CARD_DEFS[c2.defId], 'onAttacked', stats, events);
              }
            } else {
              // Empty (or off-board) flank column: redirect this swipe swing straight to the
              // castle, same damageHQ path (bulwark reduction included) the primary castle hit
              // below uses — no Siege bonus here, Siege is specifically about the PRIMARY attack
              // landing on the castle, not a swipe redirect.
              const flankDmg = damageHQ(players[a.enemyId], atkThisRound);
              aStat.dealt += flankDmg; aStat.faceDamage += flankDmg;
              if(recordEvents && events) events.push({type:'hitHQ', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), dmg:flankDmg, swipe:true, festerBonus, ruptureBonus});
              if(attDef.effects.sap && flankDmg>0){
                const healedFlank = Math.min(a.att.maxHp - a.att.hp, flankDmg);
                if(healedFlank>0){ a.att.hp += healedFlank; if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healedFlank}); }
              }
            }
          });
        }
      } else {
        // Siege (2026-09-17): bonus flat damage specifically when the attack lands on the
        // castle directly (0 or 1 facing resolving to the HQ) — a reward for punching through,
        // on top of whatever Bulwark the defender has standing in the way.
        const siegeBonus = (attDef.effects && attDef.effects.siege) || 0;
        const bulwarkBlocked = bulwarkReductionFor(players[a.enemyId]);
        const dmg = damageHQ(players[a.enemyId], atkThisRound + siegeBonus);
        aStat.dealt += dmg; aStat.faceDamage += dmg;
        if(recordEvents && events) events.push({type:'hitHQ', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, targetSide:sideOf(a.enemyId), dmg, crit:critLanded, ambush:ambushForce, siege:siegeBonus>0, bulwark:Math.min(bulwarkBlocked, atkThisRound+siegeBonus), festerBonus, ruptureBonus});
        if(attDef.effects && attDef.effects.sap && dmg>0){
          const healedHq = Math.min(a.att.maxHp - a.att.hp, dmg);
          if(healedHq>0){ a.att.hp += healedHq; if(recordEvents && events) events.push({type:'sap', side:mySide, attDefId:a.att.defId, attUid:a.att.uid, amount:healedHq}); }
        }
      }
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
      if(attDef.effects && attDef.effects.frenzy && a.att.hp>0 && !a.att._frenziedThisRound){
        a.att._frenziedThisRound = true;
        // VFX/SFX coverage audit (2026-09-21): Frenzy's bonus swing used to be a pure engine-
        // internal decision with no event at all — it replayed as an indistinguishable ordinary
        // 'hit', so nothing on screen ever signaled "this card is attacking again because of
        // Frenzy" as opposed to just being a second attacker further down the queue. A dedicated
        // 'frenzy' event gives the front end something to flourish right before that second swing
        // animates.
        if(recordEvents && events) events.push({type:'frenzy', side:mySide, attDefId:a.att.defId, attUid:a.att.uid});
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
      pending = frenziedAgain ? a : pickNextAttacker();
    }
    endOfRoundUpkeep(players, sideOf, stats, events);
    if(isGladiator){ syncGladiatorHq(p1); syncGladiatorHq(p2); }
    return p1.hq.hp<=0 || p2.hq.hp<=0;
  }
  return { damageCard, damageCardFlat, removeDeadCards, allBoardCards, setSuddenDeath, isSuddenDeath, battleMode, legalSlots, placeGladiatorLeader, syncSlots, newPlayer, draw, placeCard, debugSpawnCard, summonLeader, aiTakeTurn, resolveCombat, canPlay, costOfCard, graceCostOfCard, devilryCostOfCard, exileCostOfCard, makeBoardCard, setCastle };
}

function simulateOneMatch(CARD_DEFS, deckCountsA, deckCountsB, opts){
  opts = opts || {};
  const rnd = opts.rnd || Math.random;
  const maxRounds = opts.maxRounds || 300;
  const recordEvents = !!opts.recordEvents;
  const engine = makeSimEngine(CARD_DEFS, rnd, {recordEvents, battleMode: opts.battleMode});
  const sideOf = (playerId)=> playerId===1 ? 'A' : 'B';
  const players = { 1: engine.newPlayer(1, deckCountsA), 2: engine.newPlayer(2, deckCountsB) };
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
    engine.setSuddenDeath(round >= SUDDEN_DEATH_ROUND);
    players[1].playedThisTurn = false;
    players[2].playedThisTurn = false;
    players[1].discardUsedThisTurn = false;
    players[2].discardUsedThisTurn = false;
    if(recordEvents) events.push({type:'roundStart', round});
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
  module.exports = { makeSimEngine, simulateOneMatch, mulberry32, TRIGGER_KEYS, ACTION_KEYS, SUDDEN_DEATH_ROUND, DRAW_ROUND_CAP, STALL_ROUNDS_FOR_DRAW, boardSignature, noActionsLeft };
}
