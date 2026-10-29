#!/usr/bin/env python3
"""APPLY1 (2026-10-28, owner 23:05 "Okay to THEME1-1", 23:06 submap classes): write the THEME2 map lists into canonical/map-pools.json.

Source: docs/balance/theme2-proposal-2026-10-28.json (tools/theme2_proposal_2026_10_28.py), each map's `proposed` list.
  - Each main map's MAP list ("cards") = its `proposed` list, in the proposal's order.
  - Each submap's SUBMAP list = its `proposed` list minus the cards already on the parent's new MAP list (see below).
  - Kept as they are: the lists the proposal skips (the tutorial mtut, the endless dungeons mm / muc, the tower mlb) and every SPECIAL list,
    except that a SPECIAL card now also on one of that map's lists (MAP or a submap) is dropped as a duplicate.
  - Targeted rewrite: only the lines of the lists that change are rewritten, in the file's own one-line-per-list style.

Why a submap stores only its non-parent cards (2026-10-28 APPLY1): a submap fight draws MAP + that SUBMAP + SPECIAL (arena_app.js
mapPoolTiers; tools/lib_map_pools.js keeps the same shape). The proposal's submap list (1-5 unique + 10+ carried) carries many cards from
the parent map, and those are in the submap fight's pool through the parent's MAP list already; storing them again in SUBMAP changes
nothing in a fight, puts the same card twice in the Map cards editor and makes the editor's "remove from this list" leave a copy behind.
So SUBMAP holds the proposal's cards that are not on the parent's MAP list. The submap fight's pool then holds every card of the proposal;
it also holds the rest of the parent's MAP list, which the three-tier shape cannot leave out (an owner call, noted in the APPLY1 report).

2026-10-29 LISTFIX1 (decision APPLY1-1, filled per the owner's 10-26 "fill in the decisions"; owner 22:47 "Submaps would be 1-3 cards + 10+
carried over, so 11-14"): the rule changes: a submap fight draws only its SUBMAP list + SPECIAL (no longer the parent's MAP list), so each
SUBMAP list now stores the proposal's whole `proposed` list (unique + carried), 11-15 cards. The paragraph above is history. SPECIAL keeps a
card unless it is on the MAP list AND on every submap's list (then every fight of the family has it already); APPLY1's 6 dropped SPECIAL cards
are put back where that rule keeps them (RESTORE_SPECIAL), and the first-clear pack cards no longer on their map's MAP list
(SKIRMISH_FIRST_PACK_CARDS, decision APPLY1-3/4) are added to that map's SPECIAL (FIRST_CLEAR_SPECIAL). Run on today's file it reproduces it.

Usage: python3 tools/apply1_theme2_2026_10_28.py [--dry] [--report <file.json>]
       python3 tools/apply1_theme2_2026_10_28.py report   (after the apply and the regenerations; see the report section below)
  prints what changes; writes canonical/map-pools.json unless --dry; --report writes the per-list changes (run it before the apply: once
  applied, the "before" side is the new lists). It is idempotent: a second run changes nothing.
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
POOLS = os.path.join(ROOT, 'canonical', 'map-pools.json')
PROP = os.path.join(ROOT, 'docs', 'balance', 'theme2-proposal-2026-10-28.json')
DRY = '--dry' in sys.argv
# 2026-10-29 LISTFIX1: APPLY1's SPECIAL drops (put back where the LISTFIX1 rule keeps them) and the 5 first-clear pack cards off their map's MAP list
ABOUT = ("Per-map card pools (owner 2026-10-22). One entry per main map, three tiers: \"cards\" (the MAP tier), \"submaps\" (each side map's whole "
         "list, one list each: its own cards + the ones it carries) and \"special\" (the cards added through a skirmish deck editor's + Load any card; "
         "one list for the map and its submaps' fights). A main-map fight draws from cards + special; a submap fight from that submap + special "
         "(2026-10-29 LISTFIX1, decision APPLY1-1: no longer the parent's cards too). Shape: tools/lib_map_pools.js. Fold the admin's live edits back with tools/fold_map_pools.js.")
RESTORE_SPECIAL = {'m8': ['venomlord-serpent'], 'm7': ['orca-vanguard'], 'm10': ['wound-reaver'], 'mr': ['sergeant-bramblefox'], 'md': ['sand-widow'], 'm22': ['rimeheart-colossus']}
FIRST_CLEAR_SPECIAL = {'mf': ['compost-grub'], 'mc': ['hawk-arrowkeeper'], 'mu': ['sleepless-shrew'], 'm4': ['blind-cave-fish'], 'mr': ['fox-kit']}


def line_list(ids):
    return '[' + ', '.join(json.dumps(x) for x in ids) + ']'


def main():
    text = open(POOLS, encoding='utf-8').read()
    cur = json.loads(text)['maps']
    prop = json.load(open(PROP, encoding='utf-8'))
    card_ids = {c['id'] for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
    P = {m['key']: m for m in prop['maps']}

    # the new lists
    new_main, new_sub, report = {}, {}, {'main': {}, 'sub': {}, 'specialDropped': {}, 'kept': []}
    for k, m in P.items():
        if m.get('skipped'):
            report['kept'].append(k)
            continue
        ids = list(dict.fromkeys(m['proposed']))
        miss = [x for x in ids if x not in card_ids]
        if miss:
            sys.exit('%s: not in cards.json: %s' % (k, miss))
        if not m.get('sub'):
            if k not in cur:
                sys.exit('main map %s is not in map-pools.json' % k)
            new_main[k] = ids
    for k, m in P.items():
        if m.get('skipped') or not m.get('sub'):
            continue
        par = m['parent']
        if par not in cur or k not in cur[par]['submaps']:
            sys.exit('submap %s is not under %s in map-pools.json' % (k, par))
        on_parent = set(new_main[par])
        # 2026-10-29 LISTFIX1: the whole proposed list (a submap fight reads only its own list now); the third item stays for the report
        new_sub[k] = (par, list(dict.fromkeys(m['proposed'])), [x for x in m['proposed'] if x in on_parent])

    # SPECIAL: 2026-10-29 LISTFIX1: drop a card only when it is on the MAP list and on every submap's list (was: on any of the entry's lists);
    # APPLY1's drops come back where this rule keeps them, and the first-clear pack cards off their map's MAP list join SPECIAL
    new_special = {}
    for top, e in cur.items():
        main_l = set(new_main.get(top, e['cards']))
        sub_ls = [set(new_sub[s][1] if s in new_sub else ids) for s, ids in e['submaps'].items()]
        on_all = {x for x in main_l if all(x in l for l in sub_ls)}
        sp0 = e.get('special', [])
        sp = list(dict.fromkeys(sp0 + [x for x in RESTORE_SPECIAL.get(top, []) + FIRST_CLEAR_SPECIAL.get(top, []) if x in card_ids]))
        keep = [x for x in sp if x not in on_all]
        if keep != sp0:
            new_special[top] = keep
        if [x for x in sp if x in on_all]:
            report['specialDropped'][top] = [x for x in sp if x in on_all]

    for k, ids in new_main.items():
        old = cur[k]['cards']
        report['main'][k] = {'before': len(old), 'after': len(ids), 'added': [x for x in ids if x not in old], 'removed': [x for x in old if x not in ids]}
    for k, (par, ids, via_parent) in new_sub.items():
        old = cur[par]['submaps'][k]
        report['sub'][k] = {'parent': par, 'before': len(old), 'after': len(ids), 'proposed': len(P[k]['proposed']), 'viaParentMap': via_parent,
                            'added': [x for x in ids if x not in old], 'removed': [x for x in old if x not in ids]}

    # the targeted rewrite: walk the lines, rewrite only the list lines that change
    out, top, in_subs, n_changed = [], None, False, 0
    for ln in text.split('\n'):
        mtop = re.match(r'^  "([^"]+)": \{$', ln)
        if mtop:
            top, in_subs = mtop.group(1), False
        elif re.match(r'^   "submaps": \{', ln):
            in_subs = not ln.rstrip().endswith('{},') and not ln.rstrip().endswith('{}')
        elif in_subs and re.match(r'^   \},?$', ln):
            in_subs = False
        mc = re.match(r'^(   "cards": )(\[.*\])(,?)$', ln)
        ms = re.match(r'^(    "([^"]+)": )(\[.*\])(,?)$', ln) if in_subs else None
        msp = re.match(r'^(   "special": )(\[.*\])(,?)$', ln)
        if ln.startswith(' "_about": '):   # 2026-10-29 LISTFIX1: the file's own note follows the new submap rule
            nl = ' "_about": ' + json.dumps(ABOUT) + ','
        elif mc and top in new_main:
            nl = mc.group(1) + line_list(new_main[top]) + mc.group(3)
        elif ms and ms.group(2) in new_sub:
            nl = ms.group(1) + line_list(new_sub[ms.group(2)][1]) + ms.group(4)
        elif msp and top in new_special:
            nl = msp.group(1) + line_list(new_special[top]) + msp.group(3)
        else:
            nl = ln
        if nl != ln:
            n_changed += 1
        out.append(nl)
    new_text = '\n'.join(out)

    # check: the rewritten file holds exactly the lists computed above, everything else as it was
    got = json.loads(new_text)['maps']
    for k, ids in new_main.items():
        assert got[k]['cards'] == ids, k
    for k, (par, ids, _) in new_sub.items():
        assert got[par]['submaps'][k] == ids, k
    for top, e in cur.items():
        assert set(got[top]['submaps']) == set(e['submaps']), top
        for s in e['submaps']:
            if s not in new_sub:
                assert got[top]['submaps'][s] == e['submaps'][s], s
        assert got[top]['special'] == new_special.get(top, e['special']), top
    assert set(got) == set(cur)

    print('main maps rewritten: %d; submaps rewritten: %d; kept: %s; lines changed: %d' % (len(new_main), len(new_sub), ', '.join(report['kept']), n_changed))
    for k, r in report['sub'].items():
        print('  %s (under %s): proposal %d, stored %d (%d also on the parent\'s MAP list), was %d' % (k, r['parent'], r['proposed'], r['after'], len(r['viaParentMap']), r['before']))
    if report['specialDropped']:
        print('SPECIAL duplicates dropped:', json.dumps(report['specialDropped']))
    if DRY:
        print('--dry: nothing written')
    else:
        open(POOLS, 'w', encoding='utf-8').write(new_text)
        print('wrote canonical/map-pools.json')
    if '--report' in sys.argv:   # the per-list changes as JSON (the `report` mode below rebuilds them from git HEAD instead)
        f = sys.argv[sys.argv.index('--report') + 1]
        json.dump(report, open(f, 'w', encoding='utf-8'), indent=1)
        print('wrote', f)


# ---- report: python3 tools/apply1_theme2_2026_10_28.py report ----
# Run after the apply, `node tools/forge_curve_2026_10_19.js maps` and `node tools/pack1_pools_2026_10_28.js --json ...`. The "before" side
# is the committed HEAD (git show HEAD:<file>) of map-pools.json, card-obtain-maps.json and the PACK1 report. Writes
# docs/balance/apply1-2026-10-28.json and .md:
#   - per list: before -> after, the submaps' cards that come through the parent's MAP list, SPECIAL duplicates dropped;
#   - the packs (PACK1's derived pools) before -> after, and the cards on no list;
#   - budget (tools/skill_costs.js, N from bramblewood-budget.js): each card whose obtain map changed, newly over / newly inside its budget,
#     newly well under (2A + H + S at most 60% of N); no card is re-fitted (the owner's step 3);
#   - skirmish decks (every fight with a deck) holding a card that is not on the fight's pool (MAP + its SUBMAP + SPECIAL): new since APPLY1
#     or already so before. No deck is rebuilt (step 4).
REPORT_JS = r"""
'use strict';
const fs = require('fs'), path = require('path'), ROOT = process.cwd();
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const IN = JSON.parse(fs.readFileSync(process.env.APPLY1_IN, 'utf8'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).filter(c=> !c.pool);
const om0 = IN.obtainBefore.maps || {}, om1 = IN.obtainAfter.maps || {};
// budget, at each card's start level, with the obtain map before / after
const budget = {changed: [], newlyOver: [], newlyInside: [], newlyWellUnder: [], stillOver: 0};
cards.filter(SC.measured).forEach(c=>{
  const a = om0[c.id] || 0, b = om1[c.id] || 0; if(a === b) return;
  const b0 = T.budget(Object.assign({}, c, {obtainMap: a})), b1 = T.budget(Object.assign({}, c, {obtainMap: b}));
  const row = {id: c.id, name: c.name, rarity: c.rarity || 'common', mapBefore: a, mapAfter: b, N: [b0.N, b1.N], x1: b1.x1, okBefore: b0.ok, okAfter: b1.ok,
    pack: G.basicPackTierOf(D[c.id]) || 0, firstList: (G.cardFirstMapList(D[c.id]) || {}).loc || null};
  budget.changed.push(row);
  if(b0.ok && !b1.ok) budget.newlyOver.push(row); else if(!b0.ok && b1.ok) budget.newlyInside.push(row); else if(!b1.ok) budget.stillOver++;
  if(b1.wellUnder && !b0.wellUnder) budget.newlyWellUnder.push(row); });
// decks against the fight's pool
const norm = e=>{ e = e || {}; const subs = {}; Object.keys(e.submaps || {}).forEach(k=> subs[k] = Array.isArray(e.submaps[k]) ? e.submaps[k] : ((e.submaps[k] || {}).cards || [])); return {cards: e.cards || [], submaps: subs, special: e.special || []}; };
const poolOf = (pools, m)=>{ const top = m.sub ? m.parent : m.id, e = pools.maps[top]; if(!e) return null; const n = norm(e);
  return new Set(n.cards.concat(m.sub ? (n.submaps[m.id] || []) : [], n.special)); };
const decks = [];
G.CONQUEST_MAPS.forEach(m=>{
  const p0 = poolOf(IN.poolsBefore, m), p1 = poolOf(IN.poolsAfter, m); if(!p1) return;
  (m.nodes || []).forEach(n=>{ const ids = Object.keys(n.deck || {}); if(!ids.length) return;
    const off1 = ids.filter(id=> !p1.has(id)); if(!off1.length) return;
    const off0 = new Set(ids.filter(id=> p0 && !p0.has(id)));
    decks.push({map: m.id, mapName: m.name, sub: !!m.sub, mapNo: G.mapUnlockNumberOf(m.id), key: n.key, name: n.name, kind: n.kind || 'skirmish',
      cards: ids.length, copies: ids.reduce((s, id)=> s + n.deck[id], 0),
      offNew: off1.filter(id=> !off0.has(id)).map(id=> ({id, copies: n.deck[id], src: (D[id] && D[id].source && D[id].source.kind) || 'none'})),
      offBefore: off1.filter(id=> off0.has(id)).map(id=> ({id, copies: n.deck[id]})),
      offCopies: off1.reduce((s, id)=> s + n.deck[id], 0)}); }); });
// cards on no list (live creature cards: no token, test, Easter egg, spell or equipment)
const live = d=> d && !d.token && !d.test && !d.easterEgg && d.cardType !== 'spell' && d.cardType !== 'equipment' && !(d.source && d.source.kind === 'easteregg');
const listed = pools=>{ const s = new Set(); Object.values(pools.maps).forEach(e=>{ const n = norm(e); n.cards.concat(n.special).forEach(x=> s.add(x)); Object.values(n.submaps).forEach(l=> l.forEach(x=> s.add(x))); }); return s; };
const L0 = listed(IN.poolsBefore), L1 = listed(IN.poolsAfter), liveIds = Object.keys(D).filter(id=> live(D[id]));
const noList = {before: liveIds.filter(id=> !L0.has(id)).length, after: liveIds.filter(id=> !L1.has(id)).length, live: liveIds.length};
// data follow-ups the lists open (cards.json / arena_app.js steps, not this package's):
//   a first-clear pack card (SKIRMISH_FIRST_PACK_CARDS) no longer on its map's MAP list; a card on a list with no source (awaitingSource);
//   a card on a list still flagged unattainable; a basic-pack card on no list without the flag (BAL7 M3's rule keeps the flag on those)
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), vm = require('vm');
const tbl = app.slice(app.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), app.indexOf('/* GD5-TABLE-END */'));
const FC = vm.runInNewContext('(' + tbl.replace(/^const SKIRMISH_FIRST_PACK_CARDS = /, '').replace(/;\s*$/, '') + ')');
const firstClearOff = Object.entries(FC).filter(([k, id])=> !((IN.poolsAfter.maps[k.split(':')[0]] || {}).cards || []).includes(id)).map(([k, id])=> ({fight: k, id, onAList: L1.has(id)}));
const raw = cards.filter(c=> !c.token && !c.test);
const followUps = {firstClearOff,
  listedNoSource: raw.filter(c=> L1.has(c.id) && !L0.has(c.id) && (c.awaitingSource || !c.source)).map(c=> c.id),
  listedButUnattainable: raw.filter(c=> c.unattainable && L1.has(c.id) && c.source && c.source.kind === 'pack').map(c=> c.id),
  offListPackNoFlag: raw.filter(c=> !c.unattainable && !c.awaitingSource && !c.easterEgg && c.source && c.source.kind === 'pack' && +c.source.tier >= 1 && +c.source.tier <= 4 && !L1.has(c.id)).length};
process.stdout.write(JSON.stringify({budget, decks, noList, followUps}));
"""


def git_show(rel):
    import subprocess
    return json.loads(subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=ROOT, check=True, capture_output=True, text=True).stdout)


def report():
    import subprocess, tempfile
    P = json.load(open(PROP, encoding='utf-8'))
    pools0, pools1 = git_show('canonical/map-pools.json'), json.load(open(POOLS, encoding='utf-8'))
    ob0, ob1 = git_show('canonical/card-obtain-maps.json'), json.load(open(os.path.join(ROOT, 'canonical', 'card-obtain-maps.json'), encoding='utf-8'))
    pk0, pk1 = git_show('docs/balance/pack1-pools-2026-10-28.json'), json.load(open(os.path.join(ROOT, 'docs', 'balance', 'pack1-pools-2026-10-28.json'), encoding='utf-8'))
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump({'poolsBefore': pools0, 'poolsAfter': pools1, 'obtainBefore': ob0, 'obtainAfter': ob1}, f)
        tmp = f.name
    try:
        r = subprocess.run(['node', '-'], input=REPORT_JS, cwd=ROOT, env=dict(os.environ, APPLY1_IN=tmp), check=True, capture_output=True, text=True)
    finally:
        os.unlink(tmp)
    js = json.loads(r.stdout)
    names = {m['key']: m['name'] for m in P['maps']}
    lists = []
    for m in P['maps']:
        k = m['key']
        if m.get('sub'):
            par = m['parent']
            b, a = pools0['maps'][par]['submaps'].get(k, []), pools1['maps'][par]['submaps'].get(k, [])
            via = [x for x in m.get('proposed', []) if x in pools1['maps'][par]['cards']]
            eff = len(set(pools1['maps'][par]['cards']) | set(a) | set(pools1['maps'][par]['special']))
            lists.append({'map': k, 'name': m['name'], 'mapNo': m['no'], 'parent': par, 'kept': bool(m.get('skipped')), 'before': len(b), 'after': len(a),
                          'proposed': len(m.get('proposed', [])), 'viaParentMap': via, 'fightPool': eff})
        else:
            b, a = pools0['maps'][k]['cards'], pools1['maps'][k]['cards']
            lists.append({'map': k, 'name': m['name'], 'mapNo': m['no'], 'before': len(b), 'after': len(a),
                          'added': [x for x in a if x not in b], 'removed': [x for x in b if x not in a],
                          'specialBefore': pools0['maps'][k]['special'], 'specialAfter': pools1['maps'][k]['special']})
    packs = {t: {'name': pk1['packs'][t]['name'], 'maps': pk1['packs'][t]['maps'], 'before': pk0['packs'][t]['after'], 'after': pk1['packs'][t]['after'],
                 'rarityAfter': pk1['packs'][t]['rarityAfter']} for t in ['1', '2', '3', '4']}
    decks = js['decks']
    new_off = [d for d in decks if d['offNew']]
    out = {'_about': 'APPLY1 (2026-10-28): the THEME2 lists written into canonical/map-pools.json (owner 23:05 "Okay to THEME1-1"). What changed, '
                     'the budget impact of the new obtain maps (no card re-fitted: the owner\'s step 3) and the skirmish decks with cards off their '
                     'fight\'s pool (no deck rebuilt: step 4). Built by tools/apply1_theme2_2026_10_28.py report.',
           'built': '2026-10-28', 'lists': lists, 'packs': packs,
           'notObtainable': {'before': len(pk0['notObtainable']), 'after': len(pk1['notObtainable'])},
           'noList': js['noList'], 'budget': js['budget'], 'followUps': js['followUps'],
           'decks': {'fightsOff': len(decks), 'fightsNewlyOff': len(new_off), 'offCopies': sum(d['offCopies'] for d in decks),
                     'newOffCopies': sum(c['copies'] for d in decks for c in d['offNew']),
                     'engineHardFail': False, 'note': 'The game does not check a deck against its map list (arena_app.js uses the list only in the Map cards editor, '
                     'the skirmish panel\'s map-cards section and the packs), so an off-list deck card plays as before.', 'fights': decks}}
    jf = os.path.join(ROOT, 'docs', 'balance', 'apply1-2026-10-28.json')
    json.dump(out, open(jf, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    open(jf, 'a').write('\n')
    bu = out['budget']
    a = []
    a.append('# APPLY1: the THEME2 map lists applied (2026-10-28)')
    a.append('')
    a.append('Owner 23:05 "Okay to THEME1-1" (apply the THEME2 lists after PACK1); 23:06 submap classes. Source: `docs/balance/theme2-proposal-2026-10-28.json`. '
             'Tool: `python3 tools/apply1_theme2_2026_10_28.py` (apply), `... report` (this file). Data: `apply1-2026-10-28.json`.')
    a.append('')
    a.append('## Lists')
    a.append('- 25 main maps: MAP list = the proposal (15 each). 15 submaps: SUBMAP list = the proposal minus the cards already on the parent\'s MAP list '
             '(a submap fight draws MAP + SUBMAP + SPECIAL, so those come in anyway). Kept: mtut (tutorial), mm / muc (endless dungeons), mlb (tower).')
    sd = {l['map']: [x for x in l['specialBefore'] if x not in l['specialAfter']] for l in lists if not l.get('parent') and l['specialBefore'] != l['specialAfter']}
    a.append('- SPECIAL duplicates dropped (now on one of that map\'s lists): ' + (', '.join('%s %s' % (k, ', '.join(v)) for k, v in sd.items()) or 'none') + '.')
    a.append('- **Submap fight pools are larger than the proposal\'s 11-14**: the parent\'s whole MAP list (15) comes in too. Fight pool per submap: ' +
             ', '.join('%s %d' % (l['map'], l['fightPool']) for l in lists if l.get('parent') and not l['kept']) + '. Matching 11-14 needs a rule change '
             '(a submap fight reads only its own list), an owner call.')
    a.append('')
    a.append('| List | Map | Before | After |')
    a.append('|---|---|---|---|')
    for l in lists:
        if l.get('kept'):
            continue
        a.append('| %s%s (%s) | %d | %d | %d%s |' % ('↳ ' if l.get('parent') else '', l['name'], l['map'], l['mapNo'], l['before'], l['after'],
                                                   (' (+%d via the parent)' % len(l['viaParentMap'])) if l.get('parent') else ''))
    a.append('')
    a.append('## Packs (PACK1\'s derived pools)')
    for t, p in packs.items():
        a.append('- Pack %s %s (Maps %d-%d): %d -> %d' % (t, p['name'], p['maps'][0], p['maps'][1], p['before'], p['after']))
    a.append('- Basic-pack cards in no pack (not obtainable yet): %d -> %d. Live creature cards on no map list: %d -> %d (of %d).' % (
        out['notObtainable']['before'], out['notObtainable']['after'], out['noList']['before'], out['noList']['after'], out['noList']['live']))
    a.append('')
    a.append('## Budget (no card re-fitted; the owner\'s step 3)')
    a.append('- Obtain map changed: %d cards (`canonical/card-obtain-maps.json` regenerated). A card in no pack and on no list counts as Map 0.' % len(bu['changed']))
    a.append('- Newly over budget: %d (%d of them now on no list, Map 0). Newly inside: %d. Newly well under (2A+H+S <= 60%% of N): %d.' % (
        len(bu['newlyOver']), sum(1 for r in bu['newlyOver'] if r['mapAfter'] == 0), len(bu['newlyInside']), len(bu['newlyWellUnder'])))
    listed_over = [r for r in bu['newlyOver'] if r['mapAfter'] > 0]
    if listed_over:
        a.append('- Newly over and still on a list: ' + ', '.join('%s (Map %d -> %d)' % (r['name'], r['mapBefore'], r['mapAfter']) for r in listed_over) + '.')
    if bu['newlyInside']:
        a.append('- Newly inside: ' + ', '.join('%s (Map %d -> %d)' % (r['name'], r['mapBefore'], r['mapAfter']) for r in bu['newlyInside']) + '.')
    if bu['newlyWellUnder']:
        a.append('- Newly well under: ' + ', '.join('%s (Map %d -> %d)' % (r['name'], r['mapBefore'], r['mapAfter']) for r in bu['newlyWellUnder']) + '.')
    a.append('')
    a.append('## Skirmish decks with cards off their fight\'s pool (not rebuilt; step 4)')
    dk = out['decks']
    a.append('- %d fights hold a card not on their pool (MAP + SUBMAP + SPECIAL); %d of them because of APPLY1 (%d copies newly off). %s' % (
        dk['fightsOff'], dk['fightsNewlyOff'], dk['newOffCopies'], dk['note']))
    a.append('')
    a.append('| Fight | Map | Kind | Newly off (copies) | Off before too |')
    a.append('|---|---|---|---|---|')
    for d in decks:
        a.append('| %s %s | %s | %s | %s | %s |' % (d['key'], d['name'], d['map'], d['kind'], ', '.join('%s x%d' % (c['id'], c['copies']) for c in d['offNew']) or '-',
                                                ', '.join(c['id'] for c in d['offBefore']) or '-'))
    fu = js['followUps']
    a.append('')
    a.append('## Data follow-ups the new lists open (not done here: cards.json / arena_app.js)')
    a.append('- First-clear pack cards no longer on their map\'s list (%d): %s.' % (len(fu['firstClearOff']), ', '.join('%s %s%s' % (r['fight'], r['id'], '' if r['onAList'] else ' (on no list)') for r in fu['firstClearOff']) or 'none'))
    a.append('- Cards THEME2 put on a list that have no source yet (%d): %s.' % (len(fu['listedNoSource']), ', '.join(fu['listedNoSource']) or 'none'))
    a.append('- Cards on a list still flagged `unattainable` (%d): %s.' % (len(fu['listedButUnattainable']), ', '.join(fu['listedButUnattainable']) or 'none'))
    a.append('- Basic-pack cards on no list without the `unattainable` flag: %d (BAL7 M3 keeps the flag on such cards; the game shows them "Not obtainable yet" either way).' % fu['offListPackNoFlag'])
    open(os.path.join(ROOT, 'docs', 'balance', 'apply1-2026-10-28.md'), 'w', encoding='utf-8').write('\n'.join(a) + '\n')
    print('packs', {t: '%d -> %d' % (p['before'], p['after']) for t, p in packs.items()}, 'notObtainable', out['notObtainable'], 'noList', out['noList'])
    print('budget changed %d, newly over %d (%d to Map 0), newly inside %d, newly well under %d' % (len(bu['changed']), len(bu['newlyOver']),
          sum(1 for r in bu['newlyOver'] if r['mapAfter'] == 0), len(bu['newlyInside']), len(bu['newlyWellUnder'])))
    print('decks: %d fights off-pool, %d newly (%d copies)' % (dk['fightsOff'], dk['fightsNewlyOff'], dk['newOffCopies']))
    print('wrote docs/balance/apply1-2026-10-28.json and .md')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'report':
        report()
    else:
        main()
