'use strict';
// SPEED1 (2026-10-31): the budget constants the price step may set, each a single value in bramblewood-budget.js with a dated comment.
//   cap2SScale        CAP2_S_SCALE: cap 2 reads the skill price at this share of itself (owner SKILL2-1: 0.5)
//   flying, evasive, shadow   MISS_MULT_BY[...]: the half-miss multiplier on the stat terms (owner SKILL2-2: flying and evasive at the measured 1.13)
// Nothing else in the budget file is touched; a name not listed is refused.
const fs = require('fs'), path = require('path');
const P = require('./lib.js');
const FILE = path.join(P.ROOT, 'bramblewood-budget.js');
const NAMES = ['cap2SScale', 'flying', 'evasive', 'shadow'];

function read(text) {
  text = text || fs.readFileSync(FILE, 'utf8');
  const c = /^const CAP2_S_SCALE = ([0-9.]+);/m.exec(text), m = /^const MISS_MULT_BY = \{([^}]*)\};/m.exec(text);
  if (!c || !m) throw new Error('bramblewood-budget.js: CAP2_S_SCALE / MISS_MULT_BY lines not found');
  const by = {}; m[1].split(',').forEach(kv => { const [k, v] = kv.split(':').map(x => x.trim()); if (k) by[k] = +v; });
  return { cap2SScale: +c[1], flying: by.flying, evasive: by.evasive, shadow: by.shadow };
}
// spec "cap2SScale=0.5,flying=1.13" -> {name: number}
function parse(spec) {
  const out = {}; String(spec || '').split(',').map(s => s.trim()).filter(Boolean).forEach(kv => { const [k, v] = kv.split('=');
    if (!NAMES.includes(k)) throw new Error(`--set-const: '${k}' is not a pipeline constant (${NAMES.join(', ')})`);
    if (!(+v > 0)) throw new Error(`--set-const ${k}: needs a positive number`); out[k] = +v; });
  return out;
}
function apply(changes, why, date) {
  let text = fs.readFileSync(FILE, 'utf8'); const was = read(text), done = [];
  Object.keys(changes).forEach(k => { const to = changes[k]; if (was[k] === to) return;
    if (k === 'cap2SScale') text = text.replace(/^const CAP2_S_SCALE = [0-9.]+;/m, `const CAP2_S_SCALE = ${to}; // ${date} (SPEED1 pipeline, ${why.cap2SScale || 'owner'}): ${was[k]} -> ${to}`);
    else { text = text.replace(/^(const MISS_MULT_BY = \{)([^}]*)(\};)/m, (all, a, body, z) => a + body.split(',').map(kv => { const [n, v] = kv.split(':'); return n.trim() === k ? `${n.trim()}: ${to}` : kv.trim(); }).join(', ') + z); }
    done.push({ id: k, field: 'budget constant', old: was[k], new: to }); });
  const miss = done.filter(d => d.id !== 'cap2SScale');
  if (miss.length) text = text.replace(/^(const MISS_MULT_BY = \{[^}]*\};)/m, `$1 // ${date} (SPEED1 pipeline, ${why.miss || 'owner'}): ` + miss.map(d => `${d.id} ${d.old} -> ${d.new}`).join(', '));
  if (done.length) { new (require('vm').Script)(text); fs.writeFileSync(FILE, text); read(text); }
  return done;
}
module.exports = { read, parse, apply, NAMES, FILE };
