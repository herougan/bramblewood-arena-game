#!/usr/bin/env python3
"""Package BV (2026-10-24, the battle-visual pass): browser checks plus short frame sequences of every changed effect at 390 and 1366.

    python3 tests/e2e/bv_2026_10_24.py                 # checks + frames in tests/out/shots/bv-*  (+ one contact sheet per effect)
    python3 tests/e2e/bv_2026_10_24.py --widths 390
    python3 tests/e2e/bv_2026_10_24.py --keep          # also copy the contact sheets to docs/screens/BV/

Frames come from the CDP screencast (a GIF-like run of stills, ~10-25 a second in headless Chromium). Covers: the wind turning (17:34 #1),
the enemy leader's single arrival (17:34 #16), the Flood's random high side and no swell (17:01 #2), the Flyer's one wind pip (17:01 #4),
the camera with no jump-and-rubber-band on a phone play (17:01 #6), the bramble dropping into the ground and staying down (19:30), the
Smoke Bomb and Smoke (19:39), the pack summary with no stray shine (19:27 #1), the river current and dusk bars (19:27 #20), a cut-off
squash settling (13:16 #1), the Armor pips (13:16 #21), the enemy hand count on a phone (13:16 #24), and the Effects Lab's BV entries
(when .fxcat/effects.html is built). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, json, base64, time, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'BV')
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
    await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def record(pg, name, w, js, secs, every=0.08, crop=None):
    """Run js (an async body) while the screencast records `secs` seconds; keep a frame every `every` s; write a contact sheet."""
    cdp = await pg.context.new_cdp_session(pg); frames = []; t0 = time.time()
    def on_frame(ev):
        frames.append((time.time() - t0, ev['data']))
        async def ack():
            try: await cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
            except Exception: pass
        asyncio.ensure_future(ack())
    cdp.on('Page.screencastFrame', on_frame)
    await cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 72})
    r = await pg.evaluate("(async()=>{ " + js + " })()")
    await pg.wait_for_timeout(int(secs * 1000))
    try: await cdp.send('Page.stopScreencast')
    except Exception: pass
    for f in os.listdir(OUT):
        if f.startswith(f'bv-{name}-{w}-'): os.remove(os.path.join(OUT, f))
    kept, last = [], -1e9
    for t, d in frames:
        if t - last < every: continue
        last = t; p = os.path.join(OUT, f'bv-{name}-{w}-{len(kept):02d}-{int(t*1000):05d}ms.jpg'); open(p, 'wb').write(base64.b64decode(d)); kept.append(p)
    sheet(name, w, kept, crop)
    return r, kept

def sheet(name, w, files, crop):
    try:
        from PIL import Image, ImageDraw
    except Exception: return
    if not files: return
    tw = 300 if w >= 700 else 180; ims = []
    for f in files[:24]:
        im = Image.open(f).convert('RGB')
        if crop: im = im.crop(tuple(crop))
        ims.append((os.path.basename(f).split('-')[-1], im.resize((tw, int(im.height*tw/im.width)))))
    cols = 6 if w >= 700 else 8; th = max(i.height for _, i in ims) + 14; rows = (len(ims) + cols - 1)//cols
    sh = Image.new('RGB', (cols*tw, rows*th), (18, 18, 18)); d = ImageDraw.Draw(sh)
    for k, (lab, im) in enumerate(ims):
        x, y = (k % cols)*tw, (k//cols)*th; sh.paste(im, (x, y + 14)); d.text((x + 3, y + 1), lab, fill=(255, 230, 0))
    p = os.path.join(OUT, f'bv-sheet-{name}-{w}.png'); sh.save(p); sheets.append(p)

FIGHT = """switchTab('play'); startConquestMatch(MAP, KEY); await new Promise(r=> setTimeout(r, 3200));
  const m = matchState, e = m.engine; const put = (pid, ids)=> ids.forEach((id, i)=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9;
    const pl = m.players[pid]; if(!pl.row.center.length) pl.row.center.push(c); else if(i % 2) pl.row.left.push(c); else pl.row.right.push(c); });
  put(1, MINE); put(2, THEIRS); try{ e.syncSlots(m.players[1]); e.syncSlots(m.players[2]); }catch(_){}
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1100));"""
def fight(mine=('soldier-ant', 'bee-knight', 'otter-centurion'), theirs=('dolphin-knight', 'caustic-scorpion', 'bee-drone'), mid='m1', key='0-2'):
    return FIGHT.replace('MAP', json.dumps(mid)).replace('KEY', json.dumps(key)).replace('MINE', json.dumps(list(mine))).replace('THEIRS', json.dumps(list(theirs)))

async def run(b, url, w, labfile):
    print(f'-- width {w}')
    phone = w < 700
    # ---- 17:34 #1 the wind turns
    pg = await fresh(b, url, w)
    await pg.evaluate("(async()=>{ " + fight() + " m._windNow = {windy:true, mine:true}; m._windLastMine = true; syncWindField(m); await new Promise(r=> setTimeout(r, 2200)); })()")
    r, _ = await record(pg, 'wind-turn', w, """const m = matchState; m._windNow = {windy:true, mine:false}; m._windLastMine = false; syncWindField(m);
      const t0 = performance.now(), log = [];
      await new Promise(res=>{ const f = ()=>{ const t = performance.now() - t0, ls = [...document.querySelectorAll('.fxb-windturn > i')];
        const lay = document.querySelector('#battlefieldEl > .sfx-windfield:not(.is-out)');
        log.push({t, sy: ls.length ? +gsap.getProperty(ls[0], 'scaleY') : null, n: ls.length, key: lay ? lay.dataset.key : null, swirl: !!document.querySelector('.fxb-swirl')}); if(t < 2300) requestAnimationFrame(f); else res(); }; f(); });
      return log;""", 0.4, 0.07)
    sy = [x['sy'] for x in r if x['sy'] is not None]
    ok(len(sy) > 5 and min(sy) < 0.15 and sy[-1] > 0.9 and max(x['n'] for x in r) >= 3, f"17:34 #1. a few lines ({max(x['n'] for x in r)}) draw in to a point (min {min(sy) if sy else None:.2f}) and back out (last {sy[-1] if sy else None:.2f})")
    ok(not any(x['swirl'] for x in r), '17:34 #1. no swirl')
    ok(r[-1]['key'] == 'strong:south' and not r[-1]['n'], f"17:34 #1. it ends on the new layer, blowing south, the turning lines gone ({r[-1]})")
    ok(not pg._errs, f'17:34 #1. no page errors {pg._errs[:2]}')
    await pg.close()
    # ---- 17:01 #4 one wind pip; 13:16 #21 armor pips
    pg = await fresh(b, url, w)
    r = await pg.evaluate("(async()=>{ " + fight(mine=('kittiwake-flock', 'garden-snail', 'stone-turtle-warden'), theirs=('peak-condor', 'barnacle-fortress', 'bee-drone')) + """
      m._windNow = {windy:true, mine:true}; syncWindBadges(); await new Promise(r=> setTimeout(r, 300));
      const pip = s=> [...document.querySelectorAll(s + ' .board-card[data-defid]')].filter(el=> el.querySelector('.ab-wing')).map(el=>{ const w = el.querySelector('.ab-wing'), a = w.closest('.abadge'); return {def: el.dataset.defid, pair: !!w.closest('.ab-windpair'), boot: !!(a && a.querySelector('.ab-quick')), x2: !!(a && a.querySelector('.wind-x2')), pills: el.querySelectorAll('.badges .abadge').length}; });
      const arm = [...document.querySelectorAll('.board-card[data-defid] .ab-shields')].map(s=>{ const a = s.closest('.abadge').getBoundingClientRect(), g = [...s.querySelectorAll('i')].map(i=> i.getBoundingClientRect()); return {n: s.dataset.n, num: s.classList.contains('is-num'), inside: Math.min(...g.map(x=> x.left)) >= a.left - 1.5 && Math.max(...g.map(x=> x.right)) <= a.right + 1.5}; });
      return {mine: pip('#rowMine'), theirs: pip('#rowEnemy'), arm}; })()""")
    ok(r['mine'] and all(x['pair'] and x['boot'] for x in r['mine']), f"17:01 #4. Tailwind: wing + boot in one pip {r['mine']}")
    ok(r['theirs'] and all(x['pair'] and x['x2'] for x in r['theirs']), f"17:01 #4. Headwind: wing + ×2 in one pip {r['theirs']}")
    ok(r['arm'] and all(x['inside'] for x in r['arm']) and all(x['num'] == (int(x['n']) >= 5) for x in r['arm']), f"13:16 #21. the shields sit inside their pip; 5+ is one numbered shield {r['arm']}")
    p = os.path.join(OUT, f'bv-pips-{w}.png'); await pg.screenshot(path=p); sheets.append(p)
    ok(not pg._errs, f'17:01 #4. no page errors {pg._errs[:2]}')
    await pg.close()
    # ---- 17:01 #2 the Flood comes in with its own high side
    for tilt in (10, -10):
        pg = await fresh(b, url, w)
        await pg.evaluate("(async()=>{ switchTab('play'); startConquestMatch('m1','0-2'); await new Promise(r=> setTimeout(r, 3200)); const m = {resolving:true, _tideScene:{k:'ebb', from:'ebb', at:0}}; window.__tm = m; syncTideScene(m); })()")
        r, _ = await record(pg, f'tide-{"left" if tilt > 0 else "right"}', w, f"""const m = window.__tm; tideSceneSet(m, 'flow'); m._tideScene.tilt = {tilt}; syncTideScene(m);
          const w = document.querySelector('#battlefieldEl > .tide-scene'), cs = getComputedStyle(w), edge = w.querySelector('.tw-edge'), bf = document.getElementById('battlefieldEl').getBoundingClientRect();
          const t0 = performance.now(), log = []; await new Promise(res=>{{ const f = ()=>{{ const t = performance.now() - t0, e = edge.getBoundingClientRect(); log.push({{t, top: e.bottom - bf.top}}); if(t < 3400) requestAnimationFrame(f); else res(); }}; f(); }});
          return {{skew: cs.getPropertyValue('--tw-skew').trim(), origin: cs.getPropertyValue('--tw-origin').trim(), swell: cs.getPropertyValue('--tw-swell').trim(), log}};""", 0.4, 0.15)
        tops = [x['top'] for x in r['log']]; settled = [x['top'] for x in r['log'] if x['t'] > 1800]
        ok(r['skew'] == f'{tilt:.2f}deg' and r['origin'] == ('100% 0' if tilt > 0 else '0 0') and r['swell'] == '0px', f"17:01 #2. a {'left' if tilt > 0 else 'right'}-led Flood: skew {r['skew']}, origin {r['origin']}, swell {r['swell']}")
        ok(settled and max(settled) <= 2, f"17:01 #2. once up, the front wave stays above the top border (no bounce back into view: max {max(settled) if settled else None:.1f} px)")
        ok(not pg._errs, f'17:01 #2. no page errors {pg._errs[:2]}')
        await pg.close()
    # ---- 17:01 #6 the camera on a phone play (or a desktop one): no card jumps and glides back
    pg = await fresh(b, url, w)
    # the snap guard's glides (gsap.fromTo(card, {x:dx}, {x:0, clearProps:'x'})) are counted per frame: one card gliding is a real reflow
    # snap being smoothed; three or more at once is the whole board jumping and gliding back (the bug: a zoom read as a snap)
    r = await pg.evaluate("""(async()=>{ switchTab('play'); startConquestMatch('m1','0-2'); await new Promise(r=> setTimeout(r, 3500));
      const m = matchState; m.players[1].hq.hp = m.players[1].hq.maxHp = 999; m.players[2].hq.hp = m.players[2].hq.maxHp = 999;
      const glides = []; const F = gsap.fromTo;
      gsap.fromTo = function(el, a, b){ try{ if(el && el.classList && el.classList.contains('board-card') && a && 'x' in a && b && b.clearProps === 'x') glides.push({t: Math.round(performance.now()/16), dx: a.x}); }catch(e){} return F.apply(gsap, arguments); };
      let reframes = 0; const RF = window.mb2FlipReframe; window.mb2FlipReframe = function(){ reframes++; return RF.apply(this, arguments); };
      for(let turn = 0; turn < 5; turn++){ let g = 0; while((m.resolving || m.awaitingPass || m._committing) && g++ < 150) await new Promise(r=> setTimeout(r, 100)); if(m.over) break;
        const me = m.players[1]; me.lumber = 20; const h = me.hand.find(x=> m.engine.canPlay(me, x.defId, x.uid)); if(h) await playCardByUid(h.uid, ['left','right'][turn % 2]); else await skipTurn(); await new Promise(r=> setTimeout(r, 1500)); }
      gsap.fromTo = F; window.mb2FlipReframe = RF;
      const per = {}; glides.forEach(gl=>{ per[gl.t] = (per[gl.t]||0) + 1; });
      return {glides: glides.length, worstFrame: Math.max(0, ...Object.values(per)), reframes}; })()""")
    ok(r['worstFrame'] < 3, f"17:01 #6. no whole-board jump and glide back after a play ({r['glides']} single-card snap glides, at most {r['worstFrame']} in one frame; {r['reframes']} camera re-frames)")
    ok(not pg._errs, f'17:01 #6. no page errors {pg._errs[:2]}')
    await pg.close()
    # ---- 13:16 #1 a squash cut off mid-way settles; 17:34 #16 one leader arrival
    pg = await fresh(b, url, w)
    r = await pg.evaluate("(async()=>{ " + fight() + """
      const el = document.querySelector('#rowMine .board-card[data-uid]'), t = el.querySelector('.card-tile');
      impactSquash(el, 9); await new Promise(r=> setTimeout(r, 40)); gsap.killTweensOf(t, 'y,x,rotation,scale');
      const cut = [+gsap.getProperty(t, 'scaleX'), +gsap.getProperty(t, 'scaleY')]; await new Promise(r=> setTimeout(r, 1000));
      const after = [+gsap.getProperty(t, 'scaleX'), +gsap.getProperty(t, 'scaleY')];
      const foe = document.querySelector('#rowEnemy .board-card[data-uid]'), ft = foe.querySelector('.card-tile'); let dropped = false;
      const F = gsap.fromTo; gsap.fromTo = function(tg, a, b){ if(tg === ft && a && a.y < -50) dropped = true; return F.apply(gsap, arguments); };
      leaderThroneVfx(foe.dataset.uid, {enemy:true, defId: foe.dataset.defid, landed:true}); await new Promise(r=> setTimeout(r, 120)); gsap.fromTo = F;
      return {cut, after, dropped, banner: !!document.querySelector('.leader-callout')}; })()""")
    ok(abs(r['cut'][0] - r['cut'][1]) > 0.02 and abs(r['after'][0] - 1) < 0.01 and abs(r['after'][1] - 1) < 0.01, f"13:16 #1. a face left squashed ({r['cut'][0]:.3f} x {r['cut'][1]:.3f}) is back at rest a second later ({r['after']})")
    ok(not r['dropped'] and r['banner'], f"17:34 #16. the enemy leader's throne moment has its banner and no second drop ({r})")
    ok(not pg._errs, f'13:16 #1. no page errors {pg._errs[:2]}')
    await pg.close()
    # ---- 19:30 the bramble drops into the ground, stays down after the fight
    pg = await fresh(b, url, w)
    await pg.evaluate("(async()=>{ " + fight() + " })()")
    r, _ = await record(pg, 'castle-drop', w, """const el = hqTileEl('B'); window.__done = 0; FX.C.castleSink(el, {host: document.querySelector('.battlefield')}).then(()=> window.__done = 1);
      await new Promise(r=> setTimeout(r, 3600)); return {done: window.__done, vis: getComputedStyle(el).visibility, op: getComputedStyle(el).opacity};""", 0.2, 0.08, None if phone else (0, 40, 700, 320))
    ok(r['done'] == 1 and (r['vis'] == 'hidden' or float(r['op']) < 0.05), f"19:30. their bramble has gone into the ground ({r})")
    r = await pg.evaluate("(async()=>{ const m = matchState; m.players[2].hq.hp = 0; m.over = true; renderMatchUI(); await new Promise(r=> setTimeout(r, 300)); const t = hqTileEl('B'); return {fallen: t.classList.contains('castle-fallen'), vis: getComputedStyle(t).visibility, mine: hqTileEl('A').classList.contains('castle-fallen')}; })()")
    ok(r['fallen'] and r['vis'] == 'hidden' and not r['mine'], f"19:30. after the fight, a redraw keeps it down (and yours, with Health, up) {r}")
    p = os.path.join(OUT, f'bv-castle-after-{w}.png'); await pg.screenshot(path=p); sheets.append(p)
    ok(not pg._errs, f'19:30. no page errors {pg._errs[:2]}')
    await pg.close()
    # ---- 19:39 the Smoke Bomb and Smoke
    pg = await fresh(b, url, w)
    await pg.evaluate("(async()=>{ " + fight() + " })()")
    r, _ = await record(pg, 'smoke-bomb', w, """const a = document.querySelector('#rowEnemy .board-card[data-uid]'), b = document.querySelectorAll('#rowMine .board-card[data-uid]')[1];
      let imp = 0; const t0 = performance.now(); let maxBlobs = 0; const iv = setInterval(()=>{ maxBlobs = Math.max(maxBlobs, document.querySelectorAll('.fxc-sblob').length); }, 50);
      await FX.C.smokeBomb(a, b, {effect:'blind', onImpact:()=> imp = performance.now() - t0}); clearInterval(iv);
      return {imp, maxBlobs, left: document.querySelectorAll('.fxc-sblob, .fxc-sbomb').length};""", 0.3, 0.07)
    ok(400 < r['imp'] < 800 and r['maxBlobs'] >= 15 and r['left'] == 0, f"19:39. the bomb lands at ~0.56 s and bursts into billows, all cleaned up after ({r})")
    r = await pg.evaluate("""(async()=>{ const el = document.querySelectorAll('#rowMine .board-card[data-uid]')[1], uid = el.dataset.uid; const m = matchState; m.replayCards = null;
      let c = null; [1].forEach(p=> ['left','center','right'].forEach(s=> m.players[p].row[s].forEach(x=>{ if(String(x.uid) === uid) c = x; }))); c.smoke = 1; updateCardStatusDisplay(c.uid);
      await new Promise(r=> setTimeout(r, 1200)); const o = boardCardEl(uid).querySelector('.smoke-overlay'); return {billows: o ? o.querySelectorAll('i').length : 0, anim: o ? getComputedStyle(o.querySelector('i')).animationName : null}; })()""")
    ok(r['billows'] == 4 and r['anim'].startswith('smokeBillow'), f"19:39. Smoke on a unit: four curling billows ({r})")
    p = os.path.join(OUT, f'bv-smoke-veil-{w}.png'); await pg.screenshot(path=p); sheets.append(p)
    ok(not pg._errs, f'19:39. no page errors {pg._errs[:2]}')
    await pg.close()
    # ---- 19:27 #20 the river current and dusk bars
    pg = await fresh(b, url, w)
    await pg.evaluate("(async()=>{ switchTab('play'); startConquestMatch('m2','4-1'); await new Promise(r=> setTimeout(r, 3500)); })()")
    r = await pg.evaluate("""(()=>{ const bf = document.getElementById('battlefieldEl'); FX.B.permaTide(bf); const c = bf.querySelector(':scope > .fxb-current'); if(!c) return null;
      const hs = [...c.querySelectorAll('b')].map(b=> parseFloat(b.style.getPropertyValue('--h'))); return {n: hs.length, op: +getComputedStyle(c).opacity, hmin: Math.min(...hs), hmax: Math.max(...hs), bg: getComputedStyle(c).backgroundImage}; })()""")
    ok(r and r['n'] >= 6 and r['op'] <= 0.35 and 89 <= r['hmin'] and r['hmax'] <= 111 and 'repeating' not in r['bg'], f"19:27 #20. the current: separate soft streaks, heights 90-110%, opacity {r and r['op']} ({r})")
    await pg.wait_for_timeout(1500)
    p = os.path.join(OUT, f'bv-current-{w}.png'); await pg.screenshot(path=p); sheets.append(p)
    await pg.close()
    # ---- 19:27 #1 the pack summary: no stray shine
    pg = await fresh(b, url, w)
    await pg.evaluate("(async()=>{ myCurrencies.gold = 99999; saveCurrencies(); const p = getShopPacks().find(x=> x.id === 'bronze'); const o = purchasePackOnce(p, true); o.results.forEach(r=> r.isNew = true); openPackAnimation(p, [o]); await new Promise(r=> setTimeout(r, 1200)); })()")
    r, _ = await record(pg, 'pack-summary', w, """const ov = document.getElementById('packOpenOverlay'); let strayAt = -1;
      const watch = setInterval(()=>{ if(ov.querySelector('.po2-summary') && document.querySelector('.po2-fly') && strayAt < 0) strayAt = performance.now(); }, 16);
      for(let k = 0; k < 70 && !ov.querySelector('.po2-summary'); k++){
        const strip = ov.querySelector('#poStrip');
        if(strip){ const r = strip.getBoundingClientRect(); const fire = (type, x)=> strip.dispatchEvent(new PointerEvent(type, {bubbles:true, clientX:x, clientY:r.top + r.height/2, pointerId:1, pointerType:'mouse', buttons:1}));
          fire('pointerdown', r.left + 4); for(let i = 1; i <= 12; i++){ fire('pointermove', r.left + r.width*i/12); await new Promise(z=> setTimeout(z, 16)); } fire('pointerup', r.right - 2); await new Promise(z=> setTimeout(z, 900)); continue; }
        const c = [...ov.querySelectorAll('.po-card:not(.is-collected)')][0]; if(c){ c.click(); await new Promise(z=> setTimeout(z, 650)); } else await new Promise(z=> setTimeout(z, 300)); }
      await new Promise(z=> setTimeout(z, 1200)); clearInterval(watch);
      const foot = (ov.querySelector('#poFoot p') || {}).textContent || ''; return {summary: !!ov.querySelector('.po2-summary'), stray: strayAt >= 0, foot};""", 0.3, 0.12)
    ok(r['summary'] and not r['stray'], f"19:27 #1. the summary comes up with no card flight left in the air ({r})")
    ok(not r['foot'].strip().endswith('·'), f"19:27 #1. no dangling dot: '{r['foot'].strip()}'")
    ok(not pg._errs, f'19:27 #1. no page errors {pg._errs[:2]}')
    await pg.close()
    # ---- 13:16 #24 the enemy hand count on a phone
    if phone:
        pg = await fresh(b, url, w)
        r = await pg.evaluate("(async()=>{ switchTab('play'); startConquestMatch('m1','0-2'); await new Promise(r=> setTimeout(r, 3200)); const p = document.getElementById('enemyHandCount'), d = document.getElementById('deckWidgetTop'); const a = p.getBoundingClientRect(), b = d.getBoundingClientRect(); return {top: a.top, inside: a.top >= b.top - .5 && a.bottom <= b.bottom, fs: getComputedStyle(p).fontSize}; })()")
        ok(r['top'] >= 0 and r['inside'], f"13:16 #24. the enemy hand count sits inside their Deck, on screen ({r})")
        await pg.close()
    # ---- the Effects Lab's BV entries
    if labfile:
        pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'FXLAB' in m.text else None)
        await pg.goto(labfile); await pg.wait_for_timeout(2500)
        ids = await pg.evaluate("(()=> ['wt-wind-swap','wt-tide-flow','castle-crumble','sk-smoke-bomb','st-smoke-apply','wt-perma-tide'].map(id=>{ const r = FXLAB.get(id); const ks = r ? r.variants.filter(v=> /^BV ·/.test(v.label)).map(v=> v.key) : []; return ks.length ? id + ':' + ks.join(',') : id + ':missing'; }))()")
        ok(all(not x.endswith('missing') for x in ids), f'lab: the BV entries are registered {ids}')
        for item in ids:
            if item.endswith('missing'): continue
            idd, keys = item.split(':')
            for k in keys.split(','):
                res = await pg.evaluate(f"(async()=>{{ try{{ return await FXLAB.play('{idd}', '{k}'); }}catch(e){{ return 'threw ' + e; }} }})()")
                if res is not True: errs.append(f'{idd} {k}: {res}')
        ok(not errs, f'lab: every BV variant plays without an error {errs[:3]}')
        await pg.close()

async def main(widths, keep):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    lab = os.path.join(ROOT, '.fxcat', 'effects.html'); labfile = f'http://127.0.0.1:{httpd.server_address[1]}/.fxcat/effects.html' if os.path.exists(lab) else None
    if not labfile: print('  (no .fxcat/effects.html: run python3 tools/effects-lab/build.py to check the lab entries)')
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        for w in widths: await run(b, url, w, labfile)
        await b.close()
    httpd.shutdown()
    if keep:
        os.makedirs(KEEP, exist_ok=True)
        from PIL import Image  # kept as JPEG (the frames are JPEG already; PNG sheets were ~0.7 MB each)
        for s in sheets: Image.open(s).convert('RGB').save(os.path.join(KEEP, os.path.splitext(os.path.basename(s))[0] + '.jpg'), quality=82)
    print('sheets:', len(sheets), 'in', OUT)
    print('FAILED:' if fails else 'all checks passed', len(fails) or '')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true')
    a = ap.parse_args(); asyncio.run(main([int(x) for x in a.widths.split(',')], a.keep))
