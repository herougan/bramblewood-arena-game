#!/usr/bin/env node
// 2026-10-24 (package TT, owner 13:16 #4: "A tutorial for triggers."): static and logic checks that
//   1. the Triggers lesson is two coach steps (tl-what, tl-when), spotlighted gates that pause the fight, each with Next/Got it and Skip;
//   2. it comes after the guided steps and the Pitching lesson, before the passive tips, and never in the Tutorial, Sandbox, admin tests or the
//      Effects library; it needs a trigger chip in the hand or on the board (the enemy's first); it never repeats (coachSeen);
//   3. Skip ends the lesson and the two passive trigger tips; the replay clears them again;
//   4. it is a coach tip (coachOpen), so EN5's MAP-3 rule keeps map tiles open while it is up;
//   5. the second step names real trigger moments (TRIGGER_DEFS labels) and every text is a TX key translated in all 12 packs;
//   6. the Skill Codex has the replay button.
// The browser flow (first trigger card, Next, Skip, no repeat) is tests/e2e/tt_2026_10_24.py, shots in docs/screens/TT/.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const CODES = ['de','es','fr','id','it','ja','ko','pt','ta','tl','zh-Hans','zh-Hant'];
const packs = Object.fromEntries(CODES.map(c=> [c, Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')))]));

// --- 1. the steps
const lessonSrc = (src.match(/const TRIGGER_LESSON = \[[\s\S]*?\n\];/) || [''])[0];
// 2026-10-25 (package PL2, owner 00:02 #6): the lesson is ONE step now ("This chip is a trigger — read the card.", Got it); tl-when and
// the passive trig-off / trig-on tips are retired (marked seen with tl-what).
ok(/id:'tl-what'[^\n]*gate:true[^\n]*pause:true[^\n]*coach\.pl2-trigger/.test(lessonSrc) && !/id:'tl-what'[^\n]*next:true/.test(lessonSrc), '1. one step (tl-what): a spotlighted gate that pauses and reads "Got it"');
ok((lessonSrc.match(/\{id:/g) || []).length === 1, '1. exactly one step');
ok(/if\(id === 'tl-what'\) \['tl-when', 'trig-off', 'trig-on'\]/.test(src) && !/id:'trig-off'/.test(src), '1. the retired steps are marked seen with it and are no longer offered');
const show = fnSrc('showCoachTip');
ok(/tip\.block \|\| tip\.next \? 'Next/.test(show) && /if\(tip\.skip\)/.test(show) && /skipTriggerLesson\(\)/.test(show), '1. showCoachTip draws Next for a step that leads on and a Skip button that ends the lesson');
ok(!/tip\.skip[\s\S]{0,400}tutorialLock = /.test(show), '1. a lesson step never locks the fight (no tutorialLock)');
ok(/\.coach-skip-lesson\{pointer-events:auto/.test(tpl), '1. the Skip button takes clicks although the tip itself does not');

// --- 2. when
const maybe = fnSrc('maybeShowCoachTip');
const iG = maybe.indexOf('guidedStepActive'), iP = maybe.indexOf('pitchLessonTip(m)'), iT = maybe.indexOf('triggerLessonTip(m)'), iK = maybe.indexOf('peekGateTip(m)'), iC = maybe.indexOf('passiveTipCandidates()');
ok(iG > 0 && iG < iP && iP < iT && iT < iK && iK < iC, '2. order: guided steps, Pitching lesson, Triggers lesson, the peek gate, then the passive tips');
{
  let seen = new Set(), chip = null;
  const mk = ()=> new Function('coachSeen', 'triggerLessonChip', 'TRIGGER_LESSON', fnSrc('triggerLessonTip') + '\nreturn triggerLessonTip;')(seen, ()=> chip, [{id:'tl-what'}]);
  const f = mk(), m = (o)=> Object.assign({over:false, mode:'conquest'}, o || {});
  chip = null; ok(f(m()) === null, '2. no trigger chip in the hand or on the board: no lesson');
  chip = {}; ok(f(m()) && f(m()).id === 'tl-what', '2. the first trigger chip starts step 1');
  seen.add('tl-what'); seen.add('tl-when'); ok(f(m()) === null, '2. never repeated once seen (2026-10-25, PL2: one step)');
  seen.clear();
  ok(['tutorial', 'sandbox'].every(md=> f(m({mode: md})) === null), '2. not in the Tutorial or Sandbox');
  ok(f(m({adminTest: true})) === null && f(m({fxLib: true})) === null && f(m({over: true})) === null, '2. not in admin tests, the Effects library or after the fight');
  ok(f(null) === null, '2. no match, no lesson');
}
const chipSrc = fnSrc('triggerLessonChip');
ok(/#handStrip \[data-handuid\] \.ab-trig/.test(chipSrc) && /for\(const p of \[2, 1\]\)/.test(chipSrc) && /:not\(\.is-spent\)/.test(chipSrc), '2. the chip is found in the hand first, then the enemy row, then yours; a spent chip does not count');

// --- 3. skip and replay
{
  const seen = new Set(), marked = [];
  const skip = new Function('TRIGGER_LESSON', 'markCoachSeen', fnSrc('skipTriggerLesson') + '\nreturn skipTriggerLesson;')([{id:'tl-what'}], id=> { marked.push(id); seen.add(id); });
  skip(); ok(['tl-what', 'tl-when', 'trig-off', 'trig-on'].every(i=> seen.has(i)), '3. Skip ends the lesson and the two passive trigger tips');
  const cs = new Set(['tl-what', 'tl-when', 'trig-off', 'trig-on', 'wait']); const store = {};
  const rep = new Function('TRIGGER_LESSON', 'coachSeen', 'COACH_SEEN_KEY', 'localStorage', fnSrc('replayTriggerLesson') + '\nreturn replayTriggerLesson;')([{id:'tl-what'}], cs, 'k', {setItem: (k, v)=> { store[k] = v; }});
  rep(); ok(!cs.has('tl-what') && !cs.has('tl-when') && !cs.has('trig-off') && !cs.has('trig-on') && cs.has('wait') && JSON.parse(store.k).includes('wait'), '3. replay clears only the trigger tips and saves');
}

// --- 4. MAP-3
ok(/function tutorialLessonOn\(\)\{[^}]*coachOpen/.test(src), '4. an open coach tip counts as a lesson, so no map tile is held back (EN5 MAP-3)');
ok(!/lesson_triggers|DIALOGUES\.tl/.test(src), '4. the lesson is a coach tip, not an NPC dialogue');

// --- 5. texts
const TERMS = {'On Spawn': 1, 'On Attack': 1, 'On Hit': 1, 'On Attacked': 1, 'On Kill': 1, 'On Death': 1, 'On Turn Start': 1};
const labels = new Set([...src.matchAll(/\{key:'\w+', label:'(On [^']+)'/g)].map(m=> m[1]));
const when = TEXT['coach.tl-when'] || '', what = TEXT['coach.tl-what'] || '';
ok(Object.keys(TERMS).every(t=> labels.has(t) && when.includes(t)), '5. step 2 names real trigger moments: ' + Object.keys(TERMS).join(', '));
ok(/trigger/i.test(what) && what.includes('⚡'), '5. step 1 says what a trigger is and shows the chip\'s bolt');
for(const k of ['coach.tl-what', 'coach.tl-when', 'ui.tl-replay', 'ui.tl-replay-title', 'ui.tl-replay-toast']){
  const en = TEXT[k]; ok(!!en, '5. TX key ' + k);
  if(!en) continue;
  ok(CODES.every(c=> packs[c][en] && packs[c][en] !== en), '5. ' + k + ' is translated in all 12 packs');
}
ok(CODES.every(c=> packs[c]['Next ▶'] && packs[c]['Next ▶'] !== 'Next ▶' && packs[c]['Skip']), '5. the Next / Skip buttons are translated');
ok(CODES.every(c=> !/<\w+>/.test(packs[c][when] || '')), '5. no placeholder left in step 2');

// --- 6. replay place
ok(/id="tlReplayBtn"/.test(fnSrc('renderSkillBook')) && /replayTriggerLesson\(\)/.test(fnSrc('renderSkillBook')), '6. the Skill Codex has the Triggers lesson button');

console.log(fail ? `tt-2026-10-24: ${fail} of ${checks} checks FAILED` : `tt-2026-10-24: ${checks} checks passed`);
process.exit(fail ? 1 : 0);
