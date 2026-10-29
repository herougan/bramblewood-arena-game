#!/usr/bin/env python3
"""N221 (2026-10-24): the owner calls of the Maps 21-40 divvy in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/n221_decisions_2026_10_24.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None):
    d = {"id": i, "status": "YET", "kind": "Decide", "area": area, "title": title, "asked": "2026-10-24", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
DOC = "docs/balance/n221-divvy-2026-10-24.md"
NEW = [
 item("N221-1", "Progression", "Pack tiers after Map 20: Pack 4 Maps 21-27, Pack 5 28-34, Pack 6 35-41",
  "Derived from your Pack 1-3 pattern of about 7 maps each (PP-1: 0-6 / 7-13 / 14-20). Tier 4 already exists in the data (every pack card of Maps 21-24 and the Ice Hollow / Old Bramble side maps carries it; no shop pack sells it yet, so those cards come from the card drop and the base track). Tiers 5 and 6 are written into the proposal only; Pack 6 runs past Map 40, where you build one map at a time. " + DOC + ".",
  ["Pack 4 21-27, Pack 5 28-34, Pack 6 35-41 (proposed)", "Other ranges (say which)", "Packs 4-6 as 21-30 / 31-40 / 41-50"], "Pack 4 21-27, Pack 5 28-34, Pack 6 35-41 (proposed)"),
 item("N221-2", "Cards", "Eight held cards would bring a new skill onto Maps 21-40",
  "Your 10-21 rule: Maps 21-40 teach no new skill. These cards carry a skill no card a player can get on Maps 0-20 has: the Rainforest Floor (Map 25) War-Drum Mandrill (Durian), Aye-aye Prowler (Sun-shy), Velvet Worm (Ichor), Slow Loris (Feeble), Chilli Parrot (Chilli); Clinging Leech (Parasite, proposed the Carrion Moors, Map 27); Glintsnatch Magpie (Disarm, the Thornwold, Map 32); Armory (Weapon Master, Goldfeather Keep, Map 24: not applied for this reason). The five rainforest cards were held for Map 25 by your RP5 (later and more specific), so the default keeps them there; the other three wait in the proposal. Alternatives: Maps 0-20 homes (the Leech to the Mire off Map 6, the Magpie to the Briar Maze, Map 12, the Armory with the Forge, Map 11), Pack Secrets I, or Map 40+ where new skills come again.",
  ["Place all eight as proposed (each one card, met on that map's enemies first)", "Rainforest five on Map 25; the Leech, Magpie and Armory to Maps 0-20 homes", "None on 21-40: they wait for Map 40+ or Pack Secrets I"], "Place all eight as proposed (each one card, met on that map's enemies first)"),
 item("N221-3", "Cards", "The Petrified Tree is a Pack 4 card of the Rimefire Caldera (built)",
  "The only waiting card that fits a map that exists without a new skill or an era hold. Petrified forests form under volcanic ash, and the Caldera is the volcano of Maps 21-24; a Stone maker (Gain 1 Stone a turn) beside its fire and ice. Applied: source pack tier 4, map m22, in the Caldera's pool (12 -> 13); its obtain map is 22 (canonical/card-obtain-maps.json), which leaves it under its budget (0/37: 2A+H+S 40 is 98% of N at Map 0, 89% of N 45.17 at Map 22; not re-fitted). Not a skirmish reward: the Caldera already has 10+ new cards and its three exclusives. The other choice was the Quiet Summit (pool 9 -> 10), where it would be the 6th new card and DV3 would ask for a third skirmish exclusive (a deck change).",
  ["Keep it on the Rimefire Caldera (built)", "Move it to the Quiet Summit (and add a third Summit exclusive)", "Hold it again"], "Keep it on the Rimefire Caldera (built)"),
 item("N221-4", "Maps", "The Rimefire Caldera (13) and the Goldfeather Siege (12) are over the 6-10 pool guide",
  "They grew in earlier packages (the Weathervane Swift and Ashwing Ptarmigan on 22, the Marching Elephant and Werebadger on 23) and now the Petrified Tree. Trimming them would move those cards to maps that don't exist yet (proposed: the Swift to Stormcoast 28, the Ptarmigan to the Mammoth Steppe 33, the Marching Elephant to the Last Savanna 39, the Werebadger to the Thornwold 32), so they could not be had until then. Most Maps 0-20 pools are over 10 too since RW5.",
  ["Keep them (nothing moved)", "Trim as proposed (those cards wait for their maps)", "Trim only the ones that fight nowhere (Swift, Ptarmigan)"], "Keep them (nothing moved)"),
 item("N221-5", "Maps", "Maps 25-40: the proposal table",
  "Sixteen map ideas, each with a pool of 6-10 (held cards, a few carried from earlier maps, unsorted enemy-only cards, new ideas from the eras rule), two skirmish-base cards, its pack tier and the road's caps: 25 the Rainforest Floor, 26 the Ant Empire, 27 the Carrion Moors, 28 Stormcoast, 29 the Echo Caverns, 30 the Old Growth (Evomax opens), 31 the Hollow Farmsteads (side map: the Cabbage Patch, your Killer Veggies), 32 the Thornwold (the Greenhood Band; the Thistle Baron returns), 33 the Mammoth Steppe, 34 the Tar Pits, 35 the Drowned Reef, 36 the Black Bayou, 37 the Lost Isle, 38 the Fossil Badlands, 39 the Last Savanna, 40 the Grove of the Dragon-Turtle (a seed only: from 40 you build one map at a time). Nothing is built; each map is made concrete only after your yes. " + DOC + ".",
  ["Use it as the working plan; build in order after a yes per map", "Change some maps (say which)", "Start over from your own list"], "Use it as the working plan; build in order after a yes per map"),
 item("N221-6", "Cards", "If CONTENT2-3 goes \"other sources\": the Gnawed to the Carrion Moors, the Tidefolk to Stormcoast",
  "CONTENT2-3 is open (default: the Sable Swampmire, Glass Dunes, Kelp Mangroves and Coral Current, Maps 6-18). This pass did not place the seven. If you prefer later homes: the Gnawed (Bog Shrew, Mire Rat, Hollow-belly Rat, Gnawed Matriarch as a skirmish-base card) in the Carrion Moors (27, a moor of bones; the Black Bayou 36 is the second choice) and the Tidefolk (Kelpborn Otter, Conger Eel, Selkie Wavebinder as a skirmish-base card) on Stormcoast (28, seals in a gale). Note: the Hollow-belly Rat's Devour is Devilry's keyword and not taught on Maps 0-20.",
  ["Follow CONTENT2-3's answer (no change here)", "The Carrion Moors and Stormcoast, as above"], "Follow CONTENT2-3's answer (no change here)"),
 item("N221-7", "Cards", "Homes outside the maps: Pack Secrets I, the faction pool, the Blacksmith, a quest",
  "Not applied (each needs game code or a pool that isn't built). Pack Secrets I (empty today, progression plan item 12): MissingNo. (a hidden glitch) and the Glowing Gecko (Irradiated, like the Mystery Booster's Irradiated Axolotl and Glow Wyrm; the map recommendations' Map 33 would bring Irradiated as a new skill). The faction pool: the Anvilwhisker Otter (Otter side; it needs a Stone engine) and the Greyplume Fledgling (Hummingbird side, or Base). The Blacksmith: the Crowbar (equipment). A quest-only special: the Thistle Baron's return on the Thornwold (Map 32; RP5 held it for Map 21+). The eight spells stay held while spells are shelved (thematic homes listed in the doc); the Devilry (16) and Ecclesia (15) cards stay held for Maps 66 / 77.",
  ["As proposed", "Change some (say which)"], "As proposed"),
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
print('added', len(NEW), 'owner calls')
