#!/usr/bin/env node
// 2026-10-23 (package SX). The owner's answers of 10-23 00:10:
//   #95: "Damage affected by target (like armor) has a unique sound effect. E.g. a armor 'ting' sound. If there's a source sfx, do
//        that AND the target affect sfx."
//   DN2-4: "Maybe poison turns a little less bluer than it would do, and abit brighter instead."
//   H2: "Battle XP, Materia XP, Battle XP OR Materia XP. But if you use Battle XP for the 3rd section, there is a 25% inefficiency."
//   I2: "Template change" (number-aware translation templates).
// Covers: 1. each damage mark picks its own SoundKit cue (built from tone / sweep / fnoise, delayed after the source's), dnFloat plays
// it, the SFX volume gates it, armorBadgeGlow no longer konks on top; 2. poison's crit shift is its own (+5°, +16%), the rest keep
// +12° / +10%; 3. the 3-part Hero XP maths, run on the real arena_app.js functions, and the old-save mapping; 4. the numbered texts
// are TX templates, every old numbered row of every pack still translates to what it said, the tools see the templates.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const grabConst = k=>{ const m = app.match(new RegExp('^const ' + k + ' = [^\\n]*$', 'm')); return m ? m[0] : ''; };
const grabFn = k=>{ const i = app.indexOf('\nfunction ' + k + '('); if(i < 0) return ''; const k1 = app.indexOf('\n', i + 1), line = app.slice(i + 1, k1);
  if(/\}\s*(\/\/.*)?$/.test(line) && (line.match(/\{/g) || []).length === (line.match(/\}/g) || []).length) return line;
  return app.slice(i + 1, app.indexOf('\n}', i) + 2); };

// ---- 1. the damage-mark cues
{
  const src = [grabConst('DN_REDUCED'), grabConst('DN_MARK_REDUCED_ORDER'), grabFn('dnModKey'), grabFn('dnMarkSoundKey')].join('\n')
    + '\n' + (app.match(/^const DN_MARK_CUE = \{[^]*?\};$/m) || [''])[0] + '\nthis.X = {dnMarkSoundKey, DN_MARK_CUE};';
  const c = {}; try{ vm.runInNewContext(src, c); }catch(e){ ok(false, '1. the mark helpers run: ' + e.message); }
  const X = c.X;
  if(X){
    const K = (mods, blocked, dmg)=> X.dnMarkSoundKey(mods, blocked, dmg);
    ok(K(['armor'], false, 3) === 'armor', '1. Armor took some: the armour ting');
    ok(K(['armor'], true, 0) === 'blocked', '1. a full block to 0: the block ring');
    ok(K(['shield'], false, 2) === 'shield' && K(['sturdy'], false, 2) === 'sturdy' && K(['stone'], false, 2) === 'stone', '1. Shield, Sturdy, stone: each its own');
    ok(['resist', 'rage', 'scare'].every(k=> X.DN_MARK_CUE[K([k], false, 2)] === 'markResist'), '1. Resist / Rage / Scare: the muffle');
    ok(K(['fragile', 'armor'], false, 4) === 'fragile', '1. Fragile wins over a reduction (the 🦴 is the mark drawn)');
    ok(K(['weak'], false, 4) === 'weak' && K(['shocked'], false, 4) === 'shocked', '1. Weakness stings, Shock zaps');
    ok(K(['immune'], false, 0) === 'immune', '1. Immune: the whiff');
    ok(K(null, false, 5) === null && K([], false, 5) === null, '1. no mark: no cue');
    const cues = new Set(Object.values(X.DN_MARK_CUE));
    ok(cues.size >= 10, `1. at least 10 distinct cues (${cues.size})`);
    const bodies = [];
    cues.forEach(cue=>{
      const m = app.match(new RegExp('^    ' + cue + '\\(\\)\\{([^\\n]*)\\},$', 'm'));
      ok(m, `1. SoundKit.${cue} exists`);
      if(!m) return; bodies.push(m[1]);
      ok(/SX_MARK_DELAY/.test(m[1]) && /\b(tone|sweep|fnoise)\(/.test(m[1]) && !/createOscillator|new AudioContext|\.connect\(/.test(m[1]), `1. ${cue} is built from tone / sweep / fnoise, after SX_MARK_DELAY`);
    });
    ok(new Set(bodies).size === bodies.length, '1. no two cues are the same sound');
  }
  ok(/^  const SX_MARK_DELAY = 0\.0\d+;$/m.test(app), '1. the delay is one constant, under 0.1 s');
  const df = grabFn('dnFloat');
  ok(/dnMarkSound\(el, dnMarkSoundKey\(o\.mods, !!o\.blocked, dmg\)\)/.test(df), '1. every damage number (dnFloat) plays its mark cue');
  ok(/SoundKit\.at \? SoundKit\.at\(el/.test(grabFn('dnMarkSound')) && / < 45\) return/.test(grabFn('dnMarkSound')), '1. panned to the unit, one per kind per 45 ms');
  ok(/if\(!Array\.isArray\(ev\.mods\)\) try\{ SoundKit\.at/.test(grabFn('armorBadgeGlow')), '1. armorBadgeGlow konks only for replays without marks (no double metal)');
  // the volume: every primitive the cues use returns at sfxVolume 0
  ['function noise(', 'function fnoise(', 'function sweep('].forEach(f=>{ const i = app.indexOf(f); ok(i > 0 && /sfxVolume<=0\) return/.test(app.slice(i, i + 200)), `1. ${f.slice(9, -1)} is silent at SFX volume 0`); });
  ok(/const vol = volOverride!=null \? volOverride : sfxVolume;\s*if\(vol<=0\) return;/.test(app), '1. tone is silent at SFX volume 0');
}

// ---- 2. poison's crit colour
{
  const src = [grabConst('DMG_CRIT_LIGHTEN'), grabConst('DMG_CRIT_BY_CLASS'), grabFn('dnHsl'), grabFn('dnCritShift')].join('\n') + '\nthis.X = {dnHsl, dnCritShift, DMG_CRIT_BY_CLASS};';
  const c = {}; try{ vm.runInNewContext(src, c); }catch(e){ ok(false, '2. the crit helpers run: ' + e.message); }
  const X = c.X;
  if(X){
    const hsl = s=>{ const m = s.match(/hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)/); return m ? {h: +m[1], l: +m[3] / 100} : null; };
    const base = X.dnHsl('#7bd63c'), p = hsl(X.dnCritShift('#7bd63c', 'poison')), d = hsl(X.dnCritShift('#7bd63c'));
    ok(p && Math.abs(p.h - base.h - 5) < 0.2 && Math.abs(p.l - base.l - 0.16) < 0.002, `2. poison: +5° and 16% lighter (${base.h.toFixed(1)}→${p && p.h})`);
    ok(d && Math.abs(d.h - base.h - 12) < 0.2 && Math.abs(d.l - base.l - 0.10) < 0.002, '2. without the class: +12° and 10% lighter, as before');
    const ice = X.dnHsl('#7cc8ff'), ic = hsl(X.dnCritShift('#7cc8ff', 'cold'));
    ok(ic && Math.abs(ic.h - ice.h - 12) < 0.2, '2. ice keeps +12°');
    ok(Object.keys(X.DMG_CRIT_BY_CLASS).join() === 'poison', '2. only poison has its own shift');
  }
  ok(/dnCritShift\(g1 \|\| g2, cls\), g2: dnCritShift\(g2, cls\)/.test(grabFn('dnCritTint')), "2. the crit tint passes the number's class");
}

// ---- 3. the Hero XP bar
{
  const src = ['HERO_MAX_LEVEL', 'HERO_XP_EITHER_BATTLE'].map(grabConst).join('\n') + '\n'
    + ['heroXpToNext', 'heroLevelFromXp', 'heroXpSections', 'heroXpState', 'heroLevelOf', 'heroXpMigrate'].map(grabFn).join('\n')
    + '\nthis.X = {heroXpToNext, heroLevelFromXp, heroXpSections, heroXpState, heroLevelOf, heroXpMigrate, HERO_XP_EITHER_BATTLE};';
  const c = {}; try{ vm.runInNewContext(src, c); }catch(e){ ok(false, '3. the hero helpers run: ' + e.message); }
  const X = c.X;
  if(X){
    ok(X.HERO_XP_EITHER_BATTLE === 0.75, '3. Battle XP fills the third part at 75%');
    let sums = true; for(let L = 1; L < 100; L++){ const s = X.heroXpSections(L); if(s.battle + s.materia + s.either !== X.heroXpToNext(L) || s.battle < 1 || s.either < 1) sums = false; }
    ok(sums, '3. the three parts add up to the level (heroXpToNext), each at least 1');
    const s1 = X.heroXpSections(1);
    const h = (b, m, base)=> ({lvBase: base || 1, xpB: b, xpM: m, xpv: 2});
    ok(X.heroXpState(h(10000, 0)).level === 1, '3. Battle XP alone never levels up (the Materia part stays empty)');
    ok(X.heroXpState(h(0, 10000)).level === 1, '3. Materia XP alone never levels up (the Battle part stays empty)');
    ok(X.heroXpState(h(s1.battle, s1.materia + s1.either)).level === 2, '3. Battle part + Materia part + Materia in the third: level up');
    const needB = s1.battle + s1.either / 0.75;
    ok(X.heroXpState(h(Math.ceil(needB), s1.materia)).level === 2 && X.heroXpState(h(Math.ceil(needB) - 1, s1.materia)).level === 1,
      `3. the third part from Battle XP takes ${s1.either} / 0.75 = ${(s1.either / 0.75).toFixed(2)} (the 25% inefficiency)`);
    const st = X.heroXpState(h(s1.battle + 4, 1));
    ok(st.fill.battle === s1.battle && st.fill.materia === 1 && Math.abs(st.fill.eitherB - Math.min(s1.either, 3)) < 1e-9 && st.fill.eitherM === 0, `3. a partial bar: the overflow of Battle fills the third at 75% (${JSON.stringify(st.fill)})`);
    const st2 = X.heroXpState(h(s1.battle, s1.materia + 2));
    ok(st2.fill.eitherM === Math.min(2, s1.either) && st2.fill.eitherB === 0, '3. Materia overflow fills the third 1:1');
    const st3 = X.heroXpState(h(5000, s1.materia));
    ok(st3.level === 2 || st3.wait.battle > 0, '3. XP past a full part waits for the next level (none lost)');
    // more of both levels further; a level reached never drops when more XP comes in
    let mono = true, prev = 0; for(let k = 0; k < 400; k++){ const L = X.heroXpState(h(k * 13, k * 7)).level; if(L < prev) mono = false; prev = L; }
    ok(mono && prev > 10, `3. levels only go up as XP comes in (Lv ${prev} at 5,200 Battle + 2,800 Materia)`);
    // the old saves
    const old = {xp: 600, alloc: {atk: 0, hp: 0, speed: 0}};
    const was = X.heroLevelFromXp(600); X.heroXpMigrate(old);
    ok(old.xpv === 2 && old.lvBase === was.level && old.xpB === was.into && old.xpM === 0 && old.xp === 600, `3. an old save keeps its level (${was.level}) and its XP into it as Battle XP; h.xp untouched`);
    ok(X.heroLevelOf(old).level === was.level, '3. the migrated hero reads the same level');
    const again = JSON.stringify(old); X.heroXpMigrate(old); ok(JSON.stringify(old) === again, '3. migrating twice changes nothing');
  }
  ok(/function heroGainXp\(n, why, src\)/.test(app) && /'victory' : 'experience', 'battle'\)/.test(app) && /Materia`, 'materia'\)/.test(app), '3. battles give Battle XP, crafting gives Materia XP');
  ok(!/heroLevelFromXp\((?:h|myHero|hero)\.xp\)/.test(app), '3. nothing reads the level from the old single pool any more');
  const bar = grabFn('heroXpBarHTML');
  ok(/hx-\$\{k\}/.test(bar) && /seg\('battle'/.test(bar) && /seg\('materia'/.test(bar) && /seg\('either'/.test(bar) && /hx-fm/.test(bar) && /hx-fb/.test(bar), '3. the bar draws three parts, the third split Materia / Battle');
  ok(/title="\$\{escapeAttr\(rule\)\}"/.test(bar) && /TX\('ui\.sx-xp-rule'/.test(bar), '3. the rule is the bar\'s tooltip');
  const css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
  ok(/\.hero-xp3\{/.test(css) && /\.hero-xp3 \.hx-either \.hx-fb\{background:repeating-linear-gradient/.test(css), '3. its CSS (Battle\'s share of the third striped)');
}

// ---- 4. I2: numbered texts as templates
{
  const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
  const {createTranslator, localNum} = require(path.join(ROOT, 'bramblewood-i18n.js'));
  let chk = 0, out = ''; try{ out = cp.execFileSync('python3', [path.join(ROOT, 'tools/text/templatize_numbers.py'), '--check'], {encoding: 'utf8'}); }catch(e){ chk = 1; out = String(e.stdout || ''); }
  ok(chk === 0, '4. tools/text/templatize_numbers.py --check: every listed literal is a template, every pack has it\n' + out.split('\n').slice(-4).join('\n'));
  // the SPEC, read from the tool
  const spec = [], tool = fs.readFileSync(path.join(ROOT, 'tools/text/templatize_numbers.py'), 'utf8');
  for(const m of tool.matchAll(/^\s+\('(ui\.i2-[\w-]+)', '([^']+)', \[([^\]]*)\]\),$/gm)) spec.push({key: m[1], tpl: m[2], lits: [...m[3].matchAll(/'([^']+)'/g)].map(x=> x[1])});
  ok(spec.length >= 15, `4. the tool's list (${spec.length} templates)`);
  const lits = spec.reduce((t, s)=> t + s.lits.length, 0);
  spec.forEach(s=>{
    ok(TEXT[s.key] === s.tpl, `4. ${s.key} is "${s.tpl}" in the TEXT table`);
    ok(new RegExp("TX\\('" + s.key.replace(/[.-]/g, '\\$&') + "', \\{n: ").test(app), `4. the code calls TX('${s.key}', {n: ...})`);
    s.lits.forEach(l=> ok(!app.includes("'" + l + "'"), `4. "${l}" is no longer a literal`));
  });
  // every pack: the old numbered rows (from git's copy before SX) still translate the same, through the template, with the locale
  const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const df = s=> String(s).replace(/(?<=\d)[ .,  '](?=\d)/g, '');
  let before = null; try{ before = cp.execFileSync('git', ['-C', ROOT, 'rev-parse', '--verify', '-q', '76a3249c'], {encoding: 'utf8'}).trim(); }catch(e){}
  let rows = 0, same = 0;
  CODES.forEach(code=>{
    const pack = Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/ui', code + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')));
    const tr = createTranslator(pack, null, {locale: code});
    spec.forEach(s=>{
      ok(typeof pack[s.tpl] === 'string', `4. lang/${code}.json has "${s.tpl}"`);
      s.lits.forEach(l=>{ const t = tr(l); ok(t != null, `4. ${code}: "${l}" matches its template (${t})`); });
    });
    if(before){
      const old = {};
      ['lang/ui/' + code + '.json', 'lang/' + code + '.json'].forEach(f=>{ try{ Object.assign(old, JSON.parse(cp.execFileSync('git', ['-C', ROOT, 'show', before + ':' + f], {encoding: 'utf8', maxBuffer: 64e6}))); }catch(e){} });
      spec.forEach(s=> s.lits.forEach(l=>{ if(typeof old[l] !== 'string') return; rows++; const t = tr(l); if(t && df(t) === df(old[l])) same++; else ok(false, `4. ${code}: "${l}" was "${old[l]}", now "${t}"`); }));
    }
  });
  ok(!before || (rows > 300 && rows === same), `4. every old numbered row still says the same (${same}/${rows} rows; numbers now in the language's own format)`);
  ok(localNum('4,000', 'de') === '4.000' && localNum('2.5', 'fr') === '2,5' && localNum('12', 'de') === '12' && localNum('4,000', null) === '4,000', '4. the translator writes a number the language\'s way, only with a locale');
  const fr = createTranslator(JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/fr.json'), 'utf8')), null, {locale: 'fr'});
  ok(/^Possédez 300 cartes\.?$|300/.test(fr('Own 300 cards.') || ''), `4. a number no row ever had translates too: "Own 300 cards." → "${fr('Own 300 cards.')}"`);
  // the tools
  const py = cp.spawnSync('python3', ['-c', `import sys; sys.path.insert(0, 'tools/text'); import textlib as T
N = T.NumberTemplates(['Own {n} cards.', 'Use {v1} 🎟️ PvP tickets'])
print(N.match('Own 300 cards.')[1]['n'], N.match('Use 7 🎟️ PvP tickets')[0], N.match('Own many cards.'))
sys.path.insert(0, 'tools'); import i18n_ui
print(i18n_ui.needed(['Own 300 cards.', 'Own lots'], {'Own {n} cards.': 'x'}))`], {cwd: ROOT, encoding: 'utf8'});
  ok(py.status === 0 && /^300 Use \{v1\} 🎟️ PvP tickets None\n\['Own lots'\]$/m.test(py.stdout.trim()), `4. textlib.NumberTemplates and i18n_ui.needed see number templates (${(py.stdout + py.stderr).trim().slice(0, 300)})`);
  const kf = fs.readFileSync(path.join(ROOT, 'tools/text/keyify.py'), 'utf8');
  ok(/num_tpl = T\.NumberTemplates\(table\.values\(\)\)/.test(kf) && /k not in used and k not in before/.test(kf), '4. keyify reuses a number template, and drops only keys it made itself');
  console.log(`  I2: ${spec.length} templates replace ${lits} numbered literals`);
}
ok(fs.existsSync(path.join(ROOT, 'tools/i18n_2026_10_23_sx.py')), 'tools/i18n_2026_10_23_sx.py');
console.log(`sx-2026-10-23: ${n - fail}/${n} passed` + (fail ? `, ${fail} failure(s)` : ''));
process.exit(fail ? 1 : 0);
