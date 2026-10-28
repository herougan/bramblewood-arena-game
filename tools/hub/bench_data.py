"""2026-10-28 (package TOOLS1, owner 10-28 21:40: "we need the following applications: 1) a good way to measure cards contribution 2) a good
way to quickly measure skills impact ... 3) a good way to optimise a deck out of a list of cards"): the 🧪 Workbench section of the 🧬 Deck
optimizer tab. Read only: the newest docs/balance/bench-skills-<date>.json (the mispriced skills, tools/bench/bench.js skill --all), the
newest docs/balance/bench-contrib-global-<date>.json (value per budget point for every card, bench.js contrib --all) and the
bench-deck-*.md results (bench.js deck). Server-rendered tables that reuse the summary's sortable .dos-t (deckopt_summary.js)."""
import glob, html, json, os, re

e = lambda s: html.escape(str(s), quote=True)


def _newest(root, pat):
    files = sorted(f for f in glob.glob(os.path.join(root, 'docs', 'balance', pat)) if re.search(r'\d{4}-\d{2}-\d{2}\w*\.json$', f))
    return files[-1] if files else None


def _f1(v, scale=1):
    return '-' if v is None else ('+' if v >= 0 else '') + f'{v * scale:.1f}'


def _table(heads, rows, label):
    th = ''.join(f'<th scope="col" tabindex="0" role="columnheader" aria-sort="none" data-dsk="{i}">{e(h)}</th>' for i, h in enumerate(heads))
    body = ''.join('<tr>' + ''.join(f'<td{" class=\"num\"" if i else ""} data-v="{e(v)}">{c}</td>' for i, (c, v) in enumerate(r)) + '</tr>' for r in rows)
    return f'<div class="dos-wrap wb-scroll" role="region" aria-label="{e(label)}" tabindex="0"><table class="bal-t dos-t"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'


def html_block(root, md_html):
    out = ['<section class="dos wb" aria-labelledby="wb-h"><h2 id="wb-h">🧪 Workbench</h2>',
           '<p class="dos-note">The balance workbench (package TOOLS1): <code>node tools/bench/bench.js contrib | skill | deck</code>, '
           'documented in <code>docs/workflows/balance.md</code>. Measurement only: nothing here changes a card, a deck or a price.</p>']
    sf = _newest(root, 'bench-skills-*.json')
    if sf:
        d = json.load(open(sf, encoding='utf-8')); y = d['yardstick']; R = d['ranked']; c = d['context']
        under = [r for r in R if r['confidence'] != 'low' and r['net'] > 0]; over = [r for r in R if r['confidence'] != 'low' and r['net'] < 0]
        out.append('<h3>Mispriced skills</h3>')
        out.append(f'<p class="dos-src">{e(os.path.relpath(sf, root))} · {e(d["generated"][:10])} · {len(R)} skills, {c["fights"]} fights a variant, {c["copies"]} copies in the slot · suggested prices: <code>{e(d.get("pricesFile") or "")}</code></p>')
        out.append('<div class="dos-tiles">'
                   f'<div class="dos-tile"><span class="dos-lab">1 budget point</span><b class="dos-val">{y["perPoint"] * 100:.2f}</b><small>win-rate points (± {y["se"] * 196:.2f})</small></div>'
                   f'<div class="dos-tile"><span class="dos-lab">1 Attack</span><b class="dos-val">{(y.get("attackInHealth") or 0):.1f}</b><small>Health, measured (budget: 2)</small></div>'
                   f'<div class="dos-tile"><span class="dos-lab">Under-priced</span><b class="dos-val">{len(under)}</b><small>medium or high confidence</small></div>'
                   f'<div class="dos-tile"><span class="dos-lab">Over-priced</span><b class="dos-val">{len(over)}</b><small>medium or high confidence</small></div></div>')
        out.append('<p class="dos-note">Worth = the skill\'s paired gain on the cards that carry it / the gain of one budget point (+1 Attack = 2, +1 Health = 1), '
                   'in budget points. Price = what the budget charges the carrier for it now. Net = worth − price: + under-priced, − over-priced. '
                   'Confidence: high |z| ≥ 2.5, medium ≥ 1.5; a low row is within the noise. Tap a heading to sort.</p>')
        rows = []
        for r in R:
            car = ', '.join(x['name'] + (' (vanilla)' if x['synthetic'] else '') for x in r['carriers'])
            pn = '; '.join(f'{p["n"]}: {_f1(p["worth"])} / {_f1(p["price"])}' for p in r['perN']) if len(r['perN']) > 1 else ''
            rows.append([(f'<b>{e(r["skill"])}</b><small>{e(car)}</small>' + (f'<small>per N: {e(pn)}</small>' if pn else ''), r['skill']),
                         (e(r['verdict']), {'under-priced': 2, 'over-priced': 0}.get(r['verdict'], 1)), (e(r['confidence']), {'high': 2, 'medium': 1}.get(r['confidence'], 0)),
                         (f'{_f1(r["worth"])} ± {r["worthCI"]:.1f}', r['worth']), (_f1(r['attackEq']), r['attackEq']), (_f1(r['price']), r['price']), (f'<b>{_f1(r["net"])}</b>', r['net']), (e(r['z']), r['z'] if r['z'] is not None else '')])
        out.append('<details open><summary><b>Every skill</b>, most mispriced first</summary>' + _table(['Skill', 'Verdict', 'Confidence', 'Worth (95%)', 'Attack-eq', 'Price now', 'Net', 'z'], rows, 'Skills: measured worth against price') + '</details>')
    else:
        out.append('<p class="dos-note">No skill run yet: <code>node tools/bench/bench.js skill --all</code>.</p>')
    cf = _newest(root, 'bench-contrib-global-*.json')
    if cf:
        d = json.load(open(cf, encoding='utf-8')); c = d['context']; f = d['fairLine']
        out.append('<h3>Value per budget point, every card</h3>')
        out.append(f'<p class="dos-src">{e(os.path.relpath(cf, root))} · {e(d["generated"][:10])} · {len(d["cards"])} cards, {c["fights"]} fights a card, {c["copies"]} copies against {c["copies"]} Blanks · median 95% ±{d["medianCI"] * 100:.1f} points</p>')
        out.append(f'<p class="dos-note">Per copy = the win-rate points one copy adds over a Blank (0/1, no skill). Value per budget point = per copy / N (hundredths of a point). Index = that / the median card (1.00 = typical). '
                   f'vs fair line = per copy minus the line every card\'s points fit (per copy = {_f1(f["intercept"], 100)} + {f["perN"] * 100:.3f} × N): + more than its budget buys, − less.</p>')
        rows = []
        for r in d['cards']:
            rows.append([(f'<b>{e(r["name"])}</b><small>{e(", ".join(r["skills"]) or "no skill")}</small>', r['name']), (e(r['rarity']), r['rarity']), (e(r['cost']), r['cost']), (f'{r["attack"]}/{r["health"]}', r['attack'] or 0), (e(r['N']), r['N']),
                         (f'{_f1(r["contribution"], 100)} ± {r["se"] * 196:.1f}', r['contribution']), (_f1(r['perCopy'], 100), r['perCopy']), (f'{r["vpb"] * 100:.2f}', r['vpb']), (f'{r["index"]:.2f}' if r['index'] is not None else '-', r['index'] if r['index'] is not None else ''),
                         (f'<b>{_f1(r["vsFair"], 100)}</b>', r['vsFair']), (e(r['z']), r['z'] if r['z'] is not None else '')])
        out.append('<details><summary><b>Every card</b> (' + str(len(rows)) + '), furthest above the fair line first</summary>' + _table(['Card', 'Rarity', 'Lumber', 'A/H', 'N', 'Contribution (95%)', 'Per copy', 'Value / pt', 'Index', 'vs fair line', 'z'], rows, 'Cards: value per budget point') + '</details>')
    else:
        out.append('<p class="dos-note">No card run yet: <code>node tools/bench/bench.js contrib --all</code>.</p>')
    decks = sorted(glob.glob(os.path.join(root, 'docs', 'balance', 'bench-deck-*.md')), key=os.path.getmtime, reverse=True)
    if decks:
        out.append('<h3>Focused decks</h3>' + ''.join(f'<details><summary><b>{e(os.path.basename(p))}</b></summary><div class="doc">{md_html(open(p, encoding="utf-8").read())}</div></details>' for p in decks))
    out.append('</section>')
    return ''.join(out)
