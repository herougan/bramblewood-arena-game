#!/usr/bin/env python3
"""First-load probe (2026-11-19, package PERF6): the built index.html served over http with brotli (as Vercel serves it), a fresh visitor
(empty storage: the splash with the name field), in headless Chromium.

    python3 tests/e2e/boot_perf.py [--runs 3] [--net fast4g|none|both] [--cpu 1|4] [--trace]

Per run: bytes on the wire, first contentful paint, the time the loading screen lifts, the time the splash is interactive (shown,
with its name field / button), and the main-thread time of boot (CDP Performance TaskDuration / ScriptDuration: CPU time, steadier
than wall time on a busy box). --trace adds the top boot costs from a CPU profile. Fast 4G = 9 Mbps down, 170 ms RTT.
"""
import asyncio, os, sys, json, subprocess, time, statistics, argparse, signal
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
PORT = 8763
SERVER = r"""
const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const root=process.argv[1],port=+process.argv[2];const cache={};
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.css':'text/css','.woff2':'font/woff2','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const comp=new Set(['.html','.js','.json','.svg','.css']);
http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(root,u);
 if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 const ext=path.extname(f);const h={'Content-Type':T[ext]||'application/octet-stream','Cache-Control':'no-cache'};
 let b=cache[f]; if(!b){b=fs.readFileSync(f); if(comp.has(ext)&&b.length>1024) b=zlib.brotliCompressSync(b,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:5,[zlib.constants.BROTLI_PARAM_SIZE_HINT]:b.length}}); else b={raw:b}; cache[f]=b;}
 if(b.raw){r.writeHead(200,h);return r.end(b.raw);} h['Content-Encoding']='br';r.writeHead(200,h);r.end(b);}).listen(port);
"""
NETS = {'none': None, 'fast4g': {'offline': False, 'latency': 170, 'downloadThroughput': 9e6/8, 'uploadThroughput': 1.5e6/8}}
PROBE = """
window.__bw = {fcp:null, loaderDone:null, splashReady:null};
new PerformanceObserver(l=> l.getEntries().forEach(e=>{ if(e.name==='first-contentful-paint') window.__bw.fcp = e.startTime; })).observe({type:'paint', buffered:true});
(function poll(){ const t = performance.now();
  const L = document.getElementById('bwLoader'), S = document.getElementById('splashScreen');
  if(document.readyState !== 'loading' && !L && window.__bw.loaderDone===null) window.__bw.loaderDone = t;
  if(window.__bw.loaderDone!==null && S && !S.hidden && S.getClientRects().length && document.querySelector('#splashScreen input, #splashScreen button')){ window.__bw.splashReady = t; return; }
  setTimeout(poll, 20); })();
"""
async def one(b, net, cpu, trace, mobile=False, port=PORT):
    ctx = await b.new_context(viewport={'width': 390, 'height': 800} if mobile else {'width': 1366, 'height': 800}, has_touch=mobile, is_mobile=mobile)
    pg = await ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    cdp = await ctx.new_cdp_session(pg)
    await cdp.send('Network.enable'); await cdp.send('Performance.enable')
    wire = {'enc': 0, 'n': 0, 'cards': 0}
    def rq(p):
        if '/assets/cards/' in p['request']['url']: wire['cards'] += 1
    cdp.on('Network.requestWillBeSent', rq)
    def fin(p): wire['enc'] += p['encodedDataLength']; wire['n'] += 1
    cdp.on('Network.loadingFinished', fin)
    await cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
    if NETS[net]: await cdp.send('Network.emulateNetworkConditions', NETS[net])
    if cpu > 1: await cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
    await pg.add_init_script(PROBE)
    if mobile:  # Chrome on Android over mobile data: Network Information says cellular
        await pg.add_init_script("Object.defineProperty(navigator, 'connection', {get: ()=> ({type:'cellular', effectiveType:'4g', saveData:false, downlink:9, rtt:170, addEventListener(){}})});")
    if trace:
        await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 500}); await cdp.send('Profiler.start')
    await pg.goto(f'http://127.0.0.1:{port}/index.html', wait_until='commit')
    for _ in range(600):
        try: r = await pg.evaluate("window.__bw && window.__bw.splashReady")
        except Exception: r = None
        if r: break
        await asyncio.sleep(0.25)
    await asyncio.sleep(4.0)  # the first seconds after the splash: the art warm-up starts 1.5 s after load
    m = await pg.evaluate("window.__bw")
    nav = await pg.evaluate("(()=>{const n=performance.getEntriesByType('navigation')[0];return {dcl:n.domContentLoadedEventEnd,load:n.loadEventEnd,resp:n.responseEnd}})()")
    pm = {x['name']: x['value'] for x in (await cdp.send('Performance.getMetrics'))['metrics']}
    out = {'fcp': m['fcp'], 'loader': m['loaderDone'], 'splash': m['splashReady'], 'resp': nav['resp'], 'dcl': nav['dcl'],
           'task': pm['TaskDuration']*1000, 'script': pm['ScriptDuration']*1000, 'layout': pm['LayoutDuration']*1000, 'style': pm['RecalcStyleDuration']*1000,
           'wireMB': wire['enc']/1e6, 'cardReqs': wire['cards'], 'reqs': wire['n'], 'errs': len(errs)}
    await asyncio.sleep(12.0)  # and the first 16 s: the warm-up of the rest of the art
    out['wire16'] = wire['enc']/1e6; out['cards16'] = wire['cards']
    if trace:
        out['profile'] = (await cdp.send('Profiler.stop'))['profile']
    await ctx.close()
    return out
def top_costs(p, n=10):
    nodes = {x['id']: x for x in p['nodes']}; self_t = {}
    for sid, d in zip(p['samples'], p['timeDeltas']): self_t[sid] = self_t.get(sid, 0) + d
    parent = {}
    for x in p['nodes']:
        for c in x.get('children', []): parent[c] = x['id']
    key_of = lambda i: (nodes[i]['callFrame']['functionName'] or '(anon)', (nodes[i]['callFrame']['url'] or '').split('/')[-1], nodes[i]['callFrame']['lineNumber'] + 1)
    incl = {}; selfk = {}
    for sid, t in self_t.items():
        seen = set(); k = sid
        selfk[key_of(sid)] = selfk.get(key_of(sid), 0) + t
        while k:
            kk = key_of(k)
            if kk not in seen: incl[kk] = incl.get(kk, 0) + t; seen.add(kk)
            k = parent.get(k)
    skip = ('(root)', '(program)', '(idle)')
    A = sorted(((t/1000, k) for k, t in incl.items() if k[0] not in skip), reverse=True)[:n+3]
    B = sorted(((t/1000, k) for k, t in selfk.items() if k[0] not in skip), reverse=True)[:n]
    return A, B
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--runs', type=int, default=3); ap.add_argument('--net', default='both'); ap.add_argument('--cpu', type=int, default=1)
    ap.add_argument('--trace', action='store_true'); ap.add_argument('--mobile', action='store_true', help='390 px touch viewport, Network Information = cellular')
    ap.add_argument('--root', action='append', help='a folder with index.html (+ assets/ fonts/ art/); repeat it to compare builds: the runs are interleaved'); a = ap.parse_args()
    roots = a.root or [ROOT]
    srvs = [subprocess.Popen(['node', '-e', SERVER, os.path.abspath(r), str(PORT + k)]) for k, r in enumerate(roots)]; await asyncio.sleep(1.0)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=EXE, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
            for k in range(len(roots)): await one(b, 'none', 1, False, False, PORT + k)  # warm each server's compression cache
            for net in (['none', 'fast4g'] if a.net == 'both' else [a.net]):
                res = [[] for _ in roots]
                for _ in range(a.runs):
                    for k in range(len(roots)): res[k].append(await one(b, net, a.cpu, a.trace, a.mobile, PORT + k))
                for k, rs in enumerate(res):
                    def med(key):
                        v = [r[key] for r in rs if r[key] is not None]
                        return statistics.median(v) if v else -1
                    print(f"[{os.path.basename(os.path.abspath(roots[k]))}] {'mobile ' if a.mobile else ''}net={net} cpu={a.cpu}x runs={a.runs}: wire {med('wireMB'):.2f} MB ({med('reqs'):.0f} reqs, {med('cardReqs'):.0f} card art)  [16 s after splash: {med('wire16'):.2f} MB, {med('cards16'):.0f} card art]  fcp {med('fcp'):.0f} ms  loader lifts {med('loader'):.0f}  splash interactive {med('splash'):.0f}  html done {med('resp'):.0f}  | main-thread task {med('task'):.0f} ms  script {med('script'):.0f}  style {med('style'):.0f}  layout {med('layout'):.0f}  errs {rs[0]['errs']}")
                    print('   per run fcp/splash/task:', [(round(r['fcp'] or -1), round(r['splash'] or -1), round(r['task'])) for r in rs])
                    if a.trace:
                        A, B = top_costs(rs[0]['profile'])
                        print('   top boot costs (inclusive ms, CPU profile, run 1):'); [print(f'     {t:7.0f}  {kk[0]}  {kk[1]}:{kk[2]}') for t, kk in A]
                        print('   top self time:'); [print(f'     {t:7.0f}  {kk[0]}  {kk[1]}:{kk[2]}') for t, kk in B]
            await b.close()
    finally:
        for sv in srvs: sv.send_signal(signal.SIGTERM)
asyncio.run(main())
