#!/usr/bin/env node
// 2026-10-23 (package PR, owner: "Something is wrong with the card drop rate. I played 0-1 5 times and got a card reward 5 times."; earlier,
// on his newer account: "I'm stuck in Map 0 in my new account"):
//   1. static: Map 0's sure card (factionReward / the base track) is paid on a first clear only; a repeat win rolls the fight's card drop;
//   2. browser, a fresh save past both tutorials wins 0-1 five times: the win is recorded (one first clear, then repeats), the first pays
//      one card, the repeats pay none while the drop roll misses (Math.random held high) and the drop (rollCardDrop) still pays when it hits;
//   3. browser, the same with a cloud row like the owner's newer account ({"completed":["mtut:tutorial"]}, a day old) behind a mocked
//      Supabase client: the sign-in pull replaces the device's progress once (the account's own copy), the wins are pushed, and a second
//      pull (a reload) never undoes them; a Map 0 cleared and pushed opens Map 1 after the pull.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

// --- 1. static
{ const a = src.indexOf("else if(mapNo === 0){"), blk = src.slice(a, a + 900);
  ok(a > 0 && /if\(isFirstClear && !\(m\.conquestCardsEarned\|\|\[\]\)\.length\)\{ let id = factionReward\(\);/.test(blk), '1. the sure Map 0 card needs a first clear');
  const scope = src.slice(src.lastIndexOf("const isFirstClear = dunNode", a), a);
  ok(scope.length > 0 && scope.length < 20000, '1. isFirstClear is the win\'s own (read before completeConquestNode)'); }
ok(/^## 2026-10-23 \(package PR/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

// ---- browser
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
    + "localStorage.setItem('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mtut:tutorial','mtut:tutorial2'], raidUnlocked:[], ranks:{}}));";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  const open = async ()=>{ const ctx = await b.newContext({viewport:{width:1366, height:900}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort()); // nothing leaves the page
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(INIT);
    await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
    // 2026-10-24 (package PRFIX): TT's Triggers lesson (CHANGELOG "package TT": "play pauses on a spotlight over its trigger chip") pauses the
    // fight (waitForBlockingCoach) the first time a trigger card is in hand or on the board, and nobody here presses Next, so a win whose
    // deck drew one never reached its rewards (the drop paid nothing; 0-2..0-4 never recorded, Map 1 stayed shut). Seen, as for a player who had it.
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); skipTriggerLesson(); window.deckSizeOkOrWarn = ()=> true; 1"); return [ctx, pg]; };
  // one real win of a fight (the last blow through resolveRound), the results dismissed; rnd: Math.random held there while the rewards are paid
  const win = async (pg, mapId, key, rnd)=>{
    ok(await pg.evaluate(`startConquestMatch('${mapId}', '${key}', {skipEnergyCost:true, noAmbush:true})`), `${mapId}:${key} starts`);
    for(let i = 0; i < 30; i++){ const st = await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return !!(matchState && matchState.mode === 'conquest' && document.getElementById('rowMine')); })()"); if(st) break; await pg.waitForTimeout(300); }
    await pg.waitForTimeout(800);
    // Math.random stays held until the win's rewards are paid (they are paid after the last blow's animation, not inside resolveRound)
    await pg.evaluate(`window.__pr = matchState; window.__prRnd = Math.random; ${rnd != null ? `Math.random = ()=> ${rnd};` : ''} try{ matchState.players[2].hq.shield = 0; matchState.players[2].hq.hp = 0; resolveRound(); }catch(e){ Math.random = window.__prRnd; throw e; } 1`);
    try{ for(let i = 0; i < 80; i++){ if(await pg.evaluate("!!(window.__pr.rewardRecorded)")) break; await pg.waitForTimeout(250); } }
    finally{ await pg.evaluate("Math.random = window.__prRnd; 1"); }
    const r = await pg.evaluate("({first: !!(__pr.conquestRewardEarned || {}).isFirstClear, cards: __pr.conquestCardsEarned || [], drop: __pr.conquestCardDrop || null, done: loadConquestProgress().completed})");
    for(let i = 0; i < 60; i++){ const st = await pg.evaluate("(()=>{ const rr = document.querySelector('.rr-stage'); if(rr){ rr.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); return ''; } const q = document.getElementById('wlQuitBtn'); return q && !q.disabled ? 'ok' : ''; })()"); if(st) break; await pg.waitForTimeout(250); }
    await pg.click('#wlQuitBtn').catch(()=>{}); await pg.waitForTimeout(500);
    return r; };
  // 0-1 five times: rnd for the repeats (0.999: every roll misses, so no drop)
  const fiveTimes = async (pg, label)=>{
    const rs = []; for(let k = 0; k < 5; k++) rs.push(await win(pg, 'm1', '0-1', k ? 0.999 : null));
    ok(rs[0].first && rs.slice(1).every(r=> !r.first), `${label}: the first win is the first clear, the next four are repeats (${rs.map(r=> r.first ? 'F' : 'r').join('')})`);
    ok(rs.every(r=> r.done.includes('m1:0-1')), `${label}: 0-1 is recorded as won`);
    ok(rs[0].cards.length === 1, `${label}: the first clear pays its one card (${JSON.stringify(rs[0].cards)})`);
    ok(rs.slice(1).every(r=> !r.cards.length && !r.drop), `${label}: the repeats pay no card when the drop roll misses (${JSON.stringify(rs.slice(1).map(r=> r.cards))})`);
    return rs; };
  // a mocked Supabase client: one player_progress row; upsert writes it back (updated_at as sent)
  const MOCK = `(()=>{ window.__row = {data: {bramblewood_conquest_progress_v1: JSON.stringify({completed:['mtut:tutorial'], raidUnlocked:[], ranks:{}})}, updated_at: '2026-10-22T15:18:13.220Z'}; window.__pushes = 0;
    const q = {select(){ return q; }, eq(){ return q; }, maybeSingle: async ()=> ({data: JSON.parse(JSON.stringify(window.__row)), error: null}),
      upsert(row){ window.__pushes++; window.__row = {data: row.data, updated_at: row.updated_at}; return Promise.resolve({error: null}); }};
    // every other table: any chain of calls, awaited, gives no rows
    const any = new Proxy(function(){}, {get: (t, k)=> k === 'then' ? (res, rej)=> Promise.resolve({data: [], error: null}).then(res, rej) : (k === 'maybeSingle' || k === 'single') ? async ()=> ({data: null, error: null}) : ()=> any, apply: ()=> any});
    sbClient = {from: t=> t === 'player_progress' ? q : any, rpc: ()=> any, channel: ()=> any, removeChannel(){}, auth: any};
    cloudUserId = 'e9a8-test'; cloudIsAnonymous = false; LiveData.available = null; LiveData.progressPushedHash = null; return 1; })()`;
  try{
    // ===== 2. no cloud
    { const [ctx, pg] = await open();
      await fiveTimes(pg, 'B local');
      const hit = await win(pg, 'm1', '0-1', 0.0001); // every roll hits: the drop still pays on a repeat
      ok(!hit.first && hit.cards.length === 1 && hit.drop === hit.cards[0], `B local: a repeat win whose drop roll hits pays the drop (${JSON.stringify(hit.cards)})`);
      ok(await pg.evaluate("Math.abs(nodeCardDropChance('m1', CONQUEST_MAPS.find(m=> m.id === 'm1').nodes.find(n=> n.key === '0-1'), {repeat:true}) - 0.109) < 1e-9"), 'B local: 0-1 repeat drop chance is 10.9% (what the panel adds up; BAL2 DF-2: its own card 10%, else the 1% pack card)');
      await ctx.close(); }
    // ===== 3. a stale cloud row like the owner's newer account
    { const [ctx, pg] = await open();
      // 2026-10-31 (package UI12, GG2): pushes wait until the account's cloud save has been read; applySessionIdentityInner marks that after its pull
      await pg.evaluate(MOCK); await pg.evaluate("livePullProgress().then(ok=>{ if(ok) cloudSyncSettledUid = cloudUserId; })"); await pg.waitForTimeout(300);
      const pulled = await pg.evaluate("loadConquestProgress().completed"); // (Tutorial II's flag is on the device, so healTutorial2Flag puts mtut:tutorial2 back)
      ok(pulled.includes('mtut:tutorial') && !pulled.some(id=> /^m1:/.test(id)), 'B cloud: the sign-in pull takes the account\'s copy (the row is newer than anything this device pushed): ' + JSON.stringify(pulled));
      await fiveTimes(pg, 'B cloud');
      await pg.evaluate("livePushProgress(false)"); await pg.waitForTimeout(200);
      ok(await pg.evaluate("window.__pushes > 0 && JSON.parse(window.__row.data.bramblewood_conquest_progress_v1).completed.includes('m1:0-1')"), 'B cloud: the wins reach the cloud row');
      await pg.evaluate("livePullProgress()"); await pg.waitForTimeout(300);
      ok(await pg.evaluate("loadConquestProgress().completed.includes('m1:0-1')"), 'B cloud: a second pull (a reload) keeps the wins');
      // the push failed (a dead network): the row stays a day old, and a reload's pull still keeps the device's wins
      await pg.evaluate("window.__row = {data: {bramblewood_conquest_progress_v1: JSON.stringify({completed:['mtut:tutorial'], raidUnlocked:[], ranks:{}})}, updated_at: '2026-10-22T15:18:13.220Z'}; 1");
      await pg.evaluate("livePullProgress()"); await pg.waitForTimeout(300);
      ok(await pg.evaluate("loadConquestProgress().completed.includes('m1:0-1')"), 'B cloud: an older row never undoes the device\'s newer wins');
      for(const k of ['0-2', '0-3', '0-4']) await win(pg, 'm1', k, null);
      await pg.evaluate("livePushProgress(false)"); await pg.waitForTimeout(200); await pg.evaluate("livePullProgress()"); await pg.waitForTimeout(300);
      ok(await pg.evaluate("isMapUnlocked(CONQUEST_MAPS.find(m=> m.id === 'mf'), loadConquestProgress()) && (healMapProgress() || {}).id === 'mf'"), 'B cloud: Map 0 cleared, pushed and pulled: Map 1 is open and the furthest map');
      await ctx.close(); }
  }finally{ await b.close(); }
  ok(!errs.length, 'B. no page errors: ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(`pr-2026-10-23: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part crashed:', e && e.message); process.exit(1); });
