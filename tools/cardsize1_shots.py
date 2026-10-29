#!/usr/bin/env python3
"""CARDSIZE1 (2026-10-29, owner: "Currently we have like 10 sizes. Can we reduce to just 3 or 4?"): a throwaway audit script.
Opens every screen that draws cards, measures every rendered card (.card-tile, .board-card, #cardPop, the detail overlay, the
map/review chips), groups them by the context that sizes them, and saves one crop per group to docs/screens/cardsize1/.

    python3 tools/cardsize1_shots.py --widths 1366         # then --widths 390
    python3 tools/cardsize1_shots.py --only codex,fight

Writes docs/screens/cardsize1/<screen>-<group>-<w>.jpg and tests/out/cardsize1-<w>.json. Build first. Not a test.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, json, re
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEEP = os.path.join(ROOT, 'docs', 'screens', 'cardsize1'); os.makedirs(KEEP, exist_ok=True)
OUTJ = os.path.join(ROOT, 'tests', 'out'); os.makedirs(OUTJ, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; adminModeEnabled = true; try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){}"
        " try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} }catch(e){} });")

# what each card-ish element is, keyed by the nearest ancestor that sizes it
MEASURE = r"""(screen)=>{
  const SKIP = /^(card-tile|card-tile-magnetic|is-|has-|rarity-|foil|holo|no-art|locked|tilt|anim|new|show|open|hidden|look|r-|frame-|arch-|back-|skin|fx-|el-|elem|sel|selected|hover|drag|dim|faded|owned|unowned|fc-tile|ct-)/;
  const ctxOf = el=>{ let p = el.parentElement, chain = [];
    for(let i = 0; p && i < 7; i++, p = p.parentElement){ const c = [...p.classList].find(c=> !SKIP.test(c)) || (p.id ? '#' + p.id : ''); if(c) chain.push(c); if(chain.length >= 2) break; }
    return chain.join(' < ') || '(root)'; };
  const vis = el=>{ const r = el.getBoundingClientRect(); if(r.width < 8 || r.height < 8) return null; const cs = getComputedStyle(el); if(cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .05) return null;
    if(r.bottom < 0 || r.right < 0 || r.top > innerHeight * 3 || r.left > innerWidth) return null; return r; };
  const info = t=>{ const q = s=> !!t.querySelector(s) && [...t.querySelectorAll(s)].some(x=> x.getBoundingClientRect().width > 0 && getComputedStyle(x).display !== 'none' && getComputedStyle(x).visibility !== 'hidden');
    return {art: q('.ico img, .card-art-img, img'), name: q('.nm, h4, .name, .cd-name'), stats: q('.atk, .hp, .statrow, .stat'), cost: q('.costbadge'), wait: q('.waitbadge, .waitring'), skills: q('.badges .sk, .badges > *, .badges-2row > *, .badges-bottom > *, .skill-badge'),
      rarity: q('.rarity-band') || /rarity|rar-/.test(t.className), text: q('ul li, .ability, .abil, .desc, .cd-info, .mech-wrap') }; };
  const out = [];
  const add = (el, kind)=>{ const r = vis(el); if(!r) return; const fs = el.querySelector('.nm'); out.push({kind, ctx: kind === 'tile' ? ctxOf(el) : kind, w: Math.round(r.width), h: Math.round(r.height), x: r.left, y: r.top,
      nmFont: fs ? getComputedStyle(fs).fontSize : '', ...info(el)}); el.setAttribute('data-cs1', out.length - 1); };
  document.querySelectorAll('[data-cs1]').forEach(e=> e.removeAttribute('data-cs1'));
  document.querySelectorAll('.card-tile').forEach(el=> add(el, 'tile'));
  [['#cardPop', 'hover popover #cardPop'], ['.card-detail-card', 'detail .card-detail-card'], ['.vis4-mc-card', 'map chip .vis4-mc-card'], ['.rv1-tile', 'review .rv1-tile'],
   ['.ab-castle-tile', 'castle .ab-castle-tile'], ['.trench-tile', 'trench tile'], ['.env-card', 'env card'], ['.raid-boss-card, .orb-card, .rh-boss', 'raid boss card'], ['.po2-mini', 'pack mini .po2-mini'],
   ['.zone-peek-mini, .zpm', 'zone peek mini'], ['.dm-card', 'deck mini .dm-card'], ['.ss-card', 'skirmish .ss-card'], ['.gpk-mini', 'grave peek .gpk-mini'], ['.tr-card', 'trench .tr-card'], ['.char-card', 'bramble .char-card']].forEach(([s, k])=> document.querySelectorAll(s).forEach(el=> add(el, k)));
  // group
  const g = {}; out.forEach((o, i)=>{ const k = o.ctx + '|' + o.w + 'x' + o.h; if(!g[k]) g[k] = {...o, n: 0, idx: i}; g[k].n++; });
  return Object.values(g); }"""

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

BOARD = """(async()=>{ switchTab('play'); startConquestMatch('m11', '20-7', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2800));
  const m = matchState, e = m.engine; [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.slot = slot; const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); });
  put(1, [['otter-kit', -2], ['fire-ant-raft', -1], ['ant-scout', 0], ['fire-ant-raft', 1], ['otter-kit', 2]]); put(2, [['voidfeather-scout', -1], ['ember-tetra', 0], ['voidfeather-scout', 1]]);
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); });
  m.players[1].lumber = 9; if(m.players[1].hand.length < 4){ ['otter-kit','ant-scout','fire-ant-raft','ember-tetra'].forEach((id, i)=> m.players[1].hand.push({uid: 990001 + i, defId: id})); }
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 3500)); })()"""
WIN = "(async()=>{ const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 4200)); })()"
FIRST = "Object.keys(getCardDefs()).find(id=> getCardDefs()[id].art && !getCardDefs()[id].token && getCardDefs()[id].rarity === 'rare') || 'otter-kit'"
MAP = """(async()=>{ const mains = mainConquestMaps(), M = mains[4], p = loadConquestProgress();
  mains.slice(0, 4).forEach(m=> m.nodes.forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p);
  const node = M.nodes.find(n=> n.kind === 'skirmish') || M.nodes[0]; conquestWorldView = false; conquestSelectedMap = M.id; conquestSelectedNodeKey = node.key; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 2500));
  const b = document.getElementById('cnpMapCards'); if(b) b.scrollIntoView({block:'center'}); window.__M = M.id; })()"""

# screen name -> list of (step js, optional hover selector). Each screen gets a fresh page.
RICH = "(()=>{ const d = getCardDefs(); Object.keys(d).filter(i=> d[i].art && !d[i].token && !d[i].test && !isEasterEgg(d[i])).slice(0, 60).forEach(i=>{ try{ unlockCardForPlayer(i, 'test'); }catch(e){} }); })()"
TEAR = """(async()=>{ myCurrencies.gold = 99999; saveCurrencies(); const p = getShopPacks().find(x=> x.id === 'bronze') || getShopPacks()[0]; const o = purchasePackOnce(p, true); o.results.forEach(r=> r.isNew = true); openPackAnimation(p, [o]); await new Promise(r=> setTimeout(r, 1500));
  const ov = document.getElementById('packOpenOverlay'); const strip = ov.querySelector('#poStrip'); if(strip){ const r = strip.getBoundingClientRect(); const fire = (type, x)=> strip.dispatchEvent(new PointerEvent(type, {bubbles:true, clientX:x, clientY:r.top + r.height/2, pointerId:1, pointerType:'mouse', buttons:1}));
  fire('pointerdown', r.left + 4); for(let i = 1; i <= 12; i++){ fire('pointermove', r.left + r.width*i/12); await new Promise(z=> setTimeout(z, 16)); } fire('pointerup', r.right - 2); } await new Promise(z=> setTimeout(z, 2200)); })()"""
CLICK1 = "(async()=>{ const ov = document.getElementById('packOpenOverlay'); const c = ov.querySelector('.po-card:not(.is-collected)'); if(c) c.click(); await new Promise(z=> setTimeout(z, 1600)); })()"
SUMMARY = "(async()=>{ const ov = document.getElementById('packOpenOverlay'); for(let k = 0; k < 40 && !ov.querySelector('.po2-summary'); k++){ const c = ov.querySelector('.po-card:not(.is-collected)'); if(c){ c.click(); await new Promise(z=> setTimeout(z, 650)); } else await new Promise(z=> setTimeout(z, 300)); } await new Promise(z=> setTimeout(z, 1500)); })()"
SCREENS = {
  'codex': [RICH, "(async()=>{ switchTab('codex'); await new Promise(r=> setTimeout(r, 2500)); })()"],
  'codex-hover': [RICH, "(async()=>{ switchTab('codex'); await new Promise(r=> setTimeout(r, 2500)); })()", 'HOVER:#view-codex .card-tile'],
  'detail': [f"(async()=>{{ openCardDetail({FIRST}); await new Promise(r=> setTimeout(r, 1200)); }})()"],
  'inspector': [f"(async()=>{{ openCardInspector({FIRST}); await new Promise(r=> setTimeout(r, 1200)); }})()"],
  'deck': [RICH, "(async()=>{ deckShowList = false; deckEditingId = activeDeckId; switchTab('deck'); await new Promise(r=> setTimeout(r, 2500)); })()"],
  'deck-popup': [RICH, "(async()=>{ switchTab('home'); openDeckBuilderPopup({title:'Skirmish deck', counts:{}, unlimited:true}); await new Promise(r=> setTimeout(r, 2000)); })()"],
  'fight': [BOARD],
  'fight-hover': [BOARD, 'HOVER:#rowMine .board-card .card-tile'],
  'rewards': [BOARD, WIN],
  'pack-torn': [TEAR],
  'pack-card': [TEAR, CLICK1],
  'pack-summary': [TEAR, SUMMARY],
  'map': [MAP],
  'map-cards': [MAP, "(async()=>{ pk1OpenMapCards(window.__M); await new Promise(r=> setTimeout(r, 1200)); })()"],
  'shop': ["(async()=>{ switchTab('shop'); await new Promise(r=> setTimeout(r, 2500)); })()"],
  'nest': [RICH, "(async()=>{ switchTab('nest'); await new Promise(r=> setTimeout(r, 2500)); })()"],
  'forge': [RICH, "(async()=>{ codexSubTab='forge'; switchTab('codex'); await new Promise(r=> setTimeout(r, 2500)); })()"],
  'raid-hub': ["(async()=>{ playSubTab='raid'; switchTab('play'); await new Promise(r=> setTimeout(r, 2000)); })()"],
  'raid-fight': ["(async()=>{ playSubTab='raid'; switchTab('play'); await new Promise(r=> setTimeout(r, 1200)); document.querySelector('.raid-hub [data-raid-open]').click(); await new Promise(r=> setTimeout(r, 800)); document.querySelector('[data-raid-part=left]').click(); await new Promise(r=> setTimeout(r, 3500)); })()"],
  'skirmish-gallery': ["(async()=>{ openSkirmishGallery(); await new Promise(r=> setTimeout(r, 2000)); })()"],
  'profile': ["(async()=>{ switchTab('profile'); await new Promise(r=> setTimeout(r, 2500)); })()"],
  'home': ["(async()=>{ switchTab('home'); await new Promise(r=> setTimeout(r, 2000)); })()"],
}

def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:48]

async def run_screen(b, url, w, name, steps, report):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    await pg.add_init_script(DONE); await pg.goto(url)
    try:
        await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2000)
        for s in steps:
            if s.startswith('HOVER:'):
                el = await pg.query_selector(s[6:])
                if el: await el.hover(); await pg.wait_for_timeout(1400)
            else:
                await pg.evaluate(s)
        groups = await pg.evaluate(MEASURE, name)
        full = os.path.join(KEEP, f'{name}-full-{w}.jpg'); await pg.screenshot(path=full, type='jpeg', quality=70)
        for g in groups:
            if g['n'] < 1: continue
            f = os.path.join(KEEP, f"{name}--{slug(g['ctx'])}-{w}.jpg")
            h = await pg.query_selector(f"[data-cs1='{g['idx']}']")
            try:
                bb = await h.bounding_box() if h else None
                if bb and bb['width'] > 0:
                    pad = 10; x, y = max(0, bb['x'] - pad), max(0, bb['y'] - pad)
                    vw = w; vh = 844 if w < 700 else 860
                    if y + bb['height'] > vh: await h.scroll_into_view_if_needed(); bb = await h.bounding_box(); x, y = max(0, bb['x'] - pad), max(0, bb['y'] - pad)
                    cw, ch = min(bb['width'] + 2 * pad, vw - x), min(bb['height'] + 2 * pad, vh - y)
                    if cw > 4 and ch > 4: await pg.screenshot(path=f, type='jpeg', quality=80, clip={'x': x, 'y': y, 'width': cw, 'height': ch}); g['shot'] = os.path.relpath(f, ROOT)
            except Exception as e: g['shoterr'] = str(e)[:100]
            g['screen'] = name; g['width'] = w; report.append(g)
        print(f'  {name}@{w}: {len(groups)} groups', ('ERR ' + errs[0]) if errs else '', flush=True)
    except Exception as e:
        print(f'  {name}@{w}: FAILED {str(e)[:200]}')
    await ctx.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else None
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]:
            report = []; jf = os.path.join(OUTJ, f'cardsize1-{w}.json')
            if os.path.exists(jf): report = json.load(open(jf))
            for name, steps in SCREENS.items():
                if a.only and name not in a.only.split(','): continue
                report = [g for g in report if g['screen'] != name]
                await run_screen(b, url, w, name, steps, report)
                json.dump(report, open(jf, 'w'), indent=1)
            print('wrote', jf)
        await b.close()
    httpd.shutdown()

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366'); ap.add_argument('--only', default='')
    asyncio.run(main(ap.parse_args()))
