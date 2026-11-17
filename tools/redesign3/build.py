# REDESIGN3 (2026-11-17): writes the md, the json and the owner workbook from gen.js's out.json.
# python3 -I build.py <out.json> <repo docs/design dir>
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill

src, ddir = sys.argv[1:3]
d = json.load(open(src))
cards, focus, special, ups, mech, maps, counts = d['cards'], d['focus'], d['special'], d['upgraders'], d['mechanics'], d['maps'], d['counts']
BY = {c['id']: c for c in cards}
nm = lambda i: BY[i]['name'] if i in BY else i
stats = lambda c: '%s/%s' % (c['attack'], c['health'])
was = lambda c: '%s/%s' % (c['before']['attack'], c['before']['health'])
frm = lambda c: c['from'] if isinstance(c['from'], str) else 'Map %s' % c['from']
fname = lambda c: c['name'] + (' (O)' if c['owner'] else '')

def today(c):
    return c['skillsNow'] + ('' if not c['statsMoved'] else ' · ' + was(c))

def proposed(c):
    s = c['skillsProposed'] if c['skillsChanged'] else '='
    if c['statsMoved']:
        s += ' · ' + stats(c)
    if c['moved']:
        s += ' · from ' + frm(c)
    return s

ANSWERED = [
    'Helmet goes to Special, not a Map 16 card: Helmeted Otter (Otter faction pool) carries it. Map 16\'s New! focus is now **Reach** (Taiga Lynx, Upside-Down Bat); Cormorant (Map 3) drops Reach for Pounce so Reach stays New!.',
    'Meiosis (Planarian) and Bloom (Pond Algae) stay single carriers on Map 4.',
    'Lotus Frog has no Bloom: Nocturnal 1 + Pounce 1 (its flavour line, "opens like the flower", wants a new line).',
    'The five Special placements stand.',
    'No renames: Crocodile Ambusher and Frillneck Duelist keep their names. Chipmunk Skirmisher keeps Arrow and moves to Map 3 (OWN-1117-3).',
    'Peak Condor 2/6.',
    'Upgraders in the submaps: Venom Master (Cottonmouth Matriarch, The Sunken Grove), Pack Leader (Dhole Matriarch, The Canopy); Shellsmith and Conductor dropped.',
    'New Special **Armourer 1** on Anvilwhisker Otter (an otter smith), added to the Basalt Foundry (Map 19 submap, the old anvil). ENG50 builds it.',
    'ENG50 builds Paralysis Powder (stun for that turn), the new Rend, Enfeeble, Vulnerable / Feeble passives, Weaken action, Grant, Bulwark scaling and Armourer.',
    'OWN-1117-3 (23:41): Injured off Hedgerow Shrew (the only Maps 0-20 carrier); Hedgehog Scout comes onto Map 1 as the 2nd Thorns; Bee Warden is Map 1\'s 2nd Diurnal.',
]
QUESTIONS = [
    '**Map 16 focus:** Reach (a lynx takes grouse as they flush; a bat takes moths on the wing), or leave Sturdy alone on Map 16?',
    '**Armourer:** Anvilwhisker Otter\'s source says the 19-6 boss reward. On the Basalt Foundry list it becomes a pack card: keep it as the reward or put it on the list (not both)?',
    '**Fields:** take the proposals on the Fields sheet (Dusk Start on Map 4, Fog on Map 5, Rain on Map 7, Awash on Map 10, Thunderstorm moved from Map 10 to Map 11)?',
]

md = []
A = md.append
A('# REDESIGN3: Maps 0-20 on your 11-17 proposal (proposal, 2026-11-17)')
A('')
A('**v2 (owner 11-17 23:36)**, with OWN-1117-3 (23:41): your answers are in ("Your answers (v2)" below). New sheet "Fields".')
A('')
A('**A proposal only.** Nothing changes in `canonical/cards.json`, `canonical/map-pools.json`, `arena_app.js` or live data. Tick or comment in `docs/design/redesign3-2026-11-17.xlsx` (sheet "Per map"). Machine copy: `docs/design/redesign3-2026-11-17.json` (`fold`: each card\'s effects, Attack, Health and map). Generator: `tools/redesign3/`.')
A('')
A('- **Source:** your Proposal sheet (11-17 23:05): the red column is each map\'s focus, Special/Faction goes on submap or faction cards, More ideas where named. Ranks from its Skills sheet (II). OWN-1117-2 (23:14): Rend and Enfeeble are not featured; Sturdy and Mighty stay card passives.')
A('- **Rules checked by the generator:** a focus skill is New! on its map (no card of an earlier main list shows it at its list level) and has 2+ carriers there; no card shows a skill before its focus map; unranked skills are off the Maps 0-20 cards unless you named them; II 4-7 skills sit on one card. Light skills (Flying, Tide, Diurnal, Nocturnal) do not count toward two skills.')
A('- **Budget:** `tools/skill_costs.js` `budget(card).ok` at Level 1, obtain map from `canonical/card-obtain-maps.json` (a moved card: its new map). Stats move only when a card would be over; then the fewest 3A + H points, never below half. Paralysis Powder N is priced as Sleeping Powder N + 1 and Armourer N as Broodkeeper N until they have a price.')
A('- **Fold (FOLD6):** the .json `fold` list holds each changed card (id, whole new `effects`, attack, health, map); `lists` holds the `canonical/map-pools.json` adds and removes (main lists and submaps); `clearUnattainable` the cards that come onto a list; `foldHow` says how.')
A('')
A('## Result')
A('- Cards on Maps 0-20: %d today, %d proposed (6 come onto main lists: Lotus Frog and Electric Ray from no list, Glow-worm, Apollo Butterfly, Spitting Cobra and Hedgehog Scout from submaps).' % (counts['today'], counts['cards']))
A('- **%d cards change** (%d get new skills, %d move map, %d need a stat move to stay in budget; %d are owner cards); **%d unchanged**. All %d changed cards pass `budget().ok`. Plus %d submap / faction cards for the Special column.' % (counts['changed'], counts['skillsChanged'], counts['moved'], counts['statsMoved'], counts['ownerChanged'], counts['unchanged'], counts['changedOk'], counts['specialChanged']))
short = ', '.join('%s (Map %d)' % (x['name'], f['map']) for f in focus for x in f['skills'] if len(x['carriers']) < 2)
A('- **Focus:** %d of %d focus skills are New! on their map; %d have 2+ carriers (one carrier, as you allowed: %s). No rule violation left.' % (counts['focusNew'], counts['focusSkills'], counts['focusFelt'], short))
A('- **Not featured:** Enfeeble (Map 14) and Rend (Map 16), replaced by Exploit and Reach (Helmet went to Special).')
A('- **Pushed out of Maps 0-20 cards:** Natural Leader (The Gannet Queen), Venomous before Map 5 (Bee Sentry, Water Shrew, Platypus), Arrow before Map 3 (Chipmunk Skirmisher moves to Map 3 with it), Injured (Hedgerow Shrew, OWN-1117-3),Arrow (Flaming) now Map 19 and Fire Bolt Map 20 (Magma Salamander), every unranked skill you did not name (Quick, Rage, Shell, Thanatosis, Brood, Mountain Climber, Dry ...). Kept as named: Frostbite (Mountain Hare), Freeze (Glacier Yak), Acid (Caustic Scorpion), Lone Wolf (Taiga Lynx), Smoke Bomb (Smokescreen Raccoon), Carnage (Dust Hyena).')
A('- Card counts per map stay within 2 of today; rarity mix unchanged but where a moved card brings its rarity. Starters and Babies untouched; Worker Ant stays a Level 0 starter.')
A('')
A('## Your answers (v2)')
for x in ANSWERED:
    A('- ' + x)
A('')
A('## Questions for you')
for i, q in enumerate(QUESTIONS, 1):
    A('%d. %s' % (i, q))
A('')
A('## Per map')
A('Today / proposed: skills · Attack/Health (only when a stat moves) · where it came from (a move). **O** = owner-set card. "=" = skills unchanged.')
for f in focus:
    m = f['map']
    A('')
    A('### %d %s' % (m, f['name']))
    line = 'Focus: ' + ', '.join('%s (%s)' % (s['name'], ', '.join(nm(i) for i in s['carriers'])) for s in f['skills'])
    if f['special']:
        line += '. Special: ' + ', '.join(f['special'])
    if f['field']:
        line += '. Field: ' + f['field']
    A(line + '.')
    A('')
    rows = [c for c in cards if c['map'] == m and c['changed']]
    if not rows:
        A('No card changes.')
        continue
    A('| Card | today | proposed | why |')
    A('|---|---|---|---|')
    for c in rows:
        why = c['why'] + ((' ' + c['moveWhy']) if c['moved'] and not c['skillsChanged'] else '')
        A('| %s | %s | %s | %s |' % (fname(c), today(c), proposed(c), why.strip()))
A('')
A('## Special / Faction')
A('| Skill | Map | Card | where | today | proposed | why |')
A('|---|---|---|---|---|---|---|')
for s in special:
    for x in s['carriers']:
        st = '' if (x['attack'], x['health']) == (x['before']['attack'], x['before']['health']) else ' · %s/%s -> %s/%s' % (x['before']['attack'], x['before']['health'], x['attack'], x['health'])
        A('| %s | %d | %s | %s | %s | %s | %s |' % (s['name'], s['map'], x['name'], x['where'], x['skillsNow'], (x['skillsProposed'] if x['skillsProposed'] != x['skillsNow'] else '=') + st, x['why']))
A('')
A('## Upgraders')
A('Upgraders live in the submaps (owner 23:36). Shellsmith and Conductor are dropped.')
A('')
A('| Upgrader | family | built? | map | card | what it does |')
A('|---|---|---|---|---|---|')
for u in ups:
    A('| %s | %s | %s | %d | %s | %s |' % (u['name'], u['family'], 'yes' if u['exists'] else 'no (small)', u['map'], u['card'], u['spec']))
A('')
A('## Fields (major introductions, Maps 0-20)')
A('Your () items are field introductions; minor ones (poison-like) sit in the last column only. Fights are main-map fights (arena_app.js node rules and map-wide rules).')
A('')
A('| Map | your major field | engine | fights using it today | other major fields today | proposal | minor |')
A('|---|---|---|---|---|---|---|')
for f in d['fields']:
    A('| %d %s | %s | %s | %s | %s | %s | %s |' % (f['map'], f['name'], f['owner'] or '-', f['engine'] or '-', f['fights'] or '-', f['today'] or '-', f['propose'] or '-', f['minor'] or '-'))
A('')
A('## Mechanics the proposal needs')
A('Being built (ENG50) or missing:')
for x in mech:
    if 'being built' in x['state'] or x['state'] in ('missing', 'partly built'):
        A('- **%s** (%s): %s' % (x['name'], x['state'], x['spec']))
A('')
A('Built already: ' + ', '.join(x['name'] + (' (' + x['spec'] + ')' if x['spec'] else '') for x in mech if x['state'].startswith('built')) + '.')
A('')
open(ddir + '/redesign3-2026-11-17.md', 'w').write('\n'.join(md))

# machine copy: the whole check + the fold list
fold = [{'id': c['id'], 'map': c['map'], 'from': c['from'], 'effects': c['effects'], 'attack': c['attack'], 'health': c['health']} for c in cards if c['changed']]
fold += [{'id': x['id'], 'where': x['where'], 'add': x.get('add'), 'effects': x['effects'], 'attack': x['attack'], 'health': x['health']} for s in special for x in s['carriers'] if x['changed']]
out = dict(d)
out['fold'] = fold
out['questions'] = QUESTIONS
out['answered'] = ANSWERED
out['version'] = 'v2 (owner 11-17 23:36; OWN-1117-3 23:41)'
out['foldHow'] = 'fold[]: replace the card effects with effects (whole object) and set attack and health; map = its first Maps 0-20 main list once lists[] is applied. lists[]: op add or remove of id on canonical/map-pools.json maps[map].cards, or maps[map].submaps[sub] when sub is set. clearUnattainable[]: drop unattainable on these ids. Special and faction carriers: fold entries with where (no map). New effect keys: armourer and paralysisPowder (as ENG50 names them).'
json.dump(out, open(ddir + '/redesign3-2026-11-17.json', 'w'), indent=1, ensure_ascii=False)

# workbook
import os
from openpyxl import load_workbook
OLD = {}  # the owner's Tick / Comment from the previous workbook, keyed by sheet + first three cells
if os.path.exists(ddir + '/redesign3-2026-11-17.xlsx'):
    for ws0 in load_workbook(ddir + '/redesign3-2026-11-17.xlsx'):
        hd = [c.value for c in ws0[1]]
        if 'Tick' in hd:
            ti, ci = hd.index('Tick'), hd.index('Comment')
            for r in ws0.iter_rows(min_row=2, values_only=True):
                if r[ti] or r[ci]:
                    OLD[(ws0.title,) + tuple(r[:3])] = (r[ti], r[ci])
wb = Workbook()
H = Font(bold=True, color='FFFFFF'); HF = PatternFill('solid', fgColor='7A2E2E'); WR = Alignment(wrap_text=True, vertical='top')
def sheet(title, head, rows, widths, first=False):
    ws = wb.active if first else wb.create_sheet()
    ws.title = title
    ws.append(head)
    for c in ws[1]:
        c.font = H; c.fill = HF
    for r in rows:
        if 'Tick' in head and (title,) + tuple(r[:3]) in OLD:
            r = list(r); r[head.index('Tick')], r[head.index('Comment')] = OLD[(title,) + tuple(r[:3])]
        ws.append(r)
    for i, w in enumerate(widths):
        ws.column_dimensions[chr(65 + i)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = WR
    ws.freeze_panes = 'A2'
    return ws
summ = [['Package', 'REDESIGN3 v2 (owner 11-17 23:36; OWN-1117-3 23:41): a proposal on your Proposal sheet (11-17 23:05) and OWN-1117-2 (23:14). Nothing is applied.'],
        ['Cards on Maps 0-20', '%d today, %d proposed' % (counts['today'], counts['cards'])],
        ['Changed', '%d (%d new skills, %d moved, %d stat moves, %d owner cards); unchanged %d' % (counts['changed'], counts['skillsChanged'], counts['moved'], counts['statsMoved'], counts['ownerChanged'], counts['unchanged'])],
        ['Budget', 'all %d changed cards pass budget().ok (Level 1)' % counts['changedOk']],
        ['Focus', '%d/%d New! on their map; %d with 2+ carriers' % (counts['focusNew'], counts['focusSkills'], counts['focusFelt'])],
        ['Not featured', 'Enfeeble (Map 14) -> Exploit; Rend (Map 16) -> Reach (Helmet went to Special)'],
        ['', '']]
summ += [['Map %d %s' % (f['map'], f['name']), '; '.join('%s: %s%s' % (s['name'], ', '.join(nm(i) for i in s['carriers']), '' if s['isNew'] else ' (NOT NEW)') for s in f['skills'])] for f in focus]
summ += [['', '']] + [['Answered (v2)', a.replace('**', '')] for a in ANSWERED]
summ += [['', '']] + [['Question %d' % i, q.replace('**', '')] for i, q in enumerate(QUESTIONS, 1)]
sheet('Summary', ['Item', 'Value'], summ, [26, 140], first=True)
pm = [[c['map'], c['mapName'], c['name'], 'O' if c['owner'] else '', c['rarity'], 'move' if c['moved'] and not c['skillsChanged'] else ('skills' if c['skillsChanged'] else 'stats'), today(c), proposed(c), (c['why'] + (' ' + c['moveWhy'] if c['moved'] and not c['skillsChanged'] else '')).strip(), '', ''] for c in cards if c['changed']]
pm += [[s['map'], 'Special: ' + x['where'], x['name'], '', x['rarity'], 'special', x['skillsNow'], x['skillsProposed'] if x['skillsProposed'] != x['skillsNow'] else '=', x['why'], '', ''] for s in special for x in s['carriers']]
sheet('Per map', ['Map', 'Map name / where', 'Card', 'Owner', 'Rarity', 'Change', 'Today', 'Proposed', 'Why', 'Tick', 'Comment'], pm, [5, 24, 24, 6, 10, 8, 36, 40, 60, 6, 30])
mv = [[c['name'], frm(c), 'Map %d %s' % (c['map'], c['mapName']), c['skillsProposed'] if c['skillsChanged'] else '=', c['moveWhy'], '', ''] for c in cards if c['moved']]
sheet('Moves', ['Card', 'From', 'To', 'Skills there', 'Why', 'Tick', 'Comment'], mv, [24, 10, 28, 36, 70, 6, 30])
sheet('Upgraders', ['Upgrader', 'Family', 'Built?', 'Map', 'Card', 'What it does', 'Tick', 'Comment'], [[u['name'], u['family'], 'yes' if u['exists'] else 'no (small)', u['map'], u['card'], u['spec'], '', ''] for u in ups], [26, 22, 10, 5, 24, 80, 6, 30])
sheet('Fields', ['Map', 'Map name', 'Your major field ()', 'Engine', 'Fights using it today', 'Other major fields today', 'Proposal', 'Minor (today)', 'Tick', 'Comment'], [[f['map'], f['name'], f['owner'], f['engine'], f['fights'], f['today'], f['propose'], f['minor'], '', ''] for f in d['fields']], [5, 22, 22, 36, 36, 40, 50, 30, 6, 30])
sheet('Missing mechanics', ['Mechanic', 'State', 'Spec'], [[x['name'], x['state'], x['spec'] or ''] for x in mech], [30, 40, 100])
bc = [[c['map'], c['name'], c['rarity'], c['wait'], c['cost'], c['obtainMap'], was(c), stats(c), c['before']['fill'], c['fill'], 'yes' if c['ok'] else 'NO', 'changed' if c['changed'] else '', '; '.join(c['flags'])] for c in cards]
bc += [['S%d' % s['map'], x['name'], x['rarity'], '', '', '', '%s/%s' % (x['before']['attack'], x['before']['health']), '%s/%s' % (x['attack'], x['health']), '', x['fill'], 'yes' if x['ok'] else 'NO', 'special' + (' changed' if x['changed'] else ''), ''] for s in special for x in s['carriers']]
sheet('Budget checks', ['Map', 'Card', 'Rarity', 'Wait', 'Lumber', 'Obtain map', 'A/H today', 'A/H proposed', 'Fill % today', 'Fill % proposed', 'ok', 'Change', 'Flags'], bc, [5, 24, 10, 6, 7, 9, 10, 12, 10, 12, 6, 14, 40])
wb.save(ddir + '/redesign3-2026-11-17.xlsx')
print(len(md), len(fold), len(pm))
