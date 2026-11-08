#!/usr/bin/env node
// 2026-11-08 (package ENG37; owner 09:27 #1, 10:52 #23-24): 1 the Reach rework (Flying 1 as an attacker; a swing with nothing opposite strikes an
// enemy in the lane beside it instead of the bramble), 2 the new Gannet Cliffs Reach card (Cormorant), 3 Armoured Shield (shield: {v, armor}),
// 4 Shell after attacking (shell: {v, when: 'afterAttack'}). Engine scenarios, prices, data, texts, editor rows, docs.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e37-reach': U('e37-reach', {reach:true}, {attack:3}), 'e37-plain': U('e37-plain', {}, {attack:3}), 'e37-stealth-reach': U('e37-stealth-reach', {reach:true, stealth:true}, {attack:3}),
  'e37-wall': U('e37-wall', {}), 'e37-wall5': U('e37-wall5', {}, {health:5}), 'e37-fly': U('e37-fly', {flying:true}), 'e37-mach': U('e37-mach', {mach:true}),
  'e37-taunt': U('e37-taunt', {taunt:true}), 'e37-hit3': U('e37-hit3', {}, {attack:3}), 'e37-flyhit': U('e37-flyhit', {flying:true}, {attack:3}),
  'e37-ashield': U('e37-ashield', {shield:{v:4, armor:1}}), 'e37-shield': U('e37-shield', {shield:4}),
  'e37-shell-after': U('e37-shell-after', {shell:{v:2, when:'afterAttack'}}, {attack:1}), 'e37-shell': U('e37-shell', {shell:2}, {attack:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, mode){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode: mode || 'open'});
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const swing = (e, P, c, ev)=>{ ev = ev || []; e.debugAttack(P, so, c.uid, {}, ev); return ev; };

// ================= 1. Reach =================
// its lane empty, a unit in the lane beside it: struck (not the bramble), and a reachAim event says so
{ const {e, P} = mk(); const a = put(e, P, 1, 'e37-reach', 0), t = put(e, P, 2, 'e37-wall', 1); const hq0 = P[2].hq.hp; const ev = swing(e, P, a);
  ok(t.hp === 47 && P[2].hq.hp === hq0, `Reach, its lane empty: it strikes the unit in the next lane (${50 - t.hp}), not the bramble (${hq0 - P[2].hq.hp})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'reachAim' && x.targetUid === t.uid), 'a reachAim event names the unit it struck'); }
// a plain unit in the same spot hits the bramble
{ const {e, P} = mk(); const a = put(e, P, 1, 'e37-plain', 0), t = put(e, P, 2, 'e37-wall', 1); const hq0 = P[2].hq.hp; swing(e, P, a);
  ok(t.hp === 50 && hq0 - P[2].hq.hp === 3, 'a plain unit there hits the bramble'); }
// a unit opposite: the normal target
{ const {e, P} = mk(); const a = put(e, P, 1, 'e37-reach', 0), o = put(e, P, 2, 'e37-wall', 0), s = put(e, P, 2, 'e37-wall5', 1); swing(e, P, a);
  ok(o.hp === 47 && s.hp === 5, 'with a unit opposite it strikes that unit, as before'); }
// two beside it: the one with less Health
{ const {e, P} = mk(); const a = put(e, P, 1, 'e37-reach', 0), l = put(e, P, 2, 'e37-wall', -1), r = put(e, P, 2, 'e37-wall5', 1); swing(e, P, a);
  ok(l.hp === 50 && r.hp === 2, `two beside it: it strikes the one with less Health (${l.hp}, ${r.hp})`); }
// a tie: a coin flip (both sides come up over seeds)
{ const seen = new Set(); for(let s = 1; s <= 30; s++){ const {e, P} = mk(100 + s); const a = put(e, P, 1, 'e37-reach', 0), l = put(e, P, 2, 'e37-wall', -1), r = put(e, P, 2, 'e37-wall', 1); swing(e, P, a); if(l.hp < 50) seen.add('L'); if(r.hp < 50) seen.add('R'); }
  ok(seen.size === 2, 'two beside it with the same Health: a coin flip (both sides struck over 30 seeds)'); }
// two lanes away: out of reach, the bramble
{ const {e, P} = mk(); const a = put(e, P, 1, 'e37-reach', 0), t = put(e, P, 2, 'e37-wall', 2); const hq0 = P[2].hq.hp; swing(e, P, a);
  ok(t.hp === 50 && hq0 - P[2].hq.hp === 3, 'a unit two lanes away is out of reach: the bramble'); }
// Taunt still draws it; Stealth still goes to the bramble
{ const {e, P} = mk(); const a = put(e, P, 1, 'e37-reach', 0), t = put(e, P, 2, 'e37-taunt', -1), w = put(e, P, 2, 'e37-wall5', 1); swing(e, P, a);
  ok(t.hp === 47 && w.hp === 5, 'a Taunt unit beside it still draws the swing'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e37-stealth-reach', 0), t = put(e, P, 2, 'e37-wall', 1); const hq0 = P[2].hq.hp; swing(e, P, a);
  ok(t.hp === 50 && hq0 - P[2].hq.hp === 3, 'Stealth + Reach: unblockable, the bramble'); }
// the row mode (ranks centred): an end unit with nothing in front strikes the enemy beside its line
{ const {e, P} = mk(7, 'row'); const r1 = put(e, P, 1, 'e37-reach', -1); put(e, P, 1, 'e37-wall', 0); put(e, P, 1, 'e37-wall', 1); const t = put(e, P, 2, 'e37-wall', 0);
  const hq0 = P[2].hq.hp; swing(e, P, r1); ok(t.hp === 47 && P[2].hq.hp === hq0, `row mode: 3 against 1, the end Reach unit strikes the one enemy (${50 - t.hp}, bramble ${hq0 - P[2].hq.hp})`); }
// Flyers never dodge it (straight or diagonal); a Mach unit 1 in 2 (Flying 1 against Flying 2)
{ let hitS = 0, hitD = 0, n = 120; for(let s = 1; s <= n; s++){ { const {e, P} = mk(200 + s); const a = put(e, P, 1, 'e37-reach', 0), t = put(e, P, 2, 'e37-fly', 0); swing(e, P, a); if(t.hp < 50) hitS++; }
    { const {e, P} = mk(400 + s); const a = put(e, P, 1, 'e37-reach', 0), t = put(e, P, 2, 'e37-fly', 1); swing(e, P, a); if(t.hp < 50) hitD++; } }
  ok(hitS === n && hitD === n, `a Flyer never dodges Reach (straight ${hitS}/${n}, beside ${hitD}/${n})`); }
{ let hit = 0, hitF = 0, hitP = 0, n = 300; for(let s = 1; s <= n; s++){ { const {e, P} = mk(600 + s); const a = put(e, P, 1, 'e37-reach', 0), t = put(e, P, 2, 'e37-mach', 0); swing(e, P, a); if(t.hp < 50) hit++; }
    { const {e, P} = mk(600 + s); const a = put(e, P, 1, 'e37-flyhit', 0), t = put(e, P, 2, 'e37-mach', 0); swing(e, P, a); if(t.hp < 50) hitF++; }
    { const {e, P} = mk(600 + s); const a = put(e, P, 1, 'e37-plain', 0), t = put(e, P, 2, 'e37-mach', 0); swing(e, P, a); if(t.hp < 50) hitP++; } }
  ok(hit / n > 0.4 && hit / n < 0.6 && Math.abs(hit - hitF) <= 0.1 * n, `a Mach unit dodges Reach 1 in 2, as a Flyer's swing (${(hit / n).toFixed(2)} vs ${(hitF / n).toFixed(2)})`);
  ok(hitP === 0, 'a plain ground swing never hits a Mach unit'); }
// a plain Flyer still dodges a plain ground swing (unchanged)
{ let hit = 0, n = 200; for(let s = 1; s <= n; s++){ const {e, P} = mk(900 + s); const a = put(e, P, 1, 'e37-plain', 0), t = put(e, P, 2, 'e37-fly', 0); swing(e, P, a); if(t.hp < 50) hit++; }
  ok(hit / n > 0.38 && hit / n < 0.62, `a plain swing still misses a Flyer 1 in 2 (${(hit / n).toFixed(2)})`); }
// the engine's fly meter as a target is unchanged (a Reach unit is a ground unit)
ok(E.makeSimEngine(defs, E.mulberry32(1), {}).flyLevelOf({reach:true}) === 0, 'as a target a Reach unit stays a ground unit (flyLevelOf 0)');

// ================= 3. Armoured Shield =================
{ const {e, P} = mk(); const t = put(e, P, 2, 'e37-ashield', 0), a = put(e, P, 1, 'e37-hit3', 0);
  ok(t.shield === 4, `Shield {v: 4, armor: 1} arrives with 4 Shield (${t.shield})`);
  swing(e, P, a); ok(t.shield === 2 && t.hp === 50, `while its Shield lasts it has +1 Armor: a 3 hit takes 2 Shield (${t.shield}, ${t.hp})`);
  swing(e, P, a); ok(t.shield === 0 && t.hp === 50, `the breaking hit still meets the Armor (${t.shield}, ${t.hp})`);
  swing(e, P, a); ok(t.hp === 47, `with the Shield gone the Armor is gone: 3 to Health (${50 - t.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e37-shield', 0), a = put(e, P, 1, 'e37-hit3', 0); swing(e, P, a); ok(t.shield === 1, `a plain Shield 4 is unchanged: a 3 hit takes 3 (${t.shield})`); }

// ================= 4. Shell after attacking =================
{ const {e, P} = mk(); const t = put(e, P, 2, 'e37-shell-after', 0), a = put(e, P, 1, 'e37-hit3', 0);
  swing(e, P, a); ok(t.hp === 47 && !(t.shellArmor > 0), `Shell (after attacking): a foe that strikes first meets no Armor (${50 - t.hp})`);
  const ev = swing(e, P, t); ok(t.shellArmor === 2 && ev.some(x=> x.type === 'statusFx' && x.kind === 'shellUp' && x.targetUid === t.uid), `after its own attack: +2 Armor (${t.shellArmor})`);
  swing(e, P, a); ok(t.hp === 46, `a hit after its attack is cut by 2 (${47 - t.hp})`);
  // the round's upkeep drops it
  all(P[1]).concat(all(P[2])).forEach(c=> c.wait = 9); e.resolveCombat(P, so, {}, [], 1); ok(!(t.shellArmor > 0) && t.shellUntil == null, 'the round ends: its Armor goes'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e37-shell', 0), a = put(e, P, 1, 'e37-hit3', 0);
  swing(e, P, t); ok(!(t.shellArmor > 0), 'a plain Shell is not raised by its own attack');
  swing(e, P, a); ok(t.hp === 47 && t.shellArmor === 2, `a plain Shell: the first hit raises it, as before (${50 - t.hp}, ${t.shellArmor})`);
  swing(e, P, a); ok(t.hp === 46, `a plain Shell: the next hit is cut by 2 (${47 - t.hp})`); }

// ================= prices =================
{ const table = J('canonical/skill-costs.json'), SC = require(path.join(ROOT, 'tools/skill_costs.js')).make(table), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
  const arm1 = SC.skillCost('armor', 1), sh4 = SC.cardS({shield:4}).S;
  ok(Math.abs(SC.cardS({shield:{v:4, armor:1}}).S - (sh4 + Math.round(arm1 * 0.5 * 100) / 100)) < 0.011, `Shield 4 + armor 1: Shield's price + Armor 1 x 0.5 (${SC.cardS({shield:{v:4, armor:1}}).S})`);
  ok(SC.cardS({shieldArmor:2}).S === 0, 'armor without a Shield costs nothing');
  { const plain = SC.cardS({shell:2}).S, after = SC.cardS({shell:{v:2, when:'afterAttack'}}).S, m = table.skills.find(s=> s.id === 'shellWhen').afterAttackMult;
    ok(m > 1 && Math.abs(after - (plain + Math.round(plain * m * 100) / 100)) < 0.011, `Shell (after attacking) costs Shell + ${m} x Shell (measured: ${plain} -> ${after})`);
    ok(SC.cardS({shell:{v:2, when:'firstHit'}}).S === plain && SC.cardS({shellWhen:'afterAttack'}).S === 0, 'the default "when" costs nothing; no Shell, nothing'); }
  ok(BB.skillCountOf({shield:{v:4, armor:1}, shell:{v:2, when:'afterAttack'}}) === 2, 'the parameters are not skills of their own (two-skill count)');
  ok(['shieldArmor', 'shellWhen'].every(k=> table.skills.some(s=> s.id === k && /parameter of/.test(s.note))), 'skill-costs.json lists both parameters'); }

// ================= data =================
{ const sp = J('canonical/skill-params.json'), SP = require(path.join(ROOT, 'bramblewood-skillparams.js'));
  ok(sp.families.shield && sp.families.shield.params.armor === 'shieldArmor' && sp.families.shell && sp.families.shell.params.when === 'shellWhen', 'skill-params.json: shield.armor and shell.when');
  const x = SP.expand({shield:{v:4, armor:1}, shell:{v:2, when:'afterAttack'}});
  ok(x.shield === 4 && x.shieldArmor === 1 && x.shell === 2 && x.shellWhen === 'afterAttack', 'the fused objects expand to the flat keys');
  ok(JSON.stringify(SP.fuse({shield:3, shieldArmor:2})) === JSON.stringify({shield:{v:3, armor:2}}), 'the flat keys fuse back');
  const sd = J('canonical/skill-delivery.json'); ok(/ENG37/.test(sd.notes.reach) && /ENG37/.test(sd.notes.shell) && /ENG37/.test(sd.notes.shield), 'skill-delivery.json notes: reach, shell, shield');
  ok(sd.swing.includes('reach') && sd.delivery.reach === 'ranged', 'Reach is still a ranged swing');
  const sc = J('canonical/skill-counters.json'); ok(sc.counters.flying.counters.some(c=> c.skill === 'reach' && /Flying 1/.test(c.why)), 'skill-counters: Reach answers Flying (Flying 1)');
  ok(sc.counters.shell.counters.some(c=> c.skill === 'quick'), 'skill-counters: Quick answers Shell (after attacking)'); }
// 2. the Cormorant
{ const cards = J('canonical/cards.json'), c = cards.find(x=> x.id === 'cormorant');
  ok(!!c, 'the Cormorant is in cards.json');
  if(c){ ok(c.effects.reach === true && Object.keys(c.effects).length === 1, 'Cormorant: Reach only');
    ok(['common', 'uncommon'].includes(c.rarity), 'Cormorant: Common / Uncommon');
    ok(cards.filter(x=> x.numericId === c.numericId).length === 1 && cards.filter(x=> x.uuid === c.uuid).length === 1, `Cormorant: a unique numericId (${c.numericId}) and uuid`);
    const SC = require(path.join(ROOT, 'tools/skill_costs.js')).make(J('canonical/skill-costs.json')), b = SC.budget(Object.assign({}, c, {obtainMap:3}), {level:1});
    ok(b.ok, `Cormorant fits the budget at Map 3 (2A + H + S ${b.x1} <= N ${b.N}; A·H ${b.x2} <= ${b.N2})`);
    ok(J('canonical/map-pools.json').maps.mc.cards.includes('cormorant'), 'on the Gannet Cliffs list (map-pools mc)');
    ok(J('canonical/card-obtain-maps.json').maps.cormorant === 3, 'obtainable from Map 3 (card-obtain-maps)');
    ok(!/spear|weapon|blade|spiked|studded|sword|knife|dagger/i.test(c.flavor || ''), 'the flavour names no weapon');
    const art = rd('docs/art-style-prompts.md'), i = art.indexOf('### Cormorant'), line = i >= 0 ? art.slice(i, art.indexOf('\n', art.indexOf('> ', i))) : '';
    ok(i >= 0 && /background/.test(line), 'an art prompt for the Cormorant, with a background');
    ok(!/spear|weapon|blade|spiked|studded|monitor|no clothes|corpse/i.test(line), 'the art prompt avoids the banned words');
    ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ ok(J(`lang/cards/${code}.json`)['Cormorant'], `lang/cards/${code}: Cormorant`); ok(J(`lang/ui/${code}.json`)[c.flavor], `lang/ui/${code}: the Cormorant's flavour`); }); } }
// texts
{ const tx = rd('bramblewood-texts.js'), keys = ['ui.sk-reach', 'ui.sk-reach-codex', 'ui.eng37-log-reach', 'ui.eng37-reach-fl', 'ui.skn-shield-armor', 'ui.sk-shield-armor', 'ui.sk-shield-armor-desc', 'ui.skn-shell-when', 'ui.sk-shell-after', 'ui.shell-when-hit', 'ui.shell-when-after', 'ui.sk-shell-when-desc'];
  keys.forEach(k=> ok(tx.includes(`"${k}":`), 'TX key ' + k));
  const en = k=> { const m = tx.match(new RegExp(`"${k.replace(/\./g, '\\.')}": "((?:[^"\\\\]|\\\\.)*)"`)); return m ? JSON.parse('"' + m[1] + '"') : null; };
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const L = J(`lang/${code}.json`); const miss = keys.filter(k=> k !== 'ui.eng37-reach-fl' && !L[en(k)]); ok(!miss.length, `lang/${code}.json has every ENG37 text (${miss.join(', ')})`); }); }
// the editor rows and the card lines
{ const app = rd('arena_app.js');
  ok(/key:'shieldArmor', category:'passive', label:TX\('ui\.skn-shield-armor'\), kind:'number'/.test(app), 'editor: a Shield armor number row');
  ok(/key:'shellWhen', category:'passive', label:TX\('ui\.skn-shell-when'\), kind:'select'/.test(app) && /value:'afterAttack'/.test(app), 'editor: a Shell "when" select row (after it attacks)');
  ok(/case 'reachAim': return \{cls:'', text: TX\('ui\.eng37-log-reach'/.test(app), 'the battle log reads a Reach strike'); }
// docs
{ ok(/ENG37/.test(rd('docs/CHANGELOG.md').slice(0, 6000)), 'CHANGELOG: an ENG37 entry at the top');
  const dj = J('docs/decisions.json'), list = Array.isArray(dj) ? dj : (dj.decisions || dj.items || []);
  ok(JSON.stringify(list).includes('ENG37-1'), 'decisions.json: ENG37 decisions'); }

console.log(`eng37: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
