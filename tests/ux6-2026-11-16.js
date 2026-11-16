#!/usr/bin/env node
// 2026-11-16 (package UX6, owner 20:18: "The pitched toast in-game shouldn't be on the battlefield but below, maybe on the HP bar boundary ... Use these toasts for
// everything else battlefield related ... [the bottom slide-up toast is] for meta, out-of-game notices"): the battle-notice lane.
// Static: battleNotice / battleToast exist, the pitch callout and the in-match toasts go through them, the old banner CSS is gone.
// Browser (390x844 and 1366x768, dark): the lane sits on your Bramble's HP ribbon, poking past both its edges, under every unit and the fight's buttons and above the hand;
// pitch, night falling and a warning land in it; a same-key notice replaces the one showing, a different one waits its turn; a meta toast still uses #toastHost;
// the lane is gone when the fight ends. UX6_SHOTS=<name> saves docs/screens/ux6/<name>-<kind>-<width>.png.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SHOTS = process.env.UX6_SHOTS || '';
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
if(!SHOTS || SHOTS === 'after'){
  ok(/function battleNotice\(html, opts\)/.test(src) && /function battleToast\(text, kind, key\)/.test(src) && /setAttribute\('aria-live', 'polite'\)/.test(src), 'the lane: battleNotice, battleToast, role=status aria-live=polite');
  ok(/function pitchCallout\(gains, def\)[^]*?battleNotice\([^]*?\{key:'pitch'/.test(src) && !/className = 'pitch-callout'/.test(src), 'the pitch callout is a lane notice');
  ok(!/\.pitch-callout/.test(tpl) && /\.battlefield > \.bn-host\{/.test(tpl), 'the old pitch banner CSS is gone, the lane has its own');
  for(const f of ['night-falls', 'day-breaks', 'your-leader-is-caged-on-the', 'eq-hz-no', 'ui.coop2-unsupported', 'the-mountain-settles-and-comets-will'])
    ok(new RegExp(`battleToast\\([^\\n]*${f.replace(/\./g, '\\.')}`).test(src) && !new RegExp(`showToast\\([^\\n]*${f.replace(/\./g, '\\.')}`).test(src), `${f}: goes to the lane`);
  ok(/try\{ battleNoticeClear\(\); \}catch\(e\)\{\}/.test(src), 'endMatch clears the lane');
  ok(/^## 2026-11-16 \(package UX6/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');
}
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html'), OUT = path.join(ROOT, 'docs', 'screens', 'ux6');
  if(SHOTS) fs.mkdirSync(OUT, {recursive:true});
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
  const SETUP = `(()=>{ const m = matchState, E = m.engine, defs = getCardDefs();
    const ids = Object.keys(defs).filter(id=> !defs[id].token && !defs[id].hidden && (defs[id].attack||0) >= 2 && (defs[id].health||0) >= 4 && defs[id].art && !defs[id].cardType && !defs[id].leader).slice(0, 40);
    let k = 0; [1, 2].forEach(pid=>{ const P = m.players[pid]; E.allBoardCards(P).slice().forEach(c=>{ c.hp = 0; }); E.removeDeadCards(m.players, m.sideOf, {}, m.stats, []);
      [0, -1, 1, -2, 2].forEach(sl=>{ E.debugSpawnCard(m.players, m.sideOf, pid, ids[k++ % ids.length], sl, m.stats, []); });
      if(P.reserve) [1, 2].forEach(r=> [0, -1, 1].forEach(sl=>{ if(!P.reserve[r-1][sl]) E.fillReserve(P, r, sl, ids[k++ % ids.length]); })); });
    E.setField(null); try{ renderPlay(); }catch(e){} try{ renderBoard(); }catch(e){}
    window.matchPhaseMatters = ()=> true; return E.allBoardCards(m.players[1]).length; })()`;
  const LANE = `(()=>{ const R = e=> e && e.getBoundingClientRect(), p = document.querySelector('#battlefieldEl > .bn-host .bn-pill'); if(!p) return null; const r = R(p), bf = R(document.getElementById('battlefieldEl')), rib = R(document.querySelector('.battlefield > .bf-hp-mine'));
    const hit = (a, b)=> a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const units = [...document.querySelectorAll('.board-card')].map(R).filter(x=> x.width), btns = [...document.querySelectorAll('.top-row-controls .btn, .hud button, .hud .hud-pill, #skipZone, #dropDiscard')].map(R).filter(x=> x && x.width);
    const hand = R(document.getElementById('handStrip')), host = document.getElementById('battleNoticeHost');
    return {text: p.textContent, cls: p.className, top: r.top, bottom: r.bottom, cx: r.left + r.width/2, bfCx: bf.left + bf.width/2, inBf: r.left >= bf.left && r.right <= bf.right, ribTop: rib.top, ribBottom: rib.bottom,
      units: units.filter(u=> hit(r, u)).length, btns: btns.filter(u=> hit(r, u)).length, handTop: hand ? hand.top : null, bfBottom: bf.bottom, status: host && host.getAttribute('role'), live: host && host.getAttribute('aria-live'), count: document.querySelectorAll('.bn-pill').length}; })()`;
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    for(const [w, h, mobile] of [[390, 844, true], [1366, 768, false]]){
      const ctx = await b.newContext({viewport:{width:w, height:h}, isMobile:mobile, hasTouch:mobile, deviceScaleFactor: 1, colorScheme: 'dark'}); const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:120000}); await pg.waitForTimeout(2500);
      await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1");
      await pg.evaluate("(()=>{ playSubTab='arena'; switchTab('play'); startMatch('ai'); return 1; })()");
      await pg.waitForTimeout(1500); await pg.evaluate("document.querySelectorAll('.vs-screen').forEach(e=> e.click()); 1"); await pg.waitForTimeout(1500);
      const units = await pg.evaluate(SETUP); await pg.waitForTimeout(900);
      await pg.addStyleTag({content: '[class^="coach-"], .coach-tip, .coach-pointer, .coach-spotlight, .coach-shield{display:none !important;}'});
      const shot = async name=>{ if(SHOTS) await pg.screenshot({path: path.join(OUT, `${SHOTS}-${name}-${w}.png`)}); };
      ok(units >= 3, `${w}: units on the board (${units})`);
      // pitch
      await pg.evaluate("pitchCallout([{amount:2, glyph:'🪵', pillId:(Object.values(PITCH_RESOURCE_META)[0] || {}).pillId}], {name:'Forest Sprite'}); 1"); await pg.waitForTimeout(450);
      let l = await pg.evaluate(LANE); await shot('pitch');
      ok(l && /Forest Sprite pitched/.test(l.text) && /\+2/.test(l.text), `${w}: the pitch lands in the lane (${l && l.text})`);
      ok(l && l.status === 'status' && l.live === 'polite', `${w}: the lane is role=status, aria-live=polite`);
      ok(l && Math.abs(l.cx - l.bfCx) < 2 && l.inBf, `${w}: centred on the battlefield and inside it`);
      ok(l && l.top < l.ribBottom && l.bottom > l.ribTop && l.bottom <= l.bfBottom + 8, `${w}: sits on the HP ribbon at the board's foot (pill ${Math.round(l.top)}-${Math.round(l.bottom)}, ribbon top ${Math.round(l.ribTop)})`);
      ok(l && l.units === 0, `${w}: covers no unit (${l && l.units})`);
      ok(l && l.btns === 0, `${w}: covers no HUD button, Pass or Graveyard (${l && l.btns})`);
      ok(l && (l.handTop == null || l.bottom <= l.handTop), `${w}: sits above the hand (${l && Math.round(l.bottom)} <= ${l && Math.round(l.handTop)})`);
      ok(await pg.evaluate("!document.querySelector('.pitch-callout') && !document.querySelector('#toastHost .toast')"), `${w}: no banner over the board and no bottom toast for the pitch`);
      // a same-key notice replaces the one showing; a different one waits
      await pg.evaluate("pitchCallout([{amount:3, glyph:'🪵', pillId:(Object.values(PITCH_RESOURCE_META)[0] || {}).pillId}], {name:'Second'}); 1"); await pg.waitForTimeout(300);
      l = await pg.evaluate(LANE);
      ok(l && l.count === 1 && /Second pitched/.test(l.text) && /\+3/.test(l.text), `${w}: a second pitch replaces the first (${l && l.count} pill: ${l && l.text})`);
      await pg.waitForTimeout(1500);
      // night falling, then a warning (queued behind it), then a second warning (replaces the first one waiting)
      await pg.evaluate("renderVfxForEvent({type:'phase', phase:'night'}); battleToast('Not enough Lumber to play that.', 'warn'); battleToast('Wait: your leader is caged.', 'warn'); 1"); await pg.waitForTimeout(400);
      l = await pg.evaluate(LANE); await shot('nightfall');
      ok(l && /Night falls/i.test(l.text) && l.count === 1, `${w}: night falling lands in the lane (${l && l.text})`);
      ok(l && l.units === 0 && l.btns === 0, `${w}: the night notice covers nothing (${l && l.units}/${l && l.btns})`);
      const qd = await pg.evaluate("BN.q.map(x=> x.key + ':' + x.html).join(' | ') + ' cur=' + (BN.cur && BN.cur.key)"); ok(/^warn:[^|]*caged[^|]*$/.test(qd.split(" cur=")[0]), `${w}: the warning waits, and the newer warning replaced the older (${qd})`);
      await pg.waitForTimeout(1900);
      l = await pg.evaluate(LANE); await shot('warning');
      ok(l && /caged/.test(l.text) && /bn-warn/.test(l.cls) && l.count === 1, `${w}: the warning follows (${l && l.text})`);
      ok(l && l.units === 0 && l.btns === 0, `${w}: the warning covers nothing (${l && l.units}/${l && l.btns})`);
      // a meta notice during a fight still uses the bottom toast
      await pg.evaluate("showToast('Saved to the cloud.', 'ok'); 1"); await pg.waitForTimeout(200);
      ok(await pg.evaluate("[...document.querySelectorAll('#toastHost .toast')].some(t=> /Saved to the cloud/.test(t.textContent)) && !/Saved to the cloud/.test(document.getElementById('battleNoticeHost').textContent)"), `${w}: a meta toast keeps #toastHost`);
      // it empties by itself, and a fight's end clears it
      await pg.waitForTimeout(2600);
      ok(await pg.evaluate("!document.querySelector('.bn-pill') && BN.q.length === 0"), `${w}: the lane empties after its notices`);
      await pg.evaluate("battleToast('Leaving soon', 'warn'); 1"); await pg.waitForTimeout(200);
      await pg.evaluate("endMatch(); 1"); await pg.waitForTimeout(600);
      ok(await pg.evaluate("!document.querySelector('.bn-host') && !document.querySelector('.bn-pill') && BN.q.length === 0 && BN.cur === null"), `${w}: leaving the fight clears the lane`);
      await pg.evaluate("battleToast('After the fight', 'warn'); 1"); await pg.waitForTimeout(200);
      ok(await pg.evaluate("[...document.querySelectorAll('#toastHost .toast')].some(t=> /After the fight/.test(t.textContent))"), `${w}: outside a fight the same call falls back to the bottom toast`);
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(!errs.length, `no page errors (${errs.slice(0, 3).join(' | ')})`);
}
browser().catch(e=>{ fail++; console.log('  x browser part threw:', e && e.message); }).then(()=>{
  console.log(fail ? `ux6-2026-11-16: ${fail} FAILED of ${n}` : `ux6-2026-11-16: all ${n} passed`);
  process.exit(fail ? 1 : 0);
});
