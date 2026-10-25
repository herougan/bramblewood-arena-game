#!/usr/bin/env python3
"""Package RW6 (2026-10-24, owner 12:02): browser checks and screenshots at 390 and 1366 of
  1. the results reward list without the locked-card chips (lock + card + rank emblem),
  2. a Base card reward (Sheep) as a card tile in Cards won, not a "spare copy" chip,
  3. the PRO fights as trophy nodes on the map in Admin Mode (and absent for a player), a tap starting the fight.

    python3 tests/e2e/rw6_2026_10_24.py            # checks + shots in tests/out/shots/rw6-*.png
    python3 tests/e2e/rw6_2026_10_24.py --widths 390

Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, json, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "localStorage.setItem('bramblewood_world_open_v1','1');"
        "localStorage.setItem('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mtut:tutorial','mtut:tutorial2'], raidUnlocked:[], ranks:{}}));"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.deckSizeOkOrWarn = ()=> true;"
        " saveEnergyState({current:40, lastRegenAt:Date.now()}); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){ window.__setupErr = String(e); } });")
CLEAR_FN = """(()=>{ saveTutorial2Done(); saveTutorialDone(); const p = loadConquestProgress();
  mainConquestMaps().slice(0, 6).forEach(m=> m.nodes.forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); })()"""
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
    await pg.add_style_tag(content='.toast, .toast-host, .levelup, .level-up, [class*="levelup"], [class*="level-up"], .milestone-pop, .coach-tip, .signin-bar, [class*="signin"], .speech-bubble{display:none !important;}')
    await pg.wait_for_timeout(300)
    f = os.path.join(OUT, f'rw6-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

PANEL = """(async()=>{
  const m = {mode:'conquest', winner:1, conquestRankEarned:'B', conquestKibbleEarned:2, conquestMetalEarned:1,
    conquestCardsNeedRank:[{id:'x1', rank:'S'}, {id:'x2', rank:'S'}, {id:'x3', rank:'S'}],
    conquestBaseGrowth:{levels:[], copies:['sheep'], dust:0}, rewardCardIds:[], conquestCardsEarned:[], conquestRewardEarned:{gold:40, dust:0, isFirstClear:false}};
  const html = rewardsPanelHTML(m);
  const host = document.createElement('div'); host.id = 'rw6Host'; host.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#2a2218;overflow:auto;padding:12px;';
  host.innerHTML = '<div class="winloss-box" style="max-width:640px;margin:0 auto;">' + html + '</div>'; document.body.appendChild(host);
  await new Promise(r=> setTimeout(r, 900));
  const q = s=> host.querySelectorAll(s).length;
  const cards = [...host.querySelectorAll('.rw-unlocks .rw-card')].map(e=> e.textContent.trim() + '|' + (e.dataset.tip || ''));
  return {html: html.length, locked: q('.rw-locked-card'), lockEmoji: host.textContent.includes('🔒 🃏'), spareTip: host.innerHTML.includes('spare copy'), pill: q('.rw-base-grow'),
    cards, sheepTile: q('.rw-unlocks .rw-card.rw-base-copy .card-tile, .rw-unlocks .rw-card.rw-base-copy [class*=card]'), hudLocked: (hudHTML => hudHTML)(0),
    over: document.documentElement.scrollWidth > innerWidth + 1}; })()"""

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    await pg.evaluate(CLEAR_FN)
    r = await pg.evaluate(PANEL)
    ok(r['locked'] == 0 and not r['lockEmoji'], f"1. the results list shows no locked-card chips {r['locked']}")
    ok(r['sheepTile'] >= 1 and len(r['cards']) == 1 and 'Sheep' in r['cards'][0], f"2. Sheep is a card tile in Cards won {r['cards']}")
    ok(not r['spareTip'] and r['pill'] == 0, '2. no "spare copy" chip or wording')
    await shot(pg, 'results', w)
    await pg.evaluate("document.getElementById('rw6Host').remove()")
    # 3. the PRO nodes on the map
    for mid in DATA['maps']:
        want = [e['id'] for e in DATA['maps'][mid]['pro']]
        await pg.evaluate("(m)=>{ setAdminMode(false); conquestWorldView = false; conquestSelectedMap = m; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); }", mid)
        await pg.wait_for_selector('#conquestCanvas .map-node', timeout=15000); await pg.wait_for_timeout(500)
        n0 = await pg.evaluate("document.querySelectorAll('#conquestCanvas .map-pro').length")
        ok(n0 == 0, f'3. {mid}: map drawn, no PRO nodes for a player ({n0})')
    mid = 'mc'; want = [e['id'] for e in DATA['maps'][mid]['pro'] + DATA['maps'][mid].get('bpro', [])] + ['3-REF']  # 2026-10-25 (package PREF): + the BPRO nodes (PL2) and the map's X-REF node
    await pg.evaluate("(m)=>{ localStorage.setItem('bramblewood_admin_mode_v1','1'); window.adminAllowed = ()=> true; setAdminMode(true); conquestWorldView = false; conquestSelectedMap = m; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); }", mid)
    await pg.wait_for_selector('#conquestCanvas .map-node', timeout=15000); await pg.wait_for_timeout(800)
    r = await pg.evaluate("""(()=>{ const cv = document.getElementById('conquestCanvas'); const ns = cv ? [...cv.querySelectorAll('.map-pro')] : [];
      const cr = cv ? cv.getBoundingClientRect() : null;
      return {admin: adminModeEnabled, keys: ns.map(n=> n.dataset.proStart), codes: ns.map(n=> n.textContent.trim()), inside: ns.every(n=>{ const r = n.getBoundingClientRect(); return cr && r.left >= cr.left - 2 && r.right <= cr.right + 2; }),
        notNodes: ns.every(n=> !n.classList.contains('map-node')), size: ns.map(n=> Math.round(n.getBoundingClientRect().width)), docW: document.documentElement.scrollWidth, vw: innerWidth}; })()""")
    ok(r['admin'] and r['keys'] == want, f"3. admin: {mid} shows its PRO nodes {r['keys']}")
    ok(all(k in c for k, c in zip(r['keys'], r['codes'])), f"3. each node is labelled N-PRO-k {r['codes']}")
    ok(r['notNodes'] and r['inside'] and r['docW'] <= r['vw'] + 1, f"3. nodes are inside the map and the page fits {r['docW']}/{r['vw']}")
    await pg.evaluate("(()=>{ const n = document.querySelector('#conquestCanvas .map-pro'); if(n) n.scrollIntoView({block:'center', inline:'center'}); })()")
    await pg.wait_for_timeout(7000)
    await pg.evaluate("(()=>{ const n = document.querySelector('#conquestCanvas .map-pro'); if(n) n.scrollIntoView({block:'center', inline:'center'}); })()")
    await shot(pg, 'map-admin', w)
    await pg.evaluate("setAdminMode(false)"); await pg.wait_for_selector('#conquestCanvas .map-node', timeout=15000); await pg.wait_for_timeout(900)
    n0 = await pg.evaluate("document.querySelectorAll('#conquestCanvas .map-pro').length")
    ok(n0 == 0, f'3. admin off again: the nodes are gone ({n0})')
    await shot(pg, 'map-player', w)
    # a tap starts the fight
    await pg.evaluate("(m)=>{ window.adminAllowed = ()=> true; setAdminMode(true); conquestSelectedMap = m; switchTab('play'); }", mid)
    await pg.wait_for_selector('#conquestCanvas .map-pro', timeout=15000); await pg.wait_for_timeout(800)
    await pg.evaluate("(()=>{ const n = document.querySelector('#conquestCanvas .map-pro'); n.scrollIntoView({block:'center', inline:'center'}); })()")
    await pg.click('#conquestCanvas .map-pro')
    await pg.wait_for_timeout(1500)
    r = await pg.evaluate("({pro: matchState && matchState.proFight, admin: !!(matchState && matchState.adminTest)})")
    ok(r['pro'] == want[0] and r['admin'], f"3. a tap on the node starts {want[0]} {r}")
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
    print(f'rw6 e2e: {len(fails)} FAILED' if fails else 'rw6 e2e: all passed')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); asyncio.run(main(ap.parse_args()))
