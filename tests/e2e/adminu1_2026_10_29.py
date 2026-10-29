#!/usr/bin/env python3
"""Package ADMINU1 (2026-10-29): browser checks + shots of Admin -> Players (the overlay from admin_user_list()), at 1366 and 390.
The database call is stubbed inside the page (sbClient.rpc); nothing reaches Supabase.
    python3 tests/e2e/adminu1_2026_10_29.py [--widths 1366 390] [--keep]   # shots in tests/out/shots/adminu1-*.png; --keep copies them to docs/screens/adminu1/
Build first. Exits 1 on a failed check."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'adminu1')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.soonCheckMilestones = ()=>{}; window.showCoachTip = ()=>{}; }catch(e){} });")
fails = []; shots = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
ROWS = """[
 {id:'1', display_name:'Brambleguard Ottoline', created_at:'2026-10-02T09:00:00Z', last_seen_at:new Date(Date.now()-5*60000).toISOString(), rating:1210, is_admin:true, cards:84, fights:233, last_fight_at:null, matches:40, xp:5400, tutorial_done:true, maps_cleared:['m1','m2','m3','m4','m5'], nodes_cleared:61, gold:900},
 {id:'2', display_name:'Moss', created_at:'2026-10-20T09:00:00Z', last_seen_at:new Date(Date.now()-3*3600000).toISOString(), rating:1000, is_admin:false, cards:22, fights:31, matches:3, xp:620, tutorial_done:true, maps_cleared:['m1'], nodes_cleared:7},
 {id:'3', display_name:'Pip the Very Long Named Squirrel Of The Northern Wood', created_at:'2026-10-26T09:00:00Z', last_seen_at:new Date(Date.now()-3*86400000).toISOString(), rating:1000, is_admin:false, cards:9, fights:0, matches:0, xp:null, tutorial_done:false, maps_cleared:null, nodes_cleared:null},
 {id:'4', display_name:'Aster', created_at:'2026-10-27T09:00:00Z', last_seen_at:null, rating:1000, is_admin:false, cards:0, fights:0, matches:0, xp:null, tutorial_done:null, maps_cleared:null}
]"""
async def run(b, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(DONE); await pg.goto(url)
    await pg.wait_for_function("typeof switchTab === 'function' && typeof openAdminUserList === 'function'", timeout=60000); await pg.wait_for_timeout(2000)
    print(f'-- width {w}')
    # entry is admin-mode only
    await pg.evaluate(f"(()=>{{ window.__rows = {ROWS}; window.__calls = 0; sbClient = {{rpc: async(n)=>{{ window.__calls++; window.__name = n; return {{data: window.__rows, error: null}}; }}}}; isSignedIn = ()=> true; adminModeEnabled = false; switchTab('admin'); renderAdmin(); }})()")
    await pg.wait_for_timeout(300)
    ok(await pg.evaluate("!document.getElementById('adminUserListBtn')"), 'the Players list button is hidden while Admin Mode is off')
    ok(await pg.evaluate("(async()=> (await openAdminUserList()) === null && !document.querySelector('.adminu1-overlay') && window.__calls === 0)()"), 'openAdminUserList() does nothing while Admin Mode is off (no rpc call)')
    await pg.evaluate("adminModeEnabled = true; renderAdmin();"); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("!!document.getElementById('adminUserListBtn')"), 'the button shows with Admin Mode on')
    await pg.evaluate("document.getElementById('adminUserListBtn').scrollIntoView({block:'center'})")
    await pg.evaluate("document.getElementById('adminUserListBtn').click()"); await pg.wait_for_timeout(600)
    ok(await pg.evaluate("window.__name === 'admin_user_list'"), 'it calls rpc admin_user_list')
    n = await pg.evaluate("document.querySelectorAll('.adminu1-table tbody tr').length")
    ok(n == 4, f'4 rows rendered from the stub ({n})')
    txt = await pg.evaluate("document.querySelector('.adminu1-count').textContent")
    ok('4' in txt, f'the count line: {txt!r}')
    first = await pg.evaluate("[...document.querySelectorAll('.adminu1-table tbody tr')].map(r=> r.querySelector('.adminu1-c-name').textContent.trim())")
    ok(first[0].startswith('Brambleguard') and first[-1] == 'Aster', f'default sort is last seen, newest first, never-seen last {first}')
    lvl = await pg.evaluate("[...document.querySelectorAll('.adminu1-table tbody tr')].map(r=> r.querySelector('.adminu1-c-level').textContent.trim())")
    ok(lvl[0] not in ('—', '') and lvl[2] == '0' and lvl[3] == '—', f'levels from xp: 0 before the tutorial, dash when unknown {lvl}')
    mp = await pg.evaluate("document.querySelector('.adminu1-table tbody tr .adminu1-c-map').textContent.trim()")
    ok(mp not in ('—', ''), f'highest map shown {mp!r}')
    await pg.wait_for_timeout(200)
    f = os.path.join(OUT, f'adminu1-list-{w}.png'); await pg.screenshot(path=f); shots.append(f)
    # sort by fights, twice
    await pg.evaluate("document.querySelector('.adminu1-sort[data-k=fights]').click()")
    a = await pg.evaluate("[...document.querySelectorAll('.adminu1-c-fights')].map(x=> +x.textContent)")
    ok(a == sorted(a, reverse=True), f'sort by Fights (descending first) {a}')
    await pg.evaluate("document.querySelector('.adminu1-sort[data-k=fights]').click()")
    a = await pg.evaluate("[...document.querySelectorAll('.adminu1-c-fights')].map(x=> +x.textContent)")
    ok(a == sorted(a), f'a second tap reverses it {a}')
    await pg.evaluate("document.querySelector('.adminu1-sort[data-k=name]').click()")
    nm = await pg.evaluate("[...document.querySelectorAll('.adminu1-c-name')].map(x=> x.textContent.trim().toLowerCase())")
    ok(nm == sorted(nm), f'sort by name A to Z {nm}')
    # search
    await pg.fill('.adminu1-search', 'mo'); await pg.wait_for_timeout(100)
    nm = await pg.evaluate("[...document.querySelectorAll('.adminu1-c-name')].map(x=> x.textContent.trim())")
    ok(nm == ['Moss'], f'search "mo" keeps Moss only {nm}')
    ok('1' in await pg.evaluate("document.querySelector('.adminu1-count').textContent"), 'the count follows the search')
    await pg.fill('.adminu1-search', 'zzz'); await pg.wait_for_timeout(100)
    ok(await pg.evaluate("!!document.querySelector('.adminu1-none')"), 'no match says so')
    await pg.fill('.adminu1-search', ''); await pg.wait_for_timeout(100)
    # no horizontal page scroll, overlay fits the viewport width
    ok(await pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), 'no horizontal page scroll')
    ok(await pg.evaluate("(()=>{ const r = document.querySelector('.adminu1-modal').getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth + 1; })()"), 'the dialog fits the width')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    ok(await pg.evaluate("!document.querySelector('.adminu1-overlay')"), 'Escape closes it')
    # errors
    for label, err, want in (('missing function', "{code:'PGRST202', message:'Could not find the function public.admin_user_list in the schema cache'}", 'supabase/proposed/20261029_admin_user_list.sql'),
                             ('not an admin', "{code:'42501', message:'not allowed'}", 'Only admin accounts'),
                             ('offline', "new TypeError('Failed to fetch')", 'Could not load players')):
        await pg.evaluate(f"adminModeEnabled = true; sbClient = {{rpc: async()=> ({{data: null, error: {err}}})}}; openAdminUserList()"); await pg.wait_for_timeout(400)
        t = await pg.evaluate("(document.querySelector('.adminu1-msg')||{}).textContent || ''")
        ok(want in t, f'{label}: {t!r}')
        if label == 'missing function':
            ok("'apply it'" in t, 'the message tells the owner to say apply it')
            f = os.path.join(OUT, f'adminu1-missing-{w}.png'); await pg.screenshot(path=f); shots.append(f)
        await pg.evaluate("document.querySelectorAll('.adminu1-overlay').forEach(o=> o.remove())")
    await pg.evaluate("adminModeEnabled = true; sbClient = {rpc: async()=> { throw new Error('Failed to fetch'); }}; openAdminUserList()"); await pg.wait_for_timeout(400)
    ok('Could not load players' in await pg.evaluate("(document.querySelector('.adminu1-msg')||{}).textContent || ''"), 'a thrown (offline) rpc is caught')
    errs = [e for e in errs if 'sbClient.from' not in e]  # the game's own pollers call the stub client's .from
    ok(not errs, f'no page errors {errs[:2]}')
    await ctx.close()
async def main(a):
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in a.widths: await run(b, url, w)
        await b.close()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots: shutil.copy(f, KEEP)
    print(f'adminu1 e2e: {"FAILED " + str(len(fails)) if fails else "all passed"}'); sys.exit(1 if fails else 0)
ap = argparse.ArgumentParser(); ap.add_argument('--widths', type=int, nargs='*', default=[1366, 390]); ap.add_argument('--keep', action='store_true')
asyncio.run(main(ap.parse_args()))
