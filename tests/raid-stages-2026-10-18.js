#!/usr/bin/env node
// 2026-10-18 (R3-WP2): the Goliath's stages do something. Enraged (75%) and Thrashing (50%) had no rules and fightFor only read
// stripAbilities; now a stage's rules (bossAtk, bossHp, field, extraVolley, castleHpPct, stripAbilities) land in the built fight
// (BramblewoodRaid.fightFor / stageRules / stageCard / scaleCastle), describe themselves (describeStage), round-trip through the raid
// editor (setStageRules), stay in the shape the trench reads, and the page wires them into the raid fight.
'use strict';
const fs = require('fs'), path = require('path');
const R = require('../bramblewood-raid.js');
const T = require('../bramblewood-trench.js');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const raids = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'raids.json'), 'utf8'));
const g = raids.find(r=> r.id === 'goliath');
const stage = n=> (g.stages || []).find(s=> s.name === n);
const stateAt = st=> ({stage: st, byId: {}});
const part = g.parts[0].id;

// ---- The data: three stages, each with rules, the chosen defaults labelled
['Enraged', 'Thrashing', 'Exposed'].forEach(n=> ok(stage(n), `the Goliath has a ${n} stage`));
ok(Object.keys(R.stageRules(stage('Enraged'))).length && Object.keys(R.stageRules(stage('Thrashing'))).length, 'Enraged and Thrashing have rules now');
ok(/owner to confirm/.test(stage('Enraged').note || '') && /owner to confirm/.test(stage('Thrashing').note || ''), 'the chosen defaults are labelled in the data');

// ---- Each stage's rules land in the built fight
{ const f = R.fightFor(g, stateAt(stage('Enraged')), part, {myCastleHp: 100});
  ok(f.stage === 'Enraged' && f.bossAtk === 2 && f.extraVolley === 1 && !f.stripAbilities && f.castleHpPct === 0, `Enraged: +2 Attack, one back-row volley (${JSON.stringify(f.stageRules)})`);
  ok(f.myCastleHp === 100, 'Enraged: your castle keeps its Health');
  ok(f.fieldRules.crushingDepths === 2 && f.fieldRules.tide === true && !f.fieldRules.landslide, 'Enraged: the raid\'s own field, no Landslide'); }
{ const f = R.fightFor(g, stateAt(stage('Thrashing')), part, {myCastleHp: 100});
  ok(f.stage === 'Thrashing' && f.bossAtk === 4 && f.extraVolley === 1 && f.castleHpPct === -10, `Thrashing: +4 Attack, volley, castle -10% (${JSON.stringify(f.stageRules)})`);
  ok(f.myCastleHp === 90, `Thrashing: your castle 100 -> 90 (${f.myCastleHp})`);
  ok(f.fieldRules.landslide === true && f.fieldRules.crushingDepths === 2 && f.fieldRules.psychicDampener === true, `Thrashing: Landslide on top of the raid's field (${JSON.stringify(f.fieldRules)})`); }
{ const f = R.fightFor(g, stateAt(stage('Exposed')), part);
  ok(f.stripAbilities && !f.bossAtk && !f.extraVolley, 'Exposed: strips abilities, nothing else'); }
{ const f = R.fightFor(g, stateAt(null), part, {myCastleHp: 80});
  ok(f.stage === null && !f.bossAtk && !f.extraVolley && f.myCastleHp === 80 && !f.fieldRules.landslide, 'no stage yet: a plain fight'); }
// a field id resolves through the page's resolver (the page passes FIELD_EFFECTS rules)
{ const f = R.fightFor(g, stateAt({name:'x', rules:{field:'rapids'}}), part, {fieldRules: k=> k === 'rapids' ? {permaTide:true, rapids:true} : null});
  ok(f.fieldRules.permaTide === true && f.fieldRules.rapids === true, 'a stage field id resolves to its effect\'s rules'); }

// ---- The shape: an object or a list, unknown keys ignored, numbers clamped
{ const a = R.stageRules({rules:{bossAtk:3, bossHp:'5', wobble:9, field:{hail:3}}}), b = R.stageRules({rules:[{bossAtk:1}, {bossAtk:2, extraVolley:9}]});
  ok(a.bossAtk === 3 && a.bossHp === 5 && !('wobble' in a) && a.field.hail === 3, `rules as an object (${JSON.stringify(a)})`);
  ok(b.bossAtk === 3 && b.extraVolley === 3, `rules as a list merge, extraVolley capped at 3 (${JSON.stringify(b)})`);
  ok(Object.keys(R.stageRules({rules:[{nope:true}]})).length === 0 && Object.keys(R.stageRules(null)).length === 0, 'unknown keys and no stage: no rules'); }
{ const d = {attack:3, health:10, name:'c'}, f = {bossAtk:2, bossHp:-20};
  const c = R.stageCard(d, f); ok(c !== d && c.attack === 5 && c.health === 1 && d.attack === 3, `stageCard: +2 Attack, Health never below 1 (${c.attack}/${c.health})`);
  ok(R.stageCard(d, {}) === d, 'stageCard without bossAtk/bossHp: the card as it is');
  ok(R.scaleCastle(200, -10) === 180 && R.scaleCastle(5, -90) === 1 && R.scaleCastle(50, 0) === 50, 'scaleCastle'); }

// ---- Descriptions: one line per stage
{ const e = R.describeStage(stage('Enraged')), t = R.describeStage(stage('Thrashing')), x = R.describeStage(stage('Exposed'));
  ok(/\+2 Attack/.test(e) && /back two rows/.test(e), `Enraged reads: ${e}`);
  ok(/\+4 Attack/.test(t) && /Landslide/.test(t) && /10% Health/.test(t), `Thrashing reads: ${t}`);
  ok(/lose every ability/.test(x), `Exposed reads: ${x}`);
  ok(R.describeStage({name:'n'}) === '', 'a stage with no rules: no line');
  ok(/Crushing Depths/.test(R.describeStage({rules:{field:'crushingDepths'}})), 'a rule key is spaced out when no name is given');
  ok(/Rocks/.test(R.describeStage({rules:{field:'landslide'}}, {fieldName: ()=> 'Rocks'})), 'the page names the field'); }

// ---- The editor round trip (the values its inputs hold, as strings), keeping keys it doesn't show
{ const s = JSON.parse(JSON.stringify(stage('Thrashing'))); s.rules[0].custom = 7;
  R.setStageRules(s, {stripAbilities:false, bossAtk:'6', bossHp:'3', extraVolley:'2', castleHpPct:'-25', field:'crushingdepths'});
  const r = R.stageRules(s);
  ok(Array.isArray(s.rules) && s.rules.length === 1, 'saved as a one-object list (the shape the trench reads)');
  ok(r.bossAtk === 6 && r.bossHp === 3 && r.extraVolley === 2 && r.castleHpPct === -25 && !r.stripAbilities && s.rules[0].field === 'crushingdepths', `edited values read back (${JSON.stringify(s.rules)})`);
  ok(s.rules[0].custom === 7, 'a key the editor does not show is kept');
  R.setStageRules(s, {bossAtk:'0', bossHp:'', extraVolley:'0', castleHpPct:'0', field:''});
  ok(!('bossAtk' in s.rules[0]) && !('bossHp' in s.rules[0]) && !('field' in s.rules[0]) && !('castleHpPct' in s.rules[0]), `0 / blank clears a rule (${JSON.stringify(s.rules)})`);
  const n = {name:'New', at:0.25, rules:[]}; R.setStageRules(n, {stripAbilities:true, bossAtk:'99'});
  ok(R.stageRules(n).stripAbilities && R.stageRules(n).bossAtk === 50, 'a new stage: strip on, Attack capped at 50');
  const back = R.setStageRules({rules:[]}, {stripAbilities:false, bossAtk:'', field:''}); ok(Array.isArray(back.rules) && !back.rules.length, 'nothing set: an empty list');
  const kept = {rules:[{field:{hail:2}}]}; R.setStageRules(kept, {bossAtk:'1'}); ok(kept.rules[0].field.hail === 2, 'a field the list can\'t show is kept when the editor leaves it'); }

// ---- The trench still reads every stage (its .some over the list), and only Exposed strips
g.stages.forEach(s=>{ let cfg = null; try{ cfg = T.trenchConfig(g, g.parts[0], s); }catch(e){ cfg = null; }
  ok(cfg && cfg.strip === (s.name === 'Exposed'), `trenchConfig reads ${s.name}`); });

// ---- extraVolley: the boss's back rows strike your front (engine reserveVolley for side 2)
{ const so = id=> id===1 ? 'A' : 'B';
  const defs = Object.assign({}, H.loadCardDefs(), {'rs-wall': {id:'rs-wall', name:'w', attack:0, health:500, wait:0, cost:0, effects:{}}, 'rs-hit': {id:'rs-hit', name:'h', attack:6, health:50, wait:0, cost:0, effects:{}}});
  const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open', reserveRows:2}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'rs-wall', 0, {}, []); const w = e.allBoardCards(P[1]).find(c=> c.defId === 'rs-wall');
  e.debugSpawnCard(P, so, 2, 'rs-wall', 0, {}, []); e.fillReserve(P[2], 1, 0, 'rs-hit');
  const h0 = w.hp; e.reserveVolley(P, so, 2, {}, []); ok(w && w.hp === h0 - 3, `a boss back-row card strikes your unit in its column for half Attack (${h0 - (w && w.hp)})`); }

// ---- The page wires it in
ok(/RaidM\.fightFor\(def, st, partId, raidStageOpts\(\)\)/.test(src), 'startRaidPartMatch builds the fight with the stage (raidStageOpts)');
ok((src.match(/RaidM\.stageCard\(/g) || []).length >= 4, 'the boss deck, guards, Commons (and the single-row deck) get the stage\'s Attack / Health');
ok(/const raidRules = f\.fieldRules \|\|/.test(src), 'the full raid fight runs under fightFor\'s field (the stage\'s on top)');
ok(/RaidM\.scaleCastle\(Math\.max\(merged\.health/.test(src), 'your merged castle takes the stage\'s castleHpPct');
ok(/raidExtraVolley: f\.extraVolley/.test(src) && /m\.engine\.reserveVolley\(m\.players, m\.sideOf, 2, m\.stats, events\)/.test(src), 'extraVolley: the boss\'s back rows strike in raidSpecials');
ok(/r3-stage-now/.test(src) && /<section class="r3-stages"><h3>Stages<\/h3>/.test(src), 'the raid tab shows the current stage\'s line and every stage');
ok(/data-st-batk/.test(src) && /data-st-volley/.test(src) && /data-st-castle/.test(src) && /data-st-field/.test(src) && /RaidM\.setStageRules\(s, vals\)/.test(src), 'the raid editor edits each stage\'s rules');

console.log(fail ? `raid-stages-2026-10-18: ${fail} failure(s)` : 'raid-stages-2026-10-18: all passed');
process.exit(fail ? 1 : 0);
