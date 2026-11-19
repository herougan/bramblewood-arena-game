#!/usr/bin/env node
// Package VFX2 (2026-11-19): pins each battle effect's hook (shield break burst and sounds, Bleed drip, the stunned turn's frozen clock, Mind Control's
// crossing, the exiled death's banish swirl), and runs Mind Control's replay row move (vfx2MindControlRows) in a vm. Frame strips:
// node tools/vfx2_strips_2026_11_19.js (docs/release/vfx2/); frame cost: node tools/perf/vfx2_ab_2026_11_19.js --ab <before.html>.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), fxa = rd('bramblewood-fx-a.js'), fxb = rd('bramblewood-fx-b.js'), fxc = rd('bramblewood-fx-c.js');
const has = (src, re, m)=> ok(re.test(src), m);

// 1. shield: a burst after VIS4's panes on a break; the unit's soak and break play the castle's two sounds
has(fxa, /M\.shieldBurst = function\(el, o\)/, '1. FX.A.shieldBurst exists');
has(fxa, /case 'shieldSoak':[^\n]*M\.shieldShatter\(t\);[^\n]*\n[^\n]*M\.shieldBurst\(t, \{speed:mSpeed\(env\)\}\)/, '1. a shield break plays shieldShatter (VIS4 panes), then shieldBurst');
has(app, /floatText\(el, ev\.left \? '💠 -' \+ ev\.soaked : '💠 Shield breaks', 'debuff'\);[^\n]*\n\s*try\{ ev\.left \? SoundKit\.shield\(\) : SoundKit\.iceShatter\(\); \}catch\(e\)\{\} \}, at\);/, '1. the soak / break sound plays with the float, at the blow');

// 2. Bleed applied: seven bigger drops
has(fxb, /\.fxb-drop\{position:absolute; width:10px; height:14px;/, '2. the Bleed drop is 10 x 14 px');
has(fxb, /const drops = bits\(box, 7,/, '2. seven drops');

// 3. Player Stun: the skipped turn's cue
has(fxa, /M\.frozenClock = function\(anchor, o\)/, '3. FX.A.frozenClock exists');
has(fxa, /M\.hooks\.turnSkipped = function\(side, env\)\{[\s\S]{0,200}document\.getElementById\('handStrip'\) : hq\(side\)[\s\S]{0,120}M\.frozenClock\(a, \{onFreeze:\(\)=> env\.sound\('freezeChime'\)\}\)/, '3. hooks.turnSkipped: the clock over your hand or the enemy castle, with freezeChime');
has(app, /if\(!m\.over\) \[1, 2\]\.forEach\(p=>\{ if\(\(m\.players\[p\]\.skipTurns\|\|0\) > 0\) fxHook\('turnSkipped', p===1 \? 'A' : 'B'\); \}\);/, '3. resolveRoundCore fires turnSkipped as a stunned side\'s turn opens');
{ const a = app.indexOf("fightSafe(()=> ui14TurnGlow(), 'ui14TurnGlow')"), b = app.indexOf("fxHook('turnSkipped'"); ok(a > 0 && b > a && b - a < 400, '3. right after the turn glow'); }

// 4. Mind Control: the row move before the batches, the crossing, no doubled mindWave
has(fxa, /M\.mindFlip = function\(el, o\)/, '4. FX.A.mindFlip exists');
has(fxa, /case 'mindControl': \{ const t = el\(ev\.targetUid\); if\(t\) M\.mindFlip\(t, \{uid:ev\.targetUid, from:ev\._fromRect \|\| null, caster:el\(ev\.attUid\), side:ev\.side, speed:mSpeed\(env\)\}\); break; \}/, '4. onEvent mindControl → mindFlip from ev._fromRect');
ok(!/case 'mindControl':[^\n]*puppetStrings/.test(fxa), '4. puppetStrings no longer plays in fights (Lab only)');
ok(!/ev\.type === 'mindControl' && F\.mindWave/.test(app), '4. the doubled SkillFX.mindWave is gone');
{ const a = app.indexOf('try{ vfx2MindControlRows(ev); }catch(e){}'), b = app.indexOf('try{ fxBatchVfx(ev); }catch(e){}'); ok(a > 0 && b > a && b - a < 200, '4. vfx2MindControlRows runs just before fxBatchVfx'); }
{ const a = app.indexOf('function vfx2MindControlRows(ev){'), b = app.indexOf('function renderVfxForEvent(ev){');
  ok(a > 0 && b > a, '4. vfx2MindControlRows is found');
  const rc = {e1:{slot:0}, e2:{slot:-1}, m1:{slot:0}, m2:{slot:1}}, rendered = [], sb = {
    matchState:{replayRows:{1:{left:[], center:['m1'], right:['m2']}, 2:{left:['e2'], center:['e1'], right:[]}}, replayCards:rc, battleMode:'open'},
    boardCardEl: u=> ({getBoundingClientRect: ()=> ({left:10, top:20, width:80, height:110, uid:u})}), isSlotMatch: m=> m.battleMode === 'open',
    SoundKit:{confuseWarble(){}}, renderBoard: o=> rendered.push(o) };
  vm.createContext(sb); vm.runInContext(app.slice(a, b) + '\nthis.f = vfx2MindControlRows;', sb);
  const ev = {type:'mindControl', side:'A', targetUid:'e1', slot:2}; sb.f(ev); const rr = sb.matchState.replayRows;
  ok(!rr[2].center.includes('e1') && rr[2].left.join() === 'e2', '4. the unit leaves the enemy row');
  ok(rr[1].center.join() === 'm1' && rr[1].right.join() === 'm2,e1', `4. it joins your row in slot order (right: ${rr[1].right.join()})`);
  ok(rc.e1.slot === 2 && ev._fromRect && ev._fromRect.uid === 'e1' && rendered.length === 1, '4. its slot, its old rect on the event, one redraw');
  sb.matchState.replayRows = null; const ev2 = {type:'mindControl', side:'B', targetUid:'m1', slot:-1}; sb.f(ev2);
  ok(rendered.length === 2 && ev2._fromRect, '4. when played (no replay rows) it redraws from the live rows, old rect kept');
  sb.f({type:'hit', targetUid:'m1'}); ok(rendered.length === 2, '4. other events are left alone'); }

// 5. Exiled death: the banish swirl
has(fxc, /M\.deathExile_C = function\(el, opts\)/, '5. FX.C.deathExile_C exists');
has(fxc, /if\(EXILED\.has\(String\(uid\)\)\) plan\.look = 'deathExile_C';/, '5. an exiled / nullified death plays deathExile_C');
ok(!/deathExile_C[\s\S]{0,900}filter:/.test(fxc.slice(fxc.indexOf('M.deathExile_C'), fxc.indexOf('M.deathExile_C') + 1400)), '5. the swirl uses transform and opacity (no filter on the card)');

// 6. speed: each new look plays faster with the replay
['mindFlip', 'frozenClock', 'shieldBurst'].forEach(k=>{ const i = fxa.indexOf('M.' + k + ' = function'); ok(i > 0 && /speedOf\(o\)/.test(fxa.slice(i, i + 600)), `6. ${k} reads opts.speed`); });

// 7. Effects Lab, inventory, catalogue, CHANGELOG
{ const lab = rd('tools/effects-lab/manifest/vfx2.js'); ['sk-shield-break', 'sk-stun-player', 'sk-mind-control', 'sk-exile-board'].forEach(id=> ok(new RegExp(`id:'${id}'[\\s\\S]{0,400}key:'V2'`).test(lab), `7. the Effects Lab plays ${id} (V2)`)); }
{ const inv = JSON.parse(rd('docs/effects-inventory-2026-10-15.json')), by = id=> inv.find(e=> e.id === id) || {};
  ['sk-shield-soak', 'sk-shield-break', 'st-poison-apply', 'st-bleed-apply', 'sk-stun-player', 'sk-mind-control', 'sk-exile-board', 'sk-explode', 'atk-ranged-projectile']
    .forEach(id=> ok(by(id).updated === '2026-11-19' && /^good/.test(by(id).quality || ''), `7. inventory ${id} re-rated 2026-11-19`)); }
has(rd('docs/effects-catalogue.md'), /## 2026-11-19 \(package VFX2\)/, '7. the catalogue has a dated VFX2 section');
has(rd('docs/CHANGELOG.md'), /## 2026-11-19 \(package VFX2/, '7. the CHANGELOG has a VFX2 entry');

console.log(`vfx2-2026-11-19: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0);
