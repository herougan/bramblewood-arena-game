#!/usr/bin/env node
// Package UI4 (2026-10-30; owner 10:34 V2, V3). Static checks; the browser run is tests/e2e/ui4_2026_10_30.py (shots in docs/screens/ui4/).
//   V2 a hit on a shielded bramble draws no lightning-like dome: FX.C.castleShield is replaced (ui4PatchCastleShieldFx) by a plain ring + Shield-number pop
//   V3 the end sign no longer shatters the tokens (they shattered at a random moment of the end beat and came back with the results screen)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js');
function fnSrc(name){
  let a = app.indexOf('\nfunction ' + name + '('); if(a < 0) a = app.indexOf('\nasync function ' + name + '('); if(a < 0) return '';
  let i = app.indexOf('{', a), depth = 0;
  for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return app.slice(a + 1, i + 1);
}

// ---- V3: showEndSign
{ const src = fnSrc('showEndSign');
  ok(src.length > 500, 'showEndSign found');
  ok(!/pixelShatterVfx\s*\(/.test(src), 'V3: showEndSign never shatters the board\'s tokens');
  ok(!/d\.token/.test(src), 'V3: showEndSign does not pick tokens out of the rows');
  ok(/2026-10-30 \(package UI4, V3/.test(src), 'V3: the reason is written beside the removed block');
  // a token that dies in a fight still shatters (deathVfx is the one caller left)
  const callers = (app.match(/pixelShatterVfx\(/g) || []).length;
  ok(callers === 2, 'V3: pixelShatterVfx is still defined once and called once, by deathVfx (' + callers + ')');
  ok(/pixelShatterVfx\(el, Math\.round\(death\*1\.1\)\)/.test(fnSrc('deathVfx')), 'V3: deathVfx keeps the token shatter for a token that dies');
}

// ---- V2: the bramble's shield hit
{ const src = fnSrc('ui4CastleShieldHit'), patch = fnSrc('ui4PatchCastleShieldFx');
  ok(src.length > 200 && patch.length > 100, 'V2: the plain shield hit and its patch exist');
  ok(!/fxc-dome|conic|zig|bolt|lightning|electric|shock/i.test(src), 'V2: the plain shield hit draws no dome, spokes or bolt');
  ok(/ui4-shield-ring/.test(src) && /castle-shield/.test(src), 'V2: it keeps a ring and pops the Shield number');
  ok(/SoundKit\.shield\(\)/.test(src) && /iceShatter/.test(src), 'V2: it keeps the shield sound (and the break sound)');
  ok(/FX\.C\.castleShield\s*=/.test(patch) && /FX\.C\.castleShield_B\s*=/.test(patch), 'V2: FX.C.castleShield and _B are replaced');
  ok(/setTimeout\(ui4PatchCastleShieldFx, 0\)/.test(app), 'V2: the patch is bound once at load');
  ok(!/bramblewood-fx-c\.js/.test(src), 'V2: bramblewood-fx-c.js is left as it was');
  const fxc = rd('bramblewood-fx-c.js');
  ok(/M\.castleShield = function/.test(fxc), 'V2: the original is still in FX.C (the Effects Lab shows it; the game replaces it)');
}

console.log(fail ? `ui4-2026-10-30: ${fail} FAILED of ${checks}` : `ui4-2026-10-30: all ${checks} checks passed`);
process.exit(fail ? 1 : 0);
