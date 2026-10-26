#!/usr/bin/env python3
"""Package RES3 (2026-10-26, rewards and results): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/res3_2026_10_26.py                       # checks + shots in tests/out/shots/res3-*.png
    python3 tests/e2e/res3_2026_10_26.py --widths 1366 --keep  # --keep copies the shots to docs/screens/RES3/ (as .jpg)

Covers: the results' cards grouped and the seen cards in their column, egg / baby cards, the new-map banner, the ribbon (R1-R3, R5, R7, G16),
first-clear greying (G6), the field pills' tooltip and New! (G5), the deck editor (G12), the desktop window fit at 1440x780 (G10), the x10 table
and the packs' summary (G15, G16), the Forge tabs at Map 11 (G18), the Profile's level track (R9) and a level reward held for the Armoury (B1),
the emblem's flight (R6, a frame sheet), an Arena win's XP bar on its results and a Conquest win's XP on Home (R8), Map 16's Group Dungeon (B3).
Every fight calls skipTriggerLesson() (in the page setup). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'RES3')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page(b, url, w, h=None, touch=None):
    ctx = await b.new_context(viewport={'width': w, 'height': h or (844 if w < 700 else 860)}, has_touch=(w < 700) if touch is None else touch)
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e) + ' @ ' + (e.stack or '')[:240])); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(DONE)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    await pg.evaluate("(()=>{ try{ skipTriggerLesson(); }catch(e){} try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} adminModeEnabled = false; window.playDialogue = async ()=>({}); })()")
    return pg

async def close(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

async def shot(pg, name, w, clip=None, pad=16):
    f = os.path.join(OUT, f'res3-{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None
    bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': bb['width'] + 2 * pad, 'height': bb['height'] + 2 * pad}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    shots.append(f); return f

def E(body): return "(async()=>{ " + body + " })()"
FINISH = "gsap.globalTimeline.getChildren(true, true, true).forEach(t=>{ try{ t.progress(1); }catch(e){} });"  # the results' tweens, to their end (software rendering is slow here)
WIN = """switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}
  const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3800));"""

async def run(b, url, w):
    print(f'-- width {w}')
    # R1 R2 R3 R5 R7 G16: the results
    pg = await page(b, url, w)
    r = await pg.evaluate(E(WIN + """
      const m = matchState; m.conquestCardsEarned = ['otter-kit', 'otter-kit', 'otter-kit', 'voidfeather-scout', 'egg-bug']; m.conquestRareFind = 'voidfeather-scout'; m.conquestRankEarned = 'S';
      const ids = Object.keys(getCardDefs()).filter(id=> !/egg|materia/.test(id)).slice(40, 46); m.discoveredThisMatch = ids;
      m.conquestBabyEarned = 'bug'; m.conquestEggDrop = 'bird'; m.conquestKibbleEarned = 2;
      const nm = mapIdAt(2), map = CONQUEST_MAPS.find(x=> x.id === nm);
      m.unlockedActivities = [{icon: map.icon, label: map.name, mapId: nm, tip: 'x'}]; m.unlockedFights = map.nodes.slice(0, 2).map(n=> ({mapId: nm, key: n.key, node: n}));
      renderMatchUI(); await new Promise(r=> setTimeout(r, 300)); rewardCardsReveal(); await new Promise(r=> setTimeout(r, 400)); """ + FINISH + """ await new Promise(r=> setTimeout(r, 900));
      const col = document.querySelector('.rw-half-cards'), rr = document.querySelector('.pl2-rr'), card = rr && rr.closest('.rw-card');
      const a = rr && rr.getBoundingClientRect(), c = card && card.getBoundingClientRect();
      return {groups: document.querySelectorAll('.res3-fan-won .res3-g').length, stack: [...document.querySelectorAll('.res3-fan-won .res3-n')].map(x=> x.textContent),
        seenInCol: !!(col && col.querySelector('.res3-fan-seen')), banner: (document.querySelector('.res3-map-banner .res3-mb-fights')||{}).textContent, fightsListed: document.querySelectorAll('.rw-seen .rw-node').length,
        nests: document.querySelectorAll('.res3-nest-card').length, baby: (document.querySelector('.res3-nest-card.is-baby')||{dataset:{}}).dataset.babyType,
        kib: (document.querySelector('.rw-kibble')||{dataset:{}}).dataset.tip, ribbonTopRight: !!(a && c && a.top < c.top + c.height * .3 && a.right > c.left + c.width * .6)};"""))
    ok(r['groups'] == 5 and r['stack'] == ['×3'], f"R1. five groups, the three Otter Kits one stack ×3 {r['groups']} {r['stack']}")
    ok(r['seenInCol'], 'R2. New cards seen sit in the cards column, in the same fan')
    ok(r['nests'] == 3 and r['baby'] == 'bug', f"R3. the egg card, the egg found and the bug baby are cards {r['nests']} {r['baby']}")
    ok(r['kib'] == 'For nurturing cards in the Nest', f"R3. Kibble's tip {r['kib']}")
    ok(r['banner'] and 'fights' in r['banner'] and r['fightsListed'] == 0, f"R5. one map banner ({r['banner']}), its fights not listed one by one")
    ok(r['ribbonTopRight'], 'R7. the rank ribbon on the card\'s top right')
    await shot(pg, 'results', w, '.winloss-card', 0)
    await close(pg)

    # G6 / G5: the fight panel's first-clear strip and the field pills
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""let found = null;
      for(const map of CONQUEST_MAPS){ for(const n of map.nodes){ if((n.rewardTokens||[]).length && nodeFirstClearCardIds(map.id, n.key).length){ found = {mid: map.id, n}; break; } } if(found) break; }
      let fld = null; for(const map of CONQUEST_MAPS){ if(map.id === 'm1') continue; for(const n of map.nodes){ let h = ''; try{ h = skirmishFieldHTML(map.id, n); }catch(e){} if((h.match(/cnp-fpill/g)||[]).length >= 2){ fld = {mid: map.id, n}; break; } } if(fld) break; }
      const box = document.createElement('div'); box.id = 'res3box'; box.className = 'conquest-node-panel'; box.style.cssText = 'position:fixed; left:12px; top:70px; z-index:50; background:#243424; padding:22px 14px; width:min(360px, 92vw); color:#f0e2c0; display:flex; flex-direction:column; gap:22px';
      const ids = nodeFirstClearCardIds(found.mid, found.n.key); window.cardRewardIsGot = (a, id)=> id === ids[0];
      box.innerHTML = cnpRewardStripHTML(found.mid, found.n, false, null) + cnpRewardStripHTML(found.mid, found.n, true, 'A') + skirmishFieldHTML(fld.mid, fld.n);
      document.body.appendChild(box); await new Promise(r=> setTimeout(r, 400));
      const strips = box.querySelectorAll('.cnp-rw'), grey = el=> getComputedStyle(el).filter;
      const p = box.querySelector('.cnp-fpill'); p.focus(); await new Promise(r=> setTimeout(r, 150)); const tip = document.getElementById('bfPillTip');
      return {fresh: strips[0].querySelectorAll('.res3-got').length, won: strips[1].querySelectorAll('.res3-got').length, wonItems: strips[1].querySelectorAll('.cnp-rw-item.is-got, .cnp-rw-cur.is-got').length,
        cardGrey: grey(strips[1].querySelector('.cnp-rw-card.is-got .card-tile, .cnp-rw-card.is-got .cnp-rw-back')), freshGrey: grey(strips[0].querySelector('.card-tile, .cnp-rw-back')),
        news: box.querySelectorAll('.res3-fnew').length, tip: !!(tip && !tip.hidden && tip.textContent.length > 3)};"""))
    ok(r['fresh'] == 0 and r['won'] >= 3 and r['wonItems'] >= 2, f"G6. not yet won: no ✓; won: the card, items and currencies wear ✓ {r['fresh']} {r['won']} {r['wonItems']}")
    ok('grayscale' in (r['cardGrey'] or '') and 'grayscale' not in (r['freshGrey'] or ''), f"G6. a won card is greyed like the items; an unwon one keeps its colours {r['cardGrey']} / {r['freshGrey']}")
    ok(r['news'] >= 1 and r['tip'], f"G5. New! over an unseen field effect, and the pill's cream tooltip {r}")
    await shot(pg, 'firstclear-fieldpills', w, '#res3box', 8)
    await close(pg)

    # G12: the deck editor
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = null; switchTab('deck'); await new Promise(r=> setTimeout(r, 1500));
      const d = document.querySelector('#myDeckList .deck-stack'), p = document.querySelector('#myDeckPool .card-tile'); document.getElementById('myDeckList').scrollIntoView({block:'start'});
      return {deck: d ? d.getBoundingClientRect().width : 0, pool: p ? p.getBoundingClientRect().width : 0};"""))
    ok(r['deck'] >= (64 if w < 700 else 96) and r['pool'] >= (100 if w < 700 else 140), f"G12. deck cards {r['deck']:.0f}px (was 66), pool cards {r['pool']:.0f}px (was about 90)")
    await shot(pg, 'deck-editor', w)
    await close(pg)

    # G15 G16: the x10 table and the summary
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""myCurrencies.gold = 99999; myCurrencies.gems = 9999; saveCurrencies(); const p = getShopPacks().find(x=> x.id === 'bronze'); const opened = [];
      for(let i = 0; i < 12; i++){ const o = purchasePackOnce(p, true); if(o) opened.push(o); }
      openPackAnimation(p, opened, {bundle: 12}); await new Promise(r=> setTimeout(r, 1500)); """ + FINISH + """ await new Promise(r=> setTimeout(r, 300));
      const t = document.querySelector('.po2-tpack'); return {tp: t ? t.offsetWidth : 0, cards: getShopPacks().map(x=> x.cards), coll: advancedPackOf(getShopPacks()[0]).cards};"""))
    ok(r['tp'] >= (80 if w < 700 else 120) and r['cards'] == [3, 3, 3, 3] and r['coll'] == 5, f"G15. the x10 table's packs {r['tp']:.0f}px (was 86); every pack 3 cards, Collector 5 {r['cards']} {r['coll']}")
    await shot(pg, 'pack-table', w)
    r = await pg.evaluate(E("""const b = document.querySelector('#poOpenAll'); if(b) b.click(); await new Promise(r=> setTimeout(r, 2500)); """ + FINISH + """ await new Promise(r=> setTimeout(r, 600));
      const g = document.querySelector('.po2-all .po2-sum-grid'); return {piles: document.querySelectorAll('.res3-pile').length, scroll: g ? getComputedStyle(g).overflowY : null, xs: document.querySelectorAll('.po2-all .po2-x').length};"""))
    ok(r['scroll'] == 'auto' and r['piles'] == r['xs'], f"G16. the summary scrolls; every ×N card is a stack {r}")
    await shot(pg, 'pack-summary', w)
    await close(pg)

    # G18: the Forge at Map 11 ; R9 B1: the Profile track and a level reward held for the Armoury
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""const p = loadConquestProgress(); mainConquestMaps().slice(0, 11).forEach(m=> m.nodes.forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p);
      codexSubTab = 'forge'; switchTab('codex'); await new Promise(r=> setTimeout(r, 1500));
      return {tabs: [...document.querySelectorAll('.forge-mode')].map(b=> b.textContent.trim()), locked: document.querySelectorAll('.forge-mode.res3-forge-locked').length};"""))
    ok(len(r['tabs']) == 2 and r['locked'] == 1, f"G18. at Map 11: Upgrade and a locked Reinforce '?' {r['tabs']}")  # 2026-10-26 (RES4, RES3-3): Fuse moved to Map 14
    await shot(pg, 'forge-map11', w, '.forge-modes', 30)
    await close(pg)
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""localStorage.removeItem('bramblewood_res3_level_track_v1'); localStorage.removeItem('bramblewood_held_packs_v1');
      res3SaveLevelTrack({granted: 0}); const real = window.armouryOpen; window.armouryOpen = ()=> false; res3CheckLevelTrack(); window.armouryOpen = real;
      const held = JSON.parse(localStorage.getItem('bramblewood_held_packs_v1') || '[]');
      switchTab('profile'); await new Promise(r=> setTimeout(r, 1200));
      const now = document.querySelector('.res3-lt-now'), lt = document.querySelector('.res3-lt');
      return {held: held.map(x=> x.kind + ':' + x.id + ':' + x.level), steps: document.querySelectorAll('.res3-lt-step').length, quarter: now && lt ? now.getBoundingClientRect().width / lt.getBoundingClientRect().width : 0};"""))
    ok(r['held'] == ['res3level:card:1'], f"B1. Level 1's card, before the Armoury, waits with the held packs {r['held']}")
    ok(r['steps'] >= 5 and (w < 700 or 0.2 <= r['quarter'] <= 0.3), f"R9. the level in the left quarter, the next levels and rewards to the right {r}")
    await shot(pg, 'profile-track', w, '.res3-lt', 10)
    await close(pg)

    # R8: an Arena win's XP bar on its results; a Conquest win's XP on Home
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""startMatch('ai'); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}
      const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3600));
      const bar = !!document.querySelector('.winloss-card .wl-xp'); endMatch(); await new Promise(r=> setTimeout(r, 300));
      return {bar, stored: !!localStorage.getItem('bramblewood_pl2_xp_pending_v1')};"""))
    ok(r['bar'] and not r['stored'], f"R8. an Arena win fills its XP bar on its own results {r}")
    await close(pg); pg = await page(b, url, w)
    r = await pg.evaluate(E(WIN + """ const started = !!matchState; endMatch(); const stored = !!localStorage.getItem('bramblewood_pl2_xp_pending_v1'); switchTab('home'); let seen = 0;
      const busy = new Set();
      for(let i = 0; i < 60 && !seen; i++){ await new Promise(r=> setTimeout(r, 250));
        document.querySelectorAll('#deckSwapOverlay, .map-veil').forEach(x=>{ busy.add(x.id || x.className); x.remove(); }); { const ov = document.getElementById('packOpenOverlay'); if(ov && !ov.hidden){ busy.add('packs'); ov.hidden = true; } } // (the swap window or a pack opener holds the XP back, by design)
        seen = document.querySelectorAll('.pl1-xp-float').length || (!localStorage.getItem('bramblewood_pl2_xp_pending_v1') && !pl1XpPending ? -1 : 0); }
      return {started, stored, seen, tab: currentTab, busy: [...busy]};"""))
    ok(r['started'] and r['stored'] and r['seen'] != 0 and r['tab'] == 'home', f"R8. a Conquest win's XP waits, then plays on Home, the first screen after it (seen: 1 = the bar caught on screen, -1 = played and spent between looks) {r}")
    await close(pg)

    if w >= 700:
        # G10: a MacBook-Air-sized window
        pg = await page(b, url, 1440, 780, False)
        r = await pg.evaluate(E("""const mid = mapIdAt(6), mm = CONQUEST_MAPS.find(x=> x.id === mid); switchTab('play'); startConquestMatch(mid, mm.nodes.find(n=> n.kind === 'skirmish').key, {skipEnergyCost:true, noOpener:true});
          await new Promise(r=> setTimeout(r, 3200)); try{ skipTriggerLesson(); }catch(e){}
          const t = document.querySelector('#appWrap .hq-tile, #appWrap .castle-tile, #appWrap .card-tile');
          return {fit: parseFloat(document.getElementById('appWrap').style.getPropertyValue('--res3-fit')) || 1, h: t ? t.getBoundingClientRect().height : 0};"""))
        ok(r['fit'] > 1.05, f"G10. a 1440x780 window grows the match (fit {r['fit']}, a card {r['h']:.0f}px tall; 124 before)")
        await shot(pg, 'fight-1440x780', 1440)
        await close(pg)
        # R6: the emblem's flight (frames)
        pg = await page(b, url, w)
        # (on Home; software rendering draws a frame or two a second here, so the flight is stepped: the global timeline is paused and set
        # to each moment in turn, a screenshot each)
        await pg.evaluate("(()=>{ switchTab('home'); })()"); await pg.wait_for_timeout(1200)
        await pg.evaluate("(()=>{ window.__t0 = gsap.globalTimeline.time(); gsap.globalTimeline.pause(); window.__fly = res3RankEmblemFlight(null, 'S'); })()")
        from PIL import Image
        frames, first, last = [], None, None
        for i, t in enumerate([0.12, 0.45, 0.75, 1.05, 1.35, 1.58]):
            pos = await pg.evaluate(f"(()=>{{ gsap.globalTimeline.time(window.__t0 + {t}); const o = document.querySelector('.res3-rank-fly'); if(!o) return null; const r = o.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; }})()")
            f = os.path.join(OUT, f'res3-emblem-f{i}-{w}.png'); await pg.screenshot(path=f, animations='disabled'); frames.append(f)
            if i == 0: first = pos
            if pos: last = pos
        ims = [Image.open(f).resize((w // 3, 860 // 3)) for f in frames]; sheet = Image.new('RGB', (w // 3 * 3, 860 // 3 * 2))
        for i, im in enumerate(ims): sheet.paste(im, ((i % 3) * (w // 3), (i // 3) * (860 // 3)))
        sf = os.path.join(OUT, f'res3-emblem-sheet-{w}.png'); sheet.save(sf); shots.append(sf)
        ok(first and first[0] < w * .5 and last and last[0] > w * .6 and last[1] > 860 * .55, f"R6. the emblem starts on the left and ends bottom right {first} -> {last}")
        # (the global timeline stays paused; the page is closed)
        await close(pg)
        # B3: Map 16's spot
        pg = await page(b, url, w)
        r = await pg.evaluate(E("""const p = loadConquestProgress(); mainConquestMaps().slice(0, 17).forEach(m=> m.nodes.forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p);
          return {name: FEATURE_SPOTS.find(s=> s.key === 'coop').name, map: FEATURE_SPOTS.find(s=> s.key === 'coop').mapNumber};"""))
        ok(r['name'] == 'The Tidelock Vault' and r['map'] == 16, f"B3. the Group Dungeon's spot: {r}")  # 2026-10-26 (RES4, RES3-4): renamed, aqua-themed (was The Warren Heist)
        await close(pg)

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else None
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        from PIL import Image
        os.makedirs(KEEP, exist_ok=True)
        for f in shots: Image.open(f).convert('RGB').save(os.path.join(KEEP, os.path.basename(f)[:-4] + '.jpg'), quality=82)
    print(f'{len(fails)} failed' if fails else 'all passed'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true')
    asyncio.run(main(ap.parse_args()))
