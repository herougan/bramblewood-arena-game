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
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const args = process.argv.slice(2);
const optv = (name, dflt)=>{ const a = args.find(x=> x.startsWith('--' + name + '=')); if(a) return a.slice(name.length + 3); const i = args.indexOf('--' + name); return i >= 0 && args[i+1] && !args[i+1].startsWith('--') ? args[i+1] : dflt; };
const N = +(args.find(a=> /^\d+$/.test(a) && args[args.indexOf(a)-1] !== '--workers' && args[args.indexOf(a)-1] !== '--seed') || 100);
const WORKERS = Math.max(1, +optv('workers', 2) || 1);
const SEED = +optv('seed', 2211);
const IS_WORKER = args.includes('--worker');
const BASIC_ONLY = args.includes('--basic-only');
const REPORT_ONLY = args.includes('--report-only');
const TOP_SHARE = 0.2, LOW_SAMPLE = 20;
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
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = atLevel1(d); });
// 2026-10-19 (package AN): pool cards ("pool": true, unplaced candidates) are measured only when asked for: --only=<ids>, or --pool
// for every pool card (written to the partial report like --only); the full report stays the live cards'.
if(args.includes('--pool')) Object.keys(defs).forEach(id=>{ if(defs[id].pool && !ONLY.includes(id)) ONLY.push(id); });
const fieldable = Object.keys(defs).filter(id=> !defs[id].token && !defs[id].test && !defs[id].hallOfFame && !defs[id].baseId && !defs[id].field && (!defs[id].pool || ONLY.includes(id))) // field cards are situational: measured in themed decks instead (fields-and-day-night-2026-10-09.md).sort();

// The reference: a mid-strength mix (two plain cost-0 units, a flyer, a cost-1 tank and a poisoner)
// picked from a first pass so an average card lands near 50% and strong cards still have room to
// show (against plain filler anything decent won ~98%). Both decks share it, so only the tested card
// differs.
const FILLER = ['warren-scout', 'fawn-scout', 'bee-sentry', 'mouse-sapper', 'poison-dart-croaker'].filter(id=> defs[id]);
// 2026-10-13: the filler is the yardstick, so it stays as it was measured on 2026-10-09: printed stats (no Level 1 step) and none
// of the later situational traits (Swimmer etc.), or every new trait on a filler card would move every card's score.
const RAW = {}; cards.forEach(c=>{ RAW[c.id] = c; });
FILLER.forEach(id=>{ const d = Object.assign({effects:{}}, RAW[id]); delete d.art; d.effects = Object.assign({}, d.effects); ['swimmer','tailwind','headwind','darksight','dry'].forEach(k=> delete d.effects[k]); defs[id] = d; });
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
function advDeck(pool, id, k){
  const ids = pool.filter(x=> x !== id && defs[x]), rnd = E.mulberry32(SEED * 7919 + k * 104729);
  for(let i = ids.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); const t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
  const deck = {}; let n = 0;
  for(const x of ids){ if(n >= 20) break; let c = Math.min(copyCap(defs[x]), 20 - n);
    if(BB && BB.deckRankBlock){ while(c > 0){ const probe = Object.assign({}, deck); probe[x] = (probe[x]||0) + c - 1; if(!BB.deckRankBlock(probe, x, defs, [])) break; c--; } }
    if(c > 0){ deck[x] = c; n += c; } }
  return n >= 20 ? deck : null;
}
// The test: N games of (k copies of the card + filler) against the filler (basic) or against advDeck (advanced, pool given).
// Seats alternate; a game counts only if the test side played the card at least once.
function measure(id, over, pool){
  const D = over ? Object.assign({}, defs, {[id]: Object.assign({}, defs[id], over)}) : defs;
  // Expensive cards can't be played eight times a match, so the test deck carries fewer of them.
  const k = COPIES_BY_COST[Math.min(3, defs[id].cost||0)];
  const deck = fillerDeck(20 - k); deck[id] = (deck[id]||0) + k;
  let w = 0, wAll = 0, played = 0, games = 0;
  for(let g=0; g<N; g++){
    const opp = pool ? advDeck(pool, id, g) : OPP; if(!opp) continue;
    const r = E.simulateOneMatch(D, g%2 ? deck : opp, g%2 ? opp : deck, {rnd: E.mulberry32((pool ? SEED + 99991 : 7700) + g*131), maxRounds: 60, battleMode: MODE});
    const mine = g%2 ? 1 : 2, st = r.stats && r.stats[(mine === 1 ? 'A' : 'B') + '|' + id];
    const s = r.winner===mine ? 1 : r.winner===0 ? 0.5 : 0;
    games++; wAll += s;
    if(st && st.played > 0){ played++; w += s; }
  }
  return {games, played, wins: w, rate: played ? w / played : null, rateAll: games ? wAll / games : null};
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

const t0 = Date.now();
const LIVE = fieldable.filter(id=> !ONLY.length || ONLY.includes(id)).sort();
// ---- run the cards over WORKERS child processes, one card at a time; results saved line by line so --resume can pick up.
const PROG = path.join(ROOT, 'docs', 'balance', ONLY.length ? 'card-balance-partial-progress.jsonl' : 'card-balance-progress.jsonl');
const SETTINGS = {games: N, mode: MODE, seed: SEED, only: ONLY.slice().sort().join(','), filler: FILLER.join(',')};
const done = {basic: {}, adv: {}};
if(args.includes('--resume') && fs.existsSync(PROG)){
  const lines = fs.readFileSync(PROG, 'utf8').split('\n').filter(Boolean).map(l=>{ try{ return JSON.parse(l); }catch(e){ return null; } }).filter(Boolean);
  if(lines[0] && JSON.stringify(lines[0].settings) === JSON.stringify(SETTINGS)) lines.slice(1).forEach(l=>{ if(l.phase && l.id) done[l.phase][l.id] = l.m; });
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
  return ok.slice(0, Math.max(1, Math.round(ok.length * TOP_SHARE))).map(x=> x.id).sort();
}

(async ()=>{
await runPhase('basic', LIVE);
const tBasic = (Date.now() - t0) / 1000;
let pool = null, poolFrom = null;
if(!BASIC_ONLY){
  if(!ONLY.length){ pool = topPool(LIVE.map(id=> ({id, rate: done.basic[id].rate, played: done.basic[id].played}))); poolFrom = 'this run (basic pass)'; }
  else { const prev = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'card-balance.json'), 'utf8'));
    pool = topPool((prev.rows || []).map(r=> ({id: r.id, rate: r.winRate, played: r.played}))); poolFrom = 'docs/balance/card-balance.json (' + prev.generated + ', ' + prev.games + ' games)'; }
  await runPhase('adv', LIVE, pool);
}
const rows = LIVE.filter(id=> done.basic[id]).map(id=>{
  const d = defs[id], b = done.basic[id], a = done.adv[id], wr = b.rate, [lo, hi] = bandOf(d);
  const verdict = wr == null ? 'unplayed' : wr > hi ? 'strong' : wr < lo ? 'weak' : 'ok';
  return {id, name:d.name, rarity:d.rarity || null, cost:d.cost||0, wait:d.wait||0, attack:d.attack||0, health:d.health||0,
    skills:Object.keys(d.effects||{}).filter(k=> k!=='triggers').concat((d.effects.triggers||[]).length ? ['triggers'] : []),
    winRate: r1(wr), advRate: a ? r1(a.rate) : null, played: b.played, games: b.games, playedShare: b.games ? Math.round(b.played / b.games * 1000) / 1000 : 0,
    wins: b.wins, winRateAll: r1(b.rateAll), lowSample: b.played < LOW_SAMPLE || undefined,
    adv: a ? {played: a.played, games: a.games, playedShare: a.games ? Math.round(a.played / a.games * 1000) / 1000 : 0, wins: a.wins, rateAll: r1(a.rateAll), lowSample: a.played < LOW_SAMPLE || undefined} : undefined,
    band:[lo*100, hi*100], verdict, locked: !!d.locked, source: (d.source||{}).kind || 'base', startsAt0: !!d.startsAt0, budget: budgetV3(RAW[id]), note: d.startsAt0 ? 'measured at Lv 1 (starts at Lv 0: its first level is a major +10% step)' : undefined};
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
  method: {basic: 'k copies of the card + filler vs 20 filler; seeds 7700 + 131g', advanced: 'same test deck vs a 20-card deck drawn per game from the top pool (min(4, rarity copy limit) copies, top-rank caps)',
    count: 'a game counts only if the test side played the card at least once (winRate / advRate over played games; winRateAll over all games)', lowSampleUnder: LOW_SAMPLE, workers: WORKERS,
    seconds: REPORT_ONLY ? null : {basic: Math.round(tBasic), total: Math.round((Date.now() - t0) / 1000)}},
  advanced: pool ? {seed: SEED, topShare: TOP_SHARE, poolFrom, pool, measured: LIVE.filter(id=> done.adv[id]).length, complete: LIVE.every(id=> done.adv[id]), matchSeeds: (SEED + 99991) + ' + 131g'} : null,
  rows};
fs.mkdirSync(path.join(ROOT, 'docs', 'balance'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', ONLY.length ? 'card-balance-partial.json' : 'card-balance.json'), JSON.stringify(out, null, 1) + '\n');
if(LIVE.every(id=> done.basic[id] && (BASIC_ONLY || done.adv[id]))){ try{ fs.unlinkSync(PROG); }catch(e){} }
const cnt = v=> rows.filter(r=> r.verdict===v).length;
console.log(`${rows.length} cards, ${N} games each, ${((Date.now()-t0)/1000).toFixed(0)}s: ${cnt('strong')} too strong, ${cnt('weak')} too weak, ${cnt('ok')} in band`);
})().catch(e=>{ console.error(e); process.exit(1); });
