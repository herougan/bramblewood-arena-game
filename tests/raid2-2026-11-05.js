#!/usr/bin/env node
// 2026-11-05 (package RAID2, owner 22:18): the raid screen tidied and the raid fight reworked.
//   1. the raid's tide damage comes in waves (bands of the board, bottom up on a Flood, top down on an Ebb), same hits, only their moment
//   2. a round with a tentacle smack plays the tentacle first, the tide after it
//   3. no golden name pill when an ally plays a card
//   4. the raid / group-dungeon zoom (button, ctrl-wheel, pinch, drag): the geometry helpers and the wiring
//   5. the part picker: three parts, then the Core alone; no leader line, phase pill, BR line, rhythm line or attempts line; rewards as kinds
//   6. the texts: new keys translated in all 12 packs, removed keys gone
'use strict';
const fs = require('fs'), path = require('path');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const root = p=> path.join(__dirname, '..', p);
const src = fs.readFileSync(root('arena_app.js'), 'utf8'), tpl = fs.readFileSync(root('arena_template.html'), 'utf8');
const texts = require('../bramblewood-texts.js');
const fnSrc = name=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return null; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return null; };
const constSrc = re=>{ const m = src.match(re); return m ? m[0] : ''; };

// ---------- 1. waves ----------
{ const code = [constSrc(/const RAID_TIDE_WAVES = 3, RAID_TIDE_WAVE_MS = 460;/), fnSrc('raidTideEv'), fnSrc('raidTideDown'), fnSrc('raidTideStamp')].join('\n');
  ok(code.includes('raidTideStamp') && code.includes('RAID_TIDE_WAVES'), 'the wave code is in arena_app.js');
  const rect = (top, h)=> ({top, height: h, bottom: top + h, left: 0, width: 100, right: 100});
  const cards = {1: rect(600, 100), 2: rect(300, 100), 3: rect(20, 100), 4: rect(610, 90)}; // bottom, middle, top, bottom
  const bf = {getBoundingClientRect: ()=> rect(0, 720)};
  const run = (events, speed)=>{ const f = new Function('document', 'boardCardEl', code + '\nreturn {raidTideStamp, raidTideEv, raidTideDown};')(
    {getElementById: id=> id === 'battlefieldEl' ? bf : null}, uid=> cards[uid] ? {getBoundingClientRect: ()=> cards[uid]} : null);
    f.raidTideStamp(events, {raidFull: true, speedMult: speed || 1}); return f; };
  const hits = ()=> [1, 2, 3, 4].map(u=> ({type: 'fieldTick', field: 'crushingHit', uid: u, dmg: 1}));
  let ev = hits().concat([{type: 'tide', tide: 'flow'}]); run(ev);
  ok(ev[0]._tideWave === 0 && ev[3]._tideWave === 0 && ev[1]._tideWave === 1 && ev[2]._tideWave === 2, `a Flood: bottom units are wave 0, middle 1, top 2 (${ev.slice(0, 4).map(e=> e._tideWave)})`);
  ok(ev[0]._fxGap === 0 && ev[1]._fxGap === 460 && ev[2]._fxGap === 920, `each wave lands RAID_TIDE_WAVE_MS later (${ev.slice(0, 3).map(e=> e._fxGap)})`);
  ev = hits().concat([{type: 'tide', tide: 'ebb'}]); run(ev);
  ok(ev[2]._tideWave === 0 && ev[0]._tideWave === 2, `an Ebb goes the other way: top first (${ev.slice(0, 3).map(e=> e._tideWave)})`);
  ev = hits(); run(ev, 2); ok(ev[2]._fxGap === 460, `at 2x playback the gaps halve (${ev[2]._fxGap})`);
  ev = hits(); ev[1]._fxGap = 250; run(ev); ok(ev[1]._fxGap === 250 + 460, 'a second number on a unit keeps its own field gap on top of its wave');
  const total = e=> JSON.stringify(e.map(x=> [x.uid, x.dmg]));
  ev = hits(); const before = total(ev); run(ev); ok(total(ev) === before, 'the damage figures are untouched: timing only');
  const f2 = new Function(code + '\nreturn {raidTideStamp};')(); const e2 = hits(); f2.raidTideStamp(e2, {raidFull: false}); ok(e2.every(x=> x._tideWave == null), 'a plain fight is not staggered');
  ok(/raidTideStamp\(drawEvents, m\)/.test(src), 'the round start stamps the waves');
  ok(/function raidTideCrests\(events, m\)\{[\s\S]{0,300}reducedMotion\(\)/.test(src), 'a crest crosses each wave (not under reduced motion)');
  ok(/raid-tide-crest/.test(tpl) && /@keyframes rtcUp/.test(tpl) && /@keyframes rtcDown/.test(tpl), 'the crest is styled');
}

// ---------- 2. tentacle, then tide ----------
{ const i = src.indexOf('const tideAfter = '), j = src.indexOf('smackSt.end()', i);
  ok(i > 0 && j > i, 'the round start holds the tide back when a smack is in the round');
  const seg = src.slice(i, j);
  ok(/drawEvents\.some\(ev=> ev && ev\.type === 'raidSmack'\)\s*\?\s*drawEvents\.filter\(raidTideEv\)/.test(seg), 'only a round with a raidSmack holds the tide');
  ok(/if\(tideHeld\.has\(ev\)\) return;/.test(seg), 'the held tide events are skipped in the first pass');
  const w = seg.indexOf('smackSt.wait()'), p = seg.indexOf('tideAfter.forEach(ev=> renderVfxForEvent(ev))');
  ok(w > 0 && p > w, 'they play after the tentacle has finished (smackSt.wait)');
  ok(/if\(!tideAfter\.length\) fightSafe\(\(\)=> raidTideCrests\(drawEvents, m\)/.test(seg), 'with no smack the crests play with the damage');
  const f = new Function(fnSrc('raidTideEv') + '\nreturn raidTideEv;')();
  ok(f({type: 'tide'}) && f({type: 'fieldTick', field: 'crushingHit'}) && f({type: 'fieldTick', field: 'crushingDepths'}) && !f({type: 'raidSmack'}) && !f({type: 'fieldTick', field: 'hailHit'}), 'the tide events are the water and its damage, nothing else');
}

// ---------- 3. no ally pill ----------
ok(!/allyNameTagPulse/.test(src) && !/ally-play-tag/.test(src) && !/ally-play-tag/.test(tpl), 'the ally name pill is gone (code and CSS)');
ok(/function allyPlayFx\(uid, opts\)/.test(src) && /allyHandFan\(from, w \|\| 40\)/.test(src), 'the ally still plays its card from its hand');
ok(texts.TEXT['ui.raid-ally-plays'] === undefined, 'its TX key is removed');

// ---------- 4. zoom ----------
{ const code = [constSrc(/const RZ_MS = 650, RZ_OPEN_DELAY = 1100, RZ_MAXZ = 3\.2, RZ_MINZ_GAIN = 1\.12;/), fnSrc('rzClamp'), fnSrc('rzFocus')].join('\n');
  const f = new Function(code + '\nreturn {rzClamp, rzFocus};')();
  const g = {F: {l: 0, t: 100, w: 400, h: 500}, O: {x: 200, y: 100}, L: 0, R: 400, T: 100, B: 600, top: 150, bot: 450, xc: 200, zmax: 1.6};
  let r = f.rzClamp(g, 9, 0, 0); ok(r.z === 1.6, 'the zoom stops at zmax');
  r = f.rzClamp(g, 0.3, 50, 50); ok(r.z === 1 && r.tx === 0 && r.ty === 0, `zoomed out it can't be shifted (${JSON.stringify(r)})`);
  r = f.rzClamp(g, 1.6, 9999, 9999); ok(r.tx === 120 && r.ty === 0, `zoomed in, a pan stops at the board's edge (${JSON.stringify(r)})`);
  r = f.rzFocus(g, 1.6); const yc = 300, screenY = g.O.y + 1.6 * (yc - g.O.y) + r.ty;
    ok(Math.abs(g.O.y + 1.6 * (g.top - g.O.y) + r.ty - g.F.t) < 80, `the focused band's top sits at the frame's top (${(g.O.y + 1.6 * (g.top - g.O.y) + r.ty).toFixed(0)})`);
  ok(/const RZ_BAND|0\.5 \* \(e1 \? e1\.height : re\.height\)/.test(src) && /0\.5 \* \(m1 \? m1\.height : rm\.height\)/.test(src), 'the zoomed view is your front row + half the next, the enemy front + half the next (1.5 rows a side)');
  ok(/\(m\.raidFull \|\| m\.coop\)/.test(fnSrc('rzActive')), 'raids and group dungeons');
  ok(/'wheel', ev=>\{\s*if\(!\(ev\.ctrlKey \|\| ev\.metaKey\)\) return;/.test(src) && /pts\.size === 2/.test(src) && /pointermove/.test(src), 'ctrl-wheel, pinch and drag are wired');
  ok(/if\(!s\.opened\)\{ s\.opened = true;/.test(src) && /RZ_OPEN_DELAY/.test(src), 'the fight opens zoomed out and eases in after a beat');
  ok(/rzToggle\(mm\)/.test(src) && /aria-pressed/.test(src), 'the button toggles between the two ends');
  ok(/fightSafe\(rzSync, 'rzSync'\)/.test(src), 'every board frame restores the zoom on a rebuilt wrapper');
  ok(/\.battlefield\.rz-on\{touch-action:none;\}/.test(tpl) && /\.battlefield\.rz-zoomed\{overflow-clip-margin:0px;\}/.test(tpl) && /\.rz-btn\{/.test(tpl), 'CSS: touch-action, clip while zoomed, the button');
  ok((src.match(/battlefieldScale > 0\)? \? bfEffScale\(\) : 1/g) || []).length >= 4, 'effects drawn in the board allow for the zoom');
  ok(/function raidFightMineSync\(\)/.test(src) && /raid-fight-mine/.test(tpl), 'your rank and damage on the raid frame');
}

// ---------- 5. the part picker ----------
{ const a = src.indexOf('function raidPanelHTML()'), b = src.indexOf('// Admin raid damage (2026-10-17'), seg = src.slice(a, b);
  ok(/const shown = gated\.length && free\.length && free\.every\(ps=> ps\.defeated\) \? gated : free\.length \? free : st\.parts;/.test(seg), 'three parts, then the Core alone');
  ok(/shown\.length === 1 \? ' is-one' : ''/.test(seg) && /\.r2-parts\.is-one\{grid-template-columns:1fr;\}/.test(tpl), 'the lone Core is one full-width card');
  ok(!/raidPartBRLine\(/.test(seg) && !/r3-atk/.test(seg) && !/ps\.attempts/.test(seg) && !/standIn/.test(seg), 'no BR line, rhythm line or attempts line on the cards');
  ok(/raidBarsHTML\(ps, \{simple: true\}\)/.test(seg) && /bars > 1 && !o\.simple/.test(src), 'no phase pill on the cards');
  ok(!/TX\('ui\.raid-leader-cap'/.test(src) && !/ui\.raid-leader-cost-ok/.test(src), 'the leader cost cap line is gone');
  ok(/if\(lc\.ok\) return '';/.test(seg) && /data-raid-leader/.test(seg), 'a leader over the cap still gets the reason and a way to change it (the fight would not start otherwise)');
  ok(!/r3-lanes|Three rows a side|r3-stages|r3-blurb/.test(seg), 'no explainer sections (rows, stages, rules)');
  ok(/rwTypes/.test(seg) && /r3-rw-types/.test(seg) && !/tierTxt\(/.test(seg.replace(/const tierTxt[^\n]*/, '')), 'rewards: kinds only, no amounts');
  ok(/r3-hp-row/.test(seg) && /r3-mine/.test(seg) && /rank-hex rank-/.test(seg), 'your rank (emblem) and damage sit beside the boss HP bar');
  ok(/\.raid3 \.r3-h\{margin:8px 0 6px;\}/.test(tpl), 'a tighter gap before "Pick a part to fight"');
}

// ---------- 6. texts ----------
{ const NEW = ['ui.raid2-damage', 'ui.raid2-pick', 'ui.raid2-fight', 'ui.raid2-rewards', 'ui.raid2-rw-cards', 'ui.raid2-zoom-in', 'ui.raid2-zoom-out'], GONE = ['ui.raid-ally-plays', 'ui.raid-leader-cap', 'ui.raid-leader-cost-ok'];
  NEW.forEach(k=> ok(typeof texts.TEXT[k] === 'string', 'TX key ' + k));
  GONE.forEach(k=> ok(texts.TEXT[k] === undefined, 'removed key ' + k));
  const read = p=>{ try{ return JSON.parse(fs.readFileSync(root(p), 'utf8')); }catch(e){ return {}; } };
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = Object.assign({}, read('lang/ui/' + c + '.json'), read('lang/cards/' + c + '.json'), read('lang/' + c + '.json')); // the order assemble_arena.py merges them
    const miss = NEW.filter(k=> !pack[texts.TEXT[k]]); ok(!miss.length, `the ${c} pack has the RAID2 texts (${miss.join(', ')})`);
    ['{name} plays {card}', '👑 Leader cost cap: {cap} points (each Lumber 1, Stone 2, Metal 3).'].forEach(s=> ok(!read('lang/' + c + '.json')[s], `${c}: no stale row "${s.slice(0, 20)}"`)); });
}

console.log(fail ? `raid2-2026-11-05: ${fail} failed` : 'raid2-2026-11-05: all passed');
process.exit(fail ? 1 : 0);
