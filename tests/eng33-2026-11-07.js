#!/usr/bin/env node
// 2026-11-07 (package ENG33, owner 11-07 10:25 #6 / #9 / #10 / #12 / #13): Poison -> Venomous (counters Venom, the old Venomous retired),
// Poisonous N, Thanatosis (Undead stays for real undead), Bulwark N's Log Walls, Timbered's Stat bonus / Skills, the Smelly proposal.
// Engine scenarios, data and price pins, texts and translations, docs.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e33-wall': U('e33-wall', {}), 'e33-hit10': U('e33-hit10', {}, {attack:10}), 'e33-hit1': U('e33-hit1', {}, {attack:1}),
  'e33-venomous': U('e33-venomous', {poison:2}, {attack:1}), 'e33-oldven': U('e33-oldven', {venomous:3}, {attack:1}),
  'e33-armored': U('e33-armored', {armor:5}),
  'e33-than': U('e33-than', {thanatosis:true}, {attack:2, health:3}), 'e33-plain': U('e33-plain', {}, {attack:2, health:3}),
  'e33-onkill': U('e33-onkill', {triggers:[{on:'onKill', do:'gainLumber', amount:3}]}, {attack:10}),
  'e33-pois': U('e33-pois', {poisonous:2}, {attack:0, health:3}), 'e33-pois-true': U('e33-pois-true', {poisonous:true}, {attack:0, health:3}),
  'e33-eater': U('e33-eater', {devour:{attack:1, health:1}}, {attack:1, health:10}),
  'e33-undead': U('e33-undead', {undead:true}, {health:10}),
  'e33-bul1': U('e33-bul1', {bulwark:1}, {attack:1, health:10}), 'e33-bul2': U('e33-bul2', {bulwark:2}, {attack:1, health:10}), 'e33-bul3': U('e33-bul3', {bulwark:3}, {attack:1, health:10}),
  'e33-timb': U('e33-timb', {timbered:true, timberedGrant:{evasive:true}}, {attack:1, health:10}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open'});
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const swing = (e, P, c, ev)=>{ ev = ev || []; e.debugAttack(P, so, c.uid, {}, ev); e.removeDeadCards(P, so, {}, {}, ev); return ev; };
const onBoard = (P, pid, uid)=> all(P[pid]).some(x=> x.uid === uid);

// ---- #9 Venomous N (the poison key): its landed hits add N Venom; an old effects.venomous reads as Venomous N and needs damage through
{ const {e, P} = mk(); const a = put(e, P, 1, 'e33-venomous', 0), t = put(e, P, 2, 'e33-wall', 0); swing(e, P, a); ok(t.poison === 2, `Venomous 2: 2 Venom on the target (${t.poison})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e33-oldven', 0), t = put(e, P, 2, 'e33-wall', 0); swing(e, P, a); ok(t.poison === 3, `an old Venomous 3 reads as Venomous 3 (${t.poison})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e33-oldven', 0), t = put(e, P, 2, 'e33-armored', 0); swing(e, P, a); ok(!(t.poison > 0), `the old rule is gone: Armor that stops the hit stops the Venom (${t.poison || 0})`); }
{ const src = rd('bramblewood-engine.js'); ok(!/e\.venomous && resistFactor/.test(src), 'the old Venomous on-hit block is gone from w2OnHit'); }

// ---- #12 Thanatosis: the first fall is no death; it plays dead (can't act, single-target can't find it), gets up next round at 1; once
{ const {e, P} = mk(); const t = put(e, P, 2, 'e33-than', 0); const ev = []; e.debugDamage(P, so, t.uid, 5, {}, ev);
  ok(onBoard(P, 2, t.uid) && t.hp === 1 && t.playingDead != null && t.thanatosisUsed, `Thanatosis: on the board at 1 Health, playing dead (${t.hp}, ${t.playingDead})`);
  ok(!ev.some(x=> x.type === 'death'), 'no death event'); ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'thanatosis'), 'a thanatosis event');
  ok((P[2].graveyard || []).length === 0, 'nothing in the graveyard');
  const a = put(e, P, 1, 'e33-hit10', 0); const ev2 = swing(e, P, a); ok(t.hp === 1 && onBoard(P, 2, t.uid), `a swing can't find it while it plays dead (${t.hp})`);
  ok(ev2.some(x=> x.type === 'evaded' && x.reason === 'playingDead') || !ev2.some(x=> x.type === 'hit' && x.targetUid === t.uid), 'the swing misses it (playingDead) or passes it by');
  const tgt = put(e, P, 1, 'e33-wall', 1); void tgt; const ev3 = []; t.wait = 0; e.debugAttack(P, so, t.uid, {}, ev3);
  ok(!ev3.some(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === t.uid), 'it does not act while playing dead');
  a.wait = 9; /* the attacker sits this round out */ e.resolveCombat(P, so, {}, [], 2); ok(t.playingDead == null && t.hp === 1, `as the next round's combat starts it gets up at 1 Health (${t.playingDead}, ${t.hp})`);
  const ev4 = []; e.debugDamage(P, so, t.uid, 5, {}, ev4); ok(!onBoard(P, 2, t.uid) && ev4.some(x=> x.type === 'death'), 'at 0 again it dies for good (once a fight)'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e33-onkill', 0), t = put(e, P, 2, 'e33-than', 0); const lum = P[1].lumber || 0; const ev = swing(e, P, a);
  ok(onBoard(P, 2, t.uid) && (P[1].lumber || 0) === lum, `the attacker gets no kill: its On Kill does not fire (${(P[1].lumber || 0) - lum} Lumber)`); void ev; }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e33-than', 0); t.poison = 9; t.bleed = 4; e.debugDamage(P, so, t.uid, 5, {}, []);
  ok(t.hp === 1 && !(t.poison > 0) && !(t.bleed > 0), 'its statuses are cleared, so a tick cannot finish it'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e33-plain', 0); e.debugDamage(P, so, t.uid, 5, {}, []); ok(!onBoard(P, 2, t.uid), 'a unit without it dies as before'); }

// ---- #12 Undead stays for real undead and is the undead status: a heal hurts it
{ const {e, P} = mk(); const u = put(e, P, 2, 'e33-undead', 0); u.hp = 5; const ev = []; e.debugHeal(P, so, u.uid, 2, {}, ev);
  ok(u.hp === 3 && ev.some(x=> x.type === 'undeadHeal'), `the Undead skill gives the undead status: a heal of 2 hurts it (5 -> ${u.hp})`); }

// ---- #9 Poisonous N: its killer gets N Venom; a Devour unit that eats it gets N Venom; default 2
{ const {e, P} = mk(); const a = put(e, P, 1, 'e33-hit10', 0), t = put(e, P, 2, 'e33-pois', 0); const ev = swing(e, P, a);
  ok(!onBoard(P, 2, t.uid) && a.poison === 2, `Poisonous 2: its killer gets 2 Venom (${a.poison})`); ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'poisonous'), 'a poisonous event'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e33-hit10', 0); put(e, P, 2, 'e33-pois-true', 0); swing(e, P, a); ok(a.poison === 2, `plain Poisonous is 2 (${a.poison})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e33-pois', 0); e.debugDamage(P, so, t.uid, 5, {}, []); ok(!onBoard(P, 2, t.uid), 'a death with no killer gives no Venom (and nothing breaks)'); }
{ const {e, P} = mk(); const eater = put(e, P, 1, 'e33-eater', 0); const h = {uid: 9100, defId:'e33-pois'}; P[1].hand.push(h); P[1].hand.push({uid: 9101, defId:'e33-wall'});
  const okd = e.devour(P, so, 1, eater.uid, h.uid, {}, []); ok(okd && eater.poison === 2, `a Devour unit that eats a Poisonous card gets 2 Venom (${okd}, ${eater.poison})`); }
ok(E && typeof H.Engine.makeSimEngine === 'function', 'engine loads');

// ---- #10 Bulwark N: N Log Walls, 0/8 Structures with Guardian
for(const [id, n] of [['e33-bul1', 1], ['e33-bul2', 2], ['e33-bul3', 3]]){ const {e, P} = mk(); const h = {uid: 9200 + n, defId:id}; P[1].hand.push(h); P[1].lumber = 5;
  e.placeCard(P, so, 1, h.uid, 0, {}, []); const dd = c=> e.derivedDefs[c.defId] || defs[c.defId] || {}; const w = all(P[1]).filter(c=> dd(c).bulwarkWall); // the wall's def is shared once made
  ok(w.length === n && w.every(c=> c.hp === 4 && (c.atk | 0) === 0), `Bulwark ${n}: ${n} Log Wall(s), 0/4 (owner 22:13; was 0/8) (${w.map(c=> c.atk + '/' + c.hp).join(', ')})`);
  ok(w.length && dd(w[0]).archetypes.includes('Structure') && dd(w[0]).effects.guardian && dd(w[0]).name === 'Log Wall', 'a wall is a Structure with Guardian named Log Wall'); }

// ---- #6 Timbered – {skills}: the braces still work (the editor stores a stat bonus or skills in the same braces)
{ const {e, P} = mk(); const c = put(e, P, 1, 'e33-timb', 0); P[1].lumber = 3; e.syncPhaseStats(P, so, []); ok(!!e.effectsOf(c).evasive, 'Timbered – {Evasive} with 3 Lumber: Evasive');
  P[1].lumber = 1; e.syncPhaseStats(P, so, []); ok(!e.effectsOf(c).evasive, 'below 3 Lumber: no Evasive'); }
{ const app = rd('arena_app.js');
  ok(/timbered:'timberedGrant', bedrock:'bedrockGrant', forged:'forgedGrant', lastStand:'lastStandGrant'/.test(app), 'the editor offers Gives: Stat bonus / Skills for Timbered, Bedrock, Forged, Last Stand (ZEIT_TWIN)');
  ok(/const ENG33_STAT_FORM = \{timbered:\{dflt:\[0, 2\]\}, forged:\{dflt:\[1, 0\]\}, lastStand:\{dflt:\[1, 1\]\}, bedrock:\{armor:true, dflt:1\}\}/.test(app), 'the stat forms and their defaults');
  ok(/timbered:'🪵🪵', bedrock:'🪨🪨', forged:'🔩🔩'/.test(app), 'icons: two stacked logs (and two stones, two bolts)'); }

// ---- data: the cards moved, nothing else
{ const cards = J('canonical/cards.json'), by = {}; cards.forEach(c=> by[c.id] = c);
  ok(!cards.some(c=> c.effects && 'venomous' in c.effects), 'no card carries the old Venomous');
  for(const [id, n] of [['platypus-spur', 2], ['water-shrew', 1], ['giant-water-bug', 2], ['banded-sea-krait', 2]]) ok(by[id].effects.poison === n, `${id}: Venomous ${n} (key poison)`);
  for(const id of ['grass-snake', 'slow-worm', 'phoenix-mushrooms']) ok(by[id].effects.thanatosis === true && !by[id].effects.undead, `${id}: Thanatosis, no Undead`);
  for(const id of ['cinder-skeleton', 'ember-revenant']) ok(by[id].effects.undead === true, `${id}: real undead keep Undead`);
  ok(!cards.some(c=> c.effects && c.effects.poisonous), 'Poisonous is on no card'); }
{ const sk = J('canonical/skill-costs.json').skills, s = id=> sk.find(x=> x.id === id);
  ok(s('thanatosis') && s('thanatosis').scale === 'fixed' && s('thanatosis').value === 2, 'Thanatosis priced 2.0');
  ok(s('poisonous') && s('poisonous').scale === 'n' && s('poisonous').value === 0.8, 'Poisonous priced 0.8 a point');
  ok(s('bulwark').value === 3.5 && s('bulwark').pow === 1 && s('bulwark').eng33Was && s('bulwark').eng33Was.value === 5.96, 'Bulwark 3.5 a wall (was 5.96 x N^0.22)');
  ok(!!s('venomous').retired, 'the old Venomous is marked retired'); }

// ---- texts: no Poison counters left in the TX table; the new texts in all 12 packs
{ global.window = global; const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
  const KEEP = /Poison Barbs|Poison Bolt|Poison Gas|Poison Floor|Poison Dart|Deadly Poison|Greater Poison|poison bolt|poison gas/gi;
  const left = Object.keys(T).filter(k=> /\bpoison(ed|s)?\b/i.test(String(T[k]).replace(KEEP, '')));
  ok(!left.length, `no TX text calls the counters Poison (${left.join(', ')})`);
  ok(T['ui.eng33-venomous-name'] === 'Venomous' && /\{n\} Venom/.test(T['ui.eng33-venomous']), 'the skill reads Venomous N, its counters Venom');
  ok(T['ui.e10-skn-venom'] === 'Venom Spit', 'Poison Bolt\'s label is Venom Spit (Venom is the counters now)');
  ok(T['ui.en-bulwark-shield'] === 'Log Wall' && /\{n\} × Log Wall/.test(T['ui.sk-bulwark']), 'Bulwark texts: Log Wall');
  const NEWK = Object.keys(T).filter(k=> /^ui\.eng33-/.test(k)); ok(NEWK.length >= 18, `the new TX keys (${NEWK.length})`);
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const pk = J(`lang/${code}.json`);
    const miss = NEWK.concat(['ui.sk-bulwark', 'ui.e10-skn-venom', 'ui.sk-cure']).filter(k=> !pk[T[k]]); ok(!miss.length, `${code}: the ENG33 texts are translated (${miss.join(', ')})`); }
  ok(J('lang/fr.json')[T['ui.sk-cure']].includes('Venin'), 'French: Poison -> Venin'); }
{ const app = rd('arena_app.js');
  ok(/label:TX\('ui\.eng33-venomous-name'\)/.test(app) && /poison:'☠️ Venomous'/.test(app), 'the app: the skill label and the damage type read Venomous');
  ok(/thanatosis:'😵'/.test(app) && /key:'thanatosis'/.test(app) && /key:'poisonous'/.test(app), 'the app: Thanatosis and Poisonous in the editor, with icons'); }

// ---- docs
{ const art = rd('docs/art-style-prompts.md'), i = art.indexOf('### Log Wall'); const pr = art.slice(i, art.indexOf('\n', art.indexOf('> ', i)) + 1);
  ok(i > 0 && /background/.test(pr) && /a short wall of upright logs lashed with rope, mossy/.test(pr), 'the Log Wall art prompt, with a background');
  ok(!/no clothes|spiked|studded|monitor|sperm|corpse|sharpened|spear|sword|blade|arrow|axe|weapon/i.test(pr), 'no forbidden words in it'); }
{ const ps = rd('docs/project-state.md'); ok(/key stays `poison`/.test(ps) && /Thanatosis \(ENG33/.test(ps) && /Log Walls/.test(ps), 'project-state: the poison key mapping, Thanatosis, Log Walls'); }
{ const dec = J('docs/decisions.json'), list = dec.items || dec.decisions || dec, ids = list.filter(x=> /^ENG33-/.test(x.id));
  ok(ids.length >= 2 && ids.every(x=> (x.body || '').split(/\s+/).length < 100), `decisions ENG33-n, each under 100 words (${ids.map(x=> x.id)})`);
  ok(ids.some(x=> /Smelly/.test((x.title || '') + (x.body || ''))), 'the Smelly proposal is a decision'); }
ok(/ENG33/.test(rd('docs/CHANGELOG.md')), 'a CHANGELOG entry at the top'); // 2026-11-07 (ENG34 merge): later packages sit above, search the whole file
ok(/## 11-07: Package ENG33 \(on its branch, not released\)/.test(rd('docs/action-items.md')), 'the action-items section');
ok(/run node tests\/eng33-2026-11-07\.js/.test(rd('tests/run-all.sh')), 'listed in tests/run-all.sh');

console.log(`eng33: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
