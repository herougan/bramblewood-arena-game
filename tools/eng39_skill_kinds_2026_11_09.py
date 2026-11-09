#!/usr/bin/env python3
# Package ENG39 (2026-11-09; owner decision DES2-3 a, 22:53: "Merge all 15 groups as parameters (ENG35) and rename Exploit to Vulnerable").
# Writes the duplicate-skill groups of docs/design/skill-plan-maps-0-20-2026-11-08.md (section 3) into canonical/skill-params.json as
# KINDS: a family's named versions. A kind is an old skill that keeps its own rule and its own price (Weaken, Scar, Requiem ...): on a card
# it is written as its family's key with a selector parameter, e.g. "weaken": 1 -> "daunt": {"v": 1, "lasts": "lasting"},
# "requiem": {"v": 5, "gives": {...}} -> "carnage": {"v": 5, "who": "any", "gives": {...}}. bramblewood-skillparams.js / tools/skill_params.py
# expand the selector back into the old key, so the engine and the budget read exactly what they read before (fights and prices unchanged).
# Then run python3 tools/fold_skill_params_2026_11_07.py to fold canonical/cards.json. Idempotent.
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'canonical', 'skill-params.json')

FIELDS = {
    'kind': 'a named version of the skill: its own rule and price (the old skill it replaces)',
    'lasts': 'how long it lasts: a round (default); lasting = for good; washed = until washed off',
    'swings': 'never = it never swings, it only shoots (Archer)',
    'sees': 'what it senses through: dark = darkness only (Darksight); default also Blind, Fog, Shadow',
    'hold': 'how it holds: full = the target does nothing (Constrict); bind = Bound only, no squeeze (Tangleweed)',
    'shots': 'true = its shots act twice too (Double Time)',
    'stat': 'the stat it grows: hp = Health (Spoils)',
    'range': 'how far it counts allies: 2 = within 2 slots (Sociable); default adjacent',
}
FIELD_EDITS = {
    'who': 'which units count: kin / any (Esprit); ally (Harbinger); any / yours / foes (Carnage); yours / theirs (Throng); weakest / random (Heal)',
    'res': 'the resource delivered or gained (Delivery: res; Felling: metal = Prospector)',
}

# family -> (kinds, entry fields for a family that is new here)
KINDS = {
    # owner 23:05 on ENG35-2 ("Fuse arrow and bolts"): one shot family, Arrow, with a damage type and a form (KIND_SETS below for the bolts)
    'arrow': ({'swings': {'never': 'archer'}, 'type': {'fire': 'fireArrow', 'ice': 'iceArrow'}}, None, None,
              ' swings never = Archer (Arrow N that never swings; its style part as before). type fire / ice = Fire Arrow / Ice Arrow; type + form bolt = Fire / Ice / Acid / Poison / Shock Bolt (Speed 1). The bramble / poison / bleed riders sit beside type (owner on ENG35-4: "Bramble can be a parameter").'),
    'keenSense': ({'sees': {'dark': 'darksight'}}, 'senses through Darkness, Pitch Black, Blind, Fog and Shadow', None,
                  'Keen Sense. sees dark = Darksight (darkness only).'),
    'speed': ({'kind': {'blitz': 'blitz', 'swift': 'swift'}}, 'Speed 2', 2,
              'Speed N. kind blitz = Blitz (its swing and shots at Speed 10); kind swift = Swift (first and dodges; on no card). Quick stays its own skill (the Speed 2 name).'),
    'delivery': ({'kind': {'stockpile': 'stockpile', 'pearl': 'pearl'}, 'every': {'round': 'deliveryEvery'}}, None, None,
                 ' kind stockpile = Stockpile (Lumber once, its own price); kind pearl = Pearl (a Pearl once); every round = Delivery every round (owner 23:05 on ENG35-2; its res as before).'),
    'daunt': ({'lasts': {'lasting': 'weaken', 'washed': 'stench'}}, '-1 Attack for a round on each hit', 1,
              'Daunt N. lasts lasting = Weaken (for good); lasts washed = Stench (a token until washed off).'),
    'strangle': ({'hold': {'full': 'constrict', 'bind': 'tangle'}}, 'Bound for a round and squeezed for 2', 2,
                 'Strangle N. hold full = Constrict (does nothing, squeezed N); hold bind = Tangleweed (Bound N rounds, no squeeze).'),
    'exploit': ({'lasts': {'lasting': 'scar'}}, 'Vulnerable 2: two tokens, each later hit +1 and uses one', 2,
                'Vulnerable N (shown as Vulnerable since ENG39; key exploit). lasts lasting = Scar (+N for good).'),
    'healing': ({'who': {'weakest': 'nursing', 'random': 'bloom'}}, 'heals your most wounded unit 1 a round', 1,
                'Heal N. who weakest = Nursing (weakest wounded ally N); who random = the old healing Bloom (a random wounded ally; retired).'),
    'harbinger': ({'who': {'ally': 'berserk'}}, '+1/+1 when any unit dies', 1,
                  'Harbinger N. who ally = Berserk (+N/+0 when an ally dies).'),
    'twinStrike': ({'shots': {'true': 'doubleTime'}}, 'swings twice', None,
                   'Twin Strike. shots true = Double Time (its shots twice too).'),
    'puncture': ({'kind': {'breach': 'breach'}}, '1 to the enemy bramble on each landed melee hit', 1,
                 'Puncture N. kind breach = Breach (the same rule under its own price entry).'),
    'momentum': ({'stat': {'hp': 'spoils'}}, '+1/+0 on each kill', 1,
                 'Momentum N. stat hp = Spoils (+0/+N on a creature kill).'),
    'felling': ({'kind': {'midas': 'midas'}, 'res': {'metal': 'prospector'}}, '1 Lumber on a kill', 1,
                'Felling N. kind midas = Midas Touch; res metal = Prospector (Metal on a kill).'),
    'hoard': ({'kind': {'timber': 'timber'}}, '+N/+N for each Lumber you hold', 2,
              'Hoard N. kind timber = Timber (+1/+1 a Lumber, its own price).'),
    'carnage': ({'who': {'any': 'requiem', 'yours': 'dirge', 'foes': 'tally'}}, None, None,
                ' who any = Requiem (any units died); who yours = Dirge (your units); who foes = Tally (enemy units); default: enemies it saw die.'),
    'throng': ({'who': {'yours': 'muster', 'theirs': 'beset'}}, None, None,
               ' who yours = Muster (your side); who theirs = Beset (the enemy side); default: both sides.'),
    'formation': ({'range': {'2': 'sociable'}}, '+1/+0 for each adjacent ally', 1,
                  'Formation N. range 2 = Sociable (+A/+H for each ally within 2 slots).'),
}


KIND_SETS = {
    'arrow': [{'match': {'type': t, 'form': 'bolt'}, 'key': k} for t, k in
              [('fire', 'fireBolt'), ('ice', 'iceBolt'), ('acid', 'acidBolt'), ('poison', 'poisonBolt'), ('shock', 'shockBolt')]],
}
FIELDS.update({
    'type': "the shot's damage type: fire, ice, acid, poison, shock (default: a plain arrow, physical)",
    'form': 'bolt = a bolt (Speed 1, before the rest swing); default an arrow (Speed 0, after the swings)',
    'every': 'round = it delivers every round it is Ready (Delivery every round); default once',
})
DROP = ['iceBolt']  # owner 23:05: the Ice Bolt family of the first ENG39 pass is a kind of Arrow now


def main():
    d = json.load(open(P, encoding='utf-8'))
    for k, v in FIELDS.items():
        d['fields'][k] = v
    for k, v in FIELD_EDITS.items():
        d['fields'][k] = v
    fam = d['families']
    for k in DROP:
        fam.pop(k, None)
    for k, (kinds, default, number, about) in KINDS.items():
        if k in fam:
            f = fam[k]
            f['kinds'] = kinds
            if about.startswith(' ') and about.strip() not in f['about']:
                f['about'] = f['about'].rstrip() + ' ENG39:' + about
        else:
            fam[k] = {'params': {}, 'kinds': kinds, 'default': default, 'number': number, 'stat': None, 'ability': None,
                      'about': about + ' (ENG39, decision DES2-3)'}
    for k, sets in KIND_SETS.items():
        fam[k]['kindSets'] = sets
    d['_aboutKinds'] = ('ENG39 (2026-11-09, owner decision DES2-3 a): a family may list kinds, its named versions: {"<selector>": {"<value>": "<old key>"}}. '
                        'On a card the old skill is written as the family key with the selector, e.g. "daunt": {"v": 1, "lasts": "lasting"} (was "weaken": 1), '
                        '"carnage": {"v": 5, "who": "any"} (was "requiem": 5); a kind that is itself a family keeps its parts ("arrow": {"v": 3, "swings": "never", "style": "drop"}). '
                        'A kind named by two selectors at once is listed in "kindSets": [{"match": {"type": "fire", "form": "bolt"}, "key": "fireBolt"}]. '
                        'Expanding gives back the old key, so its rule and its price are unchanged; old keys still read. A card that holds two versions of one family keeps the second as its old key.')
    open(P, 'w', encoding='utf-8').write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('kinds written for', len(KINDS), 'families')


if __name__ == '__main__':
    main()
