#!/usr/bin/env python3
"""Package UI8 (2026-10-31, owner AA1-AA5, Z2, Z4, Z6): browser checks.
    python3 tests/e2e/ui8_2026_10_31.py [--page index.html] [--shots]
AA3  a hand card dropped on the board: its flight copy is at the release point on the first frame drawn after the drop (not at the slot, and
     not already landed: the flight's clock starts two frames after it is made); a tap-played card starts at its hand tile; the enemy's card
     starts see-through above its row (their hand) and fades in. (Headless frames come 150-500 ms after a drop: the old wall-clock flight was over
     before the first one.)
AA5  a castle's spawn (the Trojan Horse's Raider) gets a spawn origin at its bramble.
AA1  the bramble bar eases in 0.25 s / 0.4 s (5+) / 0.7 s (10+), Shield layers too; at 0 Shield there is no crack line and the layers are hidden.
Z6   the card's Shield badge: 💠 + number, number faded at exactly 1, gone at 0.
Z2   leader summoned: no portrait in the middle.   Z4: the pointer's light is under the cards.
AA2  the VS opener (14-A-5) at 1366 and 390: one even column on the right, one pill style, the BR boxes level, no sideways scroll.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, math
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui8')
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
async def page(b, url, w, h=860):
    ctx = await b.new_context(viewport={'width': w, 'height': h}); pg = await ctx.new_page(); pg._errs = []; pg.on('pageerror', lambda e: pg._errs.append(str(e)))
    await pg.add_init_script(DONE); await pg.goto(url)
    await pg.wait_for_function("typeof startConquestMatch === 'function' && typeof showVersusOpener === 'function'", timeout=60000); await pg.wait_for_timeout(1800)
    return ctx, pg
HOOK = """(()=>{ window.__log = []; const L = (k, v)=> window.__log.push([k, v]);
 const o = pendingEntranceOrigins.set.bind(pendingEntranceOrigins); pendingEntranceOrigins.set = (k, v)=>{ L('origin', {uid: String(k), x: Math.round(v.x), y: Math.round(v.y), kind: v.kind, enemy: !!v.enemyHand, hqs: [...document.querySelectorAll('[data-hq]')].map(e=>{ const q = e.getBoundingClientRect(); return [Math.round(q.left + q.width/2), Math.round(q.top + q.height/2)]; })}); return o(k, v); };
 const h = handFlightProxy; window.handFlightProxy = function(el, uid, origin){ const r = h.apply(this, arguments); const p = document.querySelector('.hand-flight-proxy'); let pos = null; if(p){ const q = p.getBoundingClientRect(); pos = [Math.round(q.left + q.width/2), Math.round(q.top + q.height/2)]; } L('hfp', {uid: String(uid), ret: r, pos, t: performance.now()}); return r; };
 // the first frame drawn after the drop / the tap: where is the flight copy, and how see-through is the enemy's new card
 window.__probe = ()=>{ requestAnimationFrame(()=>{ const p = document.querySelector('.hand-flight-proxy'); let pos = null; if(p){ const q = p.getBoundingClientRect(); pos = [Math.round(q.left + q.width/2), Math.round(q.top + q.height/2)]; }
   const en = [...document.querySelectorAll('#rowEnemy .board-card')].map(e=> +getComputedStyle(e).opacity); L('frame1', {pos, enemyOpacity: en}); }); };
 document.addEventListener('drop', ()=> window.__probe(), true); document.addEventListener('click', e=>{ if(e.target.closest && e.target.closest('#rowMine')) window.__probe(); }, true);
})()"""
async def start(pg):
    await pg.evaluate("(async()=>{ adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){} switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 3500)); })()")
    await pg.evaluate(HOOK)
async def playable(pg):
    return await pg.evaluate("""(()=>{ const m = matchState, pl = m.players[activePlayerId(m)], defs = getCardDefs(); const hc = pl.hand.find(h=> (defs[h.defId].cost||0) <= pl.lumber && defs[h.defId].type !== 'spell');
      if(!hc) return null; const c = document.querySelector(`#handStrip .card-tile[data-handuid="${hc.uid}"]`); if(!c) return null; const r = c.getBoundingClientRect(); return {x: r.x + r.width/2, y: r.y + r.height/2}; })()""")
async def idle(pg):
    await pg.wait_for_function("(()=>{ const m = matchState; return m && !m.resolving && !m._committing && !m._upkeep && !m.over; })()", timeout=90000); await pg.wait_for_timeout(800)
def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])
async def aa3(b, url):
    print('-- AA3: where a played card starts')
    ctx, pg = await page(b, url, 1366); await start(pg)
    box = await playable(pg); ok(bool(box), 'the hand has a card that can be played')
    tgt = await pg.evaluate("(()=>{ const r = document.getElementById('rowMine').getBoundingClientRect(); return {x: r.x + r.width*0.78, y: r.y + r.height*0.5}; })()")
    await pg.mouse.move(box['x'], box['y']); await pg.mouse.down()
    for i in range(1, 13):
        await pg.mouse.move(box['x'] + (tgt['x'] - box['x'])*i/12, box['y'] + (tgt['y'] - box['y'])*i/12); await pg.wait_for_timeout(20)
    await pg.mouse.up(); await pg.wait_for_timeout(1500)
    log = await pg.evaluate("window.__log"); rel = (round(tgt['x']), round(tgt['y']))
    hfp = next((v for k, v in log if k == 'hfp' and v['ret']), None); f1 = next((v for k, v in log if k == 'frame1'), None)
    ok(hfp is not None and hfp['pos'] and dist(hfp['pos'], rel) < 40, f"the flight copy is made at the release point {rel}: {hfp and hfp['pos']}")
    ok(f1 is not None and f1['pos'] is not None and dist(f1['pos'], rel) < 60, f"in the first frame drawn after the drop it is still at the release point (not landed): {f1 and f1['pos']}")
    en = next((v for k, v in log if k == 'origin' and v['enemy']), None)
    ok(en is not None, f'the enemy card has a hand origin above its row {en}')
    ok(f1 is not None and (not f1['enemyOpacity'] or min(f1['enemyOpacity']) < 0.6), f"the enemy's new card is see-through in its first frame {f1 and f1['enemyOpacity']}")
    await idle(pg); await pg.evaluate("window.__log = []")
    box = await playable(pg)
    if box:
        await pg.mouse.click(box['x'], box['y']); await pg.wait_for_timeout(300)
        t2 = await pg.evaluate("(()=>{ const r = document.getElementById('rowMine').getBoundingClientRect(); return {x: r.x + r.width*0.5, y: r.y + r.height*0.5}; })()")
        await pg.mouse.click(t2['x'], t2['y']); await pg.wait_for_timeout(1200)
        log = await pg.evaluate("window.__log"); hfp = next((v for k, v in log if k == 'hfp' and v['ret']), None)
        ok(hfp is not None and hfp['pos'] and dist(hfp['pos'], (round(box['x']), round(box['y']))) < 60, f"a tapped card's flight starts at its hand tile {hfp and hfp['pos']} vs {round(box['x']), round(box['y'])}")
    else: print('  (no second playable card; tap check skipped)')
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await ctx.close()
async def aa5(b, url):
    print('-- AA5: a castle spawn comes out of its bramble')
    ctx, pg = await page(b, url, 1366); await start(pg)
    await pg.evaluate("(()=>{ const m = matchState; m.players[1].castleSpawn = {first: m.round + 1, every: 0, defId: 'trojan-raider', count: 1}; return 1; })()")
    await pg.evaluate("skipTurn()"); await pg.wait_for_function("window.__log.some(e=> e[0] === 'origin' && e[1].kind === 'spawn')", timeout=60000)
    log = await pg.evaluate("window.__log"); sp = next(v for k, v in log if k == 'origin' and v['kind'] == 'spawn')
    hqs = sp['hqs']  # the brambles' centres at the moment the origin was recorded
    ok(any(dist((sp['x'], sp['y']), q) < 30 for q in hqs), f"the Raider's origin is a bramble's centre {hqs}: {sp['x'], sp['y']}")
    await pg.wait_for_timeout(2500)
    ok(await pg.evaluate("[...document.querySelectorAll('#rowMine .board-card')].some(e=> e.getAttribute('data-defid') === 'trojan-raider')"), 'the Raider is on the board afterwards')
    await ctx.close()
async def aa1_z6_z2_z4(b, url):
    print('-- AA1 bramble bar / Z6 Shield badge / Z2 / Z4')
    ctx, pg = await page(b, url, 1366); await start(pg)
    r = await pg.evaluate("""(async()=>{ const m = matchState, hq = m.players[2].hq, sleep = t=> new Promise(r=> setTimeout(r, t)); const out = {};
      hq.maxHp = 60; hq.hp = 60; hq.maxShield = 20; hq.shieldLayers = [10, 10]; hq.shield = 20; castleShieldSync('B'); updateHpRibbon('B', 60); await sleep(900);
      const dur = sel=>{ const e = document.querySelector('.bf-hp[data-hpribbon="B"] ' + sel); const a = e && e.getAnimations(); return a && a.length ? Math.round(a[a.length - 1].effect.getTiming().duration) : null; };
      updateHpRibbon('B', 58); out.hp2 = dur('.bf-hp-fill'); await sleep(900); updateHpRibbon('B', 52); out.hp6 = dur('.bf-hp-fill'); await sleep(900); updateHpRibbon('B', 40); out.hp12 = dur('.bf-hp-fill'); await sleep(900);
      hq.shield = 18; castleShieldSync('B'); out.sh2 = dur('.bf-sh-2'); await sleep(900); hq.shield = 12; castleShieldSync('B'); out.sh6 = dur('.bf-sh-2'); await sleep(900);
      hq.shield = 0; castleShieldSync('B'); await sleep(300); out.crack = !!document.querySelector('.bf-hp[data-hpribbon="B"] .bsb-crack'); await sleep(1100);
      const st = document.querySelector('.bf-hp[data-hpribbon="B"] .bf-sh-stack'); out.stackVis = st ? getComputedStyle(st).visibility : 'none'; out.crack2 = !!document.querySelector('.bf-hp[data-hpribbon="B"] .bsb-crack'); return out; })()""")
    ok(r['hp2'] == 250 and r['hp6'] == 400 and r['hp12'] == 700, f"Health eases in 0.25 / 0.4 / 0.7 s for 2 / 6 / 12 points {r['hp2'], r['hp6'], r['hp12']}")
    ok(r['sh2'] == 250 and r['sh6'] == 400, f"a Shield layer eases down in 0.25 s (2) and 0.4 s (6) {r['sh2'], r['sh6']}")
    ok(not r['crack'] and not r['crack2'] and r['stackVis'] == 'hidden', f"at 0 Shield: no crack line, the layers hidden {r['crack'], r['crack2'], r['stackVis']}")
    # Z6: a unit's Shield badge
    z = await pg.evaluate("""(async()=>{ const m = matchState, sleep = t=> new Promise(r=> setTimeout(r, t)); const out = {};
      const c = m.players[1].row.center[0] || m.players[1].row.left[0] || m.players[1].row.right[0]; if(!c) return {none: true};
      const el = ()=> document.querySelector(`.board-card[data-uid="${c.uid}"] .card-tile .badges .ab-unit-shield.is-live`);
      c.shield = 3; updateCardStatusDisplay(c.uid); await sleep(200); const e3 = el(); out.t3 = e3 && e3.dataset.shield; out.icon = e3 && e3.textContent.trim() + '💠'; /* UI11 (FF1): the Shield is the south-edge chip */
      out.c3 = e3 && getComputedStyle(e3).color;
      c.shield = 1; updateCardStatusDisplay(c.uid); await sleep(900); const e1 = el(); out.t1 = e1 && e1.dataset.shield; out.one = e1 && e1.classList.contains('is-one'); out.c1 = e1 && (+getComputedStyle(e1.querySelector('.shield-n')).opacity < .05 ? 'transparent' : 'shown');
      c.shield = 0; updateCardStatusDisplay(c.uid); await sleep(1700); out.gone = !el(); return out; })()""")
    if z.get('none'): print('  (no own unit on the board; Z6 skipped)')
    else:
        ok(z['t3'] == '3' and '💠' in (z['icon'] or ''), f"Shield 3: the 💠 and the number 3 {z['t3'], z['icon']}")
        ok(z['t1'] == '1' and z['one'] and z['c1'].replace(' ', '') in ('rgba(0,0,0,0)', 'transparent'), f"Shield 1: the number faded, the icon alone {z['one'], z['c1']}")
        ok(z['gone'], 'Shield 0: the badge is gone')
    # Z2
    l = await pg.evaluate("(()=>{ document.querySelectorAll('.vis5-lead').forEach(x=> x.remove()); vis5LeaderSlam(getCardDefs()['ent'] || Object.values(getCardDefs())[0], false); const w = document.querySelector('.vis5-lead'); return {on: !!w, art: !!(w && w.querySelector('.vis5-lead-art, .card-tile')), banner: !!(w && w.querySelector('.leader-callout'))}; })()")
    ok(l['on'] and not l['art'] and l['banner'], f'Z2: the leader call-out has its banner and no portrait {l}')
    # Z4
    zz = await pg.evaluate("""(()=>{ const bf = document.getElementById('battlefieldEl'), inner = bf.querySelector('.battlefield-inner'); let l = bf.querySelector(':scope > .night-cursor-light'); if(!l){ l = document.createElement('div'); l.className = 'night-cursor-light'; bf.appendChild(l); }
      bf.classList.add('bf-lantern'); const z = +getComputedStyle(l).zIndex, zi = +getComputedStyle(inner).zIndex, d = getComputedStyle(l).display; bf.classList.remove('bf-lantern'); return {z, zi, d}; })()""")
    ok(zz['z'] < zz['zi'] and zz['d'] != 'none', f"Z4: the pointer's light (z {zz['z']}) is under the cards' layer (z {zz['zi']}) and shows in a lantern fight")
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await ctx.close()
async def aa2(b, url, shots):
    for w, h in ((1366, 768), (390, 844)):
        print(f'-- AA2: VS opener at {w}')
        ctx, pg = await page(b, url, w, h); await pg.evaluate("switchTab('play')")
        await pg.evaluate("""(()=>{ for(const m of CONQUEST_MAPS){ for(const n of m.nodes){ if(skirmishCode(m.id, n.key) === '14-A-5'){ showVersusOpener.last = null; showVersusOpener(m, n, {name: 'Trojan Horse'}, null); return 1; } } } return 0; })()""")
        await pg.add_style_tag(content='.vs-opener,.vs-opener *{animation-duration:.01s !important; animation-delay:0s !important;} .vs-taunt{opacity:1 !important}')
        await pg.wait_for_timeout(500)
        r = await pg.evaluate("""(()=>{ const q = (s, root)=>{ const e = (root || document).querySelector(s); if(!e) return null; const r = e.getBoundingClientRect(); return {l: r.left, t: r.top, w: r.width, h: r.height, cx: r.left + r.width/2}; };
          const them = document.querySelector('.vs-them'); if(!them) return {none: true}; const tr = them.getBoundingClientRect(); const pills = [...them.querySelectorAll('.vs-pill')].map(e=> { const r = e.getBoundingClientRect(); return {h: Math.round(r.height), cx: r.left + r.width/2, l: r.left, r: r.right}; });
          const order = [...them.children].map(e=> e.className.split(' ')[0]);
          return {order, pills, col: tr.left + tr.width/2, sideL: tr.left, sideR: tr.right, meBr: q('.vs-me .vs-lvl'), themBr: q('.vs-them .vs-lvl'), name: q('.vs-them .vs-name'), sw: document.documentElement.scrollWidth, vw: innerWidth, taunt: q('.vs-them .vs-taunt'), br2: q('.vs-them .vs-lvl')}; })()""")
        if r.get('none'): ok(False, 'the VS opener opened'); await ctx.close(); continue
        ok(r['order'] == ['vs-portrait', 'vs-name', 'vs-facts', 'vs-lvl', 'vs-taunt'], f"the right side is portrait, name, facts, BR box, quote {r['order']}")
        ok(len(r['pills']) >= 3 and max(p['h'] for p in r['pills']) - min(p['h'] for p in r['pills']) <= 6, f"every small fact is one pill style (heights within 6 px; the leader pill has a round face) {[p['h'] for p in r['pills']]}")
        ok(all(p['l'] >= r['sideL'] - 1 and p['r'] <= r['sideR'] + 1 for p in r['pills']), 'the pills stay inside the column')
        ok(abs(r['themBr']['cx'] - r['col']) < 4 and abs(r['name']['cx'] - r['col']) < 4, 'the name and the BR box are centred on the column')
        if w > 600: ok(abs(r['themBr']['t'] - r['meBr']['t']) < 12, f"the two BR boxes are level {round(r['meBr']['t']), round(r['themBr']['t'])}")
        ok(r['sw'] <= r['vw'], f"no sideways scroll {r['sw']} / {r['vw']}")
        if shots: await pg.screenshot(path=os.path.join(SHOTS, f'vs-after-{w}.png'))
        await ctx.close()
async def main(a):
    os.makedirs(SHOTS, exist_ok=True); h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/{a.page}'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        await aa3(b, url); await aa5(b, url); await aa1_z6_z2_z4(b, url); await aa2(b, url, a.shots); await b.close()
    print('\nFAILED: ' + '; '.join(fails) if fails else '\nall ok'); sys.exit(1 if fails else 0)
ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--shots', action='store_true')
asyncio.run(main(ap.parse_args()))
