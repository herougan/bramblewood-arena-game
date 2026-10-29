#!/usr/bin/env python3
"""Package FLAIR1 (2026-10-28, owner 23:06): the Dragon Lair's final-boss flair, in the browser at 390 and 1366.
    python3 tests/e2e/flair1_2026_10_28.py [--keep]     # --keep copies the shots to docs/screens/flair1/
Map 20 entrance, the lair's last node, the opener banner (skippable), the title card, the battle's ember vignette (under the cards), the victory
banner; a normal boss gets none of it; reduced motion stills the animations. Build first. Exits 1 on a failed check."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'flair1')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} }catch(e){} });")
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
async def shot(pg, name, w):
    f = os.path.join(OUT, f'fl1-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); return f
async def run(b, url, w, reduced=False):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700), reduced_motion='reduce' if reduced else 'no-preference')
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(DONE); await pg.goto(url)
    await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    print(f'-- width {w}{" reduced motion" if reduced else ""}')
    await pg.evaluate("""(()=>{ const p = loadConquestProgress(), mains = mainConquestMaps(); const done = (m, k)=>{ const id = conquestNodeId(m.id, k); if(!p.completed.includes(id)) p.completed.push(id); };
      mains.slice(0, 20).forEach(m=> m.nodes.forEach(nd=> done(m, nd.key))); mains[20].nodes.forEach(nd=> done(mains[20], nd.key));
      const lair = CONQUEST_MAPS.find(x=> x.id === 'mx'); lair.nodes.forEach(nd=>{ if(nd.key !== '20-B-4') done(lair, nd.key); });
      saveConquestProgress(p); conquestWorldView = false; conquestSelectedMap = mains[20].id; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); })()""")
    await pg.wait_for_timeout(9000)
    ent = await pg.evaluate("(()=>{ const e = document.querySelector('[data-submap=\"mx\"]'); return e ? {lair: e.classList.contains('is-lair-final'), ring: !!e.querySelector('.fl1-entry-ring'), crown: !!e.querySelector('.fl1-entry-crown'), others: [...document.querySelectorAll('.map-subemblem[data-submap]')].filter(x=> x.dataset.submap !== 'mx' && x.classList.contains('is-lair-final')).length} : null; })()")
    ok(ent and ent['lair'] and ent['ring'] and ent['crown'] and ent['others'] == 0, f'entrance on Map 20 has the ring and crown, no other side map does {ent}')
    if not reduced:
        await pg.evaluate("(()=>{ const e = document.querySelector('[data-submap=\"mx\"]'); if(e) e.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(500)
        await shot(pg, 'entrance', w)
    await pg.evaluate("(()=>{ const e = document.querySelector('[data-submap=\"mx\"]'); if(e) e.click(); })()"); await pg.wait_for_timeout(3500)
    nd = await pg.evaluate("""(()=>{ const n = document.querySelector('.map-node.is-lair-final'); if(!n) return null; const cs = getComputedStyle(n);
      return {key: n.dataset.lkey, ring: !!n.querySelector('.fl1-node-ring'), crown: !!n.querySelector('.fl1-node-crown'), anim: cs.animationName, normalBossFlair: document.querySelectorAll('.map-node.is-lair-final').length}; })()""")
    ok(nd and nd['key'] == '20-B-4' and nd['ring'] and nd['crown'] and nd['normalBossFlair'] == 1, f'the lair map: only 20-B-4 has the molten ring and crown {nd}')
    if nd: ok((nd['anim'] == 'none') == reduced, f'node glow animation {"off" if reduced else "on"} {nd["anim"]}')
    if not reduced:
        await pg.evaluate("(()=>{ const e = document.querySelector('.map-node.is-lair-final'); if(e) e.scrollIntoView({block:'center', inline:'center'}); })()"); await pg.wait_for_timeout(500)
        await shot(pg, 'node', w)
    # the opener
    await pg.evaluate("(()=>{ adminModeEnabled = true; startConquestMatch('mx', '20-B-4', {skipEnergyCost:true}); })()"); await pg.wait_for_timeout(1900)
    op = await pg.evaluate("(()=>{ const o = document.querySelector('.vs-opener'); if(!o) return null; const b = o.querySelector('.fl1-banner'); return {lair: o.classList.contains('is-lair'), title: b && b.querySelector('.fl1-title').textContent, sub: b && b.querySelector('.fl1-sub').textContent, skip: !!o.querySelector('.vs-skip')}; })()")
    ok(op and op['lair'] and op['title'] == "The Dragon's Lair" and op['sub'] and op['skip'], f'opener: banner, subtitle, tap-to-skip {op}')
    if not reduced: await shot(pg, 'intro', w)
    await pg.evaluate("(()=>{ document.querySelector('.vs-opener').click(); })()"); await pg.wait_for_timeout(1100)
    ok(await pg.evaluate("!document.querySelector('.vs-opener')"), 'a tap skips the opener')
    tc = await pg.evaluate("(()=>{ const t = document.querySelector('.boss-title.is-lair'); return t ? t.textContent : null; })()")
    ok(tc and "Dragon" in tc, f'title card after the opener {tc}')
    if not reduced: await shot(pg, 'titlecard', w)
    await pg.wait_for_timeout(4200)
    v = await pg.evaluate("""(()=>{ const v = document.querySelector('.fl1-vignette'); if(!v) return null; const bf = document.querySelector('.battlefield'); const r = v.getBoundingClientRect(), br = bf.getBoundingClientRect();
      const cs = getComputedStyle(v); return {z: cs.zIndex, pe: cs.pointerEvents, inside: r.width <= br.width + 1, anim: cs.animationName}; })()""")
    ok(v and v['z'] == '-1' and v['pe'] == 'none' and v['inside'], f'ember vignette under the board, no pointer events {v}')
    if v: ok((v['anim'] == 'none') == reduced, f'vignette pulse {"off" if reduced else "on"}')
    if not reduced: await shot(pg, 'battle', w)
    # victory banner
    await pg.evaluate("(()=>{ const m = matchState; m.winner = 1; m.fightFirstClear = true; showEndSign(m); })()"); await pg.wait_for_timeout(1500)
    vs = await pg.evaluate("(()=>{ const s = document.querySelector('.fight-sign.end-lair'); return s ? s.textContent : null; })()")
    ok(vs and 'DRAGON FALLS' in vs and 'Map 0 to Map 20' in vs, f'victory banner {vs}')
    if not reduced: await shot(pg, 'victory', w)
    ok(not errs, f'no page errors {errs[:2]}')
    await ctx.close()
async def normal_boss(b, url):
    ctx = await b.new_context(viewport={'width': 1366, 'height': 860}); pg = await ctx.new_page(); await pg.add_init_script(DONE); await pg.goto(url)
    await pg.wait_for_function("typeof flairLairNode === 'function'", timeout=60000)
    r = await pg.evaluate("(()=>{ const bosses = CONQUEST_MAPS.flatMap(m=> m.nodes.filter(n=> baseKind(n.kind) === 'boss').map(n=> flairLairNode(m, n))); const lairs = CONQUEST_MAPS.filter(flairLairMap).map(m=> m.id); return {n: bosses.length, any: bosses.some(Boolean), lairs}; })()")
    ok(r['n'] > 5 and r['lairs'] == ['mx'], f'only map mx carries the flag {r}')
    ok(await pg.evaluate("(()=>{ const hits = CONQUEST_MAPS.flatMap(m=> m.nodes.filter(n=> flairLairNode(m, n)).map(n=> m.id + ':' + n.key)); return hits.join() === 'mx:20-B-4'; })()"), 'only mx 20-B-4 is a final-boss node')
    await ctx.close()
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--keep', action='store_true'); a = ap.parse_args()
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        await normal_boss(b, url)
        for w in (390, 1366): await run(b, url, w)
        await run(b, url, 390, reduced=True)
        await b.close()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for n in sorted(os.listdir(OUT)):
            if n.startswith('fl1-'): shutil.copy(os.path.join(OUT, n), os.path.join(KEEP, n))
    print('FAILED' if fails else 'ALL PASSED', len(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
