#!/usr/bin/env node
// Package PERF2 (2026-11-11, owner 00:06: "even on my macbook, the game lags alot - playing effects. How do we optimise this?").
// Report: docs/perf-2026-11-11.md.
//
//   node tests/perf2-2026-11-11.js                      static checks, no browser (under a second; this is what run-all.sh runs)
//   node tests/perf2-2026-11-11.js --bench              the fight bench in headless Chromium: a seeded CPU-vs-CPU fight (Auto-play on both
//        [--rates 1,4] [--rounds 3] [--runs 1]          sides, Effects High) and then a fixed run of heavy effects (dragon arrival, meteor,
//        [--page other.html] [--json out.json]          sweeps, lightning, swarm, poison cloud, fireball, quake ...). Build first.
//   node tests/perf2-2026-11-11.js --equiv old.html     the rewritten CSS selectors give the same computed styles in an older build and in
//                                                       this one (fixtures for every rewritten rule)
//
// What the static checks hold (the causes found, see the report):
//  1. No :has() rule whose target is a bare `*`, `:not(...)` or other featureless compound, and no [class*=] test left of one: either made
//     Chrome restyle the whole subtree of every :has()-affected element (body, the rows, every card) on each DOM change of a fight.
//  2. No :has() rule aimed at the card name (.nm): it restyled every card name on the page whenever anything was added to it.
//  3. The effect overlays tell GSAP they are shown (no display:block probe on their first move) and the big particle loops make their
//     overlays as one batch read in one style pass (SkillFX layers(), FX.C / FX.B runners, FX.D's poison flurry).
//  4. The board's pip centring measures every pip before it moves any.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), flag = k=> args.includes(k), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---------------------------------------------------------------- selector helpers
const splitList = s=>{ const out = []; let d = 0, cur = ''; for(const ch of s){ if(ch === '(') d++; if(ch === ')') d--; if(ch === ',' && !d){ out.push(cur.trim()); cur = ''; } else cur += ch; } if(cur.trim()) out.push(cur.trim()); return out; };
const compounds = s=>{ const out = []; let d = 0, br = 0, cur = ''; for(const ch of s){ if(ch === '(') d++; if(ch === ')') d--; if(ch === '[') br++; if(ch === ']') br--;
  if(!d && !br && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')){ if(cur.trim()) out.push(cur.trim()); cur = ''; continue; } cur += ch; } if(cur.trim()) out.push(cur.trim()); return out; };
const stripFns = c=>{ let d = 0, o = ''; for(const ch of c){ if(ch === '('){ d++; continue; } if(ch === ')'){ d--; continue; } if(!d) o += ch; } return o; };
// a compound Chrome can't key an invalidation on: no class / id / attribute / tag outside :not() and friends (:where()/:is() of classes count)
const featureless = c=>{ if(/:(where|is)\(\s*[.#\[a-z]/i.test(c)) return false; const s = stripFns(c).replace(/::?[a-z-]+/g, ''); return !/[.#\[]|^[a-z*]/i.test(s) || /^\*/.test(s); };
// every selector list in a CSS text (top-level and inside @media / @container), crude but enough for this codebase's style blocks
function selectorsOf(css){
  const out = []; css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let from = 0; // one pass (a regex here went quadratic on the long data: URIs)
  for(let i = 0; i < css.length; i++){ const ch = css[i];
    if(ch === '}' || ch === ';'){ from = i + 1; continue; }
    if(ch === '{'){ const s = css.slice(from, i).trim(); from = i + 1; if(s && !s.startsWith('@') && !/^(from|to|\d+%)/.test(s) && s.length < 2000) out.push(s); } }
  return out;
}

// ---------------------------------------------------------------- static checks
function staticChecks(){
  const tpl = read('arena_template.html'), app = read('arena_app.js'), sfx = read('bramblewood-skillfx.js');
  const styles = (tpl.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []).join('\n');
  const jsCss = ['arena_app.js', 'bramblewood-skillfx.js', 'bramblewood-fx-a.js', 'bramblewood-fx-b.js', 'bramblewood-fx-c.js', 'bramblewood-fx-d.js', 'bramblewood-fx-e.js', 'bramblewood-fx-f.js', 'bramblewood-fx-g.js']
    .map(f=> read(f).split('\n').filter(l=> /:has\(|\[class\*=/.test(l) && /\{/.test(l)).join('\n')).join('\n');
  const sels = selectorsOf(styles + '\n' + jsCss).flatMap(splitList);
  ok(sels.length > 5000, 'parsed the style blocks (' + sels.length + ' selectors)');
  const bad1 = [], bad2 = [];
  sels.forEach(one=>{ const cs = compounds(one); if(cs.length < 2) return; const last = cs[cs.length - 1], left = cs.slice(0, -1);
    const hasLeft = left.some(c=> /:has\(/.test(c)), clsLeft = left.some(c=> /\[class[*^$~|]?=/.test(c));
    if((hasLeft || clsLeft) && featureless(last)) bad1.push(one);
    if(hasLeft && /(^|[^\w-])\.nm(?![\w-])/.test(last)) bad2.push(one); });
  ok(!bad1.length, '1. no :has() or [class*=] left of a featureless target: ' + bad1.slice(0, 4).join(' | '));
  ok(!bad2.length, '2. no :has() aimed at the card name (.nm): ' + bad2.slice(0, 4).join(' | '));
  ok(/\.board-row:has\(> :nth-child\(21\)\) > :where\(\.board-card\) \+ :where\(\.board-card\)\{margin-left/.test(tpl), '1. the 21-column overlap keeps its margin rule, on the cards');
  ok(/\.conquest-layout\.conquest-layout \*\{image-rendering:auto;\}/.test(tpl), '1. the map layout\'s image-rendering reset keeps its specificity');
  ok(/\.board-row:has\(> \.board-card:nth-child\(9 of :not\(\.empty-slot\)\)\)\{--eng26-many:1;\}/.test(tpl) && /@container \(max-width: 100px\)\{ @container style\(--eng26-many: 1\)\{/.test(tpl), '2. ENG26 (names hidden in a 9+ row of small tiles) reads the row\'s mark through a style query');
  ok(/\.card-tile > \.waitbadge\[data-wait-total\] ~ \.nm\{--nm-ring/.test(tpl), '2. the live wait ring\'s room in the name: a sibling rule');
  // 3. GSAP's first move of an overlay
  ok(/const shown = e=>\{ try\{ Object\.defineProperty\(e, 'offsetParent'/.test(sfx) && /document\.body\.appendChild\(e\); return shown\(e\); \};/.test(sfx), '3. SkillFX overlays are marked shown');
  ok(/const layers = \(n, cls, html\)=>/.test(sfx) && /const prime = els=>/.test(sfx), '3. SkillFX has layers() / prime()');
  const loops = sfx.split('\n').filter(l=>{ const m = /^\s*for\(let \w = (\d+); \w < ([^;]+); \w\+\+\)\{\s*const \w+ = layer\(/.exec(l); return m && !(/^\d+$/.test(m[2]) && +m[2] - +m[1] < 5); }); // 2-4 overlays may stay one by one
  ok(!loops.length, '3. no SkillFX particle loop makes its overlays one by one: ' + loops.slice(0, 2).map(l=> l.trim().slice(0, 80)).join(' | '));
  ok((sfx.match(/Batch\d* = layers\(/g) || []).length >= 40, '3. the particle loops take batches (' + (sfx.match(/Batch\d* = layers\(/g) || []).length + ')');
  const pc = sfx.slice(sfx.indexOf('function poisonCloud('), sfx.indexOf('function bleedDrip('));
  ok(/layers\(8, 'sfx-puff'\)/.test(pc) && /layers\(9, 'sfx-bubble'\)/.test(pc), '3. the poison cloud\'s puffs and bubbles are batches');
  'abcefg'.split('').forEach(t=>{ const s = read('bramblewood-fx-' + t + '.js'); ok(/if\(!host\) try\{ Object\.defineProperty\(e, 'offsetParent', \{value: document\.body, configurable: true\}\); \}catch\(err\)\{\}/.test(s), '3. FX.' + t.toUpperCase() + ' overlays are marked shown'); });
  const fxd = read('bramblewood-fx-d.js');
  ok(/if\(!host\) shown\(e\);/.test(fxd) && /else shown\(document\.body\.appendChild\(i\)\);/.test(fxd), '3. FX.D overlays and flying bubbles are marked shown');
  ok(/if\(o\.batch\)\{ o\.batch\.push\(\[i, \(\)=> psnBubbleGo\(g, i, host, o, z, sz\)\]\); return i; \}/.test(fxd) && /batch\.forEach\(\(\[i\]\)=>\{ try\{ g\.getProperty\(i, 'x'\); \}catch\(e\)\{\} \}\); batch\.forEach\(\(\[, go\]\)=> go\(\)\);/.test(fxd), '3. a poison flurry reads its bubbles in one pass');
  ok(/bag\.forEach\(n=>\{ if\(n\.nodeType === 1 && n\.isConnected\) try\{ g\.getProperty\(n, 'x'\); \}catch\(e\)\{\} \}\);\s*const sp = /.test(read('bramblewood-fx-c.js')), '3. FX.C reads its overlays before the timeline plays');
  ok(/nodes\.forEach\(n=>\{ try\{ g\.getProperty\(n, 'x'\); n\.querySelectorAll\(':scope > \.fxb-bit'\)/.test(read('bramblewood-fx-b.js')), '3. FX.B reads its overlays and particles before building');
  ok(/function en2Layer\(html, cls\)\{[^\n]*\n\s*try\{ Object\.defineProperty\(e, 'offsetParent'/.test(app), '3. the EN* effect overlays (en2Layer) are marked shown');
  ok(/const fixed = \(cls\)=>\{[^\n]*\n\s*try\{ Object\.defineProperty\(e, 'offsetParent'/.test(read('bramblewood-procfx.js')), '3. procfx overlays are marked shown');
  // 4. pips
  const pip = app.slice(app.indexOf('function vis3CentrePips('), app.indexOf('function vis3CentrePips(') + 1200);
  ok(/now\.push\(\[img, o\]\)/.test(pip) && /now\.forEach\(\(\[img, o\]\)=> put\(img, o\)\)/.test(pip), '4. vis3CentrePips measures every pip, then moves them');
}

// ---------------------------------------------------------------- the browser parts
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ console.log('  playwright not found'); process.exit(1); } } }
function serve(page){
  const http = require('http'), TYPES = {'.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.css':'text/css', '.woff2':'font/woff2', '.mp3':'audio/mpeg', '.ogg':'audio/ogg'};
  return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
    const f = p === '/index.html' ? page : path.join(ROOT, p); if(!f.startsWith(ROOT) && f !== page){ r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
    s.listen(0, '127.0.0.1', ()=> res(s)); }); }
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','pl-need','pl-do','pl-after'])); localStorage.setItem('bramblewood_fx_level','high'); localStorage.setItem('bramblewood_fx_auto','off');";
// a seeded Math.random (the fight is the same fight every run), the frame clock, long tasks and every element added to the page
const INSTR = `(()=>{ let a = 0x2F6E2B1; Math.random = function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const P = window.__perf = {on:false, frames:[], lt:[], added:0, ev:0, evTypes:{}};
  try{ new PerformanceObserver(l=>{ if(P.on) l.getEntries().forEach(e=> P.lt.push(e.duration)); }).observe({entryTypes:['longtask']}); }catch(e){}
  let prev = 0; const f = n=>{ if(P.on && prev) P.frames.push(n - prev); prev = n; requestAnimationFrame(f); }; requestAnimationFrame(f);
  const mo = ()=> new MutationObserver(ms=>{ if(!P.on) return; for(const m of ms) for(const n of m.addedNodes) if(n.nodeType === 1) P.added += 1 + n.getElementsByTagName('*').length; }).observe(document.documentElement, {childList:true, subtree:true});
  if(document.documentElement) mo(); else document.addEventListener('DOMContentLoaded', mo); })();`;
const OWN = "try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');}); saveEnergyState({current:60, lastRegenAt:Date.now()}); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; window.playDialogue = async ()=>({}); 1";
const FIGHT = `(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}
  const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{};
  const rv = window.renderVfxForEvent; window.renderVfxForEvent = function(ev){ const P = window.__perf; if(P.on){ P.ev++; P.evTypes[ev.type] = (P.evTypes[ev.type] || 0) + 1; } return rv.apply(this, arguments); };
  return !!matchState; })()`;
// the heavy effects, one second apart, on whatever stands on the board after the fight (a castle tile when a row is short)
const GAUNTLET = [
  ['dragon arrives', "FX.C.dragonArrive(E(0), {host: document.getElementById('battlefieldEl')})"],
  ['meteor', 'SkillFX.meteor(M(0), {})'],
  ['tornado sweep', "boardSweepVfx('tornado', 'A')"],
  ['lightning', 'SkillFX.lightning(E(0), [M(0), M(1), M(2)], {})'],
  ['swarm', 'SkillFX.swarm(E(1), M(0), {})'],
  ['poison cloud', 'SkillFX.poisonCloud(M(1), {})'],
  ['avalanche sweep', "boardSweepVfx('avalanche', 'B')"],
  ['fireball', 'SkillFX.fireball(M(0), E(0), {})'],
  ['supreme arrives', 'FX.C.supremeArrive(M(1), {})'],
  ['earthquake', 'SkillFX.earthquake(ALL(), {})'],
  ['tsunami sweep', "boardSweepVfx('tsunami', 'A')"],
  ['regenerate', 'SkillFX.regen(M(0), {})'],
];
const pct = (a, p)=>{ if(!a.length) return 0; const s = a.slice().sort((x, y)=> x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
function work(ev){ // main-thread CPU (thread time, so a busy machine doesn't count) from the trace
  const main = new Set(ev.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
  const M = ev.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), cpu = nm=> Math.round(M.filter(e=> e.name === nm).reduce((s, e)=> s + (e.tdur || 0), 0) / 1000);
  const ult = M.filter(e=> e.name === 'UpdateLayoutTree');
  return {cpuMs: cpu('RunTask'), styleMs: cpu('UpdateLayoutTree'), styleN: ult.length, styledEls: ult.reduce((s, e)=> s + ((e.args && e.args.elementCount) || 0), 0), layoutMs: cpu('Layout'), layoutN: M.filter(e=> e.name === 'Layout').length, paintMs: cpu('Paint'), scriptMs: cpu('FunctionCall') + cpu('TimerFire') + cpu('FireAnimationFrame')};
}
async function phase(pg, cdp, js){
  const evs = []; const onData = d=>{ for(const e of d.value) evs.push(e); }; cdp.on('Tracing.dataCollected', onData);
  await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'], recordMode: 'recordContinuously'}});
  const info = await pg.evaluate(js);
  await new Promise(async res=>{ cdp.once('Tracing.tracingComplete', res); await cdp.send('Tracing.end'); }); cdp.off('Tracing.dataCollected', onData);
  const P = await pg.evaluate("(()=>{ const P = window.__perf, o = {frames: P.frames.slice(), lt: P.lt.slice(), added: P.added, ev: P.ev, evTypes: Object.assign({}, P.evTypes)}; P.frames.length = 0; P.lt.length = 0; P.added = 0; P.ev = 0; P.evTypes = {}; return o; })()");
  const f = P.frames;
  return Object.assign({frames: f.length, over50: f.filter(x=> x > 50).length, medianMs: +pct(f, .5).toFixed(1), p95Ms: +pct(f, .95).toFixed(1), longTasks: P.lt.length, longMs: Math.round(P.lt.reduce((s, x)=> s + x, 0)), effects: P.ev, nodesAdded: P.added}, info, work(evs), {evTypes: P.evTypes});
}
async function benchOnce(b, url, rate, rounds){
  const ctx = await b.newContext({viewport: {width: 1366, height: 768}}); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e=> errs.push(String(e)));
  await pg.addInitScript(SKIP + INSTR);
  await pg.goto(url); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500);
  await pg.evaluate(OWN); ok(await pg.evaluate(FIGHT), 'bench: the fight starts');
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  const fight = await phase(pg, cdp, `(async()=>{ const P = window.__perf, m = matchState; P.on = true; m.autoplay = true; m.speedMult = 1; const r0 = m.round, W = ms=> new Promise(r=> setTimeout(r, ms)), T0 = performance.now();
    while(!m.over && m.round < r0 + ${rounds} && performance.now() - T0 < ${rate > 1 ? 300000 : 150000}) await W(100);
    for(let i = 0; i < 100 && m.resolving; i++) await W(100);
    P.on = false; m.autoplay = false; for(let i = 0; i < 100 && m.resolving; i++) await W(100); return {rounds: m.round - r0, wallMs: Math.round(performance.now() - T0)}; })()`);
  const gaunt = await phase(pg, cdp, `(async()=>{ const P = window.__perf, W = ms=> new Promise(r=> setTimeout(r, ms));
    const row = s=> [...document.querySelectorAll(s + ' .board-card[data-uid]')], hq = s=> document.querySelector('[data-hq="' + s + '"]');
    const M = i=> row('#rowMine')[i] || hq('A'), E = i=> row('#rowEnemy')[i] || hq('B'), ALL = ()=> row('#rowMine').concat(row('#rowEnemy'));
    const steps = ${JSON.stringify(GAUNTLET)}, per = [], T0 = performance.now(); P.on = true;
    for(const [name, js] of steps){ const a0 = P.added; try{ (new Function('M', 'E', 'ALL', js))(M, E, ALL); }catch(e){ per.push([name, 'error ' + e.message]); await W(1000); continue; } await W(1000); per.push([name, P.added - a0]); }
    await W(1500); P.on = false; return {steps: per, wallMs: Math.round(performance.now() - T0)}; })()`);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  await ctx.close();
  return {rate, fight, gaunt, errs};
}
async function bench(){
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), rates = opt('--rates', '1,4').split(',').map(Number), rounds = +opt('--rounds', '3'), runs = +opt('--runs', '1');
  if(!fs.existsSync(page)){ console.log('  build first: python3 assemble_arena.py && mv bramblewood-arena.html index.html'); process.exit(1); }
  const s = await serve(page), url = `http://127.0.0.1:${s.address().port}/index.html`;
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined});
  const all = [];
  for(let k = 0; k < runs; k++) for(const r of rates){ const res = await benchOnce(b, url, r, rounds); all.push(res);
    for(const [nm, x] of [['fight', res.fight], ['effects', res.gaunt]]){
      console.log(`  ${path.basename(page)} ${r}x ${nm.padEnd(7)} frames ${String(x.frames).padStart(4)}  >50ms ${String(x.over50).padStart(4)}  median ${String(x.medianMs).padStart(6)}  p95 ${String(x.p95Ms).padStart(7)}  long ${String(x.longTasks).padStart(3)} (${x.longMs} ms)  ` +
        `cpu ${x.cpuMs} ms (style ${x.styleMs} ms / ${x.styleN} passes / ${x.styledEls} els, layout ${x.layoutMs}, paint ${x.paintMs})  effects ${x.effects}  nodes/effect ${x.effects ? (x.nodesAdded / x.effects).toFixed(0) : '-'}`); }
    console.log('    effect steps (nodes added): ' + res.gaunt.steps.map(([a, v])=> a + ' ' + v).join(', '));
    ok(!res.errs.length, 'bench: no page errors ' + res.errs.slice(0, 2).join(' | '));
    ok(res.fight.effects > 10 && res.gaunt.steps.every(([, v])=> typeof v === 'number' && v > 0), 'bench: the fight played and every listed effect added something to the page'); }
  if(opt('--json', null)) fs.writeFileSync(opt('--json'), JSON.stringify(all, null, 1));
  await b.close(); s.close();
}
// computed styles of every rewritten rule, on fixtures, in two builds
const FIXTURES = `(()=>{ const out = {}, host = document.createElement('div'); host.style.cssText = 'position:absolute; left:0; top:0; width:1300px;'; document.body.appendChild(host);
  const tile = (inner, w)=> '<div class="board-card" style="width:' + (w || 120) + 'px; flex:none"><div class="card-tile" style="width:' + (w || 120) + 'px">' + inner + '</div></div>';
  const nmT = '<div class="nm"><span class="nmt">Name</span></div>', badges = k=> '<div class="badges">' + Array.from({length: k}, ()=> '<span class="abadge">x</span>').join('') + '</div>';
  const row = (cards, w)=> '<div class="board-row" style="display:flex; width:1200px">' + cards.map(c=> c === 'e' ? '<div class="board-card empty-slot" style="width:' + w + 'px; flex:none"></div>' : tile(c, w)).join('') + '</div>';
  const cs = (sel, props)=>{ const e = host.querySelector(sel); if(!e) return 'missing'; const c = getComputedStyle(e); return props.map(p=> c.getPropertyValue(p)).join(' | '); };
  host.innerHTML = row(Array(9).fill(nmT), 92); out.eng26_9_small = cs('.nm', ['display']);
  host.innerHTML = row(Array(8).fill(nmT).concat(['e']), 92); out.eng26_8_small = cs('.nm', ['display']);
  host.innerHTML = row(Array(9).fill(nmT), 140); out.eng26_9_big = cs('.nm', ['display']);
  host.innerHTML = row([nmT + badges(4)], 140); out.nm_4badges = cs('.nm', ['margin-top']);
  host.innerHTML = row([nmT + '<div class="badges badges-2row"><div class="badges-row"></div></div>'], 140); out.nm_2row = cs('.nm', ['margin-top']);
  host.innerHTML = row([nmT + badges(2)], 140); out.nm_2badges = cs('.nm', ['margin-top']);
  host.innerHTML = row(['<div class="waitbadge" data-wait-total="2">2</div>' + nmT], 140); out.nm_waitring = cs('.nm', ['--nm-ring', 'max-width']);
  host.innerHTML = row([nmT], 140); out.nm_noring = cs('.nm', ['--nm-ring', 'max-width']);
  host.innerHTML = row(['<div class="waitbadge">2</div>' + nmT + '<div class="badges-bottom status-chips"><span>a</span></div>'], 140); out.chips_wait = cs('.status-chips', ['max-width', 'left']);
  host.innerHTML = row([nmT + '<div class="badges-bottom status-chips"><span>a</span></div>'], 140); out.chips_nowait = cs('.status-chips', ['max-width', 'left']);
  host.innerHTML = row(Array(21).fill(nmT), 40); out.row21 = [1, 2, 20].map(i=> getComputedStyle(host.querySelectorAll('.board-card')[i]).marginLeft).join(' ') + ' first ' + getComputedStyle(host.querySelector('.board-card')).marginLeft;
  host.innerHTML = row(Array(20).fill(nmT), 40); out.row20 = getComputedStyle(host.querySelectorAll('.board-card')[1]).marginLeft;
  host.innerHTML = '<div class="conquest-layout map-theme-mw"><div class="a"><img class="b"></div></div>'; out.cq_layout = cs('.conquest-layout', ['image-rendering']) + ' / ' + cs('.a', ['image-rendering']) + ' / ' + cs('.b', ['image-rendering']);
  host.innerHTML = '<div class="pass-card winloss-card" style="width:1000px"><div class="winloss-stats"><div class="rw-panel winloss-conquest-rewards">R</div><div class="x1">a</div><div class="x2">b</div><div class="wls-compact">c</div></div></div>';
  const st = host.querySelector('.winloss-stats'), sr = st.getBoundingClientRect(); out.winloss = [...st.children].map(c=>{ const r = c.getBoundingClientRect(); return c.className.split(' ')[0] + '@' + Math.round(r.left - sr.left) + ',' + Math.round(r.top - sr.top); }).join(' ');
  host.remove(); return out; })()`;
async function equiv(){
  const old = path.resolve(opt('--equiv')), cur = path.join(ROOT, 'index.html');
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined}), got = {};
  for(const page of [old, cur]){ const s = await serve(page), ctx = await b.newContext({viewport: {width: 1366, height: 900}}), pg = await ctx.newPage();
    await pg.addInitScript(SKIP); await pg.goto(`http://127.0.0.1:${s.address().port}/index.html`); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1000);
    got[page] = await pg.evaluate(FIXTURES); await ctx.close(); s.close(); }
  await b.close();
  Object.keys(got[cur]).forEach(k=>{ const a = got[old][k], c = got[cur][k]; console.log(`  ${a === c ? '=' : '≠'} ${k.padEnd(14)} ${c}${a === c ? '' : '   (was ' + a + ')'}`); ok(a === c, 'equiv: ' + k + ' unchanged'); });
  ok(got[cur].eng26_9_small === 'none' && got[cur].eng26_8_small !== 'none' && got[cur].eng26_9_big !== 'none', 'equiv: ENG26 hides names only in a 9+ row of small tiles');
}

(async()=>{
  if(flag('--bench')) await bench();
  else if(opt('--equiv', null)) await equiv();
  else staticChecks();
  console.log(`perf2-2026-11-11: ${n - fail}/${n} checks passed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
