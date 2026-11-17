#!/usr/bin/env python3
"""FXAUD1: (1) which mark cue the Vulnerable / Feeble hit plays (dnMarkSoundKey), (2) cues and decorative effects with the tab hidden, (3) cues with the SFX volume at 0,
(4) Effects None: gameplay feedback stays, decoration does not.   python3 tests/e2e/fxaud1_gates.py  -> prints a JSON report."""
import sys, asyncio, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fxaud1_probe as P
from playwright.async_api import async_playwright
EVS = ['hit', 'death', 'statusFx|rend', 'statusFx|weaken', 'powder|paralysis', 'wave', 'statusFx|inspired', 'statusFx|stunOnHit', 'earthquake', 'meteor', 'namedBuff', 'fireball']
MARK = """()=>({ vuln: [dnModKey(['vulnerable'], false, 4), dnMarkSoundKey(['vulnerable'], false, 4), DN_MARK_CUE[dnMarkSoundKey(['vulnerable'], false, 4)]],
  feeble: [dnModKey(['feeble'], false, 1), dnMarkSoundKey(['feeble'], false, 1), DN_MARK_CUE[dnMarkSoundKey(['feeble'], false, 1)]],
  weak: [dnMarkSoundKey(['weak'], false, 4), DN_MARK_CUE[dnMarkSoundKey(['weak'], false, 4)]], shocked: [dnMarkSoundKey(['shocked'], false, 4), DN_MARK_CUE[dnMarkSoundKey(['shocked'], false, 4)]] })"""
async def run_events(pg, ev, keys, ms=1100):
    out = {}
    for k in keys:
        src, e = ev[k]; fixed = await pg.evaluate(P.FIX + "(" + json.dumps([e, src]) + ")")
        r = await pg.evaluate("([k, e, ms])=> window.__probe(k, e, ms)", [k, fixed, ms]); out[k] = {'audio': r['osc'] + r['src'], 'cues': r['snd'], 'nodes': r['added'], 'tweens': r['peakGs']}
    return out
async def page(b, url, level='high'):
    pg = await b.new_page(viewport={'width': 1366, 'height': 860})
    await pg.add_init_script(P.SKIP + f"localStorage.setItem('bramblewood_fx_level','{level}');localStorage.setItem('bw_musicVolume','0');localStorage.setItem('bramblewood_battle_music','off');localStorage.setItem('bramblewood_calm_music','off');")
    await pg.goto(url, wait_until='domcontentloaded', timeout=180000); await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=180000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + P.OWN + " })()"); await pg.evaluate(P.BOARD); await pg.evaluate(P.SPIES); return pg
async def main():
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    class A: only = None
    ev = P.build_events(A); rep = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME, args=P.FLAGS)
        pg = await page(b, url)
        rep['marks'] = await pg.evaluate(MARK)
        rep['baseline'] = await run_events(pg, ev, EVS)
        rep['idle_audio'] = (await pg.evaluate("([k, e, ms])=> window.__probe(k, e, ms)", ['idle', {'type': 'zzzNoop'}, 1100]))
        rep['idle_audio'] = rep['idle_audio']['osc'] + rep['idle_audio']['src']
        # hidden tab
        await pg.evaluate("Object.defineProperty(document, 'hidden', {configurable: true, get: ()=> true}); document.dispatchEvent(new Event('visibilitychange'))")
        rep['hidden'] = await run_events(pg, ev, EVS)
        await pg.evaluate("delete document.hidden")
        # muted
        await pg.evaluate("SoundKit.setSfxVolume ? SoundKit.setSfxVolume(0) : null"); rep['muted_api'] = await pg.evaluate("typeof SoundKit.setSfxVolume")
        await pg.wait_for_timeout(1500)
        rep['muted'] = await run_events(pg, ev, EVS)
        await pg.close()
        pg = await page(b, url, 'none'); rep['fx_none'] = await run_events(pg, ev, EVS); await pg.close()
        await b.close()
    json.dump(rep, open(os.path.join(P.ROOT, 'docs/perf/fxaud1/gates.json'), 'w'), indent=1)
    print(json.dumps(rep['marks'])); print('idle audio nodes', rep['idle_audio'], 'muted api', rep['muted_api'])
    for k in EVS:
        f = lambda s: (rep[s][k]['audio'], rep[s][k]['nodes'], len(rep[s][k]['cues']))
        print(f'{k:22} base(audio,nodes,cues) {f("baseline")}  hidden {f("hidden")}  muted {f("muted")}  fxnone {f("fx_none")}')
asyncio.run(main())
