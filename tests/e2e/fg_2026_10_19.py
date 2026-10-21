#!/usr/bin/env python3
"""Package FG (2026-10-19 / 10-21) — the Forge's Fuse tab, Reinforce, the Raid tab's card viewer, the Nest hatch, the Forge reset.

    python3 tests/e2e/fg_2026_10_19.py                       # about 2 minutes
    FG_SHOTS=docs/screens/fg python3 tests/e2e/fg_2026_10_19.py   # also saves the screenshots

At 390x844 (isMobile, hasTouch) and 1366x768, on the real page (index.html): each screen renders with no page error, its parts are
on screen and inside the viewport width; the hatch egg sits on its rays' centre; Fuse and Reinforce play and change the save; the raid
card turns with a drag; the Forge reset puts a levelled card back. Not in tests/run-all.sh (a browser run). Exit code 1 on a failure.
"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('FG_SHOTS')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true, 'world_revealed_toast':true, 'seen:forge_cobble_intro':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','pl-need','pl-do','pl-after']));")
failures = []
def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)
    return cond

SETUP = """(()=>{
  FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); window.showCoachTip = function(){};
  myCurrencies.dust = 6000; myCurrencies.gold = 6000; saveCurrencies();
  const defs = getCardDefs();
  const ids = Object.keys(defs).filter(id=> defs[id].rarity === 'common' && !defs[id].token && defs[id].attack != null && cardSourceOf(defs[id]).kind !== 'base' && !defs[id].hero).slice(0, 3);
  // a common with 13 copies (3 extras), a foil one among them, at Lv 2
  for(let k = 0; k < 13; k++) grantCardCopy(ids[0], k === 2 ? {foil:true, finish:'hex'} : {});
  for(let k = 0; k < 4; k++) grantCardCopy(ids[1], {});
  myUnlockedCardIds.add(ids[0]); myUnlockedCardIds.add(ids[1]);
  setCopyLevel(ids[0], null, 2);
  // brambles: every drop castle owned
  const owned = new Set(Object.values(CHARACTER_DEFS).filter(ch=> ch && ch.drop).map(ch=> ch.id)); localStorage.setItem(CASTLES_OWNED_KEY, JSON.stringify([...owned]));
  // raid: shards, and every raid card seen
  const raid = allRaidDefs().find(r=> raidCardIds(r).length); if(raid){ myCurrencies.raidShards = {[raid.id]: 120}; saveCurrencies(); raidCardIds(raid).slice(0, 4).forEach(id=>{ try{ seenCardIds().add(id); myDiscoveredCardIds.add(id); }catch(e){} }); const R0 = forgeRaidState(); if(R0){ grantCardCopy(R0.id, {foil:true, finish:'prism'}); grantCardCopy(R0.id, {}); } }
  return {ids, raid: raid && raid.id};
})()"""
BOX = """(sel)=>{ const e = document.querySelector(sel); if(!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {l:r.left, t:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height}; }"""

async def shot(pg, name, full=False):
    if SHOTS:
        os.makedirs(os.path.join(ROOT, SHOTS), exist_ok=True)
        await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'{name}.png'), full_page=full)

async def clean(pg):
    await pg.evaluate("document.querySelectorAll('.toast, .bw-toast, .npc-bubble, .coach-bubble, .levelup-overlay, .dlg-ov, .dialogue-ov, .fxf').forEach(e=> e.remove()); 1")

async def forge(pg, mode):
    await pg.evaluate(f"(()=>{{ forgeMode = '{mode}'; codexSubTab = 'forge'; switchTab('codex'); return 1; }})()")
    await pg.wait_for_timeout(700); await clean(pg)

async def run(b, w, h, phone):
    tag = str(w)
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    S = await pg.evaluate(SETUP)
    over = "(()=> document.documentElement.scrollWidth - innerWidth)()"
    # ---- Fuse
    await forge(pg, 'fuse')
    await pg.evaluate(f"(()=>{{ forgeSelectedId = {json.dumps(S['ids'][0])}; renderForge(); return 1; }})()"); await pg.wait_for_timeout(400); await clean(pg)
    st = await pg.evaluate("""(()=>({pile: document.querySelectorAll('#anvilStage .fg-fuse-chip').length, one: !!document.getElementById('fgFuseOneBtn'), all: (document.getElementById('fgFuseAllBtn')||{}).textContent || '', pool: document.querySelectorAll('#forgePool .card-tile').length, tab: [...document.querySelectorAll('.forge-mode')].map(b=> b.textContent.trim())}))()""")
    check(st['pile'] >= 3 and st['one'] and '(3)' in st['all'], f'{tag} fuse: the spare pile, Fuse 1, and Fuse all extras (3) for 13 commons ({st})')
    check(any('Fuse' in t for t in st['tab']) and any('Reinforce' in t for t in st['tab']), f'{tag} the Forge has Fuse and Reinforce tabs ({st["tab"]})')
    check(await pg.evaluate(over) <= 1, f'{tag} fuse: no sideways scroll')
    if phone: await pg.evaluate("document.getElementById('forgeDetail').scrollIntoView({block:'start'})")
    await shot(pg, f'fuse-{tag}')
    before = await pg.evaluate(f"(()=>({{n: myCardCopies[{json.dumps(S['ids'][0])}].length, cr: forgeCreditOf({json.dumps(S['ids'][0])}).dust}}))()")
    await pg.click('#fgFuseAllBtn'); await pg.wait_for_timeout(900)
    await shot(pg, f'fuse-centre-{tag}')
    await pg.wait_for_timeout(2600); await clean(pg)
    after = await pg.evaluate(f"(()=>({{n: myCardCopies[{json.dumps(S['ids'][0])}].length, cr: forgeCreditOf({json.dumps(S['ids'][0])}).dust, lv: myCardCopies[{json.dumps(S['ids'][0])}].map(c=> c.level)}}))()")
    check(after['n'] == 10 and after['cr'] > before['cr'] and set(after['lv']) == {2}, f'{tag} fuse all: 13 → 10 copies (the deck limit), credit up, every copy still Lv 2 ({before} → {after})')
    # ---- Upgrade (card-level): tempering lifts every copy
    await forge(pg, 'upgrade')
    await pg.evaluate(f"(()=>{{ forgeSelectedId = {json.dumps(S['ids'][0])}; renderForge(); return 1; }})()"); await pg.wait_for_timeout(300); await clean(pg)
    if phone: await pg.evaluate("document.getElementById('forgeDetail').scrollIntoView({block:'start'})")
    await shot(pg, f'upgrade-anvil-{tag}')
    await pg.evaluate("(()=>{ const b = document.getElementById('forgeLevelUpBtn'); if(b) b.click(); return 1; })()"); await pg.wait_for_timeout(4800); await clean(pg)
    lv = await pg.evaluate(f"(()=> [...new Set(myCardCopies[{json.dumps(S['ids'][0])}].map(c=> c.level))])()")
    check(lv == [3], f'{tag} temper: every copy goes to Lv 3 together ({lv})')
    # ---- Reinforce
    await pg.wait_for_timeout(1500); await forge(pg, 'castles')
    r = await pg.evaluate("""(BOX)=>{ const box = new Function('return ' + BOX)(); return {stage: box('#rfStage'), btn: box('#fgReinforceBtn'), picks: document.querySelectorAll('.fg-rf-pick').length, bg: getComputedStyle(document.querySelector('.fg-rf')).backgroundImage.includes('svg')}; }""", BOX)
    check(r['stage'] and r['btn'] and r['picks'] >= 2 and r['bg'], f'{tag} reinforce: the big preview, the button, a grid of brambles, the stonework ({r["picks"]} picks)')
    check(await pg.evaluate(over) <= 1, f'{tag} reinforce: no sideways scroll')
    await pg.evaluate("document.querySelector('.fg-rf').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(150)
    await shot(pg, f'reinforce-{tag}')
    await pg.evaluate("(()=>{ const b = document.querySelectorAll('.fg-rf-pick')[1]; if(b) b.click(); return 1; })()"); await pg.wait_for_timeout(300); await clean(pg)
    L0 = await pg.evaluate("(()=> castleLevelOf(document.getElementById('fgReinforceBtn').dataset.rfId))()")
    await pg.click('#fgReinforceBtn'); await pg.wait_for_timeout(1450)
    await shot(pg, f'reinforce-centre-{tag}')
    await pg.wait_for_timeout(2400); await clean(pg)
    L1 = await pg.evaluate("(()=> castleLevelOf(reinforcePick))()")
    check(L1 == L0 + 1, f'{tag} reinforce: Lv {L0} → {L1}')
    if phone:
        await pg.evaluate("document.querySelector('.fg-rf-grid').scrollIntoView({block:'start'})"); await shot(pg, f'reinforce-grid-{tag}')
    # ---- Raid
    await forge(pg, 'raid')
    rv = await pg.evaluate("""(BOX)=>{ const box = new Function('return ' + BOX)(); return {viewer: box('#raidViewer'), side: box('.fg-raid-side'), strip: document.querySelectorAll('.fg-rs').length, rows: document.querySelectorAll('.fg-rc-row').length, craft: !!document.querySelector('[data-rc-craft]')}; }""", BOX)
    check(rv['viewer'] and rv['side'] and rv['strip'] >= 3 and rv['rows'] >= 2 and rv['craft'], f'{tag} raid: the big card, the recipe, the strip and Craft ({rv["strip"]} cards, {rv["rows"]} rows)')
    if rv['viewer'] and rv['side']:
        if phone: check(rv['side']['t'] >= rv['viewer']['b'] - 2, f'{tag} raid: on a phone the recipe sits under the card')
        else: check(rv['side']['l'] >= rv['viewer']['r'] - 2, f'{tag} raid: on desktop the recipe is right of the card')
    check(await pg.evaluate(over) <= 1, f'{tag} raid: no sideways scroll')
    await pg.evaluate("document.querySelector('.fg-raid').scrollIntoView({block:'start'})" if not phone else "document.getElementById('raidViewer').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(200)
    vb = await pg.evaluate(BOX, '#raidViewer .fg-rv-card')
    cx, cy = vb['l'] + vb['w'] / 2, vb['t'] + vb['h'] / 2
    await pg.mouse.move(cx + vb['w'] * .3, cy - vb['h'] * .3); await pg.wait_for_timeout(150)
    tilt = await pg.evaluate("getComputedStyle(document.querySelector('#raidViewer .fg-rv-card')).getPropertyValue('--rvy')")
    await shot(pg, f'raid-{tag}')
    await pg.mouse.down(); await pg.mouse.move(cx + 150, cy, steps=6); await pg.wait_for_timeout(80)
    await shot(pg, f'raid-turning-{tag}')
    await pg.mouse.move(cx + 260, cy, steps=6); await pg.mouse.up(); await pg.wait_for_timeout(700)
    back = await pg.evaluate("document.getElementById('raidViewer').classList.contains('is-back')")
    check((phone or tilt.strip() not in ('', '0deg')) and back, f'{tag} raid: the card tilts toward the pointer ({tilt.strip()}) and a drag turns it to its back ({back})')
    # ---- Nest hatch, mid-hatch
    await pg.evaluate("(()=>{ const defs = getCardDefs(); const id = Object.keys(defs).find(k=> defs[k].rarity === 'rare' && !defs[k].token && defs[k].attack != null); hatchRevealVfx(id, '🥚'); return 1; })()")
    await pg.wait_for_timeout(1400)
    m = await pg.evaluate("""(()=>{ const c = e=>{ const b = e.getBoundingClientRect(); return b.top + b.height / 2; }; return {ico: c(document.querySelector('.he-ico')), cracks: c(document.querySelector('.he-cracks')), rays: c(document.querySelector('.hatch-rays'))}; })()""")
    check(abs(m['ico'] - m['rays']) <= 6 and abs(m['cracks'] - m['rays']) <= 8, f'{tag} hatch: the egg and its cracks sit on the rays\' centre ({m})')
    await shot(pg, f'nest-hatch-mid-{tag}')
    await pg.evaluate("document.querySelectorAll('.hatch-ov').forEach(e=> e.remove()); 1")
    # ---- the Forge reset
    rs = await pg.evaluate(f"(()=>{{ const id = {json.dumps(S['ids'][0])}; const r = resetForgeProgress(); return {{r, lv: [...new Set(myCardCopies[id].map(c=> c.level))], card: getCardLevel(id), cr: forgeCreditOf(id).dust}}; }})()")
    check(rs['lv'] == [1] and rs['card'] == 1 and rs['cr'] == 0, f'{tag} reset: the Lv 3 card back to Lv 1, credit gone ({rs})')
    check(not errs, f'{tag} no page errors ({errs[:2]})')
    await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for w, h, phone in [(390, 844, True), (1366, 768, False)]:
            print(f'--- {w}x{h}'); await run(b, w, h, phone)
        await b.close()
    print('fg e2e:', 'all passed' if not failures else f'{len(failures)} failure(s)')
    sys.exit(1 if failures else 0)
asyncio.run(main())
