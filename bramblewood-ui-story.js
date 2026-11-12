/* ============================================================
   Bramblewood story staging (2026-11-13, package UIFX3 "Story"; owner 2026-11-13 00:03: "interesting vfx to improve our general
   UI experience ... immersion with dialogue"). Dialogue that plays like a scene, not a text box.

   window.StoryUI, called from the dialogue code in arena_app.js (playDialogue, dialogueDock, showSpeechBubble):
     StoryUI.line(lineEl, line, {id, sp, script}) → {ms}   a line is on the dock: side, nameplate, entrance, typing, mood, scene
     StoryUI.mine(replyEl)                                 your reply: the others dim
     StoryUI.complete() → true|false                       a tap on a line: completes a line still typing (true); else the tap moves on
     StoryUI.end(id)                                       the conversation is over: the scene layer goes, every timer stops
     StoryUI.bubble(el, holdS) → true|false                a battlefield bubble pops (squash, tail wiggle) and fades; false = the old tween
     StoryUI.demo(host, script, opts) → Promise            the Effects Lab and the tests: a script in a stand-in dock inside host
     StoryUI.typeMs(text, mood)                            how long a line types at the current NPC dialogue speed

   Staging marks (none of them is text, so no translation changes):
     scene    'story' (vignette, letterbox, soft blur behind) | 'boss' (red vignette, letterbox, drum)    STORY_SCENES below, or script.scene
     ambient  'fireflies' | 'rain' | 'embers'                                                           STORY_SCENES below, or script.ambient
     line.mood (in DIALOGUES) 'shout' | 'laugh' | 'whisper' | 'ask' | 'sad'; without one it is read from the line (!, ?, …, HA, CAPITALS)
   Text: *word* marks emphasis (it pops in); in English, capitalised words inside a sentence (Dust, the Marshal) are stressed too.

   Gates: Effects None or reduced motion → the whole line at once, no motion, no scene layer (sides and nameplates stay, they are
   layout); Low → typing, entrance, vignette and letterbox; Medium → + reactions and ambience (never during a live fight);
   High → + the soft blur behind a story scene (never during a fight). Nothing blocks input: every layer is pointer-events:none, a tap
   completes the line and the next tap moves on, the dock's hide button takes the scene layer away.
   Cost: a line is written once, each letter a span with its own animation-delay, so the box has its final size from the first frame
   (no per-letter layout and no per-letter script); the only timers are one babble per word and the line's end.
   ============================================================ */
(function(root){
'use strict';
if(typeof document === 'undefined') return;
const S = root.StoryUI = root.StoryUI || {};

// ---- gates (the game's own when present; the Effects Lab has none of them) ----
const G = ()=> (typeof gsap !== 'undefined' ? gsap : null);
const LV = ['none', 'low', 'med', 'high'];
function rm(){ try{ if(typeof reducedMotion === 'function') return !!reducedMotion(); return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } }
function level(){ if(S.forceLevel) return S.forceLevel; try{ if(typeof fxLevel === 'function') return fxLevel(); }catch(e){} return 'high'; }
function at(l){ return !rm() && LV.indexOf(level()) >= LV.indexOf(l); }
function inFight(){ try{ return typeof matchState !== 'undefined' && !!matchState && !matchState.over; }catch(e){ return false; } }
function speedMul(){ try{ if(typeof dialogueSpeedMul === 'function') return dialogueSpeedMul() || 1; }catch(e){} return 1; }
const call = fn=>{ try{ fn && fn(); }catch(e){} };
function sound(name, ...a){ try{ if(typeof SoundKit !== 'undefined' && SoundKit && typeof SoundKit[name] === 'function') SoundKit[name](...a); }catch(e){} }
const esc = s=> String(s == null ? '' : s).replace(/[&<>"]/g, c=> ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));

// ---- peoples (docs/lore-bible.md): the nameplate colour, the portrait ring and the babble voice (SoundKit.babble) ----
const PEOPLE = {shieldback:'legion', swiftpaw:'legion', silverstream:'river', otternarian:'river', aurelia:'sun', vesper:'tribes', whisper:'void',
  traveller:'road', mouse:'road', peddler:'ember', mole:'folk', hedgehog:'folk', heron:'river', beetle:'moss', frog:'moss', golem:'stone'};
const VOICE = {legion:'legion', river:'legion', sun:'tribes', tribes:'tribes', void:'tribes', road:'road', ember:'folk', folk:'folk', moss:'folk', stone:'deep', beast:'beast'};
const VOICE_OF = {beetle:'hive', golem:'deep'};
function peopleOf(who, sp){
  if(sp && sp.people && VOICE[sp.people]) return sp.people;
  const k = String(who || ''); if(PEOPLE[k]) return PEOPLE[k];
  let d = null; try{ d = sp && sp.card && typeof getCardDefs === 'function' ? getCardDefs()[sp.card] : null; }catch(e){}
  if(!d) return 'folk';
  const a = (d.archetypes || []).concat(d.tags || []), s = (d.species || []).join(' ');
  if(d.faction === 'hummingbirds' || a.includes('Hummingbird')) return 'tribes';
  if(d.faction === 'base' || a.includes('Otter')) return 'legion';
  if(/Rodent/.test(s)) return 'road';
  if(/Canid|Felid|Feline|Ursid|Hyaenid|Reptile|Dragon|Arachnid/.test(s)) return 'beast';
  if(/Insect|Myriapod|Amphibian/.test(s)) return 'moss';
  if(/Fish|Cetacean|Mollusc|Cnidarian|Crustacean|Echinoderm|Pinniped/.test(s)) return 'river';
  if(/Elemental|Structure/.test(s)) return 'stone';
  return 'folk';
}

// ---- style: tokens (bare :root, the OS dark scheme, the explicit dark theme) and the rules, one <style id="sty-style"> ----
// The dock's lines stay cream in both themes, so the plates keep their colour; only the dimming behind a scene deepens in the dark.
const TOK = {legion:'#7b2f22', river:'#2b5e7e', sun:'#a0541a', tribes:'#9d1f40', void:'#4b2c6f', road:'#3f4a7b', ember:'#9b4511', folk:'#6b4a2c',
  moss:'#3f6a2f', stone:'#55585f', beast:'#5d3a1d', 'plate-ink':'#fff8e6', shade:'rgba(0,0,0,.3)', 'whisper-ink':'#6e5c4a', bar:'#0b0805',
  'bar-edge':'rgba(224,184,90,.7)', 'bar-edge-boss':'rgba(214,52,44,.9)', vig:'rgba(24,13,4,.38)', 'vig-boss':'rgba(72,8,6,.44)', 'vig-sad':'rgba(14,26,46,.42)',
  ff:'#fbffc4', 'ff-glow':'rgba(226,255,120,.6)', spark:'#ffb24e', 'spark-glow':'rgba(255,128,32,.6)', rain:'rgba(210,226,255,.5)'};
const TOK_DARK = {vig:'rgba(0,0,0,.46)', 'vig-sad':'rgba(4,12,30,.5)'};
const decl = o=> Object.keys(o).map(k=> `--sty-${k}:${o[k]};`).join(' ');
const CSS = () => `
:root{${decl(TOK)}}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){${decl(TOK_DARK)}} }
:root[data-theme="dark"]{${decl(TOK_DARK)}}
/* a line on the stage: the speaker's side, a nameplate in its people's colour, a ringed portrait standing a little proud of the bubble */
.sty-line{position:relative; --sty-c:var(--sty-folk);}
.dlg-line.sty-line.sty-l{transform-origin:0 50%;} .dlg-line.sty-line.sty-r{transform-origin:100% 50%;}
.dlg-line.sty-line .dlg-portrait{box-shadow:0 0 0 2px var(--sty-plate-ink), 0 0 0 4px var(--sty-c), 0 5px 10px var(--sty-shade); margin-top:-7px; transition:scale .3s ease;}
.sty-line .dlg-body{position:relative; flex:1 1 auto; padding-right:10px;}
.sty-line .dlg-name{display:inline-block; opacity:1; background:var(--sty-c); color:var(--sty-plate-ink); padding:1px 8px 0; margin:0 0 3px; border-radius:7px 7px 7px 2px;
  font-family:'Baloo 2',system-ui,sans-serif; font-size:10.5px; font-weight:800; line-height:1.55; letter-spacing:.06em; box-shadow:0 1px 0 var(--sty-shade);}
/* the other side answers from the right, in a bubble that hugs its words (text still reads left to right) */
.dlg-line.sty-line.sty-r:not(.dlg-mine){flex-direction:row-reverse; text-align:right; border-bottom-left-radius:14px; border-bottom-right-radius:4px; width:auto; max-width:94%; margin-left:auto;}
.sty-line.sty-r .dlg-text{text-align:left;}
.sty-line.sty-r .dlg-body{padding-right:0; padding-left:10px;}
/* the two speakers stand on a diagonal: the left one's portrait pokes up at the top left, the right one's down at the bottom right (clear of the dock's hide button) */
.dlg-line.sty-line.sty-r .dlg-portrait{align-self:flex-end; margin-top:0; margin-bottom:-9px;}
.sty-line.sty-r .dlg-name{border-radius:7px 7px 2px 7px;}
.sty-line.sty-r .dlg-replies{justify-content:flex-end;}
.dlg-line.sty-lit:not(.dlg-to-you){box-shadow:0 0 0 2px color-mix(in srgb, var(--sty-c) 50%, transparent), 0 10px 24px var(--sty-shade);}
.dlg-line.sty-dim{opacity:.56; scale:.97; transition:opacity .35s ease, scale .35s ease;}
.sty-still .dlg-line, .sty-still .dlg-portrait{transition:none !important;}
/* the other party, when their own line has left the dock (a phone shows one line), at their own corner of the diagonal */
.sty-listen{position:absolute; width:24px; height:24px; border-radius:50%; overflow:hidden; opacity:.6; pointer-events:none; background:var(--sty-plate-ink);
  box-shadow:0 0 0 2px var(--sty-plate-ink), 0 0 0 3.5px var(--sty-lc, var(--sty-folk));}
.sty-l .sty-listen{right:14px; bottom:-11px;} .sty-r .sty-listen{left:14px; top:-11px;}
.sty-listen .dlg-portrait{width:100% !important; height:100% !important; margin:0 !important; box-shadow:none !important; font-size:14px; transition:none;}
/* typing: every letter is there from the start (the box never grows), each fades in at its own delay */
.sty-tw i{font-style:inherit; animation:styCh .13s linear var(--d, 0ms) backwards;}
.sty-tw.is-done i, .sty-tw.is-done .sty-em{animation:none;}
@keyframes styCh{from{opacity:0;}}
.sty-em{font-style:inherit; font-weight:800; color:var(--sty-c);}
.sty-em.is-pop{display:inline-block; animation:styEmPop .42s cubic-bezier(.3,1.7,.5,1) var(--d, 0ms) backwards;}
@keyframes styEmPop{from{transform:scale(1.4) translateY(-2px);}}
/* tap to go on: a small arrow in the speaker's colour once the line is written */
.sty-next{position:absolute; right:-1px; bottom:2px; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid var(--sty-c); opacity:.8; animation:styNext 1.1s ease-in-out infinite; pointer-events:none;}
.sty-r .sty-next{right:auto; left:-1px;}
.sty-next.is-still{animation:none;}
@keyframes styNext{50%{transform:translateY(3px);}}
/* moods */
.sty-whisper .dlg-text{font-style:italic; color:var(--sty-whisper-ink); font-size:.94em;}
.dlg-line.sty-whisper .dlg-portrait{opacity:.6; scale:.9;}
.sty-zing{position:absolute; width:24px; height:24px; color:var(--sty-c); pointer-events:none; overflow:visible; z-index:2;}
@media (max-width:699px){
  .sty-line .dlg-name{font-size:9.5px; padding:0 6px; margin-bottom:2px;}
  .dlg-line.sty-line .dlg-portrait{margin-top:-5px;} .dlg-line.sty-line.sty-r .dlg-portrait{margin-top:0; margin-bottom:-7px;}
  .sty-listen{width:20px; height:20px;} .sty-l .sty-listen{bottom:-9px;} .sty-r .sty-listen{top:-9px;}
}
/* the scene behind: vignette, a soft blur at the edges, letterbox bars, ambience. Never takes a tap. It sits over the map and the board but under
   the game's own controls (the map's button rows are z-index 60, the dock 1100), so the bars frame the world and never hide a button. */
.sty-scene{position:fixed; inset:0; pointer-events:none; z-index:58; opacity:0; transition:opacity .55s ease; overflow:hidden; --sty-bar-h:clamp(14px, 5.2vh, 46px);}
.sty-scene.is-hosted{position:absolute; z-index:5; border-radius:inherit; --sty-bar-h:9%;}
.sty-scene.sty-k-boss{--sty-bar-h:clamp(18px, 6.5vh, 56px);} .sty-scene.is-hosted.sty-k-boss{--sty-bar-h:11%;}
.sty-scene.in-fight{--sty-bar-h:3px;}
.sty-scene.in-fight .sty-bar{background:var(--sty-bar-edge); box-shadow:0 0 14px 3px var(--sty-bar-edge);} .sty-scene.in-fight .sty-bar i{display:none;}
.sty-scene.in-fight.sty-k-boss .sty-bar{background:var(--sty-bar-edge-boss); box-shadow:0 0 14px 3px var(--sty-bar-edge-boss);}
.sty-scene.is-on{opacity:1;} .sty-scene.is-away{opacity:0 !important;}
.sty-vig{position:absolute; inset:0; background:radial-gradient(ellipse 78% 72% at 50% 48%, transparent 50%, var(--sty-vig) 100%);}
.sty-k-boss .sty-vig{background:radial-gradient(ellipse 76% 70% at 50% 50%, transparent 50%, var(--sty-vig-boss) 100%);}
.sty-a-rain .sty-vig{background:radial-gradient(ellipse 80% 74% at 50% 46%, transparent 38%, var(--sty-vig-sad) 100%);}
.sty-k-boss.is-on .sty-vig{animation:styBossPulse 1.7s ease-out .25s both;}
@keyframes styBossPulse{0%{opacity:.35;} 28%{opacity:1;} 100%{opacity:.84;}}
.sty-blur{position:absolute; inset:0; -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px);
  -webkit-mask-image:radial-gradient(ellipse 72% 66% at 50% 50%, transparent 52%, black 95%); mask-image:radial-gradient(ellipse 72% 66% at 50% 50%, transparent 52%, black 95%);}
.sty-bar{position:absolute; left:0; right:0; height:var(--sty-bar-h); background:var(--sty-bar); transform:scaleY(0); transition:transform .55s cubic-bezier(.2,.8,.2,1);}
.sty-bar.t{top:0; transform-origin:50% 0;} .sty-bar.b{bottom:0; transform-origin:50% 100%;}
.sty-scene.is-bars .sty-bar{transform:scaleY(1);}
.sty-bar i{position:absolute; left:0; right:0; height:2px; background:var(--sty-bar-edge); transform:scaleX(0); transition:transform .7s cubic-bezier(.3,.8,.3,1) .4s;}
.sty-k-boss .sty-bar i{background:var(--sty-bar-edge-boss);}
.sty-bar.t i{bottom:0;} .sty-bar.b i{top:0;}
.sty-scene.is-bars .sty-bar i{transform:scaleX(1);}
.sty-amb{position:absolute; inset:0;}
.sty-ff{position:absolute; width:6px; height:6px; margin:-3px; border-radius:50%; background:var(--sty-ff); box-shadow:0 0 10px 4px var(--sty-ff-glow);
  animation:styFfDrift var(--t, 7s) ease-in-out var(--dl, 0s) infinite alternate, styFfBlink var(--bl, 2.4s) ease-in-out var(--dl, 0s) infinite;}
@keyframes styFfDrift{to{transform:translate(var(--dx, 20px), var(--dy, -30px));}}
@keyframes styFfBlink{0%, 100%{opacity:.12;} 50%{opacity:1;}}
.sty-spark{position:absolute; bottom:-6px; width:5px; height:5px; border-radius:50%; background:var(--sty-spark); box-shadow:0 0 8px 3px var(--sty-spark-glow); opacity:0;
  animation:stySpark var(--t, 5s) linear var(--dl, 0s) infinite;}
@keyframes stySpark{0%{transform:translate(0, 0); opacity:0;} 12%{opacity:1;} 70%{opacity:.85;} 100%{transform:translate(var(--dx, 10px), var(--rise, -300px)); opacity:0;}}
.sty-rain{position:absolute; inset:-30% -25%; transform:rotate(12deg);}
.sty-rain i{position:absolute; left:0; right:0; top:-140px; bottom:0; opacity:.62; animation:styRain .42s linear infinite;
  background:repeating-linear-gradient(90deg, transparent 0 31px, var(--sty-rain) 31px 32px, transparent 32px 53px, var(--sty-rain) 53px 54px, transparent 54px 77px);
  -webkit-mask-image:repeating-linear-gradient(180deg, black 0 22px, transparent 22px 70px); mask-image:repeating-linear-gradient(180deg, black 0 22px, transparent 22px 70px);}
.sty-rain i.r2{left:-17px; opacity:.4; animation-duration:.6s;
  -webkit-mask-image:repeating-linear-gradient(180deg, transparent 0 34px, black 34px 50px, transparent 50px 70px); mask-image:repeating-linear-gradient(180deg, transparent 0 34px, black 34px 50px, transparent 50px 70px);}
@keyframes styRain{to{transform:translateY(70px);}}
/* battlefield bubbles: a squash-pop from the tail, the tail wiggles once */
.speech-bubble.sty-bub::after{transform-origin:50% 0; animation:styTail .62s ease-out .14s both;}
@keyframes styTail{0%{transform:translateX(-50%) rotate(0);} 25%{transform:translateX(-50%) rotate(16deg);} 55%{transform:translateX(-50%) rotate(-11deg);} 80%{transform:translateX(-50%) rotate(5deg);} 100%{transform:translateX(-50%) rotate(0);}}
@media (prefers-reduced-motion: reduce){
  .sty-tw i, .sty-em.is-pop, .sty-next, .sty-ff, .sty-spark, .sty-rain i, .sty-k-boss.is-on .sty-vig, .speech-bubble.sty-bub::after{animation:none !important;}
  .sty-scene, .sty-bar, .sty-bar i, .dlg-line.sty-dim, .dlg-line.sty-line .dlg-portrait{transition:none !important;}
}
`;
function ensureCss(){
  if(document.getElementById('sty-style')) return;
  const s = document.createElement('style'); s.id = 'sty-style'; s.textContent = CSS(); (document.head || document.documentElement).appendChild(s);
}

// ---- typing: runs (emphasis), then one span per letter with its delay ----
const SEG = (()=>{ try{ return new Intl.Segmenter(undefined, {granularity:'grapheme'}); }catch(e){ return null; } })();
const graphemes = s=> SEG ? Array.from(SEG.segment(s), x=> x.segment) : Array.from(s);
const NOT_EM = new Set(['I', 'I\'m', 'I’m', 'I\'ll', 'I’ll', 'I\'ve', 'I’ve', 'I\'d', 'I’d', 'OK']);
// *x* is a marked stress (it pops in). Without marks, English text stresses capitalised words inside a sentence: the game writes its
// resources and names that way (Dust, Leaves, the Marshal, the Outskirts).
function runsOf(s, auto){
  const pieces = String(s).split(/(\*[^*\n]+\*)/).filter(Boolean).map(p=> /^\*[^*]+\*$/.test(p) ? {s:p.slice(1, -1), em:true, mark:true} : {s:p});
  if(!auto || pieces.some(p=> p.mark)) return pieces;
  const out = []; let start = true;
  pieces.forEach(p=> p.s.split(/(\s+)/).forEach(w=>{
    if(!w) return;
    if(/^\s+$/.test(w)){ out.push({s:w}); return; }
    const m = w.match(/^([^\p{L}]*)([\p{L}’'-]*\p{L})?(.*)$/u) || ['', w, '', ''];
    const core = m[2] || '';
    if(core && !start && /^\p{Lu}[\p{Ll}’']/u.test(core) && !NOT_EM.has(core)){ if(m[1]) out.push({s:m[1]}); out.push({s:core, em:true}); if(m[3]) out.push({s:m[3]}); }
    else out.push({s:w});
    start = /[.!?…:—–]["”’')]*$/.test(w) || /^[—–]$/.test(w);
  }));
  return out;
}
const PAUSE = g=> /[.!?…]/.test(g) ? 9 : /[—–]/.test(g) ? 6 : /[,;:]/.test(g) ? 5 : 0;
// Letter times: `step` ms a letter, a beat after punctuation (a run of it counts once), the whole line squeezed under `cap`.
function timeline(runs, step, cap){
  const items = []; let t = 0, pend = 0, word = null; const words = [];
  runs.forEach((r, ri)=> graphemes(r.s).forEach(g=>{
    if(/^\s+$/.test(g)){ items.push({g, ri, sp:true}); t += step; word = null; return; }
    if(pend){ t += pend * step; pend = 0; }
    if(!word){ word = {t, w:''}; words.push(word); }
    if(/\p{L}/u.test(g)) word.w += g;
    items.push({g, ri, t}); t += step;
    const p = PAUSE(g); if(p > pend) pend = p;
  }));
  const k = t > cap ? cap / t : 1;
  if(k < 1){ items.forEach(it=>{ if(it.t != null) it.t *= k; }); words.forEach(w=> w.t *= k); t = cap; }
  const bang = items.find(it=> it.g === '!');
  return {items, words, ms:Math.round(t + 130), bang:bang ? Math.round(bang.t) : null};
}
function render(runs, tl){
  const by = runs.map(()=> []);
  tl.items.forEach(it=> by[it.ri].push(it.sp ? esc(it.g) : `<i style="--d:${Math.round(it.t)}ms">${esc(it.g)}</i>`));
  return runs.map((r, i)=>{
    if(!r.em) return by[i].join('');
    const first = tl.items.find(it=> it.ri === i && it.t != null);
    return `<em class="sty-em${r.mark && !/\s/.test(r.s) ? ' is-pop' : ''}" style="--d:${first ? Math.round(first.t) : 0}ms">${by[i].join('')}</em>`;
  }).join('');
}
const STEP_MS = 27, CAP_MS = 4200;
function stepFor(mood, m){ return STEP_MS * (m || speedMul()) * (mood === 'whisper' ? 1.3 : 1); }
S.typeMs = (text, mood)=> timeline(runsOf(String(text || ''), true), stepFor(mood), CAP_MS * speedMul()).ms;
function moodOf(text){
  const s = String(text || '').trim();
  if(/\b(?:ha(?:ha)+|heh(?:eh)*|hah|hee+|ho ho)\b/i.test(s)) return 'laugh';
  if(/!/.test(s) || /\b[A-Z]{3,}\b/.test(s.replace(/\b(?:OK|HQ)\b/g, ''))) return 'shout';
  if(/(\.\.\.|…)$/.test(s)) return 'sad';
  if(/\?$/.test(s)) return 'ask';
  return '';
}

// ---- reactions on the portrait (Medium and up) ----
function zing(el, p, side){
  const r = el.getBoundingClientRect(), q = p.getBoundingClientRect(), z = document.createElement('span');
  z.className = 'sty-zing'; z.setAttribute('aria-hidden', 'true');
  // three lines fanning out from the portrait's outer top corner, outside the bubble; a dark stroke under a light one reads on the bubble and on the map
  const d = 'M12 3v5M4.5 6.5l3.6 3.4M19.5 6.5l-3.6 3.4';
  z.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke-linecap="round"><path d="${d}" stroke="currentColor" stroke-width="4.4"/><path d="${d}" style="stroke:var(--sty-plate-ink)" stroke-width="1.8"/></svg>`;
  z.style.left = (q.right - r.left - 4) + 'px'; z.style.top = (q.top - r.top - 18) + 'px'; // the top-right corner: inside the screen on either side
  el.appendChild(z);
  const g = G(); if(!g){ setTimeout(()=> z.remove(), 600); return; }
  const rot = 35;
  g.timeline({onComplete:()=> z.remove()}).fromTo(z, {scale:.3, opacity:0, rotation:rot}, {scale:1.15, opacity:1, rotation:rot, duration:.14, ease:'back.out(3)'}).to(z, {opacity:0, scale:1.3, duration:.3, delay:.3});
}
const REACT = {
  shout:(p, el, side)=>{ const g = G(); zing(el, p, side); g.timeline({onComplete:()=> g.set(p, {clearProps:'transform'})})
    .to(p, {scale:1.14, duration:.08, ease:'power2.out'}).to(p, {x:3, duration:.035, yoyo:true, repeat:7, ease:'none'}, '<').to(p, {x:0, scale:1, duration:.16, ease:'power2.out'}); },
  laugh:(p)=>{ const g = G(); g.timeline({onComplete:()=> g.set(p, {clearProps:'transform'})}).to(p, {y:-5, rotation:-5, duration:.11, ease:'power1.out', yoyo:true, repeat:5, transformOrigin:'50% 100%'}); },
  ask:(p, el, side)=>{ const g = G(); g.timeline({onComplete:()=> g.set(p, {clearProps:'transform'})}).to(p, {rotation:side === 'R' ? 11 : -11, duration:.18, ease:'power1.out'}).to(p, {rotation:0, duration:.4, ease:'back.out(2)', delay:.45}); },
  sad:(p)=>{ const g = G(); g.timeline({onComplete:()=> g.set(p, {clearProps:'transform'})}).to(p, {y:3, rotation:5, duration:.35, ease:'power1.inOut'}).to(p, {y:0, rotation:0, duration:.45, delay:.6}); },
};

// ---- the scene: one per conversation ----
let scene = null, demoN = 0;
function newScene(id, script, host){
  if(scene) S.end(scene.id);
  const sc = {id, script:script || {}, host:host || null, alive:true, sides:{}, faces:{}, lastWho:null, otherWho:null, lastSide:null, timers:[], typing:null, layer:null, mo:null, first:true};
  sc.later = (fn, ms)=>{ const t = setTimeout(()=>{ const i = sc.timers.indexOf(t); if(i >= 0) sc.timers.splice(i, 1); if(sc.alive) call(fn); }, Math.max(0, ms | 0)); sc.timers.push(t); return t; };
  sc.later(()=> S.end(id), 120000); // belt and braces: a scene never outlives two minutes, whatever happened to its conversation
  return sc;
}
function ambientHTML(k, hostH){
  const R = (a, b)=> (a + Math.random()*(b - a)).toFixed(2);
  if(k === 'fireflies') return '<div class="sty-amb">' + Array.from({length:11}, ()=>
    `<i class="sty-ff" style="left:${R(4, 96)}%; top:${R(28, 94)}%; --dx:${R(-44, 44)}px; --dy:${R(-56, 12)}px; --t:${R(5, 9)}s; --dl:-${R(0, 8)}s; --bl:${R(1.6, 3.2)}s"></i>`).join('') + '</div>';
  if(k === 'embers') return '<div class="sty-amb">' + Array.from({length:12}, ()=>
    `<i class="sty-spark" style="left:${R(3, 97)}%; --dx:${R(-50, 50)}px; --rise:-${Math.round(hostH * (0.35 + Math.random()*0.4))}px; --t:${R(4, 7.5)}s; --dl:-${R(0, 7)}s"></i>`).join('') + '</div>';
  if(k === 'rain') return '<div class="sty-amb sty-rain"><i></i><i class="r2"></i></div>';
  return '';
}
// Which conversations are staged as scenes (a script may also carry its own scene / ambient). Keyed by DIALOGUES id; 'boss_banter@birds'
// (the Hummingbird voices) reads 'boss_banter'.
const STORY_SCENES = {boss_banter:{scene:'boss'}, outskirts_reveal:{scene:'story'}, scale_trail_finale:{scene:'story', ambient:'embers'},
  well_m1:{ambient:'fireflies'}, cur_m4_glowpool:{ambient:'fireflies'}, cur_m8_wisp:{ambient:'fireflies'}, cur_m3_ashcairn:{ambient:'rain'}};
S.scenes = STORY_SCENES;
function startLayer(sc, el, firstMs){
  const s = Object.assign({}, STORY_SCENES[String(sc.id).split('@')[0]] || {}, sc.script || {});
  const kind = s.scene === 'boss' || s.scene === 'story' ? s.scene : '', amb = /^(fireflies|rain|embers)$/.test(s.ambient || '') ? s.ambient : '';
  if((!kind && !amb) || !at('low')) return;
  const host = sc.host, fight = inFight();
  const h = document.createElement('div'); h.setAttribute('aria-hidden', 'true');
  h.className = 'sty-scene' + (kind ? ' sty-k-' + kind : '') + (amb ? ' sty-a-' + amb : '') + (host ? ' is-hosted' : '') + (fight ? ' in-fight' : '');
  let html = '<div class="sty-vig"></div>';
  if(kind === 'story' && at('high') && !fight) html = '<div class="sty-blur"></div>' + html;
  if(kind) html += '<div class="sty-bar t"><i></i></div><div class="sty-bar b"><i></i></div>';
  if(amb && at('med') && !fight) html += ambientHTML(amb, host ? host.clientHeight || 300 : (root.innerHeight || 800));
  h.innerHTML = html; (host || document.body).appendChild(h); sc.layer = h;
  void h.offsetWidth; h.classList.add('is-on'); if(kind) h.classList.add('is-bars'); // one style flush, then the fades and the bars run on CSS
  if(kind) sound('storyLetterbox', kind === 'boss');
  // In a live fight the frame is only a sting: two glowing edge lines (no bars over the hand or the controls) and the vignette, for the first line.
  if(fight) sc.later(()=> h.classList.remove('is-on', 'is-bars'), Math.min(3200, firstMs + 1400));
  // The dock's hide button is the skip: the scene layer goes with the conversation and comes back with it.
  const dock = !host && el.closest ? el.closest('.dialogue-dock') : null;
  if(dock && typeof MutationObserver !== 'undefined'){ const sync = ()=> h.classList.toggle('is-away', dock.classList.contains('is-collapsed')); sync(); sc.mo = new MutationObserver(sync); sc.mo.observe(dock, {attributes:true, attributeFilter:['class']}); }
}
function addNext(el){
  if(!el || !el.isConnected || el.querySelector('.dlg-replies') || el.classList.contains('dlg-to-you')) return;
  const b = el.querySelector('.dlg-body'); if(!b || b.querySelector('.sty-next')) return;
  const n = document.createElement('span'); n.className = 'sty-next' + (at('low') ? '' : ' is-still'); n.setAttribute('aria-hidden', 'true'); b.appendChild(n);
}
function finishTyping(sc, early){
  const ty = sc.typing; if(!ty || ty.done) return; ty.done = true; sc.typing = null;
  ty.timers.forEach(t=>{ clearTimeout(t); const i = sc.timers.indexOf(t); if(i >= 0) sc.timers.splice(i, 1); });
  if(ty.tEl) ty.tEl.classList.add('is-done');
  if(early && ty.react && !ty.react.fired){ clearTimeout(ty.react.t); ty.react.fired = true; call(ty.react.fn); }
  addNext(ty.el);
}

// the talking line is lit; the others dim and lose their go-on arrow
function dimOthers(el){
  const lines = el.parentElement;
  if(lines) [...lines.children].forEach(c=>{ if(c !== el){ c.classList.remove('sty-lit'); c.classList.add('sty-dim'); const n = c.querySelector('.sty-next'); if(n) n.remove(); } });
  el.classList.add('sty-lit');
}
// ---- the game's calls ----
S.line = function(el, line, info){
  if(!el || S.off) return null;
  info = info || {}; line = line || {};
  ensureCss();
  const id = String(info.id || ''), who = String(line.who || info.who || ''), sp = info.sp || {};
  if(!scene || scene.id !== id || !scene.alive) scene = newScene(id, info.script, info.host);
  const sc = scene, lines = el.parentElement, g = G(), anim = !!g && at('low');
  const people = peopleOf(who, sp);
  el.classList.add('sty-line'); el.dataset.who = who; el.style.setProperty('--sty-c', 'var(--sty-' + people + ')');
  // sides: the first speaker stands left; a new one takes the side the last speaker isn't on, and keeps it for the scene
  let side = sc.sides[who]; if(!side){ side = sc.lastSide === 'L' ? 'R' : 'L'; sc.sides[who] = side; }
  const changed = sc.lastWho !== who; if(changed && sc.lastWho) sc.otherWho = sc.lastWho;
  sc.lastWho = who; sc.lastSide = side;
  el.classList.add(side === 'R' ? 'sty-r' : 'sty-l');
  if(lines) lines.classList.toggle('sty-still', !anim); // Effects None / reduced motion: the dimming and the portraits change without a fade
  if(sc.typing) finishTyping(sc, true);
  dimOthers(el);
  const p = el.querySelector('.dlg-portrait');
  if(p) sc.faces[who] = {node:p.cloneNode(true), people};
  // the other party stays in view, dimmed, at the far corner, once their own line has left the dock
  const of = sc.otherWho && sc.faces[sc.otherWho];
  if(of && !(lines && [...lines.children].some(c=> c !== el && c.dataset.who === sc.otherWho))){
    const chip = document.createElement('span'); chip.className = 'sty-listen'; chip.setAttribute('aria-hidden', 'true');
    chip.style.setProperty('--sty-lc', 'var(--sty-' + of.people + ')'); chip.appendChild(of.node.cloneNode(true)); el.appendChild(chip);
  }
  const text = String(line.text || ''), mood = /^(shout|laugh|whisper|ask|sad)$/.test(line.mood || '') ? line.mood : moodOf(text);
  if(mood === 'whisper') el.classList.add('sty-whisper');
  // the words: translated first (the page translator can't match a sentence split into letters), then written letter by letter
  const tEl = el.querySelector('.dlg-text'), typing = anim && !info.instant && !!tEl && !!text;
  let tl = {ms:0, words:[], bang:null};
  if(tEl && text){
    let shown = text; try{ const tr = root.BramblewoodI18n && root.BramblewoodI18n.translate(text); if(tr) shown = tr; }catch(e){}
    const english = shown === text && /^en\b/i.test((document.documentElement && document.documentElement.lang) || 'en'); // capitals stress English only (German capitalises every noun)
    const runs = runsOf(shown, english), m = (info.mul || 1) * speedMul();
    tl = timeline(runs, stepFor(mood, m), CAP_MS * m);
    tEl.setAttribute('translate', 'no'); tEl.classList.add('sty-tw'); if(!typing) tEl.classList.add('is-done');
    tEl.innerHTML = render(runs, tl);
  }
  const ms = typing ? tl.ms : 0;
  // entrance: the line slides in from its side; a new speaker's portrait rises and settles, the same speaker nods
  if(anim){
    g.killTweensOf(el);
    g.from(el, {x:side === 'R' ? 30 : -30, opacity:0, duration:.34, ease:'power3.out', clearProps:'transform,opacity'});
    if(p){
      g.killTweensOf(p);
      if(changed){
        const t = g.timeline({onComplete:()=> g.set(p, {clearProps:'transform,opacity'})})
          .fromTo(p, {y:16, scale:.5, rotation:side === 'R' ? 10 : -10, opacity:0}, {y:0, scale:1, rotation:0, opacity:1, duration:.46, ease:'back.out(2.2)', delay:.05});
        if(at('med')) t.to(p, {scaleY:.9, scaleX:1.07, duration:.08, ease:'power1.out', transformOrigin:'50% 100%'}).to(p, {scaleY:1, scaleX:1, duration:.16, ease:'back.out(3)'});
        sound('storyArrive');
      } else g.fromTo(p, {y:-3}, {y:0, duration:.3, ease:'bounce.out', clearProps:'transform'});
    }
  }
  if(sc.first){ sc.first = false; startLayer(sc, el, ms); }
  // a faction general's warning keeps its red flare (FX.F), now that the story staging owns the line
  if(/^warn:/.test(id) && at('med')) try{ const F = root.FX && root.FX.F; if(F && F.factionWarning) F.factionWarning(el, {faction:typeof loadFactionChoice === 'function' ? loadFactionChoice() : null}); }catch(e){}
  // typing: the voice (one babble syllable a word, in the speaker's people's voice), the reaction at its moment, the end of the line
  if(typing){
    const ty = {el, tEl, done:false, timers:[], react:null}; sc.typing = ty;
    const voice = VOICE_OF[who] || VOICE[people] || 'folk', dock = el.closest ? el.closest('.dialogue-dock') : null;
    let lastT = -1e9;
    tl.words.forEach((w, i)=>{
      if(!w.w || (mood === 'whisper' && i % 2) || w.t - lastT < 75) return; lastT = w.t;
      ty.timers.push(sc.later(()=>{ if(document.hidden || (dock && dock.classList.contains('is-collapsed'))) return; sound('babble', voice, w.w.slice(0, 3)); }, w.t));
    });
    ty.timers.push(sc.later(()=> finishTyping(sc, false), ms));
  } else addNext(el);
  const fire = p && g && at('med') && REACT[mood];
  if(fire){
    const when = mood === 'shout' ? (tl.bang != null && typing ? tl.bang + 40 : 90) : mood === 'laugh' ? 160 : ms + 60;
    const r = {fired:false, fn:()=>{ if(p.isConnected) fire(p, el, side); }};
    r.t = sc.later(()=>{ if(!r.fired){ r.fired = true; r.fn(); } }, when);
    if(sc.typing) sc.typing.react = r;
  }
  return {ms, typing, side, people, mood};
};
S.mine = function(el){
  if(!el || S.off) return; ensureCss();
  if(scene && scene.typing) finishTyping(scene, true);
  dimOthers(el);
};
S.complete = function(){ const sc = scene; if(!sc || !sc.typing || sc.typing.done) return false; finishTyping(sc, true); return true; };
S.end = function(id){
  const sc = scene; if(!sc || (id != null && sc.id !== String(id))) return;
  scene = null; sc.alive = false; sc.timers.forEach(clearTimeout); sc.timers.length = 0; if(sc.typing) sc.typing.done = true; sc.typing = null;
  if(sc.mo) try{ sc.mo.disconnect(); }catch(e){}
  const h = sc.layer; sc.layer = null;
  if(h){ h.classList.remove('is-on', 'is-bars'); setTimeout(()=> h.remove(), rm() ? 0 : 650); }
};
S._state = ()=> scene ? {id:scene.id, timers:scene.timers.length, typing:!!scene.typing, layer:!!scene.layer} : null;

// ---- battlefield speech bubbles (barks, chatter, emotes): squash-pop from the tail, the tail wiggles, a clean lift and fade ----
S.bubble = function(b, holdS){
  const g = G(); if(!b || !g || S.off || !at('low')) return false;
  ensureCss(); b.classList.add('sty-bub');
  const emote = b.classList.contains('is-emote');
  g.set(b, {transformOrigin:'50% 100%'});
  g.timeline({onComplete:()=> b.remove()})
    .fromTo(b, {opacity:0, y:8, scaleX:.35, scaleY:.25}, {opacity:1, y:-2, scaleX:emote ? 1.2 : 1.1, scaleY:emote ? .86 : .92, duration:.15, ease:'power2.out'})
    .to(b, {y:0, scaleX:.96, scaleY:1.06, duration:.1, ease:'sine.inOut'})
    .to(b, {scaleX:1, scaleY:1, duration:.12, ease:'back.out(3)'})
    .to(b, {duration:holdS != null ? holdS : 1.4})
    .to(b, {opacity:0, y:-7, scaleX:.9, scaleY:.9, duration:.2, ease:'power1.in'});
  return true;
};

// ---- the Effects Lab and the tests: a script in a stand-in dock inside `host` ----
// script {scene?, ambient?, lines:[{who, name, icon, people?, text, mood?}]}; opts {maxLines, hold (ms after the typing), mul (typing speed), tail}
S.demo = function(host, script, opts){
  opts = opts || {}; host = host || document.body; script = script || {lines:[]}; ensureCss();
  const id = 'demo:' + (++demoN), dock = document.createElement('div');
  dock.className = 'dialogue-dock has-lines sty-demo'; dock.style.cssText = 'position:absolute; left:4%; top:16%; z-index:6; width:min(360px, 88%);';
  dock.innerHTML = '<div class="dlg-lines"></div>'; host.appendChild(dock);
  const lines = dock.firstChild, max = opts.maxLines || ((host.clientWidth || 999) < 520 ? 1 : 2), wait = ms=> new Promise(r=> setTimeout(r, ms));
  return (async ()=>{
    for(const ln of script.lines || []){
      if(!dock.isConnected) break;
      const b = document.createElement('div'); b.className = 'dlg-line';
      b.innerHTML = `<span class="dlg-portrait dlg-portrait-ico">${esc(ln.icon || '💬')}</span><div class="dlg-body"><div class="dlg-name">${esc(ln.name || ln.who)}</div><div class="dlg-text">${esc(ln.text)}</div></div>`;
      lines.appendChild(b); while(lines.children.length > max) lines.firstElementChild.remove();
      const st = S.line(b, ln, {id, script, sp:{people:ln.people}, host, mul:opts.mul});
      await wait((st ? st.ms : 0) + (opts.hold != null ? opts.hold : 900));
    }
    await wait(opts.tail != null ? opts.tail : 500);
    S.end(id); dock.remove();
  })();
};
})(typeof window !== 'undefined' ? window : globalThis);
