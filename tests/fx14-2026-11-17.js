#!/usr/bin/env node
// 2026-11-17 (package FX14, owner 11-16 23:53: "More effects etc. The bolt as is, isn't so nice looking. The arrows — blood etc — do they look
// nice? etc etc"). Checks:
//   1. files: FX.H's new looks and cues, the game's calls (ninthPassVfx, the ranged hit, Plunder, fieldResSideHTML), arrows at 380 ms, FX.A's
//      ice tint and arrow rain stepping aside, no filter / blend mode in FX.H's CSS, Lab entries, inventory, catalogue, CHANGELOG, run-all.sh
//   2. in the built page, on a real fight board, through renderVfxForEvent: every bolt element, Spitfire, the Shock Bolt's fork, a dodged
//      bolt (no splash), every arrow variant (plain, flaming, ice, – bleed, – poison, Twin Shot, Volley, Archer, a dodge), the resource
//      skills (Forestry, Prospecting, Plunder, Masonry, Refining, Pearls, Quarrying, Barter paying): each draws, leaves nothing behind and
//      logs no error; reduced motion and Effects None keep the old looks
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- 1. files
const H = rd('bramblewood-fx-h.js'), app = rd('arena_app.js'), A = rd('bramblewood-fx-a.js');
const FNS = ['boltShot', 'shockBolt', 'arrowShot', 'arrowVariant', 'volleyLoose', 'forestryLog', 'coinFlip', 'plunderCoins', 'anvilSpark', 'pearlGlint', 'oreChip'];
ok(FNS.every(f=> new RegExp('\\nM\\.' + f + ' = function').test(H)), 'FX.H has every FX14 look');
const CUES = ['boltFire', 'boltIce', 'boltAcid', 'boltPoison', 'spitfire', 'arrowSlash', 'venomPuff', 'crystalPop', 'logTumble', 'coinFlip', 'anvilTink', 'pearlChime', 'pickChip'];
ok(CUES.every(c=> new RegExp('\\n  ' + c + '\\(P\\)\\{').test(H)), 'the 13 FX14 cues are built from SoundKit.prim');
const hcss = (H.match(/css\('[^']+', `[\s\S]*?`\);/g) || []).join('\n');
ok(/css\('fx14'/.test(H) && !/(^|[^-])filter\s*:|mix-blend-mode|backdrop-filter/.test(hcss), 'no filter or blend mode in FX.H\'s CSS');
ok(/FX\.H\.boltShot\(from, to, \{element: ev\.element, spitfire: ev\.key === 'spitfire', total: am\.windup \+ am\.projectile, uid: ev\.uid\}\)/.test(app) && /else if\(F && F\.boltGlob/.test(app), 'ninthPassVfx: FX.H.boltShot with the old impact time, the glob kept as the fallback');
ok(/FX\.H\.arrowShot\(shooter \|\| hqTileEl\(ev\.side\), targetEl, \{variant: FX\.H\.arrowVariant\(pa,/.test(app) && /miss: ev\.type === 'evaded'/.test(app) && /else if\(window\.SkillFX\)\{ SkillFX\.setImages/.test(app), 'the ranged hit: FX.H.arrowShot, SkillFX.bowShot kept as the fallback');
ok(/pendingArrow = \{uid: ev\.uid, fire: !!ev\.fire, style: ev\.style \|\| null, ice: !!ev\.ice, twin: !!ev\.twin, volley: !!ev\.volley, archer: !!ev\.archer, odd: !!\(ev\.bola \|\| ev\.lasso\)\}/.test(app), 'pendingArrow carries the variant (Bola / Lasso keep the old arrow)');
ok(/function arrowFlightMs\(\)\{ const mult = \(matchState && matchState\.speedMult\) \|\| 1; return Math\.max\(120, Math\.round\(380 \/ mult\)\); \}/.test(app) && /else if\(ev\._arrowShot\) base = 760;/.test(app) && Math.round(390*0.6) + 380 < 760, 'arrows fly 380 ms and still land inside their 760 ms beat');
ok(/fxHook\('fieldRes', m, pid, p0, mine\)/.test(app) && /!\(ev\.cause === 'forestry' && window\.FX && FX\.H && FX\.H\.forestryLog\)/.test(app) && /FX\.H\.plunderCoins && fxAtLeast\('med'\)/.test(app), 'the Forestry, Plunder and Barter / Pearl hooks');
ok(/!\(FX\.H && FX\.H\.arrowShot\) \/\* FX14 \(2026-11-17\): FX\.H's loose/.test(A) && /ar\.ice && med && !\(FX\.H && FX\.H\.arrowShot\)/.test(A), 'FX.A\'s arrow rain and ice tint step aside for FX.H');
const man = rd('tools/effects-lab/manifest/h.js'), inv = JSON.parse(rd('docs/effects-inventory-2026-10-15.json')), by = Object.fromEntries(inv.map(e=> [e.id, e]));
const NEW = ['atk-bolt-miss', 'atk-arrow-bleed', 'atk-arrow-venom', 'atk-archer-arrow', 'atk-arrow-miss', 'sk-forestry-log', 'sk-gold-coin', 'sk-plunder-coins', 'sk-anvil-forge', 'sk-pearl-glint', 'sk-ore-chip'];
const UPD = ['atk-arrow', 'atk-fire-arrow', 'atk-ice-arrow', 'atk-twin-shot', 'atk-volley', 'atk-bolt-fire', 'atk-bolt-acid', 'atk-bolt-poison', 'atk-bolt-ice', 'atk-bolt-shock', 'sk-spitfire'];
ok(NEW.concat(UPD).every(id=> man.includes(`id:'${id}'`) || new RegExp(`'${id}'`).test(man)), 'the Lab registers every FX14 entry');
ok(NEW.every(id=> by[id] && by[id].status === 'live' && by[id].batch === 'H') && UPD.every(id=> by[id] && by[id].updated === '2026-11-17' && /FX14/.test(by[id].quality)), 'the inventory: 11 new live entries, 11 updated');
ok(/package FX14/.test(rd('docs/effects-catalogue.md')) && /package FX14/.test(rd('docs/CHANGELOG.md')) && /FX14 cues/.test(rd('docs/sfx-cue-sheet.md')) && /tests\/fx14-2026-11-17\.js/.test(rd('tests/run-all.sh')), 'catalogue, CHANGELOG, cue sheet, run-all.sh');

// ---- 2. the built page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ try{ return require('/opt/npm-tools/node_modules/playwright'); }catch(e3){ console.log('  playwright not found'); process.exit(1); } } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');"
  + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
const OWN = "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
  + "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};";
// a fight whose board is exactly these units, the CPU kept from acting (as tests/fx11-2026-11-16.js)
const BOARD = `(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, [['owl-fletcher', -1], ['spitting-cobra', 0], ['fire-salamander', 1]]); put(2, [['hymn-wren', -1], ['beaver-lumberjack', 0], ['glowing-gecko', 1]]);
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.players[1].gold = 3; m.players[1].pearls = 2; m.players[1].lumber = 2; m.players[2].gold = 4;
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1200)); window.__u = uids; return uids; })()`;
const U = k=> `window.__u['${k}']`;
const shot = (k, o)=> `({side:'A', uid:${U(k)}, defId:'${(o && o.def) || 'owl-fletcher'}', targetSide:'B', targetUid:${U((o && o.t) || '2:0')}, targetDefId:'beaver-lumberjack', amount:2})`;
// an 'arrow' / 'bolt' event, then (40 ms later, as delayForEvent paces them) its ranged hit or dodge
const pair = (first, k, o)=>{ o = o || {}; const att = U(k), def = o.def || 'owl-fletcher', tgt = U(o.t || '2:0');
  const second = o.evade ? `{type:'evaded', side:'A', attUid:${att}, attDefId:'${def}', targetSide:'B', targetUid:${tgt}, targetDefId:'beaver-lumberjack', ranged:true}`
    : `{type:'hit', side:'A', attUid:${att}, attDefId:'${def}', targetSide:'B', targetUid:${tgt}, targetDefId:'beaver-lumberjack', dmg:2, ranged:true, dmgType:'${o.dmgType || 'physical'}'}`;
  return `renderVfxForEvent(Object.assign(${first}, ${shot(k, o)})); setTimeout(()=> renderVfxForEvent(${second}), 40)`; };
const ev = js=> `renderVfxForEvent(${js})`;
const RUNS = [ // [name, js, selector that must appear, selector that must not]
  ['Fire Bolt', pair(`{type:'bolt', element:'fire', key:'fireBolt'}`, '1:0', {def:'spitting-cobra', dmgType:'heat'}), '.fxh-pj.fire'],
  ['Ice Bolt', pair(`{type:'bolt', element:'ice', key:'iceBolt'}`, '1:0', {def:'spitting-cobra', dmgType:'cold'}), '.fxh-shard'],
  ['Acid Bolt', pair(`{type:'bolt', element:'acid', key:'acidBolt'}`, '1:0', {def:'spitting-cobra', dmgType:'acid'}), '.fxh-splat'],
  ['Poison Bolt', pair(`{type:'bolt', element:'poison', key:'poisonBolt'}`, '1:0', {def:'spitting-cobra', dmgType:'poison'}), '.fxh-puff'],
  ['Spitfire', pair(`{type:'bolt', element:'fire', key:'spitfire'}`, '1:1', {def:'fire-salamander', dmgType:'heat'}), '.fxh-pj.spit'],
  ['a dodged Acid Bolt (no splash)', pair(`{type:'bolt', element:'acid', key:'acidBolt'}`, '1:0', {def:'spitting-cobra', evade:true}), '.fxh-pj.acid', '.fxh-splat'],
  ['Shock Bolt', pair(`{type:'bolt', element:'shock', key:'shockBolt'}`, '1:0', {def:'spitting-cobra', dmgType:'shock'}), '.fxh-fork'],
  ['Arrow', pair(`{type:'arrow', fire:false}`, '1:-1'), '.fxh-arrow.plain'],
  ['Arrow: the bow', pair(`{type:'arrow', fire:false}`, '1:-1'), '.fxh-bow'],
  ['Arrow (Flaming)', pair(`{type:'arrow', fire:true}`, '1:-1', {dmgType:'heat'}), '.fxh-arrow.fire'],
  ['Ice Arrow', pair(`{type:'arrow', fire:false, ice:true}`, '1:-1', {dmgType:'cold'}), '.fxh-shard', '.fxa-ice-arrow'],
  ['Arrow – bleed', `(()=>{ getCardDefs()['owl-fletcher'].effects.arrowBleed = true; ${pair(`{type:'arrow', fire:false}`, '1:-1')}; setTimeout(()=>{ delete getCardDefs()['owl-fletcher'].effects.arrowBleed; }, 300); })()`, '.fxh-slash'],
  ['Arrow – poison', `(()=>{ getCardDefs()['owl-fletcher'].effects.arrowPoison = true; ${pair(`{type:'arrow', fire:false}`, '1:-1')}; setTimeout(()=>{ delete getCardDefs()['owl-fletcher'].effects.arrowPoison; }, 300); })()`, '.fxh-puff.venom'],
  ['Twin Shot', `${pair(`{type:'arrow', fire:false, twin:true}`, '1:0', {def:'spitting-cobra', t:'2:-1'})}; setTimeout(()=>{ ${pair(`{type:'arrow', fire:false, twin:true}`, '1:0', {def:'spitting-cobra', t:'2:1'})} }, 760)`, '.fxh-arrow.plain'],
  ['Volley', `${pair(`{type:'arrow', fire:false, volley:true}`, '1:-1', {t:'2:-1'})}; setTimeout(()=>{ ${pair(`{type:'arrow', fire:false, volley:true}`, '1:-1', {t:'2:0'})} }, 760)`, '.fxh-arrow', '.fxa-rainarrow'],
  ['Archer', pair(`{type:'arrow', archer:true}`, '1:-1'), '.fxh-tw'],
  ['a dodged arrow', pair(`{type:'arrow', fire:false}`, '1:-1', {evade:true}), '.fxh-dust', '.fxh-slash'],
  ['Forestry', ev(`{type:'lumber', side:'A', uid:${U('1:0')}, defId:'spitting-cobra', amount:2, cause:'forestry'}`), '.fxh-log'],
  ['Prospecting', ev(`{type:'gold', side:'A', uid:${U('1:0')}, defId:'spitting-cobra', amount:1, why:'prospecting'}`), '.fxh-coin'],
  ['Plunder', ev(`{type:'sk2', kind:'plunder', side:'A', uid:${U('1:0')}, defId:'spitting-cobra', targetSide:'B', amount:2}`), '.fxh-coin'],
  ['Masonry', `(()=>{ getCardDefs()['spitting-cobra'].effects.masonry = 1; ${ev(`{type:'stone', side:'A', uid:${U('1:0')}, defId:'spitting-cobra', amount:1}`)}; delete getCardDefs()['spitting-cobra'].effects.masonry; })()`, '.fxh-anvil'],
  ['Refining', `(()=>{ getCardDefs()['fire-salamander'].effects.refining = 1; ${ev(`{type:'metal', side:'A', uid:${U('1:1')}, defId:'fire-salamander', amount:1}`)}; delete getCardDefs()['fire-salamander'].effects.refining; })()`, '.fxh-nug'],
  ['Pearls', ev(`{type:'pearl', side:'A', uid:${U('1:0')}, defId:'spitting-cobra', amount:1}`), '.fxh-pearl'],
  ['Quarrying', ev(`{type:'stone', side:'A', uid:${U('1:0')}, defId:'spitting-cobra', amount:1, cause:'quarrying'}`), '.fxh-nug'],
  ['Barter paying', `(async()=>{ getCardDefs()['spitting-cobra'].effects.barter = true; renderMatchUI(); await new Promise(r=> setTimeout(r, 200)); matchState.players[1].gold -= 2; renderMatchUI(); setTimeout(()=>{ delete getCardDefs()['spitting-cobra'].effects.barter; }, 400); })()`, '.fxh-coin'],
  ['Pearls paying', `(async()=>{ await new Promise(r=> setTimeout(r, 1700)); matchState.players[1].pearls = 1; renderMatchUI(); })()`, '.fxh-pearl'],
];
(async()=>{
  if(!fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  no index.html: build first'); process.exit(1); }
  const http = require('http');
  const srv = await new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p); if(!f.startsWith(ROOT)){ r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); });
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined});
  const pg = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  pg.on('pageerror', e=> errs.push(String(e))); pg.on('console', m=>{ if(m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errs.push('console: ' + m.text()); });
  await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, r=> r.abort()); // offline: no Supabase or font calls
  await pg.addInitScript(SKIP);
  await pg.goto('http://127.0.0.1:' + srv.address().port + '/index.html', {waitUntil: 'domcontentloaded', timeout: 180000});
  await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1300);
  await pg.evaluate('(()=>{ ' + OWN + ' })()'); await pg.evaluate(BOARD);
  await pg.evaluate(()=>{ window.__fxDebug = true; const w = console.warn; console.warn = (...a)=>{ if(/^FX\.H/.test(String(a[0]))) console.error(...a); else w(...a); }; }); // an FX.H handler that throws fails the run
  ok(await pg.evaluate(fns=> !!(window.FX && FX.H) && fns.every(f=> typeof FX.H[f] === 'function'), FNS), 'the built page has the FX14 looks');
  ok(await pg.evaluate(cs=> cs.every(k=> typeof SoundKit[k] === 'function'), CUES), 'the FX14 cues are SoundKit methods');
  ok(await pg.evaluate(()=> FX.H.arrowVariant({fire:true}, {}) === 'fire' && FX.H.arrowVariant({ice:true}, {}) === 'ice' && FX.H.arrowVariant({}, {arrowBleed:true}) === 'bleed' && FX.H.arrowVariant({}, {arrowPoison:true}) === 'venom' && FX.H.arrowVariant({}, {arrow:1}) === 'plain'), 'arrowVariant reads the event, then the card\'s tip');
  ok(await pg.evaluate(()=> arrowFlightMs() === 380), 'arrowFlightMs is 380 at 1x');
  for(const [name, js, sel, not] of RUNS){
    const e0 = errs.length;
    const r = await pg.evaluate(async ([js, sel, not])=>{ let max = 0, bad = 0; const iv = setInterval(()=>{ max = Math.max(max, document.querySelectorAll(sel).length); if(not) bad = Math.max(bad, document.querySelectorAll(not).length); }, 20);
      (0, eval)(js); await new Promise(r=> setTimeout(r, 2600)); clearInterval(iv); return {max, bad}; }, [js, sel, not || null]);
    const left = await pg.evaluate(()=> document.querySelectorAll('.fxh:not(.fxh-atmos)').length);
    ok(r.max > 0, `${name}: it draws (${sel})`); if(not) ok(r.bad === 0, `${name}: no ${not}`);
    ok(left === 0, `${name}: nothing left behind (${left})`); ok(errs.length === e0, `${name}: no console error ${errs.slice(e0, e0 + 2).join(' | ')}`);
  }
  // the bolt's flight is short: the shot is still in the mouth until ~0.26 s before the hit, then flies ~0.33 s
  const fl = await pg.evaluate(async u=>{ const a = boardCardEl(u.a), t = boardCardEl(u.t); const t0 = performance.now(); FX.H.boltShot(a, t, {element:'fire', total:1080});
    let moved = null; const r0 = await new Promise(res=>{ const tick = ()=>{ const e = document.querySelector('.fxh-pj.fire'); if(e){ const y = e.getBoundingClientRect().top; if(moved == null) moved = {y, t:0}; else if(Math.abs(y - moved.y) > 12 && !moved.t){ moved.t = performance.now() - t0; } }
      if(performance.now() - t0 > 1600) res(moved); else requestAnimationFrame(tick); }; tick(); }); await new Promise(r=> setTimeout(r, 400)); return r0; }, {a: await pg.evaluate(()=> window.__u['1:0']), t: await pg.evaluate(()=> window.__u['2:0'])});
  ok(fl && fl.t > 600 && fl.t < 900, 'a bolt leaves the mouth ~0.33 s before its hit (left at ' + (fl && Math.round(fl.t)) + ' ms of 1080)');
  // reduced motion / Effects None keep the old looks
  await pg.emulateMedia({reducedMotion: 'reduce'});
  ok(await pg.evaluate(()=> FX.H.arrowShot(boardCardEl(window.__u['1:-1']), boardCardEl(window.__u['2:0']), {}) === false), 'reduced motion: arrowShot steps aside (the game keeps bowShot)');
  await pg.emulateMedia({reducedMotion: 'no-preference'});
  const none = await pg.evaluate(async js=>{ localStorage.setItem('bramblewood_fx_level', 'none'); try{ if(typeof fxLevelCache !== 'undefined') fxLevelCache = null; }catch(e){} let max = 0; const iv = setInterval(()=>{ max = Math.max(max, document.querySelectorAll('.fxh-pj').length); }, 20);
    (0, eval)(js); await new Promise(r=> setTimeout(r, 1500)); clearInterval(iv); localStorage.setItem('bramblewood_fx_level', 'high'); return {max, level: typeof fxLevel === 'function' ? fxLevel() : '?'}; }, RUNS[0][1]);
  ok(none.max === 0 || none.level !== 'none', 'Effects None: no bolt drawn (' + JSON.stringify(none) + ')');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close(); srv.close();
  console.log(fail ? 'FAILED ' + fail + ' of ' + n : 'fx14: ' + n + ' checks passed'); process.exit(fail ? 1 : 0);
})().catch(e=>{ console.log('  x crashed', e && e.message); process.exit(1); });
