#!/usr/bin/env python3
"""Browser check for package UI23 (2026-11-06), at 1366 and 390: the card editor (Codex and battlefield: one layout, sections in rows, the
budget beside the stats, no sideways overflow, a fight copy edits its own card), the board (blue heart = Health + Shield, grey Undead heart,
the Delivery pip), the fight's settings (Effects there, still open after a change), a dark field (the overlay by field effect), the results
(packs on the left as a "(N)" stack, NEW! + GET!, the achievement toast at the top) and the VS showcase. Shots in docs/screens/ui23/.
    python3 assemble_arena.py && mv bramblewood-arena.html index.html && python3 tests/e2e/ui23_2026_11_06.py"""
import asyncio, os, json, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui23'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1');"
        "localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; window.playDialogue = async ()=>({});")
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)

EDITOR = """(async()=>{ adminModeEnabled = true; openCardEditor(%s); await new Promise(r=> setTimeout(r, 700));
  const m = document.querySelector('#editorOverlay .modal'), main = document.querySelector('.ce-main'), budget = document.getElementById('ceBudget');
  const rows = [...main.children].filter(x=> x.classList.contains('field-row')).length, adv = [...document.querySelectorAll('#editorOverlay .section-divider.subsection')];
  const widths = adv.map(x=> Math.round(x.getBoundingClientRect().width)), mw = Math.round(main.getBoundingClientRect().width);
  return {id: editingCard && editingCard.id, rows, advFull: widths.every(w=> w >= mw - 40), budgetInStats: !!(budget && budget.parentElement && budget.parentElement.querySelector('#fAtk')),
    overflow: m.scrollWidth - m.clientWidth, save: (document.getElementById('btnSave') || {}).textContent}; })()"""

async def run(b, w):
    print(f'-- width {w}')
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 500 else 900}, has_touch=(w < 500))
    await ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT); await pg.goto('file://' + os.path.join(ROOT, 'index.html'), timeout=90000); await pg.wait_for_timeout(2500)
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, f'{n}-{w}.png'))
    # 4 the Codex editor
    r = await pg.evaluate(EDITOR % "'razorbill'")
    ok(r['id'] == 'razorbill' and r['rows'] >= 3 and r['advFull'] and r['budgetInStats'] and r['overflow'] <= 1, f'4 codex editor: sections in rows, budget in Stats, no overflow {json.dumps(r)}')
    await shot('editor-codex'); await pg.evaluate("closeCardEditor()")
    # the fight: VS showcase, board, settings, dark field, battlefield editor
    await pg.evaluate("(()=>{ " + OWN + " adminModeEnabled = true; switchTab('play'); startConquestMatch('mf', '1-5'); })()"); await pg.wait_for_timeout(1600)
    v = await pg.evaluate("(()=>({figs: document.querySelectorAll('.ui16-vs-fig').length, caps: document.querySelectorAll('.ui16-vs-fig figcaption').length}))()")
    ok(v['figs'] >= 2 and v['caps'] == 0, f'35 the showcase has its portraits and no captions {json.dumps(v)}'); await shot('vs-showcase')
    r = await pg.evaluate("""(async()=>{ document.querySelector('.vs-start') && document.querySelector('.vs-start').click(); await new Promise(r=> setTimeout(r, 900));
      const m = matchState, e = m.engine, uids = {}; [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
      const put = (pid, id, slot, hp, sh)=>{ const c = e.makeBoardCard(id); c.wait = 2; c.hp = c.maxHp = hp; if(sh) c.shield = sh; c.slot = slot; const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[id] = c.uid; };
      put(1, 'conch-crawler', 0, 1, 4); put(1, 'bog-revenant', 1, 5); put(1, 'beaver-lumberjack', -1, 4); put(2, 'soldier-ant', 0, 6);
      m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900)); const el = id=> document.querySelector('.board-card[data-uid="' + uids[id] + '"]');
      return {heart: el('conch-crawler').querySelector('.stats .hp').textContent, blue: el('conch-crawler').classList.contains('has-shield'), grey: !!el('bog-revenant').querySelector('.stats .hp.is-unhealth'),
        delivery: !!el('beaver-lumberjack').querySelector('[data-sk^="delivery"], .sk-q, .ab-q')}; })()""")
    ok(r['heart'] == '5' and r['blue'], f'1/18 the heart is Health 1 + Shield 4 = 5, blue {json.dumps(r)}')
    ok(r['grey'], '2 the Undead heart is grey'); ok(r['delivery'], '33 the Delivery pip (or its ? before Map 1)')
    await shot('board-shield-undead')
    s = await pg.evaluate("""(async()=>{ document.getElementById('settingsBtnHud').click(); await new Promise(r=> setTimeout(r, 300)); const sel = document.getElementById('fxSelectHud');
      sel.value = 'med'; sel.dispatchEvent(new Event('change', {bubbles:true})); renderMatchUI(); await new Promise(r=> setTimeout(r, 500));
      const p = document.getElementById('settingsPanelHud'), q = p.getBoundingClientRect(); return {open: !p.hidden, opts: [...document.getElementById('fxSelectHud').options].map(o=> o.value).join(','), inside: q.left >= 0 && q.right <= innerWidth + 1}; })()""")
    ok(s['open'] and s['opts'] == 'high,med,low,none' and s['inside'], f'8/17 the fight settings stay open after a change, have Effects, sit on screen {json.dumps(s)}')
    await shot('hud-settings'); await pg.evaluate("closeAnyOpenSettingsPanel()")
    d = await pg.evaluate("(async()=>{ window.matchFieldRulesBase = ()=> ({dark: 'dark'}); renderMatchUI(); await new Promise(r=> setTimeout(r, 700)); const bf = document.getElementById('battlefieldEl'); return bf.classList.contains('bf-lantern') && bf.classList.contains('bf-dark-dark'); })()")
    ok(d, '19 a Darkness field effect gives the dark overlay'); await pg.mouse.move(w * .6, 420 if w < 500 else 450); await pg.wait_for_timeout(500); await shot('dark-field')
    fid = await pg.evaluate("Object.keys(getCardDefs()).find(k=> /@lv/.test(k)) || null")
    if fid:
        r = await pg.evaluate(EDITOR % json.dumps(fid))
        ok(r['id'] == fid.split('@')[0] and r['save'] == 'Save changes' and r['overflow'] <= 1, f'4 battlefield editor: {fid} edits its card, same layout {json.dumps(r)}')
        await shot('editor-battle'); await pg.evaluate("closeCardEditor()")
    await pg.evaluate("(async()=>{ try{ quitMatch && quitMatch(); }catch(e){} })()")
    # 27 the results
    r = await pg.evaluate("""(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('mf', '1-5', {skipEnergyCost:true, noOpener:true}); adminModeEnabled = false; await new Promise(r=> setTimeout(r, 2600));
      const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3800));
      const m = matchState, ids = Object.keys(getCardDefs()).filter(id=> !/egg|materia/.test(id) && !getCardDefs()[id].token);
      m.conquestCardsEarned = [ids[30], ids[31], ids[32]]; m._ui23Seen = new Set([ids[31]]); m._ui23Owned = new Set([ids[31], ids[32]]);
      m.conquestEndPacks = [{kind:'end', id:'bronze'}, {kind:'end', id:'bronze'}]; m.conquestFreePack = 'silver'; m.newAchv = [ACHIEVEMENT_DEFS[0]];
      renderMatchUI(); await new Promise(r=> setTimeout(r, 300)); try{ rewardCardsReveal(); }catch(e){} await new Promise(r=> setTimeout(r, 400));
      gsap.globalTimeline.getChildren(true, true, true).forEach(t=>{ try{ t.progress(1); }catch(e){} }); await new Promise(r=> setTimeout(r, 1200));
      const a = document.querySelector('.winloss-achv');
      return {packs: [...document.querySelectorAll('.rw-pack-art b')].map(x=> x.textContent), small: document.querySelectorAll('.rw-pack-art small').length, left: !!document.querySelector('.rw-half-cards .rw-packs'),
        tags: [...document.querySelectorAll('.rw-unlocks .rw-card')].slice(0, 3).map(c=> [...c.querySelectorAll('.rw-new')].map(t=> t.textContent).join('+')), achvTop: a ? Math.round(a.getBoundingClientRect().top) : null}; })()""")
    ok(r['left'] and r['small'] == 0 and any(p.endswith('(2)') for p in r['packs']) and not any('Map reward' in p for p in r['packs']), f'27 packs on the left, a "(2)" stack, no subtitle, no Map reward {json.dumps(r)}')
    ok(r['tags'][:3] == ['NEW!+GET!', '', 'NEW!'], f'13/34/38 NEW!+GET! / nothing / NEW! {r["tags"]}')
    ok(r['achvTop'] is not None and r['achvTop'] <= 20, f'27 the achievement toast at the top ({r["achvTop"]})')
    await shot('results')
    ok(not errs, 'no page errors ' + '; '.join(errs[:3]))
    await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        for w in (1366, 390): await run(b, w)
        await b.close()
    print('ALL OK' if not fails else f'{len(fails)} FAILED'); sys.exit(1 if fails else 0)
asyncio.run(main())
