#!/usr/bin/env python3
"""Package UI6 (2026-10-30, owner notes 23:25): browser checks and screenshots.

    python3 tests/e2e/ui6_2026_10_30.py [--widths 390,1366] [--keep]   # --keep copies the shots to docs/screens/ui6/

X2 + X4: the pointer rests on an enemy unit that has taken damage; after 1 s its popover opens and shows the card as printed (its printed Health,
not the damaged one, no live stat row). A whole round then plays (units attack, the rows redraw): the popover never closes and never re-opens
(sampled every frame). Moving the pointer off the card closes it.
X11: tokens on both sides (and three Maggot tokens a Rot-Swollen Carcass drops in the deciding round), a real combat round ends the fight (win,
then loss): every token element stays in the DOM, visible, from the round's start until the result screen has been open 0.6 s, and the render
that ends the match removes no surviving unit's element.
Reuses tests/e2e/pl2_2026_10_25.py for the page setup. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, re, sys, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pl2_2026_10_25 as P
from playwright.async_api import async_playwright

ROOT, OUT = P.ROOT, P.OUT
KEEP = os.path.join(ROOT, 'docs', 'screens', 'ui6')
BOARD = re.sub(r"  # 2026-10-26.*", "", P.BOARD)
E = P.E
fails = P.fails; shots = []
ok = P.ok

async def snap(pg, name, w):
    """CDP capture (Playwright's screenshot waits for an idle page and times out during a fight)"""
    import base64
    try:
        cdp = await pg.context.new_cdp_session(pg)
        r = await asyncio.wait_for(cdp.send('Page.captureScreenshot', {'format': 'png'}), 20)
        f = os.path.join(OUT, f'ui6-{name}-{w}.png'); open(f, 'wb').write(base64.b64decode(r['data'])); shots.append(f); await cdp.detach()
    except Exception as e: print('   (shot skipped:', e, ')')

POP = E("""const m = matchState; const uid = %UID%; const pop = document.getElementById('cardPop');
  const c = [1, 2].map(p=> ['left','center','right'].flatMap(s=> m.players[p].row[s])).flat().find(x=> x.uid === uid);
  const el = document.querySelector('#rowEnemy .board-card[data-uid="' + uid + '"]');
  const vis = pop.querySelector('.card-pop-visual'); const d = getCardDefs()[c.defId];
  const txt = (vis && vis.textContent) || '';
  return {hidden: pop.hidden, hp: c.hp, maxHp: c.maxHp, printed: d.health, popHasPrinted: txt.replace(/\\D+/g, '').endsWith(String(d.health)), popHasLive: txt.replace(/\\D+/g, '').endsWith(String(c.hp)) && c.hp !== d.health, popText: txt.replace(/\\s+/g, ' ').trim(), // the tile's Health is its last number
    liveRow: !!pop.querySelector('.statrow-live'), statusGloss: !!pop.querySelector('.live-status-gloss'), tileText: el ? el.textContent.replace(/\\s+/g, ' ').slice(0, 80) : null};""")

ROUND = E("""const pop = document.getElementById('cardPop'); let flips = 0, closed = 0, frames = 0, wasHidden = pop.hidden, maxGap = 0, hiddenSince = null; const t0 = performance.now();
  const opens = []; const mo = new MutationObserver(()=>{ if(pop.hidden !== wasHidden){ flips++; if(pop.hidden){ closed++; } wasHidden = pop.hidden; opens.push(Math.round(performance.now() - t0) + (pop.hidden ? ' close' : ' open')); } });
  mo.observe(pop, {attributes: true, attributeFilter: ['hidden']});
  let stop = false; const tick = ()=>{ frames++; if(!stop) requestAnimationFrame(tick); }; tick();
  const redraws = []; const ro = new MutationObserver(ms=> ms.forEach(x=> x.removedNodes.forEach(n=>{ if(n.nodeType === 1 && n.dataset && n.dataset.uid === '%UID%') redraws.push(Math.round(performance.now() - t0)); })));
  ro.observe(document.getElementById('rowEnemy'), {childList: true, subtree: true});
  m0 = matchState; m0.resolving = false; await resolveRound(); await new Promise(r=> setTimeout(r, 600)); stop = true; mo.disconnect(); ro.disconnect();
  return {flips, closed, frames, opens, redraws: redraws.length, ms: Math.round(performance.now() - t0), hiddenNow: pop.hidden, over: !!matchState.over};""".replace('m0 = matchState; m0', 'const m0 = matchState; m0'))

async def run_pop(b, url, w):
    print(f'-- X2/X4 width {w}')
    pg = await P.page(b, url, w)
    uids = await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', 1, 40], ['otter-kit', 0, 40], ['growth-sprout', -1, 20]], [['otter-kit', 1, 0], ['frog-imp', 0, 30], ['insect-swarmling', -1, 20]])")
    uid = uids['2:1']
    # the enemy Otter Kit has taken damage: 3 below its printed Health
    await pg.evaluate(f"(()=>{{ const m = matchState; const c = m.players[2].row.right[0]; const ph = getCardDefs()[c.defId].health; c.maxHp = ph; c.hp = Math.max(1, ph - 3); m.players[1].hq.hp = 99; m.players[2].hq.hp = 99; m.players[1].row.right[0].atk = 1; renderMatchUI(); }})()")
    await pg.wait_for_timeout(900)
    h = await pg.query_selector(f'#rowEnemy .board-card[data-uid="{uid}"]'); bb = await h.bounding_box()
    cx, cy = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] * .45
    await pg.mouse.move(cx - 60, cy - 120); await pg.mouse.move(cx, cy, steps=4)
    await pg.wait_for_timeout(1500)
    r = await pg.evaluate(POP.replace('%UID%', str(uid)))
    print('   ', r)
    ok(not r['hidden'], f'X2 the popover opens after resting 1 s on the unit')
    ok(r['popHasPrinted'] and not r['popHasLive'] and not r['liveRow'], f'X4 the popover shows the printed card (Health {r["printed"]}), not the unit\'s {r["hp"]}')
    ok(r['hp'] != r['printed'] and re.sub(r'\D+', '', r['tileText'] or '').endswith(str(r['hp'])), f'X4 the board tile still shows its live Health {r["hp"]} ({r["tileText"]})')
    await snap(pg, 'x4-printed-popover', w)
    rr = await pg.evaluate(ROUND.replace('%UID%', str(uid)))
    print('   ', rr)
    ok(rr['redraws'] >= 1, f'X2 the round redrew the hovered unit\'s element ({rr["redraws"]} times)')
    ok(rr['closed'] == 0 and not rr['hiddenNow'], f'X2 the popover stayed open the whole round ({rr["closed"]} closes, {rr["opens"][:6]})')
    await pg.mouse.move(5, 5, steps=3); await pg.wait_for_timeout(400)
    hid = await pg.evaluate("document.getElementById('cardPop').hidden")
    ok(hid, 'X2 moving the pointer off the card closes it')
    await P.close(pg)

END = E("""const m = matchState;
  const all = ()=> [...document.querySelectorAll('#rowMine .board-card[data-uid], #rowEnemy .board-card[data-uid]')];
  await new Promise(r=> setTimeout(r, 1200));
  const t0 = performance.now(); let resAt = null, worst = 1, why = '', gone = 0; const tok = new Set(), seenEl = new Map(); const endRemoved = [];
  const mo = new MutationObserver(ms=> ms.forEach(x=> x.removedNodes.forEach(n=>{ if(n.nodeType === 1 && n.classList && n.classList.contains('board-card') && n.dataset.uid && m.ending){ const alive = [1,2].some(p=> ['left','center','right'].some(s=> m.players[p].row[s].some(c=> String(c.uid) === n.dataset.uid && c.hp > 0))); if(alive) endRemoved.push(n.dataset.uid); } })));
  mo.observe(document.querySelector('.battlefield'), {childList: true, subtree: true});
  const sample = ()=>{ const now = all(); const t = performance.now() - t0;
    now.forEach(el=>{ if(el.classList.contains('is-token') && !el.classList.contains('is-entering')) tok.add(el.dataset.uid); });
    tok.forEach(u=>{ const el = now.find(x=> x.dataset.uid === u); const st = [1,2].map(p=> ['left','center','right'].flatMap(s=> m.players[p].row[s])).flat().find(c=> String(c.uid) === u);
      if(!st || st.hp <= 0) return; // a token that died this round may go
      if(!el){ gone++; why = why || ('gone ' + u + ' @' + Math.round(t)); return; }
      let o = 1; for(let n = el; n && n.nodeType === 1; n = n.parentElement){ const cs = getComputedStyle(n); o *= +cs.opacity; if(cs.visibility === 'hidden' || cs.display === 'none') o = 0; }
      const tl = el.querySelector('.card-tile'); if(tl) o *= +getComputedStyle(tl).opacity;
      if(o < worst){ worst = o; why = u + ' ' + o.toFixed(2) + ' @' + Math.round(t) + ' ' + el.className.replace(/\\s+/g, ' '); } });
    if(!resAt && document.querySelector('#wlBackBtn')) resAt = t; };
  let stop = false; const loop = ()=>{ sample(); if(!stop) requestAnimationFrame(loop); }; loop(); const iv = setInterval(sample, 25);
  %SETUP%
  m.resolving = false; await resolveRound();
  while(!resAt && performance.now() - t0 < 25000) await new Promise(r=> setTimeout(r, 50));
  await new Promise(r=> setTimeout(r, 600)); stop = true; clearInterval(iv); mo.disconnect();
  return {winner: m.winner, tokens: [...tok], worst: Math.round(worst * 100) / 100, gone, why, resSeen: !!resAt, endRemoved};""")
SETUP_WIN = "m.players[1].row.right[0].atk = 60; m.players[2].hq.hp = 1; m.players[2].hq.shield = 0;"
SETUP_LOSS = "[...m.players[1].row.left, ...m.players[1].row.right].forEach(c=> c.atk = 0); m.players[2].row.center[0].atk = 60; m.players[1].hq.hp = 1; m.players[1].hq.shield = 0; m.players[2].hq.hp = 999;"

async def run_end(b, url, w):
    for label, setup in (('win', SETUP_WIN), ('loss', SETUP_LOSS)):
        print(f'-- X11 {label} width {w}')
        pg = await P.page(b, url, w)
        await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', 1, 30], ['bee-swarmling', -1, 5], ['growth-sprout', 2, 5]], [['otter-kit', 1, 30], ['insect-swarmling', 0, 5], ['rot-swollen-carcass', -1, 1]])")
        async def shot_sign():
            for _ in range(300):
                if await pg.evaluate("!!document.querySelector('.end-sign')"): break
                await pg.wait_for_timeout(100)
            await pg.wait_for_timeout(500); await snap(pg, f'x11-{label}-sign', w)
        t = asyncio.create_task(shot_sign())
        r = await pg.evaluate(END.replace('%SETUP%', setup))
        try: await asyncio.wait_for(t, 5)
        except Exception: pass
        print('   ', r)
        ok(r['resSeen'], f'X11 {label}: the result screen opens')
        ok(len(r['tokens']) >= 2, f'X11 {label}: tokens on the board ({r["tokens"]})')
        ok(r['gone'] == 0 and r['worst'] >= .95, f'X11 {label}: no living token leaves the DOM or dims before the result screen (lowest {r["worst"]}, {r["why"]})')
        ok(not r['endRemoved'], f'X11 {label}: the render that ends the match keeps every surviving unit\'s element ({r["endRemoved"]})')
        await P.close(pg)

async def main(a):
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME if os.path.exists(P.CHROME) else None)
        parts = a.parts.split(',')
        for w in [int(x) for x in a.widths.split(',')]:
            if 'pop' in parts: await run_pop(b, url, w)
            if 'end' in parts: await run_end(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        from PIL import Image
        os.makedirs(KEEP, exist_ok=True)
        for f in shots:
            im = Image.open(f).convert('RGB'); im.save(os.path.join(KEEP, os.path.basename(f)[:-4] + '.jpg'), quality=78)
        print('kept', len(shots), 'in', KEEP)
    print('shots:', len(shots), 'in', OUT)
    print('FAILED' if fails else 'all checks passed', len(fails))
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--parts', default='pop,end'); ap.add_argument('--keep', action='store_true')
    asyncio.run(main(ap.parse_args()))
