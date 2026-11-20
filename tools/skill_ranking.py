#!/usr/bin/env python3
# 2026-11-14 (package SKR1, recording only): the owner's skill ranking (docs/owner-input/skills-ranking-2026-11-14.xlsx, sheet "Skills",
# column J "Comments", owner 11-14 22:53) as data, and the redesign worklist of the Maps 0-20 cards.
#   python3 tools/skill_ranking.py --from-xlsx   read the sheet once -> docs/skill-ranking.json (the canonical record)
#   python3 tools/skill_ranking.py --from-1120   fold the owner's 11-20 sheet into it (SKIN3, 2026-11-20; run once)
#   python3 tools/skill_ranking.py               docs/skill-ranking.json + canonical/cards.json -> docs/skill-ranking.md and
#                                                docs/balance/skr1/cards-2026-11-14.json
# Maps 0-20 cards = the BAL25 scope (docs/balance/bal25/card-power.json rows), live only (no token / test / pool / unattainable).
# Skill keys of a card = the export tool's "Cards with it" extraction (effect keys through the skill_params alias, plus the "do" of each trigger).
import json, os, re, sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = os.path.join(ROOT, 'docs', 'skill-ranking.json')
XLSX = os.path.join(ROOT, 'docs', 'owner-input', 'skills-ranking-2026-11-14.xlsx')
TAGS = ['GOD', 'MAGIC', 'EVO', 'KINGDOM', 'WEP']
ORDER = ['1', '1A', '2', '2A', '3', '4', '5', '6', '7', '8']  # best to worst
RANK_RE = re.compile(r'^(\d+A?|S|GOD|MAGIC|MAG|EVO|KINGDOM|WEP|Remove)\b\s*(.*)$', re.S)  # + Remove (SKIN3, owner 11-20)


def parse(cell):
    """cell -> (rank, note). rank '' = blank, 'note' = text only; note = the text after the rank, brackets kept."""
    if cell is None or str(cell).strip() == '': return '', ''
    if isinstance(cell, (int, float)): return str(int(cell)), ''
    s = str(cell).strip()
    m = RANK_RE.match(s)
    if not m: return 'note', s
    r = m.group(1)
    return ('MAGIC' if r == 'MAG' else r), m.group(2).strip()


def from_xlsx():
    import openpyxl
    ws = openpyxl.load_workbook(XLSX)['Skills']
    rows = [r for r in ws.iter_rows(values_only=True) if any(v is not None for v in r)][1:]
    ideas = {'???', 'Buff', 'Havoc (counter)', 'Industry', 'Assiduous'}
    out = []
    for r in rows:
        rank, note = parse(r[9])
        e = {'name': r[0], 'key': r[1] or '', 'rank': rank, 'note': note, 'written': r[9] if r[9] is None or isinstance(r[9], str) else str(r[9]),
             'delivery': r[2] or '', 'category': r[5] or '', 'type': r[6] or ''}
        if not r[1]: e['idea' if r[0] in ideas else 'noKey'] = True
        out.append(e)
    json.dump({'about': 'Owner ranking of the skills, 2026-11-14 22:53 (docs/owner-input/skills-ranking-2026-11-14.xlsx, sheet Skills, column J). rank: 1, 1A, 2, 2A, 3..8, S, tags GOD / MAGIC (MAG) / EVO / KINGDOM / WEP, "note" = a note only, "" = blank (not important or a duplicate: cut). note = the owner text after the rank, brackets kept. written = the cell as typed. idea = an owner idea for a new skill (no key); noKey = another row without a key.',
               'skills': out}, open(J, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote', J, len(out))


def from_1120():
    """2026-11-20 (package SKIN3): the owner's 11-20 sheet (docs/owner-input/skills-2026-11-20.xlsx) against 11-14b, matched by (name, key):
    a changed column J "II" sets pass2 (+ pass2Note, writtenII), a changed column K "Comments" sets rank / note / written; new rows are added
    as ideas (design = the owner's words: Delivery note, else tooltip, else codex). changed1120 lists what moved."""
    import openpyxl
    rows = lambda f: [r for r in openpyxl.load_workbook(os.path.join(ROOT, 'docs', 'owner-input', f), read_only=True)['Skills'].iter_rows(values_only=True) if any(v is not None for v in r)][1:]
    old = {}
    for r in rows('skills-ranking-2026-11-14b.xlsx'): old.setdefault((r[0], r[1] or ''), r)
    d = json.load(open(J, encoding='utf-8')); sk = d['skills']
    by = {}
    for s in sk: by.setdefault((s['name'], s['key'] or ''), s)
    typed = lambda v: v if v is None or isinstance(v, str) else str(v)
    seen = set()
    for r in rows('skills-2026-11-20.xlsx'):
        k = (r[0], r[1] or '')
        if k in seen: continue
        seen.add(k); o = old.get(k)
        if o is None:
            rank, note = parse(r[10]); p2, p2n = parse(r[9])
            e = {'name': r[0], 'key': r[1] or '', 'rank': rank, 'note': note, 'written': typed(r[10]), 'delivery': r[2] or '', 'category': r[5] or '', 'type': r[6] or '',
                 'idea': True, 'pass2': p2 if p2 != 'note' else '', 'design': r[4] or r[8] or (r[11] if len(r) > 11 else None) or '', 'addedIn': '11-20'}
            if p2n: e['pass2Note'] = p2n
            sk.append(e); continue
        s = by.get(k) or (k[1] and next((x for x in sk if x["key"] == k[1]), None))  # a renamed row (Delivery resource -> Delivery) by its key
        if s is None: continue
        ch = []
        if typed(r[9]) != typed(o[9]):
            p2, p2n = parse(r[9]); s['pass2'] = p2; s['writtenII'] = typed(r[9]); ch.append('II')
            if p2n: s['pass2Note'] = p2n
        if typed(r[10]) != typed(o[10]):
            s['rank'], s['note'] = parse(r[10]); s['written'] = typed(r[10]); ch.append('Comments')
        if ch: s['changed1120'] = ch
    d['about'] += ' 2026-11-20 (SKIN3): the owner\'s 11-20 sheet (docs/owner-input/skills-2026-11-20.xlsx, owner 11-20 00:01): a changed column J "II" sets pass2 (now 1-7, S or Remove; pass2Note = its text, writtenII = as typed), a changed column K "Comments" sets rank / note / written; changed1120 lists which; rows new on the sheet are ideas (addedIn 11-20, design = the owner\'s words).'
    json.dump(d, open(J, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote', J, len(sk), sum(1 for s in sk if s.get('changed1120')), 'changed', sum(1 for s in sk if s.get('addedIn') == '11-20'), 'new')


def card_keys(c, fkey):
    fx = c.get('effects') or {}
    ks = {fkey(k) for k in fx if k != 'triggers'}  # 'triggers' is the list, its "do" keys count below
    for t in fx.get('triggers') or []:
        if t.get('do'): ks.add(str(t['do']).split(':')[0])
    return ks


def build():
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import skill_params as SP
    alias = SP._alias(); fkey = lambda k: alias[k][0] if k in alias else k
    sk = json.load(open(J, encoding='utf-8'))['skills']
    byk = {s['key']: s for s in sk if s['key']}
    rank_of = lambda k: (byk.get(k) or byk.get('action:' + k) or {}).get('rank')  # None = not on the sheet
    cards = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
    ids = [r['id'] for r in json.load(open(os.path.join(ROOT, 'docs', 'balance', 'bal25', 'card-power.json'), encoding='utf-8'))['rows']]
    live = [cards[i] for i in ids if i in cards and not any(cards[i].get(f) for f in ('token', 'test', 'pool', 'unattainable'))]
    allkeys = Counter()
    for c in cards.values():
        if not (c.get('token') or c.get('test')):
            for k in card_keys(c, fkey): allkeys[k] += 1
    missing = {k: n for k, n in allkeys.items() if rank_of(k) is None}
    rows, bucket, cutc, missc = [], Counter(), Counter(), Counter()
    for c in sorted(live, key=lambda c: c['name']):
        ks = sorted(card_keys(c, fkey)); rs = {k: rank_of(k) for k in ks}
        cut = [k for k in ks if rs[k] == '']
        num = [k for k in ks if rs[k] in ORDER]
        other = [k for k in ks if rs[k] not in ORDER and rs[k] not in ('', None)]  # S, tags, note-only
        best = min((ORDER.index(rs[k]) for k in num), default=None); worst = max((ORDER.index(rs[k]) for k in num), default=None)
        lowbest = (best is not None and ORDER[best] in ORDER[ORDER.index('4'):] and not other) or (not num and not other and bool(cut))
        b = 'cut' if cut else ORDER[worst] if num else 'S/tag/note only' if other else 'unranked keys only' if ks else 'no skills'
        bucket[b] += 1
        for k in cut: cutc[k] += 1
        for k in ks:
            if rs[k] is None: missc[k] += 1
        rows.append({'id': c['id'], 'name': c['name'], 'rarity': c.get('rarity'), 'skills': rs, 'cut': cut, 'best': ORDER[best] if best is not None else '',
                     'worst': ORDER[worst] if worst is not None else '', 'bucket': b, 'bestIs4OrLower': bool(lowbest)})
    os.makedirs(os.path.join(ROOT, 'docs', 'balance', 'skr1'), exist_ok=True)
    json.dump({'about': 'SKR1 redesign worklist: live Maps 0-20 cards (BAL25 scope, no token/test/pool/unattainable) with the owner rank of each skill key. bucket = the card\'s lowest-ranked skill (cut = carries a blank-rank skill); bestIs4OrLower = its best numeric rank is 4..8 and it has no S/tag skill (or only cut skills).',
               'cards': rows, 'bucketCounts': bucket, 'cutSkillCardCounts': cutc.most_common(), 'keysMissingFromSheet': missing},
              open(os.path.join(ROOT, 'docs', 'balance', 'skr1', 'cards-2026-11-14.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    L = ['# Skill ranking (owner, 2026-11-14 22:53; updated from the 11-20 sheet)', '',
         '**What the ranks mean (owner, 11-14 23:04):** 1-3 are the skills likely to go in the game (some 3s may be skipped). 4 are context-based power-ups (a few may be picked). 5-7 are very unsure (win-mores, very unique effects; a few may be picked). S are special skills for one-off boss units. GOD, MAGIC, EVO, KINGDOM and WEP belong to later worlds, not Maps 0-20. Blank: not important or a duplicate.', '',
         'Generated by `python3 tools/skill_ranking.py` from `docs/skill-ranking.json` (the canonical record) and `canonical/cards.json`. Package SKR1: recording only; no card, engine or text was changed.',
         'Ranks: 1 = most important to the owner ... 8 = least; A = a variant; S, GOD, MAGIC, EVO, KINGDOM, WEP are tags the owner wrote; blank = not important or a duplicate (cut).', '']
    cnt = Counter(s['rank'] for s in sk)
    p2 = {}
    for x in sk:
        if x.get('pass2'): p2.setdefault(x['pass2'], []).append(x['name'])
    if p2:
        L += ['## Second pass (owner, column J "II": 11-14 23:26, updated 11-20 00:01): the named skills for the game; Remove = take it out', '']
        for k in sorted(p2): L += ['- **%s** (%d): %s' % (k, len(p2[k]), ', '.join(p2[k]))]
        ch = [x for x in sk if x.get('changed1120')]
        L += ['', '**Changed on the 11-20 sheet** (%d): %s' % (len(ch), ', '.join('%s (%s)' % (x['name'], '/'.join(x['changed1120'])) for x in ch)), '']
    L += ['## Counts per rank (%d rows)' % len(sk), '', '| Rank | Rows |', '|---|---|']
    names_order = ORDER + ['S'] + TAGS + ['Remove', 'note', '']
    for r in names_order: L.append('| %s | %d |' % (r or '(blank, cut)', cnt.get(r, 0)))
    L += ['', '## Skills per rank', '']
    for r in names_order:
        if r == '': continue
        L.append('**%s** (%d): %s' % (r, cnt.get(r, 0), ', '.join(s['name'] for s in sk if s['rank'] == r) or '-')); L.append('')
    L += ['**Blank (cut)** (%d): %s' % (cnt.get('', 0), ', '.join(s['name'] for s in sk if s['rank'] == '' and s['key'])), '']
    L += ['## Owner\'s notes', '', 'Design instructions for later engine packages (renames, merges, rule changes). Listed verbatim, not acted on.', '',
          '| Skill (key) | Rank | Note |', '|---|---|---|']
    for s in sk:
        if s['note']: L.append('| %s (%s) | %s | %s |' % (s['name'], s['key'] or 'no key', s['rank'], s['note'].replace('|', '\\|')))
    L += ['', '## Owner ideas for new skills (rows without a key)', '']
    for s in sk:
        if s.get('idea') or s.get('noKey'): L.append('- %s%s: %s' % (s['name'], ' (idea)' if s.get('idea') else ' (row without a key)', s['written'] or '-'))
    L += ['', '## Redesign worklist: live cards on Maps 0-20 (%d cards)' % len(live), '',
          'Scope: the BAL25 card-power set (`docs/balance/bal25/card-power.json`), live cards only. Data: `docs/balance/skr1/cards-2026-11-14.json`.', '',
          '### Cards by lowest-ranked skill', '', '| Lowest rank on the card | Cards |', '|---|---|']
    for b in ['cut'] + ORDER[::-1] + ['S/tag/note only', 'unranked keys only', 'no skills']:
        if bucket.get(b): L.append('| %s | %d |' % (b, bucket[b]))
    L += ['', '### Cut (blank-rank) skills on these cards, by card count', '', ', '.join('%s %d' % (k, n) for k, n in cutc.most_common()), '',
          '### Cards that carry a cut skill (%d)' % bucket['cut'], '']
    for r in rows:
        if r['cut']: L.append('- %s: cut %s; others %s' % (r['name'], ', '.join(r['cut']), ', '.join('%s=%s' % (k, v) for k, v in r['skills'].items() if k not in r['cut']) or '-'))
    L += ['', '### Cards whose best rank is 4 or lower (%d)' % sum(r['bestIs4OrLower'] for r in rows), '']
    for r in rows:
        if r['bestIs4OrLower']: L.append('- %s: %s' % (r['name'], ', '.join('%s=%s' % (k, v if v != '' else 'cut') for k, v in r['skills'].items())))
    L += ['', '### Skill keys on live cards missing from the sheet (added after 11-07, or structural)', '',
          ', '.join('%s (%d cards)' % (k, n) for k, n in sorted(missing.items())) or '-', '']
    open(os.path.join(ROOT, 'docs', 'skill-ranking.md'), 'w', encoding='utf-8').write('\n'.join(L))
    print('cards', len(live), dict(bucket)); print('cut top', cutc.most_common(10)); print('missing', missing)
    print('rank counts', dict(cnt)); print('lowbest', sum(r['bestIs4OrLower'] for r in rows))


if __name__ == '__main__':
    from_xlsx() if '--from-xlsx' in sys.argv else from_1120() if '--from-1120' in sys.argv else build()
