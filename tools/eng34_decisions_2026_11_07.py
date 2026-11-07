#!/usr/bin/env python3
"""ENG34 (2026-11-07, owner 19:25: melee / ranged): the package's open calls ENG34-1..4 in docs/decisions.json (one item per line, at the top;
an item already there is replaced). The classification itself: canonical/skill-delivery.json.
    python3 tools/eng34_decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "ENG34-1", "status": "YET", "kind": "Decide", "area": "Engine", "asked": "2026-11-07", "title": "Reach and Boomerang swings: melee riders?",
  "body": "A Reach or Boomerang swing now counts as ranged for dodges: Canopy Cover dodges a Reach swing 1 in 2, as it does a Boomerang's. Claude kept a unit's own swing carrying its Bleed, Venom and other riders, ranged or not.",
  "options": ["a) Keep: the swing always carries them.", "b) A ranged swing carries only ranged effects (Fletcher), not Bleed / Venom."], "default": "a"},
 {"id": "ENG34-2", "status": "YET", "kind": "Decide", "area": "Engine", "asked": "2026-11-07", "title": "Effects left on the swing only",
  "body": "Every melee hit (Cleave, prongs, Pounce, Ambush, Counterattack, a Parasite's feed) now carries Bleed, Venom, Daunt, Breach, Leech, Decay, Corrode, Toxin, Weaken, the status rolls and On Hit, and Thorns answers them. Kept on the swing alone: Wave, Dragon Lightning, Electricity, Chain Lightning, Swipe, Overwhelm, Momentum, Slash & Burn.",
  "options": ["a) Keep those on the swing.", "b) Every melee hit for those too."], "default": "a"},
 {"id": "ENG34-3", "status": "YET", "kind": "Decide", "area": "Balance", "asked": "2026-11-07", "title": "Fletcher: which ranged hits",
  "body": "Fletcher and Weapon Master now add to every single-target ranged shot: arrows, bolts and spits, Spitfire, Snipe, a thrown banana, Rocket's main hit, Missile, Deal damage. Not area skills (Fireball, Earthquake, Tsunami, Skyfall). The Fletcher's Eye perk stays on Arrow.",
  "options": ["a) Keep.", "b) Area skills too.", "c) Back to arrows only."], "default": "a"},
 {"id": "ENG34-4", "status": "YET", "kind": "Confirm", "area": "Engine", "asked": "2026-11-07", "title": "Edge-case classifications",
  "body": "Charge: none (its action decides; Deal damage is ranged). Sentry: ranged (a skill hit). Gash and Render: melee, but no damage, so they carry nothing. Earthquake, Nova, Landslide, Tsunami: ranged areas. Immolation, Dynamite, Trap: none. Pounce still rolls the skill dodges (Canopy Cover, Mach 1 in 2).",
  "options": ["a) Keep these.", "b) Change some (say which)."], "default": "a"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'ENG34'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "ENG34-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: ENG34-1..4')
