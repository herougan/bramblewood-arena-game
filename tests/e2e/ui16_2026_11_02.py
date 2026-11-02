#!/usr/bin/env python3
"""Package UI16 (2026-11-02, owner 11-02 22:15 notes 9, 10, 1): browser checks, shots in tests/e2e/shots/ui16/.
    python3 tests/e2e/ui16_2026_11_02.py [--page index.html] [--width 1366,390] [--only n9,n10,n1]
n9   the versus opener's rival card: the map name above the code, the leader's and the bramble's art feathered at the edges, the fight's name,
     the BR box and the quote; no facts line (people, castle Health and Armour, the leader line, the CPU). With no leader and no bramble art it
     keeps the round portrait.
n10  Auto-play: when the CPU playing your side pitches, the card flies from your hand into your Graveyard (the pile bumps, the gain shows); when
     it plays, the card flies from your hand onto its slot. The enemy's own pitch keeps its slot animation.
n1   the player card: background, border, font, a word before and after your name, beside the title; locked choices say what opens them; the
     look is saved in the avatar record and shows on the profile, What rivals see, your side of the versus card, a PvP side and your co-op seat.
     A ghost's unknown look id draws the default.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui16'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()
def shot(name, w): return os.path.join(SHOTS, f'{name}-{w}.png')
NOTOAST = '.toast, .toast-host, #toastHost, .xp-float, .fxg-title-stage, .level-up-burst, #signInBanner{display:none !important;}'
STILL = ('#atmoTint, #atmoCanvas{display:none !important;} '  # the live time-of-day tint (night in a UTC test run) washes every shot
         '.vs-opener{animation:none !important; opacity:1 !important;} .vs-opener *{animation-play-state:paused !important;}'
         ' .vs-opener .vs-side, .vs-opener .vs-mark, .vs-opener .vs-taunt{animation:none !important; opacity:1 !important; transform:none !important;}')
SLEEP = 'const W = ms=> new Promise(r=> setTimeout(r, ms));'
# every fight cleared (so the map-gated looks open), as tests/e2e/vis3_2026_10_26.py OPEN does for one map
CLEAR_ALL = """(()=>{ const p = loadConquestProgress(); CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)){ p.completed.push(id); p.ranks[id] = 'S'; } })); saveConquestProgress(p); })()"""

# the rival card as data
CARD = """(()=>{ const el = document.querySelector('.vs-opener'); if(!el) return null; const them = el.querySelector('.vs-them'), kids = [...them.children].map(c=> c.className);
  const figs = [...them.querySelectorAll('.ui16-vs-fig')].map(f=>{ const p = f.querySelector('.ui16-vs-pic'), cs = getComputedStyle(p); return {kind: f.className.replace('ui16-vs-fig ', ''), bg: cs.backgroundImage.slice(0, 60), mask: (cs.maskImage || cs.webkitMaskImage || ''), cap: f.querySelector('figcaption').textContent.trim()}; });
  return {kids, text: them.textContent.replace(/\\s+/g, ' ').trim(), map: (them.querySelector('.ui16-vs-map') || {}).textContent || '', kick: (them.querySelector('.ui14-vs-kicker') || {}).textContent || '',
    figs, portrait: !!them.querySelector('.vs-rival-ico'), facts: !!them.querySelector('.ui14-vs-facts, .vs-fact, .vs-ai-pill'), br: !!them.querySelector('.vs-lvl b'), quote: !!them.querySelector('.vs-taunt'),
    name: (them.querySelector('.vs-name') || {}).textContent || '', sw: document.documentElement.scrollWidth, vw: innerWidth}; })()"""

async def open_vs(pg, mid, key):
    await pg.evaluate("""(async([mid, key])=>{ """ + SLEEP + """ switchTab('play'); showVersusOpener.last = null; startConquestMatch(mid, key, {skipEnergyCost:true}); await W(2400); })""", [mid, key])  # past a new map's reveal veil, inside the opener's 3.4-3.8 s
    await pg.add_style_tag(content=STILL + NOTOAST)
    return await pg.evaluate(CARD)

# ---------------------------------------------------------------- note 9
async def n9(b, url, w):
    print(f'-- note 9: the rival card on the versus opener ({w})')
    pg = await W.fresh(b, url, w)
    r = await open_vs(pg, 'me', '20-A-2')
    f = await pg.evaluate("(()=>{ const f = findConquestNode('me', '20-A-2'); return {map: f.map.name, name: f.node.name, lead: getCardDefs()['cinder-stoker'].name}; })()")
    ok(r is not None, 'the opener shows for 20-A-2 The Wraith Vents')
    if r:
        ok('ui16-vs-map' in r['kids'][0] and 'ui14-vs-kicker' in r['kids'][1], f'the map name is on top, the code under it {r["kids"][:3]}')
        ok(f['map'] in r['map'] and '20-A-2' in r['kick'], f'map "{r["map"].strip()}", code "{r["kick"]}"')
        lead = [x for x in r['figs'] if 'is-leader' in x['kind']]; bram = [x for x in r['figs'] if 'is-bramble' in x['kind']]
        ok(len(lead) == 1 and 'url(' in lead[0]['bg'] and f['lead'] in lead[0]['cap'], f'the leader\'s card art, named {lead}')
        ok(len(bram) == 1, f'the bramble beside it {bram}')
        ok(all('radial-gradient' in x['mask'] for x in r['figs']), 'each picture is feathered at the edges (a radial mask)')
        ok(not r['portrait'], 'no round portrait when there is art')
        ok(not r['facts'] and not any(s in r['text'] for s in [' HP', 'Armour', 'Wild beasts', 'CPU', 'Leader: ']), f'no people, castle Health / Armour, leader line or CPU: "{r["text"][:160]}"')
        ok(r['br'] and r['quote'] and r['name'].strip() == f['name'], 'the fight\'s name, the BR box and the quote stay')
        ok(r['sw'] <= r['vw'], 'no sideways scroll')
    await pg.screenshot(path=shot('n9-20-A-2', w))
    await done(pg)
    # a fight whose bramble has a picture and a leader: both pictures
    pg = await W.fresh(b, url, w)
    pick = await pg.evaluate("""(()=>{ for(const m of CONQUEST_MAPS){ for(const n of (m.nodes||[])){ try{ if(n.kind === 'tutorial' || n.virtual) continue; const c = skirmishCastle(n).character; if(c && c.art && leadersShownFor(n, m.id).length === 1) return [m.id, n.key]; }catch(e){} } } return null; })()""")
    ok(pick is not None, f'found a fight with a leader and a bramble picture {pick}')
    if pick:
        r = await open_vs(pg, pick[0], pick[1])
        ok(r is not None and len(r['figs']) == 2 and all('url(' in x['bg'] for x in r['figs']), f'{pick}: two pictures, the leader\'s and the bramble\'s {r and r["figs"]}')
        await pg.screenshot(path=shot('n9-leader-and-bramble', w))
    await done(pg)
    # a plain skirmish (no leader, a bramble with no picture): the round portrait, still no facts line
    pg = await W.fresh(b, url, w)
    pick = await pg.evaluate("""(()=>{ for(const m of CONQUEST_MAPS){ for(const n of (m.nodes||[])){ try{ if(n.kind === 'tutorial' || n.virtual || baseKind(n.kind || 'skirmish') !== 'skirmish') continue; const c = skirmishCastle(n).character; if(!(c && c.art) && !leadersShownFor(n, m.id).length) return [m.id, n.key]; }catch(e){} } } return null; })()""")
    if pick:
        r = await open_vs(pg, pick[0], pick[1])
        ok(r is not None and r['portrait'] and not r['figs'] and not r['facts'] and 'ui16-vs-map' in r['kids'][0], f'{pick}: no art, the round portrait, the map name on top, no facts {r and (r["kids"][:3], r["figs"])}')
    else: ok(False, 'found a plain skirmish with no leader and no bramble art')
    await done(pg)

# ---------------------------------------------------------------- note 10
FIGHT = """(async()=>{ """ + SLEEP + """ adminModeEnabled = true; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await W(2600); try{ skipTriggerLesson(); }catch(e){}
  const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{}; return !!matchState; })()"""
async def n10(b, url, w):
    print(f'-- note 10: Auto-play pitches into the Graveyard and plays from the hand ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(FIGHT); await pg.add_style_tag(content=NOTOAST)
    # the pitch flight on its own, slowed (speed 0.25: 2.5 s), for a frame mid-flight and the landing
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ const m = matchState; m.speedMult = .25; const me = m.players[1]; const h = me.hand[0]; const tile = document.querySelector(`#handStrip .card-tile[data-handuid="${h.uid}"]`);
      window.__bump = 0; window.__callout = 0; const g = document.getElementById('dropDiscard'); new MutationObserver(()=>{ if(g.classList.contains('ui16-grave-bump')) __bump++; }).observe(g, {attributes: true, attributeFilter: ['class']});
      let callout = 0; const pc = window.pitchCallout; window.pitchCallout = function(){ callout++; __callout++; return pc.apply(this, arguments); };
      const t0 = tile.getBoundingClientRect(); ui16PitchToGrave(m, tile, {type:'discard', side:'A', defId: h.defId, resource:'lumber', amount:1}); await W(60);
      const fly = document.querySelector('.ui16-pitch-fly'); return {fly: !!fly, hidden: tile.style.visibility === 'hidden', from: [Math.round(t0.left), Math.round(t0.top)], callout0: callout}; })()""")
    ok(r['fly'] and r['hidden'], f'a copy of the hand card flies; the hand tile is hidden {r}')
    # its clock starts at the first frame drawn (a.ready), slow on a headless board: wait until it is a third of the way
    await pg.evaluate("""(async()=>{ """ + SLEEP + """ for(let i = 0; i < 100; i++){ const f = document.querySelector('.ui16-pitch-fly'); const a = f && f.getAnimations()[0]; if(!a || (a.effect.getComputedTiming().progress || 0) > .32) return; await W(40); } })()""")
    await pg.screenshot(path=shot('n10-pitch-mid-flight', w))
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ for(let i = 0; i < 60 && !__bump; i++) await W(50); await W(1800); return {bump: __bump, callout: __callout, gone: !document.querySelector('.ui16-pitch-fly')}; })()""")
    ok(r['bump'] >= 1 and r['callout'] >= 1, f'the Graveyard bumps as the card lands and the pitch callout shows {r}')
    ok(r['gone'], 'the flying copy is gone after it lands')
    await done(pg)
    # the real Auto path: the CPU plays your side; its pitches and plays go through ui16AutoHandFx
    pg = await W.fresh(b, url, w)
    await pg.evaluate(FIGHT); await pg.add_style_tag(content=NOTOAST)
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ const m = matchState; m.speedMult = 2; window.__ui16Auto = null; window.__seen = {fly: 0, proxy: 0, enemySlot: 0};
      new MutationObserver(ms=> ms.forEach(x=> x.addedNodes.forEach(n=>{ if(n.nodeType !== 1) return; if(n.classList.contains('ui16-pitch-fly')) __seen.fly++; if(n.classList.contains('hand-flight-proxy')) __seen.proxy++; if(n.classList.contains('enemy-pitch-slot-fx')) __seen.enemySlot++; }))).observe(document.body, {childList: true});
      // pitches early: little Lumber, so the CPU playing your side pitches to afford a card
      m.players[1].lumber = 0; m.autoplay = true;
      for(let i = 0; i < 300 && !(window.__ui16Auto && __ui16Auto.pitch >= 1 && __ui16Auto.play >= 1 && __seen.proxy >= 1) && !m.over; i++) await W(100);
      return {auto: window.__ui16Auto, seen: __seen, over: m.over}; })()""")
    a = r['auto'] or {}
    ok(a.get('pitch', 0) >= 1 and r['seen']['fly'] >= 1, f'on Auto, your side\'s pitch flies into the Graveyard {r}')
    ok(a.get('play', 0) >= 1 and r['seen']['proxy'] >= 1, f'on Auto, your side\'s play flies from your hand onto its slot (hand-flight-proxy) {r}')
    await done(pg)

# ---------------------------------------------------------------- note 1
LOOK = "JSON.parse(localStorage.getItem('bramblewood_avatar') || '{}')"
async def n1(b, url, w):
    print(f'-- note 1: the player card editor ({w})')
    pg = await W.fresh(b, url, w)
    await pg.add_style_tag(content=NOTOAST)
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ localStorage.removeItem('bramblewood_avatar'); switchTab('profile'); await W(500); document.getElementById('pfAvatarBtn').click(); await W(400);
      const pk = id=> document.querySelector(`[data-ui16-pick="${id}"]`);
      return {rows: [...document.querySelectorAll('#avatarPanel .ui16-picks')].map(x=> x.dataset.ui16Kind), dusk: pk('bg:dusk') && !pk('bg:dusk').disabled, tide: pk('bg:tide') && pk('bg:tide').disabled, tideTip: pk('bg:tide') && pk('bg:tide').title,
        on: [...document.querySelectorAll('#avatarPanel .ui16-pick.is-on')].map(x=> x.dataset.ui16Pick), titles: document.querySelectorAll('#avatarPanel .avatar-title-opt').length}; })()""")
    ok(r['rows'] == ['bg', 'border', 'font', 'prefix', 'suffix'] and r['titles'] >= 5, f'the editor has background, border, font, before and after your name, and the titles {r["rows"]}')
    ok(r['dusk'] and r['tide'] and 'Clear' in (r['tideTip'] or ''), f'an open choice and a locked one that says what opens it ({r["tideTip"]})')
    ok(sorted(r['on']) == sorted(['bg:meadow', 'border:plain', 'font:classic', 'prefix:none', 'suffix:none']), f'a new player has the defaults picked {r["on"]}')
    # open every map-gated look, then pick a full set
    await pg.evaluate(CLEAR_ALL); await pg.wait_for_timeout(4500)  # the level-up the cleared maps' XP sets off plays out first
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ document.getElementById('pfCharClose').click(); await W(300); document.getElementById('pfAvatarBtn').click(); await W(400);
      for(const id of ['bg:ember', 'border:gold', 'font:hand', 'prefix:mossy', 'suffix:glade']){ document.querySelector(`[data-ui16-pick="${id}"]`).click(); await W(150); }
      const t = [...document.querySelectorAll('#avatarPanel .avatar-title-opt')].find(x=> !x.disabled && x.dataset.avTitle === 'trailblazer'); if(t){ t.click(); await W(150); }
      const pc = document.querySelector('#avatarPanel .ui16-pcard');
      return {saved: """ + LOOK + """, pcard: pc && {bg: pc.dataset.ui16Bg, bd: pc.dataset.ui16Border, ft: pc.dataset.ui16Font, name: pc.querySelector('.ui16-name').textContent.trim(), font: getComputedStyle(pc.querySelector('.ui16-name')).fontFamily}}; })()""")
    s = r['saved']
    ok(s.get('bg') == 'ember' and s.get('border') == 'gold' and s.get('font') == 'hand' and s.get('prefix') == 'mossy' and s.get('suffix') == 'glade', f'saved in the avatar record {s}')
    ok(s.get('title') == 'trailblazer', f'the title is still chosen beside them ({s.get("title")})')
    ok(r['pcard'] and r['pcard']['name'].startswith('Mossy') and r['pcard']['name'].endswith('of the Glade') and 'Caveat' in r['pcard']['font'], f'the preview card: the name with its prefix and suffix, in the chosen font {r["pcard"]}')
    await pg.screenshot(path=shot('n1-editor', w))
    k = await pg.evaluate("PROGRESS_KEYS.includes('bramblewood_avatar')")
    ok(k, 'the avatar record is one of the synced progress keys (no new server column)')
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ document.getElementById('pfCharClose').click(); await W(500); const h = document.querySelector('.pf-hero'), cs = getComputedStyle(h), pp = document.querySelector('.pp-banner.ui16-pp');
      return {bg: h.dataset.ui16Bg, bgImg: cs.backgroundImage.slice(0, 80), border: cs.borderTopColor, name: h.querySelector('.pf-name').textContent.trim(), font: getComputedStyle(h.querySelector('.pf-name')).fontFamily, pp: pp && pp.dataset.ui16Border, ppName: pp && pp.querySelector('.pp-name').textContent.trim()}; })()""")
    ok(r['bg'] == 'ember' and 'gradient' in r['bgImg'] and r['border'] in ('rgb(255, 224, 138)',), f'the profile header wears the background and border {r}')
    ok('Caveat' in r['font'] and r['name'].startswith('Mossy'), f'the header name: prefix, suffix and font {r["name"]} / {r["font"][:40]}')
    ok(r['pp'] == 'gold' and r['ppName'].endswith('of the Glade'), f'What rivals see shows the same card {r["pp"]}, {r["ppName"]}')
    await pg.evaluate("window.scrollTo(0, 0)"); await pg.screenshot(path=shot('n1-profile', w))
    # a PvP side: a ghost's look (and an unknown id, which draws the default)
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ const p = showVsScreen({name: 'Jay', deck: 'Deck 1', avatar: loadAvatar(), level: 40},
        {name: 'Sable Quill', deck: 'Fox Rush', avatar: {character: 'fox', color: 'river', title: 'raider', bg: 'starlight', border: 'silver', font: 'poster', prefix: 'ancient', suffix: 'unbroken'}, level: 41}); await W(900);
      const L = document.querySelector('.vs2 .vs-left .vs2-card'), R = document.querySelector('.vs2 .vs-right .vs2-card');
      const out = {L: L && [L.dataset.ui16Bg, L.dataset.ui16Border, L.dataset.ui16Font, L.querySelector('.vs-name').textContent.trim()], R: R && [R.dataset.ui16Bg, R.dataset.ui16Border, R.dataset.ui16Font, R.querySelector('.vs-name').textContent.trim()], Rbg: R && getComputedStyle(R).backgroundImage.slice(0, 40)};
      return out; })()""")
    ok(r['L'] and r['L'][:3] == ['ember', 'gold', 'hand'] and r['L'][3].startswith('Mossy'), f'your PvP side wears your card {r["L"]}')
    ok(r['R'] and r['R'][:3] == ['starlight', 'silver', 'poster'] and r['R'][3] == 'Ancient Sable Quill the Unbroken' and 'gradient' in r['Rbg'], f'a ghost\'s side wears its own {r["R"]}')
    await pg.screenshot(path=shot('n1-pvp-vs', w))
    r = await pg.evaluate("""(()=>{ const t = document.createElement('div'); t.innerHTML = ui16PlayerCardHTML({character: 'otter', bg: '"><b id=x>', border: 'nope', font: 1, prefix: 'zzz', suffix: null}, '<i>Eve</i>'); const c = t.firstElementChild;
      return {bg: c.dataset.ui16Bg, bd: c.dataset.ui16Border, ft: c.dataset.ui16Font, inj: !!t.querySelector('#x, i'), name: c.querySelector('.ui16-name').textContent.trim()}; })()""")
    ok(r['bg'] == 'meadow' and r['bd'] == 'plain' and r['ft'] == 'classic' and not r['inj'] and r['name'] == '<i>Eve</i>', f'an unknown or hostile look id draws the default; the name is text {r}')
    await done(pg)
    # your side of the versus opener, and your co-op seat
    pg = await W.fresh(b, url, w, extra_init="localStorage.setItem('bramblewood_avatar', JSON.stringify({character:'fox', color:'violet', title:'newcomer', bg:'dusk', border:'vine', font:'poster', prefix:'brave', suffix:'bold'}));")
    await open_vs(pg, 'me', '20-A-2')
    r = await pg.evaluate("(()=>{ const me = document.querySelector('.vs-opener .vs-me'); return me && {bd: me.dataset.ui16Border, ft: me.dataset.ui16Font, name: me.querySelector('.vs-name').textContent.trim(), color: getComputedStyle(me).borderTopColor}; })()")
    ok(r and r['bd'] == 'vine' and r['ft'] == 'poster' and r['name'] == 'Brave ' + (r['name'].split(' ', 1)[1] if r else '') and r['name'].endswith('the Bold') and r['color'] == 'rgb(127, 208, 106)', f'your side of the versus card: your border, font and name {r}')
    await pg.screenshot(path=shot('n1-vs-opener-mine', w))
    await done(pg)
    pg = await W.fresh(b, url, w, extra_init="localStorage.setItem('bramblewood_avatar', JSON.stringify({character:'fox', color:'violet', title:'newcomer', bg:'dusk', border:'vine', font:'poster', prefix:'brave', suffix:'bold'}));")
    await pg.add_style_tag(content=NOTOAST)
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ deckSizeOkOrWarn = ()=> true; adminModeEnabled = true; try{ const s = settleEnergy(); s.current = 60; saveEnergyState(s); }catch(e){} switchTab('play'); playSubTab = 'dungeons'; renderPlay(); await W(300);
      gdCreate(true); await W(700); const s = document.querySelector('#gdOverlay .gd-seat.is-me'); return s && {cls: s.className, bg: s.dataset.ui16Bg, bd: s.dataset.ui16Border, name: s.querySelector('.ui16-name').textContent.trim(), av: !!s.querySelector('.ui16-seat-av .bw-avatar'), bgImg: getComputedStyle(s).backgroundImage.slice(0, 30)}; })()""")
    ok(r and r['bg'] == 'dusk' and r['bd'] == 'vine' and r['name'].startswith('Brave') and r['av'] and 'gradient' in r['bgImg'], f'your co-op seat wears your card {r}')
    await pg.screenshot(path=shot('n1-coop-seat', w))
    await done(pg)

PARTS = {'n9': n9, 'n10': n10, 'n1': n1}

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--width', default='1366,390'); ap.add_argument('--only', default='')
    a = ap.parse_args(); httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    parts = [p for p in a.only.split(',') if p] or list(PARTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in [int(x) for x in a.width.split(',')]:
            for k in parts:
                try: await PARTS[k](b, url, w)
                except Exception as e: ok(False, f'{k} at {w} raised {str(e)[:300]}')
        await b.close()
    print('\nFAILED: %d' % len(fails) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
