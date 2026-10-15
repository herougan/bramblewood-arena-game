#!/usr/bin/env python3
"""Export every player-facing English string to a spreadsheet (2026-10-15, user: "Regarding text in game, is there a way you
can offload it into a excel so I can edit the text from there? easier for both of us").

    python3 tools/text/export_texts.py [OUT.xlsx]        (default docs/game-texts.xlsx)

Columns: Key, Area, Where, Current text, New text (empty: the designer's column), Notes. Keyed rows (toast., dialog., coach.,
tutorial., results.) come from the TEXT table in bramblewood-texts.js; src: rows are literals still in arena_app.js or
arena_template.html. tools/text/import_texts.py applies the New text column back. See docs/game-texts-README.md.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import textlib as T

AREA_ORDER = ['Toasts', 'Dialogs', 'Tutorial / coach', 'Results', 'Home', 'Menus & navigation', 'Conquest map', 'Battle / cards',
              'Skills & effects', 'Camp / deck', 'Codex', 'Forge', 'Nest', 'Shop / market', 'Inventory / currency', 'Wildpaths',
              'Quests / progress', 'Arena / modes', 'Raid', 'Factions', 'Cards & collection', 'Speech & flavour', 'Dialogue',
              'Community', 'Settings / account', 'Page (static HTML)', 'Other UI', 'Admin / dev']
KEYED_NOTE = 'Keyed text (bramblewood-texts.js): changes everywhere this key is used.'


def collect(root=T.ROOT):
    rows = []
    table = T.load_table(root)
    uses, txvars = T.tx_uses(root, with_vars=True)
    src_cache = {}
    for key, text in table.items():
        area = T.KEY_AREA.get(key.split('.')[0], 'Other UI')
        where = uses.get(key, [])
        # admin-only call sites keep their keyed area but say so
        notes = [KEYED_NOTE]
        names = re.findall(r'\{(\w+)\}', text)
        if names:
            ex = dict(txvars.get(key, []))
            notes.append('Keep the {…} parts, the game fills them in: ' + '; '.join(
                '{%s}' % n + ('' if ex.get(n, n) == n else ' = ' + re.sub(r'\s+', ' ', ex[n])[:60]) for n in dict.fromkeys(names)) + '.')
        if not where:
            notes.append('Not used by the code at the moment.')
        rows.append({'key': key, 'area': area, 'where': where, 'text': text, 'notes': notes})
    for u in T.extract_units(root):
        notes = ['Text in the code: replaced where it stands.'] + u.notes
        if u.admin: notes.append('Admin / developer screens only.')
        if len(u.runs) > 1: notes.append('Appears %d times; all change together.' % len(u.runs))
        rows.append({'key': u.key, 'area': u.area, 'where': u.where, 'text': u.text, 'notes': notes})
    order = {a: i for i, a in enumerate(AREA_ORDER)}
    def where_sort(r):
        w = r['where'][0] if r['where'] else 'zz:0'
        m = re.match(r'([^:]+):(\d+)', w)
        return (m.group(1), int(m.group(2))) if m else (w, 0)
    rows.sort(key=lambda r: (order.get(r['area'], len(AREA_ORDER) - 2), 0 if not r['key'].startswith('src:') else 1, where_sort(r)))
    return rows


def write_xlsx(rows, out):
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter
    wb = Workbook()
    ws = wb.active
    ws.title = 'Game texts'
    F = 'Arial'
    head_fill = PatternFill('solid', fgColor='3B2F1E')
    input_fill = PatternFill('solid', fgColor='FFF2B3')     # the column to type in
    input_head = PatternFill('solid', fgColor='E0B04A')
    legend_fill = PatternFill('solid', fgColor='F4EEDF')
    thin = Side(style='thin', color='D9CFBA')
    cols = [('Key', 34), ('Area', 16), ('Where', 34), ('Current text', 64), ('New text', 64), ('Notes', 44)]
    # row 1: legend
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(cols))
    c = ws.cell(row=1, column=1, value=(
        'HOW TO USE: type your new wording in the yellow "New text" column (column E) and leave the rest alone. Leave New text empty '
        'to keep a line as it is. Keep anything in {curly brackets} (the game fills those in) and any <b>…</b> tags. Then send the '
        'file back; tools/text/import_texts.py applies it. Filter by Area to find a screen; "Where" says where it shows up in the code.'))
    c.font = Font(name=F, size=10, italic=True, color='3B2F1E')
    c.fill = legend_fill
    c.alignment = Alignment(wrap_text=True, vertical='center')
    ws.row_dimensions[1].height = 44
    # row 2: header
    for k, (name, width) in enumerate(cols, 1):
        h = ws.cell(row=2, column=k, value=name)
        h.font = Font(name=F, bold=True, color='3B2F1E' if name == 'New text' else 'FFFFFF', size=10)
        h.fill = input_head if name == 'New text' else head_fill
        h.alignment = Alignment(vertical='center', wrap_text=True)
        ws.column_dimensions[get_column_letter(k)].width = width
    ws.row_dimensions[2].height = 20
    # row 3: example (skipped by the importer)
    example = ['(example)', 'Dialogs', 'arena_app.js forfeit dialog', 'It counts as a loss. Quit instead keeps the fight so you can continue later.',
               'This counts as a loss. If you Quit instead, you can continue from where you left off.', 'An example of the format. The importer skips this row.']
    for k, v in enumerate(example, 1):
        e = ws.cell(row=3, column=k, value=v)
        e.font = Font(name=F, size=10, italic=True, color='8A7F6A')
        e.alignment = Alignment(wrap_text=True, vertical='top')
        e.border = Border(bottom=thin)
        if k == 5: e.fill = input_fill
    r = 4
    for row in rows:
        vals = [row['key'], row['area'], '\n'.join(row['where'][:6]) + ('\n…and %d more' % (len(row['where']) - 6) if len(row['where']) > 6 else ''),
                row['text'], None, ' '.join(row['notes'])]
        for k, v in enumerate(vals, 1):
            cell = ws.cell(row=r, column=k, value=v)
            cell.font = Font(name=F, size=10, color='6B6153' if k in (1, 3, 6) else '1F1A12')
            cell.alignment = Alignment(wrap_text=True, vertical='top')
            cell.border = Border(bottom=thin)
            if k == 5: cell.fill = input_fill
        r += 1
    ws.freeze_panes = 'A3'
    ws.auto_filter.ref = 'A2:%s%d' % (get_column_letter(len(cols)), r - 1)
    ws.sheet_view.zoomScale = 100
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    wb.save(out)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else os.path.join(T.ROOT, 'docs', 'game-texts.xlsx')
    rows = collect()
    write_xlsx(rows, out)
    keyed = sum(1 for x in rows if not x['key'].startswith('src:'))
    print('export: %d rows (%d keyed, %d text in the code) -> %s' % (len(rows), keyed, len(rows) - keyed, os.path.relpath(out, T.ROOT)))


if __name__ == '__main__':
    main()
