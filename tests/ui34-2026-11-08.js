#!/usr/bin/env node
// 2026-11-08 (package UI34, owner 23:49: "Add more skill recommendations to each map card window. Esp those that counter that map's cards!"):
// 1 canonical/skill-counters.json (every skill classified, every counter a real skill, reasons, the owner's examples), 2 a few table claims proven in the
// engine (Flying / Reach, Evasive / True Strike and Fencing, Armor / Pierce, Stampede and Siege past a wall), 3 the Map cards window's Counters group (pure
// ranking on fake data, no repeats, up to 8), 4 the blue group's top-up to 15, 5 texts in 12 packs, 6 build, docs, tests. Browser: tests/e2e/ui34_2026_11_08.py.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js'), asm = rd('assemble_arena.py'), tpl = rd('arena_template.html');
const fn = (src, name)=>{ const m = src.match(new RegExp('function ' + name + '\\([\\s\\S]*?\\n\\}\\n')); if(!m) throw new Error('no function ' + name); return m[0]; };

// ================= 1. the table =================
const T = J('canonical/skill-counters.json'), DL = J('canonical/skill-delivery.json').delivery, SK = Object.keys(DL).filter(k=> !k.startsWith('action:'));
const valid = new Set(SK), STATUS = new Set(Object.keys(E.ENG36_STATUS));
ok(T.version === 1 && T.counters && T.applies && T.statuses && Array.isArray(T.noCounter), 'the table has counters, applies, statuses and noCounter');
{ const bad = []; Object.keys(T.counters).forEach(k=> { if(!valid.has(k)) bad.push('threat ' + k); (T.counters[k].counters || []).forEach(c=> { if(!valid.has(c.skill)) bad.push(k + ' -> ' + c.skill); }); });
  Object.keys(T.statuses).forEach(s=> (T.statuses[s].counters || []).forEach(c=> { if(!valid.has(c.skill)) bad.push('status ' + s + ' -> ' + c.skill); }));
  ok(!bad.length, 'every threat and every counter is a skill of canonical/skill-delivery.json ' + bad.join(', ')); }
ok(Object.values(T.applies).every(s=> STATUS.has(s) && T.statuses[s]) && Object.keys(T.applies).every(k=> valid.has(k)), 'applies: a real skill -> a status of ENG36_STATUS that has a statuses entry');
ok(Object.keys(T.statuses).every(s=> STATUS.has(s)), 'statuses: only ids of ENG36_STATUS');
{ const nc = new Set(T.noCounter), unclassified = SK.filter(k=> !T.counters[k] && !T.applies[k] && !nc.has(k)), both = T.noCounter.filter(k=> T.counters[k] || T.applies[k]), ghost = T.noCounter.filter(k=> !valid.has(k));
  ok(!unclassified.length, 'every skill is classified (counters, applies or noCounter); unclassified: ' + unclassified.slice(0, 12).join(', '));
  ok(!both.length && !ghost.length, 'noCounter holds no threat and no unknown key ' + both.concat(ghost).join(', ')); }
{ const all = [].concat(...Object.values(T.counters).map(e=> e.counters), ...Object.values(T.statuses).map(e=> e.counters));
  ok(all.every(c=> typeof c.why === 'string' && c.why.length >= 8 && c.why.length <= 150 && !/\n/.test(c.why)), 'every counter has a one-line reason (8 to 150 characters)');
  ok(all.every(c=> c.uncertain === undefined || c.uncertain === true), 'uncertain is true or absent');
  ok(all.filter(c=> c.uncertain).length >= 10 && all.filter(c=> c.uncertain).length < all.length / 2, `uncertain entries are marked (${all.filter(c=> c.uncertain).length} of ${all.length})`);
  ok(Object.values(T.counters).every(e=> typeof e.source === 'string' && e.source.length > 3), 'every threat names its source (engine function or skill text)');
  ok(Object.values(T.counters).every(e=> new Set(e.counters.map(c=> c.skill)).size === e.counters.length), 'no counter twice under one threat'); }
// the owner's examples
{ const has = (k, s)=> (T.counters[k] && T.counters[k].counters.some(c=> c.skill === s)) || ((T.statuses[T.applies[k]] || {counters: []}).counters.some(c=> c.skill === s));
  ok(['reach', 'boomerang', 'arrow', 'antiAirOnly', 'trueStrike'].every(s=> has('flying', s)), 'Flying: Reach, Boomerang, the arrows, Anti-air, True Strike');
  ok(has('poison', 'cure') && has('poison', 'regen') && has('poison', 'immunity') && T.applies.poison === 'venom', 'Venom (Venomous): Cure, Regeneration, Immunity, and its status Resist / Immune (applies -> venom)');
  ok(['trueStrike', 'fencing', 'expose', 'fireball', 'earthquake', 'nova'].every(s=> has('evasive', s)), 'Evasive: True Strike, Fencing, Expose and the area skills');
  ok(['volley', 'twinShot', 'earthquake', 'nova', 'nullify'].every(s=> has('thanatosis', s)), 'Thanatosis: the every-unit and random-target skills (and Nullify)');
  ok(['siege', 'pulverise', 'overwhelm', 'breach', 'puncture', 'stealth'].every(s=> has('bulwark', s)), 'Bulwark: Siege, Pulverise, Stampede, Breach, Puncture, Stealth');
  ok(T.applies.strangle === 'strangle' && T.applies.constrict === 'constrict' && T.statuses.strangle && T.statuses.constrict, 'Strangle / Constrict: answered by their status Resist / Immune');
  ok(/Shots hit the unit facing/.test(T.counters.bulwark.note || ''), 'Bulwark notes that shots do not go over a wall (they hit the unit facing them)'); }

// ================= 2. claims proven in the engine =================
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name: id, attack: 0, health: 500, wait: 0, cost: 0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'u34-plain': U('u34-plain', {}, {attack: 1}), 'u34-reach': U('u34-reach', {reach: true}, {attack: 1}), 'u34-fly': U('u34-fly', {flying: true}), 'u34-evasive': U('u34-evasive', {evasive: true}),
  'u34-true': U('u34-true', {trueStrike: true}, {attack: 1}), 'u34-fence': U('u34-fence', {fencing: true}, {attack: 1}), 'u34-armor': U('u34-armor', {armor: 3}), 'u34-pierce': U('u34-pierce', {pierce: 3}, {attack: 5}), 'u34-hit5': U('u34-hit5', {}, {attack: 5}),
  'u34-siege': U('u34-siege', {siege: 2}, {attack: 3}), 'u34-hit3': U('u34-hit3', {}, {attack: 3}), 'u34-wall': U('u34-wall', {}, {health: 50, archetypes: ['Structure']}),
  'u34-stamp': U('u34-stamp', {overwhelm: true}, {attack: 9}), 'u34-weak': U('u34-weak', {}, {health: 2}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents: true, battleMode: 'open'}); return {e, P: {1: e.newPlayer(1, {}, {health: 200}), 2: e.newPlayer(2, {}, {health: 200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []); const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); return c; }
const swing = (e, P, c)=>{ const ev = []; e.debugAttack(P, so, c.uid, {}, ev); return ev; };
function landRate(attId, defId, n){ let hit = 0; for(let s = 1; s <= n; s++){ const {e, P} = mk(900 + s); const a = put(e, P, 1, attId, 0), t = put(e, P, 2, defId, 0), hp0 = t.hp; swing(e, P, a); if(t.hp < hp0) hit++; } return hit / n; }
{ const plain = landRate('u34-plain', 'u34-fly', 200), reach = landRate('u34-reach', 'u34-fly', 200);
  ok(plain > 0.33 && plain < 0.67, `a plain swing at a Flying unit lands about 1 in 2 (${plain.toFixed(2)})`); ok(reach === 1, `a Reach swing at a Flying unit always lands (${reach})`); }
{ const plain = landRate('u34-plain', 'u34-evasive', 200), tru = landRate('u34-true', 'u34-evasive', 200), fen = landRate('u34-fence', 'u34-evasive', 200);
  ok(plain > 0.33 && plain < 0.67, `a plain swing at an Evasive unit lands about 1 in 2 (${plain.toFixed(2)})`); ok(tru === 1 && fen === 1, `True Strike and Fencing always land on Evasive (${tru}, ${fen})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'u34-hit5', 0), t = put(e, P, 2, 'u34-armor', 0), hp0 = t.hp; swing(e, P, a); const plainDmg = hp0 - t.hp;
  const m2 = mk(); const a2 = put(m2.e, m2.P, 1, 'u34-pierce', 0), t2 = put(m2.e, m2.P, 2, 'u34-armor', 0), hp1 = t2.hp; swing(m2.e, m2.P, a2);
  ok(plainDmg === 2 && hp1 - t2.hp === 5, `Armor 3 takes 5 down to ${plainDmg}; Pierce ignores it (${hp1 - t2.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'u34-hit3', 0), w = put(e, P, 2, 'u34-wall', 0), hp0 = w.hp; swing(e, P, a); const plainDmg = hp0 - w.hp;
  const m2 = mk(); const a2 = put(m2.e, m2.P, 1, 'u34-siege', 0), w2 = put(m2.e, m2.P, 2, 'u34-wall', 0), hp1 = w2.hp; swing(m2.e, m2.P, a2);
  ok(hp1 - w2.hp === plainDmg + 2, `Siege deals 2 more to a Structure wall (${plainDmg} -> ${hp1 - w2.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'u34-stamp', 0); put(e, P, 2, 'u34-weak', 0); const hq0 = P[2].hq.hp; swing(e, P, a); const m2 = mk(); const a2 = put(m2.e, m2.P, 1, 'u34-hit5', 0); put(m2.e, m2.P, 2, 'u34-weak', 0); const hq1 = m2.P[2].hq.hp; swing(m2.e, m2.P, a2);
  ok(P[2].hq.hp < hq0 && m2.P[2].hq.hp === hq1, `Stampede carries the leftover into the bramble (${hq0} -> ${P[2].hq.hp}); a plain 5 does not (${hq1} -> ${m2.P[2].hq.hp})`); }

// ================= 3. the Counters group (pure) =================
{ const TABLE = {counters: {flying: {counters: [{skill: 'reach', why: 'r1'}, {skill: 'arrow', why: 'r2'}, {skill: 'trueStrike', why: 'r3', uncertain: true}]}, evasive: {counters: [{skill: 'trueStrike', why: 'r4'}, {skill: 'sweep', why: 'r5'}]}, poison: {counters: [{skill: 'regen', why: 'r6'}]}},
    applies: {poison: 'venom'}, statuses: {venom: {counters: [{skill: 'cure', why: 'r7'}]}}};
  const SKILLS = new Set(['reach', 'arrow', 'trueStrike', 'sweep', 'regen', 'cure', 'flying', 'evasive', 'poison']);
  const lib = new Function('SKILL_COUNTER_TABLE', 'TX', 'skillDefOf', 'ENG36_STATUS_LIST', fn(app, 'ui34StatusId') + fn(app, 'ui34PseudoDef') + fn(app, 'ui34DefOk') + fn(app, 'ui34CountersOf') + fn(app, 'ui34CounterRows') + 'const UI34_COUNTER_MAX = 8; return {ui34CountersOf, ui34CounterRows, ui34PseudoDef};')(
    TABLE, (k, v)=> k === 'ui.ui34-resist-of' ? 'Resist ' + v.name : k === 'ui.ui34-resist-text' ? 'text ' + v.name : k === 'ui.ui34-resist-why' ? 'why ' + v.name : k.replace('ui.eng36-st-', '').toUpperCase(), k=> SKILLS.has(k) ? {key: k, label: k[0].toUpperCase() + k.slice(1)} : null, {venom: {icon: 'V'}});
  ok(lib.ui34CountersOf('poison').map(x=> x.skill).join() === 'regen,cure,status:venom', 'a status skill: its own counters, its status counters, then the Resist / Immune tile');
  ok(lib.ui34CountersOf('quick').length === 0, 'a skill with no row has no counters');
  const rows = [{key: 'flying', ids: ['a', 'b', 'c']}, {key: 'evasive', ids: ['c', 'd']}, {key: 'poison', ids: ['e']}];
  const r = lib.ui34CounterRows(rows, {}, new Set());
  ok(r[0].key === 'trueStrike' && r[0].cards.size === 4, `ranked by cards answered: True Strike answers 4 (Flying a, b, c and Evasive c, d: ${r[0].key} ${r[0].cards.size})`);
  ok(r.map(x=> x.key).join() === 'trueStrike,arrow,reach,sweep,cure,regen,status:venom', 'then 3, 3, 2, 1, 1, 1 cards (ties by certain cards, skills answered, name): ' + r.map(x=> x.key).join());
  ok(lib.ui34CounterRows(rows, {}, new Set(['reach', 'trueStrike'])).every(x=> x.key !== 'reach' && x.key !== 'trueStrike'), 'a skill already shown (Main / Other) is left out');
  ok(lib.ui34CounterRows([{key: 'flying', ids: ['a']}], {}, new Set()).every(x=> x.key !== 'flying'), 'a skill is never its own counter');
  ok(lib.ui34CounterRows(rows, {}, new Set()).length <= 8, 'at most 8');
  const sure = r.find(x=> x.key === 'trueStrike'); ok(sure.sure.size === 2 && sure.cards.size === 4, 'a card answered only by an uncertain rule is not counted as sure (2 of 4)');
  ok(lib.ui34PseudoDef('status:venom').label === 'Resist VENOM' && lib.ui34PseudoDef('quick') === null, 'the Resist / Immune tile is a pseudo skill of its status'); }
{ const f = fn(app, 'ui34CounterTileHTML'); ok(/data-ui34-counter=/.test(f) && /ui34-cn/.test(f) && /ui\.ui34-counter-ctx/.test(f) && /ui\.ui34-unsure/.test(f), 'the tile: data-ui34-counter, the count pill, the hover context with the cards and the reasons');
  ok(/class="ui19-sk is-counter/.test(f) && !/data-ui19-skill=/.test(f), 'a counter tile is its own (is-counter), not a Main / Other tile'); }
{ const f = fn(app, 'ui19McSkillsHTML');
  ok(/ui34CounterRows\(flaggedMain, defs, have\)/.test(f), 'ui19McSkillsHTML counts the MAIN group\'s cards and leaves out what Main / Other show');
  ok(!/hd\('counters'/.test(f) && f.indexOf('${ctrTiles}') > f.indexOf('${flaggedMain.map(li).join(\'\')}') && f.indexOf('${ctrTiles}') < f.indexOf('${recs.map(rli).join(\'\')}'), 'UI35 (2026-11-08): the Counter tiles follow the Main tiles in the one list, before the recommendations (a Counter pill, no heading)');
  ok(/ctrKeys\.has\(r\.key\)/.test(f) && /ctrKeys\.has\(kw\)/.test(f) && /\.\.\.ctrKeys/.test(f), 'a counter is a tile once: the blue group drops it (recommendations, keyword tile, Sugg. Intro tiles)'); }
ok((app.match(/ui32McRefreshSkills\(ov\)/g) || []).length >= 4 && /ui19McSkillsHTML\(c\.top, g\.main, defs, c\.ok, c\.mapId, g\.other\)/.test(fn(app, 'ui32McRefreshSkills')), 'the Counters follow UI32\'s refresh (they are drawn by ui19McSkillsHTML)');

// ================= 4. the blue group up to 15 =================
{ const f = fn(app, 'ui19McSkillsHTML'); ok(/blueRoom = Math\.max\(0, 15 - recs\.length - \(kwMissing \? 1 : 0\) - suggMissingN\)/.test(f) && /ui34ClaudePicks\(mapId \|\| top, defs, new Set/.test(f), 'the blue group tops up to 15 with the skills of Claude\'s picked cards (ui34ClaudePicks)');
  const defsF = {c1: {id: 'c1', name: 'One', effects: {reach: true, arrow: 2}}, c2: {id: 'c2', name: 'Two', effects: {reach: true, thorns: 1}}, c3: {id: 'c3', name: 'Three', effects: {thorns: 1, reach: true}}, c4: {id: 'c4', name: 'Four', token: true, effects: {armor: 1}}};
  const CN = {theme5: {m1: [{id: 'c1'}]}, skillrec: {}, content17: {m1: {groups: [{theme: 'Alt', picks: [{id: 'c3'}, {id: 'c4'}, {id: 'zz'}]}, {theme: 'Now', current: true, picks: [{id: 'c2'}]}]}}};
  const L = new Function('CLAUDE_NEW', 'ui22McMaps', 'mapNumberOf', 'ui18CardSkillKeys', 'skillDefOf', 'ui34DefOk', fn(app, 'ui34ClaudePicks') + 'return ui34ClaudePicks;')(CN, ()=> [{id: 'm1'}], ()=> 0, d=> Object.keys(d.effects).map(key=> ({key, lvl: 0})), k=> ({key: k, label: k}), ()=> true);
  const r = L('m1', defsF, new Set(['arrow']), 15);
  ok(r.map(x=> x.key).join() === 'reach,thorns', `the most-carried first, a shown skill (Arrow) and a token's skill (Armor) left out: ${r.map(x=> x.key + x.n)}`);
  ok(r[0].n === 3 && r[1].theme === 'Now', 'the current theme\'s picks come before the alternatives (Thorns first seen on Now\'s card)');
  ok(L('m1', defsF, new Set(), 1).length === 1 && L('m1', defsF, new Set(), 0).length === 0, 'at most the room left'); }

// ================= 5. texts =================
const KEYS = ['ui.ui32-sk-counters', 'ui.ui34-counter-ctx', 'ui.ui34-resist-of', 'ui.ui34-resist-text', 'ui.ui34-resist-why', 'ui.ui34-unsure', 'ui.ui34-cn-tip', 'ui.ui34-pick-tip'];
const phs = s=> (s.match(/\{\w+\}/g) || []).sort().join(',');
const core = t=> t.trim().replace(/^[\s \p{Extended_Pictographic}️‍]+/u, '');
KEYS.forEach(k=>{ const m = texts.match(new RegExp('"' + k.replace(/\./g, '\\.') + '": "((?:[^"\\\\]|\\\\.)*)"')); ok(!!m, `TX key ${k} exists`); if(!m) return;
  const en = JSON.parse('"' + m[1] + '"'); CODES.forEach(c=>{ const d = J('lang/' + c + '.json'), t = d[core(en)]; ok(t && t !== core(en), `lang/${c}.json translates ${k}`); if(t) ok(phs(t) === phs(en), `lang/${c}.json keeps the placeholders of ${k} (${phs(en)})`); }); });
Object.keys(E.ENG36_STATUS).filter(s=> Object.values(T.applies).includes(s)).forEach(s=> ok(new RegExp('"ui\\.eng36-st-' + s + '"').test(texts), `the Resist tile of ${s} has its status name (ui.eng36-st-${s})`));

// ================= 6. build, docs, tests =================
ok(/sub_once\(app_src, "__SKILL_COUNTER_TABLE__"/.test(asm) && /const SKILL_COUNTER_TABLE = __SKILL_COUNTER_TABLE__;/.test(app), 'assemble_arena.py bakes the table in (the Codex\'s older SKILL_COUNTERS is a different, hand-written list)');
ok(/\.ui19-sk\.is-counter/.test(tpl) && /\.ui34-cn\{/.test(tpl) && /ui32-sk-head\.is-counters/.test(tpl), 'CSS: the counter tile, the count pill, the heading (UI35: the tile keeps its Counter pill; its colour is the common one)');
ok(/Counters/.test(rd('tools/export_workbook_2026_11_07.py')) && /canonical\/skill-counters\.json/.test(rd('tools/export_workbook_2026_11_07.py')), 'the workbook exporter has a Counters column on the Maps tab');
ok(/^## 2026-11-08 Package UI34/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui34-2026-11-08\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');
ok(fs.existsSync(path.join(ROOT, 'tests/e2e/ui34_2026_11_08.py')) && ['counters-1366-m1.png', 'counters-390-m1.png', 'counters-hover-1366-m1.png', 'counters-hover-390-m1.png'].every(f=> fs.existsSync(path.join(ROOT, 'docs/screens/ui34', f))), 'the e2e script and its screenshots at 1366 and 390 are in the repo');
{ const dj = J('docs/decisions.json'), list = Array.isArray(dj) ? dj : (dj.items || []); const d = list.find(x=> x.id === 'UI34-1'); ok(!!d, 'decision UI34-1 is in docs/decisions.json'); if(d){ const w = (String(d.body || '') + ' ' + JSON.stringify(d.options || '')).split(/\s+/).length; ok(w < 100, `UI34-1 is under 100 words (${w})`); } }

console.log(`ui34: ${pass}/${pass + fail} checks passed`); process.exit(fail ? 1 : 0);
