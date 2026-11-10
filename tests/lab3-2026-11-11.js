#!/usr/bin/env node
// Package LAB3 (2026-11-11, owner: "add much more vfx we can consider adding to our game in the master hub"): bramblewood-fx-ideas2.js
// (window.IdeasFX2), 47 lab-only candidate effects with three looks each, shown in the Effects Lab's "Ideas 11-11" tab.
// Here, in a fake DOM with a fake GSAP clock: every effect exists and resolves for every look (and every crit element), calls onImpact and
// onDone once, removes every node it added, never has more than 38 overlay nodes alive, puts back any card it moved (clearProps last), and under
// prefers-reduced-motion shows one still node and moves nothing. Plus the source rules (no CSS filter / blend modes; not in the game bundle;
// the Lab tab, its build and the catalogue list every effect). The browser half (each look played in the built Lab): tests/e2e/lab3_2026_11_11.py.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const SRC = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-ideas2.js'), 'utf8');
const LABTAB = fs.readFileSync(path.join(ROOT, 'tools', 'effects-lab', 'fxlab-ideas2.js'), 'utf8');
const BUILD = fs.readFileSync(path.join(ROOT, 'tools', 'effects-lab', 'build.py'), 'utf8');
const LAB2 = fs.readFileSync(path.join(ROOT, 'tools', 'effects-lab', 'fxlab-lab2.js'), 'utf8');
const HUB = fs.readFileSync(path.join(ROOT, 'tools', 'hub', 'build.py'), 'utf8');
const CAT = fs.readFileSync(path.join(ROOT, 'docs', 'effects-catalogue.md'), 'utf8');
const ASM = fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8');
const APP = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const RUNALL = fs.readFileSync(path.join(ROOT, 'tests', 'run-all.sh'), 'utf8');

// ---------------------------------------------------------------- a fake DOM: enough for the module (elements, style, a body, boxes)
function fakeDom(){
  let uid = 0;
  const mkStyle = ()=>{ const st = {setProperty(k, v){ this[k] = v; }}; Object.defineProperty(st, 'cssText', {set(v){ this._css = v; }, get(){ return this._css || ''; }}); return st; };
  const mk = (tag, box)=>{
    const el = {nodeType:1, tagName:String(tag).toUpperCase(), _id:++uid, style:mkStyle(), children:[], parentNode:null, attrs:{}, _box:box || null, textContent:'',
      classList:{s:new Set(), add(c){ this.s.add(c); }, remove(c){ this.s.delete(c); }, contains(c){ return this.s.has(c); }},
      setAttribute(k, v){ this.attrs[k] = String(v); }, getAttribute(k){ return this.attrs[k]; }, removeAttribute(k){ delete this.attrs[k]; },
      appendChild(c){ if(c.parentNode) c.remove(); this.children.push(c); c.parentNode = this; return c; },
      remove(){ if(this.parentNode){ const p = this.parentNode; p.children = p.children.filter(x=> x !== this); this.parentNode = null; } },
      querySelector(sel){ if(sel === '.card-tile') return this.children.find(c=> c.classList.contains('card-tile')) || null; return null; },
      querySelectorAll(){ return []; }, closest(){ return null; },
      getBoundingClientRect(){ const b = this._box || {x:0, y:0, w:0, h:0}; return {left:b.x, top:b.y, width:b.w, height:b.h, right:b.x + b.w, bottom:b.y + b.h}; }};
    Object.defineProperty(el, 'className', {set(v){ el.classList.s = new Set(String(v).split(/\s+/).filter(Boolean)); }, get(){ return [...el.classList.s].join(' '); }});
    Object.defineProperty(el, 'innerHTML', {set(v){ el._html = v; }, get(){ return el._html || ''; }});
    return el;
  };
  const head = mk('head'), body = mk('body'), html = mk('html');
  const byId = (root, id)=>{ for(const c of root.children){ if(c.id === id) return c; const f = byId(c, id); if(f) return f; } return null; };
  const document = {head, body, documentElement:html, createElement:t=> mk(t), getElementById:id=> byId(head, id) || byId(body, id)};
  return {document, mk, body};
}

// ---------------------------------------------------------------- a fake GSAP on a fake clock (tweens of plain objects run on ticks; tweens and sets of elements are logged)
function fakeGsap(){
  const g = {now:0, tweens:[], log:[], domCalls:0};
  const isEl = t=> t && t.nodeType === 1;
  const logEl = (t, v, kind)=>{ g.domCalls++; g.log.push({el:t, clear:!!(v && v.clearProps), kind}); };
  g.to = (target, v)=>{
    if(isEl(target)){ logEl(target, v, 'to'); return {kill(){}}; }
    const from = {}; Object.keys(v).forEach(k=>{ if(typeof v[k] === 'number' && !['duration', 'delay'].includes(k)) from[k] = target[k] || 0; });
    const tw = {target, v, from, start:g.now + (v.delay || 0), dur:v.duration || 0, dead:false, kill(){ this.dead = true; }}; g.tweens.push(tw); return tw;
  };
  g.set = (target, v)=>{ if(isEl(target)) logEl(target, v, 'set'); return {kill(){}}; };
  g.timeline = (tv)=>{ let end = 0; const tl = {to(t, v){ if(isEl(t)) logEl(t, v, 'tl'); end += (v && v.duration) || 0; return tl; }, kill(){}};
    if(tv && tv.onComplete){ const st = {t:0}; g.tweens.push({target:st, v:{t:1}, from:{t:0}, start:g.now, dur:.6, dead:false, onDone:tv.onComplete, kill(){ this.dead = true; }}); }
    return tl; };
  g.globalTimeline = {timeScale(){ return 1; }};
  g.tick = dt=>{ g.now += dt; for(const tw of g.tweens.slice()){ if(tw.dead || g.now < tw.start) continue; const u = tw.dur ? Math.min(1, (g.now - tw.start)/tw.dur) : 1;
      Object.keys(tw.from).forEach(k=>{ tw.target[k] = tw.from[k] + (tw.v[k] - tw.from[k])*u; }); try{ tw.v.onUpdate && tw.v.onUpdate(); }catch(e){}
      if(u >= 1){ tw.dead = true; try{ tw.v.onComplete && tw.v.onComplete(); }catch(e){} try{ tw.onDone && tw.onDone(); }catch(e){} } }
    g.tweens = g.tweens.filter(t=> !t.dead); };
  return g;
}

// ---------------------------------------------------------------- the module in a sandbox
function load(reduced){
  const {document, mk, body} = fakeDom(), gsap = fakeGsap();
  const sb = {document, gsap, matchMedia:()=> ({matches:!!reduced}), performance:{now:()=> gsap.now*1000}, console, Math, Promise, Object, Array, Set, Map, String, Number, JSON};
  sb.window = sb; vm.createContext(sb); vm.runInContext(SRC, sb, {filename:'bramblewood-fx-ideas2.js'});
  // the stage: two foes and a castle above, three units below, a field box, a HUD (button, pill, deck)
  const card = (x, y)=>{ const w = mk('div', {x, y, w:92, h:115}); w.className = 'board-card'; const t = mk('div', {x, y, w:92, h:115}); t.className = 'card-tile'; w.appendChild(t); body.appendChild(w); return w; };
  const foe = [card(300, 100), card(520, 100)], castle = card(410, 100), mine = [card(300, 300), card(410, 300), card(520, 300)];
  const arena = mk('div', {x:260, y:80, w:400, h:360}); body.appendChild(arena);
  const btn = mk('button', {x:560, y:86, w:60, h:26}), pill = mk('span', {x:625, y:86, w:44, h:22}), deck = mk('span', {x:672, y:84, w:26, h:34}); [btn, pill, deck].forEach(e=> body.appendChild(e));
  const base = new Set(body.children);
  return {W:sb.IdeasFX2, gsap, body, base, foe, castle, mine, arena, btn, pill, deck, hand:{x:460, y:500}};
}
const ARGS = {
  sequesterGrab:s=> [s.foe[0], {from:s.mine[1]}], hoardStash:s=> [s.mine[1], {n:5}], masteryOrbit:s=> [s.mine[1], {}], loneWolfHowl:s=> [s.mine[2], {}],
  ghostDrift:s=> [s.foe[0], {from:s.mine[0]}], majestyBow:s=> [s.mine[1], {foes:s.foe}], exaltedGround:s=> [s.mine, {}], encoreCurtain:s=> [s.mine[1], {}], meldLink:s=> [s.mine, {}],
  critElement:s=> [s.foe[0], {element:'heat'}], healHearts:s=> [s.mine[0], {}], lifeLink:s=> [s.mine[2], {from:s.mine[0]}], shieldBubble:s=> [s.mine[1], {}], cleanseWash:s=> [s.mine[1], {}],
  arriveSwoop:s=> [s.mine[1], {}], arriveBurrow:s=> [s.mine[1], {}], arriveSplash:s=> [s.mine[1], {}], arriveHatch:s=> [s.mine[1], {}], arriveSkitter:s=> [s.mine[1], {}],
  returnToHand:s=> [s.foe[0], {to:s.hand}], exileFold:s=> [s.foe[0], {}], deathPoof:s=> [s.foe[0], {}], buffStack:s=> [s.mine[1], {n:3}], debuffStack:s=> [s.foe[0], {n:5}],
  laneSurge:s=> [[s.foe[0], s.mine[0]], {}], fieldRainbow:s=> [s.arena, {}], fieldAurora:s=> [s.arena, {}], fieldOmen:s=> [s.arena, {}], roadProgress:s=> [s.arena, {from:.2, to:.9}], mapTransition:s=> [s.arena, {at:s.mine[1]}],
  rarityClimb:s=> [s.mine[1], {rarity:'mythic'}], shinyGlint:s=> [s.mine[1], {}], legendaryWings:s=> [s.mine[1], {}], victoryCheer:s=> [s.mine, {}], defeatDroop:s=> [s.mine, {}],
  levelUpSpring:s=> [s.mine[1], {level:12}], mapClearFlag:s=> [s.arena, {}], bossIntro:s=> [s.foe[0], {box:s.arena, name:'Boss'}], bossPhase:s=> [s.foe[0], {phase:'II'}],
  buttonSquish:s=> [s.btn, {}], lumberGain:s=> [s.pill, {from:s.mine[0], n:6}], cardDraw:s=> [s.mine[2], {from:s.deck, hand:s.mine}], handFull:s=> [s.mine, {}], notifyPing:s=> [s.btn, {}],
  mulliganSwap:s=> [s.mine[1], {}], idleVisitor:s=> [s.mine[1], {}], idleYawn:s=> [s.mine[0], {}],
};
// play one look to the end on the fake clock: {done, impact, onDone, max, left, moved, unclean, dom}
async function play(name, v, extra, reduced){
  const s = load(reduced), [t, o] = ARGS[name](s); let impact = 0, onDone = 0, done = false, max = 0;
  const opts = Object.assign({}, o, extra || {}, {v, onImpact:()=>{ impact++; }, onDone:()=>{ onDone++; }});
  let p; try{ p = s.W[name](t, opts); }catch(e){ return {threw:e.message}; }
  Promise.resolve(p).then(()=>{ done = true; });
  const count = ()=> s.body.children.filter(c=> !s.base.has(c)).length;
  for(let i = 0; i < 1200 && !done; i++){ max = Math.max(max, count()); s.gsap.tick(1/60); for(let k = 0; k < 4; k++) await Promise.resolve(); max = Math.max(max, count()); }
  for(let k = 0; k < 8; k++) await Promise.resolve();
  const last = new Map(); s.gsap.log.forEach(x=> last.set(x.el, x)); // the last GSAP call on each element it touched
  const unclean = [...last.values()].filter(x=> !x.clear).length;
  return {done, impact, onDone, max, left:count(), live:s.W.live(), moved:last.size, unclean, dom:s.gsap.domCalls, secs:s.gsap.now};
}

(async ()=>{
  // ---- the module's surface
  const s0 = load(false), W = s0.W, names = W.names || [];
  ok(W && typeof W.clear === 'function' && W.version === '2026-11-11', 'window.IdeasFX2 with clear() and its version');
  ok(names.length >= 40 && new Set(names).size === names.length, `40+ distinct effects (${names.length})`);
  ok(names.every(k=> typeof W[k] === 'function'), 'every name is a function: ' + names.filter(k=> typeof W[k] !== 'function'));
  ok(names.every(k=> ARGS[k]), 'this test has a call for every effect (missing: ' + names.filter(k=> !ARGS[k]) + ')');
  ok(W.cap <= 38, `the node budget is under 40 (${W.cap})`);
  ok(JSON.stringify(W.critElements) === JSON.stringify(['physical', 'heat', 'cold', 'acid', 'poison', 'decay', 'magic', 'water', 'stone', 'metal', 'shock']), 'a crit look for each of the 11 damage types (the game\'s DMG_TYPES)');
  ok(/const DMG_TYPES = \['physical','cold','heat','acid','poison','decay','magic','water','stone','metal','shock'\]/.test(APP), 'the game\'s damage types are still those 11');
  // no name taken from an effect the game or the earlier ideas already have
  const others = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'war', 'ideas'].map(k=> fs.readFileSync(path.join(ROOT, `bramblewood-fx-${k}.js`), 'utf8')).join('\n') + fs.readFileSync(path.join(ROOT, 'bramblewood-skillfx.js'), 'utf8');
  const taken = names.filter(k=> new RegExp(`(?:^|\\s)(?:M|W)\\.${k}\\s*=|function ${k}\\(`, 'm').test(others));
  ok(!taken.length, 'no effect shares a name with one in bramblewood-fx-*.js or SkillFX: ' + taken);

  // ---- the source rules
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  ok(!/\bfilter\s*:|\.style\.filter|backdrop-filter|mix-blend|mixBlendMode|blend-mode/.test(code), 'no CSS filter, backdrop filter or blend mode');
  ok(!/setTimeout|setInterval|requestAnimationFrame/.test(code), 'all timing through GSAP (slow motion and hit-stop stretch it)');
  ok(!/matchState|renderBoard|getCardDefs|localStorage/.test(code), 'pure: reads no game state, re-renders nothing, stores nothing');
  ok(!/\b(?:left|top|width|height)\s*:\s*[^'"`;]*\bu\b/.test(code.replace(/style\.cssText = `[^`]*`/g, '')), 'no per-frame layout properties (motion is transform and opacity)');
  ok(!ASM.includes('fx-ideas2') && !APP.includes('IdeasFX2'), 'nothing in the game calls them: not in assemble_arena.py, no IdeasFX2 in arena_app.js');

  // ---- every effect, every look: resolves, callbacks once, nodes cleaned up, under the budget, the card put back
  let worst = [0, ''], plays = 0, longest = [0, ''];
  for(const name of names){ for(const v of [0, 1, 2]){
    const r = await play(name, v); plays++;
    if(r.threw){ ok(false, `${name} v${v} threw: ${r.threw}`); continue; }
    ok(r.done, `${name} v${v}: resolves`);
    ok(r.impact === 1 && r.onDone === 1, `${name} v${v}: onImpact and onDone once each (${r.impact}, ${r.onDone})`);
    ok(r.left === 0 && r.live === 0, `${name} v${v}: every node it added is gone (${r.left} on the body, ${r.live} tracked)`);
    ok(r.max <= 38, `${name} v${v}: 38 overlay nodes at most (${r.max})`);
    ok(r.unclean === 0, `${name} v${v}: a card it moved is put back (clearProps last) (${r.unclean} of ${r.moved})`);
    ok(r.secs <= 3.3, `${name} v${v}: 3 s at most (${r.secs.toFixed(2)} s)`);
    if(r.max > worst[0]) worst = [r.max, `${name} v${v}`]; if(r.secs > longest[0]) longest = [r.secs, `${name} v${v}`];
  } }
  for(const el of W.critElements) for(const v of [0, 1, 2]){ const r = await play('critElement', v, {element:el}); plays++;
    ok(r.done && r.left === 0 && r.max <= 38 && r.impact === 1 && r.onDone === 1 && r.secs <= 1.5, `critElement ${el} v${v}: resolves in a battle beat (1.5 s), cleans up, callbacks once (${JSON.stringify(r)})`); }
  // the battle beats stay short
  for(const name of ['critElement', 'ghostDrift', 'healHearts', 'lifeLink', 'shieldBubble', 'cleanseWash', 'arriveSwoop', 'arriveBurrow', 'arriveSplash', 'arriveSkitter', 'returnToHand', 'exileFold', 'buttonSquish', 'notifyPing'])
    for(const v of [0, 1, 2]){ const r = await play(name, v); ok(r.secs <= 2.1, `${name} v${v}: a battle or UI beat, 2 s at most (${r.secs.toFixed(2)} s)`); }
  // clear() drops everything mid-play and resolves what was pending
  { const s = load(false); let done = false; s.W.fieldAurora(s.arena, {}).then(()=>{ done = true; }); for(let i = 0; i < 20; i++){ s.gsap.tick(1/60); await Promise.resolve(); }
    const mid = s.body.children.filter(c=> !s.base.has(c)).length; s.W.clear(); for(let k = 0; k < 6; k++) await Promise.resolve();
    ok(mid > 0 && s.body.children.filter(c=> !s.base.has(c)).length === 0 && s.W.live() === 0 && done, `clear() removes the nodes of a running effect (${mid}) and resolves it`); }
  // no target: resolves at once with both callbacks
  { const s = load(false); let i = 0, d = 0; await s.W.healHearts(null, {onImpact:()=> i++, onDone:()=> d++}); ok(i === 1 && d === 1 && s.body.children.length === s.base.size, 'no target: resolves, both callbacks, nothing added'); }

  // ---- reduced motion: one still glyph, nothing moved, both callbacks, nothing left
  for(const name of names){ const r = await play(name, 2, null, true);
    ok(r.done && r.max <= 1 && r.left === 0 && r.dom === 0 && r.impact === 1 && r.onDone === 1 && r.secs <= .8, `${name}, reduced motion: one still node (${r.max}), no card moved (${r.dom}), callbacks once, ~0.7 s (${r.secs && r.secs.toFixed(2)})`); }

  // ---- the Lab tab, its build, the hub and the catalogue
  ok(/L\.mount\(\{\s*id:'ideas2', title:'Ideas 11-11', pill:\['idea', 'Lab only'\]/.test(LABTAB), 'fxlab-ideas2.js mounts the "Ideas 11-11" tab with the Lab only pill');
  ok(names.every(k=> LABTAB.includes(`FX2().${k}(`) && LABTAB.includes(`IdeasFX2.${k}(`)), 'every effect has a Lab entry (a play button and its call): ' + names.filter(k=> !LABTAB.includes(`FX2().${k}(`)));
  const groups = (LABTAB.match(/\{key:'(\w+)', title:/g) || []).length; ok(groups >= 12, `the entries are grouped by category (${groups} groups)`);
  ok(!/where:/.test(LABTAB), 'no entry claims an in-game place (every badge reads "Lab only (not used yet)")');
  ok(/fxbatches \+= '\\n' \+ open\(f'\{ROOT\}\/bramblewood-fx-ideas2\.js'/.test(BUILD) && /fxideas2 = open\(f'\{LAB\}\/fxlab-ideas2\.js'/.test(BUILD) && /\{fxideas2\}/.test(BUILD), 'the Lab build loads the effects and the tab');
  ok(/data-tab="ideas2">💡 Ideas 11-11<\/button>/.test(BUILD) && /<section id="ideas2"><\/section>/.test(BUILD), 'the Lab has the tab button and its section');
  ok(/if\(W\.IdeasFX2\) W\.IdeasFX2\.clear\(\)/.test(LAB2), 'the Lab clears IdeasFX2 between plays');
  ok(/def _cards_json\(\):/.test(BUILD), 'the Lab builds in a worktree (reads the main checkout\'s cards.json when it has none)');
  ok(/tools', 'effects-lab', 'build\.py'/.test(HUB) && /id="ideas2"/.test(HUB) && /IdeasFX2/.test(HUB), 'the hub build rebuilds the Lab first and checks the Ideas 11-11 tab is in it');
  const sec = CAT.slice(CAT.indexOf('## Effects Lab, 2026-11-11 (package LAB3): the "Ideas 11-11" tab'));
  ok(sec.length > 2000, 'docs/effects-catalogue.md has the "Ideas 11-11" section');
  ok(names.every(k=> sec.includes('`IdeasFX2.' + k + '(')), 'the catalogue section lists every effect: ' + names.filter(k=> !sec.includes('`IdeasFX2.' + k + '(')));
  ok(/run node tests\/lab3-2026-11-11\.js/.test(RUNALL) && /run python3 tests\/e2e\/lab3_2026_11_11\.py/.test(RUNALL), 'run-all.sh lists this test and its browser half');

  console.log(`lab3: ${plays} looks played in the fake DOM; most overlays at once ${worst[0]} (${worst[1]}); longest ${longest[0].toFixed(2)} s (${longest[1]})`);
  console.log(fail ? `lab3: ${fail} of ${n} checks FAILED` : `lab3: all ${n} checks passed`);
  process.exit(fail ? 1 : 0);
})();
