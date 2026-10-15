#!/usr/bin/env node
// 2026-10-15 (evening, combat animations): front-end checks, no rule changes.
//   9  "The miss animation is skipping the attack animation" → a blindMiss gets a hit's beat in delayForEvent.
//  31  "The cleave effect should show a arc slash ... L/M/R ... separated by 0.2s" → cleavePlan groups side, strike, side.
//  29  "If they miss, it just says Evaded!" → the dodge callouts.
//   2  "Cards still sometime teleport to the left/right" → settleStrayBoardCards leaves live Flip targets alone; renderMatchUI
//      captures the cards' rects for renderBoard to glide from.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const fnSrc = name=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return null; let k = src.indexOf('{', i), d = 0;
  for(; k < src.length; k++){ const c = src[k]; if(c === '{') d++; else if(c === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return null; };
// cleavePlan, on real engine events: a Sweep attacker with units left and centre and an empty right slot
{ const ctx = {}; vm.createContext(ctx); vm.runInContext(fnSrc('cleaveIsSide') + '\n' + fnSrc('cleavePlan') + '\nthis.cleavePlan = cleavePlan; this.cleaveIsSide = cleaveIsSide;', ctx);
  const E = H.Engine, U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
  const defs = Object.assign({}, H.loadCardDefs(), {'p1-sweeper': U('p1-sweeper', {sweep:2}), 'p1-wall': U('p1-wall', {}, {attack:0})});
  let grouped = 0, tries = 0;
  for(let seed = 1; seed <= 6 && !grouped; seed++){ tries++;
    const eng = E.makeSimEngine(defs, H.seededRng(seed), {recordEvents:true, battleMode:'open'});
    const so = id=> id===1 ? 'A' : 'B', P = {1: eng.newPlayer(1, {}, null), 2: eng.newPlayer(2, {}, null)}, st = {};
    eng.debugSpawnCard(P, so, 1, 'p1-sweeper', 'left', st, []);
    eng.debugSpawnCard(P, so, 2, 'p1-wall', 'left', st, []); eng.debugSpawnCard(P, so, 2, 'p1-wall', 'left', st, []);
    const ev = []; eng.resolveCombat(P, so, st, ev, 1);
    const i = ev.findIndex(e=> ctx.cleaveIsSide(e)); if(i < 0) continue;
    const pl = ctx.cleavePlan(ev, i); if(!pl) continue; grouped++;
    ok(ev[pl.mi].type === 'hit' || ev[pl.mi].type === 'evaded', 'cleavePlan: the middle beat is the primary strike');
    ok(!ev[pl.mi].sweep, 'cleavePlan: the strike is not a side swing');
    ok(pl.ri > pl.mi && ctx.cleaveIsSide(ev[pl.ri]), 'cleavePlan: the third beat is the other side (hit, dodge or whoosh)'); }
  ok(grouped > 0, `cleavePlan grouped a Cleave (${tries} tries)`); }
ok(/else if\(ev\.type==='blindMiss'\) base = 900;/.test(src), 'a blind miss gets a full swing beat');
ok(/evasive: \{text:'Evaded!'/.test(src) && /swift:\s+\{text:'Evaded!'/.test(src), 'dodges read "Evaded!"');
ok(/flippingEls\.get\(String\(el\.getAttribute\('data-uid'\)\)\) === el/.test(fnSrc('settleStrayBoardCards') || ''), 'settleStrayBoardCards: live Flip targets are busy');
ok(/repaintBoardRects = hasGsap\(\) \? captureBoardCardRects\(\)/.test(fnSrc('renderMatchUI') || ''), 'renderMatchUI captures the cards before its repaint');
ok(/glideBoardCardFrom\(el, from\)/.test(fnSrc('renderBoard') || ''), 'renderBoard glides them from there when Flip can\'t');
ok(/castleFall = castleCrumble\(/.test(src) && /if\(castleFall\)\{ await castleFall;/.test(src), 'the end sign comes up while the castle crumbles');
const fx = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-skillfx.js'), 'utf8');
['evasiveDodgeHit', 'cleaveSwing', 'pounceOnto', 'windField', 'windFieldClear'].forEach(k=> ok(new RegExp('\\b' + k + '\\b[,}]').test(fx.slice(fx.indexOf('Object.assign(root.SkillFX'))), 'SkillFX.' + k + ' exported'));
console.log(fail ? `keywords-2026-10-15p1: ${fail} failure(s)` : 'keywords-2026-10-15p1: all passed');
process.exit(fail ? 1 : 0);
