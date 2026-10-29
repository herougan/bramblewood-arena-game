#!/usr/bin/env python3
# 2026-10-29 (package RELFIX3): a main map's MAP list holds no card over the rarest its fights may hold (PRO2-1, deckopt mapRarityCap; owner
# 10-25 17:53 "If it's over-rare'd then move it off"). THEME2 / THEME3 kept each map's boss card (Heroic / Unique, a boss fight's reward,
# source kind "map") on the MAP list; it moves to the map's SPECIAL list, where it still counts for its boss fight's pool. Nothing else
# changes: the boss card is given by its boss fight (source), never by a pack (not a basic-pack card), so it stays reachable.
# Targeted line edits of canonical/map-pools.json (the file's one-line lists); idempotent.
#   python3 tools/opt/relfix3_boss_special_2026_10_29.py [--dry]
import json, os, re, sys, subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = os.path.join(ROOT, 'canonical', 'map-pools.json')

def over_cap():
    js = r"""
const O = require(process.argv[1] + '/tools/opt/deckopt.js'); const gm = O.loadGame(process.argv[1]), G = gm.G, step = r=> G.roadRarityStep(r), out = [];
G.CONQUEST_MAPS.filter(x=> !x.sub && !x.reserved && G.mapNumberOf(x.id) != null && G.mapNumberOf(x.id) <= 40).forEach(x=>{ const cap = O.mapRarityCap(gm, x);
  ((gm.pools[x.id] || {}).cards || []).forEach(id=>{ const d = gm.D[id]; if(d && step(d.rarity) > step(cap)) out.push({map: x.id, id, rarity: d.rarity, cap, source: d.source || null}); }); });
console.log(JSON.stringify(out));"""
    return json.loads(subprocess.check_output(['node', '-e', js, ROOT], cwd=ROOT).decode().strip().splitlines()[-1])

def main():
    dry = '--dry' in sys.argv
    moves = over_cap()
    lines = open(PATH, encoding='utf-8').read().split('\n')
    done = []
    for mv in moves:
        if (mv['source'] or {}).get('kind') != 'map':
            print('  skipped (not a boss / reward card):', mv); continue
        start = next(i for i, l in enumerate(lines) if l == '  "%s": {' % mv['map'])
        end = next(i for i in range(start + 1, len(lines)) if lines[i].startswith('  }'))
        ci = next(i for i in range(start, end) if lines[i].startswith('   "cards": ['))
        si = next(i for i in range(start, end) if lines[i].startswith('   "special": ['))
        def parse(l):
            return json.loads(l[l.index('['):l.rindex(']') + 1])
        cards, special = parse(lines[ci]), parse(lines[si])
        if mv['id'] not in cards: continue
        cards = [c for c in cards if c != mv['id']]
        if mv['id'] not in special: special.append(mv['id'])
        tail_c = lines[ci][lines[ci].rindex(']') + 1:]; tail_s = lines[si][lines[si].rindex(']') + 1:]
        lines[ci] = '   "cards": ' + json.dumps(cards, ensure_ascii=False) + tail_c
        lines[si] = '   "special": ' + json.dumps(special, ensure_ascii=False) + tail_s
        done.append('%s:%s (%s, cap %s)' % (mv['map'], mv['id'], mv['rarity'], mv['cap']))
    print('%d moved MAP -> SPECIAL: %s' % (len(done), ', '.join(done)))
    if not dry and done:
        txt = '\n'.join(lines); json.loads(txt)
        open(PATH, 'w', encoding='utf-8').write(txt); print('wrote canonical/map-pools.json')

if __name__ == '__main__':
    main()
