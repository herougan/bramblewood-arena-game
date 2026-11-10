#!/usr/bin/env node
// 2026-11-11 (package TOOLS1): the routine-work tools. Everything runs in temp copies or temp repos; the real repo and the real shared test cache are never written.
//   1. tests/run.js: the cache dir is the same in a worktree and its main checkout, a pass in one is "skipped" in the other, several input
//      states keep their passes, an old one-key-per-test cache file still reads, and electron/ and .github/ files a test names are inputs.
//   2. tools/i18n_add.py: a key goes into the TEXT table and all 12 packs (cards, flavour, pack-only too), twice is a no-op, an English change
//      updates the key, --overwrite replaces rows, a bad table writes nothing.
//   3. tools/shot.py lists --clip and --dark and keeps its defaults.
//   4. tools/merge/merge_pkg.sh regenerates docs/code-map.md and docs/guides/arena-app-index.md instead of stopping, and still stops on a .js conflict.
//   5. .claude/skills/*/SKILL.md have valid frontmatter, name the files that exist, and .gitignore keeps them tracked.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const GITENV = Object.assign({}, process.env, { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t', GIT_CONFIG_NOSYSTEM: '1' });
const sh = (cmd, args, cwd, env) => { const r = cp.spawnSync(cmd, args, { cwd, env: env || GITENV, encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
const git = (cwd, ...a) => sh('git', ['-c', 'commit.gpgsign=false', ...a], cwd);
const tmps = [];
const tmp = tag => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bw-tools1-' + tag + '-')); tmps.push(d); return fs.realpathSync(d); };
const put = (root, rel, text) => { const p = path.join(root, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); };
const sha = files => { const h = crypto.createHash('sha1'); files.forEach(f => h.update(fs.existsSync(f) ? fs.readFileSync(f) : 'missing')); return h.digest('hex'); };
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

try {
  // ---- 1. the shared test cache ----
  const R = tmp('repo'), W = R + '-wt';
  tmps.push(W);
  git(R, 'init', '-q', '-b', 'main');
  put(R, 'tests/run.js', fs.readFileSync(path.join(ROOT, 'tests', 'run.js'), 'utf8'));
  put(R, 'tests/run-all.sh', 'run node tests/t1.js   # trivial\nrun node tests/t2.js   # reads electron and .github files\n');
  put(R, 'tests/t1.js', "// t1\nprocess.exit(0);\n");
  put(R, 'tests/t2.js', "const fs=require('fs'),path=require('path');const r=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');\nr('electron/main.js'); r('.github/workflows/w.yml');\n");
  put(R, 'electron/main.js', '// main v1\n');
  put(R, '.github/workflows/w.yml', 'name: w1\n');
  git(R, 'add', '-A'); git(R, 'commit', '-qm', 'init');
  ok(git(R, 'worktree', 'add', '-q', W, '-b', 'wt').code === 0, '1. a temp worktree can be made');
  const cdir = d => sh('node', ['tests/run.js', '--cache-dir'], d).out.trim();
  const want = path.join(R, '.git', 'bw-test-cache');
  ok(cdir(R) === want, `1. the main checkout's cache dir is <repo>/.git/bw-test-cache (got ${cdir(R)})`);
  ok(cdir(W) === want, `1. a worktree resolves to the same dir (got ${cdir(W)})`);
  ok(sh('node', ['tests/run.js', '--cache-dir'], W, Object.assign({}, GITENV, { BW_TEST_CACHE_DIR: '/x/y' })).out.trim() === '/x/y', '1. BW_TEST_CACHE_DIR overrides');
  const summary = d => (sh('node', ['tests/run.js', '--only', '^tests/t1'], d).out.match(/tests: (\d+) passed, (\d+) failed, (\d+) skipped/) || []).slice(1).map(Number).join('/');
  ok(summary(R) === '1/0/0', `1. first run in the main checkout runs the test (${summary(R) || 'no summary'})`);
  ok(summary(W) === '0/0/1', '1. the same inputs in the worktree are skipped (cached)');
  const list = d => sh('node', ['tests/run.js', '--list', '--only', '^tests/t1'], d).out.trim().split(/\s+/)[0];
  fs.appendFileSync(path.join(W, 'tests', 't1.js'), '// edited in the worktree\n');
  ok(list(W) === 'run', '1. a changed input in the worktree is not cached');
  ok(summary(W) === '1/0/0', '1. it runs and passes there');
  ok(list(R) === 'cached', "1. the worktree's pass did not replace the main checkout's");
  fs.writeFileSync(path.join(W, 'tests', 't1.js'), fs.readFileSync(path.join(R, 'tests', 't1.js')));
  ok(list(W) === 'cached', '1. going back to the first input state is cached again (several keys kept per test)');
  ok(fs.existsSync(want) && fs.readdirSync(want).join() === 'test-cache.json', '1. the cache dir holds only test-cache.json (the temp file was renamed)');
  let shared = {}; try { shared = JSON.parse(fs.readFileSync(path.join(want, 'test-cache.json'), 'utf8')); } catch (e) { }
  ok(Array.isArray(shared['t1']) && shared['t1'].length === 2, `1. t1 has two passing keys (${JSON.stringify(shared['t1'] && shared['t1'].length)})`);
  // an old cache file: one key string per test
  const B = tmp('bw'); put(B, 'test-cache.json', JSON.stringify({ zzz: 'oldkey' }));
  sh('node', ['tests/run.js', '--only', '^tests/t1'], R, Object.assign({}, GITENV, { BW_TEST_CACHE_DIR: B }));
  const old = JSON.parse(fs.readFileSync(path.join(B, 'test-cache.json'), 'utf8'));
  ok(Array.isArray(old.zzz) && old.zzz[0] === 'oldkey' && Array.isArray(old.t1), '1. an old string entry is read as a list and kept');
  // electron/ and .github/ files a test names are inputs
  const l2 = d => sh('node', ['tests/run.js', '--list', '--only', '^tests/t2'], d).out.trim().split(/\s+/)[0];
  sh('node', ['tests/run.js', '--only', '^tests/t2'], R);
  ok(l2(R) === 'cached', '1. t2 is cached after a pass');
  put(R, 'electron/main.js', '// main v2\n');
  ok(l2(R) === 'run', '1. changing electron/main.js invalidates a test that names it (desk2)');
  sh('node', ['tests/run.js', '--only', '^tests/t2'], R);
  put(R, '.github/workflows/w.yml', 'name: w2\n');
  ok(l2(R) === 'run', '1. changing a .github workflow invalidates a test that names it');
  sh('node', ['tests/run.js', '--only', '^tests/t2'], R);
  put(R, 'electron/node_modules/x/index.js', '// not an input\n'); put(R, 'electron/game/g.js', '// staged copy\n');
  ok(l2(R) === 'cached', '1. electron/node_modules and electron/game are not inputs');
  const common = sh('git', ['rev-parse', '--git-common-dir'], ROOT, process.env);
  if (common.code === 0 && !process.env.BW_TEST_CACHE_DIR) { // this checkout, main or worktree: the same dir as the main checkout's
    const real = sh('node', [path.join(ROOT, 'tests', 'run.js'), '--cache-dir'], ROOT, process.env).out.trim();
    ok(fs.realpathSync(real) === path.join(fs.realpathSync(path.resolve(ROOT, common.out.trim())), 'bw-test-cache'), `1. in this checkout the cache dir is under the git common dir (${real})`);
  }

  // ---- 2. tools/i18n_add.py ----
  const S = tmp('i18n');
  fs.mkdirSync(path.join(S, 'tools'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'tools', 'i18n_add.py'), path.join(S, 'tools', 'i18n_add.py'));
  fs.cpSync(path.join(ROOT, 'tools', 'text'), path.join(S, 'tools', 'text'), { recursive: true, filter: s => !s.includes('__pycache__') });
  fs.copyFileSync(path.join(ROOT, 'bramblewood-texts.js'), path.join(S, 'bramblewood-texts.js'));
  fs.cpSync(path.join(ROOT, 'lang'), path.join(S, 'lang'), { recursive: true });
  const packPath = (kind, c) => path.join(S, 'lang', kind === 'main' ? '' : kind, c + '.json');
  const pack = (kind, c) => JSON.parse(fs.readFileSync(packPath(kind, c), 'utf8'));
  const allFiles = () => [path.join(S, 'bramblewood-texts.js')].concat(['main', 'cards', 'ui'].flatMap(k => CODES.map(c => packPath(k, c))));
  const tr = (p, c) => Object.fromEntries(CODES.map(x => [x, p + x])), withEn = (en, o) => Object.assign({ en }, o);
  const table = (extra) => Object.assign({
    tx: {
      'ui.t1-demo': withEn('⚔ Demo {n} text', Object.fromEntries(CODES.map(c => [c, '🛡 D-' + c + ' {n}']))),
      'ui.t1-list': ['Listed'].concat(CODES.map(c => 'L-' + c)),
    },
    cards: { 'T1 Demo Beast': CODES.map(c => 'B-' + c) },
    flavor: { 'It is only a test.': tr('F-') },
    pack: { 'Pack only{s}': tr('P-') },
  }, extra || {});
  const run = (t, ...flags) => { put(S, 'table.json', JSON.stringify(t)); return sh('python3', ['-I', path.join(S, 'tools', 'i18n_add.py'), path.join(S, 'table.json'), '--no-export', ...flags], S, process.env); };
  const size = (kind, c) => Object.keys(pack(kind, c)).length; // the packs differ in size per language
  const before = Object.fromEntries(CODES.map(c => [c, { main: size('main', c), cards: size('cards', c), ui: size('ui', c) }]));
  const baseHash = sha(allFiles());
  let r = run(table());
  ok(r.code === 0 && /tx 2 added, 0 updated/.test(r.out), `2. the table is applied (${r.out.trim().slice(0, 140)})`);
  const txs = fs.readFileSync(path.join(S, 'bramblewood-texts.js'), 'utf8');
  ok(txs.includes('"ui.t1-demo": "⚔ Demo {n} text"') && txs.includes('"ui.t1-list": "Listed"'), '2. both TX keys are in the TEXT table');
  ok(CODES.every(c => { const p = pack('main', c); return p['Demo {n} text'] === 'D-' + c + ' {n}' && p['Listed'] === 'L-' + c && p['Pack only{s}'] === 'P-' + c; }), '2. all 12 main packs have the rows (leading emoji peeled from key and translation)');
  ok(CODES.every(c => pack('cards', c)['T1 Demo Beast'] === 'B-' + c && pack('ui', c)['It is only a test.'] === 'F-' + c), '2. all 12 card-name and flavour packs have their rows');
  ok(CODES.every(c => size('main', c) === before[c].main + 3 && size('cards', c) === before[c].cards + 1 && size('ui', c) === before[c].ui + 1), '2. exactly the new rows were added in every pack');
  const afterOnce = sha(allFiles());
  ok(afterOnce !== baseHash, '2. the files changed');
  r = run(table());
  ok(r.code === 0 && sha(allFiles()) === afterOnce && /nothing new/.test(r.out), '2. running the same table again changes nothing (byte for byte)');
  r = run(table({ tx: { 'ui.t1-demo': withEn('⚔ Demo {n} text, v2', Object.fromEntries(CODES.map(c => [c, '🛡 D2-' + c + ' {n}']))) } }));
  const txs2 = fs.readFileSync(path.join(S, 'bramblewood-texts.js'), 'utf8');
  ok(/tx 0 added, 1 updated/.test(r.out) && txs2.includes('"ui.t1-demo": "⚔ Demo {n} text, v2"') && !txs2.includes('"ui.t1-demo": "⚔ Demo {n} text"'), '2. a changed English updates the key in place');
  ok(pack('main', 'ja')['Demo {n} text, v2'] === 'D2-ja {n}' && pack('main', 'ja')['Demo {n} text'] === 'D-ja {n}', '2. the new English gets its rows; the old rows stay');
  const l2t = table({ tx: { 'ui.t1-list': ['Listed'].concat(CODES.map(c => 'M-' + c)) }, cards: {}, flavor: {}, pack: {} });
  r = run(l2t);
  ok(pack('main', 'fr')['Listed'] === 'L-fr' && /differ, kept/.test(r.out), '2. an existing row is kept by default and the output says so');
  r = run(l2t, '--overwrite');
  ok(pack('main', 'fr')['Listed'] === 'M-fr' && pack('main', 'ko')['Listed'] === 'M-ko' && /overwritten/.test(r.out), '2. --overwrite replaces it');
  const good = sha(allFiles());
  const bads = {
    'a missing language': table({ cards: { 'T1 Bad': CODES.slice(0, 11).map(c => 'x') } }),
    'a missing code in an object': table({ flavor: { 'Bad flavour': Object.fromEntries(CODES.slice(1).map(c => [c, 'x'])) } }),
    'a changed placeholder': table({ tx: { 'ui.t1-bad': withEn('Has {n}', Object.fromEntries(CODES.map(c => [c, c === 'de' ? 'Hat {m}' : 'Has {n}']))) } }),
    'a dropped placeholder': table({ pack: { 'Has {n} and {m}': tr('Q-') } }),
    'English text as a TX key': table({ tx: { 'Not a key': withEn('x', tr('X-')) } }),
    'an unknown section': { tx: {}, wat: {} },
  };
  for (const [what, t] of Object.entries(bads)) {
    r = run(t);
    ok(r.code === 2 && /nothing written/.test(r.out) && sha(allFiles()) === good, `2. ${what}: exit 2, nothing written (exit ${r.code})`);
  }
  r = run(table({ tx: { 'ui.t1-plural': withEn('{n} card{s}', Object.fromEntries(CODES.map(c => [c, '{n} K-' + c]))) } }));
  ok(r.code === 0, '2. an English plural {s} may be dropped from a translation');
  // a .py table
  put(S, 'tbl.py', "TABLE = {'cards': {'T1 Py Beast': ['" + CODES.map(c => 'py-' + c).join("','") + "']}}\n");
  r = sh('python3', ['-I', path.join(S, 'tools', 'i18n_add.py'), path.join(S, 'tbl.py'), '--no-export'], S, process.env);
  ok(r.code === 0 && pack('cards', 'zh-Hant')['T1 Py Beast'] === 'py-zh-Hant', '2. a .py file with TABLE works');

  // ---- 3. tools/shot.py ----
  const help = sh('python3', [path.join(ROOT, 'tools', 'shot.py'), '--help'], ROOT, process.env);
  ok(help.code === 0 && /--clip SELECTOR/.test(help.out) && /--dark/.test(help.out), '3. shot.py --help lists --clip SELECTOR and --dark');
  const shot = fs.readFileSync(path.join(ROOT, 'tools', 'shot.py'), 'utf8');
  ok(/default='390,1366'/.test(shot) && /\{'color_scheme': 'dark'\} if a\.dark else \{\}/.test(shot), '3. defaults are unchanged: both widths, color scheme only with --dark');

  // ---- 4. tools/merge/merge_pkg.sh ----
  const mergeScenario = (tag, conflicts) => {
    const M = tmp('merge-' + tag);
    const msh = fs.readFileSync(path.join(ROOT, 'tools', 'merge', 'merge_pkg.sh'), 'utf8');
    put(M, 'tools/merge/merge_pkg.sh', msh);
    put(M, 'tools/merge/prune_ui_lang.js', '');
    put(M, 'tools/merge/check_build_pair.sh', 'exit 0\n');
    put(M, 'tools/code_map.py', "import os\nopen('docs/code-map.md','w').write('REGENERATED map\\n')\nopen('docs/guides/arena-app-index.md','w').write('REGENERATED index\\n')\n");
    put(M, 'assemble_arena.py', "open('bramblewood-arena.html','w').write('<html></html>')\n");
    put(M, 'canonical/cards.json', '[]'); put(M, 'lang/x.json', '{}'); put(M, 'lang/ui/x.json', '{}');
    conflicts.forEach(f => put(M, f, 'base\n'));
    git(M, 'init', '-q', '-b', 'main'); git(M, 'add', '-A'); git(M, 'commit', '-qm', 'base');
    git(M, 'checkout', '-q', '-b', 'pkg'); conflicts.forEach(f => put(M, f, 'pkg side\n')); git(M, 'commit', '-qam', 'pkg');
    git(M, 'checkout', '-q', 'main'); conflicts.forEach(f => put(M, f, 'main side\n')); git(M, 'commit', '-qam', 'main');
    return { M, r: sh('bash', ['tools/merge/merge_pkg.sh', 'pkg'], M) };
  };
  ok(sh('bash', ['-n', path.join(ROOT, 'tools', 'merge', 'merge_pkg.sh')], ROOT).code === 0, '4. merge_pkg.sh parses');
  let m = mergeScenario('docs', ['docs/code-map.md', 'docs/guides/arena-app-index.md']);
  const mtext = f => fs.readFileSync(path.join(m.M, f), 'utf8');
  ok(m.r.code === 0, `4. both generated docs conflicting: the script finishes (exit ${m.r.code}: ${m.r.out.trim().split('\n').slice(-2).join(' | ')})`);
  ok(mtext('docs/code-map.md') === 'REGENERATED map\n' && mtext('docs/guides/arena-app-index.md') === 'REGENERATED index\n', '4. both files were regenerated by tools/code_map.py (no conflict markers)');
  ok(git(m.M, 'status', '--porcelain').out.trim() === '' && /^Merge /.test(git(m.M, 'log', '-1', '--format=%s').out), '4. the merge is committed and the tree is clean');
  m = mergeScenario('js', ['docs/code-map.md', 'x.js']);
  ok(m.r.code === 2 && /x\.js/.test(m.r.out) && !/NEEDS HAND RESOLUTION:[\s\S]*code-map/.test(m.r.out), '4. a .js conflict still stops (exit 2) and lists only that file');
  ok(git(m.M, 'rev-parse', '-q', '--verify', 'MERGE_HEAD').code === 0, '4. ... with the merge left open');

  // ---- 5. project skills ----
  const SK = path.join(ROOT, '.claude', 'skills');
  const names = fs.existsSync(SK) ? fs.readdirSync(SK).filter(d => fs.existsSync(path.join(SK, d, 'SKILL.md'))) : [];
  for (const need of ['merge-and-test', 'release', 'add-texts']) ok(names.includes(need), `5. skill ${need} exists`);
  for (const d of names) {
    const t = fs.readFileSync(path.join(SK, d, 'SKILL.md'), 'utf8');
    const fm = t.match(/^---\n([\s\S]*?)\n---\n/);
    const meta = fm ? Object.fromEntries([...fm[1].matchAll(/^([\w-]+):\s*(.*)$/gm)].map(x => [x[1], x[2]])) : {};
    ok(fm && meta.name === d && /^[a-z0-9-]{1,64}$/.test(d), `5. ${d}: frontmatter name equals the folder name`);
    ok(meta.description && meta.description.length <= 1024 && /^Use (only )?when/.test(meta.description), `5. ${d}: description says when to use it (${(meta.description || '').length} chars)`);
    ok(!/MASTER\.md|over 20k lines/.test(t), `5. ${d}: no retired MASTER.md or stale size`);
    const body = t.slice(fm ? fm[0].length : 0);
    const refs = [...body.matchAll(/`((?:tools|docs|tests|\.claude)\/[A-Za-z0-9_./-]+)`/g)].map(x => x[1]).filter(p => !/\/out\/|\.hub/.test(p));
    const gone = [...new Set(refs)].filter(p => !fs.existsSync(path.join(ROOT, p)));
    ok(gone.length === 0, `5. ${d}: every file it names exists (missing: ${gone.join(', ') || 'none'})`);
  }
  const ig = (p) => sh('git', ['check-ignore', '-q', p], ROOT, process.env).code;
  if (fs.existsSync(path.join(ROOT, '.git'))) {
    ok(ig('.claude/skills/merge-and-test/SKILL.md') === 1, '5. .gitignore keeps .claude/skills tracked');
    ok(ig('.claude/agents/x.md') === 1 && ig('.claude/worktrees/x/a') === 0, '5. .claude/agents stays tracked and .claude/worktrees stays ignored');
  }
  const olds = fs.readdirSync(path.join(ROOT, 'docs', 'skills')).filter(f => f.endsWith('.md'));
  for (const f of olds) {
    const t = fs.readFileSync(path.join(ROOT, 'docs', 'skills', f), 'utf8');
    const m1 = t.match(/^---\n[\s\S]*?\n---\n\n> Superseded 2026-11-11 \(TOOLS1\): .*`(\.claude\/skills\/[\w-]+\/SKILL\.md)`/);
    ok(m1 && fs.existsSync(path.join(ROOT, m1[1])), `5. docs/skills/${f} points at a skill that exists (frontmatter kept first for the hub)`);
  }
  ok(/tests\/tools1-2026-11-11\.js/.test(fs.readFileSync(path.join(ROOT, 'tests', 'run-all.sh'), 'utf8')), '5. this test is listed in run-all.sh');
} finally {
  tmps.forEach(d => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { } });
}
console.log(`tools1-2026-11-11: ${n - fail}/${n} checks`);
process.exit(fail ? 1 : 0);
