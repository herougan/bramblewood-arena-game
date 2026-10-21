#!/usr/bin/env node
// Prune stale lang/ui rows (2026-10-21, workflow audit). A package that turns a literal arena_app.js string into a TX key, or removes
// it, leaves its lang/ui/<code>.json row behind, and tests/i18n-ui-2026-10-18.js then fails ("every key is text from the source").
// This applies the test's own rule:
//   - a stray row whose English text is now a TX value moves to lang/<code>.json, unless that pack already has it;
//   - any other stray row is dropped.
// It is run by tools/merge/merge_pkg.sh before the rebuild; it also runs by hand. Prints what it did.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
// same corpus as the test: arena_app.js with string escapes undone and entities decoded, plus card flavour lines
const app = read('arena_app.js');
const unesc = s => s.replace(/\\u\{([0-9a-fA-F]+)\}/g, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\x([0-9a-fA-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(['"`\\$])/g, '$1');
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'", nbsp: ' ', middot: '·', mdash: '—', ndash: '–', hellip: '…', times: '×', rarr: '→', larr: '←', minus: '−' };
const ent = s => s.replace(/&(amp|lt|gt|quot|#39|#x27|nbsp|middot|mdash|ndash|hellip|times|rarr|larr|minus);/g, (m, e) => ENT[e]).replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d));
const flav = JSON.parse(read('canonical/cards.json')).map(c => c.flavor || '').join('\n');
const corpus = [app, unesc(app), ent(unesc(app)), flav].join('\n');
const inSource = k => k.split(/\{\w+\}/).map(p => p.trim()).filter(p => /\p{L}{2}/u.test(p)).every(p => corpus.includes(p));
const txValues = new Set();
for (const m of read('bramblewood-texts.js').matchAll(/^\s*"[\w.-]+"\s*:\s*"((?:[^"\\]|\\.)*)"/gm)) { try { txValues.add(JSON.parse('"' + m[1] + '"')); } catch (e) { } }
const dir = path.join(ROOT, 'lang', 'ui');
let moved = 0, dropped = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const uiPath = path.join(dir, f), mainPath = path.join(ROOT, 'lang', f);
  const ui = JSON.parse(fs.readFileSync(uiPath, 'utf8'));
  const main = fs.existsSync(mainPath) ? JSON.parse(fs.readFileSync(mainPath, 'utf8')) : null;
  let changed = false, mainChanged = false;
  for (const k of Object.keys(ui)) {
    if (inSource(k)) continue;
    if (main && txValues.has(k)) { if (!(k in main)) { main[k] = ui[k]; mainChanged = true; } moved++; }
    else dropped++;
    delete ui[k]; changed = true;
  }
  if (changed) fs.writeFileSync(uiPath, JSON.stringify(ui, null, 1) + '\n');
  if (mainChanged) fs.writeFileSync(mainPath, JSON.stringify(main, null, 1) + '\n');
}
console.log(`lang/ui: ${moved} row(s) moved to the main packs, ${dropped} stale row(s) dropped`);
