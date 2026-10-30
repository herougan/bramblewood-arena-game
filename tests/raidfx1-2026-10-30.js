#!/usr/bin/env node
// Package RAIDFX1 (2026-10-30, owner 21:36):
//   1. "Why is the tentacle slash in raid so laggy? the damage should only come out once the tentacle lands on the cards"
//      - FX.F's Tentacle Smack draws its limb once, in an <svg> the size of the limb's own box, inside a wrapper moved by transform and
//        opacity only (will-change while it swings, dropped after); no SVG-child transforms, no filter on the bramble tile's flare.
//      - a growing limb reaches each struck cell in turn (onReach, 'fxf:tentacle' {phase:'reach'}); every cell is reached by impact.
//      - arena_app.js raidSmackStage: each struck unit's number, Health and death land as the limb reaches it; the upkeep's redraw waits
//        for the limb; no tentacle (Effects None, FX.F missing): everything lands as the smack event plays. The engine is untouched.
//   2. "Dont need the handshake symbol to denote allies in multiplayer dungeons/raids": no 🤝 corner marker on an ally's card; the
//      Esprit skill keeps its 🤝 chip.
// The browser half (frame cost, the order on screen at 1366 and 390): tests/e2e/raidfx1_2026_10_30.py.
'use strict';
const fs = require('fs'), path = require('path');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');

// ---- 2. the ally marker
ok(!/is-ally-card::after\{content:'🤝'/.test(tpl) && !/is-ally-card[^{]*\{[^}]*content:\s*['"]🤝/.test(tpl), '2. no 🤝 marker on an ally\'s card (.is-ally-card::after)');
ok(/c\.allyOf \? 'is-ally-card' : ''/.test(src), '2. ally cards keep their class (only the marker went)');
ok(/if\(e\.esprit\) out\.push\(`<span title="Esprit">\$\{iconHTML\('esprit', '🤝'\)\}/.test(src), '2. the Esprit skill keeps its 🤝 chip');

// ---- 1a. the limb's layer (static shape)
const tent = fxf.slice(fxf.indexOf('M.tentacleSmack = function'), fxf.indexOf('// Tail Sweep (every front-row card)'));
ok(tent.length > 2000, '1. FX.F tentacleSmack found');
ok(/const bm = w\*\.75; tentacleSVG\.box = \{x:Math\.floor/.test(fxf) && /sv\.setAttribute\('viewBox', `\$\{bx\.x\} \$\{bx\.y\} \$\{bx\.w\} \$\{bx\.h\}`\)/.test(tent), '1. the svg is only the limb\'s own box (viewBox), not the window');
ok(!/sv\.setAttribute\('width', VW\(\)\)/.test(tent), '1. no window-sized svg');
ok(!/svgOrigin/.test(tent) && !/g\.set\(body|\.to\(body|fromTo\(body/.test(tent), '1. no tween on the svg\'s inner <g> (an SVG child\'s transform repaints the limb every frame)');
const tweens = tent.match(/\.(?:to|fromTo|set)\((\w+),/g) || [];
ok(tweens.length >= 8 && tweens.every(t=> /\(wrap,/.test(t)), '1. every tween moves the wrapper (' + tweens.join(' ') + ')');
const props = (tent.match(/\{(?:[^{}]|\{[^{}]*\})*\}/g) || []).join(' ');
ok(!/\b(?:left|top|width|height|filter|boxShadow|box-shadow)\s*:\s*[^'"`]/.test(tent.slice(tent.indexOf('wrap.classList.add(\'is-moving\')'))) , '1. the swing tweens transform and opacity only');
ok(/\.fxf \.fxf-tentwrap\.is-moving\{will-change:transform, opacity;\}/.test(fxf) && /wrap\.classList\.add\('is-moving'\)/.test(tent) && /wrap\.classList\.remove\('is-moving'\)/.test(tent), '1. will-change only while it swings');
ok(/g\.set\(wrap, \{transformOrigin:origin, scale:1, x:0, y:0, opacity:0\}\)/.test(tent) && /immediateRender:false/.test(tent), '1. the first frame is full size and unseen (rastered sharp before it grows)');
ok(!/getBoundingClientRect|getBBox|offsetWidth|getComputedStyle/.test(tent.slice(tent.indexOf('const S = TENT.slam/1000'))), '1. no layout reads once it swings');
ok(/@keyframes u3BrambleSmack\{0%\{scale:1;\} 30%\{scale:1\.06;\} 100%\{scale:1;\}\}/.test(tpl) && !/@keyframes u3BrambleSmack\{[^}]*filter/.test(tpl), '1. the bramble tile winds up by scale (no CSS filter animation)');
ok(/fxf-bflare/.test(tent) && /f\.animate\(\[\{opacity:0\}, \{opacity:1, offset:\.3\}, \{opacity:0\}\]/.test(tent), '1. the bramble\'s glow is an overlay fading in and out');
ok(/lite: !env\.fxAtLeast\('med'\)/.test(fxf) && /if\(!opts\.lite\) smokePuff/.test(tent) && /if\(!opts\.lite\) ring/.test(tent), '1. Effects Low: no smoke, no ring');
ok(/reduced = RM\(\) \|\| !g/.test(tent) && /if\(reduced\)\{ \/\/ 2026-10-19 \(package TF\)/.test(tent) && /const hit = \(\)=>\{ reachAll\(\); call\(opts\.onImpact\)/.test(tent), '1. reduced motion: the still limb reaches every cell as it shows');

// ---- 1b. FX.F in a fake DOM: the reach order and that every cell is reached once (no GSAP: the reduced path; with a GSAP stub: the swing)
function fakeDom(){
  const listeners = {};
  const mk = (tag)=>{ const el = {tagName: tag, style: {}, dataset: {}, children: [], classList: {s: new Set(), add(c){ this.s.add(c); }, remove(c){ this.s.delete(c); }, contains(c){ return this.s.has(c); }},
    setAttribute(k, v){ this['@' + k] = v; }, getAttribute(k){ return this['@' + k]; }, appendChild(c){ this.children.push(c); c.parentElement = this; c.isConnected = true; return c; },
    remove(){ this.isConnected = false; }, querySelector(){ return null; }, querySelectorAll(){ return []; }, animate(){ return {}; }, getClientRects(){ return [1]; }, isConnected: true};
    Object.defineProperty(el, 'innerHTML', {set(v){ this._html = v; }, get(){ return this._html || ''; }}); return el; };
  const head = mk('head'), body = mk('body');
  const document = {head, body, hidden: false, createElement: mk, createElementNS: (_, t)=> mk(t), getElementById: ()=> null, querySelector: ()=> null, querySelectorAll: ()=> [],
    addEventListener(t, f){ (listeners[t] = listeners[t] || []).push(f); }, dispatchEvent(e){ (listeners[e.type] || []).forEach(f=> f(e)); }};
  return {document, mk};
}
function loadFxf(withGsap){
  const {document, mk} = fakeDom(), sandbox = {document, innerWidth: 1366, innerHeight: 768, matchMedia: ()=> ({matches: !withGsap}), performance: {now: ()=> Date.now()},
    CustomEvent: function(type, o){ this.type = type; this.detail = o && o.detail; }, setTimeout: (f)=>{ f(); return 0; }, requestAnimationFrame: null};
  let gsap;
  if(withGsap){ // a timeline stub: records adds at their positions and runs everything in time order on play
    gsap = {globalTimeline: {paused: ()=> false, timeScale: ()=> 1}, set(){}, to(){ return {}; }, delayedCall(){}, timeline(){ const items = []; let end = 0;
      const tl = {items, to(t, v, pos){ const d = (v && v.duration) || 0; const at = pos == null ? end : typeof pos === 'number' ? pos : end; end = Math.max(end, at + d); return tl; },
        fromTo(t, a, v, pos){ return tl.to(t, v, pos); }, add(f, pos){ const at = pos == null ? end : pos; items.push({at, f}); end = Math.max(end, at); return tl; },
        duration: ()=> end, time(){ return 0; }, progress: ()=> 1, kill(){}, play(){ items.slice().sort((a, b)=> a.at - b.at).forEach(x=> x.f()); }};
      return tl; }};
    sandbox.gsap = gsap;
  }
  sandbox.window = sandbox; sandbox.FX = {};
  const code = fxf.replace(/\}\)\(typeof window !== 'undefined' \? window : globalThis\);?\s*$/, '})(root);');
  new Function('root', 'document', 'gsap', 'performance', 'CustomEvent', 'setTimeout', 'requestAnimationFrame', code)(sandbox, document, gsap, sandbox.performance, sandbox.CustomEvent, sandbox.setTimeout, null);
  return {F: sandbox.FX.F, document, mk, gsap};
}
const rect = (l, t, w, h)=> ({left: l, top: t, width: w, height: h, right: l + w, bottom: t + h});
{ // reduced motion (no GSAP): every cell reached once, at the hit, before onImpact
  let F; try{ F = loadFxf(false).F; }catch(e){ console.log('  (fx-f load)', e.message); }
  ok(F && typeof F.tentacleSmack === 'function', '1. FX.F loads in the fake DOM');
  if(F){ const seen = []; let imp = -1;
    F.tentacleSmack([rect(100, 100, 80, 110), rect(100, 230, 80, 110), rect(100, 360, 80, 110)], {onReach: i=> seen.push(i), onImpact: ()=>{ imp = seen.length; }});
    ok(seen.join() === '0,1,2' && imp === 3, `1. reduced motion: every cell reached once, before impact (${seen} / ${imp})`); }
}
{ // a growing column: reached front to back (by distance from the base), the tip's cell last, all before or at impact
  let L; try{ L = loadFxf(true); }catch(e){ console.log('  (fx-f load, gsap)', e.message); }
  if(L){ const {F, document, gsap, mk} = L; let tl = null; const tlOrig = gsap.timeline; gsap.timeline = (v)=>{ tl = tlOrig(v); return tl; };
    const origin = mk('div'); origin.getBoundingClientRect = ()=> rect(110, 0, 80, 60);
    const seen = [], at = []; let imp = -1;
    F.tentacleSmack([rect(100, 100, 80, 110), rect(100, 230, 80, 110), rect(100, 360, 80, 110)], {origin, onReach: i=> seen.push(i), onImpact: ()=>{ imp = seen.length; }});
    if(tl){ tl.items.forEach(x=> at.push(+x.at.toFixed(3))); tl.play(); }
    ok(seen.join() === '0,1,2' && imp === 3, `1. a growing column reaches its cells front to back, all by impact (${seen} / ${imp})`);
    ok(at.length >= 3 && at[0] < at[1] && at[1] <= .22 + 1e-9, `1. ...each at its own moment of the 0.22 s slam (${at})`);
    // a row from the bramble's side: left to right
    tl = null; const s2 = []; F.tentacleSmack([rect(200, 300, 80, 110), rect(300, 300, 80, 110), rect(400, 300, 80, 110), rect(500, 300, 80, 110)], {origin, horizontal: true, onReach: i=> s2.push(i)});
    const at2 = tl ? tl.items.map(x=> x.at) : []; if(tl) tl.play();
    ok(s2.join() === '0,1,2,3' && at2.length >= 4 && at2.slice(0, 3).every((t, i, a)=> !i || t >= a[i - 1]), `1. a row from the bramble's side reaches left to right (${s2}; ${at2.map(t=> t.toFixed(3))})`);
    gsap.timeline = tlOrig; }
}

// ---- 1c. arena_app.js raidSmackStage in a sandbox
const a = src.indexOf('const RAID_SMACK_WAIT_MS'), b = src.indexOf('\n}', src.indexOf('function raidSmackStage(')) + 2;
ok(a > 0 && b > a, '1. raidSmackStage found');
ok(/const smackSt = m\.raidFull \? fightSafe\(\(\)=> raidSmackStage\(drawEvents, m\)\) : null;/.test(src)
  && /drawEvents\.forEach\(ev=>\{ pushLog\(ev\); if\(smackSt && smackSt\.defer\(ev\)\) return; renderVfxForEvent\(ev\); if\(smackSt\) smackSt\.played\(ev\); \}\)/.test(src), '1. the upkeep plays the smack through raidSmackStage (deaths held back)');
ok(/await Promise\.all\(\[sleep\(upMs\), smackSt \? smackSt\.wait\(\)\.catch\(\(\)=>\{\}\) : null\]\)/.test(src) && /if\(smackSt\) fightSafe\(\(\)=> smackSt\.end\(\), 'raidSmackStage'\);/.test(src), '1. the upkeep\'s redraw waits for the limb');
ok(/const smackHeld = \(matchState && matchState\._smackHeld && matchState\._smackHeld\[String\(uid\)\]\) \|\| 0;/.test(src), '1. a struck unit shows its Health from before the smack until the limb reaches it');
ok(!/bramblewood-engine/.test(src.slice(a, b)), '1. presentation only');
async function stageRun(claim){
  const log = [], cards = {u1: {hp: 4}, u2: {hp: 0}}, els = {};
  ['u1', 'u2'].forEach(u=>{ els[u] = {getBoundingClientRect: ()=> rect(0, 0, 80, 110), querySelector: ()=> ({})}; });
  const m = {speedMult: 10, players: {1: {reserve: []}, 2: {reserve: []}}}; // 10x: the death's beat 14 ms, its play-out 65 ms
  const env = {matchState: m, boardCardEl: u=> els[u], dnFloat: (h, d)=> log.push('num:' + h.u + ':' + d), fxHostAt: el=> ({u: Object.keys(els).find(k=> els[k] === el)}),
    updateCardHpDisplay: u=> log.push('hp:' + u + ':' + (cards[u].hp + ((m._smackHeld || {})[u] || 0))), currentCardByUid: u=> cards[u], pl2SetStat: ()=>{},
    renderVfxForEvent: ev=> log.push((ev.type === 'death' ? 'death:' : 'ev:') + (ev.uid || ev.type)), sleep: ms=> new Promise(r=> setTimeout(r, ms)),
    document: {querySelector: ()=> null}, performance: {now: ()=> Date.now()}};
  const fn = new Function(...Object.keys(env), 'let floatDetachDepth = 0;' + src.slice(a, b) + '; return raidSmackStage;')(...Object.values(env));
  const smack = {type: 'raidSmack', kind: 'column', dmg: 1, struck: [{uid: 'u1', dmg: 1}, {uid: 'u2', dmg: 1}]}, death = {type: 'death', uid: 'u2'};
  const st = fn([smack, death], m);
  [smack, death].forEach(ev=>{ if(st.defer(ev)) return; env.renderVfxForEvent(ev); if(claim && ev === smack) ev._smack.claimed = true; st.played(ev); });
  const before = log.slice();
  if(claim){ const h = smack._smack; h.reach('u1'); log.push('|'); h.reach('u2'); log.push('|'); h.done(); }
  await st.wait(); st.end();
  return {before, log, m};
}
(async ()=>{
  { const r = await stageRun(true);
    ok(r.before.join() === 'ev:raidSmack', `1. with the limb on its way nothing lands and the death waits (${r.before})`);
    ok(r.log.join().startsWith('ev:raidSmack,num:u1:1,hp:u1:4,|,num:u2:1,hp:u2:0,|'), `1. each unit's number and Health land as the limb reaches it (${r.log})`);
    ok(r.log.includes('death:u2') && r.log.indexOf('death:u2') > r.log.indexOf('num:u2:1'), '1. the death plays after its number');
    ok(r.m._smackHeld === null, '1. the held Health is released at the end'); }
  { const r = await stageRun(false);
    ok(r.before.join() === 'ev:raidSmack,num:u1:1,hp:u1:4,num:u2:1,hp:u2:0,death:u2', `1. no tentacle (Effects None): everything lands as the smack plays (${r.before})`); }
  console.log(`raidfx1: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
})().catch(e=>{ console.log('  ✗ crashed:', e && e.stack); process.exit(1); });
