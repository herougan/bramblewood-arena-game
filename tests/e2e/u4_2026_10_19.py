#!/usr/bin/env python3
"""Package U4 (2026-10-19, the owner's UI notes 23:20 / 23:34 / 23:44) — the real game page in headless Chromium.

    python3 tests/e2e/u4_2026_10_19.py                         # about a minute
    U4_SHOTS=docs/screens/u4 python3 tests/e2e/u4_2026_10_19.py   # also saves the screenshots

At 360x740 and 390x844 (isMobile, hasTouch) and 1366x768:
  1. The Codex's Show unseen / All by ID switches: a small box (not a 160 px pill), empty when off, gold with a ✓ when on, the pill
     gold-ringed while on; a set filter select wears the gold ring; the chosen card type / level chip carries a ✓.
  2. The top-right cluster on Conquest, Arena, Raid and Dungeons: Home, Arena (where it shows), Forge, then the rest, in that order,
     on one line, all on screen, nothing inside a sideways-scrolling box; the Forge button opens the Forge.
  3. The skirmish editor's deck popup sorts by Advancement and remembers it.
Not in tests/run-all.sh (a browser run). Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('U4_SHOTS')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true, 'world_revealed_toast':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','pl-need','pl-do','pl-after']));")
SIZES = [(360, 740, True), (390, 844, True), (1366, 768, False)]
failures = []
def check(cond, msg):
    if not cond:
        failures.append(msg); print('  FAIL', msg)
    return cond

async def open_page(b, w, h, phone):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; 1")
    return ctx, pg, errs

async def shot(pg, name, sel=None):
    if not SHOTS: return
    os.makedirs(os.path.join(ROOT, SHOTS), exist_ok=True)
    path = os.path.join(ROOT, SHOTS, f'{name}.png')
    if sel:
        el = await pg.query_selector(sel)
        if el: await el.screenshot(path=path); return
    await pg.screenshot(path=path)

CLEAN = "document.querySelectorAll('.toast, .bw-toast, .npc-bubble, .coach-bubble, .levelup-overlay, .fxf').forEach(e=> e.remove()); 1"

async def codex_part(b, w, h, phone):
    tag = f'{w}'
    ctx, pg, errs = await open_page(b, w, h, phone)
    await pg.evaluate("(()=>{ adminModeEnabled = true; codexSubTab = 'browse'; switchTab('codex'); return 1; })()"); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const t = document.getElementById('cxFiltersToggle'); if(t && getComputedStyle(t).display !== 'none' && t.getAttribute('aria-expanded') !== 'true') t.click(); return 1; })()"); await pg.wait_for_timeout(300)
    await pg.evaluate(CLEAN)
    probe = """(id)=>{ const i = document.getElementById(id); if(!i) return null; const l = i.closest('label'), r = i.getBoundingClientRect(), c = getComputedStyle(i), a = getComputedStyle(i, '::after'), lc = getComputedStyle(l);
      return {w:r.width, h:r.height, checked:i.checked, role:i.getAttribute('role'), bg:c.backgroundColor, tick:a.content, tickOp:a.opacity, on:l.classList.contains('is-on'), ring:lc.boxShadow}; }"""
    off = await pg.evaluate(probe, 'cxFlatById')
    check(off and off['w'] <= 22 and off['h'] <= 22 and off['role'] == 'switch', f'{tag}: All by ID is a small switch box ({off})')
    check(off and not off['checked'] and off['tickOp'] == '0' and not off['on'] and off['ring'] == 'none', f'{tag}: off = an empty box, no ring ({off})')
    await shot(pg, f'codex-switches-off-{tag}', '#codexToolbar')
    await pg.click('#cxShowUnseen'); await pg.wait_for_timeout(300)
    await pg.click('#cxFlatById'); await pg.wait_for_timeout(500)
    on = await pg.evaluate(probe, 'cxFlatById'); un = await pg.evaluate(probe, 'cxShowUnseen')
    for nm, x in (('All by ID', on), ('Show unseen', un)):
        check(x and x['checked'] and x['tickOp'] == '1' and '✓' in x['tick'] and x['on'] and x['ring'] != 'none' and x['bg'] != off['bg'], f'{tag}: {nm} on = a gold box with a ✓ and a ringed pill ({x})')
    # a set filter wears the ring; the chosen type chip has its ✓
    await pg.evaluate("(()=>{ const s = document.getElementById('cxRarity'); if(s && s.options.length > 1){ s.selectedIndex = 1; s.dispatchEvent(new Event('change')); } return 1; })()"); await pg.wait_for_timeout(400)
    r = await pg.evaluate("""(()=>{ const s = document.getElementById('cxRarity'), a = document.getElementById('cxArch'); const k = document.querySelector('#cxKindRow .ux-kind.on'), lv = document.querySelector('#cxKindRow .ux-lv.on');
      return {set: s && s.classList.contains('u4-set'), archSet: a && a.classList.contains('u4-set'), kind: k && getComputedStyle(k, '::before').content, lv: lv && getComputedStyle(lv, '::before').content}; })()""")
    check(r['set'] and not r['archSet'], f'{tag}: a set filter is ringed, an "All" one is not ({r})')
    check('✓' in (r['kind'] or '') and '✓' in (r['lv'] or ''), f'{tag}: the chosen type and level chips carry a ✓ ({r})')
    await shot(pg, f'codex-switches-on-{tag}', '#codexToolbar')
    await pg.evaluate("window.scrollTo(0, 0); 1"); await shot(pg, f'codex-{tag}')
    # the Brambles page: Owned / Not owned shows when set
    await pg.evaluate("(()=>{ codexSubTab = 'brambles'; renderCodex(); return 1; })()"); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const s = document.getElementById('brOwn'); if(s){ s.value = 'owned'; s.dispatchEvent(new Event('change')); } return 1; })()"); await pg.wait_for_timeout(400)
    br = await pg.evaluate("(()=>{ const s = document.getElementById('brOwn'), o = document.querySelector('[data-brorigin].on'); return {set: s && s.classList.contains('u4-set'), chip: o && getComputedStyle(o, '::before').content}; })()")
    check(br['set'] and '✓' in (br['chip'] or ''), f'{tag}: Brambles: Owned is ringed, the chosen origin has a ✓ ({br})')
    await shot(pg, f'brambles-filters-{tag}', '.ux2-br-bar')
    # the Forge's filter chips
    await pg.evaluate("(()=>{ codexSubTab = 'forge'; forgeMode = 'upgrade'; switchTab('codex'); return 1; })()"); await pg.wait_for_timeout(900)
    fc = await pg.evaluate("(()=>{ const c = document.querySelector('.forge-chip.on'); return c && getComputedStyle(c, '::before').content; })()")
    check('✓' in (fc or ''), f'{tag}: the Forge\'s chosen filter chip has a ✓ ({fc})')
    await pg.evaluate(CLEAN); await shot(pg, f'forge-chips-{tag}', '.forge-toolbar')
    check(not errs, f'{tag}: no page errors in the Codex ({errs[:2]})')
    await ctx.close()

async def cluster_part(b, w, h, phone):
    tag = f'{w}'
    ctx, pg, errs = await open_page(b, w, h, phone)
    await pg.wait_for_timeout(1500); await pg.evaluate(CLEAN)
    for tab in ['conquest', 'arena', 'raid', 'dungeons']:
        await pg.evaluate(f"(()=>{{ playSubTab = '{tab}'; switchTab('play'); return 1; }})()"); await pg.wait_for_timeout(700)
        await pg.evaluate(CLEAN)
        r = await pg.evaluate("""(()=>{ const cl = document.querySelector('#view-play .play-subtabs-actions'); if(!cl) return null;
          const vis = e=> e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
          const kids = [...cl.children].filter(vis).map(e=>{ const q = e.matches('.settings-wrap') ? e.querySelector('.settings-btn') : e, r = q.getBoundingClientRect(); return {id: q.id || q.className, l:r.left, r:r.right, t:r.top, b:r.bottom}; });
          let scroller = null; for(let a = cl; a && a !== document.body; a = a.parentElement){ const o = getComputedStyle(a).overflowX; if((o === 'auto' || o === 'scroll') && a.scrollWidth > a.clientWidth + 1){ scroller = a.className || a.id; break; } }
          const f = document.getElementById('forgeNavBtnPlay');
          return {kids, scroller, vw: document.documentElement.clientWidth, forgeEmoji: f && (f.querySelector('.tab-emoji img') ? f.querySelector('.tab-emoji img').getAttribute('alt') : f.querySelector('.tab-emoji').textContent), forgeLabel: f && f.getAttribute('aria-label')}; })()""")
        check(r is not None, f'{tag} {tab}: the cluster is there')
        if not r: continue
        ids = [k['id'] for k in r['kids']]
        check(ids[:1] == ['homeNavBtnPlay'], f'{tag} {tab}: Home comes first ({ids})')
        if 'arenaNavBtnPlay' in ids:
            check(ids[1:3] == ['arenaNavBtnPlay', 'forgeNavBtnPlay'], f'{tag} {tab}: Home, Arena, Forge ({ids})')
        else:
            check(ids[1:2] == ['forgeNavBtnPlay'], f'{tag} {tab}: Home, Forge (no Arena here) ({ids})')
        check(r['forgeEmoji'] == '🔨' and r['forgeLabel'] == 'The Forge', f'{tag} {tab}: the Forge is the 🔨 with its label ({r["forgeEmoji"]}, {r["forgeLabel"]})')
        btns = [k for k in r['kids'] if k['id'] in ('homeNavBtnPlay', 'arenaNavBtnPlay', 'forgeNavBtnPlay', 'settingsBtnPlaySub')]
        check(all(k['l'] >= 0 and k['r'] <= r['vw'] + 0.5 for k in r['kids']), f'{tag} {tab}: the whole cluster is on screen ({[(k["id"], round(k["l"]), round(k["r"])) for k in r["kids"]]})')
        check(len({round((k['t'] + k['b']) / 2) // 4 for k in btns}) == 1, f'{tag} {tab}: Home, Arena, Forge and ⚙️ share one line ({[(k["id"], k["t"]) for k in btns]})')
        check(not r['scroller'], f'{tag} {tab}: no sideways-scrolling box around the cluster ({r["scroller"]})')
        await shot(pg, f'cluster-{tab}-{tag}')
    # the Forge button goes to the Forge
    await pg.evaluate("(()=>{ playSubTab = 'conquest'; switchTab('play'); return 1; })()"); await pg.wait_for_timeout(600)
    await pg.evaluate("document.getElementById('forgeNavBtnPlay').click(); 1"); await pg.wait_for_timeout(900)
    went = await pg.evaluate("({tab: currentTab, sub: codexSubTab, forge: !!document.querySelector('#view-forge')})")
    check(went['tab'] == 'codex' and went['sub'] == 'forge' and went['forge'], f'{tag}: the Forge button opens the Forge ({went})')
    check(not errs, f'{tag}: no page errors on the Play screens ({errs[:2]})')
    await ctx.close()

async def sort_part(b):
    ctx, pg, errs = await open_page(b, 1366, 768, False)
    r = await pg.evaluate("""(()=>{ const counts = {}; openDeckBuilderPopup({title:'T', counts, unlimited:true}); const s = document.getElementById('dbpSort');
      const has = s && [...s.options].some(o=> o.value === 'advance' && /Advancement/.test(o.textContent));
      s.value = 'advance'; s.dispatchEvent(new Event('change'));
      const defs = getCardDefs(), ids = [...document.querySelectorAll('#dbpPool [data-add]')].map(b=> b.dataset.add), keys = ids.map(id=> advancementKey(defs[id]));
      const sorted = keys.every((k, i)=> !i || keys[i - 1] <= k);
      const saved = localStorage.getItem('bramblewood_dbp_sort_v1');
      document.querySelector('.deck-popup-overlay [data-close]').click();
      openDeckBuilderPopup({title:'T', counts, unlimited:true}); const again = document.getElementById('dbpSort').value;
      document.querySelector('.deck-popup-overlay [data-close]').click();
      return {has, sorted, n: ids.length, saved, again, first: keys.slice(0, 3), last: keys.slice(-2)}; })()""")
    check(r['has'] and r['sorted'] and r['n'] > 20, f'deck popup: "Sort: Advancement" orders the pool by advancementKey ({r})')
    check(r['saved'] == 'advance' and r['again'] == 'advance', f'deck popup: the choice is remembered ({r})')
    check(not errs, f'deck popup: no page errors ({errs[:2]})')
    await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for w, h, phone in SIZES:
            print(f'-- {w}x{h}')
            await codex_part(b, w, h, phone)
            await cluster_part(b, w, h, phone)
        print('-- deck popup sort')
        await sort_part(b)
        await b.close()
    print(f'u4_2026_10_19: {len(failures)} failure(s)' if failures else 'u4_2026_10_19: all passed')
    sys.exit(1 if failures else 0)

if __name__ == '__main__':
    asyncio.run(main())
