#!/usr/bin/env node
// 2026-11-19 (package CONSOLE1, owner 08:21 "We want this shippable"): a short headless pass over the Release 1.0 screens that fails on any page
// error, unhandled rejection or console error. Offline network noise is excluded: every non-file request is aborted, so "Failed to load resource"
// and the cloud calls' own logs (Supabase, auth) are expected here. Static checks always run; the browser part needs index.html and Chromium (build first).
// Screens: Home, Map 0 and Map 5 fights, the Sunken Depths, The Deep Dark (seeded open) and a fight there, the raid page and a raid fight, Murgle
// Mayhem, the group dungeon solo, a PvP ghost match, Codex, Camp (deck), Forge, Shop, Profile; 1366 and 390 px, dark mode at 390.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
ok(/console1-2026-11-19/.test(fs.readFileSync(path.join(ROOT, 'tests/run-all.sh'), 'utf8')), 'run-all.sh lists this test');
ok(/package CONSOLE1/.test(fs.readFileSync(path.join(ROOT, 'docs/CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');
ok(/while\(host\.children\.length >= 4\) host\.firstElementChild\.remove\(\);/.test(fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8')), 'toasts: at most 4 on screen (a burst of level rewards covered the screen)');

// offline noise: a request the sandbox aborts, and the cloud layer saying so
const NOISE = [/Failed to load resource/i, /net::ERR_(FAILED|INTERNET_DISCONNECTED|NAME_NOT_RESOLVED|BLOCKED)/i, /supabase|realtime|websocket|\bauth\b|auth\/v1|AuthApiError|AuthRetryableFetchError/i, /Failed to fetch|NetworkError|Load failed/i];
const noise = s=> NOISE.some(r=> r.test(s));

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(_){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); if(!localStorage.getItem('bramblewood_arena_faction')) localStorage.setItem('bramblewood_arena_faction','otters');";
  const b = await pw.chromium.launch({executablePath: EXE});
  try{
    for(const [w, dark] of [[1366, false], [390, true]]){
      const t = `@${w}${dark ? ' dark' : ''}`, errs = []; let step = 'load';
      const ctx = await b.newContext({viewport: {width: w, height: w > 600 ? 860 : 844}, colorScheme: dark ? 'dark' : 'light'});
      await ctx.route('**/*', r=>{ const u = r.request().url(); return /^(file|data|blob):/.test(u) ? r.continue() : r.abort(); });
      const pg = await ctx.newPage();
      pg.on('pageerror', e=> errs.push(`[${step}] page error: ` + String(e && e.message || e).slice(0, 300)));
      pg.on('console', m=>{ if(m.type() === 'error' && !noise(m.text())) errs.push(`[${step}] console: ` + m.text().slice(0, 300)); });
      pg.on('dialog', d=> d.dismiss().catch(()=>{}));
      await pg.addInitScript("window.__c1rej = []; window.addEventListener('unhandledrejection', e=>{ const r = e.reason; window.__c1rej.push(String(r && (r.stack || r.message) || r).slice(0, 300)); });");
      await pg.addInitScript(INIT);
      await pg.goto(URL, {waitUntil: 'domcontentloaded', timeout: 180000}); await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1500);
      // a save that has cleared every map (opens The Deep Dark, the raid and Murgle Mayhem); then reload so the page starts from it
      await pg.evaluate("(()=>{ const p = loadConquestProgress(); CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} return 1; })()");
      await pg.reload({waitUntil: 'domcontentloaded'}); await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1500);
      // the seeded player owns the copies their deck asks for (a real one gets them from the tutorial's starter packs)
      ok(await pg.evaluate("(()=>{ Object.entries(myDeckCounts||{}).forEach(([id, c])=>{ for(let i = ownedCount(id); i < c; i++) grantCardCopy(id); }); const t = window.showToast; window.showToast = ()=>{}; const r = deckSizeOkOrWarn(); window.showToast = t; return r; })()"), `${t} the seeded deck is playable`);
      await pg.evaluate("(()=>{ window.playDialogue = async ()=>({}); try{ const s = settleEnergy(); s.current = 200; saveEnergyState(s); }catch(e){} return 1; })()");
      // reward packs (the seeded levels pay some) open over whatever is on screen: open them all and close, as a player would
      const packs = async ()=>{ for(let i = 0; i < 20; i++){ const c = await pg.evaluate("(()=>{ const o = document.getElementById('packOpenOverlay'); if(!o || o.hidden) return 0; const b = o.querySelector('#poOpenAll, #poSkip, #poDone'); if(b) b.click(); return 1; })()"); if(!c) return; await pg.waitForTimeout(700); } errs.push(`[${step}] the pack opener did not close`); };
      const go = async (name, js, ms)=>{ step = name; await packs(); try{ const v = await Promise.race([pg.evaluate(js), new Promise((_, rj)=> setTimeout(()=> rj(new Error('timed out')), 15000))]); await pg.waitForTimeout(ms || 1200); return v; }catch(e){ errs.push(`[${name}] ` + String(e).slice(0, 200)); return null; } };
      const skip = "try{ BramblewoodPlaces.skip(); }catch(e){}";
      // a fight: start it, let Auto-play run a few rounds, win it (Admin auto-win, counted as a real win) and leave by the win screen's Quit
      const fight = async (name, startJs)=>{ await go(name, startJs, 1800); const started = await go(name, "(()=>{ document.querySelectorAll('.vs-screen').forEach(v=> v.click()); if(matchState){ matchState.autoplay = true; matchState.speedMult = 4; } return !!matchState; })()", 5000);
        ok(started, `${t} ${name}: the fight starts`); if(!started) return;
        // adminAutoWin waits out a resolving round by retrying itself, which needs Admin Mode still on: so poll, and only call it between rounds
        for(let i = 0; i < 50; i++){ const s = await go(name, "(()=>{ try{ if(typeof coachOpen !== 'undefined' && coachOpen) hideCoachTip(); }catch(e){} if(document.getElementById('wlQuitBtn') || !matchState) return 'done'; if(matchState.over || matchState.resolving || matchState.resultDecided) return 'wait'; matchState.autoplay = false; const a = adminModeEnabled; adminModeEnabled = true; adminAutoWin(); adminModeEnabled = a; return 'won'; })()", 500); if(s === 'done' || s == null) break; }
        await packs(); await pg.waitForTimeout(600);
        const had = await go(name, "(()=>{ const q = document.getElementById('wlQuitBtn'); if(q) q.click(); return JSON.stringify({quit: !!q, over: !!(matchState && matchState.over), hp: matchState && matchState.players[2].hq.hp}); })()", 1500);
        const left = await go(name, "!matchState", 300);
        ok(/"quit":true/.test(had || '') && left, `${t} ${name}: won, and the win screen's Quit leaves the fight (${had}, left: ${left})`);
        await go(name, "(()=>{ if(matchState) endMatch(); switchTab('home'); return 1; })()", 600); };
      await go('home', `(()=>{ switchTab('home'); ${skip} return 1; })()`);
      ok(await go('toast cap', "(()=>{ for(let i = 0; i < 10; i++) showToast('console1 ' + i, 'ok'); const h = document.getElementById('toastHost'); return h.children.length <= 4 && /console1 9/.test(h.lastElementChild.textContent); })()", 200), `${t} ten toasts at once leave the newest 4 on screen`);
      const conq = k=> `(()=>{ const m = CONQUEST_MAPS.find(m=> mapNumberOf(m.id)===${k} && !m.sub); conquestSelectedMap = m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id, m.nodes.find(n=> n.kind==='skirmish').key, {skipEnergyCost:true}); return 1; })()`;
      await fight('Map 0 fight', conq(0));
      await fight('Map 5 fight', conq(5));
      await go('Sunken Depths', `(()=>{ conquestSelectedMap = 'mj'; playSubTab='conquest'; switchTab('play'); ${skip} return 1; })()`, 1500);
      await go('The Deep Dark', `(()=>{ conquestSelectedMap = 'mjd'; playSubTab='conquest'; switchTab('play'); ${skip} return 1; })()`, 1500);
      const dd = await go('The Deep Dark', "(()=> isMapUnlocked(CONQUEST_MAPS.find(m=> m.id==='mjd'), loadConquestProgress()))()", 100);
      ok(dd === true, `${t} The Deep Dark opens on the seeded save (${dd}; ${errs.filter(e=> /Deep Dark/.test(e)).join(' | ')})`);
      await fight('Deep Dark fight', "(()=>{ const m = CONQUEST_MAPS.find(m=> m.id==='mjd'); startConquestMatch(m.id, m.nodes[0].key, {skipEnergyCost:true}); return 1; })()");
      await go('raid page', `(()=>{ playSubTab='raid'; switchTab('play'); ${skip} return 1; })()`, 1500);
      await fight('raid fight', "(()=>{ const b = document.querySelector('[data-raid-part]:not(.is-blocked)'); if(b) b.click(); else startOfflineRaidMatch(); return 1; })()");
      await go('Murgle Mayhem', `(()=>{ conquestSelectedMap = 'mm'; playSubTab='conquest'; switchTab('play'); ${skip} return 1; })()`, 1500);
      await fight('Murgle fight', "(()=>{ const m = CONQUEST_MAPS.find(m=> m.id==='mm'); startConquestMatch('mm', m.nodes[0].key); return 1; })()");
      await go('group dungeon (solo)', "(()=>{ gdCreate(true); return 1; })()", 1200);
      await go('group dungeon (solo)', "(()=>{ const s = document.querySelector('#gdOverlay [data-gd-act=\"start\"]'); if(s) s.click(); return !!s; })()", 5000);
      await go('group dungeon (solo)', "(()=>{ if(matchState) endMatch(); gdClose(true); switchTab('home'); return 1; })()", 600);
      await fight('PvP ghost', `(()=>{ playSubTab='arena'; switchTab('play'); ${skip} startMatch('pvp', {standard:false}); return 1; })()`);
      for(const [name, js] of [['Codex', "homeGo('codex')"], ['Camp (deck)', "homeGo('deck')"], ['Forge', "homeGo('forge')"], ['Shop', "homeGo('shop')"], ['Profile', "switchTab('profile')"]]) await go(name, `(()=>{ ${js}; ${skip} return 1; })()`, 1500);
      step = 'end'; (await pg.evaluate("window.__c1rej.splice(0)")).filter(x=> !noise(x)).forEach(x=> errs.push('unhandled rejection: ' + x));
      ok(errs.length === 0, `${t} no console errors (${errs.length}): ` + errs.slice(0, 4).join(' | '));
      await ctx.close();
    }
  } finally { await b.close(); }
}
browser().then(()=>{ console.log(fail ? `console1: ${fail} of ${n} checks FAILED` : `console1: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
