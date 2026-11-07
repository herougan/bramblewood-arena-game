#!/usr/bin/env python3
"""ENG35 (2026-11-07) browser check at 1366 and 390: the admin Map cards window's skill tiles are one line (icon, name, pills), and hovering or
focusing a tile opens the parameters window (what it does, Default / Stat version / Ability version / Parameters / Delivery). A fused card's
twin keys are one tile. The fused cards play as before in the page (the build hands it flat cards: the card-data hash is unchanged).
    python3 tests/e2e/eng35_2026_11_07.py      (build first; writes docs/screens/eng35/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'eng35'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
fails = []
def ok(c, m):
    print(('  ok ' if c else '  x ') + m)
    if not c: fails.append(m)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h

def E(body): return "(async()=>{ " + body + " })()"

async def run(p, url, w, hgt):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    pg = await b.new_page(viewport={'width': w, 'height': hgt})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
    # a map whose cards include a fused skill (Crepuscular: Nightjar Drifter) if one lists it, else Map 2
    mid = await pg.evaluate("""(()=>{ try{ const ids = mainConquestMaps().map(m=> m.id); for(const id of ids){ const s = mapPoolSections(id); if(s.some(x=> (x.ids || []).includes('nightjar-drifter'))) return id; } }catch(e){} return 'm2'; })()""")
    await pg.evaluate(E(f"adminModeEnabled = true; pk1OpenMapCards('{mid}'); await new Promise(r=> setTimeout(r, 1500)); return 1;"))
    r = await pg.evaluate("""(()=>{ const ts = [...document.querySelectorAll('#ui19McSkills .ui19-sk[data-eng35-key]')];
      const tall = ts.map(t=> t.getBoundingClientRect().height), keys = ts.map(t=> t.dataset.eng35Key);
      return {n: ts.length, maxH: Math.max(0, ...tall), small: document.querySelectorAll('#ui19McSkills .ui19-sk small').length, titled: ts.filter(t=> t.hasAttribute('title')).length,
        dup: keys.length - new Set(keys).size, twin: keys.filter(k=> /Grant$|Hp$/.test(k)).length, keys: keys.slice(0, 40)}; })()""")
    print(f'   {w}: map {mid}', json.dumps(r)[:400])
    ok(r['n'] > 5, f'{w}: the skills section has tiles ({r["n"]})')
    ok(r['small'] == 0 and r['titled'] == 0, f'{w}: no text line and no native title on a tile')
    ok(r['maxH'] <= 26, f'{w}: every tile is one line (tallest {r["maxH"]:.0f}px)')
    ok(r['dup'] == 0 and r['twin'] == 0, f'{w}: one tile per fused skill (no Grant / Hp tile)')
    key = 'crepuscular' if 'crepuscular' in r['keys'] else r['keys'][0]
    sel = f'#ui19McSkills .ui19-sk[data-eng35-key="{key}"]'
    await pg.evaluate(f"document.querySelector('{sel}').scrollIntoView({{block:'center'}})")
    await pg.hover(sel); await pg.wait_for_timeout(300)
    t = await pg.evaluate("""(()=>{ const t = document.getElementById('eng35SkTip'); if(!t || t.hidden) return null; const r = t.getBoundingClientRect();
      return {text: t.innerText, l: r.left, r: r.right, top: r.top, b: r.bottom, vw: innerWidth, vh: innerHeight}; })()""")
    print(f'   {w}: tooltip for {key}:', json.dumps(t, ensure_ascii=False)[:600])
    ok(t is not None, f'{w}: hovering a tile opens the window')
    if t:
        ok('Default' in t['text'] and 'Delivery' in t['text'] and 'Parameters' in t['text'], f'{w}: the window shows Default, Parameters and Delivery')
        if key == 'crepuscular':
            ok('Stat version' in t['text'] and 'Ability version' in t['text'] and 'night' in t['text'], f'{w}: Crepuscular shows its stat and ability versions')
        ok(t['l'] >= 0 and t['r'] <= t['vw'] and t['top'] >= 0 and t['b'] <= t['vh'] + 1, f'{w}: the window stays inside the screen')
    await pg.screenshot(path=os.path.join(OUT, f'mapcards-tooltip-{w}.png'))
    await pg.mouse.move(2, 2); await pg.wait_for_timeout(200)
    hid = await pg.evaluate("(()=>{ const t = document.getElementById('eng35SkTip'); return !t || t.hidden; })()")
    ok(hid, f'{w}: the window closes when the pointer leaves')
    await pg.focus(sel); await pg.wait_for_timeout(200)
    foc = await pg.evaluate("(()=>{ const t = document.getElementById('eng35SkTip'); return !!t && !t.hidden; })()")
    ok(foc, f'{w}: keyboard focus opens it too')
    # the owner's example: Crepuscular (on no map list today, so a tile for it is added the way the section builds one)
    await pg.evaluate("""(()=>{ const ul = document.querySelector('#ui19McSkills .ui19-sk-list'); const li = document.createElement('li'); li.className = 'ui19-sk';
      li.innerHTML = '<span class="ui19-sk-ico">' + (SKILL_ICON.crepuscular || '•') + '</span><span class="ui19-sk-main"><b>' + skillDefOf('crepuscular').label + '</b></span>';
      const tmp = document.createElement('div'); tmp.innerHTML = '<i ' + eng35TileAttrs('crepuscular', 'Crepuscular', ui19McSkillText({key: 'crepuscular', fx: {crepuscular: true}}), 'example') + '></i>';
      [...tmp.firstChild.attributes].forEach(a=> li.setAttribute(a.name, a.value)); ul.prepend(li); li.scrollIntoView({block: 'center'}); })()""")
    await pg.hover('#ui19McSkills .ui19-sk[data-eng35-key="crepuscular"]'); await pg.wait_for_timeout(300)
    ct = await pg.evaluate("(()=>{ const t = document.getElementById('eng35SkTip'); return t && !t.hidden ? t.innerText : ''; })()")
    print(f'   {w}: Crepuscular:', json.dumps(ct, ensure_ascii=False)[:500])
    ok('Stat version' in ct and 'day [1, 0]' in ct and 'Ability version' in ct and 'Evasive' in ct, f'{w}: Crepuscular shows its default, stat and ability versions')
    await pg.screenshot(path=os.path.join(OUT, f'mapcards-crepuscular-{w}.png'))
    ok(not errs, f'{w}: no page errors ({errs[:2]})')
    await b.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        await run(p, url, 1366, 860)
        await run(p, url, 390, 844)
    h.shutdown()
    print('eng35 e2e:', 'FAIL' if fails else 'ok', len(fails))
    raise SystemExit(1 if fails else 0)

asyncio.run(main())
