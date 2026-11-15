// 2026-11-16 (package LAB1): the Lab's copy of the game. Pulls main's head from GitHub (REST API for the sha and the file tree,
// raw.githubusercontent.com for the files), only the files the sims read, stored once per git blob and copied into one folder per
// commit. --local DIR (or LAB_LOCAL) copies the same files from a checkout instead.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto'), cp = require('child_process');
const OWNER = 'herougan', REPO = 'bramblewood-arena-game';
const UA = { 'user-agent': 'bramblewood-lab', accept: 'application/vnd.github+json' };

function home() {
  const h = process.env.LAB_HOME || (process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support', 'BramblewoodLab') : path.join(os.homedir(), '.bramblewood-lab'));
  fs.mkdirSync(h, { recursive: true }); return h;
}
const dir = (...p) => { const d = path.join(home(), ...p); fs.mkdirSync(d, { recursive: true }); return d; };
const sha1 = b => crypto.createHash('sha1').update(b).digest('hex');
const readJ = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const writeJ = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f + '.tmp', JSON.stringify(o)); fs.renameSync(f + '.tmp', f); };

// What the sims read (traced from skirmish_pass, deckopt, ref5_prog, ref6 ladder, econ2; hook.js fetches anything else listed in the tree).
const NEED = [/^arena_app\.js$/, /^bramblewood-[\w-]+\.js$/, /^canonical\/[^/]+\.json$/, /^tools\/(?!emoji\/|effects-lab\/|lab\/).+\.(js|json|sh)$/, /^tests\/lib\/[^/]+\.js$/,
  /^docs\/balance\/[^/]+\.json$/, /^docs\/balance\/(ref|ref6|server-overrides)\/[^/]+\.json$/, /^docs\/balance\/bal16\/decks-plan[^/]*\.json$/, /^docs\/balance\/pipeline\/measures\.json$/];
const needed = p => NEED.some(r => r.test(p));
// The inputs that change a result. arena_app.js counts only through its fights (CONQUEST_MAPS) and the reference decks, so a UI commit keeps the hash.
const HASH_FILES = ['canonical/cards.json', 'canonical/map-pools.json', 'canonical/pack-extras.json', 'canonical/skill-costs.json', 'canonical/upgrade-costs.json', 'bramblewood-engine.js', 'bramblewood-budget.js'];
function appBlocks(src) {
  const a = src.indexOf('const CONQUEST_MAPS = ['), b = src.indexOf('\n];', a), w = /^const WINRATE_REF_DECKS = .*$/m.exec(src);
  return (a >= 0 ? src.slice(a, b) : '') + (w ? w[0] : '');
}
function dataHash(root, extra) {
  const h = crypto.createHash('sha1');
  HASH_FILES.forEach(f => { const p = path.join(root, f); h.update(f + '\0' + (fs.existsSync(p) ? sha1(fs.readFileSync(p)) : '-') + '\0'); });
  const app = path.join(root, 'arena_app.js'); if (fs.existsSync(app)) h.update(sha1(appBlocks(fs.readFileSync(app, 'utf8'))));
  if (extra) h.update(String(extra));
  return h.digest('hex').slice(0, 12);
}

// ---- GitHub
class RateLimit extends Error {}
async function gh(p) {
  // a CI run may pass its own GITHUB_TOKEN (higher limit); the owner's Mac needs none
  const r = await fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + p, { headers: process.env.GITHUB_TOKEN ? Object.assign({ authorization: 'Bearer ' + process.env.GITHUB_TOKEN }, UA) : UA });
  if ((r.status === 403 || r.status === 429) && r.headers.get('x-ratelimit-remaining') === '0') {
    const reset = new Date(1000 * +r.headers.get('x-ratelimit-reset')); throw new RateLimit('GitHub API limit reached until ' + reset.toLocaleTimeString());
  }
  if (!r.ok) throw new Error('GitHub API ' + r.status + ' for ' + p);
  return r.json();
}
async function raw(sha, p) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${sha}/${p.split('/').map(encodeURIComponent).join('/')}`, { headers: { 'user-agent': UA['user-agent'] } });
      if (r.status === 404) return null; if (!r.ok) throw new Error('raw ' + r.status); return Buffer.from(await r.arrayBuffer()); } catch (e) { if (i === 2) throw e; await new Promise(z => setTimeout(z, 1000 * (i + 1))); }
  }
}
const blobId = b => sha1(Buffer.concat([Buffer.from('blob ' + b.length + '\0'), b]));
// One file by its blob id, downloaded once and checked against the id.
async function blob(sha, entry) {
  const f = path.join(dir('blobs'), entry.sha);
  if (fs.existsSync(f)) return f;
  const b = await raw(sha, entry.path); if (!b) throw new Error('missing on GitHub: ' + entry.path);
  if (blobId(b) !== entry.sha) throw new Error('checksum mismatch: ' + entry.path);
  fs.writeFileSync(f + '.tmp', b); fs.renameSync(f + '.tmp', f); return f;
}
async function headSha(branch) {
  try { const c = await gh('/commits/' + branch); return { sha: c.sha, date: c.commit.committer.date, how: 'api' }; } catch (e) {
    // no API (limit, offline): git's own protocol has no rate limit
    const r = cp.spawnSync('git', ['ls-remote', `https://github.com/${OWNER}/${REPO}.git`, 'refs/heads/' + branch], { encoding: 'utf8', timeout: 30000 });
    const m = r.status === 0 && /^([0-9a-f]{40})/.exec(r.stdout || ''); if (m) return { sha: m[1], date: null, how: 'git ls-remote', warning: e.message };
    throw e;
  }
}
async function tree(sha) {
  const f = path.join(dir('trees'), sha + '.json'); const c = readJ(f); if (c) return c;
  const t = await gh('/git/trees/' + sha + '?recursive=1');
  const out = t.tree.filter(x => x.type === 'blob').map(x => ({ path: x.path, sha: x.sha, size: x.size }));
  writeJ(f, out); return out;
}
async function pool(list, n, fn) { let i = 0; const err = []; await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const x = list[i++]; try { await fn(x); } catch (e) { err.push(e); } } })); if (err.length) throw err[0]; }
const clone = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.copyFileSync(a, b, fs.constants.COPYFILE_FICLONE); };

function walkFiles(root, rel, out) {
  for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!/^(\.git|node_modules|docs\/screens|tests\/e2e|assets|art|hub|lang)$/.test(r)) walkFiles(root, r, out); } else if (e.isFile()) out.push(r);
  }
  return out;
}

// Pull: returns {sha, date, root, dataHash, fetched, warnings}. Keeps the 3 newest snapshots.
async function pull(opts) {
  opts = opts || {}; const local = opts.local || process.env.LAB_LOCAL, warnings = [], log = opts.log || (() => {});
  const state = readJ(path.join(home(), 'state.json'), {});
  if (local) {
    const src = path.resolve(local), files = walkFiles(src, '', []).filter(needed);
    const id = 'local-' + sha1(files.map(f => f + fs.statSync(path.join(src, f)).mtimeMs).join('|')).slice(0, 10), root = path.join(dir('snaps'), id);
    if (!fs.existsSync(path.join(root, '.lab.json'))) { files.forEach(f => clone(path.join(src, f), path.join(root, f))); }
    let sha = id; const g = cp.spawnSync('git', ['-C', src, 'rev-parse', 'HEAD'], { encoding: 'utf8' }); if (g.status === 0) sha = g.stdout.trim();
    const meta = { sha, date: new Date().toISOString(), root, local: src, srcDir: src, dataHash: dataHash(root), files: files.length, fetched: 0, warnings };
    writeJ(path.join(root, '.lab.json'), meta); state.last = meta; writeJ(path.join(home(), 'state.json'), state); return meta;
  }
  let head;
  try { head = await headSha(opts.branch || 'main'); if (head.warning) warnings.push(head.warning); } catch (e) {
    if (state.last && fs.existsSync(state.last.root)) { warnings.push('offline (' + e.message + '): using the last pull ' + state.last.sha.slice(0, 7)); return Object.assign({}, state.last, { warnings }); }
    throw e;
  }
  const root = path.join(dir('snaps'), head.sha), metaF = path.join(root, '.lab.json');
  if (fs.existsSync(metaF)) { const m = readJ(metaF); m.warnings = warnings; m.fetched = 0; state.last = m; writeJ(path.join(home(), 'state.json'), state); return m; }
  let t; try { t = await tree(head.sha); } catch (e) {
    // no tree (API limit): the previous tree's paths, read at the new commit; a file that moved is fetched by hook.js or skipped
    const prev = state.last && readJ(path.join(dir('trees'), state.last.sha + '.json')); if (!prev) throw e;
    warnings.push(e.message + ': file list from ' + state.last.sha.slice(0, 7)); t = prev.map(x => Object.assign({}, x, { sha: null }));
  }
  const want = t.filter(x => needed(x.path)); let fetched = 0, done = 0;
  await pool(want, 8, async x => {
    if (x.sha) { const had = fs.existsSync(path.join(dir('blobs'), x.sha)); const f = await blob(head.sha, x); if (!had) fetched++; clone(f, path.join(root, x.path)); }
    else { const b = await raw(head.sha, x.path); if (b) { fs.mkdirSync(path.dirname(path.join(root, x.path)), { recursive: true }); fs.writeFileSync(path.join(root, x.path), b); fetched++; } }
    if (++done % 100 === 0) log(`pull ${done}/${want.length} files`);
  });
  if (!fs.existsSync(path.join(dir('trees'), head.sha + '.json'))) writeJ(path.join(dir('trees'), head.sha + '.json'), t);
  const meta = { sha: head.sha, date: head.date, root, dataHash: dataHash(root), files: want.length, fetched, warnings, tree: path.join(dir('trees'), head.sha + '.json') };
  writeJ(metaF, meta); state.last = meta; writeJ(path.join(home(), 'state.json'), state);
  // keep the 3 newest snapshots (blobs stay: the next pull reuses them)
  const snaps = fs.readdirSync(dir('snaps')).map(s => ({ s, t: (readJ(path.join(dir('snaps'), s, '.lab.json'), {}).date) || '' })).sort((a, b) => b.t.localeCompare(a.t));
  snaps.slice(3).forEach(x => { if (path.join(dir('snaps'), x.s) !== root) fs.rmSync(path.join(dir('snaps'), x.s), { recursive: true, force: true }); });
  return meta;
}

// A private copy of a snapshot for a run that changes inputs (what-if, live overrides) or runs a tool that may write files.
function workspace(snap, runId) {
  const ws = path.join(dir('runs'), runId, 'ws');
  walkFiles(snap.root, '', []).forEach(f => clone(path.join(snap.root, f), path.join(ws, f)));
  return ws;
}

// Live card_overrides, read only, the way the game reads them (its own URL and publishable key from arena_app.js; never printed).
async function liveOverrides(root) {
  const src = fs.readFileSync(path.join(root, 'arena_app.js'), 'utf8');
  const url = (/const SUPABASE_URL = '([^']+)'/.exec(src) || [])[1], key = (/const SUPABASE_ANON_KEY = '([^']+)'/.exec(src) || [])[1];
  if (!url || !key) throw new Error('arena_app.js: no Supabase URL / key');
  const r = await fetch(url + '/rest/v1/card_overrides?select=id,data,deleted,updated_at', { headers: { apikey: key, authorization: 'Bearer ' + key } });
  if (!r.ok) throw new Error('card_overrides: HTTP ' + r.status);
  const rows = await r.json(); if (!Array.isArray(rows)) throw new Error('card_overrides: not a list');
  return rows.filter(x => x && typeof x.id === 'string' && !x.id.startsWith('__cfg:'));
}
// Lays card rows over a workspace's cards.json (a {__patch:true} row patches the card, a whole row replaces it, deleted removes it).
function applyOverrides(ws, rows) {
  const f = path.join(ws, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(f, 'utf8')), by = {}; rows.forEach(r => { by[r.id] = r; });
  const out = []; let n = 0;
  cards.forEach(c => { const r = by[c.id]; if (!r) return out.push(c); n++; if (r.deleted) return;
    const d = Object.assign({}, r.data || {}); if (d.__patch) { delete d.__patch; out.push(Object.assign({}, c, d)); } else out.push(Object.assign({ id: c.id }, d, { art: c.art })); });
  fs.writeFileSync(f, JSON.stringify(out)); return { applied: n, hash: sha1(JSON.stringify(rows.map(r => [r.id, r.updated_at]))).slice(0, 8) };
}

// A docs/balance file at a commit (for the importer), cached by blob.
async function fileAt(snap, entry) {
  if (snap.srcDir) { const p = path.join(snap.srcDir, entry.path); return fs.existsSync(p) ? fs.readFileSync(p) : null; }
  if (entry.sha) return fs.readFileSync(await blob(snap.sha, entry));
  return raw(snap.sha, entry.path);
}
async function listTree(snap) {
  if (snap.srcDir) { const out = []; const walk = rel => { const d = path.join(snap.srcDir, rel); if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const r = rel + '/' + e.name; if (e.isDirectory()) walk(r); else out.push({ path: r, sha: null, size: fs.statSync(path.join(snap.srcDir, r)).size }); } }; walk('docs/balance'); return out; }
  return readJ(snap.tree) || tree(snap.sha);
}
// The date a file last changed (one API call a file, cached; the importer caps how many it asks for).
async function commitDate(p) {
  const f = path.join(home(), 'dates.json'), c = readJ(f, {}); if (c[p]) return c[p];
  const l = await gh('/commits?per_page=1&path=' + encodeURIComponent(p)); const d = l && l[0] && l[0].commit.committer.date; if (d) { c[p] = d; writeJ(f, c); }
  return d || null;
}

module.exports = { home, dir, pull, workspace, liveOverrides, applyOverrides, dataHash, fileAt, listTree, commitDate, needed, readJ, writeJ, sha1, RateLimit, OWNER, REPO };
