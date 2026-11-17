#!/usr/bin/env node
// 2026-11-16 (package COACH2, owner 23:38): no Diurnal / Nocturnal / Crepuscular lesson unless the fight has a day/night cycle (the phase pill's condition).
'use strict';
const fs = require('fs'), path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return ''; let i = app.indexOf('{', a), d = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return app.slice(a, i + 1); }
const defs = {owl:{effects:{nocturnal:[1,0]}}, cat:{effects:{}}};
const pills = new Function('getCardDefs', ['dayNightOn', 'matchPhaseMatters', 'matchHasPhaseCards', 'matchHasDefWhere', 'phasePillShows'].map(fnSrc).join('\n') + '\nreturn phasePillShows;')(()=> defs);
const row = ()=> ({left:[], center:[], right:[]});
const mk = (phase, mode)=> ({mode:'conquest', players:{1:{deck:['owl'], hand:[], graveyard:[], row:row()}, 2:{deck:['cat'], hand:[], graveyard:[], row:row()}},
  engine:{getPhase:()=> phase, getPhaseMode:()=> mode}});
ok(!pills(mk(null, null)), 'misty Map 0 (no phase), a nocturnal card in the deck: no tip');
ok(pills(mk('day', 'cycle')), 'a day/night fight: the tip shows');
ok(!pills(Object.assign(mk('day', 'cycle'), {mode:'tutorial'})), 'tutorial fight: no pill, no tip');
// the passive tip gates only the three skills; a skipped tip is never marked seen (its anchor is null, so the loop moves on)
ok(/dayNightLesson && !phasePillShows\(m\)\) \? null/.test(app), 'skill tips for diurnal / nocturnal / crepuscular anchor to null without the pill');
ok(/\^\(diurnal\|nocturnal\|crepuscular\)/.test(app), 'gate covers the Grant / Hp variants by prefix');
console.log(fail ? 'FAIL ' + fail : 'ok: coach2');
process.exit(fail ? 1 : 0);
