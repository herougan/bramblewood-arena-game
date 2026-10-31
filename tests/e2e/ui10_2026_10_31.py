#!/usr/bin/env python3
"""Package UI10 (2026-10-31, owner EE1-EE8, AUTH1 / CC1 / DD5): browser checks, shots in tests/e2e/shots/ui10/.
    python3 tests/e2e/ui10_2026_10_31.py [--page index.html] [--width 1366] [--only ee8,ee3,...]
EE8  card editor Swarm row: one type dropdown ("Type" first = plain Swarm), a pick applies at once and the "Counts <Type>" text follows, no "x N" box (an old swarmN is kept).
EE3  no toast when a fight starts with a reference deck.        EE7  a reference deck fights with its own leader (and bramble when the set names one).
EE2  one skirmish per map (N-SK): My deck or a reference set vs a random BPRO deck of the map; 1 in 4 draws swaps a card for a SPECIAL card (size and copy caps kept).
EE1  Quests: no top summary, a finished notice is the claim button, no "In progress", NEW! until hovered / clicked (remembered).
EE6  Ambush echo rings on the 👀 pip (3 / 2 on Low / none on None and reduced motion).
EE4  flyers (Bee Forager, Honey Bee) draw at the full board width; no tile narrower than its neighbours; the opt-in board-mini mode.
EE5  Admin's Rejected art list (art, name, comment, link); the rejection reaches card_overrides for a cloud admin.
AUTH1 Google's own button (stubbed google + sbClient): renders, the callback calls signInWithIdToken with the raw nonce, "Other sign-in" and the script-failure fallback use the redirect.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui10'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()
def shot(name, w): return os.path.join(SHOTS, f'{name}-{w}.png')

# ---------------------------------------------------------------- EE8
async def ee8(b, url, w):
    print(f'-- EE8: card editor Swarm row ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; openCardEditor('tunnel-ant'); })()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""(()=>{ const sel = document.querySelector('#skillRows select[data-sk="vals"], #evergreenRows select[data-sk="vals"]'); if(!sel) return null;
      const row = sel.closest('.skill-row'); return {multiple: sel.multiple, first: sel.options[0].textContent.trim(), firstVal: sel.options[0].value, n: row.querySelectorAll('input[type="number"][data-sk="valN"]').length, visN: [...row.querySelectorAll('[data-sk="valN"]')].filter(e=> e.type !== 'hidden').length,
        hint: row.querySelector('.skill-types-hint').textContent, second: sel.options[1].value, x: !!row.querySelector('.skill-n')}; })()""")
    ok(r is not None, 'the Swarm row has the type dropdown')
    if r is None: await done(pg); return
    ok(not r['multiple'] and r['first'] == 'Type' and r['firstVal'] == '', f'one dropdown, first entry "Type" = plain Swarm {r}')
    ok(r['visN'] == 0 and r['n'] == 0 and not r['x'], 'no "x N" box')
    await pg.screenshot(path=shot('ee8-before-pick', w))
    typ = r['second']
    await pg.select_option('#skillRows select[data-sk="vals"], #evergreenRows select[data-sk="vals"]', typ); await pg.wait_for_timeout(200)
    hint = await pg.evaluate("document.querySelector('.skill-types-hint').textContent")
    ok(hint == 'Counts ' + typ, f'"Counts <Type>" updates as you pick ({hint!r})')
    await pg.evaluate("renderEditor()"); await pg.wait_for_timeout(400)   # a re-render of the editor (as any other change makes) must keep the pick
    v = await pg.evaluate("document.querySelector('#skillRows select[data-sk=\"vals\"], #evergreenRows select[data-sk=\"vals\"]').value")
    ok(v == typ, f'the pick applies at once, it stays after the editor redraws ({v!r})')
    sw = await pg.evaluate("(()=>{ readEditorFormIntoCard(); return {swarm: editingCard.effects.swarm, n: editingCard.effects.swarmN}; })()")
    ok(sw['swarm'] == [typ] and sw['n'] == 2, f'saved as swarm: [type]; the old swarmN (2) is kept {sw}')
    await pg.screenshot(path=shot('ee8-after-pick', w))
    await pg.evaluate("openCardEditor('tunnel-ant')"); await pg.wait_for_timeout(600)   # (reading the form ends an edit; open the card again, then pick "Type")
    await pg.select_option('#skillRows select[data-sk="vals"], #evergreenRows select[data-sk="vals"]', typ); await pg.wait_for_timeout(150)
    await pg.select_option('#skillRows select[data-sk="vals"], #evergreenRows select[data-sk="vals"]', ''); await pg.wait_for_timeout(150)
    hint = await pg.evaluate("document.querySelector('.skill-types-hint').textContent")
    sw = await pg.evaluate("(()=>{ readEditorFormIntoCard(); return editingCard.effects.swarm; })()")
    ok(hint == 'Any shared type' and sw is True, f'"Type" = plain Swarm (effects.swarm = true) {hint!r} {sw!r}')
    await done(pg)

# ---------------------------------------------------------------- EE3, EE7
async def ee37(b, url, w):
    print(f'-- EE3 / EE7: reference deck fights ({w})')
    pg = await W.fresh(b, url, w)
    r = await pg.evaluate("""(async ()=>{ adminModeEnabled = true; const toasts = []; const st = window.showToast; window.showToast = (t, k)=>{ toasts.push(String(t)); };
      const out = {}; switchTab('play');
      const run = async (set, patch)=>{ if(matchState) endMatch(); if(patch) patch(); const ok = startConquestMatch('mf', '1-1', {skipEnergyCost: true, noAmbush: true, noOpener: true, refSet: set}); await new Promise(r=> setTimeout(r, 300)); return {ok, ref: matchState && matchState.refDeck, leader: matchState && matchState.leaderDefId, hp: matchState && matchState.players[1].hq.maxHp}; };
      out.prog = await run('prog'); out.toastsProg = toasts.slice(); toasts.length = 0;
      out.ref2 = await run('ref2');
      const ids = Object.keys(CHARACTER_DEFS).filter(id=> id !== myCharacterId); const mine = (await run('my')).hp;
      const alt = ids.map(id=> ({id, hp: brambleChar(castleLeveled(CHARACTER_DEFS[id], castleLevelOf(id))).health})).find(x=> x.hp !== mine);
      REF_DECK_SETS.ref2.bramble = alt.id; out.ref2b = await run('ref2'); out.alt = alt; out.mine = mine; delete REF_DECK_SETS.ref2.bramble;
      out.toasts = toasts.slice(); window.showToast = st; return out; })()""")
    ok(r['prog']['ok'] and r['prog']['ref'] and r['prog']['ref'].get('set') == 'prog', f"a Reference (Random) fight started {r['prog']['ref']}")
    ok(not any('🎯' in t or 'reference' in t.lower() for t in r['toastsProg'] + r['toasts']), f"EE3: no toast when a reference deck is dealt {r['toasts'] + r['toastsProg']}")
    ok(r['ref2']['leader'] == 'old-willow-of-the-ford', f"EE7: Reference-2 fights with its own leader ({r['ref2']['leader']})")
    ok(r['prog']['leader'] is None, f"EE7: a set without a leader fights without yours ({r['prog']['leader']})")
    ok(r['ref2b']['hp'] == r['alt']['hp'] and r['alt']['hp'] != r['mine'], f"EE7: a set that names a bramble fights with it (Health {r['ref2b']['hp']} vs yours {r['mine']})")
    await done(pg)

# ---------------------------------------------------------------- EE2
async def ee2(b, url, w):
    print(f'-- EE2: one skirmish per map ({w})')
    pg = await W.fresh(b, url, w)
    r = await pg.evaluate("""(()=>{ adminModeEnabled = true; const ents = proMapEntries(), ids = Object.keys(ents), per = ids.map(id=> proEntriesOf(ents[id]).length), keys = ids.map(id=> proEntriesOf(ents[id])[0] && proEntriesOf(ents[id])[0].id);
      const html = proFightsAdminHTML(); const leg = findProFight('1-BPRO-2'), leg2 = findProFight('1-REF');
      return {maps: ids.length, bad: per.filter(n=> n > 1).length, sample: keys.slice(0, 6), pro: [...html.matchAll(/class="pro-id">([^<]*)</g)].some(m=> /BPRO|-PRO-|-REF/.test(m[1])), legacy: leg && leg.node.key, legacy2: leg2 && leg2.node.key, rows: (html.match(/class="pro-row"/g) || []).length}; })()""")
    ok(r['maps'] > 20 and r['bad'] == 0, f"every map has one skirmish entry {r['sample']}")
    ok(not r['pro'] and r['rows'] <= r['maps'], f"Admin's list has no separate PRO / BPRO / X-REF entries ({r['rows']} rows)")
    ok(r['legacy'] == '1-SK' and r['legacy2'] == '1-SK', f"an old PRO / BPRO / REF link opens the map's skirmish ({r['legacy']}, {r['legacy2']})")
    d = await pg.evaluate("""(()=>{ const ents = proMapEntries(); const out = {withSp: 0, tested: 0};
      const defs = getCardDefs(); let chosen = null;
      for(const id of Object.keys(ents)){ const ent = ents[id], e = proEntriesOf(ent)[0]; if(!e) continue; const sp = (mpEntry(mpTopOf(id)).special || []).filter(x=> defs[x]); if(sp.length){ chosen = {id, ent, e, sp}; break; } }
      if(!chosen) return {none: true};
      const {id, e, sp} = chosen, N = 4000, pool = new Set(e.decks.flatMap(d=> Object.keys(d.deck))); let swaps = 0, sizeBad = 0, capBad = 0, notInList = 0, spBad = 0;
      for(let i = 0; i < N; i++){ const p = drawSkirmEnemy(id, e), orig = e.decks.find(d=> d.id === p.id), size = x=> Object.values(x).reduce((a, b)=> a + b, 0);
        if(size(p.deck) !== size(orig.deck)) sizeBad++; if(Object.values(p.deck).some(n=> n > 4)) capBad++;
        if(p.special){ swaps++; if(!sp.includes(p.special)) spBad++; Object.keys(p.deck).forEach(k=>{ if(k !== p.special && !pool.has(k)) notInList++; }); } else if(JSON.stringify(Object.entries(p.deck).sort()) !== JSON.stringify(Object.entries(orig.deck).sort())) notInList++; }
      return {id, N, rate: swaps / N, sizeBad, capBad, notInList, spBad, nDecks: e.decks.length}; })()""")
    ok(not d.get('none'), 'a map with a SPECIAL list exists')
    ok(0.2 < d['rate'] < 0.3, f"1 in 4 draws holds a SPECIAL card (rate {d['rate']:.3f} on {d['id']}, {d['nDecks']} decks)")
    ok(d['sizeBad'] == 0 and d['capBad'] == 0 and d['spBad'] == 0 and d['notInList'] == 0, f"deck size and copy caps kept, only the map's list and its SPECIAL cards {d}")
    nosp = await pg.evaluate("""(()=>{ const ents = proMapEntries(); const defs = getCardDefs(); for(const id of Object.keys(ents)){ const e = proEntriesOf(ents[id])[0]; if(!e) continue; if(!(mpEntry(mpTopOf(id)).special || []).filter(x=> defs[x]).length){ let n = 0; for(let i = 0; i < 400; i++) if(drawSkirmEnemy(id, e).special) n++; return {id, n}; } } return null; })()""")
    ok(nosp is None or nosp['n'] == 0, f'a map with no SPECIAL card never swaps ({nosp})')
    # the panel and the fight
    await pg.evaluate("adminModeEnabled = true"); await pg.evaluate(V.OPEN, ['mf', '1-1']); await pg.wait_for_timeout(300)   # every road fight cleared, so the map is open
    await pg.evaluate("(()=>{ conquestWorldView = false; pl2ProPreview('1-SK'); })()"); await pg.wait_for_timeout(1200)
    p = await pg.evaluate("""(()=>{ const pn = document.getElementById('conquestNodePanel'); const sel = pn && pn.querySelector('select[data-skirm-you]'); if(!sel) return null;
      const deck = pn.querySelector('.cnp-deck'); return {opts: [...sel.options].map(o=> o.textContent.trim()), val: sel.value, deckHidden: !deck || getComputedStyle(deck).display === 'none', enemy: (pn.querySelector('.skirm-enemy')||{}).textContent, cls: pn.className}; })()""")
    ok(p is not None, 'the skirmish panel has "You play" with My deck / reference sets')
    if p:
        ok(p['opts'][0] == 'My deck' and len(p['opts']) > 2 and p['val'] == 'my', f"My deck first, then the reference decks {p['opts'][:4]}")
        ok(p['deckHidden'] and 'random deck' in (p['enemy'] or ''), f"the enemy is described as a random deck, no fixed deck strip ({p['enemy']!r})")
    await pg.screenshot(path=shot('ee2-panel', w))
    f1 = await pg.evaluate("""(async ()=>{ const ent = proEntriesOf(proMapEntries().mf)[0]; document.getElementById('cnpFightBtn').click(); await new Promise(r=> setTimeout(r, 900));
      const m = matchState; if(!m) return null; const ids = new Set(ent.decks.flatMap(d=> Object.keys(d.deck))); const en = m.players[2].deck.concat(m.players[2].hand.map(h=> h.defId || h));
      return {key: m.proFight, ref: m.refDeck || null, skirm: m.skirm, enemyOk: en.every(x=> ids.has(String(x).split('@')[0]) || (m.skirm && m.skirm.special === String(x).split('@')[0])), n: en.length, adminTest: m.adminTest}; })()""")
    ok(f1 is not None and f1['key'] == '1-SK' and f1['ref'] is None and f1['skirm'], f'"My deck" vs a random BPRO deck: {f1}')
    ok(f1 is not None and f1['enemyOk'], 'the enemy holds only cards of the map list (or its one SPECIAL card)')
    await pg.evaluate("(()=>{ endMatch(); setSkirmYou('ref2'); })()")
    f2 = await pg.evaluate("""(async ()=>{ startProFight('1-SK'); await new Promise(r=> setTimeout(r, 900)); const m = matchState; return m && {ref: m.refDeck && m.refDeck.set, leader: m.leaderDefId, key: m.proFight}; })()""")
    ok(f2 is not None and f2['ref'] == 'ref2' and f2['key'] == '1-SK', f'a reference deck vs the same kind of enemy {f2}')
    await pg.evaluate("setSkirmYou('my')")
    await done(pg)

# ---------------------------------------------------------------- EE1
async def ee1(b, url, w):
    print(f'-- EE1: Quests ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; try{ localStorage.removeItem('bramblewood_quest_seen_v1'); }catch(e){} openQuestsModal('notices'); })()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""({summary: !!document.querySelector('.qn-quests'), daily: !!document.querySelector('.qn-daily'), weekly: !!document.querySelector('.qn-weekly'), btn: document.querySelectorAll('.qn-claim').length,
      prog: /In progress/.test(document.querySelector('.quests-modal').textContent), news: document.querySelectorAll('.qn-new').length, notes: document.querySelectorAll('.qn-note').length, tab: [...document.querySelectorAll('.qn-tab')].map(t=> t.textContent.trim())})""")
    ok(not r['summary'], 'the top summary section ("Your dailies") is gone')
    ok(r['daily'] and r['weekly'], 'Daily and Weekly stay')
    ok(r['btn'] == 0 and not r['prog'], f'no claim button, no "In progress" text {r}')
    ok(r['news'] > 0, f"new quests say NEW! ({r['news']} of {r['notes']})")
    await pg.screenshot(path=shot('ee1-quests-before-hover', w))
    first = await pg.evaluate("document.querySelector('.qn-note .qn-new') && document.querySelector('.qn-note .qn-new').dataset.newFor")
    await pg.hover('.qn-note:has(.qn-new)'); await pg.wait_for_timeout(300)
    left = await pg.evaluate("[document.querySelectorAll('.qn-new').length, JSON.parse(localStorage.getItem('bramblewood_quest_seen_v1') || '[]')]")
    ok(left[0] == r['news'] - 1 and first in left[1], f'hover clears that quest\'s NEW! and remembers it ({left})')
    await pg.evaluate("openQuestsModal()"); await pg.wait_for_timeout(500)
    ok(await pg.evaluate("document.querySelectorAll('.qn-new').length") == r['news'] - 1, 'it stays cleared when the board opens again')
    # click clears too
    await pg.evaluate("document.querySelector('.qn-note:has(.qn-new)').click()"); await pg.wait_for_timeout(200)
    ok(await pg.evaluate("document.querySelectorAll('.qn-new').length") == r['news'] - 2, 'a click clears it as well')
    # a finished notice is the claim button
    c = await pg.evaluate("""(async ()=>{ const q = loadQuestState(); const x = q.dailyList[0]; window.dailyNoticeProgress = (qq, n)=> n.id === x.id ? n.goal : 0; openQuestsModal(); await new Promise(r=> setTimeout(r, 500));
      const note = document.querySelector('.qn-note.is-ready'); if(!note) return null; const info = {role: note.getAttribute('role'), cid: note.dataset.claimId === x.id, btn: note.querySelectorAll('button.qn-claim').length, hint: !!note.querySelector('.qn-claimhint')};
      note.click(); await new Promise(r=> setTimeout(r, 700)); info.claimed = loadQuestState().claimedDaily.includes(x.id); return info; })()""")
    ok(c is not None and c['role'] == 'button' and c['cid'] and c['btn'] == 0 and c['claimed'], f'clicking the finished notice claims it (no separate button) {c}')
    await pg.screenshot(path=shot('ee1-quests-after', w))
    e = await pg.evaluate("""(async ()=>{ const t = ERRAND_TEMPLATES[0]; acceptErrand(t.id); const act = loadErrands().active[0]; noticesSubTab = 'errands'; openQuestsModal('errands'); await new Promise(r=> setTimeout(r, 500));
      const w0 = document.querySelector('.er-writ'); const before = {status: w0.querySelector('.er-status').textContent.trim(), news: document.querySelectorAll('.er-writ .qn-new').length, seal: document.querySelectorAll('.er-seal').length};
      window.errandProgress = x=> x.goal; openQuestsModal('errands'); await new Promise(r=> setTimeout(r, 500)); const w1 = document.querySelector('.er-writ.is-ready'); const after = {seal: document.querySelectorAll('.er-seal').length, role: w1 && w1.getAttribute('role')};
      const grant = window.grantCurrency; w1.click(); await new Promise(r=> setTimeout(r, 700)); after.gone = loadErrands().active.length === 0; return {before, after}; })()""")
    ok(e['before']['status'] == '' and e['before']['news'] == 1 and e['before']['seal'] == 0, f"a taken quest: no \"In progress\", NEW!, no seal button {e['before']}")
    ok(e['after']['seal'] == 0 and e['after']['role'] == 'button' and e['after']['gone'], f"a finished quest writ is claimed by clicking it {e['after']}")
    await done(pg)

# ---------------------------------------------------------------- EE6
async def ee6(b, url, w):
    print(f'-- EE6: Ambush echo ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(V.BOARD + "([['tunnel-ant', 0, 9]], [['otter-kit', 0, 9]])"); await pg.wait_for_timeout(400)
    pip = await pg.evaluate("(()=>{ const c = document.querySelector('#rowMine .board-card:not(.empty-slot)'); return !!c.querySelector('.ab-sk[data-sk=\"ambush\"]') || c.querySelector('.badges') && c.querySelector('.badges').textContent; })()")
    ok(pip is True, f'the 👀 Ambush pip is on the card {pip!r}')
    q = """(async ()=>{ const c = document.querySelector('#rowMine .board-card:not(.empty-slot)'); const n = ambushEcho(c); const rings = [...document.querySelectorAll('.ambush-echo-ring')];
      const p = c.querySelector('.ab-sk[data-sk="ambush"]').getBoundingClientRect(), r = rings[0] && rings[0].getBoundingClientRect();
      const ms = rings.map(e=> e.getAnimations()[0] && e.getAnimations()[0].effect.getTiming().duration);
      const near = r ? Math.abs((r.left + r.width / 2) - (p.left + p.width / 2)) < 30 && Math.abs((r.top + r.height / 2) - (p.top + p.height / 2)) < 30 : false;
      await new Promise(x=> setTimeout(x, 1500)); return {n, ms, near, left: document.querySelectorAll('.ambush-echo-ring').length}; })()"""
    for lvl, n, dur in (('high', 3, 600), ('low', 2, 400), ('none', 0, None)):
        await pg.evaluate(f"localStorage.setItem('bramblewood_fx_level', '{lvl}')")
        res = await pg.evaluate(q)
        ok(res['n'] == n and (dur is None or all(abs(m - dur) < 5 for m in res['ms'])), f'Effects {lvl}: {n} rings' + (f', {dur} ms' if dur else '') + f' {res}')
        if n: ok(res['near'] and res['left'] == 0, 'the rings start on the pip and are gone afterwards')
    await pg.evaluate("localStorage.setItem('bramblewood_fx_level', 'high')")
    # the real hit path calls it
    hit = await pg.evaluate("""(async ()=>{ let called = 0; const o = window.ambushEcho; window.ambushEcho = el=>{ called++; return o(el); };
      const a = document.querySelector('#rowMine .board-card:not(.empty-slot)'), t = document.querySelector('#rowEnemy .board-card:not(.empty-slot)'); const uidA = a.dataset.uid;
      try{ keywordCuesForHit({type: 'hit', ambush: true, attUid: +uidA, attDefId: 'tunnel-ant', targetDefId: 'otter-kit', dmg: 3}, a, t); }catch(e){ return {err: String(e)}; }
      await new Promise(r=> setTimeout(r, 1200)); window.ambushEcho = o; return {called}; })()""")
    ok(hit.get('called') == 1, f'an Ambush strike plays the echo {hit}')
    await pg.screenshot(path=shot('ee6-board', w)); await done(pg)
    pg = await W.fresh(b, url, w, '', reduced_motion='reduce')
    await pg.evaluate(V.BOARD + "([['tunnel-ant', 0, 9]], [['otter-kit', 0, 9]])"); await pg.wait_for_timeout(400)
    n = await pg.evaluate("ambushEcho(document.querySelector('#rowMine .board-card:not(.empty-slot)'))")
    ok(n == 0, f'reduced motion: no rings ({n})'); await done(pg)

# ---------------------------------------------------------------- EE4
async def ee4(b, url, w):
    print(f'-- EE4: flyers at full width ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(V.BOARD + "([['bee-forager', -1, 9], ['honey-bee', 0, 9], ['otter-kit', 1, 9]], [['bee-forager', -1, 9], ['honey-bee', 0, 9], ['otter-kit', 1, 9], ['honey-bee', 2, 9]])"); await pg.wait_for_timeout(500)
    chk = """(()=>{ const rows = ['#rowEnemy', '#rowMine'].map(sel=> [...document.querySelectorAll(sel + ' .board-card:not(.empty-slot)')].map(c=>{ const t = c.querySelector('.card-tile'); return {id: t && t.dataset.defid, card: c.getBoundingClientRect().width, tile: t ? t.getBoundingClientRect().width : 0, fly: c.classList.contains('is-flying')}; }));
      return {rows, flat: rows.flat()}; })()"""
    r = await pg.evaluate(chk)
    flyers = [x for x in r['flat'] if x['fly']]
    ok(len(flyers) >= 4, f'flyers on the board ({len(flyers)})')
    ok(all(x['tile'] >= x['card'] * 0.95 for x in r['flat']), f"every tile fills its board slot: {[(x['id'], round(x['tile']), round(x['card'])) for x in r['flat']]}")
    ok(all(min(x['tile'] for x in row) >= 0.95 * max(x['tile'] for x in row) for row in r['rows'] if row), 'no card has a narrower board tile than its neighbours')
    await pg.screenshot(path=shot('ee4-after', w))
    await pg.evaluate("document.querySelectorAll('.board-card > .fly-body > .card-tile').forEach(t=> t.style.width = '64px')"); await pg.wait_for_timeout(100)
    await pg.screenshot(path=shot('ee4-before-simulated', w))
    bad = await pg.evaluate(chk)
    ok(not all(min(x['tile'] for x in row) >= 0.95 * max(x['tile'] for x in row) for row in bad['rows'] if row), '(the check itself fails on the old 64px flyer tiles)')
    await pg.evaluate("document.querySelectorAll('.board-card > .fly-body > .card-tile').forEach(t=> t.style.width = '')")
    ok(not await pg.evaluate("document.getElementById('appWrap').classList.contains('board-mini')"), 'the mini board size is off by default')
    await pg.evaluate("localStorage.setItem('bramblewood_board_mini_v1', '1'); renderMatchUI();"); await pg.wait_for_timeout(500)
    m = await pg.evaluate("""(()=>{ const c = document.querySelector('#rowMine .board-card.is-flying'), t = c.querySelector('.card-tile'), bd = t.querySelector('.badges, .badges-bottom'); return {cls: document.getElementById('appWrap').classList.contains('board-mini'), ratio: t.getBoundingClientRect().width / c.getBoundingClientRect().width, scale: bd ? getComputedStyle(bd).scale : null, otter: (()=>{ const o = document.querySelector('#rowMine .board-card:not(.is-flying):not(.empty-slot)'); return o.querySelector('.card-tile').getBoundingClientRect().width / o.getBoundingClientRect().width; })()}; })()""")
    ok(m['cls'] and 0.4 < m['ratio'] < 0.6 and 0.4 < m['otter'] < 0.6, f'board-mini: cards at half width {m}')
    ok(m['scale'] in ('0.8', '0.8 0.8', None) , f"board-mini: pips and labels at 80% (scale {m['scale']})")
    await pg.screenshot(path=shot('ee4-mini', w))
    await pg.evaluate("localStorage.removeItem('bramblewood_board_mini_v1')")
    await done(pg)

# ---------------------------------------------------------------- EE5
async def ee5(b, url, w):
    print(f'-- EE5: Rejected art list ({w})')
    pg = await W.fresh(b, url, w)
    r = await pg.evaluate("""(async ()=>{ adminModeEnabled = true; window.__rows = []; cloudCardAdmin = true; cloudUserId = cloudUserId || 'test-admin';
      sbClient = {from: t=> ({upsert: async row=>{ window.__rows.push({t, row: JSON.parse(JSON.stringify(row))}); return {error: null}; })}), auth: {}};
      await saveArtReview('bee-forager', true, 'wings look wrong'); await saveArtReview('honey-bee', true, 'too dark: redo with a meadow');
      switchTab('admin'); await new Promise(r=> setTimeout(r, 800)); const p = document.getElementById('adminRejectedArt'); if(!p) return null;
      const rows = [...p.querySelectorAll('.ra-row')].map(x=> ({id: x.dataset.raId, name: x.querySelector('.ra-name').textContent, comment: x.querySelector('.ra-comment').textContent, art: !!x.querySelector('.card-tile'), link: !!x.querySelector('[data-ra-open]')}));
      return {rows, up: window.__rows.filter(x=> x.t === 'card_overrides').map(x=> ({id: x.row.id, reason: x.row.data && x.row.data.artReview && x.row.data.artReview.reason}))}; })()""")
    ok(r is not None, 'Admin has a Rejected art panel')
    if r is None: await done(pg); return
    names = {x['id']: x for x in r['rows']}
    ok('bee-forager' in names and names['bee-forager']['comment'] == 'wings look wrong' and names['bee-forager']['name'] == 'Bee Forager' and names['bee-forager']['art'] and names['bee-forager']['link'], f"it lists the card's art, name, comment and a link {r['rows']}")
    ok(any(x['id'] == 'honey-bee' and x['reason'] == 'too dark: redo with a meadow' for x in r['up']) and any(x['id'] == 'bee-forager' and x['reason'] == 'wings look wrong' for x in r['up']), f"each rejection is written to card_overrides (data.artReview) for a cloud admin {r['up']}")
    await pg.evaluate("document.getElementById('adminRejectedArt').scrollIntoView()"); await pg.wait_for_timeout(300)
    await pg.screenshot(path=shot('ee5-rejected-art', w))
    await pg.click('[data-ra-open="bee-forager"]'); await pg.wait_for_timeout(900)
    ed = await pg.evaluate("typeof editingCard !== 'undefined' && editingCard && editingCard.id")
    ok(ed == 'bee-forager', f'the link opens the card in the editor ({ed})')
    await done(pg)

# ---------------------------------------------------------------- AUTH1
GSI_STUB = """window.google = {accounts: {id: {initialize: cfg=>{ window.__gsiCfg = cfg; }, renderButton: (host, opts)=>{ window.__gsiOpts = opts; host.innerHTML = '<div class="g-stub-btn" role="button" style="height:44px;width:240px;background:#fff;color:#000;border-radius:22px;display:flex;align-items:center;justify-content:center">Sign in with Google (stub)</div>'; }}}};"""
SB_STUB = """(()=>{ window.__calls = []; sbClient = {auth: {signInWithIdToken: async a=>{ window.__calls.push(['idtoken', a]); return {data: {}, error: null}; }, signInWithOAuth: async a=>{ window.__calls.push(['oauth', a]); return {data: {}, error: null}; }}}; })()"""
async def auth1(b, url, w):
    print(f'-- AUTH1: Google Identity Services sign-in ({w})')
    # A: the script loads (stubbed)
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700)); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    hits = []
    async def gsi(route):
        hits.append(route.request.url); await route.fulfill(status=200, content_type='application/javascript', body=GSI_STUB)
    await ctx.route('https://accounts.google.com/gsi/client', gsi)
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof requireSignIn === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    ok(len(hits) == 0 and not await pg.evaluate("!!document.querySelector('script[src*=\"accounts.google.com/gsi\"]')"), 'the Google script is not loaded before a sign-in screen is drawn')
    await pg.evaluate(SB_STUB)
    await pg.evaluate("requireSignIn('to test', ()=>{})"); await pg.wait_for_selector('.g-stub-btn', timeout=15000); await pg.wait_for_timeout(300)
    ok(len(hits) == 1, f'the script loads when the sign-in screen opens ({len(hits)} request)')
    c = await pg.evaluate("""(async ()=>{ const cfg = window.__gsiCfg; const link = document.getElementById('authGateGoogleBtn'); const old = [...document.querySelectorAll('.gsi-btn')].filter(e=> e.offsetParent).length;
      return {id: cfg.client_id, nonce: cfg.nonce, hex: /^[0-9a-f]{64}$/.test(cfg.nonce), btn: !!document.querySelector('#authGateGsiHost .g-stub-btn'), link: link && link.textContent.trim(), linkVisible: link && link.offsetParent !== null, oldBig: old, cb: typeof cfg.callback}; })()""")
    ok(c['id'] == '871693115882-bhdr13re9l3ejo9c6alsh81nms45uk68.apps.googleusercontent.com' and c['hex'] and c['btn'], f"Google's button renders; client ID and a hashed nonce passed to initialize {c['id'][:12]}...")
    ok(c['link'] == 'Other sign-in' and c['linkVisible'] and c['oldBig'] == 0, f"the redirect is a small \"Other sign-in\" link ({c['link']!r})")
    await pg.screenshot(path=shot('auth1-button', w))
    cb = await pg.evaluate("""(async ()=>{ await window.__gsiCfg.callback({credential: 'FAKE.ID.TOKEN'}); await new Promise(r=> setTimeout(r, 200)); const call = window.__calls.find(x=> x[0] === 'idtoken'); if(!call) return null; const a = call[1];
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(a.nonce)); const hex = [...new Uint8Array(buf)].map(x=> x.toString(16).padStart(2, '0')).join('');
      return {provider: a.provider, token: a.token, rawNonce: /^[0-9a-f]{32}$/.test(a.nonce), hashedMatches: hex === window.__gsiCfg.nonce, differs: a.nonce !== window.__gsiCfg.nonce}; })()""")
    ok(cb is not None and cb['provider'] == 'google' and cb['token'] == 'FAKE.ID.TOKEN', f'the callback calls signInWithIdToken({{provider: google, token}}) {cb and cb["provider"]}')
    ok(cb is not None and cb['rawNonce'] and cb['hashedMatches'] and cb['differs'], 'it passes the RAW nonce; its SHA-256 hex is what Google got')
    await pg.evaluate("window.__calls.length = 0; document.getElementById('authGateGoogleBtn').click()"); await pg.wait_for_timeout(200)
    ok(await pg.evaluate("window.__calls.map(x=> x[0]).join()") == 'oauth', '"Other sign-in" still starts the redirect sign-in (signInWithOAuth)')
    await pg.evaluate("window.__calls.length = 0; window.__gsiCfg.callback({credential: ''})"); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("window.__calls.length") == 0, 'a callback without a credential calls nothing')
    leak = await pg.evaluate("document.body.innerText.includes('FAKE.ID.TOKEN')"); ok(not leak, 'the token is not shown anywhere')
    await done(pg)
    # B: the script cannot load
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700)); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await ctx.route('https://accounts.google.com/gsi/client', lambda r: r.abort())
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof requireSignIn === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + V.OWN + " })()"); await pg.evaluate(SB_STUB)
    await pg.evaluate("requireSignIn('to test', ()=>{})"); await pg.wait_for_timeout(2500)
    f = await pg.evaluate("""(()=>{ const g = document.getElementById('authGateGoogleBtn'); const host = document.getElementById('authGateGsiHost'); return {vis: g && g.offsetParent !== null, text: g && g.textContent.trim(), big: g && g.classList.contains('gsi-btn'), hostHidden: host.hidden || host.offsetParent === null}; })()""")
    ok(f['vis'] and f['big'] and f['hostHidden'] and 'Sign in with Google' in f['text'], f'script blocked: the redirect button is the sign-in button {f}')
    await pg.screenshot(path=shot('auth1-fallback', w))
    await pg.evaluate("document.getElementById('authGateGoogleBtn').click()"); await pg.wait_for_timeout(200)
    ok(await pg.evaluate("window.__calls.map(x=> x[0]).join()") == 'oauth', 'and it uses signInWithOAuth')
    await done(pg)
    vj = json.load(open(os.path.join(ROOT, 'vercel.json')))
    csp = [h['value'] for blk in vj['headers'] for h in blk['headers'] if h['key'] == 'Content-Security-Policy-Report-Only'][0]
    d = {k.strip().split(' ')[0]: k.strip() for k in csp.split(';')}
    ok('https://accounts.google.com/gsi/client' in d['script-src'] and 'https://accounts.google.com/gsi/' in d['frame-src'] and 'https://accounts.google.com/gsi/' in d['connect-src'] and 'https://accounts.google.com/gsi/style' in d['style-src'], 'vercel.json CSP (report-only) allows accounts.google.com in script-src, frame-src, connect-src, style-src')

PARTS = {'ee8': ee8, 'ee37': ee37, 'ee2': ee2, 'ee1': ee1, 'ee6': ee6, 'ee4': ee4, 'ee5': ee5, 'auth1': auth1}
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--width', default='1366'); ap.add_argument('--only', default='')
    a = ap.parse_args(); httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    parts = [p for p in a.only.split(',') if p] or list(PARTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in [int(x) for x in a.width.split(',')]:
            for k in parts: await PARTS[k](b, url, w)
        await b.close()
    print('\nFAILED: %d' % len(fails) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
