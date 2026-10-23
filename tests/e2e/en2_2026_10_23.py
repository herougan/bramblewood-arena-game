#!/usr/bin/env python3
"""Package EN2 (2026-10-23): browser checks and screenshots at 390 and 1366, saved in docs/screens/EN2/.

    python3 tests/e2e/en2_2026_10_23.py            # checks + shots
    python3 tests/e2e/en2_2026_10_23.py --widths 1366

Covers: the Guardian stepping in front of the ally it guards (and staying where it falls when the blow kills it), the Boomerang's return
from a bramble throw (in past the bramble, through the unit in its lane, home) and its return with the thrower gone (to the card in the
thrower's slot), and the Ironclaw Fiddler's 1 s clack and claw. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EN2'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
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
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP)
    await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'en2-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units: [[defId, slot], ...] a side; the CPU is kept from acting
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c);
    m.replayCards = m.replayCards || {}; m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot}; uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900)); window.__en2 = uids; return uids; })"""
TR = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); return el ? {tr: (el.style.left || '') + ' ' + (el.style.top || ''), z: el.style.zIndex || '', r: Math.round(el.getBoundingClientRect().left)} : null; })"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    have = await pg.evaluate("(()=>{ const d = getCardDefs(); return {crab: !!d['ironclaw-fiddler'], guard: Object.keys(d).find(id=> (d[id].effects||{}).guardian && !d[id].token && d[id].health > 0)}; })()")
    ok(have['crab'], f"the Ironclaw Fiddler is in the game's cards ({have})")
    guard = have['guard']
    # ---- Guardian: steps in, takes the hit, slides home
    u = await pg.evaluate(BOARD + f"([['soldier-ant', 0]], [['bee-knight', 0], ['{guard}', -1]])")
    g0 = await pg.evaluate(TR + f"({u['2:-1']})")
    await pg.evaluate(f"""(()=>{{ const m = matchState; m.replayCards = {{}}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {{uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot}})));
      renderVfxForEvent({{type:'hit', side:'A', attUid:{u['1:0']}, attDefId:'soldier-ant', targetSide:'B', targetUid:{u['2:-1']}, targetDefId:'{guard}', guardedUid:{u['2:0']}, guardianRedirect:true, dmg:2, dmgType:'physical', mods:[]}}); }})()""")
    am = await pg.evaluate("(()=>{ const a = animMs(); return a.windup + a.impactPad; })()")
    await pg.wait_for_timeout(max(60, am - 10))
    await pg.evaluate("(()=>{ gsap.globalTimeline.pause(); })()")  # hold the pose for the screenshot (the slide home waits on the timeline)
    g1 = await pg.evaluate(TR + f"({u['2:-1']})")
    await shot(pg, 'guardian-step-in', w)
    await pg.evaluate("(()=>{ gsap.globalTimeline.resume(); })()")
    ok(g1 and g1['tr'].strip() not in ('', '0px 0px') and g1['z'] == '30', f'Guardian: moved in front of the ally it guards at the blow ({g1})')
    await pg.wait_for_timeout(1100)
    g2 = await pg.evaluate(TR + f"({u['2:-1']})")
    ok(g2 and g2['tr'].strip() == '', f'Guardian: slid home after the hit ({g2})')
    await shot(pg, 'guardian-home', w)
    # ---- Guardian: the blow kills it: it stays where it fell
    u = await pg.evaluate(BOARD + f"([['soldier-ant', 0]], [['bee-knight', 0], ['{guard}', -1, 2]])")
    await pg.evaluate(f"""(()=>{{ const m = matchState; m.replayCards = {{}}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {{uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot}})));
      renderVfxForEvent({{type:'hit', side:'A', attUid:{u['1:0']}, attDefId:'soldier-ant', targetSide:'B', targetUid:{u['2:-1']}, targetDefId:'{guard}', guardedUid:{u['2:0']}, guardianRedirect:true, dmg:5, dmgType:'physical', mods:[]}}); }})()""")
    await pg.wait_for_timeout(am + 900)
    g3 = await pg.evaluate(TR + f"({u['2:-1']})")
    ok(g3 and g3['tr'].strip() not in ('', '0px 0px'), f'Guardian: killed, it stays where it took the blow ({g3})')
    await shot(pg, 'guardian-falls', w)
    # ---- Boomerang: a bramble throw's return: past the bramble, through the unit in its lane, home
    u = await pg.evaluate(BOARD + "([['otter-centurion', 0]], [['bee-knight', 0]])")
    await pg.evaluate(f"""(()=>{{ const a = boardCardEl({u['1:0']}), c = hqTileEl('B'); en2BoomCastleThrow(a, c, {{flight:420, key:'{u['1:0']}'}}); }})()""")
    await pg.wait_for_timeout(380); await shot(pg, 'boomerang-throw-at-bramble', w)
    await pg.wait_for_timeout(900)
    await pg.evaluate(f"""(()=>{{ const a = boardCardEl({u['1:0']}), c = hqTileEl('B'), t = boardCardEl({u['2:0']}); window.__bm = []; en2BoomCastleReturn(a, c, t, {{flight:420, key:'{u['1:0']}'}});
      const iv = setInterval(()=>{{ const b = [...document.querySelectorAll('.sfx-boomerang')].pop(); if(b){{ const r = b.getBoundingClientRect(); window.__bm.push([Math.round(r.left + r.width/2), Math.round(r.top + r.height/2)]); }} }}, 40); setTimeout(()=> clearInterval(iv), 1600); }})()""")
    await pg.wait_for_timeout(430); await shot(pg, 'boomerang-return-bramble', w)
    await pg.wait_for_timeout(200); await shot(pg, 'boomerang-return-unit', w)
    await pg.wait_for_timeout(1100)
    path = await pg.evaluate("""(()=>{ const c = hqTileEl('B').getBoundingClientRect(); window.__hq = [c.left, c.top, c.width, c.height]; const _x = 0, t = document.querySelector(`.board-card[data-uid="${window.__en2['2:0']}"]`).getBoundingClientRect(), a = document.querySelector(`.board-card[data-uid="${window.__en2['1:0']}"]`).getBoundingClientRect();
      const near = (p, r, pad)=> p[0] > r.left - pad && p[0] < r.right + pad && p[1] > r.top - pad && p[1] < r.bottom + pad, pts = window.__bm || [];
      return {n: pts.length, castle: pts.some(p=> near(p, c, 30)), unit: pts.some(p=> near(p, t, 20)), home: pts.some(p=> near(p, a, 30)), left: document.querySelectorAll('.sfx-boomerang').length, hq: window.__hq, pts: pts.slice(0, 14)}; })()""")
    ok(path['castle'] and path['unit'] and path['home'], f'Boomerang return: through the bramble, the unit in its lane, then home ({path})')
    ok(path['left'] == 0, 'Boomerang return: one boomerang, gone once caught')
    # ---- Boomerang with its thrower gone: one flight home to the card in its slot
    u = await pg.evaluate(BOARD + "([['soldier-ant', 0]], [['bee-knight', 0]])")
    await pg.evaluate(f"""(()=>{{ window.__bm = []; en2Vfx({{type:'boomerangReturn', side:'A', defId:'otter-centurion', uid:99999, thrownBy:null, homeUid:{u['1:0']}, farUid:{u['2:0']}, lane:0}});
      const iv = setInterval(()=>{{ const b = [...document.querySelectorAll('.sfx-boomerang')].pop(); if(b){{ const r = b.getBoundingClientRect(); window.__bm.push([Math.round(r.left + r.width/2), Math.round(r.top + r.height/2)]); }} }}, 40); setTimeout(()=> clearInterval(iv), 1400); }})()""")
    await pg.wait_for_timeout(600); await shot(pg, 'boomerang-orphan-home', w)
    await pg.wait_for_timeout(900)
    o = await pg.evaluate("""(()=>{ const h = document.querySelector(`.board-card[data-uid="${window.__en2['1:0']}"]`).getBoundingClientRect(), f = document.querySelector(`.board-card[data-uid="${window.__en2['2:0']}"]`).getBoundingClientRect();
      const near = (p, r, pad)=> p[0] > r.left - pad && p[0] < r.right + pad && p[1] > r.top - pad && p[1] < r.bottom + pad, pts = window.__bm || []; return {n: pts.length, far: pts.some(p=> near(p, f, 20)), home: pts.some(p=> near(p, h, 30))}; })()""")
    ok(o['n'] > 5 and o['far'] and o['home'], f'Boomerang, thrower gone: it still flies, through its far target and home to the card in its slot ({o})')
    # ---- The Ironclaw Fiddler: 1 s clack on play, the claw on its attack
    if have['crab']:
        u = await pg.evaluate(BOARD + "([['ironclaw-fiddler', 0]], [['bee-knight', 0]])")
        await pg.evaluate(f"(()=>{{ renderVfxForEvent({{type:'play', side:'A', defId:'ironclaw-fiddler', uid:{u['1:0']}, slot:0}}); }})()")
        await pg.wait_for_timeout(620 + 150)
        c1 = await pg.evaluate(f"(()=>{{ const el = boardCardEl({u['1:0']}); const t = el.querySelector('.card-tile'); return {{claw: document.querySelectorAll('.en2-claw').length, tr: t ? getComputedStyle(t).transform : ''}}; }})()")
        await shot(pg, 'crab-clack-a', w)
        await pg.wait_for_timeout(260); await shot(pg, 'crab-clack-b', w)
        c2 = await pg.evaluate(f"(()=>{{ const t = boardCardEl({u['1:0']}).querySelector('.card-tile'); return {{tr: t ? getComputedStyle(t).transform : ''}}; }})()")
        await pg.wait_for_timeout(900)
        c3 = await pg.evaluate("({claw: document.querySelectorAll('.en2-claw').length})")
        ok(c1['claw'] == 1 and c1['tr'] not in ('none', '') and c2['tr'] != c1['tr'], f'Ironclaw: the clack sways the card side to side with its claw out ({c1}, {c2})')
        ok(c3['claw'] == 0, 'Ironclaw: the clack is over within about 1 s')
        await pg.evaluate(f"(()=>{{ renderVfxForEvent({{type:'hit', side:'A', attUid:{u['1:0']}, attDefId:'ironclaw-fiddler', targetSide:'B', targetUid:{u['2:0']}, targetDefId:'bee-knight', dmg:3, dmgType:'physical', mods:[]}}); }})()")
        am = await pg.evaluate("(()=>{ const a = animMs(); return a.windup + a.impactPad; })()")
        await pg.wait_for_timeout(max(40, am - 60))
        c4 = await pg.evaluate("({claw: document.querySelectorAll('.en2-claw').length})")
        await shot(pg, 'crab-claw-attack', w)
        ok(c4['claw'] == 1, f'Ironclaw: its attack closes the claw on the target ({c4})')
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg.close()

async def main(widths):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        for w in widths: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('shots:', len(shots), 'in', OUT)
    print('FAILED:' if fails else 'all checks passed', len(fails) or '')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366')
    a = ap.parse_args(); asyncio.run(main([int(x) for x in a.widths.split(',')]))
