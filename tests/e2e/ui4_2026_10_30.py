#!/usr/bin/env python3
"""Package UI4 (2026-10-30, owner 10:34): browser checks and screenshots.

    python3 tests/e2e/ui4_2026_10_30.py [--widths 390,1366] [--tag after] [--keep]   # --keep copies the shots to docs/screens/ui4/

V3: "The tokens still disappear on win/lose, then appear again once the screen comes out." Two token cards (yours and theirs) stand on the board
(one more is spawned by a real attack in the deciding round); the match is won, then lost. From the round's start to the moment the result screen
opens, every token's element stays in the DOM at full opacity and visible (sampled every frame), and it is still there, visible, when the result
screen opens. (Cause: showEndSign made every token shatter one by one during the end beat, and revealBoardCardsAtEnd put them back afterwards.)
V2: a hit on a shielded bramble draws no lightning: no electric zig-zag elements near the bramble during the hit, and the shield flash / number still play.
Reuses tests/e2e/pl2_2026_10_25.py for the page setup. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, re, sys, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pl2_2026_10_25 as P
from playwright.async_api import async_playwright

ROOT, OUT = P.ROOT, P.OUT
KEEP = os.path.join(ROOT, 'docs', 'screens', 'ui4')
BOARD = re.sub(r"  # 2026-10-26.*", "", P.BOARD)  # the PL2 copy ends a JS line with a Python-style comment; cut it
E = P.E
fails = P.fails; shots = []
ok = P.ok

def SC(pg, name, w):
    return os.path.join(OUT, f'ui4-{name}-{w}.png')

# a deciding round: tokens on both sides stay; sampled every frame until the result screen has been open for 600 ms
END = E("""const side = %SIDE%, m = matchState;
  const tokens = ()=> [...document.querySelectorAll('#rowMine .board-card.is-token[data-uid], #rowEnemy .board-card.is-token[data-uid]')];
  for(let i = 0; i < 120 && tokens().some(el=> +getComputedStyle(el).opacity < .99 || el.classList.contains('is-entering')); i++) await new Promise(r=> setTimeout(r, 50));
  const first = tokens().map(el=> el.dataset.uid), seen = {}; let worst = 1, vanished = 0, at = null, resSeen = false, atRes = null;
  const sample = ()=>{ const now = tokens(); first.forEach(u=>{ const el = now.find(x=> x.dataset.uid === u);
      if(!el){ vanished++; return; } const cs = getComputedStyle(el); const o = +cs.opacity * (cs.visibility === 'hidden' ? 0 : 1); if(o < worst){ worst = o; window.__why = el.className + ' / ' + el.getAttribute('style') + ' over=' + m.over + ' res=' + !!document.querySelector('#wlBackBtn'); } });
    if(!resSeen && document.querySelector('#wlBackBtn')){ resSeen = true; atRes = first.map(u=>{ const el = tokens().find(x=> x.dataset.uid === u); const cs = el && getComputedStyle(el); return !!el && +cs.opacity >= .95 && cs.visibility !== 'hidden'; }); } };
  let stop = false; const loop = ()=>{ sample(); if(!stop) requestAnimationFrame(loop); }; loop();
  if(side === 1){ m.players[2].hq.shield = 0; m.players[2].hq.hp = 0; m.forcedWinner = 1; } else { m.players[1].hq.shield = 0; m.players[1].hq.hp = 0; m.forcedWinner = 2; }
  m.resolving = false; const t0 = performance.now(); const p = resolveRound({manual:true, run:()=> true});
  window.__ui4Shot = new Promise(r=> window.__ui4ShotGo = r);
  await p;
  const t1 = performance.now(); while(!resSeen && performance.now() - t0 < 14000) await new Promise(r=> setTimeout(r, 50));
  await new Promise(r=> setTimeout(r, 600)); sample(); stop = true;
  return {why: window.__why, n: first.length, worst: Math.round(worst * 100) / 100, vanished, resSeen, atRes, msToRes: Math.round(performance.now() - t0)};""")

async def run(b, url, w, tag):
    print(f'-- width {w}')
    for side, label in ((1, 'win'), (2, 'loss')):
        pg = await P.page(b, url, w)
        await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', 1, 30], ['bee-swarmling', -1, 5], ['growth-sprout', 2, 5]], [['otter-kit', 1, 30], ['insect-swarmling', 0, 5], ['frog-imp', -1, 5]])")
        # a shot while the end sign is up (where the tokens used to shatter), then under the result screen
        async def snaps():
            await pg.wait_for_timeout(1500); await pg.screenshot(path=SC(pg, f'v3-{label}-sign', w), animations='allow'); shots.append(SC(pg, f'v3-{label}-sign', w))
            for _ in range(80):
                if await pg.query_selector('#wlBackBtn'): break
                await pg.wait_for_timeout(100)
            await pg.wait_for_timeout(500); await pg.screenshot(path=SC(pg, f'v3-{label}-result', w), animations='allow'); shots.append(SC(pg, f'v3-{label}-result', w))
        t = asyncio.create_task(snaps())
        r = await pg.evaluate(END.replace('%SIDE%', str(side)))
        await t
        print('   ', label, r)
        ok(r['n'] >= 4, f'V3 {label}: the board holds {r["n"]} tokens before the end')
        ok(r['resSeen'], f'V3 {label}: the result screen opens')
        ok(r['vanished'] == 0, f'V3 {label}: no token element leaves the DOM from the round to the result screen ({r["vanished"]} missing samples)')
        ok(r['worst'] >= .95, f'V3 {label}: no token dims or hides on the way (lowest opacity seen {r["worst"]})')
        ok(bool(r['atRes']) and all(r['atRes']), f'V3 {label}: every token is in the DOM and visible when the result screen opens {r["atRes"]}')
        await P.close(pg)

async def run_v2(b, url, w):
    """V2: a real hit on a shielded bramble: the ring and the Shield number pop play, no dome / flicker element is drawn."""
    print(f'-- V2 width {w}')
    pg = await P.page(b, url, w)
    await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', 1, 30]], [])")
    await pg.evaluate("(()=>{ const m = matchState; m.players[2].hq.shield = 30; m.players[2].hq.maxShield = 30; m.players[2].hq.hp = 99; m.players[2].hq.maxHp = 99; m.players[1].row.right[0].atk = 3; renderMatchUI(); })()")
    await pg.wait_for_timeout(800)
    r = await pg.evaluate(E("""const seen = {dome: 0, ring: 0, shieldNum: null}; const cls = n=> (n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className) || '';
      new MutationObserver(ms=> ms.forEach(x=> x.addedNodes.forEach(n=>{ if(n.nodeType !== 1) return; const c = String(cls(n)); if(/fxc-dome/.test(c)) seen.dome++; if(/ui4-shield-ring/.test(c)) seen.ring++; }))).observe(document.body, {childList: true, subtree: true});
      const before = matchState.players[2].hq.shield; await resolveRound(); await new Promise(r=> setTimeout(r, 1200));
      const badge = document.querySelector('[data-hq="B"] .castle-shield'); seen.shieldNum = badge ? badge.textContent : null; seen.before = before; seen.after = matchState.players[2].hq.shield;
      seen.patched = !!(window.FX && FX.C && FX.C.__ui4Shield); return seen;"""))
    print('   ', r)
    ok(r['patched'], 'V2 the bramble shield look is the plain one (FX.C.castleShield patched)')
    ok(r['after'] < r['before'], f'V2 the hit landed on the Shield ({r["before"]} -> {r["after"]})')
    ok(r['dome'] == 0, f'V2 no flickering dome / electric layer is drawn on the shielded bramble ({r["dome"]})')
    ok(r['ring'] >= 1, f'V2 the plain shield ring still plays ({r["ring"]})')
    ok(bool(r['shieldNum']), f'V2 the Shield number still reads {r["shieldNum"]}')
    await P.close(pg)

async def main(a):
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME if os.path.exists(P.CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w, a.tag)
        await run_v2(b, url, 1366)
        await b.close()
    httpd.shutdown()
    if a.keep:
        from PIL import Image
        os.makedirs(KEEP, exist_ok=True)
        for f in shots:
            im = Image.open(f).convert('RGB'); im.save(os.path.join(KEEP, os.path.basename(f)[:-4].replace('ui4-', 'ui4-' + a.tag + '-', 1) + '.jpg'), quality=78)
        print('kept', len(shots), 'in', KEEP)
    print('shots:', len(shots), 'in', OUT)
    print('FAILED' if fails else 'all checks passed', len(fails))
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--tag', default='after'); ap.add_argument('--keep', action='store_true')
    asyncio.run(main(ap.parse_args()))
