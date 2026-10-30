#!/usr/bin/env python3
"""Package MAPFX1 (2026-10-31, owner X7): browser checks and screenshots at 1366 and 390 for the touchable map decor.

    python3 tests/e2e/mapfx1_2026_10_31.py            # checks + shots in tests/out/shots/mapfx1-*.png
    python3 tests/e2e/mapfx1_2026_10_31.py --widths 1366

Covers: a lit fire on a dark map goes out on a tap (flame class, the light pool shrinks to nothing, smoke, the "fsst" cue) and comes back on a
second tap; crystals ting and sparkle, water plops and ripples, bushes rustle and shake; none of these taps selects a node or opens a panel and
the nodes above the spots still take clicks; spam-clicking plays at most a handful of cues; trees sway (a transform that changes over time)
and the sway is gone with reduced motion and with Effects Low. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:20, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
SPY = """(()=>{ window.__cues = []; ['fireOut','fireIgnite','crystalTing','waterPlop','bushRustle'].forEach(n=>{ const o = SoundKit[n]; SoundKit[n] = function(){ window.__cues.push(n); return o.apply(this, arguments); }; }); })()"""
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page_in(ctx, url, pre=''):
    pg = await ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP + pre)
    await pg.goto(url); await pg.wait_for_function("typeof myDeckCounts !== 'undefined' && typeof switchTab === 'function'", timeout=60000); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " saveTutorial2Done(); saveTutorialDone(); })()")
    await pg.evaluate(SPY)
    return pg

async def ctx_for(b, w, **kw):
    return await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700), **kw)

async def shot(pg, name, w):
    await pg.add_style_tag(content='.toast, .toast-host, .levelup, .level-up, [class*="levelup"], [class*="level-up"], .milestone-pop{display:none !important;}')
    await pg.wait_for_timeout(250)
    f = os.path.join(OUT, f'mapfx1-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow', timeout=120000); shots.append(f); return f

async def open_map(pg, mid, clear=False):
    await pg.evaluate("""(([m, clear])=>{ if(clear){ const mp = CONQUEST_MAPS.find(x=> x.id === m), p = loadConquestProgress();
        mp.nodes.forEach(n=>{ const id = conquestNodeId(m, n.key); if(!p.completed.includes(id)) p.completed.push(id); }); saveConquestProgress(p); }
      conquestWorldView = false; conquestSelectedMap = m; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); })""", [mid, clear])
    await pg.wait_for_timeout(2800)
    if not getattr(pg, '_settled', False):
        pg._settled = True; await pg.wait_for_timeout(6000)

async def tap(pg, w, x, y):
    if w < 700: await pg.touchscreen.tap(x, y)
    else: await pg.mouse.click(x, y)

async def cues(pg):
    return await pg.evaluate("window.__cues.slice()")

async def clear_cues(pg):
    await pg.evaluate("window.__cues.length = 0; mfxState.last = 0; mfxState.stamps = []; mfxState.per = {};")

# a spot of one kind whose centre is on screen, inside the canvas and not covered by anything but its own spot
FIND = """((kind)=>{ const cv = document.getElementById('conquestCanvas'); const main = cv.closest('.conquest-main'); const mr = main.getBoundingClientRect(), out = [];
  cv.querySelectorAll('.mfx-hit.mfx-' + kind).forEach(el=>{ const r = el.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2;
    if(x < mr.left + 20 || x > mr.right - 20 || y < mr.top + 60 || y > Math.min(mr.bottom, innerHeight) - 90) return;
    const top = document.elementFromPoint(x, y); if(top === el) out.push({x, y}); });
  return out; })"""

async def run(b, url, w):
    print(f'-- width {w}')
    # --- a dark map, cleared: its fires are lit
    ctx = await ctx_for(b, w); pg = await page_in(ctx, url)
    await open_map(pg, 'm4', clear=True)
    st = await pg.evaluate("""(()=>{ const cv = document.getElementById('conquestCanvas'); return {fires: cv.querySelectorAll('.cave-fire').length, lit: cv.querySelectorAll('.cave-fire.is-lit').length,
      layer: !!cv.querySelector('.map-fx-layer'), crystals: cv.querySelectorAll('.mfx-crystal').length, water: cv.querySelectorAll('.mfx-water').length, pools: caveLightPools(cv, 0).length }; })()""")
    ok(st['lit'] >= 1 and st['layer'] and st['crystals'] > 10, f'a cleared dark map (Caves & Alcoves) has lit fires, the fx layer and crystals {st}')
    await shot(pg, 'cave-lit', w)
    # tap a lit fire
    fp = await pg.evaluate("(()=>{ const f = document.querySelector('#conquestCanvas .cave-fire.is-lit'); const r = f.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2}; })()")
    await clear_cues(pg)
    await tap(pg, w, fp['x'], fp['y']); await pg.wait_for_timeout(250)
    mid = await pg.evaluate("(()=>{ const f = document.querySelector('#conquestCanvas .cave-fire.is-out'); return {out: !!f, smoke: document.querySelectorAll('#conquestCanvas .mfx-smoke').length}; })()")
    ok(mid['out'] and mid['smoke'] > 0, f'a tap on a lit fire puts it out and puffs smoke {mid}')
    await shot(pg, 'fire-going-out', w)
    await pg.wait_for_timeout(900)
    after = await pg.evaluate("""(()=>{ const cv = document.getElementById('conquestCanvas'), f = document.querySelector('#conquestCanvas .cave-fire.is-out'), fl = f.querySelector('.cf-flame');
      return {lit: cv.querySelectorAll('.cave-fire.is-lit').length, out: cv.querySelectorAll('.cave-fire.is-out').length, flame: getComputedStyle(fl).opacity, glow: getComputedStyle(f.querySelector('.cf-glow')).opacity, pools: caveLightPools(cv, 0).length, cleared: document.querySelector('.conquest-node-panel') ? 'panel' : '', sel: conquestSelectedNodeKey }; })()""")
    ok(after['out'] == 1 and after['lit'] == st['lit'] - 1 and float(after['flame']) == 0 and float(after['glow']) == 0, f'the flame and glow are gone and the fire is not lit {after}')
    ok(after['pools'] == st['pools'] - 1, f'its light pool is gone from the darkness mask ({st["pools"]} -> {after["pools"]})')
    ok(after['sel'] is None, f'the tap selected no node {after}')
    ok((await cues(pg)) == ['fireOut'], f'one "fsst" cue played {await cues(pg)}')
    await shot(pg, 'fire-out', w)
    # tap it again: lit again
    await clear_cues(pg)
    await tap(pg, w, fp['x'], fp['y']); await pg.wait_for_timeout(3500)
    again = await pg.evaluate("""(()=>{ const cv = document.getElementById('conquestCanvas'); return {lit: cv.querySelectorAll('.cave-fire.is-lit').length, out: cv.querySelectorAll('.cave-fire.is-out').length, pools: caveLightPools(cv, 0).length}; })()""")
    ok(again['out'] == 0 and again['lit'] == st['lit'] and again['pools'] == st['pools'], f'a second tap lights it again {again}')
    ok((await cues(pg)) == ['fireIgnite'], f'the ignite cue played {await cues(pg)}')
    # a node beside a fire still takes the click (the fire's tap yields to anything interactive)
    nodeSel = await pg.evaluate("""(()=>{ const n = [...document.querySelectorAll('#conquestCanvas button.map-node:not(.map-node-hidden)')].find(n=>{ const r = n.getBoundingClientRect(); return r.top > 120 && r.bottom < innerHeight - 100 && r.width > 0; }); if(!n) return null; const r = n.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2, key: n.dataset.lkey}; })()""")
    if nodeSel:
        await clear_cues(pg)
        await tap(pg, w, nodeSel['x'], nodeSel['y']); await pg.wait_for_timeout(700)
        sel = await pg.evaluate("conquestSelectedNodeKey")
        ok(sel == nodeSel['key'], f'a node on the map still opens when tapped ({sel} == {nodeSel["key"]})')
        ok((await cues(pg)) == [], f'tapping a node plays none of the decor cues {await cues(pg)}')
    # crystals: ting + sparkle, and no node selected
    await open_map(pg, 'm4', clear=True)
    pts = await pg.evaluate(FIND + "('crystal')")
    ok(len(pts) >= 3, f'crystals on screen with nothing over them: {len(pts)}')
    if pts:
        await clear_cues(pg); sel0 = await pg.evaluate("conquestSelectedNodeKey")
        await tap(pg, w, pts[0]['x'], pts[0]['y']); await pg.wait_for_timeout(200)
        sp = await pg.evaluate("document.querySelectorAll('#conquestCanvas .map-fx-layer .crystal-sparkle').length")
        ok((await cues(pg)) == ['crystalTing'] and sp >= 1, f'a crystal tap plays a ting and sparkles ({await cues(pg)}, {sp} sparkles)')
        ok(await pg.evaluate("conquestSelectedNodeKey") == sel0, 'a crystal tap selects no node')
        await shot(pg, 'crystal', w)
        # spam: 30 crystal taps in a burst
        await clear_cues(pg)
        await pg.evaluate("""(()=>{ const hs = [...document.querySelectorAll('#conquestCanvas .mfx-crystal')]; for(let i = 0; i < 30; i++) hs[i % hs.length].click(); })()""")
        n = len(await cues(pg))
        ok(1 <= n <= 5, f'spam-clicking 30 crystals plays at most 5 cues ({n})')
        # sound off: the volume gate lives in the primitives, so the cue still runs; check the setting is read
        ok(await pg.evaluate("typeof SoundKit.crystalTing === 'function' && typeof SoundKit.waterPlop === 'function' && typeof SoundKit.bushRustle === 'function' && typeof SoundKit.fireOut === 'function'"), 'the four new cues exist on SoundKit')
    ok(not pg._errs, f'no page errors on the dark map {pg._errs[:2]}')
    await pg.close(); await ctx.close()

    # --- water and bushes (Sunken Hollow: m2 is a wetland), trees (Savanna: m5)
    ctx = await ctx_for(b, w); pg = await page_in(ctx, url)
    await open_map(pg, 'm2', clear=True)
    wp = await pg.evaluate(FIND + "('water')"); bp = await pg.evaluate(FIND + "('bush')")
    ok(len(wp) >= 1 and len(bp) >= 1, f'Sunken Hollow has water {len(wp)} and bushes {len(bp)} to tap')
    if wp:
        await clear_cues(pg); sel0 = await pg.evaluate("conquestSelectedNodeKey")
        await tap(pg, w, wp[0]['x'], wp[0]['y']); await pg.wait_for_timeout(250)
        rip = await pg.evaluate("document.querySelectorAll('#conquestCanvas .mfx-ripple').length")
        ok((await cues(pg)) == ['waterPlop'] and rip >= 1, f'a water tap plays a plop and ripples ({await cues(pg)}, {rip} rings)')
        ok(await pg.evaluate("conquestSelectedNodeKey") == sel0, 'a water tap selects no node')
        await shot(pg, 'water', w)
    if bp:
        await pg.wait_for_timeout(500); await clear_cues(pg); sel0 = await pg.evaluate("conquestSelectedNodeKey")
        bp = await pg.evaluate(FIND + "('bush')")
        dbg = await pg.evaluate("document.querySelector('#conquestCanvas .map-fx-layer') ? 'layer' : 'nolayer'")
        await tap(pg, w, bp[0]['x'], bp[0]['y']); await pg.wait_for_timeout(180)
        shake = await pg.evaluate("document.querySelectorAll('#conquestCanvas .mfx-shake').length + ':' + document.querySelectorAll('#conquestCanvas .mfx-leaf').length")
        ok((await cues(pg)) == ['bushRustle'] and shake.split(':')[0] == '1' and int(shake.split(':')[1]) >= 1, f'a bush tap rustles, shakes and drops leaves ({await cues(pg)}, {shake})')
        ok(await pg.evaluate("conquestSelectedNodeKey") == sel0, 'a bush tap selects no node')
        await shot(pg, 'bush', w)
    ok(not pg._errs, f'no page errors on the wetland {pg._errs[:2]}')
    # nodes sit above the spots: every node's centre hits the node, not a spot
    cover = await pg.evaluate("""(()=>{ let bad = 0, n = 0; document.querySelectorAll('#conquestCanvas button.map-node:not(.map-node-hidden)').forEach(el=>{ const r = el.getBoundingClientRect(); if(!r.width) return; n++;
      const t = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2); if(!t || (t !== el && !el.contains(t))) bad++; }); return {n, bad}; })()""")
    ok(cover['n'] > 0 and cover['bad'] == 0, f'every node on the map is on top of the spots under it {cover}')
    await pg.close(); await ctx.close()

    # --- trees sway
    ctx = await ctx_for(b, w); pg = await page_in(ctx, url)
    await open_map(pg, 'm5', clear=True)
    tr = await pg.evaluate("""(()=>{ const els = [...document.querySelectorAll('#conquestCanvas .mfx-sway')]; if(!els.length) return {n: 0};
      // a headless page may not tick its animation clock between two evaluates, so read the keyframes at two points of the cycle
      const at = (e, ms)=>{ const a = e.getAnimations()[0]; a.pause(); a.currentTime = ms; return getComputedStyle(e).transform; };
      const m = t=>{ const v = t.match(/matrix\(([^)]+)\)/); if(!v) return 0; const q = v[1].split(',').map(Number); return Math.atan2(q[1], q[0]) * 180 / Math.PI; };
      const e0 = els[0], lo = m(at(e0, 0)), hi = m(at(e0, parseFloat(getComputedStyle(e0).animationDuration) * 1000 * 0.999));
      const cs = getComputedStyle(els[0]); const run = els.map(e=> e.getAnimations()[0] && e.getAnimations()[0].animationName).filter(x=> x === 'mfxSway').length;
      const amps = els.map(e=> parseFloat(getComputedStyle(e).getPropertyValue('--sw')));
      return {n: els.length, lo: +lo.toFixed(2), hi: +hi.toFixed(2), name: cs.animationName, durs: [...new Set(els.map(e=> getComputedStyle(e).animationDuration))].length, minDur: Math.min(...els.map(e=> parseFloat(getComputedStyle(e).animationDuration))), maxDur: Math.max(...els.map(e=> parseFloat(getComputedStyle(e).animationDuration))),
        maxAmp: Math.max(...amps), minAmp: Math.min(...amps), origin: cs.transformOrigin, size: [cs.width, cs.height], pe: cs.pointerEvents, running: run}; })()""")
    ok(tr['n'] >= 5 and tr['lo'] < -0.5 and tr['hi'] > 0.5 and abs(tr['lo']) <= 1.01 and tr['durs'] >= 3 and 4 <= tr['minDur'] and tr['maxDur'] <= 7 and tr['pe'] == 'none', f'trees sway: +-0.6..1 degrees, 4-7 s, desynced, transform only, no pointer events {tr}')
    await shot(pg, 'trees', w)
    await pg.close(); await ctx.close()
    ctx = await ctx_for(b, w, reduced_motion='reduce'); pg = await page_in(ctx, url)
    await open_map(pg, 'm5', clear=True)
    n = await pg.evaluate("document.querySelectorAll('#conquestCanvas .mfx-sway').length")
    ok(n == 0, f'no tree sway with reduced motion ({n})')
    await pg.close(); await ctx.close()
    ctx = await ctx_for(b, w); pg = await page_in(ctx, url, "localStorage.setItem('bramblewood_fx_level','low');")
    await open_map(pg, 'm5', clear=True)
    n = await pg.evaluate("document.querySelectorAll('#conquestCanvas .mfx-sway').length")
    ok(n == 0, f'no tree sway with Effects Low ({n})')
    await pg.close(); await ctx.close()
    # reduced motion still lets a fire go out (a plain state change) and plays the cue
    ctx = await ctx_for(b, w, reduced_motion='reduce'); pg = await page_in(ctx, url)
    await open_map(pg, 'm4', clear=True)
    fp = await pg.evaluate("(()=>{ const f = document.querySelector('#conquestCanvas .cave-fire.is-lit'); if(!f) return null; const r = f.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2}; })()")
    if fp:
        await clear_cues(pg); await tap(pg, w, fp['x'], fp['y']); await pg.wait_for_timeout(300)
        r = await pg.evaluate("({out: document.querySelectorAll('#conquestCanvas .cave-fire.is-out').length, smoke: document.querySelectorAll('#conquestCanvas .mfx-smoke').length, pools: caveLightPools(document.getElementById('conquestCanvas'), 0).length})")
        ok(r['out'] == 1 and r['smoke'] == 0, f'with reduced motion the fire goes out at once, with no smoke {r}')
    await pg.close(); await ctx.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    print('shots:', *shots, sep='\n  ')
    print('FAILED: ' + '; '.join(fails) if fails else 'ALL OK'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366,390'); asyncio.run(main(ap.parse_args()))
