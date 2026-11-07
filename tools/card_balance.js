#!/usr/bin/env node
// Card balance report (2026-10-09, user: "card balancing was one of the key things to start on").
//
// How strong is each card, measured by playing real matches with the engine's own AI:
//   test deck  = 8 copies of the card (fewer for costly cards: 6 / 4 / 3) + filler up to 20
//   opponent   = 20 cards of the same filler
// A card that adds nothing scores ~50%; a strong card pushes the deck's win rate up. Then each card
// is compared with what its rarity should deliver (a band per rarity), and the outliers get a
// suggested stat change found by re-simulating (±Attack / ±Health in small steps until it lands in
// its band).
//
//   node tools/card_balance.js [games=100] [--suggest] [--mode=open] [--only=a,b] [--pool] [--workers=2] [--seed=2211] [--basic-only] [--resume]
// Writes docs/balance/card-balance.json (docs/balance/card-balance-partial.json with --only / --pool).
//
// 2026-11-07 (package BAL22, owner 07:37): 100 games a card by default (was 60; the last runs used 40), and two numbers per card:
//   basic    = the test above (against the filler); it tops out near 100% for strong cards. `winRate` stays the basic number.
//   advanced = the same test deck against decks drawn from the strong cards: the top 20% of cards by basic win rate (the tested card
//              left out, low-sample cards left out), up to min(4, the rarity's copy limit) copies each and the top-rank deck caps,
//              20 cards; one deck per game, drawn from --seed (reproducible). A strong card's `advRate` comes back toward 50.
//   Only games where the test side played at least one copy count (stats["A|id"/"B|id"].played): `played` of `games`, `playedShare`;
//   under 20 played games is flagged `lowSample`. The full run's top pool comes from its own basic pass; an --only run takes it from the
//   basic numbers already in docs/balance/card-balance.json.
//   --workers=K (default 2) plays the cards in K child processes and merges them into one file; --resume picks up a run that stopped
//   (progress in docs/balance/card-balance-progress.jsonl, removed when the run finishes); --basic-only skips the advanced pass.
//   --report-only (with --resume) writes the report from the progress file without playing more games: a card the advanced pass has
//   not reached reads advRate null, `advanced.complete` is false, and the progress file stays so a later --resume finishes the run.
// 2026-11-07 (package BAL25, owner 11-07 09:47): --v3, the card power measure v3. Without --v3 the tool runs exactly as BAL22 (v2).
//   scope      only the cards of Maps 0-20: canonical/card-obtain-maps.json map <= 20, plus the unlisted faction, Starter-rarity and
//              Base-source cards (the starting decks and tutorial rewards, all available by Map 20).
//   games      400 a card by default (v2: 100); seeds as v2, so game g of a card meets the same field and the same advanced deck.
//   field      each game rolls its own day/night and field (envOf): phase cycle 50% / all day 25% / all night 25% (v2: day every game,
//              which inflated Diurnal), and the fields of tools/skill_test_robust.js's FIELD_CONFIG (its census classes: Tide 20%,
//              each uncommon 2%, each rare 0.2%, plus one more non-common field in 20% of games); the Day/Night entry there is
//              replaced by the phase roll. Each row keeps its played / wins by phase (`byPhase`).
//   filler     + two Lumber cards (Termite Forager, Delivery {Lumber x1} once; Land Tiller, Delivery {Lumber x1} every turn), so
//              high-Lumber cards get paid for as they would in a real deck. Both sides share it, as before.
//   advanced   a mix (owner: "top 40% (or a mix)", so the advanced rate hovers near 50): 5 cards from the top 40% by basic win rate
//              (one or two strong cards at their copy cap) + 15 from every measured card of the scope; 20 top-40% cards held the
//              median card near 19% (docs/balance/bal25/adv-calibration-2026-11-07.json). --adv-top=F, --adv-mix=K.
//   Faction-Starter  a balancing-only rarity (no card data changes): a faction card with no obtain map and Starter rarity (the
//              starting decks) is measured at its printed Level 0 stats (other Level 0 cards at Level 1, as v2) and budgeted at
//              Level 0, one rank below Starter.
//   for its budget   power = the mean of the basic and advanced win rates (the basic rate alone where there is no advanced one);
//              expected = a least-squares line of power on N (bramblewood-budget.js through tools/skill_costs.js, at the level the
//              card is measured at; low-sample cards left out of the fit); forBudget = power - expected (+ = stronger than its
//              rarity, Lumber, Wait, map and skills say). Writes docs/balance/bal25/card-power.json (progress card-power-progress.jsonl).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const args = process.argv.slice(2);
const optv = (name, dflt)=>{ const a = args.find(x=> x.startsWith('--' + name + '=')); if(a) return a.slice(name.length + 3); const i = args.indexOf('--' + name); return i >= 0 && args[i+1] && !args[i+1].startsWith('--') ? args[i+1] : dflt; };
const V3 = args.includes('--v3'); // BAL25 (2026-11-07)
const N_ARG = args.find(a=> /^\d+$/.test(a) && args[args.indexOf(a)-1] !== '--workers' && args[args.indexOf(a)-1] !== '--seed');
const N = V3 && !N_ARG ? 400 : +(N_ARG || 100);
const WORKERS = Math.max(1, +optv('workers', 2) || 1);
const SEED = +optv('seed', 2211);
const IS_WORKER = args.includes('--worker');
const BASIC_ONLY = args.includes('--basic-only');
const REPORT_ONLY = args.includes('--report-only');
const TOP_SHARE = 0.2, LOW_SAMPLE = 20;
const TOP = V3 ? Math.max(0.01, Math.min(1, +optv('adv-top', 0.4) || 0.4)) : TOP_SHARE; // BAL25: top 40% (owner 09:47 #6); --adv-top=F
// BAL25 (owner 09:47 #6, "or a mix"): a 20-card deck of only top-40% cards held the median card near 19% (59 cards, 400 games), so the
// v3 opponent is a mix: ADV_MIX cards from the top pool (each at its copy cap), the rest from every measured card of the scope. --adv-mix=K
// (20 = the top pool only). Calibration, 25 cards spread over the basic range, 100 games: docs/balance/bal25/adv-calibration-2026-11-07.json.
const ADV_MIX = Math.max(1, Math.min(20, +optv('adv-mix', 5) || 5));
const SUGGEST = args.includes('--suggest');
const MODE = (args.find(a=> a.startsWith('--mode=')) || '--mode=open').slice(7);
// --only=a,b,c measures just those cards (writes docs/balance/card-balance-partial.json, leaving the full report alone).
const ONLY = ((args.find(a=> a.startsWith('--only=')) || '').slice(7)).split(',').filter(Boolean);

const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
// Level 1 for everyone (2026-10-13, user: "when analysing cards for their strength, we should care about rarity AND level 0s
// (assume level 1 for all units. but for those that start at level 0, note that the 1st level is a major improvement)"):
// a card that starts at Level 0 (starter, tutorial, Base, quest cards) prints its Level 0 stats, so it is measured at Level 1
// (its levelStats[1] if set, else +10%), and the report flags it.
function baseLevel0(d){ const k = d.source && d.source.kind; return !!(d.basic || d.rarity==='starter' || d.tutorial || d.quest || k==='quest' || k==='errand' || k==='base' || d.id==='wandering-traveller'); }
function atLevel1(d){ if(!baseLevel0(d)) return d; const ov = d.levelStats && (d.levelStats[1] || d.levelStats['1']); const r = v=> v==null ? v : Math.max(v > 0 ? 1 : 0, Math.round(v * 1.10));
  return Object.assign({}, d, {attack: ov && ov.attack!=null ? ov.attack : r(d.attack), health: ov && ov.health!=null ? ov.health : r(d.health), startsAt0: true}); }
// BAL25 (--v3): the obtain map per card, the Maps 0-20 scope and the balancing-only Faction-Starter rarity
const OBTAIN = (()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/card-obtain-maps.json'), 'utf8')).maps || {}; }catch(e){ return {}; } })();
const SCOPE_MAX_MAP = 20;
function inScopeV3(c){ const m = OBTAIN[c.id], k = c.source && c.source.kind; if(m != null) return m <= SCOPE_MAX_MAP; return !!(c.faction || c.rarity === 'starter' || k === 'base'); }
function isFactionStarter(c){ return !!(c && c.faction && OBTAIN[c.id] == null && c.rarity === 'starter'); }
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = V3 && isFactionStarter(c) ? Object.assign(d, {factionStarter: true}) : atLevel1(d); });
// 2026-10-19 (package AN): pool cards ("pool": true, unplaced candidates) are measured only when asked for: --only=<ids>, or --pool
// for every pool card (written to the partial report like --only); the full report stays the live cards'.
if(args.includes('--pool')) Object.keys(defs).forEach(id=>{ if(defs[id].pool && !ONLY.includes(id)) ONLY.push(id); });
const fieldable = Object.keys(defs).filter(id=> !defs[id].token && !defs[id].test && !defs[id].hallOfFame && !defs[id].baseId && !defs[id].field && (!defs[id].pool || ONLY.includes(id))) // field cards are situational: measured in themed decks instead (fields-and-day-night-2026-10-09.md).sort();

// The reference: a mid-strength mix (two plain cost-0 units, a flyer, a cost-1 tank and a poisoner)
// picked from a first pass so an average card lands near 50% and strong cards still have room to
// show (against plain filler anything decent won ~98%). Both decks share it, so only the tested card
// differs.
const FILLER = ['warren-scout', 'fawn-scout', 'bee-sentry', 'mouse-sapper', 'poison-dart-croaker'].concat(V3 ? ['termite-forager', 'land-tiller'] /* BAL25: Lumber in the filler (owner 09:47 #3) */ : []).filter(id=> defs[id]);
// 2026-10-13: the filler is the yardstick, so it stays as it was measured on 2026-10-09: printed stats (no Level 1 step) and none
// of the later situational traits (Swimmer etc.), or every new trait on a filler card would move every card's score.
const RAW = {}; cards.forEach(c=>{ RAW[c.id] = c; });
FILLER.forEach(id=>{ const d = Object.assign({effects:{}}, RAW[id]); delete d.art; d.effects = Object.assign({}, d.effects); ['swimmer','tailwind','headwind','darksight','dry'].forEach(k=> delete d.effects[k]); if(V3 && isFactionStarter(RAW[id])) d.factionStarter = true; /* BAL25: Bee Sentry */ defs[id] = d; });
function fillerDeck(n){ const d = {}; for(let i=0;i<n;i++){ const id = FILLER[i % FILLER.length]; d[id] = (d[id]||0) + 1; } return d; }
const OPP = fillerDeck(20);
const COPIES_BY_COST = [8, 6, 4, 3];

// 2026-11-07 (BAL22): the advanced opponents. The copy limit per rarity is the game's RARITY_MAX_COPIES (arena_app.js), capped at 4
// like the game's own CPU deck builder (arena_app.js ~20011), plus the top-rank deck caps (BramblewoodBudget.deckRankBlock).
const RARITY_MAX_COPIES = {common:5, uncommon:4, rare:3, veryrare:2, superrare:1, epic:1, heroic:1, unique:1, legendary:1, mythic:1, ancient:1,
  divine:1, void:1, daemonic:1, starter:5, quest:4, questunique:1, special:3, devlegendary:1, devancient:1, eventlegendary:1, eventrare:3};
let BB = null; try{ BB = require(path.join(ROOT, 'bramblewood-budget.js')); }catch(e){}
const copyCap = d=> Math.min(4, RARITY_MAX_COPIES[d.rarity || 'common'] != null ? RARITY_MAX_COPIES[d.rarity || 'common'] : RARITY_MAX_COPIES.common);
// One opponent deck for game k: the pool (sorted, without the tested card) shuffled from (SEED, k), each card at its copy cap until 20.
// Every card meets the same 100 decks (the tested card, if it is in the pool, is swapped for the next card in the shuffle).
// BAL25 (--v3): pool may be {top, all}: ADV_MIX cards from the top pool, then the rest of the 20 from the whole measured field (all),
// one shuffle each from (SEED, k); a plain array is v2's pool (20 cards from it).
function advDeck(pool, id, k){
  const top = Array.isArray(pool) ? pool : pool.top, all = Array.isArray(pool) ? null : pool.all, rnd = E.mulberry32(SEED * 7919 + k * 104729);
  const shuf = list=>{ const ids = list.filter(x=> x !== id && defs[x]); for(let i = ids.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); const t = ids[i]; ids[i] = ids[j]; ids[j] = t; } return ids; };
  const deck = {}; let n = 0;
  const fill = (ids, upto)=>{ for(const x of ids){ if(n >= upto) break; if(deck[x]) continue; let c = Math.min(copyCap(defs[x]), upto - n);
    if(BB && BB.deckRankBlock){ while(c > 0){ const probe = Object.assign({}, deck); probe[x] = (probe[x]||0) + c - 1; if(!BB.deckRankBlock(probe, x, defs, [])) break; c--; } }
    if(c > 0){ deck[x] = c; n += c; } } };
  fill(shuf(top), all ? ADV_MIX : 20);
  if(all) fill(shuf(all), 20);
  return n >= 20 ? deck : null;
}
// BAL25 (--v3, owner 09:47 #2): each game's day/night and field, from (SEED, g) only, so every card meets the same 400 settings.
let ROBUST = null; if(V3){ try{ ROBUST = require(path.join(__dirname, 'skill_test_robust.js')); }catch(e){ ROBUST = null; } }
const PHASE_ROLL = [['cycle', 0.5], ['day', 0.25], ['night', 0.25]];
function envOf(g){
  const rnd = E.mulberry32(SEED * 4099 + g * 2654435 + 17), rules = {}, ids = [];
  let u = rnd(), phase = 'cycle'; for(const [p, w] of PHASE_ROLL){ if(u < w){ phase = p; break; } u -= w; }
  rules.phase = phase;
  if(ROBUST){ const F = ROBUST.FIELDS, C = ROBUST.FIELD_CONFIG, all = Object.keys(F).filter(k=> k !== 'daynight'), slots = {};
    const take = id=>{ const f = F[id]; if(ids.includes(id) || (f.slot && slots[f.slot])) return; ids.push(id); if(f.slot) slots[f.slot] = id; };
    all.forEach(id=>{ if(rnd() < C.p[F[id].class]) take(id); });
    if(rnd() < C.forceNonCommon){ const free = all.filter(id=> F[id].class !== 'common' && !ids.includes(id) && !(F[id].slot && slots[F[id].slot]));
      if(free.length){ const tot = free.reduce((s, id)=> s + C.forceWeight[F[id].class], 0); let v = rnd() * tot; for(const id of free){ v -= C.forceWeight[F[id].class]; if(v < 0){ take(id); break; } } } }
    ids.forEach(id=>{ const vs = F[id].variants, tot = vs.reduce((s, x)=> s + x.w, 0); let v = rnd() * tot, pick = vs[vs.length - 1]; for(const x of vs){ v -= x.w; if(v < 0){ pick = x; break; } }
      const r = Object.assign({}, pick.rules); delete r.phase; Object.assign(rules, r); }); }
  return {rules, phase, fields: ids};
}
// simulateOneMatch's loop (bramblewood-engine.js) with the field's rules passed to the engine (simulateOneMatch takes none).
function playV3(D, deckA, deckB, rnd, rules, maxRounds){
  const engine = E.makeSimEngine(D, rnd, {battleMode: MODE, rules}), sideOf = p=> p === 1 ? 'A' : 'B', stats = {};
  const P = {1: engine.newPlayer(1, deckA), 2: engine.newPlayer(2, deckB)};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  let round = 1, winner = 0, lastSig = null, stalled = 0, drawn = false; const cap = Math.min(maxRounds, E.DRAW_ROUND_CAP);
  while(round <= cap){
    engine.setSuddenDeath(round >= E.SUDDEN_DEATH_ROUND, round >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(round > 1) engine.roundStart(P, round, sideOf, stats, null);
    engine.aiTakeTurn(P, sideOf, 1, stats, null); engine.aiTakeTurn(P, sideOf, 2, stats, null);
    if(engine.resolveCombat(P, sideOf, stats, null, round % 2 === 0 ? 1 : 2)){ const a = P[1].hq.hp <= 0, b = P[2].hq.hp <= 0; winner = a && b ? 0 : a ? 2 : 1; return {winner, stats}; }
    const sig = E.boardSignature(P); stalled = (sig === lastSig && E.noActionsLeft(P)) ? stalled + 1 : 0; lastSig = sig;
    if(stalled >= E.STALL_ROUNDS_FOR_DRAW && round >= E.STALL_DRAW_FROM_ROUND){ drawn = true; break; }
    round++; engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
  if(drawn || maxRounds >= E.DRAW_ROUND_CAP) return {winner: 0, stats};
  const h1 = P[1].hq.hp, h2 = P[2].hq.hp; return {winner: h1 === h2 ? 0 : h1 > h2 ? 1 : 2, stats};
}
// The test: N games of (k copies of the card + filler) against the filler (basic) or against advDeck (advanced, pool given).
// Seats alternate; a game counts only if the test side played the card at least once.
function measure(id, over, pool){
  const D = over ? Object.assign({}, defs, {[id]: Object.assign({}, defs[id], over)}) : defs;
  // Expensive cards can't be played eight times a match, so the test deck carries fewer of them.
  const k = COPIES_BY_COST[Math.min(3, defs[id].cost||0)];
  const deck = fillerDeck(20 - k); deck[id] = (deck[id]||0) + k;
  let w = 0, wAll = 0, played = 0, games = 0; const byPhase = V3 ? {cycle: [0, 0], day: [0, 0], night: [0, 0]} : null; // BAL25: [played, wins]
  for(let g=0; g<N; g++){
    const opp = pool ? advDeck(pool, id, g) : OPP; if(!opp) continue;
    const env = V3 ? envOf(g) : null, rnd = E.mulberry32((pool ? SEED + 99991 : 7700) + g*131);
    const r = V3 ? playV3(D, g%2 ? deck : opp, g%2 ? opp : deck, rnd, env.rules, 60)
      : E.simulateOneMatch(D, g%2 ? deck : opp, g%2 ? opp : deck, {rnd, maxRounds: 60, battleMode: MODE});
    const mine = g%2 ? 1 : 2, st = r.stats && r.stats[(mine === 1 ? 'A' : 'B') + '|' + id];
    const s = r.winner===mine ? 1 : r.winner===0 ? 0.5 : 0;
    games++; wAll += s;
    if(st && st.played > 0){ played++; w += s; if(byPhase){ byPhase[env.phase][0]++; byPhase[env.phase][1] += s; } }
  }
  return {games, played, wins: w, rate: played ? w / played : null, rateAll: games ? wAll / games : null, byPhase: byPhase || undefined};
}
function winRate(id, over){ const m = measure(id, over, null); return m.rate == null ? 0 : m.rate; } // --suggest's yardstick (basic, played games)
const r1 = v=> v == null ? null : Math.round(v * 1000) / 10;

// ---- worker processes (BAL22): the parent hands out one card at a time ({phase, id, pool}); the worker answers {phase, id, m}.
if(IS_WORKER){
  process.on('message', job=>{
    if(job.stop){ process.disconnect(); return; }
    process.send({phase: job.phase, id: job.id, m: measure(job.id, null, job.phase === 'adv' ? job.pool : null)});
  });
  return;
}

// What each rarity should deliver, as a win-rate band for the test deck against the reference. A
// Starter is a bit below the reference, Common around it, and each rarity step a visible step up.
const BANDS = {
  starter:[.20,.48], common:[.35,.60], uncommon:[.45,.68], quest:[.45,.68], rare:[.52,.75], veryrare:[.56,.80], superrare:[.60,.84],
  epic:[.62,.87], heroic:[.64,.89], unique:[.66,.92], questunique:[.66,.92], legendary:[.70,.97], mythic:[.72,1], ancient:[.75,1],
};
const bandOf = d=> BANDS[d.rarity || 'common'] || BANDS.common;

// Stat budget per card (2026-10-18, owner: "General balance pass sticking religiously to N" and Ritual "increases N"), at the
// level the card starts at. v4 since 2026-10-19 (package BF, bramblewood-budget.js):
//   Base = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + 1×Ritual points (the sum of the Ritual's counts)
//   N = (Base − 1 + Level) × (1 + Level/20)   (v3: N = Base + 2×Level)
//   pass = (2A + H + S)×m < N and (A×H + S)×m < (N/3)², m = ×1.5 per half-miss skill. Reported in each row's `budget`.
//   (2026-10-22, BF7: the pass is SkillCosts' budget(), now f × ((2A + H)×m + S) ≤ N and f × (A×H×m + S·|S|) ≤ (N/3)², m on the stats
//   only, f = 0.7 for Fragile: bramblewood-budget.js capScores.)
// 2026-10-18 (owner: "Triggers and actions are costed by How often x How strong"): S comes from canonical/skill-costs.json through
// tools/skill_costs.js, the same code the master hub's Skill costs tab runs. Keyword costs are the old SB_SKILLS table unchanged;
// each trigger entry now costs its trigger weight × its action value (was 1 for the whole list) and Bounty N costs 0.5 × N (was 0).
const SkillCosts = require(path.join(__dirname, 'skill_costs.js'));
const SC = SkillCosts.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')));
function budgetV3(d){ // d = the card as printed (canonical/cards.json)
  const b = SC.budget(d); return {N:b.N, S:b.S, x1:b.x1, x2:b.x2, N2:b.N2, ok:b.ok};
}
// BAL25 (--v3, owner 09:47 #4/#5): the N the "for its budget" fit reads, at the level the card is measured at: Level 1 for every card
// (Level 0 cards are measured at their Level 1 stats), Level 0 and one rank below Starter for a Faction-Starter (balancing only).
const BUDGET_CFG = (()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')).budget || {}; }catch(e){ return {}; } })();
function fitN(id){ const d = RAW[id]; if(!d) return null;
  if(defs[id] && defs[id].factionStarter){ const BBm = require(path.join(ROOT, 'bramblewood-budget.js')), perR = BUDGET_CFG.perRarity != null ? +BUDGET_CFG.perRarity : BBm.DEFAULTS.perRarity;
    return Math.round(BBm.nAt(SC.budgetBase(d) - perR, 0, BUDGET_CFG) * SC.budgetMult(d) * 100) / 100; }
  return SC.budgetN(d, 1); }
// power = mean(basic, advanced) win %; expected = a + b × N by least squares over the cards with 20+ played games in both passes
// (basic only where no advanced pass); forBudget = power − expected. Rows gain power / expected / forBudget; returns the fit.
function fitBudget(rows){
  rows.forEach(r=>{ const hasA = r.advRate != null && !(r.adv && r.adv.lowSample); r.power = r.winRate == null ? null : Math.round((hasA ? (r.winRate + r.advRate) / 2 : r.winRate) * 10) / 10; });
  // eggs (hatchInto: Wait 5-10, so N 40-83, but the card is a shell that hatches into another) are left out of the fit and get no forBudget
  const egg = r=> !!(RAW[r.id] && RAW[r.id].hatchInto);
  const pts = rows.filter(r=> r.power != null && !r.lowSample && Number.isFinite(r.N) && !egg(r));
  const n = pts.length; if(n < 3) return null;
  const mx = pts.reduce((s, r)=> s + r.N, 0) / n, my = pts.reduce((s, r)=> s + r.power, 0) / n;
  const sxy = pts.reduce((s, r)=> s + (r.N - mx) * (r.power - my), 0), sxx = pts.reduce((s, r)=> s + (r.N - mx) * (r.N - mx), 0);
  const b = sxx ? sxy / sxx : 0, a = my - b * mx;
  const ssr = pts.reduce((s, r)=> s + Math.pow(r.power - (a + b * r.N), 2), 0), sst = pts.reduce((s, r)=> s + (r.power - my) * (r.power - my), 0);
  rows.forEach(r=>{ if(r.power == null || !Number.isFinite(r.N) || egg(r)){ r.expected = null; r.forBudget = null; if(egg(r)) r.fitNote = 'egg: left out of the fit'; return; }
    r.expected = Math.round((a + b * r.N) * 10) / 10; r.forBudget = Math.round((r.power - (a + b * r.N)) * 10) / 10; });
  return {formula: 'expected = a + b × N', a: Math.round(a * 1000) / 1000, b: Math.round(b * 1000) / 1000, n, r2: sst ? Math.round((1 - ssr / sst) * 1000) / 1000 : null,
    rmse: Math.round(Math.sqrt(ssr / n) * 10) / 10, leftOut: rows.filter(egg).map(r=> r.id), power: 'mean of winRate and advRate (winRate alone without an advanced pass)', N: 'bramblewood-budget.js N at the measured level (Faction-Starter: Level 0, one rank below Starter)'};
}

const t0 = Date.now();
const LIVE = fieldable.filter(id=> (!ONLY.length || ONLY.includes(id)) && (!V3 || ONLY.length || inScopeV3(RAW[id]))).sort(); // BAL25: --v3 keeps the Maps 0-20 cards
// ---- run the cards over WORKERS child processes, one card at a time; results saved line by line so --resume can pick up.
// BAL25: --v3 writes under docs/balance/bal25/ (the v2 report stays as it was)
const OUT_DIR = V3 ? path.join(ROOT, 'docs', 'balance', 'bal25') : path.join(ROOT, 'docs', 'balance');
const OUT_NAME = V3 ? (ONLY.length ? 'card-power-partial' : 'card-power') : (ONLY.length ? 'card-balance-partial' : 'card-balance');
fs.mkdirSync(OUT_DIR, {recursive: true});
const PROG = path.join(OUT_DIR, OUT_NAME + '-progress.jsonl');
const SETTINGS = Object.assign({games: N, mode: MODE, seed: SEED, only: ONLY.slice().sort().join(','), filler: FILLER.join(',')}, V3 ? {v: 3, top: TOP, advMix: ADV_MIX, scopeMaxMap: SCOPE_MAX_MAP, phases: PHASE_ROLL.map(x=> x.join(':')).join(','), fields: !!ROBUST} : {});
const done = {basic: {}, adv: {}};
if(args.includes('--resume') && fs.existsSync(PROG)){
  const lines = fs.readFileSync(PROG, 'utf8').split('\n').filter(Boolean).map(l=>{ try{ return JSON.parse(l); }catch(e){ return null; } }).filter(Boolean);
  // BAL25: settings that only change the advanced pass (ADV_KEYS) keep the basic results and drop the advanced ones
  const ADV_KEYS = ['top', 'advMix'], strip = o=>{ const c = Object.assign({}, o); ADV_KEYS.forEach(k=> delete c[k]); return JSON.stringify(c); };
  if(lines[0] && JSON.stringify(lines[0].settings) === JSON.stringify(SETTINGS)) lines.slice(1).forEach(l=>{ if(l.phase && l.id) done[l.phase][l.id] = l.m; });
  else if(lines[0] && strip(lines[0].settings) === strip(SETTINGS)){ console.error('card_balance: advanced settings changed; keeping the basic pass');
    lines.slice(1).forEach(l=>{ if(l.phase === 'basic' && l.id) done.basic[l.id] = l.m; });
    fs.writeFileSync(PROG, JSON.stringify({settings: SETTINGS}) + '\n' + Object.keys(done.basic).map(id=> JSON.stringify({phase: 'basic', id, m: done.basic[id]})).join('\n') + '\n'); }
  else console.error('card_balance: progress file is from other settings; starting over');
}
if(!Object.keys(done.basic).length) fs.writeFileSync(PROG, JSON.stringify({settings: SETTINGS}) + '\n');
function runPhase(phase, ids, pool){
  const todo = ids.filter(id=> !done[phase][id]);
  if(!todo.length || REPORT_ONLY) return Promise.resolve();
  const { fork } = require('child_process');
  const total = todo.length; let next = 0, got = 0, tP = Date.now();
  return new Promise((resolve, reject)=>{
    const kids = [];
    const feed = kid=>{ if(next < todo.length) kid.send({phase, id: todo[next++], pool}); else kid.send({stop: true}); };
    for(let i = 0; i < Math.min(WORKERS, todo.length); i++){
      const kid = fork(__filename, args.filter(a=> a !== '--resume').concat(['--worker']), {stdio: ['ignore', 'inherit', 'inherit', 'ipc']});
      kids.push(kid);
      kid.on('message', msg=>{
        done[phase][msg.id] = msg.m; fs.appendFileSync(PROG, JSON.stringify(msg) + '\n'); got++;
        if(got % 25 === 0 || got === total){ const el = (Date.now() - tP) / 1000; console.error(`  ${phase}: ${got}/${total} cards, ${el.toFixed(0)}s, ~${((total - got) * el / got / 60).toFixed(1)} min left`); }
        feed(kid);
      });
      kid.on('exit', code=>{ if(code){ reject(new Error(phase + ' worker exited with ' + code)); return; } if(kids.every(k=> k.exitCode !== null) && got >= total) resolve(); });
      feed(kid);
    }
  });
}
// The strong-card pool: the top 20% by basic win rate (played games), low-sample cards left out, ties by id.
function topPool(rateOf){ // rateOf: [{id, rate, played}]
  const ok = rateOf.filter(x=> x.rate != null && (x.played == null || x.played >= LOW_SAMPLE) && defs[x.id]);
  ok.sort((a, b)=> b.rate - a.rate || (a.id < b.id ? -1 : 1));
  return ok.slice(0, Math.max(1, Math.round(ok.length * TOP))).map(x=> x.id).sort();
}

(async ()=>{
await runPhase('basic', LIVE);
const tBasic = (Date.now() - t0) / 1000;
let pool = null, poolFrom = null, advAll = null;
if(!BASIC_ONLY){
  let rated;
  if(!ONLY.length){ rated = LIVE.map(id=> ({id, rate: done.basic[id].rate, played: done.basic[id].played})); poolFrom = 'this run (basic pass)'; }
  else { const rel = V3 ? 'docs/balance/bal25/card-power.json' : 'docs/balance/card-balance.json', prev = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    rated = (prev.rows || []).map(r=> ({id: r.id, rate: r.winRate, played: r.played})); poolFrom = rel + ' (' + prev.generated + ', ' + prev.games + ' games)'; }
  pool = topPool(rated);
  // BAL25: the rest of a v3 deck comes from every measured (not low-sample) card of the scope
  if(V3 && ADV_MIX < 20) advAll = rated.filter(x=> x.rate != null && (x.played == null || x.played >= LOW_SAMPLE) && defs[x.id]).map(x=> x.id).sort();
  await runPhase('adv', LIVE, advAll ? {top: pool, all: advAll} : pool);
}
const rows = LIVE.filter(id=> done.basic[id]).map(id=>{
  const d = defs[id], b = done.basic[id], a = done.adv[id], wr = b.rate, [lo, hi] = bandOf(d);
  const verdict = wr == null ? 'unplayed' : wr > hi ? 'strong' : wr < lo ? 'weak' : 'ok';
  return {id, name:d.name, rarity:d.rarity || null, cost:d.cost||0, wait:d.wait||0, attack:d.attack||0, health:d.health||0,
    skills:Object.keys(d.effects||{}).filter(k=> k!=='triggers').concat((d.effects.triggers||[]).length ? ['triggers'] : []),
    winRate: r1(wr), advRate: a ? r1(a.rate) : null, played: b.played, games: b.games, playedShare: b.games ? Math.round(b.played / b.games * 1000) / 1000 : 0,
    wins: b.wins, winRateAll: r1(b.rateAll), lowSample: b.played < LOW_SAMPLE || undefined,
    adv: a ? {played: a.played, games: a.games, playedShare: a.games ? Math.round(a.played / a.games * 1000) / 1000 : 0, wins: a.wins, rateAll: r1(a.rateAll), lowSample: a.played < LOW_SAMPLE || undefined} : undefined,
    band:[lo*100, hi*100], verdict, locked: !!d.locked, source: (d.source||{}).kind || 'base', startsAt0: !!d.startsAt0, budget: budgetV3(RAW[id]), note: d.startsAt0 ? 'measured at Lv 1 (starts at Lv 0: its first level is a major +10% step)' : undefined,
    // BAL25 (--v3): obtain map, the balancing rarity, wins by phase, the N the fit reads
    ...(V3 ? {map: OBTAIN[id] != null ? OBTAIN[id] : 0, rarityClass: d.factionStarter ? 'factionStarter' : (d.rarity || 'common'), measuredAt: d.factionStarter ? 0 : 1,
      byPhase: b.byPhase, advByPhase: a && a.byPhase, N: fitN(id)} : {})};
});

// Suggest a fix for outliers: step Attack, then Health, toward the band (max 4 steps each).
if(SUGGEST){
  rows.filter(r=> (r.verdict==='strong' || r.verdict==='weak') && r.rarity).forEach(r=>{ // unrated cards get a suggested rarity instead (below)
    const d = defs[r.id], [lo, hi] = bandOf(d), target = (lo + hi) / 2, dir = r.verdict==='strong' ? -1 : 1;
    let best = null;
    for(const stat of ['attack', 'health']){
      const base = d[stat] || 0, step = stat==='attack' ? 1 : Math.max(1, Math.round(base * 0.12));
      for(let k=1; k<=4; k++){
        const v = Math.max(stat==='health' ? 1 : 0, base + dir*step*k); if(v === base) break;
        const wr = winRate(r.id, {[stat]: v});
        const cand = {stat, from: base, to: v, winRate: Math.round(wr*1000)/10, dist: Math.abs(wr - target)};
        if(!best || cand.dist < best.dist) best = cand;
        if(wr >= lo && wr <= hi) break;
      }
    }
    if(best) r.suggest = best;
  });
}

// Suggested rarity for cards with none set: the rarity whose band centre is nearest the measured win rate.
const RAR_ORDER = ['starter','common','uncommon','rare','veryrare','superrare','epic','heroic','unique','legendary'];
rows.forEach(r=>{ if(r.rarity || r.winRate == null) return; const wr = r.winRate/100; let best = 'common', bd = 9;
  RAR_ORDER.forEach(k=>{ const [lo, hi] = BANDS[k], d = Math.abs(wr - (lo+hi)/2); if(d < bd){ bd = d; best = k; } }); r.suggestRarity = best; });
const out = {generated: new Date().toISOString().slice(0,10), games: N, mode: MODE, filler: FILLER, bands: BANDS,
  // 2026-11-07 (BAL22): how the numbers were made
  method: V3 ? {basic: 'k copies of the card + filler (with 2 Lumber cards) vs 20 filler, a random day/night and field per game; seeds 7700 + 131g',
    advanced: 'same test deck vs ' + ADV_MIX + ' cards from the top ' + Math.round(TOP * 100) + '% pool + the rest from every measured card (min(4, rarity copy limit) copies, top-rank caps), drawn per game',
    count: 'a game counts only if the test side played the card at least once (winRate / advRate over played games; winRateAll over all games)', lowSampleUnder: LOW_SAMPLE, workers: WORKERS,
    seconds: REPORT_ONLY ? null : {basic: Math.round(tBasic), total: Math.round((Date.now() - t0) / 1000)}} : {basic: 'k copies of the card + filler vs 20 filler; seeds 7700 + 131g', advanced: 'same test deck vs a 20-card deck drawn per game from the top pool (min(4, rarity copy limit) copies, top-rank caps)',
    count: 'a game counts only if the test side played the card at least once (winRate / advRate over played games; winRateAll over all games)', lowSampleUnder: LOW_SAMPLE, workers: WORKERS,
    seconds: REPORT_ONLY ? null : {basic: Math.round(tBasic), total: Math.round((Date.now() - t0) / 1000)}},
  advanced: pool ? {seed: SEED, topShare: TOP, poolCards: V3 ? ADV_MIX : 20, restFrom: advAll ? 'every measured Maps 0-20 card (' + advAll.length + ')' : null, poolFrom, pool, measured: LIVE.filter(id=> done.adv[id]).length, complete: LIVE.every(id=> done.adv[id]), matchSeeds: (SEED + 99991) + ' + 131g'} : null,
  rows};
if(V3){ out.v = 3; out.scope = {maxMap: SCOPE_MAX_MAP, rule: 'card-obtain-maps.json map <= ' + SCOPE_MAX_MAP + ', plus unlisted faction / Starter / Base-source cards', cards: LIVE.length};
  out.env = {phases: Object.fromEntries(PHASE_ROLL), fields: ROBUST ? 'tools/skill_test_robust.js FIELDS / FIELD_CONFIG (Day/Night replaced by the phase roll)' : 'none (skill_test_robust.js not loaded)'};
  out.fit = fitBudget(rows); }
fs.writeFileSync(path.join(OUT_DIR, OUT_NAME + '.json'), JSON.stringify(out, null, 1) + '\n');
// BAL25: a finished v3 run keeps its progress file, so --resume --report-only can re-fit the report without playing again
if(!V3 && LIVE.every(id=> done.basic[id] && (BASIC_ONLY || done.adv[id]))){ try{ fs.unlinkSync(PROG); }catch(e){} }
const cnt = v=> rows.filter(r=> r.verdict===v).length;
console.log(`${rows.length} cards, ${N} games each, ${((Date.now()-t0)/1000).toFixed(0)}s: ${cnt('strong')} too strong, ${cnt('weak')} too weak, ${cnt('ok')} in band`);
})().catch(e=>{ console.error(e); process.exit(1); });
