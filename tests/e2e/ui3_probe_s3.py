import asyncio, os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pl2_2026_10_25 as P
from playwright.async_api import async_playwright

async def go(b, url, w, scroll):
    pg = await P.page(b, url, w)
    await pg.evaluate("""(async()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
      ['0-1','0-2'].forEach(k=> completeConquestNode({mapId:'m1', nodeId:k, kind:'skirmish'}, 'A')); })()""")
    await pg.evaluate("(()=>{ conquestWorldView = false; conquestSelectedMap = 'm1'; conquestSelectedNodeKey = null; playSubTab = 'conquest'; window.__trk=[]; "
        "const t=()=>{ document.querySelectorAll('.res3-rank-fly').forEach(e=>{ const r=e.getBoundingClientRect(); window.__trk.push([Math.round(performance.now()), Math.round(r.left), Math.round(r.top)]); }); requestAnimationFrame(t); }; t(); switchTab('play'); })()")
    if scroll:
        await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const c=document.getElementById('conquestMain'); if(c) c.scrollTop = 140; window.scrollTo(0, 120); })()")
    await pg.wait_for_timeout(22000)
    trk = await pg.evaluate("window.__trk")
    info = await pg.evaluate("({H: innerHeight, W: innerWidth, sy: scrollY, has: !!document.getElementById('conquestCanvas')})")
    print(w, scroll, info, len(trk), trk[::max(1, len(trk)//10)])
    await pg._ctx.close()

async def main():
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME if os.path.exists(P.CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in (390,):
            for sc in (False,):
                await go(b, url, w, sc)
        await b.close()
    httpd.shutdown()
asyncio.run(main())
