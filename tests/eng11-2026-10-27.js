#!/usr/bin/env node
// Package ENG11 (2026-10-27, the owner's 10-27 11:22 notes K2, K6, K10):
//   K2  Coffee N: every Nth round the unit acts it acts twice (one more swing, its shots twice), then it is Stunned a round.
//   K6  A dark fight (rules.dark) is night for Nocturnal / Diurnal, and a Nocturnal unit sees in the dark (the Vampire Bat in the caves).
//   K10 Scorching burns only by day; where the fight has no day or night it burns every round.
// Plus the price (canonical/skill-costs.json, 1.5 / N) and the texts in the 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects:effects||{}}, o||{});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'e11-coffee2': U('e11-coffee2', {coffee:2}, {attack:1, health:60}),
  'e11-coffee1-arrow': U('e11-coffee1-arrow', {coffee:1, arrow:1}, {attack:0, health:60}),
  'e11-wall': U('e11-wall', {}, {attack:0, health:200}),
  'e11-plain': U('e11-plain', {}, {attack:1, health:20}),
  'e11-day': U('e11-day', {diurnal:true}, {attack:1, health:20}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=> c && !c.gap);
const mk = (rules, seed)=>{ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
const round = (e, P, r)=>{ const ev = []; e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev); return ev; };

console.log('K2 Coffee N');
{ const {e, P} = mk({phase:'off'}); e.debugSpawnCard(P, so, 1, 'e11-coffee2', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'e11-wall', 'left', {}, []);
  const w = all(P[2])[0], c = all(P[1])[0]; const lost = [], kinds = [];
  for(let r = 1; r <= 6; r++){ const h0 = w.hp; const ev = round(e, P, r); lost.push(h0 - w.hp); kinds.push(ev.filter(x=> x.type === 'statusFx' && /^coffee/.test(x.kind)).map(x=> x.kind).join('+') || '-'); }
  ok(JSON.stringify(lost) === JSON.stringify([1, 2, 0, 1, 2, 0]), `Coffee 2 swings 1, 2 (coffee), 0 (stunned), 1, 2, 0 (got ${lost})`);
  ok(kinds[1] === 'coffee+coffeeCrash' && kinds[4] === 'coffee+coffeeCrash' && kinds[0] === '-' && kinds[2] === '-', `coffee and crash events on its coffee rounds (${kinds})`);
  ok(c.coffeeTurns === 4, `the stunned rounds don't count as turns (${c.coffeeTurns} turns in 6 rounds)`);
  ok(lost.reduce((a, b)=> a + b, 0) === 6, 'a cycle of N + 1 rounds holds as many actions as without Coffee (6 in 6)'); }
{ const {e, P} = mk({phase:'off'}); e.debugSpawnCard(P, so, 1, 'e11-coffee1-arrow', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'e11-wall', 'left', {}, []);
  const shots = [];
  for(let r = 1; r <= 4; r++){ const ev = round(e, P, r); shots.push(ev.filter(x=> x.type === 'arrow' && !x.snipe).length); }
  ok(shots[0] === 2 && shots[1] === 0 && shots[2] === 2 && shots[3] === 0, `Coffee 1 with Arrow: its shots go twice, then a stunned round (${shots})`); }
{ const {e, P} = mk({phase:'off'}); e.debugSpawnCard(P, so, 1, 'e11-coffee2', 'left', {}, []); const c = all(P[1])[0];
  ok(c.wait === 0 && !c.coffeeCrash, 'no Wait change and no old crash timer on play'); }
{ const SC = require('../tools/skill_costs.js'); const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const S = n=> T.budget(Object.assign({}, defs['e11-plain'], {effects:{coffee:n}})).S;
  ok(Math.abs(S(1) - 1.5) < 0.01 && Math.abs(S(2) - 0.75) < 0.01 && Math.abs(S(3) - 0.5) < 0.01, `priced 1.5 / N (S ${S(1)}, ${S(2)}, ${S(3)})`); }
{ const chip = base['buzzed-chipmunk']; ok(chip && chip.effects && chip.effects.coffee === 2 && chip.attack === 3 && chip.health === 14, 'Buzzed Chipmunk (Map 5) keeps Coffee 2 at 3/14 (re-fit: its line holds)'); }

console.log('K6 the dark places are night for Nocturnal / Diurnal');
{ const {e, P} = mk({dark:'dark', phase:'off'}); e.debugSpawnCard(P, so, 1, 'vampire-bat', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'e11-plain', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'e11-day', 'right', {}, []);
  e.debugSpawnCard(P, so, 2, 'e11-wall', 'left', {}, []); round(e, P, 1);
  const bat = all(P[1]).find(c=> c.defId === 'vampire-bat'), pl = all(P[1]).find(c=> c.defId === 'e11-plain'), dy = all(P[1]).find(c=> c.defId === 'e11-day');
  ok(e.getPhase() === null && e.zeitPhase() === 'night', `a cave has no day or night, but it is night for the time-givers (phase ${e.getPhase()}, zeit ${e.zeitPhase()})`);
  ok(e.darkMissOf(bat, 1, P) === 0, `the Vampire Bat (Nocturnal) sees in the cave's Darkness (miss ${e.darkMissOf(bat, 1, P)})`);
  ok((bat.phaseAtk || 0) === 1, `the Vampire Bat has its night bonus in the cave (+${bat.phaseAtk || 0} Attack)`);
  ok(e.darkMissOf(pl, 1, P) === 0.25, `a plain unit still misses 1 in 4 there (${e.darkMissOf(pl, 1, P)})`);
  ok(e.darkMissOf(dy, 1, P) === 0.25 && !(dy.phaseAtk > 0), `a Diurnal unit misses 1 in 4 and gets no day bonus there (miss ${e.darkMissOf(dy, 1, P)}, +${dy.phaseAtk || 0})`); }
{ const {e, P} = mk({dark:'pitch', phase:'off'}); e.debugSpawnCard(P, so, 1, 'vampire-bat', 'left', {}, []); round(e, P, 1); const bat = all(P[1])[0];
  ok(e.darkMissOf(bat, 1, P) === 0, 'and in Pitch Black (the Sunken Depths)'); }
{ const {e, P} = mk({phase:'cycle'}); e.debugSpawnCard(P, so, 1, 'vampire-bat', 'left', {}, []); round(e, P, 1); const bat = all(P[1])[0];
  ok(e.zeitPhase() === 'day' && !(bat.phaseAtk > 0), `out in the open by day nothing changes (zeit ${e.zeitPhase()}, +${bat.phaseAtk || 0})`); }
{ const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'); const m = src.match(/const DARK_MAPS = new Map\((\[.*?\])\);/);
  const dark = m ? JSON.parse(m[1].replace(/'/g, '"')) : []; ok(dark.length === 4 && dark.some(x=> x[0] === 'm4') && dark.some(x=> x[0] === 'mj' && x[1] === 'pitch'), `the dark maps: ${dark.map(x=> x.join(':')).join(', ')}`); }

console.log('K10 Scorching only by day');
{ const ticks = rules=>{ const {e, P} = mk(Object.assign({field:'heatwave'}, rules), 7); ['left','left','right','right'].forEach(l=>{ e.debugSpawnCard(P, so, 1, 'e11-wall', l, {}, []); e.debugSpawnCard(P, so, 2, 'e11-wall', l, {}, []); });
    const out = []; for(let r = 1; r <= 4; r++){ const ev = round(e, P, r); out.push((e.getPhase() || '-') + ':' + ev.filter(x=> x.type === 'fieldTick' && x.field === 'heatwave').length); } return out; };
  const cyc = ticks({phase:'cycle', phaseLen:1}), off = ticks({phase:'off'});
  ok(cyc.every(x=> x.startsWith('night') ? x.endsWith(':0') : !x.endsWith(':0')) && cyc.some(x=> x.startsWith('night')), `a day / night map: it burns by day, rests at night (${cyc})`);
  ok(off.every(x=> !x.endsWith(':0')), `no day or night: it burns every round (${off})`);
  const nt = ticks({phase:'night'}); ok(nt.every(x=> x.endsWith(':0')), `an always-night map: it never burns (${nt})`); }

console.log('texts');
{ const T = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'); const keys = ['ui.e11-coffee', 'ui.e11-coffee-codex', 'ui.e11-log-coffee', 'ui.e11-nocturnal-codex', 'ui.e11-diurnal-codex', 'ui.e11-fxx-dark', 'ui.e11-scorching1', 'ui.e11-scorching2', 'ui.e11-scorching3'];
  const en = keys.map(k=>{ const m = T.match(new RegExp('"' + k.replace(/[.-]/g, '\\$&') + '": ("(?:[^"\\\\]|\\\\.)*")')); return m ? JSON.parse(m[1]) : null; });
  ok(en.every(Boolean), 'the 9 texts are in bramblewood-texts.js');
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const miss = []; codes.forEach(c=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); en.forEach(t=>{ if(t && !p[t]) miss.push(c + ': ' + t.slice(0, 30)); }); });
  ok(!miss.length, `translated in all 12 packs${miss.length ? ' (missing ' + miss.slice(0, 4).join(' | ') + ')' : ''}`); }

console.log(fail ? `\n${fail} failed` : '\nall passed');
process.exit(fail ? 1 : 0);
