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
  out.order.after = ['go-tutorial2: a pointer on the map at Tutorial II after part 1', 'leader-slot: the leader slot explained when it fades in (part 2)', 'g-peek: the first time an Uncommon (or rarer) enemy unit appears, rest on it to read it', 'rank lessons F, E, A, S, SS, SSS: first time each rank is earned', 'unlock_phyla: in the Codex once Map 12 is reached'];
  out.order.passive = (()=>{ const m0 = matchState; try{ matchState = {players:{1:{hand:[], row:{left:[],center:[],right:[]}}, 2:{row:{left:[],center:[],right:[]}}}, mode:'tutorial'}; return passiveTipCandidates().map(t=> ({id:t.id, text:(t.text||'').slice(0, 160)})); }catch(e){ return [{id:'error', text:String(e)}]; } finally{ matchState = m0; } })();
  // 2026-10-15 (user: "improve the master hub"): the hub's 🎴 Cards tab, global search and Master stats read this
  // (written to docs/balance/hub-cards.json, not decks.json). Labels and "where to get it" come from the game itself.
  out.hub = (()=>{
    const SK = (typeof Registry!=='undefined' && Registry.skills) ? Registry.skills() : SKILL_DEFS;
    const skills = SK.filter(s=> !s.hidden).map(s=> ({key:s.key, label:s.label || s.key, icon: (SKILL_ICON||{})[s.key] || '', cat: s.category || ''}));
    const lab = {}; skills.forEach(s=> lab[s.key] = s);
    const maps = CONQUEST_MAPS.filter(m=> !m.reserved).map(m=> ({id:m.id, num: (()=>{ try{ return mapNumberOf(m.id); }catch(e){ return null; } })(), name:m.name, sub: !!m.sub, fights: (m.nodes||[]).filter(n=> n.kind!=='tutorial').length}));
    const cards = Object.values(defs).filter(d=> d && d.id && !d.hidden).map(d=>{
      let rows = []; try{ rows = deriveSkillRows(d); }catch(e){}
      const sk = rows.filter(r=> lab[r.key]).map(r=> ({k:r.key, v: (typeof r.value==='number' ? r.value : (typeof r.n==='number' && r.n>1 ? r.n : null)), lv: r.lv || null}));
      let src = {}; try{ src = cardSourceOf(d) || {}; }catch(e){}
      let where = ''; try{ where = cardWhereToGetText(d); }catch(e){}
      let un = false; try{ un = isUnattainable(d); }catch(e){}
      // Easter eggs (2026-10-19, package EE, owner 09:52): the hub's card list shows one only as "???" (no name, numbers, skills or text)
      let egg = false; try{ egg = isEasterEgg(d); }catch(e){}
      if(egg) return {id:d.id, name:'???', icon:'🥚', r:d.rarity||'', c:0, w:0, a:0, h:0, sk:[], sp:'', ar:[], f:'', src:'easteregg', map:'', node:'', where:'Easter egg', un:true, tok:false, test:false, fl:'', egg:true};
      return {id:d.id, name:d.name, icon:d.icon||'', r:d.rarity||'', c:d.cost||0, w:d.wait||0, a:d.attack, h:d.health, sk,
        sp:(d.species||[]).join(', '), ar:(d.archetypes||[]), f:d.faction||'', src:src.kind||'', map: src.kind==='map' ? (src.id||'') : '', node: src.node||'',
        where, un, tok: !!d.token, test: !!d.test, fl: d.flavor||''};
    });
    return {skills, maps, cards};
  })();
  return out; })()"""
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        pg = await b.new_page()
        await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');")
        await pg.goto('file://' + os.path.join(ROOT, 'index.html')); await pg.wait_for_timeout(2000)
        data = await pg.evaluate(JS)
        await b.close()
    hub = data.pop('hub', None)
    path = os.path.join(ROOT, 'docs', 'balance', 'decks.json')
    with open(path, 'w', encoding='utf-8') as f: json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    if hub:  # 2026-10-15: card index for the hub (Cards tab, search, stats)
        hp = os.path.join(ROOT, 'docs', 'balance', 'hub-cards.json')
        with open(hp, 'w', encoding='utf-8') as f: json.dump(hub, f, ensure_ascii=False, separators=(',', ':'))
        print('hub cards:', len(hub['cards']), 'cards,', len(hub['skills']), 'skills,', len(hub['maps']), 'maps ->', hp)
    print('decks:', len(data['maps']), 'maps,', sum(len(m['nodes']) for m in data['maps']), 'fights,', len(data['raids']), 'raids ->', path)
asyncio.run(run())
