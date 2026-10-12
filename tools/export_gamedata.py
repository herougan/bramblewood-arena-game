#!/usr/bin/env python3
# Game data snapshot (2026-10-12, user: "Generate a csv with card names ... map list ... all effects"): loads the built game
# (index.html, served on localhost:8765) in headless Chromium and dumps cards, maps, skills, triggers, actions, statuses,
# feature spots, packs and castles exactly as the game describes them.  Usage: python3 tools/export_gamedata.py OUT_DIR
import asyncio, sys, json
from playwright.async_api import async_playwright
S=sys.argv[1]
JS = r"""(()=>{
const strip = h=> String(h||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const defs = getCardDefs();
const mains = mainConquestMaps();
const maps = CONQUEST_MAPS.filter(m=> !m.reserved).map(m=>{
  const nodes = (m.nodes||[]).map(n=>{ let castle=''; try{ const sc = skirmishCastle(n); castle = sc && sc.character ? (sc.character.name||sc.character.id||'') : ''; }catch(e){}
    let rating=null; try{ rating = enemyDeckLevel(n); }catch(e){}
    let lvl=null; try{ lvl = roadEnemyLevel(n); }catch(e){}
    return {key:n.key, code: skirmishCode(m.id, n.key), name:n.name||'', kind:n.kind||'skirmish', rating, enemyLevel:lvl, castle,
      deck: Object.assign({}, n.deck||{}), waves:(n.waveDecks||[]).map(w=> Object.assign({}, w)), leaders:(n.leaders||[]).concat(n.leaderId?[n.leaderId]:[]) }; });
  return {id:m.id, name:m.name, icon:m.icon||'', sub:!!m.sub, parent:m.parent||'', no: mapNumberOf(m.id), unlockAfter:m.unlockAfter||'', entry: m.entry ? {after:m.entry.after||'', afterMapCleared:m.entry.afterMapCleared||'', label:m.entry.label||'', afterDays:m.entry.afterDays||'', quest:m.entry.quest||''} : null,
    biome: m.biome||'', blurb: strip(m.blurb||m.desc||''), nodes};
});
const cards = Object.values(defs).map(d=>{ let ab=[]; try{ ab = describeEffects(d).map(strip).filter(Boolean); }catch(e){ ab=['(error: '+e.message+')']; }
  let where=''; try{ where = strip(cardWhereToGetText(d)); }catch(e){}
  return {id:d.id, name:d.name, attack:d.attack||0, health:d.health||0, cost:d.cost||0, wait:d.wait||0, rarity:d.rarity||'common', kind:d.cardType||'unit', species:(d.species||[]).join(', '), types:(d.archetypes||[]).join(', '),
    abilities: ab, effectKeys:Object.keys(d.effects||{}), triggers:((d.effects||{}).triggers||[]).map(t=> t.on+':'+t.do), where, src:d.source||null, locked:!!d.locked, token:!!d.token, test:!!(d.test || String(d.id).startsWith('test-')), flavor: d.flavor||''}; });
const skills = PASSIVE_DEFS.map(p=>{ let desc='', n1=false; try{ desc = typeof p.desc==='function' ? p.desc(p.kind==='number'?'N':undefined) : p.desc; }catch(e){ desc=''; } if(!desc || /undefined|NaN|\+0\/\+0/.test(desc)){ try{ desc = p.desc(1); n1=true; }catch(_){} } let short=''; try{ short = (typeof SKILL_TEXT!=='undefined' && SKILL_TEXT[p.key]) ? strip(SKILL_TEXT[p.key]('N')) : ''; }catch(e){} return {key:p.key, label:p.label, category:p.category||'', kind:p.kind||'', desc:strip(desc), short, n1}; });
const triggers = TRIGGER_DEFS.map(t=> ({key:t.key, label:t.label, desc:strip(t.desc)}));
const actions = ACTION_DEFS.map(a=> ({key:a.key, label:a.label, desc:strip(a.desc)}));
const statuses = STATUS_KEYWORDS.map(k=> ({key:k.k, name:k.name, text:k.text}));
const spots = FEATURE_SPOTS.map(sp=>{ let mapId=''; try{ mapId = sp.map; }catch(e){} let after=''; try{ after = sp.after||''; }catch(e){} return {key:sp.key, name:strip(sp.name), icon:sp.icon||'', mapNumber: sp.mapNumber!=null ? sp.mapNumber : (mapId ? mapNumberOf(mapId) : null), mapId, after, merchant:!!sp.merchant, pack:sp.pack||''}; });
const packs = (typeof SHOP_PACKS_DEFAULT!=='undefined'?SHOP_PACKS_DEFAULT:[]).map(p=> ({id:p.id, name:p.name, cards:p.cards, pool:p.pool, cost:p.cost}));
let freePacks = null; try{ freePacks = typeof MAP_FREE_PACKS!=='undefined' ? MAP_FREE_PACKS : null; }catch(e){}
const castles = Object.values(CHARACTER_DEFS||{}).map(c=>({id:c.id, name:c.name, hp:c.hp||c.health||null, effects:Object.keys(c.effects||{}).join(', '), desc: (()=>{ try{ return strip(characterDescHTML(c)); }catch(e){ return ''; } })(), icon:c.icon||''}));
return JSON.stringify({cards, maps, skills, triggers, actions, statuses, spots, packs, freePacks, castles, mainOrder: mains.map(m=> m.id)});
})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
        pg = await b.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1')")
        await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_timeout(3000)
        out = await pg.evaluate(JS)
        open(S+'/gamedata.json','w').write(out); print(len(out), errs[:3])
        await b.close()
asyncio.run(main())
