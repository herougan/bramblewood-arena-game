#!/usr/bin/env python3
# Type taxonomy (2026-10-21, package TX; owner Oct 21: "Specific animals are their greater animal type too. Eagles are birds. They
# should count so in the game, and in the filters." + "Aquatic is the geo type (not phyla). The octopi and etc need their own types
# like cephalopod or cnidaria.").
#
# Builds the one type hierarchy the engine and the app both read (bramblewood-taxonomy.js): every animal on a card -> its group
# (canonical/animal-tags.json, package UT) -> the game species it belongs to -> its class (eagle -> Raptor -> Bird; sea otter -> otter
# -> Mustelid -> Mammal; octopus -> Cephalopod -> Mollusc), plus the habitats (Coral Reef -> Ocean -> Aquatic; River -> Aquatic) and
# the aquatic animals' habitat (Fish, Cephalopod, Cnidaria, Cetacean, Echinoderm -> Aquatic). Names are matched without case, so the
# archetype "Eagle", the animal "eagle" and the group "eagle" are one node. The species -> phylum table (the Codex's phyla) lives in
# bramblewood-taxonomy.js too; phyla are not in the hierarchy (a Cephalopod is a Mollusc, but its phylum is Cephalopod, not Crawler).
#
#   python3 tools/type_taxonomy.py           write the data block into bramblewood-taxonomy.js
#   python3 tools/type_taxonomy.py --check   exit 1 when the block is not what the tool would write now
import json, os, re, sys
from collections import OrderedDict

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TAGS = os.path.join(ROOT, 'canonical', 'animal-tags.json')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
JS = os.path.join(ROOT, 'bramblewood-taxonomy.js')
BEGIN, END = '/*__TAXONOMY_DATA_BEGIN__*/', '/*__TAXONOMY_DATA_END__*/'

# group (animal-tags.json's head kind) -> its parent. A group not listed here is an error (a new animal kind needs a parent).
GROUP_PARENT = {
  # mammals
  'dog': 'Canid', 'wolf': 'Canid', 'fox': 'Canid', 'jackal': 'Canid',
  'cat': 'Felid', 'big cat': 'Felid', 'leopard': 'Felid',
  'bear': 'Ursid', 'panda': 'Ursid',
  'otter': 'Mustelid', 'badger': 'Mustelid', 'weasel': 'Mustelid', 'marten': 'Mustelid', 'skunk': 'Mustelid',
  'raccoon': 'Procyonid',
  'mouse': 'Rodent', 'rat': 'Rodent', 'squirrel': 'Rodent', 'beaver': 'Rodent', 'porcupine': 'Rodent', 'vole': 'Rodent', 'rodent': 'Mammal',
  'rabbit': 'Lagomorph', 'deer': 'Cervid',
  'ox': 'Bovine', 'goat': 'Bovine', 'sheep': 'Bovine', 'antelope': 'Bovine',
  'boar': 'Suid', 'horse': 'Equid',
  'ape': 'Primate', 'monkey': 'Primate', 'primate': 'Mammal',
  'bat': 'Mammal', 'sloth': 'Xenarthran', 'armadillo': 'Xenarthran', 'pangolin': 'Mammal',
  'hedgehog': 'Erinaceid', 'mongoose': 'Herpestid', 'hyena': 'Hyaenid',
  'elephant': 'Megafauna', 'giraffe': 'Megafauna', 'rhino': 'Megafauna',
  'whale': 'Cetacean', 'dolphin': 'Cetacean', 'seal': 'Pinniped', 'walrus': 'Pinniped',
  'mole': 'Mammal', 'shrew': 'Mammal', 'civet': 'Mammal', 'camel': 'Mammal', 'manatee': 'Mammal', 'monotreme': 'Mammal', 'marsupial': 'Mammal',
  # birds (eagle -> Raptor -> Bird, the owner's example)
  'eagle': 'Raptor', 'hawk': 'Raptor', 'falcon': 'Raptor', 'owl': 'Raptor', 'vulture': 'Raptor',
  'crow': 'Corvid', 'songbird': 'Bird', 'duck': 'Waterfowl', 'seabird': 'Bird', 'gull': 'Seabird', 'tern': 'Seabird', 'pelican': 'Seabird',
  'bird': None, 'hummingbird': 'Bird', 'swift': 'Bird', 'nightjar': 'Bird', 'pigeon': 'Bird', 'parrot': 'Bird', 'lovebird': 'Bird', 'toucan': 'Bird',
  'woodpecker': 'Bird', 'kingfisher': 'Bird', 'hoopoe': 'Bird', 'roadrunner': 'Bird', 'ptarmigan': 'Bird', 'heron': 'Bird', 'wader': 'Bird',
  # scaled
  'lizard': 'Reptile', 'snake': 'Reptile', 'turtle': 'Reptile', 'crocodile': 'Reptile', 'frog': 'Amphibian', 'salamander': 'Amphibian',
  'dragon': None,
  # water
  'fish': None, 'shark': 'Fish', 'ray': 'Fish', 'eel': 'Fish', 'catfish': 'Fish', 'hagfish': 'Fish', 'lamprey': 'Fish', 'seahorse': 'Fish',
  'octopus': 'Cephalopod', 'squid': 'Cephalopod', 'nautilus': 'Cephalopod', 'cuttlefish': 'Cephalopod',
  'snail': 'Mollusc', 'slug': 'Mollusc', 'clam': 'Mollusc', 'limpet': 'Mollusc',
  'jellyfish': 'Cnidaria', 'coral': 'Cnidaria', 'anemone': 'Cnidaria',
  'starfish': 'Echinoderm', 'urchin': 'Echinoderm', 'sea cucumber': 'Echinoderm',
  # bugs
  'ant': 'Insect', 'bee': 'Insect', 'wasp': 'Insect', 'beetle': 'Insect', 'butterfly': 'Insect', 'moth': 'Insect', 'fly': 'Insect', 'gnat': 'Insect',
  'cricket': 'Insect', 'cicada': 'Insect', 'mayfly': 'Insect', 'termite': 'Insect', 'shieldbug': 'Insect', 'water bug': 'Insect', 'antlion': 'Insect',
  'springtail': 'Insect', 'caterpillar': 'Insect', 'insect': None,
  'spider': 'Arachnid', 'scorpion': 'Arachnid', 'pseudoscorpion': 'Arachnid', 'whip spider': 'Arachnid', 'horseshoe crab': 'Arachnid',
  'crab': 'Crustacean', 'lobster': 'Crustacean', 'shrimp': 'Crustacean', 'barnacle': 'Crustacean', 'woodlouse': 'Crustacean',
  'centipede': 'Myriapod', 'millipede': 'Myriapod',
  'worm': 'Annelid', 'leech': 'Annelid',
  'tardigrade': None,
}
# The classes above the groups (and the game species, which are nodes too).
CLASS_PARENT = {
  'Canid': 'Mammal', 'Felid': 'Mammal', 'Ursid': 'Mammal', 'Mustelid': 'Mammal', 'Procyonid': 'Mammal', 'Rodent': 'Mammal', 'Lagomorph': 'Mammal',
  'Cervid': 'Mammal', 'Bovine': 'Mammal', 'Suid': 'Mammal', 'Equid': 'Mammal', 'Primate': 'Mammal', 'Bat': 'Mammal', 'Xenarthran': 'Mammal',
  'Erinaceid': 'Mammal', 'Herpestid': 'Mammal', 'Hyaenid': 'Mammal', 'Megafauna': 'Mammal', 'Cetacean': ['Mammal', 'Aquatic'], 'Pinniped': 'Mammal',
  'Raptor': 'Bird', 'Corvid': 'Songbird', 'Songbird': 'Bird', 'Waterfowl': 'Bird', 'Seabird': 'Bird',
  'Insect': 'Arthropod', 'Arachnid': 'Arthropod', 'Crustacean': 'Arthropod', 'Myriapod': 'Arthropod',
  'Cephalopod': ['Mollusc', 'Aquatic'], 'Fish': 'Aquatic', 'Cnidaria': 'Aquatic', 'Echinoderm': 'Aquatic',
  # habitats (geo types): the water ones are Aquatic
  'Coral Reef': 'Ocean', 'Ocean': 'Aquatic', 'River': 'Aquatic', 'Pond': 'Aquatic',
}
# Archetype names that are not an animal of the same name (most are: "Eagle" is the eagle node).
ARCHETYPE_PARENT = {'Ants': 'ant', 'Dragon-Turtle': ['Dragon', 'turtle'], 'Leviathan': 'Cetacean'}
# Display names for nodes that only appear lower-case in the animal list.
def title(n): return n if n[:1].isupper() else ' '.join(w[:1].upper() + w[1:] for w in n.split(' '))

def build():
  rep = json.load(open(TAGS, encoding='utf-8'))
  cards = json.load(open(CARDS, encoding='utf-8'))
  parents, names = OrderedDict(), {}
  def add(child, par):
    if par is None: return
    for p in (par if isinstance(par, list) else [par]):
      ck, pk = child.lower(), p.lower()
      if ck == pk: continue
      names.setdefault(pk, title(p)); names.setdefault(ck, title(child))
      lst = parents.setdefault(ck, [])
      if pk not in lst: lst.append(pk)
  missing = set()
  for r in rep['cards']:
    a, g = r.get('animal'), r.get('group')
    if not a: continue
    add(a, g)
    if g not in GROUP_PARENT: missing.add(g)
  if missing: raise SystemExit('type_taxonomy: no parent for the animal group(s): %s (add them to GROUP_PARENT)' % ', '.join(sorted(missing)))
  for g, p in GROUP_PARENT.items(): names.setdefault(g, title(g)); add(g, p)
  for c, p in CLASS_PARENT.items(): names.setdefault(c.lower(), c); add(c, p)
  for t, p in ARCHETYPE_PARENT.items(): names.setdefault(t.lower(), t); add(t, p)
  # every archetype and species name in use keeps its own spelling as the display name
  for c in cards:
    for t in (c.get('archetypes') or []) + (c.get('species') or []): names[t.lower()] = t
  # no cycles
  def walk(k, seen):
    for p in parents.get(k, []):
      if p in seen: raise SystemExit('type_taxonomy: cycle at %s -> %s' % (k, p))
      walk(p, seen | {p})
  for k in list(parents): walk(k, {k})
  return OrderedDict(sorted(parents.items())), OrderedDict(sorted(names.items()))

def block():
  parents, names = build()
  return BEGIN + '\n  const PARENTS = ' + json.dumps(parents, ensure_ascii=False, separators=(',', ':')) + ';\n  const NAMES = ' + json.dumps(names, ensure_ascii=False, separators=(',', ':')) + ';\n  ' + END

def main():
  src = open(JS, encoding='utf-8').read()
  a, b = src.index(BEGIN), src.index(END) + len(END)
  out = src[:a] + block() + src[b:]
  if '--check' in sys.argv:
    if out != src: print('bramblewood-taxonomy.js is out of date: run python3 tools/type_taxonomy.py'); sys.exit(1)
    return
  if out != src: open(JS, 'w', encoding='utf-8').write(out)
  parents, names = build()
  print('taxonomy: %d nodes with a parent, %d names' % (len(parents), len(names)))

if __name__ == '__main__': main()
