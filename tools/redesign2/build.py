# REDESIGN2 (2026-11-16): writes the md, the final json and the owner workbook from gen.js's out.json.
# python3 -I build.py <out.json> <repo docs/design dir> <workbook path>
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill

src, ddir, wbpath = sys.argv[1:4]
d = json.load(open(src))
cards, basics, singles, moved, plan, counts = d['cards'], d['basics'], d['singles'], d['movedOff'], d['plan'], d['counts']
MAPN = {p['map']: p['name'] for p in plan}
BYID = {c['id']: c for c in cards}
nm = lambda i: BYID[i]['name'] if i in BYID else i

GAPS = [
    # threat, where, answers (first map), verdict, filler
    ('Fliers', 'Map 0 bees; Map 3 (75 Flying copies in its decks); Map 11 (64); gales on 3, 11, 18-20', 'Flying (0), Arrow (1), Twin Shot (11); Reach single (Cormorant, 3)', 'covered', ''),
    ('Armor', 'from Map 2 (crabs); Map 5 (22 copies), 9 (30), 10 (24), 19 (26)', 'Pierce (2), Poison Barbs (2), Bleed (5), Corrode (7); Bludgeon, Pulverise singles', 'covered', ''),
    ('Shield', 'Maps 3, 4, 18', 'Twin Strike (5), Arrow (1), Bleed (5)', 'covered', ''),
    ('Swarms and tokens', 'Swarm on Maps 0, 5, 7; Bloom / Meiosis / maggots on 4, 7', 'Thorns (1), Cleave (3), Ambush (6), Twin Shot (11), Trap (18)', 'covered', ''),
    ('Invisible', 'Booming Bittern (Map 6), Ringed Seal (Map 17, 19 copies)', 'Expose single (Arctic Tern, 17); both carriers lose Invisible in this plan (unranked)', 'covered after the redesign', ''),
    ('Stealth units', 'Map 13 (14 copies); Tall Grass on Map 15 (Stealth strikes first)', 'Rebuild (4) mends the bramble; Pounce (3), Ambush (6), Arrow (1) kill them first', 'covered', ''),
    ('Darkness', 'Map 8: 7 fights dark, 1 pitch black; Map 6 night', 'Nocturnal (1), Illuminate (7), Darksight (8), Keen Sense (12)', 'covered', ''),
    ('Blind', '18-4 blinding sandstorm; Smoke Bomb on Map 19 (17 copies); Horned Lizard on 18', 'Keen Sense (12): no II 1 skill resists Blind', 'gap filled by an II 2 basic', 'Keen Sense (II 2) added to the basics'),
    ('Sleep', 'Spore Cloud on every Map 7 fight; Nightshade Moth (17)', 'none resists it; a hit wakes the unit, and the cloud takes one unit a side a round', 'minor (not a real gap)', 'Wakeful (unranked) if you want one'),
    ('Frost', 'Frigid field Maps 16-17; freezing / frostbite rules on four Map 17 fights; Freeze cards on 17', 'cold resistance is card data: Krill Swarm (10), Woodland Caribou (16), the Map 17 animals; Sturdy (16). Glacier Yak and Walrus lose Freeze (unranked)', 'covered (card data, not a skill)', ''),
    ('Heat', 'Scorching on two Map 14 fights, Maps 19-20; wildfire', 'both sides burn; Regeneration (5), Nursing (0), Shield (4)', 'covered', ''),
    ('Field hazards', 'Landslide (8), Tangled Roots (9), Grasping Briars (12), Quicksand (18)', 'Flying (0) sits above all four; Shield / Health against Quicksand', 'covered', ''),
    ('Tide', 'Maps 2, 4, 9, 10 (Perma-tide on 4 and 10)', 'Tide (2)', 'covered', ''),
    ('Healing foes', 'bramble regen on most fights of Maps 2, 6, 17; Regeneration and Herbalist decks', 'burst: Twin Strike (5), Bleed (5), Mighty (14); bramble: Siege (12), Puncture single (3)', 'covered', ''),
    ('Poison', 'Swamp Fever (every unit, Maps 5-6); Poison Barbs; Venomous foes until their cards change', 'Cure (5)', 'covered (one Cure card)', 'a second Cure carrier (question 7)'),
    ('Bramble pressure', 'Siege decks on Map 12 (20 copies), Puncture, Stealth', 'Rebuild (4); Repair single (6)', 'covered', ''),
    ('Lumber', 'no free income; Lumber-cost cards from Map 1', 'Delivery single (Beaver Lumberjack, 2); triggers that deliver Lumber: Driftwood Crab and Gull Thief (2), Gannet Nestweaver (3), Beaver Feller (13), Dust Hyena (14), Cone-cutter Squirrel (16); Windfall on 3, 11, 18-20', 'covered (thinner: 4 Delivery cards lose it, Delivery is II 5)', ''),
    ('Stone', 'Phoenix Mushrooms (Map 7) costs 1 Stone', 'first Stone maker: Stonecutter on Quarry Mole (8, this plan); Pearl (Giant Clam, 10); Pumice Beetle (20)', 'REAL GAP: Map 7 has no Stone source', 'Stonecutter (II 5) on a Map 4-7 card, or Phoenix Mushrooms pays Lumber (question 2)'),
    ('Grace', 'no Maps 0-20 card costs Grace', '-', 'n/a', ''),
    ('Leaders', 'enemy leaders from Map 1, elites and bosses lead', 'killed like any unit; your own: Natural Leader (Tutorial; Gannet Queen 11, Elderhorn Monarch 15), Herald single (14), Loyal single (15)', 'covered', ''),
    ('Rain (for Rainrunner)', 'no main map of 0-20 has rain', 'Rainrunner (Puddle Skimmer, Map 1) never fires on the road', 'REAL GAP for that skill', 'a rain field on a main map, or Rainrunner off Maps 0-20 (question 5)'),
]
NOTES = [
    ('Pillage', 'New. No key in the engine, the prices or the texts (`pillage` appears nowhere). Build it from Pickpocket\'s resource half: the engine already takes resources off the opposing bramble (`sk2TakeRes`, used by Pickpocket and Sabotage). A small engine package: key, price, text, 12 language packs. Proposed home: Gull Thief (owner card) in place of its "On Hit: Deliver 1 Lumber", once built.'),
    ('Rainrunner', 'Exists (key `rainrunner`, bramblewood-engine.js: +N/+N and unblockable in a rain field). On Puddle Skimmer (owner card). No main map of 0-20 has rain, so on the road it never fires.'),
    ('Pickpocket', 'Exists (key `pickpocket`, ENG28). Today a landed hit takes N of the unit\'s tokens (Berries, prayer tokens, Scavenge / Salvage points, Creativity) and, where the tokens fall short or it hits the bramble, the opponent\'s resources. Your note "steals items only": proposed Pickpocket keeps the token theft only and the resource part becomes Pillage. Open: do "items" include equipment? (question 3)'),
    ('Broodkeeper', 'Exists (key `broodkeeper`; on no card). Name candidates: **Nurture**, **Hatchery**, **Rearing** (question 4). Proposed home: Wolf Spider Mother (Map 7, where Bloom, Meiosis and the Carcass maggots make units).'),
]
VEN = [nm(i) for m in moved if m['key'] == 'poison' for i in m['from']]
QUESTIONS = [
    '**Venomous has no II rank**, so this plan moves it off its ' + str(len(VEN)) + ' Maps 0-20 cards (' + ', '.join(VEN) + '). Cure (II 1) is then left with Poison Barbs and Swamp Fever as the venom on the road. Rank Venomous II 1 (they keep it), or keep it off?',
    '**Stone on Map 7:** Phoenix Mushrooms costs 1 Stone, and the first Stone maker is Quarry Mole (Stonecutter, Map 8). Accept one map late, or switch its Stone cost to Lumber?',
    '**Pickpocket, "items only":** items = the tokens a unit carries (Berries, prayer tokens), or equipment as well? Its resource theft becomes Pillage (to build).',
    '**Broodkeeper\'s name:** Nurture, Hatchery or Rearing?',
    '**Rainrunner** never fires on Maps 0-20 (no rain there). Give a main map a rain field (Thistlewood or Sunken Hollow), or take it off Puddle Skimmer (Evasive, as REDESIGN1)?',
    '**Map 1 is busy:** Guardian, Foraging, Inspiring and Thorns are new there, and Chipmunk Skirmisher (owner card) also brings Arrow, so 5 new skills (plus light Diurnal and Nocturnal). Keep Arrow on it, or hold Arrow to Map 3?',
    '**Thin basics:** Constrict (Constrictor Coil) and Cure (Marsh-mallow Hare) have one carrier each on these lists. Add a second from a side map, or accept one?',
    '**20 owner cards sit outside the band** with their skills unchanged (Bee Warden 36.8%, Earthworm 48.6%, Duckling 56.7%, Pincushion Urchin 58%, Worker Ant 123.7%, Alley Cat 123.2% ...): left as they are.',
]

def fx(c, key):
    return c['skillsNow'] if key == 'now' else (c['skillsProposed'] if c['skillsProposed'] != '=' else '=')

md = []
A = md.append
A('# REDESIGN2: Maps 0-20 cards on your new skill list (proposal, 2026-11-16)')
A('')
A('**A proposal only.** Nothing changes in `canonical/cards.json`, `arena_app.js` or live data. Tick or edit it in `/home/claude/out/Redesign2 - Bramblewood.xlsx` (Change? column). The machine copy is `docs/design/redesign2-2026-11-16.json` (effects, Attack, Health, Wait of each card, ready for a fold tool; `MAP_FOCUS` per map). **It supersedes REDESIGN1.**')
A('')
A('- **Source:** your workbook `G6 - Bramblewood_2.xlsx`, sheet Skills, column II (owner 11-16 20:43), and your 20:48 call: "stick to 50+". The basics are all 45 II 1 skills plus the 6 II 2 skills that add the most (a coverage gap first, then the best fit). The other II 2-3 skills and all of II 4-7 sit on **one card each** on a fitting map, or move off Maps 0-20 when no card fits. Every unranked or category skill (S, GOD, MAGIC, EVO, KINGDOM, WEP, R) leaves the Maps 0-20 cards.')
A('- **Kept although not on the list:** trigger x action pairs (On Hit / On Spawn / On Kill: Deliver Lumber, On Ready shields, the Carcass\'s On Death spawn), the drawbacks Injured (Hedgerow Shrew) and Purblind (Star-nosed Mole), and Bounty (Pack Mule, BAL2-4). They are not skills of the list.')
A('- **Cards:** each main map\'s MAP list (`canonical/map-pools.json`); a card is designed on the first map whose list holds it: 205 cards. No card changes map, rarity or name.')
A('- **Budget:** `bramblewood-budget.js` through `tools/skill_costs.js` `budget()` at Level 1. Fill = the larger of cap 1 (x1/N) and cap 2 (x2/N2); band 85-100%. A card whose skills change, or which sits outside the band, gets the closest legal stats: fewest 3A + H points moved, then the least Attack moved; never below half its Attack or Health; a 0-Attack card stays 0.')
A('- **Owner-set cards** (`tools/pipeline/config.json` refit.ownerCards): skills change only where the list requires it; stats only when the skills do. Marked **O**.')
A('- **Light skills** (Flying, Tide, Diurnal, Nocturnal) count toward the 51 but not toward a card\'s two skills.')
A('')
A('## The result')
A(f"- Cards: {counts['cards']}. {counts['changed']} change: {counts['skillsChanged']} get new skills, {counts['statsOnly']} only have stats moved into the band. {counts['ownerChanged']} of the changed cards are owner-set.")
A(f"- Budget band: **{counts['inBandAfter']}/{counts['cards']}** cards at 85-100% after the change ({counts['inBandBefore']} before). The {counts['cards'] - counts['inBandAfter']} outside are owner cards whose skills did not change (question 8).")
A(f"- **Basics: {counts['basics']} skills** ({counts['basicsII1']} II 1 + {counts['basicsII2']} II 2: Keen Sense, Illuminate, Electricity, Stampede, Stealth, Momentum), {counts['light']} of them light. Every basic has 2 or more carriers but Constrict and Cure (one each).")
A(f"- **Single-card skills:** {counts['singlesPlaced']} placed on one card each (II 2-7); {counts['singlesOff']} move off Maps 0-20 (no fitting card).")
A('- **Real gaps** (coverage check below): Stone on Map 7 (Phoenix Mushrooms), and Rain for Rainrunner. Blind was the other one; Keen Sense (II 2) fills it.')
A('')
A('## Owner questions')
for i, q in enumerate(QUESTIONS, 1): A(f'{i}. {q}')
A('')
A('## Skills per map')
A('| Map | New basics (II) | Single-card skills | MAP_FOCUS |')
A('|---|---|---|---|')
BK = {b['key']: b for b in basics}
SK = {s['key']: s for s in singles}
for p in plan:
    nb = ', '.join(f"{BK[k]['name']} ({BK[k]['ii']}{', light' if BK[k]['light'] else ''})" for k in p['newBasics']) or 'none'
    sg = ', '.join(f"{SK[k]['name']} ({SK[k]['ii']}: {SK[k]['carrierName']})" for k in p['singles']) or '-'
    A(f"| {p['map']} {p['name']} | {nb} | {sg} | {', '.join(d['MAP_FOCUS'][str(p['map'])]) or '-'} |")
A('')
A('MAP_FOCUS = the 0-3 new non-light basics of the map, highest II first (ties: more carriers). Map 20, the end of the road, brings no new basic: its fights use what the road taught.')
A('')
A('## Basics: carriers')
A('| Skill | II | First map | Carriers (map) | Why (II 2) |')
A('|---|---|---|---|---|')
for b in basics:
    A(f"| {b['name']} | {b['ii']} | {b['map']} | {', '.join(c['name'] + ' (' + str(c['map']) + ')' for c in b['carriers'])} | {b['why']} |")
A('')
A('## Single-card skills (II 2-7)')
A('| Skill | II | Carrier (map) | Why |')
A('|---|---|---|---|')
for s in singles:
    A(f"| {s['name']} | {s['ii']} | {s['carrierName']}{' (' + str(s['map']) + ')' if s['map'] is not None else ''} | {s['why']} |")
A('')
A('## Coverage check: can the player answer the road?')
A('Every Maps 0-20 fight was read (151 fights: decks, fight rules, map fields, bramble passives, leaders; `B.G.fightRules`, `B.G.skirmishCastle`), and each threat matched to a basic the player can hold by then (the number is the map where it first comes).')
A('')
A('| Threat | Where | Answer (first map) | Verdict | Filler |')
A('|---|---|---|---|---|')
for g in GAPS: A('| ' + ' | '.join(g) + ' |')
A('')
A('### Pillage, Rainrunner, Pickpocket, Broodkeeper')
for n, t in NOTES: A(f'- **{n}:** {t}')
A('')
A('## Moved off Maps 0-20 cards')
A('| Skill | Rank | From | Why |')
A('|---|---|---|---|')
for m in moved:
    A(f"| {m['name']} | {m['rank']} | {', '.join(nm(i) + ' (' + str(BYID[i]['map']) + ')' for i in m['from'])} | {m['why']} |")
A('')
A('## Per map')
A('Columns: card (rarity, Wait / Lumber), skills now, proposed skills, ATK/HP now to proposed, fill at Level 1 now to proposed, why. "=" means no change. **O** marks an owner-set card.')
for p in plan:
    cs = [c for c in cards if c['map'] == p['map']]
    nb = ', '.join(BK[k]['name'] for k in p['newBasics']) or 'none'
    A('')
    A(f"### Map {p['map']}: {p['name']} ({len(cs)} new cards; new basics: {nb})")
    A('| Card | Now | Proposed | ATK/HP | Fill | Why |')
    A('|---|---|---|---|---|---|')
    for c in cs:
        b = c['before']
        st = f"{b['attack']}/{b['health']}" + (f" → {c['attack']}/{c['health']}" if (c['attack'], c['health']) != (b['attack'], b['health']) else '')
        fl = f"{b['fill']}%" if b['fill'] == c['fill'] else f"{b['fill']} → {c['fill']}%"
        why = c['note'] or ('; '.join(c['flags']) if c['flags'] else '-')
        if c['note'] and c['flags']: why += ' (' + '; '.join(c['flags']) + ')'
        A(f"| {'**O** ' if c['owner'] else ''}{c['name']} ({c['rarity']}, W{c['wait']}/L{c['cost']}) | {c['skillsNow']} | {c['skillsProposed']} | {st} | {fl} | {why} |")
open(ddir + '/redesign2-2026-11-16.md', 'w').write('\n'.join(md) + '\n')

# final json
d['gaps'] = [dict(zip(['threat', 'where', 'answer', 'verdict', 'fill'], g)) for g in GAPS]
d['notes'] = {n: t for n, t in NOTES}
d['questions'] = QUESTIONS
d['MAP_FOCUS'] = {str(k): v for k, v in d['MAP_FOCUS'].items()}
d['supersedes'] = 'docs/design/redesign1-2026-11-16.json'
json.dump(d, open(ddir + '/redesign2-2026-11-16.json', 'w'), indent=1, ensure_ascii=False)

# workbook
wb = Workbook()
H = Font(bold=True); WR = Alignment(wrap_text=True, vertical='top'); YEL = PatternFill('solid', fgColor='FFF2CC')
def sheet(title, header, rows, widths):
    ws = wb.create_sheet(title)
    ws.append(header)
    for c in ws[1]: c.font = H
    for r in rows: ws.append(r)
    for i, w in enumerate(widths): ws.column_dimensions[chr(65 + i) if i < 26 else 'A' + chr(65 + i - 26)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row: c.alignment = WR
    ws.freeze_panes = 'A2'
    return ws
wb.remove(wb.active)
sheet('Skill plan (basics)', ['Skill', 'II', 'Light', 'First map', 'Map name', 'Carriers', 'Carrier count', 'MAP_FOCUS', 'Why (II 2 picks)', 'Tooltip'],
      [[b['name'], b['ii'], 'yes' if b['light'] else '', b['map'], MAPN.get(b['map'], ''), ', '.join(f"{c['name']} ({c['map']})" for c in b['carriers']), len(b['carriers']),
        'yes' if b['name'] in d['MAP_FOCUS'].get(str(b['map']), []) else '', b['why'], b['tip']] for b in basics], [16, 5, 6, 9, 22, 70, 8, 10, 50, 50])
sheet('Single-card skills (II 2-7)', ['Skill', 'II', 'Owner note on II', 'Carrier', 'Map', 'Map name', 'Why', 'Tooltip'],
      [[s['name'], s['ii'], s['iiNote'] or '', s['carrierName'], s['map'] if s['map'] is not None else '', MAPN.get(s['map'], ''), s['why'], s['tip']] for s in singles], [16, 5, 28, 26, 6, 22, 60, 50])
ws = sheet('Redesign Maps 0-20', ['Change?', 'Map', 'Map name', 'Card', 'id', 'Rarity', 'Wait', 'Lumber', 'Owner card', 'Skills now', 'Skills proposed', 'ATK/HP now', 'ATK/HP proposed', 'Fill now %', 'Fill proposed %', 'Why', 'Flags'],
      [['', c['map'], c['mapName'], c['name'], c['id'], c['rarity'], c['wait'], c['cost'], 'O' if c['owner'] else '', c['skillsNow'], c['skillsProposed'],
        f"{c['before']['attack']}/{c['before']['health']}", f"{c['attack']}/{c['health']}", c['before']['fill'], c['fill'], c['note'], '; '.join(c['flags'])] for c in cards],
      [9, 5, 20, 24, 22, 10, 5, 6, 6, 32, 32, 9, 9, 8, 8, 50, 30])
for r in ws.iter_rows(min_row=2):
    if r[10].value != '=' or r[11].value != r[12].value:
        for c in r: c.fill = YEL
sheet('Moved off', ['Skill', 'Rank', 'From (card, map)', 'Why'],
      [[m['name'], m['rank'], ', '.join(f"{nm(i)} ({BYID[i]['map']})" for i in m['from']), m['why']] for m in moved], [22, 14, 60, 50])
sheet('Gaps', ['Threat', 'Where on the road', 'Answer (first map)', 'Verdict', 'Fill / proposal'], [list(g) for g in GAPS] + [[], ['Skill', 'Status', '', '', '']] + [[n, t, '', '', ''] for n, t in NOTES], [20, 50, 60, 26, 45])
about = ['REDESIGN2 (2026-11-16): Maps 0-20 cards on the owner\'s new skill list. A proposal; nothing in the game changes. Supersedes REDESIGN1.',
         'Source: G6 - Bramblewood_2.xlsx, Skills, column II (owner 11-16 20:43) and the owner\'s 20:48 call "stick to 50+".',
         f"Basics: all 45 II 1 skills + 6 II 2 (Keen Sense, Illuminate, Electricity, Stampede, Stealth, Momentum) = {counts['basics']}. Other II 2-7 skills: one card each, or off Maps 0-20.",
         'Budget: bramblewood-budget.js via tools/skill_costs.js budget(), Level 1, fill = max(cap 1, cap 2); band 85-100%.',
         'Change? column: write yes / no / your edit. Yellow rows change.',
         'Owner questions: see docs/design/redesign2-2026-11-16.md.'] + [f'Q{i}: {q.replace("**", "")}' for i, q in enumerate(QUESTIONS, 1)]
ws = wb.create_sheet('About')
for a in about: ws.append([a])
ws.column_dimensions['A'].width = 140
for row in ws.iter_rows():
    for c in row: c.alignment = WR
wb.save(wbpath)
print('ok', len(md))
