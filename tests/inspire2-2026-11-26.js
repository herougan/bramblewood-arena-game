#!/usr/bin/env node
// 2026-11-26 (package INSPIRE2 + TEXTFIX1).
//   INSPIRE2 (owner 11-24 22:29 #18): Inspiration powers the unit's whole move (its shots and swings in one combat pass): Cleave's side hits,
//   every Arrow shot, an Archer's arrow, Twin Strike's second swing; it is spent as the pass ends once the move landed a hit; a unit that
//   did not act (Stunned, Frozen) keeps it; tokens an Inspiring unit gives it after it acted wait for its next move.
//   TEXTFIX1: a trigger saved without who / sub (Great Horned Owl, Cave Warlord: On Ready damage) read "Deal 4 damage to <<>>".
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-cleave': {id:'x-cleave', name:'Cleaver', attack:3, health:50, wait:0, cost:0, effects:{sweep:1}},
  'x-bow':    {id:'x-bow', name:'Bow', attack:3, health:50, wait:0, cost:0, effects:{arrow:2, arrowCount:2}},
  'x-archer': {id:'x-archer', name:'Archer', attack:0, health:50, wait:0, cost:0, effects:{archer:2}},
  'x-twin':   {id:'x-twin', name:'Twin', attack:3, health:50, wait:0, cost:0, effects:{twinStrike:true}},
  'x-hit':    {id:'x-hit', name:'Hit', attack:5, health:50, wait:0, cost:0, effects:{}},
  'x-insp1':  {id:'x-insp1', name:'Insp1', attack:1, health:50, wait:0, cost:0, effects:{inspiring:1}},
  'x-wall':   {id:'x-wall', name:'Wall', attack:0, health:500, wait:9, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };
const inspire = (c, k)=>{ c.inspTokens = k; c.inspired = k; };
// one move by a unit alone at the bramble: what the bramble lost, what tokens are left, the spend events
function atBramble(id, k, prep){ const {e, P} = mk(); const A = spawn(e, P, 1, id, 'left'); inspire(A, k); if(prep) prep(A); const hq = P[2].hq.hp, ev = [];
  e.debugAttack(P, so, A.uid, {}, ev); return {dmg: hq - P[2].hq.hp, left: A.inspTokens, leftAtk: A.inspired, spent: ev.filter(x=> x.type === 'statusFx' && x.kind === 'inspiredSpent'), ev}; }

// ---- Arrow: every shot carries it (was: only the swing)
{ const a0 = atBramble('x-bow', 0), a2 = atBramble('x-bow', 2);
  ok(a0.dmg === 7, `Arrow 2 x2 + a 3 swing, no Inspiration: 7 (${a0.dmg})`);
  ok(a2.dmg === 13, `with Inspiration 2: swing 3+2, two arrows 2+2 each = 13 (was 9) (${a2.dmg})`);
  ok(a2.left === 0 && a2.leftAtk === 0 && a2.spent.length === 1 && a2.spent[0].amount === 2 && a2.spent[0].tokens === 2, 'spent once, after the whole move (one inspiredSpent, +2, 2 tokens)'); }
// ---- Archer: its arrow carries it, and it is spent (was: no bonus, never spent)
{ const a0 = atBramble('x-archer', 0), a2 = atBramble('x-archer', 2);
  ok(a0.dmg === 2 && a2.dmg === 4, `Archer 2: 2 plain, 2+2 with Inspiration 2 (${a0.dmg}, ${a2.dmg})`);
  ok(a2.left === 0 && a2.spent.length === 1, 'the Archer spends it on its arrow'); }
// ---- Twin Strike: both swings carry it (was: the first only)
{ const a0 = atBramble('x-twin', 0), a2 = atBramble('x-twin', 2);
  ok(a0.dmg === 6 && a2.dmg === 10, `Twin Strike 3: 6 plain, (3+2) x2 = 10 with Inspiration 2 (was 8) (${a0.dmg}, ${a2.dmg})`);
  ok(a2.left === 0 && a2.spent.length === 1, 'spent once, after the second swing');
  const hits = a2.ev.filter(x=> x.type === 'hitHQ').length, iSp = a2.ev.findIndex(x=> x.kind === 'inspiredSpent'), iLast = a2.ev.map(x=> x.type).lastIndexOf('hitHQ');
  ok(hits === 2 && iSp > iLast, 'the spend comes after both hits'); }
// ---- Cleave: the side hits carry it (was: the main hit only)
{ const run = k=>{ const {e, P} = mk(); const A = spawn(e, P, 1, 'x-cleave', 'left'); spawn(e, P, 2, 'x-wall', 'left'); spawn(e, P, 2, 'x-wall', 'left'); spawn(e, P, 2, 'x-wall', 'left');
    inspire(A, k); const ev = []; e.debugAttack(P, so, A.uid, {}, ev); const hits = ev.filter(x=> x.type === 'hit');
    return {main: (hits.find(x=> !x.sweep) || {}).dmg, side: hits.filter(x=> x.sweep).map(x=> x.dmg), left: A.inspTokens}; };
  const c0 = run(0), c2 = run(2);
  ok(c0.main === 3 && c0.side.length >= 1 && c0.side.every(d=> d === 1), `Cleave 1, no Inspiration: main 3, side 1 (${JSON.stringify(c0)})`);
  ok(c2.main === 5 && c2.side.length === c0.side.length && c2.side.every(d=> d === 3), `with Inspiration 2: main 5, every side hit 1+2 = 3 (${JSON.stringify(c2)})`);
  ok(c2.left === 0, 'spent after the cleave'); }
// ---- did not act: Stunned / Frozen keep it
{ const s = atBramble('x-bow', 2, A=>{ A.stunned = 1; }), f = atBramble('x-hit', 2, A=>{ A.frozen = 1; });
  ok(s.dmg === 0 && s.left === 2 && s.leftAtk === 2 && !s.spent.length, `a Stunned unit (no swing, no shots) keeps its Inspiration (${s.left})`);
  ok(f.dmg === 0 && f.left === 2 && !f.spent.length, `a Frozen unit keeps it (${f.left})`); }
// ---- given after it acted: kept for its next move (a full round, left to right)
{ const {e, P} = mk(); const X = spawn(e, P, 1, 'x-hit', 'left'), I = spawn(e, P, 1, 'x-insp1', 'right'); inspire(X, 2);
  const hq = P[2].hq.hp, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const iX = ev.findIndex(x=> x.type === 'hitHQ' && x.attUid === X.uid), iG = ev.findIndex(x=> x.kind === 'inspired' && x.targetUid === X.uid);
  ok(iX >= 0 && iG > iX, 'the Inspiring unit acts after X this round');
  ok(hq - P[2].hq.hp === (5 + 2) + 1, `X hits for 5+2, the Inspiring unit for 1 (${hq - P[2].hq.hp})`);
  ok(X.inspTokens === 1 && X.inspired === 1, `X spends the 2 it used; the 1 given after it acted stays (${X.inspTokens} / +${X.inspired})`);
  const sp = ev.find(x=> x.kind === 'inspiredSpent' && x.attUid === X.uid); ok(sp && sp.tokens === 2 && sp.amount === 2 && sp.left === 1, 'the spend event says 2 spent, 1 left'); }
// ---- determinism: the same seed, the same events
{ const once = ()=> H.runBoard({seed: 11, rounds: 4, A:[{id:'x-insp1'}, {id:'x-bow'}, {id:'x-twin'}], B:[{id:'x-wall'}, {id:'x-cleave'}], defs}).events;
  ok(JSON.stringify(once()) === JSON.stringify(once()), 'a seeded board replays the same'); }
// ---- the code: what spends it
{ const eng = R('bramblewood-engine.js');
  ok(!/_inspHit/.test(eng) && /function inspSpendPass\(/.test(eng) && /inspSpendPass\(players, sideOf, events\); \/\/ INSPIRE2/.test(eng), 'the per-swing flag is gone; the pass spends it');
  ok(/damageCard\(side, sweepN \+ \(a\.att\.inspired\|\|0\), dmgType, null\)/.test(eng), "Cleave's side hit adds it"); }
{ const app = R('arena_app.js'); ok(/rc\.inspTokens = Math\.max\(0, \(rc\.inspTokens\|\|0\) - \(ev\.tokens\|\|0\)\)/.test(app), 'the board takes off what was spent (tokens given after it acted stay on the pip)'); }

// ---- texts: the rule as it reads now, 12 packs
{ const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
  ok(/every hit of their next turn/.test(TXT['ui.eng21-sk-inspiring']) && !/next hit/.test(TXT['ui.eng21-sk-inspiring']), 'the skill line: every hit of their next turn');
  ok(/every hit of its next turn/.test(TXT['ui.eng21-insp-tip']) && /every hit that turn/.test(TXT['ui.eng21-log-insp-spent']), 'the pip tip and the log line');
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  codes.forEach(c=>{ const p = J('lang/' + c + '.json'); const miss = ['ui.eng21-sk-inspiring', 'ui.eng21-insp-tip', 'ui.eng21-log-insp-spent'].filter(k=> !p[TXT[k]]); ok(!miss.length, `${c}: translated (${miss.join(', ')})`); }); }
{ const st = R('docs/project-state.md'); ok(/INSPIRE2/.test(st) && /every hit of the ally's next turn/.test(st), 'project-state has the INSPIRE2 rule'); }

// ---- TEXTFIX1: triggerPreviewText fills who / sub with the engine's defaults
{ const app = R('arena_app.js'), i = app.indexOf('function triggerPreviewText('); let d = 0, j = app.indexOf('{', i), src = '';
  for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}' && --d === 0){ src = app.slice(i, k + 1); break; } }
  const ctx = {TRIGGER_DEFS:[{key:'onReady', label:'On Ready'}, {key:'onSpawn', label:'On Play'}], TRIGGER_ALWAYS_ON:new Set(['onSpawn']),
    ACTION_DEFS:['damage', 'poison', 'buff', 'harden', 'stun', 'exile'].map(k=> ({key:k, label:k})), dmgWord: t=> t === 'physical' ? '' : t + ' ', EN6_BRAMBLE_ACTS:[], TX: k=> k, getCardDefs: ()=> ({})};
  vm.createContext(ctx); vm.runInContext(src + '\nthis.tpt = triggerPreviewText;', ctx); const tpt = ctx.tpt;
  const cards = J('canonical/cards.json'), owl = cards.find(c=> c.id === 'great-horned-owl'), warlord = cards.find(c=> c.id === 'cave-warlord');
  [owl, warlord].forEach(c=>{ const t = c && (c.effects.triggers || []).find(x=> x.do === 'damage' && !x.who); const s = t ? tpt(t) : '';
    ok(t && /deal \d+ damage to an adjacent opponent\.$/.test(s) && !/<<>>/.test(s), `${c ? c.name : '?'}: "${s}"`); });
  ok(/to all opponents/.test(tpt({on:'onSpawn', do:'damage', amount:2, target:'all'})) && /to a random opponent/.test(tpt({on:'onSpawn', do:'damage', amount:2, target:'random'})), 'the old target field reads as the engine reads it (all / random)');
  ok(/give itself \+1 Attack/.test(tpt({on:'onSpawn', do:'buff', amount:1})) && /stun an adjacent opponent/.test(tpt({on:'onSpawn', do:'stun'})), 'Buff defaults to itself, Stun to the unit facing it');
  ok(/give an ally/.test(tpt({on:'onSpawn', do:'damage', amount:1, who:'ally', sub:'random'})) === false && /to a random ally/.test(tpt({on:'onSpawn', do:'damage', amount:1, who:'ally', sub:'random'})), 'an explicit who / sub is unchanged'); }

console.log(`inspire2-2026-11-26: ${n} checks, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
