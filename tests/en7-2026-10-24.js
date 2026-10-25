#!/usr/bin/env node
// 2026-10-24 (package EN7, owner 13:12): Dive in two turns (#3), the Guardian's tilt (#4), Poison's pool sinking and the "🤢N" float
// (#6, #7), Parasite x Bloom (#2), Poison / Bleed on a unit's own extra hits and "– poison" / "– bleed" on shots (#5), the keyify clean-up.
//   1. Dive: round 1 aloft / under (no swing; nothing can find or hit it, a Spotter neither; it can't step in as a Guardian), round 2 the
//      strike on the weakest of the row past Taunt (a Guardian beside it still steps in) for + N, Exposed that round (no Flying dodge, no
//      Tide evade); no unit in its row: no rise; a diver that could not strike lands; diveUses; the Tide unit goes under;
//   2. Poison / Bleed ride on Pounce and Ambush (and Fork prongs, as before); a plain Arrow / Missile carries none; "– poison" / "– bleed"
//      (the shot skills and the Arrow / Missile / Deal damage actions) gives the unit's N, at least 1;
//   3. Parasite x Bloom: the copy hooks onto an enemy unit beside the host (none: it waits), or facing a Parasite played as a unit;
//   4. prices (4-round rule), the two Dive cards, texts in the 12 packs, the board's looks (app source), keyify finds nothing new.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-dive': U('x-dive', {flying:true, dive:2}, {attack:3, health:50}), 'x-dive-t': U('x-dive-t', {tide:true, dive:1}, {attack:3, health:50}),
  'x-dive-2x': U('x-dive-2x', {flying:true, dive:1, diveUses:2}, {attack:3, health:50}), 'x-dive-g': U('x-dive-g', {flying:true, dive:1, guardian:true}, {attack:3, health:50}),
  'x-hit': U('x-hit', {}, {attack:2, health:500}), 'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}), 'x-weak': U('x-weak', {}, {attack:0, health:5, wait:9}),
  'x-taunt': U('x-taunt', {taunt:true}, {attack:0, health:40, wait:9}), 'x-guard': U('x-guard', {guardian:true}, {attack:0, health:500, wait:0 /* 2026-10-26 (ENG9, owner EN8-8): a Guardian / Rampart blocks only while Ready, so Wait 0 (0 Attack: it never swings) */}),
  'x-arrow': U('x-arrow', {arrow:2}, {attack:0, health:500}), 'x-spot': U('x-spot', {spotter:true, arrow:2}, {attack:0, health:500}),
  'x-pounce-p': U('x-pounce-p', {pounce:2, poison:2}, {attack:1, health:20, wait:1}), 'x-pounce-b': U('x-pounce-b', {pounce:2, bleed:1}, {attack:1, health:20, wait:1}),
  'x-pounce': U('x-pounce', {pounce:2}, {attack:1, health:20, wait:1}), 'x-amb-p': U('x-amb-p', {ambush:2, poison:1}, {attack:0, health:200, wait:9}),
  'x-fork-p': U('x-fork-p', {fork:true, poison:1}, {attack:2, health:200}),
  'x-arrow-p': U('x-arrow-p', {arrow:2, poison:2}, {attack:0, health:200}), 'x-arrow-tp': U('x-arrow-tp', {arrow:2, arrowPoison:true}, {attack:0, health:200}),
  'x-arrow-tp3': U('x-arrow-tp3', {arrow:2, poison:3, arrowPoison:true}, {attack:0, health:200}), 'x-arrow-tb': U('x-arrow-tb', {arrow:1, arrowBleed:true}, {attack:0, health:200}),
  'x-act-p': U('x-act-p', {triggers:[{on:'perTurn', do:'arrow', amount:1, withPoison:true}]}, {attack:0, health:200}),
  'x-mis-b': U('x-mis-b', {bleed:2, triggers:[{on:'perTurn', do:'missile', amount:1, withBleed:true}]}, {attack:0, health:200}),
  'x-mis': U('x-mis', {poison:2, triggers:[{on:'perTurn', do:'missile', amount:1}]}, {attack:0, health:200}),
  'x-par': U('x-par', {parasite:true}, {attack:2, health:4, wait:0}), 'x-par-bl': U('x-par-bl', {parasite:true, bloomCopy:{when:['day']}}, {attack:1, health:6, wait:0}),
  'x-foe': U('x-foe', {}, {attack:0, health:300, wait:9}), 'x-struct': U('x-struct', {}, {attack:0, health:50, wait:9, archetypes:['Structure']}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:60, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:60, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
let huid = 80000; const give = (P, pid, defId)=>{ const uid = huid++; P[pid].hand.push({uid, defId}); P[pid].lumber = 9; P[pid].playedThisTurn = false; return uid; };
const hitsOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid);

// ---- 1. Dive in two turns ----------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); const F = put(e, P, 2, 'x-hit', 0); const wk = put(e, P, 2, 'x-weak', 1); const hp0 = D.hp;
  let ev = round(e, P, 2); // the enemy acts first: the unit facing it swings before it rises, so the rise is seen mid-round
  const rise = ev.find(x=> x.type === 'diveRise');
  ok(rise && rise.uid === D.uid && rise.mode === 'fly' && D.diveAloft != null && !ev.some(x=> x.type === 'hit' && x.attUid === D.uid), `round 1: it rises (mode ${rise && rise.mode}) instead of swinging`);
  ok(e.diveEligible(D) && D.dived === 1, 'the rise spends its one Dive');
  ev = round(e, P, 2); const ev2 = ev; const at = ev2.findIndex(x=> x.type === 'dive');
  ok(at >= 0 && ev2.slice(0, at).some(x=> x.type === 'evaded' && x.targetUid === D.uid && x.reason === 'aloft') && !ev2.slice(0, at).some(x=> x.type === 'hit' && x.targetUid === D.uid),
    'round 2, before its strike: the swing at it finds nothing (evaded, aloft)');
  const dv = ev2[at], hit = ev2.find(x=> x.type === 'hit' && x.attUid === D.uid);
  ok(dv && dv.strike && dv.targetUid === wk.uid && dv.bonus === 2 && hit && hit.dmg === 5 && hit.dive === 2 && D.diveAloft == null, `round 2: it strikes the weakest of the row for 3 + 2 (${hit && hit.dmg}) and is down again`);
  ok(D.diveExposed === dv && true || D.diveExposed > 0, 'it is Exposed for that round (diveExposed)');
  void F; void hp0; }
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-weak', 1); const S = put(e, P, 2, 'x-spot', 2);
  round(e, P, 1); ok(D.diveAloft != null, 'aloft after its rise');
  const ev = round(e, P, 2); const arrowAt = ev.filter(x=> x.type === 'arrow' && x.uid === S.uid);
  const missAloft = ev.some(x=> x.type === 'evaded' && x.targetUid === D.uid && (x.reason === 'aloft'));
  ok(!hitsOn(ev.slice(0, ev.findIndex(x=> x.type === 'dive')), D.uid).length && (missAloft || !arrowAt.some(x=> x.targetUid === D.uid)), 'a Spotter\'s arrow can\'t find it while it is aloft'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-dive', 0); const T = put(e, P, 2, 'x-taunt', 0); const wk = put(e, P, 2, 'x-weak', 1); const G = put(e, P, 2, 'x-guard', 2);
  round(e, P); const ev = round(e, P); const dv = ev.find(x=> x.type === 'dive'), h = ev.find(x=> x.type === 'hit' && x.dive);
  ok(dv && dv.targetUid === wk.uid && h && h.guardianRedirect && h.targetUid === G.uid, `the strike goes past the Taunt onto the weakest; the Guardian beside it steps in (${h && h.targetDefId})`); void T; }
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive-g', 1); const W = put(e, P, 1, 'x-weak', 0); put(e, P, 2, 'x-hit', 0); put(e, P, 2, 'x-weak', 1);
  round(e, P, 1); ok(D.diveAloft != null, 'a diving Guardian rises');
  const ev = round(e, P, 2); const onW = hitsOn(ev, W.uid)[0];
  ok(onW && !onW.guardianRedirect, 'aloft, it can\'t step in as a Guardian: the ally beside it takes the hit'); }
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'diveRise') && D.diveAloft == null && ev.some(x=> x.type === 'hitHQ' && x.attUid === D.uid), 'no enemy unit in its row: no rise, it swings at the bramble'); }
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); put(e, P, 2, 'x-wall', 0); round(e, P); D.frozen = 2;
  const ev = round(e, P); ok(ev.some(x=> x.type === 'diveLand' && x.uid === D.uid) && D.diveAloft == null && !ev.some(x=> x.type === 'dive'), 'frozen in its strike round: it lands at the round\'s end without striking');
  D.frozen = 0; const ev3 = round(e, P); ok(!ev3.some(x=> x.type === 'diveRise' || x.type === 'dive'), '... and the Dive is spent'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-dive-2x', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-weak', 1); let rises = 0, strikes = 0;
  for(let r = 0; r < 6; r++){ const ev = round(e, P); rises += ev.filter(x=> x.type === 'diveRise').length; strikes += ev.filter(x=> x.type === 'dive').length; }
  ok(rises === 2 && strikes === 2, `diveUses 2: two dives (${rises} rises, ${strikes} strikes)`); }
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive-t', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-weak', 1); const ev = round(e, P);
  const r = ev.find(x=> x.type === 'diveRise'); ok(r && r.mode === 'tide' && D.diveMode === 'tide', 'a Tide unit without wings goes under (mode tide)');
  const ev2 = round(e, P, 2); ok(ev2.some(x=> x.type === 'dive' && x.mode === 'tide'), 'and strikes from under the water'); }
{ let exposed = 0, later = 0;
  for(let s = 1; s <= 40; s++){ const {e, P} = mk(s, {rules:{tideEvade:true, permaTide:true}}); put(e, P, 1, 'x-dive-t', 0); put(e, P, 2, 'x-hit', 0); put(e, P, 2, 'x-weak', 1);
    round(e, P, 1); const r2 = round(e, P, 1); exposed += r2.filter(x=> x.type === 'evaded' && x.targetDefId === 'x-dive-t' && x.reason !== 'aloft' && x.reason !== 'under').length;
    for(let k = 0; k < 3; k++) later += round(e, P, 1).filter(x=> x.type === 'evaded' && x.targetDefId === 'x-dive-t').length; }
  ok(exposed === 0 && later > 10, `the Tide diver is exposed in its strike round: no Tide evade (${exposed}; ${later} evades in 3 later rounds x 40 where the tide test rule is on)`); }

// ---- 2. Poison / Bleed on the unit's own hits; – poison / – bleed ----------------------------------------------------------------
{ const {e, P} = mk(); const T = put(e, P, 2, 'x-foe', 0); const ev = []; e.placeCard(P, so, 1, give(P, 1, 'x-pounce-p'), 0, {}, ev);
  ok(T.poison === 2 && ev.some(x=> x.type === 'statusFx' && x.kind === 'poison' && x.via === 'pounce' && x.amount === 2), `Pounce carries Poison 2 (${T.poison})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'x-foe', 0); e.placeCard(P, so, 1, give(P, 1, 'x-pounce-b'), 0, {}, []); ok(T.bleed === 1, `Pounce carries Bleed 1 (${T.bleed})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'x-foe', 0); e.placeCard(P, so, 1, give(P, 1, 'x-pounce'), 0, {}, []); ok(!(T.poison > 0) && !(T.bleed > 0), 'a Pounce with no Poison / Bleed gives none'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-amb-p', 0); const ev = []; e.placeCard(P, so, 2, give(P, 2, 'x-foe'), 0, {}, ev); const T = all(P[2]).find(c=> c.defId === 'x-foe');
  ok(ev.some(x=> x.type === 'ambush') && T && T.poison === 1, `Ambush carries Poison 1 (${T && T.poison})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-fork-p', 0); const a = put(e, P, 2, 'x-foe', -1), b = put(e, P, 2, 'x-foe', 0); round(e, P); // 2026-10-26 (ENG9, G2): Fork's lines are C and a side now (was L and R)
  ok(a.poison >= 1 && b.poison >= 1, `Fork's two lines both carry Poison (as before: ${a.poison}, ${b.poison})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-arrow-p', 0); const T = put(e, P, 2, 'x-foe', 0); round(e, P); ok(!(T.poison > 0) && T.hp < 300, 'a plain Arrow carries no Poison, even on a Poison unit'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-mis', 0); const T = put(e, P, 2, 'x-foe', 0); round(e, P); ok(!(T.poison > 0), 'a plain Missile carries no Poison'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-arrow-tp', 0); const T = put(e, P, 2, 'x-foe', 0); const ev = round(e, P);
  ok(T.poison === 2 && T.hp === 300 && ev.some(x=> x.type === 'statusFx' && x.kind === 'poison' && x.via === 'shot'), `Arrow 2 – poison with no Poison skill: 2 counters, no damage (2026-10-26, ENG9 #40: status-only) (${T.poison}, ${T.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-arrow-tp3', 0); const T = put(e, P, 2, 'x-foe', 0); round(e, P); ok(T.poison === 2, `Arrow 2 – poison on a Poison 3 unit: the shot's 2 (ENG9: its N in counters) (${T.poison})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-arrow-tb', 0); const T = put(e, P, 2, 'x-foe', 0); round(e, P); ok(T.bleed === 1, `Arrow 1 – bleed: 1 (${T.bleed})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-act-p', 0); const T = put(e, P, 2, 'x-foe', 0); round(e, P); ok(T.poison === 1, `the Arrow action – poison: 1 (${T.poison})`); }
{ let got = 0; for(let s = 1; s <= 6; s++){ const {e, P} = mk(s); put(e, P, 1, 'x-mis-b', 0); const T = put(e, P, 2, 'x-foe', 0); round(e, P); if(T.bleed === 1 && T.hp === 300) got++; }
  ok(got >= 1, `the Missile action 1 – bleed: 1 Bleed and no damage when it hits a unit (ENG9: status-only) (${got} of 6 seeds; it may hit the bramble)`); }

// ---- 3. Parasite x Bloom -----------------------------------------------------------------------------------------------------
{ const {e, P} = mk(1, {rules:{phase:'day'}}); put(e, P, 1, 'x-hit', 0); const host = put(e, P, 2, 'x-foe', 0), L = put(e, P, 2, 'x-foe', -1), far = put(e, P, 2, 'x-foe', 3);
  ok(e.placeCard(P, so, 1, give(P, 1, 'x-par-bl'), 0, {}, [], {parasiteOn: host.uid}) && host.parasite, 'a Parasite with Bloom hooks onto its host');
  const ev = []; e.bloomCopyPass(P, so, {}, ev); const b = ev.find(x=> x.type === 'bloom' && x.parasite), at = ev.find(x=> x.type === 'parasiteAttach' && x.bloom);
  ok(b && at && L.parasite && L.parasite.bloomCopy && L.parasite.atk === 2 && L.parasite.maxHp === 7 && !far.parasite, `its bloom copy (+1/+1) hooks onto the enemy beside the host (${L.parasite && L.parasite.atk}/${L.parasite && L.parasite.maxHp}), not one 3 columns off`);
  ok(!all(P[1]).some(c=> c.bloomCopy), 'no copy grows on your own side'); }
{ const {e, P} = mk(1, {rules:{phase:'day'}}); put(e, P, 1, 'x-hit', 0); const host = put(e, P, 2, 'x-foe', 0), L = put(e, P, 2, 'x-foe', -1), R = put(e, P, 2, 'x-struct', 1);
  e.placeCard(P, so, 1, give(P, 1, 'x-par'), -1, {}, [], {parasiteOn: L.uid}); e.placeCard(P, so, 1, give(P, 1, 'x-par-bl'), 0, {}, [], {parasiteOn: host.uid});
  let ev = []; e.bloomCopyPass(P, so, {}, ev); ok(!ev.some(x=> x.type === 'bloom') && !host.parasite.bloomed, 'beside the host only a unit with a parasite and a Structure: no copy, it waits (call EN7-2)');
  const N = put(e, P, 2, 'x-foe', -2); void N; ev = []; e.bloomCopyPass(P, so, {}, ev); ok(!ev.some(x=> x.type === 'bloom'), 'a unit two columns off the host is not beside it');
  R.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const N2 = put(e, P, 2, 'x-foe', 1); ev = []; e.bloomCopyPass(P, so, {}, ev);
  ok(ev.some(x=> x.type === 'bloom' && x.parasite) && N2.parasite && N2.parasite.bloomCopy, 'once a free enemy unit stands beside it, it blooms onto it'); }
{ const {e, P} = mk(1, {rules:{phase:'day'}}); const Fc = put(e, P, 2, 'x-foe', 1); const pc = put(e, P, 1, 'x-par-bl', 0); const ev = []; e.bloomCopyPass(P, so, {}, ev);
  ok(ev.some(x=> x.type === 'parasiteAttach' && x.bloom && x.targetUid === Fc.uid) && Fc.parasite && !all(P[1]).some(c=> c.bloomCopy), 'a Parasite played as a unit: its copy hooks onto an enemy facing it or one column beside'); void pc; }

// ---- 4. prices, cards, texts, the board --------------------------------------------------------------------------------------
{ if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
  const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(costs);
  const sk = id=> costs.skills.find(r=> r.id === id);
  ok(sk('dive').value === 1.25 && sk('dive').pow === 0.5 && Math.abs(T.skillCost('dive', 2) - 1.77) < 0.01 && T.skillCost('dive', true) === 1.25, `Dive N = 1.25 x N^0.5 (Dive 2: ${T.skillCost('dive', 2)})`);
  const base = {id:'q', attack:1, health:10, rarity:'common', effects:{pounce:2, poison:2}}, noP = {id:'q', attack:1, health:10, rarity:'common', effects:{pounce:2}};
  const sP = T.cardS(base.effects, base).S, s0 = T.cardS(noP.effects, noP).S + T.skillCost('poison', 2);
  ok(Math.abs(sP - (s0 + 0.33 * T.skillCost('poison', 2))) < 0.02, `Pounce + Poison 2 pays 0.33 x Poison's price on top (${sP} vs ${s0})`);
  const at = T.cardS({arrow:2, arrowPoison:true}, {}).S - T.cardS({arrow:2}, {}).S; ok(Math.abs(at - 0.9 * T.skillCost('poison', 1)) < 0.02, `Arrow – poison: 0.9 x Poison 1 (${at})`);
  ok(T.cardS({arrowPoison:true}, {}).S === 0, '– poison without the shot costs nothing');
  const tv = T.actionValue({do:'arrow', amount:1, withPoison:true}, {effects:{}}).value - T.actionValue({do:'arrow', amount:1}, {effects:{}}).value; ok(tv > 1.2 && tv < 1.3, `the Arrow action – poison: + 0.9 x the Poison action (${tv})`);
  ok(T.cardS({dive:1, diveUses:2}, {}).S === 2.5, 'diveUses 2: Dive\'s price twice');
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = id=> cards.find(c=> c.id === id);
  const pf = by('puffin-diver'), hs = by('harbor-seal');
  ok(pf.effects.dive === 2 && pf.effects.flying && pf.attack === 2 && pf.health === 5 && T.budget(pf).ok, 'Puffin Diver: Dive 2 (a Flyer: aloft), 2/5, in its budget');
  ok(hs.effects.dive === 2 && hs.effects.tide && !hs.effects.flying && hs.attack === 1 && hs.health === 9 && T.budget(hs).ok, 'Harbor Seal: Dive 2 (Tide: under), 1/9, in its budget');
  ok(pf.source && hs.source, 'both are already placed (no new source)'); }
{ const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT; const strip = s=> String(s).replace(/^[\p{Extended_Pictographic}✀-➿️‍\s]+/u, '');
  const keys = Object.keys(TXT).filter(k=> (/^ui\.(en7-|skn-(arrow|fire-arrow|fire-bolt)-(poison|bleed)|sk-shot-(poison|bleed|tip-codex))/.test(k) || k === 'ui.sk-dive' || k === 'ui.sk-dive-codex') && !/en7-float-(poison|bleed|exposed)/.test(k)); // the number floats need no row; Exposed is the status's own word
  ok(keys.length >= 20, `the package's texts are keyed (${keys.length})`);
  ok(/a turn out of reach, then strikes/i.test(TXT['ui.sk-dive']) && /Turn 1: .*Turn 2: /.test(TXT['ui.sk-dive-codex']) && TXT['ui.sk-dive'].split(/\s+/).length < 20, 'the Dive text tells the two turns (short; the Codex has the rest)');
  ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const p = Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')));
    const miss = keys.filter(k=> !p[strip(TXT[k])] && !p[TXT[k]]); ok(!miss.length, `${c}: every EN7 text translated (${miss.slice(0, 3)})`); }); }
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), fxd = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-d.js'), 'utf8');
  ["ev.type === 'diveRise'", "ev.type === 'diveLand'", 'en7-aloft', 'en7-under', 'function en7Vfx', "TX('ui.en7-float-poison'", "TX('ui.en7-float-bleed'", 'en2GuardStepIn.lastTilt', 'EN7_TIP_APP', "['withPoison', 'withBleed'].forEach(f=>{ const x = row.querySelector", 'diveAloft: c.diveAloft'].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  ok(!app.includes("floatText(el, '🤢 +1☠'") && !app.includes("floatText(el, '+'+ev.amount+'☠', 'poison')"), 'the applied-Poison floats are "🤢N" (no 🤢 💀 +N)');
  ok(fxd.includes('psnSink') && fxd.includes('M.poisonSink'), 'bramblewood-fx-d.js: the pool sinks as it fades (psnSink)');
  const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT; ok(TXT['ui.en7-float-poison'] === '☠{n}' /* 2026-10-25 (PL2, owner 00:02 #4): ☠N, was 🤢N */ && !/\+/.test(TXT['ui.en7-float-bleed']), 'the floats: "☠{n}", Bleed without a plus');
  const html = fs.existsSync(path.join(ROOT, 'index.html')) ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') : ''; ok(html.includes('function en7Vfx') && html.includes('en7DiveRise'), 'the build carries the package (index.html)'); }
{ const out = cp.execFileSync('python3', [path.join(ROOT, 'tools', 'text', 'keyify.py'), '--dry-run'], {cwd: ROOT, encoding: 'utf8'});
  ok(/0 literal edits, 0 new keys/.test(out), `keyify finds nothing to key (the RW6 note is out of the results template): ${out.trim()}`);
  const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'); ok(!app.includes('}).join(\'\')}/* 2026-10-24 (RW6'), 'the RW6 note no longer sits inside the template'); }

console.log(`en7-2026-10-24: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
