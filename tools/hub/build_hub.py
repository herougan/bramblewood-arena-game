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
    return re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', body)
rd = lambda *p: open(os.path.join(ROOT, *p), encoding='utf-8').read()
body = md_html(rd('docs', 'MASTER.md'))
changelog = md_html(rd('docs', 'CHANGELOG.md'))

# 4) Claude's guide: standing instructions, skills, and the docs to read before a task.
RULES = [
  'End every update with the Master doc in view (<code>project_write claude/MASTER.md</code>, <code>present_to_user: true</code>).',
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
    docs_html += f'<details class="card" id="doc-{f[:-3]}"><summary><b>claude/{f}</b><small>Read before: {H.escape(t[0].lower() + t[1:])}</small></summary><div class="doc">{md_html(txt)}</div></details>'
skills_html = ''.join(skill_card(f) for f in SKILLS)
rules_html = ''.join(f'<li>{r}</li>' for r in RULES)
guide = ('<div class="doc guide"><h1>Claude\'s guide</h1>'
  '<p class="lede">What Claude reads and follows before working on Bramblewood. Skills are step-by-step procedures; the docs below are the rules and context for each area.</p>'
  f'<h2>Standing instructions</h2><ul>{rules_html}</ul>'
  '<h2>Skills</h2><p class="note">Proposed on 6 Oct. Save them from the review card in chat; once saved, they load automatically when a task matches.</p>' + skills_html +
  f'<h2>Read before…</h2><table><thead><tr><th>Task</th><th>Doc</th></tr></thead><tbody>{rows}</tbody></table>'
  '<h2>The docs</h2><p class="note">Snapshots of the project docs at build time. The project copy is the source of truth.</p>' + docs_html + '</div>')

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
header .play{{order:3; margin:0 0 8px auto; font:700 13px 'Baloo 2',system-ui,sans-serif; color:var(--accent-ink); background:var(--accent); padding:4px 12px; border-radius:999px; text-decoration:none; white-space:nowrap;}}
nav[role=tablist]{{order:2;}}
@media (max-width:640px){{ header h1{{font-size:17px;}} nav[role=tablist]{{order:4; flex-basis:100%;}} }}
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
</style></head><body>
<header><h1>🌿 Bramblewood</h1><a class="play" href="https://bramblewood-arena.vercel.app" target="_blank" rel="noopener">🎮 Play ↗</a>
<nav role="tablist" aria-label="Pages">
<button role="tab" id="t-master" aria-controls="p-master" data-tab="master">📜 Master</button>
<button role="tab" id="t-changelog" aria-controls="p-changelog" data-tab="changelog">🗒️ Changelog</button>
<button role="tab" id="t-lab" aria-controls="p-lab" data-tab="lab">✨ Effects Lab</button>
<button role="tab" id="t-library" aria-controls="p-library" data-tab="library">🖼️ Visual Library</button>
<button role="tab" id="t-guide" aria-controls="p-guide" data-tab="guide">🧠 Claude's guide</button>
</nav></header>
<main>
<section class="panel" id="p-master" role="tabpanel" aria-labelledby="t-master"><article class="doc">{body}</article></section>
<section class="panel" id="p-lab" role="tabpanel" aria-labelledby="t-lab" hidden><iframe title="Effects Lab" data-src="effects.html"></iframe></section>
<section class="panel" id="p-library" role="tabpanel" aria-labelledby="t-library" hidden><iframe title="Visual Library" data-src="library.html"></iframe></section>
<section class="panel" id="p-changelog" role="tabpanel" aria-labelledby="t-changelog" hidden><article class="doc">{changelog}</article></section>
<section class="panel" id="p-guide" role="tabpanel" aria-labelledby="t-guide" hidden>{guide}</section>
</main>
<script>
const tabs = [...document.querySelectorAll('[role=tab]')];
function show(id){{
  if(!document.getElementById('p-'+id)) id = 'master';
  tabs.forEach(t=>{{ const on = t.dataset.tab===id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; document.getElementById('p-'+t.dataset.tab).hidden = !on; }});
  const cur = tabs.find(t=> t.dataset.tab===id); if(cur) cur.scrollIntoView({{inline:'nearest', block:'nearest'}});
  const fr = document.querySelector('#p-'+id+' iframe'); if(fr && !fr.src) fr.src = fr.dataset.src;
  try{{ history.replaceState(null, '', '#'+id); }}catch(e){{}}
}}
document.addEventListener('click', e=>{{ const j = e.target.closest('a.jump'); if(j){{ e.preventDefault(); const d = document.querySelector(j.getAttribute('href')); if(d){{ d.open = true; d.scrollIntoView({{behavior:'smooth', block:'start'}}); }} return; }} const t = e.target.closest('[data-tab]'); if(!t) return; e.preventDefault(); show(t.dataset.tab); }});
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
