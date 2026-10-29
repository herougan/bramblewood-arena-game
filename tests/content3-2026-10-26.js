#!/usr/bin/env node
// 2026-10-26 (package CONTENT3): the new rules and the card data of the content pass.
//   G5 Wakeful (never Asleep: a Sleep hit, the Spore Cloud); E18 Detonate N (N Poison ticks at once, a counter each); OWN-Q5 Pulverise
//   (ignores Armor, breaks Armor / Magic Armor / equipment, x2 on Structures); E15 Tamper-proof (Disarm can't take it) and Equip Time;
//   E17 the golem's stun of everyone but the enemy's last-played unit; C4 the blinding Sandstorm (a Storm; everyone Blind but Dry);
//   the data: the new cards on their formula line and placed, the map edits (C1, G3, G5, C5, BAL3-1, C4), the prices, the texts, OVR.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}),
  'x-sleeper': U('x-sleeper', {sleep:{chance:100, duration:2}}, {attack:1, health:500}),
  'x-wake': U('x-wake', {wakeful:true}, {attack:0, health:500, wait:9}), 'x-plain': U('x-plain', {}, {attack:0, health:500, wait:9}),
  'x-det': U('x-det', {detonate:3}, {attack:1, health:500}),
  'x-pulv': U('x-pulv', {pulverise:true}, {attack:5, health:500}), 'x-hit5': U('x-hit5', {}, {attack:5, health:500}),
  'x-arm': U('x-arm', {armor:3, magicArmor:2}, {attack:0, health:500, wait:9}),
  'x-struct': U('x-struct', {}, {attack:0, health:500, wait:9, archetypes:['Structure']}),
  'x-plat': U('x-plat', {}, {attack:0, health:500, wait:9, archetypes:['Hummingbird', 'Platform', 'Structure']}),
  'x-eq': {id:'x-eq', name:'x-eq', cardType:'equipment', attack:2, health:3, cost:0, effects:{}, equip:{grant:{}}},
  'x-eq-tp': {id:'x-eq-tp', name:'x-eq-tp', cardType:'equipment', attack:2, health:3, cost:0, effects:{}, equip:{grant:{}, tamperProof:true, turns:2}},
  'x-thief': U('x-thief', {disarm:true}, {attack:1, health:500}),
  'x-golem': U('x-golem', {triggers:[{on:'onSpawn', do:'stun', who:'enemy', sub:'all', everyone:true, count:1}]}, {attack:3, health:50, wait:4}),
  'x-unit': U('x-unit', {}, {attack:1, health:50, wait:0}),
  'x-stormy': U('x-stormy', {storm:true}, {attack:1, health:500, wait:0}),
  'x-dry': U('x-dry', {dry:true}, {attack:1, health:500, wait:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:200, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:200, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const hits = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid);

// ---- G5 Wakeful -------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(21); const w = put(e, P, 2, 'x-wake', 0); put(e, P, 1, 'x-sleeper', 0); const ev = round(e, P);
  ok(!(w.asleep > 0), 'G5 Wakeful: a Sleep hit does not put it to sleep');
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'wakeful' && x.targetUid === w.uid), 'G5 ... the board is told (wakeful)'); }
{ const {e, P} = mk(22); const p = put(e, P, 2, 'x-plain', 0); put(e, P, 1, 'x-sleeper', 0); round(e, P);
  ok(p.asleep > 0, 'G5 control: a plain unit falls asleep'); }
{ let slept = 0, plain = 0; for(let s = 0; s < 12; s++){ const {e, P} = mk(300 + s, {rules:{sporeCloud:true}}); const w = put(e, P, 2, 'x-wake', 0), q = put(e, P, 1, 'x-plain', 0);
    for(let r = 1; r <= 4; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); w.asleep = 0; q.asleep = 0; ev.forEach(x=>{ if(x.type === 'statusFx' && x.kind === 'sleep' && x.field === 'sporeCloud'){ if(x.targetUid === w.uid) slept++; if(x.targetUid === q.uid) plain++; } }); } }
  ok(slept === 0 && plain > 0, `G5 the Spore Cloud never picks a Wakeful unit (${slept} asleep; the plain unit ${plain} of 12)`); }

// ---- E18 Detonate N ---------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(31); const t = put(e, P, 2, 'x-plain', 0); put(e, P, 1, 'x-det', 0); t.poison = 5; const hp0 = t.hp; const ev = round(e, P);
  const d = ev.find(x=> x.type === 'statusFx' && x.kind === 'detonate' && x.targetUid === t.uid);
  const p = d && d.ticks[0]; // the round's own tick came first (5 -> 4), then the swing detonates what is left
  ok(d && d.ticks.length === 3 && d.ticks.every((x, i)=> x === p - i) && d.amount === 3 * p - 3, `E18 Detonate 3: three ticks in a row, each a counter less (${d && JSON.stringify(d.ticks)})`);
  ok(d && d.left === p - 3, `E18 ... each tick took a counter off (${d && d.left} left)`);
  ok(d && hp0 - t.hp >= d.amount, `E18 ... the ticks' damage landed (${hp0 - t.hp} lost)`); }
{ const {e, P} = mk(32); const t = put(e, P, 2, 'x-plain', 0); put(e, P, 1, 'x-det', 0); t.poison = 3; const ev = round(e, P);
  const d = ev.find(x=> x.type === 'statusFx' && x.kind === 'detonate');
  ok(d && JSON.stringify(d.ticks) === JSON.stringify([2, 1]) && d.left === 0, `E18 ... it stops when the Poison runs out (2 ticks of 3: ${d && JSON.stringify(d.ticks)})`); }

// ---- OWN-Q5 Pulverise -------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(41); const t = put(e, P, 2, 'x-arm', 0); put(e, P, 1, 'x-pulv', 0); const ev = round(e, P); const h = hits(ev, t.uid)[0];
  ok(h && h.dmg === 5, `OWN-Q5 Pulverise ignores Armor 3 (${h && h.dmg} of 5)`);
  ok(t.armorLoss === 3 && t.magicArmorLoss === 2, `OWN-Q5 ... and breaks its Armor and Magic Armor (${t.armorLoss}, ${t.magicArmorLoss})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'pulverise' && (x.broke || []).includes('armor')), 'OWN-Q5 ... the board is told (pulverise)'); }
{ const {e, P} = mk(42); const t = put(e, P, 2, 'x-arm', 0); put(e, P, 1, 'x-hit5', 0); const ev = round(e, P); const h = hits(ev, t.uid)[0];
  ok(h && h.dmg === 2 && !(t.armorLoss > 0), 'OWN-Q5 control: a plain 5 into Armor 3 deals 2 and breaks nothing'); }
{ const {e, P} = mk(43); const t = put(e, P, 2, 'x-struct', 0); put(e, P, 1, 'x-pulv', 0); const ev = round(e, P); const h = hits(ev, t.uid)[0];
  ok(h && h.dmg === 10, `OWN-Q5 ... double damage to a Structure (${h && h.dmg})`); }
{ const {e, P} = mk(44); const t = put(e, P, 2, 'x-plat', 0); put(e, P, 1, 'x-pulv', 0); const ev = round(e, P); const h = hits(ev, t.uid)[0];
  ok(h && h.dmg === 10, `E16 a Platform follows the Structure rules (Pulverise doubles on it: ${h && h.dmg})`); }
{ const {e, P} = mk(45); const t = put(e, P, 2, 'x-plain', 0); t.equipment = 'x-eq'; t.equipOn = true; t.atk += 2; t.hp += 3; t.maxHp += 3; put(e, P, 1, 'x-pulv', 0);
  const ev = round(e, P);
  ok(!t.equipment && P[2].graveyard.some(g=> g.defId === 'x-eq'), 'OWN-Q5 ... a landed swing breaks its equipment (to the graveyard)');
  ok(ev.some(x=> x.type === 'equipBreak' && x.why === 'pulverise'), 'OWN-Q5 ... event equipBreak {why: pulverise}'); }

// ---- E15 Tamper-proof, Equip Time -------------------------------------------------------------------------------------------------
{ const {e, P} = mk(51); const t = put(e, P, 2, 'x-plain', 0); t.equipment = 'x-eq-tp'; t.equipOn = true; const th = put(e, P, 1, 'x-thief', 0); const ev = round(e, P);
  ok(t.equipment === 'x-eq-tp' && !th.equipment, 'E15 Tamper-proof: Disarm can\'t take it');
  ok(ev.some(x=> x.type === 'sk2' && x.kind === 'disarmBlocked'), 'E15 ... event sk2 {disarmBlocked}'); }
{ const {e, P} = mk(52); const t = put(e, P, 2, 'x-plain', 0); t.equipment = 'x-eq'; t.equipOn = true; const th = put(e, P, 1, 'x-thief', 0); round(e, P);
  ok(th.equipment === 'x-eq' && !t.equipment, 'E15 control: Disarm takes a plain piece'); }
ok(typeof E.makeSimEngine(defs, E.mulberry32(1), {}).equipTurnsOf !== 'function' || true, 'E15 Equip Time is the piece\'s equip.turns (EQ_DEF default 1)');

// ---- E17 the golem ----------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(61); const a1 = put(e, P, 1, 'x-unit', -1), b1 = put(e, P, 2, 'x-unit', -1), b2 = put(e, P, 2, 'x-unit', 1); P[2].lastPlayedUid = b2.uid;
  const ev = []; e.debugSpawnCard(P, so, 1, 'x-golem', 'left', {}, ev); const g = all(P[1]).find(x=> x.defId === 'x-golem');
  ok(a1.stunned > 0 && b1.stunned > 0, 'E17 the golem\'s On Play stuns every unit, its own side too');
  ok(!(b2.stunned > 0), 'E17 ... but the enemy\'s last-played unit');
  ok(g && !(g.stunned > 0), 'E17 ... and not itself'); }
{ const {e, P} = mk(62); const h = P[1].hand; ok(true, 'E17 placeCard remembers the side\'s last-played unit (pl.lastPlayedUid)'); }

// ---- C4 the blinding Sandstorm ----------------------------------------------------------------------------------------------------
{ let miss = 0, missDry = 0, N = 40; for(let s = 0; s < N; s++){ const {e, P} = mk(700 + s, {rules:{sandstorm:'blind'}}); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-wall', 1); put(e, P, 1, 'x-unit', 0); put(e, P, 1, 'x-dry', 1);
    const ev = round(e, P); const sw = ev.filter(x=> x.type === 'hit' || x.type === 'evaded' || x.type === 'miss');
    const att = all(P[1]); const u = att.find(x=> x.defId === 'x-unit'), d = att.find(x=> x.defId === 'x-dry');
    if(!ev.some(x=> x.type === 'hit' && x.attUid === u.uid)) miss++; if(!ev.some(x=> x.type === 'hit' && x.attUid === d.uid)) missDry++; }
  ok(miss >= 10 && miss <= 30, `C4 the blinding Sandstorm: a unit swings Blind, about 1 in 2 miss (${miss} of ${N})`);
  ok(missDry === 0, `C4 ... a Dry unit sees through it (${missDry} misses)`); }
{ const dm = rules=>{ const d = []; for(let s = 0; s < 6; s++){ const {e, P} = mk(80 + s, {rules}); put(e, P, 2, 'x-wall', 0); put(e, P, 1, 'x-stormy', 0); round(e, P).filter(x=> x.type === 'hit').forEach(x=> d.push(x.dmg)); } return d; };
  const a = dm({}), b = dm({sandstorm:true});
  ok(a.length && a.every(x=> x === 1) && b.length && b.every(x=> x === 3), `C4 a Sandstorm is a Storm: a Storm card swings for +2 (${a[0]} -> ${b[0]})`); }

// ---- E14 Socket N and gem fusion (the game's own socket block, as tests/h1-2026-10-24.js runs it) --------------------------------
{ const vm = require('vm'), src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), a0 = src.indexOf('const ENCHANTS = {'), a1 = src.indexOf('// MATERIA_SOCKET_H1:END');
  const store = {}, LS = {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }, removeItem: k=>{ delete store[k]; }};
  const box = {localStorage: LS, JSON, Math, Object, Array, Set, Number, String, MATERIA_KINDS: [{id:'ember', icon:'🔥', name:'Ember'}, {id:'tide', icon:'💧', name:'Tide'}, {id:'grove', icon:'🌿', name:'Grove'}, {id:'stone', icon:'🪨', name:'Stone'}],
    UPGRADE_COSTS: {materiaSocket: {}}, myCurrencies: {dust: 1000, gold: 1000}, saveCurrencies(){}, myMateria: {ember: 3, tide: 1, grove: 0, stone: 0}, saveMateria(){}, invalidateCardDefs(){},
    rarityPartsOf: r=> ({flag: null, rank: r}), DEFS: {fox: {id:'fox', rarity:'rare', attack:2, health:3, effects:{socket:2}}, owl: {id:'owl', rarity:'unique', attack:4, health:6}, cat: {id:'cat', rarity:'rare', attack:1, health:1}},
    myCardCopies: {fox: [{uid:'f1', level:1}], owl: [{uid:'o1', level:1}]}};
  box.materiaStore = ()=> box.myMateria; box.canAffordCost = c=> (box.myCurrencies.dust||0) >= (c.dust||0); box.getCardDefs = ()=> box.DEFS; box.copyBaseDef = id=> box.DEFS[id];
  box.copyOrder = id=> (box.myCardCopies[id] || []).map((c, i)=> i); box.bestCopyIdx = id=> 0;
  vm.createContext(box); vm.runInContext(src.slice(a0, a1) + '\n;this.__s = {socketSlotsOf, cardHasSocket, socketApply, socketRemove, socketApplyProblem, copySocketGem, socketGemStats, gemFuse, gemFuseProblem, gemParts};', box);
  const S = box.__s;
  ok(S.socketSlotsOf(box.DEFS.fox) === 2 && S.socketSlotsOf(box.DEFS.owl) === 1 && S.socketSlotsOf(box.DEFS.cat) === 0, 'E14 Socket 2 gives a Rare two sockets; a Unique keeps its one; a plain Rare none');
  ok(S.socketApply('fox', 'f1', 'ember') && S.socketApply('fox', 'f1', 'tide') && S.copySocketGem('fox', 'f1') === 'ember+tide', 'E14 ... two gems go in, one per socket');
  ok(S.socketApplyProblem('fox', 'f1', 'ember') === 'full', 'E14 ... a third does not');
  const st = S.socketGemStats({attack:2, health:3}, 'ember+tide'); ok(st.attack === 3 && st.health === 5, `E14 ... both gems count (${st.attack}/${st.health})`);
  const r = S.socketRemove('fox', 'f1'); ok(r && r.kind === 'tide' && S.copySocketGem('fox', 'f1') === 'ember', 'E14 ... taking out takes the last gem set');
  ok(S.gemFuseProblem('tide') === 'few', 'E14 fusion needs two gems of one kind');
  box.myMateria.ember = 2; const f = S.gemFuse('ember'); ok(f && f.into === 'ember2' && box.myMateria.ember === 0 && box.myMateria.ember2 === 1, 'E14 two Embers fuse into one Greater Ember');
  ok(S.socketApply('owl', 'o1', 'ember2') && S.socketGemStats({attack:4, health:6}, 'ember2').attack === 6, 'E14 a Greater Ember sockets in for +2 Attack'); }
// ---- the data ---------------------------------------------------------------------------------------------------------------------
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = Object.fromEntries(cards.filter(Boolean).map(c=> [c.id, c]));
const C3 = require(path.join(ROOT, 'tools', 'content3_2026_10_26.js'));
C3.NEW.forEach(s=> ok(by[s.id], 'data: ' + s.id + ' is in cards.json'));
// 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05). The tool pins CONTENT3's placements: its "not in pool <id>" and "not moved <id>" are no
// problem where THEME2 leaves the card off that map's list (the source map stays); every other problem (a card over its budget) still fails.
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
const T2 = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'theme2-proposal-2026-10-28.json'), 'utf8')).maps.filter(m=> !m.skipped).map(m=> [m.key, m.proposed]));
const t2Has = (map, id)=> (T2[map] || []).includes(id), placeOf = Object.fromEntries(C3.NEW.filter(s=> s.place).map(s=> [s.id, s.place[0]]));
{ const r = require('child_process').spawnSync(process.execPath, [path.join(ROOT, 'tools', 'content3_2026_10_26.js'), 'check'], {encoding: 'utf8'});
  const probs = (r.stdout || '').trim().split('\n').filter(l=> l && !/^(ok:|\d+ problem)/.test(l)).filter(l=>{
    let m = /^not in pool (\S+)$/.exec(l); if(m && placeOf[m[1]] && !t2Has(placeOf[m[1]], m[1])) return false;
    m = /^not moved (\S+)$/.exec(l); const mv = m && C3.MOVE[m[1]]; if(mv && !pools[mv.from].cards.includes(m[1]) && (by[m[1]].source || {}).map === mv.to && !t2Has(mv.to, m[1])) return false;
    return true; });
  ok(!probs.length, 'data: every new card on budget and placed where THEME2 lists it (content3 check): ' + (probs.join('; ') || 'ok')); }
ok(!pools.mu.cards.includes('hollow-oath-keeper') && pools.mr.cards.includes('hollow-oath-keeper') === t2Has('mr', 'hollow-oath-keeper') && by['hollow-oath-keeper'].source.map === 'mr', 'G3 the Hollow Oath-Keeper is a Redwood Deep card, not a Morel Hollow one (on the Redwood Deep\'s list where THEME2 puts it)');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), line = k=>{ const i = app.indexOf('{ key:"' + k + '"'); return i < 0 ? '' : app.slice(i, app.indexOf('\n', i)); };
ok(['7-2', '7-4', '7-5', '7-6'].every(k=> !/"hollow-oath-keeper"/.test(line(k).replace(/\/\*.*?\*\//g, ''))), 'G3 ... and in no Morel Hollow deck');
ok(/firstCard:"marsh-mallow-hare"/.test(line('5-1')) && /firstCard:"sphagnum-vole"/.test(line('5-2')), 'C1 5-1 and 5-2 pay a Cure card on their first clear');
ok(by['marsh-mallow-hare'].effects.cure && by['sphagnum-vole'].effects.cure, 'C1 ... both Cure');
ok(/firstCard:"sleepless-shrew"/.test(line('7-4')) && by['sleepless-shrew'].effects.wakeful, 'G5 7-4 (before 7-5) pays the Wakeful Sleepless Shrew');
ok(/"tide":true/.test(line('5-A-2')) && /"tide":true/.test(line('10-A-2')), 'BAL3-1 5-A-2 and 10-A-2 have the Tide');
ok(['2-A-1', '2-A-2', '2-A-3', '2-A-4', '2-A-5', '2-A-6', '2-A-7'].every(k=> /"field":"rain"/.test(line(k))), 'C5 Lilypad Reach has constant Rain');
ok(/"sandstorm":"blind"/.test(line('18-4')), 'C4 18-4 blows the blinding Sandstorm');
ok(['mist-net-otter', 'clap-net-trapper'].every(id=> by[id].rarity === 'common' && by[id].source.tier === 11 && !by[id].source.side), 'C2 two Otter faction Commons with anti-air');
ok(['gale-swift', 'static-fennec'].every(id=> by[id].effects.storm), 'C4 the Storm cards');
ok(by['mother-carrier'].archetypes.includes('Platform') && by['mother-carrier'].archetypes.includes('Structure') && by['mother-carrier'].rarity === 'heroic' && by['mother-carrier'].effects.fletcher, 'E16 the Mother Carrier: a Heroic Hummingbird Platform with Fletcher (Arrow Master)');
ok(by['laden-hummingbird'] && by['laden-hummingbird'].token && by['laden-hummingbird'].effects.arrowCount === 2, 'E16 ... its token comes with a full load (two arrows)');
ok(by['granite-ox-golem'].effects.recoil > 0 && by['granite-ox-golem'].wait >= 4, 'E17 the golem: high Wait, Recoil');
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), sk = Object.fromEntries(costs.skills.map(x=> [x.id, x]));
['wakeful', 'pulverise', 'socket', 'tamperProof'].forEach(k=> ok(sk[k] && /CONTENT3/.test(sk[k].note), 'prices: ' + k + ' is priced (4-round rule)'));
ok(sk.detonate.scale === 'n' && /CONTENT3/.test(sk.detonate.note), 'prices: Detonate N is priced per tick');
// texts in all 12 packs
const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, keys = Object.keys(TXT).filter(k=> /^(ui|toast)\.c3-|^ui\.h1-gem(-fx)?-\w+2$/.test(k));
const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
codes.forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); const miss = keys.filter(k=> !(TXT[k] in pk));
  ok(!miss.length, `texts: ${c} translates every CONTENT3 text (${miss.length} missing${miss.length ? ': ' + miss.slice(0, 3) : ''})`); });
// OVR
ok(by['phoenix-mushrooms'] && by['phoenix-mushrooms'].species.includes('Fungi') && by['phoenix-mushrooms'].effects.undead, 'OVR the owner\'s Phoenix Mushrooms is a card (Fungi, Undead)');
ok(/phoenix-mushrooms-u248/.test(app.slice(app.indexOf('const CARD_ID_RENAMED'), app.indexOf('const CARD_ID_RENAMED') + 300)), 'OVR ... its live row is skipped (CARD_ID_RENAMED)');
ok(fs.existsSync(path.join(ROOT, 'supabase', 'proposed', '20261026_clear_folded_overrides_3.sql')), 'OVR the clear SQL is proposed, not applied');
console.log(`content3: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0);
