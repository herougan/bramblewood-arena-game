#!/usr/bin/env python3
"""Package ANIM1 (2026-11-13, owner 2026-11-12 23:47 notes 9, 13, 19): browser checks.
    python3 tests/e2e/anim1_2026_11_13.py [--page index.html]
19  A card played from the hand at 1x / 1.5x / 2x, with the turn's own render landing in the same moment and another a frame later (Auto,
    a second play): the field card stays hidden for as long as its flight copy is in the air, one copy flies the whole way, and the card
    is on the field once it has landed. (Before ANIM1 the redraw showed the field card at its slot, the flight's next frame hid it, and it
    came back on landing.)
19  4x and 5x: no flight copy; the card is in its slot, at rest, right after the play.
13  After the play has settled, the played card's computed transform and size equal a resting card's. A face that a GSAP tween touched in
    the middle of its landing thud, and a card shoved in the middle of its ready pulse (GSAP reads the CSS `scale` / `translate` keyframe
    into its own transform), are back at rest once the flourish is over. (Before ANIM1 the shoved card kept scale 1.07 and 3.6 px up.)
9   A slot board whose units' span changes (the column range staying the same) re-lays its cards out with a glide: right after the render
    a card is still drawn at its old size, then eases to the new one (before: it jumped).
Build first. Exits 1 on a failed check."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, json
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
async def page(b, url, w, h):
    ctx = await b.new_context(viewport={'width': w, 'height': h}); pg = await ctx.new_page(); pg._errs = []; pg.on('pageerror', lambda e: pg._errs.append(str(e)))
    await pg.add_init_script(DONE); await pg.goto(url)
    await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=120000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; try{ skipTriggerLesson(); }catch(e){} switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 3500)); })()")
    return ctx, pg
async def idle(pg):
    await pg.wait_for_function("(()=>{ const m = matchState; return m && !m.resolving && !m._committing && !m._upkeep && !m.over; })()", timeout=120000); await pg.wait_for_timeout(500)
HELP = """window.__a1 = {
  units: ()=>{ const r = matchState.players[1].row; return r.left.concat(r.center, r.right); },
  frame: ()=> new Promise(r=> requestAnimationFrame(()=> r())), sleep: ms=> new Promise(r=> setTimeout(r, ms)),
  card: ()=>{ const m = matchState, pl = m.players[1], defs = getCardDefs(); pl.lumber = Math.max(pl.lumber || 0, 20);
    return pl.hand.find(h=> m.engine.canPlay(pl, h.defId, h.uid) && defs[h.defId] && defs[h.defId].type !== 'spell') || null; },
  pose: el=>{ if(!el) return null; const t = el.querySelector('.card-tile'), a = getComputedStyle(el), b = t && getComputedStyle(t), r = el.getBoundingClientRect(), q = t && t.getBoundingClientRect();
    const id = v=> (!v || v === 'none' || v === '0px' || v === '0deg' || v === '1' || /^matrix\\(1, 0, 0, 1, 0, 0\\)$/.test(v)) ? 'rest' : v;
    return {w: Math.round(r.width), h: Math.round(r.height), tw: q && Math.round(q.width), th: q && Math.round(q.height), tr: id(a.transform), sc: id(a.scale), tl: id(a.translate), ro: id(a.rotate),
      ttr: b && id(b.transform), tsc: b && id(b.scale), ttl: b && id(b.translate), tro: b && id(b.rotate), op: +a.opacity, vis: a.visibility}; },
};"""
PLAY19 = """(async(speed)=>{ const A = window.__a1, m = matchState; m.speedMult = speed; const hc = A.card(); if(!hc) return {none: true};
  const before = new Set(A.units().map(c=> String(c.uid))), S = []; let uid = null, n = 0;
  const look = tag=>{ if(uid == null){ const c = A.units().find(c=> !before.has(String(c.uid))); if(c) uid = String(c.uid); }
    const el = uid && boardCardEl(uid), cs = el && getComputedStyle(el), ps = [...document.querySelectorAll('.hand-flight-proxy')];
    ps.forEach(p=>{ if(!p.__a1) p.__a1 = ++n; });
    S.push({tag, flying: uid ? handFlightsLive.has(uid) : false, proxies: ps.map(p=> p.__a1), shown: !!(el && cs.visibility !== 'hidden' && +cs.opacity > .5)}); };
  playCardByUid(hc.uid, 'right'); look('play');
  renderBoard(); look('the turn\\'s render, same moment');
  await A.frame(); look('frame 1');
  lastBoardSig[1] = null; renderBoard(); look('a redraw on frame 1');
  for(let i = 2; i < 120 && uid && handFlightsLive.has(uid); i++){ await A.frame(); look('frame ' + i); }
  await A.sleep(1500); // 2026-11-13 TESTFIX3: then until the round has played out (an attack lunge of the card is not a resting pose; at 1.5x the sample fell inside it: scale 1.08, 20 px up), and a beat for the settle
  for(let i = 0; i < 80 && (m.resolving || m._committing || m._upkeep); i++) await A.sleep(150);
  await A.sleep(700); look('settled');
  const pe = uid && boardCardEl(uid), fly = !!(pe && pe.querySelector('.float-body')); // a Flyer's face sits in its lifted body: compare like with like
  const sib = [...document.querySelectorAll('#rowMine .board-card[data-uid]')].find(e=> before.has(e.dataset.uid) && !e.matches('.falling, .dying, .burning') && !!e.querySelector('.float-body') === fly);
  return {uid, S, played: A.pose(uid && boardCardEl(uid)), resting: A.pose(sib)}; })"""
GOTO = """(async(speed)=>{ const A = window.__a1, m = matchState; m.speedMult = speed; const hc = A.card(); if(!hc) return {none: true};
  const before = new Set(A.units().map(c=> String(c.uid)));
  playCardByUid(hc.uid, 'right');
  const c = A.units().find(c=> !before.has(String(c.uid))), uid = c && String(c.uid), el = uid && boardCardEl(uid);
  const now = {proxy: document.querySelectorAll('.hand-flight-proxy').length, pose: A.pose(el)};
  await A.frame(); await A.frame();
  return {uid, now, later: {proxy: document.querySelectorAll('.hand-flight-proxy').length, flying: uid ? handFlightsLive.has(uid) : null, pose: A.pose(uid && boardCardEl(uid))}}; })"""
BAKE = """(async()=>{ const A = window.__a1; const el = [...document.querySelectorAll('#rowMine .board-card[data-uid]')].find(e=> !e.matches('.falling, .dying, .burning, .is-entering')); if(!el) return {none: true};
  const t = el.querySelector('.card-tile'); playLandingImpact(el.dataset.uid);
  const an = t.getAnimations().find(a=> a.animationName === 'landingThud'); if(!an) return {noThud: true};
  an.pause(); an.currentTime = 90; // the thud's squash (scale ~1.13 / 0.83): a tween that starts now reads it into its transform
  const squash = getComputedStyle(t).scale;
  gsap.fromTo(t, {x: 3}, {x: 0, duration: .06, clearProps: 'x'}); // a hit's nudge on the face, mid-thud
  an.play();
  let rest = null; for(let i = 0; i < 40; i++){ await A.sleep(120); const p = A.pose(el); if(!el.classList.contains('landing-impact') && p.ttr === 'rest' && p.tsc === 'rest'){ rest = p; break; } }
  return {squash, rest, last: A.pose(el), inline: t.getAttribute('style')}; })"""
BAKE_CARD = """(async()=>{ const A = window.__a1; const el = [...document.querySelectorAll('#rowMine .board-card[data-uid]')].find(e=> !e.matches('.falling, .dying, .burning, .is-entering')); if(!el) return {none: true};
  renderVfxForEvent({type: 'ready', uid: Number(el.dataset.uid), side: 'A'}); // the ready pulse: `scale` / `translate` keyframes on the card itself
  const an = el.getAnimations().find(a=> a.animationName === 'readyPulseAnim'); if(!an) return {noPulse: true};
  an.pause(); an.currentTime = 140; const mid = getComputedStyle(el).scale + ' / ' + getComputedStyle(el).translate;
  gsap.fromTo(el, {x: 8}, {x: 0, duration: .06, clearProps: 'x'}); // a neighbour's landing shove, mid-pulse
  an.play();
  let rest = null; for(let i = 0; i < 40; i++){ await A.sleep(120); const p = A.pose(el); if(!el.classList.contains('ready-pulse') && p.tr === 'rest' && p.sc === 'rest' && p.tl === 'rest'){ rest = p; break; } }
  return {mid, rest, last: A.pose(el), inline: el.getAttribute('style')}; })"""
SPAN = """(async(slot)=>{ const A = window.__a1, m = matchState, pl = m.players[1], defs = getCardDefs(); pl.playedThisTurn = false; pl.playsThisTurn = 0; pl.lumber = 99;
  if(!pl.hand.some(h=> defs[h.defId] && defs[h.defId].type !== 'spell')){ const d = Object.keys(defs).find(k=> defs[k].type !== 'spell' && (defs[k].cost || 0) <= 2 && !defs[k].token); pl.hand.push({uid: 900000 + slot + 50, defId: d}); }
  const hc = pl.hand.find(h=> defs[h.defId] && defs[h.defId].type !== 'spell' && m.engine.canPlay(pl, h.defId, h.uid)); if(!hc) return {none: true};
  const c0 = A.units().find(c=> c.slot === 0), ref = c0 && boardCardEl(c0.uid);
  if(!ref){ m.engine.placeCard(m.players, m.sideOf, 1, hc.uid, slot, m.stats, []); pl.playedThisTurn = false; renderBoard(); await A.sleep(2500); return {noRef: true}; } // the first unit: the one the rest is measured by
  const w0 = ref.getBoundingClientRect().width, range0 = m._slotRange;
  m.engine.placeCard(m.players, m.sideOf, 1, hc.uid, slot, m.stats, []); pl.playedThisTurn = false;
  renderBoard();
  const r2 = boardCardEl(c0.uid), wSync = r2.getBoundingClientRect().width, lay = r2.offsetWidth, k = battlefieldScale > 0 ? battlefieldScale : 1; // drawn now vs laid out (the camera's scale on it)
  await A.sleep(2500); const e = boardCardEl(c0.uid);
  return {range0, range1: m._slotRange, w0: Math.round(w0), wSync: Math.round(wSync), wLayout: Math.round(lay * k), wEnd: Math.round(e.getBoundingClientRect().width), wEndLayout: Math.round(e.offsetWidth * (battlefieldScale > 0 ? battlefieldScale : 1))}; })"""
async def checks_19_13(b, url):
    print('-- 19: no field card before the flight lands; 13: resting shape after the play')
    ctx, pg = await page(b, url, 1366, 860); await pg.evaluate(HELP)
    rest_pair = None
    for sp in (1, 1.5, 2):
        await idle(pg); r = await pg.evaluate(PLAY19 + f"({sp})")
        if r.get('none'): ok(False, f'{sp}x: a playable card in the hand'); continue
        S = r['S']; air = [s for s in S if s['flying']]
        shown_in_air = [s['tag'] for s in air if s['shown']]
        ok(len(air) >= 2, f"{sp}x: the flight was in the air across the redraws ({len(air)} samples)")
        ok(not shown_in_air, f"{sp}x: the field card stays hidden while its flight is in the air (shown at: {shown_in_air[:4]})")
        ids = sorted({i for s in S for i in s['proxies']})
        ok(len(ids) == 1 and all(len(s['proxies']) <= 1 for s in S), f"{sp}x: one flight copy flies the whole way (copies seen: {ids})")
        ok(S[-1]['shown'] and not S[-1]['flying'] and not S[-1]['proxies'], f"{sp}x: once landed the card is on the field ({S[-1]})")
        p, q = r['played'], r['resting']
        if p and q:
            keys = ['w', 'h', 'tw', 'th', 'tr', 'sc', 'tl', 'ro', 'ttr', 'tsc', 'ttl', 'tro']
            diff = {k: (p[k], q[k]) for k in keys if (abs(p[k] - q[k]) > 1 if isinstance(p[k], (int, float)) else p[k] != q[k])}
            ok(not diff, f"13 ({sp}x): after the play settles the card's transform and size equal a resting card's {diff or ''}")
        else: print(f'  ({sp}x: no resting card on the board to compare with; 13 comparison skipped)')
    await idle(pg); r = await pg.evaluate(BAKE)
    if r.get('none') or r.get('noThud'): ok(False, f'13: a resting card with a landing thud to test {r}')
    else:
        ok(r['squash'] not in ('none', '1'), f"13: the thud was mid-squash when the nudge started ({r['squash']})")
        ok(r['rest'] is not None, f"13: a face nudged mid-thud is back at rest after the thud {r['last'] if r['rest'] is None else ''} {r['inline'] if r['rest'] is None else ''}")
    await idle(pg); r = await pg.evaluate(BAKE_CARD)
    if r.get('none') or r.get('noPulse'): ok(False, f'13: a resting card with a ready pulse to test {r}')
    else:
        ok(r['mid'] != 'none / none', f"13: the ready pulse was mid-way when the shove started ({r['mid']})")
        ok(r['rest'] is not None, f"13: a card shoved mid ready-pulse is back at rest after it {r['last'] if r['rest'] is None else ''} {r['inline'] if r['rest'] is None else ''}")
    print('-- 19: 4x / 5x go straight in')
    for sp in (4, 5):
        await idle(pg); r = await pg.evaluate(GOTO + f"({sp})")
        if r.get('none'): print(f'  ({sp}x: no playable card left; skipped)'); continue
        n, l = r['now'], r['later']
        ok(n['proxy'] == 0 and l['proxy'] == 0 and not l['flying'], f"{sp}x: no flight copy ({n['proxy']}, {l['proxy']})")
        ok(n['pose'] and n['pose']['vis'] != 'hidden' and n['pose']['op'] > .9 and n['pose']['tr'] == 'rest', f"{sp}x: the card is in its slot at rest right after the play {n['pose']}")
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await ctx.close()
async def check_9(b, url):
    print('-- 9: a new span re-lays the cards out with a glide')
    ctx, pg = await page(b, url, 820, 1000); await pg.evaluate(HELP)
    await idle(pg)
    await pg.evaluate("(()=>{ const m = matchState; m.engine.legalSlots = ()=>{ const o = []; for(let s = -6; s <= 6; s++) o.push(s); return o; }; })()")
    changed = []
    for slot in (0, 1, -1, 2, -2, 3, -3, 4, -4):
        r = await pg.evaluate(SPAN + f"({slot})")
        if r.get('none') or r.get('noRef'): continue
        if abs(r['wLayout'] - r['w0']) > 2: changed.append((slot, r))
    ok(bool(changed), f'the cards changed size as the span grew ({len(changed)} placements)')
    for slot, r in changed:
        ok(r['range0'] == r['range1'], f"slot {slot}: the column range stayed {r['range0']}")
        ok(abs(r['wSync'] - r['w0']) <= 2, f"slot {slot}: right after the render the card is still drawn at its old size ({r['w0']} -> drawn {r['wSync']}, laid out {r['wLayout']})")
        ok(abs(r['wEnd'] - r['wEndLayout']) <= 2, f"slot {slot}: then it eases to the new size and rests there ({r['wEnd']} vs {r['wEndLayout']})")
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await ctx.close()
async def main(a):
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/{a.page}'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        await checks_19_13(b, url); await check_9(b, url); await b.close()
    print('\nFAILED: ' + '; '.join(fails) if fails else '\nall ok'); sys.exit(1 if fails else 0)
ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html')
asyncio.run(main(ap.parse_args()))
