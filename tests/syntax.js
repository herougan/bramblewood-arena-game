#!/usr/bin/env node
// Syntax gate (2026-10-09): a stray line comment once swallowed a '});' in arena_app.js and broke the whole
// live page while every engine test still passed (they never load arena_app.js). This parses every shipped
// script and every inline <script> in the built index.html.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..');
let bad = 0;
const check = (name, code)=>{ try{ new vm.Script(code, {filename: name}); }catch(e){ bad++; console.log(`  ✗ ${name}: ${e.message}`); } };
fs.readdirSync(R).filter(f=> /^(arena_app|bramblewood-[\w-]+)\.js$/.test(f)).forEach(f=> check(f, fs.readFileSync(path.join(R, f), 'utf8')));
const html = fs.existsSync(path.join(R, 'index.html')) ? fs.readFileSync(path.join(R, 'index.html'), 'utf8') : '';
let k = 0; html.replace(/<script(?![^>]*\bsrc=)(?![^>]*type="(?:application\/json|importmap|module)")[^>]*>([\s\S]*?)<\/script>/g, (_, code)=>{ k++; check(`index.html inline script #${k}`, code); return ''; });
console.log(`syntax: ${bad} failure(s) (${k} inline scripts)`);
process.exit(bad ? 1 : 0);
