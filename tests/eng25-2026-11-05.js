#!/usr/bin/env node
// Package ENG25 (2026-11-05, owner notes 23:35):
//   1. skill categories: Evergreen keeps only field- / board-wide skills (ENG25_EVERGREEN); Tide is a passive;
//   2. duplicates: Midas Touch reads as Felling, Puncture as Breach (cards migrated); a skill and its braced form are one "+ Add Skill" entry;
//   3. Hatchling and Regeneration are Level 1+ (a Level 0 copy has neither; the Baby cards' Hatchling is in levelSkills "1");
//   4. Berries: a full basket of 3 heals 3; Foraging N gathers N a turn;  6. the Forage N action;
//   5. Immortal (a token copy, Wait 1; a copy that dies in its first round stays dead) and Hydra (two halved copies, never in its own slot);
//   7. the state skills' chips light while on (en5On / ctxOn); 8. <Tribe> Delivery {Resource}, Bee Drone's Bee Delivery { Lumber };
//   9. Moonpull: while it lives your Tide bonuses double; 10. Tide N.
//   node tests/eng25-2026-11-05.js
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, E = H.Engine;
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).map(c=> require('../bramblewood-skillparams.js').expandDef(c)) /* ENG39 (2026-11-09): kinds read as their old keys (Breach is Puncture {kind: breach}) */, byId = Object.fromEntries(cards.map(c=> [c.id, c]));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const so = id=> id === 1 ? 'A' : 'B';
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const X = (extra, seed)=>{ const defs = Object.assign({}, H.loadCardDefs(), extra); const e = E.makeSimEngine(defs, E.mulberry32(seed || 25), {recordEvents:true, battleMode:'open'}); return {e, defs, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
// one round as the game plays it: the round's start (the turn counter, the tide), combat, the upkeep
const R = (e, P, r, ev)=>{ ev = ev || []; e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev, r % 2 ? 2 : 1); e.endOfRoundUpkeep(P, so, {}, ev); return ev; };
const unit = (id, a, h, fx, more)=> Object.assign({id, name:id, attack:a, health:h, wait:0, cost:0, effects:fx || {}}, more || {});

// ---- 5. Immortal
{
  const {e, P} = X({'e25-imm': unit('e25-imm', 2, 5, {immortal:true}), 'e25-hit': unit('e25-hit', 9, 90)});
  e.debugSpawnCard(P, so, 1, 'e25-imm', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'e25-hit', 'center', {}, []);
  const ev = []; e.roundStart(P, 1, so, {}, ev); e.resolveCombat(P, so, {}, ev, 2);
  const back = all(P[1]).filter(c=> c.hp > 0);
  ok(back.length === 1 && /~immortal$/.test(back[0].defId) && back[0].hp === 5 && back[0].wait === 1, `Immortal: a token copy back at full Health, Waiting (${back.map(c=> c.defId + ' ' + c.hp + ' w' + c.wait)})`);
  ok(ev.some(x=> x.type === 'spawn' && x.kind === 'immortal'), 'Immortal: a spawn event, kind immortal');
  const tok = back[0];
  // dies again in the same round it came back: it stays dead
  const ev2 = []; tok.hp = 0; e.removeDeadCards(P, so, {}, {}, ev2);
  ok(!all(P[1]).some(c=> c.hp > 0) && !ev2.some(x=> x.type === 'spawn'), 'Immortal: a copy that dies in the round it came back stays dead');
  // a later round: the copy comes back again (the fight's round cap ends it)
  const {e: e2, P: P2} = X({'e25-imm': unit('e25-imm', 2, 5, {immortal:true}), 'e25-hit': unit('e25-hit', 9, 90)});
  e2.debugSpawnCard(P2, so, 1, 'e25-imm', 'center', {}, []); e2.debugSpawnCard(P2, so, 2, 'e25-hit', 'center', {}, []);
  let backs = 0; for(let r = 1; r <= 6; r++){ backs += R(e2, P2, r).filter(x=> x.type === 'spawn' && x.kind === 'immortal').length; }
  ok(backs >= 2, `Immortal: it keeps coming back in later rounds (${backs} returns in 6 rounds)`);
}
// ---- 5. Hydra
{
  const {e, P} = X({'e25-hyd': unit('e25-hyd', 5, 8, {hydra:true}), 'e25-hit': unit('e25-hit', 20, 900)});
  e.debugSpawnCard(P, so, 1, 'e25-hyd', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'e25-hit', 'center', {}, []);
  const s0 = all(P[1])[0].slot; const ev = []; e.roundStart(P, 1, so, {}, ev); e.resolveCombat(P, so, {}, ev, 2);
  const heads = all(P[1]).filter(c=> c.hp > 0);
  ok(heads.length === 2 && heads.every(c=> c.atk === 3 && c.maxHp === 4), `Hydra: two copies at 3/4 (5/8 halved, rounded up) (${heads.map(c=> c.atk + '/' + c.maxHp)})`);
  ok(heads.every(c=> c.slot !== s0), `Hydra: never in its own slot (${s0}; copies at ${heads.map(c=> c.slot)})`);
  ok(ev.some(x=> x.type === 'spawn' && x.kind === 'hydra' && x.count === 2), 'Hydra: one spawn event, kind hydra, 2 copies');
  // the halving rule: Attack 1 -> 0; Health 1 makes none
  const {e: e2, P: P2} = X({'e25-h1': unit('e25-h1', 1, 6, {hydra:true}), 'e25-hN': unit('e25-hN', 4, 1, {hydra:true}), 'e25-hit': unit('e25-hit', 20, 900)});
  e2.debugSpawnCard(P2, so, 1, 'e25-h1', 'center', {}, []); e2.debugSpawnCard(P2, so, 2, 'e25-hit', 'center', {}, []);
  e2.roundStart(P2, 1, so, {}, []); e2.resolveCombat(P2, so, {}, [], 2);
  const h1 = all(P2[1]).filter(c=> c.hp > 0); ok(h1.length === 2 && h1.every(c=> c.atk === 0 && c.maxHp === 3), `Hydra 1/6: copies 0/3 (${h1.map(c=> c.atk + '/' + c.maxHp)})`);
  const {e: e3, P: P3} = X({'e25-hN': unit('e25-hN', 4, 1, {hydra:true}), 'e25-hit': unit('e25-hit', 20, 900)});
  e3.debugSpawnCard(P3, so, 1, 'e25-hN', 'center', {}, []); e3.debugSpawnCard(P3, so, 2, 'e25-hit', 'center', {}, []);
  e3.roundStart(P3, 1, so, {}, []); e3.resolveCombat(P3, so, {}, [], 2); ok(!all(P3[1]).some(c=> c.hp > 0), 'Hydra 4/1: Health 1 makes no copies');
  // a line always ends: 9 Health halves to 5, 3, 2, 1 and stops (every head killed at once, again and again)
  const {e: e4, P: P4} = X({'e25-h9': unit('e25-h9', 2, 9, {hydra:true})});
  e4.debugSpawnCard(P4, so, 1, 'e25-h9', 'center', {}, []); e4.roundStart(P4, 1, so, {}, []);
  let waves = 0, made = 0; for(; waves < 12 && all(P4[1]).some(c=> c.hp > 0); waves++){ all(P4[1]).forEach(c=>{ c.hp = 0; }); const ev = []; e4.removeDeadCards(P4, so, {}, {}, ev); made += ev.filter(x=> x.type === 'spawn' && x.kind === 'hydra').reduce((a, x)=> a + x.count, 0); }
  ok(!all(P4[1]).some(c=> c.hp > 0) && waves <= 6, `Hydra: a line of heads ends (${waves} waves of deaths, ${made} copies made)`);
}
// ---- 10. Tide N and 9. Moonpull's aura (the engine's armour reading through the tide)
{
  const {e, P} = X({'e25-t1': unit('e25-t1', 2, 30, {tide:true}), 'e25-t2': unit('e25-t2', 2, 30, {tide:2}), 'e25-mp': unit('e25-mp', 1, 30, {moonpull:true, tide:true}),
    'e25-tg': unit('e25-tg', 2, 30, {tide:2, tideGrant:{flood:{attack:1}, ebb:{armor:2}}})});
  ok(typeof e.tideAtk === 'function' || /function tideAtk\(card\)\{ if\(!isTide\(card\)\) return 0; if\(supremeTideOf\(card\)\) return \(leyZeit \? 3 : 2\) \* tideMultOf\(card\)/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')), 'Tide N: tideAtk multiplies by tideMultOf');
  const eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/function tideNOf\(card\)/.test(eng) && /function moonpullAuraOn\(card\)/.test(eng) && /tideScaleGrant\(e\.tideGrant\.flood, tm\)/.test(eng), 'Tide N and Moonpull: tideNOf, the Moonpull aura, the braced facets scaled');
  // a fight on a Tide field: Tide 2 swings for 2 more on a Flood than Tide 1
  const rules = {tide:true};
  const fight = (fx, withMp)=>{ const defs = Object.assign({}, H.loadCardDefs(), {'e25-u': unit('e25-u', 3, 50, fx), 'e25-mp': unit('e25-mp', 0, 50, {moonpull:true}), 'e25-w': unit('e25-w', 0, 500)});
    const en = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open', rules}); const PP = {1: en.newPlayer(1, {}), 2: en.newPlayer(2, {})};
    en.debugSpawnCard(PP, so, 1, 'e25-u', 'center', {}, []); if(withMp) en.debugSpawnCard(PP, so, 1, 'e25-mp', 'left', {}, []); en.debugSpawnCard(PP, so, 2, 'e25-w', 'center', {}, []);
    const out = []; for(let rr = 1; rr <= 3; rr++){ const ev = R(en, PP, rr); const u = all(PP[1]).find(c=> c.defId.startsWith('e25-u')); out.push(ev.filter(x=> x.type === 'hit' && u && x.attUid === u.uid).map(x=> x.dmg).reduce((a, b)=> a + b, 0)); }
    return out; };
  const t1 = fight({tide:true}), t2 = fight({tide:2}), mp = fight({tide:true}, true);
  ok(Math.max(...t2) - Math.max(...t1) === 1 && Math.max(...t1) === 4, `Tide 2 on a Flood: +2 Attack where Tide 1 gives +1 (Tide 1 hits ${t1}, Tide 2 ${t2})`);
  ok(Math.max(...mp) === Math.max(...t2), `Moonpull beside it: Tide 1 counts double (+2) (${mp})`);
}
// ---- 8. Tribe Delivery
{
  const {e, P} = X({'e25-drone': unit('e25-drone', 0, 3, {tribeDelivery:'Bee'}, {archetypes:['Bee']}), 'e25-bee': unit('e25-bee', 1, 1, {}, {archetypes:['Bee']}), 'e25-cat': unit('e25-cat', 1, 1, {}, {archetypes:['Cat']})});
  e.debugSpawnCard(P, so, 1, 'e25-drone', 'center', {}, []); const l0 = P[1].lumber || 0;
  const t = e.trigsOf({effects:{tribeDelivery:'Bee'}}).find(x=> x.keyword === 'tribeDelivery');
  ok(t && t.on === 'onAllyPlayed' && t.do === 'gain' && t.resource === 'lumber' && t.amount === 1 && t.filterArchetype === 'Bee', `Tribe Delivery: On Ally Played (Bee), gain 1 Lumber (${JSON.stringify(t)})`);
  const t2 = e.trigsOf({effects:{tribeDelivery:'Otter', tribeDeliveryRes:'stone'}}).find(x=> x.keyword === 'tribeDelivery');
  ok(t2 && t2.filterArchetype === 'Otter' && t2.resource === 'stone', 'Otter Delivery { Stone }: the tribe and the resource are the card\'s');
  ok(/if\(e\.tribeDelivery\)\{ const tr = /.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')), 'Tribe Delivery: an On Ally Played gain with the tribe filter (en8Trigs)');
  const bd = byId['bee-drone']; ok(bd && bd.effects.tribeDelivery === 'Bee' && bd.attack === 0 && bd.health === 6, 'Bee Drone: Bee Delivery { Lumber }, the owner\'s live 0/6 (folded in by CONTENT12, 2026-11-06)');
}
// ---- 4. Berries and 6. Forage
{
  const eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/foragingN: 1, foragingBerries: 3, foragingGather: 1, berryHeal: 3/.test(eng), 'Berries: a basket of 3 heals 3; Foraging N gathers N');
  ok(/case 'forage': \{/.test(eng) && /ACTION_KEYS\.push\('forage'\)/.test(eng), 'the Forage action is in the engine');
  const {e, P} = X({'e25-fg': unit('e25-fg', 0, 20, {triggers:[{on:'perTurn', do:'forage', amount:3}]}), 'e25-hurt': unit('e25-hurt', 0, 20)});
  e.debugSpawnCard(P, so, 1, 'e25-fg', 'center', {}, []); e.debugSpawnCard(P, so, 1, 'e25-hurt', 'left', {}, []);
  const hurt = all(P[1]).find(c=> c.defId === 'e25-hurt'); hurt.hp = 10; const ev = [];
  R(e, P, 1, ev);
  const fg = all(P[1]).find(c=> c.defId === 'e25-fg');
  ok(hurt.hp === 13 && (fg.sk2Berries || 0) === 0, `Forage 3 on a turn: a full basket, eaten, heals the hurt ally 3 (${hurt.hp}, Berries left ${fg.sk2Berries})`);
}
// ---- 2. duplicates in the cards and the engine
{
  const has = k=> cards.filter(c=> c.effects && c.effects[k] != null).map(c=> c.id);
  ok(!has('midas').length && !has('puncture').length, `no card carries Midas Touch or Puncture (${has('midas')} ${has('puncture')})`);
  ok(byId['golden-magpie'].effects.felling === 2 && byId['magnate-duck'].effects.felling === 3 && byId['sawfish'].effects.breach === 2, 'Midas Touch -> Felling, Puncture -> Breach, same numbers');
  // the old keys still play the same rule
  const {e, P} = X({'e25-pn': unit('e25-pn', 2, 50, {puncture:2}), 'e25-br': unit('e25-br', 2, 50, {breach:2}), 'e25-w': unit('e25-w', 0, 500)});
  const run = id=>{ const {e: en, P: PP} = X({'e25-pn': unit('e25-pn', 2, 50, {puncture:2}), 'e25-br': unit('e25-br', 2, 50, {breach:2}), 'e25-w': unit('e25-w', 0, 500)}, 7);
    en.debugSpawnCard(PP, so, 1, id, 'center', {}, []); en.debugSpawnCard(PP, so, 2, 'e25-w', 'center', {}, []); const h0 = PP[2].hq.hp; en.resolveCombat(PP, so, {}, [], 1); return h0 - PP[2].hq.hp; };
  ok(run('e25-pn') === run('e25-br') && run('e25-br') === 2, `an old Puncture 2 card hits the bramble as Breach 2 does (${run('e25-pn')} / ${run('e25-br')})`);
  ok(/sk1Patch\(PASSIVE_DEFS, 'midas', \{hidden:true, retired:true\}\)/.test(src) && /sk1Patch\(PASSIVE_DEFS, 'puncture', \{hidden:true, retired:true\}\)/.test(src), 'Midas Touch and Puncture leave "+ Add Skill"');
  ok(/ZEIT_TWIN\[plain\] = d\.key; ZEIT_TWIN_BACK\[d\.key\] = plain;/.test(src), 'a skill and its braced form are one "+ Add Skill" entry');
}
// ---- 1. categories
{
  ok(/const ENG25_EVERGREEN = new Set\(\['converge', 'moonpull', 'earthquake', 'tornado', 'avalanche', 'tsunami', 'absoluteZero', 'poisonGas', 'rainmaker', 'nova', 'volley', 'fieldBreaker', 'warcry'\]\);/.test(src), 'Evergreen keeps the 13 field- / board-wide skills');
  ok(/\{key:'tide', category:'passive'/.test(src), 'Tide is a passive');
}
// ---- 3. Level 1+
{
  const babies = cards.filter(c=> c.kind === 'baby' && !c.token && c.id !== 'duckling'); // 2026-11-06 (CONTENT12): the owner's live Duckling has Diurnal 1 at Level 1, no Hatchling
  ok(babies.length >= 20 && babies.every(c=> c.levelSkills && c.levelSkills['1'] && c.levelSkills['1'].hatchling && !(c.levelSkills['0'] && c.levelSkills['0'].hatchling)), `every Baby card's Hatchling is at Level 1 (${babies.length} cards)`);
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
  const fx = new Function(B.grab('effectsAtLevel') + '\nreturn effectsAtLevel;')();
  ok(!('hatchling' in fx(byId['fox-kit'], 0)) && fx(byId['fox-kit'], 1).hatchling === true, 'Fox Kit: no Hatchling at Level 0, Hatchling at Level 1');
  const regenCard = cards.find(c=> c.effects && c.effects.regen && !c.levelSkills);
  ok(regenCard && !('regen' in fx(regenCard, 0)) && fx(regenCard, 1).regen === regenCard.effects.regen, `Regeneration: off on a Level 0 copy, on at Level 1 (${regenCard && regenCard.id})`);
}
// ---- 7. the lit chips
{
  ok(/const ENG25_STATE_CHIPS = new Set\(\['timbered', 'bedrock', 'forged', 'lastStand'/.test(src) && /if\(bopts && bopts\.live && typeof ENG25_STATE_CHIPS !== 'undefined' && ENG25_STATE_CHIPS\.has\(k\)\)/.test(src), 'state skill chips light from en5On / ctxOn');
  ok(/\.ab-sk\.zeit-live:not\(\[data-sk="diurnal"\]\):not\(\[data-sk="nocturnal"\]\)\{background:rgba\(240,190,70/.test(tpl), 'the lit look (gold)');
  ok(/c\._ctxOn = ctx25\.join\(','\);/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')), 'the engine lists Loyal / Usurper / Liege when on (c._ctxOn)');
}
// ---- prices and texts
{
  const C = id=> (costs.skills || []).find(s=> s.id === id);
  ['immortal', 'hydra', 'tribeDeliveryRes'].forEach(k=> ok(!!C(k), `canonical/skill-costs.json prices ${k}`));
  ok(costs.shorthands && costs.shorthands.tribeDelivery && costs.shorthands.tribeDelivery.trigger === 'onAllyPlayed', 'Tribe Delivery is priced as On Ally Played x Gain (a shorthand)');
  ok(C('tide') && C('tide').scale === 'n', 'Tide is priced per N');
  ok((costs.actions || []).some(a=> a.id === 'forage'), 'the Forage action is priced');
  const pks = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].map(c=> JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')));
  const TEXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
  ['ui.eng25-tide', 'ui.eng25-moonpull', 'ui.eng25-immortal', 'ui.eng25-hydra', 'ui.eng25-tribe-delivery', 'ui.eng25-act-forage-desc', 'ui.eng25-foraging', 'ui.sk-hatchling'].forEach(k=>{
    ok(TEXT[k] && pks.every(p=> p[TEXT[k]]), `12 packs translate ${k}`);
    ok(TEXT[k] && TEXT[k].split(/\s+/).length <= 15, `${k} is under 15 words (${TEXT[k] && TEXT[k].split(/\s+/).length})`); });
}
console.log(`eng25: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
