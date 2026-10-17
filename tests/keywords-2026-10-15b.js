#!/usr/bin/env node
// 2026-10-15 (second list):
//  1. Skill reveal (user: "I don't want to show diurnal and tide till Map 1 and 2 respectively. Is there a way we can Hide their
//     skills as '?' until they become relevant for the first time?" + "I actually want all the fish to have tide and some of the
//     animals to have Diurnal. But I need them as '?' first."): SKILL_REVEAL hides a skill as "?" until the player enters Map N.
//  2. Map 0 (user: "Map 0 has no day/night system (only effects) - no howling. The effect is 'Mist' -> Shows a '?'."): Map 0 is
//     misty (no day and night), its field effects stay "?", and the "?" never says what the mist does.
//  3. "Evade -> Evasive."   4. "I don't like Hive Mind as a skill."   5. Fish carry Tide.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');

// ---- 1. the reveal helpers, run on their own (the block between the markers) with a fake localStorage and progress
const a = src.indexOf('[SKILL_REVEAL_BEGIN]'), b = src.indexOf('/* [SKILL_REVEAL_END] */');
ok(a > 0 && b > a, '1. the SKILL_REVEAL block is marked');
const block = src.slice(src.lastIndexOf('/*', a), b);
const store = {}; let completed = [];
const MAPNUM = {m1:0, mo:0, mtut:0, mf:1, mq:1, mb:2, mg:2, m2:3};
const ctx = {
  localStorage: {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }},
  loadConquestProgress: ()=> ({completed}), mapNumberOf: id=> (id in MAPNUM ? MAPNUM[id] : null),
  escapeAttr: s=> String(s).replace(/"/g, '&quot;'), adminModeEnabled: false, Date, JSON, Number, Object, Array, Set, String,
};
vm.createContext(ctx);
vm.runInContext(block + '\n;this.R = {SKILL_REVEAL, SKILL_Q_TIP, hiddenSkillSet, skillHiddenNow, hiddenSkillsOf, maskHiddenSkills, noteMapEnteredForReveal, skillQChipHTML, reset: ()=>{ skillRevealMemo = null; }};', ctx);
const R = ctx.R;
ok(JSON.stringify(R.SKILL_REVEAL) === JSON.stringify({diurnal:1, nocturnal:1, crepuscular:1, tide:2}), '1. the gates: Diurnal / Nocturnal / Crepuscular on Map 1, Tide on Map 2 (Swimmer retired 2026-10-15)');
const lark = {id:'lark', name:'Lark', effects:{diurnal:2, diurnalHp:1, flying:true}};
const fish = {id:'fish', name:'Fish', effects:{tide:true, quick:true}};
const swim = {id:'swim', name:'Swim', effects:{swimmer:'evade', swimmerGrant:{armor:1}}};
ok(['diurnal', 'nocturnal', 'crepuscular', 'tide'].every(k=> R.skillHiddenNow(k)), '1. a new player sees none of them'); // (Swimmer retired 2026-10-15)
{ const m = R.maskHiddenSkills(lark); ok(!('diurnal' in m.effects) && !('diurnalHp' in m.effects) && m.effects.flying === true && m._hiddenSkills === 1, '1. the display copy drops Diurnal and its second number, keeps Flying, counts one "?"');
  ok(lark.effects.diurnal === 2 && lark.effects.diurnalHp === 1, '1. ...and the real card (what the engine plays) is untouched'); }
{ const m = R.maskHiddenSkills({id:'tg', effects:{tide:true, tideGrant:{flood:{evasive:true}, ebb:{armor:2}}}}); ok(!('tide' in m.effects) && !('tideGrant' in m.effects), '1. Tide – {…}, {…} hides with its braces (2026-10-15)'); void swim; }
ok(R.maskHiddenSkills({id:'p', effects:{quick:true}}).effects.quick === true && !R.maskHiddenSkills({id:'p', effects:{quick:true}})._hiddenSkills, '1. a card with nothing hidden is unchanged');
ok(/class="skill-q"/.test(R.skillQChipHTML()) && /Something about this card you'll learn soon\./.test(R.skillQChipHTML()), '1. the "?" chip and its tip');
// entering Map 1 reveals the day skills, not the tide
R.noteMapEnteredForReveal('mf');
ok(!R.skillHiddenNow('diurnal') && !R.skillHiddenNow('nocturnal') && !R.skillHiddenNow('crepuscular'), '1. entering Map 1 reveals Diurnal, Nocturnal and Crepuscular');
ok(R.skillHiddenNow('tide'), '1. ...Tide stays "?" until Map 2');
ok(R.maskHiddenSkills(lark) === lark, '1. the lark reads in full now');
// a side map counts as its parent's number; going back to Map 0 never hides again
R.noteMapEnteredForReveal('m1'); R.reset(); ok(!R.skillHiddenNow('diurnal'), '1. once revealed, never hidden again (back on Map 0)');
// a cleared fight further on (progress from another device) reveals too, and the reveal is remembered
completed = ['mb:2-1']; R.reset(); ok(!R.skillHiddenNow('tide') && !R.skillHiddenNow('swimmer'), '1. a cleared Map 2 fight reveals Tide and Swimmer');
completed = []; R.reset(); ok(!R.skillHiddenNow('tide'), '1. ...and it stays revealed (stored per skill)');
ok(JSON.parse(store.bramblewood_skill_revealed_v1).keys.includes('tide'), '1. the reveal is saved');
// Admin Mode shows everything
for(const k of Object.keys(store)) delete store[k]; R.reset(); ok(R.skillHiddenNow('tide'), '1. (fresh profile again)');
ctx.adminModeEnabled = true; R.reset(); ok(!R.skillHiddenNow('tide') && !R.skillHiddenNow('diurnal') && R.maskHiddenSkills(fish) === fish, '1. Admin Mode shows every skill');
ctx.adminModeEnabled = false; R.reset();
// where the "?" is applied
ok(/function describeEffects\(def, liveCard\)\{\n  def = maskHiddenSkills\(def\);/.test(src), '1. card text lines go through the mask');
ok(/if\(def\._hiddenSkills\) lines\.push\(`<span class="skill-q-line">\$\{skillQChipHTML\(\)\}<\/span>`\);/.test(src), '1. ...and get one "?" line');
ok(/function abilityBadges\(d, bopts\)\{\n  d = maskHiddenSkills\(d\);/.test(src) && /if\(d\._hiddenSkills\) out\.push\(skillQChipHTML\(\)\);/.test(src), '1. the skill strip shows one "?" chip');
ok(/PASSIVE_DEFS\.filter\(p=> met\.has\(p\.key\) && p\.label && !p\.retired && !skillHiddenNow\(p\.key\)\)/.test(src), '1. the Skills codex leaves hidden skills out');
ok(/if\(hid\) return open \? `<span class="sbm-chip" title="\$\{escapeAttr\(SKILL_Q_TIP\)\}">\?<\/span>`/.test(src), '1. Skills along the road: a bare "?"');
ok(/Registry\.skills\(\)\.filter\(sd=> sd\.key !== 'leader' && !sd\.retired && !skillHiddenNow\(sd\.key\)\)/.test(src), '1. no coach tip for a hidden skill');
ok(/if\(skillHiddenNow\(k\)\) continue; \/\/ 2026-10-15: a keyword still hidden/.test(src), '1. no teaching card for a hidden keyword');
ok(/try\{ noteMapEnteredForReveal\(mapId\); \}catch\(e\)\{\}/.test(src), '1. starting a Conquest fight notes the map');
ok(/function tideTipLines\(k\)\{ return \(skillHiddenNow\('tide'\) \? TIDE_TIPS_HIDDEN : TIDE_TIPS\)\[k\]/.test(src) && /ev\.tide==='flow' \? '🌊 Flood: the tide goes in\.' : '🐚 Ebb: the tide goes out\.'/.test(src), '1. the tide pill and the battle log don\'t name Tide while it is hidden'); // 2026-10-15: the log says only the state now
ok(/phaseGrow: \(\(\)=>\{ const ph = ev\.phase, hid = /.test(src), '1. the battle log has a line for growing with the phase (it printed "phaseGrow" before), neutral while hidden');
ok(/\.skill-q\{display:inline-grid;/.test(tpl), '1. the "?" chip is styled');
// the engine still applies a hidden skill: a fish with Tide gets the Flow bonus
{ const defs = H.loadCardDefs(); const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open', rules:{permaTide:true}});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}, so = id=> id===1 ? 'A' : 'B';
  e.debugSpawnCard(P, so, 1, 'blind-cave-fish', 'left', {}, []); e.roundStart(P, 2, so, {}, []);
  const c = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right][0]; ok(c && e.isTide(c), '1/5. the engine plays the (hidden) Tide on a fish'); }

// ---- 2. Map 0: misty, no day and night, its effects stay "?", the "?" is neutral
ok(/const MISTY_MAPS = new Set\(\['m1', 'mo', 'mtut'\]\);/.test(src) /* 2026-10-16: and the Tutorial (0-T) */ && /if\(r\.misty == null && MISTY_MAPS\.has\(mid\) && node\) r\.misty = true;/.test(src), '2. Map 0 (the Outskirts and the Old Bramble) is misty');
ok(/if\(r\.misty\) r\.phase = 'off';/.test(src), '2. ...and the mist turns day and night off');
{ const e = E.makeSimEngine(H.loadCardDefs(), E.mulberry32(5), {recordEvents:true, battleMode:'open', rules:{misty:true, phase:'off'}});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}, so = id=> id===1 ? 'A' : 'B', ev = [];
  for(let r = 1; r <= 12; r++) e.roundStart(P, r, so, {}, ev);
  ok(e.getPhase() === null && !ev.some(x=> x.type === 'phase'), '2. no nightfall in the mist, so no howl (it plays on a phase event)'); }
ok(!/fieldPlainMap|matchFieldPlain/.test(src), '2. Map 0 no longer shows its field effects plainly');
ok(/function fieldRowsListHTML\(rows\)\{\n  return rows\.map\(row=>\{ const st = fieldRowState\(row\.key\);/.test(src), '2. the "?" shows wherever a row is not learned yet');
ok(/if\(m && m\.mode !== 'tutorial' && !matchFieldUnrevealed\(m\)\) rows\.forEach/.test(src) && /if\(matchFieldUnrevealed\(m\)\) return; \/\/ Map 0 teaches no field effect/.test(src), '2. Map 0 marks no field effect learned');
{ const tip = (/const MISTY_Q_TIP = "([^"]+)";/.exec(src) || [])[1] || '';
  ok(tip === "Something hangs in the air here. You'll learn more soon.", '2. the Mist "?" tip: ' + tip);
  ok(!/day|night|sun|moon/i.test(tip), '2. ...and it says nothing about day and night'); }
ok(/rows\[rows\.length - 1\]\.qTip = MISTY_Q_TIP;/.test(src) && /title="\$\{escapeAttr\(fieldRowQTip\(row\)\)\}">\?<\/span><\/li>`;/.test(src), '2. the "?" carries that tip');
ok(/if\(mid && typeof MISTY_MAPS !== 'undefined' && MISTY_MAPS\.has\(mid\)\) return;/.test(src), '2. no night crickets or dawn chorus on Map 0');

// ---- 3. Evade -> Evasive
ok(!/'Evade'/.test(src) && /\{value:'evade', label:'Evasive'\}/.test(src), '3. no "Evade" label left (the key stays evade)');

// ---- 4. Hive Mind retired from every list, still in the engine
ok(/\{key:'hiveMind', category:'passive', hidden:true, retired:true,/.test(src), '4. Hive Mind is hidden and retired');
ok(/hidden:p\.hidden, retired:p\.retired,/.test(src), '4. SKILL_DEFS carries retired');
ok(/Registry\.skills\(\)\.filter\(sd=> !sd\.retired\)\.forEach\(sd=> out\.push\(\{id:'skill:'/.test(src), '4. not in the Effects library');
ok(/SKILL_DEFS\.filter\(p=>p\.category==='evergreen' && !p\.retired\)/.test(src) && /SKILL_DEFS\.filter\(p=>p\.category!=='evergreen' && !p\.retired\)/.test(src), '4. not in the reference panels');
ok(/TESTKIT_SKILL_KINDS\.has\(sd\.kind\) && !sd\.retired/.test(src), '4. not in the Test Kit');
ok(/cdef\.effects && cdef\.effects\.hiveMind/.test(fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8')), '4. the engine still runs it');

// ---- 5. canonical cards
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8'));
const byId = Object.fromEntries(cards.map(c=> [c.id, c]));
['blind-cave-fish', 'mangrove-mudskipper', 'wrong-way-salmon'].forEach(id=> ok(byId[id] && byId[id].effects && byId[id].effects.tide === true, `5. ${id} has Tide`));
ok(!cards.some(c=> c.effects && c.effects.hiveMind), '4. no canonical card has Hive Mind');

console.log(`keywords-2026-10-15b: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
