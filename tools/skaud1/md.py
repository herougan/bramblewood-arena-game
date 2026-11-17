#!/usr/bin/env python3
# SKAUD1 (2026-11-17): the owner-facing md from docs/design/skaud1-2026-11-17.json
import json, os, collections
RETIRED = set('venomous bloom bloomWhen swimmer swimmerGrant hiveMind shieldCall lantern worthy fullMoonGrant onReadyGold pearlBed blitz doubleTime spoils stench'.split())
COVER = {'antiAirOnly': 'a drawback', 'arrowPoison': 'Arrow - bleed stays', 'arson': 'Plunder', 'sabotage': 'Plunder', 'atheist': 'Magic Armor', 'bolster': 'Shield',
         'cower': 'Shell', 'corpsefeeder': 'Devour, Carrion', 'creative': '', 'fullHand': 'Plenty', 'lean': 'Plenty', 'scarcity': 'Plenty', 'foeFullHand': 'Against All Odds',
         'foeLean': 'Against All Odds', 'glean': 'Foraging', 'harvest': 'Forestry', 'lumberFeast': 'Offspring pays Lumber', 'hydra': 'Meiosis', 'immortal': 'Undead, Thanatosis',
         'isolation': 'Lone Wolf', 'mach': 'Flying', 'majesty': 'Daunt', 'mulligan': '', 'petrify': 'Stun', 'silence': 'Bludgeon', 'stymie': 'Bulldoze', 'poisonous': 'On Death: Venom',
         'pry': 'Corrode', 'retribution': 'On Ally Death line', 'satiety': 'Molting', 'shedding': 'Molting', 'shieldwall': 'Armourer (ENG50)', 'spellward': 'Guardian', 'spotter': 'True Strike',
         'unfortify': 'Vulnerable (ENG50)', 'crit': 'Mighty', 'blind': 'Smoke Bomb', 'injured': '', 'bedrock': 'Timbered, Hoard', 'forged': 'Timbered, Hoard', 'frost': 'Frostbite',
         'salt': "Tide's Ebb Armor", 'season': '', 'riled': 'Rage, Last Stand', 'almanac': 'Plenty', 'foeScarcity': 'Against All Odds', 'formation': 'Pack', 'sociable': 'Pack',
         'converge': 'Wave', 'drunk': 'Tipsy', 'scatterbrained': 'Confuse', 'nightblind': 'Sun-shy', 'wither': 'Decay', 'banana': '', 'hibernate': '', 'skitter': 'Evasive', 'driftwood': 'Forestry (your note)'}
COVER = {k: v for k, v in COVER.items() if v}
ROOT = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../..') + '/'
d = json.load(open(ROOT + 'docs/design/skaud1-2026-11-17.json'))
SK = {e['key']: e for e in d['skills']}
CI = json.load(open(os.path.dirname(os.path.abspath(__file__)) + '/out/inv2.json'))['cardInfo']
cn = lambda i: CI[i]['name'] if i in CI else i
def nm(k):
    if not k: return ''
    if k.startswith('pair:'):
        a, b = k[5:].split('>'); return {'onKill>gain': 'On Kill: Deliver', 'onReady>damage': 'On Ready: Deal damage', 'onSpawn>gain': 'On Spawn: Gain', 'onSpawn>spawnCard': 'On Spawn: Spawn'}.get(k[5:], k[5:])
    if k.startswith('trigger:'): return 'trigger ' + {'onCharge': 'Charge N'}.get(k[8:], k[8:])
    if k.startswith('action:'): return 'action ' + {'grant': 'Grant {who} {what}'}.get(k[7:], k[7:])
    e = SK.get(k); n = e['name'] if e else k
    return {'healing': 'Heal', 'poison': 'Venomous', 'sweep': 'Cleave', 'overwhelm': 'Stampede', 'hunter': 'Cull', 'strangle': 'Constrict', 'keenSense': 'Keen Sense',
            'fireArrow': 'Arrow (Flaming)', 'fireBolt': 'Fire Bolt', 'regen': 'Regeneration', 'sap': 'Leech', 'broodkeeper': 'Broodmother', 'explode': 'Explode', 'sleep': 'Sleep on hit', 'blind': 'Blind on hit',
            'paralyze': 'Paralyze on hit', 'scar': 'Scar (lasting Exploit)', 'masonry': 'Masonry', 'plunder': 'Plunder', 'forestry': 'Forestry', 'sleepPowder': 'Sleeping Powder',
            'onReadyDamage': 'On Ready damage (old key)', 'onSpawnDevilry': 'On Spawn Darkness (old key)', 'undead': 'Undead', 'bounty': 'Bounty', 'refining': 'Refining',
            'prospecting': 'Prospecting', 'quarrying': 'Quarrying', 'delivery': 'Delivery', 'deliveryEvery': 'Delivery every turn', 'smelter': 'Smelter', 'demolisher': 'Demolisher (old Siege key)',
            'fortification': 'Build', 'stockpile': 'Stockpile', 'tribute': 'Tribute', 'punish': 'Punish', 'canopyCover': 'Canopy Cover', 'brambleArmor': 'Fortify: +1 Armor (old)',
            'constrict': 'Constrict (kind)', 'grantSkill': 'Grant (passive)', 'venomPulse': 'Pulse', 'dropRoll': 'Stop, Drop and Roll', 'paralysisPowder': 'Paralysis Powder',
            'warcry': 'Warcry', 'weakness': "Weakness (Rabid's drawback)", 'grit': 'Grit', 'fullMoonGrant': 'Full Moon braces (old twin key)', 'onReadyGold': 'On Ready Gold (old key)', 'worthy': 'Worthy (reserved)', 'swimmerGrant': 'Swimmer braces', 'exploit': 'Exploit', 'mountainClimber': 'Mountain Climber', 'evasive': 'Evasive', 'swift': 'Swift', 'kinship': 'Kinship', 'sunder': 'Sunder',
            'bulwark': 'Bulwark', 'fortify': 'Fortify', 'detonate': 'Detonate', 'carnage': 'Carnage', 'throng': 'Throng', 'momentum': 'Momentum', 'harbinger': 'Harbinger', 'puncture': 'Puncture'}.get(k, n)
def eff(e):
    out = []
    for k, v in e.items():
        if k == 'triggers':
            for t in v: out.append('%s: %s%s' % ({'onKill': 'On Kill', 'onReady': 'On Ready', 'onSpawn': 'On Spawn', 'onAttack': 'On Attack'}.get(t['on'], t['on']),
                                                {'gain': 'Deliver', 'damage': 'Deal damage', 'spawnCard': 'Spawn', 'buff': 'Buff'}.get(t['do'], t['do']),
                                                (' %s %s' % (t.get('amount', t.get('count', '')), t.get('resource', t.get('defId', '')))).rstrip()))
            continue
        if k.startswith('levelSkills'): continue
        n = nm(k)
        if v is True: out.append(n)
        elif isinstance(v, (int, float)): out.append('%s %g' % (n, v))
        elif isinstance(v, dict):
            extra = ', '.join('%s %s' % (a, b) for a, b in v.items() if a != 'v')
            out.append(('%s %s%s' % (n, v.get('v', ''), (' (%s)' % extra) if extra else '')).replace('  ', ' '))
        elif isinstance(v, list): out.append('%s (%s)' % (n, ', '.join(map(str, v))))
        else: out.append('%s %s' % (n, v))
    return ', '.join(out) or 'nothing'
def short_where(w):
    return w.replace('submap of ', 'sub ').replace('no list', 'no list')
rows_cards, rows_none = [], []
for e in d['skills']:
    if e['verdict'] not in ('merge', 'remove'): continue
    into = nm(e.get('into')) if e['verdict'] == 'merge' else '-'
    cs = [c for c in e.get('cards', []) if not c.get('test')]
    tests = [c['id'] for c in e.get('cards', []) if c.get('test')]
    if cs:
        parts = []
        for c in cs:
            if 'to' in c and 'from' in c and c['id'] != 'cottontail':
                fr, to = c['from'], c['to']
                ch = {k: v for k, v in to.items() if k != 'triggers' and fr.get(k) != v}
                nt = [t for t in to.get('triggers', []) if t not in fr.get('triggers', [])]
                if nt: ch['triggers'] = nt
                s = '%s (%s): %s' % (c['name'], short_where(c['where']), eff(ch) if ch else 'loses it')
                if c.get('newStats'): s += ', %d/%d -> %d/%d%s' % (c['stats'][0], c['stats'][1], c['newStats'][0], c['newStats'][1], ' (over today)' if c.get('overToday') else '')
            elif c['id'] == 'cottontail':
                s = 'Cottontail (Map 0 starter): its Level 1 Quick goes (Swift is New! on Map 3)'
            else:
                s = '%s (%s): %s' % (c['name'], short_where(c['where']), c.get('note', ''))
            parts.append(s)
        if tests: parts.append('test card %s repointed' % ', '.join(tests))
        rows_cards.append('| %s | %s | %s | %s | %s |' % (nm(e['key']), e['verdict'], into, '; '.join(parts), e['why']))
    else:
        rows_none.append(e)
c = d['counts']
road = sorted({cc['name'] for e in d['skills'] if e['verdict'] in ('merge', 'remove') for cc in e.get('cards', []) if 'Map ' in cc.get('where', '') and int(cc['where'].split('Map ')[1].split(';')[0].split(',')[0]) <= 20 and not cc.get('test')})
moved = sum(1 for e in d['skills'] if e['verdict'] in ('merge', 'remove') for cc in e.get('cards', []) if not cc.get('test'))
trimmed = [cc['name'] for e in d['skills'] for cc in e.get('cards', []) if cc.get('newStats') and not cc.get('test')]
renames = [e for e in d['skills'] if e['verdict'] == 'rename']
calls = [e for e in d['skills'] if e['verdict'] == 'owner-call']
L = []
L.append('# SKAUD1: skill audit, the plan (2026-11-17)')
L.append('')
L.append('**A plan only.** Nothing changes in the engine, the cards or the texts until phase 2 (after ENG50 merges). Machine copy for phase 2: `docs/design/skaud1-2026-11-17.json` (every key, its verdict, and each card\'s new effects and stats). Source: your 11-17 23:41 note (OWN-1117-3), the Skills sheet ranks and notes (II and Comments), the Proposal sheet and REDESIGN3 as must-keep, ENG50\'s build list untouched. Cards are read after the REDESIGN3 fold; every card move below passes `budget(card).ok` at Level 1 (stats trimmed where shown, fewest 3A + H points).')
L.append('')
L.append('**Result:** %d skills audited: keep %d, merge %d, remove %d, rename %d, owner-call %d. %d card moves (%d on Maps 0-20 lists: %s); %d need a stat trim.' % (
    c['skills'], c['keep'], c['merge'], c['remove'], c['rename'], c['owner-call'], moved, len(road), ', '.join(road), len(trimmed)))
L.append('')
L.append('## Merges and removes that move a card')
L.append('')
L.append('| Skill | Verdict | Into | Cards (where): what they get | Why |')
L.append('|---|---|---|---|---|')
L += rows_cards
L.append('')
L.append('## Merges and removes on no card (after REDESIGN3)')
L.append('')
GROUPS = collections.OrderedDict()
for e in rows_none:
    if e['verdict'] == 'merge': g = 'Into %s' % nm(e['into'])
    elif e['key'].startswith(('fireArrow', 'fireBolt')): g = 'Removed (your note: "Explicit remove")'
    elif e['key'] in RETIRED: g = 'Removed: retired or old keys'
    elif e.get('r3Removes') or 'REDESIGN3' in e['why']: g = 'Removed: on no card once REDESIGN3 folds'
    else: g = 'Removed: on no card, a kept skill covers it'
    GROUPS.setdefault(g, []).append(e)
order = sorted(GROUPS, key=lambda g: (not g.startswith('Into'), g))
L.append('Each line: the survivor, then what folds into it (why in the JSON). Test cards with the skill are pointed at the survivor or deleted.')
L.append('')
for g in order:
    items = []
    for e in GROUPS[g]:
        t = nm(e['key'])
        cov = COVER.get(e['key'])
        r3 = e.get('r3Removes') or []
        extra = []
        if cov: extra.append(cov)
        if r3: extra.append('REDESIGN3 takes it off ' + ', '.join(cn(i) for i in r3))
        tests = [c['id'] for c in e.get('cards', []) if c.get('test')]
        if tests: extra.append('test card only')
        items.append(t + (' (%s)' % '; '.join(extra) if extra else ''))
    L.append('- **%s:** %s.' % (g, ', '.join(items)))
L.append('')
L.append('## Renames (key unchanged)')
RN = {'strangle': ('Strangle', 'Constrict'), 'broodkeeper': ('Broodkeeper', 'Broodmother'), 'exploit': ('Exploit (shown as Vulnerable)', 'Exploit'),
      'brittle': ('Brittle (the skill)', 'Embrittle, pending SKN1-13'), 'fog': ('Fog - {...}', 'In Fog - {...}, pending SKN1-19'), 'arrowBleed': ('Arrow - bleed', 'Arrow (Laced), pending SKN1-14')}
WHY = {'strangle': "the Proposal's name (Map 6); REDESIGN3 already calls the strangle key Constrict", 'broodkeeper': 'the Proposal\'s Map 7 special; your note: "I don\'t really like the name"',
       'exploit': 'OWN-1117-2 makes Vulnerable its own 2x status (ENG50), so the token skill reads Exploit again', 'brittle': 'Brittle is the status', 'fog': 'Fog is the field pill', 'arrowBleed': 'your note "Laceration / Laced"'}
for e in renames: L.append('- %s -> %s: %s.' % (RN[e['key']][0], RN[e['key']][1], WHY[e['key']]))
L.append('')
L.append('## Owner calls (filed in docs/decisions.json)')
CALLS = {'exhaust': 'SKAUD1-1 Exhaust: your note calls Exhaust, Exploit and Expose similar but deeper together; Exhaust is on no card. Default: keep it for Maps 21+',
         'pickpocket': 'SKAUD1-2 Pickpocket: your note says it "steals items only"; then it is Disarm (takes a weapon). Default: Pickpocket steals items and takes Disarm\'s card (Glintsnatch Magpie has both)',
         'thanatosis': 'SKAUD1-3 Thanatosis: it and Undead both come back once at 1 Health (you set both on 11-07); Thanatosis is on no card after REDESIGN3. Default: keep both'}
for e in calls: L.append('- %s.' % CALLS[e['key']])
L.append('- Still open from SKN1 and used here: SKN1-16 (Heal into Nursing: who it heals), SKN1-4 (Spawner for the two Every Turn: Spawn cards), SKN1-3 (Stonecutter as 2 Lumber into 1 Stone, which is Masonry), SKN1-18 (Felling as On Kill: Deliver), SKN1-2 (Repair and Rebuild both stay: close as a).')
L.append('')
L.append('## Kept: %d skills' % c['keep'])
L.append('Every Proposal skill, every REDESIGN3 Maps 0-20 skill and ENG50\'s list (Paralysis Powder, Rend, Enfeeble, Vulnerable, Feeble, Weaken, Grant, Bulwark, Armourer) stay. Light flags stay: Flying, Tide, Diurnal, Nocturnal, Crepuscular. Field-like skills: Storm, Heat, Fog (rename pending), Rainrunner, Mountain Climber, Cast Darkness, Rainmaker, Moonpull and Field Breaker stay; Rain, Frost, Salt, Drought, Season and Relict go (above). The owner category sets stay whole where their cards are (GOD, EVO, KINGDOM, MAGIC, S, WEP, ECONSK1 resources). Also kept: %d parameters that live with their skill (the braces of the state and threshold skills, Hp / Res numbers, the Arrow riders except venom), %d internal presets.' % (c['parts'], c['presets']))
L.append('')
L.append('## Trigger and action lines')
pr = [p for p in d['pairs'] if p['verdict'] != 'keep']
for p in pr: L.append('- %s (%s): %s%s.' % (p['pair'], ', '.join(p['cards']) or 'no card', p['verdict'], (' into ' + nm(p['into'])) if p['into'] else '') + ' ' + p['why'] + '.')
L.append('- Actions: Missile into Deal damage (random), Buff All into Buff (who all), the Constrict action into Strangle (hold full), Venom Tick (retired) removed. Every other trigger and action stays; On Kill: Deliver, On Ready: Deal damage, On Spawn: Gain and a new On Spawn: Spawn take the cards above. The on-hit passives Silence, Stymie, Petrify and Stench go; their actions stay for trigger lines.')
L.append('')
L.append('## Phase 2 (after ENG50)')
L.append('Per merge or remove: the cards get their new effects and stats; the key leaves PASSIVE_DEFS / SKILL_DEFS, `canonical/skill-costs.json`, `canonical/skill-params.json`, the engine readers (an old-save alias where a save may hold it), the texts in 12 packs, SKILL_ICON and the Codex; each `test-skill-*` card is pointed at its survivor. New engine bits: Cull targets (weaker, wounded, frozen), Plunder\'s resource, Charge as a trigger, Hoard by Stone / Metal for the merged cards. The Maps 0-20 card moves move the road: balance-analyst runs the road check after phase 2.')
open(ROOT + 'docs/design/skaud1-2026-11-17.md', 'w').write('\n'.join(L) + '\n')
print(len(L), 'lines;', len(rows_cards), 'card rows;', len(rows_none), 'no-card rows; road', road)
