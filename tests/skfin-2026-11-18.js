#!/usr/bin/env node
// 2026-11-19 (package SKFIN, owner 11-18 23:55). Three names and two budget fixes:
// 4. "What is the difference between Delivery and Delivery Resource -> Fuse them. Delivery is sufficient. The {Resource} is a parameter."
//    The card editor's Delivery row picks the resource beside its number (kind selectNumber; saved as delivery N + deliveryRes unless Lumber);
//    "Delivery resource" left "+ Add Skill"; old keys still read; prices unchanged.
// 5. "Shield: Armor -> Armoured Shield instead. It's just 2 shield icons stacked close together." Label and icon 🛡️🛡️ (an .ico-stack badge).
// 6. "On Healed / On Heal -> On Nursed / On Nurse." Labels only (keys onHeal / onHealed / onAllyHealed; On Ally Healed follows).
// + tools/skill_costs.js budgetN / budgetMult lay the Level 0 / 1 skills on (as budget() since ENG52).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const SPL = require(path.join(ROOT, 'bramblewood-skillparams.js'));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(JSON.parse(R('canonical/skill-costs.json')));
const TXm = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = R('arena_app.js'), cards = JSON.parse(R('canonical/cards.json')), costs = JSON.parse(R('canonical/skill-costs.json'));

// ---- 4. Delivery: one row, the resource a parameter
const a0 = app.indexOf("  {key:'delivery', category:'passive'"), a1 = app.indexOf("\n  {key:'deliveryEvery', category:'passive'", a0);
ok(a0 > 0 && a1 > a0, '4. the Delivery entry is found');
const E22_RES = ['lumber', 'stone', 'metal', 'gold', 'pearl', 'uranium', 'grace'];
const e22ResOf = new Function('E22_RES', app.slice(app.indexOf('function e22ResOf('), app.indexOf('\n', app.indexOf('function e22ResOf('))) + '\nreturn e22ResOf;')(E22_RES);
const numOr = (v, d)=> (v === true || v == null || !(Number(v) > 0)) ? d : Number(v);
const D = new Function('TX', 'numOr', 'E22_RES', 'e22ResOf', 'e22ResName', 'return (' + app.slice(a0, a1).trim().replace(/,\s*$/, '') + ');')(
  (k, o)=> k + (o ? JSON.stringify(o) : ''), numOr, E22_RES, e22ResOf, r=> r);
ok(D.kind === 'selectNumber' && D.selectOptions().map(o=> o.value).join() === E22_RES.join() && E22_RES.every(r=> D.numberWhen.includes(r)), '4. Delivery is a resource picker plus a number (selectNumber)');
ok(JSON.stringify(D.get({delivery: 2, deliveryRes: 'stone'})) === '["stone",2]' && JSON.stringify(D.get({delivery: 1})) === '["lumber",1]' && D.get({deliveryRes: 'stone'}) === undefined, '4. the row reads delivery + deliveryRes as [resource, N]');
{ const a = {}, b = {}; D.apply(a, ['metal', '3']); D.apply(b, ['lumber', '1']); ok(JSON.stringify(a) === '{"delivery":3,"deliveryRes":"metal"}' && JSON.stringify(b) === '{"delivery":1}', `4. a Save writes the old keys (${JSON.stringify(a)}, ${JSON.stringify(b)})`); }
ok(/"res":"stone"/.test(D.desc(["stone", 2])) && /"res":"pearl"/.test(D.desc(1, undefined, {delivery: 1, deliveryRes: 'pearl'})), '4. its line names the resource from the row or the card');
ok(/\{key:'deliveryRes', category:'passive', hidden:true/.test(app), '4. "Delivery resource" is off "+ Add Skill" (hidden; an old card still reads it)');
ok(/numOr\(Array\.isArray\(v\) \? v\[1\] : v, 1\)/.test(app.slice(app.indexOf('function e22Head('), app.indexOf('function e22Head(') + 1500)), '4. the card line head reads the row value [resource, N]');
ok(JSON.stringify(SPL.fuse({delivery: 1, deliveryRes: 'stone'})) === '{"delivery":{"v":1,"res":"stone"}}' && JSON.stringify(SPL.expand({delivery: {v: 1, res: 'stone'}})) === '{"delivery":1,"deliveryRes":"stone"}', '4. the data stays one skill: delivery {v, res} <-> delivery + deliveryRes');
{ const flat = cards.filter(c=> [c.effects || {}].concat(Object.values(c.levelSkills || {})).some(e=> e && e.deliveryRes != null)).map(c=> c.id);
  ok(!flat.length, `4. no card in canonical/cards.json carries a loose deliveryRes (${flat.join(', ')})`); }
ok(costs.skills.find(s=> s.id === 'delivery').value === 5.25 && costs.skills.find(s=> s.id === 'deliveryRes').value === -1.56, '4. prices unchanged (Delivery 5.25 x N^0.456; another resource -1.56)');

// ---- 5. Armoured Shield
ok(TXm.TEXT['ui.skn-shield-armor'] === 'Armoured Shield', '5. the label is Armoured Shield');
ok(/SKILL_ICON, \{shieldArmor:'🛡️🛡️'/.test(app), '5. the icon is two shields');
{ const seg = new Intl.Segmenter(undefined, {granularity: 'grapheme'}); const g = [...seg.segment('🛡️🛡️')].map(x=> x.segment);
  ok(g.length === 2 && g.every(x=> /\p{Extended_Pictographic}/u.test(x)), '5. iconHTML draws it as two overlapped parts (icoParts -> .ico-stack)'); }
ok(/if\(p\.key === 'shield' && Number\(e\.shieldArmor\) > 0\)\{ lines\.push\(`\$\{ic\('shieldArmor'\)\}\$\{escapeHtml\(TX\('ui\.skn-shield-armor'\)\)\}/.test(app), '5. a Shield with Armor reads "Armoured Shield N" on the card');
ok(/else if\(e\.shield && Number\(e\.shieldArmor\) > 0\) out\.push\(`<span class="ab-unit-shield" title="\$\{escapeAttr\(TX\('ui\.skn-shield-armor'\)/.test(app) && /iconHTML\('shieldArmor', SKILL_ICON\.shieldArmor\)/.test(app), '5. and its chip shows the two shields');

// ---- 6. On Nurse / On Nursed
ok(/\{key:'onHeal', label:'On Nurse'/.test(app) && /\{key:'onHealed', label:'On Nursed'/.test(app) && /\{key:'onAllyHealed', label:'On Ally Nursed'/.test(app) && /\{key:'onAllyHealed', sub:'Nursed'\}/.test(app), '6. the triggers read On Nurse / On Nursed / On Ally Nursed (keys unchanged)');
ok(!/label:'On Heal(ed)?'|label:'On Ally Healed'/.test(app), '6. no On Heal / On Healed label is left');
ok(['onHeal', 'onHealed', 'onAllyHealed'].every(k=> /Nurse/.test(costs.triggers.find(t=> t.id === k).label)), '6. skill-costs.json labels follow');
{ const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  CODES.forEach(c=>{ const m = JSON.parse(R('lang/' + c + '.json')), u = JSON.parse(R('lang/ui/' + c + '.json'));
    ok(m['Armoured Shield'] && ['On Nurse', 'On Nursed', 'On Ally Nursed', 'Nursed'].every(k=> u[k]), `texts: ${c} has Armoured Shield and the Nurse triggers`); }); }

// ---- budget: N's multiplier sees the Level 0 / 1 skills (forge-curve check 1)
{ const diff = cards.filter(SC.measured).filter(c=> c.levelSkills).filter(c=> Math.abs(T.budgetN(c) - T.budget(c).N) > 1e-9).map(c=> c.id);
  ok(!diff.length, `budget: budgetN and budget().N agree for every measured card with levelSkills (${diff.slice(0, 5).join(', ')})`);
  const bk = cards.find(c=> c.id === 'bee-knight'); ok(bk && T.budgetMult(bk) === 1 && T.budgetMult(bk, 0) > 1, `budget: the Bee Knight is not "plain" at Level 1 (its Flying / Swarm), plain below (${T.budgetMult(bk)}, ${T.budgetMult(bk, 0)})`); }

console.log(fail ? `skfin-2026-11-18: ${fail} of ${n} checks FAILED` : `skfin-2026-11-18: all ${n} checks pass`);
process.exit(fail ? 1 : 0);
