#!/usr/bin/env python3
"""Package UI19 (2026-11-03/04): browser checks on the built index.html, shots in tests/e2e/shots/ui19/.
    python3 tests/e2e/ui19_2026_11_03.py [--widths 1366,390]
  1 Swarm N is a number field in the Card editor and Save writes effects.swarmN (the field the engine reads with a type list or plain Swarm)
  2 the compact editor: Locked / Hidden / Quest / Event / Dev / Special on one row; Cost, Pitch, Reward on one row (Pitch has Lumber, Stone, Metal);
    Resistances, "From" and Stats by level sit below the abilities; the budget keeps its head, Stats and Product lines and loses the explanations
  3 the name scroll: the rolled ends are the same width on every card of a size; Glacial Ape-King fits one line; Art height (artPosY) moves the art
  4 the Map cards window lists the skills of the map's cards with "n of N cards", and NEW! only for skills no earlier map's cards carry
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V
from playwright.async_api import async_playwright
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui19'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
NOTOAST = '.toast, .toast-host, #toastHost, .xp-float, .fxg-title-stage, .level-up-burst, #signInBanner{display:none !important;} #atmoTint, #atmoCanvas{display:none !important;}'

async def run(b, url, w):
    print(f'-- width {w}')
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof openCardEditor === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ " + V.OWN + " adminModeEnabled = true; })()")
    # ---- 1 + 2: the editor
    await pg.evaluate("openCardEditor('tunnel-ant')"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("""(()=>{ const n = document.querySelector('[data-sk="valN"]'); return {has: !!n, type: n && n.type, val: n && n.value}; })()""")
    ok(r['has'] and r['type'] == 'number' and r['val'] == '2', f'Swarm N is a number field showing 2 (tunnel-ant) {r}')
    r = await pg.evaluate("""(()=>{ const n = document.querySelector('[data-sk="valN"]'); n.value = '3'; n.dispatchEvent(new Event('input', {bubbles:true})); readEditorFormIntoCard();
      const e = editingCard.effects; return {swarm: e.swarm, swarmN: e.swarmN}; })()""")
    ok(r['swarmN'] == 3 and r['swarm'] is True, f'Save writes swarmN 3 {r}')
    r = await pg.evaluate("""(()=>{ const n = document.querySelector('[data-sk="valN"]'); n.value = '1'; readEditorFormIntoCard(); const e = editingCard.effects; return {swarm: e.swarm, swarmN: e.swarmN}; })()""")
    ok(r['swarmN'] is None and r['swarm'] is True, f'N 1 saves as plain Swarm {r}')
    await pg.evaluate("closeCardEditor()")
    await pg.evaluate("openCardEditor('glacial-ape-king')"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("""(()=>{ const t = id=> { const el = document.getElementById(id) || document.querySelector(id); return el ? Math.round(el.getBoundingClientRect().top + scrollY) : null; };
      const q = s=> { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().top) : null; };
      const m = document.querySelector('#editorOverlay .modal'), bud = (document.getElementById('ceBudget') || {}).textContent || '';
      return {lock: t('fLocked'), hid: t('fHidden'), q: q('[data-rflag=quest]'), sp: q('[data-rflag=special]'), cost: t('fCost'), pitch: t('fPitchValueDisplay'), rew: t('fBounty'),
        pitchBoxes: document.querySelectorAll('.ed-econ .field:nth-child(2) input').length, skills: t('skillRows'), resist: t('resistPills'), from: t('cdPlacement'), lvs: q('.lvs-box'),
        flavor: q('#fFlavor'), h: m.scrollHeight, bud, artY: !!document.getElementById('fArtPosY'),
        order: ['skillRows', 'resistPills', 'cdPlacement'].map(i=> t(i)), lvsTop: q('.lvs-box') + scrollY}; })()""")
    print('  editor', {k: v for k, v in r.items() if k != 'bud'})
    ok(abs(r['lock'] - r['hid']) < 4 and abs(r['lock'] - r['q']) < 6 and abs(r['lock'] - r['sp']) < 6 or w < 700, 'Locked, Hidden, Quest ... Special on one row' + ('' if w >= 700 else ' (phone: may wrap)'))
    if w >= 700: ok(abs(r['cost'] - r['pitch']) < 6 and abs(r['cost'] - r['rew']) < 6, 'Cost, Pitch, Reward on one row')
    ok(r['pitchBoxes'] == 3, 'Pitch has three columns (Lumber, Stone, Metal)')
    ok(r['skills'] < r['resist'] < r['from'], 'Resistances and "From" sit below the abilities')
    ok(r['lvsTop'] > r['skills'], 'Stats by level sits below the abilities')
    ok('Within budget' in r['bud'] or 'budget' in r['bud'].lower(), 'the budget head is still there')
    ok('Stats:' in r['bud'] and 'Product:' in r['bud'], 'the Stats and Product check lines are still there')
    ok('Context skills' not in r['bud'] and 'N = (Base' not in r['bud'] and 'Flying makes' not in r['bud'], 'the explanation text is gone')
    ok(r['artY'], 'Art height field exists')
    mh = await pg.evaluate("document.querySelector('#editorOverlay .modal').scrollHeight")
    print('  editor modal height', mh)
    for k, y in enumerate((0, 700, 1400, 2100)):
        await pg.evaluate("(y)=>{ const o = document.getElementById('editorOverlay'), m = o.querySelector('.modal'); o.scrollTop = y; m.scrollTop = y; }", y); await pg.wait_for_timeout(250)
        await pg.screenshot(path=os.path.join(SHOTS, f'editor-{w}-{k + 1}.png'), animations='allow')
    await pg.evaluate("closeCardEditor()")
    # ---- 3: the name scroll
    r = await pg.evaluate("""(async()=>{ await document.fonts.load('700 20px "Baloo 2"'); const defs = getCardDefs(), ids = Object.keys(defs).filter(id=> defs[id] && !defs[id].token && defs[id].name); const out = {};
      let host = document.getElementById('ui19Host'); if(host) host.remove(); host = document.createElement('div'); host.id = 'ui19Host'; host.style.cssText = 'position:fixed;left:0;top:0;width:1800px;z-index:99999;background:#2a2a2a;display:flex;flex-wrap:wrap;gap:6px;';
      document.body.appendChild(host);
      for(const cw of [110, 168]){ /* tiles first, then one measuring pass (a reflow per card made this quadratic) */ const caps = new Set(), wrapped = [], shrunk = []; const box = document.createElement('div'); host.appendChild(box); box.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;width:' + (cw * 12) + 'px';
        for(const id of ids){ const w = document.createElement('div'); w.style.cssText = 'width:' + cw + 'px'; w.innerHTML = cardTileHTML(Object.assign({}, defs[id], {art: null})); box.appendChild(w); }
        for(const id of ids){ const w = box.children[ids.indexOf(id)]; const nm = w.querySelector('.nm'); if(!nm) continue; const cs = getComputedStyle(nm).backgroundSize.split(',')[0].trim(); caps.add(cs);
          const t = nm.querySelector('.nmt'); if(t && t.getBoundingClientRect().height > parseFloat(getComputedStyle(t).fontSize) * 1.65) wrapped.push(defs[id].name); if(t && t.style.getPropertyValue('--nm-s')) shrunk.push(defs[id].name); }
        out[cw] = {caps: [...caps], wrapped, nShrunk: shrunk.length, n: ids.length}; box.remove(); }
      host.remove(); return out; })()""")
    for cw, o in r.items():
        print(f'  scroll @card {cw}px: caps {o["caps"]}, shrunk {o["nShrunk"]}/{o["n"]}, two-line {len(o["wrapped"])}: {o["wrapped"]}')
        ok(len(o['caps']) == 1, f'the rolled-end width is the same on all {o["n"]} cards at {cw}px ({o["caps"]})')
    ok('Glacial Ape-King' not in r['168']['wrapped'], 'Glacial Ape-King is on one line')
    json.dump({k: v['wrapped'] for k, v in r.items()}, open(os.path.join(SHOTS, f'two-line-names-{w}.json'), 'w'), indent=1)
    # a sheet of tiles: short, long, two-line names, normal and with art focus pushed down
    await pg.evaluate("""(()=>{ const defs = getCardDefs(); let host = document.getElementById('ui19Sheet'); if(host) host.remove(); host = document.createElement('div'); host.id = 'ui19Sheet';
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#3a3126;padding:8px;display:flex;flex-wrap:wrap;gap:8px;max-width:100vw;';
      const pick = ['glacial-ape-king', 'bee-forager', 'tunnel-ant'].concat(Object.keys(defs).filter(id=> defs[id].name && !defs[id].token && defs[id].name.length > 15).slice(0, 5));
      pick.forEach((id, i)=>{ const d = Object.assign({}, defs[id]); if(i === 0) d.artPosY = 0; const w = document.createElement('div'); w.style.cssText = 'width:' + (innerWidth < 700 ? 110 : 168) + 'px'; w.innerHTML = cardTileHTML(d); host.appendChild(w); });
      document.body.appendChild(host); })()""")
    await pg.wait_for_timeout(500)
    bb = await (await pg.query_selector('#ui19Sheet')).bounding_box(); await pg.screenshot(path=os.path.join(SHOTS, f'scroll-sheet-{w}.png'), clip=bb, animations='allow')
    await pg.evaluate("document.getElementById('ui19Sheet').remove()")
    # the art focus changes the picture's position
    r = await pg.evaluate("""(()=>{ const d = Object.assign({}, getCardDefs()['glacial-ape-king'], {artPosY: 20}); const t = document.createElement('div'); t.innerHTML = cardTileHTML(d); const im = t.querySelector('.card-art-img'); return im ? im.getAttribute('style') : null; })()""")
    ok(r and 'object-position:50% 20%' in r, f'artPosY 20 is on the art ({r})')
    # ---- 4: the Map cards window
    r = await pg.evaluate("""(()=>{ const main = mainConquestMaps(), out = []; for(const m of main.slice(0, 6)){ pk1OpenMapCards(m.id); const ov = document.getElementById('pk1MapCardsOverlay');
      const rows = [...ov.querySelectorAll('.ui19-sk')]; out.push({id: m.id, n: rows.length, nNew: rows.filter(x=> x.classList.contains('is-new')).length, first: rows[0] ? rows[0].textContent.slice(0, 90) : '', counts: rows.slice(0, 2).map(x=> (x.querySelector('.ui19-sk-n') || {}).textContent)}); ov.hidden = true; ov.innerHTML = ''; } return out; })()""")
    print('  map cards', r)
    ok(all(x['n'] > 0 for x in r[1:]), 'each map lists skills')
    ok(r[0]['n'] == r[0]['nNew'], 'the first map: every skill is NEW!')
    ok(any(x['nNew'] < x['n'] for x in r[1:]), 'a later map has skills that are not NEW!')
    ok(all('of' in (c or '') for x in r for c in x['counts']), 'each skill says "n of N cards"')
    await pg.evaluate("(()=>{ const main = mainConquestMaps(); pk1OpenMapCards(main[Math.min(3, main.length - 1)].id); })()"); await pg.wait_for_timeout(900)
    el = await pg.query_selector('#ui19McSkills')
    bb = await el.bounding_box() if el else None
    if bb: await pg.screenshot(path=os.path.join(SHOTS, f'mapcards-skills-{w}.png'), clip={'x': max(0, bb['x'] - 8), 'y': max(0, bb['y'] - 8), 'width': bb['width'] + 16, 'height': min(bb['height'] + 16, 700)}, animations='allow')
    await pg.evaluate("(()=>{ const ov = document.getElementById('pk1MapCardsOverlay'); ov.hidden = true; ov.innerHTML = ''; })()")
    # ---- the scroll on the real screens: Codex, hand and board, the large view
    await pg.evaluate("(()=>{ codexViewMode = 'compressed'; codexSubTab = 'browse'; switchTab('codex'); })()"); await pg.wait_for_timeout(1800)
    await pg.screenshot(path=os.path.join(SHOTS, f'codex-{w}.png'), animations='allow')
    await pg.evaluate("openCardDetail('glacial-ape-king')"); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=os.path.join(SHOTS, f'large-{w}.png'), animations='allow')
    await pg.evaluate("(()=>{ try{ closeCardDetail(); }catch(e){} document.querySelectorAll('.modal-overlay').forEach(o=>{ o.hidden = true; }); })()")
    await pg.evaluate("(()=>{ switchTab('play'); startConquestMatch('m1', '0-2'); })()"); await pg.wait_for_timeout(3500)
    await pg.screenshot(path=os.path.join(SHOTS, f'fight-{w}.png'), animations='allow')
    ok(not errs, f'no page errors {errs[:2]}')
    await ctx.close()

async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME if os.path.exists(V.CHROME) else '/opt/pw-browsers/chromium', args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('FAILED: ' + '; '.join(fails) if fails else 'all ok'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366,390')
    asyncio.run(main(ap.parse_args()))
