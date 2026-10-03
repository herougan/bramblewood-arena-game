#!/usr/bin/env node
// Raid P1 model tests (bramblewood-raid.js + canonical/raids.json), plus a headless "community
// week": many simulated attempts with the real engine, checking pools, locks, stages, caps, rewards.
'use strict';
const path = require('path');
const H = require('./lib/harness.js');
const R = require(path.join(H.ROOT, 'bramblewood-raid.js'));
const RAIDS = require(path.join(H.ROOT, 'canonical', 'raids.json'));
const defs = H.loadCardDefs();
const failures = [];
const check = (ok, msg)=>{ if(!ok) failures.push(msg); };
const DAY = 24*3600*1000;
const raid = RAIDS[0];
const cycle = 2900; const start = cycle * R.CYCLE_MS;

// 1. definitions are valid
RAIDS.forEach(r=> R.validateRaid(r, defs).forEach(e=> failures.push(`${r.id}: ${e}`)));
check(R.validateRaid({id:'x', parts:[{id:'a', bars:1, barHp:10, lockedUntil:['b'], fight:{deck:{yeti:1}}}, {id:'b', bars:1, barHp:10, lockedUntil:['a'], fight:{deck:{yeti:1}}}]}, defs).some(e=> /loop/.test(e)), 'lock loops are not detected');

// 2. scoring caps
check(R.contributionFor(raid, 40, false)===40*raid.scoring.perInFightHp, 'perInFightHp conversion wrong');
check(R.contributionFor(raid, 10, false, {scoring:{perInFightHp:140}})===1400, 'per-part scoring override ignored');
check(R.contributionFor(raid, 9999, false)===5000, 'normal cap not applied');
check(R.contributionFor(raid, 10, true)===10000, 'overwhelm cap not applied');

// 3. locks, stand-ins, stages
const noStand = Object.assign({}, raid, {standIns:{perDayPct:0}});
let st = R.raidState(noStand, [], start + DAY, {cycle});
check(st.byId.core.locked && !st.byId.left.locked, 'core should start locked, tentacles open');
check(st.fraction===1 && !st.stage, 'fresh raid should be at 100% with no stage');
const kill = id=> ({raidId: raid.id, part: id, cycle, owner:'x', contribution: R.partTotal(raid.parts.find(p=>p.id===id)), at: start});
st = R.raidState(noStand, [kill('left'), kill('right')], start + DAY, {cycle});
check(st.byId.core.locked, 'core must stay locked while the tail stands');
st = R.raidState(noStand, [kill('left'), kill('right'), kill('tail')], start + DAY, {cycle});
check(!st.byId.core.locked, 'core should unlock once all three outer parts are down');
check(st.stage && st.stage.name==='Thrashing', `stage after the outer parts fall should be Thrashing, got ${st.stage && st.stage.name}`);
const nearly = Object.assign(kill('core'), {contribution: R.partTotal(raid.parts[3]) - 1000});
st = R.raidState(noStand, [kill('left'), kill('right'), kill('tail'), nearly], start + DAY, {cycle});
check(st.stage && st.stage.name==='Exposed' && R.fightFor(raid, st, 'core').stripAbilities, 'below 1% the raid should be Exposed and strip abilities');
// stand-ins: 12%/day on open parts, never touching locked ones, never exceeding the pool
st = R.raidState(raid, [], start + 3*DAY, {cycle});
check(st.byId.left.standIn === Math.floor(st.byId.left.total*0.36) && st.byId.core.standIn===0, 'stand-ins should wear open parts 12%/day and leave the locked core alone');
st = R.raidState(raid, [], start + 7*DAY - 1, {cycle});
check(st.parts.every(p=> p.remaining >= 0), 'pool went negative');
// other raids / cycles don't count
st = R.raidState(noStand, [Object.assign(kill('left'), {cycle: cycle-1}), Object.assign(kill('left'), {raidId:'other'})], start, {cycle});
check(st.byId.left.real===0, 'attempts from another cycle or raid leaked in');

check(R.fightFor(raid, R.raidState(noStand, [], start, {cycle}), 'left').rounds === 12, 'fight rounds should default to the raid fightRounds');

// 4. rewards: kill vs compensation, tiers
const att = [];
for(let i=0;i<100;i++) att.push({raidId: raid.id, part:'left', cycle, owner:'p'+i, contribution: 100 + i, at: start});
st = R.raidState(noStand, att, start + DAY, {cycle});
check(R.contributionTier(st, 'p99')==='top1' && R.contributionTier(st, 'p95')==='top10' && R.contributionTier(st, 'p0')==='participant' && R.contributionTier(st, 'nobody')===null, 'contribution tiers wrong');
check(R.claimableReward(noStand, st, 'p5', start + DAY)===null, 'nothing should be claimable mid-week while the raid stands');
const comp = R.claimableReward(noStand, st, 'p5', start + 8*DAY);
check(comp && comp.kind==='compensation' && comp.base.gold===160, `compensation should be 40% of the kill reward (got ${comp && comp.base.gold})`);
const killed = R.raidState(noStand, ['left','right','tail','core'].map(kill).concat([{raidId: raid.id, part:'left', cycle, owner:'p1', contribution:1, at:start}]), start + DAY, {cycle});
const kr = R.claimableReward(noStand, killed, 'p1', start + DAY);
check(killed.defeated && kr && kr.kind==='kill' && kr.base.gold===400, 'a felled raid should pay the kill reward right away');

// 5. community week with the real engine: every fight is scored within its cap
{
  const Engine = H.Engine;
  const attempts = [];
  let overwhelms = 0, fights = 0;
  for(let i=0;i<120;i++){
    const st2 = R.raidState(noStand, attempts, start + DAY, {cycle});
    const open = st2.parts.filter(p=> !p.locked && !p.defeated);
    if(!open.length) break;
    const part = open[i % open.length].id;
    const f = R.fightFor(raid, st2, part);
    const myDeck = Object.fromEntries(H.fieldableIds(defs).slice(i*3 % 200, i*3 % 200 + 10).map(id=> [id, 2]));
    const m = H.runMatch(myDeck, f.deck, {seed: 3000+i, maxRounds: f.rounds});
    // runMatch gives castles 100 HP; scale to the part's fight castle for scoring purposes
    const dealt = Math.round((100 - Math.max(0, m.players[2].hq.hp)) * f.castleHp / 100);
    const over = m.players[2].hq.hp <= 0;
    const c = R.contributionFor(raid, dealt, over);
    check(c <= (over ? 10000 : 5000) && c >= 0, `fight ${i}: contribution ${c} out of bounds`);
    if(over) overwhelms++;
    fights++;
    attempts.push({raidId: raid.id, part, cycle, owner:'p'+(i%40), contribution: c, at: start + i});
  }
  const end = R.raidState(noStand, attempts, start + DAY, {cycle});
  console.log(`  community week: ${fights} fights, ${overwhelms} overwhelms, raid at ${(end.fraction*100).toFixed(1)}%${end.stage ? ' — stage ' + end.stage.name : ''}`);
}

check(JSON.stringify(H.loadCardDefs())===JSON.stringify(defs), 'card defs mutated');
console.log(`raid: ${failures.length} failure(s)`);
failures.slice(0,20).forEach(f=> console.log('  FAIL '+f));
process.exit(failures.length ? 1 : 0);
