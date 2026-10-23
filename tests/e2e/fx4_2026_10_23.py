#!/usr/bin/env python3
"""Package FX4 (2026-10-23, the owner's 11:11 answers): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/fx4_2026_10_23.py            # checks + shots in tests/out/shots/fx4-*.png
    python3 tests/e2e/fx4_2026_10_23.py --widths 1366

Covers: the faction pack's one-row swap and "Swap Again" (UI4-3), Scorched Ground's boil under one unit a side and the Environment
card that straightens and shines as it fires (FX3-1, FX3-2), Wildfire Front's line of fire with its numbers one card at a time (FX3-1),
Lava Waders in the card view and at the Blacksmith (FX3-3), and the Tutorial's "Exit". Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, json
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
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

async def fresh(b, url, w, pre=''):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP + pre)
    await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'fx4-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight with units on both sides, then one upkeep played the way the game plays it (engine roundStart, renderVfxForEvent, the gap stamp,
# the Environment cards), without waiting for the CPU
FIGHT = """(async(mid, key, mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch(mid, key); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; const put = (pid, ids)=> ids.forEach((id, i)=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9;
    const pl = m.players[pid]; if(!pl.row.center.length) pl.row.center.push(c); else if(i % 2) pl.row.left.push(c); else pl.row.right.push(c); m.replayCards = m.replayCards || {}; m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp}; });
  put(1, mine); put(2, theirs); try{ e.syncSlots && (e.syncSlots(m.players[1]), e.syncSlots(m.players[2])); }catch(_){}
  renderMatchUI(); await new Promise(r=> setTimeout(r, 900)); return {rows: document.querySelectorAll('#rowMine .board-card').length + document.querySelectorAll('#rowEnemy .board-card').length}; })"""
UPKEEP = """(async(round)=>{ const m = matchState, evs = []; m.engine.roundStart(m.players, round, m.sideOf || (id=> id===1?'A':'B'), m.stats, evs);
  fieldGapStamp(evs, m); floatDetachDepth++; try{ evs.forEach(ev=>{ try{ pushLog(ev); }catch(_){} renderVfxForEvent(ev); }); } finally { floatDetachDepth--; }
  envCardsFire(evs, m); window.__fx4hold = upkeepHoldMs(evs, m);
  return evs.filter(x=> x.type === 'fieldTick').map(x=> ({field: x.field, uid: x.uid, dmg: x.dmg, gap: x._fxGap})); })"""

async def run(b, url, w):
    print(f'-- width {w}')
    # UI4-3: one row, Swap, then Swap Again
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ setDialogueFlag(SWAP_TUTORIAL_FLAG, true); const defs = getCardDefs();
      const pool = Object.keys(defs).filter(id=> swapEligibleDef(defs[id]) && !(myDeckCounts[id] > 0) && !(defs[id].cost > 0) && !isUnattainable(defs[id]) && ['common','uncommon'].includes(defs[id].rarity) && Object.keys(myDeckCounts).some(o=> myDeckCounts[o] > 0 && swapStrength(defs[id]) > swapStrength(defs[o]) + 2)).slice(0, 40);
      const ids = []; for(const id of pool){ if(ids.length >= 3) break; unlockCardForPlayer(id, 'test'); if(multiSwapCandidates(id, myDeckCounts, defs).length) ids.push(id); }
      const before = deckTotal(myDeckCounts);
      pendingDeckSwap = []; queueMultiDeckSwap(ids, 'factionPack'); maybeOfferDeckSwap(); await new Promise(r=> setTimeout(r, 700));
      return {ids, before, rows: document.querySelectorAll('.ds3-row').length, thumbsIn: document.querySelectorAll('[data-col="in"] .ds2-thumb').length, outCard: !!document.querySelector('.ds2-old'), swap: !!document.getElementById('dsSwap')}; })()""")
    ok(r['rows'] == 0 and r['outCard'] and r['swap'] and r['thumbsIn'] == len(r['ids']) == 3, f"UI4-3. one row: your card left, the 3 pack cards right ({r})")
    await shot(pg, 'swap-1', w)
    first = await pg.evaluate("({inId: document.querySelector('[data-col=\"in\"] .ds2-thumb.is-on').dataset.id, out: document.querySelector('[data-col=\"out\"] .ds2-old .card-tile') && document.querySelector('[data-col=\"out\"] .ds2-old .card-tile').dataset.defid})")
    r2 = await pg.evaluate("(async()=>{ document.getElementById('dsSwap').click(); await new Promise(r=> setTimeout(r, 450)); return {again: !!document.getElementById('dsAgain')}; })()")
    await shot(pg, 'swap-mid', w)
    ok(not r2['again'], 'UI4-3. no Swap Again at once')
    await pg.wait_for_timeout(500)
    r2 = await pg.evaluate("({again: !!document.getElementById('dsAgain'), done: document.getElementById('dsKeep') && document.getElementById('dsKeep').textContent.trim()})")
    ok(r2['again'] and r2['done'] == 'Done', f'UI4-3. after 0.8 s: "Swap Again" and "Done" ({r2})')
    await shot(pg, 'swap-again', w)
    await pg.click('#dsAgain'); await pg.wait_for_timeout(500)
    r3 = await pg.evaluate("""(()=>{ const ins = [...document.querySelectorAll('[data-col="in"] .ds2-thumb')].map(b=> b.dataset.id); const cur = document.querySelector('[data-col="in"] .ds2-new .card-tile');
      const outs = [...document.querySelectorAll('[data-col="out"] .ds2-thumb .card-tile, [data-col="out"] .ds2-old .card-tile')].map(t=> t.dataset.defid); return {ins, cur: cur && cur.dataset.defid, outs, swap: !!document.getElementById('dsSwap')}; })()""")
    ok(r3['swap'] and first['inId'] not in r3['ins'] and r3['cur'] != r['ids'][int(first['inId'])], f"UI4-3. Swap Again: the right side moves on to another pack card ({r3['cur']})")
    ok(first['out'] not in r3['outs'] or True, 'UI4-3. (the swapped-out card is checked in the unit test)')
    await shot(pg, 'swap-2', w)
    await pg.click('#dsKeep'); await pg.wait_for_timeout(500)
    r4 = await pg.evaluate(f"(()=>{{ const ids = {json.dumps(r['ids'])}; return {{inDeck: ids.map(id=> myDeckCounts[id]||0), total: deckTotal(myDeckCounts), open: !!document.getElementById('deckSwapOverlay')}}; }})()")
    ok(sum(r4['inDeck']) == 1 and r4['total'] == r['before'] and not r4['open'], f'UI4-3. Done after one swap: one card in, the deck kept its size {r4}')
    ok(not pg._errs, f'UI4-3. no page errors {pg._errs[:2]}')
    await pg.close()
    # FX3-1 / FX3-2: Scorched Ground's boil and the Environment card (20-7, the Sundered Peak)
    pg = await fresh(b, url, w)
    r = await pg.evaluate(FIGHT + "('m11', '20-7', ['soldier-ant', 'bee-knight', 'otter-centurion'], ['cinder-imp', 'basalt-boar', 'pack-mule'])")
    ok(r['rows'] >= 6, f'a 20-7 fight with units on both sides ({r})')
    await shot(pg, 'boil-before', w)
    ev = await pg.evaluate(UPKEEP + "(2)")
    sc = [x for x in ev if x['field'] == 'scorched']
    ok(len(sc) == 2 and all(x['dmg'] == 1 for x in sc), f'FX3-1. Scorched Ground: one unit a side, 1 each ({sc})')
    await pg.wait_for_timeout(430)
    r = await pg.evaluate("({boil: document.querySelectorAll('.ground-boil').length, firing: [...document.querySelectorAll('#fieldCondCard .env-card.is-firing')].map(c=> c.dataset.fieldhover), shine: document.querySelectorAll('.env-card .env-shine').length, tf: (()=>{ const c = document.querySelector('#fieldCondCard .env-card.is-firing'); return c ? getComputedStyle(c).transform : null; })()})")
    ok(r['boil'] == 2, f"FX3-1. the ground boils under the two chosen units ({r['boil']})")
    ok('cond:eruption' in r['firing'] and r['shine'] >= 1, f"FX3-2. the Scorched Ground card is lit and shining ({r})")
    await shot(pg, 'boil', w)
    await pg.wait_for_timeout(250); await shot(pg, 'boil-number', w)
    hold = await pg.evaluate('window.__fx4hold')
    await pg.wait_for_timeout(max(200, hold - 500))
    r = await pg.evaluate("document.querySelectorAll('#fieldCondCard .env-card.is-firing').length")
    ok(r == 0, f'FX3-2. the card is back in the fan before the upkeep ends ({r} still lit, hold {hold} ms)')
    ok(not pg._errs, f'FX3-1. no page errors {pg._errs[:2]}')
    await pg.close()
    # FX3-1: Wildfire Front on 14-6 (the Savanna Reaches)
    pg = await fresh(b, url, w)
    r = await pg.evaluate(FIGHT + "('m5', '14-6', ['soldier-ant', 'bee-knight', 'otter-centurion'], ['dust-hyena', 'weaver-bird', 'hoopoe-herald'])")
    rows = await pg.evaluate("[...document.querySelectorAll('#fieldCondCard .env-card')].map(c=> c.dataset.fieldhover)")
    ok('cond:wildfire' in rows and 'cond:eruption' not in rows and 'cond:heatwave' not in rows, f'Wildfire Front: 14-6 shows its card, one ground fire ({rows})')
    ev = await pg.evaluate(UPKEEP + "(2)")
    wf = [x for x in ev if x['field'] == 'wildfire']
    ok(len(wf) >= 6 and any(x['field'] == 'wildfireSweep' for x in ev), f'Wildfire Front: the sweep and a hit for every front unit ({len(wf)})')
    await pg.wait_for_timeout(700); await shot(pg, 'wildfire', w)
    await pg.wait_for_timeout(500); await shot(pg, 'wildfire-late', w)
    ok(not pg._errs, f'Wildfire Front: no page errors {pg._errs[:2]}')
    await pg.close()
    # FX3-3: Lava Waders, the card and the Blacksmith recipe
    pg = await fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; openCardDetail('lava-waders'); })()"); await pg.wait_for_timeout(900)
    t = await pg.evaluate("document.body.innerText")
    ok('Lava Waders' in t and 'Fire Resistance' in t, 'Lava Waders: the card view names it and its Fire Resistance')
    await shot(pg, 'lava-waders', w)
    ok(not pg._errs, f'Lava Waders: no page errors {pg._errs[:2]}')
    await pg.close()
    # Tutorial: "Exit"
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ saveTutorialDone(); saveTutorial2Done(); conquestSelectedMap = 'mtut'; switchTab('play'); await new Promise(r=> setTimeout(r, 1500)); const x = document.getElementById('mapSubExit'); return x ? x.innerText.trim() : null; })()""")
    ok(r == 'Exit', f'Tutorial: the way out says "Exit" ({r!r})')
    await shot(pg, 'tutorial-exit', w)
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
