#!/usr/bin/env python3
"""Package ECON1 (2026-10-30, owner BRUP-1): browser checks and screenshots at 390 and 1366 (docs/screens/econ1/).

    python3 tests/e2e/econ1_2026_10_30.py
    python3 tests/e2e/econ1_2026_10_30.py --widths 1366

1. A won Conquest fight shows the Briar Blossoms pill in the results' Rewards row, and the wallet grew by it.
2. A lost fight that hit the enemy bramble shows the small Blossoms pill (its tip says it came from the bramble damage).
3. The Forge's Reinforce tab: the Blossoms in the Forge wallet (on this tab only), the Reinforce button's cost pills (Blossoms + a little Dust
   and Leaves), the note under it; Reinforce spends them.
Reinforce opens at Map 28 (RES3); the page stands in for a player who reached it (res3ForgeTabOpen -> true). Page setup and helpers come from
tests/e2e/pl2_2026_10_25.py. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import pl2_2026_10_25 as P
from playwright.async_api import async_playwright
ROOT = P.ROOT; OUT = os.path.join(ROOT, 'docs', 'screens', 'econ1'); os.makedirs(OUT, exist_ok=True)
ok = P.ok

async def shot(pg, name, w, clip=None, pad=12):
    f = os.path.join(OUT, f'{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None; bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': min(bb['width'] + 2 * pad, w), 'height': min(bb['height'] + 2 * pad, 1400)}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    P.shots.append(f); return f

async def settle(pg):  # the count-up done, the Rewards row in view
    await pg.wait_for_timeout(3500)
    await pg.evaluate("(()=>{ const r = document.querySelector('.winloss-card .rw-rewards'); if(r) r.scrollIntoView({block:'center'}); document.querySelectorAll('.reward-count[data-target]').forEach(x=> x.textContent = '+' + x.dataset.target); })()")
    await pg.wait_for_timeout(400)

E = lambda body: "(async()=>{ " + body + " })()"
FINISH = "try{ gsap.globalTimeline.getChildren(true, true, true).forEach(t=>{ try{ t.progress(1); }catch(e){} }); }catch(e){}"
OPEN = "res3ForgeTabOpen = ()=> true; { const _to = tabOpen; tabOpen = k=> k === 'forge' || k === 'codex' ? true : _to(k); }"  # a player past Map 28 (the Forge and its Reinforce tab open)
START = """switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}"""

async def run(b, url, w):
    print(f'-- width {w}')
    # 1. a win
    pg = await P.page(b, url, w)
    r = await pg.evaluate(E(OPEN + "const before = myCurrencies.blossoms || 0; " + START + """
      const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3800));
      """ + FINISH + """ await new Promise(r=> setTimeout(r, 900));
      const pill = document.querySelector('.winloss-card .rw-cur[data-cur="blossoms"]');
      return {pill: !!pill, text: pill ? pill.textContent.replace(/\\s+/g, ' ').trim() : '', tip: pill ? pill.dataset.tip : '', earned: matchState.conquestBlossomsEarned || 0, grew: (myCurrencies.blossoms || 0) - before};"""))
    ok(r['pill'] and r['earned'] > 0 and r['grew'] == r['earned'] and 'Briar Blossoms' in r['text'], f'1. a win: the Blossoms pill, the wallet grew by it {r}')
    ok('for the win' in r['tip'], f'1. its tip says it is for the win {r["tip"]}')
    await settle(pg); await shot(pg, 'results-win', w, '.winloss-card .rw-panel')
    await P.close(pg)
    # 2. a loss that hit the enemy bramble
    pg = await P.page(b, url, w)
    r = await pg.evaluate(E(OPEN + START + """
      const M = matchState; M.players[2].hq.hp = Math.round(M.players[2].hq.maxHp * 0.2); M.players[1].hq.shield = 0; M.players[1].hq.hp = 0; M.forcedWinner = 2;
      await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3800)); """ + FINISH + """ await new Promise(r=> setTimeout(r, 900));
      const pill = document.querySelector('.winloss-card .rw-cur[data-cur="blossoms"]');
      return {winner: matchState.winner, pill: !!pill, tip: pill ? pill.dataset.tip : '', earned: matchState.conquestBlossomsEarned || 0, loss: !!matchState.conquestBlossomsLoss};"""))
    ok(r['winner'] == 2 and r['pill'] and r['loss'] and 0 < r['earned'] <= 2, f'2. a loss with bramble damage: a small Blossoms pill {r}')
    ok('damage' in r['tip'], f'2. its tip says it is for the bramble damage {r["tip"]}')
    await settle(pg); await shot(pg, 'results-loss', w, '.winloss-card .rw-panel')
    await P.close(pg)
    # 3. the Reinforce tab
    pg = await P.page(b, url, w)
    r = await pg.evaluate(E(OPEN + """myCurrencies.blossoms = 1200; myCurrencies.dust = Math.max(myCurrencies.dust || 0, 400); myCurrencies.gold = Math.max(myCurrencies.gold || 0, 400); saveCurrencies(true);
      const id = myCharacterId || 'castle'; myCastleLevels[id] = 3; reinforcePick = id;
      forgeMode = 'castles'; codexSubTab = 'forge'; switchTab('codex'); await new Promise(r=> setTimeout(r, 900)); """ + FINISH + """
      const coin = document.querySelector('.forge-wallet .forge-coin.blossoms'), btn = document.getElementById('fgReinforceBtn');
      const pills = btn ? [...btn.querySelectorAll('.bc')].map(x=> x.textContent.replace(/\\s+/g, ' ').trim()) : [];
      const cost = castleNetCost(castleLevelOf(id), id), raw = castleLevelUpCostRaw(castleLevelOf(id), id);
      return {coin: coin ? coin.textContent.trim() : '', pills, note: (document.querySelector('.fg-rf-econ')||{}).textContent || '', cost, raw, id, L: castleLevelOf(id)};"""))
    ok('1200' in r['coin'], f'3. the Forge wallet shows the Blossoms on Reinforce {r["coin"]}')
    ok(len(r['pills']) >= 3 and r['pills'][0].startswith('💮') and r['cost']['blossoms'] == r['raw']['dust'] and r['cost']['dust'] == round(r['raw']['dust'] * .25), f'3. the button costs Blossoms + a quarter of the old Dust / Leaves {r["pills"]} {r["cost"]} {r["raw"]}')
    ok('Briar Blossoms' in r['note'], f'3. the note under the button {r["note"][:80]}')
    await pg.evaluate("(()=>{ const b = document.getElementById('fgReinforceBtn'); if(b) b.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(400)
    await shot(pg, 'reinforce', w)
    r2 = await pg.evaluate(E("""const id = '""" + r['id'] + """', b0 = myCurrencies.blossoms; const btn = document.getElementById('fgReinforceBtn'); btn.click(); await new Promise(r=> setTimeout(r, 2500));
      return {L: castleLevelOf(id), spent: b0 - myCurrencies.blossoms};"""))
    ok(r2['L'] == r['L'] + 1 and r2['spent'] == r['cost']['blossoms'], f'3. Reinforce spends the Blossoms {r2}')
    # the Forge's other tabs keep the wallet as it was
    r3 = await pg.evaluate(E("""forgeMode = 'upgrade'; renderForge(); await new Promise(r=> setTimeout(r, 300)); return !!document.querySelector('.forge-wallet .forge-coin.blossoms');"""))
    ok(not r3, '3. the Blossoms are not in the wallet on the Forge\'s other tabs')
    await P.close(pg)

async def main(a):
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME if os.path.exists(P.CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('shots:', len(P.shots), 'in', OUT)
    print('FAILED' if P.fails else 'all checks passed', len(P.fails))
    sys.exit(1 if P.fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366')
    asyncio.run(main(ap.parse_args()))
