#!/usr/bin/env python3
"""Builds the Bramblewood hub artifact in .hub/: one page with tabs for the Master doc,
the Effects Lab and the Visual Library, plus links to every other related page.
    python3 tools/hub/build_hub.py   (run tools/effects-lab/build.py first)
The artifact limit is 511 files per version, so near-duplicate screenshots are pruned
(perceptual hash, same area) until the whole hub fits."""
import json, os, re, shutil, html as H
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
budget = MAX_FILES - len(lab_files) - 3
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
# 2026-10-09 (user: "Summarise all the most important action items in the master artefact. Remove the
# master md, don't use it"): the landing tab is the short Action items list; MASTER.md is retired from the hub.
body = md_html(rd('docs', 'action-items.md')).replace('<span class="doc-ref" title="Project doc: claude/card-balance-2026-10-09.md">report</span>', '<a href="#balance" data-tab="balance">report</a>')
BAL = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'card-balance.json'), encoding='utf-8'))
bal_json = json.dumps({'games': BAL['games'], 'generated': BAL['generated'], 'rows': [{k: r.get(k) for k in ('id','name','rarity','cost','wait','attack','health','skills','winRate','band','verdict','source','suggest','suggestRarity')} for r in BAL['rows']]}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
changelog = md_html(rd('docs', 'CHANGELOG.md'))

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
    docs_html += f'<div class="subpane" data-group="guide" id="doc-{f[:-3]}" hidden><h3>claude/{f} <small class="note">read before: {H.escape(t[0].lower() + t[1:])}</small></h3><div class="doc">{md_html(txt)}</div></div>'
skills_html = ''.join(skill_card(f) for f in SKILLS)
# Design tab (2026-10-09, user: "In our master artefact, come up with skills and effects + audit what we
# have"; "write down your ideas or my ideas in the master sheet in the design section"): the design
# sheets and audits, newest first, each a collapsible card (the first one open).
DESIGN = [
  ('Fields, day and night, Lumber from cards', 'fields-and-day-night-2026-10-09.md'),
  ('Starter decks: every Basic card, for reorganising', 'starter-decks-2026-10-10.md'),
  ('Card levels: base level and growth schedule', 'card-levels-2026-10-10.md'),
  ('Inspiration: Super Auto Pets and Tooth and Nail units', 'inspo-sap-tooth-and-nail-2026-10-10.md'),
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
    design_html += f'<div class="subpane" data-group="design" id="design-{f[:-3]}"{"" if k == 0 else " hidden"}><p class="note">claude/{f}</p><div class="doc">{md_html(open(pth, encoding="utf-8").read())}</div></div>'
design_html += '</div>'
rules_html = ''.join(f'<li>{r}</li>' for r in RULES)
guide = ('<div class="doc guide"><h1>Claude\'s guide</h1>'
  '<p class="lede">What Claude reads and follows before working on Bramblewood. Skills are step-by-step procedures; the docs below are the rules and context for each area.</p>'
  f'<h2>Standing instructions</h2><ul>{rules_html}</ul>'
  '<h2>Skills</h2><p class="note">Proposed on 6 Oct. Save them from the review card in chat; once saved, they load automatically when a task matches.</p>' + skills_html +
  f'<h2>Read before…</h2><table><thead><tr><th>Task</th><th>Doc</th></tr></thead><tbody>{rows}</tbody></table>'
  '<h2>The docs</h2><p class="note">Snapshots of the project docs at build time. The project copy is the source of truth. Pick one in the table above.</p>' + docs_html + '</div>')


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
    return '\n'.join(out)
open(os.path.join(ROOT, 'docs', 'decisions.md'), 'w', encoding='utf-8').write(_dec_md(DECISIONS))
decisions_json = _json.dumps(DECISIONS, ensure_ascii=False).replace('</', '<\\/')
index = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bramblewood Master Hub</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
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
</style></head><body>
<header><h1>🌿 Bramblewood</h1><a class="play" href="https://bramblewood-arena.vercel.app" target="_blank" rel="noopener">🎮 Play ↗</a>
<nav role="tablist" aria-label="Pages">
<button role="tab" id="t-master" aria-controls="p-master" data-tab="master">🎯 Action items</button>
<button role="tab" id="t-balance" aria-controls="p-balance" data-tab="balance">⚖️ Balance</button>
<button role="tab" id="t-decisions" aria-controls="p-decisions" data-tab="decisions">🗳️ Decisions</button>
<button role="tab" id="t-design" aria-controls="p-design" data-tab="design">📐 Design</button>
<button role="tab" id="t-changelog" aria-controls="p-changelog" data-tab="changelog">🗒️ Changelog</button>
<button role="tab" id="t-lab" aria-controls="p-lab" data-tab="lab">✨ Effects Lab</button>
<button role="tab" id="t-library" aria-controls="p-library" data-tab="library">🖼️ Visual Library</button>
<button role="tab" id="t-guide" aria-controls="p-guide" data-tab="guide">🧠 Claude's guide</button>
</nav></header>
<main>
<section class="panel" id="p-master" role="tabpanel" aria-labelledby="t-master"><article class="doc">{body}</article></section>
<section class="panel" id="p-lab" role="tabpanel" aria-labelledby="t-lab" hidden><iframe title="Effects Lab" data-src="effects.html"></iframe></section>
<section class="panel" id="p-library" role="tabpanel" aria-labelledby="t-library" hidden><iframe title="Visual Library" data-src="library.html"></iframe></section>
<section class="panel" id="p-decisions" role="tabpanel" aria-labelledby="t-decisions" hidden><div class="dec">
<div class="dec-head"><h2>Decisions</h2><p>What's waiting on you, and what's been decided. Reply in chat with the id and your choice, e.g. "E1 yes".</p></div>
<div class="dec-bar"><div class="dec-seg" role="group" aria-label="Status"><button data-st="YET" aria-pressed="true">⏳ Yet to decide <b id="cYET"></b></button><button data-st="DONE" aria-pressed="false">✅ Done <b id="cDONE"></b></button><button data-st="ALL" aria-pressed="false">All</button></div>
<input type="search" id="decQ" placeholder="Search decisions…" aria-label="Search decisions"></div>
<div class="dec-chips" id="decAreas" role="group" aria-label="Area"></div>
<div class="dec-chips" id="decKinds" role="group" aria-label="Type"></div>
<div id="decList" class="dec-list" aria-live="polite"></div></div></section>
<section class="panel" id="p-changelog" role="tabpanel" aria-labelledby="t-changelog" hidden><article class="doc">{changelog}</article></section>
<section class="panel" id="p-balance" role="tabpanel" aria-labelledby="t-balance" hidden><div class="bal">
<div class="dec-head"><h2>Card balance</h2><p>Each card's win rate in simulated matches (<span id="balN"></span>). About 50% means it adds nothing over the reference deck; the band is what its rarity should deliver. The method and findings are in the 📐 Design tab → Card balance report. Click a column to sort.</p></div>
<div class="dec-bar"><div class="dec-seg" role="group" aria-label="Verdict" id="balSeg"><button data-v="" aria-pressed="true">All</button><button data-v="strong" aria-pressed="false">Too strong</button><button data-v="weak" aria-pressed="false">Too weak</button><button data-v="ok" aria-pressed="false">In band</button><button data-v="norar" aria-pressed="false">No rarity</button><button data-v="fix" aria-pressed="false">Has a fix</button></div>
<input type="search" id="balQ" placeholder="Search cards…" aria-label="Search cards"></div>
<div class="bal-wrap"><table class="bal-t"><thead><tr><th data-k="name">Card</th><th data-k="rarity">Rarity</th><th data-k="cost">Cost</th><th data-k="wait">Wait</th><th data-k="attack">Atk</th><th data-k="health">HP</th><th data-k="winRate">Win %</th><th data-k="band">Band</th><th data-k="fix">Suggestion</th></tr></thead><tbody id="balBody"></tbody></table></div></div></section>
<section class="panel" id="p-design" role="tabpanel" aria-labelledby="t-design" hidden>{design_html}</section>
<section class="panel" id="p-guide" role="tabpanel" aria-labelledby="t-guide" hidden>{guide}</section>
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
function show(id){{
  if(!document.getElementById('p-'+id)) id = 'master';
  tabs.forEach(t=>{{ const on = t.dataset.tab===id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; document.getElementById('p-'+t.dataset.tab).hidden = !on; }});
  const cur = tabs.find(t=> t.dataset.tab===id); if(cur) cur.scrollIntoView({{inline:'nearest', block:'nearest'}});
  const fr = document.querySelector('#p-'+id+' iframe'); if(fr && !fr.src) fr.src = fr.dataset.src;
  try{{ history.replaceState(null, '', '#'+id); }}catch(e){{}}
}}
function showSub(id){{ const pane = document.getElementById(id); if(!pane) return; const g = pane.dataset.group;
  document.querySelectorAll('.subpane[data-group="'+g+'"]').forEach(p=> p.hidden = p !== pane);
  document.querySelectorAll('.subtabs[data-group="'+g+'"] button').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.show === id)));
  document.querySelectorAll('a.jump').forEach(a=> a.classList.toggle('is-on', a.getAttribute('href') === '#'+id)); }}
document.addEventListener('click', e=>{{ const sb = e.target.closest('.subtabs button[data-show]'); if(sb){{ showSub(sb.dataset.show); return; }}
  const j = e.target.closest('a.jump'); if(j){{ e.preventDefault(); showSub(j.getAttribute('href').slice(1)); const d = document.querySelector(j.getAttribute('href')); if(d) d.scrollIntoView({{behavior:'smooth', block:'nearest'}}); return; }} const t = e.target.closest('[data-tab]'); if(!t) return; e.preventDefault(); show(t.dataset.tab); }});
document.querySelector('[role=tablist]').addEventListener('keydown', e=>{{
  const i = tabs.findIndex(t=> t.getAttribute('aria-selected')==='true'); let j = i;
  if(e.key==='ArrowRight') j = (i+1)%tabs.length; else if(e.key==='ArrowLeft') j = (i-1+tabs.length)%tabs.length; else return;
  show(tabs[j].dataset.tab); tabs[j].focus();
}});
show((location.hash||'#master').slice(1));
</script></body></html>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(index)
n = sum(len(fs) for _, _, fs in os.walk(OUT))
print('hub files:', n)
