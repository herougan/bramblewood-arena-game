#!/usr/bin/env node
// 2026-11-02 (package UI16, owner 11-02 22:15 notes 9, 10, 1), source and text checks; the behaviour on the page is the browser run
// tests/e2e/ui16_2026_11_02.py.
//   note 9: the versus opener's rival card has no facts line any more (people, castle Health / Armour, the leader line, the CPU), the map
//           name comes before the code, and ui16VsArtStageHTML draws the leader's and the bramble's art.
//   note 10: autoplayStep sends its events through ui16AutoHandFx before the hand is redrawn; the pitch flies to #dropDiscard.
//   note 1: every look id (background, border, font, prefix, suffix) has its TX name and a CSS rule, and every UI16 English text is in all 12
//           language packs; the avatar record (where the looks live) is a synced progress key.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const { TEXT } = require(path.join(ROOT, 'bramblewood-texts.js'));
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };

// ---- note 9
const vo = fn('showVersusOpener');
ok(vo.length > 500, 'showVersusOpener found');
ok(!/castleLineText\(node\)|cpuAiPillHTML|vs-people|vs-fact\b/.test(vo), 'the opener builds no facts line (people, castle, CPU)');
ok(/ui16VsArtStageHTML\(map, node, enemyChar\)/.test(vo), 'the opener asks for the art row');
const iMap = vo.indexOf('ui16-vs-map'), iKick = vo.indexOf('ui14-vs-kicker vs-kind');
ok(iMap > 0 && iKick > iMap, 'the map name comes before the code and kind');
const st = fn('ui16VsArtStageHTML');
ok(/leadersShownFor\(node/.test(st) && /is-\$\{kind\}/.test(st) && /return '';/.test(st), 'the art row: the leaders, the bramble, and nothing when there is no art');
ok(/\.ui16-vs-pic\{[^}]*mask-image:radial-gradient/.test(css), 'the pictures are feathered with a radial mask');

// ---- note 10
const ap = fn('autoplayStep');
const iFx = ap.indexOf('ui16AutoHandFx('), iRender = ap.indexOf('renderHand()');
ok(iFx > 0 && iRender > iFx, 'autoplayStep runs ui16AutoHandFx before it redraws the hand');
const ah = fn('ui16AutoHandFx');
ok(/viewerHandPid\(m\) !== 1/.test(ah) && /pendingEntranceOrigins\.set/.test(ah) && /kind: 'hand'/.test(ah), 'a play flies from the hand tile (pendingEntranceOrigins, kind hand)');
ok(/ui16PitchToGrave\(m, t, e\)/.test(ah), 'a pitch goes to ui16PitchToGrave');
const pg = fn('ui16PitchToGrave');
ok(/getElementById\('dropDiscard'\)/.test(pg) && /resourceGainVfx/.test(pg) && /pitchCallout/.test(pg) && /reducedMotion\(\)/.test(pg), 'the pitch lands on the Graveyard with the gain and callout, and respects reduced motion');

// ---- note 1
const m = /const UI16_LOOKS = \{([\s\S]*?)\n\};/.exec(app); ok(!!m, 'UI16_LOOKS found');
const looks = {}; if(m){ for(const kind of ['bg', 'border', 'font', 'prefix', 'suffix']){ const r = new RegExp(kind + ': \\[([^\\]]*)\\]').exec(m[1]); looks[kind] = r ? [...r[1].matchAll(/id:'([a-z]+)'/g)].map(x=> x[1]) : []; } }
ok(looks.bg.length >= 4 && looks.border.length >= 4 && looks.font.length >= 3 && looks.prefix.length >= 4 && looks.suffix.length >= 4, `a small set of each ${JSON.stringify(looks)}`);
ok(looks.bg[0] === 'meadow' && looks.border[0] === 'plain' && looks.font[0] === 'classic' && looks.prefix[0] === 'none' && looks.suffix[0] === 'none', 'the first of each is the default');
const en = new Set();
for(const [kind, ids] of Object.entries(looks)) for(const id of ids){
  const key = `ui.ui16-${kind}-${id}`; ok(typeof TEXT[key] === 'string', `${key} has its text`); if(TEXT[key]) en.add(TEXT[key]);
  if(['bg', 'border', 'font'].includes(kind)) ok(css.includes(`[data-ui16-${kind}="${id}"]{`), `CSS dresses ${kind} ${id}`);
}
Object.keys(TEXT).filter(k=> k.startsWith('ui.ui16-')).forEach(k=> en.add(TEXT[k]));
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
for(const code of CODES){ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')); const miss = [...en].filter(s=> !(s in pack)); ok(!miss.length, `${code}: every UI16 text translated ${miss.slice(0, 3)}`); }
ok(/'bramblewood_avatar'/.test(/const PROGRESS_KEYS = \[[\s\S]*?\];/.exec(app)[0]), 'the avatar record is a synced progress key');
const la = fn('ui16LookAttrs'), lo = fn('ui16LookOf');
ok(/escapeAttr\(ui16LookOf\(k, av\[k\]\)\.id\)/.test(la) && /\|\| L\[0\]/.test(lo), 'a look is written only as a known id (an unknown one is the default)');
const wc = fn('wireAvatarCustomizer');
ok(/ui16LookUnlocked\(/.test(wc), 'a locked look cannot be picked');

console.log(`ui16: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
