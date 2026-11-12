#!/usr/bin/env python3
"""Package FX9 (2026-11-13, owner notes 23:47): the effects in a real fight at 390 and 1366 px, as frames and contact sheets in docs/screens/fx9/.

    python3 tests/e2e/fx9_2026_11_13.py                  # all effects, both widths
    python3 tests/e2e/fx9_2026_11_13.py --only dragon --widths 390

Each effect plays on a fight board set up with the right units (the game's own functions: FX.A / FX.C as patched by fx9PatchFx, fx9GuardSync,
discardCardByUid ...); frames are taken one after another and labelled with the time since the effect started. Checks: no page errors, every
piece is gone afterwards, an Ambush host moves with its card while the camera pans, the Guardian's plates hide and show with Ready, the Zs are
readable at 390 px, the four dragon flights differ, the Stampede runs straight at the Health bar. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, io
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'fx9'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
fails = []; sheets = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP)
    await pg.goto(url, wait_until='domcontentloaded', timeout=180000); await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=180000); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

# a fight whose board is exactly the given units: [[defId, slot, hp?, extra?], ...] a side; the CPU is kept from acting (as tests/e2e/bl_2026_10_23.py)
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp, extra])=>{ const c = e.makeBoardCard(id); c.wait = 0; if(hp){ c.hp = c.maxHp = hp; } c.slot = slot; Object.assign(c, extra || {});
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1200)); window.__u = uids; return uids; })"""
EL = "(k=> boardCardEl(window.__u[k]))"
LEFT = "document.querySelectorAll('.fx9-host, .fx9-sky, .fx9-run, .ambush-echo-ring, .ui16-pitch-fly').length"

async def clip_of(pg, sel, pad_top=0):
    r = await pg.evaluate(f"(()=>{{ const e = document.querySelector({sel!r}); if(!e) return null; const r = e.getBoundingClientRect(); return {{x:r.left, y:r.top, w:r.width, h:r.height}}; }})()")
    if not r: return None
    vw = pg.viewport_size['width']; vh = pg.viewport_size['height']
    x = max(0, r['x'] - 4); y = max(0, r['y'] - 4 - pad_top); w = min(vw - x, r['w'] + 8); h = min(vh - y, r['h'] + 8 + pad_top)
    return {'x': x, 'y': y, 'width': w, 'height': h}

RATE = 0.06  # frames are taken in slow motion: every timer, CSS / WAAPI animation and GSAP tween runs at this rate while the frames are taken (a frame
             # can take a second on a busy box); the label is the effect's own time

async def slow(pg, on):
    cdp = getattr(pg, '_cdp', None)
    if cdp is None:
        cdp = pg._cdp = await pg.context.new_cdp_session(pg); await cdp.send('Animation.enable')
    await cdp.send('Animation.setPlaybackRate', {'playbackRate': RATE if on else 1})
    await pg.evaluate("""([on, R])=>{ if(on){ if(!window.__fx9st){ const st = window.__fx9st = window.setTimeout; window.setTimeout = (f, ms, ...a)=> st(f, (ms || 0) / R, ...a); } if(window.gsap) gsap.globalTimeline.timeScale(R); }
      else { if(window.__fx9st){ window.setTimeout = window.__fx9st; window.__fx9st = null; } if(window.gsap) gsap.globalTimeline.timeScale(1); } }""", [on, RATE])

async def frames(pg, name, w, trigger, times, sel='#battlefieldEl', pad_top=0, title=''):
    """Starts `trigger` (page JS) in slow motion, then takes a frame at (about) each effect time in ms; writes the contact sheet. Returns the frames' times."""
    clip = await clip_of(pg, sel, pad_top)
    await slow(pg, True)
    await pg.evaluate("(()=>{ window.__fx9t0 = performance.now(); " + trigger + " })()")
    shots = []
    for t in times:
        now = await pg.evaluate("R=> (performance.now() - window.__fx9t0) * R", RATE)
        if t > now: await pg.wait_for_timeout((t - now) / RATE)
        at = await pg.evaluate("R=> Math.round((performance.now() - window.__fx9t0) * R)", RATE)
        png = await pg.screenshot(clip=clip, animations='allow') if clip else await pg.screenshot(animations='allow')
        shots.append((at, png))
    await slow(pg, False)
    imgs = [(at, Image.open(io.BytesIO(p)).convert('RGB')) for at, p in shots]
    tw = 300 if w < 700 else 440; cols = 4 if len(imgs) > 6 else 3
    th = max(int(im.height * tw / im.width) for _, im in imgs)
    rows = (len(imgs) + cols - 1) // cols; head = 26
    sheet = Image.new('RGB', (cols * tw + (cols + 1) * 6, head + rows * (th + 22) + 6), (28, 24, 20))
    dr = ImageDraw.Draw(sheet); dr.text((8, 7), f'FX9 {title or name} @ {w}px (frames from a real fight, taken in slow motion; ms of effect time)', fill=(240, 230, 210))
    for i, (at, im) in enumerate(imgs):
        cx = 6 + (i % cols) * (tw + 6); cy = head + (i // cols) * (th + 22)
        sheet.paste(im.resize((tw, int(im.height * tw / im.width))), (cx, cy)); dr.text((cx + 2, cy + th + 4), f't = {at} ms', fill=(240, 220, 160))
    f = os.path.join(OUT, f'{name}-{w}.png'); sheet.save(f, optimize=True); sheets.append(f)
    return [a for a, _ in shots]

async def gone(pg, label, ms=1600):
    # the timers set in slow motion still run slow, so this waits for them (up to 30 s) rather than a fixed time
    await pg.wait_for_timeout(ms); n = await pg.evaluate(LEFT); k = 0
    while n and k < 60: await pg.wait_for_timeout(500); n = await pg.evaluate(LEFT); k += 1
    ok(n == 0, f'{label}: every piece is gone afterwards ({n} left)')

async def run(b, url, w, only):
    want = lambda k: not only or k in only
    print(f'-- width {w}')
    if want('dawn'):
        pg = await fresh(b, url, w); await pg.evaluate(BOARD + "([['otter-kit', -1], ['bee-knight', 0], ['grizzly-vanguard', 1]], [['otter-kit', -1], ['bee-knight', 0], ['terrier-pup', 1]])")
        src = await pg.evaluate("FX.B.dawnDraw.toString()")
        ok("opacity:.9, duration:.7" in src and "brightness(1.4)" in src, '#1 dawn: the rosy wash peaks at .9 and the decks flash at 1.4 in the built game')
        await frames(pg, 'dawn', w, "FX.B.dawnDraw(document.getElementById('battlefieldEl'));", [0, 350, 650, 900, 1200, 1700], title='#1 Morning: the rosy light 10% fainter')
        await gone(pg, '#1 dawn', 300); ok(not pg._errs, f'#1 no page errors {pg._errs[:2]}'); await pg.close()
    if want('guard'):
        pg = await fresh(b, url, w); await pg.evaluate(BOARD + "([['grizzly-vanguard', 0, 12, {wait:2}], ['otter-kit', 1]], [['bee-knight', 0], ['otter-kit', -1]])")
        st = await pg.evaluate(f"(()=>{{ const e = {EL}('1:0'), p = e && e.querySelector('.guard-plates'); return {{guard: !!(e && e.classList.contains('has-guard')), down: !!(e && e.classList.contains('guard-down')), vis: p ? getComputedStyle(p).visibility : null}}; }})()")
        ok(st['guard'] and st['down'] and st['vis'] == 'hidden', f'#5 a Guardian still Waiting is drawn without its plates {st}')
        await frames(pg, 'guardian', w, f"""const u = window.__u['1:0'], c = currentCardByUid(u);
          setTimeout(()=>{{ c.wait = 0; updateCardWaitDisplay(u, 0); }}, 300); setTimeout(()=>{{ c.stunned = true; updateCardStatusDisplay(u); }}, 1500); setTimeout(()=>{{ c.stunned = false; updateCardStatusDisplay(u); }}, 2600);""",
          [0, 380, 520, 900, 1560, 1700, 2100, 2700, 2900, 3300], title='#5 Guardian: plates out when Ready, folded while Waiting / Stunned')
        st = await pg.evaluate(f"(()=>{{ const e = {EL}('1:0'), p = e.querySelector('.guard-plates'); return {{down: e.classList.contains('guard-down'), vis: getComputedStyle(p).visibility, op: +getComputedStyle(p).opacity}}; }})()")
        ok(not st['down'] and st['vis'] == 'visible' and st['op'] > .95, f'#5 Ready again: the plates are back {st}')
        ok(not pg._errs, f'#5 no page errors {pg._errs[:2]}'); await pg.close()
    if want('ambush'):
        pg = await fresh(b, url, w); await pg.evaluate(BOARD + "([['tunnel-ant', 0, 9], ['otter-kit', 1]], [['otter-kit', 0, 9], ['bee-knight', 1]])")
        ok(await pg.evaluate("!!(FX.A.__fx9 && FX.C.__fx9)"), '#6 fx9PatchFx bound FX.A (ambush, shell, stampede) and FX.C (dragon)')
        await frames(pg, 'ambush', w, f"""const a = {EL}('1:0'), t = {EL}('2:0'); SoundKit.ambushTone(); FX.A.ambushStrike(a, t); ambushEcho(a);
          const inn = document.getElementById('battlefieldInner'); setTimeout(()=> inn.animate([{{translate:'0 0'}}, {{translate:'60px 0', offset:.5}}, {{translate:'0 0'}}], {{duration:900, easing:'ease-in-out'}}), 120);
          setTimeout(()=>{{ const h = a.querySelector(':scope > .fx9-host'), ar = a.getBoundingClientRect(), hr = h && h.getBoundingClientRect(); window.__fx9pan = h ? {{dx: Math.abs(hr.left - ar.left), dy: Math.abs(hr.top - ar.top), moved: ar.left}} : null; }}, 560);""",
          [60, 200, 330, 450, 600, 800], title='#6 Ambush inside its card (the camera pans 60 px during it)')
        pan = await pg.evaluate("window.__fx9pan")
        ok(pan is not None and pan['dx'] < 1.5 and pan['dy'] < 1.5, f'#6 the Ambush host sits on its card while the camera pans {pan}')
        out = await pg.evaluate("document.querySelectorAll('body > .fxa, body > .fxa-shade, body > .fxa-eyes').length")
        ok(out == 0, f'#6 nothing of the Ambush is drawn fixed on the page ({out})')
        # an fxHostAt effect (FX6's spore puff) rides the camera layer too
        cam = await pg.evaluate(f"(()=>{{ sporePuffVfx({EL}('2:0')); const h = document.querySelector('#battlefieldInner > .fx-float-host.fx9-cam'); return !!h; }})()")
        ok(cam, '#6 fxHostAt puts a board card\'s host in the camera layer (#battlefieldInner)')
        await gone(pg, '#6 ambush'); ok(not pg._errs, f'#6 no page errors {pg._errs[:2]}'); await pg.close()
    if want('shell'):
        pg = await fresh(b, url, w); await pg.evaluate(BOARD + "([['conch-crawler', 0, 9], ['otter-kit', 1]], [['bee-knight', 0]])")
        await frames(pg, 'shell', w, f"FX.A.shellCrack({EL}('1:0'));", [60, 180, 320, 420, 560, 720, 900, 1050], title='#14 Shell breaks: a tortoise carapace cracks and falls away')
        await gone(pg, '#14 shell', 600); ok(not pg._errs, f'#14 no page errors {pg._errs[:2]}'); await pg.close()
    if want('sleep'):
        pg = await fresh(b, url, w); await pg.evaluate(BOARD + "([['otter-kit', 0, 9, {asleep:2}], ['bee-knight', 1, 9, {asleep:1}]], [['grizzly-vanguard', 0, 9, {asleep:2}], ['otter-kit', 1]])")
        z = await pg.evaluate(f"""(async()=>{{ await new Promise(r=> setTimeout(r, 700)); const e = {EL}('1:0'), zs = [...e.querySelectorAll('.fx9-zzz > i')], r = zs.map(i=> i.getBoundingClientRect()), card = e.getBoundingClientRect();
          return {{n: zs.length, h: Math.max(...r.map(x=> x.height)), old: e.querySelectorAll('.sleep-overlay').length, right: Math.max(...r.map(x=> x.right)) > card.left + card.width*.6, top: Math.min(...r.map(x=> x.top)) < card.top + card.height*.3}}; }})()""")
        ok(z['n'] == 3 and z['old'] == 0, f'#8 a sleeper shows three Zs, no 💤 overlay {z}')
        ok(z["h"] >= 12, f'#8 the Zs are readable ({z["h"]:.1f} px tall at their largest frame)')
        ok(z['right'] and z['top'], f'#8 the Zs come out of the top-right corner {z}')
        await frames(pg, 'sleep', w, "", [0, 600, 1200, 1800, 2400, 3000], title='#8 Sleep: blue Zs out of the top-right corner')
        waking = await pg.evaluate(f"(async()=>{{ const u = window.__u['1:0'], c = currentCardByUid(u); c.asleep = 0; updateCardStatusDisplay(u); await new Promise(r=> setTimeout(r, 700)); return {EL}('1:0').querySelectorAll('.fx9-zzz').length; }})()")
        ok(waking == 0, f'#8 waking fades the Zs out ({waking} left)')
        ok(not pg._errs, f'#8 no page errors {pg._errs[:2]}'); await pg.close()
    if want('dragon'):
        seen = []
        for d in ('ltr', 'rtl', 'dive', 'back'):
            pg = await fresh(b, url, w); await pg.evaluate(BOARD + "([['otter-kit', -1], ['grizzly-vanguard', 0], ['bee-knight', 1]], [['otter-kit', -1], ['red-dragon', 0, 30], ['terrier-pup', 1]])")
            await frames(pg, f'dragon-{d}', w, f"""window.__fx9d = []; window.__fx9w = 0; const o = Element.prototype.animate; Element.prototype.animate = function(k, op){{ if(this.classList && this.classList.contains('fx9-dshadow')) window.__fx9d.push(k[0].transform + ' | ' + k[k.length - 1].transform); if(k && k[1] && k[1].rotate) window.__fx9w++; return o.call(this, k, op); }};
              FX.C.dragonArrive({EL}('2:0'), {{dir:'{d}', host:document.getElementById('battlefieldEl'), shake:true}}); Element.prototype.animate = o;""",
              [100, 350, 600, 850, 1100, 1350, 1600, 1900], title=f'#15 Dragon arrives: {d}')
            path = await pg.evaluate("window.__fx9d"); seen.append(path[0] if path else None)
            sway = await pg.evaluate("window.__fx9w"); ok(sway >= 1, f'#15 {d}: cards near its path sway in the wind ({sway})')
            await gone(pg, f'#15 dragon {d}', 900); ok(not pg._errs, f'#15 {d}: no page errors {pg._errs[:2]}'); await pg.close()
        ok(len(set(seen)) == 4 and None not in seen, f'#15 the four flights take four different paths')
    if want('stampede'):
        pg = await fresh(b, url, w); await pg.evaluate(BOARD + "([['otter-kit', -1], ['marching-elephant', 1, 9]], [['otter-kit', 1, 1]])")
        await frames(pg, 'stampede', w, f"""window.__fx9s = []; const o = Element.prototype.animate; Element.prototype.animate = function(k, op){{ if(this.classList && this.classList.contains('fx9-hoof')) window.__fx9s.push(this.getBoundingClientRect().left + this.getBoundingClientRect().width/2); return o.call(this, k, op); }};
              SoundKit.overwhelmTone(); FX.A.stampede({EL}('1:1'), hqTileEl('B')); Element.prototype.animate = o;
              const a = {EL}('1:1').getBoundingClientRect(), bar = document.querySelector('.bf-hp[data-hpribbon="B"]').getBoundingClientRect(); window.__fx9s0 = {{x: a.left + a.width/2, bar: bar.top + bar.height/2}};""",
              [40, 140, 260, 400, 480, 620, 850], title='#17 Stampede runs straight at the enemy Health bar')
        s = await pg.evaluate("({xs: window.__fx9s, a: window.__fx9s0, ring: (()=>{ const r = document.querySelector('.fx9-run > .fx9-ring'); return r ? r.getBoundingClientRect().top + r.getBoundingClientRect().height/2 : null; })()})")
        xs = s['xs'] or []
        ok(len(xs) == 8 and all(abs(x - s['a']['x']) < 12 for x in xs), f'#17 the hoof prints run straight ahead of the unit (x {s["a"]["x"]:.0f}: {[round(x) for x in xs]})')
        await gone(pg, '#17 stampede', 900); ok(not pg._errs, f'#17 no page errors {pg._errs[:2]}'); await pg.close()
    if want('pitch'):
        pg = await fresh(b, url, w)
        await pg.evaluate("(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); for(let i = 0; i < 40; i++){ await new Promise(r=> setTimeout(r, 250)); const v = document.querySelector('.vs-screen'); if(v) v.click(); else if(i > 10) break; } await new Promise(r=> setTimeout(r, 1500)); })()")
        info =await pg.evaluate("(()=>{ const m = matchState, me = m.players[1]; return {hand: me.hand.length, allowed: typeof pitchAllowedIn === 'function' ? pitchAllowedIn(m) : null, used: !!me.discardUsedThisTurn}; })()")
        t = await frames(pg, 'pitch', w, """const m = matchState, me = m.players[1]; window.__fx9g0 = me.graveyard.length; window.__fx9fly = 0;
            const o = Element.prototype.animate; Element.prototype.animate = function(k, op){ if(this.classList && this.classList.contains('ui16-pitch-fly')) window.__fx9fly++; return o.call(this, k, op); };
            discardCardByUid(me.hand[0].uid); setTimeout(()=>{ Element.prototype.animate = o; }, 600); /* the flight is aimed a frame later */
            setTimeout(()=>{ const f = document.querySelector('.ui16-pitch-fly'), g = document.getElementById('dropDiscard'); if(f && g){ const a = f.getBoundingClientRect(), b = g.getBoundingClientRect(); window.__fx9land = Math.abs((a.left + a.width/2) - (b.left + b.width/2)); } }, 470);""", [0, 120, 240, 360, 480, 620, 800], sel='.bottom-play-row', pad_top=60, title='#7 A tap-pitched card flies into the Graveyard')
        res = await pg.evaluate("({fly: window.__fx9fly, grew: matchState.players[1].graveyard.length - window.__fx9g0, land: window.__fx9land})")
        ok(res['grew'] == 1 and res['fly'] == 1, f'#7 the pitched card goes to the Graveyard by a flight, not a jump {res} {info}')
        ok(res['land'] is not None and res['land'] < 25, f'#7 it lands on the pile where the pile is after the hand redraws ({res["land"]} px off)')
        await gone(pg, '#7 pitch', 900); ok(not pg._errs, f'#7 no page errors {pg._errs[:2]}'); await pg.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        for w in a.widths: await run(b, url, w, a.only)
        await b.close()
    httpd.shutdown()
    print('contact sheets:', *[os.path.relpath(f, ROOT) for f in sheets], sep='\n  ')
    print(f'fx9 e2e: {len(fails)} failed' if fails else 'fx9 e2e: all checks passed'); return 1 if fails else 0

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', type=int, nargs='+', default=[390, 1366]); ap.add_argument('--only', nargs='*', default=[])
    sys.exit(asyncio.run(main(ap.parse_args())))
