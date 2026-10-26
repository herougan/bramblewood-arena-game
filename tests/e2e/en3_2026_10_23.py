#!/usr/bin/env python3
"""Package EN3 (2026-10-23): browser checks and screenshots at 390 and 1366, saved in docs/screens/EN3/.

    python3 tests/e2e/en3_2026_10_23.py            # checks + shots
    python3 tests/e2e/en3_2026_10_23.py --widths 1366

Covers (owner 19:27): a Boomerang thrown on a miss (#7), a Guardian stepping in with no guard line (#19; #8's chain reverted by EN4), Rampart's
streak and share (#3), Bramble Armor's ting on the bramble (#3), the two skills in the card editor's list, and a Poison tick's stack dropping
after its damage (#5). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EN3'); os.makedirs(OUT, exist_ok=True)
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
    f = os.path.join(OUT, f'en3-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units: [[defId, slot, hp?], ...] a side; the CPU is kept from acting (as tests/e2e/en2_2026_10_23.py)
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, poison:c.poison||0})));
  window.__en3 = uids; return uids; })"""
TR = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); return el ? {tr: (el.style.left || '') + ' ' + (el.style.top || ''), z: el.style.zIndex || ''} : null; })"
TRACK = """(sel=>{ window.__pts = []; const iv = setInterval(()=>{ const b = [...document.querySelectorAll(sel)].pop(); if(b){ const r = b.getBoundingClientRect(); window.__pts.push([Math.round(r.left + r.width/2), Math.round(r.top + r.height/2)]); } }, 30); setTimeout(()=> clearInterval(iv), 1500); })"""

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    have = await pg.evaluate("(()=>{ const d = getCardDefs(); return {guard: Object.keys(d).find(id=> (d[id].effects||{}).guardian && !d[id].token && d[id].health > 0), ramp: Object.keys(d).find(id=> (d[id].effects||{}).rampart)}; })()")
    guard, ramp = have['guard'], have['ramp'] or 'riverworks-bastion'
    ok(have['ramp'] == 'riverworks-bastion', f"Rampart is on Riverworks Bastion in the game's cards ({have})")
    am = await pg.evaluate("(()=>{ const a = animMs(); return a.windup + a.impactPad; })()")
    # ---- #7 Boomerang thrown on a miss
    u = await pg.evaluate(BOARD + "([['otter-centurion', 0]], [['bee-knight', 0]])")
    await pg.evaluate(TRACK + "('.sfx-boomerang')")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'blindMiss', side:'A', attUid:{u['1:0']}, attDefId:'otter-centurion', targetKind:'card', targetUid:{u['2:0']}}});
      renderVfxForEvent({{type:'boomerangThrow', miss:true, side:'A', uid:{u['1:0']}, defId:'otter-centurion', targetSide:'B', targetUid:{u['2:0']}}}); }})()""")
    await pg.wait_for_timeout(am + 120); await shot(pg, 'boomerang-thrown-on-a-miss', w)
    await pg.wait_for_timeout(1300)
    bm = await pg.evaluate("""(()=>{ const t = document.querySelector(`.board-card[data-uid="${window.__en3['2:0']}"]`).getBoundingClientRect(), a = document.querySelector(`.board-card[data-uid="${window.__en3['1:0']}"]`).getBoundingClientRect(), pts = window.__pts || [];
      const near = (p, r, pad)=> p[0] > r.left - pad && p[0] < r.right + pad && p[1] > r.top - pad && p[1] < r.bottom + pad;
      return {n: pts.length, fromThrower: pts.slice(0, 4).some(p=> near(p, a, 40)), nearTarget: pts.some(p=> near(p, t, 90)), left: document.querySelectorAll('.sfx-boomerang').length}; })()""")
    ok(bm['n'] > 5 and bm['fromThrower'] and bm['nearTarget'], f'#7 a missed swing still throws: the boomerang flies from the thrower past its target ({bm})')
    # ---- #8 / #19 Guardian for a Guardian, no line. EN4 (2026-10-23, owner 22:23 #9: "Guardian shouldn't intercept an intercepting
    # guardian."): the chain is reverted, so the event names the first Guardian and only it steps in; the second stays put. The shot is
    # tests/e2e/en4_2026_10_23.py's guardian-no-chain now (none taken here).
    u = await pg.evaluate(BOARD + f"([['soldier-ant', 0]], [['bee-knight', 0], ['{guard}', -1], ['{guard}', -2]])")
    # the old guard line: FX.A.guardPull's dashed path (stroke-dasharray "8 6") in an fxa-svg layer; watched every 25 ms through the blow
    await pg.evaluate("""(()=>{ window.__lines = 0; window.__mo = setInterval(()=>{ if(document.querySelector('svg.fxa-svg path[stroke-dasharray="8 6"]')) window.__lines++; }, 25); })()""")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'hit', side:'A', attUid:{u['1:0']}, attDefId:'soldier-ant', targetSide:'B', targetUid:{u['2:-1']}, targetDefId:'{guard}', guardedUid:{u['2:0']}, guardianRedirect:true, dmg:2, dmgType:'physical', mods:[]}}); }})()""")
    await pg.wait_for_timeout(max(60, am - 10))
    await pg.evaluate("(()=>{ gsap.globalTimeline.pause(); })()")
    g1 = await pg.evaluate(TR + f"({u['2:-1']})"); g2 = await pg.evaluate(TR + f"({u['2:-2']})")
    await pg.evaluate("(()=>{ gsap.globalTimeline.resume(); })()")
    ok(g1 and g2 and g1['tr'].strip() not in ('', '0px 0px') and g2['tr'].strip() == '', f'#8 (EN4) one Guardian steps in, the one beside it does not (first {g1}, second {g2})')
    await pg.wait_for_timeout(1300)
    ln = await pg.evaluate("(()=>{ clearInterval(window.__mo); return {lines: window.__lines, patched: !!(window.FX && FX.A && FX.A.__en3)}; })()")
    ok(ln['lines'] == 0 and ln['patched'], f'#19 no guard line drawn ({ln})')
    g3 = await pg.evaluate(TR + f"({u['2:-1']})"); ok(g3 and g3['tr'].strip() == '', f'#8 the Guardian slides home ({g3})')
    # ---- #3 Rampart and Bramble Armor
    u = await pg.evaluate(BOARD + f"([['soldier-ant', 0]], [['{ramp}', 1, 30]])")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'rampart', side:'B', uid:{u['2:1']}, defId:'{ramp}', dmg:3, share:3, bramble:2}});
      renderVfxForEvent({{type:'brambleArmor', side:'B', uid:{u['2:1']}, defId:'{ramp}', blocked:1}}); }})()""")
    await pg.wait_for_timeout(am + 70)
    r1 = await pg.evaluate(f"(()=>({{streak: document.querySelectorAll('.en3-rampart-streak').length, hp: (matchState.replayCards[{u['2:1']}]||{{}}).hp}}))()")
    await shot(pg, 'rampart-share', w)
    await pg.wait_for_timeout(120)
    r2 = await pg.evaluate("(()=>({ting: document.querySelectorAll('.en3-bramble-ting').length}))()")
    await shot(pg, 'bramble-armor-ting', w)
    ok(r1['streak'] == 1 and r1['hp'] == 27, f'#3 Rampart: the streak from the bramble to the unit, its Health down by its share ({r1})')
    ok(r2['ting'] == 1, f'#3 Bramble Armor: the shield ting on the bramble ({r2})')
    await pg.wait_for_timeout(900)
    r3 = await pg.evaluate("(()=>({streak: document.querySelectorAll('.en3-rampart-streak').length, ting: document.querySelectorAll('.en3-bramble-ting').length}))()")
    ok(r3['streak'] == 0 and r3['ting'] == 0, f'#3 the looks clear away ({r3})')
    # ---- #5 a Poison tick: the damage first, the stack a beat later
    u = await pg.evaluate(BOARD + "([['soldier-ant', 0]], [['bee-knight', 0]])")
    await pg.evaluate(f"(()=>{{ matchState.replayCards[{u['2:0']}].poison = 3; renderVfxForEvent({{type:'poisonTick', side:'B', defId:'bee-knight', uid:{u['2:0']}, dmg:3, decay:true, mods:[]}}); }})()")
    p1 = await pg.evaluate(f"(()=>({{hp: matchState.replayCards[{u['2:0']}].hp, poison: matchState.replayCards[{u['2:0']}].poison}}))()")
    await pg.wait_for_timeout(700)
    p2 = await pg.evaluate(f"(()=>({{hp: matchState.replayCards[{u['2:0']}].hp, poison: matchState.replayCards[{u['2:0']}].poison}}))()")
    ok(p1['hp'] == 6 and p1['poison'] == 3 and p2['poison'] == 2, f'#5 Poison: damage now, the stack drops after ({p1} -> {p2})')
    # ---- the card editor's skill list
    ed = await pg.evaluate("(()=>({ramp: PASSIVE_DEFS.some(d=> d.key === 'rampart' && /Rampart/.test(d.label)), armor: PASSIVE_DEFS.some(d=> d.key === 'brambleArmor' && /Fortify/.test(d.label) /* 2026-10-26 (FIN2-a): renamed from Bramble Armor */), txt: SKILL_TEXT.rampart && SKILL_TEXT.rampart()}))()")
    ok(ed['ramp'] and ed['armor'] and 'bramble' in (ed['txt'] or ''), f'the editor lists Rampart and Bramble Armor ({ed})')
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
