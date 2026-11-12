#!/usr/bin/env node
// Package PERF5 (2026-11-13, owner 23:47: #10 "Bolt effects are still laggy", #12 "Unit death and unit damage number and bramble damage number (onhits)
// have a small frame drop", #2 "look for other potential sources"). Static guardrails (no browser; run-all.sh runs this).
// Measuring: tools/perf/fx5_probe.js (one effect at a time in a live fight: --ab before.html, --firestacks, --fireprof), tools/perf/played_turn3.js.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), sfx = fs.readFileSync(path.join(ROOT, 'bramblewood-skillfx.js'), 'utf8'), css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const fn = (src, name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && !--d) return src.slice(i, k + 1); } return ''; };
// 1. the card defs stay built while a fight is live (the 1 s expiry rebuilt them, 5-8 ms, inside the next hit / number / death); a cloud edit drops them
ok(/setTimeout\(_cardDefsExpire, ms\)/.test(app) && /if\(live && _cardDefsCache\)\{ setTimeout\(_cardDefsExpire, 1000\); return; \}/.test(fn(app, '_cardDefsExpire')), '1. card defs kept while the fight is live');
ok(/^\s*invalidateCardDefs\(\);/m.test(fn(app, 'onCardsChanged').split('\n')[1] || ''), '1. onCardsChanged drops the card defs');
// 2. the Bolt's glob: droplets from a primed pool, the glob's centre from the tween (no box read and no fresh GSAP read per drip)
{ const g = fn(sfx, 'boltGlob'); ok(g && !/glob\.getBoundingClientRect/.test(g) && /prime\(\[glob\]\.concat\(more\(\)\)\)/.test(g) && /prime\(more\(\)\)/.test(g), '2. boltGlob drips from a primed pool'); }
// 3. the plain projectile (the Aimed Bolt's 🏹 and every generic throw) starts from the page's corner, and GSAP moves it without the CSS transition
ok(/\.projectile\{position:fixed; left:0; top:0;/.test(css), '3. .projectile has left / top 0');
ok(/p\.style\.transition = 'none';[^\n]*\n\s*gsap\.set\(p, \{x:startX-9/.test(fn(app, 'spawnProjectile')), '3. spawnProjectile turns the transition off under GSAP');
// 4. SoundKit keeps baked cues (tone / sweep / fnoise) and the hit's pitch jitter comes in steps, so its buffers are reused
ok(/const BAKED = new Map\(\), BAKED_MAX = 200;/.test(app) && /function bakedBuf\(c, key, make\)/.test(app), '4. the baked-cue cache exists');
ok(/playBuf\(c, bakedBuf\(c, 't' \+ freq/.test(fn(app, 'tone')) && /playBuf\(c, bakedBuf\(c, 's' \+ f0/.test(fn(app, 'sweep')) && /playBuf\(c, bakedBuf\(c, key, \(\)=> fnoiseBuf\(c, dur, o\)\)/.test(fn(app, 'fnoise')), '4. tone, sweep and fnoise play cached buffers');
ok(/const j = 0\.92 \+ Math\.floor\(Math\.random\(\)\*9\)\*0\.02;/.test(app), '4. hitAt jitters in 2% steps');
ok(!/function playBaked\(/.test(app), '4. no per-cue buffer copy left');
// 5. fitted damage numbers are measured together at the end of the task (one layout for a splash's numbers)
{ const f = fn(app, 'floatText'); ok(/if\(o\.fit\) dnFitBatch\(el, f, place\); else place\(\);/.test(f) && /function place\(cw, fw\)/.test(f), '5. floatText defers the fit to dnFitBatch'); }
ok(/queueMicrotask\(flush\)/.test(fn(app, 'dnFitBatch')) && /n\.isConnected \? \[e\.offsetWidth/.test(fn(app, 'dnFitBatch')), '5. dnFitBatch reads every number before starting any');
// 6. a death: the skull's float is its CSS animation (no GSAP read of a hidden skull); the leaves and the dust skip GSAP's display probe
{ const d = fn(app, 'deathVfx'); ok(!/fromTo\(skull/.test(d) && (d.match(/gsap\.delayedCall\(death\/1000, \(\)=> skull\.remove\(\)\)/g) || []).length === 2, '6. no GSAP tween on the skull'); }
ok(/ps\.push\(fxShown\(p\)\)/.test(fn(app, 'leafPuff')) && /document\.body\.appendChild\(fxShown\(d\)\)/.test(fn(app, 'impactDust')) && /function fxShown\(e\)/.test(app), '6. leaves and dust are marked shown');
{ const f = fn(app, 'fallDeathVfx'); ok(f.indexOf('fix3GsapPrime(parts)') > 0 && f.indexOf('fix3GsapPrime(parts)') < f.indexOf("el.classList.add('falling')") && /x\.style\.filter = 'grayscale\(0\) brightness\(1\)'/.test(f), '6. fallDeathVfx reads before it writes'); }
// 7. ANIM1's leftover: a raid ally's card counts as in the air during its 170 ms rise (the 200 ms watchdog left it visible: a flash)
{ const a = fn(app, 'allyPlayFx'); ok(/handFlightsLive\.add\(String\(uid\)\)/.test(a) && /setTimeout\(\(\)=>\{ handFlightsLive\.delete\(String\(uid\)\);/.test(a), '7. allyPlayFx holds the card hidden through the rise'); }
// 8. fixed pieces GSAP moves are marked shown (no display probe: two style passes and a layout each): feathers, the hand flight's copy, the projectile, StoryUI's bubbles
ok(/ps\.push\(fxShown\(p\)\)/.test(fn(app, 'featherBurst')) && /fix3GsapPrime\(ps\)/.test(fn(app, 'featherBurst')), '8. featherBurst: feathers in first, shown, read together');
ok(/document\.body\.appendChild\(fxShown\(p\)\)/.test(fn(app, 'handFlightProxy')) && /document\.body\.appendChild\(fxShown\(p\)\)/.test(fn(app, 'spawnProjectile')), '8. the hand flight copy and the projectile are shown');
ok(/Object\.defineProperty\(b, 'offsetParent', \{value: document\.body, configurable: true\}\);[^\n]*\n\s*g\.set\(b, \{transformOrigin:'50% 100%'\}\)/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-ui-story.js'), 'utf8')), '8. StoryUI.bubble marks its bubble shown');
// 9. skillfx's prime copies opacity inline (all reads, then all writes), so a batch's sets read it there
ok(/const op = els\.map\(e=>\{ try\{ return e\.style\.opacity \? null : getComputedStyle\(e\)\.opacity;/.test(sfx) && /els\.forEach\(\(e, i\)=>\{ if\(op\[i\] != null\) e\.style\.opacity = op\[i\]; \}\)/.test(sfx), '9. prime copies opacity inline');
// 10. tonight's work: UIFX2's season change and travel prints read their pieces together; UIFX3's letters hold at .999 until the line is done
{ const w = fs.readFileSync(path.join(ROOT, 'bramblewood-ui-world.js'), 'utf8'); ok(/flourish\(rec, L, k,/.test(w) && /primeAll\(\[\.\.\.L\.children\]\); q\.forEach\(\(\[m, a\]\)=> tl\[m\]\(\.\.\.a\)\);/.test(w) && /primeAll\(prints\);/.test(w), '10. UIFX2: flourish pieces and prints primed in one pass'); }
{ const st = fs.readFileSync(path.join(ROOT, 'bramblewood-ui-story.js'), 'utf8'); ok(/\.sty-tw i\{font-style:inherit; animation:styCh \.13s linear var\(--d, 0ms\) both;\}/.test(st) && /@keyframes styCh\{from\{opacity:0;\} to\{opacity:\.999;\}\}/.test(st) && /\.sty-tw\.is-done i, \.sty-tw\.is-done \.sty-em\{animation:none;\}/.test(st), '10. UIFX3: a typed letter keeps its layer until the line is done'); }
// 11. the probe ships
ok(fs.existsSync(path.join(ROOT, 'tools/perf/fx5_probe.js')) && fs.existsSync(path.join(ROOT, 'tools/perf/feat5_ab.js')), '11. tools/perf/fx5_probe.js and feat5_ab.js exist');
console.log(`perf5-2026-11-13: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
