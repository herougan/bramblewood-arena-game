#!/usr/bin/env python3
"""Writes docs/card-balance-2026-10-09.md from docs/balance/card-balance.json (tools/card_balance.js).

    node tools/card_balance.js 80 --suggest && python3 tools/card_balance_report.py
"""
import json, os, statistics
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
o = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'card-balance.json')))
rows = o['rows']

def med(xs): return round(statistics.median(xs), 1) if xs else '–'
tiers = {}
for r in rows: tiers.setdefault(min(3, r['cost']), []).append(r['winRate'])
by_rar = {}
for r in rows: by_rar.setdefault(r['rarity'] or 'not set', []).append(r['winRate'])

L = []
L.append('# Card balance report (2026-10-09)\n')
L.append(f"**How it's measured.** Every fieldable card ({len(rows)}) plays {o['games']} matches with the game's own AI ({o['mode']} fights).")
L.append('- **Test deck:** the card (8 copies; 6, 4 or 3 if it costs 1, 2 or 3+ Lumber) plus a reference mix.')
L.append(f"- **Opponent:** 20 cards of the same reference mix ({', '.join(o['filler'])}).")
L.append('- A card that adds nothing scores about 50%.')
L.append('- Each rarity has a target band. A card above its band is "strong", below is "weak".')
L.append('- Re-run any time with `node tools/card_balance.js 80 --suggest && python3 tools/card_balance_report.py`. The full sortable table is in the hub\'s ⚖️ Balance tab.\n')

L.append('## What it found\n')
L.append('1. **The computer opponent never saved Lumber** (fixed today).')
L.append('   - It only discarded for Lumber when it had nothing free to play, so cards that cost Lumber were almost never played: by enemies, in every simulation and in every tuning number so far.')
L.append('   - Now it pitches its weakest free card when a costly card is within two turns of reach, and plays the costly card once it can.')
L.append('   - In testing, a 1-cost card went from a 23% to an 84% win rate, and a 2-cost card from 8% to 40%.')
L.append('2. **Cost decides strength more than anything.** Median win rate by Lumber cost:')
L.append('')
L.append('   | Cost | Cards | Median win % |')
L.append('   |---|---|---|')
for k in sorted(tiers): L.append(f"   | {k if k < 3 else '3+'} | {len(tiers[k])} | {med(tiers[k])} |")
L.append('')
L.append('   1-cost cards are the sweet spot. Cards costing 3 or more lose to the reference deck: a match is usually over in ~17 rounds, and a 3–4 cost card with Wait 4–5 arrives too late to matter.')
L.append('3. **The five Legendary dragons are among the weakest cards in the game** (about 38%), for the same reason.')
L.append('   - I tested five fixes in simulation: start each match with 2 Lumber; +1 Lumber every 2 rounds; −1 cost and −1 Wait for every card costing 2+; +15% stats per Lumber of cost; and a start bonus plus stat buff together.')
L.append('   - None made 3+ cost cards competitive.')
L.append('   - This needs a design answer, not a number tweak: see decision B4.')
L.append(f"4. **Rarity doesn't follow strength yet.** {sum(1 for r in rows if not r['rarity'])} of {len(rows)} cards have no rarity.")
L.append('   - Some free cards win 95–100% (Carrion Fly Swarm, Cave Bat Swarm, Owl Fletcher, Trapdoor Spider, Tusked Vanguard).')
L.append('   - Several Starters win 80–94% (Duck Paddler, Cobalt Talon Skirmisher, Crimson Wing Duelist Cadet, Otter Guard).')
L.append('   - The tiny 1/2 Starters (Guppy, Earthworm, Silver Minnow, Worker Ant, Otter Kit) sit at 9–11%.')
L.append('   - Giving every card a rarity from its measured strength would also fix the "enemy deck Lv 0" badge (decision B3).\n')
L.append('| Rarity | Cards | Median win % |')
L.append('|---|---|---|')
for k, v in sorted(by_rar.items(), key=lambda kv: -len(kv[1])): L.append(f'| {k} | {len(v)} | {med(v)} |')
L.append('')

L.append('## Strongest cheap cards (cost 0–1)\n')
L.append('| Card | Rarity | Cost / Wait | Stats | Skills | Win % | Suggested rarity |')
L.append('|---|---|---|---|---|---|---|')
for r in sorted([r for r in rows if r['cost'] <= 1], key=lambda r: -r['winRate'])[:20]:
    L.append(f"| {r['name']} | {r['rarity'] or '–'} | {r['cost']} / {r['wait']} | {r['attack']}/{r['health']} | {', '.join(r['skills']) or '–'} | {r['winRate']} | {r.get('suggestRarity') or '–'} |")
L.append('')
L.append('## Weakest cards\n')
L.append('| Card | Rarity | Cost / Wait | Stats | Win % |')
L.append('|---|---|---|---|---|')
for r in sorted(rows, key=lambda r: r['winRate'])[:20]:
    L.append(f"| {r['name']} | {r['rarity'] or '–'} | {r['cost']} / {r['wait']} | {r['attack']}/{r['health']} | {r['winRate']} |")
L.append('')

sug = [r for r in rows if r.get('suggest')]
L.append(f'## Suggested fixes for cards that have a rarity ({len(sug)})\n')
L.append('Each suggestion is the one stat change (Attack or Health, a few steps at most) that brought the card closest to its rarity\'s band in re-simulation.')
L.append('The bands are a first guess, so read these as "which way and how far", not final numbers.')
L.append('Starters in particular may be meant to be weak or strong; that is your call (decision B5).\n')
L.append('| Card | Rarity | Now | Win % | Band | Change | Win % after |')
L.append('|---|---|---|---|---|---|---|')
for r in sorted(sug, key=lambda r: (r['rarity'] or '', -abs(r['winRate'] - sum(r['band'])/2))):
    s = r['suggest']
    L.append(f"| {r['name']} | {r['rarity']} | {r['attack']}/{r['health']} | {r['winRate']} | {round(r['band'][0])}–{round(r['band'][1])} | {s['stat'].title()} {s['from']} → {s['to']} | {s['winRate']} |")
L.append('')
cnt = {}
for r in rows:
    if r.get('suggestRarity'): cnt[r['suggestRarity']] = cnt.get(r['suggestRarity'], 0) + 1
L.append('## Suggested rarities for cards with none\n')
L.append('By measured strength, the nearest rarity band: ' + ', '.join(f'{v} {k}' for k, v in sorted(cnt.items(), key=lambda kv: -kv[1])) + '.')
L.append('The per-card list is in the hub\'s ⚖️ Balance tab (filter "No rarity").')
L.append('Many free cards land on Legendary: either they become rarer, or they get weaker and keep a low rarity.\n')

open(os.path.join(ROOT, 'docs', 'card-balance-2026-10-09.md'), 'w').write('\n'.join(L) + '\n')
print('wrote docs/card-balance-2026-10-09.md')
