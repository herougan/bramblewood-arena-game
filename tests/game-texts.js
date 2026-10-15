#!/usr/bin/env node
// Game texts (2026-10-15, user: "Regarding text in game, is there a way you can offload it into a excel so I can edit the text
// from there?"): every TX('key') in the code has its text in bramblewood-texts.js, every {placeholder} in a text is passed by
// each call, TX fills them, the designer's example change is in, and the spreadsheet round trip (export -> edit every row ->
// import) works (tools/text/selftest.py, on a temp copy).
'use strict';
const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const R = path.join(__dirname, '..');
let fail = 0;
const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗ ' + m); } };
const {TEXT, TX} = require(path.join(R, 'bramblewood-texts.js'));
const src = fs.readFileSync(path.join(R, 'arena_app.js'), 'utf8');

// 1. every key used exists; every placeholder in its text is passed at each call
const uses = [...src.matchAll(/\bTX\(\s*'([^']+)'\s*(,\s*\{)?/g)];
ok(uses.length > 400, `the code asks for its texts by key (${uses.length} TX calls)`);
const missing = [...new Set(uses.map(m=> m[1]).filter(k=> !(k in TEXT)))];
ok(!missing.length, `every TX key is in the table (missing: ${missing.slice(0, 10).join(', ')})`);
function varsAt(i){ // the top-level names of the {…} object that starts at src[i] === '{'
  let depth = 0, j = i, q = null, names = [], tok = '';
  for(; j < src.length; j++){
    const c = src[j];
    if(q){ if(c === '\\'){ j++; continue; } if(c === q) q = null; continue; }
    if(c === '\'' || c === '"' || c === '`'){ q = c; continue; }
    if('{[('.includes(c)){ depth++; if(depth === 1) continue; }
    if('}])'.includes(c)){ depth--; if(depth === 0){ names.push(tok); break; } }
    if(depth === 1){ if(c === ','){ names.push(tok); tok = ''; } else tok += c; }
  }
  return names.map(t=> t.trim().split(':')[0].trim()).filter(Boolean);
}
let bad = [];
for(const m of uses){
  const text = TEXT[m[1]]; if(text == null) continue;
  const need = [...new Set([...text.matchAll(/\{(\w+)\}/g)].map(x=> x[1]))];
  const have = m[2] ? varsAt(m.index + m[0].length - 1) : [];
  const lack = need.filter(n=> !have.includes(n));
  if(lack.length) bad.push(`${m[1]} (no ${lack.join(', ')})`);
}
ok(!bad.length, `every {placeholder} is filled at every call: ${bad.slice(0, 8).join('; ')}`);
const unused = Object.keys(TEXT).filter(k=> !uses.some(m=> m[1] === k));
ok(!unused.length, `no text in the table goes unused (${unused.slice(0, 8).join(', ')})`);

// 2. TX itself
const anyVar = Object.keys(TEXT).find(k=> /\{n\}/.test(TEXT[k]));
ok(TX('dialog.forfeit-ok') === TEXT['dialog.forfeit-ok'], 'TX returns the table text');
if(anyVar) ok(!/\{n\}/.test(TX(anyVar, {n: 7})) && TX(anyVar, {n: 7}).includes('7'), 'TX fills {n}');
{ const w = console.warn; console.warn = ()=>{}; ok(TX('no.such.key') === 'no.such.key', 'an unknown key shows itself (and the test above keeps that from shipping)'); console.warn = w; }

// 3. the designer's example went through the pipeline
ok(TEXT['dialog.forfeit-body'] === 'This counts as a loss. If you Quit instead, you can continue from where you left off.', "the forfeit dialog's new wording (2026-10-15)");
ok(/bwConfirm\(\{title:TX\('dialog\.forfeit-title'\), body:TX\('dialog\.forfeit-body'\)/.test(src), 'the forfeit dialog reads it from the table');
ok(!/Quit instead keeps the fight/.test(src.replace(/\/\/[^\n]*/g, '')), 'the old wording is gone from the code');

// 4. the spreadsheet round trip
try{
  const out = execFileSync('python3', [path.join(R, 'tools', 'text', 'selftest.py')], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 240000});
  ok(/all passed/.test(out), 'export -> edit every row -> import round trip: ' + out.trim().split('\n').slice(-3).join(' | '));
}catch(e){ ok(false, 'round trip failed: ' + String((e.stdout || '') + (e.stderr || e.message)).trim().split('\n').slice(-8).join(' | ')); }

console.log(`game-texts: ${fail ? fail + ' failure(s)' : 'all passed'}`);
process.exit(fail ? 1 : 0);
