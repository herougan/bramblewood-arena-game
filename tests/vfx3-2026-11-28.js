#!/usr/bin/env node
// 2026-11-28 (package VFX3, the standing VFX line): the shared looks VFX1's inventory left (Keen Sense, Siege, Bulwark, Lone Wolf / Throng /
// Plenty) and the undead rising as FX.V.skeletonRise.
//   1. files: the looks and cues, the step-asides (FX.A siegeRam / demolishCrack, FX.B keenSense, en5StateVfx's icon), the riser rule, the Lab
//      entries, the catalogue, the CHANGELOG, run-all.sh
//   2. the built page, a fight board: each look through the game's gate (fxBatchVfx / fxHook) at Effects High, less at Low, nothing at None or
//      with reduced motion; not where the skill did nothing; the undead rise
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- 1. files
const V = rd('bramblewood-fx-v.js'), app = rd('arena_app.js'), OWN = 'FX.V && FX.V.owns && FX.V.owns(ev)';
const FNS = ['keenSniff', 'siegeBatter', 'bulwarkPalisade', 'countUp'];
ok(FNS.every(f=> new RegExp('\\nM\\.' + f + ' = function').test(V)), 'FX.V has every VFX3 look: ' + FNS.filter(f=> !new RegExp('\\nM\\.' + f + ' = function').test(V)).join(', '));
ok(/\n  sniff\(P\)\{/.test(V) && /\n  countTick\(P, n\)\{/.test(V), 'the VFX3 cues are built from SoundKit.prim (Siege and Bulwark keep siegeTone / constructTone)');
ok(rd('bramblewood-fx-a.js').split(OWN + ') /* 2026-11-28 (VFX3)').length === 3, 'FX.A.siegeRam and demolishCrack step aside for FX.V');
ok(rd('bramblewood-fx-b.js').includes("if(!(" + OWN + ") /* 2026-11-28 (VFX3): FX.V.keenSniff instead */"), 'FX.B.keenSense (the dark) steps aside for FX.V');
ok(/fxAtLeast\('low'\) && !\(window\.FX && FX\.V && FX\.V\.owns && FX\.V\.owns\(ev\)\) \/\* 2026-11-28 \(VFX3\)/.test(app), 'en5StateVfx: the icon and ring step aside for the count look');
ok(/function uip1Bones\(d\)/.test(app) && /lich\\b/.test(app) && /FX\.V\.skeletonRise\(el, \{level: fxLevel\(\), speed: 1\.6\}\)/.test(app), 'riseUpFx plays FX.V.skeletonRise for the undead');
{ const man = rd('tools/effects-lab/manifest/vfx3.js'), IDS = ['sk-keen-sense-sniff', 'sk-siege-batter', 'sum-bulwark-palisade', 'sk-count-up', 'sum-undead-rise'];
  const reg = id=> man.includes(`id:'${id}'`) || man.includes(`two('${id}',`);
  ok(IDS.every(reg), 'the Effects Lab registers every VFX3 entry: ' + IDS.filter(id=> !reg(id)).join(', ')); }
ok(/package VFX3 \(2026-11-28\)/.test(rd('docs/effects-catalogue.md')) && /Package VFX3/.test(rd('docs/CHANGELOG.md')) && /tests\/vfx3-2026-11-28\.js/.test(rd('tests/run-all.sh')), 'catalogue, CHANGELOG, run-all.sh');

// ---- 2. the built page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ return require('/opt/npm-tools/node_modules/playwright'); } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');"
  + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield']));";
const OWNJS = "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
  + "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};";
// mine: Quarry Mole (Keen Sense), Badger Sapper (Siege), Peat-cutter Vole (Bulwark); theirs: Plains Zebra (Evasive), Dam Wall (a Structure),
// Lone Grey Wolf (Lone Wolf)
const BOARD = `(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const vs = document.querySelector('.vs-screen'); if(vs) vs.click(); await new Promise(r=> setTimeout(r, 500));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, [['quarry-mole', -1], ['badger-sapper', 0], ['peat-cutter-vole', 1]]); put(2, [['plains-zebra', -1], ['dam-wall', 0], ['lone-grey-wolf', 1]]);
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1000));
  window.__u = uids; window.__cnt = 0; new MutationObserver(ms=> ms.forEach(x=> x.addedNodes.forEach(a=>{ if(a.classList && a.classList.contains('fxv')) window.__cnt++; }))).observe(document.body, {childList: true});
  return uids; })()`;
const U = k=> `window.__u['${k}']`;
const hit = (a, ad, t, td, more)=> `{type:'hit', side:'${a[0] === '1' ? 'A' : 'B'}', attUid:${U(a)}, attDefId:'${ad}', targetSide:'${t[0] === '1' ? 'A' : 'B'}', targetUid:${U(t)}, targetDefId:'${td}', dmg:3, dmgType:'physical'${more || ''}}`;
const state = (name, on)=> `{type:'statusFx', kind:'stateSkill', name:'${name}', on:${on}, side:'B', attUid:${U('2:1')}, attDefId:'lone-grey-wolf', targetUid:${U('2:1')}, targetDefId:'lone-grey-wolf'}`;
// the Lone Grey Wolf's bonus (the engine's packBonus) rises from 0 to 3 between two board draws
const LONE = `(()=>{ const c = matchState.players[2].row.right[0]; c.packBonus = 0; lastBoardSig = {1:null, 2:null}; renderBoard(); c.packBonus = 3; lastBoardSig = {1:null, 2:null}; renderBoard(); })()`;
// an undead card rising as it is played: the board's riseUpFx on a card that reads as Cinder Skeleton
const RISE = (id)=> `(()=>{ const el = boardCardEl(${U('2:-1')}), t = el.dataset.defid ? el : el.querySelector('[data-defid]'), was = t.dataset.defid; t.dataset.defid = '${id}'; riseUpFx(el); setTimeout(()=>{ t.dataset.defid = was; }, 400); })()`;
// [name, js through the game's gate, ms to wait, nodes at High (at least), nodes at Low (exactly)]
const EVENTS = [
  ['Keen Sense (Evasive target)', `fxBatchVfx(${hit('1:-1', 'quarry-mole', '2:-1', 'plains-zebra')})`, 900, 5, 2],
  ['Siege (a Structure)', `fxBatchVfx(${hit('1:0', 'badger-sapper', '2:0', 'dam-wall')})`, 900, 8, 2],
  ['Siege (the bramble)', `fxBatchVfx({type:'hitHQ', side:'A', attUid:${U('1:0')}, attDefId:'badger-sapper', targetSide:'B', dmg:4, siege:true})`, 900, 8, 2],
  ['Bulwark', `fxBatchVfx({type:'spawn', side:'A', defId:'bulwark-wall', count:1, cause:'triggerSpawn', kind:'bulwark', uids:[${U('1:1')}], lane:'right', nearUid:${U('1:1')}})`, 400, 7, 3],
  ['Throng', `fxBatchVfx(${state('throng', true)})`, 400, 8, 1],
  ['Plenty', `fxBatchVfx(${state('plenty', true)})`, 400, 8, 3],
  ['Lone Wolf', LONE, 300, 5, 1],
  ['Undead rise', RISE('cinder-skeleton'), 500, 14, 8],
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
    ok(await pg.evaluate(()=> typeof SoundKit.sniff === 'function' && typeof SoundKit.countTick === 'function' && typeof SoundKit.siegeTone === 'function' && typeof SoundKit.constructTone === 'function'), 'the cues are on SoundKit');
    for(const [name, js, ms, hi, lo] of EVENTS){
      await level(pg, 'high'); const h = await count(pg, js, ms); await pg.waitForTimeout(800);
      await level(pg, 'low'); const l = await count(pg, js, ms); await pg.waitForTimeout(800);
      await level(pg, 'none'); const z = await count(pg, js, ms);
      ok(h >= hi, `${name}: draws at Effects High (${h} nodes, at least ${hi})`); ok(l === lo, `${name}: its smaller version at Effects Low (${l} nodes, ${lo})`); ok(z === 0, `${name}: nothing at Effects None (${z})`); }
    await level(pg, 'high');
    // not where the skill did nothing
    ok(await count(pg, `fxBatchVfx(${hit('1:-1', 'quarry-mole', '2:0', 'dam-wall')})`, 900) === 0, 'Keen Sense on a target it would have hit anyway (no Evasive, dark, fog or sand): no sniff');
    ok(await count(pg, `fxBatchVfx(${hit('1:0', 'badger-sapper', '2:-1', 'plains-zebra')})`, 900) === 0, 'Siege on a unit that is not a Structure: no ram');
    ok(await count(pg, `fxBatchVfx(${state('throng', false)})`, 200) === 0 && await count(pg, `fxBatchVfx(${state('carnage', true)})`, 200) < 5, 'Throng turning off, or another state skill: no count');
    ok(await count(pg, RISE('quarry-mole'), 500) === 0, 'a burrower (Quarry Mole) rises with its dirt only (no skull)');
    const rule = await pg.evaluate(()=> ['cinder-skeleton', 'magma-wraith', 'bog-revenant', 'quarry-mole', 'lichen-tortoise', 'obsidian-lich'].map(id=> +uip1Riser(id) + '' + +uip1Bones(getCardDefs()[id])).join(' '));
    ok(rule === '11 11 11 10 00 11', `the riser rule: the undead (subtype or species Undead) rise as bones, a mole with dirt, Lichen Tortoise stays down (${rule})`);
    // the shared looks step aside only while FX.V draws
    const own = await pg.evaluate(u=>{ const ev = [{type:'hitHQ', siege:true}, {type:'hit', attDefId:'badger-sapper', targetDefId:'dam-wall', dmg:2}, {type:'hit', attDefId:'quarry-mole', targetDefId:'plains-zebra', targetUid:u, dmg:2},
        {type:'statusFx', kind:'stateSkill', name:'plenty', on:true}, {type:'hit', attDefId:'quarry-mole', targetDefId:'dam-wall', targetUid:u, dmg:2}, {type:'statusFx', kind:'stateSkill', name:'carnage', on:true}];
      const at = l=>{ localStorage.setItem('bramblewood_fx_level', l); applyFxLevel(); return ev.map(e=> +FX.V.owns(e)).join(''); };
      const r = {high: at('high'), low: at('low'), none: at('none')}; at('high'); return r; }, await pg.evaluate(()=> window.__u['2:-1']));
    ok(own.high === '111100' && own.low === '111100' && own.none === '000000', `FX.V.owns: Siege, Keen Sense, the count at High and Low, not at None (${JSON.stringify(own)})`);
    const ico = await pg.evaluate(u=>{ const n = ()=> document.querySelectorAll('.en5-state-ico').length, ev = name=> ({type:'statusFx', kind:'stateSkill', name, on:true, side:'B', attUid:u, targetUid:u, targetDefId:'lone-grey-wolf'});
      document.querySelectorAll('.en5-state-ico').forEach(e=> e.remove()); en5StateVfx(ev('throng')); const a = n(); en5StateVfx(ev('carnage')); return [a, n() - a]; }, await pg.evaluate(()=> window.__u['2:1']));
    ok(ico[0] === 0 && ico[1] === 1, `en5StateVfx: no icon for Throng (the count instead), Carnage keeps it (${ico})`);
    await pg.close();
    // reduced motion: nothing
    const rm = await open(true);
    for(const [name, js, ms] of EVENTS){ await rm.evaluate(()=>{ localStorage.setItem('bramblewood_fx_level', 'high'); applyFxLevel(); }); ok(await count(rm, js, ms) === 0, `${name}: nothing with reduced motion`); }
    ok(await count(rm, `(()=>{ const a = boardCardEl(${U('1:0')}), t = boardCardEl(${U('2:0')}); FX.V.keenSniff(a, t); FX.V.siegeBatter(t); FX.V.bulwarkPalisade(a); FX.V.countUp(a, {kind:'plenty', n:4}); FX.V.skeletonRise(t); })()`, 100) === 0, 'the looks called directly do nothing with reduced motion');
    ok(await rm.evaluate(()=> !FX.V.owns({type:'hitHQ', siege:true})), 'reduced motion: FX.V owns nothing (FX.A / FX.B keep their own rules)');
    await rm.close();
  }catch(e){ ok(false, 'page run: ' + (e && e.stack || e)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(`vfx3-2026-11-28: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0);
})();
