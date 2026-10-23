#!/usr/bin/env python3
"""Package NE (2026-10-24, owner notes 2026-10-23): plays each change in the built game at 390 and 1366 and keeps a screenshot of each in
docs/screens/NE/. Checks: the Nest's wallet, Hatchery | Upgrades tabs, a locked nest's shake and label, the nest subwindow's Eggs | Younglings,
a Nurse swap leaving an egg's time alone; the Camp pool's Shift chip, the leader counted, greyed full cards, the copy fan (opens, adds exactly
the copy clicked, greys it); the decks list's leather slots and type emojis; the places bar's map and the icon Home; the Codex detail's copies
and a tapped copy's level; the fight panel's field under the BR; the shop counter on screen after a tap; the pack viewer's card-left /
details-right; filters reset on entering a page.
    python3 tests/e2e/ne_2026_10_24.py"""
import asyncio, os, sys, functools, http.server, socketserver, threading
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'NE'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, *a): pass  # a page closed mid-download (a broken pipe) is not a test failure
    h = S(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
async def page(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}); pg._errs = []
    pg.on('pageerror', lambda e: pg._errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; })()")
    # the headless renderer runs a frame a second or slower on these pages, so CSS transitions are read at their end state
    await pg.add_style_tag(content='.pg-limit, .ne-cx-lv, .ne-cx-copy{transition:none !important;}')
    return pg
async def shot(pg, name, w):
    await pg.add_style_tag(content='.toast, .toast-host, .xp-float, [class*="levelup"]{display:none !important;}'); await pg.wait_for_timeout(200)
    await pg.screenshot(path=os.path.join(OUT, f'{name}-{w}.png'), animations='disabled')
E = lambda js: f"(async()=>{{ {js} }})()"
SETUP_COPIES = """const id = 'pond-duck'; for(let i=0;i<5;i++) unlockCardForPlayer(id, 'test'); copyModelOn(); copyModelSync(id);
  const a = myCardCopies[id]; a.forEach((c,i)=>{ c.level = [4,2,1,1,3][i] || 1; }); a[1].shiny = true; a[2].foil = true; a[2].finish = 'rainbow'; saveCardCopies(); syncBestLevel(id);"""
async def run(b, url, w):
    print(f'-- {w}')
    # ---- the Nest
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""switchTab('nest'); await new Promise(r=>setTimeout(r,500));
      const tabs = [...document.querySelectorAll('#view-nest .facility-tab')].map(t=> t.textContent.trim());
      const wallet = [...document.querySelectorAll('#view-nest .ne-wallet .cur-pill')].length;
      const noMap = !/Map \\d/.test(document.querySelector('#view-nest .hatchery').textContent);
      const lk = document.querySelector('#view-nest [data-nest-locked]'); lk.click(); await new Promise(r=>setTimeout(r,150));
      return {tabs, wallet, noMap, label: (lk.querySelector('.ne-lock-label')||{}).textContent || ''};"""))
    ok(len(r['tabs']) == 2 and 'Hatchery' in r['tabs'][0] and 'Upgrades' in r['tabs'][1], f"#11 Nest tabs {r['tabs']}"); ok(r['wallet'] == 3, f"#9 the Nest's wallet ({r['wallet']} pills)")
    ok(r['noMap'], '#10 no map number in the Hatchery'); ok(r['label'] == 'Locked for now — progress further', f"#10 a tapped locked nest says {r['label']!r}")
    await shot(pg, 'nest-locked', w)
    r = await pg.evaluate(E("""grantEgg('bird', 't'); unlockCardForPlayer('field-mouse', 'test'); const c = (myCardCopies['field-mouse']||[]).slice(-1)[0]; if(c){ c.level = 0; c.hatch = 1; saveCardCopies(); }
      renderNest(); document.querySelector('[data-nest-empty]').click(); await new Promise(r=>setTimeout(r,300));
      const tabs = [...document.querySelectorAll('.nest-picker [data-np-tab]')].map(t=> t.dataset.npTab);
      document.querySelector('.nest-picker [data-np-tab="young"]').click(); await new Promise(r=>setTimeout(r,150));
      return {tabs, young: !document.querySelector('[data-np-pane="young"]').hidden, eggsHidden: document.querySelector('[data-np-pane="eggs"]').hidden, wallet: !!document.querySelector('.nest-picker .ne-wallet')};"""))
    ok(r['tabs'] == ['eggs', 'young'] and r['young'] and r['eggsHidden'] and r['wallet'], f'#11 the nest subwindow: Eggs | Younglings, with the wallet {r}')
    await shot(pg, 'nest-younglings', w)
    r = await pg.evaluate(E("""document.querySelector('.nest-picker [data-np-tab="eggs"]').click(); document.querySelector('[data-np-egg]').click(); await new Promise(r=>setTimeout(r,200));
      const e = nestState().eggs.find(x=> x.placed !== false && x.kind === 'bird'); const before = e && e.hatchAt;
      const st = nestState(); st.nurse = 'wandering-traveller'; saveNestState(st); renderNest(); await new Promise(r=>setTimeout(r,100));
      return {before, after: (nestState().eggs.find(x=> x.id === e.id)||{}).hatchAt, note: !!document.querySelector('.ne-nurse-note')};"""))
    ok(r['before'] and r['before'] == r['after'] and r['note'], f'#26 a Nurse swap keeps the egg\'s time {r}')
    ok(not pg._errs, f'no page errors (Nest): {pg._errs[:2]}'); await pg.close()
    # ---- the Camp pool
    pg = await page(b, url, w)
    r = await pg.evaluate(E(SETUP_COPIES + """deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = activeDeckId; switchTab('deck'); await new Promise(r=>setTimeout(r,800));
      myLeaderId = 'wandering-traveller'; noteSighted(['wandering-traveller']); invalidateCardDefs(); renderMyDeckPanels();
      const chip = document.querySelector('#myDeckPool [data-ne-fan="pond-duck"] .pg-limit'); const hidden = getComputedStyle(chip).opacity === '0';
      document.dispatchEvent(new KeyboardEvent('keydown', {key:'Shift'})); await new Promise(r=>setTimeout(r,200)); const shown = getComputedStyle(chip).opacity === '1';
      document.dispatchEvent(new KeyboardEvent('keyup', {key:'Shift'}));
      const wt = document.querySelector('#myDeckPool .card-tile[data-defid="wandering-traveller"]'), ws = wt && wt.closest('.pool-stack');
      const full = [...document.querySelectorAll('#myDeckPool .pool-stack')].filter(s=> s.classList.contains('ne-full')).map(s=> s.querySelector('.card-tile').dataset.defid);
      const fullOk = full.every(id=> neDeckFull(id));
      const host = document.querySelector('#myDeckPool [data-ne-fan="pond-duck"]'); host.scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,300));
      neFanOpen('pond-duck', host); const fanN = document.querySelectorAll('.ne-fan .ne-fan-card').length;
      const lv2 = myCardCopies['pond-duck'].find(c=> c.level === 2); document.querySelector(`.ne-fan [data-ne-copy="${lv2.uid}"]`).click(); await new Promise(r=>setTimeout(r,300));
      return {hidden, shown, hint: !!document.getElementById('neShiftHint'), wtChip: ws ? (ws.querySelector('.pg-limit')||{}).textContent : null, wtFull: ws ? ws.classList.contains('ne-full') : null, fullOk,
        fanN, n: myDeckCounts['pond-duck'], picked: deckCopyPicks('pond-duck').includes(lv2.uid), greyed: !!document.querySelector(`.ne-fan [data-ne-copy="${lv2.uid}"].is-in`), lv: deckCopyLevels('pond-duck', myDeckCounts['pond-duck'])};"""))
    ok(r['hidden'] and r['shown'] and r['hint'], f"11:15 the count chip only while Shift is held; the hint is shown {r['hidden'], r['shown'], r['hint']}")
    ok(r['wtChip'] in (None,) or (r['wtChip'].startswith('1/') and r['wtFull']), f"11:15 the leader counted and greyed ({r['wtChip']}, {r['wtFull']})")
    ok(r['fullOk'], '#17 only full cards are greyed')
    ok(r['fanN'] == 5 and r['n'] == 1 and r['picked'] and r['greyed'] and r['lv'] == [2], f'11:15 the fan: 5 copies, the Lv 2 copy went in exactly and shows greyed {r}')
    r = await pg.evaluate(E("""document.body.classList.add('ne-shift'); const host = document.querySelector('#myDeckPool [data-ne-fan="pond-duck"]'); host.scrollIntoView({block:'end'});
      await new Promise(r=>setTimeout(r,300)); neFanOpen('pond-duck', host); await new Promise(r=>setTimeout(r,300)); return !!document.querySelector('.ne-fan');"""))
    await shot(pg, 'camp-fan', w); ok(await pg.evaluate("!!document.querySelector('.ne-fan')"), '11:15 the fan stays open (the shot shows it)')
    ok(not pg._errs, f'no page errors (Camp): {pg._errs[:2]}'); await pg.close()
    # ---- decks list, nav
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""localStorage.setItem(DECK_SLOTS_KEY, '3'); switchTab('deck'); await new Promise(r=>setTimeout(r,700));
      const slots = document.querySelectorAll('#deckMenuGrid .ne-slot'), m = document.querySelector('#deckMenuGrid .deck-medium-preview'), pr = m.getBoundingClientRect(), sr = slots[0] && slots[0].getBoundingClientRect();
      const em = document.querySelector('#deckMenuGrid .dmp-types'), er = em && em.getBoundingClientRect();
      return {slots: slots.length, sameH: sr && Math.abs(sr.height - pr.height) < 3, emojiRight: !!er && er.left > pr.left + pr.width * .6, sub: /You play with this one/.test(m.textContent),
        map: !!document.querySelector('#pageBackBar [data-pbsc="map"]'), home: document.getElementById('homeNavBtn').textContent.trim()};"""))
    ok(r['slots'] == 2 and r['sameH'], f"#13 two empty leather slots, deck-preview sized {r['slots'], r['sameH']}")
    ok(r['emojiRight'] and r['sub'], f"#19 the type emojis on the right; the subtitle {r['emojiRight'], r['sub']}")
    ok(r['map'] and 'Home' not in r['home'], f"#21 the map shortcut and the icon Home {r['map'], r['home']!r}")
    await shot(pg, 'decks-slots', w)
    r = await pg.evaluate(E("""document.querySelector('#pageBackBar [data-pbsc="map"]').click(); await new Promise(r=>setTimeout(r,500)); return currentTab + ':' + playSubTab;"""))
    ok(r == 'play:conquest', f'#21 the shortcut opens the Conquest map ({r})'); await pg.close()
    # ---- the Codex detail's copies, filter reset
    pg = await page(b, url, w)
    r = await pg.evaluate(E(SETUP_COPIES + """codexFilter.rarity = 'rare'; codexFilter.archetype = 'Bird'; saveCodexFilters(); switchTab('home'); await new Promise(r=>setTimeout(r,200));
      codexSubTab = 'browse'; switchTab('codex'); await new Promise(r=>setTimeout(r,700));
      const reset = codexFilter.rarity === '' && codexFilter.archetype === '' && !(uiSticky('codex').rarity);
      openCardDetail('pond-duck', {codex:true}); await new Promise(r=>setTimeout(r,300));
      const cps = document.querySelectorAll('#cardDetailOverlay .ne-cx-copy'), groups = document.querySelectorAll('#cardDetailOverlay .ne-cx-group').length;
      cps[0].click(); await new Promise(r=>setTimeout(r,250));
      return {reset, n: cps.length, groups, lv: getComputedStyle(cps[0].querySelector('.ne-cx-lv')).opacity, text: cps[0].querySelector('.ne-cx-lv').textContent};"""))
    ok(r['reset'], '19:27 the Codex opens with its filters reset')
    ok(r['n'] == 5 and r['groups'] == 3 and r['lv'] == '1' and r['text'] == 'Lv 4', f'#12 five copies in three treatments; a tapped one shows its level {r}')
    await shot(pg, 'codex-copies', w); await pg.close()
    # ---- the fight panel
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""const mid = mapIdAt(0), p = loadConquestProgress(), id = conquestNodeId(mid, '0-1'); if(!p.completed.includes(id)){ p.completed.push(id); p.ranks[id] = 'B'; } saveConquestProgress(p);
      conquestWorldView = false; conquestSelectedMap = mid; conquestSelectedNodeKey = '0-1'; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=>setTimeout(r,2500));
      const f = document.querySelector('#conquestNodePanel .cnp-title .cnp-field-pills'), br = document.querySelector('#conquestNodePanel .cnp-lvl-inline');
      return {inHead: !!f, below: !!(f && br) && f.getBoundingClientRect().top >= br.getBoundingClientRect().bottom - 2, noHeading: !document.querySelector('#conquestNodePanel .cnp-field-k')};"""))
    ok(r['inHead'] and r['below'] and r['noHeading'], f'11:26 the field pills in the head, under the BR {r}')
    await shot(pg, 'fight-panel', w); await pg.close()
    # ---- the shop counter, the pack viewer
    pg = await page(b, url, w)
    await pg.emulate_media(reduced_motion='reduce')  # an instant scroll (a smooth one takes many of this renderer's slow frames)
    r = await pg.evaluate(E("""isSignedIn = ()=>true; playerMapReach = ()=>20; myCurrencies.gold = 5000; myCurrencies.gems = 500; switchTab('shop'); await new Promise(r=>setTimeout(r,500));
      document.querySelectorAll('[data-shelfitem]')[1].click(); await new Promise(r=>setTimeout(r,3500));
      const act = document.querySelector('#shopCounter .counter-act .btn'), r = act && act.getBoundingClientRect(); return {btn: !!act, inView: !!r && r.bottom <= innerHeight && r.top >= 0};"""))
    ok(r['btn'] and r['inView'], f"19:27 #12 the counter's button is on screen after a tap {r}")
    await shot(pg, 'shop-counter', w); await pg.close()
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""isSignedIn = ()=>true; myCurrencies.gold = 1000; switchTab('shop'); await new Promise(r=>setTimeout(r,500));
      document.querySelector('[data-buypack="bronze"]:not([data-qty])').click(); await new Promise(r=>setTimeout(r,500));
      document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); await new Promise(r=>setTimeout(r,800));
      const c = document.querySelector('[data-poview]'); if(!c) return {err:'no card'}; c.click(); await new Promise(r=>setTimeout(r,2500));
      const ci = document.querySelector('.card-inspect.ci-split'); if(!ci) return {err:'no split'}; const s = ci.querySelector('.ci-stage').getBoundingClientRect(), d = ci.querySelector('.ci-detail').getBoundingClientRect();
      return {detail: !!ci.querySelector('.ci-detail .cd-abilities'), leftRight: d.left >= s.right - 2, below: d.top >= s.top};"""))
    ok(r.get('detail') and (r['leftRight'] if w > 760 else r['below']), f'19:27 #13 the pack viewer: the card, then its details beside it (below on a phone) {r}')
    await pg.wait_for_timeout(1500); await shot(pg, 'pack-viewer', w)
    ok(not pg._errs, f'no page errors (shop): {pg._errs[:2]}'); await pg.close()
async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader'])
        for w in (390, 1366): await run(b, url, w)
        await b.close()
    h.shutdown()
    print(f'ne e2e: {len(fails)} failure(s)'); sys.exit(1 if fails else 0)
asyncio.run(main())
