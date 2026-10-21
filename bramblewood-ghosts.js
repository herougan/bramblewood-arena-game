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
const RARITY_MAX_COPIES = {common:10, uncommon:5, rare:4, veryrare:3, superrare:3, epic:2, heroic:2, unique:1, legendary:1, mythic:1, ancient:1, starter:10, quest:5, questunique:1, special:4, devlegendary:1, devancient:1, eventlegendary:1, eventrare:4};
const DECK_SIZE = 20;
const GHOST_NAMES = ['Moss','Briony','Pip','Thistle','Rook','Fern','Juniper','Wren','Hazel','Sorrel','Bracken','Tansy','Nettle','Clover','Sedge','Rowan','Teasel','Willow','Aster','Quill','Hollis','Marlow','Pebble','Kestrel'];
const AVATAR_CHARS = ['otter','hummingbird','mouse'];
const AVATAR_COLORS = ['acorn','berry','river','moss','violet','sun','blossom','frost','night'];

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h>>>0; }
function capOf(d){ return RARITY_MAX_COPIES[(d && d.rarity) || 'common'] || 10; }
function fieldable(defs){ return Object.keys(defs).filter(id=> defs[id] && !defs[id].token && !defs[id].test && !(defs[id].hallOfFame) && !defs[id].pool).sort(); } // + !pool (2026-10-19, package AN: unplaced candidates)

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
// ---------------- Themed seeded decks (2026-10-21, package TS2) ----------------
// Owner (Oct 21): "More PVP decks maybe, I like PVP to experience some of the cards we made." Hand-built decks, one per theme, that
// showcase newer and thematic cards. They join the SEEDED pools of the Async Arena (buildStagePool) and PvP strangers
// (seedPvpStrangers) at the win stage given here, ahead of the generated decks; the offline Raid's stand-in raiders stay generated.
// Every card is one a player can own (a pack, a map reward or Base: not awaitingSource, not raid-only, not an Easter egg), each deck
// is 20 cards inside the rarity copy limits, and the stage was set from a quick headless run against the generated ghosts of each
// stage (docs/skirmish-theme-pass-2026-10-21.md lists them). A deck whose cards are missing from `defs` is skipped, never half-built.
const THEMED_GHOSTS = [
  {id:'beach-tide', name:"Brine the Beachcomber", stage:0, avatar:{character:'mouse', color:'river', title:'newcomer'}, theme:"Beach tide: gulls, crabs, seals and snails of the shingle",
   deck:{"garden-snail":3,"gull-thief":3,"tide-pool-crab":3,"fiddler-crab-swarm":3,"shallows-fry":2,"harbor-seal":2,"puffin-diver":2,"conch-crawler":2}},
  {id:'whimsy', name:"Fizz the Prankster", stage:0, avatar:{character:'mouse', color:'blossom', title:'newcomer'}, theme:"Whimsy parade: the strangest, silliest creatures in the game",
   deck:{"crossed-eyes":3,"trash-panda-trickster":3,"fleetfootd":3,"sheep":2,"wrong-way-salmon":2,"teatime-toad":2,"inside-out-hedgehog":2,"ferry-toll-frog":3}},
  {id:'cave-dwellers', name:"Echo Sedge", stage:1, avatar:{character:'mouse', color:'night', title:'newcomer'}, theme:"Cave dwellers: bats, moles and things that never see the sun",
   deck:{"cave-bat-swarm":3,"baby-bat":3,"cave-cricket":2,"cave-pseudoscorpion":3,"cave-flitter":2,"star-nosed-mole":3,"echo-screecher":2,"cave-swiftlet":2}},
  {id:'dune-raiders', name:"Dune Teasel", stage:1, avatar:{character:'mouse', color:'sun', title:'newcomer'}, theme:"Desert: jackals, scorpions and glass-dune hunters",
   deck:{"rabid-jackal":3,"dust-hyena":3,"hoopoe-herald":3,"glasswing-moth":2,"sandfish":2,"antlion-pit":2,"horned-lizard":2,"pale-oryx":3}},
  {id:'gatorback-choir', name:"Fen Nettle", stage:1, avatar:{character:'otter', color:'moss', title:'newcomer'}, theme:"Swamp: gators, vipers and frogs of the bog",
   deck:{"caiman-hatchling":3,"snapper-hatchling":3,"grass-viper":3,"swamp-alligator":3,"mangrove-mudskipper":2,"booming-bittern":2,"lotus-frog":2,"constrictor-coil":2}},
  {id:'hummingbird-flyers', name:"Ruby Wren", stage:2, avatar:{character:'hummingbird', color:'berry', title:'newcomer'}, theme:"Hummingbird flyers: the nectar squadron",
   deck:{"crimson-wing-recruit":3,"cobalt-talon-fledgling":3,"nectar-sipper":3,"violet-vane-fletcher":3,"sunfeather-scout":2,"gold-throated-acolyte":2,"petal-fletcher":2,"hummingbird-needler":2}},
  {id:'otter-faction', name:"Rivergate Rowan", stage:2, avatar:{character:'otter', color:'river', title:'newcomer'}, theme:"Otter faction: the Rivergate guard and its river folk",
   deck:{"otter-kit":3,"otter-paddler":3,"otter-netmender":3,"otter-ferryman":2,"shellwright-apprentice":2,"otter-flag-bearer":2,"otter-angler":2,"beaver-builder":3}},
  {id:'talon-wing', name:"Kestrel Hollis", stage:3, avatar:{character:'hummingbird', color:'sun', title:'newcomer'}, theme:"Raptors: hawks, eagles and kestrels",
   deck:{"field-crow":3,"raven-scout":3,"echo-keeper":2,"night-watchman":2,"owl-fletcher":2,"red-billed-chough":2,"peregrine-stooper":2,"hawk-arrowkeeper":2,"golden-eagle-diver":2}},
  {id:'thorn-hedge', name:"Bramble Quill", stage:3, avatar:{character:'mouse', color:'moss', title:'newcomer'}, theme:"Thornbound hedge: hedgehogs, porcupines and the briar maze",
   deck:{"hedgehog-scout":3,"bramble-hoglet":3,"porcupine-roller":3,"inside-out-hedgehog":2,"quillguard":2,"thorn-shrike":2,"seed-cache-squirrel":2,"mouse-sapper":3}},
  {id:'ashfall-legion', name:"Cinder Marlow", stage:4, avatar:{character:'mouse', color:'berry', title:'newcomer'}, theme:"Volcano: salamanders, wyrms and ember hunters",
   deck:{"cinder-stoker":3,"cinder-gecko":3,"ashbone-ghoul":2,"fire-salamander":3,"magma-salamander":3,"ember-jackal":2,"rimefire-salamander":1,"pyroclast-wyrm":1,"phoenix-fledgling":1,"fire-hawk":1}},
  {id:'deep-tide', name:"Abyssal Aster", stage:4, avatar:{character:'otter', color:'violet', title:'newcomer'}, theme:"Ocean: cephalopods, jellies and the deep reef",
   deck:{"sea-hare":3,"krill-swarm":3,"tide-spirit":2,"cuttlefish-illusionist":2,"lions-mane-jelly":2,"blue-ringed-octopus":3,"octopus-tactician":2,"nautilus-drifter":2,"colossal-squid":1}},
  {id:'frost-pack', name:"Frostbite Fern", stage:5, avatar:{character:'otter', color:'frost', title:'newcomer'}, theme:"Frost pack: wolves, foxes and ermine of the tundra",
   deck:{"snow-ermine":3,"frost-hare-sprinter":2,"lemming-swarm":2,"snowshoe-hare":2,"mountain-hare":2,"timber-wolf-pack":2,"wolf-pack-runner":2,"arctic-fox-raider":2,"alpha-howler":1,"lone-grey-wolf":1,"frostmoon-howler":1}},
  {id:'redwood-charge', name:"Redwood Rook", stage:5, avatar:{character:'otter', color:'acorn', title:'newcomer'}, theme:"Redwood charge: bears, boars and stags",
   deck:{"bear-cub":3,"fox-kit":3,"tusked-vanguard":3,"fawn-scout":2,"grizzly-vanguard":2,"stag-knight":2,"berserker-boar":2,"bramblewood-lynx":2,"elderhorn-monarch":1}},
  {id:'ant-colony', name:"Marching Mags", stage:6, avatar:{character:'mouse', color:'acorn', title:'newcomer'}, theme:"Ants swarm: workers, scouts and soldiers in numbers",
   deck:{"worker-ant":3,"ant-scout":3,"forager-ant":3,"soldier-ant":2,"ant-warrior":2,"fire-ant-raft":2,"tunnel-ant":3,"leafcutter-gardener":2}},
  {id:'goldfeather-guard', name:"Gilded Juniper", stage:6, avatar:{character:'hummingbird', color:'sun', title:'newcomer'}, theme:"Goldfeather guard: the Magnate's duck knights",
   deck:{"pond-duck":2,"duckling":3,"duckling-squadron":2,"pond-paddler":2,"tax-collector-teal":2,"goose-sentry":2,"mallard-halberdier":2,"mallard-marauder":1,"gilded-swan-knight":1,"iron-warden":1,"werebadger":2}},
  {id:'hive-swarm', name:"Honeycomb Hazel", stage:6, avatar:{character:'hummingbird', color:'sun', title:'newcomer'}, theme:"Hive swarm: bees, wasps and butterflies",
   deck:{"honey-bee":3,"bee-sentry":3,"bee-forager":3,"paper-wasp":3,"bee-knight":3,"glasswing-butterfly":2,"tarantula-hawk":2,"apollo-butterfly":1}}
];
function themedGhostsFor(defs, stage, epoch){
  const list = THEMED_GHOSTS.filter(g=> g.stage === stage && !validateDeck(defs, g.deck).length);
  if(list.length < 2) return list;
  const off = hashStr('themed:'+epoch+':'+stage) % list.length; // a weekly rotation, used only when fewer slots than decks are asked for
  return list.slice(off).concat(list.slice(0, off));
}

function deckPower(defs, deck){ let s = 0, n = 0; Object.keys(deck).forEach(id=>{ if(defs[id]){ s += cardPower(defs[id])*deck[id]; n += deck[id]; } }); return n ? s/n : 0; }

// Seeded ghosts for one stage. `epoch` rotates them (e.g. weekly) so the pool doesn't go stale.
// opts.themed (2026-10-21, package TS2): put the hand-built themed decks for this stage first, then fill with generated ones.
function seedGhosts(defs, stage, count, epoch, opts){
  const out = [];
  const themed = (opts && opts.themed) ? themedGhostsFor(defs, stage, epoch||0).slice(0, count) : [];
  themed.forEach(g=>{
    out.push({id:`themed:${g.id}`, owner:`themed-${g.id}`, name: g.name, avatar: Object.assign({}, g.avatar), deck: Object.assign({}, g.deck), stage, source:'seed', theme: g.theme});
  });
  for(let i=0;out.length<count;i++){
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
  const seeded = real.length >= min ? [] : seedGhosts(defs, stage, min - real.length, epoch, {themed:true});
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
function simpleDeckLevel(defs, deck){ const W = {starter:1, common:1, uncommon:2, quest:2, rare:3, veryrare:4, superrare:5, epic:6, heroic:7, unique:8, special:3, devlegendary:8, devancient:10, eventlegendary:8, eventrare:3, questunique:8, legendary:8, mythic:9, ancient:10}; let t = 0; Object.keys(deck||{}).forEach(id=>{ const d = defs[id]; if(d) t += (deck[id]|0) * (W[d.rarity||'common']||1); }); return t; }
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
  return seedGhosts(defs, stage, count, 'pvp:'+tier+':'+(epoch||0), {themed:true}).map((g,i)=> Object.assign(g, {owner:`pvpseed-${tier}-${i}`, rating: tierMidRating(tier) + ((i*37)%120) - 60, deckLevel: simpleDeckLevel(defs, g.deck)}));
}
const api = {THEMED_GHOSTS, themedGhostsFor, PVP, tierIndexForRating, tierMidRating, simpleDeckLevel, matchPvp, eloUpdate, seedPvpStrangers, ASYNC, RAID, DECK_SIZE, RARITY_MAX_COPIES, mulberry32, hashStr, cardPower, deckPower, validateDeck, generateGhostDeck, ghostIdentity, seedGhosts,
  buildStagePool, pickOpponent, newAsyncRun, asyncRunOver, recordAsyncGhost, raidCycle, featuredRaidBoss, raidPoolMax, simulateRaidFight, raidState, recordRaidAttempt};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodGhosts = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
