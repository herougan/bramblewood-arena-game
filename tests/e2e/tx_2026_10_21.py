#!/usr/bin/env python3
"""Package TX (2026-10-21, owner Oct 21): types, taxonomy and filters -- the real game page in headless Chromium.

    python3 tests/e2e/tx_2026_10_21.py [outdir]

At 390x844 (phone) and 1366x768:
  1. the Codex: the type filter takes the hierarchy (Bird shows the eagles that only list Mountain; Aquatic, a habitat, shows the
     octopi), the skill picker has the groups first and no two chips with one name (Diurnal = Diurnal {...}), a group filters,
     the sorts run both ways (Attack high to low, then low to high);
  2. the same filter bar in the deck editor (Play's Loadout and the Camp), the skirmish deck builder popup and the skirmish gallery:
     it opens, its type filter narrows the pool, its sort flips;
  3. no horizontal scroll, no page errors.
Screenshots go to docs/screens/tx/ (or outdir). Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs', 'screens', 'tx')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("if(!sessionStorage.getItem('bw_f_init')){ sessionStorage.setItem('bw_f_init','1');"
        "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek'])); }"
        "sessionStorage.setItem('bramblewood_seen_splash','1');")
failures = []


def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)


async def boot(pg):
    await pg.wait_for_timeout(1500)
    await pg.evaluate("""FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key));
      Object.keys(getCardDefs()).filter(id=> !getCardDefs()[id].test).forEach(id=>{ try{ unlockCardForPlayer(id, 'test'); }catch(e){} });
      try{ const pr = loadConquestProgress(); mainConquestMaps().slice(0, 14).forEach(m=> m.nodes.forEach(n=>{ const k = conquestNodeId(m.id, n.key); if(!pr.completed.includes(k)) pr.completed.push(k); })); saveConquestProgress(pr); }catch(e){}
      1""")
    await pg.reload(); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content='#toastHost, #dialogueDock, body > [class*="fx"], body > [class*="fs-"]{display:none !important;}')


async def shot(pg, name):
    os.makedirs(OUT, exist_ok=True)
    await pg.screenshot(path=os.path.join(OUT, name))


async def select(pg, sel, value):
    await pg.evaluate(f"(()=>{{ const s = document.querySelector('{sel}'); s.value = {value!r}; s.dispatchEvent(new Event('change', {{bubbles:true}})); }})()")
    await pg.wait_for_timeout(500)


async def run(p, tag, vp, mobile):
    b = await p.chromium.launch(executable_path=EXE)
    ctx = await b.new_context(viewport=vp, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1)
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await boot(pg)
    hs = "document.documentElement.scrollWidth > window.innerWidth + 1"

    # ---- 1. the Codex (compressed grid: every match is drawn, so the counts are the list's)
    await pg.evaluate("codexViewMode = 'compressed'; codexFlatById = false; codexSubTab = 'browse'; codexFilter.q = ''; codexFilter.archetype = ''; codexFilter.skills = []; codexFilter.animal = ''; codexFilter.phylum = ''; codexFilter.rarity = ''; codexFilter.mechLine = ''; switchTab('codex'); 1")
    await pg.wait_for_timeout(1500)
    await pg.evaluate("document.getElementById('cxFiltersToggle').click()"); await pg.wait_for_timeout(300)
    opts = await pg.evaluate("[...document.querySelectorAll('#cxArch optgroup')].map(g=> [g.label, g.children.length, [...g.children].map(o=> o.value)])")
    names = {o for g in opts for o in g[2]}
    check(len(opts) == 3 and {'Aquatic', 'Bird', 'Mammal', 'Raptor'} <= names, f'[{tag}] the type filter: Habitats / Animal types / Other, with the wider types ({[(g[0], g[1]) for g in opts]})')
    await select(pg, '#cxArch', 'Bird')
    r = await pg.evaluate("(()=>{ const ids = [...document.querySelectorAll('#codexGrid .card-tile[data-defid]')].map(t=> t.dataset.defid), d = getCardDefs(); return {n: ids.length, notTagged: ids.filter(id=> !(d[id].archetypes||[]).includes('Bird')).length, eagles: ids.filter(id=> d[id].animal === 'eagle').length, count: document.getElementById('codexResultCount').textContent}; })()")
    tagged = await pg.evaluate("Object.values(getCardDefs()).filter(d=> !d.test && (d.archetypes||[]).includes('Bird')).length")
    shown = int(r['count'].split(' ')[0])
    check(r['notTagged'] > 0 and shown > tagged, f'[{tag}] Codex type Bird: also the birds that do not list Bird ({shown} shown, {tagged} list Bird; {r})')
    await select(pg, '#cxArch', 'Aquatic')
    r = await pg.evaluate("(()=>{ const d = getCardDefs(), vis = Object.keys(d).filter(id=> !d[id].test); return {shown: parseInt(document.getElementById('codexResultCount').textContent, 10), ocean: vis.filter(id=> (d[id].archetypes||[]).includes('Ocean')).length, river: vis.filter(id=> (d[id].archetypes||[]).includes('River')).length, octoIsAq: BramblewoodTaxonomy.isA(d['glass-octopus'], 'Aquatic') && BramblewoodTaxonomy.isA(d['otter-centurion'], 'Aquatic') === (d['otter-centurion'].archetypes||[]).includes('River')}; })()")
    check(r['octoIsAq'] and r['shown'] > max(r['ocean'], r['river']), f'[{tag}] Codex type Aquatic (a habitat): the water habitats and animals together ({r})')
    await shot(pg, f'codex-type-{tag}.png')
    await select(pg, '#cxArch', '')
    await pg.evaluate("document.getElementById('cxSkillBtn').click()"); await pg.wait_for_timeout(400)
    sk = await pg.evaluate("""(()=>{ const p = document.getElementById('cxSkillPanel'); const groups = [...p.querySelectorAll('.is-groups [data-cxskill]')].map(b=> b.dataset.cxskill);
      const chips = codexSkillChoices().map(c=> c.name);
      const dup = chips.filter((c, i)=> chips.indexOf(c) !== i); return {groups, n: chips.length, dup, keys: [...p.querySelectorAll('.cx-skill-chips:not(.is-groups) [data-cxskill]')].map(b=> b.dataset.cxskill)}; })()""")
    check(len(sk['groups']) >= 10 and 'agg:lumber' in sk['groups'] and 'agg:status' in sk['groups'], f'[{tag}] the skill picker opens on the groups ({sk["groups"]})')
    check(sk['n'] > 20 and not sk['dup'] and 'diurnalGrant' not in sk['keys'] and 'tideGrant' not in sk['keys'], f'[{tag}] one chip per skill name ({sk["n"]} chips, duplicates {sk["dup"]})')
    await shot(pg, f'codex-skills-{tag}.png')
    await pg.evaluate("document.querySelector('#cxSkillPanel [data-cxskill=\"agg:lumber\"]').click()"); await pg.wait_for_timeout(600)
    r = await pg.evaluate("(()=>{ const ids = [...document.querySelectorAll('#codexGrid .card-tile[data-defid]')].map(t=> t.dataset.defid); return {n: ids.length, chip: !!document.querySelector('#cxSkillActive [data-cxskilloff=\"agg:lumber\"]')}; })()")
    check(r['n'] > 0 and r['chip'], f'[{tag}] the Lumber group filters the Codex ({r})')
    await pg.evaluate("codexSetSkills([])"); await pg.wait_for_timeout(400)
    await select(pg, '#cxSort', 'attack')
    await pg.evaluate("codexFilter.dir = 'desc'; renderCodexGrid()"); await pg.wait_for_timeout(500)
    hi = await pg.evaluate("[...document.querySelectorAll('#codexGrid .card-tile[data-defid]')].slice(0, 30).map(t=> getCardDefs()[t.dataset.defid].attack)")
    await pg.evaluate("document.getElementById('cxSortDir').click()"); await pg.wait_for_timeout(500)
    lo = await pg.evaluate("[...document.querySelectorAll('#codexGrid .card-tile[data-defid]')].slice(0, 30).map(t=> getCardDefs()[t.dataset.defid].attack)")
    check(hi and lo and hi[0] >= hi[-1] and lo[0] <= lo[-1] and hi[0] > lo[0], f'[{tag}] Codex Attack: high to low, then low to high ({hi[:4]} / {lo[:4]})')
    check(not await pg.evaluate(hs), f'[{tag}] Codex: no horizontal scroll')

    # ---- 2. the deck editors
    async def bar(P, where, pool_sel):
        await pg.evaluate(f"document.getElementById('{P}FiltersBtn').click()"); await pg.wait_for_timeout(300)
        n0 = await pg.evaluate(f"document.querySelectorAll('{pool_sel}').length")
        await select(pg, f'#{P}Arch', 'Bird')
        n1 = await pg.evaluate(f"document.querySelectorAll('{pool_sel}').length")
        defs = await pg.evaluate(f"[...document.querySelectorAll('{pool_sel}')].slice(0, 40).map(t=> t.dataset.defid || t.dataset.pick || t.dataset.add || (t.querySelector('[data-defid]')||{{dataset:{{}}}}).dataset.defid)")
        birds = await pg.evaluate("ids=> ids.filter(Boolean).every(id=> (window.BramblewoodTaxonomy).isA(getCardDefs()[id], 'Bird'))", defs)
        check(n1 > 0 and n1 < n0 and birds, f'[{tag}] {where}: the bar\'s type filter narrows the pool to birds ({n0} -> {n1})')
        await pg.evaluate(f"document.getElementById('{P}SkillBtn').click()"); await pg.wait_for_timeout(300)
        g = await pg.evaluate(f"document.querySelectorAll('#{P}SkillPanel .is-groups [data-cxskill]').length")
        check(g >= 10, f'[{tag}] {where}: the skill picker with its groups ({g})')
        await select(pg, f'#{P}Sort', 'health')
        check(await pg.evaluate(f"document.getElementById('{P}Sort').value === 'health' && !!document.getElementById('{P}SortDir')"), f'[{tag}] {where}: sorts (Health) with a direction')
        check(not await pg.evaluate(hs), f'[{tag}] {where}: no horizontal scroll')

    await pg.evaluate("playSubTab = 'player'; playerStatsOpen = false; switchTab('play'); 1"); await pg.wait_for_timeout(1500)
    await bar('dk', 'Play deck editor', '#myDeckPool .pool-stack')
    await pg.evaluate("document.getElementById('dkPanel').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(300)
    await shot(pg, f'deck-play-{tag}.png')
    await select(pg, '#dkArch', '')
    # a fresh page for the Camp (Play's Loadout and the Camp draw the same editor, with the same ids)
    await pg.reload(); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content='#toastHost, #dialogueDock, body > [class*="fx"], body > [class*="fs-"]{display:none !important;}')
    await pg.evaluate("deckSubTab = 'list'; deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = (myDecks.find(d=> d.id === activeDeckId) || myDecks[0] || createNewDeck()).id; switchTab('deck'); 1"); await pg.wait_for_timeout(1500)
    has = await pg.evaluate("!!document.querySelector('#view-deck #dkFiltersBtn')")
    check(has, f'[{tag}] the Camp deck editor has the bar')
    if has:
        await bar('dk', 'Camp deck editor', '#myDeckPool .pool-stack')
        await pg.evaluate("document.getElementById('dkPanel').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(300)
        await shot(pg, f'deck-camp-{tag}.png')
        await select(pg, '#dkArch', '')
    await pg.evaluate("switchTab('home'); openDeckBuilderPopup({title:'Skirmish deck', counts:{}, unlimited:true}); 1"); await pg.wait_for_timeout(800)
    await bar('dbp', 'skirmish deck popup', '#dbpPool [data-add]')
    await shot(pg, f'deck-skirmish-popup-{tag}.png')
    await pg.evaluate("document.querySelector('.deck-popup-overlay [data-close]').click()"); await pg.wait_for_timeout(300)
    await pg.evaluate("window.__sgc = {}; openSkirmishGallery({kind:'deck', counts: window.__sgc, pick: id=>{ __sgc[id] = (__sgc[id]||0) + 1; }, minus: id=>{ delete __sgc[id]; }}); 1"); await pg.wait_for_timeout(800)
    await bar('sg', 'skirmish gallery', '.sg-grid [data-pick]')
    # a pick redraws the gallery; the bar stays open
    await pg.evaluate("document.querySelector('.sg-grid [data-pick]').click()"); await pg.wait_for_timeout(400)
    check(await pg.evaluate("!document.getElementById('sgPanel').hidden && document.getElementById('sgArch').value === 'Bird'"), f'[{tag}] skirmish gallery: the bar stays open and set after a pick')
    await shot(pg, f'deck-skirmish-gallery-{tag}.png')
    check(not errs, f'[{tag}] no page errors {errs[:3]}')
    await b.close()


async def main():
    async with async_playwright() as p:
        await run(p, '390', {'width': 390, 'height': 844}, True)
        await run(p, '1366', {'width': 1366, 'height': 768}, False)
    print('tx e2e:', 'FAIL' if failures else 'ok', len(failures), 'failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
