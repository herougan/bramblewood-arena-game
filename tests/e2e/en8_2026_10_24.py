#!/usr/bin/env python3
"""Package EN8 (2026-10-24): browser checks and screenshots at 390 and 1366, saved in docs/screens/EN8/.

    python3 tests/e2e/en8_2026_10_24.py            # checks + shots
    python3 tests/e2e/en8_2026_10_24.py --widths 1366

Covers: the CPU pitching (its hand only unaffordable cards: it pitches first and plays its 2-cost card the same turn, the log says so),
a resource skill firing (a Carrion Crow's Scavenge as an ally falls: "+1 🪵" and the log line; the Hazel Coppice), Pearls paying a cost
(the ⚪ pill, a card with Lumber + Stone paid from Pearls), Rampart's column rule (a hit from the next column is shared, one from two columns
away is not: the 🚧 streak and the log), the Cocoon's "?" skill. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EN8'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} try{ skipTriggerLesson(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
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
    f = os.path.join(OUT, f'en8-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units (as tests/e2e/en7_2026_10_24.py); the CPU is kept from acting until a step calls it
BOARD = """(async(map, node, mine, theirs)=>{ adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){} switchTab('play'); startConquestMatch(map, node); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  return uids; })"""
PLAY = "(evs=> evs.forEach(ev=>{ try{ pushLog(ev); renderVfxForEvent(ev); }catch(e){ console.warn(e); } }))"
LOG = "(()=> matchState.log.slice(-24).map(ev=>{ try{ const t = logText(ev); return t ? String(t.text || '') : ''; }catch(e){ return ''; } }).filter(Boolean))()"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    # ---- 1. CPU pitching: only unaffordable cards in hand (2 / 3 / 5 Lumber), 1 Lumber: it pitches first, then plays the 2-cost card
    await pg.evaluate(BOARD + "('mw', '5-3', [['otter-kit', 0, 9]], [])")
    r = await pg.evaluate("""(async()=>{ const m = matchState, p2 = m.players[2]; m.resolving = false;
      p2.hand = [{uid: 970001, defId: 'constrictor-coil'}, {uid: 970002, defId: 'bog-behemoth'}, {uid: 970003, defId: 'venomlord-serpent'}]; p2.lumber = 1; p2.playedThisTurn = false; p2.discardUsedThisTurn = false;
      const gy0 = p2.graveyard.length, logN = m.log.length; aiActNow(); renderMatchUI(); await new Promise(r=> setTimeout(r, 1300));
      const evs = m.log.slice(logN); return {pitched: p2.graveyard.length - gy0, discard: evs.filter(e=> e.type === 'discard').map(e=> e.defId), played: evs.filter(e=> e.type === 'play').map(e=> e.defId),
        board: ['left','center','right'].flatMap(s=> p2.row[s]).map(c=> c.defId), lumber: p2.lumber}; })()""")
    await shot(pg, 'cpu-pitch-then-play', w)
    ok(r['pitched'] == 1 and r['discard'] and r['discard'][0] != 'constrictor-coil' and 'constrictor-coil' in r['played'] and 'constrictor-coil' in r['board'],
       f'the CPU pitches a spare card first and plays its 2-cost card the same turn ({r})')
    lg = await pg.evaluate(LOG)
    ok(any('constrictor' in x.lower() or 'Constrictor' in x for x in lg), f'the log shows the play ({lg[-4:]})')
    # ---- 2. a resource skill firing: Scavenge (an ally falls) and Coppice, on the board, through the game's own event path
    u = await pg.evaluate(BOARD + "('mh', '12-1', [['carrion-crow', 0, 9], ['otter-kit', 1, 1], ['hazel-coppice', -1, 14]], [['otter-kit', 0, 9]])")
    r = await pg.evaluate(f"""(async()=>{{ const m = matchState, e = m.engine, p1 = m.players[1]; const l0 = p1.lumber || 0, evs = [];
      const k = p1.row.right.find(c=> c.uid === {u['1:1']}); k.hp = 0; e.removeDeadCards(m.players, m.sideOf, {{}}, m.stats, evs);
      const cop = p1.row.left[0]; cop._coppiceArmed = true; cop._dmgTurn = -5; e.roundStart(m.players, (m.round||1) + 1, m.sideOf, m.stats, evs);
      ({PLAY})(evs); renderMatchUI(); await new Promise(r=> setTimeout(r, 450));
      return {{gain: (p1.lumber||0) - l0, causes: evs.filter(x=> x.type === 'lumber' && x.side === 'A').map(x=> x.cause), pill: (document.getElementById('hudLumberPill')||{{}}).textContent || ''}}; }})()""")
    await shot(pg, 'scavenge-coppice', w)
    lg = await pg.evaluate(LOG)
    ok(r['gain'] >= 2 and 'scavenge' in r['causes'] and 'coppice' in r['causes'], f'Scavenge and Coppice pay Lumber on the board ({r})')
    ok(any('scavenges' in x for x in lg) and any('undisturbed' in x for x in lg), f'their log lines ({[x for x in lg if "Lumber" in x][-3:]})')
    # ---- 3. Pearls paying a cost: 0 Lumber, 0 Stone, 3 Pearls; a 1 Lumber + 2 Stone card (Pearls fill in)
    await pg.evaluate(BOARD + "('mb', '2-1', [['otter-kit', 0, 9]], [['otter-kit', 0, 9]])")
    r = await pg.evaluate("""(async()=>{ const m = matchState, p1 = m.players[1], defs = getCardDefs(); m.resolving = false;
      const id = Object.keys(defs).find(k=> (defs[k].stoneCost||0) >= 1 && !defs[k].cardType && !defs[k].token && (defs[k].cost||0) <= 2) || null;
      p1.lumber = 0; p1.stone = 0; p1.pearls = 4; p1.playedThisTurn = false; p1.hand = [{uid: 970101, defId: id}]; renderMatchUI(); await new Promise(r=> setTimeout(r, 300));
      const pill = (document.getElementById('hudPearlPill')||{}).textContent || '', can = m.engine.canPlay(p1, id, null), need = (defs[id].cost||0) + (defs[id].stoneCost||0);
      return {id, pill, can, need, title: (document.getElementById('hudPearlPill')||{}).title || ''}; })()""")
    await shot(pg, 'pearls-pill', w)
    ok(r['id'] and '4' in r['pill'] and r['can'] and 'Pearl' in r['title'], f'the ⚪ Pearl pill shows 4; a Lumber + Stone card is playable on Pearls alone ({r})')
    r2 = await pg.evaluate("""(async()=>{ const m = matchState, p1 = m.players[1]; const ok = m.engine.placeCard(m.players, m.sideOf, 1, 970101, 1, m.stats, []); renderMatchUI(); await new Promise(r=> setTimeout(r, 500));
      return {ok, pearls: p1.pearls, lumber: p1.lumber, stone: p1.stone, pill: (document.getElementById('hudPearlPill')||{}).textContent || 'gone'}; })()""")
    await shot(pg, 'pearls-paid', w)
    ok(r2['ok'] and r2['pearls'] == 4 - r['need'] and r2['lumber'] == 0 and r2['stone'] == 0, f'the play takes {r["need"]} Pearls ({r2})')
    fl = await pg.evaluate("(()=>{ renderVfxForEvent({type:'pearl', side:'A', defId:'oyster-bank', uid:null, amount:1}); return true; })()")
    await pg.wait_for_timeout(250)
    lt = await pg.evaluate("(()=> (logText({type:'pearl', side:'A', defId:'oyster-bank', amount:1}) || {}).text)()")
    ok(fl and 'pearl' in (lt or '').lower(), f'a Pearl Bed gain floats to the pill and logs ({lt})')
    # ---- 4. Rampart: a hit from the next column is shared, one from two columns away is not
    u = await pg.evaluate(BOARD + "('mw', '5-4', [['otter-kit', 3, 9]], [['moat-snapper', 1, 30]])")
    r = await pg.evaluate("""(async()=>{ const m = matchState, e = m.engine; const evs = []; e.resolveCombat(m.players, m.sideOf, m.stats, evs, 1);
      const far = evs.filter(x=> x.type === 'rampart').length;
      const p1 = m.players[1], c = p1.row.right[0]; c.slot = 2; e.syncSlots(p1); const evs2 = []; e.resolveCombat(m.players, m.sideOf, m.stats, evs2, 1);
      const near = evs2.filter(x=> x.type === 'rampart'); (""" + PLAY + """)(evs2); renderMatchUI(); await new Promise(r=> setTimeout(r, 700));
      return {far, near: near.length, share: near[0] && near[0].share}; })()""")
    await shot(pg, 'rampart-columns', w)
    ok(r['far'] == 0 and r['near'] == 1, f'Rampart: two columns away not shared, the next column shared ({r})')
    # ---- 5. the Cocoon's "?" skill
    q = await pg.evaluate("(()=>{ const d = getCardDefs()['egg-bug']; return {line: describeEffects(d).join(' | '), ico: skillIconFor('chrysalis', d)}; })()")
    ok('?' in q['line'] and 'Evomax' in q['line'] and q['ico'] == '❓', f'the Cocoon Chrysalis reads "?" ({q})')
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
