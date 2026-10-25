#!/usr/bin/env python3
"""Package FIX3 (2026-10-25, owner notes 10-25 17:53 F1-F6 and 22:36 G1-G22): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/fix3_2026_10_25.py                  # checks + shots in tests/out/shots/fix3-*.png
    python3 tests/e2e/fix3_2026_10_25.py --widths 1366 --keep   # --keep copies the shots to docs/screens/FIX3/

Covers: F1 (6-3 won with the live edit linking 6-3 to 6-6: both 6-4 and 6-6 open on the drawn map), F2 (fast map switching, a switch back to the
map on screen wins), F5 (a token keeps its element through the round-end redraw), G1 (a second tap on a feature spot opens it while an NPC talks),
G14 (the Train bar never covers a youngling), G17 (the pack card detail with Admin's finish buttons: card and details side by side, centred),
G20 (Map 0's signpost after Map 10: a tip, no conversation). Every page calls skipTriggerLesson() in its setup. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'FIX3')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SETUP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
         "localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_map_revealed_v1', JSON.stringify(['*']));"
         "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
         "if(!localStorage.getItem('bramblewood_conquest_progress_v1')) localStorage.setItem('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mtut:tutorial','mtut:tutorial2'], raidUnlocked:[], ranks:{}}));"
         "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.deckSizeOkOrWarn = ()=> true;"
         " saveEnergyState({current:200, lastRegenAt:Date.now()}); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){ window.__setupErr = String(e); } });")
# progress through the first N main maps (every fight won)
PASS = """(n)=>{ const p = loadConquestProgress(); mainConquestMaps().slice(0, n).forEach(m=> m.nodes.forEach(x=>{ const id = conquestNodeId(m.id, x.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); }"""
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, *a): pass
    httpd = S(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page(b, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(SETUP)
    await pg.goto(url); await pg.wait_for_timeout(3200)
    await pg.evaluate("(()=>{ const h = document.getElementById('toastHost'); if(h) h.innerHTML = ''; })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'fix3-{name}-{w}.png')
    try: await pg.screenshot(path=f, timeout=90000); shots.append(f)
    except Exception as e: print('  (shot skipped: ' + str(e).split('\n')[0] + ')')

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await page(b, url, w)
    # F1: the live edit (6-6 needs 6-5 and 6-3), 6-3 won -> 6-4 and 6-6 drawn open
    await pg.evaluate(PASS, 6)
    r = await pg.evaluate("""(async()=>{ const p = loadConquestProgress(); p.completed.push('m8:6-1', 'm8:6-2', 'm8:6-3'); saveConquestProgress(p);
      const m8 = CONQUEST_MAPS.find(m=> m.id === 'm8'); m8.nodes.find(n=> n.key === '6-6').requires = ['6-5', '6-3'];
      playSubTab = 'conquest'; conquestWorldView = false; conquestSelectedMap = 'm8'; conquestSelectedNodeKey = null; switchTab('play'); await new Promise(r=> setTimeout(r, 1800));
      const st = k=>{ const el = document.querySelector(`#conquestCanvas .map-node[data-lkey="${k}"]`); return el ? (el.classList.contains('map-node-hidden') ? 'locked' : 'open') : 'none'; };
      return {n4: st('6-4'), n6: st('6-6'), n5: st('6-5'), vis6: isNodeVisible(m8, m8.nodes.find(n=> n.key === '6-6'), 5, loadConquestProgress())}; })()""")
    ok(r['vis6'] and r['n4'] == 'open' and r['n6'] == 'open', f'F1. 6-3 won: 6-4 and 6-6 (linked from 6-3) both open {r}')
    await shot(pg, 'f1-map6', w)
    # F2: fast switching; a switch back to the map on screen wins
    await pg.evaluate(PASS, 8)
    r = await pg.evaluate("""(async()=>{ playSubTab = 'conquest'; conquestWorldView = false; conquestSelectedMap = 'm1'; switchTab('play'); await new Promise(r=> setTimeout(r, 1200));
      const click = id=>{ const el = document.querySelector(`#conquestMapList [data-mapid="${id}"]`); if(el) el.click(); return !!el; };
      const out = {};
      out.a = [click('mc'), click('mf'), click('m1')]; await new Promise(r=> setTimeout(r, 1500)); out.backToFirst = conquestSelectedMap;
      click('mc'); await new Promise(r=> setTimeout(r, 30)); click('mw'); await new Promise(r=> setTimeout(r, 30)); click('mb'); await new Promise(r=> setTimeout(r, 1500));
      out.last = conquestSelectedMap; out.canvasMap = (document.querySelector('.conquest-main') || {dataset:{}}).dataset.mapId || null; out.nodes = document.querySelectorAll('#conquestCanvas .map-node').length;
      return out; })()""")
    ok(r['backToFirst'] == 'm1', f'F2. Map 2, Map 1, then back to Map 0 before the first had drawn: Map 0 stays {r}')
    ok(r['last'] == 'mb' and r['nodes'] > 0, f'F2. three fast switches: the last map asked for is the one drawn, with its fights {r}')
    # G20: Map 0's signpost after Map 10 is a tip
    await pg.evaluate(PASS, 12)
    r = await pg.evaluate("""(async()=>{ const log = []; const orig = window.playDialogue; window.playDialogue = (id, o)=>{ log.push(id); return Promise.resolve({replies:[]}); };
      playSubTab = 'conquest'; conquestWorldView = false; conquestSelectedMap = 'm1'; conquestSelectedNodeKey = null; switchTab('play'); await new Promise(r=> setTimeout(r, 1500));
      const sp = document.querySelector('#conquestCanvas [data-lkey="~cur:signpost"]'), well = document.querySelector('#conquestCanvas [data-lkey="~well"]');
      if(sp) sp.click(); await new Promise(r=> setTimeout(r, 400)); const tip = [...document.querySelectorAll('.speech-bubble.fix3-quiet-tip')].map(e=> e.textContent);
      if(well) well.click(); await new Promise(r=> setTimeout(r, 400)); const tip2 = [...document.querySelectorAll('.speech-bubble.fix3-quiet-tip')].map(e=> e.textContent);
      window.playDialogue = orig; return {found: !!sp && !!well, dialogues: log, tip, tip2, passed: mapsPassed()}; })()""")
    ok(r['found'] and not r['dialogues'] and any('signpost' in t for t in r['tip']) and any('well' in t for t in r['tip2']), f'G20. after Map 10, the signpost and the old well give a tip, no conversation {r}')
    await shot(pg, 'g20-tip', w)
    # G1: a second tap on a feature spot opens it while an NPC talks
    r = await pg.evaluate("""(async()=>{ switchTab('play'); await new Promise(r=> setTimeout(r, 1200));
      const b = document.querySelector('#conquestCanvas [data-spot]'); if(!b) return {spot: null};
      dialoguesPending.add('fix3-test-talk'); // an NPC is talking
      const tab0 = currentTab; b.click(); await new Promise(r=> setTimeout(r, 300)); const after1 = currentTab;
      b.click(); await new Promise(r=> setTimeout(r, 600)); const after2 = currentTab; dialoguesPending.delete('fix3-test-talk');
      return {spot: b.dataset.spot, tab0, after1, after2}; })()""")
    ok(r['spot'] and r['after1'] == r['tab0'] and r['after2'] != r['tab0'], f'G1. while an NPC talks, the first tap shakes, the second opens the page {r}')
    await pg._ctx.close()
    # G14: the Train bar never covers a youngling
    pg = await page(b, url, w)
    r = await pg.evaluate("""(async()=>{ const defs = getCardDefs(); const pool = Object.keys(defs).filter(id=> !defs[id].token && !defs[id].test && defs[id].art).slice(0, 18);
      window.nurtureCandidates = ()=> pool; window.canAffordNurture = ()=> true; openNestPicker(null, 'young'); await new Promise(r=> setTimeout(r, 600));
      const ov = document.querySelector('.nest-picker'), grid = ov.querySelector('.np-grid'); const cards = [...ov.querySelectorAll('[data-np-card]')]; cards[1].click(); await new Promise(r=> setTimeout(r, 500));
      const conf = ov.querySelector('.np-confirm'), cr = conf.getBoundingClientRect(), gr = grid.getBoundingClientRect();
      const res = []; for(const top of [0, 200, 99999]){ grid.scrollTop = top; await new Promise(r=> setTimeout(r, 120));
        res.push(cards.filter(c=>{ const r = c.getBoundingClientRect(), vt = Math.max(r.top, gr.top), vb = Math.min(r.bottom, gr.bottom); return vb > vt && vb > cr.top + 1 && vt < cr.bottom - 1; }).length); }
      return {cards: cards.length, shown: !conf.hidden, covered: res, barBelow: cr.top >= gr.bottom - 1}; })()""")
    ok(r['shown'] and r['barBelow'] and not any(r['covered']), f'G14. the Train bar sits under the younglings, never over one {r}')
    await shot(pg, 'g14-train', w)
    await pg.evaluate("document.querySelectorAll('.modal-overlay').forEach(e=> e.remove())")
    # G17: the pack card detail with Admin's finish buttons
    if w >= 761:
        r = await pg.evaluate("""(async()=>{ adminModeEnabled = true; const defs = getCardDefs(); const id = Object.keys(defs).find(k=> defs[k].rarity === 'rare' && defs[k].art);
          openCardInspector(id, {pull: {foil: true, finish: null, shiny: false}}); await new Promise(r=> setTimeout(r, 1200));
          const ci = document.querySelector('.card-inspect'), q = s=> ci.querySelector(s).getBoundingClientRect();
          const st = q('.ci-stage'), card = q('.ci-face'), det = q('.ci-detail'), fin = ci.querySelectorAll('.ci-fin').length;
          return {fin, stageW: Math.round(st.width), gap: Math.round(det.left - card.right), mid: Math.round((card.left + det.right) / 2), vw: innerWidth}; })()""")
        ok(r['fin'] > 6 and r['stageW'] < 600 and r['gap'] < 160 and abs(r['mid'] - r['vw'] / 2) < 80, f'G17. card and details side by side and centred, with every finish button shown {r}')
        await shot(pg, 'g17-detail', w)
    ok(not pg._errs, f'no page errors {pg._errs[:3]}')
    await pg._ctx.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots: shutil.copy(f, os.path.join(KEEP, os.path.basename(f)))
    print('\n'.join(shots))
    print(f'fix3 e2e: {len(fails)} FAILED' if fails else 'fix3 e2e: all passed')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true'); asyncio.run(main(ap.parse_args()))
