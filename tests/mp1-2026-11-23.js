#!/usr/bin/env node
// Package MP1 phase 2 (2026-11-23; decisions MP1-1 a, MP1-2 a, MP1-3 a; docs/design/mp1-2026-11-23.md section 4). Static and function-level checks:
//   1 the constants: the vault's part brambles x2, the CPU ally's stage-2 deck, the raid fight pay 24 / 95, the vault pay constants
//   2 PvP vs a stranger: the first strike alternates by round (the stranger strikes first in odd rounds only), you keep the +1 Shield
//   3 Live Ranked: the seat that strikes first in a round acts first (seat 2 in odd rounds, seat 1 in even), at the start and every round
//   4 the vault's daily rule: the day's first cleared run pays in full, later runs that day x0.2 (partial runs too), a new day resets
//   5 two human players x1.25 (on the full and the reduced pay); the vault UI line and its texts in 12 packs
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js');
const C = require(path.join(ROOT, 'bramblewood-coop.js'));
function fnSrc(name){
  const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = app.indexOf('{', a), depth = 0;
  for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return app.slice(a + 1, i + 1);
}

// ---- 1. constants
ok(C.DUNGEONS.hollow.floors.map(f=> f.castle).join('/') === '48/52/42/50/56', '1 the vault\'s part brambles are 48 / 52 / 42 / 50 / 56 (MP1-1 a, x2)');
ok(/Ghosts\.generateGhostDeck\(defs, 2, /.test(fnSrc('gdFillerDeck')), '1 the CPU ally plays a stage-2 ghost deck (MP1-1 a)');
ok(/const RAID_ATTEMPT_PAY = \{goldPer: 24, dustPer: 95\};/.test(app), '1 a raid fight pays 24 / 95 raid damage per Leaf / per 3 Dust (MP1 #6)');
ok(/const GD_FULL_PAY_PER_DAY = 1, GD_REPEAT_PAY_MULT = 0\.2, GD_DUO_PAY_MULT = 1\.25,/.test(app), '1 the vault pay constants 1 / 0.2 / 1.25 (MP1-2 a)');

// ---- 2. PvP vs a stranger
{ const core = app.slice(app.indexOf('\nasync function resolveRoundCore('), app.indexOf('\nasync function resolveRoundCore(') + 20000);
  ok(/m\.engine\.resolveCombat\(m\.players, m\.sideOf, m\.stats, events, m\.round%2===0 \? 1 : 2\)/.test(core) && !/m\.mode==='pvp' \? 2/.test(app), '2 resolveRound: the first strike alternates in every mode, PvP included (no "stranger every round")');
  const ini = new Function(fnSrc('initiativeSideOf') + '\nreturn initiativeSideOf;')();
  ok([1, 2, 3, 4].map(r=> ini({mode: 'pvp', round: r})).join('') === 'BABA', '2 the initiative coin in PvP: the stranger (B) in odd rounds, you (A) in even');
  ok(/const second = mode==='pvp' \? 1 : 2; engine\.applySecondPlayerBonus/.test(app), '2 you keep the +1 Shield against a stranger'); }

// ---- 3. Live Ranked act order
{ const lfs = new Function(fnSrc('liveFirstSeat') + '\nreturn liveFirstSeat;')();
  ok([1, 2, 3, 4].map(lfs).join('') === '2121', '3 liveFirstSeat: seat 2 in odd rounds, seat 1 in even (the strike side, round%2===0 ? 1 : 2)');
  ok(/mode:'liveRanked', active:liveFirstSeat\(1\),/.test(app), '3 a Live Ranked match starts with seat 2 to act (it strikes first in round 1)');
  const resets = app.match(/m\.active = m\.mode==='liveRanked' \? liveFirstSeat\(m\.round \+ 1\) : 1; \} \/\/ MP1-3\n\s*m\.round \+= 1;/g) || [];
  ok(resets.length === 2 && !/m\.mode==='liveRanked'\)\{ m\.turnDone = \{1:false, ?2:false\}; m\.active = 1; \}/.test(app), '3 both round ends hand the next round to its first striker (hot-seat pc keeps seat 1)'); }

// ---- 4 / 5. the vault's daily pay
{ const store = {}; let day = '2026-11-23';
  const ls = {getItem: k=> Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null, setItem: (k, v)=>{ store[k] = String(v); }};
  const src = app.slice(app.indexOf('const GD_FULL_PAY_PER_DAY'), app.indexOf('\nfunction gdPayLineHTML('));
  const P = new Function('localStorage', 'localDayKey', src + '\nreturn {gdFullPaysLeft, gdPayMult};')(ls, ()=> day);
  ok(P.gdFullPaysLeft() === 1, '4 a fresh day has one full-pay run');
  ok(P.gdPayMult(false, false) === 1 && P.gdFullPaysLeft() === 1, '4 a partial run before the day\'s first clear pays its band in full and uses nothing');
  ok(P.gdPayMult(true, false) === 1 && P.gdFullPaysLeft() === 0, '4 the day\'s first cleared run pays in full');
  ok(P.gdPayMult(true, false) === 0.2 && P.gdPayMult(false, false) === 0.2, '4 every later run that day pays x0.2 (a clear or a partial band)');
  ok(P.gdPayMult(true, true) === 0.25, '5 two human players: x1.25 on the reduced pay (0.2 x 1.25)');
  day = '2026-11-24';
  ok(P.gdFullPaysLeft() === 1 && P.gdPayMult(true, true) === 1.25 && P.gdFullPaysLeft() === 0, '4 / 5 a new day: the first clear pays in full again, x1.25 for two humans');
  const pf = fnSrc('gdPayFloor');
  ok(/gdPayMult\(run\.cleared, !!\(c && c\.size >= 2 && c\.humans === c\.size\)\)/.test(pf) && /gold: Math\.round\(run\.gold \* payMult\), dust: Math\.round\(run\.dust \* payMult\)/.test(pf), '4 / 5 gdPayFloor applies the multiplier to Leaves and Dust; the duo bonus needs every seat human');
  ok(/m && m\.adminWin \? 1 : gdPayMult/.test(pf), '4 an Admin win (paid nothing) does not use the day\'s full pay');
  ok(fnSrc('groupDungeonCardHTML').includes('gdPayLineHTML()') && fnSrc('gdLobbyHTML').includes('gdPayLineHTML()'), '5 the vault card and room show which run pays in full'); }

// ---- texts in 12 packs
{ const keys = {'ui.mp1-gd-pay-full': 'Your first clear today pays in full; later runs pay 20%. Two players: +25%.',
    'ui.mp1-gd-pay-used': "Today's full-pay clear is done: runs pay 20% until tomorrow. Two players: +25%."};
  Object.keys(keys).forEach(k=> ok(texts.includes(`"${k}": ${JSON.stringify(keys[k])}`), 'texts: TX key ' + k));
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const p = JSON.parse(rd('lang/' + c + '.json'));
    ok(Object.values(keys).every(en=> p[en] && p[en] !== en), 'texts: both rows translated in lang/' + c + '.json'); }); }

console.log(`mp1: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
