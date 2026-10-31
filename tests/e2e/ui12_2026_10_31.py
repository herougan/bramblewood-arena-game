#!/usr/bin/env python3
"""Package UI12 (2026-10-31, owner GG1-GG6, GG8, GG10): browser checks, shots in tests/e2e/shots/ui12/.
    python3 tests/e2e/ui12_2026_10_31.py [--page index.html] [--width 1366,390] [--only gg4,gg3,...]
GG2/GG4  front screen: Start / Enter the Grove / the name field / Sign in lock while a sign-in or its cloud load is pending (a "loading your
         save" line), unlock on success or failure; Enter the Grove does nothing while locked; the tutorial waits for the cloud load and, when
         the loaded save says the tutorial is done, goes Home instead; the fan's float runs on the compositor (translate, not margin-top) and
         the fan's holo drift is off (idle long tasks are printed).
GG3      after a sign-in from the front screen the game goes straight in (no second Start), with the account's name.
GG10     no PRO / BPRO / REF node on any map (one N-SK each); the N-SK preview shows the drawn enemy deck and the player's deck, each with a
         rank 1-5+ hex; the player's side defaults to a random reference deck of the map's level; Admin can still pick My deck; Fight plays the
         previewed decks.
GG8      every tree of an art map has a tap spot and shakes; the sway layer stays first in the map frame when the frame is redrawn (no bright
         trees over the night tint).
GG1      the "you draw 1 card each turn" step is a 5 s tooltip on the deck: no shield, no spotlight, no button; nothing else shows meanwhile.
GG5      T-2's leader Wait steps don't darken the screen (no spotlight, a clear shield).
GG6      the Lumber "where to find it" step keeps the Lumber pill at 0 Lumber and drops only its arrow; the bubble does not jump.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
import pl2_2026_10_25 as P
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui12'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
def shot(name, w): return os.path.join(SHOTS, f'{name}-{w}.png')
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()

LT = "window.__lt = []; try{ new PerformanceObserver(l=> l.getEntries().forEach(e=> window.__lt.push(Math.round(e.duration)))).observe({type:'longtask'}); }catch(e){}"
async def front(b, url, w, init=''):
    """A first visit: no save, no splash seen; the loader gone, the name form up."""
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(LT + init)
    await pg.goto(url); await pg.wait_for_selector('#loginNameInput', timeout=120000)
    await pg.wait_for_function("!document.getElementById('bwLoader')", timeout=60000); await pg.wait_for_timeout(1500)
    return pg
LOCKED = """(()=>{ const ids = ['loginSubmitBtn', 'loginNameInput', 'entranceSignInBtn']; const w = document.getElementById('ui12AuthWait');
  return {dis: ids.map(id=>{ const e = document.getElementById(id); return e ? e.disabled : null; }), wait: !!w && !w.hidden, txt: w ? w.textContent : ''}; })()"""

# ---------------------------------------------------------------- GG4 (+ GG2's front-screen part)
async def gg4(b, url, w):
    print(f'-- GG4 / GG2: front screen locks while a sign-in loads; the fan is light ({w})')
    pg = await front(b, url, w)
    r = await pg.evaluate(LOCKED); ok(r['dis'] == [False, False, False] and not r['wait'], f'unlocked with no sign-in on its way {r}')
    await pg.evaluate("cloudAuthBusyAdd(1)"); await pg.wait_for_timeout(100)
    r = await pg.evaluate(LOCKED); ok(r['dis'] == [True, True, True] and r['wait'] and 'loading your save' in r['txt'], f'a sign-in on its way locks Enter, the name and Sign in, with a line {r}')
    await pg.screenshot(path=shot('gg4-locked', w))
    await pg.evaluate("(()=>{ const i = document.getElementById('loginNameInput'); i.disabled = false; i.value = 'Tester'; i.disabled = true; document.getElementById('loginForm').dispatchEvent(new Event('submit', {cancelable: true})); })()")
    await pg.wait_for_timeout(400)
    ok(await pg.evaluate("!entranceStarted && !(myProfile && myProfile.name)"), 'Enter the Grove does nothing while locked (no name saved, no tutorial)')
    # an identity load in flight locks too; its end unlocks
    await pg.evaluate("(()=>{ cloudAuthBusyAdd(-1); window.__res = null; cloudIdentityJob = new Promise(r=> window.__res = r); cloudPendingChanged(); })()"); await pg.wait_for_timeout(100)
    ok((await pg.evaluate(LOCKED))['dis'] == [True, True, True], 'the cloud load in flight keeps it locked')
    await pg.evaluate("(()=>{ cloudIdentityJob = null; window.__res(); cloudPendingChanged(); })()"); await pg.wait_for_timeout(400)
    r = await pg.evaluate(LOCKED); ok(r['dis'] == [False, False, False] and not r['wait'], f'unlocked when the load ends (success or failure) {r}')
    # never locked for good: a busy mark older than 30 s lapses
    await pg.evaluate("(()=>{ cloudAuthBusyAdd(1); cloudAuthBusyAt = Date.now() - 31000; ui12RefreshFrontLock(); })()"); await pg.wait_for_timeout(100)
    ok((await pg.evaluate(LOCKED))['dis'] == [False, False, False], 'a sign-in that never answers unlocks after 30 s')
    # GG4 lag: the fan float animates translate (compositor), its holo drift is off
    r = await pg.evaluate("""(()=>{ const an = document.getAnimations(), fl = an.filter(a=> a.animationName === 'efFloat'), hd = an.filter(a=> a.animationName === 'holoDrift' && a.effect && a.effect.target && a.effect.target.closest('#entranceFan'));
      const kf = fl.length ? fl[0].effect.getKeyframes() : []; return {floats: fl.length, props: [...new Set(kf.flatMap(k=> Object.keys(k).filter(x=> !['offset','easing','composite','computedOffset'].includes(x))))], holo: hd.length}; })()""")
    ok(r['holo'] == 0 and 'marginTop' not in r['props'] and (r['floats'] == 0 or 'translate' in r['props']), f'the fan floats on translate, no holo drift on the fan {r}')
    lt = await pg.evaluate("(async()=>{ const n0 = window.__lt.length; await new Promise(r=> setTimeout(r, 4000)); const l = window.__lt.slice(n0); return {n: l.length, ms: l.reduce((a, x)=> a + x, 0)}; })()")
    print(f'   (idle front screen, 4 s: {lt["n"]} long tasks, {lt["ms"]} ms)')
    await done(pg)
    # GG2: a stored-session load: the tutorial waits for the cloud save, and a save that says the tutorial is done goes Home
    pg = await front(b, url, w)
    r = await pg.evaluate("""(async()=>{ ui12ExpectCloud = true; ui12CloudInitDone = false; cloudAuthBusyAdd(1); saveMyProfile({name: 'Waiter'});
      triggerEntranceAnimation(true); await new Promise(r=> setTimeout(r, 1200));
      const during = {faction: !!document.getElementById('factionScreen') && !document.getElementById('factionScreen').hidden, match: !!matchState};
      localStorage.setItem('bramblewood_arena_tutorial_done', '1'); localStorage.setItem('bramblewood_tutorial2_done_v1', '1'); localStorage.setItem('bramblewood_arena_faction', 'otters');
      ui12CloudInitDone = true; cloudAuthBusyAdd(-1); await new Promise(r=> setTimeout(r, 1500));
      return {during, after: {faction: !!document.getElementById('factionScreen') && !document.getElementById('factionScreen').hidden, match: !!matchState, tab: currentTab}}; })()""")
    ok(not r['during']['faction'] and not r['during']['match'], f'no side picker / tutorial while the cloud save loads {r["during"]}')
    ok(not r['after']['faction'] and not r['after']['match'] and r['after']['tab'] == 'home', f'the loaded save (tutorial done) goes Home, not into the tutorial {r["after"]}')
    await done(pg)

# ---------------------------------------------------------------- GG3
async def gg3(b, url, w):
    print(f'-- GG3: straight in after signing in on the front screen ({w})')
    pg = await front(b, url, w)
    await pg.evaluate("""(()=>{ cloudUserId = 'u-test'; cloudIsAnonymous = false; cloudSyncSettledUid = 'u-test'; cloudUserLabel = 'Robin Hood'; cloudUserEmail = 'player@example.test';
      saveMyProfile({name: 'Bramble Owner'}); ui12EnterAfterSignIn(); })()""")
    await pg.wait_for_timeout(3200)
    r = await pg.evaluate("({splash: !document.getElementById('splashScreen') || document.getElementById('splashScreen').hidden, started: entranceStarted, name: myProfile && myProfile.name})")
    ok(r['splash'] and r['started'] and r['name'] == 'Bramble Owner', f'the front screen goes away by itself with the account name {r}')
    await pg.screenshot(path=shot('gg3-in', w))
    await done(pg)
    pg = await front(b, url, w)
    await pg.evaluate("(()=>{ cloudUserId = 'u-new'; cloudIsAnonymous = false; cloudSyncSettledUid = 'u-new'; cloudUserLabel = 'Robin Hood'; cloudUserEmail = 'player@example.test'; ui12EnterAfterSignIn(); })()")
    await pg.wait_for_timeout(3200)
    r = await pg.evaluate("({started: entranceStarted, name: myProfile && myProfile.name})")
    ok(r['started'] and r['name'] == 'Robin', f'a new account with no name goes in under the Google first name {r}')
    await done(pg)

# ---------------------------------------------------------------- GG10
async def gg10(b, url, w):
    print(f'-- GG10: one N-SK per map, ranked decks in the preview ({w})')
    pg = await W.fresh(b, url, w)
    r = await pg.evaluate("""(()=>{ adminModeEnabled = true; const bad = [], codes = [];
      CONQUEST_MAPS.forEach(m=>{ (m.nodes || []).forEach(n=>{ if(/PRO|REF/.test(String(n.key))) bad.push(m.id + ':' + n.key); });
        const h = proMapNodesHTML(m, null) || ''; (h.match(/data-pro-start="([^"]+)"/g) || []).forEach(x=>{ const k = x.slice(16, -1); codes.push(k); if(!/-SK$/.test(k)) bad.push(m.id + ':' + k); }); });
      const per = {}; codes.forEach(k=>{ per[k] = (per[k] || 0) + 1; });
      const adm = proFightsAdminHTML(), admKeys = (adm.match(/data-pro-key="([^"]+)"/g) || []).map(x=> x.slice(14, -1));
      return {bad, codes: codes.length, dup: Object.keys(per).filter(k=> per[k] > 1), admBad: admKeys.filter(k=> !/-SK$/.test(k))}; })()""")
    ok(not r['bad'] and not r['dup'] and r['codes'] > 10 and not r['admBad'], f'no PRO / BPRO / REF node on any map, one N-SK each ({r["codes"]} maps) {r["bad"][:4]} {r["admBad"][:4]}')
    # the preview of Map 2's skirmish (2-SK, map mb)
    await pg.evaluate("adminModeEnabled = true"); await pg.evaluate(V.OPEN, ['mb', '~none']); await pg.wait_for_timeout(300)   # every road fight cleared, so the map is open
    await pg.evaluate("(()=>{ localStorage.removeItem('bramblewood_skirm_you_v2'); conquestWorldView = false; pl2ProPreview('2-SK'); })()"); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("""(()=>{ const box = document.querySelector('.ui12-skirm'); if(!box) return null; const en = box.querySelector('[data-skirm-side=enemy]'), yo = box.querySelector('[data-skirm-side=you]');
      const rk = el=> { const h = el && el.querySelector('.ui12-drank'); return h ? {r: h.dataset.rank, t: h.querySelector('b').textContent, tip: h.getAttribute('aria-label')} : null; };
      return {enemyId: en && (en.querySelector('.ui12-skirm-id') || {}).textContent, enemyRank: rk(en), you: yo && (yo.querySelector('.ui12-skirm-id') || {}).textContent, youRank: rk(yo),
        sel: yo && yo.querySelector('select') ? yo.querySelector('select').value : null, draw: skirmDraw && {e: skirmDraw.enemy.id, y: skirmDraw.you.set, deck: skirmDraw.enemy.deck},
        def: refDefaultSet(), strip: [...document.querySelectorAll('.cnp-squad [data-sqdef]')].map(x=> x.dataset.sqdef).sort()}; })()""")
    ok(r is not None and re.match(r'^2-BPRO-\d+$', r['enemyId'] or '') and r['enemyRank'] and r['enemyRank']['t'] in ('1', '2', '3', '4', '5+'), f'the enemy row names the drawn BPRO deck with its rank {r and (r["enemyId"], r["enemyRank"])}')
    ok(r is not None and r['youRank'] and r['youRank']['t'] in ('1', '2', '3', '4', '5+') and '(1 is the strongest)' in r['youRank']['tip'], f'the player row shows a reference deck with its rank {r and (r["you"], r["youRank"])}')
    ok(r is not None and r['sel'] == r['def'] and r['draw']['y'].startswith(r['def'] + '-'), f'the player side defaults to a random reference deck of the level ({r and r["sel"]}, drew {r and r["draw"]["y"]})')
    ok(r is not None and r['strip'] == sorted(k for k, v in r['draw']['deck'].items() if v > 0), f'the deck strip shows the drawn enemy deck {r and r["strip"]} vs {r and sorted(r["draw"]["deck"])}')
    await pg.screenshot(path=shot('gg10-preview', w))
    # New draw keeps the panel; My deck stays an Admin choice
    await pg.evaluate("document.querySelector('[data-skirm-reroll]').click()"); await pg.wait_for_timeout(700)
    ok(await pg.evaluate("!!document.querySelector('.ui12-skirm [data-skirm-side=enemy] .ui12-drank')"), 'New draw draws again')
    await pg.evaluate("(()=>{ const s = document.querySelector('[data-skirm-you]'); s.value = 'my'; s.dispatchEvent(new Event('change', {bubbles: true})); })()"); await pg.wait_for_timeout(700)
    r2 = await pg.evaluate("({sel: (document.querySelector('[data-skirm-you]') || {}).value, you: (document.querySelector('.ui12-skirm [data-skirm-side=you] .ui12-skirm-id') || {}).textContent, rank: !!document.querySelector('.ui12-skirm [data-skirm-side=you] .ui12-drank')})")
    ok(r2['sel'] == 'my' and r2['you'] == 'My deck' and not r2['rank'], f'Admin can pick My deck (no rank on it) {r2}')
    await pg.evaluate("(()=>{ const s = document.querySelector('[data-skirm-you]'); s.value = refDefaultSet(); s.dispatchEvent(new Event('change', {bubbles: true})); })()"); await pg.wait_for_timeout(700)
    pre = await pg.evaluate("({e: skirmDraw.enemy.id, y: skirmDraw.you.set, deck: skirmDraw.enemy.deck})")
    await pg.evaluate("(()=>{ try{ skipTriggerLesson(); }catch(e){} document.getElementById('cnpFightBtn').click(); })()"); await pg.wait_for_timeout(3000)
    r3 = await pg.evaluate("(()=>{ const m = matchState; if(!m) return null; return {skirm: m.skirm, ref: m.refSet || (m.ref && m.ref.stage) || null}; })()")
    ok(r3 is not None and r3['skirm'] and r3['skirm']['deck'] == pre['e'] and r3['skirm']['you'] and r3['skirm']['you']['set'] == pre['y'], f'Fight plays the previewed decks {pre["e"], pre["y"]} -> {r3 and r3["skirm"]}')
    await done(pg)
    # a player (no Admin): no picker, the random reference deck
    pg = await W.fresh(b, url, w)
    r = await pg.evaluate("(()=>{ adminModeEnabled = false; localStorage.setItem('bramblewood_skirm_you_v2', 'my'); return skirmYou() === refDefaultSet(); })()")
    ok(r, 'without Admin the player side is always the random reference deck')
    await done(pg)

# ---------------------------------------------------------------- GG8
async def gg8(b, url, w):
    print(f'-- GG8: every tree shakes; no bright trees after a click ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ const p = loadConquestProgress(); CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); })()")
    await pg.evaluate("(async()=>{ switchTab('play'); await new Promise(r=> setTimeout(r, 400)); conquestSelectedMap = 'mf'; conquestSelectedNodeKey = null; renderPlay(); })()"); await pg.wait_for_timeout(2500)
    r = await pg.evaluate("({hits: document.querySelectorAll('.mfx-hit.mfx-tree').length, data: (MAP_FX_SPOTS.mf.t || []).length, art: document.getElementById('conquestLayout').classList.contains('has-map-art')})")
    ok(r['art'] and r['hits'] == r['data'] and r['hits'] > 1, f'every tree has a tap spot {r}')
    r = await pg.evaluate("""(async()=>{ const hs = [...document.querySelectorAll('.mfx-hit.mfx-tree')]; let shook = 0;
      for(const h of hs.slice(0, 4)){ h.click(); await new Promise(r=> setTimeout(r, 40)); if(document.querySelector('.mfx-patch.mfx-tree-shake')) shook++; await new Promise(r=> setTimeout(r, 560)); }
      return {tried: Math.min(4, hs.length), shook}; })()""")
    ok(r['shook'] == r['tried'], f'each tree tapped shakes {r}')
    # a click on a fight redraws the map: the sway layer is first again before the next frame
    await pg.evaluate("(()=>{ const L = document.getElementById('conquestLayout'); const d = document.createElement('div'); d.className = 'ui12-probe-layer'; L.insertBefore(d, L.firstChild); })()")
    r = await pg.evaluate("new Promise(r=> requestAnimationFrame(()=> r(String((document.getElementById('conquestLayout').firstElementChild || {}).className))))")
    ok('map-sway-layer' in r, f'a layer put in front of the sway copies is moved behind them before the next frame ({r})')
    r = await pg.evaluate("""(async()=>{ const n = document.querySelector('.map-node[data-nodekey]'); const seen = []; const t0 = performance.now();
      const tick = ()=>{ seen.push(String((document.getElementById('conquestLayout').firstElementChild || {}).className)); if(performance.now() - t0 < 1500) requestAnimationFrame(tick); };
      n.click(); requestAnimationFrame(tick); await new Promise(r=> setTimeout(r, 1700)); return [...new Set(seen)]; })()""")
    ok(all('map-sway-layer' in s for s in r), f'after clicking a fight the sway copies stay under the tint and the weather in every frame {r}')
    await pg.screenshot(path=shot('gg8-after-click', w))
    await done(pg)

# ---------------------------------------------------------------- GG1, GG5, GG6 (in a fight)
BOARD = re.sub(r"  # 2026-10-26.*", "", P.BOARD)
async def coach(b, url, w):
    print(f'-- GG1 / GG5 / GG6: the deck tooltip, the leader steps, the Lumber step ({w})')
    pg = await P.page(b, url, w, pre=P.DONE_TIPS)   # the real coach tips (DONE stubs them out)
    await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', 0, 12]], [['otter-kit', 0, 12]])")
    # every passive tip and lesson counts as seen, so only the steps shown here appear
    await pg.evaluate("(()=>{ try{ passiveTipCandidates().forEach(t=> coachSeen.add(t.id)); }catch(e){} PITCH_LESSON.forEach(t=> coachSeen.add(t.id)); ['g-peek', 'castle-shield', 'pl-wait', 'rank-pay', 'rank-hp'].forEach(k=> coachSeen.add(k)); hideCoachTip(); })()")
    # GG1
    r = await pg.evaluate("""(async()=>{ hideCoachTip(); const g = GUIDED_STEPS.find(s=> s.id === 'g-deck'); coachSeen.delete('g-deck'); const el = g.anchor(); if(!el) return null;
      showCoachTip(g, el); await new Promise(r=> setTimeout(r, 300)); const tip = document.querySelector('.coach-tip');
      const now = {tip: !!tip, timed: tip && tip.classList.contains('is-timed'), btn: !!(tip && tip.querySelector('button')), shield: !!document.querySelector('.coach-shield'), spot: !!document.querySelector('.coach-spotlight'), seen: coachSeen.has('g-deck')};
      // nothing else shows meanwhile
      const pass = {id: 'ui12-probe', text: 'probe', anchor: ()=> el}; let other = false; const orig = window.passiveTipCandidates; maybeShowCoachTip(); other = !!coachOpen && coachOpen.tip !== g;
      await new Promise(r=> setTimeout(r, 2500)); const mid = !!document.querySelector('.coach-tip');
      await new Promise(r=> setTimeout(r, 2600)); return Object.assign(now, {other, mid, gone: !document.querySelector('.coach-tip.is-timed'), open: !!coachOpen && coachOpen.tip === g}); })()""")
    ok(r is not None and r['tip'] and r['timed'] and not r['btn'] and not r['shield'] and not r['spot'], f'GG1: the deck step is a tooltip: no button, no shield, no spotlight {r}')
    ok(r is not None and r['seen'] and not r['other'] and r['mid'] and r['gone'] and not r['open'], f'GG1: it holds 5 s, nothing else meanwhile, then fades by itself {r}')
    ok(await pg.evaluate("(()=>{ const g = GUIDED_STEPS.find(s=> s.id === 'g-deck'); return !g.block && g.fadeMs === 5000; })()"), 'GG1: the step needs no action')
    # GG5
    r = await pg.evaluate("""(async()=>{ hideCoachTip(); const g = GUIDED_STEPS.find(s=> s.id === 'g-leader-wait'); const el = document.getElementById('handStrip') || document.body; showCoachTip(g, el); await new Promise(r=> setTimeout(r, 300));
      const sh = document.querySelector('.coach-shield'); const out = {spot: !!document.querySelector('.coach-spotlight'), shield: !!sh, bg: sh && getComputedStyle(sh).backgroundColor, tip: !!document.querySelector('.coach-tip'), pointer: !!document.querySelector('.coach-pointer')};
      hideCoachTip(); const g2 = GUIDED_STEPS.find(s=> s.id === 'g-wait-tick'); showCoachTip(g2, el); await new Promise(r=> setTimeout(r, 200)); out.spot2 = !!document.querySelector('.coach-spotlight'); hideCoachTip(); return out; })()""")
    ok(r['tip'] and r['pointer'] and not r['spot'] and not r['spot2'] and r['shield'] and r['bg'] in ('rgba(0, 0, 0, 0)', 'transparent'), f'GG5: the leader Wait steps point without darkening the screen {r}')
    # GG6
    r = await pg.evaluate("""(async()=>{ hideCoachTip(); const m = matchState, me = pitchLessonMine(m); me.lumber = 2; renderMatchUI(); await new Promise(r=> setTimeout(r, 300));
      const tip = PITCH_LESSON[2], el = tip.anchor(); if(!el) return null; showCoachTip(tip, el); await new Promise(r=> setTimeout(r, 400));
      const b = document.querySelector('.coach-tip'), y0 = b.getBoundingClientRect().top, p0 = document.querySelector('.coach-pointer'), ptr0 = p0 && !p0.hidden;
      me.lumber = 0; renderMatchUI(); await new Promise(r=> setTimeout(r, 700));
      const pill = document.getElementById('hudLumberPill'), b1 = document.querySelector('.coach-tip'), p1 = document.querySelector('.coach-pointer');
      const out = {anchorId: el.id, ptr0, pill: !!pill, zero: pill && pill.classList.contains('is-zero'), dy: b1 ? Math.round(b1.getBoundingClientRect().top - y0) : null, ptrHidden: !p1 || p1.hidden, noArrow: b1 && b1.classList.contains('no-arrow')};
      hideCoachTip(); renderMatchUI(); await new Promise(r=> setTimeout(r, 200)); out.pillAfter = !!document.getElementById('hudLumberPill'); return out; })()""")
    ok(r is not None and r['anchorId'] == 'hudLumberPill' and r['ptr0'], f'GG6: the step points at the Lumber pill {r}')
    ok(r is not None and r['pill'] and r['zero'] and r['dy'] is not None and abs(r['dy']) < 30 and r['ptrHidden'] and r['noArrow'], f'GG6: at 0 Lumber the pill stays, the bubble stays put, only the arrow goes {r}')
    ok(r is not None and not r['pillAfter'], 'GG6: once the step is closed a 0 Lumber pill is gone again, as before')
    await pg.screenshot(path=shot('gg6-coach', w))
    await done(pg)

PARTS = {'gg4': gg4, 'gg3': gg3, 'gg10': gg10, 'gg8': gg8, 'coach': coach}
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--width', default='1366,390'); ap.add_argument('--only', default='')
    a = ap.parse_args(); httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    parts = [p for p in a.only.split(',') if p] or list(PARTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in [int(x) for x in a.width.split(',')]:
            for k in parts: await PARTS[k](b, url, w)
        await b.close()
    print('\nFAILED: %d' % len(fails) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
