#!/usr/bin/env python3
"""Exports every deck in the game (tutorial, skirmish, raid) and the tutorial order to docs/balance/decks.json,
for the hub's 🃏 Decks tab (2026-10-12, user: "In our artefact list the ALL tuts and skirmish decks / raid decks. Then also
list all tutorials we have and in what order"). Run from the repo root after building index.html."""
import asyncio, json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tests', 'e2e'))
from playwright.async_api import async_playwright
EXE = '/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None
JS = r"""(()=>{
  const defs = getCardDefs(), out = {tutorial:{}, maps:[], raids:[], order:{}};
  const card = id=>{ const d = defs[id] || {}; return {id, name: d.name || id, atk: d.attack, hp: d.health, wait: d.wait||0, cost: d.cost||0, skills: Object.keys(d.effects||{}).filter(k=> k!=='triggers'), rarity: d.rarity||'common'}; };
  const deck = c=> Object.entries(c||{}).map(([id, n])=> Object.assign(card(id), {n}));
  for(const pick of ['otters','hummingbirds','both']){ out.tutorial[pick] = [1,2].map(st=>{ const D = tutorialDecksFor(st, pick); return {part: st, mine: deck(D.mine), rival: deck(D.rival), keep: tutorialKeepSkills(st), highlight: tutorialHighlightId(st, pick)}; }); }
  out.tutorialCfg = {myHp: tutorialCfg.myHp, rivalHp: tutorialCfg.rivalHp, handSize: tutorialCfg.handSize, rewards: tutorialRewardIds().map(id=> (defs[id]||{}).name || id)};
  mainConquestMaps().concat(CONQUEST_MAPS.filter(m=> !mainConquestMaps().includes(m))).forEach(m=>{
    const nodes = (m.nodes||[]).filter(n=> n.kind !== 'tutorial' && n.deck && Object.keys(n.deck).length).map(n=> ({key:n.key, name:n.name, kind:n.kind, hq:n.hqHp, deck: deck(n.deck), rating: (()=>{ try{ return enemyDeckLevel(n); }catch(e){ return null; } })()}));
    if(nodes.length) out.maps.push({id:m.id, num: mapNumberOf(m.id), name:m.name, nodes});
  });
  const raids = (typeof getRaidDefs==='function' ? getRaidDefs() : RAID_DEFS_BASE); (Array.isArray(raids) ? raids : Object.values(raids)).forEach(r=>{
    const st = currentRaidStateFor(r);
    out.raids.push({id:r.id, name:r.name, parts: (r.parts||[]).map(p=>{ let f = null; try{ f = RaidM.fightFor(r, st, p.id); }catch(e){} return {name:p.name, castle: f && f.castleHp, rounds: f && f.rounds, deck: deck(f && f.deck)}; }),
      allies: Object.entries(r.allyDecks||{}).map(([k, d])=> (d && d.deck ? {name: d.name || k, deck: deck(d.deck)} : {name:k, deck: deck(d)}))});
  });
  out.order.guided = GUIDED_STEPS.map(g=> ({id:g.id, part:g.stage||1, kind: g.block ? 'blocks until Next' : g.action ? 'waits for the action' : 'tip', when: g.when ? String(g.when).replace(/^m=>\s*/, '') : 'at once', text: guidedStepText(g)}));
  out.order.dialogues = ['tutorialLeaderJoin (part 2 start)','tut_traveller_cheer (part 1, enemy castle under 40%)','tut_fly / tut_boomerang (part 2, first flyer or boomerang of yours)','training_wheels_off (part 2 won)','both_peace (part 2 won, picked both)'];
  out.order.after = ['go-tutorial2: a pointer on the map at Tutorial II after part 1', 'leader-slot: the leader slot explained when it fades in (part 2)', 'g-peek: from your 2nd match, rest on the toughest enemy card', 'rank lessons F, E, A, S, SS, SSS: first time each rank is earned', 'unlock_phyla: in the Codex once Map 12 is reached'];
  out.order.passive = (()=>{ const m0 = matchState; try{ matchState = {players:{1:{hand:[], row:{left:[],center:[],right:[]}}, 2:{row:{left:[],center:[],right:[]}}}, mode:'tutorial'}; return passiveTipCandidates().map(t=> ({id:t.id, text:(t.text||'').slice(0, 160)})); }catch(e){ return [{id:'error', text:String(e)}]; } finally{ matchState = m0; } })();
  return out; })()"""
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        pg = await b.new_page()
        await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');")
        await pg.goto('file://' + os.path.join(ROOT, 'index.html')); await pg.wait_for_timeout(2000)
        data = await pg.evaluate(JS)
        await b.close()
    path = os.path.join(ROOT, 'docs', 'balance', 'decks.json')
    with open(path, 'w', encoding='utf-8') as f: json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print('decks:', len(data['maps']), 'maps,', sum(len(m['nodes']) for m in data['maps']), 'fights,', len(data['raids']), 'raids ->', path)
asyncio.run(run())
