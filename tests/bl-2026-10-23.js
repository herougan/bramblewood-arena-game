#!/usr/bin/env node
// 2026-10-23 (package BL): the owner's 11:23 (Bloom, Nectar Vintner) and 17:34 #3 ("Bloom hasn't changed"), #4 (default values) and #14
// (Bleed's fade and its grey drop).
//   Bloom – {conditions} (effects.bloomCopy): Wet & Sunny / Wet & Kill / + Lumber; once per unit; a copy beside it with +1/+1 (owner 19:30: the
//   unit itself unchanged), the unit's Attack and Health (no day / night bonus), its damage, no counters, its printed Wait; the copy can't bloom and leaves no card;
//   no free slot beside it: it waits. Sunny is day with no Rain / Fog. Priced by the budget (bloomOdds: S = 3p, cap 1 stats x (1 + p)).
//   The cards: Fungal Colossus, Puffball Bombardier, Lotus Frog (was Bloom When), the new Pond Algae; Nectar Vintner's Healing 1; the
//   re-fit's down-moves held (BL-5) and the flagged list merged. The old Bloom heal and Bloom When retired; Pollen Drift on Healing.
//   A skill at its default value has a bare name on its card line (Diurnal / Nocturnal / Crepuscular +1/+0, Cleave 1, Fire Bolt 2 ...).
//   Bleed: the fade rule in the texts; the grey 🩸 drop wired on bleedFade. Texts in 12 packs; the docs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT;
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'bl-alga': {id:'bl-alga', name:'Alga', attack:2, health:10, wait:1, cost:0, effects:{bloomCopy:{when:['wet','sunny'], mode:'and'}}},
  'bl-fung': {id:'bl-fung', name:'Fungus', attack:6, health:20, wait:0, cost:0, effects:{bloomCopy:{when:['wet','kill'], mode:'and'}}},
  'bl-lumb': {id:'bl-lumb', name:'Colossus', attack:1, health:10, wait:0, cost:0, effects:{bloomCopy:{when:['wet','sunny'], mode:'and', lumber:1}}},
  'bl-day':  {id:'bl-day', name:'DayAlga', attack:1, health:10, wait:0, cost:0, effects:{diurnal:1, diurnalHp:2, bloomCopy:{when:['wet','sunny']}}},
  'bl-or':   {id:'bl-or', name:'OrAlga', attack:1, health:10, wait:0, cost:0, effects:{bloomCopy:{when:['wind','wet'], mode:'or'}}},
  'bl-wall': {id:'bl-wall', name:'Wall', attack:0, health:500, wait:9, cost:0, effects:{}},
  'bl-weak': {id:'bl-weak', name:'Weak', attack:0, health:3, wait:9, cost:0, effects:{}},
  'bl-heal': {id:'bl-heal', name:'Healer', attack:0, health:50, wait:9, cost:0, effects:{healing:1}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const bloomPass = (e, P)=>{ const ev = []; e.bloomCopyPass(P, so, {}, ev); return ev; };

// ---- 1. Wet & Sunny: +1/+1, a copy beside it with its damage, no counters, its printed Wait; once; the copy can't bloom
{ const {e, P} = mk({phase:'day', wet:true}); e.roundStart(P, 1, so, {}, []);
  const A = put(e, P, 1, 'bl-alga', 0); A.hp -= 3; A.poison = 2; A.bleed = 1; A.shield = 2; A.exposed = 1; A.atk += 2; A.wait = 0; // a buff without counters: +2 Attack
  ok(e.bloomCopyOn(defs['bl-alga'].effects.bloomCopy, A, P[1]), '1. by day on a wet map: Wet & Sunny hold');
  const ev = bloomPass(e, P), bl = ev.find(x=> x.type === 'bloom'), sp = ev.find(x=> x.type === 'spawn' && x.kind === 'bloom');
  const C = all(P[1]).find(x=> x.bloomCopy);
  ok(bl && sp && C && bl.copyUid === C.uid && sp.nearUid === A.uid && sp.uids[0] === C.uid, '1. a bloom event, then a spawn (kind bloom) for the copy beside it');
  ok(A.bloomed && A.atk === 4 && A.maxHp === 10 && A.hp === 7, `1. the unit itself is unchanged (owner 19:30: "bloom only gives the new one +1/+1, not itself") (${A.atk}/${A.hp}/${A.maxHp})`);
  ok(C && C.defId === 'bl-alga' && C.atk === 5 && C.maxHp === 11 && C.hp === 8, `1. the copy: the same card, its Attack with the buff, +1/+1, its damage (${C && [C.atk, C.hp, C.maxHp]})`);
  ok(C && !C.poison && !C.bleed && !(C.shield > 0) && !C.exposed, '1. the copy has none of its counters (Poison, Bleed, Shield, Exposed)');
  ok(C && C.wait === 1, `1. the copy arrives with the printed Wait (${C && C.wait})`);
  ok(C && Math.abs(C.slot - A.slot) === 1, `1. in a free slot right beside it (${C && C.slot})`);
  ok(A.poison === 2 && A.bleed === 1, '1. the unit keeps its own counters');
  // 2026-10-24 (package EN5, owner BL-1 03:12: "the copy can bloom"): the unit blooms once; its copy blooms once too (was: never)
  { if(C) C.wait = 0; /* 2026-10-26 (ENG9, owner EN7-2): Bloom tests only once the unit is Ready; the copy came in at Wait 1 */ const ev2 = bloomPass(e, P); ok(!ev2.some(x=> x.type === 'bloom' && x.uid === A.uid) && ev2.some(x=> x.type === 'bloom' && C && x.uid === C.uid), `1. once per unit: no second bloom of the unit; the copy blooms once (EN5) (${ev2.filter(x=> x.type === 'bloom').map(x=> x.uid).join(',')})`); }
  ok(C && C.bloomCopy && C.bloomOf === A.uid, '1. the copy is marked as a copy of the unit'); }

// ---- 2. Sunny is day with no Rain / Fog; Night is not sunny; Wet needs rain, the Tide in or a wet map
{ const {e, P} = mk({phase:'night', wet:true}); e.roundStart(P, 1, so, {}, []); put(e, P, 1, 'bl-alga', 0); ok(!bloomPass(e, P).length, '2. at night: not Sunny, no bloom'); }
{ const {e, P} = mk({phase:'day'}); e.roundStart(P, 1, so, {}, []); put(e, P, 1, 'bl-alga', 0); ok(!bloomPass(e, P).length, '2. by day on dry ground: not Wet, no bloom');
  e.setField('rain', 3); ok(!bloomPass(e, P).length, '2. rain makes it Wet but it is not Sunny in the rain'); }
{ const {e, P} = mk({phase:'day', wet:true}); e.roundStart(P, 1, so, {}, []); put(e, P, 1, 'bl-alga', 0); e.setField('fog', 3); ok(!bloomPass(e, P).length, '2. fog: not Sunny'); }
{ const {e, P} = mk({wind:'gale'}); e.roundStart(P, 1, so, {}, []); put(e, P, 1, 'bl-or', 0); ok(bloomPass(e, P).some(x=> x.type === 'bloom'), '2. Wind or Wet: a gale is enough (mode or)'); }

// ---- 3. Wet & Killed an enemy
{ const {e, P} = mk({wet:true}); e.roundStart(P, 1, so, {}, []); const F = put(e, P, 1, 'bl-fung', 0); put(e, P, 2, 'bl-weak', 0);
  ok(!bloomPass(e, P).length, '3. Wet & Kill: wet, no kill yet, no bloom');
  const ev = []; e.debugAttack(P, so, F.uid, {}, ev); e.removeDeadCards(P, so, {}, {}, ev);
  ok(F.bloomKill, '3. its kill marks it (as its On Kill fires)');
  ok(bloomPass(e, P).some(x=> x.type === 'bloom' && x.uid === F.uid), '3. the next check: it blooms'); }

// ---- 4. + 1 Lumber: needs it, pays it
{ const {e, P} = mk({phase:'day', wet:true}); e.roundStart(P, 1, so, {}, []); const L = put(e, P, 1, 'bl-lumb', 0); P[1].lumber = 0;
  ok(!bloomPass(e, P).length && !L.bloomed, '4. + 1 Lumber with none: no bloom');
  P[1].lumber = 2; const ev = bloomPass(e, P); ok(L.bloomed && P[1].lumber === 1 && ev.find(x=> x.type === 'bloom').lumber === 1, `4. with Lumber: it pays 1 and blooms (${P[1].lumber} left)`); }

// ---- 5. no free slot beside it: it waits (owner call BL-2); 2026-10-26 (ENG9, owner EN7-2): it fails, +1/+1 on the unit, and blooms no more
{ const {e, P} = mk({phase:'day', wet:true}); e.roundStart(P, 1, so, {}, []); const A = put(e, P, 1, 'bl-alga', 0); const L = put(e, P, 1, 'bl-wall', -1), R = put(e, P, 1, 'bl-wall', 1);
  ok(!bloomPass(e, P).length && !A.bloomed, '5. still Waiting: it does not test its Bloom yet (ENG9)');
  A.wait = 0; const a0 = A.atk, m0 = A.maxHp; const evf = bloomPass(e, P); const f = evf.find(x=> x.type === 'bloom');
  ok(f && f.failed && A.bloomed && A.atk === a0 + 1 && A.maxHp === m0 + 1 && !all(P[1]).some(x=> x.bloomCopy), `5. Ready, both neighbours taken: the split fails, +1/+1 on the unit (${A.atk}/${A.maxHp})`);
  R.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const ev = bloomPass(e, P);
  ok(!ev.some(x=> x.type === 'bloom') && !all(P[1]).some(x=> x.bloomCopy), '5. a neighbour slot frees up later: it does not bloom again'); void L; }

// ---- 6. the day bonus stays out of the copy's base (it gets its own); the copy leaves no card behind
{ const {e, P} = mk({phase:'day', wet:true}); e.roundStart(P, 1, so, {}, []); const A = put(e, P, 1, 'bl-day', 0);
  ok(A.phaseHp === 2 && A.maxHp === 12, `6. by day the Diurnal bonus is on (${A.maxHp})`);
  bloomPass(e, P); const C = all(P[1]).find(x=> x.bloomCopy);
  ok(C && C.maxHp === A.maxHp + 1 && C.phaseHp === 2 && C.maxHp - C.phaseHp === 11 && A.maxHp === 12, `6. the copy: base 11 (10 + its +1) plus its own day bonus; the unit keeps 12 (${C && [C.maxHp, C.phaseHp]})`);
  const g0 = P[1].graveyard.length; C.hp = 0; e.removeDeadCards(P, so, {}, {}, []); ok(P[1].graveyard.length === g0, '6. the copy dies: no card in the graveyard'); }

// ---- 7. a whole round (resolveCombat): the bloom happens in the upkeep, and the log has it
{ const {e, P} = mk({phase:'day', wet:true}); e.roundStart(P, 1, so, {}, []); const A = put(e, P, 1, 'bl-alga', 0); A.wait = 0; put(e, P, 2, 'bl-wall', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev); ok(ev.some(x=> x.type === 'bloom') && all(P[1]).some(x=> x.bloomCopy), '7. resolveCombat: the round-start upkeep blooms it'); }

// ---- 8. Pollen Drift now adds to Healing (the old Bloom heal is retired)
{ const {e, P} = mk({}); e.roundStart(P, 1, so, {}, []); const Hh = put(e, P, 1, 'bl-heal', 0); const W = put(e, P, 1, 'bl-wall', 1); W.hp = 400; P[1].perks = {pollen: 2};
  e.resolveCombat(P, so, {}, []); ok(W.hp === 403, `8. Healing 1 + Pollen Drift 2 heals 3 (${W.hp - 400})`); void Hh; }

// ---- 9. the price: bloomOdds, S = 6p, cap 1's stats x (1 + p), the forge bank
ok(BB.bloomOdds({when:['wet','sunny']}) === 0.27 && BB.bloomOdds({when:['wet','kill']}) === 0.17 && BB.bloomOdds({when:['wet','sunny'], lumber:1}) === 0.23 && BB.bloomOdds({when:['tide','night']}) === 0.24, '9. the odds: Wet & Sunny 0.27, Wet & Kill 0.17, + 1 Lumber 0.23, Tide & Night 0.24');
// 2026-10-24 (package EN5, owner BL-1: the copy can bloom): priced with the chain, p x (1 + q + q²) (bramblewood-budget.js bloomChainOdds): 0.27 -> 0.44
{ const pc = BB.bloomChainOdds({when:['wet','sunny']}), S = Math.round(3 * pc * 100) / 100; const cx = BB.contextS('bloomCopy', {when:['wet','sunny']}, ()=> 0); ok(pc === 0.44 && cx && cx.S === S, `9. S = 3 x the chain's odds (the copies' +1/+1) (${cx && cx.S}; chain ${pc})`);
  const a = BB.capScores(2, 10, S, {bloomCopy:{when:['wet','sunny']}}, null), b = BB.capScores(2, 10, S, {}, null);
  ok(a.x1 === Math.round(((4 + 10) * (1 + pc) + S) * 100) / 100 && a.x2 === b.x2 && b.x1 === Math.round((14 + S) * 100) / 100, `9. cap 1's stat terms x ${1 + pc}, cap 2 unchanged (${a.x1}, ${a.x2} / ${b.x2})`); }
{ const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const r = T.cardS({bloomCopy:{when:['wet','sunny']}}, {attack:1, health:8}); ok(r.S === Math.round(3 * BB.bloomChainOdds({when:['wet','sunny']}) * 100) / 100 && !r.missing.length, `9. tools/skill_costs.js prices it through the budget (${r.S}; EN5: with the chain)`);
  const sk = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')).skills.find(s=> s.id === 'bloomCopy'); ok(sk && /bloomOdds/.test(sk.note), '9. canonical/skill-costs.json notes where Bloom is priced'); }

// ---- 10. the cards
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = id=> cards.find(c=> c.id === id);
{ const fc = by('fungal-colossus'), pb = by('puffball-bombardier'), lf = by('lotus-frog'), nv = by('nectar-vintner'), pa = by('pond-algae'), tb = by('test-skill-bloom');
  const w = c=> JSON.stringify(c.effects.bloomCopy);
  ok(w(fc) === JSON.stringify({when:['wet','sunny'], mode:'and', lumber:1}), '10. Fungal Colossus: Bloom (Wet & Sunny + 1 Lumber)');
  ok(w(pb) === JSON.stringify({when:['wet','kill'], mode:'and'}), '10. Puffball Bombardier: Bloom (Wet & Killed an enemy)');
  ok(w(lf) === JSON.stringify({when:['tide','night'], mode:'and'}) && !lf.effects.bloomWhen, '10. Lotus Frog: Bloom (Tide & Night), no Bloom When');
  ok(nv.effects.healing === 1 && nv.effects.bloom == null, '10. Nectar Vintner: Healing 1, no Bloom');
  ok(pa && w(pa) === JSON.stringify({when:['wet','sunny'], mode:'and'}) && (pa.awaitingSource || /RW5, owner 22:23/.test(pa.creatorNote || '') /* 2026-10-23 (package RW5): placed in Maps 0-9 by tools/rw5_place_new_cards_2026_10_23.js */) && pa.subtype === 'plant' && cards.filter(c=> c.numericId === pa.numericId).length === 1, '10. Pond Algae: Bloom (Wet & Sunny), awaiting a source, a unique numericId');
  ok(tb && tb.effects.bloomCopy && tb.effects.bloom == null, '10. Test: Bloom carries the new Bloom');
  ok(!cards.some(c=> c.effects && c.effects.bloomWhen) && !cards.some(c=> c.effects && c.effects.bloom != null), '10. no card has the old Bloom heal or Bloom When');
  const SC = require(path.join(ROOT, 'tools', 'card_retune_2026_10_19.js')).SC, T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const bp = T.budget(pa, {level: 1}); ok(bp.ok && bp.x1 / bp.N <= 1 && bp.x1 / bp.N > 0.85, `10. Pond Algae ${pa.attack}/${pa.health} fits the budget (${Math.round(bp.x1 / bp.N * 100)}% of N)`);
  const held = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bl-held-2026-10-23.json'), 'utf8')).held;
  // 2026-10-24 (package EN5, owner BL-5 03:12: "Balance if overbudget, err on slightly overbudget (14.6>14.5)"): the three held cards are re-fitted now, at most 1% over N
  ok(held.length === 3 && held.every(h=> { const c = by(h.id), b = c && T.budget(c, {level: 1}); return c && `${c.attack}/${c.health}` !== h.at && b.x1 <= b.N * 1.01 + 1e-9 && /2026-10-24 EN5 re-fit/.test(c.creatorNote || ''); }), '10. the three cards BL held are re-fitted by EN5 (at most 1% over N)');
  const fl = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'), 'utf8'));
  // 2026-10-24 (RELFIX): >= 37 (was 47): BAL3 took the ten held cards off the list once they took their formula line (owner BAL2-5 12:02 "Basic logic return", built)
  ok(fl.length >= 37 && fl.includes('abbey-goose') && fl.includes('puddle-changeling'), `10. the flagged list was merged, not overwritten (${fl.length})`); }

// ---- 11. the app: the Bloom row, the retired rows, the default values
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/\{key:'bloomCopy', category:'passive', label:'Bloom', kind:'text'/.test(src), '11. PASSIVE_DEFS: Bloom (bloomCopy)');
ok(/\{key:'bloomWhen', category:'passive', hidden:true, retired:true/.test(src) && /\{key:'bloom', category:'evergreen', hidden:true, retired:true/.test(src), '11. the old Bloom heal and Bloom When are retired (hidden)');
ok(/grant:\{healing:1\},\s*sig:'Healing 1'/.test(src) && /desc:'Healing heals 1 more\.'/.test(src), '11. the Open Meadow and Pollen Drift are on Healing');
['crepuscular', 'nocturnal', 'diurnal'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'passive', label:'[A-Za-z]+', kind:'twoNumber', placeholders:\\['Attack','Health'\\], defaultValue:\\[1, 0\\]`).test(src), `11. ${k}: default +1/+0`));
{ const grab = name=> { const m = src.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n(?=function |//|const )`)); return m ? m[0] : ''; };
  const code = ['phaseVals', 'valSuffix', 'atSkillDefault', 'skillValSuffix'].map(grab).join('\n');
  const F = new Function(code + '; return {atSkillDefault, skillValSuffix};')();
  const di = {key:'diurnal', defaultValue:[1, 0]}, cl = {key:'sweep', defaultValue:1}, fb = {key:'fireBolt', defaultValue:2};
  ok(F.atSkillDefault(di, [1, 0]) && F.atSkillDefault(di, true) && !F.atSkillDefault(di, [2, 0]) && !F.atSkillDefault(di, [1, 1]), '11. Diurnal [1, 0] (or true) is its default; +2/+0 and +1/+1 are not');
  ok(F.skillValSuffix(fb, 2) === '' && F.skillValSuffix(fb, 3) === ' 3' && F.skillValSuffix(cl, 1) === '' && F.skillValSuffix({key:'x'}, 2) === ' 2', '11. Fire Bolt 2 reads "Fire Bolt", Fire Bolt 3 keeps its number; a skill with no default keeps it'); }
ok(/\(p\.kind==='twoNumber' && Array\.isArray\(v\)\) \? \(atSkillDefault\(p, v\) \? p\.label :/.test(src) && /skillValSuffix\(p, v\)\}` \/\* BL: bare at its default/.test(src), '11. the card line\'s head drops the number at the default');
ok(/if\(s\.kind==='twoNumber'\) return Array\.isArray\(s\.defaultValue\) \? s\.defaultValue\.slice\(\)/.test(src), '11. the card editor\'s default for Diurnal is +1/+0');

// ---- 12. the looks and the log
ok(/function bleedFadeDropVfx\(uid\)/.test(src) && /if\(ev\.type==='bleedFade'\)\{\s*try\{ bleedFadeDropVfx\(ev\.uid\); \}catch\(e\)\{\}/.test(src), '12. bleedFade drops a grey 🩸 from the pip (before the badge updates)');
ok(/class(Name)? ?= ?'bleed-drop'/.test(src) && /grayscale\(1\)/.test(src), '12. the drop is greyed out');
ok(/function bloomCopyVfx\(srcUid, copyUid\)/.test(src) && /ev\.type==='spawn' && ev\.kind==='bloom'\)\{ try\{ bloomCopyVfx\(ev\.nearUid/.test(src) && /ev\.kind !== 'bloom' \/\* BL: its own bloom \*\//.test(src), '12. the copy blooms in (no summon portal)');
ok(/if\(ev\.type==='bloom'( && !ev\.parasite)?( && !ev\.failed)?\)\{/.test(src) /* + ENG9: a failed bloom has its own handler */ /* 2026-10-24 (package EN7): a Parasite's bloom has its own look (en7Vfx), so the plain handler skips it */ && /ui\.bl-log/.test(src), '12. the bloom event updates the unit and logs a line');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8'); ok(/\.bloom-ring\{/.test(tpl) && /\.bleed-drop\{/.test(tpl) && /\.ab-bloomcopy\.is-spent\{/.test(tpl), '12. the styles');

// ---- 13. texts and packs
const TXm = require(path.join(ROOT, 'bramblewood-texts.js'));
const keys = ['ui.bl-head', 'ui.bl-cond-kill', 'ui.bl-short', 'ui.bl-short-lumber', 'ui.bl-desc', 'ui.bl-desc-lumber', 'ui.bl-codex', 'ui.bl-is-copy', 'ui.bl-bloomed', 'ui.bl-log', 'ui.bl-log-lumber'];
ok(keys.every(k=> TXm.TEXT[k]), '13. the Bloom texts are TX keys');
// EN3 (2026-10-23, owner 19:27 #5): the fade moved to the round's end, after it bled (tests/en3-2026-10-23.js)
ok(/then −1 stack at the round's end/.test(TXm.TEXT['ui.st-bleed']) && /At the end of each round the stack drops by 1, after it has bled; Cleanse removes it/.test(TXm.TEXT['coach.bleeding-this-card-takes-damage-every']) && /then −1 stack at the round's end/.test(TXm.TEXT['ui.ls-bleed']), '13. Bleed\'s fade rule said plainly (each round\'s end, after it bled; Cleanse, not heals)');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')), cp = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'cards', code + '.json'), 'utf8'));
  ok(keys.concat(['ui.st-bleed', 'ui.ls-bleed', 'coach.bleeding-this-card-takes-damage-every']).every(k=> p[TXm.TEXT[k]] || p[TXm.TEXT[k].replace(/^🌸 /, '')] /* a leading emoji is peeled before the lookup */) && p['Sunny'] && cp['Pond Algae'], `13. lang ${code}: the BL texts and the Pond Algae`); });

// ---- 14. docs
const cat = fs.readFileSync(path.join(ROOT, 'docs', 'effects-catalogue.md'), 'utf8'); ok(/2026-10-23 additions \(package BL\)/.test(cat) && /bleedFadeDropVfx/.test(cat) && /bloomCopyVfx/.test(cat), '14. the effects catalogue');
const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8')); const list = Array.isArray(dec) ? dec : (dec.decisions || dec.items || []);
ok(['BL-1', 'BL-2', 'BL-3', 'BL-4', 'BL-5'].every(id=> list.some(d=> d.id === id)), '14. the owner calls BL-1..BL-5 in docs/decisions.json');
ok(/BL \(2026-10-23\)|package BL/.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8').slice(0, 160000)), '14. a CHANGELOG entry at the top'); // 2026-10-23 (RW5): later packages' entries sit above it (was the first 6000 characters); 2026-10-24: 80000 (more packages above); 2026-10-25 (release): 160000 (PL2, PRO3 above)

console.log(fail ? `bl-2026-10-23: ${fail} of ${n} FAILED` : `bl-2026-10-23: all ${n} passed`);
process.exit(fail ? 1 : 0);
