#!/usr/bin/env python3
"""LISTFIX1 (2026-10-29): the cards.json follow-ups of the THEME2 lists (APPLY1), filled per the owner's 10-26 "fill in the decisions".

  APPLY1-4 (sources): each card on a map list with no way to be obtained (APPLY1 report "listed, no source") gets
    source {kind: 'pack', tier: <the pack of its first map list>} (Pack 1 Maps 0-6, 2 7-13, 3 14-20, 4 21-27), unless it is a skirmish
    reward or a first-clear card (then it is left and reported). Its awaitingSource and unattainable flags go.
  APPLY1-2 (cards on no list are out of play; owner 22:47 "Don't worry about the other cards"): the `unattainable` flag (data only; the game
    works obtainability out itself, isUnattainable; the hub and the tools read the flag as "unplaced") follows tools/lib_map_pools.js
    isOutOfPlay: a card on a list loses it, a card out of play (on no list, not in pack-extras, given by nothing else) gets it. Tokens,
    tests, heroes, materia, Easter eggs, spells and equipment are left alone; so is a card on no list that is obtainable another way.

Targeted text edits of canonical/cards.json (lines inserted / removed inside the card's object; the file is never re-dumped).
Usage: python3 docs/balance/listfix1-cards-2026-10-29.py [--dry]   (idempotent)
"""
import json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
DRY = '--dry' in sys.argv
NO_SOURCE = ['ant-hill', 'stoneheart-golem', 'gale-sprite', 'colony', 'nest', 'chapel-tortoise', 'ash-imp', 'candle-moth', 'golden-magpie',
             'friar-badger', 'great-gate', 'anvilwhisker-otter']   # APPLY1 report, "Cards THEME2 put on a list that have no source yet"

QUERY = r"""
const path = require('path'), fs = require('fs'), ROOT = process.cwd();
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE, L = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const listed = L.listedIds(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')));
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tbl = app.slice(app.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), app.indexOf('/* GD5-TABLE-END */'));
const FC = new Set(Object.values(require('vm').runInNewContext('(' + tbl.replace(/^const SKIRMISH_FIRST_PACK_CARDS = /, '').replace(/;\s*$/, '') + ')')).flat());
const rew = new Set(); G.CONQUEST_MAPS.forEach(m=> (m.nodes || []).forEach(n=>{ try{ G.nodeRewardCardIds(m.id, n.key).forEach(id=> rew.add(id)); }catch(e){} }));
const ids = JSON.parse(process.env.LF1_IDS), src = {}, held = [];
ids.forEach(id=>{ const d = D[id]; if(!d) return; if(FC.has(id) || rew.has(id)){ held.push(id); return; }
  const f = G.cardFirstMapList(d); if(f) src[id] = G.packTierOfMapNumber(f.n); else held.push(id); });
const skip = c=> c.pool || c.token || c.test || c.hero || c.cardType === 'materia' || c.cardType === 'spell' || c.cardType === 'equipment' || c.easterEgg || (c.source && c.source.kind === 'easteregg');
const add = [], drop = [];
cards.forEach(c=>{ if(skip(c) || !D[c.id]) return; const out = L.isOutOfPlay(G, D[c.id]);
  if(out && !c.unattainable) add.push(c.id); if(!out && c.unattainable && listed.has(c.id)) drop.push(c.id); });
process.stdout.write(JSON.stringify({src, held, add, drop}));
"""


def query():
    r = subprocess.run(['node', '-'], input=QUERY, cwd=ROOT, env=dict(os.environ, LF1_IDS=json.dumps(NO_SOURCE)), check=True, capture_output=True, text=True)
    return json.loads(r.stdout)


def spans(lines):
    """card id -> (start line of its object, end line) for the top-level objects"""
    out, start, cid = {}, None, None
    for i, ln in enumerate(lines):
        if ln == '  {':
            start, cid = i, None
        elif start is not None and cid is None:
            m = re.match(r'^    "id": "([^"]+)",$', ln)
            if m:
                cid = m.group(1)
        if ln in ('  }', '  },') and start is not None:
            if cid:
                out[cid] = (start, i)
            start = None
    return out


def edit(lines, cid, remove_keys=(), insert=()):
    sp = spans(lines)
    a, b = sp[cid]
    body = lines[a:b + 1]
    for key in remove_keys:
        for j, ln in enumerate(body):
            if re.match(r'^    "%s": ' % re.escape(key), ln):
                if not ln.endswith(','):   # the object's last key: the line before loses its comma
                    body[j - 1] = body[j - 1].rstrip(',')
                del body[j]
                break
    if insert:
        j = next(j for j, ln in enumerate(body) if ln.startswith('    "id": '))
        body[j + 1:j + 1] = list(insert)
    lines[a:b + 1] = body
    return lines


def main():
    text = open(CARDS, encoding='utf-8').read()
    lines = text.split('\n')
    by = {c['id']: c for c in json.loads(text)}
    q = query()
    srcd = []
    for cid, tier in q['src'].items():
        c = by[cid]
        if c.get('source', {}).get('kind'):
            continue
        lines = edit(lines, cid, remove_keys=('awaitingSource', 'unattainable'),
                     insert=('    "source": {', '      "kind": "pack",', '      "tier": %d' % tier, '    },'))
        srcd.append((cid, tier))
    # the flags, once the new sources count (the query runs on the file as written so far)
    if srcd and not DRY:
        open(CARDS, 'w', encoding='utf-8').write('\n'.join(lines))
        q2 = query()
    else:
        q2 = q
    for cid in q2['drop']:
        lines = edit(lines, cid, remove_keys=('unattainable',))
    for cid in q2['add']:
        lines = edit(lines, cid, insert=('    "unattainable": true,',))
    new = '\n'.join(lines)
    got = {c['id']: c for c in json.loads(new)}
    assert set(got) == set(by)
    for cid, c in got.items():   # nothing else changed
        o = dict(by[cid]); n = dict(c)
        for k in ('source', 'awaitingSource', 'unattainable'):
            o.pop(k, None); n.pop(k, None)
        assert o == n, cid
    print('sources (pack of the first map list): %d %s' % (len(srcd), ', '.join('%s Pack %d' % x for x in srcd)))
    print('left (a reward / first-clear card, or on no list): %s' % (', '.join(q['held']) or 'none'))
    print('unattainable flag dropped (on a list): %d %s' % (len(q2['drop']), ', '.join(q2['drop'])))
    print('unattainable flag added (out of play): %d' % len(q2['add']))
    if DRY:
        print('--dry: nothing written')
    else:
        open(CARDS, 'w', encoding='utf-8').write(new)
        print('wrote canonical/cards.json')
    if DRY or not (srcd or q2['drop'] or q2['add']):   # a second run changes nothing: keep the first run's record
        return
    json.dump({'built': '2026-10-29', 'sources': dict(srcd), 'held': q['held'], 'flagDropped': q2['drop'], 'flagAdded': q2['add']},
              open(os.path.join(ROOT, 'docs', 'balance', 'listfix1-cards-2026-10-29.json'), 'w', encoding='utf-8'), indent=1)


if __name__ == '__main__':
    main()
