#!/usr/bin/env node
// 2026-10-22 (package DN2, owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 ... can you just make the damage type emoji bigger if it's
// non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? ... a 10% lighter and higher hue version of the
// original color?"). Checks: the engine's tick / field / splash events carry the marks (mods) without any number moving; the number's
// parts (<type><number><mark>, the elemental crit), the crit colour shift, the battle log's marks; no old "-N" damage float left.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js'), E = H.Engine;
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:60, wait:5, cost:0, effects: effects || {}}, o || {});

// ---- 1. the engine: ticks carry the target's marks (display only)
{ const defs = Object.assign({}, H.loadCardDefs(), {'dn2-frag': U('dn2-frag', {fragile:true}), 'dn2-plain': U('dn2-plain'), 'dn2-coldweak': U('dn2-coldweak', {}, {weak:['cold']})});
  const mk = rules=>{ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; };
  const spawn = (e, P, pid, id)=>{ e.debugSpawnCard(P, so, pid, id, 'left', {}, []); return [...P[pid].row.left, ...P[pid].row.center, ...P[pid].row.right].filter(x=> x.defId === id).pop(); };
  { const {e, P} = mk(); const f = spawn(e, P, 1, 'dn2-frag'), p = spawn(e, P, 2, 'dn2-plain'); f.poison = 2; p.poison = 2;
    const ev = []; e.resolveCombat(P, so, {}, ev, 1);
    const tf = ev.find(x=> x.type === 'poisonTick' && x.uid === f.uid), tp = ev.find(x=> x.type === 'poisonTick' && x.uid === p.uid);
    ok(tf && Array.isArray(tf.mods) && tf.mods.includes('fragile'), `1. a Fragile unit's poison tick carries 'fragile' (${tf && JSON.stringify(tf.mods)})`);
    ok(tp && !(tp.mods && tp.mods.length), `1. a plain unit's poison tick carries no mark (${tp && JSON.stringify(tp.mods)})`);
    ok(tf && tp && tf.dmg === 4 && tp.dmg === 2, `1. the numbers are the engine's own (Fragile 2 → 4, plain 2; got ${tf && tf.dmg}, ${tp && tp.dmg})`); }
  { const {e, P} = mk({hail: 1}); const w = spawn(e, P, 1, 'dn2-coldweak'); const ev = []; e.resolveCombat(P, so, {}, ev, 2);
    const h = ev.find(x=> x.type === 'fieldTick' && x.field === 'hailHit' && x.uid === w.uid);
    ok(!h || (h.mods || []).includes('weak'), `1. a hail hit on a unit weak to cold carries 'weak' (${h ? JSON.stringify(h.mods) : 'no hail this round'})`); }
  { const {e, P} = mk(); const c = spawn(e, P, 1, 'dn2-frag'); e.damageCardFlat(c, 2, 'heat');
    ok(typeof e.hitModsFor === 'function' && (e.hitModsFor(c.uid) || []).includes('fragile'), '1. hitModsFor(uid) reads the last marks (the raid smacks use it)'); }
  const eng = R('bramblewood-engine.js');
  ok(/lastHitMods = \{uid: card\.uid, mods: o\.mods \|\| \(tempSoak > 0 \? \['shield'\] : \[\]\)\};/.test(eng), '1. every applyDamage sets the marks (a raw one clears them), so a tick never reads an older hit\'s');
  ['poisonTick', 'bleedTick', 'decayTick', 'curseTick', 'toxinTick', 'strangleTick', 'hazardSprung', 'meteorBurn', 'fireHit', 'friction'].forEach(t=>{
    const re = new RegExp("type:'" + t + "'[^\\n]*mods: ?(c \\? )?dnModsFor\\("); ok(re.test(eng), `1. ${t} events carry mods`); }); }

// ---- 2. the app's number parts, crit colour and log marks (the functions run as written)
const app = R('arena_app.js');
const grabConst = n=>{ const m = app.match(new RegExp('^const ' + n + ' = [^\\n]*$', 'm')); return m ? m[0] : ''; };
const grabFn = n=>{ const i = app.indexOf('\nfunction ' + n + '('); if(i < 0) return ''; const j = app.indexOf('\n}', i); const k = app.indexOf('\n', i + 1);
  const line = app.slice(i + 1, k); return /\}\s*(\/\/.*)?$/.test(line) && (line.match(/\{/g) || []).length === (line.match(/\}/g) || []).length ? line : app.slice(i + 1, j + 2); };
const src = ['DN_CRIT_MARK', 'ATK_ELEM_GLYPH', 'DMG_ICON', 'DMG_NAME', 'DN_MOD_GLYPH', 'DN_REDUCED', 'DN_TICK_GLYPH', 'DMG_CRIT_BY_CLASS' /* 2026-10-23 (SX): dnCritShift reads it */].map(grabConst).join('\n')
  + "\nObject.assign(DMG_ICON, {magic:['🪄','magic'], water:['💧','water'], psychic:['💭','psychic']});\n"
  + (app.match(/^const DMG_CRIT_LIGHTEN = [^\n]*$/m) || [''])[0] + '\n' + (app.match(/^const DMG_CRIT_FIST_ON_ELEMENT = [^\n]*$/m) || [''])[0] + '\n'
  + ['dnModKey', 'dnTypeGlyph', 'dnTypeGlyphAny', 'dmgFloatParts', 'dnHsl', 'dnCritShift', 'dmgLogText', 'dnLogNum', 'dnText'].map(grabFn).join('\n')
  + '\nthis.X = {dmgFloatParts, dnCritShift, dnHsl, dnLogNum, dmgLogText, dnText, DMG_CRIT_LIGHTEN, DMG_CRIT_HUE, DMG_CRIT_GLYPH_SCALE, DMG_CRIT_FIST_ON_ELEMENT};';
const ctx = {}; let X = null;
try{ vm.runInNewContext(src, ctx); X = ctx.X; }catch(e){ ok(false, '2. the DN2 helpers run: ' + e.message); }
if(X){
  ok(X.DMG_CRIT_LIGHTEN === 0.10 && X.DMG_CRIT_HUE === 12 && X.DMG_CRIT_GLYPH_SCALE === 1.4, '2. the crit knobs are in one place: 10% lighter, +12° hue, glyph ×1.4');
  const ice = X.dmgFloatParts(14, 'cold', true, ['fragile'], false);
  ok(ice.text === '❄️ 14' && ice.post === '🦴' && ice.critEl && ice.critEl.glyph === '❄️' && /\bcrit\b/.test(ice.cls), `2. an ice crit on a Fragile unit: big ❄️, 14, 🦴 (${JSON.stringify(ice)})`);
  const mag = X.dmgFloatParts(9, 'magic', true, [], false);
  ok(mag.text === '🪄 9' && mag.critEl && mag.critEl.cls === 'magic', '2. a magic crit: the wand is the big glyph (no 💥)');
  const phy = X.dmgFloatParts(7, 'physical', true, ['armor'], false);
  ok(phy.text === '💥 7' && phy.post === '⛨' && !phy.critEl, '2. a physical crit keeps the crit mark 💥 (DN2-3, GD), no big glyph');
  const tick = X.dmgFloatParts(3, 'poison', false, ['fragile'], false);
  ok(tick.text === '☠️ 3' && tick.post === '🦴' && !/-/.test(tick.text), '2. a poison tick: ☠️3🦴, no minus');
  ok(X.dmgFloatParts(2, 'curse', false, null, false).text === '🜏 2', '2. a curse tick keeps its 🜏');
  const blk = X.dmgFloatParts(0, 'heat', true, ['armor'], true);
  ok(blk.text === '🔥 0' && blk.post === '⛨' && !blk.critEl && blk.cls === 'blocked', '2. blocked to 0: no crit look, ⛨');
  const a = X.dnHsl('#7cc8ff'), b = X.dnHsl(X.dnCritShift('#7cc8ff').replace(/hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)/, (m, h, s, l)=> { const H2 = +h / 360, S = +s / 100, L = +l / 100;
    const q = L < .5 ? L * (1 + S) : L + S - L * S, p = 2 * L - q, f = t=>{ t = (t + 1) % 1; return t < 1/6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2/3 ? p + (q - p) * (2/3 - t) * 6 : p; };
    return '#' + [f(H2 + 1/3), f(H2), f(H2 - 1/3)].map(v=> Math.round(v * 255).toString(16).padStart(2, '0')).join(''); }));
  ok(a && b && Math.abs(((b.h - a.h + 360) % 360) - 12) < 1.5 && Math.abs((b.l - a.l) - 0.10) < 0.01, `2. the crit colour: +12° hue, +10% lightness (${a && a.h.toFixed(1)}→${b && b.h.toFixed(1)}, ${a && a.l.toFixed(2)}→${b && b.l.toFixed(2)})`);
  ok(X.dnLogNum(14, {mods:['fragile'], crit:true}) === '💥14🦴', '2. the log: 💥14🦴 (GD)');
  ok(X.dnLogNum(0, {armorBlocked:true, mods:['armor']}) === '0⛨', '2. the log: blocked to 0 reads 0⛨');
  ok(X.dnLogNum(5, {bulwark:2}) === '5⛨', "2. the log: a bramble's Bulwark is its ⛨");
  ok(X.dnLogNum(3, {crit:true, ambush:true}) === '3', '2. an Ambush hit gets no 💥 (as its floating number)');
  ok(X.dmgLogText(3, 'heat', {mods:['weak']}) === '3💢 🔥 fire damage', `2. the log keeps its words: "${X.dmgLogText(3, 'heat', {mods:['weak']})}"`);
  ok(X.dnText(2, 'physical') === '2', '2. the smack stamp: a bare 2');
}

// ---- 3. sources: no old "-N" damage float left, the hooks in place
{ const floats = app.split('\n').filter(l=> /(floatText|fl)\(/.test(l) && /(['`]\s*[-−]\s*['`]?\s*\+\s*ev\.dmg|[-−]\$\{ev\.dmg\})/.test(l));
  ok(!floats.length, `3. no floating "-N" damage number on ev.dmg is left (${floats.length}: ${floats.map(l=> l.trim().slice(0, 60)).join(' | ')})`);
  ['☠️ -', '🩸 -', "'🪞 -'", '`🜏-', "'🦠 '+ev.dmg", '`☣️ -', '`🪢 -', '`⚙️ -', '`🏹-', '`💧-', '`☄️-'].forEach(t=> ok(!app.includes(t), `3. the old float "${t}" is gone`));
  ok(/function dnFloat\(el, dmg, o\)/.test(app) && /dnFloat\(el, dmg, \{type: dmgType, crit, mods, blocked, fit: true\}\)/.test(app), '3. flashDmg and every other damage number share dnFloat');
  ok(/hq-big', fit:false\}\); \/\/ 2026-10-17: \+ the element's emoji; DN2/.test(app), "3. a bramble hit's number reads <type><number><mark> on its bar");
  ok(/\$\{ev\.crit && ev\.ambush\?' 💥 Crit!':''\}/.test(app), '3. the hit line drops "💥 Crit!" for the 💥 on its number (an Ambush keeps the words)');
  const fxf = R('bramblewood-fx-f.js'); ok(!/'🦑 −' \+ ev\.dmg/.test(fxf) && /window\.dnText\(ev\.dmg, 'physical'\)/.test(fxf), "3. the tentacle's stamp has no minus");
  const tpl = R('arena_template.html'); ok(/\.dmg-float \.df-ico\.df-crit-g\{font-size:calc\(\.78em \* var\(--dn-crit-scale, 1\.4\)\)/.test(tpl), "3. the crit glyph's size comes from --dn-crit-scale (DMG_CRIT_GLYPH_SCALE)"); }

console.log(fail ? `dn2-2026-10-22: ${fail} of ${checks} failed` : `dn2-2026-10-22: all ${checks} passed`);
process.exit(fail ? 1 : 0);
