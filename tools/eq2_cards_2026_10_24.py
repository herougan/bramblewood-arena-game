#!/usr/bin/env python3
"""Package EQ2 (2026-10-24): the package's three new cards, appended to canonical/cards.json (json.dumps(indent=2), the file's own format).
  Clinging Leech      Uncommon 1 Lumber, Wait 1, Parasite (the owner's 10-21 Parasite note; call EQ2-4). Awaiting a source.
  Barnacle Bulwark    Rare raid card (the Goliath; Forge, Raid tab), 2 Lumber, Wait 2, Guardian + Armor 1 (N22-12: tanky guardian raiders).
  Reefback Turtle     Very Rare raid card (the Goliath), 2 Lumber, Wait 2, Guardian + Shell 2 (N22-12).
Stats: the shape below, then fitted by the budget at Level 1 (node tools/eq2_cards_fit_2026_10_24.js: the most stats in that shape that pass
both rules at Level 1 and the card's start level, as a fresh card). Run order:
  python3 tools/eq2_cards_2026_10_24.py add      append (or reset) the cards at their shape
  node tools/unit_themes.js && node tools/forge_curve_2026_10_19.js maps
  node tools/eq2_cards_fit_2026_10_24.js > /tmp/fit.json && python3 tools/eq2_cards_2026_10_24.py fit /tmp/fit.json
"""
import json, os, sys, uuid
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'cards.json')
NS = uuid.UUID('6f1c2a7e-3b0d-4e55-9a1e-0e2000000024')  # the package's namespace: each card's uuid is uuid5(NS, its id)
NOTE = '2026-10-24 (package EQ2) '
CARDS = [
 {"id": "clinging-leech", "name": "Clinging Leech", "icon": "🪱", "cost": 1, "wait": 1, "attack": 2, "health": 4, "rarity": "uncommon", "locked": True, "test": False,
  "archetypes": ["Swamp", "Leech"], "species": ["Annelid"], "animal": "leech", "dmgType": "physical", "resist": [], "tags": [], "effects": {"parasite": True},
  "flavor": "It never picks a fight. It picks a host, and it holds on until the host gives up.", "awaitingSource": True,
  "creatorNote": NOTE + "(the owner's 10-21 Parasite note: \"Hooks onto enemy units? Not just leech-attacking from our side. So you place onto an enemy such that their column would be in reach.\"): the first Parasite card. Played onto an enemy unit in reach it feeds on it each round (its Attack, healing itself as much) and drops onto your side when its host dies; played into a slot it is a plain unit. Stats by the budget (fit below). Art: placeholder (the emoji). Awaiting a source (call EQ2-4)."},
 {"id": "barnacle-bulwark", "name": "Barnacle Bulwark", "icon": "🦀", "cost": 2, "wait": 2, "attack": 1, "health": 8, "rarity": "rare", "locked": True, "test": False,
  "archetypes": ["Crustacean", "Ocean"], "species": ["Crustacean"], "animal": "crab", "dmgType": "physical", "resist": [], "tags": [], "effects": {"guardian": True, "armor": 1},
  "flavor": "Every shell that ever washed up on the reef is glued to its back. The kraken's beak has tried most of them.",
  "source": {"kind": "raid", "id": "goliath"}, "raid": "goliath",
  "creatorNote": NOTE + "(owner N22-12: \"Future raids, you probably want tanky guardians\"): a tanky Guardian for the raiders, crafted in the Forge's Raid tab from Goliath trophy shards. On the raid board a Guardian covers the ally to its left, right, in front and behind, and takes the Goliath's new single-target Beak Strike for them. Stats by the budget (fit below). Art: placeholder (the emoji)."},
 {"id": "reefback-turtle", "name": "Reefback Turtle", "icon": "🐢", "cost": 2, "wait": 2, "attack": 1, "health": 9, "rarity": "veryrare", "locked": True, "test": False,
  "archetypes": ["Turtle", "Ocean"], "species": ["Reptile"], "animal": "sea turtle", "dmgType": "physical", "resist": [], "tags": [], "effects": {"guardian": True, "shell": 2},
  "flavor": "Coral has grown on its shell for a hundred years. The little fish hide behind it, and so do the otters.",
  "source": {"kind": "raid", "id": "goliath"}, "raid": "goliath",
  "creatorNote": NOTE + "(owner N22-12): a second tanky Guardian raider (Goliath, Forge Raid tab): Shell 2 pulls in after the first hit, so it soaks the Beak Strike it steps in for. Stats by the budget (fit below). Art: placeholder (the emoji)."},
]
def load(): return json.load(open(PATH, encoding='utf-8'))
def save(cs):
    with open(PATH, 'w', encoding='utf-8') as fh: fh.write(json.dumps(cs, indent=2) + '\n')
def add():
    cs = load(); ids = {c['id'] for c in CARDS}
    keep = [c for c in cs if c['id'] not in ids]
    nid = max(c.get('numericId', 0) for c in keep) + 1
    for c in CARDS:
        d = dict(c); d['numericId'] = nid; nid += 1; d['uuid'] = str(uuid.uuid5(NS, c['id'])); keep.append(d)
    save(keep); print('added', ', '.join(ids))
def fit(path):
    got = json.load(open(path, encoding='utf-8')); cs = load()
    for c in cs:
        f = got.get(c['id'])
        if not f: continue
        a, h = f['attack'], f['health']
        if 'Fit:' not in c.get('creatorNote', ''): c['creatorNote'] += ' Fit: %d/%d -> %d/%d (%s%% of N %s).' % (c['attack'], c['health'], a, h, f['use'], f['N'])
        c['attack'], c['health'] = a, h
    save(cs); print('fitted', ', '.join('%s %d/%d' % (k, v['attack'], v['health']) for k, v in got.items()))
if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'add'
    if cmd == 'add': add()
    elif cmd == 'fit': fit(sys.argv[2])
