#!/usr/bin/env python3
"""EN6 (2026-10-24): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/en6_decisions_2026_10_24.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
U = 'docs/balance/en6-state-uptime-2026-10-24.json'
def item(i, area, title, body, options=None):
    d = {"id": i, "status": "YET", "kind": "Decide", "area": area, "title": title, "asked": "2026-10-24", "body": body}
    if options: d["options"] = options
    return d
NEW = [
 item("EN6-1", "Skills", "Hoard is taken: the hand-count skills are Full Hand N and Lean N",
  "Your 03:17 #1 (all approved at 12:02 #11): +N Attack per card in hand / per empty hand slot, and the foe-counting pair. \"Hoard\" already names the Lumber skill (+1 Attack per 2 Lumber, on the Magnate Duck), so the built names are Full Hand N, Lean N, Foe's Full Hand N and Foe's Lean N. Keep these names or rename?",
  ["Keep Full Hand / Lean", "Rename (say the names)"]),
 item("EN6-2", "Balance", "The new state skills' prices: default x uptime (the 4-round rule)",
  "Priced by logic, no robust skill test (" + U + ", 1500 CPU fights for the hand; every conquest fight's rules x 6 fights for the field). Plain prices: Plenty +1/+1 x 0.15 = 0.45, Scarcity +1/+0 x 0.79 = 1.58, Foe's Plenty +0/+2 x 0.05 = 0.1, Foe's Scarcity +1/+0 x 0.77 = 1.54, Heat +1/+0 x 0.6 = 1.2, Frost +0/+2 x 0.56 = 1.12, Rain +1/+1 x 0.05 = 0.15, Storm +2/+0 x 0.45 = 1.8, Fog {Evasive} 2.7, Salt Armor 1 x 0.25 = 0.38, Drought +1/+0 x 0.5 = 1.0, Season +1/+1 x 0.25 = 0.75; their braces cost the same uptime x what is in them. The field states take the midpoint of their uptime over all fights and over their home maps (a card made for the volcano plays about half its fights there): Heat 0.21 / 1.0, Frost 0.11 / 1.0, Storm 0.14 / 0.76, Drought 0.26 / 0.75, Salt 0.04 / 0.45, Fog 0.04 / 1.0, Rain 0.017 / 0.08. Full Hand 3.0 a point, Lean 7.5, Foe's Full Hand 2.4, Foe's Lean 7.5 (the hand averages 1.2 cards and 3.8 empty slots as combat starts). Hibernate N 0.95 a point, and its Attack counts only for the rounds it is awake (x 0.53). – bramble x0.9 of the shot or action. OK, or measure some with the robust skill test?",
  ["OK", "Measure (say which)"]),
 item("EN6-3", "Skills", "Plenty and Foe's Plenty are almost never on against the CPU",
  "As combat starts the CPU holds 0 cards 6% of the time, 1 card 73%, 2 cards 20%, 3+ 1.5% (it plays a card a turn and draws one), and so does a player who plays every turn. So Scarcity (1 or fewer) is on 79% of the time and Plenty (4+) only for a player who holds cards back; Foe's Plenty almost never against the CPU. Built as proposed (4+ / 1 or fewer). Lower Plenty to 3+ (or 2+), or keep?",
  ["Keep 4+ / 1 or fewer", "Plenty at 3+", "Plenty at 2+, Scarcity at 0"]),
 item("EN6-4", "Map effects", "Seasons: which maps run the cycle?",
  "Built as a field option (rules.seasons, in Edit skirmish; off by default and on no map): Spring, Summer, Autumn, Winter, 3 rounds each (a typical 12-round fight sees one year; 4 rounds left Winter at 14%), a log line and a float as the season turns. Summer counts as hot (Heat, not Hibernate), Winter as cold (Frost, Hibernate). Season (X) – {…} is in the editor and the Codex but on no card: with no map running the cycle it would never turn on. Which maps (or fights) get Seasons? Then a card gets Season (Winter) – {…}.",
  ["Name the maps", "Leave off for now"]),
 item("EN6-5", "Balance", "Full Hand / Lean: no card yet",
  "At 3.0 (Full Hand) and 7.5 (Lean) a point, the commons that fit lose a quarter to a third of their stats (Dormouse 2/8 -> 1/6, Chipmunk Stockpiler 1/9 -> 1/6), so none was given one. Lean 1 is about +3.8 Attack on average. Give them to a rare or higher (say which), make them halve (+N per 2 cards), or leave them in the editor only?",
  ["Leave in the editor", "Per 2 cards", "Give to a card (say which)"]),
 item("EN6-6", "Cards", "Beaver Lumberjack: On Ready, 1 Lumber (once) or every round?",
  "Your 12:02 #5: \"That lumberjack should have something like On Ready, 1 lumber instead.\" Built literally: Bounty 2 off, the On Ready trigger (once, when its Wait first runs out) with Gain 1 Lumber, priced 0.9; it stays 4/4 (Bounty 2 was 5.0). The every-round Lumber income (On Ready gold, the Lodge Engineer's \"1 Lumber each Ready round\", 6.24) would cut it to 2/2. Keep once, or every round?",
  ["Once (as built)", "Every round (2/2)"]),
 item("EN6-7", "Cards", "Bounty keep list: the Chipmunk Stockpiler",
  "Your 12:02 #5: Bounty only where it makes sense. Removed from the Beaver Lumberjack. Kept: Raccoon Bandit, Raccoon Warlord, Trash Panda Trickster (raccoons with their loot), Riverside Peddler (a merchant), Pack Mule (carries goods), The Magnate Duck (treasure), and the Chipmunk Stockpiler (cheeks packed with a stockpile: loot to take). No magpie or mimic has Bounty. Keep the Chipmunk's Bounty?",
  ["Keep", "Remove (it re-fits up)"]),
 item("EN6-8", "Battle rules", "Hibernate as built",
  "Your 03:17 #4 (\"hibernate?\"): Hibernate N (plain 2) sleeps while the field is cold (Frigid, Hail, Freezing, the map's frost, Winter) or at night on a cold map (tundra, frostfire): it can't attack, shoot or fire triggers, its Taunt and Guardian are off (it can't step in or draw swings), it still blocks its column and can be hit; a hit does not wake it, its Wait does not tick, and it heals N at each round's start. It wakes when the cold ends. On the Polar Bear (Map 6, the tundra). OK?",
  ["OK", "Change (say what)"]),
 item("EN6-9", "Map effects", "Salt and Rain are rare on the maps",
  "Salt (a beach or reef map while the tide is out) holds 4% of all fights' unit-rounds: those maps run the tide only in their boss and elite fights (High Tide). Rain holds 1.7%: Spring Rain is on no map; only the two Thunderstorm fights and Rainmaker cards bring it. Their cards (Horseshoe Crab, Puddle Hopper) are priced for that (0.38, 0.15). Give some beach / reef skirmishes the Tide, and some maps Spring Rain?",
  ["Leave", "Add the Tide / Rain (say where)"]),
]
src = open(P, encoding='utf-8').read()
d = json.loads(src)
assert not any(x.get('id') in {n['id'] for n in NEW} for x in d['items']), 'already applied'
a = '"items": [\n'
assert src.count(a) == 1
src = src.replace(a, a + ''.join('    ' + json.dumps({**x, 'group': x.get('group', 'game')}, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('decisions: EN6-1 .. EN6-%d' % len(NEW))
