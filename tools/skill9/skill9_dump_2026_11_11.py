#!/usr/bin/env python3
# SKILL9 (2026-11-11, owner: "Run through all skills again, make sure they meet our standard. Highlight any duplicates. In the end, the target
# is for <80 skills (total) at Map 20."). Analysis only: changes no card, map or engine file.
# Dumps what the game itself says about skills, run in headless Chromium against the built index.html (the server and offline routing are
# tools/export_workbook_2026_11_07.py's dump(); only the page script differs): the skill registry (SKILL_DEFS with label, short text, Codex
# text, icon), TRIGGER_DEFS / ACTION_DEFS, every card's skill keys as the Map cards window counts them (ui18CardSkillKeys: ENG35 fused keys,
# with the level a skill is learnt at) and its triggers, every map's lists (mapPoolSections), fight decks and first-clear cards, and per main
# map the skill rows the game's "N new" count reads (ui19McSkillRows + ui28SkillMeet).
# Usage: python3 tools/skill9/skill9_dump_2026_11_11.py OUT.json      (build index.html first if the sources changed)
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import export_workbook_2026_11_07 as W  # noqa: E402

JS = r"""(()=>{
const strip = h=> String(h == null ? '' : h).replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const defs = getCardDefs();
const fk = k=> { try{ return eng35FusedKey(k); }catch(e){ return k; } };
const tryS = f=> { try{ return strip(f()); }catch(e){ return ''; } };
const reg = SKILL_DEFS.map(p=> ({key: p.key, fused: fk(p.key), label: strip(p.label), category: p.category || '', kind: p.kind || '',
  retired: !!p.retired, reserved: !!p.reserved, legendary: !!p.legendary,
  desc: tryS(()=> typeof p.desc === 'function' ? p.desc(p.kind === 'number' ? 'N' : true) : p.desc),
  short: tryS(()=> SKILL_TEXT[p.key] ? SKILL_TEXT[p.key]('N') : ''),
  codex: strip(p.codexNote || ''), icon: (typeof SKILL_ICON !== 'undefined' && SKILL_ICON[p.key]) || (typeof SKILL_ICON_HTML !== 'undefined' && SKILL_ICON_HTML[p.key] ? 'html' : ''),
  reveal: (typeof SKILL_REVEAL !== 'undefined' && SKILL_REVEAL[p.key] != null) ? SKILL_REVEAL[p.key] : null}));
const trig = TRIGGER_DEFS.map(t=> ({key: t.key, label: strip(t.label), desc: tryS(()=> t.desc)}));
const act = ACTION_DEFS.map(a=> ({key: a.key, label: strip(a.label), desc: tryS(()=> a.desc)}));
const trigOf = e=> ((e && e.triggers) || []).map(t=> ({on: t.on, do: t.do}));
const cards = Object.values(defs).map(d=>{ let src = {}; try{ src = cardSourceOf(d) || {}; }catch(e){}
  let un = false; try{ un = !!isUnattainable(d); }catch(e){}
  const ls = d.levelSkills || {}, trs = trigOf(d.effects).map(t=> Object.assign(t, {lvl: 0}));
  Object.keys(ls).forEach(L=> trigOf(ls[L]).forEach(t=> trs.push(Object.assign(t, {lvl: +L}))));
  return {id: d.id, name: d.name, rarity: d.rarity || '', type: d.cardType || 'unit', token: !!d.token, test: !!(d.test || String(d.id).startsWith('test-')),
    field: !!d.field, pool: !!d.pool, egg: !!d.easterEgg, unattainable: un, src: {kind: src.kind || '', id: src.id || '', node: src.node || '', tier: src.tier == null ? null : src.tier},
    species: d.species || [], types: d.archetypes || [], attack: d.attack || 0, health: d.health || 0, cost: d.cost || 0,
    skills: ui18CardSkillKeys(d), rawKeys: Object.keys(d.effects || {}).filter(k=> k !== 'triggers' && skillValOn(d.effects[k])), triggers: trs}; });
const maps = CONQUEST_MAPS.filter(m=> !m.reserved).map(m=>{ let no = null, un = null; try{ no = mapNumberOf(m.id); }catch(e){} try{ un = mapUnlockNumberOf(m.id); }catch(e){}
  const nodes = (m.nodes || []).map(n=>{ const ids = new Set(Object.keys(n.deck || {})); (n.waveDecks || []).forEach(w=> Object.keys(w || {}).forEach(i=> ids.add(i)));
    (n.leaders || []).concat(n.leaderId ? [n.leaderId] : []).forEach(i=> ids.add(i)); let rw = []; try{ rw = nodeFirstClearCardIds(m.id, n.key); }catch(e){ try{ rw = nodeRewardCardIds(m.id, n.key); }catch(e2){} }
    return {key: n.key, kind: n.kind || 'skirmish', deck: [...ids], rewards: rw}; });
  let secs = []; if(!m.sub){ try{ secs = mapPoolSections(m.id).map(s=> ({key: s.key, ids: s.ids || []})); }catch(e){} }
  return {id: m.id, name: m.name, sub: !!m.sub, parent: m.parent || '', no, unlockNo: un, sections: secs, nodes}; });
// the game's own per-map count: rows of the map's main list, met (learnt at Level 0 and not shown as "?" there) or grey (a later level)
const perMap = mainConquestMaps().map(m=>{ let n = null; try{ n = mapNumberOf(m.id); }catch(e){} if(n == null) return null;
  let ids = []; try{ ids = (mapPoolSections(m.id).find(s=> s.key === 'cards') || {}).ids || []; }catch(e){}
  ids = ids.filter(id=> defs[id]);
  const rows = ui19McSkillRows(ids, defs).map(r=>{ const mt = ui28SkillMeet(r, defs, n); return {key: r.key, ids: r.ids, met: mt.met, lvl: mt.lvl, text: tryS(()=> ui19McSkillText(r))}; }); // text: as the first carrier's card reads it
  return {id: m.id, no: n, rows}; }).filter(Boolean);
let starter = []; try{ starter = Object.keys(starterDeckParts('both').all); }catch(e){}
return JSON.stringify({registry: reg, triggers: trig, actions: act, cards, maps, perMap, starter, minor: [...UI35_MINOR_SKILLS]});
})()"""


def main():
    if len(sys.argv) < 2:
        sys.exit('usage: skill9_dump_2026_11_11.py OUT.json')
    W.page_script = lambda: JS
    d = W.dump()
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False)
    print('registry', len(d['registry']), 'cards', len(d['cards']), 'maps', len(d['maps']), 'perMap', len(d['perMap']))


if __name__ == '__main__':
    main()
