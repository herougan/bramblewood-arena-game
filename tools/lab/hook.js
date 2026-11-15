// 2026-11-16 (package LAB1): preloaded into every sim the Lab starts (NODE_OPTIONS --require). A repo file the pull did not copy
// (a tool reads a docs/balance file nobody listed) is fetched on first read, from the checkout (--local) or GitHub at the run's commit.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = process.env.LAB_RUN_ROOT, META = process.env.LAB_SNAP_META;
if (ROOT && META && fs.existsSync(META)) {
  const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
  let listed = null; const inTree = rel => { if (meta.srcDir) return fs.existsSync(path.join(meta.srcDir, rel)); if (!listed) { try { listed = new Set(JSON.parse(fs.readFileSync(meta.tree, 'utf8')).map(x => x.path)); } catch (e) { listed = new Set(); } } return listed.has(rel); };
  const tried = new Set();
  const fill = p => {
    let a; try { a = path.resolve(String(p)); } catch (e) { return; }
    if (!a.startsWith(ROOT + path.sep) || tried.has(a)) return; tried.add(a);
    if (fs.__labExists(a)) return; const rel = path.relative(ROOT, a).split(path.sep).join('/');
    if (!inTree(rel)) return;
    fs.mkdirSync(path.dirname(a), { recursive: true });
    if (meta.srcDir) { fs.copyFileSync(path.join(meta.srcDir, rel), a); return; }
    const url = `https://raw.githubusercontent.com/herougan/bramblewood-arena-game/${meta.sha}/${rel}`;
    cp.spawnSync(process.execPath, ['-e', 'fetch(process.argv[1]).then(r=>{if(!r.ok)process.exit(1);return r.arrayBuffer()}).then(b=>require("fs").writeFileSync(process.argv[2],Buffer.from(b)))', url, a], { env: Object.assign({}, process.env, { NODE_OPTIONS: '' }), timeout: 60000 });
  };
  fs.__labExists = fs.existsSync;
  for (const k of ['readFileSync', 'existsSync', 'statSync', 'openSync']) { const o = fs[k]; fs[k] = function (p, ...a) { if (typeof p === 'string') fill(p); return o.call(this, p, ...a); }; }
}
