#!/usr/bin/env python3
# Animal tags (2026-10-19, package UT; owner 09:52: "tag an animal to the card. For ghosts and spirits and elementals - they have an
# animal embodiment, see. But subtype ghost or elemental etc.").
#
# Every creature card gets `animal`: the animal it is, or the animal its ghost / spirit / elemental / construct body takes (from its
# name, flavor, art or emoji). Those beings also get `subtype`, one of SUBTYPES below. A non-creature card (spell, field, item, egg)
# gets `animal` only when it clearly embodies one (the River Bundle egg hatches otters; the Red Dragon Egg is a dragon).
# `species` is left as it is; where the two disagree the report says so (speciesNote), for the owner.
#
# The tags come from, in order: the hand-checked table MANUAL (art / flavor reads, and the proposals for the few beings with no animal
# in their art at all, marked how='proposed'), the name (NAME_ANIMAL, longest phrase first), the emoji (ICON_ANIMAL), the archetype.
# Writes them into canonical/cards.json in place (after `species`; json.dumps(indent=2) round-trips the file byte for byte) and the
# report canonical/animal-tags.json (every card's animal, group, subtype and where it came from; counts; the owner's calls).
#
#   python3 tools/animal_tags.py           write both files
#   python3 tools/animal_tags.py --check   exit 1 when either file is not what the tool would write now
#   python3 tools/animal_tags.py --review  print every tag and its source
import json, os, re, sys
from collections import Counter, OrderedDict

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
OUT = os.path.join(ROOT, 'canonical', 'animal-tags.json')

# The fixed subtype list (tests/animal-tags-2026-10-19.js checks every card against it).
SUBTYPES = OrderedDict([
  ('ghost', 'Ghost: a wraith, wisp or shade of the restless dead'),
  ('spirit', 'Spirit: a shrine spirit, a candle-keeper, a shadow-thing'),
  ('elemental', 'Elemental: fire, water, air, storm, stone or ice given an animal shape'),
  ('undead', 'Undead: bones and revenants that stood back up'),
  ('construct', 'Construct: a golem, a summoned shield, an iron warden'),
  ('structure', 'Structure: a building that fights (a hill, a hive, a dam, a gate)'),
  ('fiend', 'Fiend: imps, devils and the things the Ashen Choir calls up'),
  ('conjured', 'Conjured: a plague creature summoned out of nothing (Frog, Fly)'),
  ('plant', 'Plant: an ent, a vine, a walking willow'),
  ('fungus', 'Fungus: a mushroom that walks'),
  ('mythic', 'Mythic: a great beast of the old songs (dragons, the leviathan, the dragon-turtle)'),
  ('changeling', 'Changeling: wears whatever shape you hoped for'),
  ('were', 'Were-beast: a creature that becomes more of itself at night'),
  ('mutant', 'Mutant: changed by the glow or the high ground'),
  ('glitch', 'Glitch: data not found'),
])

# ---------- hand-checked: id -> (animal, subtype or None, how, note). how: art / flavor / name / icon / proposed ----------
MANUAL = {
  # elementals, spirits, ghosts: their art shows the animal they take
  'tide-spirit': ('seahorse', 'elemental', 'art', 'a wave curled into a seahorse head'),
  'gale-sprite': ('swift', 'elemental', 'art', 'a white swift in a whirl of wind'),
  'stormcaller': ('owl', 'elemental', 'proposed', 'art is a storm cloud with eyes; proposed: an owl (round, glaring, flies at night)'),
  'ember-wisp': ('firefly', 'elemental', 'proposed', 'art is a floating spark with a face; proposed: a firefly'),
  'alpine-avalanche': ('polar bear', 'elemental', 'art', 'snow rolling down as a white bear'),
  'magma-titan': ('gorilla', 'elemental', 'proposed', 'art is a hunched lava golem; proposed: a gorilla (its stance)'),
  'rimeheart-colossus': ('gorilla', 'elemental', 'proposed', 'art is a half-ice, half-lava giant; proposed: a gorilla, like the Magma Titan'),
  'wound-reaver': ('lizard', 'elemental', 'art', 'a lava lizard'),
  'magma-salamander': ('salamander', 'elemental', 'name', ''),
  'rimefire-salamander': ('salamander', 'elemental', 'name', ''),
  'storm-heron': ('heron', 'elemental', 'name', 'species Bird + Elemental'),
  'shrine-acolyte': ('cat', 'spirit', 'art', 'a pink shrine kitten'),
  'shrine-high-priest': ('fox', 'spirit', 'art', 'a many-tailed shrine fox'),
  'blessed-avatar': ('deer', 'spirit', 'art', 'a white stag'),
  'shrine-bell-ringer': ('sparrow', 'spirit', 'art', 'a sparrow ringing the shrine bell'),
  'echo-keeper': ('crow', 'spirit', 'art', 'a crow among candles'),
  'hollow-oath-keeper': ('salamander', 'spirit', 'art', 'a wooden salamander with a glowing face (Flora)'),
  'willow-o-wisp': ('beetle', 'spirit', 'flavor', '"a beetle made of shadow"'),
  'marsh-wisp': ('newt', 'ghost', 'proposed', 'art is a blue wisp; proposed: a newt (the marsh it haunts)'),
  'the-unremembered': ('heron', 'ghost', 'proposed', 'art is a faceless water-shade; proposed: a heron (the swamp\'s tall silhouette)'),
  'magma-wraith': ('wolf', 'ghost', 'art', 'a wolf of flame'),
  'pall-wraith': ('raven', 'ghost', 'proposed', 'no art yet; proposed: a raven ("brings the shadow with it")'),
  'bog-revenant': ('bog turtle', 'undead', 'proposed', 'art is a mossy drowned shape; proposed: a bog turtle ("the mire keeps what it drowns")'),
  'ashbone-ghoul': ('hyena', 'undead', 'art', 'a burnt canid skeleton; hyena by the skull'),
  'cinder-skeleton': ('horse', 'undead', 'art', 'a horse skeleton'),
  'obsidian-lich': ('lizard', 'undead', 'art', 'a skeletal horned lizard over lava'),
  'ember-revenant': ('boar', 'undead', 'art', 'an armoured burning boar'),
  # constructs and structures
  'stoneheart-golem': ('gorilla', 'construct', 'proposed', 'art is a stone golem; proposed: a gorilla (its build)'),
  'stalactite-golem': ('gorilla', 'construct', 'proposed', 'art is a crystal cave golem; proposed: a gorilla'),
  'malachite-golem': ('beetle', 'construct', 'art', 'a green malachite beetle'),
  'glass-golem': ('armadillo', 'construct', 'art', 'an armadillo with a glass shell'),
  'quarry-troll': ('donkey', 'construct', 'art', 'a donkey of quarried stone'),
  'iron-warden': ('badger', 'construct', 'proposed', 'art is a walking suit of iron; proposed: a badger (the forge folk)'),
  'summoned-shield': ('pangolin', 'construct', 'art', 'a golden pangolin curled into a shield'),
  'great-gate': ('duck', 'structure', 'proposed', 'a gate; proposed: a duck (the Magnate\'s keep it guards)'),
  'thornwood-palisade': ('hedgehog', 'structure', 'proposed', 'a wall of stakes; proposed: a hedgehog (all spines)'),
  'ant-hill': ('ant', 'structure', 'name', ''), 'colony': ('ant', 'structure', 'icon', ''), 'scraper-of-skies': ('bee', 'structure', 'flavor', 'a hive-tower that answers with bees'),
  'nest': ('wasp', 'structure', 'art', 'a paper wasp nest (species Insect)'), 'termite-mound': ('termite', 'structure', 'name', ''),
  'webspire-sentinel': ('spider', 'structure', 'art', ''), 'dam-wall': ('beaver', 'structure', 'icon', ''), 'riverworks-bastion': ('beaver', 'structure', 'icon', ''),
  'vampire-roost': ('vampire bat', 'structure', 'name', ''), 'coral-polyp-colony': ('coral', 'structure', 'name', 'coral polyps are animals'),
  'barnacle-fortress': ('barnacle', 'structure', 'name', ''),
  # fiends
  'cinder-imp': ('fox', 'fiend', 'art', 'a fire fox-imp'), 'ash-imp': ('cat', 'fiend', 'art', 'a grey ash cat-imp'), 'pit-glutton': ('toad', 'fiend', 'art', 'a fire toad'),
  'blackmass-acolyte': ('rat', 'fiend', 'proposed', 'art is a hooded shadow; proposed: a rat (the cult\'s hooded acolyte)'),
  'dread-bell': ('bat', 'fiend', 'proposed', 'art is a horned bell with eyes; proposed: a bat (horns like ears, rings in the dark)'),
  'tithe-collector': ('cat', 'fiend', 'art', 'a black cat collecting coins'), 'lurking-dread': ('cat', 'fiend', 'art', 'a black cat-shape in the roots'),
  'puppeteer-imp': ('fox', 'fiend', 'art', 'a fox pulling golden strings'), 'the-sixfold': ('cat', 'fiend', 'art', 'a horned black cat-demon in a ring of runes'),
  'ashmantle-fiend': ('bat', 'fiend', 'art', 'a bat-winged fire fiend'), 'brimstone-hound': ('dog', 'fiend', 'art', 'a black hellhound (Devil type)'),
  'frog-imp': ('frog', 'conjured', 'name', 'the plague of frogs'), 'fly-imp': ('fly', 'conjured', 'name', 'the plague of flies'),
  # plants and fungi
  'ent': ('owl', 'plant', 'proposed', 'art is a walking oak giant, no animal; "a walking watchtower of oak": proposed: an owl'),
  'bramble-sprout': ('hedgehog', 'plant', 'proposed', 'art is a seedling; proposed: a hedgehog ("barely a seedling, somehow already armed")'),
  'thornvine-lasher': ('lizard', 'plant', 'art', 'a lizard-shaped tangle of thorny vine'),
  'elder-willow': ('heron', 'plant', 'proposed', 'art is a willow with a face; proposed: a heron (the willow by the water)'),
  'strangler-vine': ('snake', 'plant', 'proposed', 'art is a tree face; proposed: a snake ("load-bearing" coils)'),
  'cypress-root-lurker': ('alligator', 'plant', 'proposed', 'art is a root face in the water; proposed: an alligator (lurks in the swamp)'),
  'pinecone-sapper': ('pangolin', 'plant', 'proposed', 'art is a pinecone with eyes; proposed: a pangolin (scales like a cone)'),
  'old-willow-of-the-ford': ('heron', 'plant', 'proposed', 'art is the willow; proposed: a heron, like the Elder Willow'),
  'heartwood-treant': ('bear', 'plant', 'proposed', 'art is a wooden giant; proposed: a bear'),
  'growth-sprout': ('caterpillar', 'plant', 'proposed', 'art is a sprout; proposed: a caterpillar ("every swarm counts it as one of its own")'),
  'rafflesia': ('carrion fly', 'plant', 'proposed', 'a flower that smells of carcass; proposed: a carrion fly'),
  'fungal-colossus': ('bear', 'fungus', 'art', 'a bear under a toadstool cap'),
  'puffball-bombardier': ('toad', 'fungus', 'proposed', 'art is a puffball with a face; proposed: a toad (toadstool)'),
  # mythic, changelings, were-beasts, mutants, glitch
  'red-dragon': ('dragon', 'mythic', 'art', ''), 'white-dragon': ('dragon', 'mythic', 'art', ''), 'blue-dragon': ('dragon', 'mythic', 'art', ''),
  'green-dragon': ('dragon', 'mythic', 'art', ''), 'black-dragon': ('dragon', 'mythic', 'art', ''), 'fire-drake-hatchling': ('dragon', 'mythic', 'art', ''),
  'pyroclast-wyrm': ('dragon', 'mythic', 'art', ''), 'caldera-wyrm': ('dragon', 'mythic', 'art', ''),
  'fathom-leviathan': ('whale', 'mythic', 'art', 'a whale-shaped leviathan'), 'grovebearer-dragon-turtle': ('tortoise', 'mythic', 'art', ''),
  'irradiated-couatl': ('snake', 'mythic', 'flavor', 'the feathered serpent'), 'phoenix-fledgling': ('phoenix', 'mythic', 'name', 'a firebird'),
  'sandstorm-roc': ('eagle', 'mythic', 'icon', 'the roc: a giant eagle'),
  'puddle-changeling': ('fox', 'changeling', 'art', 'a fox at a puddle ("looked like a frog yesterday")'), 'hedge-changeling': ('cat', 'changeling', 'art', 'a cat in the hedge'),
  'glass-changeling': ('fox', 'changeling', 'art', 'a fox with glass butterfly wings'),
  'weredog': ('dog', 'were', 'name', ''), 'werebadger': ('badger', 'were', 'name', ''),
  'irradiated-axolotl': ('axolotl', 'mutant', 'name', ''), 'irradiated-glow-wyrm': ('worm', 'mutant', 'art', 'a glowing green worm'),
  'mirrorhide-mutant': ('goat', 'mutant', 'art', 'a mountain goat'), 'two-headed-calf': ('cow', 'mutant', 'name', ''),
  'missingno': ('bird', 'glitch', 'proposed', 'species Bird; the art reads as a pixel cat: owner call'),
  # animals the name does not name (art / flavor reads)
  'yeti': ('yeti', None, 'name', 'the snow ape'), 'yeti-chieftain': ('yeti', None, 'name', ''), 'glacial-ape-king': ('ape', None, 'name', ''),
  'creeper': ('bee', None, 'flavor', '"a green bee with no face"'), 'tardigrade': ('tardigrade', None, 'name', ''),
  'tiny-cave-dweller': ('isopod', None, 'art', 'a round cave crustacean with feelers'), 'conch-herald': ('hermit crab', None, 'icon', 'species Crustacean, blowing a conch'),
  'trojan-raider': ('raccoon', None, 'art', 'a raccoon peeking out of the wooden horse'), 'subterraneaner': ('mole', None, 'art', ''),
  'quarry-mole': ('mole', None, 'name', ''), 'ore-smelter-mole': ('mole', None, 'name', ''), 'star-nosed-mole': ('mole', None, 'name', ''),
  'howdah-archers': ('langur', None, 'flavor', '"two langurs"'), 'king-maker': ('fox', None, 'art', ''), 'crown-pretender': ('fox', None, 'art', ''),
  'stoat-cutthroat': ('stoat', None, 'name', ''), 'sworn-shieldbearer': ('stoat', None, 'art', 'a white stoat with a shield'), 'parish-sergeant': ('badger', None, 'icon', ''),
  'balloon-archer': ('mouse', None, 'art', ''), 'lantern-bearer': ('hummingbird', None, 'art', ''), 'dawn-bellringer': ('hummingbird', None, 'flavor', ''),
  'ironmaw-warwolf': ('wolf', None, 'name', 'with Kip the monkey on its back'), 'rot-swollen-carcass': ('maggot', None, 'art', 'a log full of maggots (species Annelid)'),
  'skull-vulture': ('vulture', None, 'name', ''), 'bone-diviner': ('raven', None, 'icon', ''), 'glowworm-cluster': ('glowworm', None, 'name', ''),
  'lantern-spark-fly': ('moth', None, 'art', ''), 'wandering-traveller': ('rat', None, 'art', 'a grey rat with a bandana and pack'), 'wandering-mage': ('cat', None, 'flavor', '"a cat in a starry hat"'),
  'bramblewood-bonebreaker': ('bear', None, 'art', ''), 'meerkat-wayfarer': ('meerkat', None, 'name', ''), 'dynamite-packrat': ('pack rat', None, 'name', ''),
  'pack-rat-looter': ('pack rat', None, 'name', ''), 'triumvirate': ('lion', None, 'art', ''), 'pride-queen': ('lion', None, 'icon', ''),
  'the-contradiction': ('polar bear', None, 'flavor', ''), 'compost-grub': ('grub', None, 'name', 'species Annelid, a beetle grub by name'),
  'shallows-fry': ('minnow', None, 'proposed', 'a fish fry; proposed: a minnow'), 'reef-admiral': ('clownfish', None, 'icon', 'a reef fish (🐠)'),
  'the-gannet-queen': ('gannet', None, 'name', ''), 'heron-hag': ('heron', None, 'name', ''), 'drowned-matriarch': ('octopus', None, 'icon', ''),
  'old-shell': ('sea turtle', None, 'flavor', '"came up the beach"'), 'echo-matriarch': ('bat', None, 'icon', ''), 'thistle-baron': ('badger', None, 'icon', ''),
  'sergeant-bramblefox': ('fox', None, 'name', ''), 'wolfsbane-alpha': ('wolf', None, 'icon', ''), 'old-snapjaw': ('crocodile', None, 'icon', ''),
  'constrictor-coil': ('python', None, 'flavor', 'a constrictor'), 'venomlord-serpent': ('viper', None, 'proposed', 'a venomous serpent; proposed: a viper'),
  'puddle-skimmer': ('pond skater', None, 'flavor', ''), 'gatling-hog': ('hedgehog', None, 'icon', 'quills (🦔)'), 'muskrat-lodgekeeper': ('muskrat', None, 'name', ''),
  'baby-horned-capybara': ('capybara', None, 'name', ''), 'pyrenean-desman': ('desman', None, 'name', ''), 'water-shrew': ('shrew', None, 'name', ''),
  'hedgerow-shrew': ('shrew', None, 'name', ''), 'pika-hoarder': ('pika', None, 'name', ''), 'kinkajou-lurker': ('kinkajou', None, 'name', ''),
  'mongoose-duelist': ('mongoose', None, 'name', ''), 'platypus-spur': ('platypus', None, 'name', ''), 'quillguard': ('porcupine', None, 'icon', 'archetype Porcupine'),
  'quill-volley': ('porcupine', None, 'icon', 'archetype Porcupine'), 'mire-witch-heron': ('heron', None, 'name', ''), 'bog-behemoth': ('frog', None, 'icon', ''),
  'hanging-loafer': ('sloth', None, 'icon', ''), 'slowpoke-sentinel': ('sloth', None, 'icon', ''), 'mangrove-manatee': ('manatee', None, 'name', ''),
  'marshal-tuskwell': ('elephant', None, 'icon', ''), 'rodent-king': ('mouse', None, 'flavor', ''), 'elderhorn-monarch': ('deer', None, 'icon', ''),
  'shimmerwing-stag': ('deer', None, 'name', ''), 'stonedrop-vulture': ('vulture', None, 'flavor', 'an Egyptian vulture'), 'peak-condor': ('condor', None, 'name', ''),
  'mosswing-laborer': ('hummingbird', None, 'type', ''),
  'moray-ambusher': ('moray eel', None, 'name', 'species says Cnidarian; a moray is a fish'), 'horseshoe-crab': ('horseshoe crab', None, 'name', ''),
  'tunnel-wyrm': ('worm', None, 'icon', 'a giant worm (species Dragon)'), 'gorge-wyrm': ('worm', None, 'icon', 'a giant worm (species Dragon)'),
  'thunder-lizard': ('lizard', None, 'flavor', '"not a dragon"'), 'komodo-warlord': ('komodo dragon', None, 'name', 'a lizard'),
  'cinder-stoker': ('salamander', None, 'flavor', 'crawls into the forge-pits (species Amphibian)'),
  'riverwing-envoy': ('otter', None, 'type', 'an Otter-and-Hummingbird envoy; the first species (Mustelid) wins'),
  'nectar-vintner': ('hummingbird', None, 'type', ''), 'honeyjoe-brewer': ('hummingbird', None, 'type', 'Hummingbird + Bee types'),
  'hummingbird-needler': ('hummingbird', None, 'name', ''), 'nest-hatchling': ('hummingbird', None, 'type', ''),
  'sunspire-sky-sovereign': ('hummingbird', None, 'type', ''),
  'chained-binturong': ('binturong', None, 'name', ''), 'tasmanian-devil': ('tasmanian devil', None, 'name', ''), 'echidna-quillshot': ('echidna', None, 'name', ''),
  'mantis-shrimp': ('mantis shrimp', None, 'name', ''), 'water-scorpion': ('water scorpion', None, 'name', 'an aquatic bug (species Insect)'),
  'tarantula-hawk': ('tarantula hawk', None, 'name', 'a spider-hunting wasp'), 'wolf-spider-mother': ('wolf spider', None, 'name', ''),
  'antlion-pit': ('antlion', None, 'name', ''), 'quicksand-queen': ('ant', None, 'icon', ''), 'leafcutter-gardener': ('leafcutter ant', None, 'name', ''),
  'fire-ant-raft': ('fire ant', None, 'name', ''), 'velvet-worm': ('velvet worm', None, 'name', ''), 'planarian-splitter': ('flatworm', None, 'name', 'a planarian'),
  'giant-water-bug': ('water bug', None, 'name', ''), 'sea-hare': ('sea slug', None, 'name', 'a sea hare is a sea slug'), 'sea-cucumber': ('sea cucumber', None, 'name', ''),
  'electric-ray': ('ray', None, 'name', ''), 'reef-manta-glider': ('manta ray', None, 'name', ''), 'voltaic-eel': ('electric eel', None, 'name', ''),
  'riptide-eel': ('eel', None, 'name', ''), 'coral-current-eel': ('eel', None, 'name', ''),
  'goliath-tentacle': ('octopus', None, 'icon', ''), 'goliath-broodmother': ('octopus', None, 'icon', ''), 'kraken-spawnling': ('octopus', None, 'icon', ''),
  'colossal-squid': ('squid', None, 'name', ''), 'vampire-squid': ('vampire squid', None, 'name', ''),
  'snail-mail': ('snail', None, 'name', ''), 'inside-out-hedgehog': ('hedgehog', None, 'name', ''), 'upside-down-bat': ('bat', None, 'name', ''),
  'teatime-toad': ('toad', None, 'name', ''), 'mirror-moth': ('moth', None, 'name', ''), 'wrong-way-salmon': ('salmon', None, 'name', ''),
  'pill-bug': ('pill bug', None, 'name', 'a woodlouse (species Insect)'), 'springtail-hopper': ('springtail', None, 'name', ''),
  'carrion-fly-swarm': ('carrion fly', None, 'name', ''), 'maggot-swarmling': ('maggot', None, 'name', ''),
  'oilbird': ('oilbird', None, 'name', ''), 'cave-swiftlet': ('swiftlet', None, 'name', ''), 'anhinga-spearbird': ('anhinga', None, 'name', ''),
  'nightjar-drifter': ('nightjar', None, 'name', ''), 'red-billed-chough': ('chough', None, 'name', ''), 'battlement-heron': ('heron', None, 'name', ''),
  'eagle-owl-quartermaster': ('eagle owl', None, 'name', ''), 'ossuary-lammergeier': ('lammergeier', None, 'name', 'a bearded vulture'),
  'flagellant-vulture': ('vulture', None, 'name', ''), 'ash-cloud-condor': ('condor', None, 'name', ''),
  'snow-owl-sentinel': ('snowy owl', None, 'name', ''), 'great-horned-owl': ('great horned owl', None, 'name', ''),
  'mudflat-godwit': ('godwit', None, 'name', ''), 'sunbittern-strider': ('sunbittern', None, 'name', ''), 'booming-bittern': ('bittern', None, 'name', ''),
  'hoopoe-herald': ('hoopoe', None, 'name', ''), 'lyrebird-mimic': ('lyrebird', None, 'name', ''), 'weaver-bird': ('weaver bird', None, 'name', ''),
  'jay-pilferer': ('jay', None, 'name', ''), 'golden-magpie': ('magpie', None, 'name', ''), 'field-crow': ('crow', None, 'name', ''),
  'gull-thief': ('gull', None, 'name', ''), 'courier-pigeon': ('pigeon', None, 'name', ''), 'pigeon-peon': ('pigeon', None, 'name', ''),
  'crossed-eyes': ('pigeon', None, 'proposed', 'a cross-eyed little bird (🐦); proposed: a pigeon'),
  'weathervane-swift': ('swift', None, 'name', ''), 'talon-archer': ('hawk', None, 'icon', '🦅 with a bow'),
  'hawk-arrowkeeper': ('hawk', None, 'name', ''), 'fire-hawk': ('kite', None, 'name', 'the fire hawks are kites that spread bushfires'),
  'dust-devil-kestrel': ('kestrel', None, 'name', ''), 'peregrine-stooper': ('peregrine falcon', None, 'name', ''), 'marsh-harrier': ('harrier', None, 'name', ''),
  'tax-collector-teal': ('teal', None, 'name', ''), 'gilded-swan-knight': ('swan', None, 'name', ''), 'magnate-duck': ('duck', None, 'name', ''),
  'goose-sentry': ('goose', None, 'name', ''), 'abbey-goose': ('goose', None, 'name', ''), 'great-crested-grebe': ('grebe', None, 'name', ''),
  'migration-leader': ('duck', None, 'icon', ''), 'duckling-squadron': ('duck', None, 'name', ''), 'duckling': ('duck', None, 'name', ''),
  'pelican-diver': ('pelican', None, 'name', ''), 'roseate-spoonbill': ('spoonbill', None, 'name', ''),
  'mallard-marauder': ('mallard', None, 'name', ''), 'mallard-halberdier': ('mallard', None, 'name', ''),
}

# ---------- name words (longest first) ----------
NAME_ANIMAL = [
  ('polar bear', 'polar bear'), ('honey badger', 'honey badger'), ('snow leopard', 'snow leopard'), ('leopard seal', 'leopard seal'), ('leopard slug', 'leopard slug'),
  ('sea turtle', 'sea turtle'), ('box turtle', 'box turtle'), ('sea krait', 'sea krait'), ('sea snake', 'sea snake'), ('whale shark', 'whale shark'),
  ('sperm whale', 'sperm whale'), ('humpback', 'humpback whale'), ('hammerhead', 'hammerhead shark'), ('greenland shark', 'greenland shark'),
  ('electric catfish', 'electric catfish'), ('horseshoe crab', 'horseshoe crab'), ('hermit crab', 'hermit crab'), ('fiddler crab', 'fiddler crab'),
  ('blue-ringed octopus', 'blue-ringed octopus'), ('lion\'s mane jelly', 'jellyfish'), ('moon jelly', 'jellyfish'), ('supernova jelly', 'jellyfish'),
  ('crown-of-thorns', 'starfish'), ('starfish', 'starfish'), ('urchin', 'sea urchin'), ('giant clam', 'giant clam'),
  ('pine marten', 'pine marten'), ('fennec', 'fennec fox'), ('arctic fox', 'arctic fox'), ('swift fox', 'swift fox'), ('vixen', 'fox'),
  ('musk ox', 'musk ox'), ('mountain goat', 'mountain goat'), ('scree goat', 'mountain goat'), ('chamois', 'chamois'), ('ibex', 'ibex'),
  ('grey seal', 'grey seal'), ('harbor seal', 'harbor seal'), ('harp seal', 'harp seal'), ('ringed seal', 'ringed seal'),
  ('fishing cat', 'fishing cat'), ('house cat', 'cat'), ('alley cat', 'cat'), ('tomcat', 'cat'), ('margay', 'margay'),
  ('star-nosed mole', 'mole'), ('slow loris', 'slow loris'), ('aye-aye', 'aye-aye'), ('proboscis monkey', 'proboscis monkey'), ('howler monkey', 'howler monkey'),
  ('silverback', 'gorilla'), ('ironback gorilla', 'gorilla'), ('mandrill', 'mandrill'), ('macaque', 'macaque'), ('gibbon', 'gibbon'), ('marula monkey', 'vervet monkey'),
  ('snow bunting', 'snow bunting'), ('arctic tern', 'arctic tern'), ('ice petrel', 'petrel'), ('robin', 'robin'), ('wren', 'wren'), ('sparrow', 'sparrow'),
  ('thrush', 'thrush'), ('shrike', 'shrike'), ('finch', 'finch'), ('wallcreeper', 'wallcreeper'), ('woodpecker', 'woodpecker'), ('woodcock', 'woodcock'),
  ('alpine swift', 'swift'), ('kingfisher', 'kingfisher'), ('toucan', 'toucan'), ('parrot', 'parrot'), ('lovebird', 'lovebird'), ('roadrunner', 'roadrunner'),
  ('ptarmigan', 'ptarmigan'), ('oystercatcher', 'oystercatcher'), ('sanderling', 'sanderling'), ('razorbill', 'razorbill'), ('kittiwake', 'kittiwake'),
  ('fulmar', 'fulmar'), ('puffin', 'puffin'), ('gannet', 'gannet'), ('heron', 'heron'), ('raven', 'raven'), ('owl', 'owl'), ('eagle', 'eagle'),
  ('vulture', 'vulture'), ('condor', 'condor'), ('hummingbird', 'hummingbird'),
  ('wolf spider', 'wolf spider'), ('diving bell spider', 'diving bell spider'), ('raft spider', 'raft spider'), ('spitting spider', 'spitting spider'),
  ('whip spider', 'whip spider'), ('trapdoor spider', 'trapdoor spider'), ('orb-weaver', 'orb-weaver spider'), ('huntsman', 'huntsman spider'),
  ('sand widow', 'widow spider'), ('tarantula', 'tarantula'), ('pseudoscorpion', 'pseudoscorpion'), ('scorpion', 'scorpion'), ('spider', 'spider'),
  ('centipede', 'centipede'), ('millipede', 'millipede'),
  ('stag beetle', 'stag beetle'), ('dung beetle', 'dung beetle'), ('hercules beetle', 'hercules beetle'), ('bombardier beetle', 'bombardier beetle'),
  ('blister beetle', 'blister beetle'), ('carrion beetle', 'carrion beetle'), ('guano beetle', 'beetle'), ('ladybird', 'ladybird'), ('shieldbug', 'shieldbug'),
  ('beetle', 'beetle'), ('cicada', 'cicada'), ('cave cricket', 'cave cricket'), ('cricket', 'cricket'), ('mayfly', 'mayfly'), ('firefly', 'firefly'),
  ('glowworm', 'glowworm'), ('mosquito', 'mosquito'), ('gnat', 'gnat'), ('fungus gnat', 'fungus gnat'), ('butterfly', 'butterfly'), ('monarch', 'monarch butterfly'),
  ('tiger moth', 'moth'), ('moth', 'moth'), ('paper wasp', 'paper wasp'), ('hornet', 'hornet'), ('wasp', 'wasp'), ('termite', 'termite'),
  ('swarm matriarch', 'bee'), ('honey bee', 'honey bee'), ('bee', 'bee'), ('ant', 'ant'), ('insect swarmling', 'beetle'),
  ('earthworm', 'earthworm'), ('rootworm', 'worm'), ('leech', 'leech'), ('lamprey', 'lamprey'), ('hagfish', 'hagfish'),
  ('slow-worm', 'slow-worm'), ('snail', 'snail'), ('cone snail', 'cone snail'), ('limpet', 'limpet'), ('conch', 'conch'), ('nautilus', 'nautilus'),
  ('cuttlefish', 'cuttlefish'), ('octopus', 'octopus'), ('squid', 'squid'),
  ('signal crayfish', 'crayfish'), ('ghost crayfish', 'crayfish'), ('lobster', 'lobster'), ('krill', 'krill'), ('crab', 'crab'),
  ('clownfish', 'clownfish'), ('parrotfish', 'parrotfish'), ('lionfish', 'lionfish'), ('wrasse', 'wrasse'), ('pufferfish', 'pufferfish'),
  ('mudskipper', 'mudskipper'), ('archerfish', 'archerfish'), ('elephant-nose fish', 'elephantnose fish'), ('ice fish', 'icefish'), ('cave fish', 'cavefish'),
  ('swordfish', 'swordfish'), ('sawfish', 'sawfish'), ('barracuda', 'barracuda'), ('piranha', 'piranha'), ('alligator gar', 'gar'), ('sturgeon', 'sturgeon'),
  ('minnow', 'minnow'), ('trout', 'trout'), ('carp', 'carp'), ('pike', 'pike'), ('guppy', 'guppy'), ('salmon', 'salmon'), ('shark', 'shark'),
  ('narwhal', 'narwhal'), ('beluga', 'beluga'), ('orca', 'orca'), ('dolphin', 'dolphin'), ('walrus', 'walrus'), ('manatee', 'manatee'),
  ('axolotl', 'axolotl'), ('olm', 'olm'), ('mudpuppy', 'mudpuppy'), ('hellbender', 'hellbender'), ('siren', 'siren'), ('salamander', 'salamander'),
  ('newt', 'newt'), ('toad', 'toad'), ('frog', 'frog'), ('croaker', 'frog'), ('puddle hopper', 'frog'),
  ('crocodile', 'crocodile'), ('alligator', 'alligator'), ('caiman', 'caiman'), ('snapper', 'snapping turtle'), ('snapstick', 'snapping turtle'),
  ('tortoise', 'tortoise'), ('turtle', 'turtle'), ('monitor', 'monitor lizard'), ('komodo', 'komodo dragon'), ('chameleon', 'chameleon'), ('gecko', 'gecko'),
  ('frillneck', 'frilled lizard'), ('thorny devil', 'thorny devil'), ('horned lizard', 'horned lizard'), ('sandfish', 'sandfish skink'),
  ('anaconda', 'anaconda'), ('cottonmouth', 'cottonmouth'), ('cobra', 'cobra'), ('grass snake', 'grass snake'), ('viper', 'viper'), ('adder', 'adder'),
  ('otter', 'otter'), ('badger', 'badger'), ('wolverine', 'wolverine'), ('mink', 'mink'), ('stoat', 'stoat'), ('ermine', 'stoat'), ('weasel', 'weasel'),
  ('skunk', 'skunk'), ('beaver', 'beaver'), ('porcupine', 'porcupine'), ('quillback', 'porcupine'), ('hedgehog', 'hedgehog'), ('hoglet', 'hedgehog'),
  ('pangolin', 'pangolin'), ('armadillo', 'armadillo'), ('sloth', 'sloth'), ('jerboa', 'jerboa'), ('dormouse', 'dormouse'), ('lemming', 'lemming'),
  ('marmot', 'marmot'), ('vole', 'vole'), ('rat', 'rat'), ('mouse', 'mouse'), ('chipmunk', 'chipmunk'), ('squirrel', 'squirrel'),
  ('jackrabbit', 'hare'), ('hare', 'hare'), ('cottontail', 'rabbit'), ('rabbit', 'rabbit'), ('meerkat', 'meerkat'), ('raccoon', 'raccoon'), ('trash panda', 'raccoon'),
  ('lynx', 'lynx'), ('panther', 'panther'), ('jaguar', 'jaguar'), ('cheetah', 'cheetah'), ('leopard', 'leopard'),
  ('terrier', 'dog'), ('hound', 'dog'), ('mastiff', 'dog'), ('collie', 'dog'), ('shepherd', 'dog'), ('farm dog', 'dog'),
  ('dhole', 'dhole'), ('jackal', 'jackal'), ('hyena', 'hyena'), ('wolf', 'wolf'), ('howler', 'wolf'), ('fox', 'fox'),
  ('bear', 'bear'), ('grizzly', 'bear'), ('elk', 'elk'), ('caribou', 'caribou'), ('muntjac', 'muntjac'), ('pronghorn', 'pronghorn'), ('springbok', 'springbok'),
  ('oryx', 'oryx'), ('fawn', 'deer'), ('stag', 'deer'), ('antler', 'deer'), ('yak', 'yak'), ('bison', 'bison'), ('sheep', 'sheep'), ('ram', 'ram'),
  ('colt', 'horse'), ('mount', 'horse'), ('charger', 'horse'), ('destrier', 'horse'), ('zebra', 'zebra'), ('mule', 'mule'), ('dromedary', 'camel'),
  ('giraffe', 'giraffe'), ('elephant', 'elephant'), ('mammoth', 'mammoth'), ('rhino', 'rhino'), ('piglet', 'pig'), ('boar', 'boar'), ('tuskboar', 'boar'),
  ('tusked', 'boar'), ('bat', 'bat'),
]
# emoji -> animal (after the name)
ICON_ANIMAL = {'🦦': 'otter', '🐝': 'bee', '🐜': 'ant', '🦉': 'owl', '🐕': 'dog', '🐕‍🦺': 'dog', '🦮': 'dog', '🐈': 'cat', '🐈‍⬛': 'cat', '🐆': 'leopard',
  '🐒': 'monkey', '🦍': 'gorilla', '🕷️': 'spider', '🪱': 'worm', '🦗': 'cricket', '🪰': 'fly', '🦋': 'butterfly', '🐟': 'fish', '🐠': 'tropical fish', '🐡': 'pufferfish',
  '🦈': 'shark', '🦔': 'hedgehog', '🦎': 'lizard', '🦝': 'raccoon', '🦡': 'badger', '🪲': 'beetle', '🐊': 'crocodile', '🐦‍⬛': 'raven', '🐺': 'wolf', '🐗': 'boar',
  '🐢': 'turtle', '🐿️': 'chipmunk', '🦅': 'eagle', '🐙': 'octopus', '🐚': 'snail', '🐻': 'bear', '🦌': 'deer', '🦊': 'fox', '🦫': 'beaver', '🐍': 'snake', '🦇': 'bat',
  '🐭': 'mouse', '🐴': 'horse', '🐸': 'frog', '🐇': 'rabbit', '🦥': 'sloth', '🦆': 'duck', '🦂': 'scorpion', '🐋': 'whale', '🐳': 'whale', '🦀': 'crab', '🦑': 'squid',
  '🐦': 'bird', '🕊️': 'dove', '🦩': 'flamingo', '🦜': 'parrot', '🦤': 'dodo', '🪶': 'heron', '🐌': 'snail', '🦞': 'lobster', '🦐': 'shrimp', '🦭': 'seal', '🪼': 'jellyfish',
  '🐐': 'goat', '🐏': 'ram', '🐂': 'ox', '🐄': 'cow', '🐑': 'sheep', '🦬': 'bison', '🐘': 'elephant', '🦏': 'rhino', '🦒': 'giraffe', '🦓': 'zebra', '🐪': 'camel',
  '🫏': 'donkey', '🦁': 'lion', '🐁': 'mouse', '🐀': 'rat', '🐹': 'hamster', '🪿': 'goose', '🦢': 'swan', '🐤': 'chick', '🐣': 'chick', '🦟': 'mosquito', '🐞': 'ladybird',
  '🐛': 'caterpillar', '🦣': 'mammoth', '🐉': 'dragon', '🪸': 'coral', '🦪': 'oyster', '🐬': 'dolphin', '🦖': 'dinosaur', '🐻‍❄️': 'polar bear', '⭐': 'starfish'}
# archetype / species -> animal (last resort)
TYPE_ANIMAL = {'Otter': 'otter', 'Hummingbird': 'hummingbird', 'Bee': 'bee', 'Ants': 'ant', 'Owl': 'owl', 'Dog': 'dog', 'Cat': 'cat', 'Wolf': 'wolf', 'Fox': 'fox',
  'Bear': 'bear', 'Deer': 'deer', 'Boar': 'boar', 'Raven': 'raven', 'Eagle': 'eagle', 'Duck': 'duck', 'Frog': 'frog', 'Rabbit': 'rabbit', 'Mouse': 'mouse',
  'Chipmunk': 'chipmunk', 'Beaver': 'beaver', 'Badger': 'badger', 'Snake': 'snake', 'Turtle': 'turtle', 'Bat': 'bat', 'Horse': 'horse', 'Sloth': 'sloth',
  'Raccoon': 'raccoon', 'Porcupine': 'porcupine', 'Hedgehog': 'hedgehog', 'Newt': 'newt', 'Snail': 'snail', 'Elephant': 'elephant', 'Rhino': 'rhino', 'Mole': 'mole',
  'Worm': 'worm', 'Fish': 'fish', 'Sheep': 'sheep', 'Vulture': 'vulture', 'Ape': 'ape', 'Cephalopod': 'octopus', 'Cetacean': 'whale'}

# the head word for grouping (most groups are the last word; these are not)
GROUP = {'polar bear': 'bear', 'honey badger': 'badger', 'snow leopard': 'leopard', 'leopard seal': 'seal', 'leopard slug': 'slug', 'sea turtle': 'turtle',
  'box turtle': 'turtle', 'snapping turtle': 'turtle', 'bog turtle': 'turtle', 'tortoise': 'turtle', 'sea krait': 'snake', 'sea snake': 'snake', 'whale shark': 'shark',
  'sperm whale': 'whale', 'humpback whale': 'whale', 'hammerhead shark': 'shark', 'greenland shark': 'shark', 'electric catfish': 'catfish', 'horseshoe crab': 'horseshoe crab',
  'hermit crab': 'crab', 'fiddler crab': 'crab', 'blue-ringed octopus': 'octopus', 'vampire squid': 'squid', 'giant clam': 'clam', 'pine marten': 'marten',
  'fennec fox': 'fox', 'arctic fox': 'fox', 'swift fox': 'fox', 'musk ox': 'ox', 'mountain goat': 'goat', 'chamois': 'goat', 'ibex': 'goat', 'grey seal': 'seal',
  'harbor seal': 'seal', 'harp seal': 'seal', 'ringed seal': 'seal', 'fishing cat': 'cat', 'margay': 'cat', 'lynx': 'cat', 'slow loris': 'primate', 'aye-aye': 'primate',
  'proboscis monkey': 'monkey', 'howler monkey': 'monkey', 'vervet monkey': 'monkey', 'mandrill': 'monkey', 'macaque': 'monkey', 'langur': 'monkey', 'gibbon': 'ape',
  'gorilla': 'ape', 'yeti': 'ape', 'snow bunting': 'songbird', 'arctic tern': 'tern', 'robin': 'songbird', 'wren': 'songbird', 'sparrow': 'songbird', 'thrush': 'songbird',
  'finch': 'songbird', 'wallcreeper': 'songbird', 'weaver bird': 'songbird', 'lyrebird': 'songbird', 'shrike': 'songbird', 'swiftlet': 'swift',
  'eagle owl': 'owl', 'snowy owl': 'owl', 'great horned owl': 'owl', 'lammergeier': 'vulture', 'peregrine falcon': 'falcon', 'kestrel': 'falcon',
  'wolf spider': 'spider', 'diving bell spider': 'spider', 'raft spider': 'spider', 'spitting spider': 'spider', 'trapdoor spider': 'spider', 'orb-weaver spider': 'spider',
  'huntsman spider': 'spider', 'widow spider': 'spider', 'tarantula': 'spider', 'whip spider': 'whip spider', 'tarantula hawk': 'wasp', 'paper wasp': 'wasp', 'hornet': 'wasp',
  'stag beetle': 'beetle', 'dung beetle': 'beetle', 'hercules beetle': 'beetle', 'bombardier beetle': 'beetle', 'blister beetle': 'beetle', 'carrion beetle': 'beetle',
  'ladybird': 'beetle', 'grub': 'beetle', 'glowworm': 'beetle', 'firefly': 'beetle', 'cave cricket': 'cricket', 'monarch butterfly': 'butterfly', 'honey bee': 'bee',
  'fire ant': 'ant', 'leafcutter ant': 'ant', 'carrion fly': 'fly', 'maggot': 'fly', 'fungus gnat': 'gnat', 'earthworm': 'worm', 'velvet worm': 'worm', 'flatworm': 'worm',
  'cone snail': 'snail', 'sea slug': 'slug', 'moray eel': 'eel', 'electric eel': 'eel', 'manta ray': 'ray', 'tropical fish': 'fish', 'elephantnose fish': 'fish',
  'icefish': 'fish', 'cavefish': 'fish', 'monitor lizard': 'lizard', 'komodo dragon': 'lizard', 'gecko': 'lizard', 'chameleon': 'lizard', 'frilled lizard': 'lizard',
  'thorny devil': 'lizard', 'horned lizard': 'lizard', 'sandfish skink': 'lizard', 'slow-worm': 'lizard', 'anaconda': 'snake', 'cottonmouth': 'snake', 'cobra': 'snake',
  'grass snake': 'snake', 'viper': 'snake', 'adder': 'snake', 'python': 'snake', 'axolotl': 'salamander', 'olm': 'salamander', 'mudpuppy': 'salamander',
  'hellbender': 'salamander', 'siren': 'salamander', 'newt': 'salamander', 'toad': 'frog', 'caiman': 'crocodile', 'alligator': 'crocodile', 'mink': 'weasel', 'stoat': 'weasel',
  'wolverine': 'weasel', 'desman': 'mole', 'shrew': 'shrew', 'jerboa': 'mouse', 'dormouse': 'mouse', 'lemming': 'vole', 'pack rat': 'rat', 'hare': 'rabbit', 'pika': 'rabbit',
  'panther': 'big cat', 'jaguar': 'big cat', 'cheetah': 'big cat', 'leopard': 'big cat', 'lion': 'big cat', 'dhole': 'wolf', 'elk': 'deer', 'caribou': 'deer',
  'muntjac': 'deer', 'pronghorn': 'antelope', 'springbok': 'antelope', 'oryx': 'antelope', 'yak': 'ox', 'bison': 'ox', 'cow': 'ox', 'ram': 'sheep', 'mule': 'horse',
  'donkey': 'horse', 'zebra': 'horse', 'mammoth': 'elephant', 'pig': 'boar', 'vampire bat': 'bat', 'mallard': 'duck', 'teal': 'duck', 'grebe': 'duck', 'goose': 'duck',
  'swan': 'duck', 'jellyfish': 'jellyfish', 'pill bug': 'woodlouse', 'isopod': 'woodlouse', 'water scorpion': 'water bug', 'pond skater': 'water bug',
  'chough': 'crow', 'jay': 'crow', 'magpie': 'crow', 'raven': 'crow', 'pigeon': 'pigeon', 'dove': 'pigeon', 'kite': 'hawk', 'harrier': 'hawk',
  'gannet': 'seabird', 'puffin': 'seabird', 'razorbill': 'seabird', 'kittiwake': 'gull', 'fulmar': 'seabird', 'petrel': 'seabird', 'oystercatcher': 'wader',
  'sanderling': 'wader', 'godwit': 'wader', 'woodcock': 'wader', 'sunbittern': 'heron', 'bittern': 'heron', 'spoonbill': 'heron', 'anhinga': 'heron',
  'kinkajou': 'raccoon', 'binturong': 'civet', 'mongoose': 'mongoose', 'meerkat': 'mongoose', 'tasmanian devil': 'marsupial', 'platypus': 'monotreme',
  'echidna': 'monotreme', 'sea urchin': 'urchin', 'sea cucumber': 'sea cucumber', 'conch': 'snail', 'dolphin': 'dolphin', 'orca': 'dolphin', 'krill': 'shrimp', 'mantis shrimp': 'shrimp', 'crayfish': 'lobster', 'capybara': 'rodent', 'muskrat': 'vole',
  'marmot': 'squirrel', 'chipmunk': 'squirrel', 'gar': 'fish', 'minnow': 'fish', 'trout': 'fish', 'carp': 'fish', 'pike': 'fish', 'guppy': 'fish', 'salmon': 'fish',
  'sturgeon': 'fish', 'clownfish': 'fish', 'parrotfish': 'fish', 'lionfish': 'fish', 'wrasse': 'fish', 'pufferfish': 'fish', 'mudskipper': 'fish', 'archerfish': 'fish',
  'swordfish': 'fish', 'sawfish': 'ray', 'barracuda': 'fish', 'piranha': 'fish', 'narwhal': 'whale', 'beluga': 'whale',
  'sandfish': 'lizard', 'eagle': 'eagle', 'condor': 'vulture', 'nightjar': 'nightjar', 'hoopoe': 'hoopoe', 'oilbird': 'nightjar', 'phoenix': 'bird', 'chick': 'bird',
  'snapping turtle': 'turtle', 'cicada': 'cicada', 'mayfly': 'mayfly', 'water bug': 'water bug', 'gnat': 'fly', 'mosquito': 'fly', 'springtail': 'springtail'}

def group_of(a): return GROUP.get(a, a.split(' ')[-1])
def is_creature(c):
  return not (c.get('test') or c.get('field') or c.get('eggKind') or c.get('cardType') in ('materia', 'equipment', 'spell') or c.get('hallOfFame'))

NAME_RE = [(re.compile(r'(?<![a-z])' + re.escape(w) + r"(s|es|lings?|let)?(?![a-z])"), a) for w, a in sorted(NAME_ANIMAL, key=lambda x: -len(x[0]))]
# non-creatures that clearly embody one animal
ITEM_ANIMAL = {'egg-otter': ('otter', 'the River Bundle hatches otters'), 'egg-red-dragon': ('dragon', 'it hatches the Red Dragon')}

def tag(c):
  cid = c['id']
  if cid in MANUAL:
    a, st, how, note = MANUAL[cid]; return a, st, how, note
  n = (c.get('name') or '').lower()
  for rx, a in NAME_RE:
    if rx.search(n): return a, None, 'name', ''
  for t in (c.get('archetypes') or []): # the type before the emoji: a 🐦 with the Hummingbird type is a hummingbird
    if t in TYPE_ANIMAL: return TYPE_ANIMAL[t], None, 'type', ''
  ic = c.get('icon') or ''
  for k in sorted(ICON_ANIMAL, key=len, reverse=True):
    if ic.startswith(k) or ic == k: return ICON_ANIMAL[k], None, 'icon', ''
  return None, None, 'none', ''

# Where the animal and the card's `species` disagree (species is left as it is; hand-checked, listed for the owner).
SPECIES_NOTES = {
  'moray-ambusher': 'species Cnidarian; a moray eel is a fish (Fish)',
  'tardigrade': 'species Insect; a tardigrade is a water bear, not an insect',
  'pill-bug': 'species Insect; a pill bug is a woodlouse, a crustacean (Crustacean)',
  'quarry-mole': 'species Rodent; moles are not rodents (Mammal)', 'ore-smelter-mole': 'species Rodent; moles are not rodents (Mammal)',
  'star-nosed-mole': 'species Rodent; moles are not rodents (Mammal)',
  'compost-grub': 'species Annelid; a grub is a beetle larva (Insect)', 'rot-swollen-carcass': 'species Annelid; its art and name are maggots, fly larvae (Insect)',
  'tunnel-wyrm': 'species Dragon; a giant worm (Annelid)', 'gorge-wyrm': 'species Dragon; a giant worm (Annelid)',
  'missingno': 'species Bird; the art reads as a pixel cat',
}

def main():
  raw = open(CARDS, encoding='utf-8').read()
  cards = json.loads(raw, object_pairs_hook=OrderedDict)
  rows, calls, miss = [], [], []
  for c in cards:
    cre = is_creature(c)
    if c.get('easterEgg'):
      # Package EE's Easter-egg cards (2026-10-19) came with their own animal / subtype; they are EE's, left exactly as they are and
      # reported (how 'ee'). Their values are not in this vocabulary yet (capitalised, free-text subtypes): an owner call.
      row = OrderedDict([('id', c['id']), ('name', c.get('name')), ('icon', c.get('icon') or ''), ('creature', bool(cre)), ('animal', c.get('animal')),
        ('group', group_of(str(c.get('animal')).lower()) if c.get('animal') else None), ('subtype', c.get('subtype')), ('how', 'ee'),
        ('note', "package EE's own tags, left as they are (not in this tool's vocabulary)")])
      rows.append(row); calls.append({'id': c['id'], 'name': c.get('name'), 'animal': c.get('animal'), 'subtype': c.get('subtype'), 'why': "an Easter-egg card with package EE's own tags: align them with this vocabulary?"})
      continue
    if cre:
      a, st, how, note = tag(c)
      if not a: miss.append(c['id'])
    elif c['id'] in ITEM_ANIMAL:
      a, note = ITEM_ANIMAL[c['id']]; st, how = None, 'item'
    else:
      a = st = None; how = 'none'; note = ''
    if st and st not in SUBTYPES: raise SystemExit('unknown subtype %s on %s' % (st, c['id']))
    row = OrderedDict([('id', c['id']), ('name', c.get('name')), ('icon', c.get('icon') or ''), ('creature', bool(cre)), ('animal', a), ('group', group_of(a) if a else None),
      ('subtype', st), ('how', how)])
    if note: row['note'] = note
    if c['id'] in SPECIES_NOTES: row['speciesNote'] = SPECIES_NOTES[c['id']]
    if c.get('faction') == 'base' or c.get('base'): row['base'] = True
    rows.append(row)
    if how == 'proposed': calls.append({'id': c['id'], 'name': c.get('name'), 'animal': a, 'subtype': st, 'why': note})
    # write into the card: after `species` (else after `archetypes`, else at the end); `subtype` right after `animal`
    new = OrderedDict()
    after = 'species' if 'species' in c else ('archetypes' if 'archetypes' in c else None)
    for k, v in c.items():
      if k in ('animal', 'subtype'): continue
      new[k] = v
      if k == after:
        if a: new['animal'] = a
        if a and st: new['subtype'] = st
    if after is None:
      if a: new['animal'] = a
      if a and st: new['subtype'] = st
    c.clear(); c.update(new)
  if miss: raise SystemExit('no animal for: ' + ', '.join(miss))
  text = json.dumps(cards, indent=2) + '\n'
  cre = [r for r in rows if r['creature']]
  rep = OrderedDict([('generated', '2026-10-19'), ('tool', 'tools/animal_tags.py'),
    ('note', 'Every creature card\'s animal (what it is, or the animal its ghost / spirit / elemental / construct body takes), its group (the head kind, for grouping) and, for those beings, its subtype. how: name / icon / type (archetype) / art / flavor / proposed (no animal in the art: an owner call) / item (a non-creature that embodies one). speciesNote: where the animal and the species field disagree (species is unchanged).'),
    ('subtypes', [OrderedDict([('id', k), ('label', v)]) for k, v in SUBTYPES.items()]),
    ('counts', OrderedDict([('cards', len(rows)), ('creatures', len(cre)), ('tagged', sum(1 for r in rows if r['animal'])), ('animals', len(set(r['animal'] for r in cre))),
      ('groups', len(set(r['group'] for r in cre))), ('withSubtype', sum(1 for r in rows if r['subtype'])), ('proposed', len(calls)),
      ('subtype', OrderedDict(sorted(Counter(r['subtype'] for r in rows if r['subtype']).items()))), ('how', OrderedDict(sorted(Counter(r['how'] for r in cre).items()))),
      ('topGroups', OrderedDict(Counter(r['group'] for r in cre).most_common(30)))])),
    ('ownerCalls', calls),
    ('speciesNotes', [OrderedDict([('id', r['id']), ('note', r['speciesNote'])]) for r in rows if r.get('speciesNote')]),
    ('cards', rows)])
  rtext = json.dumps(rep, indent=1, ensure_ascii=False) + '\n'
  if '--check' in sys.argv:
    bad = []
    if text != raw: bad.append('canonical/cards.json')
    if not os.path.exists(OUT) or open(OUT, encoding='utf-8').read() != rtext: bad.append('canonical/animal-tags.json')
    if bad: print('out of date: ' + ', '.join(bad) + ' (run python3 tools/animal_tags.py)'); sys.exit(1)
    print('animal tags up to date'); return
  if '--dry' not in sys.argv:
    if text != raw: open(CARDS, 'w', encoding='utf-8').write(text)
    open(OUT, 'w', encoding='utf-8').write(rtext)
  print('creatures %d, animals %d (groups %d), with a subtype %d, proposed %d' % (len(cre), rep['counts']['animals'], rep['counts']['groups'], rep['counts']['withSubtype'], len(calls)))
  if '--review' in sys.argv:
    for r in rows:
      if r['animal']: print('%s | %s | %s | %s | %s | %s %s' % (r['id'], r['name'], r['icon'], r['animal'], r['group'], r['subtype'] or '', r['how']))

if __name__ == '__main__': main()
