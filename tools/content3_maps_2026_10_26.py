#!/usr/bin/env python3
"""Package CONTENT3 (2026-10-26): the map edits in arena_app.js CONQUEST_MAPS (idempotent; each edit leaves a dated note on its line).
  C1   5-1 and 5-2 pay a Cure card on their first clear (node firstCard): the Marsh-mallow Hare, the Sphagnum Vole.
  G5   7-4 pays the Sleepless Shrew (Wakeful) on its first clear, before 7-5's Spore Cloud (it paid the Hollow Oath-Keeper).
  G3   the Hollow Oath-Keeper leaves the Morel Hollow's decks (7-2, 7-4, 7-5, 7-6): the Truffle Piglet takes its places (a Map 7 card at its
       cost, 1 Lumber; the Hawthorn Shieldbug, tried first, made 7-4 and 7-5 far too hard: 22.5% and 12.5% at 40 games).
  BAL3-1  5-A-2 Gator Hollow and 10-A-2 The Drowned Deck get the Tide (rules.tide), so their Rising Tide boon can turn on.
  C5   Lilypad Reach (the lotus ponds) has constant Rain (rules.field 'rain' on its seven fights).
  C4   18-4 "Sandstorm" blows the blinding Sandstorm (rules.sandstorm 'blind').
    python3 tools/content3_maps_2026_10_26.py"""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
APP = os.path.join(ROOT, 'arena_app.js')
s = open(APP, encoding='utf-8').read()
TAG = '2026-10-26 (CONTENT3'

def node_span(key):
    tag = '{ key:"%s"' % key
    i = s.find(tag); assert i >= 0 and s.find(tag, i + 1) < 0, key
    return i, s.index('\n', i)

def edit_line(key, fn):
    global s
    i, j = node_span(key); line = s[i:j]; new = fn(line)
    if new != line: s = s[:i] + new + s[j:]; return True
    return False

def set_rules(line, add, note):
    m = re.search(r'rules:\{[^}]*\}', line)
    if m:
        body = m.group(0)[len('rules:'):]
        js = re.sub(r'([{,])\s*([A-Za-z_]\w*)\s*:', r'\1"\2":', body)  # bare keys -> JSON
        r = json.loads(js)
        if all(r.get(k) == v for k, v in add.items()): return line
        r.update(add)
        return line[:m.start()] + 'rules:' + json.dumps(r, separators=(',', ':')) + ' /* %s): %s */' % (TAG, note) + line[m.end():]
    k = line.index('deck:{'); k = line.index('}', k) + 1
    return line[:k] + ', rules:' + json.dumps(add, separators=(',', ':')) + ' /* %s): %s */' % (TAG, note) + line[k:]

def set_first(line, card, note):
    if 'firstCard:"%s"' % card in line: return line
    assert 'firstCard:' not in line, line[:80]
    k = line.index('kind:"'); k = line.index('"', k + 6) + 1
    return line[:k] + ', firstCard:"%s" /* %s): %s */' % (card, TAG, note) + line[k:]

def swap_deck(line, out, inn, note):
    m = re.search(r'deck:(\{[^}]*\})', line)
    d = json.loads(m.group(1))
    if out not in d: return line
    n = d.pop(out); d[inn] = d.get(inn, 0) + n
    return line[:m.start()] + 'deck:' + json.dumps(d, separators=(',', ':')) + ' /* %s, G3): %s x%d -> %s */' % (TAG, out, n, inn) + line[m.end():]

done = []
for key, card, why in [('5-1', 'marsh-mallow-hare', 'owner C1, Map 5\'s first two fights pay a Cure card'), ('5-2', 'sphagnum-vole', 'owner C1, Map 5\'s first two fights pay a Cure card'),
                       ('7-4', 'sleepless-shrew', 'owner G5, a Sleep-immune card before 7-5; was the Hollow Oath-Keeper (G3)')]:
    if edit_line(key, lambda l: set_first(l, card, why)): done.append('%s firstCard %s' % (key, card))
for key in ['7-2', '7-4', '7-5', '7-6']:
    if edit_line(key, lambda l: swap_deck(l, 'hollow-oath-keeper', 'truffle-piglet', 'G3')): done.append('%s deck: Oath-Keeper -> Hawthorn Shieldbug' % key)
# the copy caps (an Uncommon 4 a deck): what the Truffle Piglet can't take goes to a Leafcutter Gardener or a Dung Beetle (Map 7's own, on theme)
for key, (other, k) in {'7-4': ('leafcutter-gardener', 2), '7-5': ('dung-beetle', 1), '7-6': ('leafcutter-gardener', 1)}.items():
    def cap(line, other=other, k=k):
        m = re.search(r'deck:(\{[^}]*\})', line); d = json.loads(m.group(1))
        if d.get('truffle-piglet', 0) <= 4: return line
        d['truffle-piglet'] -= k; d[other] = d.get(other, 0) + k
        line = line[:m.start()] + 'deck:' + json.dumps(d, separators=(',', ':')) + line[m.end():]
        return re.sub(r'hollow-oath-keeper x(\d) -> truffle-piglet', lambda mm: 'hollow-oath-keeper x%s -> truffle-piglet x%d + %s x%d (the copy caps; on theme)' % (mm.group(1), int(mm.group(1)) - k, other, k), line)
    if edit_line(key, cap): done.append('%s copy caps' % key)
for key in ['5-A-2', '10-A-2']:
    if edit_line(key, lambda l: set_rules(l, {'tide': True}, 'owner BAL3-1 "Fix.": the Tide, so Rising Tide can turn on')): done.append('%s + tide' % key)
for key in ['2-A-%d' % k for k in range(1, 8)]:
    if edit_line(key, lambda l: set_rules(l, {'field': 'rain'}, 'owner C5 / EN6-9 "the lotus petal map can have eternal rain": constant Rain')): done.append('%s field rain' % key)
if edit_line('18-4', lambda l: set_rules(l, {'sandstorm': 'blind'}, 'owner C4 / EN8-7: the blinding Sandstorm (every unit Blind, a Storm for Storm cards)')): done.append('18-4 sandstorm blind')
# 7-5's showcase was the Oath-Keeper (G3): the card that took its place in the deck
if edit_line('7-5', lambda l: l.replace('showcase:"hollow-oath-keeper"', 'showcase:"truffle-piglet" /* %s, G3): was the Hollow Oath-Keeper */' % TAG)): done.append('7-5 showcase')
# the generated first-card table: 7-4's row follows its node (gd5's table is regenerated from the node's firstCard anyway)
old = "  'mu:7-4': 'hollow-oath-keeper',"
if old in s: s = s.replace(old, "  'mu:7-4': 'sleepless-shrew', // 2026-10-26 (CONTENT3, G5 / G3): was the Hollow Oath-Keeper"); done.append('SKIRMISH_FIRST_PACK_CARDS mu:7-4')
open(APP, 'w', encoding='utf-8').write(s)
print('\n'.join(done) or 'nothing to do')
