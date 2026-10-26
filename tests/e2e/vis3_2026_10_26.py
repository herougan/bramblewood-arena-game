#!/usr/bin/env python3
"""Package VIS3 (2026-10-26): browser checks and screenshots at 390 and 1366 of the owner's 10-25 visual notes.
  V1 Trap N's slot: a ring of light-red drops falling into its centre.
  V2 a Bloom copy and an Undead unit back as a token wear the token look.
  V3 no Health bar on units; the Shield is a blue number; the Shield's hit is a rectangle over the card.
  V4 Rampart and Guardian: the blocker moves toward the hit, shakes with an expanding aura, and moves back (or dies there).
  V5 boss nodes and the boss opener (skull frame, dark, bigger, a sting); elites a smaller mark.
  G8 every context pip's glyph centred in its pill.

    python3 tests/e2e/vis3_2026_10_26.py              # checks + shots in tests/out/shots/vis3-*.png (a few kept in docs/screens/VIS3/)
    python3 tests/e2e/vis3_2026_10_26.py --widths 1366

Build first. Every fight calls skipTriggerLesson() and the test player has had its level-track rewards. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'VIS3')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){}"
       " FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');}); saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){}"
       " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; window.playDialogue = async ()=>({});")
OPEN = """(async ([mapId, key])=>{ const p = loadConquestProgress(); CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ if(m.id === mapId && n.key === key) return; const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)){ p.completed.push(id); p.ranks[id] = 'S'; } }));
  saveConquestProgress(p); switchTab('play'); await new Promise(r=> setTimeout(r, 400)); conquestSelectedMap = mapId; conquestSelectedNodeKey = null; renderPlay(); await new Promise(r=> setTimeout(r, 900));
  const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{}; })"""
# a fight whose board is exactly the given units (as tests/e2e/en8_2026_10_24.py); the CPU is kept from acting
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){}
  switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp, extra])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot; Object.assign(c, extra || {});
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  return uids; })"""
fails = []; shots = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def close(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

async def shot(pg, name, w, clip=None, pad=24):
    f = os.path.join(OUT, f'vis3-{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None
    bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': bb['width'] + 2 * pad, 'height': bb['height'] + 2 * pad}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    shots.append(f); return f

async def run(b, url, w):
    print(f'-- width {w}')
    # ---- V1 V2 V3 G8: one board. Yours: a Bloom copy, an Undead token, a shielded unit, a Shell unit; theirs: a Flyer, a Tide unit. A trap on
    # their empty slot 1 and on your empty slot -2.
    pg = await fresh(b, url, w)
    u = await pg.evaluate(BOARD + """([['otter-kit', 0, 6, {bloomCopy: true, bloomOf: 1}], ['otter-kit', 1, 5, {undeadToken: true, token: true, revivedOnce: true}], ['otter-kit', -1, 7, {shield: 3}], ['limpet-clinger', 2, 5]],
      [['voidfeather-scout', 0, 5], ['otter-kit', -1, 4, {tempHp: 2, shellUntil: 1, shellArmor: 2}], ['conch-crawler', -2, 6]])""")
    r = await pg.evaluate("""(async()=>{ const m = matchState, e = m.engine; const real = e.getHazards;
      e.getHazards = ()=> Object.assign({}, real ? real() : {}, {'2:s1': {trap: 3}, '1:s-2': {trap: 2}}); renderMatchUI(); await new Promise(r=> setTimeout(r, 700));
      const ring = document.querySelector('.board-card .vis3-trap-ring'), drops = ring ? ring.querySelectorAll('i').length : 0, anim = ring ? getComputedStyle(ring.querySelector('i')).animationName : '';
      const card = uid=> document.querySelector('.board-card[data-uid="' + uid + '"]');
      return {rings: document.querySelectorAll('.vis3-trap-ring').length, drops, anim}; })()""")
    ok(r['rings'] >= 2 and r['drops'] == 8 and r['anim'] == 'vis3TrapFall', f"V1. a trapped slot has the falling ring (8 drops) on both rows {r}")
    await pg.wait_for_timeout(500)
    await shot(pg, 'board-trap-token-shield', w, '#battlefieldEl', 4)
    r = await pg.evaluate(f"""(()=>{{ const card = uid=> document.querySelector('.board-card[data-uid="' + uid + '"]');
      const sh = card({u['1:-1']}), num = sh && sh.querySelector('.vis3-shield-num'), shell = card({u['2:-1']}), sn = shell && shell.querySelector('.vis3-shield-num');
      const plain = card({u['1:0']}), und = card({u['1:1']});
      return {{bloomTok: plain.classList.contains('is-token'), undeadTok: und.classList.contains('is-token'), shieldNum: num ? num.textContent : null, color: num ? getComputedStyle(num).color : null,
        chip: !!document.querySelector('.abadge.unit-shield'), shellNum: sn ? sn.textContent : null, bars: [...document.querySelectorAll('.eq2-hpbar')].filter(b=> b.offsetWidth > 0).length}}; }})()""")
    ok(r['bloomTok'] and r['undeadTok'], f"V2. the Bloom copy and the Undead token wear is-token {r['bloomTok']} {r['undeadTok']}")
    # 2026-10-26 (package FIN1, VIS3-1): a board token wears a pale wash over its art (the .ico ::after), in the light and in the dark theme; a plain card has none.
    for theme in ('light', 'dark'):
        wr = await pg.evaluate(f"""(()=>{{ document.documentElement.setAttribute('data-theme', '{theme}'); const card = uid=> document.querySelector('.board-card[data-uid="' + uid + '"]');
          const wash = el=> {{ const ico = el && el.querySelector('.card-tile > .ico'); if(!ico) return null; const cs = getComputedStyle(ico, '::after'); return {{content: cs.content, bg: cs.backgroundImage, w: cs.width}}; }};
          return {{bloom: wash(card({u['1:0']})), undead: wash(card({u['1:1']})), plain: wash(card({u['1:-1']}))}}; }})()""")
        has = lambda x: bool(x) and x['content'] not in ('none', 'normal') and 'gradient' in x['bg']
        ok(has(wr['bloom']) and has(wr['undead']) and not has(wr['plain']), f"FIN1 VIS3-1. {theme}: Bloom copy and Undead token have the wash, a plain unit does not {wr}")
        await pg.wait_for_timeout(200)
        await shot(pg, 'board-token-wash-' + theme, w, '#battlefieldEl', 4)
    await pg.evaluate("document.documentElement.removeAttribute('data-theme')")
    ok(r['shieldNum'] == '3' and r['color'] and 'rgb(143, 210, 255)' in r['color'] and not r['chip'], f"V3. Shield 3 is a blue number on the card, no 💠 chip {r}")
    ok(r['shellNum'] == '2' and r['bars'] == 0, f"V3. Shell's temporary Health is the blue number too; no Health bar shows {r['shellNum']} {r['bars']}")
    # the live refresh: the shield drops 3 -> 1, then breaks
    r = await pg.evaluate(f"""(async()=>{{ const m = matchState, c = m.engine.allBoardCards(m.players[1]).find(x=> x.uid === {u['1:-1']}); const el = document.querySelector('.board-card[data-uid="{u['1:-1']}"]');
      c.shield = 1; updateCardStatusDisplay({u['1:-1']}); const a = (el.querySelector('.vis3-shield-num')||{{}}).textContent;
      renderVfxForEvent({{type:'shieldSoak', uid:{u['1:-1']}, defId:c.defId, soaked:2, left:1}}); await new Promise(r=> setTimeout(r, 120));
      const dome = document.querySelector('.fxa-dome'), br = dome ? getComputedStyle(dome, '::before').borderRadius : null, round = dome ? getComputedStyle(dome).borderRadius : null;
      return {{a, br, round, dome: !!dome}}; }})()""")
    ok(r['a'] == '1', f"V3. the number follows the Shield live {r['a']}")
    ok(r['dome'] and r['br'] == '12px' and r['round'] in ('0px', '0%'), f"V3. the Shield's hit is a rounded rectangle over the card, not a dome {r}")
    await shot(pg, 'shield-hit-rect', w, f'.board-card[data-uid="{u["1:-1"]}"]', 40)
    # G8: every pip's glyph centred in its pill (the turtle pip was a few px low and left)
    await shot(pg, 'pips', w, f'.board-card[data-uid="{u["2:-2"]}"]', 30)
    # the drawn part of each pip picture (its opaque pixels), where it lands on screen after the shift, against its pill's middle: up and down
    # for every pip, across too for a pip that is a picture alone (one with a number beside it is centred as a pair)
    r = await pg.evaluate("""(()=>{ const out = [], N = 48, cv = document.createElement('canvas'); cv.width = N; cv.height = N; const g = cv.getContext('2d');
      document.querySelectorAll('#battlefieldEl .board-card .badges > .abadge').forEach(p=>{ const pr = p.getBoundingClientRect(), imgs = p.querySelectorAll('img'); if(!pr.width || imgs.length !== 1) return;
        const img = imgs[0], ir = img.getBoundingClientRect(), s = vis3PipSource(img); if(!s || !s.im) return; g.clearRect(0, 0, N, N); g.drawImage(s.im, s.sx, s.sy, s.sw, s.sh, 0, 0, N, N); const d = g.getImageData(0, 0, N, N).data; let x0 = N, y0 = N, x1 = -1, y1 = -1;
        for(let y = 0; y < N; y++) for(let x = 0; x < N; x++) if(d[(y * N + x) * 4 + 3] > 60){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        const vx = ir.left + (x0 + x1 + 1) / 2 / N * ir.width, vy = ir.top + (y0 + y1 + 1) / 2 / N * ir.height, alone = !p.textContent.trim();
        out.push({t: img.alt, alone, shift: img.style.translate || '', drawn: [x0, y0, x1, y1], dx: alone ? Math.round((vx - (pr.left + pr.width/2)) * 10) / 10 : 0, dy: Math.round((vy - (pr.top + pr.height/2)) * 10) / 10}); });
      return out; })()""")
    worst = max([max(abs(x['dx']), abs(x['dy'])) for x in r] or [0])
    turtle = [x for x in r if x['t'] == '🐢']
    ok(len(r) >= 4 and worst <= 1.6 and turtle and turtle[0]['shift'], f"G8. every context pip's glyph sits in the middle of its pill (worst {worst}px; the turtle shifted {turtle[:1]}) {r[:8]}")
    await close(pg)

    # ---- V4: Rampart steps toward its bramble, pulses, steps back; one the share kills stays; the Guardian pulses as it blocks
    pg = await fresh(b, url, w)
    u = await pg.evaluate(BOARD + "([['otter-kit', 0, 9], ['otter-kit', 1, 1]], [['otter-kit', 0, 9]])")
    # read by the card's own offset (left / top, what the step moves) rather than its place on screen: software rendering under load lags the
    # tweens, and the board may settle around it; the tweens are run to their end before each reading
    FIN = "gsap.globalTimeline.getChildren(true, true, true).forEach(t=>{ try{ t.progress(1); }catch(e){} });"
    OFF = "(el=> Math.round(Math.hypot(parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0)))"
    await pg.wait_for_timeout(1200)
    r = await pg.evaluate(f"""(async()=>{{ const am = animMs(), at = am.windup + am.impactPad, el = document.querySelector('.board-card[data-uid="{u['1:0']}"]');
      matchState.replayCards = {{}}; renderVfxForEvent({{type:'rampart', side:'A', uid:{u['1:0']}, defId:'otter-kit', dmg:2, share:2, bramble:1}});
      await new Promise(r=> setTimeout(r, at + 20)); const aura = document.querySelectorAll('.vis3-block-aura').length; {FIN} const moved = {OFF}(el), blocking = el.classList.contains('vis3-blocking');
      await new Promise(r=> setTimeout(r, 900)); {FIN}
      return {{moved, blocking, aura, back: {OFF}(el), after: el.classList.contains('vis3-blocking')}}; }})()""")
    ok(r['moved'] >= 8 and r['blocking'] and r['aura'] >= 1 and r['back'] == 0 and not r['after'], f"V4. Rampart moves toward its bramble, pulses with an aura, moves back {r}")
    r = await pg.evaluate(f"""(async()=>{{ const am = animMs(), at = am.windup + am.impactPad, el = document.querySelector('.board-card[data-uid="{u['1:1']}"]');
      matchState.replayCards = {{[{u['1:1']}]: {{hp: 1, defId: 'otter-kit'}}}}; renderVfxForEvent({{type:'rampart', side:'A', uid:{u['1:1']}, defId:'otter-kit', dmg:2, share:2, bramble:1}});
      await new Promise(r=> setTimeout(r, at + 1300)); {FIN} matchState.replayCards = null;
      return {{stays: {OFF}(el)}}; }})()""")
    ok(r['stays'] >= 8, f"V4. a Rampart unit its share kills stays where it blocked {r}")
    r = await pg.evaluate(f"""(async()=>{{ const el = document.querySelector('.board-card[data-uid="{u['1:0']}"]'); vis3BlockPulse(el); await new Promise(r=> setTimeout(r, 90));
      return {{aura: document.querySelectorAll('.vis3-block-aura').length, src: String(en2GuardStepIn).includes('vis3BlockPulse')}}; }})()""")
    ok(r['aura'] >= 1 and r['src'], f"V4. the Guardian's step-in pulses with the same aura {r}")
    await shot(pg, 'block-aura', w, '#battlefieldEl', 4)
    await close(pg)

    # ---- V5: Map 5 (the Mire): its boss 5-7 and elites on the map, then the boss's and an elite's opener
    pg = await fresh(b, url, w)
    await pg.evaluate(OPEN, ['mw', '5-7']); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("""(()=>{ const b = document.querySelector('.map-node[data-lkey="5-7"]'), e = document.querySelector('.map-node[data-lkey="5-5"]'), s = document.querySelector('.map-node[data-lkey="5-1"]');
      const W = el=> el ? Math.round(el.getBoundingClientRect().width) : 0;
      return {boss: !!(b && b.querySelector('.vis3-skull-frame')), bossW: W(b), bg: b ? getComputedStyle(b).backgroundImage.slice(0, 40) : '', elite: !!(e && e.querySelector('.vis3-elite-frame')), eliteW: W(e), plainW: W(s),
        crest: b ? Math.round(b.querySelector('.map-node-kind').getBoundingClientRect().top - b.getBoundingClientRect().top) : null, sting: typeof SoundKit.bossSting === 'function'}; })()""")
    ok(r['boss'] and r['bossW'] >= r['plainW'] + 12 and 'radial-gradient' in r['bg'] and r['crest'] is not None and r['crest'] < 0, f"V5. the boss node: bigger, dark, a skull frame and crest {r}")
    ok(r['elite'] and r['plainW'] < r['eliteW'] < r['bossW'], f"V5. an elite node: a smaller violet mark {r['eliteW']} (plain {r['plainW']}, boss {r['bossW']})")
    ok(r['sting'], 'V5. SoundKit.bossSting exists')
    await shot(pg, 'map5-boss-elite', w, '.conquest-map-canvas', 0)
    r = await pg.evaluate("""(()=>{ const f = findConquestNode('mw', '5-7'); showVersusOpener(f.map, f.node, CHARACTER_DEFS.castle, null); const el = document.querySelector('.vs-opener');
      return {boss: !!(el && el.classList.contains('is-boss')), frame: !!(el && el.querySelector('.vs-rival-ico .vis3-skull-frame')), kind: el ? el.querySelector('.vs-kind').className : ''}; })()""")
    await pg.wait_for_timeout(900)
    ok(r['boss'] and r['frame'] and 'vis3-kind-boss' in r['kind'], f"V5. the boss opener has the skull frame and a red BOSS {r}")
    await shot(pg, 'vs-boss-5-7', w)
    await pg.wait_for_timeout(2600)
    r = await pg.evaluate("""(()=>{ const f = findConquestNode('mw', '5-5'); showVersusOpener(f.map, f.node, CHARACTER_DEFS.castle, null); const el = document.querySelector('.vs-opener');
      return {elite: !!(el && el.querySelector('.vs-rival-ico .vis3-elite-frame'))}; })()""")
    await pg.wait_for_timeout(900)
    ok(r['elite'], f"V5. an elite opener has its smaller mark {r}")
    await shot(pg, 'vs-elite-5-5', w)
    await close(pg)

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots:
            if any(k in f for k in ('board-trap-token-shield', 'board-token-wash', 'map5-boss-elite', 'vs-boss-5-7', 'block-aura', 'shield-hit-rect')): shutil.copy(f, KEEP)
    print('\n'.join(shots)); print(('FAILED: ' + str(len(fails))) if fails else 'all ok')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true', help='copy the main shots into docs/screens/VIS3/')
    asyncio.run(main(ap.parse_args()))
