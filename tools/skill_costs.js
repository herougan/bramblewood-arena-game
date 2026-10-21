#!/usr/bin/env node
// Skill costs (S) for the stat budget v3 — one implementation for the balance tools and the master hub (2026-10-18, owner
// 19:54: "Your bramble master hub should let me edit N values of all skills, triggers and actions. Triggers and actions are
// costed by How often x How strong. OnDeath is = 1. OnPlay(Ally) = 2.5, OnPlay(Any) = 5 for example. Then if the action is
// worth 2, the total cost is 5*2=10 - really expensive. Bounty is worth 0.5.").
// The numbers live in canonical/skill-costs.json; tools/card_balance.js and the hub's 🧮 Skill costs tab (build_hub.py inlines
// this file) both call SkillCosts.make(table). Node: require('./skill_costs.js'); browser: window.SkillCosts.
//   keyword skill   scale fixed: value; scale n: value × max(1, its number) (a payment saved as true counts payDefault);
//                   scale half: value × (1 + floor(N/2) for N > 1) — the old default rule for skills with no set cost.
//   trigger entry   {on, do, ...} in effects.triggers: trigger weight × action value. Weight: the trigger's value, × turnOfOne
//                   for an On Turn Start limited to one side's turns, at most onceCap with `once` (not for On Spawn / Death / Ready, which fire once anyway). Action value: Σ over the
//                   action's entries (damage, buff + buff.amount2, …) of value × its `per` field (missing: 1, or 0 when a sibling
//                   field is set), × min(8, targets), × subAll for sub 'all'. Exile on Self = Exile self.
//   shorthand       a keyword that is a trigger and an action: Bounty N = Bounty weight × Gain × N.
//                   `both` (2026-10-19): the number fills both fields (Kin Rally N = On Ally Played × Buff +N/+N).
//   CLI             node tools/skill_costs.js --diff [table.json]  cards whose S moved more than 2 from the 2026-10-18 model,
//                   and every card whose budget pass/fail flips.
// 2026-10-19 (package BF): N comes from bramblewood-budget.js (budget v5 since 13:52: "(Base + L/3) * (1 + L/30)", L/5 here), the one copy of the
// formula the game, these tools and the hub share; the hub inlines that file ahead of this one (window.BramblewoodBudget).
// 2026-10-19 (BF2, owner 15:25): Base's map term needs the map where each card becomes obtainable: canonical/card-obtain-maps.json
// (node tools/forge_curve_2026_10_19.js maps, from the game's cardObtainMap); the hub inlines it as SC_OBTAIN_MAPS. A card's own
// obtainMap field wins.
(function(root, factory){ if(typeof module === 'object' && module.exports){ let om = {}; try{ om = require('../canonical/card-obtain-maps.json').maps || {}; }catch(e){} module.exports = factory(require('../bramblewood-budget.js'), om); }
  else root.SkillCosts = factory(root.BramblewoodBudget, typeof SC_OBTAIN_MAPS !== 'undefined' ? SC_OBTAIN_MAPS : (root.SC_OBTAIN_MAPS || {})); })(typeof self !== 'undefined' ? self : this, function(BB, OBTAIN){
  'use strict';
  const LADDER = BB.LADDER;
  const r2 = v=> Math.round(v * 100) / 100;
  const ONE_SHOT = ['onSpawn', 'onDeath', 'onReady']; // 2026-10-19 (package TC): triggers that fire at most once anyway; `once` changes nothing
  const numOf = v=> typeof v === 'number' ? v : (Array.isArray(v) ? v.reduce((a, b)=> a + (+b || 0), 0) : 0);
  // The level the budget uses (card_balance.js since 2026-10-18): rewards 1, Base / Starter / tutorial / quest cards 0.
  function levelOf(d){ const k = d.source && d.source.kind, qs = k === 'quest' || k === 'errand' || k === 'base';
    return (d.faction || d.id === 'wandering-traveller') ? 1 : ((d.basic || d.rarity === 'starter' || d.tutorial || d.quest || qs) ? 0 : 1); }
  function rankOf(d){ return BB.rankOf(d && d.rarity); }
  const ritualPts = BB.ritualPts;

  function make(table){
    const by = kind=>{ const m = {}; (table[kind] || []).forEach(x=> m[x.id] = x); return m; };
    const SK = by('skills'), TR = by('triggers'), AC = by('actions'), MO = by('modifiers');
    const ALIAS = table.aliases || {}, SH = table.shorthands || {}, B = table.budget || {}, HALF = table.halfMiss || [];
    const mod = (id, d)=> MO[id] && typeof MO[id].value === 'number' ? MO[id].value : d;
    const actEntries = {}; (table.actions || []).forEach(a=>{ const base = a.id.split('.')[0]; (actEntries[base] = actEntries[base] || []).push(a); });
    function skillCost(id, v){
      const e = SK[id]; if(!e) return null;
      const n = numOf(v), val = +e.value || 0;
      if(e.scale === 'n') return val * Math.max(1, v === true && e.payDefault ? e.payDefault : n);
      if(e.scale === 'half') return val * (1 + (n > 1 ? Math.floor(n / 2) : 0));
      return val;
    }
    // One action's value for a trigger entry t (or a shorthand's number). Returns {value, missing}.
    function actionValue(t, card){
      let id = ALIAS[t.do] || t.do; if(id === 'exile' && (!t.who || t.who === 'self')) id = 'exileSelf';
      const list = actEntries[id]; if(!list) return {value:1, missing:'action:' + t.do};
      const fields = list.map(a=> a.per).filter(Boolean), has = f=> t[f] != null && t[f] !== '';
      let v = 0;
      list.forEach(a=>{ let x = 1;
        if(a.per){ const raw = t[a.per]; x = raw === 'attack' ? (card && card.attack || 0) : has(a.per) ? (+raw || 0) : (fields.some(f=> f !== a.per && has(f)) ? 0 : 1); }
        v += (+a.value || 0) * x; });
      if(t.who && t.who !== 'self' && t.sub !== 'all' && (t.targets | 0) > 1) v *= Math.min(8, t.targets | 0);
      if(t.sub === 'all') v *= mod('subAll', 2);
      return {value:v, missing:null};
    }
    function triggerWeight(t){
      const e = TR[t.on]; if(!e) return {w:1, missing:'trigger:' + t.on};
      let w = +e.value || 0;
      if(t.on === 'perTurn' && t.turnOf && t.turnOf !== 'both') w *= mod('turnOfOne', 0.5);
      // 2026-10-19 (package TC): onceCap is 0.66 since the measured worth was applied (below On Spawn's 1), so `once` on a trigger
      // that fires once anyway (On Spawn, On Death, On Ready) would have made the same card cheaper; it only caps repeating triggers.
      if(t.once && !ONE_SHOT.includes(t.on)) w = Math.min(w, mod('onceCap', 1));
      return {w, missing:null};
    }
    function triggerCost(t, card){ const a = triggerWeight(t), b = actionValue(t, card);
      return {cost:r2(a.w * b.value), weight:a.w, value:r2(b.value), missing:[a.missing, b.missing].filter(Boolean)}; }
    // S of a card's effects: {S, parts:[[kind, id, cost, detail]], missing:[ids with no entry]}.
    function cardS(effects, card){
      const parts = [], missing = []; let S = 0;
      Object.entries(effects || {}).forEach(([k, v])=>{
        if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=>{ if(!t) return; const c = triggerCost(t, card); missing.push(...c.missing); S += c.cost; parts.push(['trigger', t.on + ' → ' + t.do, c.cost, c.weight + ' × ' + c.value]); }); return; }
        // Context skills (2026-10-21, package CX2): CONTEXT_MULT (0.4) x the S of the skills in their braces, across all their phases
        // (bramblewood-budget.js contextS); the plain flag beside the braces (tide next to tideGrant ...) costs nothing then.
        if(BB.contextFlagCovered && BB.contextFlagCovered(k, effects)){ parts.push(['skill', k, 0, 'its braces carry the cost']); return; }
        { const cx = BB.contextS ? BB.contextS(k, v, inner=> cardS(inner, card).S) : null;
          if(cx){ S += cx.S; parts.push(['context', k, cx.S, cx.mult + ' × ' + cx.inner]); return; } }
        if(SH[k]){ const sh = SH[k], N = numOf(v) || 1, w = triggerWeight({on:sh.trigger}), a = actionValue(sh.both ? {do:sh.action, amount:N, amount2:N} : sh.field ? {do:sh.action, [sh.field]:N} : {do:sh.action, amount:N}, card) /* field (2026-10-19, SK1): Spoils is Health only */, c = r2(w.w * a.value); // both (2026-10-19, package GI): +N/+N, Kin Rally
          if(w.missing) missing.push(w.missing); if(a.missing) missing.push(a.missing); S += c; parts.push(['shorthand', k, c, w.w + ' × ' + r2(a.value)]); return; }
        let c = skillCost(k, v); if(c == null){ missing.push('skill:' + k); c = 1 + (numOf(v) > 1 ? Math.floor(numOf(v) / 2) : 0); }
        S += c; parts.push(['skill', k, c, '']);
      });
      return {S:r2(S), parts, missing};
    }
    const g = (k, d)=> B[k] == null ? d : B[k];
    // N at the level the card starts at (or `lv`): budget v5 (2026-10-19 13:52, BF2), N = (Base + L/5) x (1 + L/30), Level 0 Base - 1
    // (bramblewood-budget.js); B (the table's budget numbers) feeds Base. budgetV3N (Base + 2L) and budgetV4N ((Base - 1 + L)(1 + L/20))
    // are the old ones, for comparisons.
    const withMap = d=> d && d.obtainMap == null && OBTAIN && OBTAIN[d.id] != null ? Object.assign({}, d, {obtainMap: OBTAIN[d.id]}) : d;
    function budgetBase(d){ return BB.baseOf(withMap(d), B); }
    // 2026-10-21 (BF5): x the card's N multiplier (no abilities x plainBonus, only light ones x lightBonus, Fragile x fragileMult; the
    // parameters of other skills are the table's "a parameter of another skill" entries)
    const PARAMS = [...new Set((table.skills || []).filter(s=> /parameter of/.test((s.note || '') + ' ' + (s.measuredWhy || ''))).map(s=> s.id).concat(BB.PARAMS || []))];
    function budgetMult(d){ return BB.nMultOf ? BB.nMultOf((d && d.effects) || {}, B, PARAMS.length ? PARAMS : null) : 1; }
    function budgetN(d, lv){ return r2(BB.nAt(budgetBase(d), lv == null ? levelOf(d) : lv, B) * budgetMult(d)); }
    // v3 / v4 comparisons use the Base they had (no map term)
    function budgetV3N(d, lv){ return r2(BB.baseOf(d, Object.assign({}, B, {perMap: 0})) + g('perLevel', 2) * (lv == null ? levelOf(d) : lv)); }
    function budgetV4N(d, lv){ return BB.nV4(BB.baseOf(d, Object.assign({}, B, {perMap: 0})), lv == null ? levelOf(d) : lv); }
    function obtainMapOf(d){ const x = withMap(d); return +(x && x.obtainMap) || 0; }
    // The budget rules for a card as printed: {N, S, x1, x2, N2, ok, wellUnder, m, parts, missing}; opts.N stands in for N (v3 checks).
    function budget(d, opts){
      const e = d.effects || {}, N = opts && opts.N != null ? opts.N : budgetN(d, opts && opts.level), s = cardS(e, d); let m = 1; HALF.forEach(h=>{ if(e[h]) m *= g('missMult', 1.5); });
      // 2026-10-21 (package BX): an Archer never swings (Archer N: its arrow instead), so its Attack is not part of its strength
      const A = (e.archer && !(Number(e.archer) < 0)) ? 0 : (d.attack || 0), H = d.health || 0, x1 = r2((2 * A + H + s.S) * m), x2 = r2((BB.productScore ? BB.productScore(A, H, s.S) : A * H + s.S * Math.abs(s.S)) * m), N2 = r2((N / 3) * (N / 3));
      // 2026-10-19 (BF3, owner 16:22: "it's fine to be = to budget"): both rules inclusive, 2A+H+S <= N and A*H+S <= (N/3)^2
      // 2026-10-21 (BF6, owner 15:15: "for the cap-2, it should be AxH+SxS instead"): cap 2 is A*H + S*|S| <= (N/3)^2 (the helper's productScore)
      return {N, S:s.S, x1, x2, N2, ok: x1 <= N && x2 <= N2, wellUnder: x1 <= N && x2 <= N2 && x1 <= N * 0.6, m, parts:s.parts, missing:s.missing};
    }
    return {skillCost, actionValue, triggerWeight, triggerCost, cardS, budgetBase, budgetN, budgetMult, budgetV3N, budgetV4N, obtainMapOf, budget};
  }
  // Frozen copy of the 2026-10-18 model (SB_SKILLS in card_balance.js before this change; the Test Lab's SB_DEFAULT_SKILLS), for
  // comparisons only: every trigger list costs 1 in all, Bounty 0, a skill with no set cost 1 + floor(N/2).
  const LEGACY = {penance:'-v', bloodTithe:'-v', flying:0, evasive:0, swift:0, shadow:0, blind:0, bounty:0, quick:2, helmet:2, darksight:1, swimmer:1, diurnal:1, nocturnal:1, crepuscular:1, tide:1, molting:1, dynamite:0, leader:0, armor:'v', poison:'v', thorns:'v', heal:'v', regen:'v', rebuild:'v', creative:0, bleed:'v', snipe:'v', arrows:'v', crabClaws:0, relic:2}; // + Relic (2026-10-19, package E)
  const LEGACY_PAY = {penance:3, bloodTithe:2};
  function legacyS(effects){ let S = 0; Object.entries(effects || {}).forEach(([k, v])=>{ const rule = LEGACY[k], num = numOf(v);
    if(rule === 'v') S += Math.max(1, num); else if(rule === '-v') S -= Math.max(1, v === true ? (LEGACY_PAY[k] || 1) : num); else if(typeof rule === 'number') S += rule; else S += 1 + (num > 1 ? Math.floor(num / 2) : 0); });
    return S; }
  // The cards the balance tools measure (card_balance.js's fieldable list).
  const measured = c=> !c.token && !c.test && !c.hallOfFame && !c.baseId && !c.field;
  return {make, legacyS, levelOf, rankOf, ritualPts, measured, LADDER};
});

if(typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module){
  const fs = require('fs'), path = require('path'), SC = module.exports, ROOT = path.join(__dirname, '..');
  const args = process.argv.slice(2), file = args.find(a=> !a.startsWith('--')) || path.join(ROOT, 'canonical', 'skill-costs.json');
  const T = SC.make(JSON.parse(fs.readFileSync(file, 'utf8'))), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).filter(SC.measured);
  if(args.includes('--diff')){
    const rows = cards.map(c=>{ const b = T.budget(c), oldS = SC.legacyS(c.effects), r2 = v=> Math.round(v * 100) / 100;
      let m = 1; ['evasive','swift','flying','shadow','blind'].forEach(h=>{ if((c.effects || {})[h]) m *= 1.5; });
      const A = c.attack || 0, H = c.health || 0, oldOk = r2((2*A + H + oldS)*m) < b.N && r2((A*H + oldS)*m) < b.N2;
      return {id:c.id, name:c.name, oldS, S:b.S, d:r2(b.S - oldS), oldOk, ok:b.ok, missing:b.missing, parts:b.parts}; });
    const big = rows.filter(r=> Math.abs(r.d) > 2).sort((a, b)=> b.d - a.d), flip = rows.filter(r=> r.oldOk !== r.ok), miss = [...new Set(rows.flatMap(r=> r.missing))];
    console.log(`S moved more than 2 (${big.length}):`); big.forEach(r=> console.log(`  ${r.name} (${r.id}): ${r.oldS} -> ${r.S} (${r.d > 0 ? '+' : ''}${r.d})  ${r.parts.filter(p=> p[0] !== 'skill').map(p=> p[1] + ' ' + p[2] + ' [' + p[3] + ']').join('; ')}`));
    console.log(`Budget pass/fail flips (${flip.length}):`); flip.forEach(r=> console.log(`  ${r.name} (${r.id}): ${r.oldOk ? 'pass' : 'over'} -> ${r.ok ? 'pass' : 'over'} (S ${r.oldS} -> ${r.S})`));
    if(miss.length) console.log('No entry in the table:', miss.join(', '));
  } else console.log('usage: node tools/skill_costs.js --diff [table.json]');
}
