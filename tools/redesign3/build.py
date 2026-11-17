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

QUESTIONS = [
    '**Replacement focus (OWN-1117-2):** Map 14 gets **Exploit** (II 3) for Enfeeble: Savanna Cheetah and Stoat Cutthroat. Map 16 gets **Helmet** (II 2) for Rend: Boreal Elk and Pinecone Sapper. Keep, or name others?',
    '**Meiosis on Map 4 has one carrier** (Planarian). Pond Algae cannot carry Bloom + Meiosis inside the budget (S 7.2 on a 1/8 card). Accept one, or Pond Algae swaps Bloom for Meiosis (Lotus Frog then the one Bloom)?',
    '**Five Special skills have no submap to sit on** (Maps 3, 4, 12, 13, 15): Fencing on Swordbill Challenger and Trident on Otter Angler (factions), Octolash on Octopus Tactician (Smugglers\' Grotto, Map 2), Dynamite on Mouse Sapper (main), Carnage stays on Dust Hyena (Map 14), Fortify on Shellwright Apprentice (Base). Accept, or add submaps there?',
    '**Names that lose their skill:** Crocodile Ambusher (Ambush moves to Map 15: Constrict + Bleed), Frillneck Duelist (Fencing goes to the faction), Chipmunk Skirmisher (Arrow moves to Map 3). Rename them?',
    '**Peak Condor (owner card)** sits at 146% today. Reload off and Puncture 2 -> 1 still need 4/10 -> 2/6. Accept, or keep 4/10 as an exception?',
    '**Upgraders:** add Venom Master (Cottonmouth Matriarch, The Sunken Grove) and Pack Leader (Dhole Matriarch, The Canopy), both built; build Conductor and Shellsmith (small)?',
]

md = []
A = md.append
A('# REDESIGN3: Maps 0-20 on your 11-17 proposal (proposal, 2026-11-17)')
A('')
A('**A proposal only.** Nothing changes in `canonical/cards.json`, `canonical/map-pools.json`, `arena_app.js` or live data. Tick or comment in `docs/design/redesign3-2026-11-17.xlsx` (sheet "Per map"). Machine copy: `docs/design/redesign3-2026-11-17.json` (`fold`: each card\'s effects, Attack, Health and map). Generator: `tools/redesign3/`.')
A('')
A('- **Source:** your Proposal sheet (11-17 23:05): the red column is each map\'s focus, Special/Faction goes on submap or faction cards, More ideas where named. Ranks from its Skills sheet (II). OWN-1117-2 (23:14): Rend and Enfeeble are not featured; Sturdy and Mighty stay card passives.')
A('- **Rules checked by the generator:** a focus skill is New! on its map (no card of an earlier main list shows it at its list level) and has 2+ carriers there; no card shows a skill before its focus map; unranked skills are off the Maps 0-20 cards unless you named them; II 4-7 skills sit on one card. Light skills (Flying, Tide, Diurnal, Nocturnal) do not count toward two skills.')
A('- **Budget:** `tools/skill_costs.js` `budget(card).ok` at Level 1, obtain map from `canonical/card-obtain-maps.json` (a moved card: its new map). Stats move only when a card would be over; then the fewest 3A + H points, never below half. Paralysis Powder N is priced as Sleeping Powder N + 1 until it has a price.')
A('')
A('## Result')
A('- Cards on Maps 0-20: %d today, %d proposed (5 come onto main lists: Lotus Frog and Electric Ray from no list, Glow-worm, Apollo Butterfly and Spitting Cobra from submaps).' % (counts['today'], counts['cards']))
A('- **%d cards change** (%d get new skills, %d move map, %d need a stat move to stay in budget; %d are owner cards); **%d unchanged**. All %d changed cards pass `budget().ok`. Plus %d submap / faction cards for the Special column.' % (counts['changed'], counts['skillsChanged'], counts['moved'], counts['statsMoved'], counts['ownerChanged'], counts['unchanged'], counts['changedOk'], counts['specialChanged']))
A('- **Focus:** %d of %d focus skills are New! on their map; %d have 2+ carriers (the one short: Meiosis on Map 4, question 2). No rule violation left.' % (counts['focusNew'], counts['focusSkills'], counts['focusFelt']))
A('- **Not featured:** Enfeeble (Map 14) and Rend (Map 16), replaced by Exploit and Helmet (question 1).')
A('- **Pushed out of Maps 0-20 cards:** Natural Leader (The Gannet Queen), Venomous before Map 5 (Bee Sentry, Water Shrew, Platypus), Arrow before Map 3 (Chipmunk Skirmisher), Arrow (Flaming) now Map 19 and Fire Bolt Map 20 (Magma Salamander), every unranked skill you did not name (Quick, Rage, Shell, Thanatosis, Brood, Mountain Climber, Dry ...). Kept as named: Frostbite (Mountain Hare), Freeze (Glacier Yak), Acid (Caustic Scorpion), Lone Wolf (Taiga Lynx), Smoke Bomb (Smokescreen Raccoon), Carnage (Dust Hyena).')
A('- Card counts per map stay within 2 of today; rarity mix unchanged but where a moved card brings its rarity. Starters and Babies untouched; Worker Ant stays a Level 0 starter.')
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
A('Broodmother and Fletcher are placed. At most four more:')
A('')
A('| Upgrader | family | built? | map | card | what it does |')
A('|---|---|---|---|---|---|')
for u in ups:
    A('| %s | %s | %s | %d | %s | %s |' % (u['name'], u['family'], 'yes' if u['exists'] else 'no (small)', u['map'], u['card'], u['spec']))
A('')
A('## Mechanics the proposal needs')
A('Missing (not built):')
for x in mech:
    if x['state'] in ('missing', 'partly built'):
        A('- **%s** (%s): %s' % (x['name'], x['state'], x['spec']))
A('')
A('Not featured: ' + '; '.join('**%s**: %s' % (x['name'], x['spec']) for x in mech if x['state'].startswith('not featured')) + '.')
A('')
A('Built already: ' + ', '.join(x['name'] + (' (' + x['spec'] + ')' if x['spec'] else '') for x in mech if x['state'].startswith('built')) + '.')
A('')
open(ddir + '/redesign3-2026-11-17.md', 'w').write('\n'.join(md))

# machine copy: the whole check + the fold list
fold = [{'id': c['id'], 'map': c['map'], 'from': c['from'], 'effects': c['effects'], 'attack': c['attack'], 'health': c['health']} for c in cards if c['changed']]
fold += [{'id': x['id'], 'where': x['where'], 'effects': x['effects'], 'attack': x['attack'], 'health': x['health']} for s in special for x in s['carriers'] if x['changed']]
out = dict(d)
out['fold'] = fold
out['questions'] = QUESTIONS
json.dump(out, open(ddir + '/redesign3-2026-11-17.json', 'w'), indent=1, ensure_ascii=False)

# workbook
wb = Workbook()
H = Font(bold=True, color='FFFFFF'); HF = PatternFill('solid', fgColor='7A2E2E'); WR = Alignment(wrap_text=True, vertical='top')
def sheet(title, head, rows, widths, first=False):
    ws = wb.active if first else wb.create_sheet()
    ws.title = title
    ws.append(head)
    for c in ws[1]:
        c.font = H; c.fill = HF
    for r in rows:
        ws.append(r)
    for i, w in enumerate(widths):
        ws.column_dimensions[chr(65 + i)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = WR
    ws.freeze_panes = 'A2'
    return ws
summ = [['Package', 'REDESIGN3 (2026-11-17): a proposal on your Proposal sheet (11-17 23:05) and OWN-1117-2 (23:14). Nothing is applied.'],
        ['Cards on Maps 0-20', '%d today, %d proposed' % (counts['today'], counts['cards'])],
        ['Changed', '%d (%d new skills, %d moved, %d stat moves, %d owner cards); unchanged %d' % (counts['changed'], counts['skillsChanged'], counts['moved'], counts['statsMoved'], counts['ownerChanged'], counts['unchanged'])],
        ['Budget', 'all %d changed cards pass budget().ok (Level 1)' % counts['changedOk']],
        ['Focus', '%d/%d New! on their map; %d with 2+ carriers' % (counts['focusNew'], counts['focusSkills'], counts['focusFelt'])],
        ['Not featured', 'Enfeeble (Map 14) -> Exploit; Rend (Map 16) -> Helmet'],
        ['', '']]
summ += [['Map %d %s' % (f['map'], f['name']), '; '.join('%s: %s%s' % (s['name'], ', '.join(nm(i) for i in s['carriers']), '' if s['isNew'] else ' (NOT NEW)') for s in f['skills'])] for f in focus]
summ += [['', '']] + [['Question %d' % i, q.replace('**', '')] for i, q in enumerate(QUESTIONS, 1)]
sheet('Summary', ['Item', 'Value'], summ, [26, 140], first=True)
pm = [[c['map'], c['mapName'], c['name'], 'O' if c['owner'] else '', c['rarity'], 'move' if c['moved'] and not c['skillsChanged'] else ('skills' if c['skillsChanged'] else 'stats'), today(c), proposed(c), (c['why'] + (' ' + c['moveWhy'] if c['moved'] and not c['skillsChanged'] else '')).strip(), '', ''] for c in cards if c['changed']]
pm += [[s['map'], 'Special: ' + x['where'], x['name'], '', x['rarity'], 'special', x['skillsNow'], x['skillsProposed'] if x['skillsProposed'] != x['skillsNow'] else '=', x['why'], '', ''] for s in special for x in s['carriers']]
sheet('Per map', ['Map', 'Map name / where', 'Card', 'Owner', 'Rarity', 'Change', 'Today', 'Proposed', 'Why', 'Tick', 'Comment'], pm, [5, 24, 24, 6, 10, 8, 36, 40, 60, 6, 30])
mv = [[c['name'], frm(c), 'Map %d %s' % (c['map'], c['mapName']), c['skillsProposed'] if c['skillsChanged'] else '=', c['moveWhy'], '', ''] for c in cards if c['moved']]
sheet('Moves', ['Card', 'From', 'To', 'Skills there', 'Why', 'Tick', 'Comment'], mv, [24, 10, 28, 36, 70, 6, 30])
sheet('Upgraders', ['Upgrader', 'Family', 'Built?', 'Map', 'Card', 'What it does', 'Tick', 'Comment'], [[u['name'], u['family'], 'yes' if u['exists'] else 'no (small)', u['map'], u['card'], u['spec'], '', ''] for u in ups], [26, 22, 10, 5, 24, 80, 6, 30])
sheet('Missing mechanics', ['Mechanic', 'State', 'Spec (missing ones)'], [[x['name'], x['state'], x['spec'] or ''] for x in mech], [30, 40, 100])
bc = [[c['map'], c['name'], c['rarity'], c['wait'], c['cost'], c['obtainMap'], was(c), stats(c), c['before']['fill'], c['fill'], 'yes' if c['ok'] else 'NO', 'changed' if c['changed'] else '', '; '.join(c['flags'])] for c in cards]
bc += [['S%d' % s['map'], x['name'], x['rarity'], '', '', '', '%s/%s' % (x['before']['attack'], x['before']['health']), '%s/%s' % (x['attack'], x['health']), '', x['fill'], 'yes' if x['ok'] else 'NO', 'special' + (' changed' if x['changed'] else ''), ''] for s in special for x in s['carriers']]
sheet('Budget checks', ['Map', 'Card', 'Rarity', 'Wait', 'Lumber', 'Obtain map', 'A/H today', 'A/H proposed', 'Fill % today', 'Fill % proposed', 'ok', 'Change', 'Flags'], bc, [5, 24, 10, 6, 7, 9, 10, 12, 10, 12, 6, 14, 40])
wb.save(ddir + '/redesign3-2026-11-17.xlsx')
print(len(md), len(fold), len(pm))
