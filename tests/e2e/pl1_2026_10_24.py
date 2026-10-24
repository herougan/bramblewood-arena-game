#!/usr/bin/env python3
"""Package PL1 (2026-10-24, owner playtest P24-1..20 and 21:20 #1 #2 #4): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/pl1_2026_10_24.py            # checks + shots in tests/out/shots/pl1-*.png
    python3 tests/e2e/pl1_2026_10_24.py --widths 1366 --keep   # --keep copies the shots to docs/screens/PL1/

Covers: the faction pick's cards (P24-1), Tut2's reward cards (P24-2), the XP bar on the map after a Conquest win (P24-3), the bundle ribbon
(P24-4), the rank emblem over a cleared fight (P24-5), Map 0's end: banner, then packs, then the swap window (P24-6) and the pack count and
page of every card (P24-19), the swap's right column (P24-8), the hand preview across day and night (P24-9), the Health bar and Honeyjoe's
Attack (P24-11, P24-12), the Dungeons tab (P24-13), the leader lesson waiting for the Camp (P24-18), the deck's copy pill (P24-20), the
boon card's words (21:20 #1), lethal Poison (#2) and X after a first clear (#4). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil, re
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'PL1')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
FRESH = ("sessionStorage.setItem('bramblewood_seen_splash','1');"
         "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); claimTutorialWin('otters'); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
         " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
CLEAR = """window.clearMaps = 0; window.clearMaps = ((n, keepLast)=>{ const p = loadConquestProgress(), mains = mainConquestMaps();
  mains.slice(0, n + 1).forEach((m, i)=> m.nodes.forEach(nd=>{ if(i === n && (keepLast ? nd.key === mapRewardNodeKey(m) : true) && keepLast) return; const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); }));
  saveConquestProgress(p); return mains[n]; }); 0"""
WIN = """window.winNow = 0; window.winNow = (async()=>{ const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3500)); }); 0"""
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page(b, url, w, pre):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e) + ' @ ' + (e.stack or '')[:300])); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(pre)
    await pg.goto(url); await pg.wait_for_function("typeof myDeckCounts !== 'undefined' && typeof switchTab === 'function'", timeout=60000); await pg.wait_for_timeout(2500)
    await pg.evaluate(CLEAR); await pg.evaluate(WIN)
    return pg

async def close(pg):
    await pg._ctx.close()

async def shot(pg, name, w, el=None):
    await pg.add_style_tag(content='.toast, .toast-host{display:none !important;}')
    await pg.wait_for_timeout(200)
    f = os.path.join(OUT, f'pl1-{name}-{w}.png')
    if el:
        h = await pg.query_selector(el)
        if h: await h.screenshot(path=f, animations='allow')
        else: await pg.screenshot(path=f, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    shots.append(f); return f

async def run(b, url, w):
    print(f'-- width {w}')
    # P24-1: the faction pick (the showcase shows on hover, desktop only)
    pg = await page(b, url, w, "sessionStorage.setItem('bramblewood_seen_splash','1');")
    r = await pg.evaluate("""(async()=>{ showFactionScreen(); await new Promise(r=> setTimeout(r, 400)); const defs = getCardDefs(), out = {};
      ['otters', 'hummingbirds'].forEach(k=>{ out[k] = pl1FactionStartCards(k).map(id=> (defs[id]||{}).rarity); const p = document.querySelector(`.faction-showcase [data-fs="${k}"]`); out[k + 'Shown'] = p ? p.querySelectorAll('.pl1-fsf .card-tile').length : 0; });
      return out; })()""")
    ok(r['otters'] == ['common'] * 3 and r['hummingbirds'] == ['common'] * 3 and r['ottersShown'] == 3 and r['hummingbirdsShown'] == 3, f'P24-1 both sides start with three Commons {r}')
    if w >= 1000:
        await pg.hover('#factionOtterBtn'); await pg.wait_for_timeout(5800)
        r2 = await pg.evaluate("[...document.querySelectorAll('.faction-showcase [data-fs=\"otters\"] .pl1-fsf .card-tile')].map(t=> t.getAttribute('data-defid'))")
        r3 = await pg.evaluate("[...document.querySelectorAll('.faction-showcase [data-fs=\"hummingbirds\"] .pl1-fsf .card-tile')].map(t=> t.getAttribute('data-defid'))")
        ok(len(r2) == 3 and len(r3) == 3, f'P24-1 after a few seconds some cards have turned over to other faction cards {r2} {r3}')
        await shot(pg, 'faction-pick', w)
    await close(pg)

    # P24-2: Tut2's reward cards have no names under them
    pg = await page(b, url, w, DONE)
    r = await pg.evaluate("""(async()=>{ openDeckTopUpStep(tutorialRewards2('otters', 'peek').concat([]).slice(0, 3).length ? tutorialRewards2('otters', 'peek') : ['otter-kit','otter-kit','otter-kit'], ()=>{}); await new Promise(r=> setTimeout(r, 1400));
      return {cards: document.querySelectorAll('.tr-item').length, names: document.querySelectorAll('.tr-item .tr-name, .tr-item figcaption').length}; })()""")
    ok(r['cards'] >= 1 and r['names'] == 0, f'P24-2 the reward cards have no names under them {r}')
    await shot(pg, 'tut2-rewards', w)
    await close(pg)

    # P24-6 / P24-19 / P24-3 / #4: Map 0's last fight, X, the banner, then the packs, then the swap window; the XP on the map
    pg = await page(b, url, w, FRESH)
    r = await pg.evaluate("""(async()=>{ const m = clearMaps(0, true), last = mapRewardNodeKey(m); FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key));
      conquestSelectedMap = m.id; conquestSelectedNodeKey = last; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 2000));
      startConquestMatch(m.id, last, {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2500)); await winNow();
      return {xpBar: !!document.querySelector('.winloss-card .wl-xp'), queued: packRevealQueue.length, x: !!document.getElementById('wlQuitBtn')}; })()""")
    ok(r['x'] and not r['xpBar'], f'P24-3 the results show no XP bar for a Conquest fight {r}')
    ok(r['queued'] == 2, f'P24-6 two reward packs are waiting (Map 0\'s end) {r}')
    await shot(pg, 'results', w)
    await pg.evaluate("document.getElementById('wlQuitBtn').click()")
    order = []; seen_xp = False
    for i in range(70):
        s = await pg.evaluate("""({veil: !!document.querySelector('.map-veil'), title: !!document.querySelector('.fxg-title-stage'), xp: !!document.querySelector('.pl1-xp-float'), pack: !!(document.getElementById('packOpenOverlay') && !document.getElementById('packOpenOverlay').hidden), swap: !!document.getElementById('deckSwapOverlay')})""")
        for k in ('title', 'xp', 'pack', 'swap'):
            if s[k] and (not order or order[-1] != k): order.append(k)
        if s['xp'] and not seen_xp: seen_xp = True; await shot(pg, 'xp-on-map', w)
        if s['pack']: break
        await pg.wait_for_timeout(250)
    ok('pack' in order and 'swap' not in order and (('title' not in order) or order.index('title') < order.index('pack')), f'P24-6 the banner comes before the packs, the swap window after them {order}')
    ok(seen_xp, 'P24-3 the XP bar fills on the map after the fight')
    r = await pg.evaluate("({sel: conquestSelectedNodeKey})")
    ok(r['sel'] is None, f'#4 X after a first clear lets go of the fight (the pawn walks on) {r}')
    await pg.wait_for_timeout(600)
    r = await pg.evaluate("(document.querySelector('#packOpenOverlay .po2-pile-n') || {}).textContent || ''")
    ok('1 more pack' in r, f'P24-19 the first pack counts the faction pack queued behind it ({r!r})')
    await shot(pg, 'pack-1', w)
    # open both: tear, Skip to the summary, Next pack, tear, Skip, then the page of every card
    async def through():
        await pg.evaluate("(()=>{ const s = document.getElementById('poStrip'); if(s) s.click(); })()"); await pg.wait_for_timeout(1500)
        await pg.evaluate("(()=>{ const k = document.getElementById('poSkip'); if(k) k.click(); else { const e = new KeyboardEvent('keydown', {key:'Escape', bubbles:true}); document.dispatchEvent(e); } })()"); await pg.wait_for_timeout(900)
    await through()
    r = await pg.evaluate("({next: (document.querySelector('#poNextSet, #poNext') || {}).textContent || '', summary: !!document.querySelector('.po2-summary')})")
    ok('1 left' in r['next'], f'P24-19 the first set\'s summary moves on to the next pack and counts it ({r})')
    await shot(pg, 'pack-1-summary', w)
    await pg.evaluate("(document.querySelector('#poNextSet, #poNext')).click()"); await pg.wait_for_timeout(2600)
    await through()
    r = await pg.evaluate("({btn: (document.getElementById('poSession') || {}).textContent || ''})")
    ok('All 2 packs' in r['btn'], f'P24-19 the last pack leads to every card of both packs ({r})')
    await pg.evaluate("(()=>{ const b = document.getElementById('poSession'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("({title: (document.querySelector('.pl1-session') && document.querySelector('#packOpenOverlay .po2-count') || {}).textContent || '', cards: document.querySelectorAll('.pl1-session .po2-sum-card').length, kinds: document.querySelectorAll('.pl1-session-kinds span').length})")
    ok(r['title'].startswith('2 packs') and r['cards'] >= 3 and r['kinds'] == 2, f'P24-19 the page of every card from both packs {r}')
    await shot(pg, 'pack-session', w)
    await pg.evaluate("(()=>{ const b = document.getElementById('poDone'); if(b) b.click(); })()"); await pg.wait_for_timeout(2500)
    r = await pg.evaluate("({swap: !!document.getElementById('deckSwapOverlay')})")
    ok(r['swap'], f'P24-6 the swap window opens after the packs {r}')
    if r['swap']: await shot(pg, 'swap-after-packs', w)
    ok(not pg._errs, f'map flow: no page errors {pg._errs[:2]}')
    await close(pg)

    # P24-19: reward packs open once the Camp is there (no tap on its tile needed)
    pg = await page(b, url, w, FRESH)
    r = await pg.evaluate("""(()=>{ const u = loadUnlocks(); delete u.unlocked.deck; saveUnlocks(u); clearMaps(0, true); return {open: armouryOpen(), unlocked: featureUnlocked('deck')}; })()""")
    ok(r['open'] and not r['unlocked'], f'P24-19 with Map 0\'s Camp fights won the reward packs open, tile tapped or not {r}')
    # P24-18: the leader lesson waits for the Camp
    r = await pg.evaluate("""(async()=>{ const flags0 = loadDialogueFlags(); window.__dl = []; const o = window.playDialogue; window.playDialogue = function(k){ window.__dl.push(k); return o.apply(this, arguments); };
      pendingLeaderLesson = 'old-shell'; maybeLeaderLesson(); await new Promise(r=> setTimeout(r, 300)); const before = window.__dl.slice(), saved = localStorage.getItem('bramblewood_pending_leader_lesson_v1');
      unlockFeature('deck'); pendingLeaderLesson = saved; maybeLeaderLesson(); await new Promise(r=> setTimeout(r, 300));
      return {before, saved, after: window.__dl.slice(), left: localStorage.getItem('bramblewood_pending_leader_lesson_v1')}; })()""")
    ok(not r['before'] and r['saved'] == 'old-shell' and 'lesson_leaders' in r['after'] and r['left'] is None, f'P24-18 the leader lesson waits for the Camp, then plays {r}')
    # P24-13: the Dungeons tab
    r = await pg.evaluate("""(()=>{ saveTutorial2Done(); saveTutorialDone(); ['factionScreen','tutorialDeckPickerScreen','splashScreen'].forEach(id=>{ const e = document.getElementById(id); if(e) e.hidden = true; }); adminModeEnabled = false; devModeEnabled = false; const a = dungeonsTabOpen(); clearMaps(3, false); const b2 = dungeonsTabOpen(); return {early: a, afterMap3: b2}; })()""")
    ok(r['early'] is False and r['afterMap3'] is True, f'P24-13 the Dungeons tab waits for Map 3 {r}')
    await close(pg)

    # P24-4: a set on the shop counter wears a ribbon, a single pack no band
    pg = await page(b, url, w, DONE)
    r = await pg.evaluate("""(async()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); clearMaps(2, false); switchTab('shop'); await new Promise(r=> setTimeout(r, 800));
      const one = document.querySelector('.shelf-item .booster .booster-band'), shown = one ? getComputedStyle(one).display : 'none';
      const q = [...document.querySelectorAll('[data-pq]')].find(b=> +b.dataset.pq > 1); if(q) q.click(); else { const c0 = document.getElementById('shopCounter'), pk = getShopPacks().find(packOnSale) || getShopPacks()[0]; if(c0 && pk) c0.innerHTML = `<div class="counter-goods">${shelfGoodsHTML(pk, 5)}</div>`; } await new Promise(r=> setTimeout(r, 400));
      const rib = document.querySelector('#shopCounter .pl1-ribbon'); if(rib) rib.scrollIntoView({block:'center'});
      return {bandOnOne: shown, ribbon: rib ? rib.textContent.trim() : null}; })()""")
    ok(r['bandOnOne'] == 'none', f'P24-4 a single pack has no band {r}')
    ok(r['ribbon'] is not None and r['ribbon'].startswith('×'), f'P24-4 a set on the counter is tied with a ribbon showing the count {r}')
    await shot(pg, 'shop-ribbon', w, '#shopCounter' if r['ribbon'] else None)
    # P24-20: the deck's copy pill
    r = await pg.evaluate("""(async()=>{ deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = null; switchTab('deck'); await new Promise(r=> setTimeout(r, 1400));
      const st = document.querySelector('.pool-stack .ps-count'); if(!st) return null; const card = st.closest('.pool-stack'), hp = card.querySelector('.stats .hp'); const a = st.getBoundingClientRect(), h = hp ? hp.getBoundingClientRect() : null, c = card.getBoundingClientRect();
      st.scrollIntoView({block:'center'}); return {fs: parseFloat(getComputedStyle(st).fontSize), overlapHp: h ? Math.max(0, Math.min(a.right, h.right) - Math.max(a.left, h.left)) * Math.max(0, Math.min(a.bottom, h.bottom) - Math.max(a.top, h.top)) : null, hpArea: h ? h.width * h.height : null, outRight: a.right - c.right}; })()""")
    if r:
        ok(r['fs'] <= 13 and r['outRight'] > 0, f'P24-20 the copy pill is small and sits out in the corner {r}')
        ok(r['overlapHp'] is not None and r['overlapHp'] < 0.25 * r['hpArea'], f'P24-20 it covers at most a quarter of the Health plate {r}')
        await shot(pg, 'deck-pill', w)
    else: ok(False, 'P24-20 a deck card with a copy pill to measure')
    await close(pg)

    # A fight: P24-9 hand preview across day / night, P24-11 the Health bar, P24-12 Honeyjoe, #2 lethal Poison, #1 the boon card, P24-8 swap column
    pg = await page(b, url, w, DONE)
    r = await pg.evaluate("""(async()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); clearMaps(2, false);
      conquestSelectedMap = 'mf'; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 1500));
      startConquestMatch('mf', '1-1', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 3000)); try{ hideCoachTip(); }catch(e){}
      const m = matchState, so = m.sideOf || (id=> id===1?'A':'B'), me = m.players[1], uid = 99901; me.hand.push({uid, defId:'eagle-sharpshooter'}); renderHand();
      const read = ()=>{ const el = document.querySelector(`#handStrip [data-handuid="${uid}"] .stats .atk`); return {phase: m.engine.getPhase(), atk: el ? el.textContent.trim() : null}; };
      const out = [];
      for(let i = 0; i < 4; i++){ m.round++; m.engine.roundStart(m.players, m.round, so, m.stats, []); pushLog({type:'phase', phase: m.engine.getPhase(), round: m.round}); renderVfxForEvent({type:'phase', phase: m.engine.getPhase(), round: m.round}); await new Promise(r=> setTimeout(r, 60)); out.push(read()); }
      return out; })()""")
    days = [x for x in r if x['phase'] == 'day']; nights = [x for x in r if x['phase'] == 'night']
    ok(days and nights and all(x['atk'] and x['atk'].endswith('3') for x in days) and all(x['atk'] and x['atk'].endswith('2') for x in nights), f'P24-9 a Diurnal card in hand shows +1 by day, none at night {r}')
    r = await pg.evaluate("""(async()=>{ const m = matchState, so = m.sideOf || (id=> id===1?'A':'B');
      m.engine.debugSpawnCard(m.players, so, 1, 'voidfeather-scout', 'left', m.stats, []); m.engine.debugSpawnCard(m.players, so, 1, 'honeyjoe-brewer', 'right', m.stats, []);
      const all = ()=> [...m.players[1].row.left, ...m.players[1].row.center, ...m.players[1].row.right].filter(c=> c && !c.gap);
      const v = all().find(c=> c.defId === 'voidfeather-scout'); v.maxHp = 6; v.hp = 4; v.phaseHp = 1;
      const hj = all().find(c=> c.defId === 'honeyjoe-brewer'); m.engine.roundStart(m.players, m.round + 1, so, m.stats, []); m.round++;
      const me = m.players[1], hu = 99902; me.hand.push({uid: hu, defId: 'honeyjoe-brewer'}); const pv = m.engine.previewPlayStats(m.players, 1, hu); me.hand = me.hand.filter(x=> x.uid !== hu);
      const eng = Math.max(0, (pv ? pv.atk : 0) - (hj.atk||0)); if(!hj.kinBonus) hj.kinBonus = eng; // the engine's own swing for it (its Kinship counts itself), as its round sync sets it
      renderBoard(); renderHand(); await new Promise(r=> setTimeout(r, 500));
      const cardEl = id=> document.querySelector(`#rowMine [data-defid="${id}"]`);
      const vEl = cardEl('voidfeather-scout'), bar = vEl && vEl.querySelector('.eq2-hpbar'), atk = vEl && vEl.querySelector('.stats .atk');
      const br = bar && bar.getBoundingClientRect(), ar = atk && atk.getBoundingClientRect();
      const hEl = cardEl('honeyjoe-brewer'), hAtk = hEl && hEl.querySelector('.stats .atk');
      return {bar: !!bar, gap: br && ar ? ar.top - br.bottom : null, kin: eng, hjShown: hAtk ? hAtk.textContent.trim() : null, hjAtk: hj.atk}; })()""")
    ok(r['bar'] and r['gap'] is not None and r['gap'] >= 0, f'P24-11 the Health bar sits above the Attack plate, not over it {r}')
    ok(r['kin'] >= 1 and r['hjShown'] and r['hjShown'].endswith(str(r['hjAtk'] + r['kin'])), f'P24-12 Honeyjoe\'s plate shows its Kinship Attack {r}')
    await shot(pg, 'board-bar-honeyjoe', w, '#rowMine')
    r = await pg.evaluate("""(async()=>{ const m = matchState; const all = [...m.players[1].row.left, ...m.players[1].row.center, ...m.players[1].row.right].filter(c=> c && !c.gap);
      const v = all.find(c=> c.defId === 'voidfeather-scout'), h = all.find(c=> c.defId === 'honeyjoe-brewer'); v.poison = 6; h.poison = 2; renderBoard(); await new Promise(r=> setTimeout(r, 300));
      try{ updateCardStatusDisplay(v.uid); updateCardStatusDisplay(h.uid); }catch(e){} await new Promise(r=> setTimeout(r, 900));
      const ve = document.querySelector('#rowMine [data-defid="voidfeather-scout"]'), he = document.querySelector('#rowMine [data-defid="honeyjoe-brewer"]');
      return {vLethal: ve && ve.classList.contains('pl1-lethal'), hLethal: he && he.classList.contains('pl1-lethal'), colour: ve ? getComputedStyle(ve.querySelector('.stats .hp')).color : null}; })()""")
    ok(r['vLethal'] and not r['hLethal'] and r['colour'] and '140, 255, 82' in r['colour'], f'#2 Poison >= Health turns the Health poison green (and only then) {r}')
    await shot(pg, 'lethal-poison', w, '#rowMine')
    ok(not pg._errs, f'fight: no page errors {pg._errs[:2]}')
    await close(pg)

    # #1: the boon card (Map 5's challenge fight with Venom Glands or any boon)
    pg = await page(b, url, w, DONE)
    r = await pg.evaluate("""(async()=>{ let hit = null; for(const m of mainConquestMaps()){ const n = m.nodes.find(n=> n.rules && n.rules.boon); if(n){ hit = {map:m.id, key:n.key, boon:n.rules.boon, idx: mainConquestMaps().indexOf(m)}; break; } } if(!hit) return null;
      clearMaps(hit.idx, false); FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); conquestSelectedMap = hit.map; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 1200));
      startConquestMatch(hit.map, hit.key, {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ hideCoachTip(); }catch(e){}
      const c = document.querySelector('#fieldCondCard .env-card.is-selfish'); if(!c) return {hit, card:false};
      return {hit, card:true, line: c.querySelector('.env-line').textContent.trim(), label: c.getAttribute('aria-label') || '', theme: TX('ui.pl1-boon-theme-' + hit.boon)}; })()""")
    if r and r.get('card'):
        ok(re.match(r'^\d+/\d+ ', r['line']) and r['line'].endswith(r['theme']), f'#1 the boon card says "N/M {r["theme"]}" ({r["line"]})')
        ok(('Theirs: half their deck ' + r['theme']) in r['label'] and 'Theirs only' not in r['label'] and 'share the theme' not in r['label'], f'#1 its words: the effect and "Theirs: half their deck {r["theme"]}" ({r["label"][:120]})')
        await pg.evaluate("(()=>{ const c = document.querySelector('#fieldCondCard .env-card.is-selfish'); if(c){ c.dispatchEvent(new MouseEvent('mouseenter', {bubbles:true})); c.focus(); } })()"); await pg.wait_for_timeout(700)
        await shot(pg, 'boon-card', w)
    else: ok(False, f'#1 a challenge fight with a boon card to read {r}')
    await close(pg)

    # P24-8: the swap's right column leaves out a card a swap just took out, and basic cards
    pg = await page(b, url, w, DONE)
    r = await pg.evaluate("""(()=>{ const defs = getCardDefs(); const basic = Object.keys(defs).find(id=> defs[id].basic && !defs[id].token); const strong = Object.keys(defs).find(id=> defs[id].rarity === 'uncommon' && (defs[id].attack||0) >= 3 && !defs[id].basic);
      pl1NoteSwappedOut(strong); return {basic, strong, basicOut: pl1SwapNeverOffer(basic, defs), strongOut: pl1SwapNeverOffer(strong, defs)}; })()""")
    ok(r['basicOut'] and r['strongOut'], f'P24-8 a basic card and a card a swap took out are never offered back {r}')
    await close(pg)

    # P24-5: the rank emblem over a cleared fight spirals toward the bottom right
    pg = await page(b, url, w, DONE)
    r = await pg.evaluate("""(async()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); clearMaps(1, false); conquestSelectedMap = 'mf'; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 2500));
      const n = document.querySelector('#conquestCanvas .map-node'); if(!n || !window.FX || !FX.E || !FX.E.nodeRankEmblem) return null; const r0 = n.getBoundingClientRect();
      const p = FX.E.nodeRankEmblem(n, 'S'); await new Promise(r=> setTimeout(r, 250)); const e1 = document.querySelector('.fxe-pl1-rank .rank-hex.rank-S'); const a = e1 && e1.getBoundingClientRect();
      await new Promise(r=> setTimeout(r, 650)); const b = e1 && e1.isConnected ? e1.getBoundingClientRect() : null; await p;
      return {node: [r0.left, r0.top], start: a ? [a.left, a.top] : null, mid: b ? [b.left, b.top] : null, gone: !document.querySelector('.fxe-pl1-rank')}; })()""")
    ok(r and r['start'] and r['gone'], f'P24-5 the normal rank emblem fades in on the fight and goes {r}')
    await close(pg)

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true'); a = ap.parse_args()
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots: shutil.copy(f, os.path.join(KEEP, os.path.basename(f)))
    print(f"pl1 e2e: {len(fails)} failed; shots: {', '.join(os.path.relpath(f, ROOT) for f in shots)}")
    sys.exit(1 if fails else 0)

asyncio.run(main())
