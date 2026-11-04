#!/usr/bin/env python3
"""Package UI20 (2026-11-04): the cost and wait badges never cover the card name. Browser checks on the built index.html.
    python3 tests/e2e/ui20_2026_11_04.py [--widths 1366,390] [--tag after]     (--tag before: only measure, never fails; used for the "before" shots)
Shots in tests/e2e/shots/ui20/ (<tag>-<screen>-<width>.png). The check measures, on every drawn card, the name's text lines against the cost badge and the wait badge:
  Codex (compressed and full), the large view, the pack opener, hand and board in a fight, plus a sheet of synthetic tiles at the three sizes (detail, full, compact)
  with the heaviest costs and waits and the longest names. Exits 1 on any overlap unless --tag before. Build first."""
import argparse, asyncio, os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V
from playwright.async_api import async_playwright
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui20'); os.makedirs(SHOTS, exist_ok=True)
fails = []; TAG = 'after'
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c and TAG != 'before': fails.append(m)
NOTOAST = '.toast, .toast-host, #toastHost, .xp-float, .fxg-title-stage, .level-up-burst, #signInBanner{display:none !important;} #atmoTint, #atmoCanvas{display:none !important;}'
# every drawn tile: the name's line boxes against the cost / wait badge boxes (1px of air counts as touching)
MEASURE = """(()=>{ let n = 0, bad = []; const vis = e=> { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
  document.querySelectorAll('.card-tile').forEach(t=>{ const nmt = t.querySelector(':scope > .nm .nmt'); if(!nmt || !vis(nmt)) return; const cs = getComputedStyle(t.querySelector(':scope > .nm')); if(cs.display === 'none' || cs.visibility === 'hidden') return;
    if(t.closest('[hidden], .ghost, .drag-ghost-host')) return;
    const rg = document.createRange(); rg.selectNodeContents(nmt); const lines = [...rg.getClientRects()].filter(r=> r.width > 1);
    t.querySelectorAll(':scope > .costbadge, :scope > .waitbadge').forEach(b=>{ if(!vis(b)) return; n++; const br = b.getBoundingClientRect();
      const hit = lines.some(l=> l.left < br.right + 1 && l.right > br.left - 1 && l.top < br.bottom + 1 && l.bottom > br.top - 1);
      if(hit) bad.push({card: t.dataset.defid, badge: b.className.split(' ')[0], name: nmt.textContent, tile: Math.round(t.getBoundingClientRect().width), lines: lines.length, bw: Math.round(br.width), bh: Math.round(br.height), size: t.dataset.size || '', st: (t.querySelector(':scope > .nm').getAttribute('style') || ''), dx: Math.round(Math.max(br.right - Math.min(...lines.map(l=> l.left)), Math.max(...lines.map(l=> l.right)) - br.left))}); }); });
  return {badges: n, bad}; })()"""
async def measure(pg, label):
    r = await pg.evaluate(MEASURE); b = r['bad']
    print(f"  {label}: {r['badges']} badges checked, {len(b)} touch the name", ('' if not b else json.dumps(b[:3])), flush=True)
    ok(r['badges'] > 0 and not b, f'{label}: no cost / wait badge touches the name text ({r["badges"]} badges, {len(b)} overlaps)')
    return r

SHEET = """(async()=>{ const defs = getCardDefs(); const ids = ['glacial-ape-king','yeti','gorge-wyrm','grovebearer-dragon-turtle','old-willow-of-the-ford','salamander-pyromancer','stoneheart-golem','otter-centurion','tunnel-ant','dolphin-knight','komodo-warlord','elder-willow'].filter(i=> defs[i]);
  const mk = (id, patch)=> Object.assign({}, defs[id], patch || {});
  const list = []; ids.forEach(id=> list.push(defs[id]));
  list.push(mk('glacial-ape-king', {id: 'syn-heavy', cost: 4, stoneCost: 3, metalCost: 2, wait: 3, name: 'Glacial Ape-King'}));
  list.push(mk('stoneheart-golem', {id: 'syn-six', cost: 6, stoneCost: 5, graceCost: 2, wait: 6, name: 'Grovebearer Dragon Turtle'}));
  const host = document.createElement('div'); host.id = 'ui20Sheet'; host.style.cssText = 'position:fixed; inset:0; z-index:99999; background:#2a2018; overflow:auto; padding:14px; display:flex; flex-wrap:wrap; gap:14px; align-content:flex-start;';
  ['detail', 'full', 'compact'].forEach(sz=> list.forEach(d=>{ const w = document.createElement('div'); w.innerHTML = cardTileHTML(d, {size: sz}); host.appendChild(w.firstElementChild); }));
  document.body.appendChild(host); await new Promise(r=> setTimeout(r, 600)); return list.length; })()"""

async def run(b, url, w):
    print(f'-- width {w}')
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof openCardDetail === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    shot = lambda n: pg.screenshot(path=os.path.join(SHOTS, f'{TAG}-{n}-{w}.png'), animations='allow')
    # Codex
    await pg.evaluate("(()=>{ codexViewMode = 'compressed'; codexSubTab = 'browse'; switchTab('codex'); })()"); await pg.wait_for_timeout(1800)
    await measure(pg, 'Codex (compressed)'); await shot('codex')
    await pg.evaluate("(()=>{ try{ codexViewMode = 'full'; renderCodex && renderCodex(); }catch(e){} })()"); await pg.wait_for_timeout(1200)
    await measure(pg, 'Codex (full)')
    # the large view
    await pg.evaluate("openCardDetail('glacial-ape-king')"); await pg.wait_for_timeout(1400)
    await measure(pg, 'large view (Glacial Ape-King)'); await shot('large')
    await pg.evaluate("(()=>{ try{ closeCardDetail(); }catch(e){} })()")
    # the pack opener
    await pg.evaluate("""(async()=>{ myCurrencies.gold = 99999; saveCurrencies(); const p = getShopPacks().find(x=> x.id === 'bronze'); const o = purchasePackOnce(p, true); openPackAnimation(p, [o]); await new Promise(z=> setTimeout(z, 1200));
      const ov = document.getElementById('packOpenOverlay');
      for(let k = 0; k < 10 && !ov.querySelector('.po2-card'); k++){ const strip = ov.querySelector('#poStrip');
        if(strip){ const r = strip.getBoundingClientRect(); const fire = (type, x)=> strip.dispatchEvent(new PointerEvent(type, {bubbles:true, clientX:x, clientY:r.top + r.height/2, pointerId:1, pointerType:'mouse', buttons:1}));
          fire('pointerdown', r.left + 4); for(let i = 1; i <= 12; i++){ fire('pointermove', r.left + r.width*i/12); await new Promise(z=> setTimeout(z, 16)); } fire('pointerup', r.right - 2); }
        await new Promise(z=> setTimeout(z, 900)); }
      const c = ov.querySelector('.po2-card.is-current'); if(c && !c.classList.contains('is-revealed')) c.click(); await new Promise(z=> setTimeout(z, 900)); })()""")
    await measure(pg, 'pack opener'); await shot('pack')
    await pg.evaluate("(()=>{ const ov = document.getElementById('packOpenOverlay'); if(ov){ ov.hidden = true; ov.innerHTML = ''; } })()")
    # a fight: hand and board
    await pg.evaluate("(()=>{ switchTab('play'); startConquestMatch('m1', '0-2'); })()"); await pg.wait_for_timeout(3800)
    await measure(pg, 'fight (hand, board)'); await shot('fight')
    # the sheet: three sizes, the heaviest badges
    n = await pg.evaluate(SHEET)
    await measure(pg, f'sheet of {n} cards x 3 sizes'); await shot('sheet')
    ok(not errs, f'no page errors {errs[:2]}')
    await ctx.close()

async def main(a):
    global TAG; TAG = a.tag
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME if os.path.exists(V.CHROME) else '/opt/pw-browsers/chromium', args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('FAILED: ' + '; '.join(fails) if fails else 'all ok'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366,390'); ap.add_argument('--tag', default='after')
    asyncio.run(main(ap.parse_args()))
