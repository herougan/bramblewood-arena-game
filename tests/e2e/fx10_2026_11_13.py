#!/usr/bin/env python3
"""Package FX10 (2026-11-13, owner 00:03): the ten skill looks in a real fight, fired through the game's renderVfxForEvent with the event the engine
sends, as frames (slow motion, labelled with effect time) and one contact sheet, docs/art/fx10-sheet.png (1366 px; --sheet-390 for the phone's).

    python3 tests/e2e/fx10_2026_11_13.py                  # all ten at 1366 and 390 (the sheet from 1366)
    python3 tests/e2e/fx10_2026_11_13.py --only snow burn --widths 390

Checks: no page errors, every piece gone afterwards, at most 8 pieces a card, the host in the camera layer, Effects Low and 4x speed one piece only,
Effects None no piece (the cue still plays), Brood without the shared summon ring, Confuse without the Stun orbit. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, io
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
fails = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

# a fight whose board is exactly these units, the CPU kept from acting (as tests/e2e/fx9_2026_11_13.py); keys '<pid>:<slot>'
BOARD = """(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, [['otter-kit', -1], ['grizzly-vanguard', 0], ['mangrove-mudskipper', 1]]); put(2, [['wolf-spider-mother', -1], ['beaver-lumberjack', 0], ['ossuary-lammergeier', 1]]);
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1200)); window.__u = uids; return uids; })()"""
U = lambda k: f"window.__u['{k}']"
# name, title, event (page JS object literal), the card(s) to frame, frame times (ms of effect time)
FX = [
  ('snow', 'Avalanche: snowed under (+1 Wait)', f"{{type:'statusFx', kind:'avalancheWait', side:'B', attUid:{U('2:0')}, attDefId:'beaver-lumberjack', targetSide:'A', targetUid:{U('1:0')}, targetDefId:'grizzly-vanguard', amount:1}}", ['1:0'], [120, 300, 520, 820]),
  ('ignite', 'Ignite: Burn takes hold', f"{{type:'statusFx', kind:'en20Ignite', side:'A', attUid:{U('1:0')}, attDefId:'grizzly-vanguard', targetSide:'A', targetUid:{U('1:0')}, targetDefId:'grizzly-vanguard', amount:1, total:1, fresh:true}}", ['1:0'], [100, 250, 450, 700]),
  ('burn', "Burn's tick", f"{{type:'burnTick', side:'A', defId:'grizzly-vanguard', uid:{U('1:0')}, dmg:1, left:1}}", ['1:0'], [160, 300, 480, 700]),
  ('spent', 'A once-only skill is used up', f"{{type:'skillSpent', side:'B', uid:{U('2:0')}, defId:'beaver-lumberjack', keys:['delivery']}}", ['2:0'], [60, 200, 380, 600]),
  ('brood', 'Brood: a spiderling let down on silk', f"{{type:'spawn', kind:'brood', cause:'triggerSpawn', side:'B', defId:'wolf-spider-mother', count:1, uids:[{U('2:1')}], lane:'right', nearUid:{U('2:-1')}}}", ['2:-1', '2:1'], [260, 520, 760, 980]),
  ('confuse', 'Confuse: the mimicked calls', f"{{type:'statusFx', kind:'confuse', side:'B', attUid:{U('2:0')}, attDefId:'beaver-lumberjack', targetSide:'A', targetUid:{U('1:-1')}, targetDefId:'otter-kit'}}", ['1:-1'], [150, 380, 620, 880]),
  ('carrion', 'Carrion: it feeds on the fallen', f"{{type:'statusFx', kind:'carrion', side:'B', attUid:{U('2:1')}, attDefId:'ossuary-lammergeier', targetSide:'B', targetUid:{U('2:1')}, targetDefId:'ossuary-lammergeier', amount:2, fromUid:{U('1:1')}}}", ['2:1', '1:1'], [150, 380, 600, 760]),
  ('delivery', 'Delivery: a crate drops in', f"{{type:'lumber', side:'B', defId:'beaver-lumberjack', uid:{U('2:0')}, amount:1, cause:'delivery'}}", ['2:0'], [150, 280, 470, 620]),
  ('skitter', 'Skitter: Quick and Evasive next round', f"{{type:'statusFx', kind:'skitter', side:'A', attUid:{U('1:1')}, attDefId:'mangrove-mudskipper', targetUid:{U('1:1')}, targetDefId:'mangrove-mudskipper', amount:1}}", ['1:1'], [120, 260, 420, 620]),
  ('playdead', 'Thanatosis: it plays dead', f"{{type:'statusFx', kind:'thanatosis', side:'A', attUid:{U('1:0')}, attDefId:'grizzly-vanguard', targetSide:'A', targetUid:{U('1:0')}, targetDefId:'grizzly-vanguard'}}", ['1:0'], [150, 420, 650, 950]),
]
PIECES = "document.querySelectorAll('.fx10').length"
RATE = 0.06  # frames in slow motion (WAAPI, CSS, timers and GSAP at this rate); labels are the effect's own time

async def slow(pg, on):
    cdp = getattr(pg, '_cdp', None)
    if cdp is None:
        cdp = pg._cdp = await pg.context.new_cdp_session(pg); await cdp.send('Animation.enable')
    await cdp.send('Animation.setPlaybackRate', {'playbackRate': RATE if on else 1})
    await pg.evaluate("""([on, R])=>{ if(on){ if(!window.__f10st){ const st = window.__f10st = window.setTimeout; window.setTimeout = (f, ms, ...a)=> st(f, (ms || 0) / R, ...a); } if(window.gsap) gsap.globalTimeline.timeScale(R); }
      else { if(window.__f10st){ window.setTimeout = window.__f10st; window.__f10st = null; } if(window.gsap) gsap.globalTimeline.timeScale(1); } }""", [on, RATE])

async def clip_of(pg, keys, pad):
    r = await pg.evaluate("([ks, pad])=>{ const rs = ks.map(k=> boardCardEl(window.__u[k])).filter(Boolean).map(e=> e.getBoundingClientRect()); if(!rs.length) return null;"
                          " const l = Math.min(...rs.map(r=> r.left)) - pad, t = Math.min(...rs.map(r=> r.top)) - pad, R = Math.max(...rs.map(r=> r.right)) + pad, B = Math.max(...rs.map(r=> r.bottom)) + pad;"
                          " return {x: Math.max(0, l), y: Math.max(0, t), width: Math.min(innerWidth, R) - Math.max(0, l), height: Math.min(innerHeight, B) - Math.max(0, t)}; }", [keys, pad])
    return r

async def fresh(b, url, w, level='high'):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP + f"localStorage.setItem('bramblewood_fx_level', '{level}');")
    await pg.goto(url, wait_until='domcontentloaded', timeout=180000); await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=180000); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()"); await pg.evaluate(BOARD)
    return pg

async def gone(pg, label):
    n = await pg.evaluate(PIECES); k = 0
    while n and k < 140: await pg.wait_for_timeout(250); n = await pg.evaluate(PIECES); k += 1  # the hosts' timers were set in slow motion
    ok(n == 0, f'{label}: every piece is gone afterwards ({n} left)')

async def run(b, url, w, only, rows):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    for name, title, ev, keys, times in FX:
        if only and name not in only: continue
        clip = await clip_of(pg, keys, 46 if w < 700 else 70)
        await pg.evaluate("window.__f10max = 0; window.__f10cam = 0; const per = new Map(); window.__f10mo && window.__f10mo.disconnect(); window.__f10mo = new MutationObserver(list=> list.forEach(m=> m.addedNodes.forEach(x=>{"
                          " if(!x.classList || !x.classList.contains('fx10')) return; const h = x.parentElement; per.set(h, (per.get(h) || 0) + 1); window.__f10max = Math.max(window.__f10max, per.get(h)); if(h && h.parentElement && h.parentElement.id === 'battlefieldInner') window.__f10cam++; })));"
                          " window.__f10mo.observe(document.body, {childList:true, subtree:true});"
                          " window.__f10ring = 0; window.__f10orbit = 0; const sp = SkillFX.summonPortal, ss = SkillFX.stunStars; SkillFX.summonPortal = function(){ window.__f10ring++; return sp.apply(this, arguments); }; SkillFX.stunStars = function(){ window.__f10orbit++; return ss.apply(this, arguments); }; window.__f10sp = [sp, ss];")
        await slow(pg, True)
        await pg.evaluate(f"(()=>{{ window.__f10t0 = performance.now(); renderVfxForEvent({ev}); }})()")
        shots = []
        for t in times:
            now = await pg.evaluate("R=> (performance.now() - window.__f10t0) * R", RATE)
            if t > now: await pg.wait_for_timeout((t - now) / RATE)
            at = await pg.evaluate("R=> Math.round((performance.now() - window.__f10t0) * R)", RATE)
            shots.append((at, await pg.screenshot(clip=clip, animations='allow') if clip else await pg.screenshot(animations='allow')))
        await slow(pg, False)
        st = await pg.evaluate("(()=>{ window.__f10mo.disconnect(); SkillFX.summonPortal = window.__f10sp[0]; SkillFX.stunStars = window.__f10sp[1]; return {max: window.__f10max, cam: window.__f10cam, ring: window.__f10ring, orbit: window.__f10orbit}; })()")
        ok(1 <= st['max'] <= 8, f'{name} @ {w}: drawn, at most 8 pieces a card ({st["max"]})')
        ok(st['cam'] > 0, f'{name} @ {w}: its host rides the camera layer')
        if name == 'brood': ok(st['ring'] == 0, f'brood @ {w}: no shared summon ring ({st["ring"]})')
        if name == 'confuse': ok(st['orbit'] == 0, f'confuse @ {w}: no Stun orbit ({st["orbit"]})')
        await gone(pg, f'{name} @ {w}')
        if rows is not None: rows.append((title, [(a, Image.open(io.BytesIO(p)).convert('RGB')) for a, p in shots]))
    ok(not pg._errs, f'no page errors @ {w} {pg._errs[:2]}'); await pg.close()

async def calm_checks(b, url):
    # Effects Low, 4x speed: one still piece; Effects None: no piece, the cue still plays
    for level, speed, want, label in (('low', 1, 1, 'Effects Low'), ('high', 4, 1, '4x speed'), ('none', 1, 0, 'Effects None')):
        pg = await fresh(b, url, 1366, level)
        res = await pg.evaluate(f"""(async()=>{{ matchState.speedMult = {speed}; const cues = []; ['snowThump', 'igniteWhoosh', 'playDeadFlop'].forEach(k=>{{ const o = SoundKit[k]; SoundKit[k] = function(){{ cues.push(k); return o.apply(this, arguments); }}; }});
          const out = []; for(const ev of [{FX[0][2]}, {FX[1][2]}, {FX[9][2]}]){{ renderVfxForEvent(ev); const has = ()=> document.querySelector('.fx-float-host > .fx10'); for(let w = 0; w < 20 && !has(); w++) await new Promise(r=> setTimeout(r, 50)); await new Promise(r=> setTimeout(r, 60)); const hs = [...document.querySelectorAll('.fx-float-host')].filter(h=> h.querySelector(':scope > .fx10'));
            out.push(hs.length ? Math.max(...hs.map(h=> h.querySelectorAll(':scope > .fx10').length)) : 0); hs.forEach(h=> h.remove()); await new Promise(r=> setTimeout(r, 60)); }} return {{out, cues}}; }})()""")
        ok(all(n == want for n in res['out']), f'{label}: {want} piece(s) a look ({res["out"]})')
        ok(len(res['cues']) == 3, f'{label}: the cues play ({res["cues"]})')
        ok(not pg._errs, f'{label}: no page errors {pg._errs[:2]}'); await pg.close()

def sheet(rows, f, w):
    if not rows: return
    tw = 260 if w > 700 else 200; cols = max(len(r[1]) for r in rows); head = 30; lab = 22
    ths = [max(int(im.height * tw / im.width) for _, im in ims) for _, ims in rows]
    S = Image.new('RGB', (cols * tw + (cols + 1) * 6, head + sum(th + lab + 18 for th in ths) + 6), (28, 24, 20)); dr = ImageDraw.Draw(S)
    dr.text((8, 9), f'FX10: ten skill looks in a real fight @ {w}px (renderVfxForEvent with the engine\'s event; frames in slow motion, ms of effect time)', fill=(240, 230, 210))
    y = head
    for (title, ims), th in zip(rows, ths):
        dr.text((8, y + 2), title, fill=(255, 214, 120))
        for i, (at, im) in enumerate(ims):
            x = 6 + i * (tw + 6); S.paste(im.resize((tw, int(im.height * tw / im.width))), (x, y + lab)); dr.text((x + 2, y + lab + th + 3), f't = {at} ms', fill=(240, 220, 160))
        y += th + lab + 18
    os.makedirs(os.path.dirname(f), exist_ok=True); S.save(f, optimize=True); print('contact sheet:', os.path.relpath(f, ROOT))

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        for w in a.widths:
            rows = [] if (w == 1366 or (w == 390 and a.sheet_390)) else None
            await run(b, url, w, a.only, rows)
            if rows: sheet(rows, os.path.join(ROOT, 'docs', 'art', 'fx10-sheet.png' if w == 1366 else 'fx10-sheet-390.png'), w)
        if not a.only: await calm_checks(b, url)
        await b.close()
    httpd.shutdown()
    print(f'fx10 e2e: {len(fails)} failed' if fails else 'fx10 e2e: all checks passed'); return 1 if fails else 0

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', type=int, nargs='+', default=[1366, 390]); ap.add_argument('--only', nargs='*', default=[]); ap.add_argument('--sheet-390', action='store_true')
    sys.exit(asyncio.run(main(ap.parse_args())))
