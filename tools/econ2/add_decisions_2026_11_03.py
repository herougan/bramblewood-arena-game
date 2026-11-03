#!/usr/bin/env python3
"""ECON2 (2026-11-03): add the ECON2-n owner calls to docs/decisions.json, one item a line, at the top of items (status YET).
Re-running replaces the ECON2 items it wrote before. Text: docs/econ2-2026-11-03.md section 5."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
DOC = 'docs/econ2-2026-11-03.md'
def item(n, area, group, title, body, options, default):
    return {'id': f'ECON2-{n}', 'status': 'YET', 'kind': 'Decide', 'area': area, 'group': group, 'asked': '2026-11-03', 'title': title,
            'body': body + f' Measured, nothing changed. {DOC} (sim: tools/econ2/econ_sim_2026_11_03.js).', 'options': options, 'default': default}
ITEMS = [
 item(1, 'Economy', 'game', 'The Forge cliff at Map 11: Maps 0-10 take 3 days, Maps 11-20 up to 46 (Dust)',
  'A dedicated player clears Maps 0-10 in 3 days (casual 7) with nothing to buy, then waits on Dust: keeping the deck at the level the road curve is tuned for (referencePlayerLevel) with each map\'s reference cards, Maps 11-20 take 46 days (casual 66), 45 of them waiting for Dust. A player who keeps one deck from Map 11 needs 5.8k Dust in all and finishes Map 20 on day 10 (casual 20). Dust income after the road is notices 243 a day + weekly quests ~210 a day (from Map 13). Murgle Mayhem (759 Dust a week, built by ECON1) is still hidden (DAILY_DUNGEONS_HIDDEN).',
  ['a) Open Murgle Mayhem from Map 11 (DAILY_DUNGEONS_HIDDEN off for it): +108 Dust a day, the source ECON1 built for this.', 'b) Lower Forge steps 1-3 (35 / 44 / 53 Dust) by a third: the levels the road asks for on Maps 11-20.', 'c) Pay elite and boss repeat wins their full Dust (conquestRepeat 1.0 for Dust only).', 'd) Leave it: Maps 11-20 are meant to be the grind.'], 'a'),
 item(2, 'Economy', 'game', 'Weekly quests pay their tier\'s reward for each quest, not once a tier',
  'claimQuest grants tier.reward on every quest claimed, so weekly tier 1 pays 3 x (170 Leaves, 260 Dust, 2 Metal). A full week (from Map 13) is 1,469 Dust and 959 Leaves, about 40% of a dedicated player\'s Dust after the road; ECON1\'s arithmetic counted each tier once. Paid once a tier, the dedicated run ends Map 20 on day 58 instead of 49.',
  ['a) Keep per quest (the Dust is needed: see ECON2-1) and say "each" on the board.', 'b) Pay once a tier (as ECON1 assumed) and make up the Dust elsewhere.'], 'a'),
 item(3, 'Economy', 'game', 'Weekly tier 1 holds a PvP quest, so tiers 2-3 stay hidden on Maps 4-10',
  'Weekly tier 1 is w1-energy, w1-pvp (30 PvP tickets) and w1-units; the Arena opens on Map 11 and a tier shows only once the one before is all claimed. So from Map 4 to Map 10 a player can claim 2 weekly quests, and from Map 11 to 12 tier 2 stops on its raid quests (Raid, Map 13), hiding tier 3.',
  ['a) Move w1-pvp to tier 3 and w3-conquest to tier 1; move the two raid quests to tier 3 (each tier claimable once its feature is open).', 'b) Skip a locked quest when deciding whether the next tier shows.', 'c) Leave it.'], 'b'),
 item(4, 'Economy', 'game', 'Maple Leaves pile up: 12k unspent at Map 20 while Dust runs dry',
  'Leaves come in about as fast as Dust (dedicated, to the end of Map 20: 38.9k Leaves, 35.9k Dust), but the Forge takes Leaves at 2/3 of its Dust, so a dedicated player holds 12.1k Leaves and 0.6k Dust at Map 20 (casual 9.4k / 0.4k). Packs (50-94 Leaves) are the only large sink.',
  ['a) Leave it: players spend Leaves on packs (12k = 240 Hedgerow Pouches).', 'b) Shift the notices toward Dust (e.g. D 20 / 25 -> 15 / 30, and up the line) so the two run out together.', 'c) Add a Leaves sink that helps the grind (e.g. the Forge buys Dust at 3 Leaves : 1).'], 'b'),
 item(5, 'Economy', 'game', 'A repeat skirmish pays 4 Leaves whatever its Energy: farming stops paying after Map 3',
  'CONQUEST_NODE_REWARDS.skirmish.repeat is 8 Leaves (4 after ECON1) and 0 Dust on every map, while a fight costs 1 Energy on Map 0 and 9 on Map 20: 4 Leaves an Energy on Map 0, 0.44 on Map 20. Elites repeat for 7 Leaves + 3 Dust.',
  ['a) Scale the repeat pay with the fight\'s Energy (4 Leaves and 1 Dust a point of Energy, halved).', 'b) Scale it with the map number (+10% a map, as the Blossoms do).', 'c) Leave it: Energy is for the road, not for farming.'], 'a'),
 item(6, 'Economy', 'game', 'Errands pay 14-27 Dust: less than half a D notice, for 2-3 wins and an interruption',
  'An errand pays 4-8% of a Materia Unit, halved: 14-27 Dust and 9-18 Leaves (+ an Iron Shard on two). A D notice pays 25 Dust, the average notice 40. Offers come after 30% of Conquest wins (up to 2 a day), each a 2-line conversation with a yes / no.',
  ['a) Raise errands to about one notice (mu x 2.5: 35-68 Dust) and offer them after 15% of wins.', 'b) Raise the pay only.', 'c) Leave it.'], 'a'),
 item(7, 'Economy', 'game', 'A two-session player is Energy-bound from Map 5: 57-107 Energy a day of 288',
  'Energy refills 1 every 5 minutes (288 a day) up to the cap (20, 30 after the Nest steps, 50 with the Forge steps). A player who plays twice a day gets twice the cap plus 6 a session: 57 a day at cap 20, 77 at 30, 107 at 50, so from Map 5 (5-6 Energy a fight) a casual player runs out before the time does. A dedicated player is never Energy-bound before Map 21 (time and Dust bind).',
  ['a) Leave it (cap 20 is the owner\'s 10-14 choice; Energy is meant to pace casual play).', 'b) Raise the base cap to 30 (casual +20 a day).', 'c) Bank up to one extra cap overnight (a "rested" refill once a day).'], 'a'),
 item(8, 'Economy', 'game', 'Kibble, Iron Shards and Metal flood: hundreds held with nothing to spend them on',
  'At Map 20 a dedicated player holds 362 Kibble (Nest training costs 2-8 a card), 188 Iron Shards (repeat wins drop one 15% of the time; the Max Energy steps use 7) and 45 Metal (nothing spends Metal).',
  ['a) Iron Shard on a repeat win 15% -> 5%; give Metal a use (e.g. Forge tier upgrades take 5 / 10 Metal); leave Kibble.', 'b) Hide each currency\'s counter until something spends it.', 'c) Leave it for now.'], 'a'),
 item(9, 'Dialogue', 'game', 'Dialogue: busy first hour, then most maps say nothing',
  'The whole game has 62 NPC scripts (171 lines, 1,877 words, about 10 minutes). The first hour (tutorial and Maps 0-2) plays about 13 of them (41 lines) on top of the tutorial; Maps 8 and 11 are busy (4-5 each); Map 18 and Maps 22-24 say nothing and Maps 6, 9, 12, 15, 16, 17 one 2-3 line conversation, the same stretch where the player waits on Dust. Boss banter is one shared two-line exchange and fires on 7 main-road fights only (enders are mostly elites). Proposal: one curiosity (2-4 lines) on each silent map 12-24, written in the lore bible\'s voice, and errands offered less often (ECON2-6).',
  ['a) Write one curiosity for each silent main map (Claude drafts, you edit).', 'b) Only for Maps 12-20.', 'c) Leave it.'], 'a'),
 item(10, 'Maps', 'game', 'Map objects: fights under the title panel, crowded tiles, empty halves',
  'The probe (1,366 px desktop, every object shown; docs/screens/econ2/) found a fight under the map\'s title panel on 20 maps (15 main, 5 side; most often X-2, e.g. 3-1, 5-2, 20-2 and 20-3), 13 pairs of tap targets closer than 7% of the canvas (8-5 / 8-H 2.8% on the dark Caves map, 20-2 / 20-3 3.3%; side-map entrances on 1-3 and 19-3), and the same perimeter trail (top, right edge, bottom) on Maps 3-19 that leaves the centre empty; Maps 21-24 fill the canvas and read better.',
  ['a) Fold the title panel to a chip after the first look at a map, and move the listed nodes with the layout editor (Claude lists the moves).', 'b) Only fold the title panel.', 'c) Leave it.'], 'a'),
 item(11, 'Tools', 'game', 'The hub\'s Resources tab still shows income from before ECON1 (twice the real numbers)',
  'tools/resources_week_2026_10_23.js reads QUEST_RANK_REWARD, QUEST_TIERS and the repeat rewards from their declarations, without the econScaleTable / econScale halving the game applies after them, and it counts the daily quest tiers, which the board no longer posts. Its week (e.g. 4,614 Dust at Map 10) is about twice what a player gets. tools/econ2/econ_sim_2026_11_03.js reads them halved.',
  ['a) Fix the tool to apply the halving (and drop the daily tiers), then rebuild the hub tab.', 'b) Retire the tab and point it at the ECON2 sim.'], 'a'),
 item(12, 'Finance', 'finance', 'Gold Leaves (the scarce currency) come at about 1 a day: is that the premium anchor you want?',
  'Gold Leaves come only from S / SS / SSS notices (3 / 8 / 15 each, halved) while the daily dungeons are hidden: a dedicated player gets about 1 a day (51 by the end of Map 20), a casual one about 0.5. A Tidemire Chest costs 6 and a Highcrest Case 11 with their Leaves. If Gold Leaves are to be the currency a future premium lane or shop sells, their free rate is the number that sets the price of everything later.',
  ['a) Keep ~1 a day free and treat Gold Leaves as the premium anchor (no change now).', 'b) Add a small steady source (e.g. 1 a week from the weekly tier 1, or the Trail\'s free lane) so casual players see them.', 'c) Decide with the monetisation plan later.'], 'c'),
]
d = json.load(open(P))
d['items'] = [x for x in d['items'] if not str(x.get('id', '')).startswith('ECON2-')]
d['items'] = ITEMS + d['items']
d['updated'] = '2026-11-03'
# the file's own layout: one item a line
lines = ['{', f'  "updated": {json.dumps(d["updated"])},', f'  "note": {json.dumps(d["note"], ensure_ascii=False)},', '  "items": [']
lines += ['    ' + json.dumps(x, ensure_ascii=False) + (',' if i < len(d['items']) - 1 else '') for i, x in enumerate(d['items'])]
lines += ['  ],', '  "rules": [']
lines += ['    ' + json.dumps(x, ensure_ascii=False) + (',' if i < len(d['rules']) - 1 else '') for i, x in enumerate(d['rules'])]
lines += ['  ]', '}']
extra = [k for k in d if k not in ('updated', 'note', 'items', 'rules')]
assert not extra, extra
open(P, 'w').write('\n'.join(lines) + '\n')
json.load(open(P))
print('ECON2 items:', len(ITEMS), '| total', len(d['items']))
