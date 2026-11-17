// REDESIGN3b (2026-11-17): field rules of the Maps 0-20 fights, read from arena_app.js node lines (key "N-x" ... rules:{...}).
// node fields.js            -> prints them; require('./fields.js').nodeRules() -> {mapIndex: [{node, kind, name, rules: [key, ...]}]}
const fs = require('fs');
const ROOT = require('path').resolve(__dirname, '../..');
function nodeRules() {
  const out = {};
  fs.readFileSync(ROOT + '/arena_app.js', 'utf8').split('\n').forEach(l => {
    const m = /\bkey:\s*"(\d+)-([0-9A-Za-z-]+)"/.exec(l); if (!m || +m[1] > 20) return;
    const r = /rules:\s*\{([^}]*)\}/.exec(l);
    const rules = r ? r[1].split(',').map(s => s.trim()).filter(Boolean) : [];
    (out[+m[1]] = out[+m[1]] || []).push({node: m[1] + '-' + m[2], kind: (/kind:\s*"([^"]*)"/.exec(l) || [])[1], name: (/name:\s*"([^"]*)"/.exec(l) || [])[1], rules});
  });
  return out;
}
module.exports = {nodeRules};
if (require.main === module) Object.entries(nodeRules()).forEach(([k, v]) => console.log(k, v.map(n => n.node + (n.rules.length ? '{' + n.rules.join(' ') + '}' : '')).join(' | ')));
