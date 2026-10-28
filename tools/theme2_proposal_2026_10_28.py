#!/usr/bin/env python3
"""THEME2 (2026-10-28): THEME1's builder (tools/theme1_proposal_2026_10_28.py) with the owner's corrected sizes (10-28 22:47):
  "side maps -> i meant submaps. For main maps, there can be 8-11 cards + 4-5 carried over, 12-16 in total. Submaps would be 1-3 cards
  + 10+ carried over, so 11-14. Don't worry about the other cards."
  - Main maps: 8 unique as before, then up to 11 with strongly themed cards only (theme fit +3 or better: the map's own or other biome);
    4-5 carried (5, or 4 when the unique list is full), picked for the mix: a high-cost card, a generator and a plain creature first.
  - Submaps: THEME1's delve / challenge table (3 / 1 / ask 2) unchanged; 10+ carried (12 in all where the cards are there, 14 at most) from the
    parent map and earlier maps, and a carried card must fit the submap (theme fit +1 or better, kin counts).
  - "Don't worry about the other cards": no pack-only / no-home homing. Cards on no list are simply listed, per old pack.
  - The mix check stays: every list has a generator and a high-cost card.
Writes docs/balance/theme2-proposal-2026-10-28.json and .md (THEME1's files stay as history).

THEME1's own notes follow.

THEME1 (2026-10-28): the owner's balancing plan, steps 1 and 2, as a PROPOSAL (owner 10-28 21:40: "Thematic 1st, winnowing 2nd ...").

  Step 1, thematic: "uniquely identifying unique cards for each map".
  Step 2, winnowing: "cutting it down to that 8-11 if too big. Note 3-5 cards can be from previous maps, no issue."
  Step 4 (looked ahead, the mix check): "A map should have a range of cards that cost high, and cost generators and normal creatures."

Reads only (nothing in canonical/ changes): canonical/cards.json, map-pools.json, card-obtain-maps.json, unit-themes.json, docs/balance/decks.json,
the CONTENT4 plan's labels (showcase / first-clear pack), arena_app.js (map names, blurbs, field effects) through tools/hub/mapcards_data.py (HUB9).
Writes docs/balance/theme1-proposal-2026-10-28.json and .md.

How a card gets its one home (a score per card and map; the best free map wins, highest scores placed first):
  - its theme: the card's biomes (unit-themes.json) against the map's own biome (+4), the map's other biomes (+3), a kin biome (+1), none (-3);
  - its present home: the pack map or skirmish map in its source (+3), on the map's list now (+1.5 new, +0.5 carried), played in the map's
    fights (+0.5 a fight, at most +2), a showcase / first-clear-pack label (+2);
  - its pack: inside its pack tier's map range (+1), past it (-1);
  - hard limits: never on a map before the card is first obtainable (card-obtain-maps.json, a pack tier's first map), never past the rarity the
    map reveals; above the map's boss cap -2.
  A skirmish reward stays on its own map (it is that map's drop). Unique cap: 8 on a main map, 6 on a side map; then 3-5 carried cards
  (11 at most in all). Each map gets a cost generator and a high-cost card if any candidate has one (a swap with its weakest card, or a carried
  card). The tutorial and the endless dungeons (mtut, mm, muc, mlb) keep their lists, as HUB9 and CONTENT4 left them.

Usage: python3 tools/theme1_proposal_2026_10_28.py   (prints a summary; writes the two files)"""
import json, os, re, sys, collections, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'hub'))
import mapcards_data as MC   # noqa: E402  (HUB9's builder: lists in road order, caps, flags)
import hub5_data as H5       # noqa: E402

OUT_JSON = os.path.join(ROOT, 'docs', 'balance', 'theme2-proposal-2026-10-28.json')
OUT_MD = os.path.join(ROOT, 'docs', 'balance', 'theme2-proposal-2026-10-28.md')
# 2026-10-28 (THEME2, owner 22:47): main maps 8-11 unique + 4-5 carried (12-16); submaps 1-3 unique + 10+ carried (11-14).
CAP_UNIQUE_MAIN, UNIQUE_BASE_MAIN, CARRY_MIN, CARRY_MAX, TOTAL_MAIN = 11, 8, 4, 5, (12, 16)
STRONG_FIT = 3          # a main map's 9th-11th unique slot takes only a card whose biome is the map's own or other biome
SUB_CARRY_MIN, SUB_TARGET, SUB_TOTAL, SUB_FIT = 10, 12, (11, 14), 1   # a submap's carried card fits it (kin or better)
TIER_RANGE = {1: (0, 6), 2: (7, 13), 3: (14, 20), 4: (21, 27)}
GEN_LUMBER = {'onReadyGold', 'onSpawnGold', 'bounty', 'midas', 'swipe', 'stockpile', 'milling', 'felling', 'salvage', 'scavenge', 'coppice',
              'driftwood', 'pearlBed', 'lumberjack'}
GEN_STONE = {'quarry', 'stonecutter'}
GEN_METAL = {'prospector', 'smelter'}
HIGH_COST = 2          # Lumber 2+ (or any Stone / Metal cost) is "high cost": 141 of 894 cards
FIELD_LABEL = {'undergrowth': 'Undergrowth', 'sporeCloud': 'Spore Cloud', 'graspingBriars': 'Grasping Briars', 'frozen': 'Frigid (frozen ground)',
               'arrowSlits': 'Arrow Slits', 'thunderstorm': 'Thunderstorm', 'ashy': 'Ashy', 'canopy': 'High Canopy', 'sulphurFumes': 'Sulphur Fumes',
               'mirage': 'Mirage', 'slippery': 'Slippery ice', 'tide': 'Tide', 'swampFever': 'Swamp Fever', 'landslide': 'Landslide',
               'firstBlood': 'First Blood', 'heatwave': 'Heatwave', 'sandstorm': 'Sandstorm', 'ashRain': 'Ash Rain', 'crushingDepths': 'Crushing Depths',
               'lavaSpout': 'Lava Spout', 'frostResist': 'frost (Freezing / Frostbite)', 'quietContemplation': 'Quiet Contemplation (21-6 only)',
               'hail': 'Hail', 'dark': 'Darkness', 'pitch': 'Pitch Black', 'tallGrass': 'Tall Grass'}
# Owner 10-28 21:49 (coordinator relay): "submaps should have only 1-3 unique cards. (How to decide - you can ask me. But to me, it's how
# obviously supposedly a full dwelve into a new location or just additional challenges)". A full delve gets 3, additional challenges 1, and a
# side map we could not call is "ask owner" (2 as a placeholder). The owner corrects this table; re-run the script after.
SIDE_UNIQUE = {'delve': 3, 'challenge': 1, 'ask': 2}
SIDE_CLASS = {
    'mp': ('delve', 'A pond of its own (river, lily pads, beaver dams) off a beach map, 7 fights: a new biome, not more of the beach.'),
    'mg': ('ask', 'A sea cave under Pebble Beach with its own darkness, but only 4 fights and half coast: a new place or the beach\'s extra challenge?'),
    'mz': ('challenge', 'Under the Morel Hollow, the same fungal biome, 5 fights: more of the parent\'s hollow.'),
    'mj': ('ask', 'A sunken ferry with its own pitch dark and Crushing Depths, but the same reef biome as Coral Current, 5 fights.'),
    'mq': ('ask', 'A meadow opening at Map 12 off Thistlewood (Map 1) with its own Thunderstorm, but the same meadow biome, 5 fights.'),
    'ms': ('challenge', 'The swamp swallowing an old forest: the same swamp biome as Gatorback Swamp, 4 fights.'),
    'mv': ('challenge', 'The oldest nests on the same mountain as Eyrie Heights, 4 fights.'),
    'mn': ('ask', 'Deeper in the same caves as Caves & Alcoves, 4 fights, but a new crystal / shiny theme with its own Mirage.'),
    'my': ('delve', 'The rainforest roof: a jungle biome, not the savanna of its parent, with its own High Canopy.'),
    'mpd': ('delve', 'Its own biome (the pale desert past the glass), 9 fights.'),
    'me': ('ask', 'Inside the Sundered Peak\'s crater, same volcanic biome, but 7 fights and its own people (the dead at the fire).'),
    'mx': ('challenge', 'The Sundered Peak\'s own finale: the dragon\'s lair and the world boss, 4 fights.'),
    'mo': ('challenge', 'A return to the Outskirts\' thorns for a late challenge, 4 fights.'),
    'mi': ('challenge', 'An ice cave under Wolfsbane Tundra, the same tundra biome, 4 fights.'),
    'm9': ('delve', 'A furnace city of its own (10 fights, the metal and fire workshops), a full map in size.'),
}
# Hand calls (THEME1): the biome tags put these nowhere useful; each is a card with a clear story home.
MANUAL = {
    'beaver-lumberjack': ('m1', 'Stockpile was built for this beaver (ENG9); Map 0 has the river, and "Beavers build for the Legion" (lore bible): Map 0\'s cost generator'),
    'ore-smelter-mole': ('m9', 'a mole that makes Metal belongs in the foundry: Basalt Foundry introduces Metal'),
    'anvilwhisker-otter': ('m9', 'an otter smith that forges weapons for Stone: the foundry\'s workshop'),
}
SKILL_LABEL_FALLBACK = lambda k: re.sub(r'([a-z])([A-Z])', r'\1 \2', k).capitalize()


def L(*p):
    with open(os.path.join(ROOT, *p), encoding='utf-8') as f:
        return json.load(f)


def map_blocks():
    """Map name, blurb, mapField and the rule keys its fights share, read out of CONQUEST_MAPS in arena_app.js."""
    src = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
    a = src.index('const CONQUEST_MAPS = [')
    b = src.index('const CONQUEST_MAPS_BASELINE', a)
    parts = re.split(r'\n  \{ id:"', src[a:b])
    out = {}
    for p in parts[1:]:
        mid = p.split('"')[0]
        g = lambda rx: (re.search(rx, p) or [None, None])[1]
        head = p.split('nodes:')[0]
        mf = re.search(r'mapField:\{([^}]*)\}', head)
        mfk = re.findall(r'"?(\w+)"?\s*:\s*("?[\w.]+"?)', mf.group(1)) if mf else []
        nodes = len(re.findall(r'\{ key:"', p))
        rk = collections.Counter()
        for m in re.finditer(r'rules:\{', p):
            i, depth, j = m.end(), 1, m.end()
            while depth and j < len(p):
                depth += {'{': 1, '}': -1}.get(p[j], 0)
                j += 1
            body, keys, d = p[i:j - 1], set(), 0
            for k in re.finditer(r'[{}]|"?(\w+)"?\s*:\s*("?[\w.]+"?|\[|\{)?', body):
                t = k.group(0)
                if t == '{':
                    d += 1
                elif t == '}':
                    d -= 1
                elif d == 0 and k.group(1):
                    v = (k.group(2) or '').strip('"')
                    if k.group(1) == 'field' and v:
                        keys.add(v)
                    elif k.group(1) not in ('boon', 'hqHp', 'field', 'heatLevel', 'frostCount', 'frostWait'):
                        keys.add(k.group(1))
            rk.update(keys)
        fields = []
        for k, v in mfk:
            v = v.strip('"')
            fields.append(v if k == 'field' else k)
        for k, n in rk.most_common():
            if k not in fields and (n * 2 >= max(1, nodes) or not fields) and n >= 1:
                fields.append(k + ('' if n * 2 >= nodes else ' (%d of %d fights)' % (n, nodes)))
        out[mid] = {'name': g(r'name:"([^"]*)"'), 'blurb': g(r'blurb:"([^"]*)"'), 'fields': fields, 'nodes': nodes}
    dm = re.search(r'const DARK_MAPS = new Map\(\[(.*?)\]\);', src)
    if dm:
        for k, v in re.findall(r"\['(\w+)','(\w+)'\]", dm.group(1)):
            if k in out:
                out[k]['fields'].append(v)
    return out


def field_text(fs):
    if not fs:
        return 'no field effect'
    lab = []
    for f in fs:
        base, _, rest = f.partition(' ')
        lab.append(FIELD_LABEL.get(base, SKILL_LABEL_FALLBACK(base)) + ((' ' + rest) if rest else ''))
    return ', '.join(dict.fromkeys(lab))


def main():
    canon = L('canonical', 'cards.json')
    by = {c['id']: c for c in canon}
    mc = MC.mapcards(ROOT, canon)
    om = L('canonical', 'card-obtain-maps.json').get('maps', {})
    ut = L('canonical', 'unit-themes.json')
    units = {u['id']: u for u in ut['units']}
    biomes = {b['id']: b for b in ut['vocab']['biomes']}
    blabel = {b['id']: b['label'] for b in ut['vocab']['biomes']}
    decks = {m['id']: m['nodes'] for m in L('docs', 'balance', 'decks.json')['maps']}
    blocks = map_blocks()
    try:
        skl = {s['key']: s['label'] for s in L('docs', 'balance', 'hub-cards.json').get('skills', [])}
    except Exception:
        skl = {}
    lists = mc['lists']
    lk = {m['key']: m for m in lists}
    active = [m for m in lists if not m['skipped']]
    # ---- per card facts ----
    def src(c):
        return c.get('source') or {}

    def gen_kind(c):
        e = c.get('effects') or {}
        out = set()
        if GEN_LUMBER & set(e):
            out.add('lumber')
        if GEN_STONE & set(e):
            out.add('stone')
        if GEN_METAL & set(e):
            out.add('metal')
        for t in e.get('triggers') or []:
            if isinstance(t, dict) and t.get('do') == 'gain' and t.get('resource') in ('lumber', 'stone', 'metal'):
                out.add(t['resource'])
        return sorted(out)

    def is_creature(c):
        return c.get('cardType') in (None, 'creature') and not c.get('spell') and not c.get('equip')

    def is_high(c):
        return (c.get('cost') or 0) >= HIGH_COST or (c.get('stoneCost') or 0) > 0 or (c.get('metalCost') or 0) > 0

    def obtain(i):
        o = om.get(i)
        c = by[i]
        s = src(c)
        if s.get('kind') == 'pack' and s.get('tier') in TIER_RANGE:
            o = max(o or 0, TIER_RANGE[s['tier']][0])
        return o or 0

    def placeable(c):
        """A card the proposal may give a map home: a pack (tiers 1-4) card, a skirmish reward, or a creature with no source yet."""
        if c.get('test') or c.get('token') or c.get('hidden') or c.get('easterEgg') or MC.is_base(c):
            return False
        s = src(c)
        k = s.get('kind')
        if k == 'pack':
            return s.get('tier') in TIER_RANGE
        if k == 'map':
            return True
        if not k:
            return c.get('cardType') in (None, 'creature') and not c.get('spell') and not c.get('equip')
        return False

    # fights per list that play each card
    fights = {}
    for k, nodes in decks.items():
        cnt = collections.Counter()
        for n in nodes:
            for d in n['deck']:
                cnt[d['id']] += 1
        fights[k] = cnt
    # the CONTENT4 plan's labels and the lists' current ids
    roles = {m['key']: {c['id']: c['roles'] for c in m['cards']} for m in lists}
    cur = {m['key']: [c['id'] for c in m['cards']] for m in lists}
    cur_new = {m['key']: {c['id'] for c in m['cards'] if c['new']} for m in lists}

    def map_biomes(m):
        prim = set([m['biome']]) if m['biome'] else set()
        more = set(m['biomes']) - prim
        kin = set()
        for b in m['biomes']:
            kin |= set((biomes.get(b) or {}).get('kin') or [])
            kin |= {x for x, v in biomes.items() if b in (v.get('kin') or [])}   # kin both ways: a meadow card fits the redwood a little
        return prim, more, kin - prim - more

    MB = {m['key']: map_biomes(m) for m in lists}

    def fit(i, m):
        u = units.get(i)
        cb = set((u or {}).get('biomes') or [])
        if not cb:
            return 0.0, 'no biome tag'
        prim, more, kin = MB[m['key']]
        if cb & prim:
            return 4.0, blabel.get(next(iter(cb & prim)))
        if cb & more:
            return 3.0, blabel.get(next(iter(cb & more)))
        if cb & kin:
            return 1.0, 'kin: ' + blabel.get(next(iter(cb & kin)), '')
        return -3.0, 'misfit (' + ', '.join(blabel.get(b, b) for b in sorted(cb)) + ')'

    def rar_ok(i, m):
        st = MC.step(by[i].get('rarity'))
        if st is None:
            return True, 0
        cp = m['cap']
        reach = max(MC.step(cp['reveal']), MC.step(cp['boss']))
        if st > reach:
            return False, 0
        return True, (-2 if st > MC.step(cp['boss']) else 0)

    def home_of(c):
        s = src(c)
        if s.get('kind') == 'map':
            return s.get('id')
        if s.get('kind') == 'pack':
            return s.get('map')
        return None

    def score(i, m, for_carry=False):
        c = by[i]
        if obtain(i) > m['no']:
            return None
        ok, rpen = rar_ok(i, m)
        if not ok:
            return None
        f, why = fit(i, m)
        sc = f + rpen
        k = m['key']
        if not for_carry:
            if home_of(c) == k:
                sc += 3
            if i in cur_new.get(k, ()):
                sc += 1.5
            elif i in cur.get(k, ()):
                sc += 0.5
            rl = roles.get(k, {}).get(i) or []
            if any(r in ('showcase', 'first-clear pack') for r in rl):
                sc += 2
            s = src(c)
            if s.get('kind') == 'pack' and s.get('tier') in TIER_RANGE:
                a, b = TIER_RANGE[s['tier']]
                sc += 1 if a <= m['no'] <= b else -1
        sc += min(2.0, 0.5 * fights.get(k, {}).get(i, 0))
        return round(sc, 2), why

    # ---- candidates ----
    pool = set()
    for m in active:
        pool |= set(cur[m['key']])
    pool |= {c['id'] for c in canon if src(c).get('kind') == 'pack' and src(c).get('tier') in TIER_RANGE}
    pool |= {c['id'] for c in canon if src(c).get('kind') == 'map'}
    pool |= {c['id'] for c in canon if not src(c).get('kind')}
    cand = sorted(i for i in pool if placeable(by[i]))
    # ---- step 1: one home a card ----
    home, hscore, hwhy = {}, {}, {}
    ucount = collections.Counter()
    cap = {m['key']: (SIDE_UNIQUE[SIDE_CLASS.get(m['key'], ('ask',))[0]] if m['sub'] else CAP_UNIQUE_MAIN) for m in active}

    def origin(i):
        h = home_of(by[i])
        if h in lk and not lk[h]['skipped']:
            return h
        for m in active:
            if i in cur_new[m['key']]:
                return m['key']
        return None
    # a skirmish reward stays on its map
    for i in cand:
        c = by[i]
        s = src(c)
        if s.get('kind') == 'map' and s.get('id') in cap:
            m = lk[s['id']]
            r = score(i, m)
            home[i] = s['id']
            hscore[i] = (r[0] if r else 0) + 100
            hwhy[i] = (r[1] if r else 'its skirmish reward') + '; skirmish reward of ' + (s.get('node') or s['id'])
            ucount[s['id']] += 1
    # the hard calls made by hand (THEME1): a card whose theme the biome tags miss
    for i, (k, why) in MANUAL.items():
        if i in by and k in cap and i not in home:
            home[i], hscore[i], hwhy[i] = k, 100, 'hand call: ' + why
            ucount[k] += 1
    pairs = []
    allfits = collections.defaultdict(list)
    for i in cand:
        for m in active:
            r = score(i, m)
            if r is None:
                continue
            sc, why = r
            f, _ = fit(i, m)
            if f >= 3:
                allfits[i].append(m['key'])
            if i in home:
                continue
            o = origin(i)
            if o and lk[o]['sub'] and m['key'] not in (o, lk[o]['parent']):
                continue   # owner 21:49: a card that loses its side-map home goes to the parent map if it fits, else pack only / no home
            if o and lk[o]['sub'] and m['key'] == lk[o]['parent'] and f >= 1:
                pairs.append((sc, i, m['key'], why + '; from the side map ' + lk[o]['name']))
                continue
            # a card needs a reason to be here: its theme, or its present home with no misfit
            if f >= 3 or (f >= 0 and i in cur_new.get(m['key'], ())) or home_of(by[i]) == m['key']:   # its present home stays eligible, a misfit scores lower
                pairs.append((sc, i, m['key'], why))
    pairs.sort(key=lambda x: (-x[0], lk[x[2]]['no'], x[1]))
    bumped = collections.defaultdict(list)   # map -> cards that wanted it but found it full
    for sc, i, k, why in pairs:
        if i in home:
            if home[i] != k:
                bumped[k].append((sc, i, why))
            continue
        if ucount[k] >= cap[k]:
            bumped[k].append((sc, i, why))
            continue
        if not lk[k]['sub'] and ucount[k] >= UNIQUE_BASE_MAIN and fit(i, lk[k])[0] < STRONG_FIT:
            bumped[k].append((sc, i, why))   # THEME2: the room past 8 is for strongly themed cards only
            continue
        home[i], hscore[i], hwhy[i] = k, sc, why
        ucount[k] += 1
    uniq = collections.defaultdict(list)
    for i, k in home.items():
        uniq[k].append(i)
    # ---- the mix: a generator and a high-cost card on each map, by a swap where a bumped candidate has one ----
    swaps = []

    def has(ids, pred):
        return any(pred(by[i]) for i in ids)

    for m in active:
        k = m['key']
        for need, pred in (('generator', lambda c: bool(gen_kind(c))), ('high cost', is_high)):
            if has(uniq[k], pred):
                continue
            opts = [(sc, i, why) for sc, i, why in bumped[k] if pred(by[i]) and home.get(i) != k and sc >= 3]
            if not opts:
                continue
            opts.sort(key=lambda x: -x[0])
            sc, i, why = opts[0]
            prev = home.get(i)
            if prev and (src(by[i]).get('kind') == 'map' or (sum(1 for j in uniq[prev] if pred(by[j])) <= 1)):
                continue   # it is a reward, or the only one of its kind where it sits
            weak = [j for j in uniq[k] if src(by[j]).get('kind') != 'map' and not gen_kind(by[j]) and not is_high(by[j])]
            if len(uniq[k]) >= cap[k]:
                if not weak:
                    continue
                weak.sort(key=lambda j: hscore[j])
                out = weak[0]
                uniq[k].remove(out)
                del home[out]
            else:
                out = None
            if prev:
                uniq[prev].remove(i)
            home[i], hscore[i], hwhy[i] = k, sc, why + '; brought in for the mix (' + need + ')'
            uniq[k].append(i)
            swaps.append({'map': k, 'need': need, 'in': i, 'out': out, 'from': prev})
            # the card swapped out tries its next best free map
            if out:
                for sc2, j, k2, why2 in pairs:
                    if j == out and k2 != k and len(uniq[k2]) < cap[k2]:
                        home[out], hscore[out], hwhy[out] = k2, sc2, why2
                        uniq[k2].append(out)
                        break
    # ---- step 2: carried cards ----
    order = {m['key']: n for n, m in enumerate(lists)}
    carried = {}
    ccount = collections.Counter()
    base_ids = [c['id'] for c in canon if MC.is_base(c) and not c.get('test') and not c.get('token') and not c.get('hidden')]
    for m in active:
        k = m['key']
        u = uniq[k]
        # THEME2 (owner 22:47): main 4-5 carried (5, or 4 beside a full 11), 12-16 in all; submaps 10+ carried, 12 in all where it can, 14 at most
        n_c = CARRY_MAX if len(u) < CAP_UNIQUE_MAIN else CARRY_MIN
        n_c = max(n_c, TOTAL_MAIN[0] - len(u))
        if m['sub']:
            n_c = min(SUB_TOTAL[1] - len(u), max(SUB_CARRY_MIN, SUB_TARGET - len(u)))
        opts = []
        if m['no'] == 0:
            pool_c = [i for i in cur[k] if i in base_ids]
        else:
            pool_c = [i for i, hk in home.items() if hk != k and (lk[hk]['no'] < m['no'] or (m['sub'] and hk == m['parent']))]
        for i in pool_c:
            r = score(i, m, for_carry=True)
            if r is None:
                continue
            sc, why = r
            if m['sub'] and fit(i, m)[0] < SUB_FIT and m['no'] > 0:
                continue   # THEME2: a submap's carried cards must fit the submap
            if fit(i, m)[0] < 0 and i not in cur[k]:
                sc -= 6   # a misfit is carried only when nothing else is left
            if i in cur[k]:
                sc += 3
            if m['sub'] and home.get(i) == m['parent']:
                sc += 2
            if i in home and 0 <= m['no'] - lk[home[i]]['no'] <= 4:
                sc += 1   # a card the player met lately
            sc -= 0.75 * ccount[i]
            opts.append((round(sc, 2), i, why))
        opts.sort(key=lambda x: (-x[0], x[1]))
        pick = []
        if not m['sub'] and m['no'] > 0:
            # THEME2 (owner 22:47, main maps): the carried cards are picked for the mix: the best-scoring high-cost card, generator and plain
            # creature that fit the map go first, then the rest by score
            fits_ = [o for o in opts if fit(o[1], m)[0] >= 0 or o[1] in cur[k]]
            for need, pred in (('high cost', is_high), ('generator', lambda c: bool(gen_kind(c))),
                               ('creature', lambda c: is_creature(c) and not is_high(c) and not gen_kind(c))):
                alt = [o for o in fits_ if pred(by[o[1]]) and o[1] not in [p_[0] for p_ in pick]]
                if alt and len(pick) < n_c:
                    sc, i, why = alt[0]
                    pick.append((i, sc, why + '; carried for the mix (' + need + ')'))
        for sc, i, why in opts:
            if len(pick) >= n_c:
                break
            if i not in [p_[0] for p_ in pick]:
                pick.append((i, sc, why))
        # the mix: one generator and one high-cost card at least, swapped in for the weakest pick
        for need, pred in (('generator', lambda c: bool(gen_kind(c))), ('high cost', is_high)):
            if has(u, pred) or any(pred(by[i]) for i, _, _ in pick):
                continue
            alt = [o for o in opts if pred(by[o[1]]) and o[1] not in [p_[0] for p_ in pick] and (fit(o[1], m)[0] >= (SUB_FIT if m['sub'] else 0) or o[1] in cur[k])]
            if not alt:
                continue
            sc, i, why = alt[0]
            keep = lambda j: (gen_kind(by[j]) and not has(u, lambda c: bool(gen_kind(c)))) or (is_high(by[j]) and not has(u, is_high))
            drop = [x for x in reversed(pick) if not keep(x[0])]
            if len(pick) >= n_c and drop:
                pick.remove(drop[0])
            pick.append((i, sc, why + '; carried for the mix (' + need + ')'))
        carried[k] = pick
        for i, _, _ in pick:
            ccount[i] += 1
    # ---- what each skirmish fight teaches: skills first met in its decks, in road order ----
    seen_sk, newsk = set(), {}
    for m in lists:
        cnt = collections.Counter()
        for n in decks.get(m['key'], []):
            for d in n['deck']:
                for s in d.get('skills') or []:
                    if s not in seen_sk:
                        cnt[s] += 1
        newsk[m['key']] = [s for s, _ in cnt.most_common()]
        if not m['skipped']:
            seen_sk |= set(cnt)
    # ---- resources introduced ----
    res_seen = set()
    # ---- assemble per map ----
    out_maps = []
    lists_of = collections.defaultdict(list)
    for m in active:
        for i in uniq[m['key']]:
            lists_of[i].append(m['key'])
        for i, _, _ in carried[m['key']]:
            lists_of[i].append(m['key'])

    def dest(i, k):
        if i in home and home[i] != k:
            return {'kind': 'map', 'key': home[i], 'name': lk[home[i]]['name'], 'no': lk[home[i]]['no']}
        c = by[i]
        s = src(c)
        car = [x for x in lists_of.get(i, []) if x != k]
        note = ('carried on ' + ', '.join(lk[x]['name'] for x in car)) if car else ''
        if MC.is_base(c):
            return {'kind': 'base', 'note': note or 'a Base card: every player has it'}
        # THEME2 (owner 22:47 "Don't worry about the other cards"): no pack-only / no-home call; a card is carried elsewhere or on no list
        if car:
            return {'kind': 'carried', 'note': note}
        return {'kind': 'off', 'note': ''}

    def card_row(i, k, sc=None, why=None):
        c = by[i]
        s = src(c)
        return {'id': i, 'name': c.get('name', i), 'rarity': c.get('rarity') or '', 'cost': c.get('cost') or 0,
                'stone': c.get('stoneCost') or 0, 'metal': c.get('metalCost') or 0, 'gen': gen_kind(c), 'high': is_high(c),
                'src': (s.get('kind') or 'none') + ((' %s' % s.get('tier')) if s.get('kind') == 'pack' else '') + ((' ' + s['node']) if s.get('node') else ''),
                'biomes': (units.get(i) or {}).get('biomes') or [], 'score': sc, 'why': why}

    for m in lists:
        k = m['key']
        b = blocks.get(k, {})
        th = {'biome': ', '.join(blabel.get(x, x) for x in m['biomes']) or 'none', 'story': b.get('blurb') or '', 'field': field_text(b.get('fields')),
              'newSkills': [skl.get(s, SKILL_LABEL_FALLBACK(s)) for s in newsk.get(k, [])[:4]]}
        th['line'] = '%s. %s Field: %s.%s' % (th['biome'], th['story'], th['field'],
                                              (' New in its fights: ' + ', '.join(th['newSkills']) + '.') if th['newSkills'] else '')
        sc_ = SIDE_CLASS.get(k) if m['sub'] and not m['skipped'] else None
        entry = {'sideClass': ({'class': sc_[0], 'label': {'delve': 'a full delve into a new location', 'challenge': 'additional challenges on the parent map',
                                                           'ask': 'ask owner'}[sc_[0]], 'unique': SIDE_UNIQUE[sc_[0]], 'reason': sc_[1]} if sc_ else None),
                 'key': k, 'no': m['no'], 'name': m['name'], 'sub': m['sub'], 'parent': m['parent'], 'skipped': m['skipped'], 'theme': th,
                 'cap': m['cap'], 'current': {'ids': cur[k], 'n': len(cur[k]), 'new': m['n']['new'], 'carried': m['n']['old']}}
        if m['skipped']:
            entry['note'] = 'Kept as it is (the tutorial and the endless dungeons keep their lists; HUB9 / CONTENT4 SKIP_SUB).'
            out_maps.append(entry)
            continue
        u = sorted(uniq[k], key=lambda i: (-(hscore.get(i) or 0), i))
        urows = []
        for i in u:
            r = card_row(i, k, round(hscore[i] - (100 if hscore[i] >= 90 else 0), 2), hwhy[i])
            r['alsoFits'] = [x for x in allfits.get(i, []) if x != k][:4]
            r['wasHere'] = i in cur[k]
            fromk = [x for x in cur if x != k and i in cur[x] and not lk[x]['skipped']]
            r['movedFrom'] = None if r['wasHere'] else (home_of(by[i]) if home_of(by[i]) in lk else (fromk[0] if fromk else None))
            urows.append(r)
        crows = []
        for i, sc, why in carried[k]:
            r = card_row(i, k, sc, why)
            r['from'] = home.get(i) or ('base' if MC.is_base(by[i]) else None)
            r['wasHere'] = i in cur[k]
            crows.append(r)
        prop = [r['id'] for r in urows] + [r['id'] for r in crows]
        cut = [{'id': i, 'name': by[i].get('name', i), 'rarity': by[i].get('rarity') or '', 'to': dest(i, k)} for i in cur[k] if i not in prop]
        added = [i for i in prop if i not in cur[k]]
        allr = urows + crows
        n = len(allr)
        nh = sum(1 for r in allr if r['high'])
        ng = sum(1 for r in allr if r['gen'])
        npl = sum(1 for r in allr if not r['high'] and not r['gen'])
        res = sorted(set(g for r in allr for g in r['gen']) | ({'stone'} if any(r['stone'] for r in allr) else set()) | ({'metal'} if any(r['metal'] for r in allr) else set()))
        intro = [x for x in res if x != 'lumber' and x not in res_seen]
        res_seen |= set(res)
        mflags = []
        if not ng:
            mflags.append('no cost generator')
        if not nh:
            mflags.append('no high-cost card')
        lo, hi = SUB_TOTAL if m['sub'] else TOTAL_MAIN
        if n < lo:
            mflags.append('%d cards (under %d)' % (n, lo))
        if n > hi:
            mflags.append('%d cards (over %d)' % (n, hi))
        if not m['sub'] and len(u) < UNIQUE_BASE_MAIN:
            mflags.append('only %d unique' % len(u))
        if m['sub'] and len(u) > cap[k]:
            mflags.append('%d unique over its %d (skirmish rewards)' % (len(u), cap[k]))
        if m['sub'] and len(carried[k]) < SUB_CARRY_MIN:
            mflags.append('only %d fitting carried cards' % len(carried[k]))
        if not m['sub'] and m['no'] > 0 and len(carried[k]) < CARRY_MIN:
            mflags.append('only %d carried' % len(carried[k]))
        mix = {'n': n, 'high': nh, 'gen': ng, 'plain': npl, 'highShare': round(nh / n, 2) if n else 0, 'genShare': round(ng / n, 2) if n else 0,
               'plainShare': round(npl / n, 2) if n else 0, 'avgCost': round(sum(r['cost'] for r in allr) / n, 2) if n else 0,
               'avgCostUnique': round(sum(r['cost'] for r in urows) / len(urows), 2) if urows else 0,
               'resources': res, 'introduces': intro, 'flags': mflags}
        # HUB9's oddities on the current list: what this proposal resolves and what it leaves
        cur_fl = {c['id']: c['fl'] for c in m['cards']}
        resolved, left = [], []
        for i, fl in cur_fl.items():
            for f in fl:
                if f in ('unused',):
                    continue
                lab = {'late': 'listed before it is obtainable', 'nosrc': 'no source', 'many': 'on %d+ lists' % MC.THRESH_MANY, 'mis': 'theme misfit',
                       'rx': 'rarity not revealed yet', 'ra': 'above the rarity cap'}.get(f, f)
                if i not in prop:
                    resolved.append({'id': i, 'flag': lab, 'how': 'cut'})
                elif f == 'many' and len(lists_of.get(i, [])) < MC.THRESH_MANY:
                    resolved.append({'id': i, 'flag': lab, 'how': 'now on %d list(s)' % len(lists_of.get(i, []))})
                elif f == 'many':
                    left.append({'id': i, 'flag': lab})
                elif f == 'late':
                    resolved.append({'id': i, 'flag': lab, 'how': 'obtainable by then under the pack-tier rule'}) if obtain(i) <= m['no'] else left.append({'id': i, 'flag': lab})
                elif f == 'mis' and fit(i, m)[0] >= 1:
                    resolved.append({'id': i, 'flag': lab, 'how': 'kin biome'})
                else:
                    left.append({'id': i, 'flag': lab})
        for r in allr:
            if r['id'] in cur_fl:
                continue
            if not src(by[r['id']]).get('kind'):
                left.append({'id': r['id'], 'flag': 'no source yet (proposed home: this map\'s pack tier)'})
            if fit(r['id'], m)[0] < 0:
                left.append({'id': r['id'], 'flag': 'theme misfit'})
            if len(lists_of.get(r['id'], [])) >= MC.THRESH_MANY:
                left.append({'id': r['id'], 'flag': 'on %d lists' % len(lists_of[r['id']])})
        entry.update({'unique': urows, 'carried': crows, 'cut': cut, 'added': added, 'proposed': prop, 'mix': mix,
                      'counts': {'current': len(cur[k]), 'proposed': n, 'unique': len(urows), 'carried': len(crows), 'cut': len(cut), 'added': len(added)},
                      'hub9': {'resolved': resolved, 'left': left},
                      'swaps': [s for s in swaps if s['map'] == k]})
        out_maps.append(entry)
    # ---- totals: packs against the proposed lists ----
    listed_unique = set(home)
    listed_any = set(lists_of)
    packs = []
    hidden = lambda c: c.get('test') or c.get('token') or c.get('hidden')
    shop = {p['packNo']: p for p in H5.shop_packs(ROOT) if p.get('packNo')}
    for t in sorted(set(src(c).get('tier') for c in canon if src(c).get('kind') == 'pack')):
        ids = {c['id'] for c in canon if src(c).get('kind') == 'pack' and src(c).get('tier') == t and not hidden(c)}
        a, b = TIER_RANGE.get(t, (None, None))
        inr = {i for i in ids & listed_unique if a is not None and a <= lk[home[i]]['no'] <= b}
        cur_listed = {i for m in active for i in cur[m['key']]} & ids
        # THEME2: "offList" = in the old pack, on no proposed list (simply listed; no pack-only / no-home call)
        packs.append({'tier': t, 'name': shop.get(t, {}).get('name') or {11: 'Faction pool', 99: 'Mystery Booster'}.get(t) or 'Pack %s' % t,
                      'maps': ('Maps %d-%d' % (a, b)) if a is not None else '', 'cards': len(ids), 'listedNow': len(cur_listed),
                      'unique': len(ids & listed_unique), 'uniqueInRange': len(inr), 'carriedOnly': len((ids & listed_any) - listed_unique),
                      'offList': len(ids - listed_any), 'offListIds': sorted(ids - listed_any, key=lambda i: by[i].get('name', i))})
    nosrc = {i for i in cand if not src(by[i]).get('kind')}
    packs.append({'tier': None, 'name': 'No source (creatures)', 'maps': '', 'cards': len(nosrc), 'listedNow': len({i for m in active for i in cur[m['key']]} & nosrc),
                  'unique': len(nosrc & listed_unique), 'uniqueInRange': 0, 'carriedOnly': len((nosrc & listed_any) - listed_unique),
                  'offList': len(nosrc - listed_any), 'offListIds': sorted(nosrc - listed_any, key=lambda i: by[i].get('name', i))})
    placed_nosrc = sorted([i for i in listed_unique if not src(by[i]).get('kind')], key=lambda i: by[i].get('name', i))
    rewards = sum(1 for i in listed_unique if src(by[i]).get('kind') == 'map')
    totals = {'lists': len(active), 'keptLists': [m['key'] for m in lists if m['skipped']],
              'entriesNow': sum(len(cur[m['key']]) for m in active), 'entriesProposed': sum(len(e.get('proposed', [])) for e in out_maps),
              'uniqueNow': len({i for m in active for i in cur[m['key']]}), 'uniqueProposed': len(listed_unique), 'onAnyList': len(listed_any),
              'rewards': rewards, 'packUnique': sum(p['unique'] for p in packs if p['tier'] is not None),
              'offList': sum(p['offList'] for p in packs), 'offListPacks': sum(p['offList'] for p in packs if p['tier'] in TIER_RANGE),
              'noSourcePlaced': placed_nosrc,
              'swaps': len(swaps), 'moved': sum(1 for e in out_maps for r in e.get('unique', []) if r.get('movedFrom')),
              'mixFlags': {e['key']: e['mix']['flags'] for e in out_maps if e.get('mix') and e['mix']['flags']}}
    data = {'about': 'THEME2 proposal (2026-10-28): the owner\'s balancing plan steps 1 (thematic) and 2 (winnowing), per map in road order, with the owner\'s '
                     '22:47 sizes (main maps 8-11 unique + 4-5 carried, 12-16; submaps 1-3 unique + 10+ carried, 11-14). Replaces THEME1 (kept as history). '
                     'A proposal only: canonical/map-pools.json, cards.json and card-obtain-maps.json are unchanged. Built by tools/theme2_proposal_2026_10_28.py.',
            'built': datetime.date.today().isoformat(),
            'rules': {'uniqueMain': [UNIQUE_BASE_MAIN, CAP_UNIQUE_MAIN], 'strongFitPast8': STRONG_FIT, 'totalMain': list(TOTAL_MAIN), 'carried': [CARRY_MIN, CARRY_MAX],
                      'uniqueSub': SIDE_UNIQUE, 'carriedSubMin': SUB_CARRY_MIN, 'totalSub': list(SUB_TOTAL), 'subCarriedFit': SUB_FIT,
                      'highCost': 'Lumber %d+ or any Stone / Metal cost' % HIGH_COST,
                      'generators': sorted(GEN_LUMBER | GEN_STONE | GEN_METAL) + ['a trigger that gains Lumber / Stone / Metal'],
                      'tierRange': {str(k): v for k, v in TIER_RANGE.items()}},
            'sideClasses': [{'key': k, 'name': lk[k]['name'], 'class': v[0], 'unique': SIDE_UNIQUE[v[0]], 'reason': v[1]} for k, v in SIDE_CLASS.items() if k in lk],
            'maps': out_maps, 'packs': packs, 'totals': totals, 'swaps': swaps}
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    write_md(data, by)
    t = totals
    print('lists %d; entries %d -> %d; unique cards %d -> %d (rewards %d); on any list %d; on no list %d (packs 1-4: %d); swaps %d; moved %d'
          % (t['lists'], t['entriesNow'], t['entriesProposed'], t['uniqueNow'], t['uniqueProposed'], t['rewards'], t['onAnyList'], t['offList'], t['offListPacks'],
             t['swaps'], t['moved']))
    for e in out_maps:
        if e.get('counts'):
            c = e['counts']
            print('%-4s %2d %-24s %2d -> %2d  (u %d, c %d, cut %d, add %d)  mix h%d g%d p%d avg %.2f %s' % (
                e['key'], e['no'], e['name'][:24], c['current'], c['proposed'], c['unique'], c['carried'], c['cut'], c['added'],
                e['mix']['high'], e['mix']['gen'], e['mix']['plain'], e['mix']['avgCost'], '; '.join(e['mix']['flags'])))
    for p in packs:
        print(p['tier'], p['name'], p['cards'], 'unique', p['unique'], 'carried only', p['carriedOnly'], 'on no list', p['offList'])


def write_md(d, by):
    R = lambda r: H5.RARITY_LABEL.get(r, r) if r else '-'
    nm = lambda i: by[i].get('name', i) if i in by else i
    mk = {e['key']: e for e in d['maps']}
    t = d['totals']
    L_ = []
    a = L_.append
    a('# THEME2: unique cards per map, the 12-16 / 11-14 lists and the mix (proposal, 2026-10-28)')
    a('')
    a('The owner\'s balancing plan (10-28 21:40), steps 1 and 2: *"uniquely identifying unique cards for each map"* and the cut, with the sizes the owner set at 22:47: '
      '*"side maps -> i meant submaps. For main maps, there can be 8-11 cards + 4-5 carried over, 12-16 in total. Submaps would be 1-3 cards + 10+ carried over, so 11-14. '
      'Don\'t worry about the other cards."* With step 4\'s mix in view: *"A map should have a range of cards that cost high, and cost generators and normal creatures."*')
    a('')
    a('**A proposal. Nothing in `canonical/` changes.** Data: `docs/balance/theme2-proposal-2026-10-28.json`; built by `tools/theme2_proposal_2026_10_28.py`; '
      'shown in the hub\'s 🗺️ Map cards tab under **Proposal**. Decision: THEME1-1. It replaces THEME1 (`theme1-proposal-2026-10-28.md`, kept as history).')
    a('')
    a('## How it was built')
    a('')
    a('- Every card gets **one** home: the map whose theme it fits best (its biomes in `unit-themes.json` against the map\'s), with its present home '
      '(its pack map or skirmish map), its place on the list now, the fights that play it and its showcase / first-clear-pack label as tie-breakers. '
      'Highest scores are placed first; a card bumped from a full map goes to its next-best map with room.')
    a('- Hard limits: a card is never on a map before it is first obtainable (a pack tier\'s first map: Pack 2 from Map 7, Pack 3 from Map 14), '
      'never past the rarity the map reveals. A skirmish reward stays on its own map.')
    a('- **Main maps: 8-11 unique + 4-5 carried, 12-16 in all.** The first 8 unique as THEME1; slots 9-11 take only strongly themed cards (the map\'s own or other biome). '
      'Then 5 carried cards from earlier maps (4 beside a full 11), picked for the mix: the best-fitting high-cost card, generator and plain creature first, then by score. Map 0 carries Base cards.')
    a('- **Submaps: 1-3 unique + 10 or more carried, 11-14 in all.** THEME1\'s table below: 3 unique for a full delve, 1 for additional challenges, 2 where we ask. '
      'The carried cards come from the parent map and earlier maps and must fit the submap (its biome, another of its biomes or a kin biome); 12 in all where enough fit. '
      'A submap\'s skirmish rewards stay, even over its number.')
    a('- The mix: high cost = %s; a cost generator = a card that makes Lumber, Stone or Metal (Stockpile, Milling, Quarry, Prospector, Pearl Bed, '
      'On Ready / On Kill Lumber ...). Every list has at least one of each; where the unique cards have none, a bumped candidate is swapped in or a carried card brings it.' % d['rules']['highCost'])
    a('- "Don\'t worry about the other cards": cards on no list are simply listed at the end, per old pack. No pack-only or no-home calls.')
    a('- The tutorial and the endless dungeons (%s) keep their lists.' % ', '.join(t['keptLists']))
    a('')
    a('### Submaps: delve or challenge (the owner corrects this table)')
    a('')
    a('| Submap | Opens at | Call | Unique | Why |')
    a('|---|---|---|---|---|')
    for x in d['sideClasses']:
        a('| %s | %s | %s | %d | %s |' % (x['name'], mk[x['key']]['no'], {'delve': 'Full delve', 'challenge': 'Additional challenges', 'ask': '**Ask owner**'}[x['class']], x['unique'], x['reason']))
    a('')
    a('## The numbers')
    a('')
    a('| | Now | Proposed |')
    a('|---|---|---|')
    a('| List entries (%d lists) | %d | %d |' % (t['lists'], t['entriesNow'], t['entriesProposed']))
    a('| Different cards on a list | %d | %d (%d unique homes + %d carried only) |' % (t['uniqueNow'], t['onAnyList'], t['uniqueProposed'], t['onAnyList'] - t['uniqueProposed']))
    a('| Skirmish rewards among the unique | | %d |' % t['rewards'])
    a('| Cards on no list (packs, faction pool, Mystery Booster, no-source creatures) | | %d |' % t['offList'])
    a('')
    a('| Old pack | Maps | Cards | On a list now | Unique on a map | (in its range) | Carried only | On no list |')
    a('|---|---|---|---|---|---|---|---|')
    for p in d['packs']:
        a('| %s%s | %s | %d | %d | %d | %d | %d | %d |' % (p['name'], (' (tier %s)' % p['tier']) if p['tier'] is not None else '', p['maps'] or '-', p['cards'], p['listedNow'], p['unique'], p['uniqueInRange'], p['carriedOnly'], p['offList']))
    a('')
    a('## Per map, in road order')
    a('')
    a('| Map | No | Now | Proposed | Unique | Carried | Cut | Added | High / Gen / Plain | Avg cost | Mix flags |')
    a('|---|---|---|---|---|---|---|---|---|---|---|')
    for e in d['maps']:
        if e['skipped']:
            a('| %s | %s | %d | kept | | | | | | | |' % (e['name'], e['no'], e['current']['n']))
            continue
        c, m = e['counts'], e['mix']
        a('| %s%s | %d | %d | %d | %d | %d | %d | %d | %d / %d / %d | %.2f | %s |' % ('&nbsp;&nbsp;↳ ' if e['sub'] else '', e['name'], e['no'], c['current'], c['proposed'], c['unique'], c['carried'], c['cut'], c['added'],
                                                                         m['high'], m['gen'], m['plain'], m['avgCost'], ', '.join(m['flags']) or '-'))
    a('')
    for e in d['maps']:
        a('### %s %s (%s)' % ('Submap:' if e['sub'] else 'Map %d:' % e['no'], e['name'], ('opens at %d, side of %s' % (e['no'], mk.get(e['parent'], {}).get('name', e['parent']))) if e['sub'] else e['key']))
        a('')
        a('**Theme.** ' + e['theme']['line'])
        if e.get('sideClass'):
            a('')
            a('**Submap call:** %s (%d unique). %s' % (e['sideClass']['label'], e['sideClass']['unique'], e['sideClass']['reason']))
        a('')
        if e['skipped']:
            a(e['note'] + ' %d cards.' % e['current']['n'])
            a('')
            continue
        a('**Unique (%d).**' % len(e['unique']))
        for r in e['unique']:
            extra = []
            if r.get('movedFrom'):
                extra.append('moved from %s' % mk.get(r['movedFrom'], {}).get('name', r['movedFrom']))
            elif not r['wasHere']:
                extra.append('added')
            if r['alsoFits']:
                extra.append('also fits ' + ', '.join(mk[x]['name'] for x in r['alsoFits'] if x in mk))
            tag = ('🪵' if 'lumber' in r['gen'] else '') + ('🪨' if 'stone' in r['gen'] else '') + ('🔩' if 'metal' in r['gen'] else '') + (' 💰cost %d' % r['cost'] if r['high'] else '')
            a('- %s (%s, %s, cost %d)%s: %s%s' % (r['name'], R(r['rarity']), r['src'], r['cost'], (' ' + tag) if tag else '', r['why'], ('; ' + '; '.join(extra)) if extra else ''))
        a('')
        a('**Carried (%d).** ' % len(e['carried']) + ('; '.join('%s (from %s%s)' % (r['name'], mk.get(r['from'], {}).get('name', r['from']), '' if r['wasHere'] else ', added') for r in e['carried']) or 'none'))
        a('')
        if e['cut']:
            a('**Cut (%d).**' % len(e['cut']))
            for x in e['cut']:
                to = x['to']
                if to['kind'] == 'map':
                    s = 'to %s (Map %s)' % (to['name'], to['no'])
                elif to['kind'] == 'base':
                    s = 'Base card'
                elif to['kind'] == 'carried':
                    s = 'carried elsewhere'
                else:
                    s = 'on no list'
                if to.get('note') and to['kind'] != 'base':
                    s += '; ' + to['note']
                a('- %s (%s): %s' % (x['name'], R(x['rarity']), s))
            a('')
        m = e['mix']
        a('**Mix.** %d cards: %d high-cost (%d%%), %d generators (%d%%), %d plain (%d%%); average cost %.2f (unique %.2f); resources: %s%s.%s' % (
            m['n'], m['high'], round(100 * m['highShare']), m['gen'], round(100 * m['genShare']), m['plain'], round(100 * m['plainShare']), m['avgCost'], m['avgCostUnique'],
            ', '.join(m['resources']) or 'none', ('; introduces ' + ', '.join(m['introduces'])) if m['introduces'] else '', (' **Flag: ' + ', '.join(m['flags']) + '.**') if m['flags'] else ''))
        a('')
        h = e['hub9']
        if h['resolved'] or h['left']:
            res = collections.Counter(x['flag'] for x in h['resolved'])
            lef = collections.Counter(x['flag'] for x in h['left'])
            a('**HUB9 flags.** Resolved: %s. Left: %s.' % (', '.join('%d %s' % (v, k) for k, v in res.items()) or 'none',
                                                         ', '.join('%s (%s)' % (k, ', '.join(nm(x['id']) for x in h['left'] if x['flag'] == k)) for k in lef) or 'none'))
            a('')
    a('## Cards on no list, by old pack (%d)' % t['offList'])
    a('')
    for p in d['packs']:
        if p['offList']:
            a('- **%s** (%d): %s' % (p['name'], p['offList'], ', '.join(nm(i) for i in p['offListIds'])))
    a('')
    if t['noSourcePlaced']:
        a('On a list though they have no source yet (they would join that map\'s pack tier): ' + ', '.join(nm(i) for i in t['noSourcePlaced']) + '.')
        a('')
    with open(OUT_MD, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L_) + '\n')


if __name__ == '__main__':
    main()
