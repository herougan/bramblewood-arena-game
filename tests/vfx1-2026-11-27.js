#!/usr/bin/env node
// 2026-11-27 (package VFX1, owner 09:55 "skill vfx, field vfx, potential boss vfx like cages, skeleton bosses, mages, sea-like"; RITUAL1, owner 10:18
// "When you place a ritual card ... it goes dark ... the candles slowly appear ... The candles light when that corresponding effect is complete").
//   1. files: FX.V's looks and cues, no filter / blend mode in its CSS, the game's hook lines, FX.A / FX.D stepping aside, the bundles, the Lab, the
//      inventory, the catalogue, the CHANGELOG, run-all.sh
//   2. the built page, a fight board: every new effect registered and drawn through the game's own gate (fxBatchVfx / fxHook) at Effects High, its
//      minimal version at Low, nothing at None or with reduced motion; the weather layer (on at Medium+, hidden by CSS at Low and with reduced
//      motion); the boss looks by name; the Caged Fight's cage; the rite (dark veil, a candle per condition, lit when met, the hover shape, a
//      candle catching, the lift), its fades only at Medium+, its lit state kept with reduced motion
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- 1. files
const V = rd('bramblewood-fx-v.js'), app = rd('arena_app.js'), tpl = rd('arena_template.html');
const FNS = ['swiftDash', 'tideCrest', 'hatchPop', 'reachArc', 'mightySlam', 'berryPop', 'berryEat', 'sturdyBrace', 'twinSlash', 'fieldAmbient', 'fieldKind', 'cageClose', 'skeletonRise', 'mageCast', 'seaRise', 'bossKind'];
ok(FNS.every(f=> new RegExp('\\nM\\.' + f + ' = function').test(V)), 'FX.V has every VFX1 look');
const CUES = ['swiftZip', 'tideLap', 'shellCrack', 'reachCreak', 'mightyThud', 'berryPlip', 'berryMunch', 'sturdyThunk', 'twinShing', 'cageSlam', 'boneClatter', 'runeHum', 'candleCatch', 'riteLift', 'seaSurge'];
ok(CUES.every(c=> new RegExp('\\n  ' + c + '\\(P(, [a-z]+)?\\)\\{').test(V)), 'the 15 cues are built from SoundKit.prim');
const vcss = (V.match(/css\('[^']+', `[\s\S]*?`\);/g) || []).join('\n');
ok(vcss.length > 2000 && !/(^|[^-])filter\s*:|mix-blend-mode|backdrop-filter/.test(vcss), 'no filter or blend mode in FX.V\'s CSS');
ok(/html\[data-fx="low"\] \.fxv-field, html\[data-fx="none"\] \.fxv-field\{display:none;\}/.test(V) && /prefers-reduced-motion: reduce\)\{ \.fxv-field\{display:none;\} \}/.test(V), 'the weather layer is hidden at Effects Low / None and with reduced motion');
ok(/const FX_BATCHES = \['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'V'\];/.test(app), 'FX_BATCHES includes V');
ok(/try\{ fxHook\('bossEntrance', node, lair\); \}catch\(e\)\{\}/.test(app) && /fxHook\('raidEntrance', def\)/.test(app), 'bossEntrance and the raid opener fire the boss hooks');
ok(/\(SoundKit\.swiftZip \|\| SoundKit\.quick\)\(\);/.test(app) && /if\(ev\.twin && SoundKit\.twinShing\) SoundKit\.twinShing\(\); else SoundKit\.frenzyTone\(\);/.test(app), 'Swift and Twin Strike have their own cues');
ok(/!\(FX\.V && FX\.V\.swiftDash\)/.test(rd('bramblewood-fx-a.js')) && /!\(FX\.V && FX\.V\.cageClose\)/.test(rd('bramblewood-fx-d.js')), 'FX.A.swiftBlur and FX.D.cageDrop step aside');
ok(/for _b in "abcdefghv"/.test(rd('assemble_arena.py')) && /for b in 'abcdefghv'/.test(rd('tools/effects-lab/build.py')), 'the game and the Lab bundle bramblewood-fx-v.js');
ok(/\$\{rt1RiteHTML\(c\) \/\*[^*]*\*\/\}\$\{ritualChipHTML\(c, opts\.pid\)\}/.test(app) && /rc1SyncChainPips\(el, c\); rt1Sync\(el, c\);/.test(app), 'the rite is in the card markup and the incremental update');
ok(/'\.board-card\.is-ritual \.card-tile\{opacity:\.82;\}/.test(app), 'a unit in its Ritual: no per-card filter (the veil darkens it)');
ok(/pg = liveCard && typeof rc1InRitual === 'function' && rc1InRitual\(liveCard\) \? rt1Conds\(liveCard\) : null/.test(app), 'the hover\'s ritual line shows the progress');
ok(/html\[data-fx="low"\] \.rt1-rite \*, html\[data-fx="none"\] \.rt1-rite \*\{animation:none !important;\}/.test(tpl) && /prefers-reduced-motion: reduce\)\{ \.rt1-rite \*\{animation:none !important;\} \}/.test(tpl), 'the rite\'s fades are off at Effects Low / None and with reduced motion');
{ const t = tpl.slice(tpl.indexOf('/* 2026-11-27 (RITUAL1'), tpl.indexOf('.rt1-tc.is-lit b')); ok(t.length > 500 && !/(^|[^-])filter\s*:|mix-blend-mode/.test(t), 'no filter or blend mode in the rite\'s CSS'); }
const IDS = ['atk-swift', 'sk-tide-crest', 'sk-hatchling-pop', 'atk-reach-aim', 'atk-mighty-slam', 'sk-forage-berry', 'st-sturdy-brace', 'atk-frenzy', 'wt-weather-layer', 'st-caged-leader', 'sum-boss-entrance', 'raid-boss-roar', 'st-ritual-rite'];
{ const man = rd('tools/effects-lab/manifest/vfx1.js'), inv = JSON.parse(rd('docs/effects-inventory-2026-10-15.json')), by = Object.fromEntries(inv.map(e=> [e.id, e]));
  ok(IDS.every(id=> man.includes(`id:'${id}'`)), 'the Effects Lab registers every VFX1 entry');
  ok(IDS.every(id=> by[id] && (by[id].added === '2026-11-27' || by[id].updated === '2026-11-27') && /VFX1/.test(by[id].quality)), 'the inventory has every VFX1 row (8 new, 5 updated)');
  ok(['EN20_CANDLE_SVG', 'rt1Corners', 'rt1RiteMarkup', 'rt1Lift'].every(k=> new RegExp('^' + k + '$', 'm').test(rd('tools/effects-lab/fx-src-extra.txt'))), 'the Lab copies the rite\'s functions'); }
ok(/package VFX1/.test(rd('docs/effects-catalogue.md')) && /Package VFX1/.test(rd('docs/CHANGELOG.md')) && /RITUAL1/.test(rd('docs/CHANGELOG.md')) && /tests\/vfx1-2026-11-27\.js/.test(rd('tests/run-all.sh')), 'catalogue, CHANGELOG (VFX1 + RITUAL1), run-all.sh');

// ---- 2. the built page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ return require('/opt/npm-tools/node_modules/playwright'); } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');"
  + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield']));";
const OWN = "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
  + "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};";
// mine: Pike Lancer (Tide), Jackrabbit Sprinter (Swift), The Sixfold (Ritual, drawn 6/6 met); theirs: Pangolin Roller (Sturdy), Acacia Giraffe (Mighty), Dormouse (Foraging)
const BOARD = `(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const vs = document.querySelector('.vs-screen'); if(vs) vs.click(); await new Promise(r=> setTimeout(r, 500));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    if(id === 'the-sixfold'){ c.ritualBase = {p: 0, d: 0, c: 0}; c.ritualDone = false; }
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, [['pike-lancer', -1], ['jackrabbit-sprinter', 0], ['the-sixfold', 1]]); put(2, [['pangolin-roller', -1], ['acacia-giraffe', 0], ['dormouse', 1]]);
  m.players[1].drawnTotal = 6; m.players[1].castleDealt = 2; m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1000));
  window.__u = uids; window.__cnt = 0; new MutationObserver(ms=> ms.forEach(x=> x.addedNodes.forEach(a=>{ if(a.classList && a.classList.contains('fxv')) window.__cnt++; }))).observe(document.body, {childList: true});
  return uids; })()`;
const U = k=> `window.__u['${k}']`;
// 2026-11-28 (package TESTFIX15): under machine load a look draws late (its gsap tick or hit timer slips): wait up to 8 s for the nodes it
// should draw, then until none has come for 400 ms
const SETTLE = async want=>{ const t0 = performance.now(), nap = ()=> new Promise(r=> setTimeout(r, 50));
  while(window.__cnt < want && performance.now() - t0 < 8000) await nap();
  let last = window.__cnt, since = performance.now(); while(performance.now() - since < 400){ await nap(); if(window.__cnt !== last){ last = window.__cnt; since = performance.now(); } }
  return last; };
// [name, js through the game's gate, ms to wait, nodes at High (at least), nodes at Low (exactly, or null = at least 1)]
const EVENTS = [
  ['Swift', `fxBatchVfx({type:'hit', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', targetSide:'B', targetUid:${U('2:0')}, targetDefId:'acacia-giraffe', dmg:2, dmgType:'physical'})`, 120, 2, 1],
  ['Mighty', `fxBatchVfx({type:'hit', side:'B', attUid:${U('2:0')}, attDefId:'acacia-giraffe', targetSide:'A', targetUid:${U('1:-1')}, targetDefId:'pike-lancer', dmg:6, dmgType:'physical'})`, 900, 6, 2],
  ['Sturdy', `fxBatchVfx({type:'hit', side:'A', attUid:${U('1:-1')}, attDefId:'pike-lancer', targetSide:'B', targetUid:${U('2:-1')}, targetDefId:'pangolin-roller', dmg:2, mods:['sturdy'], dmgType:'physical'})`, 900, 5, 4],
  ['Tide', `fxBatchVfx({type:'tide', tide:'flow', round:3})`, 650, 2, 1],
  ['Hatchling', `fxBatchVfx({type:'evolve', side:'A', uid:${U('1:0')}, defId:'jackrabbit-sprinter', fromDefId:'jackrabbit-sprinter', stage:1, stem:{attack:1, health:2, skills:[]}})`, 300, 7, 3],
  ['Reach', `fxBatchVfx({type:'statusFx', kind:'reachAim', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', targetSide:'B', targetUid:${U('2:-1')}, targetDefId:'pangolin-roller'})`, 120, 7, 1],
  ['Foraging berry', `fxBatchVfx({type:'statusFx', kind:'sk2Berry', side:'B', attUid:${U('2:1')}, attDefId:'dormouse', targetUid:${U('2:1')}, amount:1, total:2})`, 150, 2, 1],
  ['Foraging feed', `fxBatchVfx({type:'statusFx', kind:'sk2BerryEat', side:'B', attUid:${U('2:1')}, attDefId:'dormouse', targetUid:${U('2:0')}, amount:3, total:0})`, 150, 4, 2],
  ['Twin Strike', `fxBatchVfx({type:'frenzy', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', twin:true})`, 120, 3, 2],
  ['Boss: sea', `fxHook('bossEntrance', {name:'The Drowned Colossus', icon:'🌀', kind:'boss'}, false)`, 700, 4, 1],
  ['Boss: mage', `fxHook('bossEntrance', {name:'The Kelp Witch', icon:'🧜', kind:'boss'}, false)`, 700, 3, 2],
  ['Raid: the Abyss', `fxHook('raidEntrance', {id:'goliath', name:'The Goliath'})`, 400, 4, 1],
];
(async()=>{
  const srv = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p);
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
  await new Promise(r=> srv.listen(0, r)); const port = srv.address().port;
  const b = await pw().chromium.launch({executablePath: EXE}); const errs = [];
  const open = async(reduce)=>{ const pg = await b.newPage({viewport: {width: 1366, height: 768}, reducedMotion: reduce ? 'reduce' : 'no-preference'});
    pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(SKIP); await pg.goto(`http://127.0.0.1:${port}/`);
    await pg.waitForFunction(()=> typeof startConquestMatch === 'function' && window.FX && FX.V, null, {timeout: 120000}); await pg.evaluate(OWN); await pg.evaluate(BOARD); return pg; };
  const level = (pg, l)=> pg.evaluate(l=>{ localStorage.setItem('bramblewood_fx_level', l); applyFxLevel(); }, l);
  const count = async(pg, js, ms, want)=>{ await pg.evaluate(()=>{ document.querySelectorAll('.fxv:not(style)').forEach(e=> e.remove()); window.__cnt = 0; matchState.round = (matchState.round || 1) + 1; /* a fresh round: the once-a-round looks may play again */ }); await pg.evaluate(js); await pg.waitForTimeout(ms); return pg.evaluate(SETTLE, want || 0); };
  try{
    const pg = await open(false);
    ok(await pg.evaluate(c=> c.every(k=> typeof SoundKit[k] === 'function'), CUES.filter(c=> c !== 'candleCatch' && c !== 'riteLift').concat(['candleCatch', 'riteLift'])), 'every cue is on SoundKit');
    // the effects through the gate at High, Low, None
    for(const [name, js, ms, hi, lo] of EVENTS){
      await level(pg, 'high'); const h = await count(pg, js, ms, hi); await pg.waitForTimeout(1900);
      await level(pg, 'low'); const l = await count(pg, js, ms, lo == null ? 1 : lo); await pg.waitForTimeout(1900);
      await level(pg, 'none'); const z = await count(pg, js, ms);
      ok(h >= hi, `${name}: draws at Effects High (${h} nodes, at least ${hi})`); ok(lo == null ? l >= 1 : l === lo, `${name}: its minimal version at Effects Low (${l} nodes, ${lo})`); ok(z === 0, `${name}: nothing at Effects None (${z})`);
      ok(l < h, `${name}: Low draws less than High (${l} < ${h})`); }
    // Pounce / Swift on a ranged shot, a skill-less hit: nothing from FX.V
    await level(pg, 'high');
    ok(await count(pg, `fxBatchVfx({type:'hit', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', targetSide:'B', targetUid:${U('2:1')}, targetDefId:'dormouse', dmg:1, ranged:true})`, 120) === 0, 'a ranged hit by a Swift unit draws no streaks');
    ok(await count(pg, `fxBatchVfx({type:'tide', tide:'flow', round:4, moonpull:true})`, 650) === 0, 'Moonpull\'s tide draws no crests');
    ok(await count(pg, `fxBatchVfx({type:'frenzy', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', twin:false})`, 120) === 0, 'Frenzy (not Twin Strike) draws no blades');
    ok(await count(pg, `fxHook('bossEntrance', {name:'The Hollow King', icon:'👑', kind:'boss'}, false)`, 700) === 0, 'a boss with no sea / mage / skeleton name keeps its old opener only');
    ok((await pg.evaluate(()=> ['The Drowned Colossus', 'The Kelp Witch', 'The Hollow King', 'Ossuary Lich', 'The Goliath'].map(n=> FX.V.bossKind({name:n})).join())) === 'sea,mage,,skeleton,sea', 'bossKind: sea, mage, none, skeleton, sea');
    ok(await pg.evaluate(()=> FX.V.skeletonRise(hqTileEl('B')).then(()=> true)), 'the skeleton look plays (Lab only in fights)');
    // weather: fieldKind from the field card / rules, the layer on at Medium+, hidden by CSS at Low
    const fk = await pg.evaluate(()=>{ const f = (field, rules)=> FX.V.fieldKind({engine: {getField: ()=> field ? {id: field} : null}, rules, conquestNode: null});
      return [f('frozen', {}), f('heatwave', {}), f(null, {sandstorm: 1}), f(null, {thunderstorm: true}), f(null, {ashRain: 1}), f(null, {heatLevel: 2}), f('fog', {}), f(null, {})].join(); });
    ok(fk === 'frost,heat,sand,storm,ash,heat,,', `fieldKind: frost, heat, sand, storm, ash, heat, none for Thick Fog (FX.B's) and none (${fk})`);
    const fl = await pg.evaluate(async()=>{ const bf = document.getElementById('battlefieldEl'), fake = {engine: {getField: ()=> ({id: 'frozen'})}, rules: {}};
      fxHook('matchUI', fake); const a = bf.querySelector(':scope > .fxv-field'), k = a && a.dataset.kind, on = a && getComputedStyle(a).display;
      const z = a ? getComputedStyle(a).zIndex : null;
      localStorage.setItem('bramblewood_fx_level', 'low'); applyFxLevel(); const hid = a && getComputedStyle(a).display; fxHook('matchUI', fake); const gone = !bf.querySelector(':scope > .fxv-field');
      localStorage.setItem('bramblewood_fx_level', 'high'); applyFxLevel(); fxHook('matchUI', fake); fxHook('resultsShown'); const cleared = !bf.querySelector(':scope > .fxv-field');
      return {k, on, z, hid, gone, cleared}; });
    ok(fl.k === 'frost' && fl.on !== 'none' && fl.z === '-1', `the frost layer is on the board under the cards (${JSON.stringify(fl)})`);
    ok(fl.hid === 'none' && fl.gone && fl.cleared, 'hidden at Effects Low, not added there, cleared on the results');
    // the Caged Fight: the cage slams once the opener is gone, once a fight
    const cage = await pg.evaluate(async([u, SETTLE])=>{ const m = matchState, c = m.players[2].row.right.find(x=> x.uid === u); c.cageOf = 'wandering-traveller'; m.caged = {level: 1}; SETTLE = eval(SETTLE);
      window.__cnt = 0; lastBoardSig = {1: null, 2: null}; renderBoard(); const a = await SETTLE(4);
      lastBoardSig = {1: null, 2: null}; renderBoard(); await new Promise(r=> setTimeout(r, 700)); const b2 = await SETTLE(0) - a; delete c.cageOf; m.caged = null; lastBoardSig = {1: null, 2: null}; renderBoard(); return {a, b2}; }, [await pg.evaluate(()=> window.__u['2:1']), String(SETTLE)]);
    ok(cage.a >= 4 && cage.b2 === 0, `the cage slams on its first render, not again (${cage.a}, then ${cage.b2})`);
    // RITUAL1: the rite on The Sixfold
    const rite = await pg.evaluate(async(u)=>{ RT1.seen.clear(); RT1.lit.clear(); lastBoardSig = {1: null, 2: null}; renderBoard(); const el = boardCardEl(u), r = el && el.querySelector('.card-tile > .rt1-rite');
      const out = {inRitual: el && el.classList.contains('is-ritual'), rite: !!r, candles: r ? r.querySelectorAll('.rt1-candle').length : 0, lit: r ? [...r.querySelectorAll('.rt1-candle')].map(c=> c.classList.contains('is-lit') ? 1 : 0).join('') : '',
        enter: r && r.classList.contains('rt1-enter'), shape: r ? r.querySelectorAll('.rt1-shape polygon').length : 0, veil: !!(r && r.querySelector('.rt1-veil')), chipLow: !!(el && el.querySelector('.rt1-rite + .ritual-chip')),
        t: r && r.style.getPropertyValue('--rt1-t'), tileFilter: el && getComputedStyle(el.querySelector('.card-tile')).filter };
      const live = matchState.players[1].row.right.find(c=> c.uid === u);
      out.hover = (()=>{ const h = fullCardHTML('the-sixfold', live); return {shape: /ritual-shape/.test(h), tc: (h.match(/rt1-tc/g) || []).length, lit: (h.match(/rt1-tc is-lit/g) || []).length, have: /<b>6\/6<\/b>/.test(h) && /<b>2\/6<\/b>/.test(h)}; })();
      await new Promise(r2=> setTimeout(r2, 300)); matchState.players[1].castleDealt = 6; updateCardStatusDisplay(u); const r2 = el.querySelector('.card-tile > .rt1-rite');
      out.lit2 = r2 ? [...r2.querySelectorAll('.rt1-candle')].map(c=> c.classList.contains('is-lit') ? 1 : 0).join('') : ''; out.catch = r2 ? r2.querySelectorAll('.rt1-candle.rt1-catch').length : -1;
      window.__lift = 0; new MutationObserver(ms=> ms.forEach(x=> x.addedNodes.forEach(a=>{ if(a.classList && a.classList.contains('rt1-lift')) window.__lift++; }))).observe(document.body, {childList: true});
      live.ritualDone = true; updateCardStatusDisplay(u); for(let i = 0; i < 160 && !window.__lift; i++) await new Promise(r3=> setTimeout(r3, 50)); await new Promise(r3=> setTimeout(r3, 120)); // the lift waits a frame (TESTFIX15)
      out.after = !el.querySelector('.rt1-rite') && !el.classList.contains('is-ritual'); out.lift = window.__lift; return out; }, await pg.evaluate(()=> window.__u['1:1']));
    ok(rite.inRitual && rite.rite && rite.veil && rite.candles === 3 && rite.shape === 1, `the rite: dark veil, a triangle, three candles (${JSON.stringify(rite)})`);
    ok(rite.lit === '010' && rite.enter && rite.t === '1500ms' && rite.chipLow, 'drawn 6/6 is lit, the others not; it fades in over 1.5 s; the chip moves below');
    ok(rite.tileFilter === 'none', 'no filter on the card');
    ok(rite.hover.shape && rite.hover.tc === 3 && rite.hover.lit === 1 && rite.hover.have, 'the hover shows the shape with have / need and the lit candle');
    ok(rite.lit2 === '011' && rite.catch === 1, 'bramble damage 6/6: its candle lights and catches');
    ok(rite.after && rite.lift === 1, 'the Ritual complete: the rite goes and the darkness lifts once');
    // Effects Low: no fades, lit state kept
    const low = await pg.evaluate(async(u)=>{ localStorage.setItem('bramblewood_fx_level', 'low'); applyFxLevel(); const live = matchState.players[1].row.right.find(c=> c.uid === u); live.ritualDone = false;
      matchState.players[1].castleDealt = 2; RT1.seen.clear(); RT1.lit.clear(); RT1.rite.clear(); lastBoardSig = {1: null, 2: null}; renderBoard(); const r = boardCardEl(u).querySelector('.rt1-rite');
      const cd = r && r.querySelector('.rt1-candle'); return {rite: !!r, enter: r && r.classList.contains('rt1-enter'), lit: r ? r.querySelectorAll('.is-lit').length : 0, anim: cd ? getComputedStyle(cd).animationName : null}; }, await pg.evaluate(()=> window.__u['1:1']));
    ok(low.rite && !low.enter && low.lit === 1 && low.anim === 'none', `Effects Low: static candles, the met one lit (${JSON.stringify(low)})`);
    await pg.close();
    // reduced motion: nothing from FX.V's events or direct calls; the rite still says which are lit, with no animation; the weather layer hidden
    const rm = await open(true);
    for(const [name, js, ms] of EVENTS){ await rm.evaluate(()=>{ localStorage.setItem('bramblewood_fx_level', 'high'); applyFxLevel(); }); ok(await count(rm, js, ms) === 0, `${name}: nothing with reduced motion`); }
    ok(await count(rm, `(()=>{ FX.V.swiftDash(${`boardCardEl(${U('1:0')})`}); FX.V.cageClose(${`boardCardEl(${U('2:0')})`}); FX.V.seaRise(); })()`, 100) === 0, 'the looks called directly do nothing with reduced motion');
    const rr = await rm.evaluate(async(u)=>{ RT1.seen.clear(); RT1.lit.clear(); lastBoardSig = {1: null, 2: null}; renderBoard(); const r = boardCardEl(u).querySelector('.rt1-rite'), cd = r && r.querySelector('.rt1-candle');
      const l = FX.V.fieldAmbient(document.getElementById('battlefieldEl'), 'rain'), d = getComputedStyle(l).display; FX.V.fieldAmbient(document.getElementById('battlefieldEl'), null);
      return {rite: !!r, enter: r && r.classList.contains('rt1-enter'), lit: r ? r.querySelectorAll('.is-lit').length : 0, anim: cd ? getComputedStyle(cd).animationName : null, field: d}; }, await rm.evaluate(()=> window.__u['1:1']));
    ok(rr.rite && !rr.enter && rr.lit === 1 && rr.anim === 'none' && rr.field === 'none', `reduced motion: the rite without fades, the lit candle shown, no weather layer (${JSON.stringify(rr)})`);
    await rm.close();
  }catch(e){ ok(false, 'page run: ' + (e && e.stack || e)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(`vfx1-2026-11-27: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0);
})();
