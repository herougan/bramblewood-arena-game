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
//   node tools/raid_completion_model.js measure [--n 20] [--decks 10,13,16,20] [--parts core] [--out FILE] [--set '{"weakenFloor":0.6}'] [--shield 50]
//   node tools/raid_completion_model.js cycle [--in FILE[,FILE2]] [--cycles 200] [--players 30,50,100,150,200,250] [--scale 0|1]
//     [--floor 30] [--standins 12] [--rate 0.35,0.85] [--bars 1000,10000,50000] [--target 0.5,0.2,0.01] [--target-elig 0.98,0.6,0.01] [--json]
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
// each player's share of their tickets used: uniform in RATE (35..85%, 60% on average; --rate lo,hi)
const RATE = String(arg('rate', '0.35,0.85')).split(',').map(Number);

function measure(){
  const sim = require('./raid_full_sim.js');
  const N = Number(arg('n', 20)), decks = String(arg('decks', Object.keys(SPREAD).join(','))).split(','), out = arg('out', DEF_OUT);
  const def = JSON.parse(JSON.stringify(RAIDS[0])), set = arg('set', null); if(set) def.tuning = Object.assign({}, def.tuning || {}, JSON.parse(set));
  // 2026-10-19 (package RB2, owner 16:22: "Raids can have special super-high health brambles. Maybe less than 420."): --castle N tries
  // another per-fight bramble Health on the outer parts (the arms and the tail; --core-castle N on the Core) without editing raids.json
  if(arg('castle', null) != null) def.parts.filter(p=> !(p.lockedUntil || []).length).forEach(p=>{ p.fight = Object.assign({}, p.fight, {castleHp: Number(arg('castle'))}); });
  if(arg('core-castle', null) != null) def.parts.filter(p=> (p.lockedUntil || []).length).forEach(p=>{ p.fight = Object.assign({}, p.fight, {castleHp: Number(arg('core-castle'))}); });
  // RB2 (owner 16:28: "make the raid very slightly harder"): --elders N tries another bossHpBonusMax (the elders' starting Health cap),
  // --stage-atk a,b another +Attack for the stages that have one (Enraged, Thrashing), in order
  if(arg('elders', null) != null) def.bossHpBonusMax = Number(arg('elders'));
  // 2026-10-19 (package MX, owner 22:47: "Add a shield value of 50 to the Raid"): --shield N tries another raid Shield (RaidM.raidShield; 0 = off)
  if(arg('shield', null) != null) def.shield = Number(arg('shield'));
  if(arg('stage-atk', null) != null){ const v = String(arg('stage-atk')).split(',').map(Number); let i = 0;
    (def.stages || []).forEach(s=> (s.rules || []).forEach(r=>{ if(r.bossAtk != null && i < v.length) r.bossAtk = v[i++]; })); }
  const castles = {}; def.parts.forEach(p=>{ castles[p.id] = (p.fight || {}).castleHp || 200; });
  const cells = {}, t0 = Date.now();
  const onlyParts = arg('parts', null) ? String(arg('parts')).split(',') : null;
  for(const d of decks) for(const p of def.parts.filter(q=> !onlyParts || onlyParts.includes(q.id))){
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
  const stageAtk = (def.stages || []).map(s=> (s.rules || []).reduce((t, r)=> t + (r.bossAtk || 0), 0));
  const same = prev && JSON.stringify(prev.meta.tuning) === JSON.stringify(def.tuning || {}) && JSON.stringify(prev.meta.castleHp || null) === JSON.stringify(castles)
    && prev.meta.bossHpBonusMax === def.bossHpBonusMax && JSON.stringify(prev.meta.stageAtk || null) === JSON.stringify(stageAtk) && (prev.meta.shield || 0) === RaidM.raidShieldMax(def); // RB2: and the same brambles, elders and stages (MX: and the same Shield; a file from before MX had none)
  const merged = {meta: {date: '2026-10-19', n: N, tuning: def.tuning || {}, scoring: def.scoring, bossHpBonusMax: def.bossHpBonusMax, castleHp: castles, stageAtk, shield: RaidM.raidShieldMax(def)}, cells: Object.assign({}, same ? prev.cells : {}, cells)};
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
    const deck = pickDeck(), rate = RATE[0] + (RATE[1] - RATE[0]) * rnd(); let F = 0; for(let t = 0; t < 16; t++) if(rnd() < rate) F++; F = Math.max(1, F);
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
  // the tiers over every participant-life (any fights): the share reaching each tier at --bars (default: the raid's own tiers), and with
  // --target s1,s2,s3 (shares measured on another world, e.g. the pre-RB code's run) the damage bar giving each share here
  const bars = String(arg('bars', [pr.damage, pr.strongDamage, pr.leadDamage].join(','))).split(',').map(Number), target = arg('target', null) ? String(arg('target')).split(',').map(Number) : null;
  const targetElig = arg('target-elig', null) ? String(arg('target-elig')).split(',').map(Number) : null;
  const tierShares = [['participant', pr.fights], ['competent', pr.strongFights], ['leading', pr.leadFights]].map(([k, f], i)=>{
    const reach = lives.filter(p=> p.fights >= f && p.nw >= bars[i]).length / Math.max(1, lives.length);
    const elig = lives.filter(p=> p.fights >= f), w = elig.map(p=> p.nw).sort((a, b)=> b - a);
    let barFor = null; if(target){ const want = Math.round(target[i] * lives.length); barFor = want <= 0 ? null : want > w.length ? 0 : w[want - 1]; }
    // --target-elig s1,s2,s3: the same, as shares of the lives with the tier's fights (the damage bar's own effect)
    let barForElig = null; if(targetElig){ const want = Math.round(targetElig[i] * w.length); barForElig = want <= 0 ? w[0] + 1 : want > w.length ? 0 : w[want - 1]; }
    return {tier: k, fights: f, bar: bars[i], sharePct: Math.round(reach * 1000) / 10, eligPct: Math.round(elig.filter(p=> p.nw >= bars[i]).length / Math.max(1, elig.length) * 1000) / 10,
      barForTarget: barFor, targetPct: target ? Math.round(target[i] * 1000) / 10 : null, barForElig, targetEligPct: targetElig ? Math.round(targetElig[i] * 1000) / 10 : null};
  });
  const fightsPerLife = lives.reduce((t, p)=> t + p.fights, 0) / Math.max(1, lives.length), perFight = lives.reduce((t, p)=> t + p.nw, 0) / Math.max(1, lives.reduce((t, p)=> t + p.fights, 0));
  return {meta, scale, floor, standIns, cycles: C, rows, tiers, tierShares, lives: lives.length, fightsPerLife: +fightsPerLife.toFixed(2), perFight: Math.round(perFight), medianNew: pctile(nw, 0.5), medianOld: pctile(old, 0.5),
    p90New: pctile(nw, 0.9), p99New: pctile(nw, 0.99)};
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
      console.log(`fights per participant-life ${out.fightsPerLife}; raid damage per fight ${out.perFight}; raid damage per life: median ${out.medianNew}, 90th ${out.p90New}, 99th ${out.p99New}`);
      out.tierShares.forEach(t=> console.log(`  ${t.tier.padEnd(12)} ${t.fights}+ fights and ${t.bar}+ damage: ${t.sharePct}% of participant-lives, ${t.eligPct}% of those with the fights${t.targetPct != null ? ` | for ${t.targetPct}%: ${t.barForTarget}` : ''}${t.targetEligPct != null ? ` | for ${t.targetEligPct}% of those with the fights: ${t.barForElig}` : ''}`));
    }
  }
}
module.exports = {oneCycle, cycle, measure, SPREAD, OUTER_SHARES, CORE_SHARES, oldContribution};
