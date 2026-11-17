#!/usr/bin/env python3
"""FXAUD1: play single events and list what is still on the page N seconds later (the leak candidates from probe-1x.json's `leftovers`).
    python3 tests/e2e/fxaud1_leftover.py fortify pierceHQ ... [--secs 14]"""
import sys, asyncio, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fxaud1_probe as P
from playwright.async_api import async_playwright
JS = """async([key, ev, secs])=>{ window.__added.length = 0; window.__cur = key; gsap.ticker.lagSmoothing(0); const pump = setInterval(()=>{ try{ gsap.ticker.tick(); }catch(e){} }, 16);
  const before = document.body.getElementsByTagName('*').length; renderVfxForEvent(ev); await new Promise(r=> setTimeout(r, secs * 1000)); clearInterval(pump);
  const keep = window.__added.filter(([k, n])=> n.isConnected).map(([k, n])=> ({cls: String(n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className || n.tagName).slice(0, 50), text: (n.textContent || '').slice(0, 24), parent: n.parentElement ? (n.parentElement.id || String(n.parentElement.className).slice(0, 40)) : '', vis: n.getBoundingClientRect().width > 0}));
  return {before, after: document.body.getElementsByTagName('*').length, keep: keep.slice(0, 8), n: keep.length}; }"""
async def main(keys, secs):
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    class A: only = None
    ev = P.build_events(A)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME, args=P.FLAGS)
        pg = await b.new_page(viewport={'width': 1366, 'height': 860})
        await pg.add_init_script(P.SKIP + "localStorage.setItem('bramblewood_fx_level','high');localStorage.setItem('bw_musicVolume','0');")
        await pg.goto(url, wait_until='domcontentloaded', timeout=180000); await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=180000); await pg.wait_for_timeout(1500)
        await pg.evaluate("(()=>{ " + P.OWN + " })()"); await pg.evaluate(P.BOARD); await pg.evaluate(P.SPIES)
        for k in keys:
            src, e = ev[k]; fixed = await pg.evaluate(P.FIX + "(" + json.dumps([e, src]) + ")")
            r = await pg.evaluate(JS, [k, fixed, secs]); print(k, json.dumps(r)[:700], flush=True)
        await b.close()
if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; secs = 14
    if '--secs' in sys.argv: secs = int(sys.argv[sys.argv.index('--secs') + 1]); args = [a for a in args if a != str(secs)]
    asyncio.run(main(args, secs))
