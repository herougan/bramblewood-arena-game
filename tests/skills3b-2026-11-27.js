#!/usr/bin/env node
// 2026-11-27 (package SKILLS3-B: the settled SKILLS3 / SKILLS3b decisions, docs/design/skills3-2026-11-25.md and skills3b-2026-11-26.md):
//   1. trigger icons (SKILLS3-1): ⬆️ On Play, 💀 On Death, 🃏 On Pitch on chips, card lines and the ring glyph;
//   2. status tokens (SKILLS3-9): Vulnerable / Feeble / Mighty / Sturdy count every hit while any remain, one off each upkeep, hits spend
//      none, new tokens add up to 3, never x4 from one side; the ladder (SKILLS3-10): plain On Hit (Harden / Embolden on an ally beside
//      it, no round-start aura), ⬆️ and 💀 forms, the owner's 💀 Rend on every unit around it (both sides);
//   3. Wet (SKILLS3-7): yes / no; water soaks and puts Burn out; a fire hit dries and lights nothing; dry weather dries; shock +1 on a
//      Wet unit and 1 to every Wet unit chained to it;
//   4. Dogfighter N (SKILLS3-4) and Attunement N – {element} (SKILLS3-11);
//   5. Warning Colours N (NEWCARDS2): 💀 its killer gets N Poison; enemies that saw it die avoid your other Warning Colours units.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const app = rd('arena_app.js');

// ================= 1. trigger icons (SKILLS3-1) =================
{ const i = app.indexOf('function trigLeadIcon('), src = app.slice(i, app.indexOf('\n', i));
  const trigLeadIcon = new Function('eng28DeathTrig', src + '\nreturn trigLeadIcon;')(t=> /^onDeath/.test(t.on));
  ok(trigLeadIcon({on:'onSpawn'}) === '⬆️' && trigLeadIcon({on:'onDeath'}) === '💀' && trigLeadIcon({on:'onPitch'}) === '🃏', '1. lead icons: ⬆️ On Play, 💀 On Death, 🃏 On Pitch');
  ok(trigLeadIcon({on:'onAttack'}) === '⚡' && trigLeadIcon({on:'onRoundStart'}) === '🕐' && trigLeadIcon({on:'onSacrifice'}) === '🦷', '1. the other triggers keep ⚡ / 🕐 / 🦷');
  ok(/onSpawn:'⬆️'/.test(app) && /onPitch:'🃏'/.test(app) && !/onPitch:'♻️'/.test(app), '1. the ring glyphs (TRIGGER_GLYPH)');
  ok((app.match(/trigLeadIcon\(t\)/g) || []).length >= 3 && /🃏 Scavenge - /.test(app), '1. chips (live and spent) and card lines use it'); }

// ---- board helpers (as tests/eng50-2026-11-17.js: exact slots, swings and rounds)
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  's3-dummy': U('s3-dummy'), 's3-hit1': U('s3-hit1', {}, {attack:1}), 's3-hit2': U('s3-hit2', {}, {attack:2}), 's3-hit4': U('s3-hit4', {}, {attack:4}), 's3-big': U('s3-big', {}, {attack:50}),
  's3-arrow1': U('s3-arrow1', {arrow:1}), 's3-fragile': U('s3-fragile', {fragile:true}), 's3-sturdy': U('s3-sturdy', {sturdy:true}),
  's3-rend1': U('s3-rend1', {rend:1}, {attack:2}), 's3-enf1': U('s3-enf1', {enfeeble:1}, {attack:1}), 's3-hard1': U('s3-hard1', {harden:1}, {attack:1}), 's3-emb1': U('s3-emb1', {embolden:1}, {attack:1}),
  's3-rendPlay': U('s3-rendPlay', {rend:{v:2, when:'play'}}), 's3-enfPlay': U('s3-enfPlay', {enfeeble:{v:1, when:'play'}}),
  's3-hardPlay': U('s3-hardPlay', {harden:{v:2, when:'play'}}), 's3-embPlay': U('s3-embPlay', {embolden:{v:1, when:'play'}}),
  's3-rendDeath': U('s3-rendDeath', {rend:{v:2, when:'death'}}, {health:3}), 's3-enfDeath': U('s3-enfDeath', {enfeeble:{v:1, when:'death'}}, {health:3}),
  's3-hardDeath': U('s3-hardDeath', {harden:{v:1, when:'death'}}, {health:3}), 's3-embDeath': U('s3-embDeath', {embolden:{v:1, when:'death'}}, {health:3}),
  's3-rendAround': U('s3-rendAround', {rend:{v:1, when:'death', who:'around'}}, {health:3}),
  's3-dog': U('s3-dog', {dogfighter:1}, {attack:2}), 's3-dogArrow': U('s3-dogArrow', {dogfighter:2, arrow:1}), 's3-mach': U('s3-mach', {mach:true}),
  's3-attShock': U('s3-attShock', {attunement:{v:1, el:'shock'}}, {wait:3}), 's3-attFire': U('s3-attFire', {attunement:2}),
  's3-wc': U('s3-wc', {warningColours:2}, {health:3}), 's3-wcTough': U('s3-wcTough', {warningColours:1}), 's3-arrowWarn': U('s3-arrowWarn', {arrow:1}),
  's3-tide': U('s3-tide', {tide:true}), 's3-fly': U('s3-fly', {flying:true}), 's3-shock2': U('s3-shock2', {}, {attack:2, dmgType:'shock'}), 's3-fire1': U('s3-fire1', {}, {attack:1, dmgType:'heat'}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, o){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 11), Object.assign({recordEvents:true, battleMode:'open'}, o || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})}}; }
function put(e, P, pid, id, slot, ev){ e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const pl = P[pid], c = all(pl).filter(x=> (e.derivedDefs[x.defId] ? e.derivedDefs[x.defId].derivedFrom : x.defId) === id || x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const fight = (e, P, r)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, r || 1); return ev; };
const swing = (e, P, c)=>{ const ev = []; e.debugAttack(P, so, c.uid, {}, ev); return ev; };
const fxOf = (kind, uid)=> x=> x.type === 'statusFx' && x.kind === kind && (uid == null || x.targetUid === uid);
const hitOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid).reduce((t, h)=> t + (h.dmg || 0), 0);

// ================= 2. status tokens (SKILLS3-9) and the ladder (SKILLS3-10) =================
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-rend1', 0), t = put(e, P, 2, 's3-dummy', 0);
  swing(e, P, a); ok(t.vulnerable === 1 && t.hp === 498, '2. Rend 1: the hit lands (2), then 1 Vulnerable');
  const ev = swing(e, P, a); ok(t.hp === 494 && t.vulnerable === 2 && !ev.some(fxOf('vulnHit')), `2. the next hit deals double (4) and spends none; it adds one (${500 - t.hp}, ${t.vulnerable})`);
  swing(e, P, a); swing(e, P, a); ok(t.hp === 486 && t.vulnerable === 3, `2. every hit doubles while any remain; new tokens add, up to 3 (${t.vulnerable})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 's3-dummy', 0); t.vulnerable = 2; t._vulnerableJustSet = true;
  const left = [1, 2, 3, 4].map(r=>{ fight(e, P, r); return t.vulnerable; }); ok(left.join() === '2,1,0,0', `2. one comes off each upkeep, not the round it was laid (${left})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 's3-dummy', 0); t.vulnerable = 1; t._vulnerableJustSet = true; const ev = []; put(e, P, 1, 's3-arrow1', 0);
  const r1 = fight(e, P, 1); ok(hitOn(r1, t.uid) === 2, '2. a shot doubles too'); const r2 = fight(e, P, 2); ok(hitOn(r2, t.uid) === 2 && t.vulnerable === 0, '2. the next round: doubled, then the last token comes off'); void ev;
  const r3 = fight(e, P, 3); ok(hitOn(r3, t.uid) === 1, '2. no token, no double'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 's3-fragile', 0); t.vulnerable = 2; const a = put(e, P, 1, 's3-hit1', 0); swing(e, P, a); ok(t.hp === 498, `2. Fragile + Vulnerable: x2, never x4 from one side (${500 - t.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-enf1', 0), t = put(e, P, 2, 's3-hit4', 0); [0, 1, 2, 3].forEach(()=> swing(e, P, a)); ok(t.feeble === 3, `2. Feeble tokens add up to 3 (${t.feeble})`);
  const w = put(e, P, 1, 's3-dummy', 0); void w; }
// plain Harden / Embolden: On Hit only (no On Play, no round-start aura)
{ const {e, P} = mk(); const sp = []; const ally = put(e, P, 1, 's3-dummy', -1), h = put(e, P, 1, 's3-hard1', 0, sp); put(e, P, 2, 's3-dummy', 0);
  ok(!sp.some(fxOf('harden')) && !(ally.hardened > 0), '2. Harden: nothing when played (SKILLS3-10: no aura)');
  swing(e, P, h); ok(ally.hardened === 1, '2. Harden 1: its hit gives the ally beside it 1 Sturdy');
  swing(e, P, h); swing(e, P, h); swing(e, P, h); ok(ally.hardened === 3, `2. repeats add up to 3 (${ally.hardened})`); }
{ const {e, P} = mk(); const ally = put(e, P, 1, 's3-hit2', 1), m = put(e, P, 1, 's3-emb1', 0), t = put(e, P, 2, 's3-dummy', 1); put(e, P, 2, 's3-dummy', 0);
  const ev0 = fight(e, P, 1); void ev0; ok(ally.emboldened >= 1, '2. Embolden 1: its hit gives the ally beside it Mighty');
  const h0 = t.hp; swing(e, P, ally); ok(h0 - t.hp === 4, `2. the Mighty ally deals double (${h0 - t.hp})`); void m; }
// ⬆️ forms
{ const {e, P} = mk(); const t = put(e, P, 2, 's3-dummy', 0), sp = []; put(e, P, 1, 's3-rendPlay', 0, sp); ok(t.vulnerable === 2 && sp.some(fxOf('rend', t.uid)), '2. ⬆️ Rend 2: the enemy facing it gets 2 Vulnerable when played'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 's3-hit4', 0); put(e, P, 1, 's3-enfPlay', 0); ok(t.feeble === 1, '2. ⬆️ Enfeeble 1: the enemy facing it gets 1 Feeble'); }
{ const {e, P} = mk(); const l = put(e, P, 1, 's3-dummy', -1), r = put(e, P, 1, 's3-dummy', 1), far = put(e, P, 1, 's3-dummy', 2); put(e, P, 1, 's3-hardPlay', 0);
  ok(l.hardened === 2 && r.hardened === 2 && !(far.hardened > 0), '2. ⬆️ Harden 2: every ally beside it gets 2 Sturdy (not one further away)'); }
{ const {e, P} = mk(); const l = put(e, P, 1, 's3-hit2', -1); put(e, P, 1, 's3-embPlay', 0); ok(l.emboldened === 1, '2. ⬆️ Embolden 1: the ally beside it gets 1 Mighty'); }
// 💀 forms: its killer / the allies beside it; the owner's around form hits both sides
{ const {e, P} = mk(); put(e, P, 1, 's3-rendDeath', 0); const k = put(e, P, 2, 's3-big', 0); const ev = swing(e, P, k);
  ok(k.vulnerable === 2 && ev.some(fxOf('rend', k.uid)), `2. 💀 Rend 2: its killer gets 2 Vulnerable (${k.vulnerable})`); }
{ const {e, P} = mk(); const d = put(e, P, 1, 's3-rendDeath', 0); put(e, P, 2, 's3-dummy', 0); e.debugDamage(P, so, d.uid, 10, {}, []); ok(!all(P[2]).some(c=> c.vulnerable > 0), '2. 💀 Rend: no killer (a plain wound), nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 's3-enfDeath', 0); const k = put(e, P, 2, 's3-big', 0); swing(e, P, k); ok(k.feeble === 1, '2. 💀 Enfeeble 1: its killer gets 1 Feeble'); }
{ const {e, P} = mk(); const l = put(e, P, 1, 's3-dummy', -1); put(e, P, 1, 's3-hardDeath', 0); const k = put(e, P, 2, 's3-big', 0); swing(e, P, k); ok(l.hardened === 1 && !(k.hardened > 0), '2. 💀 Harden 1: the ally beside it gets 1 Sturdy as it dies'); }
{ const {e, P} = mk(); const l = put(e, P, 1, 's3-dummy', -1); put(e, P, 1, 's3-embDeath', 0); const k = put(e, P, 2, 's3-big', 0); swing(e, P, k); ok(l.emboldened === 1, '2. 💀 Embolden 1: the ally beside it gets 1 Mighty'); }
{ const {e, P} = mk(); const l = put(e, P, 1, 's3-dummy', -1), r = put(e, P, 1, 's3-dummy', 1); put(e, P, 1, 's3-rendAround', 0); const k = put(e, P, 2, 's3-big', 0), side = put(e, P, 2, 's3-dummy', 1);
  const ev = swing(e, P, k); ok(l.vulnerable === 1 && r.vulnerable === 1 && k.vulnerable === 1 && !(side.vulnerable > 0) && ev.filter(fxOf('rend')).length === 3,
    `2. 💀 Rend (around), owner 11-27 11:22: its own neighbours and the enemy facing it get 1 Vulnerable (${l.vulnerable}, ${r.vulnerable}, ${k.vulnerable}, ${side.vulnerable || 0})`); }
// prices, the family's kinds, registry and texts
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), S = e=> T.budget({id:'x', attack:1, health:3, effects:e, rarity:'common', level:1});
  const want = {rend:4.3, enfeeble:2.1, harden:2, embolden:3.2, rendPlay:1, rendDeath:0.5, rendAround:-0.3, enfeeblePlay:0.8, enfeebleDeath:0.5, hardenPlay:1.2, hardenDeath:0.9, emboldenPlay:2.2, emboldenDeath:1.7};
  const bad = Object.keys(want).filter(k=> { const r = S({[k]: 1}); return r.missing.length || Math.abs(r.S - want[k]) > 0.005; });
  ok(!bad.length, '2. prices at N 1 (canonical/skill-costs.json): ' + Object.keys(want).map(k=> k + ' ' + S({[k]: 1}).S).join(', '));
  ok(S({rend:{v:2, when:'play'}}).S === S({rendPlay:2}).S && S({harden:{v:1, when:'death'}}).S === S({hardenDeath:1}).S, '2. the fused kind reads the same price');
  const SPL = require('../bramblewood-skillparams.js');
  ok(JSON.stringify(SPL.expand({rend:{v:1, when:'death', who:'around'}})) === '{"rendAround":1}' && JSON.stringify(SPL.fuse({emboldenPlay:2})) === '{"embolden":{"v":2,"when":"play"}}', '2. kinds "when" of each family (skill-params.json)');
  const D = J('canonical/skill-delivery.json').delivery, C = J('canonical/skill-counters.json');
  ok(['rendPlay', 'rendDeath', 'rendAround', 'enfeeblePlay', 'enfeebleDeath', 'hardenPlay', 'hardenDeath', 'emboldenPlay', 'emboldenDeath'].every(k=> D[k] === 'none' && (C.applies[k] || C.noCounter.includes(k))), '2. delivery none and classified counters for every form'); }
{ const TX = require('../bramblewood-texts.js').TEXT, pk = J('lang/de.json');
  const keys = ['ui.sk-rend-play', 'ui.sk-rend-death', 'ui.sk-rend-around', 'ui.sk-rend-around-codex', 'ui.sk-enfeeble-play', 'ui.sk-enfeeble-death', 'ui.sk-harden-play', 'ui.sk-harden-death', 'ui.sk-embolden-play', 'ui.sk-embolden-death'];
  ok(keys.every(k=> TX[k] && pk[TX[k]]), '2. the forms\' texts, translated (de)');
  ok(!/each round/.test(TX['ui.sk-harden']) && /hits/.test(TX['ui.sk-harden']) && /hits/.test(TX['ui.sk-embolden']) && /up to 3/.test(TX['ui.sk-rend-codex']), '2. Harden / Embolden read On Hit; the token rule in the Codex note');
  ok(/const S3B_FORMS = \{rendPlay:\['rend', '⬆️'\]/.test(app) && /case 'rend': return '💔'/.test(app) && /'vulnerable' \/\* SKILLS3-9 \*\/, 'feeble'/.test(app), '2. the app: form entries, the trigger chip icon, the badge clears when the tokens run out');
  const cards = J('canonical/cards.json'), pools = J('canonical/map-pools.json'), FORM_KEYS = ['rendPlay', 'rendDeath', 'rendAround', 'enfeeblePlay', 'enfeebleDeath', 'hardenPlay', 'hardenDeath', 'emboldenPlay', 'emboldenDeath'];
  const has = c=> [c.effects || {}].concat(Object.values(c.levelSkills || {})).some(o=> Object.keys(o).some(k=> FORM_KEYS.includes(k) || (['rend', 'enfeeble', 'harden', 'embolden'].includes(k) && o[k] && o[k].when)));
  ok(!cards.some(has), '2. no card carries a ⬆️ / 💀 form yet (SKILLS3-3 open; no list changes, owner 11-27 11:22)'); void pools; }

// ================= 3. Wet yes / no, water vs Burn, fire vs Wet, dry weather, the shock chain (SKILLS3-7) =================
{ const {e, P} = mk(); const t = put(e, P, 2, 's3-dummy', 0), src = put(e, P, 1, 's3-hit1', 0);
  e.damageCardFlat(t, 2, 'water', 's3-hit1', src.uid); ok(t.water === 1 && e.wetCountOf(t) === 1, '3. a water hit makes it Wet (yes / no)');
  e.damageCardFlat(t, 5, 'water', 's3-hit1', src.uid); ok(t.water === 1, '3. more water: still just Wet');
  e.damageCardFlat(t, 3, 'heat', 's3-hit1', src.uid); ok(t.water === 0 && !(t.burn > 0), '3. a fire hit on a Wet unit ends Wet and lights nothing');
  e.damageCardFlat(t, 1, 'heat', 's3-hit1', src.uid); ok(t.burn === 1, '3. on a dry unit the fire lights 1 Burn');
  e.damageCardFlat(t, 1, 'water', 's3-hit1', src.uid); ok(!(t.burn > 0) && t.water === 1, '3. water puts Burn out (and soaks)'); }
{ const {e, P} = mk(); const tide = put(e, P, 1, 's3-tide', 0), land = put(e, P, 1, 's3-dummy', 1); ok(tide.water === 1 && !(land.water > 0), '3. a Tide unit arrives Wet (it lives in the water); a land unit with no tide does not');
  tide.water = 0; e.roundStart(P, 2, so, {}, []); ok(tide.water === 1, '3. dried, a Tide unit is Wet again at the next round start');
  land.water = 1; [3, 4, 5].forEach(r=> e.roundStart(P, r, so, {}, [])); ok(land.water === 1, '3. Wet stays (no round drain): it ends only with fire or dry weather'); }
{ const {e, P} = mk(1, {rules:{sandstorm:true}}); const land = put(e, P, 1, 's3-dummy', 0), tide = put(e, P, 1, 's3-tide', 1); land.water = 1; const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(land.water === 0 && tide.water === 1 && ev.some(x=> x.type === 'statusFx' && x.kind === 'en20Dry' && x.drain), '3. a Sandstorm (dry weather) dries every unit at the round start; a Tide unit, in the water, is Wet again'); }
{ const {e, P} = mk(1, {rules:{ashy:true}}); const land = put(e, P, 1, 's3-dummy', 0); land.water = 1; e.roundStart(P, 2, so, {}, []); ok(land.water === 0, '3. Ashy ground dries too'); }
{ const {e, P} = mk(); const land = put(e, P, 1, 's3-dummy', 0), fly = put(e, P, 1, 's3-fly', 1); e.setField('rain', 3); e.roundStart(P, 2, so, {}, []);
  ok(land.water === 1 && fly.water === 1, '3. Rain makes every unit Wet, flyers too'); }
// the shock chain: +1 on the Wet unit hit, then 1 to every Wet unit linked to it (a dry unit breaks it), its side only, no chain from the chain
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-shock2', 0), mine = put(e, P, 1, 's3-dummy', 1);
  const t = put(e, P, 2, 's3-dummy', 0), w1 = put(e, P, 2, 's3-dummy', 1), w2 = put(e, P, 2, 's3-dummy', 2), dry = put(e, P, 2, 's3-dummy', -1), past = put(e, P, 2, 's3-dummy', -2);
  [t, w1, w2, past, mine].forEach(c=> c.water = 1);
  const ev = swing(e, P, a);
  ok(500 - t.hp === 3, `3. a shock hit on a Wet unit deals 1 more (2 + 1 = ${500 - t.hp})`);
  ok(500 - w1.hp === 1 && 500 - w2.hp === 1, `3. 1 shock to every Wet unit linked to it, each once, no +1 (${500 - w1.hp}, ${500 - w2.hp})`);
  ok(dry.hp === 500 && past.hp === 500, '3. a dry unit breaks the chain (the Wet one past it is not hit)');
  ok(mine.hp === 500, '3. only on the target\'s side');
  const wc = ev.find(x=> x.type === 'statusFx' && x.kind === 'wetChain'); ok(wc && wc.fromUid === t.uid && wc.uids.length === 2 && wc.dmgs.join() === '1,1', '3. one wetChain event for the board ({fromUid, uids, dmgs})'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-shock2', 0), t = put(e, P, 2, 's3-dummy', 0), w = put(e, P, 2, 's3-dummy', 1); w.water = 1; swing(e, P, a);
  ok(500 - t.hp === 2 && w.hp === 500, '3. a dry target: no +1 and no chain'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-fire1', 0), t = put(e, P, 2, 's3-dummy', 0); t.water = 1; swing(e, P, a); ok(t.water === 0 && !(t.burn > 0) && t.hp === 499, '3. a fire swing on a Wet unit: the damage lands, Wet ends, no Burn'); }
{ const ENG = rd('bramblewood-engine.js'), TX = require('../bramblewood-texts.js').TEXT, pk = J('lang/fr.json');
  ok(!/en20WaterDrain/.test(ENG) && !/waterMax/.test(ENG), '3. the round drain and the counters are gone');
  ok(/class="abadge en20-water"[^`]*>💧<\/span>/.test(app) && !/💧\$\{c\.water\}/.test(app), '3. the board shows Wet as a 💧 badge, no number (SKILLS3b display rule)');
  ok(/ev\.kind === 'wetChain'\)\{/.test(app) && /ev\.kind === 'wetChain'\) return \{cls:'', text:TX\('ui\.s3b-log-wet-chain'/.test(app), '3. the board plays and logs the chain');
  ok(['ui.eng20-water-tip', 'ui.st-wet', 'ui.stx-wet', 'ui.fxx-thunderstorm', 'ui.ui32-log-soak', 'ui.ui32-log-dry', 'ui.ui32-log-drain', 'ui.sk-water-bolt-codex', 'ui.s3b-log-wet-chain'].every(k=> TX[k] && pk[TX[k].replace(/^[⚡\s]+/, '')] && !/counter/.test(TX[k])), '3. Wet texts read yes / no, translated (fr)'); }

// ================= 4. Dogfighter N (SKILLS3-4) and Attunement N – {element} (SKILLS3-11) =================
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-dog', 0), f = put(e, P, 2, 's3-fly', 0); swing(e, P, a); ok(f.hp === 497, `4. Dogfighter 1: its hit deals 1 more to a Flyer (2 + 1 = ${500 - f.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-dog', 0), g = put(e, P, 2, 's3-dummy', 0); swing(e, P, a); ok(g.hp === 498, `4. Dogfighter: nothing more against a ground unit (${500 - g.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 's3-dog', 0), m = put(e, P, 2, 's3-mach', 0); e.damageCardFlat(m, 2, 'physical', 's3-dog', a.uid); ok(m.hp === 497, `4. Dogfighter: a Mach unit counts too (a hit of 2: ${500 - m.hp})`); }
{ const {e, P} = mk(); const f = put(e, P, 2, 's3-fly', 0); put(e, P, 1, 's3-dogArrow', 0); const ev = fight(e, P, 1); ok(hitOn(ev, f.uid) === 3, `4. Dogfighter rides shots too (Arrow 1 + 2 = ${hitOn(ev, f.uid)})`); }
{ const {e, P} = mk(); put(e, P, 1, 's3-attShock', 1); const a = put(e, P, 1, 's3-shock2', 0), t = put(e, P, 2, 's3-dummy', 0); swing(e, P, a);
  ok(t.hp === 497, `4. Lightning Attunement 1 (Waiting): your lightning swing deals 1 more (2 + 1 = ${500 - t.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 's3-attShock', 1); const a = put(e, P, 1, 's3-hit2', 0), t = put(e, P, 2, 's3-dummy', 0); swing(e, P, a); ok(t.hp === 498, '4. not on another element (a physical swing)'); }
{ const {e, P} = mk(); put(e, P, 2, 's3-attShock', 1); const a = put(e, P, 1, 's3-shock2', 0), t = put(e, P, 2, 's3-dummy', 0); swing(e, P, a); ok(t.hp === 498, '4. not on the enemy\'s attacks (your units only)'); }
{ const {e, P} = mk(); put(e, P, 1, 's3-attFire', 1); const a = put(e, P, 1, 's3-fire1', 0), t = put(e, P, 2, 's3-dummy', 0); swing(e, P, a); ok(t.hp === 497 && t.burn === 1, `4. Attunement with no element is fire (Fire Attunement 2: 1 + 2 = ${500 - t.hp})`); }
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), S = e=> T.budget({id:'x', attack:1, health:3, effects:e, rarity:'common', level:1});
  ok(S({dogfighter:1}).S === 0.35 && S({dogfighter:2}).S === 0.7 && S({attunement:1}).S === 3.2 && S({attunement:{v:2, el:'shock'}}).S === 6.4 && !S({attunement:{v:1, el:'cold'}}).missing.length, `4. prices: Dogfighter 0.35 a point, Attunement 3.2 a point (as Fletcher)`);
  const D = J('canonical/skill-delivery.json'), C = J('canonical/skill-counters.json'), SP = J('canonical/skill-params.json');
  ok(D.delivery.dogfighter === 'none' && D.delivery.attunement === 'none' && D.rides.dogfighter === 'any' && C.counters.flying.counters.some(x=> x.skill === 'dogfighter') && SP.families.attunement.params.el === 'attunementEl', '4. delivery, rides, counters (a counter to Flying and Mach), the element parameter');
  const TX = require('../bramblewood-texts.js').TEXT, pk = J('lang/ja.json');
  ok(['ui.skn-dogfighter', 'ui.sk-dogfighter', 'ui.sk-dogfighter-codex', 'ui.skn-attunement', 'ui.sk-attunement-codex'].concat(['heat', 'cold', 'acid', 'water', 'shock'].flatMap(el=> ['ui.skn-attunement-' + el, 'ui.sk-attunement-' + el])).every(k=> TX[k] && pk[TX[k]]), '4. texts, translated (ja)');
  ok(/\{key:'dogfighter', category:'passive'/.test(app) && /\{key:'attunement', category:'passive', label:TX\('ui\.skn-attunement'\), kind:'selectNumber'/.test(app) && /p\.key==='attunement' \? s3bAttuneHead/.test(app), '4. the app: entries (Attunement picks its element), the "Fire Attunement 1" line');
  ok(!J('canonical/cards.json').some(c=> [c.effects || {}].concat(Object.values(c.levelSkills || {})).some(o=> o.dogfighter || o.attunement)), '4. no carrier yet (list changes wait, owner 11-27 11:22)'); }

// ================= 5. Warning Colours N (NEWCARDS2, owner 11-27 10:03) =================
{ const {e, P} = mk(); put(e, P, 1, 's3-wc', 0); const k = put(e, P, 2, 's3-big', 0), other = put(e, P, 2, 's3-dummy', 1); const ev = swing(e, P, k);
  ok(k.poison === 2 && ev.some(x=> x.type === 'statusFx' && x.kind === 'poisonous' && x.targetUid === k.uid && x.amount === 2), '5. 💀 Warning Colours 2: its killer gets 2 Poison');
  ok(k.wcWarned >= 1 && other.wcWarned >= 1 && ev.some(x=> x.type === 'statusFx' && x.kind === 'warningColours' && x.uids.length === 2), '5. every enemy unit on the board saw it die: warned'); }
{ const {e, P} = mk(); const d = put(e, P, 1, 's3-wc', 0); put(e, P, 2, 's3-dummy', 0); e.debugDamage(P, so, d.uid, 10, {}, []); ok(!all(P[2]).some(c=> c.poison > 0), '5. no killer (a plain wound): no Poison'); }
// a warned enemy passes over your other Warning Colours unit while another target is beside it; not when there is none
{ const {e, P} = mk(); put(e, P, 1, 's3-wc', 0); const wc2 = put(e, P, 1, 's3-wcTough', 1), plain = put(e, P, 1, 's3-dummy', 2); const k = put(e, P, 2, 's3-big', 0), w = put(e, P, 2, 's3-hit2', 1);
  swing(e, P, k); ok(w.wcWarned >= 1, '5. (the unit beside the killer saw it)');
  const ev = swing(e, P, w); ok(wc2.hp === 500 && plain.hp === 498 && ev.some(x=> x.type === 'statusFx' && x.kind === 'wcAvoid' && x.fromUid === wc2.uid && x.targetUid === plain.uid), `5. its swing passes over the other Warning Colours unit to the one beside it (${wc2.hp}, ${plain.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 's3-wc', 0); const wc2 = put(e, P, 1, 's3-wcTough', 1); const k = put(e, P, 2, 's3-big', 0), w = put(e, P, 2, 's3-hit2', 1);
  swing(e, P, k); swing(e, P, w); ok(wc2.hp === 498, '5. with no other target beside it, it still hits the Warning Colours unit'); }
{ const {e, P} = mk(); put(e, P, 1, 's3-wc', 0); const wc2 = put(e, P, 1, 's3-wcTough', 1), plain = put(e, P, 1, 's3-dummy', -1); const k = put(e, P, 2, 's3-big', 0), a = put(e, P, 2, 's3-arrowWarn', 1);
  swing(e, P, k); const ev = fight(e, P, 1); ok(!ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === wc2.uid) && ev.some(x=> x.type === 'statusFx' && x.kind === 'wcAvoid' && x.attUid === a.uid), '5. a warned shot goes to another unit'); void plain; }
{ const {e, P} = mk(); put(e, P, 1, 's3-wc', 0); const wc2 = put(e, P, 1, 's3-wcTough', 1), plain = put(e, P, 1, 's3-dummy', 2); const k = put(e, P, 2, 's3-big', 0), w = put(e, P, 2, 's3-hit2', 1);
  swing(e, P, k); [1, 2, 3].forEach(r=>{ e.roundStart(P, r, so, {}, []); }); const ev = swing(e, P, w); ok(wc2.hp === 498 && !ev.some(x=> x.kind === 'wcAvoid'), '5. the warning ends after the next round'); void plain; }
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), S = e=> T.budget({id:'x', attack:1, health:3, effects:e, rarity:'common', level:1});
  ok(S({warningColours:1}).S === 0.9 && S({warningColours:2}).S === 1.8, '5. priced 0.9 a point (Poisonous 0.8 + the warning)');
  const TX = require('../bramblewood-texts.js').TEXT, pk = J('lang/ko.json');
  ok(['ui.skn-warning-colours', 'ui.sk-warning-colours', 'ui.sk-warning-colours-codex', 'ui.s3b-log-wc', 'ui.s3b-log-wc-avoid'].every(k=> TX[k] && pk[TX[k].replace(/^⚠️\s*/, '')]), '5. texts, translated (ko)');
  ok(/\{key:'warningColours', category:'passive', label:`💀 \$\{TX\('ui\.skn-warning-colours'\)\}`/.test(app) && /ev\.kind === 'warningColours'\)\{/.test(app) && /ev\.kind === 'wcAvoid'\) return/.test(app), '5. the app: its entry (💀 Warning Colours), the board and the log');
  ok(J('canonical/skill-delivery.json').delivery.warningColours === 'none' && J('canonical/skill-counters.json').noCounter.includes('warningColours') && !J('canonical/cards.json').some(c=> (c.effects || {}).warningColours), '5. delivery, counters; no card yet (NEWCARDS2)'); }

// ================= determinism: the same seed replays the same fight with the new rules =================
{ const run = ()=>{ const {e, P} = mk(99); put(e, P, 1, 's3-shock2', 0); put(e, P, 1, 's3-rendAround', 1); put(e, P, 1, 's3-attShock', -1); ['s3-tide', 's3-tide', 's3-wc'].forEach((id, i)=> put(e, P, 2, id, i - 1)); put(e, P, 2, 's3-dog', 2);
    const out = []; for(let r = 1; r <= 4; r++){ e.roundStart(P, r, so, {}, out); e.resolveCombat(P, so, {}, out, r % 2 ? 1 : 2); } return JSON.stringify(out.map(x=> [x.type, x.kind, x.uid, x.targetUid, x.dmg])); };
  ok(run() === run(), 'determinism: two runs with one seed give the same events'); }

console.log(`skills3b-2026-11-27: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
