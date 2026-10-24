#!/usr/bin/env node
// 2026-10-24 (package HUB4, owner G2 / item 71: "I dont like many disparate files. Everything within the master hub. Move the other .md files that are
// still relevant."): checks the 📖 Library tab. The hub can't be built in a worktree (.fxcat / .vislib missing), so, like HUB2 and HUB3, the new tab is
// built by tools/hub/library.py with the hub's own md_html / anchor / _txt (cut out of build_hub.py and run) and shown on a stub page.
//   1. every docs/**/*.md (except docs/balance and docs/art) is classified once; the canonical list is CLAUDE.md's table; dated names are history;
//      nothing is lost: each doc is either rendered in the Library or linked to the tab that renders it;
//   2. the panel: the three groups with counts, every row has its path and a "last changed" date (git), summaries, a filter; History is a collapsed
//      group whose bodies are <template> (on demand); docs with their own tab link there and are not repeated;
//   3. the global search index gets Library / History entries that jump to a pane or a section, and the target ids exist;
//   4. build_hub.py wires the tab (button, panel, search types, showSub stamps on-demand panes, CSS/JS), adds no files, and the filter script runs on a
//      stub page; docs/action-items.md has the "Where docs live" note.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

// the python harness: md_html, _txt and anchor are cut out of build_hub.py (so the test uses the hub's own renderer), then library.build runs
const PY = `
import sys, re, os, json, html as H, markdown
root = sys.argv[1]
src = open(os.path.join(root, 'tools', 'hub', 'build_hub.py'), encoding='utf-8').read()
HUB_URL = ''
a = src.index('def md_html(md):'); b = src.index('rd = lambda')
exec(src[a:b])
a = src.index('def _txt(h)'); b = src.index('def split_h2')
exec(src[a:b])
sys.path.insert(0, os.path.join(root, 'tools', 'hub'))
import library as L
search = []
elsewhere = {'fields-and-day-night-2026-10-09.md': ('design', 'Design', 'design-fields-and-day-night-2026-10-09'), 'i18n.md': ('guide', 'Guide', 'doc-i18n')}
html, counts = L.build(root, md_html, anchor, _txt, elsewhere, search)
print(json.dumps({'html': html, 'counts': counts, 'search': search, 'docs': L.list_docs(root), 'cls': {r: L.classify(r) for r in L.list_docs(root)}, 'dates': L.git_dates(root)}))
`;
const r = cp.spawnSync('python3', ['-c', PY, ROOT], {encoding: 'utf8', maxBuffer: 1 << 28, timeout: 300000});
ok(r.status === 0, '0. the library builds: ' + (r.stderr || '').slice(-400));
let O = null; try{ O = JSON.parse(r.stdout); }catch(e){}
if(!O){ console.log(`hub4: ${checks - fail}/${checks} passed`); process.exit(1); }
const {html, counts, search, docs, cls, dates} = O;

// 1. classification
const onDisk = []; (function walk(d, rel){ fs.readdirSync(d, {withFileTypes: true}).forEach(e=>{
  if(e.isDirectory()){ if(!rel && (e.name === 'balance' || e.name === 'art')) return; walk(path.join(d, e.name), rel + e.name + '/'); }
  else if(e.name.endsWith('.md')) onDisk.push(rel + e.name); }); })(path.join(ROOT, 'docs'), '');
ok(onDisk.length > 100 && docs.length === onDisk.length && onDisk.every(f=> docs.includes(f)), `1. every docs/**/*.md except docs/balance and docs/art is listed (${docs.length})`);
ok(!docs.some(f=> /^(balance|art)\//.test(f)), '1. docs/balance and docs/art stay out');
['action-items.md', 'decisions.md', 'CHANGELOG.md', 'code-map.md', 'style-guideline.md', 'art-style-prompts.md', 'lore-bible.md', 'effects-catalogue.md', 'progression-plan.md', 'skirmish-tuning-guide.md']
  .concat(['art', 'balance', 'card-data', 'engine', 'release', 'ui'].map(w=> `workflows/${w}.md`)).forEach(f=> ok(cls[f] === 'canonical', `1. ${f} is canonical`));
ok(docs.filter(f=> /-20\d\d-\d\d-\d\d/.test(f)).every(f=> cls[f] === 'history'), '1. every dated name is history');
['MASTER.md', 'fx-batch-a-status.md', 'archive/handoff-to-deploy-session-2026-10-01.md', 'game-design-v39-addendum.md'].forEach(f=> ok(cls[f] === 'history', `1. ${f} is history`));
['roadmap-and-backlog.md', 'raid-design.md', 'hero-design.md', 'testing-strategy.md', 'i18n.md', 'user-stories.md', 'skills/bramblewood-hub.md'].forEach(f=> ok(cls[f] === 'reference', `1. ${f} is reference`));
const n = k=> docs.filter(f=> cls[f] === k).length;
ok(counts.canonical === n('canonical') && counts.reference === n('reference') && counts.history === n('history') && counts.canonical + counts.reference + counts.history === docs.length, '1. counts add up');
ok(counts.canonical >= 15 && counts.reference >= 10 && counts.history >= 60, `1. plausible counts (canonical ${counts.canonical}, reference ${counts.reference}, history ${counts.history})`);
ok(counts.linked + counts.rendered_here === docs.length, '1. each doc is rendered here or linked to the tab that renders it');

// 2. the panel
const rows = html.split('<li class="lib-row"').slice(1);
ok(rows.length === docs.length, '2. one row per doc');
ok(rows.every(x=> /<code>docs\/[^<]+<\/code> · last changed (\d{4}-\d\d-\d\d)</.test(x)), '2. every row shows its path and a last-changed date');
ok(Object.keys(dates).length > 100, '2. dates come from git');
['<h2>Canonical <small>', '<h2>Reference <small>', '<details class="lib-hist">', 'id="libQ"'].forEach(k=> ok(html.includes(k), `2. has ${k}`));
ok(!/<details class="lib-hist" open/.test(html), '2. History is collapsed');
const histHtml = html.slice(html.indexOf('<details class="lib-hist">'), html.indexOf('</details>', html.indexOf('<details class="lib-hist">')));
ok((histHtml.match(/<li class="lib-row"/g) || []).length === counts.history, '2. History lists every dated snapshot');
ok(/<span class="lib-s">[^<]{20,}/.test(histHtml), '2. history rows carry a one-line summary');
const histPanes = [...html.matchAll(/<div class="subpane lib-pane" data-group="lib" id="(lib-[a-z0-9-]+)" hidden>(.*?)(?=<div class="subpane lib-pane"|$)/gs)];
const histIds = histPanes.filter(m=> /<b>history<\/b>/.test(m[2]));
ok(histIds.length > 40 && histIds.every(m=> /<template class="lazy">/.test(m[2])), `2. history bodies are templates, stamped on demand (${histIds.length})`);
ok(histPanes.filter(m=> !/<b>history<\/b>/.test(m[2])).every(m=> !/<template/.test(m[2])), '2. canonical and reference bodies are plain');
['action-items.md', 'CHANGELOG.md', 'decisions.md', 'progression-plan.md'].forEach(f=> ok(!html.includes(`id="lib-${f.slice(0, -3).toLowerCase().replace(/[^a-z0-9]+/g, '-')}"`), `2. ${f} is not repeated (its tab shows it)`));
ok(/shown in 🎯 Action items →/.test(html) && /shown in 📚 Progression plan →/.test(html) && /shown in 🗳️ Decisions →/.test(html) && /shown in 🗒️ Changelog →/.test(html), '2. tab docs link to their tab');
ok(/data-go="\{&quot;tab&quot;: &quot;design&quot;, &quot;sub&quot;: &quot;design-fields-and-day-night-2026-10-09&quot;\}"/.test(html) && !html.includes('id="lib-fields-and-day-night-2026-10-09"'), '2. a Design-tab doc links to its Design sheet, not repeated');
ok(html.includes('id="lib-code-map"') && html.includes('id="lib-workflows-release"') && html.includes('id="lib-lore-bible"'), '2. canonical docs are read here');
ok(!html.includes('id="lib-i18n"') && html.includes('id="lib-raid-design"'), '2. a guide doc links out, a reference doc renders here');
ok(html.includes('id="lib-index"') && (html.match(/href="#lib-index"/g) || []).length >= docs.length - counts.linked, '2. every pane has a way back to the list');

// 3. search
ok(search.length > 500, `3. search entries added (${search.length})`);
ok(search.every(e=> ['Library', 'History'].includes(e[0]) && e[1] && e[4].tab === 'doclib' && e[4].sub), '3. all entries are Library / History and jump to a pane');
ok(search.some(e=> e[0] === 'Library') && search.some(e=> e[0] === 'History'), '3. both types present');
const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map(m=> m[1]));
ok(search.every(e=> ids.has(e[4].sub) && (!e[4].el || ids.has(e[4].el))), '3. every jump target exists in the panel');
ok(search.some(e=> /node tests\/run\.js --smoke/.test(e[3]) && e[4].sub === 'lib-workflows-release'), '3. the release workflow can be found by its text');
const sizeKB = Math.round(Buffer.byteLength(html) / 1024), searchKB = Math.round(Buffer.byteLength(JSON.stringify(search)) / 1024);
console.log(`  library panel ${sizeKB} KB, search entries ${searchKB} KB (${search.length})`);
ok(sizeKB < 6000 && searchKB < 2500, '3. the library stays inside its size budget (panel < 6 MB, search < 2.5 MB)');

// 4. wiring, the filter on a stub page, the note
const bh = rd('tools/hub/build_hub.py');
ok(bh.includes('import library as LIBMOD') && bh.includes('LIBMOD.build(') && bh.includes('data-tab="doclib"') && bh.includes('id="p-doclib"') && bh.includes('lazy(LIB_HTML)') && bh.includes('{LIB_JS}') && bh.includes('{LIB_CSS}'), '4. build_hub.py builds the Library tab (button, panel, script, styles)');
ok(/function showSub\(id\)\{\{[^\n]*stamp\(pane\)/.test(bh), '4. opening a pane stamps its on-demand body');
ok(/'Library':'📖'/.test(rd('tools/hub/hub_app.js')) && /'History':'🕰️'/.test(rd('tools/hub/hub_app.js')), '4. the global search shows Library and History results');
ok(!/os\.makedirs|shutil\.copy|open\([^)]*'w'/.test(rd('tools/hub/library.py')), '4. the library writes no files (inline HTML, hub file count unchanged)');
const tabJs = rd('tools/hub/library_tab.js'); ok(!/localStorage|sessionStorage|indexedDB/.test(tabJs), '4. the filter uses no browser storage');
{
  const rowEls = [...html.matchAll(/<li class="lib-row" data-hay="([^"]*)"/g)].map(m=> ({dataset: {hay: m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')}, hidden: false}));
  const els = {}, mk = id=> (els[id] = els[id] || {id, value: '', textContent: '', dataset: {}, l: {}, addEventListener(t, f){ this.l[t] = f; }});
  const hist = {open: false};
  const sb = {window: {hub: {onShow: {}}}, document: {getElementById: mk, querySelectorAll: sel=> sel.includes('.lib-row') ? rowEls : [], querySelector: ()=> hist}, console};
  sb.hub = sb.window.hub; vm.createContext(sb);
  try{
    vm.runInContext(tabJs, sb); ok(typeof sb.hub.onShow.library === 'function', '4. the filter script registers on show');
    sb.hub.onShow.library(); sb.hub.onShow.library();
    els.libQ.value = 'lore bible'; els.libQ.l.input();
    const shown = rowEls.filter(r=> !r.hidden).length;
    ok(shown >= 1 && shown < rowEls.length / 4 && hist.open, `4. filtering hides non-matches and opens History (${shown} of ${rowEls.length})`);
    els.libQ.value = ''; els.libQ.l.input(); ok(rowEls.every(r=> !r.hidden) && els.libN.textContent === '', '4. clearing the filter shows everything');
  }catch(e){ ok(false, '4. the filter runs against a stub page: ' + (e && e.stack || e)); }
}
const ai = rd('docs/action-items.md');
ok(/\n## Where docs live\n/.test(ai) && /Library/.test(ai.split('## Where docs live')[1].split('\n## ')[0]) && ai.indexOf('## Where docs live') < ai.indexOf('## 10-23 20:50'), '4. docs/action-items.md has the "Where docs live" note at the top');
ok(/hub4-2026-10-24\.js/.test(rd('tests/run-all.sh')), '4. the test is listed in tests/run-all.sh');
console.log(`hub4: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
