# 2026-11-18 (CONTENT13 phase 2): fold the 16 spec cards of docs/design/content13-2026-11-18.json into canonical/cards.json
# (art from art/cards/<id>.png, uuid5, Osprey Plunger rend aimed at the facing enemy). Map lists: tools/content13/fold_pools_2026_11_18.js.
import json, base64, hashlib, uuid
C = json.load(open('canonical/cards.json'))
spec = json.load(open('docs/design/content13-2026-11-18.json'))['cards']
ids = {c['id'] for c in C}; nids = {c['numericId'] for c in C if 'numericId' in c}
NS = uuid.UUID('6ba7b811-9dad-11d1-80b4-00c04fd430c8')
for x in spec:
    s = x['card']
    assert s['id'] not in ids and s['numericId'] not in nids, s['id']
    e = json.loads(json.dumps(s['effects']))
    if s['id'] == 'osprey-plunger':
        for t in e['triggers']: t['sub'] = 'adjacent'  # the facing enemy (engine: adjacent + enemy = opposite)
    # SKAUD1 phase 2 retired Quick (-> Swift) and Spitfire (-> Arrow, fire bolt); re-fitted by the budget (Swift grants are priced 0, Arrow 1 costs 2.5)
    if s['id'] == 'bar-headed-goose-leader':
        e['triggers'][0].pop('quick'); e['triggers'][0].update(skill='swift', swift=True); s['health'] = 15
    if s['id'] == 'spitfire-sawfly-grubs': e = {'arrow': {'v': 1, 'type': 'fire', 'form': 'bolt'}}; s['health'] = 20
    # the two Special carriers: as Magnate Duck, a pack-looking source puts the budget's Map term on the host map (no source reads Map 0)
    if s['id'] == 'caddisfly-casemaker': s['source'] = {'kind': 'pack', 'tier': 4, 'map': 'm24'}
    if s['id'] == 'mole-cricket-megaphone': s['source'] = {'kind': 'pack', 'tier': 4, 'map': 'm22'}
    art = 'data:image/png;base64,' + base64.b64encode(open('art/cards/%s.png' % s['id'], 'rb').read()).decode()
    note = ('2026-11-18 (package CONTENT13, spec docs/design/content13-2026-11-18.json): %s. Level 1 budget, Map %s term (S %s of N %s). Art ART16 variant %s.'
            % (x['obtain'], x['obtainMap'], x['budget']['S'], x['budget']['N'], x['artFinal']['variant']))
    c = {'id': s['id'], 'name': s['name'], 'icon': s['icon'], 'cost': s['cost'], 'wait': s['wait'], 'attack': s['attack'], 'health': s['health'],
         'rarity': s['rarity'], 'locked': True, 'test': False, 'archetypes': s['archetypes'], 'species': s['species'], 'animal': s['animal'],
         'dmgType': 'physical', 'resist': [], 'tags': [], 'effects': e, 'flavor': s['flavor']}
    if s.get('source'): c['source'] = s['source']
    h = bytearray(hashlib.sha1(NS.bytes + ('bramblewood-card:' + s['id']).encode()).digest()[:16]); h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80
    c.update(numericId=s['numericId'], uuid=str(uuid.UUID(bytes=bytes(h))), creatorNote=note, art=art)
    C.append(c)
open('canonical/cards.json', 'w').write(json.dumps(C, indent=2, ensure_ascii=True) + '\n')
