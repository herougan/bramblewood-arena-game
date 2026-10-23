#!/usr/bin/env python3
"""Package EN4 (2026-10-23): browser checks and screenshots at 390 and 1366, saved in docs/screens/EN4/.

    python3 tests/e2e/en4_2026_10_23.py            # checks + shots
    python3 tests/e2e/en4_2026_10_23.py --widths 1366

Covers: one Guardian steps in and the Guardian beside it stays put (owner 22:23 #9, EN3's chain reverted), Hemorrhage doubling a Bleed (its
drops, the doubled pip), Greater Poison turning Poison (the violet pip) and its tick (1 a stack, the stack stays), Shore Up's shield hopping to
the allies beside it (19:27 #4 B), and the three skills in the card editor's list. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EN4'); os.makedirs(OUT, exist_ok=True)
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
    f = os.path.join(OUT, f'en4-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units (as tests/e2e/en3_2026_10_23.py); the CPU is kept from acting
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, poison:0, bleed:0, gpoison:0, shield:0})));
  window.__en4 = uids; return uids; })"""
TR = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); return el ? {tr: (el.style.left || '') + ' ' + (el.style.top || ''), z: el.style.zIndex || ''} : null; })"
BADGES = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); return el ? [...el.querySelectorAll('.abadge')].map(b=> (b.className.replace('abadge', '').trim()) + ':' + b.textContent.trim()) : null; })"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    have = await pg.evaluate("(()=>{ const d = getCardDefs(); return {guard: Object.keys(d).find(id=> (d[id].effects||{}).guardian && !d[id].token && d[id].health > 0), toad: !!d['cane-toad'], skua: !!d['great-skua'], oyster: !!d['oyster-bank'], ox: !!d['musk-ox-matriarch'], taipan: !!d['inland-taipan'], shark: !!d['bloodscent-shark']}; })()")
    ok(all(have[k] for k in ('toad', 'skua', 'oyster', 'ox', 'taipan', 'shark')), f'the six new cards are in the game ({have})')
    guard = have['guard']
    am = await pg.evaluate("(()=>{ const a = animMs(); return a.windup + a.impactPad; })()")
    # ---- #9 one Guardian steps in; the Guardian beside it stays put
    u = await pg.evaluate(BOARD + f"([['soldier-ant', 0]], [['bee-knight', 0], ['{guard}', -1], ['{guard}', -2]])")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'hit', side:'A', attUid:{u['1:0']}, attDefId:'soldier-ant', targetSide:'B', targetUid:{u['2:-1']}, targetDefId:'{guard}', guardedUid:{u['2:0']}, guardianRedirect:true, dmg:2, dmgType:'physical', mods:[]}}); }})()""")
    await pg.wait_for_timeout(max(60, am - 10))
    await pg.evaluate("(()=>{ gsap.globalTimeline.pause(); })()")
    g1 = await pg.evaluate(TR + f"({u['2:-1']})"); g2 = await pg.evaluate(TR + f"({u['2:-2']})")
    await shot(pg, 'guardian-no-chain', w)
    await pg.evaluate("(()=>{ gsap.globalTimeline.resume(); })()")
    ok(g1 and g1['tr'].strip() not in ('', '0px 0px') and g2 and g2['tr'].strip() == '', f'#9 the Guardian steps in, the Guardian beside it does not ({g1}, {g2})')
    await pg.wait_for_timeout(1300)
    # ---- Hemorrhage: Bleed 3 -> 6
    u = await pg.evaluate(BOARD + "([['great-skua', 0]], [['bee-knight', 0, 20]])")
    await pg.evaluate(f"(()=>{{ matchState.replayCards[{u['2:0']}].bleed = 3; updateCardStatusDisplay({u['2:0']}); }})()")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'statusFx', kind:'hemorrhage', side:'A', attUid:{u['1:0']}, attDefId:'great-skua', targetSide:'B', targetUid:{u['2:0']}, targetDefId:'bee-knight', from:3, total:6}}); }})()""")
    await pg.wait_for_timeout(am + 110)
    h = await pg.evaluate(f"(()=>({{drops: document.querySelectorAll('.en4-hemo-drop').length, bleed: matchState.replayCards[{u['2:0']}].bleed, log: (en4LogText({{type:'statusFx', kind:'hemorrhage', attDefId:'great-skua', targetDefId:'bee-knight', from:3, total:6}}, id=> (getCardDefs()[id]||{{}}).name) || {{}}).text}}))()")
    hb = await pg.evaluate(BADGES + f"({u['2:0']})")
    await shot(pg, 'bleed-doubling', w)
    ok(h['drops'] == 2 and h['bleed'] == 6 and any(x.startswith('bleed:') and x.endswith('6') for x in (hb or [])), f'Hemorrhage: two drops split off, the Bleed pip reads 6 ({h}, {hb})')
    ok('3 → 6' in (h['log'] or ''), f"the log line names the doubling ({h['log']})")
    await pg.wait_for_timeout(900)
    # ---- Greater Poison: Poison 3 turned (+1), its own Poison 1 plain; then the tick
    u = await pg.evaluate(BOARD + "([['cane-toad', 0]], [['bee-knight', 0, 30]])")
    await pg.evaluate(f"(()=>{{ matchState.replayCards[{u['2:0']}].poison = 3; updateCardStatusDisplay({u['2:0']}); }})()")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'statusFx', kind:'greaterPoison', side:'A', attUid:{u['1:0']}, attDefId:'cane-toad', targetSide:'B', targetUid:{u['2:0']}, targetDefId:'bee-knight', converted:3, amount:1, total:4, poison:1}}); }})()""")
    await pg.wait_for_timeout(am + 90)
    gb = await pg.evaluate(BADGES + f"({u['2:0']})")
    sk = await pg.evaluate("(()=> document.querySelectorAll('.en4-gp-skull').length)()")
    await shot(pg, 'greater-poison-conversion', w)
    ok(sk == 1 and any(x.startswith('gpoison:') and x.endswith('4') for x in (gb or [])) and any(x.startswith('poison:') and x.endswith('1') for x in (gb or [])), f'Greater Poison: the violet 💀 4 pip, ☠ 1 left, the skull pops ({gb}, skull {sk})')
    col = await pg.evaluate(f"(()=>{{ const el = document.querySelector(`.board-card[data-uid=\"{u['2:0']}\"] .abadge.gpoison`), p = document.querySelector(`.board-card[data-uid=\"{u['2:0']}\"] .abadge.poison`); return el && p ? [getComputedStyle(el).color, getComputedStyle(p).color] : null; }})()")
    ok(col and col[0] != col[1], f'the Greater Poison pip has its own colour ({col})')
    await pg.wait_for_timeout(700)
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'greaterPoisonTick', side:'B', defId:'bee-knight', uid:{u['2:0']}, dmg:4, stack:4, decay:false, mods:[]}}); }})()""")
    t1 = await pg.evaluate(f"(()=>({{hp: matchState.replayCards[{u['2:0']}].hp, gp: matchState.replayCards[{u['2:0']}].gpoison}}))()")
    await pg.wait_for_timeout(260); await shot(pg, 'greater-poison-tick', w)
    await pg.wait_for_timeout(500)
    t2 = await pg.evaluate(f"(()=>({{hp: matchState.replayCards[{u['2:0']}].hp, gp: matchState.replayCards[{u['2:0']}].gpoison}}))()")
    ok(t1['hp'] == 26 and t1['gp'] == 4 and t2['gp'] == 4, f'its tick: 4 damage (1 a stack), and the stack stays (owner 23:45) ({t1} -> {t2})')
    # ---- Shore Up: the shield hops to both allies beside it
    u = await pg.evaluate(BOARD + "([['soldier-ant', 0]], [['oyster-bank', 0, 15], ['bee-knight', -1], ['bee-knight', 1]])")
    await pg.evaluate("""(()=>{ window.__hop = []; window.__iv = setInterval(()=>{ const s = [...document.querySelectorAll('.en4-shore-shield')]; if(s.length) window.__hop.push(s.map(x=>{ const r = x.getBoundingClientRect(); return [Math.round(r.left + r.width/2), Math.round(r.top + r.height/2)]; })); }, 30); })()""")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'shoreUp', side:'B', uid:{u['2:0']}, defId:'oyster-bank', targets:[{u['2:-1']}, {u['2:1']}]}});
      [{u['2:-1']}, {u['2:1']}].forEach(t=> renderVfxForEvent({{type:'statusFx', kind:'unitShield', side:'B', attUid:{u['2:0']}, attDefId:'oyster-bank', targetSide:'B', targetUid:t, targetDefId:'bee-knight', amount:1, total:1}})); }})()""")
    await pg.wait_for_timeout(am + 170)
    await shot(pg, 'shore-up', w)
    await pg.wait_for_timeout(900)
    hop = await pg.evaluate(f"""(()=>{{ clearInterval(window.__iv); const pts = window.__hop || [], R = u=> document.querySelector(`.board-card[data-uid="${{u}}"]`).getBoundingClientRect();
      const a = R({u['2:0']}), l = R({u['2:-1']}), r = R({u['2:1']}), cx = x=> x.left + x.width/2;
      const xs = pts.flat().map(p=> p[0]); return {{frames: pts.length, two: pts.some(f=> f.length === 2), reachL: xs.some(x=> Math.abs(x - cx(l)) < l.width/2), reachR: xs.some(x=> Math.abs(x - cx(r)) < r.width/2), left: document.querySelectorAll('.en4-shore-shield').length}}; }})()""")
    ok(hop['frames'] > 3 and hop['two'] and hop['reachL'] and hop['reachR'] and hop['left'] == 0, f'Shore Up: a shield hops to each ally beside it and clears away ({hop})')
    # ---- the card editor's skill list, the Codex notes, the log
    ed = await pg.evaluate("""(()=>({keys: ['hemorrhage', 'greaterPoison', 'shoreUp'].filter(k=> PASSIVE_DEFS.some(d=> d.key === k && d.label && d.codexNote)), gp: SKILL_TEXT.greaterPoison(2), su: SKILL_TEXT.shoreUp(),
      tick: (en4LogText({type:'greaterPoisonTick', defId:'bee-knight', dmg:4}, id=> (getCardDefs()[id]||{}).name) || {}).text}))()""")
    ok(len(ed['keys']) == 3 and '2' in (ed['gp'] or '') and 'Shield 1' in (ed['su'] or '') and 'Greater Poison' in (ed['tick'] or ''), f'the editor lists the three skills with Codex notes; texts and log ({ed})')
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
