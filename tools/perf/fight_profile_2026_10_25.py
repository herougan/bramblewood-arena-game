#!/usr/bin/env python3
"""Package FIX3 (2026-10-25, owner F3 "as swamp fever applies poison, the screen lags for 0.2s" and G26 "a few sharp lag periods"): profile one
whole fight headless. The page plays a Conquest fight on Auto (Admin Mode) and records every long animation frame (PerformanceObserver
'long-animation-frame': its length, how much of it was script and forced style/layout, which callbacks), the time spent in the page's render and
effect functions (renderVfxForEvent per event type, floatText, pushLog, renderBoard ...), and optionally a V8 CPU profile.

    python3 tools/perf/fight_profile_2026_10_25.py                          # Map 5 (Gatorback Swamp, Swamp Fever), 5-1, 1366 wide
    python3 tools/perf/fight_profile_2026_10_25.py --map mw --node 5-1 --cpuprofile /tmp/fight.cpuprofile --json /tmp/fight.json

Headless Chromium draws in software (--disable-gpu), on a shared machine: frame times are several times what a laptop shows, so compare runs
made back to back (same machine, same load), and read the shape (which functions, how many forced layouts), not the absolute milliseconds.
Build first."""
import argparse, asyncio, http.server, socketserver, threading, functools, json, os, sys, collections
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SETUP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
         "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
         "localStorage.setItem('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mtut:tutorial','mtut:tutorial2'], raidUnlocked:[], ranks:{}}));"
         "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.deckSizeOkOrWarn = ()=> true;"
         " saveEnergyState({current:40, lastRegenAt:Date.now()}); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
PROFILE = r"""async ([MAP, NODE, LIMIT])=>{
adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){}
const T = {}; const add = (k, d)=>{ const r = T[k] || (T[k] = {n:0, tot:0, max:0, over16:0}); r.n++; r.tot += d; if(d > r.max) r.max = d; if(d > 16) r.over16++; };
['renderBoard','renderHand','renderHUD','renderVfxForEvent','pushLog','renderPlay','floatText','poisonBubbleBurstVfx','leafPuff','clipLightsToBoard'].forEach(name=>{
  const f = window[name]; if(typeof f !== 'function') return;
  window[name] = function(){ const t0 = performance.now(); try{ return f.apply(this, arguments); } finally { const d = performance.now() - t0; add(name, d);
    if(name === 'renderVfxForEvent' && arguments[0]) add(name + ':' + arguments[0].type + (arguments[0].field ? '/' + arguments[0].field : ''), d); } }; });
const loaf = []; const po = new PerformanceObserver(l=> l.getEntries().forEach(e=>{ if(e.duration < 50) return;
  loaf.push({d: Math.round(e.duration), block: Math.round(e.blockingDuration || 0), round: matchState ? matchState.round : null,
    scripts: (e.scripts || []).filter(s=> s.duration >= 5).slice(0, 6).map(s=> ({fn: s.sourceFunctionName || '', inv: (s.invoker || '').slice(0, 40), d: Math.round(s.duration), forced: Math.round(s.forcedStyleAndLayoutDuration || 0)}))}); }));
try{ po.observe({type:'long-animation-frame', buffered:false}); }catch(e){}
switchTab('play'); startConquestMatch(MAP, NODE, {skipEnergyCost:true, noOpener:true, noAmbush:true});
await new Promise(r=> setTimeout(r, 3000));
const m = matchState; if(!m) return {err: 'no match'};
m.autoplay = true;
const t0 = performance.now();
while(performance.now() - t0 < LIMIT){ await new Promise(r=> setTimeout(r, 1000)); if(!matchState || matchState.over) break; }
po.disconnect();
const inFight = loaf.filter(x=> x.round > 1);
const forced = inFight.reduce((a, x)=> a + x.scripts.reduce((b, s)=> b + s.forced, 0), 0);
return {over: !!(matchState && matchState.over), rounds: m.round, secs: Math.round((performance.now() - t0) / 1000), longFrames: inFight.length,
  over100: inFight.filter(x=> x.d >= 100).length, over200: inFight.filter(x=> x.d >= 200).length, forcedLayoutMs: forced,
  worst: inFight.slice().sort((a, b)=> b.d - a.d).slice(0, 10),
  fns: Object.entries(T).map(([k, v])=> ({k, n: v.n, tot: Math.round(v.tot), avg: +(v.tot / v.n).toFixed(1), max: Math.round(v.max), over16: v.over16})).sort((a, b)=> b.tot - a.tot)}; }"""

def serve(root):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, *a): pass
    httpd = S(('127.0.0.1', 0), functools.partial(Q, directory=root))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

def cpu_summary(p, top=20):
    nodes = {n['id']: n for n in p['nodes']}; dt = collections.defaultdict(float); self_ = collections.defaultdict(float)
    for sid, d in zip(p['samples'], p['timeDeltas']): dt[sid] += d / 1000.0
    for nid, ms in dt.items(): cf = nodes[nid]['callFrame']; self_[(cf['functionName'] or '(anon)') + ' @' + str(cf['lineNumber'])] += ms
    return sorted(((round(v), k) for k, v in self_.items()), reverse=True)[:top]

async def main(a):
    httpd = serve(a.root); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--disable-gpu'])
        pg = await b.new_page(viewport={'width': a.width, 'height': 844 if a.width < 700 else 860}, has_touch=(a.width < 700))
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SETUP); await pg.goto(url); await pg.wait_for_timeout(3200)
        cdp = None
        if a.cpuprofile:
            cdp = await pg.context.new_cdp_session(pg); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {'interval': 500}); await cdp.send('Profiler.start')
        r = await pg.evaluate(PROFILE, [a.map, a.node, a.limit * 1000])
        if cdp:
            prof = (await cdp.send('Profiler.stop'))['profile']; json.dump(prof, open(a.cpuprofile, 'w')); r['cpuTop'] = cpu_summary(prof)
        r['pageErrors'] = errs[:5]
        await b.close()
    httpd.shutdown()
    if a.json: json.dump(r, open(a.json, 'w'), indent=1)
    print(f"fight {a.map} {a.node}: over={r.get('over')} rounds={r.get('rounds')} {r.get('secs')} s; long frames {r.get('longFrames')} (>=100 ms {r.get('over100')}, >=200 ms {r.get('over200')}); forced style/layout in long frames {r.get('forcedLayoutMs')} ms")
    print('worst frames (ms):', [w['d'] for w in r.get('worst', [])])
    for f in r.get('fns', [])[:16]: print('  ', f)
    for t in r.get('cpuTop', []): print('   cpu', t)
    if r.get('pageErrors'): print('page errors:', r['pageErrors'])

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--map', default='mw'); ap.add_argument('--node', default='5-1'); ap.add_argument('--width', type=int, default=1366)
    ap.add_argument('--limit', type=int, default=300, help='seconds'); ap.add_argument('--cpuprofile'); ap.add_argument('--json'); ap.add_argument('--root', default=ROOT)
    asyncio.run(main(ap.parse_args()))
