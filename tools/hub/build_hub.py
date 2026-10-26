#!/usr/bin/env python3
"""Builds the Bramblewood hub artifact in .hub/: one page with tabs for the Master doc,
the Effects Lab and the Visual Library, plus links to every other related page.
    python3 tools/hub/build_hub.py   (run tools/effects-lab/build.py first)
The artifact limit is 511 files per version, so near-duplicate screenshots are pruned
(perceptual hash, same area) until the whole hub fits."""
import json, os, re, shutil, sys, html as H
import markdown
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, '.hub'); FX = os.path.join(ROOT, '.fxcat'); VL = os.path.join(ROOT, '.vislib')
MAX_FILES = 495
HUB_URL = os.environ.get('HUB_URL', '')
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)

# 1) Effects Lab: copy the built page and its assets at the hub root.
lab_files = []
for dp, _, fs in os.walk(FX):
    for f in fs:
        rel = os.path.relpath(os.path.join(dp, f), FX)
        if rel in ('build.py', 'cards.json', 'fx-src.js', 'effects-test.html'): continue
        os.makedirs(os.path.dirname(os.path.join(OUT, rel)) or OUT, exist_ok=True)
        shutil.copy(os.path.join(FX, rel), os.path.join(OUT, rel)); lab_files.append(rel)
lab = open(os.path.join(OUT, 'effects.html'), encoding='utf-8').read()
if '<meta charset' not in lab[:400]:
    lab = lab.replace('<head>', '<head><meta charset="utf-8">', 1) if '<head>' in lab else '<meta charset="utf-8">' + lab
def doc(h):
    h = re.sub(r'^\s*<!doctype html>\s*', '', h, flags=re.I)
    head = ''
    if '<meta charset' not in h[:3000].lower(): head += '<meta charset="utf-8">\n'
    if 'name="viewport"' not in h[:3000]: head += '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    return '<!doctype html>\n' + head + h
open(os.path.join(OUT, 'effects.html'), 'w', encoding='utf-8').write(doc(lab))

# 2) Visual Library: prune near-duplicates so the whole hub fits under the file limit.
page = open(os.path.join(VL, 'visual-library.html'), encoding='utf-8').read()
raw = json.loads(re.search(r'const RAW = (\[.*?\]);\n', page, re.S).group(1))
def dhash(p):
    im = Image.open(p).convert('L').resize((17, 16)); px = im.load()
    return sum(1 << (y*16+x) for y in range(16) for x in range(16) if px[x, y] > px[x+1, y])
budget = MAX_FILES - len(lab_files) - 3 - 1  # 2026-10-15: -1 for the card thumbnail sheet (cards-thumbs.webp)
keepers = {'detail_before_desk', 'detail_after_desk'}
for r in raw: r.append(dhash(os.path.join(VL, 'img', r[0] + '.webp')))
order = sorted(raw, key=lambda r: (r[3], r[4]), reverse=True)
for thr in range(4, 40, 2):
    kept = []
    for r in order:
        protected = r[2].startswith('Card review') or r[1] in keepers or r[1].startswith('cards_')
        if not protected and any(k[2] == r[2] and bin(k[8] ^ r[8]).count('1') <= thr for k in kept): continue
        kept.append(r)
    if len(kept) <= budget: break
kept_ids = {r[0] for r in kept}
raw2 = [r[:8] for r in raw if r[0] in kept_ids]
print(f'library: {len(raw)} -> {len(raw2)} shots (threshold {thr})')
page = re.sub(r'const RAW = \[.*?\];\n', lambda m: 'const RAW = ' + json.dumps(raw2, separators=(',', ':')) + ';\n', page, count=1, flags=re.S)
page = page.replace('the most one page can hold', 'near-duplicates pruned to fit').replace('</style>', '.lb[hidden]{display:none !important;}</style>', 1)
open(os.path.join(OUT, 'library.html'), 'w', encoding='utf-8').write(doc(page))
os.makedirs(os.path.join(OUT, 'img'))
for r in raw2: shutil.copy(os.path.join(VL, 'img', r[0] + '.webp'), os.path.join(OUT, 'img', r[0] + '.webp'))

# 3) Master doc, rendered. Links to the hub's own tabs switch tabs; links to other .md docs become plain names.
def md_html(md):
    # Python-Markdown needs a blank line before a list; GitHub doesn't. Add one where a list starts
    # right under a paragraph (also inside blockquotes), and indent nested items to 4 spaces.
    lines, prev = [], ''
    for ln in md.split('\n'):
        m = re.match(r'^(>\s?)?(\s*)([-*]|\d+\.)\s', ln)
        if m:
            q, ind = m.group(1) or '', m.group(2)
            ln = q + ' ' * (len(ind) * 2) + ln[len(q) + len(ind):]
            pm = re.match(r'^(>\s?)?\s*([-*]|\d+\.)\s', prev)
            if not pm and prev.strip() not in ('', '>'): lines.append(q.rstrip() if q else '')
        lines.append(ln); prev = ln
    body = markdown.markdown('\n'.join(lines), extensions=['tables', 'sane_lists', 'fenced_code'])
    body = re.sub(r'<a href="(?!https?:|#)([^"#]+\.md)[^"]*">(.*?)</a>', r'<span class="doc-ref" title="Project doc: claude/\1">\2</span>', body)
    body = body.replace('href="https://claude.ai/artifact/XDiA1b9zrLfM1UNFCFTpFE"', 'href="#lab" data-tab="lab"')
    body = body.replace('href="https://claude.ai/artifact/1u6czN5TbFBN4zwisxECKU"', 'href="#library" data-tab="library"')
    if HUB_URL: body = body.replace(f'href="{HUB_URL}"', 'href="#master" data-tab="master"')
    body = body.replace('href="decisions.md"', 'href="#decisions" data-tab="decisions"')
    return re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', body)
rd = lambda *p: open(os.path.join(ROOT, *p), encoding='utf-8').read()
# 2026-10-15 (user: "improve the master hub"): helpers for the dashboard, lazy panels and the global search.
# _txt strips tags; anchor() gives every h1-h3 an id (prefix-hN) and returns (id, heading, text) sections that the
# search index points at; split_h2() cuts a markdown file at its "## " headings.
SEARCH = []  # [type, label, sub, haystack, jump]; jump = {tab, sub?, el?, dec?}
def _txt(h): return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()
def anchor(html, prefix):
    k = [0]
    def rep(m):
        k[0] += 1; return f'<{m.group(1)} id="{prefix}-h{k[0]}"{m.group(2)}>'
    html = re.sub(r'<(h[1-3])((?:\s[^>]*)?)>', rep, html)
    secs = []
    for p in re.split(r'(?=<h[1-3] id=")', html):
        m = re.match(r'<h[1-3] id="([^"]+)"[^>]*>(.*?)</h[1-3]>', p, re.S)
        if m: secs.append((m.group(1), _txt(m.group(2)), _txt(p[m.end():])))
    return html, secs
def split_h2(md):
    parts = re.split(r'(?m)^## ', md)
    return parts[0], [(p.partition('\n')[0].strip(), p.partition('\n')[2]) for p in parts[1:]]
def lazy(html):  # 2026-10-15: heavy panels ship inside <template> and are stamped out the first time the tab opens
    return '<template class="lazy">' + html + '</template>'
# 2026-10-09 (user: "Summarise all the most important action items in the master artefact. Remove the
# master md, don't use it"): the landing tab is the short Action items list; MASTER.md is retired from the hub.
# 2026-10-15: the landing tab is now the 🏠 Home dashboard; the full Action items doc has its own tab, cut into
# one section per "## " heading (ids ai-N) so the dashboard and the search can point into it.
_ai_fix = lambda h: h.replace('<span class="doc-ref" title="Project doc: claude/card-balance-2026-10-09.md">report</span>', '<a href="#balance" data-tab="balance">report</a>')
_ai_intro, _ai_secs = split_h2(rd('docs', 'action-items.md'))
AI = [(t, _ai_fix(md_html(b))) for t, b in _ai_secs]
body = _ai_fix(md_html(_ai_intro)) + ''.join(f'<section class="ai-sec" id="ai-{k}"><h2>{H.escape(t)}</h2>{b}</section>' for k, (t, b) in enumerate(AI))
for k, (t, b) in enumerate(AI): SEARCH.append(['Action items', t, '', _txt(b)[:6000], {'tab': 'actions', 'el': f'ai-{k}'}])
_ai_updated = (re.search(r'_Updated ([^._]+)', _ai_intro) or [None, ''])[1]
BAL = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'card-balance.json'), encoding='utf-8'))
bal_json = json.dumps({'games': BAL['games'], 'generated': BAL['generated'], 'rows': [{k: r.get(k) for k in ('id','name','rarity','cost','wait','attack','health','skills','winRate','band','verdict','source','suggest','suggestRarity')} for r in BAL['rows']]}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
# 2026-10-15: one collapsible block per changelog entry (newest three open) instead of one 80,000px page.
_cl_intro, _cl_secs = split_h2(rd('docs', 'CHANGELOG.md'))
CL = [(t, md_html(b)) for t, b in _cl_secs]
changelog = md_html(_cl_intro) + '<p class="cl-tools"><button type="button" data-cl="open">Open all</button> <button type="button" data-cl="close">Close all</button></p>' + ''.join(f'<details class="cl" id="cl-{k}"{" open" if k < 3 else ""}><summary>{H.escape(t)}</summary><div class="cl-b">{b}</div></details>' for k, (t, b) in enumerate(CL))
for k, (t, b) in enumerate(CL): SEARCH.append(['Changelog', t, '', _txt(b)[:8000], {'tab': 'changelog', 'el': f'cl-{k}'}])
# 2026-10-11 (user: "fight against EVERY single Skirmish ... and publish the win rate in our artefact"): the 📈 Difficulty
# tab is its own plain file (no f-string braces), filled with docs/balance/difficulty-curve.json.
_curve_path = os.path.join(ROOT, 'docs', 'balance', 'difficulty-curve.json')
_curve_json = open(_curve_path, encoding='utf-8').read() if os.path.exists(_curve_path) else 'null'
sys.path.insert(0, os.path.join(ROOT, 'tools', 'hub'))
curve_panel = open(os.path.join(ROOT, 'tools', 'hub', 'curve_tab.html'), encoding='utf-8').read().replace('__CURVE__', json.dumps(json.loads(_curve_json), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')).replace('__ROAD__', json.dumps(__import__('hub5_data').road(ROOT), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))  # 2026-10-25 (package HUB5, H1): the road check

# 4) Claude's guide: standing instructions, skills, and the docs to read before a task.
RULES = [
  'End every update with this hub in view: publish it and open it. The 🎯 Action items tab is the summary (MASTER.md is retired, 2026-10-09).',
  'Never buy PixelLab, Supabase or Vercel credits or plans without explicit approval.',
  'T3 (server-checked fights) is applied only when you say "apply it".',
  'Never use the watermarked stock image.',
  'Your email identifies you only; it is never sent to another service unless you ask.',
  'Think contextually: a label leaves out what its position already says.',
  'Work autonomously on "continue"; push back honestly; keep reports short.',
]
SKILLS = sorted(f for f in os.listdir(os.path.join(ROOT, 'docs', 'skills')) if f.endswith('.md'))
def skill_card(f):
    t = rd('docs', 'skills', f); fm = re.match(r'---\n(.*?)\n---\n', t, re.S)
    meta = dict(re.findall(r'^(\w+):\s*(.*)$', fm.group(1), re.M)) if fm else {}
    return (f'<details class="card"><summary><b>/{H.escape(meta.get("name", f[:-3]))}</b><small>{H.escape(meta.get("description", ""))}</small></summary>'
            f'<div class="doc">{md_html(t[fm.end():] if fm else t)}</div></details>')
GUIDE = [  # (task, doc file, source)
  ('Any design work (start here)', 'game-design-standard.md', 'guide'),
  ('Any visual or UX change', 'style-guideline.md', 'guide'),
  ('A new mechanic, skill or status', 'mechanics-guideline.md', 'guide'),
  ('Build, new source file, deploy', 'context-architecture-pipeline.md', 'guide'),
  ('Combat rules and the engine', 'context-combat-engine.md', 'guide'),
  ('Currencies, rewards, levels', 'context-economy-progression.md', 'guide'),
  ('Screens, layout, phone sizes', 'context-ui-layout.md', 'guide'),
  ('Animation and effects', 'context-vfx-animation.md', 'guide'),
  ('Sound', 'context-audio.md', 'guide'),
  ('Sound cue list', 'sfx-cue-sheet.md', 'docs'),
  ('Card art (PixelLab)', 'pixellab-art-batch-status.md', 'guide'),
  ('Testing', 'testing-strategy.md', 'docs'),
  ('Translations', 'i18n.md', 'docs'),
  ('Lore, names, rival lines', 'lore-bible.md', 'docs'),
  ('Anything waiting on a decision', 'decisions.md', 'docs'),
]
def doc_src(f, src):
    pth = os.path.join(ROOT, '.guide-src' if src == 'guide' else 'docs', f)
    return open(pth, encoding='utf-8').read() if os.path.exists(pth) else None
rows = ''.join(f'<tr><td>{H.escape(t)}</td><td><a href="#doc-{f[:-3]}" class="jump">claude/{f}</a></td></tr>' for t, f, _ in GUIDE)
docs_html = ''
for t, f, src in GUIDE:
    txt = doc_src(f, src)
    if txt is None: continue
    _h, _secs = anchor(md_html(txt), f'doc-{f[:-3]}')  # 2026-10-15: searchable sections
    for sid, st, sx in _secs: SEARCH.append(['Guide', st, f'claude/{f}', sx[:4000], {'tab': 'guide', 'sub': f'doc-{f[:-3]}', 'el': sid}])
    docs_html += f'<div class="subpane" data-group="guide" id="doc-{f[:-3]}" hidden><h3>claude/{f} <small class="note">read before: {H.escape(t[0].lower() + t[1:])}</small></h3><div class="doc">{_h}</div></div>'
skills_html = ''.join(skill_card(f) for f in SKILLS)
# Design tab (2026-10-09, user: "In our master artefact, come up with skills and effects + audit what we
# have"; "write down your ideas or my ideas in the master sheet in the design section"): the design
# sheets and audits, newest first, each a collapsible card (the first one open).
DESIGN = [
  ('Fields, day and night, Lumber from cards', 'fields-and-day-night-2026-10-09.md'),
  ('Starter decks: every Basic card, for reorganising', 'starter-decks-2026-10-10.md'),
  ('Card levels: base level and growth schedule', 'card-levels-2026-10-10.md'),
  ('Card types: species, phyla and hybrids', 'card-types-2026-10-10.md'),
  ('Inspiration: Super Auto Pets and Tooth and Nail units', 'inspo-sap-tooth-and-nail-2026-10-10.md'),
  ('GSAP, textures, shaders and VFX: where to take them', 'vfx-exploration-2026-10-10.md'),
  ('Forge pacing, Blacksmith, Nest, Changelings, Scale Trail', 'forge-economy-2026-10-11.md'),
  ('Introducing stats and mechanics along the road', 'mechanics-onramp-2026-10-11.md'),
  ('Card list v2: the 21-map road and faction packs', 'card-list-2026-10-11.md'),
  ('Card list for balancing: Maps 1–5 and Pack 1', 'card-list-2026-10-10.md'),
  ('Inspiration: what to borrow from Hearthstone', 'inspo-hearthstone-2026-10-10.md'),
  ('Card balance report (measured by simulation)', 'card-balance-2026-10-09.md'),
  ('How to tune a skirmish', 'skirmish-tuning-guide.md'),
  ('Archetypes: 10 + the Elder / Outer / Forgotten trio', 'archetypes-design-2026-10-09.md'),
  ('Skills and effects audit, 11 new skills', 'skills-audit-2026-10-08.md'),
  ('Skirmish balance audit', 'skirmish-balance-audit-2026-10-08.md'),
  ('Card stage plan (~60 cards, tutorial set)', 'card-stage-plan-2026-10-08.md'),
  ('Grab-bag randomness', 'grab-bag-randomness-2026-10-08.md'),
  ('Card displays and reuse', 'card-displays.md'),
]
# 2026-10-10 (user: "In subtabs - always hide the irrelevant info instead of going to that bookmark"): a row of
# subtabs; picking one shows only that sheet.
_dz = [(t, f) for t, f in DESIGN if os.path.exists(os.path.join(ROOT, 'docs', f))]
design_html = ('<div class="doc guide"><h1>Design</h1><p class="lede">Design sheets and audits. Nothing here is built unless its status says so; reply in chat to adopt or change any of it.</p>'
  '<nav class="subtabs" data-group="design" aria-label="Design sheets">' + ''.join('<button type="button" data-show="design-' + f[:-3] + '" aria-pressed="' + ('true' if k == 0 else 'false') + '">' + H.escape(t) + '</button>' for k, (t, f) in enumerate(_dz)) + '</nav>')
for k, (t, f) in enumerate(_dz):
    pth = os.path.join(ROOT, 'docs', f)
    _h, _secs = anchor(md_html(open(pth, encoding="utf-8").read()), f'design-{f[:-3]}')  # 2026-10-15: searchable sections
    for sid, st, sx in _secs: SEARCH.append(['Design', st, t, sx[:4000], {'tab': 'design', 'sub': f'design-{f[:-3]}', 'el': sid}])
    design_html += f'<div class="subpane" data-group="design" id="design-{f[:-3]}"{"" if k == 0 else " hidden"}><p class="note">claude/{f}</p><div class="doc">{_h}</div></div>'
design_html += '</div>'
rules_html = ''.join(f'<li>{r}</li>' for r in RULES)
guide = ('<div class="doc guide"><h1>Claude\'s guide</h1>'
  '<p class="lede">What Claude reads and follows before working on Bramblewood. Skills are step-by-step procedures; the docs below are the rules and context for each area.</p>'
  f'<h2>Standing instructions</h2><ul>{rules_html}</ul>'
  '<h2>Skills</h2><p class="note">Proposed on 6 Oct. Save them from the review card in chat; once saved, they load automatically when a task matches.</p>' + skills_html +
  f'<h2>Read before…</h2><table><thead><tr><th>Task</th><th>Doc</th></tr></thead><tbody>{rows}</tbody></table>'
  '<h2>The docs</h2><p class="note">Snapshots of the project docs at build time. The project copy is the source of truth. Pick one in the table above.</p>' + docs_html + '</div>')

# 2026-10-24 (package HUB4, owner G2 / item 71: "Everything within the master hub. Move the other .md files that are still relevant."): the 📖 Library tab
# (tools/hub/library.py): every docs/**/*.md except docs/balance and docs/art, canonical + reference rendered, dated snapshots in a collapsed History
# group rendered on demand. Docs that already have a tab (Design sheets, Claude's guide docs, Skills, Action items, Changelog, Decisions, Progression
# plan) are linked to it, not repeated. The library is inline HTML in index.html: no extra files. (Tab id "doclib": "library" is the Visual Library.)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'hub'))
import library as LIBMOD
_else = {f: ('design', '📐 Design', f'design-{f[:-3]}') for t, f in _dz}
for t, f, src in GUIDE:
    if doc_src(f, src) is not None: _else.setdefault(f, ('guide', "🧠 Claude's guide", f'doc-{f[:-3]}'))
for f in SKILLS: _else['skills/' + f] = ('guide', "🧠 Claude's guide", None)
LIB_HTML, LIB_COUNTS = LIBMOD.build(ROOT, md_html, anchor, _txt, _else, SEARCH)
print('library:', LIB_COUNTS)
LIB_CSS = open(os.path.join(ROOT, 'tools', 'hub', 'library_tab.css'), encoding='utf-8').read()
LIB_JS = open(os.path.join(ROOT, 'tools', 'hub', 'library_tab.js'), encoding='utf-8').read()


# Decisions tab (2026-10-08, user: "the decisions.md should be in the artefact too, with filters and
# a search bar. Once decided, it moves to DONE. The main decisions tab is for decisions that are YET
# to be decided."). docs/decisions.json is the source; decisions.md is regenerated from it too.
import json as _json
_dec_path = os.path.join(ROOT, 'docs', 'decisions.json')
DECISIONS = _json.load(open(_dec_path, encoding='utf-8')) if os.path.exists(_dec_path) else {'items': []}
def _dec_md(d):
    out = ['# Bramblewood Arena — Decisions', '', '_Generated from `decisions.json` (' + d.get('updated','') + '). The hub has a searchable, filterable version: YET (waiting on you) and DONE._', '']
    for st, title in (('YET', 'Waiting on you'), ('DONE', 'Decided')):
        out += ['## ' + title, '']
        for it in [i for i in d['items'] if i['status'] == st]:
            out.append(f"**{it['id']}. {it['title']}** · {it['kind']} · {it['area']} · asked {it.get('asked','')}" + (f" · decided {it['decided']}" if it.get('decided') else ''))
            if it.get('body'): out.append('- ' + it['body'])
            for o in it.get('options') or []: out.append('  - ' + o)
            if it.get('default'): out.append('- **Default:** ' + it['default'])
            if it.get('outcome'): out.append('- **Outcome:** ' + it['outcome'])
            out.append('')
    for r in d.get('rules') or []:  # 2026-10-19 (package L): stated rules (the owner's rules answers), one dated section each, at the end
        out += ['## Stated rules · ' + r.get('date', ''), '']
        if r.get('intro'): out += [r['intro'], '']
        out += ['- ' + x for x in r.get('items') or []] + ['']
    return '\n'.join(out)
open(os.path.join(ROOT, 'docs', 'decisions.md'), 'w', encoding='utf-8').write(_dec_md(DECISIONS))
decisions_json = _json.dumps(DECISIONS, ensure_ascii=False).replace('</', '<\\/')
for it in DECISIONS['items']:  # 2026-10-15: decisions in the global search
    SEARCH.append(['Decision', f"{it['id']} · {it['title']}", ('⏳ yet' if it['status'] == 'YET' else '✅ done') + ' · ' + it.get('area', ''),
                   ' '.join(str(it.get(k) or '') for k in ('body', 'default', 'outcome')) + ' ' + ' '.join(it.get('options') or []), {'tab': 'decisions', 'dec': it['id']}])

# Decks tab (2026-10-12, user: "In our artefact list the ALL tuts and skirmish decks / raid decks. Then also list all tutorials
# we have and in what order"): built from docs/balance/decks.json (tools/hub/export_decks.py).
def _decks_panel():
    path = os.path.join(ROOT, 'docs', 'balance', 'decks.json')
    if not os.path.exists(path): return '<section class="panel" id="p-decks" role="tabpanel" aria-labelledby="t-decks" hidden><p class="dec-empty">Run tools/hub/export_decks.py.</p></section>'
    D = json.load(open(path, encoding='utf-8')); e = H.escape
    def deck(cards, keep=None):
        rows = []
        for c in sorted(cards, key=lambda c: (c.get('cost') or 0, c['name'])):
            sk = c.get('skills') or []
            if keep is not None:
                sk_html = ', '.join(f'<b>{e(k)}</b>' if k in keep else f'<s title="taken off in the tutorial">{e(k)}</s>' for k in sk)
            else: sk_html = e(', '.join(sk))
            rows.append(f"<tr><td>{c['n']}×</td><td>{e(c['name'])}</td><td>{c.get('atk')}/{c.get('hp')}</td><td>{c.get('wait') or ''}</td><td>{c.get('cost') or ''}</td><td>{sk_html}</td></tr>")
        n = sum(c['n'] for c in cards)
        return f'<table class="dk-t"><thead><tr><th>#</th><th>Card ({n})</th><th>Atk/HP</th><th>Wait</th><th>Cost</th><th>Skills</th></tr></thead><tbody>{"".join(rows)}</tbody></table>'
    o = D['order']; parts = []
    parts.append('<h3>Tutorial order</h3><p>Each part shows its steps in this order; a step waits for the one before it. Passive tips come after the last step of the part, one a round.</p><ol class="dk-order">' + ''.join(f"<li><b>Part {g['part']}: {e(g['id'])}</b> <small>({e(g['kind'])}; {e(g['when'])})</small><br>{e(g['text'])}</li>" for g in o['guided']) + '</ol>')
    parts.append('<h4>Dialogue in the tutorial</h4><ul>' + ''.join(f'<li>{e(x)}</li>' for x in o['dialogues']) + '</ul>')
    parts.append('<h4>After the tutorial</h4><ul>' + ''.join(f'<li>{e(x)}</li>' for x in o['after']) + '</ul>')
    parts.append('<details><summary>Passive tips (first time each thing appears, any match)</summary><ul>' + ''.join(f"<li><b>{e(t['id'])}</b>: {e(t['text'])}</li>" for t in o['passive']) + '</ul></details>')
    cfg = D.get('tutorialCfg', {})
    parts.append(f"<h3>Tutorial decks</h3><p>Your castle {cfg.get('myHp')} HP, rival {cfg.get('rivalHp')} HP (+2 in part 2), starting hand {cfg.get('handSize')}. Rewards after part 1: {e(', '.join(cfg.get('rewards', [])))}. Struck-through skills are taken off in that part.</p>")
    for pick, ps in D['tutorial'].items():
        for t in ps:
            parts.append(f"<details {'open' if pick=='otters' else ''}><summary>Part {t['part']} · picked {e(pick)} · highlight: {e(t.get('highlight') or 'none')}</summary><div class='dk-two'><div><h5>Your deck</h5>{deck(t['mine'], t['keep'])}</div><div><h5>Rival</h5>{deck(t['rival'], t['keep'])}</div></div></details>")
    parts.append('<h3>Skirmish decks</h3>')
    # 2026-10-15: every fight gets an id (fight-<map>-<key>) so the search and the Cards tab's "used in" list can open it.
    for m in D['maps']:
        inner = ''
        for n in m['nodes']:
            fid = re.sub(r'[^\w-]', '_', f"fight-{m['id']}-{n['key']}")
            SEARCH.append(['Fight', f"{n['key']} {n['name']}", f"{m['name']} · {n['kind']}", ' '.join(c['name'] for c in n['deck']), {'tab': 'decks', 'el': fid}])
            for c in n['deck']: USES.setdefault(c['id'], []).append([fid, f"{n['key']} {n['name']}"])
            inner += f"<details id=\"{fid}\"><summary>{e(n['name'])} <small>{e(n['key'])} · {e(n['kind'])} · 🏰 {n.get('hq')} · ⚔ {n.get('rating')}</small></summary>{deck(n['deck'])}</details>"
        parts.append(f"<details class='dk-map'><summary><b>Map {m.get('num') if m.get('num') is not None else '·'}: {e(m['name'])}</b> <small>{len(m['nodes'])} fights</small></summary>{inner}</details>")
    parts.append('<h3>Raid decks</h3>')
    for r in D['raids']:
        for k, p in enumerate(r['parts']):
            for c in p['deck']: USES.setdefault(c['id'], []).append([f"raid-{r['id']}-{k}", f"Raid: {p['name']}"])
        inner = ''.join(f"<details id=\"raid-{e(r['id'])}-{k}\"><summary>{e(p['name'])} <small>🏰 {p.get('castle')} · {p.get('rounds')} rounds</small></summary>{deck(p['deck'])}</details>" for k, p in enumerate(r['parts']))
        inner += ''.join(f"<details><summary>Allies: {e(a['name'])}</summary>{deck(a['deck'])}</details>" for a in r['allies'])
        parts.append(f"<details class='dk-map' open><summary><b>{e(r['name'])}</b></summary>{inner}</details>")
    return '<section class="panel" id="p-decks" role="tabpanel" aria-labelledby="t-decks" hidden>' + lazy('<div class="bal"><div class="dec-head"><h2>Decks &amp; tutorials</h2><p>Every deck in the game, exported from the build. Tap a row to open it.</p></div>' + ''.join(parts) + '</div>') + '</section>'
USES = {}  # 2026-10-15: card id -> [[element id, fight label]], filled while building the Decks tab
decks_panel = _decks_panel()

def _dialogues_panel():
    import html as _h
    path = os.path.join(ROOT, 'docs', 'dialogues.json') if 'ROOT' in globals() else 'docs/dialogues.json'
    if not os.path.exists(path): return '<section class="panel" id="p-dialogues" role="tabpanel" aria-labelledby="t-dialogues" hidden><p class="dec-empty">Run tools/dialogues/export_dialogues.py.</p></section>'
    d = json.load(open(path, encoding='utf-8')); e = lambda s: _h.escape(str(s or ''))
    parts = []
    for k, s in enumerate(d['scripts']):
        rows = ''.join(f"<tr><td>{e(l['name'])}<br><small>{e(l['who'])}</small></td><td>{e(l['text'])}{'<br><small>↳ ' + e(l['replies']) + '</small>' if l['replies'] else ''}</td></tr>" for l in s['lines'])
        # 2026-10-15: ids (dlg-N) and search entries
        SEARCH.append(['Dialogue', s['id'], ' ; '.join(w.split('  · ')[0] for w in s['where'])[:120], ' '.join(f"{l['name']}: {l['text']}" for l in s['lines'])[:4000], {'tab': 'dialogues', 'el': f'dlg-{k}'}])
        parts.append(f"<details id=\"dlg-{k}\"><summary><b>{e(s['id'])}</b> · {len(s['lines'])} line{'s' if len(s['lines']) != 1 else ''} · <small>{e(' ; '.join(w.split('  · ')[0] for w in s['where']))}</small></summary><table class=\"dk-t\"><thead><tr><th>Speaker</th><th>Line</th></tr></thead><tbody>{rows}</tbody></table></details>")
    DLG_N[0] = len(d['scripts'])
    return ('<section class="panel" id="p-dialogues" role="tabpanel" aria-labelledby="t-dialogues" hidden>' + lazy('<div class="bal"><div class="dec-head"><h2>Dialogues</h2>'
            f"<p>Every conversation in the game ({len(d['scripts'])}), who says each line and where it plays. Exported {e(d['generated'])}. "
            'The spreadsheet (docs/dialogues-*.xlsx) has an “Add your own” sheet: any card’s name works as a speaker, and that card speaks with its main card art.</p></div>'
            + ''.join(parts) + '</div>') + '</section>')
DLG_N = [0]
dialogues_panel = _dialogues_panel()

# 2026-10-15 (user: "improve the master hub"): 🎴 Cards tab, Home stats. docs/balance/hub-cards.json comes from
# tools/hub/export_decks.py (the game's own labels and "where to get it"); art coverage reads canonical/cards.json.
# Thumbnails: one 96px sprite sheet (cards-thumbs.webp, one file, so the hub stays under the artifact's file limit).
import math, datetime
_hc_path = os.path.join(ROOT, 'docs', 'balance', 'hub-cards.json')
HC = json.load(open(_hc_path, encoding='utf-8')) if os.path.exists(_hc_path) else {'skills': [], 'maps': [], 'cards': []}
CANON = json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))
_canon_art = {c['id']: c.get('art') for c in CANON}
_assets = {os.path.splitext(f)[0]: f for f in os.listdir(os.path.join(ROOT, 'assets', 'cards'))}
THUMB = 96
# 2026-10-25 (package HUB5, H2 / G11): the sheet is built from canonical/cards.json, not from hub-cards.json (which is a game export and lags the file),
# so the Card table and the Packs section have a thumbnail for every card that has art.
_egg_ids = {c['id'] for c in CANON if c.get('easterEgg')} | {c['id'] for c in HC['cards'] if c.get('egg')}
_thumb_ids = [c['id'] for c in CANON if c['id'] not in _egg_ids and (c['id'] in _assets or (_canon_art.get(c['id']) or '').startswith('data:image'))]  # 2026-10-19 (package EE): no thumbnail for a masked Easter egg
if _thumb_ids:
    import base64, io
    cols = math.ceil(math.sqrt(len(_thumb_ids)))
    sheet = Image.new('RGB', (cols * THUMB, math.ceil(len(_thumb_ids) / cols) * THUMB), (40, 34, 26))
    for i, cid in enumerate(_thumb_ids):
        src = os.path.join(ROOT, 'assets', 'cards', _assets[cid]) if cid in _assets else io.BytesIO(base64.b64decode(_canon_art[cid].split(',', 1)[1]))
        im = Image.open(src).convert('RGBA').resize((THUMB, THUMB), Image.LANCZOS)
        bg = Image.new('RGBA', im.size, (40, 34, 26, 255)); bg.alpha_composite(im)
        sheet.paste(bg.convert('RGB'), ((i % cols) * THUMB, (i // cols) * THUMB))
    sheet.save(os.path.join(OUT, 'cards-thumbs.webp'), 'WEBP', quality=72, method=4)
else: cols = 1
_tix = {cid: i for i, cid in enumerate(_thumb_ids)}
_bal = {r['id']: r for r in BAL['rows']}
for c in HC['cards']:
    c['t'] = _tix.get(c['id'], -1)
    b = _bal.get(c['id'])
    if b: c['wr'] = [b['winRate'], round(b['band'][0]), round(b['band'][1]), b['verdict']]
    if c['id'] in USES: c['use'] = USES[c['id']][:40]; c['nuse'] = len(USES[c['id']])
CARDS_JSON = json.dumps({'cols': cols, 'skills': HC['skills'], 'maps': HC['maps'], 'cards': HC['cards']}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
SEARCH_JSON = json.dumps(SEARCH, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
# Stats for the Home tab.
_play = [c for c in HC['cards'] if not c['tok'] and not c['test']]
_canon_play = [c for c in CANON if not c.get('token') and not c.get('test') and not c.get('hidden')]
_art_n = sum(1 for c in _canon_play if c.get('art'))
_main_maps = [m for m in HC['maps'] if not m['sub']]; _side_maps = [m for m in HC['maps'] if m['sub']]
_sk_used = {s['k'] for c in _play for s in c['sk']}
_open_dec = sorted([i for i in DECISIONS['items'] if i['status'] == 'YET'], key=lambda i: i.get('asked', ''), reverse=True)
_bal_strong = sum(1 for r in BAL['rows'] if r.get('verdict') == 'strong'); _bal_weak = sum(1 for r in BAL['rows'] if r.get('verdict') == 'weak')
def _tile(n, label, sub, tab):
    return f'<a class="st" href="#{tab}" data-tab="{tab}"><b>{n}</b><span>{label}</span><small>{sub}</small></a>'
STATS = ''.join([
    _tile(len(_play), 'cards', f'{len(_play) - sum(1 for c in _play if c["un"])} obtainable · {sum(1 for c in HC["cards"] if c["tok"])} tokens', 'cards'),
    _tile(f'{round(100 * _art_n / max(1, len(_canon_play)))}%', 'art coverage', f'{_art_n} of {len(_canon_play)} cards have art', 'cards'),
    _tile(len(_main_maps), 'maps', f'+ {len(_side_maps)} side maps · {sum(m["fights"] for m in HC["maps"])} fights', 'decks'),
    _tile(len(_sk_used), 'skills in use', f'{len(HC["skills"])} defined', 'cards'),
    _tile(len(_open_dec), 'open decisions', f'{len(DECISIONS["items"]) - len(_open_dec)} decided', 'decisions'),
    _tile(_bal_strong + _bal_weak, 'balance outliers', f'{_bal_strong} too strong · {_bal_weak} too weak', 'balance'),
    _tile(DLG_N[0], 'dialogues', 'conversations in the game', 'dialogues'),
    _tile(len(CL), 'changelog entries', f'latest {H.escape(CL[0][0]) if CL else "—"}', 'changelog'),
])
# Home: "Your calls" and "Planned" first (the user asked for those at the top), then open decisions, recent changes, links.
_calls = [(k, t, b) for k, (t, b) in enumerate(AI) if re.search(r'your calls|^planned', t, re.I)]
CALLS = ''.join(f'<section class="dash-card"><h2>{H.escape(re.sub(r"^[0-9]+[.] *", "", t))}</h2><div class="doc">{b}</div></section>' for k, t, b in _calls) or '<p class="dec-empty">No “Your calls” section in docs/action-items.md.</p>'
_dec_rows = ''.join(f'<li><a href="#decisions" data-dec="{H.escape(i["id"])}"><span class="dec-id">{H.escape(i["id"])}</span> {H.escape(i["title"])}</a><small>{H.escape(i.get("area", ""))} · asked {H.escape(i.get("asked", ""))}</small></li>' for i in _open_dec[:8])
RECENT = ''.join(f'<details class="cl"{" open" if k == 0 else ""}><summary>{H.escape(t)}</summary><div class="cl-b doc">{b}</div></details>' for k, (t, b) in enumerate(CL[:5]))
LINKS = [('🎯', 'actions', 'Action items', 'Everything done and waiting, newest first'), ('🎴', 'cards', 'Cards', 'Every card with art, stats, skills, where it drops'),
  ('⚖️', 'balance', 'Balance', 'Win rate of each card in simulation'), ('📈', 'difficulty', 'Difficulty', 'How hard each fight is, map by map'),
  ('🃏', 'decks', 'Decks', 'Tutorial, skirmish and raid decks'), ('💬', 'dialogues', 'Dialogues', 'Every conversation and who says it'),
  ('🗳️', 'decisions', 'Decisions', 'Waiting on you, and decided'), ('📐', 'design', 'Design', 'Design sheets and audits'),
  ('🗒️', 'changelog', 'Changelog', 'What changed, newest first'), ('✨', 'lab', 'Effects Lab', 'Skill effects on a live stage'),
  ('🧪', 'playground', 'VFX Playground', 'GSAP and shader experiments'), ('🖼️', 'library', 'Visual Library', 'Screenshots taken while building'),
  ('🎚️', 'budget', 'Budget & stats', 'Edit the budget constants, card Attack / Health and the special monsters; see what flips'),  # 2026-10-19 (package HB)
  ('🧮', 'costs', 'Skill costs', 'Edit what skills, triggers and actions cost; see who goes over budget'),
  ('💰', 'ucosts', 'Upgrade & Forge costs', 'Edit what levelling, limit breaks, the Forge tiers, duplicates, prestige, disenchanting and gem sockets cost'),  # 2026-10-23 (package HUB2); + gem sockets (2026-10-24, package H1)
  ('🗂', 'units', 'Units by theme', 'Every creature by biome, family and faction; pick units per map for the post-balance step'),
  ('📚', 'progress', 'Progression plan', 'Your definitions (base, skirmish base, Packs 1-3, faction pool ...), targets vs today, cards by advancement, mistakes, balancing suggestions'),  # 2026-10-23 (package HUB3)
  ('🧬', 'deckopt', 'Deck optimizer', 'The strongest deck per map, the difficulty ladder and how far each fight deck sits below it (tools/opt/deckopt.js)'),  # 2026-10-24 (owner 23:48)
  ('🪙', 'resources', 'Resources', 'Every currency and material, where it comes from and goes, and a dedicated player\'s week'),  # 2026-10-23 (package HUB3)
  ('📖', 'doclib', 'Library', 'Every doc in docs/: canonical and reference docs to read here, dated snapshots under History'),  # 2026-10-24 (package HUB4)
  ('🗃️', 'ctable', 'Card table', 'Every card in one sortable, filterable table (100 a page), plus the packs and the art that could wear them'),  # 2026-10-25 (package HUB5, H2 / G11)
  ('📊', 'curves', 'Curves', 'XP per level (Levels 15-25 marked), Forge and crafting costs, Energy and resource curves'),  # 2026-10-25 (package HUB5, H3)
  ('🧠', 'guide', "Claude's guide", 'Standing rules, skills, docs to read first')]
LINKS = [(i, 'curve' if t == 'difficulty' else t, n, d) for i, t, n, d in LINKS]
_built = datetime.date.today().isoformat()  # date only: the build machine's clock is UTC, the docs use your local time
home_html = (f'<div class="dash"><div class="dash-hero"><div><h1>Bramblewood Arena</h1><p class="lede">Your home base. Hub built {_built}; action items updated {H.escape(_ai_updated)}.</p></div>'
  '<div class="dash-cta"><a class="btn pri" href="https://bramblewood-arena.vercel.app" target="_blank" rel="noopener">🎮 Play the live game ↗</a>'
  '<a class="btn" href="#actions" data-tab="actions">🎯 All action items</a></div></div>'
  f'<div class="stats">{STATS}</div>'
  f'<div class="dash-grid"><div class="dash-col">{CALLS}</div>'
  f'<div class="dash-col"><section class="dash-card"><h2>Open decisions <small>{len(_open_dec)}</small></h2><ul class="dash-dec">{_dec_rows}</ul>'
  f'<p><a href="#decisions" data-tab="decisions">See all {len(_open_dec)} open decisions →</a></p></section>'
  f'<section class="dash-card"><h2>Recently changed</h2>{RECENT}<p><a href="#changelog" data-tab="changelog">Full changelog ({len(CL)} entries) →</a></p></section></div></div>'
  '<h2 class="dash-h">Everything in the hub</h2><div class="pg-grid">' + ''.join(f'<a class="pg" href="#{t}" data-tab="{t}"><span class="pg-i">{i}</span><span><b>{n}</b><small>{d}</small></span></a>' for i, t, n, d in LINKS) + '</div>'
  '<p class="note dash-foot">Tip: press <kbd>/</kbd> to search cards, changelog, decisions, design docs and dialogues.</p></div>')
cards_panel = ('<section class="panel" id="p-cards" role="tabpanel" aria-labelledby="t-cards" hidden><div class="cds">'
  '<div class="dec-head"><h2>Cards</h2><p id="cdLead">Every card in the game, from the build. Tap one for its skills, where it drops and which decks use it.</p></div>'
  '<div class="cd-bar"><input type="search" id="cdQ" placeholder="Name, id, skill, species…" aria-label="Search cards">'
  '<select id="cdR" aria-label="Rarity"></select><select id="cdS" aria-label="Source"></select><select id="cdM" aria-label="Map"></select>'
  '<select id="cdK" aria-label="Skill"></select><select id="cdA" aria-label="Type"></select><select id="cdO" aria-label="Sort"></select>'
  '<label class="cd-chk"><input type="checkbox" id="cdX"> tokens and test cards</label></div>'
  '<p class="cd-count" id="cdN" aria-live="polite"></p><div class="cd-grid" id="cdGrid"></div></div>'
  '<div class="cd-sheet" id="cdSheet" hidden><div class="cd-scrim" data-close></div><div class="cd-card" role="dialog" aria-modal="true" aria-labelledby="cdTitle"><button class="cd-x" data-close aria-label="Close">✕</button><div id="cdBody"></div></div></div></section>')
HUB_CSS = open(os.path.join(ROOT, 'tools', 'hub', 'hub_app.css'), encoding='utf-8').read()
HUB_JS = open(os.path.join(ROOT, 'tools', 'hub', 'hub_app.js'), encoding='utf-8').read()
# 2026-10-18 (owner, 19:54: "Your bramble master hub should let me edit N values of all skills, triggers and actions"): the 🧮 Skill
# costs tab. canonical/skill-costs.json (the seeds), the cards the balance tools measure, tools/skill_costs.js (the same S / N code
# as tools/card_balance.js) and the tab's own script, all inlined: no extra files. Edits live in the artifact's db, so the hub
# must be published with capabilities {db: {}}; tools/hub/pull_skill_costs.md says how Claude applies them.
_sc_seed = json.load(open(os.path.join(ROOT, 'canonical', 'skill-costs.json'), encoding='utf-8'))
def _sc_card(d):
    x = {'id': d['id'], 'n': d.get('name', d['id']), 'r': d.get('rarity') or None, 'c': d.get('cost') or 0, 'w': d.get('wait') or 0,
         'a': d.get('attack') or 0, 'h': d.get('health') or 0, 'e': d.get('effects') or {}}
    for f in ('faction', 'basic', 'tutorial', 'quest'):
        if d.get(f): x[f] = 1
    if (d.get('source') or {}).get('kind'): x['k'] = d['source']['kind']
    return x
_sc_cards = [_sc_card(d) for d in CANON if not (d.get('token') or d.get('test') or d.get('hallOfFame') or d.get('baseId') or d.get('field'))]
_js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
SC_LIB = re.sub(r'^#!.*\n', '', open(os.path.join(ROOT, 'tools', 'skill_costs.js'), encoding='utf-8').read())
SC_TAB = open(os.path.join(ROOT, 'tools', 'hub', 'skill_costs_tab.js'), encoding='utf-8').read()
# 2026-10-19 (package DC, owner 08:10: "duo-skill combos"): the Combos view's data, the measured pairs from tools/skill_combo.js
# (docs/balance/skill-combos-2026-10-19.json), kept compact: the top synergies / anti-synergies, the family multipliers.
def _sc_combos():
    f = os.path.join(ROOT, 'docs', 'balance', 'skill-combos-2026-10-19.json')
    if not os.path.exists(f): return None
    d = json.load(open(f, encoding='utf-8'))
    keep = lambda r: {k: r.get(k) for k in ('pair', 'ctx', 'S', 'Sa', 'Sb', 'sumSingles', 'interaction', 'se', 'confidence', 'cards', 'source')}
    sure = [r for r in d.get('pairs', []) if r.get('confidence') in ('high', 'medium')]
    syn = sorted([r for r in sure if r['interaction'] > 0], key=lambda r: -r['interaction'])[:40]
    anti = sorted([r for r in sure if r['interaction'] < 0], key=lambda r: r['interaction'])[:40]
    m = d.get('model') or {}
    return {'generated': d.get('generated'), 'games': d.get('games'), 'pairs': len(d.get('pairs', [])), 'G': d.get('G'), 'syn': [keep(r) for r in syn], 'anti': [keep(r) for r in anti],
            'model': {'global': m.get('global'), 'rmse': m.get('rmse'), 'families': [f for f in (m.get('families') or []) if f.get('pairs', 0) >= 3]}}
# 2026-10-19 (package BF): budget v4's N lives in bramblewood-budget.js (window.BramblewoodBudget), which tools/skill_costs.js reads
BB_LIB = open(os.path.join(ROOT, 'bramblewood-budget.js'), encoding='utf-8').read()
# 2026-10-19 (BF2, owner 15:25): Base's map term reads where each card becomes obtainable (canonical/card-obtain-maps.json)
_om_path = os.path.join(ROOT, 'canonical', 'card-obtain-maps.json')
_om = json.load(open(_om_path, encoding='utf-8')).get('maps', {}) if os.path.exists(_om_path) else {}
SC_INLINE = f'const SC_SEED = {_js(_sc_seed)};\nconst SC_CARDS = {_js(_sc_cards)};\nconst SC_COMBOS = {_js(_sc_combos())};\nconst SC_OBTAIN_MAPS = {_js(_om)};\n{BB_LIB}\n{SC_LIB}\n{SC_TAB}'
# 2026-10-19 (package UC, owner 08:49: "let's separate the units thematically? Then we pick and choose, then do post-balancing"): the
# 🗂 Units by theme tab. canonical/unit-themes.json (node tools/unit_themes.js) and the tab's script and styles, inlined. Picks live in
# the artifact's db (collection unitPicks), so the hub is published with capabilities {db: {}}; tools/hub/pull_unit_picks.md.
_ut_path = os.path.join(ROOT, 'canonical', 'unit-themes.json')
_ut = json.load(open(_ut_path, encoding='utf-8')) if os.path.exists(_ut_path) else None
# 2026-10-19 (package RJ): the 👹 Non-player view's score, equivalent card and BR columns: canonical/special-monsters.json
# (node tools/special_monsters.js), its nonPlayer and "others" rows only (the full tables are in docs/balance/special-monsters-2026-10-19.md)
_sm_path = os.path.join(ROOT, 'canonical', 'special-monsters.json')
_sm = json.load(open(_sm_path, encoding='utf-8')) if os.path.exists(_sm_path) else None
_sm_slim = {k: _sm.get(k) for k in ('generated', 'doc', 'nonPlayer', 'others')} if _sm else None
if _sm: _sm_slim['budget'] = {'v5': (_sm.get('budget') or {}).get('v5', {}).get('formula'), 'v6': (_sm.get('budget') or {}).get('v6', {}).get('formula'), 'playerTop': (_sm.get('budget') or {}).get('playerTop')}
# 2026-10-23 (package HUB2, owner 11:11: "put the upgrade and forge costs in the master hub and let them be editable"): the 💰 Upgrade costs tab.
# canonical/upgrade-costs.json (the seed), tools/upgrade_costs_lib.js (the same path list the fold tool uses) and the tab's script, inlined.
# Edits live in the artifact's db (collection upgradeCosts), so the hub is published with capabilities {db: {}}; tools/hub/pull_upgrade_costs.md.
_uc_seed = json.load(open(os.path.join(ROOT, 'canonical', 'upgrade-costs.json'), encoding='utf-8'))
UC_INLINE = (f'const UC_SEED = {_js(_uc_seed)};\n' + re.sub(r'^#!.*\n', '', open(os.path.join(ROOT, 'tools', 'upgrade_costs_lib.js'), encoding='utf-8').read())
             + '\n' + open(os.path.join(ROOT, 'tools', 'hub', 'upgrade_costs_tab.js'), encoding='utf-8').read())
UT_INLINE = (f'const UT_DATA = {_js(_ut)};\nconst SM_DATA = {_js(_sm_slim)};\n' + open(os.path.join(ROOT, 'tools', 'hub', 'units_tab.js'), encoding='utf-8').read()) if _ut else ''
UT_CSS = open(os.path.join(ROOT, 'tools', 'hub', 'units_tab.css'), encoding='utf-8').read()
# 2026-10-23 (package HUB3, owner 19:27: "let's all discuss this in the 'Units by theme' tab (maybe) ... Help me remember my definitions and log
# it in the master hub as well"; #17: "a tab called resources"): the 📚 Progression plan tab (docs/progression-plan.md, the canonical text, and
# docs/balance/progression-plan-2026-10-23.json from node tools/progression_plan_2026_10_23.js) beside 🗂 Units by theme, and the 🪙 Resources
# tab (docs/balance/resources-2026-10-23.json from node tools/resources_week_2026_10_23.js). Read only: no db, no browser storage.
_pp_path = os.path.join(ROOT, 'docs', 'balance', 'progression-plan-2026-10-23.json')
_pp = json.load(open(_pp_path, encoding='utf-8')) if os.path.exists(_pp_path) else None
_pp_md_path = os.path.join(ROOT, 'docs', 'progression-plan.md')
_pp_doc = md_html(re.sub(r'<!--.*?-->', '', open(_pp_md_path, encoding='utf-8').read(), flags=re.S)) if os.path.exists(_pp_md_path) else ''
PP_INLINE = (f'const PP_DATA = {_js(_pp)};\nconst PP_DOC = {_js(_pp_doc)};\n' + open(os.path.join(ROOT, 'tools', 'hub', 'progression_tab.js'), encoding='utf-8').read()) if _pp else ''
# 2026-10-24 (owner 23:48: "Where will the results go? in the master hub?"): the 🧬 Deck optimizer tab renders every
# summary in docs/balance/opt/ (newest first), so a run on GitHub Actions or locally only needs the files committed and the hub rebuilt.
_opt_dir = os.path.join(ROOT, 'docs', 'balance', 'opt')
_opt_files = sorted([f for f in os.listdir(_opt_dir) if f.endswith('.md')], key=lambda f: ('summary' not in f, -os.path.getmtime(os.path.join(_opt_dir, f)))) if os.path.isdir(_opt_dir) else []
import deckopt_summary as DOS  # 2026-10-26 (package HUB6, owner 10-26 11:19): the summary panel at the top of the 🧬 Deck optimizer tab
deckopt_html = ('<div class="doc guide"><h1>🧬 Deck optimizer</h1>' + DOS.summary_html(ROOT, CANON, _tix, cols, max(1, math.ceil(len(_thumb_ids) / cols))) + '<h2>Results</h2><p class="lede">Results of <code>tools/opt/deckopt.js</code>: no Claude tokens are spent on the games. '
  'Run it from GitHub (Actions → Deck optimizer → Run workflow) or locally (<code>node tools/opt/deckopt.js --maps 0-3 --minutes 20</code>), commit the files in '
  '<code>docs/balance/opt/</code>, then ask Claude to rebuild the hub. Raw per-map data: the <code>deckopt-map*.json</code> files there.</p>'
  + (''.join(f'<details{" open" if k == 0 else ""}><summary><b>{H.escape(f)}</b></summary><div class="doc">{md_html(open(os.path.join(_opt_dir, f), encoding="utf-8").read())}</div></details>' for k, f in enumerate(_opt_files)) or '<p>No results yet.</p>')
  + '</div>')
_rs_path = os.path.join(ROOT, 'docs', 'balance', 'resources-2026-10-23.json')
_rs = json.load(open(_rs_path, encoding='utf-8')) if os.path.exists(_rs_path) else None
RS_INLINE = (f'const RS_DATA = {_js(_rs)};\n' + open(os.path.join(ROOT, 'tools', 'hub', 'resources_tab.js'), encoding='utf-8').read()) if _rs else ''
PP_CSS = open(os.path.join(ROOT, 'tools', 'hub', 'plan_tabs.css'), encoding='utf-8').read()
# 2026-10-19 (package HB, owner 17:44: "Where is our balance, monsters, and skills file -> can it be put into the artefact for my assessment.
# Also s.t. i can edit the values"): the 🎚️ Budget & stats tab. Budget constants, card Attack / Health and the special monsters, each an
# editable number saved in the artifact's db (collections budgetEdits, cardEdits, monsterEdits; tools/hub/pull_balance_edits.md), with a
# live recompute in the page. It reads SC_SEED / SC_CARDS / BramblewoodBudget / SkillCosts (inlined above, so BF3's budget numbers and Map
# term arrive with whatever the files say at build time) and HB_DATA: each card's map, animal and the monsters' rows, built here.
def _hb_data():
    _om_p = os.path.join(ROOT, 'canonical', 'card-obtain-maps.json')
    om = json.load(open(_om_p, encoding='utf-8')).get('maps', {}) if os.path.exists(_om_p) else None
    _at_p = os.path.join(ROOT, 'canonical', 'animal-tags.json')
    at = {c['id']: c for c in json.load(open(_at_p, encoding='utf-8')).get('cards', [])} if os.path.exists(_at_p) else {}
    hcm = {c['id']: c for c in HC['cards']}; mnum = {m['id']: m for m in HC['maps']}
    live = [d for d in CANON if not (d.get('token') or d.get('test') or d.get('hallOfFame') or d.get('baseId') or d.get('field') or d.get('pool'))]
    cards = {}
    for d in live:
        h = hcm.get(d['id'], {}); hm = mnum.get(h.get('map') or '', {})
        a = at.get(d['id'], {})
        x = {'m': (om.get(d['id'], 0) if om is not None else (hm.get('num') or 0)), 'mi': h.get('map') or '', 'an': a.get('animal') or d.get('animal') or '', 'ag': a.get('group') or ''}
        if d.get('creatorNote'): x['cn'] = d['creatorNote'][-160:]
        cards[d['id']] = x
    # the special monsters: every row of canonical/special-monsters.json's groups (package RJ), one key each (the db doc id)
    mons = []
    if _sm:
        rows = [(k, g['title'], r) for k, g in (_sm.get('groups') or {}).items() for r in g.get('rows', [])]
        ids = {}
        for _, _, r in rows: ids[r['id']] = ids.get(r['id'], 0) + 1
        raids = json.load(open(os.path.join(ROOT, 'canonical', 'raids.json'), encoding='utf-8'))
        rb = {b['id']: b for b in json.load(open(os.path.join(ROOT, 'canonical', 'raid-bosses.json'), encoding='utf-8'))}
        seen = set()
        for gk, gt, r in rows:
            where = r.get('node') or ((r.get('partName') or '') + ' · ' + (r.get('scenario') or '')).strip(' ·') or r.get('where') or ''
            key = r['id'] if ids[r['id']] == 1 else (r['id'] + '@' + re.sub(r'[^a-z0-9]+', '-', where.lower()).strip('-'))[:120]
            k0, n = key, 2
            while key in seen: key = f'{k0}-{n}'; n += 1
            seen.add(key)
            src = {'computed': 1}
            if gk == 'brambles':  # a raid part's bramble: the part fight's castleHp in canonical/raids.json
                for rd in raids:
                    for p in rd.get('parts', []):
                        if p.get('id') == r.get('part') and 'castleHp' in (p.get('fight') or {}):
                            src = {'file': 'canonical/raids.json', 'path': f"{rd['id']}.parts[{p['id']}].fight.castleHp", 'field': 'health', 'now': p['fight']['castleHp']}
            elif gk == 'async' and r['id'] in rb and 'hqHp' in rb[r['id']]:
                src = {'file': 'canonical/raid-bosses.json', 'path': f"{r['id']}.hqHp", 'field': 'health', 'now': rb[r['id']]['hqHp']}
            sc = r.get('score') or {}; bb = r.get('brBoss') or {}; e5 = (r.get('equiv') or {}).get('v5') or {}
            stats = dict(r.get('stats') or {})
            if src.get('now') is not None: stats['health'] = src['now']  # a bramble / async boss starts from its file's value today (RJ's run may predate it)
            mons.append({'key': key, 'g': gk, 'gt': gt, 'id': r['id'], 'name': r['name'], 'where': where, 'role': r.get('role') or r.get('kind') or '',
                         'st': stats, 'rj': (r.get('stats') or {}).get('health'), 'sk': r.get('skills') or '', 'S': sc.get('S') or 0, 'mm': sc.get('m') or 1, 'lv': r.get('level') or 1, 'map': r.get('map') or 0,
                         'file': {'x1': sc.get('x1'), 'x2': sc.get('x2'), 'need': sc.get('need'), 'N': (r.get('N') or {}).get('v5'), 'ok': (r.get('inBand') or {}).get('v5'),
                                  'eq': e5, 'equiv': r.get('equivText') or '', 'brP': r.get('brPlayer'), 'brB': bb.get('perCopy') if bb.get('perCopy') is not None else bb.get('inPart'),
                                  'brNote': bb.get('note') or ''},
                         'flag': bool(r.get('flag')), 'why': (r.get('why') or '')[:400], 'src': src})
    _aa = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
    _rw = re.search(r'const RATING_WEIGHT = (\{[^}]*\});', _aa)
    rw = json.loads(re.sub(r'(\w+):', r'"\1":', _rw.group(1))) if _rw else {}
    return {'built': datetime.date.today().isoformat(), 'obtainMaps': om is not None, 'cards': cards, 'monsters': mons, 'monstersGenerated': (_sm or {}).get('generated'),
            'ratingWeight': rw, 'maps': [{'id': m['id'], 'num': m['num'], 'name': m['name'], 'sub': m['sub']} for m in HC['maps']]}
HB_INLINE = f'const HB_DATA = {_js(_hb_data())};\n' + open(os.path.join(ROOT, 'tools', 'hub', 'balance_edit_tab.js'), encoding='utf-8').read()
HB_CSS = open(os.path.join(ROOT, 'tools', 'hub', 'balance_edit_tab.css'), encoding='utf-8').read()
# 2026-10-21 (package HC, owner: "Status chips: in Master Hub, let me know all the status chips and context chips (e.g. flying) available
# and context fx (like blind) available. Maybe we can drop some of them."): the 🏷️ Chips & FX tab. docs/chips-inventory.json is written by
# node tools/hub/chips_inventory.js from the game source (never typed by hand); the owner's Keep / Drop / Merge marks and notes live in the
# artifact's db (collection chipReview; tools/hub/pull_chip_review.md). Run the generator first when the game's chips changed.
_ch_path = os.path.join(ROOT, 'docs', 'chips-inventory.json')
_ch = json.load(open(_ch_path, encoding='utf-8')) if os.path.exists(_ch_path) else None
CH_INLINE = (f'const CH_DATA = {_js(_ch)};\n' + open(os.path.join(ROOT, 'tools', 'hub', 'chips_tab.js'), encoding='utf-8').read()) if _ch else ''
CH_CSS = open(os.path.join(ROOT, 'tools', 'hub', 'chips_tab.css'), encoding='utf-8').read()
# 2026-10-25 (package HUB5; owner 10-25 17:53 H1 / H2 / H3, 22:36 G11): the 🗃️ Card table (+ Packs view), the 📊 Curves tab and the road check on 📈 Difficulty.
# Their data is computed by tools/hub/hub5_data.py from canonical/cards.json, canonical/upgrade-costs.json, arena_app.js (the game's own XP / energy code, copied as
# text and run by the page, never edited) and the PRO3 road-check files. Read only.
sys.path.insert(0, os.path.join(ROOT, 'tools', 'hub'))
import hub5_data as H5
_hubdir = lambda n: open(os.path.join(ROOT, 'tools', 'hub', n), encoding='utf-8').read()
_ct = H5.card_table(ROOT, CANON, _tix)
CT_INLINE = (f'const CT_DATA = {_js(_ct)};\nconst CT_PACKS = {_js(H5.packs(ROOT, CANON, _tix))};\nconst CT_COLS = {cols};\nconst CT_ROWS = {max(1, math.ceil(len(_thumb_ids) / cols))};\n' + _hubdir('cardtable_tab.js'))
CT_CSS = _hubdir('cardtable_tab.css') + _hubdir('deckopt_summary.css')
DOS_JS = _hubdir('deckopt_summary.js')
_cv = H5.curves(ROOT); _cvc = _cv['code']
CV_INLINE = (f"const CV_DATA = {_js({'upgrade': _cv['upgrade'], 'resources': _cv['resources'], 'rarityLabel': H5.RARITY_LABEL})};\n"
             f"const CV_GAME = (function(){{\n{_cvc['xpToNext']}\nconst ENERGY_MAX_BASE = {_cvc['energyBase']};\nconst ENERGY_REGEN_MS = {_cvc['regenMs']};\n{_cvc['staminaPlaces']}\n{_cvc['mapEnergyBase']}\n{_cvc['levelGate']}\n"
             "return {xpToNext, STAMINA_PLACES, staminaOrder: ['nest', 'forge', 'tavern'], energyBase: ENERGY_MAX_BASE, regenMs: ENERGY_REGEN_MS, mapEnergyBase, levelGateMap};\n})();\n" + _hubdir('curves_tab.js'))
CV_CSS = _hubdir('curves_tab.css')
_fonts = os.path.exists(os.path.join(OUT, 'fonts', 'fonts.css'))  # self-hosted fonts shipped with the Effects Lab
FONT_LINK = '<link rel="stylesheet" href="fonts/fonts.css">' if _fonts else '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">'
index = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bramblewood Master Hub</title>
{FONT_LINK}
<script>/* 2026-10-15: theme choice (auto/light/dark) applied before paint */ try{{ const t = localStorage.getItem('hub.theme'); if(t==='light'||t==='dark') document.documentElement.dataset.theme = t; }}catch(e){{}}</script>
<style>
:root{{--bg:#f4ecd8; --surface:#fffaf0; --surface-2:#efe3c8; --ink:#2b2216; --ink-muted:#6b5a43; --line:#dccaa5; --accent:#2f6b3a; --accent-ink:#fff; --link:#2f5f8a;}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#1c1812; --surface:#26211a; --surface-2:#312a20; --ink:#f1e6cf; --ink-muted:#b8a98c; --line:#4a3f2e; --accent:#7fc28a; --accent-ink:#13200f; --link:#8cc0ea;}}}}
:root[data-theme="dark"]{{--bg:#1c1812; --surface:#26211a; --surface-2:#312a20; --ink:#f1e6cf; --ink-muted:#b8a98c; --line:#4a3f2e; --accent:#7fc28a; --accent-ink:#13200f; --link:#8cc0ea;}}
*{{box-sizing:border-box;}}
html,body{{margin:0; height:100%; background:var(--bg); color:var(--ink); font:16px/1.55 Nunito,system-ui,sans-serif;}}
body{{display:flex; flex-direction:column;}}
header{{display:flex; align-items:center; gap:12px; padding:10px 16px 0; border-bottom:1px solid var(--line); background:var(--surface); flex-wrap:wrap;}}
header h1{{font:800 20px 'Baloo 2',system-ui,sans-serif; margin:0 8px 8px 0; white-space:nowrap;}}
nav[role=tablist]{{display:flex; gap:4px; overflow-x:auto; scrollbar-width:none; max-width:100%;}}
nav[role=tablist] button{{font:700 14px 'Baloo 2',system-ui,sans-serif; border:1px solid transparent; border-bottom:none; background:transparent; color:var(--ink-muted); padding:8px 14px; border-radius:10px 10px 0 0; cursor:pointer; white-space:nowrap;}}
nav[role=tablist] button[aria-selected=true]{{background:var(--bg); color:var(--ink); border-color:var(--line); margin-bottom:-1px;}}
nav[role=tablist] button:focus-visible{{outline:2px solid var(--accent); outline-offset:-2px;}}
main{{flex:1; min-height:0; position:relative;}}
.panel{{position:absolute; inset:0; overflow:auto;}}
.panel[hidden]{{display:none;}}
iframe{{border:0; width:100%; height:100%; display:block; background:var(--bg);}}
.doc{{max-width:900px; margin:0 auto; padding:20px 16px 80px;}}
.doc h1{{font:800 30px 'Baloo 2',system-ui,sans-serif; margin:0 0 8px;}}
.doc h2{{font:800 22px 'Baloo 2',system-ui,sans-serif; margin:28px 0 8px; padding-top:8px; border-top:1px solid var(--line);}}
.doc h3{{font:800 17px 'Baloo 2',system-ui,sans-serif; margin:20px 0 6px;}}
.doc a{{color:var(--link);}}
.doc blockquote{{margin:12px 0; padding:10px 14px; background:var(--surface-2); border-left:4px solid var(--accent); border-radius:8px;}}
.doc code, .doc .doc-ref{{font:600 .88em ui-monospace,SFMono-Regular,Menlo,monospace; background:var(--surface-2); padding:1px 5px; border-radius:5px;}}
.doc table{{border-collapse:collapse; width:100%; font-size:14px; display:block; overflow-x:auto;}}
.doc th,.doc td{{border:1px solid var(--line); padding:6px 8px; text-align:left; vertical-align:top;}}
.doc th{{background:var(--surface-2);}}
.doc li{{margin:2px 0;}}
header .play{{order:1; margin:0 0 8px auto; font:700 13px 'Baloo 2',system-ui,sans-serif; color:var(--accent-ink); background:var(--accent); padding:4px 12px; border-radius:999px; text-decoration:none; white-space:nowrap;}}
nav[role=tablist]{{order:2;}}
header nav[role=tablist]{{order:4; flex-basis:100%;}}
.subtabs{{display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 14px;}}
.subtabs button{{font:700 13px 'Baloo 2',system-ui,sans-serif; padding:5px 12px; border-radius:999px; border:1px solid var(--line); background:var(--surface); color:var(--ink); cursor:pointer;}}
.subtabs button[aria-pressed=true]{{background:var(--accent); color:var(--accent-ink); border-color:var(--accent);}}
.subpane[hidden]{{display:none !important;}}
a.jump.is-on{{font-weight:800; text-decoration:underline;}}
@media (max-width:640px){{ header h1{{font-size:17px;}} }}
.guide .lede{{color:var(--ink-muted);}} .guide .note{{color:var(--ink-muted); font-size:14px; margin:0 0 10px;}}
details.card{{background:var(--surface); border:1px solid var(--line); border-radius:12px; margin:8px 0; padding:0 14px;}}
details.card > summary{{cursor:pointer; padding:12px 0; list-style:none; display:flex; flex-direction:column; gap:2px;}}
details.card > summary::-webkit-details-marker{{display:none;}}
details.card > summary b{{font-family:'Baloo 2',system-ui,sans-serif; font-size:16px;}}
details.card > summary b::before{{content:'▸ '; color:var(--accent);}} details.card[open] > summary b::before{{content:'▾ ';}}
details.card > summary small{{color:var(--ink-muted); font-size:13px;}}
details.card .doc{{padding:0 0 16px; max-width:none;}}
details.card .doc h1{{font-size:22px;}} details.card .doc h2{{font-size:18px;}}
.doc pre{{background:var(--surface-2); padding:10px 12px; border-radius:8px; overflow-x:auto; font-size:13px;}}
.doc pre code{{background:none; padding:0;}}
.pages{{max-width:900px; margin:0 auto; padding:20px 16px 60px;}}
.pages h2{{font:800 22px 'Baloo 2',system-ui,sans-serif; margin:0 0 4px;}}
.pages p{{color:var(--ink-muted); margin:0 0 16px;}}
.pg-grid{{display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:10px;}}
.pg{{display:flex; gap:12px; align-items:flex-start; padding:12px 14px; background:var(--surface); border:1px solid var(--line); border-radius:12px; color:var(--ink); text-decoration:none;}}
.pg:hover{{border-color:var(--accent);}}
.pg-i{{font-size:24px; line-height:1;}}
.pg b{{display:block; font-family:'Baloo 2',system-ui,sans-serif;}}
.pg small{{color:var(--ink-muted); font-size:13px;}}
.dec{{max-width:960px; margin:0 auto; padding:20px 16px 80px;}}
.dec-head h2{{font:800 26px 'Baloo 2',system-ui,sans-serif; margin:0;}} .dec-head p{{color:var(--ink-muted); margin:2px 0 14px;}}
.dec-bar{{display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:10px;}}
.dec-seg{{display:flex; background:var(--surface-2); border:1px solid var(--line); border-radius:999px; padding:3px;}}
.dec-seg button{{font:700 13px Nunito,system-ui,sans-serif; border:0; background:transparent; color:var(--ink-muted); padding:6px 12px; border-radius:999px; cursor:pointer;}}
.dec-seg button[aria-pressed=true]{{background:var(--accent); color:var(--accent-ink);}}
.dec-seg b{{font-weight:800; margin-left:4px; opacity:.85;}}
#decQ{{flex:1; min-width:180px; font:15px Nunito,system-ui,sans-serif; padding:8px 12px; border-radius:999px; border:1px solid var(--line); background:var(--surface); color:var(--ink);}}
.dec-chips{{display:flex; flex-wrap:wrap; gap:6px; margin:0 0 8px;}}
.dec-chips button{{font:700 12px Nunito,system-ui,sans-serif; border:1px solid var(--line); background:var(--surface); color:var(--ink-muted); padding:3px 10px; border-radius:999px; cursor:pointer;}}
.dec-chips button[aria-pressed=true]{{background:var(--ink); color:var(--bg); border-color:var(--ink);}}
.dec-list{{display:grid; gap:10px; margin-top:12px;}}
.dec-card{{background:var(--surface); border:1px solid var(--line); border-left:5px solid #d9a53a; border-radius:12px; padding:12px 14px;}}
.dec-card.done{{border-left-color:var(--accent); opacity:.92;}}
.dec-top{{display:flex; gap:8px; align-items:baseline; flex-wrap:wrap;}}
.dec-id{{font:800 13px ui-monospace,Menlo,monospace; background:var(--surface-2); padding:1px 7px; border-radius:6px;}}
.dec-title{{font:800 17px 'Baloo 2',system-ui,sans-serif;}}
.dec-meta{{margin-left:auto; display:flex; gap:6px; flex-wrap:wrap;}}
.dec-tag{{font:700 11px Nunito,system-ui,sans-serif; padding:1px 8px; border-radius:999px; background:var(--surface-2); color:var(--ink-muted);}}
.dec-body{{margin:6px 0 0; font-size:14.5px;}}
.dec-opts{{margin:6px 0 0; padding-left:20px; font-size:14px;}}
.dec-def, .dec-out{{margin:6px 0 0; font-size:14px;}} .dec-out{{color:var(--accent);}}
.dec-date{{font-size:12px; color:var(--ink-muted); margin-top:6px;}}
.bal{{max-width:1100px; margin:0 auto; padding:20px 16px 80px;}}
.bal-wrap{{overflow-x:auto; margin-top:12px; border-radius:12px; border:1px solid var(--line, rgba(127,127,127,.25));}}
.bal-t{{width:100%; border-collapse:collapse; font-size:13.5px;}}
.bal-t th{{position:sticky; top:0; text-align:left; padding:8px 10px; background:var(--surface-2); color:var(--ink); font-weight:800; border-bottom:2px solid var(--line); cursor:pointer; white-space:nowrap; user-select:none;}}
.bal-t th[aria-sort]::after{{content:' ▾'; opacity:.6;}} .bal-t th[aria-sort=ascending]::after{{content:' ▴';}}
.bal-t td{{padding:6px 10px; border-top:1px solid var(--line, rgba(127,127,127,.18)); white-space:nowrap;}}
.bal-t td.wr{{font-variant-numeric:tabular-nums; font-weight:700;}}
.bal-t tr.v-strong td.wr{{color:#b4235a;}} .bal-t tr.v-weak td.wr{{color:#2563a8;}} .bal-t tr.v-ok td.wr{{color:#2f7d43;}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]) .bal-t tr.v-strong td.wr{{color:#ff7aa8;}} :root:not([data-theme="light"]) .bal-t tr.v-weak td.wr{{color:#7fb6ff;}} :root:not([data-theme="light"]) .bal-t tr.v-ok td.wr{{color:#7fd38f;}}}}
:root[data-theme="dark"] .bal-t tr.v-strong td.wr{{color:#ff7aa8;}} :root[data-theme="dark"] .bal-t tr.v-weak td.wr{{color:#7fb6ff;}} :root[data-theme="dark"] .bal-t tr.v-ok td.wr{{color:#7fd38f;}}
.bal-bar{{display:inline-block; width:80px; height:8px; border-radius:4px; background:rgba(127,127,127,.18); position:relative; vertical-align:middle; margin-left:6px;}}
.bal-bar i{{position:absolute; top:0; bottom:0; background:rgba(47,125,67,.35); border-radius:4px;}} .bal-bar b{{position:absolute; top:-2px; width:3px; height:12px; background:currentColor; border-radius:2px;}}
.dec-empty{{color:var(--ink-muted); padding:20px; text-align:center;}}
.dk-t{{border-collapse:collapse; font-size:13px; margin:6px 0 10px; width:100%;}} .dk-t th, .dk-t td{{text-align:left; padding:3px 8px; border-top:1px solid var(--line, rgba(127,127,127,.2));}} .dk-t th{{font-weight:800;}}
.dk-t s{{opacity:.6;}} .dk-two{{display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;}} .dk-two > div{{min-width:0; overflow-x:auto;}}
.dk-order li{{margin:6px 0;}} #p-decks details{{margin:4px 0;}} #p-decks summary{{cursor:pointer; padding:4px 0;}} .dk-map > details{{margin-left:16px;}}
</style><style>{HUB_CSS}</style><style>{UT_CSS}</style><style>{HB_CSS}</style><style>{CH_CSS}</style><style>{CT_CSS}</style><style>{CV_CSS}</style><style>{PP_CSS}</style><style>{LIB_CSS}</style></head><body>
<header><h1><a href="#master" data-tab="master">🌿 Bramblewood</a></h1>
<div class="hs" role="search"><input type="search" id="hubQ" placeholder="Search cards, changes, decisions, docs…  ( / )" aria-label="Search the hub" autocomplete="off" aria-controls="hubRes" aria-expanded="false"><div class="hs-res" id="hubRes" role="listbox" hidden></div></div>
<button type="button" class="thm" id="hubTheme" aria-label="Colour theme" title="Colour theme: auto / light / dark">🌓 Auto</button>
<a class="play" href="https://bramblewood-arena.vercel.app" target="_blank" rel="noopener">🎮 <span>Play ↗</span></a></header>
<nav role="tablist" aria-label="Pages" aria-orientation="vertical">
<button role="tab" id="t-master" aria-controls="p-master" data-tab="master">🏠 Home</button>
<button role="tab" id="t-actions" aria-controls="p-actions" data-tab="actions">🎯 Action items</button>
<button role="tab" id="t-cards" aria-controls="p-cards" data-tab="cards">🎴 Cards</button>
<button role="tab" id="t-balance" aria-controls="p-balance" data-tab="balance">⚖️ Balance</button>
<button role="tab" id="t-budget" aria-controls="p-budget" data-tab="budget">🎚️ Budget &amp; stats</button>
<button role="tab" id="t-costs" aria-controls="p-costs" data-tab="costs">🧮 Skill costs</button>
<button role="tab" id="t-ucosts" aria-controls="p-ucosts" data-tab="ucosts">💰 Upgrade costs</button>
<button role="tab" id="t-units" aria-controls="p-units" data-tab="units">🗂 Units by theme</button>
<button role="tab" id="t-progress" aria-controls="p-progress" data-tab="progress">📚 Progression plan</button>
<button role="tab" id="t-deckopt" aria-controls="p-deckopt" data-tab="deckopt">🧬 Deck optimizer</button>
<button role="tab" id="t-resources" aria-controls="p-resources" data-tab="resources">🪙 Resources</button>
<button role="tab" id="t-chips" aria-controls="p-chips" data-tab="chips">🏷️ Chips &amp; FX</button>
<button role="tab" id="t-ctable" aria-controls="p-ctable" data-tab="ctable">🗃️ Card table</button>
<button role="tab" id="t-curves" aria-controls="p-curves" data-tab="curves">📊 Curves</button>
<button role="tab" id="t-curve" aria-controls="p-curve" data-tab="curve">📈 Difficulty</button>
<button role="tab" id="t-decks" aria-controls="p-decks" data-tab="decks">🃏 Decks</button>
<button role="tab" id="t-dialogues" aria-controls="p-dialogues" data-tab="dialogues">💬 Dialogues</button>
<button role="tab" id="t-decisions" aria-controls="p-decisions" data-tab="decisions">🗳️ Decisions</button>
<button role="tab" id="t-design" aria-controls="p-design" data-tab="design">📐 Design</button>
<button role="tab" id="t-changelog" aria-controls="p-changelog" data-tab="changelog">🗒️ Changelog</button>
<button role="tab" id="t-doclib" aria-controls="p-doclib" data-tab="doclib">📖 Library</button>
<button role="tab" id="t-lab" aria-controls="p-lab" data-tab="lab">✨ Effects Lab</button>
<button role="tab" id="t-playground" aria-controls="p-playground" data-tab="playground">🧪 VFX Playground</button>
<button role="tab" id="t-library" aria-controls="p-library" data-tab="library">🖼️ Visual Library</button>
<button role="tab" id="t-guide" aria-controls="p-guide" data-tab="guide">🧠 Claude's guide</button>
</nav>
<main>
<section class="panel" id="p-master" role="tabpanel" aria-labelledby="t-master">{home_html}</section>
<section class="panel" id="p-actions" role="tabpanel" aria-labelledby="t-actions" hidden>{lazy('<article class="doc">' + body + '</article>')}</section>
{cards_panel}
<section class="panel" id="p-lab" role="tabpanel" aria-labelledby="t-lab" hidden><iframe title="Effects Lab" data-src="effects.html"></iframe></section>
<section class="panel" id="p-playground" role="tabpanel" aria-labelledby="t-playground" hidden><iframe title="VFX Playground" data-src="playground.html"></iframe></section>
<section class="panel" id="p-library" role="tabpanel" aria-labelledby="t-library" hidden><iframe title="Visual Library" data-src="library.html"></iframe></section>
<section class="panel" id="p-decisions" role="tabpanel" aria-labelledby="t-decisions" hidden><div class="dec">
<div class="dec-head"><h2>Decisions</h2><p>What's waiting on you, and what's been decided. Reply in chat with the id and your choice, e.g. "E1 yes".</p></div>
<div class="dec-bar"><div class="dec-seg" role="group" aria-label="Status"><button data-st="YET" aria-pressed="true">⏳ Yet to decide <b id="cYET"></b></button><button data-st="DONE" aria-pressed="false">✅ Done <b id="cDONE"></b></button><button data-st="ALL" aria-pressed="false">All</button></div>
<input type="search" id="decQ" placeholder="Search decisions…" aria-label="Search decisions"></div>
<div class="dec-chips" id="decAreas" role="group" aria-label="Area"></div>
<div class="dec-chips" id="decKinds" role="group" aria-label="Type"></div>
<div id="decList" class="dec-list" aria-live="polite"></div></div></section>
<section class="panel" id="p-changelog" role="tabpanel" aria-labelledby="t-changelog" hidden>{lazy('<article class="doc cl-doc">' + changelog + '</article>')}</section>
<section class="panel" id="p-balance" role="tabpanel" aria-labelledby="t-balance" hidden><div class="bal">
<div class="dec-head"><h2>Card balance</h2><p>Each card's win rate in simulated matches (<span id="balN"></span>). About 50% means it adds nothing over the reference deck; the band is what its rarity should deliver. The method and findings are in the 📐 Design tab → Card balance report. Click a column to sort.</p>
<p class="hb-xlink"><b>Edit the numbers:</b> <a href="#budget" data-tab="budget">🎚️ Budget &amp; stats</a> (the budget constants, every card's Attack / Health, the special monsters) · <a href="#costs" data-tab="costs">🧮 Skill costs</a> (S of every skill, trigger and action; measured S; Combos).</p></div>
<div class="dec-bar"><div class="dec-seg" role="group" aria-label="Verdict" id="balSeg"><button data-v="" aria-pressed="true">All</button><button data-v="strong" aria-pressed="false">Too strong</button><button data-v="weak" aria-pressed="false">Too weak</button><button data-v="ok" aria-pressed="false">In band</button><button data-v="norar" aria-pressed="false">No rarity</button><button data-v="fix" aria-pressed="false">Has a fix</button></div>
<input type="search" id="balQ" placeholder="Search cards…" aria-label="Search cards"></div>
<div class="bal-wrap"><table class="bal-t"><thead><tr><th data-k="name">Card</th><th data-k="rarity">Rarity</th><th data-k="cost">Cost</th><th data-k="wait">Wait</th><th data-k="attack">Atk</th><th data-k="health">HP</th><th data-k="winRate">Win %</th><th data-k="band">Band</th><th data-k="fix">Suggestion</th></tr></thead><tbody id="balBody"></tbody></table></div></div></section>
<section class="panel" id="p-budget" role="tabpanel" aria-labelledby="t-budget" hidden><div class="bal hb" id="hbHost"><p class="dec-empty">Loading the budget…</p></div></section>
<section class="panel" id="p-costs" role="tabpanel" aria-labelledby="t-costs" hidden><div class="bal sc" id="scHost"><p class="dec-empty">Loading the cost table…</p></div></section>
<section class="panel" id="p-ucosts" role="tabpanel" aria-labelledby="t-ucosts" hidden><div class="bal sc" id="ucHost"><p class="dec-empty">Loading the upgrade costs…</p></div></section>
<section class="panel" id="p-units" role="tabpanel" aria-labelledby="t-units" hidden><p class="hb-xlink pp-xlink"><b>📚 Progression plan:</b> your definitions (base, skirmish base, Packs 1-3, the faction pool ...), targets vs today and the cards by advancement are in <a href="#progress" data-tab="progress">their own tab</a>.</p><div class="bal ut" id="utHost"><p class="dec-empty">{'Loading the units…' if _ut else 'Run node tools/unit_themes.js, then rebuild the hub.'}</p></div></section>
<section class="panel" id="p-progress" role="tabpanel" aria-labelledby="t-progress" hidden><div class="bal pp" id="ppHost"><p class="dec-empty">{'Loading the plan…' if _pp else 'Run node tools/progression_plan_2026_10_23.js, then rebuild the hub.'}</p></div></section>
<section class="panel" id="p-deckopt" role="tabpanel" aria-labelledby="t-deckopt" hidden>{lazy(deckopt_html)}</section>
<section class="panel" id="p-resources" role="tabpanel" aria-labelledby="t-resources" hidden><div class="bal rs" id="rsHost"><p class="dec-empty">{'Loading the resources…' if _rs else 'Run node tools/resources_week_2026_10_23.js, then rebuild the hub.'}</p></div></section>
<section class="panel" id="p-chips" role="tabpanel" aria-labelledby="t-chips" hidden><div class="bal ch" id="chHost"><p class="dec-empty">{'Loading the chips…' if _ch else 'Run node tools/hub/chips_inventory.js, then rebuild the hub.'}</p></div></section>
<section class="panel" id="p-ctable" role="tabpanel" aria-labelledby="t-ctable" hidden><div class="bal ct" id="ctHost"><p class="dec-empty">Loading the card table…</p></div></section>
<section class="panel" id="p-curves" role="tabpanel" aria-labelledby="t-curves" hidden><div class="bal cv" id="cvHost"><p class="dec-empty">Loading the curves…</p></div></section>
{curve_panel}
{decks_panel}
{dialogues_panel}
<section class="panel" id="p-doclib" role="tabpanel" aria-labelledby="t-doclib" hidden>{lazy(LIB_HTML)}</section>
<section class="panel" id="p-design" role="tabpanel" aria-labelledby="t-design" hidden>{lazy(design_html)}</section>
<section class="panel" id="p-guide" role="tabpanel" aria-labelledby="t-guide" hidden>{lazy(guide)}</section>
</main>
<script>
const DEC = {decisions_json};
(function(){{
  const items = DEC.items || [], esc = s=> String(s||'').replace(/[&<>"]/g, c=> ({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}})[c]);
  let st = 'YET', area = '', kind = '', q = '';
  const count = s=> items.filter(i=> i.status===s).length;
  document.getElementById('cYET').textContent = count('YET'); document.getElementById('cDONE').textContent = count('DONE');
  const chips = (el, vals, get, set)=>{{ el.innerHTML = '<button data-v="" aria-pressed="true">All</button>' + vals.map(v=> `<button data-v="${{esc(v)}}" aria-pressed="false">${{esc(v)}}</button>`).join('');
    el.onclick = e=>{{ const b = e.target.closest('button'); if(!b) return; set(b.dataset.v); el.querySelectorAll('button').forEach(x=> x.setAttribute('aria-pressed', x===b)); render(); }}; }};
  chips(document.getElementById('decAreas'), [...new Set(items.map(i=> i.area))].sort(), ()=>area, v=> area = v);
  chips(document.getElementById('decKinds'), [...new Set(items.map(i=> i.kind))].sort(), ()=>kind, v=> kind = v);
  document.querySelectorAll('.dec-seg button').forEach(b=> b.onclick = ()=>{{ st = b.dataset.st; document.querySelectorAll('.dec-seg button').forEach(x=> x.setAttribute('aria-pressed', x===b)); render(); }});
  document.getElementById('decQ').oninput = e=>{{ q = e.target.value.trim().toLowerCase(); render(); }};
  // 2026-10-15: the global search and the Home tab open one decision: All statuses, searched by its id.
  window.hubFindDecision = id=>{{ st = 'ALL'; area = ''; kind = ''; document.querySelectorAll('.dec-seg button').forEach(x=> x.setAttribute('aria-pressed', x.dataset.st==='ALL'));
    document.querySelectorAll('#decAreas button, #decKinds button').forEach(x=> x.setAttribute('aria-pressed', x.dataset.v===''));
    const inp = document.getElementById('decQ'); inp.value = id; q = id.toLowerCase(); render();
    const card = [...document.querySelectorAll('#decList .dec-card')].find(c=> c.querySelector('.dec-id').textContent.toLowerCase()===q); if(card){{ card.classList.add('flash'); card.scrollIntoView({{block:'start'}}); }} }};
  function render(){{
    const list = items.filter(i=> (st==='ALL' || i.status===st) && (!area || i.area===area) && (!kind || i.kind===kind) && (!q || JSON.stringify(i).toLowerCase().includes(q)));
    document.getElementById('decList').innerHTML = list.length ? list.map(i=> `<article class="dec-card ${{i.status==='DONE'?'done':''}}">
      <div class="dec-top"><span class="dec-id">${{esc(i.id)}}</span><span class="dec-title">${{esc(i.title)}}</span><span class="dec-meta"><span class="dec-tag">${{i.status==='DONE'?'✅ Done':'⏳ Yet'}}</span><span class="dec-tag">${{esc(i.kind)}}</span><span class="dec-tag">${{esc(i.area)}}</span></span></div>
      ${{i.body ? `<p class="dec-body">${{esc(i.body)}}</p>` : ''}}
      ${{(i.options||[]).length && i.status!=='DONE' ? `<ul class="dec-opts">${{i.options.map(o=> `<li>${{esc(o)}}</li>`).join('')}}</ul>` : ''}}
      ${{i.default && i.status!=='DONE' ? `<p class="dec-def"><b>Default:</b> ${{esc(i.default)}}</p>` : ''}}
      ${{i.outcome ? `<p class="dec-out"><b>Outcome:</b> ${{esc(i.outcome)}}</p>` : ''}}
      <div class="dec-date">Asked ${{esc(i.asked||'—')}}${{i.decided ? ' · decided ' + esc(i.decided) : ''}}</div></article>`).join('') : '<p class="dec-empty">Nothing matches.</p>';
  }}
  render();
}})();
(function(){{
  const B = {bal_json}, rows = B.rows, esc = s=> String(s==null?'':s).replace(/[&<>"]/g, c=> ({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}})[c]);
  document.getElementById('balN').textContent = `${{rows.length}} cards, ${{B.games}} games each, ${{B.generated}}`;
  let v = '', q = '', key = 'winRate', dir = -1;
  const fixTxt = r=> r.suggest ? `${{r.suggest.stat==='attack'?'Atk':'HP'}} ${{r.suggest.from}} → ${{r.suggest.to}} (${{r.suggest.winRate}}%)` : r.suggestRarity ? `rarity: ${{r.suggestRarity}}` : '';
  const val = (r, k)=> k==='band' ? r.band[0] : k==='fix' ? fixTxt(r) : r[k]==null ? '' : r[k];
  function render(){{
    const list = rows.filter(r=> (!v || (v==='norar' ? !r.rarity : v==='fix' ? !!r.suggest : r.verdict===v)) && (!q || (r.name+' '+r.id+' '+(r.skills||[]).join(' ')).toLowerCase().includes(q)))
      .sort((a,b)=>{{ const x = val(a,key), y = val(b,key); return (typeof x==='number' && typeof y==='number' ? x-y : String(x).localeCompare(String(y))) * dir; }});
    document.getElementById('balBody').innerHTML = list.map(r=> `<tr class="v-${{r.verdict}}"><td>${{esc(r.name)}}${{(r.skills||[]).length ? ` <small style="opacity:.6">${{esc(r.skills.join(', '))}}</small>` : ''}}</td><td>${{esc(r.rarity||'–')}}</td><td>${{r.cost}}</td><td>${{r.wait}}</td><td>${{r.attack}}</td><td>${{r.health}}</td>
      <td class="wr">${{r.winRate}}<span class="bal-bar"><i style="left:${{r.band[0]}}%; width:${{r.band[1]-r.band[0]}}%"></i><b style="left:calc(${{Math.min(100,r.winRate)}}% - 1px)"></b></span></td><td>${{Math.round(r.band[0])}}–${{Math.round(r.band[1])}}</td><td>${{esc(fixTxt(r))}}</td></tr>`).join('') || '<tr><td colspan="9" class="dec-empty">Nothing matches.</td></tr>';
    document.querySelectorAll('.bal-t th').forEach(th=> th.dataset.k===key ? th.setAttribute('aria-sort', dir>0?'ascending':'descending') : th.removeAttribute('aria-sort'));
  }}
  document.querySelectorAll('.bal-t th').forEach(th=> th.onclick = ()=>{{ if(key===th.dataset.k) dir = -dir; else {{ key = th.dataset.k; dir = (key==='name'||key==='rarity'||key==='fix') ? 1 : -1; }} render(); }});
  document.querySelectorAll('#balSeg button').forEach(b=> b.onclick = ()=>{{ v = b.dataset.v; if(key==='winRate') dir = v==='weak' ? 1 : -1; /* too weak: weakest first */ document.querySelectorAll('#balSeg button').forEach(x=> x.setAttribute('aria-pressed', x===b)); render(); }});
  document.getElementById('balQ').oninput = e=>{{ q = e.target.value.trim().toLowerCase(); render(); }};
  render();
}})();
const tabs = [...document.querySelectorAll('[role=tab]')];
// 2026-10-15: lazy panels are stamped from their <template> on first show; the open tab is kept in #hash and
// localStorage (the artifact frame may drop the hash); hub.onShow lets the Cards tab render on first open.
const hub = window.hub = {{ onShow: {{}} }};
function stamp(p){{ const t = p && p.querySelector(':scope > template.lazy'); if(t){{ t.replaceWith(t.content.cloneNode(true)); }} }}
function show(id, keepScroll){{
  if(!document.getElementById('p-'+id)) id = 'master';
  tabs.forEach(t=>{{ const on = t.dataset.tab===id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; document.getElementById('p-'+t.dataset.tab).hidden = !on; }});
  const p = document.getElementById('p-'+id); stamp(p); if(hub.onShow[id]) hub.onShow[id]();
  const cur = tabs.find(t=> t.dataset.tab===id); if(cur) cur.scrollIntoView({{inline:'nearest', block:'nearest'}});
  const fr = document.querySelector('#p-'+id+' iframe'); if(fr && !fr.src) fr.src = fr.dataset.src;
  try{{ history.replaceState(null, '', '#'+id); }}catch(e){{}}
  try{{ localStorage.setItem('hub.tab', id); }}catch(e){{}}
}}
hub.show = show; hub.showSub = (id)=> showSub(id);
function showSub(id){{ const pane = document.getElementById(id); if(!pane) return; const g = pane.dataset.group; stamp(pane);
  document.querySelectorAll('.subpane[data-group="'+g+'"]').forEach(p=> p.hidden = p !== pane);
  document.querySelectorAll('.subtabs[data-group="'+g+'"] button').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.show === id)));
  document.querySelectorAll('a.jump').forEach(a=> a.classList.toggle('is-on', a.getAttribute('href') === '#'+id)); }}
document.addEventListener('click', e=>{{ const sb = e.target.closest('.subtabs button[data-show]'); if(sb){{ showSub(sb.dataset.show); return; }}
  const j = e.target.closest('a.jump'); if(j){{ e.preventDefault(); showSub(j.getAttribute('href').slice(1)); const d = document.querySelector(j.getAttribute('href')); if(d) d.scrollIntoView({{behavior:'smooth', block:'nearest'}}); return; }}
  const dj = e.target.closest('[data-dec]'); if(dj){{ e.preventDefault(); hub.go({{tab:'decisions', dec: dj.dataset.dec}}); return; }}
  const t = e.target.closest('[data-tab]'); if(!t) return; e.preventDefault(); show(t.dataset.tab); }});
document.querySelector('[role=tablist]').addEventListener('keydown', e=>{{
  const i = tabs.findIndex(t=> t.getAttribute('aria-selected')==='true'); let j = i;
  if(e.key==='ArrowRight'||e.key==='ArrowDown') j = (i+1)%tabs.length; else if(e.key==='ArrowLeft'||e.key==='ArrowUp') j = (i-1+tabs.length)%tabs.length; else return;
  e.preventDefault(); show(tabs[j].dataset.tab); tabs[j].focus();
}});
</script>
<script>const CARDS = {CARDS_JSON};
const SEARCH = {SEARCH_JSON};
{HUB_JS}
{LIB_JS}
{SC_INLINE}
{UT_INLINE}
{PP_INLINE}
{RS_INLINE}
{UC_INLINE}
{HB_INLINE}
{CH_INLINE}
{CT_INLINE}
{DOS_JS}
{CV_INLINE}
show((location.hash.slice(1)) || (()=>{{ try{{ return localStorage.getItem('hub.tab'); }}catch(e){{ return ''; }} }})() || 'master');
</script></body></html>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(index)
n = sum(len(fs) for _, _, fs in os.walk(OUT))
print('hub files:', n)
