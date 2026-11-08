#!/usr/bin/env python3
# Map signatures (2026-11-08, package DES1; owner 09:27: "in each map, 2-3 new unique signifying skills (may be 1-2 in Map 10+), and then
# a smattering of unimportant skills ... And they also have basics like guardians, arrow users, and quick-attackers." and "Only count the
# main map progression [for NEW skills] ... I expect 2-3 unique main ones, and 0-1 side ones (rarely 2)."). Design analysis only: reads
# canonical data and the game's own map list, changes nothing in the game.
#
# Inputs:
#   canonical/cards.json, canonical/map-pools.json, canonical/skill-delivery.json, canonical/skill-params.json (via tools/skill_params.py)
#   the game's maps (order, unlock numbers, names, blurbs) and skill labels from tools/export_gamedata.py (headless build export)
#   tools/des1/proposals_2026_11_08.json: the hand-written proposal per map (signatures, moves, missing basics; suggestions only)
# Outputs: docs/design/map-signatures-2026-11-08.json and docs/design/map-signatures-2026-11-08.md
#
# Usage: python3 tools/des1/map_signatures_2026_11_08.py [--gamedata PATH/gamedata.json]
#   Without --gamedata it serves index.html on localhost:8765 and runs tools/export_gamedata.py into a temp folder (build first).
import json, os, re, sys, subprocess, tempfile, time, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import skill_params  # noqa: E402

OUT_JSON = os.path.join(ROOT, 'docs', 'design', 'map-signatures-2026-11-08.json')
OUT_MD = os.path.join(ROOT, 'docs', 'design', 'map-signatures-2026-11-08.md')
PROPOSALS = os.path.join(ROOT, 'tools', 'des1', 'proposals_2026_11_08.json')

# --- Basics, defined from the engine (bramblewood-engine.js) and canonical/skill-delivery.json -------------------------------------
# Guardians: units that take hits meant for others or raise blockers (Guardian / Taunt redirect, Bulwark Log Walls, Build Palisade,
# Rampart). project-state.md "Blocking and redirecting".
GUARD = ['guardian', 'taunt', 'bulwark', 'fortification', 'rampart']
# Ranged: the single-target shots and throws of skill-delivery.json's "ranged" class, plus its "swing" list (Reach, Boomerang,
# Bananarang make the unit's own swing ranged). Area and On Ready blasts (Earthquake, Tsunami, Fireball, Meteor ...) are ranged too
# but are big effects, not the everyday "arrow user": counted apart as ranged_other.
SHOOT = ['arrow', 'archer', 'fireArrow', 'iceArrow', 'twinShot', 'volley', 'snipe', 'bola', 'lasso', 'fireBolt', 'acidBolt',
         'poisonBolt', 'iceBolt', 'shockBolt', 'spitfire', 'banana', 'rocket', 'sentry', 'reach', 'boomerang', 'bananarang',
         'action:arrow']
# Quick attackers: what swings early in the engine's order (swingSpeedOf / computeSpeeds: Quick +2, Blitz 10, Haste +2 and +1 to
# neighbours, Speed N) plus Pounce, which strikes the moment it lands (On Play, before combat).
QUICK = ['quick', 'blitz', 'haste', 'speed', 'pounce']
# Drawbacks and plumbing: never a signature (they still show in the minor list).
DRAWBACK = {'feeble', 'fragile', 'slow', 'injured', 'drunk', 'purblind', 'scatterbrained', 'isolation', 'cower', 'nightblind',
            'sunshy', 'chained'}
PLUMBING = {'arrowCount', 'archerStyle', 'deliveryRes', 'deliveryEvery', 'speeches', 'hatchling', 'stem', 'chrysalis'}

# Skills on cards that PASSIVE_DEFS does not list (engine-only or newer keys): their player-facing names.
EXTRA_LABELS = {'freeze': 'Freeze', 'onReadyDamage': 'On Ready damage', 'undead': 'Undead', 'bounty': 'Bounty',
                'thanatosis': 'Thanatosis', 'renewal': 'Renewal', 'confuse': 'Confuse', 'grit': 'Grit', 'scar': 'Scar',
                'onDeathSpawn': 'On Death: spawn', 'skitter': 'Skitter', 'devour': 'Devour', 'meld': 'Meld', 'immunity': 'Immunity',
                'sequestration': 'Sequestration', 'relict': 'Relict', 'weaponMaster': 'Weapon Master', 'constrict': 'Constrict'}

# Scope: Maps 0-20 (owner BAL17-2). Endless dungeons / tower carry no designed list (map-review.json): left out.
SKIP_MAPS = {'mm', 'muc', 'tw', 'mlb'}


def load(p):
    return json.load(open(os.path.join(ROOT, p), encoding='utf-8'))


def export_gamedata():
    tmp = tempfile.mkdtemp(prefix='des1-')
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765'], cwd=ROOT, stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL)
    try:
        time.sleep(1.0)
        subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'export_gamedata.py'), tmp], check=True, cwd=ROOT)
    finally:
        srv.terminate()
    return os.path.join(tmp, 'gamedata.json')


def card_skills(card, labels):
    """{skillKey: 'base' | 'L<n>'} from a card's effects and levelSkills, one key per skill family (ENG35 fuse)."""
    out = {}

    def take(e, tag):
        if not isinstance(e, dict):
            return
        for k, v in skill_params.fuse(e).items():
            if k == 'triggers':
                for t in v or []:
                    if isinstance(t, dict) and t.get('do'):
                        key = 'trigger:%s:%s' % (t.get('on'), t.get('do'))
                        out.setdefault(key, tag)
                continue
            if k in PLUMBING or v in (False, None, 0):
                continue
            out.setdefault(k, tag)  # keys the skill list does not label (Freeze, Thanatosis, Undead ...) are skills too: EXTRA_LABELS

    take(card.get('effects'), 'base')
    for L, e in sorted((card.get('levelSkills') or {}).items(), key=lambda x: int(x[0]) if str(x[0]).isdigit() else 99):
        take(e, 'L%s' % L)
    return out


def main():
    args = sys.argv[1:]
    gpath = args[args.index('--gamedata') + 1] if '--gamedata' in args else export_gamedata()
    gd = json.load(open(gpath, encoding='utf-8'))
    labels = dict(EXTRA_LABELS)
    labels.update({s['key']: s['label'] for s in gd['skills']})
    tlab = {t['key']: t['label'] for t in gd['triggers']}
    alab = {a['key']: a['label'] for a in gd['actions']}

    def label(k):
        if k.startswith('trigger:'):
            _, on, do = k.split(':', 2)
            return '%s: %s' % (tlab.get(on, on), alab.get(do, do))
        return labels.get(k) or (k[:1].upper() + re.sub(r'([A-Z])', r' \1', k[1:]))

    cards = {c['id']: c for c in load('canonical/cards.json')}
    pools = load('canonical/map-pools.json')['maps']
    deliv = load('canonical/skill-delivery.json')['delivery']
    ranged_other = sorted(k for k, v in deliv.items() if v == 'ranged' and k not in SHOOT)
    gmaps = {m['id']: m for m in gd['maps']}
    proposals = json.load(open(PROPOSALS, encoding='utf-8')) if os.path.exists(PROPOSALS) else {'maps': {}}

    # The road: Tutorial (T-1..T-5, its two lists), then the main maps in the game's order, each followed by the side maps that open
    # at its number (gamedata unlockNo, ENG34).
    main_order = [m for m in gd['mainOrder'] if m in gmaps and (gmaps[m].get('no') or 0) <= 20]
    sides = [m for m in gd['maps'] if m['sub'] and m['id'] not in SKIP_MAPS and m['id'] not in ('mtut', 'mtut12')]
    parent_of = {}
    for mid, ent in pools.items():
        for sid in (ent.get('submaps') or {}):
            parent_of[sid] = mid

    def side_list(sid):
        return pools.get(parent_of.get(sid, ''), {}).get('submaps', {}).get(sid, [])

    rows = [{'id': 'mtut', 'name': 'Tutorial', 'no': 'T', 'kind': 'main', 'unlock': -1,
             'cards': list(dict.fromkeys(side_list('mtut12') + side_list('mtut')))}]
    for mid in main_order:
        m = gmaps[mid]
        rows.append({'id': mid, 'name': m['name'], 'no': m['no'], 'kind': 'main', 'unlock': m['no'],
                     'cards': list(pools.get(mid, {}).get('cards', [])), 'blurb': m.get('blurb', '')})
        for s in sorted([s for s in sides if s.get('unlockNo') == m['no']], key=lambda s: s['id']):
            rows.append({'id': s['id'], 'name': s['name'], 'no': s['no'], 'kind': 'side', 'unlock': s['unlockNo'],
                         'parent': s['parent'], 'parentName': gmaps.get(s['parent'], {}).get('name', s['parent']),
                         'cards': side_list(s['id']), 'blurb': s.get('blurb', '')})
    late_sides = sorted([{'id': s['id'], 'name': s['name'], 'unlock': s['unlockNo'], 'parentNo': s['no']} for s in sides
                         if (s.get('unlockNo') or 99) > 20 and (s.get('no') or 99) <= 20], key=lambda x: x['unlock'])

    name_of = {r['id']: r['name'] for r in rows}
    seen_main, seen_any = {}, {}   # skill -> map row id where first seen
    first_card_map = {}            # card -> first row it is on (a card is "the map's own" on its first list)
    out_rows = []
    for r in rows:
        own = []
        for cid in r['cards']:
            if cid not in first_card_map:
                first_card_map[cid] = r['id']
                own.append(cid)
        sk_cards = collections.defaultdict(list)   # skill -> [card ids on this list]
        for cid in r['cards']:
            c = cards.get(cid)
            if not c:
                continue
            for k, tag in card_skills(c, labels).items():
                sk_cards[k].append(cid + ('' if tag == 'base' else '@' + tag))
        new = {}
        for k, cl in sk_cards.items():
            if r['kind'] == 'main' and k not in seen_main:
                new[k] = cl
            elif r['kind'] == 'side' and k not in seen_main and k not in seen_any:
                new[k] = cl
        side_first = {k: seen_any[k] for k in new if r['kind'] == 'main' and k in seen_any}  # a side map showed it first
        for k in sk_cards:
            if r['kind'] == 'main':
                seen_main.setdefault(k, r['id'])
            seen_any.setdefault(k, r['id'])

        def cnt(keys):
            hit = {}
            for k in keys:
                for cid in sk_cards.get(k, []):
                    hit.setdefault(cid.split('@')[0], []).append(label(k))
            return hit

        def nm(cid):
            return cards.get(cid, {}).get('name', cid)

        g, s, q = cnt(GUARD), cnt(SHOOT), cnt(QUICK)
        ro = cnt(ranged_other)
        trig_new = {k: v for k, v in new.items() if k.startswith('trigger:')}
        skill_new = {k: v for k, v in new.items() if not k.startswith('trigger:')}
        sig_cand = sorted([k for k, v in skill_new.items() if len(v) >= 2 and k not in DRAWBACK], key=lambda k: -len(skill_new[k]))
        minor = sorted([k for k in skill_new if k not in sig_cand], key=lambda k: label(k))
        out_rows.append({
            'id': r['id'], 'name': r['name'], 'no': r['no'], 'kind': r['kind'], 'unlock': r['unlock'],
            'parent': r.get('parent'), 'parentName': r.get('parentName'), 'blurb': r.get('blurb', ''),
            'listSize': len(r['cards']), 'ownCards': [nm(c) for c in own],
            'newSkills': {label(k): {'key': k, 'cards': [nm(c.split('@')[0]) + ('' if '@' not in c else ' (' + c.split('@')[1] + ')') for c in v]}
                          for k, v in sorted(skill_new.items(), key=lambda x: (-len(x[1]), label(x[0])))},
            'newTriggers': {label(k): [nm(c.split('@')[0]) for c in v] for k, v in trig_new.items()},
            'newCount': len(skill_new), 'newOnTwoPlus': len(sig_cand), 'newOneCard': len(minor),
            'signatureCandidates': [label(k) for k in sig_cand], 'minorNew': [label(k) for k in minor],
            'seenFirstOnSide': {label(k): name_of.get(v, v) for k, v in side_first.items()},
            'topSkills': {label(k): len(v) for k, v in sorted(sk_cards.items(), key=lambda x: -len(x[1]))
                          if len(v) >= 2 and not k.startswith('trigger:')},
            'basics': {'guardians': {nm(c): v for c, v in g.items()}, 'ranged': {nm(c): v for c, v in s.items()},
                       'quick': {nm(c): v for c, v in q.items()}, 'rangedOther': {nm(c): v for c, v in ro.items()}},
            'proposal': proposals.get('maps', {}).get(r['id']),
        })

    # Flags
    for o in out_rows:
        f = []
        lim = None
        if o['kind'] == 'main' and o['no'] != 'T':
            lim = 3 if int(o['no']) < 10 else 2
            if o['newCount'] > lim:
                f.append('%d new skills (limit %d)' % (o['newCount'], lim))
        if o['kind'] == 'side' and o['newCount'] > 1:
            f.append('side map: %d new skills (limit 1)' % o['newCount'])
        if o['kind'] == 'main' and o['no'] != 'T' and o['newOnTwoPlus'] == 0:
            f.append('no clear signature (no new skill on 2+ cards)')
        for b, nmb in (('guardians', 'guardian'), ('ranged', 'ranged'), ('quick', 'quick attacker')):
            n = len(o['basics'][b])
            if n == 0:
                f.append('no %s' % nmb)
        o['flags'] = f
        o['limit'] = lim

    # Cards on no list (out of play, LISTFIX1) that would add a basic: the bench the proposals draw from.
    listed = set(first_card_map)
    for ent in pools.values():
        listed |= set(ent.get('cards', [])) | set(ent.get('special', []))
        for l in (ent.get('submaps') or {}).values():
            listed |= set(l)
    bench = []
    for cid, c in cards.items():
        if cid in listed or c.get('test') or c.get('token') or c.get('locked') and not c.get('unattainable'):
            continue
        sk = card_skills(c, labels)
        kinds = [b for b, keys in (('guardian', GUARD), ('ranged', SHOOT), ('quick', QUICK)) if any(k in sk for k in keys)]
        if kinds:
            bench.append({'id': cid, 'name': c.get('name'), 'rarity': c.get('rarity', 'common'), 'stats': '%s/%s' % (c.get('attack', 0), c.get('health', 0)),
                          'animal': c.get('animal', ''), 'basics': kinds, 'skills': [label(k) for k in sk],
                          'source': (c.get('source') or {}).get('kind', '')})
    bench.sort(key=lambda b: (b['basics'][0], b['name']))

    data = {'_about': 'DES1 (2026-11-08): per map, its own cards, the skills it introduces (NEW on the main road; side maps apart), '
                      'basics coverage and the proposal. Generated by tools/des1/map_signatures_2026_11_08.py from canonical/cards.json, '
                      'canonical/map-pools.json, canonical/skill-delivery.json and the game export (tools/export_gamedata.py). '
                      'Analysis only: nothing here changes the game.',
            'definitions': {'guardians': GUARD, 'ranged': SHOOT, 'quick': QUICK, 'rangedOther': ranged_other,
                            'newMain': 'first main-road list (Tutorial, Maps 0-20 in unlock order) whose cards carry the skill (base or any level)',
                            'newSide': 'on a side map and on no earlier main or side list',
                            'signatureCandidate': 'a new skill on 2+ cards of the list, not a drawback'},
            'lateSideMaps': late_sides, 'maps': out_rows, 'unplacedBasics': bench}
    json.dump(data, open(OUT_JSON, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    open(OUT_MD, 'w', encoding='utf-8').write(render_md(data, proposals))
    print('wrote', OUT_JSON, OUT_MD, len(out_rows), 'maps')


def tick(n):
    return '✓' if n >= 2 else ('½' if n == 1 else '✗')


def render_md(data, proposals):
    rows = data['maps']
    L = []
    L.append('# Map signatures, Maps 0-20 (2026-11-08, DES1)')
    L.append('')
    L.append('**Design analysis, suggestions only: nothing here is applied.** Generated by `tools/des1/map_signatures_2026_11_08.py` '
             '(data: `map-signatures-2026-11-08.json`). The engine and `canonical/cards.json` win over this page.')
    L.append('')
    L.append('Owner, 2026-11-08 09:27: *"in each map, 2-3 new unique signifying skills (may be 1-2 in Map 10+), and then a smattering of '
             'unimportant skills ... And they also have basics like guardians, arrow users, and quick-attackers."* New skills count on the '
             'main road only; side maps 0-1 (rarely 2).')
    L.append('')
    L.append('## Summary')
    L.append('')
    L.append('New = skills no earlier main-road list carries (side maps: none earlier at all). Basics: **G** guardians, **R** ranged '
             '(shooters), **Q** quick attackers; ✓ 2+ cards, ½ one card, ✗ none. Proposed counts are signatures + kept minors.')
    L.append('')
    L.append('| Map | Signature skills (proposed) | New now → proposed | G | R | Q |')
    L.append('|---|---|---|---|---|---|')
    for o in rows:
        p = o.get('proposal') or {}
        name = ('**%s** %s' % (o['no'], o['name'])) if o['kind'] == 'main' else ('↳ %s *(side, opens %s)*' % (o['name'], o['unlock']))
        sig = ', '.join(p.get('signatures', [])) or '—'
        prop_n = p.get('proposedNew', '—')
        b = o['basics']
        flag = ' ⚠' if any('limit' in f or 'signature' in f for f in o['flags']) else ''
        L.append('| %s%s | %s | %d → %s | %s | %s | %s |' % (name, flag, sig, o['newCount'], prop_n, tick(len(b['guardians'])),
                                                             tick(len(b['ranged'])), tick(len(b['quick']))))
    L.append('')
    L.append('⚠ = over the new-skill limit or no clear signature today. Side maps that open after Map 20 are out of scope: ' +
             ', '.join('%s (opens %s)' % (s['name'], s['unlock']) for s in data['lateSideMaps']) + '.')
    L.append('')
    # Top flags
    L.append('## Flags')
    L.append('')
    over = [o for o in rows if any('limit' in f for f in o['flags'])]
    nosig = [o for o in rows if any('no clear signature' in f for f in o['flags'])]
    worst = sorted(over, key=lambda o: -o['newCount'])[:6]
    L.append('- **Over the new-skill limit:** %d of %d maps. Worst: ' % (len(over), len(rows)) +
             ', '.join('%s %d' % (o['name'], o['newCount']) for o in worst) + '.')
    L.append('- **No clear signature (no new skill on 2+ cards):** ' + (', '.join(o['name'] for o in nosig) or 'none') + '.')
    for b, word in (('guardians', 'guardian'), ('ranged', 'ranged unit'), ('quick', 'quick attacker')):
        miss = [o['name'] for o in rows if not o['basics'][b]]
        mm = [o['name'] for o in rows if not o['basics'][b] and o['kind'] == 'main']
        L.append('- **No %s:** %d main maps (%s), %d side maps.' % (word, len(mm), ', '.join(mm) or 'none', len(miss) - len(mm)))
    for line in proposals.get('topFlags', []):
        L.append('- ' + line)
    L.append('')
    L.append('## How it was counted')
    L.append('')
    d = data['definitions']
    L.append('- A map\'s cards: its list in `canonical/map-pools.json` (a side map: its whole submap list). "Own" = first list it is on.')
    L.append('- Skills: every skill on a card, base or any level (`levelSkills`), one per family (ENG35). Custom triggers (On X: do Y) '
             'are listed apart and not counted.')
    L.append('- Guardians: ' + ', '.join(d['guardians']) + '. Ranged: the single shots and ranged swings of `canonical/skill-delivery.json` '
             '(arrows, bolts, spits, Snipe, Reach, Boomerang ...); area and On Ready blasts are noted, not counted. Quick: Quick, Blitz, '
             'Haste, Speed N (swing order in the engine) and Pounce (strikes on landing).')
    L.append('')
    L.append('## Per map')
    L.append('')
    for o in rows:
        p = o.get('proposal') or {}
        head = ('### Map %s · %s' % (o['no'], o['name'])) if o['kind'] == 'main' else \
            ('### ↳ %s (side of %s, opens at Map %s)' % (o['name'], o['parentName'], o['unlock']))
        L.append(head)
        L.append('')
        if p.get('theme'):
            L.append('*' + p['theme'] + '*')
            L.append('')
        ns = o['newSkills']
        L.append('- **New skills now (%d):** ' % o['newCount'] + (', '.join('%s ×%d' % (k, len(v['cards'])) for k, v in ns.items()) or 'none'))
        if o['newTriggers']:
            L.append('- New custom triggers (not counted): ' + ', '.join('%s ×%d' % (k, len(v)) for k, v in o['newTriggers'].items()))
        b = o['basics']

        def bl(x):
            return ', '.join('%s (%s)' % (c, '/'.join(dict.fromkeys(v))) for c, v in x.items()) or '**none**'
        L.append('- **Guardians:** ' + bl(b['guardians']))
        L.append('- **Ranged:** ' + bl(b['ranged']) + (('; blasts: ' + bl(b['rangedOther'])) if b['rangedOther'] else ''))
        L.append('- **Quick:** ' + bl(b['quick']))
        if o['flags']:
            L.append('- **Flags:** ' + '; '.join(o['flags']))
        if p:
            L.append('- **Proposal:** signatures **' + (', '.join(p.get('signatures', [])) or '—') + '**.')
            for k in ('minor', 'moveLater', 'moveEarlier', 'basics', 'note'):
                if p.get(k):
                    lab = {'minor': 'Demote to minor', 'moveLater': 'Move later', 'moveEarlier': 'Move earlier',
                           'basics': 'Basics to add', 'note': 'Note'}[k]
                    L.append('  - %s: %s' % (lab, p[k]))
        L.append('')
        L.append('<details><summary>Cards (%d on the list, %d own)</summary>' % (o['listSize'], len(o['ownCards'])))
        L.append('')
        L.append(', '.join(o['ownCards']) or '(no new cards)')
        L.append('')
        if ns:
            L.append('New skill → cards: ' + '; '.join('%s: %s' % (k, ', '.join(v['cards'])) for k, v in ns.items()))
            L.append('')
        L.append('</details>')
        L.append('')
    return '\n'.join(L) + '\n'


if __name__ == '__main__':
    main()
