#!/usr/bin/env python3
"""POLL1 (2026-11-17): counts timer / rAF fires per minute and network requests while the game sits idle.

    python3 tests/e2e/poll_probe.py [seconds_per_screen=20] [--net10] [--json out.json]   (table to stderr)

Wraps setInterval / setTimeout / requestAnimationFrame / fetch / XHR / WebSocket before the page loads; each timer is labelled
by the line in the script that created it. Screens: title, map, deck, battle (idle). --net10 fast-forwards 10 minutes with the
page clock (real time, NET_SECS env to shorten) and counts requests and timer fires.
"""
import asyncio, os, sys, json, threading, http.server, functools
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.environ.get('BW_ROOT') or os.path.abspath(os.path.join(HERE, '..', '..'))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
FLAGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]');"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
HOOK = r"""
(()=>{ const W = window; W.__p = {t:{}, net:[], on:true};
  const site = ()=>{ const s = (new Error().stack||'').split('\n').slice(3); for(const l of s){ const m = l.match(/([A-Za-z0-9_.-]+):(\d+):\d+\)?$/); if(m) return m[1] + ':' + m[2]; } return '?'; };
  const wrap = (name, kind)=>{ const o = W[name]; W[name] = function(fn, ms, ...a){ if(typeof fn !== 'function') return o.call(W, fn, ms, ...a); const k = kind + ' ' + site() + (kind==='int' ? ' @'+ms : '');
      const f = function(){ if(W.__p.on) W.__p.t[k] = (W.__p.t[k]||0)+1; return fn.apply(this, arguments); }; return o.call(W, f, ms, ...a); }; };
  wrap('setInterval','int'); wrap('setTimeout','to');
  const raf = W.requestAnimationFrame; W.requestAnimationFrame = function(fn){ const k = 'raf ' + site(); return raf.call(W, function(t){ if(W.__p.on) W.__p.t[k] = (W.__p.t[k]||0)+1; return fn(t); }); };
  const f0 = W.fetch; W.fetch = function(u, o){ if(W.__p.on) W.__p.net.push('fetch ' + String(u && u.url || u).replace(/\?.*/, '').slice(-70)); return f0.apply(W, arguments); };
  const x0 = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function(m, u){ if(W.__p.on) W.__p.net.push('xhr ' + String(u).replace(/\?.*/,'').slice(-70)); return x0.apply(this, arguments); };
  const WS = W.WebSocket; W.WebSocket = function(u, p){ if(W.__p.on) W.__p.net.push('ws ' + String(u).replace(/\?.*/,'').slice(0,60)); return new WS(u, p); }; W.WebSocket.prototype = WS.prototype; Object.assign(W.WebSocket, {CONNECTING:0,OPEN:1,CLOSING:2,CLOSED:3});
})();
"""
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    h = functools.partial(Q, directory=ROOT)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start(); return s
async def newpage(b, url, clock=False):
    ctx = await b.new_context(viewport={'width': 1366, 'height': 900}); pg = await ctx.new_page()
    pg.on('pageerror', lambda e: None)
    await pg.add_init_script(INIT); await pg.add_init_script(HOOK)
    if clock: await pg.clock.install()
    await pg.goto(url); return pg
async def window(pg, secs, clock=False):
    await pg.evaluate("__p.t = {}; __p.net = []; 1")
    if clock: await pg.clock.run_for(int(secs * 1000))
    else: await pg.wait_for_timeout(int(secs * 1000))
    return await pg.evaluate("({t: __p.t, net: __p.net})")
async def main():
    secs = float(next((a for a in sys.argv[1:] if not a.startswith('-') and a.replace('.', '').isdigit()), 20)); srv = serve(); url = f'http://127.0.0.1:{srv.server_port}/index.html'
    out = {'secs': secs}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=FLAGS)
        pg = await newpage(b, url)
        await pg.wait_for_timeout(9000)
        out['title'] = await window(pg, secs)
        await pg.evaluate("switchTab('home'); 1"); await pg.wait_for_timeout(2500); out['map'] = await window(pg, secs)
        await pg.evaluate("switchTab('deck'); 1"); await pg.wait_for_timeout(2500); out['deck'] = await window(pg, secs)
        await pg.evaluate("switchTab('play'); 1"); await pg.wait_for_timeout(1500)
        await pg.evaluate("try{ startMatch('ai', {standard:false}); }catch(e){ console.log(e) } 1"); await pg.wait_for_timeout(6000)
        out['battle_live'] = await pg.evaluate("!!matchState")
        out['battle'] = await window(pg, secs)
        await pg.close()
        if '--net10' in sys.argv:
            # real time (the page clock would also run every rAF frame): 10 minutes idle on the map, tab visible
            pg = await newpage(b, url); await pg.wait_for_timeout(9000); await pg.evaluate("switchTab('home'); 1"); await pg.wait_for_timeout(3000)
            out['net10'] = await window(pg, float(os.environ.get('NET_SECS', 600)))
        await b.close()
    for scr in ('title', 'map', 'deck', 'battle'):
        d = out[scr]; tot = sum(d['t'].values()) * 60 / secs
        print(f"== {scr}: {tot:.0f} fires/min, {len(d['net'])} requests in {secs}s" + (' (match live: %s)' % out['battle_live'] if scr == 'battle' else ''), file=sys.stderr)
        for k, v in sorted(d['t'].items(), key=lambda kv: -kv[1])[:14]: print(f"   {v*60/secs:7.1f}/min  {k}", file=sys.stderr)
        for n in sorted(set(d['net'])): print(f"   net {d['net'].count(n)}x {n}", file=sys.stderr)
    if 'net10' in out:
        d = out['net10']; print(f"== net10 (10 simulated minutes): {len(d['net'])} requests; timers {sum(d['t'].values())/10:.0f}/min", file=sys.stderr)
        for n in sorted(set(d['net'])): print(f"   net {d['net'].count(n)}x {n}", file=sys.stderr)
        for k, v in sorted(d['t'].items(), key=lambda kv: -kv[1])[:20]: print(f"   {v/10:7.1f}/min  {k}", file=sys.stderr)
    if '--json' in sys.argv: json.dump(out, open(sys.argv[sys.argv.index('--json') + 1], 'w'))
asyncio.run(main())
