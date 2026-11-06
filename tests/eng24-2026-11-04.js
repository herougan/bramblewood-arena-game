#!/usr/bin/env node
// 2026-11-04 (package ENG24): the owner's 11-04 22:34 answers (docs/decisions.json).
//   1  ENG22-2 b: Bramble Armor (key brambleArmor) reads "Fortify { Armor N }, while it lives"; the rule is unchanged (1 less a hit).
//   2  RELICT-1: Relict, the field and the field-wide skills pass it by; single-target skills still reach it; priced.
//   3  RELICT-2: Meld {X}, Immunity, Sequestration; player texts under 15 words; priced.
//   4  IDEA-BRAMBLES: every bramble ability number +2 (amounts; intervals and uses unchanged).
//   5  FIX8-4: the defeat advice ("build a new deck around one plan") waits for the Camp.
//   6  ENG22-5 a: Carnage's uptime re-measured for its "sees the deaths" rule (THR_UPTIME.carnage) and its price.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const TXm = require(path.join(ROOT, 'bramblewood-texts.js')), TXT = TXm.TEXT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-rel':    U('x-rel', {relict:true}, {wait:9}),
  'x-relF':   U('x-relF', {relict:true, flying:true}, {attack:2, wait:9}),
  'x-plain':  U('x-plain', {}, {wait:9}),
  'x-plainF': U('x-plainF', {flying:true}, {attack:2, wait:9}),
  'x-quake':  U('x-quake', {earthquake:3}, {wait:2, health:10}),
  'x-tsu':    U('x-tsu', {tsunami:4}, {wait:2, health:10}),
  'x-aval':   U('x-aval', {avalanche:3}, {wait:2, health:10}),
  'x-gas':    U('x-gas', {poisonGas:2}, {wait:2, health:10}),
  'x-arrow':  U('x-arrow', {triggers:[{on:'onSpawn', do:'damage', amount:3, who:'enemy', sub:'all'}]}, {wait:9, health:10}),
  'x-imm':    U('x-imm', {immunity:true}, {wait:9, health:50}),
  'x-psn':    U('x-psn', {poison:2, decay:1, venomous:1}, {attack:1, health:200}),
  'x-meldQ':  U('x-meldQ', {meld:{quick:true}}, {wait:9}),
  'x-meldA':  U('x-meldA', {meld:{armor:1}}, {wait:9}),
  'x-seq':    U('x-seq', {sequestration:true}, {attack:1, health:200}),
  'x-sleepy': U('x-sleepy', {poison:1, sleep:{chance:100, duration:1}, arrow:2}, {attack:1, health:200, wait:9}),
  'x-dummy':  U('x-dummy', {}, {health:200, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules, chars){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}});
  return {e, P:{1: e.newPlayer(1, {}, (chars && chars[1]) || null), 2: e.newPlayer(2, {}, (chars && chars[2]) || null)}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const app = R('arena_app.js'), eng = R('bramblewood-engine.js');
const SCt = J('canonical/skill-costs.json'), SK = Object.fromEntries(SCt.skills.map(s=> [s.id, s]));
const words = s=> String(s).replace(/\{\w+\}/g, 'N').trim().split(/\s+/).filter(Boolean).length;

// ---- 1. Bramble Armor as a Fortify form -----------------------------------------------------------------------------------------
ok(TXT['ui.skn-bramble-armor'] === 'Fortify (Armor 1), while it lives' && TXT['ui.eng24-barmor-head'] === 'Fortify (Armor {n}), while it lives' /* 2026-11-06 (ENG27, owner item 10: "Fortify - (Armor 1)"): braces became brackets */, `1: the name reads Fortify { Armor N }, while it lives (${TXT['ui.skn-bramble-armor']})`);
ok(/brambleArmor/.test(app) && /eng24BarmorN/.test(app) && /k === 'brambleArmor'/.test(app), '1: the card line, the editor and the Codex read the Fortify form (e22Head)');
{ const {e, P} = mk(1); const b = put(e, P, 2, 'briarback-hedgehog', 0); const hq0 = P[2].hq.hp; void b;
  ok(SK.brambleArmor && SK.brambleArmor.value === 1.1, '1: its price is unchanged (1.1)'); void hq0; }
ok(/function brambleArmorCut\(pl, amount, crush\)/.test(eng), '1: the rule (brambleArmorCut, 1 less a hit) is kept');

// ---- 2. Relict ------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(2); const r = put(e, P, 2, 'x-rel', 0), p = put(e, P, 2, 'x-plain', 1); e.debugSpawnCard(P, so, 1, 'x-quake', 'left', {}, []);
  ok(r.hp === 50 && p.hp === 47, `2: Earthquake passes a Relict by (${r.hp}) and hits the others (${p.hp})`); }
{ const {e, P} = mk(3); const r = put(e, P, 2, 'x-rel', 0), p = put(e, P, 2, 'x-plain', 1); const w0 = r.wait, w1 = p.wait; e.debugSpawnCard(P, so, 1, 'x-tsu', 'left', {}, []);
  ok(r.hp === 50 && r.wait === w0 && p.hp === 46 && p.wait === w1 + 1, `2: Tsunami neither pushes nor soaks a Relict (${r.hp}/${r.wait} | ${p.hp}/${p.wait})`); }
{ const {e, P} = mk(4); const r = put(e, P, 2, 'x-rel', 0), p = put(e, P, 2, 'x-plain', 1); e.debugSpawnCard(P, so, 1, 'x-aval', 'left', {}, []);
  ok(r.hp === 50 && p.hp < 50, '2: Avalanche passes it by'); }
{ const {e, P} = mk(5); const r = put(e, P, 2, 'x-rel', 0), p = put(e, P, 2, 'x-plain', 1); e.debugSpawnCard(P, so, 1, 'x-gas', 'left', {}, []);
  ok(!(r.poison > 0) && p.poison === 2, '2: Poison Gas (on every enemy unit) passes it by'); }
{ const {e, P} = mk(6, {hail: 1}); const r = put(e, P, 1, 'x-rel', 0), p = put(e, P, 1, 'x-plain', 1);
  e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(r.hp === 50 && p.hp === 49, `2: a field tick (Hail) passes it by (${r.hp} | ${p.hp})`); }
{ const {e, P} = mk(7, {dark: 'pitch'}); const r = put(e, P, 1, 'x-rel', 0), p = put(e, P, 1, 'x-plain', 1);
  ok(e.sightMiss(r, 1) === 0 && e.sightMiss(p, 1) === 0.5, '2: the field\'s dark never makes it miss'); }
{ const {e, P} = mk(8, {sandstorm: 'blind'}); const r = put(e, P, 1, 'x-rel', 0); ok(e.sightMiss(r, 1) === 0, '2: nor a blinding Sandstorm'); }
{ const {e, P} = mk(9, {phase: 'day'}); const r = put(e, P, 1, 'x-relF', 0), p = put(e, P, 1, 'x-plainF', 1);
  // a strong wind blowing into side 1: its Flyers -1 Attack (the cut is live), a Relict Flyer none
  let cut = null; for(let s = 1; s < 60 && cut == null; s++){ const m = mk(s, {wind:'gale'}); const rr = put(m.e, m.P, 1, 'x-relF', 0), pp = put(m.e, m.P, 1, 'x-plainF', 1); m.e.roundStart(m.P, 1, so, {}, []);
    if(m.e.windSideOf(1) === 'head') cut = [m.e.headwindAtkCut ? m.e.headwindAtkCut(rr) : 0, m.e.headwindAtkCut ? m.e.headwindAtkCut(pp) : 1]; }
  ok(!cut || (cut[0] === 0), `2: the Headwind's cut skips a Relict Flyer (${JSON.stringify(cut)})`); void r; void p; }
{ const {e, P} = mk(10); const r = put(e, P, 2, 'x-rel', 0); P[2].row.left = []; P[2].row.right = []; e.syncSlots(P[2]); const ev = [];
  e.debugSpawnCard(P, so, 1, 'x-arrow', 'left', {}, ev);
  ok(r.hp === 47, `2: a single-target skill still reaches it (${r.hp})`); }
ok(SK.relict && SK.relict.value > 0 && SK.relict.theoretical !== true && /measure/i.test(SK.relict.measuredHow || ''), `2: Relict is priced by a measure (${SK.relict && SK.relict.value})`);
// 2026-11-05 (package CONTENT11, NUDI-1): the new Nudibranch carries Sequestration + Immunity (a nudibranch keeps the stings it eats); no
// existing card does (carriers on existing cards are the owner's call, decision CONTENT11-3)
// 2026-11-06 (package CONTENT12, CONTENT11-3 a): the carriers
ok(J('canonical/cards.json').filter(c=> c.id !== 'nudibranch' && c.effects && (c.effects.relict || c.effects.meld || c.effects.immunity || c.effects.sequestration)).map(c=> c.id).sort().join(',') === 'coral-polyp-colony,hedgehog-herbalist,horseshoe-crab,leafcutter-gardener,nautilus-drifter,poison-dart-croaker,venomlord-serpent', '2-3: the new skills are on the CONTENT12 carriers only (and the Nudibranch)');

// ---- 3. Immunity ----------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(11); const s = put(e, P, 1, 'x-psn', 0), t = put(e, P, 2, 'x-imm', 0); const ev = [];
  e.roundStart(P, 1, so, {}, []); e.resolveCombat(P, so, {}, ev, 1);
  ok(t.hp < 50 && !(t.poison > 0) && !(t.decay > 0) && !(t.toxin > 0) && !(t.gpoison > 0), `3: Immunity takes the hit but no Poison / Decay (${t.hp}, p${t.poison} d${t.decay})`); void s; }
{ const {e, P} = mk(12, {swampFever: 100}); const t = put(e, P, 1, 'x-imm', 0), p = put(e, P, 1, 'x-plain', 1); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(!(t.poison > 0) && p.poison > 0, '3: no Swamp Fever either'); }
{ const {e, P} = mk(13); const t = put(e, P, 1, 'x-imm', 0); t.poison = 3; t.decay = 2; e.roundStart(P, 1, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(!(t.poison > 0) && !(t.decay > 0) && t.hp === 50, `3: counters that slipped in are cleared at upkeep, before they tick (${t.hp})`); }
// ---- 3. Meld ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(14); const a = put(e, P, 1, 'x-meldQ', 0); e.syncPhaseStats(P, so, []);
  const fx = c=> e.effectsOf(c);
  ok(!fx(a).quick, '3: a lone Meld unit has nothing (its braces go to the others)');
  const b = put(e, P, 1, 'x-meldA', 1), c = put(e, P, 1, 'x-plain', -1); e.syncPhaseStats(P, so, []);
  ok(fx(b).quick && fx(a).armor === 1 && !fx(a).quick && !fx(b).armor && !fx(c).quick && !fx(c).armor, `3: two Meld units share their braces, a non-Meld ally gets none (${JSON.stringify([fx(a).armor, fx(b).quick])})`);
  b.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  ok(!fx(a).armor, '3: the braces leave with the Meld unit that gave them'); }
// ---- 3. Sequestration ------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(15); const s = put(e, P, 1, 'x-seq', 0), t = put(e, P, 2, 'x-sleepy', 0); const ev = [];
  e.roundStart(P, 1, so, {}, []); e.resolveCombat(P, so, {}, ev, 1);
  const fs1 = e.effectsOf(s), ft = e.effectsOf(t);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'sequester'), '3: Sequestration: its landed swing takes the target\'s status skills');
  ok(fs1.poison === 1 && fs1.sleep && !ft.poison && !ft.sleep && ft.arrow === 2 && !fs1.arrow, `3: Poison and Sleep move over, the Arrow (a shot) stays (${JSON.stringify({s:[fs1.poison, !!fs1.sleep, fs1.arrow], t:[ft.poison, !!ft.sleep, ft.arrow]})})`);
  e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(!e.effectsOf(t).poison && e.effectsOf(s).poison === 1, '3: it keeps them through the next round');
  e.roundStart(P, 3, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(e.effectsOf(t).poison === 1 && !!e.effectsOf(t).sleep && !e.effectsOf(s).poison && !e.effectsOf(s).sleep, '3: and they go home at the end of the round after (a fresh steal can follow)'); }
// ---- 3. texts and prices --------------------------------------------------------------------------------------------------------
['ui.eng24-relict', 'ui.eng24-meld', 'ui.eng24-immunity', 'ui.eng24-sequestration'].forEach(k=>{
  ok(TXT[k] && words(TXT[k]) < 15, `3: ${k} is under 15 words (${TXT[k] && words(TXT[k])}: ${TXT[k]})`); });
['meld', 'immunity', 'sequestration'].forEach(k=> ok(SK[k] && SK[k].value > 0 && /measure/i.test(SK[k].measuredHow || ''), `3: ${k} is priced by a measure (${SK[k] && SK[k].value})`));
['relict', 'meld', 'immunity', 'sequestration'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'passive'`).test(app), `2-3: ${k} is in "+ Add Skill" (PASSIVE_DEFS)`));
ok(/Sequestration/.test(R('docs/effects-catalogue.md')) && /Immunity/.test(R('docs/effects-catalogue.md')) && /Relict/.test(R('docs/effects-catalogue.md')), '2-3: the effects catalogue lists the new skills (and which statuses Immunity stops)');
{ const L = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> J('lang/' + c + '.json'));
  ['ui.eng24-relict', 'ui.eng24-meld', 'ui.eng24-immunity', 'ui.eng24-sequestration', 'ui.skn-bramble-armor', 'ui.eng24-barmor-head'].forEach(k=> ok(L.every(p=> p[TXT[k]]), `texts: ${k} in the 12 packs`)); }

// ---- 4. Brambles +2 -------------------------------------------------------------------------------------------------------------
{ const ch = Object.fromEntries(J('canonical/characters.json').map(c=> [c.id, c]));
  ok(ch['tidewall-fort'].effects.castleRegen === 3 && ch['bog-stilt-house'].effects.castleRegen === 4, '4: Heal 1 -> Heal 3 (Tidewall Fort), 2 -> 4');
  ok(ch['ballista-keep'].effects.aimedBolt === 6 && ch['ballista-keep'].effects.castleBolt === 4, '4: Ballista Keep: Aimed Bolt 4 -> 6, its bolt 2 -> 4');
  ok(ch['gnawed-larder'].effects.feed.repair === 5 && ch['gnawed-larder'].effects.feed.attack === 3 && ch['gnawed-larder'].effects.feed.feeds === 3, '4: the Gnawed Larder\'s Feed: Repair 5, +3 Attack, still three feeds');
  ok(ch['clam-farm'].effects.castleLumberEvery === 3 && ch['clam-farm'].effects.castleLumberAmount === 3, '4: Clam Farm: +3 Lumber, still every 3 rounds');
  ok(JSON.stringify(ch['herb-refinery'].effects.herbRefinery) === '{"heal":5,"damage":4,"lumber":3}', '4: Herb Refinery: heal 5, 4 damage, +3 Lumber');
  ok(ch['castle'].effects && !Object.keys(ch['castle'].effects).length, '4: the plain Bramble has no ability, unchanged');
  ok(ch['trojan-horse'].effects.castleSpawn.count === 3 && ch['trojan-horse'].effects.castleSpawn.first === 3, '4: a spawn\'s count +2, its rounds unchanged'); }
{ const {e, P} = mk(16, {}, {1: {id:'cf', health:30, effects:{castleLumberEvery:3, castleLumberAmount:3}}}); const l0 = P[1].lumber; e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []); e.roundStart(P, 4, so, {}, []);
  ok(P[1].lumber - l0 === 3, `4: the engine gives the bramble's Lumber amount (${P[1].lumber - l0})`); }
{ const {e} = mk(17); ok(JSON.stringify(e.eng24HerbCfg(true)) === '{"heal":3,"damage":2,"lumber":1}', '4: an old Herb Refinery (true) keeps 3 / 2 / 1'); }

// ---- 5. Defeat advice before the Camp -------------------------------------------------------------------------------------------
ok(/FIX8-4/.test(app) && /eng24DefeatAdviceOk/.test(app), '5: the defeat advice waits for the Camp (eng24DefeatAdviceOk)');

// ---- 6. Carnage's uptime --------------------------------------------------------------------------------------------------------
{ const t = R('bramblewood-budget.js'); const m = /carnage:\s*\[([^\]]+)\]/.exec(t), v = m ? m[1].split(',').map(Number) : [];
  ok(v.length === 13 && v[0] === 1 && v[3] < 0.408, `6: THR_UPTIME.carnage re-measured for the seen-deaths rule (N 3 ${v[3]}, was 0.408)`);
  ok(SK.carnage && SK.carnage.pricedAt && /ENG24/.test(SK.carnage.pricedAt) && Math.abs(SK.carnage.value - BB.thrS('carnage', true, {carnage:true}).S) < 0.011, `6: Carnage's price follows the new share (${SK.carnage && SK.carnage.value})`); }

console.log(`eng24: ${n - fail}/${n} passed, ${fail} failure(s)`); process.exit(fail ? 1 : 0);
