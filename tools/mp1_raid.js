#!/usr/bin/env node
// MP1 phase 1 (2026-11-23, owner 2026-11-22 23:08: "multiplayer features balancing"): the Goliath raid at its new gate. RAIDGATE (OWN-1119-1)
// moved the raid's opening from the Raid Banner on Map 13 to The Deep Dark after Map 21, but RAIDBAL1 (10-30) tuned it on Map 13 decks.
// Two steps, both on tools/raid_full_sim.js's playOne (the page's own buildRaidFullFight, two CPU allies, the boss's rows and specials):
//   cells   each deck x part x point of the raid (the part's remaining share, raid_completion_model's OUTER_SHARES / CORE_SHARES):
//           bramble damage, wins (the part's bramble destroyed in 20 turns), rank; saved as a raid_completion_model cell file
//   cycle   raid_completion_model's oneCycle (one instance's week: tickets, play rates, stand-ins, respawn) for each participant count,
//           with the cells' decks put in its four SPREAD slots (weights 0.2 / 0.4 / 0.25 / 0.15, weakest first)
//   node tools/mp1_raid.js cells --decks 21,22,23,24 --n 8 --out FILE [--shares all|s1,s0.5] [--g0 1000] [--edit JSON]
//   node tools/mp1_raid.js cycle --in FILE --decks 21,22,23,24 [--players 10,20,30,50,100] [--cycles 200]
// Decks: "<N>" = the Map N road reference (WINRATE_REF_DECKS.road) at referencePlayerLevel(N), raid_full_sim's myDeckFor; no leader.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (k, d)=>{ const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const sim = require('./raid_full_sim.js'), M = require('./raid_completion_model.js'), RaidM = require(path.join(ROOT, 'bramblewood-raid.js'));
const RAID = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/raids.json'), 'utf8'))[0];
const DECKS = String(arg('decks', '21,22,23,24')).split(',');
// --edit '{"castle":{"left":940,"core":200},"tuning":{"raiderCastleBonus":60}}': try values on the in-memory raid (canonical/raids.json unchanged)
{ const ed = arg('edit', null) ? JSON.parse(arg('edit')) : null;
  if(ed){ Object.keys(ed.castle || {}).forEach(id=>{ const p = RAID.parts.find(x=> x.id === id); p.fight = Object.assign({}, p.fight, {castleHp: ed.castle[id]}); });
    if(ed.tuning) RAID.tuning = Object.assign({}, RAID.tuning || {}, ed.tuning); } }
// "<N>+<k>": the Map N reference at referencePlayerLevel(N) + k (RAIDBAL1's owner rule W8: the unlock map's decks at +2 levels)
{ const G = require('./lib_bramble.js').G, extra = {};
  DECKS.filter(d=> /^\d+\+\d+(\.\d+)?$/.test(d)).forEach(d=>{ const [n, k] = d.split('+').map(Number), lvl = sim.A.referencePlayerLevel(n) + k;
    extra[d] = {parts: G.levelMixDeck(G.WINRATE_REF_DECKS.road[n], lvl), level: +lvl.toFixed(2)}; });
  sim.setDecks(extra); }
const SLOTS = Object.keys(M.SPREAD); // '10','13','16','20': the model's weights, weakest first

function cells(){
  const N = Number(arg('n', 8)), G0 = Number(arg('g0', 0)) /* fresh seeds: games g0 .. g0+n-1 */, out = arg('out'), only = arg('shares', 'all'), res = {}, t0 = Date.now();
  for(const d of DECKS) for(const p of RAID.parts){
    const core = (p.lockedUntil || []).length, shares = only === 'all' ? (core ? M.CORE_SHARES : M.OUTER_SHARES) : only.split(',').map(s=> Number(s.replace(/^s/, '')));
    for(const s of shares){
      const list = []; for(let g = G0; g < G0 + N; g++){ const r = sim.playOne(JSON.parse(JSON.stringify(RAID)), p.id, 's' + s, d, g); list.push({dealt: r.dealt, ow: r.overwhelmed ? 1 : 0, rank: r.rank || null, surv: r.survived, contribution: r.contribution, level: r.level}); }
      res[d + '|' + p.id + '|' + s] = list;
      const w = list.filter(x=> x.ow).length, c = list.reduce((t, x)=> t + x.contribution, 0) / N;
      console.log(`deck ${d} (Lv ${list[0].level}) ${p.id.padEnd(5)} s${s}: wins ${w}/${N} (${Math.round(w / N * 100)}%), bramble ${Math.round(list.reduce((t, x)=> t + x.dealt, 0) / N)}, raid damage ${Math.round(c)}, survived ${(list.reduce((t, x)=> t + x.surv, 0) / N).toFixed(1)} rounds  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  fs.writeFileSync(path.resolve(out), JSON.stringify({meta: {tool: 'tools/mp1_raid.js cells', date: '2026-11-23', n: N, decks: DECKS}, cells: res}));
  console.log('wrote', out);
}
function cycle(){
  const j = JSON.parse(fs.readFileSync(path.resolve(arg('in')), 'utf8')), cellsBySlot = {};
  if(DECKS.length !== SLOTS.length) throw new Error('need ' + SLOTS.length + ' decks (weakest first) for the model\'s SPREAD slots');
  Object.keys(j.cells).forEach(k=>{ const [d, p, s] = k.split('|'), i = DECKS.indexOf(d); if(i >= 0) cellsBySlot[SLOTS[i] + '|' + p + '|' + s] = j.cells[k]; });
  const players = String(arg('players', '10,20,30,50,100')).split(',').map(Number), C = Number(arg('cycles', 200));
  console.log(`decks ${DECKS.map((d, i)=> d + ' (' + Math.round(M.SPREAD[SLOTS[i]] * 100) + '%)').join(', ')}; ${C} weeks a row; stand-ins ${(RAID.standIns || {}).perDayPct}%/day; respawn ${RaidM.respawnMs(RAID) / 3600000} h`);
  console.log('players  falls in week%  first fall day  falls/week  fights/player  raid dmg/fight');
  const def = JSON.parse(JSON.stringify(RAID));
  for(const n of players){
    let done = 0, day = 0, kills = 0, fights = 0, dmg = 0, lives = 0;
    for(let c = 0; c < C; c++){
      let s = (0xC0FFEE + n * 7919 + c * 104729) >>> 0; const rnd = ()=>{ s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const r = M.oneCycle(def, {players: n, rnd, scale: false, floor: 30, standIns: null, cells: cellsBySlot});
      if(r.completed){ done++; day += r.killAt / 24; } kills += r.kills;
      r.lives.forEach(l=> Object.values(l.players).forEach(p=>{ fights += p.fights; dmg += p.nw; lives++; }));
    }
    console.log(`${String(n).padStart(7)}  ${String(Math.round(done / C * 1000) / 10).padStart(13)}  ${String(done ? (day / done).toFixed(2) : '-').padStart(14)}  ${String((kills / C).toFixed(2)).padStart(10)}  ${String((fights / Math.max(1, lives)).toFixed(1)).padStart(13)}  ${String(Math.round(dmg / Math.max(1, fights))).padStart(14)}`);
  }
}
({cells, cycle})[process.argv[2] || 'cells']();
