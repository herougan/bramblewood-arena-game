#!/usr/bin/env node
// The raid's completion model (2026-10-19, package RB, owner 12:23: "The goal is that, >90% of the time, the raid should complete with
// any player base that has unlocked the raid and participated. I believe a normal deck should be able to deal >100 damage.").
// Two steps, built on tools/raid_full_sim.js (the page's own raid fight, CPU v CPU):
//   1. measure: the bramble damage per raid fight of the reference decks (WINRATE_REF_DECKS / referencePlayerDeck at their map's
//      level; Map 13 is where the Raid Banner opens) against each part, at several points of the raid (the part's remaining share,
//      which sets the stage, the elders' Health and the boss's weakening), with the boss's 3 plays a turn. Cached as JSON.
//   2. cycle: N participants (30..250) in one instance for a week: each with the ticket budget (cap 10, +1 a day, the weekly
//      top-up, 1 ticket a fight), a play rate (each player's share of tickets used, uniform 35..85%, 60% on average) and a deck
//      drawn from the spread; each fight draws a measured result for that deck, part and share; the stand-ins (standIns.perDayPct)
//      wear the open parts down as raidState does; a fallen raid returns 24 h later (respawnHours). Completion = the first life
//      falls inside the week. Also: each participant-life's raid damage on the new scale and on the old x15 scale (for the tiers).
//   node tools/raid_completion_model.js measure [--n 20] [--decks 10,13,16,20] [--out FILE] [--set '{"weakenFloor":0.6}']
//   node tools/raid_completion_model.js cycle [--in FILE[,FILE2]] [--cycles 200] [--players 30,50,100,150,200,250] [--scale 0|1]
//     [--floor 30] [--standins 12] [--json]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (k, d)=>{ const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const CMD = process.argv[2] || 'cycle';
const RAIDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8'));
const RaidM = require(path.join(ROOT, 'bramblewood-raid.js'));
const DEF_OUT = path.join(ROOT, 'docs', 'balance', 'raid-balance-2026-10-19-fights.json');
// where in the raid a fight is measured: the part's remaining share (s1 fresh .. s0.05 nearly down)
const OUTER_SHARES = [1, 0.75, 0.5, 0.25, 0.05], CORE_SHARES = [1, 0.5, 0.1];
// the deck spread of the raiders (the road's reference decks at their map's level): weak, normal (Map 13, the Raid Banner), good, strong
const SPREAD = {10: 0.2, 13: 0.4, 16: 0.25, 20: 0.15};

function measure(){
  const sim = require('./raid_full_sim.js');
  const N = Number(arg('n', 20)), decks = String(arg('decks', Object.keys(SPREAD).join(','))).split(','), out = arg('out', DEF_OUT);
  const def = JSON.parse(JSON.stringify(RAIDS[0])), set = arg('set', null); if(set) def.tuning = Object.assign({}, def.tuning || {}, JSON.parse(set));
  const cells = {}, t0 = Date.now();
  for(const d of decks) for(const p of def.parts){
    const core = (p.lockedUntil || []).length;
    for(const s of core ? CORE_SHARES : OUTER_SHARES){
      const list = [];
      for(let g = 0; g < N; g++){ const r = sim.playOne(def, p.id, 's' + s, d, g); list.push({dealt: r.dealt, ow: r.overwhelmed ? 1 : 0, rank: r.rank || null, surv: r.survived}); }
      cells[d + '|' + p.id + '|' + s] = list;
      const avg = list.reduce((t, x)=> t + x.dealt, 0) / N;
      process.stdout.write(`${d} ${p.id} s${s}: ${avg.toFixed(0)} bramble, wins ${list.filter(x=> x.ow).length}/${N}  (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
    }
  }
  const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null;
  const merged = {meta: {date: '2026-10-19', n: N, tuning: def.tuning || {}, scoring: def.scoring, bossHpBonusMax: def.bossHpBonusMax}, cells: Object.assign({}, prev && JSON.stringify(prev.meta.tuning) === JSON.stringify(def.tuning || {}) ? prev.cells : {}, cells)};
  fs.writeFileSync(out, JSON.stringify(merged));
  console.log('wrote', path.relative(ROOT, out), Object.keys(merged.cells).length, 'cells');
}

// ---- the cycle ----
function rngOf(seed){ let s = seed >>> 0; return ()=>{ s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const OLD = {perInFightHp: 15, corePerHp: 140, cap: 5000, overwhelmCap: 10000}; // the x15 scale (before 2026-10-19, package RB)
function oldContribution(x, core){
  if(x.ow) return OLD.overwhelmCap;
  return Math.min(OLD.overwhelmCap, Math.round(Math.min(OLD.cap, Math.round(x.dealt * (core ? OLD.corePerHp : OLD.perInFightHp))) * RaidM.raidRankMult(x.rank)));
}
function loadCells(){
  const files = String(arg('in', DEF_OUT)).split(','), cells = {}; let meta = null;
  files.forEach(f=>{ const j = JSON.parse(fs.readFileSync(path.resolve(f), 'utf8')); meta = meta || j.meta; Object.assign(cells, j.cells); });
  return {meta, cells};
}
function nearest(list, v){ return list.reduce((b, x)=> Math.abs(x - v) < Math.abs(b - v) ? x : b, list[0]); }
// One instance's week. opts: {players, rnd, scale (HP x max(floor, players)/cap), floor, standIns (% a day), cells}
function oneCycle(def, opts){
  const rnd = opts.rnd, H = 3600 * 1000, WEEK = 168, cap = RaidM.instanceCap(def);
  const hpMult = opts.scale ? Math.min(1, Math.max(opts.floor || 1, opts.players) / cap) : 1;
  const parts = def.parts.map(p=> ({id: p.id, total: Math.round(RaidM.partTotal(p) * hpMult), lockedUntil: p.lockedUntil || [], core: !!(p.lockedUntil || []).length}));
  const pct = (opts.standIns != null ? opts.standIns : ((def.standIns || {}).perDayPct || 0)) / 100;
  const deckKeys = Object.keys(SPREAD), wts = deckKeys.map(k=> SPREAD[k]);
  const pickDeck = ()=>{ let u = rnd(), i = 0; for(; i < wts.length - 1; i++){ u -= wts[i]; if(u < 0) break; } return deckKeys[i]; };
  // the players and their fights (hours into the week); fight i (0-based) needs i - 9 days of regen first (cap 10, +1 a day)
  const fights = [];
  for(let k = 0; k < opts.players; k++){
    const deck = pickDeck(), rate = 0.35 + 0.5 * rnd(); let F = 0; for(let t = 0; t < 16; t++) if(rnd() < rate) F++; F = Math.max(1, F);
    const times = Array.from({length: F}, ()=> rnd() * WEEK).sort((a, b)=> a - b).map((t, i)=> Math.max(t, i >= 10 ? (i - 9) * 24 + rnd() * 4 : 0)).sort((a, b)=> a - b);
    times.forEach(t=> fights.push({t, who: k, deck}));
  }
  fights.sort((a, b)=> a.t - b.t);
  let life = 0, lifeStart = 0, real = {}, downUntil = null; const lives = [], firstKill = {at: null};
  let perLife = {}; // who -> {nw, old, fights}
  const resetLife = t=>{ life++; lifeStart = t; real = {}; parts.forEach(p=> real[p.id] = 0); perLife = {}; };
  resetLife(0); life = 0;
  const stateAt = t=>{ // raidState's rules: stand-ins work on open parts for the days since the life began; locks open in order
    const days = Math.max(0, Math.min(7, (t - lifeStart) / 24)), st = {};
    let changed = true, guard = 0; parts.forEach(p=> st[p.id] = {standIn: 0});
    const empty = id=>{ const p = parts.find(x=> x.id === id); return p.total - real[id] - st[id].standIn <= 0; };
    while(changed && guard++ < 10){ changed = false; parts.forEach(p=>{ const open = p.lockedUntil.every(empty); const want = open ? Math.min(Math.max(0, p.total - real[p.id]), Math.floor(p.total * pct * days)) : 0; if(want !== st[p.id].standIn){ st[p.id].standIn = want; changed = true; } }); }
    let left = 0; parts.forEach(p=>{ const s = st[p.id]; s.remaining = Math.max(0, p.total - real[p.id] - s.standIn); s.open = p.lockedUntil.every(empty); s.share = s.remaining / p.total; left += s.remaining; });
    return {parts: st, left};
  };
  const endLife = (t, killed)=>{ lives.push({killed, at: t, start: lifeStart, players: Object.assign({}, perLife)}); if(killed && firstKill.at == null) firstKill.at = t; };
  // walk the week hour by hour (the stand-ins move with time) and the fights in order
  let fi = 0;
  for(let hour = 0; hour <= WEEK; hour++){
    if(downUntil != null && hour >= downUntil){ resetLife(downUntil); downUntil = null; }
    while(fi < fights.length && fights[fi].t < hour + 1 && fights[fi].t <= WEEK){
      const f = fights[fi++]; if(downUntil != null){ // the raid is down: the fight waits for its return (the ticket is kept)
        const nt = downUntil + rnd() * 12; if(nt < WEEK){ f.t = nt; let j = fi; while(j < fights.length && fights[j].t < nt) j++; fights.splice(j, 0, f); } continue; }
      const st = stateAt(f.t), open = parts.filter(p=> st.parts[p.id].open && st.parts[p.id].remaining > 0); if(!open.length) continue;
      const p = open[Math.floor(rnd() * open.length)], ps = st.parts[p.id];
      const shares = p.core ? CORE_SHARES : OUTER_SHARES, key = f.deck + '|' + p.id + '|' + nearest(shares, ps.share), list = opts.cells[key];
      if(!list) throw new Error('no measured cell ' + key);
      const x = list[Math.floor(rnd() * list.length)];
      const nw = RaidM.contributionFor(def, x.dealt, !!x.ow, def.parts.find(q=> q.id === p.id), x.rank), old = oldContribution(x, p.core);
      real[p.id] += nw;
      const me = perLife[f.who] || (perLife[f.who] = {nw: 0, old: 0, fights: 0}); me.nw += nw; me.old += old; me.fights++;
      if(stateAt(f.t).left <= 0){ endLife(f.t, true); downUntil = f.t + RaidM.respawnMs(def) / H; }
    }
    if(downUntil == null && stateAt(hour).left <= 0){ endLife(hour, true); downUntil = hour + RaidM.respawnMs(def) / H; }
  }
  if(downUntil == null) endLife(WEEK, false);
  return {completed: firstKill.at != null && firstKill.at <= WEEK, killAt: firstKill.at, kills: lives.filter(l=> l.killed).length, lives, hpMult};
}
function pctile(sorted, q){ if(!sorted.length) return 0; const i = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1)))); return sorted[i]; }
function cycle(){
  const {cells, meta} = loadCells(), def = JSON.parse(JSON.stringify(RAIDS[0]));
  const players = String(arg('players', '30,50,75,100,150,200,250')).split(',').map(Number), C = Number(arg('cycles', 200));
  const scale = arg('scale', '0') === '1', floor = Number(arg('floor', 30)), standIns = arg('standins', null) != null ? Number(arg('standins')) : null;
  const rows = [], tierRows = [];
  const pr = RaidM.participationRules(def);
  for(const n of players){
    let done = 0, killSum = 0, kills = 0; const all = [];
    for(let c = 0; c < C; c++){
      const r = oneCycle(def, {players: n, rnd: rngOf(0xC0FFEE + n * 7919 + c * 104729), scale, floor, standIns, cells});
      if(r.completed){ done++; killSum += r.killAt; } kills += r.kills;
      r.lives.forEach(l=> Object.values(l.players).forEach(p=> all.push(p)));
    }
    rows.push({players: n, completedPct: Math.round(done / C * 1000) / 10, avgKillDay: done ? +(killSum / done / 24).toFixed(2) : null, livesFallen: +(kills / C).toFixed(2)});
    tierRows.push({players: n, all});
  }
  // the tiers: the share of participant-lives (3+ fights) at the old x15 bars, and the new bars at the same shares
  const lives = tierRows.flatMap(r=> r.all), old = lives.map(p=> p.old).sort((a, b)=> a - b), nw = lives.map(p=> p.nw).sort((a, b)=> a - b);
  const share = (arr, v)=> arr.filter(x=> x >= v).length / Math.max(1, arr.length);
  const tiers = [['participant', 1000, pr.fights], ['competent', 10000, pr.strongFights], ['leading', 50000, pr.leadFights]].map(([k, oldBar, f])=>{
    const elig = lives.filter(p=> p.fights >= f), o = elig.map(p=> p.old).sort((a, b)=> a - b), w = elig.map(p=> p.nw).sort((a, b)=> a - b);
    const sh = share(o, oldBar), at = sh <= 0 ? w[w.length - 1] : pctile(w, 1 - sh);
    return {tier: k, fights: f, oldBar, oldShareOfEligible: Math.round(sh * 1000) / 10, newBarAtSameShare: at, eligible: elig.length};
  });
  return {meta, scale, floor, standIns, cycles: C, rows, tiers, lives: lives.length, medianNew: pctile(nw, 0.5), medianOld: pctile(old, 0.5)};
}
if(require.main === module){
  if(CMD === 'measure') measure();
  else { const out = cycle();
    if(process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
    else {
      console.log(`completion model: ${out.cycles} cycles per row, HP scaling ${out.scale ? 'on (floor ' + out.floor + ')' : 'off'}, stand-ins ${out.standIns != null ? out.standIns : 'raid'}%/day`);
      console.log('players  completed%  avg kill day  lives fallen/week');
      out.rows.forEach(r=> console.log(`${String(r.players).padStart(7)}  ${String(r.completedPct).padStart(9)}  ${String(r.avgKillDay).padStart(12)}  ${String(r.livesFallen).padStart(8)}`));
      console.log(`participant-lives ${out.lives}: median raid damage ${out.medianNew} (new) vs ${out.medianOld} (old x15)`);
      out.tiers.forEach(t=> console.log(`  ${t.tier.padEnd(12)} ${t.fights}+ fights: old bar ${t.oldBar} reached by ${t.oldShareOfEligible}% -> new bar at the same share: ${t.newBarAtSameShare}`));
    }
  }
}
module.exports = {oneCycle, cycle, measure, SPREAD, OUTER_SHARES, CORE_SHARES, oldContribution};
