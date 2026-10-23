#!/usr/bin/env python3
"""Package PRO (2026-10-24, owner 00:28): browser checks and screenshots at 390 and 1366 of the hidden PRO fights: Admin's PRO list, a PRO
fight starting from it (the VS opener, then the board), the deep link #pro=3-PRO-1, and the skirmish editor's PRO row.

    python3 tests/e2e/pro_2026_10_23.py            # checks + shots in tests/out/shots/pro-*.png
    python3 tests/e2e/pro_2026_10_23.py --widths 390

Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, json, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "localStorage.setItem('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mtut:tutorial','mtut:tutorial2'], raidUnlocked:[], ranks:{}}));"
        # the deck (the tutorial's otters) before the deep link fires (load + 1.5 s)
        "window.addEventListener('load', ()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.deckSizeOkOrWarn = ()=> true;"
        " saveEnergyState({current:40, lastRegenAt:Date.now()}); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){ window.__setupErr = String(e); } });")
DATA = json.load(open(os.path.join(ROOT, 'canonical', 'pro-skirmishes.json'), encoding='utf-8'))
fails = []; shots = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP)
    await pg.goto(url); await pg.wait_for_timeout(3200)
    await pg.evaluate("(()=>{ const h = document.getElementById('toastHost'); if(h) h.innerHTML = ''; })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'pro-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    # Admin's list
    r = await pg.evaluate("""(async()=>{ switchTab('admin'); renderAdmin(); await new Promise(r=> setTimeout(r, 500)); const p = document.getElementById('adminProFights');
      if(p) p.scrollIntoView({block:'start'}); window.scrollBy(0, -8); await new Promise(r=> setTimeout(r, 300));
      const over = [...(p ? p.querySelectorAll('*') : [])].filter(e=> e.getBoundingClientRect().right > window.innerWidth + 1).length;
      return {shown: !!p, rows: p ? [...p.querySelectorAll('.pro-row')].map(x=> x.dataset.proKey) : [], over, docW: document.documentElement.scrollWidth, vw: window.innerWidth}; })()""")
    want = [e['id'] for m in DATA['maps'].values() for e in m['pro']]
    ok(r['shown'] and r['rows'] == want, f"Admin lists the PRO fights {r['rows']}")
    ok(r['over'] == 0 and r['docW'] <= r['vw'] + 1, f"Admin's PRO list fits the width (overflowing elements {r['over']}, page {r['docW']} / {r['vw']})")
    await shot(pg, 'admin-list', w)
    # a PRO fight starting from it
    await pg.click('#adminProFights [data-pro-start="3-PRO-1"]')
    vs_name = ''
    for _ in range(30):  # the VS opener fades in for ~0.5 s and holds to 1.7 s: the shot at ~0.7 s, before the checks
        vs_name = await pg.evaluate("((document.querySelector('.vs-opener .vs-them .vs-name') || {}).textContent || '').trim()")
        if vs_name: break
        await pg.wait_for_timeout(100)
    # a still copy of the fight's own opener for the shot (a screenshot here takes longer than the opener stays)
    await pg.evaluate("(()=>{ const e = document.querySelector('.vs-opener'); if(!e) return; const c = e.cloneNode(true); c.classList.remove('is-leaving'); c.classList.add('pro-shot-still'); c.style.animation = 'none'; c.style.opacity = '1'; c.querySelectorAll('*').forEach(x=>{ x.style.animation = 'none'; }); document.getElementById('view-play').appendChild(c); })()")
    await shot(pg, 'fight-start', w)
    await pg.evaluate("document.querySelectorAll('.pro-shot-still').forEach(e=> e.remove())")
    r = await pg.evaluate("({pro: matchState && matchState.proFight, admin: !!(matchState && matchState.adminTest)})")
    r['vs'] = vs_name
    ok(r['pro'] == '3-PRO-1' and r['admin'] and vs_name == '3-PRO-1', f"Fight starts 3-PRO-1 with its VS opener {r}")
    await pg.wait_for_timeout(3200)
    r = await pg.evaluate("({board: !!document.getElementById('rowMine'), enemy: matchState && matchState.players[2].deck.length + matchState.players[2].hand.length})")
    ok(r['board'] and r['enemy'] >= 18, f"the board is up, the enemy holds its 20-card PRO deck {r}")
    await shot(pg, 'fight-board', w)
    ok(not pg._errs, f'no page errors {pg._errs[:3]}')
    await pg.close()
    # the deep link
    pg = await fresh(b, url + '#pro=0-PRO-1', w)
    r = await pg.evaluate("({pro: matchState && matchState.proFight, hash: location.hash, energy: currentEnergy(), err: window.__setupErr || null})")
    ok(r['pro'] == '0-PRO-1' and r['hash'] == '' and r['energy'] == 40, f"#pro=0-PRO-1 starts that fight, free, the link cleared {r}")
    await pg.wait_for_timeout(2600)
    # the skirmish editor's row
    r = await pg.evaluate("""(async()=>{ endMatch(); switchTab('play'); openSkirmishEditor('mc', '3-2'); await new Promise(r=> setTimeout(r, 400)); const f = document.querySelector('#skirmishEditorOverlay .pro-editor');
      if(f) f.scrollIntoView({block:'center'}); await new Promise(r=> setTimeout(r, 300)); return {shown: !!f, keys: f ? [...f.querySelectorAll('[data-pro-start]')].map(x=> x.dataset.proStart) : []}; })()""")
    ok(r['shown'] and r['keys'] == [e['id'] for e in DATA['maps']['mc']['pro']], f"the skirmish editor shows Map 3's PRO fights {r}")
    await shot(pg, 'editor-row', w)
    ok(not pg._errs, f'no page errors {pg._errs[:3]}')
    await pg.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('\n'.join(shots))
    print(f'pro e2e: {len(fails)} FAILED' if fails else 'pro e2e: all passed')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); asyncio.run(main(ap.parse_args()))
