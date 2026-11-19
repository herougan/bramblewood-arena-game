#!/usr/bin/env node
// 2026-11-20 (package UIQ1; owner 11-20 00:01: "card hover desc: Do not put the mystery as a context pip. Instead, the ? in the description has extra text.")
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), tx = rd('bramblewood-texts.js');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
ok(/card-pop-visual-tile/.test(app) && /noQ:true \/\* UIQ1 \*\/, extraClass:'card-pop-visual-tile'/.test(app), 'the hover panel art asks for no "?" pip');
ok(/\{noQ: !!opts\.noQ, compact:/.test(app), 'cardTileHTML passes noQ to abilityBadges');
ok(/if\(bopts && bopts\.noQ\) for\(let i = out\.length; i--;\) if\(\/class="skill-q\//.test(app), 'abilityBadges drops the "?" chips under noQ');
ok(/uiq1-q-text">\$\{escapeHtml\(say\)\}/.test(app) && /TX\('ui\.uiq1-learns', \{n: lv\}\)/.test(app), 'the later-skill line says "Learns a skill at Level N"');
ok(/TX\('ui\.uiq1-locked'\)/.test(app), 'the not-yet line says "Not unlocked yet"');
for(const k of ['ui.uiq1-learns', 'ui.uiq1-locked']){
  ok(tx.includes(`"${k}"`), k + ' in the texts');
  for(const c of 'fr de es it pt tl ta id zh-Hans zh-Hant ja ko'.split(' ')){
    const en = JSON.parse(rd('lang/' + c + '.json'));
    ok(en[k === 'ui.uiq1-learns' ? 'Learns a skill at Level {n}' : 'Not unlocked yet'], c + ' has ' + k);
  }
}
ok(/\.uiq1-q-text\{/.test(rd('arena_template.html')), 'the text style exists');
console.log(fail ? `uiq1: ${fail} failed` : 'uiq1: all passed'); process.exit(fail ? 1 : 0);
