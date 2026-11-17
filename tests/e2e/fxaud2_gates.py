#!/usr/bin/env python3
"""FXAUD2 (2026-11-18): the audit's gate checks (fxaud1_gates.py) as a test. Plays real events through renderVfxForEvent on the fight board and fails on:
  1. a Vulnerable / Feeble hit that plays markShocked / markArmor,
  2. any audio node while the tab is hidden or the SFX volume is 0,
  3. particle nodes for fireball / meteor at Effects None or hidden (the cue and shake stay),
  4. the Paralysis Powder cue missing at Effects None (gameplay feedback).
   python3 tests/e2e/fxaud2_gates.py     (listed under --e2e in tests/run-all.sh)"""
import sys, asyncio, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fxaud1_probe as P
import fxaud1_gates as G
from playwright.async_api import async_playwright
EVS = ['hit', 'statusFx|rend', 'statusFx|weaken', 'powder|paralysis', 'wave', 'statusFx|inspired', 'meteor', 'namedBuff', 'fireball']
async def main():
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    class A: only = None
    ev = P.build_events(A); bad = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME, args=P.FLAGS)
        pg = await G.page(b, url)
        marks = await pg.evaluate(G.MARK)
        if marks['vuln'][2] in ('markShocked', 'markArmor'): bad.append('Vulnerable hit plays ' + marks['vuln'][2])
        if marks['feeble'][2] in ('markShocked', 'markArmor'): bad.append('Feeble hit plays ' + marks['feeble'][2])
        base = await G.run_events(pg, ev, EVS)
        await pg.evaluate("Object.defineProperty(document, 'hidden', {configurable: true, get: ()=> true}); document.dispatchEvent(new Event('visibilitychange'))")
        hidden = await G.run_events(pg, ev, EVS)
        for k, v in hidden.items():
            if v['audio']: bad.append(f'hidden: {k} made {v["audio"]} audio nodes')
        for k in ('fireball', 'meteor'):
            if hidden[k]['nodes'] > base[k]['nodes'] * 0.3: bad.append(f'hidden: {k} still builds {hidden[k]["nodes"]} nodes (shown {base[k]["nodes"]})')
        await pg.evaluate("delete document.hidden")
        await pg.evaluate("SoundKit.setSfxVolume(0)"); await pg.wait_for_timeout(1500)
        for k, v in (await G.run_events(pg, ev, EVS)).items():
            if v['audio']: bad.append(f'muted: {k} made {v["audio"]} audio nodes')
        await pg.close()
        pg = await G.page(b, url, 'none'); none = await G.run_events(pg, ev, EVS); await pg.close()
        for k in ('fireball', 'meteor'):
            if none[k]['nodes'] > base[k]['nodes'] * 0.3: bad.append(f'Effects None: {k} still builds {none[k]["nodes"]} nodes (shown {base[k]["nodes"]})')
            if not none[k]['audio']: bad.append(f'Effects None: {k} lost its cue')
        if not none['powder|paralysis']['audio']: bad.append('Effects None: the Paralysis Powder cue is gone')
        for k in ('statusFx|rend', 'statusFx|weaken', 'wave', 'hit'):
            if not none[k]['audio']: bad.append(f'Effects None: {k} lost its cue')
        await b.close()
    print(json.dumps({'marks': marks}))
    for m in bad: print('  FAIL', m)
    print('fxaud2_gates:', 'FAIL' if bad else 'ok'); sys.exit(1 if bad else 0)
asyncio.run(main())
