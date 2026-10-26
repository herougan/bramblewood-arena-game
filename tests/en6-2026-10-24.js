#!/usr/bin/env node
// 2026-10-24 (package EN6): the owner's 03:17 notes, all approved at 12:02 #11, and 12:02 #5 (Bounty).
//   The hand states (Plenty / Scarcity / Foe's Plenty / Foe's Scarcity), Heat / Frost, the weather states (Rain, Storm, Fog, Salt, Drought),
//   Season (X) and the Seasons field option, Full Hand / Lean N (and the Foe's), Hibernate N, "– bramble" on the shots and the Arrow / Missile /
//   Deal damage actions; their prices (the 4-round rule x the measured uptime); the thematic cards and the Bounty clean-up; the page's
//   registry, texts in the 12 packs, docs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT;
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:2, health:10, wait:9, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}), 'x-hit': U('x-hit', {}, {attack:1, health:100, wait:0}),
  'x-plenty': U('x-plenty', {plenty:true}), 'x-scar': U('x-scar', {scarcity:true}), 'x-fplenty': U('x-fplenty', {foePlenty:true}), 'x-fscar': U('x-fscar', {foeScarcity:true}),
  'x-plentyg': U('x-plentyg', {plenty:true, plentyGrant:{thorns:2}}),
  'x-heat': U('x-heat', {heat:true}), 'x-frost': U('x-frost', {frost:true}), 'x-rain': U('x-rain', {rain:true}), 'x-storm': U('x-storm', {storm:true}),
  'x-fog': U('x-fog', {fog:true}), 'x-salt': U('x-salt', {salt:true}), 'x-drought': U('x-drought', {drought:true}),
  'x-winter': U('x-winter', {season:'winter'}), 'x-summerg': U('x-summerg', {season:'summer', seasonGrant:{armor:3}}),
  'x-fh': U('x-fh', {fullHand:2}), 'x-lean': U('x-lean', {lean:1}), 'x-ffh': U('x-ffh', {foeFullHand:1}), 'x-flean': U('x-flean', {foeLean:1}),
  'x-hib': U('x-hib', {hibernate:true}, {attack:3, health:20, wait:0}), 'x-hibtaunt': U('x-hibtaunt', {hibernate:3, taunt:true}, {attack:0, health:50, wait:9}),
  'x-arrowb': U('x-arrowb', {arrow:3, arrowBramble:true}, {attack:0, health:50, wait:0}), 'x-arrow': U('x-arrow', {arrow:3}, {attack:0, health:50, wait:0}),
  'x-fboltb': U('x-fboltb', {fireBolt:2, fireBoltBramble:true}, {attack:0, health:50, wait:0}),
  'x-tarrow': U('x-tarrow', {triggers:[{on:'onSpawn', do:'arrow', amount:4, bramble:true}]}, {attack:0, wait:0}),
  'x-tmis': U('x-tmis', {triggers:[{on:'onSpawn', do:'missile', amount:5, bramble:true}]}, {attack:0, wait:0}),
  'x-tdmg': U('x-tdmg', {triggers:[{on:'onSpawn', do:'damage', amount:6, who:'enemy', sub:'adjacent', bramble:true}]}, {attack:0, wait:0}),
  'x-tdmg0': U('x-tdmg0', {triggers:[{on:'onSpawn', do:'damage', amount:6, who:'enemy', sub:'adjacent'}]}, {attack:0, wait:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:30, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:30, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const ev = []; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot || 0;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); c._spawnEv = ev; return c; }
const hand = k=> Array.from({length:k}, ()=> ({defId:'x-wall'}));
const sync = (e, P)=>{ const ev = []; e.syncPhaseStats(P, so, ev); return ev; };
const stat = c=> `${c.atk}/${c.maxHp}`;

// ---- the hand states ---------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const c = put(e, P, 1, 'x-plenty'); P[1].hand = hand(3); sync(e, P); ok(c.maxHp === 10 && !c._en5On, `Plenty off at 3 cards (${stat(c)})`);
  P[1].hand = hand(4); const ev = sync(e, P); const on = ev.find(x=> x.kind === 'stateSkill');
  ok(c.maxHp === 11 && (c.phaseAtk|0) === 1 && on && on.name === 'plenty' && on.on === true, `Plenty on at 4 cards: +1/+1 (${c.phaseAtk}, ${c.maxHp}; ${on && on.name})`);
  P[1].hand = hand(2); const ev2 = sync(e, P); ok(c.maxHp === 10 && ev2.some(x=> x.kind === 'stateSkill' && x.name === 'plenty' && x.on === false), 'and off again as the hand shrinks'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'x-plentyg'); P[1].hand = hand(5); sync(e, P); ok((e.effectsOf(c).thorns|0) === 2 && c.maxHp === 10, `Plenty – {Thorns 2}: its braces instead of the default (thorns ${e.effectsOf(c).thorns})`); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'x-scar'); P[1].hand = hand(2); sync(e, P); ok(!(c.phaseAtk > 0), 'Scarcity off at 2 cards');
  P[1].hand = hand(1); sync(e, P); ok((c.phaseAtk|0) === 1 && c.maxHp === 10, `Scarcity on at 1 card: +1/+0 (${c.phaseAtk})`); P[1].hand = []; sync(e, P); ok((c.phaseAtk|0) === 1, 'and with none'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-fplenty'), b = put(e, P, 1, 'x-fscar', 1); P[1].hand = hand(5); P[2].hand = hand(4); sync(e, P);
  ok(a.maxHp === 12 && !(b.phaseAtk > 0), `Foe's Plenty reads the opponent's hand: +0/+2 (${stat(a)}); Foe's Scarcity off`);
  P[2].hand = hand(1); sync(e, P); ok(a.maxHp === 10 && (b.phaseAtk|0) === 1, `Foe's Scarcity on at the opponent's 1 card (${b.phaseAtk})`); }
// ---- Full Hand / Lean -----------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const fh = put(e, P, 1, 'x-fh'), ln = put(e, P, 1, 'x-lean', 1), ffh = put(e, P, 1, 'x-ffh', -1), fl = put(e, P, 1, 'x-flean', 2);
  P[1].hand = hand(3); P[2].hand = hand(1); sync(e, P);
  ok((fh.phaseAtk|0) === 6 && (ln.phaseAtk|0) === 2 && (ffh.phaseAtk|0) === 1 && (fl.phaseAtk|0) === 4, `Full Hand 2 +6 at 3 cards, Lean 1 +2, Foe's Full Hand 1 +1, Foe's Lean 1 +4 (${fh.phaseAtk}, ${ln.phaseAtk}, ${ffh.phaseAtk}, ${fl.phaseAtk})`);
  P[1].hand = []; sync(e, P); ok((fh.phaseAtk|0) === 0 && (ln.phaseAtk|0) === 5, `an empty hand: Full Hand 0, Lean +5 (${fh.phaseAtk}, ${ln.phaseAtk})`); }
// ---- heat, frost, weather ---------------------------------------------------------------------------------------------------------
function stateOn(rules, id, k, rounds){ const {e, P} = mk(rules); const c = put(e, P, 1, id); for(let r = 2; r <= (rounds || 1); r++) e.roundStart(P, r, so, {}, []); sync(e, P); return {on: String(c._en5On || '').split(',').includes(k), c, e}; }
{ ok(stateOn({field:'heatwave'}, 'x-heat', 'heat').on && stateOn({hotMap:true}, 'x-heat', 'heat').on && stateOn({wildfire:true}, 'x-heat', 'heat').on && stateOn({eruption:2}, 'x-heat', 'heat').on, 'Heat: Scorching, a hot map, Wildfire, the volcano');
  ok(!stateOn({}, 'x-heat', 'heat').on && !stateOn({coldMap:true}, 'x-heat', 'heat').on, 'Heat off in the open and in the cold');
  const h = stateOn({hotMap:true}, 'x-heat', 'heat'); ok((h.c.phaseAtk|0) === 1, `plain Heat +1/+0 (${h.c.phaseAtk})`); }
{ ok(stateOn({field:'frozen'}, 'x-frost', 'frost').on && stateOn({coldMap:true}, 'x-frost', 'frost').on && stateOn({hail:true}, 'x-frost', 'frost').on && stateOn({freezing:true}, 'x-frost', 'frost').on, 'Frost: Frigid, a cold map, Hail, Freezing');
  ok(!stateOn({hotMap:true}, 'x-frost', 'frost').on, 'Frost off on a hot map'); ok(stateOn({coldMap:true}, 'x-frost', 'frost').c.maxHp === 12, 'plain Frost +0/+2'); }
{ ok(stateOn({field:'rain'}, 'x-rain', 'rain').on && stateOn({thunderstorm:true}, 'x-rain', 'rain').on && !stateOn({}, 'x-rain', 'rain').on, 'Rain: Spring Rain or a Thunderstorm');
  ok(stateOn({thunderstorm:true}, 'x-storm', 'storm').on && !stateOn({field:'rain'}, 'x-storm', 'storm').on, 'Storm: a Thunderstorm (not plain rain)');
  let windy = 0; for(let r = 2; r <= 9; r++){ const {e, P} = mk({wind:'windy'}, r); const c = put(e, P, 1, 'x-storm'); e.roundStart(P, 2, so, {}, []); sync(e, P); if(String(c._en5On).includes('storm') === e.isWindy() && e.isWindy()) windy++; }
  ok(windy > 0, `Storm follows the strong-wind rounds (${windy} windy rounds had it on)`);
  ok(stateOn({field:'fog'}, 'x-fog', 'fog').on && stateOn({misty:true}, 'x-fog', 'fog').on && !stateOn({}, 'x-fog', 'fog').on, 'Fog: Thick Fog or the Mist');
  const f = stateOn({misty:true}, 'x-fog', 'fog'); ok(!!f.e.effectsOf(f.c).evasive, 'plain Fog gives Evasive'); }
{ const {e, P} = mk({saltMap:true, tide:true}); const c = put(e, P, 1, 'x-salt'); const seen = [];
  for(let r = 2; r <= 7; r++){ e.roundStart(P, r, so, {}, []); sync(e, P); seen.push((e.getTide() || '-') + ':' + (String(c._en5On).includes('salt') ? 'S' : '')); }
  ok(seen.every(s=> s.startsWith('ebb') === s.endsWith('S')) && seen.some(s=> s.endsWith('S')), `Salt holds exactly on the Ebb rounds of a salt-water map (${seen.join(' ')})`);
  ok(!stateOn({tide:true}, 'x-salt', 'salt', 5).on && !stateOn({saltMap:true, permaTide:true}, 'x-salt', 'salt', 5).on && !stateOn({saltMap:true}, 'x-salt', 'salt', 5).on, 'no Salt off a salt map, under Perma-tide, or with no tide'); }
{ const dr = rules=>{ const {e, P} = mk(rules); const c = put(e, P, 1, 'x-drought'); const out = []; for(let r = 2; r <= 6; r++){ e.roundStart(P, r, so, {}, []); sync(e, P); out.push(String(c._en5On).includes('drought') ? 1 : 0); } return out.join(''); };
  ok(dr({weatherMap:true}) === '00111', `Drought from the 4th dry round on a weather map (${dr({weatherMap:true})})`);
  ok(dr({}) === '00000' && dr({weatherMap:true, wet:true}) === '00000', 'no Drought without weather, or on a wet map');
  ok(dr({weatherMap:true, field:'rain'}) === '00000', 'no Drought while it rains'); }
// ---- seasons ------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk({seasons:3} /* 2026-10-26 (ENG9, EN6-4): a plain cycle is 6 rounds now; 3 checks the turning in 12 rounds */); const w = put(e, P, 1, 'x-winter'), s = put(e, P, 1, 'x-summerg', 1); const seq = [], evs = [];
  for(let r = 2; r <= 13; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); sync(e, P); seq.push(e.en6Season()[0] + (String(w._en5On).includes('season') ? 'W' : '') + (String(s._en5On).includes('season') ? 'S' : '')); ev.filter(x=> x.type === 'season').forEach(x=> evs.push(x.season)); }
  ok(seq.join(' ') === 's s s sS sS sS a a a wW wW wW', `the cycle, 3 rounds a season from round 1 (ENG9: the first season is no longer a round short); Season(Winter) on in Winter, Season(Summer) in Summer (${seq.join(' ')})`);
  ok(evs.join(',') === 'summer,autumn,winter', `a 'season' event as it turns (${evs.join(',')})`);
  ok((e.effectsOf(s).armor|0) === 0, 'Season(Summer) – {Armor 3} off out of season');
  const m2 = mk({seasons:3}); for(let r = 2; r <= 5; r++) m2.e.roundStart(m2.P, r, so, {}, []); ok(m2.e.en6Season() === 'summer' && m2.e.en6Hot() && !m2.e.en6Cold(), 'Summer is hot');
  const m3 = mk({seasons:2, seasonStart:'winter'}); ok(m3.e.en6Season() === 'winter' && m3.e.en6Cold() && m3.e.en6HibernateCond(), 'a fight can start in Winter (rules.seasonStart): cold, and Hibernate sleeps');
  ok(mk({}).e.en6Season() === null && !stateOn({}, 'x-winter', 'season').on, 'no cycle (the default): no season, Season skills off'); }
// ---- Hibernate -----------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk({field:'frozen'}); const c = put(e, P, 1, 'x-hib'); put(e, P, 2, 'x-wall');
  ok(c.hibernating === true && c.asleep >= 1, 'Hibernate: asleep in the cold field');
  const h0 = P[2].hq.hp, w0 = all(P[2])[0].hp; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(all(P[2])[0].hp === w0 && P[2].hq.hp === h0 && ev.some(x=> x.type === 'skipTurn'), 'it does not attack');
  c.hp = 10; const ev2 = []; e.roundStart(P, 2, so, {}, ev2); const hl = ev2.find(x=> x.type === 'heal' && x.cause === 'hibernate');
  ok(c.hp === 12 && hl && hl.amount === 2, `plain Hibernate heals 2 at the round's start (${c.hp}; ${hl && hl.amount})`);
  e.applyDamage(c, 3, {wake:true}); ok(c.hibernating && c.asleep >= 1, 'a hit does not wake it');
  e.setField(null); const ev3 = sync(e, P); ok(!c.hibernating && !(c.asleep > 0) && ev3.some(x=> x.kind === 'hibernate' && x.on === false), 'it wakes when the cold ends'); }
{ const {e, P} = mk({coldMap:true, phase:'night'}); const c = put(e, P, 1, 'x-hib'); ok(c.hibernating, 'at night on a cold map it hibernates');
  const d = mk({coldMap:true, phase:'day'}); const c2 = put(d.e, d.P, 1, 'x-hib'); ok(!c2.hibernating, 'by day on a cold map it is awake');
  const h = mk({hotMap:true}); ok(!put(h.e, h.P, 1, 'x-hib').hibernating, 'no cold, no sleep'); }
{ const {e, P} = mk({field:'frozen'}); put(e, P, 1, 'x-hibtaunt', 1); put(e, P, 1, 'x-wall', 0); const att = put(e, P, 2, 'x-hit', 0); const ev = [];
  e.resolveCombat(P, so, {}, ev, 2); const hit = ev.find(x=> (x.type === 'hit' || x.type === 'attack') && x.side === 'B' && x.targetDefId);
  ok(!hit || hit.targetDefId !== 'x-hibtaunt', `a sleeping Taunt unit draws no swing (${hit && hit.targetDefId})`); void att; }
// ---- – bramble ------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-arrowb'); const w = put(e, P, 2, 'x-wall'); const h0 = P[2].hq.hp, w0 = w.hp; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const a = ev.find(x=> x.type === 'arrow'); ok(P[2].hq.hp === h0 - 3 && w.hp === w0 && a && a.targetUid == null, `Arrow 3 – bramble: the shot goes over the unit in front, 3 to the bramble (${h0} -> ${P[2].hq.hp}; wall ${w0} -> ${w.hp})`);
  const m2 = mk(); put(m2.e, m2.P, 1, 'x-arrow'); const w2 = put(m2.e, m2.P, 2, 'x-wall'); const hb = m2.P[2].hq.hp; m2.e.resolveCombat(m2.P, so, {}, [], 1); ok(w2.hp === 497 && m2.P[2].hq.hp === hb, 'plain Arrow still hits the unit in front'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-fboltb'); put(e, P, 2, 'x-wall'); const h0 = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); ok(P[2].hq.hp === h0 - 2, `Fire Bolt 2 – bramble (${h0} -> ${P[2].hq.hp})`); }
{ const t = (id, n)=>{ const {e, P} = mk(); const w = put(e, P, 2, 'x-wall'); const h0 = P[2].hq.hp; const c = put(e, P, 1, id); return {d: h0 - P[2].hq.hp, w: 500 - w.hp, ev: c._spawnEv}; };
  const a = t('x-tarrow'), m = t('x-tmis'), d = t('x-tdmg'), d0 = t('x-tdmg0');
  ok(a.d === 4 && a.w === 0, `On Spawn: Arrow 4 – bramble (${a.d}, wall ${a.w})`); ok(m.d === 5 && m.w === 0 && m.ev.some(x=> x.type === 'brambleShot'), `Missile 5 – bramble (${m.d})`);
  ok(d.d === 6 && d.w === 0 && d0.d === 0 && d0.w === 6, `Deal damage – bramble at the bramble, without the box at the unit (${d.d} / ${d0.w})`); }
// ---- prices ---------------------------------------------------------------------------------------------------------------------------
const SC = (()=>{ if(!process.argv.includes('--world=half')) process.argv.push('--world=half'); return require(path.join(ROOT, 'tools', 'skill_costs.js')); })();
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(costs), sk = id=> costs.skills.find(r=> r.id === id);
{ const up = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/en6-state-uptime-2026-10-24.json'), 'utf8'));
  ok(up.hand && up.hand.scarcity > 0.5 && up.field && up.field.fights > 200 && up.field.all.heat > 0 && up.season && up.season.winter > 0.15, `the uptimes are filed (scarcity ${up.hand.scarcity}, ${up.field.fights} fights, heat ${up.field.all.heat}, winter ${up.season.winter})`);
  const exp = {plenty:[0.45, 0.15], scarcity:[1.58, 0.79], foePlenty:[0.1, 0.05], foeScarcity:[1.54, 0.77], heat:[1.2, 0.6], frost:[1.12, 0.56], rain:[0.15, 0.05], storm:[1.8, 0.45], fog:[2.7, 0.52], salt:[0.38, 0.25], drought:[1, 0.5], season:[0.75, 0.25]};
  Object.entries(exp).forEach(([k, [v, u]])=> ok(sk(k) && Math.abs(sk(k).value - v) < 0.011 && BB.CONTEXT_MULT_BY[k + 'Grant'] === u && BB.CONTEXT_FLAG[k] === k + 'Grant' && BB.PARAMS.includes(k + 'Grant'), `${k}: plain ${sk(k) && sk(k).value}, braces x${u}`));
  ok(Math.abs(T.cardS({heat:true, heatGrant:{thorns:2}}).S - 0.6 * T.cardS({thorns:2}).S) < 0.01, `Heat – {Thorns 2} = 0.6 x Thorns 2 (${T.cardS({heat:true, heatGrant:{thorns:2}}).S})`);
  ok(T.skillCost('fullHand', 2) === 6 && T.skillCost('lean', 1) === 7.5 && T.skillCost('foeFullHand', 1) === 2.4 && T.skillCost('foeLean', 1) === 7.5, 'Full Hand 3.0, Lean 7.5, Foe\'s Full Hand 2.4, Foe\'s Lean 7.5 a point');
  ok(T.skillCost('hibernate', true) === 1.9 && Math.abs(T.skillCost('hibernate', 3) - 2.85) < 1e-9, `Hibernate 0.95 a point, plain = 2 (${T.skillCost('hibernate', true)})`);
  const bear = {id:'t', rarity:'common', attack:4, health:10, effects:{hibernate:true}}, plain = {id:'t', rarity:'common', attack:4, health:10, effects:{}};
  ok(Math.abs(T.budget(bear, {level:1}).x1 - (2 * 4 * (1 - BB.EN6_HIBERNATE_UPTIME) + 10 + 1.9)) < 0.05 && T.budget(plain, {level:1}).x1 === 18, `a Hibernate unit's Attack counts x${1 - BB.EN6_HIBERNATE_UPTIME} (x1 ${T.budget(bear, {level:1}).x1})`);
  ok(T.cardS({arrow:2, arrowBramble:true}).S === 5.4 && T.cardS({arrowBramble:true}).S === 0 && T.cardS({fireBolt:2, fireBoltBramble:true}).S === Math.round(0.9 * T.cardS({fireBolt:2}).S * 100) / 100, `Arrow 2 – bramble = 0.9 x Arrow 2 (${T.cardS({arrow:2, arrowBramble:true}).S}); the toggle alone costs nothing`);
  const ta = T.cardS({triggers:[{on:'onSpawn', do:'arrow', amount:3}]}).S, tb = T.cardS({triggers:[{on:'onSpawn', do:'arrow', amount:3, bramble:true}]}).S;
  ok(Math.abs(tb - 0.9 * ta) < 0.02, `an On Spawn Arrow 3 – bramble = 0.9 x (${ta} -> ${tb})`);
  ok((costs.modifiers || []).some(m=> m.id === 'bramble' && m.value === 0.9), 'the table\'s "bramble" modifier (0.9)');
  ok(BB.skillCountOf({arrow:2, arrowBramble:true}) === 1 && BB.skillCountOf({heat:true, heatGrant:{armor:1}}) === 1, 'the – bramble toggle and the braces are not skills of their own (the two-skill rule)'); }
// ---- cards and the Bounty clean-up -------------------------------------------------------------------------------------------------
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), c = id=> cards.find(x=> x.id === id);
  const want = {'polar-bear':'hibernate', 'snow-ermine':'frost', 'cinder-stoker':'heat', 'dromedary':'drought', 'fulmar-spitter':'storm', 'horseshoe-crab':'salt', 'puddle-hopper':'rain', 'ent':'fog',
    'seed-cache-squirrel':'plenty', /* 2026-10-26 (ENG10, PROP1-4): the Ravenous Wolverine's Scarcity became Beset */ 'gull-thief':'foePlenty', 'stoat-cutthroat':'foeScarcity', 'balloon-archer':'arrowBramble'};
  Object.entries(want).forEach(([id, k])=>{ const x = c(id), b = x && T.budget(x, {level: 1}); ok(x && x.effects && x.effects[k] && b && b.ok, `${id}: ${k}, inside the budget (${x && x.attack}/${x && x.health}, ${b && b.x1} <= ${b && b.N})`);
    ok(x && BB.skillCountOf(x.effects) <= 2, `${id}: two skills at most (${x && BB.skillCountOf(x.effects)})`); });
  const bv = c('beaver-lumberjack'); ok(bv && !bv.effects.bounty && ((bv.effects.triggers || []).some(t=> t.on === 'onReady' && t.do === 'gain' && t.resource === 'lumber' && t.amount === 1) || bv.effects.stockpile === 1 /* 2026-10-26 (ENG9, EN6-6): the named keyword Stockpile 1 */), 'Beaver Lumberjack: no Bounty; On Ready: gain 1 Lumber (owner 12:02 #5)');
  const keep = ['raccoon-bandit', 'raccoon-warlord', 'trash-panda-trickster', 'riverside-peddler', 'pack-mule', 'magnate-duck', 'chipmunk-stockpiler'];
  const withB = cards.filter(x=> x.effects && x.effects.bounty).map(x=> x.id).sort(); ok(JSON.stringify(withB) === JSON.stringify(keep.slice().sort()), `Bounty only on the loot carriers (${withB.join(', ')})`);
  const rf = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/en6-refit-2026-10-24.json'), 'utf8')); ok(Array.isArray(rf.up) && Array.isArray(rf.down) && rf.held.length === 0, `the re-fit is filed (${rf.up.length} up, ${rf.down.length} down, none held)`); }
// ---- the page: fightRules, registry, looks, texts, docs ------------------------------------------------------------------------------
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ["const EN6_HOT_BIOMES = new Set(['ash', 'forge', 'frostfire', 'paledesert']);", "const EN6_COLD_BIOMES = new Set(['tundra', 'frostfire']);", "const EN6_SALT_BIOMES = new Set(['beach', 'reef']);", 'if(r.hotMap == null && EN6_HOT_BIOMES.has(b)) r.hotMap = true;',
   'Object.assign(EN5_STATE_KEYS, EN6_STATE_KEYS);', "sk1Patch(PASSIVE_DEFS, 'season', {category:'passive'", "{key:'hibernate', category:'passive'", 'const EN6_BRAMBLE_APP', 'function en6Vfx', 'function en6LogText', 'function en6StatusBadges',
   'try{ en6Vfx(ev); }catch(e){}', 'try{ en6StatusBadges(c, badges); }catch(e){}', "hibernating:!!c.hibernating", 'data-t="bramble" data-i=', "if(key==='bramble')", "seasons:      {icon:'🍂'"].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8'); ['.abadge.en6-hib', '.sfx.en6-bramble-arrow', '.en6-bramble-tg'].forEach(s=> ok(tpl.includes(s), 'arena_template.html: ' + s));
  const TXm = require(path.join(ROOT, 'bramblewood-texts.js'));
  const txt = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'); const a = txt.indexOf('const TEXT = '), b = txt.indexOf('/*TEXT-TABLE-END*/') > 0 ? txt.indexOf('/*TEXT-TABLE-END*/') : txt.indexOf('};', a);
  ok(!/\n\s*\/\/|\/\*(?!TEXT-TABLE)/.test(txt.slice(txt.indexOf('{', a) + 1, b)), 'no comments inside the TEXT object');
  const K = Object.keys(TXm.TEXT).filter(k=> /^ui\.(en6-|skn-(plenty|scarcity|foe-plenty|foe-scarcity|heat|frost|rain|storm|fog|salt|drought|season|full-hand|lean|foe-full-hand|foe-lean|hibernate|arrow-bramble|fire-arrow-bramble|fire-bolt-bramble)$|sk-(plenty|scarcity|foe-plenty|foe-scarcity|heat|frost|rain|storm|fog|salt|drought|season|full-hand|lean|foe-full-hand|foe-lean|foe-hand|hibernate|shot-bramble)(-codex)?$|fxx?-(name-)?seasons(-short)?$)/.test(k));
  ok(K.length >= 79, `EN6 TX keys (${K.length})`);
  const peel = s=> s.replace(/^[^\w{(\[+–]+\s/, '');
  const rows = K.map(k=> /log-/.test(k) ? peel(TXm.TEXT[k]) : TXm.TEXT[k]);
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')), ui = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', code + '.json'), 'utf8'));
    const miss = rows.filter(k=> !(p[k] || ui[k])); ok(!miss.length, `lang ${code}: the EN6 texts${miss.length ? ' (missing: ' + miss.slice(0, 3).join(' | ') + ')' : ''}`); });
  const cat = fs.readFileSync(path.join(ROOT, 'docs/effects-catalogue.md'), 'utf8'); ok(/2026-10-24 additions \(package EN6\)/.test(cat) && /Hibernate N/.test(cat) && /– bramble/.test(cat), 'docs/effects-catalogue.md: EN6');
  const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/decisions.json'), 'utf8')), ids = (dec.items || []).map(d=> d.id);
  ok(['EN6-1', 'EN6-2', 'EN6-3', 'EN6-4', 'EN6-5', 'EN6-6', 'EN6-7', 'EN6-8', 'EN6-9'].every(i=> ids.includes(i)), 'decisions EN6-1 .. EN6-9');
  const cl = fs.readFileSync(path.join(ROOT, 'docs/CHANGELOG.md'), 'utf8'); ok(/package EN6/.test(cl.slice(0, 90000)), 'CHANGELOG: EN6 near the top'); /* 2026-10-26 (ENG10): the CHANGELOG grew; 90,000 characters (was 60,000) */ }

console.log(`en6-2026-10-24: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
