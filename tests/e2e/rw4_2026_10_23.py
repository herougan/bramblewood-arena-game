#!/usr/bin/env python3
"""Package RW4 (2026-10-23, owner notes 13:16): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/rw4_2026_10_23.py            # checks + shots in tests/out/shots/rw4-*.png
    python3 tests/e2e/rw4_2026_10_23.py --widths 1366

Covers: the swap window (#3: columns apart, no star, squarer mini cards, "Good Choice!", no stat line, card details over it on hover), the swap
rule at Map 1 and at Map 2 (#15), a waiting swap holding for the map banner (#5), the NEW! tag for one skill (#6), the first-clear box's tips and
bare item icons (#7, #14), the drops line's card back (#13), the Energy panel's count and Use button (#7) and no egg toast (#8). Build first.
Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, json
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:20, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
fails = []; shots = []

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
    f = os.path.join(OUT, f'rw4-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

OPEN_SWAP = """(async()=>{ setDialogueFlag(SWAP_TUTORIAL_FLAG, true); const defs = getCardDefs();
  const pool = Object.keys(defs).filter(id=> swapEligibleDef(defs[id]) && !(myDeckCounts[id] > 0) && !(defs[id].cost > 0) && !isUnattainable(defs[id]) && ['common','uncommon'].includes(defs[id].rarity) && Object.keys(defs[id].effects||{}).length === 0);
  let cand = null; for(const id of pool){ unlockCardForPlayer(id, 'test'); if(weakestDeckCard(id)){ cand = id; break; } }
  if(!cand) return {cand:null}; pendingDeckSwap = [{id:cand, forced:true}]; maybeOfferDeckSwap(); await new Promise(r=> setTimeout(r, 600));
  return {cand, thumbs: document.querySelectorAll('.ds2-thumb').length}; })()"""

async def run(b, url, w):
    print(f'-- width {w}')
    # 3. the swap window
    pg = await fresh(b, url, w)
    r = await pg.evaluate(OPEN_SWAP)
    ok(bool(r.get('cand')), '3. a swap window opened')
    if r.get('cand'):
        await pg.wait_for_timeout(700)
        m = await pg.evaluate("""(()=>{ const oe = document.querySelector('.ds2-col.is-out'), ne = document.querySelector('.ds2-col.is-in'), o = {right: oe.offsetLeft + oe.offsetWidth}, n = {left: ne.offsetLeft}; /* layout, not the grow animation's scale */
          const th = document.querySelector('.ds2-thumb .card-tile'); const say = document.querySelector('.ds2-say');
          return {gap: n.left - o.right, rec: document.querySelectorAll('.ds2-rec').length, radius: th ? getComputedStyle(th).borderRadius : null, say: say.textContent, spans: say.querySelectorAll('span').length}; })()""")
        ok(m['gap'] >= (48 if w < 700 else 80), f"3. the columns sit apart ({m['gap']:.0f}px between them)")
        ok(m['rec'] == 0, '3. no star on the mini cards')
        ok(m['radius'] is None or m['radius'] == '4px', f"3. the mini card's corner is small ({m['radius']})")
        ok('Good Choice!' in m['say'] and 'Better' not in m['say'], f"3. it says Good Choice! ({m['say'].strip()[:60]!r})")
        ok(m['spans'] == 0, '3. no stat line under it (nothing like 2/8 against 1/6)')
        await shot(pg, 'swap', w)
        box = await pg.evaluate("(()=>{ const r = document.querySelector('.ds2-new .card-tile').getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; })()")
        await pg.mouse.move(box[0] - 30, box[1] - 30); await pg.mouse.move(box[0], box[1]); await pg.wait_for_timeout(1400)
        pop = await pg.evaluate("""(()=>{ const p = document.getElementById('cardPop'); if(!p || p.hidden) return null; const r = p.getBoundingClientRect(), cs = getComputedStyle(p);
          return {z: +cs.zIndex, inView: r.left >= 0 && r.right <= innerWidth + 1, w: r.width, overlayZ: +getComputedStyle(document.getElementById('deckSwapOverlay')).zIndex}; })()""")
        ok(bool(pop) and pop['z'] > pop['overlayZ'] and pop['inView'], f'3. hovering the offered card opens its details over the window {pop}')
        await shot(pg, 'swap-hover', w)
    ok(not pg._errs, f'3. no page errors {pg._errs[:2]}')
    await pg.close()

    # 15. the swap rule: Map 1 keeps today's, Map 2 asks for much better
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(()=>{ const mk = (id, a, h)=> ({id, attack:a, health:h, cost:0, wait:0, effects:{}}); const weak = mk('rw4-weak', 2, 3), mid = mk('rw4-mid', 3, 2), big = mk('rw4-big', 4, 3);
      const at = n=>{ localStorage.setItem(SKILL_REVEAL_KEY, JSON.stringify({maxMap:n, keys:[], fresh:[]})); skillRevealMemo = null;
        return {on: swapMuchBetterOn(), mid: swapClearlyBetter(mid, weak), big: swapClearlyBetter(big, weak), midLegacy: swapClearlyBetter(mid, weak, {legacy:true}), s: [swapStrength(weak), swapStrength(mid), swapStrength(big)]}; };
      return {m1: at(1), m2: at(2)}; })()""")
    a, c = r['m1'], r['m2']
    ok(not a['on'] and a['mid'] and a['big'], f'15. at Map 1 a slightly better card (+14%) and a far better one both count {a}')
    ok(c['on'] and not c['mid'] and c['big'], f'15. at Map 2 only the much better one counts {c}')
    ok(c['midLegacy'], '15. a forced teaching swap keeps the old rule at Map 2')
    await pg.close()

    # 5. a swap waits for the map banner
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ setDialogueFlag(SWAP_TUTORIAL_FLAG, true); const defs = getCardDefs();
      const pool = Object.keys(defs).filter(id=> swapEligibleDef(defs[id]) && !(myDeckCounts[id] > 0) && !(defs[id].cost > 0) && !isUnattainable(defs[id]) && ['common','uncommon'].includes(defs[id].rarity) && Object.keys(defs[id].effects||{}).length === 0);
      let cand = null; for(const id of pool){ unlockCardForPlayer(id, 'test'); if(weakestDeckCard(id)){ cand = id; break; } }
      mapTitleHoldUntil = Date.now() + 1800; pendingDeckSwap = [{id:cand, forced:true}]; maybeOfferDeckSwap(); await new Promise(r=> setTimeout(r, 900));
      const early = !!document.getElementById('deckSwapOverlay'); await new Promise(r=> setTimeout(r, 1700)); return {early, late: !!document.getElementById('deckSwapOverlay')}; })()""")
    ok(not r['early'] and r['late'], f'5. the swap holds while the banner is due, then opens {r}')
    await pg.close()

    # 6. NEW! on one skill, never crepuscular / nocturnal
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(()=>{ localStorage.removeItem(SKILL_REVEAL_KEY); skillRevealMemo = null; adminModeEnabled = false; noteMapEnteredForReveal(mapIdAt(1));
      const st = skillRevealState(), defs = getCardDefs(), d = Object.values(defs).find(x=> x.effects && x.effects.diurnal && !x.isLeader && !x.hero);
      let html = ''; try{ html = fullCardHTML(d.id); }catch(e){ html = 'ERR ' + e; }
      return {fresh: st.fresh.map(x=> x.k), key: skillNewKey(), tags: (html.match(/class="sk-new"/g) || []).length, err: html.startsWith('ERR') ? html : ''}; })()""")
    ok(r['fresh'] == ['diurnal'] and r['key'] == 'diurnal', f"6. Map 1 marks Diurnal only, not Crepuscular / Nocturnal {r['fresh']}")
    ok(r['tags'] == 1 and not r['err'], f"6. exactly one NEW! tag in a card's text {r}")
    await pg.close()

    # 7 / 13 / 14. the first-clear box and the drops line
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ const mid = mapIdAt(2), f = findConquestNode(mid, '2-1'); if(!f) return {err:'no 2-1'};
      const box = document.createElement('div'); box.id = 'rw4box'; box.className = 'conquest-node-panel'; box.style.cssText = 'position:fixed; left:12px; top:420px; z-index:50; background:#243424; padding:12px 14px; width:min(340px, 90vw); color:#f0e2c0';
      box.innerHTML = cnpRewardStripHTML(mid, f.node, false, null) + cnpDropsLineHTML(mid, f.node, false); document.body.appendChild(box); wireRewardZoom(box);
      const it = box.querySelector('.cnp-rw-item'), cur = box.querySelector('.cnp-rw-cur');
      return {item: !!it, itemIsCard: !!(it && it.classList.contains('cnp-rw-card')), rank: box.querySelectorAll('.cnp-rw-item .rank-hex, .cnp-rw-token .rank-hex').length, cur: !!cur, joker: box.textContent.includes('🃏'), back: box.querySelectorAll('.cnp-drop-back').length, node: f.node.rewardTokens}; })()""")
    ok(r.get('item') and not r.get('itemIsCard') and r.get('rank') == 0, f'7/14. 2-1\'s Energy capsule is a bare icon with no rank emblem {r}')
    ok(not r.get('joker'), '13. no joker symbol in the drops line')
    if r.get('item'):
        for sel, want, what in [('.cnp-rw-item', 'Energy capsule', 'the item'), ('.cnp-rw-cur', 'Maple Leaves', 'the Maple Leaves')]:
            if not await pg.query_selector('#rw4box ' + sel): ok(False, f'7. {what} is in the box'); continue
            bb = await (await pg.query_selector('#rw4box ' + sel)).bounding_box()
            await pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); await pg.wait_for_timeout(350)
            txt = await pg.evaluate("(document.querySelector('.cnp-rw-zoom') || {}).textContent || ''")
            ok(want in txt, f'7. hovering {what} explains it ({txt[:80]!r})')
            if sel == '.cnp-rw-item': await shot(pg, 'firstclear-tip', w)
            await pg.mouse.move(2, 2); await pg.wait_for_timeout(150)
    await shot(pg, 'firstclear', w)
    await pg.close()

    # 7. the Energy panel; 8. no egg toast
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ addEnergyCapsules(2); const e0 = settleEnergy().current; openEnergyPanel(document.getElementById('energyPill') || document.body);
      const cap = document.getElementById('epCapsule'); const txt = cap ? cap.title : '';  // 2026-10-25 (PL2, owner 00:02 #7): the capsules are a 🔋×N Use button, named in its tooltip
      return {txt, btn: !!cap, btnText: cap ? cap.textContent : '', e0}; })()""")
    ok('Energy capsules: 2' in r['txt'] and r['btn'] and '×2' in r['btnText'] and r['btnText'].strip().endswith('Use'), f'7. the Energy panel shows the count and a Use button {r}')
    await shot(pg, 'energy', w)
    await pg.click('#epCapsule'); await pg.wait_for_timeout(300)
    r2 = await pg.evaluate("({caps: energyCapsules(), e: settleEnergy().current})")
    ok(r2['caps'] == 1 and r2['e'] == r['e0'] + 8, f'7. Use spends one capsule for +8 Energy ({r2})')
    r = await pg.evaluate("""(async()=>{ const host = document.querySelector('.toast-host'); const n0 = host ? host.children.length : 0; grantEgg('woodland', 'rw4'); await new Promise(r=> setTimeout(r, 300));
      return {n0, n1: host ? host.children.length : 0, text: Array.from(document.querySelectorAll('.toast')).map(t=> t.textContent).join('|')}; })()""")
    ok(r['n1'] == r['n0'] and 'egg' not in r['text'].lower(), f'8. getting an egg shows no toast {r}')
    ok(not pg._errs, f'7/8. no page errors {pg._errs[:2]}')
    await pg.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('\n'.join(shots))
    print(f'rw4: {len(fails)} failed' if fails else 'rw4: all checks passed')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); asyncio.run(main(ap.parse_args()))
