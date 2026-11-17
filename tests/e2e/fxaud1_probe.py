#!/usr/bin/env python3
"""FXAUD1 (2026-11-18): play every engine event (real samples from fxaud1_collect.js, else the literal shapes from fxaud1_synth.py) through the game's
renderVfxForEvent in a real fight board, and record per event: SoundKit cues called, WebAudio nodes made, DOM nodes / animations / GSAP tweens added,
sync main-thread ms, long tasks, worst frame gap, errors, and what is still on the page afterwards.

    python3 tests/e2e/fxaud1_probe.py [--cpu 1] [--only regex] [--ms 900] [--out docs/perf/fxaud1/probe-1x.json]
Run alone (no sims beside it). Needs index.html built, and docs/perf/fxaud1/event-samples.json + event-synth.json."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, json, re
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
FLAGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

BOARD = """(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {}, defs = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; defs[pid + ':' + slot] = id; });
  put(1, [['otter-kit', -1], ['grizzly-vanguard', 0], ['mangrove-mudskipper', 1]]); put(2, [['wolf-spider-mother', -1], ['beaver-lumberjack', 0], ['ossuary-lammergeier', 1]]);
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1200)); window.__u = uids; window.__d = defs; return uids; })()"""

# page-side: spies installed once, then window.__probe(ev, ms)
SPIES = r"""(()=>{
  window.__snd = []; window.__osc = 0; window.__src = 0; window.__errs = [];
  Object.keys(SoundKit).forEach(k=>{ const o = SoundKit[k]; if(typeof o !== 'function') return;
    SoundKit[k] = function(){ window.__snd.push(k); return o.apply(this, arguments); }; });
  // effect modules (FX.H ...) add their cues to SoundKit later and build them from SoundKit.prim: name each primitive call by its caller
  ['tone', 'noise', 'fnoise', 'sweep'].forEach(k=>{ const o = SoundKit.prim[k]; SoundKit.prim[k] = function(){ try{ const m = /at (?:[A-Za-z]+\.)?([A-Za-z0-9_$]+) \(/g; const st = new Error().stack.split('\n').slice(2, 6).map(l=>{ const x = /at (?:[A-Za-z]+\.)?([A-Za-z0-9_$<>]+)/.exec(l); return x ? x[1] : ''; }).filter(n=> n && !/^(tone|noise|fnoise|sweep|Object|anonymous|<anonymous>|CUES|S|P)$/.test(n)); window.__snd.push(st[0] || 'prim:' + k); }catch(e){} return o.apply(this, arguments); }; });
  const co = BaseAudioContext.prototype.createOscillator, cs = BaseAudioContext.prototype.createBufferSource;
  BaseAudioContext.prototype.createOscillator = function(){ window.__osc++; return co.apply(this, arguments); };
  BaseAudioContext.prototype.createBufferSource = function(){ window.__src++; return cs.apply(this, arguments); };
  window.addEventListener('error', e=> window.__errs.push(String(e.message)));
  window.__lt = []; try{ new PerformanceObserver(l=> l.getEntries().forEach(e=> window.__lt.push(Math.round(e.duration)))).observe({entryTypes:['longtask']}); }catch(e){}
  window.__added = []; // [key, element]
  window.__cur = null; window.__attr = 0;
  new MutationObserver(list=> list.forEach(m=>{ if(m.type === 'childList') m.addedNodes.forEach(n=>{ if(n.nodeType === 1) window.__added.push([window.__cur, n]); }); else window.__attr++; }))
    .observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['class','style','data-status']});
  window.__probe = async (key, ev, ms)=>{
    window.__cur = key; window.__snd.length = 0; window.__osc = 0; window.__src = 0; window.__errs.length = 0; window.__lt.length = 0; window.__attr = 0;
    const a0 = window.__added.length, an0 = document.getAnimations().length, gs0 = gsap.globalTimeline.getChildren(true, true, true).length;
    let peakAn = 0, peakGs = 0, maxGap = 0, last = performance.now(), run = true, frames = 0;
    const tick = ()=>{ const n = performance.now(); maxGap = Math.max(maxGap, n - last); last = n; frames++; if(run) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    const poll = setInterval(()=>{ peakAn = Math.max(peakAn, document.getAnimations().length - an0); peakGs = Math.max(peakGs, gsap.globalTimeline.getChildren(true, true, true).length - gs0); }, 40);
    // rAF can be starved on the shared 2-core box (frames seconds apart), and GSAP's clock rides rAF: pump it so delayed cues and tweens run on wall time
    gsap.ticker.lagSmoothing(0); const pump = setInterval(()=>{ try{ gsap.ticker.tick(); }catch(e){} }, 16);
    let err = null; const t0 = performance.now();
    try{ renderVfxForEvent(ev); }catch(e){ err = String(e && e.message || e); }
    const sync = performance.now() - t0;
    await new Promise(r=> setTimeout(r, ms)); run = false; clearInterval(poll); clearInterval(pump);
    const mine = window.__added.slice(a0);
    return {sync: +sync.toFixed(2), err, snd: [...new Set(window.__snd.filter(x=> x !== 'audioContext'))], osc: window.__osc, src: window.__src, added: mine.length, still: mine.filter(x=> x[1].isConnected).length,
      attr: window.__attr, peakAn, peakGs, maxGap: Math.round(maxGap), lt: window.__lt.slice(), frames, jserr: window.__errs.slice(),
      cls: [...new Set(mine.map(x=> (x[1].className && x[1].className.baseVal !== undefined ? x[1].className.baseVal : String(x[1].className || x[1].tagName)).split(' ').slice(0, 2).join('.')))].slice(0, 6)}; };
})()"""

def build_events(a):
    S = json.load(open(os.path.join(ROOT, 'docs/perf/fxaud1/event-samples.json')))['samples']
    Y = json.load(open(os.path.join(ROOT, 'docs/perf/fxaud1/event-synth.json')))
    ev = {}
    for k, v in S.items(): ev[k] = ('sample', v['ev'])
    for k, v in Y.items():
        kk = '|'.join(k.split('|')[:4]) if False else k
        base = [x for x in (v.get('type'), v.get('kind'), v.get('field'), v.get('element')) if x not in (None, 'x')]
        sk = '|'.join(str(x) for x in base)
        if sk in ev or k in ev: continue
        ev[sk] = ('synth', v)
    if a.only: ev = {k: v for k, v in ev.items() if re.search(a.only, k)}
    idle = {f'__idle{i}': ('synth', {'type': 'zzzNoop'}) for i in range(8)}
    return {**idle, **ev}

FIX = """(([ev, src])=>{ const u = window.__u, d = window.__d; const A = '1:', B = '2:'; const o = s=> s === 'A' ? 'B' : 'A'; const pid = s=> s === 'B' ? '2:' : '1:';
  const e = JSON.parse(JSON.stringify(ev)); const side = e.side || 'A', tside = e.targetSide || o(side);
  Object.keys(e).forEach(k=>{ const v = e[k]; const isU = /[uU]id$/.test(k), isUs = /[uU]ids$/.test(k);
    if(isU || isUs){ let sd = /^target/.test(k) ? tside : /^(from|near|other)/i.test(k) ? o(side) : side; const slot = /^(from|near|other)/i.test(k) ? '-1' : '0';
      const id = u[pid(sd) + slot] || u[pid(sd) + '0']; e[k] = isUs ? [id] : id; if(/^target/.test(k) && e.targetDefId !== undefined && src === 'synth') e.targetDefId = d[pid(sd) + slot]; }
    if(k === 'defId' && src === 'synth') e[k] = d[pid(side) + '0']; if(k === 'attDefId' && src === 'synth') e[k] = d[pid(side) + '0']; if(v === 'DEF') e[k] = d[pid(side) + '0']; });
  if(!e.side && src === 'synth') e.side = 'A'; return e; })"""

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    events = build_events(a); print(len(events), 'events', flush=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=FLAGS)
        pg = await b.new_page(viewport={'width': 1366, 'height': 860})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP + "localStorage.setItem('bramblewood_fx_level', '" + a.level + "'); localStorage.setItem('bw_musicVolume', '0'); localStorage.setItem('bramblewood_battle_music','off'); localStorage.setItem('bramblewood_calm_music','off');")
        await pg.goto(url, wait_until='domcontentloaded', timeout=180000); await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=180000); await pg.wait_for_timeout(1500)
        await pg.evaluate("(()=>{ " + OWN + " })()"); await pg.evaluate(BOARD); await pg.evaluate(SPIES)
        if a.hidden: await pg.evaluate("Object.defineProperty(document, 'hidden', {configurable: true, get: ()=> true}); document.dispatchEvent(new Event('visibilitychange'))")
        cdp = await pg.context.new_cdp_session(pg); await cdp.send('Performance.enable')
        if a.cpu != 1: await cdp.send('Emulation.setCPUThrottlingRate', {'rate': a.cpu})
        base = await pg.evaluate("document.body.getElementsByTagName('*').length")
        res = {}
        for i, (key, (src, ev)) in enumerate(events.items()):
            try:
                fixed = await pg.evaluate(FIX + "(" + json.dumps([ev, src]) + ")")
                m0 = {x['name']: x['value'] for x in (await cdp.send('Performance.getMetrics'))['metrics']}
                r = await pg.evaluate("([k, e, ms])=> window.__probe(k, e, ms)", [key, fixed, a.ms])
                m1 = {x['name']: x['value'] for x in (await cdp.send('Performance.getMetrics'))['metrics']}
                cpu_ms = {n: round((m1[c] - m0[c]) * 1000, 1) for n, c in (('task', 'TaskDuration'), ('script', 'ScriptDuration'), ('layout', 'LayoutDuration'), ('style', 'RecalcStyleDuration'))}
                r['from'] = src; r.update(cpu_ms); res[key] = r
            except Exception as ex:
                res[key] = {'from': src, 'err': 'harness: ' + str(ex)[:120]}
            if i % 40 == 0: print(i, key, flush=True)
        await pg.wait_for_timeout(9000)
        left = await pg.evaluate("""(()=>{ const out = {}; window.__added.forEach(([k, n])=>{ if(n.isConnected){ const c = (n.className && n.className.baseVal !== undefined ? n.className.baseVal : String(n.className || n.tagName)).split(' ').slice(0, 2).join('.'); (out[k] = out[k] || {})[c] = ((out[k] || {})[c] || 0) + 1; } }); return out; })()""")
        inf = await pg.evaluate("document.getAnimations().filter(x=> x.effect && x.effect.getComputedTiming().iterations === Infinity).length")
        tw = await pg.evaluate("gsap.globalTimeline.getChildren(true, true, true).length")
        now = await pg.evaluate("document.body.getElementsByTagName('*').length")
        out = {'cpu': a.cpu, 'baseNodes': base, 'endNodes': now, 'infiniteAnims': inf, 'gsapChildren': tw, 'leftovers': left, 'pageerrors': errs[:10], 'events': res}
        json.dump(out, open(os.path.join(ROOT, a.out), 'w'), indent=0)
        print('done', len(res), 'nodes', base, '->', now, 'pageerrors', len(errs)); await b.close()

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--cpu', type=float, default=1); ap.add_argument('--only'); ap.add_argument('--ms', type=int, default=900); ap.add_argument('--level', default='high'); ap.add_argument('--hidden', action='store_true')
    ap.add_argument('--out', default='docs/perf/fxaud1/probe-1x.json'); asyncio.run(main(ap.parse_args()))
