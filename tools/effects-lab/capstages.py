#!/usr/bin/env python3
"""Capture the Effects Lab catalogue's stage fixtures from the real game (2026-10-15).

    python3 assemble_arena.py && mv bramblewood-arena.html index.html
    python3 tools/effects-lab/capstages.py          # writes tools/effects-lab/fixtures.json

Opens index.html in headless Chromium and saves the game's own markup, so the lab's stages look exactly like the game:
  tiles  – card tiles from cardTileHTML (common … mythic, a foil, a token) and the castle tile
  board  – #view-play during a conquest fight with three units a side, the leader, both castles and the field cards
  map    – one conquest map canvas (trail, nodes, a feature spot, the pawn) and its background art
  pack   – the pack opener overlay before the tear and after the deal (face-down cards)
  ui     – currency / energy pills
fixtures.json is committed; build.py reads it (no browser needed to build the lab). Re-run after big markup changes.
"""
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1');"
        "localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]');"
        "localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true})); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")

TILES_JS = r"""(()=>{ const d = getCardDefs(); const ids = Object.keys(d).filter(i=> d[i].art && !d[i].locked && !d[i].token && !d[i].hero);
  const by = n=> ids.find(i=> i.includes(n)), pick = f=> ids.find(i=> f(d[i]));
  const sel = {common:[by('otter-centurion'),'common'], uncommon:[by('bee-knight'),'uncommon'], rare:[by('cobalt-talon'),'rare'], epic:[by('crimson-wing'),'epic'],
    legendary:[by('dominion-nestguard')||by('dragon'),'legendary'], mythic:[by('soldier-ant'),'mythic'], fire:[pick(x=> x.dmgType==='heat'), null], flyer:[pick(x=> (x.effects||{}).flying), null]};
  const out = {};
  for(const [k, [id, rar]] of Object.entries(sel)){ if(!id) continue; const dd = Object.assign({}, d[id], rar ? {rarity:rar} : {});
    out[k] = {id, name:dd.name, rarity:dd.rarity, html: cardTileHTML(dd, {inPlay:true})}; }
  const lg = Object.assign({}, d[sel.legendary[0]], {rarity:'legendary'});
  out.foil = {id:lg.id, name:lg.name, rarity:'legendary', html: cardTileHTML(lg, {inPlay:true, extraClass: holoClass(lg) || 'is-holo holo-rainbow'})};
  const tk = Object.keys(d).find(i=> d[i].token && d[i].art) || Object.keys(d).find(i=> d[i].token);
  if(tk) out.token = {id:tk, name:d[tk].name, rarity:d[tk].rarity, html: cardTileHTML(d[tk], {inPlay:true})};
  const castle = Object.values(CHARACTER_DEFS)[0]; out.castle = {id:'castle', name:'Castle', html: matchCastleTileHTML(castle, 30, 30, 'preview', '')};
  return out; })()"""

BOARD_JS = r"""(async()=>{ const m = matchState, E = m.engine, P = m.players, defs = getCardDefs();
  const ids = Object.keys(defs).filter(i=> defs[i].art && !defs[i].token && !defs[i].hero && !defs[i].locked && (defs[i].cardType||'unit')==='unit' && (defs[i].health||0) > 0);
  const want = ['bee-knight', 'soldier-ant', 'cobalt-talon-fledgling', 'crimson-wing-recruit', 'otter-centurion', 'dominion-nestguard'].filter(i=> defs[i]);
  while(want.length < 6) want.push(ids[want.length]);
  [[1, want.slice(0, 3)], [2, want.slice(3, 6)]].forEach(([pid, list])=>{
    const have = E.allBoardCards(P[pid]).map(c=> c.slot);
    [0, -1, 1].forEach((sl, i)=>{ if(have.includes(sl)) return; E.debugSpawnCard(P, m.sideOf, pid, list[i], sl === 0 ? 0 : sl < 0 ? 'left' : 'right', m.stats, []); }); });
  [1, 2].forEach(pid=> E.allBoardCards(P[pid]).forEach(c=> c.wait = 0));
  renderBoard(); await new Promise(r=> setTimeout(r, 900)); return 1; })()"""

CLEAN_JS = r"""(sel)=>{ const src = document.querySelector(sel); if(!src) return null; const c = src.cloneNode(true);
  c.querySelectorAll('canvas, script, .sfx, .map-mover, .shader-layer, .bf-gl, [data-gl]').forEach(e=> e.remove());
  c.querySelectorAll('*').forEach(e=>{ ['translate', 'rotate', 'scale'].forEach(p=> e.style && e.style.removeProperty(p));
    if(e.style && /matrix|translate\(0px/.test(e.style.transform||'')) e.style.removeProperty('transform'); if(e.getAttribute('style') === '') e.removeAttribute('style'); });
  return {cls: src.className, style: src.getAttribute('style') || '', html: c.innerHTML.replace(/\s{2,}/g, ' ')}; }"""

async def main():
    out = {'captured': '2026-10-17'}  # re-captured 2026-10-17: card front frames, card backs, enemy hand count, Pass beside the Graveyard
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.add_init_script(INIT)
        await pg.goto('file://' + os.path.join(ROOT, 'index.html'), wait_until='domcontentloaded'); await pg.wait_for_timeout(1800)
        await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; 1")
        out['tiles'] = await pg.evaluate(TILES_JS)
        # ui pills
        out['ui'] = await pg.evaluate("""(()=>{ myCurrencies.gold = 1240; myCurrencies.dust = 85; myCurrencies.leaves = 12; myCurrencies.energy = 18;
            const kinds = Object.keys(CURRENCY_META); const pills = {};
            ['gold', 'dust', 'leaves', 'gems', 'maple'].forEach(k=>{ if(CURRENCY_META[k]) pills[k] = currencyPillHTML(k); });
            if(!pills.leaves){ const k = kinds.find(x=> /leaf|leaves|maple/i.test(x + (CURRENCY_META[x].label||''))); if(k) pills.leaves = currencyPillHTML(k); }
            const e = document.getElementById('energyPill'); pills.energy = e ? e.outerHTML.replace(/\\s{2,}/g, ' ') : '';
            return {pills, kinds}; })()""")
        # map: m1 with the first two fights cleared
        await pg.evaluate("""(()=>{ const pr = loadConquestProgress(); const m = CONQUEST_MAPS.find(m=> m.id==='m1');
            m.nodes.filter(n=> n.kind!=='tutorial').slice(0, 2).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!pr.completed.includes(id)) pr.completed.push(id); });
            saveConquestProgress(pr); conquestSelectedMap = 'm1'; conquestWorldView = false; playSubTab = 'conquest'; switchTab('play'); return 1; })()""")
        await pg.wait_for_timeout(2200)
        out['map'] = await pg.evaluate(CLEAN_JS, '#conquestCanvas')
        out['map']['main'] = await pg.evaluate("""(()=>{ const m = document.getElementById('conquestMain') || document.querySelector('.conquest-main'); const cs = getComputedStyle(m);
            return {cls: m.className, bg: cs.backgroundImage.replace(/url\\("?file:[^)"]*?\\/(assets\\/[^)"]+)"?\\)/g, 'url($1)'), bgSize: cs.backgroundSize, bgColor: cs.backgroundColor, w: m.clientWidth, h: m.clientHeight}; })()""")
        out['map']['canvasRect'] = await pg.evaluate("(()=>{ const r = document.getElementById('conquestCanvas').getBoundingClientRect(); return [r.width, r.height]; })()")
        # board: a conquest fight with three units a side
        # 2026-10-17: a Map 1 fight under Spring Rain, so the board has an Environment card (Map 0's Mist is only a pill since 10-15)
        await pg.evaluate("(async()=>{ const m = CONQUEST_MAPS.find(m=> m.id==='m1') || CONQUEST_MAPS[0]; const n = m.nodes.find(n=> n.kind==='skirmish'); n.rules = Object.assign({}, n.rules || {}, {field:'rain'}); startConquestMatch(m.id, n.key, {skipEnergyCost:true}); return 1; })()")
        await pg.wait_for_timeout(4200)
        await pg.evaluate("document.querySelectorAll('.vs-screen,#vsScreen,.vs-overlay,.coach-tip,.coach').forEach(e=> e.remove()); 1")
        await pg.evaluate(BOARD_JS)
        out['board'] = await pg.evaluate(CLEAN_JS, '#view-play')
        out['board']['body'] = await pg.evaluate("document.body.className")
        out['board']['app'] = await pg.evaluate("(document.getElementById('appWrap')||{}).className || ''")
        out['board']['size'] = await pg.evaluate("(()=>{ const r = document.getElementById('view-play').getBoundingClientRect(); return [r.width, r.height]; })()")
        if os.environ.get('CAP_SHOT'): await pg.screenshot(path=os.environ['CAP_SHOT'])  # optional check of the captured board
        await pg.evaluate("matchState = null; switchTab('home'); 1"); await pg.wait_for_timeout(400)
        # pack opener
        await pg.evaluate("""Object.keys(CARD_DEFS_BASELINE).forEach(id=>{ delete CARD_DEFS_BASELINE[id].unattainable; if(liveCards[id]) delete liveCards[id].unattainable; }); try{ invalidateCardDefs(); }catch(e){} 1""")
        await pg.evaluate("isSignedIn = ()=>true; playerMapReach = ()=>12; myCurrencies.gold = 1000; switchTab('shop'); 1"); await pg.wait_for_timeout(400)
        await pg.click('[data-buypack="bronze"]:not([data-qty])'); await pg.wait_for_timeout(900)
        out['packClosed'] = await pg.evaluate(CLEAN_JS, '#packOpenOverlay')
        bx = await pg.locator('#poStrip').bounding_box(); y = bx['y'] + bx['height'] / 2
        await pg.mouse.move(bx['x'] + 8, y); await pg.mouse.down()
        for i in range(1, 16): await pg.mouse.move(bx['x'] + 8 + i * bx['width'] / 14, y); await pg.wait_for_timeout(16)
        await pg.mouse.up(); await pg.wait_for_timeout(1900)
        out['packDealt'] = await pg.evaluate(CLEAN_JS, '#packOpenOverlay')
        await b.close()
    if errs: print('page errors:', errs[:5])
    # relative asset URLs only (strip file:// prefixes)
    s = json.dumps(out, ensure_ascii=False)
    s = re.sub(r'file://[^"\')\s]*?/(assets/)', r'\1', s)
    open(os.path.join(HERE, 'fixtures.json'), 'w', encoding='utf-8').write(s)
    print('fixtures.json', len(s) // 1024, 'KB', {k: (len(v['html']) if isinstance(v, dict) and 'html' in v else '') for k, v in out.items()})

asyncio.run(main())
