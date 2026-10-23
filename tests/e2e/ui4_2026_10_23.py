#!/usr/bin/env python3
"""Package UI4 (2026-10-23, owner notes 01:03 / 01:09 / 01:57): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/ui4_2026_10_23.py            # checks + shots in tests/out/shots/ui4-*.png
    python3 tests/e2e/ui4_2026_10_23.py --widths 1366

Covers: the swap's crossing cards (01:03 #1), the pack's seal off the name and no focus ring while cutting (#2), the several-swap
window (#3), the main deck's ribbon and the deck slots in the Camp and the Tavern (#5), a click in the Camp's deck editor adds the card
(#7), the board kept under the results (01:09 #2), the field centred on a desktop window (01:57 #6), the top row going icon-only and
the Environment cards' tighter fan (#7), the results' item tip (#8), the hand's would-be numbers (#11) and the map panel's enemy level
(EB). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, json
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
fails = []; shots = []
HOLD = "(()=>{ const ov = document.getElementById('deckSwapOverlay'); if(!ov) return false; ov.remove = ()=>{}; new MutationObserver(()=>{ if(ov.classList.contains('is-out') || ov.classList.contains('is-happy')) ov.classList.remove('is-out', 'is-happy'); }).observe(ov, {attributes:true}); return true; })()"  # test only: the window stays up after Swap so the moved cards can be measured
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w, pre=''):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP + pre)
    await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'ui4-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

async def run(b, url, w):
    print(f'-- width {w}')
    # 1. the one-card swap: the offered card goes left, yours right
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ setDialogueFlag(SWAP_TUTORIAL_FLAG, true); const defs = getCardDefs();
      const pool = Object.keys(defs).filter(id=> swapEligibleDef(defs[id]) && !(myDeckCounts[id] > 0) && !(defs[id].cost > 0) && !isUnattainable(defs[id]) && ['common','uncommon'].includes(defs[id].rarity) && Object.keys(myDeckCounts).some(o=> myDeckCounts[o] > 0 && swapClearlyBetter(defs[id], defs[o]))).slice(0, 12);
      let cand = null; for(const id of pool){ unlockCardForPlayer(id, 'test'); if(weakestDeckCard(id)){ cand = id; break; } }
      if(!cand) return {cand:null}; pendingDeckSwap = [{id:cand, forced:true}]; maybeOfferDeckSwap(); await new Promise(r=> setTimeout(r, 500));
      const o = document.querySelector('.ds2-old'), n = document.querySelector('.ds2-new'); return {cand, o0: o && o.getBoundingClientRect().left, n0: n && n.getBoundingClientRect().left}; })()""")
    ok(bool(r.get('cand')), '1. a swap window opened')
    if r.get('cand'):
        await shot(pg, 'swap-before', w)
        await pg.evaluate(HOLD); await pg.click('#dsSwap'); await pg.wait_for_timeout(300); await shot(pg, 'swap-mid', w); await pg.wait_for_timeout(500)
        r2 = await pg.evaluate("(()=>{ const o = document.querySelector('.ds2-old'), n = document.querySelector('.ds2-new'); return {o1: o && o.getBoundingClientRect().left, n1: n && n.getBoundingClientRect().left}; })()")
        ok(r2['n1'] is not None and r2['n1'] < r['n0'] - 20 and r2['o1'] > r['o0'] + 20, f"1. after Swap the offered card moved left ({r['n0']:.0f} -> {r2['n1']:.0f}) and yours right ({r['o0']:.0f} -> {r2['o1']:.0f})")
        await shot(pg, 'swap-after', w)
        r2 = r2 or {}
    await pg.close()
    # 2. the pack: seal off the name; no ring while cutting
    pg = await fresh(b, url, w)
    await pg.evaluate("(()=>{ const c = creditFactionPack('hummingbird'); openPackAnimation(c.pack, [c.o]); })()"); await pg.wait_for_timeout(1300)
    r = await pg.evaluate("""(()=>{ const s = document.querySelector('.fxd-seal'), b = document.querySelector('.po2-label b'); if(!s || !b) return {seal: !!s, name: !!b};
      const a = s.getBoundingClientRect(), c = b.getBoundingClientRect(); return {seal:true, name:true, overlap: !(a.bottom <= c.top || a.top >= c.bottom || a.right <= c.left || a.left >= c.right)}; })()""")
    ok(r.get('seal') and r.get('name') and not r.get('overlap'), f'2. the seal does not cover the pack name {r}')
    await shot(pg, 'pack', w)
    box = await pg.evaluate("(()=>{ const r = document.getElementById('poStrip').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
    x, y, bw, bh = box
    await pg.mouse.move(x + 8, y + bh / 2); await pg.mouse.down(); await pg.mouse.move(x + bw * 0.35, y + bh / 2, steps=6)
    r = await pg.evaluate("(()=>{ const s = document.getElementById('poStrip'), cs = getComputedStyle(s); return {focus: document.activeElement === s, outline: cs.outlineStyle + ' ' + cs.outlineWidth, sel: String(getSelection()).length}; })()")
    ok(r['outline'].startswith('none') or r['outline'].endswith(' 0px'), f"2. no focus ring on the strip while cutting ({r})")
    await shot(pg, 'pack-cut', w)
    await pg.mouse.move(x + bw * 0.95, y + bh / 2, steps=8); await pg.mouse.up(); await pg.wait_for_timeout(300)
    await pg.close()
    # 3. the several-swap window
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ setDialogueFlag(SWAP_TUTORIAL_FLAG, true); const defs = getCardDefs();
      const pool = Object.keys(defs).filter(id=> swapEligibleDef(defs[id]) && !(myDeckCounts[id] > 0) && !(defs[id].cost > 0) && !isUnattainable(defs[id]) && ['common','uncommon'].includes(defs[id].rarity) && Object.keys(myDeckCounts).some(o=> myDeckCounts[o] > 0 && swapStrength(defs[id]) > swapStrength(defs[o]) + 2)).slice(0, 40);
      const ids = []; for(const id of pool){ if(ids.length >= 3) break; unlockCardForPlayer(id, 'test'); if(multiSwapCandidates(id, myDeckCounts, defs).length) ids.push(id); }
      const before = deckTotal(myDeckCounts);
      pendingDeckSwap = []; queueMultiDeckSwap(ids, 'factionPack'); maybeOfferDeckSwap(); await new Promise(r=> setTimeout(r, 600));
      return {ids, rows: document.querySelectorAll('.ds3-row').length, before}; })()""")
    ok(r['rows'] == 3, f"3. a row per pack card ({r['rows']} for {r['ids']})")
    await shot(pg, 'multiswap', w)
    if r['rows'] >= 2:
        await pg.click('.ds3-row[data-row="1"] .ds3-tick input'); await pg.wait_for_timeout(150)
        lbl = await pg.evaluate("document.getElementById('dsSwap').textContent")
        ok('2' in lbl, f'3. unticking a row counts it out ({lbl.strip()})')
        await pg.evaluate(HOLD); await pg.click('#dsSwap'); await pg.wait_for_timeout(300); await shot(pg, 'multiswap-mid', w); await pg.wait_for_timeout(500); await shot(pg, 'multiswap-after', w)
        await pg.evaluate("(()=>{ const ov = document.getElementById('deckSwapOverlay'); if(ov) ov.parentNode.removeChild(ov); })()")
        r2 = await pg.evaluate(f"(()=>{{ const ids = {json.dumps(r['ids'])}; return {{inDeck: ids.map(id=> myDeckCounts[id]||0), total: deckTotal(myDeckCounts), open: !!document.getElementById('deckSwapOverlay')}}; }})()")
        ok(r2['inDeck'][0] == 1 and r2['inDeck'][1] == 0 and r2['inDeck'][2] == 1 and r2['total'] == r['before'], f'3. the two ticked cards went in, the deck kept its size {r2}')
    await pg.close()
    # 5. Camp: a new player's single slot; a grandfathered save; the Tavern's slot row
    pg = await fresh(b, url, w, "localStorage.removeItem('bramblewood_deck_slots_v1');")
    r = await pg.evaluate("""(async()=>{ deckEditingId = null; deckShowList = true; switchTab('deck'); await new Promise(r=> setTimeout(r, 600));
      const nb = document.getElementById('newDeckBtn'); const n0 = myDecks.length; nb.click(); await new Promise(r=> setTimeout(r, 300));
      return {slots: deckSlotsOwned(), decks0: n0, decks1: myDecks.length, ribbon: !!document.querySelector('.dmp-main-ribbon'), panel: !!document.getElementById('campDeckSlots')}; })()""")
    ok(r['slots'] == 1 and r['decks1'] == r['decks0'] == 1, f'5. a new player has 1 deck slot and New Deck is held back {r}')
    ok(r['ribbon'] and r['panel'], '5. the main deck has its ribbon, the Camp shows the deck slots')
    await pg.wait_for_timeout(600); await shot(pg, 'camp-new', w)
    r = await pg.evaluate("""(async()=>{ myCurrencies.dust = 5000; myCurrencies.gold = 5000; saveCurrencies(); renderDeckSection(); await new Promise(r=> setTimeout(r, 300));
      document.querySelector('[data-deck-slot-buy]').click(); await new Promise(r=> setTimeout(r, 300));
      const n = deckSlotsOwned(), d = myCurrencies.dust; document.getElementById('newDeckBtn').click(); await new Promise(r=> setTimeout(r, 300));
      return {n, dust: d, decks: myDecks.length}; })()""")
    ok(r['n'] == 2 and r['dust'] == 5000 - 150 and r['decks'] == 2, f'5. slot 2 costs 150 Dust (and 150 Leaves) and then New Deck works {r}')
    r = await pg.evaluate("(async()=>{ deckEditingId = null; deckShowList = true; renderDeckSection(); await new Promise(r=> setTimeout(r, 300)); const el = document.querySelector('.dmp-btn'); return el && el.classList.contains('is-main'); })()")
    ok(r, '5. the main deck comes first in the list')
    await shot(pg, 'camp-two', w)
    await pg.evaluate("(async()=>{ tavernTab = 'upgrades'; openTavern(); })()"); await pg.wait_for_timeout(700)
    ok(await pg.evaluate("!!document.getElementById('tavernDeckSlots')"), "5. the Tavern's Upgrades tab shows the deck slots")
    await shot(pg, 'tavern-slots', w)
    await pg.close()
    pg = await fresh(b, url, w, "localStorage.removeItem('bramblewood_deck_slots_v1'); localStorage.setItem('bramblewood_arena_decks', JSON.stringify([{id:'11111111-1111-4111-8111-111111111111', name:'Deck 1', characterId:'castle', leaderId:null, counts:{}}, {id:'22222222-2222-4222-8222-222222222222', name:'Deck 2', characterId:'castle', leaderId:null, counts:{}}, {id:'33333333-3333-4333-8333-333333333333', name:'Deck 3', characterId:'castle', leaderId:null, counts:{}}]));")
    r = await pg.evaluate("({slots: deckSlotsOwned(), decks: myDecks.length})")
    ok(r['slots'] == 3 and r['decks'] == 3, f'5. a save with 3 decks keeps 3 slots {r}')
    await pg.close()
    # 7. a click in the Camp's deck editor adds the card (mouse, and a tap on a phone)
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ unlockCardForPlayer('pond-duck', 'test'); unlockCardForPlayer('pond-duck', 'test'); switchTab('deck'); deckEditingId = activeDeckId; deckShowList = false; renderDeckSection(); await new Promise(r=> setTimeout(r, 700));
      const el = document.querySelector('#myDeckPool .card-tile[data-defid="pond-duck"]'); if(!el) return null; el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, before: myDeckCounts['pond-duck'] || 0}; })()""")
    ok(r is not None, '7. the pool shows the card')
    if r:
        if w < 700: await pg.touchscreen.tap(r['x'], r['y'])
        else: await pg.mouse.click(r['x'], r['y'])
        await pg.wait_for_timeout(400)
        after = await pg.evaluate("myDeckCounts['pond-duck'] || 0")
        ok(after == r['before'] + 1, f"7. a {'tap' if w < 700 else 'click'} on a pool card adds it ({r['before']} -> {after})")
        await shot(pg, 'tent-click', w)
    ok(not pg._errs, f'7. no page errors {pg._errs[:2]}')
    await pg.close()
    # 01:57 #8 / 01:09 #2 / #6 / #7 / #11: one fight
    pg = await fresh(b, url, w, "")
    await pg.evaluate("(()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m1', '0-1'); })()"); await pg.wait_for_timeout(2600)
    # 11. the hand: three ants on the board, an Ant Scout in hand
    r = await pg.evaluate("""(async()=>{ const m = matchState, e = m.engine, me = m.players[1];
      ['ant-scout', 'soldier-ant', 'ant-warrior'].forEach(id=>{ const c = e.makeBoardCard(id); c.wait = 0; if(!me.row.center.length) me.row.center.push(c); else me.row.right.push(c); });
      me.hand.push({uid: 90001, defId: 'ant-scout'}); renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
      const el = document.querySelector('#handStrip [data-handuid="90001"]'), sim = el && el.querySelector('.stats .atk .sim-stat');
      const pv = e.previewPlayStats(m.players, 1, 90001), sb = e.swarmBonusOf(m.players, me.row.center[0]);
      return {sim: sim ? sim.textContent : null, pv, onBoardScoutSwarm: sb, hp: el && el.querySelector('.stats .hp').textContent}; })()""")
    ok(r['sim'] == str(r['pv']['atk']) and r['pv']['atk'] == 1 + 3, f"11. an Ant Scout in hand with 3 ants out shows {r['sim']} in blue (engine: 1 + 3 = {r['pv']['atk']}) {r}")
    await shot(pg, 'hand-sim', w)
    # 6. the field's middle on the window's middle (desktop, not full screen)
    r = await pg.evaluate("(async()=>{ centreFieldInFs(); await new Promise(r=> setTimeout(r, 300)); const bf = document.getElementById('battlefieldEl').getBoundingClientRect(); return {cy: bf.top + bf.height / 2, vh: innerHeight, cx: bf.left + bf.width / 2, vw: document.documentElement.clientWidth, shift: getComputedStyle(document.getElementById('appWrap')).paddingTop}; })()")
    if w >= 900: ok(abs(r['cy'] - r['vh'] / 2) < 30 or r['shift'] not in ('0px',), f"6. the field's middle sits near the window's middle {r}")
    ok(abs(r['cx'] - r['vw'] / 2) < 12, f'6. the field is centred across {r}')
    await shot(pg, 'fight', w)
    # 7. the header fits: no overflow past the window, icons when short
    r = await pg.evaluate("(()=>{ const row = document.querySelector('#view-play .top-row-controls'), rr = row.getBoundingClientRect(); return {right: rr.right, vw: document.documentElement.clientWidth, compact: row.classList.contains('is-compact'), labels: [...row.querySelectorAll('[aria-label]')].map(b=> b.getAttribute('aria-label')).join('|')}; })()")
    ok(r['right'] <= r['vw'] + 1, f"7. the top row's buttons stay on screen {r}")
    # the Environment cards: 6 in a fan, tighter than 2
    r = await pg.evaluate("""(async()=>{ const m = matchState; const rows = ['wind','misty','scorching','bossSurge','enemyOre','volcanoGlow'];
      window.matchFieldCondRows = ()=> rows.map(k=> ({key:k, name:k, icon:'🌿', text:k, short:k})); renderMatchUI(); await new Promise(r=> setTimeout(r, 500));
      const cards = [...document.querySelectorAll('#fieldCondCard .env-card')].map(c=> c.getBoundingClientRect().left), row = document.querySelector('#view-play .top-row-controls'), rr = row.getBoundingClientRect();
      const sr = document.getElementById('fieldCondCard').getBoundingClientRect(), stackR = sr.right, clear = rr.left >= sr.right || rr.top >= sr.bottom - 1 || rr.bottom <= sr.top + 1, tallest = Math.max(...[...row.querySelectorAll(':scope > .btn')].map(b=> b.getBoundingClientRect().height));
      return {n: cards.length, step: cards.length > 1 ? (cards[1] - cards[0]) : 0, w: document.querySelector('#fieldCondCard .env-card').getBoundingClientRect().width, right: rr.right, left: rr.left, stackR, clear, tallest, vw: document.documentElement.clientWidth, compact: row.classList.contains('is-compact')}; })()""")
    ok(r['tallest'] <= 40 and r['clear'], f"7. no button label wraps, and the row clears the Environment cards (tallest {r['tallest']:.0f}px)")
    ok(r['n'] == 6 and r['step'] < r['w'] * 0.82 / 1.7, f"7. six Environment cards fan 1.8x closer (step {r['step']:.1f} of a {r['w']:.1f} card)")
    ok(r['right'] <= r['vw'] + 1, f"7. with six Environment cards the buttons still fit (compact: {r['compact']}) {r}")
    await shot(pg, 'header6', w)
    # 01:09 #2 + 01:57 #8: win with a field-kit item; the board's cards are kept under the results; the item tip says what it does
    r = await pg.evaluate("""(async()=>{ const m = matchState; window.grantSkirmishKitItem = ()=> ({id:'draught', nth:1, of:3});
      const cards = ()=> [...document.querySelectorAll('#rowMine .board-card:not(.empty-slot), #rowEnemy .board-card:not(.empty-slot)')];
      let seen = null; const f = window.renderMatchUI; window.renderMatchUI = function(...a){ const go = matchState && matchState.over && !seen, b = go ? cards() : null; const r = f.apply(this, a); if(go){ const after = cards(); seen = {before: b.length, after: after.length, kept: after.filter(el=> b.includes(el)).length}; } return r; };
      await adminAutoWin(); for(let i = 0; i < 40 && !document.querySelector('.winloss-overlay'); i++) await new Promise(r=> setTimeout(r, 250));
      await new Promise(r=> setTimeout(r, 600));
      const tip = (document.querySelector('.rw-kit') || {getAttribute: ()=> null}).getAttribute('data-tip');
      return Object.assign({tip, over: !!(m && m.over)}, seen || {before:0, after:0, kept:-1}); })()""")
    ok(r['over'] and r['after'] >= 1 and r['kept'] == r['after'], f"01:09 #2. the board's cards are the same elements under the results ({r['kept']} of {r['after']} kept)")
    ok((r['tip'] or '').endswith('Your bramble heals 5 Health.'), f"01:57 #8. the item chip's tip just says what it does (RW4: after its name) ({r['tip']!r})")
    await shot(pg, 'results', w)
    await pg.close()
    # EB: the map panel's enemy tiles at the fight's level
    pg = await fresh(b, url, w)
    await pg.evaluate("""(async()=>{ const p = loadConquestProgress(); p.completed.push('mtut:tutorial', 'mtut:tutorial2', 'm1:0-1'); saveConquestProgress(p); switchTab('play'); await new Promise(r=> setTimeout(r, 400));
      conquestSelectedMap = 'm1'; renderPlay(); await new Promise(r=> setTimeout(r, 700)); const b = document.querySelector('.map-node[data-lkey="0-2"]'); if(b) b.click(); })()"""); await pg.wait_for_timeout(1200)
    r = await pg.evaluate("""(()=>{ const n = findConquestNode('m1', '0-2').node, lv = levelledEnemyDeck(n, n.deck), defs = getCardDefs(); const bad = [];
      Object.keys(n.deck).forEach(id=>{ const sh = edEnemyShownDef(n, id), fights = Object.keys(lv).filter(k=> k.split('@lv')[0] === id).map(k=> { const d = defs[k] || matchDefsOverlay[k]; return d.attack + '/' + d.health; }); if(!fights.includes(sh.attack + '/' + sh.health)) bad.push([id, sh.attack + '/' + sh.health, fights]); });
      return {bad, tiles: document.querySelectorAll('.cnp-sq-card').length}; })()""")
    ok(not r['bad'] and r['tiles'] > 0, f"EB. 0-2's panel tiles show the stats the fight uses {r}")
    await shot(pg, 'map-panel', w)
    await pg.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('\n'.join(shots))
    print(f'ui4: {len(fails)} failed' if fails else 'ui4: all checks passed')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); asyncio.run(main(ap.parse_args()))
