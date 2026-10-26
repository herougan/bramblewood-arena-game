#!/usr/bin/env python3
"""CONTENT3 (2026-10-26): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/content3_decisions_2026_10_26.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-26", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("OVR-1", "Maps", "Your live Map 4 edit of 10-21: the Oxbow fight after 4-5, 4-5 as an elite",
  "The live row __cfg:map-nodes:m2 (10-21 16:01) adds a fight \"Oxbow\" after 4-5 (Orca Vanguard, Humpback Elder, Kraken Spawnling, Beaver Builders, Open-ocean Hermit Crabs; bramble 30, Armour 8), makes 4-5 an elite that ends the map, and sets 10-21 decks on 4-2 and 4-5. Live, it is what players see. Since then BAL3 (10-24) and PRO3 (10-25) retuned 4-2 and 4-5 in the file, and N21-2 took the whales and the kraken out of Maps 1-4. Not folded (CONTENT3). Proposed: drop the row (the file wins) with the clear SQL's commented step.",
  ["Drop the row (the file wins)", "Fold it in (Oxbow and 4-5 as elite)", "Fold only Oxbow"], "Drop the row (the file wins)"),
 item("OVR-2", "Tutorial", "Your live tutorial row of 10-22: rival Health 12 and the part-1 Ducklings and Minnows",
  "The live row __cfg:tutorial (10-22 23:00) sets the part-1 rival bramble to 12 Health (the file: 7) and its deck to 3 Ducklings, 3 Earthworms, 3 Harvest Mice, 3 Silver Minnows (TT2 on 10-21 eased it to Pond Ducks and Pond Trout: the halved stats left part 1 winnable 35% of the time). It may be your browser's older tutorial saved back with an edit. Live, it is what new players get. Not folded (CONTENT3). Proposed: drop the row (the file wins).",
  ["Drop the row (the file wins)", "Fold it in as it is"], "Drop the row (the file wins)"),
 item("OVR-3", "Balance", "Folded: your live card edits, and what they move on the road",
  "Folded into canonical/cards.json (the rule: your value unless the file changed that field after your save): Earthworm 0/9 -> 0/6, Silver Minnow 3/4 -> 2/4, Duckling 3/4 -> 1/5, Harvest Mouse 1/7 -> 1/6, Otter Kit 2/6 -> 2/5, Sea Turtle Elder 5/5 -> 5/10 with Armor 3 and no Undead, Soldier Ant loses Formation 1 (stats kept: the file re-fitted them later), Green Dragon loses its Poison 3 (its poison attack type stays), and the new Phoenix Mushrooms (Epic 1/11, Fungi, Undead, Meiosis 1, Bloom Wet & Sunny; awaiting a source; over the budget at Map 0, it fits once placed). The Soldier Ant is in the road's reference deck: without Formation the Morel Hollow measured 7-2 85% -> 50%, 7-4 55% -> 25%, 7-5 65% -> 17.5% (40 games; with Formation put back 72.5 / 45 / 45). It is already live (your row wins on the site). The clear SQL is supabase/proposed/20261026_clear_folded_overrides_3.sql.",
  ["Keep the fold; run the road check and retune decks in BAL4", "Put Formation back on the Soldier Ant", "Say it"], "Keep the fold; run the road check and retune decks in BAL4"),
 item("CONTENT3-1", "Map effects", "The blinding Sandstorm: a variant (as built) or the only Sandstorm?",
  "C4 / EN8-7: built as a second form of the field, sandstorm 'blind' (every unit Blind, 1 in 2, except Dry / Keen Sense / Sonar units; Storm cards empowered), on 18-4 \"Sandstorm\" only (72.5% -> 75% at 40 games: the desert decks are Dry). The plain Sandstorm (1 in 4 at a unit, unless the attacker is Dry) stays on the other Glass Dunes fights; it is a Storm now too. Making every Sandstorm blinding moves the whole map: a retune.",
  ["Variant on 18-4 (as built)", "Every Sandstorm blinds (retune the Glass Dunes)"], "Variant on 18-4 (as built)"),
 item("CONTENT3-2", "Map effects", "Lilypad Reach in constant Rain is much easier",
  "C5 built: the seven Lilypad Reach fights have Rain all fight (Rain heals every unit 2 a round). Measured against the map reference (40 games): 2-A-1 65 -> 75%, 2-A-2 60 -> 70%, 2-A-3 80 -> 97.5%, 2-A-4 72.5 -> 95%, 2-A-5 40 -> 92.5%, 2-A-6 75 -> 80%, 2-A-7 47.5 -> 57.5% (targets 90 / 84 / 78 / 72 / 66 / 60 / 40). The healing favours the player's deck. Proposed: keep the Rain and retune the decks with the curve tool in BAL4.",
  ["Keep Rain; retune the decks in BAL4", "Rain without the heal (a wet-only Rain)", "Rain on the boss only"], "Keep Rain; retune the decks in BAL4"),
 item("CONTENT3-3", "Cards", "Where does the Mother Carrier come from?",
  "E16: the Mother Carrier (Heroic Hummingbird Platform, 0/25, Lumber 3, Wait 3; each round while Ready it launches a Laden Hummingbird token: Flying, two arrows a round; Fletcher 1 is your \"Arrow Master\": its side's arrows +1). Heroic opens on the road at Map 25. Awaiting a source.",
  ["The Hummingbird faction pack from Map 25", "A Map 25+ skirmish reward", "Say it"], "The Hummingbird faction pack from Map 25"),
 item("CONTENT3-4", "Cards", "Socket N and Pulverise: on which cards?",
  "E14 and OWN-Q5 are built as skills, on no card yet. Socket N (N more gem sockets; price 0, gems sit outside the budget) is meant to be very rare: proposed Socket 1 on one Legendary of Maps 40+. Pulverise (price 1.6): proposed on a heavy Map 20 brute or a Siege card.",
  ["Leave them on no card for now", "Name the cards"], "Leave them on no card for now"),
 item("CONTENT3-5", "Cards", "Three new Otter faction cards: add Hummingbird counterparts?",
  "C2 / C3: the Mist-net Otter (Common 2/10, Reach, Web 1), the Clap-net Trapper (Common 2/11, On Play: every enemy Flyer grounded a round) and the Birdlime Dauber (Uncommon 2/12, Reach, Strangle 1) join the Otter side of the faction pool (Commons come in the faction draws from Map 0, so before Gannet Cliffs). The rule that Otters and Hummingbirds end up symmetric (RP4) now leans Otter by three.",
  ["Add three Hummingbird cards later (a ground-hunting theme)", "Leave it"], "Add three Hummingbird cards later (a ground-hunting theme)"),
 item("CONTENT3-6", "Cards", "The golem stuns your own side too",
  "E17 built as you wrote it: the Granite Ox Golem (Rare 3/17, Lumber 2, Wait 4, Recoil 2; Ashen Spurn, Map 19) stuns every unit when played, its own allies included, except the enemy's last-played unit. Priced as a stun of every enemy (so its own-side cost is a gift to the budget).",
  ["All units (as built)", "Enemy units only"], "All units (as built)", kind="Confirm"),
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
