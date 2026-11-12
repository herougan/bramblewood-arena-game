#!/usr/bin/env node
// 2026-11-13 (package UIFX3 "Story", owner 00:03: "immersion with dialogue"): the dialogue staging in bramblewood-ui-story.js (window.StoryUI).
//   hooks      playDialogue / dialogueDock / showSpeechBubble call StoryUI; the build and the Effects Lab bundle the file; the Lab group and rows
//   typing     letters at their own delays, the whole text in the DOM from the start (screen readers, the box never grows), translated first
//   taps       a tap on a typing line completes it and stays; the next tap moves on
//   speed      the NPC dialogue speed setting scales the typing (Slow 1.5x, Fast 0.6x)
//   settings   Effects None and reduced motion: the whole line at once, no scene layer; Low: no ambience, no blur; High: blur and ambience
//   cleanup    the scene layer and every timer go with the conversation; bubbles pop and leave
//   cost       typing a line adds no layout passes beyond a handful (CDP LayoutCount, idle window subtracted)
// Static checks always run; the browser part (Playwright, Chromium) runs when index.html and Chromium are there. Build first.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), story = read('bramblewood-ui-story.js');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const e = app.indexOf('\n}', i); return app.slice(i, e < 0 ? i + 4000 : e + 2); };

// ---- static: hooks, bundling, Lab, docs
ok(/StoryUI\.line\(b, line, \{id, sp, script\}\)/.test(fn('playDialogue')), 'playDialogue hands each line to StoryUI.line');
ok(/if\(!st && hasGsap\(\)\) gsap\.from\(b/.test(fn('playDialogue')) && /if\(!st\) try\{ fxHook\('dialogueLine'/.test(fn('playDialogue')), 'the old slide and FX.F mood only without StoryUI');
ok(/finally \{ dialoguesPending\.delete\(id\); try\{ if\(window\.StoryUI\) StoryUI\.end\(id\);/.test(fn('playDialogue')), 'the scene ends with its conversation (finally)');
ok(/st \? st\.ms \+ 1200 \* dialogueSpeedMul\(\)/.test(fn('playDialogue')), 'a line waits at least its typing + 1.2 s');
ok(/StoryUI\.mine\(reply\)/.test(fn('playDialogue')), 'your reply lights up, the others dim');
ok(/if\(window\.StoryUI && StoryUI\.complete\(\)\) return; if\(dialogueAdvance\) dialogueAdvance\(true\);/.test(fn('dialogueDock')), 'a tap completes a typing line before it moves on');
ok(/if\(window\.StoryUI && StoryUI\.bubble\(b, holdS\)\)/.test(fn('showSpeechBubble')), 'showSpeechBubble lets StoryUI pop the bubble');
ok(/storyArrive\(\)\{/.test(app) && /storyLetterbox\(boss\)\{/.test(app), 'SoundKit cues storyArrive / storyLetterbox');
ok(/boss_banter:\{scene:'boss'\}/.test(story) && /scale_trail_finale:\{scene:'story', ambient:'embers'\}/.test(story) && /well_m1:\{ambient:'fireflies'\}/.test(story) && /cur_m3_ashcairn:\{ambient:'rain'\}/.test(story), 'the scene and ambient table (STORY_SCENES)');
ok(['boss_banter', 'outskirts_reveal', 'scale_trail_finale', 'well_m1', 'cur_m3_ashcairn'].every(id=> app.includes(`  ${id}: {lines:[`)), 'the scripts keep their shape (`id: {lines:[`, which tests and tools read)');
ok(/text:'…hello… hello… hello…', mood:'whisper'/.test(app), 'the echo\'s whisper is marked (the text unchanged)');
ok(/bramblewood-ui-story\.js/.test(read('assemble_arena.py')), 'assemble_arena.py bundles the file');
ok(/bramblewood-ui-story\.js/.test(read('tools/effects-lab/build.py')), 'the Effects Lab bundles the file');
{ const man = read('tools/effects-lab/manifest/story.js'), inv = JSON.parse(read('docs/effects-inventory-2026-10-15.json'));
  const ids = ['story-scene', 'story-arrive', 'story-typewriter', 'story-react', 'story-letterbox', 'story-ambient', 'story-bark'];
  ids.forEach(id=>{ ok(man.includes(`id:'${id}'`), 'manifest registers ' + id); const r = inv.find(e=> e.id === id); ok(r && r.area === 'Story (UIFX3)' && r.status === 'live', 'inventory row ' + id + ' in the "Story (UIFX3)" group'); }); }
ok(!/body:has\(/.test(story), 'no body:has() selector');
ok(/:root\{\$\{decl\(TOK\)\}\}/.test(story) && /prefers-color-scheme: dark\)\{ :root:not\(\[data-theme="light"\]\)\{\$\{decl\(TOK_DARK\)\}\}/.test(story) && /:root\[data-theme="dark"\]\{\$\{decl\(TOK_DARK\)\}\}/.test(story), 'tokens on :root, the OS dark scheme and the dark theme');
ok(/^## 2026-11-13 Package UIFX3/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/uifx3-2026-11-13\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/storyLetterbox/.test(read('docs/sfx-cue-sheet.md')) && /UIFX3/.test(read('docs/effects-catalogue.md')), 'cue sheet and effects catalogue entries');

// ---- the pure parts in node: the typing time follows the NPC dialogue speed, punctuation pauses, the cap
{ let mul = 1; const sb = {window:{}, document:{getElementById:()=> null}, Intl, dialogueSpeedMul:()=> mul}; sb.window = sb; sb.globalThis = sb;
  vm.createContext(sb); vm.runInContext(story.replace('(typeof window !== \'undefined\' ? window : globalThis)', '(window)'), sb);
  const S = sb.StoryUI, t = 'Feed a card Dust and Leaves.';
  ok(S && typeof S.typeMs === 'function', 'StoryUI.typeMs in node');
  const med = S.typeMs(t); mul = 1.5; const slow = S.typeMs(t); mul = 0.6; const fast = S.typeMs(t); mul = 1;
  ok(Math.abs(slow / med - 1.5) < 0.08 && Math.abs(fast / med - 0.6) < 0.08, `typing scales with the speed setting (medium ${med} ms, slow ${slow}, fast ${fast})`);
  ok(S.typeMs('One, two.') > S.typeMs('One two.') + 80, 'a comma adds a beat');
  ok(S.typeMs('x'.repeat(400)) <= 4200 + 140, 'a long line is squeezed under the cap');
  ok(S.typeMs('Shh.', 'whisper') > S.typeMs('Shh.'), 'a whisper types slower'); }

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');" +
    "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying'])); localStorage.setItem('bramblewood_fx_level','high');";
  // GSAP follows the wall clock here: on a loaded box its lag smoothing (500 ms, 33 ms) would stretch a 0.3 s fade to many seconds
  const SCRIPTS = `try{ gsap.ticker.lagSmoothing(0); }catch(e){} DIALOGUE_GAP_MS = 60; DIALOGUE_REPEAT_MS = 0;
    DIALOGUES.__u1 = {scene:'boss', lines:[{who:'shieldback', text:'Eyes up. The Thornback Boar holds the bridge, and it does not surrender.'}, {who:'swiftpaw', text:'Then we knock it off the bridge.'}]};
    DIALOGUES.__u2 = {scene:'story', ambient:'fireflies', lines:[{who:'traveller', text:'Wells are patient.'}]};
    DIALOGUES.__u2b = DIALOGUES.__u2; DIALOGUES.__u1b = DIALOGUES.__u1;
    DIALOGUES.__u3 = {lines:[{who:'shieldback', text:'Then we make it a short conversation.'}]};
    DIALOGUES.__u4 = {lines:[{who:'golem', text:'Feed a card Dust and Leaves, and I temper it, one level at a time. At level 10 a card hits its limit.'}]};
    window.__go = id=>{ window.__p = playDialogue(id, {force:true, expand:true}); return 1; };
    window.__finish = async ()=>{ for(let k = 0; k < 6; k++){ StoryUI.complete(); try{ dialogueAdvance && dialogueAdvance(true); }catch(e){} await new Promise(r=> setTimeout(r, 120)); } await window.__p; await new Promise(r=> setTimeout(r, 800)); return 1; }; 1`;
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  const open = async (w, o)=>{
    const ctx = await b.newContext(Object.assign({viewport:{width:w, height: w < 500 ? 844 : 860}, hasTouch: w < 500}, o || {}));
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
    await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:180000}); await pg.waitForTimeout(3000);
    await pg.addStyleTag({content: '.toast-host, #signInBanner{display:none !important;}'});
    await pg.evaluate("switchTab('home'); " + SCRIPTS);
    return {ctx, pg};
  };
  const ev = (pg, js)=> pg.evaluate(js);
  const settle = async (pg, ms)=> pg.waitForTimeout(ms);
  try{
    // ---- 1366: hooks, typing, taps, settings, cleanup, bubbles, cost
    { const {ctx, pg} = await open(1366);
      ok(await ev(pg, "typeof StoryUI === 'object' && ['line','mine','complete','end','bubble','demo','typeMs'].every(k=> typeof StoryUI[k] === 'function')"), 'StoryUI is in the game bundle');
      await ev(pg, "__go('__u1')"); await settle(pg, 250);
      let s = await ev(pg, `(()=>{ const l = document.querySelector('#dialogueLines .dlg-line'), t = l && l.querySelector('.dlg-text');
        return l && {cls:l.className, tcls:t.className, txt:t.textContent, spans:t.querySelectorAll('i').length, st:StoryUI._state(), scene:!!document.querySelector('.sty-scene.sty-k-boss.is-bars'), blur:!!document.querySelector('.sty-blur'), tr:t.getAttribute('translate')}; })()`);
      ok(s && /sty-line/.test(s.cls) && /sty-l\b/.test(s.cls) && /sty-lit/.test(s.cls), 'the first speaker stands left, lit ' + JSON.stringify(s && s.cls));
      ok(s && /sty-tw/.test(s.tcls) && !/is-done/.test(s.tcls) && s.st && s.st.typing, 'the line is typing');
      ok(s && s.txt === 'Eyes up. The Thornback Boar holds the bridge, and it does not surrender.' && s.spans > 40, 'the whole text is in the DOM from the start, one span a letter');
      ok(s && s.tr === 'no', 'the split text is kept from the page translator (translated before it was split)');
      ok(s && s.scene && !s.blur, 'a boss scene: vignette and letterbox, no blur');
      // tap 1 completes, tap 2 moves on (dispatched in the page, so a slow machine can't let the line finish between the check and the tap)
      const TAP = "(()=>{ const r = document.querySelector('#dialogueLines .dlg-line:last-child').getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2; (document.elementFromPoint(x, y) || document.body).dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, clientX:x, clientY:y})); })()";
      const LAST = "(()=>{ const ls = [...document.querySelectorAll('#dialogueLines .dlg-line')]; const l = ls[ls.length - 1]; return {n:ls.length, done:/is-done/.test(l.querySelector('.dlg-text').className), next:!!l.querySelector('.sty-next'), who:l.dataset.who, typing:!!(StoryUI._state() && StoryUI._state().typing), all:ls.map(x=> ({who:x.dataset.who, cls:x.className}))}; })()";
      s = await ev(pg, `(async()=>{ const before = ${LAST}; ${TAP}; const after1 = ${LAST}; ${TAP}; await new Promise(r=> setTimeout(r, 120)); const after2 = ${LAST}; return {before, after1, after2}; })()`);
      ok(s.before.typing && s.after1.n === 1 && s.after1.done && s.after1.next && s.after1.who === 'shieldback' && !s.after1.typing, 'tap 1 completes the line and stays on it ' + JSON.stringify([s.before.typing, s.after1]));
      { const a = s.after2.all; ok(a.length === 2 && a[1].who === 'swiftpaw' && /sty-r\b/.test(a[1].cls) && /sty-lit/.test(a[1].cls) && /sty-dim/.test(a[0].cls), 'tap 2 moves on: the second speaker on the right, lit; the first dims ' + JSON.stringify(a)); }
      // cleanup: let it end
      await ev(pg, "__finish()");
      s = await ev(pg, "(async()=>{ for(let k = 0; k < 50 && document.querySelector('#dialogueLines .dlg-line, .sty-scene'); k++) await new Promise(r=> setTimeout(r, 100)); return {lines:document.querySelectorAll('#dialogueLines .dlg-line').length, scene:document.querySelectorAll('.sty-scene').length, st:StoryUI._state()}; })()");
      ok(s.lines === 0 && s.scene === 0 && s.st === null, 'after the conversation: no lines, no scene layer, no scene timers ' + JSON.stringify(s));
      // High outside a fight: a story scene blurs the edges; fireflies drift
      await ev(pg, "__go('__u2')"); await settle(pg, 300);
      s = await ev(pg, "({blur:!!document.querySelector('.sty-scene .sty-blur'), ff:document.querySelectorAll('.sty-scene .sty-ff').length, bars:!!document.querySelector('.sty-scene.sty-k-story.is-bars')})");
      ok(s.blur && s.ff === 11 && s.bars, 'High: a story scene has the blur, the letterbox and 11 fireflies ' + JSON.stringify(s));
      await ev(pg, "__finish()");
      // Low: typing and letterbox, no ambience, no blur
      await ev(pg, "setFxLevel('low'); __go('__u2b')"); await settle(pg, 250);
      s = await ev(pg, "({blur:!!document.querySelector('.sty-blur'), ff:document.querySelectorAll('.sty-ff').length, bars:!!document.querySelector('.sty-scene.is-bars'), typing:!!(StoryUI._state() && StoryUI._state().typing)})");
      ok(!s.blur && s.ff === 0 && s.bars && s.typing, 'Low: typing and the letterbox, no blur, no ambience ' + JSON.stringify(s));
      await ev(pg, "__finish()");
      // None: the whole line at once, no scene layer, no motion
      await ev(pg, "setFxLevel('none'); __go('__u1b')"); await settle(pg, 200);
      s = await ev(pg, "(()=>{ const t = document.querySelector('#dialogueLines .dlg-line .dlg-text'); return {done:!!t && /is-done/.test(t.className), scene:document.querySelectorAll('.sty-scene').length, typing:!!(StoryUI._state() && StoryUI._state().typing), side:!!document.querySelector('#dialogueLines .dlg-line.sty-l')}; })()");
      ok(s.done && s.scene === 0 && !s.typing && s.side, 'Effects None: the whole line at once, no scene layer (sides stay) ' + JSON.stringify(s));
      await ev(pg, "__finish()");
      // bubbles: StoryUI pops them at Low and up, the old tween at None; either way they leave
      s = await ev(pg, "(()=>{ setFxLevel('high'); window.__bt = document.createElement('div'); __bt.style.cssText = 'position:fixed; left:600px; top:400px; width:90px; height:120px;'; document.body.appendChild(__bt); showSpeechBubble(__bt, 'For the river!', 'is-bark', {hold:.6}); return {cls:[...document.querySelectorAll('.speech-bubble')].map(b=> b.className), lvl:fxLevel(), rm:reducedMotion(), hidden:document.hidden}; })()");
      ok(s.cls.some(c=> /sty-bub/.test(c)), 'a bubble pops through StoryUI ' + JSON.stringify(s));
      ok(await ev(pg, "(async()=>{ for(let k = 0; k < 100; k++){ if(!document.querySelector('.speech-bubble')) return true; await new Promise(r=> setTimeout(r, 100)); } return false; })()"), 'the bubble leaves (within 10 s on a busy machine; 1.2 s of GSAP time)');
      // translation: a translated line is typed in its language
      const lang = await ev(pg, "(async()=>{ try{ await BramblewoodI18n.set('fr'); }catch(e){ return 'x'; } __go('__u3'); await new Promise(r=> setTimeout(r, 300)); const t = document.querySelector('#dialogueLines .dlg-line .dlg-text'); const out = t ? t.textContent : ''; await __finish(); await BramblewoodI18n.set('en'); return out; })()");
      ok(lang === 'Alors on fera court.', 'a translated line types in French: ' + JSON.stringify(lang));
      // cost: LayoutCount while a long line types, minus an idle window of the same length
      const cdp = await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
      const lc = async ()=> (await cdp.send('Performance.getMetrics')).metrics.reduce((o, m)=> (o[m.name] = m.value, o), {});
      const win = async js=>{ const a = await lc(); if(js) await ev(pg, js); await settle(pg, 1500); const z = await lc();
        return {layouts:z.LayoutCount - a.LayoutCount, styles:z.RecalcStyleCount - a.RecalcStyleCount, layoutMs:Math.round((z.LayoutDuration - a.LayoutDuration)*1000), styleMs:Math.round((z.RecalcStyleDuration - a.RecalcStyleDuration)*1000), scriptMs:Math.round((z.ScriptDuration - a.ScriptDuration)*1000)}; };
      // each window twice, the smaller kept (the box is shared with other runs)
      const min2 = (a, b)=> Object.fromEntries(Object.keys(a).map(k=> [k, Math.min(a[k], b[k])]));
      const typed = async (id, off)=>{ const r = await win(`StoryUI.off = ${off}; __go('${id}')`); await ev(pg, "__finish().then(()=>{ StoryUI.off = false; return 1; })"); return r; };
      await ev(pg, "DIALOGUES.__u5 = DIALOGUES.__u4; DIALOGUES.__u6 = DIALOGUES.__u4; DIALOGUES.__u7 = DIALOGUES.__u4; 1");
      const idle = min2(await win(''), await win(''));
      const typing = min2(await typed('__u4', false), await typed('__u6', false));
      const plain = min2(await typed('__u5', true), await typed('__u7', true)); // the same line without the staging (the old dock)
      console.log(`  cost over 1.5 s while a 100-letter line types: staged ${JSON.stringify(typing)}; the old dock ${JSON.stringify(plain)}; idle ${JSON.stringify(idle)}`);
      ok(typing.layouts - idle.layouts <= 12, `typing adds no per-letter layout (${typing.layouts - idle.layouts} extra layouts over 1.5 s for 100 letters)`);
      await ctx.close(); }
    // ---- 390 with reduced motion: plain text, no scene; the phone's one line keeps the other speaker at the far corner
    { const {ctx, pg} = await open(390, {reducedMotion:'reduce'});
      await ev(pg, "setFxLevel('high'); __go('__u1')"); await settle(pg, 200);
      let s = await ev(pg, "(()=>{ const t = document.querySelector('#dialogueLines .dlg-line .dlg-text'); return {done:!!t && /is-done/.test(t.className), scene:document.querySelectorAll('.sty-scene').length}; })()");
      ok(s.done && s.scene === 0, 'reduced motion: the whole line at once, no scene layer ' + JSON.stringify(s));
      await ev(pg, "dialogueAdvance && dialogueAdvance(true); 1"); await settle(pg, 400);
      s = await ev(pg, "(()=>{ const ls = document.querySelectorAll('#dialogueLines .dlg-line'); const l = ls[ls.length - 1]; return {n:ls.length, who:l && l.dataset.who, listen:!!(l && l.querySelector('.sty-listen .dlg-portrait'))}; })()");
      ok(s.n === 1 && s.who === 'swiftpaw' && s.listen, 'a phone shows one line; the first speaker waits at the far corner ' + JSON.stringify(s));
      await ctx.close(); }
  } finally { await b.close(); }
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
}
browser().catch(e=>{ fail++; console.log('  ✗ browser part threw:', e && e.message); }).then(()=>{ console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}`); process.exit(fail ? 1 : 0); });
