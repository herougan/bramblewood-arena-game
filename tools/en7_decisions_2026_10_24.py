#!/usr/bin/env python3
"""EN7 (2026-10-24): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/en7_decisions_2026_10_24.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None):
    d = {"id": i, "status": "YET", "kind": "Decide", "area": area, "title": title, "asked": "2026-10-24", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("EN7-1", "Battle rules", "Dive in two turns: what it is safe from while aloft or under",
  "Your 13:12 #3 (\"like pokemon\"), built: once a fight, at its swing, a diver with an enemy unit in its row rises (a Flyer; a Sprinter leaps the same way) or goes under (a Tide unit without wings) instead of swinging. Until its next swing nothing can find or hit it (swings, shots, bolts, skills aimed at a unit; a Spotter neither) and it can't step in as a Guardian. Its next swing strikes the weakest enemy of its row past Taunt (a Guardian beside the target still steps in) for Attack + N, and it is Exposed that round (no Flying dodge, no Tide evade). Area damage that names no target (a field's hail, a Nova, the tide-spout) and its own Poison / Bleed ticks still reach it, as in the games you described (Earthquake hits Dig in some, not Fly). A diver that can't strike in the next round (frozen, stunned) comes down at that round's end without striking. Keep area damage reaching it, or make it safe from everything?",
  ["Area damage still reaches it (built)", "Safe from everything while aloft / under"], "Area damage still reaches it (built)"),
 item("EN7-2", "Battle rules", "Parasite x Bloom with no free enemy beside the host",
  "Your 13:12 #2: a Parasite with Bloom puts its bloom copy (+1/+1, its printed Wait) onto an enemy unit beside its host (left, right, in front, behind) that has no parasite; not a Structure or a cage; several: one at random. A Parasite played as a plain unit hooks its copy onto an enemy facing it or one column beside that. With no such unit, built: it waits and tries again each round (as Bloom waits for a free slot, BL-2). Or: no copy at all that fight?",
  ["It waits (built)", "No copy that fight"], "It waits (built)"),
 item("EN7-3", "Battle rules", "Poison / Bleed on extra hits, and \"– poison\" shots",
  "Your 13:12 #5 (\"common sense, not too overpowered\"), built: a unit's Poison N / Bleed N (with Rabid, Greater Poison, Hemorrhage, Venom Master) ride on every landed hit of its own attack damage: the swing, Frenzy's and Twin Strike's swings, Fork / Trident / Pitchfork prongs and Octolash lashes (these already did), and now Pounce and Ambush (which did not). Cleave's side damage is a spread of the swing (an area, as for Guardian): it carries none. A shot or action (Arrow, Fire Arrow, a Bolt, Missile, Deal damage, Volley, Snipe ...) carries none, unless the card says \"– poison\" / \"– bleed\" on it (card text \"Arrow 2 – poison\"; a box on the Arrow, Missile and Deal damage actions in the card editor, as \"– bramble\"); it then gives the unit's own N, at least 1. Prices (4-round rule): Pounce / Ambush on a Poison or Bleed card pay 0.33 / 0.3 x the status's price on top (no card has both today); \"– poison\" on a shot 0.9 x Poison's price at that N (Arrow 2 – poison on a plain unit: +2.7). OK?",
  ["OK", "Change (say what)"], "OK"),
 item("EN7-4", "Cards", "The two Dive cards",
  "Dive is re-priced for the two-turn rule by the 4-round logic: 0.75 + 0.5 N (the lost swing -1.5, a round out of reach +2, the pick +0.5, the exposure -0.25), fitted 1.25 x N^0.5 (Dive 1 1.25, Dive 2 1.77; was 0.75 a point). Given to two cards already placed: Puffin Diver (common, Flying + Tide, Map 3's 3-2 reward): Dive 2, 2/6 -> 2/5 (it goes aloft); Harbor Seal (common, Tide + Evasive, a pack card on the frost coast): Dive 2, 1/10 -> 1/9 (it goes under). No gannet or osprey card exists (The Gannet Queen is a heroic with Pounce 2; Dive would fit her too). Keep these two, add the Gannet Queen, or pick others?",
  ["Keep the two", "Add the Gannet Queen", "Pick others (say which)"], "Keep the two"),
]
src = open(P, encoding='utf-8').read()
d = json.loads(src)
if any(x.get('id') in {n['id'] for n in NEW} for x in d['items']):
    print('already applied'); raise SystemExit(0)
a = '"items": [\n'
assert src.count(a) == 1
src = src.replace(a, a + ''.join('    ' + json.dumps({**x, 'group': x.get('group', 'game')}, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('decisions: EN7-1 .. EN7-%d' % len(NEW))
