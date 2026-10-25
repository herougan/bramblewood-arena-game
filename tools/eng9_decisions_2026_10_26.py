#!/usr/bin/env python3
"""ENG9 (2026-10-26): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/eng9_decisions_2026_10_26.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-26", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("ENG9-1", "Cards", "Revive N (the graveyard action): which cards get it?",
  "E1 (your #20): the old self-Revive is Undead now (it comes back once, as a token: its next death leaves no card behind), on the five cards that had it: Sea Turtle Elder, Cinder Skeleton, Ember Revenant, Grass Snake, Slow-worm (Undead 4.3, was 4.5; Grass Snake 2/9 -> 2/10). Revive N is the action: On Play, N random creature cards from your graveyard come back beside it as real cards (6.3 a card; the trigger editor has a Revive action at 6 a card). No real card carries Revive yet (only the test card).",
  ["Leave it on no card for now", "Give it to a graveyard theme card (name it)", "A Map 20+ Undead card with Revive 1"], "Leave it on no card for now"),
 item("ENG9-2", "Rules", "The name of \"On Ready: gain N Lumber\": Stockpile?",
  "E13 (EN6-6): \"Forager\" is too close to Foraging (the Berry gatherer that heals an ally), so the keyword is built as Stockpile N (On Ready, once: +N Lumber; 0.9 a point, the trigger's own price, so the Beaver Lumberjack stays 4/4 with Stockpile 1).",
  ["Stockpile (as built)", "Forager anyway", "Another name (say it)"], "Stockpile (as built)"),
 item("ENG9-3", "Rules", "The physical \"bolts\" renamed: Ember / Acid / Venom / Frost / Spark Spit?",
  "E3 (EN8-2): every \"bolt\" is magic, and the elements count as physical, so the five elemental spits that were called Bolts are renamed on the cards and in the Codex: Fire Bolt -> Ember Spit (Firefly Swarm, Habanero Drakon), Acid Bolt -> Acid Spit (Archerfish), Poison Bolt -> Venom Spit (Spitting Spider), Ice Bolt -> Frost Spit (Ice Petrel), Shock Bolt -> Spark Spit (Electric Catfish). The engine keys stay (fireBolt ...), so saves and decks are untouched. \"Fire Spit\" was avoided beside Spitfire. No magic bolt exists yet.",
  ["Keep these names", "Other names (say them)"], "Keep these names"),
 item("ENG9-4", "Rules", "Charge: once a fight, or recharging?",
  "G24 (\"Charge is similar\" to the one-shot On Ready skills): built as a one-shot: the clock starts when the unit is Ready, counts down each upkeep, and at 0 the effect goes off once and Charge leaves the card (was: the clock started again). Priced 1.2 (was 3). Electric Ray 4/9 -> 4/10; the Galactic Condor (Epic, not a band card) keeps its stats. If you meant only the timing (and the clock keeps cycling), say so and it goes back to 3.",
  ["Once (as built)", "Recharging, as before"], "Once (as built)"),
 item("ENG9-5", "Cards", "Fungi: a kingdom beside Flora, and which card is the Phoenix Mushroom?",
  "G9: Fungi is a type of its own, beside Flora (not under it, so a Flora skill or the Old Woods' Flora list doesn't count a mushroom), with 🍄. In the Codex the two non-animal kingdoms are side by side: species Plant -> Flora 🌿, species Fungi -> Fungi 🍄 (Flora was an archetype only, never a phylum). The Fungal Colossus (Flora / Elemental) and the Puffball Bombardier (Flora + Cave / Elemental) are Fungi now. No card is named Phoenix Mushroom; which one did you see?",
  ["As built; the Phoenix Mushroom is (name it)", "Fungi under Flora instead", "Keep the Colossus / Puffball in Flora too"], "As built; the Phoenix Mushroom is (name it)"),
 item("ENG9-6", "Battle rules", "Armor and shots: should Armor stop arrows and spits too?",
  "E3 built: Armor stops every hit that is not magic (physical and the elements); magic passes it; Magic Armor stops magic only. As before, Armor works on swings (a swing, a prong, a counter); shots and damage skills (Arrow, the Spits, Missile, Fireball ...) have never been reduced by Armor. Magic Armor does reduce magic shots. Armor is priced 1.56 a point (+4% for the elemental swings it now stops), Magic Armor 0.1 (magic is rare).",
  ["Swings only (as now)", "Armor also stops physical and elemental shots"], "Swings only (as now)"),
 item("ENG9-7", "Battle rules", "On Ready for a unit that comes in at Wait 0",
  "G23: a unit that is Ready without its Wait running out at an upkeep (it came in at Wait 0, or a skill took its Wait to 0) now gets its On Ready at the next upkeep, once. Before, it never fired: the Leafcutter Gardener, Termite Forager and Talus Pika (Wait 0, On Ready: +1 Lumber) never paid. Their price always counted it. Pearl Bed at Wait 0 still pays as it lands.",
  ["Keep (as built)", "Wait 0 units fire On Ready as they land instead"], "Keep (as built)"),
 item("ENG9-8", "Balance", "Chained as a budget multiplier: 1 + 0.25 a held round",
  "G19: \"Being chained should grant a larger budget - multiplicatively\". Chained 'damage N' holds a unit about N/3 rounds (it takes about 3 a round in the line), each held round x0.25: Chained 1 x1.08, 4 x1.33, 9 x1.75, 12+ x2; 'opponent plays a card' x1.1. Its skill price is 0 (was -3). The chain breaks once the damage it has taken adds up to N (one hit of exactly N is enough; was more than N in one hit). Chained Binturong 4/9 -> 4/10.",
  ["As built", "Larger (say the factor)", "Smaller"], "As built"),
 item("ENG9-9", "Balance", "Two cards the re-fit would lower: hold or cut?",
  "Armor's new price (1.56, was 1.5) moves cards on the old formula line. Held at their stats (as BF11-1 / EN3-6): Tide Pool Crab 1/4 (formula 1/3), Hawthorn Shieldbug 2/13 (2/12). Raised: Electric Ray 4/9 -> 4/10, Weaver Bird 4/6 -> 4/7, Chained Binturong 4/9 -> 4/10, Grass Snake 2/9 -> 2/10. Data: docs/balance/eng9-refit-2026-10-26.json.",
  ["Hold (as built)", "Cut them to the formula"], "Hold (as built)"),
 item("ENG9-10", "Battle rules", "Tangleweed lays Tangled, Strangle lays Bound",
  "G25 and OWN-Q1 together: Tangleweed N now lays Tangled for N rounds (each swing, shot, action and trigger fails 1 in 2: the same coin as Confused), priced 1.4 (was 2): Weaver Bird 4/6 -> 4/7, Quicksand Queen kept. Bound now comes only from Strangle: the unit still swings and shoots at half damage, can't move (no Guardian, Rampart, Dive or Charge) and loses Flying's dodge; Strangle 0.8 (was 1). Pounce happens as a unit lands, so a Bound unit never has one to lose.",
  ["As built", "Tangleweed lays Bound too (both)"], "As built", kind="Confirm"),
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
