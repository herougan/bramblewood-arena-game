#!/usr/bin/env python3
"""Package UI3 (2026-10-29, owner 23:01 S2-S6, S8-S10): browser checks and screenshots at 390 and 1366 (docs/screens/ui3/).

    python3 tests/e2e/ui3_2026_10_29.py                  # checks + shots in docs/screens/ui3/
    python3 tests/e2e/ui3_2026_10_29.py --widths 1366

S4 the Map cards overlay: a main map shows its list + SPECIAL, a submap only its own + SPECIAL. S6 hover shows the card detail (above the overlay, with the
reason line), no native title, no "?". S10 Export all (text, .txt / .json, the toggles). S8 the map admin bar's Players button. S5 the keyword tints on card
faces. S2 a night-blind unit shows no pip by day and the plain Blind pip at night (one Blind). S3 the rank emblem lands on its own fight, panned and zoomed.
S9 a solo group-dungeon run: random CPU ally deck, no generic Victory card, the end screen alone, Back to the Arena's Co-op pane.
Page setup and helpers come from tests/e2e/pl2_2026_10_25.py. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import pl2_2026_10_25 as P
from playwright.async_api import async_playwright
ROOT = P.ROOT; OUT = os.path.join(ROOT, 'docs', 'screens', 'ui3'); os.makedirs(OUT, exist_ok=True)
ok = P.ok

async def shot(pg, name, w, clip=None, pad=12):
    f = os.path.join(OUT, f'{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None; bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': min(bb['width'] + 2 * pad, w), 'height': min(bb['height'] + 2 * pad, 900)}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    P.shots.append(f); return f

E = lambda body: "(async()=>{ " + body + " })()"
TINT_IDS = ['komodo-warlord', 'yeti', 'white-dragon', 'magma-salamander', 'blind-cave-fish', 'cave-bat-swarm', 'golden-eagle-diver', 'owl-sentinel', 'venomlord-serpent', 'quarry-troll', 'otter-kit', 'raccoon-warlord']

async def run(b, url, w):
    print(f'-- width {w}')
    # ---------- S4 + S6 + S10: the Map cards overlay
    pg = await P.page(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; })()")
    r = await pg.evaluate(E("""pk1OpenMapCards('mb'); await new Promise(r=> setTimeout(r, 500));
      const labels = [...document.querySelectorAll('#pk1MapCardsOverlay .pk1-mc-sec > h3')].map(h=> h.textContent.replace(/\\s+/g, ' ').trim());
      const counts = [...document.querySelectorAll('#pk1MapCardsOverlay .rv2-cl')].map(x=> x.textContent.replace(/\\s+/g, ' ').trim());
      return {labels, counts, title: document.getElementById('pk1McTitle').textContent};"""))
    ok(len(r['labels']) >= 1 and not any('Submap' in l or 'submap' in l or 'Smuggl' in l or 'lily' in l.lower() for l in r['labels'][:1]) and len(r['labels']) == 2, f'S4 a main map (Map 2, mb) shows its MAP list and SPECIAL only {r["labels"]}')
    await shot(pg, 'mapcards-main', w)
    r = await pg.evaluate(E("""pk1OpenMapCards('mp'); await new Promise(r=> setTimeout(r, 500));
      return {labels: [...document.querySelectorAll('#pk1MapCardsOverlay .pk1-mc-sec > h3')].map(h=> h.textContent.replace(/\\s+/g, ' ').trim()), title: document.getElementById('pk1McTitle').textContent};"""))
    ok(len(r['labels']) == 2 and 'MAP' not in r['labels'][0].upper().split('·')[0][:4] , f'S4 a submap (mp) shows only its own list and SPECIAL {r}')
    await shot(pg, 'mapcards-sub', w)
    # S6: hover a card in the review gallery
    await pg.evaluate("(()=>{ pk1OpenMapCards('m4'); })()"); await pg.wait_for_timeout(500)
    r = await pg.evaluate("""()=>({titles: document.querySelectorAll('#pk1MapCardsOverlay .rv1-tile[title]').length, marks: [...document.querySelectorAll('#pk1MapCardsOverlay .rv1-mark')].map(x=> x.textContent), why: document.querySelectorAll('#pk1MapCardsOverlay [data-zoom-why]').length,
      cursor: getComputedStyle(document.querySelector('#pk1MapCardsOverlay .rv1-tile .vis4-mc-card')).cursor})""")
    ok(r['titles'] == 0 and '?' not in r['marks'] and r['why'] > 0 and r['cursor'] != 'help', f'S6 no native title, no "?" marker, the reason rides on the card for its detail {r}')
    card = await pg.query_selector('#pk1MapCardsOverlay .rv1-part.is-maybe .rv1-tile .vis4-mc-card') or await pg.query_selector('#pk1MapCardsOverlay .rv1-tile .vis4-mc-card')
    await card.scroll_into_view_if_needed(); await card.hover(); await pg.wait_for_timeout(2500)
    r = await pg.evaluate("""()=>{ const zs = [...document.querySelectorAll('.cnp-rw-zoom')]; const z = zs.find(x=> x.classList.contains('is-in')) || zs[zs.length - 1]; if(!z) return null; const bb = z.getBoundingClientRect(), cs = getComputedStyle(z), top = document.elementFromPoint(bb.left + bb.width/2, bb.top + 20);
      return {z: +cs.zIndex, op: z.classList.contains('is-in') ? 1 : 0, hasTile: !!z.querySelector('.card-tile'), why: (z.querySelector('.cnp-rw-why')||{}).textContent || '', w: bb.width, over: getComputedStyle(document.getElementById('pk1MapCardsOverlay')).zIndex}; }""")
    ok(r and r['hasTile'] and r['z'] > int(r['over']) and r['op'] > .9 and len(r['why']) > 3, f'S6 hovering a card shows the full card detail above the overlay with the reason line {r}')
    await shot(pg, 'mapcards-hover-detail', w)
    await pg.mouse.move(2, 2); await pg.wait_for_timeout(300)
    # S10: flip two cards on this map, Export all
    await pg.evaluate("(()=>{ const bs = [...document.querySelectorAll('#pk1MapCardsOverlay .rv1-act')]; bs.slice(0, 2).forEach(b=> b.click()); })()")
    await pg.evaluate("(()=>{ pk1OpenMapCards('m5'); })()"); await pg.wait_for_timeout(400)
    await pg.evaluate("(()=>{ pk1OpenMapCards('m4'); })()"); await pg.wait_for_timeout(400)
    flips = await pg.evaluate("document.querySelectorAll('#pk1MapCardsOverlay .rv1-tile.is-flipped').length")
    ok(flips == 2, f'S10 the Cut / Keep toggles survive closing and reopening the gallery ({flips} flipped)')
    await pg.click('#rv3ExportAll'); await pg.wait_for_timeout(500)
    r = await pg.evaluate("({txt: window.__rv3Last && window.__rv3Last.text, n: window.__rv3Last && window.__rv3Last.json.lists.length, msg: document.getElementById('rv1CopyMsg').textContent, dl: !!document.querySelector('#rv3Dl [data-rv3-dl=txt]') && !!document.querySelector('#rv3Dl [data-rv3-dl=json]'), tip: document.getElementById('rv3ExportTip').textContent})")
    lines = (r['txt'] or '').split('\n')
    ok(r['n'] > 20 and len(lines) == r['n'] + 1 and lines[1].startswith('Map 0 · ') and ' | chosen: ' in lines[1] and ' | maybe: ' in lines[1] and ' | cut: ' in lines[1], f'S10 one line per list, in map order, with chosen / maybe / cut ({r["n"]} lists; first: {lines[1][:150] if len(lines) > 1 else ""})')
    mine = [l for l in lines if l.startswith('Map ') and ': keep ' in l.split(' | ')[0] or ': cut ' in l.split(' | ')[0]]
    ok(len(mine) >= 1 and r['dl'] and r['tip'].startswith('Copies every list'), f'S10 the owner\'s toggles are on the lines, .txt / .json downloads offered, a tooltip says what it does ({mine[:1]})')
    await shot(pg, 'mapcards-export', w, '#pk1MapCardsOverlay .rv1-bar', 40)
    await P.close(pg)

    # ---------- S8: the map admin bar's Players button
    pg = await P.page(b, url, w)
    r = await pg.evaluate(E("""adminModeEnabled = true; conquestAdminBarOpen = true; try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
      conquestWorldView = false; conquestSelectedMap = 'm1'; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 1500));
      const b = document.getElementById('mlPlayers'); const bar = b && b.closest('.map-layout-bar');
      return {has: !!b, text: b && b.textContent.trim(), order: bar && [...bar.querySelectorAll('button')].map(x=> x.id)};"""))
    ok(r['has'] and r['text'].endswith('Players') and r['order'].index('mlUnclearMap') < r['order'].index('mlPlayers'), f'S8 the map admin bar has a 👥 Players button after Unclear map {r}')
    await shot(pg, 'map-admin-bar-players', w, '.map-layout-bar', 14)
    await pg.click('#mlPlayers'); await pg.wait_for_timeout(900)
    r = await pg.evaluate("({ov: !!document.querySelector('.adminu1-overlay'), msg: (document.querySelector('.adminu1-overlay') || {}).textContent || ''})")
    ok(r['ov'], f'S8 it opens the player list overlay (the database function is not applied yet: {r["msg"][:90]!r})')
    await shot(pg, 'players-overlay-from-map', w)
    # S3: the emblem lands on its own fight, the map panned and zoomed
    await pg.evaluate("(()=>{ document.querySelectorAll('.adminu1-overlay').forEach(o=> o.remove()); })()")
    r = await pg.evaluate(E("""const cv = document.getElementById('conquestCanvas'), node = cv.querySelector(':scope > .map-node'); if(!node) return {none: true};
      gsap.globalTimeline.timeScale(1); const out = {};
      const run = async (label)=>{ const rings = []; const mo = new MutationObserver(ms=> ms.forEach(m=> m.addedNodes.forEach(n=>{ if(n.classList && n.classList.contains('res3-rank-ring')) rings.push([parseFloat(n.style.left), parseFloat(n.style.top)]); })));
        mo.observe(document.body, {childList: true}); const t0 = performance.now(); await res3RankEmblemFlight(node, 'S'); mo.disconnect(); const r = node.getBoundingClientRect();
        out[label] = {ring: rings[0], node: [Math.round(r.right - r.width * .18), Math.round(r.bottom - r.height * .18)], ms: Math.round(performance.now() - t0), H: innerHeight, W: innerWidth}; };
      await run('plain');
      cv.style.transformOrigin = '0 0'; cv.style.transform = 'translate(-40px,-30px) scale(1.4)'; await new Promise(r=> setTimeout(r, 200)); await run('zoomed');
      cv.style.transform = ''; return out;"""))
    if r.get('none'): ok(False, 'S3 no node on the map')
    else:
        for k, v in r.items():
            rg = v['ring']; near = rg and abs(rg[0] - v['node'][0]) < 6 and abs(rg[1] - v['node'][1]) < 6
            ok(near, f'S3 ({k}) the emblem lands on its own fight (ring {rg}, node corner {v["node"]}, page {v["W"]}x{v["H"]}), not the bottom of the screen')
    await P.close(pg)

    # ---------- S5: the keyword tints on card faces
    pg = await P.page(b, url, w)
    r = await pg.evaluate(E("""const defs = getCardDefs(), ids = %s.filter(id=> defs[id]);
      const host = document.createElement('div'); host.id = 'ui3Sheet'; host.style.cssText = 'position:fixed; inset:0; z-index:5000; background:#2a2118; padding:10px; overflow:auto; display:flex; flex-wrap:wrap; gap:10px; align-content:flex-start';
      host.innerHTML = ids.map(id=> `<div style="width:${innerWidth < 700 ? 84 : 120}px; text-align:center; font:700 10px sans-serif; color:#fff">${cardTileHTML(defs[id], {inPlay: true})}<br>${ui3TintKeys(defs[id]).map(t=> t[0]).join('+') || 'none'}</div>`).join('');
      document.body.appendChild(host); await new Promise(r=> setTimeout(r, 400));
      return {tinted: [...host.querySelectorAll('.ui3-tint')].map(t=> t.dataset.tint), n: ids.length, untinted: ui3TintKeys(defs['otter-kit']).length};""" % json.dumps(TINT_IDS)))
    want = {'poison', 'heat', 'cold', 'dark', 'diurnal', 'nocturnal'}
    seen = set(' '.join(r['tinted']).split())
    ok(want <= seen and r['untinted'] == 0, f'S5 poison / heat / cold / dark / diurnal / nocturnal each tint a card; a plain card does not {r}')
    await shot(pg, 'tints', w)
    r = await pg.evaluate("""()=>{ const t = document.querySelector('#ui3Sheet .ui3-tint'), nm = t.parentElement.querySelector('.nm'), cs = getComputedStyle(t);
      return {z: +cs.zIndex, nmZ: +getComputedStyle(nm).zIndex, pe: cs.pointerEvents, bg: cs.backgroundImage.slice(0, 120)}; }""")
    ok(r['pe'] == 'none' and r['z'] < r['nmZ'], f'S5 the wash sits under the name and numbers and ignores the pointer {r}')
    await pg.evaluate("(()=>{ document.documentElement.dataset.fx = 'none'; })()")
    ok(await pg.evaluate("getComputedStyle(document.querySelector('#ui3Sheet .ui3-tint')).display") == 'none', 'S5 No effects: the tint is off')
    await pg.evaluate("(()=>{ document.documentElement.dataset.fx = 'low'; })()")
    ok(await pg.evaluate("getComputedStyle(document.querySelector('#ui3Sheet .ui3-tint')).boxShadow") != 'none', 'S5 Low effects: a flat inner glow stays')
    await P.close(pg)

    # ---------- S2: night-blind pips in a fight
    pg = await P.page(b, url, w)
    r = await pg.evaluate(E("""startMatch('ai'); await new Promise(r=> setTimeout(r, 2600)); const m = matchState, defs = getCardDefs(); const d = defs['hoopoe-herald'], d2 = defs['aye-aye-prowler'];
      const res = {}; const phase = {v: 'day'}; m.engine.getPhase = ()=> phase.v; m.mode = 'ai';
      const html = (dd, blind)=> abilityBadges(dd, {live: {pid: 1, uid: 99, blind}});
      const has = s=> ({night: /ab-blindnow/.test(s) || false, trait: /Night-blind|nightblind/.test(s)});
      res.dayNB = html(d, 0).includes('ab-blindnow'); res.dayNBtrait = /🌑/.test(html(d, 0));
      phase.v = 'night'; res.nightNB = html(d, 0).includes('ab-blindnow'); res.nightNBwithStatus = html(d, 2).includes('ab-blindnow'); res.nightTrait = /🌑/.test(html(d, 0));
      phase.v = 'day'; res.daySS = html(d2, 0).includes('ab-blindnow'); phase.v = 'night'; res.nightSS = html(d2, 0).includes('ab-blindnow');
      res.hand = /🌑/.test(abilityBadges(d, {compact: true, live: null}));
      return res;"""))
    ok(not r['dayNB'] and not r['dayNBtrait'], f'S2 a night-blind unit by day shows no pip {r}')
    ok(r['nightNB'] and not r['nightTrait'] and not r['nightNBwithStatus'], f'S2 at night it shows the plain Blind pip only (not 🌑), and none when it already carries the Blind status ({r})')
    ok(not r['nightSS'] and r['hand'], f'S2 Sun-shy is quiet at night; outside a fight the trait pip stays {r}')
    await pg.evaluate("(()=>{ try{ endMatch(); }catch(e){} })()")
    await P.close(pg)

    # ---------- S9: a solo group-dungeon run
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(P.DONE); await pg.goto(url); await pg.wait_for_function("typeof gdCreate === 'function'", timeout=60000); await pg.wait_for_timeout(2000)
    await pg.evaluate("""()=>{ deckSizeOkOrWarn = ()=> true; adminModeEnabled = true; try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} try{ const s = settleEnergy(); s.current = 60; saveEnergyState(s); }catch(e){} switchTab('play'); playSubTab = 'dungeons'; renderPlay(); }""")
    await pg.wait_for_timeout(300)
    await pg.evaluate("()=> gdCreate(true)"); await pg.wait_for_timeout(500)
    lobby = await pg.evaluate("()=> ({cpu: [...document.querySelectorAll('#gdOverlay .gd-seat.is-empty small')].map(x=> x.textContent)})")
    ok(any('random deck' in t for t in lobby['cpu']), f'S9 the lobby says the CPU ally brings a random deck {lobby}')
    await shot(pg, 'coop-solo-lobby', w)
    await pg.click('#gdOverlay [data-gd-act="start"]'); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("""()=>{ const T = GD.s.T, mine = Object.keys(T.seats[0].deck).sort().join(), cpu = Object.keys(T.seats[1].deck).sort().join(); return {cpu: T.seats[1].cpu, same: mine === cpu, n: Object.values(T.seats[1].deck).reduce((a, c)=> a + c, 0), distinct: Object.keys(T.seats[1].deck).length, filler: !!GD.s.startMsg.seats[1].filler}; }""")
    ok(r['cpu'] and not r['same'] and r['n'] == 20 and r['filler'], f'S9 the CPU ally plays its own random 20-card deck (not a copy of yours) {r}')
    seen = {'wl': False, 'both': False}
    for floor in range(4):
        await pg.evaluate("()=>{ const T = matchState.coop.T; T.players[2].hq.hp = 0; T.players[2].hq.shield = 0; T.players[2].hq.shieldLayers = []; renderHUD(); }")
        await pg.evaluate("async()=>{ try{ await skipTurn(); }catch(e){} }")
        for i in range(40):
            await pg.wait_for_timeout(300)
            s = await pg.evaluate("()=>({phase: GD.phase, gd: !!document.querySelector('#gdOverlay:not([hidden]) .gd-panel'), wl: !!document.querySelector('.winloss-overlay')})")
            if s['wl']: seen['wl'] = True
            if s['phase'] in ('floorEnd', 'end') and s['gd']: break
        if floor == 0: await shot(pg, 'coop-floor-cleared', w)
        if await pg.evaluate("()=> GD.phase") == 'end': break
        nxt = await pg.query_selector('#gdOverlay [data-gd-act="next"]')
        if nxt: await nxt.click(); await pg.wait_for_timeout(2500)
    ok(not seen['wl'], 'S9 the generic "Victory! Play again" card never opens over a group-dungeon floor or the run\'s end')
    r = await pg.evaluate("()=>({phase: GD.phase, title: (document.querySelector('#gdOverlay .gd-panel h3')||{}).textContent || '', back: !!document.querySelector('#gdOverlay [data-gd-act=\"close\"]')})")
    ok(r['phase'] == 'end' and 'cleared' in r['title'] and r['back'], f'S9 the run ends on its own screen with Back {r}')
    await shot(pg, 'coop-run-cleared', w)
    await pg.click('#gdOverlay [data-gd-act="close"]'); await pg.wait_for_timeout(900)
    r = await pg.evaluate("()=>({tab: currentTab, sub: playSubTab, pane: pl2ArenaPane, coopTab: !!document.querySelector('.pl2-arena-tabs [data-pl2-arena=coop].is-on, .pl2-arena-tabs [data-pl2-arena=coop][aria-selected=true]'), match: !!matchState})")
    ok(r['tab'] == 'play' and r['sub'] == 'arena' and r['pane'] == 'coop' and not r['match'], f'S9 Back returns to the Arena page with the Co-op section open {r}')
    await shot(pg, 'coop-back-to-arena', w)
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
