#!/usr/bin/env python3
"""BAL7 (2026-10-28): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/bal7_decisions_2026_10_28.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-28", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("BAL7-1", "Balance", "Bulwark at 7.2 a point (your 9 x Shield's 0.8)?",
  "FIN2-2 priced Give Shield N and Bulwark N from Shield = 0.8 Health. Give Shield: 0.8 x the +1 Health an action gives (0.5) = 0.40 a point (was 0.35). Bulwark raises two 0/4N shields; you set it to 9 a point (EN3) when their Health counted at 1.0, so at 0.8 it is 9 x 0.8 = 7.2. Re-fit (tools/bal7_shield_refit_2026_10_28.js): Ancient Sloth Titan 2/28 -> 2/31, Muskrat Lodgekeeper 1/5 -> 1/7 (a move up is capped at +30%; its full line was 2/10).",
  ["Keep 7.2 (9 x 0.8)", "Back to 9 (Bulwark's shields are not plain Shield)"], "Keep 7.2 (9 x 0.8)", kind="Confirm"),
 item("BAL7-2", "Skirmish decks", "K14 on Map 0 and the tutorial's come-back fights?",
  "K14 (non-map-unique cards at most 1 copy each and 6 in all) is applied to 126 fights of Maps 1-24 and their side maps (491 copies moved to the map's own pack, reward and showcase cards; a side map counts its parent's too). Left out: Map 0 (its fights are built from the starter cards a new player knows, aiming at 90%; Map 0 has 8 own cards) and the come-back fights T-2, T-3, T-4 (mixed decks that test the tutorial).",
  ["Leave them out (as built)", "Apply K14 there too"], "Leave them out (as built)"),
 item("BAL7-3", "Balance", "The road after the M1 re-balance: retune the decks next?",
  "M1 cut 69 cards (Dung Beetle, Archerfish, Fire Salamander ...). The Map reference decks (the new-player yardstick) leaned on Dung Beetles and Archerfish from Map 10, so with the old reference the road fell from 61.5% to 43.3% on average (Maps 10-23 down 12-53 points). BAL7 rebuilt the reference decks (tools/skirmish_pass.js decks --keep): the road is back to 61.7% on average, but its shape moved: 57 of 256 curve fights green (79 before M1), 83 too easy, 116 too hard (docs/balance/bal7-road-2026-10-28.json). You said no retune yet, so no skirmish deck was tuned toward the curve.",
  ["Retune the road decks toward the curve in the next balance package (swaps only)", "Keep the old reference decks and retune against them", "Leave the road as it is"], "Retune the road decks toward the curve in the next balance package (swaps only)"),
 item("BAL7-4", "Balance", "Contribution outliers the stat pass could not fix: re-price their skills?",
  "M1 moved 69 cards (stats, and a skill level on 7 cards 12+ points over); their mean distance from the band median fell from +10.6 to +5.0 points (70,000 fights before and after, reliability 0.96, a card's 95% interval about +-1.8). Still 8+ over: Hedge Changeling, Dung Beetle, Ur-Elk, Ashbone Ghoul, Tax Collector Teal, Talus Pika, Nutria Reedcutter, Land Tiller, Coral Polyp Colony, Lemming Swarm, Salamander Pyromancer, Termite Forager, Driftwood Crab, Chipmunk Hoarder: their strength is their skill or trigger (Changeling, Decay, Remember, Hoard, On Ready Gold, Swarm ...) and Lumber 0, not their stats. Too weak and already on their budget line (the formula gives no room): Grindstone Boar (Friction), Badger Stonemason (Quarry), Irradiated Glow Wyrm (Poison 2), Granite Ox Golem (Recoil), Bee Drone. docs/balance/bal7-m1-compare-2026-10-28.json.",
  ["Re-price those skills by the 4-round rule and re-fit, next balance package", "A second stat pass on the same cards", "Leave them"], "Re-price those skills by the 4-round rule and re-fit, next balance package"),
 item("BAL7-5", "Cards", "45 Pack-only cards have no map: place them?",
  "M3 cleared the stale unattainable flag from 271 cards with a source. 45 basic-pack cards (Pack 1-4) have no map in their source and sit in no map list (Dolphin Knight, Owl Fletcher, Owl Sentinel, War Hound, Dam Wall, Weredog, Night Watchman, Lunar Howler ...); the game deals them from their pack tier, but every other basic-pack card has a map (rw5's rule), so they keep the flag until placed.",
  ["Place them on maps in a content package", "Leave them flagged"], "Place them on maps in a content package"),
]
src = open(P, encoding='utf-8').read()
d = json.loads(src)
if any(x.get('id') in {n['id'] for n in NEW} for x in d['items']):
    print('already applied'); raise SystemExit(0)
a = '"items": [\n'
assert src.count(a) == 1
src = src.replace(a, a + ''.join('    ' + json.dumps(x, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('added', len(NEW))
