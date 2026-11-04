#!/usr/bin/env python3
"""ENG24 (2026-11-04, IDEA-BRAMBLES, owner 11-04 22:34: "increase the numbers by 2. E.g. Heal 1 -> Heal 3 (at level 20 = heal 3)"): every bramble
ability's number +2 in canonical/characters.json. No bramble ability scales by level today (castleLeveled adds only Health), so the +2 is flat
and Heal 1 reads Heal 3 at every level, level 20 included. What counts as the number: an amount (Lumber, Attack, Health, Heal, Wait, damage,
Thorns, Repair, units spawned). Intervals (every N rounds), the round a spawn first comes, and uses a fight (three feeds) are not abilities'
numbers and stay. Clam Farm style "+1 Lumber every N rounds" gets castleLumberAmount 3 (the engine read a fixed 1); the Herb Refinery's fixed
heal 3 / 2 damage / +1 Lumber become {heal 5, damage 4, lumber 3}. Each bramble changed carries eng24Plus2: true, so a second run does nothing.
    python3 tools/eng24_brambles_plus2_2026_11_04.py [--dry]"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'characters.json')
AMOUNTS = ['startGold', 'firstUnitAtkBonus', 'unitHpBonus', 'flyerAtkBonus', 'castleRegen', 'enemyWaitBonus', 'castleBolt', 'aimedBolt', 'castleThorns']
raw = open(PATH, encoding='utf-8').read(); chars = json.loads(raw); log = []
for c in chars:
    e = c.get('effects') or {}
    if c.get('eng24Plus2') or not e: continue
    ch = []
    for k in AMOUNTS:
        if isinstance(e.get(k), (int, float)) and e[k] > 0: ch.append('%s %s -> %s' % (k, e[k], e[k] + 2)); e[k] += 2
    if isinstance(e.get('feed'), dict):
        for k in ('repair', 'attack'):
            if isinstance(e['feed'].get(k), (int, float)): ch.append('feed.%s %s -> %s' % (k, e['feed'][k], e['feed'][k] + 2)); e['feed'][k] += 2
    if e.get('castleLumberEvery'): n0 = e.get('castleLumberAmount', 1); e['castleLumberAmount'] = n0 + 2; ch.append('castleLumberAmount %s -> %s' % (n0, n0 + 2))
    if e.get('herbRefinery'):
        h = e['herbRefinery'] if isinstance(e['herbRefinery'], dict) else {'heal': 3, 'damage': 2, 'lumber': 1}
        e['herbRefinery'] = {k: h[k] + 2 for k in ('heal', 'damage', 'lumber')}; ch.append('herbRefinery %s' % e['herbRefinery'])
    if isinstance(e.get('castleSpawn'), dict): n0 = e['castleSpawn'].get('count', 1); e['castleSpawn']['count'] = n0 + 2; ch.append('castleSpawn.count %s -> %s' % (n0, n0 + 2))
    if ch: c['eng24Plus2'] = True; log.append('%s: %s' % (c['id'], ', '.join(ch)))
print('\n'.join(log)); print('%d brambles changed' % len(log))
if '--dry' not in sys.argv and log:
    with open(PATH, 'w', encoding='utf-8') as fh: fh.write(json.dumps(chars, ensure_ascii=False, indent=2) + ('\n' if raw.endswith('\n') else ''))
# Step 2: the flavor lines that quote a number say the new one (English only: bramble flavors have no translations). Marked eng24Flavor.
FLAV = [("worth exactly one coin — but it's one coin nobody else starts with", "worth exactly three coins — but they're three coins nobody else starts with"),
        ('+1 Attack', '+3 Attack'), ('(+1 every 2 rounds)', '(+3 every 2 rounds)'), ('+1 Health', '+3 Health'), ('Heals 1 Health every round', 'Heals a wounded ally 3 every round'),
        ('arrive 1 Wait later', 'arrive 3 Wait later'), ('1 extra Lumber', '3 extra Lumber'), ('2 extra Lumber', '4 extra Lumber'), ('1 damage to a random', '3 damage to a random'),
        ('take 1 damage', 'take 3 damage'), ('+1 Lumber every 3 rounds', '+3 Lumber every 3 rounds')]
chars = json.load(open(PATH, encoding='utf-8')); fl = 0
for c in chars:
    if not c.get('eng24Plus2') or c.get('eng24Flavor') or not c.get('flavor'): continue
    f0 = c['flavor']
    for a, b in FLAV: c['flavor'] = c['flavor'].replace(a, b)
    if c['flavor'] != f0: c['eng24Flavor'] = True; fl += 1
print('%d flavor lines' % fl)
if '--dry' not in sys.argv and fl:
    with open(PATH, 'w', encoding='utf-8') as fh: fh.write(json.dumps(chars, ensure_ascii=False, indent=2) + ('\n' if raw.endswith('\n') else ''))
