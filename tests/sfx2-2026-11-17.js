#!/usr/bin/env node
// 2026-11-17 (package SFX2, owner 23:05: "play a stock trumpet sound when something inspires"): the synthesized Inspiring horn.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = rd('arena_app.js');
const cue = (app.match(/\n    rallyHorn\(\)\{[\s\S]*?\n    \},\n/) || [''])[0];
const hb = (app.match(/function hornBuf\(c\)\{[\s\S]*?\n  \}\n/) || [''])[0];
ok(cue.length > 0 && hb.length > 0, 'SoundKit.rallyHorn and its buffer exist');
ok(/sfxVolume <= 0\) return false/.test(cue) && /lastHornAt < 450/.test(cue) && /\* sfxVolume/.test(cue), 'rallyHorn obeys the SFX volume and the 450 ms rate limit');
ok(!/Math\.random/.test(hb) && !/Math\.random/.test(cue), 'no Math.random in the horn (sound never touches the battle RNG)');
ok((app.match(/SoundKit\.rallyHorn\(\)/g) || []).length === 1 && /function pl2InspireFx[\s\S]{0,900}SoundKit\.rallyHorn \? SoundKit\.rallyHorn\(\)/.test(app), 'only pl2InspireFx plays the horn');
ok(/else if\(ev\.kind==='inspired'\)\{ pl2InspireFx\(ev, rc\); \}/.test(app), "pl2InspireFx is only the 'inspired' statusFx branch");
ok(!/rallyHorn/.test(rd('bramblewood-engine.js')), 'the engine does not know about sound');
ok(/\['rallyHorn', /.test(rd('tools/effects-lab/effects-lab.js')), 'Effects Lab sound list has it');
ok(/rallyHorn/.test(rd('docs/sfx-cue-sheet.md')) && /rallyHorn/.test(rd('docs/effects-catalogue.md')) && /package SFX2/.test(rd('docs/CHANGELOG.md')), 'cue sheet, catalogue and CHANGELOG');
ok(/sfx2-2026-11-17\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
// the buffer: 0.5-0.7 s, sane peak, deterministic
const mkBuf = new Function('c', hb + ';return hornBuf(c)');
const a = mkBuf({sampleRate: 44100}), b = mkBuf({sampleRate: 44100});
let pk = 0; for(const v of a.d) pk = Math.max(pk, Math.abs(v));
ok(a.len / 44100 >= 0.5 && a.len / 44100 <= 0.7, 'length 0.5-0.7 s, got ' + (a.len / 44100).toFixed(2));
ok(pk > 0.3 && pk < 1, 'peak in range, got ' + pk.toFixed(2));
ok(a.d.every((v, i)=> v === b.d[i]), 'deterministic buffer');
// rate limit and volume gate, run for real against stubs
let plays = 0, t = 1000;
const stub = {sampleRate: 44100};
const make = vol=> new Function('c', 'nowFn', 'sfxVolume', 'playBuf', 'bakedBuf', 'ac',
  'let lastHornAt = 0;\n' + hb + '\nconst Date = {now: nowFn};\nreturn ' + cue.trim().replace(/^rallyHorn\(\)/, 'function()').replace(/,$/, '') + ';')(stub, ()=> t, vol, ()=>{ plays++; }, (c, k, f)=> f(), ()=> stub);
const horn = make(1);
horn(); horn(); horn(); ok(plays === 1, 'three Inspiring triggers in one beat play once, got ' + plays);
t += 500; horn(); ok(plays === 2, 'plays again after 450 ms');
plays = 0; t += 2000; make(0)(); ok(plays === 0, 'silent when the SFX volume is 0');
console.log(fail ? 'FAIL' : 'PASS', (n - fail) + '/' + n);
process.exit(fail ? 1 : 0);
