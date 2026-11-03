#!/usr/bin/env python3
"""Package UI17 (2026-11-03, owner 18:37 + 18:40): browser checks on the built index.html, shots in tests/e2e/shots/ui17/.
    python3 tests/e2e/ui17_2026_11_03.py [--page index.html] [--width 1366,390] [--only reset,energy,overview,buy,sets]
reset     Profile -> Admin resets -> Full reset (new account): a red modal; Reset everything stays disabled until RESET is typed; it reloads
          as a brand-new player (the splash and faction picker come back, no tutorial, no faction, no decks or progress, the starting 200 / 20 / 60),
          with Admin Mode on, device settings kept and infinite Energy on.
energy    infinite Energy: only with Admin Mode on; the pill reads ∞; a fight costs nothing; off again, Energy is as it was.
overview  Admin -> Players: the overview tiles (online now, active hour / day / week, accounts, new today, fights, matches, raids,
          connections), "needs SQL" while admin_overview() is missing, the health line, Refresh. Against a stubbed client (no live writes).
buy       a single Hedgerow Pouch: at its summary Buy again (with the price) opens the next one and charges again; without the money it is
          disabled.
sets      the first set (×10) is on offer at Map 8 and not at Map 7.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V
from playwright.async_api import async_playwright
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui17'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
def shot(name, w): return os.path.join(SHOTS, f'{name}-{w}.png')
NOTOAST = '.toast, .toast-host, #toastHost, .xp-float, .fxg-title-stage, .level-up-burst, #signInBanner{display:none !important;} #atmoTint, #atmoCanvas{display:none !important;}'
SLEEP = 'const W = ms=> new Promise(r=> setTimeout(r, ms));'

async def fresh(b, url, w, once=False, extra=''):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    # once=True: the "returning player" setup runs on the first load only, so a reload after the full reset shows what it left
    init = V.SKIP + extra
    if once: init = "if(!localStorage.getItem('ui17_e2e_init')){ localStorage.setItem('ui17_e2e_init','1'); " + init + " }"
    await pg.add_init_script(init)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    return pg
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()

# ---------------------------------------------------------------- reset
async def reset(b, url, w):
    print(f'-- full reset ({w})')
    pg = await fresh(b, url, w, once=True, extra="localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_arena_adminmode','1'); localStorage.setItem('bw_musicVolume','0.3'); localStorage.setItem('bramblewood_lang_v1','en'); localStorage.setItem('bramblewood_name_chosen_v1','1'); localStorage.setItem('bramblewood_arena_profile', JSON.stringify({name:'Tester'}));")
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    await pg.evaluate("(()=>{ setAdminMode(true); myCurrencies.gold = 4321; saveCurrencies(); const p = loadConquestProgress(); p.completed.push('m1:1-1'); saveConquestProgress(p); switchTab('profile'); })()")
    await pg.wait_for_timeout(600); await pg.add_style_tag(content=NOTOAST)
    has = await pg.evaluate("!!document.getElementById('pfFullReset')")
    ok(has, 'Profile -> Admin resets has the Full reset (new account) button')
    await pg.click('#pfFullReset'); await pg.wait_for_timeout(300)
    m = await pg.evaluate("""(()=>{ const o = document.querySelector('.ui17-fr-overlay .ui17-fr-modal'); if(!o) return null; const go = o.querySelector('#ui17FrGo'), cs = getComputedStyle(o);
      return {role: o.getAttribute('role'), items: o.querySelectorAll('.ui17-fr-list li').length, dis: go.disabled, border: cs.borderTopColor, focus: document.activeElement && document.activeElement.id, sw: document.documentElement.scrollWidth, vw: innerWidth}; })()""")
    ok(m and m['role'] == 'alertdialog' and m['items'] == 7 and m['dis'] and m['border'] == 'rgb(192, 57, 43)' and m['focus'] == 'ui17FrInput', f'a red alert modal listing what goes, Reset disabled, the box focused {m}')
    ok(m and m['sw'] <= m['vw'], 'no sideways scroll')
    await pg.fill('#ui17FrInput', 'RESE'); ok(await pg.evaluate("document.getElementById('ui17FrGo').disabled"), '"RESE" is not enough')
    await pg.fill('#ui17FrInput', 'reset'); ok(await pg.evaluate("document.getElementById('ui17FrGo').disabled"), 'lower-case "reset" is not enough')
    await pg.fill('#ui17FrInput', 'RESET'); ok(not await pg.evaluate("document.getElementById('ui17FrGo').disabled"), 'RESET opens the button')
    await pg.screenshot(path=shot('reset-modal', w))
    await pg.click('[data-x]'); ok(not await pg.evaluate("!!document.querySelector('.ui17-fr-overlay')"), 'Cancel closes it, nothing reset')
    ok(await pg.evaluate("localStorage.getItem('bramblewood_arena_faction')") == 'otters', 'still otters after Cancel')
    await pg.click('#pfFullReset'); await pg.fill('#ui17FrInput', 'RESET')
    async with pg.expect_navigation(timeout=30000): await pg.click('#ui17FrGo')
    await pg.wait_for_function("typeof switchTab === 'function'", timeout=90000); await pg.wait_for_timeout(3500)
    r = await pg.evaluate("""(()=>({fac: localStorage.getItem('bramblewood_arena_faction'), tut: localStorage.getItem('bramblewood_arena_tutorial_done'), coach: localStorage.getItem('bramblewood_coach_seen'),
      prog: (loadConquestProgress().completed||[]).length, gold: myCurrencies.gold, gems: myCurrencies.gems, dust: myCurrencies.dust, decksKey: localStorage.getItem('bramblewood_arena_decks'),
      name: localStorage.getItem('bramblewood_name_chosen_v1'), admin: adminModeEnabled, adminKey: localStorage.getItem('bramblewood_arena_adminmode'), inf: ui17InfiniteEnergy(), vol: localStorage.getItem('bw_musicVolume'),
      lang: localStorage.getItem('bramblewood_lang_v1'), splash: sessionStorage.getItem('bramblewood_seen_splash'), seen: localStorage.getItem('bramblewood_arena_seen'),
      fullEnergy: settleEnergy().ui17Inf === true}))()""")
    ok(r['fac'] is None and r['tut'] is None and r['prog'] == 0, f'no faction, no tutorial done, no progress {r}')
    ok(r['coach'] is None and r['name'] is None and r['seen'] in (None, '[]'), 'coach tips, the name and the Codex seen are gone')
    ok(r['gold'] == 200 and r['gems'] == 20 and r['dust'] == 60, f'a new player\'s currencies {r["gold"]}/{r["gems"]}/{r["dust"]}')
    ok(r['admin'] is True and r['adminKey'] == '1' and r['inf'] and r['fullEnergy'], 'Admin Mode still on, infinite Energy on')
    ok(r['vol'] == '0.3' and r['lang'] == 'en', 'device settings kept (music volume, language)')
    ok(r['splash'] is None, 'the splash comes back (this tab\'s session flags went)')
    await pg.add_style_tag(content='#atmoTint, #atmoCanvas{display:none !important;}')
    await pg.screenshot(path=shot('reset-after', w))
    # Start through the entrance: the faction picker shows (as for a new player)
    ok(await pg.evaluate("!!document.getElementById('loginNameInput')"), 'the entrance asks for a name again (a new player\'s entrance)')
    await pg.fill('#loginNameInput', 'Fresh Tester'); await pg.click('#loginSubmitBtn')
    picker = await pg.evaluate("""(async()=>{ """ + SLEEP + """ for(let i = 0; i < 40; i++){ const el = document.getElementById('factionScreen'); if(el && !el.hidden) return el.className; await W(400); } return null; })()""")
    ok(picker is not None, f'the faction picker shows again ({picker})')
    await pg.wait_for_timeout(1200)
    await pg.screenshot(path=shot('reset-faction-picker', w))
    await done(pg)

# ---------------------------------------------------------------- energy
async def energy(b, url, w):
    print(f'-- infinite Energy ({w})')
    pg = await fresh(b, url, w); await pg.evaluate("(()=>{ " + V.OWN + " })()"); await pg.add_style_tag(content=NOTOAST)
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ setAdminMode(false); saveEnergyState({current: 7, lastRegenAt: Date.now()}); localStorage.setItem('bramblewood_arena_admin_infenergy', '1');
      const off = {inf: ui17InfiniteEnergy(), e: currentEnergy()}; setAdminMode(true); refreshEnergyHud(); await W(100);
      const pill = (document.getElementById('energyPillText') || {}).textContent || ''; const before = JSON.parse(localStorage.getItem('bramblewood_arena_energy_v1')).current;
      switchTab('play'); await W(300); const f = findConquestNode('mf', '1-1') ? ['mf', '1-1'] : null; let started = false;
      if(f){ startConquestMatch(f[0], f[1]); await W(1200); started = !!matchState; try{ endMatch && matchState && (matchState.over = true); }catch(e){} }
      const after = JSON.parse(localStorage.getItem('bramblewood_arena_energy_v1')).current; const big = spendEnergy(500);
      ui17SetInfiniteEnergy(false); const back = currentEnergy();
      return {off, pill, before, after, started, big, back}; })()""")
    ok(not r['off']['inf'] and r['off']['e'] == 7, f'Admin Mode off: the switch does nothing {r["off"]}')
    ok('∞' in r['pill'], f'Admin Mode on: the Energy pill reads ∞ ("{r["pill"]}")')
    ok(r['big'] and r['before'] == r['after'] == 7, f'a fight and a 500 spend cost nothing ({r})')
    ok(r['back'] == 7, 'off again: Energy is as it was (7)')
    await pg.evaluate("(()=>{ try{ leaveMatch && leaveMatch(); }catch(e){} matchState = null; switchTab('home'); ui17SetInfiniteEnergy(true); refreshEnergyHud(); })()"); await pg.wait_for_timeout(400)
    pill = await pg.query_selector('#energyPill')
    if pill and await pill.is_visible():
        await pill.click(); await pg.wait_for_timeout(300)
        p = await pg.evaluate("(()=>{ const p = document.getElementById('energyPanel'); return p && {head: p.querySelector('.ep-count').textContent, chk: (p.querySelector('#epInfinite') || {}).checked}; })()")
        ok(p and '∞' in p['head'] and p['chk'], f'the Energy panel shows ∞ and the switch {p}')
        await pg.screenshot(path=shot('energy-panel', w))
    await done(pg)

# ---------------------------------------------------------------- overview
FAKE = """(()=>{ const counts = {online: 2, hour: 3, day: 5, week: 9, total: 14, today: 1, raids: 4};
  const fake = {from: t=>{ const q = {t, col: null, since: null}; const api = {select(){ return api; }, limit(){ return api; }, gte(c, v){ q.col = c; q.since = v; return api; },
    then(res){ let k = 'total'; if(q.col === 'created_at') k = 'today'; else if(q.col === 'fought_at') k = 'raids'; else if(q.col === 'last_seen_at'){ const age = Date.now() - Date.parse(q.since); k = age < 6*60e3 ? 'online' : age < 2*3600e3 ? 'hour' : age < 2*86400e3 ? 'day' : 'week'; }
      return new Promise(r=> setTimeout(r, 30)).then(()=> res({error: null, count: counts[k], data: [{id: 'x'}]})); }}; return api; },
    rpc: async name=> name === 'admin_overview' ? {error: {code: 'PGRST202', message: 'Could not find the function public.admin_overview'}} : {error: null, data: []}};
  sbClient = fake; isSignedIn = ()=> true; window.__ui17Net = {req: 41, err: 1, last: {status: 401, path: '/rest/v1/player_progress', at: Date.now()}}; setAdminMode(true); return 1; })()"""
async def overview(b, url, w):
    print(f'-- Admin -> Players overview ({w})')
    pg = await fresh(b, url, w); await pg.evaluate("(()=>{ " + V.OWN + " })()"); await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate(FAKE)
    await pg.evaluate("(()=>{ openAdminUserList(); })()"); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("""(()=>{ const o = document.querySelector('.adminu1-overlay .ui17-ov'); if(!o) return null; const t = {}; o.querySelectorAll('.ui17-tile').forEach(x=> t[x.dataset.ov] = x.querySelector('b').textContent.trim());
      return {t, health: o.querySelector('.ui17-health').textContent.replace(/\\s+/g, ' '), bad: o.querySelector('.ui17-health').classList.contains('is-bad'), at: o.querySelector('.ui17-ov-at').textContent,
        firstInModal: document.querySelector('.adminu1-modal').children[1].className, sw: document.documentElement.scrollWidth, vw: innerWidth}; })()""")
    ok(r is not None, 'the overview is in Admin -> Players')
    if r:
        t = r['t']
        ok(t.get('online') == '2' and t.get('hour') == '3' and t.get('day') == '5' and t.get('week') == '9' and t.get('total') == '14' and t.get('today') == '1' and t.get('raids') == '4', f'the counts {t}')
        ok(t.get('fights') == 'needs SQL' and t.get('matches') == 'needs SQL' and t.get('conns') == 'needs SQL', 'fights, matches and connections say "needs SQL"')
        ok('Supabase' in r['health'] and 'ms' in r['health'] and '1 request errors of 41' in r['health'] and '401' in r['health'] and 'Build' in r['health'] and r['bad'], f'the health line: ping, errors (the last one), build {r["health"]}')
        ok('Updated' in r['at'] and '30' in r['at'], 'it says when, and that it refreshes every 30 s')
        ok('ui17-ov' in r['firstInModal'], 'the overview sits above the list')
        ok(r['sw'] <= r['vw'], 'no sideways scroll')
    await pg.screenshot(path=shot('overview', w))
    # applied: the server tiles fill in, and Refresh re-reads
    await pg.evaluate("(()=>{ sbClient.rpc = async ()=> ({error: null, data: [{fights_1h: 6, matches_1h: 2, db_connections: 10, db_size_mb: 32}]}); window.__ui17Net.err = 0; })()")
    await pg.click('.ui17-ov [data-ov-refresh]'); await pg.wait_for_timeout(1200)
    r2 = await pg.evaluate("(()=>{ const t = {}; document.querySelectorAll('.ui17-ov .ui17-tile').forEach(x=> t[x.dataset.ov] = x.textContent.replace(/\\s+/g, ' ').trim()); const h = document.querySelector('.ui17-ov .ui17-health'); return {t, ok: h.classList.contains('is-ok') === (window.__ui17Net.err === 0), cls: h.className, net: JSON.stringify(window.__ui17Net), txt: h.textContent}; })()")  # the dot is green exactly when no request failed (a real request may fail meanwhile)
    ok(r2['t'].get('fights', '').startswith('6') and r2['t'].get('matches', '').startswith('2') and '32 MB' in r2['t'].get('conns', '') and r2['ok'], f'after "apply it": the server tiles fill in {r2}')
    await pg.screenshot(path=shot('overview-applied', w))
    await done(pg)

# ---------------------------------------------------------------- buy again
async def to_summary(pg):
    for _ in range(12):
        st = await pg.evaluate("(()=>{ const o = document.getElementById('packOpenOverlay'); if(!o || o.hidden) return 'closed'; return document.querySelector('#poFoot #poDone') ? 'summary' : 'open'; })()")
        if st != 'open': return st
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(700)
    return 'stuck'
async def buy(b, url, w):
    print(f'-- Buy again ({w})')
    pg = await fresh(b, url, w); await pg.evaluate("(()=>{ " + V.OWN + " })()"); await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ isSignedIn = ()=> true; myCurrencies.gold = 120; myCurrencies.gems = 0; saveCurrencies(true); switchTab('shop'); })()"); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{ buyPack('bronze', null, 1); })()"); await pg.wait_for_timeout(900)
    ok(await to_summary(pg) == 'summary', 'the first pouch reaches its summary')
    a = await pg.evaluate("(()=>{ const b = document.getElementById('poBuyAgain'); return b && {dis: b.disabled, txt: b.textContent.replace(/\\s+/g, ' ').trim(), gold: myCurrencies.gold}; })()")
    ok(a and not a['dis'] and 'Buy again' in a['txt'] and '50' in a['txt'] and a['gold'] == 70, f'Buy again with its price (50), you have 70 {a}')
    await pg.screenshot(path=shot('buy-again', w))
    await pg.click('#poBuyAgain'); await pg.wait_for_timeout(900)
    g = await pg.evaluate("(()=>({gold: myCurrencies.gold, open: !document.getElementById('packOpenOverlay').hidden}))()")
    ok(g['open'] and g['gold'] == 20, f'it opens the next pouch and charges 50 again {g}')
    ok(await to_summary(pg) == 'summary', 'the second pouch reaches its summary')
    a2 = await pg.evaluate("(()=>{ const b = document.getElementById('poBuyAgain'); return b && {dis: b.disabled, txt: b.textContent.replace(/\\s+/g, ' ').trim(), title: b.title}; })()")
    ok(a2 and a2['dis'] and '50' in a2['txt'] and a2['title'], f'with 20 left it is disabled, the price and why on it {a2}')
    await pg.screenshot(path=shot('buy-again-short', w))
    await pg.click('#poDone'); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("document.getElementById('packOpenOverlay').hidden"), 'Done closes the opener')
    await done(pg)

# ---------------------------------------------------------------- sets at Map 8
REACH = """(n=>{ const p = loadConquestProgress(); p.completed = p.completed.filter(id=> /tutorial/.test(id)); const maps = mainConquestMaps();
  maps.forEach(m=>{ const k = mapNumberOf(m.id); if(k != null && k < n) (m.nodes||[]).forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)){ p.completed.push(id); p.ranks[id] = 'S'; } }); });
  saveConquestProgress(p); return playerMapReach(); })"""
async def sets(b, url, w):
    print(f'-- the first set at Map 8 ({w})')
    pg = await fresh(b, url, w); await pg.evaluate("(()=>{ " + V.OWN + " })()"); await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ setAdminMode(false); isSignedIn = ()=> true; myCurrencies.gold = 5000; myCurrencies.gems = 500; saveCurrencies(true); })()")
    reach7 = await pg.evaluate(REACH + "(7)"); o7 = await pg.evaluate("[packQtyOptions(shopPacksAll().find(p=> p.id==='bronze')), shopBundlesOpen()]")
    reach8 = await pg.evaluate(REACH + "(8)"); o8 = await pg.evaluate("[packQtyOptions(shopPacksAll().find(p=> p.id==='bronze')), shopBundlesOpen()]")
    ok(reach7 == 7 and 10 not in o7[0] and not o7[1], f'at Map {reach7}: no set yet {o7}')
    ok(reach8 == 8 and 10 in o8[0] and o8[1], f'at Map {reach8}: the ×10 is on offer {o8}')
    await pg.evaluate("(()=>{ switchTab('shop'); })()"); await pg.wait_for_timeout(800)
    vis = await pg.evaluate("(()=>{ const q = document.querySelector('[data-pq=\"10\"], [data-shelfitem$=\":10\"]'); return !!q; })()")
    ok(vis, 'the shop shows a ×10 at Map 8')
    await pg.screenshot(path=shot('sets-map8', w))
    await done(pg)

PARTS = {'reset': reset, 'energy': energy, 'overview': overview, 'buy': buy, 'sets': sets}
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--width', default='1366,390'); ap.add_argument('--only', default='')
    a = ap.parse_args(); httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    parts = [p for p in a.only.split(',') if p] or list(PARTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in [int(x) for x in a.width.split(',')]:
            for k in parts:
                try: await PARTS[k](b, url, w)
                except Exception as e: ok(False, f'{k} at {w} raised {str(e)[:300]}')
        await b.close()
    print('\nFAILED: %d' % len(fails) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
