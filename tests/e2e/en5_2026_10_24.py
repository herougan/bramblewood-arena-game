#!/usr/bin/env python3
"""Package EN5 (2026-10-24): browser checks and screenshots at 390 and 1366, saved in docs/screens/EN5/.

    python3 tests/e2e/en5_2026_10_24.py            # checks + shots
    python3 tests/e2e/en5_2026_10_24.py --widths 1366

Covers: Breach's chip into the enemy bramble (the bramble's Health drops by N), Canopy Cover's leafy dodge, a state skill turning on (its lit
pip and float), a Bloom chain (a copy that bloomed too, its line no longer says it can't), the Group Dungeon's people row (the Dungeons tab
card and the lobby), Deadly Poison in the editor's list. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EN5'); os.makedirs(OUT, exist_ok=True)
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
    f = os.path.join(OUT, f'en5-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units (as tests/e2e/en4_2026_10_23.py); the CPU is kept from acting
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, poison:0, bleed:0, gpoison:0, shield:0, en5On:''})));
  return uids; })"""
BADGES = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); return el ? [...el.querySelectorAll('.abadge')].map(b=> (b.className.replace('abadge', '').trim()) + ':' + (b.dataset.en5 || b.textContent.trim())) : null; })"
HQ = "(side=>{ const m = matchState; return m && m.displayHqHp ? m.displayHqHp[side] : (m.players[side === 'A' ? 1 : 2].hq.hp); })"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    am = await pg.evaluate("(()=>{ const a = animMs(); return a.windup + a.impactPad; })()")
    # ---- Breach: the chip flies to the enemy bramble, its Health drops by 2
    u = await pg.evaluate(BOARD + "([['beetle-battering-ram', 0]], [['bee-knight', 0, 20]])")
    await pg.evaluate("(()=>{ const m = matchState; m.displayHqHp = {A: m.players[1].hq.hp, B: m.players[2].hq.hp}; })()")  # as a replay starts (renderVfxForEvent's HQ numbers)
    h0 = await pg.evaluate(HQ + "('B')")
    await pg.evaluate("""(()=>{ window.__chip = 0; window.__iv5 = setInterval(()=>{ if(document.querySelector('.en5-breach-chip')) window.__chip++; }, 25); })()""")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'breachHQ', side:'A', attUid:{u['1:0']}, attDefId:'beetle-battering-ram', targetSide:'B', dmg:2, n:2}}); }})()""")
    await pg.wait_for_timeout(am + 170)
    await shot(pg, 'breach-bramble', w)
    await pg.wait_for_timeout(700)
    h1 = await pg.evaluate(HQ + "('B')"); chip = await pg.evaluate("(()=>{ clearInterval(window.__iv5); return {seen: window.__chip, left: document.querySelectorAll('.en5-breach-chip').length}; })()")
    log = await pg.evaluate("(()=> (en5LogText({type:'breachHQ', attDefId:'beetle-battering-ram', targetSide:'B', dmg:2}, id=> (getCardDefs()[id]||{}).name) || {}).text)()")
    ok(h0 is not None and h1 == h0 - 2 and chip['seen'] > 0 and chip['left'] == 0, f'Breach 2: the chip flies and the enemy bramble loses 2 ({h0} -> {h1}, {chip})')
    ok('breaches the enemy bramble for 2' in (log or ''), f'the log line ({log})')
    # ---- Canopy Cover: the leaves and the miss
    u = await pg.evaluate(BOARD + "([['soldier-ant', 0]], [['fawn-scout', 0, 9]])")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'evaded', reason:'canopyCover', side:'A', attUid:{u['1:0']}, attDefId:'soldier-ant', targetSide:'B', targetUid:{u['2:0']}, targetDefId:'fawn-scout'}}); }})()""")
    await pg.wait_for_timeout(am + 160)
    leaves = await pg.evaluate("(()=> document.querySelectorAll('.en5-canopy-leaf').length)()")
    await shot(pg, 'canopy-cover-dodge', w)
    ok(leaves >= 3, f'Canopy Cover: leaves spray off the fawn ({leaves})')
    await pg.wait_for_timeout(900)
    # ---- a state skill turning on: Timbered on the Lodge Engineer
    u = await pg.evaluate(BOARD + "([['lodge-engineer', 0, 12]], [['bee-knight', 0, 20]])")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'statusFx', kind:'stateSkill', name:'timbered', on:true, side:'A', attUid:{u['1:0']}, attDefId:'lodge-engineer', targetUid:{u['1:0']}, targetDefId:'lodge-engineer'}}); }})()""")
    await pg.wait_for_timeout(260)
    sb = await pg.evaluate(BADGES + f"({u['1:0']})")
    await shot(pg, 'state-skill-on', w)
    ok(any(x == 'en5-state:timbered' for x in (sb or [])), f'Timbered on: the lit 🪵 pip ({sb})')
    await pg.wait_for_timeout(800)
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'statusFx', kind:'stateSkill', name:'timbered', on:false, side:'A', attUid:{u['1:0']}, attDefId:'lodge-engineer', targetUid:{u['1:0']}, targetDefId:'lodge-engineer'}}); }})()""")
    await pg.wait_for_timeout(200)
    sb2 = await pg.evaluate(BADGES + f"({u['1:0']})")
    ok(not any(x.startswith('en5-state:') for x in (sb2 or [])), f'off again: the pip goes ({sb2})')
    await pg.wait_for_timeout(500)
    # ---- a Bloom chain: the unit, its copy (bloomed too) and the copy's copy
    u = await pg.evaluate(BOARD + "([['pond-algae', -1, 9], ['pond-algae', 0, 9], ['pond-algae', 1, 10]], [['bee-knight', 0, 20]])")
    await pg.evaluate(f"""(()=>{{ const m = matchState, all = [...m.players[1].row.left, ...m.players[1].row.center, ...m.players[1].row.right], by = id=> all.find(c=> c.uid === id);
      const a = by({u['1:-1']}), c1 = by({u['1:0']}), c2 = by({u['1:1']}); a.bloomed = true; c1.bloomCopy = true; c1.bloomOf = a.uid; c1.bloomed = true; c2.bloomCopy = true; c2.bloomOf = c1.uid; c2.atk = c1.atk + 1;
      renderMatchUI(); bloomCopyVfx(c1.uid, c2.uid); }})()""")
    await pg.wait_for_timeout(700)
    await shot(pg, 'bloom-chain', w)
    chips = await pg.evaluate(f"(()=> [{u['1:-1']}, {u['1:0']}, {u['1:1']}].map(id=>{{ const el = document.querySelector(`.board-card[data-uid=\"${{id}}\"] .ab-bloomcopy`); return el ? el.className.includes('is-spent') : null; }}))()")
    ok(chips == [True, True, False], f"the unit and its copy are spent, the copy's copy can still bloom ({chips})")
    txt = await pg.evaluate("(()=> TX('ui.bl-desc', {when: 'Wet & Sunny'}))()")
    ok('copy can bloom once too' in txt, f"Bloom's text: the copy can bloom ({txt[-40:]})")
    await pg.wait_for_timeout(300)
    # ---- the Group Dungeon's people row: the Dungeons tab card, then the lobby
    await pg.evaluate("(async()=>{ if(matchState){ try{ matchState.over = true; }catch(e){} } matchState = null; document.querySelectorAll('.coach-tip, .modal-overlay').forEach(x=> x.hidden = true); deckSizeOkOrWarn = ()=> true; switchTab('play'); playSubTab = 'dungeons'; renderPlay(); })()")
    await pg.wait_for_timeout(700)
    card = await pg.evaluate("(()=>{ const el = document.querySelector('.dg-group .gd-people'); if(el) el.scrollIntoView({block:'center'}); return el ? {n: el.querySelectorAll('.gd-p').length, on: el.querySelectorAll('.gd-p.is-on').length, label: el.getAttribute('aria-label')} : null; })()")
    await pg.wait_for_timeout(300)
    await shot(pg, 'people-dungeon-card', w)
    ok(card and card['n'] == 4 and card['on'] == 2 and '2 to 4' in (card['label'] or ''), f'the dungeon card: 👤👤 + two lighter, "2 to 4 players" ({card})')
    await pg.evaluate("(async()=>{ await gdCreate(true); })()")
    await pg.wait_for_timeout(900)
    lob = await pg.evaluate("(()=>{ const el = document.querySelector('#gdPeople .gd-people'); return el ? {on: el.querySelectorAll('.gd-p.is-on').length, cpu: el.querySelectorAll('.gd-p.is-cpu').length, free: el.querySelectorAll('.gd-p.is-free').length, txt: el.textContent.trim()} : null; })()")
    await shot(pg, 'people-lobby', w)
    ok(lob and lob['on'] >= 1 and (lob['on'] + lob['cpu'] + lob['free']) in (2, 4), f'the lobby: a 👤 per seat, lit for you, 🤖 for a CPU ally ({lob})')
    ed = await pg.evaluate("(()=>({gp: (PASSIVE_DEFS.find(d=> d.key === 'greaterPoison')||{}).label, keys: ['breach', 'canopyCover', 'timbered', 'bedrock', 'forged', 'lastStand', 'timberedGrant'].filter(k=> PASSIVE_DEFS.some(d=> d.key === k && d.label && d.codexNote))}))()")
    ok(ed['gp'] == 'Deadly Poison' and len(ed['keys']) == 7, f'the editor: Deadly Poison, and the new skills with Codex notes ({ed})')
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
