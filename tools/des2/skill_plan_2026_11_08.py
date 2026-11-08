#!/usr/bin/env python3
# Skill plan for Maps 0-20 (2026-11-08, package DES2; owner 11-08 10:52: "Seems like there is quite a lot of skills to work around with.
# I agree - let's limit and focus in." and the notes 9-11, 15, 16, 18, 21 of docs/action-items.md). Design only: reads canonical data,
# changes nothing in the game.
#
# The plan (signatures / side / one-offs per main map, the new skills, the duplicate groups, the card renames) is hand-written below.
# This script checks it against the real catalogue and fills in the numbers:
#   - every skill key the plan names must exist in canonical/skill-delivery.json (the list of every skill) or be a status the engine
#     knows (bramblewood-engine.js ENG36_STATUS): a typo or a "new" skill that already exists fails the run;
#   - carriers: for each signature, the cards on that map's own list (canonical/map-pools.json) that carry it today (base or level);
#   - duplicate groups: cards carrying each key (canonical/cards.json, via tools/des2/skill_census_2026_11_08.json);
#   - renames: the card must be on a Maps 0-20 main list, the new name must be free, and the old name's other uses are counted
#     (game code, canonical files except cards.json, tests, the lore bible; the 12 card language packs are always re-keyed).
# Outputs: docs/design/skill-plan-maps-0-20-2026-11-08.md and .json.
# Usage: python3 tools/des2/skill_census_2026_11_08.py && python3 tools/des2/skill_plan_2026_11_08.py
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import skill_params  # noqa: E402

OUT_MD = os.path.join(ROOT, 'docs', 'design', 'skill-plan-maps-0-20-2026-11-08.md')
OUT_JSON = os.path.join(ROOT, 'docs', 'design', 'skill-plan-maps-0-20-2026-11-08.json')
CENSUS = os.path.join(ROOT, 'tools', 'des2', 'skill_census_2026_11_08.json')

# Marks: ok = exists under that name; dup = exists under another name (the Codex / owner name in `was`); new = genuinely new;
# param = a parameter of an existing skill (ENG35: one skill, so it is not NEW!); minor = never counts (owner 10:52 #9).
MARK = {'ok': '✓', 'dup': '≡', 'new': '★', 'param': '◦', 'minor': '·'}

# ---- 1. The main table. Each item: (shown name, skill key or None, mark, note). `was` = the name in the Codex / owner list. ----------
def S(name, key, mark='ok', note='', was=None, fix=None):
    return {'name': name, 'key': key, 'mark': mark, 'note': note, 'was': was, 'fix': fix}

PLAN = [
    {'no': 0, 'id': 'm1',
     'sig': [S('Swarm', 'swarm'), S('Guardian', 'guardian', fix='Guardian on Duck Paddler (2/10)')],
     'side': [S('Quick', 'quick'), S('Regenerate', 'regen', note='Regeneration, renamed by UI35'), S('Delivery', 'delivery')],
     'one': [S('Venomous preview (Bee Sentry)', 'poison')],
     'minor': ['Flying', 'Diurnal', 'Tide'],
     'codex': 'Flying and Diurnal are minor (owner #9). Guardian comes in from Map 1.'},
    {'no': 1, 'id': 'mf',
     'sig': [S('Foraging', 'foraging', 'dup', was='Forage'), S('Thorns', 'thorns', fix='Thorns 1 on Badger Lumberjack, or a hedge card')],
     'side': [S('Pickpocket', 'pickpocket'), S('Inspiring', 'inspiring')],
     'one': [S('Thanatosis (Slow-worm)', 'thanatosis')],
     'minor': ['Nocturnal', 'Crepuscular'],
     'codex': 'Regenerate and Guardian are already on Map 0, so they are not new here. True Sight moves to Map 6, Lumberjack and Timbered to 13, Devour to 19.'},
    {'no': 2, 'id': 'mb',
     'sig': [S('Crab Claws', 'crabClaws'), S('Shell', 'shell', fix='Conch Crawler moves here from Map 3; Shell on Open-Ocean Hermit Crab'),
             S('Molting', 'molting', fix='Molting on Driftwood Crab and Hermit Crab (out-of-play carrier: Harp Seal Pup)')],
     'side': [S('Armor', 'armor', 'dup', was='Armour'), S('Pierce', 'pierce', note="Armor's answer"),
              S('Retreat into the shell', 'shell', 'param', note='Shell {after: attack}, owner 11:03 (ENG37)'),
              S('Armoured Shield', 'shield', 'param', note='Shield {armor: M}, owner 11:03 (ENG37)')],
     'one': [],
     'minor': ['Tide'],
     'codex': 'Tide is minor. Delivery and Inspiring are already on Maps 0-1. Sonar (Dolphin Outrider) moves to Map 8.'},
    {'no': 3, 'id': 'mc',
     'sig': [S('Pounce', 'pounce'), S('Reach', 'reach', fix='the ENG37 spear card + one more'), S('Dive', 'dive', fix='Dive on Gannet Nestweaver')],
     'side': [S('Evasive', 'evasive')],
     'one': [S('Reload (Peak Condor)', 'reload'), S('Bleed preview (Razorbill)', 'bleed')],
     'minor': ['Flying', 'Tide'],
     'codex': 'Arrow waits for the shooter cards (DES1-3). Dive is a signature, not a one-off. Swift is on no card (retire, see section 3). Mountain Climber goes to 11, Cleave to 16.'},
    {'no': 4, 'id': 'm2',
     'sig': [S('Bleed', 'bleed', fix='Razorbill moves here from Map 3'), S('Bulwark', 'bulwark', fix='Bulwark on Snapstick Turtle'),
             S('Bloom', 'bloomCopy', fix='a second bloomer (a duckweed or lily pad)')],
     'side': [S('Venomous', 'poison', note='3 carriers here; previewed on 0 and 2'), S('Twin Strike', 'twinStrike'),
              S('Bandage', 'cure', 'param', note='Cure, hunts Bleed')],
     'one': [],
     'minor': ['Tide'],
     'codex': 'Dive is Map 3\'s. Heal moves to Map 6 (the Newt Doctor). Bulwark and Bloom are here because their cards are.'},
    {'no': 5, 'id': 'mw',
     'sig': [S('Ambush', 'ambush', fix='Ambush on Crocodile Ambusher and Swamp Alligator'),
             S('Cull', 'hunter', 'dup', note='hunts the Envenomed (vs: poison)', was='Venomous predator', fix='Cull on Grass Viper'),
             S('Cure', 'cure', fix='Sphagnum Vole and Peat-smoke Shaman join (out of play today)')],
     'side': [S('Venomous', 'poison', 'dup', was='Poison'), S('Parasite', 'parasite'), S('Gorge', 'fester')],
     'one': [S('Repair (Cypress Root Lurker)', 'repair'), S('Cower (Box Turtle)', 'cower')],
     'minor': ['Tide'],
     'codex': 'Poison (Venomous) is already Map 4\'s. Map 5 is its ecosystem instead: Cull exploits it, Cure removes it. Bulwark is Map 4\'s.'},
    {'no': 6, 'id': 'm8',
     'sig': [S('Harbinger', 'harbinger', fix='on no card today: Raven Scout (Tally) and one more; Berserk folds into it'),
             S('Leech', 'sap', fix='Lamprey (Weaken becomes Leech) and Vampire Bat'),
             S('Heal', 'healing', note='Healing, renamed by UI35', was='Heal', fix='Mossmother Newt joins the Newt Doctor')],
     'side': [S('Invisible', 'invisible'), S('True Sight', 'keenEye', fix='Owl Sentinel moves here'), S('Constrict', 'constrict')],
     'one': [S('Rupture', 'rupture'), S('Petrify', 'petrify')],
     'minor': ['Tide'],
     'codex': 'Cure is Map 5\'s, Strangle moves to Map 9. Daunt (Booming Bittern) stays as a preview.'},
    {'no': 7, 'id': 'mu',
     'sig': [S('Sleep', 'sleep', note='on-hit Sleep N', fix='Nightshade Moth (out of play) + a Puffball'),
             S('Paralyze', 'paralyze', 'dup', was='Paralysis', fix='on no real card: Wolf Spider Mother at a level + a cordyceps card'),
             S('Vaccinate', None, 'new', was='Immunity/Vaccinate', fix='Truffle Piglet + the witchdoctor')],
     'side': [S('Decay', 'decay'), S('Brood', 'brood'), S('Poison Gas', 'poisonGas', 'dup', was='Toxic Gas'),
              S('Poison Barbs', 'poisonBarbs'), S('Cure', 'cure', 'param', note='hunts Sleep and Paralyze: the remedy'),
              S('Wakeful', 'wakeful', note='Sleepless Shrew')],
     'one': [S('the witchdoctor', None, 'ok', note='section 2'), S('Poisonous', 'poisonous', 'dup', was='Toxic Puff')],
     'minor': ['Nocturnal'],
     'codex': 'Spore Cloud is a field effect (the map\'s), not a skill. Web is Map 8\'s. Deadly Poison goes to 18; Wither folds into Decay; Meiosis, Meld and On Death: spawn are one-offs.'},
    {'no': 8, 'id': 'm4',
     'sig': [S('Illuminate', 'illuminate', fix='Lantern Spark Fly moves here (from The Mycelium Deep)'),
             S('Echolocation', 'sonar', 'dup', note='Sonar, renamed by UI35', was='Echolocate', fix='Echo Screecher gets it; Whip Spider or Cave Swiftlet')],
     'side': [S('Keen Sense', 'keenSense', note='Darksight folds in', was='Dark Sight / Keen Sense'), S('Web', 'web'), S('Shell', 'shell'),
              S('Stealth', 'stealth')],
     'one': [S('Purblind (Star-nosed Mole)', 'purblind')],
     'minor': ['Nocturnal', 'Flying'],
     'codex': 'Dark Sight is Darksight, and Keen Sense already does more: one skill (section 3). Invisible is Map 6\'s.'},
    {'no': 9, 'id': 'mk',
     'sig': [S('Pressure', None, 'new', fix='Sea Turtle Elder + a deep-water card'),
             S('Strangle', 'strangle', 'dup', was='Tangleweed / Suffocate / Kelp Snare', fix='a kelp card + Anaconda Coil (out of play)'),
             S('Skitter', 'skitter', fix='a second mudskipper-like card (fiddler crab, crab-eating frog)')],
     'side': [S('Taunt', 'taunt'), S('Relict', 'relict'), S('Dive', 'dive')],
     'one': [S('Undertow', 'wave', 'param', note='Wave, pulls instead of pushes'), S('Ink', 'smokeBomb', 'dup', was='Giant Squid Ink', note='Sea Hare')],
     'minor': ['Salt', 'Tide'],
     'codex': 'Swimmer is a retired skill (Tide does it). Volley waits for the shooter cards. Tangleweed is dropped (section 3); Suffocate and Snare would duplicate Strangle and Web.'},
    {'no': 10, 'id': 'm7',
     'sig': [S('Chain Lightning', 'chainLightning', fix='Voltaic Eel joins; Electric Ray swaps Charge for it'), S('Fork', 'fork')],
     'side': [S('Gash', 'gash'), S('Wave', 'wave'), S('Charge', 'charge')],
     'one': [S('Nova (Supernova Jelly)', 'nova')],
     'minor': ['Tide'],
     'codex': 'Wet is a status (water and rain give it), not a skill. Electricity folds into Chain Lightning (one jump vs two).'},
    {'no': 11, 'id': 'm10',
     'sig': [S('Vulnerable', 'exploit', 'dup', note='the Exploit tokens, read as Vulnerable (DES2-3)', was='Exploit, renamed', fix='on no card: Eyrie Warden + a new raptor'),
             S('Mountain Climber', 'mountainClimber', fix='Red-billed Chough moves here from Map 3')],
     'side': [S('Daunt', 'daunt'), S('Pierce', 'pierce', 'dup', was='Rend'), S('Bandage', 'cure', 'param', note='also strips Vulnerable')],
     'one': [S('Avalanche (Ibex Rockcaller)', 'avalanche')],
     'minor': ['Flying'],
     'codex': 'Rend is Pierce\'s old name (on Map 2 already). Reach and Pounce are Map 3\'s.'},
    {'no': 12, 'id': 'mh',
     'sig': [S('Confuse', 'confuse', 'dup', was='Confusion', fix='a second confuser (a magpie or a jay)'),
             S('Backstab', 'backstab', fix='a second M12 carrier (Stoat Cutthroat is on Map 15\'s list)')],
     'side': [S('Siege', 'siege'), S('Thorns', 'thorns', note='high N on Quill-Thorn Boar', was='High Thorns')],
     'one': [S('Restless', 'restless', note='the maze wanderer')],
     'minor': ['Flying'],
     'codex': 'Recoil is a self-damage drawback, not displacement: dropped. Snare is Web / Bola\'s Pin: dropped. Stench folds into Daunt (section 3). Dynamite fits a mines submap.'},
    {'no': 13, 'id': 'mr',
     'sig': [S('Rage', 'rage', fix='Rage on Tasmanian Devil (its Berserk folds into Harbinger)'), S('Canopy Cover', 'canopyCover', fix='Shimmerwing Stag')],
     'side': [S('Cleave', 'sweep'), S('Breach', 'breach', note='Puncture 1 (section 3)'), S('Milling', 'milling')],
     'one': [S('Banana', 'banana'), S('Fast Forward (Swift Fox)', 'fastForward')],
     'minor': [],
     'codex': 'Predator and Carnage move to Map 14 (Prey\'s map). Cleave is on Map 3 already; Twin Strike on Map 4.'},
    {'no': 14, 'id': 'm5',
     'sig': [S('Prey', 'prey', fix='Prey on Acacia Giraffe'), S('Predator', 'predator', fix='Predator on Savanna Cheetah and Dust Hyena')],
     'side': [S('Carnage', 'carnage'), S('Mighty', 'mighty'), S('Executioner', 'executioner')],
     'one': [S('Drunk (Marula Elephant)', 'drunk')],
     'minor': ['Heat'],
     'codex': 'Heat is a state skill (minor, like Salt). Stampede goes to 15, where its cards are. Snipe waits for the shooter cards.'},
    {'no': 15, 'id': 'ml',
     'sig': [S('Speed', 'speed', note='Blitz folds in', was='Blitz', fix='Speed on Stoat Cutthroat'),
             S('Stampede', 'overwhelm', fix='Stampede on Bison Bulldozer')],
     'side': [S('Bulldoze', 'bulldoze'), S('Carrion', 'carrion'), S('Backstab', 'backstab')],
     'one': [S('Converge (Border Collie)', 'converge'), S('Bounty (Raccoon Bandit)', 'bounty')],
     'minor': ['Nocturnal'],
     'codex': 'Trap goes to 18 (the Antlion). Bola and Lasso are ranged: after CONTENT18\'s shooter cards. Swift is on no card.'},
    {'no': 16, 'id': 'mt',
     'sig': [S('Pack', 'pack', fix='Pack on Alpha Howler and Lunar Howler (out of play: Dhole Runner)'),
             S('Pack Leader', 'packLeader', fix='a second leader (Wolfsbane Alpha, out of play)')],
     'side': [S('Frostbite', 'frostbite'), S('Cleave', 'sweep'), S('Momentum', 'momentum')],
     'one': [S('Moonborn (Lunar Howler)', 'moonborn'), S('Almanac', 'almanac')],
     'minor': [],
     'codex': 'Swapped with Map 17: the wolves and dholes are on this list, the Polar Bear, Walrus and Ermine on 17\'s.'},
    {'no': 17, 'id': 'm6',
     'sig': [S('Hibernate', 'hibernate', fix='a second sleeper (an arctic ground squirrel)'),
             S('Ice', 'iceBolt', 'dup', was='Frost Bolt', note='Ice Arrow folds in', fix='Snow Bunting Archer (Ice Arrow) + Ice Petrel'),
             S('Shatter', 'shatter', fix='a second breaker (a narwhal)')],
     'side': [S('Freeze', 'freeze'), S('Lone Wolf', 'loneWolf'), S('Taunt', 'taunt')],
     'one': [],
     'minor': ['Frost', 'Tide'],
     'codex': 'Cold duplicates Frost (state) and Daunt (debuff): dropped. Adrenaline is Riled: dropped.'},
    {'no': 18, 'id': 'md',
     'sig': [S('Trap', 'trap', fix='a second trapper (a trapdoor spider)'), S('Brittle', 'brittle', fix='on no M18 card: two glass-bodied cards')],
     'side': [S('Dry', 'dry'), S('Invisible', 'invisible'), S('Haste', 'haste'), S('Acid', 'acidBolt', note='a spit: after the shooter cards')],
     'one': [S('Friction', 'friction', note='a drawback'), S('Tornado (Dust-devil Kestrel)', 'tornado')],
     'minor': [],
     'codex': 'Friction is a drawback, not a signature. Burrow would be Invisible again: dropped. Fragile is a drawback.'},
    {'no': 19, 'id': 'm3',
     'sig': [S('Immolation', 'immolation', fix='a second burner (Cinder Stoker)'),
             S('Smoke Bomb', 'smokeBomb', 'dup', was='Smoke Screen', fix='two ash cards (out of play: Smokescreen Raccoon)')],
     'side': [S('Scar', 'scar'), S('Sturdy', 'sturdy'), S('Mighty', 'mighty'), S('Spitfire', 'spitfire')],
     'one': [S("Nature's Force", 'natureForce', 'dup', was='Force of Nature'), S('Recoil (Granite Ox Golem)', 'recoil')],
     'minor': ['Heat'],
     'codex': 'Fire resistance is a Resist entry, not a skill. Heat is minor.'},
    {'no': 20, 'id': 'm11',
     'sig': [S('Earthquake', 'earthquake', fix='on no M20 card: Gorge Wyrm (out of play) + Cave Warlord'),
             S('Fireball', 'fireball', fix='Salamander Pyromancer (Volcano Lair) + one main-list card')],
     'side': [S('Undead', 'undead'), S('Carrion', 'carrion'), S('Fire Arrow', 'fireArrow'), S('Cinder', 'fireBolt', 'dup', was='Fire Bolt')],
     'one': [S('Meteor', 'meteor')],
     'minor': ['Flying'],
     'codex': 'Fire Bolt is called Cinder in the game. Undead and Carrion (DES1) become side skills.'},
]

# ---- 1b. Owner 11:07: "My job is to winnow the unique skills to 3 per map." Other plausible signature candidates per map (from the
# Codex draft and DES1, or a side skill that could carry the map), each with a short why. The `sig` lists above are the recommended
# ones (marked, not decided). WHY: the short why for each recommended candidate.
WHY = {
    (0, 'Swarm'): 'ants and bees: the first synergy, 2 carriers', (0, 'Guardian'): 'the first basic to teach (DES1)',
    (1, 'Foraging'): 'hedgerow gatherers, 2 carriers', (1, 'Thorns'): 'brambles and hedgehogs; the map is named for it',
    (2, 'Crab Claws'): 'the crabs, 2 carriers', (2, 'Shell'): 'shells to hide in; owner 11:03 adds the retreat variant', (2, 'Molting'): 'crabs grow by shedding (Codex)',
    (3, 'Pounce'): 'falcons stooping, 2 carriers', (3, 'Reach'): 'the spear answer to 10 flyers (ENG37)', (3, 'Dive'): 'gannets and puffins plunge',
    (4, 'Bleed'): 'first wound status (Codex)', (4, 'Bulwark'): 'muskrat lodges (DES1)', (4, 'Bloom'): 'algae that spreads (DES1)',
    (5, 'Ambush'): 'logs that open their eyes', (5, 'Cull'): "hunts the Envenomed: Poison's payoff", (5, 'Cure'): "Poison's counter (Codex: a curer here)",
    (6, 'Harbinger'): 'grows as things die (Codex)', (6, 'Leech'): 'leeches and lampreys (Codex)', (6, 'Heal'): 'the Newt Doctor: Heal vs Cure',
    (7, 'Sleep'): 'sleep spores (Codex)', (7, 'Paralyze'): 'paralysing spores (Codex)', (7, 'Vaccinate'): 'prevention instead of cure (Codex, owner)',
    (8, 'Illuminate'): 'light in the dark', (8, 'Echolocation'): 'bats hunt by sound',
    (9, 'Pressure'): 'owner idea: the deep', (9, 'Strangle'): 'kelp wraps (replaces Tangleweed / Suffocate)', (9, 'Skitter'): 'mudskippers (DES1)',
    (10, 'Chain Lightning'): 'electricity through water (Codex)', (10, 'Fork'): 'squid and octopus arms, 2 carriers',
    (11, 'Vulnerable'): 'talons that open you up (Codex)', (11, 'Mountain Climber'): 'goats on ledges, 2 carriers',
    (12, 'Confuse'): 'lost in the maze (Codex)', (12, 'Backstab'): 'finds a way round the walls (DES1)',
    (13, 'Rage'): 'boars and devils (DES1)', (13, 'Canopy Cover'): 'cover under the trees (DES1)',
    (14, 'Prey'): 'herds that flee', (14, 'Predator'): 'cats and hyenas that chase',
    (15, 'Speed'): 'racers on open grass (Blitz folds in)', (15, 'Stampede'): 'horses and bison run through',
    (16, 'Pack'): 'wolves and dholes are on this list', (16, 'Pack Leader'): 'the Dhole Matriarch',
    (17, 'Hibernate'): 'the Polar Bear sleeps the cold out', (17, 'Ice'): 'cold shots that Freeze (Codex Frost Bolt)', (17, 'Shatter'): 'breaks the Frozen',
    (18, 'Trap'): 'the Antlion', (18, 'Brittle'): 'glass (Codex)',
    (19, 'Immolation'): 'burning bodies', (19, 'Smoke Bomb'): 'ash and smoke (Codex Smoke Screen)',
    (20, 'Earthquake'): 'the mountain breaks (Codex)', (20, 'Fireball'): "the volcano's big hit (Codex)",
}
ALT = {
    0: [S('Regenerate', 'regen', note='the Earthworm; Codex puts it on Map 1'), S('Quick', 'quick', note='Cottontail; a basic more than an identity')],
    1: [S('Pickpocket', 'pickpocket', note='Field Mouse; one carrier'), S('Inspiring', 'inspiring', note='Cricket Drummer (owner pick as a minor)'), S('Thanatosis', 'thanatosis', note="Slow-worm; the owner's own one-off example")],
    2: [S('Armor', 'armor', note='DES1 pick; hermit crab'), S('Pierce', 'pierce', note='Oystercatcher, the Armor answer')],
    3: [S('Arrow', 'arrow', note='Codex pick; waits for the shooter cards (DES1-3)'), S('Evasive', 'evasive', note='Codex side'), S('Bleed', 'bleed', note='Razorbill; better on Map 4')],
    4: [S('Venomous', 'poison', note='DES1 pick; 3 carriers, but previewed on Maps 0 and 2'), S('Heal', 'healing', note='Codex pick; its card is on Map 6'), S('Twin Strike', 'twinStrike', note='Alley Cat')],
    5: [S('Venomous', 'poison', note='Codex "Poison"; seen since Map 0'), S('Bulwark', 'bulwark', note='Codex pick; its card is on Map 4'), S('Parasite', 'parasite', note='Codex side; on no road card')],
    6: [S('Invisible', 'invisible', note='DES1 pick; Booming Bittern'), S('True Sight', 'keenEye', note="DES1 pick; Invisible's answer"), S('Rupture', 'rupture', note='Codex pick; one out-of-play card'), S('Constrict', 'constrict', note='Codex side')],
    7: [S('Decay', 'decay', note='DES1 pick; rot'), S('Brood', 'brood', note='DES1 pick; Wolf Spider Mother'), S('Poison Gas', 'poisonGas', 'dup', was='Toxic Gas', note='Codex side')],
    8: [S('Keen Sense', 'keenSense', note='Codex "Dark Sight" (Darksight folds in)'), S('Web', 'web', note='Gallery Orb-Weaver'), S('Stealth', 'stealth', note='Codex side')],
    9: [S('Volley', 'volley', note='Codex side: schools of fish; a shooter, waits'), S('Relict', 'relict', note='Horseshoe Crab')],
    10: [S('Wave', 'wave', note='Codex pick'), S('Gash', 'gash', note='DES1 pick; 2 carriers already'), S('Charge', 'charge', note='Electric Ray')],
    11: [S('Daunt', 'daunt', note='Codex pick; seen on Map 6'), S('Pierce', 'pierce', 'dup', was='Rend', note='Codex pick; seen on Map 2'), S('Avalanche', 'avalanche', note='DES1 pick; one card')],
    12: [S('Siege', 'siege', note='DES1 pick; Mouse Sapper'), S('Stench', 'stench', note='Codex pick; on no card, folds into Daunt'), S('Restless', 'restless', note='a maze wanderer')],
    13: [S('Predator', 'predator', note='Codex pick; better with Prey on 14'), S('Carnage', 'carnage', note='Codex pick'), S('Cleave', 'sweep', note='Codex pick; seen since Map 3')],
    14: [S('Stampede', 'overwhelm', note='Codex pick; its cards are on 15'), S('Carnage', 'carnage', note='Dust Hyena'), S('Executioner', 'executioner', note='Grave-Grin Hyena')],
    15: [S('Trap', 'trap', note='Codex pick; the Antlion is on 18'), S('Bola', 'bola', note='Codex pick; a shooter, waits'), S('Lasso', 'lasso', note='Codex side; a shooter, waits'), S('Bulldoze', 'bulldoze', note='Bison Bulldozer')],
    16: [S('Hibernate', 'hibernate', note='Codex pick; its card is on 17'), S('Frostbite', 'frostbite', note='Codex pick; Woodland Caribou'), S('Cleave', 'sweep', note='DES1 pick; 3 carriers')],
    17: [S('Pack', 'pack', note='Codex pick; the wolves are on 16'), S('Frostbite', 'frostbite', note='DES1 pick'), S('Freeze', 'freeze', note='Walrus')],
    18: [S('Dry', 'dry', note='DES1 pick; a resistance more than a strategy'), S('Acid', 'acidBolt', note='Codex pick; a spit, waits for shooters'), S('Invisible', 'invisible', note='Sandfish')],
    19: [S("Nature's Force", 'natureForce', 'dup', was='Force of Nature', note='Codex pick; Elemental tribal'), S('Scar', 'scar', note='Magma Rhino'), S('Spitfire', 'spitfire', note='Fire Salamander')],
    20: [S('Undead', 'undead', note='DES1 pick; Cinder Skeleton'), S('Carrion', 'carrion', note='DES1 pick; Lammergeier'), S('Meteor', 'meteor', note='Codex pick; one card')],
}
OUT_CSV = os.path.join(ROOT, 'docs', 'design', 'skill-picks-maps-0-20-2026-11-08.csv')

# ---- 3. Duplicate groups: keys, and the proposal (keep / merge as a parameter / retire). --------------------------------------------
DUPES = [
    {'group': 'Many deaths', 'keys': ['requiem', 'dirge', 'carnage', 'tally'],
     'same': 'All four: "+2/+2 while N units have died". Only who counts differs (any / yours / enemies seen / enemies).',
     'plan': 'Merge into **Carnage** {who: any | yours | foes | seen, N}. One threshold skill.'},
    {'group': 'Many units on the field', 'keys': ['muster', 'beset', 'throng', 'sociable', 'formation'],
     'same': 'Muster / Beset / Throng: "+2/+2 while N units" on your side / theirs / both. Sociable and Formation: +1 per ally nearby (range 2 vs adjacent).',
     'plan': 'Merge Muster / Beset / Throng into **Throng** {who, N}; Sociable into **Formation** {range}.'},
    {'group': 'Grows when units die', 'keys': ['harbinger', 'berserk', 'carrion', 'scavenge', 'retribution', 'hiveMind'],
     'same': 'Each fires "when a unit dies". Harbinger +1/+1 (any), Berserk +N/+0 (allies), Carrion heals 2, Scavenge Lumber, Retribution strikes, Hive Mind buffs a Swarm ally.',
     'plan': 'Merge Berserk into **Harbinger** {who: ally, gives}. Keep Carrion (heal) and Scavenge (resource). Retribution and Hive Mind: one-offs.'},
    {'group': 'Grows on a kill', 'keys': ['momentum', 'spoils', 'midas', 'felling', 'prospector'],
     'same': 'Momentum +N/+0, Spoils +0/+2; Midas / Felling / Prospector: gain Lumber / Lumber / Metal.',
     'plan': 'Merge Spoils into **Momentum** {hp}; Midas and Prospector into **Felling** {res} (like Delivery\'s res).'},
    {'group': 'Attacks twice', 'keys': ['twinStrike', 'doubleTime', 'frenzy', 'coffee', 'encore'],
     'same': 'Twin Strike swings twice (two damage instances). Double Time = Twin Strike + its shots twice. Frenzy = Twin Strike while it has a status. Encore = again on a kill.',
     'plan': 'Keep **Twin Strike**; Double Time becomes Twin Strike {shots}. Keep Frenzy and Encore (conditions differ). Coffee: one-off.'},
    {'group': 'Sees in the dark', 'keys': ['darksight', 'keenSense', 'sonar', 'keenEye', 'illuminate', 'lantern'],
     'same': 'Darksight "sees in darkness"; Keen Sense also ignores Blind; Echolocation also ignores Smoke, Fog and Shadow. True Sight finds Invisible. Illuminate lights your side (Lantern is its old name).',
     'plan': 'Retire **Darksight** into Keen Sense. Keep Echolocation, True Sight, Illuminate (three different answers).'},
    {'group': 'Holds a unit in place', 'keys': ['web', 'bola', 'strangle', 'constrict', 'lasso', 'tangle'],
     'same': 'Web: no dodge, no moving. Bola: Pinned. Strangle: Bound + 2. Constrict: no action + 2. Lasso: both tied. Tangleweed: half its actions fail, which is Confused.',
     'plan': 'Retire **Tangleweed** (Weaver Bird to Confuse, Quicksand Queen to Web). Merge Constrict into **Strangle** {full}. Keep Web, Bola, Lasso.'},
    {'group': 'Lowers Attack', 'keys': ['daunt', 'weaken', 'stench', 'stagger', 'corrode'],
     'same': 'Daunt -N for a round; Weaken -1 for good; Stench -1 a token until washed; Stagger halves; Corrode -N a stack.',
     'plan': 'Merge Weaken and Stench into **Daunt** {lasting | washed}. Keep Stagger (halve) and Corrode (Acid\'s status).'},
    {'group': 'Takes more damage', 'keys': ['exploit', 'scar', 'shock', 'expose'],
     'same': 'Exploit: +1 a hit, one token used per hit (the owner\'s Vulnerable). Scar: +N for good. Shock: +50% (the SK3 action calls it Vulnerable). Expose strips hiding.',
     'plan': 'Exploit\'s tokens read **Vulnerable**; the SK3 "Vulnerable" action reads Shock. Merge Scar into Vulnerable {lasting}. Keep Expose.'},
    {'group': 'Bramble damage on hit', 'keys': ['breach', 'puncture', 'perforate'],
     'same': 'Breach: 1 to the bramble a melee hit. Puncture: N. Perforate: Puncture + Pierce + Bleed bundled.',
     'plan': 'Merge Breach into **Puncture** (Breach = Puncture 1). Keep Perforate as a later-map bundle.'},
    {'group': 'Same shot, two names', 'keys': ['iceBolt', 'iceArrow', 'fireArrow', 'fireBolt', 'archer', 'arrow'],
     'same': 'Ice and Ice Arrow have the same text. Fire Arrow and Cinder differ only in Speed (0 vs 1). Archer = Arrow 2 that never swings.',
     'plan': 'Merge Ice Arrow into **Ice**. Archer becomes Arrow {never swings}. Fire Arrow / Cinder: keep (Speed is the point).'},
    {'group': 'Swings first', 'keys': ['quick', 'blitz', 'speed', 'haste', 'swift'],
     'same': 'Quick = Speed 2, Blitz = Speed 10, Haste = Speed +2 and +1 to neighbours. Swift = first + dodges (on no card).',
     'plan': 'Blitz becomes **Speed** 10; keep Quick as the Speed 2 name. Retire Swift (on no card).'},
    {'group': 'Lumber and Stone by stats', 'keys': ['timber', 'hoard', 'rockSolid', 'ironWill'],
     'same': 'Timber and Hoard have the same text (+1/+1 a Lumber). Rock-solid / Iron-will: per Stone / Metal.',
     'plan': 'Merge Timber into **Hoard** {res, N} (ENG36 already phrases Hoard N).'},
    {'group': 'Gains a resource once', 'keys': ['delivery', 'stockpile', 'pearl'],
     'same': 'Stockpile\'s text is Delivery\'s word for word. Pearl = Delivery of a Pearl.',
     'plan': 'Retire **Stockpile** into Delivery; Pearl becomes Delivery {res: pearl}.'},
    {'group': 'Heals allies', 'keys': ['healing', 'nursing', 'bloom'],
     'same': 'Heal: most wounded ally 1. Nursing: weakest wounded ally N. The heal-a-random-ally "Bloom" shares its name with the copy-making Bloom.',
     'plan': 'Merge Nursing into **Heal** {N}. Rename the healing Bloom (key bloom) to avoid two Blooms.'},
]

# ---- 4. Card renames on Maps 0-20 (owner #15). (old, new, why) ------------------------------------------------------------------
RENAMES = [
    ('Hollow-belly Rat', 'Hungry Rat', 'compound'), ('Bramble Sprout', 'Hedgehog', 'hides the animal'),
    ('Open-Ocean Hermit Crab', 'Hermit Crab', 'compound'), ('Pincushion Urchin', 'Sea Urchin', 'compound'), ('Rock Pool Starfish', 'Starfish', 'compound'),
    ('Peregrine Stooper', 'Falcon', 'jargon'), ('Red-billed Chough', 'Cliff Crow', 'specific species'), ('Kittiwake Flock', 'Gull Flock', 'specific species'),
    ('Gannet Nestweaver', 'Gannet', 'compound'),
    ('Snapstick Turtle', 'Snapping Turtle', 'invented word'), ('Muskrat Lodgekeeper', 'Muskrat', 'compound'), ('Platypus Spur', 'Platypus', 'compound'),
    ('Pyrenean Desman', 'Water Mole', "owner's example"), ("Lion's Mane Jelly", 'Stinging Jelly', 'specific species'),
    ('Alligator Gar', 'Garfish', 'specific species'), ('Fen Mink', 'Mink', 'compound'), ('Constrictor Coil', 'Python', 'compound'),
    ('Cypress Root Lurker', 'Lurking Gator', 'hides the animal'), ('Anhinga Spearbird', 'Snakebird', 'rare species + weapon word'),
    ('Poison Dart Croaker', 'Poison Frog', 'exotic'), ('Venomlord Serpent', 'Swamp Viper', 'rank word'),
    ('Planarian Splitter', 'Flatworm', 'specific'), ('Corpse-flower Beetle', 'Burying Beetle', 'banned art word'), ('Fungal Colossus', 'Mushroom Bear', 'hides the animal'),
    ('Leafcutter Gardener', 'Leafcutter Ant', 'hides the animal'), ('Hawthorn Shieldbug', 'Shieldbug', 'compound'),
    ('Echo Screecher', 'Cave Bat', 'hides the animal'), ('Giant Cave Huntsman', 'Huntsman Spider', 'hides the animal'), ('Star-nosed Mole', 'Snout Mole', 'rare species'),
    ('Cave Olm', 'Cave Salamander', 'rare species'), ('Stalactite Pill Bug', 'Woodlouse', 'compound (Pill Bug is taken)'), ('Sulfur Cinder Moth', 'Glow Moth', 'compound'),
    ('Octopus Tactician', 'Octopus', 'geared word'), ('Malachite Golem', 'Jewel Beetle', 'hides the animal'), ('Gallery Orb-Weaver', 'Orb Spider', 'specific'),
    ('Banded Sea Krait', 'Sea Snake', 'specific species'), ('Mangrove Monitor', 'Mangrove Lizard', 'banned art word'), ('Sunbittern Strider', 'Heron', 'rare species'),
    ('Proboscis Monkey', 'Long-nosed Monkey', 'rare species (or a later map)'), ('Sea Turtle Elder', 'Sea Turtle', 'compound'),
    ('Colossal Squid', 'Giant Squid', 'specific species'), ('Kraken Spawnling', 'Young Octopus', 'myth word'), ('Supernova Jelly', 'Glow Jelly', 'complex'),
    ('Clownfish Scout', 'Clownfish', 'compound'),
    ('Eagle-Owl Quartermaster', 'Eagle Owl', 'geared word'), ('Ibex Rockcaller', 'Ibex', 'compound'), ('Chamois Leaper', 'Mountain Goat', 'specific species'),
    ('Quillguard', 'Porcupine', 'hides the animal'), ('Lyrebird Mimic', 'Mockingbird', 'exotic'), ('Mouse Sapper', 'Digger Mouse', 'military word'),
    ('Quill-Thorn Boar', 'Thorn Boar', 'compound'),
    ('Shimmerwing Stag', 'White Stag', 'invented word'), ('Tasmanian Devil', 'Tasmanian Devil', 'rare species: move to a later map'),
    ('Quillback Elder', 'Old Porcupine', 'hides the animal'), ('Redwood Woodpecker', 'Woodpecker', 'compound'),
    ('Grave-Grin Hyena', 'Laughing Hyena', 'compound'), ('Springbok Pronker', 'Springbok', 'jargon'), ('Hoopoe Herald', 'Hoopoe', 'rank word'),
    ('Gilded Roadwarden', 'Wild Horse', 'geared, hides the animal'), ('Pronghorn Racer', 'Pronghorn', 'compound'), ('Stoat Cutthroat', 'Stoat', 'weapon word'),
    ('Dhole Matriarch', 'Wild Dog Matriarch', 'rare species'), ('Cone-cutter Squirrel', 'Red Squirrel', 'compound'), ('Woodland Caribou', 'Reindeer', 'specific'),
    ('Walrus Icebreaker', 'Walrus', 'compound'), ('Frost Hare Sprinter', 'Arctic Hare', 'compound'),
    ('Dust-devil Kestrel', 'Kestrel', 'compound'), ('Thorny Devil', 'Desert Lizard', 'rare species'), ('Sandfish', 'Sand Skink', 'misleading'),
    ('Komodo Warlord', 'Komodo Dragon', 'rank word (or a later map)'), ('Roadrunner Courier', 'Roadrunner', 'compound'), ('Meerkat Burrower', 'Meerkat', 'compound'),
    ('Talus Pika', 'Pika', 'jargon'), ('Apollo Butterfly', 'Mountain Butterfly', 'specific species'), ('Pit Glutton', 'Fat Toad', 'hides the animal'),
    ('Ossuary Lammergeier', 'Bone Vulture', 'two hard words'), ('Fumarole Ibex', 'Lava Ibex', 'jargon'),
]

REF_FILES = ['arena_app.js', 'bramblewood-engine.js', 'bramblewood-texts.js', 'docs/lore-bible.md', 'docs/feelings.md']


def load(p):
    return json.load(open(os.path.join(ROOT, p), encoding='utf-8'))


def statuses():
    src = open(os.path.join(ROOT, 'bramblewood-engine.js'), encoding='utf-8').read()
    m = re.search(r'const ENG36_STATUS = \{(.*?)\n\};', src, re.S)
    return set(re.findall(r'(\w+):\s*\{', m.group(1))) if m else set()


def main():
    deliv = set(load('canonical/skill-delivery.json')['delivery'])
    known = deliv | statuses()
    census = json.load(open(CENSUS, encoding='utf-8'))
    known |= set(census['skills'])  # engine keys on cards that skill-delivery.json does not list (Bounty, Undead ...)
    allcount = {k: v['all'] for k, v in census['skills'].items()}
    cards = load('canonical/cards.json')
    by_id = {c['id']: c for c in cards}
    by_name = {c['name']: c for c in cards}
    pools = load('canonical/map-pools.json')['maps']
    errors = []

    def carriers(mid, key):
        out = []
        for cid in pools.get(mid, {}).get('cards', []):
            c = by_id.get(cid)
            if not c:
                continue
            for e in [c.get('effects')] + list((c.get('levelSkills') or {}).values()):
                if isinstance(e, dict) and skill_params.fuse(e).get(key) not in (None, False, 0):
                    out.append(c['name'])
                    break
        return out

    for m in PLAN:
        m['alt'] = ALT.get(m['no'], [])
        for it in m['sig']:
            it['why'] = WHY.get((m['no'], it['name']), '')
            if not it['why']:
                errors.append('M%s %s: no why' % (m['no'], it['name']))
        for part in ('sig', 'alt', 'side', 'one'):
            for it in m[part]:
                if it['key'] and it['key'] not in known:
                    errors.append('M%s %s: key %s not in the catalogue' % (m['no'], it['name'], it['key']))
                if it['mark'] == 'new' and it['key']:
                    errors.append('M%s %s marked new but has key %s' % (m['no'], it['name'], it['key']))
                it['cardsAll'] = allcount.get(it['key'], 0) if it['key'] else 0
                if part in ('sig', 'alt'):
                    it['carriers'] = carriers(m['id'], it['key']) if it['key'] else []
        m['name'] = next((x['name'] for x in load('docs/design/map-signatures-2026-11-08.json')['maps'] if x['id'] == m['id']), m['id'])
        n = len(m['sig'])
        if n < 2 or n > 3:
            errors.append('M%s has %d signatures' % (m['no'], n))
    for g in DUPES:
        for k in g['keys']:
            if k not in known:
                errors.append('dupe group %s: key %s unknown' % (g['group'], k))
        g['cards'] = {k: allcount.get(k, 0) for k in g['keys']}
        g['cardTotal'] = sum(g['cards'].values())

    road = census['roadCards']
    texts = {f: open(os.path.join(ROOT, f), encoding='utf-8').read() for f in REF_FILES if os.path.exists(os.path.join(ROOT, f))}
    for p in glob.glob(os.path.join(ROOT, 'canonical', '*.json')) + glob.glob(os.path.join(ROOT, 'tests', '*.js')):
        if not p.endswith(('cards.json', 'animal-tags.json', 'unit-themes.json')):
            texts[os.path.relpath(p, ROOT)] = open(p, encoding='utf-8').read()
    ren = []
    for old, new, why in RENAMES:
        c = by_name.get(old)
        if not c:
            errors.append('rename: no card %s' % old)
            continue
        if old not in road:
            errors.append('rename: %s is not on a Maps 0-20 main list' % old)
        if new != old and new in by_name:
            errors.append('rename: %s -> %s, name taken' % (old, new))
        refs = sorted(f for f, t in texts.items() if old in t)
        ren.append({'old': old, 'new': new, 'why': why, 'map': road.get(old), 'id': c['id'], 'faction': c.get('basicSet'),
                    'refs': refs, 'laterMap': new == old})
    if errors:
        print('\n'.join(errors))
        sys.exit(1)

    out = {'_about': 'DES2 (2026-11-08): skill plan for Maps 0-20 main (signatures, side, one-offs, each checked against '
                     'canonical/skill-delivery.json and the engine statuses), the new skills, duplicate groups and card renames. '
                     'Generated by tools/des2/skill_plan_2026_11_08.py. Suggestions only: nothing here changes the game.',
           'marks': MARK, 'maps': PLAN, 'newSkills': NEW_SKILLS, 'dropped': DROPPED, 'duplicates': DUPES, 'renames': ren,
           'witchdoctors': WITCH, 'parkingLot': PARKING}
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
    with open(OUT_MD, 'w', encoding='utf-8') as f:
        f.write(render(out))
    import csv
    word = {'ok': 'exists', 'dup': 'exists (other name)', 'new': 'new', 'param': 'parameter'}
    with open(OUT_CSV, 'w', encoding='utf-8', newline='') as f:
        cw = csv.writer(f)
        cw.writerow(['map', 'map name', 'candidate skill', 'exists / new', 'game key', 'cards on the map list now',
                     'cards in the game now', 'recommended', 'why', 'pick'])
        for m in PLAN:
            for rec, part in (('Y', 'sig'), ('N', 'alt')):
                for it in m[part]:
                    nm = it['name'] + (' (was %s)' % it['was'] if it['mark'] == 'dup' and it.get('was') and it['was'] != it['name'] else '')
                    cw.writerow([m['no'], m['name'], nm, word[it['mark']], it['key'] or '', len(it.get('carriers') or []),
                                 it['cardsAll'], rec, it.get('why') or it.get('note') or '', ''])
    print('ok: %d maps, %d duplicate groups (%d cards), %d renames' % (len(PLAN), len(DUPES), sum(g['cardTotal'] for g in DUPES), len(ren)))


# ---- 2. New skills and the asked-about names (effects in engine terms) ----------------------------------------------------------
NEW_SKILLS = [
    {'name': 'Pressure', 'verdict': 'new (Map 9 signature)',
     'owner': '"increases pressure by +1, every pressure increase deals 2 piercing damage to all units, but gives everyone 1 armor?" Enhanced in deep water, not required.',
     'effect': 'Pressure N (default 1): when it becomes Ready, the Depth rises N (one gauge for the whole field, at most 3 a fight). '
               'Each rise: every unit on the field takes 1 water damage that ignores Armor (as Crushing Depths); '
               'units with Tide or Pressure take none and gain +1 Armor for the fight (at most +2 from Pressure). '
               'Deep water (a Crushing Depths field): each rise deals 2, and the gauge goes to 4.',
     'differs': 'Crushing Depths is a field that hurts every round; Pressure is a unit that raises the stakes a few times and rewards deep-sea units. No existing skill grants Armor to a group or hits the whole field more than once.'},
    {'name': 'Vaccinate', 'verdict': 'new (Map 7 signature)',
     'owner': 'Codex: "Vaccinate / Immunise: grants an ally temporary immunity".',
     'effect': 'Vaccinate N (default 2): when it arrives, it and its adjacent allies are Immune to Sleep, Paralyze, Venom and Decay for N rounds '
               '(a timed ENG36 Immune entry: the status never lands and the unit shows the "held off" float). It removes nothing already on them.',
     'differs': 'ENG36 Immune is printed on one card for good. Immunity (ENG24) is self-only and covers sickness, not Sleep. Wakeful is self-only, Sleep only. Cure removes, Vaccinate prevents: the first skill that protects others.'},
    {'name': 'Vulnerable', 'verdict': 'exists as Exploit (use it)',
     'owner': '"+1 damage per counter, one removed per damage instance."',
     'effect': 'Exploit N already does exactly this: its hits put N tokens on the target; each later hit (melee, shot, bolt; not a Venom or Bleed tick) deals +1 and uses one token, before Armor. On no card today.',
     'differs': 'Shock (+50%) is called "Vulnerable" by the SK3 status action, and Unfortify gives the bramble "Vulnerable N". Proposal: the player-facing name of Exploit\'s tokens becomes Vulnerable; the SK3 action is shown as Shock (decision DES2-3).'},
    {'name': 'Twin Strike', 'verdict': 'exists (twinStrike)',
     'owner': 'Codex: "two separate damage instances".',
     'effect': 'Already so: its second swing re-enters the swing loop, so each swing is its own hit (own Vulnerable token, own On Attack triggers). On Alley Cat (Map 4) and Gatling Hog.',
     'differs': 'Double Time = Twin Strike plus its shots twice; Frenzy = Twin Strike while it has a status; Encore = one more swing on a kill. See section 3.'},
    {'name': 'Bandage', 'verdict': 'a Cure parameter (◦, not NEW!)',
     'owner': '"Bandage: removes Vulnerable and Bleed."',
     'effect': 'Cure {vs: wounds}, shown as Bandage: every upkeep, takes up to 2 Bleed and every Vulnerable token off your unit with the most Bleed.',
     'differs': 'Cure takes Venom only; Shedding cleans itself; the Cleanse action is a trigger, not a skill. One Cure family with a target: Venom (Cure), wounds (Bandage), spores (the witchdoctor\'s remedy: Sleep and Paralyze).'},
    {'name': 'Armoured Shield', 'verdict': 'a Shield parameter (◦, Map 2 side; ENG37)',
     'owner': 'Owner 11:03: a unit Shield that also gives Armor while the Shield lasts.',
     'effect': 'shield: {v: N, armor: M}: it arrives with N Shield and has +M Armor while any of that Shield is left; the Armor goes with the last Shield point.',
     'differs': 'Shield only soaks; Armor only blocks. Together the Shield lasts longer against many small hits, then the unit is plain again. Home: Conch Crawler (Shell + Shield) on Pebble Beach.'},
    {'name': 'Retreat into the shell', 'verdict': 'a Shell parameter (◦, Map 2 side; ENG37)',
     'owner': 'Owner 11:03: after it attacks, +2 Armor until the round ends.',
     'effect': 'shell: {v: 2, after: "attack"}: after its own swing it gains +2 Armor until the round ends. Plain Shell stays "+N Armor when first hit each round".',
     'differs': 'Same family, a different moment: Shell braces when hit, the retreat ducks back after striking (good against Counterattack and the Speed 0 arrows that come after the swings). Home: the hermit crabs and Box Turtle.'},
    {'name': 'Cold', 'verdict': 'drop',
     'owner': 'Codex: "reduces an enemy\'s Attack or Speed; opposite of Heat".',
     'effect': 'Heat\'s opposite already exists: Frost (+0/+2 while the field is cold). Lowering Attack is Daunt / Corrode / Stagger; lowering Speed is Slow / Stymie; cold attacks are Ice and Freeze.',
     'differs': 'Nothing left for it to do.'},
    {'name': 'Tangleweed', 'verdict': 'exists (tangle); retire it',
     'owner': '"too similar to Strangle".',
     'effect': 'Tangled: half the time its attacks, shots, skills and triggers fail. That is Confused (skills and triggers fail half the time) plus attacks. Strangle is different (Bound: half damage, no moving, 2 a round).',
     'differs': 'It duplicates Confuse more than Strangle. On 2 side-map cards: Weaver Bird to Confuse, Quicksand Queen to Web. The kelp\'s wrap on Map 9 is Strangle.'},
    {'name': 'Confusion', 'verdict': 'exists (confuse)',
     'owner': 'Codex Map 12: "behaves unpredictably or attacks an unintended target".',
     'effect': 'On-hit Confuse {chance, duration}: Confused, half its triggers, skills and actions fail. On Lyrebird Mimic (Map 12) and Sphinx. "Attacks the wrong target" is Tipsy (Marula Monkey).',
     'differs': 'Use Confuse for the maze; Tipsy stays a drink joke.'},
    {'name': 'Snare', 'verdict': 'drop',
     'owner': 'Codex: "prevents movement" (Map 12 side, Kelp Snare on 9).',
     'effect': 'Web (no dodge, no moving), Bola (Pinned) and Strangle (Bound) already hold a unit.',
     'differs': 'A fourth hold adds nothing.'},
    {'name': 'Undertow', 'verdict': 'a Wave parameter (◦, Map 9 one-off)',
     'owner': 'Codex: "pulls or displaces an enemy".',
     'effect': 'Wave {pull}: its hits drag the target one column toward this unit (Anchor and Webbed hold; a crash hurts both as Wave). Today "undertow" is only a raid-boss event (stuns the strongest).',
     'differs': 'Wave pushes away; Undertow pulls in. Same skill, a direction.'},
    {'name': 'Suffocate', 'verdict': 'drop',
     'owner': 'Codex Map 9.',
     'effect': 'Strangle and Constrict already squeeze for damage; Crushing Depths is the underwater danger.',
     'differs': 'Nothing left for it to do.'},
]

DROPPED = ['Cold', 'Tangleweed (retired)', 'Snare', 'Suffocate', 'Burrow (= Invisible)', 'Adrenaline (= Riled)', 'Recoil as displacement (it is a drawback)',
           'Swift (on no card)']

WITCH = {
    'mushrooms': [
        'Puffball (new): when hit, the attacker falls Asleep for a round: Poison Barbs {status: sleep}, not a new skill.',
        'A cordyceps-struck ant (new): on-hit Paralyze; dies into a 1/1 spore token (On Death: spawn).',
        'Nightshade Moth (exists, out of play): on-hit Sleep 50% for 2. Moves to Map 7.',
    ],
    'cures': 'Any damage already wakes a sleeper (engine). Add: Wakeful (Sleepless Shrew, out of play), Vaccinate (prevention), and the witchdoctor\'s Cure {vs: spores} (removes Sleep and Paralyze).',
    'creatures': [
        ('Truffle Piglet', 'exists, Map 7', 'a piglet in a mushroom-cap mask with a gourd of spores: Vaccinate'),
        ('Marsh-mallow Hare', 'exists, out of play (Cure 1)', 'a hare herbalist chewing marshmallow root: Cure {vs: spores}'),
        ('Peat-smoke Shaman', 'exists, out of play (Cure 1, Heal 1)', 'a toad in peat smoke; better as Map 5\'s curer'),
        ('Moss Sloth', 'new', 'moss and mushrooms grow in its fur; slow, heals and vaccinates (the unexpected animal)'),
        ('Bone-belt Capuchin', 'new', "the owner's monkey with a belt of bones: a hex doctor (Daunt + Cure {vs: spores})"),
    ],
}

PARKING = [
    ('Glide', 'Flying\'s little brother for gliders (flying squirrel, sugar glider, flying fish): dodges 1 in 4, lands in any free slot. Canopy maps.'),
    ('Height', 'A field altitude. Low atmosphere (peaks): Flying weaker, Fire weaker. Below sea level: Pressure rises on its own.'),
    ('Extremophile maps', 'Vents: every round, units not beside a vent take 1 acid, venom or heat. Dry, Immunity and Mountain Climber shrug it off. Tardigrade, yeti crab, Pompeii worm.'),
    ('Space (secret map)', 'Zero gravity: every unit counts as Flying, no Fire, no Tide. Tardigrade as the reward.'),
    ('Halve / double', 'Feeble, Mighty, Sturdy, Fragile, Rage: later maps (owner #21). Mighty on Map 14 and 19 is the only early use.'),
]


def cell(items, sig=False):
    parts = []
    for it in items:
        mk = MARK[it['mark']]
        s = '**%s** %s' % (it['name'], mk) if sig else '%s %s' % (it['name'], mk)
        if it['mark'] == 'dup' and it.get('was') and it['was'] != it['name']:
            s += ' (was %s)' % it['was']
        if sig:
            s += ' %d' % len(it.get('carriers') or [])
        parts.append(s)
    return ', '.join(parts) or '-'


def render(o):
    L = []
    w = L.append
    w('# Skill plan, Maps 0-20 (2026-11-08, DES2)\n')
    w('**Design only: nothing here is applied.** Generated by `tools/des2/skill_plan_2026_11_08.py` (data: `skill-plan-maps-0-20-2026-11-08.json`), '
      'from the owner\'s notes 11-08 10:52, the Codex draft and DES1. Every name below was checked against `canonical/skill-delivery.json` and the engine\'s statuses. '
      'The engine and `canonical/cards.json` win over this page.\n')
    w('Owner: *"Seems like there is quite a lot of skills to work around with. I agree - let\'s limit and focus in."*\n')
    w('**Marks:** ✓ exists · ≡ exists under another name (the game\'s name shown, the Codex name in brackets) · ★ new · ◦ a parameter of an existing skill (purple label, not NEW!). '
      'The number after a candidate = carriers on that map\'s list today (target 2+).\n')
    w('**In short:** only **2 genuinely new skills** (Pressure, Vaccinate) and 4 parameters of existing skills (Bandage = Cure, Undertow = Wave, and the owner\'s 11:03 Armoured Shield = Shield and Retreat into the shell = Shell, both for ENG37). Everything else the Codex asked for already exists, often under another name. '
      '%d duplicate groups, %d renames.\n' % (len(o['duplicates']), sum(1 for r in o['renames'] if not r['laterMap'])))
    w('## 1. Signature candidates per map (yours to winnow)\n')
    w('Owner 11:07: *"My job is to winnow the unique skills to 3 per map."* So these are **candidates, not decisions**: '
      'the recommended ones are in bold, the others are the plausible alternatives (Codex and DES1 picks among them). '
      'Mark your picks in **`skill-picks-maps-0-20-2026-11-08.csv`** (opens in Google Sheets; one row per candidate with its why and card counts, a blank Pick column). '
      'Nothing is applied to maps or cards.\n')
    w('| Map | Recommended | Other candidates | Side | One-offs |')
    w('|---|---|---|---|---|')
    for m in o['maps']:
        w('| **%s** %s | %s | %s | %s | %s |' % (m['no'], m['name'], cell(m['sig'], True), cell(m['alt'], True).replace('**', ''), cell(m['side']), cell(m['one'])))
    w('\n<details><summary>Why each candidate (also in the CSV)</summary>\n')
    for m in o['maps']:
        w('- **%s %s:** %s' % (m['no'], m['name'], '; '.join(['**%s**: %s' % (it['name'], it['why']) for it in m['sig']] +
                                                          ['%s: %s' % (it['name'], it['note']) for it in m['alt']])))
    w('\n</details>\n')
    w('\nMinor skills never count (owner #9): Flying, Diurnal, Nocturnal, Crepuscular, Tide, Salt, and the state skills Heat and Frost.\n')
    w('**If the recommended ones are picked, to reach 2 carriers** (skill edits or out-of-play cards; CONTENT work, then a road measure):\n')
    for m in o['maps']:
        fx = ['%s: %s' % (it['name'], it['fix']) for it in m['sig'] if it.get('fix') and len(it.get('carriers') or []) < 2]
        if fx:
            w('- **%s**: %s' % (m['no'], '; '.join(fx)))
    w('\n<details><summary>What changed from the Codex draft, per map</summary>\n')
    for m in o['maps']:
        w('- **%s %s:** %s' % (m['no'], m['name'], m['codex']))
    w('\n</details>\n')
    w('## 2. New skills and the names asked about\n')
    w('| Skill | Verdict | Proposed effect (engine terms) | How it differs |')
    w('|---|---|---|---|')
    for s in o['newSkills']:
        w('| **%s** | %s | %s | %s |' % (s['name'], s['verdict'], s['effect'], s['differs']))
    w('\n### Pressure: who the owner\'s version favours\n')
    w('- **Favours:** high-Health units, Armor-ignoring hits (Pierce, magic, Psychic) and Venom / Bleed (ticks ignore Armor). The side that plays it last, after its own board is up.')
    w('- **Hurts:** swarms, tokens and 1-4 Health units (2 a rise kills them: Brood, Bloom copies, Swarm), and every 1-2 Attack unit, which deals 0 after two rises of Armor. Most of Maps 0-10 is such cards.')
    w('- **Risk:** Armor for everyone, uncapped, stalls fights (nobody can hurt anybody) and the CPU mirrors it. Symmetric, so it has no home deck.')
    w('- **Tuned version** (the table above): 1 a rise, at most 3 rises, Armor only for Tide / Pressure units (a deep-sea reward that makes the minor Tide skill matter), deep water doubles it. Decision DES2-1.\n')
    w('### Map 7: mushrooms, spores and the witchdoctor\n')
    for x in o['witchdoctors']['mushrooms']:
        w('- %s' % x)
    w('- **Cures:** %s\n' % o['witchdoctors']['cures'])
    w('| Witchdoctor idea | Card today | Role |')
    w('|---|---|---|')
    for n, t, r in o['witchdoctors']['creatures']:
        w('| %s | %s | %s |' % (n, t, r))
    w('\n**Dropped:** %s.\n' % ', '.join(o['dropped']))
    w('## 3. Duplicate audit\n')
    w('Proposals follow ENG35 (one skill, parameters for the differences). Cards = cards carrying the group\'s keys today (any map).\n')
    w('| Group | Skills (cards) | What is the same | Proposal |')
    w('|---|---|---|---|')
    for g in sorted(o['duplicates'], key=lambda g: -g['cardTotal']):
        sk = ', '.join('%s %d' % (k, n) for k, n in g['cards'].items())
        w('| **%s** (%d) | %s | %s | %s |' % (g['group'], g['cardTotal'], sk, g['same'], g['plan']))
    w('\nRetiring the merged keys removes about %d skill names from the catalogue. Decision DES2-3.\n' %
      sum(len(re.findall(r'(?:Merge|Retire|merge|retire) ', g['plan'])) for g in o['duplicates']))
    w('## 4. Card names, Maps 0-20\n')
    w('Owner: *"I want Map 0-20\'s card names to be simple ... pyrenean xxx too complicated ... the common animals first ... blue-ringed octopus later."* '
      'Direction: non-faction animals are plain now; armed / geared animals come on later maps; some non-faction cards may subtly hold a primitive item (a monkey with a belt of bones). '
      'Card ids stay; each rename re-keys the 12 card language packs (`lang/cards/*.json`) and the art prompt.\n')
    w('| Map | Old → new |')
    w('|---|---|')
    by_map = {}
    for r in o['renames']:
        by_map.setdefault(r['map'], []).append(r)
    for no in sorted(by_map):
        w('| %s | %s |' % (no, '; '.join(('%s → %s' % (r['old'], r['new'])) if not r['laterMap'] else '%s → a later map' % r['old'] for r in by_map[no])))
    refd = [r for r in o['renames'] if r['refs']]
    w('\nEvery rename also touches `canonical/animal-tags.json` and `canonical/unit-themes.json` (they list every card). Decision DES2-2.\n')
    w('<details><summary>Names used elsewhere too (%d cards: code, tests, other canonical files, docs)</summary>\n' % len(refd))
    for r in refd:
        w('- %s: %s' % (r['old'], ', '.join('`%s`' % f for f in r['refs'])))
    w('\n</details>\n')
    w('Kept on purpose: everyday names (Cottontail, Field Mouse, Robin Redbreast, Box Turtle, Cane Toad ...), and role words on shooters (Snow Bunting Archer, Talon Archer), which are the geared kind.\n')
    w('## 5. Ideas parking lot\n')
    for n, t in o['parkingLot']:
        w('- **%s:** %s' % (n, t))
    w('')
    return '\n'.join(L)


if __name__ == '__main__':
    main()
