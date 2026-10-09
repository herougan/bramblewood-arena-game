// ============================================================================
// Bramblewood ghost decks — Async Arena and offline Raid (2026-10-03).
// DOM-free: inlined into the game page (global `BramblewoodGhosts`) and require()'d by the Node
// test suite (tests/async-raid.js), so the game and its tests share one implementation.
//
// ASYNC ARENA (offline). A run is up to ASYNC.MAX_WINS wins, ending early at ASYNC.MAX_LOSSES
// losses. Your "win stage" is how many wins this run has. At each stage you fight a GHOST: a
// snapshot of a deck that also reached that stage (it's played by the AI). Each stage needs a
// healthy pool — at least ASYNC.MIN_ACTIVE_PER_STAGE decks seen in the last ASYNC.ACTIVE_DAYS —
// so real recorded decks are topped up with seeded ghost decks generated for that stage.
//
// RAID (offline). One featured boss per week (RAID.CYCLE_DAYS). Its HP is a shared pool
// (boss.hqHp × RAID.POOL_MULT) that every deck fighting it this week chips down. Loading the raid
// pulls in the previously active decks that fought it this cycle (your own recorded attempts, and
// any others the game knows about), alongside RAID.MIN_RAIDERS seeded stand-in raiders whose fights
// are simulated with the real engine (together capped at RAID.SEED_SHARE of the pool).
// ============================================================================
(function(root){
'use strict';

const ASYNC = {MAX_WINS:7, MAX_LOSSES:3, MIN_ACTIVE_PER_STAGE:12, ACTIVE_DAYS:14};
const RAID = {CYCLE_DAYS:7, POOL_MULT:8, MIN_RAIDERS:8, MAX_RAIDERS:16, SEED_SHARE:0.5};
const DAY = 24*3600*1000;
// Same per-rarity copy limits as the deck builder (arena_app.js RARITY_MAX_COPIES).
const RARITY_MAX_COPIES = {common:10, uncommon:5, rare:4, veryrare:3, superrare:3, epic:2, heroic:2, unique:1, legendary:1, mythic:1, ancient:1, starter:10, quest:5, questunique:1};
const DECK_SIZE = 20;
const GHOST_NAMES = ['Moss','Bramble','Pip','Thistle','Rook','Fern','Juniper','Wren','Hazel','Sorrel','Bracken','Tansy','Nettle','Clover','Sedge','Rowan','Burdock','Willow','Aster','Quill','Hollis','Marlow','Pebble','Kestrel'];
const AVATAR_CHARS = ['otter','hummingbird','mouse'];
const AVATAR_COLORS = ['acorn','berry','river','moss','violet','sun','blossom','frost','night'];

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h>>>0; }
function capOf(d){ return RARITY_MAX_COPIES[(d && d.rarity) || 'common'] || 10; }
function fieldable(defs){ return Object.keys(defs).filter(id=> defs[id] && !defs[id].token && !defs[id].test && !(defs[id].hallOfFame)).sort(); }

// Rough stand-alone strength of one card — only used to pick stage-appropriate ghost decks.
function cardPower(d){
  const fx = Object.keys(d.effects||{}).length;
  return ((d.attack||0) + (d.health||0)*0.45 + fx*1.5) / (1 + 0.3*(d.wait||0)) - 0.6*(d.cost||0);
}

function validateDeck(defs, deck){
  const errs = [];
  let total = 0;
  Object.keys(deck||{}).forEach(id=>{
    const n = deck[id]|0; total += n;
    const d = defs[id];
    if(!d){ errs.push(`unknown card ${id}`); return; }
    if(d.token || d.test) errs.push(`${id} can't be in a deck`);
    if(n > capOf(d)) errs.push(`${id} ×${n} is over its ${d.rarity||'common'} limit of ${capOf(d)}`);
  });
  if(total !== DECK_SIZE) errs.push(`deck has ${total} cards, needs ${DECK_SIZE}`);
  return errs;
}

// Deterministic ghost deck for a stage: cards are drawn from a power band that rises with the
// stage (stage 0 ≈ bottom fifth of the card pool, last stage ≈ top fifth), always with some
// cost-0 cards so the deck can actually be played.
function generateGhostDeck(defs, stage, seed, maxStage){
  maxStage = maxStage || ASYNC.MAX_WINS - 1;
  const r = mulberry32(seed);
  const ids = fieldable(defs).sort((a,b)=> cardPower(defs[a]) - cardPower(defs[b]) || (a<b?-1:1));
  const t = Math.max(0, Math.min(1, stage / Math.max(1, maxStage)));
  const lo = Math.floor((0.05 + 0.6*t) * ids.length), hi = Math.min(ids.length, Math.ceil((0.35 + 0.6*t) * ids.length));
  const band = ids.slice(lo, hi);
  const cheap = band.filter(id=> !(defs[id].cost>0));
  const deck = {}; let total = 0, guard = 0;
  const add = id=>{ if((deck[id]||0) >= Math.min(3, capOf(defs[id]))) return false; deck[id] = (deck[id]||0)+1; total++; return true; };
  // a core of 4–6 distinct cards, 2–3 copies each, so ghosts have a recognisable plan
  const core = 4 + Math.floor(r()*3);
  for(let i=0; i<core && total<DECK_SIZE && guard++<500; i++){
    const pool = (i < 2 && cheap.length) ? cheap : band;
    const id = pool[Math.floor(r()*pool.length)];
    const copies = 2 + Math.floor(r()*2);
    for(let c=0;c<copies && total<DECK_SIZE;c++) add(id);
  }
  while(total < DECK_SIZE && guard++ < 5000){
    const pool = (Object.keys(deck).filter(id=> !(defs[id].cost>0)).reduce((s,id)=> s+deck[id], 0) < 8 && cheap.length) ? cheap : band;
    add(pool[Math.floor(r()*pool.length)]);
  }
  // Fallback (2026-10-09): a band full of one-copy cards (Unique, Legendary…) can run dry before 20.
  // Widen outwards from the band, nearest power first, until the deck is full.
  if(total < DECK_SIZE){
    const mid = (lo + hi) / 2;
    const near = ids.map((id, k)=> [id, Math.abs(k - mid)]).sort((a,b)=> a[1]-b[1]).map(x=> x[0]);
    for(let pass=0; pass<3 && total<DECK_SIZE; pass++) for(const id of near){ if(total >= DECK_SIZE) break; add(id); }
  }
  return deck;
}
function ghostIdentity(seed){
  const r = mulberry32(seed ^ 0x9e3779b9);
  return {name: GHOST_NAMES[Math.floor(r()*GHOST_NAMES.length)] + ' ' + String.fromCharCode(65 + Math.floor(r()*26)) + '.',
          avatar: {character: AVATAR_CHARS[Math.floor(r()*AVATAR_CHARS.length)], color: AVATAR_COLORS[Math.floor(r()*AVATAR_COLORS.length)], title: 'newcomer'}};
}
function deckPower(defs, deck){ let s = 0, n = 0; Object.keys(deck).forEach(id=>{ if(defs[id]){ s += cardPower(defs[id])*deck[id]; n += deck[id]; } }); return n ? s/n : 0; }

// Seeded ghosts for one stage. `epoch` rotates them (e.g. weekly) so the pool doesn't go stale.
function seedGhosts(defs, stage, count, epoch){
  const out = [];
  for(let i=0;i<count;i++){
    const seed = hashStr(`ghost:${epoch||0}:${stage}:${i}`);
    const who = ghostIdentity(seed);
    out.push({id:`seed:${epoch||0}:${stage}:${i}`, owner:`seed-${stage}-${i}`, name: who.name, avatar: who.avatar, deck: generateGhostDeck(defs, stage, seed), stage, source:'seed'});
  }
  return out;
}

// The opponent pool for one stage: active recorded decks (newest per owner) topped up with seeds.
function buildStagePool(defs, stage, recorded, now, opts){
  opts = opts || {};
  const min = opts.min || ASYNC.MIN_ACTIVE_PER_STAGE;
  const cutoff = now - ASYNC.ACTIVE_DAYS*DAY;
  const latest = {};
  (recorded||[]).forEach(g=>{
    if(!g || g.stage!==stage || !(g.at>=cutoff) || validateDeck(defs, g.deck).length) return;
    if(!latest[g.owner] || latest[g.owner].at < g.at) latest[g.owner] = g;
  });
  const real = Object.values(latest).map(g=> Object.assign({source:'player'}, g));
  const epoch = Math.floor(now / (7*DAY));
  const seeded = real.length >= min ? [] : seedGhosts(defs, stage, min - real.length, epoch);
  const decks = real.concat(seeded);
  return {stage, decks, real: real.length, seeded: seeded.length, active: decks.length};
}
function pickOpponent(pool, seed, excludeOwners){
  const ex = new Set(excludeOwners||[]);
  const options = pool.decks.filter(g=> !ex.has(g.owner));
  const list = options.length ? options : pool.decks;
  return list[mulberry32(seed)() * list.length | 0] || null;
}
function newAsyncRun(now){ return {wins:0, losses:0, faced:[], startedAt: now}; }
function asyncRunOver(run){ return run.wins >= ASYNC.MAX_WINS || run.losses >= ASYNC.MAX_LOSSES; }
// A deck that just WON at `stage` is recorded at that stage: it's exactly the kind of deck other
// players meet there.
function recordAsyncGhost(recorded, entry, keep){
  const list = (recorded||[]).filter(g=> !(g.owner===entry.owner && g.stage===entry.stage));
  list.push(entry);
  return list.sort((a,b)=> b.at - a.at).slice(0, keep || 200);
}

// ---------------- Raid ----------------
function raidCycle(now){ return Math.floor(now / (RAID.CYCLE_DAYS*DAY)); }
function featuredRaidBoss(bosses, now){ return bosses.length ? bosses[raidCycle(now) % bosses.length] : null; }
function raidPoolMax(boss){ return (boss.hqHp||200) * RAID.POOL_MULT; }

// One boss fight with the real engine: raider deck (AI-played) vs the boss deck with the given
// castle HP. Returns the castle damage the raider dealt.
function simulateRaidFight(Engine, defs, boss, deck, castleHp, seed){
  const rnd = mulberry32(seed);
  const engine = Engine.makeSimEngine(defs, rnd, {recordEvents:false, suddenDeathCastles:false});
  const sideOf = id=> id===1 ? 'A' : 'B';
  const players = {1: engine.newPlayer(1, deck), 2: engine.newPlayer(2, boss.deck, {id:'raid-'+boss.id, name:boss.name, health:castleHp, effects:{}})};
  const stats = {};
  engine.draw(players[1], 3, 'A', stats, null); engine.draw(players[2], 3, 'B', stats, null);
  let round = 1, over = false;
  for(; round<=60 && !over; round++){
    if(engine.setSuddenDeath) engine.setSuddenDeath(round >= 20);
    [1,2].forEach(p=>{ players[p].playedThisTurn = false; players[p].discardUsedThisTurn = false; });
    engine.aiTakeTurn(players, sideOf, 1, stats, null);
    engine.aiTakeTurn(players, sideOf, 2, stats, null);
    over = engine.resolveCombat(players, sideOf, stats, null, round%2===0 ? 1 : 2);
    if(!over){ engine.draw(players[1], 1, 'A', stats, null); engine.draw(players[2], 1, 'B', stats, null); }
  }
  const dealt = Math.max(0, castleHp - Math.max(0, players[2].hq.hp));
  return {damage: dealt, won: players[2].hq.hp<=0, rounds: round-1};
}

// The raid as it stands now: previously active decks this cycle (recorded attempts with real
// damage), plus simulated seeded raiders if the party is thin. Deterministic per boss + week.
function raidState(Engine, defs, boss, attempts, now){
  const cycle = raidCycle(now);
  const max = raidPoolMax(boss);
  const mine = (attempts||[]).filter(a=> a && a.bossId===boss.id && a.cycle===cycle && !validateDeck(defs, a.deck).length).sort((a,b)=> a.at - b.at);
  // Stand-ins are FIXED for the week (not "fill up to N"): if a real raider replaced one, that
  // stand-in's simulated damage would vanish and the boss would visibly heal. Fixed stand-ins keep
  // the shared pool monotonic — it only ever goes down as real attempts land.
  const need = RAID.MIN_RAIDERS;
  const stage = Math.min(ASYNC.MAX_WINS-1, Math.floor((boss.strength||1)/2));
  const seeds = seedGhosts(defs, stage, need, `raid:${boss.id}:${cycle}`);
  let pool = max;
  const party = [];
  // Seeded raiders fought "earlier in the week". Each is simulated against a full-strength boss;
  // together they may take at most RAID.SEED_SHARE of the pool (scaled down if they'd take more),
  // so stand-in decks never finish a boss before real players get their turn.
  const seedFights = seeds.map((g,i)=> simulateRaidFight(Engine, defs, boss, g.deck, boss.hqHp, hashStr(`raidfight:${boss.id}:${cycle}:${i}`)));
  const seedTotal = seedFights.reduce((t,f)=> t + f.damage, 0);
  const scale = seedTotal > max*RAID.SEED_SHARE ? (max*RAID.SEED_SHARE) / seedTotal : 1;
  seeds.forEach((g,i)=>{
    const dmg = Math.floor(seedFights[i].damage * scale);
    pool -= dmg;
    party.push({owner:g.owner, name:g.name, avatar:g.avatar, deck:g.deck, damage:dmg, won:seedFights[i].won && scale===1, source:'seed'});
  });
  mine.forEach(a=>{
    const dmg = Math.max(0, Math.min(pool, a.damage|0));
    pool -= dmg;
    party.push({owner:a.owner, name:a.name, avatar:a.avatar, deck:a.deck, damage:dmg, won:!!a.won, source: a.source || 'player', at:a.at});
  });
  pool = Math.max(0, pool);
  return {boss, cycle, max, remaining: pool, defeated: pool<=0, party, nextCastleHp: Math.min(pool, boss.hqHp)};
}
function recordRaidAttempt(attempts, entry, keep){ return (attempts||[]).concat([entry]).slice(-(keep||300)); }

// ---------------- PvP matchmaking (2026-10-03, explicit: "There is an elo system, so you fight
// people in your own tier. There's also a light pull towards fighting decks near your level") ----
// Tiers mirror the game's rank ladder (arena_app.js RANK_TIERS / rankForRating): rating → z-score
// → 6 tiers. Opponents come from your own tier; if that tier is thin (< PVP.MIN_TIER_POOL) the
// search widens one tier at a time. Within the pool, deck level gives a LIGHT pull: a deck at your
// level is ~2.5× as likely as one far from it, but nothing is ever excluded for level alone.
const PVP = {RANK_MEAN:1500, RANK_SD:300, Z_EDGES:[-1.5, -0.75, 0, 0.75, 1.5], MIN_TIER_POOL:6, LEVEL_PULL:0.6, K:24};
function tierIndexForRating(r){ const z = ((Number(r)||PVP.RANK_MEAN) - PVP.RANK_MEAN) / PVP.RANK_SD; const i = PVP.Z_EDGES.findIndex(e=> z < e); return i===-1 ? PVP.Z_EDGES.length : i; }
function tierMidRating(t){ const e = PVP.Z_EDGES; const lo = t===0 ? e[0]-0.75 : e[t-1], hi = t===e.length ? e[e.length-1]+0.75 : e[t]; return Math.round(PVP.RANK_MEAN + ((lo+hi)/2)*PVP.RANK_SD); }
function simpleDeckLevel(defs, deck){ const W = {starter:1, common:1, uncommon:2, quest:2, rare:3, veryrare:4, superrare:5, epic:6, heroic:7, unique:8, questunique:8, legendary:8, mythic:9, ancient:10}; let t = 0; Object.keys(deck||{}).forEach(id=>{ const d = defs[id]; if(d) t += (deck[id]|0) * (W[d.rarity||'common']||1); }); return t; }
// candidates: [{owner, rating, deckLevel, deck, ...}]. Returns {opponent, pool, tierUsed, widened}.
function matchPvp(me, candidates, seed, excludeOwners){
  const myTier = tierIndexForRating(me.rating);
  const ex = new Set(excludeOwners||[]);
  const all = (candidates||[]).filter(c=> c && !ex.has(c.owner));
  let pool = [], widen = 0;
  for(; widen<=5; widen++){
    pool = all.filter(c=> Math.abs(tierIndexForRating(c.rating) - myTier) <= widen);
    if(pool.length >= PVP.MIN_TIER_POOL || pool.length===all.length) break;
  }
  if(!pool.length) return {opponent:null, pool, tierUsed: myTier, widened: widen};
  const myLvl = Math.max(1, me.deckLevel||1), scale = Math.max(8, myLvl*0.25);
  const weights = pool.map(c=> (1-PVP.LEVEL_PULL) + PVP.LEVEL_PULL * Math.exp(-Math.abs((c.deckLevel||myLvl) - myLvl) / scale));
  const total = weights.reduce((a,b)=> a+b, 0);
  let x = mulberry32(seed>>>0)() * total, k = 0;
  while(k < pool.length-1 && x >= weights[k]){ x -= weights[k]; k++; }
  return {opponent: pool[k], pool, tierUsed: myTier, widened: widen};
}
function eloUpdate(myRating, oppRating, won, draw){
  const exp = 1 / (1 + Math.pow(10, ((oppRating||PVP.RANK_MEAN) - myRating) / 400));
  const score = draw ? 0.5 : (won ? 1 : 0);
  const delta = Math.round(PVP.K * (score - exp));
  return {newRating: myRating + delta, delta};
}
// Seeded strangers for a tier (so every tier always has a pool): stage follows the tier.
function seedPvpStrangers(defs, tier, count, epoch){
  const stage = Math.round(tier * (ASYNC.MAX_WINS-1) / PVP.Z_EDGES.length);
  return seedGhosts(defs, stage, count, 'pvp:'+tier+':'+(epoch||0)).map((g,i)=> Object.assign(g, {owner:`pvpseed-${tier}-${i}`, rating: tierMidRating(tier) + ((i*37)%120) - 60, deckLevel: simpleDeckLevel(defs, g.deck)}));
}
const api = {PVP, tierIndexForRating, tierMidRating, simpleDeckLevel, matchPvp, eloUpdate, seedPvpStrangers, ASYNC, RAID, DECK_SIZE, RARITY_MAX_COPIES, mulberry32, hashStr, cardPower, deckPower, validateDeck, generateGhostDeck, ghostIdentity, seedGhosts,
  buildStagePool, pickOpponent, newAsyncRun, asyncRunOver, recordAsyncGhost, raidCycle, featuredRaidBoss, raidPoolMax, simulateRaidFight, raidState, recordRaidAttempt};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodGhosts = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
