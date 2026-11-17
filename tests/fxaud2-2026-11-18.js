#!/usr/bin/env node
// Package FXAUD2 (2026-11-18): the fix list of the effects and sound audit (docs/perf/fxaud1-2026-11-18.md, "Fix list by file"). Static checks plus the
// pure mark-cue functions run in a vm. The browser gates (no Shocked / armour cue on a Vulnerable / Feeble hit, no particles at Effects None or hidden,
// no audio while hidden or muted, the powder cue at None): python3 tests/e2e/fxaud2_gates.py (listed under --e2e).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), fxh = rd('bramblewood-fx-h.js'), fxa = rd('bramblewood-fx-a.js'), skfx = rd('bramblewood-skillfx.js'), tpl = rd('arena_template.html');
const has = (src, re, m)=> ok(re.test(src), m);
const cueDef = k=> new RegExp('\\n\\s+' + k + '\\(\\)\\{').test(app);

// 1. mark cues: Vulnerable is a weak hit, Feeble gets its own reduced-hit cue; neither is Shocked / armour
{ const a = app.indexOf('const DN_REDUCED'), b = app.indexOf('function dnTypeGlyph'), c = app.indexOf('const DN_MARK_CUE'), d = app.indexOf('// one cue per mark kind per 45 ms');
  ok(a > 0 && b > a && c > b && d > c, '1. the mark-cue source slices are found');
  const sb = {}; vm.createContext(sb); vm.runInContext(app.slice(a, b) + '\n' + app.slice(c, d) + '\nthis.f = {dnMarkSoundKey, DN_MARK_CUE};', sb);
  const { dnMarkSoundKey, DN_MARK_CUE } = sb.f, cue = (m, dmg)=> DN_MARK_CUE[dnMarkSoundKey(m, false, dmg)];
  ok(cue(['vulnerable'], 4) === 'markWeak', `1. a hit on a Vulnerable unit plays markWeak (got ${cue(['vulnerable'], 4)})`);
  ok(cue(['feeble'], 1) === 'markFeeble', `1. a hit by a Feeble unit plays markFeeble (got ${cue(['feeble'], 1)})`);
  ok(cue(['shocked'], 4) === 'markShocked' && cue(['weak'], 4) === 'markWeak' && cue(['armor'], 1) === 'markArmor', '1. Shocked, Weak and Armor keep their cues');
  ok(cue(['armor', 'feeble'], 1) === 'markArmor', '1. Armor still names the cause before Feeble');
}

// 2. new cues exist (built from tone / sweep / fnoise), Rend / Enfeeble are wired, rendTone (Pierce's) is not redefined
['rendMarkTone', 'enfeebleTone', 'vulnTick', 'feebleTick', 'markFeeble', 'weakenTone', 'chilliTone', 'coffeeTone', 'wiltTone', 'tauntTone', 'shedTone', 'thawTone', 'prayerTone', 'recoilTone', 'shieldTone', 'stunPlayerTone', 'curseTickTone', 'strangleTone']
  .forEach(k=> ok(cueDef(k), `2. SoundKit.${k} is defined`));
ok((app.match(/\n\s+rendTone\(\)\{/g) || []).length === 1, "2. rendTone (Pierce / armour shred's cue) is defined once");
has(app, /ev\.kind === 'rend'\)\{[^\n]*snd\('rendMarkTone'\)/, '2. Rend plays rendMarkTone');
has(app, /ev\.kind === 'enfeeble'\)\{[^\n]*snd\('enfeebleTone'\)/, '2. Enfeeble plays enfeebleTone');
has(app, /ev\.kind === 'vulnHit'\)\{[^\n]*snd\('vulnTick'\)/, '2. vulnHit ticks');
has(app, /ev\.kind === 'feebleHit'\)\{[^\n]*snd\('feebleTick'\)/, '2. feebleHit ticks');
ok(!/ev\.kind === '(rend|enfeeble)'[^\n]*exposeTone/.test(app), '2. Rend and Enfeeble no longer share exposeTone');
has(app, /case 'weaken': snd\('weakenTone'\); fl\(el, `🪓 −/, '2. Weaken: its own cue and a 🪓 float (not 💔)');
ok(!/weaken:'💔'/.test(app), '2. the Weaken skill icon is not 💔 (Vulnerable keeps it)');
// silent kinds
[['wilting', 'wiltTone'], ['taunted', 'tauntTone'], ['strangleTick', 'strangleTone']].forEach(([k, c])=> has(app, new RegExp("'" + k + "'[^\\n]*" + c + '|' + c + "[^\\n]*'" + k + "'"), `2. ${k} plays ${c}`));
[['thaw', 'thawTone'], ['shed', 'shedTone'], ['coffee', 'coffeeTone'], ['chilli', 'chilliTone'], ['prayer', 'prayerTone'], ['recoil', 'recoilTone']].forEach(([k, c])=> has(app, new RegExp("ev\\.kind==='" + k + "'\\)\\{ try\\{ SoundKit\\." + c), `2. statusFx ${k} plays ${c}`));
has(app, /SoundKit\.shieldTone\(\)/, '2. unitShield plays shieldTone'); has(app, /ev\.type==='curseTick'\)\{ try\{ SoundKit\.curseTickTone/, '2. curseTick plays curseTickTone');
has(fxa, /case 'stunPlayer': \{[^\n]*SoundKit\.stunPlayerTone/, '2. stunPlayer plays the bell toll');

// 3. levels: the loud and the quiet cues
has(app, /playBuf\(c, bakedBuf\(c, 'rallyHorn', \(\)=> hornBuf\(c\)\), 0\.06 \* sfxVolume/, '3. rallyHorn gain 0.06 (was 0.11)');
has(app, /exposeTone\(\)\{ tone\(760,0\.05,'sawtooth',0\.095\)/, '3. exposeTone +4 dB');
has(app, /corrodeTone\(\)\{ tone\(500,0\.08,'sawtooth',0\.095\)/, '3. corrodeTone +4 dB');
has(app, /shellCrackTone\(\)\{ fnoise\(0\.07,0\.055/, '3. shellCrackTone peak tamed');
has(app, /burnCrackle\(\)\{ fnoise\(0\.25,0\.04/, '3. burnCrackle peak tamed');
has(app, /iceShatter\(\)\{[^\n]*0\.028[^\n]*fnoise\(0\.18, 0\.04/, '3. iceShatter peak tamed');

// 4. texts: Underwater Currents, the Armourer line, no hard-coded "Wave N" for the awash tick
const TX = require('../bramblewood-texts.js').TEXT, LANGS = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
['ui.fxaud2-float-currents-n', 'ui.fxaud2-float-currents', 'ui.fxaud2-log-currents-n', 'ui.fxaud2-who-currents', 'ui.fxaud2-log-armourer'].forEach(k=>{
  ok(TX[k] && /Underwater Currents|armour/.test(TX[k]), `4. TX ${k} exists`);
  LANGS.forEach(l=>{ const p = JSON.parse(rd('lang/' + l + '.json')); const en = p[TX[k]] !== undefined ? TX[k] : TX[k].replace(/^\S+ /, ''); ok(p[en] && p[en] !== en, `4. ${l} translates ${k}`); });
  has(app, new RegExp("TX\\('" + k.replace(/\./g, '\\.') + "'"), `4. ${k} is used in code`); });
ok(!/Wave \$\{ev\.n\}/.test(app), '4. no hard-coded "Wave ${ev.n}" for the awash tick');
ok(!/ev\.awash \? 'The Wave'/.test(app), '4. the awash wave line names the field, not "The Wave"');
has(app, /case 'namedBuff': if\(!\(ev\.amount > 0\) && ev\.amount2 > 0\) return \{cls:'gold', text:TX\('ui\.fxaud2-log-armourer'/, '4. an HP-only buff (Armourer) has its own log line');

// 5. guardrails: particles at Effects None / hidden, the aura, music, tickers, powder, the elite glint
has(skfx, /const quiet = \(\)=>[^\n]*fxAtLeast\('low'\)[^\n]*ui27Away/, '5. SkillFX has a quiet() gate (Effects None, hidden or just back)');
has(skfx, /function fireball\(caster, target, o\)\{\n  o = o \|\| \{\}; if\(!ready\(\) \|\| quiet\(\)/, '5. SkillFX.fireball honours it');
has(skfx, /function meteor\(target, o\)\{\n  o = o \|\| \{\}; if\(!ready\(\) \|\| quiet\(\)/, '5. SkillFX.meteor honours it');
has(app, /function poisonBubbleBurstVfx\(uid\)\{\n  const el = boardCardEl\(uid\);\n  if\(!el \|\| !fxAtLeast\('low'\) \|\| ui27Away\(\)/, '5. the poison bubbles honour level and hidden');
has(app, /function bloomCopyVfx\(srcUid, copyUid\)\{\n  if\(!fxAtLeast\('low'\) \|\| ui27Away\(\)\) return;/, '5. the bloom petals honour level and hidden');
has(app, /F\.scorch && fxAtLeast\('low'\) && !ui27Away\(\)/, '5. the meteor crater scorch honours level and hidden');
has(app, /\(ev\.amount > 0 \|\| fxAtLeast\('med'\)\)\)\{ const t = el\(ev\.targetUid\); if\(t\) F\.espritAura/, '5. an HP-only namedBuff skips the aura below Medium');
has(app, /visibilitychange', \(\)=>\{ try\{ if\(!ctx\) return;\n\s+if\(document\.hidden\)\{ if\(ctx\.state === 'running'\)\{ hiddenSuspend = true; ctx\.suspend\(\)/, '5. the audio context suspends while hidden');
has(app, /hiddenSuspend = false; ctx\.resume\(\)/, '5. ... and resumes on return');
has(app, /if\(document\.hidden \|\| fxaud2InMatch\(\)\)\{ setTimeout\(show, 2000\)/, '5. the Home tip ticker waits while a fight is up');
has(app, /bwLoop\(refreshEnergyHud, 1000, \(\)=> !fxaud2InMatch\(\)\)/, '5. the energy HUD loop sleeps while a fight is up');
has(fxh, /T === 'powder' && \(!env\.fxAtLeast\('low'\) \|\| env\.reduced\)\)\{[^\n]*\n[^\n]*snd\('sporePuff'/, '5. powder1Event keeps the cue at Effects None / reduced motion');
has(app, /ev\.type === 'powder' && \(reducedMotion\(\) \|\| fxLevel\(\) === 'none'\)\)\{[^\n]*powder1Event/, '5. fxBatchVfx still reaches the powder cue at None');
has(tpl, /#appWrap\.in-match \.card-tile\.elite-polish::after\{animation:none; mix-blend-mode:normal;/, '5. the elite glint: no animation or blend in a fight');
ok(!/body:has\(/.test(tpl.replace(/\/\*[\s\S]*?\*\//g, '')), '5. no body:has( selector in the template (comments aside)');

// 6. the five events with no client handler
has(app, /case 'fireHitReady': fl\(/, '6. fireHitReady has a float');
has(app, /case 'sequester': \{ snd\('swipeTone'\)/, '6. sequester has a float and a cue');
has(app, /case 'sequesterEnd': case 'sequesterBack': fl\(/, '6. sequesterEnd / sequesterBack have a float');
has(app, /case 'triggerCapped': fl\(/, '6. triggerCapped has a float');

// 7. Effects Lab and catalogue
has(rd('tools/effects-lab/manifest/h.js'), /id:'sk-rend-enfeeble'[\s\S]*id:'sk-weaken-axe'/, '7. the Effects Lab shows Rend / Enfeeble and Weaken');
{ const inv = JSON.parse(rd('docs/effects-inventory-2026-10-15.json')); ok(['sk-rend-enfeeble', 'sk-weaken-axe'].every(id=> inv.some(e=> e.id === id)), '7. both are in the inventory'); }
has(rd('docs/effects-catalogue.md'), /2026-11-18 \(package FXAUD2\)/, '7. the catalogue has a dated FXAUD2 section');

console.log(`fxaud2-2026-11-18: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0);
