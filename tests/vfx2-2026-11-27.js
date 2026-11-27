#!/usr/bin/env node
// 2026-11-27 (package VFX2, owner 15:40 "make more gif effects"; standing order 09:55: card, skill, field and boss VFX).
//   1. files: FX.V's VFX2 looks and cues, no filter / blend mode in its CSS, the shared looks stepping aside (FX.V.owns), the Lab entries, the
//      inventory rows, the catalogue, the CHANGELOG, run-all.sh
//   2. the built page, a fight board: every VFX2 look registered and drawn through the game's own gate (fxBatchVfx / fxHook) at Effects High,
//      a smaller version at Low, nothing at None or with reduced motion; the shared looks step aside only while FX.V draws; the Lab-only
//      looks (the skins ladder's auras) called directly: a static glow at None / reduced motion, moving particles only at Medium+
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- 1. files
const V = rd('bramblewood-fx-v.js'), app = rd('arena_app.js');
const FNS = ['gashBleed', 'stampedeRun', 'pulveriseShatter', 'cullClaw', 'constrictCoil', 'webNet', 'intimidateGlare', 'decayRot', 'exploitLock', 'embrittleCrack',
  'harbingerFeathers', 'carrionPeck', 'carnageMoon', 'momentumFlame', 'broodBurst', 'fletcherGlint', 'herbLeaves', 'packHowlRings', 'repairSparks', 'trigLook',
  'shockHop', 'warningPulse', 'rendAround', 'rendMark', 'tokenTick', 'skinAura', 'owns'];
ok(FNS.every(f=> new RegExp('\\nM\\.' + f + ' = function').test(V)), 'FX.V has every VFX2 look: ' + FNS.filter(f=> !new RegExp('\\nM\\.' + f + ' = function').test(V)).join(', '));
const CUES = ['gashRip', 'stampRumble', 'plateShatter', 'cullRake', 'coilSqueeze', 'webSpin', 'glareGrowl', 'rotCreep', 'lockOn', 'iceCrack',
  'crowCaw', 'peck', 'moonPulse', 'flameUp', 'broodPop', 'quillGlint', 'leafSwirl', 'howlRing', 'hammerTink', 'trigRise', 'trigWisp', 'trigClash', 'trigCheck',
  'wetZap', 'warnPulse', 'rendBurst', 'tokenTock'];
ok(CUES.every(c=> new RegExp('\\n  ' + c + '\\(P\\)\\{').test(V)), 'the VFX2 cues are built from SoundKit.prim: ' + CUES.filter(c=> !new RegExp('\\n  ' + c + '\\(P\\)\\{').test(V)).join(', '));
const vcss = (V.match(/css\('[^']+', `[\s\S]*?`\);/g) || []).join('\n');
ok(/css\('aura'/.test(V) && !/(^|[^-])filter\s*:|mix-blend-mode|backdrop-filter/.test(vcss), 'no filter or blend mode in FX.V\'s CSS (the auras are box-shadow and pixel bits)');
const OWN = 'FX.V && FX.V.owns && FX.V.owns(ev)';
ok((app.match(/!\(window\.FX && FX\.V && FX\.V\.owns && FX\.V\.owns\(ev\)\)/g) || []).length >= 5, 'the shared looks in arena_app.js step aside for FX.V (gash drip, vines, portal, chain bolt, trigger badge)');
ok(rd('bramblewood-fx-a.js').split(OWN).length >= 3 && rd('bramblewood-fx-b.js').includes(OWN), 'FX.A (Stampede paw prints, Momentum chevrons) and FX.B (Decay mould) step aside');
const IDS = ['sk-gash', 'atk-overwhelm-hq', 'sk-pulverise', 'atk-cull', 'sk-constrict', 'sk-web', 'sk-intimidate', 'st-decay-tick', 'sk-exploit', 'sk-embrittle',
  'sk-harbinger', 'sk-carrion', 'sk-carnage', 'sk-momentum', 'sum-progeny-brood', 'sk-fletcher', 'sk-herbalist', 'sk-pack-leader', 'sk-repair', 'sk-trigger-fired',
  'sk-wet-chain', 'sk-warning-colours', 'sk-rend-around', 'st-token-tick', 'card-skin-aura'];
{ const man = rd('tools/effects-lab/manifest/vfx2b.js'), inv = JSON.parse(rd('docs/effects-inventory-2026-10-15.json')), by = Object.fromEntries(inv.map(e=> [e.id, e]));
  ok(IDS.every(id=> man.includes(`id:'${id}'`)), 'the Effects Lab registers every VFX2 entry: ' + IDS.filter(id=> !man.includes(`id:'${id}'`)).join(', '));
  ok(IDS.every(id=> by[id] && (by[id].added === '2026-11-27' || by[id].updated === '2026-11-27') && /VFX2/.test(by[id].quality)), 'the inventory has every VFX2 row: ' + IDS.filter(id=> !(by[id] && /VFX2/.test(by[id].quality))).join(', ')); }
ok(/package VFX2 \(2026-11-27\)/.test(rd('docs/effects-catalogue.md')) && /Package VFX2 \(2026-11-27/.test(rd('docs/CHANGELOG.md')) && /tests\/vfx2-2026-11-27\.js/.test(rd('tests/run-all.sh')), 'catalogue, CHANGELOG, run-all.sh');

// ---- 2. the built page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ return require('/opt/npm-tools/node_modules/playwright'); } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');"
  + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield']));";
const OWNJS = "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
  + "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};";
// mine: Hedge Weasel (Cull), Booming Bittern (Intimidate), Newt Doctor (Herbalist); theirs: Dormouse (a weak unit), Dhole Matriarch (Pack Leader),
// Dhole Runner (Pack). Fletcher and 💀 Rend {around} are on no card on the board: the page lends them to a def while it checks them.
const BOARD = `(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const vs = document.querySelector('.vs-screen'); if(vs) vs.click(); await new Promise(r=> setTimeout(r, 500));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, [['hedge-weasel', -1], ['booming-bittern', 0], ['newt-doctor', 1]]); put(2, [['dormouse', -1], ['dhole-matriarch', 0], ['dhole-runner', 1]]);
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1000));
  window.__u = uids; window.__cnt = 0; new MutationObserver(ms=> ms.forEach(x=> x.addedNodes.forEach(a=>{ if(a.classList && a.classList.contains('fxv')) window.__cnt++; }))).observe(document.body, {childList: true});
  return uids; })()`;
const U = k=> `window.__u['${k}']`;
const hit = (a, ad, t, td, more)=> `{type:'hit', side:'${a[0] === '1' ? 'A' : 'B'}', attUid:${U(a)}, attDefId:'${ad}', targetSide:'${t[0] === '1' ? 'A' : 'B'}', targetUid:${U(t)}, targetDefId:'${td}', dmg:3, dmgType:'physical'${more || ''}}`;
const sfx = (kind, a, t, more)=> `{type:'statusFx', kind:'${kind}', side:'${a[0] === '1' ? 'A' : 'B'}', attUid:${U(a)}, attDefId:'x', targetSide:'${t[0] === '1' ? 'A' : 'B'}', targetUid:${U(t)}, targetDefId:'x', amount:1${more || ''}}`;
// the Dormouse as the replay sees it: Hedge Weasel's Cull is 'weaker' (less Attack than the striker), a bonus the game shows no number for
const WEAK = `matchState.replayCards = {[${U('2:-1')}]: {defId:'dormouse', hp:3, maxHp:3, atk:1, slot:-1}, [${U('1:-1')}]: {defId:'hedge-weasel', hp:9, maxHp:9, atk:3, slot:-1}}`;
// [name, js through the game's gate, ms to wait, nodes at High (at least), nodes at Low (exactly, or null = at least 1)]
const EVENTS = [
  ['Gash', `fxBatchVfx({type:'gash', side:'A', attUid:${U('1:-1')}, attDefId:'goblin-shark', targetSide:'B', targetUid:${U('2:-1')}, targetDefId:'dormouse', amount:3})`, 150, 4, 1],
  ['Stampede', `fxBatchVfx({type:'overwhelmHQ', side:'A', attUid:${U('1:0')}, attDefId:'warhorse-charger', targetSide:'B', dmg:2})`, 150, 11, 4],
  ['Pulverise', `fxBatchVfx(${sfx('pulverise', '1:0', '2:0', ", broke:['armor']")})`, 150, 6, 4],
  ['Cull', `(()=>{ ${WEAK}; fxBatchVfx(${hit('1:-1', 'hedge-weasel', '2:-1', 'dormouse')}); matchState.replayCards = null; })()`, 900, 3, 1],
  ['Constrict', `fxBatchVfx(${sfx('constrict', '2:0', '1:0', ', strangle:1')})`, 150, 3, 1],
  ['Web', `fxBatchVfx(${sfx('webbed', '2:0', '1:0')})`, 150, 5, 1],
  ['Intimidate', `fxBatchVfx({type:'play', side:'A', defId:'booming-bittern', uid:${U('1:0')}, boardSide:'center', slot:0})`, 500, 2, 1],
  ['Decay', `fxBatchVfx({type:'decayTick', side:'B', defId:'dormouse', uid:${U('2:-1')}, dmg:1, atk:1})`, 150, 6, 1],
  ['Exploit', `fxBatchVfx(${sfx('exploit', '1:0', '2:0')})`, 150, 5, 4],
  ['Embrittle', `fxBatchVfx(${sfx('brittle', '1:0', '2:0')})`, 150, 3, 1],
];
(async()=>{
  const srv = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p);
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
  await new Promise(r=> srv.listen(0, r)); const port = srv.address().port;
  const b = await pw().chromium.launch({executablePath: EXE}); const errs = [];
  const open = async(reduce)=>{ const pg = await b.newPage({viewport: {width: 1366, height: 768}, reducedMotion: reduce ? 'reduce' : 'no-preference'});
    pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(SKIP); await pg.goto(`http://127.0.0.1:${port}/`);
    await pg.waitForFunction(()=> typeof startConquestMatch === 'function' && window.FX && FX.V, null, {timeout: 120000}); await pg.evaluate(OWNJS); await pg.evaluate(BOARD); return pg; };
  const level = (pg, l)=> pg.evaluate(l=>{ localStorage.setItem('bramblewood_fx_level', l); applyFxLevel(); }, l);
  const count = async(pg, js, ms)=>{ await pg.evaluate(()=>{ document.querySelectorAll('.fxv:not(style)').forEach(e=> e.remove()); window.__cnt = 0; matchState.round = (matchState.round || 1) + 1; }); await pg.evaluate(js); await pg.waitForTimeout(ms); return pg.evaluate(()=> window.__cnt); };
  try{
    const pg = await open(false);
    ok(await pg.evaluate(c=> c.every(k=> typeof SoundKit[k] === 'function'), CUES), 'every VFX2 cue is on SoundKit');
    for(const [name, js, ms, hi, lo] of EVENTS){
      await level(pg, 'high'); const h = await count(pg, js, ms); await pg.waitForTimeout(700);
      await level(pg, 'low'); const l = await count(pg, js, ms); await pg.waitForTimeout(700);
      await level(pg, 'none'); const z = await count(pg, js, ms);
      ok(h >= hi, `${name}: draws at Effects High (${h} nodes, at least ${hi})`); ok(lo == null ? l >= 1 : l === lo, `${name}: its smaller version at Effects Low (${l} nodes, ${lo})`); ok(z === 0, `${name}: nothing at Effects None (${z})`);
      ok(l < h, `${name}: Low draws less than High (${l} < ${h})`); }
    await level(pg, 'high');
    // the shared looks step aside only while FX.V draws
    const own = await pg.evaluate(()=>{ const g = {type:'gash'}, c = {type:'statusFx', kind:'constrict'}, p = {type:'statusFx', kind:'pulverise'};
      const at = l=>{ localStorage.setItem('bramblewood_fx_level', l); applyFxLevel(); return [FX.V.owns(g), FX.V.owns(c), FX.V.owns(p)].map(Number).join(''); };
      const r = {high: at('high'), low: at('low'), none: at('none')}; at('high'); return r; });
    ok(own.high === '110' && own.low === '110' && own.none === '000', `FX.V.owns: gash / constrict at High and Low, not at None; never for a look that adds to the shared one (${JSON.stringify(own)})`);
    ok(await count(pg, `(()=>{ matchState.replayCards = {[${U('2:-1')}]: {defId:'dormouse', hp:9, maxHp:9, atk:5, slot:-1}, [${U('1:-1')}]: {defId:'hedge-weasel', hp:9, maxHp:9, atk:3, slot:-1}}; fxBatchVfx(${hit('1:-1', 'hedge-weasel', '2:-1', 'dormouse')}); matchState.replayCards = null; })()`, 900) === 0, 'Cull on a unit that is not weak: no claw');
    ok(await count(pg, `fxBatchVfx({type:'play', side:'A', defId:'hedge-weasel', uid:${U('1:-1')}, boardSide:'left', slot:-1})`, 500) === 0, 'a unit without Intimidate lands: no glare');
    await pg.close();
    // reduced motion: nothing from the VFX2 events or the looks called directly
    const rm = await open(true);
    for(const [name, js, ms] of EVENTS){ await rm.evaluate(()=>{ localStorage.setItem('bramblewood_fx_level', 'high'); applyFxLevel(); }); ok(await count(rm, js, ms) === 0, `${name}: nothing with reduced motion`); }
    ok(await count(rm, `(()=>{ FX.V.gashBleed(boardCardEl(${U('2:-1')})); FX.V.webNet(boardCardEl(${U('1:0')})); FX.V.stampedeRun(null, hqTileEl('B')); })()`, 100) === 0, 'the looks called directly do nothing with reduced motion');
    ok(await rm.evaluate(()=> !FX.V.owns({type:'gash'})), 'reduced motion: FX.V owns nothing (the shared looks keep their own reduced-motion rules)');
    await rm.close();
  }catch(e){ ok(false, 'page run: ' + (e && e.stack || e)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(`vfx2-2026-11-27: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0);
})();
