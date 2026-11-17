#!/usr/bin/env python3
"""FXAUD1: main-thread CPU of a fight board standing still (hand drawn, nothing happening), with the always-on CSS loops as shipped vs with one family paused.
    python3 tests/e2e/fxaud1_loops.py [--reps 3]   -> docs/perf/fxaud1/loops.json
CPU time (Performance.getMetrics TaskDuration / ScriptDuration / RecalcStyle / Layout) over 4 s, at 1x and 4x CPU slowdown."""
import sys, asyncio, json, os, statistics, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fxaud1_probe as P
from playwright.async_api import async_playwright
ROOT = P.ROOT
VARIANTS = {
  'shipped': '',
  'no-elitePolish': '.card-tile.elite-polish::after{animation:none !important;}',
  'no-idleBreathe': '.card-tile{animation:none !important;}',
  'no-css-loops': '*, *::before, *::after{animation:none !important;}',
}
async def metrics(cdp):
    return {x['name']: x['value'] for x in (await cdp.send('Performance.getMetrics'))['metrics']}
async def one(b, url, css, rate):
    pg = await b.new_page(viewport={'width': 1366, 'height': 860})
    await pg.add_init_script(P.SKIP + "localStorage.setItem('bramblewood_fx_level','high');localStorage.setItem('bw_musicVolume','0');")
    await pg.goto(url, wait_until='domcontentloaded', timeout=180000); await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=180000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + P.OWN + " })()"); await pg.evaluate(P.BOARD)
    await pg.evaluate("""(()=>{ const m = matchState; document.querySelectorAll('.card-tile').forEach((t, i)=>{ if(i % 2 === 0) t.classList.add('elite-polish'); }); })()""")
    if css: await pg.add_style_tag(content=css)
    await pg.wait_for_timeout(6000)
    cdp = await pg.context.new_cdp_session(pg); await cdp.send('Performance.enable')
    if rate != 1: await cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
    a = await metrics(cdp); await pg.wait_for_timeout(4000); z = await metrics(cdp)
    n = await pg.evaluate("document.querySelectorAll('.card-tile.elite-polish').length")
    await pg.close()
    return {k: round((z[c] - a[c]) * 1000) for k, c in (('task', 'TaskDuration'), ('script', 'ScriptDuration'), ('style', 'RecalcStyleDuration'), ('layout', 'LayoutDuration'))} | {'elite': n}
async def main(reps):
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'; out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME, args=P.FLAGS)
        for rate in (1, 4):
            for name, css in VARIANTS.items():
                rs = [await one(b, url, css, rate) for _ in range(reps)]
                out[f'{name}@{rate}x'] = {'task_ms_median': statistics.median(r['task'] for r in rs), 'runs': [r['task'] for r in rs], 'style': statistics.median(r['style'] for r in rs), 'elite': rs[0]['elite']}
                print(name, rate, out[f'{name}@{rate}x'], flush=True)
        await b.close()
    json.dump(out, open(os.path.join(ROOT, 'docs/perf/fxaud1/loops.json'), 'w'), indent=1)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--reps', type=int, default=3); asyncio.run(main(ap.parse_args().reps))
