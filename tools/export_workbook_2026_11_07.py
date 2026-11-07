#!/usr/bin/env python3
# Owner workbook (2026-11-07, package ENG34, owner 19:25: "classify skills as melee or ranged ... Specify in the skills page for me, in
# the excel."): builds docs/exports/bramblewood-game-data.xlsx from the built game (index.html) and the canonical files:
#   Maps    every map and submap in unlock order (mapUnlockNumberOf)
#   Fights  every fight's enemy deck, level, rating and castle
#   Skills  every skill with its Delivery (melee / ranged / none, canonical/skill-delivery.json) and what its rider rides on
#   Cards Maps 0-20  docs/balance/bal25/card-power.json (BAL25 card power v3)
#   About   what each tab is and where it came from
# The game data comes from tools/export_gamedata.py's page script (read from that file, one source), run here in headless Chromium
# against index.html served from this checkout on a free local port. Build first: python3 assemble_arena.py && mv bramblewood-arena.html index.html
# Usage: python3 tools/export_workbook_2026_11_07.py [--json OUT.json]   (--json also keeps the raw dump)
import asyncio, datetime, functools, http.server, json, os, re, socketserver, sys, threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'exports', 'bramblewood-game-data.xlsx')


def page_script():
    src = open(os.path.join(ROOT, 'tools', 'export_gamedata.py'), encoding='utf-8').read()
    m = re.search(r'JS = r"""(.*?)"""', src, re.S)
    return m.group(1)


def dump():
    from playwright.async_api import async_playwright

    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
        def log_message(self, *a): pass

    class S(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, *a): pass  # the page closing mid-download (art) is not an error

    srv = S(('127.0.0.1', 0), H)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    async def run():
        async with async_playwright() as p:
            b = await p.chromium.launch()
            pg = await b.new_page()
            await pg.route(re.compile(r'^https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())  # offline: no Supabase, no CDN
            await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1')")
            await pg.goto('http://127.0.0.1:%d/index.html' % port)
            await pg.wait_for_timeout(3000)
            out = await pg.evaluate(page_script())
            await b.close()
            return json.loads(out)
    try:
        return asyncio.run(run())
    finally:
        srv.shutdown()


def build(d):
    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment, PatternFill
    from openpyxl.utils import get_column_letter
    F, FB = Font(name='Arial', size=10), Font(name='Arial', size=10, bold=True)
    fill = PatternFill('solid', fgColor='DDE7D4')
    wb = Workbook(); wb.remove(wb.active)

    def sheet(title, header, rows, widths):
        ws = wb.create_sheet(title)
        ws.append(header)
        for r in rows: ws.append(r)
        for c in ws[1]: c.font = FB; c.fill = fill; c.alignment = Alignment(vertical='top', wrap_text=True)
        for row in ws.iter_rows(min_row=2):
            for c in row: c.font = F; c.alignment = Alignment(vertical='top', wrap_text=isinstance(c.value, str) and len(c.value) > 40)
        for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
        ws.freeze_panes = 'B2'
        ws.auto_filter.ref = ws.dimensions
        return ws

    maps = sorted(d['maps'], key=lambda m: (m['unlockNo'] if m['unlockNo'] is not None else 9999, m['sub'], str(m['no'])))
    rank = {m['id']: i + 1 for i, m in enumerate(maps)}  # 1, 2, 3 ... in unlock order (a map and the submap it opens share mapUnlockNumberOf)
    byid = {m['id']: m for m in d['maps']}
    names = {c['id']: c['name'] for c in d['cards']}
    def no(mid): return byid[mid]['no'] if mid in byid else ''
    rows = []
    for m in maps:
        e = m.get('entry') or {}
        rows.append([rank[m['id']], str(m['no']), m['name'], 'Submap' if m['sub'] else 'Main', no(m['parent']) if m['parent'] else '',
                     no(m['unlockAfter']) if m['unlockAfter'] else '', e.get('afterMapCleared') or e.get('after') or '', e.get('label') or '',
                     len(m['nodes']), m['biome'], m['blurb']])
    sheet('Maps', ['Unlock order', 'Code', 'Map', 'Kind', 'Parent map no.', 'Opens with map no.', 'Opens after', 'Entry fight', 'Fights', 'Biome', 'Blurb'],
          rows, [8, 7, 28, 9, 9, 9, 16, 16, 7, 12, 70])

    def deck(dk): return ', '.join('%s ×%s' % (names.get(k, k), v) for k, v in dk.items())
    rows = []
    for m in maps:
        for n in m['nodes']:
            rows.append([rank[m['id']], str(m['no']), m['name'], n['code'], n['name'], n['kind'], n['enemyLevel'], n['rating'], n['castle'],
                         ', '.join(names.get(x, x) for x in n['leaders']), sum(int(v) for v in n['deck'].values() if str(v).isdigit()),
                         deck(n['deck']), ' | '.join(deck(w) for w in n['waves'])])
    sheet('Fights', ['Map order', 'Map code', 'Map', 'Fight', 'Fight name', 'Kind', 'Enemy level', 'Deck rating', 'Castle', 'Leader', 'Deck size', 'Enemy deck', 'Waves'],
          rows, [8, 7, 24, 8, 22, 10, 8, 8, 18, 16, 7, 80, 40])

    dl = json.load(open(os.path.join(ROOT, 'canonical', 'skill-delivery.json'), encoding='utf-8'))
    deliv, rides, notes, against = dl['delivery'], dl.get('rides', {}), dl.get('notes', {}), dl.get('against', {})
    count = {}
    for c in d['cards']:
        if c['token'] or c['test']: continue
        for k in set(c['effectKeys']) | {t.split(':')[1] for t in c['triggers'] if ':' in t}: count[k] = count.get(k, 0) + 1
    ride_txt = {'melee': 'every melee hit', 'ranged': 'every ranged hit', 'any': 'every hit', 'swing': 'its own swing only'}
    vs_txt = {'melee': 'melee hits at it', 'ranged': 'ranged hits at it', 'any': 'every hit at it'}
    def applies(k): return ride_txt.get(rides.get(k)) or vs_txt.get(against.get(k)) or ''
    rows = []
    for s in sorted(d['skills'], key=lambda s: ((s['label'] or s['key']).lower(), s['key'])):
        rows.append([s['label'] or s['key'], s['key'], deliv.get(s['key'], '?'), applies(s['key']), notes.get(s['key'], ''),
                     s['category'], s['kind'] or 'boolean', count.get(s['key'], 0), s['desc']])
    for a in d['actions']:
        k = 'action:' + a['key']
        if k in deliv:
            rows.append([a['label'] + ' (custom action)', k, deliv[k], applies(k), notes.get(k, ''), 'action', '', count.get(a['key'], 0), a['desc']])
    sheet('Skills', ['Skill', 'Key', 'Delivery', 'Its effect applies to', 'Delivery note', 'Category', 'Type', 'Cards with it', 'Description (N = the skill number)'],
          rows, [20, 18, 10, 18, 40, 10, 10, 8, 90])

    cp = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'bal25', 'card-power.json'), encoding='utf-8'))
    cards = {c['id']: c for c in d['cards']}
    mapname = {m['no']: m['name'] for m in d['maps'] if not m['sub']}
    rows = []
    for r in sorted(cp['rows'], key=lambda r: r['name']):
        c = cards.get(r['id'], {})
        rows.append([r['name'], r.get('map'), mapname.get(r.get('map'), ''), r['rarity'], r['cost'], r['wait'], r['attack'], r['health'],
                     c.get('species', ''), c.get('types', ''), '; '.join(c.get('abilities', [])), r.get('N'), r.get('power'), r.get('forBudget'),
                     r.get('winRate'), r.get('advRate'), c.get('where', '')])
    sheet('Cards Maps 0-20', ['Card', 'Obtainable from map', 'Map', 'Rarity', 'Cost', 'Wait', 'Attack', 'Health', 'Species', 'Types', 'Skills',
                              'Budget N', 'Power', 'Power for budget', 'Basic win %', 'Advanced win %', 'Where to get'],
          rows, [24, 9, 22, 10, 6, 6, 7, 7, 12, 14, 60, 8, 8, 9, 9, 9, 30])

    nd = {k: sum(1 for s in d['skills'] if deliv.get(s['key']) == k) for k in ('melee', 'ranged', 'none')}
    ws = wb.create_sheet('About')
    for line in [
        'Bramblewood Arena game data, exported %s from the built game (tools/export_workbook_2026_11_07.py).' % datetime.date.today().isoformat(),
        'Maps: all %d maps and submaps in unlock order.' % len(d['maps']),
        "Fights: every fight's enemy deck (card ×copies), enemy level, deck rating, castle and leader.",
        'Skills: %d skills. Delivery: melee %d, ranged %d, none %d (canonical/skill-delivery.json; the engine reads it).' % (len(d['skills']), nd['melee'], nd['ranged'], nd['none']),
        'Melee = a swing or contact strike (the lane attack, Twin Strike, Pounce, Cleave, Ambush...). Ranged = a shot, throw or remote hit (Arrow, the Bolts, Missile, Boomerang, Fireball...). None = no hit of its own (auras, Armor, Regeneration, field and tick damage).',
        '"Its effect applies to": for an on-hit effect, which hits carry it (Bleed and Venom: every melee hit; Fletcher: every ranged hit); for a defence, which hits it answers (Thorns: melee hits at it; Reflect: ranged hits at it).',
        'Cards Maps 0-20: BAL25 card power v3 (%s, %s games a card), docs/balance/bal25/card-power.json.' % (cp.get('generated'), cp.get('games')),
    ]:
        ws.append([line])
    for c in ws['A']: c.font = F
    ws['A1'].font = FB
    ws.column_dimensions['A'].width = 140
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    wb.save(OUT)
    print('wrote', OUT, {ws.title: ws.max_row - 1 for ws in wb})


if __name__ == '__main__':
    data = dump()
    if '--json' in sys.argv:
        json.dump(data, open(sys.argv[sys.argv.index('--json') + 1], 'w'), ensure_ascii=False)
    if '--dump-only' not in sys.argv:
        build(data)
