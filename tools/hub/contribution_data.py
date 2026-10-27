"""2026-10-27 (package BAL6, K5, owner 10-27 11:22: "In the Master hub, also show the general 'contribution' of each card with our myriad testing"):
the data of the 🗃️ Card table's 🏅 Contribution view. Read only: the newest docs/balance/contribution-<date>.json written by
tools/balance/contribution.js (a "quick" smoke file is never used). Values stay fractions (0.05 = 5 win-rate points); the page formats them."""
import glob, json, os, re


def newest(root):
    files = sorted(f for f in glob.glob(os.path.join(root, 'docs', 'balance', 'contribution-*.json')) if re.search(r'contribution-\d{4}-\d{2}-\d{2}\w*\.json$', f))
    return files[-1] if files else None


def contribution(root):
    fp = newest(root)
    if not fp:
        return None
    d = json.load(open(fp, encoding='utf-8'))
    A = d['analysis']
    rows = []
    for r in A['cards']:
        rows.append({'id': r['id'], 'n': r['name'], 'r': r['rarity'], 'b': r['band'], 'k': r.get('rank'), 'br': r.get('bandRank'), 'bs': r.get('bandSize'),
                     'd': r['decks'], 'mc': round(r['meanCopies'], 1), 'rd': r['rawDelta'], 'pc': r['perCopy'], 'pcs': r['perCopySE'], 'c': r['contribution'], 'cs': r['contributionSE'],
                     'vb': r['vsBand'], 'z': r['z'], 'f': r.get('flag'), 'ph': r.get('byPhase') or {}, 'sk': r['skills'], 'l': r['cost'], 'a': r['attack'], 'h': r['health']})
    s = d['settings']
    return {'file': os.path.relpath(fp, root), 'generated': d['generated'][:10], 'tool': d['tool'], 'reproduce': d.get('reproduce'),
            'fights': A['fights'], 'drawRate': A['drawRate'], 'seatFirstWin': A['seatFirstWin'], 'splitHalfR': A['splitHalfR'], 'reliability': A['reliability'], 'medianSE': A['medianSE'],
            'medianDecks': A['medianDecks'], 'bands': A['bands'], 'bandOrder': ['starter', 'common', 'uncommon', 'rare', 'veryrare+'],
            'settings': {'seed': s['seed'], 'bramble': s['bramble'], 'level': s['level'], 'cards': s['cards'], 'fields': s['fields'], 'deckRule': s['deckRule']},
            'tooStrong': A['tooStrong'], 'tooWeak': A['tooWeak'], 'rows': rows}
