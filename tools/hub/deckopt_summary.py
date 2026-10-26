#!/usr/bin/env python3
"""The summary panel at the top of the hub's 🧬 Deck optimizer tab (package HUB6, 2026-10-26; owner 10-26 11:19: "Summary of Deck Optimisation at
the top, with all 3 reservation decks and their win rate. Or you've been using ELO - what does ELO mean - you can list that too.").

  summary_html(root, canon, tix, cols, rows)   static HTML (the tab is lazy, so no script has to run to see it); deckopt_summary.js only
                                               adds the map picker and the table sort, by event delegation, and deckopt_summary.css styles it.
Every number is read from a file at hub-build time and names that file under it. Read-only: nothing here writes a file.
  Map reference   arena_app.js WINRATE_REF_DECKS (the deck per map), docs/balance/skirmish-pass-ai3-after-map.jsonl (AI3's "after" fights)
  Reference-2     docs/balance/ref/ref2-owner-main-deck-2026-10-25.json, docs/balance/skirmish-pass-ai3-after-ref2.jsonl
  vs PRO / BPRO   docs/balance/pro-ease-2026-10-25.json
  per-map optimum docs/balance/opt/deckopt-map*-2026-10-25-pro3-maptrue.json"""
import glob, html as H, json, math, os, re, statistics as st

AI3_MD = 'docs/balance/ai3-2026-10-26.md'
AI3_MAP = 'docs/balance/skirmish-pass-ai3-after-map.jsonl'
AI3_REF2 = 'docs/balance/skirmish-pass-ai3-after-ref2.jsonl'
PE = 'docs/balance/pro-ease-2026-10-25.json'
REF2 = 'docs/balance/ref/ref2-owner-main-deck-2026-10-25.json'
e = lambda s: H.escape(str(s), quote=True)
pc = lambda v, d=1: ('%.' + str(d) + 'f%%') % v


def _jl(root, rel):
    with open(os.path.join(root, rel), encoding='utf-8') as f:
        return [json.loads(l) for l in f if l.strip()]


def _js(root, rel):
    with open(os.path.join(root, rel), encoding='utf-8') as f:
        return json.load(f)


def _mean(xs):
    xs = list(xs)
    return st.mean(xs) if xs else None


def elo(p):  # a win rate as Elo points, the deck optimizer's own formula (tools/opt/deckopt.js: 400 log10(p / (1 - p)))
    return 400 * math.log10(p / (1 - p))


def _deck_list(counts, names, tix, cols, rows, leader=None):
    def th(cid):
        t = tix.get(cid, -1)
        if t < 0: return '<span class="ct-th ct-noart dos-th" aria-hidden="true"></span>'
        x = (t % cols) / (cols - 1) * 100 if cols > 1 else 0
        y = (t // cols) / (rows - 1) * 100 if rows > 1 else 0
        return f'<span class="ct-th dos-th" style="background-image:url(cards-thumbs.webp);background-size:{cols * 100}% {rows * 100}%;background-position:{x:.3f}% {y:.3f}%" aria-hidden="true"></span>'
    out = ['<ul class="dos-cards">']
    if leader:
        out.append(f'<li class="dos-lead">{th(leader)}<span><b>{e(names.get(leader, leader))}</b><small>leader</small></span></li>')
    for cid, n in sorted(counts.items(), key=lambda kv: (-kv[1], names.get(kv[0], kv[0]))):
        out.append(f'<li>{th(cid)}<span><b>{e(names.get(cid, cid))}</b><small>&times;{n}</small></span></li>')
    out.append('</ul>')
    return ''.join(out)


def _runs(level_by_map):  # {0:0, 1:0, ... 11:3} -> "Lv 0: Maps 0-10; Lv 3: Maps 11-15 ..."
    out, cur = [], None
    for m in sorted(level_by_map):
        lv = level_by_map[m]
        if cur and cur[0] == lv and cur[2] == m - 1: cur[2] = m
        else:
            cur = [lv, m, m]; out.append(cur)
    lab = lambda lv: ('%g' % lv)
    return '; '.join(f'Lv {lab(lv)}: {"Map " + str(a) if a == b else "Maps %d-%d" % (a, b)}' for lv, a, b in out)


def _tile(label, value, sub):
    return f'<div class="dos-tile"><span class="dos-lab">{e(label)}</span><b class="dos-val">{value}</b><small>{sub}</small></div>'


def summary_html(root, canon, tix, cols, rows):
    names = {c['id']: c.get('name', c['id']) for c in canon}
    ai_map, ai_ref2 = _jl(root, AI3_MAP), _jl(root, AI3_REF2)
    pe = _js(root, PE)
    ref2 = _js(root, REF2)
    wr = lambda rs, f=lambda r: True: _mean(r['win'] for r in rs if f(r))
    pe_stat = lambda ref, kind: [r for r in pe['rows'] if r['ref'] == ref and r['kind'] == kind]
    pe_txt = lambda ref: (
        '<div class="dos-tiles">'
        + ''.join(_tile('vs ' + k.upper(), pc(100 * _mean(r['win'] for r in pe_stat(ref, k))), f'{len(pe_stat(ref, k))} pairings; {sum(1 for r in pe_stat(ref, k) if r["easy"])} over 85%') for k in ('pro', 'bpro'))
        + '</div>'
        + f'<p class="dos-all">Pairings over 85%: <b>{sum(1 for r in pe["rows"] if r["ref"] == ref and r["easy"])}</b> of {sum(1 for r in pe["rows"] if r["ref"] == ref)}.</p>'
        + f'<p class="dos-src">Source: <code>{PE}</code> (file dated 2026-10-25, generated {e(pe["generated"][:10])}; {pe["settings"]["games"]} games a pairing, CPU on Smart, every PRO deck at Level 1). Mean of the pairings\' win rates.</p>')
    road_txt = lambda rs, label_path: (
        '<div class="dos-tiles">'
        + _tile('Road, Maps 0-20', pc(wr(rs)), f'{len(rs)} fights, new-player mean')
        + _tile('vs Basic CPU', pc(wr(rs, lambda r: r['cpu'] == 0)), f'{sum(1 for r in rs if r["cpu"] == 0)} fights')
        + _tile('vs Smart CPU', pc(wr(rs, lambda r: r['cpu'] == 1)), f'{sum(1 for r in rs if r["cpu"] == 1)} elite / boss fights')
        + '</div>'
        + f'<p class="dos-src">Source: <code>{AI3_MD}</code> (2026-10-26, package AI3, the "after" numbers); fights in <code>{label_path}</code>. 40 games a fight, seeds 9100 + 37g. One fight is about &plusmn;15 points at 40 games, so read the mean.</p>')

    # ---- the map reference: one deck per map, picked with the selector
    app = open(os.path.join(root, 'arena_app.js'), encoding='utf-8').read()
    wrd = json.loads(re.search(r'const WINRATE_REF_DECKS = (\{.*?\});\n', app).group(1))
    pe_side = {m['id']: m['side'] for m in pe['maps']}
    lvl = {}
    for r in pe['rows']:
        if r['ref'] == 'map' and not pe_side.get(r['mapId']): lvl[r['map']] = r['level']  # a side map counts as the map it opens on, so only main maps give the level of their own number
    panels = []
    for n in range(0, 21):
        deck = wrd['starter'] if n == 0 else wrd['road'][str(n)]
        rs = [r for r in ai_map if r['mapNo'] == n]
        pr = [r for r in pe['rows'] if r['ref'] == 'map' and r['map'] == n]
        panels.append(
            f'<div class="dos-mapdeck" data-dsmap="{n}"{"" if n == 0 else " hidden"}>'
            f'<p class="dos-meta">Map {n}: {sum(deck.values())} cards, played at <b>Level {lvl.get(n, 0):g}</b>, no leader.</p>'
            + _deck_list(deck, names, tix, cols, rows)
            + f'<p class="dos-here"><b>This map:</b> road {pc(wr(rs))} over {len(rs)} fights (the map and its side maps)'
            + (f'; vs PRO / BPRO {pc(100 * _mean(r["win"] for r in pr))} over {len(pr)} pairings (with side maps)' if pr else '') + '.</p></div>')
    sel = '<label class="dos-pick">Show the deck of <select id="dosMapSel" aria-label="Map reference deck for map">' + ''.join(f'<option value="{n}">Map {n}</option>' for n in range(21)) + '</select></label>'
    card_map = (
        '<article class="dos-deck"><div class="dos-hd"><h3>Map reference</h3><p>The deck the balance tools stand in for: Base cards plus every earlier main map\'s rewards, no packs; Map 0 plays the Otter starter. '
        'Played at the road CPU\'s level, Smart, against a plain 30-Health bramble.</p></div>'
        + sel + ''.join(panels)
        + f'<p class="dos-sched"><b>Level schedule:</b> {e(_runs(lvl))} (<code>referencePlayerLevel</code>; the Forge opens on Map 11).</p>'
        + '<h4>Win rates</h4>' + road_txt(ai_map, AI3_MAP) + pe_txt('map') + '</article>')

    # ---- Reference-2: the Ant Deck
    sc = ref2['schedule']
    card_ref2 = (
        '<article class="dos-deck"><div class="dos-hd"><h3>Reference-2</h3><p>The owner\'s Ant Deck, read from the main account on 2026-10-25.</p></div>'
        f'<p class="dos-meta">{sum(ref2["counts"].values())} cards + leader, <code>{e(os.path.basename(REF2))}</code>.</p>'
        + _deck_list(ref2['counts'], names, tix, cols, rows, ref2['leader'])
        + f'<p class="dos-sched"><b>Level schedule</b> (owner 10-25 22:36): Map 0, every card at Level 0; from Map {sc["fromMap"]} on, {sc["perMap"]} different copies gain +1 level after each map (seeded, so Map N always gives the same deck): +25 levels at Map 5, +50 at Map 10, about +100 at Map 20. The simulations leave out the leader (the harness has none).</p>'
        '<h4>Win rates</h4>' + road_txt(ai_ref2, AI3_REF2) + pe_txt('ref2') + '</article>')

    card_ref3 = (
        '<article class="dos-deck dos-pending"><div class="dos-hd"><h3>Reference-3</h3><p><b>Pending: waiting for the second account\'s deck.</b></p></div>'
        '<p>The second account\'s main deck: the rares and above swapped for House Cats, and 1 rare returned a map from Map 4. That account has nothing on the server yet, '
        'so the deck waits for the owner to sign in and save it, or to send the list. Until then no result may quote a Reference-3 number.</p>'
        '<p class="dos-src">Source: <code>docs/evaluation-protocol.md</code> section 2 (REF-3).</p></article>')

    # ---- what is Elo
    pts = [50, 55, 60, 64, 70, 76, 80, 85, 90, 95, 99]
    pt_rows = ''.join(f'<tr><td class="num">{p}%</td><td class="num">{"0" if p == 50 else "+%d" % round(elo(p / 100))}</td></tr>' for p in pts)
    elo_box = (
        '<section class="dos-elo"><h3>What is Elo?</h3>'
        '<p>Elo is a <b>rating gap made from a win rate</b>. Two decks that win half of their head-to-head games are 0 points apart. The more often one wins, the bigger the gap: '
        'a <b>200-point</b> gap means the stronger deck wins about <b>76%</b> of the games, <b>100 points</b> about <b>64%</b>, and <b>400 points</b> about <b>10 games to 1</b>. '
        'The formula is <code>400 &times; log10(p / (1 &minus; p))</code> for a win rate p.</p>'
        '<ul><li><b>"X points below the optimum"</b> is how much weaker a deck is than the best deck the optimizer found for that map: the optimum\'s head-to-head win rate against the deck, turned into points.</li>'
        '<li><b>The difficulty ladder</b> picks decks at set Elo gaps below the optimum: <b>600 / 450 / 300 / 150</b> points (<code>--ladder 600,450,300,150</code>), so the ladder runs from a deck the optimum nearly always beats to one it beats only a little more than half the time.</li>'
        '<li><b>The game\'s PvP rating</b> is an Elo rating too: a win moves it by Elo with K = 24 (report FIX3, decision G22).</li></ul>'
        '<div class="bal-wrap dos-eloT"><table class="bal-t"><caption class="sr-only">Win rate and Elo gap</caption><thead><tr><th scope="col">Win rate</th><th scope="col">Elo gap</th></tr></thead><tbody>' + pt_rows + '</tbody></table></div>'
        '<p class="dos-src">Source: <code>tools/opt/deckopt.js</code> (<code>elo()</code>, the ladder), <code>docs/evaluation-protocol.md</code>; K from <code>docs/decisions.md</code> (G22).</p></section>')

    # ---- per-map table
    bymap = {}
    for r in ai_map: bymap.setdefault(r['map'], []).append(r)
    r2map = {}
    for r in ai_ref2: r2map.setdefault(r['map'], []).append(r)
    pe_by = {m['id']: m for m in pe['maps']}
    opt_rows = []
    for fp in sorted(glob.glob(os.path.join(root, 'docs', 'balance', 'opt', 'deckopt-map*-2026-10-25-pro3-maptrue.json'))):
        d = _js(root, os.path.relpath(fp, root))
        mid = d['map']['id']
        score = d['optima'][0]['score'] if d.get('optima') else None
        rd = d.get('road') or []
        road = _mean(x['optimum'] for x in rd)
        h2h = [g['h2h'] for g in d.get('gap') or [] if g.get('h2h') is not None]
        opt_rows.append((d['map'].get('num', pe_by.get(mid, {}).get('map', 0)), mid, d['map']['name'], score, road, st.median(h2h) if h2h else None, os.path.basename(fp)))
    opt_rows.sort(key=lambda x: (x[0], x[1]))
    cell = lambda v, txt=None: f'<td class="num" data-v="{"" if v is None else round(v, 4)}">{txt if txt is not None else ("&ndash;" if v is None else pc(100 * v))}</td>'
    body = []
    for no, mid, name, score, road, h2h, fn in opt_rows:
        mrs, rrs = bymap.get(mid, []), r2map.get(mid, [])
        pm = pe_by.get(mid, {}).get('refs', {})
        body.append(
            f'<tr><td data-v="{no:02d} {e(name)}"><b>{e(name)}</b><small>Map {no} &middot; <code>{e(mid)}</code></small></td>'
            + cell(score) + cell(road) + cell(h2h)
            + cell(wr(mrs) / 100 if mrs else None) + cell(wr(rrs) / 100 if rrs else None)
            + cell(pm.get('map', {}).get('mean')) + cell(pm.get('ref2', {}).get('mean')) + '</tr>')
    heads = ['Map', 'Optimum score', 'Optimum on the road', 'Optimum vs the fight decks', 'Map ref road', 'Ref-2 road', 'Map ref vs PRO / BPRO', 'Ref-2 vs PRO / BPRO']
    tbl = (
        '<section class="dos-maps"><h3>Per map</h3>'
        '<p class="dos-note">Click a heading to sort. <b>Optimum</b> = the best deck the optimizer found for the map (map-true pool, Level 1): its gauntlet score, its win rate on the map\'s road fights, and its median head-to-head win rate against the fight decks. '
        '<b>Map ref / Ref-2 road</b> = that reference deck\'s mean win rate on the map\'s fights (AI3, 2026-10-26, side maps listed on their own row). <b>vs PRO / BPRO</b> = the same deck against the map\'s PRO and BPRO decks (pro-ease, 2026-10-25).</p>'
        '<div class="bal-wrap dos-wrap"><table class="bal-t dos-t"><thead><tr>' + ''.join(f'<th scope="col" tabindex="0" role="columnheader" aria-sort="none" data-dsk="{i}">{e(h)}</th>' for i, h in enumerate(heads)) + '</tr></thead><tbody>'
        + ''.join(body) + '</tbody></table></div>'
        f'<p class="dos-src">Sources: <code>docs/balance/opt/deckopt-map*-2026-10-25-pro3-maptrue.json</code> ({len(opt_rows)} entries, 2026-10-25, package PRO3), <code>{AI3_MAP}</code> and <code>{AI3_REF2}</code> (2026-10-26), <code>{PE}</code>.</p></section>')

    return (
        '<section class="dos" aria-label="Deck optimisation summary"><h2>Summary</h2>'
        '<p class="lede">The three reference decks (the players the balance tools stand in for), how they fare, and what the Elo numbers in the results below mean.</p>'
        '<div class="dos-decks">' + card_map + card_ref2 + card_ref3 + '</div>' + elo_box + tbl + '</section>')
