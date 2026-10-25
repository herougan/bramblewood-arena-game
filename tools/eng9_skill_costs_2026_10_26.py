#!/usr/bin/env python3
"""Skill prices of package ENG9 (2026-10-26) in canonical/skill-costs.json, by the owner's 4-round rule (docs/workflows/balance.md): the yardstick is
+1 Attack (2 points) or +1 Health (1 point) held over a typical 4-round life. Not measured. Edits one line per skill in place (one skill a line).
    python3 tools/eng9_skill_costs_2026_10_26.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'skill-costs.json')
TAG = '2026-10-26 (package ENG9; 4-round rule, not measured)'
NEW_SKILLS = [
 {"id":"undead","scale":"fixed","value":4.3,"note":TAG + ", owner #20: Undead, the old self-Revive renamed: it dies (a true death) and comes back once at 1 Health, now as a token (its next death leaves no card behind). Revive was 4.5 for it; the token's lost graveyard card (Grave Call, Revive, Corpsefeeder can't use it) -0.2: 4.3."},
 {"id":"poisonBarbs","scale":"n","value":1.6,"note":TAG + ", owner #40: Poison Barbs N, Thorns that answer with N Poison counters (no damage). Thorns is 1.25 a point; a Poison counter deals 1 at each of the next rounds and wears down, about 1.3 points of damage a counter once stacks overlap (and Structures / poison-proof attackers ignore it): 1.6 a point."},
 {"id":"stockpile","scale":"n","value":0.9,"note":TAG + ", owner EN6-6: Stockpile N = On Ready (0.9) x Gain N Lumber (1 a point), once: 0.9 a point, the price the Beaver Lumberjack's On Ready trigger had (its stats don't move). Name: call ENG9-2."},
]
NEW_ACTIONS = [
 {"id":"revive","label":"Revive","value":6,"per":"count","note":TAG + ", owner #20: a random creature card from the owner's graveyard comes back as a real card (full Health, its printed Wait). An average card on the board is worth about 12 points of stats, the graveyard holds a creature in about half the moments an action fires (early On Plays find it empty) and the card waits its Wait again: 6 a card."},
]
UPD = {
 'revive': {"scale":"n","value":6.3,"note":TAG + ", owner #20: Revive N is the action now (On Play: Revive N; the trigger editor's Revive action is 6 a card): On Spawn 1.05 x 6 = 6.3 a card. The old self-return (4.5) is Undead.","prevValue":4.5},
 'tangle': {"value":1.4,"note":TAG + ", owner G25: Tangleweed N lays Tangled for N rounds: the unit's swings, shots, actions and triggers each fail 1 in 2 (was Bound: no swing at all). Half the swings it denied, a little back for the skills it now spoils too: x0.7, 2 -> 1.4 (half scale).","prevValue":2},
 'strangle': {"value":0.8,"note":TAG + ", OWN-Q1: the Bound a Strangle hit lays no longer stops the swing; the unit swings and shoots at half damage, can't move (Guardian, Rampart, Dive, Charge) and loses Flying's dodge, so Strangle's hold is worth about 0.6 of what it was; the squeeze is unchanged: 1 -> 0.8 (half scale).","prevValue":1},
 'decay': {"value":1.12,"note":TAG + ", owner G4: \"Decay is really strong btw - ... upped by ~12% in cost\": 1 -> 1.12 (half scale). Checked: the Dung Beetle's hit lays the counter and its tick takes the Attack (tests/eng9-2026-10-26.js).","prevValue":1},
 'armor': {"value":1.56,"note":TAG + ", owner on EN8-2 (E3): elements count as physical, so Armor now stops elemental swings too (fire / heat, cold, stone, poison, shock, acid, water, decay: 39 of the 808 fielded units, 4.8%); only magic passes it. 1.5 x 1.04 = 1.56 a point (rounded down: the elemental units are mostly fire, which many Armor cards rarely face). (Armor still takes nothing off shots and skills, as before.)","prevValue":1.5},
 'magicArmor': {"value":0.1,"note":TAG + ", owner on EN8-2 (E3): Magic Armor N stops magic only now (magic swings, magic shots and skills: 2 magic units of 808, Nova, Dragon Lightning, the Leylines, Supreme); the elements go to plain Armor. 0.4 -> 0.1 a point.","prevValue":0.4},
 'render': {"value":1.1,"note":TAG + ", owner EN8-11 (E5): a Daunt counter falls off only when the unit does a damage action (a swing, an Arrow, a damage skill), not at the round's end or on other skills. N counters last about N + (N-1) + ... attack-rounds on an attacker (N 2: 3, was 2; N 3: 6, was 4) and for good on a unit that never deals damage: x1.4, 0.8 -> 1.1 a point.","prevValue":0.8},
 'daunt': {"note":TAG + ": Daunt N (on hit: -N Attack until the end of next round) is a timed -Attack, not Render's counters, so E5 leaves it as it was; the price stays 2.5 (half scale)."},
 'charge': {"scale":"fixed","value":1.2,"note":TAG + ", owner G24 (\"Charge is similar\" to the one-shot On Ready skills): Charge goes off once, when its clock first reaches 0, then leaves the card (was: the clock started again). A one-shot of a typical Charge action (3 damage at a random enemy = 1.2; On Charge 0.7 x the action, delayed by its clock): 1.2 fixed, was 3 for the repeating clock. The action inside is not read; call ENG9-4.","prevValue":3},
 'fireball': {"note":TAG + ", owner G23: Fireball was already once (On Ready); it now also goes off for a unit Ready at Wait 0 (at its first upkeep) and leaves the card once spent. No price change: 2 (half scale)."},
 'chained': {"scale":"fixed","value":0,"note":TAG + ", owner G19: \"Being chained should grant a larger budget - multiplicatively\": Chained is an N multiplier now (bramblewood-budget.js chainedMult: 1 + 0.25 x min(4, N/3) for 'damage N', 1.1 for 'enemySpawn'), so it costs 0 as a skill. The chain breaks once the damage it has taken adds up to N (was: one hit of more than N).","prevValue":-3},
 'guardian': {"value":1.0,"note":TAG + ", owner EN8-8 (E9) and EN8-1 (E4): a Guardian steps in only while Ready (its first Wait rounds and Stunned / Frozen / Asleep / Bound rounds don't count) and now takes counter-attacks too: 1.06 -> 1.0 (half scale).","prevValue":1.06},
 'rampart': {"value":0.22,"note":TAG + ", owner EN8-8 (E9): Rampart works only while the unit is Ready (not its Wait rounds, not Bound): 0.25 -> 0.22.","prevValue":0.25},
 'counterattack': {"value":1.9,"note":TAG + ", owner EN8-1 (E4): a counter-attack can be taken by a Guardian beside the attacker now: 2 -> 1.9 (half scale).","prevValue":2},
}
MOD_UPD = {
 'tip': {"note":"2026-10-24 (package EN7, owner 13:12 #5): x the price of Poison / Bleed at the unit's own N (at least 1) for Arrow / Fire Arrow / Fire Bolt – poison / – bleed; x the Poison / Bleed action's value for Arrow, Missile and Deal damage (one opponent) with t.withPoison / t.withBleed, added to the action. " + TAG + ", owner #40: a – poison / – bleed shot at a unit now deals no damage, only its N in counters; no card carries one, so the formula is left as it is (re-price before a card takes one)."},
}
def line_of(o): return '  ' + json.dumps(o, ensure_ascii=False, separators=(',', ':'))
src = open(P, encoding='utf-8').read()
d = json.loads(src); have = {s['id'] for s in d['skills']}; haveA = {a['id'] for a in d['actions']}
def patch_line(k, patch):
    global src
    m = re.search(r'^  \{"id":"%s",.*?\}(,?)$' % re.escape(k), src, re.M); assert m, k
    o = json.loads(m.group(0).strip().rstrip(',')); o.update(patch)
    src = src[:m.start()] + line_of(o) + m.group(1) + src[m.end():]
for k, patch in UPD.items(): patch_line(k, patch)
for k, patch in MOD_UPD.items(): patch_line(k, patch)
add = [o for o in NEW_SKILLS if o['id'] not in have]
if add:
    i = src.index('"skills": ['); j = src.index('\n', i) + 1
    src = src[:j] + ',\n'.join(line_of(o) for o in add) + ',\n' + src[j:]
addA = [o for o in NEW_ACTIONS if o['id'] not in haveA]
if addA:
    i = src.index('"actions": ['); j = src.index('\n', i) + 1
    src = src[:j] + ',\n'.join(line_of(o) for o in addA) + ',\n' + src[j:]
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('ENG9 skill costs: %d new skills, %d new actions, %d updated' % (len(add), len(addA), len(UPD) + len(MOD_UPD)))
