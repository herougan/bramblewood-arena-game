#!/usr/bin/env node
// 2026-10-19 (package U3, the owner's UI notes 13:41-13:45):
//   1. "the home button shouldnt be on the btm bar but as an icon beside the fullscreen button and arena button" -> the 🌰 Home is the
//      top-right cluster's first icon (#homeNavBtnPlay), none in the floating tab bar.
//   2. "the map tab on the top is okay. Just that there was a empty margin above ... can be just number + emoji" -> the phone strip is
//      back on the cluster's line, its chips a number (.cmi-num), an emoji and a ✓ (.cmi-tick); the name in the title / aria-label.
//   3. "The tentacle smack should be a property of the Raid's bramble. Which should be appropriately named and art'd." -> Kraken's Reef
//      (RAID_BRAMBLES / raidBrambleOf), its portrait, its abilities' lines, the tentacle out of its tile; the smack's mechanics unchanged.
//   4. "place the rows slightly closer together - maybe 3% closer? then zoom in abit more?" -> the raid rows' CSS (u3Styles).
//   5. "The turn metre ... should be faded out ... It shouldn't say 2/20, but just Turn 2." -> raidClockPillHTML + u3TurnFlash.
//   6. (13:45) "It comes out at where the health bar% is currently at. We could do that for all games." -> hqFillEndX, u3ClampOnBar.
// Static and function checks; the browser half is tests/e2e/u3_2026_10_19.py (Playwright, 390 / 430 / 1366).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('../tools/lib_bramble.js');
const {TEXT, TX} = require('../bramblewood-texts.js');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
const asm = fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8');
const raids = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')), goliath = raids[0];
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const escapeHtml = s=> (s==null || s===false ? '' : String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const u3 = (tpl.match(/<style id="u3Styles">([^]*?)<\/style>/) || [])[1] || '';
ok(u3.length > 0, 'the U3 style block is there');

// ---- 1. Home in the cluster
const rp = B.grab('renderPlay');
ok(!/playHomeTabBtn|play-home-tab/.test(rp) && !/play-home-tab/.test(tpl), '1. no Home in the floating tab bar');
ok(/<div class="play-subtabs-actions">[^]*?<button class="home-nav-btn" id="homeNavBtnPlay"[^>]*aria-label="\$\{escapeAttr\(TX\('ui\.back-to-home'\)\)\}"><span class="tab-emoji" aria-hidden="true">🌰<\/span>/.test(rp), '1. the cluster starts with the 🌰 Home (TX aria-label)');
ok(!/#homeNavBtnPlay\{display:none/.test(tpl), '1. nothing hides it');
ok(/class="conquest-home-btn" id="conquestHomeBtn"[^>]*><span class="tab-emoji" aria-hidden="true">🌰<\/span>/.test(src), '1. the full-screen map\'s Home is the acorn too');

// ---- 2. the phone map strip
const rc = B.grab('renderConquestSubTab');
ok(/<div class="cmi-num" aria-hidden="true">/.test(rc) && /<i class="cmi-tick" aria-hidden="true">✓<\/i>/.test(rc), '2. a chip has its number and, once cleared, a ✓');
ok(/TX\('ui\.u3-map-chip-tip-cleared', \{n: num, name: map\.name\}\)/.test(rc) && /title="\$\{escapeAttr\(tip\)\}" aria-label="\$\{escapeAttr\(tip\)\}"/.test(rc), '2. its name is in the title and aria-label');
ok(/u3FitMapStrip\(\); u3WireChipPeek\(listEl\)/.test(rc), '2. the strip is fitted beside the cluster and its chips peek on a hold');
ok(/@media \(max-width:820px\)\{\s*body\.conquest-full \.conquest-maps\{padding:12px 8px 4px !important;/.test(u3) && /body\.conquest-full \.conquest-map-item \.cmi-body\{display:none;\}/.test(u3), '2. phones: the strip on the top line, chips without the name block');
ok(!/#conquestMapList\{display:none !important;\}/.test(tpl.match(/<style id="nvStyles">([^]*?)<\/style>/)[1]), '2. NV\'s phone-only "no strip" is gone');
ok(/'toast\.the-world-opens-up-phone'/.test(src) && /along the top/.test(TEXT['toast.the-world-opens-up-phone']) && /on the left/.test(TEXT['toast.the-world-opens-up-every-map']), '2. the world toast: phones "along the top", desktop "on the left"');
{ // the hold logic: a 450 ms timer, cancelled past 10 px, the click after a hold dropped
  const w = B.grab('u3WireChipPeek');
  ok(/}, 450\);/.test(w) && /Math\.hypot\(e\.clientX - x0, e\.clientY - y0\) > 10/.test(w) && /if\(held\)\{ held = false; e\.stopPropagation\(\); e\.preventDefault\(\); \}/.test(w), '2. touch-and-hold: 450 ms, a move cancels it, its click is dropped'); }

// ---- 3. the raid's bramble
const R = new Function('TX', 'escapeHtml', B.grab('RAID_BRAMBLES') + '\n' + B.grab('raidBrambleOf') + '\n' + B.grab('raidBrambleAbilityLines') + '\n' + B.grab('raidBrambleAbsHTML') + '\nreturn {raidBrambleOf, raidBrambleAbilityLines, raidBrambleAbsHTML};')(TX, escapeHtml);
{ const b = R.raidBrambleOf(goliath);
  ok(b && b.name === "Kraken's Reef" && b.icon === '🪸' && b.art === 'art/raids/krakens-reef.svg', `3. the Goliath's bramble is Kraken's Reef with its portrait (${JSON.stringify(b)})`);
  ok(R.raidBrambleOf({id:'nobody'}) === null, '3. a raid without one keeps the part\'s name');
  ok(R.raidBrambleOf(Object.assign({}, goliath, {bramble:{name:'The Drowned Maw'}})).name === 'The Drowned Maw', '3. a published raid can name its own (def.bramble)');
  const lines = R.raidBrambleAbilityLines([{name:'Tentacle Smack', pattern:'column', dmg:6, every:3}, {name:'Tail Sweep', pattern:'frontRow', dmg:3, every:2}]);
  ok(lines.length === 2 && /^Tentacle Smack: every 3 turns a tentacle lashes out of the reef at one of your columns or rows \(a column first, then a row\), 6 damage to each unit there\./.test(lines[0]) && /glows red the turn before/.test(lines[0]) && /your bramble takes the hit/.test(lines[0]), `3. the smack's line: when and what (${lines[0]})`);
  ok(/^Tail Sweep: every 2 turns the reef sweeps your front row, 3 damage to each unit there\.$/.test(lines[1]), '3. the Tail\'s sweep too');
  ok((goliath.parts || []).filter(p=> p.trench && (p.trench.attacks || []).some(a=> a.name === 'Tentacle Smack' && a.pattern === 'column' && a.dmg === 6 && a.every === 3)).length === 3, '3. the smack itself is unchanged in the raid data (6 damage every 3 turns on both Tentacles and the Core)'); }
ok(/const bramble = typeof raidBrambleOf === 'function' \? raidBrambleOf\(def(?:, partId)?\) : null;/.test(B.grab('buildRaidFullFight')) && /health: cfg\.castleHp, effects:\{\}\},\s*bramble \? \{name: bramble\.name, icon: bramble\.icon, art: bramble\.art \|\| undefined, raidBramble: true, partName: f\.part\.name\} : \{\}\)/.test(B.grab('buildRaidFullFight')),
  '3. the boss castle takes the name and portrait only (same Health, no effects): the raid\'s balance is unchanged');
ok(/def\.raidBramble && m\.raidFull \? raidBrambleAbsHTML\(raidBrambleAbilityLines\(m\.raidAttacks\)\)/.test(B.grab('castleHoverHTML')), '3. the bramble\'s info panel (hover / hold) lists its abilities');
ok(/bramble: vsBramble \? \{name: vsBramble\.name, icon: vsBramble\.icon, lines: raidBrambleAbilityLines\(cfg\.attacks\)\} : null/.test(B.grab('startRaidFullBattle')) && /TX\('ui\.u3-bramble-vs', \{name: p\.bramble\.name\}\)/.test(B.grab('showVsScreen')), '3. the VS screen\'s boss card names the bramble and lists its smack');
ok(/TX\('ui\.u3-bramble-rules', \{name: br\.name\}\)/.test(src), '3. the raid\'s rules name it and list its attacks');
ok(/const origin = \(mineSide\('A', env\) \? document\.querySelector\('\.top-play-row \[data-hq="B"\]'\) : null\) \|\| document\.querySelector\('\[data-hq="B"\]'\);/.test(fxf) && /\{host:env\.battlefield, origin\}\);/.test(fxf) && /\{host:env\.battlefield, origin, horizontal:true\}\); return;/.test(fxf), '3. the smack FX starts from the bramble\'s tile');
ok(/if\(!horiz && org\)\{[^]*?B = \{x:org\.left \+ org\.width\*\.62, y:org\.top \+ org\.height\*\.62\};/.test(fxf) && /g\.set\(body, \{scale:\.06, opacity:0, svgOrigin:origin\}\);/.test(fxf), '3. a column smack grows out of the bramble to the column, and draws back into it');
ok(/const TENT = \{slam:220, squash:110, back:350\};/.test(fxf), '3. BU\'s timings kept');
{ const svg = fs.readFileSync(path.join(ROOT, 'art', 'raids', 'krakens-reef.svg'), 'utf8');
  ok(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 48 48"[^>]*shape-rendering="crispEdges">/.test(svg) && /<\/svg>\s*$/.test(svg) && (svg.match(/<rect /g) || []).length > 300, '3. the placeholder portrait is a crisp 48x48 pixel SVG');
  ok(/art:'\(art\/raids\/\[a-z0-9_-\]\+\\\.\(\?:svg\|png\)\)'/.test(asm), '3. the build ships it as a hashed asset'); }
{ const brief = fs.readFileSync(path.join(ROOT, 'docs', 'art', 'raid-bramble-art-brief.md'), 'utf8'), prompt = (brief.match(/```(?:text)?\n([^]*?)```/) || [])[1] || '';
  ok(prompt.length > 200 && /background/i.test(prompt), '3. the NightCafe prompt is written, with a background');
  ok(!/no clothes|spiked|studded|monitor|sperm|corpse|sword|spear|axe|blade|weapon|dagger|trident|cannon|\bgun/i.test(prompt), '3. the prompt avoids the banned words'); }

// ---- 4. the raid rows
ok(/#appWrap\.in-match\.mb2-raid #battlefieldInner > #rowEnemy, #appWrap\.in-match\.mb2-raid #battlefieldInner > #rowMine\{height:calc\(var\(--match-card-h\) \+ 9px\) !important; padding-top:4\.5px !important; padding-bottom:4\.5px !important;\}/.test(u3), '4. the front rows: 3 px less (was +12)');
ok(/\.board-row\.reserve-row\.raid-rows\{height:calc\(var\(--match-card-h\) \* \.966 \+ 6px\) !important; margin:calc\(1\.5px \+ var\(--mb2-rgap, 0px\)\) 0 !important;\}/.test(u3), '4. the back rows: 3 px less (was +8 and 2 px margins)');
ok(/raid-rows:last-child\{margin-bottom:-3px !important;\}/.test(u3) && /#appWrap\.in-match\.mb2-raid #view-play > \.battlefield\{padding-bottom:8px !important; justify-content:flex-end !important;\}/.test(u3), '4. the bottom row\'s cards meet the board\'s edge (the HP ribbon)');

// ---- 5. the turn meter
{ const P = new Function('TX', 'escapeHtml', B.grab('raidClockPillHTML') + '\nreturn raidClockPillHTML;')(TX, escapeHtml);
  const h = P({raidRoundCap:20, round:2}), last = P({raidRoundCap:20, round:20});
  ok(/>Turn 2<\/span>$/.test(h) && !/\//.test(h.replace(/<\/span>/g, '')) && /aria-hidden="true"/.test(h), `5. the pill says "Turn 2", no "/ 20" (${h})`);
  ok(/is-last/.test(last) && />Turn 20</.test(last), '5. the last turn keeps its class'); }
ok(/\.bf-hp \.bf-turn-pill\.raid-clock, \.bf-hp \.bf-turn-pill\.raid-clock\.is-last\{opacity:0; pointer-events:none; animation:none;\}/.test(u3), '5. it rests faded out and takes no clicks');
{ const f = B.grab('u3TurnFlash');
  ok(/const U3_TURN_HOLD_MS = 1200;/.test(src) && /if\(m\._u3TurnSeen === n\) return;/.test(f) && /const roll = from != null && from !== n && !reducedMotion\(\);/.test(f), '5. once a turn, a roll from the old turn (none under reduced motion), a 1.2 s hold');
  ok(/warn = left > 3 \? '' : left <= 1 \? TX\('ui\.u3-last-turn'\) : TX\('ui\.u3-turns-left', \{n: left\}\);/.test(f), '5. the last 3 turns: "3 turns left", "2 turns left", "Last turn!"');
  ok(/if\(!m\.over && m\.raidRoundCap\) try\{ u3TurnFlash\(m\); \}catch\(e\)\{\}/.test(src) && /setTimeout\(\(\)=>\{ try\{ u3TurnFlash\(m0\); \}catch\(e\)\{\} \}, 600\);/.test(src), '5. it ticks as your turn opens, and for Turn 1 as the raid fight opens'); }

// ---- 6. castle numbers at the HP fill's end
{ const F = new Function(B.grab('hqFillEndX') + '\n' + B.grab('u3ClampOnBar') + '\nreturn {hqFillEndX, u3ClampOnBar};')();
  const rect = (l, w)=> ({left:l, right:l + w, width:w, top:0, bottom:10, height:10});
  const fill = (pct, fr)=> ({style:{width: pct + '%'}, getClientRects: ()=> [1], getBoundingClientRect: ()=> fr});
  const rib = fl=> ({querySelector: ()=> fl});
  const bar = rect(100, 200);
  ok(F.hqFillEndX(rib(fill(25, rect(100, 50))), bar) === 150, '6. a 25% bar: the number at 25% along it');
  ok(F.hqFillEndX(rib(fill(25, rect(250, 50))), bar) === 250, '6. a fill drawn from the right: mirrored');
  ok(F.hqFillEndX(rib(null), bar) === 200, '6. no fill: the bar\'s centre');
  global.innerWidth = 400; global.document = {documentElement:{clientWidth:400}};
  const anchor = x=> ({getBoundingClientRect: ()=> ({left:x})}), num = {offsetWidth:60};
  ok(F.u3ClampOnBar(anchor(5), num, 1) === 31 && F.u3ClampOnBar(anchor(398), num, 1) === -34 && F.u3ClampOnBar(anchor(200), num, 1.45) === 0, '6. kept on screen at either end (a 6 px margin), not moved in the middle'); }
ok(/const x = hqFillEndX\(rib, bar\), y = bar\.top \+ bar\.height\/2;/.test(B.grab('hqRibbonFloatAnchor')), '6. every castle number goes through it (hqRibbonFloatAnchor: fights, raids, the Tower, dungeons)');

// ---- texts and packs
const KEYS = ['ui.u3-map-chip-tip', 'ui.u3-map-chip-tip-cleared', 'ui.u3-map-chip-tip-locked', 'ui.u3-map-chip-world', 'ui.u3-turn', 'ui.u3-turns-left', 'ui.u3-last-turn', 'ui.u3-goliath-bramble',
  'ui.u3-bramble-kicker', 'ui.u3-bramble-vs', 'ui.u3-bramble-rules', 'ui.u3-smack-desc', 'ui.u3-sweep-desc', 'toast.the-world-opens-up-phone'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`'${k}'`), `TX ${k} is in the table and used`));
for(const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.map(k=> TEXT[k].replace(/^[^\p{L}{]+/u, '')).filter(en=> !(typeof pack[en] === 'string' && pack[en]));
  ok(!miss.length, `lang/${c}.json translates the U3 texts (${miss.join(' | ')})`);
}
ok(/^## 2026-10-19 \(package U3: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');
console.log(fail ? `u3-2026-10-19: ${fail} of ${n} failed` : `u3-2026-10-19: all ${n} passed`);
process.exit(fail ? 1 : 0);
